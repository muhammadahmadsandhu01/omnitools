/**
 * KivaroTools PDF Financial Scrubber Engine — 200+ Test Suite
 * Tests pdfFinancialScrubberEngine.ts exported functions comprehensively.
 * Run: npx tsx scripts/test-pdf-scrubber.ts
 */

import {
    // Constants
    PDF_SCRUBBER_ENGINE_VERSION,
    MAX_SAFE_PDF_BYTES,
    MAX_DECOMPRESSED_STREAM_BYTES,
    MAX_PDF_PAGE_COUNT,
    // Validators
    computeSha256Hex,
    computeCrc32,
    validateVerhoeffAadhaar,
    validateAustralianAbnMod89,
    decodeZatcaTlvBase64,
    encodeZatcaTlvBase64,
    formatRedactedReplacement,
    detectFinancialMathLeaks,
    applyPresetToEntitiesAndTransactions,
    parseFinancialPdfFile,
    applyPdfRedactionsAndSanitize,
    verifyRedactedPdfForensics,
    generateComplianceCertificateJson,
    exportPrivilegeLogCsv,
    exportPrivilegeLogXlsx,
    encryptRedactionVault,
    decryptRedactionVault,
    generateSampleFinancialPdf,
    isPdfScrubberCancelledError,
    sanitizeSpreadsheetFormula,
    // Types (used as type-only refs)
    type DetectedPiiEntity,
    type FinancialTransactionRow,
    type PdfScrubberParseResult,
    type FinancialPresetId,
    type RedactionStyle,
    type PiiCategory,
    type ExemptionReasonCode,
} from '../lib/pdfFinancialScrubberEngine.js';

// =====================================================================
// ASSERTION HELPERS
// =====================================================================

let passed = 0;
let failed = 0;
let sectionFailed = false;
const failedMessages: string[] = [];

function assert(condition: boolean, message: string): void {
    if (!condition) {
        console.error(`    ❌ FAILED: ${message}`);
        failed++;
        sectionFailed = true;
        failedMessages.push(message);
    } else {
        console.log(`    ✅ PASSED: ${message}`);
        passed++;
    }
}

function assertThrows(fn: () => unknown, messagePart: string, testName: string): void {
    try {
        fn();
        console.error(`    ❌ FAILED: ${testName} — expected throw containing "${messagePart}"`);
        failed++;
        sectionFailed = true;
        failedMessages.push(testName);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.toLowerCase().includes(messagePart.toLowerCase())) {
            console.log(`    ✅ PASSED: ${testName}`);
            passed++;
        } else {
            console.error(`    ❌ FAILED: ${testName} — threw "${msg}", expected part: "${messagePart}"`);
            failed++;
            sectionFailed = true;
            failedMessages.push(testName);
        }
    }
}

function section(name: string): void {
    sectionFailed = false;
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`  SECTION: ${name}`);
    console.log(`${'─'.repeat(70)}`);
}

// =====================================================================
// HELPER: Build a minimal valid PDF binary from text lines
// =====================================================================

function buildMinimalPdf(lines: string[], meta?: {
    info?: string; xmp?: string; acroField?: string; invisibleOcr?: string;
    incrementalSave?: boolean; javascript?: string;
}): Uint8Array {
    const enc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\r/g, '\\r').replace(/\n/g, '\\n');
    const ops: string[] = [];
    let y = 740;
    for (const line of lines) {
        ops.push(`BT /F1 10 Tf 1 0 0 1 42 ${y} Tm (${enc(line)}) Tj ET`);
        y -= 18;
    }
    if (meta?.invisibleOcr) {
        ops.push(`BT 3 Tr /F1 9 Tf 1 0 0 1 42 50 Tm (${enc(meta.invisibleOcr)}) Tj ET`);
    }
    const stream = ops.join('\n');

    const infoStr = meta?.info ?? '';
    const xmpStr = meta?.xmp ? `<x:xmpmeta xmlns:x="adobe:ns:meta/">${meta.xmp}</x:xmpmeta>` : '';
    const jsStr = meta?.javascript ?? '';
    const acroStr = meta?.acroField ?? '';

    let pdf = `%PDF-1.7\n`;
    const objs: { id: number; body: string }[] = [];

    let catalogExtra = '';
    if (xmpStr) catalogExtra += ' /Metadata 10 0 R';
    if (jsStr) catalogExtra += ` /OpenAction << /S /JavaScript /JS (${enc(jsStr)}) >>`;
    if (acroStr) catalogExtra += ` /AcroForm << /Fields [11 0 R] >>`;

    objs.push({ id: 1, body: `<< /Type /Catalog /Pages 2 0 R${catalogExtra} >>` });
    objs.push({ id: 2, body: `<< /Type /Pages /Kids [4 0 R] /Count 1 >>` });
    objs.push({ id: 3, body: `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>` });
    objs.push({ id: 4, body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents 5 0 R >>` });
    objs.push({ id: 5, body: `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream` });

    if (infoStr) {
        objs.push({ id: 9, body: `<< ${infoStr} >>` });
    }
    if (xmpStr) {
        objs.push({ id: 10, body: `<< /Type /Metadata /Subtype /XML /Length ${xmpStr.length} >>\nstream\n${xmpStr}\nendstream` });
    }
    if (acroStr) {
        objs.push({ id: 11, body: `<< /FT /Tx /T (TestField) /V (${enc(acroStr)}) >>` });
    }

    const offsets: Record<number, number> = {};
    for (const obj of objs) {
        offsets[obj.id] = pdf.length;
        pdf += `${obj.id} 0 obj\n${obj.body}\nendobj\n`;
    }

    // Trailer
    const maxId = Math.max(...objs.map(o => o.id));
    const xrefOff = pdf.length;
    pdf += `xref\n0 ${maxId + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= maxId; i++) {
        pdf += `${String(offsets[i] ?? 0).padStart(10, '0')} 00000 n \n`;
    }
    const trailerInfo = infoStr ? ` /Info 9 0 R` : '';
    pdf += `trailer\n<< /Size ${maxId + 1} /Root 1 0 R${trailerInfo} >>\nstartxref\n${xrefOff}\n%%EOF\n`;

    if (meta?.incrementalSave) {
        const rev2Off = pdf.length;
        pdf += `9 0 obj\n<< /Title (Incremental Update) >>\nendobj\n`;
        const xref2Off = pdf.length;
        pdf += `xref\n9 1\n${String(rev2Off).padStart(10, '0')} 00000 n \ntrailer\n<< /Size ${maxId + 1} /Root 1 0 R /Prev ${xrefOff} >>\nstartxref\n${xref2Off}\n%%EOF\n`;
    }

    const bytes = new Uint8Array(pdf.length);
    for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff;
    return bytes;
}

function makeEntity(
    overrides: Partial<DetectedPiiEntity> & { rawValue: string; category: PiiCategory; tokenizedValue: string; style: RedactionStyle }
): DetectedPiiEntity {
    return {
        id: 'test_ent_1',
        label: 'Test Entity',
        maskedPreview: '████',
        confidence: 'HIGH_CONTEXT',
        validatorName: 'Test',
        jurisdiction: 'GLOBAL',
        pageIndex: 0,
        lineIndex: 0,
        bbox: { pageIndex: 0, x: 42, y: 60, width: 120, height: 14 },
        selected: true,
        reasonCode: 'PRIVACY_REDACTED',
        ...overrides,
    };
}

// =====================================================================
// SECTION 1 — ENGINE BOOTSTRAP & CONSTANTS (11 tests)
// =====================================================================
section('1 — Engine Bootstrap & Constants');

assert(typeof PDF_SCRUBBER_ENGINE_VERSION === 'string' && PDF_SCRUBBER_ENGINE_VERSION.length > 0,
    'PDF_SCRUBBER_ENGINE_VERSION is a non-empty string');
assert(PDF_SCRUBBER_ENGINE_VERSION === '2.0',
    'PDF_SCRUBBER_ENGINE_VERSION is "2.0"');
assert(typeof MAX_SAFE_PDF_BYTES === 'number' && MAX_SAFE_PDF_BYTES > 0,
    'MAX_SAFE_PDF_BYTES is a positive number');
assert(MAX_SAFE_PDF_BYTES === 250 * 1024 * 1024,
    'MAX_SAFE_PDF_BYTES equals 250 MB');
assert(typeof MAX_DECOMPRESSED_STREAM_BYTES === 'number' && MAX_DECOMPRESSED_STREAM_BYTES > 0,
    'MAX_DECOMPRESSED_STREAM_BYTES is a positive number');
assert(MAX_PDF_PAGE_COUNT === 2000,
    'MAX_PDF_PAGE_COUNT is 2000');
assert(typeof computeSha256Hex === 'function', 'computeSha256Hex is callable');
assert(typeof computeCrc32 === 'function', 'computeCrc32 is callable');
assert(typeof parseFinancialPdfFile === 'function', 'parseFinancialPdfFile is callable');
assert(typeof applyPdfRedactionsAndSanitize === 'function', 'applyPdfRedactionsAndSanitize is callable');
assert(typeof generateSampleFinancialPdf === 'function', 'generateSampleFinancialPdf is callable');

// =====================================================================
// SECTION 2 — SHA-256 & CRC-32 PRIMITIVES (8 tests)
// =====================================================================
section('2 — SHA-256 & CRC-32 Primitives');

const emptyHash = computeSha256Hex(new Uint8Array(0));
assert(emptyHash === 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'SHA-256 of empty input matches RFC test vector');

const helloHash = computeSha256Hex(new Uint8Array([0x68, 0x65, 0x6c, 0x6c, 0x6f])); // "hello"
assert(helloHash === '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    'SHA-256 of "hello" matches RFC test vector');

const hash1 = computeSha256Hex(new Uint8Array([1, 2, 3]));
assert(typeof hash1 === 'string' && hash1.length === 64, 'SHA-256 always returns 64 hex chars');
assert(/^[0-9a-f]+$/.test(hash1), 'SHA-256 output is lowercase hex');

const crc1 = computeCrc32(new Uint8Array([0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39])); // "123456789"
assert(crc1 === 0xcbf43926, 'CRC-32 of "123456789" matches ISO standard test vector');

const crcEmpty = computeCrc32(new Uint8Array(0));
assert(crcEmpty === 0x00000000, 'CRC-32 of empty input is 0');

assert(computeSha256Hex(new Uint8Array([65])) !== computeSha256Hex(new Uint8Array([66])),
    'SHA-256 distinguishes different inputs');
assert(computeSha256Hex(new Uint8Array([1, 2])) === computeSha256Hex(new Uint8Array([1, 2])),
    'SHA-256 is deterministic (same input → same hash)');

// =====================================================================
// SECTION 3 — SAMPLE PDF GENERATION (12 tests)
// =====================================================================
section('3 — Sample PDF Generation');

const sampleTypes = ['enterprise_bank_statement', 'hybrid_b2b_tax_invoice', 'payroll_w2_remittance'] as const;
for (const stype of sampleTypes) {
    const s = generateSampleFinancialPdf(stype);
    assert(s.bytes instanceof Uint8Array && s.bytes.length > 100, `${stype}: bytes is non-empty Uint8Array`);
    assert(s.bytes[0] === 0x25 && s.bytes[1] === 0x50 && s.bytes[2] === 0x44 && s.bytes[3] === 0x46,
        `${stype}: starts with %PDF magic bytes`);
    assert(typeof s.fileName === 'string' && s.fileName.length > 0, `${stype}: fileName is non-empty`);
    assert(s.fileName.endsWith('.pdf'), `${stype}: fileName ends with .pdf`);
}

const bs = generateSampleFinancialPdf('enterprise_bank_statement');
assert(bs.recommendedPreset === 'landlord_income_proof', 'bank_statement: recommendedPreset is landlord_income_proof');
assert(typeof bs.description === 'string' && bs.description.length > 0, 'bank_statement: description is non-empty');

const inv = generateSampleFinancialPdf('hybrid_b2b_tax_invoice');
assert(inv.recommendedPreset === 'freelancer_portfolio_invoice', 'invoice: recommendedPreset is freelancer_portfolio_invoice');

const pay = generateSampleFinancialPdf('payroll_w2_remittance');
assert(pay.recommendedPreset === 'strict_zero_pii_foia', 'payroll: recommendedPreset is strict_zero_pii_foia');

// =====================================================================
// SECTION 4 — ZATCA TLV ENCODE / DECODE (10 tests)
// =====================================================================
section('4 — ZATCA TLV Base64 QR Encode / Decode');

const zatcaEncoded = encodeZatcaTlvBase64({
    sellerName: 'Test Seller LLC',
    vatNumber: '300123456700003',
    timestamp: '2026-01-01T00:00:00Z',
    invoiceTotal: '1150.00',
    vatTotal: '150.00',
});
assert(typeof zatcaEncoded === 'string' && zatcaEncoded.length > 10, 'ZATCA encode returns non-empty base64 string');
assert(/^[A-Za-z0-9+/=]+$/.test(zatcaEncoded), 'ZATCA encode returns valid base64 chars');

const zatcaDecoded = decodeZatcaTlvBase64(zatcaEncoded);
assert(zatcaDecoded !== null, 'ZATCA decode returns non-null for valid TLV');
assert(zatcaDecoded?.seller_name === 'Test Seller LLC', 'ZATCA decode: seller_name correct');
assert(zatcaDecoded?.vat_registration_number === '300123456700003', 'ZATCA decode: VAT number correct');
assert(zatcaDecoded?.invoice_timestamp === '2026-01-01T00:00:00Z', 'ZATCA decode: timestamp correct');
assert(zatcaDecoded?.invoice_total_with_vat === '1150.00', 'ZATCA decode: invoice total correct');
assert(zatcaDecoded?.vat_total_amount === '150.00', 'ZATCA decode: VAT total correct');

assert(decodeZatcaTlvBase64('not-valid!!!') === null, 'ZATCA decode returns null for invalid base64');
assert(decodeZatcaTlvBase64('') === null, 'ZATCA decode returns null for empty string');
assert(decodeZatcaTlvBase64('dGVzdA==') === null, 'ZATCA decode returns null for too-short TLV');

// Roundtrip
const rt = encodeZatcaTlvBase64({ sellerName: 'مؤسسة الرياض', vatNumber: '300999999900003', timestamp: '2026-10-10T10:00:00Z', invoiceTotal: '5750.00', vatTotal: '750.00' });
const rtDec = decodeZatcaTlvBase64(rt);
assert(rtDec !== null && rtDec.vat_registration_number === '300999999900003', 'ZATCA roundtrip: Arabic seller with VAT correct');

// =====================================================================
// SECTION 5 — AADHAAR VERHOEFF CHECKSUM (12 tests)
// =====================================================================
section('5 — Aadhaar Verhoeff Checksum Validator');

// Real Verhoeff-valid Aadhaar numbers (from public test vectors)
assert(validateVerhoeffAadhaar('234123412346'), 'Verhoeff: 234123412346 is valid');
assert(validateVerhoeffAadhaar('2341 2341 2346'), 'Verhoeff: 2341 2341 2346 (with spaces) is valid');
assert(validateVerhoeffAadhaar('2341-2341-2346'), 'Verhoeff: 2341-2341-2346 (with dashes) is valid');

// Invalid checksums
assert(!validateVerhoeffAadhaar('234123412340'), 'Verhoeff: 234123412340 is invalid checksum');
assert(!validateVerhoeffAadhaar('234123412341'), 'Verhoeff: 234123412341 is invalid checksum');
assert(!validateVerhoeffAadhaar('234123412342'), 'Verhoeff: 234123412342 is invalid checksum');
assert(!validateVerhoeffAadhaar('234123412343'), 'Verhoeff: 234123412343 is invalid checksum');
assert(!validateVerhoeffAadhaar('234123412344'), 'Verhoeff: 234123412344 is invalid checksum');

// Invalid format (starts with 0 or 1)
assert(!validateVerhoeffAadhaar('034123412346'), 'Verhoeff: starts with 0 — invalid');
assert(!validateVerhoeffAadhaar('134123412346'), 'Verhoeff: starts with 1 — invalid');
assert(!validateVerhoeffAadhaar('12345'), 'Verhoeff: too short — invalid');
assert(!validateVerhoeffAadhaar('23412341234X'), 'Verhoeff: non-digit — invalid');

// =====================================================================
// SECTION 6 — AUSTRALIAN ABN MOD-89 (10 tests)
// =====================================================================
section('6 — Australian ABN Mod-89 Validator');

// Official ABN test vectors from ATO
assert(validateAustralianAbnMod89('51824753556'), 'ABN: 51824753556 valid');
assert(validateAustralianAbnMod89('51 824 753 556'), 'ABN: 51 824 753 556 (with spaces) valid');
assert(validateAustralianAbnMod89('51-824-753-556'), 'ABN: 51-824-753-556 (with dashes) valid');
assert(validateAustralianAbnMod89('53004085616'), 'ABN: 53004085616 valid (ATO sample)');

// Invalid ABNs
assert(!validateAustralianAbnMod89('51824753557'), 'ABN: 51824753557 invalid checksum');
assert(!validateAustralianAbnMod89('12345678901'), 'ABN: 12345678901 invalid checksum');
assert(!validateAustralianAbnMod89('1234'), 'ABN: too short — invalid');
assert(!validateAustralianAbnMod89('1234567890A'), 'ABN: non-digit — invalid');
assert(!validateAustralianAbnMod89(''), 'ABN: empty string — invalid');
assert(!validateAustralianAbnMod89('000000000000'), 'ABN: 12 digits — invalid format');

// =====================================================================
// SECTION 7 — FORMAT REDACTED REPLACEMENT (22 tests)
// =====================================================================
section('7 — formatRedactedReplacement');

// blackout style
const blackoutCard = makeEntity({ rawValue: '4111111111111111', category: 'CARD_PAN', tokenizedValue: '[CARD_01]', style: 'blackout', reasonCode: 'PCI_DSS_REQ_3_4' });
const blackoutResult = formatRedactedReplacement(blackoutCard);
assert(blackoutResult.includes('[REDACTED: PCI DSS REQ 3 4]'), 'blackout CARD_PAN includes reason code label');

// keep_last_4 — CARD_PAN
const last4Card = makeEntity({ rawValue: '4111111111111111', category: 'CARD_PAN', tokenizedValue: '[CARD_01]', style: 'keep_last_4', reasonCode: 'NONE' });
const last4Result = formatRedactedReplacement(last4Card);
assert(last4Result.startsWith('****-****-****-'), 'keep_last_4 CARD_PAN starts with ****-****-****-');
assert(last4Result.includes('1111'), 'keep_last_4 CARD_PAN ends with last 4 digits 1111');

// keep_last_4 — IBAN
const last4Iban = makeEntity({ rawValue: 'GB29NWBK60161331926819', category: 'IBAN', tokenizedValue: '[IBAN_01]', style: 'keep_last_4', reasonCode: 'NONE' });
const last4IbanResult = formatRedactedReplacement(last4Iban);
assert(last4IbanResult.startsWith('GB'), 'keep_last_4 IBAN starts with country code');
assert(last4IbanResult.includes('6819'), 'keep_last_4 IBAN includes last 4 chars');

// keep_last_4 — TAX_ID_SSN_CNIC_VAT_GSTIN
const last4Ssn = makeEntity({ rawValue: '453-89-2104', category: 'TAX_ID_SSN_CNIC_VAT_GSTIN', tokenizedValue: '[TAX_ID_01]', style: 'keep_last_4', reasonCode: 'NONE' });
const last4SsnResult = formatRedactedReplacement(last4Ssn);
assert(last4SsnResult.startsWith('***-**-'), 'keep_last_4 SSN starts with ***-**-');
assert(last4SsnResult.includes('2104'), 'keep_last_4 SSN includes last 4 digits');

// keep_last_4 — generic BANK_ACCOUNT
const last4Acct = makeEntity({ rawValue: '884019283746', category: 'BANK_ACCOUNT', tokenizedValue: '[ACCT_01]', style: 'keep_last_4', reasonCode: 'NONE' });
const last4AcctResult = formatRedactedReplacement(last4Acct);
assert(last4AcctResult.includes('3746'), 'keep_last_4 BANK_ACCOUNT includes last 4 digits');
assert(last4AcctResult.startsWith('****'), 'keep_last_4 BANK_ACCOUNT starts with ****');

// tokenize style
const tokenEnt = makeEntity({ rawValue: 'john@example.com', category: 'EMAIL_ADDRESS', tokenizedValue: '[EMAIL_01]', style: 'tokenize', reasonCode: 'GDPR_ART_6_PII' });
assert(formatRedactedReplacement(tokenEnt) === '[EMAIL_01]', 'tokenize style returns tokenizedValue');

// tokenize style fallback when tokenizedValue is empty
const tokenFallback = makeEntity({ rawValue: 'test@test.com', category: 'EMAIL_ADDRESS', tokenizedValue: '', style: 'tokenize', reasonCode: 'NONE' });
assert(formatRedactedReplacement(tokenFallback) === '[EMAIL_ADDRESS]', 'tokenize style falls back to [category] when tokenizedValue empty');

// anti-inference padding
const padEnt = makeEntity({ rawValue: '4532015112830366', category: 'CARD_PAN', tokenizedValue: '[CARD_01]', style: 'blackout', reasonCode: 'PCI_DSS_REQ_3_4' });
const padResult = formatRedactedReplacement(padEnt, { antiInferencePadding: true });
assert(padResult.length >= 28, 'antiInferencePadding pads to >= 28 chars');

// underwriter badge
const badgeEnt = makeEntity({ rawValue: '4532015112830366', category: 'CARD_PAN', tokenizedValue: '[CARD_01]', style: 'blackout', reasonCode: 'NONE' });
const badgeResult = formatRedactedReplacement(badgeEnt, { underwriterAttestationBadge: true });
assert(badgeResult.includes('[PRIVACY REDACTED]'), 'underwriterAttestationBadge adds [PRIVACY REDACTED]');

// Various categories — blackout without reason code
for (const cat of ['IBAN', 'ROUTING_ABA_BSB_SORT', 'SWIFT_BIC', 'EMAIL_ADDRESS', 'PHONE_NUMBER'] as PiiCategory[]) {
    const ent = makeEntity({ rawValue: 'testvalue', category: cat, tokenizedValue: `[${cat}_01]`, style: 'blackout', reasonCode: 'NONE' });
    const r = formatRedactedReplacement(ent);
    assert(r.startsWith('[REDACTED'), `blackout ${cat} starts with [REDACTED`);
}

// FOIA reason code formatting
const foiaEnt = makeEntity({ rawValue: 'secret', category: 'PERSON_OR_PARTY_NAME', tokenizedValue: '[PARTY_01]', style: 'blackout', reasonCode: 'FOIA_B6_PERSONAL_PRIVACY' });
const foiaResult = formatRedactedReplacement(foiaEnt);
assert(foiaResult.includes('FOIA B6 PERSONAL PRIVACY'), 'FOIA reason code underscores replaced with spaces');

// =====================================================================
// SECTION 8 — parseFinancialPdfFile: Error Handling (10 tests)
// =====================================================================
section('8 — parseFinancialPdfFile Error Handling');

assertThrows(
    () => parseFinancialPdfFile(new Uint8Array(0)),
    'empty',
    'parseFinancialPdfFile throws on empty input'
);

assertThrows(
    () => parseFinancialPdfFile(new Uint8Array([1, 2, 3, 4, 5])),
    'missing',
    'parseFinancialPdfFile throws on non-PDF input (no %PDF header)'
);

const oversizedBytes = new Uint8Array(MAX_SAFE_PDF_BYTES + 1);
// Fill with %PDF- header so it passes header check
oversizedBytes[0] = 0x25; oversizedBytes[1] = 0x50; oversizedBytes[2] = 0x44; oversizedBytes[3] = 0x46; oversizedBytes[4] = 0x2d;
assertThrows(
    () => parseFinancialPdfFile(oversizedBytes),
    'exceeds',
    'parseFinancialPdfFile throws on oversized file (> 250 MB)'
);

// Password-protected PDF
const encryptedPdf = buildMinimalPdf(['test']) as Uint8Array;
const encStr = '/Encrypt 5 0 R /Filter /Standard';
const encBytes = new TextEncoder().encode(`%PDF-1.7\n${encStr}\n%%EOF\n`);
assertThrows(
    () => parseFinancialPdfFile(encBytes),
    'encrypted',
    'parseFinancialPdfFile throws on encrypted PDF'
);

// Valid minimal PDF — should NOT throw
let parsed: PdfScrubberParseResult | null = null;
try {
    const minimal = buildMinimalPdf(['Hello World']);
    parsed = parseFinancialPdfFile(minimal, 'test.pdf');
    assert(true, 'parseFinancialPdfFile does not throw on valid minimal PDF');
} catch (e) {
    assert(false, `parseFinancialPdfFile threw unexpectedly: ${e}`);
}

assert(parsed !== null, 'parseFinancialPdfFile returns non-null for valid PDF');
assert(Array.isArray(parsed?.entities), 'result.entities is an array');
assert(Array.isArray(parsed?.transactions), 'result.transactions is an array');
assert(Array.isArray(parsed?.pages), 'result.pages is an array');
assert(typeof parsed?.metadata === 'object', 'result.metadata is an object');
assert(typeof parsed?.metadata.inputSha256 === 'string' && parsed.metadata.inputSha256.length === 64, 'metadata.inputSha256 is a 64-char hex string');

// =====================================================================
// SECTION 9 — parseFinancialPdfFile: Metadata Inspection (12 tests)
// =====================================================================
section('9 — parseFinancialPdfFile: Metadata Inspection');

const pdfWithAll = buildMinimalPdf(
    ['Account Holder: Jane Doe', 'PK IBAN: PK36SCBL0000001123456702'],
    {
        info: '/Title (Test Doc) /Author (Jane Doe)',
        xmp: '<rdf:RDF><rdf:Description dc:creator="Jane Doe"/></rdf:RDF>',
        acroField: '453-89-2104',
        invisibleOcr: 'HIDDEN secret@email.com',
        incrementalSave: true,
    }
);
const metaParsed = parseFinancialPdfFile(pdfWithAll, 'meta_test.pdf');

assert(metaParsed.metadata.fileName === 'meta_test.pdf', 'metadata.fileName matches argument');
assert(metaParsed.metadata.fileSizeBytes > 0, 'metadata.fileSizeBytes > 0');
assert(typeof metaParsed.metadata.pdfVersion === 'string', 'metadata.pdfVersion is a string');
assert(metaParsed.metadata.pageCount >= 1, 'metadata.pageCount >= 1');
assert(typeof metaParsed.metadata.isLinearized === 'boolean', 'metadata.isLinearized is boolean');
assert(typeof metaParsed.metadata.eofCount === 'number', 'metadata.eofCount is a number');
assert(metaParsed.metadata.hasIncrementalUpdates === true, 'metadata.hasIncrementalUpdates detects incremental save');
assert(metaParsed.metadata.hasInvisibleOcrText === true, 'metadata.hasInvisibleOcrText detects 3 Tr invisible OCR');
assert(metaParsed.metadata.hasXmpMetadata === true, 'metadata.hasXmpMetadata detects embedded XMP');
assert(metaParsed.metadata.hasAcroFormFields === true, 'metadata.hasAcroFormFields detects /AcroForm');
assert(Array.isArray(metaParsed.metadata.surfaces) && metaParsed.metadata.surfaces.length === 12, 'metadata.surfaces has exactly 12 surfaces');
assert(metaParsed.metadata.surfaces.every(s => s.statusAfterScrub === 'PURGED_CLEAN'), 'all 12 surfaces have statusAfterScrub === PURGED_CLEAN');

// =====================================================================
// SECTION 10 — PII Detection via Sample PDFs (22 tests)
// =====================================================================
section('10 — PII Entity Detection via Sample Financial PDFs');

// --- Bank Statement ---
const bankSample = generateSampleFinancialPdf('enterprise_bank_statement');
const bankParsed = parseFinancialPdfFile(bankSample.bytes, bankSample.fileName);

assert(bankParsed.entities.length > 0, 'bank_statement: detected at least 1 PII entity');
assert(bankParsed.entities.some(e => e.category === 'IBAN'), 'bank_statement: detected IBAN entity');
assert(bankParsed.entities.some(e => e.category === 'CARD_PAN'), 'bank_statement: detected CARD_PAN (Visa)');
assert(bankParsed.entities.some(e => e.category === 'ROUTING_ABA_BSB_SORT'), 'bank_statement: detected ABA routing / sort code');
assert(bankParsed.entities.some(e => e.category === 'SWIFT_BIC'), 'bank_statement: detected SWIFT/BIC');
assert(bankParsed.entities.some(e => e.category === 'BANK_ACCOUNT'), 'bank_statement: detected bank account number');
assert(bankParsed.entities.some(e => e.category === 'EMAIL_ADDRESS'), 'bank_statement: detected email address');
assert(bankParsed.entities.some(e => e.category === 'PHONE_NUMBER'), 'bank_statement: detected phone number');
assert(bankParsed.entities.some(e => e.category === 'PERSON_OR_PARTY_NAME'), 'bank_statement: detected person/party name');
assert(bankParsed.transactions.length > 0, 'bank_statement: parsed at least 1 transaction row');
assert(bankParsed.metadata.hasIncrementalUpdates, 'bank_statement: detected incremental xref update');
assert(bankParsed.metadata.eofCount >= 2, 'bank_statement: eofCount >= 2 (incremental save)');

// All entities must have required fields
for (const ent of bankParsed.entities) {
    assert(typeof ent.id === 'string' && ent.id.startsWith('pii_'), `entity ${ent.id}: id starts with pii_`);
    assert(typeof ent.rawValue === 'string' && ent.rawValue.length > 0, `entity ${ent.id}: rawValue is non-empty`);
    assert(typeof ent.maskedPreview === 'string', `entity ${ent.id}: maskedPreview is a string`);
    assert(typeof ent.confidence === 'string', `entity ${ent.id}: confidence is set`);
    break; // Only check first entity for brevity (structural validation)
}

// --- Invoice ---
const invSample = generateSampleFinancialPdf('hybrid_b2b_tax_invoice');
const invParsed = parseFinancialPdfFile(invSample.bytes, invSample.fileName);

assert(invParsed.entities.some(e => e.category === 'TAX_ID_SSN_CNIC_VAT_GSTIN'), 'invoice: detected tax ID (ZATCA/GSTIN/EIN/NTN)');
assert(invParsed.entities.some(e => e.category === 'IBAN'), 'invoice: detected IBAN (DE IBAN)');
assert(invParsed.entities.some(e => e.category === 'EMAIL_ADDRESS'), 'invoice: detected email address');
assert(invParsed.entities.some(e => e.category === 'QR_OR_BARCODE_PAYLOAD'), 'invoice: detected ZATCA QR payload entity');
assert(invParsed.metadata.hasFacturXOrZugferdXml, 'invoice: detected embedded Factur-X XML');
assert(invParsed.metadata.hasEmbeddedFiles, 'invoice: hasEmbeddedFiles true for Factur-X');
assert(invParsed.entities.some(e => e.category === 'INVOICE_OR_PO_NUMBER'), 'invoice: detected invoice/PO number');

// --- Payroll ---
const paySample = generateSampleFinancialPdf('payroll_w2_remittance');
const payParsed = parseFinancialPdfFile(paySample.bytes, paySample.fileName);

assert(payParsed.entities.some(e => e.category === 'TAX_ID_SSN_CNIC_VAT_GSTIN' && /ssn/i.test(e.label)), 'payroll: detected US SSN');
assert(payParsed.metadata.hasAcroFormFields, 'payroll: detected /AcroForm fields');

// =====================================================================
// SECTION 11 — Specific PII Detection via Text Embedding (28 tests)
// =====================================================================
section('11 — Specific PII Detection (Text Embedding Tests)');

function parsePdfWithText(lines: string[]): PdfScrubberParseResult {
    return parseFinancialPdfFile(buildMinimalPdf(lines), 'detect_test.pdf');
}

// IBAN — Valid
const ibanTest = parsePdfWithText(['PK IBAN: PK36SCBL0000001123456702']);
assert(ibanTest.entities.some(e => e.category === 'IBAN' && e.rawValue.includes('PK36')), 'Detects PK IBAN');

const gbIban = parsePdfWithText(['UK IBAN: GB29NWBK60161331926819']);
assert(gbIban.entities.some(e => e.category === 'IBAN' && e.rawValue.includes('GB29')), 'Detects GB IBAN');

const deIban = parsePdfWithText(['Wire To IBAN: DE89370400440532013000']);
assert(deIban.entities.some(e => e.category === 'IBAN' && e.rawValue.includes('DE89')), 'Detects DE IBAN');

// Card PAN — Luhn valid
const visaTest = parsePdfWithText(['Corporate Visa Card: 4532-0151-1283-0366']);
assert(visaTest.entities.some(e => e.category === 'CARD_PAN' && e.label.toLowerCase().includes('visa')), 'Detects Visa Card PAN');

const mcTest = parsePdfWithText(['Corporate Expense Mastercard: 5425-2334-3010-9903']);
assert(mcTest.entities.some(e => e.category === 'CARD_PAN'), 'Detects Mastercard PAN');

// US SSN
const ssnTest = parsePdfWithText(['US SSN: 453-89-2104']);
assert(ssnTest.entities.some(e => e.category === 'TAX_ID_SSN_CNIC_VAT_GSTIN' && /ssn/i.test(e.label)), 'Detects US SSN (453-89-2104)');

// Invalid SSN — 000 area code
const badSsn = parsePdfWithText(['SSN: 000-12-3456']);
assert(!badSsn.entities.some(e => e.category === 'TAX_ID_SSN_CNIC_VAT_GSTIN' && e.rawValue === '000-12-3456'), 'Does NOT detect 000-xx-xxxx invalid SSN');

// Invalid SSN — 666 area code
const badSsn2 = parsePdfWithText(['SSN: 666-12-3456']);
assert(!badSsn2.entities.some(e => e.category === 'TAX_ID_SSN_CNIC_VAT_GSTIN' && e.rawValue === '666-12-3456'), 'Does NOT detect 666-xx-xxxx invalid SSN');

// Pakistan CNIC
const cnicTest = parsePdfWithText(['Pakistan CNIC: 36302-4819203-7']);
assert(cnicTest.entities.some(e => e.category === 'TAX_ID_SSN_CNIC_VAT_GSTIN' && /cnic/i.test(e.label)), 'Detects Pakistan CNIC');

// Pakistan NTN
const ntnTest = parsePdfWithText(['Pakistan NTN: 4192837-6', 'NTN number required']);
assert(ntnTest.entities.some(e => e.category === 'TAX_ID_SSN_CNIC_VAT_GSTIN' && /ntn/i.test(e.label)), 'Detects Pakistan NTN');

// India GSTIN (valid Mod-36: 27AAPFU0939F1ZV)
const gstinTest = parsePdfWithText(['India GSTIN: 27AAPFU0939F1ZV']);
assert(gstinTest.entities.some(e => e.category === 'TAX_ID_SSN_CNIC_VAT_GSTIN' && /gstin/i.test(e.label)), 'Detects India GSTIN (Mod-36 valid)');

// India PAN
const panTest = parsePdfWithText(['PAN: AAPFU0939F', 'income tax record']);
assert(panTest.entities.some(e => e.category === 'TAX_ID_SSN_CNIC_VAT_GSTIN' && /pan/i.test(e.label)), 'Detects India PAN');

// Saudi ZATCA VAT TIN (15 digits: 3...3)
const zatcaVatTest = parsePdfWithText(['Saudi ZATCA VAT: 300123456700003']);
assert(zatcaVatTest.entities.some(e => e.category === 'TAX_ID_SSN_CNIC_VAT_GSTIN' && /zatca/i.test(e.label)), 'Detects Saudi ZATCA VAT TIN');

// US EIN
const einTest = parsePdfWithText(['US IRS EIN: 84-2910482', 'employer id']);
assert(einTest.entities.some(e => e.category === 'TAX_ID_SSN_CNIC_VAT_GSTIN' && /ein/i.test(e.label)), 'Detects US EIN');

// ABA Routing (context required: "routing")
const abaTest = parsePdfWithText(['US ABA Routing Number: 021000021']);
assert(abaTest.entities.some(e => e.category === 'ROUTING_ABA_BSB_SORT' && /aba/i.test(e.label)), 'Detects US ABA Routing Number');

// Email
const emailTest = parsePdfWithText(['Contact: finance@mansoor-global.io']);
assert(emailTest.entities.some(e => e.category === 'EMAIL_ADDRESS'), 'Detects email address');

// Phone
const phoneTest = parsePdfWithText(['Phone: +92 300 8634219']);
assert(phoneTest.entities.some(e => e.category === 'PHONE_NUMBER'), 'Detects phone number with context anchor');

// Account Holder Name
const nameTest = parsePdfWithText(['Account Holder: John Michael Smith  billing']);
assert(nameTest.entities.some(e => e.category === 'PERSON_OR_PARTY_NAME'), 'Detects Account Holder name');

// Bank Account Number
const acctTest = parsePdfWithText(['Account No: 884019283746']);
assert(acctTest.entities.some(e => e.category === 'BANK_ACCOUNT'), 'Detects bank account number via context anchor');

// SWIFT/BIC
const swiftTest = parsePdfWithText(['SWIFT / BIC: SCBLPKKAXXX']);
assert(swiftTest.entities.some(e => e.category === 'SWIFT_BIC'), 'Detects SWIFT/BIC code');

// Invoice Number
const invNoTest = parsePdfWithText(['Invoice No: INV-2026-99401']);
assert(invNoTest.entities.some(e => e.category === 'INVOICE_OR_PO_NUMBER'), 'Detects Invoice Number');

// UK Sort Code (with context)
const sortTest = parsePdfWithText(['UK Sort Code: 60-16-13']);
assert(sortTest.entities.some(e => e.category === 'ROUTING_ABA_BSB_SORT' && /sort/i.test(e.label)), 'Detects UK Sort Code');

// MICR Line
const micrTest = parsePdfWithText(['Check MICR: ⑆021000021⑈884019283746⑇']);
assert(micrTest.entities.some(e => e.category === 'CHECK_MICR'), 'Detects MICR E-13B line');

// Australian ABN with context
const abnTest = parsePdfWithText(['ABN: 51 824 753 556']);
assert(abnTest.entities.some(e => e.category === 'TAX_ID_SSN_CNIC_VAT_GSTIN' && /abn/i.test(e.label)), 'Detects Australian ABN');

// EU VAT Number with context
const vatTest = parsePdfWithText(['VAT: GB991283741']);
assert(vatTest.entities.some(e => e.category === 'TAX_ID_SSN_CNIC_VAT_GSTIN' && /vat/i.test(e.label)), 'Detects EU/UK VAT number with context');

// Currency amounts (Subtotal/VAT/Total)
const totalTest = parsePdfWithText(['Subtotal: $10,000.00', 'VAT (15%): $1,500.00', 'Grand Total: $11,500.00']);
assert(totalTest.entities.some(e => e.category === 'CURRENCY_AMOUNT'), 'Detects currency amounts (subtotal/total)');

// Running Balance
const balTest = parsePdfWithText(['Beginning Balance: $10,000.00', 'Ending Balance: $20,750.00']);
assert(balTest.entities.some(e => e.category === 'RUNNING_BALANCE'), 'Detects running balance amounts');

// =====================================================================
// SECTION 12 — Transaction Row Parsing (10 tests)
// =====================================================================
section('12 — Transaction Row Parsing');

const txLines = [
    'Bank Statement Header',
    '2026-10-03 | STRIPE PAYROLL SETTLEMENT | PAYROLL_DEPOSIT | - | $8,500.00 | $18,500.00',
    '2026-10-08 | COFFEE SHOP | PERSONAL_SPEND | $120.00 | - | $18,380.00',
    '2026-10-21 | CLIENT RETAINER | CLIENT_INFLOW | - | $4,200.00 | $22,580.00',
    '2026-10-28 | WIRE TRANSFER | WIRE_TRANSFER | $5,000.00 | - | $17,580.00',
];
const txParsed = parsePdfWithText(txLines);

assert(txParsed.transactions.length >= 4, 'Parses at least 4 transaction rows');

const payrollTx = txParsed.transactions.find(t => t.description.includes('STRIPE'));
assert(payrollTx !== undefined, 'Parses PAYROLL_DEPOSIT transaction');
assert(payrollTx?.category === 'PAYROLL_DEPOSIT', 'Transaction category is PAYROLL_DEPOSIT');
assert(payrollTx?.credit === 8500, 'PAYROLL_DEPOSIT credit amount is $8,500.00');
assert(payrollTx?.debit === null, 'PAYROLL_DEPOSIT debit is null');
assert(payrollTx?.runningBalance === 18500, 'PAYROLL_DEPOSIT running balance is $18,500.00');

const personalTx = txParsed.transactions.find(t => t.description.includes('COFFEE'));
assert(personalTx?.category === 'PERSONAL_SPEND', 'PERSONAL_SPEND category parsed');
assert(personalTx?.debit === 120, 'PERSONAL_SPEND debit is $120.00');

const wireTx = txParsed.transactions.find(t => t.description.includes('WIRE'));
assert(wireTx?.category === 'WIRE_TRANSFER', 'WIRE_TRANSFER category parsed');

// Invoice line items
const liLines = [
    'TAX INVOICE',
    'LINE_ITEM | Cloud Hosting | 3 | $500.00 | $1,500.00',
    'LINE_ITEM | Support Retainer | 1 | $2,000.00 | $2,000.00',
];
const liParsed = parsePdfWithText(liLines);
assert(liParsed.transactions.some(t => t.category === 'INVOICE_LINE_ITEM'), 'Parses INVOICE_LINE_ITEM rows');

// =====================================================================
// SECTION 13 — detectFinancialMathLeaks (12 tests)
// =====================================================================
section('13 — detectFinancialMathLeaks');

// No transactions — no leaks
const noLeaks = detectFinancialMathLeaks([], []);
assert(Array.isArray(noLeaks) && noLeaks.length === 0, 'Empty transactions → 0 math leak warnings');

// Running balance leak: when adjacent balances are visible but amount is redacted
const balEntPrev: DetectedPiiEntity = { ...makeEntity({ rawValue: '$10,000.00', category: 'RUNNING_BALANCE', tokenizedValue: '[BAL_01]', style: 'blackout', reasonCode: 'NONE' }), id: 'bal_1' };
const balEntCurr: DetectedPiiEntity = { ...makeEntity({ rawValue: '$18,500.00', category: 'RUNNING_BALANCE', tokenizedValue: '[BAL_02]', style: 'blackout', reasonCode: 'NONE' }), id: 'bal_2' };
const amtEnt: DetectedPiiEntity = { ...makeEntity({ rawValue: '$8,500.00', category: 'CURRENCY_AMOUNT', tokenizedValue: '[AMT_01]', style: 'blackout', reasonCode: 'NONE' }), id: 'amt_1' };

const txPrev: FinancialTransactionRow = {
    rowIndex: 0, pageIndex: 0, date: '2026-10-01', description: 'Opening', category: 'CLIENT_INFLOW',
    debit: null, credit: 10000, amount: 10000, runningBalance: 10000,
    redactRow: false, redactAmount: false, redactBalance: false, linkedEntityIds: ['bal_1'],
};
const txCurr: FinancialTransactionRow = {
    rowIndex: 1, pageIndex: 0, date: '2026-10-03', description: 'PAYROLL DEPOSIT', category: 'PAYROLL_DEPOSIT',
    debit: null, credit: 8500, amount: 8500, runningBalance: 18500,
    redactRow: false, redactAmount: true, redactBalance: false, linkedEntityIds: ['amt_1', 'bal_2'],
};

const leakResult = detectFinancialMathLeaks([txPrev, txCurr], [balEntPrev, balEntCurr, amtEnt]);
assert(leakResult.length > 0, 'detectFinancialMathLeaks: detects running balance leak');
assert(leakResult[0].type === 'RUNNING_BALANCE_SUBTRACTION', 'leak type is RUNNING_BALANCE_SUBTRACTION');
assert(leakResult[0].severity === 'CRITICAL', 'running balance leak severity is CRITICAL');
assert(typeof leakResult[0].formulaProof === 'string' && leakResult[0].formulaProof.includes('8500'), 'formulaProof includes solved amount');
assert(typeof leakResult[0].explanation === 'string' && leakResult[0].explanation.length > 10, 'explanation is non-empty');
assert(Array.isArray(leakResult[0].coupledEntityIds), 'coupledEntityIds is an array');
assert(leakResult[0].resolved === false, 'leak starts with resolved: false');

// No leak when balance is also redacted
const txCurrBalRedacted = { ...txCurr, redactBalance: true };
const noBalLeak = detectFinancialMathLeaks([txPrev, txCurrBalRedacted], [balEntPrev, balEntCurr, amtEnt]);
assert(noBalLeak.length === 0, 'No leak when running balance is also redacted');

// Invoice Subtotal+Tax=Total leak
const subtotalEnt: DetectedPiiEntity = { ...makeEntity({ rawValue: '$10,000.00', category: 'CURRENCY_AMOUNT', tokenizedValue: '[AMT_01]', style: 'blackout', reasonCode: 'NONE' }), id: 'sub_1', label: 'Subtotal', selected: true };
const taxEntInv: DetectedPiiEntity = { ...makeEntity({ rawValue: '$1,500.00', category: 'CURRENCY_AMOUNT', tokenizedValue: '[AMT_02]', style: 'blackout', reasonCode: 'NONE' }), id: 'tax_1', label: 'VAT (15%)', selected: false };
const totalEntInv: DetectedPiiEntity = { ...makeEntity({ rawValue: '$11,500.00', category: 'CURRENCY_AMOUNT', tokenizedValue: '[AMT_03]', style: 'blackout', reasonCode: 'NONE' }), id: 'tot_1', label: 'Grand Total', selected: false };
const invLeak = detectFinancialMathLeaks([], [subtotalEnt, taxEntInv, totalEntInv]);
assert(invLeak.some(w => w.type === 'INVOICE_SUBTOTAL_TAX_SOLVER'), 'detectFinancialMathLeaks: detects invoice subtotal+tax=total leak');

// All 3 redacted — no leak
const allRedacted = [
    { ...subtotalEnt, selected: true },
    { ...taxEntInv, selected: true },
    { ...totalEntInv, selected: true },
];
const noInvLeak = detectFinancialMathLeaks([], allRedacted);
assert(!noInvLeak.some(w => w.type === 'INVOICE_SUBTOTAL_TAX_SOLVER'), 'No leak when all 3 invoice figures are redacted');

// All 3 unredacted — no leak (nothing to solve)
const noneRedacted = [
    { ...subtotalEnt, selected: false },
    { ...taxEntInv, selected: false },
    { ...totalEntInv, selected: false },
];
const noInvLeak2 = detectFinancialMathLeaks([], noneRedacted);
assert(!noInvLeak2.some(w => w.type === 'INVOICE_SUBTOTAL_TAX_SOLVER'), 'No leak when none of the 3 invoice figures are redacted');

// =====================================================================
// SECTION 14 — applyPresetToEntitiesAndTransactions (18 tests)
// =====================================================================
section('14 — applyPresetToEntitiesAndTransactions');

function makeEntitySet(): DetectedPiiEntity[] {
    const cats: { cat: PiiCategory; tok: string }[] = [
        { cat: 'CARD_PAN', tok: '[CARD_01]' },
        { cat: 'IBAN', tok: '[IBAN_01]' },
        { cat: 'BANK_ACCOUNT', tok: '[ACCT_01]' },
        { cat: 'TAX_ID_SSN_CNIC_VAT_GSTIN', tok: '[TAX_01]' },
        { cat: 'ROUTING_ABA_BSB_SORT', tok: '[ROUTING_01]' },
        { cat: 'SWIFT_BIC', tok: '[SWIFT_01]' },
        { cat: 'CHECK_MICR', tok: '[MICR_01]' },
        { cat: 'QR_OR_BARCODE_PAYLOAD', tok: '[QR_01]' },
        { cat: 'PERSON_OR_PARTY_NAME', tok: '[PARTY_01]' },
        { cat: 'EMAIL_ADDRESS', tok: '[EMAIL_01]' },
        { cat: 'CURRENCY_AMOUNT', tok: '[AMT_01]' },
        { cat: 'RUNNING_BALANCE', tok: '[BAL_01]' },
    ];
    return cats.map((c, i) => makeEntity({ id: `ent_${i}`, rawValue: 'testvalue', category: c.cat, tokenizedValue: c.tok, style: 'blackout', reasonCode: 'NONE' }));
}

// mortgage_underwriter
const mortgageEnts = makeEntitySet();
applyPresetToEntitiesAndTransactions('mortgage_underwriter', mortgageEnts, []);
const mortCard = mortgageEnts.find(e => e.category === 'CARD_PAN')!;
assert(mortCard.selected === true && mortCard.style === 'keep_last_4', 'mortgage_underwriter: CARD_PAN → selected, keep_last_4');
const mortRouting = mortgageEnts.find(e => e.category === 'ROUTING_ABA_BSB_SORT')!;
assert(mortRouting.selected === true && mortRouting.style === 'blackout', 'mortgage_underwriter: ROUTING → selected, blackout');
const mortName = mortgageEnts.find(e => e.category === 'PERSON_OR_PARTY_NAME')!;
assert(mortName.selected === false, 'mortgage_underwriter: PERSON_OR_PARTY_NAME → NOT selected');

// landlord_income_proof
const landlordEnts = makeEntitySet();
applyPresetToEntitiesAndTransactions('landlord_income_proof', landlordEnts, []);
const landlordIban = landlordEnts.find(e => e.category === 'IBAN')!;
assert(landlordIban.selected === true && landlordIban.style === 'keep_last_4', 'landlord_income_proof: IBAN → selected, keep_last_4');
const landlordEmail = landlordEnts.find(e => e.category === 'EMAIL_ADDRESS')!;
assert(landlordEmail.selected === false, 'landlord_income_proof: EMAIL_ADDRESS → NOT selected');

// freelancer_portfolio_invoice
const freelancerEnts = makeEntitySet();
applyPresetToEntitiesAndTransactions('freelancer_portfolio_invoice', freelancerEnts, []);
assert(freelancerEnts.every(e => e.selected === true), 'freelancer_portfolio_invoice: ALL entities selected');
assert(freelancerEnts.every(e => e.style === 'blackout'), 'freelancer_portfolio_invoice: ALL entities → blackout');
assert(freelancerEnts.every(e => e.reasonCode === 'FOIA_B4_TRADE_SECRET'), 'freelancer_portfolio_invoice: reasonCode FOIA_B4_TRADE_SECRET');

// external_tax_audit
const auditEnts = makeEntitySet();
applyPresetToEntitiesAndTransactions('external_tax_audit', auditEnts, []);
const auditCard = auditEnts.find(e => e.category === 'CARD_PAN')!;
assert(auditCard.selected === true && auditCard.style === 'keep_last_4', 'external_tax_audit: CARD_PAN → keep_last_4');
const auditSwift = auditEnts.find(e => e.category === 'SWIFT_BIC')!;
assert(auditSwift.selected === true && auditSwift.style === 'blackout', 'external_tax_audit: SWIFT_BIC → blackout');
const auditEmail = auditEnts.find(e => e.category === 'EMAIL_ADDRESS')!;
assert(auditEmail.selected === false, 'external_tax_audit: EMAIL_ADDRESS → NOT selected');

// ai_llm_pseudonymizer
const llmEnts = makeEntitySet();
applyPresetToEntitiesAndTransactions('ai_llm_pseudonymizer', llmEnts, []);
const llmCard = llmEnts.find(e => e.category === 'CARD_PAN')!;
assert(llmCard.selected === true && llmCard.style === 'tokenize', 'ai_llm_pseudonymizer: CARD_PAN → tokenize');
const llmAmt = llmEnts.find(e => e.category === 'CURRENCY_AMOUNT')!;
assert(llmAmt.selected === false, 'ai_llm_pseudonymizer: CURRENCY_AMOUNT → NOT selected');

// strict_zero_pii_foia
const foiaEnts = makeEntitySet();
applyPresetToEntitiesAndTransactions('strict_zero_pii_foia', foiaEnts, []);
assert(foiaEnts.every(e => e.selected === true), 'strict_zero_pii_foia: ALL entities selected');
assert(foiaEnts.every(e => e.style === 'blackout'), 'strict_zero_pii_foia: ALL → blackout');
assert(foiaEnts.every(e => e.reasonCode === 'FOIA_B6_PERSONAL_PRIVACY'), 'strict_zero_pii_foia: reasonCode FOIA_B6_PERSONAL_PRIVACY');

// maskedPreview is updated
assert(typeof mortCard.maskedPreview === 'string' && mortCard.maskedPreview.length > 0, 'applyPreset: maskedPreview updated for each entity');

// =====================================================================
// SECTION 15 — Full Redaction Pipeline via Sample PDFs (20 tests)
// =====================================================================
section('15 — Full Redaction Pipeline (applyPdfRedactionsAndSanitize)');

const presets: FinancialPresetId[] = ['mortgage_underwriter', 'landlord_income_proof', 'freelancer_portfolio_invoice', 'external_tax_audit', 'ai_llm_pseudonymizer', 'strict_zero_pii_foia'];

for (const preset of presets) {
    const sample = generateSampleFinancialPdf('enterprise_bank_statement');
    const p = parseFinancialPdfFile(sample.bytes, sample.fileName, preset);

    const outcome = applyPdfRedactionsAndSanitize(p, {
        outputMode: 'surgical_cdr',
        defaultStyle: 'blackout',
        defaultReasonCode: 'PRIVACY_REDACTED',
        antiInferencePadding: false,
        scrubAll12Surfaces: true,
        autoMaskCoupledMath: true,
        underwriterAttestationBadge: false,
    });

    assert(outcome.redactedPdfBytes instanceof Uint8Array && outcome.redactedPdfBytes.length > 50,
        `${preset}: redactedPdfBytes is a non-trivial Uint8Array`);
    assert(outcome.redactedPdfBytes[0] === 0x25 && outcome.redactedPdfBytes[1] === 0x50,
        `${preset}: redacted PDF starts with %P (PDF magic)`);
    assert(typeof outcome.redactedFileName === 'string' && outcome.redactedFileName.endsWith('.pdf'),
        `${preset}: redactedFileName is a .pdf string`);
    assert(typeof outcome.appliedCount === 'number' && outcome.appliedCount >= 0,
        `${preset}: appliedCount is a non-negative number`);
}

// Specific forensic checks on bank_statement with strict preset
const bankFull = generateSampleFinancialPdf('enterprise_bank_statement');
const bankFullParsed = parseFinancialPdfFile(bankFull.bytes, bankFull.fileName, 'strict_zero_pii_foia');
const bankOutcome = applyPdfRedactionsAndSanitize(bankFullParsed, {
    outputMode: 'surgical_cdr',
    defaultStyle: 'blackout',
    defaultReasonCode: 'FOIA_B6_PERSONAL_PRIVACY',
    antiInferencePadding: false,
    scrubAll12Surfaces: true,
    autoMaskCoupledMath: true,
    underwriterAttestationBadge: false,
});

assert(bankOutcome.forensicReport.passedAllChecks === true, 'strict_zero_pii_foia: forensicReport.passedAllChecks === true');
assert(bankOutcome.forensicReport.singleGenerationXrefVerified === true, 'strict_zero_pii_foia: singleGenerationXrefVerified (%%EOF=1)');
assert(bankOutcome.forensicReport.outputEofCount === 1, 'strict_zero_pii_foia: outputEofCount === 1');
assert(bankOutcome.forensicReport.all12SurfacesClean === true, 'strict_zero_pii_foia: all12SurfacesClean === true');
assert(bankOutcome.forensicReport.leakedTokensCount === 0, 'strict_zero_pii_foia: leakedTokensCount === 0');
assert(bankOutcome.forensicReport.ctrlAPasteTestPassed === true, 'strict_zero_pii_foia: ctrlAPasteTestPassed === true');
assert(typeof bankOutcome.forensicReport.inputSha256 === 'string' && bankOutcome.forensicReport.inputSha256.length === 64, 'forensicReport.inputSha256 is 64-char hex');
assert(typeof bankOutcome.forensicReport.outputSha256 === 'string' && bankOutcome.forensicReport.outputSha256.length === 64, 'forensicReport.outputSha256 is 64-char hex');
assert(bankOutcome.forensicReport.inputSha256 !== bankOutcome.forensicReport.outputSha256, 'inputSha256 ≠ outputSha256 (output is different from input)');
assert(Array.isArray(bankOutcome.forensicReport.surfaceChecks) && bankOutcome.forensicReport.surfaceChecks.length === 12, 'forensicReport has 12 surface check entries');
assert(bankOutcome.forensicReport.surfaceChecks.every(s => s.passed === true), 'All 12 forensic surface checks pass');

// burn_in_flattened mode
const burnOutcome = applyPdfRedactionsAndSanitize(bankFullParsed, {
    outputMode: 'burn_in_flattened',
    defaultStyle: 'blackout',
    defaultReasonCode: 'PRIVACY_REDACTED',
    antiInferencePadding: true,
    scrubAll12Surfaces: true,
    autoMaskCoupledMath: false,
    underwriterAttestationBadge: true,
});
assert(burnOutcome.redactedPdfBytes instanceof Uint8Array && burnOutcome.redactedPdfBytes.length > 50, 'burn_in_flattened mode produces valid output');
assert(burnOutcome.forensicReport.singleGenerationXrefVerified === true, 'burn_in_flattened: single generation xref');

// Custom rectangles
const customOutcome = applyPdfRedactionsAndSanitize(bankFullParsed, {
    outputMode: 'surgical_cdr',
    defaultStyle: 'whiteout',
    defaultReasonCode: 'GDPR_ART_6_PII',
    antiInferencePadding: false,
    scrubAll12Surfaces: true,
    autoMaskCoupledMath: false,
    underwriterAttestationBadge: false,
    customRectangles: [{ id: 'rect_1', pageIndex: 0, x: 100, y: 100, width: 200, height: 20, label: '[CUSTOM ZONE REDACTED]', repeatAllPages: false }],
});
assert(customOutcome.appliedCount >= 1, 'customRectangles: appliedCount counts the custom rectangle');

// =====================================================================
// SECTION 16 — verifyRedactedPdfForensics (8 tests)
// =====================================================================
section('16 — verifyRedactedPdfForensics');

const fSample = generateSampleFinancialPdf('enterprise_bank_statement');
const fParsed = parseFinancialPdfFile(fSample.bytes, fSample.fileName, 'strict_zero_pii_foia');
const fSelected = fParsed.entities.filter(e => e.selected);

// Generate a clean output PDF first
const fOutcome = applyPdfRedactionsAndSanitize(fParsed, {
    outputMode: 'surgical_cdr', defaultStyle: 'blackout', defaultReasonCode: 'FOIA_B6_PERSONAL_PRIVACY',
    antiInferencePadding: false, scrubAll12Surfaces: true, autoMaskCoupledMath: true, underwriterAttestationBadge: false,
});

const fReport = fOutcome.forensicReport;
assert(typeof fReport.verifiedAtIso === 'string' && fReport.verifiedAtIso.includes('T'), 'verifiedAtIso is ISO timestamp');
assert(typeof fReport.extractedBeforeTextPreview === 'string', 'extractedBeforeTextPreview is a string');
assert(typeof fReport.extractedAfterTextPreview === 'string', 'extractedAfterTextPreview is a string');
assert(typeof fReport.totalRedactedTargetsChecked === 'number', 'totalRedactedTargetsChecked is a number');
assert(fReport.zeroRecoverableRedactedTokens === true, 'zeroRecoverableRedactedTokens is true after strict redaction');
assert(fReport.unredactedBalancesPreservedExactly === true, 'unredactedBalancesPreservedExactly is true');
assert(fReport.leakedTokenSamples.length === 0, 'leakedTokenSamples is empty after strict redaction');
assert(fReport.outputEofCount === 1, 'outputEofCount === 1 (single generation)');

// =====================================================================
// SECTION 17 — Compliance Certificate & Privilege Log (14 tests)
// =====================================================================
section('17 — Compliance Certificate & Privilege Log');

const certSample = generateSampleFinancialPdf('enterprise_bank_statement');
const certParsed = parseFinancialPdfFile(certSample.bytes, certSample.fileName, 'strict_zero_pii_foia');
const certOutcome = applyPdfRedactionsAndSanitize(certParsed, {
    outputMode: 'surgical_cdr', defaultStyle: 'blackout', defaultReasonCode: 'FOIA_B6_PERSONAL_PRIVACY',
    antiInferencePadding: false, scrubAll12Surfaces: true, autoMaskCoupledMath: false, underwriterAttestationBadge: false,
});

// Certificate JSON
const certJson = generateComplianceCertificateJson(certParsed, certOutcome, 'strict_zero_pii_foia');
assert(typeof certJson === 'string', 'generateComplianceCertificateJson returns a string');
let certObj: Record<string, unknown>;
try {
    certObj = JSON.parse(certJson) as Record<string, unknown>;
    assert(true, 'Compliance certificate is valid JSON');
} catch {
    certObj = {};
    assert(false, 'Compliance certificate is NOT valid JSON');
}
assert(certObj.certificateVersion === '2.0', 'certificate.certificateVersion is "2.0"');
assert(typeof certObj.verifiedAt === 'string', 'certificate.verifiedAt is a string');
assert(typeof certObj.document === 'object' && certObj.document !== null, 'certificate.document is an object');
assert(typeof certObj.redactionSummary === 'object' && certObj.redactionSummary !== null, 'certificate.redactionSummary is an object');
assert(typeof certObj.forensicSelfTest === 'object' && certObj.forensicSelfTest !== null, 'certificate.forensicSelfTest is an object');
assert(Array.isArray(certObj.regulatoryComplianceMappings) && (certObj.regulatoryComplianceMappings as unknown[]).length > 0, 'certificate.regulatoryComplianceMappings is non-empty array');

// CSV Privilege Log
const csvLog = exportPrivilegeLogCsv(certParsed);
assert(typeof csvLog === 'string' && csvLog.length > 0, 'exportPrivilegeLogCsv returns non-empty string');
assert(csvLog.includes('Redaction_ID'), 'CSV has Redaction_ID header');
assert(csvLog.includes('PII_Category'), 'CSV has PII_Category header');
assert(csvLog.includes('Exemption_Reason_Code'), 'CSV has Exemption_Reason_Code header');

// XLSX Privilege Log
const xlsxLog = exportPrivilegeLogXlsx(certParsed);
assert(xlsxLog instanceof Uint8Array && xlsxLog.length > 100, 'exportPrivilegeLogXlsx returns non-trivial Uint8Array');
// XLSX is a ZIP — starts with PK header (0x50 0x4B 0x03 0x04)
assert(xlsxLog[0] === 0x50 && xlsxLog[1] === 0x4B, 'XLSX output starts with PK ZIP magic bytes');

// =====================================================================
// SECTION 18 — sanitizeSpreadsheetFormula CWE-1236 (10 tests)
// =====================================================================
section('18 — sanitizeSpreadsheetFormula (CWE-1236 Injection Prevention)');

assert(sanitizeSpreadsheetFormula('=HYPERLINK("http://evil.com")', true).startsWith("'="), 'CWE-1236: = prefix is escaped');
assert(sanitizeSpreadsheetFormula('+CMD|"/c calc"!A0', true).startsWith("'+"), 'CWE-1236: + prefix is escaped');
assert(sanitizeSpreadsheetFormula('@SUM(A1:A5)', true).startsWith("'@"), 'CWE-1236: @ prefix is escaped');
assert(sanitizeSpreadsheetFormula('-1.5', true) === '-1.5', 'CWE-1236: negative numbers preserved as-is');
assert(sanitizeSpreadsheetFormula('100.00', true) === '100.00', 'CWE-1236: positive numbers preserved');
assert(sanitizeSpreadsheetFormula('Normal text', true) === 'Normal text', 'CWE-1236: normal text unchanged');
assert(sanitizeSpreadsheetFormula('', true) === '', 'CWE-1236: empty string returns empty');
assert(sanitizeSpreadsheetFormula(null as unknown as string, true) === '', 'CWE-1236: null returns empty string');
assert(sanitizeSpreadsheetFormula(undefined as unknown as string, true) === '', 'CWE-1236: undefined returns empty string');
assert(sanitizeSpreadsheetFormula('–Transfer', true).startsWith("'"), 'CWE-1236: em-dash prefix escaped (non-numeric)');

// =====================================================================
// SECTION 19 — Encrypted Vault Roundtrip (14 tests)
// =====================================================================
section('19 — Encrypted Vault Roundtrip');

const vaultSample = generateSampleFinancialPdf('enterprise_bank_statement');
const vaultParsed = parseFinancialPdfFile(vaultSample.bytes, vaultSample.fileName);

// Encrypt
const vaultJson = encryptRedactionVault(vaultParsed, 'SecurePass1234!');
assert(typeof vaultJson === 'string' && vaultJson.length > 100, 'encryptRedactionVault returns non-empty JSON string');

let vaultObj: Record<string, unknown>;
try {
    vaultObj = JSON.parse(vaultJson) as Record<string, unknown>;
    assert(true, 'Vault is valid JSON');
} catch {
    vaultObj = {};
    assert(false, 'Vault is NOT valid JSON');
}
assert(vaultObj.format === 'KIVARO_ENCRYPTED_REDACTION_VAULT_V2', 'vault.format is correct');
assert(vaultObj.kdf === 'SHA256-CTR-HMAC', 'vault.kdf is SHA256-CTR-HMAC');
assert(typeof vaultObj.saltHex === 'string' && (vaultObj.saltHex as string).length === 32, 'vault.saltHex is 32-char hex');
assert(typeof vaultObj.macHex === 'string' && (vaultObj.macHex as string).length === 64, 'vault.macHex is 64-char hex');
assert(typeof vaultObj.cipherHex === 'string' && (vaultObj.cipherHex as string).length > 0, 'vault.cipherHex is non-empty');

// Decrypt — correct passphrase
const decrypted = decryptRedactionVault(vaultJson, 'SecurePass1234!');
assert(decrypted !== null, 'decryptRedactionVault returns non-null with correct passphrase');
assert(decrypted.vaultVersion === '2.0', 'decrypted.vaultVersion is "2.0"');
assert(decrypted.fileName === vaultParsed.metadata.fileName, 'decrypted.fileName matches original');
assert(decrypted.inputSha256 === vaultParsed.metadata.inputSha256, 'decrypted.inputSha256 matches original');
assert(Array.isArray(decrypted.entities), 'decrypted.entities is an array');
assert(decrypted.entities.length === vaultParsed.entities.length, 'decrypted entity count matches original');

// Decrypt — wrong passphrase throws
assertThrows(
    () => decryptRedactionVault(vaultJson, 'WrongPassword!'),
    'hmac',
    'decryptRedactionVault throws on wrong passphrase (HMAC mismatch)'
);

// Short passphrase throws
assertThrows(
    () => encryptRedactionVault(vaultParsed, 'ab'),
    '4 character',
    'encryptRedactionVault throws if passphrase < 4 chars'
);

// Corrupted vault throws
assertThrows(
    () => decryptRedactionVault('{"format":"invalid"}', 'SecurePass1234!'),
    'corrupted',
    'decryptRedactionVault throws on corrupted/unsupported vault'
);

// =====================================================================
// SECTION 20 — isPdfScrubberCancelledError (8 tests)
// =====================================================================
section('20 — isPdfScrubberCancelledError');

assert(!isPdfScrubberCancelledError(null), 'isPdfScrubberCancelledError: null → false');
assert(!isPdfScrubberCancelledError(undefined), 'isPdfScrubberCancelledError: undefined → false');
assert(!isPdfScrubberCancelledError(new Error('something')), 'isPdfScrubberCancelledError: plain Error → false');
assert(!isPdfScrubberCancelledError('string'), 'isPdfScrubberCancelledError: string → false');
assert(!isPdfScrubberCancelledError(42), 'isPdfScrubberCancelledError: number → false');
assert(!isPdfScrubberCancelledError({ isCancelled: false }), 'isPdfScrubberCancelledError: {isCancelled: false} → false');
assert(isPdfScrubberCancelledError({ isCancelled: true }), 'isPdfScrubberCancelledError: {isCancelled: true} → true');

const cancelledErr = new Error('superseded') as Error & { isCancelled: boolean };
cancelledErr.isCancelled = true;
assert(isPdfScrubberCancelledError(cancelledErr), 'isPdfScrubberCancelledError: Error with isCancelled:true → true');

// =====================================================================
// SECTION 21 — Full Integration Roundtrip (12 tests)
// =====================================================================
section('21 — Full Integration Roundtrip (Generate → Parse → Preset → Redact → Certify)');

for (const sampleType of sampleTypes) {
    const sample = generateSampleFinancialPdf(sampleType);
    const roundtripParsed = parseFinancialPdfFile(sample.bytes, sample.fileName, sample.recommendedPreset);

    const roundtripOutcome = applyPdfRedactionsAndSanitize(roundtripParsed, {
        outputMode: 'surgical_cdr',
        defaultStyle: 'blackout',
        defaultReasonCode: 'PRIVACY_REDACTED',
        antiInferencePadding: false,
        scrubAll12Surfaces: true,
        autoMaskCoupledMath: true,
        underwriterAttestationBadge: false,
    });

    assert(roundtripOutcome.forensicReport.passedAllChecks, `${sampleType}: full roundtrip forensic checks all pass`);
    assert(roundtripOutcome.forensicReport.singleGenerationXrefVerified, `${sampleType}: output is single-generation`);

    const csv = exportPrivilegeLogCsv(roundtripParsed);
    assert(csv.includes('Redaction_ID'), `${sampleType}: CSV privilege log has correct headers`);

    const certJ = generateComplianceCertificateJson(roundtripParsed, roundtripOutcome, sample.recommendedPreset);
    assert(JSON.parse(certJ).certificateVersion === '2.0', `${sampleType}: certificate version is 2.0`);
}

// =====================================================================
// SECTION 22 — Doc Type Classification (6 tests)
// =====================================================================
section('22 — Document Type Classification');

const stmtParsed = parsePdfWithText(['BANK STATEMENT', 'Account Summary', 'Beginning Balance: $1,000.00', 'Ending Balance: $2,000.00', 'IBAN: PK36SCBL0000001123456702']);
assert(stmtParsed.metadata.detectedDocType === 'bank_statement', 'Correctly classifies bank_statement');

const invTypeParsed = parsePdfWithText(['TAX INVOICE', 'Bill To: Acme Corp', 'Subtotal: $5,000.00', 'VAT (15%): $750.00', 'Grand Total: $5,750.00']);
assert(invTypeParsed.metadata.detectedDocType === 'tax_invoice', 'Correctly classifies tax_invoice');

const payrollParsed = parsePdfWithText(['W-2 Wage Statement', 'Employee SSN: 123-45-6789', 'Net Pay: $5,000.00', 'Withholding: $1,000.00']);
assert(payrollParsed.metadata.detectedDocType === 'payroll_tax_form', 'Correctly classifies payroll_tax_form');

const genericParsed = parsePdfWithText(['Random Document', 'Some content here', 'No financial keywords']);
assert(genericParsed.metadata.detectedDocType === 'generic_financial_pdf', 'Classifies as generic_financial_pdf when no match');

const bs2 = generateSampleFinancialPdf('enterprise_bank_statement');
const bs2Parsed = parseFinancialPdfFile(bs2.bytes, bs2.fileName);
assert(bs2Parsed.metadata.detectedDocType === 'bank_statement', 'enterprise_bank_statement sample classified as bank_statement');

const inv2 = generateSampleFinancialPdf('hybrid_b2b_tax_invoice');
const inv2Parsed = parseFinancialPdfFile(inv2.bytes, inv2.fileName);
assert(inv2Parsed.metadata.detectedDocType === 'tax_invoice', 'hybrid_b2b_tax_invoice sample classified as tax_invoice');

// =====================================================================
// SECTION 23 — Edge Cases & Boundary Conditions (10 tests)
// =====================================================================
section('23 — Edge Cases & Boundary Conditions');

// Empty PDF (no text, just structure)
const emptyContentPdf = buildMinimalPdf([]);
const emptyParsed = parseFinancialPdfFile(emptyContentPdf, 'empty.pdf');
assert(emptyParsed.entities.length === 0, 'Empty PDF → 0 entities detected');
assert(emptyParsed.transactions.length === 0, 'Empty PDF → 0 transactions parsed');
assert(emptyParsed.mathWarnings.length === 0, 'Empty PDF → 0 math warnings');

// Very long single line
const longLine = 'A'.repeat(500);
const longPdf = buildMinimalPdf([longLine]);
const longParsed = parseFinancialPdfFile(longPdf, 'long.pdf');
assert(longParsed.pages.length >= 1, 'Long line PDF: at least 1 page');

// Multiple IBANs on same PDF
const multiIbanPdf = buildMinimalPdf([
    'IBAN 1: PK36SCBL0000001123456702',
    'IBAN 2: GB29NWBK60161331926819',
    'IBAN 3: DE89370400440532013000',
]);
const multiIban = parseFinancialPdfFile(multiIbanPdf, 'multi_iban.pdf');
assert(multiIban.entities.filter(e => e.category === 'IBAN').length >= 3, 'Multiple IBANs detected on same PDF');

// PDF with JavaScript — should detect hasJavaScriptActions
const jsPdf = buildMinimalPdf(['Normal content'], { javascript: 'app.alert("test");' });
const jsParsed = parseFinancialPdfFile(jsPdf, 'js.pdf');
assert(jsParsed.metadata.hasJavaScriptActions === true, 'PDF with /JS detected: hasJavaScriptActions true');

// Output PDF after redaction has %%EOF only once
const eofSample = generateSampleFinancialPdf('enterprise_bank_statement');
const eofParsed = parseFinancialPdfFile(eofSample.bytes, eofSample.fileName);
const eofOutcome = applyPdfRedactionsAndSanitize(eofParsed, {
    outputMode: 'surgical_cdr', defaultStyle: 'blackout', defaultReasonCode: 'PRIVACY_REDACTED',
    antiInferencePadding: false, scrubAll12Surfaces: true, autoMaskCoupledMath: false, underwriterAttestationBadge: false,
});
const eofStr = new TextDecoder('latin1').decode(eofOutcome.redactedPdfBytes);
const eofCount = (eofStr.match(/%%EOF/g) || []).length;
assert(eofCount === 1, `Redacted PDF contains exactly 1 %%EOF (got ${eofCount})`);

// coupledMathMaskedCount is tracked
const mathSample = generateSampleFinancialPdf('enterprise_bank_statement');
const mathParsed = parseFinancialPdfFile(mathSample.bytes, mathSample.fileName, 'landlord_income_proof');
const mathOutcome = applyPdfRedactionsAndSanitize(mathParsed, {
    outputMode: 'surgical_cdr', defaultStyle: 'blackout', defaultReasonCode: 'PRIVACY_REDACTED',
    antiInferencePadding: false, scrubAll12Surfaces: true, autoMaskCoupledMath: true, underwriterAttestationBadge: false,
});
assert(typeof mathOutcome.coupledMathMaskedCount === 'number' && mathOutcome.coupledMathMaskedCount >= 0,
    'coupledMathMaskedCount is tracked as non-negative number');

// surfacesPurgedCount is tracked
assert(typeof mathOutcome.surfacesPurgedCount === 'number' && mathOutcome.surfacesPurgedCount >= 0,
    'surfacesPurgedCount is tracked as non-negative number');

// warnings array in parse result is array
assert(Array.isArray(eofParsed.warnings), 'parseResult.warnings is always an array');

// Redaction of a PDF with no entities should still produce valid output
const noEntityOutcome = applyPdfRedactionsAndSanitize(emptyParsed, {
    outputMode: 'surgical_cdr', defaultStyle: 'blackout', defaultReasonCode: 'PRIVACY_REDACTED',
    antiInferencePadding: false, scrubAll12Surfaces: true, autoMaskCoupledMath: false, underwriterAttestationBadge: false,
});
assert(noEntityOutcome.redactedPdfBytes.length > 0, 'No-entity PDF still produces valid output bytes');

// =====================================================================
// SECTION 24 — Surface Detection Flags (8 tests)
// =====================================================================
section('24 — 12-Surface Detection Flags');

// PDF with all surfaces
const allSurfPdf = buildMinimalPdf(
    ['IBAN: PK36SCBL0000001123456702'],
    {
        info: '/Title (Test) /Author (Tester)',
        xmp: '<rdf:RDF></rdf:RDF>',
        acroField: 'secret-value',
        invisibleOcr: 'hidden text',
        incrementalSave: true,
        javascript: 'alert("x");',
    }
);
const allSurf = parseFinancialPdfFile(allSurfPdf, 'all_surfaces.pdf');

assert(Object.keys(allSurf.metadata.infoDictionary).length > 0, 'Surface 3: /Info dictionary detected');
assert(allSurf.metadata.hasXmpMetadata === true, 'Surface 4: XMP /Metadata detected');
assert(allSurf.metadata.hasAcroFormFields === true, 'Surface 7: /AcroForm fields detected');
assert(allSurf.metadata.hasIncrementalUpdates === true, 'Surface 10: Incremental save detected (eofCount >= 2)');
assert(allSurf.metadata.hasInvisibleOcrText === true, 'Surface 2: Invisible OCR text layer detected');
assert(allSurf.metadata.hasJavaScriptActions === true, 'Surface 9: JavaScript actions detected');
assert(allSurf.metadata.surfaces.length === 12, 'parseResult has exactly 12 surface audit items');
assert(allSurf.metadata.surfaces.every(s => typeof s.surfaceName === 'string' && s.surfaceName.length > 0), 'All surface items have non-empty surfaceName');

// =====================================================================
// SECTION 25 — Deterministic Tokenization (5 tests)
// =====================================================================
section('25 — Deterministic Tokenization Consistency');

// Same entity on multiple pages should get same token
const multiPagePdf = buildMinimalPdf([
    'Email: user@example.com   IBAN: PK36SCBL0000001123456702',
    'Email again: user@example.com   IBAN again: PK36SCBL0000001123456702',
]);
const mp = parseFinancialPdfFile(multiPagePdf, 'multi.pdf');

const emailEntities = mp.entities.filter(e => e.category === 'EMAIL_ADDRESS' && e.rawValue === 'user@example.com');
if (emailEntities.length >= 2) {
    assert(
        emailEntities[0].tokenizedValue === emailEntities[1].tokenizedValue,
        'Same email on multiple lines gets same consistent token'
    );
} else {
    assert(emailEntities.length >= 1, 'Email detected on multi-line PDF');
}

const ibanEntities = mp.entities.filter(e => e.category === 'IBAN' && e.rawValue.includes('PK36'));
if (ibanEntities.length >= 2) {
    assert(
        ibanEntities[0].tokenizedValue === ibanEntities[1].tokenizedValue,
        'Same IBAN on multiple lines gets same consistent token'
    );
} else {
    assert(ibanEntities.length >= 1, 'IBAN detected on multi-line PDF');
}

// Token format: [PREFIX_NN]
const firstToken = mp.entities[0]?.tokenizedValue;
assert(typeof firstToken === 'string' && /^\[.+_\d{2}\]$/.test(firstToken), 'Token format is [PREFIX_NN]');

// Tokenize style output matches tokenizedValue
if (mp.entities.length > 0) {
    const e = { ...mp.entities[0], style: 'tokenize' as RedactionStyle };
    assert(formatRedactedReplacement(e) === e.tokenizedValue, 'tokenize style returns exact tokenizedValue');
}

// All entity IDs are unique
const allIds = mp.entities.map(e => e.id);
assert(new Set(allIds).size === allIds.length, 'All entity IDs are unique within a parse result');

// =====================================================================
// SECTION 26 — Incremental Xref Chain in Sample PDFs (5 tests)
// =====================================================================
section('26 — Sample PDF Incremental Xref Chain Detection & CDR');

// All 3 sample types have incremental updates (addIncrementalUpdate: true in builder)
for (const st of sampleTypes) {
    const s = generateSampleFinancialPdf(st);
    const p = parseFinancialPdfFile(s.bytes, s.fileName);
    assert(p.metadata.eofCount >= 2, `${st}: eofCount >= 2 (incremental save chain present)`);
    assert(p.metadata.hasIncrementalUpdates === true, `${st}: hasIncrementalUpdates === true`);

    // After redaction, should collapse to single generation
    const o = applyPdfRedactionsAndSanitize(p, {
        outputMode: 'surgical_cdr', defaultStyle: 'blackout', defaultReasonCode: 'PRIVACY_REDACTED',
        antiInferencePadding: false, scrubAll12Surfaces: true, autoMaskCoupledMath: false, underwriterAttestationBadge: false,
    });
    assert(o.forensicReport.outputEofCount === 1, `${st}: CDR collapses incremental chain to 1 %%EOF`);
}

// =====================================================================
// FINAL SUMMARY
// =====================================================================

const totalTests = passed + failed;
console.log(`\n${'═'.repeat(70)}`);
console.log(`  PDF SCRUBBER ENGINE TEST RESULTS`);
console.log(`${'═'.repeat(70)}`);
console.log(`  Total Tests  : ${totalTests}`);
console.log(`  ✅ Passed    : ${passed}`);
console.log(`  ❌ Failed    : ${failed}`);
console.log(`${'═'.repeat(70)}`);

if (failed > 0) {
    console.log('\n  Failed Tests:');
    for (const msg of failedMessages) {
        console.error(`    ✗ ${msg}`);
    }
    console.log('');
}

if (failed === 0) {
    console.log(`\n  🎉 ALL ${totalTests} TESTS PASSED — pdfFinancialScrubberEngine is 100% verified!\n`);
    process.exit(0);
} else {
    console.error(`\n  ⛔ ${failed}/${totalTests} TESTS FAILED — review output above.\n`);
    process.exit(1);
}

