export interface HomeFaqItem {
  question: string;
  answer: string;
}

export const HOME_FAQS: HomeFaqItem[] = [
  {
    question: 'Are KivaroTools utilities free to use without creating an account?',
    answer:
      'Yes. Every published utility on KivaroTools is free to use in your browser with no account registration, no subscription tiers, and no watermarks on exported PDFs, images, spreadsheets, or QR codes.',
  },
  {
    question: 'Which tools run locally in my browser, and which ones make network requests?',
    answer:
      'Document processors, image converters, code formatters, database/columnar viewers, and standard financial calculators execute locally in your browser memory without uploading your files to KivaroTools servers. Tools that explicitly fetch live external data—Precious Metals (indicative futures/spot quotes), Currency & Crypto Converter (exchange rates), and Meta Tag URL Auditor (fetching the public URL you enter)—make outbound requests only for those specific lookups. The website itself may also load standard analytics.',
  },
  {
    question: 'Do I need to install browser extensions or desktop software?',
    answer:
      'No. Every workspace runs directly in modern desktop and mobile browsers (Chrome, Safari, Firefox, Edge, and Brave) with zero extensions or desktop installers.',
  },
  {
    question: 'What are the practical file size limits for browser-based tools?',
    answer:
      'Because file processing runs locally in your browser RAM, practical limits depend on your device memory and the specific tool (for example, up to 25 MB for JSON formatting, 50 MB for JSON-to-Excel conversion, and larger multi-file batches on desktop hardware). For multi-gigabyte files or encrypted enterprise archives, dedicated desktop software is recommended.',
  },
  {
    question: 'Can I use KivaroTools on mobile phones and tablets?',
    answer:
      'Yes. Every tool workspace and navigation view is built with responsive layouts, touch-friendly controls, and horizontal scroll containment for tables and code blocks across mobile, tablet, and desktop screens.',
  },
  {
    question: 'Are financial and salary tax calculation results binding advice?',
    answer:
      'No. All financial and country salary calculators—including Mortgage Amortization, Loan EMI, Compound Interest, SIP projections, Precious Metals melt valuations, and the 22 country salary calculators—are deterministic estimation models for planning and educational use. Always verify binding loan terms, tax filings, and investment decisions with a qualified professional.',
  },
];