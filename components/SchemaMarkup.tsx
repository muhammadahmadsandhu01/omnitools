import React from 'react';

export interface SchemaMarkupProps {
  name: string;
  description: string;
  category?: string;
  applicationCategory?: string;
  operatingSystem?: string;
  browserRequirements?: string;
  url?: string;
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
      return 'BusinessApplication';
    case 'developer':
      return 'DeveloperApplication';
    case 'media':
    case 'image':
      return 'MultimediaApplication';
    case 'document':
    case 'documents':
      return 'UtilityApplication';
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
  operatingSystem = 'Any',
  browserRequirements = 'Requires JavaScript',
  url,
}: SchemaMarkupProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['SoftwareApplication', 'WebApplication'],
    name,
    description,
    applicationCategory: resolveApplicationCategory(category, applicationCategory),
    operatingSystem,
    browserRequirements,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  if (url) {
    schema.url = url;
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
