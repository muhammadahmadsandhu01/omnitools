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
 * Resolves a human-readable category label for WebPage `about` metadata.
 */
export function resolveApplicationCategory(
  category?: string,
  explicitCategory?: string
): string {
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

function resolveCategoryTopicName(category?: string): string {
  switch (category?.toLowerCase()) {
    case 'finance':
      return 'Online Financial Calculators';
    case 'developer':
      return 'Client-Side Developer Tools';
    case 'media':
    case 'image':
      return 'Private Browser Image Utilities';
    case 'document':
    case 'documents':
      return 'Client-Side PDF & Document Utilities';
    case 'seo':
      return 'SEO, GEO & Text Utilities';
    default:
      return 'Client-Side Browser Utilities';
  }
}

/**
 * Reusable Next.js component to inject standards-compliant WebPage JSON-LD.
 *
 * Why WebPage instead of SoftwareApplication:
 * Google's SoftwareApp Rich Result validator requires `aggregateRating` or `review`
 * on `SoftwareApplication` / `WebApplication` nodes. Emitting fabricated ratings
 * violates Google's Review Snippet & Structured Data Spam policies, while omitting
 * them triggers Rich Results validation errors across all tool & salary pages.
 * Using a clean `WebPage` entity graph avoids both issues (0 Rich Results errors,
 * 0 policy risk) while preserving full semantic clarity for Google & AI crawlers.
 */
export default function SchemaMarkup({
  name,
  description,
  category,
  url,
  keywords,
}: SchemaMarkupProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    isAccessibleForFree: true,
    inLanguage: 'en',
    about: {
      '@type': 'Thing',
      name: resolveCategoryTopicName(category),
    },
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'KivaroTools',
      url: SITE_URL,
    },
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
  };

  if (url) {
    schema.url = url;
    schema['@id'] = `${url}#webpage`;
  }

  if (keywords && keywords.length > 0) {
    schema.keywords = keywords.slice(0, 12).join(', ');
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