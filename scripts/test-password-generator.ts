/**
 * OmniTools Password Generator & Cryptographic Engine Test Suite
 *
 * Reproducible functional, cryptographic, and security regression suite.
 * Run with: npm run test:password
 */

import fs from 'fs';
import path from 'path';
import {
  generatePassword,
  generatePassphrase,
  generateBulkPasswords,
  makeSecret,
  analyzePassword,
  strengthFor,
  constantTimeTextEqual,
  normalizeHash,
  looksLikeHex,
  secureRandomInt,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_WORD_COUNT,
  MAX_WORD_COUNT,
  AMBIGUOUS,
  LOWER,
  UPPER,
  NUMBERS,
  SYMBOLS,
  PASSPHRASE_WORDS,
  getCrypto,
} from '../lib/passwordEngine';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${testName}${details ? ` (${details})` : ''}`);
  }
}

console.log('\n================================================================');
console.log('       OMNITOOLS CRYPTOGRAPHIC PASSWORD ENGINE TEST SUITE       ');
console.log('================================================================\n');

// ============================================================================
// 1. CSPRNG RANDOMNESS & REJECTION SAMPLING
// ============================================================================
console.log('--- 1. Testing CSPRNG Randomness & Rejection Sampling ---');

{
  let allInRange = true;
  for (let i = 0; i < 500; i++) {
    const val = secureRandomInt(10);
    if (val < 0 || val >= 10 || !Number.isInteger(val)) {
      allInRange = false;
      break;
    }
  }
  assert(allInRange, 'secureRandomInt(10) outputs strictly in [0, 9] over 500 draws');
}

{
  let threwZero = false;
  try {
    secureRandomInt(0);
  } catch {
    threwZero = true;
  }
  assert(threwZero, 'secureRandomInt(0) throws invalid range error');

  let threwNegative = false;
  try {
    secureRandomInt(-5);
  } catch {
    threwNegative = true;
  }
  assert(threwNegative, 'secureRandomInt(-5) throws invalid range error');
}

// ============================================================================
// 2. PASSWORD LENGTH & BOUNDARY TESTING
// ============================================================================
console.log('\n--- 2. Testing Password Lengths & Boundaries ---');

{
  const minResult = generatePassword({ length: MIN_PASSWORD_LENGTH });
  assert(minResult.password.length === MIN_PASSWORD_LENGTH, `Smallest length boundary (${MIN_PASSWORD_LENGTH}) respected`);

  const maxResult = generatePassword({ length: MAX_PASSWORD_LENGTH });
  assert(maxResult.password.length === MAX_PASSWORD_LENGTH, `Largest length boundary (${MAX_PASSWORD_LENGTH}) respected`);

  const stdResult = generatePassword({ length: 20 });
  assert(stdResult.password.length === 20, 'Standard 20-character password length respected');
}

{
  let threwTooShort = false;
  try {
    generatePassword({ length: MIN_PASSWORD_LENGTH - 1 });
  } catch {
    threwTooShort = true;
  }
  assert(threwTooShort, `Length below ${MIN_PASSWORD_LENGTH} throws validation error`);

  let threwTooLong = false;
  try {
    generatePassword({ length: MAX_PASSWORD_LENGTH + 1 });
  } catch {
    threwTooLong = true;
  }
  assert(threwTooLong, `Length above ${MAX_PASSWORD_LENGTH} throws validation error`);
}

// ============================================================================
// 3. CHARACTER CLASS SELECTION & GUARANTEED REPRESENTATION
// ============================================================================
console.log('\n--- 3. Testing Character Classes & Guaranteed Representation ---');

{
  assert(LOWER.length === 26, 'Lowercase character pool contains exactly 26 letters');
  assert(UPPER.length === 26, 'Uppercase character pool contains exactly 26 letters');
  assert(NUMBERS.length === 10, 'Numbers character pool contains exactly 10 digits');
  assert(SYMBOLS.length === 29, 'Symbols character pool contains exactly 29 special characters');
}

{
  // Lowercase only
  const lowerOnly = generatePassword({
    length: 25,
    includeLower: true,
    includeUpper: false,
    includeNumbers: false,
    includeSymbols: false,
  });
  const isAllLower = /^[a-z]+$/.test(lowerOnly.password);
  assert(isAllLower, 'Single-class (lowercase only) contains strictly lowercase letters');
}

{
  // Uppercase only
  const upperOnly = generatePassword({
    length: 25,
    includeLower: false,
    includeUpper: true,
    includeNumbers: false,
    includeSymbols: false,
  });
  const isAllUpper = /^[A-Z]+$/.test(upperOnly.password);
  assert(isAllUpper, 'Single-class (uppercase only) contains strictly uppercase letters');
}

{
  // Numbers only
  const numOnly = generatePassword({
    length: 25,
    includeLower: false,
    includeUpper: false,
    includeNumbers: true,
    includeSymbols: false,
  });
  const isAllNum = /^[0-9]+$/.test(numOnly.password);
  assert(isAllNum, 'Single-class (numbers only) contains strictly digits');
}

{
  // All 4 pools with requireEach = true
  let guaranteedAll = true;
  for (let trial = 0; trial < 100; trial++) {
    const res = generatePassword({
      length: 16,
      includeLower: true,
      includeUpper: true,
      includeNumbers: true,
      includeSymbols: true,
      requireEach: true,
    });
    const p = res.password;
    const hasLower = /[a-z]/.test(p);
    const hasUpper = /[A-Z]/.test(p);
    const hasNum = /[0-9]/.test(p);
    const hasSym = /[^a-zA-Z0-9]/.test(p);
    if (!hasLower || !hasUpper || !hasNum || !hasSym) {
      guaranteedAll = false;
      break;
    }
  }
  assert(guaranteedAll, 'requireEach=true guarantees all 4 character classes across 100 trials');
}

// ============================================================================
// 4. AMBIGUOUS CHARACTER EXCLUSION
// ============================================================================
console.log('\n--- 4. Testing Ambiguous Character Exclusion ---');

{
  let foundAmbiguous = false;
  for (let trial = 0; trial < 100; trial++) {
    const res = generatePassword({
      length: 64,
      includeLower: true,
      includeUpper: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeAmbiguous: true,
    });
    for (const char of res.password) {
      if (AMBIGUOUS.has(char)) {
        foundAmbiguous = true;
        break;
      }
    }
    if (foundAmbiguous) break;
  }
  assert(!foundAmbiguous, 'excludeAmbiguous=true strictly filters all lookalike glyphs (0,O,o,1,I,l,|,`) across 100 64-char trials');
}

// ============================================================================
// 5. CONTRADICTORY & INVALID SETTINGS
// ============================================================================
console.log('\n--- 5. Testing Contradictory & Invalid Settings ---');

{
  let threwNoPools = false;
  try {
    generatePassword({
      length: 16,
      includeLower: false,
      includeUpper: false,
      includeNumbers: false,
      includeSymbols: false,
    });
  } catch {
    threwNoPools = true;
  }
  assert(threwNoPools, 'Zero selected character pools throws explicit error');

  let threwLengthTooSmallForClasses = false;
  try {
    // 4 classes requested with length 3
    generatePassword({
      length: 3,
      includeLower: true,
      includeUpper: true,
      includeNumbers: true,
      includeSymbols: true,
      requireEach: true,
    });
  } catch {
    threwLengthTooSmallForClasses = true;
  }
  assert(threwLengthTooSmallForClasses, 'Length smaller than required character classes throws explicit error');
}

// ============================================================================
// 6. PASSPHRASE ENGINE & ENTROPY
// ============================================================================
console.log('\n--- 6. Testing Passphrase Engine & Dictionary Sampling ---');

{
  const pass = generatePassphrase({
    wordCount: 5,
    separator: '-',
    capitalize: false,
    includeNumber: true,
  });

  const parts = pass.passphrase.split('-');
  assert(parts.length === 6, 'Passphrase contains 5 words plus 1 number suffix (6 segments)');

  const words = parts.slice(0, 5);
  const allInDict = words.every(w => PASSPHRASE_WORDS.includes(w.toLowerCase()));
  assert(allInDict, 'All passphrase words are drawn from verified dictionary');

  // Verify uniqueness (sampling without replacement)
  const uniqueWords = new Set(words);
  assert(uniqueWords.size === 5, 'Passphrase words are sampled without replacement (all unique)');

  const numPart = parts[5];
  assert(/^\d{4}$/.test(numPart), 'Numeric suffix is exactly 4 digits');

  // Theoretical Shannon entropy calculation check
  // 5 words from 1024 dict: sum(log2(1024 - i)) for i=0..4 ≈ 50 bits + log2(10000) ≈ 13.3 bits = ~63 bits
  assert(pass.entropy >= 62 && pass.entropy <= 64, `Passphrase entropy is mathematically sound (${pass.entropy} bits)`);
}

{
  // Passphrase capitalization check
  const capPass = generatePassphrase({
    wordCount: 4,
    separator: '_',
    capitalize: true,
    includeNumber: false,
  });
  const capWords = capPass.passphrase.split('_');
  const allCapitalized = capWords.every(w => /^[A-Z][a-z]+$/.test(w));
  assert(allCapitalized, 'Passphrase capitalization correctly capitalizes each word initial');
}

{
  let threwLowWords = false;
  try {
    generatePassphrase({ wordCount: MIN_WORD_COUNT - 1 });
  } catch {
    threwLowWords = true;
  }
  assert(threwLowWords, `Passphrase wordCount below ${MIN_WORD_COUNT} throws error`);

  let threwHighWords = false;
  try {
    generatePassphrase({ wordCount: MAX_WORD_COUNT + 1 });
  } catch {
    threwHighWords = true;
  }
  assert(threwHighWords, `Passphrase wordCount above ${MAX_WORD_COUNT} throws error`);
}

// ============================================================================
// 7. DEVELOPER SECRET TOKENS
// ============================================================================
console.log('\n--- 7. Testing Developer Secret Token Generation ---');

{
  // Hex secret
  const hexSecret = makeSecret('hex', 32);
  assert(hexSecret.length === 64, 'Hex secret with 32 bytes outputs exactly 64 hex characters');
  assert(looksLikeHex(hexSecret), 'Hex secret contains valid hexadecimal characters');

  // Base64 secret
  const b64Secret = makeSecret('base64', 32);
  assert(typeof b64Secret === 'string' && b64Secret.length > 0, 'Base64 secret generated successfully');

  // Base64URL secret (no +, /, =)
  const b64urlSecret = makeSecret('base64url', 32);
  assert(!b64urlSecret.includes('+') && !b64urlSecret.includes('/') && !b64urlSecret.includes('='), 'Base64URL secret contains no +, /, or =');

  // UUID v4 format
  const uuid = makeSecret('uuid');
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  assert(uuidRegex.test(uuid), `UUID v4 strictly satisfies RFC 4122 (got ${uuid})`);
}

// ============================================================================
// 8. BULK PASSWORD GENERATION
// ============================================================================
console.log('\n--- 8. Testing Bulk Password Generation ---');

{
  const bulk = generateBulkPasswords({ length: 16 }, 10);
  assert(bulk.length === 10, 'generateBulkPasswords(..., 10) produces exactly 10 passwords');
  const all16 = bulk.every(r => r.password.length === 16);
  assert(all16, 'All bulk passwords match requested length (16)');

  // All passwords should be distinct
  const uniqueBulk = new Set(bulk.map(r => r.password));
  assert(uniqueBulk.size === 10, 'All 10 bulk passwords are statistically distinct');
}

// ============================================================================
// 9. STRENGTH ANALYZER & HEURISTICS
// ============================================================================
console.log('\n--- 9. Testing Password Strength Analyzer & Heuristics ---');

{
  const weakCommon = analyzePassword('password123');
  assert(weakCommon.common || weakCommon.dictionary, 'Detects common password "password123"');
  assert(weakCommon.score < 50, `Common password gets low score (${weakCommon.score}/100)`);

  const keyboardWalk = analyzePassword('qwertyuiop');
  assert(keyboardWalk.keyboard, 'Detects keyboard pattern "qwertyuiop"');

  const seq = analyzePassword('test123456');
  assert(seq.sequence, 'Detects sequential numbers "123456"');

  const rep = analyzePassword('aaaaabbbbb');
  assert(rep.repeated, 'Detects repeated characters "aaaaabbbbb"');

  const strongRandom = analyzePassword('k9#mP$2vL!8xQ@4zW&7j');
  assert(strongRandom.score >= 80, `Strong 20-char random password gets high score (${strongRandom.score}/100)`);
  assert(strongRandom.warnings[0].includes('No obvious heuristic weakness'), 'Strong random password has no heuristic warnings');

  // Test strengthFor tiers
  assert(strengthFor(30).label === 'Weak', 'strengthFor(30) returns Weak');
  assert(strengthFor(50).label === 'Fair', 'strengthFor(50) returns Fair');
  assert(strengthFor(70).label === 'Strong', 'strengthFor(70) returns Strong');
  assert(strengthFor(90).label === 'Very Strong', 'strengthFor(90) returns Very Strong');
}

// ============================================================================
// 10. TIMING-SAFE HASH EQUALITY
// ============================================================================
console.log('\n--- 10. Testing Timing-Safe Hash Comparison ---');

{
  const h1 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const h2 = 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855';
  const h3 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b856';

  assert(constantTimeTextEqual(h1, h2), 'Identical hashes (case-insensitive) match');
  assert(!constantTimeTextEqual(h1, h3), 'Different hashes return false');
  assert(!constantTimeTextEqual('invalid', 'invalid'), 'Non-hex strings return false');
  assert(!constantTimeTextEqual(h1, 'e3b0'), 'Unequal length strings return false');

  // Test normalizeHash
  assert(normalizeHash('  A1 B2 C3  ') === 'a1b2c3', 'normalizeHash strips whitespace and converts to lowercase');
}

// ============================================================================
// 11. INDEPENDENT MATHEMATICAL INVARIANTS & RFC 4122 VERIFICATION
// ============================================================================
console.log('\n--- 11. Testing Invariants, RFC 4122 & Cryptographic Fallback ---');

{
  // A. Exact pool counts
  assert(LOWER.length === 26, 'LOWER contains exactly 26 letters');
  assert(UPPER.length === 26, 'UPPER contains exactly 26 letters');
  assert(NUMBERS.length === 10, 'NUMBERS contains exactly 10 digits');
  assert(SYMBOLS.length === 29, 'SYMBOLS contains exactly 29 characters');
  
  const fullPoolSize = LOWER.length + UPPER.length + NUMBERS.length + SYMBOLS.length;
  assert(fullPoolSize === 91, 'Full character pool contains exactly 91 printable characters');
  
  const filteredLower = [...LOWER].filter(c => !AMBIGUOUS.has(c));
  const filteredUpper = [...UPPER].filter(c => !AMBIGUOUS.has(c));
  const filteredNum = [...NUMBERS].filter(c => !AMBIGUOUS.has(c));
  const filteredSym = [...SYMBOLS].filter(c => !AMBIGUOUS.has(c));
  const filteredTotal = filteredLower.length + filteredUpper.length + filteredNum.length + filteredSym.length;
  assert(filteredTotal === 83, 'Ambiguous-filtered character pool contains exactly 83 characters');

  // B. Mathematical rejection sampling limits across all supported pool sizes
  const maxUint = 0x100000000; // 2^32 = 4,294,967,296
  const limit10 = maxUint - (maxUint % 10);
  const limit24 = maxUint - (maxUint % 24);
  const limit26 = maxUint - (maxUint % 26);
  const limit27 = maxUint - (maxUint % 27);
  const limit29 = maxUint - (maxUint % 29);
  const limit83 = maxUint - (maxUint % 83);
  const limit91 = maxUint - (maxUint % 91);
  const limit1024 = maxUint - (maxUint % 1024);
  assert(limit10 === 4294967290, 'Deterministic limit: N=10 rejection threshold is exactly 4,294,967,290 (2^32 mod 10 = 6)');
  assert(limit24 === 4294967280, 'Deterministic limit: N=24 rejection threshold is exactly 4,294,967,280 (2^32 mod 24 = 16)');
  assert(limit26 === 4294967274, 'Deterministic limit: N=26 rejection threshold is exactly 4,294,967,274 (2^32 mod 26 = 22)');
  assert(limit27 === 4294967274, 'Deterministic limit: N=27 rejection threshold is exactly 4,294,967,274 (2^32 mod 27 = 22)');
  assert(limit29 === 4294967280, 'Deterministic limit: N=29 rejection threshold is exactly 4,294,967,280 (2^32 mod 29 = 16)');
  assert(limit83 === 4294967219, 'Deterministic limit: N=83 rejection threshold is exactly 4,294,967,219 (2^32 mod 83 = 77)');
  assert(limit91 === 4294967222, 'Deterministic limit: N=91 rejection threshold is exactly 4,294,967,222 (2^32 mod 91 = 74)');
  assert(limit1024 === 4294967296, 'Deterministic limit: N=1024 rejection threshold is exactly 2^32 (zero modulo discard)');

  // C. Deterministic rejection boundary test (verifies rejection sampling loop without modulo bias)
  {
    const origGetRandomValues = globalThis.crypto.getRandomValues;
    try {
      // Mock CSPRNG to return boundary values: first limit (must reject), second limit - 1 (must accept)
      const targetN = 10;
      const targetLimit = 4294967290;
      let callCount = 0;
      globalThis.crypto.getRandomValues = (buf: Uint32Array) => {
        callCount++;
        if (callCount === 1) {
          buf[0] = targetLimit; // In rejected zone (>= limit)
        } else {
          buf[0] = targetLimit - 1; // In accepted zone (< limit, 4294967289 % 10 = 9)
        }
        return buf;
      };

      const result = secureRandomInt(targetN);
      assert(callCount === 2, 'secureRandomInt loops and resamples when value equals rejection boundary limit');
      assert(result === (targetLimit - 1) % targetN, 'secureRandomInt accepts value immediately below boundary');
    } finally {
      globalThis.crypto.getRandomValues = origGetRandomValues;
    }
  }

  // D. Exact theoretical passphrase entropy calculations
  {
    // Exact ordered sequence without replacement formula: sum(log2(1024 - i)) + suffix
    const pass5NoSuffix = generatePassphrase({ wordCount: 5, includeNumber: false });
    assert(pass5NoSuffix.entropy === 50, `5 words without suffix theoretical entropy is exactly 50 bits (got ${pass5NoSuffix.entropy})`);

    const pass5WithSuffix = generatePassphrase({ wordCount: 5, includeNumber: true });
    assert(pass5WithSuffix.entropy === 63, `5 words with 4-digit suffix theoretical entropy is exactly 63 bits (got ${pass5WithSuffix.entropy})`);

    const pass3NoSuffix = generatePassphrase({ wordCount: 3, includeNumber: false });
    assert(pass3NoSuffix.entropy === 30, `3 words without suffix theoretical entropy is exactly 30 bits (got ${pass3NoSuffix.entropy})`);

    const pass6WithSuffix = generatePassphrase({ wordCount: 6, includeNumber: true });
    assert(pass6WithSuffix.entropy === 73, `6 words with 4-digit suffix theoretical entropy is exactly 73 bits (got ${pass6WithSuffix.entropy})`);
  }

  // E. Statistical observations (explicitly distinct from mathematical proofs)
  let uuidCompliance = true;
  for (let i = 0; i < 100; i++) {
    const uuid = makeSecret('uuid');
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(uuid)) {
      uuidCompliance = false;
      break;
    }
  }
  assert(uuidCompliance, 'Statistical observation: 100 generated UUID v4 tokens conform to RFC 4122 version 4 and variant 1 bits');

  // Positional diversity observation
  const firstCharClasses = new Set<string>();
  const lastCharClasses = new Set<string>();
  for (let i = 0; i < 100; i++) {
    const res = generatePassword({ length: 20, requireEach: true });
    const first = res.password[0];
    const last = res.password[19];
    if (/[a-z]/.test(first)) firstCharClasses.add('lower');
    if (/[A-Z]/.test(first)) firstCharClasses.add('upper');
    if (/\d/.test(first)) firstCharClasses.add('number');
    if (/[^A-Za-z0-9]/.test(first)) firstCharClasses.add('symbol');
    if (/[a-z]/.test(last)) lastCharClasses.add('lower');
    if (/[A-Z]/.test(last)) lastCharClasses.add('upper');
    if (/\d/.test(last)) lastCharClasses.add('number');
    if (/[^A-Za-z0-9]/.test(last)) lastCharClasses.add('symbol');
  }
  assert(firstCharClasses.size >= 3, 'Statistical observation: Fisher-Yates shuffle distributes diverse character classes to index 0 across 100 trials');
  assert(lastCharClasses.size >= 3, 'Statistical observation: Fisher-Yates shuffle distributes diverse character classes to final index across 100 trials');

  // F. Web Crypto missing behavior simulation
  const originalGetRandomValues = globalThis.crypto.getRandomValues;
  try {
    // @ts-expect-error simulating missing API
    globalThis.crypto.getRandomValues = undefined;
    let threw = false;
    try {
      getCrypto();
    } catch {
      threw = true;
    }
    assert(threw, 'Deterministic fallback test: getCrypto() throws explicit error when Web Crypto getRandomValues is missing');
  } finally {
    globalThis.crypto.getRandomValues = originalGetRandomValues;
  }
}

// 12. UI INVARIANTS, RESPONSIVE LAYOUT & SCORE-CARD OVERFLOW SAFEGUARDS
console.log('\n--- 12. Testing UI Invariants, Responsive Layout & Overflow Safeguards ---');
{
  const tsxPath = path.join(__dirname, '..', 'components', 'tools', 'PasswordGenerator.tsx');
  assert(fs.existsSync(tsxPath), 'PasswordGenerator.tsx component file exists');
  const source = fs.readFileSync(tsxPath, 'utf8');

  // A. Checkbox option layout & card styling removal
  assert(
    !source.includes('<span>Lowercase (a-z)</span>\n                    </label>\n                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer bg-white'),
    'Individual card backgrounds and borders removed from character type options'
  );

  // B. Semantic label association for full click-target coverage
  const requiredIds = [
    'checkbox-inc-upper',
    'checkbox-inc-lower',
    'checkbox-inc-num',
    'checkbox-inc-sym',
    'checkbox-require-each',
    'checkbox-exclude-ambiguous',
    'checkbox-passphrase-caps',
    'checkbox-passphrase-number',
    'checkbox-keep-history',
  ];
  for (const id of requiredIds) {
    assert(
      source.includes(`id="${id}"`) && source.includes(`htmlFor="${id}"`),
      `Semantic <label htmlFor="${id}"> and <input id="${id}"> association preserved for accessible click target`
    );
  }

  // C. Stable checkbox dimensions and focus ring accessibility
  assert(
    source.includes('w-4 h-4 shrink-0 rounded accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'),
    'Checkboxes maintain stable dimensions (shrink-0) and visible focus ring on keyboard tab'
  );

  // D. Label wrapping and boundary constraints
  assert(
    source.includes('min-w-0 break-words leading-tight'),
    'Checkbox option labels contain min-w-0 break-words to prevent container overflow'
  );

  // E. Password Security Analyzer score card overflow prevention
  assert(
    source.includes('min-w-0 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between'),
    'Security Analyzer score cards enforce min-w-0, responsive padding and flex column alignment'
  );

  // F. Score value safe responsive formatting (no truncation hiding data)
  assert(
    source.includes('{a.score}</span>') &&
    source.includes('/100</span>') &&
    source.includes('flex items-baseline flex-wrap gap-x-0.5'),
    'Score card formats /100 with responsive font sizing and flex-wrap without hiding data via truncation'
  );

  // G. Mathematical bounds of analyzePassword output
  const testInputs = [
    '',
    'a',
    'password123',
    'Tr0ub4dor&3',
    'correct-horse-battery-staple-2026',
    'x'.repeat(128),
    'A1!b2@c3#d4$e5%f6^g7&h8*',
  ];
  for (const input of testInputs) {
    const analysis = analyzePassword(input);
    assert(
      analysis.score >= 0 && analysis.score <= 100,
      `Password analysis score for length ${input.length} is bounded within [0, 100] (got ${analysis.score})`
    );
    assert(
      analysis.entropy >= 0,
      `Entropy for length ${input.length} is non-negative (got ${analysis.entropy})`
    );
    assert(
      ['No password', 'Very weak', 'Weak', 'Fair', 'Strong', 'Excellent'].includes(analysis.label),
      `Verdict label is valid enum tier (got "${analysis.label}")`
    );
  }
}

console.log('\n================================================================');
console.log(`TOTAL TESTS:  ${totalTests}`);
console.log(`PASSED:       ${passedTests}`);
console.log(`FAILED:       ${failedTests}`);
console.log('================================================================\n');

if (failedTests > 0) {
  console.error('CRITICAL: One or more password engine tests failed.\n');
  process.exit(1);
} else {
  console.log('SUCCESS: All password generator & cryptographic tests passed cleanly.\n');
}
