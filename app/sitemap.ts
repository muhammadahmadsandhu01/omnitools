import type { MetadataRoute } from 'next';
import { categories, getPublishedTools, tools } from '@/config/toolsData';
import { SALARY_COUNTRY_SLUGS } from '@/config/salaryCountries';
import { SITE_URL } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = SITE_URL;
  const lastModified = new Date('2026-11-25T00:00:00.000Z');

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

  // 3. Valid Category Pages (excluding hidden categories)
  const categoryEntries: MetadataRoute.Sitemap = categories
    .filter((category) => !category.hidden)
    .map((category) => ({
      url: `${siteUrl}/${category.id}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  // 4. Implemented and functional Tool Pages (excluding draft, coming-soon, or explicitly excluded/hidden tools)
  const functionalTools = getPublishedTools().filter(
    (tool) => !tool.excludeFromSitemap && !tool.hidden
  );

  const toolEntries: MetadataRoute.Sitemap = functionalTools.map((tool) => ({
    url: `${siteUrl}/${tool.categoryId}/${tool.slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // 5. 22 Country Salary Calculator Pages (from single-source config/salaryCountries.ts)
  const salaryTool = tools.find((t) => t.slug === 'salary-calculator');
  const includeSalaryCalculators = Boolean(
    salaryTool &&
    salaryTool.status === 'published' &&
    !salaryTool.excludeFromSitemap &&
    !salaryTool.hidden
  );

  const countrySalaryEntries: MetadataRoute.Sitemap = includeSalaryCalculators
    ? SALARY_COUNTRY_SLUGS.map((slug) => ({
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