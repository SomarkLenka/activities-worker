#!/usr/bin/env node

/**
 * Test script for batch PDF generation
 * Tests the hybrid single/batch approach with 10 activities
 *
 * NOTE: This test requires DEV_MODE=true in wrangler.toml to work
 * In dev mode, the verification URL is returned directly instead of being emailed
 *
 * Usage:
 *   node scripts/test-batch-pdf.js
 *   node scripts/test-batch-pdf.js --remote  (test against deployed worker)
 */

import crypto from 'crypto';

// Configuration
const TEST_EMAIL = 'lenkasomark@gmail.com';
const TEST_NAME = 'Test Batch User';
const PROPERTY_ID = 'cabin-12';  // Use actual property ID
const CHECKIN_DATE = new Date().toISOString().split('T')[0];

// 10 activities to test batch processing
const ACTIVITIES = [
  'archery',
  'kayaking',
  'rock-climbing',
  'zip-lining',
  'mountain-biking',
  'horseback-riding',
  'atv-riding',
  'fishing',
  'hiking',
  'swimming'
];

// Determine worker URL
const isRemote = process.argv.includes('--remote');
const WORKER_URL = isRemote
  ? 'https://activities.rtxsecured.com'
  : 'http://localhost:8787';

console.log(`\n🧪 Testing batch PDF generation with ${ACTIVITIES.length} activities`);
console.log(`📧 Email: ${TEST_EMAIL}`);
console.log(`🌍 Worker URL: ${WORKER_URL}`);
console.log(`⏱️  Starting test...\n`);

// Generate test signature (base64 PNG)
function generateTestSignature() {
  // Minimal 1x1 transparent PNG
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
    0x42, 0x60, 0x82
  ]);
  return `data:image/png;base64,${pngData.toString('base64')}`;
}

// Generate initials for all activities
function generateInitials() {
  const initials = {};
  ACTIVITIES.forEach(act => {
    initials[act] = 'TB';  // Test Batch
  });
  return initials;
}

async function testBatchPdfGeneration() {
  const startTime = Date.now();

  try {
    // Step 1: Submit initial form
    console.log('📝 Step 1: Submitting initial form...');
    const submitResponse = await fetch(`${WORKER_URL}/submit/initial`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: PROPERTY_ID,
        checkinDate: CHECKIN_DATE,
        guestName: TEST_NAME,
        guestEmail: TEST_EMAIL,
        activities: ACTIVITIES
      })
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      throw new Error(`Initial submit failed: ${submitResponse.status} - ${errorText}`);
    }

    const submitResult = await submitResponse.json();

    if (!submitResult.ok) {
      throw new Error(`Submit failed: ${submitResult.error || 'Unknown error'}`);
    }

    // In dev mode, we get verificationUrl directly. In production, check email.
    let verificationToken;
    if (submitResult.devMode && submitResult.verificationUrl) {
      const url = new URL(submitResult.verificationUrl);
      verificationToken = url.searchParams.get('token');
      console.log(`✅ Verification token received (dev mode): ${verificationToken.substring(0, 20)}...`);
    } else {
      console.log(`✅ Submission created: ${submitResult.submissionId}`);
      console.log(`📧 Verification email sent to ${TEST_EMAIL}`);
      console.log(`\n⚠️  This test requires DEV_MODE=true to continue automatically.`);
      console.log(`   Please check your email for the verification link, or enable DEV_MODE in wrangler.toml`);
      process.exit(0);
    }

    // Step 2: Complete submission with signature and initials
    console.log('\n📝 Step 2: Completing submission with signature and initials...');
    const completeResponse = await fetch(`${WORKER_URL}/submit/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verificationToken,
        signature: generateTestSignature(),
        initials: generateInitials(),
        activities: ACTIVITIES
      })
    });

    if (!completeResponse.ok) {
      const errorText = await completeResponse.text();
      throw new Error(`Complete submit failed: ${completeResponse.status} - ${errorText}`);
    }

    const result = await completeResponse.json();
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n✅ SUCCESS! Batch PDF generation completed');
    console.log(`⏱️  Total time: ${duration} seconds`);
    console.log(`📄 PDFs generated: ${result.pdfs?.length || 0}`);

    if (result.pdfs && result.pdfs.length > 0) {
      console.log('\n📋 Generated PDFs:');
      result.pdfs.forEach((pdf, index) => {
        console.log(`  ${index + 1}. ${pdf.activity} (${pdf.filename})`);
      });
    }

    console.log(`\n📧 Check email at ${TEST_EMAIL} for the waivers`);
    console.log(`🔍 Submission ID: ${result.submissionId || 'N/A'}`);

    return result;

  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.error('\n❌ TEST FAILED');
    console.error(`⏱️  Failed after ${duration} seconds`);
    console.error(`Error: ${error.message}`);

    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }

    process.exit(1);
  }
}

// Run the test
testBatchPdfGeneration();
