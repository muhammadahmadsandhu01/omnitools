import type { MetadataRoute } from 'next';
import { categories, getPublishedTools } from '@/config/toolsData';
import { SITE_URL } from '@/config/site';

/**
 * 22 statutory country salary calculators registered in the application.
 */
const COUNTRY_SLUGS = [
  'pakistan',
  'united-states',
  'united-kingdom',
  'germany',
  'india',
  'canada',
  'australia',
  'singapore',
  'united-arab-emirates',
  'saudi-arabia',
  'france',
  'japan',
  'switzerland',
  'netherlands',
  'ireland',
  'new-zealand',
  'spain',
  'italy',
  'south-africa',
  'brazil',
  'mexico',
  'south-korea',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = SITE_URL;
  const now = new Date();

  // 1. Homepage
  const homeEntry: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // 2. Company / Informational Pages
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 3. Valid Category Pages
  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/${category.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 4. Implemented and functional Tool Pages (excluding unimplemented tools)
  const functionalTools = getPublishedTools();

  const toolEntries: MetadataRoute.Sitemap = functionalTools.map((tool) => ({
    url: `${siteUrl}/${tool.categoryId}/${tool.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // 5. 22 Country Salary Calculator Pages
  const countrySalaryEntries: MetadataRoute.Sitemap = COUNTRY_SLUGS.map(
    (slug) => ({
      url: `${siteUrl}/finance/salary-calculator/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    })
  );

  return [
    ...homeEntry,
    ...staticEntries,
    ...categoryEntries,
    ...toolEntries,
    ...countrySalaryEntries,
  ];
}
