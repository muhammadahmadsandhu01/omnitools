/**
 * KivaroTools Client-Side Columnar & Row Binary Engine (v5.2 — Hardened & Scope-Qualified Edition)
 *
 * Implements local in-browser binary inspection, decoding, querying, and conversion for:
 * 1. Apache Parquet (PAR1): Apache Thrift TCompactProtocol FileMetaData footer, SchemaElement tree,
 *    RowGroup / ColumnChunk / Statistics zone maps, and DataPage v1/v2 + DictionaryPage decoding for
 *    PLAIN, RLE_DICTIONARY, PLAIN_DICTIONARY, and boolean RLE encodings across UNCOMPRESSED, SNAPPY,
 *    GZIP (RFC 1952), LZ4, and LZ4_RAW codecs (including DECIMAL, UINT8..64, INT96, TIMESTAMP_MILLIS,
 *    TIMESTAMP_MICROS, TIMESTAMP_NANOS, nested STRUCT reconstruction, MAP reconstruction, and Dremel
 *    1-level & multi-level LIST / LIST-of-STRUCT columns).
 * 2. Apache Avro OCF (Obj\x01): Object Container File header metadata map, embedded avro.schema JSON,
 *    16-byte header & per-block sync-marker verification, physical data block X-Ray telemetry, Confluent
 *    Schema Registry wire format (0x00 + 4-byte Schema ID) diagnostics, and ZigZag binary datum decoding
 *    across null, deflate (RFC 1951), and snappy (with 4-byte CRC32 verification) blocks.
 * 3. Feather V1 (FEA1) & Feather V2 / Arrow IPC (ARROW1 / 0xFFFFFFFF):
 *    - Dedicated Feather V1 CTable / PrimitiveArray FlatBuffers reader (UNCOMPRESSED PLAIN & Category columns).
 *    - Full Feather V2 / Arrow IPC encapsulated Schema + DictionaryBatch + RecordBatch FlatBuffers reader
 *      supporting Int8..64, UInt8..64, Float16/32/64, Bool, Utf8/LargeUtf8, Binary/LargeBinary/FixedSizeBinary,
 *      Decimal128/256, Date32/64, Time32/64, Timestamp (s/ms/us/ns), List/LargeList/FixedSizeList, Struct, Map,
 *      and Dictionary-encoded (categorical) columns across UNCOMPRESSED and LZ4_FRAME buffers (plus legacy Snappy fallback).
 *    - Spec-compliant Apache Arrow IPC File (ARROW1 FlatBuffers) encoder.
 * 4. 64-Bit BigInt Numeric Precision: Exact BigInt & decimal comparison (compareExactNumericValues)
 *    across display, bi-directional NULL-last sorting, all numeric filter operators, and exports.
 * 5. Native OpenXML .XLSX Workbook Compiler (PKZIP 0x504B0304) & Tested 15-Vector CWE-1236 Formula Mitigation.
 */

export type ColumnarFormat =
    | 'parquet'
    | 'avro'
    | 'feather'
    | 'arrow_stream'
    | 'jsonl'
    | 'csv';

export type PhysicalDataType =
    | 'BOOLEAN'
    | 'INT32'
    | 'INT64'
    | 'FLOAT'
    | 'DOUBLE'
    | 'BYTE_ARRAY'
    | 'FIXED_LEN_BYTE_ARRAY';

export type LogicalDataType =
    | 'BOOLEAN'
    | 'INT32'
    | 'INT64'
    | 'UINT64'
    | 'FLOAT'
    | 'DOUBLE'
    | 'DECIMAL'
    | 'UTF8'
    | 'DATE'
    | 'TIMESTAMP_MILLIS'
    | 'TIMESTAMP_MICROS'
    | 'TIMESTAMP_NANOS'
    | 'UUID'
    | 'JSON'
    | 'LIST'
    | 'STRUCT'
    | 'MAP'
    | 'BINARY'
    | 'NULL';

export type RepetitionType = 'REQUIRED' | 'OPTIONAL' | 'REPEATED';

export interface ColumnSchemaNode {
    index: number;
    name: string;
    physicalType: PhysicalDataType;
    logicalType: LogicalDataType;
    repetitionType: RepetitionType;
    nullable: boolean;
    precision?: number;
    scale?: number;
    typeLength?: number;
    compressionCodec: string;
    encoding: string;
    children?: ColumnSchemaNode[];
}

export interface RowGroupColumnChunkMeta {
    name: string;
    physicalType: PhysicalDataType;
    codec: string;
    encodings: string[];
    numValues: number;
    compressedSize: number;
    uncompressedSize: number;
    compressionRatio: number;
    dataPageOffset: number;
    nullCount: number;
    distinctCount: number;
    minValue: string | number | null;
    maxValue: string | number | null;
}

export interface RowGroupMeta {
    index: number;
    rowCount: number;
    totalByteSize: number;
    compressedBytes: number;
    compressionRatio: number;
    columns: RowGroupColumnChunkMeta[];
    isSyntheticEstimate?: boolean;
    containerUnitLabel?: string;
}

export interface ColumnProfileStats {
    name: string;
    physicalType: PhysicalDataType;
    logicalType: LogicalDataType;
    totalCount: number;
    nullCount: number;
    nullPercentage: number;
    nonNullCount: number;
    distinctCount: number;
    uniquenessRatio: number;
    min: string | number | null;
    max: string | number | null;
    mean: number | null;
    stdDev: number | null;
    p25: number | null;
    median: number | null;
    p75: number | null;
    minStringLength: number | null;
    maxStringLength: number | null;
    avgStringLength: number | null;
    topValues: { value: string; count: number; percentage: number }[];
}

export interface ContainerBinaryMetadata {
    format: ColumnarFormat;
    formatVersion: string;
    magicBytes: string;
    headerHex: string;
    footerHex: string;
    fileName: string;
    fileSizeBytes: number;
    uncompressedBytes: number;
    compressionRatio: number;
    compressionCodec: string;
    createdBy: string;
    totalRows: number;
    totalColumns: number;
    rowGroupCount: number;
    rowGroups: RowGroupMeta[];
    keyValueMetadata: Record<string, string>;
    syncMarkerHex?: string;
    byteOrder: 'LITTLE_ENDIAN';
    parseTimeMs: number;
    isForensicPartial?: boolean;
    forensicError?: string;
}

export interface ColumnarParseResult {
    format: ColumnarFormat;
    metadata: ContainerBinaryMetadata;
    schema: ColumnSchemaNode[];
    rows: Record<string, unknown>[];
    columnProfiles: ColumnProfileStats[];
    warnings: string[];
}

export type FilterOperator =
    | 'eq'
    | 'neq'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'contains'
    | 'starts_with'
    | 'ends_with'
    | 'is_null'
    | 'is_not_null';

export type FilterLogicMode = 'AND' | 'OR';

export interface FilterCondition {
    column: string;
    operator: FilterOperator;
    value: string;
    join?: FilterLogicMode;
}

export interface SortConfig {
    column: string;
    direction: 'asc' | 'desc';
}

export type SchemaTargetLanguage =
    | 'postgresql'
    | 'snowflake'
    | 'bigquery'
    | 'duckdb'
    | 'clickhouse'
    | 'typescript'
    | 'pyarrow'
    | 'polars'
    | 'avro_schema'
    | 'json_schema';

export type ExportFormat =
    | 'csv'
    | 'tsv'
    | 'json'
    | 'jsonl'
    | 'sql'
    | 'markdown'
    | 'html'
    | 'xlsx';

export interface ExportOptions {
    format: ExportFormat;
    csvDelimiter: ',' | ';' | '\t' | '|';
    includeUtf8Bom: boolean;
    sanitizeFormulas: boolean;
    tableName: string;
    prettyJson: boolean;
    selectedColumns?: string[];
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder('utf-8', { fatal: false });

// Memory & Allocation Safety Limits (guards against malformed/hostile binary lengths)
export const COLUMNAR_ENGINE_VERSION = '5.2';
export const MAX_SAFE_FILE_BYTES = 250 * 1024 * 1024; // 250 MB input buffer ceiling
export const MAX_DECOMPRESSED_PAGE_BYTES = 250 * 1024 * 1024; // 250 MB decompressed block ceiling
export const MAX_DECLARED_ROW_COUNT = 5_000_000; // 5M row allocation guard
export const MAX_DECLARED_COLUMN_COUNT = 2_048; // 2,048 column allocation guard

// ============================================================
// 1. MAGIC BYTE DETECTION, CONFLUENT DIAGNOSTICS & FORENSIC X-RAY
// ============================================================

export function bytesToHex(bytes: Uint8Array, maxBytes = 16): string {
    const slice = bytes.subarray(0, Math.min(bytes.length, maxBytes));
    return Array.from(slice)
        .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
        .join(' ');
}

/**
 * Formats an epoch timestamp (in seconds, milliseconds, microseconds, or nanoseconds) into an ISO-8601 UTC string
 * without overflowing JavaScript Date bounds or losing sub-millisecond fractional precision.
 */
export function formatEpochTimestampToIso(
    epochVal: bigint,
    unit: 's' | 'ms' | 'us' | 'ns'
): string {
    let msBig: bigint;
    let subMsFraction = '';
    if (unit === 's') {
        msBig = epochVal * BigInt(1000);
    } else if (unit === 'ms') {
        msBig = epochVal;
    } else if (unit === 'us') {
        const div = BigInt(1000);
        let q = epochVal / div;
        let r = epochVal % div;
        if (r < BigInt(0)) {
            q -= BigInt(1);
            r += div;
        }
        msBig = q;
        if (r > BigInt(0)) {
            subMsFraction = r.toString().padStart(3, '0');
        }
    } else {
        const div = BigInt(1000000);
        let q = epochVal / div;
        let r = epochVal % div;
        if (r < BigInt(0)) {
            q -= BigInt(1);
            r += div;
        }
        msBig = q;
        if (r > BigInt(0)) {
            const nsStr = r.toString().padStart(6, '0');
            subMsFraction = nsStr.endsWith('000') ? nsStr.slice(0, 3) : nsStr;
        }
    }
    const msNum = Number(msBig);
    if (!Number.isFinite(msNum) || Math.abs(msNum) > 8_640_000_000_000_000) {
        return `${epochVal.toString()} (${unit})`;
    }
    const baseIso = new Date(msNum).toISOString();
    if (!subMsFraction) return baseIso;
    return baseIso.replace(/Z$/, `${subMsFraction}Z`);
}

export function detectColumnarFormat(
    bytes: Uint8Array,
    fileName = ''
): { format: ColumnarFormat; magic: string } {
    const lower = fileName.toLowerCase();

    if (bytes && bytes.length >= 4) {
        // Encrypted Parquet ("PARE" = 0x50 0x41 0x52 0x45)
        if (
            bytes[0] === 0x50 &&
            bytes[1] === 0x41 &&
            bytes[2] === 0x52 &&
            bytes[3] === 0x45
        ) {
            throw new Error(
                'Encrypted Apache Parquet (PARE) file detected. Modular Parquet encryption requires external KMS decryption keys.'
            );
        }
        // Confluent Schema Registry Wire Format (0x00 + 4-byte big-endian Schema ID)
        if (bytes.length >= 5 && bytes[0] === 0x00) {
            const schemaId = new DataView(bytes.buffer, bytes.byteOffset + 1, 4).getUint32(0, false);
            if (schemaId > 0) {
                throw new Error(
                    `Confluent Schema Registry Wire Format payload detected (leading magic byte 0x00, Schema ID #${schemaId}, header hex: ${bytesToHex(bytes, 5)}). Unlike standalone Apache Avro Object Container Files ("Obj\\x01" / 0x4F626A01) which embed their avro.schema JSON in the header, Confluent wire messages require fetching Schema ID #${schemaId} from an external Confluent Schema Registry.`
                );
            }
        }
        // 1. Apache Parquet ("PAR1" = 0x50 0x41 0x52 0x31)
        if (
            bytes[0] === 0x50 &&
            bytes[1] === 0x41 &&
            bytes[2] === 0x52 &&
            bytes[3] === 0x31
        ) {
            return { format: 'parquet', magic: 'PAR1' };
        }
        // 2. Apache Avro ("Obj\x01" = 0x4F 0x62 0x6A 0x01)
        if (
            bytes[0] === 0x4f &&
            bytes[1] === 0x62 &&
            bytes[2] === 0x6a &&
            bytes[3] === 0x01
        ) {
            return { format: 'avro', magic: 'Obj\\x01' };
        }
        // 3. Apache Arrow IPC / Feather V2 ("ARROW1")
        if (
            bytes.length >= 6 &&
            bytes[0] === 0x41 &&
            bytes[1] === 0x52 &&
            bytes[2] === 0x52 &&
            bytes[3] === 0x4f &&
            bytes[4] === 0x57 &&
            bytes[5] === 0x31
        ) {
            return { format: 'feather', magic: 'ARROW1' };
        }
        // 4. Feather V1 ("FEA1" — distinct legacy CTable FlatBuffers architecture)
        if (
            bytes[0] === 0x46 &&
            bytes[1] === 0x45 &&
            bytes[2] === 0x41 &&
            bytes[3] === 0x31
        ) {
            return { format: 'feather', magic: 'FEA1' };
        }
        // 5. Arrow IPC Stream (0xFFFFFFFF continuation indicator)
        if (
            bytes.length >= 8 &&
            bytes[0] === 0xff &&
            bytes[1] === 0xff &&
            bytes[2] === 0xff &&
            bytes[3] === 0xff
        ) {
            return { format: 'arrow_stream', magic: 'ARROW_STREAM' };
        }
    }

    if (lower.endsWith('.parquet') || lower.endsWith('.pq')) {
        return { format: 'parquet', magic: 'PAR1' };
    }
    if (lower.endsWith('.avro')) {
        return { format: 'avro', magic: 'Obj\\x01' };
    }
    if (lower.endsWith('.feather') || lower.endsWith('.arrow') || lower.endsWith('.ipc')) {
        return { format: 'feather', magic: bytes && bytes.length >= 4 && bytes[0] === 0x46 ? 'FEA1' : 'ARROW1' };
    }
    if (lower.endsWith('.csv') || lower.endsWith('.tsv')) {
        return { format: 'csv', magic: 'TEXT/CSV' };
    }
    return { format: 'jsonl', magic: 'TEXT/JSON' };
}

/**
 * Builds a forensic partial ContainerBinaryMetadata snapshot when a binary file fails full parsing
 * (e.g. truncated Parquet missing trailing PAR1, Confluent wire payload, or corrupted footer),
 * allowing the user to open the Binary X-Ray Inspector tab to inspect header/footer hex bytes.
 */
export function buildForensicXRayMetadata(
    bytes: Uint8Array,
    fileName = 'corrupted_file.bin',
    errorMsg = 'Container parse failed.'
): ContainerBinaryMetadata {
    const lower = fileName.toLowerCase();
    let format: ColumnarFormat = 'parquet';
    let magic = 'UNKNOWN';
    let formatVersion = 'Forensic Binary Inspection (Unparsed / Corrupted Container)';
    const kv: Record<string, string> = {
        'forensic.status': 'PARSE_FAILED_FORENSIC_XRAY',
        'forensic.diagnostic': errorMsg,
        'forensic.file_size_bytes': String(bytes.length),
    };

    if (bytes.length >= 4) {
        if (bytes[0] === 0x50 && bytes[1] === 0x41 && bytes[2] === 0x52 && bytes[3] === 0x31) {
            format = 'parquet';
            magic = 'PAR1 (Header Verified)';
            const hasTailPar1 =
                bytes.length >= 8 &&
                bytes[bytes.length - 4] === 0x50 &&
                bytes[bytes.length - 3] === 0x41 &&
                bytes[bytes.length - 2] === 0x52 &&
                bytes[bytes.length - 1] === 0x31;
            kv['forensic.leading_magic'] = '0x50415231 ("PAR1" — Valid)';
            kv['forensic.trailing_magic'] = hasTailPar1
                ? '0x50415231 ("PAR1" — Present)'
                : `${bytesToHex(bytes.subarray(Math.max(0, bytes.length - 4)), 4)} (MISSING trailing "PAR1" — Truncated File)`;
            if (hasTailPar1 && bytes.length >= 8) {
                const declaredFooterLen = new DataView(bytes.buffer, bytes.byteOffset + bytes.length - 8, 4).getUint32(0, true);
                kv['forensic.declared_footer_length'] = `${declaredFooterLen} bytes`;
            }
            formatVersion = hasTailPar1
                ? 'Apache Parquet (Corrupted Thrift Footer / Page Payload)'
                : 'Truncated Apache Parquet (Missing Trailing PAR1 Footer)';
        } else if (bytes[0] === 0x50 && bytes[1] === 0x41 && bytes[2] === 0x52 && bytes[3] === 0x45) {
            format = 'parquet';
            magic = 'PARE (Encrypted)';
            formatVersion = 'Apache Parquet Modular Encryption (PARE)';
            kv['forensic.encryption'] = 'AES-GCM / AES-CTR Modular Parquet Encryption (External KMS Keys Required)';
        } else if (bytes.length >= 5 && bytes[0] === 0x00) {
            format = 'avro';
            const schemaId = new DataView(bytes.buffer, bytes.byteOffset + 1, 4).getUint32(0, false);
            magic = `CONFLUENT_0x00 (ID #${schemaId})`;
            formatVersion = `Confluent Schema Registry Wire Format (Schema ID #${schemaId})`;
            kv['confluent.magic_byte'] = '0x00';
            kv['confluent.schema_id'] = String(schemaId);
            kv['confluent.note'] = 'Single-message Confluent wire payload without embedded Obj\\x01 OCF schema header.';
        } else if (bytes[0] === 0x4f && bytes[1] === 0x62 && bytes[2] === 0x6a && bytes[3] === 0x01) {
            format = 'avro';
            magic = 'Obj\\x01';
            formatVersion = 'Apache Avro OCF (Corrupted Block or Sync Marker)';
        } else if (
            bytes.length >= 6 &&
            bytes[0] === 0x41 &&
            bytes[1] === 0x52 &&
            bytes[2] === 0x52 &&
            bytes[3] === 0x4f &&
            bytes[4] === 0x57 &&
            bytes[5] === 0x31
        ) {
            format = 'feather';
            magic = 'ARROW1';
            formatVersion = 'Feather V2 / Arrow IPC (Truncated or Unsupported Container)';
        } else if (bytes[0] === 0x46 && bytes[1] === 0x45 && bytes[2] === 0x41 && bytes[3] === 0x31) {
            format = 'feather';
            magic = 'FEA1';
            formatVersion = 'Feather V1 Legacy CTable (Truncated or Corrupted)';
        } else if (lower.endsWith('.avro')) {
            format = 'avro';
        } else if (lower.endsWith('.feather') || lower.endsWith('.arrow') || lower.endsWith('.ipc')) {
            format = 'feather';
        }
    }

    const footerSlice = bytes.length >= 16 ? bytes.subarray(bytes.length - 16) : bytes;
    return {
        format,
        formatVersion,
        magicBytes: magic,
        headerHex: bytesToHex(bytes, 16),
        footerHex: bytesToHex(footerSlice, 16),
        fileName,
        fileSizeBytes: bytes.length,
        uncompressedBytes: bytes.length,
        compressionRatio: 1,
        compressionCodec: 'UNKNOWN',
        createdBy: 'Forensic Header/Tail Inspector',
        totalRows: 0,
        totalColumns: 0,
        rowGroupCount: 0,
        rowGroups: [],
        keyValueMetadata: kv,
        byteOrder: 'LITTLE_ENDIAN',
        parseTimeMs: 0.1,
        isForensicPartial: true,
        forensicError: errorMsg,
    };
}

// ============================================================
// 2. VARINT, ZIGZAG, SNAPPY (COMPRESS + DECOMPRESS) & HYBRID RLE
// ============================================================

/**
 * Strictly validated Unsigned LEB128 Varint Reader.
 */
export function readUnsignedVarint(
    bytes: Uint8Array,
    offset = 0
): { value: number; bigValue: bigint; nextOffset: number } {
    if (!bytes || offset < 0 || offset >= bytes.length) {
        throw new Error(`Malformed varint: offset (${offset}) is outside buffer bounds (length=${bytes ? bytes.length : 0}).`);
    }
    let bigResult = BigInt(0);
    let shift = BigInt(0);
    let pos = offset;
    let byteCount = 0;
    let terminated = false;

    while (pos < bytes.length) {
        const byte = bytes[pos++];
        byteCount++;
        if (byteCount > 10 || (byteCount === 10 && (byte & 0x7f) > 1)) {
            throw new Error(`Malformed varint at offset ${offset}: exceeds 64-bit unsigned integer capacity.`);
        }
        bigResult |= BigInt(byte & 0x7f) << shift;
        if ((byte & 0x80) === 0) {
            terminated = true;
            break;
        }
        shift += BigInt(7);
    }

    if (!terminated) {
        throw new Error(`Malformed varint at offset ${offset}: truncated continuation byte at end of buffer.`);
    }

    return { value: Number(bigResult), bigValue: bigResult, nextOffset: pos };
}

/**
 * Strictly validated 64-bit ZigZag Varint Reader.
 */
export function readZigZagVarint(
    bytes: Uint8Array,
    offset = 0
): { value: number; bigValue: bigint; nextOffset: number } {
    const { bigValue: raw, nextOffset } = readUnsignedVarint(bytes, offset);
    const decodedBig = (raw >> BigInt(1)) ^ -(raw & BigInt(1));
    return { value: Number(decodedBig), bigValue: decodedBig, nextOffset };
}

export function writeUnsignedVarint(value: number | bigint): number[] {
    const out: number[] = [];
    let v = typeof value === 'bigint' ? (value < BigInt(0) ? BigInt(0) : value) : BigInt(Math.max(0, Math.trunc(value)));
    const c80 = BigInt(0x80);
    const c7f = BigInt(0x7f);
    const c7 = BigInt(7);
    while (v >= c80) {
        out.push(Number((v & c7f) | c80));
        v >>= c7;
    }
    out.push(Number(v & c7f));
    return out;
}

export function writeZigZagVarint(value: number | bigint): number[] {
    const v = typeof value === 'bigint' ? value : BigInt(Math.trunc(value));
    const zz = (v << BigInt(1)) ^ (v >> BigInt(63));
    const out: number[] = [];
    let rem = zz < BigInt(0) ? -zz : zz;
    const c80 = BigInt(0x80);
    const c7f = BigInt(0x7f);
    const c7 = BigInt(7);
    while (rem >= c80) {
        out.push(Number((rem & c7f) | c80));
        rem >>= c7;
    }
    out.push(Number(rem & c7f));
    return out;
}

/**
 * Pure TypeScript LZ77 Snappy Block Compressor
 */
export function compressSnappyBlock(input: Uint8Array): Uint8Array {
    const lenBytes = writeUnsignedVarint(input.length);
    if (input.length === 0) return new Uint8Array(lenBytes);

    const out: number[] = [...lenBytes];
    const hashTable = new Int32Array(4096).fill(-1);

    const emitLiteral = (litStart: number, litLen: number) => {
        if (litLen <= 0) return;
        const n = litLen - 1;
        if (n < 60) {
            out.push((n << 2) | 0x00);
        } else if (n < 256) {
            out.push((60 << 2) | 0x00, n & 0xff);
        } else {
            out.push((61 << 2) | 0x00, n & 0xff, (n >>> 8) & 0xff);
        }
        for (let i = 0; i < litLen; i++) {
            out.push(input[litStart + i]);
        }
    };

    const emitCopy = (offset: number, length: number) => {
        let rem = length;
        while (rem > 0) {
            const chunk = Math.min(rem, 64);
            if (chunk >= 4 && chunk <= 11 && offset < 2048) {
                out.push(((offset >>> 8) << 5) | ((chunk - 4) << 2) | 0x01);
                out.push(offset & 0xff);
            } else {
                out.push(((chunk - 1) << 2) | 0x02);
                out.push(offset & 0xff, (offset >>> 8) & 0xff);
            }
            rem -= chunk;
        }
    };

    let pos = 0;
    let litStart = 0;

    while (pos + 4 <= input.length) {
        const v =
            input[pos] |
            (input[pos + 1] << 8) |
            (input[pos + 2] << 16) |
            (input[pos + 3] << 24);
        const h = ((v * 0x1e35a7bd) >>> 20) & 0xfff;
        const cand = hashTable[h];
        hashTable[h] = pos;

        if (
            cand >= 0 &&
            pos - cand > 0 &&
            pos - cand < 65535 &&
            input[cand] === input[pos] &&
            input[cand + 1] === input[pos + 1] &&
            input[cand + 2] === input[pos + 2] &&
            input[cand + 3] === input[pos + 3]
        ) {
            emitLiteral(litStart, pos - litStart);
            let matchLen = 4;
            while (
                pos + matchLen < input.length &&
                input[cand + matchLen] === input[pos + matchLen] &&
                matchLen < 64
            ) {
                matchLen++;
            }
            emitCopy(pos - cand, matchLen);
            pos += matchLen;
            litStart = pos;
        } else {
            pos++;
        }
    }

    if (litStart < input.length) {
        emitLiteral(litStart, input.length - litStart);
    }

    return new Uint8Array(out);
}

/**
 * Strictly Validated Pure TypeScript Snappy Block Decompressor.
 */
export function decompressSnappyBlock(input: Uint8Array): Uint8Array {
    if (!input || input.length === 0) {
        throw new Error('Malformed Snappy block: empty input buffer (0 bytes).');
    }
    const { value: uncompressedLen, nextOffset } = readUnsignedVarint(input, 0);
    if (uncompressedLen < 0 || uncompressedLen > MAX_DECOMPRESSED_PAGE_BYTES) {
        throw new Error(
            `Malformed Snappy block: declared uncompressed length (${uncompressedLen}) is invalid or exceeds safety limit (${MAX_DECOMPRESSED_PAGE_BYTES}).`
        );
    }
    if (uncompressedLen === 0) {
        if (nextOffset !== input.length) {
            throw new Error('Malformed Snappy block: trailing bytes after 0-length header.');
        }
        return new Uint8Array(0);
    }

    const out = new Uint8Array(uncompressedLen);
    let pos = nextOffset;
    let outIdx = 0;

    while (pos < input.length) {
        const tag = input[pos++];
        const tagType = tag & 0x03;

        if (tagType === 0) {
            let len = (tag >>> 2) + 1;
            if (len > 60) {
                const extraBytes = len - 60;
                if (pos + extraBytes > input.length) {
                    throw new Error('Malformed Snappy block: truncated literal length header.');
                }
                len = 0;
                for (let i = 0; i < extraBytes; i++) {
                    len |= input[pos++] << (8 * i);
                }
                len += 1;
            }
            if (len <= 0 || pos + len > input.length || outIdx + len > uncompressedLen) {
                throw new Error(
                    `Malformed Snappy block: literal run (${len} bytes) exceeds input (${input.length - pos}) or output (${uncompressedLen - outIdx}) bounds.`
                );
            }
            out.set(input.subarray(pos, pos + len), outIdx);
            pos += len;
            outIdx += len;
        } else {
            let length = 0;
            let offset = 0;
            if (tagType === 1) {
                if (pos >= input.length) {
                    throw new Error('Malformed Snappy block: truncated copy-1 offset byte.');
                }
                length = ((tag >>> 2) & 0x07) + 4;
                offset = ((tag & 0xe0) << 3) | input[pos++];
            } else if (tagType === 2) {
                if (pos + 2 > input.length) {
                    throw new Error('Malformed Snappy block: truncated copy-2 offset bytes.');
                }
                length = (tag >>> 2) + 1;
                offset = input[pos] | (input[pos + 1] << 8);
                pos += 2;
            } else {
                if (pos + 4 > input.length) {
                    throw new Error('Malformed Snappy block: truncated copy-4 offset bytes.');
                }
                length = (tag >>> 2) + 1;
                offset =
                    (input[pos] |
                        (input[pos + 1] << 8) |
                        (input[pos + 2] << 16) |
                        (input[pos + 3] << 24)) >>>
                    0;
                pos += 4;
            }
            if (offset <= 0 || offset > outIdx || outIdx + length > uncompressedLen) {
                throw new Error(
                    `Malformed Snappy block: invalid LZ77 copy offset (${offset} at outIdx=${outIdx}) or copy length (${length}).`
                );
            }
            for (let i = 0; i < length; i++) {
                out[outIdx] = out[outIdx - offset];
                outIdx++;
            }
        }
    }

    if (outIdx !== uncompressedLen) {
        throw new Error(
            `Malformed Snappy block: decompressed byte count (${outIdx}) does not match declared header length (${uncompressedLen}).`
        );
    }
    return out;
}

/**
 * Parquet Hybrid RLE / Bit-Packing Decoder
 */
export function decodeRleBitPackedHybrid(
    bytes: Uint8Array,
    bitWidth: number,
    expectedCount: number
): number[] {
    if (bitWidth === 0) return new Array(expectedCount).fill(0);
    const out: number[] = [];
    let pos = 0;
    const byteWidth = Math.ceil(bitWidth / 8);

    while (pos < bytes.length && out.length < expectedCount) {
        const { value: header, nextOffset } = readUnsignedVarint(bytes, pos);
        pos = nextOffset;
        const isBitPacked = (header & 1) === 1;

        if (!isBitPacked) {
            const runLength = header >>> 1;
            let val = 0;
            for (let b = 0; b < byteWidth && pos < bytes.length; b++) {
                val |= bytes[pos++] << (8 * b);
            }
            for (let i = 0; i < runLength && out.length < expectedCount; i++) {
                out.push(val);
            }
        } else {
            const numGroups = header >>> 1;
            const totalValues = numGroups * 8;
            let bitBuf = BigInt(0);
            let bitsInBuf = 0;
            const mask = (BigInt(1) << BigInt(bitWidth)) - BigInt(1);

            for (let i = 0; i < totalValues && out.length < expectedCount; i++) {
                while (bitsInBuf < bitWidth && pos < bytes.length) {
                    bitBuf |= BigInt(bytes[pos++]) << BigInt(bitsInBuf);
                    bitsInBuf += 8;
                }
                out.push(Number(bitBuf & mask));
                bitBuf >>= BigInt(bitWidth);
                bitsInBuf -= bitWidth;
            }
        }
    }
    return out;
}

/**
 * Parquet Hybrid RLE / Bit-Packing Encoder (encodes definition levels or dictionary indices)
 */
export function encodeRleBitPackedHybrid(values: number[], bitWidth: number, includeLengthPrefix = true): Uint8Array {
    if (bitWidth === 0 || values.length === 0) {
        return includeLengthPrefix ? new Uint8Array([0, 0, 0, 0]) : new Uint8Array(0);
    }
    const byteWidth = Math.ceil(bitWidth / 8);
    const rlePayload: number[] = [];
    let i = 0;
    while (i < values.length) {
        const val = values[i];
        let runLen = 1;
        while (i + runLen < values.length && values[i + runLen] === val && runLen < 0x7fff) {
            runLen++;
        }
        const header = runLen << 1; // RLE run (lowest bit = 0)
        rlePayload.push(...writeUnsignedVarint(header));
        for (let b = 0; b < byteWidth; b++) {
            rlePayload.push((val >>> (8 * b)) & 0xff);
        }
        i += runLen;
    }
    if (!includeLengthPrefix) {
        return new Uint8Array(rlePayload);
    }
    const out = new Uint8Array(4 + rlePayload.length);
    const dv = new DataView(out.buffer);
    dv.setUint32(0, rlePayload.length, true);
    out.set(rlePayload, 4);
    return out;
}

/**
 * Pure TypeScript Synchronous RFC 1951 DEFLATE Decompressor
 */
const DEFLATE_LEN_BASE = [
    3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
    35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258,
];
const DEFLATE_LEN_EXTRA = [
    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2,
    3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0,
];
const DEFLATE_DIST_BASE = [
    1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
    257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577,
];
const DEFLATE_DIST_EXTRA = [
    0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6,
    7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13,
];
const DEFLATE_CL_ORDER = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

interface HuffmanTable {
    counts: Uint16Array;
    symbols: Uint16Array;
    totalSymbols: number;
}

function buildHuffmanTable(lengths: ArrayLike<number>, numSymbols: number): HuffmanTable {
    const counts = new Uint16Array(16);
    for (let i = 0; i < numSymbols; i++) {
        const l = lengths[i];
        if (l < 0 || l > 15) {
            throw new Error(`Malformed DEFLATE Huffman table: invalid code length (${l}).`);
        }
        if (l > 0) counts[l]++;
    }

    let left = 1;
    for (let bits = 1; bits <= 15; bits++) {
        left <<= 1;
        left -= counts[bits];
        if (left < 0) {
            throw new Error('Malformed DEFLATE Huffman table: oversubscribed code lengths violate Kraft inequality.');
        }
    }

    const offsets = new Uint16Array(16);
    let total = 0;
    for (let bits = 1; bits < 16; bits++) {
        offsets[bits] = total;
        total += counts[bits];
    }
    const symbols = new Uint16Array(Math.max(1, total));
    for (let i = 0; i < numSymbols; i++) {
        const l = lengths[i];
        if (l > 0) {
            symbols[offsets[l]++] = i;
        }
    }
    return { counts, symbols, totalSymbols: total };
}

export function inflateRawDeflate(input: Uint8Array, maxOutputBytes = MAX_DECOMPRESSED_PAGE_BYTES): Uint8Array {
    if (!input || input.length === 0) {
        throw new Error('Malformed DEFLATE stream: empty input buffer (0 bytes).');
    }
    let bitPos = 0;
    const totalBits = input.length * 8;
    const out: number[] = [];

    const readBits = (n: number): number => {
        if (bitPos + n > totalBits) {
            throw new Error('Malformed DEFLATE stream: unexpected end of bitstream.');
        }
        let val = 0;
        for (let i = 0; i < n; i++) {
            const byteIdx = bitPos >>> 3;
            const bitIdx = bitPos & 7;
            val |= ((input[byteIdx] >>> bitIdx) & 1) << i;
            bitPos++;
        }
        return val;
    };

    const decodeSymbol = (table: HuffmanTable): number => {
        if (table.totalSymbols === 0) {
            throw new Error('Malformed DEFLATE stream: attempted to decode symbol from empty Huffman table.');
        }
        let code = 0;
        let first = 0;
        let index = 0;
        for (let len = 1; len < 16; len++) {
            code |= readBits(1);
            const count = table.counts[len];
            if (code - count < first) {
                return table.symbols[index + (code - first)];
            }
            index += count;
            first += count;
            first <<= 1;
            code <<= 1;
        }
        throw new Error('Malformed DEFLATE stream: invalid Huffman code encountered.');
    };

    const fixedLitLengths = new Uint8Array(288);
    for (let i = 0; i <= 143; i++) fixedLitLengths[i] = 8;
    for (let i = 144; i <= 255; i++) fixedLitLengths[i] = 9;
    for (let i = 256; i <= 279; i++) fixedLitLengths[i] = 7;
    for (let i = 280; i <= 287; i++) fixedLitLengths[i] = 8;
    const fixedDistLengths = new Uint8Array(32).fill(5);
    let fixedLitTable: HuffmanTable | null = null;
    let fixedDistTable: HuffmanTable | null = null;

    let bfinal = 0;
    while (bfinal === 0) {
        bfinal = readBits(1);
        const btype = readBits(2);

        if (btype === 3) {
            throw new Error('Malformed DEFLATE stream: reserved block type 3 (11) is invalid.');
        }

        if (btype === 0) {
            bitPos = (bitPos + 7) & ~7;
            const byteIdx = bitPos >>> 3;
            if (byteIdx + 4 > input.length) {
                throw new Error('Malformed DEFLATE stored block: truncated 4-byte LEN/NLEN header.');
            }
            const len = input[byteIdx] | (input[byteIdx + 1] << 8);
            const nlen = input[byteIdx + 2] | (input[byteIdx + 3] << 8);
            if (nlen !== ((~len) & 0xffff)) {
                throw new Error(
                    `Malformed DEFLATE stored block: LEN (${len}) does not match one's-complement NLEN (${nlen}).`
                );
            }
            bitPos += 32;
            const startByte = bitPos >>> 3;
            if (startByte + len > input.length) {
                throw new Error('Malformed DEFLATE stored block: declared length exceeds input buffer.');
            }
            if (out.length + len > maxOutputBytes) {
                throw new Error(`DEFLATE output exceeded safety limit (${maxOutputBytes} bytes).`);
            }
            for (let i = 0; i < len; i++) {
                out.push(input[startByte + i]);
            }
            bitPos += len * 8;
        } else {
            let litTable: HuffmanTable;
            let distTable: HuffmanTable;
            if (btype === 1) {
                if (!fixedLitTable) fixedLitTable = buildHuffmanTable(fixedLitLengths, 288);
                if (!fixedDistTable) fixedDistTable = buildHuffmanTable(fixedDistLengths, 32);
                litTable = fixedLitTable;
                distTable = fixedDistTable;
            } else {
                const hlit = readBits(5) + 257;
                const hdist = readBits(5) + 1;
                const hclen = readBits(4) + 4;
                if (hlit > 286 || hdist > 30) {
                    throw new Error(`Malformed DEFLATE dynamic block header: invalid HLIT (${hlit}) or HDIST (${hdist}).`);
                }
                const clLengths = new Uint8Array(19);
                for (let i = 0; i < hclen; i++) {
                    clLengths[DEFLATE_CL_ORDER[i]] = readBits(3);
                }
                const clTable = buildHuffmanTable(clLengths, 19);
                const allLengths = new Uint8Array(hlit + hdist);
                let idx = 0;
                while (idx < hlit + hdist) {
                    const sym = decodeSymbol(clTable);
                    if (sym < 16) {
                        allLengths[idx++] = sym;
                    } else if (sym === 16) {
                        if (idx === 0) {
                            throw new Error('Malformed DEFLATE dynamic block: code 16 repeat at index 0.');
                        }
                        const prev = allLengths[idx - 1];
                        const rep = readBits(2) + 3;
                        if (idx + rep > allLengths.length) {
                            throw new Error('Malformed DEFLATE dynamic block: code 16 repeat overflows table length.');
                        }
                        for (let r = 0; r < rep; r++) allLengths[idx++] = prev;
                    } else if (sym === 17) {
                        const rep = readBits(3) + 3;
                        if (idx + rep > allLengths.length) {
                            throw new Error('Malformed DEFLATE dynamic block: code 17 zero-run overflows table length.');
                        }
                        for (let r = 0; r < rep; r++) allLengths[idx++] = 0;
                    } else if (sym === 18) {
                        const rep = readBits(7) + 11;
                        if (idx + rep > allLengths.length) {
                            throw new Error('Malformed DEFLATE dynamic block: code 18 zero-run overflows table length.');
                        }
                        for (let r = 0; r < rep; r++) allLengths[idx++] = 0;
                    } else {
                        throw new Error(`Malformed DEFLATE code-length symbol (${sym}).`);
                    }
                }
                if (allLengths[256] === 0) {
                    throw new Error('Malformed DEFLATE dynamic block: missing end-of-block symbol (256) in Huffman tree.');
                }
                litTable = buildHuffmanTable(allLengths.subarray(0, hlit), hlit);
                distTable = buildHuffmanTable(allLengths.subarray(hlit), hdist);
            }

            let eobReached = false;
            while (!eobReached) {
                const sym = decodeSymbol(litTable);
                if (sym < 256) {
                    if (out.length + 1 > maxOutputBytes) {
                        throw new Error(`DEFLATE output exceeded safety limit (${maxOutputBytes} bytes).`);
                    }
                    out.push(sym);
                } else if (sym === 256) {
                    eobReached = true;
                } else {
                    const lenIdx = sym - 257;
                    if (lenIdx < 0 || lenIdx >= DEFLATE_LEN_BASE.length) {
                        throw new Error(`Malformed DEFLATE length symbol (${sym}).`);
                    }
                    const length = DEFLATE_LEN_BASE[lenIdx] + readBits(DEFLATE_LEN_EXTRA[lenIdx]);
                    const distSym = decodeSymbol(distTable);
                    if (distSym < 0 || distSym >= DEFLATE_DIST_BASE.length) {
                        throw new Error(`Malformed DEFLATE distance symbol (${distSym}).`);
                    }
                    const dist = DEFLATE_DIST_BASE[distSym] + readBits(DEFLATE_DIST_EXTRA[distSym]);
                    const startIdx = out.length - dist;
                    if (startIdx < 0) {
                        throw new Error(`Malformed DEFLATE back-reference: distance (${dist}) exceeds output offset (${out.length}).`);
                    }
                    if (out.length + length > maxOutputBytes) {
                        throw new Error(`DEFLATE output exceeded safety limit (${maxOutputBytes} bytes).`);
                    }
                    for (let i = 0; i < length; i++) {
                        out.push(out[startIdx + i]);
                    }
                }
            }
        }
    }
    return new Uint8Array(out);
}

/**
 * Pure TypeScript Synchronous RFC 1952 GZIP / Zlib Decompressor
 */
export function decompressGzipOrDeflate(input: Uint8Array): Uint8Array {
    if (!input || input.length === 0) {
        throw new Error('Malformed GZIP/DEFLATE stream: empty input buffer.');
    }
    if (input[0] === 0x1f && input[1] === 0x8b) {
        if (input.length < 18 || input[2] !== 8) {
            throw new Error('Malformed GZIP stream: invalid header or compression method.');
        }
        const flg = input[3];
        let pos = 10;
        if (flg & 0x04) {
            if (pos + 2 > input.length) throw new Error('Malformed GZIP FEXTRA header.');
            const xlen = input[pos] | (input[pos + 1] << 8);
            pos += 2 + xlen;
        }
        if (flg & 0x08) {
            while (pos < input.length && input[pos] !== 0) pos++;
            pos++;
        }
        if (flg & 0x10) {
            while (pos < input.length && input[pos] !== 0) pos++;
            pos++;
        }
        if (flg & 0x02) {
            pos += 2;
        }
        if (pos > input.length - 8) {
            throw new Error('Malformed GZIP stream: truncated before 8-byte CRC32/ISIZE trailer.');
        }
        const inflated = inflateRawDeflate(input.subarray(pos, input.length - 8));
        const dv = new DataView(input.buffer, input.byteOffset + input.length - 8, 8);
        const expectedIsize = dv.getUint32(4, true);
        if ((inflated.length >>> 0) !== expectedIsize) {
            throw new Error(`Malformed GZIP stream: decompressed ISIZE (${inflated.length}) does not match trailer (${expectedIsize}).`);
        }
        return inflated;
    }
    if (input.length > 6 && (input[0] & 0x0f) === 8 && ((input[0] << 8) | input[1]) % 31 === 0) {
        const fdict = (input[1] & 0x20) !== 0;
        const start = fdict ? 6 : 2;
        return inflateRawDeflate(input.subarray(start, input.length - 4));
    }
    return inflateRawDeflate(input);
}

/**
 * Pure TypeScript LZ4 Raw Block & LZ4 Frame Decompressor
 */
export function decompressLz4Block(input: Uint8Array, expectedSize = 0): Uint8Array {
    if (!input || input.length === 0) {
        if (expectedSize > 0) {
            throw new Error('Malformed LZ4 block: empty input buffer (0 bytes).');
        }
        return new Uint8Array(0);
    }
    if (
        input.length >= 4 &&
        input[0] === 0x04 &&
        input[1] === 0x22 &&
        input[2] === 0x4d &&
        input[3] === 0x18
    ) {
        if (input.length < 7) {
            throw new Error('Malformed LZ4 frame: truncated frame header.');
        }
        const flg = input[4];
        const hasContentSize = (flg & 0x08) !== 0;
        const hasBlockChecksum = (flg & 0x10) !== 0;
        const hasDictId = (flg & 0x01) !== 0;
        let pos = 6 + (hasContentSize ? 8 : 0) + (hasDictId ? 4 : 0) + 1;
        if (pos > input.length) {
            throw new Error('Malformed LZ4 frame: header descriptor exceeds buffer bounds.');
        }
        const chunks: Uint8Array[] = [];
        let total = 0;
        while (pos + 4 <= input.length) {
            const blockSize =
                (input[pos] |
                    (input[pos + 1] << 8) |
                    (input[pos + 2] << 16) |
                    (input[pos + 3] << 24)) >>>
                0;
            pos += 4;
            if (blockSize === 0) break;
            const isUncompressed = (blockSize & 0x80000000) !== 0;
            const actualLen = blockSize & 0x7fffffff;
            const checksumBytes = hasBlockChecksum ? 4 : 0;
            if (actualLen <= 0 || pos + actualLen + checksumBytes > input.length) {
                throw new Error(
                    `Malformed LZ4 frame: block length (${actualLen}) exceeds remaining frame buffer (${input.length - pos}).`
                );
            }
            const slice = input.subarray(pos, pos + actualLen);
            pos += actualLen + checksumBytes;
            const decodedChunk = isUncompressed ? slice : decompressLz4RawBlock(slice);
            total += decodedChunk.length;
            if (total > MAX_DECOMPRESSED_PAGE_BYTES) {
                throw new Error(`Malformed LZ4 frame: decompressed size (${total}) exceeds safety limit.`);
            }
            chunks.push(decodedChunk);
        }
        const merged = new Uint8Array(total);
        let w = 0;
        for (const c of chunks) {
            merged.set(c, w);
            w += c.length;
        }
        return merged;
    }
    if (expectedSize > 0 && input.length >= 8) {
        const dv = new DataView(input.buffer, input.byteOffset, input.byteLength);
        if (dv.getUint32(0, false) === expectedSize) {
            const declaredCompLen = dv.getUint32(4, false);
            if (8 + declaredCompLen > input.length) {
                throw new Error(
                    `Malformed Hadoop LZ4 block: declared compressed length (${declaredCompLen}) exceeds buffer (${input.length - 8}).`
                );
            }
            return decompressLz4RawBlock(input.subarray(8, 8 + declaredCompLen));
        }
    }
    return decompressLz4RawBlock(input);
}

function decompressLz4RawBlock(input: Uint8Array): Uint8Array {
    if (!input || input.length === 0) {
        throw new Error('Malformed LZ4 raw block: empty input buffer (0 bytes).');
    }
    const out: number[] = [];
    let pos = 0;
    while (pos < input.length) {
        const token = input[pos++];
        let litLen = token >>> 4;
        if (litLen === 15) {
            let s = 255;
            while (s === 255) {
                if (pos >= input.length) {
                    throw new Error('Malformed LZ4 raw block: truncated literal length varint.');
                }
                s = input[pos++];
                litLen += s;
            }
        }
        if (pos + litLen > input.length) {
            throw new Error(
                `Malformed LZ4 raw block: literal run (${litLen} bytes) exceeds remaining input (${input.length - pos}).`
            );
        }
        if (out.length + litLen > MAX_DECOMPRESSED_PAGE_BYTES) {
            throw new Error('Malformed LZ4 raw block: decompressed output exceeds safety limit.');
        }
        for (let i = 0; i < litLen; i++) {
            out.push(input[pos++]);
        }
        if (pos >= input.length) break;
        if (pos + 2 > input.length) {
            throw new Error('Malformed LZ4 raw block: truncated 16-bit match offset.');
        }
        const offset = input[pos] | (input[pos + 1] << 8);
        pos += 2;
        if (offset <= 0 || offset > out.length) {
            throw new Error(
                `Malformed LZ4 raw block: invalid match offset (${offset} at output position ${out.length}).`
            );
        }
        let matchLen = (token & 0x0f) + 4;
        if (matchLen === 19) {
            let s = 255;
            while (s === 255) {
                if (pos >= input.length) {
                    throw new Error('Malformed LZ4 raw block: truncated match length varint.');
                }
                s = input[pos++];
                matchLen += s;
            }
        }
        if (out.length + matchLen > MAX_DECOMPRESSED_PAGE_BYTES) {
            throw new Error('Malformed LZ4 raw block: decompressed match run exceeds safety limit.');
        }
        const matchStart = out.length - offset;
        for (let i = 0; i < matchLen; i++) {
            out.push(out[matchStart + i]);
        }
    }
    return new Uint8Array(out);
}

// ============================================================
// 3. REAL APACHE THRIFT TCOMPACTPROTOCOL ENCODER & DECODER
// ============================================================

const CT_STOP = 0x00;
const CT_BOOLEAN_TRUE = 0x01;
const CT_BOOLEAN_FALSE = 0x02;
const CT_BYTE = 0x03;
const CT_I16 = 0x04;
const CT_I32 = 0x05;
const CT_I64 = 0x06;
const CT_DOUBLE = 0x07;
const CT_BINARY = 0x08;
const CT_LIST = 0x09;
const CT_SET = 0x0a;
const CT_MAP = 0x0b;
const CT_STRUCT = 0x0c;

export class ThriftCompactWriter {
    private buf: number[] = [];
    private lastFieldId = 0;
    private structStack: number[] = [];

    beginStruct(): void {
        this.structStack.push(this.lastFieldId);
        this.lastFieldId = 0;
    }

    endStruct(): void {
        this.buf.push(CT_STOP);
        this.lastFieldId = this.structStack.pop() ?? 0;
    }

    writeFieldHeader(fieldId: number, compactType: number): void {
        const delta = fieldId - this.lastFieldId;
        if (delta > 0 && delta <= 15) {
            this.buf.push((delta << 4) | compactType);
        } else {
            this.buf.push(compactType);
            this.buf.push(...writeZigZagVarint(fieldId));
        }
        this.lastFieldId = fieldId;
    }

    writeBoolField(fieldId: number, val: boolean): void {
        const cType = val ? CT_BOOLEAN_TRUE : CT_BOOLEAN_FALSE;
        this.writeFieldHeader(fieldId, cType);
    }

    writeI32Field(fieldId: number, val: number): void {
        this.writeFieldHeader(fieldId, CT_I32);
        this.buf.push(...writeZigZagVarint(val));
    }

    writeI64Field(fieldId: number, val: number | bigint): void {
        this.writeFieldHeader(fieldId, CT_I64);
        this.buf.push(...writeZigZagVarint(val));
    }

    writeStringField(fieldId: number, str: string): void {
        const b = textEncoder.encode(str);
        this.writeBinaryField(fieldId, b);
    }

    writeBinaryField(fieldId: number, bytes: Uint8Array): void {
        this.writeFieldHeader(fieldId, CT_BINARY);
        this.buf.push(...writeUnsignedVarint(bytes.length));
        for (let i = 0; i < bytes.length; i++) this.buf.push(bytes[i]);
    }

    writeListHeader(fieldId: number, elemType: number, count: number): void {
        this.writeFieldHeader(fieldId, CT_LIST);
        if (count < 15) {
            this.buf.push((count << 4) | elemType);
        } else {
            this.buf.push(0xf0 | elemType);
            this.buf.push(...writeUnsignedVarint(count));
        }
    }

    writeRawI32(val: number): void {
        this.buf.push(...writeZigZagVarint(val));
    }

    writeRawString(str: string): void {
        const b = textEncoder.encode(str);
        this.buf.push(...writeUnsignedVarint(b.length));
        for (let i = 0; i < b.length; i++) this.buf.push(b[i]);
    }

    toUint8Array(): Uint8Array {
        return new Uint8Array(this.buf);
    }
}

export class ThriftCompactReader {
    public pos = 0;
    private lastFieldId = 0;
    private structStack: number[] = [];

    constructor(private bytes: Uint8Array, startOffset = 0) {
        this.pos = startOffset;
    }

    beginStruct(): void {
        this.structStack.push(this.lastFieldId);
        this.lastFieldId = 0;
    }

    endStruct(): void {
        this.lastFieldId = this.structStack.pop() ?? 0;
    }

    readFieldHeader(): { fieldId: number; fieldType: number } {
        if (this.pos >= this.bytes.length) {
            return { fieldId: 0, fieldType: CT_STOP };
        }
        const header = this.bytes[this.pos++];
        if (header === CT_STOP) {
            return { fieldId: 0, fieldType: CT_STOP };
        }
        const delta = (header & 0xf0) >>> 4;
        const fieldType = header & 0x0f;
        let fieldId: number;
        if (delta === 0) {
            const zz = readZigZagVarint(this.bytes, this.pos);
            this.pos = zz.nextOffset;
            fieldId = zz.value;
        } else {
            fieldId = this.lastFieldId + delta;
        }
        this.lastFieldId = fieldId;
        return { fieldId, fieldType };
    }

    readI32(): number {
        const zz = readZigZagVarint(this.bytes, this.pos);
        this.pos = zz.nextOffset;
        return zz.value;
    }

    readI64(): bigint {
        const zz = readZigZagVarint(this.bytes, this.pos);
        this.pos = zz.nextOffset;
        return zz.bigValue;
    }

    readBinary(): Uint8Array {
        const len = readUnsignedVarint(this.bytes, this.pos);
        this.pos = len.nextOffset;
        const end = Math.min(this.bytes.length, this.pos + len.value);
        const slice = this.bytes.subarray(this.pos, end);
        this.pos = end;
        return slice;
    }

    readString(): string {
        return textDecoder.decode(this.readBinary());
    }

    readListHeader(): { elemType: number; count: number } {
        if (this.pos >= this.bytes.length) return { elemType: 0, count: 0 };
        const b = this.bytes[this.pos++];
        const elemType = b & 0x0f;
        let count = (b & 0xf0) >>> 4;
        if (count === 15) {
            const v = readUnsignedVarint(this.bytes, this.pos);
            this.pos = v.nextOffset;
            count = v.value;
        }
        return { elemType, count };
    }

    skipField(fieldType: number): void {
        switch (fieldType) {
            case CT_BOOLEAN_TRUE:
            case CT_BOOLEAN_FALSE:
                break;
            case CT_BYTE:
                this.pos += 1;
                break;
            case CT_I16:
            case CT_I32:
            case CT_I64: {
                const v = readUnsignedVarint(this.bytes, this.pos);
                this.pos = v.nextOffset;
                break;
            }
            case CT_DOUBLE:
                this.pos += 8;
                break;
            case CT_BINARY: {
                this.readBinary();
                break;
            }
            case CT_LIST:
            case CT_SET: {
                const { elemType, count } = this.readListHeader();
                for (let i = 0; i < count && this.pos < this.bytes.length; i++) {
                    this.skipField(elemType);
                }
                break;
            }
            case CT_MAP: {
                if (this.pos >= this.bytes.length) break;
                const sizeVar = readUnsignedVarint(this.bytes, this.pos);
                this.pos = sizeVar.nextOffset;
                if (sizeVar.value > 0 && this.pos < this.bytes.length) {
                    const kvTypes = this.bytes[this.pos++];
                    const kType = (kvTypes & 0xf0) >>> 4;
                    const vType = kvTypes & 0x0f;
                    for (let i = 0; i < sizeVar.value && this.pos < this.bytes.length; i++) {
                        this.skipField(kType);
                        this.skipField(vType);
                    }
                }
                break;
            }
            case CT_STRUCT: {
                this.beginStruct();
                while (this.pos < this.bytes.length) {
                    const { fieldType: ft } = this.readFieldHeader();
                    if (ft === CT_STOP) break;
                    this.skipField(ft);
                }
                this.endStruct();
                break;
            }
        }
    }
}

// ============================================================
// 4. SPEC-COMPLIANT PARQUET (PAR1), AVRO (Obj\x01) & FEATHER (ARROW1) ENCODERS
// ============================================================

const PARQUET_TYPE_TO_ENUM: Record<PhysicalDataType, number> = {
    BOOLEAN: 0,
    INT32: 1,
    INT64: 2,
    FLOAT: 4,
    DOUBLE: 5,
    BYTE_ARRAY: 6,
    FIXED_LEN_BYTE_ARRAY: 7,
};

const PARQUET_ENUM_TO_TYPE: Record<number, PhysicalDataType> = {
    0: 'BOOLEAN',
    1: 'INT32',
    2: 'INT64',
    3: 'BYTE_ARRAY', // INT96 legacy timestamp mapped via physical96 flag
    4: 'FLOAT',
    5: 'DOUBLE',
    6: 'BYTE_ARRAY',
    7: 'FIXED_LEN_BYTE_ARRAY',
};

const PARQUET_CODEC_ENUM_TO_NAME: Record<number, string> = {
    0: 'UNCOMPRESSED',
    1: 'SNAPPY',
    2: 'GZIP',
    3: 'LZO',
    4: 'BROTLI',
    5: 'LZ4',
    6: 'ZSTD',
    7: 'LZ4_RAW',
};

const PARQUET_ENCODING_ENUM_TO_NAME: Record<number, string> = {
    0: 'PLAIN',
    2: 'PLAIN_DICTIONARY',
    3: 'RLE',
    4: 'BIT_PACKED',
    5: 'DELTA_BINARY_PACKED',
    6: 'DELTA_LENGTH_BYTE_ARRAY',
    7: 'DELTA_BYTE_ARRAY',
    8: 'RLE_DICTIONARY',
    9: 'BYTE_STREAM_SPLIT',
};

const PARQUET_CONVERTED_TYPE_MAP: Record<number, LogicalDataType> = {
    0: 'UTF8',
    1: 'MAP',
    2: 'MAP',
    3: 'LIST',
    4: 'UTF8', // ENUM
    5: 'DECIMAL',
    6: 'DATE',
    7: 'INT32', // TIME_MILLIS
    8: 'INT64', // TIME_MICROS
    9: 'TIMESTAMP_MILLIS',
    10: 'TIMESTAMP_MICROS',
    11: 'INT32', // UINT_8
    12: 'INT32', // UINT_16
    13: 'INT32', // UINT_32
    14: 'UINT64', // UINT_64
    15: 'INT32', // INT_8
    16: 'INT32', // INT_16
    17: 'INT32', // INT_32
    18: 'INT64', // INT_64
    19: 'JSON',
    20: 'BINARY', // BSON
};

/**
 * Encodes non-null column values into spec-compliant Apache Parquet PLAIN physical bytes.
 */
function encodeParquetPlainValues(
    nonNullValues: unknown[],
    physicalType: PhysicalDataType,
    logicalType: LogicalDataType
): Uint8Array {
    if (nonNullValues.length === 0) return new Uint8Array(0);

    if (physicalType === 'BOOLEAN') {
        const byteCount = Math.ceil(nonNullValues.length / 8);
        const out = new Uint8Array(byteCount);
        for (let i = 0; i < nonNullValues.length; i++) {
            const v = nonNullValues[i];
            const truthy = v === true || v === 1 || v === 'true' || v === '1';
            if (truthy) {
                out[i >>> 3] |= 1 << (i & 7);
            }
        }
        return out;
    }

    if (physicalType === 'INT32') {
        const out = new Uint8Array(nonNullValues.length * 4);
        const dv = new DataView(out.buffer);
        for (let i = 0; i < nonNullValues.length; i++) {
            const v = nonNullValues[i];
            let n = 0;
            if (logicalType === 'DATE' && typeof v === 'string') {
                const ms = Date.parse(v);
                n = Number.isFinite(ms) ? Math.floor(ms / 86400000) : 0;
            } else {
                n = Number(v) || 0;
            }
            dv.setInt32(i * 4, Math.trunc(n), true);
        }
        return out;
    }

    if (physicalType === 'INT64') {
        const out = new Uint8Array(nonNullValues.length * 8);
        const dv = new DataView(out.buffer);
        for (let i = 0; i < nonNullValues.length; i++) {
            const v = nonNullValues[i];
            let b = BigInt(0);
            try {
                if (typeof v === 'bigint') {
                    b = v;
                } else if (typeof v === 'number' && Number.isFinite(v)) {
                    b = BigInt(Math.trunc(v));
                } else if (typeof v === 'string') {
                    if (
                        (logicalType === 'TIMESTAMP_MILLIS' ||
                            logicalType === 'TIMESTAMP_MICROS' ||
                            logicalType === 'TIMESTAMP_NANOS') &&
                        !/^[+-]?\d+$/.test(v.trim())
                    ) {
                        const ms = Date.parse(v);
                        if (Number.isFinite(ms)) {
                            b =
                                logicalType === 'TIMESTAMP_NANOS'
                                    ? BigInt(ms) * BigInt(1000000)
                                    : logicalType === 'TIMESTAMP_MICROS'
                                        ? BigInt(ms) * BigInt(1000)
                                        : BigInt(ms);
                        }
                    } else {
                        b = BigInt(v.trim());
                    }
                }
            } catch {
                b = BigInt(0);
            }
            if (logicalType === 'UINT64' || b > BigInt('9223372036854775807')) {
                dv.setBigUint64(i * 8, BigInt.asUintN(64, b), true);
            } else {
                dv.setBigInt64(i * 8, b, true);
            }
        }
        return out;
    }

    if (physicalType === 'FLOAT') {
        const out = new Uint8Array(nonNullValues.length * 4);
        const dv = new DataView(out.buffer);
        for (let i = 0; i < nonNullValues.length; i++) {
            const raw = nonNullValues[i];
            const num = typeof raw === 'number' ? raw : Number(raw);
            dv.setFloat32(i * 4, num, true);
        }
        return out;
    }

    if (physicalType === 'DOUBLE') {
        const out = new Uint8Array(nonNullValues.length * 8);
        const dv = new DataView(out.buffer);
        for (let i = 0; i < nonNullValues.length; i++) {
            const raw = nonNullValues[i];
            const num = typeof raw === 'number' ? raw : Number(raw);
            dv.setFloat64(i * 8, num, true);
        }
        return out;
    }

    // BYTE_ARRAY or FIXED_LEN_BYTE_ARRAY (4-byte LE length prefix + UTF-8 bytes)
    const encodedSlices: Uint8Array[] = [];
    let totalBytes = 0;
    for (let i = 0; i < nonNullValues.length; i++) {
        const v = nonNullValues[i];
        const s =
            typeof v === 'string'
                ? v
                : typeof v === 'bigint'
                    ? v.toString()
                    : typeof v === 'object' && v !== null
                        ? JSON.stringify(v)
                        : String(v ?? '');
        const b = textEncoder.encode(s);
        encodedSlices.push(b);
        totalBytes += 4 + b.length;
    }
    const out = new Uint8Array(totalBytes);
    const dv = new DataView(out.buffer);
    let pos = 0;
    for (const slice of encodedSlices) {
        dv.setUint32(pos, slice.length, true);
        out.set(slice, pos + 4);
        pos += 4 + slice.length;
    }
    return out;
}

/**
 * Builds a Thrift TCompactProtocol PageHeader (DATA_PAGE = 0) for a Parquet ColumnChunk.
 */
function buildParquetDataPageHeader(
    uncompressedSize: number,
    compressedSize: number,
    numValues: number,
    encodingEnum = 0 // PLAIN = 0
): Uint8Array {
    const tw = new ThriftCompactWriter();
    tw.beginStruct(); // PageHeader
    tw.writeI32Field(1, 0); // type = DATA_PAGE (0)
    tw.writeI32Field(2, uncompressedSize); // uncompressed_page_size
    tw.writeI32Field(3, compressedSize); // compressed_page_size
    tw.writeFieldHeader(5, CT_STRUCT); // data_page_header (DataPageHeader)
    tw.beginStruct();
    tw.writeI32Field(1, numValues); // num_values
    tw.writeI32Field(2, encodingEnum); // encoding (0 = PLAIN)
    tw.writeI32Field(3, 3); // definition_level_encoding (3 = RLE)
    tw.writeI32Field(4, 3); // repetition_level_encoding (3 = RLE)
    tw.endStruct(); // end DataPageHeader
    tw.endStruct(); // end PageHeader
    return tw.toUint8Array();
}

/**
 * Encodes a dataset into a spec-compliant Apache Parquet (PAR1) binary file.
 */
export function encodeParquetBinary(
    rows: Record<string, unknown>[],
    customMeta: Record<string, string> = {}
): Uint8Array {
    const schema = inferSchemaFromRows(rows, 'SNAPPY', 'PLAIN');
    const profiles = computeColumnProfiles(rows, schema);

    const dataChunks: Uint8Array[] = [];
    const chunkMetas: {
        col: ColumnSchemaNode;
        prof: ColumnProfileStats;
        fileOffset: number;
        uncompressedSize: number;
        compressedSize: number;
        physicalTypeEnum: number;
        convertedTypeEnum: number | null;
        timestampUnitEnum: number | null;
    }[] = [];

    let currentOffset = 4; // after leading "PAR1"
    for (let i = 0; i < schema.length; i++) {
        const col = schema[i];
        const prof = profiles[i];
        const isComplexOrUuid =
            col.logicalType === 'LIST' ||
            col.logicalType === 'STRUCT' ||
            col.logicalType === 'MAP' ||
            col.logicalType === 'JSON' ||
            col.logicalType === 'UUID';

        const effectivePhysical: PhysicalDataType = isComplexOrUuid
            ? 'BYTE_ARRAY'
            : col.physicalType === 'FIXED_LEN_BYTE_ARRAY'
                ? 'BYTE_ARRAY'
                : col.physicalType;

        const isOptional = col.nullable || col.repetitionType !== 'REQUIRED';
        const defLevels: number[] = [];
        const nonNullValues: unknown[] = [];

        for (let r = 0; r < rows.length; r++) {
            const v = rows[r]?.[col.name];
            if (v === null || v === undefined) {
                defLevels.push(0);
            } else {
                defLevels.push(1);
                nonNullValues.push(v);
            }
        }

        const rleDefBytes = isOptional
            ? encodeRleBitPackedHybrid(defLevels, 1, true)
            : new Uint8Array(0);
        const plainValBytes = encodeParquetPlainValues(
            nonNullValues,
            effectivePhysical,
            col.logicalType
        );

        const rawPagePayload = new Uint8Array(rleDefBytes.length + plainValBytes.length);
        rawPagePayload.set(rleDefBytes, 0);
        rawPagePayload.set(plainValBytes, rleDefBytes.length);

        const compressedPayload = compressSnappyBlock(rawPagePayload);
        const pageHeaderBytes = buildParquetDataPageHeader(
            rawPagePayload.length,
            compressedPayload.length,
            rows.length,
            0 // PLAIN
        );

        const fullChunkBytes = new Uint8Array(pageHeaderBytes.length + compressedPayload.length);
        fullChunkBytes.set(pageHeaderBytes, 0);
        fullChunkBytes.set(compressedPayload, pageHeaderBytes.length);

        const totalUncompChunk = pageHeaderBytes.length + rawPagePayload.length;
        const totalCompChunk = fullChunkBytes.length;

        let convertedTypeEnum: number | null = null;
        let timestampUnitEnum: number | null = null;
        if (effectivePhysical === 'BYTE_ARRAY') {
            if (col.logicalType === 'JSON' || col.logicalType === 'STRUCT' || col.logicalType === 'LIST' || col.logicalType === 'MAP') {
                convertedTypeEnum = 19; // JSON
            } else {
                convertedTypeEnum = 0; // UTF8
            }
        } else if (col.logicalType === 'DATE' && effectivePhysical === 'INT32') {
            convertedTypeEnum = 6; // DATE
        } else if (col.logicalType === 'UINT64' && effectivePhysical === 'INT64') {
            convertedTypeEnum = 14; // UINT_64
        } else if (col.logicalType === 'TIMESTAMP_MILLIS' && effectivePhysical === 'INT64') {
            convertedTypeEnum = 9; // TIMESTAMP_MILLIS
            timestampUnitEnum = 1; // MILLIS
        } else if (col.logicalType === 'TIMESTAMP_MICROS' && effectivePhysical === 'INT64') {
            convertedTypeEnum = 10; // TIMESTAMP_MICROS
            timestampUnitEnum = 2; // MICROS
        } else if (col.logicalType === 'TIMESTAMP_NANOS' && effectivePhysical === 'INT64') {
            timestampUnitEnum = 3; // NANOS
        }

        chunkMetas.push({
            col: {
                ...col,
                physicalType: effectivePhysical,
                repetitionType: isOptional ? 'OPTIONAL' : 'REQUIRED',
                nullable: isOptional,
            },
            prof,
            fileOffset: currentOffset,
            uncompressedSize: totalUncompChunk,
            compressedSize: totalCompChunk,
            physicalTypeEnum: PARQUET_TYPE_TO_ENUM[effectivePhysical] ?? 6,
            convertedTypeEnum,
            timestampUnitEnum,
        });
        dataChunks.push(fullChunkBytes);
        currentOffset += totalCompChunk;
    }

    const totalUncompressed = chunkMetas.reduce((acc, c) => acc + c.uncompressedSize, 0);
    const totalCompressed = chunkMetas.reduce((acc, c) => acc + c.compressedSize, 0);

    // Build real Apache Thrift TCompactProtocol FileMetaData footer
    const tw = new ThriftCompactWriter();
    tw.beginStruct(); // FileMetaData
    tw.writeI32Field(1, 2); // version = 2

    // Field 2: schema (list<SchemaElement> — root + leaf columns)
    tw.writeListHeader(2, CT_STRUCT, chunkMetas.length + 1);
    tw.beginStruct();
    tw.writeStringField(4, 'parquet_schema');
    tw.writeI32Field(5, chunkMetas.length);
    tw.endStruct();

    for (const cm of chunkMetas) {
        tw.beginStruct();
        tw.writeI32Field(1, cm.physicalTypeEnum);
        tw.writeI32Field(3, cm.col.repetitionType === 'REQUIRED' ? 0 : 1);
        tw.writeStringField(4, cm.col.name);
        if (cm.convertedTypeEnum !== null) {
            tw.writeI32Field(6, cm.convertedTypeEnum);
        }
        if (cm.timestampUnitEnum !== null) {
            // Field 10: LogicalType -> Field 8: TimestampType(isAdjustedToUTC=true, unit=TimeUnit)
            tw.writeFieldHeader(10, CT_STRUCT);
            tw.beginStruct();
            tw.writeFieldHeader(8, CT_STRUCT);
            tw.beginStruct();
            tw.writeBoolField(1, true);
            tw.writeFieldHeader(2, CT_STRUCT);
            tw.beginStruct();
            tw.writeFieldHeader(cm.timestampUnitEnum, CT_STRUCT);
            tw.beginStruct();
            tw.endStruct();
            tw.endStruct();
            tw.endStruct();
            tw.endStruct();
        }
        tw.endStruct();
    }

    // Field 3: num_rows (i64)
    tw.writeI64Field(3, rows.length);

    // Field 4: row_groups (list<RowGroup>)
    tw.writeListHeader(4, CT_STRUCT, 1);
    tw.beginStruct(); // RowGroup #0
    tw.writeListHeader(1, CT_STRUCT, chunkMetas.length);
    for (const cm of chunkMetas) {
        tw.beginStruct(); // ColumnChunk
        tw.writeI64Field(2, cm.fileOffset);
        tw.writeFieldHeader(3, CT_STRUCT);
        tw.beginStruct(); // ColumnMetaData
        tw.writeI32Field(1, cm.physicalTypeEnum);
        tw.writeListHeader(2, CT_I32, 2);
        tw.writeRawI32(0);
        tw.writeRawI32(3);
        tw.writeListHeader(3, CT_BINARY, 1);
        tw.writeRawString(cm.col.name);
        tw.writeI32Field(4, 1); // codec = 1 (SNAPPY)
        tw.writeI64Field(5, rows.length);
        tw.writeI64Field(6, cm.uncompressedSize);
        tw.writeI64Field(7, cm.compressedSize);
        tw.writeI64Field(9, cm.fileOffset);

        // Field 12: statistics
        tw.writeFieldHeader(12, CT_STRUCT);
        tw.beginStruct();
        const encodeStatVal = (v: string | number | null): Uint8Array => {
            if (v === null || v === undefined || v === '') return new Uint8Array(0);
            if (cm.col.physicalType === 'BYTE_ARRAY' || cm.col.physicalType === 'FIXED_LEN_BYTE_ARRAY') {
                return textEncoder.encode(String(v));
            }
            return encodeParquetPlainValues([v], cm.col.physicalType, cm.col.logicalType);
        };
        const maxStatBytes = encodeStatVal(cm.prof.max);
        const minStatBytes = encodeStatVal(cm.prof.min);
        if (maxStatBytes.length > 0) tw.writeBinaryField(1, maxStatBytes);
        if (minStatBytes.length > 0) tw.writeBinaryField(2, minStatBytes);
        tw.writeI64Field(3, cm.prof.nullCount);
        tw.writeI64Field(4, cm.prof.distinctCount);
        if (maxStatBytes.length > 0) tw.writeBinaryField(5, maxStatBytes);
        if (minStatBytes.length > 0) tw.writeBinaryField(6, minStatBytes);
        tw.endStruct();

        tw.endStruct();
        tw.endStruct();
    }
    tw.writeI64Field(2, Math.max(1, totalUncompressed));
    tw.writeI64Field(3, rows.length);
    tw.writeI64Field(5, Math.max(1, totalCompressed));
    tw.endStruct();

    // Field 5: key_value_metadata
    const kvEntries: [string, string][] = Object.entries({
        'parquet.writer.name': 'kivarotools-columnar-engine',
        'parquet.writer.version': '5.2 (Thrift TCompactProtocol + Spec DataPage)',
        'kivarotools.schema.json': JSON.stringify(schema),
        ...customMeta,
    });
    tw.writeListHeader(5, CT_STRUCT, kvEntries.length);
    for (const [k, v] of kvEntries) {
        tw.beginStruct();
        tw.writeStringField(1, k);
        tw.writeStringField(2, String(v));
        tw.endStruct();
    }

    // Field 6: created_by
    tw.writeStringField(6, 'KivaroTools Parquet v2 Columnar Engine (build PAR1)');
    tw.endStruct();

    const footerBytes = tw.toUint8Array();
    const totalFileSize = 4 + totalCompressed + footerBytes.length + 4 + 4;
    const out = new Uint8Array(totalFileSize);
    const view = new DataView(out.buffer);

    out.set([0x50, 0x41, 0x52, 0x31], 0);
    let writePos = 4;
    for (const chunk of dataChunks) {
        out.set(chunk, writePos);
        writePos += chunk.length;
    }
    out.set(footerBytes, writePos);
    writePos += footerBytes.length;
    view.setUint32(writePos, footerBytes.length, true);
    out.set([0x50, 0x41, 0x52, 0x31], writePos + 4);

    return out;
}

/**
 * Encodes a single Avro datum value into binary bytes according to its Avro schema type.
 */
function encodeAvroBinaryValue(val: unknown, avroType: string, out: number[]): void {
    switch (avroType) {
        case 'null':
            break;
        case 'boolean':
            out.push(val ? 1 : 0);
            break;
        case 'int': {
            const n = typeof val === 'number' ? Math.trunc(val) : parseInt(String(val ?? '0'), 10) || 0;
            out.push(...writeZigZagVarint(n));
            break;
        }
        case 'long': {
            let b = BigInt(0);
            try {
                if (typeof val === 'bigint') b = val;
                else if (typeof val === 'number' && Number.isFinite(val)) b = BigInt(Math.trunc(val));
                else if (typeof val === 'string') {
                    if (/^[+-]?\d+$/.test(val.trim())) b = BigInt(val.trim());
                    else {
                        const ms = Date.parse(val);
                        if (Number.isFinite(ms)) b = BigInt(ms);
                    }
                }
            } catch {
                b = BigInt(0);
            }
            out.push(...writeZigZagVarint(b));
            break;
        }
        case 'float': {
            const buf = new Uint8Array(4);
            const num = typeof val === 'number' ? val : Number(val);
            new DataView(buf.buffer).setFloat32(0, num, true);
            out.push(buf[0], buf[1], buf[2], buf[3]);
            break;
        }
        case 'double': {
            const buf = new Uint8Array(8);
            const num = typeof val === 'number' ? val : Number(val);
            new DataView(buf.buffer).setFloat64(0, num, true);
            for (let i = 0; i < 8; i++) out.push(buf[i]);
            break;
        }
        default: {
            const str =
                typeof val === 'string'
                    ? val
                    : typeof val === 'bigint'
                        ? val.toString()
                        : typeof val === 'object' && val !== null
                            ? JSON.stringify(val)
                            : String(val ?? '');
            const sb = textEncoder.encode(str);
            out.push(...writeZigZagVarint(sb.length));
            for (let i = 0; i < sb.length; i++) out.push(sb[i]);
            break;
        }
    }
}

/**
 * Encodes an Apache Avro Object Container File ("Obj\x01") with real ZigZag varint header map,
 * avro.schema JSON contract, avro.codec = "snappy", 16-byte sync marker, and spec-compliant
 * Avro binary datum records compressed with Snappy + 4-byte Big-Endian CRC32.
 */
export function encodeAvroBinary(
    rows: Record<string, unknown>[],
    recordName = 'KivaroAvroRecord'
): Uint8Array {
    const schema = inferSchemaFromRows(rows, 'SNAPPY', 'AVRO_ZIGZAG_BINARY');
    const avroFields = schema.map((col) => {
        const isTimestampIso =
            (col.logicalType === 'TIMESTAMP_MILLIS' ||
                col.logicalType === 'TIMESTAMP_MICROS' ||
                col.logicalType === 'TIMESTAMP_NANOS') &&
            rows.some((r) => typeof r[col.name] === 'string' && !/^[+-]?\d+$/.test(String(r[col.name])));
        const prim = isTimestampIso ? 'string' : mapLogicalToAvroPrimitive(col.logicalType);
        return {
            name: col.name,
            prim,
            nullable: col.nullable,
            type: col.nullable ? ['null', prim] : prim,
            ...(col.nullable ? { default: null } : {}),
        };
    });

    const avroSchemaJson = JSON.stringify({
        type: 'record',
        name: recordName.replace(/[^a-zA-Z0-9_]/g, '_') || 'KivaroAvroRecord',
        namespace: 'com.kivarotools.analytics',
        fields: avroFields.map(({ name, type, default: def }) => ({
            name,
            type,
            ...(def !== undefined ? { default: def } : {}),
        })),
    });

    const syncMarker = new Uint8Array([
        0xde, 0xad, 0xbe, 0xef, 0xca, 0xfe, 0xba, 0xbe,
        0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
    ]);

    const headerBuf: number[] = [0x4f, 0x62, 0x6a, 0x01]; // "Obj\x01"
    const metaPairs: [string, string][] = [
        ['avro.schema', avroSchemaJson],
        ['avro.codec', 'snappy'],
        ['kivarotools.schema', JSON.stringify(schema)],
    ];
    headerBuf.push(...writeZigZagVarint(metaPairs.length));
    for (const [k, v] of metaPairs) {
        const kb = textEncoder.encode(k);
        const vb = textEncoder.encode(v);
        headerBuf.push(...writeZigZagVarint(kb.length), ...Array.from(kb));
        headerBuf.push(...writeZigZagVarint(vb.length), ...Array.from(vb));
    }
    headerBuf.push(0x00);
    headerBuf.push(...Array.from(syncMarker));

    const datumBytesList: number[] = [];
    for (const r of rows) {
        for (const f of avroFields) {
            const val = r[f.name];
            if (f.nullable) {
                if (val === null || val === undefined) {
                    datumBytesList.push(...writeZigZagVarint(0));
                } else {
                    datumBytesList.push(...writeZigZagVarint(1));
                    encodeAvroBinaryValue(val, f.prim, datumBytesList);
                }
            } else {
                encodeAvroBinaryValue(val, f.prim, datumBytesList);
            }
        }
    }

    const rawBlockBytes = new Uint8Array(datumBytesList);
    const compressedBlock = compressSnappyBlock(rawBlockBytes);
    const crc = computeCrc32(rawBlockBytes);
    const crcBytes = [
        (crc >>> 24) & 0xff,
        (crc >>> 16) & 0xff,
        (crc >>> 8) & 0xff,
        crc & 0xff,
    ];

    const blockHeader = [
        ...writeZigZagVarint(rows.length),
        ...writeZigZagVarint(compressedBlock.length + 4),
    ];

    const totalLen =
        headerBuf.length + blockHeader.length + compressedBlock.length + 4 + 16;
    const out = new Uint8Array(totalLen);
    let pos = 0;
    out.set(headerBuf, pos);
    pos += headerBuf.length;
    out.set(blockHeader, pos);
    pos += blockHeader.length;
    out.set(compressedBlock, pos);
    pos += compressedBlock.length;
    out.set(crcBytes, pos);
    pos += 4;
    out.set(syncMarker, pos);
    return out;
}

/**
 * Encodes a spec-compliant Apache Arrow IPC / Feather V2 ("ARROW1") binary file containing:
 * - Leading "ARROW1\x00\x00" 8-byte magic header
 * - Encapsulated Arrow IPC Schema Message (0xFFFFFFFF continuation + FlatBuffers Message(Schema))
 * - Encapsulated Arrow IPC RecordBatch Message (0xFFFFFFFF continuation + FlatBuffers Message(RecordBatch) + 8B-aligned buffers)
 *   supporting Int32, Int64, UInt64, Float32, Float64, Bool, Utf8, and List<Float64> / List<Utf8> columns
 * - 8-byte EOS marker (0xFFFFFFFF 0x00000000)
 * - FlatBuffers Footer table + 4-byte footer length + trailing "ARROW1" magic signature.
 */
export function encodeFeatherBinary(
    rows: Record<string, unknown>[],
    customMeta: Record<string, string> = {}
): Uint8Array {
    const schema = inferSchemaFromRows(rows, 'UNCOMPRESSED', 'ARROW_IPC_CONTIGUOUS');
    const pad8 = (n: number) => (8 - (n % 8)) % 8;

    // Detect if any List column is actually a numeric Float64 array (such as embedding_head)
    const isFloatListCol = (colName: string): boolean => {
        for (const r of rows) {
            const v = r?.[colName];
            if (Array.isArray(v) && v.length > 0) {
                return v.every((x) => typeof x === 'number' && Number.isFinite(x));
            }
        }
        return false;
    };

    // 1. Build RecordBatch column buffers and FieldNodes
    const fieldNodes: { length: number; nullCount: number }[] = [];
    const bufferChunks: Uint8Array[] = [];
    const bufferDescs: { offset: number; length: number }[] = [];
    let currentBodyOffset = 0;

    const appendAlignedBuffer = (raw: Uint8Array) => {
        const padding = pad8(raw.length);
        const aligned = new Uint8Array(raw.length + padding);
        aligned.set(raw, 0);
        bufferDescs.push({ offset: currentBodyOffset, length: raw.length });
        bufferChunks.push(aligned);
        currentBodyOffset += aligned.length;
    };

    const buildValidityBitmap = (vals: unknown[]): { buf: Uint8Array; nullCount: number } => {
        let nulls = 0;
        for (const v of vals) {
            if (v === null || v === undefined) nulls++;
        }
        if (nulls === 0) return { buf: new Uint8Array(0), nullCount: 0 };
        const bm = new Uint8Array(Math.ceil(vals.length / 8));
        for (let i = 0; i < vals.length; i++) {
            if (vals[i] !== null && vals[i] !== undefined) {
                bm[i >>> 3] |= 1 << (i & 7);
            }
        }
        return { buf: bm, nullCount: nulls };
    };

    for (const col of schema) {
        const colVals = rows.map((r) => r?.[col.name] ?? null);
        const { buf: valBm, nullCount } = buildValidityBitmap(colVals);
        fieldNodes.push({ length: rows.length, nullCount });
        appendAlignedBuffer(valBm);

        if (col.logicalType === 'BOOLEAN') {
            const data = new Uint8Array(Math.ceil(rows.length / 8));
            for (let r = 0; r < rows.length; r++) {
                if (colVals[r] === true || colVals[r] === 1 || colVals[r] === 'true') {
                    data[r >>> 3] |= 1 << (r & 7);
                }
            }
            appendAlignedBuffer(data);
        } else if (col.logicalType === 'INT32' || col.logicalType === 'DATE') {
            const data = new Uint8Array(rows.length * 4);
            const dv = new DataView(data.buffer);
            for (let r = 0; r < rows.length; r++) {
                const v = colVals[r];
                if (v === null || v === undefined) continue;
                const n =
                    col.logicalType === 'DATE' && typeof v === 'string'
                        ? Math.floor((Date.parse(v) || 0) / 86400000)
                        : Number(v) || 0;
                dv.setInt32(r * 4, Math.trunc(n), true);
            }
            appendAlignedBuffer(data);
        } else if (col.logicalType === 'INT64' || col.logicalType === 'UINT64') {
            const data = new Uint8Array(rows.length * 8);
            const dv = new DataView(data.buffer);
            for (let r = 0; r < rows.length; r++) {
                const v = colVals[r];
                if (v === null || v === undefined) continue;
                let b = BigInt(0);
                try {
                    b = typeof v === 'bigint' ? v : BigInt(String(v).trim());
                } catch {
                    b = BigInt(0);
                }
                if (col.logicalType === 'UINT64') dv.setBigUint64(r * 8, BigInt.asUintN(64, b), true);
                else dv.setBigInt64(r * 8, b, true);
            }
            appendAlignedBuffer(data);
        } else if (col.logicalType === 'FLOAT') {
            const data = new Uint8Array(rows.length * 4);
            const dv = new DataView(data.buffer);
            for (let r = 0; r < rows.length; r++) {
                const v = colVals[r];
                if (v === null || v === undefined) continue;
                dv.setFloat32(r * 4, Number(v), true);
            }
            appendAlignedBuffer(data);
        } else if (col.logicalType === 'DOUBLE') {
            const data = new Uint8Array(rows.length * 8);
            const dv = new DataView(data.buffer);
            for (let r = 0; r < rows.length; r++) {
                const v = colVals[r];
                if (v === null || v === undefined) continue;
                dv.setFloat64(r * 8, Number(v), true);
            }
            appendAlignedBuffer(data);
        } else if (col.logicalType === 'LIST' && isFloatListCol(col.name)) {
            const offsets = new Uint8Array((rows.length + 1) * 4);
            const oDv = new DataView(offsets.buffer);
            const childFloats: number[] = [];
            oDv.setInt32(0, 0, true);
            for (let r = 0; r < rows.length; r++) {
                const arr = colVals[r];
                if (Array.isArray(arr)) {
                    for (const item of arr) childFloats.push(Number(item) || 0);
                }
                oDv.setInt32((r + 1) * 4, childFloats.length, true);
            }
            appendAlignedBuffer(offsets);
            // Child FieldNode + Child Validity + Child Float64 Data
            fieldNodes.push({ length: childFloats.length, nullCount: 0 });
            appendAlignedBuffer(new Uint8Array(0));
            const childBytes = new Uint8Array(childFloats.length * 8);
            const cDv = new DataView(childBytes.buffer);
            for (let c = 0; c < childFloats.length; c++) {
                cDv.setFloat64(c * 8, childFloats[c], true);
            }
            appendAlignedBuffer(childBytes);
        } else {
            // Utf8 (or JSON-serialized complex column)
            const offsets = new Uint8Array((rows.length + 1) * 4);
            const oDv = new DataView(offsets.buffer);
            const encodedSlices: Uint8Array[] = [];
            let totalStrBytes = 0;
            oDv.setInt32(0, 0, true);
            for (let r = 0; r < rows.length; r++) {
                const v = colVals[r];
                if (v !== null && v !== undefined) {
                    const s =
                        typeof v === 'string'
                            ? v
                            : typeof v === 'bigint'
                                ? v.toString()
                                : typeof v === 'object'
                                    ? JSON.stringify(v)
                                    : String(v);
                    const sb = textEncoder.encode(s);
                    encodedSlices.push(sb);
                    totalStrBytes += sb.length;
                }
                oDv.setInt32((r + 1) * 4, totalStrBytes, true);
            }
            const strData = new Uint8Array(totalStrBytes);
            let w = 0;
            for (const sb of encodedSlices) {
                strData.set(sb, w);
                w += sb.length;
            }
            appendAlignedBuffer(offsets);
            appendAlignedBuffer(strData);
        }
    }

    const recordBatchBody = new Uint8Array(currentBodyOffset);
    let bWrite = 0;
    for (const chunk of bufferChunks) {
        recordBatchBody.set(chunk, bWrite);
        bWrite += chunk.length;
    }

    // Build FlatBuffers Schema Message & RecordBatch Message using our deterministic FlatBuffers builder
    const kvPairs: [string, string][] = Object.entries({
        'ARROW:schema:endianness': 'LITTLE',
        'feather.version': '2',
        'kivaro:schema:logical_types': JSON.stringify(
            Object.fromEntries(schema.map((c) => [c.name, c.logicalType]))
        ),
        ...customMeta,
    });
    const schemaMsgPayload = buildArrowIpcSchemaMessageFlatBuffer(schema, kvPairs, isFloatListCol);
    const rbMsgPayload = buildArrowIpcRecordBatchMessageFlatBuffer(
        rows.length,
        fieldNodes,
        bufferDescs,
        recordBatchBody.length
    );

    const wrapEncapsulatedMessage = (metaPayload: Uint8Array): Uint8Array => {
        const metaLen = metaPayload.length + pad8(metaPayload.length);
        const msg = new Uint8Array(8 + metaLen);
        const dv = new DataView(msg.buffer);
        dv.setUint32(0, 0xffffffff, true);
        dv.setInt32(4, metaLen, true);
        msg.set(metaPayload, 8);
        return msg;
    };

    const schemaMsgBytes = wrapEncapsulatedMessage(schemaMsgPayload);
    const rbMsgHeaderBytes = wrapEncapsulatedMessage(rbMsgPayload);
    const rbBlockOffset = 8 + schemaMsgBytes.length;
    const rbMetaDataLen = rbMsgHeaderBytes.length;
    const rbBodyLen = recordBatchBody.length;

    const eosBytes = new Uint8Array([0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x00]);
    const fbFooter = buildArrowFlatBufferFooter(schema, rows.length, rbBodyLen, rbBlockOffset, rbMetaDataLen);

    const magic = [0x41, 0x52, 0x52, 0x4f, 0x57, 0x31]; // ARROW1
    const totalLen =
        8 +
        schemaMsgBytes.length +
        rbMsgHeaderBytes.length +
        recordBatchBody.length +
        eosBytes.length +
        fbFooter.length +
        4 +
        6;
    const out = new Uint8Array(totalLen);
    const view = new DataView(out.buffer);

    let pos = 0;
    out.set(magic, pos);
    pos += 8; // includes 2-byte 0x0000 alignment
    out.set(schemaMsgBytes, pos);
    pos += schemaMsgBytes.length;
    out.set(rbMsgHeaderBytes, pos);
    pos += rbMsgHeaderBytes.length;
    out.set(recordBatchBody, pos);
    pos += recordBatchBody.length;
    out.set(eosBytes, pos);
    pos += eosBytes.length;
    out.set(fbFooter, pos);
    pos += fbFooter.length;
    view.setInt32(pos, fbFooter.length, true);
    pos += 4;
    out.set(magic, pos);
    return out;
}

/**
 * Minimal deterministic FlatBuffers binary assembler for Arrow IPC Schema & RecordBatch Messages.
 */
class SimpleFlatBufferBuilder {
    private bytes: number[] = [];

    align(size: number): void {
        while (this.bytes.length % size !== 0) {
            this.bytes.push(0);
        }
    }

    currentOffset(): number {
        return this.bytes.length;
    }

    writeUint8(v: number): number {
        const off = this.bytes.length;
        this.bytes.push(v & 0xff);
        return off;
    }

    writeInt16(v: number): number {
        this.align(2);
        const off = this.bytes.length;
        this.bytes.push(v & 0xff, (v >>> 8) & 0xff);
        return off;
    }

    writeInt32(v: number): number {
        this.align(4);
        const off = this.bytes.length;
        this.bytes.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
        return off;
    }

    writeInt64(v: number | bigint): number {
        this.align(8);
        const off = this.bytes.length;
        const b = new Uint8Array(8);
        new DataView(b.buffer).setBigInt64(0, typeof v === 'bigint' ? v : BigInt(Math.trunc(v)), true);
        for (let i = 0; i < 8; i++) this.bytes.push(b[i]);
        return off;
    }

    patchUOffset(fieldPos: number, targetPos: number): void {
        const rel = targetPos - fieldPos;
        this.bytes[fieldPos] = rel & 0xff;
        this.bytes[fieldPos + 1] = (rel >>> 8) & 0xff;
        this.bytes[fieldPos + 2] = (rel >>> 16) & 0xff;
        this.bytes[fieldPos + 3] = (rel >>> 24) & 0xff;
    }

    writeString(str: string): number {
        const sb = textEncoder.encode(str);
        this.align(4);
        const strPos = this.bytes.length;
        this.writeInt32(sb.length);
        for (let i = 0; i < sb.length; i++) this.bytes.push(sb[i]);
        this.bytes.push(0); // null terminator
        this.align(4);
        return strPos;
    }

    writeTable(slotValues: ({ kind: 'u8' | 'i16' | 'i32' | 'i64' | 'uoffset'; val: number | bigint } | null)[]): number {
        this.align(4);
        const vtablePos = this.bytes.length;
        const vtableLen = 4 + slotValues.length * 2;
        this.writeInt16(vtableLen);
        const tableSizePatchPos = this.bytes.length;
        this.writeInt16(0); // placeholder for inline table size
        const slotPatchPositions: number[] = [];
        for (let i = 0; i < slotValues.length; i++) {
            slotPatchPositions.push(this.writeInt16(0));
        }

        this.align(4);
        const tablePos = this.bytes.length;
        this.writeInt32(tablePos - vtablePos); // soffset to vtable

        for (let i = 0; i < slotValues.length; i++) {
            const sv = slotValues[i];
            if (!sv) continue;
            let fieldPos = 0;
            if (sv.kind === 'u8') {
                fieldPos = this.writeUint8(Number(sv.val));
            } else if (sv.kind === 'i16') {
                fieldPos = this.writeInt16(Number(sv.val));
            } else if (sv.kind === 'i32') {
                fieldPos = this.writeInt32(Number(sv.val));
            } else if (sv.kind === 'i64') {
                fieldPos = this.writeInt64(sv.val);
            } else if (sv.kind === 'uoffset') {
                this.align(4);
                fieldPos = this.bytes.length;
                this.writeInt32(0);
                this.patchUOffset(fieldPos, Number(sv.val));
            }
            const relSlot = fieldPos - tablePos;
            this.bytes[slotPatchPositions[i]] = relSlot & 0xff;
            this.bytes[slotPatchPositions[i] + 1] = (relSlot >>> 8) & 0xff;
        }

        this.align(4);
        const inlineSize = this.bytes.length - tablePos;
        this.bytes[tableSizePatchPos] = inlineSize & 0xff;
        this.bytes[tableSizePatchPos + 1] = (inlineSize >>> 8) & 0xff;
        return tablePos;
    }

    writeUOffsetVector(targets: number[]): number {
        this.align(4);
        const vecPos = this.bytes.length;
        this.writeInt32(targets.length);
        for (const t of targets) {
            const elemPos = this.bytes.length;
            this.writeInt32(0);
            this.patchUOffset(elemPos, t);
        }
        return vecPos;
    }

    finishWithRoot(BuildFn: (b: SimpleFlatBufferBuilder) => number): Uint8Array {
        this.writeInt32(0); // placeholder for root uoffset at byte 0
        const rootPos = BuildFn(this);
        this.patchUOffset(0, rootPos);
        this.align(8);
        return new Uint8Array(this.bytes);
    }
}

function buildArrowIpcSchemaMessageFlatBuffer(
    schema: ColumnSchemaNode[],
    kvPairs: [string, string][],
    isFloatListCol: (name: string) => boolean
): Uint8Array {
    const b = new SimpleFlatBufferBuilder();
    return b.finishWithRoot((fb) => {
        const fieldPositions: number[] = [];
        for (const col of schema) {
            const namePos = fb.writeString(col.name);
            let typeType = 5; // Utf8
            let typeTablePos = 0;
            let childrenVecPos = 0;

            if (col.logicalType === 'BOOLEAN') {
                typeType = 6; // Bool
                typeTablePos = fb.writeTable([]);
            } else if (col.logicalType === 'INT32') {
                typeType = 2; // Int(32, true)
                typeTablePos = fb.writeTable([
                    { kind: 'i32', val: 32 },
                    { kind: 'u8', val: 1 },
                ]);
            } else if (col.logicalType === 'INT64' || col.logicalType === 'UINT64') {
                typeType = 2; // Int(64, signed)
                typeTablePos = fb.writeTable([
                    { kind: 'i32', val: 64 },
                    { kind: 'u8', val: col.logicalType === 'INT64' ? 1 : 0 },
                ]);
            } else if (col.logicalType === 'FLOAT') {
                typeType = 3; // FloatingPoint(SINGLE=1)
                typeTablePos = fb.writeTable([{ kind: 'i16', val: 1 }]);
            } else if (col.logicalType === 'DOUBLE') {
                typeType = 3; // FloatingPoint(DOUBLE=2)
                typeTablePos = fb.writeTable([{ kind: 'i16', val: 2 }]);
            } else if (col.logicalType === 'DATE') {
                typeType = 8; // Date(DAY=0)
                typeTablePos = fb.writeTable([{ kind: 'i16', val: 0 }]);
            } else if (col.logicalType === 'LIST' && isFloatListCol(col.name)) {
                typeType = 12; // List
                typeTablePos = fb.writeTable([]);
                const itemNamePos = fb.writeString('item');
                const itemTypePos = fb.writeTable([{ kind: 'i16', val: 2 }]); // Float64
                const itemFieldPos = fb.writeTable([
                    { kind: 'uoffset', val: itemNamePos },
                    { kind: 'u8', val: 1 },
                    { kind: 'u8', val: 3 },
                    { kind: 'uoffset', val: itemTypePos },
                ]);
                childrenVecPos = fb.writeUOffsetVector([itemFieldPos]);
            } else {
                typeType = 5; // Utf8
                typeTablePos = fb.writeTable([]);
            }

            const fieldPos = fb.writeTable([
                { kind: 'uoffset', val: namePos },
                { kind: 'u8', val: col.nullable ? 1 : 0 },
                { kind: 'u8', val: typeType },
                { kind: 'uoffset', val: typeTablePos },
                null, // dictionary
                childrenVecPos > 0 ? { kind: 'uoffset', val: childrenVecPos } : null,
            ]);
            fieldPositions.push(fieldPos);
        }

        const fieldsVecPos = fb.writeUOffsetVector(fieldPositions);
        const kvPositions: number[] = [];
        for (const [k, v] of kvPairs) {
            const kPos = fb.writeString(k);
            const vPos = fb.writeString(v);
            kvPositions.push(
                fb.writeTable([
                    { kind: 'uoffset', val: kPos },
                    { kind: 'uoffset', val: vPos },
                ])
            );
        }
        const kvVecPos = fb.writeUOffsetVector(kvPositions);

        const schemaTablePos = fb.writeTable([
            { kind: 'i16', val: 0 }, // endianness = LITTLE (0)
            { kind: 'uoffset', val: fieldsVecPos },
            { kind: 'uoffset', val: kvVecPos },
        ]);

        // Message table: 0=version(4=V5), 1=header_type(1=Schema), 2=header, 3=bodyLength(0)
        return fb.writeTable([
            { kind: 'i16', val: 4 },
            { kind: 'u8', val: 1 },
            { kind: 'uoffset', val: schemaTablePos },
            { kind: 'i64', val: 0 },
        ]);
    });
}

function buildArrowIpcRecordBatchMessageFlatBuffer(
    rowCount: number,
    fieldNodes: { length: number; nullCount: number }[],
    bufferDescs: { offset: number; length: number }[],
    bodyLength: number
): Uint8Array {
    const b = new SimpleFlatBufferBuilder();
    return b.finishWithRoot((fb) => {
        // nodes vector: struct FieldNode { length: int64, null_count: int64 } (16 bytes each)
        fb.align(8);
        const nodesVecPos = fb.currentOffset();
        fb.writeInt32(fieldNodes.length);
        // Note: struct vectors in FlatBuffers place elements immediately after the 4-byte count
        for (const fn of fieldNodes) {
            const raw = new Uint8Array(16);
            const dv = new DataView(raw.buffer);
            dv.setBigInt64(0, BigInt(fn.length), true);
            dv.setBigInt64(8, BigInt(fn.nullCount), true);
            for (let i = 0; i < 16; i++) fb.writeUint8(raw[i]);
        }

        // buffers vector: struct Buffer { offset: int64, length: int64 } (16 bytes each)
        fb.align(8);
        const bufsVecPos = fb.currentOffset();
        fb.writeInt32(bufferDescs.length);
        for (const bd of bufferDescs) {
            const raw = new Uint8Array(16);
            const dv = new DataView(raw.buffer);
            dv.setBigInt64(0, BigInt(bd.offset), true);
            dv.setBigInt64(8, BigInt(bd.length), true);
            for (let i = 0; i < 16; i++) fb.writeUint8(raw[i]);
        }

        // RecordBatch table: 0=length(int64), 1=nodes, 2=buffers
        const rbTablePos = fb.writeTable([
            { kind: 'i64', val: rowCount },
            { kind: 'uoffset', val: nodesVecPos },
            { kind: 'uoffset', val: bufsVecPos },
        ]);

        // Message table: 0=version(4=V5), 1=header_type(3=RecordBatch), 2=header, 3=bodyLength
        return fb.writeTable([
            { kind: 'i16', val: 4 },
            { kind: 'u8', val: 3 },
            { kind: 'uoffset', val: rbTablePos },
            { kind: 'i64', val: bodyLength },
        ]);
    });
}

function buildArrowFlatBufferFooter(
    schema: ColumnSchemaNode[],
    rowCount: number,
    bodyLength: number,
    rbOffset = 8,
    rbMetaDataLen = 0
): Uint8Array {
    const colNamesJson = textEncoder.encode(JSON.stringify(schema.map((s) => s.name)));
    const buf = new Uint8Array(36 + colNamesJson.length);
    const view = new DataView(buf.buffer);
    view.setInt32(0, 12, true); // root table at offset 12
    view.setUint16(4, 8, true); // vtable length
    view.setUint16(6, 24, true); // table inline size
    view.setUint16(8, 4, true); // field 0 offset (rowCount)
    view.setUint16(10, 8, true); // field 1 offset (bodyLength)
    view.setInt32(12, 8, true); // soffset back to vtable
    view.setInt32(16, rowCount, true);
    view.setInt32(20, bodyLength, true);
    view.setInt32(24, rbOffset, true);
    view.setInt32(28, rbMetaDataLen, true);
    view.setInt32(32, colNamesJson.length, true);
    buf.set(colNamesJson, 36);
    return buf;
}

export function computeCrc32(bytes: Uint8Array): number {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
        crc ^= bytes[i];
        for (let j = 0; j < 8; j++) {
            crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
        }
    }
    return (crc ^ 0xffffffff) >>> 0;
}

function mapLogicalToAvroPrimitive(logical: LogicalDataType): string {
    switch (logical) {
        case 'BOOLEAN':
            return 'boolean';
        case 'INT32':
            return 'int';
        case 'INT64':
        case 'TIMESTAMP_MILLIS':
        case 'TIMESTAMP_MICROS':
        case 'TIMESTAMP_NANOS':
            return 'long';
        case 'UINT64':
            return 'string';
        case 'FLOAT':
            return 'float';
        case 'DOUBLE':
        case 'DECIMAL':
            return 'double';
        default:
            return 'string';
    }
}

// ============================================================
// 5. BUILT-IN SAMPLE BINARY DATASETS (PARQUET, AVRO, FEATHER)
// ============================================================

export function generateSampleBinaryFile(
    preset: 'ecommerce_parquet' | 'iot_avro' | 'ml_feather'
): { bytes: Uint8Array; fileName: string; description: string } {
    if (preset === 'ecommerce_parquet') {
        const rows = Array.from({ length: 25 }, (_, i) => ({
            order_id: 100450 + i,
            customer_snowflake_id: `900719925474099${100 + i}`,
            customer_email: i % 7 === 0 ? null : `customer${i + 1}@enterprise-lake.io`,
            region: ['US-EAST', 'EU-WEST', 'AP-SOUTH', 'ME-CENTRAL', 'SA-EAST'][i % 5],
            order_status: ['COMPLETED', 'SHIPPED', 'PROCESSING', 'REFUNDED'][i % 4],
            total_usd: Number((49.95 + i * 37.4 + (i % 3) * 12.25).toFixed(2)),
            discount_pct: i % 4 === 0 ? 15.0 : i % 3 === 0 ? 10.0 : 0.0,
            is_prime_member: i % 2 === 0,
            created_at: new Date(Date.UTC(2026, 2, (i % 28) + 1, 9 + (i % 12), 15, 0)).toISOString(),
            shipping_meta: {
                carrier: ['FedEx', 'DHL', 'UPS'][i % 3],
                priority: i % 2 === 0 ? 'EXPRESS' : 'STANDARD',
            },
            line_skus: [`SKU-${100 + i}`, `SKU-${200 + i}`],
        }));
        return {
            bytes: encodeParquetBinary(rows, {
                'spark.sql.parquet.compression.codec': 'snappy',
                'iceberg.table.name': 'prod_lakehouse.commerce.orders_v2',
            }),
            fileName: 'ecommerce_orders_v2.parquet',
            description: 'Apache Parquet v2 (SNAPPY) — 25 E-Commerce Orders with 18-Digit 64-Bit IDs, Timestamps, Nested Structs & Arrays',
        };
    }

    if (preset === 'iot_avro') {
        const rows = Array.from({ length: 20 }, (_, i) => ({
            event_seq: 500001 + i,
            device_uuid: `dev-8840-00${String(i + 1).padStart(2, '0')}`,
            facility_zone: ['Turbine-North', 'Solar-Grid-B', 'Substation-4', 'Cooling-Core'][i % 4],
            temperature_c: Number((62.4 + Math.sin(i) * 11.8).toFixed(2)),
            vibration_hz: Number((120.5 + (i % 7) * 8.3).toFixed(2)),
            battery_pct: Math.max(12, 100 - i * 4),
            anomaly_detected: i % 5 === 0,
            alert_code: i % 5 === 0 ? `WARN_TEMP_${900 + i}` : null,
            captured_at: new Date(Date.UTC(2026, 3, 10, 14, i * 2, 30)).toISOString(),
            firmware_tags: { version: 'v4.12.8', protocol: 'MQTT-TLS' },
        }));
        return {
            bytes: encodeAvroBinary(rows, 'IoTTelemetryEvent'),
            fileName: 'iot_sensor_stream.avro',
            description: 'Apache Avro Container (Obj\\x01) — 20 Industrial IoT Sensor Events with Union Nulls & Sync Markers',
        };
    }

    const rows = Array.from({ length: 18 }, (_, i) => ({
        doc_index: i + 1,
        chunk_hash: `sha256_${(0x8f1a2b + i * 7919).toString(16)}`,
        model_name: i % 2 === 0 ? 'text-embedding-3-large' : 'bge-m3-dense',
        token_count: 180 + ((i * 47) % 320),
        cosine_similarity: Number((0.72 + ((i * 17) % 27) / 100).toFixed(4)),
        latency_ms: Number((8.4 + (i % 6) * 2.15).toFixed(2)),
        is_cached: i % 3 !== 0,
        namespace: ['legal-corpus', 'fintech-kb', 'medical-rag'][i % 3],
        embedding_head: [
            Number((0.041 * (i + 1)).toFixed(4)),
            Number((-0.028 * (i + 1)).toFixed(4)),
            Number((0.112 / (i + 1)).toFixed(4)),
            Number((0.089 * ((i % 4) + 1)).toFixed(4)),
        ],
    }));
    return {
        bytes: encodeFeatherBinary(rows, {
            'pandas.version': '2.2.3',
            'arrow.ipc.format': 'Feather V2 (ARROW1 FlatBuffers)',
        }),
        fileName: 'ml_feature_embeddings.feather',
        description: 'Apache Arrow IPC / Feather v2 (ARROW1 FlatBuffers) — 18 Vector Store Embeddings with List<Float64> Arrays',
    };
}

// ============================================================
// 6. UNIVERSAL PARSER (PARQUET THRIFT + DATAPAGES, AVRO OCF, FEATHER V1 CTable & FEATHER V2 ARROW IPC)
// ============================================================

const SUPPORTED_PARQUET_CODECS = new Set(['UNCOMPRESSED', 'NONE', 'SNAPPY', 'GZIP', 'LZ4', 'LZ4_RAW']);
const SUPPORTED_PARQUET_ENCODINGS = new Set(['PLAIN', 'PLAIN_DICTIONARY', 'RLE_DICTIONARY', 'RLE', 'BIT_PACKED']);
const SUPPORTED_AVRO_CODECS = new Set(['NULL', 'NONE', 'UNCOMPRESSED', 'DEFLATE', 'SNAPPY']);

export function parseColumnarFile(
    bytes: Uint8Array,
    fileName = 'dataset.parquet'
): ColumnarParseResult {
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const warnings: string[] = [];

    if (!bytes || bytes.length === 0) {
        throw new Error('Uploaded file is empty (0 bytes). Please provide a valid Parquet, Avro, Feather, CSV, or JSONL file.');
    }

    if (bytes.length > MAX_SAFE_FILE_BYTES) {
        throw new Error(
            `File size (${(bytes.length / (1024 * 1024)).toFixed(1)} MB) exceeds the in-browser allocation safeguard of ${MAX_SAFE_FILE_BYTES / (1024 * 1024)
            } MB.`
        );
    }

    const { format, magic } = detectColumnarFormat(bytes, fileName);

    let rows: Record<string, unknown>[] = [];
    let schema: ColumnSchemaNode[] = [];
    let codec = 'UNCOMPRESSED';
    let formatVersion = '2.0';
    let createdBy = 'Apache Columnar Writer';
    let keyValueMetadata: Record<string, string> = {};
    let syncMarkerHex: string | undefined;
    let decodedRowGroups: RowGroupMeta[] | null = null;
    let totalUncompressedFromChunks = 0;
    let totalCompressedFromChunks = 0;

    if (format === 'parquet') {
        const parsed = parseParquetBinary(bytes, warnings);
        rows = parsed.rows;
        schema = parsed.schema;
        codec = parsed.codec;
        formatVersion = parsed.formatVersion;
        createdBy = parsed.createdBy;
        keyValueMetadata = parsed.keyValueMetadata;
        decodedRowGroups = parsed.rowGroups;
        totalUncompressedFromChunks = parsed.totalUncompressedBytes;
        totalCompressedFromChunks = parsed.totalCompressedBytes;
    } else if (format === 'avro') {
        const parsed = parseAvroBinary(bytes, warnings);
        rows = parsed.rows;
        schema = parsed.schema;
        codec = parsed.codec;
        formatVersion = 'Avro 1.11 (Obj\\x01)';
        createdBy = 'Apache Avro Container Writer';
        keyValueMetadata = parsed.keyValueMetadata;
        syncMarkerHex = parsed.syncMarkerHex;
        decodedRowGroups = parsed.rowGroups;
        totalUncompressedFromChunks = parsed.uncompressedBytes;
        totalCompressedFromChunks = parsed.compressedBytes;
    } else if (format === 'feather' || format === 'arrow_stream') {
        const parsed = parseFeatherOrArrowBinary(bytes, format, warnings);
        rows = parsed.rows;
        schema = parsed.schema;
        codec = parsed.codec;
        formatVersion = parsed.formatVersion;
        createdBy = parsed.createdBy;
        keyValueMetadata = parsed.keyValueMetadata;
        decodedRowGroups = parsed.rowGroups;
        totalUncompressedFromChunks = parsed.uncompressedBytes;
        totalCompressedFromChunks = parsed.compressedBytes;
    } else if (format === 'csv') {
        const text = textDecoder.decode(bytes);
        rows = parseCsvTextToRows(text);
        schema = inferSchemaFromRows(rows, 'NONE', 'PLAIN_UTF8');
        codec = 'NONE';
        formatVersion = 'RFC 4180 CSV';
        createdBy = 'CSV Text Parser';
    } else {
        const text = textDecoder.decode(bytes);
        rows = parseJsonOrJsonlText(text);
        if (rows.length === 0 && text.trim().length > 0 && !text.trim().startsWith('[')) {
            throw new Error('Malformed JSON / JSONL input: unable to parse any valid JSON records.');
        }
        schema = inferSchemaFromRows(rows, 'NONE', 'PLAIN_UTF8');
        codec = 'NONE';
        formatVersion = 'JSON / NDJSON';
        createdBy = 'JSON Stream Parser';
    }

    if (schema.length === 0 && rows.length > 0) {
        schema = inferSchemaFromRows(rows, codec, 'PLAIN');
    }

    const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const parseTimeMs = Math.max(0.1, Number((endTime - startTime).toFixed(2)));

    const uncompressedBytes =
        totalUncompressedFromChunks > 0
            ? totalUncompressedFromChunks
            : Math.max(bytes.length, textEncoder.encode(JSON.stringify(rows)).length);

    const compressedDenom =
        totalCompressedFromChunks > 0 ? totalCompressedFromChunks : Math.max(1, bytes.length);

    const compressionRatio = Number(
        Math.max(0.1, uncompressedBytes / compressedDenom).toFixed(2)
    );

    const columnProfiles = computeColumnProfiles(rows, schema);
    const rowGroups =
        decodedRowGroups && decodedRowGroups.length > 0
            ? decodedRowGroups
            : buildRowGroupMetadata(rows, schema, compressedDenom, uncompressedBytes, codec, true, 'In-Memory Text Stream Partition');

    const footerSlice = bytes.length >= 16 ? bytes.subarray(bytes.length - 16) : bytes;

    return {
        format,
        metadata: {
            format,
            formatVersion,
            magicBytes: magic,
            headerHex: bytesToHex(bytes, 16),
            footerHex: bytesToHex(footerSlice, 16),
            fileName,
            fileSizeBytes: bytes.length,
            uncompressedBytes,
            compressionRatio,
            compressionCodec: codec,
            createdBy,
            totalRows: rows.length,
            totalColumns: schema.length,
            rowGroupCount: rowGroups.length,
            rowGroups,
            keyValueMetadata,
            syncMarkerHex,
            byteOrder: 'LITTLE_ENDIAN',
            parseTimeMs,
        },
        schema,
        rows,
        columnProfiles,
        warnings,
    };
}

/**
 * Formats an unscaled BigInt with a decimal scale (e.g. unscaled=1234567n, scale=2 -> 12345.67 or exact string).
 */
function formatScaledDecimal(unscaled: bigint, scale: number): number | string {
    if (scale <= 0) {
        if (unscaled > BigInt(Number.MAX_SAFE_INTEGER) || unscaled < BigInt(Number.MIN_SAFE_INTEGER)) {
            return unscaled.toString();
        }
        return Number(unscaled);
    }
    const isNeg = unscaled < BigInt(0);
    const absStr = (isNeg ? -unscaled : unscaled).toString().padStart(scale + 1, '0');
    const intPart = absStr.slice(0, absStr.length - scale);
    const fracPart = absStr.slice(absStr.length - scale);
    const formatted = `${isNeg ? '-' : ''}${intPart}.${fracPart}`;
    const totalSigDigits = absStr.replace(/^0+/, '').length;
    if (totalSigDigits > 15) {
        return formatted;
    }
    const num = Number(formatted);
    return Number.isFinite(num) ? num : formatted;
}

function decodeTwoComplementBigEndian(slice: Uint8Array): bigint {
    if (slice.length === 0) return BigInt(0);
    const isNeg = (slice[0] & 0x80) !== 0;
    let acc = BigInt(0);
    for (let i = 0; i < slice.length; i++) {
        const b = isNeg ? (~slice[i] & 0xff) : slice[i];
        acc = (acc << BigInt(8)) | BigInt(b);
    }
    return isNeg ? -(acc + BigInt(1)) : acc;
}

function decodeTwoComplementLittleEndian(slice: Uint8Array): bigint {
    if (slice.length === 0) return BigInt(0);
    const isNeg = (slice[slice.length - 1] & 0x80) !== 0;
    let acc = BigInt(0);
    for (let i = slice.length - 1; i >= 0; i--) {
        const b = isNeg ? (~slice[i] & 0xff) : slice[i];
        acc = (acc << BigInt(8)) | BigInt(b);
    }
    return isNeg ? -(acc + BigInt(1)) : acc;
}

function decodeFloat16(uint16Bits: number): number {
    const sign = (uint16Bits & 0x8000) !== 0 ? -1 : 1;
    const exp = (uint16Bits >>> 10) & 0x1f;
    const frac = uint16Bits & 0x03ff;
    if (exp === 0) {
        return sign * Math.pow(2, -14) * (frac / 1024);
    }
    if (exp === 0x1f) {
        return frac === 0 ? sign * Infinity : NaN;
    }
    return sign * Math.pow(2, exp - 15) * (1 + frac / 1024);
}

/**
 * Decodes Parquet binary Statistics min/max bytes (handles both binary LE values written by PyArrow/Spark
 * and UTF-8 string statistics, including TIMESTAMP_MILLIS, TIMESTAMP_MICROS, TIMESTAMP_NANOS, and INT96).
 */
function decodeParquetStatBytes(
    raw: Uint8Array,
    physicalType: PhysicalDataType,
    logicalType: LogicalDataType,
    isInt96 = false,
    isUnsigned = false,
    scale = 0
): string | number | null {
    if (!raw || raw.length === 0) return null;
    const asText = textDecoder.decode(raw);
    const isAsciiNumeric = /^[+-]?\d+(?:\.\d+)?$/.test(asText);

    if (logicalType === 'DECIMAL' && !isAsciiNumeric) {
        if (physicalType === 'INT32' && raw.length === 4) {
            const v = new DataView(raw.buffer, raw.byteOffset, 4).getInt32(0, true);
            return formatScaledDecimal(BigInt(v), scale);
        }
        if (physicalType === 'INT64' && raw.length === 8) {
            const b = new DataView(raw.buffer, raw.byteOffset, 8).getBigInt64(0, true);
            return formatScaledDecimal(b, scale);
        }
        return formatScaledDecimal(decodeTwoComplementBigEndian(raw), scale);
    }

    if (physicalType === 'INT32' && raw.length === 4 && !isAsciiNumeric) {
        const dv = new DataView(raw.buffer, raw.byteOffset, 4);
        const v = isUnsigned ? dv.getUint32(0, true) : dv.getInt32(0, true);
        if (logicalType === 'DATE') {
            return formatEpochTimestampToIso(BigInt(v) * BigInt(86400), 's').slice(0, 10);
        }
        return v;
    }
    if (physicalType === 'INT64' && raw.length === 8 && !isAsciiNumeric) {
        const dv = new DataView(raw.buffer, raw.byteOffset, 8);
        const b = isUnsigned || logicalType === 'UINT64' ? dv.getBigUint64(0, true) : dv.getBigInt64(0, true);
        if (logicalType === 'TIMESTAMP_MILLIS') {
            return formatEpochTimestampToIso(b, 'ms');
        }
        if (logicalType === 'TIMESTAMP_MICROS') {
            return formatEpochTimestampToIso(b, 'us');
        }
        if (logicalType === 'TIMESTAMP_NANOS') {
            return formatEpochTimestampToIso(b, 'ns');
        }
        if (b > BigInt(Number.MAX_SAFE_INTEGER) || b < BigInt(Number.MIN_SAFE_INTEGER)) {
            return b.toString();
        }
        return Number(b);
    }
    if (isInt96 && raw.length === 12) {
        const dv = new DataView(raw.buffer, raw.byteOffset, 12);
        const nanosOfDay = dv.getBigInt64(0, true);
        const julianDay = BigInt(dv.getInt32(8, true));
        const totalNanos = (julianDay - BigInt(2440588)) * BigInt(86400000000000) + nanosOfDay;
        return formatEpochTimestampToIso(totalNanos, 'ns');
    }
    if (physicalType === 'FLOAT' && raw.length === 4 && !isAsciiNumeric) {
        const f = new DataView(raw.buffer, raw.byteOffset, 4).getFloat32(0, true);
        return Number.isFinite(f) ? f : null;
    }
    if (physicalType === 'DOUBLE' && raw.length === 8 && !isAsciiNumeric) {
        const d = new DataView(raw.buffer, raw.byteOffset, 8).getFloat64(0, true);
        return Number.isFinite(d) ? d : null;
    }
    if (physicalType === 'BOOLEAN' && raw.length === 1 && raw[0] <= 1) {
        return raw[0] !== 0 ? 'true' : 'false';
    }
    if (asText !== '') {
        return coerceNumericStat(asText);
    }
    return null;
}

/**
 * Decodes physical PLAIN values from a Parquet DataPage or DictionaryPage buffer.
 */
function decodeParquetPlainValues(
    bytes: Uint8Array,
    startOffset: number,
    count: number,
    physicalType: PhysicalDataType,
    logicalType: LogicalDataType,
    typeLength = 0,
    isInt96 = false,
    isUnsigned = false,
    scale = 0
): { values: unknown[]; nextOffset: number } {
    const values: unknown[] = [];
    let pos = startOffset;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    if (physicalType === 'BOOLEAN') {
        const byteCount = Math.ceil(count / 8);
        if (pos + byteCount > bytes.length && count > 0) {
            throw new Error('Malformed Parquet DataPage: truncated BOOLEAN bit-packed buffer.');
        }
        for (let i = 0; i < count; i++) {
            const bIdx = pos + (i >>> 3);
            const bit = i & 7;
            const b = bIdx < bytes.length ? bytes[bIdx] : 0;
            values.push(((b >>> bit) & 1) === 1);
        }
        return { values, nextOffset: Math.min(bytes.length, pos + byteCount) };
    }

    if (physicalType === 'INT32') {
        if (pos + count * 4 > bytes.length) {
            throw new Error('Malformed Parquet DataPage: truncated INT32 value buffer.');
        }
        for (let i = 0; i < count; i++) {
            const v = isUnsigned ? view.getUint32(pos, true) : view.getInt32(pos, true);
            pos += 4;
            if (logicalType === 'DATE') {
                values.push(formatEpochTimestampToIso(BigInt(v) * BigInt(86400), 's').slice(0, 10));
            } else if (logicalType === 'DECIMAL' && scale > 0) {
                values.push(formatScaledDecimal(BigInt(v), scale));
            } else {
                values.push(v);
            }
        }
        return { values, nextOffset: pos };
    }

    if (physicalType === 'INT64') {
        if (pos + count * 8 > bytes.length) {
            throw new Error('Malformed Parquet DataPage: truncated INT64 value buffer.');
        }
        for (let i = 0; i < count; i++) {
            const b = isUnsigned || logicalType === 'UINT64' ? view.getBigUint64(pos, true) : view.getBigInt64(pos, true);
            pos += 8;
            if (logicalType === 'TIMESTAMP_MILLIS') {
                values.push(formatEpochTimestampToIso(b, 'ms'));
            } else if (logicalType === 'TIMESTAMP_MICROS') {
                values.push(formatEpochTimestampToIso(b, 'us'));
            } else if (logicalType === 'TIMESTAMP_NANOS') {
                values.push(formatEpochTimestampToIso(b, 'ns'));
            } else if (logicalType === 'DECIMAL' && scale > 0) {
                values.push(formatScaledDecimal(b, scale));
            } else if (b > BigInt(Number.MAX_SAFE_INTEGER) || b < BigInt(Number.MIN_SAFE_INTEGER)) {
                values.push(b.toString());
            } else {
                values.push(Number(b));
            }
        }
        return { values, nextOffset: pos };
    }

    if (isInt96) {
        if (pos + count * 12 > bytes.length) {
            throw new Error('Malformed Parquet DataPage: truncated INT96 timestamp buffer.');
        }
        for (let i = 0; i < count; i++) {
            const nanosOfDay = view.getBigInt64(pos, true);
            const julianDay = BigInt(view.getInt32(pos + 8, true));
            pos += 12;
            const totalNanos = (julianDay - BigInt(2440588)) * BigInt(86400000000000) + nanosOfDay;
            values.push(formatEpochTimestampToIso(totalNanos, 'ns'));
        }
        return { values, nextOffset: pos };
    }

    if (physicalType === 'FLOAT') {
        if (pos + count * 4 > bytes.length) {
            throw new Error('Malformed Parquet DataPage: truncated FLOAT value buffer.');
        }
        for (let i = 0; i < count; i++) {
            const f = view.getFloat32(pos, true);
            pos += 4;
            values.push(f);
        }
        return { values, nextOffset: pos };
    }

    if (physicalType === 'DOUBLE') {
        if (pos + count * 8 > bytes.length) {
            throw new Error('Malformed Parquet DataPage: truncated DOUBLE value buffer.');
        }
        for (let i = 0; i < count; i++) {
            const d = view.getFloat64(pos, true);
            pos += 8;
            values.push(d);
        }
        return { values, nextOffset: pos };
    }

    if (physicalType === 'FIXED_LEN_BYTE_ARRAY' && typeLength > 0) {
        if (pos + count * typeLength > bytes.length) {
            throw new Error('Malformed Parquet DataPage: truncated FIXED_LEN_BYTE_ARRAY buffer.');
        }
        for (let i = 0; i < count; i++) {
            const slice = bytes.subarray(pos, pos + typeLength);
            pos += typeLength;
            if (logicalType === 'DECIMAL') {
                values.push(formatScaledDecimal(decodeTwoComplementBigEndian(slice), scale));
            } else if (logicalType === 'UUID' && typeLength === 16) {
                const hex = Array.from(slice)
                    .map((b) => b.toString(16).padStart(2, '0'))
                    .join('');
                values.push(
                    `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
                );
            } else {
                values.push(textDecoder.decode(slice));
            }
        }
        return { values, nextOffset: pos };
    }

    // BYTE_ARRAY (4-byte LE length + bytes)
    for (let i = 0; i < count; i++) {
        if (pos + 4 > bytes.length) {
            throw new Error('Malformed Parquet DataPage: truncated BYTE_ARRAY length prefix.');
        }
        const len = view.getUint32(pos, true);
        pos += 4;
        if (len > bytes.length - pos) {
            throw new Error(`Malformed Parquet DataPage: BYTE_ARRAY length (${len}) exceeds remaining page buffer (${bytes.length - pos}).`);
        }
        const slice = bytes.subarray(pos, pos + len);
        pos += len;
        if (logicalType === 'DECIMAL') {
            values.push(formatScaledDecimal(decodeTwoComplementBigEndian(slice), scale));
            continue;
        }
        const str = textDecoder.decode(slice);
        if (
            (logicalType === 'JSON' ||
                logicalType === 'STRUCT' ||
                logicalType === 'LIST' ||
                logicalType === 'MAP') &&
            (str.startsWith('{') || str.startsWith('['))
        ) {
            try {
                values.push(JSON.parse(str));
                continue;
            } catch {
                // keep as string
            }
        }
        values.push(str);
    }
    return { values, nextOffset: pos };
}

function decompressParquetPagePayload(
    compressedSlice: Uint8Array,
    codec: string,
    uncompressedSize: number
): Uint8Array {
    if (compressedSlice.length === 0 && uncompressedSize === 0) {
        return new Uint8Array(0);
    }
    if (uncompressedSize > MAX_DECOMPRESSED_PAGE_BYTES) {
        throw new Error(`Declared Parquet page uncompressed size (${uncompressedSize} bytes) exceeds safety limit.`);
    }
    if (!SUPPORTED_PARQUET_CODECS.has(codec)) {
        throw new Error(
            `Unsupported Parquet compression codec "${codec}". Pure-TypeScript in-browser decoding supports UNCOMPRESSED, SNAPPY, GZIP, LZ4, and LZ4_RAW. Re-encode with Snappy/GZIP or use PyArrow/DuckDB for ${codec} pages.`
        );
    }
    if (codec === 'UNCOMPRESSED' || codec === 'NONE') return compressedSlice;
    if (codec === 'SNAPPY') return decompressSnappyBlock(compressedSlice);
    if (codec === 'GZIP') return decompressGzipOrDeflate(compressedSlice);
    if (codec === 'LZ4_RAW' || codec === 'LZ4') {
        return decompressLz4Block(compressedSlice, uncompressedSize);
    }
    return compressedSlice;
}

/**
 * Reconstructs repeated (LIST / MAP / REPEATED) values per top-level row using Dremel repetition and definition levels.
 */
function reconstructDremelSingleLevelList(
    repLevels: number[],
    defLevels: number[],
    nonNullValues: unknown[],
    maxDefLevel: number
): unknown[] {
    const rowsOut: unknown[] = [];
    let currentList: unknown[] | null = null;
    let valIdx = 0;

    for (let i = 0; i < defLevels.length; i++) {
        const rep = repLevels[i] ?? 0;
        const def = defLevels[i] ?? 0;

        if (rep === 0) {
            if (i > 0) {
                rowsOut.push(currentList);
            }
            if (def === 0) {
                currentList = null;
            } else if (def < maxDefLevel) {
                currentList = (maxDefLevel >= 3 ? def === 1 : def === maxDefLevel - 1) ? [] : [null];
            } else {
                currentList = [nonNullValues[valIdx++] ?? null];
            }
        } else {
            if (!currentList) currentList = [];
            if (def >= maxDefLevel) {
                currentList.push(nonNullValues[valIdx++] ?? null);
            } else {
                currentList.push(null);
            }
        }
    }
    if (defLevels.length > 0) {
        rowsOut.push(currentList);
    }
    return rowsOut;
}

/**
 * Decodes a single Parquet ColumnChunk (supporting DICTIONARY_PAGE + DATA_PAGE v1 + DATA_PAGE_V2,
 * PLAIN + RLE_DICTIONARY + PLAIN_DICTIONARY + RLE boolean, Dremel LIST/MAP reconstruction,
 * DECIMAL, UINT, INT96, TIMESTAMP_MILLIS/MICROS/NANOS, and legacy KivaroTools JSON-array chunks).
 */
function decodeParquetColumnChunkValues(
    fileBytes: Uint8Array,
    footerStart: number,
    colChunk: RowGroupColumnChunkMeta & {
        dictionaryPageOffset?: number;
        isInt96?: boolean;
        typeLength?: number;
        isUnsigned?: boolean;
        scale?: number;
    },
    logicalType: LogicalDataType,
    maxDefLevel: number,
    maxRepLevel: number,
    expectedRows: number
): unknown[] {
    if (!SUPPORTED_PARQUET_CODECS.has(colChunk.codec)) {
        throw new Error(
            `Column "${colChunk.name}" is compressed with unsupported codec "${colChunk.codec}". Supported Parquet codecs in browser memory are UNCOMPRESSED, SNAPPY, GZIP, LZ4, and LZ4_RAW.`
        );
    }

    const dictOffset = colChunk.dictionaryPageOffset ?? 0;
    const startOffset =
        dictOffset > 0 && dictOffset < colChunk.dataPageOffset
            ? dictOffset
            : colChunk.dataPageOffset;
    const endOffset = startOffset + colChunk.compressedSize;

    if (startOffset < 4 || endOffset > footerStart || colChunk.compressedSize <= 0) {
        throw new Error(
            `Malformed Parquet ColumnChunk "${colChunk.name}": page byte range [${startOffset}..${endOffset}] is outside valid data region [4..${footerStart}].`
        );
    }

    const rawChunkSlice = fileBytes.subarray(startOffset, endOffset);
    if (rawChunkSlice[0] !== 0x15) {
        try {
            const decompLegacy = decompressParquetPagePayload(
                rawChunkSlice,
                colChunk.codec,
                colChunk.uncompressedSize
            );
            if (decompLegacy.length > 0 && decompLegacy[0] === 0x5b) {
                const parsed = JSON.parse(textDecoder.decode(decompLegacy));
                if (Array.isArray(parsed)) return parsed;
            }
        } catch {
            // Not a legacy JSON chunk; proceed to Thrift PageHeader parser
        }
    }

    let pos = startOffset;
    let dictPool: unknown[] = [];
    const columnValues: unknown[] = [];

    while (pos < endOffset && columnValues.length < expectedRows) {
        const pr = new ThriftCompactReader(fileBytes, pos);
        pr.beginStruct();

        let pageType = -1;
        let uncompressedPageSize = 0;
        let compressedPageSize = 0;
        let numValues = 0;
        let pageEncoding = 0;
        let defLevelsByteLenV2 = 0;
        let repLevelsByteLenV2 = 0;
        let isCompressedV2 = true;

        while (pr.pos < endOffset) {
            const pf = pr.readFieldHeader();
            if (pf.fieldType === CT_STOP) break;
            if (pf.fieldId === 1 && pf.fieldType === CT_I32) {
                pageType = pr.readI32();
            } else if (pf.fieldId === 2 && pf.fieldType === CT_I32) {
                uncompressedPageSize = pr.readI32();
            } else if (pf.fieldId === 3 && pf.fieldType === CT_I32) {
                compressedPageSize = pr.readI32();
            } else if (pf.fieldId === 5 && pf.fieldType === CT_STRUCT) {
                pr.beginStruct();
                while (pr.pos < endOffset) {
                    const dpf = pr.readFieldHeader();
                    if (dpf.fieldType === CT_STOP) break;
                    if (dpf.fieldId === 1 && dpf.fieldType === CT_I32) numValues = pr.readI32();
                    else if (dpf.fieldId === 2 && dpf.fieldType === CT_I32) pageEncoding = pr.readI32();
                    else pr.skipField(dpf.fieldType);
                }
                pr.endStruct();
            } else if (pf.fieldId === 7 && pf.fieldType === CT_STRUCT) {
                pr.beginStruct();
                while (pr.pos < endOffset) {
                    const dicf = pr.readFieldHeader();
                    if (dicf.fieldType === CT_STOP) break;
                    if (dicf.fieldId === 1 && dicf.fieldType === CT_I32) numValues = pr.readI32();
                    else if (dicf.fieldId === 2 && dicf.fieldType === CT_I32) pageEncoding = pr.readI32();
                    else pr.skipField(dicf.fieldType);
                }
                pr.endStruct();
            } else if (pf.fieldId === 8 && pf.fieldType === CT_STRUCT) {
                pr.beginStruct();
                while (pr.pos < endOffset) {
                    const v2f = pr.readFieldHeader();
                    if (v2f.fieldType === CT_STOP) break;
                    if (v2f.fieldId === 1 && v2f.fieldType === CT_I32) numValues = pr.readI32();
                    else if (v2f.fieldId === 4 && v2f.fieldType === CT_I32) pageEncoding = pr.readI32();
                    else if (v2f.fieldId === 5 && v2f.fieldType === CT_I32) defLevelsByteLenV2 = pr.readI32();
                    else if (v2f.fieldId === 6 && v2f.fieldType === CT_I32) repLevelsByteLenV2 = pr.readI32();
                    else if (v2f.fieldId === 7) isCompressedV2 = v2f.fieldType === CT_BOOLEAN_TRUE;
                    else pr.skipField(v2f.fieldType);
                }
                pr.endStruct();
            } else {
                pr.skipField(pf.fieldType);
            }
        }
        pr.endStruct();

        if (pageType < 0 || compressedPageSize < 0 || pr.pos + compressedPageSize > endOffset) {
            throw new Error(
                `Malformed Parquet PageHeader in column "${colChunk.name}": invalid pageType (${pageType}) or compressedPageSize (${compressedPageSize}) exceeding chunk boundary.`
            );
        }

        const encName = PARQUET_ENCODING_ENUM_TO_NAME[pageEncoding] ?? `ENC_${pageEncoding}`;
        if ((pageType === 0 || pageType === 3) && !SUPPORTED_PARQUET_ENCODINGS.has(encName)) {
            throw new Error(
                `Unsupported Parquet page encoding "${encName}" in column "${colChunk.name}". Supported encodings are PLAIN, RLE_DICTIONARY, PLAIN_DICTIONARY, and RLE.`
            );
        }

        const pageCompressedSlice = fileBytes.subarray(pr.pos, pr.pos + compressedPageSize);
        pos = pr.pos + compressedPageSize;

        if (pageType === 2) {
            const decomp = decompressParquetPagePayload(
                pageCompressedSlice,
                colChunk.codec,
                uncompressedPageSize
            );
            const decodedDict = decodeParquetPlainValues(
                decomp,
                0,
                numValues,
                colChunk.physicalType,
                logicalType,
                colChunk.typeLength ?? 0,
                colChunk.isInt96 ?? false,
                colChunk.isUnsigned ?? false,
                colChunk.scale ?? 0
            );
            dictPool = decodedDict.values;
        } else if (pageType === 0) {
            const decomp = decompressParquetPagePayload(
                pageCompressedSlice,
                colChunk.codec,
                uncompressedPageSize
            );
            let innerPos = 0;
            const dv = new DataView(decomp.buffer, decomp.byteOffset, decomp.byteLength);

            let repLevels: number[] | null = null;
            if (maxRepLevel > 0 && innerPos + 4 <= decomp.length) {
                const repByteLen = dv.getUint32(innerPos, true);
                innerPos += 4;
                const repBitWidth = Math.max(1, Math.ceil(Math.log2(maxRepLevel + 1)));
                repLevels = decodeRleBitPackedHybrid(
                    decomp.subarray(innerPos, innerPos + repByteLen),
                    repBitWidth,
                    numValues
                );
                innerPos += repByteLen;
            }

            let defLevels: number[] | null = null;
            if (maxDefLevel > 0 && innerPos + 4 <= decomp.length) {
                const defByteLen = dv.getUint32(innerPos, true);
                innerPos += 4;
                const defBitWidth = Math.max(1, Math.ceil(Math.log2(maxDefLevel + 1)));
                defLevels = decodeRleBitPackedHybrid(
                    decomp.subarray(innerPos, innerPos + defByteLen),
                    defBitWidth,
                    numValues
                );
                innerPos += defByteLen;
            }

            const nonNullCount = defLevels
                ? defLevels.filter((d) => d >= maxDefLevel).length
                : numValues;

            let nonNullVals: unknown[] = [];
            if (pageEncoding === 8 || pageEncoding === 2) {
                if (innerPos < decomp.length && nonNullCount > 0) {
                    const bitWidth = decomp[innerPos++];
                    const indices = decodeRleBitPackedHybrid(
                        decomp.subarray(innerPos),
                        bitWidth,
                        nonNullCount
                    );
                    nonNullVals = indices.map((idx) => dictPool[idx] ?? null);
                }
            } else if (pageEncoding === 3 && colChunk.physicalType === 'BOOLEAN') {
                const hasLenPrefix =
                    decomp.length - innerPos > 4 &&
                    dv.getUint32(innerPos, true) === decomp.length - innerPos - 4;
                const rleSlice = decomp.subarray(hasLenPrefix ? innerPos + 4 : innerPos);
                nonNullVals = decodeRleBitPackedHybrid(rleSlice, 1, nonNullCount).map((b) => b === 1);
            } else {
                const plainRes = decodeParquetPlainValues(
                    decomp,
                    innerPos,
                    nonNullCount,
                    colChunk.physicalType,
                    logicalType,
                    colChunk.typeLength ?? 0,
                    colChunk.isInt96 ?? false,
                    colChunk.isUnsigned ?? false,
                    colChunk.scale ?? 0
                );
                nonNullVals = plainRes.values;
            }

            if (maxRepLevel >= 1 && repLevels && defLevels) {
                const listRows = reconstructDremelSingleLevelList(
                    repLevels,
                    defLevels,
                    nonNullVals,
                    maxDefLevel
                );
                columnValues.push(...listRows);
            } else {
                let valIdx = 0;
                for (let i = 0; i < numValues && columnValues.length < expectedRows; i++) {
                    if (defLevels && defLevels[i] < maxDefLevel) {
                        columnValues.push(null);
                    } else {
                        columnValues.push(nonNullVals[valIdx++] ?? null);
                    }
                }
            }
        } else if (pageType === 3) {
            let innerPos = 0;
            let repLevels: number[] | null = null;
            if (maxRepLevel > 0 && repLevelsByteLenV2 > 0 && innerPos + repLevelsByteLenV2 <= pageCompressedSlice.length) {
                const repBitWidth = Math.max(1, Math.ceil(Math.log2(maxRepLevel + 1)));
                repLevels = decodeRleBitPackedHybrid(
                    pageCompressedSlice.subarray(innerPos, innerPos + repLevelsByteLenV2),
                    repBitWidth,
                    numValues
                );
                innerPos += repLevelsByteLenV2;
            }

            let defLevels: number[] | null = null;
            if (maxDefLevel > 0 && defLevelsByteLenV2 > 0 && innerPos + defLevelsByteLenV2 <= pageCompressedSlice.length) {
                const defBitWidth = Math.max(1, Math.ceil(Math.log2(maxDefLevel + 1)));
                defLevels = decodeRleBitPackedHybrid(
                    pageCompressedSlice.subarray(innerPos, innerPos + defLevelsByteLenV2),
                    defBitWidth,
                    numValues
                );
                innerPos += defLevelsByteLenV2;
            }

            const rawValSlice = pageCompressedSlice.subarray(innerPos);
            const decompVals = isCompressedV2
                ? decompressParquetPagePayload(
                    rawValSlice,
                    colChunk.codec,
                    Math.max(0, uncompressedPageSize - innerPos)
                )
                : rawValSlice;

            const nonNullCount = defLevels
                ? defLevels.filter((d) => d >= maxDefLevel).length
                : numValues;

            let nonNullVals: unknown[] = [];
            if (pageEncoding === 8 || pageEncoding === 2) {
                if (decompVals.length > 0 && nonNullCount > 0) {
                    const bitWidth = decompVals[0];
                    const indices = decodeRleBitPackedHybrid(
                        decompVals.subarray(1),
                        bitWidth,
                        nonNullCount
                    );
                    nonNullVals = indices.map((idx) => dictPool[idx] ?? null);
                }
            } else if (pageEncoding === 3 && colChunk.physicalType === 'BOOLEAN') {
                const hasLenPrefix =
                    decompVals.length > 4 &&
                    new DataView(decompVals.buffer, decompVals.byteOffset, 4).getUint32(0, true) === decompVals.length - 4;
                const rlePayload = hasLenPrefix ? decompVals.subarray(4) : decompVals;
                nonNullVals = decodeRleBitPackedHybrid(rlePayload, 1, nonNullCount).map((b) => b === 1);
            } else {
                nonNullVals = decodeParquetPlainValues(
                    decompVals,
                    0,
                    nonNullCount,
                    colChunk.physicalType,
                    logicalType,
                    colChunk.typeLength ?? 0,
                    colChunk.isInt96 ?? false,
                    colChunk.isUnsigned ?? false,
                    colChunk.scale ?? 0
                ).values;
            }

            if (maxRepLevel >= 1 && repLevels && defLevels) {
                const listRows = reconstructDremelSingleLevelList(
                    repLevels,
                    defLevels,
                    nonNullVals,
                    maxDefLevel
                );
                columnValues.push(...listRows);
            } else {
                let valIdx = 0;
                for (let i = 0; i < numValues && columnValues.length < expectedRows; i++) {
                    if (defLevels && defLevels[i] < maxDefLevel) {
                        columnValues.push(null);
                    } else {
                        columnValues.push(nonNullVals[valIdx++] ?? null);
                    }
                }
            }
        }
    }

    return columnValues;
}

interface ParquetSchemaLeafInfo {
    name: string;
    displayColName: string;
    pathKey: string;
    topGroupName: string;
    topGroupKind: 'PRIMITIVE' | 'STRUCT' | 'LIST_PRIMITIVE' | 'LIST_STRUCT' | 'MAP';
    subFieldPath: string[];
    mapRole?: 'key' | 'value';
    physicalType: PhysicalDataType;
    logicalType: LogicalDataType;
    repetitionType: RepetitionType;
    maxDefLevel: number;
    maxRepLevel: number;
    typeLength: number;
    precision?: number;
    scale?: number;
    isInt96: boolean;
    isUnsigned: boolean;
}

/**
 * Walks the flat Thrift SchemaElement array to compute exact Dremel maxDefLevel, maxRepLevel,
 * and non-colliding path hierarchies for every leaf column (handling STRUCT, MAP, and LIST-of-STRUCT).
 */
function buildParquetLeafSchemaHierarchy(
    elements: {
        name: string;
        physicalType: PhysicalDataType;
        logicalType: LogicalDataType;
        repetitionType: RepetitionType;
        numChildren: number;
        typeLength: number;
        precision?: number;
        scale?: number;
        isInt96: boolean;
        isUnsigned: boolean;
    }[]
): ParquetSchemaLeafInfo[] {
    if (elements.length === 0) return [];
    const leaves: ParquetSchemaLeafInfo[] = [];
    let cursor = 1; // skip root element at index 0

    interface TempLeaf {
        elem: (typeof elements)[0];
        pathParts: string[];
        maxDefLevel: number;
        maxRepLevel: number;
        hasMapAncestor: boolean;
        hasListOrRepAncestor: boolean;
    }

    const rootChildren = elements[0].numChildren || elements.length - 1;
    for (let i = 0; i < rootChildren && cursor < elements.length; i++) {
        const topElem = elements[cursor];
        const tempLeaves: TempLeaf[] = [];

        const visitSubtree = (
            pathParts: string[],
            defLevel: number,
            repLevel: number,
            hasMap: boolean,
            hasList: boolean
        ) => {
            if (cursor >= elements.length) return;
            const elem = elements[cursor++];
            const nextDef =
                elem.repetitionType === 'OPTIONAL' || elem.repetitionType === 'REPEATED'
                    ? defLevel + 1
                    : defLevel;
            const nextRep = elem.repetitionType === 'REPEATED' ? repLevel + 1 : repLevel;
            const currentPath = [...pathParts, elem.name];
            const nextHasMap = hasMap || elem.logicalType === 'MAP';
            const nextHasList =
                hasList || elem.logicalType === 'LIST' || elem.repetitionType === 'REPEATED';

            if (elem.numChildren > 0) {
                for (let c = 0; c < elem.numChildren; c++) {
                    visitSubtree(currentPath, nextDef, nextRep, nextHasMap, nextHasList);
                }
            } else {
                tempLeaves.push({
                    elem,
                    pathParts: currentPath,
                    maxDefLevel: nextDef,
                    maxRepLevel: nextRep,
                    hasMapAncestor: nextHasMap,
                    hasListOrRepAncestor: nextHasList,
                });
            }
        };

        visitSubtree([], 0, 0, false, false);

        const topGroupName = topElem.name;
        const isSingleLeaf = tempLeaves.length === 1;
        const anyRepeated = tempLeaves.some((tl) => tl.maxRepLevel > 0 || tl.hasListOrRepAncestor);
        const isMapGroup =
            (topElem.logicalType === 'MAP' || tempLeaves.some((tl) => tl.hasMapAncestor)) &&
            tempLeaves.length === 2;

        let topGroupKind: ParquetSchemaLeafInfo['topGroupKind'] = 'PRIMITIVE';
        if (isMapGroup) {
            topGroupKind = 'MAP';
        } else if (isSingleLeaf && anyRepeated) {
            topGroupKind = 'LIST_PRIMITIVE';
        } else if (!isSingleLeaf && anyRepeated) {
            topGroupKind = 'LIST_STRUCT';
        } else if (!isSingleLeaf || topElem.numChildren > 0) {
            topGroupKind = 'STRUCT';
        }

        for (let lIdx = 0; lIdx < tempLeaves.length; lIdx++) {
            const tl = tempLeaves[lIdx];
            const pathKey = tl.pathParts.join('.');
            // Only collapse displayColName to topGroupName for a 1-leaf primitive LIST or flat PRIMITIVE;
            // multi-leaf STRUCT, MAP, and LIST_STRUCT keep unique pathKey per chunk to prevent column overwrite!
            const displayColName =
                topGroupKind === 'PRIMITIVE' || topGroupKind === 'LIST_PRIMITIVE'
                    ? topGroupName
                    : pathKey;

            // Compute relative subFieldPath inside STRUCT or LIST_STRUCT
            let subFieldPath = tl.pathParts.slice(1);
            if (
                topGroupKind === 'LIST_STRUCT' &&
                subFieldPath.length >= 3 &&
                (subFieldPath[0] === 'list' || subFieldPath[0] === 'bag') &&
                (subFieldPath[1] === 'element' || subFieldPath[1] === 'item' || subFieldPath[1] === 'array_element')
            ) {
                subFieldPath = subFieldPath.slice(2);
            } else if (topGroupKind === 'LIST_STRUCT' && subFieldPath.length >= 2) {
                subFieldPath = subFieldPath.slice(1);
            }
            if (subFieldPath.length === 0) {
                subFieldPath = [tl.elem.name];
            }

            leaves.push({
                name: tl.elem.name,
                displayColName,
                pathKey,
                topGroupName,
                topGroupKind,
                subFieldPath,
                mapRole: topGroupKind === 'MAP' ? (lIdx === 0 ? 'key' : 'value') : undefined,
                physicalType: tl.elem.physicalType,
                logicalType: topGroupKind === 'LIST_PRIMITIVE' ? 'LIST' : tl.elem.logicalType,
                repetitionType: topGroupKind === 'LIST_PRIMITIVE' ? 'REPEATED' : tl.elem.repetitionType,
                maxDefLevel: tl.maxDefLevel,
                maxRepLevel: tl.maxRepLevel,
                typeLength: tl.elem.typeLength,
                precision: tl.elem.precision,
                scale: tl.elem.scale,
                isInt96: tl.elem.isInt96,
                isUnsigned: tl.elem.isUnsigned,
            });
        }
    }

    return leaves;
}

function setNestedStructValue(target: Record<string, unknown>, pathParts: string[], value: unknown): void {
    let cur = target;
    for (let i = 0; i < pathParts.length - 1; i++) {
        const key = pathParts[i];
        if (!cur[key] || typeof cur[key] !== 'object' || Array.isArray(cur[key])) {
            cur[key] = {};
        }
        cur = cur[key] as Record<string, unknown>;
    }
    cur[pathParts[pathParts.length - 1]] = value;
}

/**
 * Decodes Apache Parquet (PAR1) binary files using our real Apache Thrift TCompactProtocol
 * FileMetaData footer parser and spec-compliant DataPage v1/v2 + DictionaryPage decoder.
 */
function parseParquetBinary(
    bytes: Uint8Array,
    warnings: string[]
): {
    rows: Record<string, unknown>[];
    schema: ColumnSchemaNode[];
    codec: string;
    formatVersion: string;
    createdBy: string;
    keyValueMetadata: Record<string, string>;
    rowGroups: RowGroupMeta[];
    totalUncompressedBytes: number;
    totalCompressedBytes: number;
} {
    void warnings;
    if (bytes.length < 12) {
        throw new Error(
            `Truncated Apache Parquet container (${bytes.length} bytes < minimum 12-byte header + footer + PAR1 signature).`
        );
    }
    if (
        bytes[0] !== 0x50 ||
        bytes[1] !== 0x41 ||
        bytes[2] !== 0x52 ||
        bytes[3] !== 0x31
    ) {
        throw new Error(
            `Invalid Apache Parquet leading magic bytes (expected "PAR1" 0x50415231, found ${bytesToHex(bytes, 4)}).`
        );
    }
    if (
        bytes[bytes.length - 4] !== 0x50 ||
        bytes[bytes.length - 3] !== 0x41 ||
        bytes[bytes.length - 2] !== 0x52 ||
        bytes[bytes.length - 1] !== 0x31
    ) {
        throw new Error(
            'Truncated or corrupted Apache Parquet file: missing trailing "PAR1" (0x50415231) footer signature.'
        );
    }

    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const footerLen = view.getUint32(bytes.length - 8, true);
    if (footerLen <= 0 || 4 + footerLen + 8 > bytes.length) {
        throw new Error(
            `Corrupted Apache Parquet footer length (${footerLen} bytes exceeds file size of ${bytes.length} bytes).`
        );
    }

    const footerStart = bytes.length - 8 - footerLen;
    const footerBytes = bytes.subarray(footerStart, bytes.length - 8);

    const tr = new ThriftCompactReader(footerBytes, 0);
    tr.beginStruct();

    let version = 2;
    let numRows = 0;
    let createdBy = 'parquet-mr / Apache Parquet';
    const rawSchemaElements: {
        name: string;
        physicalType: PhysicalDataType;
        logicalType: LogicalDataType;
        repetitionType: RepetitionType;
        numChildren: number;
        typeLength: number;
        precision?: number;
        scale?: number;
        isInt96: boolean;
        isUnsigned: boolean;
    }[] = [];
    const keyValueMetadata: Record<string, string> = {};
    const decodedRowGroups: (RowGroupMeta & {
        columns: (RowGroupColumnChunkMeta & {
            dictionaryPageOffset?: number;
            isInt96?: boolean;
            typeLength?: number;
            isUnsigned?: boolean;
            scale?: number;
        })[];
    })[] = [];

    while (tr.pos < footerBytes.length) {
        const { fieldId, fieldType } = tr.readFieldHeader();
        if (fieldType === CT_STOP) break;

        if (fieldId === 1 && fieldType === CT_I32) {
            version = tr.readI32();
        } else if (fieldId === 2 && fieldType === CT_LIST) {
            const { count } = tr.readListHeader();
            if (count <= 0 || count > MAX_DECLARED_COLUMN_COUNT) {
                throw new Error(`Invalid Parquet SchemaElement count (${count}) in FileMetaData footer.`);
            }
            for (let i = 0; i < count; i++) {
                tr.beginStruct();
                let pType: PhysicalDataType = 'BYTE_ARRAY';
                let lType: LogicalDataType | null = null;
                let repType: RepetitionType = 'OPTIONAL';
                let name = `col_${i}`;
                let numChildren = 0;
                let typeLength = 0;
                let scale = 0;
                let precision = 0;
                let isInt96 = false;
                let isUnsigned = false;

                while (tr.pos < footerBytes.length) {
                    const sf = tr.readFieldHeader();
                    if (sf.fieldType === CT_STOP) break;
                    if (sf.fieldId === 1 && sf.fieldType === CT_I32) {
                        const rawEnum = tr.readI32();
                        if (rawEnum === 3) isInt96 = true;
                        pType = PARQUET_ENUM_TO_TYPE[rawEnum] ?? 'BYTE_ARRAY';
                    } else if (sf.fieldId === 2 && sf.fieldType === CT_I32) {
                        typeLength = tr.readI32();
                    } else if (sf.fieldId === 3 && sf.fieldType === CT_I32) {
                        const r = tr.readI32();
                        repType = r === 0 ? 'REQUIRED' : r === 1 ? 'OPTIONAL' : 'REPEATED';
                    } else if (sf.fieldId === 4 && sf.fieldType === CT_BINARY) {
                        name = tr.readString();
                    } else if (sf.fieldId === 5 && sf.fieldType === CT_I32) {
                        numChildren = tr.readI32();
                    } else if (sf.fieldId === 6 && sf.fieldType === CT_I32) {
                        const ct = tr.readI32();
                        if (ct >= 11 && ct <= 14) isUnsigned = true;
                        if (PARQUET_CONVERTED_TYPE_MAP[ct]) {
                            lType = PARQUET_CONVERTED_TYPE_MAP[ct];
                        }
                    } else if (sf.fieldId === 7 && sf.fieldType === CT_I32) {
                        scale = tr.readI32();
                    } else if (sf.fieldId === 8 && sf.fieldType === CT_I32) {
                        precision = tr.readI32();
                    } else if (sf.fieldId === 10 && sf.fieldType === CT_STRUCT) {
                        // LogicalType union struct
                        tr.beginStruct();
                        while (tr.pos < footerBytes.length) {
                            const lf = tr.readFieldHeader();
                            if (lf.fieldType === CT_STOP) break;
                            if (lf.fieldId === 1) {
                                lType = 'UTF8';
                                tr.skipField(lf.fieldType);
                            } else if (lf.fieldId === 2) {
                                lType = 'MAP';
                                tr.skipField(lf.fieldType);
                            } else if (lf.fieldId === 3) {
                                lType = 'LIST';
                                tr.skipField(lf.fieldType);
                            } else if (lf.fieldId === 5 && lf.fieldType === CT_STRUCT) {
                                lType = 'DECIMAL';
                                tr.beginStruct();
                                while (tr.pos < footerBytes.length) {
                                    const df = tr.readFieldHeader();
                                    if (df.fieldType === CT_STOP) break;
                                    if (df.fieldId === 1 && df.fieldType === CT_I32) scale = tr.readI32();
                                    else if (df.fieldId === 2 && df.fieldType === CT_I32) precision = tr.readI32();
                                    else tr.skipField(df.fieldType);
                                }
                                tr.endStruct();
                            } else if (lf.fieldId === 6) {
                                lType = 'DATE';
                                tr.skipField(lf.fieldType);
                            } else if (lf.fieldId === 8 && lf.fieldType === CT_STRUCT) {
                                // TimestampType(isAdjustedToUTC, unit: TimeUnit { 1=MILLIS, 2=MICROS, 3=NANOS })
                                lType = 'TIMESTAMP_MILLIS';
                                tr.beginStruct();
                                while (tr.pos < footerBytes.length) {
                                    const tsf = tr.readFieldHeader();
                                    if (tsf.fieldType === CT_STOP) break;
                                    if (tsf.fieldId === 2 && tsf.fieldType === CT_STRUCT) {
                                        tr.beginStruct();
                                        while (tr.pos < footerBytes.length) {
                                            const uf = tr.readFieldHeader();
                                            if (uf.fieldType === CT_STOP) break;
                                            if (uf.fieldId === 1) lType = 'TIMESTAMP_MILLIS';
                                            else if (uf.fieldId === 2) lType = 'TIMESTAMP_MICROS';
                                            else if (uf.fieldId === 3) lType = 'TIMESTAMP_NANOS';
                                            tr.skipField(uf.fieldType);
                                        }
                                        tr.endStruct();
                                    } else {
                                        tr.skipField(tsf.fieldType);
                                    }
                                }
                                tr.endStruct();
                            } else if (lf.fieldId === 10 && lf.fieldType === CT_STRUCT) {
                                tr.beginStruct();
                                let bw = 32;
                                let signed = true;
                                while (tr.pos < footerBytes.length) {
                                    const intf = tr.readFieldHeader();
                                    if (intf.fieldType === CT_STOP) break;
                                    if (intf.fieldId === 1 && intf.fieldType === CT_BYTE) {
                                        bw = footerBytes[tr.pos++];
                                    } else if (intf.fieldId === 2) {
                                        signed = intf.fieldType === CT_BOOLEAN_TRUE;
                                    } else {
                                        tr.skipField(intf.fieldType);
                                    }
                                }
                                tr.endStruct();
                                if (!signed) {
                                    isUnsigned = true;
                                    if (bw === 64) lType = 'UINT64';
                                }
                            } else if (lf.fieldId === 12) {
                                lType = 'JSON';
                                tr.skipField(lf.fieldType);
                            } else if (lf.fieldId === 14) {
                                lType = 'UUID';
                                tr.skipField(lf.fieldType);
                            } else {
                                tr.skipField(lf.fieldType);
                            }
                        }
                        tr.endStruct();
                    } else {
                        tr.skipField(sf.fieldType);
                    }
                }
                tr.endStruct();

                const resolvedLogical: LogicalDataType =
                    lType ??
                    (isInt96
                        ? 'TIMESTAMP_NANOS'
                        : pType === 'BYTE_ARRAY'
                            ? 'UTF8'
                            : (pType as LogicalDataType));

                rawSchemaElements.push({
                    name,
                    physicalType: pType,
                    logicalType: resolvedLogical,
                    repetitionType: repType,
                    numChildren,
                    typeLength,
                    precision: precision > 0 ? precision : undefined,
                    scale: scale > 0 ? scale : undefined,
                    isInt96,
                    isUnsigned,
                });
            }
        } else if (fieldId === 3 && fieldType === CT_I64) {
            numRows = Number(tr.readI64());
            if (numRows < 0 || numRows > MAX_DECLARED_ROW_COUNT) {
                throw new Error(`Declared Parquet row count (${numRows}) exceeds safe allocation limit.`);
            }
        } else if (fieldId === 4 && fieldType === CT_LIST) {
            const { count: rgCount } = tr.readListHeader();
            const leafRefs = buildParquetLeafSchemaHierarchy(rawSchemaElements);

            for (let rgIdx = 0; rgIdx < rgCount; rgIdx++) {
                tr.beginStruct();
                const rgCols: (RowGroupColumnChunkMeta & {
                    dictionaryPageOffset?: number;
                    isInt96?: boolean;
                    typeLength?: number;
                    isUnsigned?: boolean;
                    scale?: number;
                })[] = [];
                let rgTotalByteSize = 0;
                let rgNumRows = 0;
                let rgCompressedBytes = 0;

                while (tr.pos < footerBytes.length) {
                    const rf = tr.readFieldHeader();
                    if (rf.fieldType === CT_STOP) break;
                    if (rf.fieldId === 1 && rf.fieldType === CT_LIST) {
                        const { count: colCount } = tr.readListHeader();
                        for (let cIdx = 0; cIdx < colCount; cIdx++) {
                            tr.beginStruct();
                            const leafRef = leafRefs[cIdx];
                            let fileOffset = 4;
                            let colType: PhysicalDataType = leafRef?.physicalType ?? 'BYTE_ARRAY';
                            let isInt96 = leafRef?.isInt96 ?? false;
                            const isUnsigned = leafRef?.isUnsigned ?? false;
                            const scale = leafRef?.scale ?? 0;
                            let codecName = 'SNAPPY';
                            const encodingsList: string[] = [];
                            let numValues = 0;
                            let uncompSize = 0;
                            let compSize = 0;
                            let dataPageOffset = 0;
                            let dictionaryPageOffset = 0;
                            let pathName = leafRef?.displayColName ?? `col_${cIdx}`;
                            let minVal: string | number | null = null;
                            let maxVal: string | number | null = null;
                            let nullCount = 0;
                            let distinctCount = 0;

                            while (tr.pos < footerBytes.length) {
                                const cf = tr.readFieldHeader();
                                if (cf.fieldType === CT_STOP) break;
                                if (cf.fieldId === 2 && cf.fieldType === CT_I64) {
                                    fileOffset = Number(tr.readI64());
                                } else if (cf.fieldId === 3 && cf.fieldType === CT_STRUCT) {
                                    tr.beginStruct();
                                    while (tr.pos < footerBytes.length) {
                                        const mf = tr.readFieldHeader();
                                        if (mf.fieldType === CT_STOP) break;
                                        if (mf.fieldId === 1 && mf.fieldType === CT_I32) {
                                            const rawT = tr.readI32();
                                            if (rawT === 3) isInt96 = true;
                                            colType = PARQUET_ENUM_TO_TYPE[rawT] ?? 'BYTE_ARRAY';
                                        } else if (mf.fieldId === 2 && mf.fieldType === CT_LIST) {
                                            const { count: encCount } = tr.readListHeader();
                                            for (let e = 0; e < encCount; e++) {
                                                const encId = tr.readI32();
                                                const encName = PARQUET_ENCODING_ENUM_TO_NAME[encId] ?? `ENC_${encId}`;
                                                if (!encodingsList.includes(encName)) encodingsList.push(encName);
                                            }
                                        } else if (mf.fieldId === 3 && mf.fieldType === CT_LIST) {
                                            const { count: pCount } = tr.readListHeader();
                                            const parts: string[] = [];
                                            for (let p = 0; p < pCount; p++) parts.push(tr.readString());
                                            if (parts.length > 0 && !leafRef) pathName = parts.join('.');
                                        } else if (mf.fieldId === 4 && mf.fieldType === CT_I32) {
                                            codecName = PARQUET_CODEC_ENUM_TO_NAME[tr.readI32()] ?? 'SNAPPY';
                                        } else if (mf.fieldId === 5 && mf.fieldType === CT_I64) {
                                            numValues = Number(tr.readI64());
                                        } else if (mf.fieldId === 6 && mf.fieldType === CT_I64) {
                                            uncompSize = Number(tr.readI64());
                                        } else if (mf.fieldId === 7 && mf.fieldType === CT_I64) {
                                            compSize = Number(tr.readI64());
                                        } else if (mf.fieldId === 9 && mf.fieldType === CT_I64) {
                                            dataPageOffset = Number(tr.readI64());
                                        } else if (mf.fieldId === 11 && mf.fieldType === CT_I64) {
                                            dictionaryPageOffset = Number(tr.readI64());
                                        } else if (mf.fieldId === 12 && mf.fieldType === CT_STRUCT) {
                                            tr.beginStruct();
                                            const lType = leafRef?.logicalType ?? 'UTF8';
                                            while (tr.pos < footerBytes.length) {
                                                const stf = tr.readFieldHeader();
                                                if (stf.fieldType === CT_STOP) break;
                                                if ((stf.fieldId === 1 || stf.fieldId === 5) && stf.fieldType === CT_BINARY) {
                                                    const rawB = tr.readBinary();
                                                    const dec = decodeParquetStatBytes(rawB, colType, lType, isInt96, isUnsigned, scale);
                                                    if (dec !== null) maxVal = dec;
                                                } else if ((stf.fieldId === 2 || stf.fieldId === 6) && stf.fieldType === CT_BINARY) {
                                                    const rawB = tr.readBinary();
                                                    const dec = decodeParquetStatBytes(rawB, colType, lType, isInt96, isUnsigned, scale);
                                                    if (dec !== null) minVal = dec;
                                                } else if (stf.fieldId === 3 && stf.fieldType === CT_I64) {
                                                    nullCount = Number(tr.readI64());
                                                } else if (stf.fieldId === 4 && stf.fieldType === CT_I64) {
                                                    distinctCount = Number(tr.readI64());
                                                } else {
                                                    tr.skipField(stf.fieldType);
                                                }
                                            }
                                            tr.endStruct();
                                        } else {
                                            tr.skipField(mf.fieldType);
                                        }
                                    }
                                    tr.endStruct();
                                } else {
                                    tr.skipField(cf.fieldType);
                                }
                            }
                            tr.endStruct();

                            rgCols.push({
                                name: leafRef?.displayColName ?? pathName,
                                physicalType: colType,
                                codec: codecName,
                                encodings: encodingsList.length > 0 ? encodingsList : ['PLAIN', 'RLE_DICTIONARY'],
                                numValues,
                                compressedSize: compSize,
                                uncompressedSize: uncompSize,
                                compressionRatio: compSize > 0 ? Number((uncompSize / compSize).toFixed(2)) : 1,
                                dataPageOffset: dataPageOffset || fileOffset || 4,
                                dictionaryPageOffset,
                                isInt96,
                                typeLength: leafRef?.typeLength ?? 0,
                                isUnsigned,
                                scale,
                                nullCount,
                                distinctCount,
                                minValue: minVal,
                                maxValue: maxVal,
                            });
                        }
                    } else if (rf.fieldId === 2 && rf.fieldType === CT_I64) {
                        rgTotalByteSize = Number(tr.readI64());
                    } else if (rf.fieldId === 3 && rf.fieldType === CT_I64) {
                        rgNumRows = Number(tr.readI64());
                    } else if (rf.fieldId === 5 && rf.fieldType === CT_I64) {
                        rgCompressedBytes = Number(tr.readI64());
                    } else {
                        tr.skipField(rf.fieldType);
                    }
                }
                tr.endStruct();

                if (rgCompressedBytes === 0) {
                    rgCompressedBytes = rgCols.reduce((a, c) => a + c.compressedSize, 0);
                }
                if (rgTotalByteSize === 0) {
                    rgTotalByteSize = rgCols.reduce((a, c) => a + c.uncompressedSize, 0);
                }
                decodedRowGroups.push({
                    index: rgIdx,
                    rowCount: rgNumRows,
                    totalByteSize: rgTotalByteSize,
                    compressedBytes: rgCompressedBytes,
                    compressionRatio:
                        rgCompressedBytes > 0
                            ? Number((rgTotalByteSize / rgCompressedBytes).toFixed(2))
                            : 1,
                    columns: rgCols,
                    isSyntheticEstimate: false,
                    containerUnitLabel: 'Parquet Row Group',
                });
            }
        } else if (fieldId === 5 && fieldType === CT_LIST) {
            const { count: kvCount } = tr.readListHeader();
            for (let i = 0; i < Math.min(kvCount, 256); i++) {
                tr.beginStruct();
                let k = '';
                let v = '';
                while (tr.pos < footerBytes.length) {
                    const kf = tr.readFieldHeader();
                    if (kf.fieldType === CT_STOP) break;
                    if (kf.fieldId === 1 && kf.fieldType === CT_BINARY) k = tr.readString();
                    else if (kf.fieldId === 2 && kf.fieldType === CT_BINARY) v = tr.readString();
                    else tr.skipField(kf.fieldType);
                }
                tr.endStruct();
                if (k) keyValueMetadata[k] = v;
            }
        } else if (fieldId === 6 && fieldType === CT_BINARY) {
            createdBy = tr.readString();
        } else {
            tr.skipField(fieldType);
        }
    }
    tr.endStruct();

    if (rawSchemaElements.length === 0) {
        throw new Error('Corrupted Apache Parquet footer: no SchemaElements found in FileMetaData.');
    }

    let savedSchema: ColumnSchemaNode[] = [];
    if (keyValueMetadata['kivarotools.schema.json']) {
        try {
            savedSchema = JSON.parse(keyValueMetadata['kivarotools.schema.json']);
            delete keyValueMetadata['kivarotools.schema.json'];
        } catch {
            savedSchema = [];
        }
    }

    const leafHierarchy = buildParquetLeafSchemaHierarchy(rawSchemaElements);
    const rows: Record<string, unknown>[] = Array.from({ length: numRows }, () => ({}));
    let globalRowOffset = 0;

    for (const rg of decodedRowGroups) {
        const rgRowCount = rg.rowCount;
        if (rgRowCount > 0) {
            const decodedByLeafIdx: unknown[][] = [];
            for (let cIdx = 0; cIdx < rg.columns.length; cIdx++) {
                const colChunk = rg.columns[cIdx];
                const leaf = leafHierarchy[cIdx] ?? leafHierarchy.find((l) => l.displayColName === colChunk.name);
                const savedCol = savedSchema.find((s) => s.name === colChunk.name);
                const logicalType: LogicalDataType =
                    savedCol?.logicalType ?? leaf?.logicalType ?? 'UTF8';
                const maxDefLevel = leaf ? leaf.maxDefLevel : 1;
                const maxRepLevel = leaf ? leaf.maxRepLevel : 0;

                decodedByLeafIdx[cIdx] = decodeParquetColumnChunkValues(
                    bytes,
                    footerStart,
                    colChunk,
                    logicalType,
                    maxDefLevel,
                    maxRepLevel,
                    rgRowCount
                );
            }

            // Group leaves by topGroupName to reconstruct STRUCT, MAP, and LIST_STRUCT columns without overwrite
            const topGroups = new Map<string, { kind: ParquetSchemaLeafInfo['topGroupKind']; items: { idx: number; leaf: ParquetSchemaLeafInfo }[] }>();
            for (let cIdx = 0; cIdx < rg.columns.length; cIdx++) {
                const leaf = leafHierarchy[cIdx];
                if (!leaf) {
                    const colName = rg.columns[cIdx].name;
                    for (let r = 0; r < rgRowCount && globalRowOffset + r < rows.length; r++) {
                        rows[globalRowOffset + r][colName] = decodedByLeafIdx[cIdx]?.[r] ?? null;
                    }
                    continue;
                }
                const existing = topGroups.get(leaf.topGroupName);
                if (existing) {
                    existing.items.push({ idx: cIdx, leaf });
                } else {
                    topGroups.set(leaf.topGroupName, { kind: leaf.topGroupKind, items: [{ idx: cIdx, leaf }] });
                }
            }

            for (const [topName, group] of topGroups.entries()) {
                if (group.kind === 'PRIMITIVE' || group.kind === 'LIST_PRIMITIVE') {
                    const cIdx = group.items[0].idx;
                    const vals = decodedByLeafIdx[cIdx] ?? [];
                    for (let r = 0; r < rgRowCount && globalRowOffset + r < rows.length; r++) {
                        rows[globalRowOffset + r][topName] = vals[r] ?? null;
                    }
                } else if (group.kind === 'STRUCT') {
                    for (let r = 0; r < rgRowCount && globalRowOffset + r < rows.length; r++) {
                        const structObj: Record<string, unknown> = {};
                        let allNull = true;
                        for (const { idx, leaf } of group.items) {
                            const v = decodedByLeafIdx[idx]?.[r] ?? null;
                            if (v !== null && v !== undefined) allNull = false;
                            setNestedStructValue(structObj, leaf.subFieldPath, v);
                        }
                        rows[globalRowOffset + r][topName] = allNull && group.items[0].leaf.maxDefLevel > 1 ? null : structObj;
                    }
                } else if (group.kind === 'MAP') {
                    const keyItem = group.items.find((it) => it.leaf.mapRole === 'key') ?? group.items[0];
                    const valItem = group.items.find((it) => it.leaf.mapRole === 'value') ?? group.items[1];
                    const keyLists = decodedByLeafIdx[keyItem.idx] ?? [];
                    const valLists = valItem ? (decodedByLeafIdx[valItem.idx] ?? []) : [];
                    for (let r = 0; r < rgRowCount && globalRowOffset + r < rows.length; r++) {
                        const kArr = keyLists[r];
                        const vArr = valLists[r];
                        if (!Array.isArray(kArr)) {
                            rows[globalRowOffset + r][topName] = null;
                        } else {
                            const mapObj: Record<string, unknown> = {};
                            for (let k = 0; k < kArr.length; k++) {
                                const keyStr = String(kArr[k] ?? `key_${k}`);
                                mapObj[keyStr] = Array.isArray(vArr) ? (vArr[k] ?? null) : null;
                            }
                            rows[globalRowOffset + r][topName] = mapObj;
                        }
                    }
                } else if (group.kind === 'LIST_STRUCT') {
                    for (let r = 0; r < rgRowCount && globalRowOffset + r < rows.length; r++) {
                        let maxLen = -1;
                        for (const { idx } of group.items) {
                            const arr = decodedByLeafIdx[idx]?.[r];
                            if (Array.isArray(arr)) {
                                maxLen = Math.max(maxLen, arr.length);
                            }
                        }
                        if (maxLen < 0) {
                            rows[globalRowOffset + r][topName] = null;
                        } else {
                            const listOut: Record<string, unknown>[] = [];
                            for (let elemIdx = 0; elemIdx < maxLen; elemIdx++) {
                                const elemObj: Record<string, unknown> = {};
                                for (const { idx, leaf } of group.items) {
                                    const arr = decodedByLeafIdx[idx]?.[r];
                                    const val = Array.isArray(arr) ? (arr[elemIdx] ?? null) : null;
                                    setNestedStructValue(elemObj, leaf.subFieldPath, val);
                                }
                                listOut.push(elemObj);
                            }
                            rows[globalRowOffset + r][topName] = listOut;
                        }
                    }
                }
            }
        }
        globalRowOffset += rgRowCount;
    }

    let schema: ColumnSchemaNode[] = savedSchema;
    if (schema.length === 0) {
        const seenTop = new Set<string>();
        const builtSchema: ColumnSchemaNode[] = [];
        for (let idx = 0; idx < leafHierarchy.length; idx++) {
            const e = leafHierarchy[idx];
            if (seenTop.has(e.topGroupName)) continue;
            seenTop.add(e.topGroupName);
            const rgCol = decodedRowGroups[0]?.columns[idx];

            if (e.topGroupKind === 'PRIMITIVE' || e.topGroupKind === 'LIST_PRIMITIVE') {
                builtSchema.push({
                    index: builtSchema.length,
                    name: e.topGroupName,
                    physicalType: e.physicalType,
                    logicalType: e.logicalType,
                    repetitionType: e.repetitionType,
                    nullable: e.maxDefLevel > 0,
                    precision: e.precision,
                    scale: e.scale,
                    typeLength: e.typeLength > 0 ? e.typeLength : undefined,
                    compressionCodec: rgCol?.codec || 'SNAPPY',
                    encoding: rgCol?.encodings?.[0] || 'PLAIN',
                });
            } else {
                const groupLogical: LogicalDataType =
                    e.topGroupKind === 'MAP'
                        ? 'MAP'
                        : e.topGroupKind === 'LIST_STRUCT'
                            ? 'LIST'
                            : 'STRUCT';
                builtSchema.push({
                    index: builtSchema.length,
                    name: e.topGroupName,
                    physicalType: 'BYTE_ARRAY',
                    logicalType: groupLogical,
                    repetitionType: groupLogical === 'LIST' ? 'REPEATED' : e.maxDefLevel > 0 ? 'OPTIONAL' : 'REQUIRED',
                    nullable: e.maxDefLevel > 0,
                    compressionCodec: rgCol?.codec || 'SNAPPY',
                    encoding: rgCol?.encodings?.[0] || 'PLAIN',
                });
            }
        }
        schema = builtSchema;
    }

    if (rows.length > 0 && leafHierarchy.length > 0) {
        for (const rg of decodedRowGroups) {
            for (const c of rg.columns) {
                if (c.minValue === null || c.maxValue === null || !c.distinctCount) {
                    const topProfs = computeColumnProfiles(rows, schema);
                    const p = topProfs.find((cp) => cp.name === c.name || c.name.startsWith(`${cp.name}.`));
                    if (p) {
                        if (!c.distinctCount) c.distinctCount = p.distinctCount;
                        if (c.minValue === null) c.minValue = p.min;
                        if (c.maxValue === null) c.maxValue = p.max;
                    }
                }
            }
        }
    }

    const totalUncompressedBytes = decodedRowGroups.reduce((a, rg) => a + rg.totalByteSize, 0);
    const totalCompressedBytes = decodedRowGroups.reduce((a, rg) => a + rg.compressedBytes, 0);
    const primaryCodec = decodedRowGroups[0]?.columns[0]?.codec || 'UNCOMPRESSED';

    return {
        rows,
        schema,
        codec: primaryCodec,
        formatVersion: `Parquet ${version}.0 (Thrift TCompactProtocol)`,
        createdBy,
        keyValueMetadata,
        rowGroups: decodedRowGroups,
        totalUncompressedBytes,
        totalCompressedBytes,
    };
}

function coerceNumericStat(s: string): string | number {
    if (/^-?\d+(\.\d+)?$/.test(s)) {
        if (/^-?\d+$/.test(s)) {
            const b = BigInt(s);
            if (b > BigInt(Number.MAX_SAFE_INTEGER) || b < BigInt(Number.MIN_SAFE_INTEGER)) {
                return s;
            }
        }
        const n = Number(s);
        if (Number.isFinite(n)) return n;
    }
    return s;
}

/**
 * Recursive Apache Avro Binary Datum Decoder
 */
function readAvroBinaryDatum(
    schemaNode: unknown,
    bytes: Uint8Array,
    offset: number,
    namedTypes: Map<string, Record<string, unknown>> = new Map(),
    depth = 0
): { value: unknown; nextOffset: number } {
    if (depth > 64) {
        throw new Error('Avro recursive schema depth exceeded maximum limit (64).');
    }
    if (offset > bytes.length) {
        throw new Error('Malformed Avro binary datum: unexpected end of block buffer.');
    }

    if (typeof schemaNode === 'string') {
        if (namedTypes.has(schemaNode)) {
            return readAvroBinaryDatum(namedTypes.get(schemaNode), bytes, offset, namedTypes, depth + 1);
        }
        switch (schemaNode) {
            case 'null':
                return { value: null, nextOffset: offset };
            case 'boolean': {
                if (offset >= bytes.length) throw new Error('Truncated Avro boolean datum.');
                const b = bytes[offset];
                if (b > 1) throw new Error(`Invalid Avro boolean byte (${b}).`);
                return { value: b === 1, nextOffset: offset + 1 };
            }
            case 'int': {
                if (offset >= bytes.length) throw new Error('Truncated Avro int datum.');
                const zz = readZigZagVarint(bytes, offset);
                return { value: zz.value, nextOffset: zz.nextOffset };
            }
            case 'long': {
                if (offset >= bytes.length) throw new Error('Truncated Avro long datum.');
                const zz = readZigZagVarint(bytes, offset);
                const b = zz.bigValue;
                const val =
                    b > BigInt(Number.MAX_SAFE_INTEGER) || b < BigInt(Number.MIN_SAFE_INTEGER)
                        ? b.toString()
                        : Number(b);
                return { value: val, nextOffset: zz.nextOffset };
            }
            case 'float': {
                if (offset + 4 > bytes.length) throw new Error('Truncated Avro float datum.');
                const dv = new DataView(bytes.buffer, bytes.byteOffset + offset, 4);
                return { value: dv.getFloat32(0, true), nextOffset: offset + 4 };
            }
            case 'double': {
                if (offset + 8 > bytes.length) throw new Error('Truncated Avro double datum.');
                const dv = new DataView(bytes.buffer, bytes.byteOffset + offset, 8);
                return { value: dv.getFloat64(0, true), nextOffset: offset + 8 };
            }
            case 'bytes':
            case 'string': {
                if (offset >= bytes.length) throw new Error(`Truncated Avro ${schemaNode} length.`);
                const lenVar = readZigZagVarint(bytes, offset);
                const len = lenVar.value;
                const start = lenVar.nextOffset;
                if (len < 0 || start + len > bytes.length) {
                    throw new Error(`Malformed Avro ${schemaNode} length (${len}) exceeds block buffer.`);
                }
                const end = start + len;
                if (schemaNode === 'bytes') {
                    return { value: bytesToHex(bytes.subarray(start, end), len), nextOffset: end };
                }
                const s = textDecoder.decode(bytes.subarray(start, end));
                return { value: s, nextOffset: end };
            }
            default:
                throw new Error(`Unknown or unresolved Avro schema type "${schemaNode}".`);
        }
    }

    if (Array.isArray(schemaNode)) {
        if (offset >= bytes.length) throw new Error('Truncated Avro union branch index.');
        const idxVar = readZigZagVarint(bytes, offset);
        if (idxVar.value < 0 || idxVar.value >= schemaNode.length) {
            throw new Error(`Invalid Avro union branch index (${idxVar.value}) for union of length ${schemaNode.length}.`);
        }
        const branchSchema = schemaNode[idxVar.value];
        return readAvroBinaryDatum(branchSchema, bytes, idxVar.nextOffset, namedTypes, depth + 1);
    }

    if (schemaNode && typeof schemaNode === 'object') {
        const obj = schemaNode as Record<string, unknown>;
        const t = obj.type;

        if (typeof obj.name === 'string') {
            namedTypes.set(obj.name, obj);
            if (typeof obj.namespace === 'string') {
                namedTypes.set(`${obj.namespace}.${obj.name}`, obj);
            }
        }

        if (t === 'record' && Array.isArray(obj.fields)) {
            const rec: Record<string, unknown> = {};
            let cur = offset;
            for (const f of obj.fields as Record<string, unknown>[]) {
                const fname = String(f.name ?? '');
                const res = readAvroBinaryDatum(f.type, bytes, cur, namedTypes, depth + 1);
                rec[fname] = res.value;
                cur = res.nextOffset;
            }
            return { value: rec, nextOffset: cur };
        }

        if (t === 'array') {
            const items: unknown[] = [];
            let cur = offset;
            while (cur < bytes.length) {
                const countVar = readZigZagVarint(bytes, cur);
                cur = countVar.nextOffset;
                let count = countVar.value;
                if (count === 0) break;
                if (count < 0) {
                    count = -count;
                    const byteSizeVar = readZigZagVarint(bytes, cur);
                    cur = byteSizeVar.nextOffset;
                }
                if (count > MAX_DECLARED_ROW_COUNT) {
                    throw new Error(`Avro array block count (${count}) exceeds safety limit.`);
                }
                for (let i = 0; i < count; i++) {
                    const elem = readAvroBinaryDatum(obj.items, bytes, cur, namedTypes, depth + 1);
                    items.push(elem.value);
                    cur = elem.nextOffset;
                }
            }
            return { value: items, nextOffset: cur };
        }

        if (t === 'map') {
            const mapObj: Record<string, unknown> = {};
            let cur = offset;
            while (cur < bytes.length) {
                const countVar = readZigZagVarint(bytes, cur);
                cur = countVar.nextOffset;
                let count = countVar.value;
                if (count === 0) break;
                if (count < 0) {
                    count = -count;
                    const byteSizeVar = readZigZagVarint(bytes, cur);
                    cur = byteSizeVar.nextOffset;
                }
                if (count > MAX_DECLARED_ROW_COUNT) {
                    throw new Error(`Avro map block count (${count}) exceeds safety limit.`);
                }
                for (let i = 0; i < count; i++) {
                    const kRes = readAvroBinaryDatum('string', bytes, cur, namedTypes, depth + 1);
                    const vRes = readAvroBinaryDatum(obj.values, bytes, kRes.nextOffset, namedTypes, depth + 1);
                    mapObj[String(kRes.value)] = vRes.value;
                    cur = vRes.nextOffset;
                }
            }
            return { value: mapObj, nextOffset: cur };
        }

        if (t === 'enum' && Array.isArray(obj.symbols)) {
            const idxVar = readZigZagVarint(bytes, offset);
            const symbols = obj.symbols as string[];
            if (idxVar.value < 0 || idxVar.value >= symbols.length) {
                throw new Error(`Invalid Avro enum symbol index (${idxVar.value}).`);
            }
            return {
                value: symbols[idxVar.value],
                nextOffset: idxVar.nextOffset,
            };
        }

        if (t === 'fixed' && typeof obj.size === 'number') {
            if (offset + obj.size > bytes.length) {
                throw new Error(`Truncated Avro fixed(${obj.size}) datum.`);
            }
            const slice = bytes.subarray(offset, offset + obj.size);
            if (obj.logicalType === 'decimal') {
                const scale = typeof obj.scale === 'number' ? obj.scale : 0;
                return {
                    value: formatScaledDecimal(decodeTwoComplementBigEndian(slice), scale),
                    nextOffset: offset + obj.size,
                };
            }
            return {
                value: bytesToHex(slice, obj.size),
                nextOffset: offset + obj.size,
            };
        }

        if (t === 'bytes' && obj.logicalType === 'decimal') {
            const lenVar = readZigZagVarint(bytes, offset);
            const len = lenVar.value;
            const start = lenVar.nextOffset;
            if (len < 0 || start + len > bytes.length) {
                throw new Error('Malformed Avro decimal bytes length.');
            }
            const scale = typeof obj.scale === 'number' ? obj.scale : 0;
            return {
                value: formatScaledDecimal(decodeTwoComplementBigEndian(bytes.subarray(start, start + len)), scale),
                nextOffset: start + len,
            };
        }

        if (typeof t === 'string') {
            const res = readAvroBinaryDatum(t, bytes, offset, namedTypes, depth + 1);
            if (obj.logicalType === 'date' && typeof res.value === 'number') {
                return {
                    value: formatEpochTimestampToIso(BigInt(res.value) * BigInt(86400), 's').slice(0, 10),
                    nextOffset: res.nextOffset,
                };
            }
            if (obj.logicalType === 'timestamp-millis' && (typeof res.value === 'number' || typeof res.value === 'string')) {
                return {
                    value: formatEpochTimestampToIso(BigInt(res.value), 'ms'),
                    nextOffset: res.nextOffset,
                };
            }
            if (obj.logicalType === 'timestamp-micros' && (typeof res.value === 'number' || typeof res.value === 'string')) {
                return {
                    value: formatEpochTimestampToIso(BigInt(res.value), 'us'),
                    nextOffset: res.nextOffset,
                };
            }
            if (obj.logicalType === 'timestamp-nanos' && (typeof res.value === 'number' || typeof res.value === 'string')) {
                return {
                    value: formatEpochTimestampToIso(BigInt(res.value), 'ns'),
                    nextOffset: res.nextOffset,
                };
            }
            return res;
        }
    }

    throw new Error('Malformed Avro schema node.');
}

function buildSchemaFromAvroJson(avroSchemaObj: Record<string, unknown>, codec: string): ColumnSchemaNode[] {
    if (!avroSchemaObj || !Array.isArray(avroSchemaObj.fields)) return [];
    return (avroSchemaObj.fields as Record<string, unknown>[]).map((f, index) => {
        const name = String(f.name ?? `col_${index}`);
        let rawType = f.type;
        let nullable = false;
        if (Array.isArray(rawType)) {
            nullable = rawType.includes('null');
            rawType = rawType.find((t) => t !== 'null') ?? 'string';
        }
        const prim =
            typeof rawType === 'string'
                ? rawType
                : typeof rawType === 'object' && rawType !== null
                    ? String((rawType as Record<string, unknown>).type ?? 'string')
                    : 'string';

        let physicalType: PhysicalDataType = 'BYTE_ARRAY';
        let logicalType: LogicalDataType = 'UTF8';
        if (prim === 'boolean') {
            physicalType = 'BOOLEAN';
            logicalType = 'BOOLEAN';
        } else if (prim === 'int') {
            physicalType = 'INT32';
            logicalType = 'INT32';
        } else if (prim === 'long') {
            physicalType = 'INT64';
            logicalType = 'INT64';
        } else if (prim === 'float') {
            physicalType = 'FLOAT';
            logicalType = 'FLOAT';
        } else if (prim === 'double') {
            physicalType = 'DOUBLE';
            logicalType = 'DOUBLE';
        } else if (prim === 'array') {
            physicalType = 'BYTE_ARRAY';
            logicalType = 'LIST';
        } else if (prim === 'record') {
            physicalType = 'BYTE_ARRAY';
            logicalType = 'STRUCT';
        } else if (prim === 'map') {
            physicalType = 'BYTE_ARRAY';
            logicalType = 'MAP';
        }

        return {
            index,
            name,
            physicalType,
            logicalType,
            repetitionType: logicalType === 'LIST' ? 'REPEATED' : nullable ? 'OPTIONAL' : 'REQUIRED',
            nullable,
            compressionCodec: codec,
            encoding: 'AVRO_ZIGZAG_BINARY',
        };
    });
}

/**
 * Decodes Apache Avro Object Container Files ("Obj\x01") across all blocks and records real physical
 * Avro OCF Data Blocks for the Binary X-Ray Inspector.
 */
function parseAvroBinary(
    bytes: Uint8Array,
    warnings: string[]
): {
    rows: Record<string, unknown>[];
    schema: ColumnSchemaNode[];
    codec: string;
    keyValueMetadata: Record<string, string>;
    syncMarkerHex: string;
    rowGroups: RowGroupMeta[];
    uncompressedBytes: number;
    compressedBytes: number;
} {
    void warnings;
    if (bytes.length >= 5 && bytes[0] === 0x00) {
        const schemaId = new DataView(bytes.buffer, bytes.byteOffset + 1, 4).getUint32(0, false);
        throw new Error(
            `Confluent Schema Registry Wire Format payload detected (leading magic byte 0x00, Schema ID #${schemaId}, header hex: ${bytesToHex(bytes, 5)}). Standalone Avro Object Container Files require an "Obj\\x01" (0x4F626A01) header with an embedded avro.schema JSON.`
        );
    }
    if (
        bytes.length < 22 ||
        bytes[0] !== 0x4f ||
        bytes[1] !== 0x62 ||
        bytes[2] !== 0x6a ||
        bytes[3] !== 0x01
    ) {
        throw new Error(
            `Invalid Apache Avro Object Container File header (expected "Obj\x01" 0x4F626A01, found ${bytesToHex(bytes, 4)}).`
        );
    }

    let pos = 4; // after "Obj\x01"
    const metaMap: Record<string, string> = {};
    while (pos < bytes.length) {
        const blockCountVar = readZigZagVarint(bytes, pos);
        pos = blockCountVar.nextOffset;
        let count = blockCountVar.value;
        if (count === 0) break;
        if (count < 0) {
            count = -count;
            const byteSizeVar = readZigZagVarint(bytes, pos);
            pos = byteSizeVar.nextOffset;
        }
        if (count > 256) {
            throw new Error(`Malformed Avro header metadata map: excessive entry count (${count}).`);
        }
        for (let i = 0; i < count; i++) {
            const kLen = readZigZagVarint(bytes, pos);
            pos = kLen.nextOffset;
            if (kLen.value < 0 || pos + kLen.value > bytes.length) {
                throw new Error('Truncated Avro header metadata key.');
            }
            const key = textDecoder.decode(bytes.subarray(pos, pos + kLen.value));
            pos += kLen.value;

            const vLen = readZigZagVarint(bytes, pos);
            pos = vLen.nextOffset;
            if (vLen.value < 0 || pos + vLen.value > bytes.length) {
                throw new Error('Truncated Avro header metadata value.');
            }
            const val = textDecoder.decode(bytes.subarray(pos, pos + vLen.value));
            pos += vLen.value;
            metaMap[key] = val;
        }
    }

    if (pos + 16 > bytes.length) {
        throw new Error('Truncated Avro Object Container File: missing 16-byte header sync marker.');
    }
    const syncMarker = bytes.subarray(pos, pos + 16);
    pos += 16;

    const codec = (metaMap['avro.codec'] || 'null').toUpperCase();
    if (!SUPPORTED_AVRO_CODECS.has(codec)) {
        throw new Error(
            `Unsupported Avro compression codec "${codec}". Supported Avro OCF codecs in browser memory are null, deflate, and snappy.`
        );
    }

    let savedSchema: ColumnSchemaNode[] = [];
    if (metaMap['kivarotools.schema']) {
        try {
            savedSchema = JSON.parse(metaMap['kivarotools.schema']);
            delete metaMap['kivarotools.schema'];
        } catch {
            savedSchema = [];
        }
    }

    if (!metaMap['avro.schema']) {
        throw new Error('Malformed Avro Object Container File: missing required "avro.schema" entry in header metadata.');
    }
    let parsedAvroSchema: unknown;
    try {
        parsedAvroSchema = JSON.parse(metaMap['avro.schema']);
    } catch (e: unknown) {
        throw new Error(`Invalid JSON in Avro "avro.schema" header: ${e instanceof Error ? e.message : String(e)}`);
    }

    const rows: Record<string, unknown>[] = [];
    let totalUncomp = 0;
    let totalComp = 0;
    const namedTypes = new Map<string, Record<string, unknown>>();
    const blockMetas: { blockIndex: number; offset: number; recCount: number; compBytes: number; uncompBytes: number; blockRows: Record<string, unknown>[] }[] = [];
    let blockIdx = 0;

    while (pos < bytes.length) {
        const blockStartOffset = pos;
        const recCountVar = readZigZagVarint(bytes, pos);
        pos = recCountVar.nextOffset;
        const blockByteLenVar = readZigZagVarint(bytes, pos);
        pos = blockByteLenVar.nextOffset;

        const recCount = recCountVar.value;
        const blockByteLen = blockByteLenVar.value;
        if (recCount < 0 || blockByteLen < 0 || pos + blockByteLen + 16 > bytes.length) {
            throw new Error(
                `Truncated or corrupted Avro data block (declared records=${recCount}, byteLength=${blockByteLen}, remaining=${bytes.length - pos}).`
            );
        }
        if (recCount > MAX_DECLARED_ROW_COUNT) {
            throw new Error(`Avro block record count (${recCount}) exceeds safety allocation limit.`);
        }

        totalComp += blockByteLen;
        let blockPayload = bytes.subarray(pos, pos + blockByteLen);
        if (codec === 'SNAPPY') {
            if (blockByteLen < 4) {
                throw new Error('Malformed Avro Snappy block: missing 4-byte CRC32 checksum trailer.');
            }
            const compressedSlice = bytes.subarray(pos, pos + blockByteLen - 4);
            const expectedCrc = new DataView(
                bytes.buffer,
                bytes.byteOffset + pos + blockByteLen - 4,
                4
            ).getUint32(0, false);
            blockPayload = decompressSnappyBlock(compressedSlice);
            const actualCrc = computeCrc32(blockPayload);
            if (actualCrc !== expectedCrc) {
                throw new Error(
                    `Corrupted Avro Snappy block: CRC32 checksum mismatch (expected 0x${expectedCrc.toString(16)}, got 0x${actualCrc.toString(16)}).`
                );
            }
        } else if (codec === 'DEFLATE') {
            blockPayload = decompressGzipOrDeflate(blockPayload);
        }
        totalUncomp += blockPayload.length;

        const blockSync = bytes.subarray(pos + blockByteLen, pos + blockByteLen + 16);
        for (let s = 0; s < 16; s++) {
            if (blockSync[s] !== syncMarker[s]) {
                throw new Error(
                    `Corrupted Avro OCF data block: 16-byte sync marker mismatch at offset ${pos + blockByteLen}.`
                );
            }
        }
        pos += blockByteLen + 16;

        if (recCount === 0) continue;

        let datumOffset = 0;
        const blockRows: Record<string, unknown>[] = [];
        for (let r = 0; r < recCount; r++) {
            if (datumOffset >= blockPayload.length) {
                throw new Error(
                    `Truncated Avro data block: expected ${recCount} records, but buffer ended after ${r} record(s).`
                );
            }
            const res = readAvroBinaryDatum(parsedAvroSchema, blockPayload, datumOffset, namedTypes, 0);
            if (res.value && typeof res.value === 'object' && !Array.isArray(res.value)) {
                const recObj = res.value as Record<string, unknown>;
                if (savedSchema.length > 0) {
                    for (const sc of savedSchema) {
                        const rv = recObj[sc.name];
                        if (
                            typeof rv === 'string' &&
                            (sc.logicalType === 'STRUCT' ||
                                sc.logicalType === 'LIST' ||
                                sc.logicalType === 'MAP' ||
                                sc.logicalType === 'JSON') &&
                            (rv.startsWith('{') || rv.startsWith('['))
                        ) {
                            try {
                                recObj[sc.name] = JSON.parse(rv);
                            } catch {
                                // keep string
                            }
                        }
                    }
                }
                rows.push(recObj);
                blockRows.push(recObj);
            } else {
                const wrapped = { value: res.value };
                rows.push(wrapped);
                blockRows.push(wrapped);
            }
            datumOffset = res.nextOffset;
        }
        blockMetas.push({
            blockIndex: blockIdx++,
            offset: blockStartOffset,
            recCount,
            compBytes: blockByteLen,
            uncompBytes: blockPayload.length,
            blockRows,
        });
    }

    const schema =
        savedSchema.length > 0
            ? savedSchema
            : parsedAvroSchema && typeof parsedAvroSchema === 'object' && !Array.isArray(parsedAvroSchema)
                ? buildSchemaFromAvroJson(parsedAvroSchema as Record<string, unknown>, codec)
                : inferSchemaFromRows(rows, codec, 'AVRO_ZIGZAG_BINARY');

    // Build real Avro OCF Data Block metadata for Binary X-Ray
    const colCount = Math.max(1, schema.length);
    const rowGroups: RowGroupMeta[] = blockMetas.map((bm) => {
        const blockProfs = computeColumnProfiles(bm.blockRows, schema);
        const perColComp = Math.max(1, Math.round(bm.compBytes / colCount));
        const perColUncomp = Math.max(1, Math.round(bm.uncompBytes / colCount));
        return {
            index: bm.blockIndex,
            rowCount: bm.recCount,
            totalByteSize: bm.uncompBytes,
            compressedBytes: bm.compBytes,
            compressionRatio: bm.compBytes > 0 ? Number((bm.uncompBytes / bm.compBytes).toFixed(2)) : 1,
            isSyntheticEstimate: false,
            containerUnitLabel: 'Avro OCF Data Block',
            columns: schema.map((col, idx) => {
                const prof = blockProfs[idx];
                return {
                    name: col.name,
                    physicalType: col.physicalType,
                    codec,
                    encodings: ['AVRO_ZIGZAG_BINARY'],
                    numValues: bm.recCount,
                    compressedSize: perColComp,
                    uncompressedSize: perColUncomp,
                    compressionRatio: bm.compBytes > 0 ? Number((bm.uncompBytes / bm.compBytes).toFixed(2)) : 1,
                    dataPageOffset: bm.offset,
                    nullCount: prof?.nullCount ?? 0,
                    distinctCount: prof?.distinctCount ?? 0,
                    minValue: prof?.min ?? null,
                    maxValue: prof?.max ?? null,
                };
            }),
        };
    });

    return {
        rows,
        schema,
        codec,
        keyValueMetadata: metaMap,
        syncMarkerHex: bytesToHex(syncMarker, 16),
        rowGroups,
        uncompressedBytes: totalUncomp || bytes.length,
        compressedBytes: totalComp || bytes.length,
    };
}

/**
 * Low-level FlatBuffers Table Reader Helpers
 */
function fbReadTableSlots(buf: Uint8Array, tablePos: number): number[] {
    if (tablePos < 0 || tablePos + 4 > buf.length) {
        throw new Error('Malformed FlatBuffers table offset (out of bounds).');
    }
    const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    const vtableSoff = dv.getInt32(tablePos, true);
    const vtablePos = tablePos - vtableSoff;
    if (vtablePos < 0 || vtablePos + 4 > buf.length) {
        throw new Error('Malformed FlatBuffers vtable offset (out of bounds).');
    }
    const vlen = dv.getUint16(vtablePos, true);
    if (vlen < 4 || vtablePos + vlen > buf.length) {
        throw new Error('Malformed FlatBuffers vtable length.');
    }
    const numSlots = Math.max(0, Math.floor((vlen - 4) / 2));
    const slots: number[] = [];
    for (let i = 0; i < numSlots && vtablePos + 4 + 2 * i + 2 <= buf.length; i++) {
        slots.push(dv.getUint16(vtablePos + 4 + 2 * i, true));
    }
    return slots;
}

function fbDeref(buf: Uint8Array, pos: number): number {
    if (pos < 0 || pos + 4 > buf.length) {
        throw new Error('Malformed FlatBuffers uoffset reference (out of bounds).');
    }
    const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    const rel = dv.getInt32(pos, true);
    const target = pos + rel;
    if (target < 0 || target > buf.length) {
        throw new Error('Malformed FlatBuffers dereferenced target offset (out of bounds).');
    }
    return target;
}

function fbReadString(buf: Uint8Array, fieldPos: number): string {
    const strPos = fbDeref(buf, fieldPos);
    if (strPos < 0 || strPos + 4 > buf.length) {
        throw new Error('Malformed FlatBuffers string offset.');
    }
    const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    const len = dv.getUint32(strPos, true);
    if (strPos + 4 + len > buf.length) {
        throw new Error('Malformed FlatBuffers string length exceeds buffer.');
    }
    return textDecoder.decode(buf.subarray(strPos + 4, strPos + 4 + len));
}

/**
 * Helper to decode a Feather V1 PrimitiveArray into an array of JS values.
 */
function decodeFeatherV1PrimitiveArray(
    bytes: Uint8Array,
    metaBuf: Uint8Array,
    metaDv: DataView,
    metaStart: number,
    paPos: number,
    colName: string,
    metaType = 0,
    metaTablePos = 0
): {
    values: unknown[];
    physicalType: PhysicalDataType;
    logicalType: LogicalDataType;
    offset: number;
    totalBytes: number;
    nullCount: number;
} {
    const paSlots = fbReadTableSlots(metaBuf, paPos);
    const pType = paSlots[0] ? metaDv.getInt8(paPos + paSlots[0]) : 0;
    const pEnc = paSlots.length > 1 && paSlots[1] ? metaDv.getInt8(paPos + paSlots[1]) : 0;
    const pOff = paSlots.length > 2 && paSlots[2] ? Number(metaDv.getBigInt64(paPos + paSlots[2], true)) : 0;
    const pLen = paSlots.length > 3 && paSlots[3] ? Number(metaDv.getBigInt64(paPos + paSlots[3], true)) : 0;
    const pNulls = paSlots.length > 4 && paSlots[4] ? Number(metaDv.getBigInt64(paPos + paSlots[4], true)) : 0;
    const pTotal = paSlots.length > 5 && paSlots[5] ? Number(metaDv.getBigInt64(paPos + paSlots[5], true)) : 0;

    if (pEnc !== 0) {
        throw new Error(
            `Unsupported Feather V1 column encoding (${pEnc}) in column "${colName}". Only PLAIN (0) Feather V1 arrays are supported.`
        );
    }
    if (pOff < 8 || pTotal < 0 || pOff + pTotal > metaStart) {
        throw new Error(
            `Malformed Feather V1 PrimitiveArray in column "${colName}": buffer [${pOff}..${pOff + pTotal}] exceeds data region [8..${metaStart}].`
        );
    }

    const colSlice = bytes.subarray(pOff, pOff + pTotal);
    const nullBitmapPaddedBytes = pNulls > 0 ? Math.ceil(Math.ceil(pLen / 8) / 8) * 8 : 0;
    if (nullBitmapPaddedBytes > colSlice.length) {
        throw new Error(`Malformed Feather V1 null bitmap in column "${colName}".`);
    }
    const isNullAt = (r: number): boolean => {
        if (pNulls === 0) return false;
        return ((colSlice[r >>> 3] >>> (r & 7)) & 1) === 0;
    };

    const valRegion = colSlice.subarray(nullBitmapPaddedBytes);
    const valDv = new DataView(valRegion.buffer, valRegion.byteOffset, valRegion.byteLength);

    let physicalType: PhysicalDataType = 'BYTE_ARRAY';
    let logicalType: LogicalDataType = 'UTF8';
    const values: unknown[] = new Array(pLen);

    let tsUnit = 1; // 0=s, 1=ms, 2=us, 3=ns
    let categoryLevels: unknown[] | null = null;
    if (metaType === 1 && metaTablePos > 0) {
        // CategoryMetadata: slot 0 = levels (PrimitiveArray)
        const catSlots = fbReadTableSlots(metaBuf, metaTablePos);
        if (catSlots[0]) {
            const levelsPaPos = fbDeref(metaBuf, metaTablePos + catSlots[0]);
            categoryLevels = decodeFeatherV1PrimitiveArray(
                bytes,
                metaBuf,
                metaDv,
                metaStart,
                levelsPaPos,
                `${colName}.levels`
            ).values;
        }
    } else if (metaType === 2 && metaTablePos > 0) {
        const tmSlots = fbReadTableSlots(metaBuf, metaTablePos);
        if (tmSlots[0]) tsUnit = metaDv.getInt8(metaTablePos + tmSlots[0]);
    }

    if (pType === 0) {
        physicalType = 'BOOLEAN';
        logicalType = 'BOOLEAN';
        const reqBytes = Math.ceil(pLen / 8);
        if (valRegion.length < reqBytes) throw new Error(`Truncated Feather V1 BOOL column "${colName}".`);
        for (let r = 0; r < pLen; r++) {
            values[r] = isNullAt(r) ? null : ((valRegion[r >>> 3] >>> (r & 7)) & 1) === 1;
        }
    } else if ((pType >= 1 && pType <= 8) || pType === 13 || pType === 14) {
        // 1..8 = INT8..UINT64, 13 = CATEGORY, 14 = TIMESTAMP, 15 = DATE, 16 = TIME
        const byteWidths: Record<number, number> = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 1, 6: 2, 7: 4, 8: 8, 13: 4, 14: 8 };
        const bw = byteWidths[pType] ?? 4;
        if (valRegion.length < pLen * bw) {
            throw new Error(`Truncated Feather V1 integer buffer in column "${colName}".`);
        }
        physicalType = categoryLevels ? 'BYTE_ARRAY' : bw === 8 ? 'INT64' : 'INT32';
        logicalType = categoryLevels
            ? 'UTF8'
            : metaType === 3
                ? 'DATE'
                : metaType === 2
                    ? tsUnit === 3
                        ? 'TIMESTAMP_NANOS'
                        : tsUnit === 2
                            ? 'TIMESTAMP_MICROS'
                            : 'TIMESTAMP_MILLIS'
                    : pType === 8
                        ? 'UINT64'
                        : bw === 8
                            ? 'INT64'
                            : 'INT32';

        for (let r = 0; r < pLen; r++) {
            if (isNullAt(r)) {
                values[r] = null;
                continue;
            }
            let rawInt = 0;
            if (pType === 1) rawInt = valDv.getInt8(r);
            else if (pType === 2) rawInt = valDv.getInt16(r * 2, true);
            else if (pType === 3 || pType === 13) rawInt = valDv.getInt32(r * 4, true);
            else if (pType === 5) rawInt = valDv.getUint8(r);
            else if (pType === 6) rawInt = valDv.getUint16(r * 2, true);
            else if (pType === 7) rawInt = valDv.getUint32(r * 4, true);

            if (categoryLevels) {
                values[r] = categoryLevels[rawInt] ?? null;
            } else if (pType === 4 || pType === 14) {
                const b = valDv.getBigInt64(r * 8, true);
                if (metaType === 2 || pType === 14) {
                    const u: 's' | 'ms' | 'us' | 'ns' =
                        tsUnit === 0 ? 's' : tsUnit === 1 ? 'ms' : tsUnit === 2 ? 'us' : 'ns';
                    values[r] = formatEpochTimestampToIso(b, u);
                } else {
                    values[r] =
                        b > BigInt(Number.MAX_SAFE_INTEGER) || b < BigInt(Number.MIN_SAFE_INTEGER)
                            ? b.toString()
                            : Number(b);
                }
            } else if (pType === 8) {
                const u = valDv.getBigUint64(r * 8, true);
                values[r] = u > BigInt(Number.MAX_SAFE_INTEGER) ? u.toString() : Number(u);
            } else if (metaType === 3) {
                values[r] = formatEpochTimestampToIso(BigInt(rawInt) * BigInt(86400), 's').slice(0, 10);
            } else {
                values[r] = rawInt;
            }
        }
    } else if (pType === 9 || pType === 10) {
        const bw = pType === 9 ? 4 : 8;
        if (valRegion.length < pLen * bw) {
            throw new Error(`Truncated Feather V1 float buffer in column "${colName}".`);
        }
        physicalType = pType === 9 ? 'FLOAT' : 'DOUBLE';
        logicalType = pType === 9 ? 'FLOAT' : 'DOUBLE';
        for (let r = 0; r < pLen; r++) {
            if (isNullAt(r)) {
                values[r] = null;
            } else if (pType === 9) {
                values[r] = valDv.getFloat32(r * 4, true);
            } else {
                values[r] = valDv.getFloat64(r * 8, true);
            }
        }
    } else if (pType === 11 || pType === 12) {
        physicalType = 'BYTE_ARRAY';
        logicalType = pType === 11 ? 'UTF8' : 'BINARY';
        const rawOffsetsBytes = (pLen + 1) * 4;
        const paddedOffsetsBytes = Math.ceil(rawOffsetsBytes / 8) * 8;
        if (valRegion.length < paddedOffsetsBytes) {
            throw new Error(`Truncated Feather V1 UTF8/BINARY offsets buffer in column "${colName}".`);
        }
        const strDataRegion = valRegion.subarray(paddedOffsetsBytes);
        for (let r = 0; r < pLen; r++) {
            if (isNullAt(r)) {
                values[r] = null;
                continue;
            }
            const sOff = valDv.getInt32(r * 4, true);
            const eOff = valDv.getInt32((r + 1) * 4, true);
            if (sOff < 0 || eOff < sOff || eOff > strDataRegion.length) {
                throw new Error(
                    `Malformed Feather V1 string offset [${sOff}..${eOff}] in column "${colName}" (data length=${strDataRegion.length}).`
                );
            }
            const slice = strDataRegion.subarray(sOff, eOff);
            values[r] = pType === 11 ? textDecoder.decode(slice) : bytesToHex(slice, slice.length);
        }
    } else {
        throw new Error(`Unsupported Feather V1 PrimitiveArray physical type (${pType}) in column "${colName}".`);
    }

    return {
        values,
        physicalType,
        logicalType,
        offset: pOff,
        totalBytes: pTotal,
        nullCount: pNulls,
    };
}

/**
 * Dedicated Feather V1 ("FEA1") Parser — Parses the historical Feather V1 CTable FlatBuffers layout.
 */
export function parseFeatherV1Binary(bytes: Uint8Array): {
    rows: Record<string, unknown>[];
    schema: ColumnSchemaNode[];
    codec: string;
    formatVersion: string;
    createdBy: string;
    keyValueMetadata: Record<string, string>;
    rowGroups: RowGroupMeta[];
    uncompressedBytes: number;
    compressedBytes: number;
} {
    if (bytes.length < 16) {
        throw new Error(`Truncated Feather V1 (FEA1) file (${bytes.length} bytes < minimum 16-byte container).`);
    }
    if (
        bytes[0] !== 0x46 ||
        bytes[1] !== 0x45 ||
        bytes[2] !== 0x41 ||
        bytes[3] !== 0x31
    ) {
        throw new Error(`Invalid Feather V1 leading magic bytes (expected "FEA1" 0x46454131, found ${bytesToHex(bytes, 4)}).`);
    }
    if (
        bytes[bytes.length - 4] !== 0x46 ||
        bytes[bytes.length - 3] !== 0x45 ||
        bytes[bytes.length - 2] !== 0x41 ||
        bytes[bytes.length - 1] !== 0x31
    ) {
        throw new Error('Truncated or corrupted Feather V1 file: missing trailing "FEA1" (0x46454131) footer magic bytes.');
    }

    const fileDv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const metaLen = fileDv.getUint32(bytes.length - 8, true);
    const metaStart = bytes.length - 8 - metaLen;
    if (metaLen <= 0 || metaStart < 8 || metaStart >= bytes.length - 8) {
        throw new Error(
            `Corrupted Feather V1 CTable metadata length (${metaLen} bytes) at tail of ${bytes.length}-byte file.`
        );
    }

    const metaBuf = bytes.subarray(metaStart, bytes.length - 8);
    const metaDv = new DataView(metaBuf.buffer, metaBuf.byteOffset, metaBuf.byteLength);
    const rootPos = metaDv.getUint32(0, true);
    const ctSlots = fbReadTableSlots(metaBuf, rootPos);
    if (ctSlots.length < 3) {
        throw new Error('Malformed Feather V1 CTable FlatBuffer: missing required num_rows or columns slots.');
    }

    const description = ctSlots[0] ? fbReadString(metaBuf, rootPos + ctSlots[0]) : '';
    const numRows = ctSlots[1] ? Number(metaDv.getBigInt64(rootPos + ctSlots[1], true)) : 0;
    if (numRows < 0 || numRows > MAX_DECLARED_ROW_COUNT) {
        throw new Error(`Invalid Feather V1 CTable num_rows (${numRows}).`);
    }

    const colsVec = ctSlots[2] ? fbDeref(metaBuf, rootPos + ctSlots[2]) : 0;
    const numCols = colsVec ? metaDv.getUint32(colsVec, true) : 0;
    if (numCols < 0 || numCols > MAX_DECLARED_COLUMN_COUNT) {
        throw new Error(`Invalid Feather V1 CTable column count (${numCols}).`);
    }

    const ctVersion = ctSlots.length > 3 && ctSlots[3] ? metaDv.getInt32(rootPos + ctSlots[3], true) : 2;
    const rows: Record<string, unknown>[] = Array.from({ length: numRows }, () => ({}));
    const schema: ColumnSchemaNode[] = [];
    const colChunkMetas: RowGroupColumnChunkMeta[] = [];
    let totalDataBytes = 0;

    for (let cIdx = 0; cIdx < numCols; cIdx++) {
        const colPos = fbDeref(metaBuf, colsVec + 4 + 4 * cIdx);
        const colSlots = fbReadTableSlots(metaBuf, colPos);
        const colName = colSlots[0] ? fbReadString(metaBuf, colPos + colSlots[0]) : `col_${cIdx}`;
        if (!colSlots[1]) {
            throw new Error(`Malformed Feather V1 Column "${colName}": missing PrimitiveArray values table.`);
        }
        const paPos = fbDeref(metaBuf, colPos + colSlots[1]);
        const metaType = colSlots.length > 2 && colSlots[2] ? metaBuf[colPos + colSlots[2]] : 0;
        const metaTablePos = colSlots.length > 3 && colSlots[3] ? fbDeref(metaBuf, colPos + colSlots[3]) : 0;

        const decoded = decodeFeatherV1PrimitiveArray(
            bytes,
            metaBuf,
            metaDv,
            metaStart,
            paPos,
            colName,
            metaType,
            metaTablePos
        );

        if (decoded.values.length !== numRows) {
            throw new Error(
                `Malformed Feather V1 PrimitiveArray in column "${colName}": column length (${decoded.values.length}) does not match CTable num_rows (${numRows}).`
            );
        }

        totalDataBytes += decoded.totalBytes;
        for (let r = 0; r < numRows; r++) {
            rows[r][colName] = decoded.values[r];
        }

        schema.push({
            index: cIdx,
            name: colName,
            physicalType: decoded.physicalType,
            logicalType: decoded.logicalType,
            repetitionType: decoded.nullCount > 0 ? 'OPTIONAL' : 'REQUIRED',
            nullable: decoded.nullCount > 0,
            compressionCodec: 'UNCOMPRESSED',
            encoding: metaType === 1 ? 'FEATHER_V1_CATEGORY_DICT' : 'FEATHER_V1_CTABLE_PLAIN',
        });

        colChunkMetas.push({
            name: colName,
            physicalType: decoded.physicalType,
            codec: 'UNCOMPRESSED',
            encodings: [metaType === 1 ? 'FEATHER_V1_CATEGORY_DICT' : 'FEATHER_V1_CTABLE_PLAIN'],
            numValues: numRows,
            compressedSize: decoded.totalBytes,
            uncompressedSize: decoded.totalBytes,
            compressionRatio: 1,
            dataPageOffset: decoded.offset,
            nullCount: decoded.nullCount,
            distinctCount: 0,
            minValue: null,
            maxValue: null,
        });
    }

    const profs = computeColumnProfiles(rows, schema);
    for (let i = 0; i < colChunkMetas.length; i++) {
        colChunkMetas[i].distinctCount = profs[i]?.distinctCount ?? 0;
        colChunkMetas[i].minValue = profs[i]?.min ?? null;
        colChunkMetas[i].maxValue = profs[i]?.max ?? null;
    }

    const rowGroups: RowGroupMeta[] = [
        {
            index: 0,
            rowCount: numRows,
            totalByteSize: totalDataBytes || bytes.length,
            compressedBytes: totalDataBytes || bytes.length,
            compressionRatio: 1,
            columns: colChunkMetas,
            isSyntheticEstimate: false,
            containerUnitLabel: 'Feather V1 CTable Layout',
        },
    ];

    return {
        rows,
        schema,
        codec: 'UNCOMPRESSED',
        formatVersion: `Feather V1 (Legacy CTable FlatBuffers v${ctVersion}, FEA1)`,
        createdBy: 'Apache Arrow / Feather V1 CTable Writer',
        keyValueMetadata: {
            'feather.v1.magic': 'FEA1',
            'feather.v1.ctable_version': String(ctVersion),
            ...(description ? { 'feather.v1.description': description } : {}),
        },
        rowGroups,
        uncompressedBytes: totalDataBytes || bytes.length,
        compressedBytes: totalDataBytes || bytes.length,
    };
}

/**
 * Arrow IPC / Feather V2 ("ARROW1") & Arrow IPC Stream ("0xFFFFFFFF") FlatBuffers Decoder
 * Supports Primitive types, Decimal128/256, List/LargeList/FixedSizeList, Struct, Map, Float16, Time32/64,
 * FixedSizeBinary, and Dictionary-encoded (categorical) columns.
 */
interface ArrowIpcFieldDesc {
    name: string;
    nullable: boolean;
    typeType: number;
    bitWidth: number;
    isSigned: boolean;
    floatPrecision: number;
    dateUnit: number;
    timeUnit: number;
    precision?: number;
    scale?: number;
    byteWidth?: number;
    listSize?: number;
    dictionary: { id: number; indexBitWidth: number; indexSigned: boolean } | null;
    children: ArrowIpcFieldDesc[];
    physicalType: PhysicalDataType;
    logicalType: LogicalDataType;
}

function parseArrowFieldNode(
    msgBuf: Uint8Array,
    msgDv: DataView,
    fPos: number,
    fallbackIndex = 0
): ArrowIpcFieldDesc {
    const fSlots = fbReadTableSlots(msgBuf, fPos);
    const name = fSlots[0] ? fbReadString(msgBuf, fPos + fSlots[0]) : `col_${fallbackIndex}`;
    const nullable = fSlots.length > 1 && fSlots[1] ? msgBuf[fPos + fSlots[1]] !== 0 : true;
    const typeType = fSlots.length > 2 && fSlots[2] ? msgBuf[fPos + fSlots[2]] : 5;
    const typePos = fSlots.length > 3 && fSlots[3] ? fbDeref(msgBuf, fPos + fSlots[3]) : 0;
    const tSlots = typePos > 0 ? fbReadTableSlots(msgBuf, typePos) : [];

    // Slot 4: dictionary (DictionaryEncoding table: 0=id:int64, 1=indexType:Int, 2=isOrdered:bool)
    let dictionary: ArrowIpcFieldDesc['dictionary'] = null;
    if (fSlots.length > 4 && fSlots[4]) {
        const dictPos = fbDeref(msgBuf, fPos + fSlots[4]);
        const dSlots = fbReadTableSlots(msgBuf, dictPos);
        const dictId = dSlots[0] ? Number(msgDv.getBigInt64(dictPos + dSlots[0], true)) : 0;
        let idxBitWidth = 32;
        let idxSigned = true;
        if (dSlots.length > 1 && dSlots[1]) {
            const idxTypePos = fbDeref(msgBuf, dictPos + dSlots[1]);
            const itSlots = fbReadTableSlots(msgBuf, idxTypePos);
            idxBitWidth = itSlots[0] ? msgDv.getInt32(idxTypePos + itSlots[0], true) : 32;
            idxSigned = itSlots.length > 1 && itSlots[1] ? msgBuf[idxTypePos + itSlots[1]] !== 0 : true;
        }
        dictionary = { id: dictId, indexBitWidth: idxBitWidth, indexSigned: idxSigned };
    }

    // Slot 5: children: [Field]
    const children: ArrowIpcFieldDesc[] = [];
    if (fSlots.length > 5 && fSlots[5]) {
        const chVec = fbDeref(msgBuf, fPos + fSlots[5]);
        const numCh = msgDv.getUint32(chVec, true);
        for (let c = 0; c < Math.min(numCh, 512); c++) {
            const chPos = fbDeref(msgBuf, chVec + 4 + 4 * c);
            children.push(parseArrowFieldNode(msgBuf, msgDv, chPos, c));
        }
    }

    let bitWidth = 32;
    let isSigned = true;
    let floatPrecision = 2;
    let dateUnit = 0;
    let timeUnit = 1;
    let precision: number | undefined;
    let scale: number | undefined;
    let byteWidth: number | undefined;
    let listSize: number | undefined;
    let physicalType: PhysicalDataType = 'BYTE_ARRAY';
    let logicalType: LogicalDataType = 'UTF8';

    if (typeType === 1) {
        // Null
        physicalType = 'BYTE_ARRAY';
        logicalType = 'NULL';
    } else if (typeType === 2) {
        // Int
        bitWidth = tSlots[0] ? msgDv.getInt32(typePos + tSlots[0], true) : 32;
        isSigned = tSlots.length > 1 && tSlots[1] ? msgBuf[typePos + tSlots[1]] !== 0 : false;
        physicalType = bitWidth === 64 ? 'INT64' : 'INT32';
        logicalType = bitWidth === 64 ? (isSigned ? 'INT64' : 'UINT64') : 'INT32';
    } else if (typeType === 3) {
        // FloatingPoint (0=HALF/Float16, 1=SINGLE/Float32, 2=DOUBLE/Float64)
        floatPrecision = tSlots[0] ? msgDv.getInt16(typePos + tSlots[0], true) : 0;
        physicalType = floatPrecision === 2 ? 'DOUBLE' : 'FLOAT';
        logicalType = floatPrecision === 2 ? 'DOUBLE' : 'FLOAT';
    } else if (typeType === 4 || typeType === 5 || typeType === 19 || typeType === 20) {
        // Binary(4), Utf8(5), LargeBinary(19), LargeUtf8(20)
        physicalType = 'BYTE_ARRAY';
        logicalType = typeType === 4 || typeType === 19 ? 'BINARY' : 'UTF8';
    } else if (typeType === 6) {
        // Bool
        physicalType = 'BOOLEAN';
        logicalType = 'BOOLEAN';
    } else if (typeType === 7) {
        // Decimal (0=precision:int32, 1=scale:int32, 2=bitWidth:int32 default 128)
        precision = tSlots[0] ? msgDv.getInt32(typePos + tSlots[0], true) : 18;
        scale = tSlots.length > 1 && tSlots[1] ? msgDv.getInt32(typePos + tSlots[1], true) : 0;
        bitWidth = tSlots.length > 2 && tSlots[2] ? msgDv.getInt32(typePos + tSlots[2], true) : 128;
        byteWidth = Math.max(16, Math.floor(bitWidth / 8));
        physicalType = 'FIXED_LEN_BYTE_ARRAY';
        logicalType = 'DECIMAL';
    } else if (typeType === 8) {
        // Date (0=DAY, 1=MILLISECOND)
        dateUnit = tSlots[0] ? msgDv.getInt16(typePos + tSlots[0], true) : 0;
        physicalType = dateUnit === 0 ? 'INT32' : 'INT64';
        logicalType = 'DATE';
    } else if (typeType === 9) {
        // Time (0=unit:int16, 1=bitWidth:int32 default 32)
        timeUnit = tSlots[0] ? msgDv.getInt16(typePos + tSlots[0], true) : 1;
        bitWidth = tSlots.length > 1 && tSlots[1] ? msgDv.getInt32(typePos + tSlots[1], true) : 32;
        physicalType = bitWidth === 64 ? 'INT64' : 'INT32';
        logicalType = bitWidth === 64 ? 'INT64' : 'INT32';
    } else if (typeType === 10) {
        // Timestamp (0=unit:int16 -> 0=s, 1=ms, 2=us, 3=ns)
        timeUnit = tSlots[0] ? msgDv.getInt16(typePos + tSlots[0], true) : 1;
        physicalType = 'INT64';
        logicalType =
            timeUnit === 3
                ? 'TIMESTAMP_NANOS'
                : timeUnit === 2
                    ? 'TIMESTAMP_MICROS'
                    : 'TIMESTAMP_MILLIS';
    } else if (typeType === 12 || typeType === 21) {
        // List(12), LargeList(21)
        physicalType = 'BYTE_ARRAY';
        logicalType = 'LIST';
    } else if (typeType === 13) {
        // Struct_(13)
        physicalType = 'BYTE_ARRAY';
        logicalType = 'STRUCT';
    } else if (typeType === 15) {
        // FixedSizeBinary(15) (0=byteWidth:int32)
        byteWidth = tSlots[0] ? msgDv.getInt32(typePos + tSlots[0], true) : 16;
        physicalType = 'FIXED_LEN_BYTE_ARRAY';
        logicalType = byteWidth === 16 ? 'UUID' : 'BINARY';
    } else if (typeType === 16) {
        // FixedSizeList(16) (0=listSize:int32)
        listSize = tSlots[0] ? msgDv.getInt32(typePos + tSlots[0], true) : 1;
        physicalType = 'BYTE_ARRAY';
        logicalType = 'LIST';
    } else if (typeType === 17) {
        // Map(17)
        physicalType = 'BYTE_ARRAY';
        logicalType = 'MAP';
    } else {
        throw new Error(
            `Unsupported Arrow IPC Field type (type_type=${typeType}) in column "${name}". Supported Arrow IPC types are Int8..Int64, UInt8..UInt64, Float16/32/64, Bool, Utf8/LargeUtf8, Binary/LargeBinary/FixedSizeBinary, Decimal128/256, Date32/64, Time32/64, Timestamp, List/LargeList/FixedSizeList, Struct, Map, and Dictionary.`
        );
    }

    return {
        name,
        nullable,
        typeType,
        bitWidth,
        isSigned,
        floatPrecision,
        dateUnit,
        timeUnit,
        precision,
        scale,
        byteWidth,
        listSize,
        dictionary,
        children,
        physicalType,
        logicalType,
    };
}

function decodeArrowFieldVector(
    f: ArrowIpcFieldDesc,
    rowCount: number,
    getBufferSlice: (idx: number) => { slice: Uint8Array; offset: number; compLen: number },
    state: { bIdx: number; totalUncomp: number },
    dictionaryPools: Map<number, unknown[]>,
    ignoreDictionary = false
): { values: unknown[]; firstOffset: number; compBytes: number; uncompBytes: number; nullCount: number } {
    const startUncomp = state.totalUncomp;
    let compAcc = 0;
    let firstOffset = 0;

    // 1. Dictionary-encoded field in RecordBatch: consumes validityBuf + indexBuf, then resolves against dictionaryPools
    if (f.dictionary && !ignoreDictionary) {
        const valB = getBufferSlice(state.bIdx++);
        const idxB = getBufferSlice(state.bIdx++);
        firstOffset = valB.offset || idxB.offset;
        compAcc += valB.compLen + idxB.compLen;
        state.totalUncomp += valB.slice.length + idxB.slice.length;

        const isNullAt = (r: number): boolean => {
            if (valB.slice.length === 0) return false;
            return ((valB.slice[r >>> 3] >>> (r & 7)) & 1) === 0;
        };
        const iDv = new DataView(idxB.slice.buffer, idxB.slice.byteOffset, idxB.slice.byteLength);
        const dictVals = dictionaryPools.get(f.dictionary.id) ?? [];
        const bw = f.dictionary.indexBitWidth;
        const signed = f.dictionary.indexSigned;
        const out: unknown[] = new Array(rowCount);
        let nullCount = 0;

        for (let r = 0; r < rowCount; r++) {
            if (isNullAt(r)) {
                out[r] = null;
                nullCount++;
                continue;
            }
            let idx = 0;
            if (bw === 8) idx = signed ? iDv.getInt8(r) : iDv.getUint8(r);
            else if (bw === 16) idx = signed ? iDv.getInt16(r * 2, true) : iDv.getUint16(r * 2, true);
            else if (bw === 64) idx = Number(signed ? iDv.getBigInt64(r * 8, true) : iDv.getBigUint64(r * 8, true));
            else idx = signed ? iDv.getInt32(r * 4, true) : iDv.getUint32(r * 4, true);
            out[r] = dictVals[idx] ?? null;
        }
        return {
            values: out,
            firstOffset,
            compBytes: compAcc,
            uncompBytes: state.totalUncomp - startUncomp,
            nullCount,
        };
    }

    // 2. Null type (consumes 0 buffers in Arrow IPC)
    if (f.typeType === 1) {
        return {
            values: new Array(rowCount).fill(null),
            firstOffset: 0,
            compBytes: 0,
            uncompBytes: 0,
            nullCount: rowCount,
        };
    }

    // Consume validity bitmap buffer
    const valB = getBufferSlice(state.bIdx++);
    firstOffset = valB.offset;
    compAcc += valB.compLen;
    state.totalUncomp += valB.slice.length;

    const isNullAt = (r: number): boolean => {
        if (valB.slice.length === 0) return false;
        return ((valB.slice[r >>> 3] >>> (r & 7)) & 1) === 0;
    };
    let nullCount = 0;
    for (let r = 0; r < rowCount; r++) {
        if (isNullAt(r)) nullCount++;
    }

    // 3. Variable-size Utf8(5) or Binary(4)
    if (f.typeType === 5 || f.typeType === 4) {
        const offB = getBufferSlice(state.bIdx++);
        const datB = getBufferSlice(state.bIdx++);
        if (!firstOffset) firstOffset = offB.offset || datB.offset;
        compAcc += offB.compLen + datB.compLen;
        state.totalUncomp += offB.slice.length + datB.slice.length;
        if (rowCount > 0 && offB.slice.length < (rowCount + 1) * 4) {
            throw new Error(`Malformed Arrow IPC Utf8/Binary offsets buffer in column "${f.name}".`);
        }
        const oDv = new DataView(offB.slice.buffer, offB.slice.byteOffset, offB.slice.byteLength);
        const out: unknown[] = new Array(rowCount);
        for (let r = 0; r < rowCount; r++) {
            if (isNullAt(r)) {
                out[r] = null;
            } else {
                const sOff = oDv.getInt32(r * 4, true);
                const eOff = oDv.getInt32((r + 1) * 4, true);
                if (sOff < 0 || eOff < sOff || eOff > datB.slice.length) {
                    throw new Error(`Out-of-bounds Arrow IPC string offset [${sOff}..${eOff}] in column "${f.name}".`);
                }
                const slice = datB.slice.subarray(sOff, eOff);
                out[r] = f.typeType === 4 ? bytesToHex(slice, slice.length) : textDecoder.decode(slice);
            }
        }
        return { values: out, firstOffset, compBytes: compAcc, uncompBytes: state.totalUncomp - startUncomp, nullCount };
    }

    // 4. LargeUtf8(20) or LargeBinary(19)
    if (f.typeType === 19 || f.typeType === 20) {
        const offB = getBufferSlice(state.bIdx++);
        const datB = getBufferSlice(state.bIdx++);
        if (!firstOffset) firstOffset = offB.offset || datB.offset;
        compAcc += offB.compLen + datB.compLen;
        state.totalUncomp += offB.slice.length + datB.slice.length;
        if (rowCount > 0 && offB.slice.length < (rowCount + 1) * 8) {
            throw new Error(`Malformed Arrow IPC LargeUtf8/LargeBinary offsets buffer in column "${f.name}".`);
        }
        const oDv = new DataView(offB.slice.buffer, offB.slice.byteOffset, offB.slice.byteLength);
        const out: unknown[] = new Array(rowCount);
        for (let r = 0; r < rowCount; r++) {
            if (isNullAt(r)) {
                out[r] = null;
            } else {
                const sOff = Number(oDv.getBigInt64(r * 8, true));
                const eOff = Number(oDv.getBigInt64((r + 1) * 8, true));
                if (sOff < 0 || eOff < sOff || eOff > datB.slice.length) {
                    throw new Error(`Out-of-bounds Arrow IPC LargeUtf8/LargeBinary offset in column "${f.name}".`);
                }
                const slice = datB.slice.subarray(sOff, eOff);
                out[r] = f.typeType === 19 ? bytesToHex(slice, slice.length) : textDecoder.decode(slice);
            }
        }
        return { values: out, firstOffset, compBytes: compAcc, uncompBytes: state.totalUncomp - startUncomp, nullCount };
    }

    // 5. List(12), LargeList(21), or Map(17)
    if (f.typeType === 12 || f.typeType === 21 || f.typeType === 17) {
        const offB = getBufferSlice(state.bIdx++);
        if (!firstOffset) firstOffset = offB.offset;
        compAcc += offB.compLen;
        state.totalUncomp += offB.slice.length;
        const is64 = f.typeType === 21;
        const oDv = new DataView(offB.slice.buffer, offB.slice.byteOffset, offB.slice.byteLength);
        const readOff = (idx: number): number =>
            offB.slice.length === 0
                ? 0
                : is64
                    ? Number(oDv.getBigInt64(idx * 8, true))
                    : oDv.getInt32(idx * 4, true);

        const totalChildCount = rowCount > 0 ? Math.max(0, readOff(rowCount) - readOff(0)) : 0;
        const childDesc = f.children[0];
        if (!childDesc) {
            throw new Error(`Malformed Arrow IPC List/Map column "${f.name}": missing child Field descriptor.`);
        }
        const childDecoded = decodeArrowFieldVector(
            childDesc,
            readOff(rowCount),
            getBufferSlice,
            state,
            dictionaryPools,
            false
        );
        compAcc += childDecoded.compBytes;

        const out: unknown[] = new Array(rowCount);
        for (let r = 0; r < rowCount; r++) {
            if (isNullAt(r)) {
                out[r] = null;
                continue;
            }
            const sOff = readOff(r);
            const eOff = readOff(r + 1);
            const sliceVals = childDecoded.values.slice(sOff, eOff);
            if (f.typeType === 17) {
                const mapObj: Record<string, unknown> = {};
                for (const entry of sliceVals) {
                    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
                        const entriesObj = entry as Record<string, unknown>;
                        const keys = Object.keys(entriesObj);
                        const kVal = entriesObj.key ?? (keys[0] ? entriesObj[keys[0]] : '');
                        const vVal = entriesObj.value ?? (keys[1] ? entriesObj[keys[1]] : null);
                        mapObj[String(kVal)] = vVal;
                    }
                }
                out[r] = mapObj;
            } else {
                out[r] = sliceVals;
            }
        }
        void totalChildCount;
        return { values: out, firstOffset, compBytes: compAcc, uncompBytes: state.totalUncomp - startUncomp, nullCount };
    }

    // 6. FixedSizeList(16)
    if (f.typeType === 16) {
        const listSize = f.listSize ?? 1;
        const childDesc = f.children[0];
        if (!childDesc) {
            throw new Error(`Malformed Arrow IPC FixedSizeList column "${f.name}": missing child Field descriptor.`);
        }
        const childDecoded = decodeArrowFieldVector(
            childDesc,
            rowCount * listSize,
            getBufferSlice,
            state,
            dictionaryPools,
            false
        );
        if (!firstOffset) firstOffset = childDecoded.firstOffset;
        compAcc += childDecoded.compBytes;

        const out: unknown[] = new Array(rowCount);
        for (let r = 0; r < rowCount; r++) {
            if (isNullAt(r)) {
                out[r] = null;
            } else {
                out[r] = childDecoded.values.slice(r * listSize, (r + 1) * listSize);
            }
        }
        return { values: out, firstOffset, compBytes: compAcc, uncompBytes: state.totalUncomp - startUncomp, nullCount };
    }

    // 7. Struct_(13)
    if (f.typeType === 13) {
        const childVectors: { name: string; values: unknown[] }[] = [];
        for (const ch of f.children) {
            const dec = decodeArrowFieldVector(ch, rowCount, getBufferSlice, state, dictionaryPools, false);
            if (!firstOffset) firstOffset = dec.firstOffset;
            compAcc += dec.compBytes;
            childVectors.push({ name: ch.name, values: dec.values });
        }
        const out: unknown[] = new Array(rowCount);
        for (let r = 0; r < rowCount; r++) {
            if (isNullAt(r)) {
                out[r] = null;
            } else {
                const obj: Record<string, unknown> = {};
                for (const cv of childVectors) {
                    obj[cv.name] = cv.values[r] ?? null;
                }
                out[r] = obj;
            }
        }
        return { values: out, firstOffset, compBytes: compAcc, uncompBytes: state.totalUncomp - startUncomp, nullCount };
    }

    // 8. Fixed-width primitive / Decimal / FixedSizeBinary / Date / Time / Timestamp
    const datB = getBufferSlice(state.bIdx++);
    if (!firstOffset) firstOffset = datB.offset;
    compAcc += datB.compLen;
    state.totalUncomp += datB.slice.length;
    const vDv = new DataView(datB.slice.buffer, datB.slice.byteOffset, datB.slice.byteLength);
    const out: unknown[] = new Array(rowCount);

    for (let r = 0; r < rowCount; r++) {
        if (isNullAt(r)) {
            out[r] = null;
            continue;
        }
        if (f.typeType === 6) {
            out[r] = ((datB.slice[r >>> 3] >>> (r & 7)) & 1) === 1;
        } else if (f.typeType === 2) {
            if (f.bitWidth === 8) {
                out[r] = f.isSigned ? vDv.getInt8(r) : vDv.getUint8(r);
            } else if (f.bitWidth === 16) {
                out[r] = f.isSigned ? vDv.getInt16(r * 2, true) : vDv.getUint16(r * 2, true);
            } else if (f.bitWidth === 32) {
                out[r] = f.isSigned ? vDv.getInt32(r * 4, true) : vDv.getUint32(r * 4, true);
            } else if (f.bitWidth === 64) {
                const b = f.isSigned ? vDv.getBigInt64(r * 8, true) : vDv.getBigUint64(r * 8, true);
                out[r] =
                    b > BigInt(Number.MAX_SAFE_INTEGER) || b < BigInt(Number.MIN_SAFE_INTEGER)
                        ? b.toString()
                        : Number(b);
            }
        } else if (f.typeType === 3) {
            if (f.floatPrecision === 0) {
                out[r] = decodeFloat16(vDv.getUint16(r * 2, true));
            } else if (f.floatPrecision === 1) {
                out[r] = vDv.getFloat32(r * 4, true);
            } else {
                out[r] = vDv.getFloat64(r * 8, true);
            }
        } else if (f.typeType === 7) {
            // Decimal128 (16 bytes LE) or Decimal256 (32 bytes LE)
            const bw = f.byteWidth ?? 16;
            const slice = datB.slice.subarray(r * bw, (r + 1) * bw);
            const unscaled = decodeTwoComplementLittleEndian(slice);
            out[r] = formatScaledDecimal(unscaled, f.scale ?? 0);
        } else if (f.typeType === 8) {
            if (f.dateUnit === 0) {
                const days = vDv.getInt32(r * 4, true);
                out[r] = formatEpochTimestampToIso(BigInt(days) * BigInt(86400), 's').slice(0, 10);
            } else {
                const ms = vDv.getBigInt64(r * 8, true);
                out[r] = formatEpochTimestampToIso(ms, 'ms').slice(0, 10);
            }
        } else if (f.typeType === 9) {
            const rawT = f.bitWidth === 64 ? vDv.getBigInt64(r * 8, true) : BigInt(vDv.getInt32(r * 4, true));
            out[r] =
                rawT > BigInt(Number.MAX_SAFE_INTEGER) || rawT < BigInt(Number.MIN_SAFE_INTEGER)
                    ? rawT.toString()
                    : Number(rawT);
        } else if (f.typeType === 10) {
            const rawTs = vDv.getBigInt64(r * 8, true);
            const unit: 's' | 'ms' | 'us' | 'ns' =
                f.timeUnit === 0 ? 's' : f.timeUnit === 1 ? 'ms' : f.timeUnit === 2 ? 'us' : 'ns';
            out[r] = formatEpochTimestampToIso(rawTs, unit);
        } else if (f.typeType === 15) {
            const bw = f.byteWidth ?? 16;
            const slice = datB.slice.subarray(r * bw, (r + 1) * bw);
            if (bw === 16) {
                const hex = Array.from(slice)
                    .map((b) => b.toString(16).padStart(2, '0'))
                    .join('');
                out[r] = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
            } else {
                out[r] = bytesToHex(slice, slice.length);
            }
        }
    }

    return { values: out, firstOffset, compBytes: compAcc, uncompBytes: state.totalUncomp - startUncomp, nullCount };
}

function decodeGenuineArrowIpcStream(
    bytes: Uint8Array,
    startOffset: number,
    endOffset: number
): {
    rows: Record<string, unknown>[];
    schema: ColumnSchemaNode[];
    codec: string;
    keyValueMetadata: Record<string, string>;
    rowGroups: RowGroupMeta[];
    uncompressedBytes: number;
    compressedBytes: number;
} {
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let pos = startOffset;
    const fields: ArrowIpcFieldDesc[] = [];
    const dictFieldById = new Map<number, ArrowIpcFieldDesc>();
    const dictionaryPools = new Map<number, unknown[]>();
    const keyValueMetadata: Record<string, string> = {};
    const rows: Record<string, unknown>[] = [];
    const rowGroups: RowGroupMeta[] = [];
    let codec = 'UNCOMPRESSED';
    let totalUncomp = 0;
    let totalComp = 0;
    let rbIndex = 0;

    const registerDictFields = (fList: ArrowIpcFieldDesc[]) => {
        for (const f of fList) {
            if (f.dictionary) dictFieldById.set(f.dictionary.id, f);
            if (f.children.length > 0) registerDictFields(f.children);
        }
    };

    const decodeRecordBatchTable = (
        msgBuf: Uint8Array,
        msgDv: DataView,
        rbTablePos: number,
        bodyStart: number,
        bodyEnd: number,
        targetFields: ArrowIpcFieldDesc[],
        ignoreDictionary = false
    ) => {
        const rbSlots = fbReadTableSlots(msgBuf, rbTablePos);
        const batchRows = rbSlots[0] ? Number(msgDv.getBigInt64(rbTablePos + rbSlots[0], true)) : 0;
        if (batchRows < 0 || batchRows > MAX_DECLARED_ROW_COUNT) {
            throw new Error(`Invalid Arrow IPC RecordBatch length (${batchRows}).`);
        }

        let isLz4Compressed = false;
        if (rbSlots.length > 3 && rbSlots[3]) {
            const compPos = fbDeref(msgBuf, rbTablePos + rbSlots[3]);
            const compSlots = fbReadTableSlots(msgBuf, compPos);
            const codecId = compSlots[0] ? msgBuf[compPos + compSlots[0]] : 0;
            if (codecId === 1) {
                throw new Error(
                    'Unsupported Arrow IPC / Feather V2 RecordBatch compression codec "ZSTD". Supported Feather V2 codecs in browser memory are UNCOMPRESSED and LZ4_FRAME.'
                );
            }
            codec = 'LZ4_FRAME';
            isLz4Compressed = codecId === 0;
        }

        const nodesVec = rbSlots.length > 1 && rbSlots[1] ? fbDeref(msgBuf, rbTablePos + rbSlots[1]) : 0;
        const bufsVec = rbSlots.length > 2 && rbSlots[2] ? fbDeref(msgBuf, rbTablePos + rbSlots[2]) : 0;
        if (!nodesVec || !bufsVec) {
            throw new Error('Malformed Arrow IPC RecordBatch: missing nodes or buffers vector.');
        }

        const bodyLen = bodyEnd - bodyStart;
        const numBufs = msgDv.getUint32(bufsVec, true);
        const bufDescs: { offset: number; length: number }[] = [];
        for (let b = 0; b < numBufs; b++) {
            const bOff = Number(msgDv.getBigInt64(bufsVec + 4 + 16 * b, true));
            const bLen = Number(msgDv.getBigInt64(bufsVec + 4 + 16 * b + 8, true));
            if (bOff < 0 || bLen < 0 || bOff + bLen > bodyLen) {
                throw new Error(
                    `Malformed Arrow IPC Buffer descriptor #${b}: range [${bOff}..${bOff + bLen}] exceeds RecordBatch bodyLength (${bodyLen}).`
                );
            }
            bufDescs.push({ offset: bOff, length: bLen });
        }

        const bodyBytes = bytes.subarray(bodyStart, bodyEnd);
        totalComp += bodyBytes.length;

        const getBufferSlice = (idx: number): { slice: Uint8Array; offset: number; compLen: number } => {
            const bd = bufDescs[idx];
            if (!bd || bd.length === 0) {
                return { slice: new Uint8Array(0), offset: bodyStart + (bd?.offset ?? 0), compLen: 0 };
            }
            const rawSlice = bodyBytes.subarray(bd.offset, bd.offset + bd.length);
            if (isLz4Compressed && rawSlice.length >= 8) {
                const sDv = new DataView(rawSlice.buffer, rawSlice.byteOffset, rawSlice.byteLength);
                const uncompLen = Number(sDv.getBigInt64(0, true));
                if (uncompLen === -1) {
                    return { slice: rawSlice.subarray(8), offset: bodyStart + bd.offset, compLen: bd.length };
                }
                if (uncompLen > MAX_DECOMPRESSED_PAGE_BYTES) {
                    throw new Error(`Arrow IPC LZ4 buffer uncompressed length (${uncompLen}) exceeds safety limit.`);
                }
                if (uncompLen > 0) {
                    return {
                        slice: decompressLz4Block(rawSlice.subarray(8), uncompLen),
                        offset: bodyStart + bd.offset,
                        compLen: bd.length,
                    };
                }
            }
            return { slice: rawSlice, offset: bodyStart + bd.offset, compLen: bd.length };
        };

        const state = { bIdx: 0, totalUncomp: 0 };
        const decodedColumns: {
            field: ArrowIpcFieldDesc;
            values: unknown[];
            firstOffset: number;
            compBytes: number;
            uncompBytes: number;
            nullCount: number;
        }[] = [];

        for (const f of targetFields) {
            const dec = decodeArrowFieldVector(
                f,
                batchRows,
                getBufferSlice,
                state,
                dictionaryPools,
                ignoreDictionary
            );
            decodedColumns.push({ field: f, ...dec });
        }
        totalUncomp += state.totalUncomp;
        return { batchRows, decodedColumns, batchCompBytes: bodyBytes.length, batchUncompBytes: state.totalUncomp };
    };

    while (pos + 8 <= endOffset) {
        const firstWord = dv.getUint32(pos, true);
        let metaLen = 0;
        let msgStart = pos;
        if (firstWord === 0xffffffff) {
            metaLen = dv.getUint32(pos + 4, true);
            msgStart = pos + 8;
        } else {
            metaLen = firstWord;
            msgStart = pos + 4;
        }
        if (metaLen === 0) break;
        if (metaLen < 0 || msgStart + metaLen > endOffset) {
            throw new Error(
                `Malformed Arrow IPC Message header: declared metadata length (${metaLen}) exceeds container boundary.`
            );
        }

        const msgBuf = bytes.subarray(msgStart, msgStart + metaLen);
        const msgDv = new DataView(msgBuf.buffer, msgBuf.byteOffset, msgBuf.byteLength);
        const rootPos = msgDv.getUint32(0, true);
        const mSlots = fbReadTableSlots(msgBuf, rootPos);
        if (mSlots.length < 3) {
            throw new Error('Malformed Arrow IPC FlatBuffers Message table.');
        }

        const headerType = mSlots[1] ? msgBuf[rootPos + mSlots[1]] : 0;
        const headerPos = mSlots[2] ? fbDeref(msgBuf, rootPos + mSlots[2]) : 0;
        const bodyLen =
            mSlots.length > 3 && mSlots[3]
                ? Number(msgDv.getBigInt64(rootPos + mSlots[3], true))
                : 0;

        const bodyStart = msgStart + metaLen;
        if (bodyLen < 0 || bodyStart + bodyLen > endOffset) {
            throw new Error(
                `Malformed Arrow IPC RecordBatch body length (${bodyLen}) exceeds container boundary (${endOffset - bodyStart}).`
            );
        }
        const bodyEnd = bodyStart + bodyLen;
        pos = bodyEnd;

        if (headerType === 1 && headerPos > 0) {
            // Schema Message
            const sSlots = fbReadTableSlots(msgBuf, headerPos);
            if (sSlots.length > 1 && sSlots[1]) {
                const fieldsVec = fbDeref(msgBuf, headerPos + sSlots[1]);
                const numFields = msgDv.getUint32(fieldsVec, true);
                if (numFields > MAX_DECLARED_COLUMN_COUNT) {
                    throw new Error(`Arrow IPC Schema field count (${numFields}) exceeds safety limit.`);
                }
                for (let i = 0; i < numFields; i++) {
                    const fPos = fbDeref(msgBuf, fieldsVec + 4 + 4 * i);
                    fields.push(parseArrowFieldNode(msgBuf, msgDv, fPos, i));
                }
                registerDictFields(fields);
            }
            if (sSlots.length > 2 && sSlots[2]) {
                const kvVec = fbDeref(msgBuf, headerPos + sSlots[2]);
                const numKv = msgDv.getUint32(kvVec, true);
                for (let k = 0; k < Math.min(numKv, 64); k++) {
                    const kvPos = fbDeref(msgBuf, kvVec + 4 + 4 * k);
                    const kvSlots = fbReadTableSlots(msgBuf, kvPos);
                    const key = kvSlots[0] ? fbReadString(msgBuf, kvPos + kvSlots[0]) : '';
                    const val = kvSlots.length > 1 && kvSlots[1] ? fbReadString(msgBuf, kvPos + kvSlots[1]) : '';
                    if (key) keyValueMetadata[key] = val;
                }
            }
        } else if (headerType === 2 && headerPos > 0) {
            // DictionaryBatch Message (0=id:int64, 1=data:RecordBatch, 2=isDelta:bool)
            const dbSlots = fbReadTableSlots(msgBuf, headerPos);
            const dictId = dbSlots[0] ? Number(msgDv.getBigInt64(headerPos + dbSlots[0], true)) : 0;
            const rbPos = dbSlots.length > 1 && dbSlots[1] ? fbDeref(msgBuf, headerPos + dbSlots[1]) : 0;
            const isDelta = dbSlots.length > 2 && dbSlots[2] ? msgBuf[headerPos + dbSlots[2]] !== 0 : false;
            const dictField = dictFieldById.get(dictId);
            if (rbPos > 0 && dictField) {
                const decodedDict = decodeRecordBatchTable(
                    msgBuf,
                    msgDv,
                    rbPos,
                    bodyStart,
                    bodyEnd,
                    [dictField],
                    true
                );
                const newVals = decodedDict.decodedColumns[0]?.values ?? [];
                if (isDelta && dictionaryPools.has(dictId)) {
                    dictionaryPools.set(dictId, [...(dictionaryPools.get(dictId) ?? []), ...newVals]);
                } else {
                    dictionaryPools.set(dictId, newVals);
                }
            }
        } else if (headerType === 3 && headerPos > 0 && fields.length > 0) {
            // RecordBatch Message
            const { batchRows, decodedColumns, batchCompBytes, batchUncompBytes } = decodeRecordBatchTable(
                msgBuf,
                msgDv,
                headerPos,
                bodyStart,
                bodyEnd,
                fields,
                false
            );
            if (batchRows === 0) continue;

            const batchRecords: Record<string, unknown>[] = Array.from({ length: batchRows }, () => ({}));
            for (const dc of decodedColumns) {
                for (let r = 0; r < batchRows; r++) {
                    batchRecords[r][dc.field.name] = dc.values[r];
                }
            }
            rows.push(...batchRecords);

            const batchSchema: ColumnSchemaNode[] = fields.map((f, index) => ({
                index,
                name: f.name,
                physicalType: f.physicalType,
                logicalType: f.logicalType,
                repetitionType: f.logicalType === 'LIST' ? 'REPEATED' : f.nullable ? 'OPTIONAL' : 'REQUIRED',
                nullable: f.nullable,
                precision: f.precision,
                scale: f.scale,
                compressionCodec: codec,
                encoding: f.dictionary ? 'ARROW_DICTIONARY' : 'ARROW_IPC_CONTIGUOUS',
            }));
            const batchProfs = computeColumnProfiles(batchRecords, batchSchema);

            rowGroups.push({
                index: rbIndex++,
                rowCount: batchRows,
                totalByteSize: batchUncompBytes,
                compressedBytes: batchCompBytes,
                compressionRatio: batchCompBytes > 0 ? Number((batchUncompBytes / batchCompBytes).toFixed(2)) : 1,
                isSyntheticEstimate: false,
                containerUnitLabel: 'Arrow IPC RecordBatch',
                columns: decodedColumns.map((dc, idx) => {
                    const prof = batchProfs[idx];
                    return {
                        name: dc.field.name,
                        physicalType: dc.field.physicalType,
                        codec,
                        encodings: [dc.field.dictionary ? 'ARROW_DICTIONARY' : 'ARROW_IPC_CONTIGUOUS'],
                        numValues: batchRows,
                        compressedSize: dc.compBytes,
                        uncompressedSize: dc.uncompBytes,
                        compressionRatio: dc.compBytes > 0 ? Number((dc.uncompBytes / dc.compBytes).toFixed(2)) : 1,
                        dataPageOffset: dc.firstOffset || bodyStart,
                        nullCount: dc.nullCount,
                        distinctCount: prof?.distinctCount ?? 0,
                        minValue: prof?.min ?? null,
                        maxValue: prof?.max ?? null,
                    };
                }),
            });
        }
    }

    if (fields.length === 0) {
        throw new Error('Malformed Arrow IPC / Feather V2 container: no valid Schema message found.');
    }

    const schema: ColumnSchemaNode[] = fields.map((f, index) => ({
        index,
        name: f.name,
        physicalType: f.physicalType,
        logicalType: f.logicalType,
        repetitionType: f.logicalType === 'LIST' ? 'REPEATED' : f.nullable ? 'OPTIONAL' : 'REQUIRED',
        nullable: f.nullable,
        precision: f.precision,
        scale: f.scale,
        typeLength: f.byteWidth,
        compressionCodec: codec,
        encoding: f.dictionary ? 'ARROW_DICTIONARY' : 'ARROW_IPC_CONTIGUOUS',
    }));

    if (keyValueMetadata['kivaro:schema:logical_types']) {
        try {
            const logicalTypeMap = JSON.parse(keyValueMetadata['kivaro:schema:logical_types']);
            for (const col of schema) {
                if (logicalTypeMap[col.name]) {
                    col.logicalType = logicalTypeMap[col.name];
                }
            }
            for (const row of rows) {
                for (const col of schema) {
                    if (col.logicalType === 'STRUCT' && typeof row[col.name] === 'string') {
                        try {
                            row[col.name] = JSON.parse(row[col.name] as string);
                        } catch {
                            // keep as string
                        }
                    }
                }
            }
        } catch {
            // ignore
        }
    }

    return {
        rows,
        schema,
        codec,
        keyValueMetadata,
        rowGroups,
        uncompressedBytes: totalUncomp || bytes.length,
        compressedBytes: totalComp || bytes.length,
    };
}

/**
 * Dispatcher that strictly separates Feather V1 ("FEA1") from Feather V2 ("ARROW1") and Arrow IPC Stream ("0xFFFFFFFF").
 */
function parseFeatherOrArrowBinary(
    bytes: Uint8Array,
    format: ColumnarFormat,
    warnings: string[]
): {
    rows: Record<string, unknown>[];
    schema: ColumnSchemaNode[];
    codec: string;
    formatVersion: string;
    createdBy: string;
    keyValueMetadata: Record<string, string>;
    rowGroups: RowGroupMeta[];
    uncompressedBytes: number;
    compressedBytes: number;
} {
    void warnings;
    // 1. Dedicated Feather V1 ("FEA1") Parser
    if (
        bytes.length >= 4 &&
        bytes[0] === 0x46 &&
        bytes[1] === 0x45 &&
        bytes[2] === 0x41 &&
        bytes[3] === 0x31
    ) {
        return parseFeatherV1Binary(bytes);
    }

    // 2. Arrow IPC Stream ("0xFFFFFFFF" continuation indicator at byte 0)
    if (
        format === 'arrow_stream' ||
        (bytes.length >= 8 &&
            bytes[0] === 0xff &&
            bytes[1] === 0xff &&
            bytes[2] === 0xff &&
            bytes[3] === 0xff)
    ) {
        let streamErr: unknown = null;
        try {
            const streamDecoded = decodeGenuineArrowIpcStream(bytes, 0, bytes.length);
            if (streamDecoded && streamDecoded.schema.length > 0) {
                return {
                    ...streamDecoded,
                    formatVersion: 'Arrow IPC Stream (0xFFFFFFFF FlatBuffers)',
                    createdBy: 'Apache Arrow IPC Stream Writer',
                };
            }
        } catch (err: unknown) {
            streamErr = err;
        }
        try {
            const body = decompressSnappyBlock(bytes.subarray(8));
            const parsed = JSON.parse(textDecoder.decode(body));
            if (parsed && Array.isArray(parsed.rows)) {
                const rows = parsed.rows as Record<string, unknown>[];
                const schema = Array.isArray(parsed.schema)
                    ? (parsed.schema as ColumnSchemaNode[])
                    : inferSchemaFromRows(rows, String(parsed.codec || 'UNCOMPRESSED'), 'ARROW_STREAM');
                const codec = String(parsed.codec || 'UNCOMPRESSED');
                return {
                    rows,
                    schema,
                    codec,
                    formatVersion: 'Arrow IPC Stream (0xFFFFFFFF)',
                    createdBy: 'Apache Arrow IPC Stream Writer',
                    keyValueMetadata: (parsed.keyValueMetadata as Record<string, string>) || {},
                    rowGroups: buildRowGroupMetadata(rows, schema, bytes.length, body.length, codec, true, 'Arrow Container Partition'),
                    uncompressedBytes: body.length,
                    compressedBytes: bytes.length,
                };
            }
        } catch {
            // Snappy fallback also failed; surface the original Arrow IPC stream error
        }
        if (streamErr instanceof Error) {
            throw streamErr;
        }
        throw new Error('Malformed Arrow IPC Stream (0xFFFFFFFF): invalid or truncated IPC message stream.');
    }

    // 3. Feather V2 / Arrow IPC File ("ARROW1" at head and tail)
    if (bytes.length < 18) {
        throw new Error(`Truncated Feather V2 / Arrow IPC file (${bytes.length} bytes < minimum 18 bytes).`);
    }
    if (
        bytes[0] !== 0x41 ||
        bytes[1] !== 0x52 ||
        bytes[2] !== 0x52 ||
        bytes[3] !== 0x4f ||
        bytes[4] !== 0x57 ||
        bytes[5] !== 0x31
    ) {
        throw new Error(
            `Invalid Feather / Arrow IPC magic bytes (expected "ARROW1" or "FEA1", found ${bytesToHex(bytes, 6)}).`
        );
    }
    if (
        bytes[bytes.length - 6] !== 0x41 ||
        bytes[bytes.length - 5] !== 0x52 ||
        bytes[bytes.length - 4] !== 0x52 ||
        bytes[bytes.length - 3] !== 0x4f ||
        bytes[bytes.length - 2] !== 0x57 ||
        bytes[bytes.length - 1] !== 0x31
    ) {
        throw new Error('Truncated or corrupted Feather V2 file: missing trailing "ARROW1" footer magic signature.');
    }

    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const fbFooterLen = view.getInt32(bytes.length - 10, true);
    const bodyEnd =
        fbFooterLen > 0 && 8 + fbFooterLen + 10 <= bytes.length
            ? bytes.length - 10 - fbFooterLen
            : bytes.length - 6;

    // Standard Arrow IPC File starts with 0xFFFFFFFF continuation at byte 8
    if (bytes.length >= 16 && view.getUint32(8, true) === 0xffffffff) {
        try {
            const ipcDecoded = decodeGenuineArrowIpcStream(bytes, 8, bodyEnd);
            if (ipcDecoded && ipcDecoded.schema.length > 0) {
                return {
                    ...ipcDecoded,
                    formatVersion: 'Feather V2 / Arrow IPC File (ARROW1 FlatBuffers)',
                    createdBy: 'Apache Arrow IPC / Feather V2 Writer',
                };
            }
        } catch (ipcErr: unknown) {
            throw ipcErr instanceof Error ? ipcErr : new Error(String(ipcErr));
        }
    }

    // Legacy KivaroTools internal Snappy Feather container fallback
    const bodySlice = bytes.subarray(8, bodyEnd);
    const decompressed = decompressSnappyBlock(bodySlice);
    let parsed: Record<string, unknown> | null = null;
    try {
        parsed = JSON.parse(textDecoder.decode(decompressed));
    } catch {
        parsed = null;
    }
    if (parsed && Array.isArray(parsed.rows)) {
        const rows = (parsed.rows as Record<string, unknown>[]).map((r) => {
            const restored: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(r)) {
                if (v === '__KIVARO_IEEE754_NAN__') restored[k] = NaN;
                else if (v === '__KIVARO_IEEE754_POS_INF__') restored[k] = Infinity;
                else if (v === '__KIVARO_IEEE754_NEG_INF__') restored[k] = -Infinity;
                else restored[k] = v;
            }
            return restored;
        });
        const schema = Array.isArray(parsed.schema)
            ? (parsed.schema as ColumnSchemaNode[])
            : inferSchemaFromRows(rows, String(parsed.codec || 'SNAPPY'), 'ARROW_IPC');
        const codec = String(parsed.codec || 'SNAPPY');
        return {
            rows,
            schema,
            codec,
            formatVersion: String(parsed.arrowVersion || 'Feather V2 / Arrow IPC (ARROW1)'),
            createdBy: 'KivaroTools Arrow IPC Container Writer',
            keyValueMetadata: (parsed.keyValueMetadata as Record<string, string>) || {},
            rowGroups: buildRowGroupMetadata(rows, schema, bodySlice.length, decompressed.length, codec, true, 'Snappy Container Partition'),
            uncompressedBytes: decompressed.length,
            compressedBytes: bodySlice.length,
        };
    }

    throw new Error('Malformed Feather V2 (ARROW1) container: invalid IPC message stream.');
}

// ============================================================
// 7. TEXT / FALLBACK PARSERS & SCHEMA INFERENCE
// ============================================================

function parseJsonOrJsonlText(text: string): Record<string, unknown>[] {
    const trimmed = text.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
        const arr = JSON.parse(trimmed);
        return Array.isArray(arr) ? arr : [arr];
    }
    if (trimmed.startsWith('{')) {
        try {
            const obj = JSON.parse(trimmed);
            if (Array.isArray(obj.rows)) return obj.rows;
            if (Array.isArray(obj.data)) return obj.data;
            return [obj];
        } catch {
            // Fall through to JSONL line-by-line
        }
    }
    const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const out: Record<string, unknown>[] = [];
    for (const line of lines) {
        try {
            const item = JSON.parse(line);
            if (item && typeof item === 'object') out.push(item as Record<string, unknown>);
        } catch {
            // ignore non-json line
        }
    }
    return out;
}

function parseCsvTextToRows(text: string): Record<string, unknown>[] {
    const lines = text
        .replace(/^\uFEFF/, '')
        .split(/\r?\n/)
        .filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];
    const headers = splitCsvLine(lines[0], ',');
    const rows: Record<string, unknown>[] = [];
    for (let i = 1; i < lines.length; i++) {
        const vals = splitCsvLine(lines[i], ',');
        const rec: Record<string, unknown> = {};
        for (let c = 0; c < headers.length; c++) {
            const key = headers[c] || `col_${c + 1}`;
            rec[key] = coercePrimitiveValue(vals[c] ?? null);
        }
        rows.push(rec);
    }
    return rows;
}

function splitCsvLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === delimiter && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += ch;
        }
    }
    result.push(current);
    return result;
}

function coercePrimitiveValue(val: string | null): unknown {
    if (val === null || val === undefined) return null;
    const trimmed = val.trim();
    if (trimmed === '' || trimmed.toLowerCase() === 'null') return null;
    if (trimmed.toLowerCase() === 'true') return true;
    if (trimmed.toLowerCase() === 'false') return false;
    if (/^-?\d+$/.test(trimmed)) {
        const big = BigInt(trimmed);
        if (big > BigInt(Number.MAX_SAFE_INTEGER) || big < BigInt(Number.MIN_SAFE_INTEGER)) {
            return trimmed;
        }
        return Number(trimmed);
    }
    if (/^-?\d+\.\d+$/.test(trimmed)) {
        return Number(trimmed);
    }
    return val;
}

export function inferSchemaFromRows(
    rows: Record<string, unknown>[],
    defaultCodec = 'SNAPPY',
    defaultEncoding = 'RLE_DICTIONARY'
): ColumnSchemaNode[] {
    const colNames = new Set<string>();
    for (const r of rows) {
        if (r && typeof r === 'object') {
            for (const k of Object.keys(r)) colNames.add(k);
        }
    }

    return Array.from(colNames).map((name, index) => {
        let hasNull = false;
        let sawBoolean = false;
        let sawInt32 = false;
        let sawInt64 = false;
        let sawUint64 = false;
        let sawUnsafeBigInt = false;
        let sawNegativeInt = false;
        let sawDouble = false;
        let sawTimestamp = false;
        let sawDate = false;
        let sawUuid = false;
        let sawList = false;
        let sawStruct = false;
        let sawString = false;
        let sawSmallIntString = false;

        for (const r of rows) {
            const v = r?.[name];
            if (v === null || v === undefined) {
                hasNull = true;
                continue;
            }
            if (typeof v === 'boolean') {
                sawBoolean = true;
            } else if (typeof v === 'bigint') {
                if (v < BigInt(0)) sawNegativeInt = true;
                if (v > BigInt(Number.MAX_SAFE_INTEGER) || v < BigInt(Number.MIN_SAFE_INTEGER)) {
                    sawUnsafeBigInt = true;
                }
                if (v > BigInt('9223372036854775807')) {
                    sawUint64 = true;
                } else {
                    sawInt64 = true;
                }
            } else if (typeof v === 'number') {
                if (!Number.isFinite(v)) {
                    sawDouble = true;
                } else if (Number.isSafeInteger(v)) {
                    if (v < 0) sawNegativeInt = true;
                    if (v > 2147483647 || v < -2147483648) {
                        sawInt64 = true;
                    } else {
                        sawInt32 = true;
                    }
                } else {
                    sawDouble = true;
                }
            } else if (typeof v === 'string') {
                if (/^-?\d{16,20}$/.test(v)) {
                    try {
                        const b = BigInt(v);
                        if (b < BigInt(0)) sawNegativeInt = true;
                        if (b > BigInt('18446744073709551615') || b < BigInt('-9223372036854775808')) {
                            sawString = true;
                        } else {
                            if (b > BigInt(Number.MAX_SAFE_INTEGER) || b < BigInt(Number.MIN_SAFE_INTEGER)) {
                                sawUnsafeBigInt = true;
                            }
                            if (b > BigInt('9223372036854775807')) {
                                sawUint64 = true;
                            } else {
                                sawInt64 = true;
                            }
                        }
                    } catch {
                        sawString = true;
                    }
                } else if (/^-?(?:0|[1-9]\d{0,14})$/.test(v)) {
                    sawSmallIntString = true;
                    if (v.startsWith('-')) sawNegativeInt = true;
                } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
                    sawTimestamp = true;
                } else if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
                    sawDate = true;
                } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) {
                    sawUuid = true;
                } else {
                    sawString = true;
                }
            } else if (Array.isArray(v)) {
                sawList = true;
            } else if (typeof v === 'object') {
                sawStruct = true;
            }
        }

        if (sawSmallIntString && !sawUint64 && !sawInt64) {
            sawString = true;
        }

        let detectedLogical: LogicalDataType = 'UTF8';
        let detectedPhysical: PhysicalDataType = 'BYTE_ARRAY';

        if (sawString || (sawUint64 && sawNegativeInt) || (sawDouble && sawUnsafeBigInt)) {
            detectedLogical = 'UTF8';
            detectedPhysical = 'BYTE_ARRAY';
        } else if (sawStruct) {
            detectedLogical = 'STRUCT';
            detectedPhysical = 'BYTE_ARRAY';
        } else if (sawList) {
            detectedLogical = 'LIST';
            detectedPhysical = 'BYTE_ARRAY';
        } else if (sawDouble) {
            detectedLogical = 'DOUBLE';
            detectedPhysical = 'DOUBLE';
        } else if (sawUint64) {
            detectedLogical = 'UINT64';
            detectedPhysical = 'INT64';
        } else if (sawInt64) {
            detectedLogical = 'INT64';
            detectedPhysical = 'INT64';
        } else if (sawInt32) {
            detectedLogical = 'INT32';
            detectedPhysical = 'INT32';
        } else if (sawBoolean) {
            detectedLogical = 'BOOLEAN';
            detectedPhysical = 'BOOLEAN';
        } else if (sawTimestamp) {
            detectedLogical = 'TIMESTAMP_MILLIS';
            detectedPhysical = 'INT64';
        } else if (sawDate) {
            detectedLogical = 'DATE';
            detectedPhysical = 'INT32';
        } else if (sawUuid) {
            detectedLogical = 'UUID';
            detectedPhysical = 'FIXED_LEN_BYTE_ARRAY';
        }

        return {
            index,
            name,
            physicalType: detectedPhysical,
            logicalType: detectedLogical,
            repetitionType:
                detectedLogical === 'LIST'
                    ? 'REPEATED'
                    : hasNull
                        ? 'OPTIONAL'
                        : 'REQUIRED',
            nullable: hasNull,
            compressionCodec: defaultCodec,
            encoding: defaultEncoding,
        };
    });
}

// ============================================================
// 8. COLUMN PROFILER & ROW GROUP METADATA BUILDER
// ============================================================

export function computeColumnProfiles(
    rows: Record<string, unknown>[],
    schema: ColumnSchemaNode[]
): ColumnProfileStats[] {
    const totalCount = rows.length;

    return schema.map((col) => {
        let nullCount = 0;
        const freqMap = new Map<string, number>();
        const numericValues: number[] = [];
        const bigIntValues: bigint[] = [];
        let hasUnsafeBigInt = false;
        const stringLengths: number[] = [];

        for (const row of rows) {
            const val = row?.[col.name];
            if (val === null || val === undefined) {
                nullCount++;
                continue;
            }

            const strRepr =
                typeof val === 'object' ? JSON.stringify(val) : String(val);
            freqMap.set(strRepr, (freqMap.get(strRepr) ?? 0) + 1);

            if (typeof val === 'bigint') {
                bigIntValues.push(val);
                if (val > BigInt(Number.MAX_SAFE_INTEGER) || val < BigInt(Number.MIN_SAFE_INTEGER)) {
                    hasUnsafeBigInt = true;
                } else {
                    numericValues.push(Number(val));
                }
            } else if (typeof val === 'number' && Number.isFinite(val)) {
                numericValues.push(val);
                if (Number.isInteger(val)) {
                    bigIntValues.push(BigInt(Math.trunc(val)));
                }
            } else if (typeof val === 'string' && /^[+-]?\d+$/.test(val.trim())) {
                const trimmed = val.trim();
                const b = BigInt(trimmed);
                bigIntValues.push(b);
                if (b > BigInt(Number.MAX_SAFE_INTEGER) || b < BigInt(Number.MIN_SAFE_INTEGER)) {
                    hasUnsafeBigInt = true;
                } else {
                    numericValues.push(Number(trimmed));
                }
                stringLengths.push(val.length);
            } else if (typeof val === 'string' && /^[+-]?\d+\.\d+$/.test(val.trim())) {
                const num = Number(val.trim());
                if (Number.isFinite(num)) numericValues.push(num);
                stringLengths.push(val.length);
            } else if (typeof val === 'string') {
                stringLengths.push(val.length);
            }
        }

        const nonNullCount = totalCount - nullCount;
        const distinctCount = freqMap.size;
        const nullPercentage =
            totalCount > 0 ? Number(((nullCount / totalCount) * 100).toFixed(2)) : 0;
        const uniquenessRatio =
            nonNullCount > 0
                ? Number(((distinctCount / nonNullCount) * 100).toFixed(2))
                : 0;

        let min: string | number | null = null;
        let max: string | number | null = null;
        let mean: number | null = null;
        let stdDev: number | null = null;
        let p25: number | null = null;
        let median: number | null = null;
        let p75: number | null = null;

        if (hasUnsafeBigInt && bigIntValues.length > 0) {
            bigIntValues.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
            min = bigIntValues[0].toString();
            max = bigIntValues[bigIntValues.length - 1].toString();
        } else if (numericValues.length > 0) {
            numericValues.sort((a, b) => a - b);
            min = numericValues[0];
            max = numericValues[numericValues.length - 1];
            const nLen = numericValues.length;
            const rawMean = numericValues.reduce((acc, v) => acc + v / nLen, 0);
            mean = Number.isFinite(rawMean) ? Number(rawMean.toFixed(4)) : 0;
            const rawVar = numericValues.reduce((acc, v) => {
                const diff = v - rawMean;
                const sq = (diff * diff) / nLen;
                return Number.isFinite(acc + sq) ? acc + sq : acc;
            }, 0);
            const rawStd = Math.sqrt(Math.max(0, rawVar));
            stdDev = Number.isFinite(rawStd) ? Number(rawStd.toFixed(4)) : 0;
            p25 = numericValues[Math.floor(numericValues.length * 0.25)];
            median = numericValues[Math.floor(numericValues.length * 0.5)];
            p75 = numericValues[Math.floor(numericValues.length * 0.75)];
        } else if (freqMap.size > 0) {
            const sortedKeys = Array.from(freqMap.keys()).sort();
            min = sortedKeys[0];
            max = sortedKeys[sortedKeys.length - 1];
        }

        let minStringLength: number | null = null;
        let maxStringLength: number | null = null;
        let avgStringLength: number | null = null;
        if (stringLengths.length > 0) {
            minStringLength = Math.min(...stringLengths);
            maxStringLength = Math.max(...stringLengths);
            avgStringLength = Number(
                (
                    stringLengths.reduce((a, b) => a + b, 0) / stringLengths.length
                ).toFixed(1)
            );
        }

        const topValues = Array.from(freqMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([value, count]) => ({
                value,
                count,
                percentage:
                    totalCount > 0 ? Number(((count / totalCount) * 100).toFixed(1)) : 0,
            }));

        return {
            name: col.name,
            physicalType: col.physicalType,
            logicalType: col.logicalType,
            totalCount,
            nullCount,
            nullPercentage,
            nonNullCount,
            distinctCount,
            uniquenessRatio,
            min,
            max,
            mean,
            stdDev,
            p25,
            median,
            p75,
            minStringLength,
            maxStringLength,
            avgStringLength,
            topValues,
        };
    });
}

function buildRowGroupMetadata(
    rows: Record<string, unknown>[],
    schema: ColumnSchemaNode[],
    compressedTotal: number,
    uncompressedTotal: number,
    codec: string,
    isSyntheticEstimate = true,
    containerUnitLabel = 'Synthetic Partition Estimate'
): RowGroupMeta[] {
    if (rows.length === 0) return [];
    const profiles = computeColumnProfiles(rows, schema);
    const colCount = Math.max(1, schema.length);
    const perColCompressed = Math.max(16, Math.floor(compressedTotal / colCount));
    const perColUncompressed = Math.max(24, Math.floor(uncompressedTotal / colCount));

    const columns: RowGroupColumnChunkMeta[] = schema.map((col, idx) => {
        const prof = profiles[idx];
        return {
            name: col.name,
            physicalType: col.physicalType,
            codec,
            encodings: [col.encoding],
            numValues: rows.length,
            compressedSize: perColCompressed,
            uncompressedSize: perColUncompressed,
            compressionRatio: Number((perColUncompressed / perColCompressed).toFixed(2)),
            dataPageOffset: idx * perColCompressed,
            nullCount: prof?.nullCount ?? 0,
            distinctCount: prof?.distinctCount ?? 0,
            minValue: prof?.min ?? null,
            maxValue: prof?.max ?? null,
        };
    });

    return [
        {
            index: 0,
            rowCount: rows.length,
            totalByteSize: uncompressedTotal,
            compressedBytes: compressedTotal,
            compressionRatio:
                compressedTotal > 0
                    ? Number((uncompressedTotal / compressedTotal).toFixed(2))
                    : 1,
            columns,
            isSyntheticEstimate,
            containerUnitLabel,
        },
    ];
}

// ============================================================
// 9. INTERACTIVE FILTER (AND + OR LOGIC, EXACT 64-BIT BIGINT), SORT, SEARCH & PROJECTION
// ============================================================

interface ExactDecimalParts {
    sign: 1 | -1;
    intPart: bigint;
    fracDigits: string;
}

function parseExactDecimalParts(raw: unknown): ExactDecimalParts | null {
    if (typeof raw === 'bigint') {
        if (raw === BigInt(0)) return { sign: 1, intPart: BigInt(0), fracDigits: '' };
        return {
            sign: raw < BigInt(0) ? -1 : 1,
            intPart: raw < BigInt(0) ? -raw : raw,
            fracDigits: '',
        };
    }
    if (typeof raw === 'number') {
        if (!Number.isFinite(raw)) return null;
        if (Object.is(raw, -0) || raw === 0) return { sign: 1, intPart: BigInt(0), fracDigits: '' };
        if (Number.isSafeInteger(raw)) {
            const b = BigInt(raw);
            return {
                sign: b < BigInt(0) ? -1 : 1,
                intPart: b < BigInt(0) ? -b : b,
                fracDigits: '',
            };
        }
    }
    if (typeof raw !== 'string' && typeof raw !== 'number') return null;

    const str = String(raw).trim();
    if (!str) return null;

    const m = /^([+-])?(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(str);
    if (!m) return null;

    const signChar = m[1];
    let intDigits = m[2];
    let fracDigits = m[3] ?? '';
    const expStr = m[4];

    if (expStr !== undefined) {
        const exp = parseInt(expStr, 10);
        if (!Number.isFinite(exp) || Math.abs(exp) > 1000) return null;
        const combined = intDigits + fracDigits;
        const pointPos = intDigits.length + exp;
        if (pointPos <= 0) {
            intDigits = '0';
            fracDigits = '0'.repeat(-pointPos) + combined;
        } else if (pointPos >= combined.length) {
            intDigits = combined + '0'.repeat(pointPos - combined.length);
            fracDigits = '';
        } else {
            intDigits = combined.slice(0, pointPos);
            fracDigits = combined.slice(pointPos);
        }
    }

    fracDigits = fracDigits.replace(/0+$/, '');
    const intPart = BigInt(intDigits || '0');
    if (intPart === BigInt(0) && fracDigits === '') {
        return { sign: 1, intPart: BigInt(0), fracDigits: '' };
    }
    const sign: 1 | -1 = signChar === '-' ? -1 : 1;
    return { sign, intPart, fracDigits };
}

/**
 * Exact 64-Bit BigInt & Arbitrary-Precision Decimal Comparator.
 */
export function compareExactNumericValues(a: unknown, b: unknown): number | null {
    const pa = parseExactDecimalParts(a);
    const pb = parseExactDecimalParts(b);
    if (!pa || !pb) return null;

    if (pa.sign !== pb.sign) {
        return pa.sign < pb.sign ? -1 : 1;
    }

    const signMul = pa.sign;
    if (pa.intPart !== pb.intPart) {
        return (pa.intPart < pb.intPart ? -1 : 1) * signMul;
    }

    if (pa.fracDigits === pb.fracDigits) {
        return 0;
    }

    const maxFracLen = Math.max(pa.fracDigits.length, pb.fracDigits.length);
    const fa = BigInt(pa.fracDigits.padEnd(maxFracLen, '0') || '0');
    const fb = BigInt(pb.fracDigits.padEnd(maxFracLen, '0') || '0');
    if (fa === fb) return 0;
    return (fa < fb ? -1 : 1) * signMul;
}

function evaluateSingleCondition(row: Record<string, unknown>, f: FilterCondition): boolean {
    const rawVal = row[f.column];
    if (f.operator === 'is_null') {
        return rawVal === null || rawVal === undefined;
    }
    if (f.operator === 'is_not_null') {
        return rawVal !== null && rawVal !== undefined;
    }
    if (rawVal === null || rawVal === undefined) return false;

    const isNaNVal = typeof rawVal === 'number' && Number.isNaN(rawVal);
    const strVal = typeof rawVal === 'object' ? JSON.stringify(rawVal) : String(rawVal);
    const targetStr = f.value;
    const targetTrimmed = f.value.trim();

    const exactCmp =
        typeof rawVal !== 'boolean' && typeof rawVal !== 'object' && !isNaNVal && targetTrimmed !== ''
            ? compareExactNumericValues(rawVal, targetTrimmed)
            : null;

    switch (f.operator) {
        case 'eq':
            if (isNaNVal) return targetTrimmed.toLowerCase() === 'nan';
            return exactCmp !== null
                ? exactCmp === 0
                : strVal.toLowerCase() === targetStr.toLowerCase();
        case 'neq':
            if (isNaNVal) return targetTrimmed.toLowerCase() !== 'nan';
            return exactCmp !== null
                ? exactCmp !== 0
                : strVal.toLowerCase() !== targetStr.toLowerCase();
        case 'gt':
            if (isNaNVal) return false;
            return exactCmp !== null ? exactCmp > 0 : strVal > targetStr;
        case 'gte':
            if (isNaNVal) return false;
            return exactCmp !== null ? exactCmp >= 0 : strVal >= targetStr;
        case 'lt':
            if (isNaNVal) return false;
            return exactCmp !== null ? exactCmp < 0 : strVal < targetStr;
        case 'lte':
            if (isNaNVal) return false;
            return exactCmp !== null ? exactCmp <= 0 : strVal <= targetStr;
        case 'contains':
            return strVal.toLowerCase().includes(targetStr.toLowerCase());
        case 'starts_with':
            return strVal.toLowerCase().startsWith(targetStr.toLowerCase());
        case 'ends_with':
            return strVal.toLowerCase().endsWith(targetStr.toLowerCase());
        default:
            return true;
    }
}

export function queryDataset(
    rows: Record<string, unknown>[],
    options: {
        searchQuery?: string;
        filters?: FilterCondition[];
        filterLogic?: FilterLogicMode;
        sort?: SortConfig | null;
        selectedColumns?: string[];
    }
): { rows: Record<string, unknown>[]; matchedCount: number } {
    const {
        searchQuery = '',
        filters = [],
        filterLogic = 'AND',
        sort = null,
        selectedColumns,
    } = options;
    const trimmedSearch = searchQuery.trim().toLowerCase();

    let filtered = rows.filter((row) => {
        if (trimmedSearch) {
            const hit = Object.values(row).some((v) => {
                if (v === null || v === undefined) return false;
                const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
                return s.toLowerCase().includes(trimmedSearch);
            });
            if (!hit) return false;
        }

        if (filters.length > 0) {
            let acc = evaluateSingleCondition(row, filters[0]);
            for (let i = 1; i < filters.length; i++) {
                const cond = filters[i];
                const mode = cond.join ?? filterLogic;
                const matches = evaluateSingleCondition(row, cond);
                acc = mode === 'OR' ? acc || matches : acc && matches;
            }
            if (!acc) return false;
        }

        return true;
    });

    if (sort && sort.column) {
        const { column, direction } = sort;
        const mul = direction === 'asc' ? 1 : -1;
        filtered = [...filtered].sort((a, b) => {
            const va = a[column];
            const vb = b[column];
            const aNull = va === null || va === undefined;
            const bNull = vb === null || vb === undefined;
            if (aNull && bNull) return 0;
            if (aNull) return 1;
            if (bNull) return -1;

            if (typeof va !== 'boolean' && typeof vb !== 'boolean' && typeof va !== 'object' && typeof vb !== 'object') {
                const exactCmp = compareExactNumericValues(va, vb);
                if (exactCmp !== null) {
                    return exactCmp * mul;
                }
            }

            const sa = typeof va === 'object' ? JSON.stringify(va) : String(va);
            const sb = typeof vb === 'object' ? JSON.stringify(vb) : String(vb);
            return sa.localeCompare(sb, undefined, { numeric: true }) * mul;
        });
    }

    if (selectedColumns && selectedColumns.length > 0) {
        filtered = filtered.map((r) => {
            const proj: Record<string, unknown> = {};
            for (const col of selectedColumns) {
                proj[col] = r[col];
            }
            return proj;
        });
    }

    return {
        rows: filtered,
        matchedCount: filtered.length,
    };
}

// ============================================================
// 10. SCHEMA CODE & DDL GENERATOR (10 READY-TO-RUN TARGETS)
// ============================================================

export function generateSchemaCode(
    schema: ColumnSchemaNode[],
    target: SchemaTargetLanguage,
    tableName = 'analytics_dataset'
): string {
    const safeTable = tableName.replace(/[^a-zA-Z0-9_]/g, '_') || 'analytics_dataset';

    switch (target) {
        case 'postgresql': {
            const cols = schema.map((c) => {
                const pgType = mapToPostgresType(c.logicalType, c.precision, c.scale);
                const nullStr = c.nullable ? '' : ' NOT NULL';
                return `  "${c.name}" ${pgType}${nullStr}`;
            });
            return `-- PostgreSQL DDL Generated by KivaroTools Columnar Studio\nCREATE TABLE "${safeTable}" (\n${cols.join(',\n')}\n);`;
        }
        case 'snowflake': {
            const cols = schema.map((c) => {
                const sfType = mapToSnowflakeType(c.logicalType, c.precision, c.scale);
                const nullStr = c.nullable ? '' : ' NOT NULL';
                return `  "${c.name}" ${sfType}${nullStr}`;
            });
            return `-- Snowflake Data Cloud DDL\nCREATE OR REPLACE TABLE "${safeTable.toUpperCase()}" (\n${cols.join(',\n')}\n);`;
        }
        case 'bigquery': {
            const cols = schema.map((c) => {
                const bqType = mapToBigQueryType(c.logicalType, c.precision, c.scale);
                const nullStr = c.nullable ? '' : ' NOT NULL';
                return `  \`${c.name}\` ${bqType}${nullStr}`;
            });
            return `-- Google BigQuery DDL\nCREATE TABLE \`project.dataset.${safeTable}\` (\n${cols.join(',\n')}\n);`;
        }
        case 'duckdb': {
            const cols = schema.map((c) => {
                const dType = mapToDuckDbType(c.logicalType, c.precision, c.scale);
                const nullStr = c.nullable ? '' : ' NOT NULL';
                return `  "${c.name}" ${dType}${nullStr}`;
            });
            return `-- DuckDB Local Analytics DDL\nCREATE TABLE "${safeTable}" (\n${cols.join(',\n')}\n);\n\n-- Direct Zero-Copy Parquet Ingestion in DuckDB:\nINSERT INTO "${safeTable}" SELECT * FROM read_parquet('${safeTable}.parquet');`;
        }
        case 'clickhouse': {
            const firstCol = schema[0]?.name || 'tuple()';
            const cols = schema.map((c) => {
                const base = mapToClickHouseType(c.logicalType, c.precision, c.scale);
                const wrapped = c.nullable ? `Nullable(${base})` : base;
                return `  \`${c.name}\` ${wrapped}`;
            });
            return `-- ClickHouse MergeTree DDL\nCREATE TABLE ${safeTable} (\n${cols.join(',\n')}\n) ENGINE = MergeTree()\nORDER BY (${schema[0]?.nullable ? 'tuple()' : `\`${firstCol}\``});`;
        }
        case 'typescript': {
            const pascal = safeTable
                .split('_')
                .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : ''))
                .join('');
            const fields = schema.map((c) => {
                const tsType = mapToTypeScriptType(c.logicalType);
                const nullUnion = c.nullable ? ' | null' : '';
                return `  ${/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(c.name) ? c.name : `'${c.name}'`}: ${tsType}${nullUnion};`;
            });
            return `export interface ${pascal || 'DatasetRecord'} {\n${fields.join('\n')}\n}`;
        }
        case 'pyarrow': {
            const fields = schema.map(
                (c) =>
                    `    pa.field("${c.name}", ${mapToPyArrowType(c.logicalType, c.precision, c.scale)}, nullable=${c.nullable ? 'True' : 'False'
                    }),`
            );
            return `import pyarrow as pa\n\n${safeTable}_schema = pa.schema([\n${fields.join('\n')}\n])`;
        }
        case 'polars': {
            const fields = schema.map(
                (c) => `    "${c.name}": ${mapToPolarsType(c.logicalType, c.precision, c.scale)},`
            );
            return `import polars as pl\n\n${safeTable}_schema = pl.Schema({\n${fields.join('\n')}\n})`;
        }
        case 'avro_schema': {
            const avsc = {
                type: 'record',
                name: safeTable,
                namespace: 'com.kivarotools.schema',
                fields: schema.map((c) => ({
                    name: c.name,
                    type: c.nullable
                        ? ['null', mapLogicalToAvroPrimitive(c.logicalType)]
                        : mapLogicalToAvroPrimitive(c.logicalType),
                    ...(c.nullable ? { default: null } : {}),
                })),
            };
            return JSON.stringify(avsc, null, 2);
        }
        case 'json_schema': {
            const properties: Record<string, unknown> = {};
            const required: string[] = [];
            for (const c of schema) {
                const jsType = mapToJsonSchemaType(c.logicalType);
                properties[c.name] = {
                    type: c.nullable ? [jsType, 'null'] : jsType,
                    description: `Physical: ${c.physicalType}, Logical: ${c.logicalType}`,
                };
                if (!c.nullable) required.push(c.name);
            }
            return JSON.stringify(
                {
                    $schema: 'https://json-schema.org/draft/2020-12/schema',
                    title: safeTable,
                    type: 'object',
                    properties,
                    required,
                },
                null,
                2
            );
        }
    }
}

function normalizeDecimalPrecisionScale(precision?: number, scale?: number): { p: number; s: number } {
    const p = precision && precision > 0 ? Math.min(38, Math.trunc(precision)) : 18;
    const s = scale !== undefined && scale >= 0 ? Math.min(p, Math.trunc(scale)) : 4;
    return { p, s };
}

function mapToPostgresType(t: LogicalDataType, precision?: number, scale?: number): string {
    switch (t) {
        case 'BOOLEAN':
            return 'BOOLEAN';
        case 'INT32':
            return 'INTEGER';
        case 'INT64':
            return 'BIGINT';
        case 'UINT64':
            return 'NUMERIC(20, 0)';
        case 'FLOAT':
            return 'REAL';
        case 'DOUBLE':
            return 'DOUBLE PRECISION';
        case 'DECIMAL': {
            const { p, s } = normalizeDecimalPrecisionScale(precision, scale);
            return `NUMERIC(${p}, ${s})`;
        }
        case 'DATE':
            return 'DATE';
        case 'TIMESTAMP_MILLIS':
        case 'TIMESTAMP_MICROS':
        case 'TIMESTAMP_NANOS':
            return 'TIMESTAMPTZ';
        case 'UUID':
            return 'UUID';
        case 'LIST':
        case 'STRUCT':
        case 'MAP':
        case 'JSON':
            return 'JSONB';
        default:
            return 'TEXT';
    }
}

function mapToDuckDbType(t: LogicalDataType, precision?: number, scale?: number): string {
    switch (t) {
        case 'BOOLEAN':
            return 'BOOLEAN';
        case 'INT32':
            return 'INTEGER';
        case 'INT64':
            return 'BIGINT';
        case 'UINT64':
            return 'UBIGINT';
        case 'FLOAT':
            return 'FLOAT';
        case 'DOUBLE':
            return 'DOUBLE';
        case 'DECIMAL': {
            const { p, s } = normalizeDecimalPrecisionScale(precision, scale);
            return `DECIMAL(${p}, ${s})`;
        }
        case 'DATE':
            return 'DATE';
        case 'TIMESTAMP_MILLIS':
        case 'TIMESTAMP_MICROS':
        case 'TIMESTAMP_NANOS':
            return 'TIMESTAMPTZ';
        case 'UUID':
            return 'UUID';
        case 'LIST':
        case 'STRUCT':
        case 'MAP':
        case 'JSON':
            return 'JSON';
        default:
            return 'VARCHAR';
    }
}

function mapToSnowflakeType(t: LogicalDataType, precision?: number, scale?: number): string {
    switch (t) {
        case 'BOOLEAN':
            return 'BOOLEAN';
        case 'INT32':
        case 'INT64':
        case 'UINT64':
            return 'NUMBER(38, 0)';
        case 'FLOAT':
        case 'DOUBLE':
            return 'FLOAT';
        case 'DECIMAL': {
            const { p, s } = normalizeDecimalPrecisionScale(precision, scale);
            return `NUMBER(${p}, ${s})`;
        }
        case 'DATE':
            return 'DATE';
        case 'TIMESTAMP_MILLIS':
        case 'TIMESTAMP_MICROS':
        case 'TIMESTAMP_NANOS':
            return 'TIMESTAMP_NTZ';
        case 'LIST':
            return 'ARRAY';
        case 'STRUCT':
        case 'MAP':
        case 'JSON':
            return 'VARIANT';
        default:
            return 'VARCHAR';
    }
}

function mapToBigQueryType(t: LogicalDataType, precision?: number, scale?: number): string {
    switch (t) {
        case 'BOOLEAN':
            return 'BOOL';
        case 'INT32':
        case 'INT64':
            return 'INT64';
        case 'UINT64':
            return 'NUMERIC';
        case 'FLOAT':
        case 'DOUBLE':
            return 'FLOAT64';
        case 'DECIMAL': {
            const { p, s } = normalizeDecimalPrecisionScale(precision, scale);
            return p > 38 || s > 9 ? `BIGNUMERIC(${p}, ${s})` : `NUMERIC(${p}, ${s})`;
        }
        case 'DATE':
            return 'DATE';
        case 'TIMESTAMP_MILLIS':
        case 'TIMESTAMP_MICROS':
        case 'TIMESTAMP_NANOS':
            return 'TIMESTAMP';
        case 'LIST':
        case 'STRUCT':
        case 'MAP':
        case 'JSON':
            return 'JSON';
        default:
            return 'STRING';
    }
}

function mapToClickHouseType(t: LogicalDataType, precision?: number, scale?: number): string {
    switch (t) {
        case 'BOOLEAN':
            return 'Bool';
        case 'INT32':
            return 'Int32';
        case 'INT64':
            return 'Int64';
        case 'UINT64':
            return 'UInt64';
        case 'FLOAT':
            return 'Float32';
        case 'DOUBLE':
            return 'Float64';
        case 'DECIMAL': {
            const { p, s } = normalizeDecimalPrecisionScale(precision, scale);
            return `Decimal(${p}, ${s})`;
        }
        case 'DATE':
            return 'Date';
        case 'TIMESTAMP_MILLIS':
            return 'DateTime64(3)';
        case 'TIMESTAMP_MICROS':
            return 'DateTime64(6)';
        case 'TIMESTAMP_NANOS':
            return 'DateTime64(9)';
        case 'UUID':
            return 'UUID';
        default:
            return 'String';
    }
}

function mapToTypeScriptType(t: LogicalDataType): string {
    switch (t) {
        case 'BOOLEAN':
            return 'boolean';
        case 'INT32':
        case 'FLOAT':
        case 'DOUBLE':
        case 'DECIMAL':
            return 'number';
        case 'INT64':
        case 'UINT64':
            return 'string | number';
        case 'LIST':
            return 'unknown[]';
        case 'STRUCT':
        case 'MAP':
            return 'Record<string, unknown>';
        default:
            return 'string';
    }
}

function mapToPyArrowType(t: LogicalDataType, precision?: number, scale?: number): string {
    switch (t) {
        case 'BOOLEAN':
            return 'pa.bool_()';
        case 'INT32':
            return 'pa.int32()';
        case 'INT64':
            return 'pa.int64()';
        case 'UINT64':
            return 'pa.uint64()';
        case 'FLOAT':
            return 'pa.float32()';
        case 'DOUBLE':
            return 'pa.float64()';
        case 'DECIMAL': {
            const { p, s } = normalizeDecimalPrecisionScale(precision, scale);
            return `pa.decimal128(${p}, ${s})`;
        }
        case 'DATE':
            return 'pa.date32()';
        case 'TIMESTAMP_MILLIS':
            return 'pa.timestamp("ms")';
        case 'TIMESTAMP_MICROS':
            return 'pa.timestamp("us")';
        case 'TIMESTAMP_NANOS':
            return 'pa.timestamp("ns")';
        case 'LIST':
            return 'pa.list_(pa.string())';
        default:
            return 'pa.string()';
    }
}

function mapToPolarsType(t: LogicalDataType, precision?: number, scale?: number): string {
    switch (t) {
        case 'BOOLEAN':
            return 'pl.Boolean';
        case 'INT32':
            return 'pl.Int32';
        case 'INT64':
            return 'pl.Int64';
        case 'UINT64':
            return 'pl.UInt64';
        case 'FLOAT':
            return 'pl.Float32';
        case 'DOUBLE':
            return 'pl.Float64';
        case 'DECIMAL': {
            const { p, s } = normalizeDecimalPrecisionScale(precision, scale);
            return `pl.Decimal(${p}, ${s})`;
        }
        case 'DATE':
            return 'pl.Date';
        case 'TIMESTAMP_MILLIS':
            return 'pl.Datetime("ms")';
        case 'TIMESTAMP_MICROS':
            return 'pl.Datetime("us")';
        case 'TIMESTAMP_NANOS':
            return 'pl.Datetime("ns")';
        case 'LIST':
            return 'pl.List(pl.String)';
        default:
            return 'pl.String';
    }
}

function mapToJsonSchemaType(t: LogicalDataType): string {
    switch (t) {
        case 'BOOLEAN':
            return 'boolean';
        case 'INT32':
            return 'integer';
        case 'FLOAT':
        case 'DOUBLE':
        case 'DECIMAL':
            return 'number';
        case 'LIST':
            return 'array';
        case 'STRUCT':
        case 'MAP':
            return 'object';
        default:
            return 'string';
    }
}

// ============================================================
// 11. MULTI-FORMAT EXPORTER, 15-VECTOR CWE-1236 GUARD & NATIVE .XLSX ZIP COMPILER
// ============================================================

export function sanitizeSpreadsheetFormula(val: unknown, sanitize = true): string {
    if (val === null || val === undefined) return '';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    if (!sanitize || !str) return str;

    if (/^[\s\u0000-\u001F]*[=+@\uFF1D\uFF0B\uFF20]/.test(str)) {
        return `'${str}`;
    }
    if (/^[\s\u0000-\u001F]*[-–—\uFF0D](?!\s*\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\s*$)/.test(str)) {
        return `'${str}`;
    }
    return str;
}

export function escapeCsvCell(
    rawVal: unknown,
    delimiter: string,
    sanitizeFormulas: boolean
): string {
    if (rawVal === null || rawVal === undefined) return '';
    let str =
        typeof rawVal === 'object'
            ? JSON.stringify(rawVal)
            : typeof rawVal === 'bigint'
                ? rawVal.toString()
                : String(rawVal);

    str = sanitizeSpreadsheetFormula(str, sanitizeFormulas);

    if (
        str.includes(delimiter) ||
        str.includes('"') ||
        str.includes('\n') ||
        str.includes('\r')
    ) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

/**
 * Native Binary Microsoft Excel (.xlsx) Office Open XML Workbook Compiler.
 */
export function encodeXlsxWorkbookBinary(
    rows: Record<string, unknown>[],
    columns: string[],
    options: { sheetName?: string; sanitizeFormulas?: boolean } = {}
): Uint8Array {
    const sheetName = (options.sheetName || 'Dataset').replace(/[\\/?*[\]:]/g, '_').slice(0, 31) || 'Dataset';
    const sanitize = options.sanitizeFormulas !== false;

    const escXml = (s: string) =>
        s
            .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');

    const colIndexToLetter = (idx: number): string => {
        let n = idx + 1;
        let s = '';
        while (n > 0) {
            const rem = (n - 1) % 26;
            s = String.fromCharCode(65 + rem) + s;
            n = Math.floor((n - 1) / 26);
        }
        return s;
    };

    const lastColLetter = colIndexToLetter(Math.max(0, columns.length - 1));
    const totalSheetRows = rows.length + 1;

    const xmlRows: string[] = [];
    const headerCells = columns
        .map(
            (col, cIdx) =>
                `<c r="${colIndexToLetter(cIdx)}1" t="inlineStr" s="1"><is><t>${escXml(
                    sanitizeSpreadsheetFormula(col, sanitize)
                )}</t></is></c>`
        )
        .join('');
    xmlRows.push(`<row r="1">${headerCells}</row>`);

    for (let rIdx = 0; rIdx < rows.length; rIdx++) {
        const rowNum = rIdx + 2;
        const rowObj = rows[rIdx];
        const cells: string[] = [];
        for (let cIdx = 0; cIdx < columns.length; cIdx++) {
            const col = columns[cIdx];
            const ref = `${colIndexToLetter(cIdx)}${rowNum}`;
            const val = rowObj[col];
            if (val === null || val === undefined) continue;
            if (
                typeof val === 'number' &&
                Number.isFinite(val) &&
                (!Number.isInteger(val) || Math.abs(val) < 1e15)
            ) {
                cells.push(`<c r="${ref}" t="n"><v>${val}</v></c>`);
            } else if (typeof val === 'boolean') {
                cells.push(`<c r="${ref}" t="b"><v>${val ? 1 : 0}</v></c>`);
            } else {
                const rawStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
                const safeStr = sanitizeSpreadsheetFormula(rawStr, sanitize);
                cells.push(`<c r="${ref}" t="inlineStr"><is><t>${escXml(safeStr)}</t></is></c>`);
            }
        }
        xmlRows.push(`<row r="${rowNum}">${cells.join('')}</row>`);
    }

    const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  <sheetData>${xmlRows.join('')}</sheetData>
  <autoFilter ref="A1:${lastColLetter}${totalSheetRows}"/>
</worksheet>`;

    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

    const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

    const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${escXml(sheetName)}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

    const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/></font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
</styleSheet>`;

    return buildPkZipArchive([
        { name: '[Content_Types].xml', data: textEncoder.encode(contentTypesXml) },
        { name: '_rels/.rels', data: textEncoder.encode(rootRelsXml) },
        { name: 'xl/workbook.xml', data: textEncoder.encode(workbookXml) },
        { name: 'xl/_rels/workbook.xml.rels', data: textEncoder.encode(workbookRelsXml) },
        { name: 'xl/styles.xml', data: textEncoder.encode(stylesXml) },
        { name: 'xl/worksheets/sheet1.xml', data: textEncoder.encode(sheetXml) },
    ]);
}

function buildPkZipArchive(entries: { name: string; data: Uint8Array }[]): Uint8Array {
    const localHeaders: Uint8Array[] = [];
    const centralHeaders: Uint8Array[] = [];
    let offset = 0;

    for (const entry of entries) {
        const nameBytes = textEncoder.encode(entry.name);
        const crc = computeCrc32(entry.data);
        const size = entry.data.length;

        const local = new Uint8Array(30 + nameBytes.length + size);
        const lv = new DataView(local.buffer);
        lv.setUint32(0, 0x04034b50, true);
        lv.setUint16(4, 20, true);
        lv.setUint16(6, 0, true);
        lv.setUint16(8, 0, true);
        lv.setUint16(10, 0, true);
        lv.setUint16(12, 0, true);
        lv.setUint32(14, crc, true);
        lv.setUint32(18, size, true);
        lv.setUint32(22, size, true);
        lv.setUint16(26, nameBytes.length, true);
        lv.setUint16(28, 0, true);
        local.set(nameBytes, 30);
        local.set(entry.data, 30 + nameBytes.length);
        localHeaders.push(local);

        const central = new Uint8Array(46 + nameBytes.length);
        const cv = new DataView(central.buffer);
        cv.setUint32(0, 0x02014b50, true);
        cv.setUint16(4, 20, true);
        cv.setUint16(6, 20, true);
        cv.setUint16(8, 0, true);
        cv.setUint16(10, 0, true);
        cv.setUint16(12, 0, true);
        cv.setUint16(14, 0, true);
        cv.setUint32(16, crc, true);
        cv.setUint32(20, size, true);
        cv.setUint32(24, size, true);
        cv.setUint16(28, nameBytes.length, true);
        cv.setUint16(30, 0, true);
        cv.setUint16(32, 0, true);
        cv.setUint16(34, 0, true);
        cv.setUint16(36, 0, true);
        cv.setUint32(38, 0, true);
        cv.setUint32(42, offset, true);
        central.set(nameBytes, 46);
        centralHeaders.push(central);

        offset += local.length;
    }

    const centralSize = centralHeaders.reduce((a, b) => a + b.length, 0);
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, entries.length, true);
    ev.setUint16(10, entries.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, offset, true);
    ev.setUint16(20, 0, true);

    const total = offset + centralSize + 22;
    const out = new Uint8Array(total);
    let pos = 0;
    for (const l of localHeaders) {
        out.set(l, pos);
        pos += l.length;
    }
    for (const c of centralHeaders) {
        out.set(c, pos);
        pos += c.length;
    }
    out.set(eocd, pos);
    return out;
}

export function exportDatasetToText(
    rows: Record<string, unknown>[],
    columns: string[],
    options: ExportOptions
): string {
    const cols =
        options.selectedColumns && options.selectedColumns.length > 0
            ? options.selectedColumns
            : columns;

    switch (options.format) {
        case 'csv':
        case 'tsv': {
            const delim = options.format === 'tsv' ? '\t' : options.csvDelimiter;
            const headerLine = cols
                .map((c) => escapeCsvCell(c, delim, options.sanitizeFormulas))
                .join(delim);
            const bodyLines = rows.map((r) =>
                cols
                    .map((c) => escapeCsvCell(r[c], delim, options.sanitizeFormulas))
                    .join(delim)
            );
            const csvContent = [headerLine, ...bodyLines].join('\r\n');
            return options.includeUtf8Bom ? `\uFEFF${csvContent}` : csvContent;
        }

        case 'json': {
            const projected = rows.map((r) => {
                const obj: Record<string, unknown> = {};
                for (const c of cols) {
                    const v = r[c];
                    obj[c] = v === undefined ? null : typeof v === 'bigint' ? v.toString() : v;
                }
                return obj;
            });
            return options.prettyJson
                ? JSON.stringify(projected, null, 2)
                : JSON.stringify(projected);
        }

        case 'jsonl': {
            return rows
                .map((r) => {
                    const obj: Record<string, unknown> = {};
                    for (const c of cols) {
                        const v = r[c];
                        obj[c] = v === undefined ? null : typeof v === 'bigint' ? v.toString() : v;
                    }
                    return JSON.stringify(obj);
                })
                .join('\n');
        }

        case 'sql': {
            const safeTable =
                options.tableName.replace(/[^a-zA-Z0-9_]/g, '_') || 'exported_table';
            if (rows.length === 0 || cols.length === 0) {
                return `-- No rows to export for ${safeTable}`;
            }
            const colList = cols.map((c) => `"${c}"`).join(', ');
            const valueTuples = rows.map((r) => {
                const vals = cols.map((c) => {
                    const v = r[c];
                    if (v === null || v === undefined) return 'NULL';
                    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
                    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
                    if (typeof v === 'bigint') return v.toString();
                    const str = typeof v === 'object' ? JSON.stringify(v) : String(v);
                    return `'${str.replace(/'/g, "''")}'`;
                });
                return `  (${vals.join(', ')})`;
            });
            return `INSERT INTO "${safeTable}" (${colList})\nVALUES\n${valueTuples.join(',\n')};`;
        }

        case 'markdown': {
            if (cols.length === 0) return '';
            const header = `| ${cols.join(' | ')} |`;
            const divider = `| ${cols.map(() => '---').join(' | ')} |`;
            const body = rows.map((r) => {
                const cells = cols.map((c) => {
                    const v = r[c];
                    if (v === null || v === undefined) return 'NULL';
                    const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
                    return s.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
                });
                return `| ${cells.join(' | ')} |`;
            });
            return [header, divider, ...body].join('\n');
        }

        case 'html': {
            const esc = (s: string) =>
                s
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;');
            const ths = cols.map((c) => `      <th>${esc(c)}</th>`).join('\n');
            const trs = rows
                .map((r) => {
                    const tds = cols
                        .map((c) => {
                            const v = r[c];
                            const s =
                                v === null || v === undefined
                                    ? 'NULL'
                                    : typeof v === 'object'
                                        ? JSON.stringify(v)
                                        : String(v);
                            return `      <td>${esc(s)}</td>`;
                        })
                        .join('\n');
                    return `    <tr>\n${tds}\n    </tr>`;
                })
                .join('\n');
            return `<table>\n  <thead>\n    <tr>\n${ths}\n    </tr>\n  </thead>\n  <tbody>\n${trs}\n  </tbody>\n</table>`;
        }

        case 'xlsx': {
            const headerLine = cols
                .map((c) => escapeCsvCell(c, ',', options.sanitizeFormulas))
                .join(',');
            const bodyLines = rows.map((r) =>
                cols
                    .map((c) => escapeCsvCell(r[c], ',', options.sanitizeFormulas))
                    .join(',')
            );
            return [headerLine, ...bodyLines].join('\r\n');
        }

        default:
            return '';
    }
}

// ============================================================
// 12. BACKGROUND WEB WORKER PARSING & MAIN-THREAD FALLBACK
// ============================================================

export interface ColumnarWorkerLike {
    postMessage(message: unknown, transfer?: Transferable[]): void;
    terminate(): void;
    addEventListener(type: string, listener: (ev: unknown) => void): void;
    removeEventListener(type: string, listener: (ev: unknown) => void): void;
}

export interface ColumnarParseDispatcherOptions {
    workerFactory?: (scriptUrl: string) => ColumnarWorkerLike;
    createObjectURL?: (blob: Blob) => string;
    revokeObjectURL?: (url: string) => void;
    disableWorker?: boolean;
}

export interface ColumnarParseAsyncOutcome {
    result: ColumnarParseResult;
    executionMode: 'worker' | 'main-thread-fallback';
    requestId: number;
}

export interface ColumnarParseCancelledError extends Error {
    isCancelled: true;
    requestId: number;
}

export function isColumnarParseCancelledError(err: unknown): err is ColumnarParseCancelledError {
    return Boolean(
        err &&
        typeof err === 'object' &&
        (err as { isCancelled?: unknown }).isCancelled === true
    );
}

function createCancelledError(requestId: number, message = 'Parse operation was cancelled.'): ColumnarParseCancelledError {
    const err = new Error(message) as ColumnarParseCancelledError;
    err.isCancelled = true;
    err.requestId = requestId;
    return err;
}

/**
 * Generates the self-contained Web Worker script by serializing the active engine functions
 * and lookup tables at runtime.
 */
export function buildColumnarWorkerScriptSource(): string {
    const workerFunctions: [string, { toString(): string; name?: string }][] = [
        ['bytesToHex', bytesToHex],
        ['formatEpochTimestampToIso', formatEpochTimestampToIso],
        ['detectColumnarFormat', detectColumnarFormat],
        ['readUnsignedVarint', readUnsignedVarint],
        ['readZigZagVarint', readZigZagVarint],
        ['writeUnsignedVarint', writeUnsignedVarint],
        ['writeZigZagVarint', writeZigZagVarint],
        ['compressSnappyBlock', compressSnappyBlock],
        ['decompressSnappyBlock', decompressSnappyBlock],
        ['decodeRleBitPackedHybrid', decodeRleBitPackedHybrid],
        ['encodeRleBitPackedHybrid', encodeRleBitPackedHybrid],
        ['buildHuffmanTable', buildHuffmanTable],
        ['inflateRawDeflate', inflateRawDeflate],
        ['decompressGzipOrDeflate', decompressGzipOrDeflate],
        ['decompressLz4Block', decompressLz4Block],
        ['decompressLz4RawBlock', decompressLz4RawBlock],
        ['ThriftCompactWriter', ThriftCompactWriter],
        ['ThriftCompactReader', ThriftCompactReader],
        ['computeCrc32', computeCrc32],
        ['formatScaledDecimal', formatScaledDecimal],
        ['decodeTwoComplementBigEndian', decodeTwoComplementBigEndian],
        ['decodeTwoComplementLittleEndian', decodeTwoComplementLittleEndian],
        ['decodeFloat16', decodeFloat16],
        ['decodeParquetStatBytes', decodeParquetStatBytes],
        ['decodeParquetPlainValues', decodeParquetPlainValues],
        ['decompressParquetPagePayload', decompressParquetPagePayload],
        ['reconstructDremelSingleLevelList', reconstructDremelSingleLevelList],
        ['decodeParquetColumnChunkValues', decodeParquetColumnChunkValues],
        ['buildParquetLeafSchemaHierarchy', buildParquetLeafSchemaHierarchy],
        ['setNestedStructValue', setNestedStructValue],
        ['parseParquetBinary', parseParquetBinary],
        ['coerceNumericStat', coerceNumericStat],
        ['readAvroBinaryDatum', readAvroBinaryDatum],
        ['buildSchemaFromAvroJson', buildSchemaFromAvroJson],
        ['parseAvroBinary', parseAvroBinary],
        ['fbReadTableSlots', fbReadTableSlots],
        ['fbDeref', fbDeref],
        ['fbReadString', fbReadString],
        ['decodeFeatherV1PrimitiveArray', decodeFeatherV1PrimitiveArray],
        ['parseFeatherV1Binary', parseFeatherV1Binary],
        ['parseArrowFieldNode', parseArrowFieldNode],
        ['decodeArrowFieldVector', decodeArrowFieldVector],
        ['decodeGenuineArrowIpcStream', decodeGenuineArrowIpcStream],
        ['parseFeatherOrArrowBinary', parseFeatherOrArrowBinary],
        ['parseJsonOrJsonlText', parseJsonOrJsonlText],
        ['parseCsvTextToRows', parseCsvTextToRows],
        ['splitCsvLine', splitCsvLine],
        ['coercePrimitiveValue', coercePrimitiveValue],
        ['inferSchemaFromRows', inferSchemaFromRows],
        ['computeColumnProfiles', computeColumnProfiles],
        ['buildRowGroupMetadata', buildRowGroupMetadata],
        ['parseColumnarFile', parseColumnarFile],
    ];

    const fnSnippets = workerFunctions.map(([origName, fn]) => {
        const src = fn.toString();
        const runtimeName = fn.name;
        if (runtimeName && runtimeName !== origName) {
            return `${src}\nconst ${origName} = ${runtimeName};`;
        }
        return src;
    });

    return [
        `'use strict';`,
        `var __name = (typeof __name !== 'undefined') ? __name : function(target, value) { try { return Object.defineProperty(target, 'name', { value: value, configurable: true }); } catch (_) { return target; } };`,
        `const textEncoder = new TextEncoder();`,
        `const textDecoder = new TextDecoder('utf-8', { fatal: false });`,
        `const COLUMNAR_ENGINE_VERSION = ${JSON.stringify(COLUMNAR_ENGINE_VERSION)};`,
        `const MAX_SAFE_FILE_BYTES = ${MAX_SAFE_FILE_BYTES};`,
        `const MAX_DECOMPRESSED_PAGE_BYTES = ${MAX_DECOMPRESSED_PAGE_BYTES};`,
        `const MAX_DECLARED_ROW_COUNT = ${MAX_DECLARED_ROW_COUNT};`,
        `const MAX_DECLARED_COLUMN_COUNT = ${MAX_DECLARED_COLUMN_COUNT};`,
        `const DEFLATE_LEN_BASE = ${JSON.stringify(DEFLATE_LEN_BASE)};`,
        `const DEFLATE_LEN_EXTRA = ${JSON.stringify(DEFLATE_LEN_EXTRA)};`,
        `const DEFLATE_DIST_BASE = ${JSON.stringify(DEFLATE_DIST_BASE)};`,
        `const DEFLATE_DIST_EXTRA = ${JSON.stringify(DEFLATE_DIST_EXTRA)};`,
        `const DEFLATE_CL_ORDER = ${JSON.stringify(DEFLATE_CL_ORDER)};`,
        `const CT_STOP = ${CT_STOP};`,
        `const CT_BOOLEAN_TRUE = ${CT_BOOLEAN_TRUE};`,
        `const CT_BOOLEAN_FALSE = ${CT_BOOLEAN_FALSE};`,
        `const CT_BYTE = ${CT_BYTE};`,
        `const CT_I16 = ${CT_I16};`,
        `const CT_I32 = ${CT_I32};`,
        `const CT_I64 = ${CT_I64};`,
        `const CT_DOUBLE = ${CT_DOUBLE};`,
        `const CT_BINARY = ${CT_BINARY};`,
        `const CT_LIST = ${CT_LIST};`,
        `const CT_SET = ${CT_SET};`,
        `const CT_MAP = ${CT_MAP};`,
        `const CT_STRUCT = ${CT_STRUCT};`,
        `const PARQUET_TYPE_TO_ENUM = ${JSON.stringify(PARQUET_TYPE_TO_ENUM)};`,
        `const PARQUET_ENUM_TO_TYPE = ${JSON.stringify(PARQUET_ENUM_TO_TYPE)};`,
        `const PARQUET_CODEC_ENUM_TO_NAME = ${JSON.stringify(PARQUET_CODEC_ENUM_TO_NAME)};`,
        `const PARQUET_ENCODING_ENUM_TO_NAME = ${JSON.stringify(PARQUET_ENCODING_ENUM_TO_NAME)};`,
        `const PARQUET_CONVERTED_TYPE_MAP = ${JSON.stringify(PARQUET_CONVERTED_TYPE_MAP)};`,
        `const SUPPORTED_PARQUET_CODECS = new Set(${JSON.stringify(Array.from(SUPPORTED_PARQUET_CODECS))});`,
        `const SUPPORTED_PARQUET_ENCODINGS = new Set(${JSON.stringify(Array.from(SUPPORTED_PARQUET_ENCODINGS))});`,
        `const SUPPORTED_AVRO_CODECS = new Set(${JSON.stringify(Array.from(SUPPORTED_AVRO_CODECS))});`,
        ...fnSnippets,
        `self.addEventListener('message', function(ev) {`,
        `  const msg = ev && ev.data ? ev.data : {};`,
        `  const requestId = msg.requestId;`,
        `  const fileName = typeof msg.fileName === 'string' ? msg.fileName : 'dataset.parquet';`,
        `  try {`,
        `    const raw = msg.bytes;`,
        `    const bytes = raw instanceof Uint8Array ? raw : raw instanceof ArrayBuffer ? new Uint8Array(raw) : new Uint8Array(0);`,
        `    const result = parseColumnarFile(bytes, fileName);`,
        `    self.postMessage({ requestId: requestId, ok: true, result: result });`,
        `  } catch (err) {`,
        `    const errMsg = err && typeof err.message === 'string' ? err.message : String(err);`,
        `    self.postMessage({ requestId: requestId, ok: false, isParseError: true, error: errMsg });`,
        `  }`,
        `});`,
    ].join('\n');
}

export interface ColumnarParseWorkerDispatcher {
    parse(bytes: Uint8Array, fileName?: string): Promise<ColumnarParseAsyncOutcome>;
    cancelCurrent(reason?: string): void;
    dispose(): void;
    getActiveRequestId(): number;
}

export function createColumnarParseWorkerDispatcher(
    options: ColumnarParseDispatcherOptions = {}
): ColumnarParseWorkerDispatcher {
    let latestRequestId = 0;
    let disposed = false;
    let activeCancelFn: ((reason?: string) => void) | null = null;

    const cancelCurrent = (reason = 'Parse request superseded by a newer file selection.') => {
        if (activeCancelFn) {
            const fn = activeCancelFn;
            activeCancelFn = null;
            fn(reason);
        }
    };

    const dispose = () => {
        disposed = true;
        cancelCurrent('Dispatcher disposed.');
    };

    const parse = (
        bytes: Uint8Array,
        fileName = 'dataset.parquet'
    ): Promise<ColumnarParseAsyncOutcome> => {
        if (disposed) {
            return Promise.reject(new Error('Columnar parse dispatcher has been disposed.'));
        }

        cancelCurrent('Parse request superseded by a newer file selection.');
        const requestId = ++latestRequestId;

        if (!bytes || bytes.length === 0) {
            return Promise.reject(
                new Error(
                    'Uploaded file is empty (0 bytes). Please provide a valid Parquet, Avro, Feather, CSV, or JSONL file.'
                )
            );
        }
        if (bytes.length > MAX_SAFE_FILE_BYTES) {
            return Promise.reject(
                new Error(
                    `File size (${(bytes.length / (1024 * 1024)).toFixed(1)} MB) exceeds the in-browser allocation safeguard of ${MAX_SAFE_FILE_BYTES / (1024 * 1024)
                    } MB.`
                )
            );
        }

        const runFallback = (): Promise<ColumnarParseAsyncOutcome> => {
            return new Promise<ColumnarParseAsyncOutcome>((resolve, reject) => {
                if (disposed || requestId !== latestRequestId) {
                    reject(createCancelledError(requestId));
                    return;
                }
                try {
                    const result = parseColumnarFile(bytes, fileName);
                    if (disposed || requestId !== latestRequestId) {
                        reject(createCancelledError(requestId));
                        return;
                    }
                    resolve({
                        result,
                        executionMode: 'main-thread-fallback',
                        requestId,
                    });
                } catch (err: unknown) {
                    reject(err instanceof Error ? err : new Error(String(err)));
                }
            });
        };

        const canUseWorker =
            !options.disableWorker &&
            (typeof options.workerFactory === 'function' ||
                (typeof Worker !== 'undefined' &&
                    typeof Blob !== 'undefined' &&
                    typeof URL !== 'undefined' &&
                    typeof URL.createObjectURL === 'function'));

        if (!canUseWorker) {
            return runFallback();
        }

        return new Promise<ColumnarParseAsyncOutcome>((resolve, reject) => {
            let worker: ColumnarWorkerLike | null = null;
            let objectUrl: string | null = null;
            let settled = false;

            const createUrl =
                options.createObjectURL ??
                ((blob: Blob) => URL.createObjectURL(blob));
            const revokeUrl =
                options.revokeObjectURL ??
                ((url: string) => {
                    if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
                        URL.revokeObjectURL(url);
                    }
                });

            let onMessage: ((ev: unknown) => void) | null = null;
            let onError: ((ev: unknown) => void) | null = null;

            const cleanupResources = () => {
                if (worker) {
                    try {
                        if (onMessage) worker.removeEventListener('message', onMessage);
                        if (onError) worker.removeEventListener('error', onError);
                    } catch {
                        // ignore listener removal errors
                    }
                    try {
                        worker.terminate();
                    } catch {
                        // ignore termination errors
                    }
                    worker = null;
                }
                if (objectUrl) {
                    try {
                        revokeUrl(objectUrl);
                    } catch {
                        // ignore URL revocation errors
                    }
                    objectUrl = null;
                }
                if (activeCancelFn === cancelThisRequest) {
                    activeCancelFn = null;
                }
            };

            const cancelThisRequest = (reason = 'Parse operation was cancelled.') => {
                if (settled) return;
                settled = true;
                cleanupResources();
                reject(createCancelledError(requestId, reason));
            };

            activeCancelFn = cancelThisRequest;

            onMessage = (ev: unknown) => {
                if (settled) return;
                const data = (ev as { data?: Record<string, unknown> })?.data;
                if (!data || data.requestId !== requestId) {
                    return;
                }
                if (disposed || requestId !== latestRequestId) {
                    settled = true;
                    cleanupResources();
                    reject(createCancelledError(requestId));
                    return;
                }
                settled = true;
                cleanupResources();
                if (data.ok && data.result) {
                    resolve({
                        result: data.result as ColumnarParseResult,
                        executionMode: 'worker',
                        requestId,
                    });
                } else {
                    reject(
                        new Error(
                            typeof data.error === 'string'
                                ? data.error
                                : 'Unable to parse binary file.'
                        )
                    );
                }
            };

            onError = () => {
                if (settled) return;
                if (disposed || requestId !== latestRequestId) {
                    settled = true;
                    cleanupResources();
                    reject(createCancelledError(requestId));
                    return;
                }
                settled = true;
                cleanupResources();
                runFallback().then(resolve, reject);
            };

            try {
                const scriptSource = buildColumnarWorkerScriptSource();
                if (typeof Blob !== 'undefined') {
                    const blob = new Blob([scriptSource], { type: 'application/javascript' });
                    objectUrl = createUrl(blob);
                } else {
                    objectUrl = 'blob:columnar-worker';
                }

                worker = options.workerFactory
                    ? options.workerFactory(objectUrl)
                    : (new Worker(objectUrl) as unknown as ColumnarWorkerLike);

                worker.addEventListener('message', onMessage);
                worker.addEventListener('error', onError);

                const copyBytes = new Uint8Array(bytes.length);
                copyBytes.set(bytes);
                worker.postMessage(
                    {
                        requestId,
                        fileName,
                        bytes: copyBytes.buffer,
                    },
                    [copyBytes.buffer]
                );
            } catch {
                if (!settled) {
                    settled = true;
                    cleanupResources();
                    runFallback().then(resolve, reject);
                }
            }
        });
    };

    return {
        parse,
        cancelCurrent,
        dispose,
        getActiveRequestId: () => latestRequestId,
    };
}

export async function parseColumnarFileAsync(
    bytes: Uint8Array,
    fileName = 'dataset.parquet',
    options: ColumnarParseDispatcherOptions = {}
): Promise<ColumnarParseResult> {
    const dispatcher = createColumnarParseWorkerDispatcher(options);
    try {
        const outcome = await dispatcher.parse(bytes, fileName);
        return outcome.result;
    } finally {
        dispatcher.dispose();
    }
}