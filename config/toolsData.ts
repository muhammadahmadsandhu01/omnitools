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
  seoTitle?: string;
  seoDescription?: string;
  relatedToolSlugs?: string[];
}

export interface ToolCategory {
  id: CategoryId;
  name: string;
  icon: typeof Calculator;
  color: string;
}

/**
 * OmniTools categories
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
  },
];

/**
 * OmniTools catalogue
 */
export const tools: Tool[] = [
  // ============================================================
  // FINANCE & CALCULATORS
  // ============================================================

  {
    id: 'precious-metals',
    name: 'Precious Metals Market Rates',
    slug: 'precious-metals',
    categoryId: 'finance',
    description:
      'Gold, silver, platinum and palladium market rates, historical prices, purity-adjusted values and unit conversions.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Precious Metals Market Rates',
    seoDescription: 'Live market rates for gold, silver, platinum, and palladium. Calculate purity-adjusted melt value, weight conversions, and historical spot prices.',
    relatedToolSlugs: ['crypto-converter', 'compound-interest', 'invoice-generator', 'sip-calculator'],
  },

  {
    id: 'mortgage-calculator',
    name: 'Mortgage & Home Loan Calculator',
    slug: 'mortgage-calculator',
    categoryId: 'finance',
    description:
      'Calculate monthly mortgage payments, total interest, and estimated costs including property tax, insurance, and down payment.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Mortgage Calculator — PITI, PMI & Amortization Schedule',
    seoDescription:
      'Calculate monthly mortgage payments (PITI), property taxes, home insurance, PMI drop-off, closing costs, and extra payments with full amortization schedules.',
    relatedToolSlugs: ['emi-calculator', 'compound-interest', 'salary-calculator', 'invoice-generator'],
  },

  {
    id: 'invoice-generator',
    name: 'Pro Invoice Generator (PDF)',
    slug: 'invoice-generator',
    categoryId: 'finance',
    description:
      'Create professional, print-ready PDF invoices with automatic calculations and browser-based editing.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Pro Invoice Generator (PDF)',
    seoDescription: 'Create professional, print-ready PDF invoices with automatic tax, discount, and currency calculations directly in your browser. No signup required.',
    relatedToolSlugs: ['emi-calculator', 'mortgage-calculator', 'salary-calculator', 'crypto-converter'],
  },

  {
    id: 'emi-calculator',
    name: 'Personal & Auto Loan EMI Calculator',
    slug: 'emi-calculator',
    categoryId: 'finance',
    description:
      'Calculate monthly EMI, total interest, and repayment amounts for personal, car, or education loans.',
    isPopular: true,
    status: 'published',
    seoTitle: 'EMI Calculator — Loan EMI & Amortization Schedule',
    seoDescription:
      'Calculate monthly loan EMI, total interest payable, and complete amortization schedules for personal, auto, and home loans with prepayment and fee modeling.',
    relatedToolSlugs: ['mortgage-calculator', 'compound-interest', 'sip-calculator', 'salary-calculator', 'invoice-generator'],
  },

  {
    id: 'compound-interest',
    name: 'Compound Interest Calculator',
    slug: 'compound-interest',
    categoryId: 'finance',
    description:
      'Calculate compound growth, estimated returns, and long-term investment value over time.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Compound Interest Calculator — Investment & Savings Growth',
    seoDescription: 'Calculate compound interest, APY, and long-term investment growth with customizable contribution frequencies, beginning or end timing, and inflation adjustment.',
    relatedToolSlugs: ['sip-calculator', 'emi-calculator', 'mortgage-calculator', 'precious-metals', 'salary-calculator'],
  },

  {
    id: 'sip-calculator',
    name: 'SIP & Mutual Funds Calculator',
    slug: 'sip-calculator',
    categoryId: 'finance',
    description:
      'Calculate mutual fund SIP and lump-sum returns with annual step-up, inflation discounting, expense ratio drag, and Monte Carlo risk simulations.',
    isPopular: true,
    status: 'published',
    seoTitle: 'SIP Calculator — Systematic Investment Plan & Mutual Fund Returns',
    seoDescription:
      'Calculate hypothetical SIP and lump-sum mutual fund returns with annual step-up, inflation-adjusted purchasing power, expense ratio fees, tax drag, and year-by-year schedule.',
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
    relatedToolSlugs: ['emi-calculator', 'mortgage-calculator'],
  },

  {
    id: 'crypto-converter',
    name: 'Crypto & Currency Converter',
    slug: 'crypto-converter',
    categoryId: 'finance',
    description:
      'Convert between 160+ world fiat currencies and top cryptocurrencies with transparent mid-market rates, card fee modeling, and 30-day trend charts.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Currency & Crypto Converter — Exchange Rates',
    seoDescription:
      'Convert between 160+ fiat currencies (USD, EUR, GBP, PKR, INR) and top cryptocurrencies (BTC, ETH, SOL) with mid-market rates, bank fee simulation, and 30-day historical charts.',
    relatedToolSlugs: ['precious-metals', 'compound-interest', 'salary-calculator', 'invoice-generator', 'sip-calculator'],
  },

  // ============================================================
  // DEVELOPER TOOLS
  // ============================================================

  {
    id: 'json-formatter',
    name: 'JSON Formatter & Validator',
    slug: 'json-formatter',
    categoryId: 'developer',
    description:
      'Format, validate, and minify JSON data quickly in your browser.',
    isPopular: true,
    status: 'published',
    seoTitle: 'JSON Formatter & Validator — Beautify & Minify',
    seoDescription: 'Free online JSON formatter, validator, and beautifier. Inspect, minify, and fix JSON with instant error detection and 100% private in-browser processing.',
    relatedToolSlugs: ['json-converter', 'base64-encoder', 'sql-formatter', 'regex-tester'],
  },

  {
    id: 'svg-optimizer',
    name: 'SVG Optimizer & Cleaner',
    slug: 'svg-optimizer',
    categoryId: 'developer',
    description:
      'Optimize SVG markup by stripping redundant editor metadata, formatting path coordinates, collapsing empty groups, and reducing file size directly in your browser.',
    isPopular: true,
    status: 'published',
    seoTitle: 'SVG Optimizer & Cleaner — Compress & Minify Vector Graphics Online',
    seoDescription:
      'Free online SVG optimizer and cleaner. Strip redundant metadata, minify coordinates, remove unused defs, and reduce file size with local in-browser processing (no server uploads).',
    relatedToolSlugs: ['image-compressor', 'webp-to-jpg-png', 'sql-formatter', 'json-formatter', 'base64-encoder'],
  },

  {
    id: 'password-generator',
    name: 'Secure Password & Secret Generator',
    slug: 'password-generator',
    categoryId: 'developer',
    description:
      'Generate cryptographically secure passwords, multi-word passphrases, API secrets, and file hashes client-side in your browser with zero server uploads.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Secure Password Generator — Random Passwords, Passphrases & Secrets',
    seoDescription:
      'Free client-side password generator. Create cryptographically secure random passwords, memorable passphrases, API tokens, and file hashes with zero modulo bias and zero tracking.',
    relatedToolSlugs: ['base64-encoder', 'regex-tester', 'json-formatter', 'sql-formatter'],
  },

  {
    id: 'json-converter',
    name: 'JSON Converter',
    slug: 'json-converter',
    categoryId: 'developer',
    description:
      'Convert JSON data into CSV, Excel, YAML, XML, TSV, or JSONL directly in your browser with zero server uploads.',
    isPopular: true,
    status: 'published',
    seoTitle: 'JSON Converter — Convert JSON to CSV, Excel, YAML & XML',
    seoDescription:
      'Free client-side JSON converter. Convert JSON to CSV, Excel (.xlsx), YAML, XML, TSV, and JSONL in your browser with zero server uploads and formula defense.',
    relatedToolSlugs: ['json-formatter', 'sql-formatter', 'base64-encoder', 'text-analyzer'],
  },

  {
    id: 'base64-encoder',
    name: 'Base64 Encoder & Decoder',
    slug: 'base64-encoder',
    categoryId: 'developer',
    description:
      'Encode text to Base64 or decode Base64 strings directly in your browser.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Base64 Encoder & Decoder — UTF-8, URL-Safe & Files',
    seoDescription: 'Encode and decode Base64 client-side with full UTF-8 Unicode, Base64URL, Data URIs, binary file support, and RFC 4648 strict validation. 100% private in-browser tool.',
    relatedToolSlugs: ['json-formatter', 'password-generator', 'regex-tester', 'text-case-converter', 'json-converter'],
  },

  {
    id: 'sql-formatter',
    name: 'SQL Query Formatter',
    slug: 'sql-formatter',
    categoryId: 'developer',
    description:
      'Format and clean SQL queries for improved readability and easier development.',
    isPopular: true,
    status: 'published',
    seoTitle: 'SQL Formatter & Beautifier — Format, Clean & Minify SQL Online',
    seoDescription:
      'Format, beautify, and minify SQL queries client-side with support for 19 dialects including PostgreSQL, MySQL, BigQuery, Snowflake, and T-SQL. Custom casing, indentation, and query analysis in your browser.',
    relatedToolSlugs: ['json-formatter', 'regex-tester', 'json-converter', 'base64-encoder'],
  },

  {
    id: 'regex-tester',
    name: 'Regex Tester & Code Generator',
    slug: 'regex-tester',
    categoryId: 'developer',
    description:
      'Test regular expressions with live matching and generate code examples for supported languages.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Regex Tester & Code Generator — Test, Debug & Explain Regex Online',
    seoDescription:
      'Test regular expressions in real time with capture groups, syntax explanations, split and replacement testing, ReDoS safety heuristics, and export-ready code snippets. 100% private in-browser evaluation.',
    relatedToolSlugs: ['text-analyzer', 'text-case-converter', 'json-formatter', 'sql-formatter', 'base64-encoder'],
  },

  // ============================================================
  // DOCUMENT UTILITIES
  // ============================================================

  {
    id: 'pdf-merge-split',
    name: 'PDF Merge & Split Tool',
    slug: 'pdf-merge-split',
    categoryId: 'document',
    description:
      'Merge PDF files or extract selected pages directly in your browser.',
    isPopular: true,
    status: 'published',
    seoTitle: 'PDF Merge & Split Tool — Combine & Extract Pages Online',
    seoDescription: 'Merge multiple PDF files into one or split pages into separate documents and ZIP archives directly in your browser. 100% private client-side processing with zero uploads.',
    relatedToolSlugs: ['image-to-pdf', 'invoice-generator', 'image-compressor', 'webp-to-jpg-png'],
  },

  {
    id: 'image-to-pdf',
    name: 'Image to PDF Converter',
    slug: 'image-to-pdf',
    categoryId: 'document',
    description:
      'Convert JPG, PNG, WebP, BMP, and GIF images into a PDF document directly in your browser.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Image to PDF Converter — Convert JPG, PNG & Photos to PDF',
    seoDescription:
      'Convert JPG, PNG, WebP, and photos to PDF for free. Combine images into one PDF or download separate files with custom page sizes and 100% private processing.',
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
      'Analyze word count, character count, readability, keyword usage, and other text metrics.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Word Counter & Text Analyzer',
    seoDescription: 'Analyze character count, word count, sentence metrics, estimated reading time, keyword density, and Flesch reading ease scores client-side.',
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
    (tool) => tool.categoryId === categoryId
  );
}

/**
 * Get popular tools.
 */
export function getPopularTools() {
  return tools.filter((tool) => tool.isPopular);
}

/**
 * Get all published, functional tools.
 */
export function getPublishedTools(): Tool[] {
  return tools.filter((tool) => tool.status === 'published');
}

/**
 * Get related tools for cross-linking.
 */
export function getRelatedTools(tool: Tool, limit = 4): Tool[] {
  if (tool.relatedToolSlugs && tool.relatedToolSlugs.length > 0) {
    const specified = tool.relatedToolSlugs
      .map((slug) => tools.find((t) => t.slug === slug))
      .filter((t): t is Tool => Boolean(t && t.status === 'published'));
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
        t.categoryId === tool.categoryId
    )
    .slice(0, limit);
}