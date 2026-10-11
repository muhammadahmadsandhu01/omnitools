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

export interface Tool {
  id: string;
  name: string;
  slug: string;
  categoryId: CategoryId;
  description: string;
  isPopular?: boolean;
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
  },

  {
    id: 'mortgage-calculator',
    name: 'Mortgage & Home Loan Calculator',
    slug: 'mortgage-calculator',
    categoryId: 'finance',
    description:
      'Calculate monthly mortgage payments, total interest, and estimated costs including property tax, insurance, and down payment.',
    isPopular: true,
  },

  {
    id: 'invoice-generator',
    name: 'Pro Invoice Generator (PDF)',
    slug: 'invoice-generator',
    categoryId: 'finance',
    description:
      'Create professional, print-ready PDF invoices with automatic calculations and browser-based editing.',
    isPopular: true,
  },

  {
    id: 'emi-calculator',
    name: 'Personal & Auto Loan EMI Calculator',
    slug: 'emi-calculator',
    categoryId: 'finance',
    description:
      'Calculate monthly EMI, total interest, and repayment amounts for personal, car, or education loans.',
    isPopular: true,
  },

  {
    id: 'compound-interest',
    name: 'Compound Interest Calculator',
    slug: 'compound-interest',
    categoryId: 'finance',
    description:
      'Calculate compound growth, estimated returns, and long-term investment value over time.',
    isPopular: true,
  },

  {
    id: 'sip-calculator',
    name: 'SIP & Mutual Funds Calculator',
    slug: 'sip-calculator',
    categoryId: 'finance',
    description:
      'Estimate potential SIP and mutual fund growth based on investment amount, duration, and expected return.',
    isPopular: true,
  },

  {
    id: 'salary-calculator',
    name: 'Salary & Net Take-Home Pay',
    slug: 'salary-calculator',
    categoryId: 'finance',
    description:
      'Estimate take-home salary after taxes and other deductions using the selected calculation assumptions.',
    isPopular: false,
  },

  {
    id: 'auto-loan-calculator',
    name: 'Auto / Car Loan Calculator',
    slug: 'auto-loan-calculator',
    categoryId: 'finance',
    description:
      'Estimate monthly car payments, total repayment, and interest over the selected loan term.',
    isPopular: false,
  },

  {
    id: 'crypto-converter',
    name: 'Crypto & Currency Converter',
    slug: 'crypto-converter',
    categoryId: 'finance',
    description:
      'Convert between supported fiat currencies and cryptocurrencies using available exchange-rate data.',
    isPopular: true,
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
  },

  {
    id: 'svg-optimizer',
    name: 'SVG Optimizer & Cleaner',
    slug: 'svg-optimizer',
    categoryId: 'developer',
    description:
      'Optimize SVG markup by cleaning unnecessary data and reducing file size.',
    isPopular: true,
  },

  {
    id: 'password-generator',
    name: 'Secure Password & Hash Generator',
    slug: 'password-generator',
    categoryId: 'developer',
    description:
      'Generate strong passwords and create common cryptographic hashes for supported text or file data.',
    isPopular: true,
  },

  {
    id: 'json-converter',
    name: 'JSON to CSV / Excel',
    slug: 'json-converter',
    categoryId: 'developer',
    description:
      'Convert JSON data into CSV or Excel-compatible files directly in your browser.',
    isPopular: true,
  },

  {
    id: 'base64-encoder',
    name: 'Base64 Encoder & Decoder',
    slug: 'base64-encoder',
    categoryId: 'developer',
    description:
      'Encode text to Base64 or decode Base64 strings directly in your browser.',
    isPopular: true,
  },

  {
    id: 'sql-formatter',
    name: 'SQL Query Formatter',
    slug: 'sql-formatter',
    categoryId: 'developer',
    description:
      'Format and clean SQL queries for improved readability and easier development.',
    isPopular: true,
  },

  {
    id: 'regex-tester',
    name: 'Regex Tester & Code Generator',
    slug: 'regex-tester',
    categoryId: 'developer',
    description:
      'Test regular expressions with live matching and generate code examples for supported languages.',
    isPopular: true,
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
  },

  {
    id: 'image-to-pdf',
    name: 'Image to PDF Converter',
    slug: 'image-to-pdf',
    categoryId: 'document',
    description:
      'Convert JPG, PNG, WebP, BMP, and GIF images into a PDF document directly in your browser.',
    isPopular: true,
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
  },


  {
    id: 'image-compressor',
    name: 'Image Compressor & Optimizer',
    slug: 'image-compressor',
    categoryId: 'media',
    description:
      'Reduce image file size with adjustable compression directly in your browser.',
    isPopular: true,
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
  },

  {
    id: 'text-analyzer',
    name: 'Word Counter & Text Analyzer',
    slug: 'text-analyzer',
    categoryId: 'seo',
    description:
      'Analyze word count, character count, readability, keyword usage, and other text metrics.',
    isPopular: true,
  },

  {
    id: 'text-case-converter',
    name: 'Text Case Converter',
    slug: 'text-case-converter',
    categoryId: 'seo',
    description:
      'Convert text between uppercase, lowercase, title case, camelCase, snake_case, PascalCase, and 14 developer and natural language formats.',
    isPopular: true,
  },


  {
    id: 'meta-generator',
    name: 'Meta Tag & Open Graph Generator',
    slug: 'meta-generator',
    categoryId: 'seo',
    description:
      'Generate HTML meta tags and Open Graph markup for search and social sharing.',
    isPopular: false,
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