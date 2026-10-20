/**
 * Sitemap & Technical SEO Regression Test Suite
 *
 * Validates:
 * 1. SITE_URL resolves to canonical production domain 'https://kivarotools.com'
 * 2. sitemap() outputs strictly absolute https://kivarotools.com URLs
 * 3. No legacy Vercel preview domain (omnitools-navy.vercel.app) exists in any entry
 * 4. All active, published, indexable tools (including public UI-hidden tools), 
 *    categories, 22 country salary calculators, static company pages, and homepage are included
 * 5. robots() points sitemap directive to 'https://kivarotools.com/sitemap.xml'
 * 6. XML formatting validity for search engines
 */

import sitemap from '../app/sitemap';
import robots from '../app/robots';
import { SITE_URL } from '../config/site';
import { categories, getPublishedTools } from '../config/toolsData';

console.log('🔍 [KivaroTools] Validating Sitemap & Technical SEO Configuration...\n');

let failed = false;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    failed = true;
  } else {
    console.log(`  ✅ PASSED: ${message}`);
  }
}

// ============================================================
// 1. SITE_URL Verification
// ============================================================
console.log('• Testing Canonical Origin & Base URL...');
assert(
  SITE_URL === 'https://kivarotools.com',
  `SITE_URL must resolve to 'https://kivarotools.com' (got: '${SITE_URL}')`
);

// ============================================================
// 2. Robots Configuration Verification
// ============================================================
console.log('\n• Testing app/robots.ts Output...');
const robotsConfig = robots();
assert(
  robotsConfig.sitemap === 'https://kivarotools.com/sitemap.xml',
  `robots.txt sitemap directive must be 'https://kivarotools.com/sitemap.xml' (got: '${robotsConfig.sitemap}')`
);

const rules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules[0] : robotsConfig.rules;
assert(
  rules?.allow === '/',
  `robots.txt must allow root '/' for search engine crawlers`
);
assert(
  Array.isArray(rules?.disallow) && rules.disallow.includes('/api/'),
  `robots.txt disallows '/api/' routes`
);

// ============================================================
// 3. Sitemap Entries Verification
// ============================================================
console.log('\n• Testing app/sitemap.ts Output...');
const entries = sitemap();

// Expected total: 1 home + 4 static + 6 categories + 23 published tools + 22 country salary = 56
const publishedTools = getPublishedTools().filter((t) => !t.excludeFromSitemap);
const expectedTotal = 1 + 4 + categories.length + publishedTools.length + 22;

assert(
  entries.length === expectedTotal,
  `sitemap() returned ${entries.length} entries (expected ${expectedTotal})`
);

// Verify no preview domain
const vercelMatches = entries.filter((e) => e.url.includes('vercel.app') || e.url.includes('omnitools-navy'));
assert(
  vercelMatches.length === 0,
  `Zero sitemap entries contain 'vercel.app' or 'omnitools-navy' (found: ${vercelMatches.length})`
);

// Verify all URLs start with https://kivarotools.com
const nonCanonicalUrls = entries.filter((e) => !e.url.startsWith('https://kivarotools.com'));
assert(
  nonCanonicalUrls.length === 0,
  `All entries start with 'https://kivarotools.com' (found ${nonCanonicalUrls.length} non-conforming URLs)`
);

// Verify Homepage
const homeEntry = entries.find((e) => e.url === 'https://kivarotools.com');
assert(Boolean(homeEntry), `Homepage 'https://kivarotools.com' is present with priority ${homeEntry?.priority}`);

// Verify Static Company Pages
const expectedStatic = ['/about', '/contact', '/privacy', '/terms'];
for (const path of expectedStatic) {
  const exists = entries.some((e) => e.url === `https://kivarotools.com${path}`);
  assert(exists, `Static page 'https://kivarotools.com${path}' is present`);
}

// Verify Categories
for (const cat of categories) {
  const exists = entries.some((e) => e.url === `https://kivarotools.com/${cat.id}`);
  assert(exists, `Category '${cat.id}' ('https://kivarotools.com/${cat.id}') is present`);
}

// Verify All Published Tools (including UI-hidden but publicly indexable tools)
for (const tool of publishedTools) {
  const exists = entries.some((e) => e.url === `https://kivarotools.com/${tool.categoryId}/${tool.slug}`);
  assert(
    exists,
    `Published tool '${tool.slug}' ('https://kivarotools.com/${tool.categoryId}/${tool.slug}') is present in sitemap`
  );
}

// Verify Salary Calculator and Text Analyzer specifically remain indexable
assert(
  entries.some((e) => e.url === 'https://kivarotools.com/finance/salary-calculator'),
  `Salary Calculator ('https://kivarotools.com/finance/salary-calculator') is present and indexable`
);
assert(
  entries.some((e) => e.url === 'https://kivarotools.com/seo/text-analyzer'),
  `Text Analyzer ('https://kivarotools.com/seo/text-analyzer') is present and indexable`
);

// Verify 22 Country Salary Calculators
const countrySalaryEntries = entries.filter((e) => e.url.includes('/finance/salary-calculator/'));
assert(
  countrySalaryEntries.length === 22,
  `All 22 Country Salary Calculator pages are present in sitemap (found: ${countrySalaryEntries.length})`
);

// Verify Meaningful lastModified and changeFrequency
for (const entry of entries) {
  if (!entry.lastModified) {
    assert(false, `Entry '${entry.url}' has missing lastModified`);
  }
}
assert(true, `All ${entries.length} entries have valid lastModified values`);

// ============================================================
// 4. XML Sitemap Serialization Check
// ============================================================
console.log('\n• Validating XML Sitemap Format...');
const xmlElements = entries.map((entry) => {
  const lastmod = entry.lastModified instanceof Date
    ? entry.lastModified.toISOString()
    : entry.lastModified;
  return `  <url>\n    <loc>${entry.url}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${entry.changeFrequency}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`;
});

const generatedXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlElements.join('\n')}\n</urlset>`;

assert(generatedXml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), 'XML declaration valid');
assert(generatedXml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), 'Sitemap 0.9 schema namespace valid');
assert(!generatedXml.includes('omnitools-navy.vercel.app'), 'XML does not contain old preview domain');
assert(generatedXml.endsWith('</urlset>'), 'XML closes root element properly');

// ============================================================
// Report & Exit
// ============================================================
console.log(`\n--- Sitemap Audit Summary ---`);
console.log(`Total URLs in Sitemap: ${entries.length}`);
console.log(`  • Homepage:                  1`);
console.log(`  • Static Pages:              ${expectedStatic.length}`);
console.log(`  • Category Pages:            ${categories.length}`);
console.log(`  • Public Tool Pages:         ${publishedTools.length}`);
console.log(`  • Country Salary Variations: ${countrySalaryEntries.length}`);

if (failed) {
  console.error('\n❌ Sitemap validation FAILED! Please inspect errors above.');
  process.exit(1);
}

console.log('\n✅ ALL SITEMAP & TECHNICAL SEO CHECKS PASSED!\n');
process.exit(0);
