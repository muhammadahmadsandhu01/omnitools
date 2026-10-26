import type { Metadata } from 'next';
import HomeClient from '@/components/home/HomeClient';
import { HOME_FAQS } from '@/config/homeFaqs';
import { SITE_URL, CONTACT_EMAIL } from '@/config/site';
import { getPublicTools } from '@/config/toolsData';

export const metadata: Metadata = {
  title: 'Free Online Tools for Finance, Developers, PDF, Media & SEO',
  description:
    'Explore 23+ enterprise-grade free online tools and 22 statutory country salary calculators. Format JSON & SQL, merge/split PDFs, compress images to target KB, and calculate mortgages, EMIs, SIPs, and gold melt values 100% locally in your browser.',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'KivaroTools — Free Enterprise-Grade Online Tools (Private by Design)',
    description:
      'Explore 23+ free browser-based tools for developers, finance, PDFs, images, and SEO. 100% client-side processing with zero server uploads.',
    url: SITE_URL,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KivaroTools — Free Enterprise-Grade Online Tools (Private by Design)',
    description:
      'Explore 23+ free browser-based tools for developers, finance, PDFs, images, and SEO. 100% client-side processing with zero server uploads.',
  },
};

export default function HomePage() {
  const publicTools = getPublicTools();

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'KivaroTools',
    url: SITE_URL,
    description:
      'Free enterprise-grade browser-based utilities for developers, financial planning, PDFs, media optimization, and SEO. 100% client-side execution with zero server uploads.',
    inLanguage: 'en',
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'KivaroTools',
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      email: CONTACT_EMAIL,
      contactType: 'customer support',
      availableLanguage: ['English'],
    },
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'KivaroTools Enterprise Online Utility Suite',
    numberOfItems: publicTools.length,
    itemListElement: publicTools.map((tool, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: tool.name,
      description: tool.description,
      url: `${SITE_URL}/${tool.categoryId}/${tool.slug}`,
    })),
  };


  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOME_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomeClient />
    </>
  );
}