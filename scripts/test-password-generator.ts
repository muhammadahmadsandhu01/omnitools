/**
 * OmniTools Password Generator & Cryptographic Engine Test Suite
 *
 * Reproducible functional, cryptographic, and security regression suite.
 * Run with: npm run test:password
 */

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
