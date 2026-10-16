import {
  tokenizeIdentifier,
  toUpperCase,
  toLowerCase,
  toTitleCase,
  toSentenceCase,
  toCapitalizedCase,
  toAlternatingCase,
  toInverseCase,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  toConstantCase,
  toDotCase,
  toPathCase,
  toCobolCase,
  convertText,
  cleanupText,
  calculateTextStats,
  type CaseMode,
} from '../lib/textCaseEngine';
import { TEXT_CASE_FAQS } from '../components/seo/TextCaseConverterSeo';
import { tools } from '../config/toolsData';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures: Array<{ test: string; expected: any; actual: any }> = [];

function assert(condition: boolean, testName: string, expected?: any, actual?: any) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testName}`);
    if (expected !== undefined && actual !== undefined) {
      console.error(`         Expected: ${JSON.stringify(expected)}`);
      console.error(`         Actual:   ${JSON.stringify(actual)}`);
    }
    failures.push({ test: testName, expected, actual });
  }
}

function assertEqual<T>(actual: T, expected: T, testName: string) {
  const match = JSON.stringify(actual) === JSON.stringify(expected);
  assert(match, testName, expected, actual);
}

console.log('================================================================');
console.log('       OMNITOOLS TEXT CASE CONVERTER — AUTOMATED TEST SUITE     ');
console.log('================================================================\n');

// -------------------------------------------------------------
// TEST GROUP 1: Standard Writing Cases
// -------------------------------------------------------------
console.log('Test Group 1: Standard Writing Cases');
assertEqual(toUpperCase('hello world'), 'HELLO WORLD', 'toUpperCase converts basic string');
assertEqual(toUpperCase('abc 123 !@#'), 'ABC 123 !@#', 'toUpperCase preserves numbers & symbols');
assertEqual(toUpperCase('café résumé'), 'CAFÉ RÉSUMÉ', 'toUpperCase handles accented French characters');
assertEqual(toUpperCase(''), '', 'toUpperCase handles empty string');

assertEqual(toLowerCase('HELLO WORLD'), 'hello world', 'toLowerCase converts basic string');
assertEqual(toLowerCase('ABC 123 !@#'), 'abc 123 !@#', 'toLowerCase preserves numbers & symbols');
assertEqual(toLowerCase('CAFÉ RÉSUMÉ'), 'café résumé', 'toLowerCase handles accented French characters');
assertEqual(toLowerCase(''), '', 'toLowerCase handles empty string');

// Title Case
assertEqual(toTitleCase('the quick brown fox'), 'The Quick Brown Fox', 'toTitleCase capitalizes principal words');
assertEqual(toTitleCase('war and peace'), 'War and Peace', 'toTitleCase keeps coordinating conjunction "and" lowercase');
assertEqual(toTitleCase('the lord of the rings'), 'The Lord of the Rings', 'toTitleCase handles articles and prepositions in title');
assertEqual(toTitleCase('an apple a day'), 'An Apple a Day', 'toTitleCase capitalizes initial article');
assertEqual(toTitleCase('gone with the wind'), 'Gone With the Wind', 'toTitleCase capitalizes 4-letter preposition "With" while keeping article "the" lowercase');
assertEqual(toTitleCase('step-by-step tutorial'), 'Step-by-Step Tutorial', 'toTitleCase handles hyphenated words');
assertEqual(toTitleCase('hello: a new dawn'), 'Hello: A New Dawn', 'toTitleCase capitalizes word after colon');
assertEqual(toTitleCase(''), '', 'toTitleCase handles empty string');

// Sentence Case
assertEqual(toSentenceCase('the quick brown fox. it was fast!'), 'The quick brown fox. It was fast!', 'toSentenceCase capitalizes first word of sentences');
assertEqual(toSentenceCase('hello? yes, indeed.'), 'Hello? Yes, indeed.', 'toSentenceCase handles question marks');
assertEqual(toSentenceCase('version 2.5 is released.'), 'Version 2.5 is released.', 'toSentenceCase does not falsely treat decimal numbers as sentence ends');
assertEqual(toSentenceCase('visit example.com for details.'), 'Visit example.com for details.', 'toSentenceCase handles URLs/domains');
assertEqual(toSentenceCase('line one\nline two\nline three'), 'Line one\nLine two\nLine three', 'toSentenceCase capitalizes each new line');
assertEqual(toSentenceCase(''), '', 'toSentenceCase handles empty string');

// Capitalized Case
assertEqual(toCapitalizedCase('the quick brown fox and the hound'), 'The Quick Brown Fox And The Hound', 'toCapitalizedCase capitalizes every single word without exception');
assertEqual(toCapitalizedCase(''), '', 'toCapitalizedCase handles empty string');

// Alternating Case
assertEqual(toAlternatingCase('hello world'), 'hElLo WoRlD', 'toAlternatingCase alternates case characters across words');
assertEqual(toAlternatingCase('abc 123 def'), 'aBc 123 DeF', 'toAlternatingCase preserves parity across non-letters');

// Inverse Case
assertEqual(toInverseCase('Hello World'), 'hELLO wORLD', 'toInverseCase inverts case of characters');
assertEqual(toInverseCase('cAPS lOCK'), 'Caps Lock', 'toInverseCase repairs accidental Caps Lock string');

// -------------------------------------------------------------
// TEST GROUP 2: Developer Identifier Tokenization & Formats
// -------------------------------------------------------------
console.log('\nTest Group 2: Developer Identifier Formats');

// Tokenizer
assertEqual(tokenizeIdentifier('hello-world'), ['hello', 'world'], 'tokenizeIdentifier handles kebab-case');
assertEqual(tokenizeIdentifier('hello_world'), ['hello', 'world'], 'tokenizeIdentifier handles snake_case');
assertEqual(tokenizeIdentifier('helloWorld'), ['hello', 'World'], 'tokenizeIdentifier handles camelCase');
assertEqual(tokenizeIdentifier('HelloWorld'), ['Hello', 'World'], 'tokenizeIdentifier handles PascalCase');
assertEqual(tokenizeIdentifier('XMLHttpRequest'), ['XML', 'Http', 'Request'], 'tokenizeIdentifier handles leading acronym');
assertEqual(tokenizeIdentifier('parseJSONResponse'), ['parse', 'JSON', 'Response'], 'tokenizeIdentifier handles middle acronym');
assertEqual(tokenizeIdentifier('getUserID'), ['get', 'User', 'ID'], 'tokenizeIdentifier handles trailing acronym');
assertEqual(tokenizeIdentifier('IPv6Address'), ['IPv6', 'Address'], 'tokenizeIdentifier handles versioned protocol IPv6');
assertEqual(tokenizeIdentifier('OAuth2Client'), ['OAuth', '2', 'Client'], 'tokenizeIdentifier handles OAuth2');
assertEqual(tokenizeIdentifier('HTML5Canvas'), ['HTML', '5', 'Canvas'], 'tokenizeIdentifier handles HTML5');
assertEqual(tokenizeIdentifier('foo.bar.baz'), ['foo', 'bar', 'baz'], 'tokenizeIdentifier handles dot notation');
assertEqual(tokenizeIdentifier('src/components/tool'), ['src', 'components', 'tool'], 'tokenizeIdentifier handles path notation');

// camelCase
assertEqual(toCamelCase('hello world'), 'helloWorld', 'toCamelCase basic');
assertEqual(toCamelCase('XMLHttpRequest'), 'xmlHttpRequest', 'toCamelCase acronym preservation');
assertEqual(toCamelCase('user_first_name'), 'userFirstName', 'toCamelCase from snake_case');

// PascalCase
assertEqual(toPascalCase('hello world'), 'HelloWorld', 'toPascalCase basic');
assertEqual(toPascalCase('user_first_name'), 'UserFirstName', 'toPascalCase from snake_case');
assertEqual(toPascalCase('xml_http_request'), 'XmlHttpRequest', 'toPascalCase acronym');

// snake_case
assertEqual(toSnakeCase('hello world'), 'hello_world', 'toSnakeCase basic');
assertEqual(toSnakeCase('helloWorld'), 'hello_world', 'toSnakeCase from camelCase');
assertEqual(toSnakeCase('XMLHttpRequest'), 'xml_http_request', 'toSnakeCase acronym splitting');

// kebab-case
assertEqual(toKebabCase('hello world'), 'hello-world', 'toKebabCase basic');
assertEqual(toKebabCase('HelloWorld'), 'hello-world', 'toKebabCase from PascalCase');
assertEqual(toKebabCase('user_profile_card'), 'user-profile-card', 'toKebabCase from snake_case');

// CONSTANT_CASE
assertEqual(toConstantCase('hello world'), 'HELLO_WORLD', 'toConstantCase basic');
assertEqual(toConstantCase('maxRetryAttempts'), 'MAX_RETRY_ATTEMPTS', 'toConstantCase from camelCase');

// dot.case
assertEqual(toDotCase('hello world'), 'hello.world', 'toDotCase basic');
assertEqual(toDotCase('config_network_timeout'), 'config.network.timeout', 'toDotCase from snake_case');

// path/case
assertEqual(toPathCase('hello world'), 'hello/world', 'toPathCase basic');
assertEqual(toPathCase('components_tools_case'), 'components/tools/case', 'toPathCase from snake_case');

// COBOL-CASE
assertEqual(toCobolCase('hello world'), 'HELLO-WORLD', 'toCobolCase basic');
assertEqual(toCobolCase('customer_balance'), 'CUSTOMER-BALANCE', 'toCobolCase from snake_case');

// -------------------------------------------------------------
// TEST GROUP 3: Multiline & Line Preservation
// -------------------------------------------------------------
console.log('\nTest Group 3: Multiline & Line Preservation');
const multilineSql = 'user_id\nfirst_name\nlast_name\ncreated_at';
const multilineCamel = 'userId\nfirstName\nlastName\ncreatedAt';
assertEqual(
  convertText(multilineSql, 'camel', { preserveLines: true }),
  multilineCamel,
  'convertText with preserveLines: true keeps independent rows'
);

assertEqual(
  convertText(multilineSql, 'camel', { preserveLines: false }),
  'userIdFirstNameLastNameCreatedAt',
  'convertText with preserveLines: false concatenates into single identifier'
);

// -------------------------------------------------------------
// TEST GROUP 4: Internationalization & Orthography
// -------------------------------------------------------------
console.log('\nTest Group 4: Internationalization & Orthography');

// Turkish / Azerbaijani (tr, az)
assertEqual(toUpperCase('istanbul', 'tr'), 'İSTANBUL', 'Turkish uppercase converts "i" to dotted "İ"');
assertEqual(toUpperCase('ığdır', 'tr'), 'IĞDIR', 'Turkish uppercase converts dotless "ı" to "I"');
assertEqual(toLowerCase('İSTANBUL', 'tr'), 'istanbul', 'Turkish lowercase converts dotted "İ" to "i"');
assertEqual(toLowerCase('IĞDIR', 'tr'), 'ığdır', 'Turkish lowercase converts "I" to dotless "ı"');
assertEqual(toConstantCase('istanbul_park', true, 'tr'), 'İSTANBUL_PARK', 'Turkish CONSTANT_CASE respects dotted İ');

// German (de)
assertEqual(toUpperCase('straße', 'de'), 'STRASSE', 'German uppercase converts "ß" to "SS"');
assertEqual(toLowerCase('GROßE', 'de'), 'große', 'German lowercase preserves "ß"');
assertEqual(toConstantCase('straße_name', true, 'de'), 'STRASSE_NAME', 'German CONSTANT_CASE converts "ß" to "SS"');

// Dutch (nl)
assertEqual(toTitleCase('ijsberg', 'nl'), 'IJsberg', 'Dutch title case capitalizes "IJ" digraph together');
assertEqual(toPascalCase('ijsberg', true, 'nl'), 'IJsberg', 'Dutch PascalCase capitalizes "IJ" digraph together');
assertEqual(toSentenceCase('ijsselmeer is groot.', 'nl'), 'IJsselmeer is groot.', 'Dutch sentence case capitalizes "IJ" at start');

// Greek (el)
assertEqual(toLowerCase('ΚΌΣΜΟΣ', 'el'), 'κόσμος', 'Greek lowercase converts final capital sigma to "ς"');
assertEqual(toUpperCase('κόσμος', 'el'), 'ΚΟΣΜΟΣ', 'Greek uppercase strips monotonic tonos per orthography');

// Unicameral Scripts (Arabic, Hebrew, Devanagari, Chinese)
const arabicText = 'مرحبا بالعالم';
assertEqual(toUpperCase(arabicText, 'ar'), arabicText, 'Arabic text is preserved by toUpperCase');
assertEqual(toSnakeCase(arabicText, true, 'ar'), 'مرحبا_بالعالم', 'Arabic text splits words with underscore in snake_case');
assertEqual(toKebabCase(arabicText, true, 'ar'), 'مرحبا-بالعالم', 'Arabic text splits words with hyphen in kebab-case');

const hebrewText = 'שלום עולם';
assertEqual(toUpperCase(hebrewText, 'he'), hebrewText, 'Hebrew text is preserved by toUpperCase');
assertEqual(toSnakeCase(hebrewText, true, 'he'), 'שלום_עולם', 'Hebrew text splits words with underscore in snake_case');

const chineseText = '你好世界';
assertEqual(toUpperCase(chineseText, 'zh'), chineseText, 'Chinese text is preserved by toUpperCase');

// -------------------------------------------------------------
// TEST GROUP 5: Text Cleanups & Statistics
// -------------------------------------------------------------
console.log('\nTest Group 5: Text Cleanups & Statistics');

assertEqual(cleanupText('   hello world   ', 'trim'), 'hello world', 'cleanupText trim strips outer whitespace');
assertEqual(cleanupText('hello    world   again', 'normalize-spaces'), 'hello world again', 'cleanupText normalize-spaces');
assertEqual(cleanupText('line 1\n\n\nline 2\n', 'remove-blank-lines'), 'line 1\nline 2', 'cleanupText remove-blank-lines');
assertEqual(cleanupText('  line 1  \n  line 2  ', 'trim-lines'), 'line 1\nline 2', 'cleanupText trim-lines');

const sampleStatsText = 'The quick brown fox. Dr. Smith arrived at 2.5 PM!\n\nSecond paragraph here?';
const stats = calculateTextStats(sampleStatsText);
assert(stats.words === 13, 'calculateTextStats accurately counts words', 13, stats.words);
assert(stats.paragraphs === 2, 'calculateTextStats accurately counts paragraphs', 2, stats.paragraphs);
assert(stats.sentences === 3, 'calculateTextStats accurately counts sentences (. ! ?)', 3, stats.sentences);
assert(stats.characters > 0, 'calculateTextStats characters > 0');
assert(stats.charactersNoSpaces < stats.characters, 'charactersNoSpaces is less than total characters');

// -------------------------------------------------------------
// TEST GROUP 6: Edge Cases & Robustness
// -------------------------------------------------------------
console.log('\nTest Group 6: Edge Cases & Robustness');

const allModes: CaseMode[] = [
  'upper', 'lower', 'title', 'sentence', 'capitalized', 'alternating', 'inverse',
  'camel', 'pascal', 'snake', 'kebab', 'constant', 'dot', 'path', 'cobol'
];

for (const mode of allModes) {
  assertEqual(convertText('', mode), '', `convertText handles empty input in mode "${mode}"`);
  if (['upper', 'lower', 'title', 'sentence', 'capitalized', 'alternating', 'inverse'].includes(mode)) {
    assertEqual(convertText('   ', mode), '   ', `convertText preserves whitespace-only input in standard mode "${mode}"`);
  } else {
    assertEqual(convertText('   ', mode), '', `convertText collapses whitespace-only input in developer mode "${mode}"`);
  }
}

assertEqual(convertText('... --- ...', 'sentence'), '... --- ...', 'convertText preserves pure punctuation');
assertEqual(convertText('1234567890', 'camel'), '1234567890', 'convertText preserves pure numbers in camelCase');
assertEqual(convertText('123 456 789', 'snake'), '123_456_789', 'convertText joins numbers with underscore in snake_case');

// Graceful fallback for invalid/malformed locales
const badLocales = ['xyz-invalid-999', '123_BAD', '??-##', 'en-INVALID-LOCALE-EXTRA-LONG-TAG'];
for (const badLoc of badLocales) {
  assertEqual(toUpperCase('test', badLoc), 'TEST', `toUpperCase gracefully falls back on bad locale "${badLoc}"`);
  assertEqual(toCamelCase('test_var', true, badLoc), 'testVar', `toCamelCase gracefully falls back on bad locale "${badLoc}"`);
}

// -------------------------------------------------------------
// TEST GROUP 7: SEO Registry & Metadata Verification
// -------------------------------------------------------------
console.log('\nTest Group 7: SEO Registry & Metadata Verification');

const toolEntry = tools.find((t) => t.slug === 'text-case-converter');
assert(Boolean(toolEntry), 'toolsData contains "text-case-converter"');
assert(toolEntry?.categoryId === 'seo', 'Category is "seo"');
assert(toolEntry?.status === 'published', 'Status is "published"');
assert(Boolean(toolEntry?.seoTitle?.includes('Text Case Converter')), 'seoTitle includes "Text Case Converter"');
assert(Boolean(toolEntry?.seoDescription && toolEntry.seoDescription.length > 50), 'seoDescription is comprehensive');

assert(TEXT_CASE_FAQS.length >= 10, 'TEXT_CASE_FAQS contains at least 10 comprehensive items', '>=10', TEXT_CASE_FAQS.length);
for (const faq of TEXT_CASE_FAQS) {
  assert(faq.question.length > 10, `FAQ question is descriptive: "${faq.question.slice(0, 30)}..."`);
  assert(faq.answer.length > 30, `FAQ answer is thorough: "${faq.answer.slice(0, 40)}..."`);
}

console.log('\n================================================================');
console.log(`TEST RESULTS: ${passedTests} passed, ${failedTests} failed (${totalTests} total)`);
console.log('================================================================\n');

if (failedTests > 0) {
  console.error(`FAILURE: ${failedTests} test(s) failed.`);
  process.exit(1);
} else {
  console.log('SUCCESS: All Text Case Converter regression tests passed cleanly.');
}
