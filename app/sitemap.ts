import type { MetadataRoute } from 'next';
import { categories, getPublishedTools, tools } from '@/config/toolsData';
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
  // Stable release audit timestamp to prevent artificial, daily date churn
  const lastModified = new Date('2026-10-20T00:00:00.000Z');

  // 1. Homepage
  const homeEntry: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // 2. Company / Informational Pages
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 3. Valid Category Pages
  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/${category.id}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 4. Implemented and functional Tool Pages (excluding draft, coming-soon, or explicitly excluded tools)
  const functionalTools = getPublishedTools().filter((tool) => !tool.excludeFromSitemap);

  const toolEntries: MetadataRoute.Sitemap = functionalTools.map((tool) => ({
    url: `${siteUrl}/${tool.categoryId}/${tool.slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // 5. 22 Country Salary Calculator Pages (included as long as salary calculator is published & not excluded)
  const salaryTool = tools.find((t) => t.slug === 'salary-calculator');
  const includeSalaryCalculators = Boolean(
    salaryTool && salaryTool.status === 'published' && !salaryTool.excludeFromSitemap
  );

  const countrySalaryEntries: MetadataRoute.Sitemap = includeSalaryCalculators
    ? COUNTRY_SLUGS.map((slug) => ({
        url: `${siteUrl}/finance/salary-calculator/${slug}`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.85,
      }))
    : [];

  return [
    ...homeEntry,
    ...staticEntries,
    ...categoryEntries,
    ...toolEntries,
    ...countrySalaryEntries,
  ];
}
