import React from 'react';
import { SITE_URL } from '@/config/site';

export interface SchemaMarkupProps {
  name: string;
  description: string;
  category?: string;
  applicationCategory?: string;
  operatingSystem?: string;
  browserRequirements?: string;
  url?: string;
  featureList?: string[];
  keywords?: string[];
  /** Kept optional for backwards-compatible prop typing; fabricated ratings are never emitted. */
  ratingValue?: string;
  ratingCount?: number | string;
}

/**
 * Resolves standard Schema.org applicationCategory based on tool category or explicit override.
 */
export function resolveApplicationCategory(category?: string, explicitCategory?: string): string {
  if (explicitCategory) {
    return explicitCategory;
  }
  switch (category?.toLowerCase()) {
    case 'finance':
      return 'FinanceApplication';
    case 'developer':
      return 'DeveloperApplication';
    case 'media':
    case 'image':
      return 'MultimediaApplication';
    case 'document':
    case 'documents':
      return 'BusinessApplication';
    case 'seo':
      return 'UtilitiesApplication';
    default:
      return 'UtilitiesApplication';
  }
}

/**
 * Reusable Next.js component to inject standards-compliant SoftwareApplication JSON-LD.
 * Emits only factual properties supported by visible page content (no fabricated ratings,
 * no self-serving reviews, and no synthetic Article headlines).
 */
export default function SchemaMarkup({
  name,
  description,
  category,
  applicationCategory,
  operatingSystem = 'Any (Web Browser — Windows, macOS, Linux, iOS, Android)',
  url,
  featureList,
  keywords,
}: SchemaMarkupProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory: resolveApplicationCategory(category, applicationCategory),
    operatingSystem,
    isAccessibleForFree: true,
    inLanguage: 'en',
    author: {
      '@type': 'Organization',
      name: 'KivaroTools',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'KivaroTools',
      url: SITE_URL,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  };

  if (url) {
    schema.url = url;
    schema['@id'] = `${url}#software`;
  }

  if (featureList && featureList.length > 0) {
    schema.featureList = featureList.join(', ');
  }

  if (keywords && keywords.length > 0) {
    schema.keywords = keywords.join(', ');
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

export { SchemaMarkup };