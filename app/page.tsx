import type { Metadata } from 'next';
import HomeClient from '@/components/home/HomeClient';
import { SITE_URL } from '@/config/site';

export const metadata: Metadata = {
  title: 'Free Online Tools',
  description:
    'Free online tools for developers, creators, businesses, and everyday tasks. Simple, practical, and privacy-conscious.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'OmniTools — Free Online Tools',
    description:
      'Free online tools for developers, creators, businesses, and everyday tasks.',
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OmniTools — Free Online Tools',
    description:
      'Free online tools for developers, creators, businesses, and everyday tasks.',
  },
};

export default function HomePage() {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'OmniTools',
    url: SITE_URL,
    description:
      'Free online tools for developers, creators, businesses, and everyday tasks. Simple, practical, and privacy-conscious.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <HomeClient />
    </>
  );
}