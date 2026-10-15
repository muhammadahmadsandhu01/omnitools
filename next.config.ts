import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
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
    ];
  },
};

export default nextConfig;
