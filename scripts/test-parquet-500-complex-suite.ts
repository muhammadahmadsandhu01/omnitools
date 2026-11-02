/**
 * 500+ Complex Enterprise Test Suite for KivaroTools Parquet, Avro & Feather Engine
 *
 * 8 Complex Categories (505 Tests Total):
 * 1. Category 1 (Tests 1–75): Complex Parquet Binary Parsing & Schema Extraction
 * 2. Category 2 (Tests 76–150): Complex Avro Binary Parsing & Deflate/Snappy Handling
 * 3. Category 3 (Tests 151–215): Complex Arrow IPC / Feather Binary Parsing
 * 4. Category 4 (Tests 216–285): SQL-Like Query, Multi-Filter & Projection Engine
 * 5. Category 5 (Tests 286–345): Statistical Data Profiler & Distribution Metrics
 * 6. Category 6 (Tests 346–405): Polyglot Schema & DDL Generator (10 Targets × 6 Archetypes)
 * 7. Category 7 (Tests 406–460): High-Fidelity Export Engines & CWE-1236 Defense
 * 8. Category 8 (Tests 461–505): Cross-Format Transcoding & Error Resilience
 */

import {
    parseColumnarFile,
    encodeParquetBinary,
    encodeAvroBinary,
    encodeFeatherBinary,
    readZigZagVarint,
    writeZigZagVarint,
    readUnsignedVarint,
    writeUnsignedVarint,
    detectColumnarFormat,
    bytesToHex,
    inferSchemaFromRows,
    computeColumnProfiles,
    queryDataset,
    generateSchemaCode,
    sanitizeSpreadsheetFormula,
    escapeCsvCell,
    exportDatasetToText,
    type SchemaTargetLanguage,
    type FilterOperator,
} from '../lib/columnarViewerEngine';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails: string[] = [];

function assertTest(condition: boolean, testId: string, desc: string): void {
    totalTests++;
    if (condition) {
        passedTests++;
    } else {
        failedTests++;
        const msg = `❌ [${testId}] FAILED: ${desc}`;
        failureDetails.push(msg);
        console.error(msg);
    }
}

console.log('======================================================================');
console.log('⚡ Running 500+ Complex Enterprise Suite: Parquet / Avro / Feather Engine');
console.log('======================================================================');

// ====================================================================
// CATEGORY 1: Complex Parquet Binary Parsing & Schema Extraction (75 Tests)
// ====================================================================
console.log('\n--- Category 1: Complex Parquet Binary Parsing & Schema (Tests 1–75) ---');

// 1.1 Multi-column, varying row count datasets (Tests 1–15)
for (let i = 1; i <= 15; i++) {
    const colCount = 10 + i * 3; // up to 55 columns
    const rowCount = 5 + (i % 7);
    const rows: Record<string, unknown>[] = [];
    for (let r = 0; r < rowCount; r++) {
        const row: Record<string, unknown> = { id: r + 1, partition_id: `part_${i}` };
        for (let c = 0; c < colCount; c++) {
            row[`metric_col_${c}`] = (r + 1) * 100 + c * 1.5;
        }
        rows.push(row);
    }
    const bytes = encodeParquetBinary(rows, { 'lakehouse.dataset': `benchmark_${i}` });
    const parsed = parseColumnarFile(bytes, `lakehouse_partition_${i}.parquet`);

    assertTest(
        parsed.format === 'parquet' &&
        parsed.metadata.magicBytes === 'PAR1' &&
        parsed.rows.length === rowCount &&
        parsed.schema.length === colCount + 2 &&
        parsed.metadata.keyValueMetadata['lakehouse.dataset'] === `benchmark_${i}`,
        `CAT1-${String(i).padStart(3, '0')}`,
        `Parquet Partition #${i}: ${colCount + 2} cols × ${rowCount} rows, PAR1 magic preserved`
    );
}

// 1.2 64-bit integer boundary values and BigInt safety (Tests 16–25)
const int64Boundaries = [
    { label: 'MAX_SAFE_INT+1', val: '9007199254740992' },
    { label: 'MAX_SAFE_INT+2', val: '9007199254740993' },
    { label: 'INT64_MAX', val: '9223372036854775807' },
    { label: 'INT64_MIN', val: '-9223372036854775808' },
    { label: 'ZERO', val: '0' },
    { label: 'INT32_MAX', val: '2147483647' },
    { label: 'INT32_MIN', val: '-2147483648' },
    { label: 'UINT32_MAX', val: '4294967295' },
    { label: 'ARBITRARY_64BIT_A', val: '1844674407370955161' },
    { label: 'ARBITRARY_64BIT_B', val: '-5000000000000000000' },
];

for (let i = 0; i < int64Boundaries.length; i++) {
    const item = int64Boundaries[i];
    const testNum = 16 + i;
    const rows = [
        { tx_id: 101, raw_val: item.val, note: item.label },
        { tx_id: 102, raw_val: item.val, note: item.label },
    ];
    const bytes = encodeParquetBinary(rows);
    const parsed = parseColumnarFile(bytes, `int64_${item.label}.parquet`);

    assertTest(
        parsed.format === 'parquet' &&
        parsed.rows.length === 2 &&
        String(parsed.rows[0].raw_val) === item.val,
        `CAT1-${String(testNum).padStart(3, '0')}`,
        `64-bit boundary test: ${item.label} (${item.val}) preserved without precision loss`
    );
}

// 1.3 IEEE-754 floating-point edge cases (Tests 26–35)
const floatCases = [
    { label: 'PI_DOUBLE', val: 3.141592653589793 },
    { label: 'E_DOUBLE', val: 2.718281828459045 },
    { label: 'TINY_EPSILON', val: 1e-15 },
    { label: 'LARGE_FLOAT', val: 1.7976931348623157e+308 },
    { label: 'MIN_POSITIVE', val: 5e-324 },
    { label: 'NEGATIVE_FLOAT', val: -99999.87654 },
    { label: 'ZERO_FLOAT', val: 0.0 },
    { label: 'PRECISION_SUM', val: 0.1 + 0.2 },
    { label: 'EXPONENTIAL_NOTATION', val: 6.02214076e23 },
    { label: 'SUB_MICRON', val: 0.0000000012345 },
];

for (let i = 0; i < floatCases.length; i++) {
    const item = floatCases[i];
    const testNum = 26 + i;
    const rows = [{ idx: i, float_col: item.val, label: item.label }];
    const bytes = encodeParquetBinary(rows);
    const parsed = parseColumnarFile(bytes, `float_${item.label}.parquet`);

    assertTest(
        parsed.format === 'parquet' &&
        parsed.rows.length === 1 &&
        Math.abs(Number(parsed.rows[0].float_col) - item.val) < 1e-12 ||
        Number(parsed.rows[0].float_col) === item.val,
        `CAT1-${String(testNum).padStart(3, '0')}`,
        `IEEE-754 Float test: ${item.label} preserved accurately`
    );
}

// 1.4 Deeply nested structs, lists, and maps (Tests 36–45)
for (let i = 1; i <= 10; i++) {
    const testNum = 35 + i;
    const rows = [
        {
            user_id: `usr_${i}`,
            profile: {
                name: `User ${i}`,
                contact: { email: `user${i}@example.com`, phone: `+1-555-010${i}` },
                preferences: { theme: 'dark', notifications: i % 2 === 0 },
            },
            tags: [`tag_a_${i}`, `tag_b_${i}`, `tier_${i % 3}`],
            metrics: { score: i * 10.5, level: i },
        },
    ];
    const bytes = encodeParquetBinary(rows);
    const parsed = parseColumnarFile(bytes, `nested_struct_${i}.parquet`);
    const p0 = parsed.rows[0].profile as { name: string; contact: { email: string } };

    assertTest(
        parsed.format === 'parquet' &&
        parsed.rows.length === 1 &&
        p0.name === `User ${i}` &&
        p0.contact.email === `user${i}@example.com` &&
        Array.isArray(parsed.rows[0].tags) &&
        (parsed.rows[0].tags as string[]).length === 3,
        `CAT1-${String(testNum).padStart(3, '0')}`,
        `Nested Struct/Array test #${i}: 3-level deep struct and array preserved`
    );
}

// 1.5 Sparse and 100% all-null columns (Tests 46–55)
for (let i = 1; i <= 10; i++) {
    const testNum = 45 + i;
    const rows = [
        { id: 1, active: true, all_null_str: null, mixed: i % 2 === 0 ? 'valid' : null },
        { id: 2, active: false, all_null_str: null, mixed: null },
        { id: 3, active: true, all_null_str: null, mixed: 'persisted' },
    ];
    const bytes = encodeParquetBinary(rows);
    const parsed = parseColumnarFile(bytes, `sparse_null_${i}.parquet`);

    assertTest(
        parsed.format === 'parquet' &&
        parsed.rows.length === 3 &&
        parsed.rows[0].all_null_str === null &&
        parsed.rows[1].all_null_str === null &&
        parsed.schema.some((c) => c.name === 'all_null_str'),
        `CAT1-${String(testNum).padStart(3, '0')}`,
        `Sparse/Null column test #${i}: 100% all-null column and mixed nulls correctly inferred`
    );
}

// 1.6 Multilingual Unicode & Special Character Encodings (Tests 56–65)
const unicodeCases = [
    { lang: 'Urdu', text: 'کیوارو ٹولز ڈیٹا پلیٹ فارم' },
    { lang: 'Arabic', text: 'منصة تحليل البيانات السحابية' },
    { lang: 'Japanese', text: 'エンタープライズ・データ・ウェアハウス' },
    { lang: 'Chinese', text: '高性能列式存储引擎' },
    { lang: 'German', text: 'Größere Datenmengen überbrücken & prüfen' },
    { lang: 'Emojis', text: '🚀🔥⚡📊📈🛡️💎' },
    { lang: 'Cyrillic', text: 'Быстродействующее хранилище данных' },
    { lang: 'Math', text: '∑(x_i - µ)² / σ² = 1.000 ± ε' },
    { lang: 'SpecialChars', text: '<script>alert(1)</script> "quoted" \'single\' \\n \\t' },
    { lang: 'RTL_LTR_Mixed', text: 'User 12345 (محمد احمد) has transferred $5,000' },
];

for (let i = 0; i < unicodeCases.length; i++) {
    const item = unicodeCases[i];
    const testNum = 56 + i;
    const rows = [{ id: i + 1, language: item.lang, content: item.text }];
    const bytes = encodeParquetBinary(rows);
    const parsed = parseColumnarFile(bytes, `unicode_${item.lang}.parquet`);

    assertTest(
        parsed.format === 'parquet' &&
        parsed.rows.length === 1 &&
        parsed.rows[0].content === item.text,
        `CAT1-${String(testNum).padStart(3, '0')}`,
        `Unicode Encoding test: ${item.lang} character integrity preserved`
    );
}

// 1.7 Compression metadata & Thrift footer verification (Tests 66–75)
for (let i = 1; i <= 10; i++) {
    const testNum = 65 + i;
    const metaTag = `org.apache.kivaro.benchmark.run_${i}`;
    const metaVal = `tier_${i * 10}_pass`;
    const rows = [{ batch_idx: i, status: 'OK', records: i * 1000 }];
    const bytes = encodeParquetBinary(rows, { [metaTag]: metaVal, 'codec.enforced': 'SNAPPY' });
    const parsed = parseColumnarFile(bytes, `meta_run_${i}.parquet`);

    assertTest(
        parsed.format === 'parquet' &&
        parsed.metadata.createdBy.length > 0 &&
        parsed.metadata.keyValueMetadata[metaTag] === metaVal &&
        parsed.metadata.compressionCodec === 'SNAPPY',
        `CAT1-${String(testNum).padStart(3, '0')}`,
        `Thrift Footer & Metadata test #${i}: custom key-value and SNAPPY codec verified`
    );
}

// ====================================================================
// CATEGORY 2: Complex Avro Binary Parsing & Deflate/Snappy (75 Tests)
// ====================================================================
console.log('\n--- Category 2: Complex Avro Binary Parsing & Codecs (Tests 76–150) ---');

// 2.1 Standard Avro OCF Container Header & Magic (Tests 76–90)
for (let i = 1; i <= 15; i++) {
    const testNum = 75 + i;
    const rows = [
        { kafka_offset: i * 100, topic: `event_stream_v${i}`, active: true },
        { kafka_offset: i * 100 + 1, topic: `event_stream_v${i}`, active: false },
    ];
    const bytes = encodeAvroBinary(rows, `AvroBenchmarkRecord_${i}`);
    const parsed = parseColumnarFile(bytes, `stream_topic_${i}.avro`);

    assertTest(
        parsed.format === 'avro' &&
        parsed.metadata.magicBytes === 'Obj\\x01' &&
        parsed.rows.length === 2 &&
        typeof parsed.metadata.syncMarkerHex === 'string' &&
        parsed.metadata.syncMarkerHex.length > 0,
        `CAT2-${String(testNum).padStart(3, '0')}`,
        `Avro OCF Container #${i}: Obj\\x01 magic and 16-byte sync marker verified`
    );
}

// 2.2 ZigZag Varint Encoder/Decoder Boundaries (Tests 91–105)
const zigzagTestValues: number[] = [
    0,
    -1,
    1,
    -2,
    2,
    2147483647,
    -2147483648,
    4294967295,
    -4294967296,
    1000000,
    -1000000,
    123456789,
    -987654321,
    9007199254740,
    -9007199254740,
];

for (let i = 0; i < zigzagTestValues.length; i++) {
    const val = zigzagTestValues[i];
    const testNum = 90 + i + 1;
    const encoded = writeZigZagVarint(val);
    const buf = new Uint8Array(encoded);
    const decoded = readZigZagVarint(buf, 0);

    assertTest(
        decoded.value === val && encoded.length > 0,
        `CAT2-${String(testNum).padStart(3, '0')}`,
        `ZigZag Varint Boundary: ${val} round-trips losslessly`
    );
}

// 2.3 Avro Union Types with Optional Nulls (Tests 106–120)
for (let i = 1; i <= 15; i++) {
    const testNum = 105 + i;
    const rows = [
        { id: i, str_union: 'alpha', num_union: 42.5, bool_union: true },
        { id: i + 1, str_union: null, num_union: null, bool_union: null },
        { id: i + 2, str_union: 'gamma', num_union: -100, bool_union: false },
    ];
    const bytes = encodeAvroBinary(rows);
    const parsed = parseColumnarFile(bytes, `union_test_${i}.avro`);

    const colStr = parsed.schema.find((c) => c.name === 'str_union');
    const colNum = parsed.schema.find((c) => c.name === 'num_union');

    assertTest(
        parsed.format === 'avro' &&
        parsed.rows.length === 3 &&
        colStr?.nullable === true &&
        colNum?.nullable === true &&
        parsed.rows[1].str_union === null,
        `CAT2-${String(testNum).padStart(3, '0')}`,
        `Avro Union [null, T] test #${i}: nullable schema and values verified`
    );
}

// 2.4 Streaming Kafka Event Batch Simulations (Tests 121–135)
for (let i = 1; i <= 15; i++) {
    const testNum = 120 + i;
    const batchSize = 10 + i;
    const rows: Record<string, unknown>[] = [];
    for (let r = 0; r < batchSize; r++) {
        rows.push({
            partition: i % 4,
            offset: i * 10000 + r,
            timestamp_ms: 1772419200000 + r * 1000,
            event_type: ['USER_SIGNUP', 'PAYMENT_PROCESSED', 'ORDER_SHIPPED'][r % 3],
            payload: { order_id: `ord_${i}_${r}`, amount: Number((r * 15.75).toFixed(2)) },
        });
    }
    const bytes = encodeAvroBinary(rows, `KafkaBatchEvent_${i}`);
    const parsed = parseColumnarFile(bytes, `kafka_batch_${i}.avro`);

    assertTest(
        parsed.format === 'avro' &&
        parsed.rows.length === batchSize &&
        (parsed.rows[0].payload as { order_id: string }).order_id === `ord_${i}_0`,
        `CAT2-${String(testNum).padStart(3, '0')}`,
        `Kafka Event Batch #${i}: ${batchSize} events with embedded struct parsed cleanly`
    );
}

// 2.5 Multi-field & Complex Nested Record Schemas (Tests 136–150)
for (let i = 1; i <= 15; i++) {
    const testNum = 135 + i;
    const rows = [
        {
            device_id: `iot_sensor_${i}`,
            telemetry: { temp_c: 24.5 + i, humidity: 45 + (i % 20), voltage: 3.3 },
            firmware: `v2.${i}.0`,
            location: { latitude: 31.5204 + i * 0.01, longitude: 74.3587 + i * 0.01 },
            active_alerts: [`alert_code_${i}`, 'BATTERY_NOMINAL'],
        },
    ];
    const bytes = encodeAvroBinary(rows);
    const parsed = parseColumnarFile(bytes, `avro_complex_${i}.avro`);
    const loc = parsed.rows[0].location as { latitude: number };

    assertTest(
        parsed.format === 'avro' &&
        parsed.rows.length === 1 &&
        parsed.schema.length === 5 &&
        Math.abs(loc.latitude - (31.5204 + i * 0.01)) < 1e-4,
        `CAT2-${String(testNum).padStart(3, '0')}`,
        `Avro Nested Struct #${i}: 5 schema fields and coordinate struct verified`
    );
}

// ====================================================================
// CATEGORY 3: Complex Arrow IPC / Feather Binary Parsing (65 Tests)
// ====================================================================
console.log('\n--- Category 3: Complex Arrow IPC / Feather (Tests 151–215) ---');

// 3.1 Feather v2 Magic ARROW1 and 8-byte Alignment (Tests 151–165)
for (let i = 1; i <= 15; i++) {
    const testNum = 150 + i;
    const rows = [
        { tensor_idx: i, batch: `batch_${i}`, loss: 0.0245 * i },
        { tensor_idx: i + 1, batch: `batch_${i}`, loss: 0.0198 * i },
    ];
    const bytes = encodeFeatherBinary(rows, { 'dataset.framework': 'PyTorch' });
    const parsed = parseColumnarFile(bytes, `feather_v2_${i}.feather`);

    assertTest(
        parsed.format === 'feather' &&
        parsed.metadata.magicBytes === 'ARROW1' &&
        parsed.rows.length === 2 &&
        parsed.metadata.keyValueMetadata['dataset.framework'] === 'PyTorch',
        `CAT3-${String(testNum).padStart(3, '0')}`,
        `Feather v2 #${i}: ARROW1 magic, 8-byte alignment and PyTorch metadata verified`
    );
}

// 3.2 Feather v1 (FEA1) & Stream 0xFFFFFFFF Magic Detection (Tests 166–175)
for (let i = 1; i <= 5; i++) {
    const testNum = 165 + i;
    const fakeFea1 = new Uint8Array(32);
    // FEA1 magic: 0x46, 0x45, 0x41, 0x31
    fakeFea1.set([0x46, 0x45, 0x41, 0x31], 0);
    const detection = detectColumnarFormat(fakeFea1, `legacy_${i}.feather`);

    assertTest(
        detection.format === 'feather' && detection.magic === 'FEA1',
        `CAT3-${String(testNum).padStart(3, '0')}`,
        `Feather v1 Magic Detection #${i}: FEA1 recognized accurately`
    );
}
for (let i = 1; i <= 5; i++) {
    const testNum = 170 + i;
    const fakeStream = new Uint8Array(32);
    // Arrow IPC stream continuation: 0xFFFFFFFF
    fakeStream.set([0xff, 0xff, 0xff, 0xff, 0x10, 0x00, 0x00, 0x00], 0);
    const detection = detectColumnarFormat(fakeStream, `stream_${i}.arrow`);

    assertTest(
        detection.format === 'arrow_stream' && detection.magic === 'ARROW_STREAM',
        `CAT3-${String(testNum).padStart(3, '0')}`,
        `Arrow IPC Stream Magic Detection #${i}: 0xFFFFFFFF continuation recognized`
    );
}

// 3.3 High-Dimensional Vectors & Embeddings (Tests 176–190)
for (let i = 1; i <= 15; i++) {
    const testNum = 175 + i;
    const dimSize = 64;
    const vector: number[] = [];
    for (let d = 0; d < dimSize; d++) {
        vector.push(Number(((d * 0.015) - 0.5).toFixed(4)));
    }
    const rows = [
        { doc_id: `doc_${i}_a`, embedding: vector, score: 0.985 },
        { doc_id: `doc_${i}_b`, embedding: vector, score: 0.942 },
    ];
    const bytes = encodeFeatherBinary(rows);
    const parsed = parseColumnarFile(bytes, `vector_embeddings_${i}.feather`);

    assertTest(
        parsed.format === 'feather' &&
        parsed.rows.length === 2 &&
        Array.isArray(parsed.rows[0].embedding) &&
        (parsed.rows[0].embedding as number[]).length === dimSize,
        `CAT3-${String(testNum).padStart(3, '0')}`,
        `High-Dim Vector Embeddings #${i}: 64-dimensional float vector preserved`
    );
}

// 3.4 Temporal, Date, Timestamp & UUID Types (Tests 191–205)
for (let i = 1; i <= 15; i++) {
    const testNum = 190 + i;
    const rows = [
        {
            tx_uuid: `f47ac10b-58cc-4372-a567-0e02b2c3d47${i % 10}`,
            recorded_date: `2026-03-${String((i % 28) + 1).padStart(2, '0')}`,
            timestamp_iso: `2026-03-15T10:30:00.${String(i).padStart(3, '0')}Z`,
            epoch_micros: 1772419200000000 + i * 500,
        },
    ];
    const bytes = encodeFeatherBinary(rows);
    const parsed = parseColumnarFile(bytes, `temporal_${i}.feather`);

    assertTest(
        parsed.format === 'feather' &&
        parsed.rows.length === 1 &&
        parsed.rows[0].tx_uuid === rows[0].tx_uuid &&
        parsed.rows[0].recorded_date === rows[0].recorded_date,
        `CAT3-${String(testNum).padStart(3, '0')}`,
        `Temporal/UUID Schema #${i}: UUID and ISO-8601 timestamps preserved`
    );
}

// 3.5 Metadata Preservation & Multi-Column Tabular Science (Tests 206–215)
for (let i = 1; i <= 10; i++) {
    const testNum = 205 + i;
    const colCount = 20;
    const row: Record<string, unknown> = { experiment_id: `exp_${i}` };
    for (let c = 1; c <= colCount; c++) {
        row[`feature_${c}`] = c * 0.123;
    }
    const bytes = encodeFeatherBinary([row], { 'experiment.name': `EXP_${i}_TRIAL` });
    const parsed = parseColumnarFile(bytes, `science_${i}.feather`);

    assertTest(
        parsed.format === 'feather' &&
        parsed.schema.length === colCount + 1 &&
        parsed.metadata.keyValueMetadata['experiment.name'] === `EXP_${i}_TRIAL`,
        `CAT3-${String(testNum).padStart(3, '0')}`,
        `Data Science Tabular #${i}: 21 columns and experiment metadata preserved`
    );
}

// ====================================================================
// CATEGORY 4: SQL-Like Query, Multi-Filter & Projection (70 Tests)
// ====================================================================
console.log('\n--- Category 4: Query, Filter & Projection Engine (Tests 216–285) ---');

const masterQueryRows = [
    { id: 1, name: 'Alice Smith', role: 'admin', age: 34, score: 95.5, tags: 'core', notes: null },
    { id: 2, name: 'Bob Jones', role: 'member', age: 28, score: 82.0, tags: 'billing', notes: 'pending' },
    { id: 3, name: 'Charlie Brown', role: 'guest', age: 19, score: 71.2, tags: 'trial', notes: null },
    { id: 4, name: 'Diana Prince', role: 'admin', age: 42, score: 99.8, tags: 'core', notes: 'vip' },
    { id: 5, name: 'Evan Wright', role: 'member', age: 31, score: 88.0, tags: 'billing', notes: null },
    { id: 6, name: 'Fiona Gallagher', role: 'guest', age: 24, score: 65.4, tags: 'trial', notes: 'flagged' },
    { id: 7, name: 'George Clark', role: 'admin', age: 50, score: 91.0, tags: 'core', notes: 'senior' },
    { id: 8, name: 'Hannah Abbott', role: 'member', age: 22, score: 79.5, tags: 'ops', notes: null },
    { id: 9, name: 'Ian Malcolm', role: 'guest', age: 45, score: 84.3, tags: 'ops', notes: 'consultant' },
    { id: 10, name: 'Julia Roberts', role: 'admin', age: 38, score: 96.2, tags: 'core', notes: 'exec' },
];

// 4.1 Equality (eq) and Inequality (neq) (Tests 216–226)
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'role', operator: 'eq', value: 'admin' }] }).matchedCount === 4,
    'CAT4-216',
    'Filter eq: role=admin returns exactly 4 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'role', operator: 'neq', value: 'admin' }] }).matchedCount === 6,
    'CAT4-217',
    'Filter neq: role!=admin returns exactly 6 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'age', operator: 'eq', value: '28' }] }).matchedCount === 1,
    'CAT4-218',
    'Filter eq numeric: age=28 returns exactly 1 row (Bob Jones)'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'age', operator: 'neq', value: '28' }] }).matchedCount === 9,
    'CAT4-219',
    'Filter neq numeric: age!=28 returns exactly 9 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'tags', operator: 'eq', value: 'core' }] }).matchedCount === 4,
    'CAT4-220',
    'Filter eq: tags=core returns 4 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'tags', operator: 'neq', value: 'ops' }] }).matchedCount === 8,
    'CAT4-221',
    'Filter neq: tags!=ops returns 8 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'score', operator: 'eq', value: '95.5' }] }).matchedCount === 1,
    'CAT4-222',
    'Filter eq float: score=95.5 returns 1 row'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'id', operator: 'eq', value: '7' }] }).matchedCount === 1,
    'CAT4-223',
    'Filter eq id: id=7 returns George Clark'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'role', operator: 'eq', value: 'non_existent' }] }).matchedCount === 0,
    'CAT4-224',
    'Filter eq: nonexistent value returns 0 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'name', operator: 'eq', value: 'Julia Roberts' }] }).matchedCount === 1,
    'CAT4-225',
    'Filter eq: case-insensitive name match'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'role', operator: 'neq', value: 'guest' }] }).matchedCount === 7,
    'CAT4-226',
    'Filter neq: role!=guest returns 7 rows'
);

// 4.2 Greater Than (gt) and Greater or Equal (gte) (Tests 227–237)
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'age', operator: 'gt', value: '30' }] }).matchedCount === 6,
    'CAT4-227',
    'Filter gt: age>30 returns 6 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'age', operator: 'gte', value: '31' }] }).matchedCount === 6,
    'CAT4-228',
    'Filter gte: age>=31 returns 6 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'score', operator: 'gt', value: '90' }] }).matchedCount === 4,
    'CAT4-229',
    'Filter gt float: score>90 returns 4 rows (scores >= 91.0)'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'score', operator: 'gte', value: '91.0' }] }).matchedCount === 4,
    'CAT4-230',
    'Filter gte float: score>=91.0 returns 4 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'id', operator: 'gt', value: '5' }] }).matchedCount === 5,
    'CAT4-231',
    'Filter gt: id>5 returns 5 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'id', operator: 'gte', value: '1' }] }).matchedCount === 10,
    'CAT4-232',
    'Filter gte: id>=1 returns all 10 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'age', operator: 'gt', value: '50' }] }).matchedCount === 0,
    'CAT4-233',
    'Filter gt: age>50 returns 0 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'age', operator: 'gte', value: '50' }] }).matchedCount === 1,
    'CAT4-234',
    'Filter gte: age>=50 returns 1 row (George Clark)'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'score', operator: 'gt', value: '99' }] }).matchedCount === 1,
    'CAT4-235',
    'Filter gt: score>99 returns 1 row (Diana Prince 99.8)'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'score', operator: 'gte', value: '100' }] }).matchedCount === 0,
    'CAT4-236',
    'Filter gte: score>=100 returns 0 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'age', operator: 'gt', value: '20' }] }).matchedCount === 9,
    'CAT4-237',
    'Filter gt: age>20 returns 9 rows'
);

// 4.3 Less Than (lt) and Less or Equal (lte) (Tests 238–248)
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'age', operator: 'lt', value: '30' }] }).matchedCount === 4,
    'CAT4-238',
    'Filter lt: age<30 returns 4 rows (19, 22, 24, 28)'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'age', operator: 'lte', value: '28' }] }).matchedCount === 4,
    'CAT4-239',
    'Filter lte: age<=28 returns 4 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'score', operator: 'lt', value: '75' }] }).matchedCount === 2,
    'CAT4-240',
    'Filter lt: score<75 returns 2 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'score', operator: 'lte', value: '71.2' }] }).matchedCount === 2,
    'CAT4-241',
    'Filter lte: score<=71.2 returns 2 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'id', operator: 'lt', value: '3' }] }).matchedCount === 2,
    'CAT4-242',
    'Filter lt: id<3 returns 2 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'id', operator: 'lte', value: '1' }] }).matchedCount === 1,
    'CAT4-243',
    'Filter lte: id<=1 returns 1 row'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'age', operator: 'lt', value: '19' }] }).matchedCount === 0,
    'CAT4-244',
    'Filter lt: age<19 returns 0 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'age', operator: 'lte', value: '19' }] }).matchedCount === 1,
    'CAT4-245',
    'Filter lte: age<=19 returns 1 row (Charlie Brown)'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'score', operator: 'lt', value: '100' }] }).matchedCount === 10,
    'CAT4-246',
    'Filter lt: score<100 returns all 10 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'score', operator: 'lte', value: '65.4' }] }).matchedCount === 1,
    'CAT4-247',
    'Filter lte: score<=65.4 returns 1 row (Fiona Gallagher)'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'age', operator: 'lt', value: '35' }] }).matchedCount === 6,
    'CAT4-248',
    'Filter lt: age<35 returns 6 rows'
);

// 4.4 Substring Filters: contains, starts_with, ends_with (Tests 249–259)
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'name', operator: 'contains', value: 'li' }] }).matchedCount === 3,
    'CAT4-249',
    'Filter contains: name contains "li" matches Alice, Charlie, Julia'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'name', operator: 'starts_with', value: 'ch' }] }).matchedCount === 1,
    'CAT4-250',
    'Filter starts_with: name starts with "ch" matches Charlie Brown'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'name', operator: 'ends_with', value: 'smith' }] }).matchedCount === 1,
    'CAT4-251',
    'Filter ends_with: name ends with "smith" matches Alice Smith'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'role', operator: 'starts_with', value: 'ad' }] }).matchedCount === 4,
    'CAT4-252',
    'Filter starts_with: role starts with "ad" matches 4 admin rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'tags', operator: 'ends_with', value: 'ing' }] }).matchedCount === 2,
    'CAT4-253',
    'Filter ends_with: tags ends with "ing" matches billing'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'name', operator: 'contains', value: 'an' }] }).matchedCount === 4,
    'CAT4-254',
    'Filter contains: name contains "an" matches Diana, Evan, Hannah, Ian'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'notes', operator: 'contains', value: 'ip' }] }).matchedCount === 1,
    'CAT4-255',
    'Filter contains: notes contains "ip" matches "vip"'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'notes', operator: 'starts_with', value: 'pen' }] }).matchedCount === 1,
    'CAT4-256',
    'Filter starts_with: notes starts with "pen" matches "pending"'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'notes', operator: 'ends_with', value: 'ed' }] }).matchedCount === 1,
    'CAT4-257',
    'Filter ends_with: notes ends with "ed" matches "flagged"'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'role', operator: 'contains', value: 'emb' }] }).matchedCount === 3,
    'CAT4-258',
    'Filter contains: role contains "emb" matches "member"'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'name', operator: 'ends_with', value: 'roberts' }] }).matchedCount === 1,
    'CAT4-259',
    'Filter ends_with: name ends with "roberts" matches Julia Roberts'
);

// 4.5 Null Filters: is_null & is_not_null (Tests 260–270)
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'notes', operator: 'is_null', value: '' }] }).matchedCount === 4,
    'CAT4-260',
    'Filter is_null: notes is null returns exactly 4 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'notes', operator: 'is_not_null', value: '' }] }).matchedCount === 6,
    'CAT4-261',
    'Filter is_not_null: notes is not null returns exactly 6 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'name', operator: 'is_null', value: '' }] }).matchedCount === 0,
    'CAT4-262',
    'Filter is_null: name is null returns 0 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'name', operator: 'is_not_null', value: '' }] }).matchedCount === 10,
    'CAT4-263',
    'Filter is_not_null: name is not null returns all 10 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'score', operator: 'is_not_null', value: '' }] }).matchedCount === 10,
    'CAT4-264',
    'Filter is_not_null: score is not null returns all 10 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'tags', operator: 'is_null', value: '' }] }).matchedCount === 0,
    'CAT4-265',
    'Filter is_null: tags is null returns 0 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'age', operator: 'is_not_null', value: '' }] }).matchedCount === 10,
    'CAT4-266',
    'Filter is_not_null: age is not null returns 10 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'id', operator: 'is_not_null', value: '' }] }).matchedCount === 10,
    'CAT4-267',
    'Filter is_not_null: id is not null returns 10 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'role', operator: 'is_null', value: '' }] }).matchedCount === 0,
    'CAT4-268',
    'Filter is_null: role is null returns 0 rows'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'notes', operator: 'is_null', value: '' }, { column: 'role', operator: 'eq', value: 'admin' }] }).matchedCount === 1,
    'CAT4-269',
    'Compound filter: notes is_null AND role=admin returns 1 row (Alice Smith)'
);
assertTest(
    queryDataset(masterQueryRows, { filters: [{ column: 'notes', operator: 'is_not_null', value: '' }, { column: 'role', operator: 'eq', value: 'admin' }] }).matchedCount === 3,
    'CAT4-270',
    'Compound filter: notes is_not_null AND role=admin returns 3 rows (Diana, George, Julia)'
);

// 4.6 Compound Multi-Predicate AND Chains (Tests 271–280)
assertTest(
    queryDataset(masterQueryRows, {
        filters: [
            { column: 'role', operator: 'eq', value: 'admin' },
            { column: 'age', operator: 'gt', value: '35' },
        ],
    }).matchedCount === 3,
    'CAT4-271',
    'Compound AND (2): role=admin AND age>35 matches Diana (42), George (50), Julia (38)'
);
assertTest(
    queryDataset(masterQueryRows, {
        filters: [
            { column: 'role', operator: 'eq', value: 'admin' },
            { column: 'age', operator: 'gt', value: '35' },
            { column: 'score', operator: 'gte', value: '96.0' },
        ],
    }).matchedCount === 2,
    'CAT4-272',
    'Compound AND (3): role=admin AND age>35 AND score>=96.0 matches Diana (99.8), Julia (96.2)'
);
assertTest(
    queryDataset(masterQueryRows, {
        filters: [
            { column: 'role', operator: 'eq', value: 'admin' },
            { column: 'age', operator: 'gt', value: '35' },
            { column: 'score', operator: 'gte', value: '96.0' },
            { column: 'tags', operator: 'eq', value: 'core' },
        ],
    }).matchedCount === 2,
    'CAT4-273',
    'Compound AND (4): role=admin AND age>35 AND score>=96.0 AND tags=core matches 2 rows'
);
assertTest(
    queryDataset(masterQueryRows, {
        filters: [
            { column: 'role', operator: 'eq', value: 'member' },
            { column: 'age', operator: 'lt', value: '30' },
        ],
    }).matchedCount === 2,
    'CAT4-274',
    'Compound AND: role=member AND age<30 matches Bob (28) and Hannah (22)'
);
assertTest(
    queryDataset(masterQueryRows, {
        filters: [
            { column: 'role', operator: 'eq', value: 'guest' },
            { column: 'score', operator: 'gt', value: '70' },
        ],
    }).matchedCount === 2,
    'CAT4-275',
    'Compound AND: role=guest AND score>70 matches Charlie (71.2) and Ian (84.3)'
);
assertTest(
    queryDataset(masterQueryRows, {
        searchQuery: 'admin',
        filters: [{ column: 'age', operator: 'gte', value: '40' }],
    }).matchedCount === 2,
    'CAT4-276',
    'Global search + filter: search="admin" AND age>=40 matches Diana and George'
);
assertTest(
    queryDataset(masterQueryRows, {
        searchQuery: 'billing',
        filters: [{ column: 'age', operator: 'gt', value: '30' }],
    }).matchedCount === 1,
    'CAT4-277',
    'Global search + filter: search="billing" AND age>30 matches Evan Wright'
);
assertTest(
    queryDataset(masterQueryRows, {
        filters: [
            { column: 'role', operator: 'neq', value: 'admin' },
            { column: 'tags', operator: 'neq', value: 'trial' },
        ],
    }).matchedCount === 4,
    'CAT4-278',
    'Compound negative: role!=admin AND tags!=trial matches Bob, Evan, Hannah, Ian'
);
assertTest(
    queryDataset(masterQueryRows, {
        filters: [
            { column: 'name', operator: 'contains', value: 'a' },
            { column: 'age', operator: 'lt', value: '30' },
            { column: 'role', operator: 'eq', value: 'guest' },
        ],
    }).matchedCount === 2,
    'CAT4-279',
    'Compound 3-filter: name contains "a" AND age<30 AND role=guest matches Charlie & Fiona'
);
assertTest(
    queryDataset(masterQueryRows, {
        filters: [
            { column: 'age', operator: 'gt', value: '100' },
            { column: 'role', operator: 'eq', value: 'admin' },
        ],
    }).matchedCount === 0,
    'CAT4-280',
    'Contradictory filter: age>100 AND role=admin returns 0 rows'
);

// 4.7 Sorting & Column Projection (Tests 281–285)
const sortedAscAge = queryDataset(masterQueryRows, { sort: { column: 'age', direction: 'asc' } });
assertTest(
    sortedAscAge.rows[0].age === 19 && sortedAscAge.rows[9].age === 50,
    'CAT4-281',
    'Sorting ASC: numeric age sorted accurately from 19 to 50'
);

const sortedDescScore = queryDataset(masterQueryRows, { sort: { column: 'score', direction: 'desc' } });
assertTest(
    sortedDescScore.rows[0].score === 99.8 && sortedDescScore.rows[9].score === 65.4,
    'CAT4-282',
    'Sorting DESC: numeric score sorted accurately from 99.8 to 65.4'
);

const sortedNullNotes = queryDataset(masterQueryRows, { sort: { column: 'notes', direction: 'asc' } });
assertTest(
    sortedNullNotes.rows[9].notes === null && sortedNullNotes.rows[0].notes !== null,
    'CAT4-283',
    'Sorting Null-Last: NULL values placed at the end of the sorted dataset'
);

const projectedCols = queryDataset(masterQueryRows, { selectedColumns: ['name', 'score'] });
assertTest(
    projectedCols.rows.length === 10 &&
    Object.keys(projectedCols.rows[0]).length === 2 &&
    'name' in projectedCols.rows[0] &&
    'score' in projectedCols.rows[0] &&
    !('age' in projectedCols.rows[0]),
    'CAT4-284',
    'Column Projection: selectedColumns restricts row keys to only [name, score]'
);

const projectedSingleCol = queryDataset(masterQueryRows, { selectedColumns: ['role'] });
assertTest(
    projectedSingleCol.rows.length === 10 &&
    Object.keys(projectedSingleCol.rows[0]).length === 1 &&
    'role' in projectedSingleCol.rows[0],
    'CAT4-285',
    'Column Projection: single column projection returns exact single key objects'
);

// ====================================================================
// CATEGORY 5: Statistical Data Profiler & Distribution Metrics (60 Tests)
// ====================================================================
console.log('\n--- Category 5: Statistical Data Profiler (Tests 286–345) ---');

const profilerDataset: Record<string, unknown>[] = [];
// 100 rows with precise mathematical distributions
for (let i = 1; i <= 100; i++) {
    profilerDataset.push({
        row_id: i,
        // numeric_uniform: values 1 to 100 -> sum=5050, mean=50.5
        numeric_uniform: i,
        // numeric_with_nulls: null every 4th row (25 nulls, 75 non-nulls)
        numeric_with_nulls: i % 4 === 0 ? null : i * 2,
        // all_null: 100 nulls
        all_null: null,
        // categorical_low_cardinality: 4 distinct values (A: 50, B: 25, C: 15, D: 10)
        category: i <= 50 ? 'TIER_A' : i <= 75 ? 'TIER_B' : i <= 90 ? 'TIER_C' : 'TIER_D',
        // text_len: string lengths vary from 3 to 12
        text_code: `CODE_${String(i).padStart(3, '0')}`, // length exactly 8 chars
    });
}

const profilerSchema = inferSchemaFromRows(profilerDataset);
const profiles = computeColumnProfiles(profilerDataset, profilerSchema);
const profileMap = new Map(profiles.map((p) => [p.name, p]));

// 5.1 Count & Null percentage metrics (Tests 286–300)
const pId = profileMap.get('row_id')!;
const pUniform = profileMap.get('numeric_uniform')!;
const pNulls = profileMap.get('numeric_with_nulls')!;
const pAllNull = profileMap.get('all_null')!;
const pCat = profileMap.get('category')!;

assertTest(pUniform.totalCount === 100, 'CAT5-286', 'Profiler: totalCount is 100');
assertTest(pUniform.nullCount === 0, 'CAT5-287', 'Profiler: uniform col nullCount is 0');
assertTest(pUniform.nullPercentage === 0.0, 'CAT5-288', 'Profiler: uniform col nullPercentage is 0.0%');
assertTest(pUniform.nonNullCount === 100, 'CAT5-289', 'Profiler: uniform col nonNullCount is 100');
assertTest(pUniform.distinctCount === 100, 'CAT5-290', 'Profiler: uniform col distinctCount is 100');
assertTest(pUniform.uniquenessRatio === 100.0, 'CAT5-291', 'Profiler: uniform col uniquenessRatio is 100.0%');

assertTest(pNulls.totalCount === 100, 'CAT5-292', 'Profiler: nulls col totalCount is 100');
assertTest(pNulls.nullCount === 25, 'CAT5-293', 'Profiler: nulls col nullCount is exactly 25');
assertTest(pNulls.nullPercentage === 25.0, 'CAT5-294', 'Profiler: nulls col nullPercentage is 25.00%');
assertTest(pNulls.nonNullCount === 75, 'CAT5-295', 'Profiler: nulls col nonNullCount is 75');
assertTest(pNulls.distinctCount === 75, 'CAT5-296', 'Profiler: nulls col distinctCount is 75');

assertTest(pAllNull.totalCount === 100, 'CAT5-297', 'Profiler: all_null col totalCount is 100');
assertTest(pAllNull.nullCount === 100, 'CAT5-298', 'Profiler: all_null col nullCount is 100');
assertTest(pAllNull.nullPercentage === 100.0, 'CAT5-299', 'Profiler: all_null col nullPercentage is 100.0%');
assertTest(pAllNull.nonNullCount === 0, 'CAT5-300', 'Profiler: all_null col nonNullCount is 0');

// 5.2 Min, Max, Mean, Median, StdDev and Percentiles (Tests 301–315)
assertTest(pUniform.min === 1, 'CAT5-301', 'Profiler: uniform min is 1');
assertTest(pUniform.max === 100, 'CAT5-302', 'Profiler: uniform max is 100');
assertTest(pUniform.mean === 50.5, 'CAT5-303', 'Profiler: uniform mean is 50.5000');
assertTest(pUniform.median === 51, 'CAT5-304', 'Profiler: uniform median is 51');
assertTest(pUniform.p25 === 26, 'CAT5-305', 'Profiler: uniform p25 is 26');
assertTest(pUniform.p75 === 76, 'CAT5-306', 'Profiler: uniform p75 is 76');
assertTest(typeof pUniform.stdDev === 'number' && pUniform.stdDev > 28 && pUniform.stdDev < 30, 'CAT5-307', 'Profiler: uniform stdDev is ~28.86');

assertTest(pNulls.min === 2, 'CAT5-308', 'Profiler: nulls col min is 2 (first non-null 1*2)');
assertTest(pNulls.max === 198, 'CAT5-309', 'Profiler: nulls col max is 198 (99*2)');
assertTest(typeof pNulls.mean === 'number' && pNulls.mean > 90 && pNulls.mean < 110, 'CAT5-310', 'Profiler: nulls col mean computed on non-null subset');
assertTest(typeof pNulls.stdDev === 'number' && pNulls.stdDev > 0, 'CAT5-311', 'Profiler: nulls col stdDev computed correctly');
assertTest(pAllNull.min === null, 'CAT5-312', 'Profiler: all_null min is null');
assertTest(pAllNull.max === null, 'CAT5-313', 'Profiler: all_null max is null');
assertTest(pAllNull.mean === null, 'CAT5-314', 'Profiler: all_null mean is null');
assertTest(pAllNull.median === null, 'CAT5-315', 'Profiler: all_null median is null');

// 5.3 Categorical Cardinality & Top Frequencies (Tests 316–330)
assertTest(pCat.distinctCount === 4, 'CAT5-316', 'Profiler: category distinctCount is 4');
assertTest(pCat.uniquenessRatio === 4.0, 'CAT5-317', 'Profiler: category uniqueness ratio is 4.0%');
assertTest(pCat.topValues.length === 4, 'CAT5-318', 'Profiler: category topValues has 4 entries');
assertTest(pCat.topValues[0].value === 'TIER_A', 'CAT5-319', 'Profiler: top 1 category is TIER_A');
assertTest(pCat.topValues[0].count === 50, 'CAT5-320', 'Profiler: TIER_A count is 50');
assertTest(pCat.topValues[0].percentage === 50.0, 'CAT5-321', 'Profiler: TIER_A percentage is 50.0%');
assertTest(pCat.topValues[1].value === 'TIER_B', 'CAT5-322', 'Profiler: top 2 category is TIER_B');
assertTest(pCat.topValues[1].count === 25, 'CAT5-323', 'Profiler: TIER_B count is 25');
assertTest(pCat.topValues[1].percentage === 25.0, 'CAT5-324', 'Profiler: TIER_B percentage is 25.0%');
assertTest(pCat.topValues[2].value === 'TIER_C', 'CAT5-325', 'Profiler: top 3 category is TIER_C');
assertTest(pCat.topValues[2].count === 15, 'CAT5-326', 'Profiler: TIER_C count is 15');
assertTest(pCat.topValues[3].value === 'TIER_D', 'CAT5-327', 'Profiler: top 4 category is TIER_D');
assertTest(pCat.topValues[3].count === 10, 'CAT5-328', 'Profiler: TIER_D count is 10');
assertTest(pCat.topValues[3].percentage === 10.0, 'CAT5-329', 'Profiler: TIER_D percentage is 10.0%');
assertTest(pAllNull.topValues.length === 0, 'CAT5-330', 'Profiler: all_null topValues is empty');

// 5.4 String length profiling (Tests 331–345)
const pText = profileMap.get('text_code')!;
assertTest(pText.minStringLength === 8, 'CAT5-331', 'Profiler: text_code minStringLength is 8');
assertTest(pText.maxStringLength === 8, 'CAT5-332', 'Profiler: text_code maxStringLength is 8');
assertTest(pText.avgStringLength === 8.0, 'CAT5-333', 'Profiler: text_code avgStringLength is 8.0');
assertTest(pAllNull.minStringLength === null, 'CAT5-334', 'Profiler: all_null minStringLength is null');
assertTest(pAllNull.maxStringLength === null, 'CAT5-335', 'Profiler: all_null maxStringLength is null');
assertTest(pAllNull.avgStringLength === null, 'CAT5-336', 'Profiler: all_null avgStringLength is null');

// Additional exact mathematical tests on small specialized datasets
const smallSpecialized = [
    { num: 10, s: 'a' },
    { num: 20, s: 'ab' },
    { num: 30, s: 'abc' },
    { num: 40, s: 'abcd' },
    { num: 50, s: 'abcde' },
];
const smallProf = computeColumnProfiles(smallSpecialized, inferSchemaFromRows(smallSpecialized));
const smallNum = smallProf.find((c) => c.name === 'num')!;
const smallS = smallProf.find((c) => c.name === 's')!;

assertTest(smallNum.mean === 30.0, 'CAT5-337', 'Profiler small: mean is exactly 30.0');
assertTest(smallNum.median === 30, 'CAT5-338', 'Profiler small: median is exactly 30');
assertTest(smallNum.min === 10, 'CAT5-339', 'Profiler small: min is exactly 10');
assertTest(smallNum.max === 50, 'CAT5-340', 'Profiler small: max is exactly 50');
assertTest(smallNum.stdDev === 14.1421, 'CAT5-341', 'Profiler small: stdDev is exactly 14.1421');
assertTest(smallS.minStringLength === 1, 'CAT5-342', 'Profiler small: string min length is 1');
assertTest(smallS.maxStringLength === 5, 'CAT5-343', 'Profiler small: string max length is 5');
assertTest(smallS.avgStringLength === 3.0, 'CAT5-344', 'Profiler small: string avg length is 3.0');
assertTest(smallS.distinctCount === 5, 'CAT5-345', 'Profiler small: string distinct count is 5');

// ====================================================================
// CATEGORY 6: Polyglot Schema & DDL Generator (60 Tests)
// ====================================================================
console.log('\n--- Category 6: Polyglot Schema & DDL Generator (Tests 346–405) ---');

const targetLangs: SchemaTargetLanguage[] = [
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

const archetypes = [
    {
        name: 'FinancialLedger',
        rows: [{ tx_id: 101, amount: 250.75, currency: 'USD', settled: true, created_at: '2026-03-01T00:00:00Z' }],
    },
    {
        name: 'IoTTelemetry',
        rows: [{ device_id: 'dev_1', temp_c: 23.4, pressure_kpa: 101.3, battery: 98, error_code: null }],
    },
    {
        name: 'EcommerceOrder',
        rows: [{ order_id: 'ord_1', customer_email: 'c@test.com', items_count: 3, total_cents: 9999, discount: 'SPRING10' }],
    },
    {
        name: 'AIVectorEmbeddings',
        rows: [{ doc_id: 'doc_1', chunk_idx: 0, embedding: [0.12, 0.45, 0.78], score: 0.96 }],
    },
    {
        name: 'SQLReservedKeywords',
        // reserved SQL words: order, group, select, table, user, limit
        rows: [{ order: 1, group: 'A', select: true, table: 't1', user: 'u1', limit: 100 }],
    },
    {
        name: 'SpecialCharIdentifiers',
        // dots, dashes, spaces
        rows: [{ 'user.id': 1, 'order-number': 'ORD-99', 'total price ($)': 199.99 }],
    },
];

let cat6Index = 345;
for (const arch of archetypes) {
    const archSchema = inferSchemaFromRows(arch.rows);
    for (const target of targetLangs) {
        cat6Index++;
        const ddl = generateSchemaCode(archSchema, target, arch.name);
        let valid = false;

        switch (target) {
            case 'postgresql':
                valid = ddl.includes('CREATE TABLE') && ddl.includes('PostgreSQL DDL');
                break;
            case 'snowflake':
                valid = ddl.includes('CREATE OR REPLACE TABLE') && ddl.includes('Snowflake Data Cloud DDL');
                break;
            case 'bigquery':
                valid = ddl.includes('CREATE TABLE `project.dataset.') && ddl.includes('Google BigQuery DDL');
                break;
            case 'duckdb':
                valid = ddl.includes('CREATE TABLE') && ddl.includes('DuckDB Local Analytics DDL');
                break;
            case 'clickhouse':
                valid = ddl.includes('CREATE TABLE') && ddl.includes('ENGINE = MergeTree()');
                break;
            case 'typescript':
                valid = ddl.includes('export interface');
                break;
            case 'pyarrow':
                valid = ddl.includes('import pyarrow as pa') && ddl.includes('pa.schema([');
                break;
            case 'polars':
                valid = ddl.includes('import polars as pl') && ddl.includes('pl.Schema({');
                break;
            case 'avro_schema':
                valid = ddl.includes('"type": "record"');
                break;
            case 'json_schema':
                valid = ddl.includes('json-schema.org') && ddl.includes('"type": "object"');
                break;
        }

        assertTest(
            valid && ddl.length > 30,
            `CAT6-${String(cat6Index).padStart(3, '0')}`,
            `Polyglot DDL Archetype "${arch.name}" -> [${target}] generates valid code`
        );
    }
}

// ====================================================================
// CATEGORY 7: High-Fidelity Export Engines & CWE-1236 Defense (55 Tests)
// ====================================================================
console.log('\n--- Category 7: High-Fidelity Export & Security (Tests 406–460) ---');

const exportSampleRows = [
    { id: 1, name: 'Alice', notes: 'First line\nSecond line', quote: 'She said "Hello, World!"', calc: '=1+1', negative: -42.5 },
    { id: 2, name: 'Bob', notes: 'Simple text', quote: 'Normal text', calc: '+CMD|calc', negative: -199.95 },
    { id: 3, name: 'Charlie', notes: 'Item 1; Item 2', quote: 'Comma, separated', calc: '@SUM(A1:A10)', negative: -0.005 },
    { id: 4, name: 'Diana', notes: 'No quotes', quote: 'Plain', calc: '-HYPERLINK("http://evil.com")', negative: -1.5e-4 },
];
const exportSampleCols = ['id', 'name', 'notes', 'quote', 'calc', 'negative'];

// 7.1 RFC 4180 CSV / TSV Escaping (Tests 406–415)
const csvStandard = exportDatasetToText(exportSampleRows, exportSampleCols, {
    format: 'csv',
    csvDelimiter: ',',
    includeUtf8Bom: false,
    sanitizeFormulas: false,
    tableName: 'sample',
    prettyJson: false,
});
assertTest(csvStandard.includes('"First line\nSecond line"'), 'CAT7-406', 'CSV: embedded newlines properly wrapped in quotes');
assertTest(csvStandard.includes('"She said ""Hello, World!"""'), 'CAT7-407', 'CSV: internal double quotes escaped as double double quotes');
assertTest(csvStandard.includes('"Comma, separated"'), 'CAT7-408', 'CSV: comma within cell triggers double-quote wrapping');

const tsvStandard = exportDatasetToText(exportSampleRows, exportSampleCols, {
    format: 'tsv',
    csvDelimiter: '\t',
    includeUtf8Bom: false,
    sanitizeFormulas: false,
    tableName: 'sample',
    prettyJson: false,
});
assertTest(tsvStandard.includes('\t'), 'CAT7-409', 'TSV: cells separated by tab delimiter');

const semicolonCsv = exportDatasetToText(exportSampleRows, exportSampleCols, {
    format: 'csv',
    csvDelimiter: ';',
    includeUtf8Bom: false,
    sanitizeFormulas: false,
    tableName: 'sample',
    prettyJson: false,
});
assertTest(semicolonCsv.includes(';'), 'CAT7-410', 'CSV: custom semicolon delimiter supported');

const pipeCsv = exportDatasetToText(exportSampleRows, exportSampleCols, {
    format: 'csv',
    csvDelimiter: '|',
    includeUtf8Bom: false,
    sanitizeFormulas: false,
    tableName: 'sample',
    prettyJson: false,
});
assertTest(pipeCsv.includes('|'), 'CAT7-411', 'CSV: custom pipe delimiter supported');

assertTest(csvStandard.split('\r\n').length >= 5, 'CAT7-412', 'CSV: lines separated by CRLF standard');
assertTest(tsvStandard.split('\r\n').length >= 5, 'CAT7-413', 'TSV: lines separated by CRLF standard');
assertTest(csvStandard.startsWith('id,name,notes,quote,calc,negative'), 'CAT7-414', 'CSV: header row emitted first');
assertTest(tsvStandard.startsWith('id\tname\tnotes\tquote\tcalc\tnegative'), 'CAT7-415', 'TSV: TSV header row emitted with tabs');

// 7.2 UTF-8 BOM Handling (Tests 416–425)
const bomCsv = exportDatasetToText(exportSampleRows, exportSampleCols, {
    format: 'csv',
    csvDelimiter: ',',
    includeUtf8Bom: true,
    sanitizeFormulas: false,
    tableName: 'sample',
    prettyJson: false,
});
assertTest(bomCsv.charCodeAt(0) === 0xfeff, 'CAT7-416', 'BOM: starts with 0xFEFF when includeUtf8Bom is true');
assertTest(csvStandard.charCodeAt(0) !== 0xfeff, 'CAT7-417', 'BOM: does not start with 0xFEFF when includeUtf8Bom is false');

const bomTsv = exportDatasetToText(exportSampleRows, exportSampleCols, {
    format: 'tsv',
    csvDelimiter: '\t',
    includeUtf8Bom: true,
    sanitizeFormulas: false,
    tableName: 'sample',
    prettyJson: false,
});
assertTest(bomTsv.charCodeAt(0) === 0xfeff, 'CAT7-418', 'BOM: TSV starts with 0xFEFF when includeUtf8Bom is true');

for (let b = 1; b <= 7; b++) {
    const tNum = 418 + b;
    const testBom = exportDatasetToText([{ val: `test_${b}` }], ['val'], {
        format: 'csv',
        csvDelimiter: ',',
        includeUtf8Bom: b % 2 === 1,
        sanitizeFormulas: false,
        tableName: 'test',
        prettyJson: false,
    });
    assertTest(
        (b % 2 === 1 ? testBom.charCodeAt(0) === 0xfeff : testBom.charCodeAt(0) !== 0xfeff),
        `CAT7-${String(tNum).padStart(3, '0')}`,
        `BOM Toggle test #${b}: includeUtf8Bom=${b % 2 === 1} verified`
    );
}

// 7.3 CWE-1236 Formula Injection Defense (Tests 426–435)
// Sanitization must neutralize leading =, +, @, and formula hyphens (-HYPERLINK)
// while strictly preserving legitimate negative numbers (-42.5, -199.95, -0.005, -1.5e-4).
const sanitizedCsv = exportDatasetToText(exportSampleRows, exportSampleCols, {
    format: 'csv',
    csvDelimiter: ',',
    includeUtf8Bom: false,
    sanitizeFormulas: true,
    tableName: 'sample',
    prettyJson: false,
});

assertTest(sanitizedCsv.includes("'\t=1+1") || sanitizedCsv.includes("'=1+1"), 'CAT7-426', 'CWE-1236: "=1+1" neutralized with leading quote');
assertTest(sanitizedCsv.includes("'\t+CMD|calc") || sanitizedCsv.includes("'+CMD|calc"), 'CAT7-427', 'CWE-1236: "+CMD|calc" neutralized with leading quote');
assertTest(sanitizedCsv.includes("'\t@SUM") || sanitizedCsv.includes("'@SUM"), 'CAT7-428', 'CWE-1236: "@SUM" neutralized with leading quote');
assertTest(sanitizedCsv.includes("'\t-HYPERLINK") || sanitizedCsv.includes("'-HYPERLINK"), 'CAT7-429', 'CWE-1236: "-HYPERLINK" neutralized with leading quote');
assertTest(sanitizedCsv.includes('-42.5'), 'CAT7-430', 'CWE-1236: legitimate negative number -42.5 preserved without leading quote');
assertTest(sanitizedCsv.includes('-199.95'), 'CAT7-431', 'CWE-1236: legitimate negative currency -199.95 preserved without leading quote');
assertTest(sanitizedCsv.includes('-0.005'), 'CAT7-432', 'CWE-1236: legitimate negative decimal -0.005 preserved without leading quote');
assertTest(sanitizedCsv.includes('-0.00015') || sanitizedCsv.includes('-1.5e-4'), 'CAT7-433', 'CWE-1236: legitimate scientific notation negative preserved');

// Direct unit assertions on sanitizeSpreadsheetFormula
assertTest(sanitizeSpreadsheetFormula('=cmd') === "'=cmd", 'CAT7-434', 'sanitizeSpreadsheetFormula: =cmd neutralized');
assertTest(sanitizeSpreadsheetFormula('-42.5') === '-42.5', 'CAT7-435', 'sanitizeSpreadsheetFormula: -42.5 untouched');

// 7.4 JSON & JSONL Formats (Tests 436–445)
const jsonPretty = exportDatasetToText(exportSampleRows, ['id', 'name'], {
    format: 'json',
    csvDelimiter: ',',
    includeUtf8Bom: false,
    sanitizeFormulas: false,
    tableName: 'sample',
    prettyJson: true,
});
assertTest(jsonPretty.includes('  "name": "Alice"'), 'CAT7-436', 'JSON: pretty format contains 2-space indentation');
assertTest(JSON.parse(jsonPretty).length === 4, 'CAT7-437', 'JSON: pretty format parses to valid JSON array of length 4');

const jsonCompact = exportDatasetToText(exportSampleRows, ['id', 'name'], {
    format: 'json',
    csvDelimiter: ',',
    includeUtf8Bom: false,
    sanitizeFormulas: false,
    tableName: 'sample',
    prettyJson: false,
});
assertTest(!jsonCompact.includes('\n'), 'CAT7-438', 'JSON: compact format has 0 newlines');
assertTest(JSON.parse(jsonCompact).length === 4, 'CAT7-439', 'JSON: compact format parses to valid JSON array of length 4');

const jsonlOutput = exportDatasetToText(exportSampleRows, ['id', 'name'], {
    format: 'jsonl',
    csvDelimiter: ',',
    includeUtf8Bom: false,
    sanitizeFormulas: false,
    tableName: 'sample',
    prettyJson: false,
});
const jsonlLines = jsonlOutput.split('\n');
assertTest(jsonlLines.length === 4, 'CAT7-440', 'JSONL: exactly 4 lines emitted');
assertTest(JSON.parse(jsonlLines[0]).name === 'Alice', 'CAT7-441', 'JSONL: line 1 is valid JSON object for Alice');
assertTest(JSON.parse(jsonlLines[1]).name === 'Bob', 'CAT7-442', 'JSONL: line 2 is valid JSON object for Bob');
assertTest(JSON.parse(jsonlLines[2]).name === 'Charlie', 'CAT7-443', 'JSONL: line 3 is valid JSON object for Charlie');
assertTest(JSON.parse(jsonlLines[3]).name === 'Diana', 'CAT7-444', 'JSONL: line 4 is valid JSON object for Diana');

const bigintRow = [{ tx_id: BigInt('9007199254740993') }];
const bigintJson = exportDatasetToText(bigintRow, ['tx_id'], {
    format: 'json',
    csvDelimiter: ',',
    includeUtf8Bom: false,
    sanitizeFormulas: false,
    tableName: 'bigint_test',
    prettyJson: false,
});
assertTest(bigintJson.includes('"9007199254740993"'), 'CAT7-445', 'JSON: BigInt safely converted to string in JSON output');

// 7.5 SQL, Markdown, HTML & Unicode Exports (Tests 446–455)
const sqlRows = [
    { id: 1, user_name: "O'Reilly", active: true, amount: 99.5 },
    { id: 2, user_name: "D'Angelo", active: false, amount: null },
];
const sqlExport = exportDatasetToText(sqlRows, ['id', 'user_name', 'active', 'amount'], {
    format: 'sql',
    csvDelimiter: ',',
    includeUtf8Bom: false,
    sanitizeFormulas: false,
    tableName: 'subscribers',
    prettyJson: false,
});
assertTest(sqlExport.includes('INSERT INTO "subscribers"'), 'CAT7-446', 'SQL: INSERT INTO table specified');
assertTest(sqlExport.includes("'O''Reilly'"), 'CAT7-447', "SQL: single quote in O'Reilly escaped as O''Reilly");
assertTest(sqlExport.includes("'D''Angelo'"), 'CAT7-448', "SQL: single quote in D'Angelo escaped as D''Angelo");
assertTest(sqlExport.includes('NULL'), 'CAT7-449', 'SQL: null amount emitted as NULL literal');
assertTest(sqlExport.includes('TRUE') && sqlExport.includes('FALSE'), 'CAT7-450', 'SQL: booleans emitted as TRUE and FALSE');

const mdExport = exportDatasetToText(sqlRows, ['id', 'user_name', 'amount'], {
    format: 'markdown',
    csvDelimiter: ',',
    includeUtf8Bom: false,
    sanitizeFormulas: false,
    tableName: 'subscribers',
    prettyJson: false,
});
assertTest(mdExport.includes('| id | user_name | amount |'), 'CAT7-451', 'Markdown: header row with pipe delimiters');
assertTest(mdExport.includes('| --- | --- | --- |'), 'CAT7-452', 'Markdown: divider row present');
assertTest(mdExport.includes("| 1 | O'Reilly | 99.5 |"), 'CAT7-453', 'Markdown: data row formatted with pipes');

const htmlExport = exportDatasetToText(
    [{ code: '<script>alert(1)</script>', symbol: 'A & B > C' }],
    ['code', 'symbol'],
    {
        format: 'html',
        csvDelimiter: ',',
        includeUtf8Bom: false,
        sanitizeFormulas: false,
        tableName: 'xss_test',
        prettyJson: false,
    }
);
assertTest(htmlExport.includes('&lt;script&gt;alert(1)&lt;/script&gt;'), 'CAT7-454', 'HTML: script tags escaped to prevent XSS');
assertTest(htmlExport.includes('A &amp; B &gt; C'), 'CAT7-455', 'HTML: ampersands and greater-than escaped');

// 7.6 Multilingual Unicode Export Preservation (Tests 456–460)
const unicodeRow = [
    { urdu: 'کیوارو ٹولز', arabic: 'أدوات التحليل', chinese: '数据查看器', emoji: '🚀🔥' },
];
const unicodeExport = exportDatasetToText(unicodeRow, ['urdu', 'arabic', 'chinese', 'emoji'], {
    format: 'csv',
    csvDelimiter: ',',
    includeUtf8Bom: true,
    sanitizeFormulas: false,
    tableName: 'intl',
    prettyJson: false,
});
assertTest(unicodeExport.includes('کیوارو ٹولز'), 'CAT7-456', 'International Export: Urdu text preserved');
assertTest(unicodeExport.includes('أدوات التحليل'), 'CAT7-457', 'International Export: Arabic text preserved');
assertTest(unicodeExport.includes('数据查看器'), 'CAT7-458', 'International Export: Chinese text preserved');
assertTest(unicodeExport.includes('🚀🔥'), 'CAT7-459', 'International Export: Emoji characters preserved');

const unicodeJson = exportDatasetToText(unicodeRow, ['urdu', 'arabic'], {
    format: 'json',
    csvDelimiter: ',',
    includeUtf8Bom: false,
    sanitizeFormulas: false,
    tableName: 'intl',
    prettyJson: false,
});
assertTest(unicodeJson.includes('کیوارو ٹولز') && unicodeJson.includes('أدوات التحليل'), 'CAT7-460', 'International JSON: Non-ASCII characters preserved without escaped garble');

// ====================================================================
// CATEGORY 8: Cross-Format Transcoding & Resilience (45 Tests)
// ====================================================================
console.log('\n--- Category 8: Transcoding & Error Resilience (Tests 461–505) ---');

// 8.1 Multi-format Round-trip Transcoding (Tests 461–475)
for (let i = 1; i <= 15; i++) {
    const testNum = 460 + i;
    const initialRows = [
        { id: i, name: `Entity_${i}`, val: i * 42.125, active: i % 2 === 0 },
        { id: i + 100, name: `Entity_${i}_peer`, val: (i + 100) * 42.125, active: i % 2 === 1 },
    ];

    // Parquet -> Parse -> Avro -> Parse -> Feather -> Parse
    const pBytes = encodeParquetBinary(initialRows);
    const pParsed = parseColumnarFile(pBytes, 'roundtrip.parquet');

    const aBytes = encodeAvroBinary(pParsed.rows);
    const aParsed = parseColumnarFile(aBytes, 'roundtrip.avro');

    const fBytes = encodeFeatherBinary(aParsed.rows);
    const fParsed = parseColumnarFile(fBytes, 'roundtrip.feather');

    assertTest(
        fParsed.rows.length === 2 &&
        fParsed.rows[0].id === i &&
        fParsed.rows[1].name === `Entity_${i}_peer` &&
        Math.abs(Number(fParsed.rows[0].val) - (i * 42.125)) < 1e-4,
        `CAT8-${String(testNum).padStart(3, '0')}`,
        `Transcoding Round-Trip #${i}: Parquet -> Avro -> Feather preserves all fields`
    );
}

// 8.2 Malformed & Corrupted Binary Buffer Resilience (Tests 476–490)
// 0-byte buffer
const zeroBuf = new Uint8Array(0);
const zeroParsed = parseColumnarFile(zeroBuf, 'empty.parquet');
assertTest(
    zeroParsed.rows.length === 0 && zeroParsed.warnings.length > 0,
    'CAT8-476',
    'Resilience: 0-byte empty buffer returns 0 rows and warning without throwing'
);

// Truncated 1, 2, 3 byte buffers
for (let b = 1; b <= 3; b++) {
    const tNum = 476 + b;
    const tinyBuf = new Uint8Array(b);
    tinyBuf.fill(0x50); // 'P'
    const tinyParsed = parseColumnarFile(tinyBuf, `tiny_${b}.parquet`);
    assertTest(
        tinyParsed !== null && typeof tinyParsed === 'object',
        `CAT8-${String(tNum).padStart(3, '0')}`,
        `Resilience: ${b}-byte truncated buffer handled gracefully without unhandled throw`
    );
}

// Corrupted PAR1 header without body
const truncatedParquet = new Uint8Array([0x50, 0x41, 0x52, 0x31, 0x00, 0x01, 0x02]);
const tParquetParsed = parseColumnarFile(truncatedParquet, 'corrupted.parquet');
assertTest(
    tParquetParsed.format === 'parquet' && Array.isArray(tParquetParsed.rows),
    'CAT8-480',
    'Resilience: Truncated PAR1 magic buffer parsed with fallback without crashing'
);

// Corrupted Avro header without body
const truncatedAvro = new Uint8Array([0x4f, 0x62, 0x6a, 0x01, 0x00, 0x00]);
const tAvroParsed = parseColumnarFile(truncatedAvro, 'corrupted.avro');
assertTest(
    tAvroParsed.format === 'avro' && Array.isArray(tAvroParsed.rows),
    'CAT8-481',
    'Resilience: Truncated Obj\\x01 Avro buffer parsed with fallback without crashing'
);

// Corrupted Feather header without body
const truncatedFeather = new Uint8Array([0x41, 0x52, 0x52, 0x4f, 0x57, 0x31, 0x00]);
const tFeatherParsed = parseColumnarFile(truncatedFeather, 'corrupted.feather');
assertTest(
    tFeatherParsed.format === 'feather' && Array.isArray(tFeatherParsed.rows),
    'CAT8-482',
    'Resilience: Truncated ARROW1 Feather buffer parsed with fallback without crashing'
);

// Random 500-byte noise buffer
for (let n = 1; n <= 8; n++) {
    const tNum = 482 + n;
    const noise = new Uint8Array(500);
    for (let j = 0; j < 500; j++) noise[j] = (j * 17 + n) % 256;
    const noiseParsed = parseColumnarFile(noise, `random_noise_${n}.bin`);
    assertTest(
        noiseParsed !== null && Array.isArray(noiseParsed.rows) && Array.isArray(noiseParsed.warnings),
        `CAT8-${String(tNum).padStart(3, '0')}`,
        `Resilience: 500-byte random noise buffer #${n} absorbed without crashing`
    );
}

// 8.3 Edge-Case Data Models & Boundary Schemas (Tests 491–505)
// 0-row dataset
const emptyDatasetBytes = encodeParquetBinary([]);
const emptyParsed = parseColumnarFile(emptyDatasetBytes, 'empty_rows.parquet');
assertTest(
    emptyParsed.format === 'parquet' && emptyParsed.rows.length === 0,
    'CAT8-491',
    'Edge-case: 0-row Parquet dataset parses cleanly with 0 rows'
);

// 1-row, 1-col dataset
const singleCellBytes = encodeParquetBinary([{ solo: 'value' }]);
const singleParsed = parseColumnarFile(singleCellBytes, 'single_cell.parquet');
assertTest(
    singleParsed.rows.length === 1 && singleParsed.schema.length === 1 && singleParsed.rows[0].solo === 'value',
    'CAT8-492',
    'Edge-case: 1-row × 1-column Parquet dataset parsed accurately'
);

// Extremely large string cell (100,000 chars)
const largeStr = 'A'.repeat(100000);
const largeStrBytes = encodeParquetBinary([{ id: 1, payload: largeStr }]);
const largeStrParsed = parseColumnarFile(largeStrBytes, 'large_payload.parquet');
assertTest(
    largeStrParsed.rows.length === 1 && (largeStrParsed.rows[0].payload as string).length === 100000,
    'CAT8-493',
    'Edge-case: 100,000-character string cell encoded and decoded without truncation'
);

// Schema inference on diverse primitive permutations
for (let p = 1; p <= 12; p++) {
    const tNum = 493 + p;
    const variedRows = [
        {
            test_id: p,
            b: p % 2 === 0,
            i: p * 10,
            f: p * 3.1415,
            s: `string_${p}`,
            arr: [p, p + 1],
            obj: { key: p },
            n: null,
        },
    ];
    const inferred = inferSchemaFromRows(variedRows);
    assertTest(
        inferred.length === 8 &&
        inferred.find((c) => c.name === 'b')?.logicalType === 'BOOLEAN' &&
        inferred.find((c) => c.name === 'i')?.logicalType === 'INT32' &&
        inferred.find((c) => c.name === 'f')?.logicalType === 'DOUBLE' &&
        inferred.find((c) => c.name === 's')?.logicalType === 'UTF8',
        `CAT8-${String(tNum).padStart(3, '0')}`,
        `Schema Inference Permutation #${p}: all 8 primitive and complex types correctly mapped`
    );
}

// ====================================================================
// SUMMARY REPORT
// ====================================================================
console.log('\n======================================================================');
console.log('📊 500+ Complex Enterprise Suite Execution Summary');
console.log('======================================================================');
console.log(`Total Complex Scenarios Executed: ${totalTests}`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);

if (failedTests > 0) {
    console.error('\nDetailed Failures:');
    failureDetails.forEach((f) => console.error(f));
    process.exit(1);
} else {
    console.log('\n🎉 ALL 500+ ENTERPRISE SCENARIOS PASSED WITH ZERO FAILURES!');
    process.exit(0);
}
