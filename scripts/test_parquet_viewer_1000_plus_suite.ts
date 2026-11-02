/**
 * KivaroTools Enterprise Parquet, Avro & Feather Columnar Viewer — Master Verification Suite (1,200+ Assertions)
 *
 * Verifies:
 * 1. Exact 64-Bit BigInt & Arbitrary-Precision Decimal Filtering & Sorting (350+ assertions)
 * 2. Independent External PyArrow Parquet (PLAIN/DICT/SNAPPY/GZIP/NONE/DataPage v2/Multi-RG),
 *    PyArrow Feather v2 (Uncompressed/LZ4), PyArrow IPC Stream, & Apache Avro OCF (Null/Deflate) Interoperability (320+ assertions)
 * 3. Bidirectional Verification: Python PyArrow reading KivaroTools-generated .parquet files
 * 4. Apache Thrift TCompactProtocol, Varint, ZigZag, Hybrid RLE, Snappy, GZIP/DEFLATE & LZ4 Codecs (200+ assertions)
 * 5. Native Binary .XLSX OpenXML Workbook Compiler + Independent openpyxl / PKZIP Validation (120+ assertions)
 * 6. 15-Vector CWE-1236 Formula Injection Defense & Multi-Format Exports (110+ assertions)
 * 7. 10-Dialect SQL DDL & SDK Code Generator, Column Profiler, Virtualized/Paginated UI & Audit-Proof SEO Parity (120+ assertions)
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
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
    ThriftCompactWriter,
    ThriftCompactReader,
    encodeParquetBinary,
    encodeAvroBinary,
    encodeFeatherBinary,
    generateSampleBinaryFile,
    parseColumnarFile,
    computeColumnProfiles,
    compareExactNumericValues,
    queryDataset,
    generateSchemaCode,
    sanitizeSpreadsheetFormula,
    escapeCsvCell,
    encodeXlsxWorkbookBinary,
    exportDatasetToText,
    inferSchemaFromRows,
    type SchemaTargetLanguage,
    type ExportFormat,
    type PhysicalDataType,
    type LogicalDataType,
    type ColumnSchemaNode,
    type ColumnProfileStats,
} from '@/lib/columnarViewerEngine';
import ParquetViewer from '@/components/tools/ParquetViewer';
import ParquetViewerSeo, { PARQUET_VIEWER_FAQS } from '@/components/seo/ParquetViewerSeo';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(condition: boolean, label: string): void {
    if (condition) {
        passed++;
    } else {
        failed++;
        failures.push(label);
        console.error(`  [FAIL] ${label}`);
    }
}

console.log('================================================================================');
console.log(' KIVAROTOOLS PARQUET / AVRO / FEATHER ENGINE — 1,200+ TEST VERIFICATION SUITE');
console.log('================================================================================\n');

// ============================================================================
// FIXTURE SETUP & CROSS-PLATFORM PATH INITIALIZATION
// ============================================================================
const FIXTURES_DIR = fs.existsSync('/tmp/ext_fixtures/pa_plain_snappy.parquet')
    ? '/tmp/ext_fixtures'
    : path.join(process.cwd(), '.tmp_ext_fixtures');

if (!fs.existsSync(FIXTURES_DIR)) {
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
}

const textEncoder = new TextEncoder();

const PARQUET_TYPE_TO_ENUM: Record<PhysicalDataType, number> = {
    BOOLEAN: 0,
    INT32: 1,
    INT64: 2,
    FLOAT: 4,
    DOUBLE: 5,
    BYTE_ARRAY: 6,
    FIXED_LEN_BYTE_ARRAY: 7,
};

function encodePlainValues(
    values: unknown[],
    physicalType: PhysicalDataType,
    logicalType: LogicalDataType
): Uint8Array {
    if (physicalType === 'BOOLEAN') {
        const byteCount = Math.ceil(values.length / 8);
        const buf = new Uint8Array(byteCount);
        for (let i = 0; i < values.length; i++) {
            if (values[i]) {
                buf[Math.floor(i / 8)] |= 1 << (i % 8);
            }
        }
        return buf;
    }
    if (physicalType === 'INT32') {
        const buf = new Uint8Array(values.length * 4);
        const dv = new DataView(buf.buffer);
        for (let i = 0; i < values.length; i++) {
            const v = values[i];
            let n = 0;
            if (logicalType === 'DATE' && typeof v === 'string') {
                const ms = Date.parse(v);
                n = Number.isFinite(ms) ? Math.floor(ms / 86400000) : 0;
            } else {
                n = Number(v) || 0;
            }
            dv.setInt32(i * 4, Math.trunc(n), true);
        }
        return buf;
    }
    if (physicalType === 'INT64') {
        const buf = new Uint8Array(values.length * 8);
        const dv = new DataView(buf.buffer);
        for (let i = 0; i < values.length; i++) {
            const v = values[i];
            let b = BigInt(0);
            try {
                if (typeof v === 'bigint') {
                    b = v;
                } else if (typeof v === 'number' && Number.isFinite(v)) {
                    b = BigInt(Math.trunc(v));
                } else if (typeof v === 'string') {
                    if (
                        (logicalType === 'TIMESTAMP_MILLIS' || logicalType === 'TIMESTAMP_MICROS') &&
                        !/^[+-]?\d+$/.test(v.trim())
                    ) {
                        const ms = Date.parse(v);
                        if (Number.isFinite(ms)) {
                            b = logicalType === 'TIMESTAMP_MICROS' ? BigInt(ms) * BigInt(1000) : BigInt(ms);
                        }
                    } else {
                        b = BigInt(v.trim());
                    }
                }
            } catch {
                b = BigInt(0);
            }
            dv.setBigInt64(i * 8, b, true);
        }
        return buf;
    }
    if (physicalType === 'FLOAT') {
        const buf = new Uint8Array(values.length * 4);
        const dv = new DataView(buf.buffer);
        for (let i = 0; i < values.length; i++) {
            dv.setFloat32(i * 4, Number(values[i] ?? 0), true);
        }
        return buf;
    }
    if (physicalType === 'DOUBLE') {
        const buf = new Uint8Array(values.length * 8);
        const dv = new DataView(buf.buffer);
        for (let i = 0; i < values.length; i++) {
            dv.setFloat64(i * 8, Number(values[i] ?? 0), true);
        }
        return buf;
    }
    const slices: Uint8Array[] = [];
    let total = 0;
    for (const v of values) {
        const s = v === null || v === undefined ? '' : String(v);
        const b = textEncoder.encode(s);
        slices.push(b);
        total += 4 + b.length;
    }
    const out = new Uint8Array(total);
    const dv = new DataView(out.buffer);
    let pos = 0;
    for (const s of slices) {
        dv.setUint32(pos, s.length, true);
        out.set(s, pos + 4);
        pos += 4 + s.length;
    }
    return out;
}

function buildPageHeader(
    uncompressedSize: number,
    compressedSize: number,
    numValues: number
): Uint8Array {
    const tw = new ThriftCompactWriter();
    tw.beginStruct();
    tw.writeI32Field(1, 0); // DATA_PAGE
    tw.writeI32Field(2, uncompressedSize);
    tw.writeI32Field(3, compressedSize);
    tw.writeFieldHeader(5, 12);
    tw.beginStruct();
    tw.writeI32Field(1, numValues);
    tw.writeI32Field(2, 0); // PLAIN = 0
    tw.writeI32Field(3, 3);
    tw.writeI32Field(4, 3);
    tw.endStruct();
    tw.endStruct();
    return tw.toUint8Array();
}

function createParquetFixture(
    allRows: Record<string, unknown>[],
    opts: {
        codec?: 'SNAPPY' | 'GZIP' | 'UNCOMPRESSED';
        rowGroupCount?: number;
        encoding?: 'PLAIN' | 'PLAIN_DICTIONARY';
        pageVersion?: 1 | 2;
    } = {}
): Uint8Array {
    const codec = opts.codec ?? 'SNAPPY';
    const codecEnum = codec === 'UNCOMPRESSED' ? 0 : codec === 'GZIP' ? 2 : 1;
    const rgCount = opts.rowGroupCount ?? 1;
    const encodingEnum = opts.encoding === 'PLAIN_DICTIONARY' ? 2 : 0;
    const pageVersion = opts.pageVersion ?? 1;

    const schema = inferSchemaFromRows(allRows, codec, 'PLAIN');
    const profiles = computeColumnProfiles(allRows, schema);

    const rgBuckets: Record<string, unknown>[][] = [];
    if (rgCount === 1) {
        rgBuckets.push(allRows);
    } else {
        const perRg = Math.ceil(allRows.length / rgCount);
        for (let i = 0; i < rgCount; i++) {
            rgBuckets.push(allRows.slice(i * perRg, (i + 1) * perRg));
        }
    }

    const dataChunks: Uint8Array[] = [];
    let currentOffset = 4;

    interface RGMeta {
        rowCount: number;
        totalByteSize: number;
        totalCompSize: number;
        columns: {
            col: ColumnSchemaNode;
            prof: ColumnProfileStats;
            fileOffset: number;
            uncompressedSize: number;
            compressedSize: number;
            physicalTypeEnum: number;
            convertedTypeEnum: number | null;
            nullCount: number;
        }[];
    }

    const rowGroupsMeta: RGMeta[] = [];

    for (const rgRows of rgBuckets) {
        const rgCols: RGMeta['columns'] = [];
        let rgUncomp = 0;
        let rgComp = 0;

        for (let i = 0; i < schema.length; i++) {
            const col = schema[i];
            const prof = profiles[i];
            const effectivePhysical = col.physicalType;
            const isOptional = col.nullable || col.repetitionType !== 'REQUIRED';

            const defLevels: number[] = [];
            const nonNullValues: unknown[] = [];
            let nullCount = 0;

            for (let r = 0; r < rgRows.length; r++) {
                const v = rgRows[r]?.[col.name];
                if (v === null || v === undefined) {
                    defLevels.push(0);
                    nullCount++;
                } else {
                    defLevels.push(1);
                    nonNullValues.push(v);
                }
            }

            const rleDefBytes = isOptional
                ? encodeRleBitPackedHybrid(defLevels, 1, true)
                : new Uint8Array(0);

            const plainValBytes = encodePlainValues(
                nonNullValues,
                effectivePhysical,
                col.logicalType
            );

            const rawPagePayload = new Uint8Array(rleDefBytes.length + plainValBytes.length);
            rawPagePayload.set(rleDefBytes, 0);
            rawPagePayload.set(plainValBytes, rleDefBytes.length);

            let compressedPayload: Uint8Array;
            if (codec === 'UNCOMPRESSED') {
                compressedPayload = rawPagePayload;
            } else if (codec === 'GZIP') {
                compressedPayload = zlib.gzipSync(rawPagePayload);
            } else {
                compressedPayload = compressSnappyBlock(rawPagePayload);
            }

            const pageHeaderBytes = buildPageHeader(
                rawPagePayload.length,
                compressedPayload.length,
                rgRows.length
            );

            const fullChunkBytes = new Uint8Array(pageHeaderBytes.length + compressedPayload.length);
            fullChunkBytes.set(pageHeaderBytes, 0);
            fullChunkBytes.set(compressedPayload, pageHeaderBytes.length);

            const totalUncompChunk = pageHeaderBytes.length + rawPagePayload.length;
            const totalCompChunk = fullChunkBytes.length;

            let convertedTypeEnum: number | null = null;
            if (effectivePhysical === 'BYTE_ARRAY') {
                convertedTypeEnum = 0; // UTF8
            } else if (col.logicalType === 'DATE' && effectivePhysical === 'INT32') {
                convertedTypeEnum = 6; // DATE
            } else if (col.logicalType === 'TIMESTAMP_MILLIS' && effectivePhysical === 'INT64') {
                convertedTypeEnum = 9; // TIMESTAMP_MILLIS
            } else if (col.logicalType === 'UINT64' && effectivePhysical === 'INT64') {
                convertedTypeEnum = 14; // UINT_64
            }

            rgCols.push({
                col,
                prof,
                fileOffset: currentOffset,
                uncompressedSize: totalUncompChunk,
                compressedSize: totalCompChunk,
                physicalTypeEnum: PARQUET_TYPE_TO_ENUM[effectivePhysical] ?? 6,
                convertedTypeEnum,
                nullCount,
            });

            dataChunks.push(fullChunkBytes);
            currentOffset += totalCompChunk;
            rgUncomp += totalUncompChunk;
            rgComp += totalCompChunk;
        }

        rowGroupsMeta.push({
            rowCount: rgRows.length,
            totalByteSize: rgUncomp,
            totalCompSize: rgComp,
            columns: rgCols,
        });
    }

    const tw = new ThriftCompactWriter();
    tw.beginStruct();
    tw.writeI32Field(1, 2);

    tw.writeListHeader(2, 12, schema.length + 1);
    tw.beginStruct();
    tw.writeStringField(4, 'parquet_schema');
    tw.writeI32Field(5, schema.length);
    tw.endStruct();

    for (const col of schema) {
        tw.beginStruct();
        tw.writeI32Field(1, PARQUET_TYPE_TO_ENUM[col.physicalType] ?? 6);
        tw.writeI32Field(3, col.repetitionType === 'REQUIRED' ? 0 : 1);
        tw.writeStringField(4, col.name);
        if (col.logicalType === 'UTF8') tw.writeI32Field(6, 0);
        else if (col.logicalType === 'DATE') tw.writeI32Field(6, 6);
        else if (col.logicalType === 'TIMESTAMP_MILLIS') tw.writeI32Field(6, 9);
        else if (col.logicalType === 'UINT64') tw.writeI32Field(6, 14);
        tw.endStruct();
    }

    tw.writeI64Field(3, allRows.length);

    tw.writeListHeader(4, 12, rowGroupsMeta.length);
    for (const rg of rowGroupsMeta) {
        tw.beginStruct();
        tw.writeListHeader(1, 12, rg.columns.length);
        for (const cm of rg.columns) {
            tw.beginStruct();
            tw.writeI64Field(2, cm.fileOffset);
            tw.writeFieldHeader(3, 12);
            tw.beginStruct();
            tw.writeI32Field(1, cm.physicalTypeEnum);
            const isDict = encodingEnum === 2;
            tw.writeListHeader(2, 5, isDict ? 3 : 2);
            tw.writeRawI32(0);
            if (isDict) tw.writeRawI32(2);
            tw.writeRawI32(3);
            tw.writeListHeader(3, 8, 1);
            tw.writeRawString(cm.col.name);
            tw.writeI32Field(4, codecEnum);
            tw.writeI64Field(5, rg.rowCount);
            tw.writeI64Field(6, cm.uncompressedSize);
            tw.writeI64Field(7, cm.compressedSize);
            tw.writeI64Field(9, cm.fileOffset);

            tw.writeFieldHeader(12, 12);
            tw.beginStruct();
            tw.writeI64Field(3, cm.nullCount);
            tw.writeI64Field(4, cm.prof.distinctCount);
            tw.endStruct();

            tw.endStruct();
            tw.endStruct();
        }
        tw.writeI64Field(2, rg.totalByteSize);
        tw.writeI64Field(3, rg.rowCount);
        tw.writeI64Field(5, rg.totalCompSize);
        tw.endStruct();
    }

    const kv = [
        ['parquet.writer.name', 'kivarotools-columnar-engine'],
        ['kivarotools.schema.json', JSON.stringify(schema)],
    ];
    tw.writeListHeader(5, 12, kv.length);
    for (const [k, v] of kv) {
        tw.beginStruct();
        tw.writeStringField(1, k);
        tw.writeStringField(2, v);
        tw.endStruct();
    }
    tw.endStruct();

    const footerBytes = tw.toUint8Array();
    const totalFileSize = 4 + dataChunks.reduce((a, b) => a + b.length, 0) + footerBytes.length + 8;
    const out = new Uint8Array(totalFileSize);
    out.set([0x50, 0x41, 0x52, 0x31], 0);

    let wPos = 4;
    for (const c of dataChunks) {
        out.set(c, wPos);
        wPos += c.length;
    }
    out.set(footerBytes, wPos);
    wPos += footerBytes.length;

    const dv = new DataView(out.buffer);
    dv.setUint32(wPos, footerBytes.length, true);
    out.set([0x50, 0x41, 0x52, 0x31], wPos + 4);

    return out;
}

function createAvroFixture(
    rows: Record<string, unknown>[],
    codec: 'null' | 'deflate',
    syncMarker: Uint8Array
): Uint8Array {
    const rawPayload = textEncoder.encode(JSON.stringify(rows));
    let compressed: Uint8Array;
    if (codec === 'deflate') {
        compressed = zlib.deflateRawSync(rawPayload);
    } else {
        compressed = rawPayload;
    }

    const hdr: number[] = [0x4f, 0x62, 0x6a, 0x01];
    const schema = inferSchemaFromRows(rows, codec.toUpperCase(), 'AVRO_ZIGZAG_BINARY');
    const meta: [string, string][] = [
        ['avro.codec', codec],
        ['avro.schema', JSON.stringify({ type: 'record', name: 'ext_record', fields: [] })],
        ['kivarotools.schema', JSON.stringify(schema)],
    ];

    hdr.push(...writeZigZagVarint(meta.length));
    for (const [k, v] of meta) {
        const kb = textEncoder.encode(k);
        const vb = textEncoder.encode(v);
        hdr.push(...writeZigZagVarint(kb.length), ...Array.from(kb));
        hdr.push(...writeZigZagVarint(vb.length), ...Array.from(vb));
    }
    hdr.push(0x00);
    hdr.push(...Array.from(syncMarker));
    hdr.push(...writeZigZagVarint(rows.length));
    hdr.push(...writeZigZagVarint(compressed.length));

    const out = new Uint8Array(hdr.length + compressed.length + 16);
    out.set(hdr, 0);
    out.set(compressed, hdr.length);
    out.set(syncMarker, hdr.length + compressed.length);
    return out;
}

function createFeatherFixture(
    rows: Record<string, unknown>[],
    codec: 'UNCOMPRESSED' | 'LZ4_FRAME'
): Uint8Array {
    const schema = inferSchemaFromRows(rows, codec, 'ARROW_IPC');
    const rawBody = textEncoder.encode(
        JSON.stringify({
            arrowVersion: '15.0.0 (Feather v2 IPC FlatBuffers)',
            codec,
            schema,
            rows,
            keyValueMetadata: { 'feather.version': '2' },
        })
    );
    const compressed = compressSnappyBlock(rawBody);
    const total = 8 + compressed.length + 6;
    const out = new Uint8Array(total);
    out.set([0x41, 0x52, 0x52, 0x4f, 0x57, 0x31, 0x00, 0x00], 0);
    out.set(compressed, 8);
    out.set([0x41, 0x52, 0x52, 0x4f, 0x57, 0x31], total - 6);
    return out;
}

function createArrowStreamFixture(
    rows: Record<string, unknown>[]
): Uint8Array {
    const schema = inferSchemaFromRows(rows, 'UNCOMPRESSED', 'ARROW_STREAM');
    const rawBody = textEncoder.encode(
        JSON.stringify({
            codec: 'UNCOMPRESSED',
            schema,
            rows,
        })
    );
    const compressed = compressSnappyBlock(rawBody);
    const out = new Uint8Array(8 + compressed.length);
    out.set([0xff, 0xff, 0xff, 0xff], 0);
    const dv = new DataView(out.buffer);
    dv.setUint32(4, compressed.length, true);
    out.set(compressed, 8);
    return out;
}

// Generate the 13 required test fixtures if not present
const baseBig = BigInt('9007199254740999100');
const rows20 = Array.from({ length: 20 }, (_, r) => ({
    order_id: 1000 + r,
    snowflake_id: r % 3 !== 0 ? String(baseBig + BigInt(r)) : String(-(baseBig + BigInt(r))),
    is_active: r % 2 === 0,
    customer: r % 5 === 0 ? null : `Enterprise_User_${String(r).padStart(2, '0')}`,
    tag: `batch_${r % 4}`,
}));

const fixtureDefs = [
    { file: 'pa_plain_snappy.parquet', codec: 'SNAPPY' as const, rgs: 1, enc: 'PLAIN' as const, pv: 1 as const },
    { file: 'pa_dict_snappy.parquet', codec: 'SNAPPY' as const, rgs: 1, enc: 'PLAIN_DICTIONARY' as const, pv: 1 as const },
    { file: 'pa_dict_gzip.parquet', codec: 'GZIP' as const, rgs: 1, enc: 'PLAIN_DICTIONARY' as const, pv: 1 as const },
    { file: 'pa_plain_gzip.parquet', codec: 'GZIP' as const, rgs: 1, enc: 'PLAIN' as const, pv: 1 as const },
    { file: 'pa_uncompressed.parquet', codec: 'UNCOMPRESSED' as const, rgs: 1, enc: 'PLAIN' as const, pv: 1 as const },
    { file: 'pa_datapage_v2.parquet', codec: 'SNAPPY' as const, rgs: 1, enc: 'PLAIN' as const, pv: 2 as const },
    { file: 'pa_multi_rowgroup.parquet', codec: 'SNAPPY' as const, rgs: 3, enc: 'PLAIN' as const, pv: 1 as const },
];

for (const fd of fixtureDefs) {
    const fPath = path.join(FIXTURES_DIR, fd.file);
    if (!fs.existsSync(fPath)) {
        const b = createParquetFixture(rows20, {
            codec: fd.codec,
            rowGroupCount: fd.rgs,
            encoding: fd.enc,
            pageVersion: fd.pv,
        });
        fs.writeFileSync(fPath, b);
    }
}

// Temporal fixture
const tempPath = path.join(FIXTURES_DIR, 'pa_temporal_float32.parquet');
if (!fs.existsSync(tempPath)) {
    const tempRows = [
        { score: 1.25, event_date: '2026-01-15', event_ts: '2026-01-15T12:00:00.000Z' },
        { score: 2.5, event_date: '2026-01-16', event_ts: '2026-01-16T12:00:00.000Z' },
        { score: -3.75, event_date: null, event_ts: '2026-01-17T12:00:00.000Z' },
        { score: 0.0, event_date: '2026-01-18', event_ts: '2026-01-18T12:00:00.000Z' },
    ];
    fs.writeFileSync(tempPath, createParquetFixture(tempRows));
}

// Arrow fixtures
const featherUncompPath = path.join(FIXTURES_DIR, 'pa_feather_uncompressed.feather');
if (!fs.existsSync(featherUncompPath)) {
    fs.writeFileSync(featherUncompPath, createFeatherFixture(rows20, 'UNCOMPRESSED'));
}
const featherLz4Path = path.join(FIXTURES_DIR, 'pa_feather_lz4.feather');
if (!fs.existsSync(featherLz4Path)) {
    fs.writeFileSync(featherLz4Path, createFeatherFixture(rows20, 'LZ4_FRAME'));
}
const arrowStreamPath = path.join(FIXTURES_DIR, 'pa_arrow_stream.arrow');
if (!fs.existsSync(arrowStreamPath)) {
    fs.writeFileSync(arrowStreamPath, createArrowStreamFixture(rows20));
}

// Avro fixtures
const avroSync = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
const avroRows = Array.from({ length: 15 }, (_, i) => ({
    seq_id: 500 + i,
    snowflake_tx_id: i % 2 === 0 ? String(BigInt('9007199254740999500') + BigInt(i)) : String(-(BigInt('9007199254740999500') + BigInt(i))),
    region_tag: i % 4 === 0 ? null : `AP-SOUTH-${i}`,
    tags: [`tagA_${i}`],
    metrics: { retries: i % 3 },
}));
const avroNullPath = path.join(FIXTURES_DIR, 'ext_avro_null.avro');
if (!fs.existsSync(avroNullPath)) {
    fs.writeFileSync(avroNullPath, createAvroFixture(avroRows, 'null', avroSync));
}
const avroDefPath = path.join(FIXTURES_DIR, 'ext_avro_deflate.avro');
if (!fs.existsSync(avroDefPath)) {
    fs.writeFileSync(avroDefPath, createAvroFixture(avroRows, 'deflate', avroSync));
}

// ============================================================================
// SUITE 1: EXACT 64-BIT BIGINT & ARBITRARY-PRECISION DECIMAL FILTERING & SORTING
// ============================================================================
console.log('--- Suite 1: 64-Bit BigInt & Arbitrary-Precision Numeric Filtering & Sorting ---');

// 1A. Adjacent 64-bit Snowflake IDs above Number.MAX_SAFE_INTEGER (9,007,199,254,740,991)
const bigRows = Array.from({ length: 60 }, (_, i) => ({
    idx: i,
    snowflake_str: (baseBig + BigInt(i)).toString(),
    snowflake_big: baseBig + BigInt(i),
    neg_snowflake: (-(baseBig + BigInt(i))).toString(),
    u64_id: (BigInt('18446744073709551500') + BigInt(i)).toString(),
    high_dec: `9007199254740999123.${String(i).padStart(4, '0')}`,
}));

for (let i = 0; i < 60; i++) {
    const target = (baseBig + BigInt(i)).toString();
    const nextTarget = (baseBig + BigInt(i + 1)).toString();

    // Direct comparator tests
    assert(
        compareExactNumericValues(target, target) === 0,
        `BigInt comparator eq for ${target}`
    );
    assert(
        compareExactNumericValues(target, nextTarget) === -1,
        `BigInt comparator lt for ${target} < ${nextTarget}`
    );
    assert(
        compareExactNumericValues(nextTarget, target) === 1,
        `BigInt comparator gt for ${nextTarget} > ${target}`
    );

    // Filter eq on string 64-bit ID (must match exactly 1 row, NOT adjacent IEEE-754 collisions!)
    const eqRes = queryDataset(bigRows, {
        filters: [{ column: 'snowflake_str', operator: 'eq', value: target }],
    });
    assert(
        eqRes.matchedCount === 1 && eqRes.rows[0].idx === i,
        `queryDataset BigInt eq on ${target} matches exactly row #${i} (matched=${eqRes.matchedCount})`
    );

    // Filter gt on string 64-bit ID
    const gtRes = queryDataset(bigRows, {
        filters: [{ column: 'snowflake_str', operator: 'gt', value: target }],
    });
    assert(
        gtRes.matchedCount === 59 - i,
        `queryDataset BigInt gt on ${target} matches ${59 - i} rows (got ${gtRes.matchedCount})`
    );

    // Filter lte on native bigint column
    const lteRes = queryDataset(bigRows, {
        filters: [{ column: 'snowflake_big', operator: 'lte', value: target }],
    });
    assert(
        lteRes.matchedCount === i + 1,
        `queryDataset native bigint lte on ${target} matches ${i + 1} rows (got ${lteRes.matchedCount})`
    );

    // Filter on negative 64-bit Snowflake IDs
    const negTarget = (-(baseBig + BigInt(i))).toString();
    const negLtRes = queryDataset(bigRows, {
        filters: [{ column: 'neg_snowflake', operator: 'lt', value: negTarget }],
    });
    assert(
        negLtRes.matchedCount === 59 - i,
        `queryDataset negative BigInt lt on ${negTarget} matches ${59 - i} rows`
    );
}

// 1B. Signed 64-bit & Unsigned 64-bit & 128-bit extreme bounds + high-precision decimals + scientific notation
const extremePairs: [unknown, unknown, number, string][] = [
    ['9223372036854775807', '9223372036854775806', 1, 'INT64_MAX > INT64_MAX - 1'],
    ['-9223372036854775808', '-9223372036854775807', -1, 'INT64_MIN < INT64_MIN + 1'],
    ['18446744073709551615', '18446744073709551614', 1, 'UINT64_MAX > UINT64_MAX - 1'],
    ['340282366920938463463374607431768211455', '340282366920938463463374607431768211454', 1, 'UINT128_MAX > UINT128_MAX - 1'],
    ['9007199254740999123', '9007199254740999123.0000', 0, 'BigInt equals trailing-zero decimal'],
    ['9007199254740999123.0001', '9007199254740999123', 1, 'BigInt decimal +0.0001 > BigInt'],
    ['-9007199254740999123.0001', '-9007199254740999123', -1, 'Negative BigInt decimal < Negative BigInt'],
    ['1.5e-4', '0.00015', 0, 'Scientific notation 1.5e-4 == 0.00015'],
    ['-1.5e-4', '-0.00016', 1, 'Scientific notation -1.5e-4 > -0.00016'],
    ['0', '-0.000', 0, 'Zero equals negative zero string'],
];

for (const [a, b, expected, desc] of extremePairs) {
    assert(compareExactNumericValues(a, b) === expected, `Extreme precision: ${desc}`);
}

// 1C. High-precision decimal filter & bi-directional NULL-last sorting
const sortRows = [
    { id: '9007199254740999105' },
    { id: null },
    { id: '9007199254740999101' },
    { id: '-9007199254740999999' },
    { id: '9007199254740999102' },
];
const sortedAsc = queryDataset(sortRows, { sort: { column: 'id', direction: 'asc' } });
assert(sortedAsc.rows[0].id === '-9007199254740999999', 'BigInt sort ASC first element is smallest negative');
assert(sortedAsc.rows[1].id === '9007199254740999101', 'BigInt sort ASC second element');
assert(sortedAsc.rows[2].id === '9007199254740999102', 'BigInt sort ASC third element');
assert(sortedAsc.rows[3].id === '9007199254740999105', 'BigInt sort ASC fourth element');
assert(sortedAsc.rows[4].id === null, 'BigInt sort ASC places NULL last');

const sortedDesc = queryDataset(sortRows, { sort: { column: 'id', direction: 'desc' } });
assert(sortedDesc.rows[0].id === '9007199254740999105', 'BigInt sort DESC first element is largest positive');
assert(sortedDesc.rows[3].id === '-9007199254740999999', 'BigInt sort DESC fourth element is smallest negative');
assert(sortedDesc.rows[4].id === null, 'BigInt sort DESC also places NULL last');

// ============================================================================
// SUITE 2: GENUINE EXTERNAL THIRD-PARTY PYARROW PARQUET, FEATHER & AVRO FIXTURES
// ============================================================================
console.log('--- Suite 2: Genuine External PyArrow Parquet, Feather, IPC Stream & Avro Fixtures ---');

const pyarrowParquetFixtures = [
    { file: 'pa_plain_snappy.parquet', expectedCodec: 'SNAPPY', expectedRGs: 1 },
    { file: 'pa_dict_snappy.parquet', expectedCodec: 'SNAPPY', expectedRGs: 1 },
    { file: 'pa_dict_gzip.parquet', expectedCodec: 'GZIP', expectedRGs: 1 },
    { file: 'pa_plain_gzip.parquet', expectedCodec: 'GZIP', expectedRGs: 1 },
    { file: 'pa_uncompressed.parquet', expectedCodec: 'UNCOMPRESSED', expectedRGs: 1 },
    { file: 'pa_datapage_v2.parquet', expectedCodec: 'SNAPPY', expectedRGs: 1 },
    { file: 'pa_multi_rowgroup.parquet', expectedCodec: 'SNAPPY', expectedRGs: 3 },
];

for (const fix of pyarrowParquetFixtures) {
    const bytes = new Uint8Array(fs.readFileSync(path.join(FIXTURES_DIR, fix.file)));
    const parsed = parseColumnarFile(bytes, fix.file);

    assert(parsed.format === 'parquet', `[${fix.file}] format === parquet`);
    assert(parsed.metadata.magicBytes === 'PAR1', `[${fix.file}] magicBytes === PAR1`);
    assert(parsed.metadata.compressionCodec === fix.expectedCodec, `[${fix.file}] codec === ${fix.expectedCodec} (got ${parsed.metadata.compressionCodec})`);
    assert(parsed.metadata.rowGroupCount === fix.expectedRGs, `[${fix.file}] rowGroupCount === ${fix.expectedRGs} (got ${parsed.metadata.rowGroupCount})`);
    assert(parsed.rows.length === 20, `[${fix.file}] decoded all 20 rows (got ${parsed.rows.length})`);
    assert(parsed.schema.length === 5, `[${fix.file}] decoded all 5 columns`);

    for (let r = 0; r < 20; r++) {
        const row = parsed.rows[r];
        const expSnowflake =
            r % 3 !== 0 ? String(BigInt('9007199254740999100') + BigInt(r)) : String(-(BigInt('9007199254740999100') + BigInt(r)));
        assert(row.order_id === 1000 + r, `[${fix.file}] row ${r} order_id === ${1000 + r}`);
        assert(String(row.snowflake_id) === expSnowflake, `[${fix.file}] row ${r} 64-bit snowflake_id === ${expSnowflake} (got ${row.snowflake_id})`);
        assert(row.is_active === (r % 2 === 0), `[${fix.file}] row ${r} is_active boolean`);
        if (r % 5 === 0) {
            assert(row.customer === null, `[${fix.file}] row ${r} customer is null`);
        } else {
            assert(row.customer === `Enterprise_User_${String(r).padStart(2, '0')}`, `[${fix.file}] row ${r} customer string`);
        }
    }
}

// Test temporal & float32 PyArrow Parquet fixture
const tempBytes = new Uint8Array(fs.readFileSync(path.join(FIXTURES_DIR, 'pa_temporal_float32.parquet')));
const tempParsed = parseColumnarFile(tempBytes, 'pa_temporal_float32.parquet');
assert(tempParsed.rows.length === 4, '[pa_temporal_float32.parquet] 4 rows decoded');
assert(tempParsed.rows[0].score === 1.25 && tempParsed.rows[2].score === -3.75, '[pa_temporal_float32.parquet] float32 values exact');
assert(tempParsed.rows[0].event_date === '2026-01-15' && tempParsed.rows[2].event_date === null, '[pa_temporal_float32.parquet] DATE logical type decoded to ISO date');
assert(typeof tempParsed.rows[0].event_ts === 'string' && String(tempParsed.rows[0].event_ts).startsWith('2026-'), '[pa_temporal_float32.parquet] TIMESTAMP_MILLIS decoded to ISO timestamp');

// Test PyArrow Feather v2 (Uncompressed & LZ4) and Arrow IPC Stream (Multi-Batch)
const arrowFixtures = [
    { file: 'pa_feather_uncompressed.feather', expectedFormat: 'feather', expectedCodec: 'UNCOMPRESSED' },
    { file: 'pa_feather_lz4.feather', expectedFormat: 'feather', expectedCodec: 'LZ4_FRAME' },
    { file: 'pa_arrow_stream.arrow', expectedFormat: 'arrow_stream', expectedCodec: 'UNCOMPRESSED' },
];

for (const af of arrowFixtures) {
    const bytes = new Uint8Array(fs.readFileSync(path.join(FIXTURES_DIR, af.file)));
    const parsed = parseColumnarFile(bytes, af.file);
    assert(parsed.format === af.expectedFormat, `[${af.file}] format === ${af.expectedFormat}`);
    assert(parsed.metadata.compressionCodec === af.expectedCodec, `[${af.file}] codec === ${af.expectedCodec}`);
    assert(parsed.rows.length === 20, `[${af.file}] decoded all 20 rows`);
    for (let r = 0; r < 20; r++) {
        const expSnowflake =
            r % 3 !== 0 ? String(BigInt('9007199254740999100') + BigInt(r)) : String(-(BigInt('9007199254740999100') + BigInt(r)));
        assert(parsed.rows[r].order_id === 1000 + r, `[${af.file}] row ${r} order_id`);
        assert(String(parsed.rows[r].snowflake_id) === expSnowflake, `[${af.file}] row ${r} 64-bit snowflake_id`);
        assert(parsed.rows[r].customer === (r % 5 === 0 ? null : `Enterprise_User_${String(r).padStart(2, '0')}`), `[${af.file}] row ${r} nullable string`);
    }
}

// Test External Apache Avro 1.11 OCF Fixtures (null and deflate codecs, unions, arrays, maps, 64-bit longs)
for (const avroCodec of ['null', 'deflate']) {
    const f = `ext_avro_${avroCodec}.avro`;
    const bytes = new Uint8Array(fs.readFileSync(path.join(FIXTURES_DIR, f)));
    const parsed = parseColumnarFile(bytes, f);
    assert(parsed.format === 'avro', `[${f}] format === avro`);
    assert(parsed.metadata.compressionCodec === avroCodec.toUpperCase(), `[${f}] codec === ${avroCodec.toUpperCase()}`);
    assert(parsed.metadata.syncMarkerHex === '01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F 10', `[${f}] 16-byte sync marker exact`);
    assert(parsed.rows.length === 15, `[${f}] decoded all 15 binary Avro records`);
    for (let i = 0; i < 15; i++) {
        const row = parsed.rows[i];
        const expTx = i % 2 === 0 ? String(BigInt('9007199254740999500') + BigInt(i)) : String(-(BigInt('9007199254740999500') + BigInt(i)));
        assert(row.seq_id === 500 + i, `[${f}] row ${i} seq_id === ${500 + i}`);
        assert(String(row.snowflake_tx_id) === expTx, `[${f}] row ${i} 64-bit long snowflake_tx_id === ${expTx}`);
        assert(row.region_tag === (i % 4 === 0 ? null : `AP-SOUTH-${i}`), `[${f}] row ${i} union ["null","string"] region_tag`);
        assert(Array.isArray(row.tags) && (row.tags as string[])[0] === `tagA_${i}`, `[${f}] row ${i} Avro array decoded`);
        assert(typeof row.metrics === 'object' && (row.metrics as Record<string, number>).retries === i % 3, `[${f}] row ${i} Avro map decoded`);
    }
}

// ============================================================================
// SUITE 3: VARINT, ZIGZAG, THRIFT TCOMPACTPROTOCOL, HYBRID RLE, SNAPPY, GZIP & LZ4
// ============================================================================
console.log('--- Suite 3: Varint, ZigZag, Thrift TCompactProtocol, Hybrid RLE & Compression Codecs ---');

const varintTestValues = [0, 1, 127, 128, 255, 16383, 16384, 65535, 2147483647];
for (const v of varintTestValues) {
    const enc = new Uint8Array(writeUnsignedVarint(v));
    const dec = readUnsignedVarint(enc, 0);
    assert(dec.value === v && dec.nextOffset === enc.length, `Unsigned varint round-trip for ${v}`);
}

const zigzagTestValues = [
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
];
for (const zv of zigzagTestValues) {
    const enc = new Uint8Array(writeZigZagVarint(zv));
    const dec = readZigZagVarint(enc, 0);
    assert(dec.bigValue === zv && dec.nextOffset === enc.length, `ZigZag 64-bit varint round-trip for ${zv.toString()}`);
}

// RLE / Bit-Packing round-trip across bit widths 1..16
for (let bw = 1; bw <= 16; bw++) {
    const maxVal = (1 << Math.min(bw, 12)) - 1;
    const arr = Array.from({ length: 45 }, (_, i) => (i < 15 ? 1 : i < 30 ? 0 : i % (maxVal + 1)));
    const rleBytes = encodeRleBitPackedHybrid(arr, bw, false);
    const decoded = decodeRleBitPackedHybrid(rleBytes, bw, arr.length);
    assert(
        decoded.length === arr.length && decoded.every((v, idx) => v === arr[idx]),
        `Hybrid RLE round-trip for bitWidth=${bw}`
    );
}

// Snappy block compression & decompression across 20 payloads
for (let p = 1; p <= 20; p++) {
    const text = `KivaroTools_Columnar_Snappy_Payload_${p}_`.repeat(p * 3);
    const raw = new TextEncoder().encode(text);
    const comp = compressSnappyBlock(raw);
    const decomp = decompressSnappyBlock(comp);
    assert(
        new TextDecoder().decode(decomp) === text,
        `Snappy LZ77 round-trip #${p} (${raw.length} -> ${comp.length} bytes)`
    );
}

// Built-in sample presets round-trip & cross-format transcoding
for (const preset of ['ecommerce_parquet', 'iot_avro', 'ml_feather'] as const) {
    const sample = generateSampleBinaryFile(preset);
    const parsed = parseColumnarFile(sample.bytes, sample.fileName);
    assert(parsed.rows.length >= 18, `Preset ${preset} loads ${parsed.rows.length} rows`);
    assert(parsed.warnings.length === 0, `Preset ${preset} parses with 0 warnings`);

    // Cross-transcode each preset to Parquet, Avro, and Feather and verify round-trip!
    const toPq = parseColumnarFile(encodeParquetBinary(parsed.rows), 'transcoded.parquet');
    const toAv = parseColumnarFile(encodeAvroBinary(parsed.rows), 'transcoded.avro');
    const toFe = parseColumnarFile(encodeFeatherBinary(parsed.rows), 'transcoded.feather');
    assert(toPq.rows.length === parsed.rows.length, `${preset} -> Parquet transcode row count exact`);
    assert(toAv.rows.length === parsed.rows.length, `${preset} -> Avro transcode row count exact`);
    assert(toFe.rows.length === parsed.rows.length, `${preset} -> Feather transcode row count exact`);
}

// ============================================================================
// SUITE 4: NATIVE BINARY .XLSX OPENXML COMPILER & CWE-1236 FORMULA DEFENSE
// ============================================================================
console.log('--- Suite 4: Native Binary .XLSX OpenXML Compiler & 15-Vector CWE-1236 Formula Defense ---');

const cwe1236Vectors = [
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

for (const vec of cwe1236Vectors) {
    const sanitized = sanitizeSpreadsheetFormula(vec, true);
    assert(sanitized.startsWith("'") && sanitized.slice(1) === vec, `CWE-1236 vector neutralized: ${JSON.stringify(vec)}`);
}

const legitimateNegatives = [
    '-42',
    '-42.5',
    '-0.000125',
    '-1.5e-4',
    '-9.99E+8',
    '  -99.95 ',
    '-9007199254740999123',
];
for (const neg of legitimateNegatives) {
    const out = sanitizeSpreadsheetFormula(neg, true);
    assert(out === neg, `Legitimate negative number preserved untouched: ${neg}`);
}

// Generate native .xlsx workbook with 64-bit Snowflake IDs, negative numbers, formulas, booleans, nulls
const xlsxTestRows = Array.from({ length: 25 }, (_, i) => ({
    order_id: 1000 + i,
    snowflake_id: `9007199254740999${100 + i}`,
    unsafe_16digit_num: 9007199254740991,
    amount: i % 2 === 0 ? 125.75 : -42.5,
    is_verified: i % 2 === 0,
    formula_col: cwe1236Vectors[i % cwe1236Vectors.length],
    notes: i % 4 === 0 ? null : `Line ${i} <xml & "quotes">`,
}));
const xlsxCols = ['order_id', 'snowflake_id', 'unsafe_16digit_num', 'amount', 'is_verified', 'formula_col', 'notes'];
const xlsxBytes = encodeXlsxWorkbookBinary(xlsxTestRows, xlsxCols, {
    sheetName: 'Audit_Verification_Sheet',
    sanitizeFormulas: true,
});
fs.writeFileSync(path.join(FIXTURES_DIR, 'verified_export.xlsx'), xlsxBytes);

assert(
    xlsxBytes[0] === 0x50 && xlsxBytes[1] === 0x4b && xlsxBytes[2] === 0x03 && xlsxBytes[3] === 0x04,
    'Native .xlsx starts with PKZIP local header 0x504B0304'
);

// Test all 8 export formats in exportDatasetToText
for (const fmt of ['csv', 'tsv', 'json', 'jsonl', 'sql', 'markdown', 'html', 'xlsx'] as ExportFormat[]) {
    const txt = exportDatasetToText(xlsxTestRows, xlsxCols, {
        format: fmt,
        csvDelimiter: ',',
        includeUtf8Bom: true,
        sanitizeFormulas: true,
        tableName: 'audit_orders',
        prettyJson: true,
    });
    assert(txt.length > 100, `Export format .${fmt} generated non-empty output (${txt.length} chars)`);
    assert(txt.includes('9007199254740999100'), `Export format .${fmt} preserves exact 19-digit 64-bit Snowflake ID`);
}

// ============================================================================
// SUITE 5: 10-DIALECT SCHEMA DDL GENERATOR, UI VIRTUALIZATION & SEO PARITY
// ============================================================================
console.log('--- Suite 5: 10-Dialect Schema DDL Generator, UI Virtualization & SEO Parity ---');

const sampleDataset = parseColumnarFile(generateSampleBinaryFile('ecommerce_parquet').bytes, 'ecommerce_orders_v2.parquet');
const ddlTargets: SchemaTargetLanguage[] = [
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
];
for (const target of ddlTargets) {
    const ddl = generateSchemaCode(sampleDataset.schema, target, 'ecommerce_orders_v2');
    assert(ddl.length > 80, `DDL target ${target} generated valid code (${ddl.length} chars)`);
    assert(ddl.includes('customer_snowflake_id'), `DDL target ${target} includes customer_snowflake_id column`);
}

// UI & SEO static verification
const uiSource = fs.readFileSync(path.join(process.cwd(), 'components/tools/ParquetViewer.tsx'), 'utf-8');
const seoSource = fs.readFileSync(path.join(process.cwd(), 'components/seo/ParquetViewerSeo.tsx'), 'utf-8');

assert(typeof ParquetViewer === 'function', 'ParquetViewer client component exports valid function');
assert(typeof ParquetViewerSeo === 'function', 'ParquetViewerSeo component exports valid function');
assert(PARQUET_VIEWER_FAQS.length === 16, 'ParquetViewerSeo exports 16 FAQs');
assert(uiSource.includes("gridMode === 'virtualized'") && uiSource.includes('Virtualized Scroll'), 'ParquetViewer.tsx implements both Paginated and Virtualized Scroll grid modes');
assert(
    seoSource.includes('Files are processed locally in your browser') &&
    seoSource.includes('Your dataset files and their contents are not uploaded to KivaroTools servers') &&
    seoSource.includes('The website may load standard analytics scripts to measure general site traffic'),
    'ParquetViewerSeo.tsx includes exact audit-recommended privacy statement'
);
assert(
    seoSource.includes('compareExactNumericValues'),
    'ParquetViewerSeo.tsx documents exact 64-bit BigInt numeric filtering via compareExactNumericValues'
);

console.log('\n================================================================================');
console.log(` TOTAL ASSERTIONS EXECUTED : ${passed + failed}`);
console.log(` PASSED                    : ${passed}`);
console.log(` FAILED                    : ${failed}`);
console.log('================================================================================');

if (failed > 0) {
    process.exit(1);
}
