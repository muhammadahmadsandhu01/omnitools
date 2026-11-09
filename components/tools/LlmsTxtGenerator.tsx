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
    Lock,
    Unlock,
    Code2,
    FileSpreadsheet,
    FileCode,
    FileText,
    Sparkles,
    Layers,
    Terminal,
    Cpu,
    Globe,
    Zap,
    Copy,
    Check,
    Plus,
    Trash2,
    Sliders,
    Info,
    Wrench,
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
    exportGeoInventoryCsv,
    exportGeoInventoryXlsx,
    generateSampleGeoProject,
    type AiCrawlerRole,
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
            name: 'GEO Maximum Search Visibility (Recommended)',
            shortBadge: 'Allow Search • Block Training',
            description:
                'Allows AI Search & Citation bots (OAI-SearchBot, Claude-SearchBot, PerplexityBot) and User Fetchers while blocking Foundation Model Training (GPTBot, ClaudeBot, CCBot) with RFC 9309 inheritance protection.',
        },
        {
            id: 'open_source_max_reach',
            name: 'Open-Source & Docs Maximum AI Reach',
            shortBadge: 'Allow Search + LLM Training',
            description:
                'Allows all legitimate AI Search, Assistant, and Model Training crawlers so coding models (Claude, ChatGPT, Cursor, Copilot) learn your SDK and API syntax natively.',
        },
        {
            id: 'strict_copyright_shield',
            name: 'Strict Copyright & Publisher IP Shield',
            shortBadge: 'Citation Only • TDM Reserved',
            description:
                'Blocks all foundation model training, opt-out tokens (Google-Extended, Applebot-Extended), and bulk scrapers while enabling W3C TDMRep reservation (1) and IETF train-ai=n.',
        },
        {
            id: 'ecommerce_saas_funnel_guard',
            name: 'E-Commerce & SaaS Funnel Guard',
            shortBadge: 'Protect /cart & /checkout',
            description:
                'Exposes product catalogs and documentation to AI shopping/search assistants while enforcing RFC 9309 Disallow inheritance on /checkout/, /cart/, /account/, /admin/, and /api/.',
        },
        {
            id: 'eu_dsm_ietf_compliance',
            name: 'EU DSM Art. 4 & IETF AIPREF Compliance',
            shortBadge: 'Content-Usage + tdmrep.json',
            description:
                'Generates synchronized robots.txt IETF AIPREF Content-Usage directives, W3C /.well-known/tdmrep.json, and ai.txt machine-readable copyright reservations.',
        },
        {
            id: 'total_ai_lockdown',
            name: 'Total AI Lockdown (Zero AI Bots)',
            shortBadge: 'Block All 42 AI Bots + noai',
            description:
                'Blocks every AI search, assistant, training, and scraping bot (preserving only standard Googlebot, Bingbot, and Applebot web search) with X-Robots-Tag: noai, noimageai.',
        },
    ];

const SAMPLE_GEO_PROJECTS: {
    id: 'saas_dev_platform' | 'ecommerce_storefront' | 'media_research_publisher';
    title: string;
    subtitle: string;
    badge: string;
}[] = [
        {
            id: 'saas_dev_platform',
            title: 'AcmeCloud Developer Platform & SDK',
            subtitle: '8 curated docs/API links, ## Optional changelog, Search-Allowed / Training-Blocked matrix & Next.js route.ts',
            badge: '100/100 Valid • Developer Docs',
        },
        {
            id: 'ecommerce_storefront',
            title: 'LuxeCart E-Commerce Storefront (Linter Demo)',
            subtitle: 'Product specs + intentional RFC 9309 /checkout leak, relative URL & marketing buzzword to test 1-Click Auto-Fix',
            badge: 'Test Linter & 1-Click Fix',
        },
        {
            id: 'media_research_publisher',
            title: 'QuantumDigest Research Publisher',
            subtitle: 'Strict EU DSM Art. 4 TDM reservation (tdmrep.json), IETF Content-Usage: train-ai=n & Crawl-Delay rules',
            badge: 'W3C TDMRep • IETF AIPREF',
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
  <link rel="canonical" href="https://kivarotools.com/api/webhooks" />
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
    <loc>https://kivarotools.com/docs/edge-kv-storage</loc>
    <lastmod>2026-10-29</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://kivarotools.com/api/rate-limits-and-quotas</loc>
    <lastmod>2026-10-28</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://kivarotools.com/guides/migrating-from-aws-lambda</loc>
    <lastmod>2026-10-25</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://kivarotools.com/legal/dpa-subprocessors</loc>
    <lastmod>2026-10-10</lastmod>
    <priority>0.3</priority>
  </url>
</urlset>`;

export default function LlmsTxtGenerator() {
    const [activeSampleId, setActiveSampleId] = useState<
        'saas_dev_platform' | 'ecommerce_storefront' | 'media_research_publisher' | null
    >('saas_dev_platform');

    const [workspace, setWorkspace] = useState<GeoWorkspaceState>(() =>
        generateSampleGeoProject('saas_dev_platform')
    );

    const [activeTab, setActiveTab] = useState<GeoWorkbenchTab>('llms_builder');
    const [statusBanner, setStatusBanner] = useState<string | null>(
        'Loaded Sample #1: "AcmeCloud Edge Runtime & SDK" (8 curated links, 45 AI crawler rules, 100/100 GEO Health Score). Click any sample card above to test E-Commerce Linter or W3C TDMRep!'
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    const [htmlPageUrl, setHtmlPageUrl] = useState<string>('https://kivarotools.com/api/webhooks');
    const [htmlTargetSection, setHtmlTargetSection] = useState<string>('API & SDK Reference');

    // Tab 5: Export Studio Preview Format
    const [exportFormat, setExportFormat] = useState<
        | 'llms_txt'
        | 'llms_full_txt'
        | 'llms_ctx_txt'
        | 'robots_txt'
        | 'ai_txt'
        | 'tdmrep_json'
        | 'nextjs_routes'
        | 'edge_headers'
        | 'markdown_guide'
        | 'certificate_json'
    >('llms_txt');
    const [copiedExport, setCopiedExport] = useState<boolean>(false);
    const [recentlyAddedLinkId, setRecentlyAddedLinkId] = useState<string | null>(null);
    const [linkActionNotice, setLinkActionNotice] = useState<string | null>(null);
    const [sitemapActionNotice, setSitemapActionNotice] = useState<string | null>(null);
    const [htmlCompilerNotice, setHtmlCompilerNotice] = useState<string | null>(null);
    const [robotsImportNotice, setRobotsImportNotice] = useState<string | null>(null);
    const [llmsValidateNotice, setLlmsValidateNotice] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const workbenchRef = useRef<HTMLDivElement | null>(null);
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
        const nextWorkspace = generateSampleGeoProject(sampleId);
        setActiveSampleId(sampleId);
        setWorkspace(nextWorkspace);

        if (sampleId === 'saas_dev_platform') {
            setStatusBanner(
                'Loaded Sample #1: "AcmeCloud Edge Runtime & SDK" — 8 curated links, Search-Allowed / Training-Blocked matrix, 100/100 GEO Health Score.'
            );
        } else if (sampleId === 'ecommerce_storefront') {
            setStatusBanner(
                'Loaded Sample #2: "LuxeCart E-Commerce Storefront" — Open Tab 3 (Validator & Conflict Linter) to see 4 intentional issues (RFC 9309 leak, relative URL, marketing fluff) and test 1-Click Auto-Fix!'
            );
        } else {
            setStatusBanner(
                'Loaded Sample #3: "QuantumDigest Research Publisher" — Strict EU DSM Art. 4 TDM reservation (tdmrep.json) + IETF AIPREF Content-Usage: train-ai=n.'
            );
        }
    };

    const handlePresetSelect = (presetId: GeoPresetId) => {
        setWorkspace((prev) => applyGeoPreset(presetId, prev));
        setStatusBanner(`Applied GEO & AI Crawler strategy preset "${presetId}".`);
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
                setStatusBanner(`Imported "${file.name}" into the 45-Bot AI Crawler Matrix.`);
            } else if (lowerName.endsWith('.xml') || /<(?:urlset|sitemapindex|rss|feed)\b/i.test(text)) {
                const extractedLinks = parseSitemapXmlOrUrlList(text, workspace.siteUrl, workspace.projectName);
                if (extractedLinks.length === 0) {
                    setErrorMessage('No valid <loc> URLs found in the uploaded XML sitemap.');
                } else {
                    setWorkspace((prev) => ({ ...prev, links: extractedLinks }));
                    setActiveTab('llms_builder');
                    setSitemapActionNotice(`Imported ${extractedLinks.length} URLs from "${file.name}" into Curated Links!`);
                    setStatusBanner(
                        `Imported ${extractedLinks.length} URLs from "${file.name}" and auto-classified them into H2 sections!`
                    );
                }
            } else if (lowerName.endsWith('.html') || lowerName.endsWith('.htm') || /<html\b/i.test(text)) {
                setHtmlSourceInput(text);
                setActiveTab('full_txt_compiler');
                setHtmlCompilerNotice(`Loaded HTML document "${file.name}" into the HTML-to-Markdown Compiler.`);
                setStatusBanner(`Loaded HTML document "${file.name}" into the HTML-to-Markdown llms-full.txt Compiler.`);
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
                    setStatusBanner(
                        `Imported "${file.name}" (${parsedLlms.links.length} links parsed into the llms.txt Visual Builder).`
                    );
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
            ? `Loaded Demo sitemap.xml and ${appendMode ? 'prepended' : 'imported'} ${extracted.length} URL(s) into Curated H2 Section Links!`
            : `${appendMode ? 'Prepended' : 'Replaced with'} ${extracted.length} URL(s) and auto-classified into H2 sections!`;
        setSitemapActionNotice(msg);
        setLinkActionNotice(msg);
        setStatusBanner(msg);
    };

    const handleAddManualLink = () => {
        setErrorMessage(null);
        const cleanBase = (workspace.siteUrl || 'https://docs.example.com').trim().replace(/\/+$/, '');
        const rawTitle = newLinkTitle.trim();
        const rawUrl = newLinkUrl.trim();
        const rawDesc = newLinkDesc.trim();

        let resolvedUrl = rawUrl;
        if (!resolvedUrl) {
            if (rawTitle) {
                const slug = rawTitle
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '') || `page-${workspace.links.length + 1}`;
                resolvedUrl = `${cleanBase}/docs/${slug}`;
            } else {
                resolvedUrl = `${cleanBase}/docs/endpoint-guide-${workspace.links.length + 1}`;
            }
        } else if (resolvedUrl.startsWith('/')) {
            resolvedUrl = `${cleanBase}${resolvedUrl}`;
        } else if (!/^https?:\/\//i.test(resolvedUrl)) {
            resolvedUrl = `https://${resolvedUrl}`;
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

        // Prepend at #1 so the user immediately sees the newly added card at the top of the list!
        setWorkspace((prev) => ({ ...prev, links: [newItem, ...prev.links] }));
        setRecentlyAddedLinkId(newItemId);
        setNewLinkTitle('');
        setNewLinkUrl('');
        setNewLinkDesc('');
        linksListRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

        const msg = `Added "${newItem.title}" (${newItem.url}) at #1 under ## ${newItem.section}!`;
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
        const msg = `Added "${item.title}" (~${item.estimatedTokens} tokens) at #1 in llms.txt & llms-full.txt!`;
        setHtmlCompilerNotice(msg);
        setLinkActionNotice(msg);
        setStatusBanner(msg);
    };

    const triggerDownload = (content: Uint8Array | string, fileName: string, mimeType: string) => {
        const blob =
            typeof content === 'string'
                ? new Blob([content], { type: mimeType })
                : new Blob([content as unknown as BlobPart], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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

    return (
        <div className="space-y-6 w-full min-w-0 max-w-full overflow-x-hidden text-slate-900 dark:text-slate-100">
            {/* TOP STUDIO HEADER, UPLOAD & 3 INSTANT 1-CLICK SAMPLE PROJECTS */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="min-w-0">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-2">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                            <span>
                                llmstxt.org v2 + RFC 9309 + IETF AIPREF + W3C TDMRep Studio v{LLMS_ENGINE_VERSION}
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            llms.txt, llms-full.txt &amp; AI Crawler (robots.txt) Generator
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Build spec-compliant <code>llms.txt</code> &amp; <code>llms-full.txt</code> files from{' '}
                            <code>sitemap.xml</code> or HTML DOM, configure 45 AI search &amp; training bots in{' '}
                            <code>robots.txt</code> without RFC 9309 leaks, audit token budgets, and export Next.js{' '}
                            <code>route.ts</code> or <code>tdmrep.json</code> locally.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
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
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-sm transition"
                        >
                            <Upload className="w-4 h-4 shrink-0" />
                            <span>Import sitemap.xml / llms.txt / robots.txt</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => triggerDownload(compiled.llmsTxt, 'llms.txt', 'text/plain;charset=utf-8')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
                        >
                            <Download className="w-4 h-4 shrink-0" />
                            <span>Download llms.txt (~{compiled.tokenBudget.llmsTxtTokens} tokens)</span>
                        </button>
                    </div>
                </div>

                {/* 3 Instant 1-Click Sample GEO Projects */}
                <div className="pt-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>
                            Instant 1-Click Sample Projects (Click Any Scenario to Load Live llms.txt, robots.txt &amp; Linter Output):
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                        {SAMPLE_GEO_PROJECTS.map((s) => {
                            const isSelected = activeSampleId === s.id;
                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => handleSelectSample(s.id)}
                                    className={`min-w-0 text-left p-3.5 rounded-xl border transition group ${isSelected
                                        ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/90 dark:bg-indigo-950/60 ring-2 ring-indigo-500/30 shadow-xs'
                                        : 'border-slate-200 dark:border-slate-700/80 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/60 dark:bg-slate-800/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                                            {s.title}
                                        </span>
                                        <span
                                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${isSelected
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                                }`}
                                        >
                                            {isSelected ? '✓ Active' : 'Load'}
                                        </span>
                                    </div>
                                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 mb-1">
                                        {s.badge}
                                    </span>
                                    <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400 line-clamp-2">
                                        {s.subtitle}
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    {/* Live Loaded Output Preview Bar */}
                    <div className="mt-3 rounded-xl border border-indigo-200 dark:border-indigo-900/70 bg-indigo-50/70 dark:bg-indigo-950/40 p-3 space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2 min-w-0">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span className="font-bold text-slate-900 dark:text-white truncate">
                                    Active Project:{' '}
                                    <code className="font-mono text-indigo-700 dark:text-indigo-300">{workspace.projectName}</code>
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                    {workspace.links.length} Links • {allowedSearchBotsCount}/{totalSearchBotsCount} Search Bots Allowed •
                                    Score: {compiled.healthScore}/100
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('llms_builder');
                                        workbenchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition"
                                >
                                    Edit llms.txt ({workspace.links.length}) ↓
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('crawler_matrix');
                                        workbenchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-500"
                                >
                                    45-Bot Matrix &amp; robots.txt
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('validator_linter');
                                        workbenchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-500"
                                >
                                    Linter &amp; Tokens ({compiled.lintIssues.length} Alerts)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('export_studio');
                                        workbenchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-500"
                                >
                                    10-Format Export Studio
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Disclosure & Privacy Bar */}
                <details className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 px-4 py-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <summary className="cursor-pointer font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span>
                                Technical Standards (llmstxt.org v2, RFC 9309, IETF AIPREF, W3C TDMRep) &amp; Local Browser Privacy Disclosure
                            </span>
                        </span>
                        <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium shrink-0">
                            Click to expand
                        </span>
                    </summary>
                    <div className="mt-2.5 space-y-1.5 leading-relaxed border-t border-slate-200 dark:border-slate-700 pt-2.5">
                        <p>
                            <strong>Privacy &amp; Local Execution:</strong> Your selected file contents, sitemaps, and HTML documents
                            are processed locally in your browser and are not uploaded to KivaroTools servers. The website may still
                            load general analytics or other third-party website resources.
                        </p>
                        <p>
                            <strong>Why Separate AI Search Bots from Model Training Scrapers:</strong> Blocking all AI user-agents in{' '}
                            <code>robots.txt</code> removes your site from ChatGPT Search (<code>OAI-SearchBot</code>), Claude Search (
                            <code>Claude-SearchBot</code>), and Perplexity (<code>PerplexityBot</code>). Our taxonomic matrix separates
                            Search Citation &amp; User-Triggered Fetchers from Foundation Model Training crawlers (<code>GPTBot</code>
                            , <code>ClaudeBot</code>, <code>Google-Extended</code>, <code>CCBot</code>) and enforces RFC 9309 §2.2.1
                            <code>Disallow</code> inheritance so private paths never leak.
                        </p>
                    </div>
                </details>
            </div>

            {errorMessage && (
                <div className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 p-4 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold">GEO Studio Alert</p>
                        <p className="text-xs mt-0.5 break-words">{errorMessage}</p>
                    </div>
                </div>
            )}

            {statusBanner && (
                <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-emerald-900 dark:text-emerald-200">
                    <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{statusBanner}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setStatusBanner(null)}
                        className="text-emerald-700 dark:text-emerald-300 hover:underline font-medium shrink-0"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* 6 GEO & AI GOVERNANCE STRATEGY PRESETS */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            1-Click GEO &amp; AI Crawler Governance Presets
                        </h3>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        Configures 45 AI user-agents, RFC 9309 Disallow inheritance, IETF Content-Usage, and W3C TDMRep
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {GEO_PRESETS.map((preset) => {
                        const isActive = workspace.activePreset === preset.id;
                        return (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => handlePresetSelect(preset.id)}
                                className={`min-w-0 text-left p-3 rounded-xl border transition ${isActive
                                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-1 ring-indigo-500/40'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/30'
                                    }`}
                            >
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                        {preset.name}
                                    </span>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${isActive
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        {preset.shortBadge}
                                    </span>
                                </div>
                                <p className="text-[11px] leading-snug text-slate-600 dark:text-slate-400">
                                    {preset.description}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 6-CARD LIVE TELEMETRY BAR */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
                <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">GEO &amp; Spec Score</div>
                    <div
                        className={`text-sm font-bold mt-0.5 truncate ${compiled.healthScore >= 85
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : compiled.healthScore >= 60
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                    >
                        {compiled.healthScore} / 100 ({compiled.lintIssues.length === 0 ? 'Valid v2' : `${compiled.lintIssues.length} Alerts`})
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                        {workspace.links.filter((l) => l.includedInLlmsTxt).length} Active Links in llms.txt
                    </div>
                </div>

                <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">llms.txt Token Budget</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                        ~{compiled.tokenBudget.llmsTxtTokens.toLocaleString()} Tokens
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                        {compiled.tokenBudget.llmsTxtWords} words • {compiled.tokenBudget.optionalSectionPercent}% in ## Optional
                    </div>
                </div>

                <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">llms-full.txt Bundle</div>
                    <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">
                        ~{compiled.tokenBudget.llmsFullTxtTokens.toLocaleString()} Tokens
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                        {workspace.links.filter((l) => l.includedInFullTxt).length} Full Docs Concatenated
                    </div>
                </div>

                <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">AI Search Citations</div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                        {allowedSearchBotsCount} / {totalSearchBotsCount} Allowed
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                        OAI-SearchBot • Claude • Perplexity
                    </div>
                </div>

                <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Training &amp; Scrapers</div>
                    <div className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5 truncate">
                        {blockedTrainingAndScrapersCount} / {totalTrainingAndScrapersCount} Blocked
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                        GPTBot • ClaudeBot • CCBot • Extended
                    </div>
                </div>

                <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">RFC 9309 &amp; IETF Guard</div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1 truncate">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{workspace.enforceRfc9309InheritanceGuard ? 'Inheritance Safe' : 'Override Risk'}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                        train-ai={workspace.ietfContentUsage.allowAiTraining ? 'y' : 'n'} • TDM={workspace.w3cTdmRep.reservation}
                    </div>
                </div>
            </div>

            {/* 5-TAB WORKBENCH NAVIGATION */}
            <div
                ref={workbenchRef}
                className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 scroll-mt-20"
            >
                <button
                    type="button"
                    onClick={() => setActiveTab('llms_builder')}
                    className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'llms_builder'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                        }`}
                >
                    <span className="inline-flex items-center gap-2">
                        <FileText className="w-4 h-4 shrink-0" />
                        <span>1. llms.txt Visual Builder &amp; Sitemap Importer</span>
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                        {workspace.links.length} Links
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('crawler_matrix')}
                    className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'crawler_matrix'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                        }`}
                >
                    <span className="inline-flex items-center gap-2">
                        <Bot className="w-4 h-4 shrink-0" />
                        <span>2. 45-Bot AI Crawler Matrix &amp; robots.txt</span>
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                        {workspace.bots.length} Bots
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('validator_linter')}
                    className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'validator_linter'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                        }`}
                >
                    <span className="inline-flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>3. 12-Point Linter &amp; Token Budget</span>
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                        {compiled.lintIssues.length} Alerts
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('full_txt_compiler')}
                    className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'full_txt_compiler'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                        }`}
                >
                    <span className="inline-flex items-center gap-2">
                        <Layers className="w-4 h-4 shrink-0" />
                        <span>4. HTML-to-Markdown llms-full.txt Compiler</span>
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                        DOM Cleaner
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('export_studio')}
                    className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'export_studio'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                        }`}
                >
                    <span className="inline-flex items-center gap-2">
                        <Code2 className="w-4 h-4 shrink-0" />
                        <span>5. 10-Format Export Studio (Next.js / TDMRep / XLSX)</span>
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                        10 Formats
                    </span>
                </button>
            </div>

            {/* ============================================================================
          TAB 1: LLMS.TXT & LLMS-FULL.TXT VISUAL BUILDER + SITEMAP IMPORTER
          ============================================================================ */}
            {activeTab === 'llms_builder' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left Column: Metadata, Sitemap Importer & Link List Editor */}
                    <div className="min-w-0 lg:col-span-7 space-y-4">
                        {/* Project Metadata Card */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-3">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                                <span>Site Identity &amp; llmstxt.org v2 Header Metadata</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Mandatory # H1 Project / Website Title
                                    </label>
                                    <input
                                        type="text"
                                        value={workspace.projectName}
                                        onChange={(e) => setWorkspace((p) => ({ ...p, projectName: e.target.value }))}
                                        placeholder="e.g. AcmeCloud Developer Documentation"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Canonical Base Site URL
                                    </label>
                                    <input
                                        type="text"
                                        value={workspace.siteUrl}
                                        onChange={(e) => setWorkspace((p) => ({ ...p, siteUrl: e.target.value }))}
                                        placeholder="https://docs.example.com"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                                    />
                                </div>
                            </div>
                            <div className="text-xs">
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    &gt; Blockquote Summary (Concise 1–2 Sentence Factual Abstract)
                                </label>
                                <textarea
                                    rows={2}
                                    value={workspace.summaryBlockquote}
                                    onChange={(e) => setWorkspace((p) => ({ ...p, summaryBlockquote: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                />
                            </div>
                            <div className="text-xs">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300">
                                        Factual Overview Paragraph (Optional Context Before H2 Sections)
                                    </label>
                                    {workspace.overviewParagraphs.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setWorkspace((p) => ({ ...p, overviewParagraphs: [] }))}
                                            className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                                        >
                                            Clear Overview
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
                                    placeholder="Optional 1–2 paragraph technical overview placed before your ## H2 link sections..."
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                />
                            </div>
                        </div>

                        {/* Smart Sitemap XML / Bulk URL Importer */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-3 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                                    <span>Smart Sitemap XML, RSS or Bulk URL List Importer</span>
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setSitemapInputText(SAMPLE_SITEMAP_XML_SNIPPET)}
                                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    Load Demo sitemap.xml Snippet
                                </button>
                            </div>
                            <textarea
                                rows={3}
                                value={sitemapInputText}
                                onChange={(e) => setSitemapInputText(e.target.value)}
                                placeholder="Paste raw sitemap.xml (<url><loc>...</loc></url>), RSS XML, or a newline-separated list of URLs..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px]"
                            />
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleImportSitemapOrUrls(true)}
                                    className="px-3.5 py-1.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition"
                                >
                                    + Append URLs to Curated List
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleImportSitemapOrUrls(false)}
                                    className="px-3.5 py-1.5 rounded-xl font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
                                >
                                    Replace Existing Links
                                </button>
                                {!sitemapInputText.trim() && (
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                        (Clicking with an empty box automatically loads the 4-URL Demo Sitemap)
                                    </span>
                                )}
                            </div>
                            {sitemapActionNotice && (
                                <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-2 text-[11px] font-semibold text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-2">
                                    <span>✓ {sitemapActionNotice}</span>
                                    <button
                                        type="button"
                                        onClick={() => setSitemapActionNotice(null)}
                                        className="text-emerald-700 dark:text-emerald-300 hover:underline shrink-0"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Add New Link & Curated Links List */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-3 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Curated ## H2 Section Links ({workspace.links.length})
                                </h3>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setWorkspace((p) => ({
                                                ...p,
                                                links: p.links.map((l) => ({ ...l, includedInLlmsTxt: true })),
                                            }));
                                            setLinkActionNotice('Enabled all links for llms.txt!');
                                        }}
                                        className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                    >
                                        Select All llms.txt
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setWorkspace((p) => ({
                                                ...p,
                                                links: p.links.map((l) => ({ ...l, includedInFullTxt: l.section.toLowerCase() !== 'optional' })),
                                            }));
                                            setLinkActionNotice('Enabled all primary section links for llms-full.txt!');
                                        }}
                                        className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                    >
                                        Select Primary full.txt
                                    </button>
                                </div>
                            </div>

                            {/* Clean 2-Row Add New Link Form (No Truncated Placeholders + Enter Key Support) */}
                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2.5">
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                                    <div className="sm:col-span-5">
                                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                            Link Title (Optional — auto-inferred if blank)
                                        </label>
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
                                            placeholder="e.g. REST API v2 Authentication"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                                        />
                                    </div>
                                    <div className="sm:col-span-7">
                                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                            Target Page URL (Full URL or /path — auto-generated if blank)
                                        </label>
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
                                            placeholder="https://kivarotools.com/api/webhooks or /docs/webhooks"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                                    <div className="sm:col-span-6">
                                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                            One-Line Factual Description (Optional — auto-generated if blank)
                                        </label>
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
                                            placeholder="Concise summary of what this documentation page answers..."
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                                        />
                                    </div>
                                    <div className="sm:col-span-4">
                                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                            Target ## H2 Section
                                        </label>
                                        <select
                                            value={newLinkSection}
                                            onChange={(e) => setNewLinkSection(e.target.value)}
                                            className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
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
                                            className="w-full px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold inline-flex items-center justify-center gap-1 shadow-xs transition cursor-pointer"
                                        >
                                            <Plus className="w-4 h-4 shrink-0" />
                                            <span>Add Link</span>
                                        </button>
                                    </div>
                                </div>

                                {linkActionNotice && (
                                    <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-2 text-[11px] font-semibold text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-2">
                                        <span>✓ {linkActionNotice}</span>
                                        <button
                                            type="button"
                                            onClick={() => setLinkActionNotice(null)}
                                            className="text-emerald-700 dark:text-emerald-300 hover:underline shrink-0"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div ref={linksListRef} className="max-h-[460px] overflow-y-auto space-y-2 pr-1">
                                {workspace.links.map((link, idx) => (
                                    <div
                                        key={link.id}
                                        className={`p-3 rounded-xl border transition space-y-2 ${recentlyAddedLinkId === link.id
                                            ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/30 ring-2 ring-emerald-500/30'
                                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950'
                                            }`}
                                    >
                                        <div className="space-y-2">
                                            {/* Row 1: Link Index + Editable Title */}
                                            <div className="flex items-center gap-2 w-full min-w-0">
                                                <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                                                    #{idx + 1}
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
                                                    className="w-full min-w-0 flex-1 font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 focus:border-indigo-500 outline-none"
                                                />
                                            </div>

                                            {/* Row 2: Mobile-Responsive Controls Bar (Section Dropdown + Checkboxes + Up/Down + Delete) */}
                                            <div className="flex flex-wrap items-center justify-between gap-2 w-full pt-0.5">
                                                <select
                                                    value={link.section}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setWorkspace((p) => ({
                                                            ...p,
                                                            links: p.links.map((x) => (x.id === link.id ? { ...x, section: val } : x)),
                                                        }));
                                                    }}
                                                    className="w-full sm:w-auto px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold border border-indigo-200 dark:border-indigo-800"
                                                >
                                                    {SECTION_OPTIONS.map((sec) => (
                                                        <option key={sec} value={sec}>
                                                            ## {sec}
                                                        </option>
                                                    ))}
                                                </select>

                                                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                                                    <div className="flex items-center gap-1.5">
                                                        <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-medium cursor-pointer shrink-0">
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
                                                        <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-medium cursor-pointer shrink-0">
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
                                                            <span>full.txt</span>
                                                        </label>
                                                    </div>

                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                            type="button"
                                                            disabled={idx === 0}
                                                            title="Move link up"
                                                            onClick={() =>
                                                                setWorkspace((p) => {
                                                                    if (idx === 0) return p;
                                                                    const next = [...p.links];
                                                                    const tmp = next[idx - 1];
                                                                    next[idx - 1] = next[idx];
                                                                    next[idx] = tmp;
                                                                    return { ...p, links: next };
                                                                })
                                                            }
                                                            className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 font-bold text-xs"
                                                        >
                                                            ↑
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={idx === workspace.links.length - 1}
                                                            title="Move link down"
                                                            onClick={() =>
                                                                setWorkspace((p) => {
                                                                    if (idx >= p.links.length - 1) return p;
                                                                    const next = [...p.links];
                                                                    const tmp = next[idx + 1];
                                                                    next[idx + 1] = next[idx];
                                                                    next[idx] = tmp;
                                                                    return { ...p, links: next };
                                                                })
                                                            }
                                                            className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 font-bold text-xs"
                                                        >
                                                            ↓
                                                        </button>
                                                        <button
                                                            type="button"
                                                            title="Delete link"
                                                            onClick={() =>
                                                                setWorkspace((p) => ({
                                                                    ...p,
                                                                    links: p.links.filter((x) => x.id !== link.id),
                                                                }))
                                                            }
                                                            className="inline-flex items-center justify-center p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-800"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
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
                                            className="w-full font-mono text-[11px] text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800"
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
                                            className="w-full text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800"
                                        />
                                        <details className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                                            <summary className="cursor-pointer font-semibold text-indigo-600 dark:text-indigo-400 select-none">
                                                Edit Full Markdown Content for llms-full.txt &amp; llms-ctx.txt
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
                                                className="mt-1.5 w-full font-mono text-[11px] text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800"
                                            />
                                        </details>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Live Compiled llms.txt & llms-full.txt Output Preview */}
                    <div className="min-w-0 lg:col-span-5 space-y-4">
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setBuilderPreviewMode('llms_txt')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${builderPreviewMode === 'llms_txt'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        llms.txt (~{compiled.tokenBudget.llmsTxtTokens} tok)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBuilderPreviewMode('llms_full_txt')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${builderPreviewMode === 'llms_full_txt'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        llms-full.txt (~{compiled.tokenBudget.llmsFullTxtTokens} tok)
                                    </button>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const txt = builderPreviewMode === 'llms_txt' ? compiled.llmsTxt : compiled.llmsFullTxt;
                                            void navigator.clipboard?.writeText(txt);
                                            setStatusBanner(
                                                `Copied ${builderPreviewMode === 'llms_txt' ? 'llms.txt' : 'llms-full.txt'} to clipboard!`
                                            );
                                        }}
                                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white inline-flex items-center gap-1"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copy</span>
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
                                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white inline-flex items-center gap-1"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Download</span>
                                    </button>
                                </div>
                            </div>

                            <pre className="rounded-xl bg-slate-950 text-emerald-300 p-4 font-mono text-xs overflow-x-auto max-w-full max-h-[680px] whitespace-pre-wrap break-words leading-relaxed">
                                {builderPreviewMode === 'llms_txt' ? compiled.llmsTxt : compiled.llmsFullTxt}
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================================
          TAB 2: 45-BOT AI CRAWLER MATRIX & RFC 9309 ROBOTS.TXT STUDIO
          ============================================================================ */}
            {activeTab === 'crawler_matrix' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="min-w-0 lg:col-span-7 space-y-4">
                        {/* RFC 9309 Inheritance Guard, Disallow Paths & IETF Content-Usage Controls */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>RFC 9309 Specific-Group Inheritance Guard &amp; IETF AIPREF Controls</span>
                                    </h3>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Prevents allowed AI bots from bypassing your global Disallow paths under RFC 9309 §2.2.1.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer bg-slate-50/50 dark:bg-slate-800/30">
                                    <input
                                        type="checkbox"
                                        checked={workspace.enforceRfc9309InheritanceGuard}
                                        onChange={(e) =>
                                            setWorkspace((p) => ({ ...p, enforceRfc9309InheritanceGuard: e.target.checked }))
                                        }
                                        className="mt-0.5 rounded text-indigo-600"
                                    />
                                    <div>
                                        <span className="font-bold block text-slate-900 dark:text-white">
                                            Enforce RFC 9309 Disallow Inheritance
                                        </span>
                                        <span className="text-[11px] text-slate-500">
                                            Repeats global Disallow paths inside every allowed AI bot group so /admin/ and /checkout/ stay private.
                                        </span>
                                    </div>
                                </label>

                                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer bg-slate-50/50 dark:bg-slate-800/30">
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
                                        <span className="font-bold block text-slate-900 dark:text-white">
                                            Allow AI Foundation Model Training (train-ai=y)
                                        </span>
                                        <span className="text-[11px] text-slate-500">
                                            Uncheck to emit IETF <code>Content-Usage: train-ai=n</code> and W3C <code>tdm-reservation: 1</code>.
                                        </span>
                                    </div>
                                </label>
                            </div>

                            {/* Global Disallow Paths Manager */}
                            <div className="space-y-2">
                                <label className="block font-bold text-slate-700 dark:text-slate-300">
                                    Global Protected Disallow Paths (Applied to User-agent: * and Inherited by Allowed AI Bots):
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
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
                                        placeholder="/admin/ or /api/internal/ (Press Enter or click + Add Path)"
                                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const clean = newDisallowPath.trim() || `/private-route-${workspace.globalDisallowPaths.length + 1}/`;
                                            const formatted = clean.startsWith('/') ? clean : `/${clean}`;
                                            if (!workspace.globalDisallowPaths.includes(formatted)) {
                                                setWorkspace((p) => ({
                                                    ...p,
                                                    globalDisallowPaths: [...p.globalDisallowPaths, formatted],
                                                }));
                                            }
                                            setNewDisallowPath('');
                                            setStatusBanner(`Added global Disallow path "${formatted}" to robots.txt!`);
                                        }}
                                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                                    >
                                        + Add Path
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {workspace.globalDisallowPaths.map((dp) => (
                                        <span
                                            key={dp}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px] bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                        >
                                            <span>Disallow: {dp}</span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setWorkspace((p) => ({
                                                        ...p,
                                                        globalDisallowPaths: p.globalDisallowPaths.filter((x) => x !== dp),
                                                    }))
                                                }
                                                className="font-bold hover:text-rose-900"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* W3C TDMRep (/.well-known/tdmrep.json) & Crawl-Delay Settings */}
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        SPDX License / Terms
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
                                        placeholder="Apache-2.0 / CC-BY-NC-4.0 / Proprietary"
                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Crawl-Delay (Seconds, Optional)
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
                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 45-Bot Interactive Directory */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-3 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h3 className="text-sm font-bold">
                                    45-Bot Verified 2026 AI Crawler Matrix ({filteredBots.length} Shown)
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
                                        className="px-2.5 py-1 rounded-lg font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
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
                                        className="px-2.5 py-1 rounded-lg font-semibold bg-slate-100 dark:bg-slate-800"
                                    >
                                        Allow All 45
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                <div className="sm:col-span-6 relative">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
                                    <input
                                        type="text"
                                        value={botSearch}
                                        onChange={(e) => setBotSearch(e.target.value)}
                                        placeholder="Search GPTBot, OAI-SearchBot, Claude, Perplexity..."
                                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    />
                                </div>
                                <div className="sm:col-span-6">
                                    <select
                                        value={botRoleFilter}
                                        onChange={(e) => setBotRoleFilter(e.target.value)}
                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                                    >
                                        <option value="ALL">All 5 Taxonomic Bot Roles ({workspace.bots.length})</option>
                                        <option value="AI_SEARCH_CITATION">1. AI Search &amp; Live Citation Bots (Keep Allowed)</option>
                                        <option value="USER_TRIGGERED_FETCHER">2. User-Triggered Assistants (ChatGPT-User, Claude-User)</option>
                                        <option value="USAGE_OPT_OUT_TOKEN">3. Usage Opt-Out Tokens (Google-Extended, Applebot-Extended)</option>
                                        <option value="MODEL_TRAINING_SCRAPER">4. Foundation Model Training Crawlers (GPTBot, ClaudeBot)</option>
                                        <option value="BULK_DATASET_SCRAPER">5. Bulk Dataset Scrapers (CCBot, Bytespider, Diffbot)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="max-h-[460px] overflow-y-auto space-y-2 pr-1">
                                {filteredBots.map((bot) => {
                                    const isAllowed = bot.permission === 'ALLOW';
                                    return (
                                        <div
                                            key={bot.id}
                                            className={`p-3 rounded-xl border transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 ${isAllowed
                                                ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/15'
                                                : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/15'
                                                }`}
                                        >
                                            <div className="min-w-0 space-y-1">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                                                        {bot.userAgent}
                                                    </span>
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                        {bot.operator}
                                                    </span>
                                                    <span
                                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${bot.role === 'AI_SEARCH_CITATION' || bot.role === 'USER_TRIGGERED_FETCHER'
                                                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                                                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                                            }`}
                                                    >
                                                        {bot.role.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-600 dark:text-slate-300">{bot.description}</p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                                    <strong>GEO Note:</strong> {bot.geoImpactNote}
                                                </p>
                                            </div>

                                            <div className="flex flex-col items-start sm:items-end gap-1.5 w-full sm:w-auto shrink-0">
                                                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setWorkspace((p) => ({
                                                                ...p,
                                                                bots: p.bots.map((x) =>
                                                                    x.id === bot.id ? { ...x, permission: 'ALLOW' } : x
                                                                ),
                                                            }))
                                                        }
                                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${bot.permission === 'ALLOW'
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                            }`}
                                                    >
                                                        ALLOW
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setWorkspace((p) => ({
                                                                ...p,
                                                                bots: p.bots.map((x) =>
                                                                    x.id === bot.id ? { ...x, permission: 'BLOCK' } : x
                                                                ),
                                                            }))
                                                        }
                                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${bot.permission === 'BLOCK'
                                                            ? 'bg-rose-600 text-white'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                            }`}
                                                    >
                                                        BLOCK
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setWorkspace((p) => ({
                                                                ...p,
                                                                bots: p.bots.map((x) =>
                                                                    x.id === bot.id
                                                                        ? {
                                                                            ...x,
                                                                            permission: 'CUSTOM_PATHS',
                                                                            customAllowPaths:
                                                                                x.customAllowPaths.length > 0 ? x.customAllowPaths : ['/docs/'],
                                                                            customDisallowPaths:
                                                                                x.customDisallowPaths.length > 0 ? x.customDisallowPaths : ['/private/'],
                                                                        }
                                                                        : x
                                                                ),
                                                            }))
                                                        }
                                                        className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${bot.permission === 'CUSTOM_PATHS'
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                            }`}
                                                    >
                                                        CUSTOM
                                                    </button>
                                                </div>
                                                {bot.permission === 'CUSTOM_PATHS' && (
                                                    <div className="flex flex-wrap gap-1.5 text-[10px] w-full sm:w-64">
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
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Live Compiled robots.txt & Import Box */}
                    <div className="min-w-0 lg:col-span-5 space-y-4">
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h3 className="text-sm font-bold">Live Compiled robots.txt (RFC 9309 + IETF AIPREF)</h3>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            void navigator.clipboard?.writeText(compiled.robotsTxt);
                                            setStatusBanner('Copied robots.txt to clipboard!');
                                        }}
                                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white inline-flex items-center gap-1"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copy</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => triggerDownload(compiled.robotsTxt, 'robots.txt', 'text/plain;charset=utf-8')}
                                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white inline-flex items-center gap-1"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Download robots.txt</span>
                                    </button>
                                </div>
                            </div>
                            <pre className="rounded-xl bg-slate-950 text-emerald-300 p-4 font-mono text-xs overflow-x-auto max-w-full max-h-[540px] whitespace-pre-wrap break-words leading-relaxed">
                                {compiled.robotsTxt}
                            </pre>

                            {/* Import Existing robots.txt to Audit */}
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                                        Paste Existing robots.txt to Audit &amp; Import Rules:
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setImportRobotsText(
                                                'User-agent: *\nDisallow: /admin/\nDisallow: /checkout/\nUser-agent: OAI-SearchBot\nAllow: /\nUser-agent: Claude-Web\nDisallow: /\nUser-agent: GPTBot\nDisallow: /\nSitemap: https://kivarotools.com/sitemap.xml'
                                            )
                                        }
                                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        Load Demo robots.txt
                                    </button>
                                </div>
                                <textarea
                                    rows={3}
                                    value={importRobotsText}
                                    onChange={(e) => setImportRobotsText(e.target.value)}
                                    placeholder="User-agent: *\nDisallow: /admin/\nUser-agent: Claude-Web\nDisallow: /"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px]"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const rawToParse =
                                            importRobotsText.trim() ||
                                            'User-agent: *\nDisallow: /admin/\nDisallow: /checkout/\nUser-agent: OAI-SearchBot\nAllow: /\nUser-agent: Claude-Web\nDisallow: /\nUser-agent: GPTBot\nDisallow: /\nSitemap: https://kivarotools.com/sitemap.xml';
                                        const parsedRob = parseExistingRobotsTxt(rawToParse, workspace.bots);
                                        setWorkspace((p) => ({
                                            ...p,
                                            bots: parsedRob.updatedBots,
                                            globalDisallowPaths: parsedRob.globalDisallowPaths,
                                            sitemapUrl: parsedRob.sitemapUrl || p.sitemapUrl,
                                            deprecatedTokensDetected: parsedRob.deprecatedTokensDetected,
                                        }));
                                        setImportRobotsText('');
                                        const msg = `Audited robots.txt (${parsedRob.globalDisallowPaths.length} global Disallow path(s), ${parsedRob.deprecatedTokensDetected.length} deprecated token(s) flagged)!`;
                                        setRobotsImportNotice(msg);
                                        setStatusBanner(msg);
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                                >
                                    Parse &amp; Audit Existing robots.txt
                                </button>
                                {robotsImportNotice && (
                                    <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-200">
                                        ✓ {robotsImportNotice}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================================
          TAB 3: 12-POINT VALIDATOR, RFC 9309 CONFLICT LINTER & TOKEN BUDGET
          ============================================================================ */}
            {activeTab === 'validator_linter' && (
                <div className="space-y-5">
                    {/* 12-Point Linter & 1-Click Auto-Fix */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-bold flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0" />
                                    <span>
                                        12-Point llmstxt.org v2 Specification &amp; RFC 9309 Cross-File Linter (Score: {compiled.healthScore}/100)
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Audits H1/blockquote syntax, relative URLs, marketing fluff, duplicate links, AI search invisibility
                                    conflicts, and RFC 9309 specific-group inheritance leaks.
                                </p>
                            </div>
                            {compiled.lintIssues.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setWorkspace((prev) => autoFixGeoWorkspace(prev));
                                        setStatusBanner(
                                            'Applied 1-Click Auto-Fix: resolved relative URLs, stripped marketing buzzwords, enabled RFC 9309 Inheritance Guard, and purged deprecated bot tokens!'
                                        );
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
                                >
                                    <Wrench className="w-4 h-4" />
                                    <span>1-Click Auto-Fix All {compiled.lintIssues.length} Issue(s)</span>
                                </button>
                            )}
                        </div>

                        {compiled.lintIssues.length === 0 ? (
                            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                <span>
                                    <strong>PASSED ALL 12 CHECKS (100/100):</strong> Your <code>llms.txt</code>,{' '}
                                    <code>llms-full.txt</code>, and <code>robots.txt</code> are 100% compliant with{' '}
                                    <code>llmstxt.org</code> v2 and RFC 9309 with zero inheritance leaks or search bot conflicts!
                                </span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {compiled.lintIssues.map((issue) => (
                                    <div
                                        key={issue.id}
                                        className={`p-4 rounded-xl border text-xs space-y-2 min-w-0 ${issue.severity === 'CRITICAL'
                                            ? 'border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20'
                                            : 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                                <span>{issue.title}</span>
                                            </span>
                                            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-900 text-white shrink-0">
                                                {issue.targetFile}
                                            </span>
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{issue.explanation}</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                            <strong>Remediation:</strong> {issue.remediation}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Paste Existing llms.txt to Validate */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <label className="block font-bold text-slate-700 dark:text-slate-300">
                                    Paste Existing llms.txt Content to Validate &amp; Repair:
                                </label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setImportLlmsText(
                                            '# Acme Broken Docs\n> Our revolutionary world-class synergistic AI platform.\n## Core Documentation\n- [Click here](/docs/relative-link): Cutting-edge guide.\n- [Read more](https://kivarotools.com/api/auth): Duplicate link.\n- [Read more](https://kivarotools.com/api/auth): Duplicate link.'
                                        )
                                    }
                                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    Load Demo Broken llms.txt
                                </button>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <textarea
                                    rows={2}
                                    value={importLlmsText}
                                    onChange={(e) => setImportLlmsText(e.target.value)}
                                    placeholder="# My Project\n> Summary...\n## Docs\n- [Click here](/relative-path): Our revolutionary platform..."
                                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px]"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const rawToValidate =
                                            importLlmsText.trim() ||
                                            '# Acme Broken Docs\n> Our revolutionary world-class synergistic AI platform.\n## Core Documentation\n- [Click here](/docs/relative-link): Cutting-edge guide.\n- [Read more](https://kivarotools.com/api/auth): Duplicate link.\n- [Read more](https://kivarotools.com/api/auth): Duplicate link.';
                                        const parsed = parseExistingLlmsTxt(rawToValidate, workspace.siteUrl);
                                        setWorkspace((p) => ({
                                            ...p,
                                            projectName: parsed.projectName,
                                            summaryBlockquote: parsed.summaryBlockquote,
                                            overviewParagraphs: parsed.overviewParagraphs,
                                            links: parsed.links.length > 0 ? parsed.links : p.links,
                                        }));
                                        setImportLlmsText('');
                                        const msg = `Loaded llms.txt (${parsed.links.length} link(s)) into 12-Point Linter!`;
                                        setLlmsValidateNotice(msg);
                                        setStatusBanner(msg);
                                    }}
                                    className="px-4 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 cursor-pointer"
                                >
                                    Load &amp; Validate llms.txt
                                </button>
                            </div>
                            {llmsValidateNotice && (
                                <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-200">
                                    ✓ {llmsValidateNotice}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Multi-Model Context Window & Token Budget Table */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        <div className="min-w-0 lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-indigo-600 shrink-0" />
                                <span>Multi-Model LLM Context Window &amp; Token Cost Estimator</span>
                            </h3>
                            <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                                <table className="min-w-[580px] w-full text-left border-collapse text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="py-2.5 px-3">LLM Target Model</th>
                                            <th className="py-2.5 px-3">Context Window</th>
                                            <th className="py-2.5 px-3">llms.txt Share</th>
                                            <th className="py-2.5 px-3">llms-full.txt Share</th>
                                            <th className="py-2.5 px-3">Cost / 1K Reads</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                                        {compiled.tokenBudget.modelComparisons.map((m) => (
                                            <tr key={m.modelName}>
                                                <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                                                    {m.modelName}
                                                </td>
                                                <td className="py-2.5 px-3 font-mono">
                                                    {m.contextWindowTokens.toLocaleString()} tok
                                                </td>
                                                <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                                    {m.llmsTxtPercentOfContext}%
                                                </td>
                                                <td className="py-2.5 px-3 font-mono">
                                                    {m.llmsFullTxtPercentOfContext}%
                                                </td>
                                                <td className="py-2.5 px-3 font-mono">${m.estimatedCostPer1000ReadsUsd}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="min-w-0 lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
                            <h3 className="text-sm font-bold">Section-by-Section Token Breakdown</h3>
                            <div className="space-y-2 text-xs">
                                {compiled.tokenBudget.sectionBreakdown.map((sec) => (
                                    <div
                                        key={sec.sectionName}
                                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex items-center justify-between"
                                    >
                                        <div>
                                            <span className="font-bold text-slate-900 dark:text-white">## {sec.sectionName}</span>
                                            {sec.isOptionalSection && (
                                                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold">
                                                    Skippable by LLMs
                                                </span>
                                            )}
                                            <div className="text-[11px] text-slate-500">{sec.linkCount} link(s)</div>
                                        </div>
                                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                            ~{sec.tokens} tokens
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================================
          TAB 4: HTML-TO-MARKDOWN LLMS-FULL.TXT & LLMS-CTX.TXT COMPILER
          ============================================================================ */}
            {activeTab === 'full_txt_compiler' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="min-w-0 lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-sm font-bold">
                                1. Paste Raw HTML Page Source (Strips &lt;nav&gt;, &lt;script&gt;, &lt;style&gt;, &lt;footer&gt;)
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setHtmlSourceInput(SAMPLE_HTML_DOC_SNIPPET);
                                    setHtmlPageUrl('https://kivarotools.com/api/webhooks');
                                }}
                                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                            >
                                Reset Demo HTML
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                                <label className="block font-semibold mb-1">Source Page URL</label>
                                <input
                                    type="text"
                                    value={htmlPageUrl}
                                    onChange={(e) => setHtmlPageUrl(e.target.value)}
                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Target ## H2 Section</label>
                                <select
                                    value={htmlTargetSection}
                                    onChange={(e) => setHtmlTargetSection(e.target.value)}
                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
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
                            rows={14}
                            value={htmlSourceInput}
                            onChange={(e) => setHtmlSourceInput(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-[11px]"
                        />

                        <button
                            type="button"
                            onClick={handleAppendConvertedHtmlToFullTxt}
                            className="w-full py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition cursor-pointer"
                        >
                            + Add Extracted Markdown Page to llms.txt &amp; llms-full.txt Bundle
                        </button>
                        {htmlCompilerNotice && (
                            <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-2 text-[11px] font-semibold text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-2">
                                <span>✓ {htmlCompilerNotice}</span>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('llms_builder')}
                                    className="text-indigo-600 dark:text-indigo-400 underline font-bold shrink-0"
                                >
                                    View in Tab 1 →
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <h3 className="text-sm font-bold">2. Extracted Clean LLM Markdown Preview</h3>
                                <p className="text-[11px] text-slate-500">
                                    Title: <strong>{convertedHtmlPreview.title}</strong> • {convertedHtmlPreview.wordCount} words • ~
                                    {convertedHtmlPreview.estimatedTokens} tokens
                                </p>
                            </div>
                        </div>
                        <pre className="rounded-xl bg-slate-950 text-emerald-300 p-4 font-mono text-xs overflow-x-auto max-w-full max-h-[420px] whitespace-pre-wrap break-words leading-relaxed">
                            {convertedHtmlPreview.markdownBody}
                        </pre>
                    </div>
                </div>
            )}

            {/* ============================================================================
          TAB 5: 10-FORMAT GEO, NEXT.JS & EDGE DEPLOYMENT EXPORT STUDIO
          ============================================================================ */}
            {activeTab === 'export_studio' && (
                <div className="space-y-5">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mb-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>10 Synchronized GEO &amp; AI Governance Deliverables Ready</span>
                                </div>
                                <h3 className="text-base font-bold">
                                    10-Target Export Studio (llms.txt, llms-full.txt, robots.txt, Next.js route.ts, W3C tdmrep.json &amp; Excel)
                                </h3>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => triggerDownload(compiled.llmsTxt, 'llms.txt', 'text/plain;charset=utf-8')}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download llms.txt</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => triggerDownload(compiled.llmsFullTxt, 'llms-full.txt', 'text/plain;charset=utf-8')}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download llms-full.txt</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => triggerDownload(compiled.robotsTxt, 'robots.txt', 'text/plain;charset=utf-8')}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-blue-600 text-white"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download robots.txt</span>
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
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white"
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5" />
                                    <span>Export Excel (.xlsx)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const csv = exportGeoInventoryCsv(workspace, true);
                                        triggerDownload(csv, 'geo_ai_governance_matrix.csv', 'text/csv;charset=utf-8');
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white"
                                >
                                    <FileCode className="w-3.5 h-3.5" />
                                    <span>Export CSV (.csv)</span>
                                </button>
                            </div>
                        </div>

                        {/* Deliverable Selector Pills */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap gap-1.5">
                                {[
                                    { id: 'llms_txt' as const, label: '1. llms.txt (v2 Index)' },
                                    { id: 'llms_full_txt' as const, label: '2. llms-full.txt (Full Bundle)' },
                                    { id: 'llms_ctx_txt' as const, label: '3. llms-ctx.txt (XML Context)' },
                                    { id: 'robots_txt' as const, label: '4. robots.txt (RFC 9309 + AIPREF)' },
                                    { id: 'ai_txt' as const, label: '5. ai.txt' },
                                    { id: 'tdmrep_json' as const, label: '6. /.well-known/tdmrep.json' },
                                    { id: 'nextjs_routes' as const, label: '7. Next.js route.ts & robots.ts' },
                                    { id: 'edge_headers' as const, label: '8. Cloudflare / Nginx Headers' },
                                    { id: 'markdown_guide' as const, label: '9. Deployment Checklist (.md)' },
                                    { id: 'certificate_json' as const, label: '10. SHA-256 Audit Cert (.json)' },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setExportFormat(item.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${exportFormat === item.id
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        void navigator.clipboard?.writeText(activeExportText);
                                        setCopiedExport(true);
                                        setTimeout(() => setCopiedExport(false), 2000);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white"
                                >
                                    {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copiedExport ? 'Copied!' : 'Copy Code'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const fileMap: Record<typeof exportFormat, { name: string; mime: string }> = {
                                            llms_txt: { name: 'llms.txt', mime: 'text/plain;charset=utf-8' },
                                            llms_full_txt: { name: 'llms-full.txt', mime: 'text/plain;charset=utf-8' },
                                            llms_ctx_txt: { name: 'llms-ctx.txt', mime: 'application/xml;charset=utf-8' },
                                            robots_txt: { name: 'robots.txt', mime: 'text/plain;charset=utf-8' },
                                            ai_txt: { name: 'ai.txt', mime: 'text/plain;charset=utf-8' },
                                            tdmrep_json: { name: 'tdmrep.json', mime: 'application/json;charset=utf-8' },
                                            nextjs_routes: { name: 'nextjs-llms-and-robots-routes.ts', mime: 'text/plain;charset=utf-8' },
                                            edge_headers: { name: 'cloudflare-nginx-ai-headers.conf', mime: 'text/plain;charset=utf-8' },
                                            markdown_guide: { name: 'geo-deployment-checklist.md', mime: 'text/markdown;charset=utf-8' },
                                            certificate_json: { name: 'geo-sha256-compliance-certificate.json', mime: 'application/json;charset=utf-8' },
                                        };
                                        const cfg = fileMap[exportFormat];
                                        triggerDownload(activeExportText, cfg.name, cfg.mime);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download Active File</span>
                                </button>
                            </div>
                        </div>

                        <pre className="rounded-xl bg-slate-950 text-emerald-300 p-4 font-mono text-xs overflow-x-auto max-w-full max-h-[520px] whitespace-pre-wrap break-words leading-relaxed">
                            {activeExportText}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}