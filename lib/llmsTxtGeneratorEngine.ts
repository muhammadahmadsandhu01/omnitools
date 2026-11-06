/**
 * KivaroTools — Client-Side llms.txt, llms-full.txt & AI Crawler (robots.txt / IETF AIPREF / W3C TDMRep) Engine
 * File: lib/llmsTxtGeneratorEngine.ts
 * Version: 2.0
 *
 * 100% Local Browser Execution • Zero External Dependencies • RFC 9309 & llmstxt.org v2 Compliant
 */

export type AiCrawlerRole =
    | 'AI_SEARCH_CITATION'
    | 'USER_TRIGGERED_FETCHER'
    | 'MODEL_TRAINING_SCRAPER'
    | 'USAGE_OPT_OUT_TOKEN'
    | 'BULK_DATASET_SCRAPER';

export type AiBotPermission = 'ALLOW' | 'BLOCK' | 'CUSTOM_PATHS';

export type GeoPresetId =
    | 'geo_max_visibility'
    | 'open_source_max_reach'
    | 'strict_copyright_shield'
    | 'total_ai_lockdown'
    | 'ecommerce_saas_funnel_guard'
    | 'eu_dsm_ietf_compliance';

export type LlmsSectionCategory =
    | 'Core Documentation'
    | 'API & SDK Reference'
    | 'Guides & Tutorials'
    | 'Product & Pricing'
    | 'Company & Policies'
    | 'Optional';

export interface LlmsLinkItem {
    id: string;
    title: string;
    url: string;
    description: string;
    section: LlmsSectionCategory | string;
    includedInLlmsTxt: boolean;
    includedInFullTxt: boolean;
    fullMarkdownContent: string;
    priorityScore: number;
    lastModified?: string;
}

export interface LlmsFullPageItem {
    id: string;
    title: string;
    url: string;
    description: string;
    markdownBody: string;
    wordCount: number;
    estimatedTokens: number;
}

export interface AiCrawlerBotRule {
    id: string;
    userAgent: string;
    operator: string;
    role: AiCrawlerRole;
    respectsRobotsTxt: 'YES' | 'DOCUMENTED_YES_OBSERVED_MIXED' | 'PARTIAL';
    publishedIpRanges: string;
    permission: AiBotPermission;
    customAllowPaths: string[];
    customDisallowPaths: string[];
    description: string;
    geoImpactNote: string;
}

export interface IetfContentUsageConfig {
    enabled: boolean;
    allowAiTraining: boolean; // train-ai=y / train-ai=n
    allowAiInference: boolean; // ai=y / ai=n
    allowSearchIndexing: boolean; // search=y / search=n
    disallowPathsForTraining: string[];
}

export interface W3cTdmRepConfig {
    enabled: boolean;
    reservation: 0 | 1; // 1 = All TDM rights reserved (opt-out of training), 0 = No reservation
    policyUrl: string;
    contactEmail: string;
    licenseSpdx: string;
}

export interface GeoLintIssue {
    id: string;
    ruleCode:
    | 'MISSING_OR_MULTIPLE_H1'
    | 'MISSING_OR_LONG_BLOCKQUOTE'
    | 'EMPTY_SECTIONS_OR_LINKS'
    | 'RELATIVE_URL_IN_LLMS_TXT'
    | 'DUPLICATE_LINK_URL'
    | 'MARKETING_FLUFF_DESCRIPTION'
    | 'VAGUE_LINK_TITLE'
    | 'MISSING_OPTIONAL_SECTION_FOR_LARGE_INDEX'
    | 'ROBOTS_BLOCKS_AI_SEARCH_CITATIONS'
    | 'ROBOTS_BLOCKS_LLMS_TXT_PATH'
    | 'RFC9309_SPECIFIC_GROUP_INHERITANCE_LEAK'
    | 'DEPRECATED_BOT_USER_AGENT';
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    targetFile: 'llms.txt' | 'llms-full.txt' | 'robots.txt' | 'cross-file';
    title: string;
    explanation: string;
    remediation: string;
    autoFixable: boolean;
}

export interface ModelTokenWindowStat {
    modelName: string;
    provider: string;
    contextWindowTokens: number;
    llmsTxtPercentOfContext: number;
    llmsFullTxtPercentOfContext: number;
    fitsComfortably: boolean;
    estimatedCostPer1000ReadsUsd: number;
}

export interface TokenBudgetReport {
    llmsTxtChars: number;
    llmsTxtBytes: number;
    llmsTxtWords: number;
    llmsTxtTokens: number;
    optionalSectionTokens: number;
    optionalSectionPercent: number;
    llmsFullTxtChars: number;
    llmsFullTxtBytes: number;
    llmsFullTxtWords: number;
    llmsFullTxtTokens: number;
    llmsCtxTxtTokens: number;
    sectionBreakdown: {
        sectionName: string;
        linkCount: number;
        tokens: number;
        isOptionalSection: boolean;
    }[];
    modelComparisons: ModelTokenWindowStat[];
}

export interface GeoWorkspaceState {
    projectName: string;
    siteUrl: string;
    summaryBlockquote: string;
    overviewParagraphs: string[];
    sitemapUrl: string;
    activePreset: GeoPresetId;
    links: LlmsLinkItem[];
    globalDisallowPaths: string[];
    globalAllowPaths: string[];
    enforceRfc9309InheritanceGuard: boolean;
    explicitlyAllowLlmsTxtInRobots: boolean;
    crawlDelaySeconds: number | null;
    bots: AiCrawlerBotRule[];
    ietfContentUsage: IetfContentUsageConfig;
    w3cTdmRep: W3cTdmRepConfig;
    deprecatedTokensDetected: string[];
}

export interface GeoCompiledDeliverables {
    llmsTxt: string;
    llmsFullTxt: string;
    llmsCtxTxt: string;
    robotsTxt: string;
    aiTxt: string;
    tdmRepJson: string;
    nextJsRoutesTs: string;
    edgeHeadersConfig: string;
    markdownImplementationGuide: string;
    complianceCertificateJson: string;
    tokenBudget: TokenBudgetReport;
    lintIssues: GeoLintIssue[];
    healthScore: number;
    llmsTxtSha256: string;
    robotsTxtSha256: string;
}

export const LLMS_ENGINE_VERSION = '2.0';
export const MAX_SITEMAP_URLS = 5_000;

const textEncoder = new TextEncoder();

// ============================================================================
// 1. PURE-TYPESCRIPT SHA-256, CRC32 & CWE-1236 FORMULA INJECTION GUARD
// ============================================================================

const SHA256_K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

export function computeSha256Hex(input: Uint8Array | string): string {
    const bytes = typeof input === 'string' ? textEncoder.encode(input) : input;
    const rotr = (n: number, x: number) => (x >>> n) | (x << (32 - n));
    let h0 = 0x6a09e667;
    let h1 = 0xbb67ae85;
    let h2 = 0x3c6ef372;
    let h3 = 0xa54ff53a;
    let h4 = 0x510e527f;
    let h5 = 0x9b05688c;
    let h6 = 0x1f83d9ab;
    let h7 = 0x5be0cd19;

    const len = bytes.length;
    const bitLenHi = Math.floor((len * 8) / 0x100000000);
    const bitLenLo = (len * 8) >>> 0;
    const paddedLen = ((len + 9 + 63) & ~63);
    const padded = new Uint8Array(paddedLen);
    padded.set(bytes);
    padded[len] = 0x80;
    const dv = new DataView(padded.buffer);
    dv.setUint32(paddedLen - 8, bitLenHi, false);
    dv.setUint32(paddedLen - 4, bitLenLo, false);

    const w = new Uint32Array(64);
    for (let offset = 0; offset < paddedLen; offset += 64) {
        for (let i = 0; i < 16; i++) {
            w[i] = dv.getUint32(offset + i * 4, false);
        }
        for (let i = 16; i < 64; i++) {
            const s0 = rotr(7, w[i - 15]) ^ rotr(18, w[i - 15]) ^ (w[i - 15] >>> 3);
            const s1 = rotr(17, w[i - 2]) ^ rotr(19, w[i - 2]) ^ (w[i - 2] >>> 10);
            w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
        }

        let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
        for (let i = 0; i < 64; i++) {
            const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
            const ch = (e & f) ^ (~e & g);
            const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
            const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const temp2 = (S0 + maj) >>> 0;

            h = g;
            g = f;
            f = e;
            e = (d + temp1) >>> 0;
            d = c;
            c = b;
            b = a;
            a = (temp1 + temp2) >>> 0;
        }

        h0 = (h0 + a) >>> 0;
        h1 = (h1 + b) >>> 0;
        h2 = (h2 + c) >>> 0;
        h3 = (h3 + d) >>> 0;
        h4 = (h4 + e) >>> 0;
        h5 = (h5 + f) >>> 0;
        h6 = (h6 + g) >>> 0;
        h7 = (h7 + h) >>> 0;
    }

    return [h0, h1, h2, h3, h4, h5, h6, h7]
        .map((v) => v.toString(16).padStart(8, '0'))
        .join('');
}

export function computeCrc32(bytes: Uint8Array): number {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
        crc ^= bytes[i];
        for (let j = 0; j < 8; j++) {
            crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
        }
    }
    return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Neutralizes CWE-1236 CSV/Excel Formula Injection vectors while preserving negative numbers.
 */
export function sanitizeSpreadsheetFormula(val: unknown, sanitize = true): string {
    if (val === null || val === undefined) return '';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    if (!sanitize || !str) return str;
    if (/^[\t\r\n]/.test(str) || /^[\s\u0000-\u001F]*[=+@\uFF1D\uFF0B\uFF20]/.test(str)) {
        return `'${str}`;
    }
    if (/^[\s\u0000-\u001F]*[-–—\uFF0D](?!\s*\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\s*$)/.test(str)) {
        return `'${str}`;
    }
    return str;
}

// ============================================================================
// 2. 45-BOT VERIFIED 2026 AI CRAWLER DIRECTORY (5 TAXONOMIC ROLES)
// ============================================================================

export function getDefaultAiCrawlerBots(): AiCrawlerBotRule[] {
    const rawBots: Omit<AiCrawlerBotRule, 'customAllowPaths' | 'customDisallowPaths'>[] = [
        // --- ROLE 1: AI SEARCH & LIVE CITATION BOTS (11 BOTS) ---
        {
            id: 'oai_searchbot',
            userAgent: 'OAI-SearchBot',
            operator: 'OpenAI',
            role: 'AI_SEARCH_CITATION',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'https://openai.com/searchbot.json',
            permission: 'ALLOW',
            description: 'Indexes and surfaces websites as clickable source citations inside ChatGPT Search.',
            geoImpactNote: 'Keep ALLOWED to rank and receive referral traffic from ChatGPT Search answers.',
        },
        {
            id: 'claude_searchbot',
            userAgent: 'Claude-SearchBot',
            operator: 'Anthropic',
            role: 'AI_SEARCH_CITATION',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'Anthropic Published IP CIDR',
            permission: 'ALLOW',
            description: 'Indexes web pages to ground and cite live search answers in Claude.',
            geoImpactNote: 'Keep ALLOWED so Claude can cite your documentation and articles in search mode.',
        },
        {
            id: 'perplexitybot',
            userAgent: 'PerplexityBot',
            operator: 'Perplexity AI',
            role: 'AI_SEARCH_CITATION',
            respectsRobotsTxt: 'DOCUMENTED_YES_OBSERVED_MIXED',
            publishedIpRanges: 'https://www.perplexity.ai/perplexitybot.json',
            permission: 'ALLOW',
            description: 'Perplexity answer engine crawler that indexes pages for real-time cited answers.',
            geoImpactNote: 'Keep ALLOWED to appear in Perplexity numbered source citations (does not train foundation models).',
        },
        {
            id: 'duckassistbot',
            userAgent: 'DuckAssistBot',
            operator: 'DuckDuckGo',
            role: 'AI_SEARCH_CITATION',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'DuckDuckGo Published IPs',
            permission: 'ALLOW',
            description: 'Retrieves web sources for DuckDuckGo DuckAssist instant AI answers.',
            geoImpactNote: 'Keep ALLOWED for privacy-focused AI search citations.',
        },
        {
            id: 'amzn_searchbot',
            userAgent: 'Amzn-SearchBot',
            operator: 'Amazon',
            role: 'AI_SEARCH_CITATION',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'Amazon AWS Crawler CIDR',
            permission: 'ALLOW',
            description: 'Amazon AI search and shopping assistant discovery crawler.',
            geoImpactNote: 'Keep ALLOWED for e-commerce and product discovery visibility.',
        },
        {
            id: 'youbot',
            userAgent: 'YouBot',
            operator: 'You.com',
            role: 'AI_SEARCH_CITATION',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'You.com Crawler IPs',
            permission: 'ALLOW',
            description: 'Indexes web pages for You.com AI search engine citations.',
            geoImpactNote: 'Keep ALLOWED for developer and research search visibility on You.com.',
        },
        {
            id: 'phindbot',
            userAgent: 'PhindBot',
            operator: 'Phind',
            role: 'AI_SEARCH_CITATION',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'Phind Search Nodes',
            permission: 'ALLOW',
            description: 'Developer-focused AI answer engine crawler for technical documentation and code.',
            geoImpactNote: 'Essential for developer tools, SDKs, and technical blogs.',
        },
        {
            id: 'google_cloudvertexbot',
            userAgent: 'Google-CloudVertexBot',
            operator: 'Google Cloud',
            role: 'AI_SEARCH_CITATION',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'https://developers.google.com/search/apis/ipranges/googlebot.json',
            permission: 'ALLOW',
            description: 'Crawls public sites for enterprise Vertex AI Search and grounding indexes.',
            geoImpactNote: 'Keep ALLOWED if enterprise customers ground Vertex AI agents on your public docs.',
        },
        {
            id: 'googlebot',
            userAgent: 'Googlebot',
            operator: 'Google',
            role: 'AI_SEARCH_CITATION',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'https://developers.google.com/search/apis/ipranges/googlebot.json',
            permission: 'ALLOW',
            description: 'Primary Google Search & Google AI Overviews (AIO) web indexer.',
            geoImpactNote: 'NEVER block Googlebot if you want organic Google Search rankings; use Google-Extended to opt out of Gemini training.',
        },
        {
            id: 'bingbot',
            userAgent: 'bingbot',
            operator: 'Microsoft',
            role: 'AI_SEARCH_CITATION',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'https://www.bing.com/toolbox/bingbot.json',
            permission: 'ALLOW',
            description: 'Primary Microsoft Bing & Microsoft Copilot search grounding crawler.',
            geoImpactNote: 'Keep ALLOWED—powers Bing Search, Microsoft Copilot citations, and syndicated search indexes.',
        },
        {
            id: 'applebot',
            userAgent: 'Applebot',
            operator: 'Apple',
            role: 'AI_SEARCH_CITATION',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'https://search.developer.apple.com/applebot.json',
            permission: 'ALLOW',
            description: 'Primary Apple Spotlight, Siri, and Safari search suggestions crawler.',
            geoImpactNote: 'Keep ALLOWED for Siri/Spotlight search; use Applebot-Extended to opt out of Apple Intelligence training.',
        },

        // --- ROLE 2: USER-TRIGGERED LIVE FETCHERS / ASSISTANTS (6 BOTS) ---
        {
            id: 'chatgpt_user',
            userAgent: 'ChatGPT-User',
            operator: 'OpenAI',
            role: 'USER_TRIGGERED_FETCHER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'https://openai.com/chatgpt-user.json',
            permission: 'ALLOW',
            description: 'Fetches a specific URL or /llms.txt in real time when a human user asks ChatGPT to read a link.',
            geoImpactNote: 'Keep ALLOWED so users can paste your documentation or product links into ChatGPT.',
        },
        {
            id: 'claude_user',
            userAgent: 'Claude-User',
            operator: 'Anthropic',
            role: 'USER_TRIGGERED_FETCHER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'Anthropic Published IP CIDR',
            permission: 'ALLOW',
            description: 'Dispatched when a Claude user explicitly asks Claude to fetch or summarize a web page.',
            geoImpactNote: 'Keep ALLOWED so developers can point Claude directly to your /llms.txt or /llms-full.txt.',
        },
        {
            id: 'perplexity_user',
            userAgent: 'Perplexity-User',
            operator: 'Perplexity AI',
            role: 'USER_TRIGGERED_FETCHER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'https://www.perplexity.ai/perplexity-user.json',
            permission: 'ALLOW',
            description: 'Fetches a URL on-demand when a Perplexity user attaches a specific page link to a prompt.',
            geoImpactNote: 'Keep ALLOWED for interactive user-initiated research.',
        },
        {
            id: 'mistralai_user',
            userAgent: 'MistralAI-User',
            operator: 'Mistral AI',
            role: 'USER_TRIGGERED_FETCHER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'Mistral Le Chat Egress IPs',
            permission: 'ALLOW',
            description: 'Fetches live web pages when requested by a user inside Mistral Le Chat.',
            geoImpactNote: 'Keep ALLOWED for European AI assistant visibility.',
        },
        {
            id: 'meta_externalfetcher',
            userAgent: 'Meta-ExternalFetcher',
            operator: 'Meta',
            role: 'USER_TRIGGERED_FETCHER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'Meta Crawler ASN',
            permission: 'ALLOW',
            description: 'Dispatched by Meta AI when a user shares or asks about a specific URL.',
            geoImpactNote: 'Keep ALLOWED for live link previews and user-initiated queries.',
        },
        {
            id: 'google_read_aloud',
            userAgent: 'Google-Read-Aloud',
            operator: 'Google',
            role: 'USER_TRIGGERED_FETCHER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'Google Special Crawlers',
            permission: 'ALLOW',
            description: 'User-triggered Google Assistant text-to-speech and page reader service.',
            geoImpactNote: 'Keep ALLOWED for accessibility and voice assistant playback.',
        },

        // --- ROLE 3: USAGE OPT-OUT TOKENS (2 TOKENS) ---
        {
            id: 'google_extended',
            userAgent: 'Google-Extended',
            operator: 'Google',
            role: 'USAGE_OPT_OUT_TOKEN',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'Control Token (Uses Googlebot)',
            permission: 'BLOCK',
            description: 'Usage-control token that opts your content out of training Gemini foundation models without affecting Google Search.',
            geoImpactNote: 'Safe to BLOCK: stops Gemini model training while preserving 100% of Google Search & AI Overviews indexing.',
        },
        {
            id: 'applebot_extended',
            userAgent: 'Applebot-Extended',
            operator: 'Apple',
            role: 'USAGE_OPT_OUT_TOKEN',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'Control Token (Uses Applebot)',
            permission: 'BLOCK',
            description: 'Usage-control token that opts your content out of training Apple Intelligence foundation models without blocking Siri/Spotlight.',
            geoImpactNote: 'Safe to BLOCK: prevents Apple foundation model training while keeping Applebot search active.',
        },

        // --- ROLE 4: FOUNDATION MODEL TRAINING CRAWLERS (12 BOTS) ---
        {
            id: 'gptbot',
            userAgent: 'GPTBot',
            operator: 'OpenAI',
            role: 'MODEL_TRAINING_SCRAPER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'https://openai.com/gptbot.json',
            permission: 'BLOCK',
            description: 'OpenAI foundation model training data crawler (separate from OAI-SearchBot).',
            geoImpactNote: 'BLOCK if you want to prevent OpenAI from training future GPT models on your proprietary content while keeping OAI-SearchBot allowed.',
        },
        {
            id: 'claudebot',
            userAgent: 'ClaudeBot',
            operator: 'Anthropic',
            role: 'MODEL_TRAINING_SCRAPER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'Anthropic Training CIDR',
            permission: 'BLOCK',
            description: 'Anthropic foundation model training corpus crawler (replaces legacy Claude-Web / anthropic-ai).',
            geoImpactNote: 'BLOCK to opt out of Claude model training while keeping Claude-SearchBot and Claude-User allowed.',
        },
        {
            id: 'meta_externalagent',
            userAgent: 'Meta-ExternalAgent',
            operator: 'Meta',
            role: 'MODEL_TRAINING_SCRAPER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'Meta ASN 32934',
            permission: 'BLOCK',
            description: 'Crawls public web content to train Meta Llama foundation models.',
            geoImpactNote: 'BLOCK to opt out of Llama model training.',
        },
        {
            id: 'amazonbot',
            userAgent: 'Amazonbot',
            operator: 'Amazon',
            role: 'MODEL_TRAINING_SCRAPER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'Amazonbot Published CIDR',
            permission: 'BLOCK',
            description: 'Amazon web crawler used for Alexa knowledge extraction and Nova/Titan AI training.',
            geoImpactNote: 'BLOCK if you do not want content ingested into Amazon training pipelines.',
        },
        {
            id: 'cohere_ai',
            userAgent: 'Cohere-ai',
            operator: 'Cohere',
            role: 'MODEL_TRAINING_SCRAPER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'Cohere Cloud IPs',
            permission: 'BLOCK',
            description: 'Crawls websites for Cohere Command enterprise LLM training.',
            geoImpactNote: 'BLOCK to opt out of Cohere training datasets.',
        },
        {
            id: 'cohere_training_crawler',
            userAgent: 'cohere-training-data-crawler',
            operator: 'Cohere',
            role: 'MODEL_TRAINING_SCRAPER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'Cohere Cloud IPs',
            permission: 'BLOCK',
            description: 'Explicit Cohere corpus training data harvester.',
            geoImpactNote: 'BLOCK alongside Cohere-ai to prevent training ingestion.',
        },
        {
            id: 'deepseekbot',
            userAgent: 'DeepSeekBot',
            operator: 'DeepSeek',
            role: 'MODEL_TRAINING_SCRAPER',
            respectsRobotsTxt: 'PARTIAL',
            publishedIpRanges: 'Unpublished',
            permission: 'BLOCK',
            description: 'Crawls technical and general web text for DeepSeek model pre-training.',
            geoImpactNote: 'BLOCK to disallow DeepSeek training scrapes.',
        },
        {
            id: 'grokbot',
            userAgent: 'GrokBot',
            operator: 'xAI',
            role: 'MODEL_TRAINING_SCRAPER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'xAI Crawler Nodes',
            permission: 'BLOCK',
            description: 'xAI web crawler for Grok foundation model training and knowledge ingestion.',
            geoImpactNote: 'BLOCK if opting out of xAI Grok training.',
        },
        {
            id: 'xai_bot',
            userAgent: 'xAI-Bot',
            operator: 'xAI',
            role: 'MODEL_TRAINING_SCRAPER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'xAI Crawler Nodes',
            permission: 'BLOCK',
            description: 'Secondary xAI user-agent token for Grok data collection.',
            geoImpactNote: 'BLOCK alongside GrokBot for complete xAI training opt-out.',
        },
        {
            id: 'pangubot',
            userAgent: 'PanguBot',
            operator: 'Huawei',
            role: 'MODEL_TRAINING_SCRAPER',
            respectsRobotsTxt: 'PARTIAL',
            publishedIpRanges: 'Unpublished',
            permission: 'BLOCK',
            description: 'Crawls multilingual web data for Huawei Pangu LLM pre-training.',
            geoImpactNote: 'BLOCK to reduce uncompensated training bandwidth.',
        },
        {
            id: 'ai2bot',
            userAgent: 'AI2Bot',
            operator: 'Allen Institute for AI',
            role: 'MODEL_TRAINING_SCRAPER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'https://allenai.org/crawler',
            permission: 'BLOCK',
            description: 'Collects open-weights OLMo and Dolma LLM training datasets.',
            geoImpactNote: 'BLOCK if you do not want your content bundled into public open-weights training corpora.',
        },
        {
            id: 'ai2bot_dolma',
            userAgent: 'Ai2Bot-Dolma',
            operator: 'Allen Institute for AI',
            role: 'MODEL_TRAINING_SCRAPER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'https://allenai.org/crawler',
            permission: 'BLOCK',
            description: 'Dedicated Dolma dataset crawler operated by AllenAI.',
            geoImpactNote: 'BLOCK alongside AI2Bot to opt out of Dolma corpus inclusion.',
        },

        // --- ROLE 5: AGGRESSIVE BULK DATASET SCRAPERS & ARCHIVERS (14 BOTS) ---
        {
            id: 'ccbot',
            userAgent: 'CCBot',
            operator: 'Common Crawl',
            role: 'BULK_DATASET_SCRAPER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'AWS Common Crawl Nodes',
            permission: 'BLOCK',
            description: 'Builds open petabyte-scale web archives used as raw training data by hundreds of third-party LLMs.',
            geoImpactNote: 'BLOCK if you want to prevent your site from entering open-source Common Crawl training dumps.',
        },
        {
            id: 'bytespider',
            userAgent: 'Bytespider',
            operator: 'ByteDance',
            role: 'BULK_DATASET_SCRAPER',
            respectsRobotsTxt: 'DOCUMENTED_YES_OBSERVED_MIXED',
            publishedIpRanges: 'ByteDance ASN',
            permission: 'BLOCK',
            description: 'High-frequency ByteDance scraper for Doubao and TikTok LLM training.',
            geoImpactNote: 'BLOCK in robots.txt and edge WAF to prevent high-volume server bandwidth drain.',
        },
        {
            id: 'diffbot',
            userAgent: 'Diffbot',
            operator: 'Diffbot',
            role: 'BULK_DATASET_SCRAPER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'Diffbot Cloud Nodes',
            permission: 'BLOCK',
            description: 'Commercial knowledge-graph and structured web data extraction crawler.',
            geoImpactNote: 'BLOCK to prevent commercial resale of your structured page data.',
        },
        {
            id: 'imagesiftbot',
            userAgent: 'ImagesiftBot',
            operator: 'Hive AI',
            role: 'BULK_DATASET_SCRAPER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'Hive Crawler IPs',
            permission: 'BLOCK',
            description: 'Scrapes web images to train visual generative AI and moderation models.',
            geoImpactNote: 'BLOCK to protect original photography, illustrations, and product imagery.',
        },
        {
            id: 'omgili',
            userAgent: 'omgili',
            operator: 'Webz.io',
            role: 'BULK_DATASET_SCRAPER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'Webz.io Harvesters',
            permission: 'BLOCK',
            description: 'Commercial data broker that sells scraped web feeds for LLM training.',
            geoImpactNote: 'BLOCK to prevent third-party commercial dataset syndication.',
        },
        {
            id: 'omgilibot',
            userAgent: 'omgilibot',
            operator: 'Webz.io',
            role: 'BULK_DATASET_SCRAPER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'Webz.io Harvesters',
            permission: 'BLOCK',
            description: 'Secondary Webz.io commercial crawler user-agent.',
            geoImpactNote: 'BLOCK alongside omgili.',
        },
        {
            id: 'petalbot',
            userAgent: 'PetalBot',
            operator: 'Huawei / Aspiegel',
            role: 'BULK_DATASET_SCRAPER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'Aspiegel CIDR',
            permission: 'BLOCK',
            description: 'High-volume crawler for Petal Search and regional AI dataset collection.',
            geoImpactNote: 'BLOCK unless targeting Huawei Petal Search.',
        },
        {
            id: 'timpibot',
            userAgent: 'TimpiBot',
            operator: 'Timpi',
            role: 'BULK_DATASET_SCRAPER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'Decentralized Nodes',
            permission: 'BLOCK',
            description: 'Decentralized web index and data-scraping network.',
            geoImpactNote: 'BLOCK to reduce non-converting bot crawl load.',
        },
        {
            id: 'velen_crawler',
            userAgent: 'VelenPublicWebCrawler',
            operator: 'Velen',
            role: 'BULK_DATASET_SCRAPER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'Velen Nodes',
            permission: 'BLOCK',
            description: 'Bulk public web dataset harvester for commercial ML pipelines.',
            geoImpactNote: 'BLOCK to prevent bulk text harvesting.',
        },
        {
            id: 'kangaroo_bot',
            userAgent: 'Kangaroo Bot',
            operator: 'Kangaroo LLM',
            role: 'BULK_DATASET_SCRAPER',
            respectsRobotsTxt: 'PARTIAL',
            publishedIpRanges: 'Unpublished',
            permission: 'BLOCK',
            description: 'Bulk AI dataset scraper targeting English and Asia-Pacific websites.',
            geoImpactNote: 'BLOCK to prevent unattributed scraping.',
        },
        {
            id: 'scrapy',
            userAgent: 'Scrapy',
            operator: 'Generic Python Scrapy',
            role: 'BULK_DATASET_SCRAPER',
            respectsRobotsTxt: 'PARTIAL',
            publishedIpRanges: 'Any Cloud IP',
            permission: 'BLOCK',
            description: 'Default user-agent for automated Python Scrapy spiders.',
            geoImpactNote: 'BLOCK to stop polite default-configured Scrapy jobs.',
        },
        {
            id: 'img2dataset',
            userAgent: 'img2dataset',
            operator: 'LAION / Open-Source',
            role: 'BULK_DATASET_SCRAPER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'Any Cloud IP',
            permission: 'BLOCK',
            description: 'High-speed image downloader used to compile multimodal training sets.',
            geoImpactNote: 'BLOCK to prevent bulk image dataset harvesting.',
        },
        {
            id: 'friendlycrawler',
            userAgent: 'FriendlyCrawler',
            operator: 'Research / ML Scraper',
            role: 'BULK_DATASET_SCRAPER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'Unpublished',
            permission: 'BLOCK',
            description: 'Automated corpus collector for machine learning datasets.',
            geoImpactNote: 'BLOCK unless donating content to ML corpora.',
        },
        {
            id: 'icc_crawler',
            userAgent: 'ICC-Crawler',
            operator: 'NICT Japan',
            role: 'BULK_DATASET_SCRAPER',
            respectsRobotsTxt: 'YES',
            publishedIpRanges: 'NICT Academic CIDR',
            permission: 'BLOCK',
            description: 'Academic and institutional large-scale web archive crawler.',
            geoImpactNote: 'BLOCK if restricting non-search archival crawls.',
        },
    ];

    return rawBots.map((b) => ({
        ...b,
        customAllowPaths: [],
        customDisallowPaths: [],
    }));
}

// ============================================================================
// 3. 6 GEO & AI GOVERNANCE STRATEGY PRESETS
// ============================================================================

export function applyGeoPreset(
    preset: GeoPresetId,
    workspace: GeoWorkspaceState
): GeoWorkspaceState {
    const updatedBots = workspace.bots.map((b) => {
        const copy = { ...b };
        if (preset === 'geo_max_visibility') {
            copy.permission =
                b.role === 'AI_SEARCH_CITATION' || b.role === 'USER_TRIGGERED_FETCHER'
                    ? 'ALLOW'
                    : 'BLOCK';
        } else if (preset === 'open_source_max_reach') {
            copy.permission = b.role === 'BULK_DATASET_SCRAPER' ? 'BLOCK' : 'ALLOW';
        } else if (preset === 'strict_copyright_shield') {
            copy.permission =
                b.role === 'USER_TRIGGERED_FETCHER' ||
                    b.userAgent === 'Googlebot' ||
                    b.userAgent === 'bingbot' ||
                    b.userAgent === 'OAI-SearchBot' ||
                    b.userAgent === 'Claude-SearchBot' ||
                    b.userAgent === 'PerplexityBot'
                    ? 'ALLOW'
                    : 'BLOCK';
        } else if (preset === 'total_ai_lockdown') {
            copy.permission =
                b.userAgent === 'Googlebot' || b.userAgent === 'bingbot' || b.userAgent === 'Applebot'
                    ? 'ALLOW'
                    : 'BLOCK';
        } else if (preset === 'ecommerce_saas_funnel_guard') {
            copy.permission =
                b.role === 'AI_SEARCH_CITATION' || b.role === 'USER_TRIGGERED_FETCHER'
                    ? 'ALLOW'
                    : 'BLOCK';
        } else if (preset === 'eu_dsm_ietf_compliance') {
            copy.permission =
                b.role === 'AI_SEARCH_CITATION' || b.role === 'USER_TRIGGERED_FETCHER'
                    ? 'ALLOW'
                    : 'BLOCK';
        }
        return copy;
    });

    const nextDisallow =
        preset === 'ecommerce_saas_funnel_guard'
            ? Array.from(new Set([...workspace.globalDisallowPaths, '/admin/', '/api/private/', '/checkout/', '/cart/', '/account/']))
            : workspace.globalDisallowPaths.length > 0
                ? workspace.globalDisallowPaths
                : ['/admin/', '/api/private/'];

    const ietfContentUsage: IetfContentUsageConfig = {
        enabled: true,
        allowAiTraining: preset === 'open_source_max_reach',
        allowAiInference: preset !== 'total_ai_lockdown',
        allowSearchIndexing: true,
        disallowPathsForTraining: ['/'],
    };

    const w3cTdmRep: W3cTdmRepConfig = {
        ...workspace.w3cTdmRep,
        enabled: true,
        reservation: preset === 'open_source_max_reach' ? 0 : 1,
    };

    return {
        ...workspace,
        activePreset: preset,
        bots: updatedBots,
        globalDisallowPaths: nextDisallow,
        enforceRfc9309InheritanceGuard: true,
        explicitlyAllowLlmsTxtInRobots: preset !== 'total_ai_lockdown',
        ietfContentUsage,
        w3cTdmRep,
    };
}

// ============================================================================
// 4. SITEMAP XML, HTML-TO-MARKDOWN & EXISTING LLMS.TXT / ROBOTS.TXT PARSERS
// ============================================================================

export function classifyUrlIntoLlmsSection(url: string): LlmsSectionCategory {
    // Strip protocol + hostname so subdomains like "https://docs.example.com/pricing" do not false-match "/docs"
    const pathOnly = url.replace(/^https?:\/\/[^/]+/i, '').toLowerCase();
    if (/\/(privacy|terms|legal|security|compliance|changelog|release-notes|careers|press|status)\b/.test(pathOnly)) {
        return 'Optional';
    }
    if (/\/(api|sdk|reference|graphql|openapi|swagger|endpoints|webhook|cli)\b/.test(pathOnly)) {
        return 'API & SDK Reference';
    }
    if (/\/(blog|guides|tutorials|learn|articles|case-studies|examples|cookbook|how-to)\b/.test(pathOnly)) {
        return 'Guides & Tutorials';
    }
    if (/\/(pricing|products|features|solutions|enterprise|plans|store|catalog|tools)\b/.test(pathOnly)) {
        return 'Product & Pricing';
    }
    if (/\/(about|company|contact|team)\b/.test(pathOnly)) {
        return 'Company & Policies';
    }
    if (/\/(docs|documentation|getting-started|quickstart|install|architecture|concepts|manual)\b/.test(pathOnly)) {
        return 'Core Documentation';
    }
    return 'Core Documentation';
}

export function humanizeUrlSlugToTitleAndDescription(
    rawUrl: string,
    siteName = 'Documentation'
): { title: string; description: string; section: LlmsSectionCategory } {
    let pathname = '/';
    try {
        const u = new URL(rawUrl);
        pathname = u.pathname || '/';
    } catch {
        pathname = rawUrl.replace(/^https?:\/\/[^/]+/i, '') || '/';
    }

    const section = classifyUrlIntoLlmsSection(rawUrl);
    const segments = pathname
        .split('/')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.replace(/\.(html?|mdx?|php|aspx)$/i, ''));

    if (segments.length === 0) {
        return {
            title: `${siteName} Overview & Home`,
            description: `Primary entry point, architecture overview, and core capabilities of ${siteName}.`,
            section: 'Core Documentation',
        };
    }

    const lastSeg = segments[segments.length - 1];
    const words = lastSeg
        .split(/[-_]+/)
        .filter(Boolean)
        .map((w) => {
            const upperAcronyms = new Set(['api', 'sdk', 'cli', 'sso', 'saml', 'jwt', 'oauth', 'sql', 'csv', 'pdf', 'har', 'json', 'xml', 'html', 'css', 'llm', 'llms', 'ai', 'seo', 'geo', 'faq', 'rbac', ' webhooks']);
            if (upperAcronyms.has(w.toLowerCase())) return w.toUpperCase();
            return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        });

    const title = words.join(' ') || 'Documentation Page';
    const contextPath = segments.length > 1 ? segments.slice(0, -1).join(' / ') : section;
    const description = `Technical reference and implementation details for ${title} under ${contextPath}.`;

    return { title, description, section };
}

export function parseSitemapXmlOrUrlList(
    rawInput: string,
    baseSiteUrl = 'https://example.com',
    siteName = 'Platform'
): LlmsLinkItem[] {
    const cleanBase = baseSiteUrl.replace(/\/+$/, '');
    const results: LlmsLinkItem[] = [];
    const seenUrls = new Set<string>();

    const isNoiseAssetOrAdminUrl = (u: string): boolean => {
        const cleanPath = u.split('?')[0].split('#')[0].toLowerCase();
        if (/\.(png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|eot|otf|css|js|mjs|map|mp4|webm|mp3|wav|zip|tar|gz|dmg|exe)$/i.test(cleanPath)) {
            return true;
        }
        if (/\/(wp-admin|wp-login\.php|xmlrpc\.php|cdn-cgi|_next\/static)\b/i.test(cleanPath)) {
            return true;
        }
        return false;
    };

    const registerUrl = (rawLoc: string, customTitle?: string, customDesc?: string, lastMod?: string, priorityNum?: number) => {
        let url = rawLoc.trim();
        if (!url) return;
        if (url.startsWith('/')) {
            url = `${cleanBase}${url}`;
        } else if (!/^https?:\/\//i.test(url)) {
            url = `https://${url}`;
        }
        if (isNoiseAssetOrAdminUrl(url)) return;
        if (seenUrls.has(url) || results.length >= MAX_SITEMAP_URLS) return;
        seenUrls.add(url);

        const inferred = humanizeUrlSlugToTitleAndDescription(url, siteName);
        const title = customTitle?.trim() || inferred.title;
        const description = customDesc?.trim() || inferred.description;
        const section = inferred.section;

        results.push({
            id: `link_${results.length + 1}`,
            title,
            url,
            description,
            section,
            includedInLlmsTxt: true,
            includedInFullTxt: section !== 'Optional',
            fullMarkdownContent: `## ${title}\n\nSource URL: ${url}\n\n${description}`,
            priorityScore: typeof priorityNum === 'number' && !Number.isNaN(priorityNum) ? priorityNum : section === 'Optional' ? 0.3 : 0.8,
            lastModified: lastMod,
        });
    };

    // 1. Check if XML Sitemap (<url> or <sitemap> or RSS <item>)
    if (/<(?:url|sitemap|item|entry)\b/i.test(rawInput)) {
        const urlBlocks = rawInput.match(/<(?:url|sitemap|item|entry)\b[\s\S]*?<\/(?:url|sitemap|item|entry)>/gi) || [];
        for (const block of urlBlocks) {
            const locMatch = block.match(/<(?:loc|link)>([\s\S]*?)<\/(?:loc|link)>/i) || block.match(/<link\b[^>]*href=["']([^"']+)["']/i);
            if (!locMatch) continue;
            const loc = locMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
            const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/i);
            const descMatch = block.match(/<(?:description|summary|content)\b[^>]*>([\s\S]*?)<\/(?:description|summary|content)>/i);
            const lastModMatch = block.match(/<(?:lastmod|updated|pubDate)>([\s\S]*?)<\/(?:lastmod|updated|pubDate)>/i);
            const prioMatch = block.match(/<priority>([\s\S]*?)<\/priority>/i);

            const cleanTitle = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : undefined;
            const cleanDesc = descMatch ? descMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').trim() : undefined;
            const lastMod = lastModMatch ? lastModMatch[1].trim() : undefined;
            const prio = prioMatch ? parseFloat(prioMatch[1].trim()) : undefined;

            registerUrl(loc, cleanTitle, cleanDesc, lastMod, prio);
        }
        if (results.length > 0) return results;
    }

    // 2. Otherwise parse as Markdown links or newline-separated URLs
    const lines = rawInput.split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('>')) continue;

        // Check Markdown list item: - [Title](URL): Description
        const mdMatch = trimmed.match(/^(?:[-*+]|\d+\.)\s+\[([^\]]+)\]\(([^)]+)\)(?:\s*:\s*(.*))?$/);
        if (mdMatch) {
            registerUrl(mdMatch[2], mdMatch[1], mdMatch[3]);
            continue;
        }

        // Check bare URL on the line
        const urlMatch = trimmed.match(/(https?:\/\/[^\s,;"'<>]+|^\/[A-Za-z0-9_./-]+)/i);
        if (urlMatch) {
            registerUrl(urlMatch[1]);
        }
    }

    return results;
}

/**
 * Strips HTML boilerplate (<nav>, <script>, <style>, <footer>, <svg>) and converts semantic HTML into clean LLM-ready Markdown.
 */
export function convertHtmlToCleanMarkdown(
    rawHtml: string,
    pageUrl = 'https://example.com/docs'
): LlmsFullPageItem {
    const decodeEntities = (str: string): string =>
        str
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;|&apos;/gi, "'");

    const titleMatch = rawHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const h1Match = rawHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const metaDescMatch =
        rawHtml.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
        rawHtml.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    const canonicalMatch = rawHtml.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);

    const effectiveUrl = canonicalMatch ? canonicalMatch[1].trim() : pageUrl;
    const inferred = humanizeUrlSlugToTitleAndDescription(effectiveUrl);

    const stripTags = (s: string) => decodeEntities(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());

    const title = h1Match
        ? stripTags(h1Match[1])
        : titleMatch
            ? stripTags(titleMatch[1]).split(/[|\-—]/)[0].trim()
            : inferred.title;

    const description = metaDescMatch ? decodeEntities(metaDescMatch[1].trim()) : inferred.description;

    // Remove non-content boilerplate blocks
    let body = rawHtml
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<(?:script|style|noscript|svg|iframe|canvas|nav|footer|header|aside|form)\b[^>]*>[\s\S]*?<\/(?:script|style|noscript|svg|iframe|canvas|nav|footer|header|aside|form)>/gi, '\n');

    // Extract <main> or <article> if present
    const mainMatch = body.match(/<(?:main|article)\b[^>]*>([\s\S]*?)<\/(?:main|article)>/i);
    if (mainMatch) {
        body = mainMatch[1];
    }

    // Extract and protect <pre><code>...</code></pre> blocks so indentation & language tags are 100% preserved
    const codeBlockVault: string[] = [];
    body = body.replace(/<pre[^>]*>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi, (_m, codeAttrs, codeInner) => {
        const langMatch = String(codeAttrs || '').match(/(?:language-|lang-)([a-z0-9_+-]+)/i);
        const lang = langMatch ? langMatch[1].toLowerCase() : '';
        const cleanCode = decodeEntities(String(codeInner).replace(/<[^>]+>/g, '').replace(/^\n+|\n+$/g, ''));
        const idx = codeBlockVault.length;
        codeBlockVault.push(`\`\`\`${lang}\n${cleanCode}\n\`\`\``);
        return `\n\n@@CODE_BLOCK_${idx}@@\n\n`;
    });

    // Convert HTML <table>...</table> into GitHub-Flavored Markdown (GFM) pipe tables
    body = body.replace(/<table\b[^>]*>([\s\S]*?)<\/table>/gi, (_m, tableInner) => {
        const trMatches = String(tableInner).match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || [];
        const matrix: string[][] = [];
        for (const tr of trMatches) {
            const cells = tr.match(/<(?:th|td)\b[^>]*>([\s\S]*?)<\/(?:th|td)>/gi) || [];
            const row = cells.map((c) => stripTags(c).replace(/\|/g, '\\|'));
            if (row.length > 0) matrix.push(row);
        }
        if (matrix.length === 0) return '';
        const colCount = Math.max(...matrix.map((r) => r.length));
        const padRow = (r: string[]) => Array.from({ length: colCount }, (_, i) => r[i] || '');
        const headerRow = padRow(matrix[0]);
        const dividerRow = headerRow.map(() => '---');
        const bodyRows = matrix.slice(1).map(padRow);
        const mdTable = [
            `| ${headerRow.join(' | ')} |`,
            `| ${dividerRow.join(' | ')} |`,
            ...bodyRows.map((r) => `| ${r.join(' | ')} |`),
        ].join('\n');
        return `\n\n${mdTable}\n\n`;
    });

    // Convert inline <code>
    body = body.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_m, inner) => `\`${stripTags(String(inner))}\``);

    // Convert headings <h1>..<h4>
    body = body.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_m, inner) => `\n\n# ${stripTags(String(inner))}\n\n`);
    body = body.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_m, inner) => `\n\n## ${stripTags(String(inner))}\n\n`);
    body = body.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_m, inner) => `\n\n### ${stripTags(String(inner))}\n\n`);
    body = body.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_m, inner) => `\n\n#### ${stripTags(String(inner))}\n\n`);

    // Convert links <a href="...">text</a> and resolve relative paths against effectiveUrl
    body = body.replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_m, href, text) => {
        const label = stripTags(String(text));
        if (!label) return '';
        let resolvedHref = String(href).trim();
        if (resolvedHref.startsWith('/')) {
            try {
                resolvedHref = new URL(resolvedHref, effectiveUrl).href;
            } catch {
                // Keep as-is if base URL is invalid
            }
        }
        return `[${label}](${resolvedHref})`;
    });

    // Convert bold / strong & italic / em
    body = body.replace(/<(?:strong|b)\b[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, (_m, inner) => `**${stripTags(String(inner))}**`);
    body = body.replace(/<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, (_m, inner) => `*${stripTags(String(inner))}*`);

    // Convert list items <li>
    body = body.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m, inner) => `\n- ${stripTags(String(inner))}`);

    // Convert paragraphs, divs, br
    body = body.replace(/<br\s*\/?>/gi, '\n');
    body = body.replace(/<\/(?:p|div|section|tr|blockquote)>/gi, '\n\n');

    // Strip remaining HTML tags and restore protected fenced code blocks
    let cleanMd = decodeEntities(body.replace(/<[^>]+>/g, ''))
        .split('\n')
        .map((line) => line.replace(/[ \t]+/g, ' ').trim())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    cleanMd = cleanMd.replace(/@@CODE_BLOCK_(\d+)@@/g, (_m, idxStr) => codeBlockVault[Number(idxStr)] || '');

    const finalMarkdown = cleanMd || `# ${title}\n\n${description}`;
    const words = finalMarkdown.split(/\s+/).filter(Boolean).length;
    const estimatedTokens = estimateTextTokens(finalMarkdown);

    return {
        id: `page_${computeSha256Hex(effectiveUrl).slice(0, 8)}`,
        title,
        url: effectiveUrl,
        description,
        markdownBody: finalMarkdown,
        wordCount: words,
        estimatedTokens,
    };
}

export function parseExistingLlmsTxt(rawMarkdown: string, fallbackSiteUrl = 'https://example.com'): {
    projectName: string;
    summaryBlockquote: string;
    overviewParagraphs: string[];
    links: LlmsLinkItem[];
} {
    const lines = rawMarkdown.replace(/^\uFEFF/, '').split(/\r?\n/);
    let projectName = '';
    const blockquoteLines: string[] = [];
    const overviewParagraphs: string[] = [];
    const links: LlmsLinkItem[] = [];
    let currentSection = 'Core Documentation';
    let seenH2 = false;

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;

        if (line.startsWith('# ') && !projectName) {
            projectName = line.slice(2).trim();
            continue;
        }

        if (line.startsWith('## ')) {
            currentSection = line.slice(3).trim() || 'Core Documentation';
            seenH2 = true;
            continue;
        }

        if (line.startsWith('>')) {
            blockquoteLines.push(line.replace(/^>\s*/, '').trim());
            continue;
        }

        const linkMatch = line.match(/^(?:[-*+]|\d+\.)\s+\[([^\]]+)\]\(([^)]+)\)(?:\s*:\s*(.*))?$/);
        if (linkMatch) {
            const title = linkMatch[1].trim();
            const url = linkMatch[2].trim();
            const desc = (linkMatch[3] || '').trim() || `Reference documentation for ${title}.`;
            links.push({
                id: `link_${links.length + 1}`,
                title,
                url,
                description: desc,
                section: currentSection,
                includedInLlmsTxt: true,
                includedInFullTxt: currentSection.toLowerCase() !== 'optional',
                fullMarkdownContent: `## ${title}\n\nSource URL: ${url}\n\n${desc}`,
                priorityScore: currentSection.toLowerCase() === 'optional' ? 0.3 : 0.8,
            });
            continue;
        }

        if (!seenH2 && !line.startsWith('#')) {
            overviewParagraphs.push(line);
        }
    }

    void fallbackSiteUrl;
    return {
        projectName: projectName || 'Untitled Project',
        summaryBlockquote: blockquoteLines.join(' '),
        overviewParagraphs,
        links,
    };
}

export function parseExistingRobotsTxt(
    rawRobots: string,
    currentBots: AiCrawlerBotRule[]
): {
    updatedBots: AiCrawlerBotRule[];
    globalDisallowPaths: string[];
    sitemapUrl: string | null;
    deprecatedTokensDetected: string[];
} {
    const lines = rawRobots.replace(/^\uFEFF/, '').split(/\r?\n/);
    const deprecatedSet = new Set<string>();
    const globalDisallows = new Set<string>();
    let sitemapUrl: string | null = null;

    const botPermissions = new Map<string, AiBotPermission>();
    let activeAgents: string[] = [];
    let lastLineWasAgent = false;

    for (const rawLine of lines) {
        const clean = rawLine.split('#')[0].trim();
        if (!clean) {
            activeAgents = [];
            lastLineWasAgent = false;
            continue;
        }

        const colonIdx = clean.indexOf(':');
        if (colonIdx <= 0) continue;
        const directive = clean.slice(0, colonIdx).trim().toLowerCase();
        const val = clean.slice(colonIdx + 1).trim();

        if (directive === 'user-agent') {
            if (!lastLineWasAgent) activeAgents = [];
            activeAgents.push(val);
            lastLineWasAgent = true;
            if (/^(anthropic-ai|claude-web|facebookbot|cohere-ai-bot)$/i.test(val)) {
                deprecatedSet.add(val);
            }
            continue;
        }

        lastLineWasAgent = false;

        if (directive === 'sitemap' && val) {
            sitemapUrl = val;
            continue;
        }

        if (directive === 'disallow') {
            for (const ag of activeAgents) {
                if (ag === '*') {
                    if (val && val !== '/') globalDisallows.add(val);
                } else {
                    if (val === '/') {
                        botPermissions.set(ag.toLowerCase(), 'BLOCK');
                    } else if (!val) {
                        botPermissions.set(ag.toLowerCase(), 'ALLOW');
                    }
                }
            }
        } else if (directive === 'allow') {
            for (const ag of activeAgents) {
                if (ag !== '*' && val === '/') {
                    botPermissions.set(ag.toLowerCase(), 'ALLOW');
                }
            }
        }
    }

    const updatedBots = currentBots.map((b) => {
        const matchedPerm = botPermissions.get(b.userAgent.toLowerCase());
        if (matchedPerm) {
            return { ...b, permission: matchedPerm };
        }
        return { ...b };
    });

    return {
        updatedBots,
        globalDisallowPaths: globalDisallows.size > 0 ? Array.from(globalDisallows) : ['/admin/', '/api/private/'],
        sitemapUrl,
        deprecatedTokensDetected: Array.from(deprecatedSet),
    };
}

// ============================================================================
// 5. MULTI-MODEL BPE TOKEN BUDGET & CONTEXT WINDOW CALCULATOR
// ============================================================================

export function estimateTextTokens(text: string): number {
    if (!text) return 0;
    // Calibrated BPE token estimator for Markdown + URLs (accounts for subword splits on '/', '-', ':', punctuation)
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const urlMatches = text.match(/https?:\/\/[^\s)]+/g) || [];
    const urlPenalty = urlMatches.reduce((acc, u) => acc + Math.ceil(u.length / 4.2), 0);
    const nonUrlChars = Math.max(0, text.length - urlMatches.reduce((acc, u) => acc + u.length, 0));
    const baseTokens = Math.ceil(nonUrlChars / 3.85);
    return Math.max(words, baseTokens + urlPenalty);
}

export function calculateTokenBudget(
    workspace: GeoWorkspaceState,
    llmsTxt: string,
    llmsFullTxt: string,
    llmsCtxTxt: string
): TokenBudgetReport {
    const llmsTxtBytes = textEncoder.encode(llmsTxt).length;
    const llmsFullTxtBytes = textEncoder.encode(llmsFullTxt).length;
    const llmsTxtWords = llmsTxt.trim() ? llmsTxt.trim().split(/\s+/).length : 0;
    const llmsFullTxtWords = llmsFullTxt.trim() ? llmsFullTxt.trim().split(/\s+/).length : 0;

    const llmsTxtTokens = estimateTextTokens(llmsTxt);
    const llmsFullTxtTokens = estimateTextTokens(llmsFullTxt);
    const llmsCtxTxtTokens = estimateTextTokens(llmsCtxTxt);

    const sectionGroups = new Map<string, LlmsLinkItem[]>();
    for (const link of workspace.links.filter((l) => l.includedInLlmsTxt)) {
        const sec = link.section.trim() || 'Core Documentation';
        const list = sectionGroups.get(sec) || [];
        list.push(link);
        sectionGroups.set(sec, list);
    }

    let optionalSectionTokens = 0;
    const sectionBreakdown: TokenBudgetReport['sectionBreakdown'] = [];
    for (const [secName, items] of sectionGroups.entries()) {
        const secMarkdown =
            `## ${secName}\n\n` +
            items.map((item) => `- [${item.title}](${item.url}): ${item.description}`).join('\n');
        const tok = estimateTextTokens(secMarkdown);
        const isOpt = secName.toLowerCase() === 'optional';
        if (isOpt) optionalSectionTokens += tok;
        sectionBreakdown.push({
            sectionName: secName,
            linkCount: items.length,
            tokens: tok,
            isOptionalSection: isOpt,
        });
    }

    const optionalSectionPercent =
        llmsTxtTokens > 0 ? Number(((optionalSectionTokens / llmsTxtTokens) * 100).toFixed(1)) : 0;

    const models: { name: string; provider: string; window: number; pricePer1MInputUsd: number }[] = [
        { name: 'GPT-4o / o3-mini (o200k_base)', provider: 'OpenAI', window: 128_000, pricePer1MInputUsd: 2.5 },
        { name: 'Claude 4 / 3.7 Sonnet', provider: 'Anthropic', window: 200_000, pricePer1MInputUsd: 3.0 },
        { name: 'Gemini 2.5 Pro', provider: 'Google DeepMind', window: 1_000_000, pricePer1MInputUsd: 1.25 },
        { name: 'DeepSeek R1 / V3', provider: 'DeepSeek', window: 128_000, pricePer1MInputUsd: 0.55 },
    ];

    const modelComparisons: ModelTokenWindowStat[] = models.map((m) => {
        const idxPct = Number(((llmsTxtTokens / m.window) * 100).toFixed(3));
        const fullPct = Number(((llmsFullTxtTokens / m.window) * 100).toFixed(2));
        const costPer1k = Number((((llmsFullTxtTokens * 1000) / 1_000_000) * m.pricePer1MInputUsd).toFixed(4));
        return {
            modelName: m.name,
            provider: m.provider,
            contextWindowTokens: m.window,
            llmsTxtPercentOfContext: idxPct,
            llmsFullTxtPercentOfContext: fullPct,
            fitsComfortably: llmsFullTxtTokens < m.window * 0.5,
            estimatedCostPer1000ReadsUsd: costPer1k,
        };
    });

    return {
        llmsTxtChars: llmsTxt.length,
        llmsTxtBytes,
        llmsTxtWords,
        llmsTxtTokens,
        optionalSectionTokens,
        optionalSectionPercent,
        llmsFullTxtChars: llmsFullTxt.length,
        llmsFullTxtBytes,
        llmsFullTxtWords,
        llmsFullTxtTokens,
        llmsCtxTxtTokens,
        sectionBreakdown,
        modelComparisons,
    };
}

// ============================================================================
// 6. 12-POINT LLMSTXT.ORG V2 & RFC 9309 CROSS-FILE LINTER + AUTO-FIXER
// ============================================================================

const MARKETING_BUZZWORDS_REGEX = /\b(revolutionary|world-class|synergistic|best-in-class|cutting-edge|game-changing|unparalleled|next-generation|bleeding-edge|magical|supercharge|skyrocket|unrivaled)\b/i;
const VAGUE_TITLE_REGEX = /^(click here|read more|learn more|link|page|untitled|here|more info|website)$/i;

export function validateGeoWorkspace(workspace: GeoWorkspaceState): {
    lintIssues: GeoLintIssue[];
    healthScore: number;
} {
    const issues: GeoLintIssue[] = [];
    let penalty = 0;

    const activeLinks = workspace.links.filter((l) => l.includedInLlmsTxt);

    // Rule 1: Mandatory H1 Project Title
    if (!workspace.projectName || !workspace.projectName.trim()) {
        penalty += 20;
        issues.push({
            id: 'lint_missing_h1',
            ruleCode: 'MISSING_OR_MULTIPLE_H1',
            severity: 'CRITICAL',
            targetFile: 'llms.txt',
            title: 'Missing Mandatory # H1 Title in llms.txt',
            explanation: 'The official llmstxt.org v2 specification requires a single H1 (# Project Name) on the very first line of llms.txt.',
            remediation: 'Provide a clear project or website name in the H1 Title field.',
            autoFixable: true,
        });
    }

    // Rule 2: Blockquote Summary Check
    if (!workspace.summaryBlockquote || !workspace.summaryBlockquote.trim()) {
        penalty += 10;
        issues.push({
            id: 'lint_missing_blockquote',
            ruleCode: 'MISSING_OR_LONG_BLOCKQUOTE',
            severity: 'HIGH',
            targetFile: 'llms.txt',
            title: 'Missing > Blockquote Summary Below H1',
            explanation: 'llmstxt.org v2 recommends a concise > blockquote immediately below the H1 heading so AI agents can grasp the site purpose in one sentence.',
            remediation: 'Add a 1–2 sentence factual blockquote summarizing what your platform or documentation covers.',
            autoFixable: true,
        });
    } else if (workspace.summaryBlockquote.length > 360) {
        penalty += 5;
        issues.push({
            id: 'lint_long_blockquote',
            ruleCode: 'MISSING_OR_LONG_BLOCKQUOTE',
            severity: 'MEDIUM',
            targetFile: 'llms.txt',
            title: `Blockquote Summary Exceeds Recommended Length (${workspace.summaryBlockquote.length} chars)`,
            explanation: 'Keep the top > blockquote under 300–350 characters and move longer background notes into the overview paragraph.',
            remediation: 'Click Auto-Fix to trim the blockquote summary to a concise single-sentence abstract.',
            autoFixable: true,
        });
    }

    // Rule 3: Active Links Check
    if (activeLinks.length === 0) {
        penalty += 25;
        issues.push({
            id: 'lint_empty_links',
            ruleCode: 'EMPTY_SECTIONS_OR_LINKS',
            severity: 'CRITICAL',
            targetFile: 'llms.txt',
            title: 'No Active Markdown Links in llms.txt',
            explanation: 'An llms.txt file without H2 link sections provides zero navigation targets for AI coding assistants or answer engines.',
            remediation: 'Add links or import a sitemap.xml in Tab 1.',
            autoFixable: false,
        });
    }

    // Rule 4: Relative URLs in llms.txt
    const relativeLinks = activeLinks.filter((l) => !/^https?:\/\//i.test(l.url.trim()));
    if (relativeLinks.length > 0) {
        penalty += 12;
        issues.push({
            id: 'lint_relative_urls',
            ruleCode: 'RELATIVE_URL_IN_LLMS_TXT',
            severity: 'HIGH',
            targetFile: 'llms.txt',
            title: `${relativeLinks.length} Relative URL(s) Detected in llms.txt`,
            explanation: `Found relative link path(s) (${relativeLinks.slice(0, 2).map((l) => l.url).join(', ')}). When developers paste your llms.txt into ChatGPT, Claude, or Cursor, relative URLs break because the LLM lacks the base origin.`,
            remediation: 'Click Auto-Fix to prepend your canonical Site URL to all relative link paths.',
            autoFixable: true,
        });
    }

    // Rule 5: Duplicate Link URLs
    const urlCounts = new Map<string, number>();
    for (const l of activeLinks) {
        const norm = l.url.trim().replace(/\/+$/, '').toLowerCase();
        urlCounts.set(norm, (urlCounts.get(norm) || 0) + 1);
    }
    const dupUrls = Array.from(urlCounts.entries()).filter(([, c]) => c > 1);
    if (dupUrls.length > 0) {
        penalty += 8;
        issues.push({
            id: 'lint_duplicate_urls',
            ruleCode: 'DUPLICATE_LINK_URL',
            severity: 'MEDIUM',
            targetFile: 'llms.txt',
            title: `${dupUrls.length} Duplicate Link URL(s) Wasting Context Tokens`,
            explanation: 'Listing the exact same URL multiple times in llms.txt wastes inference tokens and confuses retrieval ranking.',
            remediation: 'Click Auto-Fix to deduplicate repeated URLs.',
            autoFixable: true,
        });
    }

    // Rule 6: Marketing Fluff / Buzzwords in Descriptions or Summary
    const fluffLinks = activeLinks.filter((l) => MARKETING_BUZZWORDS_REGEX.test(l.description));
    const summaryHasFluff = MARKETING_BUZZWORDS_REGEX.test(workspace.summaryBlockquote);
    if (fluffLinks.length > 0 || summaryHasFluff) {
        penalty += 10;
        issues.push({
            id: 'lint_marketing_fluff',
            ruleCode: 'MARKETING_FLUFF_DESCRIPTION',
            severity: 'MEDIUM',
            targetFile: 'llms.txt',
            title: `Marketing Buzzwords Detected in ${fluffLinks.length + (summaryHasFluff ? 1 : 0)} Description(s)`,
            explanation: 'LLMs require dry, factual descriptions of what a page answers (e.g., "REST API authentication and rate limits"), not promotional superlatives ("revolutionary", "world-class", "synergistic").',
            remediation: 'Click Auto-Fix to strip promotional buzzwords and rewrite clean factual descriptions.',
            autoFixable: true,
        });
    }

    // Rule 7: Vague Link Titles
    const vagueLinks = activeLinks.filter((l) => VAGUE_TITLE_REGEX.test(l.title.trim()));
    if (vagueLinks.length > 0) {
        penalty += 8;
        issues.push({
            id: 'lint_vague_titles',
            ruleCode: 'VAGUE_LINK_TITLE',
            severity: 'MEDIUM',
            targetFile: 'llms.txt',
            title: `${vagueLinks.length} Vague Link Title(s) ("Click here" / "Read more")`,
            explanation: 'AI agents select which link to fetch based on the [Link Title] anchor text.',
            remediation: 'Click Auto-Fix to derive descriptive titles from the URL slugs.',
            autoFixable: true,
        });
    }

    // Rule 8: Missing ## Optional section on larger link lists (>= 8 links)
    const hasOptionalSection = activeLinks.some((l) => l.section.trim().toLowerCase() === 'optional');
    if (activeLinks.length >= 8 && !hasOptionalSection) {
        penalty += 5;
        issues.push({
            id: 'lint_missing_optional',
            ruleCode: 'MISSING_OPTIONAL_SECTION_FOR_LARGE_INDEX',
            severity: 'MEDIUM',
            targetFile: 'llms.txt',
            title: 'No "## Optional" Section Defined for Context Window Budgeting',
            explanation: 'In the llmstxt.org v2 specification, the "## Optional" heading signals secondary links (like changelogs, legal policies, or legacy docs) that LLMs can skip when context tokens are tight.',
            remediation: 'Click Auto-Fix to move low-priority policy/changelog links into "## Optional".',
            autoFixable: true,
        });
    }

    // Rule 9: Cross-File Conflict — robots.txt blocks AI Search Citation bots while publishing llms.txt
    const searchCitationBots = workspace.bots.filter(
        (b) =>
            b.userAgent === 'OAI-SearchBot' ||
            b.userAgent === 'Claude-SearchBot' ||
            b.userAgent === 'PerplexityBot'
    );
    const blockedSearchBots = searchCitationBots.filter((b) => b.permission === 'BLOCK');
    if (blockedSearchBots.length > 0 && workspace.activePreset !== 'total_ai_lockdown') {
        penalty += 18;
        issues.push({
            id: 'lint_search_bots_blocked',
            ruleCode: 'ROBOTS_BLOCKS_AI_SEARCH_CITATIONS',
            severity: 'CRITICAL',
            targetFile: 'cross-file',
            title: `AI Invisibility Warning: ${blockedSearchBots.map((b) => b.userAgent).join(', ')} Blocked in robots.txt`,
            explanation: `Blocking ${blockedSearchBots.map((b) => b.userAgent).join(', ')} prevents ChatGPT Search, Claude Search, and Perplexity from citing your site in live answers. If you only want to block model training, block GPTBot and ClaudeBot while keeping OAI-SearchBot, Claude-SearchBot, and PerplexityBot ALLOWED.`,
            remediation: 'Click Auto-Fix to allow AI Search Citation bots while keeping Model Training crawlers blocked.',
            autoFixable: true,
        });
    }

    // Rule 10: RFC 9309 §2.2.1 Specific-Group Override Leak
    const hasAllowedSpecificBots = workspace.bots.some((b) => b.permission === 'ALLOW');
    if (
        workspace.globalDisallowPaths.length > 0 &&
        hasAllowedSpecificBots &&
        !workspace.enforceRfc9309InheritanceGuard
    ) {
        penalty += 20;
        issues.push({
            id: 'lint_rfc9309_override_leak',
            ruleCode: 'RFC9309_SPECIFIC_GROUP_INHERITANCE_LEAK',
            severity: 'CRITICAL',
            targetFile: 'robots.txt',
            title: `RFC 9309 §2.2.1 Override Leak: Global Disallow (${workspace.globalDisallowPaths.slice(0, 2).join(', ')}) Ignored by Allowed AI Bots`,
            explanation: 'Under RFC 9309, any crawler that matches its own specific User-agent group (e.g., User-agent: OAI-SearchBot) completely ignores the wildcard User-agent: * group! Without repeating your global Disallow paths inside each allowed bot group, AI crawlers are granted access to private paths like /admin/ or /checkout/.',
            remediation: 'Click Auto-Fix to enable the RFC 9309 Specific-Group Inheritance Guard.',
            autoFixable: true,
        });
    }

    // Rule 11: robots.txt blocks /llms.txt path
    const explicitlyDisallowsLlms = workspace.globalDisallowPaths.some(
        (p) => p.trim() === '/llms.txt' || p.trim() === '/llms-full.txt'
    );
    const wildcardDisallowsRootWithoutAllow =
        workspace.globalDisallowPaths.some((p) => p.trim() === '/') &&
        !workspace.explicitlyAllowLlmsTxtInRobots;
    if (explicitlyDisallowsLlms || wildcardDisallowsRootWithoutAllow) {
        penalty += 15;
        issues.push({
            id: 'lint_llms_txt_blocked',
            ruleCode: 'ROBOTS_BLOCKS_LLMS_TXT_PATH',
            severity: 'CRITICAL',
            targetFile: 'cross-file',
            title: 'Contradiction: robots.txt Disallows /llms.txt',
            explanation: 'Your robots.txt disallow rules block crawlers from fetching /llms.txt or /llms-full.txt.',
            remediation: 'Click Auto-Fix to add explicit Allow: /llms.txt and Allow: /llms-full.txt directives.',
            autoFixable: true,
        });
    }

    // Rule 12: Deprecated Bot User-Agent Tokens
    if (workspace.deprecatedTokensDetected.length > 0) {
        penalty += 8;
        issues.push({
            id: 'lint_deprecated_agents',
            ruleCode: 'DEPRECATED_BOT_USER_AGENT',
            severity: 'MEDIUM',
            targetFile: 'robots.txt',
            title: `Deprecated AI User-Agent Token(s) Found: ${workspace.deprecatedTokensDetected.join(', ')}`,
            explanation: 'Tokens like anthropic-ai, Claude-Web, and FacebookBot are retired and ignored by modern crawlers (replaced by ClaudeBot, Claude-SearchBot, and Meta-ExternalAgent).',
            remediation: 'Click Auto-Fix to purge retired user-agent tokens and replace them with current 2026 tokens.',
            autoFixable: true,
        });
    }

    const healthScore = Math.max(10, Math.min(100, 100 - penalty));
    return { lintIssues: issues, healthScore };
}

export function autoFixGeoWorkspace(workspace: GeoWorkspaceState): GeoWorkspaceState {
    const cleanSiteUrl = (workspace.siteUrl || 'https://example.com').trim().replace(/\/+$/, '');
    const projectName = workspace.projectName?.trim() || 'Developer Platform & Documentation';

    let summaryBlockquote = workspace.summaryBlockquote?.trim() ||
        `Official technical documentation, API reference, and product guides for ${projectName}.`;
    summaryBlockquote = summaryBlockquote
        .replace(new RegExp(MARKETING_BUZZWORDS_REGEX.source, 'gi'), 'enterprise')
        .replace(/\s+/g, ' ')
        .trim();
    if (summaryBlockquote.length > 340) {
        summaryBlockquote = `${summaryBlockquote.slice(0, 337).trim()}...`;
    }

    const seenUrls = new Set<string>();
    const fixedLinks: LlmsLinkItem[] = [];

    for (const link of workspace.links) {
        let url = link.url.trim();
        if (!/^https?:\/\//i.test(url)) {
            url = url.startsWith('/') ? `${cleanSiteUrl}${url}` : `${cleanSiteUrl}/${url}`;
        }
        const normUrl = url.replace(/\/+$/, '').toLowerCase();
        if (seenUrls.has(normUrl)) continue;
        seenUrls.add(normUrl);

        const inferred = humanizeUrlSlugToTitleAndDescription(url, projectName);
        const title = VAGUE_TITLE_REGEX.test(link.title.trim()) ? inferred.title : link.title.trim();
        const description = link.description
            .replace(new RegExp(MARKETING_BUZZWORDS_REGEX.source, 'gi'), 'production-grade')
            .replace(/\s+/g, ' ')
            .trim() || inferred.description;

        fixedLinks.push({
            ...link,
            title,
            url,
            description,
        });
    }

    // Ensure at least one link is in ## Optional if there are >= 8 links
    if (
        fixedLinks.filter((l) => l.includedInLlmsTxt).length >= 8 &&
        !fixedLinks.some((l) => l.section.trim().toLowerCase() === 'optional')
    ) {
        const lastIdx = fixedLinks.length - 1;
        fixedLinks[lastIdx] = {
            ...fixedLinks[lastIdx],
            section: 'Optional',
            includedInFullTxt: false,
        };
    }

    // Ensure AI Search Citation bots are allowed unless total_ai_lockdown
    const fixedBots = workspace.bots.map((b) => {
        if (
            workspace.activePreset !== 'total_ai_lockdown' &&
            (b.userAgent === 'OAI-SearchBot' || b.userAgent === 'Claude-SearchBot' || b.userAgent === 'PerplexityBot')
        ) {
            return { ...b, permission: 'ALLOW' as AiBotPermission };
        }
        return { ...b };
    });

    const cleanDisallows = workspace.globalDisallowPaths.filter((p) => p.trim() !== '/llms.txt');

    return {
        ...workspace,
        projectName,
        siteUrl: cleanSiteUrl,
        summaryBlockquote,
        links: fixedLinks,
        bots: fixedBots,
        globalDisallowPaths: cleanDisallows,
        enforceRfc9309InheritanceGuard: true,
        explicitlyAllowLlmsTxtInRobots: true,
        deprecatedTokensDetected: [],
    };
}

// ============================================================================
// 7. 10-FORMAT COMPILERS & EXPORTERS (LLMS.TXT, FULL, CTX, ROBOTS, TDMREP, NEXTJS, XLSX)
// ============================================================================

export function compileLlmsTxt(workspace: GeoWorkspaceState): string {
    const lines: string[] = [];
    const title = workspace.projectName.trim() || 'Website Documentation';
    lines.push(`# ${title}`);
    lines.push('');

    if (workspace.summaryBlockquote.trim()) {
        lines.push(`> ${workspace.summaryBlockquote.trim()}`);
        lines.push('');
    }

    for (const para of workspace.overviewParagraphs) {
        if (para.trim()) {
            lines.push(para.trim());
            lines.push('');
        }
    }

    const activeLinks = workspace.links.filter((l) => l.includedInLlmsTxt);
    const sectionOrder = [
        'Core Documentation',
        'API & SDK Reference',
        'Guides & Tutorials',
        'Product & Pricing',
        'Company & Policies',
    ];

    const grouped = new Map<string, LlmsLinkItem[]>();
    for (const link of activeLinks) {
        const sec = link.section.trim() || 'Core Documentation';
        const list = grouped.get(sec) || [];
        list.push(link);
        grouped.set(sec, list);
    }

    // Output standard sections first, custom sections next, and "## Optional" strictly last per llmstxt.org v2 spec
    const allSecNames = Array.from(grouped.keys());
    const sortedSections = allSecNames.sort((a, b) => {
        if (a.toLowerCase() === 'optional') return 1;
        if (b.toLowerCase() === 'optional') return -1;
        const idxA = sectionOrder.indexOf(a);
        const idxB = sectionOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    });

    for (const secName of sortedSections) {
        const items = grouped.get(secName) || [];
        if (items.length === 0) continue;
        lines.push(`## ${secName}`);
        lines.push('');
        for (const item of items) {
            const descPart = item.description.trim() ? `: ${item.description.trim()}` : '';
            lines.push(`- [${item.title.trim()}](${item.url.trim()})${descPart}`);
        }
        lines.push('');
    }

    return lines.join('\n').trim() + '\n';
}

export function compileLlmsFullTxt(workspace: GeoWorkspaceState): string {
    const lines: string[] = [];
    const title = workspace.projectName.trim() || 'Website Documentation';
    lines.push(`# ${title} — Complete Documentation Bundle (llms-full.txt)`);
    lines.push('');
    if (workspace.summaryBlockquote.trim()) {
        lines.push(`> ${workspace.summaryBlockquote.trim()}`);
        lines.push('');
    }
    lines.push(`Canonical Index: ${workspace.siteUrl.replace(/\/+$/, '')}/llms.txt`);
    lines.push('');

    for (const para of workspace.overviewParagraphs) {
        if (para.trim()) {
            lines.push(para.trim());
            lines.push('');
        }
    }

    const fullLinks = workspace.links.filter((l) => l.includedInFullTxt);
    for (let i = 0; i < fullLinks.length; i++) {
        const item = fullLinks[i];
        lines.push('---');
        lines.push('');
        lines.push(`## [${i + 1}] ${item.title.trim()}`);
        lines.push(`- **URL:** ${item.url.trim()}`);
        lines.push(`- **Section:** ${item.section}`);
        if (item.lastModified) {
            lines.push(`- **Last Updated:** ${item.lastModified}`);
        }
        lines.push(`- **Summary:** ${item.description.trim()}`);
        lines.push('');
        const body = item.fullMarkdownContent.trim();
        if (body) {
            lines.push(body);
            lines.push('');
        }
    }

    return lines.join('\n').trim() + '\n';
}

export function compileLlmsCtxTxt(workspace: GeoWorkspaceState): string {
    const escXml = (s: string) =>
        s
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    const fullLinks = workspace.links.filter((l) => l.includedInFullTxt);
    const docBlocks = fullLinks
        .map(
            (item, idx) =>
                `  <document index="${idx + 1}" title="${escXml(item.title)}" url="${escXml(item.url)}" section="${escXml(
                    item.section
                )}">\n` +
                `    <summary>${escXml(item.description)}</summary>\n` +
                `    <content>\n${item.fullMarkdownContent.trim()}\n    </content>\n` +
                `  </document>`
        )
        .join('\n');

    return [
        `<project title="${escXml(workspace.projectName)}" url="${escXml(workspace.siteUrl)}">`,
        `  <summary>${escXml(workspace.summaryBlockquote)}</summary>`,
        `  <documents count="${fullLinks.length}">`,
        docBlocks,
        `  </documents>`,
        `</project>`,
        ``,
    ].join('\n');
}

export function compileRobotsTxt(workspace: GeoWorkspaceState): string {
    const cleanSiteUrl = workspace.siteUrl.replace(/\/+$/, '');
    const lines: string[] = [
        `# ============================================================================`,
        `# robots.txt — Generated by KivaroTools Client-Side GEO & AI Crawler Studio`,
        `# Target Domain: ${cleanSiteUrl}`,
        `# Active Strategy Preset: ${workspace.activePreset}`,
        `# Standards: RFC 9309 (Robots Exclusion Protocol) + IETF AIPREF (Content-Usage)`,
        `# ============================================================================`,
        ``,
        `# 1. Global Default Rules (All Standard Crawlers)`,
        `User-agent: *`,
    ];

    for (const allowPath of workspace.globalAllowPaths) {
        if (allowPath.trim()) lines.push(`Allow: ${allowPath.trim()}`);
    }
    if (workspace.explicitlyAllowLlmsTxtInRobots) {
        lines.push(`Allow: /llms.txt`);
        lines.push(`Allow: /llms-full.txt`);
    }
    for (const disPath of workspace.globalDisallowPaths) {
        if (disPath.trim()) lines.push(`Disallow: ${disPath.trim()}`);
    }
    if (workspace.crawlDelaySeconds && workspace.crawlDelaySeconds > 0) {
        lines.push(`Crawl-delay: ${workspace.crawlDelaySeconds}`);
    }
    if (workspace.ietfContentUsage.enabled) {
        const trainFlag = workspace.ietfContentUsage.allowAiTraining ? 'y' : 'n';
        const aiFlag = workspace.ietfContentUsage.allowAiInference ? 'y' : 'n';
        const searchFlag = workspace.ietfContentUsage.allowSearchIndexing ? 'y' : 'n';
        lines.push(`Content-Usage: search=${searchFlag}, ai=${aiFlag}, train-ai=${trainFlag}`);
    }
    lines.push('');

    // 2. Allowed AI Search Citation & User-Triggered Fetcher Bots
    const allowedBots = workspace.bots.filter((b) => b.permission === 'ALLOW');
    if (allowedBots.length > 0) {
        lines.push(`# 2. Allowed AI Search Citation & User-Triggered Assistants`);
        for (const b of allowedBots) {
            lines.push(`User-agent: ${b.userAgent}`);
        }
        lines.push(`Allow: /`);
        if (workspace.explicitlyAllowLlmsTxtInRobots) {
            lines.push(`Allow: /llms.txt`);
            lines.push(`Allow: /llms-full.txt`);
        }
        // RFC 9309 §2.2.1 Specific-Group Inheritance Guard
        if (workspace.enforceRfc9309InheritanceGuard) {
            for (const disPath of workspace.globalDisallowPaths) {
                if (disPath.trim()) lines.push(`Disallow: ${disPath.trim()}`);
            }
        }
        lines.push('');
    }

    // 3. Blocked Foundation Model Training & Bulk Dataset Scrapers
    const blockedBots = workspace.bots.filter((b) => b.permission === 'BLOCK');
    if (blockedBots.length > 0) {
        lines.push(`# 3. Blocked AI Model Training Crawlers, Usage Opt-Out Tokens & Bulk Scrapers`);
        for (const b of blockedBots) {
            lines.push(`User-agent: ${b.userAgent}`);
        }
        lines.push(`Disallow: /`);
        lines.push('');
    }

    // 4. Custom Path Bots
    const customBots = workspace.bots.filter((b) => b.permission === 'CUSTOM_PATHS');
    for (const b of customBots) {
        lines.push(`# Custom Rules for ${b.userAgent} (${b.operator})`);
        lines.push(`User-agent: ${b.userAgent}`);
        for (const ap of b.customAllowPaths) {
            if (ap.trim()) lines.push(`Allow: ${ap.trim()}`);
        }
        for (const dp of b.customDisallowPaths) {
            if (dp.trim()) lines.push(`Disallow: ${dp.trim()}`);
        }
        if (workspace.enforceRfc9309InheritanceGuard) {
            for (const disPath of workspace.globalDisallowPaths) {
                if (disPath.trim()) lines.push(`Disallow: ${disPath.trim()}`);
            }
        }
        lines.push('');
    }

    // 5. Sitemap & LLM Index Pointers
    const sitemapTarget = workspace.sitemapUrl.trim() || `${cleanSiteUrl}/sitemap.xml`;
    lines.push(`Sitemap: ${sitemapTarget}`);
    lines.push('');
    return lines.join('\n');
}

export function compileAiTxt(workspace: GeoWorkspaceState): string {
    const trainAllowed = workspace.ietfContentUsage.allowAiTraining;
    const inferenceAllowed = workspace.ietfContentUsage.allowAiInference;

    return [
        `# ai.txt — Granular AI Training & Inference Permissions`,
        `# Site: ${workspace.siteUrl}`,
        `# Specification: Spawning / ai.txt Convention`,
        ``,
        `User-agent: *`,
        `Allow-AI-Search: ${workspace.ietfContentUsage.allowSearchIndexing ? 'yes' : 'no'}`,
        `Allow-AI-Inference: ${inferenceAllowed ? 'yes' : 'no'}`,
        `Allow-AI-Training: ${trainAllowed ? 'yes' : 'no'}`,
        `LLMs-Index: ${workspace.siteUrl.replace(/\/+$/, '')}/llms.txt`,
        `LLMs-Full-Context: ${workspace.siteUrl.replace(/\/+$/, '')}/llms-full.txt`,
        `TDM-Reservation: ${workspace.w3cTdmRep.reservation === 1 ? 'reserved (opt-out)' : 'permitted'}`,
        ``,
        `# File-Type Specific Permissions`,
        `Disallow-Training: *.pdf`,
        `Disallow-Training: *.jpg`,
        `Disallow-Training: *.png`,
        `Disallow-Training: *.webp`,
        `Disallow-Training: *.mp4`,
        trainAllowed ? `Allow-Training: *.md` : `Disallow-Training: *`,
        ``,
    ].join('\n');
}

export function compileTdmRepJson(workspace: GeoWorkspaceState): string {
    const payload = [
        {
            location: '/*',
            'tdm-reservation': workspace.w3cTdmRep.reservation,
            ...(workspace.w3cTdmRep.policyUrl.trim()
                ? { 'tdm-policy': workspace.w3cTdmRep.policyUrl.trim() }
                : {}),
            'ai-usage-preferences': {
                'ietf-content-usage': `search=${workspace.ietfContentUsage.allowSearchIndexing ? 'y' : 'n'}, ai=${workspace.ietfContentUsage.allowAiInference ? 'y' : 'n'
                    }, train-ai=${workspace.ietfContentUsage.allowAiTraining ? 'y' : 'n'}`,
                'llms-txt': `${workspace.siteUrl.replace(/\/+$/, '')}/llms.txt`,
                'llms-full-txt': `${workspace.siteUrl.replace(/\/+$/, '')}/llms-full.txt`,
                contact: workspace.w3cTdmRep.contactEmail || undefined,
                license: workspace.w3cTdmRep.licenseSpdx || undefined,
            },
        },
    ];
    return JSON.stringify(payload, null, 2) + '\n';
}

export function compileNextJsRoutesCode(workspace: GeoWorkspaceState): string {
    const llmsContent = compileLlmsTxt(workspace);
    const allowedAgents = workspace.bots.filter((b) => b.permission === 'ALLOW').map((b) => b.userAgent);
    const blockedAgents = workspace.bots.filter((b) => b.permission === 'BLOCK').map((b) => b.userAgent);

    return [
        `// ============================================================================`,
        `// FILE 1: app/llms.txt/route.ts (Next.js App Router Dynamic Handler)`,
        `// ============================================================================`,
        `import { NextResponse } from 'next/server';`,
        ``,
        `export const dynamic = 'force-static';`,
        ``,
        `const LLMS_TXT_BODY = ${JSON.stringify(llmsContent)};`,
        ``,
        `export async function GET() {`,
        `  return new NextResponse(LLMS_TXT_BODY, {`,
        `    status: 200,`,
        `    headers: {`,
        `      'Content-Type': 'text/plain; charset=utf-8',`,
        `      'Cache-Control': 'public, max-age=3600, s-maxage=86400',`,
        `      'X-Robots-Tag': 'all',`,
        `    },`,
        `  });`,
        `}`,
        ``,
        `// ============================================================================`,
        `// FILE 2: app/robots.ts (Next.js App Router Metadata Route — RFC 9309 Safe)`,
        `// ============================================================================`,
        `import type { MetadataRoute } from 'next';`,
        ``,
        `const GLOBAL_DISALLOW = ${JSON.stringify(workspace.globalDisallowPaths)};`,
        `const ALLOWED_AI_SEARCH_BOTS = ${JSON.stringify(allowedAgents)};`,
        `const BLOCKED_AI_TRAINING_BOTS = ${JSON.stringify(blockedAgents)};`,
        ``,
        `export default function robots(): MetadataRoute.Robots {`,
        `  return {`,
        `    rules: [`,
        `      {`,
        `        userAgent: '*',`,
        `        allow: ['/', '/llms.txt', '/llms-full.txt'],`,
        `        disallow: GLOBAL_DISALLOW,`,
        `      },`,
        `      {`,
        `        userAgent: ALLOWED_AI_SEARCH_BOTS,`,
        `        allow: ['/', '/llms.txt', '/llms-full.txt'],`,
        `        disallow: GLOBAL_DISALLOW, // RFC 9309 inheritance guard`,
        `      },`,
        `      {`,
        `        userAgent: BLOCKED_AI_TRAINING_BOTS,`,
        `        disallow: ['/'],`,
        `      },`,
        `    ],`,
        `    sitemap: ${JSON.stringify(workspace.sitemapUrl || `${workspace.siteUrl.replace(/\/+$/, '')}/sitemap.xml`)},`,
        `  };`,
        `}`,
    ].join('\n');
}

export function compileEdgeHeadersConfig(workspace: GeoWorkspaceState): string {
    const blockedAgents = workspace.bots.filter((b) => b.permission === 'BLOCK').map((b) => b.userAgent);
    const trainFlag = workspace.ietfContentUsage.allowAiTraining ? 'y' : 'n';
    const aiFlag = workspace.ietfContentUsage.allowAiInference ? 'y' : 'n';
    const xRobotsTag = workspace.ietfContentUsage.allowAiTraining ? 'all' : 'noai, noimageai';

    return [
        `# ============================================================================`,
        `# 1. Cloudflare WAF Custom Rule Expression (Block Uninvited Training Scrapers)`,
        `# ============================================================================`,
        `(${blockedAgents
            .slice(0, 12)
            .map((ua) => `http.user_agent contains "${ua}"`)
            .join(' or ')})`,
        ``,
        `# ============================================================================`,
        `# 2. Cloudflare Pages / Netlify "_headers" File`,
        `# ============================================================================`,
        `/llms.txt`,
        `  Content-Type: text/plain; charset=utf-8`,
        `  Cache-Control: public, max-age=3600`,
        `  Access-Control-Allow-Origin: *`,
        ``,
        `/*`,
        `  X-Robots-Tag: ${xRobotsTag}`,
        `  Content-Usage: search=y, ai=${aiFlag}, train-ai=${trainFlag}`,
        `  TDM-Reservation: ${workspace.w3cTdmRep.reservation}`,
        ``,
        `# ============================================================================`,
        `# 3. Nginx Server Block Snippet (nginx.conf)`,
        `# ============================================================================`,
        `location = /llms.txt {`,
        `    default_type "text/plain; charset=utf-8";`,
        `    add_header Access-Control-Allow-Origin "*";`,
        `    add_header Cache-Control "public, max-age=3600";`,
        `}`,
        `add_header X-Robots-Tag "${xRobotsTag}" always;`,
        `add_header Content-Usage "search=y, ai=${aiFlag}, train-ai=${trainFlag}" always;`,
    ].join('\n');
}

export function exportGeoInventoryCsv(workspace: GeoWorkspaceState, includeUtf8Bom = true): string {
    const headers = [
        'Item_Type',
        'Identifier_Or_Title',
        'URL_Or_UserAgent',
        'Section_Or_Operator',
        'Role_Or_Scope',
        'Policy_Decision',
        'Description',
    ];

    const linkRows = workspace.links.map((l) => [
        'LLMS_TXT_LINK',
        l.title,
        l.url,
        l.section,
        l.includedInFullTxt ? 'llms.txt + llms-full.txt' : 'llms.txt Only',
        l.includedInLlmsTxt ? 'INCLUDED' : 'EXCLUDED',
        l.description,
    ]);

    const botRows = workspace.bots.map((b) => [
        'AI_CRAWLER_BOT',
        b.userAgent,
        b.publishedIpRanges,
        b.operator,
        b.role,
        b.permission,
        b.description,
    ]);

    const escapeCell = (v: string) => {
        const s = sanitizeSpreadsheetFormula(v, true);
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
            return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
    };

    const allRows = [...linkRows, ...botRows];
    const body = [headers.join(','), ...allRows.map((r) => r.map(escapeCell).join(','))].join('\r\n');
    return (includeUtf8Bom ? '\uFEFF' : '') + body;
}

export function exportGeoInventoryXlsx(workspace: GeoWorkspaceState): Uint8Array {
    const xmlEscape = (str: string): string =>
        str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');

    const headers = [
        'Item_Type',
        'Identifier_Or_Title',
        'URL_Or_UserAgent',
        'Section_Or_Operator',
        'Role_Or_Scope',
        'Policy_Decision',
        'Description',
    ];

    const linkRows = workspace.links.map((l) => [
        'LLMS_TXT_LINK',
        l.title,
        l.url,
        l.section,
        l.includedInFullTxt ? 'llms.txt + llms-full.txt' : 'llms.txt Only',
        l.includedInLlmsTxt ? 'INCLUDED' : 'EXCLUDED',
        l.description,
    ]);

    const botRows = workspace.bots.map((b) => [
        'AI_CRAWLER_BOT',
        b.userAgent,
        b.publishedIpRanges,
        b.operator,
        b.role,
        b.permission,
        b.description,
    ]);

    const allRows = [headers, ...linkRows, ...botRows];
    const colLetter = (idx: number): string => {
        let s = '';
        let n = idx + 1;
        while (n > 0) {
            const rem = (n - 1) % 26;
            s = String.fromCharCode(65 + rem) + s;
            n = Math.floor((n - 1) / 26);
        }
        return s;
    };

    const sheetRowsXml = allRows
        .map((row, rIdx) => {
            const rowNum = rIdx + 1;
            const cellsXml = row
                .map((cellVal, cIdx) => {
                    const ref = `${colLetter(cIdx)}${rowNum}`;
                    const safeVal = xmlEscape(sanitizeSpreadsheetFormula(cellVal, true));
                    const styleAttr = rIdx === 0 ? ' s="1"' : '';
                    return `<c r="${ref}" t="inlineStr"${styleAttr}><is><t>${safeVal}</t></is></c>`;
                })
                .join('');
            return `<row r="${rowNum}">${cellsXml}</row>`;
        })
        .join('');

    const contentTypesXml =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
        `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
        `<Default Extension="xml" ContentType="application/xml"/>` +
        `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
        `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
        `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
        `</Types>`;

    const rootRelsXml =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
        `</Relationships>`;

    const workbookXml =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
        `<sheets><sheet name="GEO_AI_Governance_Matrix" sheetId="1" r:id="rId1"/></sheets>` +
        `</workbook>`;

    const workbookRelsXml =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
        `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
        `</Relationships>`;

    const stylesXml =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
        `<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>` +
        `<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>` +
        `<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>` +
        `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
        `<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>` +
        `</styleSheet>`;

    const sheetXml =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
        `<sheetData>${sheetRowsXml}</sheetData>` +
        `</worksheet>`;

    const zipEntries: { name: string; data: Uint8Array }[] = [
        { name: '[Content_Types].xml', data: textEncoder.encode(contentTypesXml) },
        { name: '_rels/.rels', data: textEncoder.encode(rootRelsXml) },
        { name: 'xl/workbook.xml', data: textEncoder.encode(workbookXml) },
        { name: 'xl/_rels/workbook.xml.rels', data: textEncoder.encode(workbookRelsXml) },
        { name: 'xl/styles.xml', data: textEncoder.encode(stylesXml) },
        { name: 'xl/worksheets/sheet1.xml', data: textEncoder.encode(sheetXml) },
    ];

    const localParts: Uint8Array[] = [];
    const centralParts: Uint8Array[] = [];
    let offset = 0;

    for (const entry of zipEntries) {
        const nameBytes = textEncoder.encode(entry.name);
        const crc = computeCrc32(entry.data);
        const size = entry.data.length;

        const localHeader = new Uint8Array(30 + nameBytes.length);
        const lv = new DataView(localHeader.buffer);
        lv.setUint32(0, 0x04034b50, true);
        lv.setUint16(4, 20, true);
        lv.setUint16(6, 0, true);
        lv.setUint16(8, 0, true);
        lv.setUint16(10, 0, true);
        lv.setUint16(12, 0, true);
        lv.setUint32(14, crc, true);
        lv.setUint32(18, size, true);
        lv.setUint32(22, size, true);
        lv.setUint16(26, nameBytes.length, true);
        lv.setUint16(28, 0, true);
        localHeader.set(nameBytes, 30);

        localParts.push(localHeader, entry.data);

        const centralHeader = new Uint8Array(46 + nameBytes.length);
        const cv = new DataView(centralHeader.buffer);
        cv.setUint32(0, 0x02014b50, true);
        cv.setUint16(4, 20, true);
        cv.setUint16(6, 20, true);
        cv.setUint16(8, 0, true);
        cv.setUint16(10, 0, true);
        cv.setUint16(12, 0, true);
        cv.setUint16(14, 0, true);
        cv.setUint32(16, crc, true);
        cv.setUint32(20, size, true);
        cv.setUint32(24, size, true);
        cv.setUint16(28, nameBytes.length, true);
        cv.setUint16(30, 0, true);
        cv.setUint16(32, 0, true);
        cv.setUint16(34, 0, true);
        cv.setUint16(36, 0, true);
        cv.setUint32(38, 0, true);
        cv.setUint32(42, offset, true);
        centralHeader.set(nameBytes, 46);

        centralParts.push(centralHeader);
        offset += localHeader.length + size;
    }

    const centralSize = centralParts.reduce((acc, p) => acc + p.length, 0);
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, zipEntries.length, true);
    ev.setUint16(10, zipEntries.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, offset, true);
    ev.setUint16(20, 0, true);

    const totalLen = offset + centralSize + 22;
    const out = new Uint8Array(totalLen);
    let pos = 0;
    for (const p of localParts) {
        out.set(p, pos);
        pos += p.length;
    }
    for (const p of centralParts) {
        out.set(p, pos);
        pos += p.length;
    }
    out.set(eocd, pos);
    return out;
}

export function compileAllGeoDeliverables(workspace: GeoWorkspaceState): GeoCompiledDeliverables {
    const llmsTxt = compileLlmsTxt(workspace);
    const llmsFullTxt = compileLlmsFullTxt(workspace);
    const llmsCtxTxt = compileLlmsCtxTxt(workspace);
    const robotsTxt = compileRobotsTxt(workspace);
    const aiTxt = compileAiTxt(workspace);
    const tdmRepJson = compileTdmRepJson(workspace);
    const nextJsRoutesTs = compileNextJsRoutesCode(workspace);
    const edgeHeadersConfig = compileEdgeHeadersConfig(workspace);

    const tokenBudget = calculateTokenBudget(workspace, llmsTxt, llmsFullTxt, llmsCtxTxt);
    const { lintIssues, healthScore } = validateGeoWorkspace(workspace);

    const llmsTxtSha256 = computeSha256Hex(llmsTxt);
    const robotsTxtSha256 = computeSha256Hex(robotsTxt);

    const allowedSearchBots = workspace.bots.filter(
        (b) => b.role === 'AI_SEARCH_CITATION' && b.permission === 'ALLOW'
    );
    const blockedTrainingBots = workspace.bots.filter(
        (b) =>
            (b.role === 'MODEL_TRAINING_SCRAPER' ||
                b.role === 'USAGE_OPT_OUT_TOKEN' ||
                b.role === 'BULK_DATASET_SCRAPER') &&
            b.permission === 'BLOCK'
    );

    const markdownImplementationGuide = [
        `# GEO & AI Crawler Deployment Checklist: \`${workspace.projectName}\``,
        ``,
        `- **Site URL:** ${workspace.siteUrl}`,
        `- **Active Strategy Preset:** \`${workspace.activePreset}\``,
        `- **GEO Health Score:** ${healthScore} / 100 (${lintIssues.length} Lint Alert(s))`,
        `- **llms.txt Token Budget:** ~${tokenBudget.llmsTxtTokens} tokens (${tokenBudget.llmsTxtBytes} bytes)`,
        `- **llms-full.txt Token Budget:** ~${tokenBudget.llmsFullTxtTokens} tokens (${tokenBudget.llmsFullTxtBytes} bytes)`,
        `- **AI Search Citation Bots Allowed:** ${allowedSearchBots.length}`,
        `- **Model Training & Bulk Scrapers Blocked:** ${blockedTrainingBots.length}`,
        `- **llms.txt SHA-256:** \`${llmsTxtSha256}\``,
        `- **robots.txt SHA-256:** \`${robotsTxtSha256}\``,
        ``,
        `## Deployment Steps`,
        `1. Place \`llms.txt\` at \`${workspace.siteUrl.replace(/\/+$/, '')}/llms.txt\` with \`Content-Type: text/plain; charset=utf-8\`.`,
        `2. Place \`llms-full.txt\` at \`${workspace.siteUrl.replace(/\/+$/, '')}/llms-full.txt\`.`,
        `3. Deploy \`robots.txt\` at \`${workspace.siteUrl.replace(/\/+$/, '')}/robots.txt\`.`,
        `4. Deploy \`tdmrep.json\` at \`${workspace.siteUrl.replace(/\/+$/, '')}/.well-known/tdmrep.json\`.`,
        ``,
    ].join('\n');

    const complianceCertificateJson = JSON.stringify(
        {
            certificateVersion: '2.0',
            issuedBy: 'KivaroTools Client-Side llms.txt & AI Crawler (robots.txt) Studio',
            processingMode: '100% Local Browser Memory (Zero Server Upload)',
            verifiedAt: new Date().toISOString(),
            project: {
                projectName: workspace.projectName,
                siteUrl: workspace.siteUrl,
                activePreset: workspace.activePreset,
                healthScore,
                lintIssueCount: lintIssues.length,
            },
            deliverableDigests: {
                llmsTxtSha256,
                robotsTxtSha256,
                llmsTxtTokens: tokenBudget.llmsTxtTokens,
                llmsFullTxtTokens: tokenBudget.llmsFullTxtTokens,
            },
            governancePosture: {
                rfc9309InheritanceGuardActive: workspace.enforceRfc9309InheritanceGuard,
                ietfContentUsageEnabled: workspace.ietfContentUsage.enabled,
                allowAiTraining: workspace.ietfContentUsage.allowAiTraining,
                w3cTdmReservation: workspace.w3cTdmRep.reservation,
                allowedSearchCitationBotsCount: allowedSearchBots.length,
                blockedTrainingAndScraperBotsCount: blockedTrainingBots.length,
            },
        },
        null,
        2
    );

    return {
        llmsTxt,
        llmsFullTxt,
        llmsCtxTxt,
        robotsTxt,
        aiTxt,
        tdmRepJson,
        nextJsRoutesTs,
        edgeHeadersConfig,
        markdownImplementationGuide,
        complianceCertificateJson,
        tokenBudget,
        lintIssues,
        healthScore,
        llmsTxtSha256,
        robotsTxtSha256,
    };
}

// ============================================================================
// 8. 3 BUILT-IN 1-CLICK SAMPLE PROJECTS (SYNCHRONOUS IN-MEMORY GENERATION)
// ============================================================================

export function generateSampleGeoProject(
    sampleId: 'saas_dev_platform' | 'ecommerce_storefront' | 'media_research_publisher'
): GeoWorkspaceState {
    const baseBots = getDefaultAiCrawlerBots();

    if (sampleId === 'saas_dev_platform') {
        const base: GeoWorkspaceState = {
            projectName: 'AcmeCloud Edge Runtime & SDK',
            siteUrl: 'https://docs.acmecloud.dev',
            summaryBlockquote:
                'Serverless WebAssembly compute platform, TypeScript SDK, REST API reference, and distributed Postgres storage for edge applications.',
            overviewParagraphs: [
                'AcmeCloud provides sub-millisecond serverless isolates across 310 global edge locations. Use the documentation links below to configure authentication, deploy workers via CLI, and inspect REST API schemas.',
            ],
            sitemapUrl: 'https://docs.acmecloud.dev/sitemap.xml',
            activePreset: 'geo_max_visibility',
            globalDisallowPaths: ['/admin/', '/api/internal/', '/console/billing/'],
            globalAllowPaths: ['/', '/docs/', '/api/'],
            enforceRfc9309InheritanceGuard: true,
            explicitlyAllowLlmsTxtInRobots: true,
            crawlDelaySeconds: null,
            bots: baseBots,
            ietfContentUsage: {
                enabled: true,
                allowAiTraining: false,
                allowAiInference: true,
                allowSearchIndexing: true,
                disallowPathsForTraining: ['/'],
            },
            w3cTdmRep: {
                enabled: true,
                reservation: 1,
                policyUrl: 'https://docs.acmecloud.dev/legal/ai-policy',
                contactEmail: 'legal@acmecloud.dev',
                licenseSpdx: 'Apache-2.0',
            },
            deprecatedTokensDetected: [],
            links: [
                {
                    id: 'link_1',
                    title: 'Quickstart & CLI Installation',
                    url: 'https://docs.acmecloud.dev/docs/quickstart',
                    description: 'Install the acme-cli package, authenticate via OAuth2, and deploy your first TypeScript edge function in 60 seconds.',
                    section: 'Core Documentation',
                    includedInLlmsTxt: true,
                    includedInFullTxt: true,
                    fullMarkdownContent: `### Quickstart & CLI Installation\n\nInstall the CLI globally via npm:\n\n\`\`\`bash\nnpm install -g @acmecloud/cli\nacme login\nacme deploy --env production\n\`\`\`\n\nEvery edge function runs inside an isolated V8 sandbox with a 128 MB memory ceiling and zero cold starts.`,
                    priorityScore: 1.0,
                    lastModified: '2026-10-28',
                },
                {
                    id: 'link_2',
                    title: 'Runtime Architecture & Limits',
                    url: 'https://docs.acmecloud.dev/docs/architecture',
                    description: 'Execution limits, CPU time quotas, Web Crypto API support, and regional failover behavior.',
                    section: 'Core Documentation',
                    includedInLlmsTxt: true,
                    includedInFullTxt: true,
                    fullMarkdownContent: `### Runtime Architecture & Limits\n\n- **Max Request Body:** 100 MB\n- **CPU Burst Time:** 50 ms (Standard) / 30,000 ms (Unbound)\n- **Supported Web APIs:** Fetch, WebSockets, SubtleCrypto, Streams, TextEncoder, CompressionStream.`,
                    priorityScore: 0.9,
                    lastModified: '2026-10-25',
                },
                {
                    id: 'link_3',
                    title: 'REST API v2 Authentication & Bearer JWTs',
                    url: 'https://docs.acmecloud.dev/api/authentication',
                    description: 'Authenticate API requests using Bearer RS256 JWT tokens, scoped service keys, and HMAC webhook signatures.',
                    section: 'API & SDK Reference',
                    includedInLlmsTxt: true,
                    includedInFullTxt: true,
                    fullMarkdownContent: `### REST API v2 Authentication\n\nPass your scoped API token inside the \`Authorization: Bearer <token>\` HTTP header. All endpoints enforce TLS 1.3 and return RFC 7807 Problem Details JSON on 4xx/5xx errors.`,
                    priorityScore: 0.95,
                    lastModified: '2026-10-29',
                },
                {
                    id: 'link_4',
                    title: 'Deployments & Rollbacks Endpoint (/v2/deployments)',
                    url: 'https://docs.acmecloud.dev/api/deployments',
                    description: 'POST, GET, and DELETE endpoints for atomic zero-downtime edge deployments and instant version rollbacks.',
                    section: 'API & SDK Reference',
                    includedInLlmsTxt: true,
                    includedInFullTxt: true,
                    fullMarkdownContent: `### POST /v2/deployments\n\nUploads an ES module bundle and activates it across all 310 edge PoPs within 800 ms.`,
                    priorityScore: 0.9,
                    lastModified: '2026-10-20',
                },
                {
                    id: 'link_5',
                    title: 'Next.js 16 & Vinext Edge Adapter Guide',
                    url: 'https://docs.acmecloud.dev/guides/nextjs-edge',
                    description: 'Configure Next.js App Router, Server Actions, and incremental cache revalidation on AcmeCloud.',
                    section: 'Guides & Tutorials',
                    includedInLlmsTxt: true,
                    includedInFullTxt: true,
                    fullMarkdownContent: `### Next.js 16 Edge Adapter\n\nUse \`@acmecloud/next-adapter\` to compile App Router dynamic routes and static assets for edge deployment.`,
                    priorityScore: 0.85,
                    lastModified: '2026-10-18',
                },
                {
                    id: 'link_6',
                    title: 'Usage-Based Pricing & Free Tier Quotas',
                    url: 'https://docs.acmecloud.dev/pricing',
                    description: 'Transparent per-million request pricing, free tier allowances (100,000 requests/day), and enterprise SLA tiers.',
                    section: 'Product & Pricing',
                    includedInLlmsTxt: true,
                    includedInFullTxt: true,
                    fullMarkdownContent: `### Pricing Overview\n\n- **Free Tier:** 100,000 requests/day, 10 GB egress/month.\n- **Pro Tier:** $0.30 per million requests, zero egress fees.`,
                    priorityScore: 0.8,
                    lastModified: '2026-10-15',
                },
                {
                    id: 'link_7',
                    title: 'Release Notes & SDK Changelog',
                    url: 'https://docs.acmecloud.dev/changelog',
                    description: 'Historical release notes, deprecations, and minor patch versions for the CLI and runtime.',
                    section: 'Optional',
                    includedInLlmsTxt: true,
                    includedInFullTxt: false,
                    fullMarkdownContent: `### Changelog\n\nv2.4.0: Added native WebSocket hibernation and W3C TraceContext headers.`,
                    priorityScore: 0.3,
                    lastModified: '2026-10-30',
                },
                {
                    id: 'link_8',
                    title: 'Terms of Service & Privacy Policy',
                    url: 'https://docs.acmecloud.dev/legal/privacy',
                    description: 'GDPR Data Processing Addendum (DPA), SOC 2 Type II compliance report details, and subprocessor list.',
                    section: 'Optional',
                    includedInLlmsTxt: true,
                    includedInFullTxt: false,
                    fullMarkdownContent: `### Privacy & Compliance\n\nSOC 2 Type II and ISO 27001 certified.`,
                    priorityScore: 0.2,
                    lastModified: '2026-09-01',
                },
            ],
        };
        return applyGeoPreset('geo_max_visibility', base);
    }

    if (sampleId === 'ecommerce_storefront') {
        // Intentionally includes an RFC 9309 inheritance leak, relative URL, and marketing buzzword so the user can test the 12-Point Linter & 1-Click Auto-Fix!
        const base: GeoWorkspaceState = {
            projectName: 'LuxeCart — Direct-to-Consumer Ergonomic Workspace Store',
            siteUrl: 'https://www.luxecart-ergo.com',
            summaryBlockquote:
                'Our revolutionary world-class ergonomic chairs, standing desks, and modular monitor arms with 12-year warranty and global shipping.',
            overviewParagraphs: [
                'LuxeCart designs BIFMA-certified ergonomic office hardware. AI shopping assistants can query product specifications, dimensions, weight capacities, and return policies below.',
            ],
            sitemapUrl: 'https://www.luxecart-ergo.com/sitemap_products.xml',
            activePreset: 'ecommerce_saas_funnel_guard',
            globalDisallowPaths: ['/checkout/', '/cart/', '/account/', '/admin/', '/api/orders/'],
            globalAllowPaths: ['/', '/products/', '/collections/'],
            enforceRfc9309InheritanceGuard: false, // Intentional leak for Linter demo!
            explicitlyAllowLlmsTxtInRobots: true,
            crawlDelaySeconds: null,
            bots: baseBots,
            ietfContentUsage: {
                enabled: true,
                allowAiTraining: false,
                allowAiInference: true,
                allowSearchIndexing: true,
                disallowPathsForTraining: ['/'],
            },
            w3cTdmRep: {
                enabled: true,
                reservation: 1,
                policyUrl: 'https://www.luxecart-ergo.com/policies/terms-of-service',
                contactEmail: 'support@luxecart-ergo.com',
                licenseSpdx: 'Proprietary',
            },
            deprecatedTokensDetected: ['Claude-Web'],
            links: [
                {
                    id: 'link_e1',
                    title: 'AeroMesh Pro Ergonomic Task Chair Specifications',
                    url: 'https://www.luxecart-ergo.com/products/aeromesh-pro-chair',
                    description: '4D adjustable armrests, dynamic lumbar support, 350 lb capacity, dimensions, and assembly tolerances.',
                    section: 'Product & Pricing',
                    includedInLlmsTxt: true,
                    includedInFullTxt: true,
                    fullMarkdownContent: `### AeroMesh Pro Task Chair\n\n- **Price:** $649 USD\n- **Weight Capacity:** 350 lbs (158 kg)\n- **Warranty:** 12-Year Structural & Mechanism Warranty.`,
                    priorityScore: 1.0,
                },
                {
                    id: 'link_e2',
                    title: 'ApexDual Motor Standing Desk Technical Sheet',
                    url: '/products/apex-dual-standing-desk', // Intentional relative URL for Linter demo!
                    description: 'Dual Bosch motors, 24.5" to 50.2" height range, anti-collision gyro sensor, and 310 lb lift load.',
                    section: 'Product & Pricing',
                    includedInLlmsTxt: true,
                    includedInFullTxt: true,
                    fullMarkdownContent: `### ApexDual Standing Desk\n\n- **Price:** $589 USD\n- **Lift Speed:** 1.6 inches/sec at <42 dB noise level.`,
                    priorityScore: 0.95,
                },
                {
                    id: 'link_e3',
                    title: 'B2B Volume Bulk Pricing & Corporate Outfitting',
                    url: 'https://www.luxecart-ergo.com/pages/corporate-bulk-pricing',
                    description: 'Tiered volume discounts (10% to 28% off) for orders of 10+ workstations with net-30 invoicing.',
                    section: 'Product & Pricing',
                    includedInLlmsTxt: true,
                    includedInFullTxt: true,
                    fullMarkdownContent: `### Corporate Bulk Pricing\n\n- **10–24 Units:** 12% Discount\n- **25–99 Units:** 20% Discount\n- **100+ Units:** 28% Discount + Free White-Glove Assembly.`,
                    priorityScore: 0.85,
                },
                {
                    id: 'link_e4',
                    title: '30-Day Trial, Free Return Shipping & 12-Year Warranty Policy',
                    url: 'https://www.luxecart-ergo.com/policies/refund-and-warranty',
                    description: 'Full refund eligibility within 30 days of delivery, prepaid return labels, and replacement part SLA.',
                    section: 'Company & Policies',
                    includedInLlmsTxt: true,
                    includedInFullTxt: true,
                    fullMarkdownContent: `### Return & Warranty Policy\n\nFree return pickup within 30 days inside the US, UK, EU, and Canada.`,
                    priorityScore: 0.8,
                },
                {
                    id: 'link_e5',
                    title: 'ErgoArm Heavy-Duty Ultrawide Monitor Mount Guide',
                    url: 'https://www.luxecart-ergo.com/products/ergoarm-ultrawide-mount',
                    description: 'Gas-spring VESA 75x75 and 100x100 mount supporting curved 49-inch ultrawide monitors up to 44 lbs.',
                    section: 'Product & Pricing',
                    includedInLlmsTxt: true,
                    includedInFullTxt: true,
                    fullMarkdownContent: `### ErgoArm Ultrawide Monitor Mount\n\n- **Price:** $189 USD\n- **Supported Weight:** 6.6 to 44 lbs (3 to 20 kg).`,
                    priorityScore: 0.85,
                },
                {
                    id: 'link_e6',
                    title: 'BIFMA X5.1 & GREENGUARD Gold Sustainability Certifications',
                    url: 'https://www.luxecart-ergo.com/pages/sustainability-certifications',
                    description: 'Recycled aluminum frame composition, VOC emissions testing, and ISO 14001 factory audit reports.',
                    section: 'Optional',
                    includedInLlmsTxt: true,
                    includedInFullTxt: false,
                    fullMarkdownContent: `### Sustainability & Safety Certifications\n\nAll LuxeCart seating passes ANSI/BIFMA X5.1-2017 durability testing.`,
                    priorityScore: 0.3,
                },
            ],
        };
        const applied = applyGeoPreset('ecommerce_saas_funnel_guard', base);
        applied.enforceRfc9309InheritanceGuard = false; // Keep false on initial load so user sees the RFC 9309 Linter warning & can click 1-Click Auto-Fix!
        return applied;
    }

    // media_research_publisher
    const base: GeoWorkspaceState = {
        projectName: 'QuantumDigest — Semiconductor & AI Systems Research Journal',
        siteUrl: 'https://www.quantumdigest.org',
        summaryBlockquote:
            'Peer-reviewed semiconductor fabrication benchmarks, wafer yield telemetry, and AI accelerator interconnect analyses.',
        overviewParagraphs: [
            'QuantumDigest publishes original hardware benchmarks and lithography market research. AI search engines may cite our abstracts with attribution links, while foundation model training scraping is strictly reserved under EU DSM Directive Article 4 and IETF AIPREF.',
        ],
        sitemapUrl: 'https://www.quantumdigest.org/news-sitemap.xml',
        activePreset: 'eu_dsm_ietf_compliance',
        globalDisallowPaths: ['/subscriber-vault/', '/admin/', '/api/paywall/'],
        globalAllowPaths: ['/', '/reports/', '/benchmarks/'],
        enforceRfc9309InheritanceGuard: true,
        explicitlyAllowLlmsTxtInRobots: true,
        crawlDelaySeconds: 2,
        bots: baseBots,
        ietfContentUsage: {
            enabled: true,
            allowAiTraining: false,
            allowAiInference: true,
            allowSearchIndexing: true,
            disallowPathsForTraining: ['/'],
        },
        w3cTdmRep: {
            enabled: true,
            reservation: 1,
            policyUrl: 'https://www.quantumdigest.org/licensing/tdm-policy.json',
            contactEmail: 'licensing@quantumdigest.org',
            licenseSpdx: 'CC-BY-NC-ND-4.0',
        },
        deprecatedTokensDetected: [],
        links: [
            {
                id: 'link_m1',
                title: '2nm Gate-All-Around (GAA) Wafer Yield & Cost Model 2026',
                url: 'https://www.quantumdigest.org/reports/2nm-gaa-wafer-yield-model',
                description: 'Defect density curves, EUV high-NA lithography throughput, and die-per-wafer economics for 2nm nodes.',
                section: 'Guides & Tutorials',
                includedInLlmsTxt: true,
                includedInFullTxt: true,
                fullMarkdownContent: `### 2nm GAA Wafer Economics\n\nFull 300mm wafer processing cost reaches $24,800 at 72% parametric yield.`,
                priorityScore: 1.0,
            },
            {
                id: 'link_m2',
                title: 'Optical Co-Packaged Interconnects vs. Copper Backplanes Benchmark',
                url: 'https://www.quantumdigest.org/benchmarks/co-packaged-optics-interconnect',
                description: 'Picojoule-per-bit energy efficiency, tail latency at 1.6 Tbps, and thermal dissipation across GPU clusters.',
                section: 'Core Documentation',
                includedInLlmsTxt: true,
                includedInFullTxt: true,
                fullMarkdownContent: `### Co-Packaged Optics Benchmark\n\nReduces rack-to-rack switch power consumption by 41% at 1.6 Tbps link speeds.`,
                priorityScore: 0.95,
            },
            {
                id: 'link_m3',
                title: 'Commercial TDM Licensing & Enterprise Syndication Policy',
                url: 'https://www.quantumdigest.org/licensing/ai-syndication',
                description: 'W3C TDMRep machine-readable rights reservation and enterprise licensing terms for AI model builders.',
                section: 'Optional',
                includedInLlmsTxt: true,
                includedInFullTxt: false,
                fullMarkdownContent: `### AI Training & TDM Licensing\n\nAll rights reserved under Directive (EU) 2019/790 Article 4(3).`,
                priorityScore: 0.3,
            },
            {
                id: 'link_m4',
                title: 'HBM4 & 3D Stacked Memory Bandwidth Telemetry Dataset',
                url: 'https://www.quantumdigest.org/benchmarks/hbm4-memory-bandwidth-telemetry',
                description: 'Measured pin transfer speeds, TSV thermal resistance, and energy-per-bit curves across 2048-bit HBM4 stacks.',
                section: 'Core Documentation',
                includedInLlmsTxt: true,
                includedInFullTxt: true,
                fullMarkdownContent: `### HBM4 Memory Stack Telemetry\n\nSustained memory bandwidth reaches 2.05 TB/s per stack at 1.1V VDDQ.`,
                priorityScore: 0.9,
            },
            {
                id: 'link_m5',
                title: 'Methodology: Cleanroom Metrology & Wafer Probe Verification',
                url: 'https://www.quantumdigest.org/docs/metrology-methodology',
                description: 'Scanning electron microscopy (CD-SEM) calibration protocols and statistical wafer die sampling rules.',
                section: 'Guides & Tutorials',
                includedInLlmsTxt: true,
                includedInFullTxt: true,
                fullMarkdownContent: `### Cleanroom Metrology Methodology\n\nEvery benchmark aggregates measurements across 300+ production dies.`,
                priorityScore: 0.85,
            },
            {
                id: 'link_m6',
                title: 'Editorial Board, Peer Review Standards & Corrections Policy',
                url: 'https://www.quantumdigest.org/about/editorial-standards',
                description: 'Double-blind peer review workflow, conflict-of-interest disclosures, and errata archival policy.',
                section: 'Company & Policies',
                includedInLlmsTxt: true,
                includedInFullTxt: false,
                fullMarkdownContent: `### Editorial & Peer Review Standards\n\nAll hardware datasets undergo independent replication prior to publication.`,
                priorityScore: 0.5,
            },
        ],
    };
    return applyGeoPreset('eu_dsm_ietf_compliance', base);
}