import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/tools',
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
        source: '/finance/auto-loan-calculator',
        destination: '/finance/emi-calculator',
        permanent: true,
      },
      {
        source: '/dev/urandom',
        destination: '/developer/password-generator',
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
      // 1. Specific legacy alias with category change (must precede generic /image/:slug)
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
        source: '/media/webp-converter',
        destination: '/media/webp-to-jpg-png',
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
    ];
  },
};

export default nextConfig;
