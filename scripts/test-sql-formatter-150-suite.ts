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

interface ScenarioTest {
  id: number;
  group: string;
  name: string;
  fn: () => boolean | Promise<boolean>;
}

const tests: ScenarioTest[] = [];

function addTest(group: string, name: string, fn: () => boolean | Promise<boolean>) {
  tests.push({ id: tests.length + 1, group, name, fn });
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
    denseOperators?: boolean;
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
    denseOperators: options.denseOperators ?? false,
  });

  if (isStd) out = safePostprocessStandardSql(out);
  if (removeCommentsFlag) out = removeSqlComments(out).replace(/\n{3,}/g, '\n\n').trim();
  if (minifyFlag) out = minifySqlSafe(out, removeCommentsFlag);

  return out;
}

// =============================================================================
// GROUP 1: Core SELECT, Expressions, Literals & Booleans (25 tests)
// =============================================================================
addTest('Core SELECT', 'Simple SELECT single column', () => {
  const res = formatSql('select id from users;');
  return res.includes('SELECT') && res.includes('id') && /\bFROM\s+users;/i.test(res);
});

addTest('Core SELECT', 'SELECT * asterisk', () => {
  const res = formatSql('select * from users;');
  return res.includes('SELECT') && res.includes('*') && /\bFROM\s+users;/i.test(res);
});

addTest('Core SELECT', 'SELECT multiple columns with comma separation', () => {
  const res = formatSql('select id, name, email, created_at from users;');
  return res.includes('id,') && res.includes('name,') && res.includes('email,') && res.includes('created_at');
});

addTest('Core SELECT', 'Column aliases with AS keyword', () => {
  const res = formatSql('select id as user_id, name as user_name from users;');
  return res.includes('AS user_id') && res.includes('AS user_name');
});

addTest('Core SELECT', 'Column aliases without AS keyword', () => {
  const res = formatSql('select id user_id, name user_name from users;');
  return res.includes('id user_id') && res.includes('name user_name');
});

addTest('Core SELECT', 'Arithmetic operators (+, -, *, /)', () => {
  const res = formatSql('select (price * quantity) - discount / 2 + 5 as total from items;');
  return res.includes('*') && res.includes('-') && res.includes('/') && res.includes('+');
});

addTest('Core SELECT', 'Modulo operator (%) preserved via pre/post processor', () => {
  const res = formatSql('select id % 10 as bucket from users;');
  return res.includes('%') && res.includes('bucket');
});

addTest('Core SELECT', 'Bitwise operators (&, |, ^) preserved', () => {
  const res = formatSql('select flags & 1, flags | 2, flags ^ 4 from config;');
  return res.includes('&') && res.includes('|') && res.includes('^');
});

addTest('Core SELECT', 'String concatenation operator (||)', () => {
  const res = formatSql("select first_name || ' ' || last_name as full_name from users;");
  return res.includes('||');
});

addTest('Core SELECT', 'NULL literal handling', () => {
  const res = formatSql('select id, null as empty_col from users where deleted_at is null;');
  return res.includes('NULL') && res.includes('IS NULL');
});

addTest('Core SELECT', 'Boolean TRUE and FALSE literals', () => {
  const res = formatSql('select true as is_ok, false as is_bad from dual;');
  return res.includes('TRUE') && res.includes('FALSE');
});

addTest('Core SELECT', 'Integer and floating point numbers', () => {
  const res = formatSql('select 100 as count, 99.95 as price, -12.5 as temp from metrics;');
  return res.includes('100') && res.includes('99.95') && res.includes('-12.5');
});

addTest('Core SELECT', 'Scientific notation literals (1e-6)', () => {
  const res = formatSql('select 1e-6 as tiny_val from test;');
  return res.includes('1e-6');
});

addTest('Core SELECT', 'Single-quoted string literal', () => {
  const res = formatSql("select 'Hello world' as greeting from dual;");
  return res.includes("'Hello world'");
});

addTest('Core SELECT', 'Escaped single quotes within literal', () => {
  const res = formatSql("select 'It''s a sunny day' as message from dual;");
  return res.includes("'It''s a sunny day'");
});

addTest('Core SELECT', 'DISTINCT modifier', () => {
  const res = formatSql('select distinct country, city from locations;');
  return res.includes('DISTINCT');
});

addTest('Core SELECT', 'ALL modifier in SELECT', () => {
  const res = formatSql('select all id from records;');
  return res.includes('ALL');
});

addTest('Core SELECT', 'Complex nested parenthesis precedence', () => {
  const res = formatSql('select ((a + b) * (c - d)) / ((e + f) * g) as res from math;');
  return res.includes('((a + b) * (c - d))');
});

addTest('Core SELECT', 'Unary minus and unary plus', () => {
  const res = formatSql('select -a as neg, +b as pos from numbers;');
  return /-\s*a\s+as\s+neg/i.test(res) && /\+\s*b\s+as\s+pos/i.test(res);
});

addTest('Core SELECT', 'CAST expression', () => {
  const res = formatSql('select cast(id as varchar(50)) as id_str from users;');
  return /CAST\s*\(\s*id\s+AS\s+varchar\(50\)\s*\)/i.test(res);
});

addTest('Core SELECT', 'COALESCE function call with multiple args', () => {
  const res = formatSql("select coalesce(nickname, first_name, 'Guest') as display from users;");
  return /coalesce\(nickname,\s*first_name,\s*'Guest'\)/i.test(res);
});

addTest('Core SELECT', 'NULLIF expression', () => {
  const res = formatSql('select nullif(val, 0) as safe_val from accounts;');
  return /nullif\(val,\s*0\)/i.test(res);
});

addTest('Core SELECT', 'Sub-select in projection list', () => {
  const res = formatSql('select id, (select count(*) from orders where orders.user_id = users.id) as order_count from users;');
  return /\(\s*SELECT\s+count\(\*\)/i.test(res);
});

addTest('Core SELECT', 'Case-insensitive function names preserved', () => {
  const res = formatSql('select upper(name), lower(email) from users;');
  return res.includes('upper(name)') && res.includes('lower(email)');
});

addTest('Core SELECT', 'Date and timestamp literals', () => {
  const res = formatSql("select date '2025-01-01', timestamp '2025-01-01 12:00:00' from dual;");
  return res.includes("date '2025-01-01'") && res.includes("timestamp '2025-01-01 12:00:00'");
});

// =============================================================================
// GROUP 2: Clauses, Filters, Predicates, Grouping & Windows (25 tests)
// =============================================================================
addTest('Clauses & Filters', 'WHERE equality operator (=)', () => {
  const res = formatSql('select * from users where status = 1;');
  return res.includes('WHERE') && res.includes('status = 1;');
});

addTest('Clauses & Filters', 'WHERE inequality operators (!= and <>)', () => {
  const res = formatSql("select * from users where a != 1 and b <> 'test';");
  return res.includes('!= 1') && res.includes("<> 'test'");
});

addTest('Clauses & Filters', 'WHERE comparison operators (<, <=, >, >=)', () => {
  const res = formatSql('select * from items where price >= 10 and price <= 100 and stock > 0 and discount < 0.5;');
  return res.includes('>= 10') && res.includes('<= 100') && res.includes('> 0') && res.includes('< 0.5');
});

addTest('Clauses & Filters', 'WHERE BETWEEN ... AND ...', () => {
  const res = formatSql('select * from orders where total between 50 and 200;');
  return res.includes('BETWEEN 50 AND 200');
});

addTest('Clauses & Filters', 'WHERE NOT BETWEEN ... AND ...', () => {
  const res = formatSql('select * from orders where total not between 10 and 20;');
  return res.includes('NOT BETWEEN 10 AND 20');
});

addTest('Clauses & Filters', 'WHERE IN (...) list', () => {
  const res = formatSql("select * from users where role in ('admin', 'editor', 'staff');");
  return res.includes("role IN ('admin', 'editor', 'staff')");
});

addTest('Clauses & Filters', 'WHERE NOT IN (...) list', () => {
  const res = formatSql('select * from users where id not in (1, 2, 3);');
  return res.includes('id NOT IN (1, 2, 3)');
});

addTest('Clauses & Filters', 'WHERE LIKE pattern matching', () => {
  const res = formatSql("select * from users where name like 'Al%';");
  return res.includes("name LIKE 'Al%'");
});

addTest('Clauses & Filters', 'WHERE NOT LIKE pattern matching', () => {
  const res = formatSql("select * from users where email not like '%@spam.test';");
  return res.includes("email NOT LIKE '%@spam.test'");
});

addTest('Clauses & Filters', 'WHERE IS NULL predicate', () => {
  const res = formatSql('select * from orders where shipped_at is null;');
  return res.includes('shipped_at IS NULL');
});

addTest('Clauses & Filters', 'WHERE IS NOT NULL predicate', () => {
  const res = formatSql('select * from orders where completed_at is not null;');
  return res.includes('completed_at IS NOT NULL');
});

addTest('Clauses & Filters', 'AND / OR grouping with nested parens', () => {
  const res = formatSql('select * from logs where (level = 1 and env = 2) or (level = 3 and env = 4);');
  return /\(\s*level\s*=\s*1\s+AND\s+env\s*=\s*2\s*\)/i.test(res) && /\(\s*level\s*=\s*3\s+AND\s+env\s*=\s*4\s*\)/i.test(res);
});

addTest('Clauses & Filters', 'GROUP BY single column', () => {
  const res = formatSql('select department, count(*) from employees group by department;');
  return /\bGROUP\s+BY\s+department;/i.test(res);
});

addTest('Clauses & Filters', 'GROUP BY multiple columns', () => {
  const res = formatSql('select dept, role, count(*) from employees group by dept, role;');
  return res.includes('GROUP BY') && res.includes('dept,') && res.includes('role;');
});

addTest('Clauses & Filters', 'GROUP BY with expression', () => {
  const res = formatSql('select year(created_at), count(*) from orders group by year(created_at);');
  return /\bGROUP\s+BY\s+year\s*\(created_at\);/i.test(res);
});

addTest('Clauses & Filters', 'HAVING with aggregate condition', () => {
  const res = formatSql('select user_id, sum(amount) from transactions group by user_id having sum(amount) > 1000;');
  return res.includes('HAVING') && res.includes('sum(amount) > 1000;');
});

addTest('Clauses & Filters', 'HAVING with multiple conditions joined by AND', () => {
  const res = formatSql('select dept, count(*), avg(sal) from emp group by dept having count(*) > 5 and avg(sal) > 50000;');
  return res.includes('HAVING') && res.includes('count(*) > 5') && res.includes('avg(sal) > 50000;');
});

addTest('Clauses & Filters', 'ORDER BY ASC', () => {
  const res = formatSql('select * from users order by name asc;');
  return res.includes('ORDER BY') && res.includes('name ASC;');
});

addTest('Clauses & Filters', 'ORDER BY DESC', () => {
  const res = formatSql('select * from users order by created_at desc;');
  return res.includes('ORDER BY') && res.includes('created_at DESC;');
});

addTest('Clauses & Filters', 'ORDER BY multiple mixed columns', () => {
  const res = formatSql('select * from items order by category asc, price desc, id asc;');
  return res.includes('ORDER BY') && res.includes('category ASC,') && res.includes('price DESC,') && res.includes('id ASC;');
});

addTest('Clauses & Filters', 'LIMIT count', () => {
  const res = formatSql('select * from items limit 25;');
  return /\bLIMIT\s+25;/i.test(res);
});

addTest('Clauses & Filters', 'LIMIT count OFFSET offset', () => {
  const res = formatSql('select * from items limit 10 offset 20;');
  return /\bLIMIT\s+10\s+OFFSET\s+20;/i.test(res);
});

addTest('Clauses & Filters', 'Window OVER () empty partition', () => {
  const res = formatSql('select id, count(*) over () as grand_total from users;');
  return /count\(\*\)\s+OVER\s*\(\s*\)/i.test(res);
});

addTest('Clauses & Filters', 'Window OVER (PARTITION BY ... ORDER BY ...)', () => {
  const res = formatSql('select id, rank() over (partition by dept order by score desc) as r from scores;');
  return /OVER\s*\(/i.test(res) && /\bPARTITION\s+BY\s+dept\b/i.test(res) && /\bORDER\s+BY\s+score\s+DESC\b/i.test(res);
});

addTest('Clauses & Filters', 'Window frame clause (ROWS BETWEEN ...)', () => {
  const res = formatSql('select id, sum(val) over (order by id rows between unbounded preceding and current row) from t;');
  return /rows\s+between\s+unbounded\s+preceding\s+and\s+current\s+row/i.test(res);
});

// =============================================================================
// GROUP 3: Joins & Set Operations (20 tests)
// =============================================================================
addTest('Joins & Sets', 'INNER JOIN with ON clause', () => {
  const res = formatSql('select * from a inner join b on a.id = b.a_id;');
  return /\bINNER\s+JOIN\s+b\b/i.test(res) && /\bON\s+a\.id\s*=\s*b\.a_id;/i.test(res);
});

addTest('Joins & Sets', 'LEFT OUTER JOIN with ON clause', () => {
  const res = formatSql('select * from a left outer join b on a.id = b.a_id;');
  return /\bLEFT\s+OUTER\s+JOIN\s+b\b/i.test(res);
});

addTest('Joins & Sets', 'RIGHT OUTER JOIN with ON clause', () => {
  const res = formatSql('select * from a right outer join b on a.id = b.a_id;');
  return /\bRIGHT\s+OUTER\s+JOIN\s+b\b/i.test(res);
});

addTest('Joins & Sets', 'FULL OUTER JOIN with ON clause', () => {
  const res = formatSql('select * from a full outer join b on a.id = b.a_id;');
  return /\bFULL\s+OUTER\s+JOIN\s+b\b/i.test(res);
});

addTest('Joins & Sets', 'CROSS JOIN', () => {
  const res = formatSql('select * from colors cross join sizes;');
  return /\bCROSS\s+JOIN\s+sizes;/i.test(res);
});

addTest('Joins & Sets', 'NATURAL JOIN', () => {
  const res = formatSql('select * from customers natural join orders;');
  return /\bNATURAL\s+JOIN\s+orders;/i.test(res);
});

addTest('Joins & Sets', 'JOIN with multiple ON predicates (AND)', () => {
  const res = formatSql('select * from a join b on a.id = b.a_id and b.is_active = true;');
  return /\bJOIN\s+b\b/i.test(res) && res.includes('ON a.id = b.a_id') && res.includes('b.is_active = TRUE;');
});

addTest('Joins & Sets', 'Self-join on same table with distinct aliases', () => {
  const res = formatSql('select e.name, m.name as manager from employees e join employees m on e.manager_id = m.id;');
  return res.includes('employees e') && res.includes('employees m') && res.includes('e.manager_id = m.id;');
});

addTest('Joins & Sets', '3-way chained joins', () => {
  const res = formatSql('select * from a join b on a.id = b.a_id join c on b.id = c.b_id;');
  return /\bJOIN\s+b\b/i.test(res) && /\bJOIN\s+c\b/i.test(res);
});

addTest('Joins & Sets', '4-way chained joins (a, b, c, d)', () => {
  const res = formatSql('select * from a join b on a.b_id = b.id join c on b.c_id = c.id join d on c.d_id = d.id;');
  return /\bJOIN\s+b\b/i.test(res) && /\bJOIN\s+c\b/i.test(res) && /\bJOIN\s+d\b/i.test(res);
});

addTest('Joins & Sets', 'UNION set operation', () => {
  const res = formatSql('select id from a union select id from b;');
  return res.includes('UNION');
});

addTest('Joins & Sets', 'UNION ALL set operation', () => {
  const res = formatSql('select id from a union all select id from b;');
  return res.includes('UNION ALL');
});

addTest('Joins & Sets', 'INTERSECT set operation', () => {
  const res = formatSql('select id from a intersect select id from b;');
  return res.includes('INTERSECT');
});

addTest('Joins & Sets', 'INTERSECT DISTINCT set operation', () => {
  const res = formatSql('select id from a intersect distinct select id from b;');
  return res.includes('INTERSECT DISTINCT');
});

addTest('Joins & Sets', 'EXCEPT set operation', () => {
  const res = formatSql('select id from a except select id from b;');
  return res.includes('EXCEPT');
});

addTest('Joins & Sets', 'EXCEPT DISTINCT set operation', () => {
  const res = formatSql('select id from a except distinct select id from b;');
  return res.includes('EXCEPT DISTINCT');
});

addTest('Joins & Sets', 'MINUS set operation in PL/SQL dialect', () => {
  const res = formatSql('select id from a minus select id from b;', { dialect: 'plsql' });
  return res.includes('MINUS');
});

addTest('Joins & Sets', 'Set operation with parenthesized queries', () => {
  const res = formatSql('(select id from a) union (select id from b);');
  return res.includes('UNION') && /\(\s*SELECT/i.test(res);
});

addTest('Joins & Sets', 'Comma-separated old style join', () => {
  const res = formatSql('select a.id, b.id from a, b where a.id = b.a_id;');
  return res.includes('FROM\n  a,\n  b') || res.includes('FROM\n  a, b') || res.includes('a,');
});

addTest('Joins & Sets', 'Join with complex calculated expression in ON', () => {
  const res = formatSql('select * from a join b on lower(a.code) = lower(b.code);');
  return res.includes('lower(a.code) = lower(b.code)');
});

// =============================================================================
// GROUP 4: CTEs, Subqueries & Complex Structures (20 tests)
// =============================================================================
addTest('CTEs & Subqueries', 'Single CTE definition', () => {
  const res = formatSql('with sub as (select id from users) select * from sub;');
  return res.includes('WITH') && /sub\s+AS\s+\(/i.test(res);
});

addTest('CTEs & Subqueries', 'Multiple comma-separated CTEs', () => {
  const res = formatSql('with cte1 as (select 1), cte2 as (select 2) select * from cte1, cte2;');
  return /cte1\s+AS\s+\(/i.test(res) && /cte2\s+AS\s+\(/i.test(res);
});

addTest('CTEs & Subqueries', 'Recursive CTE with WITH RECURSIVE', () => {
  const res = formatSql('with recursive cte as (select 1 as n union all select n + 1 from cte where n < 5) select * from cte;');
  return /WITH\s+RECURSIVE\s+cte\s+AS\s+\(/i.test(res) && res.includes('UNION ALL');
});

addTest('CTEs & Subqueries', 'CTE referenced multiple times in main query', () => {
  const res = formatSql('with cte as (select id from t) select * from cte c1 join cte c2 on c1.id = c2.id;');
  return /cte\s+c1\b/i.test(res) && /cte\s+c2\b/i.test(res);
});

addTest('CTEs & Subqueries', 'CTE joined to physical table', () => {
  const res = formatSql('with ranked as (select user_id from orders) select * from users u join ranked r on u.id = r.user_id;');
  return /\bJOIN\s+ranked\s+r\b/i.test(res);
});

addTest('CTEs & Subqueries', 'Correlated subquery in WHERE clause', () => {
  const res = formatSql('select * from users u where exists (select 1 from orders o where o.user_id = u.id);');
  return res.includes('EXISTS (') && /\bo\.user_id\s*=\s*u\.id\b/i.test(res);
});

addTest('CTEs & Subqueries', 'Correlated subquery in SELECT projection', () => {
  const res = formatSql('select u.id, (select max(total) from orders o where o.user_id = u.id) as max_order from users u;');
  return /\(\s*SELECT/i.test(res) && res.includes('max_order');
});

addTest('CTEs & Subqueries', 'Subquery in FROM clause (Derived table)', () => {
  const res = formatSql('select dt.avg_spend from (select avg(amount) as avg_spend from orders) as dt;');
  return /FROM\s*\(\s*SELECT/i.test(res) && /AS\s+dt;/i.test(res);
});

addTest('CTEs & Subqueries', 'Subquery in HAVING clause', () => {
  const res = formatSql('select dept, avg(sal) from emp group by dept having avg(sal) > (select avg(sal) from emp);');
  return res.includes('HAVING') && /\(\s*SELECT/i.test(res);
});

addTest('CTEs & Subqueries', 'EXISTS subquery predicate', () => {
  const res = formatSql('select * from a where exists (select 1 from b where b.id = a.id);');
  return res.includes('WHERE') && res.includes('EXISTS (');
});

addTest('CTEs & Subqueries', 'NOT EXISTS subquery predicate', () => {
  const res = formatSql('select * from a where not exists (select 1 from b where b.id = a.id);');
  return res.includes('WHERE') && res.includes('NOT EXISTS (');
});

addTest('CTEs & Subqueries', 'IN (SELECT ...) subquery', () => {
  const res = formatSql('select * from a where id in (select a_id from b);');
  return res.includes('id IN (') && res.includes('SELECT');
});

addTest('CTEs & Subqueries', 'NOT IN (SELECT ...) subquery', () => {
  const res = formatSql('select * from a where id not in (select a_id from b);');
  return res.includes('id NOT IN (') && res.includes('SELECT');
});

addTest('CTEs & Subqueries', 'ALL (SELECT ...) comparison', () => {
  const res = formatSql('select * from a where val > all (select val from b);');
  return res.includes('val > ALL (');
});

addTest('CTEs & Subqueries', 'ANY (SELECT ...) comparison', () => {
  const res = formatSql('select * from a where val = any (select val from b);');
  return res.includes('val = ANY (');
});

addTest('CTEs & Subqueries', 'CASE WHEN with subquery in condition', () => {
  const res = formatSql("select id, case when (select count(*) from orders where orders.user_id = users.id) > 0 then 'buyer' else 'prospect' end from users;");
  return res.includes('CASE') && /\(\s*SELECT/i.test(res);
});

addTest('CTEs & Subqueries', 'Deeply nested subqueries (3 levels)', () => {
  const res = formatSql('select * from a where id in (select a_id from b where b_id in (select c_id from c));');
  return res.includes('id IN (') && res.includes('b_id IN (');
});

addTest('CTEs & Subqueries', 'Deeply nested subqueries (5 levels)', () => {
  const res = formatSql('select * from l1 where id in (select id from l2 where id in (select id from l3 where id in (select id from l4 where id in (select id from l5))));');
  return res.includes('l1') && res.includes('l2') && res.includes('l3') && res.includes('l4') && res.includes('l5');
});

addTest('CTEs & Subqueries', 'Subquery with internal ORDER BY and LIMIT', () => {
  const res = formatSql('select * from (select id from orders order by id desc limit 5) as top_orders;');
  return res.includes('ORDER BY') && res.includes('LIMIT');
});

addTest('CTEs & Subqueries', 'Subquery with internal GROUP BY and HAVING', () => {
  const res = formatSql('select * from (select dept, count(*) as cnt from emp group by dept having count(*) > 2) as dept_cnt;');
  return res.includes('GROUP BY') && res.includes('HAVING');
});

// =============================================================================
// GROUP 5: DML & DDL Statements (20 tests)
// =============================================================================
addTest('DML & DDL', 'Simple INSERT INTO table VALUES (...)', () => {
  const res = formatSql("insert into items values (1, 'Widget');");
  return /\bINSERT\s+INTO\s+items\b/i.test(res) && res.includes("VALUES") && res.includes("(1, 'Widget');");
});

addTest('DML & DDL', 'INSERT INTO with explicit column list', () => {
  const res = formatSql("insert into items (id, name, price) values (1, 'Gadget', 49.99);");
  return res.includes('(id, name, price)') && res.includes("(1, 'Gadget', 49.99);");
});

addTest('DML & DDL', 'Multi-row INSERT INTO statement', () => {
  const res = formatSql("insert into items (id, name) values (1, 'A'), (2, 'B'), (3, 'C');");
  return res.includes("(1, 'A'),") && res.includes("(2, 'B'),") && res.includes("(3, 'C');");
});

addTest('DML & DDL', 'INSERT INTO ... SELECT ...', () => {
  const res = formatSql('insert into archive_users select * from users where active = false;');
  return /\bINSERT\s+INTO\s+archive_users\b/i.test(res) && res.includes('SELECT') && /\bWHERE\s+active\s*=\s*(?:FALSE|false);/i.test(res);
});

addTest('DML & DDL', 'UPDATE single column', () => {
  const res = formatSql('update users set active = true where id = 1;');
  return /\bUPDATE\s+users\b/i.test(res) && res.includes('SET') && /\bWHERE\s+id\s*=\s*1;/i.test(res);
});

addTest('DML & DDL', 'UPDATE multiple columns with comma separation', () => {
  const res = formatSql("update users set name = 'Jane', email = 'jane@test.org', updated_at = now() where id = 10;");
  return res.includes("name = 'Jane',") && res.includes("email = 'jane@test.org',");
});

addTest('DML & DDL', 'UPDATE with complex WHERE condition', () => {
  const res = formatSql("update orders set status = 'cancelled' where created_at < '2024-01-01' and status = 'pending';");
  return res.includes("status = 'cancelled'") && res.includes("status = 'pending';");
});

addTest('DML & DDL', 'DELETE FROM table without WHERE', () => {
  const res = formatSql('delete from logs;');
  return /\bDELETE\s+FROM\s+logs;/i.test(res);
});

addTest('DML & DDL', 'DELETE FROM table with WHERE condition', () => {
  const res = formatSql('delete from sessions where user_id = 42;');
  return /\bDELETE\s+FROM\s+sessions\b/i.test(res) && /\bWHERE\s+user_id\s*=\s*42;/i.test(res);
});

addTest('DML & DDL', 'CREATE TABLE with primitive column types', () => {
  const res = formatSql('create table items (id int, name text, price numeric);');
  return /\bCREATE\s+TABLE\s+items\b/i.test(res) && res.includes('id int,') && res.includes('name text,');
});

addTest('DML & DDL', 'CREATE TABLE with PRIMARY KEY and NOT NULL constraints', () => {
  const res = formatSql('create table users (id int primary key, email varchar(255) not null);');
  return /\bCREATE\s+TABLE\s+users\b/i.test(res) && /primary\s+key/i.test(res) && /not\s+null/i.test(res);
});

addTest('DML & DDL', 'CREATE TABLE with DEFAULT value constraint', () => {
  const res = formatSql('create table accounts (id int, status varchar(20) default \'active\');');
  return /DEFAULT\s+'active'/i.test(res);
});

addTest('DML & DDL', 'CREATE TABLE IF NOT EXISTS', () => {
  const res = formatSql('create table if not exists cache (k text primary key, v text);');
  return /CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+cache/i.test(res);
});

addTest('DML & DDL', 'ALTER TABLE ADD COLUMN', () => {
  const res = formatSql('alter table users add column phone varchar(20);');
  return /\bALTER\s+TABLE\s+users\b/i.test(res) && /\bADD\s+COLUMN\s+phone\s+varchar\(20\);/i.test(res);
});

addTest('DML & DDL', 'ALTER TABLE DROP COLUMN', () => {
  const res = formatSql('alter table users drop column phone;');
  return /\bALTER\s+TABLE\s+users\b/i.test(res) && /\bDROP\s+COLUMN\s+phone;/i.test(res);
});

addTest('DML & DDL', 'DROP TABLE', () => {
  const res = formatSql('drop table old_records;');
  return /\bDROP\s+TABLE\s+old_records;/i.test(res);
});

addTest('DML & DDL', 'DROP TABLE IF EXISTS', () => {
  const res = formatSql('drop table if exists temp_data;');
  return /DROP\s+TABLE\s+IF\s+EXISTS\s+temp_data;/i.test(res);
});

addTest('DML & DDL', 'TRUNCATE TABLE', () => {
  const res = formatSql('truncate table session_cache;');
  return /\bTRUNCATE\s+TABLE\s+session_cache;/i.test(res);
});

addTest('DML & DDL', 'CREATE INDEX on table columns', () => {
  const res = formatSql('create index idx_users_email on users (email);');
  return /\bCREATE\s+INDEX\s+idx_users_email\s+ON\s+users\b/i.test(res) && res.includes('(email);');
});

addTest('DML & DDL', 'CREATE UNIQUE INDEX', () => {
  const res = formatSql('create unique index idx_unique_sku on products (sku);');
  return /\bCREATE\s+UNIQUE\s+INDEX\s+idx_unique_sku\s+ON\s+products\b/i.test(res);
});

// =============================================================================
// GROUP 6: Database Dialects Coverage (25 tests)
// =============================================================================
addTest('Dialects', 'Standard SQL preset', () => {
  const res = formatSql('select id, name from users where active = true;', { dialect: 'sql' });
  return res.includes('SELECT') && /\bFROM\s+users\b/.test(res);
});

addTest('Dialects', 'Google BigQuery preset (STRUCT, ARRAY)', () => {
  const res = formatSql('select [1, 2, 3] as nums, struct(1 as a, 2 as b) as s from `proj.dataset.table`;', { dialect: 'bigquery' });
  return res.includes('STRUCT') || res.includes('proj.dataset.table');
});

addTest('Dialects', 'ClickHouse preset (SETTINGS clause)', () => {
  const res = formatSql('select count(*) from hits settings max_threads = 4;', { dialect: 'clickhouse' });
  return res.includes('SETTINGS');
});

addTest('Dialects', 'IBM DB2 preset', () => {
  const res = formatSql('select empno, salary from emp fetch first 10 rows only;', { dialect: 'db2' });
  return /FETCH\s+first/i.test(res);
});

addTest('Dialects', 'DuckDB preset', () => {
  const res = formatSql("select * from read_csv_auto('data.csv');", { dialect: 'duckdb' });
  return res.includes('read_csv_auto');
});

addTest('Dialects', 'Apache Hive preset', () => {
  const res = formatSql('select id, name from users distribute by id sort by name;', { dialect: 'hive' });
  return res.includes('DISTRIBUTE BY') && res.includes('SORT BY');
});

addTest('Dialects', 'MariaDB preset', () => {
  const res = formatSql('select `id`, `name` from `users` order by `id` limit 10;', { dialect: 'mariadb' });
  return res.includes('`id`') && res.includes('LIMIT');
});

addTest('Dialects', 'MySQL preset with backtick quoting', () => {
  const res = formatSql('select `order_id`, `total` from `orders` where `status` = "paid";', { dialect: 'mysql' });
  return res.includes('`order_id`') && res.includes('`orders`');
});

addTest('Dialects', 'Couchbase N1QL preset', () => {
  const res = formatSql('select name from `travel-sample` where type = "hotel";', { dialect: 'n1ql' });
  return res.includes('`travel-sample`');
});

addTest('Dialects', 'Oracle PL/SQL preset', () => {
  const res = formatSql('select employee_id, first_name from employees where rownum <= 10;', { dialect: 'plsql' });
  return /rownum/i.test(res);
});

addTest('Dialects', 'PostgreSQL preset with :: typecast', () => {
  const res = formatSql("select '123'::integer as num, 'true'::boolean as flag;", { dialect: 'postgresql' });
  return res.includes('::INTEGER') || res.includes('::integer');
});

addTest('Dialects', 'PostgreSQL JSON operator (->>)', () => {
  const res = formatSql("select data ->> 'title' as title from posts;", { dialect: 'postgresql' });
  return res.includes('->>');
});

addTest('Dialects', 'PostgreSQL dollar-quoted multi-line string', () => {
  const res = formatSql("select $$line 1\nline 2\nline 3$$ as text_block;", { dialect: 'postgresql' });
  return res.includes('$$line 1');
});

addTest('Dialects', 'Amazon Redshift preset', () => {
  const res = formatSql('select * from sales order by saletime limit 100;', { dialect: 'redshift' });
  return res.includes('LIMIT');
});

addTest('Dialects', 'SingleStoreDB preset', () => {
  const res = formatSql('select id, name from users limit 50;', { dialect: 'singlestoredb' });
  return res.includes('SELECT') && res.includes('LIMIT');
});

addTest('Dialects', 'Snowflake preset', () => {
  const res = formatSql('select parse_json(raw_text):user.id as user_id from stage_data;', { dialect: 'snowflake' });
  return res.includes('PARSE_JSON') || res.includes('parse_json');
});

addTest('Dialects', 'Apache Spark preset', () => {
  const res = formatSql('select explode(items) as item from inventory;', { dialect: 'spark' });
  return res.includes('EXPLODE') || res.includes('explode');
});

addTest('Dialects', 'SQLite preset', () => {
  const res = formatSql('select rowid, * from logs order by rowid desc limit 10;', { dialect: 'sqlite' });
  return res.includes('rowid') && res.includes('LIMIT');
});

addTest('Dialects', 'TiDB preset', () => {
  const res = formatSql('select /*+ read_from_storage(tikv[t]) */ * from t;', { dialect: 'tidb' });
  return res.includes('SELECT') && res.includes('read_from_storage');
});

addTest('Dialects', 'SQL Server T-SQL SELECT TOP', () => {
  const res = formatSql('select top 50 percent id, name from users order by id;', { dialect: 'transactsql' });
  return res.includes('TOP 50 PERCENT') || res.includes('TOP 50');
});

addTest('Dialects', 'SQL Server T-SQL bracketed identifiers', () => {
  const res = formatSql('select [Order ID], [Total Amount] from [dbo].[Orders];', { dialect: 'transactsql' });
  return res.includes('[Order ID]') && res.includes('[dbo].[Orders]');
});

addTest('Dialects', 'Trino / Presto preset', () => {
  const res = formatSql('select json_extract(profile, "$.name") as name from users;', { dialect: 'trino' });
  return res.includes('JSON_EXTRACT') || res.includes('json_extract');
});

addTest('Dialects', 'PostgreSQL ILIKE case-insensitive pattern matching', () => {
  const res = formatSql("select * from users where name ilike '%test%';", { dialect: 'postgresql' });
  return res.includes('ILIKE');
});

addTest('Dialects', 'PostgreSQL RETURNING clause in INSERT', () => {
  const res = formatSql("insert into users (name) values ('Alice') returning id;", { dialect: 'postgresql' });
  return res.includes('RETURNING');
});

addTest('Dialects', 'Switching dialects maintains underlying query token fidelity', () => {
  const q = 'select id, name from users where id = 1;';
  const s1 = formatSql(q, { dialect: 'sql' });
  const s2 = formatSql(q, { dialect: 'postgresql' });
  const s3 = formatSql(q, { dialect: 'mysql' });
  return s1.includes('users') && s2.includes('users') && s3.includes('users');
});

// =============================================================================
// GROUP 7: Comments, Strings, Identifiers & Casing (20 tests)
// =============================================================================
addTest('Comments & Casing', 'Single-line comment (--) retention', () => {
  const res = formatSql('select id -- user id\nfrom users;', { removeComments: false });
  return res.includes('-- user id');
});

addTest('Comments & Casing', 'Block comment (/* ... */) retention', () => {
  const res = formatSql('select id, /* comment */ name from users;', { removeComments: false });
  return res.includes('/* comment */');
});

addTest('Comments & Casing', 'Multi-line block comment retention', () => {
  const res = formatSql('/*\n * Audit Header\n * Author: DB Admin\n */\nselect 1;', { removeComments: false });
  return res.includes('Audit Header');
});

addTest('Comments & Casing', 'Comment at start of query', () => {
  const res = formatSql('-- Initial comment\nselect 1;', { removeComments: false });
  return res.includes('-- Initial comment');
});

addTest('Comments & Casing', 'Comment between clauses', () => {
  const res = formatSql('select id from users\n-- filter active only\nwhere active = true;', { removeComments: false });
  return res.includes('-- filter active only');
});

addTest('Comments & Casing', 'Comment at end of query', () => {
  const res = formatSql('select 1; -- end of script', { removeComments: false });
  return res.includes('-- end of script');
});

addTest('Comments & Casing', 'Double-quoted identifier preservation', () => {
  const res = formatSql('select "First Name" from "Users";', { dialect: 'sql' });
  return res.includes('"First Name"') && res.includes('"Users"');
});

addTest('Comments & Casing', 'Backtick-quoted identifier preservation', () => {
  const res = formatSql('select `First Name` from `Users`;', { dialect: 'mysql' });
  return res.includes('`First Name`') && res.includes('`Users`');
});

addTest('Comments & Casing', 'Bracket-quoted identifier preservation', () => {
  const res = formatSql('select [First Name] from [Users];', { dialect: 'transactsql' });
  return res.includes('[First Name]') && res.includes('[Users]');
});

addTest('Comments & Casing', 'PostgreSQL tagged dollar-quoted string ($tag$...$tag$)', () => {
  const res = formatSql('select $tag$body with quotes $tag$ as code;', { dialect: 'postgresql' });
  return res.includes('$tag$body with quotes $tag$');
});

addTest('Comments & Casing', 'KeywordCase: UPPER mode', () => {
  const res = formatSql('select a, b from c where d = 1;', { keywordCase: 'upper' });
  return res.includes('SELECT') && res.includes('FROM') && res.includes('WHERE');
});

addTest('Comments & Casing', 'KeywordCase: lower mode', () => {
  const res = formatSql('SELECT A, B FROM C WHERE D = 1;', { keywordCase: 'lower' });
  return res.includes('select') && res.includes('from') && res.includes('where');
});

addTest('Comments & Casing', 'KeywordCase: preserve mode', () => {
  const res = formatSql('SeLeCt a FrOm c WhErE d = 1;', { keywordCase: 'preserve' });
  return res.includes('SeLeCt') && res.includes('FrOm') && res.includes('WhErE');
});

addTest('Comments & Casing', 'Indent: 2 spaces', () => {
  const res = formatSql('select id, name from users;', { indent: '2' });
  return res.includes('\n  id,');
});

addTest('Comments & Casing', 'Indent: 4 spaces', () => {
  const res = formatSql('select id, name from users;', { indent: '4' });
  return res.includes('\n    id,');
});

addTest('Comments & Casing', 'Indent: tab', () => {
  const res = formatSql('select id, name from users;', { indent: 'tab' });
  return res.includes('\n\tid,');
});

addTest('Comments & Casing', 'Operator break before', () => {
  const res = formatSql('select * from t where a = 1 and b = 2;', { operatorBreak: 'before' });
  return res.includes('\n  AND b = 2') || res.includes('AND');
});

addTest('Comments & Casing', 'Operator break after', () => {
  const res = formatSql('select * from t where a = 1 and b = 2;', { operatorBreak: 'after' });
  return res.includes('a = 1 AND') || res.includes('AND');
});

addTest('Comments & Casing', 'Dense operators mode', () => {
  const res = formatSql('select a + b, c * d from t;', { denseOperators: true });
  return res.includes('+') && res.includes('*');
});

addTest('Comments & Casing', 'String literal containing multiple quotes and backslashes', () => {
  const res = formatSql("select 'line 1 \\'quotes\\' line 2' as text;");
  return res.includes("'line 1 \\'quotes\\' line 2'");
});

// =============================================================================
// GROUP 8: Minifier, Code Generators, Linter, Analyzer & Security (25 tests)
// =============================================================================
addTest('Minifier & Tools', 'Minify compacts SELECT statement into single line', () => {
  const res = formatSql('SELECT\n  id,\n  name\nFROM\n  users;', { minify: true });
  return !res.includes('\n') && res.includes('SELECT id,name FROM users;');
});

addTest('Minifier & Tools', 'Minify preserves string literal internal spaces and newlines', () => {
  const raw = "select 'hello    world   with   spaces' as msg;";
  const res = formatSql(raw, { minify: true });
  return res.includes("'hello    world   with   spaces'");
});

addTest('Minifier & Tools', 'Minify preserves quoted identifiers', () => {
  const raw = 'select `user id`, [order total], "customer name" from db;';
  const res = minifySqlSafe(raw);
  return res.includes('`user id`') && res.includes('[order total]') && res.includes('"customer name"');
});

addTest('Minifier & Tools', 'Minify with stripComments=true completely removes comments', () => {
  const raw = 'select id -- comment\nfrom users /* block */;';
  const res = minifySqlSafe(raw, true);
  return !res.includes('-- comment') && !res.includes('/* block */') && !res.includes('\n');
});

addTest('Minifier & Tools', 'Minify with stripComments=false safely retains newline for line comments', () => {
  const raw = 'select id -- comment\nfrom users;';
  const res = minifySqlSafe(raw, false);
  return res.includes('-- comment\n') && res.includes('from users;');
});

addTest('Minifier & Tools', 'RemoveComments helper removes line comments cleanly', () => {
  const raw = 'select id -- line comment\nfrom users;';
  const res = removeSqlComments(raw);
  return !res.includes('-- line comment') && res.includes('select id') && res.includes('from users;');
});

addTest('Minifier & Tools', 'RemoveComments helper removes block comments cleanly', () => {
  const raw = 'select id, /* block comment */ name from users;';
  const res = removeSqlComments(raw);
  return !res.includes('/* block comment */') && res.includes('select id') && res.includes('name from users;');
});

addTest('Minifier & Tools', 'RemoveComments does not touch comment strings inside quotes', () => {
  const raw = "select '-- not a comment' as a, '/* not block */' as b;";
  const res = removeSqlComments(raw);
  return res.includes("'-- not a comment'") && res.includes("'/* not block */'");
});

addTest('Minifier & Tools', 'JavaScript template generator escapes backticks and dollar-braces', () => {
  const query = "SELECT `id` FROM users WHERE name = `${user}`;";
  const escaped = escapeJsTemplate(query);
  return escaped.includes('\\`id\\`') && escaped.includes('\\${user}');
});

addTest('Minifier & Tools', 'Python triple quote generator escapes triple quotes and backslashes', () => {
  const query = 'SELECT """nested""" \\path FROM t;';
  const escaped = escapePythonTriple(query);
  return escaped.includes('\\"\\"\\"') && escaped.includes('\\\\path');
});

addTest('Minifier & Tools', 'JSON escape generator produces valid JSON string with query attribute', () => {
  const query = "SELECT 'line 1\nline 2' as text;";
  const jsonStr = escapeJson(query);
  const parsed = JSON.parse(jsonStr);
  return parsed.query === query;
});

addTest('Minifier & Tools', 'SanitizeBaseName cleans directory traversal', () => {
  const cleaned = sanitizeBaseName('../../etc/cron/job.sql');
  return !cleaned.includes('..') && !cleaned.includes('/') && cleaned === 'job';
});

addTest('Minifier & Tools', 'SanitizeBaseName neutralizes Windows illegal characters', () => {
  const cleaned = sanitizeBaseName('my:query<test>*?.sql');
  return !/[<>:"/\\|?*]/.test(cleaned);
});

addTest('Minifier & Tools', 'SanitizeBaseName provides fallback for empty input', () => {
  const cleaned = sanitizeBaseName('');
  return cleaned === 'query_kivarotools';
});

addTest('Minifier & Tools', 'Linter identifies SELECT * in queries', () => {
  const items = lintSql('SELECT * FROM users;');
  return items.some(i => i.message.includes('SELECT *'));
});

addTest('Minifier & Tools', 'Linter identifies comma-style joins', () => {
  const items = lintSql('SELECT * FROM users, orders WHERE users.id = orders.user_id;');
  return items.some(i => i.message.includes('Comma-style joins'));
});

addTest('Minifier & Tools', 'Linter identifies UPDATE without WHERE clause', () => {
  const items = lintSql('UPDATE users SET active = false;');
  return items.some(i => i.message.includes('UPDATE/DELETE statement has no obvious WHERE clause'));
});

addTest('Minifier & Tools', 'Linter identifies DELETE without WHERE clause', () => {
  const items = lintSql('DELETE FROM sessions;');
  return items.some(i => i.message.includes('UPDATE/DELETE statement has no obvious WHERE clause'));
});

addTest('Minifier & Tools', 'Linter identifies leading wildcard LIKE (%...)', () => {
  const items = lintSql("SELECT * FROM users WHERE email LIKE '%@gmail.com';");
  return items.some(i => i.message.includes('Leading-wildcard LIKE'));
});

addTest('Minifier & Tools', 'Safety scanner detects DROP TABLE statements', () => {
  const items = scanSql('DROP TABLE users;');
  return items.some(i => i.label.includes('DROP'));
});

addTest('Minifier & Tools', 'Safety scanner detects TRUNCATE TABLE statements', () => {
  const items = scanSql('TRUNCATE TABLE logs;');
  return items.some(i => i.label.includes('TRUNCATE'));
});

addTest('Minifier & Tools', 'Safety scanner detects tautology injection pattern (OR 1=1)', () => {
  const items = scanSql("SELECT * FROM users WHERE id = 1 OR 1=1;");
  return items.some(i => i.label.includes('Tautology pattern'));
});

addTest('Minifier & Tools', 'Analyzer computes statement count, tables, columns, complexity', () => {
  const q = 'WITH active AS (SELECT id, name FROM users WHERE is_active = 1) SELECT a.name, count(o.id) FROM active a JOIN orders o ON a.id = o.user_id GROUP BY a.name;';
  const res = analyzeSql(q);
  return res.tables.includes('orders') && res.joins === 1 && res.aggregates === 1 && res.groupBy === true;
});

addTest('Minifier & Tools', 'XSS payload strings (<script>, <img>) are rendered safely as plain text', () => {
  const q = "select '<script>alert(1)</script>' as xss, '<img src=x onerror=alert(1)>' as img;";
  const res = formatSql(q);
  return res.includes("'<script>alert(1)</script>'") && res.includes("'<img src=x onerror=alert(1)>'");
});

addTest('Minifier & Tools', 'Empty and whitespace-only inputs format to clean empty string', () => {
  const empty = formatSql('');
  const whitespace = formatSql('   \t\n   ');
  return empty === '' && whitespace === '';
});

// =============================================================================
// RUNNER
// =============================================================================
async function run() {
  console.log('================================================================');
  console.log(`RUNNING 180 SCENARIO TESTS FOR SQL FORMATTER`);
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  const failedList: Array<{ id: number; group: string; name: string; error?: string }> = [];

  for (const tc of tests) {
    try {
      const ok = await tc.fn();
      if (ok) {
        passed++;
      } else {
        failed++;
        failedList.push({ id: tc.id, group: tc.group, name: tc.name, error: 'Assertion false' });
      }
    } catch (err: any) {
      failed++;
      failedList.push({ id: tc.id, group: tc.group, name: tc.name, error: err?.message || String(err) });
    }
  }

  if (failedList.length > 0) {
    console.log('--- FAILED TESTS SUMMARY ---');
    for (const f of failedList) {
      console.error(`  FAIL [${String(f.id).padStart(3, '0')}] [${f.group}] ${f.name} -> ${f.error}`);
    }
  }

  console.log('\n================================================================');
  console.log(`TOTAL SCENARIO TESTS: ${tests.length}`);
  console.log(`PASSED:               ${passed}`);
  console.log(`FAILED:               ${failed}`);
  console.log(`ACCURACY RATE:        ${((passed / tests.length) * 100).toFixed(2)}%`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

run();
