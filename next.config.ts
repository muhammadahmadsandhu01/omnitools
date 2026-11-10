import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/((?!api/).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/tools',
        destination: '/',
        permanent: true,
      },
      {
        source: '/tools/:slug*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/health',
        destination: '/',
        permanent: true,
      },
      {
        source: '/health/bmi-calculator',
        destination: '/',
        permanent: true,
      },
      {
        source: '/health/:slug*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/bmi-calculator',
        destination: '/',
        permanent: true,
      },
      {
        source: '/finance/auto-loan-calculator',
        destination: '/finance/emi-calculator',
        permanent: true,
      },
      {
        source: '/auto-loan-calculator',
        destination: '/finance/emi-calculator',
        permanent: true,
      },
      {
        source: '/dev/urandom',
        destination: '/developer/password-generator',
        permanent: true,
      },
      {
        source: '/dev/:slug',
        destination: '/developer/:slug',
        permanent: true,
      },
      {
        source: '/$',
        destination: '/',
        permanent: true,
      },
      {
        source: '/&',
        destination: '/',
        permanent: true,
      },
      {
        source: '/%24',
        destination: '/',
        permanent: true,
      },
      {
        source: '/%26',
        destination: '/',
        permanent: true,
      },
      // GSC 404 Exact Remediation Redirects (All 23 URLs from GSC Coverage Report)
      {
        source: '/admin',
        destination: '/seo/llms-txt-generator',
        permanent: true,
      },
      {
        source: '/admin/:slug*',
        destination: '/seo/llms-txt-generator',
        permanent: true,
      },
      {
        source: '/checkout',
        destination: '/seo/llms-txt-generator',
        permanent: true,
      },
      {
        source: '/checkout/:slug*',
        destination: '/seo/llms-txt-generator',
        permanent: true,
      },
      {
        source: '/llms-full.txt',
        destination: '/llms.txt',
        permanent: true,
      },
      {
        source: '/llms-ctx.txt',
        destination: '/llms.txt',
        permanent: true,
      },
      {
        source: '/ai.txt',
        destination: '/seo/llms-txt-generator',
        permanent: true,
      },
      {
        source: '/Title',
        destination: '/document/pdf-scrubber',
        permanent: true,
      },
      {
        source: '/Annots',
        destination: '/document/pdf-scrubber',
        permanent: true,
      },
      {
        source: '/WinAnsiEncoding',
        destination: '/document/pdf-to-word',
        permanent: true,
      },
      {
        source: '/OCGs',
        destination: '/document/pdf-scrubber',
        permanent: true,
      },
      {
        source: '/AcroForm',
        destination: '/document/pdf-scrubber',
        permanent: true,
      },
      {
        source: '/Thumb',
        destination: '/document/pdf-scrubber',
        permanent: true,
      },
      {
        source: '/AA',
        destination: '/document/pdf-scrubber',
        permanent: true,
      },
      {
        source: '/URI',
        destination: '/document/pdf-scrubber',
        permanent: true,
      },
      {
        source: '/EmbeddedFiles',
        destination: '/document/pdf-scrubber',
        permanent: true,
      },
      {
        source: '/OpenAction',
        destination: '/document/pdf-scrubber',
        permanent: true,
      },
      {
        source: '/Launch',
        destination: '/document/pdf-scrubber',
        permanent: true,
      },
      {
        source: '/JavaScript',
        destination: '/document/pdf-scrubber',
        permanent: true,
      },
      {
        source: '/FlateDecode',
        destination: '/document/pdf-to-word',
        permanent: true,
      },
      {
        source: '/Info',
        destination: '/document/pdf-scrubber',
        permanent: true,
      },
      {
        source: '/Metadata',
        destination: '/document/pdf-scrubber',
        permanent: true,
      },
      {
        source: '/Outlines',
        destination: '/document/pdf-scrubber',
        permanent: true,
      },
      // 1. Specific legacy alias with category change (must precede generic /image/:slug & /pdf/:slug)
      {
        source: '/developer/llms-txt-generator',
        destination: '/seo/llms-txt-generator',
        permanent: true,
      },
      {
        source: '/developer/llms-txt-validator',
        destination: '/seo/llms-txt-generator',
        permanent: true,
      },
      {
        source: '/developer/llms-full-txt-generator',
        destination: '/seo/llms-txt-generator',
        permanent: true,
      },
      {
        source: '/developer/ai-robots-txt-generator',
        destination: '/seo/llms-txt-generator',
        permanent: true,
      },
      {
        source: '/developer/ai-crawler-generator',
        destination: '/seo/llms-txt-generator',
        permanent: true,
      },
      {
        source: '/developer/tdmrep-generator',
        destination: '/seo/llms-txt-generator',
        permanent: true,
      },
      {
        source: '/pdf/image-to-pdf',
        destination: '/document/image-to-pdf',
        permanent: true,
      },
      {
        source: '/pdf/pdf-merge-split',
        destination: '/document/pdf-merge-split',
        permanent: true,
      },
      {
        source: '/pdf/pdf-to-word',
        destination: '/document/pdf-to-word',
        permanent: true,
      },
      {
        source: '/pdf/word-to-pdf',
        destination: '/document/word-to-pdf',
        permanent: true,
      },
      {
        source: '/pdf/pdf-to-excel',
        destination: '/document/pdf-to-excel',
        permanent: true,
      },
      {
        source: '/pdf/excel-to-pdf',
        destination: '/document/excel-to-pdf',
        permanent: true,
      },
      {
        source: '/pdf/pdf-to-ppt',
        destination: '/document/pdf-to-ppt',
        permanent: true,
      },
      {
        source: '/pdf/pdf-to-jpg',
        destination: '/document/pdf-to-jpg',
        permanent: true,
      },
      {
        source: '/pdf/compress-pdf',
        destination: '/document/compress-pdf',
        permanent: true,
      },
      {
        source: '/pdf',
        destination: '/document',
        permanent: true,
      },
      {
        source: '/pdf/:slug',
        destination: '/document/:slug',
        permanent: true,
      },
      {
        source: '/image/image-to-pdf',
        destination: '/document/image-to-pdf',
        permanent: true,
      },
      {
        source: '/media/image-to-pdf',
        destination: '/document/image-to-pdf',
        permanent: true,
      },
      {
        source: '/image/webp-converter',
        destination: '/media/webp-to-jpg-png',
        permanent: true,
      },
      {
        source: '/image/heic-to-jpg',
        destination: '/media/heic-to-jpg',
        permanent: true,
      },
      {
        source: '/image/heic-to-png',
        destination: '/media/heic-to-jpg',
        permanent: true,
      },
      {
        source: '/image/avif-to-jpg',
        destination: '/media/heic-to-jpg',
        permanent: true,
      },
      {
        source: '/image/avif-to-png',
        destination: '/media/heic-to-jpg',
        permanent: true,
      },
      {
        source: '/image/heic-converter',
        destination: '/media/heic-to-jpg',
        permanent: true,
      },
      {
        source: '/image/avif-converter',
        destination: '/media/heic-to-jpg',
        permanent: true,
      },
      {
        source: '/image/heif-to-jpg',
        destination: '/media/heic-to-jpg',
        permanent: true,
      },
      // 2. Legacy category /image -> /media
      {
        source: '/image',
        destination: '/media',
        permanent: true,
      },
      // 3. Legacy category /image/:slug -> /media/:slug
      {
        source: '/image/:slug',
        destination: '/media/:slug',
        permanent: true,
      },
      // 4. Specific verified tool slug aliases
      {
        source: '/document/pdf-to-docx',
        destination: '/document/pdf-to-word',
        permanent: true,
      },
      {
        source: '/document/docx-to-pdf',
        destination: '/document/word-to-pdf',
        permanent: true,
      },
      {
        source: '/document/pdf-to-xlsx',
        destination: '/document/pdf-to-excel',
        permanent: true,
      },
      {
        source: '/document/xlsx-to-pdf',
        destination: '/document/excel-to-pdf',
        permanent: true,
      },
      {
        source: '/document/pdf-to-pptx',
        destination: '/document/pdf-to-ppt',
        permanent: true,
      },
      {
        source: '/document/pdf-to-powerpoint',
        destination: '/document/pdf-to-ppt',
        permanent: true,
      },
      {
        source: '/document/pdf-to-png',
        destination: '/document/pdf-to-jpg',
        permanent: true,
      },
      {
        source: '/document/pdf-to-image',
        destination: '/document/pdf-to-jpg',
        permanent: true,
      },
      {
        source: '/document/pdf-compressor',
        destination: '/document/compress-pdf',
        permanent: true,
      },
      {
        source: '/document/reduce-pdf-size',
        destination: '/document/compress-pdf',
        permanent: true,
      },
      {
        source: '/document/shrink-pdf',
        destination: '/document/compress-pdf',
        permanent: true,
      },
      {
        source: '/document/compress-pdf-to-100kb',
        destination: '/document/compress-pdf',
        permanent: true,
      },
      {
        source: '/document/compress-pdf-to-200kb',
        destination: '/document/compress-pdf',
        permanent: true,
      },
      {
        source: '/document/pdf-redactor',
        destination: '/document/pdf-scrubber',
        permanent: true,
      },
      {
        source: '/document/pdf-pii-scrubber',
        destination: '/document/pdf-scrubber',
        permanent: true,
      },
      {
        source: '/document/bank-statement-redactor',
        destination: '/document/pdf-scrubber',
        permanent: true,
      },
      {
        source: '/document/invoice-redactor',
        destination: '/document/pdf-scrubber',
        permanent: true,
      },
      {
        source: '/document/redact-pdf',
        destination: '/document/pdf-scrubber',
        permanent: true,
      },
      {
        source: '/document/sign-pdf',
        destination: '/document/pdf-signer-bates-stamper',
        permanent: true,
      },
      {
        source: '/document/pdf-watermark',
        destination: '/document/pdf-signer-bates-stamper',
        permanent: true,
      },
      {
        source: '/document/bates-numbering-pdf',
        destination: '/document/pdf-signer-bates-stamper',
        permanent: true,
      },
      {
        source: '/document/bates-stamping',
        destination: '/document/pdf-signer-bates-stamper',
        permanent: true,
      },
      {
        source: '/document/pdf-exhibit-stamp',
        destination: '/document/pdf-signer-bates-stamper',
        permanent: true,
      },
      {
        source: '/document/pdf-digital-signer',
        destination: '/document/pdf-signer-bates-stamper',
        permanent: true,
      },
      {
        source: '/media/webp-converter',
        destination: '/media/webp-to-jpg-png',
        permanent: true,
      },
      {
        source: '/media/heic-to-png',
        destination: '/media/heic-to-jpg',
        permanent: true,
      },
      {
        source: '/media/avif-to-jpg',
        destination: '/media/heic-to-jpg',
        permanent: true,
      },
      {
        source: '/media/avif-to-png',
        destination: '/media/heic-to-jpg',
        permanent: true,
      },
      {
        source: '/media/heic-converter',
        destination: '/media/heic-to-jpg',
        permanent: true,
      },
      {
        source: '/media/avif-converter',
        destination: '/media/heic-to-jpg',
        permanent: true,
      },
      {
        source: '/media/heif-to-jpg',
        destination: '/media/heic-to-jpg',
        permanent: true,
      },
      {
        source: '/seo/case-converter',
        destination: '/seo/text-case-converter',
        permanent: true,
      },
      {
        source: '/finance/currency-converter',
        destination: '/finance/crypto-converter',
        permanent: true,
      },
      {
        source: '/finance/startup-runway-calculator',
        destination: '/finance/saas-burn-rate-calculator',
        permanent: true,
      },
      {
        source: '/finance/safe-dilution-calculator',
        destination: '/finance/saas-burn-rate-calculator',
        permanent: true,
      },
      {
        source: '/finance/cap-table-simulator',
        destination: '/finance/saas-burn-rate-calculator',
        permanent: true,
      },
      {
        source: '/finance/default-alive-calculator',
        destination: '/finance/saas-burn-rate-calculator',
        permanent: true,
      },
      {
        source: '/finance/burn-multiple-calculator',
        destination: '/finance/saas-burn-rate-calculator',
        permanent: true,
      },
      {
        source: '/finance/liquidation-preference-calculator',
        destination: '/finance/saas-burn-rate-calculator',
        permanent: true,
      },
      {
        source: '/finance/1099-vs-w2-calculator',
        destination: '/finance/contractor-vs-employee-calculator',
        permanent: true,
      },
      {
        source: '/finance/w2-to-1099-calculator',
        destination: '/finance/contractor-vs-employee-calculator',
        permanent: true,
      },
      {
        source: '/finance/ir35-calculator',
        destination: '/finance/contractor-vs-employee-calculator',
        permanent: true,
      },
      {
        source: '/finance/s-corp-tax-calculator',
        destination: '/finance/contractor-vs-employee-calculator',
        permanent: true,
      },
      {
        source: '/finance/t4-vs-incorporated-calculator',
        destination: '/finance/contractor-vs-employee-calculator',
        permanent: true,
      },
      {
        source: '/finance/eor-cost-calculator',
        destination: '/finance/contractor-vs-employee-calculator',
        permanent: true,
      },
      {
        source: '/seo/meta-tags-generator',
        destination: '/seo/meta-generator',
        permanent: true,
      },
      {
        source: '/seo/open-graph-generator',
        destination: '/seo/meta-generator',
        permanent: true,
      },
      {
        source: '/seo/llms-txt-validator',
        destination: '/seo/llms-txt-generator',
        permanent: true,
      },
      {
        source: '/seo/llms-full-txt-generator',
        destination: '/seo/llms-txt-generator',
        permanent: true,
      },
      {
        source: '/seo/ai-robots-txt-generator',
        destination: '/seo/llms-txt-generator',
        permanent: true,
      },
      {
        source: '/seo/ai-crawler-generator',
        destination: '/seo/llms-txt-generator',
        permanent: true,
      },
      {
        source: '/seo/tdmrep-generator',
        destination: '/seo/llms-txt-generator',
        permanent: true,
      },
      {
        source: '/seo/regex-tester',
        destination: '/developer/regex-tester',
        permanent: true,
      },
      {
        source: '/regex-tester',
        destination: '/developer/regex-tester',
        permanent: true,
      },
      {
        source: '/developer/parquet-to-csv',
        destination: '/developer/parquet-viewer',
        permanent: true,
      },
      {
        source: '/developer/avro-viewer',
        destination: '/developer/parquet-viewer',
        permanent: true,
      },
      {
        source: '/developer/avro-to-json',
        destination: '/developer/parquet-viewer',
        permanent: true,
      },
      {
        source: '/developer/avro-to-csv',
        destination: '/developer/parquet-viewer',
        permanent: true,
      },
      {
        source: '/developer/feather-viewer',
        destination: '/developer/parquet-viewer',
        permanent: true,
      },
      {
        source: '/developer/arrow-viewer',
        destination: '/developer/parquet-viewer',
        permanent: true,
      },
      {
        source: '/developer/feather-to-csv',
        destination: '/developer/parquet-viewer',
        permanent: true,
      },
      {
        source: '/developer/har-viewer',
        destination: '/developer/har-analyzer',
        permanent: true,
      },
      {
        source: '/developer/har-sanitizer',
        destination: '/developer/har-analyzer',
        permanent: true,
      },
      {
        source: '/developer/har-to-k6',
        destination: '/developer/har-analyzer',
        permanent: true,
      },
      {
        source: '/developer/har-to-playwright',
        destination: '/developer/har-analyzer',
        permanent: true,
      },
      {
        source: '/developer/har-to-openapi',
        destination: '/developer/har-analyzer',
        permanent: true,
      },
      {
        source: '/developer/saml-har-analyzer',
        destination: '/developer/har-analyzer',
        permanent: true,
      },
      {
        source: '/developer/sqlite-browser',
        destination: '/developer/sqlite-viewer',
        permanent: true,
      },
      {
        source: '/developer/duckdb-viewer',
        destination: '/developer/sqlite-viewer',
        permanent: true,
      },
      {
        source: '/developer/sqlite-online',
        destination: '/developer/sqlite-viewer',
        permanent: true,
      },
      {
        source: '/developer/db-file-viewer',
        destination: '/developer/sqlite-viewer',
        permanent: true,
      },
      {
        source: '/developer/sqlite-erd-generator',
        destination: '/developer/sqlite-viewer',
        permanent: true,
      },
      {
        source: '/developer/sqlite-to-postgres',
        destination: '/developer/sqlite-viewer',
        permanent: true,
      },
      {
        source: '/developer/openapi-to-zod',
        destination: '/developer/openapi-to-typescript',
        permanent: true,
      },
      {
        source: '/developer/swagger-to-typescript',
        destination: '/developer/openapi-to-typescript',
        permanent: true,
      },
      {
        source: '/developer/swagger-to-zod',
        destination: '/developer/openapi-to-typescript',
        permanent: true,
      },
      {
        source: '/developer/openapi-mock-generator',
        destination: '/developer/openapi-to-typescript',
        permanent: true,
      },
      {
        source: '/developer/openapi-msw-generator',
        destination: '/developer/openapi-to-typescript',
        permanent: true,
      },
      {
        source: '/developer/openapi-tanstack-query-generator',
        destination: '/developer/openapi-to-typescript',
        permanent: true,
      },
      {
        source: '/developer/paseto-debugger',
        destination: '/developer/jwt-debugger',
        permanent: true,
      },
      {
        source: '/developer/saml-decoder',
        destination: '/developer/jwt-debugger',
        permanent: true,
      },
      {
        source: '/developer/saml-debugger',
        destination: '/developer/jwt-debugger',
        permanent: true,
      },
      {
        source: '/developer/jwe-debugger',
        destination: '/developer/jwt-debugger',
        permanent: true,
      },
      {
        source: '/developer/jwk-to-pem',
        destination: '/developer/jwt-debugger',
        permanent: true,
      },
      {
        source: '/developer/jwt-decoder',
        destination: '/developer/jwt-debugger',
        permanent: true,
      },
      {
        source: '/developer/cron-generator',
        destination: '/developer/cron-expression-generator',
        permanent: true,
      },
      {
        source: '/developer/crontab-guru',
        destination: '/developer/cron-expression-generator',
        permanent: true,
      },
      {
        source: '/developer/quartz-cron-generator',
        destination: '/developer/cron-expression-generator',
        permanent: true,
      },
      {
        source: '/developer/aws-eventbridge-cron',
        destination: '/developer/cron-expression-generator',
        permanent: true,
      },
      {
        source: '/developer/kubernetes-cronjob-generator',
        destination: '/developer/cron-expression-generator',
        permanent: true,
      },
      {
        source: '/developer/cron-to-systemd',
        destination: '/developer/cron-expression-generator',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;