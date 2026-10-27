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
  keywords?: string[];
  featureList?: string[];
  relatedToolSlugs?: string[];
  applicationCategory?: string;
}

export interface ToolCategory {
  id: CategoryId;
  name: string;
  icon: typeof Calculator;
  color: string;
  hidden?: boolean;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
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
    description:
      'Enterprise-grade financial calculators for loans, mortgages, compound interest, mutual fund SIPs, global statutory salary take-home pay, multi-currency FX & crypto conversions, precious metals melt values, and print-ready PDF invoices.',
    seoTitle: 'Free Financial Calculators — Mortgage, Loan, SIP & Salary',
    seoDescription:
      'Calculate mortgage PITI & PMI, loan EMIs, compound interest, SIP returns, 22-country net salaries, gold melt values, FX/crypto rates, and PDF invoices locally.',
    keywords: [
      'financial calculators',
      'mortgage calculator PITI PMI',
      'loan EMI calculator',
      'compound interest calculator',
      'SIP calculator step up',
      'salary calculator take home pay',
      'gold melt value calculator',
      'currency and crypto converter',
      'free PDF invoice generator',
    ],
  },
  {
    id: 'developer',
    name: 'Developer Tools',
    icon: Code,
    color: 'text-green-500',
    description:
      'Zero-upload browser-based developer utilities for formatting and validating JSON, converting JSON to CSV/Excel/YAML/XML, formatting 19 SQL dialects, testing regular expressions with ReDoS guards, optimizing SVG vectors, encoding Base64, and generating CSPRNG passwords & SHA hashes.',
    seoTitle: 'Free Developer Tools — JSON, SQL, Regex, SVG & Base64',
    seoDescription:
      'Format 25MB JSON payloads, convert JSON to CSV/Excel, lint 19 SQL dialects, test Regex with ReDoS guards, minify SVGs, encode Base64, and generate SHA-256 hashes.',
    keywords: [
      'developer tools online',
      'json formatter validator',
      'json to csv excel converter',
      'sql formatter beautifier linter',
      'regex tester debugger',
      'svg optimizer minifier',
      'base64 encoder decoder utf8',
      'cryptographic password generator',
      'sha256 hash generator',
    ],
  },
  {
    id: 'document',
    name: 'Document Utilities',
    icon: FileText,
    color: 'text-orange-500',
    description:
      '100% private client-side PDF & Office document utilities. Compress PDFs to 100KB/200KB, convert PDF to Word (.docx), Word to PDF, PDF to Excel (.xlsx), Excel to PDF, PDF to PowerPoint (.pptx), PDF to JPG/PNG, and merge/split up to 50 PDFs (750 MB) locally.',
    seoTitle: 'Free PDF Tools — Compress PDF, Word, Excel, PPT & Merge PDF',
    seoDescription:
      'Compress PDF to 100KB/200KB, convert PDF to Word, Word to PDF, PDF to Excel, Excel to PDF, PDF to PPT, PDF to JPG/PNG, and merge/split 50 PDFs in your browser.',
    keywords: [
      'pdf tools online free',
      'pdf to word converter client side',
      'word to pdf converter online',
      'pdf to excel xlsx converter',
      'excel to pdf converter',
      'pdf to powerpoint pptx converter',
      'pdf to jpg png high dpi',
      'merge split pdf client side',
      'image to pdf converter',
    ],
  },
  {
    id: 'media',
    name: 'Media & Images',
    icon: Image,
    color: 'text-pink-500',
    description:
      'High-speed client-side image compression and format transcoding. Compress JPG, PNG, WebP, AVIF, and HEIC images to exact target KB sizes (20KB, 50KB, 100KB) with perceptual SSIM scoring, and batch-convert WebP images to JPG or lossless PNG.',
    seoTitle: 'Free Image Tools — Compress to Target KB & WebP to JPG/PNG',
    seoDescription:
      'Compress up to 100 JPG, PNG, WebP, AVIF, and HEIC images to exact target KB sizes (20KB, 50KB, 100KB) and batch-convert WebP to JPG or PNG with zero uploads.',
    keywords: [
      'image compressor online',
      'compress image to 20kb 50kb 100kb',
      'webp to jpg converter',
      'webp to png converter',
      'batch image optimizer',
      'heic image compressor',
      'avif to webp jpeg optimizer',
    ],
  },
  {
    id: 'seo',
    name: 'SEO & Text Tools',
    icon: Search,
    color: 'text-purple-500',
    description:
      'Professional SEO, publishing, and linguistic utilities. Generate unexpiring static QR codes with custom logos & vector SVG/PDF export, analyze word count, readability & grammar, convert text across 15 editorial & developer cases in 191 locales, and author HTML/Open Graph/Next.js metadata.',
    seoTitle: 'Free SEO & Text Tools — QR Code, Word Counter & Meta Tags',
    seoDescription:
      'Generate static QR codes with logos (SVG/PDF), analyze word count, readability & grammar, convert 15 text cases across 191 locales, and build Open Graph tags.',
    keywords: [
      'seo tools online free',
      'qr code generator with logo svg pdf',
      'word counter text analyzer readability',
      'grammar checker passive voice',
      'text case converter title case camelcase',
      'meta tag generator open graph preview',
      'nextjs metadata generator',
    ],
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
    seoTitle: 'Scrap Gold, Silver & Platinum Melt Value Calculator (Live)',
    seoDescription:
      'Track live Gold, Silver, Platinum & Palladium spot prices in 32 currencies. Calculate scrap jewelry melt value by karat (24K–9K), grams, tola, troy oz & payout.',
    keywords: [
      'scrap gold melt value calculator',
      'silver melt value calculator 925 sterling',
      'gold rate per tola gram troy ounce',
      '14k 18k 22k 24k gold price calculator',
      'platinum palladium scrap value calculator',
      'live gold spot price xau xag',
      'pawn shop gold payout calculator',
      'jewelry karat purity calculator',
      'troy ounce to gram tola pennyweight',
      'bullion melt value calculator online',
    ],
    featureList: [
      'Live Gold (XAU), Silver (XAG), Platinum (XPT) & Palladium (XPD) valuation across 32 currencies',
      'BIPM/NIST exact conversions across 9 weight units (Troy oz, Gram, Tola, Pennyweight dwt, Kg, Mg, 10g, Avdp oz/lb)',
      'Hallmark purity presets (24K, 22K, 21K, 18K, 14K, 10K, 9K, Sterling 925, Coin 900, Pt950, Pd950) + custom fineness',
      'Multi-item Scrap Lot Builder with cumulative fine mass, dealer payout tiers (Refiner 95%, Bullion 88%, Pawn 75%), and CSV export',
    ],
    relatedToolSlugs: ['crypto-converter', 'compound-interest', 'invoice-generator', 'sip-calculator', 'salary-calculator'],
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
    seoTitle: 'Mortgage Calculator — PITI, 80% LTV PMI & Amortization',
    seoDescription:
      'Calculate monthly and accelerated biweekly mortgage payments with PITI escrow (taxes, insurance, HOA), automatic 80% LTV PMI drop-off, extra payments & CSV table.',
    keywords: [
      'mortgage calculator with pmi and taxes',
      'piti mortgage payment calculator',
      'accelerated biweekly mortgage payoff calculator',
      'mortgage amortization schedule calculator csv',
      'early mortgage payoff extra principal calculator',
      'home loan cash to close estimator',
      'automatic 80 ltv pmi cancellation calculator',
      '15 year vs 30 year mortgage calculator',
      'mortgage discount points breakeven calculator',
      'property tax escrow hoa mortgage calculator',
    ],
    featureList: [
      'Full PITI + HOA monthly and accelerated biweekly mortgage payment modeling',
      'Automatic Private Mortgage Insurance (PMI) termination at 80% Loan-to-Value (LTV)',
      'Upfront Cash-to-Close breakdown (down payment, discount points, origination & closing costs)',
      'Recurring extra principal and lump-sum prepayment curtailment with downloadable CSV amortization schedule',
    ],
    relatedToolSlugs: ['emi-calculator', 'compound-interest', 'salary-calculator', 'invoice-generator', 'sip-calculator'],
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
    seoTitle: 'Free PDF Invoice Generator — Multi-Currency & No Signup',
    seoDescription:
      'Create and download print-ready A4 PDF invoices 100% in your browser with no signup. Supports custom logos, 30+ ISO currencies, VAT/GST tax, and CSV/JSON export.',
    keywords: [
      'free invoice generator pdf no signup',
      'online invoice maker with logo',
      'freelance contractor invoice template pdf',
      'multi currency invoice generator vat gst',
      'commercial billing invoice creator online',
      'printable a4 pdf invoice generator',
      'private client side invoice maker',
      'export invoice to pdf csv json',
      'proforma invoice receipt generator free',
      'b2b tax invoice generator online',
    ],
    featureList: [
      '100% client-side vector A4 PDF invoice generation with deterministic multi-page pagination',
      '30+ ISO-4217 currencies with statutory decimal precision (0, 2, and 3 decimal sub-units)',
      'Proportional discount allocation across taxable and tax-exempt items for VAT/GST compliance',
      'Custom company logo upload, IBAN/SWIFT remittance blocks, JSON draft backup, and CWE-1236 safe CSV export',
    ],
    relatedToolSlugs: ['salary-calculator', 'crypto-converter', 'emi-calculator', 'compound-interest', 'image-to-pdf'],
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
    seoTitle: 'Loan EMI Calculator — Personal, Auto & Home Loan Schedule',
    seoDescription:
      'Calculate Equated Monthly Installments (EMI), biweekly payments, and reducing-balance amortization in 42 currencies. Compare Tenure Reduction vs EMI Recast modes.',
    keywords: [
      'loan emi calculator online',
      'personal loan auto loan emi calculator',
      'reducing balance amortization schedule calculator',
      'loan prepayment tenure reduction vs emi reduction',
      'biweekly weekly monthly loan payment calculator',
      'effective apr loan origination fee calculator',
      'ordinary annuity vs annuity due calculator',
      'car loan home loan emi schedule csv',
      'part payment loan interest saver calculator',
      'multi currency loan installment calculator',
    ],
    featureList: [
      'Exact reducing-balance Equated Installment calculation across Monthly (12/yr), Biweekly (26/yr), and Weekly (52/yr) schedules',
      '3 Prepayment curtailment modes: Term Reduction, Payment Recast, and Immediate Principal Offset',
      'Ordinary Annuity (end-of-period) vs Annuity Due (beginning-of-period) payment timing',
      '42 ISO-4217 currencies with origination fee, recurring servicing fee, and full period-by-period CSV schedule export',
    ],
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
    seoTitle: 'Compound Interest Calculator — Daily Growth & Monte Carlo',
    seoDescription:
      'Calculate compound interest in 154 currencies with daily to annual compounding, step-up deposits, tax & fee drag, inflation discounting, retirement drawdown & IRR.',
    keywords: [
      'compound interest calculator daily monthly annual',
      'investment growth calculator with inflation',
      'retirement drawdown swr calculator',
      'monte carlo investment portfolio simulator',
      'taxable vs tax deferred roth growth calculator',
      'step up contribution compound interest calculator',
      'savings goal solverirr cagr calculator',
      'rule of 72 doubling time calculator',
      'continuous compounding e^rt calculator',
      'wealth accumulation compound calculator',
    ],
    featureList: [
      '5 compounding frequencies (Daily 365, Monthly 12, Quarterly 4, Semi-Annual 2, Annual 1) with step-up contributions',
      'Taxable, Tax-Deferred (401k/IRA), and Tax-Exempt (Roth/ISA) account modeling with AUM expense drag',
      'Retirement Drawdown decumulation phase with inflation-escalated withdrawals and depletion year detection',
      '2,000-path Box-Muller Monte Carlo stochastic simulation (p10/p25/p50/p75/p90) and bisection Goal Solver across 154 currencies',
    ],
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
    seoTitle: 'SIP Calculator — Step-Up Mutual Fund Returns & Monte Carlo',
    seoDescription:
      'Calculate Mutual Fund SIP and Lump Sum returns in 154 currencies. Model annual Step-Up %, Expense Ratio (TER) drag, LTCG tax, inflation, and 3,000 Monte Carlo paths.',
    keywords: [
      'sip calculator online',
      'step up sip calculator with inflation',
      'mutual fund return calculator lump sum and sip',
      'sip calculator with expense ratio ter and exit load',
      'target amount sip goal planner calculator',
      'dollar cost averaging mutual fund calculator',
      'nominal apr vs effective apy sip calculator',
      'ltcg capital gains tax mutual fund calculator',
      'monte carlo sip wealth simulator',
      'monthly investment compound return calculator',
    ],
    featureList: [
      'Systematic Investment Plan (SIP), Lump Sum, and Hybrid (Lump Sum + SIP) modes with Annual Step-Up %',
      'Direct toggle between Indian AMFI Nominal APR (r/12) and European/US Effective APY ((1+r)^(1/12)-1) conventions',
      'Three-tier friction modeling: upfront entry load, ongoing Total Expense Ratio (TER), and maturity Capital Gains Tax (LTCG)',
      '80-iteration numerical bisection Goal Planner and 3,000-path lognormal Monte Carlo simulation across 154 currencies',
    ],
    relatedToolSlugs: ['compound-interest', 'emi-calculator', 'mortgage-calculator', 'crypto-converter', 'salary-calculator'],
  },

  {
    id: 'salary-calculator',
    name: 'Global Salary & Net Take-Home Pay Calculator (22 Statutory Countries + 212 Directory)',
    slug: 'salary-calculator',
    categoryId: 'finance',
    description:
      'Calculate exact post-tax net take-home pay, progressive income tax brackets, social security withholdings (FICA, PAYE/NI, EStG, FBR, Section 115BAC, CPP/EI, ATO, IRAS), and total employer payroll cost across 22 statutory jurisdictions and 212 territories.',
    isPopular: true,
    status: 'published',
    hidden: false,
    excludeFromSitemap: false,
    seoTitle: 'Salary & Take-Home Pay Calculator — 22 Country Tax Engines',
    seoDescription:
      'Calculate net take-home pay, income tax brackets, social security deductions, and employer payroll cost across 22 statutory countries (US, UK, DE, IN, PK, CA, AU).',
    keywords: [
      'salary calculator take home pay',
      'gross to net salary calculator by country',
      'paycheck calculator after taxes',
      'us irs fica paycheck tax calculator',
      'uk hmrc paye national insurance calculator',
      'germany brutto netto steuerklasse calculator',
      'india new vs old tax regime 115bac calculator',
      'pakistan fbr salaried income tax calculator',
      'canada cra cpp ei payroll calculator',
      'australia ato stage 3 tax super calculator',
    ],
    featureList: [
      '22 dedicated statutory country payroll engines (US, UK, Germany, India, Pakistan, Canada, Australia, Singapore, UAE, Saudi Arabia, France, Japan, Switzerland, Netherlands, Ireland, New Zealand, Spain, Italy, South Africa, Brazil, Mexico, South Korea)',
      'Full 6-step Gross-to-Net deduction waterfall: Gross, Pre-Tax Deductions, Progressive Tax Slabs, Social Insurance Caps, Post-Tax Deductions, and Employer Cost',
      'Exact pay-period normalization across Annual (1), Monthly (12), Semi-Monthly (24), Biweekly (26), Weekly (52), Daily (260), and Hourly (2,080)',
      'Reverse Net-to-Gross bisection Goal Solver and CWE-1236 protected RFC-4180 CSV payroll export',
    ],
    relatedToolSlugs: ['mortgage-calculator', 'emi-calculator', 'invoice-generator', 'compound-interest', 'crypto-converter'],
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
    seoTitle: 'Currency & Crypto Converter — 160+ FX Rates & Bank Spreads',
    seoDescription:
      'Convert 160+ world fiat currencies and top cryptocurrencies (BTC, ETH, USDT, SOL) using live ECB & CoinGecko mid-market rates, bank spread fees & 30-day FX charts.',
    keywords: [
      'currency and crypto converter live',
      'foreign exchange rate calculator 160 currencies',
      'bitcoin ethereum to usd pkr inr eur gbp',
      'ecb mid market exchange rate converter',
      'bank fx spread markup fee calculator',
      'crypto satoshi wei precision converter',
      'multi currency cross rate matrix table',
      'historical 30 day exchange rate chart',
      'offline cached currency converter tool',
      'travel money wire transfer fx calculator',
    ],
    featureList: [
      '160+ ISO-4217 world fiat currencies (ECB Frankfurter + ExchangeRate-API fallback) and 8 major cryptocurrencies (CoinGecko VWAP)',
      'Commercial Bank & Card Spread Simulator (0.5% to custom % markup + fixed wire fee deduction)',
      'Sub-cent to 8-decimal Satoshi (0.00000001 BTC) precision with reciprocal triangulation audit trail',
      '30-day historical exchange rate trend charts and offline-resilient dual-TTL browser caching',
    ],
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
    seoTitle: 'JSON Formatter, Validator & Tree Viewer — Beautify & Repair',
    seoDescription:
      'Format, validate, minify, and repair JSON up to 25MB in your browser. Inspect 60,000+ nodes in a virtual tree, run JSONPath queries, and generate TypeScript/Schema.',
    keywords: [
      'json formatter validator online',
      'json beautifier minifier tree viewer',
      'auto repair broken json trailing commas',
      'jsonpath query evaluator tester',
      'json to typescript interface generator',
      'json to draft 07 json schema generator',
      'ieee 754 64 bit bigint json precision detector',
      'rfc 8259 strict json syntax linter',
      'large 25mb json viewer client side',
      'unescape stringified json online',
    ],
    featureList: [
      'Strict RFC 8259 & ECMA-404 validation with exact line, column, and caret (^) error diagnostics up to 25 MB',
      'Virtualized Tree Viewer supporting 60,000+ nodes with instant search, path copying, and keyboard navigation',
      'Pre-parse lexical scanner for duplicate object keys and IEEE 754 64-bit BigInt (>2^53-1) precision loss',
      'Conservative JSON auto-repair, live JSONPath query evaluator, Structural Diff viewer, TypeScript interface generator, and Draft-07 JSON Schema creator',
    ],
    relatedToolSlugs: ['json-converter', 'base64-encoder', 'sql-formatter', 'regex-tester', 'text-case-converter'],
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
    seoTitle: 'SVG Optimizer, Cleaner & Minifier — Compress Vectors & JSX',
    seoDescription:
      'Optimize, clean, and minify SVG vectors up to 10MB client-side. Strip editor bloat, prune unused <defs>, round coordinates, preserve viewBox, and export React/JSX.',
    keywords: [
      'svg optimizer minifier online',
      'clean compress svg vector graphics',
      'strip figma illustrator inkscape svg metadata',
      'svg to react jsx tsx component converter',
      'svg to data uri css background encoder',
      'round svg path coordinates decimal precision',
      'remove unused svg defs gradients',
      'xss safe svg sanitizer preview',
      'preserve viewbox responsive svg cleaner',
      'client side svgo alternative browser tool',
    ],
    featureList: [
      '4 optimization presets (Smart, Safe, Balanced, Maximum) with 0–4 decimal path coordinate rounding up to 10 MB',
      'Breadth-First Search (BFS) reachability traversal to prune unreferenced <defs>, gradients, masks, and clipPaths',
      'Automatic stripping of Figma, Adobe Illustrator, Inkscape, and Sketch editor metadata while preserving responsive viewBox',
      'Sandboxed XSS-safe live visual comparison (Original vs Optimized, Split Slider, Wireframe Grid) with alteration risk scoring',
    ],
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
    seoTitle: 'Secure Password, Passphrase & SHA-256 Hash Generator',
    seoDescription:
      'Generate CSPRNG passwords, EFF Diceware passphrases, API/JWT secrets, HMAC tokens, and 1GB file hashes in your browser via Web Crypto API with breach checking.',
    keywords: [
      'cryptographic password generator csprng',
      'eff diceware memorable passphrase generator',
      'sha256 sha512 md5 hash generator online',
      'hmac sha256 signature generator',
      'api key jwt secret uuid v4 generator',
      'client side 1gb file checksum verifier',
      'have i been pwned k anonymity breach checker',
      'zero modulo bias random password maker',
      'pbkdf2 key derivation calculator',
      'bulk password generator csv json export',
    ],
    featureList: [
      'Web Crypto API (crypto.getRandomValues) CSPRNG password generation with strict rejection sampling for zero modulo bias',
      'EFF-curated multi-word Diceware passphrase generator and bulk credential provisioning (up to 50 passwords)',
      'Developer Secret Generator (128-bit to 512-bit Hex, Base64, Base64URL, and RFC 4122 UUID v4 tokens)',
      'SHA-256/384/512, SHA-1 & MD5 text/HMAC hashing, 1 GB streaming Web Worker file checksums, constant-time hash comparison, and k-Anonymity breach verification',
    ],
    relatedToolSlugs: ['base64-encoder', 'regex-tester', 'json-formatter', 'sql-formatter', 'text-case-converter'],
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
    seoTitle: 'JSON Converter — JSON to CSV, Excel (.xlsx), YAML & XML',
    seoDescription:
      'Convert and flatten nested JSON up to 50MB into CSV, native Excel (.xlsx), YAML, XML, TSV, and JSONL locally. Includes column filtering and CSV injection defense.',
    keywords: [
      'json to csv converter online',
      'json to excel xlsx converter client side',
      'flatten nested json array to table',
      'json to yaml xml tsv jsonl converter',
      'csv excel to json bidirectional converter',
      'rfc 4180 csv formula injection protection',
      'large 50mb json to spreadsheet exporter',
      'custom delimiter dot path json flattener',
      'utf8 bom csv export for microsoft excel',
      'private browser json data transformer',
    ],
    featureList: [
      '6 output formats: RFC 4180 CSV, native binary Excel (.xlsx), YAML, XML, TSV, and JSON Lines (.jsonl / NDJSON)',
      'Recursive nested object flattener up to 50 MB (200,000 rows, 10,000 columns) with configurable depth (1–20) and array modes (JSON, Join, Indexed)',
      'Interactive Column Selection Manager for PII filtering and Virtualized Tabular Grid with Cell Inspector modal',
      'CWE-1236 Spreadsheet Formula Injection defense and optional UTF-8 BOM for Microsoft Excel Unicode compatibility',
    ],
    relatedToolSlugs: ['json-formatter', 'sql-formatter', 'base64-encoder', 'text-analyzer', 'text-case-converter'],
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
    seoTitle: 'Base64 Encoder & Decoder — UTF-8, Base64URL & Data URI',
    seoDescription:
      'Encode and decode UTF-8 text, Base64URL tokens, Data URIs, and binary files up to 25MB locally. Supports RFC 4648 validation, MIME 76-char wrap & magic-byte checks.',
    keywords: [
      'base64 encoder decoder utf8 online',
      'base64url encoder decoder jwt safe',
      'file image pdf to base64 data uri converter',
      'base64 to binary file image pdf decoder',
      'rfc 4648 strict base64 validator',
      'rfc 2045 mime 76 char pem line wrapper',
      'unicode emoji safe base64 codec',
      'magic byte binary mime type inspector',
      'hexadecimal binary byte array inspector',
      'client side 25mb base64 file converter',
    ],
    featureList: [
      'Lossless WHATWG TextEncoder/TextDecoder UTF-8 handling for international scripts and multi-byte emojis',
      'Standard Base64 (RFC 4648 §4) and URL-safe Base64URL (RFC 4648 §5) with optional padding stripping and 76-char MIME / 64-char PEM line wrapping',
      'Binary File-to-Base64 and Data URI generator up to 25 MB using stack-safe 6,144-byte chunked streaming',
      'Automatic magic-byte MIME signature inspection (PNG, JPEG, GIF, WebP, PDF, ZIP, MP4, WAV, JSON, SVG) with instant image preview and file download',
    ],
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
    seoTitle: 'SQL Formatter, Beautifier & Linter — 19 SQL Dialects',
    seoDescription:
      'Format, beautify, minify, and lint SQL queries client-side across 19 dialects (PostgreSQL, MySQL, BigQuery, Snowflake, T-SQL, Oracle). Includes SQL diff & code export.',
    keywords: [
      'sql formatter beautifier online',
      'sql query linter syntax checker',
      'postgresql mysql bigquery snowflake sql formatter',
      'tsql oracle plsql duckdb sqlite formatter',
      'sql minifier compressor one line',
      'sql static code analyzer anti pattern detector',
      'sql query diff comparison tool',
      'convert sql to javascript python go java string',
      'preserve sql bind parameters placeholders',
      'client side private sql query beautifier',
    ],
    featureList: [
      '19 database dialects powered by Web Worker sql-formatter 15.9.0 (PostgreSQL, MySQL, MariaDB, BigQuery, Snowflake, T-SQL, PL/SQL, DuckDB, ClickHouse, Redshift, DB2, SQLite, Spark, Trino, Hive, SingleStoreDB, TiDB, N1QL)',
      'Standard (2/4 spaces, tabs) and Tabular River Alignment (Left/Right) with independent Keyword, Data Type, and Function casing controls',
      'Static SQL Anti-Pattern Linter (missing WHERE on UPDATE/DELETE, SELECT *, implicit comma joins, leading wildcard LIKE)',
      'AST Query Complexity Analyzer (CTEs, JOINs, subqueries, tables), side-by-side Diff viewer, dialect translator, and JS/Python/JSON code snippet exporter',
    ],
    relatedToolSlugs: ['json-formatter', 'regex-tester', 'json-converter', 'base64-encoder', 'text-case-converter'],
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
    seoTitle: 'Regex Tester, Debugger & Code Generator (JS, Python, Go)',
    seoDescription:
      'Test, debug, and explain regular expressions in real time with 7 flags, capture group tables, replace/split preview, 1.2s ReDoS worker guard & 6-language code export.',
    keywords: [
      'regex tester debugger online',
      'regular expression visualizer explainer',
      'redos catastrophic backtracking vulnerability checker',
      'regex capture group named group extractor',
      'regex replace and split live preview',
      'generate regex code javascript python go java rust',
      'ecmascript regex flags g i m s u y d',
      'zero length regex match infinite loop guard',
      'common regex pattern library email url ipv4',
      'client side web worker regex sandbox',
    ],
    featureList: [
      'Real-time regex matching with 7 ECMAScript flags (g, i, m, s, u, y, d) and zero-width infinite-loop protection',
      'Isolated Web Worker execution with a 1,200 ms watchdog timeout and 0–100 ReDoS catastrophic backtracking risk scorer',
      'Paginated Capture Group Breakdown table (numbered $1..$n and named ?<name> groups), Live Substitution ($&, $1, $<name>), and Split array preview',
      'Plain-English AST token explainer, Cross-Engine Compatibility Matrix (JS V8, Python re, Java, Go RE2), and polyglot code generator',
    ],
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
    seoTitle: 'PDF Merge & Split — Combine 50 PDFs (750 MB) & Extract ZIP',
    seoDescription:
      'Merge up to 50 PDF files (750 MB batch), extract custom page ranges, or split PDFs into individual pages and ZIP archives 100% in your browser with zero uploads.',
    keywords: [
      'merge pdf files online free no upload',
      'split pdf extract pages client side',
      'combine 50 pdf documents in browser',
      'pdf page range extractor zip download',
      'rotate delete reorder pdf pages locally',
      'private confidential pdf combiner wasm',
      'large 750mb pdf merger no watermark',
      'burst pdf into single page files',
      'interleave merge multiple pdf documents',
      'browser based pdf organizer tool',
    ],
    featureList: [
      'Merge up to 50 PDF files (250 MB per file / 750 MB total batch) 100% in browser memory via pdf-lib',
      '3 Split & Extract modes: Custom Range Extraction ("1-3, 5, 8-10"), Every Page to standalone PDFs (ZIP), and Semicolon Multi-Range Partitioning ("1-5; 6-10" to ZIP)',
      'One-click range presets (All Pages, Odd Pages, Even Pages, First & Last) with automatic deduplication and bounds validation',
      'Preflight %PDF- magic-byte & encryption inspection plus post-generation output PDF integrity verification',
    ],
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
    seoTitle: 'Image to PDF Converter — JPG, PNG, WebP, HEIC & SVG to PDF',
    seoDescription:
      'Convert up to 100 images (JPG, PNG, WebP, HEIC, SVG, BMP, GIF) to a single PDF or separate ZIP PDFs 100% in your browser with A4/Letter sizing and EXIF rotation.',
    keywords: [
      'image to pdf converter online free',
      'jpg to pdf png to pdf converter',
      'heic to pdf converter iphone photos',
      'webp svg bmp gif to pdf merger',
      'combine multiple photos into one pdf',
      'batch convert 100 images to pdf zip',
      'a4 us letter fit page size image pdf',
      'lossless jpeg png embedding pdf maker',
      'auto exif orientation photo to pdf',
      'client side zero upload image to pdf',
    ],
    featureList: [
      'Batch convert up to 100 images (500 MB total) across 9 formats: JPG/JPEG, PNG, WebP, iPhone HEIC/HEIF, SVG, BMP, and GIF',
      'Dual output modes: Single Combined Multi-Page PDF or Separate Individual PDFs packaged in a DEFLATE ZIP archive',
      '7 page geometry presets (A4, A3, A5, US Letter, US Legal, Fit to Image 1:1, and Custom mm/in/pt dimensions) with Auto/Portrait/Landscape orientation',
      'Direct lossless JPEG/PNG binary stream embedding, per-image 90° rotation, Contain/Cover/Actual placement, and custom alpha background matte fill',
    ],
    relatedToolSlugs: ['pdf-merge-split', 'pdf-to-jpg', 'webp-to-jpg-png', 'image-compressor', 'invoice-generator'],
  },

  {
    id: 'pdf-to-word',
    name: 'PDF to Word Converter — Editable .DOCX, Markdown & Text Extractor',
    slug: 'pdf-to-word',
    categoryId: 'document',
    description:
      'Convert PDF documents into editable Microsoft Word (.docx), Markdown (.md), and Plain Text (.txt) files 100% client-side with spatial X/Y table, heading, and paragraph reconstruction.',
    isPopular: true,
    status: 'published',
    seoTitle: 'PDF to Word Converter — Free Editable .DOCX & Markdown',
    seoDescription:
      'Convert PDF files to editable Microsoft Word (.docx), Markdown (.md), or Text 100% in your browser. Preserves tables, H1-H3 headings, and lists with zero uploads.',
    keywords: [
      'pdf to word converter online free',
      'convert pdf to editable docx client side',
      'pdf to markdown md converter',
      'extract text and tables from pdf to word',
      'private pdf to docx no server upload',
      'reconstruct pdf headings paragraphs to word',
      'live edit pdf text before downloading docx',
      'ecma 376 openxml docx generator browser',
      'convert legal contract pdf to word privately',
      'pdf to txt utf8 extractor online',
      'pdf to word converter 250mb limit',
      'pdf baseline line merger to word',
      'pdf column gap table detector to word',
      'clean word document from pdf without text boxes',
      'browser native pdf to docx engine',
    ],
    featureList: [
      '100% client-side PDF to ECMA-376 OpenXML (.docx), Markdown (.md), and UTF-8 Plain Text (.txt) conversion with zero server uploads',
      'Spatial X/Y coordinate clustering that automatically reconstructs H1–H3 heading hierarchies, multi-line paragraphs, bullet lists, and bordered Word tables',
      'Interactive Pre-Download Document Inspector & Live Text Editor to review and modify extracted content before saving',
      'Instant 1-click Sample Business Contract PDF loader and full compatibility with Microsoft Word, Google Docs, Apple Pages, and LibreOffice',
    ],
    relatedToolSlugs: ['word-to-pdf', 'pdf-to-excel', 'pdf-merge-split', 'pdf-to-ppt', 'text-analyzer'],
  },

  {
    id: 'word-to-pdf',
    name: 'Word to PDF Converter — .DOCX, Markdown & Text to Vector PDF',
    slug: 'word-to-pdf',
    categoryId: 'document',
    description:
      'Transform Microsoft Word (.docx), Markdown (.md), and Plain Text (.txt) files into print-ready, searchable vector PDF documents 100% locally in your browser.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Word to PDF Converter — .DOCX & Markdown to Vector PDF',
    seoDescription:
      'Convert Microsoft Word (.docx), Markdown (.md), and text files into searchable vector PDF documents in your browser with A4/Letter sizing, margins & page numbers.',
    keywords: [
      'word to pdf converter online free',
      'convert docx to pdf client side no upload',
      'markdown md to pdf vector converter',
      'txt to pdf print ready generator',
      'ats friendly resume docx to pdf converter',
      'custom page size a4 letter legal word to pdf',
      'preserve tables headings bullets docx to pdf',
      'stamp pdf title author metadata online',
      'private browser based word to pdf maker',
      'searchable vector pdf typesetter from docx',
      'word to pdf converter 250mb limit',
      'sanitize winansi unicode text word to pdf',
      'greedy line wrapping pdf text typesetter',
      'word table to bordered vector pdf table',
      'client side openxml word document to pdf',
    ],
    featureList: [
      'Direct in-browser OpenXML (.docx) word/document.xml parser and Markdown (.md) AST compiler with zero cloud uploads',
      'True searchable vector PDF typesetting via pdf-lib (not blurry HTML canvas screenshots) for 100% ATS resume compatibility',
      'Configurable A4, US Letter, and Legal paper geometries, Portrait/Landscape orientation, custom mm margins, and "Page X of Y" footers',
      'Live Document Preview & Pre-Export Editor with custom PDF Title/Author metadata stamping and WinAnsi Unicode typography sanitization',
    ],
    relatedToolSlugs: ['pdf-to-word', 'excel-to-pdf', 'pdf-merge-split', 'image-to-pdf', 'invoice-generator'],
  },

  {
    id: 'pdf-to-excel',
    name: 'PDF to Excel & CSV Converter — Table Extractor (.XLSX, .CSV, .JSON)',
    slug: 'pdf-to-excel',
    categoryId: 'document',
    description:
      'Extract financial tables, bank statements, and tabular schedules from PDF documents into native multi-sheet Microsoft Excel (.xlsx), RFC-4180 CSV, and JSON files 100% in your browser.',
    isPopular: true,
    status: 'published',
    seoTitle: 'PDF to Excel & CSV Converter — Extract PDF Tables to .XLSX',
    seoDescription:
      'Extract tables, bank statements, and invoices from PDF to native Microsoft Excel (.xlsx), CSV, or JSON 100% client-side with live cell editing & formula guards.',
    keywords: [
      'pdf to excel converter online free',
      'extract tables from pdf to xlsx csv',
      'convert bank statement pdf to excel privately',
      'pdf to csv rfc 4180 table extractor',
      'pdf table to json converter client side',
      'merge multi page pdf tables into one sheet',
      'cwe 1236 csv formula injection safe pdf extractor',
      'live editable spreadsheet grid pdf preview',
      'auto parse currency numbers pdf to excel',
      'zero upload financial pdf to spreadsheet tool',
      'pdf to excel converter 250mb limit',
      'sheetjs binary xlsx workbook generator',
      'auto column width sizing pdf to excel',
      'preserve negative accounting numbers pdf to csv',
      'financial ledger pdf table extractor',
    ],
    featureList: [
      'Spatial Y-baseline row clustering and X-coordinate column boundary detection for accurate PDF table grid recovery',
      '3 export formats: native multi-sheet Microsoft Excel (.xlsx via SheetJS), RFC-4180 UTF-8 CSV, and structured JSON arrays',
      'Dual workbook modes (Single Consolidated Master Sheet or Separate Worksheet Tab per PDF Page) with automatic numeric/currency typing',
      'Interactive in-browser editable data grid and built-in CWE-1236 Spreadsheet Formula Injection sanitization (=, +, -, @)',
    ],
    relatedToolSlugs: ['excel-to-pdf', 'json-converter', 'pdf-to-word', 'invoice-generator', 'pdf-merge-split'],
  },

  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF Converter — .XLSX & CSV to Auto-Fitted Vector PDF Tables',
    slug: 'excel-to-pdf',
    categoryId: 'document',
    description:
      'Convert Microsoft Excel (.xlsx, .xls), CSV, and TSV spreadsheets into print-ready vector PDF reports with proportional column auto-fitting, repeating headers, and zebra striping.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Excel to PDF Converter — .XLSX & CSV to Vector PDF Tables',
    seoDescription:
      'Convert Excel (.xlsx, .xls) and CSV spreadsheets to vector PDF tables in your browser. Features proportional column auto-fit, landscape mode & repeating headers.',
    keywords: [
      'excel to pdf converter online free',
      'convert xlsx xls csv to pdf no cut off columns',
      'spreadsheet to landscape pdf table generator',
      'auto fit excel columns on one pdf page',
      'repeat table header rows on every pdf page',
      'multi sheet excel workbook to pdf merger',
      'csv to formatted pdf report table online',
      'client side private financial excel to pdf',
      'a4 letter a3 ledger spreadsheet pdf printer',
      'vector pdf table renderer zebra striping',
      'excel to pdf converter 250mb limit',
      'proportional 95th percentile column width auto fit',
      'excel to pdf auto landscape 6 columns',
      'excel to pdf repeating navy header row',
      'convert csv to printable vector pdf without excel',
    ],
    featureList: [
      'Supports Microsoft Excel (.xlsx, .xls), Comma-Separated (.csv), and Tab-Separated (.tsv) workbooks 100% locally in browser memory',
      'Proportional character-width column auto-fitting and automatic Landscape switching (6+ columns) to eliminate horizontal column cut-offs',
      'Automatic repeating navy header banners across multi-page tables, alternating zebra row striping, and customizable cell gridlines',
      'Multi-sheet workbook selector (convert all tabs or specific sheets) across A4, US Letter, and A3 Ledger paper sizes',
    ],
    relatedToolSlugs: ['pdf-to-excel', 'json-converter', 'word-to-pdf', 'invoice-generator', 'pdf-merge-split'],
  },

  {
    id: 'pdf-to-ppt',
    name: 'PDF to PowerPoint Converter — Editable & High-DPI .PPTX Slide Decks',
    slug: 'pdf-to-ppt',
    categoryId: 'document',
    description:
      'Transform PDF presentations, pitch decks, and reports into native 16:9 Widescreen or 4:3 Standard Microsoft PowerPoint (.pptx) slide decks 100% locally in your browser.',
    isPopular: true,
    status: 'published',
    seoTitle: 'PDF to PowerPoint Converter — Free .PDF to .PPTX Slide Deck',
    seoDescription:
      'Convert PDF pitch decks and reports into native Microsoft PowerPoint (.pptx) presentations in your browser. Supports 16:9 & 4:3 slides, editable text & high-DPI.',
    keywords: [
      'pdf to powerpoint converter online free',
      'convert pdf to pptx slide deck client side',
      'pdf pitch deck to editable powerpoint slides',
      '16:9 widescreen 4:3 standard pdf to pptx',
      'ecma 376 openxml presentationml generator',
      'high dpi visual pdf pages to powerpoint',
      'extract pdf headings bullets to pptx slides',
      'private investor deck pdf to powerpoint',
      'google slides keynote compatible pptx exporter',
      'custom page range pdf to presentation converter',
      'pdf to pptx converter 250mb limit',
      'interactive slide storyboard preview editor',
      'drawingml text box shapes powerpoint generator',
      'english metric units emu slide geometry builder',
      'zero upload pitch deck pdf to pptx converter',
    ],
    featureList: [
      'Generates standards-compliant ECMA-376 OpenXML PresentationML (.pptx) archives 100% in browser memory via JSZip',
      '3 conversion modes: Editable Text & Bullet Shapes (<p:sp>), High-DPI Visual Slide Canvases (<p:pic>), and Hybrid Presentation mode',
      'Selectable Widescreen 16:9 (13.33 × 7.5 in) and Standard 4:3 (10 × 7.5 in) EMU slide geometries with custom background color themes',
      'Interactive slide storyboard preview with custom page range filtering and full compatibility with PowerPoint, Google Slides, and Keynote',
    ],
    relatedToolSlugs: ['pdf-to-jpg', 'pdf-to-word', 'pdf-merge-split', 'image-to-pdf', 'image-compressor'],
  },

  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG, PNG & WebP Converter — Up to 600 DPI Batch Image Renderer',
    slug: 'pdf-to-jpg',
    categoryId: 'document',
    description:
      'Render PDF pages into high-resolution JPG, lossless PNG, or WebP images at 72, 150, 300, or 600 DPI 100% locally in your browser with single-click or batch ZIP download.',
    isPopular: true,
    status: 'published',
    seoTitle: 'PDF to JPG, PNG & WebP Converter — 300 & 600 DPI Extractor',
    seoDescription:
      'Convert PDF pages to high-resolution JPG, lossless PNG, or WebP images up to 600 DPI in your browser. Preview dimensions, filter page ranges & download ZIP.',
    keywords: [
      'pdf to jpg converter high resolution 300 dpi',
      'pdf to png lossless transparent converter',
      'pdf to webp image extractor online free',
      '600 dpi ultra hd pdf page rasterizer',
      'batch convert pdf pages to images zip',
      'extract specific pdf page as jpg png',
      'client side canvas pdf to image renderer',
      'linkedin carousel pdf to jpg slide exporter',
      'private zero upload pdf to photo converter',
      'custom jpeg quality pdf page snapshot tool',
      'pdf to jpg converter 250mb limit',
      'html5 canvas 2d high dpi pdf rasterizer',
      'lossless deflate zip bundle pdf pages',
      'point to pixel scaling pdf to raster converter',
      'commercial print 300 dpi ocr pdf image extractor',
    ],
    featureList: [
      'Hardware-accelerated HTML5 Canvas PDF page rasterization across 3 formats: JPEG (.jpg), Lossless PNG (.png), and WebP (.webp)',
      '4 precision resolution tiers: 72 DPI (1x Screen), 150 DPI (2x Retina Web), 300 DPI (3x Print/OCR Grade), and 600 DPI (4x Ultra-HD)',
      'Custom page range filtering (e.g. "1-3, 5") and adjustable perceptual quality slider (50%–100%)',
      'Interactive visual thumbnail gallery displaying exact pixel dimensions (width × height) and file sizes with individual or DEFLATE ZIP download',
    ],
    relatedToolSlugs: ['image-to-pdf', 'compress-pdf', 'image-compressor', 'webp-to-jpg-png', 'pdf-merge-split'],
  },

  {
    id: 'compress-pdf',
    name: 'Compress PDF — Reduce PDF File Size to 100KB, 200KB & 500KB Locally',
    slug: 'compress-pdf',
    categoryId: 'document',
    description:
      'Shrink PDF file size by up to 90% 100% client-side with 4 compression modes (Balanced, Extreme, Lossless Vector, and Exact Target KB Solver for 50KB/100KB/200KB/500KB), PDF Space X-Ray audit, Grayscale conversion, and Before/After visual preview.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Compress PDF Online Free — Reduce Size to 100KB, 200KB & MB',
    seoDescription:
      'Compress PDF files up to 90% smaller 100% in your browser. Includes Exact Target KB solver (50KB, 100KB, 200KB, 500KB), Lossless Vector mode, Grayscale & X-Ray.',
    keywords: [
      'compress pdf online free no upload',
      'reduce pdf file size without losing quality',
      'compress pdf to 100kb 200kb 300kb 500kb',
      'shrink pdf under 1mb for email portal',
      'lossless vector pdf optimizer object streams',
      'batch compress 25 pdf files zip download',
      'convert scanned pdf to grayscale smaller size',
      'strip xmp metadata bloat from pdf client side',
      'before and after pdf compression quality preview',
      'private browser based pdf size reducer',
      'target kb pdf compressor 50kb 100kb 200kb',
      'itu-r bt.709 8-bit grayscale pdf compression',
      'never-grow integrity guard pdf compressor',
      'pdf internal space x-ray byte auditor',
      'compress pdf batch up to 500mb client side',
    ],
    featureList: [
      '4 specialized compression engines: Balanced Retina (150 DPI), Extreme (96 DPI), Lossless Vector Object-Stream Optimizer, and 6-Pass Progressive Target-KB Solver (50KB, 100KB, 200KB, 300KB, 500KB, 1MB, 2MB)',
      'Interactive PDF Internal Space X-Ray Auditor breaking down byte allocation across Embedded Images, Text/Fonts, XMP Metadata, and XRef Structure before and after compression',
      'Smart Never-Grow Integrity Guard that guarantees output PDF byte size never exceeds the original file, plus 8-Bit ITU-R BT.709 Grayscale Monochrome mode for scanned documents',
      'Batch compress up to 25 PDF documents (up to 500 MB total) with Page 1 Before/After readability preview and 1-click DEFLATE ZIP download',
    ],
    relatedToolSlugs: ['pdf-merge-split', 'pdf-to-word', 'image-compressor', 'pdf-to-jpg', 'image-to-pdf'],
  },

  // ============================================================
  // MEDIA & IMAGES
  // ============================================================

  {
    id: 'webp-to-jpg-png',
    name: 'WebP to JPG & PNG Converter — Batch Transcode & Alpha Matte Fill',
    slug: 'webp-to-jpg-png',
    categoryId: 'media',
    description:
      'Convert up to 50 WebP images (up to 250 MB batch) to standard JPG or lossless 8-bit alpha PNG directly in your browser with custom background matte colors, adjustable JPEG quality, and one-click ZIP export.',
    isPopular: true,
    status: 'published',
    seoTitle: 'WebP to JPG & PNG Converter — Batch Convert 50 Files & ZIP',
    seoDescription:
      'Convert up to 50 WebP images to high-resolution JPG or transparent PNG 100% in your browser. Includes custom alpha matte background fill, quality control & ZIP export.',
    keywords: [
      'webp to jpg converter online free',
      'webp to png transparent converter',
      'batch convert webp images to jpeg zip',
      'animated webp first frame poster extractor',
      'webp alpha transparency background color fill',
      'high resolution lossless webp decoder',
      'strip exif metadata webp to jpg',
      'drag and drop 50 webp files converter',
      'client side canvas webp transcoder',
      'convert google webp image to standard jpg',
    ],
    featureList: [
      'Batch convert up to 50 WebP files (50 MB per file / 250 MB batch) to standard JPG/JPEG or lossless 8-bit alpha PNG',
      'RIFF....WEBP container and VP8/VP8L/VP8X chunk header validation with animated WebP keyframe poster extraction',
      'Customizable alpha transparency matte fill (#ffffff white, #000000 black, #f3f4f6 gray, #fef3c7 ivory, or custom hex) for JPG output',
      'Hardware-accelerated createImageBitmap decoding with automatic GPU/RAM cleanup and one-click JSZip batch archive download',
    ],
    relatedToolSlugs: ['image-compressor', 'image-to-pdf', 'pdf-merge-split', 'svg-optimizer'],
  },

  {
    id: 'image-compressor',
    name: 'Image Compressor & Perceptual Optimizer (JPG, PNG, WebP, AVIF & HEIC)',
    slug: 'image-compressor',
    categoryId: 'media',
    description:
      'Compress and resize up to 100 images (100 MB per file) 100% client-side with perceptual SSIM scoring, 5-pass binary search Target KB sizing (10 KB–100 MB), automatic EXIF stripping, and interactive Before/After split comparison.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Image Compressor — Reduce Size to 20KB, 50KB or 100KB',
    seoDescription:
      'Compress up to 100 JPG, PNG, WebP, AVIF, and HEIC images in your browser. Features 5-pass Target KB sizing (20KB, 50KB, 100KB), SSIM quality scoring & EXIF stripping.',
    keywords: [
      'image compressor online to 20kb 50kb 100kb',
      'compress jpg png webp avif heic client side',
      'reduce photo file size without losing quality',
      'exact target kb image size reducer portal',
      'perceptual ssim psnr image quality analyzer',
      'batch resize and compress 100 photos zip',
      'strip gps camera exif metadata from photos',
      'convert heic avif to compressed webp jpeg',
      'interactive split screen image comparison',
      'zero upload private browser photo optimizer',
    ],
    featureList: [
      '4 optimization modes: Smart Perceptual Auto-Tuning, Target File Size (10 KB to 100 MB via 5-pass binary search), Lossless, and Maximum Compression',
      '0–100 Perceptual Quality Match scoring combining 16×16 block SSIM (0.34), Sobel edge energy (0.24), MAE (0.20), RGB color error (0.12), and RMSE (0.10)',
      'Batch processing up to 100 images (100 MB per file) across JPG, PNG, WebP, AVIF, HEIC/HEIF, GIF, BMP, and TIFF with automatic EXIF/GPS metadata stripping',
      'Interactive Before/After split-slider visual comparison, 9 aspect-ratio-locked resize presets, and consolidated ZIP archive download',
    ],
    relatedToolSlugs: ['webp-to-jpg-png', 'image-to-pdf', 'svg-optimizer', 'pdf-merge-split'],
  },

  // ============================================================
  // SEO & TEXT
  // ============================================================

  {
    id: 'qr-generator',
    name: 'Custom QR Code Generator — Static URL, Wi-Fi, vCard, Logo & Vector SVG/PDF',
    slug: 'qr-generator',
    categoryId: 'seo',
    description:
      'Generate 100% permanent, unexpiring static QR codes across 8 payload types with custom colors, center logos, live 0–95 scan reliability scoring, in-browser optical verification, and print-ready PNG, SVG, WebP, JPEG, or A4 PDF exports.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Free QR Code Generator — Custom Logo, Wi-Fi, vCard & SVG',
    seoDescription:
      'Generate permanent, unexpiring static QR codes for URLs, Wi-Fi, vCard 3.0, Email, SMS & Events in your browser. Add logos, verify scan score, and export SVG, PDF or PNG.',
    keywords: [
      'free qr code generator no expiration',
      'static qr code generator with logo',
      'wifi qr code generator wpa2 no password typing',
      'vcard 3.0 digital business card qr code',
      'vector svg pdf high dpi png qr code maker',
      'qr code contrast and scan reliability checker',
      'built in webcam image qr code scanner verifier',
      'icalendar event email sms tel qr generator',
      'reed solomon level h 30 error correction qr',
      'commercial print ready qr code studio free',
    ],
    featureList: [
      '100% static, permanent, unexpiring QR codes across 8 payload schemas: URL, Plain Text, Wi-Fi, vCard 3.0, Email, Phone, SMS, and iCalendar Event',
      'Custom center logo embedding with automatic promotion to Reed-Solomon Level H (30% error recovery) and quiet-zone margin controls',
      'Real-time 0–95 Optical Scan Reliability Score, WCAG 2.1 luminance contrast checker, and built-in BarcodeDetector / jsQR optical verification scanner',
      '5 export formats: High-DPI PNG (up to 2048px), infinite-scale Vector SVG, print-ready A4 PDF spec sheet, WebP, JPEG, and one-click Clipboard copy',
    ],
    relatedToolSlugs: ['meta-generator', 'text-analyzer', 'text-case-converter', 'base64-encoder'],
  },

  {
    id: 'text-analyzer',
    name: 'Word Counter, Readability Auditor & Grammar Writing Coach',
    slug: 'text-analyzer',
    categoryId: 'seo',
    description:
      'Analyze word count, Unicode grapheme characters, 6 readability formulas (Flesch, Gunning Fog, SMOG, Coleman-Liau, ARI), N-gram keyword density, speaking pace, and context-aware grammar & style findings 100% client-side.',
    isPopular: true,
    status: 'published',
    hidden: false,
    excludeFromSitemap: false,
    seoTitle: 'Word Counter, Readability Checker & Grammar Writing Coach',
    seoDescription:
      'Count words and Unicode graphemes, calculate 6 readability scores (Flesch, Gunning Fog, SMOG, ARI), analyze 1–3 word N-gram keyword density, and check grammar locally.',
    keywords: [
      'word counter character counter online',
      'readability score calculator flesch kincaid gunning fog',
      'smog index coleman liau ari grade level checker',
      'n gram keyword density analyzer seo',
      'free client side grammar and passive voice checker',
      'reading time and speaking pace teleprompter timer',
      'twitter x meta title linkedin character limit checker',
      'unicode grapheme cluster emoji word counter',
      'sentence length variance and style writing coach',
      'freelance writing word rate earnings calculator',
    ],
    featureList: [
      'Real-time Unicode grapheme-aware character, word, sentence, paragraph, and line counting with platform character limit bars (X/Twitter, Meta Title/Desc, LinkedIn)',
      '6 academic readability indices: Flesch Reading Ease, Flesch-Kincaid Grade, Gunning Fog, SMOG Index, Coleman-Liau, and Automated Readability Index (ARI)',
      '8-layer context-aware English Grammar & Style Engine detecting subject-verb agreement, comma splices, passive voice, clausal overload, and filler phrases with safe 1-click fixes',
      'Stop-word filtered 1-word, 2-word, and 3-word N-gram keyword density tables, customizable Speaking WPM & freelance rate estimator, and downloadable audit report',
    ],
    relatedToolSlugs: ['text-case-converter', 'meta-generator', 'qr-generator', 'regex-tester', 'json-formatter'],
  },

  {
    id: 'text-case-converter',
    name: 'Text Case Converter — 15 Editorial & Developer Naming Formats',
    slug: 'text-case-converter',
    categoryId: 'seo',
    description:
      'Transform text instantly across 7 editorial writing cases and 8 developer identifier formats with acronym-aware tokenization, 191-language Unicode rules, 5 whitespace/line-ending cleanups, and live reading/speaking telemetry.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Text Case Converter — 15 Formats, Title Case & camelCase',
    seoDescription:
      'Convert text across 15 modes: UPPERCASE, lowercase, AP/Chicago Title Case, Sentence case, camelCase, PascalCase, snake_case & kebab-case across 191 Unicode locales.',
    keywords: [
      'text case converter online',
      'ap chicago style title case converter',
      'sentence case uppercase lowercase converter',
      'camelcase pascalcase snake_case kebab-case converter',
      'constant_case dot.case path/case programmer naming',
      'turkish german dutch greek locale unicode case',
      'smart acronym aware identifier tokenizer',
      'remove duplicate lines trim whitespace normalize quotes',
      'alternating case inverse case text generator',
      'client side unicode text transformation tool',
    ],
    featureList: [
      '7 editorial writing modes (Sentence case, Title Case, Capitalized Case, lowercase, UPPERCASE, aLtErNaTiNg cAsE, InVeRsE CaSe)',
      '8 developer identifier formats (camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case, path/case, COBOL-CASE) with acronym-aware tokenization',
      '191 BCP-47 language locales supporting Turkish/Azerbaijani dotted İ/ı, Dutch IJ digraphs, German ß/SS, Greek final sigma (ς), and Lithuanian accents',
      '5 one-click whitespace & line-ending cleanup utilities (Trim, Normalize Spaces, Remove Blank Lines, Trim Lines, CRLF to LF) with live reading/speaking telemetry',
    ],
    relatedToolSlugs: ['text-analyzer', 'meta-generator', 'json-formatter', 'base64-encoder', 'regex-tester'],
  },

  {
    id: 'meta-generator',
    name: 'Meta Tag, Open Graph & Next.js Metadata Generator + SEO Auditor',
    slug: 'meta-generator',
    categoryId: 'seo',
    description:
      'Author HTML meta tags, Open Graph markup, Twitter/X Cards, and typed Next.js App Router Metadata objects with 6 live SERP/social previews and a built-in 0–100 URL & HTML SEO Auditor.',
    isPopular: true,
    status: 'published',
    seoTitle: 'Meta Tag & Open Graph Generator — SERP Preview & Auditor',
    seoDescription:
      'Generate W3C HTML meta tags, Open Graph (og:*), Twitter/X Cards, and Next.js App Router Metadata. Preview on Google, FB, X, LinkedIn & Discord, or audit any URL (0–100).',
    keywords: [
      'meta tag generator html seo',
      'open graph og tag twitter card generator',
      'google serp snippet pixel width simulator',
      'social media share preview facebook x linkedin discord',
      'nextjs app router metadata typescript code generator',
      'live url seo meta tag auditor health score',
      'canonical url robots index follow directives generator',
      'article and ecommerce product open graph tags',
      'xss safe html head metadata builder',
      'free webmaster on page seo meta studio',
    ],
    featureList: [
      'Complete W3C HTML <head> tag authoring (Title, Description, Canonical URL, Robots directives matrix, Viewport, Charset, Theme Color, and Custom tags)',
      'Open Graph (Website, Article, Product, Profile, Video, Music) and Twitter/X Card (Summary, Large Image, App, Player) synchronization',
      '6 interactive real-time previews: Google Desktop SERP, Google Mobile SERP, Facebook Feed, X/Twitter Card, LinkedIn Post, and Discord Embed',
      'Typed Next.js App Router Metadata (TypeScript) code exporter and built-in 0–100 SEO Health Auditor for live URLs (SSRF-protected) and raw HTML markup',
    ],
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