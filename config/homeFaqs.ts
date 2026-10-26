export interface HomeFaqItem {
  question: string;
  answer: string;
}

export const HOME_FAQS: HomeFaqItem[] = [
  {
    question: 'Are KivaroTools utilities completely free to use?',
    answer:
      'Yes. Every utility published on KivaroTools is 100% free to use with no account registration, no subscription tiers, no daily conversion quotas, and no watermarks on exported PDFs, images, spreadsheets, or QR codes.',
  },
  {
    question: 'Are my confidential files, code snippets, or financial inputs uploaded to a server?',
    answer:
      'File converters, developer formatters, PDF processors, image optimizers, cryptographic generators, and financial calculators execute 100% locally inside your browser memory using Web Workers, HTML5 Canvas, WebAssembly, and the Web Cryptography API. Your files and inputs never leave your device. Only tools that explicitly display live market rates (Precious Metals and Currency/Crypto Converter) or inspect a public URL you enter (Meta Tag URL Auditor) make outbound requests for those specific public lookups.',
  },
  {
    question: 'Do I need to create an account or install browser extensions?',
    answer:
      'No account, email sign-up, or browser extension is required. Every workspace loads immediately in any modern desktop or mobile browser (Chrome, Safari, Firefox, Edge, Brave).',
  },
  {
    question: 'How does KivaroTools handle large files like 25 MB JSON, 50 MB CSV exports, or 750 MB PDF batches?',
    answer:
      'Unlike basic online tools that freeze the browser tab on large inputs, KivaroTools uses isolated background Web Workers, 60-FPS virtualized DOM trees, and chunked TypedArray streaming. This allows smooth processing of up to 25 MB JSON files, 50 MB nested JSON-to-Excel datasets, 750 MB PDF merge batches, and 1 GB file checksums directly on your hardware.',
  },
  {
    question: 'Can I use KivaroTools on mobile phones and tablets?',
    answer:
      'Yes. Every tool interface is engineered with responsive fluid grids, touch-friendly controls, and horizontal scroll containment so you can calculate mortgages, convert WebP photos, generate invoices, or format code seamlessly on any screen size from 320px smartphones to 4K desktop monitors.',
  },
  {
    question: 'Are financial and tax calculation results binding financial advice?',
    answer:
      'No. All financial calculators—including Mortgage Amortization, Loan EMI, Compound Interest, SIP & Mutual Fund projections, and Precious Metals melt valuations—are deterministic mathematical models provided strictly for educational estimation and planning purposes. Always verify binding loan disclosures, tax obligations, and investment decisions with a licensed financial or tax professional.',
  },
];
