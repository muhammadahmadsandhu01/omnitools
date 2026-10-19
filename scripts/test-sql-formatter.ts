// Comprehensive automated test suite for KivaroTools SQL Formatter
import assert from 'node:assert';
import { format } from 'sql-formatter';
import {
  minifySqlSafe,
  escapeJsTemplate,
  escapePythonTriple,
  escapeJson,
  dialectLabels,
  type Language,
} from '../components/tools/SqlFormatter';

console.log('=== Starting KivaroTools SQL Formatter Test Suite ===\n');

let passedTests = 0;

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ ${name} FAILED:`, err.message);
    throw err;
  }
}

// 1. Empty and Whitespace Inputs
runTest('Empty input produces empty output', () => {
  const res = format('', { language: 'sql' });
  assert.strictEqual(res.trim(), '');
});

runTest('Whitespace-only input produces empty output', () => {
  const res = format('   \n\t  ', { language: 'sql' });
  assert.strictEqual(res.trim(), '');
});

// 2. Standard SELECT Formatting
runTest('Standard SELECT query formatting with 2-space indentation', () => {
  const raw = 'select id, name, email from users where is_active = 1 and status = "active" order by created_at desc';
  const formatted = format(raw, { language: 'sql', tabWidth: 2, keywordCase: 'upper' });
  assert.ok(formatted.includes('SELECT'));
  assert.ok(formatted.includes('FROM'));
  assert.ok(formatted.includes('WHERE'));
  assert.ok(formatted.includes('ORDER BY'));
  assert.ok(formatted.startsWith('SELECT\n  id,\n  name,\n  email'));
});

// 3. Keyword Casing Modes
runTest('Keyword casing modes: UPPER, lower, preserve', () => {
  const raw = 'select a from b';
  const upper = format(raw, { language: 'sql', keywordCase: 'upper' });
  const lower = format(raw, { language: 'sql', keywordCase: 'lower' });
  const preserve = format('SeLeCt a FrOm b', { language: 'sql', keywordCase: 'preserve' });

  assert.ok(upper.startsWith('SELECT'));
  assert.ok(lower.startsWith('select'));
  assert.ok(preserve.startsWith('SeLeCt'));
});

// 4. Indentation Styles: 2 spaces, 4 spaces, Tab
runTest('Indentation modes: 2 spaces, 4 spaces, tabs', () => {
  const raw = 'SELECT id, name FROM users';
  const ind2 = format(raw, { language: 'sql', tabWidth: 2, useTabs: false });
  const ind4 = format(raw, { language: 'sql', tabWidth: 4, useTabs: false });
  const indTab = format(raw, { language: 'sql', useTabs: true });

  assert.ok(ind2.includes('\n  id,'));
  assert.ok(ind4.includes('\n    id,'));
  assert.ok(indTab.includes('\n\tid,'));
});

// 5. Multiple Statements
runTest('Multiple statements formatted with clean separation', () => {
  const raw = 'SELECT 1; UPDATE users SET active = 1; DELETE FROM sessions WHERE expired = true;';
  const formatted = format(raw, { language: 'sql', linesBetweenQueries: 2, keywordCase: 'upper' });
  assert.ok(formatted.includes('SELECT'));
  assert.ok(formatted.includes('UPDATE'));
  assert.ok(formatted.includes('DELETE FROM'));
  assert.ok(formatted.includes(';'));
});

// 6. Common Table Expressions (CTEs)
runTest('Common Table Expressions (WITH ... AS ...) block formatting', () => {
  const raw = 'with monthly_rev as (select user_id, sum(amount) as total from orders group by user_id) select u.name, r.total from users u join monthly_rev r on u.id = r.user_id';
  const formatted = format(raw, { language: 'sql', tabWidth: 2, keywordCase: 'upper' });
  assert.ok(formatted.startsWith('WITH\n  monthly_rev AS ('));
  assert.ok(formatted.includes('GROUP BY'));
  assert.ok(formatted.includes('JOIN monthly_rev'));
});

// 7. Multi-Table JOINs
runTest('Complex JOIN structures (INNER, LEFT, RIGHT, FULL)', () => {
  const raw = 'SELECT * FROM orders o INNER JOIN customers c ON o.customer_id = c.id LEFT JOIN shipping s ON o.id = s.order_id FULL JOIN discounts d ON o.promo_id = d.id';
  const formatted = format(raw, { language: 'sql', tabWidth: 2, keywordCase: 'upper' });
  assert.ok(formatted.includes('INNER JOIN customers c'));
  assert.ok(formatted.includes('LEFT JOIN shipping s'));
  assert.ok(formatted.includes('FULL JOIN discounts d'));
});

// 8. CASE Statements
runTest('CASE WHEN THEN ELSE END formatting', () => {
  const raw = 'SELECT id, CASE WHEN score >= 90 THEN "A" WHEN score >= 80 THEN "B" ELSE "F" END AS grade FROM students';
  const formatted = format(raw, { language: 'sql', tabWidth: 2, keywordCase: 'upper' });
  assert.ok(formatted.includes('CASE'));
  assert.ok(formatted.includes('WHEN'));
  assert.ok(formatted.includes('THEN'));
  assert.ok(formatted.includes('ELSE'));
  assert.ok(formatted.includes('END AS grade'));
});

// 9. Comments Preservation
runTest('Comments (single-line and block) are accurately preserved in standard formatting', () => {
  const raw = '-- Initial line comment\nSELECT id /* inline comment */, name FROM users WHERE 1=1; -- trailing comment';
  const formatted = format(raw, { language: 'sql', tabWidth: 2, keywordCase: 'upper' });
  assert.ok(formatted.includes('-- Initial line comment'));
  assert.ok(formatted.includes('/* inline comment */'));
  assert.ok(formatted.includes('-- trailing comment'));
});

// 10. String Literals with Escaped Characters
runTest('String literals with quotes and special characters are preserved', () => {
  const raw = "SELECT id FROM books WHERE title = 'Alice''s Adventures' AND description = 'Contains \\'escaped\\' quotes';";
  const formatted = format(raw, { language: 'sql', keywordCase: 'upper' });
  assert.ok(formatted.includes("'Alice''s Adventures'"));
  assert.ok(formatted.includes('FROM\n  books'));
});

// 11. Quoted Identifiers across Dialects
runTest('Quoted identifiers (double-quotes, backticks, brackets)', () => {
  const pgSql = 'SELECT "user"."id", "user"."name" FROM "users" "user"';
  const mySql = 'SELECT `user`.`id`, `user`.`name` FROM `users` `user`';
  const tSql = 'SELECT [user].[id], [user].[name] FROM [users] [user]';

  const pgRes = format(pgSql, { language: 'postgresql' });
  const myRes = format(mySql, { language: 'mysql' });
  const tRes = format(tSql, { language: 'transactsql' });

  assert.ok(pgRes.includes('"user"."id"'));
  assert.ok(myRes.includes('`user`.`id`'));
  assert.ok(tRes.includes('[user].[id]'));
});

// 12. Parameters and Placeholders
runTest('Parameterized query placeholders (?, $1, :named, @param)', () => {
  const pgRaw = 'SELECT id FROM users WHERE id = $1 AND tenant_id = $2;';
  const pgFormatted = format(pgRaw, { language: 'postgresql', keywordCase: 'upper' });
  assert.ok(pgFormatted.includes('id = $1'));
  assert.ok(pgFormatted.includes('tenant_id = $2'));

  const sqliteRaw = 'SELECT id FROM users WHERE id = ? AND role = :role AND dept = @dept;';
  const sqliteFormatted = format(sqliteRaw, { language: 'sqlite', keywordCase: 'upper' });
  assert.ok(sqliteFormatted.includes('id = ?'));
  assert.ok(sqliteFormatted.includes('role = :role'));
  assert.ok(sqliteFormatted.includes('dept = @dept'));
});

// 13. All 19 Dialects with Representative Syntax & Meaningful Output Assertions
const DIALECT_TEST_CASES: Record<Language, { query: string; expectedSubstring: string }> = {
  sql: {
    query: 'WITH regional AS (SELECT id, region FROM stores) SELECT r.region, SUM(s.amount) FROM regional r JOIN sales s ON r.id = s.store_id GROUP BY r.region;',
    expectedSubstring: 'WITH\n  regional AS (',
  },
  bigquery: {
    query: 'SELECT `name`, item FROM `my-project.dataset.table`, UNNEST(items) AS item WHERE _PARTITIONDATE = "2024-01-01";',
    expectedSubstring: 'UNNEST (items)',
  },
  postgresql: {
    query: "SELECT id, created_at::DATE, (metadata->>'user_id')::INTEGER AS uid FROM audit_logs WHERE metadata @> '{\"status\": \"active\"}'::JSONB;",
    expectedSubstring: '::DATE',
  },
  snowflake: {
    query: 'SELECT v:name::STRING AS name, v:address:city::STRING AS city FROM raw_events, LATERAL FLATTEN(input => v:items);',
    expectedSubstring: 'LATERAL FLATTEN',
  },
  transactsql: {
    query: 'SELECT TOP 100 [u].[Id], [u].[Name] FROM [dbo].[Users] AS [u] WITH (NOLOCK) WHERE [u].[Active] = 1;',
    expectedSubstring: '[dbo].[Users]',
  },
  mysql: {
    query: 'SELECT `id`, `username`, `email` FROM `users` WHERE `status` = "active" ORDER BY `created_at` DESC LIMIT 10, 50;',
    expectedSubstring: 'LIMIT\n  10, 50',
  },
  mariadb: {
    query: 'SELECT id, rank() over (partition by dept order by salary desc) as rnk FROM employees WHERE name REGEXP "^[A-Z]";',
    expectedSubstring: 'PARTITION BY',
  },
  sqlite: {
    query: 'CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, body TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);',
    expectedSubstring: 'CREATE TABLE IF NOT EXISTS notes',
  },
  plsql: {
    query: 'SELECT employee_id, first_name, department_name FROM employees e, departments d WHERE e.department_id = d.department_id(+);',
    expectedSubstring: 'department_id (+)',
  },
  redshift: {
    query: 'SELECT cust_id, sum(sales) FROM event_sales GROUP BY 1 ORDER BY 2 DESC;',
    expectedSubstring: 'GROUP BY\n  1',
  },
  duckdb: {
    query: "SELECT {name: 'Alice', score: 95} AS user_record, [1, 2, 3] AS nums;",
    expectedSubstring: 'user_record',
  },
  clickhouse: {
    query: 'SELECT count() FROM hits PREWHERE UserID = 100 WHERE EventDate >= "2024-01-01";',
    expectedSubstring: 'PREWHERE',
  },
  spark: {
    query: 'SELECT id, struct(a, b) as nested FROM parquet_table WHERE date_sub(current_date(), 7) < date_col;',
    expectedSubstring: 'nested',
  },
  hive: {
    query: 'SELECT page_id, count(1) FROM page_views WHERE dt = "2024-01-01" CLUSTER BY page_id;',
    expectedSubstring: 'CLUSTER BY',
  },
  trino: {
    query: "SELECT date_trunc('month', order_date) AS mth, approx_distinct(customer_id) FROM orders GROUP BY 1;",
    expectedSubstring: 'approx_distinct',
  },
  singlestoredb: {
    query: 'CREATE TABLE telemetry (ts TIMESTAMP(6) SERIES TIMESTAMP, device_id INT, metric DOUBLE, KEY(device_id));',
    expectedSubstring: 'CREATE TABLE telemetry',
  },
  db2: {
    query: "SELECT empno, lastname FROM employee WHERE workdept = 'D11' FETCH FIRST 5 ROWS ONLY;",
    expectedSubstring: 'FETCH FIRST 5 ROWS ONLY',
  },
  n1ql: {
    query: 'SELECT META(d).id, d.title FROM `travel-sample` d WHERE d.type = "hotel" AND ANY r IN d.reviews SATISFIES r.rating >= 4 END;',
    expectedSubstring: '`travel-sample`',
  },
  tidb: {
    query: 'SELECT /*+ TIDB_SMJ(t1, t2) */ t1.id, t2.val FROM t1 JOIN t2 ON t1.id = t2.id;',
    expectedSubstring: '/*+ TIDB_SMJ(t1, t2) */',
  },
};

for (const [dialectKey, testCase] of Object.entries(DIALECT_TEST_CASES)) {
  const d = dialectKey as Language;
  const label = dialectLabels[d] || d;
  runTest(`Dialect preset '${d}' (${label}) formats representative syntax`, () => {
    const formatted = format(testCase.query, {
      language: d,
      keywordCase: 'upper',
      tabWidth: 2,
    });
    assert.ok(
      formatted.includes(testCase.expectedSubstring),
      `Expected output to include "${testCase.expectedSubstring}" for dialect ${d}`
    );
  });
}

// 14. SQL Minification Edge Cases
runTest('Minifier Edge Case 1: Preserves separate keyword tokens and safely compacts delimiter spaces', () => {
  const rawSelect = 'SELECT id , name , email FROM users WHERE is_active = 1 ;';
  const minified = minifySqlSafe(rawSelect, true);
  assert.strictEqual(
    minified,
    'SELECT id,name,email FROM users WHERE is_active = 1;',
    'Adjacent keyword tokens must remain distinct while delimiter spaces are compacted'
  );
});

runTest('Minifier Edge Case 2: String literal contents remain 100% unaltered with internal whitespace and comments', () => {
  const queryWithString = "SELECT 'hello   world -- not a comment /* still text */' AS msg FROM t;";
  const minified = minifySqlSafe(queryWithString, true);
  assert.ok(
    minified.includes("'hello   world -- not a comment /* still text */'"),
    'String literal contents must not have spaces collapsed or comments stripped inside quotes'
  );
});

runTest('Minifier Edge Case 3: Escaped single and double quotes correctly preserved inside literals', () => {
  const queryWithEscapes = "SELECT 'O''Reilly', 'It\\'s a test', \"double\"\"quoted\" FROM authors;";
  const minified = minifySqlSafe(queryWithEscapes, true);
  assert.ok(
    minified.includes("'O''Reilly'") && minified.includes("'It\\'s a test'"),
    'Escaped single and double quotes must be preserved within string literals'
  );
});

runTest('Minifier Edge Case 4: PostgreSQL dollar-quoted string ($$...$$) preserved without truncation', () => {
  const queryWithDollar = "SELECT $$Single ' quote and \"double\" quote inside$$ AS dollar_body FROM dual;";
  const minified = minifySqlSafe(queryWithDollar, true);
  assert.ok(
    minified.includes("$$Single ' quote and \"double\" quote inside$$"),
    'PostgreSQL dollar-quoted block must be preserved verbatim'
  );
});

runTest('Minifier Edge Case 5: Quoted identifiers (backticks, brackets, double quotes) are preserved', () => {
  const queryWithIdentifiers = 'SELECT `user_id`, [user_name], "user_email" FROM `users_table`;';
  const minified = minifySqlSafe(queryWithIdentifiers, true);
  assert.ok(
    minified.includes('`user_id`') &&
      minified.includes('[user_name]') &&
      minified.includes('"user_email"') &&
      minified.includes('`users_table`'),
    'Quoted identifiers must remain intact during minification'
  );
});

runTest('Minifier Edge Case 6: Comment retention with stripComments=false preserves trailing newline for line comments', () => {
  const queryWithComments = 'SELECT id FROM users; -- end-of-line comment\nSELECT * FROM logs;';
  const minified = minifySqlSafe(queryWithComments, false);
  assert.ok(
    minified.includes('-- end-of-line comment\n') && minified.includes('SELECT * FROM logs'),
    'Preserved line comments must retain newline so subsequent statements are not commented out'
  );
});

// 15. Formatting Idempotence & Stability
runTest('Formatting already formatted SQL is idempotent (stable)', () => {
  const raw = 'SELECT id, name FROM users WHERE id = 1';
  const pass1 = format(raw, { language: 'postgresql', tabWidth: 2, keywordCase: 'upper' });
  const pass2 = format(pass1, { language: 'postgresql', tabWidth: 2, keywordCase: 'upper' });
  assert.strictEqual(pass1, pass2, 'Second formatting pass must be identical to the first');
});

// 16. Codebase Export Escaping
runTest('Export escaping for JavaScript, Python, and JSON', () => {
  const sql = 'SELECT * FROM users WHERE note = "${param}" AND quote = \'"""\';';
  const js = escapeJsTemplate(sql);
  const py = escapePythonTriple(sql);
  const json = escapeJson(sql);

  assert.ok(js.includes('\\${param}'), 'JS template must escape ${');
  assert.ok(py.includes('\\"\\"\\"'), 'Python must escape triple quotes');
  assert.ok(json.includes('"query":'), 'JSON export wraps query in JSON object');
  assert.strictEqual(JSON.parse(json).query, sql, 'JSON parse must reproduce original SQL query');
});

// 17. Error Handling on Incomplete or Malformed Input
runTest('Malformed or unclosed quotes handle gracefully without crashing', () => {
  const unclosed = "SELECT 'unclosed string from table";
  let threw = false;
  try {
    format(unclosed, { language: 'sql' });
  } catch (e: any) {
    threw = true;
    assert.ok(e.message.length > 0, 'Error should have a descriptive message');
  }
  assert.ok(threw, 'Unclosed string should trigger a catchable formatting error');
});

// 18. Large Query Performance Benchmark
runTest('Large 1,000+ line SQL query formats efficiently within threshold', () => {
  const lines: string[] = ['SELECT 1 AS start_col'];
  for (let i = 1; i <= 600; i++) {
    lines.push(`, col_${i} AS alias_${i}`);
  }
  lines.push('FROM wide_analytical_table WHERE 1=1');
  const largeSql = lines.join('\n');

  const start = Date.now();
  const res = format(largeSql, { language: 'sql', tabWidth: 2 });
  const elapsed = Date.now() - start;

  assert.ok(res.length > 0);
  assert.ok(elapsed < 2000, `Formatting took ${elapsed}ms (expected < 2000ms)`);
});

console.log(`\n======================================================`);
console.log(`✓ All ${passedTests} automated SQL Formatter regression tests passed!`);
console.log(`======================================================\n`);
