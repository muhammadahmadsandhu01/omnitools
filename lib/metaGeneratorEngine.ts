/**
 * OmniTools — Meta Tags & Open Graph Engine
 *
 * Pure, deterministic engine for metadata formatting, attribute escaping,
 * live preview simulations, HTML parsing, and comprehensive 0-100 SEO auditing.
 */

export type OgType =
  | 'website'
  | 'article'
  | 'product'
  | 'profile'
  | 'book'
  | 'video.movie'
  | 'music.song';

export type TwitterCardType = 'summary' | 'summary_large_image' | 'app' | 'player';

export interface CustomMetaTag {
  id: string;
  type: 'name' | 'property' | 'http-equiv';
  key: string;
  value?: string;
  content?: string;
}

export interface RobotsDirectives {
  index: boolean;
  follow: boolean;
  noarchive: boolean;
  nosnippet: boolean;
  noimageindex: boolean;
  notranslate: boolean;
  maxSnippet: number | null; // e.g. -1 for unlimited, or char count
  maxImagePreview: 'none' | 'standard' | 'large' | null;
  maxVideoPreview?: number | null;
}

export interface MetaFormData {
  // --- Primary SEO ---
  title: string;
  description: string;
  canonicalUrl: string;
  robots: RobotsDirectives;
  author: string;
  themeColor: string;
  language: string;
  charset: string;
  viewport: string;
  keywords: string; // Clearly documented as optional / not modern Google factor
  customTags: CustomMetaTag[];

  // --- Open Graph ---
  ogType: OgType;
  ogTitle: string; // If empty and sync is on, inherits title
  ogDescription: string; // If empty and sync is on, inherits description
  ogUrl: string; // If empty and sync is on, inherits canonicalUrl
  ogImage: string;
  ogImageAlt: string;
  ogSiteName: string;
  ogLocale: string;
  ogImageWidth: string;
  ogImageHeight: string;
  ogImageType: string;

  // Type-specific Open Graph fields
  articleAuthor?: string;
  articlePublishedTime?: string;
  articleSection?: string;
  articleTag?: string;
  productPriceAmount?: string;
  productPriceCurrency?: string;

  // --- Twitter / X Cards ---
  twitterCard: TwitterCardType;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterImageAlt: string;
  twitterSite: string;
  twitterCreator: string;

  // --- Settings & Audit Tracking ---
  syncSocialWithBasic: boolean;
  duplicateTags?: string[];
}

export interface AuditFinding {
  id: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  category: 'basic' | 'openGraph' | 'twitter' | 'technical';
  title: string;
  observed: string;
  explanation: string;
  recommendation: string;
  field?: keyof MetaFormData;
  suggestedValue?: string;
}

export interface AuditResult {
  score: number; // 0 to 100
  rating: 'Excellent' | 'Good' | 'Needs Improvement' | 'Critical Issues';
  findings: AuditFinding[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
    passed: number;
  };
}

/**
 * HTML Entity Decoding Utility
 * Converts HTML entities (&amp;, &quot;, &#39;, &lt;, &gt;) back to plain characters.
 */
export function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/**
 * HTML Attribute Escaping Utility
 * Defends against XSS, attribute breakout, and malformed HTML syntax.
 */
export function escapeHtmlAttr(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * HTML Text Content Escaping (for <title> tag)
 */
export function escapeHtmlText(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Format robots directives into a standard robots content string
 */
export function formatRobotsContent(robots: RobotsDirectives): string {
  const parts: string[] = [];

  // Index / noindex
  parts.push(robots.index ? 'index' : 'noindex');
  // Follow / nofollow
  parts.push(robots.follow ? 'follow' : 'nofollow');

  if (robots.noarchive) parts.push('noarchive');
  if (robots.nosnippet) parts.push('nosnippet');
  if (robots.noimageindex) parts.push('noimageindex');
  if (robots.notranslate) parts.push('notranslate');

  if (robots.maxSnippet !== null && robots.maxSnippet !== undefined && robots.maxSnippet >= 0) {
    parts.push(`max-snippet:${robots.maxSnippet}`);
  }
  if (robots.maxImagePreview && robots.maxImagePreview !== 'none') {
    parts.push(`max-image-preview:${robots.maxImagePreview}`);
  } else if (robots.maxImagePreview === 'none') {
    parts.push('max-image-preview:none');
  }
  if (robots.maxVideoPreview !== null && robots.maxVideoPreview !== undefined && robots.maxVideoPreview >= 0) {
    parts.push(`max-video-preview:${robots.maxVideoPreview}`);
  }

  return parts.join(', ');
}

export const formatRobotsDirectives = formatRobotsContent;

/**
 * Patterns matching instructional guidance, boilerplate placeholders, or sample fill-in phrases
 */
const INSTRUCTIONAL_PLACEHOLDER_REGEXES = [
  /apna\s+actual/i,
  /agar\s+nahi\s+hai/i,
  /blank\s+chhoro/i,
  /creator\s+handle/i,
  /your[-_\s]*(actual|twitter|handle|brand|company|name|domain|website|username|title|description|url)/i,
  /insert[-_\s]+(here|your)/i,
  /enter[-_\s]+your/i,
  /replace[-_\s]+with/i,
  /placeholder/i,
  /lorem\s+ipsum/i,
  /todo[:\s]/i,
  /^e\.g\./i,
  /^example[-_\s]+(title|description|company|domain|url)/i,
  /^@(author|brand|username|handle|yourhandle|yourbrand|yourusername|creator)$/i,
];

/**
 * Checks whether a given string is an instructional placeholder or sample dummy prompt.
 */
export function isInstructionalPlaceholder(value: string | undefined | null): boolean {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return INSTRUCTIONAL_PLACEHOLDER_REGEXES.some((rx) => rx.test(trimmed));
}

/**
 * Checks whether a metadata field contains real, valid, non-placeholder content.
 */
export function isValidMetadataValue(value: string | undefined | null): boolean {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return !isInstructionalPlaceholder(trimmed);
}

/**
 * Validates canonical URL format strictly: must be absolute http(s) URL with valid host and no whitespace.
 */
export function isValidCanonicalUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || isInstructionalPlaceholder(trimmed)) return false;
  if (/\s/.test(trimmed)) return false;
  if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(trimmed)) return false;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    if (!parsed.hostname || parsed.hostname.length < 3) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Detects whether a URL uses an RFC 2606 example domain or demo fixture.
 */
export function isDemoCanonicalUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return /example\.(com|org|net)|demo|sample|test\.local/i.test(url.trim());
}

/**
 * Checks whether all user-editable metadata inputs in the editor are empty.
 */
export function isEditorEmpty(data: MetaFormData): boolean {
  return (
    !isValidMetadataValue(data.title) &&
    !isValidMetadataValue(data.description) &&
    !isValidMetadataValue(data.canonicalUrl) &&
    !isValidMetadataValue(data.ogTitle) &&
    !isValidMetadataValue(data.ogDescription) &&
    !isValidMetadataValue(data.ogImage) &&
    !isValidMetadataValue(data.author) &&
    !isValidMetadataValue(data.keywords) &&
    !isValidMetadataValue(data.twitterSite) &&
    !isValidMetadataValue(data.twitterCreator)
  );
}

/**
 * Calculates live Editor Completeness score (0 - 100) based strictly on entered valid metadata.
 */
export function calculateEditorCompleteness(data: MetaFormData): {
  score: number;
  rating: 'Critical Issues' | 'Needs Improvement' | 'Good' | 'Excellent';
  completedFields: number;
  totalFields: number;
  isComplete: boolean;
} {
  if (isEditorEmpty(data)) {
    return {
      score: 0,
      rating: 'Critical Issues',
      completedFields: 0,
      totalFields: 6,
      isComplete: false,
    };
  }

  let score = 0;
  let completed = 0;

  // Title (25 pts)
  if (isValidMetadataValue(data.title)) {
    score += 25;
    completed++;
  }

  // Description (25 pts)
  if (isValidMetadataValue(data.description)) {
    score += 25;
    completed++;
  }

  // Canonical URL (15 pts)
  if (isValidCanonicalUrl(data.canonicalUrl)) {
    score += 15;
    completed++;
  }

  const effective = resolveEffectiveValues(data);

  // Social Image (15 pts)
  if (isValidMetadataValue(effective.effectiveOgImage) && isValidCanonicalUrl(effective.effectiveOgImage)) {
    score += 15;
    completed++;
  }

  // Social Title & Description (10 pts)
  if (isValidMetadataValue(effective.effectiveOgTitle) && isValidMetadataValue(effective.effectiveOgDesc)) {
    score += 10;
    completed++;
  }

  // Twitter Card configuration (10 pts)
  if (data.twitterCard && (isValidMetadataValue(data.twitterSite) || isValidMetadataValue(effective.effectiveTwitterTitle))) {
    score += 10;
    completed++;
  }

  const finalScore = Math.min(100, Math.max(0, score));
  const rating =
    finalScore >= 90
      ? 'Excellent'
      : finalScore >= 70
      ? 'Good'
      : finalScore >= 40
      ? 'Needs Improvement'
      : 'Critical Issues';

  return {
    score: finalScore,
    rating,
    completedFields: completed,
    totalFields: 6,
    isComplete: finalScore >= 80,
  };
}

/**
 * Resolve effective values respecting inheritance and overrides.
 * When sync is enabled, inherit basic SEO fields when overrides are empty.
 * When sync is disabled, strictly use explicit overrides (empty overrides remain empty).
 */
export function resolveEffectiveValues(data: MetaFormData) {
  const isSync = Boolean(data.syncSocialWithBasic);

  const rawOgTitle = (data.ogTitle || '').trim();
  const rawTitle = (data.title || '').trim();
  const effectiveOgTitle = isSync
    ? (rawOgTitle || rawTitle)
    : rawOgTitle;

  const rawOgDesc = (data.ogDescription || '').trim();
  const rawDesc = (data.description || '').trim();
  const effectiveOgDesc = isSync
    ? (rawOgDesc || rawDesc)
    : rawOgDesc;

  const rawOgUrl = (data.ogUrl || '').trim();
  const rawCanonical = (data.canonicalUrl || '').trim();
  const effectiveOgUrl = isSync
    ? (rawOgUrl || rawCanonical)
    : rawOgUrl;

  const effectiveOgImage = (data.ogImage || '').trim();
  const rawOgImageAlt = (data.ogImageAlt || '').trim();
  const effectiveOgImageAlt = isSync
    ? (rawOgImageAlt || (effectiveOgImage ? rawTitle : ''))
    : rawOgImageAlt;

  const rawTwTitle = (data.twitterTitle || '').trim();
  const effectiveTwitterTitle = isSync
    ? (rawTwTitle || effectiveOgTitle)
    : rawTwTitle;

  const rawTwDesc = (data.twitterDescription || '').trim();
  const effectiveTwitterDesc = isSync
    ? (rawTwDesc || effectiveOgDesc)
    : rawTwDesc;

  const rawTwImage = (data.twitterImage || '').trim();
  const effectiveTwitterImage = isSync
    ? (rawTwImage || effectiveOgImage)
    : rawTwImage;

  const rawTwImageAlt = (data.twitterImageAlt || '').trim();
  const effectiveTwitterImageAlt = isSync
    ? (rawTwImageAlt || effectiveOgImageAlt)
    : rawTwImageAlt;

  return {
    title: rawTitle,
    description: rawDesc,
    canonicalUrl: rawCanonical,
    effectiveOgTitle,
    effectiveOgDesc,
    effectiveOgUrl,
    effectiveOgImage,
    effectiveOgImageAlt,
    effectiveTwitterTitle,
    effectiveTwitterDesc,
    effectiveTwitterImage,
    effectiveTwitterImageAlt,
    ogTitle: effectiveOgTitle,
    ogDescription: effectiveOgDesc,
    ogUrl: effectiveOgUrl,
    ogImage: effectiveOgImage,
    ogImageAlt: effectiveOgImageAlt,
    twitterTitle: effectiveTwitterTitle,
    twitterDescription: effectiveTwitterDesc,
    twitterImage: effectiveTwitterImage,
    twitterImageAlt: effectiveTwitterImageAlt,
  };
}

/**
 * Approximate pixel width calculation for search snippet titles and descriptions.
 * Uses character-width heuristics matching typical proportional sans-serif fonts (Arial/Roboto).
 */
export function estimatePixelWidth(text: string, fontSize = 16): number {
  if (!text) return 0;
  let totalWidth = 0;
  for (const char of text) {
    if (/[ijlI1\.,;:'!]/.test(char)) {
      totalWidth += fontSize * 0.3;
    } else if (/[mwMW@%#&]/.test(char)) {
      totalWidth += fontSize * 0.85;
    } else if (/[A-Z]/.test(char)) {
      totalWidth += fontSize * 0.65;
    } else if (/\s/.test(char)) {
      totalWidth += fontSize * 0.35;
    } else {
      totalWidth += fontSize * 0.52;
    }
  }
  return Math.round(totalWidth);
}

/**
 * Generate standard HTML <head> tags from MetaFormData
 */
export function generateMetaHtml(
  data: MetaFormData,
  section: 'all' | 'basic' | 'openGraph' | 'twitter' = 'all'
): string {
  const lines: string[] = [];
  const effective = resolveEffectiveValues(data);

  // SECTION 1: Document & Basic SEO
  if (section === 'all' || section === 'basic') {
    if (section === 'all') {
      lines.push('<!-- Primary Meta Tags -->');
    }

    if (isValidMetadataValue(data.charset)) {
      lines.push(`<meta charset="${escapeHtmlAttr(data.charset)}">`);
    }

    if (isValidMetadataValue(data.viewport)) {
      lines.push(`<meta name="viewport" content="${escapeHtmlAttr(data.viewport)}">`);
    }

    if (isValidMetadataValue(data.title)) {
      lines.push(`<title>${escapeHtmlText(data.title)}</title>`);
      lines.push(`<meta name="title" content="${escapeHtmlAttr(data.title)}">`);
    }

    if (isValidMetadataValue(data.description)) {
      lines.push(`<meta name="description" content="${escapeHtmlAttr(data.description)}">`);
    }

    const robotsContent = formatRobotsContent(data.robots);
    if (robotsContent && robotsContent !== 'index, follow') {
      lines.push(`<meta name="robots" content="${escapeHtmlAttr(robotsContent)}">`);
    }

    if (isValidCanonicalUrl(data.canonicalUrl)) {
      lines.push(`<link rel="canonical" href="${escapeHtmlAttr(data.canonicalUrl.trim())}">`);
    }

    if (isValidMetadataValue(data.author)) {
      lines.push(`<meta name="author" content="${escapeHtmlAttr(data.author)}">`);
    }

    if (isValidMetadataValue(data.themeColor)) {
      lines.push(`<meta name="theme-color" content="${escapeHtmlAttr(data.themeColor)}">`);
    }

    if (isValidMetadataValue(data.keywords)) {
      lines.push(`<meta name="keywords" content="${escapeHtmlAttr(data.keywords)}">`);
    }

  }

  // SECTION 2: Open Graph / Facebook / LinkedIn
  if (section === 'all' || section === 'openGraph') {
    if (section === 'all') {
      if (lines.length > 0) lines.push('');
      lines.push('<!-- Open Graph / Facebook / LinkedIn -->');
    }

    if (isValidMetadataValue(data.ogType)) {
      lines.push(`<meta property="og:type" content="${escapeHtmlAttr(data.ogType)}">`);
    }

    if (isValidCanonicalUrl(effective.effectiveOgUrl)) {
      lines.push(`<meta property="og:url" content="${escapeHtmlAttr(effective.effectiveOgUrl.trim())}">`);
    }

    if (isValidMetadataValue(effective.effectiveOgTitle)) {
      lines.push(`<meta property="og:title" content="${escapeHtmlAttr(effective.effectiveOgTitle)}">`);
    }

    if (isValidMetadataValue(effective.effectiveOgDesc)) {
      lines.push(
        `<meta property="og:description" content="${escapeHtmlAttr(effective.effectiveOgDesc)}">`
      );
    }

    if (isValidMetadataValue(effective.effectiveOgImage) && /^https?:\/\//i.test(effective.effectiveOgImage.trim())) {
      lines.push(`<meta property="og:image" content="${escapeHtmlAttr(effective.effectiveOgImage.trim())}">`);

      if (isValidMetadataValue(effective.effectiveOgImageAlt)) {
        lines.push(
          `<meta property="og:image:alt" content="${escapeHtmlAttr(effective.effectiveOgImageAlt)}">`
        );
      }

      if (isValidMetadataValue(data.ogImageWidth)) {
        lines.push(`<meta property="og:image:width" content="${escapeHtmlAttr(data.ogImageWidth)}">`);
      }

      if (isValidMetadataValue(data.ogImageHeight)) {
        lines.push(
          `<meta property="og:image:height" content="${escapeHtmlAttr(data.ogImageHeight)}">`
        );
      }

      if (isValidMetadataValue(data.ogImageType)) {
        lines.push(`<meta property="og:image:type" content="${escapeHtmlAttr(data.ogImageType)}">`);
      }
    }

    if (isValidMetadataValue(data.ogSiteName)) {
      lines.push(`<meta property="og:site_name" content="${escapeHtmlAttr(data.ogSiteName)}">`);
    }

    if (isValidMetadataValue(data.ogLocale)) {
      lines.push(`<meta property="og:locale" content="${escapeHtmlAttr(data.ogLocale)}">`);
    }

    // Article properties
    if (data.ogType === 'article') {
      if (isValidMetadataValue(data.articleAuthor)) {
        lines.push(
          `<meta property="article:author" content="${escapeHtmlAttr(data.articleAuthor)}">`
        );
      }
      if (isValidMetadataValue(data.articlePublishedTime)) {
        lines.push(
          `<meta property="article:published_time" content="${escapeHtmlAttr(data.articlePublishedTime)}">`
        );
      }
      if (isValidMetadataValue(data.articleSection)) {
        lines.push(
          `<meta property="article:section" content="${escapeHtmlAttr(data.articleSection)}">`
        );
      }
      if (data.articleTag) {
        data.articleTag
          .split(',')
          .map((t: string) => t.trim())
          .filter((tag: string) => isValidMetadataValue(tag))
          .forEach((tag: string) => {
            lines.push(
              `<meta property="article:tag" content="${escapeHtmlAttr(tag)}">`
            );
          });
      }
    }

    // Product properties
    if (data.ogType === 'product') {
      if (isValidMetadataValue(data.productPriceAmount)) {
        lines.push(
          `<meta property="product:price:amount" content="${escapeHtmlAttr(data.productPriceAmount)}">`
        );
      }
      if (isValidMetadataValue(data.productPriceCurrency)) {
        lines.push(
          `<meta property="product:price:currency" content="${escapeHtmlAttr(data.productPriceCurrency)}">`
        );
      }
    }
  }

  // SECTION 3: Twitter / X Cards
  if (section === 'all' || section === 'twitter') {
    if (section === 'all') {
      if (lines.length > 0) lines.push('');
      lines.push('<!-- Twitter / X -->');
    }

    if (isValidMetadataValue(data.twitterCard)) {
      lines.push(`<meta name="twitter:card" content="${escapeHtmlAttr(data.twitterCard)}">`);
    }

    if (isValidMetadataValue(effective.effectiveTwitterTitle)) {
      lines.push(
        `<meta name="twitter:title" content="${escapeHtmlAttr(effective.effectiveTwitterTitle)}">`
      );
    }

    if (isValidMetadataValue(effective.effectiveTwitterDesc)) {
      lines.push(
        `<meta name="twitter:description" content="${escapeHtmlAttr(effective.effectiveTwitterDesc)}">`
      );
    }

    if (isValidMetadataValue(effective.effectiveTwitterImage) && /^https?:\/\//i.test(effective.effectiveTwitterImage.trim())) {
      lines.push(
        `<meta name="twitter:image" content="${escapeHtmlAttr(effective.effectiveTwitterImage.trim())}">`
      );

      if (isValidMetadataValue(effective.effectiveTwitterImageAlt)) {
        lines.push(
          `<meta name="twitter:image:alt" content="${escapeHtmlAttr(effective.effectiveTwitterImageAlt)}">`
        );
      }
    }

    if (isValidMetadataValue(data.twitterSite)) {
      const trimmedSite = data.twitterSite.trim();
      const site = trimmedSite.startsWith('@') ? trimmedSite : `@${trimmedSite}`;
      if (site.length > 1 && !/\s/.test(site) && !isInstructionalPlaceholder(site)) {
        lines.push(`<meta name="twitter:site" content="${escapeHtmlAttr(site)}">`);
      }
    }

    if (isValidMetadataValue(data.twitterCreator)) {
      const trimmedCreator = data.twitterCreator.trim();
      const creator = trimmedCreator.startsWith('@') ? trimmedCreator : `@${trimmedCreator}`;
      // CRITICAL: Creator handle must be valid, not just '@', contain no whitespace/instructional phrases
      if (creator.length > 1 && !/\s/.test(creator) && !isInstructionalPlaceholder(creator)) {
        lines.push(`<meta name="twitter:creator" content="${escapeHtmlAttr(creator)}">`);
      }
    }
  }

  // SECTION 4: Custom Metadata Tags
  if ((section === 'all' || section === 'basic') && data.customTags && data.customTags.length > 0) {
    const validCustom = data.customTags.filter(
      (c) =>
        isValidMetadataValue(c.key) &&
        (isValidMetadataValue(c.value) || isValidMetadataValue(c.content))
    );
    if (validCustom.length > 0) {
      if (section === 'all') {
        if (lines.length > 0) lines.push('');
        lines.push('<!-- Custom Metadata -->');
      }
      for (const custom of validCustom) {
        const attr =
          custom.type === 'property'
            ? 'property'
            : custom.type === 'http-equiv'
            ? 'http-equiv'
            : 'name';
        const val = (custom.value || custom.content || '').trim();
        lines.push(
          `<meta ${attr}="${escapeHtmlAttr(custom.key.trim())}" content="${escapeHtmlAttr(
            val
          )}">`
        );
      }
    }
  }

  return lines.join('\n');
}

/**
 * Calculate SEO & Open Graph Quality Audit Score (0 - 100)
 */
export function calculateAuditScore(data: MetaFormData): AuditResult {
  const findings: AuditFinding[] = [];
  let score = 0;
  const effective = resolveEffectiveValues(data);

  // 1. BASIC SEO EVALUATION (Max 35 points)
  // Title Check (15 pts)
  const title = (data.title || '').trim();
  if (!title) {
    findings.push({
      id: 'title-missing',
      severity: 'error',
      category: 'basic',
      title: 'Missing Page Title',
      observed: 'No <title> tag defined.',
      explanation:
        'The page title is the single most critical on-page SEO signal and determines the headline shown in search results.',
      recommendation: 'Add a concise, compelling title between 40 and 60 characters with primary keywords.',
      field: 'title',
    });
  } else if (isInstructionalPlaceholder(title)) {
    findings.push({
      id: 'title-placeholder',
      severity: 'error',
      category: 'basic',
      title: 'Placeholder or Instructional Title Detected',
      observed: title || 'None',
      explanation:
        'The page title contains template directions or placeholder text that search crawlers will index verbatim.',
      recommendation: 'Replace placeholder with your real authoritative page title or leave empty.',
      field: 'title',
    });
  } else if (title.length < 20) {
    score += 8;
    findings.push({
      id: 'title-short',
      severity: 'warning',
      category: 'basic',
      title: 'Short Page Title',
      observed: `${title.length} characters ("${title}")`,
      explanation:
        'Search engines display titles up to ~60 characters (~580px). Very short titles miss opportunities to include relevant descriptive context.',
      recommendation: 'Expand title to 40-60 characters to maximize click-through rate.',
      field: 'title',
    });
  } else if (title.length > 60) {
    score += 10;
    findings.push({
      id: 'title-long',
      severity: 'warning',
      category: 'basic',
      title: 'Title May Be Truncated in SERP',
      observed: `${title.length} characters (typical limit ~60 characters / 580px)`,
      explanation:
        'Titles longer than 60 characters or ~580px are frequently truncated by Google with an ellipsis (...).',
      recommendation: 'Keep primary brand and keywords in the first 55 characters.',
      field: 'title',
    });
  } else {
    score += 15;
    findings.push({
      id: 'title-optimal',
      severity: 'success',
      category: 'basic',
      title: 'Optimal Title Length',
      observed: `${title.length} characters`,
      explanation: 'Length is within the ideal 30–60 character window.',
      recommendation: 'Maintain primary keyword focus.',
    });
  }

  // Description Check (10 pts)
  const desc = (data.description || '').trim();
  if (!desc) {
    findings.push({
      id: 'desc-missing',
      severity: 'error',
      category: 'basic',
      title: 'Missing Meta Description',
      observed: 'No <meta name="description"> tag specified.',
      explanation:
        'Search engines display the meta description in search snippets. When missing, search engines generate an arbitrary snippet from page text.',
      recommendation: 'Write an actionable 120-160 character description summarizing page value.',
      field: 'description',
    });
  } else if (isInstructionalPlaceholder(desc)) {
    findings.push({
      id: 'desc-placeholder',
      severity: 'error',
      category: 'basic',
      title: 'Placeholder or Instructional Description Detected',
      observed: desc || 'None',
      explanation: 'Search snippet text contains placeholder or instructional content.',
      recommendation: 'Provide an actionable 120-160 character description of page content.',
      field: 'description',
    });
  } else if (desc.length < 50) {
    score += 5;
    findings.push({
      id: 'desc-short',
      severity: 'warning',
      category: 'basic',
      title: 'Short Meta Description',
      observed: `${desc.length} characters`,
      explanation: 'Search snippet space permits up to ~160 characters (~960px).',
      recommendation: 'Elaborate further up to 120-160 characters to increase snippet appeal.',
      field: 'description',
    });
  } else if (desc.length > 160) {
    score += 7;
    findings.push({
      id: 'desc-long',
      severity: 'warning',
      category: 'basic',
      title: 'Meta Description May Be Truncated',
      observed: `${desc.length} characters (typical limit ~155-160 characters)`,
      explanation: 'Search snippets on mobile and desktop typically cut off after ~155-160 characters.',
      recommendation: 'Trim description to 150-160 characters ensuring call-to-action is early.',
      field: 'description',
    });
  } else {
    score += 10;
    findings.push({
      id: 'desc-optimal',
      severity: 'success',
      category: 'basic',
      title: 'Optimal Meta Description',
      observed: `${desc.length} characters`,
      explanation: 'Description fits smoothly within the 120-160 character snippet window.',
      recommendation: 'Ensure strong call-to-action.',
    });
  }

  // Canonical URL Check (10 pts)
  const canonical = (data.canonicalUrl || '').trim();
  if (!canonical) {
    findings.push({
      id: 'canonical-missing',
      severity: 'warning',
      category: 'basic',
      title: 'Missing Canonical URL',
      observed: 'No <link rel="canonical"> specified.',
      explanation:
        'Canonical URLs prevent duplicate content penalties from query parameters, trailing slashes, or duplicate protocols (HTTP vs HTTPS).',
      recommendation: 'Specify the authoritative absolute HTTPS URL.',
      field: 'canonicalUrl',
    });
  } else if (isInstructionalPlaceholder(canonical)) {
    findings.push({
      id: 'canonical-placeholder',
      severity: 'error',
      category: 'basic',
      title: 'Placeholder Canonical URL Detected',
      observed: canonical,
      explanation: 'Canonical URL contains instructional placeholder text.',
      recommendation: 'Enter your real authoritative HTTPS canonical URL.',
      field: 'canonicalUrl',
    });
  } else if (!isValidCanonicalUrl(canonical)) {
    findings.push({
      id: 'canonical-invalid',
      severity: 'error',
      category: 'basic',
      title: 'Invalid Canonical URL Format',
      observed: canonical,
      explanation: 'Canonical URLs must be valid, well-formed absolute URLs starting with http:// or https:// without spaces.',
      recommendation: 'Provide a valid authoritative absolute URL (e.g. https://yourdomain.com/page).',
      field: 'canonicalUrl',
    });
  } else if (isDemoCanonicalUrl(canonical)) {
    score += 8;
    findings.push({
      id: 'canonical-demo',
      severity: 'info',
      category: 'basic',
      title: 'Example / Demo Canonical URL Detected',
      observed: canonical,
      explanation: 'This canonical URL references an example or demo domain (e.g. example.com). Ensure you replace it with your production domain before launch.',
      recommendation: 'Replace example domain with your authoritative website URL.',
      field: 'canonicalUrl',
    });
  } else if (canonical.startsWith('http://')) {
    score += 6;
    findings.push({
      id: 'canonical-http',
      severity: 'warning',
      category: 'basic',
      title: 'Insecure HTTP Canonical URL',
      observed: canonical,
      explanation: 'Canonical URLs should ideally point to secure HTTPS origins.',
      recommendation: 'Update scheme to https://.',
      field: 'canonicalUrl',
    });
  } else {
    score += 10;
    findings.push({
      id: 'canonical-valid',
      severity: 'success',
      category: 'basic',
      title: 'Valid Canonical URL Declared',
      observed: canonical,
      explanation: 'Authoritative absolute HTTPS URL defined.',
      recommendation: 'Keep canonical URL updated across migrations.',
    });
  }

  // 2. OPEN GRAPH EVALUATION (Max 40 points)
  // og:title (10 pts)
  if (!effective.effectiveOgTitle || isInstructionalPlaceholder(effective.effectiveOgTitle)) {
    findings.push({
      id: 'og-title-missing',
      severity: 'error',
      category: 'openGraph',
      title: 'Missing Open Graph Title (og:title)',
      observed: effective.effectiveOgTitle || 'No og:title declared or inherited.',
      explanation: 'Social platforms need og:title to render headline links on Facebook, LinkedIn, Discord, and Slack.',
      recommendation: 'Define og:title or enable basic metadata synchronization.',
      field: 'ogTitle',
    });
  } else {
    score += 10;
  }

  // og:description (10 pts)
  if (!effective.effectiveOgDesc || isInstructionalPlaceholder(effective.effectiveOgDesc)) {
    findings.push({
      id: 'og-desc-missing',
      severity: 'warning',
      category: 'openGraph',
      title: 'Missing Open Graph Description (og:description)',
      observed: effective.effectiveOgDesc || 'No og:description defined.',
      explanation: 'Social cards without description appear empty or show arbitrary text.',
      recommendation: 'Add an engaging 2-sentence summary.',
      field: 'ogDescription',
    });
  } else {
    score += 10;
  }

  // og:image (15 pts)
  const ogImg = (effective.effectiveOgImage || '').trim();
  if (!ogImg || isInstructionalPlaceholder(ogImg)) {
    findings.push({
      id: 'og-image-missing',
      severity: 'error',
      category: 'openGraph',
      title: 'Missing Open Graph Image (og:image)',
      observed: 'No og:image specified.',
      explanation:
        'Links shared without og:image have up to 80% lower social engagement and render as plain text snippets.',
      recommendation: 'Provide a high-resolution 1200x630 PNG or JPG image URL.',
      field: 'ogImage',
    });
  } else if (!isValidCanonicalUrl(ogImg)) {
    findings.push({
      id: 'og-image-not-absolute',
      severity: 'error',
      category: 'openGraph',
      title: 'Social Image URL Is Invalid or Relative',
      observed: ogImg,
      explanation:
        'Social crawlers (Facebook, LinkedIn, X, Slack) do NOT resolve relative or invalid image paths. The image will fail to load.',
      recommendation: 'Use a valid absolute URL starting with https://.',
      field: 'ogImage',
    });
  } else {
    score += 15;
    findings.push({
      id: 'og-image-valid',
      severity: 'success',
      category: 'openGraph',
      title: 'Social Share Image Configured',
      observed: ogImg,
      explanation: 'Absolute URL defined for social sharing cards.',
      recommendation: 'Verify dimensions are 1200 × 630 px (1.91:1 ratio) for best display.',
    });
  }

  // og:url (5 pts)
  if (effective.effectiveOgUrl && isValidCanonicalUrl(effective.effectiveOgUrl)) {
    score += 5;
  } else {
    findings.push({
      id: 'og-url-missing',
      severity: 'info',
      category: 'openGraph',
      title: 'Missing or Non-Absolute og:url',
      observed: effective.effectiveOgUrl || 'Not specified',
      explanation: 'og:url establishes the canonical identity of the page in the social graph.',
      recommendation: 'Set og:url to the absolute canonical URL of this page.',
      field: 'ogUrl',
    });
  }

  // 3. TWITTER / X CARD EVALUATION (Max 15 points)
  const hasTwitterContent = Boolean(
    (effective.effectiveTwitterTitle && !isInstructionalPlaceholder(effective.effectiveTwitterTitle)) ||
    (effective.effectiveTwitterImage && !isInstructionalPlaceholder(effective.effectiveTwitterImage)) ||
    (data.twitterSite && !isInstructionalPlaceholder(data.twitterSite))
  );

  // twitter:card (5 pts)
  if (!data.twitterCard) {
    findings.push({
      id: 'twitter-card-missing',
      severity: 'warning',
      category: 'twitter',
      title: 'Missing twitter:card',
      observed: 'No twitter:card declared.',
      explanation: 'Without twitter:card, X (Twitter) may not render a rich summary preview.',
      recommendation: 'Select summary_large_image for visual content or summary for text-centric content.',
      field: 'twitterCard',
    });
  } else if (hasTwitterContent) {
    score += 5;
  }

  // twitter:image (5 pts)
  if (effective.effectiveTwitterImage && isValidCanonicalUrl(effective.effectiveTwitterImage) && !isInstructionalPlaceholder(effective.effectiveTwitterImage)) {
    score += 5;
  } else if (data.twitterCard === 'summary_large_image' && !effective.effectiveTwitterImage) {
    findings.push({
      id: 'twitter-large-no-img',
      severity: 'error',
      category: 'twitter',
      title: 'Large Summary Card Without Image',
      observed: 'twitter:card is summary_large_image, but no image is specified.',
      explanation: 'A large summary card without an image degrades to an unstyled text card.',
      recommendation: 'Specify a 1200x630 image URL or switch to standard summary card.',
      field: 'twitterImage',
    });
  }

  // twitter:site (5 pts)
  if (data.twitterSite && isValidMetadataValue(data.twitterSite) && !/\s/.test(data.twitterSite.trim())) {
    score += 5;
  } else {
    findings.push({
      id: 'twitter-site-info',
      severity: 'info',
      category: 'twitter',
      title: 'Optional: Twitter @site Handle',
      observed: data.twitterSite || 'Not specified',
      explanation: 'Attributing your organization handle allows Twitter to credit your account on shared posts.',
      recommendation: 'Add @yourbrand to associate shared links with your profile.',
      field: 'twitterSite',
    });
  }

  // twitter:creator check for instructional text
  if (data.twitterCreator && isInstructionalPlaceholder(data.twitterCreator)) {
    findings.push({
      id: 'twitter-creator-placeholder',
      severity: 'error',
      category: 'twitter',
      title: 'Instructional Creator Handle Detected',
      observed: data.twitterCreator,
      explanation:
        'twitter:creator contains instructional or template directions. This will be omitted from generated tags.',
      recommendation: 'Specify a valid @handle or leave blank.',
      field: 'twitterCreator',
    });
  }

  // 4. TECHNICAL & ACCESSIBILITY EVALUATION (Max 10 points)
  // Viewport (4 pts)
  if (data.viewport && data.viewport.includes('width=device-width')) {
    score += 4;
  } else {
    findings.push({
      id: 'viewport-missing',
      severity: 'error',
      category: 'technical',
      title: 'Missing Mobile Viewport Meta Tag',
      observed: data.viewport || 'Not specified',
      explanation:
        'Without <meta name="viewport" content="width=device-width, initial-scale=1.0">, mobile browsers render in desktop simulation mode.',
      recommendation: 'Include standard width=device-width, initial-scale=1.0 viewport tag.',
      field: 'viewport',
    });
  }

  // Charset (3 pts)
  if (data.charset && /utf-8/i.test(data.charset)) {
    score += 3;
  } else {
    findings.push({
      id: 'charset-missing',
      severity: 'warning',
      category: 'technical',
      title: 'Non-Standard Charset Declaration',
      observed: data.charset || 'Not specified',
      explanation: '<meta charset="UTF-8"> must be declared early in <head> to prevent character encoding issues.',
      recommendation: 'Set charset to UTF-8.',
      field: 'charset',
    });
  }

  // Image alt text (3 pts)
  if (effective.effectiveOgImage && effective.effectiveOgImageAlt && !isInstructionalPlaceholder(effective.effectiveOgImageAlt)) {
    score += 3;
    findings.push({
      id: 'og-image-alt-present',
      severity: 'success',
      category: 'openGraph',
      title: 'Social Image Alt Text Configured',
      observed: `"${effective.effectiveOgImageAlt}"`,
      explanation: 'og:image:alt ensures screen readers can describe the social preview image.',
      recommendation: 'Maintain descriptive alt text.',
    });
  } else if (effective.effectiveOgImage && !effective.effectiveOgImageAlt) {
    findings.push({
      id: 'og-image-alt-missing',
      severity: 'info',
      category: 'openGraph',
      title: 'Missing Social Image Alt Text (og:image:alt)',
      observed: 'No alt description for og:image.',
      explanation: 'Accessible social preview tags improve accessibility for visually impaired users.',
      recommendation: 'Add a concise description of what the social image depicts.',
      field: 'ogImageAlt',
    });
  }

  // 5. DUPLICATE TAGS CHECK
  if (data.duplicateTags && data.duplicateTags.length > 0) {
    score = Math.max(0, score - 15);
    findings.push({
      id: 'duplicate-tags',
      severity: 'error',
      category: 'technical',
      title: 'Duplicate Metadata Tags Detected',
      observed: `Duplicate declarations found for: ${data.duplicateTags.join(', ')}`,
      explanation:
        'Multiple conflicting <title>, <meta description>, or canonical tags confuse search crawlers and lead to non-deterministic indexing behavior.',
      recommendation:
        'Remove redundant declarations so only one authoritative instance of each tag remains in the HTML head.',
    });
  }

  // Cap score at 100
  score = Math.min(100, Math.max(0, score));

  // Determine overall rating
  let rating: AuditResult['rating'] = 'Needs Improvement';
  if (score >= 90) rating = 'Excellent';
  else if (score >= 70) rating = 'Good';
  else if (score >= 50) rating = 'Needs Improvement';
  else rating = 'Critical Issues';

  const summary = {
    errors: findings.filter((f) => f.severity === 'error').length,
    warnings: findings.filter((f) => f.severity === 'warning').length,
    info: findings.filter((f) => f.severity === 'info').length,
    passed: findings.filter((f) => f.severity === 'success').length,
  };

  return {
    score,
    rating,
    findings,
    summary,
  };
}

/**
 * Client-Safe HTML Metadata Parser
 * Parses pasted HTML or fetched head source into structured MetaFormData
 * Uses DOMParser in browser, safe regex extraction in Node.
 */
export function parseHtmlMetadata(html: string): Partial<MetaFormData> {
  const result: Partial<MetaFormData> = {
    robots: {
      index: true,
      follow: true,
      noarchive: false,
      nosnippet: false,
      noimageindex: false,
      notranslate: false,
      maxSnippet: null,
      maxImagePreview: null,
    },
    customTags: [],
    duplicateTags: [],
  };

  if (!html || typeof html !== 'string') return result;

  const duplicates: string[] = [];

  // Safe Browser DOMParser
  if (typeof window !== 'undefined' && typeof window.DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Check duplicates
      const titles = doc.querySelectorAll('title');
      if (titles.length > 1) duplicates.push('<title>');

      const descriptions = doc.querySelectorAll('meta[name="description"]');
      if (descriptions.length > 1) duplicates.push('<meta name="description">');

      const canonicals = doc.querySelectorAll('link[rel~="canonical"]');
      if (canonicals.length > 1) duplicates.push('<link rel="canonical">');

      // 1. Title
      const titleElem = doc.querySelector('title');
      if (titleElem && titleElem.textContent) {
        result.title = decodeHtmlEntities(titleElem.textContent.trim());
      }

      // 2. Canonical
      const canonicalElem = doc.querySelector('link[rel~="canonical"]');
      if (canonicalElem) {
        result.canonicalUrl = canonicalElem.getAttribute('href') || '';
      }

      // 3. Meta tags
      const metaTags = doc.querySelectorAll('meta');
      metaTags.forEach((meta) => {
        const name = meta.getAttribute('name')?.toLowerCase();
        const prop = meta.getAttribute('property')?.toLowerCase();
        const content = decodeHtmlEntities(meta.getAttribute('content') || '');
        const charset = meta.getAttribute('charset');

        if (charset) {
          result.charset = charset;
        }

        if (name === 'viewport') result.viewport = content;
        if (name === 'description') result.description = content;
        if (name === 'author') result.author = content;
        if (name === 'keywords') result.keywords = content;
        if (name === 'theme-color') result.themeColor = content;

        // Robots
        if (name === 'robots') {
          const lower = content.toLowerCase();
          result.robots = {
            index: !lower.includes('noindex'),
            follow: !lower.includes('nofollow'),
            noarchive: lower.includes('noarchive'),
            nosnippet: lower.includes('nosnippet'),
            noimageindex: lower.includes('noimageindex'),
            notranslate: lower.includes('notranslate'),
            maxSnippet: lower.includes('max-snippet') ? -1 : null,
            maxImagePreview: lower.includes('max-image-preview:large')
              ? 'large'
              : lower.includes('max-image-preview:none')
              ? 'none'
              : null,
          };
        }

        // Open Graph
        if (prop === 'og:title') result.ogTitle = content;
        if (prop === 'og:description') result.ogDescription = content;
        if (prop === 'og:url') result.ogUrl = content;
        if (prop === 'og:image') result.ogImage = content;
        if (prop === 'og:image:alt') result.ogImageAlt = content;
        if (prop === 'og:type') result.ogType = content as OgType;
        if (prop === 'og:site_name') result.ogSiteName = content;
        if (prop === 'og:locale') result.ogLocale = content;
        if (prop === 'og:image:width') result.ogImageWidth = content;
        if (prop === 'og:image:height') result.ogImageHeight = content;
        if (prop === 'og:image:type') result.ogImageType = content;

        // Twitter
        if (name === 'twitter:card') result.twitterCard = content as TwitterCardType;
        if (name === 'twitter:title') result.twitterTitle = content;
        if (name === 'twitter:description') result.twitterDescription = content;
        if (name === 'twitter:image') result.twitterImage = content;
        if (name === 'twitter:image:alt') result.twitterImageAlt = content;
        if (name === 'twitter:site') result.twitterSite = content;
        if (name === 'twitter:creator') result.twitterCreator = content;
      });

      result.duplicateTags = duplicates;
      return result;
    } catch {
      // Fallback to regex below
    }
  }

  // Fallback: Safe RegExp Parsing (For Node or parser failure)
  const titleMatches = Array.from(html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi));
  if (titleMatches.length > 1) duplicates.push('<title>');
  if (titleMatches.length > 0 && titleMatches[0][1]) {
    result.title = decodeHtmlEntities(titleMatches[0][1].replace(/<[^>]+>/g, '').trim());
  }

  const descMatches = Array.from(html.matchAll(/<meta\s+[^>]*name=["']description["'][^>]*>/gi));
  if (descMatches.length > 1) duplicates.push('<meta name="description">');

  const canonicalMatches = Array.from(html.matchAll(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi));
  if (canonicalMatches.length > 1) duplicates.push('<link rel="canonical">');

  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  if (canonicalMatch && canonicalMatch[1]) {
    result.canonicalUrl = canonicalMatch[1];
  }

  const metaMatches = html.matchAll(/<meta\s+([^>]+)>/gi);
  for (const m of metaMatches) {
    const attrStr = m[1];
    const nameMatch = attrStr.match(/name=["']([^"']+)["']/i);
    const propMatch = attrStr.match(/property=["']([^"']+)["']/i);
    const contentMatch = attrStr.match(/content=["']([^"']+)["']/i);
    const charsetMatch = attrStr.match(/charset=["']([^"']+)["']/i);

    if (charsetMatch && charsetMatch[1]) result.charset = charsetMatch[1];

    const key = (nameMatch ? nameMatch[1] : propMatch ? propMatch[1] : '').toLowerCase();
    const content = contentMatch ? decodeHtmlEntities(contentMatch[1]) : '';

    if (key === 'description') result.description = content;
    if (key === 'viewport') result.viewport = content;
    if (key === 'author') result.author = content;
    if (key === 'keywords') result.keywords = content;
    if (key === 'theme-color') result.themeColor = content;

    // Robots
    if (key === 'robots') {
      const lower = content.toLowerCase();
      result.robots = {
        index: !lower.includes('noindex'),
        follow: !lower.includes('nofollow'),
        noarchive: lower.includes('noarchive'),
        nosnippet: lower.includes('nosnippet'),
        noimageindex: lower.includes('noimageindex'),
        notranslate: lower.includes('notranslate'),
        maxSnippet: lower.includes('max-snippet') ? -1 : null,
        maxImagePreview: lower.includes('max-image-preview:large')
          ? 'large'
          : lower.includes('max-image-preview:none')
          ? 'none'
          : null,
      };
    }

    if (key === 'og:title') result.ogTitle = content;
    if (key === 'og:description') result.ogDescription = content;
    if (key === 'og:url') result.ogUrl = content;
    if (key === 'og:image') result.ogImage = content;
    if (key === 'og:image:alt') result.ogImageAlt = content;
    if (key === 'og:type') result.ogType = content as OgType;
    if (key === 'og:site_name') result.ogSiteName = content;
    if (key === 'og:locale') result.ogLocale = content;

    if (key === 'twitter:card') result.twitterCard = content as TwitterCardType;
    if (key === 'twitter:title') result.twitterTitle = content;
    if (key === 'twitter:description') result.twitterDescription = content;
    if (key === 'twitter:image') result.twitterImage = content;
    if (key === 'twitter:site') result.twitterSite = content;
    if (key === 'twitter:creator') result.twitterCreator = content;
  }

  result.duplicateTags = duplicates;
  return result;
}

/**
 * Default Blank Form State
 */
export function getInitialFormData(): MetaFormData {
  return {
    title: '',
    description: '',
    canonicalUrl: '',
    robots: {
      index: true,
      follow: true,
      noarchive: false,
      nosnippet: false,
      noimageindex: false,
      notranslate: false,
      maxSnippet: -1,
      maxImagePreview: 'large',
    },
    author: '',
    themeColor: '',
    language: 'en',
    charset: 'UTF-8',
    viewport: 'width=device-width, initial-scale=1.0',
    keywords: '',
    customTags: [],

    ogType: 'website',
    ogTitle: '',
    ogDescription: '',
    ogUrl: '',
    ogImage: '',
    ogImageAlt: '',
    ogSiteName: '',
    ogLocale: '',
    ogImageWidth: '1200',
    ogImageHeight: '630',
    ogImageType: 'image/jpeg',

    twitterCard: 'summary_large_image',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    twitterImageAlt: '',
    twitterSite: '',
    twitterCreator: '',

    syncSocialWithBasic: true,
  };
}

/**
 * Curated High-Quality Presets for Quick Testing & Realistic Demonstration
 */
export const SAMPLE_PRESETS: Record<string, Partial<MetaFormData>> = {
  saas: {
    title: 'OmniTools Suite — Free Online Developer Utilities (Demo)',
    description:
      'Demonstration configuration showcasing search snippet tags and Open Graph preview cards for a modern online utilities suite.',
    canonicalUrl: 'https://example.com/demo/omnitools-suite',
    author: 'OmniTools Team (Demo)',
    themeColor: '#3b82f6',
    language: 'en',
    ogType: 'website',
    ogTitle: 'OmniTools Suite — Free Online Developer Utilities (Demo)',
    ogDescription:
      'Demonstration configuration showcasing search snippet tags and Open Graph preview cards for a modern online utilities suite.',
    ogUrl: 'https://example.com/demo/omnitools-suite',
    ogImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=630&q=80',
    ogImageAlt: 'OmniTools productivity application dashboard preview (Demo Asset)',
    ogSiteName: 'OmniTools Demo',
    ogLocale: 'en_US',
    ogImageWidth: '1200',
    ogImageHeight: '630',
    twitterCard: 'summary_large_image',
    twitterSite: '@omnitools_demo',
    twitterCreator: '@omnitools_demo',
    syncSocialWithBasic: true,
  },
  article: {
    title: 'The Modern Guide to Open Graph & Social Meta Tags in 2026 (Demo)',
    description:
      'Demonstration editorial article showcasing complete Open Graph, Twitter Cards, article author, and published time metadata.',
    canonicalUrl: 'https://example.com/demo/modern-open-graph-guide',
    author: 'Elena Vance, Senior SEO Architect',
    themeColor: '#8b5cf6',
    language: 'en',
    ogType: 'article',
    ogTitle: 'The Modern Guide to Open Graph & Social Meta Tags in 2026 (Demo)',
    ogDescription:
      'Demonstration editorial article showcasing complete Open Graph, Twitter Cards, article author, and published time metadata.',
    ogUrl: 'https://example.com/demo/modern-open-graph-guide',
    ogImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&h=630&q=80',
    ogImageAlt: 'Social media cards analytics and SEO diagrams on a laptop screen (Demo Asset)',
    ogSiteName: 'OmniTools Insights (Demo)',
    ogLocale: 'en_US',
    ogImageWidth: '1200',
    ogImageHeight: '630',
    articleAuthor: 'Elena Vance',
    articlePublishedTime: '2026-03-15T08:00:00Z',
    articleSection: 'Technical SEO',
    twitterCard: 'summary_large_image',
    twitterSite: '@omnitools_demo',
    twitterCreator: '@elenavance_demo',
    syncSocialWithBasic: true,
  },
  product: {
    title: 'Apex Mechanical Keyboard Pro — Wireless Hot-Swap RGB (Demo)',
    description:
      'Demonstration product metadata showcasing e-commerce Open Graph tags, pricing amount, currency, and high-resolution social preview image.',
    canonicalUrl: 'https://example.com/demo/apex-mechanical-keyboard',
    author: 'Apex Hardware Labs (Demo)',
    themeColor: '#0f172a',
    language: 'en',
    ogType: 'product',
    ogTitle: 'Apex Mechanical Keyboard Pro — Wireless Hot-Swap RGB (Demo)',
    ogDescription:
      'Demonstration product metadata showcasing e-commerce Open Graph tags, pricing amount, currency, and high-resolution social preview image.',
    ogUrl: 'https://example.com/demo/apex-mechanical-keyboard',
    ogImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&h=630&q=80',
    ogImageAlt: 'Apex Mechanical Keyboard with custom PBT keycaps on a minimal wooden desk (Demo Asset)',
    ogSiteName: 'Apex Labs (Demo)',
    ogLocale: 'en_US',
    productPriceAmount: '189.00',
    productPriceCurrency: 'USD',
    twitterCard: 'summary_large_image',
    twitterSite: '@apexlabs_demo',
    twitterCreator: '@apexlabs_demo',
    syncSocialWithBasic: true,
  },
};
