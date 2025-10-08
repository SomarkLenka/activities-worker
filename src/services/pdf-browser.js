import puppeteer from '@cloudflare/puppeteer';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function launchBrowserWithRetry(env, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Launching browser (attempt ${attempt}/${maxRetries})`);
      return await puppeteer.launch(env.BROWSER);
    } catch (error) {
      lastError = error;
      console.error(`Browser launch attempt ${attempt} failed:`, error.message);

      if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
        if (attempt < maxRetries) {
          const delay = initialDelay * Math.pow(2, attempt - 1);
          console.log(`Rate limit hit, waiting ${delay}ms before retry...`);
          await sleep(delay);
          continue;
        }
      }

      if (attempt === maxRetries) {
        throw new Error(`Failed to launch browser after ${maxRetries} attempts: ${error.message}`);
      }
    }
  }
  throw lastError;
}

export async function generatePDFWithPuppeteer(htmlContent, env) {
  let browser;
  try {
    browser = await launchBrowserWithRetry(env);
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      }
    });

    return pdf;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
}

export async function generateBatchPDFsWithPuppeteer(batchItems, env) {
  const maxConcurrency = 3;
  const pagesPerBrowser = 3;
  const rateLimitDelayMs = 20000; // 3 browsers per minute = 1 every 20 seconds

  console.log(`Batch processing ${batchItems.length} items with ${maxConcurrency} concurrent browsers, ${pagesPerBrowser} pages each`);

  const chunks = Array.from({ length: maxConcurrency }, () => []);
  batchItems.forEach((item, index) => {
    chunks[index % maxConcurrency].push(item);
  });

  const nonEmptyChunks = chunks.filter(chunk => chunk.length > 0);
  console.log(`Distributed ${batchItems.length} items across ${nonEmptyChunks.length} browsers: ${nonEmptyChunks.map(c => c.length).join(', ')} items each`);

  try {
    // Process all chunks in parallel with rate-limited browser launches
    const chunkPromises = nonEmptyChunks.map(async (chunk, chunkIndex) => {
      // Calculate delay to respect rate limit (3 browsers/minute)
      const launchDelay = chunkIndex * rateLimitDelayMs;

      if (launchDelay > 0) {
        console.log(`Browser ${chunkIndex + 1} scheduled to launch in ${launchDelay}ms`);
        await sleep(launchDelay);
      }

      console.log(`Browser ${chunkIndex + 1}/${nonEmptyChunks.length} launching to process ${chunk.length} items: ${chunk.map(c => c.id).join(', ')}`);

      let browser;
      try {
        browser = await launchBrowserWithRetry(env);

        // Process items in parallel batches within browser
        const itemPromises = [];
        for (let i = 0; i < chunk.length; i += pagesPerBrowser) {
          const pageBatch = chunk.slice(i, i + pagesPerBrowser);

          // Process this batch of pages in parallel
          const batchPromise = Promise.all(pageBatch.map(async (item) => {
            let page;
            try {
              page = await browser.newPage();
              await page.setContent(item.html, { waitUntil: 'networkidle0' });

              const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                  top: '1cm',
                  right: '1cm',
                  bottom: '1cm',
                  left: '1cm'
                }
              });

              console.log(`Successfully processed item ${item.id}`);
              return {
                id: item.id,
                success: true,
                pdf: Buffer.from(pdf).toString('base64')
              };
            } catch (itemError) {
              console.error(`Error processing item ${item.id}:`, itemError);
              return {
                id: item.id,
                success: false,
                error: itemError.message
              };
            } finally {
              if (page) {
                await page.close();
              }
            }
          }));

          itemPromises.push(batchPromise);
        }

        const batchResults = await Promise.all(itemPromises);
        const chunkResults = batchResults.flat();

        console.log(`Browser ${chunkIndex + 1} completed ${chunkResults.length} items`);
        return chunkResults;
      } finally {
        if (browser) {
          await browser.close();
          console.log(`Browser ${chunkIndex + 1} closed`);
        }
      }
    });

    // Wait for all chunks to complete
    const allChunkResults = await Promise.all(chunkPromises);
    const allResults = allChunkResults.flat();

    console.log(`Batch complete. Processed ${allResults.length} items`);
    return {
      results: allResults,
      total: allResults.length,
      successful: allResults.filter(r => r.success).length,
      failed: allResults.filter(r => !r.success).length
    };
  } catch (error) {
    console.error('Batch processing error:', error);
    throw error;
  }
}
