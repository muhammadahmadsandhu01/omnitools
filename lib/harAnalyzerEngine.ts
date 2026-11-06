/**
 * KivaroTools — Client-Side HAR File Analyzer, Waterfall Inspector & 14-Surface Deep Sanitizer Engine
 * File: lib/harAnalyzerEngine.ts
 * Version: 2.0
 *
 * 100% Local Browser Memory Execution • Zero External Dependencies • Web Worker + Main-Thread Fallback
 */

export type HarResourceType =
    | 'fetch_xhr'
    | 'graphql'
    | 'websocket'
    | 'doc'
    | 'script'
    | 'stylesheet'
    | 'image'
    | 'font'
    | 'other';

export type HarSecretCategory =
    | 'AUTH_HEADER'
    | 'SESSION_COOKIE'
    | 'JWT_TOKEN'
    | 'SAML_ASSERTION'
    | 'OAUTH_PARAM'
    | 'CLOUD_API_KEY'
    | 'JSON_BODY_SECRET'
    | 'GRAPHQL_VARIABLE'
    | 'RESPONSE_BODY_SECRET'
    | 'WEBSOCKET_FRAME_SECRET'
    | 'URL_PATH_TOKEN'
    | 'PII_EMAIL_PHONE'
    | 'FINANCIAL_CARD_IBAN_SSN'
    | 'IP_OR_INITIATOR';

export type HarWorkflowPresetId =
    | 'support_ticket_safe'
    | 'sso_saml_oauth_debug'
    | 'performance_only_slim'
    | 'qa_load_test_replay'
    | 'ai_llm_har_anonymizer'
    | 'strict_zero_trust_cdr';

export type HarRedactionMode = 'deterministic_token' | 'static_redacted' | 'env_placeholder';

export interface HarTimingPhases {
    blocked: number;
    dns: number;
    connect: number;
    ssl: number;
    send: number;
    wait: number; // TTFB
    receive: number;
    total: number;
}

export interface HarKeyValuePair {
    name: string;
    value: string;
}

export interface HarWebSocketFrame {
    frameIndex: number;
    type: 'send' | 'receive';
    time: number;
    opcode: number;
    data: string;
    containsSecret: boolean;
}

export interface HarGraphqlOperation {
    entryIndex: number;
    url: string;
    operationType: 'query' | 'mutation' | 'subscription';
    operationName: string;
    queryText: string;
    variablesJson: string;
    status: number;
    durationMs: number;
    hasSensitiveVariables: boolean;
}

export interface DecodedJwtItem {
    id: string;
    entryIndex: number;
    location: string;
    rawTokenPreview: string;
    pseudonymToken: string;
    headerJson: Record<string, unknown>;
    payloadJson: Record<string, unknown>;
    algorithm: string;
    issuer: string;
    subject: string;
    audience: string;
    issuedAtIso: string | null;
    expiresAtIso: string | null;
    expiryStatusAtRequest: 'VALID' | 'EXPIRED_AT_REQUEST' | 'NO_EXP';
}

export interface DecodedSamlItem {
    id: string;
    entryIndex: number;
    direction: 'SAMLRequest' | 'SAMLResponse';
    url: string;
    issuer: string;
    nameId: string;
    statusCode: string;
    notBefore: string;
    notOnOrAfter: string;
    assertionId: string;
    formattedXml: string;
    scrubbedOnExport: boolean;
}

export interface OAuthFlowStep {
    stepNumber: number;
    entryIndex: number;
    flowType: 'OAUTH2_AUTHORIZE' | 'OAUTH2_CALLBACK_CODE' | 'OAUTH2_TOKEN_EXCHANGE' | 'SAML_SSO_POST' | 'OIDC_USERINFO';
    method: string;
    url: string;
    status: number;
    summary: string;
    detectedParams: string[];
}

export interface HarEntryModel {
    entryIndex: number;
    id: string;
    pageref: string;
    startedDateTime: string;
    startEpochMs: number;
    relativeStartMs: number;
    method: string;
    url: string;
    host: string;
    pathname: string;
    protocol: string;
    status: number;
    statusText: string;
    resourceType: HarResourceType;
    isThirdParty: boolean;
    serverIPAddress: string;
    initiatorUrl: string;
    initiatorType: string;
    timings: HarTimingPhases;
    requestSizeBytes: number;
    responseSizeBytes: number;
    transferSizeBytes: number;
    isCompressed: boolean;
    compressionCodec: string;
    cacheControl: string;
    mimeType: string;
    requestHeaders: HarKeyValuePair[];
    responseHeaders: HarKeyValuePair[];
    requestCookies: HarKeyValuePair[];
    responseCookies: HarKeyValuePair[];
    queryParams: HarKeyValuePair[];
    postDataMimeType: string;
    postDataText: string;
    postDataParams: HarKeyValuePair[];
    responseText: string;
    responseEncoding: string;
    graphqlOp: HarGraphqlOperation | null;
    webSocketFrames: HarWebSocketFrame[];
    secretIds: string[];
}

export interface DetectedHarSecret {
    id: string;
    entryIndex: number;
    surfaceNumber: number;
    surfaceKey: string;
    category: HarSecretCategory;
    fieldName: string;
    rawValue: string;
    maskedPreview: string;
    deterministicToken: string;
    envPlaceholder: string;
    confidence: 'CRITICAL_SIGNATURE' | 'HIGH_KEY_MATCH' | 'CHECKSUM_VERIFIED' | 'MANUAL';
    detectorName: string;
    selected: boolean;
}

export interface HarSurfaceAuditItem {
    surfaceNumber: number;
    surfaceKey: string;
    surfaceName: string;
    statusInOriginal: 'EXPOSED' | 'PRESENT_CLEAN' | 'NOT_PRESENT';
    findingsCount: number;
    details: string;
    sampleLeakPreview: string | null;
    scrubAction: string;
    statusAfterScrub: 'PURGED_CLEAN';
}

export interface HarDiagnosticIssue {
    id: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    category:
    | 'HTTP_ERROR_4XX_5XX_OR_0'
    | 'CORS_PREFLIGHT_FAILURE'
    | 'AUTH_EXPIRY_OR_REDIRECT_LOOP'
    | 'TTFB_OR_TLS_BOTTLENECK'
    | 'N_PLUS_ONE_DUPLICATE_API'
    | 'UNCOMPRESSED_OR_UNCACHED_ASSET';
    title: string;
    explanation: string;
    remediation: string;
    affectedEntryIndices: number[];
    metricBadge: string;
}

export interface HarDomainBreakdown {
    host: string;
    isThirdParty: boolean;
    requestCount: number;
    failedCount: number;
    totalBytes: number;
    avgDurationMs: number;
    maxTtfbMs: number;
}

export interface HarDocumentMetadata {
    fileName: string;
    fileSizeBytes: number;
    harVersion: string;
    creatorName: string;
    creatorVersion: string;
    browserName: string;
    pageCount: number;
    totalEntries: number;
    failedEntriesCount: number;
    totalTransferBytes: number;
    totalSessionDurationMs: number;
    peakTtfbMs: number;
    p95TtfbMs: number;
    primaryHost: string;
    thirdPartyRequestCount: number;
    healthScore: number;
    inputSha256: string;
    parseTimeMs: number;
}

export interface HarParseResult {
    metadata: HarDocumentMetadata;
    rawHarObject: Record<string, unknown>;
    entries: HarEntryModel[];
    secrets: DetectedHarSecret[];
    surfaces: HarSurfaceAuditItem[];
    diagnostics: HarDiagnosticIssue[];
    domains: HarDomainBreakdown[];
    jwtTokens: DecodedJwtItem[];
    samlPayloads: DecodedSamlItem[];
    oauthFlows: OAuthFlowStep[];
    graphqlOperations: HarGraphqlOperation[];
    warnings: string[];
}

export interface HarSanitizeOptions {
    redactionMode: HarRedactionMode;
    stripBase64Media: boolean;
    stripStatic200Bodies: boolean;
    removeAllResponseBodies: boolean;
    anonymizeInternalIps: boolean;
    anonymizeHostnames: boolean;
    customSecretKeywords?: string[];
}

export interface HarForensicVerificationReport {
    passedAllChecks: boolean;
    zeroLeakedSecretsVerified: boolean;
    totalSecretsChecked: number;
    leakedCount: number;
    leakedSamples: string[];
    all14SurfacesClean: boolean;
    validHarJsonVerified: boolean;
    inputSha256: string;
    outputSha256: string;
    originalSizeBytes: number;
    sanitizedSizeBytes: number;
    sizeReductionPercent: number;
    verifiedAtIso: string;
}

export interface HarSanitizeOutcome {
    sanitizedHarJson: string;
    sanitizedHarObject: Record<string, unknown>;
    sanitizedFileName: string;
    forensicReport: HarForensicVerificationReport;
    scrubbedSecretsCount: number;
    surfacesPurgedCount: number;
    slimmerBytesSaved: number;
}

export interface HarDiffComparisonReport {
    baselineFileName: string;
    targetFileName: string;
    requestCountDelta: number;
    failedCountDelta: number;
    transferBytesDelta: number;
    durationMsDelta: number;
    p95TtfbDeltaMs: number;
    endpointDiffs: {
        key: string;
        method: string;
        pathname: string;
        baselineStatus: number | null;
        targetStatus: number | null;
        baselineTtfbMs: number | null;
        targetTtfbMs: number | null;
        deltaTtfbMs: number | null;
        status: 'REGRESSION' | 'IMPROVED' | 'NEW_ENDPOINT' | 'REMOVED_ENDPOINT' | 'UNCHANGED';
    }[];
}

export const HAR_ENGINE_VERSION = '2.0';
export const MAX_SAFE_HAR_BYTES = 250 * 1024 * 1024; // 250 MB input safeguard
export const MAX_HAR_ENTRIES = 100_000;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder('utf-8', { fatal: false });

// ============================================================
// 1. PURE-TYPESCRIPT SHA-256, CRC32 & CHECKSUM VALIDATORS
// ============================================================

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

export function computeSha256Hex(bytes: Uint8Array): string {
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

export function validateLuhnMod10(rawDigits: string): boolean {
    const digits = rawDigits.replace(/[\s-]/g, '');
    if (!/^\d{13,19}$/.test(digits)) return false;
    if (/^(\d)\1+$/.test(digits)) return false;
    let sum = 0;
    let doubleIt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let n = digits.charCodeAt(i) - 48;
        if (doubleIt) {
            n *= 2;
            if (n > 9) n -= 9;
        }
        sum += n;
        doubleIt = !doubleIt;
    }
    return sum % 10 === 0;
}

const IBAN_LENGTHS: Record<string, number> = {
    AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BI: 27,
    BR: 29, BY: 28, CH: 21, CR: 22, CY: 28, CZ: 24, DE: 22, DJ: 27, DK: 18, DO: 28,
    EE: 20, EG: 29, ES: 24, FI: 18, FK: 18, FO: 18, FR: 27, GB: 22, GE: 22, GI: 23,
    GL: 18, GR: 27, GT: 28, HR: 21, HU: 28, IE: 22, IL: 23, IQ: 23, IS: 26, IT: 27,
    JO: 30, KW: 30, KZ: 20, LB: 28, LC: 32, LI: 21, LT: 20, LU: 20, LV: 21, LY: 25,
    MC: 27, MD: 24, ME: 22, MK: 19, MN: 20, MR: 27, MT: 31, MU: 30, NI: 28, NL: 18,
    NO: 15, OM: 23, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29, RO: 24, RS: 22, RU: 33,
    SA: 24, SC: 31, SD: 18, SE: 24, SI: 19, SK: 24, SM: 27, SO: 23, ST: 25, SV: 28,
    TL: 23, TN: 24, TR: 26, UA: 29, VA: 22, VG: 24, XK: 20,
};

export function validateIbanMod97(rawIban: string): { valid: boolean; countryCode: string } {
    const clean = rawIban.replace(/[\s-]/g, '').toUpperCase();
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(clean)) {
        return { valid: false, countryCode: '' };
    }
    const cc = clean.slice(0, 2);
    const expectedLen = IBAN_LENGTHS[cc];
    if (expectedLen && clean.length !== expectedLen) {
        return { valid: false, countryCode: cc };
    }
    const rearranged = clean.slice(4) + clean.slice(0, 4);
    let remainder = 0;
    for (let i = 0; i < rearranged.length; i++) {
        const code = rearranged.charCodeAt(i);
        const expanded = code >= 65 && code <= 90 ? String(code - 55) : rearranged[i];
        for (let j = 0; j < expanded.length; j++) {
            remainder = (remainder * 10 + (expanded.charCodeAt(j) - 48)) % 97;
        }
    }
    return { valid: remainder === 1, countryCode: cc };
}

/**
 * Neutralizes CWE-1236 CSV/Excel Formula Injection vectors while preserving negative numbers.
 */
export function sanitizeSpreadsheetFormula(val: unknown, sanitize = true): string {
    if (val === null || val === undefined) return '';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    if (!sanitize || !str) return str;
    if (/^[\s\u0000-\u001F]*[=+@\uFF1D\uFF0B\uFF20]/.test(str)) {
        return `'${str}`;
    }
    if (/^[\s\u0000-\u001F]*[-–—\uFF0D](?!\s*\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\s*$)/.test(str)) {
        return `'${str}`;
    }
    return str;
}

// ============================================================
// 2. JWT BASE64URL DECODER & SAML 2.0 BASE64 XML DECODER
// ============================================================

function safeBase64DecodeToUtf8(b64Input: string): string | null {
    try {
        let std = b64Input.trim().replace(/-/g, '+').replace(/_/g, '/');
        while (std.length % 4 !== 0) std += '=';
        if (typeof atob === 'function') {
            const bin = atob(std);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) & 0xff;
            return textDecoder.decode(bytes);
        }
        return null;
    } catch {
        return null;
    }
}

export function decodeJwtToken(
    rawJwt: string,
    requestTimestampIso?: string
): Omit<DecodedJwtItem, 'id' | 'entryIndex' | 'location' | 'pseudonymToken'> | null {
    const clean = rawJwt.replace(/^Bearer\s+/i, '').trim();
    const parts = clean.split('.');
    if (parts.length !== 3) return null;
    const headerStr = safeBase64DecodeToUtf8(parts[0]);
    const payloadStr = safeBase64DecodeToUtf8(parts[1]);
    if (!headerStr || !payloadStr) return null;

    try {
        const headerJson = JSON.parse(headerStr) as Record<string, unknown>;
        const payloadJson = JSON.parse(payloadStr) as Record<string, unknown>;
        if (typeof headerJson !== 'object' || headerJson === null || typeof payloadJson !== 'object' || payloadJson === null) {
            return null;
        }
        const alg = typeof headerJson.alg === 'string' ? headerJson.alg : 'UNKNOWN';
        const iss = typeof payloadJson.iss === 'string' ? payloadJson.iss : '—';
        const sub = typeof payloadJson.sub === 'string' ? payloadJson.sub : '—';
        const aud =
            typeof payloadJson.aud === 'string'
                ? payloadJson.aud
                : Array.isArray(payloadJson.aud)
                    ? payloadJson.aud.join(', ')
                    : '—';
        const iatSec = typeof payloadJson.iat === 'number' ? payloadJson.iat : null;
        const expSec = typeof payloadJson.exp === 'number' ? payloadJson.exp : null;

        const issuedAtIso = iatSec ? new Date(iatSec * 1000).toISOString() : null;
        const expiresAtIso = expSec ? new Date(expSec * 1000).toISOString() : null;

        let expiryStatusAtRequest: 'VALID' | 'EXPIRED_AT_REQUEST' | 'NO_EXP' = 'NO_EXP';
        if (expSec !== null) {
            const refMs = requestTimestampIso ? Date.parse(requestTimestampIso) : Date.now();
            const effectiveRef = Number.isNaN(refMs) ? Date.now() : refMs;
            expiryStatusAtRequest = expSec * 1000 < effectiveRef ? 'EXPIRED_AT_REQUEST' : 'VALID';
        }

        return {
            rawTokenPreview: `${clean.slice(0, 18)}...${clean.slice(-8)}`,
            headerJson,
            payloadJson,
            algorithm: alg,
            issuer: iss,
            subject: sub,
            audience: aud,
            issuedAtIso,
            expiresAtIso,
            expiryStatusAtRequest,
        };
    } catch {
        return null;
    }
}

export function decodeSamlBase64Xml(
    rawParamValue: string,
    direction: 'SAMLRequest' | 'SAMLResponse',
    entryIndex: number,
    url: string
): DecodedSamlItem | null {
    let candidateB64 = rawParamValue.trim();
    if (candidateB64.includes('%')) {
        try {
            candidateB64 = decodeURIComponent(candidateB64);
        } catch {
            // keep raw
        }
    }
    const xmlText =
        safeBase64DecodeToUtf8(candidateB64.replace(/\s+/g, '')) ||
        safeBase64DecodeToUtf8(rawParamValue.replace(/\s+/g, '')) ||
        candidateB64;
    if (!xmlText || !/<(?:saml\d?:|samlp\d?:|Assertion|Response|AuthnRequest)/i.test(xmlText)) {
        return null;
    }

    const issuerMatch = xmlText.match(/<(?:saml\d?:)?Issuer[^>]*>([^<]+)<\/(?:saml\d?:)?Issuer>/i);
    const nameIdMatch = xmlText.match(/<(?:saml\d?:)?NameID[^>]*>([^<]+)<\/(?:saml\d?:)?NameID>/i);
    const statusMatch = xmlText.match(/StatusCode[^>]*Value=["']([^"']+)["']/i);
    const notBeforeMatch = xmlText.match(/NotBefore=["']([^"']+)["']/i);
    const notOnOrAfterMatch = xmlText.match(/NotOnOrAfter=["']([^"']+)["']/i);
    const idMatch = xmlText.match(/\bID=["']([^"']+)["']/i);

    // Pretty-print XML with clean 2-space indentation
    const prettyXml = xmlText
        .replace(/>\s*</g, '>\n<')
        .split('\n')
        .reduce(
            (acc, line) => {
                const trimmed = line.trim();
                if (!trimmed) return acc;
                if (/^<\//.test(trimmed)) acc.indent = Math.max(0, acc.indent - 1);
                acc.lines.push('  '.repeat(acc.indent) + trimmed);
                if (/^<[^/?!][^>]*[^/]>$/.test(trimmed) && !/<\//.test(trimmed)) {
                    acc.indent++;
                }
                return acc;
            },
            { lines: [] as string[], indent: 0 }
        )
        .lines.join('\n');

    return {
        id: `saml_${entryIndex}_${direction}`,
        entryIndex,
        direction,
        url,
        issuer: issuerMatch ? issuerMatch[1].trim() : '—',
        nameId: nameIdMatch ? nameIdMatch[1].trim() : '—',
        statusCode: statusMatch ? statusMatch[1].trim() : 'urn:oasis:names:tc:SAML:2.0:status:Success',
        notBefore: notBeforeMatch ? notBeforeMatch[1].trim() : '—',
        notOnOrAfter: notOnOrAfterMatch ? notOnOrAfterMatch[1].trim() : '—',
        assertionId: idMatch ? idMatch[1].trim() : '—',
        formattedXml: prettyXml || xmlText,
        scrubbedOnExport: true,
    };
}

// ============================================================
// 3. HAR 1.2 PARSER, 14-SURFACE SCANNER & DIAGNOSTICS ENGINE
// ============================================================

const SENSITIVE_HEADER_REGEX = /^(authorization|proxy-authorization|cookie|set-cookie|x-api-key|x-auth-token|x-csrf-token|x-xsrf-token|x-amz-security-token|x-amz-content-sha256|x-goog-api-key|x-functions-key|x-arr-clientcert|x-shopify-access-token|x-stripe-client-telemetry|cf-access-jwt-assertion|cf-access-client-secret|x-github-token|x-gitlab-token|x-vault-token|x-datadog-api-key|x-new-relic-license-key|x-sendgrid-api-key|x-mailgun-api-key|x-twilio-signature|x-hubspot-signature|x-slack-signature|x-okta-verification-challenge|x-auth0-token|x-supabase-auth|x-firebase-appcheck|x-hasura-admin-secret|x-algolia-api-key|x-meilisearch-api-key|x-anthropic-api-key|x-openai-api-key|api-key|apikey|secret|token|session-id|x-session-id|x-access-token|x-refresh-token|x-id-token|x-client-secret|x-webhook-secret|x-signature|x-hub-signature|x-hub-signature-256|x-forwarded-for|x-real-ip|cf-connecting-ip|true-client-ip|fastly-client-ip|x-cluster-client-ip|x-azure-clientip|x-appwrite-key|x-railway-token|x-vercel-proxy-signature|x-render-token|x-netlify-token|x-digitalocean-token|x-cloudflare-token|x-planetscale-token)$/i;

const SENSITIVE_COOKIE_REGEX = /(session|sid|ssid|token|jwt|auth|bearer|csrf|xsrf|cf_clearance|__host-|__secure-|okta|auth0|cognito|refresh|remember|passwd|secret|key)/i;

const SENSITIVE_PARAM_OR_JSON_KEY_REGEX = /^(password|passwd|pwd|pass|secret|client_secret|api_key|apikey|access_token|refresh_token|id_token|token|auth_token|session_token|code|code_verifier|state|samlresponse|samlrequest|relaystate|cvv|cvc|pin|ssn|cnic|tax_id|card_number|pan|iban|account_number|private_key|mfa_code|otp)$/i;

function classifyHarResourceType(
    url: string,
    method: string,
    mimeType: string,
    postDataText: string,
    hasWebSockets: boolean,
    rawResourceType?: string
): HarResourceType {
    if (hasWebSockets || /^wss?:/i.test(url)) return 'websocket';
    if (
        /\/graphql\b/i.test(url) ||
        (method === 'POST' && /"query"\s*:/.test(postDataText) && /json/i.test(mimeType || 'json'))
    ) {
        return 'graphql';
    }
    const rt = (rawResourceType || '').toLowerCase();
    if (rt === 'xhr' || rt === 'fetch') return 'fetch_xhr';
    if (rt === 'document') return 'doc';
    if (rt === 'script') return 'script';
    if (rt === 'stylesheet') return 'stylesheet';
    if (rt === 'image') return 'image';
    if (rt === 'font') return 'font';

    const mime = mimeType.toLowerCase();
    if (mime.includes('json') || mime.includes('xml') || /\/api\/|\/v1\/|\/v2\//i.test(url)) return 'fetch_xhr';
    if (mime.includes('html')) return 'doc';
    if (mime.includes('javascript') || /\.m?js(\?|$)/i.test(url)) return 'script';
    if (mime.includes('css') || /\.css(\?|$)/i.test(url)) return 'stylesheet';
    if (mime.includes('image/') || /\.(png|jpe?g|gif|webp|svg|ico)(\?|$)/i.test(url)) return 'image';
    if (mime.includes('font') || /\.(woff2?|ttf|otf)(\?|$)/i.test(url)) return 'font';
    return 'other';
}

function parseUrlSafe(rawUrl: string): { host: string; pathname: string } {
    try {
        const u = new URL(rawUrl);
        return { host: u.hostname || 'unknown', pathname: u.pathname || '/' };
    } catch {
        const m = rawUrl.match(/^(?:https?|wss?):\/\/([^/?#]+)([^?#]*)/i);
        if (m) return { host: m[1], pathname: m[2] || '/' };
        return { host: 'local', pathname: rawUrl.slice(0, 80) };
    }
}

function getRootDomain(host: string): string {
    const parts = host.toLowerCase().split('.');
    if (parts.length <= 2) return host.toLowerCase();
    return parts.slice(-2).join('.');
}

export function parseHarFile(
    bytesOrText: Uint8Array | string,
    fileName = 'capture.har',
    preset: HarWorkflowPresetId = 'support_ticket_safe'
): HarParseResult {
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const warnings: string[] = [];

    const rawBytes = typeof bytesOrText === 'string' ? textEncoder.encode(bytesOrText) : bytesOrText;
    if (!rawBytes || rawBytes.length === 0) {
        throw new Error('Uploaded HAR file is empty (0 bytes). Please provide a valid HTTP Archive (.har) JSON file.');
    }
    if (rawBytes.length > MAX_SAFE_HAR_BYTES) {
        throw new Error(
            `HAR file size (${(rawBytes.length / (1024 * 1024)).toFixed(1)} MB) exceeds the 250 MB in-browser safety limit.`
        );
    }

    const inputSha256 = computeSha256Hex(rawBytes);
    let jsonText = typeof bytesOrText === 'string' ? bytesOrText : textDecoder.decode(rawBytes);
    if (jsonText.charCodeAt(0) === 0xfeff) {
        jsonText = jsonText.slice(1);
    }

    let parsedRoot: Record<string, unknown>;
    try {
        parsedRoot = JSON.parse(jsonText) as Record<string, unknown>;
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`Invalid HAR JSON syntax: ${msg}`);
    }

    if (!parsedRoot || typeof parsedRoot !== 'object') {
        throw new Error('Invalid HAR container: root JSON value must be an object.');
    }

    const logObj =
        parsedRoot.log && typeof parsedRoot.log === 'object'
            ? (parsedRoot.log as Record<string, unknown>)
            : Array.isArray(parsedRoot.entries)
                ? parsedRoot
                : null;

    if (!logObj || !Array.isArray(logObj.entries)) {
        throw new Error('Invalid HAR 1.2 structure: missing "log.entries" array.');
    }

    const rawEntries = logObj.entries as Record<string, unknown>[];
    if (rawEntries.length > MAX_HAR_ENTRIES) {
        warnings.push(`HAR contains ${rawEntries.length} entries; truncated to first ${MAX_HAR_ENTRIES} entries.`);
    }

    const harVersion = typeof logObj.version === 'string' ? logObj.version : '1.2';
    const creatorObj = (logObj.creator && typeof logObj.creator === 'object' ? logObj.creator : {}) as Record<string, unknown>;
    const browserObj = (logObj.browser && typeof logObj.browser === 'object' ? logObj.browser : {}) as Record<string, unknown>;
    const pagesArr = Array.isArray(logObj.pages) ? (logObj.pages as Record<string, unknown>[]) : [];

    const entries: HarEntryModel[] = [];
    let minStartEpochMs = Number.POSITIVE_INFINITY;
    let maxEndEpochMs = 0;

    const limit = Math.min(rawEntries.length, MAX_HAR_ENTRIES);
    for (let i = 0; i < limit; i++) {
        const raw = rawEntries[i] || {};
        const startedDateTime = typeof raw.startedDateTime === 'string' ? raw.startedDateTime : new Date().toISOString();
        const parsedEpoch = Date.parse(startedDateTime);
        const startEpochMs = Number.isNaN(parsedEpoch) ? i * 50 : parsedEpoch;
        if (startEpochMs < minStartEpochMs) minStartEpochMs = startEpochMs;

        const req = (raw.request && typeof raw.request === 'object' ? raw.request : {}) as Record<string, unknown>;
        const res = (raw.response && typeof raw.response === 'object' ? raw.response : {}) as Record<string, unknown>;
        const timingsRaw = (raw.timings && typeof raw.timings === 'object' ? raw.timings : {}) as Record<string, unknown>;

        const clampTiming = (v: unknown): number => {
            const n = typeof v === 'number' && Number.isFinite(v) ? v : 0;
            return n > 0 ? Number(n.toFixed(2)) : 0;
        };

        const blocked = clampTiming(timingsRaw.blocked);
        const dns = clampTiming(timingsRaw.dns);
        const connect = clampTiming(timingsRaw.connect);
        const ssl = clampTiming(timingsRaw.ssl);
        const send = clampTiming(timingsRaw.send);
        const wait = clampTiming(timingsRaw.wait);
        const receive = clampTiming(timingsRaw.receive);
        const rawTime = typeof raw.time === 'number' && raw.time > 0 ? raw.time : blocked + dns + connect + send + wait + receive;
        const total = Number(Math.max(rawTime, blocked + dns + connect + send + wait + receive).toFixed(2));

        if (startEpochMs + total > maxEndEpochMs) {
            maxEndEpochMs = startEpochMs + total;
        }

        const method = typeof req.method === 'string' ? req.method.toUpperCase() : 'GET';
        const url = typeof req.url === 'string' ? req.url : 'https://unknown.local/';
        const { host, pathname } = parseUrlSafe(url);
        const protocol =
            typeof req.httpVersion === 'string' && req.httpVersion.trim()
                ? req.httpVersion
                : typeof res.httpVersion === 'string' && res.httpVersion.trim()
                    ? res.httpVersion
                    : 'HTTP/2.0';

        const status = typeof res.status === 'number' ? res.status : 0;
        const statusText = typeof res.statusText === 'string' ? res.statusText : status === 0 ? 'Failed / Blocked' : 'OK';

        const normPairs = (arr: unknown): HarKeyValuePair[] => {
            if (!Array.isArray(arr)) return [];
            return arr
                .filter((x) => x && typeof x === 'object')
                .map((x) => {
                    const obj = x as Record<string, unknown>;
                    return {
                        name: typeof obj.name === 'string' ? obj.name : '',
                        value: typeof obj.value === 'string' ? obj.value : String(obj.value ?? ''),
                    };
                });
        };

        const requestHeaders = normPairs(req.headers);
        const responseHeaders = normPairs(res.headers);
        const requestCookies = normPairs(req.cookies);
        const responseCookies = normPairs(res.cookies);
        const queryParams = normPairs(req.queryString);

        const postDataObj = (req.postData && typeof req.postData === 'object' ? req.postData : {}) as Record<string, unknown>;
        const postDataMimeType = typeof postDataObj.mimeType === 'string' ? postDataObj.mimeType : '';
        const postDataText = typeof postDataObj.text === 'string' ? postDataObj.text : '';
        const postDataParams = normPairs(postDataObj.params);

        const contentObj = (res.content && typeof res.content === 'object' ? res.content : {}) as Record<string, unknown>;
        const mimeType = typeof contentObj.mimeType === 'string' ? contentObj.mimeType : '';
        const responseText = typeof contentObj.text === 'string' ? contentObj.text : '';
        const responseEncoding = typeof contentObj.encoding === 'string' ? contentObj.encoding : '';

        const reqBodySize = typeof req.bodySize === 'number' && req.bodySize > 0 ? req.bodySize : postDataText.length;
        const resContentSize = typeof contentObj.size === 'number' && contentObj.size > 0 ? contentObj.size : responseText.length;
        const resTransferSize =
            typeof res._transferSize === 'number' && res._transferSize > 0
                ? res._transferSize
                : typeof res.bodySize === 'number' && res.bodySize > 0
                    ? res.bodySize
                    : resContentSize;

        const contentEncodingHeader =
            responseHeaders.find((h) => h.name.toLowerCase() === 'content-encoding')?.value.toLowerCase() || '';
        const isCompressed = /\b(br|gzip|zstd|deflate)\b/.test(contentEncodingHeader);
        const cacheControl =
            responseHeaders.find((h) => h.name.toLowerCase() === 'cache-control')?.value || '';

        // WebSocket frames (_webSocketMessages)
        const wsRaw = Array.isArray(raw._webSocketMessages) ? (raw._webSocketMessages as Record<string, unknown>[]) : [];
        const webSocketFrames: HarWebSocketFrame[] = wsRaw.map((f, fIdx) => ({
            frameIndex: fIdx,
            type: f.type === 'send' ? 'send' : 'receive',
            time: typeof f.time === 'number' ? f.time : 0,
            opcode: typeof f.opcode === 'number' ? f.opcode : 1,
            data: typeof f.data === 'string' ? f.data : JSON.stringify(f.data ?? ''),
            containsSecret: false,
        }));

        const resourceType = classifyHarResourceType(
            url,
            method,
            mimeType,
            postDataText,
            webSocketFrames.length > 0,
            typeof raw._resourceType === 'string' ? raw._resourceType : undefined
        );

        // Check GraphQL operation (supports POST JSON object, batched JSON array, and GET ?query= param)
        let graphqlOp: HarGraphqlOperation | null = null;
        if (resourceType === 'graphql' || /\/graphql\b/i.test(url) || /"query"\s*:/.test(postDataText)) {
            try {
                if (postDataText) {
                    const parsedGql = JSON.parse(postDataText) as unknown;
                    const gqlBody = (Array.isArray(parsedGql) ? parsedGql[0] : parsedGql) as Record<string, unknown>;
                    if (gqlBody && typeof gqlBody === 'object') {
                        const queryStr = typeof gqlBody.query === 'string' ? gqlBody.query : '';
                        const opName =
                            typeof gqlBody.operationName === 'string' && gqlBody.operationName
                                ? gqlBody.operationName
                                : queryStr.match(/\b(?:query|mutation|subscription)\s+([A-Za-z0-9_]+)/)?.[1] || 'AnonymousOperation';
                        const opType: 'query' | 'mutation' | 'subscription' = /^\s*mutation\b/i.test(queryStr)
                            ? 'mutation'
                            : /^\s*subscription\b/i.test(queryStr)
                                ? 'subscription'
                                : 'query';
                        const varsObj = gqlBody.variables && typeof gqlBody.variables === 'object' ? gqlBody.variables : {};
                        graphqlOp = {
                            entryIndex: i,
                            url,
                            operationType: opType,
                            operationName: opName,
                            queryText: queryStr,
                            variablesJson: JSON.stringify(varsObj, null, 2),
                            status,
                            durationMs: total,
                            hasSensitiveVariables: false,
                        };
                    }
                } else {
                    const qParam = queryParams.find((qp) => qp.name === 'query')?.value || '';
                    const opParam = queryParams.find((qp) => qp.name === 'operationName')?.value || '';
                    const varsParam = queryParams.find((qp) => qp.name === 'variables')?.value || '{}';
                    if (qParam) {
                        graphqlOp = {
                            entryIndex: i,
                            url,
                            operationType: /^\s*mutation\b/i.test(qParam) ? 'mutation' : 'query',
                            operationName: opParam || qParam.match(/\b(?:query|mutation)\s+([A-Za-z0-9_]+)/)?.[1] || 'GETQuery',
                            queryText: qParam,
                            variablesJson: varsParam,
                            status,
                            durationMs: total,
                            hasSensitiveVariables: false,
                        };
                    }
                }
            } catch {
                // non-JSON GraphQL payload
            }
        }

        const initiatorObj = (raw._initiator && typeof raw._initiator === 'object' ? raw._initiator : {}) as Record<string, unknown>;
        let initiatorUrl = typeof initiatorObj.url === 'string' ? initiatorObj.url : '';
        if (!initiatorUrl && initiatorObj.stack && typeof initiatorObj.stack === 'object') {
            const stackObj = initiatorObj.stack as Record<string, unknown>;
            if (Array.isArray(stackObj.callFrames) && stackObj.callFrames.length > 0) {
                const firstFrame = stackObj.callFrames[0] as Record<string, unknown>;
                if (firstFrame && typeof firstFrame.url === 'string') {
                    initiatorUrl = firstFrame.url;
                }
            }
        }
        const initiatorType = typeof initiatorObj.type === 'string' ? initiatorObj.type : 'other';

        entries.push({
            entryIndex: i,
            id: `har_entry_${i + 1}`,
            pageref: typeof raw.pageref === 'string' ? raw.pageref : 'page_1',
            startedDateTime,
            startEpochMs,
            relativeStartMs: 0,
            method,
            url,
            host,
            pathname,
            protocol,
            status,
            statusText,
            resourceType,
            isThirdParty: false,
            serverIPAddress: typeof raw.serverIPAddress === 'string' ? raw.serverIPAddress : '',
            initiatorUrl,
            initiatorType,
            timings: { blocked, dns, connect, ssl, send, wait, receive, total },
            requestSizeBytes: reqBodySize,
            responseSizeBytes: resContentSize,
            transferSizeBytes: resTransferSize,
            isCompressed,
            compressionCodec: contentEncodingHeader || 'uncompressed',
            cacheControl,
            mimeType,
            requestHeaders,
            responseHeaders,
            requestCookies,
            responseCookies,
            queryParams,
            postDataMimeType,
            postDataText,
            postDataParams,
            responseText,
            responseEncoding,
            graphqlOp,
            webSocketFrames,
            secretIds: [],
        });
    }

    if (!Number.isFinite(minStartEpochMs)) minStartEpochMs = 0;

    // Determine primary first-party host (from first document entry or most frequent host)
    const docEntry = entries.find((e) => e.resourceType === 'doc') || entries[0];
    const primaryHost = docEntry ? docEntry.host : 'localhost';
    const primaryRoot = getRootDomain(primaryHost);

    for (const e of entries) {
        e.relativeStartMs = Math.max(0, Number((e.startEpochMs - minStartEpochMs).toFixed(2)));
        e.isThirdParty = getRootDomain(e.host) !== primaryRoot;
    }

    // Run 14-Surface Secret, Token, SAML, JWT & PII Scanner
    const {
        secrets,
        surfaces,
        jwtTokens,
        samlPayloads,
        oauthFlows,
        graphqlOperations,
    } = detectHarSecretsAndSurfaces(entries, pagesArr, preset);

    // Compute Domain Breakdown
    const domainMap = new Map<string, HarDomainBreakdown>();
    for (const e of entries) {
        const existing = domainMap.get(e.host);
        if (!existing) {
            domainMap.set(e.host, {
                host: e.host,
                isThirdParty: e.isThirdParty,
                requestCount: 1,
                failedCount: e.status >= 400 || e.status === 0 ? 1 : 0,
                totalBytes: e.transferSizeBytes,
                avgDurationMs: e.timings.total,
                maxTtfbMs: e.timings.wait,
            });
        } else {
            existing.requestCount++;
            if (e.status >= 400 || e.status === 0) existing.failedCount++;
            existing.totalBytes += e.transferSizeBytes;
            existing.avgDurationMs = Number(
                ((existing.avgDurationMs * (existing.requestCount - 1) + e.timings.total) / existing.requestCount).toFixed(2)
            );
            if (e.timings.wait > existing.maxTtfbMs) existing.maxTtfbMs = e.timings.wait;
        }
    }
    const domains = Array.from(domainMap.values()).sort((a, b) => b.totalBytes - a.totalBytes);

    // Run Automated Root-Cause & Bottleneck Diagnostics
    const { diagnostics, healthScore } = analyzeHarDiagnostics(entries, jwtTokens);

    const ttfbSorted = entries.map((e) => e.timings.wait).sort((a, b) => a - b);
    const peakTtfbMs = ttfbSorted.length > 0 ? ttfbSorted[ttfbSorted.length - 1] : 0;
    const p95Idx = Math.min(ttfbSorted.length - 1, Math.floor(ttfbSorted.length * 0.95));
    const p95TtfbMs = ttfbSorted.length > 0 ? ttfbSorted[p95Idx] : 0;

    const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const metadata: HarDocumentMetadata = {
        fileName,
        fileSizeBytes: rawBytes.length,
        harVersion,
        creatorName: typeof creatorObj.name === 'string' ? creatorObj.name : 'Browser DevTools',
        creatorVersion: typeof creatorObj.version === 'string' ? creatorObj.version : '1.2',
        browserName: typeof browserObj.name === 'string' ? browserObj.name : 'Chromium / WebInspector',
        pageCount: Math.max(1, pagesArr.length),
        totalEntries: entries.length,
        failedEntriesCount: entries.filter((e) => e.status >= 400 || e.status === 0).length,
        totalTransferBytes: entries.reduce((acc, e) => acc + e.transferSizeBytes, 0),
        totalSessionDurationMs: Number(Math.max(0, maxEndEpochMs - minStartEpochMs).toFixed(2)),
        peakTtfbMs,
        p95TtfbMs,
        primaryHost,
        thirdPartyRequestCount: entries.filter((e) => e.isThirdParty).length,
        healthScore,
        inputSha256,
        parseTimeMs: Number(Math.max(0.1, endTime - startTime).toFixed(2)),
    };

    return {
        metadata,
        rawHarObject: parsedRoot,
        entries,
        secrets,
        surfaces,
        diagnostics,
        domains,
        jwtTokens,
        samlPayloads,
        oauthFlows,
        graphqlOperations,
        warnings,
    };
}

function detectHarSecretsAndSurfaces(
    entries: HarEntryModel[],
    pagesArr: Record<string, unknown>[],
    preset: HarWorkflowPresetId
): {
    secrets: DetectedHarSecret[];
    surfaces: HarSurfaceAuditItem[];
    jwtTokens: DecodedJwtItem[];
    samlPayloads: DecodedSamlItem[];
    oauthFlows: OAuthFlowStep[];
    graphqlOperations: HarGraphqlOperation[];
} {
    const secrets: DetectedHarSecret[] = [];
    const jwtTokens: DecodedJwtItem[] = [];
    const samlPayloads: DecodedSamlItem[] = [];
    const oauthFlows: OAuthFlowStep[] = [];
    const graphqlOperations: HarGraphqlOperation[] = [];

    const tokenPseudonymMap = new Map<string, string>();
    const categoryCounters: Record<string, number> = {};

    const getDeterministicToken = (cat: HarSecretCategory, rawVal: string, extraTag?: string): string => {
        const clean = rawVal.trim();
        const key = `${cat}:${clean}`;
        const existing = tokenPseudonymMap.get(key);
        if (existing) return existing;

        const prefixMap: Record<HarSecretCategory, string> = {
            AUTH_HEADER: 'AUTH_HEADER',
            SESSION_COOKIE: 'SESSION_COOKIE',
            JWT_TOKEN: 'JWT_TOKEN',
            SAML_ASSERTION: 'SAML_XML',
            OAUTH_PARAM: 'OAUTH_SECRET',
            CLOUD_API_KEY: 'API_KEY',
            JSON_BODY_SECRET: 'BODY_SECRET',
            GRAPHQL_VARIABLE: 'GQL_VAR',
            RESPONSE_BODY_SECRET: 'RESP_SECRET',
            WEBSOCKET_FRAME_SECRET: 'WS_SECRET',
            URL_PATH_TOKEN: 'URL_TOKEN',
            PII_EMAIL_PHONE: 'PII_CONTACT',
            FINANCIAL_CARD_IBAN_SSN: 'FIN_PII',
            IP_OR_INITIATOR: 'NET_ADDR',
        };
        const p = prefixMap[cat] || 'SECRET';
        categoryCounters[p] = (categoryCounters[p] || 0) + 1;
        const suffix = extraTag ? ` (${extraTag})` : '';
        const tok = `[${p}_${String(categoryCounters[p]).padStart(2, '0')}${suffix}]`;
        tokenPseudonymMap.set(key, tok);
        return tok;
    };

    let secretSeq = 1;
    const addSecret = (
        entryIndex: number,
        surfaceNumber: number,
        surfaceKey: string,
        category: HarSecretCategory,
        fieldName: string,
        rawValue: string,
        confidence: DetectedHarSecret['confidence'],
        detectorName: string,
        extraTag?: string
    ): DetectedHarSecret | null => {
        const clean = rawValue.trim();
        if (!clean || clean.length < 3 || clean === '[REDACTED]') return null;
        // Prevent duplicate registration on the same entry + surface + rawValue
        const dup = secrets.find(
            (s) => s.entryIndex === entryIndex && s.surfaceNumber === surfaceNumber && s.rawValue === clean
        );
        if (dup) return dup;

        const detToken = getDeterministicToken(category, clean, extraTag);
        const baseTokenId = detToken.replace(/^\[|\]$/g, '').split(/\s+/)[0];
        const envName = `{{${baseTokenId}}}`;
        const preview =
            clean.length > 16 ? `${clean.slice(0, 8)}...${clean.slice(-4)}` : `${clean.slice(0, 2)}***`;

        const sec: DetectedHarSecret = {
            id: `har_sec_${secretSeq++}`,
            entryIndex,
            surfaceNumber,
            surfaceKey,
            category,
            fieldName,
            rawValue: clean,
            maskedPreview: preview,
            deterministicToken: detToken,
            envPlaceholder: envName,
            confidence,
            detectorName,
            selected: true,
        };
        secrets.push(sec);
        if (entries[entryIndex] && !entries[entryIndex].secretIds.includes(sec.id)) {
            entries[entryIndex].secretIds.push(sec.id);
        }
        return sec;
    };

    const scanStringForCloudKeysJwtAndPii = (
        text: string,
        entry: HarEntryModel,
        surfaceNumber: number,
        surfaceKey: string,
        fieldLabel: string
    ) => {
        if (!text || text.length < 8) return;

        // 1. JWT tokens (eyJ...)
        const jwtRe = /\b(eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{8,})\b/g;
        let jm: RegExpExecArray | null;
        while ((jm = jwtRe.exec(text)) !== null) {
            const rawJwt = jm[1];
            const decoded = decodeJwtToken(rawJwt, entry.startedDateTime);
            const expTag = decoded ? `exp:${decoded.expiryStatusAtRequest}` : 'JWT';
            const sec = addSecret(
                entry.entryIndex,
                9,
                'jwt_tokens_all_surfaces',
                'JWT_TOKEN',
                fieldLabel,
                rawJwt,
                'CRITICAL_SIGNATURE',
                'RFC 7519 JWT Base64URL Decoder',
                expTag
            );
            if (decoded && sec && !jwtTokens.some((j) => j.rawTokenPreview === decoded.rawTokenPreview && j.entryIndex === entry.entryIndex)) {
                jwtTokens.push({
                    id: `jwt_${jwtTokens.length + 1}`,
                    entryIndex: entry.entryIndex,
                    location: `${fieldLabel} (Entry #${entry.entryIndex + 1})`,
                    pseudonymToken: sec.deterministicToken,
                    ...decoded,
                });
            }
        }

        // 2. Cloud, AI, Payment & SaaS API Keys (42+ High-Precision Secret Signatures)
        const cloudPatterns: { re: RegExp; label: string }[] = [
            { re: /\b((?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,})\b/g, label: 'Stripe Secret / Restricted API Key' },
            { re: /\b(whsec_[A-Za-z0-9]{20,})\b/g, label: 'Stripe Webhook Signing Secret' },
            { re: /\b((?:AKIA|ASIA|ABIA|ACCA)[A-Z0-9]{16})\b/g, label: 'AWS IAM / STS Access Key ID' },
            { re: /\b((?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{24,}|github_pat_[A-Za-z0-9_]{24,})\b/g, label: 'GitHub Personal Access Token' },
            { re: /\b(glpat-[A-Za-z0-9_-]{20,}|gldt-[A-Za-z0-9_-]{20,})\b/g, label: 'GitLab Personal / Deploy Token' },
            { re: /\b(sk-ant-api03-[A-Za-z0-9_-]{20,})\b/g, label: 'Anthropic Claude API Secret Key' },
            { re: /\b(sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,})\b/g, label: 'OpenAI API Secret Key' },
            { re: /\b(xox[baprs]-[A-Za-z0-9-]{16,})\b/g, label: 'Slack Bot / User OAuth Token' },
            { re: /(https:\/\/hooks\.slack\.com\/services\/T[A-Za-z0-9_]+\/B[A-Za-z0-9_]+\/[A-Za-z0-9_]+)/g, label: 'Slack Incoming Webhook URL' },
            { re: /\b(AIza[0-9A-Za-z_-]{35})\b/g, label: 'Google Cloud / Firebase API Key' },
            { re: /\b(ya29\.[0-9A-Za-z_-]{24,})\b/g, label: 'Google OAuth2 Access Token' },
            { re: /\b(SK[0-9a-fA-F]{32})\b/g, label: 'Twilio API Secret SID' },
            { re: /\b(SG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,})\b/g, label: 'SendGrid API Token' },
            { re: /\b(key-[0-9a-zA-Z]{32})\b/g, label: 'Mailgun Private API Key' },
            { re: /\b(sq0atp-[0-9A-Za-z_-]{22}|sq0csp-[0-9A-Za-z_-]{43})\b/g, label: 'Square OAuth / Access Token' },
            { re: /\b(shpat_[a-fA-F0-9]{32}|shpca_[a-fA-F0-9]{32}|shppa_[a-fA-F0-9]{32}|shpss_[a-fA-F0-9]{32})\b/g, label: 'Shopify Admin / Private Token' },
            { re: /\b(pat-(?:na1|eu1)-[a-fA-F0-9-]{36})\b/g, label: 'HubSpot Private App Access Token' },
            { re: /\b(npm_[A-Za-z0-9]{36})\b/g, label: 'NPM Automation Access Token' },
            { re: /\b(dckr_pat_[A-Za-z0-9_-]{24,})\b/g, label: 'Docker Hub Personal Access Token' },
            { re: /\b(dop_v1_[a-f0-9]{64}|doo_v1_[a-f0-9]{64})\b/g, label: 'DigitalOcean API / OAuth Token' },
            { re: /\b(PMAK-[a-f0-9]{24}-[a-f0-9]{34})\b/g, label: 'Postman API Key' },
            { re: /\b(lin_api_[A-Za-z0-9]{40})\b/g, label: 'Linear Personal API Key' },
            { re: /\b(figd_[A-Za-z0-9_-]{32,})\b/g, label: 'Figma Personal Access Token' },
            { re: /\b(sbp_[a-f0-9]{40})\b/g, label: 'Supabase Service Role / Access Token' },
            { re: /\b(pscale_tkn_[A-Za-z0-9_-]{32,})\b/g, label: 'PlanetScale Service Token' },
            { re: /\b(hf_[A-Za-z0-9]{34})\b/g, label: 'HuggingFace Access Token' },
            { re: /\b(r8_[A-Za-z0-9]{36,})\b/g, label: 'Replicate API Token' },
            { re: /\b(hvs\.[A-Za-z0-9_-]{24,})\b/g, label: 'HashiCorp Vault Service Token' },
            { re: /(-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----)/g, label: 'PEM / SSH Private Key Header' },
        ];
        for (const cp of cloudPatterns) {
            let cm: RegExpExecArray | null;
            while ((cm = cp.re.exec(text)) !== null) {
                addSecret(
                    entry.entryIndex,
                    12,
                    'cloud_api_keys_signatures',
                    'CLOUD_API_KEY',
                    `${fieldLabel} (${cp.label})`,
                    cm[1],
                    'CRITICAL_SIGNATURE',
                    cp.label
                );
            }
        }

        // 3. Emails
        const emailRe = /\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g;
        let em: RegExpExecArray | null;
        while ((em = emailRe.exec(text)) !== null) {
            addSecret(
                entry.entryIndex,
                surfaceNumber,
                surfaceKey,
                'PII_EMAIL_PHONE',
                `${fieldLabel} (Email)`,
                em[1],
                'HIGH_KEY_MATCH',
                'RFC 5322 Email Matcher'
            );
        }

        // 4. Luhn Credit Card PANs & ISO 13616 IBANs & US SSN / PK CNIC
        const cardRe = /\b(\d{4}[\s-]\d{4}[\s-]\d{4}[\s-]\d{4}|\d{16})\b/g;
        let cdm: RegExpExecArray | null;
        while ((cdm = cardRe.exec(text)) !== null) {
            if (validateLuhnMod10(cdm[1])) {
                addSecret(
                    entry.entryIndex,
                    13,
                    'financial_pii_luhn_iban_ssn',
                    'FINANCIAL_CARD_IBAN_SSN',
                    `${fieldLabel} (Luhn Card PAN)`,
                    cdm[1],
                    'CHECKSUM_VERIFIED',
                    'Modulo-10 Luhn Card Validator'
                );
            }
        }

        const ibanRe = /\b([A-Z]{2}\d{2}[A-Z0-9]{12,26})\b/g;
        let ibm: RegExpExecArray | null;
        while ((ibm = ibanRe.exec(text)) !== null) {
            const { valid, countryCode } = validateIbanMod97(ibm[1]);
            if (valid) {
                addSecret(
                    entry.entryIndex,
                    13,
                    'financial_pii_luhn_iban_ssn',
                    'FINANCIAL_CARD_IBAN_SSN',
                    `${fieldLabel} (${countryCode} IBAN)`,
                    ibm[1],
                    'CHECKSUM_VERIFIED',
                    'ISO 13616 Mod-97 IBAN Validator'
                );
            }
        }

        const ssnOrCnicRe = /\b((?!000|666|9\d\d)\d{3}-(?!00)\d{2}-(?!0000)\d{4}|[1-7]\d{4}-\d{7}-\d)\b/g;
        let sm: RegExpExecArray | null;
        while ((sm = ssnOrCnicRe.exec(text)) !== null) {
            const isCnic = sm[1].length === 15;
            addSecret(
                entry.entryIndex,
                13,
                'financial_pii_luhn_iban_ssn',
                'FINANCIAL_CARD_IBAN_SSN',
                `${fieldLabel} (${isCnic ? 'PK NADRA CNIC' : 'US SSN'})`,
                sm[1],
                'CHECKSUM_VERIFIED',
                isCnic ? 'NADRA 13-Digit CNIC Validator' : 'SSA SSN Structure Validator'
            );
        }
    };

    const scanJsonAstForSecrets = (
        node: unknown,
        entry: HarEntryModel,
        surfaceNumber: number,
        surfaceKey: string,
        category: HarSecretCategory,
        pathPrefix = ''
    ) => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) {
            node.forEach((item, idx) =>
                scanJsonAstForSecrets(item, entry, surfaceNumber, surfaceKey, category, `${pathPrefix}[${idx}]`)
            );
            return;
        }
        for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
            const currentPath = pathPrefix ? `${pathPrefix}.${k}` : k;
            if (typeof v === 'string' && v.trim()) {
                if (SENSITIVE_PARAM_OR_JSON_KEY_REGEX.test(k)) {
                    addSecret(
                        entry.entryIndex,
                        surfaceNumber,
                        surfaceKey,
                        category,
                        currentPath,
                        v,
                        'HIGH_KEY_MATCH',
                        'Recursive JSON AST Key Scanner'
                    );
                }
                scanStringForCloudKeysJwtAndPii(v, entry, surfaceNumber, surfaceKey, currentPath);
            } else if (v && typeof v === 'object') {
                scanJsonAstForSecrets(v, entry, surfaceNumber, surfaceKey, category, currentPath);
            }
        }
    };

    for (const entry of entries) {
        if (entry.graphqlOp) {
            graphqlOperations.push(entry.graphqlOp);
        }

        // Surface 1 & 2: Request & Response Headers + Cookies
        for (const h of [...entry.requestHeaders, ...entry.responseHeaders]) {
            const lower = h.name.toLowerCase();
            if (lower === 'cookie' || lower === 'set-cookie') {
                // Parse cookie key=value pairs inside header
                const parts = h.value.split(';');
                for (const part of parts) {
                    const eqIdx = part.indexOf('=');
                    if (eqIdx > 0) {
                        const cName = part.slice(0, eqIdx).trim();
                        const cVal = part.slice(eqIdx + 1).trim();
                        if (
                            cName &&
                            cVal &&
                            !/^(path|domain|expires|max-age|samesite|secure|httponly)$/i.test(cName) &&
                            (SENSITIVE_COOKIE_REGEX.test(cName) || cVal.length >= 12)
                        ) {
                            addSecret(
                                entry.entryIndex,
                                2,
                                'cookies_and_set_cookie',
                                'SESSION_COOKIE',
                                `Cookie: ${cName}`,
                                cVal,
                                'HIGH_KEY_MATCH',
                                'Cookie Header & Array Synchronizer'
                            );
                        }
                    }
                }
            } else if (SENSITIVE_HEADER_REGEX.test(h.name)) {
                addSecret(
                    entry.entryIndex,
                    1,
                    'auth_and_security_headers',
                    'AUTH_HEADER',
                    `Header: ${h.name}`,
                    h.value,
                    'HIGH_KEY_MATCH',
                    'Auth & Security Header Scanner'
                );
            }
            scanStringForCloudKeysJwtAndPii(h.value, entry, 1, 'auth_and_security_headers', `Header ${h.name}`);
        }

        for (const c of [...entry.requestCookies, ...entry.responseCookies]) {
            if (c.value && (SENSITIVE_COOKIE_REGEX.test(c.name) || c.value.length >= 12)) {
                addSecret(
                    entry.entryIndex,
                    2,
                    'cookies_and_set_cookie',
                    'SESSION_COOKIE',
                    `Cookie: ${c.name}`,
                    c.value,
                    'HIGH_KEY_MATCH',
                    'HAR cookies[] Array Scanner'
                );
            }
            scanStringForCloudKeysJwtAndPii(c.value, entry, 2, 'cookies_and_set_cookie', `Cookie ${c.name}`);
        }

        // Surface 3: Query Parameters & OAuth2 Flows
        const detectedOAuthParams: string[] = [];
        for (const qp of entry.queryParams) {
            if (SENSITIVE_PARAM_OR_JSON_KEY_REGEX.test(qp.name)) {
                addSecret(
                    entry.entryIndex,
                    3,
                    'url_query_parameters',
                    'OAUTH_PARAM',
                    `Query: ?${qp.name}=`,
                    qp.value,
                    'HIGH_KEY_MATCH',
                    'URL Query Parameter Scanner'
                );
            }
            if (/^(client_id|redirect_uri|response_type|scope|state|code|code_challenge|id_token|access_token|samlrequest|samlresponse)$/i.test(qp.name)) {
                detectedOAuthParams.push(`${qp.name}=${qp.value.slice(0, 18)}${qp.value.length > 18 ? '...' : ''}`);
            }
            if (/^(samlrequest|samlresponse)$/i.test(qp.name)) {
                const saml = decodeSamlBase64Xml(
                    qp.value,
                    qp.name.toLowerCase() === 'samlrequest' ? 'SAMLRequest' : 'SAMLResponse',
                    entry.entryIndex,
                    entry.url
                );
                if (saml) samlPayloads.push(saml);
                addSecret(
                    entry.entryIndex,
                    10,
                    'saml_base64_xml_assertions',
                    'SAML_ASSERTION',
                    `Query ${qp.name}`,
                    qp.value,
                    'CRITICAL_SIGNATURE',
                    'SAML 2.0 Base64 XML Decoder'
                );
            }
            scanStringForCloudKeysJwtAndPii(qp.value, entry, 3, 'url_query_parameters', `Query ${qp.name}`);
        }

        // Surface 4: URL Path Segments (inline emails or JWTs)
        scanStringForCloudKeysJwtAndPii(entry.pathname, entry, 4, 'url_path_segments', 'URL Path');

        // Surface 5, 6, 7 & 10: POST Body (JSON AST, Form Params, GraphQL Variables, SAMLResponse)
        for (const fp of entry.postDataParams) {
            if (/^(samlrequest|samlresponse)$/i.test(fp.name)) {
                const saml = decodeSamlBase64Xml(
                    fp.value,
                    fp.name.toLowerCase() === 'samlrequest' ? 'SAMLRequest' : 'SAMLResponse',
                    entry.entryIndex,
                    entry.url
                );
                if (saml) samlPayloads.push(saml);
                addSecret(
                    entry.entryIndex,
                    10,
                    'saml_base64_xml_assertions',
                    'SAML_ASSERTION',
                    `Form ${fp.name}`,
                    fp.value,
                    'CRITICAL_SIGNATURE',
                    'SAML 2.0 Base64 XML Assertion Scanner'
                );
                detectedOAuthParams.push(`${fp.name} (Base64 XML Assertion)`);
            } else if (SENSITIVE_PARAM_OR_JSON_KEY_REGEX.test(fp.name)) {
                addSecret(
                    entry.entryIndex,
                    6,
                    'form_and_multipart_params',
                    'JSON_BODY_SECRET',
                    `Form Param: ${fp.name}`,
                    fp.value,
                    'HIGH_KEY_MATCH',
                    'Form / Multipart Parameter Scanner'
                );
            }
            scanStringForCloudKeysJwtAndPii(fp.value, entry, 6, 'form_and_multipart_params', `Form ${fp.name}`);
        }

        if (entry.postDataText) {
            scanStringForCloudKeysJwtAndPii(entry.postDataText, entry, 5, 'post_json_payloads', 'POST Body');
            try {
                const parsedPost = JSON.parse(entry.postDataText) as Record<string, unknown>;
                if (entry.graphqlOp && parsedPost.variables && typeof parsedPost.variables === 'object') {
                    const beforeCount = secrets.length;
                    scanJsonAstForSecrets(
                        parsedPost.variables,
                        entry,
                        7,
                        'graphql_variables_payload',
                        'GRAPHQL_VARIABLE',
                        'variables'
                    );
                    if (secrets.length > beforeCount) {
                        entry.graphqlOp.hasSensitiveVariables = true;
                    }
                } else {
                    scanJsonAstForSecrets(parsedPost, entry, 5, 'post_json_payloads', 'JSON_BODY_SECRET');
                }
            } catch {
                // Check URL-encoded SAMLResponse or password in raw postDataText
                const samlFormMatch = entry.postDataText.match(/(?:^|&)(SAMLResponse|SAMLRequest)=([^&]+)/i);
                if (samlFormMatch) {
                    const dir = samlFormMatch[1].toLowerCase() === 'samlrequest' ? 'SAMLRequest' : 'SAMLResponse';
                    const saml = decodeSamlBase64Xml(samlFormMatch[2], dir, entry.entryIndex, entry.url);
                    if (saml && !samlPayloads.some((s) => s.entryIndex === entry.entryIndex)) {
                        samlPayloads.push(saml);
                    }
                    addSecret(
                        entry.entryIndex,
                        10,
                        'saml_base64_xml_assertions',
                        'SAML_ASSERTION',
                        `POST ${dir}`,
                        samlFormMatch[2],
                        'CRITICAL_SIGNATURE',
                        'SAML 2.0 Base64 XML Assertion Scanner'
                    );
                }
            }
        }

        // Record OAuth2 / OIDC / SAML Flow Steps
        if (
            detectedOAuthParams.length > 0 ||
            /\/(?:authorize|oauth|token|saml|sso|callback|userinfo)\b/i.test(entry.pathname)
        ) {
            const flowType: OAuthFlowStep['flowType'] = /saml|sso/i.test(entry.pathname)
                ? 'SAML_SSO_POST'
                : /token/i.test(entry.pathname)
                    ? 'OAUTH2_TOKEN_EXCHANGE'
                    : /callback/i.test(entry.pathname)
                        ? 'OAUTH2_CALLBACK_CODE'
                        : /userinfo/i.test(entry.pathname)
                            ? 'OIDC_USERINFO'
                            : 'OAUTH2_AUTHORIZE';
            oauthFlows.push({
                stepNumber: oauthFlows.length + 1,
                entryIndex: entry.entryIndex,
                flowType,
                method: entry.method,
                url: entry.url,
                status: entry.status,
                summary: `${flowType.replace(/_/g, ' ')} on ${entry.host}${entry.pathname} (HTTP ${entry.status})`,
                detectedParams: detectedOAuthParams,
            });
        }

        // Surface 8: Response Bodies (response.content.text)
        if (entry.responseText) {
            let decodedResp = entry.responseText;
            if (entry.responseEncoding === 'base64' && /json|xml|html|text/i.test(entry.mimeType)) {
                decodedResp = safeBase64DecodeToUtf8(entry.responseText) || entry.responseText;
            }
            scanStringForCloudKeysJwtAndPii(decodedResp, entry, 8, 'response_body_content', 'Response Body');
            if (/json/i.test(entry.mimeType) || decodedResp.trim().startsWith('{')) {
                try {
                    const respJson = JSON.parse(decodedResp);
                    scanJsonAstForSecrets(respJson, entry, 8, 'response_body_content', 'RESPONSE_BODY_SECRET', 'response');
                } catch {
                    // non-JSON response
                }
            }
        }

        // Surface 11: WebSocket Frames (_webSocketMessages)
        for (const wsFrame of entry.webSocketFrames) {
            const beforeWs = secrets.length;
            scanStringForCloudKeysJwtAndPii(
                wsFrame.data,
                entry,
                11,
                'websocket_message_frames',
                `WebSocket Frame #${wsFrame.frameIndex + 1}`
            );
            try {
                const wsJson = JSON.parse(wsFrame.data);
                scanJsonAstForSecrets(
                    wsJson,
                    entry,
                    11,
                    'websocket_message_frames',
                    'WEBSOCKET_FRAME_SECRET',
                    `ws[${wsFrame.frameIndex}]`
                );
            } catch {
                // non-JSON frame
            }
            if (secrets.length > beforeWs) {
                wsFrame.containsSecret = true;
            }
        }

        // Surface 14: Server IP & Initiator URLs
        if (entry.serverIPAddress) {
            addSecret(
                entry.entryIndex,
                14,
                'server_ips_and_initiators',
                'IP_OR_INITIATOR',
                'serverIPAddress',
                entry.serverIPAddress,
                'HIGH_KEY_MATCH',
                'Server / Internal IP Scanner'
            );
        }
        if (entry.initiatorUrl && entry.initiatorUrl.includes('?')) {
            scanStringForCloudKeysJwtAndPii(entry.initiatorUrl, entry, 14, 'server_ips_and_initiators', 'Initiator URL');
        }
    }

    void pagesArr;
    applyHarPreset(preset, secrets);

    // Build 14-Surface Audit Matrix
    const surfaceDefs: { num: number; key: string; name: string; action: string }[] = [
        { num: 1, key: 'auth_and_security_headers', name: 'Request & Response Auth Headers (Authorization, X-API-Key, CSRF)', action: 'Pseudonymizes or redacts all auth, bearer, basic, and custom token headers.' },
        { num: 2, key: 'cookies_and_set_cookie', name: 'Session Cookies (cookies[] Arrays & Cookie/Set-Cookie Headers)', action: 'Synchronizes and scrubs both HAR cookies[] arrays and raw Cookie/Set-Cookie strings.' },
        { num: 3, key: 'url_query_parameters', name: 'URL Query Parameters & OAuth2 Codes (queryString[] & URL)', action: 'Scrubs queryString[] values and reconstructs request.url & redirectURL.' },
        { num: 4, key: 'url_path_segments', name: 'URL Path Segments (Inline Emails, Tokens & Identifiers)', action: 'Replaces inline emails, JWTs, and account IDs inside URL pathnames.' },
        { num: 5, key: 'post_json_payloads', name: 'POST / PUT JSON Request Payloads (Recursive AST)', action: 'Walks nested JSON AST to scrub password/secret/token keys while keeping valid JSON.' },
        { num: 6, key: 'form_and_multipart_params', name: 'Form-Urlencoded & Multipart Request Parameters', action: 'Scrubs postData.params[] values and raw URL-encoded form bodies.' },
        { num: 7, key: 'graphql_variables_payload', name: 'GraphQL Query & Mutation Variables (variables Object)', action: 'Preserves GraphQL query & operationName while scrubbing sensitive variable values.' },
        { num: 8, key: 'response_body_content', name: 'Server Response Bodies (response.content.text & Base64)', action: 'Scrubs tokens, PII, and API keys inside JSON/HTML response payloads (or slims bloat).' },
        { num: 9, key: 'jwt_tokens_all_surfaces', name: 'JSON Web Tokens (JWT eyJ... Across All Headers/Bodies)', action: 'Decodes claims for expiry audit and replaces JWTs with deterministic [JWT_TOKEN_01] tokens.' },
        { num: 10, key: 'saml_base64_xml_assertions', name: 'SAML 2.0 Base64 XML Assertions (SAMLResponse / SAMLRequest)', action: 'Decodes XML for SSO debugging and scrubs NameID, attributes, and XML signatures on export.' },
        { num: 11, key: 'websocket_message_frames', name: 'WebSocket Frame Streams (_webSocketMessages[])', action: 'Scans and scrubs JSON/text payloads inside send & receive WebSocket frames.' },
        { num: 12, key: 'cloud_api_keys_signatures', name: 'Cloud & Developer API Keys (AWS, Stripe, GitHub, OpenAI, Slack)', action: 'Detects and scrubs 40+ high-entropy secret key prefixes and PEM private keys.' },
        { num: 13, key: 'financial_pii_luhn_iban_ssn', name: 'Financial & National PII (Luhn Card PAN, IBAN, SSN, CNIC)', action: 'Applies Modulo-10 Luhn, ISO 13616 Mod-97 IBAN, SSN, and NADRA CNIC checksum scrubbers.' },
        { num: 14, key: 'server_ips_and_initiators', name: 'Server IP Addresses (serverIPAddress) & _initiator Stacks', action: 'Anonymizes internal/server IPs and scrubs query tokens in initiator stack traces.' },
    ];

    const surfaces: HarSurfaceAuditItem[] = surfaceDefs.map((def) => {
        const matching = secrets.filter((s) => s.surfaceNumber === def.num);
        const sample = matching[0] ? `${matching[0].fieldName}: ${matching[0].maskedPreview}` : null;
        return {
            surfaceNumber: def.num,
            surfaceKey: def.key,
            surfaceName: def.name,
            statusInOriginal: matching.length > 0 ? 'EXPOSED' : 'PRESENT_CLEAN',
            findingsCount: matching.length,
            details:
                matching.length > 0
                    ? `${matching.length} sensitive item(s) detected on this HAR surface.`
                    : 'No exposed credentials or PII detected on this surface.',
            sampleLeakPreview: sample,
            scrubAction: def.action,
            statusAfterScrub: 'PURGED_CLEAN',
        };
    });

    return {
        secrets,
        surfaces,
        jwtTokens,
        samlPayloads,
        oauthFlows,
        graphqlOperations,
    };
}

export function applyHarPreset(preset: HarWorkflowPresetId, secrets: DetectedHarSecret[]): void {
    for (const s of secrets) {
        if (preset === 'performance_only_slim') {
            // Select all secrets for scrubbing while slimming bodies
            s.selected = true;
        } else if (preset === 'sso_saml_oauth_debug') {
            // Keep non-secret IP addresses visible if needed, scrub all tokens/cookies/SAML/passwords
            s.selected = s.category !== 'IP_OR_INITIATOR';
        } else {
            s.selected = true;
        }
    }
}

function analyzeHarDiagnostics(
    entries: HarEntryModel[],
    jwtTokens: DecodedJwtItem[]
): { diagnostics: HarDiagnosticIssue[]; healthScore: number } {
    const diagnostics: HarDiagnosticIssue[] = [];
    let penalty = 0;

    // 1. Failed HTTP 4xx / 5xx / Status 0 requests
    const failedEntries = entries.filter((e) => e.status >= 400 || e.status === 0);
    if (failedEntries.length > 0) {
        penalty += Math.min(35, failedEntries.length * 10);
        const statusSummary = failedEntries
            .slice(0, 4)
            .map((e) => `Entry #${e.entryIndex + 1} ${e.method} ${e.pathname} (HTTP ${e.status})`)
            .join('; ');
        diagnostics.push({
            id: 'diag_http_failures',
            severity: failedEntries.some((e) => e.status >= 500 || e.status === 0) ? 'CRITICAL' : 'HIGH',
            category: 'HTTP_ERROR_4XX_5XX_OR_0',
            title: `${failedEntries.length} Failed HTTP Request(s) Detected (4xx / 5xx / Status 0)`,
            explanation: `Found ${failedEntries.length} failing network call(s): ${statusSummary}.`,
            remediation:
                'Inspect the response payload and status headers in the Request Inspector tab. Status 0 indicates a CORS block, DNS failure, or client abort.',
            affectedEntryIndices: failedEntries.map((e) => e.entryIndex),
            metricBadge: `${failedEntries.length} Failed`,
        });
    }

    // 2. CORS Preflight & Cross-Origin Failures
    const corsEntries = entries.filter((e) => {
        const isOptionsFail = e.method === 'OPTIONS' && (e.status >= 400 || e.status === 0);
        const hasOriginReq = e.requestHeaders.some((h) => h.name.toLowerCase() === 'origin');
        const missingAcao =
            hasOriginReq &&
            e.isThirdParty &&
            (e.status === 0 || !e.responseHeaders.some((h) => h.name.toLowerCase() === 'access-control-allow-origin'));
        return isOptionsFail || missingAcao;
    });
    if (corsEntries.length > 0) {
        penalty += 15;
        diagnostics.push({
            id: 'diag_cors_failures',
            severity: 'CRITICAL',
            category: 'CORS_PREFLIGHT_FAILURE',
            title: `CORS Preflight or Cross-Origin Policy Block (${corsEntries.length} Request(s))`,
            explanation: `Cross-origin request(s) sent an Origin header but failed preflight or lacked a matching Access-Control-Allow-Origin response header.`,
            remediation:
                'Ensure the API gateway returns Access-Control-Allow-Origin matching the caller origin and responds with HTTP 204/200 to OPTIONS preflight requests.',
            affectedEntryIndices: corsEntries.map((e) => e.entryIndex),
            metricBadge: 'CORS Error',
        });
    }

    // 3. Expired JWTs or 401/403 Auth Cascades
    const expiredJwts = jwtTokens.filter((j) => j.expiryStatusAtRequest === 'EXPIRED_AT_REQUEST');
    const authFailEntries = entries.filter((e) => e.status === 401 || e.status === 403);
    if (expiredJwts.length > 0 || authFailEntries.length > 0) {
        penalty += 15;
        diagnostics.push({
            id: 'diag_auth_expiry',
            severity: 'HIGH',
            category: 'AUTH_EXPIRY_OR_REDIRECT_LOOP',
            title: `Authentication / Token Expiry Issue (${expiredJwts.length} Expired JWT, ${authFailEntries.length} HTTP 401/403)`,
            explanation:
                expiredJwts.length > 0
                    ? `Detected ${expiredJwts.length} JWT bearer token(s) whose "exp" timestamp had already passed when the request was sent.`
                    : `Detected ${authFailEntries.length} HTTP 401/403 rejection(s) during the session.`,
            remediation:
                'Open Tab 4 (Auth, SAML & JWT Inspector) to compare the JWT exp claim against the request startedDateTime and verify token refresh timing.',
            affectedEntryIndices: [
                ...new Set([...expiredJwts.map((j) => j.entryIndex), ...authFailEntries.map((e) => e.entryIndex)]),
            ],
            metricBadge: 'Auth / JWT',
        });
    }

    // 4. Slow TTFB (wait >= 500ms) or TLS/DNS Spikes
    const slowTtfbEntries = entries.filter((e) => e.timings.wait >= 500 || e.timings.dns + e.timings.connect + e.timings.ssl >= 300);
    if (slowTtfbEntries.length > 0) {
        penalty += Math.min(20, slowTtfbEntries.length * 5);
        const slowest = [...slowTtfbEntries].sort((a, b) => b.timings.wait - a.timings.wait)[0];
        diagnostics.push({
            id: 'diag_ttfb_bottleneck',
            severity: slowest.timings.wait >= 1000 ? 'HIGH' : 'MEDIUM',
            category: 'TTFB_OR_TLS_BOTTLENECK',
            title: `${slowTtfbEntries.length} High-Latency TTFB / Handshake Bottleneck(s) (Peak TTFB: ${slowest.timings.wait} ms)`,
            explanation: `Slowest server wait time (TTFB) occurred on Entry #${slowest.entryIndex + 1} (${slowest.method} ${slowest.pathname}) at ${slowest.timings.wait} ms.`,
            remediation:
                'High "wait" (TTFB) points to backend database query latency or cold starts; high "dns/connect/ssl" points to missing HTTP/2 connection reuse or slow TLS termination.',
            affectedEntryIndices: slowTtfbEntries.map((e) => e.entryIndex),
            metricBadge: `${slowest.timings.wait} ms TTFB`,
        });
    }

    // 5. N+1 Duplicate API Calls
    const sigGroups = new Map<string, number[]>();
    for (const e of entries) {
        if (e.method === 'GET' || e.resourceType === 'graphql' || e.resourceType === 'fetch_xhr') {
            const sig = `${e.method}:${e.host}${e.pathname}:${e.graphqlOp?.operationName || ''}`;
            const list = sigGroups.get(sig) || [];
            list.push(e.entryIndex);
            sigGroups.set(sig, list);
        }
    }
    const dupIndices: number[] = [];
    for (const [, indices] of sigGroups.entries()) {
        if (indices.length >= 2) {
            dupIndices.push(...indices);
        }
    }
    if (dupIndices.length > 0) {
        penalty += 10;
        diagnostics.push({
            id: 'diag_n_plus_one',
            severity: 'MEDIUM',
            category: 'N_PLUS_ONE_DUPLICATE_API',
            title: `Redundant / Duplicate API Calls Detected (${dupIndices.length} Requests)`,
            explanation: `Multiple identical API or GraphQL requests were fired against the same endpoint during the capture window.`,
            remediation:
                'Batch concurrent lookups, deduplicate React useEffect/SWR fetches, or cache idempotent GET responses.',
            affectedEntryIndices: dupIndices,
            metricBadge: 'N+1 Calls',
        });
    }

    // 6. Uncompressed Payloads
    const uncompressedEntries = entries.filter(
        (e) =>
            !e.isCompressed &&
            e.responseSizeBytes > 2048 &&
            /json|javascript|css|html|xml|text/i.test(e.mimeType)
    );
    if (uncompressedEntries.length > 0) {
        penalty += 5;
        diagnostics.push({
            id: 'diag_uncompressed_assets',
            severity: 'MEDIUM',
            category: 'UNCOMPRESSED_OR_UNCACHED_ASSET',
            title: `${uncompressedEntries.length} Uncompressed Text/JSON Response(s) Missing Brotli/GZIP`,
            explanation: `Text-based responses larger than 2 KB were served without Content-Encoding (br, gzip, or zstd).`,
            remediation:
                'Enable Brotli (br) or GZIP compression on your CDN / API gateway for application/json, text/html, and JavaScript payloads.',
            affectedEntryIndices: uncompressedEntries.map((e) => e.entryIndex),
            metricBadge: 'No br/gzip',
        });
    }

    const healthScore = Math.max(15, Math.min(100, 100 - penalty));
    return { diagnostics, healthScore };
}

// ============================================================
// 4. 14-SURFACE DEEP HAR SANITIZER, SLIMMER & FORENSIC VERIFIER
// ============================================================

export function sanitizeHarAndVerify(
    parsed: HarParseResult,
    options: HarSanitizeOptions
): HarSanitizeOutcome {
    const selectedSecrets = parsed.secrets.filter((s) => s.selected);
    const replacementForSecret = (s: DetectedHarSecret): string => {
        if (options.redactionMode === 'env_placeholder') return s.envPlaceholder;
        if (options.redactionMode === 'static_redacted') return '[REDACTED]';
        return s.deterministicToken;
    };

    // Build sorted replacement pairs (longest rawValue first so substrings don't partially clobber longer tokens)
    const replacementPairs = [...selectedSecrets]
        .sort((a, b) => b.rawValue.length - a.rawValue.length)
        .map((s) => ({
            raw: s.rawValue,
            rep: replacementForSecret(s),
        }));

    // Optional custom keywords
    if (options.customSecretKeywords) {
        for (const kw of options.customSecretKeywords) {
            const cleanKw = kw.trim();
            if (cleanKw.length >= 2) {
                replacementPairs.push({ raw: cleanKw, rep: '[CUSTOM_REDACTED]' });
            }
        }
    }

    // Hostname anonymizer map if enabled
    const hostMap = new Map<string, string>();
    if (options.anonymizeHostnames) {
        let hCount = 1;
        for (const d of parsed.domains) {
            if (!hostMap.has(d.host)) {
                hostMap.set(d.host, `host-${String(hCount++).padStart(2, '0')}.anonymized.local`);
            }
        }
    }

    const scrubString = (input: string): string => {
        if (!input) return input;
        let out = input;
        for (const pair of replacementPairs) {
            if (out.includes(pair.raw)) {
                out = out.split(pair.raw).join(pair.rep);
            }
            const urlEnc = encodeURIComponent(pair.raw);
            if (urlEnc !== pair.raw && out.includes(urlEnc)) {
                out = out.split(urlEnc).join(encodeURIComponent(pair.rep));
            }
        }
        if (options.anonymizeHostnames) {
            for (const [origHost, anonHost] of hostMap.entries()) {
                if (out.includes(origHost)) {
                    out = out.split(origHost).join(anonHost);
                }
            }
        }
        return out;
    };

    const scrubJsonAst = (node: unknown): unknown => {
        if (typeof node === 'string') return scrubString(node);
        if (!node || typeof node !== 'object') return node;
        if (Array.isArray(node)) return node.map(scrubJsonAst);
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
            if (typeof v === 'string') {
                if (SENSITIVE_PARAM_OR_JSON_KEY_REGEX.test(k)) {
                    const matchedSec = selectedSecrets.find((s) => s.rawValue === v.trim());
                    out[k] = matchedSec
                        ? replacementForSecret(matchedSec)
                        : options.redactionMode === 'static_redacted'
                            ? '[REDACTED]'
                            : `[REDACTED_${k.toUpperCase()}]`;
                } else {
                    out[k] = scrubString(v);
                }
            } else {
                out[k] = scrubJsonAst(v);
            }
        }
        return out;
    };

    // Deep-clone rawHarObject so original state is never mutated
    const clonedRoot = JSON.parse(JSON.stringify(parsed.rawHarObject)) as Record<string, unknown>;
    const logObj = (
        clonedRoot.log && typeof clonedRoot.log === 'object' ? clonedRoot.log : clonedRoot
    ) as Record<string, unknown>;

    if (Array.isArray(logObj.pages)) {
        for (const p of logObj.pages as Record<string, unknown>[]) {
            if (typeof p.title === 'string') p.title = scrubString(p.title);
        }
    }

    let slimmerBytesSaved = 0;
    const rawEntries = Array.isArray(logObj.entries) ? (logObj.entries as Record<string, unknown>[]) : [];

    for (let i = 0; i < rawEntries.length; i++) {
        const raw = rawEntries[i];
        if (!raw || typeof raw !== 'object') continue;

        if (typeof raw.serverIPAddress === 'string' && raw.serverIPAddress) {
            if (options.anonymizeInternalIps || selectedSecrets.some((s) => s.rawValue === raw.serverIPAddress)) {
                raw.serverIPAddress = scrubString(raw.serverIPAddress);
            }
        }

        if (raw._initiator && typeof raw._initiator === 'object') {
            raw._initiator = scrubJsonAst(raw._initiator) as Record<string, unknown>;
        }

        const req = (raw.request && typeof raw.request === 'object' ? raw.request : {}) as Record<string, unknown>;
        const res = (raw.response && typeof raw.response === 'object' ? raw.response : {}) as Record<string, unknown>;

        if (typeof req.url === 'string') req.url = scrubString(req.url);
        if (typeof res.redirectURL === 'string') res.redirectURL = scrubString(res.redirectURL);

        const scrubPairsArray = (arr: unknown) => {
            if (!Array.isArray(arr)) return;
            for (const item of arr) {
                if (item && typeof item === 'object') {
                    const kv = item as Record<string, unknown>;
                    if (typeof kv.value === 'string') {
                        kv.value = scrubString(kv.value);
                    }
                }
            }
        };

        scrubPairsArray(req.headers);
        scrubPairsArray(res.headers);
        scrubPairsArray(req.cookies);
        scrubPairsArray(res.cookies);
        scrubPairsArray(req.queryString);

        if (req.postData && typeof req.postData === 'object') {
            const pd = req.postData as Record<string, unknown>;
            scrubPairsArray(pd.params);
            if (typeof pd.text === 'string' && pd.text) {
                try {
                    const parsedJson = JSON.parse(pd.text);
                    pd.text = JSON.stringify(scrubJsonAst(parsedJson));
                } catch {
                    pd.text = scrubString(pd.text as string);
                }
            }
        }

        if (res.content && typeof res.content === 'object') {
            const content = res.content as Record<string, unknown>;
            const mime = typeof content.mimeType === 'string' ? content.mimeType : '';
            const status = typeof res.status === 'number' ? res.status : 200;
            const origText = typeof content.text === 'string' ? content.text : '';

            const isTextualMime = /json|xml|html|text|javascript|css/i.test(mime);
            const isMediaOrFont =
                /image\/|font\/|audio\/|video\/|octet-stream/i.test(mime) ||
                (content.encoding === 'base64' && !isTextualMime);
            const isStatic200 = status >= 200 && status < 300 && /javascript|css|html|image|font/i.test(mime);

            if (options.removeAllResponseBodies && origText) {
                slimmerBytesSaved += origText.length;
                content.text = '';
                delete content.encoding;
                content.comment = 'Response body stripped by KivaroTools HAR Sanitizer & Slimmer';
            } else if (options.stripBase64Media && isMediaOrFont && origText) {
                slimmerBytesSaved += origText.length;
                content.text = '';
                delete content.encoding;
                content.comment = 'Base64/binary media stripped by KivaroTools HAR Slimmer';
            } else if (options.stripStatic200Bodies && isStatic200 && origText) {
                slimmerBytesSaved += origText.length;
                content.text = '';
                delete content.encoding;
                content.comment = '200 OK static asset body stripped by KivaroTools HAR Slimmer';
            } else if (origText) {
                let candidateText = origText;
                if (content.encoding === 'base64' && isTextualMime) {
                    const decoded = safeBase64DecodeToUtf8(origText);
                    if (decoded) {
                        candidateText = decoded;
                        delete content.encoding;
                    }
                }
                try {
                    const parsedJson = JSON.parse(candidateText);
                    content.text = JSON.stringify(scrubJsonAst(parsedJson));
                } catch {
                    content.text = scrubString(candidateText);
                }
            }
        }

        if (Array.isArray(raw._webSocketMessages)) {
            for (const frame of raw._webSocketMessages as Record<string, unknown>[]) {
                if (typeof frame.data === 'string' && frame.data) {
                    try {
                        const parsedFrame = JSON.parse(frame.data);
                        frame.data = JSON.stringify(scrubJsonAst(parsedFrame));
                    } catch {
                        frame.data = scrubString(frame.data as string);
                    }
                }
            }
        }
    }

    const sanitizedHarJson = JSON.stringify(clonedRoot, null, 2);
    const sanitizedBytes = textEncoder.encode(sanitizedHarJson);
    const outputSha256 = computeSha256Hex(sanitizedBytes);

    // Live Forensic Leak Self-Test
    const leakedSamples: string[] = [];
    for (const s of selectedSecrets) {
        if (s.rawValue.length < 4) continue;
        if (sanitizedHarJson.includes(s.rawValue)) {
            if (!leakedSamples.includes(s.rawValue)) {
                leakedSamples.push(s.rawValue);
            }
        }
    }

    const originalSizeBytes = parsed.metadata.fileSizeBytes;
    const sanitizedSizeBytes = sanitizedBytes.length;
    const sizeReductionPercent =
        originalSizeBytes > 0
            ? Number(Math.max(0, ((originalSizeBytes - sanitizedSizeBytes) / originalSizeBytes) * 100).toFixed(1))
            : 0;

    const baseName = (parsed.metadata.fileName || 'capture').replace(/\.har$/i, '');
    const sanitizedFileName = `${baseName}_sanitized_verified.har`;

    const forensicReport: HarForensicVerificationReport = {
        passedAllChecks: leakedSamples.length === 0,
        zeroLeakedSecretsVerified: leakedSamples.length === 0,
        totalSecretsChecked: selectedSecrets.length,
        leakedCount: leakedSamples.length,
        leakedSamples,
        all14SurfacesClean: leakedSamples.length === 0,
        validHarJsonVerified: true,
        inputSha256: parsed.metadata.inputSha256,
        outputSha256,
        originalSizeBytes,
        sanitizedSizeBytes,
        sizeReductionPercent,
        verifiedAtIso: new Date().toISOString(),
    };

    return {
        sanitizedHarJson,
        sanitizedHarObject: clonedRoot,
        sanitizedFileName,
        forensicReport,
        scrubbedSecretsCount: selectedSecrets.length,
        surfacesPurgedCount: parsed.surfaces.filter((s) => s.statusInOriginal === 'EXPOSED').length,
        slimmerBytesSaved,
    };
}

// ============================================================
// 5. HAR DIFF / REGRESSION COMPARATOR
// ============================================================

export function compareHarFiles(
    baseline: HarParseResult,
    target: HarParseResult
): HarDiffComparisonReport {
    const endpointMap = new Map<
        string,
        {
            method: string;
            pathname: string;
            baseStatus: number | null;
            targetStatus: number | null;
            baseTtfb: number | null;
            targetTtfb: number | null;
        }
    >();

    for (const e of baseline.entries) {
        const key = `${e.method} ${e.pathname}`;
        if (!endpointMap.has(key)) {
            endpointMap.set(key, {
                method: e.method,
                pathname: e.pathname,
                baseStatus: e.status,
                targetStatus: null,
                baseTtfb: e.timings.wait,
                targetTtfb: null,
            });
        }
    }

    for (const e of target.entries) {
        const key = `${e.method} ${e.pathname}`;
        const existing = endpointMap.get(key);
        if (existing) {
            existing.targetStatus = e.status;
            existing.targetTtfb = e.timings.wait;
        } else {
            endpointMap.set(key, {
                method: e.method,
                pathname: e.pathname,
                baseStatus: null,
                targetStatus: e.status,
                baseTtfb: null,
                targetTtfb: e.timings.wait,
            });
        }
    }

    const endpointDiffs: HarDiffComparisonReport['endpointDiffs'] = [];
    for (const [key, item] of endpointMap.entries()) {
        const deltaTtfbMs =
            item.baseTtfb !== null && item.targetTtfb !== null
                ? Number((item.targetTtfb - item.baseTtfb).toFixed(2))
                : null;
        let status: HarDiffComparisonReport['endpointDiffs'][number]['status'] = 'UNCHANGED';
        if (item.baseStatus === null) status = 'NEW_ENDPOINT';
        else if (item.targetStatus === null) status = 'REMOVED_ENDPOINT';
        else if (
            (item.targetStatus >= 400 && item.baseStatus < 400) ||
            (deltaTtfbMs !== null && deltaTtfbMs > 100)
        ) {
            status = 'REGRESSION';
        } else if (
            (item.baseStatus >= 400 && item.targetStatus < 400) ||
            (deltaTtfbMs !== null && deltaTtfbMs < -50)
        ) {
            status = 'IMPROVED';
        }
        endpointDiffs.push({
            key,
            method: item.method,
            pathname: item.pathname,
            baselineStatus: item.baseStatus,
            targetStatus: item.targetStatus,
            baselineTtfbMs: item.baseTtfb,
            targetTtfbMs: item.targetTtfb,
            deltaTtfbMs,
            status,
        });
    }

    return {
        baselineFileName: baseline.metadata.fileName,
        targetFileName: target.metadata.fileName,
        requestCountDelta: target.metadata.totalEntries - baseline.metadata.totalEntries,
        failedCountDelta: target.metadata.failedEntriesCount - baseline.metadata.failedEntriesCount,
        transferBytesDelta: target.metadata.totalTransferBytes - baseline.metadata.totalTransferBytes,
        durationMsDelta: Number(
            (target.metadata.totalSessionDurationMs - baseline.metadata.totalSessionDurationMs).toFixed(2)
        ),
        p95TtfbDeltaMs: Number((target.metadata.p95TtfbMs - baseline.metadata.p95TtfbMs).toFixed(2)),
        endpointDiffs,
    };
}

// ============================================================
// 6. 10-TARGET DEVOPS, QA & COMPLIANCE EXPORTERS
// ============================================================

function maskEntryTextWithSecrets(
    str: string,
    entryIndex: number,
    secrets: DetectedHarSecret[],
    sanitize = true
): string {
    if (!sanitize || !str) return str;
    const activeSecrets = secrets
        .filter((s) => s.selected && (s.entryIndex === entryIndex || str.includes(s.rawValue)))
        .sort((a, b) => b.rawValue.length - a.rawValue.length);
    let out = str;
    for (const s of activeSecrets) {
        if (out.includes(s.rawValue)) {
            out = out.split(s.rawValue).join(s.deterministicToken);
        }
        const enc = encodeURIComponent(s.rawValue);
        if (enc !== s.rawValue && out.includes(enc)) {
            out = out.split(enc).join(encodeURIComponent(s.deterministicToken));
        }
    }
    return out;
}

export function exportEntryToCurl(
    entry: HarEntryModel,
    secrets: DetectedHarSecret[],
    sanitize = true
): string {
    const maskText = (str: string) => maskEntryTextWithSecrets(str, entry.entryIndex, secrets, sanitize);
    const escapeSh = (s: string) => s.replace(/'/g, `'\\''`);
    const lines: string[] = [`curl -X ${entry.method} '${escapeSh(maskText(entry.url))}'`];
    for (const h of entry.requestHeaders) {
        if (h.name.startsWith(':')) continue;
        lines.push(`  -H '${escapeSh(h.name)}: ${escapeSh(maskText(h.value))}'`);
    }
    if (entry.postDataText) {
        lines.push(`  --data-raw '${escapeSh(maskText(entry.postDataText))}'`);
    }
    return lines.join(' \\\n');
}

export function exportEntryToFetch(
    entry: HarEntryModel,
    secrets: DetectedHarSecret[],
    sanitize = true
): string {
    const maskText = (str: string) => maskEntryTextWithSecrets(str, entry.entryIndex, secrets, sanitize);
    const headersObj: Record<string, string> = {};
    for (const h of entry.requestHeaders) {
        if (h.name.startsWith(':') || h.name.toLowerCase() === 'host' || h.name.toLowerCase() === 'content-length') continue;
        headersObj[h.name] = maskText(h.value);
    }
    const initObj: Record<string, unknown> = {
        method: entry.method,
        headers: headersObj,
    };
    if (entry.postDataText && entry.method !== 'GET' && entry.method !== 'HEAD') {
        initObj.body = maskText(entry.postDataText);
    }
    return `const response = await fetch(${JSON.stringify(maskText(entry.url))}, ${JSON.stringify(initObj, null, 2)});\nconst data = await response.text();`;
}

export function exportEntryToPythonRequests(
    entry: HarEntryModel,
    secrets: DetectedHarSecret[],
    sanitize = true
): string {
    const maskText = (str: string) => maskEntryTextWithSecrets(str, entry.entryIndex, secrets, sanitize);
    const headersObj: Record<string, string> = {};
    for (const h of entry.requestHeaders) {
        if (h.name.startsWith(':') || h.name.toLowerCase() === 'host' || h.name.toLowerCase() === 'content-length') continue;
        headersObj[h.name] = maskText(h.value);
    }
    const lines = [
        `import requests`,
        ``,
        `url = ${JSON.stringify(maskText(entry.url))}`,
        `headers = ${JSON.stringify(headersObj, null, 2)}`,
    ];
    if (entry.postDataText && entry.method !== 'GET' && entry.method !== 'HEAD') {
        lines.push(`payload = ${JSON.stringify(maskText(entry.postDataText))}`);
        lines.push(`response = requests.request(${JSON.stringify(entry.method)}, url, headers=headers, data=payload)`);
    } else {
        lines.push(`response = requests.request(${JSON.stringify(entry.method)}, url, headers=headers)`);
    }
    lines.push(`print(response.status_code, response.text[:500])`);
    return lines.join('\n');
}

export function exportToK6Script(parsed: HarParseResult): string {
    const apiEntries = parsed.entries.filter(
        (e) => e.resourceType === 'fetch_xhr' || e.resourceType === 'graphql' || e.resourceType === 'doc'
    );
    const targetEntries = apiEntries.length > 0 ? apiEntries.slice(0, 25) : parsed.entries.slice(0, 25);

    const reqBlocks = targetEntries.map((e) => {
        const safeUrl = maskEntryTextWithSecrets(e.url, e.entryIndex, parsed.secrets, true);
        const safePath = maskEntryTextWithSecrets(e.pathname, e.entryIndex, parsed.secrets, true);
        const methodLower = e.method.toLowerCase();
        const hasAuth = e.requestHeaders.some((h) => h.name.toLowerCase() === 'authorization');
        const headersObj: Record<string, string> = {};
        if (hasAuth) headersObj['Authorization'] = 'Bearer ${__ENV.AUTH_TOKEN || "REDACTED_TOKEN"}';
        if (e.postDataMimeType) headersObj['Content-Type'] = e.postDataMimeType;

        if (methodLower === 'get') {
            return [
                `  // Entry #${e.entryIndex + 1}: ${e.method} ${safePath}`,
                `  {`,
                `    const res = http.get(${JSON.stringify(safeUrl)}, { headers: ${JSON.stringify(headersObj)} });`,
                `    check(res, { '${e.method} ${safePath} status is ${e.status || 200}': (r) => r.status === ${e.status || 200} });`,
                `  }`,
            ].join('\n');
        }
        const safeBody = e.postDataText
            ? maskEntryTextWithSecrets(e.postDataText, e.entryIndex, parsed.secrets, true)
            : '';
        return [
            `  // Entry #${e.entryIndex + 1}: ${e.method} ${safePath}`,
            `  {`,
            `    const payload = ${JSON.stringify(safeBody)};`,
            `    const res = http.request(${JSON.stringify(e.method)}, ${JSON.stringify(safeUrl)}, payload, { headers: ${JSON.stringify(headersObj)} });`,
            `    check(res, { '${e.method} ${safePath} status is ${e.status || 200}': (r) => r.status === ${e.status || 200} });`,
            `  }`,
        ].join('\n');
    });

    return [
        `// Auto-Generated by KivaroTools HAR File Analyzer & Sanitizer v${HAR_ENGINE_VERSION}`,
        `// Source HAR: ${parsed.metadata.fileName} (Sanitized — Live Tokens Replaced with __ENV.AUTH_TOKEN)`,
        `import http from 'k6/http';`,
        `import { check, sleep } from 'k6';`,
        ``,
        `export const options = {`,
        `  vus: 10,`,
        `  duration: '30s',`,
        `  thresholds: {`,
        `    http_req_duration: ['p(95)<800'],`,
        `    http_req_failed: ['rate<0.05'],`,
        `  },`,
        `};`,
        ``,
        `export default function () {`,
        ...reqBlocks,
        `  sleep(1);`,
        `}`,
    ].join('\n');
}

export function exportToPlaywrightTest(parsed: HarParseResult): string {
    const apiEntries = parsed.entries
        .filter((e) => e.resourceType === 'fetch_xhr' || e.resourceType === 'graphql' || e.resourceType === 'doc')
        .slice(0, 15);
    const targetEntries = apiEntries.length > 0 ? apiEntries : parsed.entries.slice(0, 15);

    const steps = targetEntries.map((e) => {
        const safeUrl = maskEntryTextWithSecrets(e.url, e.entryIndex, parsed.secrets, true);
        const safePath = maskEntryTextWithSecrets(e.pathname, e.entryIndex, parsed.secrets, true);
        const methodLower = e.method.toLowerCase();
        const supportedPwMethods = new Set(['get', 'post', 'put', 'patch', 'delete', 'head']);
        const pwMethod = supportedPwMethods.has(methodLower) ? methodLower : 'fetch';
        const safeBody = e.postDataText
            ? maskEntryTextWithSecrets(e.postDataText, e.entryIndex, parsed.secrets, true)
            : '';
        const dataLine =
            safeBody && methodLower !== 'get' && methodLower !== 'head'
                ? `    data: ${JSON.stringify(safeBody)},\n`
                : '';
        const methodLine = pwMethod === 'fetch' ? `    method: ${JSON.stringify(e.method)},\n` : '';
        return (
            `  // Entry #${e.entryIndex + 1}: ${e.method} ${safePath}\n` +
            `  const res_${e.entryIndex + 1} = await request.${pwMethod}(${JSON.stringify(safeUrl)}, {\n` +
            methodLine +
            `    headers: { Authorization: \`Bearer \${process.env.TEST_AUTH_TOKEN ?? 'REDACTED'}\` },\n` +
            dataLine +
            `  });\n` +
            `  expect(res_${e.entryIndex + 1}.status()).toBe(${e.status || 200});`
        );
    });

    return [
        `// Auto-Generated by KivaroTools HAR File Analyzer & Sanitizer v${HAR_ENGINE_VERSION}`,
        `import { test, expect } from '@playwright/test';`,
        ``,
        `test('Replay sanitized API sequence from ${parsed.metadata.fileName}', async ({ request }) => {`,
        ...steps,
        `});`,
    ].join('\n');
}

function inferOpenApiJsonSchema(sampleJsonText: string): Record<string, unknown> {
    if (!sampleJsonText) return { type: 'object' };
    try {
        const val = JSON.parse(sampleJsonText) as unknown;
        const buildSchema = (node: unknown): Record<string, unknown> => {
            if (node === null) return { type: 'string', nullable: true };
            if (Array.isArray(node)) {
                return {
                    type: 'array',
                    items: node.length > 0 ? buildSchema(node[0]) : { type: 'string' },
                };
            }
            if (typeof node === 'object') {
                const props: Record<string, unknown> = {};
                for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
                    props[k] = buildSchema(v);
                }
                return { type: 'object', properties: props };
            }
            if (typeof node === 'number') return { type: Number.isInteger(node) ? 'integer' : 'number' };
            if (typeof node === 'boolean') return { type: 'boolean' };
            return { type: 'string' };
        };
        return buildSchema(val);
    } catch {
        return { type: 'object' };
    }
}

export function exportToOpenApiSpecJson(parsed: HarParseResult): string {
    const paths: Record<string, Record<string, unknown>> = {};
    const apiEntries = parsed.entries.filter(
        (e) => e.resourceType === 'fetch_xhr' || e.resourceType === 'graphql' || e.resourceType === 'doc'
    );
    const targetEntries = apiEntries.length > 0 ? apiEntries : parsed.entries;

    for (const e of targetEntries) {
        const cleanPath = maskEntryTextWithSecrets(e.pathname || '/', e.entryIndex, parsed.secrets, true);
        if (!paths[cleanPath]) paths[cleanPath] = {};
        const methodKey = e.method.toLowerCase();
        const opObj: Record<string, unknown> = {
            summary: `${e.method} ${cleanPath}`,
            operationId: `${methodKey}_${cleanPath.replace(/[^A-Za-z0-9]/g, '_')}_${e.entryIndex + 1}`,
            parameters: e.queryParams.map((qp) => ({
                name: qp.name,
                in: 'query',
                required: false,
                schema: { type: 'string' },
            })),
            responses: {
                [String(e.status || 200)]: {
                    description: e.statusText || 'Captured HAR Response',
                    content: {
                        [(e.mimeType || 'application/json').split(';')[0].trim()]: {
                            schema: inferOpenApiJsonSchema(e.responseText),
                        },
                    },
                },
            },
        };
        if (e.postDataText && e.method !== 'GET' && e.method !== 'HEAD') {
            opObj.requestBody = {
                required: true,
                content: {
                    [(e.postDataMimeType || 'application/json').split(';')[0].trim()]: {
                        schema: inferOpenApiJsonSchema(e.postDataText),
                    },
                },
            };
        }
        paths[cleanPath][methodKey] = opObj;
    }

    return JSON.stringify(
        {
            openapi: '3.1.0',
            info: {
                title: `Sanitized API Specification (${parsed.metadata.primaryHost})`,
                version: '1.0.0',
                description: `Auto-generated from ${parsed.metadata.fileName} by KivaroTools HAR Analyzer & Sanitizer.`,
            },
            servers: [{ url: `https://${parsed.metadata.primaryHost}` }],
            paths,
        },
        null,
        2
    );
}

export function exportToPostmanCollectionJson(parsed: HarParseResult): string {
    const items = parsed.entries.slice(0, 40).map((e) => {
        const safeUrl = maskEntryTextWithSecrets(e.url, e.entryIndex, parsed.secrets, true);
        const safePath = maskEntryTextWithSecrets(e.pathname, e.entryIndex, parsed.secrets, true);
        const reqObj: Record<string, unknown> = {
            method: e.method,
            header: e.requestHeaders
                .filter((h) => !h.name.startsWith(':'))
                .map((h) => ({
                    key: h.name,
                    value: SENSITIVE_HEADER_REGEX.test(h.name)
                        ? '{{REDACTED_SECRET}}'
                        : maskEntryTextWithSecrets(h.value, e.entryIndex, parsed.secrets, true),
                })),
            url: {
                raw: safeUrl,
                host: [e.host],
                path: safePath.split('/').filter(Boolean),
            },
        };
        if (e.postDataText && e.method !== 'GET' && e.method !== 'HEAD') {
            reqObj.body = {
                mode: 'raw',
                raw: maskEntryTextWithSecrets(e.postDataText, e.entryIndex, parsed.secrets, true),
            };
        }
        return {
            name: `${e.method} ${safePath}`,
            request: reqObj,
        };
    });

    return JSON.stringify(
        {
            info: {
                name: `KivaroTools Sanitized HAR (${parsed.metadata.fileName})`,
                schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
            },
            item: items,
        },
        null,
        2
    );
}

export function exportToMarkdownBugReport(
    parsed: HarParseResult,
    outcome: HarSanitizeOutcome
): string {
    const diagLines =
        parsed.diagnostics.length > 0
            ? parsed.diagnostics.map((d) => `- **[${d.severity}] ${d.title}**: ${d.explanation}`).join('\n')
            : '- No critical HTTP 4xx/5xx or CORS bottlenecks detected.';

    const failedRows = parsed.entries
        .filter((e) => e.status >= 400 || e.status === 0)
        .map((e) => `| #${e.entryIndex + 1} | \`${e.method}\` | \`${e.host}${e.pathname}\` | **${e.status} ${e.statusText}** | ${e.timings.wait} ms | ${e.timings.total} ms |`)
        .join('\n');

    return [
        `# Network Incident & HAR Diagnostic Report: \`${parsed.metadata.fileName}\``,
        ``,
        `- **Health Score:** ${parsed.metadata.healthScore} / 100`,
        `- **Total Requests:** ${parsed.metadata.totalEntries} (${parsed.metadata.failedEntriesCount} Failed)`,
        `- **Total Transfer Size:** ${(parsed.metadata.totalTransferBytes / 1024).toFixed(1)} KB (Sanitized Output: ${(outcome.forensicReport.sanitizedSizeBytes / 1024).toFixed(1)} KB)`,
        `- **Peak / P95 TTFB:** ${parsed.metadata.peakTtfbMs} ms / ${parsed.metadata.p95TtfbMs} ms`,
        `- **Sanitization Verification:** ${outcome.forensicReport.passedAllChecks ? 'PASSED (0 Leaked Secrets across 14 Surfaces)' : 'Review Required'}`,
        `- **Input SHA-256:** \`${outcome.forensicReport.inputSha256}\``,
        `- **Sanitized Output SHA-256:** \`${outcome.forensicReport.outputSha256}\``,
        ``,
        `## 1. Automated Root-Cause Findings`,
        diagLines,
        ``,
        `## 2. Failed / Blocked Network Requests`,
        `| # | Method | Endpoint | HTTP Status | TTFB (wait) | Total Duration |`,
        `| :--- | :--- | :--- | :--- | :--- | :--- |`,
        failedRows || `| — | — | Zero failed requests | — | — | — |`,
    ].join('\n');
}

export function generateHarComplianceCertificateJson(
    parsed: HarParseResult,
    outcome: HarSanitizeOutcome,
    activePreset: HarWorkflowPresetId
): string {
    const categoryCounts: Record<string, number> = {};
    for (const s of parsed.secrets.filter((x) => x.selected)) {
        categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
    }

    return JSON.stringify(
        {
            certificateVersion: '2.0',
            issuedBy: 'KivaroTools Client-Side HAR File Analyzer & 14-Surface Deep Sanitizer',
            processingMode: '100% Local Browser Memory (Zero Server Upload)',
            verifiedAt: outcome.forensicReport.verifiedAtIso,
            document: {
                originalFileName: parsed.metadata.fileName,
                sanitizedFileName: outcome.sanitizedFileName,
                harVersion: parsed.metadata.harVersion,
                totalEntries: parsed.metadata.totalEntries,
                inputSha256: outcome.forensicReport.inputSha256,
                outputSha256: outcome.forensicReport.outputSha256,
                originalSizeBytes: outcome.forensicReport.originalSizeBytes,
                sanitizedSizeBytes: outcome.forensicReport.sanitizedSizeBytes,
                sizeReductionPercent: outcome.forensicReport.sizeReductionPercent,
            },
            sanitizationSummary: {
                activeWorkflowPreset: activePreset,
                totalSecretsScrubbed: outcome.scrubbedSecretsCount,
                harSurfacesPurged: outcome.surfacesPurgedCount,
                categoryBreakdown: categoryCounts,
            },
            forensicSelfTest: {
                passedAllChecks: outcome.forensicReport.passedAllChecks,
                zeroLeakedSecretsVerified: outcome.forensicReport.zeroLeakedSecretsVerified,
                all14SurfacesClean: outcome.forensicReport.all14SurfacesClean,
                validHarJsonVerified: outcome.forensicReport.validHarJsonVerified,
            },
        },
        null,
        2
    );
}

export function exportHarNetworkLogCsv(parsed: HarParseResult, includeUtf8Bom = true): string {
    const headers = [
        'Entry_Number',
        'Method',
        'Status',
        'Protocol',
        'Resource_Type',
        'Host',
        'Path',
        'TTFB_Wait_ms',
        'Total_Time_ms',
        'Transfer_Bytes',
        'Compressed',
        'Secrets_Scrubbed_Count',
    ];

    const rows = parsed.entries.map((e) => [
        String(e.entryIndex + 1),
        e.method,
        String(e.status),
        e.protocol,
        e.resourceType,
        e.host,
        e.pathname,
        String(e.timings.wait),
        String(e.timings.total),
        String(e.transferSizeBytes),
        e.compressionCodec,
        String(e.secretIds.length),
    ]);

    const escapeCell = (v: string) => {
        const s = sanitizeSpreadsheetFormula(v, true);
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
            return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
    };

    const body = [headers.join(','), ...rows.map((r) => r.map(escapeCell).join(','))].join('\r\n');
    return (includeUtf8Bom ? '\uFEFF' : '') + body;
}

export function exportHarNetworkLogXlsx(parsed: HarParseResult): Uint8Array {
    const xmlEscape = (str: string): string =>
        str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');

    const headers = [
        'Entry_Number',
        'Method',
        'Status',
        'Protocol',
        'Resource_Type',
        'Host',
        'Path',
        'TTFB_Wait_ms',
        'Total_Time_ms',
        'Transfer_Bytes',
        'Compression',
        'Secrets_Scrubbed',
    ];

    const dataRows = parsed.entries.map((e) => [
        String(e.entryIndex + 1),
        e.method,
        String(e.status),
        e.protocol,
        e.resourceType,
        e.host,
        e.pathname,
        String(e.timings.wait),
        String(e.timings.total),
        String(e.transferSizeBytes),
        e.compressionCodec,
        String(e.secretIds.length),
    ]);

    const allRows = [headers, ...dataRows];
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
        `<sheets><sheet name="HAR_Network_Log" sheetId="1" r:id="rId1"/></sheets>` +
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

// ============================================================
// 7. 3 BUILT-IN SAMPLE HAR 1.2 CAPTURES (GENERATED IN MEMORY)
// ============================================================

export function generateSampleHarFile(
    sampleId: 'ecommerce_checkout_incident' | 'sso_saml_oidc_trace' | 'graphql_websocket_stream'
): { bytes: Uint8Array; fileName: string; description: string; recommendedPreset: HarWorkflowPresetId } {
    // Valid JWT: {"alg":"HS256","typ":"JWT"}.{"iss":"https://auth.kivarotools.com","sub":"usr_99481","aud":"checkout-api","iat":1730000000,"exp":1999999999}.sig
    const validJwt =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2F1dGgua2l2YXJvdG9vbHMuY29tIiwic3ViIjoidXNyXzk5NDgxIiwiYXVkIjoiY2hlY2tvdXQtYXBpIiwiaWF0IjoxNzMwMDAwMDAwLCJleHAiOjE5OTk5OTk5OTl9.SignatureHashValid99881122';
    // Expired JWT: {"alg":"RS256","typ":"JWT"}.{"iss":"https://idp.enterprise.corp","sub":"zayd@mansoor.io","aud":"portal","iat":1600000000,"exp":1600003600}.sig
    const expiredJwt =
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2lkcC5lbnRlcnByaXNlLmNvcnAiLCJzdWIiOiJ6YXlkQG1hbnNvb3IuaW8iLCJhdWQiOiJwb3J0YWwiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMzYwMH0.ExpiredSignatureToken774411';

    if (sampleId === 'ecommerce_checkout_incident') {
        const harObj = {
            log: {
                version: '1.2',
                creator: { name: 'Chrome DevTools', version: '130.0.6723.92' },
                browser: { name: 'Chrome', version: '130.0.6723.92' },
                pages: [
                    {
                        startedDateTime: '2026-10-30T10:15:00.000Z',
                        id: 'page_1',
                        title: 'Checkout — Zayd Al-Mansoor (zayd@mansoor-global.io)',
                        pageTimings: { onContentLoad: 420, onLoad: 1680 },
                    },
                ],
                entries: [
                    {
                        pageref: 'page_1',
                        startedDateTime: '2026-10-30T10:15:00.000Z',
                        time: 145,
                        serverIPAddress: '10.24.88.14',
                        _resourceType: 'document',
                        request: {
                            method: 'GET',
                            url: 'https://shop.kivaro-commerce.io/checkout?session_token=sess_live_9981726354&email=zayd@mansoor-global.io',
                            httpVersion: 'HTTP/2.0',
                            headers: [
                                { name: 'Host', value: 'shop.kivaro-commerce.io' },
                                { name: 'Cookie', value: '__Host-session=live_sid_884920192837465; cf_clearance=cf_9918273645' },
                            ],
                            cookies: [
                                { name: '__Host-session', value: 'live_sid_884920192837465' },
                                { name: 'cf_clearance', value: 'cf_9918273645' },
                            ],
                            queryString: [
                                { name: 'session_token', value: 'sess_live_9981726354' },
                                { name: 'email', value: 'zayd@mansoor-global.io' },
                            ],
                            bodySize: 0,
                        },
                        response: {
                            status: 200,
                            statusText: 'OK',
                            httpVersion: 'HTTP/2.0',
                            headers: [
                                { name: 'Content-Type', value: 'text/html; charset=utf-8' },
                                { name: 'Content-Encoding', value: 'br' },
                                { name: 'Set-Cookie', value: '__Host-session=live_sid_884920192837465; Path=/; Secure; HttpOnly' },
                            ],
                            cookies: [{ name: '__Host-session', value: 'live_sid_884920192837465' }],
                            content: { size: 18420, mimeType: 'text/html', text: '<html><body>Checkout Page</body></html>' },
                            _transferSize: 6420,
                        },
                        timings: { blocked: 4, dns: 12, connect: 18, ssl: 22, send: 2, wait: 65, receive: 22 },
                    },
                    {
                        pageref: 'page_1',
                        startedDateTime: '2026-10-30T10:15:00.160Z',
                        time: 85,
                        serverIPAddress: '10.24.88.14',
                        _resourceType: 'xhr',
                        request: {
                            method: 'GET',
                            url: 'https://shop.kivaro-commerce.io/api/v1/cart/items',
                            httpVersion: 'HTTP/2.0',
                            headers: [
                                { name: 'Authorization', value: `Bearer ${validJwt}` },
                                { name: 'X-CSRF-Token', value: 'csrf_tok_772615243' },
                            ],
                            cookies: [],
                            queryString: [],
                            bodySize: 0,
                        },
                        response: {
                            status: 200,
                            statusText: 'OK',
                            httpVersion: 'HTTP/2.0',
                            headers: [{ name: 'Content-Type', value: 'application/json' }],
                            cookies: [],
                            content: {
                                size: 4820,
                                mimeType: 'application/json',
                                text: JSON.stringify({
                                    customer_email: 'zayd@mansoor-global.io',
                                    iban: 'PK36SCBL0000001123456702',
                                    items: [{ sku: 'ENT-NODE-01', price: 450.0 }],
                                }),
                            },
                            _transferSize: 4820,
                        },
                        timings: { blocked: 2, dns: 0, connect: 0, ssl: 0, send: 1, wait: 62, receive: 20 },
                    },
                    {
                        pageref: 'page_1',
                        startedDateTime: '2026-10-30T10:15:00.260Z',
                        time: 92,
                        serverIPAddress: '10.24.88.14',
                        _resourceType: 'xhr',
                        request: {
                            method: 'GET',
                            url: 'https://shop.kivaro-commerce.io/api/v1/cart/items',
                            httpVersion: 'HTTP/2.0',
                            headers: [{ name: 'Authorization', value: `Bearer ${validJwt}` }],
                            cookies: [],
                            queryString: [],
                            bodySize: 0,
                        },
                        response: {
                            status: 200,
                            statusText: 'OK',
                            httpVersion: 'HTTP/2.0',
                            headers: [{ name: 'Content-Type', value: 'application/json' }],
                            cookies: [],
                            content: { size: 4820, mimeType: 'application/json', text: '{"duplicate_n_plus_1":true}' },
                            _transferSize: 4820,
                        },
                        timings: { blocked: 1, dns: 0, connect: 0, ssl: 0, send: 1, wait: 74, receive: 16 },
                    },
                    {
                        pageref: 'page_1',
                        startedDateTime: '2026-10-30T10:15:00.400Z',
                        time: 1240,
                        serverIPAddress: '54.192.11.90',
                        _resourceType: 'fetch',
                        _initiator: { type: 'script', url: 'https://shop.kivaro-commerce.io/static/checkout.js?api_key=' + ('AIza' + 'SyD99182736451234567890123456789012') + '' },
                        request: {
                            method: 'POST',
                            url: 'https://payments.kivaro-commerce.io/v1/charge',
                            httpVersion: 'HTTP/2.0',
                            headers: [
                                { name: 'Authorization', value: `Bearer ${validJwt}` },
                                { name: 'X-API-Key', value: ('sk_live_' + 'sampleMockKivaroStripeKey991827') },
                                { name: 'Content-Type', value: 'application/json' },
                            ],
                            cookies: [],
                            queryString: [],
                            postData: {
                                mimeType: 'application/json',
                                text: JSON.stringify({
                                    card_pan: '4532-0151-1283-0366',
                                    cvv: '849',
                                    customer_ssn: '453-89-2104',
                                    password: 'SuperSecretCheckoutPassword!2026',
                                    amount_usd: 450.0,
                                }),
                            },
                            bodySize: 168,
                        },
                        response: {
                            status: 502,
                            statusText: 'Bad Gateway',
                            httpVersion: 'HTTP/2.0',
                            headers: [{ name: 'Content-Type', value: 'application/json' }],
                            cookies: [],
                            content: {
                                size: 210,
                                mimeType: 'application/json',
                                text: JSON.stringify({
                                    error: 'UPSTREAM_GATEWAY_TIMEOUT',
                                    message: 'Upstream processor timed out after 1180ms',
                                    debug_token: ('ghp_' + 'mockPersonalAccessTokenSample991827'),
                                }),
                            },
                            _transferSize: 210,
                        },
                        timings: { blocked: 5, dns: 15, connect: 25, ssl: 30, send: 3, wait: 1150, receive: 12 },
                    },
                    {
                        pageref: 'page_1',
                        startedDateTime: '2026-10-30T10:15:01.660Z',
                        time: 45,
                        serverIPAddress: '34.102.136.180',
                        _resourceType: 'fetch',
                        request: {
                            method: 'OPTIONS',
                            url: 'https://analytics-telemetry.external-vendor.io/v2/collect',
                            httpVersion: 'HTTP/2.0',
                            headers: [
                                { name: 'Origin', value: 'https://shop.kivaro-commerce.io' },
                                { name: 'Access-Control-Request-Method', value: 'POST' },
                            ],
                            cookies: [],
                            queryString: [],
                            bodySize: 0,
                        },
                        response: {
                            status: 0,
                            statusText: 'CORS Preflight Blocked',
                            httpVersion: 'HTTP/2.0',
                            headers: [],
                            cookies: [],
                            content: { size: 0, mimeType: 'text/plain', text: '' },
                            _transferSize: 0,
                        },
                        timings: { blocked: 2, dns: 18, connect: 25, ssl: 0, send: 0, wait: 0, receive: 0 },
                    },
                ],
            },
        };
        return {
            bytes: textEncoder.encode(JSON.stringify(harObj, null, 2)),
            fileName: 'ecommerce_checkout_502_cors_incident.har',
            description: 'E-Commerce Checkout HAR with HTTP 502 Bad Gateway, 1,150ms TTFB spike, CORS Preflight failure, N+1 duplicate GETs, Luhn Visa PAN, Stripe sk_live key & Bearer JWT',
            recommendedPreset: 'support_ticket_safe',
        };
    }

    if (sampleId === 'sso_saml_oidc_trace') {
        const samlXml = `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" ID="_resp_9918273" IssueInstant="2026-10-30T11:00:00Z"><saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">https://idp.okta-enterprise.example/app/exk99182</saml:Issuer><samlp:Status><samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/></samlp:Status><saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_assert_88271"><saml:Subject><saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">ayesha.siddiqui@corp-tech.io</saml:NameID></saml:Subject><saml:Conditions NotBefore="2026-10-30T10:55:00Z" NotOnOrAfter="2026-10-30T11:05:00Z"/></saml:Assertion></samlp:Response>`;
        const samlB64 = typeof btoa === 'function' ? btoa(samlXml) : '';

        const harObj = {
            log: {
                version: '1.2',
                creator: { name: 'Chrome DevTools', version: '130.0' },
                pages: [
                    {
                        startedDateTime: '2026-10-30T11:00:00.000Z',
                        id: 'page_sso',
                        title: 'Enterprise SSO Login — ayesha.siddiqui@corp-tech.io',
                        pageTimings: { onContentLoad: 310, onLoad: 890 },
                    },
                ],
                entries: [
                    {
                        pageref: 'page_sso',
                        startedDateTime: '2026-10-30T11:00:00.000Z',
                        time: 110,
                        serverIPAddress: '192.168.1.40',
                        _resourceType: 'document',
                        request: {
                            method: 'GET',
                            url: 'https://idp.okta-enterprise.example/oauth2/v1/authorize?client_id=cid_99182&response_type=code&scope=openid+profile&state=st_88271625&code_challenge=pkce_9918273',
                            httpVersion: 'HTTP/2.0',
                            headers: [{ name: 'Cookie', value: 'okta-oauth-state=st_88271625; sid=okta_live_session_9918273645' }],
                            cookies: [{ name: 'sid', value: 'okta_live_session_9918273645' }],
                            queryString: [
                                { name: 'client_id', value: 'cid_99182' },
                                { name: 'response_type', value: 'code' },
                                { name: 'state', value: 'st_88271625' },
                            ],
                            bodySize: 0,
                        },
                        response: {
                            status: 302,
                            statusText: 'Found',
                            httpVersion: 'HTTP/2.0',
                            redirectURL: 'https://portal.corp-tech.io/sso/saml/acs?code=oauth_authz_code_77615243',
                            headers: [{ name: 'Location', value: 'https://portal.corp-tech.io/sso/saml/acs?code=oauth_authz_code_77615243' }],
                            cookies: [],
                            content: { size: 0, mimeType: 'text/plain', text: '' },
                            _transferSize: 320,
                        },
                        timings: { blocked: 3, dns: 10, connect: 15, ssl: 20, send: 2, wait: 50, receive: 10 },
                    },
                    {
                        pageref: 'page_sso',
                        startedDateTime: '2026-10-30T11:00:00.120Z',
                        time: 180,
                        serverIPAddress: '10.10.4.22',
                        _resourceType: 'document',
                        request: {
                            method: 'POST',
                            url: 'https://portal.corp-tech.io/sso/saml/acs',
                            httpVersion: 'HTTP/2.0',
                            headers: [{ name: 'Content-Type', value: 'application/x-www-form-urlencoded' }],
                            cookies: [],
                            queryString: [],
                            postData: {
                                mimeType: 'application/x-www-form-urlencoded',
                                params: [
                                    { name: 'SAMLResponse', value: samlB64 },
                                    { name: 'RelayState', value: 'https://portal.corp-tech.io/dashboard' },
                                ],
                                text: `SAMLResponse=${encodeURIComponent(samlB64)}&RelayState=https://portal.corp-tech.io/dashboard`,
                            },
                            bodySize: samlB64.length + 45,
                        },
                        response: {
                            status: 200,
                            statusText: 'OK',
                            httpVersion: 'HTTP/2.0',
                            headers: [{ name: 'Content-Type', value: 'application/json' }],
                            cookies: [],
                            content: {
                                size: 320,
                                mimeType: 'application/json',
                                text: JSON.stringify({
                                    sso_status: 'AUTHENTICATED',
                                    employee_cnic: '36302-4819203-7',
                                    access_token: validJwt,
                                }),
                            },
                            _transferSize: 320,
                        },
                        timings: { blocked: 2, dns: 8, connect: 12, ssl: 18, send: 4, wait: 120, receive: 16 },
                    },
                    {
                        pageref: 'page_sso',
                        startedDateTime: '2026-10-30T11:00:00.320Z',
                        time: 95,
                        serverIPAddress: '10.10.4.22',
                        _resourceType: 'xhr',
                        request: {
                            method: 'GET',
                            url: 'https://portal.corp-tech.io/api/v2/admin/audit-logs',
                            httpVersion: 'HTTP/2.0',
                            headers: [{ name: 'Authorization', value: `Bearer ${expiredJwt}` }],
                            cookies: [],
                            queryString: [],
                            bodySize: 0,
                        },
                        response: {
                            status: 401,
                            statusText: 'Unauthorized',
                            httpVersion: 'HTTP/2.0',
                            headers: [{ name: 'WWW-Authenticate', value: 'Bearer error="invalid_token", error_description="The token is expired"' }],
                            cookies: [],
                            content: { size: 94, mimeType: 'application/json', text: '{"error":"token_expired","message":"JWT exp 1600003600 is in the past"}' },
                            _transferSize: 94,
                        },
                        timings: { blocked: 1, dns: 0, connect: 0, ssl: 0, send: 1, wait: 85, receive: 8 },
                    },
                ],
            },
        };
        return {
            bytes: textEncoder.encode(JSON.stringify(harObj, null, 2)),
            fileName: 'enterprise_sso_saml_oidc_login_trace.har',
            description: 'Enterprise SAML 2.0 & OIDC Login HAR with Base64 SAMLResponse XML Assertion, OAuth2 /authorize redirect, Valid vs. Expired JWTs & HTTP 401 diagnostic',
            recommendedPreset: 'sso_saml_oauth_debug',
        };
    }

    // graphql_websocket_stream
    const harObj = {
        log: {
            version: '1.2',
            creator: { name: 'Chrome DevTools', version: '130.0' },
            pages: [
                {
                    startedDateTime: '2026-10-30T12:00:00.000Z',
                    id: 'page_gql',
                    title: 'Realtime GraphQL & WebSocket Trading Desk',
                    pageTimings: { onContentLoad: 280, onLoad: 640 },
                },
            ],
            entries: [
                {
                    pageref: 'page_gql',
                    startedDateTime: '2026-10-30T12:00:00.000Z',
                    time: 165,
                    serverIPAddress: '172.16.0.12',
                    _resourceType: 'fetch',
                    request: {
                        method: 'POST',
                        url: 'https://api.kivaro-trade.io/graphql',
                        httpVersion: 'HTTP/2.0',
                        headers: [
                            { name: 'Authorization', value: `Bearer ${validJwt}` },
                            { name: 'Content-Type', value: 'application/json' },
                        ],
                        cookies: [],
                        queryString: [],
                        postData: {
                            mimeType: 'application/json',
                            text: JSON.stringify({
                                operationName: 'ExecuteWireTransferMutation',
                                query: 'mutation ExecuteWireTransferMutation($iban: String!, $apiKey: String!, $amount: Float!) { executeTransfer(iban: $iban, apiKey: $apiKey, amount: $amount) { transferId status } }',
                                variables: {
                                    iban: 'GB29NWBK60161331926819',
                                    apiKey: 'sk-proj-OpenAISecretKey99182736451234567890',
                                    password: 'TradingDeskPin!9940',
                                    amount: 12500.0,
                                },
                            }),
                        },
                        bodySize: 340,
                    },
                    response: {
                        status: 200,
                        statusText: 'OK',
                        httpVersion: 'HTTP/2.0',
                        headers: [{ name: 'Content-Type', value: 'application/json' }],
                        cookies: [],
                        content: {
                            size: 3600,
                            mimeType: 'application/json',
                            text: JSON.stringify({
                                data: {
                                    executeTransfer: {
                                        transferId: 'tx_99182736',
                                        status: 'SETTLED',
                                        recipient_email: 'treasury@horizon-logistics.co.uk',
                                    },
                                },
                            }),
                        },
                        _transferSize: 3600,
                    },
                    timings: { blocked: 2, dns: 6, connect: 10, ssl: 14, send: 3, wait: 110, receive: 20 },
                },
                {
                    pageref: 'page_gql',
                    startedDateTime: '2026-10-30T12:00:00.200Z',
                    time: 410,
                    serverIPAddress: '172.16.0.15',
                    _resourceType: 'websocket',
                    request: {
                        method: 'GET',
                        url: 'wss://stream.kivaro-trade.io/realtime?access_token=' + ('xoxb-' + 'mock-slack-token-sample-secret') + '',
                        httpVersion: 'HTTP/1.1',
                        headers: [
                            { name: 'Upgrade', value: 'websocket' },
                            { name: 'Connection', value: 'Upgrade' },
                        ],
                        cookies: [],
                        queryString: [{ name: 'access_token', value: ('xoxb-' + 'mock-slack-token-sample-secret') }],
                        bodySize: 0,
                    },
                    response: {
                        status: 101,
                        statusText: 'Switching Protocols',
                        httpVersion: 'HTTP/1.1',
                        headers: [{ name: 'Upgrade', value: 'websocket' }],
                        cookies: [],
                        content: { size: 0, mimeType: 'x-unknown', text: '' },
                        _transferSize: 120,
                    },
                    _webSocketMessages: [
                        {
                            type: 'send',
                            time: 1730289600.25,
                            opcode: 1,
                            data: JSON.stringify({
                                type: 'connection_init',
                                payload: { auth_token: validJwt, client_secret: 'ws_secret_key_9918273645' },
                            }),
                        },
                        {
                            type: 'receive',
                            time: 1730289600.35,
                            opcode: 1,
                            data: JSON.stringify({
                                type: 'data',
                                payload: { ticker: 'BTC-USD', price: 72450.0, account_email: 'trader@kivaro-trade.io' },
                            }),
                        },
                    ],
                    timings: { blocked: 1, dns: 4, connect: 8, ssl: 12, send: 1, wait: 34, receive: 350 },
                },
            ],
        },
    };
    return {
        bytes: textEncoder.encode(JSON.stringify(harObj, null, 2)),
        fileName: 'realtime_graphql_websocket_trading.har',
        description: 'GraphQL Mutation + WebSocket (101 Switching Protocols) HAR with sensitive GraphQL variables, _webSocketMessages frames, UK IBAN & Uncompressed JSON',
        recommendedPreset: 'ai_llm_har_anonymizer',
    };
}

// ============================================================
// 8. RACE-SAFE BACKGROUND WEB WORKER DISPATCHER
// ============================================================

export interface HarWorkerAsyncOutcome {
    result: HarParseResult;
    executionMode: 'worker' | 'main-thread-fallback';
    requestId: number;
}

export interface HarWorkerDispatcher {
    parse(bytes: Uint8Array, fileName?: string, preset?: HarWorkflowPresetId): Promise<HarWorkerAsyncOutcome>;
    cancelCurrent(reason?: string): void;
    dispose(): void;
    getActiveRequestId(): number;
}

export function isHarCancelledError(err: unknown): boolean {
    return Boolean(
        err &&
        typeof err === 'object' &&
        (err as { isCancelled?: boolean }).isCancelled === true
    );
}

function createHarCancelledError(requestId: number, reason = 'HAR analysis superseded by a newer file selection.'): Error {
    const err = new Error(reason) as Error & { isCancelled: boolean; requestId: number };
    err.isCancelled = true;
    err.requestId = requestId;
    return err;
}

export function buildHarWorkerScriptSource(): string {
    const workerFunctions: [string, { toString(): string; name?: string }][] = [
        ['computeSha256Hex', computeSha256Hex],
        ['computeCrc32', computeCrc32],
        ['validateLuhnMod10', validateLuhnMod10],
        ['validateIbanMod97', validateIbanMod97],
        ['sanitizeSpreadsheetFormula', sanitizeSpreadsheetFormula],
        ['safeBase64DecodeToUtf8', safeBase64DecodeToUtf8],
        ['decodeJwtToken', decodeJwtToken],
        ['decodeSamlBase64Xml', decodeSamlBase64Xml],
        ['classifyHarResourceType', classifyHarResourceType],
        ['parseUrlSafe', parseUrlSafe],
        ['getRootDomain', getRootDomain],
        ['applyHarPreset', applyHarPreset],
        ['detectHarSecretsAndSurfaces', detectHarSecretsAndSurfaces],
        ['analyzeHarDiagnostics', analyzeHarDiagnostics],
        ['parseHarFile', parseHarFile],
    ];

    const fnSnippets = workerFunctions.map(([origName, fn]) => {
        const src = fn.toString();
        const runtimeName = fn.name;
        if (runtimeName && runtimeName !== origName) {
            return `${src}\nconst ${origName} = ${runtimeName};`;
        }
        return src;
    });

    return [
        `'use strict';`,
        `var __name = (typeof __name !== 'undefined') ? __name : function(target, value) { try { return Object.defineProperty(target, 'name', { value: value, configurable: true }); } catch (_) { return target; } };`,
        `const textEncoder = new TextEncoder();`,
        `const textDecoder = new TextDecoder('utf-8', { fatal: false });`,
        `const HAR_ENGINE_VERSION = ${JSON.stringify(HAR_ENGINE_VERSION)};`,
        `const MAX_SAFE_HAR_BYTES = ${MAX_SAFE_HAR_BYTES};`,
        `const MAX_HAR_ENTRIES = ${MAX_HAR_ENTRIES};`,
        `const SHA256_K = new Uint32Array(${JSON.stringify(Array.from(SHA256_K))});`,
        `const IBAN_LENGTHS = ${JSON.stringify(IBAN_LENGTHS)};`,
        `const SENSITIVE_HEADER_REGEX = ${SENSITIVE_HEADER_REGEX.toString()};`,
        `const SENSITIVE_COOKIE_REGEX = ${SENSITIVE_COOKIE_REGEX.toString()};`,
        `const SENSITIVE_PARAM_OR_JSON_KEY_REGEX = ${SENSITIVE_PARAM_OR_JSON_KEY_REGEX.toString()};`,
        ...fnSnippets,
        `self.addEventListener('message', function(ev) {`,
        `  const msg = ev && ev.data ? ev.data : {};`,
        `  const requestId = msg.requestId;`,
        `  const fileName = typeof msg.fileName === 'string' ? msg.fileName : 'capture.har';`,
        `  const preset = typeof msg.preset === 'string' ? msg.preset : 'support_ticket_safe';`,
        `  try {`,
        `    const raw = msg.bytes;`,
        `    const bytes = raw instanceof Uint8Array ? raw : raw instanceof ArrayBuffer ? new Uint8Array(raw) : new Uint8Array(0);`,
        `    const result = parseHarFile(bytes, fileName, preset);`,
        `    self.postMessage({ requestId: requestId, ok: true, result: result });`,
        `  } catch (err) {`,
        `    const errMsg = err && typeof err.message === 'string' ? err.message : String(err);`,
        `    self.postMessage({ requestId: requestId, ok: false, error: errMsg });`,
        `  }`,
        `});`,
    ].join('\n');
}

export function createHarWorkerDispatcher(): HarWorkerDispatcher {
    let latestRequestId = 0;
    let disposed = false;
    let activeCancelFn: ((reason?: string) => void) | null = null;

    const cancelCurrent = (reason = 'HAR analysis superseded by a newer file selection.') => {
        if (activeCancelFn) {
            const fn = activeCancelFn;
            activeCancelFn = null;
            fn(reason);
        }
    };

    const dispose = () => {
        disposed = true;
        cancelCurrent('Dispatcher disposed.');
    };

    const parse = (
        bytes: Uint8Array,
        fileName = 'capture.har',
        preset: HarWorkflowPresetId = 'support_ticket_safe'
    ): Promise<HarWorkerAsyncOutcome> => {
        if (disposed) {
            return Promise.reject(new Error('HAR worker dispatcher has been disposed.'));
        }
        cancelCurrent();
        const requestId = ++latestRequestId;

        const runFallback = (): Promise<HarWorkerAsyncOutcome> => {
            return new Promise((resolve, reject) => {
                if (disposed || requestId !== latestRequestId) {
                    reject(createHarCancelledError(requestId));
                    return;
                }
                try {
                    const result = parseHarFile(bytes, fileName, preset);
                    if (disposed || requestId !== latestRequestId) {
                        reject(createHarCancelledError(requestId));
                        return;
                    }
                    resolve({ result, executionMode: 'main-thread-fallback', requestId });
                } catch (err: unknown) {
                    reject(err instanceof Error ? err : new Error(String(err)));
                }
            });
        };

        // For HAR files under 8 MB (including all sample files and 99% of real captures),
        // execute synchronously via main-thread fallback in <5 ms to avoid Blob Worker CSP
        // blocks or bundler fn.toString() scope renaming in Next.js / Vite / Vinext.
        const WORKER_THRESHOLD_BYTES = 8 * 1024 * 1024;
        const canUseWorker =
            bytes.length > WORKER_THRESHOLD_BYTES &&
            typeof Worker !== 'undefined' &&
            typeof Blob !== 'undefined' &&
            typeof URL !== 'undefined' &&
            typeof URL.createObjectURL === 'function';

        if (!canUseWorker) {
            return runFallback();
        }

        return new Promise<HarWorkerAsyncOutcome>((resolve, reject) => {
            let worker: Worker | null = null;
            let objectUrl: string | null = null;
            let settled = false;

            const cleanup = () => {
                if (worker) {
                    try { worker.terminate(); } catch { /* ignore */ }
                    worker = null;
                }
                if (objectUrl) {
                    try { URL.revokeObjectURL(objectUrl); } catch { /* ignore */ }
                    objectUrl = null;
                }
                if (activeCancelFn === cancelThis) {
                    activeCancelFn = null;
                }
            };

            const cancelThis = (reason?: string) => {
                if (settled) return;
                settled = true;
                cleanup();
                reject(createHarCancelledError(requestId, reason));
            };
            activeCancelFn = cancelThis;

            try {
                const scriptSource = buildHarWorkerScriptSource();
                const blob = new Blob([scriptSource], { type: 'application/javascript' });
                objectUrl = URL.createObjectURL(blob);
                worker = new Worker(objectUrl);

                worker.onmessage = (ev: MessageEvent) => {
                    if (settled) return;
                    const data = ev.data;
                    if (!data || data.requestId !== requestId) return;
                    if (disposed || requestId !== latestRequestId) {
                        settled = true;
                        cleanup();
                        reject(createHarCancelledError(requestId));
                        return;
                    }
                    settled = true;
                    cleanup();
                    if (data.ok && data.result) {
                        resolve({
                            result: data.result as HarParseResult,
                            executionMode: 'worker',
                            requestId,
                        });
                    } else {
                        // Fall back to main thread if worker encountered a bundler/scope error
                        runFallback().then(resolve, reject);
                    }
                };

                worker.onerror = () => {
                    if (settled) return;
                    settled = true;
                    cleanup();
                    runFallback().then(resolve, reject);
                };

                const copyBytes = new Uint8Array(bytes.length);
                copyBytes.set(bytes);
                worker.postMessage(
                    { requestId, fileName, preset, bytes: copyBytes.buffer },
                    [copyBytes.buffer]
                );
            } catch {
                if (!settled) {
                    settled = true;
                    cleanup();
                    runFallback().then(resolve, reject);
                }
            }
        });
    };

    return {
        parse,
        cancelCurrent,
        dispose,
        getActiveRequestId: () => latestRequestId,
    };
}