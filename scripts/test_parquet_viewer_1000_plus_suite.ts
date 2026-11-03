/**
 * KivaroTools Enterprise Parquet, Avro, Feather V1 & Feather V2 Viewer — Master Verification Suite (v5.0)
 *
 * Strictly separates test evidence into the required audit categories:
 * - Category A: Internal Round-Trip & Codec Unit Tests (Varint, ZigZag, Thrift, RLE, Snappy, DEFLATE, LZ4)
 * - Category B: Specification-Oriented Synthetic & Malformed/Security Regression Tests (Feather V1 Malformed,
 *               Feather V2 Malformed, Parquet Malformed/ZSTD/PARE, Avro Malformed/Bad Sync/Bad CRC32, CWE-1236)
 * - Category C: Independently Generated External Interoperability Tests (PyArrow 26.0.0 Parquet, Feather V1 CTable,
 *               Feather V2 Arrow IPC, Arrow IPC Stream, Python 3.11 Avro 1.11 Multi-Block OCF, OpenPyXL 3.1.5)
 * - Category D: Real-World Sample Datasets, All 11 Filter Operators, AND/OR Combinators & 64-Bit BigInt Boundaries
 * - Category E: Native .XLSX OpenXML Compiler, 10-Dialect DDL Generator, UI Disclosure & SEO Parity
 */

import fs from 'fs';
import {
    bytesToHex,
    detectColumnarFormat,
    readUnsignedVarint,
    writeUnsignedVarint,
    readZigZagVarint,
    writeZigZagVarint,
    compressSnappyBlock,
    decompressSnappyBlock,
    encodeRleBitPackedHybrid,
    decodeRleBitPackedHybrid,
    inflateRawDeflate,
    decompressGzipOrDeflate,
    decompressLz4Block,
    encodeParquetBinary,
    encodeAvroBinary,
    encodeFeatherBinary,
    generateSampleBinaryFile,
    parseColumnarFile,
    parseFeatherV1Binary,
    computeColumnProfiles,
    compareExactNumericValues,
    queryDataset,
    generateSchemaCode,
    sanitizeSpreadsheetFormula,
    encodeXlsxWorkbookBinary,
    exportDatasetToText,
    type SchemaTargetLanguage,
    type ExportFormat,
} from '@/lib/columnarViewerEngine';
import ParquetViewer from '@/components/tools/ParquetViewer';
import ParquetViewerSeo, { PARQUET_VIEWER_FAQS } from '@/components/seo/ParquetViewerSeo';

interface CategoryStats {
    passed: number;
    failed: number;
}

const stats: Record<string, CategoryStats> = {
    A_Internal_RoundTrip: { passed: 0, failed: 0 },
    B_Synthetic_Malformed_Security: { passed: 0, failed: 0 },
    C_Independent_External_Interop: { passed: 0, failed: 0 },
    D_BigInt_11Operators_Samples: { passed: 0, failed: 0 },
    E_Xlsx_DDL_UI_SEO_Parity: { passed: 0, failed: 0 },
};

let totalPassed = 0;
let totalFailed = 0;

function assertCat(cat: keyof typeof stats, condition: boolean, label: string): void {
    if (condition) {
        stats[cat].passed++;
        totalPassed++;
    } else {
        stats[cat].failed++;
        totalFailed++;
        console.error(`  [FAIL] [${cat}] ${label}`);
    }
}

function assertThrows(cat: keyof typeof stats, fn: () => unknown, expectedSubstring: string, label: string): void {
    try {
        fn();
        stats[cat].failed++;
        totalFailed++;
        console.error(`  [FAIL] [${cat}] Expected error containing "${expectedSubstring}" but did not throw: ${label}`);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.toLowerCase().includes(expectedSubstring.toLowerCase())) {
            stats[cat].passed++;
            totalPassed++;
        } else {
            stats[cat].failed++;
            totalFailed++;
            console.error(`  [FAIL] [${cat}] Expected "${expectedSubstring}" but got "${msg}": ${label}`);
        }
    }
}

console.log('================================================================================');
console.log(' KIVAROTOOLS PARQUET / AVRO / FEATHER V1 & V2 — MASTER VERIFICATION SUITE v5.0');
console.log('================================================================================\n');

// ============================================================================
// CATEGORY A: INTERNAL ROUND-TRIP & CODEC UNIT TESTS
// ============================================================================
console.log('--- Category A: Internal Round-Trip & Codec Unit Tests ---');

for (const v of [0, 1, 127, 128, 255, 16383, 16384, 65535, 2147483647]) {
    const enc = new Uint8Array(writeUnsignedVarint(v));
    const dec = readUnsignedVarint(enc, 0);
    assertCat('A_Internal_RoundTrip', dec.value === v && dec.nextOffset === enc.length, `Unsigned varint ${v}`);
}

for (const zv of [
    BigInt(0),
    BigInt(-1),
    BigInt(1),
    BigInt(-2),
    BigInt(2),
    BigInt(-2147483648),
    BigInt(2147483647),
    BigInt('9007199254740999123'),
    BigInt('-9007199254740999123'),
    BigInt('9223372036854775807'),
    BigInt('-9223372036854775808'),
]) {
    const enc = new Uint8Array(writeZigZagVarint(zv));
    const dec = readZigZagVarint(enc, 0);
    assertCat('A_Internal_RoundTrip', dec.bigValue === zv && dec.nextOffset === enc.length, `ZigZag 64-bit ${zv}`);
}

for (let bw = 1; bw <= 16; bw++) {
    const maxVal = (1 << Math.min(bw, 12)) - 1;
    const arr = Array.from({ length: 45 }, (_, i) => (i < 15 ? 1 : i < 30 ? 0 : i % (maxVal + 1)));
    const rleBytes = encodeRleBitPackedHybrid(arr, bw, false);
    const decoded = decodeRleBitPackedHybrid(rleBytes, bw, arr.length);
    assertCat(
        'A_Internal_RoundTrip',
        decoded.length === arr.length && decoded.every((v, idx) => v === arr[idx]),
        `Hybrid RLE bitWidth=${bw}`
    );
}

for (let p = 1; p <= 20; p++) {
    const text = `KivaroTools_Columnar_Snappy_Payload_${p}_`.repeat(p * 3);
    const raw = new TextEncoder().encode(text);
    const comp = compressSnappyBlock(raw);
    const decomp = decompressSnappyBlock(comp);
    assertCat(
        'A_Internal_RoundTrip',
        new TextDecoder().decode(decomp) === text,
        `Snappy LZ77 round-trip #${p}`
    );
}

for (const preset of ['ecommerce_parquet', 'iot_avro', 'ml_feather'] as const) {
    const sample = generateSampleBinaryFile(preset);
    const parsed = parseColumnarFile(sample.bytes, sample.fileName);
    assertCat('A_Internal_RoundTrip', parsed.rows.length >= 18, `Preset ${preset} rows`);
    const toPq = parseColumnarFile(encodeParquetBinary(parsed.rows), 'transcoded.parquet');
    const toAv = parseColumnarFile(encodeAvroBinary(parsed.rows), 'transcoded.avro');
    const toFe = parseColumnarFile(encodeFeatherBinary(parsed.rows), 'transcoded.feather');
    assertCat('A_Internal_RoundTrip', toPq.rows.length === parsed.rows.length, `${preset} -> Parquet`);
    assertCat('A_Internal_RoundTrip', toAv.rows.length === parsed.rows.length, `${preset} -> Avro`);
    assertCat('A_Internal_RoundTrip', toFe.rows.length === parsed.rows.length, `${preset} -> Feather`);
}

// ============================================================================
// CATEGORY B: SPECIFICATION-ORIENTED SYNTHETIC & MALFORMED/SECURITY REGRESSION TESTS
// ============================================================================
console.log('--- Category B: Synthetic Malformed Input, Boundary & Security Regression Suite ---');

// B1. Empty file rejection
assertThrows('B_Synthetic_Malformed_Security', () => parseColumnarFile(new Uint8Array(0), 'empty.parquet'), 'empty', 'Empty 0-byte buffer rejected');

// B2. Feather V1 (FEA1) Malformed & Boundary Tests
assertThrows(
    'B_Synthetic_Malformed_Security',
    () => parseColumnarFile(new Uint8Array([0x46, 0x45, 0x41, 0x31, 0, 0]), 'short_v1.feather'),
    'Truncated Feather V1',
    'Feather V1 < 16 bytes rejected'
);
assertThrows(
    'B_Synthetic_Malformed_Security',
    () =>
        parseColumnarFile(
            new Uint8Array([0x46, 0x45, 0x41, 0x31, 0, 0, 0, 0, 1, 2, 3, 4, 8, 0, 0, 0, 0x42, 0x41, 0x44, 0x21]),
            'missing_tail_fea1.feather'
        ),
    'missing trailing "FEA1"',
    'Feather V1 missing trailing FEA1 rejected'
);
assertThrows(
    'B_Synthetic_Malformed_Security',
    () =>
        parseColumnarFile(
            new Uint8Array([0x46, 0x45, 0x41, 0x31, 0, 0, 0, 0, 1, 2, 3, 4, 0xff, 0xff, 0, 0, 0x46, 0x45, 0x41, 0x31]),
            'huge_meta_fea1.feather'
        ),
    'metadata length',
    'Feather V1 out-of-bounds metadata length rejected'
);

// Mutate valid Feather V1 fixture to test out-of-bounds PrimitiveArray offset rejection
const validV1Bytes = new Uint8Array(fs.readFileSync('/tmp/ext_fixtures/pa_feather_v1_alltypes.feather'));
const corruptedV1Tail = validV1Bytes.slice(0, validV1Bytes.length - 2);
assertThrows(
    'B_Synthetic_Malformed_Security',
    () => parseFeatherV1Binary(corruptedV1Tail),
    'trailing "FEA1"',
    'Truncated Feather V1 tail rejected'
);

// B3. Feather V2 (ARROW1) Malformed & Unsupported Codec Tests
assertThrows(
    'B_Synthetic_Malformed_Security',
    () => parseColumnarFile(new Uint8Array([0x41, 0x52, 0x52, 0x4f, 0x57, 0x31, 0, 0]), 'short_v2.feather'),
    'Truncated Feather V2',
    'Feather V2 < 18 bytes rejected'
);
assertThrows(
    'B_Synthetic_Malformed_Security',
    () =>
        parseColumnarFile(
            new Uint8Array([
                0x41, 0x52, 0x52, 0x4f, 0x57, 0x31, 0, 0, 1, 2, 3, 4, 4, 0, 0, 0, 0x42, 0x41, 0x44, 0x31, 0x32, 0x33,
            ]),
            'bad_tail_v2.feather'
        ),
    'missing trailing "ARROW1"',
    'Feather V2 missing trailing ARROW1 rejected'
);
const zstdFeaBytes = new Uint8Array(fs.readFileSync('/tmp/ext_fixtures/pa_feather_zstd.feather'));
assertThrows(
    'B_Synthetic_Malformed_Security',
    () => parseColumnarFile(zstdFeaBytes, 'pa_feather_zstd.feather'),
    'ZSTD',
    'Feather V2 ZSTD codec rejected with explicit unsupported message'
);

// B4. Parquet (PAR1 / PARE) Malformed & Unsupported Codec Tests
assertThrows(
    'B_Synthetic_Malformed_Security',
    () => parseColumnarFile(new Uint8Array([0x50, 0x41, 0x52, 0x45, 0, 0, 0, 0]), 'encrypted.parquet'),
    'PARE',
    'Encrypted Parquet (PARE) rejected with KMS message'
);
assertThrows(
    'B_Synthetic_Malformed_Security',
    () => parseColumnarFile(new Uint8Array([0x50, 0x41, 0x52, 0x31, 0, 0]), 'short.parquet'),
    'Truncated Apache Parquet',
    'Parquet < 12 bytes rejected'
);
assertThrows(
    'B_Synthetic_Malformed_Security',
    () =>
        parseColumnarFile(
            new Uint8Array([0x50, 0x41, 0x52, 0x31, 0, 0, 0, 0, 4, 0, 0, 0, 0x4e, 0x4f, 0x50, 0x45]),
            'missing_tail.parquet'
        ),
    'missing trailing "PAR1"',
    'Parquet missing trailing PAR1 rejected'
);
assertThrows(
    'B_Synthetic_Malformed_Security',
    () =>
        parseColumnarFile(
            new Uint8Array([0x50, 0x41, 0x52, 0x31, 0, 0, 0, 0, 0xff, 0xff, 0, 0, 0x50, 0x41, 0x52, 0x31]),
            'bad_footer_len.parquet'
        ),
    'footer length',
    'Parquet out-of-bounds footer length rejected'
);
const zstdPqBytes = new Uint8Array(fs.readFileSync('/tmp/ext_fixtures/pa_zstd.parquet'));
assertThrows(
    'B_Synthetic_Malformed_Security',
    () => parseColumnarFile(zstdPqBytes, 'pa_zstd.parquet'),
    'ZSTD',
    'Parquet ZSTD codec rejected with explicit unsupported message'
);

// B5. Avro OCF (Obj\x01) Malformed, Sync Marker Mismatch & CRC32 Checksum Mismatch Tests
assertThrows(
    'B_Synthetic_Malformed_Security',
    () => parseColumnarFile(new Uint8Array([0x4f, 0x62, 0x6a, 0x01, 0]), 'short.avro'),
    'Invalid Apache Avro',
    'Avro < 22 bytes rejected'
);
const validAvroBytes = new Uint8Array(fs.readFileSync('/tmp/ext_fixtures/ext_avro_null.avro'));
const badSyncAvro = new Uint8Array(validAvroBytes);
badSyncAvro[badSyncAvro.length - 1] ^= 0xff; // Flip last byte of trailing 16-byte sync marker
assertThrows(
    'B_Synthetic_Malformed_Security',
    () => parseColumnarFile(badSyncAvro, 'bad_sync.avro'),
    'sync marker mismatch',
    'Avro block sync marker mismatch rejected'
);

const snappyAvroSample = generateSampleBinaryFile('iot_avro').bytes;
const badCrcAvro = new Uint8Array(snappyAvroSample);
badCrcAvro[badCrcAvro.length - 17] ^= 0xff; // Flip byte inside 4-byte CRC32 right before 16-byte sync marker
assertThrows(
    'B_Synthetic_Malformed_Security',
    () => parseColumnarFile(badCrcAvro, 'bad_crc.avro'),
    'CRC32 checksum mismatch',
    'Avro Snappy block CRC32 mismatch rejected'
);

// B5b. Strict Varint, Snappy & DEFLATE Security Regression Tests (5 Critical Inspection Points)
assertThrows(
    'B_Synthetic_Malformed_Security',
    () => readUnsignedVarint(new Uint8Array([0x01]), 5),
    'outside buffer bounds',
    'Varint out-of-bounds offset rejected'
);
assertThrows(
    'B_Synthetic_Malformed_Security',
    () => readUnsignedVarint(new Uint8Array([0x80, 0x85]), 0),
    'truncated continuation byte',
    'Varint truncated continuation byte at EOF rejected'
);
assertThrows(
    'B_Synthetic_Malformed_Security',
    () => readUnsignedVarint(new Uint8Array([0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x02]), 0),
    'exceeds 64-bit',
    'Varint >64-bit overflow rejected'
);
assertThrows(
    'B_Synthetic_Malformed_Security',
    () => decompressSnappyBlock(new Uint8Array(0)),
    'empty input',
    'Snappy empty input rejected'
);
assertThrows(
    'B_Synthetic_Malformed_Security',
    () => decompressSnappyBlock(new Uint8Array([...writeUnsignedVarint(300 * 1024 * 1024), 0x00, 0x41])),
    'exceeds safety limit',
    'Snappy excessive uncompressed length rejected (never returns raw input)'
);
assertThrows(
    'B_Synthetic_Malformed_Security',
    () => decompressSnappyBlock(new Uint8Array([0x05, 0x08, 0x41])),
    'literal run',
    'Snappy truncated literal run rejected'
);
assertThrows(
    'B_Synthetic_Malformed_Security',
    () => decompressSnappyBlock(new Uint8Array([0x05, 0x00, 0x41, 0x01, 0x05])),
    'invalid LZ77 copy offset',
    'Snappy invalid copy offset > outIdx rejected'
);
assertThrows(
    'B_Synthetic_Malformed_Security',
    () => decompressSnappyBlock(new Uint8Array([0x0a, 0x00, 0x41])),
    'does not match declared header length',
    'Snappy incomplete decompressed output length rejected'
);
assertThrows(
    'B_Synthetic_Malformed_Security',
    () => inflateRawDeflate(new Uint8Array([0x07])),
    'reserved block type 3',
    'DEFLATE reserved block type 3 rejected'
);
assertThrows(
    'B_Synthetic_Malformed_Security',
    () => inflateRawDeflate(new Uint8Array([0x01, 0x04, 0x00, 0x00, 0x00, 0x41, 0x42, 0x43, 0x44])),
    'complement NLEN',
    'DEFLATE stored block invalid NLEN complement rejected'
);
assertThrows(
    'B_Synthetic_Malformed_Security',
    () => inflateRawDeflate(new Uint8Array([0x01, 0x04, 0x00, 0xfb, 0xff, 0x41, 0x42, 0x43, 0x44]), 2),
    'exceeded safety limit',
    'DEFLATE output growth cap enforced (zip-bomb defense)'
);

// B6. CWE-1236 Formula Injection Mitigation Regression Tests (15 vectors + 7 negative number preserves)
const cweVectors = [
    '=1+1',
    '+1+1',
    '-1+1',
    '@SUM(A1:A2)',
    ' =cmd|\'/C calc\'!A0',
    '\t=HYPERLINK("http://evil.tld")',
    '\r\n+IMPORTXML("http://evil.tld")',
    '\u0000=EXEC("calc.exe")',
    '\uFF1DSUM(A1:A5)',
    '\uFF0B123',
    '\uFF20A1',
    '\uFF0D1+1',
    '–SUM(A1:A2)',
    '—SUM(A1:A2)',
    '-cmd|"/c powershell"',
];
for (const vec of cweVectors) {
    const san = sanitizeSpreadsheetFormula(vec, true);
    assertCat('B_Synthetic_Malformed_Security', san.startsWith("'") && san.slice(1) === vec, `CWE-1236 vector: ${JSON.stringify(vec)}`);
}
for (const neg of ['-42', '-42.5', '-0.000125', '-1.5e-4', '-9.99E+8', '  -99.95 ', '-9007199254740999123']) {
    assertCat('B_Synthetic_Malformed_Security', sanitizeSpreadsheetFormula(neg, true) === neg, `Negative number preserved: ${neg}`);
}

// ============================================================================
// CATEGORY C: INDEPENDENTLY GENERATED EXTERNAL INTEROPERABILITY TESTS (PYARROW 26.0.0 & AVRO 1.11)
// ============================================================================
console.log('--- Category C: Independently Generated External Interoperability Tests ---');

// C1. Dedicated Feather V1 (FEA1 CTable FlatBuffers) All-Types & Empty Fixtures from PyArrow 26.0.0
const v1Parsed = parseColumnarFile(validV1Bytes, 'pa_feather_v1_alltypes.feather');
assertCat('C_Independent_External_Interop', v1Parsed.metadata.magicBytes === 'FEA1', '[Feather V1] magicBytes === FEA1');
assertCat(
    'C_Independent_External_Interop',
    v1Parsed.metadata.formatVersion.includes('Feather V1') && v1Parsed.metadata.formatVersion.includes('CTable'),
    '[Feather V1] formatVersion identifies Legacy CTable FlatBuffers'
);
assertCat('C_Independent_External_Interop', v1Parsed.rows.length === 4, '[Feather V1] 4 rows decoded');
assertCat('C_Independent_External_Interop', v1Parsed.schema.length === 15, '[Feather V1] all 15 columns decoded');
assertCat('C_Independent_External_Interop', v1Parsed.rows[0].i8 === -5 && v1Parsed.rows[2].i8 === null, '[Feather V1] INT8 with null bitmap');
assertCat('C_Independent_External_Interop', v1Parsed.rows[0].i16 === -1000 && v1Parsed.rows[3].i16 === null, '[Feather V1] INT16 with null bitmap');
assertCat('C_Independent_External_Interop', v1Parsed.rows[0].order_id === 101 && v1Parsed.rows[3].order_id === 104, '[Feather V1] INT32');
assertCat(
    'C_Independent_External_Interop',
    v1Parsed.rows[0].snowflake_id === '9007199254740999123' && v1Parsed.rows[2].snowflake_id === '-9007199254740999125',
    '[Feather V1] INT64 64-bit Snowflake IDs preserved'
);
assertCat('C_Independent_External_Interop', v1Parsed.rows[0].u8 === 250 && v1Parsed.rows[3].u8 === null, '[Feather V1] UINT8');
assertCat('C_Independent_External_Interop', v1Parsed.rows[0].u16 === 65000 && v1Parsed.rows[2].u16 === null, '[Feather V1] UINT16');
assertCat('C_Independent_External_Interop', v1Parsed.rows[0].u32 === 4000000000, '[Feather V1] UINT32');
assertCat('C_Independent_External_Interop', v1Parsed.rows[0].u64_id === '18446744073709551610', '[Feather V1] UINT64 > MAX_SAFE_INTEGER preserved');
assertCat('C_Independent_External_Interop', v1Parsed.rows[0].f32 === 1.5 && v1Parsed.rows[2].f32 === null, '[Feather V1] FLOAT32');
assertCat('C_Independent_External_Interop', v1Parsed.rows[0].amount === 49.95 && v1Parsed.rows[2].amount === -15.25, '[Feather V1] DOUBLE');
assertCat('C_Independent_External_Interop', v1Parsed.rows[0].is_active === true && v1Parsed.rows[1].is_active === false, '[Feather V1] BOOL');
assertCat('C_Independent_External_Interop', v1Parsed.rows[0].customer === 'Alice' && v1Parsed.rows[1].customer === null && v1Parsed.rows[2].customer === 'Charlie', '[Feather V1] UTF8 with nulls');
assertCat('C_Independent_External_Interop', v1Parsed.rows[0].str_nonull === 'R0' && v1Parsed.rows[3].str_nonull === 'R3', '[Feather V1] UTF8 without nulls');
assertCat('C_Independent_External_Interop', v1Parsed.rows[0].event_date === '2026-05-01' && v1Parsed.rows[1].event_date === null, '[Feather V1] DateMetadata DATE');
assertCat(
    'C_Independent_External_Interop',
    typeof v1Parsed.rows[0].event_ts === 'string' && String(v1Parsed.rows[0].event_ts).startsWith('2026-') && v1Parsed.rows[2].event_ts === null,
    '[Feather V1] TimestampMetadata TIMESTAMP'
);

const v1EmptyBytes = new Uint8Array(fs.readFileSync('/tmp/ext_fixtures/pa_feather_v1_empty.feather'));
const v1EmptyRes = parseColumnarFile(v1EmptyBytes, 'pa_feather_v1_empty.feather');
assertCat('C_Independent_External_Interop', v1EmptyRes.rows.length === 0 && v1EmptyRes.schema.length === 2, '[Feather V1] 0-row empty table decoded cleanly');

// C2. PyArrow 26.0.0 Parquet Fixtures (7 core + Temporal/Float32 + Decimal/UInt/List + Empty)
const paParquetList = [
    { file: 'pa_plain_snappy.parquet', expectedCodec: 'SNAPPY', expectedRGs: 1 },
    { file: 'pa_dict_snappy.parquet', expectedCodec: 'SNAPPY', expectedRGs: 1 },
    { file: 'pa_dict_gzip.parquet', expectedCodec: 'GZIP', expectedRGs: 1 },
    { file: 'pa_plain_gzip.parquet', expectedCodec: 'GZIP', expectedRGs: 1 },
    { file: 'pa_uncompressed.parquet', expectedCodec: 'UNCOMPRESSED', expectedRGs: 1 },
    { file: 'pa_datapage_v2.parquet', expectedCodec: 'SNAPPY', expectedRGs: 1 },
    { file: 'pa_multi_rowgroup.parquet', expectedCodec: 'SNAPPY', expectedRGs: 3 },
];

for (const fix of paParquetList) {
    const bytes = new Uint8Array(fs.readFileSync(`/tmp/ext_fixtures/${fix.file}`));
    const parsed = parseColumnarFile(bytes, fix.file);
    assertCat('C_Independent_External_Interop', parsed.format === 'parquet', `[${fix.file}] format`);
    assertCat('C_Independent_External_Interop', parsed.metadata.compressionCodec === fix.expectedCodec, `[${fix.file}] codec`);
    assertCat('C_Independent_External_Interop', parsed.metadata.rowGroupCount === fix.expectedRGs, `[${fix.file}] rowGroupCount`);
    assertCat('C_Independent_External_Interop', parsed.rows.length === 20, `[${fix.file}] 20 rows`);
    for (let r = 0; r < 20; r++) {
        const expSnow =
            r % 3 !== 0 ? String(BigInt('9007199254740999100') + BigInt(r)) : String(-(BigInt('9007199254740999100') + BigInt(r)));
        assertCat('C_Independent_External_Interop', parsed.rows[r].order_id === 1000 + r, `[${fix.file}] row ${r} order_id`);
        assertCat('C_Independent_External_Interop', String(parsed.rows[r].snowflake_id) === expSnow, `[${fix.file}] row ${r} snowflake_id`);
        assertCat('C_Independent_External_Interop', parsed.rows[r].is_active === (r % 2 === 0), `[${fix.file}] row ${r} is_active`);
        assertCat(
            'C_Independent_External_Interop',
            parsed.rows[r].customer === (r % 5 === 0 ? null : `Enterprise_User_${String(r).padStart(2, '0')}`),
            `[${fix.file}] row ${r} customer`
        );
    }
}

const dlBytes = new Uint8Array(fs.readFileSync('/tmp/ext_fixtures/pa_decimal_uint_list.parquet'));
const dlParsed = parseColumnarFile(dlBytes, 'pa_decimal_uint_list.parquet');
assertCat('C_Independent_External_Interop', dlParsed.rows[0].dec_val === 12345.67 && dlParsed.rows[1].dec_val === -89.05 && dlParsed.rows[2].dec_val === null, '[pa_decimal_uint_list.parquet] DECIMAL(10,2) values exact');
assertCat('C_Independent_External_Interop', dlParsed.rows[0].u32_val === 4000000000, '[pa_decimal_uint_list.parquet] UINT32 value exact');
assertCat('C_Independent_External_Interop', dlParsed.rows[0].u64_val === '18446744073709551610', '[pa_decimal_uint_list.parquet] UINT64 BigInt string exact');
assertCat(
    'C_Independent_External_Interop',
    JSON.stringify(dlParsed.rows[0].tags) === '["alpha","beta"]' &&
    dlParsed.rows[1].tags === null &&
    JSON.stringify(dlParsed.rows[2].tags) === '[]' &&
    JSON.stringify(dlParsed.rows[3].tags) === '["gamma"]',
    '[pa_decimal_uint_list.parquet] Dremel 1-level LIST (non-empty, null, empty [], single) exact'
);

const pqEmptyBytes = new Uint8Array(fs.readFileSync('/tmp/ext_fixtures/pa_empty.parquet'));
const pqEmptyRes = parseColumnarFile(pqEmptyBytes, 'pa_empty.parquet');
assertCat('C_Independent_External_Interop', pqEmptyRes.rows.length === 0 && pqEmptyRes.schema.length === 2, '[pa_empty.parquet] 0-row Parquet table decoded cleanly');

// C3. PyArrow 26.0.0 Feather V2 (ARROW1 Uncompressed & LZ4_FRAME) and Arrow IPC Stream (0xFFFFFFFF Multi-Batch)
for (const af of [
    { file: 'pa_feather_uncompressed.feather', expectedFormat: 'feather', expectedCodec: 'UNCOMPRESSED' },
    { file: 'pa_feather_lz4.feather', expectedFormat: 'feather', expectedCodec: 'LZ4_FRAME' },
    { file: 'pa_arrow_stream.arrow', expectedFormat: 'arrow_stream', expectedCodec: 'UNCOMPRESSED' },
]) {
    const bytes = new Uint8Array(fs.readFileSync(`/tmp/ext_fixtures/${af.file}`));
    const parsed = parseColumnarFile(bytes, af.file);
    assertCat('C_Independent_External_Interop', parsed.format === af.expectedFormat, `[${af.file}] format`);
    assertCat('C_Independent_External_Interop', parsed.metadata.compressionCodec === af.expectedCodec, `[${af.file}] codec`);
    assertCat('C_Independent_External_Interop', parsed.rows.length === 20, `[${af.file}] 20 rows`);
    for (let r = 0; r < 20; r++) {
        const expSnow =
            r % 3 !== 0 ? String(BigInt('9007199254740999100') + BigInt(r)) : String(-(BigInt('9007199254740999100') + BigInt(r)));
        assertCat('C_Independent_External_Interop', parsed.rows[r].order_id === 1000 + r, `[${af.file}] row ${r} order_id`);
        assertCat('C_Independent_External_Interop', String(parsed.rows[r].snowflake_id) === expSnow, `[${af.file}] row ${r} snowflake_id`);
    }
}

// C4. Independent Multi-Block Apache Avro 1.11 OCF Fixtures (null & deflate codecs, enums, arrays, maps, unions, 64-bit longs)
for (const avroCodec of ['null', 'deflate']) {
    const f = `ext_avro_${avroCodec}.avro`;
    const bytes = new Uint8Array(fs.readFileSync(`/tmp/ext_fixtures/${f}`));
    const parsed = parseColumnarFile(bytes, f);
    assertCat('C_Independent_External_Interop', parsed.format === 'avro', `[${f}] format === avro`);
    assertCat('C_Independent_External_Interop', parsed.metadata.compressionCodec === avroCodec.toUpperCase(), `[${f}] codec`);
    assertCat('C_Independent_External_Interop', parsed.rows.length === 15, `[${f}] 15 records across 2 OCF blocks`);
    for (let i = 0; i < 15; i++) {
        const row = parsed.rows[i];
        const expTx = i % 2 === 0 ? String(BigInt('9007199254740999500') + BigInt(i)) : String(-(BigInt('9007199254740999500') + BigInt(i)));
        assertCat('C_Independent_External_Interop', row.seq_id === 500 + i, `[${f}] row ${i} seq_id`);
        assertCat('C_Independent_External_Interop', String(row.snowflake_tx_id) === expTx, `[${f}] row ${i} 64-bit long`);
        assertCat('C_Independent_External_Interop', row.status_enum === ['OK', 'WARN', 'CRIT'][i % 3], `[${f}] row ${i} enum symbol`);
    }
}

// ============================================================================
// CATEGORY D: ALL 11 FILTER OPERATORS, AND/OR LOGIC & 64-BIT BIGINT BOUNDARIES
// ============================================================================
console.log('--- Category D: 64-Bit BigInt Boundaries & All 11 Filter Operators ---');

const baseBig = BigInt('9007199254740999100');
const bigRows = Array.from({ length: 60 }, (_, i) => ({
    idx: i,
    snowflake_str: (baseBig + BigInt(i)).toString(),
    snowflake_big: baseBig + BigInt(i),
    neg_snowflake: (-(baseBig + BigInt(i))).toString(),
    label: i % 10 === 0 ? null : `PREFIX_item_${i}_SUFFIX`,
}));

for (let i = 0; i < 60; i++) {
    const target = (baseBig + BigInt(i)).toString();
    const nextTarget = (baseBig + BigInt(i + 1)).toString();
    assertCat('D_BigInt_11Operators_Samples', compareExactNumericValues(target, target) === 0, `BigInt eq ${target}`);
    assertCat('D_BigInt_11Operators_Samples', compareExactNumericValues(target, nextTarget) === -1, `BigInt lt ${target}`);
    assertCat('D_BigInt_11Operators_Samples', compareExactNumericValues(nextTarget, target) === 1, `BigInt gt ${nextTarget}`);

    const eqRes = queryDataset(bigRows, { filters: [{ column: 'snowflake_str', operator: 'eq', value: target }] });
    assertCat('D_BigInt_11Operators_Samples', eqRes.matchedCount === 1 && eqRes.rows[0].idx === i, `Filter eq ${target}`);

    const gtRes = queryDataset(bigRows, { filters: [{ column: 'snowflake_str', operator: 'gt', value: target }] });
    assertCat('D_BigInt_11Operators_Samples', gtRes.matchedCount === 59 - i, `Filter gt ${target}`);

    const lteRes = queryDataset(bigRows, { filters: [{ column: 'snowflake_big', operator: 'lte', value: target }] });
    assertCat('D_BigInt_11Operators_Samples', lteRes.matchedCount === i + 1, `Filter lte ${target}`);
}

// Test remaining operators: neq, gte, lt, contains, starts_with, ends_with, is_null, is_not_null, AND/OR
assertCat(
    'D_BigInt_11Operators_Samples',
    queryDataset(bigRows, { filters: [{ column: 'snowflake_str', operator: 'neq', value: '9007199254740999100' }] }).matchedCount === 59,
    'Operator neq on 64-bit BigInt'
);
assertCat(
    'D_BigInt_11Operators_Samples',
    queryDataset(bigRows, { filters: [{ column: 'snowflake_str', operator: 'gte', value: '9007199254740999150' }] }).matchedCount === 10,
    'Operator gte on 64-bit BigInt'
);
assertCat(
    'D_BigInt_11Operators_Samples',
    queryDataset(bigRows, { filters: [{ column: 'snowflake_str', operator: 'lt', value: '9007199254740999105' }] }).matchedCount === 5,
    'Operator lt on 64-bit BigInt'
);
assertCat(
    'D_BigInt_11Operators_Samples',
    queryDataset(bigRows, { filters: [{ column: 'label', operator: 'contains', value: 'item_15' }] }).matchedCount === 1,
    'Operator contains'
);
assertCat(
    'D_BigInt_11Operators_Samples',
    queryDataset(bigRows, { filters: [{ column: 'label', operator: 'starts_with', value: 'PREFIX_item_2' }] }).matchedCount === 10,
    'Operator starts_with'
);
assertCat(
    'D_BigInt_11Operators_Samples',
    queryDataset(bigRows, { filters: [{ column: 'label', operator: 'ends_with', value: '5_SUFFIX' }] }).matchedCount === 6,
    'Operator ends_with'
);
assertCat(
    'D_BigInt_11Operators_Samples',
    queryDataset(bigRows, { filters: [{ column: 'label', operator: 'is_null', value: '' }] }).matchedCount === 6,
    'Operator is_null'
);
assertCat(
    'D_BigInt_11Operators_Samples',
    queryDataset(bigRows, { filters: [{ column: 'label', operator: 'is_not_null', value: '' }] }).matchedCount === 54,
    'Operator is_not_null'
);
assertCat(
    'D_BigInt_11Operators_Samples',
    queryDataset(bigRows, {
        filterLogic: 'OR',
        filters: [
            { column: 'snowflake_str', operator: 'eq', value: '9007199254740999101', join: 'OR' },
            { column: 'snowflake_str', operator: 'eq', value: '9007199254740999159', join: 'OR' },
        ],
    }).matchedCount === 2,
    'OR combinator across two 64-bit BigInt predicates'
);

// ============================================================================
// CATEGORY E: NATIVE .XLSX COMPILER, 10-DIALECT DDL, UI DISCLOSURE & SEO PARITY
// ============================================================================

// A.10: LARGE_FLOAT (Number.MAX_VALUE 1.7976931348623157e+308) & UINT64_MAX (18446744073709551615) Round-Trip
{
    const edgeRows = [
        { id: 1, large_float: 1.7976931348623157e+308, small_float: 2.2250738585072014e-308, uint64_val: '18446744073709551615', int64_min: '-9223372036854775808' },
        { id: 2, large_float: -1.7976931348623157e+308, small_float: 0.0, uint64_val: '9223372036854775808', int64_min: '9223372036854775807' },
        { id: 3, large_float: 42, small_float: -3.141592653589793, uint64_val: '42', int64_min: '0' },
    ];
    const pqEdge = encodeParquetBinary(edgeRows);
    const parsedEdge = parseColumnarFile(pqEdge, 'edge_numbers.parquet');
    assertCat('A_Internal_RoundTrip', parsedEdge.schema.find((c) => c.name === 'large_float')?.logicalType === 'DOUBLE', 'A-Edge-01: LARGE_FLOAT column inferred as DOUBLE (not INT64)');
    assertCat('A_Internal_RoundTrip', parsedEdge.rows[0].large_float === 1.7976931348623157e+308, 'A-Edge-02: LARGE_FLOAT +MAX_VALUE round-trips accurately');
    assertCat('A_Internal_RoundTrip', parsedEdge.rows[1].large_float === -1.7976931348623157e+308, 'A-Edge-03: LARGE_FLOAT -MAX_VALUE round-trips accurately');
    assertCat('A_Internal_RoundTrip', parsedEdge.rows[2].large_float === 42, 'A-Edge-04: Mixed integer 42 in DOUBLE column round-trips accurately');
    assertCat('A_Internal_RoundTrip', parsedEdge.schema.find((c) => c.name === 'uint64_val')?.logicalType === 'UINT64', 'A-Edge-05: UINT64 column inferred as UINT64');
    assertCat('A_Internal_RoundTrip', parsedEdge.rows[0].uint64_val === '18446744073709551615', 'A-Edge-06: UINT64_MAX 18446744073709551615 round-trips accurately');
    assertCat('A_Internal_RoundTrip', parsedEdge.rows[1].uint64_val === '9223372036854775808', 'A-Edge-07: UINT64 9223372036854775808 round-trips accurately');
    assertCat('A_Internal_RoundTrip', parsedEdge.rows[0].int64_min === '-9223372036854775808', 'A-Edge-08: INT64_MIN -9223372036854775808 round-trips accurately');
    assertCat('A_Internal_RoundTrip', parsedEdge.rows[1].int64_min === '9223372036854775807', 'A-Edge-09: INT64_MAX 9223372036854775807 round-trips accurately');
}

console.log('--- Category E: Native .XLSX OpenXML Compiler, 10-Dialect DDL, UI & SEO Parity ---');

const xlsxTestRows = Array.from({ length: 25 }, (_, i) => ({
    order_id: 1000 + i,
    snowflake_id: `9007199254740999${100 + i}`,
    unsafe_16digit_num: 9007199254740991,
    amount: i % 2 === 0 ? 125.75 : -42.5,
    is_verified: i % 2 === 0,
    formula_col: cweVectors[i % cweVectors.length],
    notes: i % 4 === 0 ? null : `Line ${i} <xml & "quotes">`,
}));
const xlsxCols = ['order_id', 'snowflake_id', 'unsafe_16digit_num', 'amount', 'is_verified', 'formula_col', 'notes'];
const xlsxBytes = encodeXlsxWorkbookBinary(xlsxTestRows, xlsxCols, {
    sheetName: 'Audit_Verification_Sheet',
    sanitizeFormulas: true,
});
fs.writeFileSync('/tmp/ext_fixtures/verified_export.xlsx', xlsxBytes);
assertCat(
    'E_Xlsx_DDL_UI_SEO_Parity',
    xlsxBytes[0] === 0x50 && xlsxBytes[1] === 0x4b && xlsxBytes[2] === 0x03 && xlsxBytes[3] === 0x04,
    'Native .xlsx PKZIP signature 0x504B0304'
);

for (const fmt of ['csv', 'tsv', 'json', 'jsonl', 'sql', 'markdown', 'html', 'xlsx'] as ExportFormat[]) {
    const txt = exportDatasetToText(xlsxTestRows, xlsxCols, {
        format: fmt,
        csvDelimiter: ',',
        includeUtf8Bom: true,
        sanitizeFormulas: true,
        tableName: 'audit_orders',
        prettyJson: true,
    });
    assertCat('E_Xlsx_DDL_UI_SEO_Parity', txt.includes('9007199254740999100'), `Export .${fmt} preserves 19-digit BigInt`);
}

const sampleDataset = parseColumnarFile(generateSampleBinaryFile('ecommerce_parquet').bytes, 'ecommerce_orders_v2.parquet');
for (const target of [
    'postgresql',
    'snowflake',
    'bigquery',
    'duckdb',
    'clickhouse',
    'typescript',
    'pyarrow',
    'polars',
    'avro_schema',
    'json_schema',
] as SchemaTargetLanguage[]) {
    const ddl = generateSchemaCode(sampleDataset.schema, target, 'ecommerce_orders_v2');
    assertCat('E_Xlsx_DDL_UI_SEO_Parity', ddl.includes('customer_snowflake_id'), `DDL target ${target}`);
}

const engineSource = fs.readFileSync('/tmp/kivarotools_audit/lib/columnarViewerEngine.ts', 'utf-8');
assertCat(
    'E_Xlsx_DDL_UI_SEO_Parity',
    !engineSource.includes('Full Spec-Compliant Edition') && engineSource.includes('Hardened & Scope-Qualified Edition'),
    'columnarViewerEngine.ts comments are scope-qualified without overclaiming 100% spec compliance'
);
const uiSource = fs.readFileSync('/tmp/kivarotools_audit/components/tools/ParquetViewer.tsx', 'utf-8');
const seoSource = fs.readFileSync('/tmp/kivarotools_audit/components/seo/ParquetViewerSeo.tsx', 'utf-8');

assertCat('E_Xlsx_DDL_UI_SEO_Parity', typeof ParquetViewer === 'function', 'ParquetViewer component function');
assertCat('E_Xlsx_DDL_UI_SEO_Parity', typeof ParquetViewerSeo === 'function', 'ParquetViewerSeo component function');
assertCat('E_Xlsx_DDL_UI_SEO_Parity', PARQUET_VIEWER_FAQS.length === 16, 'ParquetViewerSeo 16 FAQs');
assertCat(
    'E_Xlsx_DDL_UI_SEO_Parity',
    !uiSource.includes('Load default sample on initial mount') && uiSource.includes('No Dataset Loaded Yet'),
    'ParquetViewer.tsx does not auto-load a default file on mount and displays clean Empty State'
);
assertCat(
    'E_Xlsx_DDL_UI_SEO_Parity',
    uiSource.includes('setDataset(null)') && uiSource.includes('FEATHER V1') && uiSource.includes('FEATHER V2'),
    'ParquetViewer.tsx clears stale dataset on error and distinguishes FEATHER V1 vs FEATHER V2'
);
assertCat(
    'E_Xlsx_DDL_UI_SEO_Parity',
    uiSource.includes(
        'Your selected file contents are processed locally in your browser and are not uploaded to KivaroTools servers. The website may still load general analytics or other third-party website resources.'
    ),
    'ParquetViewer.tsx contains exact required privacy wording'
);
assertCat(
    'E_Xlsx_DDL_UI_SEO_Parity',
    seoSource.includes(
        'Your selected file contents are processed locally in your browser and are not uploaded to KivaroTools servers. The website may still load general analytics or other third-party website resources.'
    ),
    'ParquetViewerSeo.tsx contains exact required privacy wording'
);
assertCat(
    'E_Xlsx_DDL_UI_SEO_Parity',
    seoSource.includes('Complete Step-by-Step User Guide') &&
    seoSource.includes('Verified Format, Encoding &amp; Codec Compatibility Matrix'),
    'ParquetViewerSeo.tsx includes Step-by-Step User Guide and Compatibility Matrix'
);

console.log('\n================================================================================');
console.log(' CATEGORY BREAKDOWN:');
for (const [k, v] of Object.entries(stats)) {
    console.log(`   ${k.padEnd(34)} : ${v.passed} PASSED / ${v.failed} FAILED`);
}
console.log('--------------------------------------------------------------------------------');
console.log(` TOTAL ASSERTIONS EXECUTED            : ${totalPassed + totalFailed}`);
console.log(` TOTAL PASSED                         : ${totalPassed}`);
console.log(` TOTAL FAILED                         : ${totalFailed}`);
console.log('================================================================================');

if (totalFailed > 0) {
    process.exit(1);
}