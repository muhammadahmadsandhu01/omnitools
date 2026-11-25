/**
 * KivaroTools — 1,000+ Enterprise Test Suite for JWT, PASETO & SAML 2.0 Debugger Engine
 * File: scripts/test-jwt-paseto-saml-1000-suite.ts
 *
 * 12 Comprehensive Test Blocks (1,280+ Tests Total):
 *  1. Block 1: Cryptographic Primitives (SHA-256/384/512, HMAC, CRC-32, Static Base64URL)
 *  2. Block 2: JWT Signing, Decoding, Wrapper Stripping & Malformed Rejection
 *  3. Block 3: Live Clock Default (null) vs Reference Timestamp & Clock Skew Boundaries
 *  4. Block 4: 65-Password Weak HMAC Secret Dictionary Auditor (HS256 / HS384 / HS512)
 *  5. Block 5: 16-Rule Security Linter, Expected iss/aud & 1-Click Auto-Fix Remediation
 *  6. Block 6: RFC 9901 SD-JWT Selective Disclosure & 5-Part JWE Engine
 *  7. Block 7: PASETO v1–v4 LE64 PAE Framing, PASERK Keys & Implicit Assertions
 *  8. Block 8: SAML 2.0 RFC 1951 DEFLATE/INFLATE, XML Parser & Cross-Protocol Translator
 *  9. Block 9: RFC 7638 JWK Thumbprints, Key Studio, PKCE S256 & 8-Language Codegen
 * 10. Block 10: CWE-1236 Sanitization, CSV & Native OOXML .xlsx ZIP/CRC-32 Structure
 * 11. Block 11: 6 Built-In Presets, Edge Fuzzing Matrix & Performance Throughput
 * 12. Block 12: Tool Registry, Sitemap, Salary Countries & React SSR Component Integrity
 */

import crypto from 'node:crypto';
import zlib from 'node:zlib';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {
    JWT_PASETO_SAML_ENGINE_VERSION,
    DEFAULT_REFERENCE_UNIX_SEC,
    WEAK_HMAC_DICTIONARY_65,
    computeSha256Bytes,
    computeSha256Hex,
    computeSha384Or512Bytes,
    computeHmacBytes,
    uint8ArrayToBase64,
    uint8ArrayToBase64Url,
    base64OrUrlToUint8Array,
    utf8ToBytes,
    bytesToUtf8,
    bytesToHex,
    computeCrc32,
    auditWeakHmacSecret,
    encodeLe64,
    buildPasetoPaeBuffer,
    xorStreamWithKeyAndNonce,
    extractRawKeyBytesFromSecretInput,
    derive32ByteKeyFromSecretOrPaserk,
    createPasetoToken,
    createJwe5PartToken,
    deflateRawRfc1951,
    inflateRawRfc1951OrFallback,
    formatXmlPretty,
    parseSaml2Payload,
    computeRfc7638JwkThumbprint,
    compileKeyStudioBundle,
    signJwtHs256,
    translateTokenAcrossProtocols,
    analyzeTokenAndCompileReport,
    autoFixTokenVulnerabilities,
    generateVerificationCodeSnippet,
    sanitizeSpreadsheetCellCwe1236,
    exportSecurityAuditCsv,
    exportSecurityAuditXlsx,
    getDefaultDebuggerInputs,
    getPresetDebuggerInputs,
    type CodeGeneratorLanguage,
    type DebuggerInputs,
    type PresetScenarioId,
} from '../lib/jwtPasetoSamlEngine';
import JwtPasetoSamlDebugger from '../components/tools/JwtPasetoSamlDebugger';
import JwtPasetoSamlDebuggerSeo, { JWT_PASETO_SAML_FAQS } from '../components/seo/JwtPasetoSamlDebuggerSeo';
import { tools } from '../config/toolsData';
import { SALARY_COUNTRIES, SALARY_COUNTRY_SLUGS } from '../config/salaryCountries';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assertTest(condition: boolean, id: string, message: string): void {
    totalTests++;
    if (condition) {
        passedTests++;
    } else {
        failedTests++;
        console.error(`❌ [${id}] FAILED: ${message}`);
    }
}

console.log('======================================================================');
console.log('⚡ Running 1,000+ Enterprise Suite: JWT, PASETO & SAML 2.0 Debugger');
console.log('======================================================================\n');

// ============================================================================
// BLOCK 1: Cryptographic Primitives, Oracle Cross-Checks & Base64URL Lookup
// ============================================================================
console.log('--- Block 1: Cryptographic Primitives & Base64URL Lookup ---');

assertTest(JWT_PASETO_SAML_ENGINE_VERSION === '5.1.0-enterprise', 'B1-001', 'Engine version matches 5.1.0-enterprise');
assertTest(computeCrc32(utf8ToBytes('123456789')) === 0xcbf43926, 'B1-002', 'IEEE 802.3 CRC-32 standard vector matches');
assertTest(computeCrc32(new Uint8Array(0)) === 0x00000000, 'B1-003', 'CRC-32 empty buffer is 0');
assertTest(
    computeSha256Hex(utf8ToBytes('')) === 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'B1-004',
    'SHA-256 empty NIST vector exact match'
);
assertTest(
    computeSha256Hex(utf8ToBytes('abc')) === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    'B1-005',
    'SHA-256 "abc" NIST vector exact match'
);

// Cross-verify SHA-256, SHA-384, SHA-512, HMAC-256/384/512 vs Node native crypto (30 lengths)
const hexCompact = (u: Uint8Array, maxLen = 64): string =>
    bytesToHex(u, maxLen).replace(/ /g, '').toLowerCase();

const hashSamples = [
    '', 'a', 'abc', 'a'.repeat(55), 'a'.repeat(56), 'a'.repeat(64), 'a'.repeat(127), 'a'.repeat(128),
    'kivaro-256-bit-production-hmac-key-2026!', '🔐UTF8-Emoji-Token-Payload-🚀',
    '{"alg":"HS256","typ":"JWT"}', 'x'.repeat(250), 'y'.repeat(512), 'z'.repeat(1024),
    '\x00\x01\x02\xfe\xff',
];
hashSamples.forEach((sample, idx) => {
    const bytes = utf8ToBytes(sample);
    const n256 = crypto.createHash('sha256').update(bytes).digest('hex');
    const e256 = computeSha256Hex(bytes);
    assertTest(n256 === e256, `B1-SHA256-${idx}`, `SHA-256 matches Node crypto for sample #${idx}`);

    const n384 = crypto.createHash('sha384').update(bytes).digest('hex');
    const e384 = hexCompact(computeSha384Or512Bytes(bytes, true), 48);
    assertTest(n384 === e384, `B1-SHA384-${idx}`, `SHA-384 matches Node crypto for sample #${idx}`);

    const n512 = crypto.createHash('sha512').update(bytes).digest('hex');
    const e512 = hexCompact(computeSha384Or512Bytes(bytes, false), 64);
    assertTest(n512 === e512, `B1-SHA512-${idx}`, `SHA-512 matches Node crypto for sample #${idx}`);

    for (const alg of ['HS256', 'HS384', 'HS512'] as const) {
        const keyStr = idx % 2 === 0 ? 'short-key' : 'very-long-hmac-secret-exceeding-128-bytes-' + 'K'.repeat(100);
        const nodeAlg = alg === 'HS256' ? 'sha256' : alg === 'HS384' ? 'sha384' : 'sha512';
        const nMac = crypto.createHmac(nodeAlg, utf8ToBytes(keyStr)).update(bytes).digest('base64url');
        const eMac = uint8ArrayToBase64Url(computeHmacBytes(alg, utf8ToBytes(keyStr), bytes));
        assertTest(nMac === eMac, `B1-HMAC-${alg}-${idx}`, `HMAC ${alg} matches Node crypto for sample #${idx}`);
    }
});

// Static BASE64_LOOKUP Base64 & Base64URL roundtrip tests (30 cases)
for (let len = 0; len < 30; len++) {
    const raw = new Uint8Array(len);
    for (let j = 0; j < len; j++) raw[j] = (len * 19 + j * 37) & 0xff;
    const stdB64 = uint8ArrayToBase64(raw);
    const urlB64 = uint8ArrayToBase64Url(raw);
    const decStd = base64OrUrlToUint8Array(stdB64);
    const decUrl = base64OrUrlToUint8Array(urlB64);
    assertTest(
        bytesToHex(decStd, len) === bytesToHex(raw, len) && bytesToHex(decUrl, len) === bytesToHex(raw, len),
        `B1-B64-${len}`,
        `Base64 & Base64URL static lookup roundtrip exact for ${len} bytes`
    );
}
assertTest(!uint8ArrayToBase64Url(utf8ToBytes('?>?>?>')).includes('='), 'B1-B64-NOPAD', 'Base64URL strips = padding');
assertTest(!uint8ArrayToBase64Url(new Uint8Array([251, 255, 191])).includes('+'), 'B1-B64-PLUS', 'Base64URL replaces +');
assertTest(!uint8ArrayToBase64Url(new Uint8Array([251, 255, 191])).includes('/'), 'B1-B64-SLASH', 'Base64URL replaces /');

// ============================================================================
// BLOCK 2: JWT Signing, Wrapper Stripping & Strict Malformed Validation
// ============================================================================
console.log('--- Block 2: JWT Signing, Wrapper Stripping & Malformed Validation ---');

const baseDef = getDefaultDebuggerInputs();
const testSecret = 'enterprise-jwt-secret-key-256-bits-valid-01!';

for (const alg of ['HS256', 'HS384', 'HS512'] as const) {
    for (let i = 0; i < 8; i++) {
        const claims = {
            iss: `https://auth${i}.example.com`,
            sub: `usr_${i}`,
            aud: `https://api${i}.example.com`,
            iat: 1700000000 + i * 10,
            nbf: 1700000000 + i * 10,
            exp: 2000000000 + i * 60,
            jti: `jti_${i}`,
            customNum: i * 100,
        };
        const tok = signJwtHs256({ alg, typ: 'JWT', kid: `k-${i}` }, claims, testSecret);
        const rep = analyzeTokenAndCompileReport({
            ...baseDef,
            rawTokenInput: tok,
            secretOrKeyInput: testSecret,
        });
        assertTest(rep.detectedProtocol === 'JWT_JWS', `B2-JWT-${alg}-${i}-PROT`, `Detected JWT_JWS for ${alg} #${i}`);
        assertTest(rep.verificationStatus === 'SIGNATURE_VERIFIED', `B2-JWT-${alg}-${i}-VER`, `Verified ${alg} signature #${i}`);
        assertTest(rep.subjectLabel === `usr_${i}`, `B2-JWT-${alg}-${i}-SUB`, `Subject parsed usr_${i}`);

        const wrong = analyzeTokenAndCompileReport({
            ...baseDef,
            rawTokenInput: tok,
            secretOrKeyInput: testSecret + 'tampered',
        });
        assertTest(wrong.verificationStatus === 'INVALID_SIGNATURE', `B2-JWT-${alg}-${i}-WRONG`, `Rejected wrong secret for ${alg} #${i}`);
    }
}

// Base64URL secret encoding & JWK oct secret & PASERK k4.local secret
const b64Key = uint8ArrayToBase64Url(utf8ToBytes(testSecret));
const tokB64 = signJwtHs256({ alg: 'HS256', typ: 'at+jwt' }, { iss: 'a', sub: 'b', aud: 'c', exp: 2000000000, jti: '1' }, b64Key, 'base64url');
const repB64 = analyzeTokenAndCompileReport({ ...baseDef, rawTokenInput: tokB64, secretOrKeyInput: b64Key, secretEncoding: 'base64url' });
assertTest(repB64.verificationStatus === 'SIGNATURE_VERIFIED', 'B2-B64SECRET', 'Base64URL secret encoding verifies properly');

const octJwk = JSON.stringify({ kty: 'oct', k: b64Key });
const repOct = analyzeTokenAndCompileReport({ ...baseDef, rawTokenInput: tokB64, secretOrKeyInput: octJwk });
assertTest(repOct.verificationStatus === 'SIGNATURE_VERIFIED', 'B2-OCTJWK', 'RFC 7517 oct JWK secret extracts k cleanly');

const paserkKey = `k4.local.${b64Key}`;
const repPaserkKey = analyzeTokenAndCompileReport({ ...baseDef, rawTokenInput: tokB64, secretOrKeyInput: paserkKey });
assertTest(repPaserkKey.verificationStatus === 'SIGNATURE_VERIFIED', 'B2-PASERKKEY', 'PASERK k4.local key verifies HS256 cleanly');

// Wrapper stripping tests (6 wrapper formats x 3 iterations)
const baseValidTok = signJwtHs256({ alg: 'HS256', typ: 'JWT' }, { iss: 'https://a.com', sub: 'u1', aud: 'api', exp: 2000000000, jti: 'x' }, testSecret);
const wrapperCases: Array<[string, string]> = [
    [`Authorization: Bearer ${baseValidTok}`, 'BEARER_HEADER'],
    [`Bearer   ${baseValidTok}`, 'BEARER_HEADER'],
    [`Authorization: DPoP ${baseValidTok}`, 'DPOP_HEADER'],
    [`Set-Cookie: session_jwt=${baseValidTok}; HttpOnly; Secure`, 'COOKIE_HEADER'],
    [`access_token=${baseValidTok}`, 'COOKIE_HEADER'],
    [JSON.stringify({ access_token: baseValidTok, expires_in: 3600 }), 'JSON_WRAPPER'],
    [JSON.stringify({ id_token: baseValidTok }), 'JSON_WRAPPER'],
    [`https://app.example.com/callback#id_token=${encodeURIComponent(baseValidTok)}&state=xyz`, 'URL_PARAM'],
    [`https://app.example.com/auth?access_token=${encodeURIComponent(baseValidTok)}`, 'URL_PARAM'],
];
wrapperCases.forEach(([wrapped, expectedWrapper], idx) => {
    const r = analyzeTokenAndCompileReport({ ...baseDef, rawTokenInput: wrapped, secretOrKeyInput: testSecret });
    assertTest(r.strippedWrapperType === expectedWrapper, `B2-WRAP-TYPE-${idx}`, `Stripped wrapper type === ${expectedWrapper}`);
    assertTest(r.verificationStatus === 'SIGNATURE_VERIFIED', `B2-WRAP-VER-${idx}`, `Verified token after stripping wrapper #${idx}`);
});

// Newly upgraded malformed JWT JSON/Base64 checks!
const malformedPayloads = [
    'not_a_token',
    'abc.def',
    '!!!invalid_b64!!!.!!!invalid!!!.sig',
    `${uint8ArrayToBase64Url(utf8ToBytes('[]'))}.${uint8ArrayToBase64Url(utf8ToBytes('{"sub":"u"}'))}.sig`,
    `${uint8ArrayToBase64Url(utf8ToBytes('{"alg":"HS256"}'))}.${uint8ArrayToBase64Url(utf8ToBytes('["array"]'))}.sig`,
    `${uint8ArrayToBase64Url(utf8ToBytes('"just-a-string"'))}.${uint8ArrayToBase64Url(utf8ToBytes('{"sub":"u"}'))}.sig`,
    `${uint8ArrayToBase64Url(utf8ToBytes('{"alg":"HS256"}'))}.${uint8ArrayToBase64Url(utf8ToBytes('12345'))}.sig`,
    `${uint8ArrayToBase64Url(utf8ToBytes('{broken json'))}.${uint8ArrayToBase64Url(utf8ToBytes('{"sub":"u"}'))}.sig`,
    `${uint8ArrayToBase64Url(utf8ToBytes('{"alg":"HS256"}'))}.${uint8ArrayToBase64Url(utf8ToBytes('{broken payload'))}.sig`,
    '....',
];
malformedPayloads.forEach((badTok, idx) => {
    const repBad = analyzeTokenAndCompileReport({ ...baseDef, rawTokenInput: badTok });
    assertTest(repBad.verificationStatus === 'MALFORMED_TOKEN', `B2-MALFORMED-${idx}`, `Malformed token #${idx} sets MALFORMED_TOKEN`);
});

// Asymmetric decode behavior
for (const asymAlg of ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'PS256', 'EdDSA']) {
    const h = uint8ArrayToBase64Url(utf8ToBytes(JSON.stringify({ alg: asymAlg, typ: 'JWT', kid: 'k1' })));
    const p = uint8ArrayToBase64Url(utf8ToBytes(JSON.stringify({ iss: 'https://a.com', sub: 's1', aud: 'a1', exp: 2000000000, jti: '1' })));
    const repAsym = analyzeTokenAndCompileReport({ ...baseDef, rawTokenInput: `${h}.${p}.fakesig` });
    assertTest(repAsym.verificationStatus === 'UNVERIFIED_ASYMMETRIC_OR_SAML', `B2-ASYM-ST-${asymAlg}`, `Asymmetric ${asymAlg} marks UNVERIFIED_ASYMMETRIC_OR_SAML`);
    assertTest(repAsym.algorithmLabel === asymAlg, `B2-ASYM-ALG-${asymAlg}`, `Asymmetric ${asymAlg} extracted`);
}

// ============================================================================
// BLOCK 3: Live Clock Default (null) vs Reference Timestamp & Clock Skew
// ============================================================================
console.log('--- Block 3: Live Clock Default & Temporal / Skew Boundaries ---');

const freshDefault = getDefaultDebuggerInputs();
assertTest(freshDefault.simulatedCurrentUnixTimestamp === null, 'B3-DEF-NULL', 'Default inputs set simulatedCurrentUnixTimestamp = null (live clock)');
assertTest(freshDefault.expectedIssuer === '', 'B3-DEF-ISS', 'Default expectedIssuer is empty');
assertTest(freshDefault.expectedAudience === '', 'B3-DEF-AUD', 'Default expectedAudience is empty');

const nowUnix = Math.floor(Date.now() / 1000);
// Live clock token: expired 120s ago relative to Date.now()
const expiredLiveTok = signJwtHs256(
    { alg: 'HS256', typ: 'JWT' },
    { iss: 'https://a.com', sub: 'live1', aud: 'api', iat: nowUnix - 3600, exp: nowUnix - 120, jti: 'live-exp' },
    testSecret
);
const repExpiredLive = analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: expiredLiveTok, secretOrKeyInput: testSecret });
assertTest(repExpiredLive.isExpired === true, 'B3-LIVE-EXP', 'Token expired 120s ago relative to Date.now() is flagged expired with null timestamp');

// Live clock token: valid +3600s from now
const futureLiveTok = signJwtHs256(
    { alg: 'HS256', typ: 'JWT' },
    { iss: 'https://a.com', sub: 'live2', aud: 'api', iat: nowUnix - 60, exp: nowUnix + 3600, jti: 'live-ok' },
    testSecret
);
const repFutureLive = analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: futureLiveTok, secretOrKeyInput: testSecret });
assertTest(repFutureLive.isExpired === false, 'B3-LIVE-VALID', 'Token expiring +3600s from Date.now() is valid with null timestamp');

// Exact skew boundary matrix (refUnix pinned to 1780000000 across 30 skew values)
const refFixed = 1780000000;
for (let s = 0; s < 30; s++) {
    const skewSec = s * 10;
    const expExactBoundary = refFixed - skewSec; // refUnix - skew === exp -> NOT expired
    const expPastBoundary = refFixed - skewSec - 1; // refUnix - skew > exp -> EXPIRED

    const tBoundary = signJwtHs256({ alg: 'HS256', typ: 'JWT' }, { iss: 'a', sub: 'b', aud: 'c', jti: 'j', iat: refFixed - 500, exp: expExactBoundary }, testSecret);
    const rBoundary = analyzeTokenAndCompileReport({
        ...freshDefault,
        rawTokenInput: tBoundary,
        secretOrKeyInput: testSecret,
        simulatedCurrentUnixTimestamp: refFixed,
        clockSkewToleranceSeconds: skewSec,
    });
    assertTest(rBoundary.isExpired === false, `B3-SKEW-GRACE-${s}`, `exp at exact clock skew boundary (-${skewSec}s) stays within grace`);

    const tPast = signJwtHs256({ alg: 'HS256', typ: 'JWT' }, { iss: 'a', sub: 'b', aud: 'c', jti: 'j', iat: refFixed - 500, exp: expPastBoundary }, testSecret);
    const rPast = analyzeTokenAndCompileReport({
        ...freshDefault,
        rawTokenInput: tPast,
        secretOrKeyInput: testSecret,
        simulatedCurrentUnixTimestamp: refFixed,
        clockSkewToleranceSeconds: skewSec,
    });
    assertTest(rPast.isExpired === true, `B3-SKEW-PAST-${s}`, `exp past clock skew boundary (-${skewSec + 1}s) expires`);
}

// NotBefore (nbf) skew boundary tests (20 checks)
for (let s = 0; s < 20; s++) {
    const skewSec = s * 15;
    const nbfFutureOk = refFixed + skewSec;
    const nbfTooFuture = refFixed + skewSec + 2;
    const tNbfOk = signJwtHs256({ alg: 'HS256', typ: 'JWT' }, { iss: 'a', sub: 'b', aud: 'c', jti: 'j', nbf: nbfFutureOk, exp: refFixed + 3600 }, testSecret);
    const tNbfFail = signJwtHs256({ alg: 'HS256', typ: 'JWT' }, { iss: 'a', sub: 'b', aud: 'c', jti: 'j', nbf: nbfTooFuture, exp: refFixed + 3600 }, testSecret);
    assertTest(
        analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: tNbfOk, simulatedCurrentUnixTimestamp: refFixed, clockSkewToleranceSeconds: skewSec }).isNotYetValidNbf === false,
        `B3-NBF-OK-${s}`,
        `nbf within skew +${skewSec}s is valid`
    );
    assertTest(
        analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: tNbfFail, simulatedCurrentUnixTimestamp: refFixed, clockSkewToleranceSeconds: skewSec }).isNotYetValidNbf === true,
        `B3-NBF-FAIL-${s}`,
        `nbf beyond skew +${skewSec + 2}s flagged not yet valid`
    );
}

// ISO & missing exp timestamp checks
const tNoExp = signJwtHs256({ alg: 'HS256', typ: 'JWT' }, { iss: 'a', sub: 'b', aud: 'c', jti: 'j' }, testSecret);
const rNoExp = analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: tNoExp, secretOrKeyInput: testSecret });
assertTest(rNoExp.ttlRemainingSeconds === null && rNoExp.expiresAtIso === '—', 'B3-NO-EXP', 'Missing exp produces null TTL & dash ISO');
assertTest(rNoExp.securityFindings.some((f) => f.ruleId === 'JWT-EXP-007_MISSING_OR_EXPIRED_TTL' && f.severity === 'CRITICAL'), 'B3-NO-EXP-RULE', 'Missing exp triggers CRITICAL rule');

// ============================================================================
// BLOCK 4: 65-Password Weak HMAC Secret Dictionary Auditor
// ============================================================================
console.log('--- Block 4: 65-Password Weak HMAC Dictionary Auditor ---');

assertTest(WEAK_HMAC_DICTIONARY_65.length === 65, 'B4-COUNT-65', 'Dictionary contains exactly 65 weak secrets');

// Exhaustively test all 65 weak secrets in HS256 + every 2nd in HS384 + every 3rd in HS512
WEAK_HMAC_DICTIONARY_65.forEach((weakPwd, idx) => {
    const tok256 = signJwtHs256({ alg: 'HS256', typ: 'JWT' }, { iss: 'i', sub: 's', aud: 'a', jti: 'j', exp: refFixed + 600 }, weakPwd);
    const parts256 = tok256.split('.');
    const cracked256 = auditWeakHmacSecret('HS256', `${parts256[0]}.${parts256[1]}`, parts256[2]);
    assertTest(cracked256 === weakPwd, `B4-HS256-CRACK-${idx}`, `Cracked weak HS256 secret "${weakPwd}"`);

    if (idx % 2 === 0) {
        const rep = analyzeTokenAndCompileReport({
            ...freshDefault,
            rawTokenInput: tok256,
            secretOrKeyInput: 'different-key',
            simulatedCurrentUnixTimestamp: refFixed,
        });
        assertTest(rep.verificationStatus === 'WEAK_SECRET_CRACKED', `B4-REP-CRACK-${idx}`, `Report flags WEAK_SECRET_CRACKED for "${weakPwd}"`);
        assertTest(rep.securityFindings.some((f) => f.ruleId === 'JWT-KEY-002_WEAK_DICTIONARY_SECRET'), `B4-RULE2-${idx}`, `Triggers Rule 2 for "${weakPwd}"`);
    }

    if (idx % 3 === 0) {
        const tok512 = signJwtHs256({ alg: 'HS512', typ: 'JWT' }, { iss: 'i', sub: 's', aud: 'a', jti: 'j', exp: refFixed + 600 }, weakPwd);
        const parts512 = tok512.split('.');
        assertTest(auditWeakHmacSecret('HS512', `${parts512[0]}.${parts512[1]}`, parts512[2]) === weakPwd, `B4-HS512-CRACK-${idx}`, `Cracked HS512 weak secret "${weakPwd}"`);
    }
});

// Ensure strong keys are NOT cracked
for (let i = 0; i < 15; i++) {
    const strongKey = `Strong_CSPRNG_Key_2026_${i}_!@#$_Entropy`;
    const tokStrong = signJwtHs256({ alg: 'HS256', typ: 'JWT' }, { sub: 'u' }, strongKey);
    const p = tokStrong.split('.');
    assertTest(auditWeakHmacSecret('HS256', `${p[0]}.${p[1]}`, p[2]) === null, `B4-STRONG-${i}`, `Strong key #${i} is not falsely cracked`);
}

// ============================================================================
// BLOCK 5: 16-Rule Security Linter + Expected iss/aud & 1-Click Auto-Fixer
// ============================================================================
console.log('--- Block 5: 16-Rule Linter, Expected iss/aud & Auto-Fixer ---');

// Rule 1: alg:none
for (const noneAlg of ['none', 'None', 'NONE']) {
    const h = uint8ArrayToBase64Url(utf8ToBytes(JSON.stringify({ alg: noneAlg, typ: 'JWT' })));
    const p = uint8ArrayToBase64Url(utf8ToBytes(JSON.stringify({ iss: 'a', sub: 'b', aud: 'c', exp: refFixed + 600, jti: '1' })));
    const r = analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: `${h}.${p}.`, simulatedCurrentUnixTimestamp: refFixed });
    assertTest(r.verificationStatus === 'INSECURE_ALG_NONE', `B5-ALG-NONE-ST-${noneAlg}`, `alg=${noneAlg} sets INSECURE_ALG_NONE`);
    assertTest(r.securityFindings.some((f) => f.ruleId === 'JWT-ALG-001_NONE_BYPASS'), `B5-ALG-NONE-R1-${noneAlg}`, `alg=${noneAlg} triggers Rule 1`);
}

// Rule 3: RS256 -> HS256 Key Confusion with PUBLIC KEY PEM
const hsWithPem = signJwtHs256({ alg: 'HS256', typ: 'JWT' }, { iss: 'a', sub: 'b', aud: 'c', exp: refFixed + 600, jti: '1' }, '-----BEGIN PUBLIC KEY-----\nMIIBIjAN\n-----END PUBLIC KEY-----');
const repKeyConf = analyzeTokenAndCompileReport({
    ...freshDefault,
    rawTokenInput: hsWithPem,
    secretOrKeyInput: '-----BEGIN PUBLIC KEY-----\nMIIBIjAN\n-----END PUBLIC KEY-----',
    simulatedCurrentUnixTimestamp: refFixed,
});
assertTest(repKeyConf.securityFindings.some((f) => f.ruleId === 'JWT-CONF-003_ASYMMETRIC_KEY_CONFUSION'), 'B5-R3-KEYCONF', 'Rule 3 flags Public Key PEM used with HMAC');

// Rule 4 (jku/x5u) & Rule 5 (inline jwk)
const hdrSsrf = signJwtHs256({ alg: 'HS256', typ: 'JWT', jku: 'http://evil.local/jwks.json', x5u: 'http://evil.local/cert.pem', jwk: { kty: 'oct', k: 'abc' } }, { iss: 'a', sub: 'b', aud: 'c', exp: refFixed + 600, jti: '1' }, testSecret);
const repSsrf = analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: hdrSsrf, secretOrKeyInput: testSecret, simulatedCurrentUnixTimestamp: refFixed });
assertTest(repSsrf.securityFindings.some((f) => f.ruleId === 'JWT-HDR-004_JKU_X5U_SSRF_INJECTION'), 'B5-R4-JKU', 'Rule 4 flags jku/x5u SSRF');
assertTest(repSsrf.securityFindings.some((f) => f.ruleId === 'JWT-HDR-005_EMBEDDED_JWK_SELF_SIGN'), 'B5-R5-JWK', 'Rule 5 flags inline jwk');

// Rule 6: kid SQLi & traversal vectors (12 vectors)
const kidPayloads = ['../../etc/passwd', '/dev/null', "1' OR '1'='1", 'k1; cat /etc/shadow', 'k1 -- comment', 'k1 UNION SELECT 1', 'k1 | whoami', '..\\..\\win.ini', "'; DROP TABLE keys;--", '../keys/pub.pem', 'id" OR ""="', '../../root/.ssh/id_rsa'];
kidPayloads.forEach((kid, idx) => {
    if (!kid.includes('..')) {
        // Test SQLi / pipe / quotes
    }
    const tok = signJwtHs256({ alg: 'HS256', typ: 'JWT', kid }, { iss: 'a', sub: 'b', aud: 'c', exp: refFixed + 600, jti: '1' }, testSecret);
    const rep = analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: tok, secretOrKeyInput: testSecret, simulatedCurrentUnixTimestamp: refFixed });
    const expectedTriggered = /(\.\.\/|\/dev\/null|['";]|--|union\s+select|\|)/i.test(kid);
    assertTest(
        rep.securityFindings.some((f) => f.ruleId === 'JWT-KID-006_PATH_TRAVERSAL_OR_SQLI') === expectedTriggered,
        `B5-R6-KID-${idx}`,
        `kid="${kid}" Rule 6 expected=${expectedTriggered}`
    );
});

// Newly Added Expected Issuer & Expected Audience Validation (15 combinations)
const claimTok = signJwtHs256({ alg: 'HS256', typ: 'JWT' }, { iss: 'https://idp.prod.com', sub: 'u1', aud: ['api-1', 'api-2'], iat: refFixed - 60, exp: refFixed + 600, jti: 'j1' }, testSecret);
assertTest(
    analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: claimTok, secretOrKeyInput: testSecret, simulatedCurrentUnixTimestamp: refFixed, expectedIssuer: 'https://idp.prod.com', expectedAudience: 'api-2' }).securityFindings.filter((f) => f.ruleId === 'JWT-ISS-MISMATCH' || f.ruleId === 'JWT-AUD-MISMATCH').length === 0,
    'B5-ISS-AUD-MATCH',
    'Matching expectedIssuer & expectedAudience (array aud) produces zero mismatch findings'
);
assertTest(
    analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: claimTok, secretOrKeyInput: testSecret, simulatedCurrentUnixTimestamp: refFixed, expectedIssuer: 'https://wrong-idp.com' }).securityFindings.some((f) => f.ruleId === 'JWT-ISS-MISMATCH'),
    'B5-ISS-MISMATCH',
    'Non-matching expectedIssuer triggers JWT-ISS-MISMATCH'
);
assertTest(
    analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: claimTok, secretOrKeyInput: testSecret, simulatedCurrentUnixTimestamp: refFixed, expectedAudience: 'api-3' }).securityFindings.some((f) => f.ruleId === 'JWT-AUD-MISMATCH'),
    'B5-AUD-MISMATCH',
    'Non-matching expectedAudience against array aud triggers JWT-AUD-MISMATCH'
);
const stringAudTok = signJwtHs256({ alg: 'HS256', typ: 'JWT' }, { iss: 'https://idp.prod.com', sub: 'u1', aud: 'single-api', iat: refFixed - 60, exp: refFixed + 600, jti: 'j1' }, testSecret);
assertTest(
    analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: stringAudTok, secretOrKeyInput: testSecret, simulatedCurrentUnixTimestamp: refFixed, expectedAudience: 'other-api' }).securityFindings.some((f) => f.ruleId === 'JWT-AUD-MISMATCH'),
    'B5-STR-AUD-MISMATCH',
    'String aud mismatch triggers JWT-AUD-MISMATCH'
);

// Rule 8 (>24h TTL) & Rule 10 (Sensitive PII keys) & Rule 11 (missing typ)
const piiKeys = ['password', 'passwd', 'pwd', 'secret', 'private_key', 'api_key', 'apikey', 'ssn', 'social_security', 'credit_card', 'card_number', 'cvv', 'pin', 'bank_account'];
piiKeys.forEach((pk, idx) => {
    const tokPii = signJwtHs256({ alg: 'HS256' }, { iss: 'a', sub: 'b', aud: 'c', jti: '1', iat: refFixed, exp: refFixed + 200000, [pk]: 'sensitive_123' }, testSecret);
    const repPii = analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: tokPii, secretOrKeyInput: testSecret, simulatedCurrentUnixTimestamp: refFixed });
    assertTest(repPii.securityFindings.some((f) => f.ruleId === 'JWT-PII-010_SENSITIVE_DATA_IN_PAYLOAD'), `B5-PII-${idx}`, `Sensitive key "${pk}" triggers Rule 10`);
    assertTest(repPii.securityFindings.some((f) => f.ruleId === 'JWT-TTL-008_EXCESSIVE_LIFETIME'), `B5-TTL-${idx}`, `>24h TTL triggers Rule 8 (${pk})`);
    assertTest(repPii.securityFindings.some((f) => f.ruleId === 'JWT-CRIT-011_MISSING_EXPLICIT_TYP'), `B5-TYP-${idx}`, `Missing typ triggers Rule 11 (${pk})`);
});

// Cookie 4KB & Proxy 8KB footprint boundary checks
const bigClaims = { iss: 'a', sub: 'b', aud: 'c', jti: '1', iat: refFixed, exp: refFixed + 600, roles: 'R'.repeat(4500) };
const bigTok = signJwtHs256({ alg: 'HS256', typ: 'JWT' }, bigClaims, testSecret);
const repBig = analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: bigTok, secretOrKeyInput: testSecret, simulatedCurrentUnixTimestamp: refFixed });
assertTest(repBig.totalByteLength > 4096 && !repBig.fits4kbCookieLimit && repBig.fits8kbHttpHeaderLimit, 'B5-SIZE-4KB', 'Token between 4KB and 8KB fails 4KB cookie check but passes 8KB header check');
assertTest(repBig.cookieBudgetUsagePercent === 100, 'B5-SIZE-PCT-CAP', 'cookieBudgetUsagePercent caps cleanly at 100');

const hugeClaims = { iss: 'a', sub: 'b', aud: 'c', jti: '1', iat: refFixed, exp: refFixed + 600, dump: 'H'.repeat(9000) };
const hugeTok = signJwtHs256({ alg: 'HS256', typ: 'JWT' }, hugeClaims, testSecret);
const repHuge = analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: hugeTok, secretOrKeyInput: testSecret, simulatedCurrentUnixTimestamp: refFixed });
assertTest(!repHuge.fits8kbHttpHeaderLimit, 'B5-SIZE-8KB', 'Token >8,192B flags HTTP 431 proxy header risk');

// 1-Click Auto-Fix across all 5 protocol families + null live clock test
for (const pid of ['vulnerable_jwt_audit_demo', 'sd_jwt_selective_disclosure_rfc9901', 'paseto_v4_public_footer_pae', 'jwe_5part_encrypted_a256gcm', 'saml2_response_xsw_audit'] as PresetScenarioId[]) {
    const pre = getPresetDebuggerInputs(pid).inputs;
    const fixed = autoFixTokenVulnerabilities(pre);
    const repFixed = analyzeTokenAndCompileReport(fixed.nextInputs);
    assertTest(repFixed.securityScore === 100 && repFixed.securityGrade === 'A+', `B5-AUTOFIX-${pid}`, `Auto-Fix elevates ${pid} to 100/100 (A+)`);
    assertTest(repFixed.criticalFindingsCount === 0, `B5-AUTOFIX-CRIT-${pid}`, `Auto-Fix clears critical findings on ${pid}`);
}
// Verify autoFix with simulatedCurrentUnixTimestamp: null uses live clock!
const liveVulnInput: DebuggerInputs = {
    ...freshDefault,
    rawTokenInput: getPresetDebuggerInputs('vulnerable_jwt_audit_demo').inputs.rawTokenInput,
};
const liveAutoFixed = autoFixTokenVulnerabilities(liveVulnInput);
const liveRepAfterFix = analyzeTokenAndCompileReport(liveAutoFixed.nextInputs);
assertTest(!liveRepAfterFix.isExpired && liveRepAfterFix.securityScore === 100, 'B5-AUTOFIX-LIVECLOCK', 'Auto-Fix with null live clock refreshes exp relative to Date.now() -> Score 100');

// ============================================================================
// BLOCK 6: RFC 9901 SD-JWT Selective Disclosure & 5-Part JWE Engine
// ============================================================================
console.log('--- Block 6: RFC 9901 SD-JWT & 5-Part JWE Engine ---');

// Generate 25 dynamic SD-JWT tokens with 1..5 selective disclosures
for (let c = 1; c <= 25; c++) {
    const numDisc = (c % 5) + 1;
    const discs: string[] = [];
    const digests: string[] = [];
    for (let d = 0; d < numDisc; d++) {
        const tuple = [`salt_${c}_${d}`, `claim_${c}_${d}`, d % 2 === 0 ? `val_${c}_${d}` : { nested: c + d }];
        const dB64 = uint8ArrayToBase64Url(utf8ToBytes(JSON.stringify(tuple)));
        discs.push(dB64);
        digests.push(uint8ArrayToBase64Url(computeSha256Bytes(utf8ToBytes(dB64))));
    }
    const baseSd = signJwtHs256({ alg: 'HS256', typ: 'vc+sd-jwt' }, { iss: 'a', sub: 'h1', aud: 'v1', iat: refFixed, exp: refFixed + 600, jti: '1', _sd_alg: 'sha-256', _sd: digests }, testSecret);
    const fullSd = `${baseSd}~${discs.join('~')}~`;
    const rSd = analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: fullSd, secretOrKeyInput: testSecret, simulatedCurrentUnixTimestamp: refFixed });
    assertTest(rSd.detectedProtocol === 'SD_JWT', `B6-SD-PROT-${c}`, `SD-JWT #${c} detected`);
    assertTest(rSd.sdJwtDisclosures.length === numDisc, `B6-SD-LEN-${c}`, `SD-JWT #${c} parsed ${numDisc} disclosures`);
    assertTest(rSd.sdJwtDisclosures.every((x) => x.matchedInPayloadSdArray), `B6-SD-MATCH-${c}`, `SD-JWT #${c} all SHA-256 digests matched _sd`);

    // Unmatched tampered disclosure test
    const fakeDisc = uint8ArrayToBase64Url(utf8ToBytes(JSON.stringify(['bad', 'tampered', 'admin'])));
    const rTamper = analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: `${fullSd}${fakeDisc}~`, secretOrKeyInput: testSecret, simulatedCurrentUnixTimestamp: refFixed });
    assertTest(rTamper.sdJwtDisclosures[rTamper.sdJwtDisclosures.length - 1].matchedInPayloadSdArray === false, `B6-SD-TAMPER-${c}`, `Unmatched disclosure #${c} flagged false`);
}

// 5-Part JWE roundtrips (20 payloads)
for (let j = 0; j < 20; j++) {
    const jPayload = { iss: 'a', sub: `jwe_${j}`, aud: 'c', jti: `j_${j}`, iat: refFixed, exp: refFixed + 600, data: 'Unicode_🚀_' + 'X'.repeat(j * 15) };
    const jTok = createJwe5PartToken(JSON.stringify(jPayload), testSecret, `kid-jwe-${j}`);
    const segs = jTok.split('.');
    assertTest(segs.length === 5 && segs[1] === '', `B6-JWE-SEG-${j}`, `JWE #${j} has 5 dot-parts & empty CEK for dir`);

    const rOk = analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: jTok, secretOrKeyInput: testSecret, simulatedCurrentUnixTimestamp: refFixed });
    assertTest(rOk.detectedProtocol === 'JWE_5PART' && rOk.verificationStatus === 'DECRYPTED_VERIFIED', `B6-JWE-DEC-${j}`, `JWE #${j} decrypted & verified`);
    assertTest(rOk.payloadObject.data === jPayload.data, `B6-JWE-DATA-${j}`, `JWE #${j} plaintext roundtrip exact`);
    assertTest(rOk.jweForensics?.ivBytes === 12 && rOk.jweForensics?.authTagBytes === 16, `B6-JWE-SIZES-${j}`, `JWE #${j} 96-bit IV & 128-bit GCM tag`);

    const rWrongKey = analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: jTok, secretOrKeyInput: 'wrong-jwe-key', simulatedCurrentUnixTimestamp: refFixed });
    assertTest(rWrongKey.verificationStatus !== 'DECRYPTED_VERIFIED', `B6-JWE-WRONG-${j}`, `JWE #${j} wrong key cannot verify`);
}

// ============================================================================
// BLOCK 7: PASETO v1–v4 LE64 PAE Binary Framing & PASERK Keys
// ============================================================================
console.log('--- Block 7: PASETO v1–v4 LE64 PAE Binary Framing ---');

// encodeLe64 bit & MSB clearing checks
assertTest(hexCompact(encodeLe64(0), 8) === '0000000000000000', 'B7-LE64-0', 'LE64(0) exact');
assertTest(hexCompact(encodeLe64(1), 8) === '0100000000000000', 'B7-LE64-1', 'LE64(1) little-endian exact');
assertTest(hexCompact(encodeLe64(258), 8) === '0201000000000000', 'B7-LE64-258', 'LE64(258) little-endian exact');
assertTest((encodeLe64(Number.MAX_SAFE_INTEGER)[7] & 0x80) === 0, 'B7-LE64-MSB', 'LE64 clears MSB bit 63 per PASETO spec');

const paeTest = buildPasetoPaeBuffer([utf8ToBytes('v4.public.'), utf8ToBytes('msg'), utf8ToBytes('ftr')]);
assertTest(paeTest.byteLength === 8 + (8 + 10) + (8 + 3) + (8 + 3), 'B7-PAE-LEN', 'PAE length exact: 8 + sum(8 + len)');
assertTest(paeTest[0] === 3 && paeTest[8] === 10 && paeTest[26] === 3 && paeTest[37] === 3, 'B7-PAE-HEADERS', 'PAE piece headers encoded accurately');

// Test all 8 combinations of PASETO (v1,v2,v3,v4 x local,public) x 5 runs = 40 roundtrips
const pasetoVersions = ['v1', 'v2', 'v3', 'v4'] as const;
const pasetoPurposes = ['local', 'public'] as const;
for (const ver of pasetoVersions) {
    for (const purp of pasetoPurposes) {
        for (let r = 0; r < 5; r++) {
            const payload = { iss: 'a', sub: `p_${ver}_${purp}_${r}`, aud: 'c', jti: '1', iat: new Date((refFixed - 30) * 1000).toISOString(), exp: new Date((refFixed + 600) * 1000).toISOString() };
            const implicit = ver === 'v3' || ver === 'v4' ? `ctx-${r}` : '';
            const footer = r % 2 === 0 ? JSON.stringify({ kid: `k.${r}` }) : `plain-footer-${r}`;
            const pTok = createPasetoToken({
                version: ver,
                purpose: purp,
                payloadJson: JSON.stringify(payload),
                footerText: footer,
                implicitAssertion: implicit,
                secretKeyString: testSecret,
            });
            const rep = analyzeTokenAndCompileReport({
                ...freshDefault,
                rawTokenInput: pTok,
                secretOrKeyInput: testSecret,
                pasetoImplicitAssertion: implicit,
                simulatedCurrentUnixTimestamp: refFixed,
            });
            const expectedSt = purp === 'local' ? 'DECRYPTED_VERIFIED' : 'SIGNATURE_VERIFIED';
            assertTest(rep.detectedProtocol === 'PASETO', `B7-PROT-${ver}-${purp}-${r}`, `Detected ${ver}.${purp}`);
            assertTest(rep.verificationStatus === expectedSt, `B7-VER-${ver}-${purp}-${r}`, `Verified ${ver}.${purp} #${r}`);
            assertTest(rep.pasetoForensics?.footerRawText === footer, `B7-FTR-${ver}-${purp}-${r}`, `Footer preserved on ${ver}.${purp} #${r}`);

            if (ver === 'v3' || ver === 'v4') {
                const repBadImp = analyzeTokenAndCompileReport({
                    ...freshDefault,
                    rawTokenInput: pTok,
                    secretOrKeyInput: testSecret,
                    pasetoImplicitAssertion: 'WRONG-IMPLICIT',
                    simulatedCurrentUnixTimestamp: refFixed,
                });
                assertTest(repBadImp.verificationStatus !== expectedSt, `B7-IMP-${ver}-${purp}-${r}`, `Wrong implicit assertion rejects ${ver}.${purp}`);
            }
        }
    }
}

// ============================================================================
// BLOCK 8: SAML 2.0 RFC 1951 DEFLATE/INFLATE, XML Parser & Translator
// ============================================================================
console.log('--- Block 8: SAML 2.0 DEFLATE/INFLATE & XML Parser ---');

// Stored & Node zlib Fixed/Dynamic Huffman DEFLATE + RFC 1950 zlib header tests (20 payloads)
const samlXmlTemplate = `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_resp_1" Version="2.0" IssueInstant="2026-05-14T11:55:00Z" Destination="https://sp.example.com/acs"><saml:Issuer>https://idp.example.com</saml:Issuer><samlp:Status><samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/></samlp:Status><saml:Assertion ID="_assert_1" Version="2.0" IssueInstant="2026-05-14T11:55:00Z"><saml:Issuer>https://idp.example.com</saml:Issuer><ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:SignedInfo><ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/><ds:Reference URI="#_assert_1"><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/></ds:Reference></ds:SignedInfo><ds:X509Certificate>MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A</ds:X509Certificate></ds:Signature><saml:Subject><saml:NameID>alice@example.com</saml:NameID><saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer"><saml:SubjectConfirmationData NotOnOrAfter="2026-05-14T13:00:00Z" Recipient="https://sp.example.com/acs"/></saml:SubjectConfirmation></saml:Subject><saml:Conditions NotBefore="2026-05-14T11:50:00Z" NotOnOrAfter="2026-05-14T13:00:00Z"><saml:AudienceRestriction><saml:Audience>https://sp.example.com</saml:Audience></saml:AudienceRestriction></saml:Conditions><saml:AttributeStatement><saml:Attribute Name="roles" FriendlyName="Roles"><saml:AttributeValue>Admin</saml:AttributeValue><saml:AttributeValue>DevOps</saml:AttributeValue></saml:Attribute></saml:AttributeStatement></saml:Assertion></samlp:Response>`;

// Test 1) pure TS deflateRawRfc1951 roundtrip, 2) Node zlib.deflateRawSync (Dynamic Huffman!), 3) Node zlib.deflateSync (with 2-byte RFC 1950 header!)
for (let i = 0; i < 10; i++) {
    const sampleXml = samlXmlTemplate.replace('alice@example.com', `user_${i}@example.com`).replace('DevOps', `Group_${i}_` + 'A'.repeat(i * 40));
    const sampleBytes = utf8ToBytes(sampleXml);

    const defTs = deflateRawRfc1951(sampleBytes);
    const infTs = inflateRawRfc1951OrFallback(defTs);
    assertTest(infTs !== null && bytesToUtf8(infTs) === sampleXml, `B8-DEF-TS-${i}`, `RFC 1951 stored-block roundtrip exact #${i}`);

    const defNodeRaw = new Uint8Array(zlib.deflateRawSync(sampleBytes));
    const infNodeRaw = inflateRawRfc1951OrFallback(defNodeRaw);
    assertTest(infNodeRaw !== null && bytesToUtf8(infNodeRaw) === sampleXml, `B8-DEF-HUFF-${i}`, `Node zlib Dynamic/Fixed Huffman raw inflate exact #${i}`);

    const defNodeZlib = new Uint8Array(zlib.deflateSync(sampleBytes));
    const infNodeZlib = inflateRawRfc1951OrFallback(defNodeZlib);
    assertTest(infNodeZlib !== null && bytesToUtf8(infNodeZlib) === sampleXml, `B8-DEF-ZLIB-${i}`, `RFC 1950 zlib header skip + inflate exact #${i}`);

    // HTTP-Redirect URL parsing via analyzeTokenAndCompileReport
    const redirUrl = `https://idp.example.com/sso?SAMLResponse=${encodeURIComponent(uint8ArrayToBase64(defNodeRaw))}&RelayState=123`;
    const repSaml = analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: redirUrl, simulatedCurrentUnixTimestamp: refFixed });
    assertTest(repSaml.detectedProtocol === 'SAML2', `B8-SAML-REDIR-${i}`, `SAML HTTP-Redirect URL detected #${i}`);
    assertTest(repSaml.samlForensics?.detectedInputBinding === 'HTTP-Redirect (DEFLATE + Base64)', `B8-SAML-BIND-${i}`, `Binding identified HTTP-Redirect #${i}`);
    assertTest(repSaml.subjectLabel === `user_${i}@example.com`, `B8-SAML-SUB-${i}`, `Extracted NameID user_${i}@example.com`);
    assertTest(repSaml.samlForensics?.attributes[0]?.values.length === 2, `B8-SAML-ATTR-${i}`, `Extracted multi-value SAML attributes #${i}`);
}

// Large multi-block RFC 1951 deflate test (> 65535 bytes)
const hugeXml = `<saml:Assertion ID="_huge">${'X'.repeat(70000)}</saml:Assertion>`;
const hugeDef = deflateRawRfc1951(utf8ToBytes(hugeXml));
const hugeInf = inflateRawRfc1951OrFallback(hugeDef);
assertTest(hugeInf !== null && bytesToUtf8(hugeInf) === hugeXml, 'B8-DEF-MULTIBLOCK', 'Multi-block >65KB RFC 1951 stored deflate/inflate exact');

// SAML attack rules: XSW duplicate assertion, Reference URI mismatch, XXE DOCTYPE, SHA-1, NameID Comment, Destination!=Recipient
const xxeSaml = `<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><samlp:Response Destination="https://a"><saml:Assertion ID="_1"><saml:NameID>bob<!--cmt-->@evil.com</saml:NameID><saml:SubjectConfirmationData Recipient="https://b"/><ds:Signature><ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/><ds:Reference URI="#_wrong"/></ds:Signature></saml:Assertion></samlp:Response>`;
const repXxe = analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: xxeSaml, simulatedCurrentUnixTimestamp: refFixed });
assertTest(repXxe.securityFindings.some((f) => f.ruleId === 'SAML-XXE-014_DOCTYPE_ENTITY_INJECTION'), 'B8-XXE', 'XXE DOCTYPE/ENTITY rule triggered');
assertTest(repXxe.securityFindings.some((f) => f.ruleId === 'SAML-XSW-012_XML_SIGNATURE_WRAPPING'), 'B8-XSW-URI', 'Reference URI mismatch triggers XSW rule');
assertTest(repXxe.securityFindings.some((f) => f.ruleId === 'SAML-NAMEID-013_COMMENT_TRUNCATION'), 'B8-NAMEID', 'NameID XML comment truncation detected');
assertTest(repXxe.securityFindings.some((f) => f.ruleId === 'SAML-CRYPTO-015_WEAK_SHA1_DIGEST'), 'B8-SHA1', 'SHA-1 SAML XML-DSig flagged');
assertTest(repXxe.securityFindings.some((f) => f.ruleId === 'SAML-COND-016_RECIPIENT_DESTINATION_MISMATCH'), 'B8-RECIPIENT', 'Destination != Recipient mismatch flagged');

// Format XML pretty check
assertTest(formatXmlPretty('<a><b>text</b></a>').includes('  <b>text</b>'), 'B8-XML-PRETTY', 'XML pretty printer indents nested elements cleanly');

// Cross-protocol translation
const trans = translateTokenAcrossProtocols({ sub: 'alice', iss: 'https://idp.test', aud: 'https://api.test', email: 'alice@test.io', role: 'Owner' }, testSecret, 'kid-trans');
assertTest(trans.jwtHs256Token.split('.').length === 3, 'B8-TRANS-JWT', 'Cross-protocol emits valid 3-part HS256 JWT');
assertTest(trans.pasetoV4PublicToken.startsWith('v4.public.'), 'B8-TRANS-PASETO', 'Cross-protocol emits v4.public PASETO');
assertTest(parseSaml2Payload(trans.saml2HttpRedirectDeflateUrl)?.nameId === 'alice', 'B8-TRANS-SAML-RT', 'Cross-protocol SAML HTTP-Redirect URL decodes cleanly back to alice');

// ============================================================================
// BLOCK 9: RFC 7638 JWK Thumbprints, Key Studio, PKCE S256 & 8-Lang Codegen
// ============================================================================
console.log('--- Block 9: RFC 7638 Thumbprints, Key Studio, PKCE & Codegen ---');

// Cross-check RSA, EC, OKP, oct JWK canonical SHA-256 thumbprints against Node crypto
const jwkVectors: Array<[string, Record<string, string>, string]> = [
    ['RSA', { kty: 'RSA', alg: 'RS256', e: 'AQAB', n: '0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx4cbbfAAtVT86zwu1RK7a' }, JSON.stringify({ e: 'AQAB', kty: 'RSA', n: '0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx4cbbfAAtVT86zwu1RK7a' })],
    ['EC', { kty: 'EC', crv: 'P-256', x: 'f83OJ3D2xF1Bg8vub9tLe1gHMzV76e8Tus9uPHvRVEU', y: 'x_FEzRu9m36HLN_tue659LNpXW6pCyStikYjKIWI5a0' }, JSON.stringify({ crv: 'P-256', kty: 'EC', x: 'f83OJ3D2xF1Bg8vub9tLe1gHMzV76e8Tus9uPHvRVEU', y: 'x_FEzRu9m36HLN_tue659LNpXW6pCyStikYjKIWI5a0' })],
    ['OKP', { kty: 'OKP', crv: 'Ed25519', x: '11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo' }, JSON.stringify({ crv: 'Ed25519', kty: 'OKP', x: '11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo' })],
    ['oct', { kty: 'oct', alg: 'HS256', k: 'AyM1SysPpbyDfgZld3umj1qzKObwVMkoqQ-EstJQLr_T-1qS0gZH75aKtMN3Yj0iPS4hcgUuTwjAzZr1Z9CAow' }, JSON.stringify({ k: 'AyM1SysPpbyDfgZld3umj1qzKObwVMkoqQ-EstJQLr_T-1qS0gZH75aKtMN3Yj0iPS4hcgUuTwjAzZr1Z9CAow', kty: 'oct' })],
];
jwkVectors.forEach(([label, jwkObj, canonicalStr], idx) => {
    const expected = crypto.createHash('sha256').update(canonicalStr).digest('base64url');
    const actual = computeRfc7638JwkThumbprint(label, JSON.stringify(jwkObj));
    assertTest(actual.thumbprintKid === expected, `B9-JWK-${idx}`, `RFC 7638 ${label} thumbprint matches canonical SHA-256`);

    const jwksRes = computeRfc7638JwkThumbprint(label, JSON.stringify({ keys: [jwkObj] }));
    assertTest(jwksRes.thumbprintKid === expected, `B9-JWKS-${idx}`, `JWKS wrapper { keys: [${label}] } produces identical thumbprint`);
});

// RFC 7636 Appendix B official PKCE vector
const pkceRep = analyzeTokenAndCompileReport({
    ...freshDefault,
    rawTokenInput: baseValidTok,
    pkceCodeVerifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
    pkceExpectedChallenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
});
assertTest(pkceRep.pkceVerification.computedChallengeS256 === 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM', 'B9-PKCE-VEC', 'RFC 7636 Appendix B S256 test vector exact');
assertTest(pkceRep.pkceVerification.matchesExpectedChallenge === true, 'B9-PKCE-MATCH', 'PKCE expected challenge matched true');

const pkceMismatch = analyzeTokenAndCompileReport({
    ...freshDefault,
    rawTokenInput: baseValidTok,
    pkceCodeVerifier: 'custom-verifier-string-over-43-characters-long-test',
    pkceExpectedChallenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
});
assertTest(pkceMismatch.pkceVerification.matchesExpectedChallenge === false, 'B9-PKCE-MISMATCH', 'PKCE wrong verifier flags mismatch');

// Key Studio outputs
const studio = compileKeyStudioBundle('ES256', testSecret);
assertTest(studio.spkiPublicPem.includes('-----BEGIN PUBLIC KEY-----'), 'B9-STUDIO-PUB', 'Key Studio wraps public PEM header');
assertTest(studio.pkcs8PrivatePem.includes('-----BEGIN PRIVATE KEY-----'), 'B9-STUDIO-PRIV', 'Key Studio wraps private PEM header');
assertTest(studio.paserkPid.startsWith('k4.pid.') && studio.paserkLid.startsWith('k4.lid.'), 'B9-STUDIO-PASERK', 'Key Studio generates k4.pid & k4.lid');

// All 8 Code Languages
const langs: CodeGeneratorLanguage[] = ['nodejs_jose', 'python_pyjwt', 'go_jwt_v5', 'rust_jsonwebtoken', 'java_nimbus', 'csharp_dotnet', 'php_firebase', 'cloudflare_workers'];
langs.forEach((lang) => {
    const snippet = generateVerificationCodeSnippet(repB64, lang);
    assertTest(snippet.length > 80, `B9-LANG-LEN-${lang}`, `Code snippet generated for ${lang}`);
    assertTest(
        snippet.includes('30') || snippet.toLowerCase().includes('verif'),
        `B9-LANG-SEC-${lang}`,
        `Code snippet for ${lang} embeds verification settings`
    );
});

// Additional Claim Row & XOR Cipher & Key Extraction Tests (65 tests -> total >= 1,290)
const standardKeys = ['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti', 'azp', 'nonce', 'scp', 'scope', '_sd', '_sd_alg'];
const fullClaimsPayload: Record<string, unknown> = {
    iss: 'https://issuer.test',
    sub: 'sub-999',
    aud: 'api-prod',
    exp: refFixed + 3600,
    nbf: refFixed - 60,
    iat: refFixed - 60,
    jti: 'jti-999',
    azp: 'client-web',
    nonce: 'nonce-123',
    scp: 'read write',
    scope: 'openid profile',
    _sd_alg: 'sha-256',
    _sd: ['hash1'],
};
const fullClaimsTok = signJwtHs256({ alg: 'HS256', typ: 'JWT' }, fullClaimsPayload, testSecret);
const fullClaimsRep = analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: fullClaimsTok, secretOrKeyInput: testSecret, simulatedCurrentUnixTimestamp: refFixed });
standardKeys.forEach((k) => {
    const row = fullClaimsRep.claimRows.find((r) => r.key === k);
    assertTest(Boolean(row && row.isStandardRfcClaim && row.humanExplanation.length > 10), `B9-CLAIM-DOC-${k}`, `Claim row for "${k}" documented as standard RFC claim`);
});

for (let i = 0; i < 20; i++) {
    const plain = utf8ToBytes(`XOR_Roundtrip_Payload_${i}_🚀_` + 'A'.repeat(i * 7));
    const keyB = derive32ByteKeyFromSecretOrPaserk(`secret-${i}`);
    const nonceB = computeSha256Bytes(utf8ToBytes(`nonce-${i}`)).slice(0, 12);
    const enc = xorStreamWithKeyAndNonce(plain, keyB, nonceB);
    const dec = xorStreamWithKeyAndNonce(enc, keyB, nonceB);
    assertTest(keyB.length === 32, `B9-DERIVE32-${i}`, `derive32ByteKey returns exact 32 bytes #${i}`);
    assertTest(bytesToUtf8(dec) === bytesToUtf8(plain), `B9-XOR-RT-${i}`, `xorStreamWithKeyAndNonce symmetrical roundtrip #${i}`);
    const rawKeyB = extractRawKeyBytesFromSecretInput(`k4.local.${uint8ArrayToBase64Url(keyB)}`);
    assertTest(rawKeyB.length === 32, `B9-PASERK-RAW-${i}`, `extractRawKeyBytesFromSecretInput extracts 32B PASERK #${i}`);
}

// ============================================================================
// BLOCK 10: CWE-1236 Sanitizer, CSV & Native OpenXML .xlsx ZIP/CRC-32 Structure
// ============================================================================
console.log('--- Block 10: CWE-1236 Sanitizer, CSV & Native OOXML .xlsx ---');

const dangerousInputs = ['=SUM(A1:A2)', '+1+1', '-cmd|calc', '@SUM(1,2)', '\tcmd', '\rcmd', '\ncmd'];
dangerousInputs.forEach((inp, idx) => {
    assertTest(sanitizeSpreadsheetCellCwe1236(inp).startsWith("'"), `B10-CWE-ESC-${idx}`, `CWE-1236 prefixes "${inp.replace(/\s/g, ' ')}" with apostrophe`);
});
for (const safeNum of ['-42', '-3.14159', '0', 'admin@example.com', 'Bearer token']) {
    assertTest(sanitizeSpreadsheetCellCwe1236(safeNum) === safeNum, `B10-CWE-SAFE-${safeNum}`, `Safe string "${safeNum}" left unescaped`);
}

const csvTok = signJwtHs256({ alg: 'HS256', typ: 'JWT' }, { iss: 'a', sub: '=1+1', aud: 'c', jti: 'j', exp: refFixed + 600, note: 'hello, "world"' }, testSecret);
const csvRep = analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: csvTok, secretOrKeyInput: testSecret, simulatedCurrentUnixTimestamp: refFixed });
const csvOut = exportSecurityAuditCsv(csvRep);
assertTest(csvOut.startsWith('\uFEFF'), 'B10-CSV-BOM', 'CSV export includes UTF-8 BOM');
assertTest(csvOut.includes("'=1+1"), 'B10-CSV-CWE', 'CSV escapes formula injection in claims');
assertTest(csvOut.includes('"hello, ""world"""'), 'B10-CSV-QUOTE', 'CSV properly RFC-4180 quotes commas and embedded quotes');

const xlsxBytes = exportSecurityAuditXlsx(csvRep);
assertTest(xlsxBytes[0] === 0x50 && xlsxBytes[1] === 0x4b && xlsxBytes[2] === 0x03 && xlsxBytes[3] === 0x04, 'B10-XLSX-MAGIC', 'XLSX begins with PK local file header');
const eocdOffset = xlsxBytes.length - 22;
assertTest(
    xlsxBytes[eocdOffset] === 0x50 && xlsxBytes[eocdOffset + 1] === 0x4b && xlsxBytes[eocdOffset + 2] === 0x05 && xlsxBytes[eocdOffset + 3] === 0x06,
    'B10-XLSX-EOCD',
    'XLSX ends with PK End of Central Directory signature'
);
const xlsxAscii = bytesToUtf8(xlsxBytes);
assertTest(xlsxAscii.includes('[Content_Types].xml') && xlsxAscii.includes('xl/worksheets/sheet1.xml') && xlsxAscii.includes('xl/workbook.xml'), 'B10-XLSX-PARTS', 'XLSX includes all required OOXML ZIP entries');
assertTest(xlsxAscii.includes("'=1+1"), 'B10-XLSX-CWE', 'XLSX escapes CWE-1236 formula injection');

// ============================================================================
// BLOCK 11: Presets, Edge Fuzzing Matrix & Throughput Benchmark
// ============================================================================
console.log('--- Block 11: Presets, Fuzzing & Performance Benchmarks ---');

const allPresets: PresetScenarioId[] = [
    'oidc_jwt_hs256_verified',
    'vulnerable_jwt_audit_demo',
    'sd_jwt_selective_disclosure_rfc9901',
    'paseto_v4_public_footer_pae',
    'jwe_5part_encrypted_a256gcm',
    'saml2_response_xsw_audit',
];
allPresets.forEach((pid) => {
    const pData = getPresetDebuggerInputs(pid);
    const pRep = analyzeTokenAndCompileReport(pData.inputs);
    assertTest(pRep.detectedProtocol !== 'NONE', `B11-PRESET-DET-${pid}`, `Preset ${pid} auto-detected non-empty protocol`);
    if (pid === 'oidc_jwt_hs256_verified' || pid === 'sd_jwt_selective_disclosure_rfc9901' || pid === 'paseto_v4_public_footer_pae' || pid === 'jwe_5part_encrypted_a256gcm') {
        assertTest(pRep.securityScore === 100 && pRep.securityGrade === 'A+', `B11-PRESET-APLUS-${pid}`, `Healthy preset ${pid} scores 100/100 (A+)`);
    }
    if (pid === 'vulnerable_jwt_audit_demo') {
        assertTest(pRep.crackedWeakSecret === 'secret' && pRep.securityFindings.length >= 8, 'B11-PRESET-VULN', 'Vulnerable preset cracks "secret" & flags >=8 rules');
    }
    if (pid === 'saml2_response_xsw_audit') {
        assertTest(pRep.samlForensics?.totalAssertionCount === 2 && pRep.securityFindings.length >= 4, 'B11-PRESET-SAML', 'SAML XSW preset flags 2 assertions & >=4 alerts');
    }
});

// Fuzz 55 adversarial inputs (zero uncaught exceptions)
const fuzzInputs = [
    '', '   ', '.', '..', '...', '....', '~', '~~~', 'v4.local.', 'v4.public.abc', 'v1.local.bad.bad',
    '%', '%E0%A4%A', '<xml', '<<<>>>', '<saml:Response', '<!DOCTYPE x>', 'SAMLRequest=%ZZZ',
    '{"access_token":null}', '{"token":123}', 'Authorization: Bearer ', 'Authorization: DPoP ',
    'Cookie: a=b; c=d', 'eyJ.eyJ.sig', 'eyJhbGciOiJub25lIn0.e30.', 'H'.repeat(10000),
    '\x00\x07\x08\x1b', '🚀.🔥.💎', 'SAMLResponse===', 'https://a.com/?id_token=%invalid%',
];
for (let f = 0; f < 55; f++) {
    const sample = fuzzInputs[f % fuzzInputs.length] + (f > fuzzInputs.length ? `_${f}` : '');
    let threw = false;
    try {
        const res = analyzeTokenAndCompileReport({ ...freshDefault, rawTokenInput: sample });
        assertTest(typeof res.securityScore === 'number' && res.securityScore >= 0 && res.securityScore <= 100, `B11-FUZZ-${f}`, `Fuzz #${f} returned bounded score`);
    } catch {
        threw = true;
    }
    assertTest(!threw, `B11-FUZZ-NOTHROW-${f}`, `Fuzz #${f} did not throw uncaught error`);
}

// Throughput benchmark: 50 consecutive full analyses < 500ms
const pOidc = getPresetDebuggerInputs('oidc_jwt_hs256_verified').inputs;
const tStart = performance.now();
for (let k = 0; k < 50; k++) {
    analyzeTokenAndCompileReport(pOidc);
}
const elapsed = performance.now() - tStart;
assertTest(elapsed < 500, 'B11-BENCH-50', `50 full report analyses completed in ${elapsed.toFixed(1)}ms (<500ms)`);

// ============================================================================
// BLOCK 12: Registry, Sitemap, Salary Countries & React SSR Integrity
// ============================================================================
console.log('--- Block 12: Registry, Sitemap, Country Slugs & React SSR ---');

const jwtTool = tools.find((t) => t.id === 'jwt-debugger');
assertTest(Boolean(jwtTool), 'B12-REG-EXISTS', 'jwt-debugger exists in config/toolsData.ts');
assertTest(jwtTool?.slug === 'jwt-debugger' && jwtTool?.categoryId === 'developer' && jwtTool?.status === 'published', 'B12-REG-META', 'jwt-debugger route & published status valid');
assertTest(
    Boolean(jwtTool?.relatedToolSlugs?.every((s) => tools.some((t) => t.slug === s))),
    'B12-REG-REL',
    'All jwt-debugger relatedToolSlugs exist in registry'
);
assertTest(SALARY_COUNTRIES.length === 22 && SALARY_COUNTRY_SLUGS.length === 22, 'B12-COUNTRIES-22', 'Single-source SALARY_COUNTRIES exports 22 countries');

assertTest(JWT_PASETO_SAML_FAQS.length >= 12, 'B12-SEO-FAQS', `JwtPasetoSamlDebuggerSeo exports ${JWT_PASETO_SAML_FAQS.length} FAQs`);
const seoHtml = ReactDOMServer.renderToStaticMarkup(React.createElement(JwtPasetoSamlDebuggerSeo));
assertTest(seoHtml.includes('application/ld+json') && seoHtml.includes('FAQPage') && seoHtml.includes('SoftwareApplication'), 'B12-SEO-SCHEMA', 'SEO component renders FAQPage & SoftwareApplication JSON-LD');
assertTest(seoHtml.includes('browser'), 'B12-SEO-PRIVACY', 'SEO component includes local browser privacy disclosure');

const toolHtml = ReactDOMServer.renderToStaticMarkup(React.createElement(JwtPasetoSamlDebugger));
assertTest(toolHtml.length > 1000, 'B12-UI-SSR', 'JwtPasetoSamlDebugger React SSR renders cleanly without crashing');
assertTest(toolHtml.includes('OIDC JWT') || toolHtml.includes('SAML 2.0'), 'B12-UI-PRESETS', 'Upgraded JwtPasetoSamlDebugger renders quick preset buttons');

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n======================================================================');
console.log(`🏁 Test Suite Finished: ${passedTests} / ${totalTests} Passed`);
if (failedTests === 0) {
    console.log(`🎉 100% OF ALL ${totalTests} TESTS PASSED WITH ZERO ERRORS!`);
    console.log('✅ jwtPasetoSamlEngine & JwtPasetoSamlDebugger are verified and spec-compliant.');
} else {
    console.error(`❌ ${failedTests} tests failed!`);
    process.exit(1);
}
