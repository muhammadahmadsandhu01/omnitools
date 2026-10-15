import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const SQL_FORMATTER_FAQS: FaqItem[] = [
  {
    question: 'What is an SQL formatter and beautifier?',
    answer:
      'An SQL formatter (also known as an SQL beautifier or pretty-printer) is a software utility that parses raw SQL code and restructures it with consistent indentation, clause line breaks, and standardized keyword casing. It turns compact, unreadable single-line queries into clean, readable code without modifying the semantic meaning, data results, or execution logic of the query.',
  },
  {
    question: 'Is an SQL formatter the same as an SQL validator or linter?',
    answer:
      'No. An SQL formatter reorganizes query whitespace, line breaks, and token casing according to typographic conventions. An SQL validator or database compiler, by contrast, connects to a database catalog to check table existence, column datatypes, permissions, and engine-specific semantics. While the OmniTools formatter catches syntax tokenization issues (such as unclosed quotes or brackets), it does not connect to your database or certify that referenced schema entities exist.',
  },
  {
    question: 'Does formatting or beautifying an SQL query alter its execution plan or database performance?',
    answer:
      'No. SQL is a declarative programming language. Relational database query planners (such as those in PostgreSQL, MySQL, SQL Server, and Oracle) parse queries into abstract syntax trees (ASTs) before generating execution plans. Database query optimizers completely ignore cosmetic whitespace, indentation, line breaks, and keyword capitalization. A formatted query executes with the exact same plan as an unformatted query.',
  },
  {
    question: 'Why should SQL reserved keywords be capitalized in production codebases?',
    answer:
      'Capitalizing SQL keywords (such as SELECT, FROM, WHERE, JOIN, and GROUP BY) creates immediate visual contrast between the structural verbs of the SQL grammar and the schema identifiers (tables, views, aliases, and columns). This structural hierarchy significantly accelerates code reviews, simplifies troubleshooting complex subqueries, and establishes a consistent team style guide.',
  },
  {
    question: 'How does clause and operator placement improve Git diff readability?',
    answer:
      'Placing Boolean operators (AND, OR), JOIN conditions, and commas on separate lines isolates query modifications down to individual lines. In version control systems like Git, adding, modifying, or deleting a single filter predicate generates a clean one-line diff without altering adjacent lines, avoiding unnecessary merge conflicts during pull requests.',
  },
  {
    question: 'Which database dialects does the OmniTools SQL Formatter support?',
    answer:
      'OmniTools natively supports 19 database dialects powered by the sql-formatter 15.9.0 engine: Standard ANSI/ISO SQL, PostgreSQL, MySQL, MariaDB, Google BigQuery, Snowflake, SQL Server (Transact-SQL / T-SQL), SQLite, DuckDB, ClickHouse, Amazon Redshift, Oracle PL/SQL, IBM DB2, Trino / Presto, Apache Spark SQL, Apache Hive, SingleStoreDB, TiDB, and Couchbase N1QL.',
  },
  {
    question: 'What is the difference between standard indentation and tabular alignment?',
    answer:
      'Standard indentation indents child expressions (like column lists or subqueries) by a fixed number of spaces (typically 2 or 4 spaces) or tabs below the parent clause header. Tabular alignment (Tabular Left or Tabular Right) pads SQL keywords to a uniform 10-character boundary so that query clauses and column lists align along a single vertical axis, creating a spreadsheet-like visual layout preferred in enterprise reporting.',
  },
  {
    question: 'Can I format multi-statement SQL scripts or batch transactions?',
    answer:
      'Yes. OmniTools supports multi-statement SQL scripts containing multiple SELECT, INSERT, UPDATE, DELETE, CREATE, or ALTER statements separated by semicolons. You can customize the number of blank lines separating individual statements in the Advanced Settings panel.',
  },
  {
    question: 'Are my database queries, schema names, or table data sent to any server?',
    answer:
      'No. Formatting, minification, and query analysis run 100% client-side in your web browser using a dedicated Web Worker (with synchronous fallback). No SQL queries, table names, confidential schema structures, or parameter values are ever transmitted to external servers, cloud endpoints, or analytics services. OmniTools is safe for proprietary queries and sensitive production environments.',
  },
  {
    question: 'Can I format complex Common Table Expressions (CTEs) and window functions?',
    answer:
      'Yes. OmniTools accurately formats complex CTEs (WITH ... AS ...) by indenting the query definition blocks, separating multiple CTE definitions with commas, and properly indenting window functions containing OVER (PARTITION BY ... ORDER BY ... ROWS BETWEEN ...).',
  },
  {
    question: 'How does SQL minification work without corrupting string literals or comments?',
    answer:
      'The minification engine uses a state-machine tokenizer that identifies string literals, quoted identifiers (double quotes, backticks, square brackets), and dollar-quoted blocks. It strips unnecessary line breaks and whitespace between operators while preserving exact spacing inside strings and optionally stripping comments to prevent syntax corruption.',
  },
  {
    question: 'Why did formatting fail for my SQL query?',
    answer:
      'Formatting typically fails due to unclosed quotation marks (single quotes, double quotes, backticks, or square brackets), mismatched parentheses, or vendor-specific procedural control blocks (such as custom MySQL DELIMITER commands or procedural DO $$ blocks). If an error occurs, OmniTools preserves your original input text and provides an error message indicating the approximate line and column of the syntax issue.',
  },
];

export default function SqlFormatterSeo() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://omnitools-navy.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Developer Tools',
        item: 'https://omnitools-navy.vercel.app/developer',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'SQL Query Formatter',
        item: 'https://omnitools-navy.vercel.app/developer/sql-formatter',
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SQL_FORMATTER_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      {/* Structured Data: BreadcrumbList & FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Primary Tool Experience / Overview */}
      <header className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-3">
          SQL Query Formatter &amp; Beautifier: Dialects, Indentation &amp; Performance Guide
        </h2>
        <p className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400">
          The <strong>OmniTools SQL Query Formatter</strong> transforms dense, unformatted, or single-line database queries into clean,
          idiomatic, and structured code. Powered by client-side Web Worker execution with support for 19 major database engines, it gives
          developers, data engineers, and analysts full control over indentation, keyword capitalization, dialect-specific syntax, and 1-click codebase exports.
        </p>
      </header>

      {/* Section B: Original Introduction */}
      <section className="mb-10">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          Why Structured SQL Matters in Modern Engineering
        </h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Structured Query Language (SQL) is the universal declarative standard for data storage, transactional processing, and analytical modeling.
          In active production architectures, however, raw SQL rarely arrives in a pristine state. Queries logged by Object-Relational Mappers
          (such as Prisma, TypeORM, Hibernate, and SQLAlchemy), distributed tracing systems, and analytical reporting dashboards often arrive as
          dense, unindented single-line strings.
        </p>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Unformatted SQL creates significant friction:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 mb-4">
          <li>
            <strong>Slower Code Reviews:</strong> Reviewers must mentally parse complex join conditions and nested filter predicates,
            obscuring potential Cartesian products or missing table indexes.
          </li>
          <li>
            <strong>Noisy Version Control Diffs:</strong> Single-line query changes trigger massive Git diff conflicts that obscure the
            exact column or predicate being modified.
          </li>
          <li>
            <strong>Syntax Typos &amp; Logical Bugs:</strong> Misplaced boolean operators (<code className="text-xs">AND</code> vs <code className="text-xs">OR</code> precedence)
            and dangling joins are far easier to overlook in collapsed queries.
          </li>
          <li>
            <strong>Debugging Latency:</strong> Investigating slow queries captured from database slow-query logs requires immediate
            beautification before execution plans can be analyzed.
          </li>
        </ul>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          OmniTools solves this friction with an instantaneous, 100% client-side formatting workspace that parses queries in your browser memory,
          honors engine-specific syntax tokens, and provides structural diagnostics without transmitting any proprietary data over the network.
        </p>
      </section>

      {/* Section C: How to Use the Formatter */}
      <section className="mb-10">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          How to Use the OmniTools SQL Formatter
        </h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Follow these simple steps to format, customize, and export your SQL queries:
        </p>
        <ol className="list-decimal pl-6 space-y-3 text-slate-600 dark:text-slate-400">
          <li>
            <strong>Input Your SQL:</strong> Paste raw SQL directly into the editor, drag and drop a <code className="text-xs">.sql</code> file,
            or click the <strong>Sample</strong> button to test with an analytical multi-table query.
          </li>
          <li>
            <strong>Select Database Dialect:</strong> Choose your target engine from the <strong>Dialect</strong> dropdown (e.g., PostgreSQL, MySQL, BigQuery, Snowflake, SQLite, T-SQL)
            to ensure vendor-specific tokens like typecasts, backticks, or bracketed identifiers are parsed accurately.
          </li>
          <li>
            <strong>Choose Indentation &amp; Keyword Casing:</strong> Set keyword casing to <em>UPPER</em>, <em>lower</em>, or <em>Preserve</em>;
            and select your indentation width (2 spaces, 4 spaces, or tabs).
          </li>
          <li>
            <strong>Format or Minify:</strong> The formatter automatically runs in a background Web Worker as you type. Toggle <strong>Minify</strong> if
            you need a compact, single-line query string for configuration files or application payloads.
          </li>
          <li>
            <strong>Inspect Query Diagnostics:</strong> Open the <strong>SQL Developer Lab</strong> below the editor to inspect detected tables, CTEs,
            join counts, aggregate functions, line-by-line diffs, and heuristic lint hints.
          </li>
          <li>
            <strong>Export &amp; Copy:</strong> Click <strong>Export &amp; Copy</strong> to copy formatted raw SQL, or generate ready-to-paste
            JavaScript template literals (<code className="text-xs">`...`</code>), Python multiline strings (<code className="text-xs">&quot;&quot;&quot;...&quot;&quot;&quot;</code>),
            or JSON objects.
          </li>
        </ol>
      </section>

      {/* Section D: Supported Dialects & Limitations */}
      <section className="mb-10">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          Supported SQL Dialects &amp; Material Scope
        </h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Different database engines implement distinct lexical conventions for identifier quotation, type casting, array unwrapping,
          and proprietary analytical operators. OmniTools supports 19 core dialects:
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 font-semibold">Dialect</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 font-semibold">Identifier Quoting</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 font-semibold">Key Dialect Features Handled</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 font-semibold">Scope &amp; Limitations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400 text-xs">
              <tr>
                <th scope="row" className="p-3 font-semibold text-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700">Standard SQL (ANSI/ISO)</th>
                <td className="p-3 font-mono border border-gray-200 dark:border-slate-700">&quot;id&quot;</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">ANSI core clauses, standard joins, CTEs, CASE expressions, window functions</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Universal baseline; does not include proprietary vendor functions</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold text-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700">PostgreSQL / Amazon Redshift</th>
                <td className="p-3 font-mono border border-gray-200 dark:border-slate-700">&quot;col&quot;</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Type casts (<code className="text-xs">::type</code>), JSONB operators (<code className="text-xs">-&gt;</code>, <code className="text-xs">-&gt;&gt;</code>), ILIKE, dollar quotes (<code className="text-xs">$$</code>)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Standard queries only; PL/pgSQL procedural blocks are formatted as query tokens</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold text-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700">MySQL / MariaDB / TiDB</th>
                <td className="p-3 font-mono border border-gray-200 dark:border-slate-700">`table`</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Backtick quoting, user session variables (<code className="text-xs">@var</code>), LIMIT offset,count syntax</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Custom DELIMITER blocks and stored procedure loops require native client tools</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold text-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700">Google BigQuery</th>
                <td className="p-3 font-mono border border-gray-200 dark:border-slate-700">`project.dataset.table`</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">UNNEST expressions, struct literals, array brackets, parameterized parameters (<code className="text-xs">@param</code>)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">GoogleSQL standard; legacy BigQuery SQL is not supported</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold text-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700">Snowflake</th>
                <td className="p-3 font-mono border border-gray-200 dark:border-slate-700">&quot;id&quot;</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Semi-structured colon path navigation (<code className="text-xs">src:user:id::string</code>), lateral flattening</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">SnowSQL scripting blocks require dedicated CLI runner</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold text-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700">SQL Server (T-SQL)</th>
                <td className="p-3 font-mono border border-gray-200 dark:border-slate-700">[schema].[table]</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Square brackets, TOP clauses, CROSS APPLY, table hints WITH (NOLOCK)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Procedural batch control (BEGIN TRY / CATCH) formatted as tokens without execution</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold text-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700">SQLite / DuckDB</th>
                <td className="p-3 font-mono border border-gray-200 dark:border-slate-700">&quot;col&quot; or `col`</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Embedded table expressions, recursive CTEs, pragma statements</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Analytical DuckDB list/struct syntax handled natively</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold text-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700">ClickHouse</th>
                <td className="p-3 font-mono border border-gray-200 dark:border-slate-700">`table` or &quot;table&quot;</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">PREWHERE, SAMPLE, ASOF joins, array join syntax, SETTINGS clauses</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Specialized analytical OLAP keywords preserved</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold text-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700">Oracle PL/SQL / IBM DB2</th>
                <td className="p-3 font-mono border border-gray-200 dark:border-slate-700">&quot;COL&quot;</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">DUAL table queries, sequence navigation (<code className="text-xs">.NEXTVAL</code>), outer join operators (<code className="text-xs">(+)</code>)</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">DML and query statements formatted; package bodies require database compiler</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold text-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700">Trino / Presto / Spark / Hive</th>
                <td className="p-3 font-mono border border-gray-200 dark:border-slate-700">&quot;col&quot; or `col`</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Distributed query clauses, lambda functions (<code className="text-xs">x -&gt; x * 2</code>), map constructors</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Distributed big data syntax supported without cluster dependencies</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold text-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700">SingleStoreDB / Couchbase N1QL</th>
                <td className="p-3 font-mono border border-gray-200 dark:border-slate-700">`col` or &quot;col&quot;</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Time-series tables (<code className="text-xs">SERIES TIMESTAMP</code>), shard keys, Couchbase document collections (<code className="text-xs">`bucket`</code>), and nested array clauses</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Hybrid relational and NoSQL JSON querying structures formatted client-side</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section E: Formatting Options Explained */}
      <section className="mb-10">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          Formatting &amp; Indentation Options
        </h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          OmniTools provides fine-grained formatting controls to match your team’s engineering style guide:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Keyword Casing (UPPER, lower, preserve)</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Standardizes SQL reserved words (<code className="text-xs">SELECT</code>, <code className="text-xs">FROM</code>, <code className="text-xs">WHERE</code>).
              Uppercase keywords are traditional in relational enterprise databases; lowercase is common in modern ORM and data warehouse workflows.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Indentation (2 spaces, 4 spaces, tabs)</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Controls indentation depth for clauses, subqueries, and column projections. 2 spaces provides a compact layout for wide monitors;
              4 spaces maximizes nesting hierarchy visibility.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Indentation Alignment Styles</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Choose between <strong>Standard</strong> (hierarchical clause indentation), <strong>Tabular Left</strong>, or <strong>Tabular Right</strong>
              (aligning reserved keywords along a vertical 10-character column for clean ledger-style queries).
            </p>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Operator Line Breaks (Break Before / After)</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Controls where boolean connectors (<code className="text-xs">AND</code>, <code className="text-xs">OR</code>) appear. Breaking before
              places the operator at the start of the next line, ensuring that every filter predicate begins with its joining condition.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Comment Stripping &amp; Minification</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Strip comments to prepare clean queries for production execution, or toggle <strong>Minify</strong> to compact multi-line SQL into
              a single safe line while preserving string literals and quoted tokens.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Advanced Casing (Data Types &amp; Functions)</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Independently configure casing for data types (<code className="text-xs">INTEGER</code>, <code className="text-xs">VARCHAR</code>)
              and built-in functions (<code className="text-xs">COUNT()</code>, <code className="text-xs">COALESCE()</code>) without affecting user column names.
            </p>
          </div>
        </div>
      </section>

      {/* Section F: Before-and-After Examples */}
      <section className="mb-10">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          Before-and-After SQL Formatting Examples
        </h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
          Compare unformatted queries against OmniTools formatted output across seven common query archetypes:
        </p>

        {/* Example 1: Basic SELECT */}
        <div className="mb-6">
          <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-2">
            1. Basic SELECT with Projection &amp; Filtering
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/20 text-red-700 dark:text-red-300 overflow-x-auto">
              <span className="text-[10px] uppercase font-bold text-red-500 block mb-1">// Before</span>
              select id, email, first_name, is_active from users where is_active=true and created_at&gt;='2024-01-01' order by created_at desc limit 25;
            </div>
            <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 overflow-x-auto whitespace-pre">
              <span className="text-[10px] uppercase font-bold text-emerald-500 block mb-1">// After</span>
{`SELECT
  id,
  email,
  first_name,
  is_active
FROM users
WHERE
  is_active = TRUE
  AND created_at >= '2024-01-01'
ORDER BY
  created_at DESC
LIMIT 25;`}
            </div>
          </div>
        </div>

        {/* Example 2: Multi-Table JOINs */}
        <div className="mb-6">
          <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-2">
            2. Multi-Table Relational JOINs (INNER &amp; LEFT JOIN)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/20 text-red-700 dark:text-red-300 overflow-x-auto">
              <span className="text-[10px] uppercase font-bold text-red-500 block mb-1">// Before</span>
              select o.id, u.email, p.name, oi.quantity, oi.unit_price from orders o inner join users u on o.user_id=u.id left join order_items oi on o.id=oi.order_id inner join products p on oi.product_id=p.id where o.status='shipped';
            </div>
            <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 overflow-x-auto whitespace-pre">
              <span className="text-[10px] uppercase font-bold text-emerald-500 block mb-1">// After</span>
{`SELECT
  o.id,
  u.email,
  p.name,
  oi.quantity,
  oi.unit_price
FROM orders o
  INNER JOIN users u ON o.user_id = u.id
  LEFT JOIN order_items oi ON o.id = oi.order_id
  INNER JOIN products p ON oi.product_id = p.id
WHERE
  o.status = 'shipped';`}
            </div>
          </div>
        </div>

        {/* Example 3: Compound WHERE Predicates */}
        <div className="mb-6">
          <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-2">
            3. Compound WHERE Predicates with Boolean Precedence
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/20 text-red-700 dark:text-red-300 overflow-x-auto">
              <span className="text-[10px] uppercase font-bold text-red-500 block mb-1">// Before</span>
              select * from accounts where (tier='enterprise' or spend&gt;50000) and status in ('active','pending_review') and deleted_at is null;
            </div>
            <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 overflow-x-auto whitespace-pre">
              <span className="text-[10px] uppercase font-bold text-emerald-500 block mb-1">// After</span>
{`SELECT
  *
FROM accounts
WHERE
  (
    tier = 'enterprise'
    OR spend > 50000
  )
  AND status IN ('active', 'pending_review')
  AND deleted_at IS NULL;`}
            </div>
          </div>
        </div>

        {/* Example 4: Aggregations & Group By */}
        <div className="mb-6">
          <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-2">
            4. Analytical Aggregations with GROUP BY &amp; HAVING
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/20 text-red-700 dark:text-red-300 overflow-x-auto">
              <span className="text-[10px] uppercase font-bold text-red-500 block mb-1">// Before</span>
              select category, count(id) as total_products, avg(price) as avg_price, sum(stock) as inventory from products where is_archived=false group by category having count(id)&gt;=10 order by inventory desc;
            </div>
            <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 overflow-x-auto whitespace-pre">
              <span className="text-[10px] uppercase font-bold text-emerald-500 block mb-1">// After</span>
{`SELECT
  category,
  COUNT(id) AS total_products,
  AVG(price) AS avg_price,
  SUM(stock) AS inventory
FROM products
WHERE
  is_archived = FALSE
GROUP BY
  category
HAVING
  COUNT(id) >= 10
ORDER BY
  inventory DESC;`}
            </div>
          </div>
        </div>

        {/* Example 5: Common Table Expressions (CTEs) */}
        <div className="mb-6">
          <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-2">
            5. Common Table Expression (WITH ... AS) &amp; Window Function
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/20 text-red-700 dark:text-red-300 overflow-x-auto">
              <span className="text-[10px] uppercase font-bold text-red-500 block mb-1">// Before</span>
              with monthly_rev as (select customer_id, sum(amount) as revenue from orders where status='completed' group by customer_id), ranked as (select customer_id, revenue, rank() over (order by revenue desc) as rnk from monthly_rev) select c.name, r.revenue from ranked r join customers c on r.customer_id=c.id where r.rnk&lt;=5;
            </div>
            <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 overflow-x-auto whitespace-pre">
              <span className="text-[10px] uppercase font-bold text-emerald-500 block mb-1">// After</span>
{`WITH
  monthly_rev AS (
    SELECT
      customer_id,
      SUM(amount) AS revenue
    FROM orders
    WHERE
      status = 'completed'
    GROUP BY
      customer_id
  ),
  ranked AS (
    SELECT
      customer_id,
      revenue,
      RANK() OVER (
        ORDER BY
          revenue DESC
      ) AS rnk
    FROM monthly_rev
  )
SELECT
  c.name,
  r.revenue
FROM ranked r
  JOIN customers c ON r.customer_id = c.id
WHERE
  r.rnk <= 5;`}
            </div>
          </div>
        </div>

        {/* Example 6: DML Statements */}
        <div className="mb-6">
          <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-2">
            6. DML Mutation Statements (INSERT, UPDATE, DELETE)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/20 text-red-700 dark:text-red-300 overflow-x-auto">
              <span className="text-[10px] uppercase font-bold text-red-500 block mb-1">// Before</span>
              update user_sessions set is_expired=true, expired_at=now() where last_activity&lt;now()-interval '7 day' and is_expired=false;
            </div>
            <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 overflow-x-auto whitespace-pre">
              <span className="text-[10px] uppercase font-bold text-emerald-500 block mb-1">// After</span>
{`UPDATE user_sessions
SET
  is_expired = TRUE,
  expired_at = NOW()
WHERE
  last_activity < NOW() - INTERVAL '7 day'
  AND is_expired = FALSE;`}
            </div>
          </div>
        </div>

        {/* Example 7: Modern Dialect Specifics */}
        <div>
          <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-2">
            7. Dialect-Specific Syntax (PostgreSQL JSONB, BigQuery UNNEST, T-SQL Brackets)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/20 text-red-700 dark:text-red-300 overflow-x-auto">
              <span className="text-[10px] uppercase font-bold text-red-500 block mb-1">// Before (PostgreSQL JSONB)</span>
              {`select id, (metadata->>'user_id')::integer as user_id, created_at::date from audit_events where metadata@>'{"action": "login"}'::jsonb;`}
            </div>
            <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 overflow-x-auto whitespace-pre">
              <span className="text-[10px] uppercase font-bold text-emerald-500 block mb-1">// After (PostgreSQL JSONB)</span>
{`SELECT
  id,
  (metadata ->> 'user_id')::INTEGER AS user_id,
  created_at::DATE
FROM audit_events
WHERE
  metadata @> '{"action": "login"}'::JSONB;`}
            </div>
          </div>
        </div>
      </section>

      {/* Section G: Practical Real-World Use Cases */}
      <section className="mb-10">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          Practical Real-World Use Cases
        </h3>
        <div className="space-y-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          <p>
            <strong>Untangling Application &amp; Slow-Query Logs:</strong> When investigating production incidents, raw SQL extracted from
            Datadog, New Relic, CloudWatch, or Postgres <code className="text-xs">pg_stat_statements</code> often lacks whitespace. Pasting
            the query into OmniTools immediately isolates filter clauses and joins so you can identify missing indexes or sequential table scans.
          </p>
          <p>
            <strong>Reviewing ORM-Generated SQL:</strong> Tools like Prisma, Hibernate, and Entity Framework generate extensive SQL statements
            with auto-generated aliases. Beautifying these queries reveals excessive left joins, n+1 subqueries, and redundant column projections.
          </p>
          <p>
            <strong>Clean Git Pull Requests:</strong> Standardizing queries with uniform 2-space indentation and capitalized keywords ensures
            your team pull requests feature crisp, one-line diffs rather than entire query re-indentation blocks.
          </p>
          <p>
            <strong>Engineering Documentation &amp; Runbooks:</strong> Prepare clean, readable SQL snippets for architecture documentation,
            runbooks, and Confluence wiki pages that junior and senior engineers can understand at a glance.
          </p>
        </div>
      </section>

      {/* Section H: Privacy and Security */}
      <section className="mb-10">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          100% In-Browser Privacy &amp; Data Security
        </h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Many legacy online SQL formatters transmit queries across the internet via HTTP POST requests to third-party web servers. This practice
          poses severe compliance and intellectual property hazards for engineering teams handling proprietary table schemas, customer IDs, PII,
          and internal financial metrics.
        </p>
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-sm text-emerald-800 dark:text-emerald-300">
          <h4 className="font-bold mb-2">Our Strict Client-Side Commitment:</h4>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li><strong>Zero Server Transmission:</strong> SQL formatting executes entirely in your browser using an isolated Web Worker.</li>
            <li><strong>No Database Connection:</strong> OmniTools is a static code formatter. It never attempts to connect to or query your database.</li>
            <li><strong>Zero Content Telemetry:</strong> Your queries are never saved to local storage, cookies, server logs, or telemetry analytics.</li>
            <li><strong>Air-Gapped Safety:</strong> You can load this page, disconnect your internet connection, and format SQL completely offline.</li>
          </ul>
        </div>
      </section>

      {/* Section I: Limitations and Troubleshooting */}
      <section className="mb-10">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          Technical Limitations &amp; Troubleshooting
        </h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          To maintain realistic expectations, consider the following technical boundaries:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 text-sm mb-4">
          <li>
            <strong>Formatting is Not Validation:</strong> The formatter verifies lexical token layout, not database schema validity.
            It will happily format queries referencing non-existent tables or invalid datatypes without error.
          </li>
          <li>
            <strong>Stored Procedures &amp; Vendor Control Blocks:</strong> Procedural language constructs (such as Oracle PL/SQL package bodies,
            T-SQL <code className="text-xs">BEGIN TRY / CATCH</code> blocks, or MySQL custom <code className="text-xs">DELIMITER //</code> commands)
            are formatted as lexical query tokens, but vendor-specific procedural execution syntax requires native database IDEs.
          </li>
          <li>
            <strong>Unclosed Quotation Marks:</strong> If a query contains an unclosed single quote, double quote, backtick, or bracket, the parser
            will report a syntax error with line and column numbers. OmniTools preserves your original input text so no work is lost.
          </li>
          <li>
            <strong>Very Large Query Scripts:</strong> For multi-megabyte database dumps, OmniTools safely caps DOM syntax rendering at 1,000 lines
            to prevent browser tab freezing, while preserving the full formatted SQL for 1-click Copy and Download.
          </li>
        </ul>
      </section>

      {/* Section J: FAQ */}
      <section className="mb-10">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Frequently Asked Questions
        </h3>
        <dl className="space-y-6">
          {SQL_FORMATTER_FAQS.map((faq, index) => (
            <div key={index} className="border-b border-gray-100 dark:border-slate-800/80 pb-5 last:border-b-0">
              <dt className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {faq.question}
              </dt>
              <dd className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Section K: Related Developer Utilities */}
      <footer className="pt-6 border-t border-gray-200 dark:border-slate-800">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
          Related Developer Utilities
        </h4>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/developer/json-formatter"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            JSON Formatter &amp; Validator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/developer/regex-tester"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Regex Tester &amp; Code Generator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/developer/json-converter"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            JSON to CSV / Excel Converter &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/developer/base64-encoder"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Base64 Encoder &amp; Decoder &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/seo/text-analyzer"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Text Analyzer &amp; Word Counter &rarr;
          </Link>
        </div>

        {/* Section L: Closing CTA */}
        <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Ready to clean and beautify your database queries?
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Scroll back up to the editor to format, minify, or analyze your SQL instantly.
            </div>
          </div>
          <a
            href="#top"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 shadow-sm transition-all"
          >
            Format SQL Now &uarr;
          </a>
        </div>
      </footer>
    </article>
  );
}