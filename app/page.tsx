import type { Metadata } from 'next';
import HomeClient from '@/components/home/HomeClient';
import { HOME_FAQS } from '@/config/homeFaqs';
import { SITE_URL, CONTACT_EMAIL, OFFICIAL_SOCIAL_LINKS, DEFAULT_OG_IMAGE } from '@/config/site';
import { getPublicTools } from '@/config/toolsData';

export const metadata: Metadata = {
  title: 'Free Online Tools — PDF, JSON, Finance & SEO',
  description:
    'Use 30+ free online tools and 22 country salary calculators in your browser. Format JSON & SQL, merge/compress PDFs, resize images in KB, and calculate loans.',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'Free Online Tools — PDF, JSON, Finance & SEO | KivaroTools',
    description:
      'Use 30+ free online tools and 22 country salary calculators in your browser. Format JSON & SQL, merge/compress PDFs, resize images in KB, and calculate loans.',
    url: SITE_URL,
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@kivarotools',
    creator: '@kivarotools',
    title: 'Free Online Tools — PDF, JSON, Finance & SEO | KivaroTools',
    description:
      'Use 30+ free online tools and 22 country salary calculators in your browser. Format JSON & SQL, merge/compress PDFs, resize images in KB, and calculate loans.',
    images: [`${SITE_URL}/og-image.png`],
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
    legalName: 'KivaroTools',
    url: SITE_URL,
    foundingDate: '2026',
    founder: {
      '@type': 'Person',
      name: 'Muhammad Ahmad',
      jobTitle: 'Founder & Lead Software Architect',
      url: 'https://www.linkedin.com/in/muhammad-ahmad-b81794291/',
    },
    disambiguatingDescription:
      'KivaroTools (https://kivarotools.com) is an independent, 100% free browser-based utility platform founded by software engineer Muhammad Ahmad, providing 30+ client-side developer, financial, PDF, image, and SEO tools with zero user registration, zero login forms, and zero credential collection. KivaroTools operates independently and is not affiliated with Kivaro Tech (kivarotech.com), Kivaro AI (kivaroai.com), or Kivaro Home.',
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/kivaro-logo-512.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE_URL}/og-image.png`,
    sameAs: OFFICIAL_SOCIAL_LINKS,
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