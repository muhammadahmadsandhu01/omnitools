"use client";

import React, { useState, useRef, useMemo } from 'react';
import {
    Bot,
    ShieldCheck,
    ShieldAlert,
    Upload,
    Download,
    Search,
    AlertTriangle,
    CheckCircle2,
    Code2,
    FileSpreadsheet,
    FileCode,
    FileText,
    Sparkles,
    Layers,
    Cpu,
    Globe,
    Copy,
    Check,
    Plus,
    Trash2,
    Sliders,
    Info,
    Wrench,
    ChevronDown,
    ChevronUp,
    X,
} from 'lucide-react';

import {
    LLMS_ENGINE_VERSION,
    applyGeoPreset,
    humanizeUrlSlugToTitleAndDescription,
    parseSitemapXmlOrUrlList,
    convertHtmlToCleanMarkdown,
    parseExistingLlmsTxt,
    parseExistingRobotsTxt,
    autoFixGeoWorkspace,
    compileAllGeoDeliverables,
    isValidHttpUrl,
    exportGeoInventoryCsv,
    exportGeoInventoryXlsx,
    generateSampleGeoProject,
    type AiBotPermission,
    type GeoPresetId,
    type LlmsSectionCategory,
    type LlmsLinkItem,
    type GeoWorkspaceState,
} from '@/lib/llmsTxtGeneratorEngine';

type GeoWorkbenchTab =
    | 'llms_builder'
    | 'crawler_matrix'
    | 'validator_linter'
    | 'full_txt_compiler'
    | 'export_studio';

const GEO_PRESETS: {
    id: GeoPresetId;
    name: string;
    shortBadge: string;
    description: string;
}[] = [
        {
            id: 'geo_max_visibility',
            name: 'GEO Max Visibility',
            shortBadge: 'Allow Search • Block Training',
            description:
                'Allows AI Search & Citation bots (OAI-SearchBot, Claude-SearchBot, PerplexityBot) and live fetchers while blocking training crawlers (GPTBot, ClaudeBot, CCBot) with RFC 9309 protection.',
        },
        {
            id: 'open_source_max_reach',
            name: 'Open-Source & Docs Reach',
            shortBadge: 'Allow Search + Training',
            description:
                'Allows legitimate AI Search, Assistant, and Model Training crawlers so coding assistants learn your SDK and API syntax natively.',
        },
        {
            id: 'strict_copyright_shield',
            name: 'Strict Copyright Shield',
            shortBadge: 'Citation Only • TDM=1',
            description:
                'Blocks foundation model training, opt-out tokens (Google-Extended, Applebot-Extended), and bulk scrapers while enabling W3C TDMRep (1) and train-ai=n.',
        },
        {
            id: 'ecommerce_saas_funnel_guard',
            name: 'E-Commerce & SaaS Guard',
            shortBadge: 'Protect /cart & /checkout',
            description:
                'Exposes product catalogs and docs to AI search assistants while enforcing RFC 9309 Disallow inheritance on /checkout/, /cart/, /account/, /admin/, and /api/.',
        },
        {
            id: 'eu_dsm_ietf_compliance',
            name: 'EU DSM & IETF Signals',
            shortBadge: 'Content-Usage + TDMRep',
            description:
                'Generates synchronized robots.txt IETF AIPREF Content-Usage directives, W3C /.well-known/tdmrep.json, and ai.txt technical signals (not legal advice).',
        },
        {
            id: 'total_ai_lockdown',
            name: 'Total AI Lockdown',
            shortBadge: 'Block 42 AI • Keep 3 Search',
            description:
                'Blocks all 42 AI search, assistant, training, and scraping bots while keeping 3 core web search engines (Googlebot, bingbot, Applebot) allowed + X-Robots-Tag: noai.',
        },
    ];

const SAMPLE_GEO_PROJECTS: {
    id: 'saas_dev_platform' | 'ecommerce_storefront' | 'media_research_publisher';
    shortLabel: string;
    title: string;
    badge: string;
}[] = [
        {
            id: 'saas_dev_platform',
            shortLabel: 'AcmeCloud Docs',
            title: 'AcmeCloud Developer Platform & SDK',
            badge: '100/100 Valid',
        },
        {
            id: 'ecommerce_storefront',
            shortLabel: 'LuxeCart (Linter Demo)',
            title: 'LuxeCart E-Commerce Storefront (Linter Demo)',
            badge: 'Test Auto-Fix',
        },
        {
            id: 'media_research_publisher',
            shortLabel: 'QuantumDigest (TDMRep)',
            title: 'QuantumDigest Research Publisher',
            badge: 'TDMRep + AIPREF',
        },
    ];

const SECTION_OPTIONS: LlmsSectionCategory[] = [
    'Core Documentation',
    'API & SDK Reference',
    'Guides & Tutorials',
    'Product & Pricing',
    'Company & Policies',
    'Optional',
];

const SAMPLE_HTML_DOC_SNIPPET = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Webhooks & HMAC Signature Verification | AcmeCloud Docs</title>
  <meta name="description" content="Verify incoming AcmeCloud webhook payloads using SHA-256 HMAC signatures and replay-protection timestamps." />
  <link rel="canonical" href="https://docs.example.com/api/webhooks" />
</head>
<body>
  <nav>Top Navigation Menu — Home | Pricing | Login</nav>
  <main>
    <h1>Webhooks & HMAC Signature Verification</h1>
    <p>AcmeCloud signs every outbound webhook HTTP POST request using an <strong>HMAC-SHA256</strong> signature in the <code>X-Acme-Signature-256</code> header.</p>
    <h2>1. Verifying the Signature Header</h2>
    <p>Compare the computed digest against the header using a constant-time comparison function to prevent timing side-channel attacks:</p>
    <pre><code>const crypto = require('crypto');
function verifyWebhook(rawBody, secret, signatureHeader) {
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
}</code></pre>
    <h2>2. Retry Schedule & Idempotency</h2>
    <ul>
      <li>Retries up to 5 times with exponential backoff on HTTP 5xx or network timeout.</li>
      <li>Deduplicate events using the unique <code>X-Acme-Delivery-Id</code> UUID header.</li>
    </ul>
  </main>
  <footer>Copyright 2026 AcmeCloud Inc. All rights reserved.</footer>
</body>
</html>`;

const SAMPLE_SITEMAP_XML_SNIPPET = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://docs.example.com/docs/edge-kv-storage</loc>
    <lastmod>2026-10-29</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://docs.example.com/api/rate-limits-and-quotas</loc>
    <lastmod>2026-10-28</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://docs.example.com/guides/migrating-from-aws-lambda</loc>
    <lastmod>2026-10-25</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://docs.example.com/legal/dpa-subprocessors</loc>
    <lastmod>2026-10-10</lastmod>
    <priority>0.3</priority>
  </url>
</urlset>`;

const EXPORT_ITEMS = [
    { id: 'llms_txt' as const, label: 'llms.txt', sub: 'llmstxt.org v2 Index', file: 'llms.txt', mime: 'text/plain;charset=utf-8' },
    { id: 'llms_full_txt' as const, label: 'llms-full.txt', sub: 'Full Markdown Bundle', file: 'llms-full.txt', mime: 'text/plain;charset=utf-8' },
    { id: 'llms_ctx_txt' as const, label: 'llms-ctx.txt', sub: 'XML Prompt Context', file: 'llms-ctx.txt', mime: 'application/xml;charset=utf-8' },
    { id: 'robots_txt' as const, label: 'robots.txt', sub: 'RFC 9309 + AIPREF', file: 'robots.txt', mime: 'text/plain;charset=utf-8' },
    { id: 'ai_txt' as const, label: 'ai.txt', sub: 'AI Policy Directives', file: 'ai.txt', mime: 'text/plain;charset=utf-8' },
    { id: 'tdmrep_json' as const, label: 'tdmrep.json', sub: 'W3C /.well-known/', file: 'tdmrep.json', mime: 'application/json;charset=utf-8' },
    { id: 'nextjs_routes' as const, label: 'Next.js Routes', sub: 'route.ts & robots.ts', file: 'nextjs-llms-and-robots-routes.ts', mime: 'text/plain;charset=utf-8' },
    { id: 'edge_headers' as const, label: 'Edge Headers', sub: 'Cloudflare & Nginx', file: 'cloudflare-nginx-ai-headers.conf', mime: 'text/plain;charset=utf-8' },
    { id: 'markdown_guide' as const, label: 'Deploy Guide', sub: 'Checklist (.md)', file: 'geo-deployment-checklist.md', mime: 'text/markdown;charset=utf-8' },
    { id: 'certificate_json' as const, label: 'SHA-256 Cert', sub: 'Audit Digest (.json)', file: 'geo-sha256-compliance-certificate.json', mime: 'application/json;charset=utf-8' },
];

export default function LlmsTxtGenerator() {
    const [activeSampleId, setActiveSampleId] = useState<
        'saas_dev_platform' | 'ecommerce_storefront' | 'media_research_publisher' | null
    >('saas_dev_platform');

    const [workspace, setWorkspace] = useState<GeoWorkspaceState>(() =>
        generateSampleGeoProject('saas_dev_platform')
    );

    const [activeTab, setActiveTab] = useState<GeoWorkbenchTab>('llms_builder');
    const [statusBanner, setStatusBanner] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Progressive-disclosure UI panels (clean by default, 1-click expand)
    const [showSitemapDrawer, setShowSitemapDrawer] = useState<boolean>(false);
    const [showOverviewField, setShowOverviewField] = useState<boolean>(false);
    const [showAdvancedRobots, setShowAdvancedRobots] = useState<boolean>(false);
    const [showRobotsImport, setShowRobotsImport] = useState<boolean>(false);
    const [showPrivacyInfo, setShowPrivacyInfo] = useState<boolean>(false);

    // Tab 1: Sitemap / URL Import & New Link State
    const [sitemapInputText, setSitemapInputText] = useState<string>('');
    const [newLinkTitle, setNewLinkTitle] = useState<string>('');
    const [newLinkUrl, setNewLinkUrl] = useState<string>('');
    const [newLinkDesc, setNewLinkDesc] = useState<string>('');
    const [newLinkSection, setNewLinkSection] = useState<string>('Core Documentation');
    const [builderPreviewMode, setBuilderPreviewMode] = useState<'llms_txt' | 'llms_full_txt'>('llms_txt');

    // Tab 2: Crawler Matrix Filters & Custom Disallow Input
    const [botSearch, setBotSearch] = useState<string>('');
    const [botRoleFilter, setBotRoleFilter] = useState<string>('ALL');
    const [newDisallowPath, setNewDisallowPath] = useState<string>('');
    const [importRobotsText, setImportRobotsText] = useState<string>('');

    // Tab 3: Import existing llms.txt to validate
    const [importLlmsText, setImportLlmsText] = useState<string>('');

    // Tab 4: HTML-to-Markdown Compiler State
    const [htmlSourceInput, setHtmlSourceInput] = useState<string>(SAMPLE_HTML_DOC_SNIPPET);
    const [htmlPageUrl, setHtmlPageUrl] = useState<string>('https://docs.example.com/api/webhooks');
    const [htmlTargetSection, setHtmlTargetSection] = useState<string>('API & SDK Reference');

    // Tab 5: Export Studio Preview Format
    const [exportFormat, setExportFormat] = useState<(typeof EXPORT_ITEMS)[number]['id']>('llms_txt');
    const [copiedExport, setCopiedExport] = useState<boolean>(false);
    const [copiedBuilderPreview, setCopiedBuilderPreview] = useState<boolean>(false);
    const [copiedRobotsPreview, setCopiedRobotsPreview] = useState<boolean>(false);
    const [linkFormError, setLinkFormError] = useState<string | null>(null);
    const [recentlyAddedLinkId, setRecentlyAddedLinkId] = useState<string | null>(null);
    const [linkActionNotice, setLinkActionNotice] = useState<string | null>(null);
    const [sitemapActionNotice, setSitemapActionNotice] = useState<string | null>(null);
    const [htmlCompilerNotice, setHtmlCompilerNotice] = useState<string | null>(null);
    const [robotsImportNotice, setRobotsImportNotice] = useState<string | null>(null);
    const [llmsValidateNotice, setLlmsValidateNotice] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const linksListRef = useRef<HTMLDivElement | null>(null);

    // Compile all 10 deliverables, token budgets, and 12-point linter results synchronously in memory
    const compiled = useMemo(() => compileAllGeoDeliverables(workspace), [workspace]);

    const convertedHtmlPreview = useMemo(
        () => convertHtmlToCleanMarkdown(htmlSourceInput, htmlPageUrl),
        [htmlSourceInput, htmlPageUrl]
    );

    const filteredBots = useMemo(() => {
        return workspace.bots.filter((b) => {
            if (botRoleFilter !== 'ALL' && b.role !== botRoleFilter) return false;
            if (botSearch.trim()) {
                const q = botSearch.toLowerCase();
                return (
                    b.userAgent.toLowerCase().includes(q) ||
                    b.operator.toLowerCase().includes(q) ||
                    b.description.toLowerCase().includes(q)
                );
            }
            return true;
        });
    }, [workspace.bots, botRoleFilter, botSearch]);

    const allowedSearchBotsCount = useMemo(
        () =>
            workspace.bots.filter(
                (b) => b.role === 'AI_SEARCH_CITATION' && b.permission === 'ALLOW'
            ).length,
        [workspace.bots]
    );

    const totalSearchBotsCount = useMemo(
        () => workspace.bots.filter((b) => b.role === 'AI_SEARCH_CITATION').length,
        [workspace.bots]
    );

    const allowedFetchersCount = useMemo(
        () =>
            workspace.bots.filter(
                (b) => b.role === 'USER_TRIGGERED_FETCHER' && b.permission === 'ALLOW'
            ).length,
        [workspace.bots]
    );

    const totalFetchersCount = useMemo(
        () => workspace.bots.filter((b) => b.role === 'USER_TRIGGERED_FETCHER').length,
        [workspace.bots]
    );

    const isSiteUrlValid = useMemo(
        () => !workspace.siteUrl.trim() || isValidHttpUrl(workspace.siteUrl),
        [workspace.siteUrl]
    );

    const blockedTrainingAndScrapersCount = useMemo(
        () =>
            workspace.bots.filter(
                (b) =>
                    (b.role === 'MODEL_TRAINING_SCRAPER' ||
                        b.role === 'USAGE_OPT_OUT_TOKEN' ||
                        b.role === 'BULK_DATASET_SCRAPER') &&
                    b.permission === 'BLOCK'
            ).length,
        [workspace.bots]
    );

    const totalTrainingAndScrapersCount = useMemo(
        () =>
            workspace.bots.filter(
                (b) =>
                    b.role === 'MODEL_TRAINING_SCRAPER' ||
                    b.role === 'USAGE_OPT_OUT_TOKEN' ||
                    b.role === 'BULK_DATASET_SCRAPER'
            ).length,
        [workspace.bots]
    );

    const handleSelectSample = (
        sampleId: 'saas_dev_platform' | 'ecommerce_storefront' | 'media_research_publisher'
    ) => {
        setErrorMessage(null);
        setLinkFormError(null);
        const nextWorkspace = generateSampleGeoProject(sampleId);
        setActiveSampleId(sampleId);
        setWorkspace(nextWorkspace);

        if (sampleId === 'saas_dev_platform') {
            setStatusBanner('Loaded AcmeCloud Docs sample (8 links, 100/100 score).');
        } else if (sampleId === 'ecommerce_storefront') {
            setStatusBanner('Loaded LuxeCart Linter Demo — open Validator & Tokens to test 1-Click Auto-Fix.');
        } else {
            setStatusBanner('Loaded QuantumDigest Publisher sample (W3C TDMRep + IETF train-ai=n).');
        }
    };

    const handlePresetSelect = (presetId: GeoPresetId) => {
        setWorkspace((prev) => applyGeoPreset(presetId, prev));
        const presetName = GEO_PRESETS.find((p) => p.id === presetId)?.name ?? presetId;
        setStatusBanner(`Applied "${presetName}" policy across all 45 bots.`);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setErrorMessage(null);
        try {
            const text = await file.text();
            const lowerName = file.name.toLowerCase();
            setActiveSampleId(null);

            if (lowerName.includes('robots')) {
                const parsedRobots = parseExistingRobotsTxt(text, workspace.bots);
                setWorkspace((prev) => ({
                    ...prev,
                    bots: parsedRobots.updatedBots,
                    globalDisallowPaths: parsedRobots.globalDisallowPaths,
                    sitemapUrl: parsedRobots.sitemapUrl || prev.sitemapUrl,
                    deprecatedTokensDetected: parsedRobots.deprecatedTokensDetected,
                }));
                setActiveTab('crawler_matrix');
                setRobotsImportNotice(`Imported "${file.name}" into the 45-Bot AI Crawler Matrix.`);
                setStatusBanner(`Imported "${file.name}" into AI Bots & robots.txt.`);
            } else if (lowerName.endsWith('.xml') || /<(?:urlset|sitemapindex|rss|feed)\b/i.test(text)) {
                const extractedLinks = parseSitemapXmlOrUrlList(text, workspace.siteUrl, workspace.projectName);
                if (extractedLinks.length === 0) {
                    setErrorMessage('No valid <loc> URLs found in the uploaded XML sitemap.');
                } else {
                    setWorkspace((prev) => ({ ...prev, links: extractedLinks }));
                    setActiveTab('llms_builder');
                    setSitemapActionNotice(`Imported ${extractedLinks.length} URLs from "${file.name}".`);
                    setStatusBanner(`Imported ${extractedLinks.length} URLs from "${file.name}" into Builder.`);
                }
            } else if (lowerName.endsWith('.html') || lowerName.endsWith('.htm') || /<html\b/i.test(text)) {
                setHtmlSourceInput(text);
                setActiveTab('full_txt_compiler');
                setHtmlCompilerNotice(`Loaded "${file.name}" into HTML → Markdown Compiler.`);
                setStatusBanner(`Loaded "${file.name}" into HTML → Markdown Compiler.`);
            } else {
                const parsedLlms = parseExistingLlmsTxt(text, workspace.siteUrl);
                if (parsedLlms.links.length === 0 && !text.trim().startsWith('#')) {
                    setErrorMessage(
                        `Could not find valid llms.txt Markdown links or XML <loc> URLs in "${file.name}". Please upload a sitemap.xml, llms.txt, robots.txt, or HTML file.`
                    );
                } else {
                    setWorkspace((prev) => ({
                        ...prev,
                        projectName:
                            parsedLlms.projectName && parsedLlms.projectName !== 'Untitled Project'
                                ? parsedLlms.projectName
                                : prev.projectName,
                        summaryBlockquote: parsedLlms.summaryBlockquote || prev.summaryBlockquote,
                        overviewParagraphs:
                            parsedLlms.overviewParagraphs.length > 0 ? parsedLlms.overviewParagraphs : prev.overviewParagraphs,
                        links: parsedLlms.links.length > 0 ? parsedLlms.links : prev.links,
                    }));
                    setActiveTab('llms_builder');
                    setLinkActionNotice(`Imported "${file.name}" (${parsedLlms.links.length} links parsed).`);
                    setStatusBanner(`Imported "${file.name}" (${parsedLlms.links.length} links).`);
                }
            }
        } catch (err: unknown) {
            setErrorMessage(err instanceof Error ? err.message : 'Unable to read uploaded file.');
        }
        e.target.value = '';
    };

    const handleImportSitemapOrUrls = (appendMode: boolean) => {
        setErrorMessage(null);
        const sourceText = sitemapInputText.trim() || SAMPLE_SITEMAP_XML_SNIPPET;
        const usedDemo = !sitemapInputText.trim();
        const extracted = parseSitemapXmlOrUrlList(sourceText, workspace.siteUrl, workspace.projectName);
        if (extracted.length === 0) {
            setSitemapActionNotice('No valid URLs or XML <loc> entries found in the pasted text.');
            setErrorMessage('No valid URLs or XML <loc> entries found in the pasted text.');
            return;
        }
        setWorkspace((prev) => {
            if (!appendMode) {
                return { ...prev, links: extracted };
            }
            const existingUrls = new Set(prev.links.map((l) => l.url.trim().replace(/\/+$/, '').toLowerCase()));
            const uniqueNew = extracted.filter((l) => !existingUrls.has(l.url.trim().replace(/\/+$/, '').toLowerCase()));
            return {
                ...prev,
                links: [...uniqueNew, ...prev.links],
            };
        });
        setSitemapInputText('');
        if (extracted.length > 0) {
            setRecentlyAddedLinkId(extracted[0].id);
            linksListRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
        const msg = usedDemo
            ? `Loaded demo sitemap and ${appendMode ? 'prepended' : 'imported'} ${extracted.length} URL(s).`
            : `${appendMode ? 'Prepended' : 'Replaced with'} ${extracted.length} URL(s) across H2 sections.`;
        setSitemapActionNotice(msg);
        setLinkActionNotice(msg);
        setStatusBanner(msg);
    };

    const handleAddManualLink = () => {
        setErrorMessage(null);
        setLinkFormError(null);
        const rawBase = (workspace.siteUrl || 'https://docs.example.com').trim().replace(/\/+$/, '');
        const cleanBase = isValidHttpUrl(rawBase) ? rawBase : 'https://docs.example.com';
        const rawTitle = newLinkTitle.trim();
        const rawUrl = newLinkUrl.trim();
        const rawDesc = newLinkDesc.trim();

        if (!rawUrl && !rawTitle) {
            const msg = 'Enter a target page URL (e.g., https://docs.example.com/api or /docs/api) or a link title before adding.';
            setLinkFormError(msg);
            setErrorMessage(msg);
            return;
        }

        let resolvedUrl = rawUrl;
        if (!resolvedUrl) {
            const slug =
                rawTitle
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '') || `page-${workspace.links.length + 1}`;
            resolvedUrl = `${cleanBase}/docs/${slug}`;
        } else if (resolvedUrl.startsWith('/')) {
            if (/\s/.test(resolvedUrl)) {
                const msg = 'Invalid relative path: remove spaces from the URL path (e.g., /docs/webhooks).';
                setLinkFormError(msg);
                setErrorMessage(msg);
                return;
            }
            resolvedUrl = `${cleanBase}${resolvedUrl}`;
        } else if (/^[a-z0-9+.-]*[!@#$%^&*()\s].*:/i.test(resolvedUrl) || /\s/.test(resolvedUrl)) {
            const msg = `Invalid URL "${rawUrl}". Enter a valid https:// URL or a /path without spaces or invalid scheme characters.`;
            setLinkFormError(msg);
            setErrorMessage(msg);
            return;
        } else if (!/^https?:\/\//i.test(resolvedUrl)) {
            if (/^[a-z][a-z0-9+.-]*:/i.test(resolvedUrl)) {
                const msg = `Unsupported URL scheme in "${rawUrl}". Use http:// or https:// URLs only.`;
                setLinkFormError(msg);
                setErrorMessage(msg);
                return;
            }
            resolvedUrl = `https://${resolvedUrl}`;
        }

        if (!isValidHttpUrl(resolvedUrl)) {
            const msg = `Invalid URL "${rawUrl}". Enter a complete https://domain.com/path URL (e.g., https://docs.example.com/api/auth).`;
            setLinkFormError(msg);
            setErrorMessage(msg);
            return;
        }

        const inferred = humanizeUrlSlugToTitleAndDescription(resolvedUrl, workspace.projectName || 'Platform');
        const finalTitle = rawTitle || inferred.title || `Documentation Page #${workspace.links.length + 1}`;
        const finalDesc = rawDesc || inferred.description || `Technical reference and implementation details for ${finalTitle}.`;
        const finalSection = newLinkSection || inferred.section || 'Core Documentation';

        const newItemId = `link_manual_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const newItem: LlmsLinkItem = {
            id: newItemId,
            title: finalTitle,
            url: resolvedUrl,
            description: finalDesc,
            section: finalSection,
            includedInLlmsTxt: true,
            includedInFullTxt: finalSection.toLowerCase() !== 'optional',
            fullMarkdownContent: `### ${finalTitle}\n\nSource: ${resolvedUrl}\n\n${finalDesc}`,
            priorityScore: finalSection.toLowerCase() === 'optional' ? 0.3 : 0.85,
            lastModified: new Date().toISOString().slice(0, 10),
        };

        setWorkspace((prev) => ({ ...prev, links: [newItem, ...prev.links] }));
        setRecentlyAddedLinkId(newItemId);
        setNewLinkTitle('');
        setNewLinkUrl('');
        setNewLinkDesc('');
        linksListRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

        const msg = `Added "${newItem.title}" under ## ${newItem.section}.`;
        setLinkActionNotice(msg);
        setStatusBanner(msg);
    };

    const handleAppendConvertedHtmlToFullTxt = () => {
        const item = convertedHtmlPreview;
        const newId = `link_html_${Date.now()}`;
        const newLink: LlmsLinkItem = {
            id: newId,
            title: item.title,
            url: item.url,
            description: item.description,
            section: htmlTargetSection,
            includedInLlmsTxt: true,
            includedInFullTxt: true,
            fullMarkdownContent: item.markdownBody,
            priorityScore: 0.9,
            lastModified: new Date().toISOString().slice(0, 10),
        };
        setWorkspace((prev) => ({ ...prev, links: [newLink, ...prev.links] }));
        setRecentlyAddedLinkId(newId);
        const msg = `Added "${item.title}" (~${item.estimatedTokens} tokens) to llms.txt & llms-full.txt.`;
        setHtmlCompilerNotice(msg);
        setLinkActionNotice(msg);
        setStatusBanner(msg);
    };

    const triggerDownload = (content: string | Uint8Array, filename: string, mimeType: string) => {
        const blobPart: BlobPart =
            content instanceof Uint8Array ? (content.buffer as ArrayBuffer) : content;
        const blob = new Blob([blobPart], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setStatusBanner(`Downloaded "${filename}".`);
    };

    const activeExportText = useMemo(() => {
        if (exportFormat === 'llms_txt') return compiled.llmsTxt;
        if (exportFormat === 'llms_full_txt') return compiled.llmsFullTxt;
        if (exportFormat === 'llms_ctx_txt') return compiled.llmsCtxTxt;
        if (exportFormat === 'robots_txt') return compiled.robotsTxt;
        if (exportFormat === 'ai_txt') return compiled.aiTxt;
        if (exportFormat === 'tdmrep_json') return compiled.tdmRepJson;
        if (exportFormat === 'nextjs_routes') return compiled.nextJsRoutesTs;
        if (exportFormat === 'edge_headers') return compiled.edgeHeadersConfig;
        if (exportFormat === 'markdown_guide') return compiled.markdownImplementationGuide;
        return compiled.complianceCertificateJson;
    }, [exportFormat, compiled]);

    const activeExportMeta = useMemo(
        () => EXPORT_ITEMS.find((i) => i.id === exportFormat) ?? EXPORT_ITEMS[0],
        [exportFormat]
    );

    const scoreColorClass =
        compiled.healthScore >= 85
            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/70'
            : compiled.healthScore >= 60
                ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/70'
                : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/70';

    return (
        <div className="w-full min-w-0 max-w-full space-y-4 text-slate-900 dark:text-slate-100">
            {/* ==========================================================================
                CLEAN WORKSPACE HEADER BAR (FOCUSED, UNCLUTTERED, ABOVE THE FOLD)
                ========================================================================== */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/95 shadow-xs overflow-hidden">
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                llms.txt &amp; AI Crawler Studio
                            </h2>
                            <button
                                type="button"
                                onClick={() => setActiveTab('validator_linter')}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition hover:opacity-90 cursor-pointer ${scoreColorClass}`}
                                title="View 12-Point Validator & Token Budget"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                <span>
                                    Score {compiled.healthScore}/100
                                    {compiled.lintIssues.length > 0 ? ` • ${compiled.lintIssues.length} Alert(s)` : ' • Valid'}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowPrivacyInfo((v) => !v)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition cursor-pointer"
                                title="Standards & local browser privacy details"
                            >
                                <Info className="w-3 h-3" />
                                <span>Local v{LLMS_ENGINE_VERSION}</span>
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Build, validate, and auto-fix <code>llms.txt</code>, free <code>llms-full.txt</code>, and 45-bot AI{' '}
                            <code>robots.txt</code> locally—ideal for staging docs and zero-CORS workflows.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt,.md,.xml,.html,.htm,.json"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 transition cursor-pointer"
                        >
                            <Upload className="w-3.5 h-3.5 shrink-0" />
                            <span>Import File</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => triggerDownload(compiled.llmsTxt, 'llms.txt', 'text/plain;charset=utf-8')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5 shrink-0" />
                            <span>Download llms.txt</span>
                        </button>
                    </div>
                </div>

                {/* Compact Sample Switcher & Live Telemetry Strip */}
                <div className="px-4 sm:px-5 py-2.5 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1">
                            Samples:
                        </span>
                        {SAMPLE_GEO_PROJECTS.map((s) => {
                            const isSelected = activeSampleId === s.id;
                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => handleSelectSample(s.id)}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${isSelected
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                                        }`}
                                >
                                    <span>{s.shortLabel}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                        <span>
                            <strong className="text-slate-900 dark:text-white">~{compiled.tokenBudget.llmsTxtTokens.toLocaleString()}</strong> tok index
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span>
                            <strong className="text-indigo-600 dark:text-indigo-400">~{compiled.tokenBudget.llmsFullTxtTokens.toLocaleString()}</strong> tok full
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span>
                            <strong className="text-emerald-600 dark:text-emerald-400">
                                {allowedSearchBotsCount + allowedFetchersCount}/{totalSearchBotsCount + totalFetchersCount}
                            </strong>{' '}
                            Search
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span>
                            <strong className="text-rose-600 dark:text-rose-400">
                                {blockedTrainingAndScrapersCount}/{totalTrainingAndScrapersCount}
                            </strong>{' '}
                            Blocked
                        </span>
                        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
                        <span className="hidden sm:inline">
                            RFC 9309:{' '}
                            <strong className={workspace.enforceRfc9309InheritanceGuard ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                                {workspace.enforceRfc9309InheritanceGuard ? 'Safe' : 'Risk'}
                            </strong>
                        </span>
                    </div>
                </div>

                {/* Collapsible Privacy & Standards Info */}
                {showPrivacyInfo && (
                    <div className="px-4 sm:px-5 py-3 bg-indigo-50/50 dark:bg-indigo-950/30 border-t border-indigo-100 dark:border-indigo-900/50 text-xs text-slate-600 dark:text-slate-300 flex items-start justify-between gap-3">
                        <div className="space-y-1 leading-relaxed">
                            <p>
                                <strong>Local Browser Execution:</strong> Your pasted sitemaps, HTML, and configuration files are
                                processed locally in browser memory and are not uploaded to KivaroTools servers (the page itself may
                                load standard analytics).
                            </p>
                            <p>
                                <strong>Standards:</strong> Supports <code>llmstxt.org</code> v2, RFC 9309 §2.2.1 Disallow
                                inheritance, IETF AIPREF <code>Content-Usage</code>, and W3C <code>/.well-known/tdmrep.json</code>{' '}
                                (technical signals only, not legal advice).
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPrivacyInfo(false)}
                            className="p-1 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 shrink-0 cursor-pointer"
                            aria-label="Close privacy info"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Subtle Inline Feedback / Error Toast */}
            {errorMessage && (
                <div
                    role="alert"
                    className="rounded-xl border border-rose-200 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/50 px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-200"
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span className="break-words font-medium">{errorMessage}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setErrorMessage(null)}
                        className="text-rose-600 dark:text-rose-300 hover:underline font-semibold shrink-0 cursor-pointer"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {statusBanner && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/80 dark:bg-emerald-950/40 px-4 py-2 flex items-center justify-between gap-2 text-xs text-emerald-900 dark:text-emerald-200">
                    <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate font-medium">{statusBanner}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setStatusBanner(null)}
                        className="text-emerald-700 dark:text-emerald-300 hover:underline font-semibold shrink-0 cursor-pointer"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* ==========================================================================
                STREAMLINED 5-TAB SEGMENTED NAVIGATION
                ========================================================================== */}
            <div
                role="tablist"
                aria-label="llms.txt Studio Tabs"
                className="p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-1.5"
            >
                {(
                    [
                        {
                            id: 'llms_builder' as const,
                            label: 'Builder',
                            icon: FileText,
                            badge: `${workspace.links.length}`,
                            badgeTone: 'neutral',
                        },
                        {
                            id: 'crawler_matrix' as const,
                            label: 'AI Bots & robots.txt',
                            icon: Bot,
                            badge: `${workspace.bots.length}`,
                            badgeTone: 'neutral',
                        },
                        {
                            id: 'validator_linter' as const,
                            label: 'Validator & Tokens',
                            icon: ShieldAlert,
                            badge: compiled.lintIssues.length === 0 ? '✓' : `${compiled.lintIssues.length}`,
                            badgeTone: compiled.lintIssues.length === 0 ? 'good' : 'warn',
                        },
                        {
                            id: 'full_txt_compiler' as const,
                            label: 'HTML → Markdown',
                            icon: Layers,
                            badge: 'Free',
                            badgeTone: 'neutral',
                        },
                        {
                            id: 'export_studio' as const,
                            label: 'Exports',
                            icon: Code2,
                            badge: '10',
                            badgeTone: 'neutral',
                        },
                    ] as const
                ).map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={isActive}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${isActive
                                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-slate-200/80 dark:ring-slate-700'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/50'
                                }`}
                        >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{tab.label}</span>
                            <span
                                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold shrink-0 ${tab.badgeTone === 'warn'
                                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                        : tab.badgeTone === 'good'
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                            : isActive
                                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300'
                                                : 'bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                    }`}
                            >
                                {tab.badge}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ==========================================================================
                TAB 1: VISUAL BUILDER (CALM 2-COLUMN SPLIT + STICKY LIVE PREVIEW)
                ========================================================================== */}
            {activeTab === 'llms_builder' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Left Column: Site Details + Curated Links */}
                    <div className="min-w-0 lg:col-span-7 space-y-4">
                        {/* Card 1: Site Details */}
                        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-3.5">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                    <span>Site Details</span>
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowOverviewField((v) => !v)}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                >
                                    <span>{showOverviewField ? 'Hide overview paragraph' : '+ Optional overview'}</span>
                                    {showOverviewField ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                    <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        Site / Project Name (<code># H1</code>)
                                    </label>
                                    <input
                                        type="text"
                                        value={workspace.projectName}
                                        onChange={(e) => setWorkspace((p) => ({ ...p, projectName: e.target.value }))}
                                        placeholder="e.g. AcmeCloud Documentation"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        Canonical Base URL
                                    </label>
                                    <input
                                        type="text"
                                        value={workspace.siteUrl}
                                        onChange={(e) => setWorkspace((p) => ({ ...p, siteUrl: e.target.value }))}
                                        placeholder="https://docs.example.com"
                                        aria-invalid={!isSiteUrlValid}
                                        className={`w-full px-3 py-2 rounded-xl border bg-slate-50/70 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 font-mono outline-none transition ${!isSiteUrlValid
                                                ? 'border-rose-500 focus:border-rose-500'
                                                : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                                            }`}
                                    />
                                    {!isSiteUrlValid && (
                                        <p className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                                            Enter a valid https:// URL without spaces or invalid scheme characters.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="text-xs">
                                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                                    Short Summary (<code>&gt; blockquote</code>)
                                </label>
                                <textarea
                                    rows={2}
                                    value={workspace.summaryBlockquote}
                                    onChange={(e) => setWorkspace((p) => ({ ...p, summaryBlockquote: e.target.value }))}
                                    placeholder="Concise 1–2 sentence factual summary of what your site covers..."
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 outline-none transition"
                                />
                            </div>

                            {(showOverviewField || workspace.overviewParagraphs.length > 0) && showOverviewField && (
                                <div className="text-xs pt-1">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <label className="block font-medium text-slate-600 dark:text-slate-400">
                                            Optional Overview Paragraph (Before <code>## H2</code> Sections)
                                        </label>
                                        {workspace.overviewParagraphs.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setWorkspace((p) => ({ ...p, overviewParagraphs: [] }))}
                                                className="text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                    <textarea
                                        rows={2}
                                        value={workspace.overviewParagraphs.join('\n\n')}
                                        onChange={(e) =>
                                            setWorkspace((p) => ({
                                                ...p,
                                                overviewParagraphs: e.target.value ? e.target.value.split(/\n{2,}/) : [],
                                            }))
                                        }
                                        placeholder="Optional 1–2 paragraph technical overview..."
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 outline-none transition"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Card 2: Curated Links + Collapsible Sitemap Importer */}
                        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-4 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Pages &amp; Sections ({workspace.links.length})
                                </h3>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setShowSitemapDrawer((v) => !v)}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${showSitemapDrawer
                                                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                                            }`}
                                    >
                                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                        <span>{showSitemapDrawer ? 'Hide Sitemap Import' : 'Paste Sitemap / URLs'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setWorkspace((p) => ({
                                                ...p,
                                                links: p.links.map((l) => ({ ...l, includedInLlmsTxt: true })),
                                            }));
                                            setLinkActionNotice('Enabled all links for llms.txt.');
                                        }}
                                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                                    >
                                        All llms.txt
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setWorkspace((p) => ({
                                                ...p,
                                                links: p.links.map((l) => ({
                                                    ...l,
                                                    includedInFullTxt: l.section.toLowerCase() !== 'optional',
                                                })),
                                            }));
                                            setLinkActionNotice('Enabled primary links for llms-full.txt.');
                                        }}
                                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                                    >
                                        Primary full.txt
                                    </button>
                                </div>
                            </div>

                            {/* Collapsible Sitemap XML / Bulk URL Importer */}
                            {showSitemapDrawer && (
                                <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/25 border border-indigo-200/80 dark:border-indigo-800/60 space-y-2.5">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                            Paste <code>sitemap.xml</code>, RSS XML, or Newline URLs (up to 5,000 locally)
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setSitemapInputText(SAMPLE_SITEMAP_XML_SNIPPET)}
                                            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                        >
                                            Load Demo XML
                                        </button>
                                    </div>
                                    <textarea
                                        rows={3}
                                        value={sitemapInputText}
                                        onChange={(e) => setSitemapInputText(e.target.value)}
                                        placeholder="Paste <urlset>...</urlset>, RSS XML, or one https:// URL per line..."
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-[11px] outline-none focus:border-indigo-500"
                                    />
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleImportSitemapOrUrls(true)}
                                            className="px-3 py-1.5 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
                                        >
                                            + Append URLs
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleImportSitemapOrUrls(false)}
                                            className="px-3 py-1.5 rounded-lg font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 transition cursor-pointer"
                                        >
                                            Replace Links
                                        </button>
                                        {!sitemapInputText.trim() && (
                                            <span className="text-[11px] text-slate-500">
                                                Leave blank to test with 4 demo URLs
                                            </span>
                                        )}
                                    </div>
                                    {sitemapActionNotice && (
                                        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-[11px] font-medium text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-2">
                                            <span>✓ {sitemapActionNotice}</span>
                                            <button
                                                type="button"
                                                onClick={() => setSitemapActionNotice(null)}
                                                className="hover:underline cursor-pointer"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Clean Add Link Bar */}
                            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                    <div className="sm:col-span-5">
                                        <input
                                            type="text"
                                            value={newLinkTitle}
                                            onChange={(e) => setNewLinkTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddManualLink();
                                                }
                                            }}
                                            placeholder="Page title (e.g. REST API Auth)"
                                            aria-label="New link title"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                    <div className="sm:col-span-7">
                                        <input
                                            type="text"
                                            value={newLinkUrl}
                                            onChange={(e) => setNewLinkUrl(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddManualLink();
                                                }
                                            }}
                                            placeholder="https://docs.example.com/api/auth or /docs/auth"
                                            aria-label="New link URL"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                    <div className="sm:col-span-6">
                                        <input
                                            type="text"
                                            value={newLinkDesc}
                                            onChange={(e) => setNewLinkDesc(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddManualLink();
                                                }
                                            }}
                                            placeholder="Short description (optional — auto-inferred)"
                                            aria-label="New link description"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                    <div className="sm:col-span-4">
                                        <select
                                            value={newLinkSection}
                                            onChange={(e) => setNewLinkSection(e.target.value)}
                                            aria-label="Target H2 section"
                                            className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium outline-none focus:border-indigo-500"
                                        >
                                            {SECTION_OPTIONS.map((sec) => (
                                                <option key={sec} value={sec}>
                                                    ## {sec}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <button
                                            type="button"
                                            onClick={handleAddManualLink}
                                            className="w-full px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold inline-flex items-center justify-center gap-1 transition cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5 shrink-0" />
                                            <span>Add</span>
                                        </button>
                                    </div>
                                </div>

                                {linkFormError && (
                                    <div
                                        role="alert"
                                        className="rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 px-3 py-2 text-[11px] font-medium text-rose-800 dark:text-rose-200 flex items-center justify-between gap-2"
                                    >
                                        <span>⚠ {linkFormError}</span>
                                        <button
                                            type="button"
                                            onClick={() => setLinkFormError(null)}
                                            className="hover:underline shrink-0 cursor-pointer"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                )}

                                {linkActionNotice && (
                                    <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 text-[11px] font-medium text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-2">
                                        <span>✓ {linkActionNotice}</span>
                                        <button
                                            type="button"
                                            onClick={() => setLinkActionNotice(null)}
                                            className="hover:underline shrink-0 cursor-pointer"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Curated Links List */}
                            <div ref={linksListRef} className="max-h-[480px] overflow-y-auto space-y-2.5 pr-1">
                                {workspace.links.map((link, idx) => (
                                    <div
                                        key={link.id}
                                        className={`p-3 rounded-xl border transition space-y-2 ${recentlyAddedLinkId === link.id
                                                ? 'border-emerald-400 dark:border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                                                : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700'
                                            }`}
                                    >
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-mono text-[11px] font-semibold text-slate-400 w-5 text-center shrink-0">
                                                {idx + 1}
                                            </span>
                                            <input
                                                type="text"
                                                value={link.title}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setWorkspace((p) => ({
                                                        ...p,
                                                        links: p.links.map((x) => (x.id === link.id ? { ...x, title: val } : x)),
                                                    }));
                                                }}
                                                className="min-w-0 flex-1 font-semibold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-500 px-1 py-0.5 outline-none"
                                            />
                                            <select
                                                value={link.section}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setWorkspace((p) => ({
                                                        ...p,
                                                        links: p.links.map((x) => (x.id === link.id ? { ...x, section: val } : x)),
                                                    }));
                                                }}
                                                className="px-2 py-1 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium border border-indigo-200/60 dark:border-indigo-800/60 outline-none"
                                            >
                                                {SECTION_OPTIONS.map((sec) => (
                                                    <option key={sec} value={sec}>
                                                        ## {sec}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    type="button"
                                                    disabled={idx === 0}
                                                    title="Move up"
                                                    onClick={() =>
                                                        setWorkspace((p) => {
                                                            if (idx === 0) return p;
                                                            const next = [...p.links];
                                                            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                                                            return { ...p, links: next };
                                                        })
                                                    }
                                                    className="px-1.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-[11px] cursor-pointer"
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={idx === workspace.links.length - 1}
                                                    title="Move down"
                                                    onClick={() =>
                                                        setWorkspace((p) => {
                                                            if (idx >= p.links.length - 1) return p;
                                                            const next = [...p.links];
                                                            [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                                                            return { ...p, links: next };
                                                        })
                                                    }
                                                    className="px-1.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-[11px] cursor-pointer"
                                                >
                                                    ↓
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Remove link"
                                                    onClick={() =>
                                                        setWorkspace((p) => ({
                                                            ...p,
                                                            links: p.links.filter((x) => x.id !== link.id),
                                                        }))
                                                    }
                                                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-0 sm:pl-7">
                                            <input
                                                type="text"
                                                value={link.url}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setWorkspace((p) => ({
                                                        ...p,
                                                        links: p.links.map((x) => (x.id === link.id ? { ...x, url: val } : x)),
                                                    }));
                                                }}
                                                className="w-full font-mono text-[11px] text-indigo-600 dark:text-indigo-400 bg-slate-50/70 dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200/70 dark:border-slate-800 outline-none focus:border-indigo-500"
                                            />
                                            <input
                                                type="text"
                                                value={link.description}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setWorkspace((p) => ({
                                                        ...p,
                                                        links: p.links.map((x) => (x.id === link.id ? { ...x, description: val } : x)),
                                                    }));
                                                }}
                                                className="w-full text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200/70 dark:border-slate-800 outline-none focus:border-indigo-500"
                                            />
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-2 pl-0 sm:pl-7 pt-0.5 text-[11px]">
                                            <div className="flex items-center gap-3">
                                                <label className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={link.includedInLlmsTxt}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setWorkspace((p) => ({
                                                                ...p,
                                                                links: p.links.map((x) =>
                                                                    x.id === link.id ? { ...x, includedInLlmsTxt: checked } : x
                                                                ),
                                                            }));
                                                        }}
                                                        className="rounded text-indigo-600"
                                                    />
                                                    <span>llms.txt</span>
                                                </label>
                                                <label className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={link.includedInFullTxt}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setWorkspace((p) => ({
                                                                ...p,
                                                                links: p.links.map((x) =>
                                                                    x.id === link.id ? { ...x, includedInFullTxt: checked } : x
                                                                ),
                                                            }));
                                                        }}
                                                        className="rounded text-indigo-600"
                                                    />
                                                    <span>llms-full.txt</span>
                                                </label>
                                            </div>
                                            <details className="text-[11px] text-slate-500 dark:text-slate-400 w-full">
                                                <summary className="cursor-pointer font-medium text-indigo-600 dark:text-indigo-400 select-none">
                                                    Edit full Markdown body
                                                </summary>
                                                <textarea
                                                    rows={3}
                                                    value={link.fullMarkdownContent}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setWorkspace((p) => ({
                                                            ...p,
                                                            links: p.links.map((x) =>
                                                                x.id === link.id ? { ...x, fullMarkdownContent: val } : x
                                                            ),
                                                        }));
                                                    }}
                                                    className="mt-1.5 w-full font-mono text-[11px] p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:border-indigo-500"
                                                />
                                            </details>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sticky Live Preview */}
                    <div className="min-w-0 lg:col-span-5 lg:sticky lg:top-6">
                        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="inline-flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setBuilderPreviewMode('llms_txt')}
                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${builderPreviewMode === 'llms_txt'
                                                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                                                : 'text-slate-600 dark:text-slate-400'
                                            }`}
                                    >
                                        llms.txt
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBuilderPreviewMode('llms_full_txt')}
                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${builderPreviewMode === 'llms_full_txt'
                                                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                                                : 'text-slate-600 dark:text-slate-400'
                                            }`}
                                    >
                                        llms-full.txt
                                    </button>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const txt = builderPreviewMode === 'llms_txt' ? compiled.llmsTxt : compiled.llmsFullTxt;
                                            void navigator.clipboard?.writeText(txt);
                                            setCopiedBuilderPreview(true);
                                            setTimeout(() => setCopiedBuilderPreview(false), 2000);
                                            setStatusBanner(
                                                `Copied ${builderPreviewMode === 'llms_txt' ? 'llms.txt' : 'llms-full.txt'} to clipboard.`
                                            );
                                        }}
                                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white inline-flex items-center gap-1 transition cursor-pointer"
                                    >
                                        {copiedBuilderPreview ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                        )}
                                        <span>{copiedBuilderPreview ? 'Copied!' : 'Copy'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            triggerDownload(
                                                builderPreviewMode === 'llms_txt' ? compiled.llmsTxt : compiled.llmsFullTxt,
                                                builderPreviewMode === 'llms_txt' ? 'llms.txt' : 'llms-full.txt',
                                                'text/plain;charset=utf-8'
                                            )
                                        }
                                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white inline-flex items-center gap-1 transition cursor-pointer"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Download</span>
                                    </button>
                                </div>
                            </div>

                            <pre className="rounded-xl bg-slate-950 text-emerald-300 p-4 font-mono text-xs overflow-x-auto max-w-full max-h-[620px] whitespace-pre-wrap break-words leading-relaxed">
                                {builderPreviewMode === 'llms_txt' ? compiled.llmsTxt : compiled.llmsFullTxt}
                            </pre>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                                <span>
                                    {compiled.tokenBudget.llmsTxtWords} words • {compiled.tokenBudget.optionalSectionPercent}% in ## Optional
                                </span>
                                <span className="font-mono">
                                    ~{builderPreviewMode === 'llms_txt'
                                        ? compiled.tokenBudget.llmsTxtTokens.toLocaleString()
                                        : compiled.tokenBudget.llmsFullTxtTokens.toLocaleString()}{' '}
                                    tokens
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ==========================================================================
                TAB 2: AI BOTS & ROBOTS.TXT (CONTEXTUAL PRESETS + CLEAN MATRIX)
                ========================================================================== */}
            {activeTab === 'crawler_matrix' && (
                <div className="space-y-4">
                    {/* Contextual 1-Click Presets Strip (Lives Right Where Users Configure Bots) */}
                    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    1-Click AI Crawler Presets
                                </h3>
                            </div>
                            <span className="text-[11px] text-slate-500">
                                Configures 45 bots, RFC 9309 inheritance, IETF Content-Usage &amp; TDMRep
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {GEO_PRESETS.map((preset) => {
                                const isActive = workspace.activePreset === preset.id;
                                return (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => handlePresetSelect(preset.id)}
                                        title={preset.description}
                                        className={`min-w-0 text-left px-3 py-2.5 rounded-xl border transition cursor-pointer ${isActive
                                                ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-1 ring-indigo-500/30'
                                                : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {preset.name}
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 ${isActive
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                                    }`}
                                            >
                                                {preset.shortBadge}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                        {/* Left Column: Rules + 45-Bot Matrix */}
                        <div className="min-w-0 lg:col-span-7 space-y-4">
                            {/* Core Guardrails & Disallow Paths */}
                            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-4 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 cursor-pointer bg-slate-50/60 dark:bg-slate-950/40 hover:border-indigo-300 transition">
                                        <input
                                            type="checkbox"
                                            checked={workspace.enforceRfc9309InheritanceGuard}
                                            onChange={(e) =>
                                                setWorkspace((p) => ({ ...p, enforceRfc9309InheritanceGuard: e.target.checked }))
                                            }
                                            className="mt-0.5 rounded text-indigo-600"
                                        />
                                        <div>
                                            <span className="font-semibold block text-slate-900 dark:text-white">
                                                RFC 9309 Disallow Inheritance
                                            </span>
                                            <span className="text-[11px] text-slate-500">
                                                Repeats global Disallow paths inside every allowed bot group.
                                            </span>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 cursor-pointer bg-slate-50/60 dark:bg-slate-950/40 hover:border-indigo-300 transition">
                                        <input
                                            type="checkbox"
                                            checked={workspace.ietfContentUsage.allowAiTraining}
                                            onChange={(e) =>
                                                setWorkspace((p) => ({
                                                    ...p,
                                                    ietfContentUsage: { ...p.ietfContentUsage, allowAiTraining: e.target.checked },
                                                    w3cTdmRep: { ...p.w3cTdmRep, reservation: e.target.checked ? 0 : 1 },
                                                }))
                                            }
                                            className="mt-0.5 rounded text-indigo-600"
                                        />
                                        <div>
                                            <span className="font-semibold block text-slate-900 dark:text-white">
                                                Allow AI Model Training (<code>train-ai=y</code>)
                                            </span>
                                            <span className="text-[11px] text-slate-500">
                                                Uncheck to emit <code>train-ai=n</code> &amp; <code>tdm-reservation: 1</code>.
                                            </span>
                                        </div>
                                    </label>
                                </div>

                                {/* Global Disallow Paths */}
                                <div className="space-y-2">
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                        Protected Disallow Paths (<code>User-agent: *</code> + Inherited)
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newDisallowPath}
                                            onChange={(e) => setNewDisallowPath(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const clean = newDisallowPath.trim();
                                                    if (!clean) return;
                                                    const formatted = clean.startsWith('/') ? clean : `/${clean}`;
                                                    if (!workspace.globalDisallowPaths.includes(formatted)) {
                                                        setWorkspace((p) => ({
                                                            ...p,
                                                            globalDisallowPaths: [...p.globalDisallowPaths, formatted],
                                                        }));
                                                    }
                                                    setNewDisallowPath('');
                                                }
                                            }}
                                            placeholder="/admin/ or /checkout/"
                                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono outline-none focus:border-indigo-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const clean =
                                                    newDisallowPath.trim() || `/private-route-${workspace.globalDisallowPaths.length + 1}/`;
                                                const formatted = clean.startsWith('/') ? clean : `/${clean}`;
                                                if (!workspace.globalDisallowPaths.includes(formatted)) {
                                                    setWorkspace((p) => ({
                                                        ...p,
                                                        globalDisallowPaths: [...p.globalDisallowPaths, formatted],
                                                    }));
                                                }
                                                setNewDisallowPath('');
                                                setStatusBanner(`Added Disallow path "${formatted}".`);
                                            }}
                                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shrink-0 cursor-pointer"
                                        >
                                            + Add Path
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {workspace.globalDisallowPaths.map((dp) => (
                                            <span
                                                key={dp}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/70"
                                            >
                                                <span>{dp}</span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setWorkspace((p) => ({
                                                            ...p,
                                                            globalDisallowPaths: p.globalDisallowPaths.filter((x) => x !== dp),
                                                        }))
                                                    }
                                                    className="font-bold hover:text-rose-900 cursor-pointer"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Collapsible Advanced: W3C TDMRep, SPDX & Crawl-Delay */}
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowAdvancedRobots((v) => !v)}
                                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                    >
                                        <span>
                                            {showAdvancedRobots ? 'Hide' : 'Show'} Advanced Settings (W3C TDMRep, SPDX License, Crawl-Delay)
                                        </span>
                                        {showAdvancedRobots ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </button>

                                    {showAdvancedRobots && (
                                        <div className="mt-3 space-y-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                                <div>
                                                    <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                                                        W3C TDM Policy URL
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={workspace.w3cTdmRep.policyUrl}
                                                        onChange={(e) =>
                                                            setWorkspace((p) => ({
                                                                ...p,
                                                                w3cTdmRep: { ...p.w3cTdmRep, policyUrl: e.target.value },
                                                            }))
                                                        }
                                                        placeholder="https://example.com/ai-policy"
                                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                                                        SPDX License
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={workspace.w3cTdmRep.licenseSpdx}
                                                        onChange={(e) =>
                                                            setWorkspace((p) => ({
                                                                ...p,
                                                                w3cTdmRep: { ...p.w3cTdmRep, licenseSpdx: e.target.value },
                                                            }))
                                                        }
                                                        placeholder="Apache-2.0 / Proprietary"
                                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                                                        Crawl-Delay (sec)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={60}
                                                        value={workspace.crawlDelaySeconds ?? ''}
                                                        onChange={(e) => {
                                                            const v = e.target.value.trim();
                                                            setWorkspace((p) => ({
                                                                ...p,
                                                                crawlDelaySeconds: v === '' ? null : Math.max(0, parseInt(v, 10) || 0),
                                                            }));
                                                        }}
                                                        placeholder="None (0)"
                                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px]"
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-lg px-3 py-2 leading-relaxed">
                                                <strong>Technical Signal Only (Not Legal Advice):</strong> W3C{' '}
                                                <code>/.well-known/tdmrep.json</code> and IETF <code>Content-Usage</code> directives
                                                express machine-readable opt-out preferences only and do not constitute legal advice
                                                or guarantee compliance under EU Directive 2019/790 (DSM Art. 4).
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 45-Bot Interactive Directory */}
                            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-3 text-xs">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        AI Crawler Matrix ({filteredBots.length} / {workspace.bots.length})
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setWorkspace((p) => ({
                                                    ...p,
                                                    bots: p.bots.map((b) => ({
                                                        ...b,
                                                        permission:
                                                            b.role === 'AI_SEARCH_CITATION' || b.role === 'USER_TRIGGERED_FETCHER'
                                                                ? 'ALLOW'
                                                                : 'BLOCK',
                                                    })),
                                                }))
                                            }
                                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 cursor-pointer"
                                        >
                                            Allow Search / Block Training
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setWorkspace((p) => ({
                                                    ...p,
                                                    bots: p.bots.map((b) => ({ ...b, permission: 'ALLOW' })),
                                                }))
                                            }
                                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                                        >
                                            Allow All 45
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                    <div className="sm:col-span-6 relative">
                                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                                        <input
                                            type="text"
                                            value={botSearch}
                                            onChange={(e) => setBotSearch(e.target.value)}
                                            placeholder="Filter bots (GPTBot, Claude, Perplexity)..."
                                            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                    <div className="sm:col-span-6">
                                        <select
                                            value={botRoleFilter}
                                            onChange={(e) => setBotRoleFilter(e.target.value)}
                                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium outline-none focus:border-indigo-500"
                                        >
                                            <option value="ALL">All 5 Roles ({workspace.bots.length})</option>
                                            <option value="AI_SEARCH_CITATION">AI Search &amp; Web Search (11)</option>
                                            <option value="USER_TRIGGERED_FETCHER">User-Triggered Live Fetchers (6)</option>
                                            <option value="USAGE_OPT_OUT_TOKEN">Usage Opt-Out Tokens (2)</option>
                                            <option value="MODEL_TRAINING_SCRAPER">Model Training Crawlers (12)</option>
                                            <option value="BULK_DATASET_SCRAPER">Bulk Dataset Scrapers (14)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="max-h-[440px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200/80 dark:border-slate-800 rounded-xl">
                                    {filteredBots.map((bot) => (
                                        <div
                                            key={bot.id}
                                            className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition"
                                        >
                                            <div className="min-w-0 space-y-0.5">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                                                        {bot.userAgent}
                                                    </span>
                                                    <span className="text-[11px] text-slate-500">· {bot.operator}</span>
                                                    <span
                                                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${bot.role === 'AI_SEARCH_CITATION' || bot.role === 'USER_TRIGGERED_FETCHER'
                                                                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                                                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                                            }`}
                                                    >
                                                        {bot.role.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                                    {bot.description}
                                                </p>
                                            </div>

                                            <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
                                                <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                                                    {(
                                                        [
                                                            { val: 'ALLOW' as AiBotPermission, label: 'Allow', active: 'bg-emerald-600 text-white' },
                                                            { val: 'BLOCK' as AiBotPermission, label: 'Block', active: 'bg-rose-600 text-white' },
                                                            { val: 'CUSTOM_PATHS' as AiBotPermission, label: 'Custom', active: 'bg-indigo-600 text-white' },
                                                        ] as const
                                                    ).map((opt) => (
                                                        <button
                                                            key={opt.val}
                                                            type="button"
                                                            onClick={() =>
                                                                setWorkspace((p) => ({
                                                                    ...p,
                                                                    bots: p.bots.map((x) =>
                                                                        x.id === bot.id
                                                                            ? {
                                                                                ...x,
                                                                                permission: opt.val,
                                                                                customAllowPaths:
                                                                                    opt.val === 'CUSTOM_PATHS' && x.customAllowPaths.length === 0
                                                                                        ? ['/docs/']
                                                                                        : x.customAllowPaths,
                                                                                customDisallowPaths:
                                                                                    opt.val === 'CUSTOM_PATHS' && x.customDisallowPaths.length === 0
                                                                                        ? ['/private/']
                                                                                        : x.customDisallowPaths,
                                                                            }
                                                                            : x
                                                                    ),
                                                                }))
                                                            }
                                                            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${bot.permission === opt.val
                                                                    ? opt.active
                                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                                                }`}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>

                                                {bot.permission === 'CUSTOM_PATHS' && (
                                                    <div className="flex flex-col gap-1 text-[10px] w-full sm:w-56">
                                                        <input
                                                            type="text"
                                                            value={bot.customAllowPaths.join(', ')}
                                                            onChange={(e) => {
                                                                const rawParts = e.target.value.split(',');
                                                                const vals = rawParts.map((s, idx) =>
                                                                    idx < rawParts.length - 1 ? s.trim() : s.replace(/^\s+/, '')
                                                                );
                                                                setWorkspace((p) => ({
                                                                    ...p,
                                                                    bots: p.bots.map((x) =>
                                                                        x.id === bot.id ? { ...x, customAllowPaths: vals } : x
                                                                    ),
                                                                }));
                                                            }}
                                                            placeholder="Allow: /docs/, /api/"
                                                            className="w-full px-2 py-1 rounded border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 font-mono"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={bot.customDisallowPaths.join(', ')}
                                                            onChange={(e) => {
                                                                const rawParts = e.target.value.split(',');
                                                                const vals = rawParts.map((s, idx) =>
                                                                    idx < rawParts.length - 1 ? s.trim() : s.replace(/^\s+/, '')
                                                                );
                                                                setWorkspace((p) => ({
                                                                    ...p,
                                                                    bots: p.bots.map((x) =>
                                                                        x.id === bot.id ? { ...x, customDisallowPaths: vals } : x
                                                                    ),
                                                                }));
                                                            }}
                                                            placeholder="Disallow: /pricing/"
                                                            className="w-full px-2 py-1 rounded border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 font-mono"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Sticky Live robots.txt + Collapsible Importer */}
                        <div className="min-w-0 lg:col-span-5 lg:sticky lg:top-6 space-y-4">
                            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Live <code>robots.txt</code>
                                    </h3>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                void navigator.clipboard?.writeText(compiled.robotsTxt);
                                                setCopiedRobotsPreview(true);
                                                setTimeout(() => setCopiedRobotsPreview(false), 2000);
                                                setStatusBanner('Copied robots.txt to clipboard.');
                                            }}
                                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 text-white inline-flex items-center gap-1 transition cursor-pointer"
                                        >
                                            {copiedRobotsPreview ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                            )}
                                            <span>{copiedRobotsPreview ? 'Copied!' : 'Copy'}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => triggerDownload(compiled.robotsTxt, 'robots.txt', 'text/plain;charset=utf-8')}
                                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white inline-flex items-center gap-1 transition cursor-pointer"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Download</span>
                                        </button>
                                    </div>
                                </div>

                                <pre className="rounded-xl bg-slate-950 text-emerald-300 p-4 font-mono text-xs overflow-x-auto max-w-full max-h-[480px] whitespace-pre-wrap break-words leading-relaxed">
                                    {compiled.robotsTxt}
                                </pre>

                                {/* Collapsible Audit Existing robots.txt */}
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => setShowRobotsImport((v) => !v)}
                                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                    >
                                        <span>{showRobotsImport ? 'Hide' : 'Paste & Audit Existing robots.txt'}</span>
                                        {showRobotsImport ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </button>

                                    {showRobotsImport && (
                                        <div className="mt-2.5 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] text-slate-500">Detects retired tokens &amp; Disallow rules</span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setImportRobotsText(
                                                            'User-agent: *\nDisallow: /admin/\nDisallow: /checkout/\nUser-agent: OAI-SearchBot\nAllow: /\nUser-agent: Claude-Web\nDisallow: /\nUser-agent: GPTBot\nDisallow: /\nSitemap: https://docs.example.com/sitemap.xml'
                                                        )
                                                    }
                                                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                                >
                                                    Load Demo
                                                </button>
                                            </div>
                                            <textarea
                                                rows={3}
                                                value={importRobotsText}
                                                onChange={(e) => setImportRobotsText(e.target.value)}
                                                placeholder="User-agent: *\nDisallow: /admin/\nUser-agent: GPTBot\nDisallow: /"
                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const rawToParse =
                                                        importRobotsText.trim() ||
                                                        'User-agent: *\nDisallow: /admin/\nDisallow: /checkout/\nUser-agent: OAI-SearchBot\nAllow: /\nUser-agent: Claude-Web\nDisallow: /\nUser-agent: GPTBot\nDisallow: /\nSitemap: https://docs.example.com/sitemap.xml';
                                                    const parsedRob = parseExistingRobotsTxt(rawToParse, workspace.bots);
                                                    setWorkspace((p) => ({
                                                        ...p,
                                                        bots: parsedRob.updatedBots,
                                                        globalDisallowPaths: parsedRob.globalDisallowPaths,
                                                        sitemapUrl: parsedRob.sitemapUrl || p.sitemapUrl,
                                                        deprecatedTokensDetected: parsedRob.deprecatedTokensDetected,
                                                    }));
                                                    setImportRobotsText('');
                                                    const msg = `Audited robots.txt (${parsedRob.globalDisallowPaths.length} Disallow path(s), ${parsedRob.deprecatedTokensDetected.length} deprecated token(s)).`;
                                                    setRobotsImportNotice(msg);
                                                    setStatusBanner(msg);
                                                }}
                                                className="px-3 py-1.5 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                                            >
                                                Parse &amp; Audit
                                            </button>
                                            {robotsImportNotice && (
                                                <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 text-[11px] font-medium text-emerald-800 dark:text-emerald-200">
                                                    ✓ {robotsImportNotice}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ==========================================================================
                TAB 3: 12-POINT VALIDATOR & MULTI-MODEL BPE TOKEN BUDGET
                ========================================================================== */}
            {activeTab === 'validator_linter' && (
                <div className="space-y-4">
                    {/* Linter Score & Results */}
                    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="space-y-0.5">
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                    <span>12-Point Specification &amp; Cross-File Validator ({compiled.healthScore}/100)</span>
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Checks H1/blockquote syntax, URL validity, duplicates, buzzwords, and RFC 9309 conflicts.
                                </p>
                            </div>
                            {compiled.lintIssues.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setWorkspace((prev) => autoFixGeoWorkspace(prev));
                                        setStatusBanner('Applied 1-Click Auto-Fix across all fixable rules.');
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition cursor-pointer"
                                >
                                    <Wrench className="w-3.5 h-3.5" />
                                    <span>1-Click Auto-Fix ({compiled.lintIssues.length})</span>
                                </button>
                            )}
                        </div>

                        {compiled.lintIssues.length === 0 ? (
                            <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                <span>
                                    <strong>All 12 checks passed (100/100).</strong> Your <code>llms.txt</code> and{' '}
                                    <code>robots.txt</code> are valid with zero RFC 9309 inheritance leaks or bot conflicts.
                                </span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {compiled.lintIssues.map((issue) => (
                                    <div
                                        key={issue.id}
                                        className={`p-3.5 rounded-xl border text-xs space-y-1.5 min-w-0 ${issue.severity === 'CRITICAL'
                                                ? 'border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20'
                                                : 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                                <span>{issue.title}</span>
                                            </span>
                                            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-slate-900 text-white shrink-0">
                                                {issue.targetFile}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{issue.explanation}</p>
                                        <p className="text-[11px] text-slate-500">
                                            <strong>Fix:</strong> {issue.remediation}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Paste Existing llms.txt to Validate */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    Paste Existing <code>llms.txt</code> to Validate &amp; Auto-Fix
                                </label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setImportLlmsText(
                                            '# Acme Broken Docs\n> Our revolutionary world-class synergistic AI platform.\n## Core Documentation\n- [Click here](/docs/relative-link): Cutting-edge guide.\n- [Read more](https://docs.example.com/api/auth): Duplicate link.\n- [Read more](https://docs.example.com/api/auth): Duplicate link.'
                                        )
                                    }
                                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                >
                                    Load Demo Broken Draft
                                </button>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <textarea
                                    rows={2}
                                    value={importLlmsText}
                                    onChange={(e) => setImportLlmsText(e.target.value)}
                                    placeholder="# My Project&#10;&gt; Summary...&#10;## Docs&#10;- [Guide](https://example.com/docs): Overview"
                                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px] outline-none focus:border-indigo-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const rawToValidate =
                                            importLlmsText.trim() ||
                                            '# Acme Broken Docs\n> Our revolutionary world-class synergistic AI platform.\n## Core Documentation\n- [Click here](/docs/relative-link): Cutting-edge guide.\n- [Read more](https://docs.example.com/api/auth): Duplicate link.\n- [Read more](https://docs.example.com/api/auth): Duplicate link.';
                                        const parsed = parseExistingLlmsTxt(rawToValidate, workspace.siteUrl);
                                        setWorkspace((p) => ({
                                            ...p,
                                            projectName: parsed.projectName,
                                            summaryBlockquote: parsed.summaryBlockquote,
                                            overviewParagraphs: parsed.overviewParagraphs,
                                            links: parsed.links.length > 0 ? parsed.links : p.links,
                                        }));
                                        setImportLlmsText('');
                                        const msg = `Loaded ${parsed.links.length} link(s) into the 12-Point Validator.`;
                                        setLlmsValidateNotice(msg);
                                        setStatusBanner(msg);
                                    }}
                                    className="px-4 py-2 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 cursor-pointer"
                                >
                                    Validate Draft
                                </button>
                            </div>
                            {llmsValidateNotice && (
                                <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 text-[11px] font-medium text-emerald-800 dark:text-emerald-200">
                                    ✓ {llmsValidateNotice}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Multi-Model Token Budget & Section Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="min-w-0 lg:col-span-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs">
                            <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-slate-900 dark:text-white">
                                <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                <span>Multi-Model BPE Token Budget</span>
                            </h3>
                            <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200/80 dark:border-slate-800">
                                <table className="min-w-[540px] w-full text-left border-collapse text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="py-2.5 px-3">Target Model</th>
                                            <th className="py-2.5 px-3">Context</th>
                                            <th className="py-2.5 px-3">llms.txt</th>
                                            <th className="py-2.5 px-3">llms-full.txt</th>
                                            <th className="py-2.5 px-3">Est. / 1K Reads</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                                        {compiled.tokenBudget.modelComparisons.map((m) => (
                                            <tr key={m.modelName}>
                                                <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                                                    {m.modelName}
                                                </td>
                                                <td className="py-2.5 px-3 font-mono text-slate-500">
                                                    {m.contextWindowTokens.toLocaleString()}
                                                </td>
                                                <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                                                    {m.llmsTxtPercentOfContext}%
                                                </td>
                                                <td className="py-2.5 px-3 font-mono">{m.llmsFullTxtPercentOfContext}%</td>
                                                <td className="py-2.5 px-3 font-mono">${m.estimatedCostPer1000ReadsUsd}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="min-w-0 lg:col-span-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-3">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Section Breakdown</h3>
                            <div className="space-y-2 text-xs">
                                {compiled.tokenBudget.sectionBreakdown.map((sec) => (
                                    <div
                                        key={sec.sectionName}
                                        className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-2"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-semibold text-slate-900 dark:text-white truncate">
                                                    ## {sec.sectionName}
                                                </span>
                                                {sec.isOptionalSection && (
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold shrink-0">
                                                        Optional
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[11px] text-slate-500">{sec.linkCount} link(s)</div>
                                        </div>
                                        <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
                                            ~{sec.tokens} tok
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ==========================================================================
                TAB 4: HTML-TO-MARKDOWN COMPILER (CLEAN 2-COLUMN SPLIT)
                ========================================================================== */}
            {activeTab === 'full_txt_compiler' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    <div className="min-w-0 lg:col-span-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-3 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Paste Raw HTML (Strips <code>&lt;nav&gt;</code>, <code>&lt;script&gt;</code>, <code>&lt;footer&gt;</code>)
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setHtmlSourceInput(SAMPLE_HTML_DOC_SNIPPET);
                                    setHtmlPageUrl('https://docs.example.com/api/webhooks');
                                }}
                                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                            >
                                Reset Demo HTML
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Source Page URL</label>
                                <input
                                    type="text"
                                    value={htmlPageUrl}
                                    onChange={(e) => setHtmlPageUrl(e.target.value)}
                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Target Section</label>
                                <select
                                    value={htmlTargetSection}
                                    onChange={(e) => setHtmlTargetSection(e.target.value)}
                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:border-indigo-500"
                                >
                                    {SECTION_OPTIONS.map((sec) => (
                                        <option key={sec} value={sec}>
                                            ## {sec}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <textarea
                            rows={13}
                            value={htmlSourceInput}
                            onChange={(e) => setHtmlSourceInput(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-[11px] outline-none focus:border-indigo-500"
                        />

                        <button
                            type="button"
                            onClick={handleAppendConvertedHtmlToFullTxt}
                            className="w-full py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition cursor-pointer"
                        >
                            + Add Clean Markdown to llms.txt &amp; llms-full.txt
                        </button>

                        {htmlCompilerNotice && (
                            <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-2 text-[11px] font-medium text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-2">
                                <span>✓ {htmlCompilerNotice}</span>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('llms_builder')}
                                    className="text-indigo-600 dark:text-indigo-400 underline font-semibold shrink-0 cursor-pointer"
                                >
                                    Open Builder →
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 lg:col-span-6 lg:sticky lg:top-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-3 text-xs">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Extracted Clean Markdown</h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                {convertedHtmlPreview.title} • {convertedHtmlPreview.wordCount} words • ~
                                {convertedHtmlPreview.estimatedTokens} tokens
                            </p>
                        </div>
                        <pre className="rounded-xl bg-slate-950 text-emerald-300 p-4 font-mono text-xs overflow-x-auto max-w-full max-h-[440px] whitespace-pre-wrap break-words leading-relaxed">
                            {convertedHtmlPreview.markdownBody}
                        </pre>
                    </div>
                </div>
            )}

            {/* ==========================================================================
                TAB 5: 10-FORMAT EXPORT STUDIO (SIDEBAR LIST + STICKY CODE PREVIEW)
                ========================================================================== */}
            {activeTab === 'export_studio' && (
                <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-4">
                    {/* Quick Downloads Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                Export Studio (10 Synchronized Formats)
                            </h3>
                            <p className="text-xs text-slate-500">
                                Download individual files or export your full governance matrix to Excel/CSV.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => triggerDownload(compiled.llmsTxt, 'llms.txt', 'text/plain;charset=utf-8')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>llms.txt</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => triggerDownload(compiled.llmsFullTxt, 'llms-full.txt', 'text/plain;charset=utf-8')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>llms-full.txt</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => triggerDownload(compiled.robotsTxt, 'robots.txt', 'text/plain;charset=utf-8')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 text-white cursor-pointer"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>robots.txt</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const xlsx = exportGeoInventoryXlsx(workspace);
                                    triggerDownload(
                                        xlsx,
                                        'geo_ai_governance_matrix.xlsx',
                                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                                    );
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 cursor-pointer"
                            >
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                                <span>Excel (.xlsx)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const csv = exportGeoInventoryCsv(workspace, true);
                                    triggerDownload(csv, 'geo_ai_governance_matrix.csv', 'text/csv;charset=utf-8');
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 cursor-pointer"
                            >
                                <FileCode className="w-3.5 h-3.5" />
                                <span>CSV</span>
                            </button>
                        </div>
                    </div>

                    {/* Clean Sidebar Selector + Live Output */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                        <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-1.5">
                            {EXPORT_ITEMS.map((item) => {
                                const isSelected = exportFormat === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setExportFormat(item.id)}
                                        className={`text-left px-3 py-2 rounded-xl border transition cursor-pointer ${isSelected
                                                ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                                                : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-950/30 text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        <div className="text-xs font-bold truncate">{item.label}</div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{item.sub}</div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="min-w-0 lg:col-span-8 space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    {activeExportMeta.file}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            void navigator.clipboard?.writeText(activeExportText);
                                            setCopiedExport(true);
                                            setTimeout(() => setCopiedExport(false), 2000);
                                        }}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 text-white cursor-pointer"
                                    >
                                        {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedExport ? 'Copied!' : 'Copy'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => triggerDownload(activeExportText, activeExportMeta.file, activeExportMeta.mime)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Download</span>
                                    </button>
                                </div>
                            </div>

                            <pre className="rounded-xl bg-slate-950 text-emerald-300 p-4 font-mono text-xs overflow-x-auto max-w-full max-h-[520px] whitespace-pre-wrap break-words leading-relaxed">
                                {activeExportText}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}