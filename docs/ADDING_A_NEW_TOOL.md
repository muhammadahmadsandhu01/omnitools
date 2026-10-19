# Adding a New Tool to KivaroTools

This guide details the exact, repeatable workflow for adding a new tool to KivaroTools.

KivaroTools uses a clean, registry-driven architecture designed to balance developer speed, type safety, bundle isolation, and SEO rigor:
- **Pure Metadata (`config/toolsData.ts`)**: Defines tool identity, categorization, search intent metadata, and indexability status. This file contains zero React components or heavy dependencies, keeping sitemap and server layouts lightweight.
- **Component Registry (`config/toolRegistry.ts`)**: Explicitly maps tool slugs to interactive functional components and SEO landing page components. This ensures reliable bundler tree-shaking and type safety.
- **Dynamic Routing (`app/[category]/[slug]/page.tsx`)**: Automatically handles canonical URLs, Open Graph tags, breadcrumbs, JSON-LD structured data (`SoftwareApplication`), advertising slots, and contextual related-tool links.
- **Sitemap Generator (`app/sitemap.ts`)**: Automatically includes published tools and strictly excludes draft and coming-soon tools.

---

## Quick Reference Workflow

Adding a new tool takes 5 structured steps:

```text
1. Create functional component    --> components/tools/YourTool.tsx
2. Create SEO landing component   --> components/seo/YourToolSeo.tsx
3. Register catalogue metadata    --> config/toolsData.ts (status: 'draft')
4. Map in component registry      --> config/toolRegistry.ts
5. Validate and publish           --> npm run test:registry && npm run build
```

---

## Step-by-Step Instructions

### Step 1: Create the Functional Tool Component

Create your interactive client-side tool in `components/tools/`:

**File:** `components/tools/YourToolName.tsx`

```tsx
'use client';

import { useState } from 'react';

export default function YourToolName() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleProcess = () => {
    // Process input client-side
    setOutput(input.trim());
  };

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="tool-input"
          className="block text-sm font-semibold text-slate-900 dark:text-white"
        >
          Input Data
        </label>
        <textarea
          id="tool-input"
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter input here..."
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <button
        type="button"
        onClick={handleProcess}
        className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Process
      </button>

      {output && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {output}
          </p>
        </div>
      )}
    </div>
  );
}
```

*Guidelines:*
- Mark client components with `'use client'`.
- Perform computations client-side wherever possible.
- If processing sensitive text or files, do not upload data to third-party endpoints unless explicitly documented.

---

### Step 2: Create the SEO Landing Component

Create a dedicated SEO landing component in `components/seo/`:

**File:** `components/seo/YourToolNameSeo.tsx`

```tsx
export default function YourToolNameSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is my data stored or sent to a server?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. All operations run directly in your web browser. No inputs or files are uploaded to our servers.',
        },
      },
      {
        '@type': 'Question',
        name: 'What formats are supported?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The tool supports standard UTF-8 text and common plain text formats.',
        },
      },
    ],
  };

  return (
    <article className="prose prose-slate max-w-none dark:prose-invert">
      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          How to Use the Tool
        </h2>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
          Explain what the tool accomplishes, target use cases, and realistic developer or business workflows.
        </p>

        <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-600 dark:text-slate-400">
          <li>Paste or enter your input into the workspace above.</li>
          <li>Configure any necessary conversion or formatting options.</li>
          <li>Click process to receive your instant output.</li>
        </ol>
      </section>

      {/* Practical Technical Examples */}
      <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Practical Examples & Technical Standards
        </h2>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
          Provide genuine, reproducible code or numerical examples. Ensure all examples adhere to applicable RFC or industry standards.
        </p>
      </section>

      {/* Frequently Asked Questions */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Frequently Asked Questions
        </h2>
        <dl className="mt-6 space-y-6">
          <div>
            <dt className="text-lg font-semibold text-slate-900 dark:text-white">
              Is my data stored or sent to a server?
            </dt>
            <dd className="mt-2 text-slate-600 dark:text-slate-400">
              No. All operations run directly in your web browser. No inputs or files are uploaded to our servers.
            </dd>
          </div>
          <div>
            <dt className="text-lg font-semibold text-slate-900 dark:text-white">
              What formats are supported?
            </dt>
            <dd className="mt-2 text-slate-600 dark:text-slate-400">
              The tool supports standard UTF-8 text and common plain text formats.
            </dd>
          </div>
        </dl>
      </section>
    </article>
  );
}
```

*SEO Content Quality Rules:*
- **Single H1 Rule**: The dynamic page header (`app/[category]/[slug]/page.tsx`) already renders exactly one `<h1>`. In your SEO component, use `<h2>` and `<h3>` tags for subsections.
- **Accurate Claims**: Never claim privacy or offline capability unless the tool is strictly client-side. Never invent accuracy metrics.
- **Structured Data**: Include an `@type: FAQPage` JSON-LD schema matching the visible FAQ section.

---

### Step 3: Register Metadata in `config/toolsData.ts`

Add your tool entry to the `tools` array in `config/toolsData.ts`:

```typescript
{
  id: 'your-tool-slug',
  name: 'Your Tool Name',
  slug: 'your-tool-slug',
  categoryId: 'developer', // 'finance' | 'developer' | 'document' | 'media' | 'seo' | 'health'
  description: 'Concise 1-2 sentence description for search results and cards.',
  isPopular: false,
  status: 'draft', // Use 'draft' during development; change to 'published' when ready!
  seoTitle: 'Your Tool Name — Primary Keyword & Value Proposition',
  seoDescription: 'Compelling 120-160 character meta description explaining capabilities and benefits.',
  relatedToolSlugs: ['json-formatter', 'base64-encoder'], // Minimum 2 related published tools
},
```

#### Field Reference Table

| Field | Type | Required? | Description |
|---|---|---|---|
| `id` | `string` | **Yes** | Unique identifier (conventionally matches `slug`). |
| `name` | `string` | **Yes** | Display name shown on cards and page titles. |
| `slug` | `string` | **Yes** | URL slug. Must be URL-safe (kebab-case) and globally unique. |
| `categoryId` | `CategoryId` | **Yes** | Must be one of: `finance`, `developer`, `document`, `media`, `seo`, `health`. |
| `description` | `string` | **Yes** | High-level summary of tool functionality. |
| `status` | `ToolStatus` | **Yes** | `'draft'` (hidden from sitemap), `'coming-soon'` (placeholder UI), or `'published'`. |
| `isPopular` | `boolean` | No | Flag indicating if tool appears in the homepage featured section. |
| `seoTitle` | `string` | Required if published | Custom `<title>` tag for search engines. |
| `seoDescription` | `string` | Required if published | Meta description for search snippets. |
| `relatedToolSlugs` | `string[]` | Required if published | Array of at least 2 existing published tool slugs for cross-linking. |

---

### Step 4: Register Components in `config/toolRegistry.ts`

Add your components to `config/toolRegistry.ts`:

```typescript
// 1. Import your components
import YourToolName from '@/components/tools/YourToolName';
import YourToolNameSeo from '@/components/seo/YourToolNameSeo';

// 2. Add to toolComponents dictionary
export const toolComponents: Record<string, ComponentType<any>> = {
  // ... existing tools
  'your-tool-slug': YourToolName,
};

// 3. Add to seoComponents dictionary
export const seoComponents: Record<string, ComponentType<any>> = {
  // ... existing tools
  'your-tool-slug': YourToolNameSeo,
};
```

---

### Step 5: Test and Validate

Once configured, verify that the new tool complies with all system constraints:

```bash
# 1. Run the registry validator (checks uniqueness, relations, sitemap rules)
npm run test:registry

# 2. Run TypeScript check (checks types and imports)
npx tsc --noEmit

# 3. Run ESLint
npm run lint

# 4. Run Next.js production build (validates route generation and bundling)
npm run build
```

---

## Tool Lifecycle & Indexability Rules

To protect KivaroTools from SEO penalties (thin pages, 404s, incomplete tools), follow the status lifecycle:

1. **`status: 'draft'`**:
   - The tool is being authored or reviewed.
   - Accessible locally via its route for testing (`/category/slug`).
   - **Excluded from `sitemap.xml`**.
   - Cannot be targeted by other tools' `relatedToolSlugs`.

2. **`status: 'coming-soon'`**:
   - Displays a clean "Tool coming soon" placeholder.
   - **Excluded from `sitemap.xml`**.
   - Not indexable.

3. **`status: 'published'`**:
   - Functional tool component and SEO component are verified.
   - **Included in `sitemap.xml`**.
   - Eligible for related tools cross-linking.
   - Validated against strict uniqueness and metadata standards by `npm run test:registry`.
