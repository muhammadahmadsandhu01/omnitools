import {
  Calculator,
  Code,
  FileText,
  Heart,
  Image,
  Search,
} from 'lucide-react';

export type CategoryId =
  | 'finance'
  | 'developer'
  | 'document'
  | 'media'
  | 'seo'
  | 'health';

export type ToolStatus = 'published' | 'coming-soon' | 'draft';

export interface Tool {
  id: string;
  name: string;
  slug: string;
  categoryId: CategoryId;
  description: string;
  isPopular?: boolean;
  status: ToolStatus;
  hidden?: boolean;
  excludeFromSitemap?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  relatedToolSlugs?: string[];
  applicationCategory?: string;
}

export interface ToolCategory {
  id: CategoryId;
  name: string;
  icon: typeof Calculator;
  color: string;
  hidden?: boolean;
}

/**
 * KivaroTools categories
 */
export const categories: ToolCategory[] = [
  {
    id: 'finance',
    name: 'Finance & Calculators',
    icon: Calculator,
    color: 'text-blue-500',
  },
  {
    id: 'developer',
    name: 'Developer Tools',
    icon: Code,
    color: 'text-green-500',
  },
  {
    id: 'document',
    name: 'Document Utilities',
    icon: FileText,
    color: 'text-orange-500',
  },
  {
    id: 'media',
    name: 'Media & Images',
    icon: Image,
    color: 'text-pink-500',
  },
  {
    id: 'seo',
    name: 'SEO & Text Tools',
    icon: Search,
    color: 'text-purple-500',
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    icon: Heart,
    color: 'text-red-500',
    hidden: true,
  },
];

/**
 * KivaroTools catalogue
 */
export const tools: Tool[] = [
  // ============================================================
  // FINANCE & CALCULATORS
  // ============================================================

  {
    id: 'precious-metals',
    name: 'Precious Metals Market Rates & Scrap Melt Calculator',
    slug: 'precious-metals',
    categoryId: 'finance',
    description:
      'Live Gold, Silver, Platinum & Palladium spot prices, multi-item scrap jewelry melt calculator, karat purity conversions, and 30-day charts across 32 currencies.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Precious Metals Market Rates & Scrap Gold/Silver Melt Calculator',
    seoDescription:
      'Track live Gold (XAU), Silver (XAG), Platinum (XPT), and Palladium (XPD) spot prices across 32 currencies. Calculate exact scrap jewelry melt values by karat (24K–9K), 9 weight units (troy oz, grams, tola, dwt), and dealer payout tiers (75%–100%).',
    relatedToolSlugs: ['crypto-converter', 'compound-interest', 'invoice-generator', 'sip-calculator'],
  },

  {
    id: 'mortgage-calculator',
    name: 'Mortgage & Home Loan Amortization Calculator (PITI + PMI)',
    slug: 'mortgage-calculator',
    categoryId: 'finance',
    description:
      'Calculate monthly or accelerated biweekly mortgage payments, PITI escrow, automatic 80% LTV PMI drop-off, cash to close, and complete amortization schedules.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Mortgage Calculator — PITI, Automatic 80% LTV PMI Drop-Off & Biweekly Amortization',
    seoDescription:
      'Calculate monthly and accelerated biweekly mortgage payments with full PITI escrow (property tax, home insurance, HOA), automatic 80% LTV PMI cancellation, cash to close, extra principal prepayments, and reconciled amortization schedules.',
    relatedToolSlugs: ['emi-calculator', 'compound-interest', 'salary-calculator', 'invoice-generator'],
  },

  {
    id: 'invoice-generator',
    name: 'Free Professional PDF Invoice Generator (No Signup)',
    slug: 'invoice-generator',
    categoryId: 'finance',
    description:
      'Create, customize, and download print-ready A4 PDF invoices locally in your browser with custom branding, proportional VAT/GST tax allocation, and 30+ currencies.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Free PDF Invoice Generator — Multi-Currency, VAT/GST, A4 Pagination & No Signup',
    seoDescription:
      'Create, customize, and download professional A4 PDF invoices 100% in your browser with zero signup. Features company logo upload, 30+ ISO-4217 currencies, proportional VAT/GST tax allocation, multi-page A4 pagination, and local auto-save.',
    relatedToolSlugs: ['salary-calculator', 'crypto-converter', 'emi-calculator', 'compound-interest'],
  },

  {
    id: 'emi-calculator',
    name: 'Loan EMI & Amortization Calculator (Personal, Auto & Retail Loans)',
    slug: 'emi-calculator',
    categoryId: 'finance',
    description:
      'Calculate reducing-balance equated installments (monthly, biweekly, weekly), compare tenure reduction vs payment recast prepayments, and audit loan fees across 42 currencies.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Loan EMI Calculator — Personal, Auto & Home Loan Amortization + Prepayment Modes',
    seoDescription:
      'Calculate Equated Monthly Installments (EMI), biweekly/weekly payments, and reducing-balance amortization across 42 currencies. Compare Tenure Reduction vs Payment Recast prepayments, Ordinary vs Annuity Due timing, and origination fee drag.',
    relatedToolSlugs: ['mortgage-calculator', 'compound-interest', 'sip-calculator', 'salary-calculator', 'invoice-generator'],
  },

  {
    id: 'compound-interest',
    name: 'Compound Interest, Wealth Accumulation & Retirement Drawdown Calculator',
    slug: 'compound-interest',
    categoryId: 'finance',
    description:
      'Model compound growth with step-up contributions, 5 compounding frequencies, AUM fee and tax drag, Fisher real purchasing power, retirement drawdown, and 2,000-path Monte Carlo risk analysis.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Compound Interest Calculator — Daily/Monthly Growth, Tax Drag, Drawdown & Monte Carlo',
    seoDescription:
      'Calculate compound interest across 154 currencies with daily to annual compounding, step-up contributions, AUM fee & tax drag (Taxable, Deferred, Roth), Fisher inflation discounting, retirement drawdown, goal solvers, and 2,000-path Monte Carlo simulations.',
    relatedToolSlugs: ['sip-calculator', 'emi-calculator', 'mortgage-calculator', 'precious-metals', 'salary-calculator'],
  },

  {
    id: 'sip-calculator',
    name: 'SIP & Mutual Fund Calculator (Step-Up, Expense Ratio, Tax & Monte Carlo)',
    slug: 'sip-calculator',
    categoryId: 'finance',
    description:
      'Calculate systematic investment plan (SIP) and lump-sum mutual fund returns with annual step-ups, TER expense drag, capital gains tax, inflation discounting, and 3,000-path Monte Carlo simulations.',
    isPopular: true,
    status: 'published',
    seoTitle: 'SIP Calculator — Step-Up Mutual Fund Returns, TER Expense Drag, Tax & 3,000-Path Monte Carlo',
    seoDescription:
      'Calculate Mutual Fund SIP and Lump Sum returns across 154 currencies. Model annual Step-Up top-ups, Nominal APR vs Effective APY, Total Expense Ratio (TER) drag, Capital Gains Tax, Fisher inflation, 80-iteration Goal Solver, and 3,000-path Monte Carlo risk.',
    relatedToolSlugs: ['compound-interest', 'emi-calculator', 'mortgage-calculator', 'crypto-converter', 'precious-metals'],
  },

  {
    id: 'salary-calculator',
    name: 'Salary & Net Take-Home Pay',
    slug: 'salary-calculator',
    categoryId: 'finance',
    description:
      'Estimate take-home salary after taxes and other deductions using the selected calculation assumptions.',
    isPopular: false,
    status: 'published',
    hidden: true,
    excludeFromSitemap: true,
    seoTitle: 'Salary & Net Take-Home Pay Calculator',
    seoDescription: 'Estimate take-home salary after taxes and statutory deductions across 22 countries with customizable tax schedules and payroll assumptions.',
    relatedToolSlugs: ['mortgage-calculator', 'emi-calculator', 'invoice-generator', 'compound-interest'],
  },

  {
    id: 'auto-loan-calculator',
    name: 'Auto / Car Loan Calculator',
    slug: 'auto-loan-calculator',
    categoryId: 'finance',
    description:
      'Estimate monthly car payments, total repayment, and interest over the selected loan term.',
    isPopular: false,
    status: 'coming-soon',
    hidden: true,
    excludeFromSitemap: true,
    relatedToolSlugs: ['emi-calculator', 'mortgage-calculator'],
  },

  {
    id: 'crypto-converter',
    name: 'Live Currency & Cryptocurrency Converter (Mid-Market Rates & Fee Simulator)',
    slug: 'crypto-converter',
    categoryId: 'finance',
    description:
      'Convert 160+ world fiat currencies and top cryptocurrencies with live ECB and CoinGecko mid-market exchange rates, 30-day historical trend charts, and bank spread markup simulation.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Currency & Crypto Converter — 160+ Fiat & Top Cryptos, Mid-Market Rates & Bank Fee Simulator',
    seoDescription:
      'Convert 160+ world fiat currencies and 8 major cryptocurrencies (BTC, ETH, USDT, SOL, BNB, XRP, ADA, DOGE) using live ECB & CoinGecko mid-market rates. Simulate bank spread markups (0.5%–3.0%), fixed wire fees, satoshi precision, and 30-day FX charts.',
    relatedToolSlugs: ['precious-metals', 'compound-interest', 'salary-calculator', 'invoice-generator', 'sip-calculator'],
  },

  // ============================================================
  // DEVELOPER TOOLS
  // ============================================================

  {
    id: 'json-formatter',
    name: 'JSON Formatter, Validator & Virtual Tree Viewer',
    slug: 'json-formatter',
    categoryId: 'developer',
    description:
      'Format, validate, beautify, minify, and auto-repair JSON up to 25 MB 100% client-side with zero server uploads.',
    isPopular: true,
    status: 'published',
    seoTitle: 'JSON Formatter, Validator & Tree Viewer — Beautify, Minify & Repair',
    seoDescription:
      'Free client-side JSON formatter, validator, beautifier, and minifier. Explore 25MB payloads in a 60,000-node virtual tree, auto-repair broken JSON, run JSONPath queries, detect 64-bit BigInt precision loss, and generate TypeScript or Draft-07 Schema locally.',
    relatedToolSlugs: ['json-converter', 'base64-encoder', 'sql-formatter', 'regex-tester'],
  },

  {
    id: 'svg-optimizer',
    name: 'SVG Optimizer, Code Cleaner & Vector Minifier',
    slug: 'svg-optimizer',
    categoryId: 'developer',
    description:
      'Compress SVG markup, strip Figma & Illustrator bloat, prune unreferenced defs, and round path coordinates locally in your browser with zero server uploads.',
    isPopular: true,
    status: 'published',
    seoTitle: 'SVG Optimizer, Cleaner & Minifier — Compress Vector Graphics Locally',
    seoDescription:
      'Optimize, clean, and compress SVG files up to 10MB 100% client-side in your browser. Strip Figma & Illustrator metadata, prune unused <defs> via BFS traversal, round path coordinates (0–4 decimals), preserve viewBox, and preview in an XSS-safe sandbox.',
    relatedToolSlugs: ['image-compressor', 'webp-to-jpg-png', 'sql-formatter', 'json-formatter', 'base64-encoder'],
  },

  {
    id: 'password-generator',
    name: 'Cryptographic Password, Passphrase, API Secret & Hash Generator',
    slug: 'password-generator',
    categoryId: 'developer',
    description:
      'Create zero-bias CSPRNG passwords, multi-word passphrases, Hex/Base64URL developer secrets, HMAC digests, and 1 GB streaming file checksums locally in your browser.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Secure Password, Passphrase, API Secret & SHA-256 Hash Generator',
    seoDescription:
      'Generate cryptographically secure passwords, EFF Diceware passphrases, 128-to-512 bit API/JWT secrets, HMAC-SHA256 tokens, and 1GB file checksums 100% in your browser via Web Crypto API with zero modulo bias and k-Anonymity breach checks.',
    relatedToolSlugs: ['base64-encoder', 'regex-tester', 'json-formatter', 'sql-formatter'],
  },

  {
    id: 'json-converter',
    name: 'JSON Converter — Transform JSON to CSV, Excel (.xlsx), YAML, XML & JSONL',
    slug: 'json-converter',
    categoryId: 'developer',
    description:
      'Flatten deeply nested JSON payloads up to 50 MB (200,000 rows) into spreadsheets and structured formats directly in your browser with CSV Formula Injection defense.',
    isPopular: true,
    status: 'published',
    seoTitle: 'JSON Converter — Convert JSON to CSV, Excel (.xlsx), YAML, XML & JSONL',
    seoDescription:
      'Convert and flatten nested JSON up to 50MB into CSV, native Excel (.xlsx), YAML, XML, TSV, and JSONL 100% client-side. Features custom path separators, array exploding, column selection, UTF-8 BOM, and CSV Formula Injection defense.',
    relatedToolSlugs: ['json-formatter', 'sql-formatter', 'base64-encoder', 'text-analyzer'],
  },

  {
    id: 'base64-encoder',
    name: 'Base64 Encoder & Decoder — UTF-8 Text, Base64URL, Data URI & Files',
    slug: 'base64-encoder',
    categoryId: 'developer',
    description:
      'Encode and decode UTF-8 text, emojis, Base64URL tokens, Data URIs, and binary files up to 25 MB locally in your browser with RFC 4648 strict validation.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Base64 Encoder & Decoder — UTF-8, Base64URL, Data URI & Binary Files',
    seoDescription:
      'Encode and decode Base64 strings, URL-safe Base64URL tokens, Data URIs, and binary files up to 25MB 100% client-side. Features lossless WHATWG UTF-8 Unicode handling, RFC 4648 strict validation, MIME/PEM line wrapping, and magic-byte file detection.',
    relatedToolSlugs: ['json-formatter', 'password-generator', 'regex-tester', 'text-case-converter', 'json-converter'],
  },

  {
    id: 'sql-formatter',
    name: 'SQL Query Formatter, Beautifier, Linter & AST Analyzer',
    slug: 'sql-formatter',
    categoryId: 'developer',
    description:
      'Format, beautify, minify, lint, and analyze SQL queries across 19 database dialects 100% locally in your browser with zero query logging.',
    isPopular: true,
    status: 'published',
    seoTitle: 'SQL Query Formatter, Beautifier & Linter — 19 Dialects (PostgreSQL, BigQuery, T-SQL)',
    seoDescription:
      'Format, beautify, minify, lint, and analyze SQL queries 100% client-side across 19 dialects (PostgreSQL, MySQL, BigQuery, Snowflake, T-SQL, Oracle PL/SQL, DuckDB). Includes static anti-pattern linting, AST complexity analysis, SQL diff, and JS/Python code export.',
    relatedToolSlugs: ['json-formatter', 'regex-tester', 'json-converter', 'base64-encoder'],
  },

  {
    id: 'regex-tester',
    name: 'Regex Tester, Debugger, AST Explainer & Polyglot Code Generator',
    slug: 'regex-tester',
    categoryId: 'developer',
    description:
      'Test regular expressions in real time with capture group extraction, live replace/split previews, ReDoS catastrophic backtracking analysis, and ready-to-use code snippets.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Regex Tester, Debugger, Visualizer & Code Generator (JS, Python, Go, Java)',
    seoDescription:
      'Test, debug, and explain regular expressions in real time 100% client-side. Features 7 ECMAScript flags (g, i, m, s, u, y, d), capture group tables, live replace & split testing, ReDoS vulnerability scoring with 1.2s Web Worker guard, and JS, Python, Go & Java code generation.',
    relatedToolSlugs: ['text-analyzer', 'text-case-converter', 'json-formatter', 'sql-formatter', 'base64-encoder'],
  },

  // ============================================================
  // DOCUMENT UTILITIES
  // ============================================================

  {
    id: 'pdf-merge-split',
    name: 'PDF Merge & Split Tool — Combine, Extract & ZIP Pages',
    slug: 'pdf-merge-split',
    categoryId: 'document',
    description:
      'Merge up to 50 PDF files (750 MB total), extract custom page intervals, or split documents into individual pages and multi-range ZIP archives 100% client-side with zero server uploads.',
    isPopular: true,
    status: 'published',
    seoTitle: 'PDF Merge & Split Tool — Combine 50 PDFs (750 MB), Extract Pages & ZIP (Zero Upload)',
    seoDescription:
      'Merge up to 50 PDF files (750 MB batch / 250 MB per file), extract custom page ranges, or split PDFs into individual pages and semicolon-range ZIP archives 100% in your browser with zero server uploads.',
    relatedToolSlugs: ['image-to-pdf', 'invoice-generator', 'image-compressor', 'webp-to-jpg-png'],
  },

  {
    id: 'image-to-pdf',
    name: 'Image to PDF Converter — Combine JPG, PNG, WebP & HEIC to PDF',
    slug: 'image-to-pdf',
    categoryId: 'document',
    description:
      'Convert up to 100 JPG, PNG, WebP, HEIC/HEIF, BMP, GIF, and SVG images (up to 500 MB) into a single multi-page PDF or separate ZIP PDFs 100% client-side with custom page geometry and lossless stream embedding.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Image to PDF Converter — Convert JPG, PNG, WebP, HEIC & SVG to PDF (Zero Upload)',
    seoDescription:
      'Convert up to 100 images (500 MB) across 9 formats (JPG, PNG, WebP, HEIC/HEIF, SVG, BMP, GIF) to a single PDF or separate ZIP PDFs 100% in your browser. Custom A4/Letter/Fit page sizes, margins, auto-orientation, and lossless embedding.',
    relatedToolSlugs: ['pdf-merge-split', 'webp-to-jpg-png', 'image-compressor', 'invoice-generator'],
  },

  // ============================================================
  // MEDIA & IMAGES
  // ============================================================

  {
    id: 'webp-to-jpg-png',
    name: 'WebP to JPG & PNG Converter',
    slug: 'webp-to-jpg-png',
    categoryId: 'media',
    description:
      'Convert WebP images to JPG or PNG directly in your browser with adjustable quality and transparency background fill.',
    isPopular: true,
    status: 'published',
    seoTitle: 'WebP to JPG & PNG Converter — Free Batch Image Converter',
    seoDescription:
      'Convert WebP images to JPG or PNG online directly in your browser. Batch processing, customizable JPEG quality, transparency background fill, and instant ZIP download with 100% client-side privacy.',
    relatedToolSlugs: ['image-compressor', 'image-to-pdf', 'pdf-merge-split', 'svg-optimizer'],
  },

  {
    id: 'image-compressor',
    name: 'Image Compressor & Optimizer',
    slug: 'image-compressor',
    categoryId: 'media',
    description:
      'Reduce image file size with adjustable compression directly in your browser.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Image Compressor & Optimizer — Reduce Image Size in KB',
    seoDescription:
      'Compress JPG, PNG, WebP, and AVIF images online for free in your browser. Reduce file size to target KB limits or preserve visual quality with private client-side processing.',
    relatedToolSlugs: ['webp-to-jpg-png', 'image-to-pdf', 'svg-optimizer', 'pdf-merge-split'],
  },

  // ============================================================
  // SEO & TEXT
  // ============================================================

  {
    id: 'qr-generator',
    name: 'Custom QR Code Generator',
    slug: 'qr-generator',
    categoryId: 'seo',
    description:
      'Create customizable QR codes with options for colors, content, and supported branding elements.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Free QR Code Generator Online — Custom Colors, Logos & Print Vector',
    seoDescription: 'Generate free, unexpiring static QR codes for URLs, Wi-Fi, vCard contacts, emails, and events. Customize colors, add logos, and download print-ready PNG, SVG, or PDF client-side.',
    relatedToolSlugs: ['meta-generator', 'text-analyzer', 'text-case-converter', 'base64-encoder'],
  },

  {
    id: 'text-analyzer',
    name: 'Word Counter & Text Analyzer',
    slug: 'text-analyzer',
    categoryId: 'seo',
    description:
      'Analyze word count, character count, readability, keyword density, speaking duration, and sentence metrics client-side in real time.',
    isPopular: true,
    status: 'published',
    hidden: true,
    excludeFromSitemap: true,
    seoTitle: 'Word Counter & Text Analyzer — Readability, Characters & Pacing',
    seoDescription:
      'Free online text analyzer and word counter. Measure words, characters, sentences, readability scores (Flesch, FK), speaking pace, and keyword density client-side.',
    relatedToolSlugs: ['text-case-converter', 'qr-generator', 'regex-tester', 'json-formatter'],
  },

  {
    id: 'text-case-converter',
    name: 'Text Case Converter',
    slug: 'text-case-converter',
    categoryId: 'seo',
    description:
      'Convert text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, and 15 writing and developer naming formats.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Text Case Converter — Title Case, UPPERCASE, camelCase & snake_case',
    seoDescription: 'Free online text case converter. Convert between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, and 15 writing and programming identifier formats with zero server uploads.',
    relatedToolSlugs: ['text-analyzer', 'json-formatter', 'base64-encoder', 'regex-tester'],
  },

  {
    id: 'meta-generator',
    name: 'Meta Tag & Open Graph Generator',
    slug: 'meta-generator',
    categoryId: 'seo',
    description:
      'Generate HTML meta tags and Open Graph markup for search and social sharing.',
    isPopular: false,
    status: 'published',
    seoTitle: 'Meta Tag & Open Graph Generator — SEO & Social',
    seoDescription: 'Free Meta Tag & Open Graph Generator. Create SEO meta tags, Twitter Cards, and live social previews with instant validation and private in-browser processing.',
    relatedToolSlugs: ['qr-generator', 'text-analyzer', 'text-case-converter', 'json-formatter'],
  },

  // ============================================================
  // HEALTH & FITNESS
  // ============================================================

  {
    id: 'bmi-calculator',
    name: 'BMI & Calorie Calculator',
    slug: 'bmi-calculator',
    categoryId: 'health',
    description:
      'Calculate BMI and estimate daily calorie needs using the selected personal inputs and calculation method.',
    isPopular: true,
    status: 'coming-soon',
    hidden: true,
    excludeFromSitemap: true,
    relatedToolSlugs: ['emi-calculator', 'compound-interest'],
  },
];

/**
 * Find a category by its ID.
 */
export function getCategoryById(categoryId: CategoryId) {
  return categories.find((category) => category.id === categoryId);
}

/**
 * Get all visible categories for navigation and directories.
 */
export function getVisibleCategories() {
  return categories.filter((category) => !category.hidden);
}

/**
 * Find a tool by category and slug.
 */
export function getTool(categoryId: string, slug: string) {
  return tools.find(
    (tool) =>
      tool.categoryId === categoryId &&
      tool.slug === slug
  );
}

/**
 * Get all tools belonging to a category.
 */
export function getToolsByCategory(categoryId: CategoryId) {
  return tools.filter(
    (tool) =>
      tool.categoryId === categoryId &&
      tool.status === 'published' &&
      !tool.hidden
  );
}

/**
 * Get popular tools.
 */
export function getPopularTools() {
  return tools.filter((tool) => tool.isPopular && tool.status === 'published' && !tool.hidden);
}

/**
 * Get all published, functional tools.
 */
export function getPublishedTools(): Tool[] {
  return tools.filter((tool) => tool.status === 'published');
}

/**
 * Get all publicly discoverable, functional tools (published and not hidden).
 */
export function getPublicTools(): Tool[] {
  return tools.filter((tool) => tool.status === 'published' && !tool.hidden);
}

/**
 * Get related tools for cross-linking.
 */
export function getRelatedTools(tool: Tool, limit = 4): Tool[] {
  if (tool.relatedToolSlugs && tool.relatedToolSlugs.length > 0) {
    const specified = tool.relatedToolSlugs
      .map((slug) => tools.find((t) => t.slug === slug))
      .filter((t): t is Tool => Boolean(t && t.status === 'published' && !t.hidden));
    if (specified.length > 0) {
      return specified.slice(0, limit);
    }
  }

  // Fallback: other published tools in the same category, then others
  return tools
    .filter(
      (t) =>
        t.slug !== tool.slug &&
        t.status === 'published' &&
        !t.hidden &&
        t.categoryId === tool.categoryId
    )
    .slice(0, limit);
}