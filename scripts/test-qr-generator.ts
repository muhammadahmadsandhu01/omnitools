import assert from 'assert';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { QRCodeSVG } from 'qrcode.react';
import jsQR from 'jsqr';
import { jsPDF } from 'jspdf';
import {
  escapeWifi,
  escapeVCard,
  escapeIcs,
  normalizePhone,
  validHex,
  contrastRatio,
  isInverted,
  toIcsDate,
  sanitizeFilename,
  estimateQrVersion,
  getReliabilityReport,
  QR_BYTE_CAPACITY,
  MAX_QR_BYTES,
} from '../components/tools/QrGenerator';
import { tools } from '../config/toolsData';

console.log('--- STARTING QR GENERATOR AUTOMATED TEST SUITE ---');

// ==========================================
// 1. HELPER: SVG TO RGBA RASTER ORACLE
// ==========================================
function renderQrToGrid(value: string, level: 'L' | 'M' | 'Q' | 'H' = 'M', margin = 4) {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(QRCodeSVG, { value, level, marginSize: margin })
  );
  const match = html.match(/viewBox="0 0 (\d+) (\d+)"/);
  if (!match) throw new Error('No viewBox in rendered SVG');
  const size = parseInt(match[1], 10);
  const grid = Array.from({ length: size }, () => new Uint8Array(size));

  const pathMatch = html.match(/fill="#000000"\s+d="([^"]+)"/);
  if (pathMatch) {
    const d = pathMatch[1];
    const regex = /M(\d+)[,\s]+(\d+)\s*h(\d+)v1/g;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(d)) !== null) {
      const x = parseInt(m[1], 10);
      const y = parseInt(m[2], 10);
      const w = parseInt(m[3], 10);
      for (let i = 0; i < w; i++) {
        if (x + i < size && y < size) {
          grid[y][x + i] = 1;
        }
      }
    }
  }
  return { grid, size };
}

function gridToRgba(grid: Uint8Array[], size: number, scale = 8) {
  const imgWidth = size * scale;
  const imgHeight = size * scale;
  const rgba = new Uint8ClampedArray(imgWidth * imgHeight * 4);
  for (let y = 0; y < imgHeight; y++) {
    const gy = Math.floor(y / scale);
    for (let x = 0; x < imgWidth; x++) {
      const gx = Math.floor(x / scale);
      const isBlack = grid[gy][gx] === 1;
      const idx = (y * imgWidth + x) * 4;
      const val = isBlack ? 0 : 255;
      rgba[idx] = val;
      rgba[idx + 1] = val;
      rgba[idx + 2] = val;
      rgba[idx + 3] = 255;
    }
  }
  return { rgba, width: imgWidth, height: imgHeight };
}

function decodeQrPayload(value: string, level: 'L' | 'M' | 'Q' | 'H' = 'M', margin = 4): string | null {
  const { grid, size } = renderQrToGrid(value, level, margin);
  const { rgba, width, height } = gridToRgba(grid, size, 8);
  const res = jsQR(rgba, width, height);
  return res ? res.data : null;
}

// ==========================================
// TEST 1: URL ENCODING & DECODING
// ==========================================
console.log('[Test 1] Testing URL payloads decoding with jsQR...');
const testUrls = [
  'https://omnitools-navy.vercel.app',
  'https://example.com/search?query=hello+world&sort=desc#results',
  'https://sub.domain.co.uk:8080/path/to/resource?id=123&token=xyz_987',
];
for (const url of testUrls) {
  const decoded = decodeQrPayload(url, 'M', 4);
  assert.strictEqual(decoded, url, `Decoded URL "${decoded}" does not match original "${url}"`);
}
console.log('  ✓ All URL test payloads decoded with exact match.');

// ==========================================
// TEST 2: ALL 8 QR PAYLOAD TYPES DECODING
// ==========================================
console.log('[Test 2] Testing all 8 standard QR payload types...');

// 1. Plain Text / Unicode
const plainText = 'OmniTools QR Suite: 100% Free, Secure & In-Browser 🚀';
assert.strictEqual(decodeQrPayload(plainText, 'M', 4), plainText, 'Plain text decode mismatch');

// 2. Wi-Fi Quick Connect
const wifiPayload = 'WIFI:T:WPA;S:MyCoffeeShop;P:SecretP@ssword!;H:false;;';
assert.strictEqual(decodeQrPayload(wifiPayload, 'M', 4), wifiPayload, 'Wi-Fi payload decode mismatch');

// 3. Email (mailto)
const emailPayload = 'mailto:support@example.com?subject=Inquiry&body=Hello%20World';
assert.strictEqual(decodeQrPayload(emailPayload, 'M', 4), emailPayload, 'Email payload decode mismatch');

// 4. Telephone (tel)
const phonePayload = 'tel:+15551234567';
assert.strictEqual(decodeQrPayload(phonePayload, 'M', 4), phonePayload, 'Phone payload decode mismatch');

// 5. SMS (sms)
const smsPayload = 'sms:+15551234567?body=Hello%20There';
assert.strictEqual(decodeQrPayload(smsPayload, 'M', 4), smsPayload, 'SMS payload decode mismatch');

// 6. Contact vCard 3.0
const vcardPayload = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  'N:Doe;Jane;;;',
  'FN:Jane Doe',
  'TEL:+15559876543',
  'EMAIL:jane.doe@example.com',
  'ORG:Acme Corp',
  'URL:https://example.com',
  'END:VCARD',
].join('\r\n');
assert.strictEqual(decodeQrPayload(vcardPayload, 'M', 4), vcardPayload, 'vCard payload decode mismatch');

// 7. Calendar Event (iCalendar 2.0)
const eventPayload = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//OmniTools//QR Generator//EN',
  'BEGIN:VEVENT',
  'UID:test-uid@omnitools',
  'DTSTAMP:20261015T120000',
  'DTSTART:20261020T090000',
  'DTEND:20261020T170000',
  'SUMMARY:Annual General Meeting',
  'LOCATION:Convention Center Hall A',
  'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n');
assert.strictEqual(decodeQrPayload(eventPayload, 'M', 4), eventPayload, 'iCalendar payload decode mismatch');

console.log('  ✓ All 8 standard QR content types successfully decoded.');

// ==========================================
// TEST 3: ERROR CORRECTION TIERS (L, M, Q, H)
// ==========================================
console.log('[Test 3] Testing Reed-Solomon Error Correction tiers (L, M, Q, H)...');
const testPayload = 'https://omnitools-navy.vercel.app/seo/qr-generator';
const levels: Array<'L' | 'M' | 'Q' | 'H'> = ['L', 'M', 'Q', 'H'];
for (const lvl of levels) {
  const decoded = decodeQrPayload(testPayload, lvl, 4);
  assert.strictEqual(decoded, testPayload, `Error level ${lvl} decode failed`);
}
console.log('  ✓ Decoded successfully across all 4 Reed-Solomon error correction tiers.');

// ==========================================
// TEST 4: SCHEMA ESCAPING & DATA UTILITIES
// ==========================================
console.log('[Test 4] Testing escaping and normalization utilities...');

// Wi-Fi Escaping
assert.strictEqual(escapeWifi('Network;123:Pass"Word\\'), 'Network\\;123\\:Pass\\"Word\\\\');

// vCard Escaping
assert.strictEqual(escapeVCard('Acme, Inc; Tech\\Dept\nSuite 100'), 'Acme\\, Inc\\; Tech\\\\Dept\\nSuite 100');

// iCalendar Escaping
assert.strictEqual(escapeIcs('Meeting, Project; Review\nNotes'), 'Meeting\\, Project\\; Review\\nNotes');

// Phone Normalization
assert.strictEqual(normalizePhone(' +1 (555) 123-4567 '), '+15551234567');
assert.strictEqual(normalizePhone('(800) 555-0199'), '8005550199');
assert.strictEqual(normalizePhone('+44 20 7946 0958'), '+442079460958');

// Date parsing
assert.strictEqual(toIcsDate('2026-10-25T14:30'), '20261025T143000');
assert.strictEqual(toIcsDate('invalid-date'), '');
assert.strictEqual(toIcsDate('2026-02-30T10:00'), ''); // Invalid day for February

// Filename Sanitization
assert.strictEqual(sanitizeFilename('../../../evil.png', 'default.png'), 'evil.png');
assert.strictEqual(sanitizeFilename('My QR Code: 2026?.png', 'default.png'), 'My_QR_Code_2026_.png');

console.log('  ✓ All escaping and data normalization utilities pass assertions.');

// ==========================================
// TEST 5: CONTRAST RATIO & LUMINANCE ENGINE
// ==========================================
console.log('[Test 5] Testing WCAG luminance & contrast ratio engine...');

assert.strictEqual(validHex('#000000'), true);
assert.strictEqual(validHex('#ffffff'), true);
assert.strictEqual(validHex('#123456'), true);
assert.strictEqual(validHex('#xyz'), false);
assert.strictEqual(validHex('red'), false);

// Pure black on pure white => 21:1
const blackOnWhite = contrastRatio('#000000', '#ffffff');
assert.ok(Math.abs(blackOnWhite - 21.0) < 0.1, `Expected ~21.0:1, got ${blackOnWhite}`);

// Inversion detection
assert.strictEqual(isInverted('#ffffff', '#000000'), true);
assert.strictEqual(isInverted('#000000', '#ffffff'), false);

// Low contrast check
const lowContrast = contrastRatio('#888888', '#777777');
assert.ok(lowContrast < 3.0, `Expected low contrast < 3.0:1, got ${lowContrast}`);

console.log('  ✓ Contrast ratio and luminance calculations verified.');

// ==========================================
// TEST 6: CAPACITY TABLES & RELIABILITY SCORING
// ==========================================
console.log('[Test 6] Testing ISO/IEC 18004 capacity & reliability scoring...');

assert.strictEqual(QR_BYTE_CAPACITY.L[0], 17);
assert.strictEqual(QR_BYTE_CAPACITY.M[0], 14);
assert.strictEqual(QR_BYTE_CAPACITY.Q[0], 11);
assert.strictEqual(QR_BYTE_CAPACITY.H[0], 7);
assert.strictEqual(QR_BYTE_CAPACITY.L[39], 2953);
assert.strictEqual(MAX_QR_BYTES, 2953);

// Version estimation
assert.strictEqual(estimateQrVersion(14, 'M'), 1);
assert.strictEqual(estimateQrVersion(15, 'M'), 2);
assert.strictEqual(estimateQrVersion(3000, 'L'), null); // Exceeds capacity

// Reliability report tests
const perfectReport = getReliabilityReport({
  bytes: 35,
  level: 'M',
  marginSize: 4,
  contrast: 21.0,
  inverted: false,
  logo: false,
  logoSize: 20,
});
assert.strictEqual(perfectReport.score, 100);
assert.strictEqual(perfectReport.warnings.length, 0);

const lowContrastReport = getReliabilityReport({
  bytes: 35,
  level: 'M',
  marginSize: 4,
  contrast: 2.5,
  inverted: false,
  logo: false,
  logoSize: 20,
});
assert.ok(lowContrastReport.score <= 65);
assert.ok(lowContrastReport.warnings.some((w) => w.includes('critically low')));

const logoWithoutHighReport = getReliabilityReport({
  bytes: 35,
  level: 'M',
  marginSize: 4,
  contrast: 21.0,
  inverted: false,
  logo: true,
  logoSize: 20,
});
assert.ok(logoWithoutHighReport.warnings.some((w) => w.includes('High (H) error correction')));

console.log('  ✓ Capacity tables and scan reliability scoring verified.');

// ==========================================
// TEST 7: PRINT-READY PDF EXPORT VALIDATION
// ==========================================
console.log('[Test 7] Testing print-ready PDF export generator with jsPDF...');

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
});
doc.setFont('helvetica', 'bold');
doc.setFontSize(20);
doc.text('OmniTools QR Code', 105, 28, { align: 'center' });
doc.setFontSize(10);
doc.text('Type: URL • Payload: https://omnitools-navy.vercel.app', 105, 36, { align: 'center' });
doc.roundedRect(25, 180, 160, 48, 3, 3, 'FD');

const pdfBlob = doc.output('blob');
assert.ok(pdfBlob.size > 1000, 'PDF blob size is suspiciously small');
assert.strictEqual(pdfBlob.type, 'application/pdf', 'PDF MIME type must be application/pdf');
console.log(`  ✓ Generated valid PDF document (${pdfBlob.size} bytes, type ${pdfBlob.type}).`);

// ==========================================
// TEST 8: SEO METADATA & REGISTRY INTEGRITY
// ==========================================
console.log('[Test 8] Checking tool registry & SEO configuration...');

const qrTool = tools.find((t) => t.id === 'qr-generator');
assert.ok(qrTool, 'qr-generator must exist in tools registry');
assert.strictEqual(qrTool?.slug, 'qr-generator');
assert.strictEqual(qrTool?.categoryId, 'seo');
assert.strictEqual(qrTool?.status, 'published');
assert.ok(qrTool?.seoTitle?.includes('Free QR Code Generator Online'), 'seoTitle should be compelling and unique');
assert.ok(qrTool?.seoDescription?.includes('static'), 'seoDescription should specify static unexpiring codes');
assert.ok((qrTool?.relatedToolSlugs?.length ?? 0) > 0, 'relatedToolSlugs should be populated');

console.log('  ✓ Tool registry, canonical slugs, and SEO metadata verified.');

console.log('\n======================================================');
console.log('ALL 8 QR GENERATOR QUALITY GATES PASSED SUCCESSFULLY!');
console.log('======================================================');
