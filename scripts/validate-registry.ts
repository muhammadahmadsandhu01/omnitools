/**
 * KivaroTools Registry & SEO Integrity Validator
 *
 * Automated regression test script ensuring every tool in KivaroTools adheres to
 * the registry contract:
 * 1. Pure metadata integrity in config/toolsData.ts
 * 2. Component mapping in config/toolRegistry.ts
 * 3. Strict exclusion of draft/coming-soon tools from indexable sets
 * 4. Non-duplicated titles, descriptions, and slugs
 * 5. Valid related-tool links resolving to published routes
 */


import {
  tools,
  categories,
  getPublishedTools,
  getRelatedTools,
  getTool,
  type ToolStatus,
  type CategoryId,
} from '../config/toolsData';

import {
  getToolComponent,
  getSeoComponent,
} from '../config/toolRegistry';

const VALID_CATEGORIES: CategoryId[] = [
  'finance',
  'developer',
  'document',
  'media',
  'seo',
  'health',
];

const VALID_STATUSES: ToolStatus[] = ['published', 'coming-soon', 'draft'];

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
];

interface ValidationError {
  toolSlug?: string;
  field: string;
  message: string;
}

const errors: ValidationError[] = [];

console.log('🔍 [KivaroTools] Validating Tool Registry & Architecture Integrity...\n');

// ============================================================
// 1. Categories Validation
// ============================================================
console.log('• Checking categories definition...');
if (!categories || categories.length !== 6) {
  errors.push({
    field: 'categories',
    message: `Expected 6 categories, found ${categories?.length ?? 0}.`,
  });
}

for (const cat of categories) {
  if (!VALID_CATEGORIES.includes(cat.id)) {
    errors.push({
      field: `categories[${cat.id}]`,
      message: `Invalid category ID: "${cat.id}".`,
    });
  }
}

// ============================================================
// 2. Uniqueness Checks
// ============================================================
console.log('• Checking uniqueness of slugs, IDs, titles, and descriptions...');
const slugMap = new Set<string>();
const idMap = new Set<string>();
const titleMap = new Map<string, string>();
const descriptionMap = new Map<string, string>();

for (const tool of tools) {
  // Check slug uniqueness
  if (slugMap.has(tool.slug)) {
    errors.push({
      toolSlug: tool.slug,
      field: 'slug',
      message: `Duplicate tool slug detected: "${tool.slug}".`,
    });
  }
  slugMap.add(tool.slug);

  // Check ID uniqueness
  if (idMap.has(tool.id)) {
    errors.push({
      toolSlug: tool.slug,
      field: 'id',
      message: `Duplicate tool id detected: "${tool.id}".`,
    });
  }
  idMap.add(tool.id);

  // Published tool title & description uniqueness
  if (tool.status === 'published') {
    const title = tool.seoTitle || tool.name;
    const desc = tool.seoDescription || tool.description;

    if (titleMap.has(title)) {
      errors.push({
        toolSlug: tool.slug,
        field: 'seoTitle / name',
        message: `Duplicate title "${title}" also used by "${titleMap.get(title)}".`,
      });
    } else {
      titleMap.set(title, tool.slug);
    }

    if (descriptionMap.has(desc)) {
      errors.push({
        toolSlug: tool.slug,
        field: 'seoDescription / description',
        message: `Duplicate description also used by "${descriptionMap.get(desc)}".`,
      });
    } else {
      descriptionMap.set(desc, tool.slug);
    }
  }
}

// ============================================================
// 3. Tool Metadata & Registry Checks
// ============================================================
console.log('• Checking individual tool contracts and component mappings...');
let publishedCount = 0;
let comingSoonCount = 0;
let draftCount = 0;

for (const tool of tools) {
  // Required string fields
  if (!tool.id || typeof tool.id !== 'string') {
    errors.push({ toolSlug: tool.slug, field: 'id', message: 'Missing or non-string id.' });
  }
  if (!tool.name || typeof tool.name !== 'string') {
    errors.push({ toolSlug: tool.slug, field: 'name', message: 'Missing or non-string name.' });
  }
  if (!tool.slug || typeof tool.slug !== 'string') {
    errors.push({ toolSlug: tool.slug, field: 'slug', message: 'Missing or non-string slug.' });
  }
  if (!VALID_CATEGORIES.includes(tool.categoryId)) {
    errors.push({
      toolSlug: tool.slug,
      field: 'categoryId',
      message: `Invalid categoryId: "${tool.categoryId}".`,
    });
  }
  if (!VALID_STATUSES.includes(tool.status)) {
    errors.push({
      toolSlug: tool.slug,
      field: 'status',
      message: `Invalid status: "${tool.status}". Must be 'published', 'coming-soon', or 'draft'.`,
    });
  }

  // Count by status
  if (tool.status === 'published') publishedCount++;
  if (tool.status === 'coming-soon') comingSoonCount++;
  if (tool.status === 'draft') draftCount++;

  // Contract for published tools
  if (tool.status === 'published') {
    // SEO fields
    if (!tool.seoTitle || tool.seoTitle.trim().length < 5) {
      errors.push({
        toolSlug: tool.slug,
        field: 'seoTitle',
        message: 'Published tool must have a non-empty seoTitle (min 5 chars).',
      });
    }
    if (!tool.seoDescription || tool.seoDescription.trim().length < 20) {
      errors.push({
        toolSlug: tool.slug,
        field: 'seoDescription',
        message: 'Published tool must have a descriptive seoDescription (min 20 chars).',
      });
    }

    // Related tools
    if (!tool.relatedToolSlugs || tool.relatedToolSlugs.length < 2) {
      errors.push({
        toolSlug: tool.slug,
        field: 'relatedToolSlugs',
        message: 'Published tool must declare at least 2 relatedToolSlugs.',
      });
    } else {
      for (const relSlug of tool.relatedToolSlugs) {
        if (relSlug === tool.slug) {
          errors.push({
            toolSlug: tool.slug,
            field: 'relatedToolSlugs',
            message: `Tool "${tool.slug}" cannot link to itself as a related tool.`,
          });
        }
        const relTool = tools.find((t) => t.slug === relSlug);
        if (!relTool) {
          errors.push({
            toolSlug: tool.slug,
            field: 'relatedToolSlugs',
            message: `Related tool slug "${relSlug}" does not exist in toolsData catalogue.`,
          });
        } else if (relTool.status !== 'published') {
          errors.push({
            toolSlug: tool.slug,
            field: 'relatedToolSlugs',
            message: `Related tool "${relSlug}" has status "${relTool.status}" and cannot be cross-linked.`,
          });
        }
      }
    }

    // Route resolution
    const resolvedTool = getTool(tool.categoryId, tool.slug);
    if (!resolvedTool) {
      errors.push({
        toolSlug: tool.slug,
        field: 'getTool',
        message: `getTool("${tool.categoryId}", "${tool.slug}") failed to resolve.`,
      });
    }

    // Functional component mapping
    const ToolComp = getToolComponent(tool.slug);
    if (!ToolComp) {
      errors.push({
        toolSlug: tool.slug,
        field: 'toolComponents',
        message: `Missing functional component in config/toolRegistry.ts for slug "${tool.slug}".`,
      });
    }

    // SEO component mapping
    const SeoComp = getSeoComponent(tool.slug);
    if (!SeoComp) {
      errors.push({
        toolSlug: tool.slug,
        field: 'seoComponents',
        message: `Missing SEO component in config/toolRegistry.ts for slug "${tool.slug}".`,
      });
    }
  }

  // Contract for draft / coming-soon tools
  if (tool.status === 'draft' || tool.status === 'coming-soon') {
    // Must NOT be in getPublishedTools()
    const isPublished = getPublishedTools().some((t) => t.slug === tool.slug);
    if (isPublished) {
      errors.push({
        toolSlug: tool.slug,
        field: 'getPublishedTools',
        message: `Non-published tool "${tool.slug}" (${tool.status}) was found in getPublishedTools()!`,
      });
    }
  }
}

// ============================================================
// 4. Sitemap Scope Verification
// ============================================================
console.log('• Checking sitemap scope and statutory routes...');
const publishedTools = getPublishedTools();
if (publishedTools.length !== 35) {
  errors.push({
    field: 'getPublishedTools.length',
    message: `Expected 35 published tools, got ${publishedTools.length}.`,
  });
}

if (COUNTRY_SLUGS.length !== 22) {
  errors.push({
    field: 'COUNTRY_SLUGS.length',
    message: `Expected 22 country salary calculators, got ${COUNTRY_SLUGS.length}.`,
  });
}

// Check related tools fallback helper
for (const tool of publishedTools) {
  const rels = getRelatedTools(tool, 4);
  if (rels.length === 0) {
    errors.push({
      toolSlug: tool.slug,
      field: 'getRelatedTools',
      message: `getRelatedTools returned 0 tools for "${tool.slug}".`,
    });
  }
  for (const r of rels) {
    if (r.status !== 'published') {
      errors.push({
        toolSlug: tool.slug,
        field: 'getRelatedTools',
        message: `getRelatedTools returned non-published tool "${r.slug}" (${r.status}).`,
      });
    }
  }
}

// ============================================================
// Final Evaluation & Reporting
// ============================================================
console.log('\n--- Registry Audit Summary ---');
console.log(`Total Tools in Catalogue: ${tools.length}`);
console.log(`  • Published:    ${publishedCount}`);
console.log(`  • Coming Soon:  ${comingSoonCount}`);
console.log(`  • Draft:        ${draftCount}`);
console.log(`Total Categories:         ${categories.length}`);
console.log(`Statutory Salary Routes:  ${COUNTRY_SLUGS.length}`);
console.log(`Expected Total Routes: ${1 + 4 + categories.length + publishedCount + COUNTRY_SLUGS.length} (68)\n`);

if (errors.length > 0) {
  console.error(`❌ REGISTRY VALIDATION FAILED with ${errors.length} error(s):\n`);
  for (const err of errors) {
    const prefix = err.toolSlug ? `[${err.toolSlug}] ` : '';
    console.error(`  - ${prefix}${err.field}: ${err.message}`);
  }
  process.exit(1);
}

console.log('✅ ALL REGISTRY CHECKS PASSED: Tool metadata, component mappings, and route isolation are 100% valid.\n');
process.exit(0);
