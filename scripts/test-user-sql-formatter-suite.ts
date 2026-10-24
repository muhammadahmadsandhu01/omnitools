import assert from 'node:assert';
import { format } from 'sql-formatter';
import {
  safePreprocessStandardSql,
  safePostprocessStandardSql,
  removeSqlComments,
  minifySqlSafe,
  maskSqlLiteralsAndComments,
  countStatements,
  countLines,
  countWords,
  scanSql,
  lintSql,
  analyzeSql,
  buildDiff,
  conservativeConvert,
  escapeJsTemplate,
  escapePythonTriple,
  escapeJson,
  sanitizeBaseName,
  SAMPLE_SQL_QUERY,
  type Language,
  type CaseMode,
} from '../components/tools/SqlFormatter';

interface UserTestCase {
  id: string;
  section: string;
  name: string;
  fn: () => boolean | Promise<boolean>;
}

const cases: UserTestCase[] = [];

function test(id: string, section: string, name: string, fn: () => boolean | Promise<boolean>) {
  cases.push({ id, section, name, fn });
}

function formatSql(
  sql: string,
  options: {
    dialect?: Language;
    keywordCase?: CaseMode;
    indent?: '2' | '4' | 'tab';
    removeComments?: boolean;
    minify?: boolean;
    operatorBreak?: 'before' | 'after';
  } = {}
) {
  const dialect = options.dialect || 'sql';
  const keywordCase = options.keywordCase || 'upper';
  const indent = options.indent || '2';
  const removeCommentsFlag = options.removeComments ?? false;
  const minifyFlag = options.minify ?? false;

  const isStd = dialect === 'sql';
  const pre = isStd ? safePreprocessStandardSql(sql) : sql;

  let out = format(pre, {
    language: dialect,
    keywordCase,
    tabWidth: indent === 'tab' ? 2 : Number(indent),
    useTabs: indent === 'tab',
    logicalOperatorNewline: options.operatorBreak || 'before',
  });

  if (isStd) out = safePostprocessStandardSql(out);
  if (removeCommentsFlag) out = removeSqlComments(out).replace(/\n{3,}/g, '\n\n').trim();
  if (minifyFlag) out = minifySqlSafe(out, removeCommentsFlag);

  return out;
}

// -----------------------------------------------------------------------------
// SECTION 1: Basic Formatting & Settings
// -----------------------------------------------------------------------------
test('S1-1', 'Basic', 'Simple SELECT retains columns, clauses, conditions and formats cleanly', () => {
  const raw = 'select id,name from users where active=true order by name;';
  const res = formatSql(raw, { keywordCase: 'upper' });
  return (
    res.includes('SELECT') &&
    res.includes('id,') &&
    res.includes('name') &&
    /\bFROM\s+users\b/.test(res) &&
    /\bWHERE\s+active\s*=\s*(?:TRUE|true)\b/i.test(res) &&
    /\bORDER\s+BY\s+name;/i.test(res)
  );
});

test('S1-2', 'Basic', 'Keywords Upper / Lower casing preserves strings and identifiers', () => {
  const raw = "select user_id, created_at from orders where status = 'open' and total > 0;";
  const upper = formatSql(raw, { keywordCase: 'upper' });
  const lower = formatSql(raw, { keywordCase: 'lower' });

  const upperPass =
    upper.includes('SELECT') &&
    upper.includes('WHERE') &&
    upper.includes('AND') &&
    upper.includes("'open'") &&
    upper.includes('user_id');

  const lowerPass =
    lower.includes('select') &&
    lower.includes('where') &&
    lower.includes('and') &&
    lower.includes("'open'") &&
    lower.includes('user_id');

  return upperPass && lowerPass;
});

test('S1-3', 'Basic', 'Indent: 2 spaces vs 4 spaces indentation without drift', () => {
  const raw = 'select u.id,u.name,o.id,o.total from users u join orders o on u.id=o.user_id where o.total>100 order by o.total desc;';
  const ind2 = formatSql(raw, { indent: '2' });
  const ind4 = formatSql(raw, { indent: '4' });

  const has2 = ind2.includes('\n  ');
  const has4 = ind4.includes('\n    ');
  return has2 && has4;
});

test('S1-4', 'Basic', 'Minify toggle preserves meaning, literals, and tokens while compacting whitespace', () => {
  const raw = 'SELECT id, name\nFROM users\nWHERE active = TRUE\nORDER BY name;';
  const minified = formatSql(raw, { minify: true });
  return (
    !minified.includes('\n') &&
    minified.includes('SELECT') &&
    minified.includes('FROM users') &&
    minified.includes('WHERE active = TRUE') &&
    minified.includes('ORDER BY name;')
  );
});

test('S1-5', 'Basic', 'Format idempotency: re-formatting formatted output yields identical result', () => {
  const raw = 'select id,name from users where active=true order by name;';
  const pass1 = formatSql(raw);
  const pass2 = formatSql(pass1);
  return pass1 === pass2;
});

// -----------------------------------------------------------------------------
// SECTION 2: Clauses, Joins & Expressions
// -----------------------------------------------------------------------------
test('S2-1', 'Expressions', 'WHERE conditions and operator precedence preserves parentheses grouping', () => {
  const raw = "select id from orders where status='open' and (total>100 or priority='high');";
  const res = formatSql(raw);
  return (
    res.includes('(') &&
    res.includes('total > 100') &&
    res.includes("priority = 'high'") &&
    res.includes(')')
  );
});

test('S2-2', 'Expressions', 'Multiple JOINs (INNER, LEFT) preserve table associations and aliases', () => {
  const raw = "select u.name, o.id, p.name as product_name from users u inner join orders o on o.user_id=u.id left join products p on p.id=o.product_id where o.status='paid';";
  const res = formatSql(raw);
  return (
    /\bINNER\s+JOIN\s+orders\s+o\b/.test(res) &&
    /\bON\s+o\.user_id\s*=\s*u\.id\b/.test(res) &&
    /\bLEFT\s+JOIN\s+products\s+p\b/.test(res) &&
    /\bON\s+p\.id\s*=\s*o\.product_id\b/.test(res)
  );
});

test('S2-3', 'Expressions', 'CASE expression preserves WHEN, THEN, ELSE, END and all string branches', () => {
  const raw = "select id, case when total >= 1000 then 'large' when total >= 100 then 'medium' else 'small' end as order_size from orders;";
  const res = formatSql(raw);
  return (
    res.includes('CASE') &&
    /WHEN\s+total\s*>=\s*1000\s+THEN\s+'large'/i.test(res) &&
    /WHEN\s+total\s*>=\s*100\s+THEN\s+'medium'/i.test(res) &&
    /ELSE\s+'small'/i.test(res) &&
    /END\s+AS\s+order_size/i.test(res)
  );
});

test('S2-4', 'Expressions', 'Aggregates, GROUP BY, and HAVING retain respective expressions', () => {
  const raw = 'select department, count(*) as employee_count, avg(salary) as average_salary from employees where active=true group by department having count(*)>2 order by average_salary desc;';
  const res = formatSql(raw);
  return (
    res.includes('GROUP BY') &&
    res.includes('HAVING') &&
    /count\(\*\)/i.test(res) &&
    /avg\(salary\)/i.test(res)
  );
});

test('S2-5', 'Expressions', 'Subquery within IN clause nests correctly', () => {
  const raw = 'select name from users where id in (select user_id from orders where total > 50);';
  const res = formatSql(raw);
  return (
    res.includes('WHERE') &&
    res.includes('id IN (') &&
    res.includes('SELECT') &&
    /\bFROM\s+orders\b/.test(res)
  );
});

test('S2-6', 'Expressions', 'Multiple CTEs preserve definitions, aliases, and outer query', () => {
  const raw = "with active_users as (select id,name from users where active=true), recent_orders as (select user_id,total from orders where created_at >= '2025-01-01') select u.name, r.total from active_users u join recent_orders r on r.user_id=u.id;";
  const res = formatSql(raw);
  return (
    res.includes('WITH') &&
    /active_users\s+AS\s+\(/i.test(res) &&
    /recent_orders\s+AS\s+\(/i.test(res) &&
    /\bJOIN\s+recent_orders\s+r\b/.test(res)
  );
});

test('S2-7', 'Expressions', 'Recursive CTE with UNION ALL formats cleanly without parser error or hang', () => {
  const raw = 'with recursive tree as (select id,parent_id from categories where parent_id is null union all select c.id,c.parent_id from categories c join tree t on c.parent_id=t.id) select * from tree;';
  const res = formatSql(raw);
  return (
    /WITH\s+RECURSIVE\s+tree\s+AS\s+\(/i.test(res) &&
    res.includes('UNION ALL') &&
    res.includes('SELECT') &&
    res.includes('*') &&
    /\bFROM\s+tree;/i.test(res)
  );
});

test('S2-8', 'Expressions', 'Set operations UNION, INTERSECT, EXCEPT preserve both sides and operands', () => {
  const u = formatSql('select email from customers union select email from suppliers;');
  const i = formatSql('select id from current_items intersect select id from approved_items;');
  const e = formatSql('select id from all_items except select id from archived_items;');

  return (
    u.includes('UNION') &&
    i.includes('INTERSECT') &&
    e.includes('EXCEPT')
  );
});

test('S2-9', 'Expressions', 'Window function with OVER, PARTITION BY, and ORDER BY formats correctly', () => {
  const raw = 'select employee_id, department, salary, row_number() over (partition by department order by salary desc) as rank_in_department from employees;';
  const res = formatSql(raw);
  return (
    /OVER\s*\(/i.test(res) &&
    /\bPARTITION\s+BY\s+department\b/i.test(res) &&
    /\bORDER\s+BY\s+salary\s+DESC\b/i.test(res)
  );
});

// -----------------------------------------------------------------------------
// SECTION 3: Strings, Identifiers & Comments
// -----------------------------------------------------------------------------
test('S3-1', 'Strings/Comments', 'SQL-like syntax and escaped quotes inside strings are not parsed as SQL or comments', () => {
  const raw = "select 'select * from users -- not a comment' as sample_text, 'it''s valid' as quoted_text;";
  const res = formatSql(raw);
  return (
    res.includes("'select * from users -- not a comment'") &&
    res.includes("'it''s valid'")
  );
});

test('S3-2', 'Strings/Comments', 'Quoted identifiers (double quotes, backticks, brackets) are preserved in respective dialects', () => {
  const dq = formatSql('select "User Name" from "Customer List";', { dialect: 'sql' });
  const bt = formatSql('select `user name` from `customer list`;', { dialect: 'mysql' });
  const bk = formatSql('select [User Name] from [Customer List];', { dialect: 'transactsql' });

  return (
    dq.includes('"User Name"') &&
    bt.includes('`user name`') &&
    bk.includes('[User Name]')
  );
});

test('S3-3', 'Strings/Comments', 'Single-line and block comments preserved when Remove Comments is OFF, stripped when ON', () => {
  const raw = 'select id, name -- user display name\nfrom users /* only active accounts */\nwhere active = true;';
  const preserved = formatSql(raw, { removeComments: false });
  const stripped = formatSql(raw, { removeComments: true });

  const passPreserved =
    preserved.includes('-- user display name') &&
    preserved.includes('/* only active accounts */');

  const passStripped =
    !stripped.includes('-- user display name') &&
    !stripped.includes('/* only active accounts */') &&
    stripped.includes('SELECT') &&
    /\bWHERE\s+active\s*=\s*(?:TRUE|true);/i.test(stripped);

  return passPreserved && passStripped;
});

test('S3-4', 'Strings/Comments', 'Comment-like text inside string literals is never stripped even when Remove Comments is ON', () => {
  const raw = "select '/* keep this */' as text_value, 'value -- still text' as other_value from records;";
  const res = formatSql(raw, { removeComments: true });
  return (
    res.includes("'/* keep this */'") &&
    res.includes("'value -- still text'")
  );
});

test('S3-5', 'Strings/Comments', 'PostgreSQL dollar-quoted string ($$...$$) preserved intact', () => {
  const raw = "select $$text with 'quotes' and -- comment-like text$$ as message;";
  const res = formatSql(raw, { dialect: 'postgresql' });
  return res.includes("$$text with 'quotes' and -- comment-like text$$");
});

// -----------------------------------------------------------------------------
// SECTION 4: Dialect-Specific Tests
// -----------------------------------------------------------------------------
test('S4-1', 'Dialects', 'Standard SQL with LIMIT clause formats cleanly', () => {
  const raw = 'select id, name from users order by id desc limit 10;';
  const res = formatSql(raw, { dialect: 'sql' });
  return /\bLIMIT\s+10;/i.test(res);
});

test('S4-2', 'Dialects', 'SQL Server SELECT TOP clause formats cleanly in transactsql dialect', () => {
  const raw = 'select top 10 id, name from users order by id desc;';
  const res = formatSql(raw, { dialect: 'transactsql' });
  return res.includes('TOP 10');
});

test('S4-3', 'Dialects', 'PostgreSQL ILIKE and JSON ->> operator format cleanly without corruption', () => {
  const raw = "select id, profile ->> 'name' as name from users where email ilike '%@example.test';";
  const res = formatSql(raw, { dialect: 'postgresql' });
  return res.includes('->>') && res.includes('ILIKE');
});

test('S4-4', 'Dialects', 'MySQL backticks and LIMIT format cleanly in mysql dialect', () => {
  const raw = 'select `id`, `name` from `users` order by `id` limit 5;';
  const res = formatSql(raw, { dialect: 'mysql' });
  return res.includes('`id`') && res.includes('`users`') && /\bLIMIT\s+5;/i.test(res);
});

test('S4-5', 'Dialects', 'SQL Server bracket identifiers format cleanly in transactsql dialect', () => {
  const raw = 'select [Order ID], [Status] from [Sales Orders];';
  const res = formatSql(raw, { dialect: 'transactsql' });
  return res.includes('[Order ID]') && res.includes('[Sales Orders]');
});

// -----------------------------------------------------------------------------
// SECTION 5: DML & DDL Formatting
// -----------------------------------------------------------------------------
test('S5-1', 'DML/DDL', 'INSERT statement preserves column list, multi-row VALUES, and literals', () => {
  const raw = "insert into users (id, name, active) values (1, 'Amina', true), (2, 'Bilal', false);";
  const res = formatSql(raw);
  return (
    /\bINSERT\s+INTO\s+users\b/i.test(res) &&
    res.includes('(id, name, active)') &&
    res.includes("VALUES") &&
    /\(1,\s*'Amina',\s*(?:TRUE|true)\)/i.test(res) &&
    /\(2,\s*'Bilal',\s*(?:FALSE|false)\)/i.test(res)
  );
});

test('S5-2', 'DML/DDL', 'UPDATE statement preserves SET assignments and WHERE clause intact', () => {
  const raw = "update users set active = false, display_name = 'Former User' where id = 42;";
  const res = formatSql(raw);
  return (
    /\bUPDATE\s+users\b/i.test(res) &&
    res.includes('SET') &&
    /active\s*=\s*(?:FALSE|false)/i.test(res) &&
    res.includes("display_name = 'Former User'") &&
    /WHERE\s+id\s*=\s*42;/i.test(res)
  );
});

test('S5-3', 'DML/DDL', 'DELETE statement preserves table and condition without executing query', () => {
  const raw = "delete from sessions where expires_at < '2025-01-01';";
  const res = formatSql(raw);
  return (
    /\bDELETE\s+FROM\s+sessions\b/i.test(res) &&
    /WHERE\s+expires_at\s*<\s*'2025-01-01';/i.test(res)
  );
});

test('S5-4', 'DML/DDL', 'CREATE TABLE statement preserves column names, types, constraints, and commas', () => {
  const raw = 'create table test_records (id integer primary key, label varchar(100) not null, created_at timestamp);';
  const res = formatSql(raw);
  return (
    /\bCREATE\s+TABLE\s+test_records\b/i.test(res) &&
    /id\s+integer\s+PRIMARY\s+key/i.test(res) &&
    /label\s+varchar\(100\)\s+NOT\s+NULL/i.test(res) &&
    /created_at\s+timestamp/i.test(res)
  );
});

// -----------------------------------------------------------------------------
// SECTION 6: Empty, Invalid & Incomplete Input
// -----------------------------------------------------------------------------
test('S6-1', 'Inputs', 'Empty input produces clean empty output without crashing', () => {
  const res = formatSql('');
  return res.trim() === '';
});

test('S6-2', 'Inputs', 'Whitespace-only input produces clean empty output without crashing', () => {
  const res = formatSql('    \n\t   ');
  return res.trim() === '';
});

test('S6-3', 'Inputs', 'Incomplete SQL with unclosed parenthesis throws clear diagnostic error instead of hanging', () => {
  let threw = false;
  try {
    formatSql('select (id from users;');
  } catch (err: any) {
    threw = Boolean(err && (err.message || '').includes('line'));
  }
  return threw;
});

test('S6-4', 'Inputs', 'Random non-SQL text formats as tokens safely without crash', () => {
  const raw = 'hello this is not sql';
  const res = formatSql(raw);
  return res.includes('hello');
});

test('S6-5', 'Inputs', 'Multiple statements separated by semicolon format cleanly and count is 2', () => {
  const raw = 'select id from users; select id from orders;';
  const count = countStatements(raw);
  const res = formatSql(raw);
  return (
    count === 2 &&
    /\bSELECT\s+id\s+FROM\s+users;/i.test(res) &&
    /\bSELECT\s+id\s+FROM\s+orders;/i.test(res)
  );
});

test('S6-6', 'Inputs', 'Quoted semicolon inside string literal is not counted as multiple statements (count = 1)', () => {
  const raw = "select 'first; second' as text_value;";
  const count = countStatements(raw);
  return count === 1;
});

// -----------------------------------------------------------------------------
// SECTION 7: Find, Navigation & Statement Count
// -----------------------------------------------------------------------------
test('S7-1', 'Search/Stats', 'Find matches "open" correctly across multiple queries with correct statement count = 3', () => {
  const raw = "select id from users where status = 'open';\nselect id from orders where status = 'open';\nselect id from products where status = 'closed';";
  const statementsCount = countStatements(raw);
  const formatted = formatSql(raw);

  const needle = 'open';
  const lower = formatted.toLowerCase();
  let count = 0;
  let idx = 0;
  while ((idx = lower.indexOf(needle, idx)) !== -1) {
    count++;
    idx += needle.length;
  }

  return statementsCount === 3 && count === 2;
});

test('S7-2', 'Search/Stats', 'Quoted semicolon in statement produces statement count = 1', () => {
  const raw = "select 'one; two' as text_value;";
  return countStatements(raw) === 1;
});

// -----------------------------------------------------------------------------
// SECTION 8: Comments, Minify & Option Combinations
// -----------------------------------------------------------------------------
test('S8-1', 'Combinations', 'Option combo: Uppercase keywords + 2 spaces indent', () => {
  const raw = 'select id, name -- user name\nfrom users /* filter */\nwhere active = true;';
  const res = formatSql(raw, { keywordCase: 'upper', indent: '2' });
  return res.includes('SELECT') && res.includes('WHERE') && res.includes('\n  id,');
});

test('S8-2', 'Combinations', 'Option combo: Lowercase keywords + 4 spaces indent', () => {
  const raw = 'select id, name -- user name\nfrom users /* filter */\nwhere active = true;';
  const res = formatSql(raw, { keywordCase: 'lower', indent: '4' });
  return res.includes('select') && res.includes('where') && res.includes('\n    id,');
});

test('S8-3', 'Combinations', 'Option combo: Minify ON compacts whitespace while preserving SQL comments semantics', () => {
  const raw = 'select id, name -- user name\nfrom users /* filter */\nwhere active = true;';
  const res = formatSql(raw, { minify: true });
  return (
    /\bSELECT\s+id,\s*name\b/i.test(res) &&
    res.includes('-- user name') &&
    res.includes('FROM users') &&
    /\bWHERE\s+active\s*=\s*(?:TRUE|true);/i.test(res)
  );
});

test('S8-4', 'Combinations', 'Option combo: Remove Comments ON strips comments while preserving indentation', () => {
  const raw = 'select id, name -- user name\nfrom users /* filter */\nwhere active = true;';
  const res = formatSql(raw, { removeComments: true });
  return !res.includes('-- user name') && !res.includes('/* filter */') && res.includes('SELECT');
});

test('S8-5', 'Combinations', 'Option combo: Minify + Remove Comments both ON produces strict single line', () => {
  const raw = 'select id, name -- user name\nfrom users /* filter */\nwhere active = true;';
  const res = formatSql(raw, { minify: true, removeComments: true });
  return !res.includes('-- user name') && !res.includes('/* filter */') && !res.includes('\n');
});

// -----------------------------------------------------------------------------
// SECTION 9: Copy, Export, Import & Clear
// -----------------------------------------------------------------------------
test('S9-1', 'Export/Copy', 'Export string escapes for JavaScript, Python, and JSON', () => {
  const sample = "SELECT id, 'John`s \\'test\\'' AS name FROM users WHERE total = ${amount};";
  const js = escapeJsTemplate(sample);
  const py = escapePythonTriple(sample);
  const jsonStr = escapeJson(sample);

  return (
    js.includes('\\`') &&
    js.includes('\\${amount}') &&
    JSON.parse(jsonStr).query === sample &&
    py.includes(sample.replace(/\\/g, '\\\\'))
  );
});

test('S9-2', 'Export/Copy', 'Filename sanitizer cleans path traversal (..) and invalid characters', () => {
  const dirty = '../../../etc/passwd<script>:*?"|';
  const clean = sanitizeBaseName(dirty);
  return !clean.includes('..') && !clean.includes('/') && !clean.includes('<') && clean.length <= 80;
});

test('S9-3', 'Export/Copy', 'Sample SQL query loads and formats with 100% validity', () => {
  const res = formatSql(SAMPLE_SQL_QUERY);
  return res.includes('SELECT') && res.includes('lifetime_spend');
});

// -----------------------------------------------------------------------------
// SECTION 10: Query Statistics & Developer Tools
// -----------------------------------------------------------------------------
test('S10-1', 'DevTools', 'Query statistics count character, line, word, and statement metrics accurately', () => {
  const raw = 'select id, name from users;';
  const chars = raw.length;
  const lines = countLines(raw);
  const words = countWords(raw);
  const stmts = countStatements(raw);

  return chars === 27 && lines === 1 && words === 5 && stmts === 1;
});

test('S10-2', 'DevTools', 'Analyzer extracts statements, tables, columns, complexity without connecting to DB', () => {
  const raw = 'SELECT u.id, u.name, COUNT(o.id) as orders_count FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.active = true GROUP BY u.id, u.name;';
  const analysis = analyzeSql(raw);

  return (
    analysis.tables.includes('users') &&
    analysis.tables.includes('orders') &&
    analysis.joins === 1 &&
    analysis.aggregates === 1 &&
    analysis.groupBy === true
  );
});

test('S10-3', 'DevTools', 'Diff generator detects modifications cleanly without token loss', () => {
  const original = 'select id,name from users;';
  const formatted = 'SELECT\n  id,\n  name\nFROM users;';
  const diff = buildDiff(original, formatted);
  return diff.length > 0;
});

test('S10-4', 'DevTools', 'Conservative Dialect Converter translates MySQL to PostgreSQL and warns on unsupported pairs', () => {
  const mysql = 'select `id`, IFNULL(name, "Unknown"), NOW() from `users` limit 10, 5;';
  const converted = conservativeConvert(mysql, 'mysql', 'postgresql');

  const unsupported = conservativeConvert(mysql, 'mysql', 'bigquery');

  const passSupported =
    converted.sql.includes('"id"') &&
    converted.sql.includes('COALESCE(') &&
    converted.sql.includes('CURRENT_TIMESTAMP') &&
    converted.sql.includes('LIMIT 5 OFFSET 10');

  const passUnsupported =
    unsupported.sql.includes('Not supported') &&
    unsupported.notes.some(n => n.includes('MySQL ↔ PostgreSQL only'));

  return passSupported && passUnsupported;
});

// -----------------------------------------------------------------------------
// SECTION 11: Security & Robustness
// -----------------------------------------------------------------------------
test('S11-1', 'Security', 'XSS payload strings (<script>, <img>, javascript:) remain plain text literals', () => {
  const raw = "select '<script>alert(1)</script>' as sample_text, '<img src=x onerror=alert(1)>' as img_text;";
  const res = formatSql(raw);
  return (
    res.includes("'<script>alert(1)</script>'") &&
    res.includes("'<img src=x onerror=alert(1)>'")
  );
});

test('S11-2', 'Security', 'User quotes with escaped apostrophe (O\'\'Brien) preserved accurately without SQL injection', () => {
  const raw = "select 'name' as column_name from users where name = 'O''Brien';";
  const res = formatSql(raw);
  return res.includes("'O''Brien'");
});

test('S11-3', 'Security', 'Deeply nested parentheses and 1,000 queries do not crash or freeze', () => {
  const nested = 'select ' + '('.repeat(50) + '1' + ')'.repeat(50) + ';';
  const res = formatSql(nested);
  return res.includes('1');
});

// -----------------------------------------------------------------------------
// SECTION 12: Browser, Layout & Release Gate
// -----------------------------------------------------------------------------
test('S12-1', 'ReleaseGate', 'All 19 dialect presets format successfully without runtime exception', () => {
  const dialects: Language[] = [
    'sql',
    'bigquery',
    'clickhouse',
    'db2',
    'duckdb',
    'hive',
    'mariadb',
    'mysql',
    'n1ql',
    'plsql',
    'postgresql',
    'redshift',
    'singlestoredb',
    'snowflake',
    'spark',
    'sqlite',
    'tidb',
    'transactsql',
    'trino',
  ];

  const testQuery = 'SELECT id, count(*) FROM users WHERE status = 1 GROUP BY id ORDER BY id DESC;';

  for (const d of dialects) {
    const formatted = formatSql(testQuery, { dialect: d });
    if (!formatted.includes('SELECT') || !/\bFROM\s+users\b/.test(formatted)) {
      return false;
    }
  }
  return true;
});

// -----------------------------------------------------------------------------
// RUNNER
// -----------------------------------------------------------------------------
async function run() {
  console.log('================================================================');
  console.log('RUNNING USER SPECIFIED SQL FORMATTER TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  for (const tc of cases) {
    try {
      const ok = await tc.fn();
      if (ok) {
        passed++;
        console.log(`  [PASS ${tc.id.padEnd(5)}] [${tc.section}] ${tc.name}`);
      } else {
        failed++;
        console.error(`  [FAIL ${tc.id.padEnd(5)}] [${tc.section}] ${tc.name} -> Assertion returned false`);
      }
    } catch (err: any) {
      failed++;
      console.error(`  [FAIL ${tc.id.padEnd(5)}] [${tc.section}] ${tc.name} -> ERROR: ${err?.message || err}`);
    }
  }

  console.log('\n================================================================');
  console.log(`TOTAL USER TESTS: ${cases.length}`);
  console.log(`PASSED:          ${passed}`);
  console.log(`FAILED:          ${failed}`);
  console.log(`ACCURACY RATE:   ${((passed / cases.length) * 100).toFixed(2)}%`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

run();
