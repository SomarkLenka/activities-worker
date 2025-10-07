function createPDF(content) {
  const objects = [];
  let objectId = 1;

  const catalog = {
    id: objectId++,
    content: `<< /Type /Catalog /Pages ${objectId} 0 R >>`
  };
  objects.push(catalog);

  const pages = {
    id: objectId++,
    content: `<< /Type /Pages /Kids [${objectId} 0 R] /Count 1 >>`
  };
  objects.push(pages);

  const fontId = objectId++;
  const contentStreamId = objectId++;
  let imageId = null;

  if (content.signatureImage) {
    imageId = objectId++;
  }

  const resourcesDict = imageId
    ? `<< /Font << /F1 ${fontId} 0 R >> /XObject << /Img1 ${imageId} 0 R >> >>`
    : `<< /Font << /F1 ${fontId} 0 R >> >>`;

  const page = {
    id: objectId++,
    content: `<< /Type /Page /Parent 2 0 R /Resources ${resourcesDict} /MediaBox [0 0 595 842] /Contents ${contentStreamId} 0 R >>`
  };
  objects.push(page);

  const font = {
    id: fontId,
    content: `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`
  };
  objects.push(font);

  if (imageId && content.signatureImage) {
    const imgData = content.signatureImage.data;
    const image = {
      id: imageId,
      content: `<< /Type /XObject /Subtype /Image /Width ${content.signatureImage.width} /Height ${content.signatureImage.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Length ${imgData.length} /Filter /ASCIIHexDecode >>\nstream\n${imgData}\nendstream`
    };
    objects.push(image);
  }

  const stream = generateContentStream(content, imageId);
  const contentStream = {
    id: contentStreamId,
    content: `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
  };
  objects.push(contentStream);

  return buildPDF(objects);
}

function generateContentStream(content, imageId) {
  const lines = [];
  lines.push('BT');
  lines.push('/F1 12 Tf');
  lines.push('50 800 Td');
  lines.push('1.5 TL');

  const text = content.title || 'Document';
  lines.push(`(${escapeString(text)}) Tj`);
  lines.push('0 -20 Td');

  if (content.details) {
    Object.entries(content.details).forEach(([key, value]) => {
      lines.push(`(${escapeString(key)}: ${escapeString(value)}) Tj`);
      lines.push('0 -15 Td');
    });
  }

  lines.push('0 -20 Td');

  if (content.body) {
    const bodyLines = wrapText(content.body, 75);
    bodyLines.forEach(line => {
      lines.push(`(${escapeString(line)}) Tj`);
      lines.push('0 -12 Td');
    });
  }

  lines.push('ET');

  if (imageId && content.signatureImage) {
    lines.push('q');
    lines.push(`200 0 0 75 50 100 cm`);
    lines.push('/Img1 Do');
    lines.push('Q');
  }

  return lines.join('\n');
}

function wrapText(text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length > maxWidth) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });

  if (currentLine) lines.push(currentLine.trim());
  return lines;
}

function escapeString(str) {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\n/g, ' ')
    .replace(/\r/g, '');
}

function buildPDF(objects) {
  const lines = [];
  lines.push('%PDF-1.4');
  lines.push('%µ¶');
  lines.push('');

  const xrefPositions = [0];

  objects.forEach(obj => {
    xrefPositions.push(lines.join('\n').length + 1);
    lines.push(`${obj.id} 0 obj`);
    lines.push(obj.content);
    lines.push('endobj');
    lines.push('');
  });

  const xrefStart = lines.join('\n').length;

  lines.push('xref');
  lines.push(`0 ${objects.length + 1}`);
  lines.push('0000000000 65535 f ');

  xrefPositions.slice(1).forEach(pos => {
    lines.push(String(pos).padStart(10, '0') + ' 00000 n ');
  });

  lines.push('');
  lines.push('trailer');
  lines.push(`<< /Size ${objects.length + 1} /Root 1 0 R >>`);
  lines.push('startxref');
  lines.push(String(xrefStart));
  lines.push('%%EOF');

  return lines.join('\n');
}

export function generateWaiverPDF(data) {
  const content = {
    title: `${data.activityLabel.toUpperCase()} - Release of Liability`,
    details: {
      'Property': data.propertyId,
      'Check-in': data.checkinDate,
      'Guest': data.guestName,
      'Initials': data.initials,
      'Risk Level': data.riskLevel.toUpperCase()
    },
    body: data.waiverText
  };

  const pdfString = createPDF(content);
  const encoder = new TextEncoder();
  return encoder.encode(pdfString);
}
