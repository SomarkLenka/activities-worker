import { generateWaiverPDF } from '../utils/pdf-builder.js';

export async function generatePDFNative(data, activityInfo, riskData, latestRelease, documentId, documentHash) {
  const riskLevel = activityInfo?.risk || 'medium';
  const activityLabel = activityInfo?.label || data.activity;
  const riskDescription = riskData?.description || '';

  let waiverText = latestRelease.waiver_text;
  if (riskDescription) {
    waiverText = `Risk Description: ${riskDescription}\n\n${waiverText}`;
  }

  waiverText += `\n\nSignature: ${data.signature ? 'Electronic signature on file' : 'No signature provided'}`;
  waiverText += `\n\nDocument ID: ${documentId}`;
  waiverText += `\nVerification Hash: ${documentHash.substring(0, 32)}...`;
  waiverText += `\nLegal Version ${latestRelease.version} (${latestRelease.release_date})`;

  let signatureImage = null;
  if (data.signature) {
    const base64Data = data.signature.split(',')[1];
    signatureImage = {
      data: base64Data,
      width: 400,
      height: 150
    };
  }

  const pdfData = {
    activityLabel,
    propertyId: data.propertyId,
    checkinDate: data.checkinDate,
    guestName: data.guestName,
    initials: data.initials[data.activity],
    riskLevel,
    waiverText,
    signatureImage
  };

  return generateWaiverPDF(pdfData);
}
