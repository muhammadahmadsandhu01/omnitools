/**
 * KivaroTools — Client-Side PII Redactor, Secret Scrubber & AI Prompt Sanitizer Engine
 * File: lib/piiRedactorEngine.ts
 *
 * 100% In-Browser RAM Execution (Zero Server Uploads).
 * Features:
 * - 34 Built-In Entity Detectors across 5 Taxonomic Domains (Secrets/Keys, Personal/NER,
 *   Financial/Cards/IBAN, Government/HIPAA IDs, Network/Infra) + Custom Regex & Wordlist.
 * - Mathematical Checksum Validators: Luhn (Credit Cards & CA SIN), ISO 7064 Mod-97-10 (IBAN),
 *   US ABA Routing Checksum, SSA SSN Area/Group/Serial Validation.
 * - Zero-Download Hybrid Local NER + Two-Pass Coreference Engine: Honorifics, Salutations,
 *   Legal Contract Clauses, Corporate Suffixes, Street Suffixes, and Structure-Aware
 *   JSON/YAML/.env Key + RFC 4180 CSV Column Header Inspection.
 * - 6 Masking Strategies (Reversible Token [EMAIL_01], Synthetic Faker, Partial Mask,
 *   Salted SHA-256 Hash, Blackout ████████, Static Type Label) with Per-Domain Strategy
 *   Overrides, Custom Token Naming, and Per-Entity Whitelisting.
 * - Fuzzy-Tolerant 1-Click AI Response De-Anonymizer (restores tokens even if ChatGPT/Claude
 *   strips brackets, changes casing, or uses synthetic faker values).
 * - CWE-1236 Formula-Safe 3-Sheet Native OpenXML .XLSX, RFC 4180 .CSV, Session Vault .JSON,
 *   and SHA-256 Compliance Audit Certificate exporters.
 */

export const PII_ENGINE_VERSION = '2.2.0';
export const MAX_SAFE_PROMPT_BYTES = 15 * 1024 * 1024; // 15 MB browser safety budget

export type PiiDomainCategory =
  | 'secrets'
  | 'personal_ner'
  | 'financial'
  | 'government_id'
  | 'network'
  | 'custom';

export type PiiSeverity = 'critical' | 'high' | 'medium' | 'low';

export type PiiEntityType =
  // Domain 1: Developer Secrets & Cloud Credentials (12)
  | 'PRIVATE_KEY_PEM'
  | 'JWT_TOKEN'
  | 'AWS_ACCESS_KEY'
  | 'OPENAI_API_KEY'
  | 'ANTHROPIC_API_KEY'
  | 'GITHUB_TOKEN'
  | 'STRIPE_KEY'
  | 'SLACK_TOKEN'
  | 'GOOGLE_CLOUD_KEY'
  | 'DB_CONNECTION_URI'
  | 'BEARER_AUTH_HEADER'
  | 'GENERIC_SECRET_KV'
  // Domain 2: Personal Contact & Hybrid Local NER (6)
  | 'EMAIL_ADDRESS'
  | 'PHONE_NUMBER'
  | 'PERSON_NAME'
  | 'ORGANIZATION_NAME'
  | 'STREET_ADDRESS'
  | 'DATE_OF_BIRTH'
  // Domain 3: Financial & Banking (5)
  | 'CREDIT_CARD'
  | 'IBAN_ACCOUNT'
  | 'US_ABA_ROUTING'
  | 'CRYPTO_WALLET'
  | 'SWIFT_BIC'
  // Domain 4: Government, Tax & Healthcare IDs (6)
  | 'US_SSN'
  | 'PK_NADRA_CNIC'
  | 'UK_NINO'
  | 'CA_SIN'
  | 'IN_PAN_TAX_ID'
  | 'MEDICAL_RECORD_MRN'
  // Domain 5: Network & Infrastructure (4)
  | 'IPV4_ADDRESS'
  | 'IPV6_ADDRESS'
  | 'MAC_ADDRESS'
  | 'SENSITIVE_QUERY_URL'
  // Domain 6: Custom User Rules (1)
  | 'CUSTOM_PATTERN';

export type PiiMaskingMode =
  | 'token' // [EMAIL_01], [OPENAI_KEY_01] (Reversible)
  | 'synthetic' // user01@example.org, +1-555-0101 (Reversible & Format-Preserving)
  | 'partial' // j••••@••••.com, sk-proj-••••9a2f (Irreversible)
  | 'hash' // [EMAIL_SHA256:9f86d081] (Irreversible deterministic correlation)
  | 'redact' // ████████████ (Irreversible blackout)
  | 'type_label'; // [EMAIL_ADDRESS] (Irreversible static label)

export type PiiPresetId =
  | 'ai_prompt_reversible'
  | 'devops_log_scrubber'
  | 'legal_contract_nda'
  | 'hipaa_clinical_safe'
  | 'pci_financial_support'
  | 'csv_json_dataset_synthetic';

export interface CustomRedactionRule {
  id: string;
  label: string; // e.g. "PROJECT_CODE" or "EMP_ID"
  pattern: string; // Regex string or literal keyword
  isRegex: boolean;
  caseSensitive: boolean;
  enabled: boolean;
}

export interface PiiRedactorOptions {
  preset: PiiPresetId;
  maskingMode: PiiMaskingMode;
  enabledTypes: Record<PiiEntityType, boolean>;
  categoryModeOverrides: Partial<Record<PiiDomainCategory, PiiMaskingMode>>;
  preserveLoopbackAndPrivateIps: boolean; // Keeps 127.0.0.1, 10.x, 192.168.x for debugging
  enableStructureAwareKeyScan: boolean; // Scans JSON/CSV/.env keys & CSV columns for contextual PII
  enableHybridLocalNer: boolean; // Scans honorifics, salutations, contract clauses, org suffixes + coreference
  includeAiSystemPromptWrapper: boolean; // Prepends instruction telling LLM to preserve [TOKEN_01]
  hashSalt: string;
  whitelistedValues: string[]; // Exact raw values the user chose to keep unredacted
  customTokenOverrides: Record<string, string>; // Raw value -> custom replacement string
  customRules: CustomRedactionRule[];
}

export interface DetectedPiiMatch {
  id: string;
  entityType: PiiEntityType;
  domain: PiiDomainCategory;
  severity: PiiSeverity;
  rawValue: string;
  replacement: string;
  tokenKey: string; // Always generated (e.g. "[EMAIL_01]") for vault lookup
  syntheticValue: string; // Always generated (e.g. "user01@example.org")
  startOffset: number; // UTF-16 index
  endOffset: number;
  line: number; // 1-based
  column: number; // 1-based
  validationMethod: string; // e.g., "Luhn Checksum Passed (Visa)", "ISO 7064 Mod-97 Verified"
  isWhitelisted: boolean;
  contextSnippet: string;
}

export interface PiiVaultEntry {
  tokenKey: string; // e.g. "[EMAIL_01]"
  syntheticValue: string; // e.g. "user01@example.org"
  appliedReplacement: string; // Actual replacement used in current maskingMode
  rawValue: string;
  entityType: PiiEntityType;
  domain: PiiDomainCategory;
  severity: PiiSeverity;
  occurrences: number;
  isWhitelisted: boolean;
  sampleLocations: string[]; // e.g. ["L2:C14", "L8:C05"]
  validationMethod: string;
}

export interface PiiHighlighterSegment {
  type: 'text' | 'pii';
  text: string;
  match?: DetectedPiiMatch;
}

export interface PiiRedactionResult {
  engineVersion: string;
  originalText: string;
  sanitizedText: string;
  promptWrappedText: string;
  originalByteLength: number;
  sanitizedByteLength: number;
  originalSha256: string;
  sanitizedSha256: string;
  executionTimeMs: number;
  totalMatchesCount: number;
  activeRedactedCount: number;
  whitelistedCount: number;
  uniqueEntitiesCount: number;
  privacyRiskScore: number; // 0 - 100
  privacyRiskVerdict: string;
  domainBreakdown: Record<PiiDomainCategory, number>;
  typeBreakdown: Partial<Record<PiiEntityType, number>>;
  matches: DetectedPiiMatch[];
  vaultEntries: PiiVaultEntry[];
  highlighterSegments: PiiHighlighterSegment[];
  zeroLeakVerified: boolean;
}

export interface AiResponseRestoreResult {
  restoredText: string;
  totalRestoredReplacements: number;
  uniqueTokensRestored: number;
  restoredItems: Array<{
    tokenMatched: string;
    restoredValue: string;
    entityType: PiiEntityType;
    count: number;
  }>;
  unmatchedTokens: string[];
  executionTimeMs: number;
}

// ============================================================================
// DETERMINISTIC PURE-JS SHA-256 & CRC32 FOR CERTIFICATES, SALTED HASH & XLSX
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

function rotr(n: number, x: number): number {
  return (x >>> n) | (x << (32 - n));
}

export function computeSha256Hex(input: Uint8Array | string): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  const bitLen = bytes.length * 8;
  const padLen = (bytes.length + 9 + 63) & ~63;
  const padded = new Uint8Array(padLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(padLen - 4, bitLen >>> 0, false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);
  for (let offset = 0; offset < padLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(7, w[i - 15]) ^ rotr(18, w[i - 15]) ^ (w[i - 15] >>> 3);
      const s1 = rotr(17, w[i - 2]) ^ rotr(19, w[i - 2]) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0,
      b = h1,
      c = h2,
      d = h3,
      e = h4,
      f = h5,
      g = h6,
      h = h7;
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

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

export function computeCrc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function sanitizeSpreadsheetFormula(val: unknown, sanitize = true): string {
  const str = String(val ?? '');
  if (!sanitize || !str) return str;
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

// ============================================================================
// ENTITY METADATA REGISTRY (34 ENTITY TYPES ACROSS 5 DOMAINS + CUSTOM)
// ============================================================================

export interface PiiEntityMetadata {
  type: PiiEntityType;
  label: string;
  shortPrefix: string;
  domain: PiiDomainCategory;
  severity: PiiSeverity;
  specificity: number; // Higher wins on overlapping spans
  description: string;
}

export const PII_ENTITY_REGISTRY: Record<PiiEntityType, PiiEntityMetadata> = {
  // Domain 1: Developer Secrets & Credentials
  PRIVATE_KEY_PEM: {
    type: 'PRIVATE_KEY_PEM',
    label: 'PEM / SSH Private Key Block',
    shortPrefix: 'PRIVATE_KEY',
    domain: 'secrets',
    severity: 'critical',
    specificity: 100,
    description: 'RSA, EC, DSA, OpenSSH, or PKCS#8 private key blocks.',
  },
  DB_CONNECTION_URI: {
    type: 'DB_CONNECTION_URI',
    label: 'Database Connection URI (Postgres/Mongo/Redis/MySQL)',
    shortPrefix: 'DB_URI',
    domain: 'secrets',
    severity: 'critical',
    specificity: 98,
    description: 'Database connection strings containing embedded username:password credentials.',
  },
  JWT_TOKEN: {
    type: 'JWT_TOKEN',
    label: 'JSON Web Token (JWT / JWS)',
    shortPrefix: 'JWT_TOKEN',
    domain: 'secrets',
    severity: 'critical',
    specificity: 96,
    description: '3-segment Base64URL JSON Web Tokens starting with eyJ.',
  },
  OPENAI_API_KEY: {
    type: 'OPENAI_API_KEY',
    label: 'OpenAI API Key (sk- / sk-proj-)',
    shortPrefix: 'OPENAI_KEY',
    domain: 'secrets',
    severity: 'critical',
    specificity: 95,
    description: 'OpenAI project, user, and service-account secret API keys.',
  },
  ANTHROPIC_API_KEY: {
    type: 'ANTHROPIC_API_KEY',
    label: 'Anthropic Claude API Key (sk-ant-)',
    shortPrefix: 'ANTHROPIC_KEY',
    domain: 'secrets',
    severity: 'critical',
    specificity: 95,
    description: 'Anthropic Claude API secret keys (sk-ant-api03-...).',
  },
  AWS_ACCESS_KEY: {
    type: 'AWS_ACCESS_KEY',
    label: 'AWS Access Key ID (AKIA / ASIA)',
    shortPrefix: 'AWS_KEY',
    domain: 'secrets',
    severity: 'critical',
    specificity: 94,
    description: 'Amazon Web Services IAM Access Key IDs (AKIA, ASIA, AROA, AIDA).',
  },
  GITHUB_TOKEN: {
    type: 'GITHUB_TOKEN',
    label: 'GitHub PAT / OAuth Token (ghp_ / github_pat_)',
    shortPrefix: 'GITHUB_TOKEN',
    domain: 'secrets',
    severity: 'critical',
    specificity: 94,
    description: 'GitHub Personal Access Tokens, fine-grained PATs, and Actions tokens.',
  },
  STRIPE_KEY: {
    type: 'STRIPE_KEY',
    label: 'Stripe Live/Test Secret & Webhook Key',
    shortPrefix: 'STRIPE_KEY',
    domain: 'secrets',
    severity: 'critical',
    specificity: 94,
    description: 'Stripe secret (sk_live_), restricted (rk_live_), and webhook (whsec_) keys.',
  },
  SLACK_TOKEN: {
    type: 'SLACK_TOKEN',
    label: 'Slack Bot / User Token & Webhook',
    shortPrefix: 'SLACK_TOKEN',
    domain: 'secrets',
    severity: 'critical',
    specificity: 94,
    description: 'Slack xoxb/xoxp/xoxa tokens and incoming webhook URLs.',
  },
  GOOGLE_CLOUD_KEY: {
    type: 'GOOGLE_CLOUD_KEY',
    label: 'Google Cloud / Firebase API Key (AIza)',
    shortPrefix: 'GCP_KEY',
    domain: 'secrets',
    severity: 'critical',
    specificity: 93,
    description: 'Google Cloud, Maps, Gemini, and Firebase AIza API keys.',
  },
  BEARER_AUTH_HEADER: {
    type: 'BEARER_AUTH_HEADER',
    label: 'Authorization Bearer / Basic Header',
    shortPrefix: 'AUTH_TOKEN',
    domain: 'secrets',
    severity: 'critical',
    specificity: 91,
    description: 'HTTP Authorization Bearer and Basic credential tokens.',
  },
  GENERIC_SECRET_KV: {
    type: 'GENERIC_SECRET_KV',
    label: 'Config Password / API Secret Assignment',
    shortPrefix: 'SECRET_VAL',
    domain: 'secrets',
    severity: 'high',
    specificity: 88,
    description: 'Values assigned to password, client_secret, api_key, or token in JSON/.env/logs.',
  },

  // Domain 3: Financial & Banking
  CREDIT_CARD: {
    type: 'CREDIT_CARD',
    label: 'Payment Card Number (Luhn Verified)',
    shortPrefix: 'CARD_PAN',
    domain: 'financial',
    severity: 'critical',
    specificity: 90,
    description: '13–19 digit Visa, Mastercard, Amex, Discover, and JCB cards verified via Luhn checksum.',
  },
  IBAN_ACCOUNT: {
    type: 'IBAN_ACCOUNT',
    label: 'IBAN Bank Account (Mod-97 Verified)',
    shortPrefix: 'IBAN',
    domain: 'financial',
    severity: 'critical',
    specificity: 90,
    description: 'International Bank Account Numbers validated via ISO 7064 Mod-97-10.',
  },
  US_ABA_ROUTING: {
    type: 'US_ABA_ROUTING',
    label: 'US ABA Bank Routing Number',
    shortPrefix: 'ABA_ROUTING',
    domain: 'financial',
    severity: 'high',
    specificity: 84,
    description: '9-digit US ABA routing transit numbers verified by ABA checksum.',
  },
  CRYPTO_WALLET: {
    type: 'CRYPTO_WALLET',
    label: 'Crypto Wallet Address (BTC / ETH)',
    shortPrefix: 'WALLET',
    domain: 'financial',
    severity: 'medium',
    specificity: 83,
    description: 'Ethereum 0x and Bitcoin Bech32/Base58 wallet addresses.',
  },
  SWIFT_BIC: {
    type: 'SWIFT_BIC',
    label: 'SWIFT / BIC Bank Identifier',
    shortPrefix: 'SWIFT_BIC',
    domain: 'financial',
    severity: 'medium',
    specificity: 80,
    description: 'Context-verified 8 or 11 character ISO 9362 SWIFT/BIC codes.',
  },

  // Domain 4: Government, Tax & Healthcare Regulated IDs
  US_SSN: {
    type: 'US_SSN',
    label: 'US Social Security Number (SSN)',
    shortPrefix: 'US_SSN',
    domain: 'government_id',
    severity: 'critical',
    specificity: 89,
    description: 'US Social Security Numbers validated against SSA area/group/serial rules.',
  },
  PK_NADRA_CNIC: {
    type: 'PK_NADRA_CNIC',
    label: 'Pakistani NADRA CNIC Number',
    shortPrefix: 'PK_CNIC',
    domain: 'government_id',
    severity: 'critical',
    specificity: 89,
    description: '13-digit Pakistani Computerized National Identity Card (XXXXX-XXXXXXX-X).',
  },
  UK_NINO: {
    type: 'UK_NINO',
    label: 'UK National Insurance Number (NINO)',
    shortPrefix: 'UK_NINO',
    domain: 'government_id',
    severity: 'critical',
    specificity: 89,
    description: 'United Kingdom HMRC National Insurance numbers.',
  },
  CA_SIN: {
    type: 'CA_SIN',
    label: 'Canadian Social Insurance Number (SIN)',
    shortPrefix: 'CA_SIN',
    domain: 'government_id',
    severity: 'critical',
    specificity: 87,
    description: 'Context-gated 9-digit Canadian SIN verified via Luhn checksum.',
  },
  IN_PAN_TAX_ID: {
    type: 'IN_PAN_TAX_ID',
    label: 'Indian Income Tax PAN Card',
    shortPrefix: 'IN_PAN',
    domain: 'government_id',
    severity: 'high',
    specificity: 86,
    description: '10-character Indian Income Tax Permanent Account Number (ABCDE1234F).',
  },
  MEDICAL_RECORD_MRN: {
    type: 'MEDICAL_RECORD_MRN',
    label: 'Medical Record / Patient ID (HIPAA)',
    shortPrefix: 'PATIENT_MRN',
    domain: 'government_id',
    severity: 'critical',
    specificity: 85,
    description: 'HIPAA Safe Harbor medical record numbers (MRN) and patient identifiers.',
  },

  // Domain 2: Personal Contact & Hybrid Local NER
  EMAIL_ADDRESS: {
    type: 'EMAIL_ADDRESS',
    label: 'Email Address',
    shortPrefix: 'EMAIL',
    domain: 'personal_ner',
    severity: 'high',
    specificity: 88,
    description: 'Personal and corporate RFC 5322 email addresses.',
  },
  PHONE_NUMBER: {
    type: 'PHONE_NUMBER',
    label: 'Phone / Mobile Number (Intl & Local)',
    shortPrefix: 'PHONE',
    domain: 'personal_ner',
    severity: 'high',
    specificity: 82,
    description: 'E.164 international and domestic formatted telephone numbers.',
  },
  PERSON_NAME: {
    type: 'PERSON_NAME',
    label: 'Person Name (Hybrid Local NER)',
    shortPrefix: 'PERSON',
    domain: 'personal_ner',
    severity: 'high',
    specificity: 78,
    description: 'Human names detected via honorifics, salutations, contract clauses, and JSON/CSV keys.',
  },
  ORGANIZATION_NAME: {
    type: 'ORGANIZATION_NAME',
    label: 'Company / Organization Name (Local NER)',
    shortPrefix: 'ORG',
    domain: 'personal_ner',
    severity: 'medium',
    specificity: 77,
    description: 'Corporate entities detected via legal suffixes (Inc., LLC, Ltd., GmbH, Pvt. Ltd.) and keys.',
  },
  STREET_ADDRESS: {
    type: 'STREET_ADDRESS',
    label: 'Physical Street Address',
    shortPrefix: 'ADDRESS',
    domain: 'personal_ner',
    severity: 'high',
    specificity: 79,
    description: 'Street numbers and thoroughfares (St, Ave, Rd, Blvd, Suite, Apt).',
  },
  DATE_OF_BIRTH: {
    type: 'DATE_OF_BIRTH',
    label: 'Date of Birth (Context-Verified)',
    shortPrefix: 'DOB',
    domain: 'personal_ner',
    severity: 'high',
    specificity: 81,
    description: 'Birthdates verified by surrounding DOB/Birth labels (ignores log timestamps).',
  },

  // Domain 5: Network & Infrastructure
  SENSITIVE_QUERY_URL: {
    type: 'SENSITIVE_QUERY_URL',
    label: 'URL with Auth/Token Query Params',
    shortPrefix: 'SENSITIVE_URL',
    domain: 'network',
    severity: 'high',
    specificity: 86,
    description: 'URLs containing sensitive query parameters (?token=, ?key=, ?sig=, ?password=).',
  },
  IPV6_ADDRESS: {
    type: 'IPV6_ADDRESS',
    label: 'IPv6 Network Address',
    shortPrefix: 'IPV6',
    domain: 'network',
    severity: 'medium',
    specificity: 76,
    description: 'Standard and compressed 128-bit IPv6 network addresses.',
  },
  IPV4_ADDRESS: {
    type: 'IPV4_ADDRESS',
    label: 'IPv4 Network Address',
    shortPrefix: 'IPV4',
    domain: 'network',
    severity: 'medium',
    specificity: 75,
    description: 'Octet-validated IPv4 addresses (0–255).',
  },
  MAC_ADDRESS: {
    type: 'MAC_ADDRESS',
    label: 'Hardware MAC Address',
    shortPrefix: 'MAC_ADDR',
    domain: 'network',
    severity: 'low',
    specificity: 74,
    description: '6-byte IEEE 802 hardware MAC addresses.',
  },

  // Domain 6: Custom Rules
  CUSTOM_PATTERN: {
    type: 'CUSTOM_PATTERN',
    label: 'Custom Rule / Organization Keyword',
    shortPrefix: 'CUSTOM',
    domain: 'custom',
    severity: 'high',
    specificity: 99,
    description: 'User-defined custom regular expression or confidential project keyword.',
  },
};

export const ALL_PII_ENTITY_TYPES = Object.keys(PII_ENTITY_REGISTRY) as PiiEntityType[];

// ============================================================================
// MATHEMATICAL CHECKSUM VALIDATORS (LUHN, ISO 7064 MOD-97, ABA, SSN)
// ============================================================================

export function validateLuhnChecksum(digitsOnly: string): boolean {
  if (!/^\d{9,19}$/.test(digitsOnly)) return false;
  if (/^(\d)\1+$/.test(digitsOnly)) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let i = digitsOnly.length - 1; i >= 0; i--) {
    let digit = digitsOnly.charCodeAt(i) - 48;
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function detectCardBrand(digitsOnly: string): string {
  if (/^4\d{12,18}$/.test(digitsOnly)) return 'Visa';
  if (/^(5[1-5]\d{14}|2(22[1-9]|2[3-9]\d|[3-6]\d{2}|7[01]\d|720)\d{12})$/.test(digitsOnly))
    return 'Mastercard';
  if (/^3[47]\d{13}$/.test(digitsOnly)) return 'American Express';
  if (/^6(?:011|5\d{2}|4[4-9]\d)\d{12,15}$/.test(digitsOnly)) return 'Discover';
  if (/^(?:2131|1800|35\d{3})\d{11}$/.test(digitsOnly)) return 'JCB';
  return 'Payment Card';
}

export function validateIbanMod97(rawIban: string): boolean {
  const cleaned = rawIban.replace(/[\s-]+/g, '').toUpperCase();
  if (cleaned.length < 15 || cleaned.length > 34) return false;
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(cleaned)) return false;

  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  let remainder = 0;
  for (let i = 0; i < rearranged.length; i++) {
    const code = rearranged.charCodeAt(i);
    if (code >= 48 && code <= 57) {
      remainder = (remainder * 10 + (code - 48)) % 97;
    } else if (code >= 65 && code <= 90) {
      const val = code - 55;
      remainder = (remainder * 100 + val) % 97;
    } else {
      return false;
    }
  }
  return remainder === 1;
}

export function validateAbaRoutingNumber(digits: string): boolean {
  if (!/^\d{9}$/.test(digits)) return false;
  const firstTwo = Number(digits.slice(0, 2));
  const validPrefix =
    (firstTwo >= 0 && firstTwo <= 12) ||
    (firstTwo >= 21 && firstTwo <= 32) ||
    (firstTwo >= 61 && firstTwo <= 72) ||
    firstTwo === 80;
  if (!validPrefix) return false;

  const d = digits.split('').map(Number);
  const checksum =
    3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + 1 * (d[2] + d[5] + d[8]);
  return checksum > 0 && checksum % 10 === 0;
}

export function validateUsSsn(rawSsn: string): boolean {
  const digits = rawSsn.replace(/[\s-]+/g, '');
  if (!/^\d{9}$/.test(digits)) return false;
  const area = Number(digits.slice(0, 3));
  const group = Number(digits.slice(3, 5));
  const serial = Number(digits.slice(5, 9));
  if (area === 0 || area === 666 || area >= 900) return false;
  if (group === 0 || serial === 0) return false;
  if (digits === '123456789' || /^(\d)\1{8}$/.test(digits)) return false;
  return true;
}

export function isPrivateOrLoopbackIpv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return false;
  if (parts[0] === 127 || parts[0] === 10 || parts[0] === 0) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 169 && parts[1] === 254) return true;
  return false;
}

// ============================================================================
// PRESETS & DEFAULT CONFIGURATION
// ============================================================================

export function getDefaultPiiOptions(preset: PiiPresetId = 'ai_prompt_reversible'): PiiRedactorOptions {
  const allEnabled = {} as Record<PiiEntityType, boolean>;
  for (const t of ALL_PII_ENTITY_TYPES) {
    allEnabled[t] = true;
  }

  switch (preset) {
    case 'devops_log_scrubber':
      return {
        preset,
        maskingMode: 'token',
        enabledTypes: {
          ...allEnabled,
          PERSON_NAME: false,
          ORGANIZATION_NAME: false,
        },
        categoryModeOverrides: {},
        preserveLoopbackAndPrivateIps: true,
        enableStructureAwareKeyScan: true,
        enableHybridLocalNer: false,
        includeAiSystemPromptWrapper: false,
        hashSalt: 'kivarotools-v2-salt',
        whitelistedValues: [],
        customTokenOverrides: {},
        customRules: [],
      };

    case 'legal_contract_nda':
      return {
        preset,
        maskingMode: 'token',
        enabledTypes: allEnabled,
        categoryModeOverrides: {},
        preserveLoopbackAndPrivateIps: false,
        enableStructureAwareKeyScan: true,
        enableHybridLocalNer: true,
        includeAiSystemPromptWrapper: true,
        hashSalt: 'kivarotools-v2-salt',
        whitelistedValues: [],
        customTokenOverrides: {},
        customRules: [],
      };

    case 'hipaa_clinical_safe':
      return {
        preset,
        maskingMode: 'token',
        enabledTypes: allEnabled,
        categoryModeOverrides: {},
        preserveLoopbackAndPrivateIps: false,
        enableStructureAwareKeyScan: true,
        enableHybridLocalNer: true,
        includeAiSystemPromptWrapper: true,
        hashSalt: 'kivarotools-v2-salt',
        whitelistedValues: [],
        customTokenOverrides: {},
        customRules: [],
      };

    case 'pci_financial_support':
      return {
        preset,
        maskingMode: 'partial',
        enabledTypes: allEnabled,
        categoryModeOverrides: {
          secrets: 'redact',
          financial: 'partial',
        },
        preserveLoopbackAndPrivateIps: true,
        enableStructureAwareKeyScan: true,
        enableHybridLocalNer: true,
        includeAiSystemPromptWrapper: false,
        hashSalt: 'kivarotools-v2-salt',
        whitelistedValues: [],
        customTokenOverrides: {},
        customRules: [],
      };

    case 'csv_json_dataset_synthetic':
      return {
        preset,
        maskingMode: 'synthetic',
        enabledTypes: allEnabled,
        categoryModeOverrides: {},
        preserveLoopbackAndPrivateIps: true,
        enableStructureAwareKeyScan: true,
        enableHybridLocalNer: true,
        includeAiSystemPromptWrapper: false,
        hashSalt: 'kivarotools-v2-salt',
        whitelistedValues: [],
        customTokenOverrides: {},
        customRules: [],
      };

    case 'ai_prompt_reversible':
    default:
      return {
        preset: 'ai_prompt_reversible',
        maskingMode: 'token',
        enabledTypes: allEnabled,
        categoryModeOverrides: {},
        preserveLoopbackAndPrivateIps: true,
        enableStructureAwareKeyScan: true,
        enableHybridLocalNer: true,
        includeAiSystemPromptWrapper: true,
        hashSalt: 'kivarotools-v2-salt',
        whitelistedValues: [],
        customTokenOverrides: {},
        customRules: [],
      };
  }
}

// ============================================================================
// SYNTHETIC FAKER & MASKING FORMATTERS
// ============================================================================

const SYNTHETIC_NAMES = [
  'Alex Morgan',
  'Jordan Taylor',
  'Samira Patel',
  'Liam OConnor',
  'Elena Rostova',
  'Tariq Mahmood',
  'Hannah Chen',
  'Marcus Vance',
];

const SYNTHETIC_ORGS = [
  'ExampleCorp Inc.',
  'Northwind Systems LLC',
  'Contoso Global Ltd.',
  'Apex Horizon GmbH',
  'Vertex Solutions Corp.',
];

export function generateSyntheticValue(type: PiiEntityType, index1Based: number): string {
  const pad = String(index1Based).padStart(2, '0');
  switch (type) {
    case 'EMAIL_ADDRESS':
      return `user${pad}@example.org`;
    case 'PHONE_NUMBER':
      return `+1-555-01${pad}`;
    case 'PERSON_NAME':
      return SYNTHETIC_NAMES[(index1Based - 1) % SYNTHETIC_NAMES.length];
    case 'ORGANIZATION_NAME':
      return SYNTHETIC_ORGS[(index1Based - 1) % SYNTHETIC_ORGS.length];
    case 'STREET_ADDRESS':
      return `${100 + index1Based} Example Blvd, Suite ${index1Based}00`;
    case 'DATE_OF_BIRTH':
      return `1990-01-${String((index1Based % 28) + 1).padStart(2, '0')}`;
    case 'CREDIT_CARD':
      return `4111-1111-1111-11${pad}`;
    case 'IBAN_ACCOUNT':
      return `GB29NWBK601613319268${pad}`;
    case 'US_ABA_ROUTING':
      return `021000021`;
    case 'CRYPTO_WALLET':
      return `0x00000000000000000000000000000000000000${pad}`;
    case 'SWIFT_BIC':
      return `EXMPUS33XXX`;
    case 'US_SSN':
      return `000-00-00${pad}`;
    case 'PK_NADRA_CNIC':
      return `00000-00000${pad}-0`;
    case 'UK_NINO':
      return `AA0000${pad}A`;
    case 'CA_SIN':
      return `000-000-0${pad}`;
    case 'IN_PAN_TAX_ID':
      return `AAAAA00${pad}A`;
    case 'MEDICAL_RECORD_MRN':
      return `MRN-0000${pad}`;
    case 'IPV4_ADDRESS':
      return `198.51.100.${index1Based % 254 || 1}`;
    case 'IPV6_ADDRESS':
      return `2001:db8::${index1Based}`;
    case 'MAC_ADDRESS':
      return `00:00:5E:00:53:${pad}`;
    case 'OPENAI_API_KEY':
      return `sk-proj-SYNTHETIC_OPENAI_KEY_${pad}`;
    case 'ANTHROPIC_API_KEY':
      return `sk-ant-SYNTHETIC_CLAUDE_KEY_${pad}`;
    case 'AWS_ACCESS_KEY':
      return `AKIAIOSFODNN7EXMPL${pad}`;
    case 'GITHUB_TOKEN':
      return `ghp_SYNTHETIC_GITHUB_TOKEN_${pad}`;
    case 'STRIPE_KEY':
      return `sk_test_SYNTHETIC_STRIPE_${pad}`;
    case 'SLACK_TOKEN':
      return `xoxb-000000000-SYNTHETIC-${pad}`;
    case 'GOOGLE_CLOUD_KEY':
      return `AIzaSySYNTHETIC_GCP_KEY_${pad}`;
    case 'JWT_TOKEN':
      return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.SYNTHETIC_JWT_${pad}`;
    case 'PRIVATE_KEY_PEM':
      return `-----BEGIN PRIVATE KEY-----[SYNTHETIC_PEM_${pad}]-----END PRIVATE KEY-----`;
    case 'DB_CONNECTION_URI':
      return `postgres://db_user_${pad}:REDACTED_PASS@db.example.internal:5432/app`;
    default:
      return `SYNTHETIC_${PII_ENTITY_REGISTRY[type]?.shortPrefix || 'VAL'}_${pad}`;
  }
}

export function formatPartialMask(rawValue: string, type: PiiEntityType): string {
  if (type === 'EMAIL_ADDRESS') {
    const atIdx = rawValue.indexOf('@');
    if (atIdx > 0) {
      const local = rawValue.slice(0, atIdx);
      const domain = rawValue.slice(atIdx + 1);
      const dotIdx = domain.lastIndexOf('.');
      const tld = dotIdx > 0 ? domain.slice(dotIdx) : '';
      return `${local[0]}••••@••••${tld}`;
    }
  }
  if (
    type === 'CREDIT_CARD' ||
    type === 'PHONE_NUMBER' ||
    type === 'US_SSN' ||
    type === 'PK_NADRA_CNIC'
  ) {
    const last4 = rawValue.slice(-4);
    return `••••-••••-${last4}`;
  }
  if (rawValue.length <= 6) {
    return `${rawValue[0] || ''}••••`;
  }
  return `${rawValue.slice(0, 3)}••••${rawValue.slice(-2)}`;
}

// ============================================================================
// HYBRID LOCAL NER STOPWORDS & TECHNICAL EXCLUSION SET
// ============================================================================

const NER_STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'these', 'those', 'have', 'has',
  'had', 'not', 'but', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why',
  'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
  'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now', 'error', 'warning',
  'info', 'debug', 'trace', 'fatal', 'exception', 'null', 'undefined', 'true', 'false',
  'select', 'insert', 'update', 'delete', 'create', 'drop', 'alter', 'table', 'database',
  'index', 'view', 'trigger', 'procedure', 'function', 'return', 'const', 'let', 'var',
  'import', 'export', 'default', 'class', 'interface', 'type', 'enum', 'async', 'await',
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september',
  'october', 'november', 'december', 'street', 'avenue', 'boulevard', 'road', 'lane',
  'drive', 'suite', 'North', 'South', 'East', 'West', 'Dear', 'Regards', 'Sincerely',
  'Thanks', 'Hello', 'Hi', 'Customer', 'Patient', 'Client', 'User', 'Admin', 'Server',
  'Bearer', 'Basic', 'Token', 'Secret', 'Password', 'Email', 'Phone', 'Address',
]);

function isLikelyPersonNameCandidate(candidate: string): boolean {
  const trimmed = candidate.trim();
  if (trimmed.length < 3 || trimmed.length > 48) return false;
  const words = trimmed.split(/[ \t]+/);
  if (words.length < 1 || words.length > 4) return false;
  for (const w of words) {
    const clean = w.replace(/[.,'-]/g, '');
    if (!clean || clean.length < 2) return false;
    if (!/^[A-Z][a-zA-Z'-]+$/.test(clean)) return false;
    if (NER_STOPWORDS.has(clean) || NER_STOPWORDS.has(clean.toLowerCase())) return false;
  }
  return true;
}

// ============================================================================
// CORE CANDIDATE SCANNER (34 BUILT-IN DETECTORS + STRUCTURE-AWARE + NER)
// ============================================================================

interface RawCandidateSpan {
  entityType: PiiEntityType;
  rawValue: string;
  canonicalKeyValue?: string; // Groups "Dr. Sarah Jenkins" and "Sarah Jenkins" under same token
  customPrefix?: string; // Custom label from Tab 4 CustomRedactionRule
  startOffset: number;
  endOffset: number;
  specificity: number;
  validationMethod: string;
}

function collectCandidateSpans(text: string, options: PiiRedactorOptions): RawCandidateSpan[] {
  const candidates: RawCandidateSpan[] = [];

  const addCandidate = (
    entityType: PiiEntityType,
    rawValue: string,
    startOffset: number,
    validationMethod: string,
    customSpecificity?: number,
    customPrefix?: string,
    canonicalKeyValue?: string
  ) => {
    if (!options.enabledTypes[entityType]) return;
    if (!rawValue || rawValue.length === 0) return;
    const meta = PII_ENTITY_REGISTRY[entityType];
    candidates.push({
      entityType,
      rawValue,
      canonicalKeyValue,
      customPrefix,
      startOffset,
      endOffset: startOffset + rawValue.length,
      specificity: customSpecificity ?? meta.specificity,
      validationMethod,
    });
  };

  // 1. Custom User Rules (Highest specificity = 99, preserves custom rule label prefix)
  for (const rule of options.customRules) {
    if (!rule.enabled || !rule.pattern.trim()) continue;
    try {
      const flags = rule.caseSensitive ? 'g' : 'gi';
      const source = rule.isRegex
        ? rule.pattern
        : rule.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(source, flags);
      let m: RegExpExecArray | null;
      while ((m = regex.exec(text)) !== null) {
        if (m[0].length === 0) {
          regex.lastIndex++;
          continue;
        }
        addCandidate(
          'CUSTOM_PATTERN',
          m[0],
          m.index,
          `Matched Custom Rule "${rule.label}"`,
          99,
          rule.label
        );
      }
    } catch {
      // Ignore invalid user regex
    }
  }

  // 2. PEM Private Keys
  {
    const pemRegex =
      /-----BEGIN (?:RSA |EC |DSA |OPENSSH |ENCRYPTED )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |DSA |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/g;
    let m: RegExpExecArray | null;
    while ((m = pemRegex.exec(text)) !== null) {
      addCandidate('PRIVATE_KEY_PEM', m[0], m.index, 'PEM Cryptographic Block Header/Footer');
    }
  }

  // 3. Database Connection URIs with credentials
  {
    const dbUriRegex =
      /\b(?:postgres(?:ql)?|mongodb(?:\+srv)?|mysql|redis(?:s)?|amqp(?:s)?):\/\/[^:\s"'`]+:[^@\s"'`]+@[^\s"'`]+/gi;
    let m: RegExpExecArray | null;
    while ((m = dbUriRegex.exec(text)) !== null) {
      addCandidate('DB_CONNECTION_URI', m[0], m.index, 'Database Connection String with Password');
    }
  }

  // 4. JSON Web Tokens (JWT)
  {
    const jwtRegex = /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g;
    let m: RegExpExecArray | null;
    while ((m = jwtRegex.exec(text)) !== null) {
      addCandidate('JWT_TOKEN', m[0], m.index, '3-Part Base64URL JWT Header/Payload Signature');
    }
  }

  // 5. Anthropic API Keys (sk-ant-)
  {
    const antRegex = /\bsk-ant-[A-Za-z0-9_-]{16,120}\b/g;
    let m: RegExpExecArray | null;
    while ((m = antRegex.exec(text)) !== null) {
      addCandidate('ANTHROPIC_API_KEY', m[0], m.index, 'Anthropic sk-ant- Prefix Match');
    }
  }

  // 6. OpenAI API Keys (sk-proj-, sk-svcacct-, sk-)
  {
    const oaiRegex = /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,160}\b/g;
    let m: RegExpExecArray | null;
    while ((m = oaiRegex.exec(text)) !== null) {
      if (m[0].startsWith('sk-ant-')) continue;
      addCandidate('OPENAI_API_KEY', m[0], m.index, 'OpenAI Secret Key Prefix Match');
    }
  }

  // 7. AWS Access Key IDs
  {
    const awsRegex = /\b(?:AKIA|ASIA|AROA|AIDA|ANPA|ANVA|AGPA)[0-9A-Z]{16}\b/g;
    let m: RegExpExecArray | null;
    while ((m = awsRegex.exec(text)) !== null) {
      addCandidate('AWS_ACCESS_KEY', m[0], m.index, 'AWS IAM 20-Character Access Key ID');
    }
  }

  // 8. GitHub PAT & OAuth Tokens
  {
    const ghRegex =
      /\b(?:ghp_[A-Za-z0-9]{20,60}|gho_[A-Za-z0-9]{20,60}|ghu_[A-Za-z0-9]{20,60}|ghs_[A-Za-z0-9]{20,60}|github_pat_[A-Za-z0-9_]{22,100})\b/g;
    let m: RegExpExecArray | null;
    while ((m = ghRegex.exec(text)) !== null) {
      addCandidate('GITHUB_TOKEN', m[0], m.index, 'GitHub Token Prefix Match');
    }
  }

  // 9. Stripe Secret, Restricted & Webhook Keys
  {
    const stripeRegex =
      /\b(?:sk_live_|rk_live_|pk_live_|sk_test_|rk_test_|whsec_)[0-9a-zA-Z]{16,99}\b/g;
    let m: RegExpExecArray | null;
    while ((m = stripeRegex.exec(text)) !== null) {
      addCandidate('STRIPE_KEY', m[0], m.index, 'Stripe API / Webhook Secret Prefix');
    }
  }

  // 10. Slack Tokens & Webhooks
  {
    const slackRegex =
      /\b(?:xox[baprs]-[0-9a-zA-Z-]{16,90}|https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[A-Za-z0-9]+)\b/g;
    let m: RegExpExecArray | null;
    while ((m = slackRegex.exec(text)) !== null) {
      addCandidate('SLACK_TOKEN', m[0], m.index, 'Slack Token / Webhook Pattern');
    }
  }

  // 11. Google Cloud / Firebase AIza Keys
  {
    const gcpRegex = /\bAIza[0-9A-Za-z_-]{35}\b/g;
    let m: RegExpExecArray | null;
    while ((m = gcpRegex.exec(text)) !== null) {
      addCandidate('GOOGLE_CLOUD_KEY', m[0], m.index, 'Google Cloud AIza 39-Char Key');
    }
  }

  // 12. Authorization Bearer / Basic Headers
  {
    const bearerRegex =
      /\b(?:Authorization[ \t]*:[ \t]*)?(?:Bearer|Basic)[ \t]+([A-Za-z0-9._~+/=-]{16,500})/gi;
    let m: RegExpExecArray | null;
    while ((m = bearerRegex.exec(text)) !== null) {
      const tokenVal = m[1];
      const tokenStart = m.index + m[0].lastIndexOf(tokenVal);
      if (!tokenVal.startsWith('eyJ')) {
        addCandidate('BEARER_AUTH_HEADER', tokenVal, tokenStart, 'HTTP Authorization Credential');
      }
    }
  }

  // 13. Structure-Aware Generic Secret Key-Value Assignments (JSON, YAML, .env, Logs)
  if (options.enableStructureAwareKeyScan) {
    const secretKvRegex =
      /(?:["']?(?:password|passwd|pwd|client_secret|api_secret|api_key|apikey|access_token|refresh_token|private_key|secret_key|webhook_secret|auth_token|encryption_key|master_key|db_pass|database_password)["']?[ \t]*(?::|=)[ \t]*)(["']([^"'\r\n]{6,180})["']|([^\s,"'}\r\n]{6,180}))/gi;
    let m: RegExpExecArray | null;
    while ((m = secretKvRegex.exec(text)) !== null) {
      const rawSecret = m[2] ?? m[3];
      if (!rawSecret || /^\[.*\]$/.test(rawSecret) || rawSecret === 'REDACTED') continue;
      const valStart = m.index + m[0].lastIndexOf(rawSecret);
      addCandidate(
        'GENERIC_SECRET_KV',
        rawSecret,
        valStart,
        'Structure-Aware Secret Key-Value Inspection'
      );
    }
  }

  // 14. Email Addresses (RFC 5322 practical pattern)
  {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,24}\b/g;
    let m: RegExpExecArray | null;
    while ((m = emailRegex.exec(text)) !== null) {
      addCandidate('EMAIL_ADDRESS', m[0], m.index, 'RFC 5322 Email Pattern');
    }
  }

  // 15. URLs with Sensitive Query Parameters (?token=, ?key=, ?password=, ?sig=, ?session=)
  {
    const urlRegex =
      /\bhttps?:\/\/[^\s"'<>]+?\?(?:[^\s"'<>]*&)?(?:token|access_token|api_key|key|secret|password|sig|signature|session_id|code)=([^\s"'&#<>]+)/gi;
    let m: RegExpExecArray | null;
    while ((m = urlRegex.exec(text)) !== null) {
      addCandidate('SENSITIVE_QUERY_URL', m[0], m.index, 'URL Containing Sensitive Query Parameter');
    }
  }

  // 16. Credit Card Numbers (13–19 digits, Luhn Checksum Verified, horizontal space/dash only)
  {
    const ccRegex = /\b(?:\d[ \t-]*?){13,19}\b/g;
    let m: RegExpExecArray | null;
    while ((m = ccRegex.exec(text)) !== null) {
      const raw = m[0].trim();
      const digits = raw.replace(/\D/g, '');
      if (digits.length >= 13 && digits.length <= 19 && validateLuhnChecksum(digits)) {
        const brand = detectCardBrand(digits);
        addCandidate('CREDIT_CARD', raw, m.index, `Luhn Checksum Passed (${brand})`);
      }
    }
  }

  // 17. IBAN International Bank Account Numbers (ISO 7064 Mod-97-10 Verified)
  {
    const ibanRegex = /\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]{4}){2,7}(?:[ ]?[A-Z0-9]{1,4})?\b/g;
    let m: RegExpExecArray | null;
    while ((m = ibanRegex.exec(text)) !== null) {
      const candidate = m[0].trim();
      if (validateIbanMod97(candidate)) {
        addCandidate('IBAN_ACCOUNT', candidate, m.index, 'ISO 7064 Mod-97-10 Checksum Passed');
      }
    }
  }

  // 18. US ABA Routing Numbers (Context-gated + ABA Checksum)
  {
    const abaRegex =
      /(?:routing(?:[ \t]+number|[ \t]*#)?|aba|rtn)[ \t]*(?::|=|is)?[ \t]*["']?(\b\d{9}\b)["']?/gi;
    let m: RegExpExecArray | null;
    while ((m = abaRegex.exec(text)) !== null) {
      const digits = m[1];
      if (validateAbaRoutingNumber(digits)) {
        const start = m.index + m[0].lastIndexOf(digits);
        addCandidate('US_ABA_ROUTING', digits, start, 'ABA Routing Checksum Passed');
      }
    }
  }

  // 19. Crypto Wallet Addresses (ETH 0x + BTC Bech32/Base58)
  {
    const cryptoRegex =
      /\b(?:0x[a-fA-F0-9]{40}|bc1[ac-hj-np-z02-9]{25,87}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})\b/g;
    let m: RegExpExecArray | null;
    while ((m = cryptoRegex.exec(text)) !== null) {
      addCandidate('CRYPTO_WALLET', m[0], m.index, 'Cryptocurrency Wallet Address Pattern');
    }
  }

  // 20. Context-Gated SWIFT / BIC Codes
  {
    const swiftRegex =
      /(?:swift|bic(?:[ \t]+code)?)[ \t]*(?::|=|is)?[ \t]*["']?\b([A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?)\b["']?/gi;
    let m: RegExpExecArray | null;
    while ((m = swiftRegex.exec(text)) !== null) {
      const code = m[1];
      const start = m.index + m[0].lastIndexOf(code);
      addCandidate('SWIFT_BIC', code, start, 'ISO 9362 SWIFT/BIC Code');
    }
  }

  // 21. Pakistani NADRA CNIC (XXXXX-XXXXXXX-X)
  {
    const cnicRegex = /\b\d{5}-\d{7}-\d\b/g;
    let m: RegExpExecArray | null;
    while ((m = cnicRegex.exec(text)) !== null) {
      addCandidate('PK_NADRA_CNIC', m[0], m.index, 'NADRA 13-Digit CNIC Format');
    }
  }

  // 22. US Social Security Number (SSN — XXX-XX-XXXX or context-gated 9 digits)
  {
    const ssnDashRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
    let m: RegExpExecArray | null;
    while ((m = ssnDashRegex.exec(text)) !== null) {
      if (validateUsSsn(m[0])) {
        addCandidate('US_SSN', m[0], m.index, 'SSA Validated US SSN Format');
      }
    }
    const ssnCtxRegex =
      /(?:ssn|social[ \t]+security(?:[ \t]+number|[ \t]*#)?)[ \t]*(?::|=|is)?[ \t]*["']?(\d{3}[ -]?\d{2}[ -]?\d{4})["']?/gi;
    while ((m = ssnCtxRegex.exec(text)) !== null) {
      if (validateUsSsn(m[1])) {
        const start = m.index + m[0].lastIndexOf(m[1]);
        addCandidate('US_SSN', m[1], start, 'Context + SSA Validated US SSN');
      }
    }
  }

  // 23. UK National Insurance Number (NINO — horizontal spaces only)
  {
    const ninoRegex =
      /\b(?!BG|GB|NK|KN|TN|NT|ZZ)[A-CEGHJ-PR-TW-ZQ][A-CEGHJ-NPR-TW-ZQ][ \t]?\d{2}[ \t]?\d{2}[ \t]?\d{2}[ \t]?[A-D]\b/g;
    let m: RegExpExecArray | null;
    while ((m = ninoRegex.exec(text)) !== null) {
      addCandidate('UK_NINO', m[0], m.index, 'HMRC UK National Insurance Format');
    }
  }

  // 24. Canadian Social Insurance Number (CA SIN — Context-gated + Luhn)
  {
    const sinRegex =
      /(?:sin|social[ \t]+insurance)[ \t]*(?::|=|is)?[ \t]*["']?(\d{3}[ -]?\d{3}[ -]?\d{3})["']?/gi;
    let m: RegExpExecArray | null;
    while ((m = sinRegex.exec(text)) !== null) {
      const digits = m[1].replace(/\D/g, '');
      if (validateLuhnChecksum(digits)) {
        const start = m.index + m[0].lastIndexOf(m[1]);
        addCandidate('CA_SIN', m[1], start, 'Luhn-Verified Canadian SIN');
      }
    }
  }

  // 25. Indian Income Tax PAN Card ([A-Z]{5}[0-9]{4}[A-Z])
  {
    const panRegex = /\b[A-Z]{3}[PCHFATBLJG][A-Z][0-9]{4}[A-Z]\b/g;
    let m: RegExpExecArray | null;
    while ((m = panRegex.exec(text)) !== null) {
      addCandidate('IN_PAN_TAX_ID', m[0], m.index, 'Indian Income Tax PAN Format');
    }
  }

  // 26. Medical Record Numbers (MRN / Patient ID — HIPAA Context)
  {
    const mrnRegex =
      /(?:mrn|medical[ \t]+record(?:[ \t]+number|[ \t]*#)?|patient[_\t -]?id)[ \t]*(?::|=|is|#)?[ \t]*["']?([A-Z0-9-]{5,20})["']?/gi;
    let m: RegExpExecArray | null;
    while ((m = mrnRegex.exec(text)) !== null) {
      const val = m[1];
      if (/\d/.test(val)) {
        const start = m.index + m[0].lastIndexOf(val);
        addCandidate('MEDICAL_RECORD_MRN', val, start, 'HIPAA Clinical Identifier Context');
      }
    }
  }

  // 27. Context-Verified Date of Birth (Never flags log timestamps!)
  {
    const dobRegex =
      /(?:dob|date[_\t -]?of[_\t -]?birth|birth[_\t -]?date|born(?:[ \t]+on)?)[ \t]*(?::|=|is)?[ \t]*["']?(\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})["']?/gi;
    let m: RegExpExecArray | null;
    while ((m = dobRegex.exec(text)) !== null) {
      const val = m[1];
      const start = m.index + m[0].lastIndexOf(val);
      addCandidate('DATE_OF_BIRTH', val, start, 'Context-Verified Date of Birth');
    }
  }

  // 28. Phone Numbers (E.164 International + US/UK/PK/IN formatted, horizontal whitespace only)
  {
    const phoneRegex =
      /(?:\+\d{1,3}[ \t.-]?\(?\d{2,4}\)?[ \t.-]?\d{3,4}[ \t.-]?\d{3,5}|\(\d{3}\)[ \t.-]?\d{3}[ \t.-]\d{4}|\b(?:03\d{2}|[2-9]\d{2})[-. \t]\d{3}[-. \t]\d{4}\b|\b03\d{2}-\d{7}\b)/g;
    let m: RegExpExecArray | null;
    while ((m = phoneRegex.exec(text)) !== null) {
      const raw = m[0].trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) continue;
      const digits = raw.replace(/\D/g, '');
      if (digits.length >= 10 && digits.length <= 15) {
        addCandidate('PHONE_NUMBER', raw, m.index, 'Formatted Telephone / E.164 Pattern');
      }
    }
  }

  // 29. IPv4 Addresses (Octet Range 0–255 Verified)
  {
    const ipv4Regex =
      /\b(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b/g;
    let m: RegExpExecArray | null;
    while ((m = ipv4Regex.exec(text)) !== null) {
      const ip = m[0];
      if (m.index > 0 && /[vV]/.test(text[m.index - 1])) continue;
      if (options.preserveLoopbackAndPrivateIps && isPrivateOrLoopbackIpv4(ip)) {
        continue;
      }
      addCandidate('IPV4_ADDRESS', ip, m.index, 'Octet-Validated IPv4 Address');
    }
  }

  // 30. IPv6 Addresses
  {
    const ipv6Regex =
      /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b|\b(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}\b/g;
    let m: RegExpExecArray | null;
    while ((m = ipv6Regex.exec(text)) !== null) {
      if (options.preserveLoopbackAndPrivateIps && m[0] === '::1') continue;
      addCandidate('IPV6_ADDRESS', m[0], m.index, 'RFC 4291 IPv6 Address');
    }
  }

  // 31. MAC Addresses
  {
    const macRegex = /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/g;
    let m: RegExpExecArray | null;
    while ((m = macRegex.exec(text)) !== null) {
      addCandidate('MAC_ADDRESS', m[0], m.index, 'IEEE 802 Hardware MAC Address');
    }
  }

  // 32. Physical Street Addresses (horizontal whitespace only)
  {
    const addressRegex =
      /\b\d{1,6}[ \t]+(?:[A-Z][a-zA-Z0-9.]*[ \t]+){1,4}(?:Street|St\.?|Avenue|Ave\.?|Boulevard|Blvd\.?|Road|Rd\.?|Lane|Ln\.?|Drive|Dr\.?|Parkway|Pkwy\.?|Court|Ct\.?|Way)(?:[ \t]*,?[ \t]*(?:Suite|Ste\.?|Apt\.?|Unit|#)[ \t]*[A-Za-z0-9-]+)?/g;
    let m: RegExpExecArray | null;
    while ((m = addressRegex.exec(text)) !== null) {
      addCandidate('STREET_ADDRESS', m[0].trim(), m.index, 'Street Number + Thoroughfare Suffix');
    }
  }

  // Track discovered bare person names for Two-Pass Coreference Resolution across the document
  const discoveredBarePersonNames = new Set<string>();

  // 33. Hybrid Local NER + Two-Pass Coreference Engine (Person Names & Organizations)
  if (options.enableHybridLocalNer) {
    // 33A: Honorific-prefixed Person Names (Mr., Mrs., Ms., Dr., Prof., Engr. — horizontal space only)
    const honorificRegex =
      /\b(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Prof\.?|Engr\.?)[ \t]+([A-Z][a-zA-Z'-]{1,20}(?:[ \t]+[A-Z][a-zA-Z'-]{1,20}){0,2})\b/g;
    let m: RegExpExecArray | null;
    while ((m = honorificRegex.exec(text)) !== null) {
      const bareName = m[1].trim();
      if (isLikelyPersonNameCandidate(bareName)) {
        addCandidate(
          'PERSON_NAME',
          m[0],
          m.index,
          'Local NER: Honorific Title + Proper Name',
          undefined,
          undefined,
          bareName
        );
        if (bareName.includes(' ')) {
          discoveredBarePersonNames.add(bareName);
        }
      }
    }

    // 33B: Salutation / Correspondence / Legal Role Triggers
    const roleTriggerRegex =
      /(?:Dear|Regards,|Sincerely,|Patient(?:[ \t]+Name)?[ \t]*:|Customer(?:[ \t]+Name)?[ \t]*:|Employee(?:[ \t]+Name)?[ \t]*:|Client(?:[ \t]+Name)?[ \t]*:|Contact[ \t]*:|prepared[ \t]+for|signed[ \t]+by|between)[ \t]+([A-Z][a-z]{1,20}(?:[ \t]+[A-Z][a-zA-Z'-]{1,20}){1,2})\b/g;
    while ((m = roleTriggerRegex.exec(text)) !== null) {
      const nameVal = m[1].trim();
      if (isLikelyPersonNameCandidate(nameVal)) {
        const start = m.index + m[0].lastIndexOf(nameVal);
        addCandidate(
          'PERSON_NAME',
          nameVal,
          start,
          'Local NER: Contextual Role / Salutation Trigger',
          undefined,
          undefined,
          nameVal
        );
        discoveredBarePersonNames.add(nameVal);
      }
    }

    // 33C: Organization Legal Suffixes (Inc., LLC, Ltd., Corp., GmbH, Pvt. Ltd., PLC, LLP)
    const orgRegex =
      /\b([A-Z][A-Za-z0-9&.-]*(?:[ \t]+[A-Z][A-Za-z0-9&.-]*){0,3}[ \t]+(?:Inc\.|LLC|Ltd\.|Corp\.|Corporation|GmbH|Pvt\.[ \t]*Ltd\.|PLC|LLP))\b/g;
    while ((m = orgRegex.exec(text)) !== null) {
      const orgVal = m[1].trim();
      const firstWord = orgVal.split(/[ \t]+/)[0].replace(/[^A-Za-z]/g, '');
      if (!NER_STOPWORDS.has(firstWord) && !NER_STOPWORDS.has(firstWord.toLowerCase())) {
        addCandidate('ORGANIZATION_NAME', orgVal, m.index, 'Local NER: Corporate Legal Entity Suffix');
      }
    }
  }

  // 34. Structure-Aware JSON / YAML Key & RFC 4180 CSV Column Header Scanner
  if (options.enableStructureAwareKeyScan) {
    // 34A: JSON / YAML / Object Key Scanner
    const nameKeyRegex =
      /["']?(?:full_?name|customer_?name|patient_?name|employee_?name|user_?name|first_?name|last_?name|contact_?name|author_?name|beneficiary_?name)["']?[ \t]*:[ \t]*["']([A-Za-z][A-Za-z \t.'-]{2,45})["']/gi;
    let m: RegExpExecArray | null;
    while ((m = nameKeyRegex.exec(text)) !== null) {
      const val = m[1].trim();
      if (val && !/^\[.*\]$/.test(val)) {
        const start = m.index + m[0].lastIndexOf(val);
        addCandidate(
          'PERSON_NAME',
          val,
          start,
          'Structure-Aware JSON/Object Name Key',
          undefined,
          undefined,
          val
        );
        if (val.includes(' ')) {
          discoveredBarePersonNames.add(val);
        }
      }
    }

    const orgKeyRegex =
      /["']?(?:company_?name|organization_?name|employer_?name|vendor_?name|client_?company)["']?[ \t]*:[ \t]*["']([A-Za-z0-9][A-Za-z0-9 \t.,&'-]{2,60})["']/gi;
    while ((m = orgKeyRegex.exec(text)) !== null) {
      const val = m[1].trim();
      if (val && !/^\[.*\]$/.test(val)) {
        const start = m.index + m[0].lastIndexOf(val);
        addCandidate('ORGANIZATION_NAME', val, start, 'Structure-Aware JSON/Object Company Key');
      }
    }

    // 34B: RFC 4180 CSV / TSV Header-Aware Column Scanner
    const lines = text.split(/\r?\n/);
    if (lines.length >= 2) {
      const headerLine = lines[0];
      const delimiter = headerLine.includes('\t') ? '\t' : headerLine.includes(',') ? ',' : null;
      if (delimiter) {
        const headers = headerLine.split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
        if (headers.length >= 2 && headers.length <= 40) {
          const colTypeMap = new Map<number, PiiEntityType>();
          headers.forEach((h, colIdx) => {
            if (/^(?:full_?name|customer_?name|patient_?name|employee_?name|person_?name|contact_?name|name)$/.test(h)) {
              colTypeMap.set(colIdx, 'PERSON_NAME');
            } else if (/^(?:company|company_?name|organization|employer|vendor)$/.test(h)) {
              colTypeMap.set(colIdx, 'ORGANIZATION_NAME');
            } else if (/^(?:address|street_?address|home_?address|billing_?address)$/.test(h)) {
              colTypeMap.set(colIdx, 'STREET_ADDRESS');
            } else if (/^(?:dob|date_?of_?birth|birth_?date|birthdate)$/.test(h)) {
              colTypeMap.set(colIdx, 'DATE_OF_BIRTH');
            } else if (/^(?:mrn|patient_?id|medical_?record)$/.test(h)) {
              colTypeMap.set(colIdx, 'MEDICAL_RECORD_MRN');
            } else if (/^(?:password|secret|api_?key|client_?secret|token)$/.test(h)) {
              colTypeMap.set(colIdx, 'GENERIC_SECRET_KV');
            }
          });

          if (colTypeMap.size > 0) {
            let lineStartOffset = lines[0].length + (text.slice(lines[0].length).startsWith('\r\n') ? 2 : 1);
            for (let r = 1; r < Math.min(lines.length, 2000); r++) {
              const rowStr = lines[r];
              if (rowStr.trim().length > 0) {
                const cells = rowStr.split(delimiter);
                if (cells.length === headers.length) {
                  let cellOffsetInRow = 0;
                  for (let c = 0; c < cells.length; c++) {
                    const rawCell = cells[c];
                    const mappedType = colTypeMap.get(c);
                    if (mappedType) {
                      const trimmedCell = rawCell.trim().replace(/^["']|["']$/g, '');
                      if (trimmedCell.length >= 2 && !/^\[.*\]$/.test(trimmedCell)) {
                        const innerIdx = rawCell.indexOf(trimmedCell);
                        const absStart = lineStartOffset + cellOffsetInRow + Math.max(0, innerIdx);
                        addCandidate(
                          mappedType,
                          trimmedCell,
                          absStart,
                          `CSV Header-Aware Column ("${headers[c]}")`
                        );
                      }
                    }
                    cellOffsetInRow += rawCell.length + 1;
                  }
                }
              }
              const afterLine = text.slice(lineStartOffset + rowStr.length);
              lineStartOffset += rowStr.length + (afterLine.startsWith('\r\n') ? 2 : 1);
            }
          }
        }
      }
    }
  }

  // 35. Two-Pass Coreference Propagation for Discovered Person Names
  if (discoveredBarePersonNames.size > 0) {
    for (const bareName of discoveredBarePersonNames) {
      const escaped = bareName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const corefRegex = new RegExp(`\\b${escaped}\\b`, 'g');
      let m: RegExpExecArray | null;
      while ((m = corefRegex.exec(text)) !== null) {
        addCandidate(
          'PERSON_NAME',
          m[0],
          m.index,
          'Local NER: Document Coreference Match',
          76,
          undefined,
          bareName
        );
      }
    }
  }

  return candidates;
}

// ============================================================================
// INTERVAL CONFLICT RESOLVER & MAIN REDACTION PIPELINE
// ============================================================================

export function scanAndRedactPii(
  rawText: string,
  customOptions?: Partial<PiiRedactorOptions>
): PiiRedactionResult {
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const baseOptions = getDefaultPiiOptions(customOptions?.preset || 'ai_prompt_reversible');
  const options: PiiRedactorOptions = {
    ...baseOptions,
    ...customOptions,
    enabledTypes: {
      ...baseOptions.enabledTypes,
      ...(customOptions?.enabledTypes || {}),
    },
  };

  const encoder = new TextEncoder();
  const originalBytes = encoder.encode(rawText);

  const lineStarts: number[] = [0];
  for (let i = 0; i < rawText.length; i++) {
    if (rawText.charCodeAt(i) === 0x0a) {
      lineStarts.push(i + 1);
    }
  }
  const getLineCol = (offset: number): { line: number; column: number } => {
    let low = 0;
    let high = lineStarts.length - 1;
    while (low <= high) {
      const mid = (low + high) >>> 1;
      if (lineStarts[mid] <= offset) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    const lineIdx = Math.max(0, low - 1);
    return {
      line: lineIdx + 1,
      column: offset - lineStarts[lineIdx] + 1,
    };
  };

  // Collect all candidate spans and resolve overlaps by specificity -> length -> startOffset
  const rawCandidates = collectCandidateSpans(rawText, options);
  rawCandidates.sort((a, b) => {
    if (b.specificity !== a.specificity) return b.specificity - a.specificity;
    const lenA = a.endOffset - a.startOffset;
    const lenB = b.endOffset - b.startOffset;
    if (lenB !== lenA) return lenB - lenA;
    return a.startOffset - b.startOffset;
  });

  const acceptedSpans: RawCandidateSpan[] = [];
  for (const cand of rawCandidates) {
    let overlaps = false;
    for (const acc of acceptedSpans) {
      if (cand.startOffset < acc.endOffset && cand.endOffset > acc.startOffset) {
        overlaps = true;
        break;
      }
    }
    if (!overlaps) {
      acceptedSpans.push(cand);
    }
  }

  // Sort accepted spans in document order
  acceptedSpans.sort((a, b) => a.startOffset - b.startOffset);

  // Build deterministic token vault & replacements
  const whitelistSet = new Set(options.whitelistedValues);
  const prefixCounters: Record<string, number> = {};
  const valueToTokenInfo = new Map<
    string,
    {
      tokenKey: string;
      syntheticValue: string;
      appliedReplacement: string;
      entityType: PiiEntityType;
      domain: PiiDomainCategory;
      severity: PiiSeverity;
      validationMethod: string;
    }
  >();

  const matches: DetectedPiiMatch[] = [];
  const vaultMap = new Map<string, PiiVaultEntry>();
  const domainBreakdown: Record<PiiDomainCategory, number> = {
    secrets: 0,
    personal_ner: 0,
    financial: 0,
    government_id: 0,
    network: 0,
    custom: 0,
  };
  const typeBreakdown: Partial<Record<PiiEntityType, number>> = {};

  for (let idx = 0; idx < acceptedSpans.length; idx++) {
    const span = acceptedSpans[idx];
    const meta = PII_ENTITY_REGISTRY[span.entityType];
    const isWhitelisted = whitelistSet.has(span.rawValue);
    const effectivePrefix = span.customPrefix || meta.shortPrefix;
    const canonicalVal = span.canonicalKeyValue || span.rawValue;
    const cacheKey = `${effectivePrefix}:::${canonicalVal}`;

    let info = valueToTokenInfo.get(cacheKey);
    if (!info) {
      const nextNum = (prefixCounters[effectivePrefix] || 0) + 1;
      prefixCounters[effectivePrefix] = nextNum;
      const padNum = String(nextNum).padStart(2, '0');
      const tokenKey = `[${effectivePrefix}_${padNum}]`;
      const syntheticValue = generateSyntheticValue(span.entityType, nextNum);

      const effectiveMode =
        options.categoryModeOverrides[meta.domain] || options.maskingMode;

      let appliedReplacement = tokenKey;
      if (options.customTokenOverrides[span.rawValue]) {
        appliedReplacement = options.customTokenOverrides[span.rawValue];
      } else if (effectiveMode === 'synthetic') {
        appliedReplacement = syntheticValue;
      } else if (effectiveMode === 'partial') {
        appliedReplacement = formatPartialMask(span.rawValue, span.entityType);
      } else if (effectiveMode === 'hash') {
        const shortHash = computeSha256Hex(`${options.hashSalt}:${canonicalVal}`).slice(0, 8);
        appliedReplacement = `[${effectivePrefix}_SHA256:${shortHash}]`;
      } else if (effectiveMode === 'redact') {
        appliedReplacement = '████████████';
      } else if (effectiveMode === 'type_label') {
        appliedReplacement = `[${effectivePrefix}]`;
      }

      info = {
        tokenKey,
        syntheticValue,
        appliedReplacement,
        entityType: span.entityType,
        domain: meta.domain,
        severity: meta.severity,
        validationMethod: span.validationMethod,
      };
      valueToTokenInfo.set(cacheKey, info);
    }

    const { line, column } = getLineCol(span.startOffset);
    const ctxStart = Math.max(0, span.startOffset - 16);
    const ctxEnd = Math.min(rawText.length, span.endOffset + 16);
    const beforeCtx = rawText.slice(ctxStart, span.startOffset).replace(/[\r\n]+/g, ' ');
    const afterCtx = rawText.slice(span.endOffset, ctxEnd).replace(/[\r\n]+/g, ' ');

    const finalReplacement = isWhitelisted ? span.rawValue : info.appliedReplacement;

    const matchObj: DetectedPiiMatch = {
      id: `pii-${idx + 1}`,
      entityType: span.entityType,
      domain: meta.domain,
      severity: meta.severity,
      rawValue: span.rawValue,
      replacement: finalReplacement,
      tokenKey: info.tokenKey,
      syntheticValue: info.syntheticValue,
      startOffset: span.startOffset,
      endOffset: span.endOffset,
      line,
      column,
      validationMethod: span.validationMethod,
      isWhitelisted,
      contextSnippet: `${beforeCtx}${info.tokenKey}${afterCtx}`,
    };

    matches.push(matchObj);
    domainBreakdown[meta.domain]++;
    typeBreakdown[span.entityType] = (typeBreakdown[span.entityType] || 0) + 1;

    const existingVault = vaultMap.get(cacheKey);
    const locLabel = `L${line}:C${column}`;
    if (existingVault) {
      existingVault.occurrences++;
      if (existingVault.sampleLocations.length < 6) {
        existingVault.sampleLocations.push(locLabel);
      }
    } else {
      vaultMap.set(cacheKey, {
        tokenKey: info.tokenKey,
        syntheticValue: info.syntheticValue,
        appliedReplacement: info.appliedReplacement,
        rawValue: span.rawValue,
        entityType: span.entityType,
        domain: meta.domain,
        severity: meta.severity,
        occurrences: 1,
        isWhitelisted,
        sampleLocations: [locLabel],
        validationMethod: span.validationMethod,
      });
    }
  }

  // Construct sanitizedText and highlighterSegments in a single linear pass
  const sanitizedParts: string[] = [];
  const highlighterSegments: PiiHighlighterSegment[] = [];
  let cursor = 0;

  for (const m of matches) {
    if (m.startOffset > cursor) {
      const slice = rawText.slice(cursor, m.startOffset);
      sanitizedParts.push(slice);
      highlighterSegments.push({ type: 'text', text: slice });
    }
    sanitizedParts.push(m.replacement);
    highlighterSegments.push({ type: 'pii', text: m.rawValue, match: m });
    cursor = m.endOffset;
  }
  if (cursor < rawText.length) {
    const tail = rawText.slice(cursor);
    sanitizedParts.push(tail);
    highlighterSegments.push({ type: 'text', text: tail });
  }

  const sanitizedText = sanitizedParts.join('');
  const sanitizedBytes = encoder.encode(sanitizedText);

  const systemInstructionHeader =
    `[SYSTEM INSTRUCTION FOR AI ASSISTANT: Confidential entities in the prompt below have been replaced with deterministic privacy placeholders (such as [EMAIL_01], [OPENAI_KEY_01], or [PERSON_01]). Preserve these exact placeholder tokens verbatim in your response whenever referring to those entities so the user can automatically restore them locally.]\n\n`;

  const promptWrappedText =
    options.includeAiSystemPromptWrapper && sanitizedText.trim().length > 0
      ? `${systemInstructionHeader}${sanitizedText}`
      : sanitizedText;

  let zeroLeakVerified = true;
  for (const entry of vaultMap.values()) {
    if (!entry.isWhitelisted && entry.rawValue.length >= 4) {
      if (sanitizedText.includes(entry.rawValue)) {
        zeroLeakVerified = false;
        break;
      }
    }
  }

  const activeRedactedCount = matches.filter((m) => !m.isWhitelisted).length;
  const whitelistedCount = matches.length - activeRedactedCount;

  let riskScore = 0;
  if (domainBreakdown.secrets > 0) riskScore += Math.min(50, domainBreakdown.secrets * 25);
  if (domainBreakdown.financial > 0) riskScore += Math.min(45, domainBreakdown.financial * 22);
  if (domainBreakdown.government_id > 0)
    riskScore += Math.min(45, domainBreakdown.government_id * 22);
  if (domainBreakdown.personal_ner > 0)
    riskScore += Math.min(35, domainBreakdown.personal_ner * 8);
  if (domainBreakdown.network > 0) riskScore += Math.min(20, domainBreakdown.network * 5);
  if (domainBreakdown.custom > 0) riskScore += Math.min(30, domainBreakdown.custom * 15);
  riskScore = Math.min(100, riskScore);

  let privacyRiskVerdict = 'Clean — Zero Regulated PII or Cloud Credentials Detected';
  if (riskScore >= 70) {
    privacyRiskVerdict =
      'Critical Exposure Risk — Live Cloud Secrets, Payment Cards, or National/HIPAA IDs Detected';
  } else if (riskScore >= 35) {
    privacyRiskVerdict =
      'High Exposure Risk — Personal Contact PII, Names, or Internal Network Identifiers Found';
  } else if (matches.length > 0) {
    privacyRiskVerdict = 'Moderate Exposure Risk — Identifiers Detected and Masked Locally';
  }

  const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

  return {
    engineVersion: PII_ENGINE_VERSION,
    originalText: rawText,
    sanitizedText,
    promptWrappedText,
    originalByteLength: originalBytes.length,
    sanitizedByteLength: sanitizedBytes.length,
    originalSha256: computeSha256Hex(originalBytes),
    sanitizedSha256: computeSha256Hex(sanitizedBytes),
    executionTimeMs: Math.max(0.1, Number((endTime - startTime).toFixed(2))),
    totalMatchesCount: matches.length,
    activeRedactedCount,
    whitelistedCount,
    uniqueEntitiesCount: vaultMap.size,
    privacyRiskScore: riskScore,
    privacyRiskVerdict,
    domainBreakdown,
    typeBreakdown,
    matches,
    vaultEntries: Array.from(vaultMap.values()),
    highlighterSegments,
    zeroLeakVerified,
  };
}

// ============================================================================
// FUZZY-TOLERANT 1-CLICK AI RESPONSE DE-ANONYMIZER (ROUND-TRIP RESTORER)
// ============================================================================

export function restoreAnonymizedAiResponse(
  aiResponseText: string,
  vaultEntries: PiiVaultEntry[]
): AiResponseRestoreResult {
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  if (!aiResponseText || vaultEntries.length === 0) {
    return {
      restoredText: aiResponseText,
      totalRestoredReplacements: 0,
      uniqueTokensRestored: 0,
      restoredItems: [],
      unmatchedTokens: [],
      executionTimeMs: 0.1,
    };
  }

  let workingText = aiResponseText;
  let totalRestoredReplacements = 0;
  const restoredItems: AiResponseRestoreResult['restoredItems'] = [];

  const sortedVault = [...vaultEntries].sort(
    (a, b) => b.tokenKey.length - a.tokenKey.length
  );

  for (const entry of sortedVault) {
    const bareToken = entry.tokenKey.replace(/^\[|\]$/g, '');
    const escapedBare = bareToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedSynthetic = entry.syntheticValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedApplied = entry.appliedReplacement.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const patterns: string[] = [`\\[\\s*${escapedBare}\\s*\\]`, `\\b${escapedBare}\\b`];
    if (entry.syntheticValue && entry.syntheticValue.length >= 4) {
      patterns.push(escapedSynthetic);
    }
    if (
      entry.appliedReplacement &&
      entry.appliedReplacement !== '████████████' &&
      !entry.appliedReplacement.startsWith('[') &&
      entry.appliedReplacement.length >= 4
    ) {
      patterns.push(escapedApplied);
    }

    const combinedRegex = new RegExp(`(?:${patterns.join('|')})`, 'gi');
    let matchCount = 0;
    workingText = workingText.replace(combinedRegex, () => {
      matchCount++;
      return entry.rawValue;
    });

    if (matchCount > 0) {
      totalRestoredReplacements += matchCount;
      restoredItems.push({
        tokenMatched: entry.tokenKey,
        restoredValue: entry.rawValue,
        entityType: entry.entityType,
        count: matchCount,
      });
    }
  }

  const remainingRegex = /\[[A-Z_]+_\d{1,3}\]/g;
  const unmatchedSet = new Set<string>();
  let remMatch: RegExpExecArray | null;
  while ((remMatch = remainingRegex.exec(workingText)) !== null) {
    unmatchedSet.add(remMatch[0]);
  }

  const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

  return {
    restoredText: workingText,
    totalRestoredReplacements,
    uniqueTokensRestored: restoredItems.length,
    restoredItems,
    unmatchedTokens: Array.from(unmatchedSet),
    executionTimeMs: Math.max(0.1, Number((endTime - startTime).toFixed(2))),
  };
}

export function generateSimulatedAiReply(result: PiiRedactionResult): string {
  if (result.vaultEntries.length === 0) {
    return 'Here is the analysis of your input: No sensitive placeholders were present in the prompt.';
  }
  const lines: string[] = [
    '### AI Assistant Analysis & Recommended Action Plan',
    '',
    'Based on the sanitized records and logs you provided, I have completed the root-cause and compliance review:',
    '',
  ];
  result.vaultEntries.slice(0, 8).forEach((entry, idx) => {
    const tokenUsed =
      entry.appliedReplacement === '████████████' ? entry.tokenKey : entry.appliedReplacement;
    lines.push(
      `${idx + 1}. **${PII_ENTITY_REGISTRY[entry.entityType]?.label || entry.entityType} (${tokenUsed}):** Verified ${entry.occurrences} occurrence(s) at ${entry.sampleLocations.join(', ')}. Ensure ${tokenUsed} is rotated or stored in an encrypted vault.`
    );
  });
  lines.push(
    '',
    'Please paste this reply into **Tab 2 (1-Click AI Response Restorer)** to swap all placeholders back to your original values locally.'
  );
  return lines.join('\n');
}

// ============================================================================
// EXPORTERS: SESSION VAULT JSON, RFC 4180 CSV, 3-SHEET .XLSX & SHA-256 RECEIPT
// ============================================================================

export function exportSessionVaultJson(result: PiiRedactionResult): string {
  return JSON.stringify(
    {
      vaultFormat: 'KivaroTools Local PII Token Vault v2.2',
      createdAtUtc: new Date().toISOString(),
      originalSha256: result.originalSha256,
      sanitizedSha256: result.sanitizedSha256,
      entries: result.vaultEntries,
    },
    null,
    2
  );
}

export function exportPiiAuditCsv(result: PiiRedactionResult, includeRawValues = false): string {
  const headers = [
    'Match ID',
    'Entity Type',
    'Domain',
    'Severity',
    'Token Key',
    'Applied Replacement',
    ...(includeRawValues ? ['Original Raw Value'] : []),
    'Whitelisted',
    'Line',
    'Column',
    'UTF-16 Start',
    'Validation Method',
  ];

  const escapeCsvCell = (val: unknown): string => {
    const safe = sanitizeSpreadsheetFormula(val, true);
    if (/[",\r\n]/.test(safe)) {
      return `"${safe.replace(/"/g, '""')}"`;
    }
    return safe;
  };

  const rows = result.matches.map((m) =>
    [
      m.id,
      m.entityType,
      m.domain,
      m.severity.toUpperCase(),
      m.tokenKey,
      m.replacement,
      ...(includeRawValues ? [m.rawValue] : []),
      m.isWhitelisted ? 'YES' : 'NO',
      m.line,
      m.column,
      m.startOffset,
      m.validationMethod,
    ]
      .map(escapeCsvCell)
      .join(',')
  );

  return `\uFEFF${[headers.map(escapeCsvCell).join(','), ...rows].join('\r\n')}`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

function toExcelColName(colIndex: number): string {
  let n = colIndex + 1;
  let name = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

function buildWorksheetXml(rows: Array<Array<string | number>>): string {
  const xmlRows = rows.map((row, rIdx) => {
    const cells = row
      .map((cell, cIdx) => {
        const colLetter = toExcelColName(cIdx);
        const ref = `${colLetter}${rIdx + 1}`;
        if (typeof cell === 'number' && Number.isFinite(cell)) {
          return `<c r="${ref}"><v>${cell}</v></c>`;
        }
        const safeText = escapeXml(sanitizeSpreadsheetFormula(cell, true));
        return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${safeText}</t></is></c>`;
      })
      .join('');
    return `<row r="${rIdx + 1}">${cells}</row>`;
  });
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${xmlRows.join('')}</sheetData>
</worksheet>`;
}

export function exportPiiAuditXlsx(result: PiiRedactionResult, includeRawValues = false): Uint8Array {
  const summaryRows: Array<Array<string | number>> = [
    ['KivaroTools Client-Side PII Redaction & AI Prompt Sanitization Report'],
    ['Engine Version', result.engineVersion],
    ['Privacy Risk Verdict', result.privacyRiskVerdict],
    ['Privacy Exposure Score (0-100)', result.privacyRiskScore],
    ['Zero-Leak Verification Passed', result.zeroLeakVerified ? 'PASSED (0 Leaks)' : 'WARNING'],
    ['Original Bytes', result.originalByteLength],
    ['Sanitized Bytes', result.sanitizedByteLength],
    ['Original SHA-256', result.originalSha256],
    ['Sanitized SHA-256', result.sanitizedSha256],
    ['Total PII / Secret Matches', result.totalMatchesCount],
    ['Active Redacted Matches', result.activeRedactedCount],
    ['Whitelisted Matches', result.whitelistedCount],
    ['Unique Entities in Vault', result.uniqueEntitiesCount],
    [],
    ['Domain Category', 'Detected Count'],
    ['Developer Secrets & Cloud Keys', result.domainBreakdown.secrets],
    ['Personal Contact & Local NER', result.domainBreakdown.personal_ner],
    ['Financial & Payment Identifiers', result.domainBreakdown.financial],
    ['Government, Tax & HIPAA IDs', result.domainBreakdown.government_id],
    ['Network & Infrastructure', result.domainBreakdown.network],
    ['Custom Organization Rules', result.domainBreakdown.custom],
  ];

  const vaultRows: Array<Array<string | number>> = [
    [
      'Token Key',
      'Synthetic Faker Value',
      'Applied Replacement',
      ...(includeRawValues ? ['Original Raw Value'] : []),
      'Entity Type',
      'Domain',
      'Severity',
      'Occurrences',
      'Whitelisted',
      'Sample Locations',
      'Validation Method',
    ],
    ...result.vaultEntries.map((v) => [
      v.tokenKey,
      v.syntheticValue,
      v.appliedReplacement,
      ...(includeRawValues ? [v.rawValue] : []),
      v.entityType,
      v.domain,
      v.severity.toUpperCase(),
      v.occurrences,
      v.isWhitelisted ? 'YES' : 'NO',
      v.sampleLocations.join(', '),
      v.validationMethod,
    ]),
  ];

  const occurrenceRows: Array<Array<string | number>> = [
    [
      'ID',
      'Entity Type',
      'Domain',
      'Severity',
      'Token Key',
      'Replacement',
      'Line',
      'Column',
      'UTF-16 Offset',
      'Validation Method',
    ],
    ...result.matches.slice(0, 5000).map((m) => [
      m.id,
      m.entityType,
      m.domain,
      m.severity.toUpperCase(),
      m.tokenKey,
      m.replacement,
      m.line,
      m.column,
      m.startOffset,
      m.validationMethod,
    ]),
  ];

  const encoder = new TextEncoder();
  const files: Array<{ name: string; data: Uint8Array }> = [
    {
      name: '[Content_Types].xml',
      data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`),
    },
    {
      name: '_rels/.rels',
      data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`),
    },
    {
      name: 'xl/workbook.xml',
      data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Executive Summary" sheetId="1" r:id="rId1"/>
    <sheet name="Entity Token Vault" sheetId="2" r:id="rId2"/>
    <sheet name="Occurrence Ledger" sheetId="3" r:id="rId3"/>
  </sheets>
</workbook>`),
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>
</Relationships>`),
    },
    {
      name: 'xl/worksheets/sheet1.xml',
      data: encoder.encode(buildWorksheetXml(summaryRows)),
    },
    {
      name: 'xl/worksheets/sheet2.xml',
      data: encoder.encode(buildWorksheetXml(vaultRows)),
    },
    {
      name: 'xl/worksheets/sheet3.xml',
      data: encoder.encode(buildWorksheetXml(occurrenceRows)),
    },
  ];

  let totalLocalSize = 0;
  let totalCentralSize = 0;
  const nameBytesList = files.map((f) => encoder.encode(f.name));
  files.forEach((f, idx) => {
    totalLocalSize += 30 + nameBytesList[idx].length + f.data.length;
    totalCentralSize += 46 + nameBytesList[idx].length;
  });

  const out = new Uint8Array(totalLocalSize + totalCentralSize + 22);
  const view = new DataView(out.buffer);
  let localOffset = 0;
  const localHeaderOffsets: number[] = [];

  files.forEach((f, idx) => {
    localHeaderOffsets.push(localOffset);
    const nameBytes = nameBytesList[idx];
    const crc = computeCrc32(f.data);
    view.setUint32(localOffset, 0x04034b50, true);
    view.setUint16(localOffset + 4, 20, true);
    view.setUint16(localOffset + 6, 0, true);
    view.setUint16(localOffset + 8, 0, true);
    view.setUint16(localOffset + 10, 0, true);
    view.setUint16(localOffset + 12, 0, true);
    view.setUint32(localOffset + 14, crc, true);
    view.setUint32(localOffset + 18, f.data.length, true);
    view.setUint32(localOffset + 22, f.data.length, true);
    view.setUint16(localOffset + 26, nameBytes.length, true);
    view.setUint16(localOffset + 28, 0, true);
    out.set(nameBytes, localOffset + 30);
    out.set(f.data, localOffset + 30 + nameBytes.length);
    localOffset += 30 + nameBytes.length + f.data.length;
  });

  const centralDirStart = localOffset;
  files.forEach((f, idx) => {
    const nameBytes = nameBytesList[idx];
    const crc = computeCrc32(f.data);
    view.setUint32(localOffset, 0x02014b50, true);
    view.setUint16(localOffset + 4, 20, true);
    view.setUint16(localOffset + 6, 20, true);
    view.setUint16(localOffset + 8, 0, true);
    view.setUint16(localOffset + 10, 0, true);
    view.setUint16(localOffset + 12, 0, true);
    view.setUint16(localOffset + 14, 0, true);
    view.setUint32(localOffset + 16, crc, true);
    view.setUint32(localOffset + 20, f.data.length, true);
    view.setUint32(localOffset + 24, f.data.length, true);
    view.setUint16(localOffset + 28, nameBytes.length, true);
    view.setUint16(localOffset + 30, 0, true);
    view.setUint16(localOffset + 32, 0, true);
    view.setUint16(localOffset + 34, 0, true);
    view.setUint16(localOffset + 36, 0, true);
    view.setUint32(localOffset + 38, 0, true);
    view.setUint32(localOffset + 42, localHeaderOffsets[idx], true);
    out.set(nameBytes, localOffset + 46);
    localOffset += 46 + nameBytes.length;
  });

  const centralDirSize = localOffset - centralDirStart;
  view.setUint32(localOffset, 0x06054b50, true);
  view.setUint16(localOffset + 4, 0, true);
  view.setUint16(localOffset + 6, 0, true);
  view.setUint16(localOffset + 8, files.length, true);
  view.setUint16(localOffset + 10, files.length, true);
  view.setUint32(localOffset + 12, centralDirSize, true);
  view.setUint32(localOffset + 16, centralDirStart, true);
  view.setUint16(localOffset + 20, 0, true);

  return out;
}

export function generatePiiComplianceCertificateJson(result: PiiRedactionResult): string {
  return JSON.stringify(
    {
      certificateType:
        'KivaroTools Client-Side PII Redaction & AI Prompt Sanitization Certificate',
      engineVersion: result.engineVersion,
      timestampUtc: new Date().toISOString(),
      executionMode: '100% Client-Side Browser RAM (Zero Server Upload)',
      zeroLeakVerified: result.zeroLeakVerified,
      privacyRiskScore: result.privacyRiskScore,
      verdict: result.privacyRiskVerdict,
      inputMetrics: {
        byteLength: result.originalByteLength,
        sha256: result.originalSha256,
      },
      outputMetrics: {
        byteLength: result.sanitizedByteLength,
        sha256: result.sanitizedSha256,
      },
      redactionSummary: {
        totalMatches: result.totalMatchesCount,
        activeRedactedCount: result.activeRedactedCount,
        whitelistedCount: result.whitelistedCount,
        uniqueEntitiesInVault: result.uniqueEntitiesCount,
        domainBreakdown: result.domainBreakdown,
        typeBreakdown: result.typeBreakdown,
      },
    },
    null,
    2
  );
}

// ============================================================================
// REALISTIC B2B & DEVELOPER SAMPLE PRESETS
// ============================================================================

export interface PiiSamplePreset {
  id: string;
  title: string;
  badge: string;
  description: string;
  recommendedPreset: PiiPresetId;
  sampleText: string;
}

export const PII_SAMPLE_PRESETS: PiiSamplePreset[] = [
  {
    id: 'production_incident_and_secrets',
    title: 'Production Incident Log + Cloud Keys + Payment Card',
    badge: 'Secrets + Luhn Card + NER',
    description:
      'Contains OpenAI (sk-proj-), AWS (AKIA), Postgres URI password, Luhn-valid Visa card, IBAN, US SSN, and customer details for Dr. Sarah Jenkins.',
    recommendedPreset: 'ai_prompt_reversible',
    sampleText: `[2026-11-12T09:42:18Z] ERROR PaymentGateway: Charge failed for Customer: Dr. Sarah Jenkins (email: sarah.jenkins@apexhealth.org, phone: +1 (415) 890-4321).
Billing Address: 742 Evergreen Terrace, Suite 200
Card PAN: 4111 1111 1111 1111 | IBAN: DE89 3704 0044 0532 0130 00 | SSN: 453-29-8812
Client IP: 198.51.100.44 (Internal Node: 127.0.0.1)
Database URI: postgres://prod_admin:Sup3rS3cr3tDbP@ss99@db.internal.apexhealth.org:5432/billing
OpenAI Key: sk-proj-9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p3q2r1s
AWS Key: AKIAIOSFODNN7EXAMPLE
Follow-up note: Sarah Jenkins requested an immediate invoice retry.`,
  },
  {
    id: 'structured_json_customer_payload',
    title: 'Structured JSON Webhook Payload (Key-Aware + NADRA CNIC)',
    badge: 'JSON AST + Global IDs',
    description:
      'Demonstrates structure-aware JSON key detection ("customer_name", "api_secret"), Pakistani NADRA CNIC, UK NINO, and Stripe live secret key.',
    recommendedPreset: 'csv_json_dataset_synthetic',
    sampleText: `{
  "event": "kyc.verification.failed",
  "timestamp": "2026-11-12T10:15:00Z",
  "customer_name": "Usman Tariq",
  "company_name": "FinEdge Solutions Pvt. Ltd.",
  "email": "usman.tariq@finedge.pk",
  "phone": "+92-300-8451290",
  "nadra_cnic": "35202-1234567-1",
  "uk_nino": "QQ 12 34 56 C",
  "dob": "1992-08-14",
  "api_secret": "whsec_8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c",
  "stripe_key": "sk_test_51NxYzABC1234567890defGHIJKL"
}`,
  },
  {
    id: 'legal_contract_and_hipaa_note',
    title: 'Legal NDA & HIPAA Clinical Consultation Note',
    badge: 'HIPAA + Legal NER',
    description:
      'Contains Patient MRN, Date of Birth, Doctor & Patient names, Corporate entity suffixes, and wire transfer routing details.',
    recommendedPreset: 'hipaa_clinical_safe',
    sampleText: `CONFIDENTIAL CLINICAL & COVERAGE SUMMARY
Prepared for: Mr. David Vance (Patient ID: MRN-884920, DOB: 1981-05-23)
Attending Physician: Dr. Elena Rostova, MD — Northwind Medical Group LLC
Contact: elena.rostova@northwindmed.com | Emergency Phone: (212) 555-0198
Residence: 1250 Broadway Avenue, Apt 14B
Insurance Wire ABA Routing: 021000021 | ETH Escrow: 0x71C7656EC7ab88b098defB751B7401B5f6d8976F
Follow-up: David Vance signed the HIPAA authorization with Dr. Elena Rostova.`,
  },
];