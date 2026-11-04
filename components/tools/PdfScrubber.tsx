"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
    Shield,
    ShieldAlert,
    ShieldCheck,
    Upload,
    FileText,
    Download,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Search,
    Layers,
    Calculator,
    QrCode,
    FileSpreadsheet,
    FileCode,
    Sparkles,
    RefreshCw,
    Plus,
    Trash2,
    Sliders,
    Info,
    Check,
    Copy,
    FileCheck,
    KeyRound,
    Table,
    Terminal
} from 'lucide-react';

import {
    PDF_SCRUBBER_ENGINE_VERSION,
    MAX_SAFE_PDF_BYTES,
    parseFinancialPdfFile,
    applyPresetToEntitiesAndTransactions,
    detectFinancialMathLeaks,
    applyPdfRedactionsAndSanitize,
    generateComplianceCertificateJson,
    exportPrivilegeLogCsv,
    exportPrivilegeLogXlsx,
    encryptRedactionVault,
    decryptRedactionVault,
    generateSampleFinancialPdf,
    createPdfScrubberWorkerDispatcher,
    isPdfScrubberCancelledError,
    formatRedactedReplacement,
    type FinancialPresetId,
    type PiiCategory,
    type RedactionStyle,
    type RedactionOutputMode,
    type ExemptionReasonCode,
    type DetectedPiiEntity,
    type FinancialTransactionRow,
    type PdfScrubberParseResult,
    type RedactionExecutionOutcome,
    type PdfScrubberWorkerDispatcher
} from '@/lib/pdfFinancialScrubberEngine';

type WorkbenchTab =
    | 'redaction_studio'
    | 'math_guard'
    | 'deep_cdr_xray'
    | 'forensic_proof'
    | 'vault_and_logs';

interface CustomRectItem {
    id: string;
    pageIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    repeatAllPages: boolean;
}

const WORKFLOW_PRESETS: {
    id: FinancialPresetId;
    name: string;
    shortBadge: string;
    description: string;
}[] = [
        {
            id: 'mortgage_underwriter',
            name: 'Mortgage & Loan Underwriter',
            shortBadge: 'Keep Last-4 • Keep Balances',
            description:
                'Keeps Account Holder Name, Billing Address, Running Balances, and Deposit rows visible for underwriting while masking Account, IBAN, Card PAN, and Tax IDs to Last-4 and blacking out Routing/MICR/QR codes.'
        },
        {
            id: 'landlord_income_proof',
            name: 'Landlord / Rental Proof-of-Income',
            shortBadge: 'Keep Salary • Hide Spend',
            description:
                'Keeps Applicant Name, Address, and Payroll/Income Inflows visible while redacting Personal Spend rows and flagging coupled Running Balances via the Financial Math Leak Guard.'
        },
        {
            id: 'freelancer_portfolio_invoice',
            name: 'Freelancer / Agency Sample Invoice',
            shortBadge: 'Hide Client & Pricing',
            description:
                'Redacts Client Name, Contact Info, Invoice/PO Numbers, Unit Prices, Subtotals, VAT/Tax, Grand Totals, Bank Wire Details, and ZATCA/Factur-X payloads so you can showcase invoice layout safely.'
        },
        {
            id: 'external_tax_audit',
            name: 'External Bookkeeper / Tax Audit',
            shortBadge: 'Hide Raw Bank & SSN/CNIC',
            description:
                'Redacts raw Bank Account numbers, IBANs, ABA Routing/Sort Codes, Check MICR lines, and personal SSN/CNIC/Aadhaar numbers while preserving Business Tax IDs, Invoice Numbers, and Totals.'
        },
        {
            id: 'ai_llm_pseudonymizer',
            name: 'AI / LLM Safe-Upload Pseudonymizer',
            shortBadge: 'Consistent [TOKEN_01] Map',
            description:
                'Replaces all PII and financial identifiers with deterministic tokens ([IBAN_01], [PARTY_01], [ACCT_01]) while keeping numeric amounts and running balances intact for AI financial analysis.'
        },
        {
            id: 'strict_zero_pii_foia',
            name: 'Strict Zero-PII Legal / FOIA Discovery',
            shortBadge: 'Full Blackout • FOIA (b)(6)',
            description:
                'Maximum security preset: blackouts every detected identifier, counterparty name, address, tax ID, card PAN, account number, and currency figure with FOIA/Privacy exemption reason codes.'
        }
    ];

const SAMPLE_FILES: {
    id: 'enterprise_bank_statement' | 'hybrid_b2b_tax_invoice' | 'payroll_w2_remittance';
    title: string;
    subtitle: string;
    badge: string;
}[] = [
        {
            id: 'enterprise_bank_statement',
            title: 'Commercial Bank Statement',
            subtitle: 'PK/GB IBANs, US ABA, Luhn Visa PAN, Check MICR, 5 Tx Rows & Coupled Balances',
            badge: '12-Surface CDR • Luhn/IBAN'
        },
        {
            id: 'hybrid_b2b_tax_invoice',
            title: 'Hybrid B2B Tax Invoice',
            subtitle: 'ZATCA TLV Base64 QR, Embedded Factur-X XML (/AF), GSTIN, NTN, DE IBAN & Totals',
            badge: 'ZATCA TLV • Factur-X XML'
        },
        {
            id: 'payroll_w2_remittance',
            title: 'Payroll & W-2 Tax Packet',
            subtitle: 'US SSN, Pakistan CNIC, Australian ABN, Fillable /AcroForm /V & /ActualText Leaks',
            badge: 'AcroForm /V • SSN/CNIC'
        }
    ];

const REASON_CODE_LABELS: { code: ExemptionReasonCode; label: string }[] = [
    { code: 'PRIVACY_REDACTED', label: 'PRIVACY_REDACTED (General PII)' },
    { code: 'PCI_DSS_REQ_3_4', label: 'PCI-DSS v4.0 Req 3.4 (Card PAN)' },
    { code: 'GDPR_ART_6_PII', label: 'GDPR Art. 6 / Art. 17 (Personal Data)' },
    { code: 'HIPAA_SAFE_HARBOR', label: 'HIPAA 45 CFR §164.514 (Safe Harbor)' },
    { code: 'FOIA_B4_TRADE_SECRET', label: 'FOIA Exemption (b)(4) (Trade Secret)' },
    { code: 'FOIA_B6_PERSONAL_PRIVACY', label: 'FOIA Exemption (b)(6) (Personal Privacy)' },
    { code: 'IRS_TAX_CONFIDENTIAL', label: 'IRC §6103 (Tax Return Confidential)' },
    { code: 'NONE', label: 'No Overlay Badge (Solid Bar Only)' }
];

const STYLE_LABELS: { style: RedactionStyle; label: string }[] = [
    { style: 'blackout', label: 'Solid Blackout Bar' },
    { style: 'whiteout', label: 'Clean Whiteout Bar' },
    { style: 'keep_last_4', label: 'Mask Keep Last-4 (****1234)' },
    { style: 'tokenize', label: 'Consistent Token ([IBAN_01])' }
];

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function PdfScrubber() {
    const [parsed, setParsed] = useState<PdfScrubberParseResult | null>(null);
    const [activePreset, setActivePreset] = useState<FinancialPresetId>('landlord_income_proof');
    const [activeTab, setActiveTab] = useState<WorkbenchTab>('redaction_studio');
    const [selectedPageIdx, setSelectedPageIdx] = useState<number>(0);
    const [executionMode, setExecutionMode] = useState<'worker' | 'main-thread-fallback'>('worker');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [statusBanner, setStatusBanner] = useState<string | null>(null);

    // Redaction execution options
    const [outputMode, setOutputMode] = useState<RedactionOutputMode>('surgical_cdr');
    const [defaultStyle, setDefaultStyle] = useState<RedactionStyle>('blackout');
    const [defaultReasonCode, setDefaultReasonCode] = useState<ExemptionReasonCode>('PRIVACY_REDACTED');
    const [antiInferencePadding, setAntiInferencePadding] = useState<boolean>(true);
    const [autoMaskCoupledMath, setAutoMaskCoupledMath] = useState<boolean>(true);
    const [underwriterAttestationBadge, setUnderwriterAttestationBadge] = useState<boolean>(true);

    // Filter & search state for entity queue
    const [entitySearch, setEntitySearch] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
    const [customPatternInput, setCustomPatternInput] = useState<string>('');

    // Custom rectangular zones (e.g., bank stamps, signatures, logos)
    const [customRects, setCustomRects] = useState<CustomRectItem[]>([]);
    const [newRectLabel, setNewRectLabel] = useState<string>('Bank Stamp / Signature Zone');
    const [newRectX, setNewRectX] = useState<number>(40);
    const [newRectY, setNewRectY] = useState<number>(48);
    const [newRectW, setNewRectW] = useState<number>(240);
    const [newRectH, setNewRectH] = useState<number>(22);
    const [newRectAllPages, setNewRectAllPages] = useState<boolean>(true);

    // Live redaction outcome & forensic report
    const [redactionOutcome, setRedactionOutcome] = useState<RedactionExecutionOutcome | null>(null);

    // Encrypted .kivaro-vault state
    const [vaultPassphrase, setVaultPassphrase] = useState<string>('');
    const [generatedVaultText, setGeneratedVaultText] = useState<string>('');
    const [vaultRestoreInput, setVaultRestoreInput] = useState<string>('');
    const [vaultStatusMsg, setVaultStatusMsg] = useState<string | null>(null);
    const [copiedCert, setCopiedCert] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const dispatcherRef = useRef<PdfScrubberWorkerDispatcher | null>(null);

    useEffect(() => {
        dispatcherRef.current = createPdfScrubberWorkerDispatcher();
        return () => {
            dispatcherRef.current?.dispose();
        };
    }, []);

    // Recompute live math warnings whenever entities or transactions change
    const liveMathWarnings = useMemo(() => {
        if (!parsed) return [];
        return detectFinancialMathLeaks(parsed.transactions, parsed.entities);
    }, [parsed]);

    // Automatically run redaction & forensic verification whenever parsed state or options update
    useEffect(() => {
        if (!parsed) {
            setRedactionOutcome(null);
            return;
        }
        try {
            const outcome = applyPdfRedactionsAndSanitize(parsed, {
                outputMode,
                defaultStyle,
                defaultReasonCode,
                antiInferencePadding,
                scrubAll12Surfaces: true,
                autoMaskCoupledMath,
                underwriterAttestationBadge,
                customRectangles: customRects
            });
            setRedactionOutcome(outcome);
        } catch (err: unknown) {
            setErrorMessage(err instanceof Error ? err.message : String(err));
        }
    }, [
        parsed,
        outputMode,
        defaultStyle,
        defaultReasonCode,
        antiInferencePadding,
        autoMaskCoupledMath,
        underwriterAttestationBadge,
        customRects
    ]);

    const handleLoadBytes = useCallback(
        async (bytes: Uint8Array, fileName: string, presetToApply: FinancialPresetId) => {
            setIsLoading(true);
            setErrorMessage(null);
            setStatusBanner(null);
            setSelectedPageIdx(0);
            setGeneratedVaultText('');
            setVaultStatusMsg(null);

            try {
                if (dispatcherRef.current) {
                    const outcome = await dispatcherRef.current.parse(bytes, fileName, presetToApply);
                    setParsed(outcome.result);
                    setExecutionMode(outcome.executionMode);
                    setActivePreset(presetToApply);
                } else {
                    const res = parseFinancialPdfFile(bytes, fileName, presetToApply);
                    setParsed(res);
                    setExecutionMode('main-thread-fallback');
                    setActivePreset(presetToApply);
                }
            } catch (err: unknown) {
                if (isPdfScrubberCancelledError(err)) return;
                setErrorMessage(err instanceof Error ? err.message : 'Unable to parse PDF file.');
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    // Load default sample on initial mount so user immediately sees the full enterprise workbench
    useEffect(() => {
        const sample = generateSampleFinancialPdf('enterprise_bank_statement');
        void handleLoadBytes(sample.bytes, sample.fileName, sample.recommendedPreset);
    }, [handleLoadBytes]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const buf = await file.arrayBuffer();
        await handleLoadBytes(new Uint8Array(buf), file.name, activePreset);
        e.target.value = '';
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        const buf = await file.arrayBuffer();
        await handleLoadBytes(new Uint8Array(buf), file.name, activePreset);
    };

    const handleSelectSample = async (
        sampleId: 'enterprise_bank_statement' | 'hybrid_b2b_tax_invoice' | 'payroll_w2_remittance'
    ) => {
        const sample = generateSampleFinancialPdf(sampleId);
        setCustomRects([]);
        await handleLoadBytes(sample.bytes, sample.fileName, sample.recommendedPreset);
        setStatusBanner(`Loaded sample "${sample.fileName}" with preset "${sample.recommendedPreset}".`);
    };

    const handlePresetChange = (presetId: FinancialPresetId) => {
        setActivePreset(presetId);
        if (!parsed) return;
        const clonedEntities = parsed.entities.map((e) => ({ ...e }));
        const clonedTx = parsed.transactions.map((t) => ({ ...t }));
        applyPresetToEntitiesAndTransactions(presetId, clonedEntities, clonedTx);
        const mathWarnings = detectFinancialMathLeaks(clonedTx, clonedEntities);
        setParsed({
            ...parsed,
            entities: clonedEntities,
            transactions: clonedTx,
            mathWarnings
        });
    };

    const handleToggleEntity = (entityId: string) => {
        if (!parsed) return;
        const updatedEntities = parsed.entities.map((e) =>
            e.id === entityId ? { ...e, selected: !e.selected } : e
        );
        setParsed({
            ...parsed,
            entities: updatedEntities,
            mathWarnings: detectFinancialMathLeaks(parsed.transactions, updatedEntities)
        });
    };

    const handleUpdateEntityStyle = (entityId: string, style: RedactionStyle) => {
        if (!parsed) return;
        const updatedEntities = parsed.entities.map((e) => {
            if (e.id !== entityId) return e;
            const next = { ...e, style };
            next.maskedPreview = formatRedactedReplacement(next, {
                antiInferencePadding,
                underwriterAttestationBadge
            });
            return next;
        });
        setParsed({ ...parsed, entities: updatedEntities });
    };

    const handleUpdateEntityReason = (entityId: string, reasonCode: ExemptionReasonCode) => {
        if (!parsed) return;
        const updatedEntities = parsed.entities.map((e) => {
            if (e.id !== entityId) return e;
            const next = { ...e, reasonCode };
            next.maskedPreview = formatRedactedReplacement(next, {
                antiInferencePadding,
                underwriterAttestationBadge
            });
            return next;
        });
        setParsed({ ...parsed, entities: updatedEntities });
    };

    const handleBulkSelectEntities = (selectAll: boolean) => {
        if (!parsed) return;
        const updatedEntities = parsed.entities.map((e) => ({ ...e, selected: selectAll }));
        setParsed({
            ...parsed,
            entities: updatedEntities,
            mathWarnings: detectFinancialMathLeaks(parsed.transactions, updatedEntities)
        });
    };

    const handleAddCustomPatternMatch = () => {
        if (!parsed || !customPatternInput.trim()) return;
        const term = customPatternInput.trim();
        const newEntities: DetectedPiiEntity[] = [...parsed.entities];
        let added = 0;

        for (const page of parsed.pages) {
            for (const line of page.lines) {
                if (line.text.toLowerCase().includes(term.toLowerCase())) {
                    const idx = line.text.toLowerCase().indexOf(term.toLowerCase());
                    const exactRaw = line.text.slice(idx, idx + term.length);
                    if (newEntities.some((e) => e.pageIndex === page.pageIndex && e.lineIndex === line.lineIndex && e.rawValue === exactRaw)) {
                        continue;
                    }
                    const id = `pii_custom_${Date.now()}_${added++}`;
                    const charW = Math.max(5.5, line.fontSize * 0.54);
                    const ent: DetectedPiiEntity = {
                        id,
                        category: 'CUSTOM_PATTERN',
                        label: `Custom Match ("${exactRaw}")`,
                        rawValue: exactRaw,
                        maskedPreview: '[REDACTED: CUSTOM PATTERN]',
                        tokenizedValue: `[CUSTOM_${String(added).padStart(2, '0')}]`,
                        confidence: 'MANUAL',
                        validatorName: 'User Custom Keyword / Regex Rule',
                        jurisdiction: 'CUSTOM',
                        pageIndex: page.pageIndex,
                        lineIndex: line.lineIndex,
                        bbox: {
                            pageIndex: page.pageIndex,
                            x: Number((line.x + idx * charW).toFixed(1)),
                            y: Number(line.y.toFixed(1)),
                            width: Number(Math.max(32, exactRaw.length * charW + 6).toFixed(1)),
                            height: Number(line.height.toFixed(1))
                        },
                        selected: true,
                        style: defaultStyle,
                        reasonCode: defaultReasonCode
                    };
                    newEntities.push(ent);
                }
            }
        }
        setParsed({ ...parsed, entities: newEntities });
        setCustomPatternInput('');
        setStatusBanner(
            added > 0
                ? `Added ${added} custom redaction target(s) matching "${term}".`
                : `No text lines matched "${term}" in the current PDF.`
        );
    };

    const handleAddCustomRect = () => {
        const item: CustomRectItem = {
            id: `rect_${Date.now()}`,
            pageIndex: selectedPageIdx,
            x: Number(newRectX) || 40,
            y: Number(newRectY) || 48,
            width: Math.max(20, Number(newRectW) || 200),
            height: Math.max(12, Number(newRectH) || 20),
            label: newRectLabel.trim() || '[CUSTOM ZONE REDACTED]',
            repeatAllPages: newRectAllPages
        };
        setCustomRects((prev) => [...prev, item]);
    };

    const handleRemoveCustomRect = (id: string) => {
        setCustomRects((prev) => prev.filter((r) => r.id !== id));
    };

    const handleToggleTransactionFlag = (
        rowIndex: number,
        field: 'redactRow' | 'redactAmount' | 'redactBalance'
    ) => {
        if (!parsed) return;
        const updatedEntities = parsed.entities.map((e) => ({ ...e }));
        const entMap = new Map<string, DetectedPiiEntity>();
        for (const e of updatedEntities) entMap.set(e.id, e);

        const updatedTx = parsed.transactions.map((tx) => {
            if (tx.rowIndex !== rowIndex) return tx;
            const nextVal = !tx[field];
            const nextTx = { ...tx, [field]: nextVal };
            if (field === 'redactRow' && nextVal) {
                nextTx.redactAmount = true;
            }
            for (const id of nextTx.linkedEntityIds) {
                const ent = entMap.get(id);
                if (!ent) continue;
                if (nextTx.redactRow) ent.selected = true;
                else if (ent.category === 'CURRENCY_AMOUNT') ent.selected = nextTx.redactAmount;
                else if (ent.category === 'RUNNING_BALANCE') ent.selected = nextTx.redactBalance;
            }
            return nextTx;
        });

        setParsed({
            ...parsed,
            entities: updatedEntities,
            transactions: updatedTx,
            mathWarnings: detectFinancialMathLeaks(updatedTx, updatedEntities)
        });
    };

    const handleLockAllMathLeaks = () => {
        if (!parsed) return;
        const updatedEntities = parsed.entities.map((e) => ({ ...e }));
        const entMap = new Map<string, DetectedPiiEntity>();
        for (const e of updatedEntities) entMap.set(e.id, e);

        for (const w of liveMathWarnings) {
            for (const cId of w.coupledEntityIds) {
                const ent = entMap.get(cId);
                if (ent) ent.selected = true;
            }
        }
        const updatedTx = parsed.transactions.map((tx) => ({
            ...tx,
            redactBalance: true
        }));
        for (const e of updatedEntities) {
            if (e.category === 'RUNNING_BALANCE') e.selected = true;
        }
        setParsed({
            ...parsed,
            entities: updatedEntities,
            transactions: updatedTx,
            mathWarnings: detectFinancialMathLeaks(updatedTx, updatedEntities)
        });
        setStatusBanner('Locked all coupled running balances and summary equations. Zero math reverse-engineering leaks remain.');
    };

    const handleRedactPersonalSpendOnly = () => {
        if (!parsed) return;
        const updatedEntities = parsed.entities.map((e) => ({ ...e }));
        const entMap = new Map<string, DetectedPiiEntity>();
        for (const e of updatedEntities) entMap.set(e.id, e);

        const updatedTx = parsed.transactions.map((tx) => {
            const isSpend = tx.category === 'PERSONAL_SPEND' || tx.category === 'WIRE_TRANSFER';
            for (const id of tx.linkedEntityIds) {
                const ent = entMap.get(id);
                if (!ent) continue;
                if (ent.category === 'CURRENCY_AMOUNT') ent.selected = isSpend;
                if (ent.category === 'RUNNING_BALANCE') ent.selected = true;
            }
            return {
                ...tx,
                redactRow: isSpend,
                redactAmount: isSpend,
                redactBalance: true
            };
        });

        setParsed({
            ...parsed,
            entities: updatedEntities,
            transactions: updatedTx,
            mathWarnings: detectFinancialMathLeaks(updatedTx, updatedEntities)
        });
        setStatusBanner('Masked all Personal Spend rows and locked Running Balances while keeping Payroll/Deposit rows visible.');
    };

    // File download helpers
    const triggerBlobDownload = (bytesOrText: Uint8Array | string, fileName: string, mimeType: string) => {
        const blob =
            typeof bytesOrText === 'string'
                ? new Blob([bytesOrText], { type: mimeType })
                : new Blob([bytesOrText as unknown as BlobPart], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownloadScrubbedPdf = () => {
        if (!redactionOutcome) return;
        triggerBlobDownload(
            redactionOutcome.redactedPdfBytes,
            redactionOutcome.redactedFileName,
            'application/pdf'
        );
    };

    const handleDownloadCertificateJson = () => {
        if (!parsed || !redactionOutcome) return;
        const certJson = generateComplianceCertificateJson(parsed, redactionOutcome, activePreset);
        const base = parsed.metadata.fileName.replace(/\.pdf$/i, '');
        triggerBlobDownload(certJson, `${base}_redaction_certificate.json`, 'application/json');
    };

    const handleDownloadPrivilegeLogCsv = () => {
        if (!parsed) return;
        const csv = exportPrivilegeLogCsv(parsed, true);
        const base = parsed.metadata.fileName.replace(/\.pdf$/i, '');
        triggerBlobDownload(csv, `${base}_privilege_log.csv`, 'text/csv;charset=utf-8');
    };

    const handleDownloadPrivilegeLogXlsx = () => {
        if (!parsed) return;
        const xlsx = exportPrivilegeLogXlsx(parsed);
        const base = parsed.metadata.fileName.replace(/\.pdf$/i, '');
        triggerBlobDownload(
            xlsx,
            `${base}_privilege_log.xlsx`,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
    };

    const handleCreateEncryptedVault = () => {
        if (!parsed) return;
        setVaultStatusMsg(null);
        try {
            const vaultStr = encryptRedactionVault(parsed, vaultPassphrase);
            setGeneratedVaultText(vaultStr);
            const base = parsed.metadata.fileName.replace(/\.pdf$/i, '');
            triggerBlobDownload(vaultStr, `${base}.kivaro-vault`, 'application/json');
            setVaultStatusMsg('Encrypted .kivaro-vault generated and downloaded locally (SHA256-CTR-HMAC).');
        } catch (err: unknown) {
            setVaultStatusMsg(err instanceof Error ? err.message : String(err));
        }
    };

    const handleRestoreFromVault = () => {
        if (!parsed || !vaultRestoreInput.trim()) return;
        setVaultStatusMsg(null);
        try {
            const unlocked = decryptRedactionVault(vaultRestoreInput.trim(), vaultPassphrase);
            const restoredMap = new Map(unlocked.entities.map((e) => [e.id, e]));
            const updatedEntities = parsed.entities.map((e) => {
                const match = restoredMap.get(e.id);
                if (!match) return e;
                const next = {
                    ...e,
                    selected: match.selected,
                    style: match.style,
                    reasonCode: match.reasonCode
                };
                next.maskedPreview = formatRedactedReplacement(next, {
                    antiInferencePadding,
                    underwriterAttestationBadge
                });
                return next;
            });
            setParsed({
                ...parsed,
                entities: updatedEntities,
                mathWarnings: detectFinancialMathLeaks(parsed.transactions, updatedEntities)
            });
            setVaultStatusMsg(
                `Restored ${unlocked.entities.length} entity selection states from encrypted vault (${unlocked.fileName}).`
            );
        } catch (err: unknown) {
            setVaultStatusMsg(err instanceof Error ? err.message : String(err));
        }
    };

    const filteredEntities = useMemo(() => {
        if (!parsed) return [];
        return parsed.entities.filter((e) => {
            if (categoryFilter !== 'ALL' && e.category !== categoryFilter) return false;
            if (entitySearch.trim()) {
                const q = entitySearch.toLowerCase();
                return (
                    e.label.toLowerCase().includes(q) ||
                    e.rawValue.toLowerCase().includes(q) ||
                    e.category.toLowerCase().includes(q) ||
                    e.jurisdiction.toLowerCase().includes(q) ||
                    e.validatorName.toLowerCase().includes(q)
                );
            }
            return true;
        });
    }, [parsed, categoryFilter, entitySearch]);

    const selectedEntitiesCount = useMemo(
        () => (parsed ? parsed.entities.filter((e) => e.selected).length : 0),
        [parsed]
    );

    const exposedSurfacesCount = useMemo(
        () =>
            parsed
                ? parsed.metadata.surfaces.filter((s) => s.statusInOriginal === 'EXPOSED').length
                : 0,
        [parsed]
    );

    const currentPageModel = useMemo(() => {
        if (!parsed || parsed.pages.length === 0) return null;
        return parsed.pages[Math.min(selectedPageIdx, parsed.pages.length - 1)];
    }, [parsed, selectedPageIdx]);

    return (
        <div className="space-y-6 w-full min-w-0 max-w-full overflow-x-hidden text-slate-900 dark:text-slate-100">
            {/* TOP UPLOAD & 1-CLICK SAMPLE FINANCIAL PDF BAR */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-2">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Client-Side PDF Deep CDR & Financial PII Scrubber v{PDF_SCRUBBER_ENGINE_VERSION}</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            PDF Bank Statement & Invoice Data Scrubber (PII Redactor)
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Physically excise IBANs, Luhn Card PANs, Routing/MICR lines, SSN/CNIC/GSTIN/VAT IDs, ZATCA QR payloads, coupled running balances, and all 12 internal PDF metadata/stream surfaces locally in your browser.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-sm transition"
                        >
                            <Upload className="w-4 h-4" />
                            <span>Select Financial PDF</span>
                        </button>
                        {redactionOutcome && (
                            <button
                                type="button"
                                onClick={handleDownloadScrubbedPdf}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
                            >
                                <Download className="w-4 h-4" />
                                <span>Download Verified Scrubbed PDF ({formatBytes(redactionOutcome.redactedPdfBytes.length)})</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Drag & Drop + 3 Instant Sample Loaders */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-4">
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="lg:col-span-5 cursor-pointer rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/70 dark:bg-slate-800/40 p-4 flex flex-col justify-center items-center text-center transition"
                    >
                        <Upload className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-1.5" />
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            Drop any Bank Statement, Tax Invoice, or W-2 PDF here
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Up to {MAX_SAFE_PDF_BYTES / (1024 * 1024)} MB • 100% Local Browser Memory • Zero Server Upload
                        </p>
                    </div>

                    <div className="lg:col-span-7 flex flex-col justify-between">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Instant 1-Click Sample Financial Documents (Test All 12 Hidden Leak Surfaces):</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {SAMPLE_FILES.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => handleSelectSample(s.id)}
                                    className="text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/60 dark:bg-slate-800/50 transition group"
                                >
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                            {s.title}
                                        </span>
                                    </div>
                                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mb-1">
                                        {s.badge}
                                    </span>
                                    <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400 line-clamp-2">
                                        {s.subtitle}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Disclosure & Privacy Bar */}
                <details className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 px-4 py-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <summary className="cursor-pointer font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Technical Capabilities, 12-Surface Deep CDR Scope & Browser Processing Disclosure</span>
                        </span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            Click to expand
                        </span>
                    </summary>
                    <div className="mt-2.5 space-y-1.5 leading-relaxed border-t border-slate-200 dark:border-slate-700 pt-2.5">
                        <p>
                            <strong>Privacy & Local Execution:</strong> Your selected file contents are processed locally in your browser and are not uploaded to KivaroTools servers. The website may still load general analytics or other third-party website resources.
                        </p>
                        <p>
                            <strong>True Content-Stream Excision vs. Cosmetic Overlays:</strong> Drawing black rectangles in standard PDF editors leaves underlying <code>Tj</code>/<code>TJ</code> string tokens intact in the content stream and retains prior revisions in incremental <code>%%EOF</code> save trailers. This engine parses PDF 1.7 streams (including RFC 1950/1951 <code>/FlateDecode</code> streams), excises selected substrings before compiling a fresh single-generation <code>xref</code> PDF (<code>%%EOF count = 1</code>), and strips all 12 internal metadata/annotation/attachment surfaces.
                        </p>
                        <p>
                            <strong>Document Boundaries:</strong> Password-encrypted PDFs (<code>/Encrypt</code> dictionary) are rejected until unlocked so all internal streams can be inspected. Image-only scanned PDFs without an extractable text or OCR layer do not expose text operators to regex/checksum scanners; use custom rectangular zone redaction or Burn-In Flattened Mode for visual regions.
                        </p>
                    </div>
                </details>
            </div>

            {errorMessage && (
                <div className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 p-4 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                    <div>
                        <p className="font-semibold">PDF Processing Alert</p>
                        <p className="text-xs mt-0.5">{errorMessage}</p>
                    </div>
                </div>
            )}

            {statusBanner && (
                <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{statusBanner}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setStatusBanner(null)}
                        className="text-emerald-700 dark:text-emerald-300 hover:underline font-medium"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {parsed && (
                <>
                    {/* 6 PURPOSE-BUILT FINANCIAL WORKFLOW PRESETS */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                                <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    1-Click Financial Redaction Workflow Presets
                                </h3>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                Selecting a preset automatically configures entity rules, replacement styles, and statutory reason codes
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {WORKFLOW_PRESETS.map((preset) => {
                                const isActive = activePreset === preset.id;
                                return (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => handlePresetChange(preset.id)}
                                        className={`text-left p-3 rounded-xl border transition ${isActive
                                                ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-1 ring-emerald-500/40'
                                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/30'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                {preset.name}
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${isActive
                                                        ? 'bg-emerald-600 text-white'
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

                    {/* 6-CARD ACTIVE TELEMETRY BAR */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Document & Type</div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate" title={parsed.metadata.fileName}>
                                {parsed.metadata.detectedDocType.replace(/_/g, ' ').toUpperCase()}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                                PDF {parsed.metadata.pdfVersion} • {parsed.metadata.pageCount} Page(s) • {formatBytes(parsed.metadata.fileSizeBytes)}
                            </div>
                        </div>

                        <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">PII & PCI Entities</div>
                            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                {selectedEntitiesCount} / {parsed.entities.length} Selected
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                                {parsed.entities.filter((e) => e.confidence === 'CRITICAL_CHECKSUM').length} Checksum-Verified
                            </div>
                        </div>

                        <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Math Leak Guard</div>
                            <div
                                className={`text-sm font-bold mt-0.5 ${liveMathWarnings.length > 0
                                        ? 'text-amber-600 dark:text-amber-400'
                                        : 'text-emerald-600 dark:text-emerald-400'
                                    }`}
                            >
                                {liveMathWarnings.length > 0
                                    ? `${liveMathWarnings.length} Coupled Leak(s)`
                                    : '0 Math Leaks'}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                                {autoMaskCoupledMath ? 'Auto-Lock Enabled on Export' : 'Manual Balance Review'}
                            </div>
                        </div>

                        <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">12-Surface Deep CDR</div>
                            <div className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                                {exposedSurfacesCount} / 12 Exposed in Source
                            </div>
                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                                → 12 / 12 Purged on Export
                            </div>
                        </div>

                        <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">QR & Hybrid XML</div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                                {parsed.metadata.decodedPayloads.length} Embedded Payload(s)
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                                ZATCA TLV & Factur-X Scanner
                            </div>
                        </div>

                        <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5">
                            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Forensic Self-Test</div>
                            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>
                                    {redactionOutcome?.forensicReport.passedAllChecks
                                        ? 'PASSED (0 Leaks)'
                                        : 'Pending'}
                                </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                                {executionMode === 'worker' ? 'Web Worker' : 'Main Thread'} • {parsed.metadata.parseTimeMs.toFixed(1)} ms
                            </div>
                        </div>
                    </div>

                    {/* 5-TAB WORKBENCH NAVIGATION */}
                    <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                        <button
                            type="button"
                            onClick={() => setActiveTab('redaction_studio')}
                            className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'redaction_studio'
                                    ? 'bg-slate-900 text-white dark:bg-emerald-600'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                        >
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>1. Visual Canvas & Entity Queue ({selectedEntitiesCount}/{parsed.entities.length})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('math_guard')}
                            className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'math_guard'
                                    ? 'bg-slate-900 text-white dark:bg-emerald-600'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                        >
                            <Calculator className="w-3.5 h-3.5" />
                            <span>2. Transaction Scrubber & Math Guard ({liveMathWarnings.length} Alerts)</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('deep_cdr_xray')}
                            className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'deep_cdr_xray'
                                    ? 'bg-slate-900 text-white dark:bg-emerald-600'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                        >
                            <Layers className="w-3.5 h-3.5" />
                            <span>3. 12-Surface Deep CDR X-Ray & QR/XML ({exposedSurfacesCount} Exposed)</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('forensic_proof')}
                            className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'forensic_proof'
                                    ? 'bg-slate-900 text-white dark:bg-emerald-600'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                        >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>4. Forensic Unredact Self-Test & SHA-256 Certificate</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('vault_and_logs')}
                            className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === 'vault_and_logs'
                                    ? 'bg-slate-900 text-white dark:bg-emerald-600'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                        >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>5. Encrypted .kivaro-vault & Privilege Logs (.xlsx / .csv)</span>
                        </button>
                    </div>

                    {/* TAB 1: VISUAL CANVAS & ENTITY REDACTION QUEUE */}
                    {activeTab === 'redaction_studio' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                            {/* Left Column: Interactive Document Page Canvas & Custom Box Drawer */}
                            <div className="min-w-0 lg:col-span-6 space-y-4">
                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-emerald-600" />
                                            <h3 className="text-sm font-bold">
                                                Interactive Statement / Invoice Page Preview
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span>Page:</span>
                                            <select
                                                value={selectedPageIdx}
                                                onChange={(e) => setSelectedPageIdx(Number(e.target.value))}
                                                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-xs"
                                            >
                                                {parsed.pages.map((p) => (
                                                    <option key={p.pageIndex} value={p.pageIndex}>
                                                        Page {p.pageIndex + 1} of {parsed.pages.length}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Simulated Page Coordinate Surface */}
                                    <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4 font-mono text-xs space-y-2 overflow-x-auto">
                                        {currentPageModel?.lines.map((line) => {
                                            const lineEntities = parsed.entities.filter(
                                                (e) =>
                                                    e.pageIndex === currentPageModel.pageIndex &&
                                                    (e.lineIndex === line.lineIndex || line.text.includes(e.rawValue))
                                            );
                                            const txRow = parsed.transactions.find(
                                                (t) =>
                                                    t.pageIndex === currentPageModel.pageIndex &&
                                                    line.text.includes(t.description)
                                            );
                                            const isFullRowRedacted = txRow?.redactRow;

                                            return (
                                                <div
                                                    key={line.lineIndex}
                                                    className={`p-2 rounded-lg border transition ${line.isInvisibleOcr
                                                            ? 'border-rose-400/70 bg-rose-50/70 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300'
                                                            : isFullRowRedacted
                                                                ? 'border-slate-800 bg-slate-900 text-white'
                                                                : lineEntities.some((e) => e.selected)
                                                                    ? 'border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900'
                                                                    : 'border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/50'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 mb-1">
                                                        <span>
                                                            Line #{line.lineIndex + 1} (X:{line.x}, Y:{line.y})
                                                            {line.isInvisibleOcr ? ' • [HIDDEN 3 Tr OCR LAYER — PURGED ON EXPORT]' : ''}
                                                        </span>
                                                        {lineEntities.length > 0 && (
                                                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                                                {lineEntities.filter((e) => e.selected).length}/{lineEntities.length} Masked
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="text-[11px] leading-relaxed break-all">
                                                        {isFullRowRedacted
                                                            ? `${txRow?.date} | [TRANSACTION ROW REDACTED — ${defaultReasonCode}]`
                                                            : line.text}
                                                    </div>

                                                    {lineEntities.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                                                            {lineEntities.map((ent) => (
                                                                <button
                                                                    key={ent.id}
                                                                    type="button"
                                                                    onClick={() => handleToggleEntity(ent.id)}
                                                                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold transition ${ent.selected
                                                                            ? 'bg-slate-900 text-white dark:bg-emerald-700'
                                                                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                                                        }`}
                                                                    title={`Click to toggle redaction (${ent.validatorName})`}
                                                                >
                                                                    {ent.selected ? (
                                                                        <Lock className="w-2.5 h-2.5 text-emerald-400" />
                                                                    ) : (
                                                                        <Unlock className="w-2.5 h-2.5 text-amber-500" />
                                                                    )}
                                                                    <span>{ent.label}:</span>
                                                                    <span className="underline">
                                                                        {ent.selected ? ent.maskedPreview : ent.rawValue}
                                                                    </span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Custom Rectangular Redaction Box & Multi-Page Stamp Tool */}
                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                            Custom Coordinate Zone Redactor (Signatures, Stamps & Bank Logos)
                                        </h4>
                                        <span className="text-[11px] text-slate-500">
                                            {customRects.length} Active Zone(s)
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                                        <div className="col-span-2">
                                            <label className="block text-[10px] text-slate-500 mb-0.5">Zone Label</label>
                                            <input
                                                type="text"
                                                value={newRectLabel}
                                                onChange={(e) => setNewRectLabel(e.target.value)}
                                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500 mb-0.5">X (pt)</label>
                                            <input
                                                type="number"
                                                value={newRectX}
                                                onChange={(e) => setNewRectX(Number(e.target.value))}
                                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500 mb-0.5">Y (pt)</label>
                                            <input
                                                type="number"
                                                value={newRectY}
                                                onChange={(e) => setNewRectY(Number(e.target.value))}
                                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500 mb-0.5">Width (pt)</label>
                                            <input
                                                type="number"
                                                value={newRectW}
                                                onChange={(e) => setNewRectW(Number(e.target.value))}
                                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 text-xs"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                        <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newRectAllPages}
                                                onChange={(e) => setNewRectAllPages(e.target.checked)}
                                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span>Propagate across all pages (Header/Footer Stamp Mode)</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleAddCustomRect}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-emerald-600 text-white"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Add Zone Redaction</span>
                                        </button>
                                    </div>
                                    {customRects.length > 0 && (
                                        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                                            {customRects.map((r) => (
                                                <div
                                                    key={r.id}
                                                    className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg"
                                                >
                                                    <span>
                                                        <strong>{r.label}</strong> — ({r.x}, {r.y}, {r.width}×{r.height} pt) •{' '}
                                                        {r.repeatAllPages ? 'All Pages' : `Page ${r.pageIndex + 1}`}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveCustomRect(r.id)}
                                                        className="text-rose-600 hover:text-rose-500"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Entity Queue, Custom Pattern Matcher & Execution Options */}
                            <div className="min-w-0 lg:col-span-6 space-y-4">
                                {/* Execution Mode & Anti-Inference Controls */}
                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
                                    <h3 className="text-sm font-bold flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-emerald-600" />
                                        <span>Permanent Redaction Engine & Output Controls</span>
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                                PDF Reconstruction Mode
                                            </label>
                                            <select
                                                value={outputMode}
                                                onChange={(e) => setOutputMode(e.target.value as RedactionOutputMode)}
                                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-2 text-xs font-medium"
                                            >
                                                <option value="surgical_cdr">
                                                    Mode B: Surgical Vector CDR Rebuild (Searchable Unredacted Text)
                                                </option>
                                                <option value="burn_in_flattened">
                                                    Mode A: Burn-In Flattened Boxes (Zero Underlying PII Tokens)
                                                </option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                                Default Exemption / Overlay Code
                                            </label>
                                            <select
                                                value={defaultReasonCode}
                                                onChange={(e) => setDefaultReasonCode(e.target.value as ExemptionReasonCode)}
                                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-2 text-xs font-medium"
                                            >
                                                {REASON_CODE_LABELS.map((rc) => (
                                                    <option key={rc.code} value={rc.code}>
                                                        {rc.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                                        <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={antiInferencePadding}
                                                onChange={(e) => setAntiInferencePadding(e.target.checked)}
                                                className="rounded text-emerald-600"
                                            />
                                            <span>Anti-Inference Width Jitter</span>
                                        </label>
                                        <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={autoMaskCoupledMath}
                                                onChange={(e) => setAutoMaskCoupledMath(e.target.checked)}
                                                className="rounded text-emerald-600"
                                            />
                                            <span>Auto-Mask Coupled Math</span>
                                        </label>
                                        <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={underwriterAttestationBadge}
                                                onChange={(e) => setUnderwriterAttestationBadge(e.target.checked)}
                                                className="rounded text-emerald-600"
                                            />
                                            <span>Statutory Overlay Badges</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Entity Queue Table */}
                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h3 className="text-sm font-bold">
                                            Detected PII / PCI Entities ({filteredEntities.length})
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleBulkSelectEntities(true)}
                                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                                            >
                                                Select All
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleBulkSelectEntities(false)}
                                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                    </div>

                                    {/* Search, Category Filter & Custom Keyword Add */}
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                        <div className="sm:col-span-5 relative">
                                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                                            <input
                                                type="text"
                                                value={entitySearch}
                                                onChange={(e) => setEntitySearch(e.target.value)}
                                                placeholder="Filter by IBAN, PAN, SSN, amount..."
                                                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                                            />
                                        </div>
                                        <div className="sm:col-span-4">
                                            <select
                                                value={categoryFilter}
                                                onChange={(e) => setCategoryFilter(e.target.value)}
                                                className="w-full py-1.5 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                                            >
                                                <option value="ALL">All Categories ({parsed.entities.length})</option>
                                                <option value="CARD_PAN">Card PAN (Luhn)</option>
                                                <option value="IBAN">IBAN (Mod-97)</option>
                                                <option value="ROUTING_ABA_BSB_SORT">Routing / Sort / BSB</option>
                                                <option value="BANK_ACCOUNT">Bank Account No</option>
                                                <option value="CHECK_MICR">Check MICR Line</option>
                                                <option value="TAX_ID_SSN_CNIC_VAT_GSTIN">Tax ID / SSN / CNIC / GSTIN</option>
                                                <option value="PERSON_OR_PARTY_NAME">Party / Holder Name</option>
                                                <option value="BILLING_ADDRESS">Billing Address</option>
                                                <option value="CURRENCY_AMOUNT">Currency Amounts</option>
                                                <option value="RUNNING_BALANCE">Running Balances</option>
                                                <option value="QR_OR_BARCODE_PAYLOAD">QR / Barcode Payload</option>
                                            </select>
                                        </div>
                                        <div className="sm:col-span-3 flex gap-1">
                                            <input
                                                type="text"
                                                value={customPatternInput}
                                                onChange={(e) => setCustomPatternInput(e.target.value)}
                                                placeholder="+ Custom word"
                                                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddCustomPatternMatch}
                                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shrink-0"
                                                title="Add custom string match"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>

                                    {/* Scrollable Entity List */}
                                    <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
                                        {filteredEntities.map((ent) => (
                                            <div
                                                key={ent.id}
                                                className={`p-3 rounded-xl border text-xs transition ${ent.selected
                                                        ? 'border-emerald-300 dark:border-emerald-800/90 bg-emerald-50/30 dark:bg-emerald-950/20'
                                                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 opacity-75'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <label className="flex items-start gap-2.5 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={ent.selected}
                                                            onChange={() => handleToggleEntity(ent.id)}
                                                            className="mt-0.5 rounded text-emerald-600"
                                                        />
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                <span className="font-bold text-slate-900 dark:text-white">
                                                                    {ent.label}
                                                                </span>
                                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                                                                    {ent.jurisdiction}
                                                                </span>
                                                                <span
                                                                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${ent.confidence === 'CRITICAL_CHECKSUM'
                                                                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                                                            : ent.confidence === 'MATH_COUPLED'
                                                                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                                                                : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                                                                        }`}
                                                                >
                                                                    {ent.validatorName}
                                                                </span>
                                                            </div>
                                                            <div className="mt-1 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                                                                Raw: <span className="line-through text-rose-600 dark:text-rose-400">{ent.rawValue}</span>{' '}
                                                                → Scrubbed: <strong className="text-emerald-700 dark:text-emerald-300">{ent.maskedPreview}</strong>
                                                            </div>
                                                        </div>
                                                    </label>
                                                    <span className="text-[10px] text-slate-400 shrink-0">
                                                        P.{ent.pageIndex + 1} L.{ent.lineIndex + 1}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                                                    <select
                                                        value={ent.style}
                                                        onChange={(e) =>
                                                            handleUpdateEntityStyle(ent.id, e.target.value as RedactionStyle)
                                                        }
                                                        className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-[11px]"
                                                    >
                                                        {STYLE_LABELS.map((st) => (
                                                            <option key={st.style} value={st.style}>
                                                                {st.label}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    <select
                                                        value={ent.reasonCode}
                                                        onChange={(e) =>
                                                            handleUpdateEntityReason(
                                                                ent.id,
                                                                e.target.value as ExemptionReasonCode
                                                            )
                                                        }
                                                        className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-[11px]"
                                                    >
                                                        {REASON_CODE_LABELS.map((rc) => (
                                                            <option key={rc.code} value={rc.code}>
                                                                {rc.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: TRANSACTION TABLE SCRUBBER & FINANCIAL MATH LEAK GUARD */}
                    {activeTab === 'math_guard' && (
                        <div className="space-y-5">
                            {/* Math Leak Warnings Panel */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <div>
                                        <h3 className="text-base font-bold flex items-center gap-2">
                                            <Calculator className="w-5 h-5 text-amber-500" />
                                            <span>Financial Math Dependency & Reverse-Engineering Leak Guard</span>
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Checks whether any redacted transaction debit/credit, invoice line item, or subtotal can be mathematically solved from unredacted adjacent running balances, VAT percentages, or grand totals.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {liveMathWarnings.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleLockAllMathLeaks}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm"
                                            >
                                                <Lock className="w-3.5 h-3.5" />
                                                <span>Lock All Coupled Balances & Totals ({liveMathWarnings.length})</span>
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleRedactPersonalSpendOnly}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-emerald-600 text-white"
                                        >
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            <span>Redact All Personal Spend Rows + Lock Running Balances</span>
                                        </button>
                                    </div>
                                </div>

                                {liveMathWarnings.length === 0 ? (
                                    <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                        <div>
                                            <p className="font-bold">Zero Arithmetic Reverse-Engineering Leaks Detected</p>
                                            <p className="mt-0.5">
                                                All redacted transaction amounts and invoice totals are protected against running-balance subtraction and tax-rate back-calculation.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-4 space-y-2.5">
                                        {liveMathWarnings.map((w) => (
                                            <div
                                                key={w.id}
                                                className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 text-xs space-y-1"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                                                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                                        <span>{w.title}</span>
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                                                        {w.type}
                                                    </span>
                                                </div>
                                                <p className="text-slate-700 dark:text-slate-300">{w.explanation}</p>
                                                <div className="font-mono text-[11px] text-rose-700 dark:text-rose-300 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 rounded border border-amber-200 dark:border-amber-800">
                                                    Proof: {w.formulaProof}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Transaction & Invoice Line-Item Table */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                                    <Table className="w-4 h-4 text-emerald-600" />
                                    <span>Extracted Statement Transactions & Invoice Line Items ({parsed.transactions.length})</span>
                                </h3>
                                {parsed.transactions.length === 0 ? (
                                    <p className="text-xs text-slate-500">
                                        No structured tabular transaction or line-item rows detected in this document (see Entity Queue for standalone financial figures).
                                    </p>
                                ) : (
                                    <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 uppercase">
                                                    <th className="py-2 px-2.5">Row / Date</th>
                                                    <th className="py-2 px-2.5">Description</th>
                                                    <th className="py-2 px-2.5">Classification</th>
                                                    <th className="py-2 px-2.5">Amount / Price</th>
                                                    <th className="py-2 px-2.5">Running Balance</th>
                                                    <th className="py-2 px-2.5 text-center">Redact Full Row</th>
                                                    <th className="py-2 px-2.5 text-center">Redact Amount</th>
                                                    <th className="py-2 px-2.5 text-center">Redact Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                                                {parsed.transactions.map((tx) => (
                                                    <tr
                                                        key={tx.rowIndex}
                                                        className={
                                                            tx.redactRow
                                                                ? 'bg-slate-100 dark:bg-slate-800/60'
                                                                : ''
                                                        }
                                                    >
                                                        <td className="py-2.5 px-2.5 font-mono text-[11px]">
                                                            #{tx.rowIndex + 1} • {tx.date}
                                                        </td>
                                                        <td className="py-2.5 px-2.5 font-medium">
                                                            {tx.redactRow ? (
                                                                <span className="line-through text-rose-500">
                                                                    {tx.description}
                                                                </span>
                                                            ) : (
                                                                tx.description
                                                            )}
                                                        </td>
                                                        <td className="py-2.5 px-2.5">
                                                            <span
                                                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${tx.category === 'PAYROLL_DEPOSIT' ||
                                                                        tx.category === 'CLIENT_INFLOW'
                                                                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                                                    }`}
                                                            >
                                                                {tx.category}
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 px-2.5 font-mono">
                                                            {tx.redactRow || tx.redactAmount ? (
                                                                <span className="text-rose-600 font-bold">
                                                                    [REDACTED]
                                                                </span>
                                                            ) : (
                                                                `$${Math.abs(tx.amount).toLocaleString('en-US', {
                                                                    minimumFractionDigits: 2
                                                                })}`
                                                            )}
                                                        </td>
                                                        <td className="py-2.5 px-2.5 font-mono">
                                                            {tx.runningBalance === null ? (
                                                                '—'
                                                            ) : tx.redactBalance || tx.redactRow ? (
                                                                <span className="text-emerald-600 font-bold">
                                                                    [LOCKED]
                                                                </span>
                                                            ) : (
                                                                `$${tx.runningBalance.toLocaleString('en-US', {
                                                                    minimumFractionDigits: 2
                                                                })}`
                                                            )}
                                                        </td>
                                                        <td className="py-2.5 px-2.5 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={tx.redactRow}
                                                                onChange={() =>
                                                                    handleToggleTransactionFlag(tx.rowIndex, 'redactRow')
                                                                }
                                                                className="rounded text-emerald-600"
                                                            />
                                                        </td>
                                                        <td className="py-2.5 px-2.5 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={tx.redactAmount}
                                                                onChange={() =>
                                                                    handleToggleTransactionFlag(
                                                                        tx.rowIndex,
                                                                        'redactAmount'
                                                                    )
                                                                }
                                                                className="rounded text-emerald-600"
                                                            />
                                                        </td>
                                                        <td className="py-2.5 px-2.5 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={tx.redactBalance}
                                                                disabled={tx.runningBalance === null}
                                                                onChange={() =>
                                                                    handleToggleTransactionFlag(
                                                                        tx.rowIndex,
                                                                        'redactBalance'
                                                                    )
                                                                }
                                                                className="rounded text-emerald-600"
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: 12-SURFACE DEEP CDR X-RAY & QR/XML INSPECTOR */}
                    {activeTab === 'deep_cdr_xray' && (
                        <div className="space-y-5">
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                                <h3 className="text-base font-bold mb-1 flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-emerald-600" />
                                    <span>12-Surface PDF Deep Content Disarm & Reconstruction (CDR) X-Ray Matrix</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                                    Inspects all 12 internal PDF object trees where hidden financial PII, account numbers, and revision histories survive standard black-box annotations.
                                </p>

                                <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 uppercase">
                                                <th className="py-2 px-2.5">#</th>
                                                <th className="py-2 px-2.5">Internal PDF Surface</th>
                                                <th className="py-2 px-2.5">Status in Source PDF</th>
                                                <th className="py-2 px-2.5">Detected Findings & Sample Leak Preview</th>
                                                <th className="py-2 px-2.5">Deep CDR Sanitization Action</th>
                                                <th className="py-2 px-2.5">Status in Export</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                                            {parsed.metadata.surfaces.map((s) => (
                                                <tr key={s.surfaceNumber}>
                                                    <td className="py-2.5 px-2.5 font-mono font-bold">
                                                        #{s.surfaceNumber}
                                                    </td>
                                                    <td className="py-2.5 px-2.5 font-semibold text-slate-900 dark:text-white">
                                                        {s.surfaceName}
                                                    </td>
                                                    <td className="py-2.5 px-2.5">
                                                        <span
                                                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.statusInOriginal === 'EXPOSED'
                                                                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                                }`}
                                                        >
                                                            {s.statusInOriginal} ({s.findingsCount})
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-2.5">
                                                        <div>{s.details}</div>
                                                        {s.sampleLeakPreview && (
                                                            <div className="font-mono text-[10px] text-rose-600 dark:text-rose-400 mt-0.5 truncate max-w-xs">
                                                                Leak: {s.sampleLeakPreview}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-2.5 px-2.5 text-slate-600 dark:text-slate-400">
                                                        {s.scrubAction}
                                                    </td>
                                                    <td className="py-2.5 px-2.5">
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                                            <Check className="w-3 h-3" />
                                                            <span>{s.statusAfterScrub}</span>
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Decoded QR & Hybrid XML Payloads */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                                <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
                                    <QrCode className="w-4 h-4 text-emerald-600" />
                                    <span>Decoded ZATCA TLV Base64 QR & Factur-X / ZUGFeRD Hybrid E-Invoice XML Payloads</span>
                                </h3>
                                {parsed.metadata.decodedPayloads.length === 0 ? (
                                    <p className="text-xs text-slate-500">
                                        No ZATCA TLV QR codes or Factur-X / ZUGFeRD XML attachments detected in this PDF (load the &quot;Hybrid B2B Tax Invoice&quot; sample to inspect live TLV &amp; XML decoding).
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {parsed.metadata.decodedPayloads.map((pl) => (
                                            <div
                                                key={pl.id}
                                                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-slate-900 dark:text-white">
                                                        {pl.sourceType}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                                        Scrubbed on Export
                                                    </span>
                                                </div>
                                                <div className="font-mono text-[10px] text-slate-500 break-all">
                                                    Raw: {pl.rawPayloadPreview}
                                                </div>
                                                <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
                                                    {Object.entries(pl.decodedFields).map(([k, v]) => (
                                                        <div key={k} className="flex justify-between gap-2 font-mono text-[11px]">
                                                            <span className="text-slate-500">{k}:</span>
                                                            <span className="font-bold text-rose-600 dark:text-rose-400">
                                                                {v}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 4: FORENSIC UNREDACT SELF-TEST & SHA-256 AUDIT CERTIFICATE */}
                    {activeTab === 'forensic_proof' && redactionOutcome && (
                        <div className="space-y-5">
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <div>
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mb-1">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>
                                                Forensic Self-Test:{' '}
                                                {redactionOutcome.forensicReport.passedAllChecks
                                                    ? '100% PASSED — 0 RECOVERABLE SECRET TOKENS'
                                                    : 'ATTENTION REQUIRED'}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold">
                                            Automated &quot;Unredact Attack&quot; Self-Test &amp; Cryptographic Audit Proof
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Re-parses the output PDF bytes from scratch and attempts to recover every redacted string from page content streams, incremental xref trailers, and all 12 internal PDF surfaces.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={handleDownloadCertificateJson}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-emerald-600 text-white"
                                        >
                                            <FileCheck className="w-4 h-4" />
                                            <span>Download SHA-256 Audit Certificate (.json)</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDownloadScrubbedPdf}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Download Verified PDF</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Hash & Structural Proof Bar */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                                        <div className="text-[10px] uppercase text-slate-500 font-semibold">
                                            Original Input SHA-256
                                        </div>
                                        <div className="font-mono text-[11px] break-all mt-1">
                                            {redactionOutcome.forensicReport.inputSha256}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                                        <div className="text-[10px] uppercase text-slate-500 font-semibold">
                                            Sanitized Output SHA-256
                                        </div>
                                        <div className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 break-all mt-1">
                                            {redactionOutcome.forensicReport.outputSha256}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                                        <div className="text-[10px] uppercase text-slate-500 font-semibold">
                                            Ctrl+A / pdftotext Extraction Proof
                                        </div>
                                        <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                            {redactionOutcome.forensicReport.leakedTokensCount} /{' '}
                                            {redactionOutcome.forensicReport.totalRedactedTargetsChecked} Secret Tokens Recoverable • %%EOF Count ={' '}
                                            {redactionOutcome.forensicReport.outputEofCount}
                                        </div>
                                    </div>
                                </div>

                                {/* Side-by-Side Before vs. After Raw Text Stream Extraction */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 p-3.5">
                                        <div className="text-xs font-bold text-rose-800 dark:text-rose-300 mb-2 flex items-center gap-1.5">
                                            <Terminal className="w-3.5 h-3.5" />
                                            <span>BEFORE: Raw Text Stream Extracted from Original PDF</span>
                                        </div>
                                        <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all text-slate-700 dark:text-slate-300 max-h-64 overflow-y-auto">
                                            {redactionOutcome.forensicReport.extractedBeforeTextPreview}
                                        </pre>
                                    </div>

                                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 p-3.5">
                                        <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                                            <Terminal className="w-3.5 h-3.5" />
                                            <span>AFTER: Raw Text Stream Extracted from Scrubbed Output PDF</span>
                                        </div>
                                        <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all text-slate-700 dark:text-slate-300 max-h-64 overflow-y-auto">
                                            {redactionOutcome.forensicReport.extractedAfterTextPreview ||
                                                '[All text operators flattened — 0 extractable strings in output PDF]'}
                                        </pre>
                                    </div>
                                </div>

                                {/* 12-Surface Forensic Check Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
                                    {redactionOutcome.forensicReport.surfaceChecks.map((chk) => (
                                        <div
                                            key={chk.surfaceNumber}
                                            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs flex items-start gap-2.5"
                                        >
                                            {chk.passed ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                            )}
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white">
                                                    #{chk.surfaceNumber}. {chk.name}
                                                </div>
                                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {chk.detail}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 5: ENCRYPTED .KIVARO-VAULT & PRIVILEGE LOG STUDIO */}
                    {activeTab === 'vault_and_logs' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                            {/* Left: eDiscovery Redaction Privilege Log (.xlsx / .csv) */}
                            <div className="min-w-0 lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                                    <div>
                                        <h3 className="text-sm font-bold flex items-center gap-2">
                                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                            <span>eDiscovery Redaction Privilege Log (.xlsx & .csv)</span>
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Lists every applied redaction ID, page number, category, masked replacement, and statutory exemption code without exposing raw secret PII values (CWE-1236 formula-safe).
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleDownloadPrivilegeLogXlsx}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                                        >
                                            <FileSpreadsheet className="w-3.5 h-3.5" />
                                            <span>Export Excel (.xlsx)</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDownloadPrivilegeLogCsv}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-700 text-white"
                                        >
                                            <FileCode className="w-3.5 h-3.5" />
                                            <span>Export CSV (.csv)</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="max-h-80 overflow-y-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 uppercase">
                                                <th className="py-1.5 px-2">ID</th>
                                                <th className="py-1.5 px-2">Page</th>
                                                <th className="py-1.5 px-2">Category</th>
                                                <th className="py-1.5 px-2">Replacement Mask</th>
                                                <th className="py-1.5 px-2">Statutory Reason Code</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                            {parsed.entities
                                                .filter((e) => e.selected)
                                                .map((e) => (
                                                    <tr key={e.id}>
                                                        <td className="py-1.5 px-2 font-mono text-[11px]">{e.id}</td>
                                                        <td className="py-1.5 px-2">{e.pageIndex + 1}</td>
                                                        <td className="py-1.5 px-2 font-semibold">{e.category}</td>
                                                        <td className="py-1.5 px-2 font-mono text-emerald-700 dark:text-emerald-400">
                                                            {e.maskedPreview}
                                                        </td>
                                                        <td className="py-1.5 px-2 font-mono text-[11px]">
                                                            {e.reasonCode}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Right: Encrypted .kivaro-vault Sidecar */}
                            <div className="min-w-0 lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <KeyRound className="w-4 h-4 text-emerald-600" />
                                    <span>Reversible Encrypted Sidecar (.kivaro-vault)</span>
                                </h3>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    The scrubbed PDF you share externally contains <strong>0 bytes</strong> of recoverable PII. If your team needs to restore or audit redaction selections later, save a passphrase-encrypted <code>.kivaro-vault</code> sidecar file locally.
                                </p>

                                <div>
                                    <label className="block text-xs font-semibold mb-1">
                                        Vault Passphrase (min 4 characters)
                                    </label>
                                    <input
                                        type="password"
                                        value={vaultPassphrase}
                                        onChange={(e) => setVaultPassphrase(e.target.value)}
                                        placeholder="Enter secret passphrase..."
                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleCreateEncryptedVault}
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-emerald-600 text-white"
                                >
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Encrypt & Download .kivaro-vault Sidecar</span>
                                </button>

                                {generatedVaultText && (
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                            Generated Encrypted Vault Envelope (Preview):
                                        </label>
                                        <textarea
                                            readOnly
                                            rows={3}
                                            value={generatedVaultText}
                                            className="w-full font-mono text-[10px] rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2"
                                        />
                                    </div>
                                )}

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                    <label className="block text-xs font-semibold">
                                        Restore Redaction State from .kivaro-vault JSON
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={vaultRestoreInput}
                                        onChange={(e) => setVaultRestoreInput(e.target.value)}
                                        placeholder="Paste .kivaro-vault JSON content here and enter passphrase above..."
                                        className="w-full font-mono text-[10px] rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRestoreFromVault}
                                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-300"
                                    >
                                        <Unlock className="w-3.5 h-3.5" />
                                        <span>Decrypt & Restore Selections</span>
                                    </button>
                                </div>

                                {vaultStatusMsg && (
                                    <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200">
                                        {vaultStatusMsg}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}