import puppeteer from 'puppeteer';
import QRCode from 'qrcode';

export const generateCertificatePDF = async (credential) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  try {
    const page = await browser.newPage();
    
    const qrCodeDataUrl = await QRCode.toDataURL(credential.validationUrl, {
      width: 200,
      margin: 1,
    });
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };
    
    let htmlContent = credential.course.template
      .replace(/{{STUDENT_NAME}}/g, credential.participant.fullName)
      .replace(/{{PARTICIPANT_NAME}}/g, credential.participant.fullName)
      .replace(/{{COURSE_TITLE}}/g, credential.course.title)
      .replace(/{{DURATION}}/g, credential.course.duration)
      .replace(/{{START_DATE}}/g, formatDate(credential.course.startDate))
      .replace(/{{END_DATE}}/g, formatDate(credential.course.endDate))
      .replace(/{{ISSUE_DATE}}/g, formatDate(credential.issueDate))
      .replace(/{{ORGANIZATION}}/g, credential.participant.organization)
      .replace(/{{CLASS_YEAR}}/g, credential.participant.classYear || '')
      .replace(/{{STREAM_MAJOR}}/g, credential.participant.streamMajor || '')
      .replace(/{{PARTICIPANT_ID}}/g, credential.participant.participantId)
      .replace(/{{CREDENTIAL_ID}}/g, credential.credentialId)
      .replace(/{{VALIDATION_URL}}/g, credential.validationUrl)
      .replace(/{{QR_CODE}}/g, qrCodeDataUrl);
    
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      },
    });
    
    return pdfBuffer;
  } finally {
    await browser.close();
  }
};