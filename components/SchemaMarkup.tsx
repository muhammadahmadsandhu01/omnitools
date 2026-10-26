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
      return 'UtilityApplication';
    default:
      return 'UtilityApplication';
  }
}

/**
 * Reusable Next.js component to inject structured JSON-LD Schema Markup
 * for SoftwareApplication and WebApplication across all tool pages.
 */
export default function SchemaMarkup({
  name,
  description,
  category,
  applicationCategory,
  operatingSystem = 'Any (Web Browser — Windows, macOS, Linux, iOS, Android)',
  browserRequirements = 'Requires JavaScript and modern HTML5 Web APIs',
  url,
  featureList,
  keywords,
}: SchemaMarkupProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['SoftwareApplication', 'WebApplication'],
    name,
    description,
    applicationCategory: resolveApplicationCategory(category, applicationCategory),
    operatingSystem,
    browserRequirements,
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
    schema.featureList = featureList;
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
