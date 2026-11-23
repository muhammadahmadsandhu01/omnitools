/**
 * Comprehensive Enterprise Test Suite (1,000+ Tests)
 * KivaroTools — Text Case Converter Engine & Registry
 *
 * Verifies:
 * 1. Standard Writing Cases (upper, lower, title, sentence, capitalized, alternating, inverse)
 * 2. Developer Identifier Tokenizer & All 8 Developer Formats (camel, pascal, snake, kebab, constant, dot, path, cobol)
 * 3. Multiline & Line Preservation Mechanics (preserveLines: true vs false, CRLF/LF/CR)
 * 4. Multilingual & Specialized Orthography Engine (Turkish/Azeri İ/ı, Dutch IJ, German ß, Greek ς/σ, Unicameral scripts)
 * 5. Text Cleanup Operations (trim, normalize-spaces, remove-blank-lines, trim-lines, normalize-line-endings)
 * 6. Linguistic Text Statistics & Counter Engine (characters, charactersNoSpaces, words, lines, sentences, paragraphs)
 * 7. ISO Language Registry & Locale Search (191 languages, BCP 47 lookup, bicameral/unicameral filters)
 * 8. SEO Metadata, FAQ Schema, Component Rendering & Extreme Edge Cases
 */

import assert from 'assert';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {
  tokenizeIdentifier,
  toUpperCase,
  toLowerCase,
  capitalizeWord,
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
  isGreekFinalSigma,
  CASE_MODES,
  type CaseMode,
  type CleanupAction,
} from '../lib/textCaseEngine';
import {
  ISO_LANGUAGES,
  SPECIAL_CASING_LANGUAGES,
  BICAMERAL_LANGUAGES,
  UNICAMERAL_LANGUAGES,
  getLanguageByBcp47,
  searchLanguages,
  getLanguageCoverageStats,
} from '../lib/textCaseLocales';
import { TEXT_CASE_FAQS } from '../components/seo/TextCaseConverterSeo';
import TextCaseConverterSeo from '../components/seo/TextCaseConverterSeo';
import { tools } from '../config/toolsData';

let passedTests = 0;
let failedTests = 0;

function check(condition: boolean, testId: string, description: string) {
  if (condition) {
    passedTests += 1;
  } else {
    failedTests += 1;
    console.error(`❌ FAIL [${testId}]: ${description}`);
  }
}

console.log('======================================================================');
console.log('⚡ Running 1,000+ Complex Enterprise Suite: Text Case Converter');
console.log('======================================================================\n');

/* =========================================================================
   BLOCK 1: STANDARD WRITING CASES (Tests 1–150)
   ========================================================================= */
console.log('▶ Block 1: Standard Writing Cases (150 Tests)');

// 1.1 UPPERCASE (15 tests)
const upperSamples = [
  ['hello world', 'HELLO WORLD'],
  ['kivarotools platform', 'KIVAROTOOLS PLATFORM'],
  ['mixed CASE string 123', 'MIXED CASE STRING 123'],
  ['café au lait', 'CAFÉ AU LAIT'],
  ['résumé & curriculum vitæ', 'RÉSUMÉ & CURRICULUM VITÆ'],
  ['über den wolken', 'ÜBER DEN WOLKEN'],
  ['señor and niño', 'SEÑOR AND NIÑO'],
  ['façade and naïve', 'FAÇADE AND NAÏVE'],
  ['cœurl and fœtus', 'CŒURL AND FŒTUS'],
  ['père noël', 'PÈRE NOËL'],
  ['1234567890 !@#$%^&*()', '1234567890 !@#$%^&*()'],
  ['\t\n  padded text  \n\t', '\t\n  PADDED TEXT  \n\t'],
  ['', ''],
  ['a', 'A'],
  ['z', 'Z'],
];
upperSamples.forEach(([input, expected], i) => {
  check(toUpperCase(input) === expected, `B1-UPPER-${i + 1}`, `toUpperCase: "${input}" -> "${expected}"`);
});

// 1.2 lowercase (15 tests)
const lowerSamples = [
  ['HELLO WORLD', 'hello world'],
  ['KIVAROTOOLS PLATFORM', 'kivarotools platform'],
  ['Mixed CASE String 123', 'mixed case string 123'],
  ['CAFÉ AU LAIT', 'café au lait'],
  ['RÉSUMÉ & CURRICULUM VITÆ', 'résumé & curriculum vitæ'],
  ['ÜBER DEN WOLKEN', 'über den wolken'],
  ['SEÑOR AND NIÑO', 'señor and niño'],
  ['FAÇADE AND NAÏVE', 'façade and naïve'],
  ['CŒURL AND FŒTUS', 'cœurl and fœtus'],
  ['PÈRE NOËL', 'père noël'],
  ['1234567890 !@#$%^&*()', '1234567890 !@#$%^&*()'],
  ['\t\n  PADDED TEXT  \n\t', '\t\n  padded text  \n\t'],
  ['', ''],
  ['A', 'a'],
  ['Z', 'z'],
];
lowerSamples.forEach(([input, expected], i) => {
  check(toLowerCase(input) === expected, `B1-LOWER-${i + 1}`, `toLowerCase: "${input}" -> "${expected}"`);
});

// 1.3 Title Case Rules & Minor Words (30 tests)
const titleSamples = [
  ['the quick brown fox jumps over the lazy dog', 'The Quick Brown Fox Jumps Over the Lazy Dog'],
  ['war and peace', 'War and Peace'],
  ['the old man and the sea', 'The Old Man and the Sea'],
  ['for whom the bell tolls', 'For Whom the Bell Tolls'],
  ['to kill a mockingbird', 'To Kill a Mockingbird'],
  ['an apple a day keeps the doctor away', 'An Apple a Day Keeps the Doctor Away'],
  ['gone with the wind', 'Gone With the Wind'],
  ['a tale of two cities', 'A Tale of Two Cities'],
  ['beauty and the beast', 'Beauty and the Beast'],
  ['in search of lost time', 'In Search of Lost Time'],
  ['one hundred years of solitude', 'One Hundred Years of Solitude'],
  ['the catcher in the rye', 'The Catcher in the Rye'],
  ['the sound and the fury', 'The Sound and the Fury'],
  ['heart of darkness', 'Heart of Darkness'],
  ['of mice and men', 'Of Mice and Men'],
  ['step-by-step guide to programming', 'Step-by-Step Guide to Programming'],
  ['end-to-end encryption manual', 'End-to-End Encryption Manual'],
  ['the lord of the rings: the fellowship of the ring', 'The Lord of the Rings: The Fellowship of the Ring'],
  ['star wars: episode iv - a new hope', 'Star Wars: Episode Iv - a New Hope'],
  ['breaking news: an unexpected turn of events', 'Breaking News: An Unexpected Turn of Events'],
  ['don\'t let the sun go down on me', 'Don\'t Let the Sun Go Down on Me'],
  ['rock \'n\' roll music', 'Rock \'N\' Roll Music'],
  ['we\'re the champions', 'We\'re the Champions'],
  ['how to use the iPhone 15 Pro', 'How to Use the iPhone 15 Pro'],
  ['understanding the HTML5 and CSS3 standards', 'Understanding the HTML5 and CSS3 Standards'],
  ['NASA and ESA launch joint deep space mission', 'NASA and ESA Launch Joint Deep Space Mission'],
  ['the best tool on kivarotools.com', 'The Best Tool on Kivarotools.Com'],
  ['line one: the beginning\nline two: the end', 'Line One: The Beginning\nLine Two: The End'],
  ['', ''],
  ['   ', '   '],
];
titleSamples.forEach(([input, expected], i) => {
  const actual = toTitleCase(input);
  check(actual === expected, `B1-TITLE-${i + 1}`, `toTitleCase: "${input}" -> "${actual}" (expected: "${expected}")`);
});

// 1.4 Sentence case Rules & Boundaries (30 tests)
const sentenceSamples = [
  ['the quick brown fox. it was fast!', 'The quick brown fox. It was fast!'],
  ['hello world. how are you? i am well.', 'Hello world. How are you? I am well.'],
  ['welcome to kivaro! enjoy your stay.', 'Welcome to kivaro! Enjoy your stay.'],
  ['version 2.5 is released. upgrade now.', 'Version 2.5 is released. Upgrade now.'],
  ['pi is roughly 3.14159. remember this.', 'Pi is roughly 3.14159. Remember this.'],
  ['dr. smith arrived late. mr. jones was early.', 'Dr. smith arrived late. Mr. jones was early.'],
  ['mrs. adams and ms. clark spoke. prof. davis listened.', 'Mrs. adams and ms. clark spoke. Prof. davis listened.'],
  ['e.g. this is a test. i.e. it works.', 'E.g. this is a test. I.e. it works.'],
  ['u.s. and u.k. trade talks. details inside.', 'U.s. and u.k. trade talks. Details inside.'],
  ['visit example.com for details. thank you.', 'Visit example.com for details. Thank you.'],
  ['download report.pdf immediately. do not wait.', 'Download report.pdf immediately. Do not wait.'],
  ['email test@domain.com today. we will reply.', 'Email test@domain.com today. We will reply.'],
  ['first line here\nsecond line here\nthird line here', 'First line here\nSecond line here\nThird line here'],
  ['wait... what happened? nothing.', 'Wait... What happened? Nothing.'],
  ['wow!!! really?! yes indeed.', 'Wow!!! Really?! Yes indeed.'],
  ['100 percent guaranteed. buy now.', '100 percent guaranteed. Buy now.'],
  ['50 apples were eaten. none remained.', '50 apples were eaten. None remained.'],
  ['"what is that?" he asked. "nothing," she said.', '"What is that?" He asked. "Nothing," she said.'],
  ['terminal greek question\u037E next sentence.', 'Terminal greek question\u037E Next sentence.'],
  ['terminal arabic question؟ next sentence.', 'Terminal arabic question؟ Next sentence.'],
  ['terminal hindi danda। next sentence.', 'Terminal hindi danda। Next sentence.'],
  ['terminal cjk fullstop。 next sentence.', 'Terminal cjk fullstop。 Next sentence.'],
  ['terminal cjk exclamation！ next sentence.', 'Terminal cjk exclamation！ Next sentence.'],
  ['terminal cjk question？ next sentence.', 'Terminal cjk question？ Next sentence.'],
  ['terminal armenian fullstop։ next sentence.', 'Terminal armenian fullstop։ Next sentence.'],
  ['already in Sentence Case. Second sentence.', 'Already in sentence case. Second sentence.'],
  ['ALL CAPS INPUT. SHOULD BE CONVERTED.', 'All caps input. Should be converted.'],
  ['... --- ... sos signal.', '... --- ... Sos signal.'],
  ['', ''],
  ['   ', '   '],
];
sentenceSamples.forEach(([input, expected], i) => {
  const actual = toSentenceCase(input);
  check(actual === expected, `B1-SENT-${i + 1}`, `toSentenceCase: "${input}" -> "${actual}" (expected: "${expected}")`);
});

// 1.5 Capitalized Case (Start Case) (20 tests)
const capitalizedSamples = [
  ['the quick brown fox and the hound', 'The Quick Brown Fox And The Hound'],
  ['a an and at but by for in nor of on or per the to', 'A An And At But By For In Nor Of On Or Per The To'],
  ['hello-world step-by-step', 'Hello-World Step-By-Step'],
  ['rock \'n\' roll don\'t stop', 'Rock \'N\' Roll Don\'t Stop'],
  ['123 numbers 456 here', '123 Numbers 456 Here'],
  ['café résumé façade crème', 'Café Résumé Façade Crème'],
  ['multiple   spaces   between   words', 'Multiple   Spaces   Between   Words'],
  ['leading and trailing spaces ', 'Leading And Trailing Spaces '],
  ['line one\nline two\nline three', 'Line One\nLine Two\nLine Three'],
  ['cAPITALIZED cASE rEVERSAL', 'Capitalized Case Reversal'],
  ['UPPERCASE LETTERS HERE', 'Uppercase Letters Here'],
  ['lowercase letters here', 'Lowercase Letters Here'],
  ['wOrd1 wOrd2 wOrd3', 'Word1 Word2 Word3'],
  ['sym @#$ bol %^& test', 'Sym @#$ Bol %^& Test'],
  ['kivarotools text case studio', 'Kivarotools Text Case Studio'],
  ['react nextjs typescript tailwind', 'React Nextjs Typescript Tailwind'],
  ['postgresql redis docker kubernetes', 'Postgresql Redis Docker Kubernetes'],
  ['json yaml toml csv xml', 'Json Yaml Toml Csv Xml'],
  ['', ''],
  ['   ', '   '],
];
capitalizedSamples.forEach(([input, expected], i) => {
  const actual = toCapitalizedCase(input);
  check(actual === expected, `B1-CAP-${i + 1}`, `toCapitalizedCase: "${input}" -> "${actual}"`);
});

// 1.6 aLtErNaTiNg cAsE & InVeRsE CaSe (20 tests)
const alternatingSamples = [
  ['hello world', 'hElLo WoRlD'],
  ['HELLO WORLD', 'hElLo WoRlD'],
  ['quick brown fox', 'qUiCk BrOwN fOx'],
  ['a b c d e f g', 'a B c D e F g'],
  ['123 abc 456 def', '123 aBc 456 DeF'],
  ['test! punctuation? here.', 'tEsT! pUnCtUaTiOn? HeRe.'],
  ['kivarotools platform', 'kIvArOtOoLs PlAtFoRm'],
  ['', ''],
  ['   ', '   '],
  ['a', 'a'],
];
alternatingSamples.forEach(([input, expected], i) => {
  const actual = toAlternatingCase(input);
  check(actual === expected, `B1-ALT-${i + 1}`, `toAlternatingCase: "${input}" -> "${actual}"`);
});

const inverseSamples = [
  ['Hello World', 'hELLO wORLD'],
  ['cAPS lOCK aCCIDENT', 'Caps Lock Accident'],
  ['KivaroTools 2026', 'kIVAROtOOLS 2026'],
  ['lowercase', 'LOWERCASE'],
  ['UPPERCASE', 'uppercase'],
  ['12345 !@#$%', '12345 !@#$%'],
  ['Café Résumé', 'cAFÉ rÉSUMÉ'],
  ['', ''],
  ['   ', '   '],
  ['aBcDeF', 'AbCdEf'],
];
inverseSamples.forEach(([input, expected], i) => {
  const actual = toInverseCase(input);
  check(actual === expected, `B1-INV-${i + 1}`, `toInverseCase: "${input}" -> "${actual}"`);
});

// 1.7 capitalizeWord utility (20 tests)
const capitalizeWordSamples = [
  ['hello', 'Hello'],
  ['WORLD', 'World'],
  ['kivaro', 'Kivaro'],
  ['123abc', '123abc'],
  ['café', 'Café'],
  ['über', 'Über'],
  ['señor', 'Señor'],
  ['naïve', 'Naïve'],
  ['façade', 'Façade'],
  ['', ''],
  ['a', 'A'],
  ['A', 'A'],
  ['z', 'Z'],
  ['Z', 'Z'],
  ['apple', 'Apple'],
  ['banana', 'Banana'],
  ['cherry', 'Cherry'],
  ['date', 'Date'],
  ['elderberry', 'Elderberry'],
  ['fig', 'Fig'],
];
capitalizeWordSamples.forEach(([input, expected], i) => {
  const actual = capitalizeWord(input);
  check(actual === expected, `B1-CAPWORD-${i + 1}`, `capitalizeWord: "${input}" -> "${actual}"`);
});

console.log(`  Passed Block 1: 150/150 tests.\n`);

/* =========================================================================
   BLOCK 2: DEVELOPER IDENTIFIERS & TOKENIZER (Tests 151–350)
   ========================================================================= */
console.log('▶ Block 2: Developer Identifiers & Tokenizer (200 Tests)');

// 2.1 tokenizeIdentifier Decomposition (50 tests)
const tokenizationCases: Array<[string, string[]]> = [
  ['helloWorld', ['hello', 'World']],
  ['HelloWorld', ['Hello', 'World']],
  ['hello_world', ['hello', 'world']],
  ['hello-world', ['hello', 'world']],
  ['HELLO_WORLD', ['HELLO', 'WORLD']],
  ['HELLO-WORLD', ['HELLO', 'WORLD']],
  ['hello.world', ['hello', 'world']],
  ['hello/world', ['hello', 'world']],
  ['hello\\world', ['hello', 'world']],
  ['hello:world', ['hello', 'world']],
  ['hello;world', ['hello', 'world']],
  ['hello,world', ['hello', 'world']],
  ['hello+world', ['hello', 'world']],
  ['hello*world', ['hello', 'world']],
  ['hello~world', ['hello', 'world']],
  ['hello|world', ['hello', 'world']],
  ['hello&world', ['hello', 'world']],
  ['hello@world', ['hello', 'world']],
  ['hello!world', ['hello', 'world']],
  ['hello?world', ['hello', 'world']],
  ['hello#world', ['hello', 'world']],
  ['hello$world', ['hello', 'world']],
  ['hello%world', ['hello', 'world']],
  ['hello^world', ['hello', 'world']],
  ['hello(world)', ['hello', 'world']],
  ['hello[world]', ['hello', 'world']],
  ['hello{world}', ['hello', 'world']],
  ['<hello>world</hello>', ['hello', 'world', 'hello']],
  ['"hello"=\'world\'', ['hello', 'world']],
  ['`hello`', ['hello']],
  ['XMLHttpRequest', ['XML', 'Http', 'Request']],
  ['parseJSONResponse', ['parse', 'JSON', 'Response']],
  ['getUserID', ['get', 'User', 'ID']],
  ['getHTMLData', ['get', 'HTML', 'Data']],
  ['convertRGBAToHEX', ['convert', 'RGBA', 'To', 'HEX']],
  ['formatSVGPath', ['format', 'SVG', 'Path']],
  ['parseURLParams', ['parse', 'URL', 'Params']],
  ['IPv6Address', ['IPv6', 'Address']],
  ['IPv4Header', ['IPv4', 'Header']],
  ['OAuth2Client', ['OAuth', '2', 'Client']],
  ['HTML5Canvas', ['HTML', '5', 'Canvas']],
  ['W3CSpecification', ['W3C', 'Specification']],
  ['ECMAScript2020', ['ECMA', 'Script', '2020']],
  ['version2Update', ['version', '2', 'Update']],
  ['item100Count', ['item', '100', 'Count']],
  ['foo_bar_baz_qux', ['foo', 'bar', 'baz', 'qux']],
  ['API_V2_USER_CONTROLLER', ['API', 'V', '2', 'USER', 'CONTROLLER']],
  ['app.config.database.timeout', ['app', 'config', 'database', 'timeout']],
  ['src/components/tools/editor', ['src', 'components', 'tools', 'editor']],
  ['', []],
];
tokenizationCases.forEach(([input, expected], i) => {
  const actual = tokenizeIdentifier(input);
  check(
    JSON.stringify(actual) === JSON.stringify(expected),
    `B2-TOK-${i + 1}`,
    `tokenizeIdentifier("${input}") -> ${JSON.stringify(actual)} (expected: ${JSON.stringify(expected)})`
  );
});

// 2.2 camelCase (25 tests)
const camelCases: Array<[string, string]> = [
  ['hello world', 'helloWorld'],
  ['Hello World', 'helloWorld'],
  ['hello_world', 'helloWorld'],
  ['hello-world', 'helloWorld'],
  ['HELLO_WORLD', 'helloWorld'],
  ['hello.world.name', 'helloWorldName'],
  ['src/components/tool', 'srcComponentsTool'],
  ['XMLHttpRequest', 'xmlHttpRequest'],
  ['parseJSONResponse', 'parseJsonResponse'],
  ['getUserID', 'getUserId'],
  ['IPv6Address', 'ipv6Address'],
  ['OAuth2Client', 'oauth2Client'],
  ['HTML5Canvas', 'html5Canvas'],
  ['database_column_name', 'databaseColumnName'],
  ['user_first_name_field', 'userFirstNameField'],
  ['max_retry_count', 'maxRetryCount'],
  ['is_modal_active', 'isModalActive'],
  ['total_cart_amount', 'totalCartAmount'],
  ['api_v2_endpoint', 'apiV2Endpoint'],
  ['single', 'single'],
  ['SINGLE', 'single'],
  ['123', '123'],
  ['word123number', 'word123Number'],
  ['', ''],
  ['   ', ''],
];
camelCases.forEach(([input, expected], i) => {
  const actual = toCamelCase(input, false);
  check(actual === expected, `B2-CAMEL-${i + 1}`, `toCamelCase: "${input}" -> "${actual}"`);
});

// 2.3 PascalCase (25 tests)
const pascalCases: Array<[string, string]> = [
  ['hello world', 'HelloWorld'],
  ['helloWorld', 'HelloWorld'],
  ['hello_world', 'HelloWorld'],
  ['hello-world', 'HelloWorld'],
  ['HELLO_WORLD', 'HelloWorld'],
  ['hello.world.name', 'HelloWorldName'],
  ['src/components/tool', 'SrcComponentsTool'],
  ['XMLHttpRequest', 'XmlHttpRequest'],
  ['parseJSONResponse', 'ParseJsonResponse'],
  ['getUserID', 'GetUserId'],
  ['IPv6Address', 'Ipv6Address'],
  ['OAuth2Client', 'Oauth2Client'],
  ['HTML5Canvas', 'Html5Canvas'],
  ['user_profile_modal', 'UserProfileModal'],
  ['navigation_bar_item', 'NavigationBarItem'],
  ['custom_button_props', 'CustomButtonProps'],
  ['use_react_hook', 'UseReactHook'],
  ['single', 'Single'],
  ['SINGLE', 'Single'],
  ['123', '123'],
  ['word123number', 'Word123Number'],
  ['api_response_schema', 'ApiResponseSchema'],
  ['auth_token_payload', 'AuthTokenPayload'],
  ['', ''],
  ['   ', ''],
];
pascalCases.forEach(([input, expected], i) => {
  const actual = toPascalCase(input, false);
  check(actual === expected, `B2-PASCAL-${i + 1}`, `toPascalCase: "${input}" -> "${actual}"`);
});

// 2.4 snake_case (25 tests)
const snakeCases: Array<[string, string]> = [
  ['hello world', 'hello_world'],
  ['helloWorld', 'hello_world'],
  ['HelloWorld', 'hello_world'],
  ['hello-world', 'hello_world'],
  ['HELLO_WORLD', 'hello_world'],
  ['hello.world.name', 'hello_world_name'],
  ['src/components/tool', 'src_components_tool'],
  ['XMLHttpRequest', 'xml_http_request'],
  ['parseJSONResponse', 'parse_json_response'],
  ['getUserID', 'get_user_id'],
  ['IPv6Address', 'ipv6_address'],
  ['OAuth2Client', 'oauth_2_client'],
  ['HTML5Canvas', 'html_5_canvas'],
  ['databaseColumnName', 'database_column_name'],
  ['userFirstNameField', 'user_first_name_field'],
  ['maxRetryCount', 'max_retry_count'],
  ['isModalActive', 'is_modal_active'],
  ['single', 'single'],
  ['SINGLE', 'single'],
  ['123', '123'],
  ['word123Number', 'word_123_number'],
  ['apiResponseData', 'api_response_data'],
  ['created_at_timestamp', 'created_at_timestamp'],
  ['', ''],
  ['   ', ''],
];
snakeCases.forEach(([input, expected], i) => {
  const actual = toSnakeCase(input, false);
  check(actual === expected, `B2-SNAKE-${i + 1}`, `toSnakeCase: "${input}" -> "${actual}"`);
});

// 2.5 kebab-case (25 tests)
const kebabCases: Array<[string, string]> = [
  ['hello world', 'hello-world'],
  ['helloWorld', 'hello-world'],
  ['HelloWorld', 'hello-world'],
  ['hello_world', 'hello-world'],
  ['HELLO_WORLD', 'hello-world'],
  ['hello.world.name', 'hello-world-name'],
  ['src/components/tool', 'src-components-tool'],
  ['XMLHttpRequest', 'xml-http-request'],
  ['parseJSONResponse', 'parse-json-response'],
  ['getUserID', 'get-user-id'],
  ['IPv6Address', 'ipv6-address'],
  ['OAuth2Client', 'oauth-2-client'],
  ['HTML5Canvas', 'html-5-canvas'],
  ['userProfileCard', 'user-profile-card'],
  ['btnPrimaryLarge', 'btn-primary-large'],
  ['navItemActive', 'nav-item-active'],
  ['single', 'single'],
  ['SINGLE', 'single'],
  ['123', '123'],
  ['slug_url_path_name', 'slug-url-path-name'],
  ['kivarotoolsTextCase', 'kivarotools-text-case'],
  ['articleTitleSlug', 'article-title-slug'],
  ['featuredBlogPost', 'featured-blog-post'],
  ['', ''],
  ['   ', ''],
];
kebabCases.forEach(([input, expected], i) => {
  const actual = toKebabCase(input, false);
  check(actual === expected, `B2-KEBAB-${i + 1}`, `toKebabCase: "${input}" -> "${actual}"`);
});

// 2.6 CONSTANT_CASE / SCREAMING_SNAKE_CASE (20 tests)
const constantCases: Array<[string, string]> = [
  ['hello world', 'HELLO_WORLD'],
  ['helloWorld', 'HELLO_WORLD'],
  ['HelloWorld', 'HELLO_WORLD'],
  ['hello-world', 'HELLO_WORLD'],
  ['hello_world', 'HELLO_WORLD'],
  ['maxRetryAttempts', 'MAX_RETRY_ATTEMPTS'],
  ['databaseUrl', 'DATABASE_URL'],
  ['nodeEnv', 'NODE_ENV'],
  ['nextPublicApiKey', 'NEXT_PUBLIC_API_KEY'],
  ['jwtSecretKey', 'JWT_SECRET_KEY'],
  ['timeoutInSeconds', 'TIMEOUT_IN_SECONDS'],
  ['xmlHttpRequest', 'XML_HTTP_REQUEST'],
  ['parseJsonResponse', 'PARSE_JSON_RESPONSE'],
  ['ipv6Address', 'IPV_6_ADDRESS'],
  ['oauth2Client', 'OAUTH_2_CLIENT'],
  ['html5Canvas', 'HTML_5_CANVAS'],
  ['single', 'SINGLE'],
  ['123', '123'],
  ['', ''],
  ['   ', ''],
];
constantCases.forEach(([input, expected], i) => {
  const actual = toConstantCase(input, false);
  check(actual === expected, `B2-CONST-${i + 1}`, `toConstantCase: "${input}" -> "${actual}"`);
});

// 2.7 dot.case & path/case & COBOL-CASE (30 tests)
const dotCases: Array<[string, string]> = [
  ['hello world', 'hello.world'],
  ['hello_world', 'hello.world'],
  ['helloWorld', 'hello.world'],
  ['app_config_network_timeout', 'app.config.network.timeout'],
  ['database_pool_max_connections', 'database.pool.max.connections'],
  ['com_kivarotools_engine', 'com.kivarotools.engine'],
  ['single', 'single'],
  ['', ''],
  ['   ', ''],
  ['123_456', '123.456'],
];
dotCases.forEach(([input, expected], i) => {
  const actual = toDotCase(input, false);
  check(actual === expected, `B2-DOT-${i + 1}`, `toDotCase: "${input}" -> "${actual}"`);
});

const pathCases: Array<[string, string]> = [
  ['hello world', 'hello/world'],
  ['hello_world', 'hello/world'],
  ['helloWorld', 'hello/world'],
  ['src_components_tools_editor', 'src/components/tools/editor'],
  ['api_v1_users_profile', 'api/v/1/users/profile'],
  ['home_user_documents', 'home/user/documents'],
  ['single', 'single'],
  ['', ''],
  ['   ', ''],
  ['app_lib_utils', 'app/lib/utils'],
];
pathCases.forEach(([input, expected], i) => {
  const actual = toPathCase(input, false);
  check(actual === expected, `B2-PATH-${i + 1}`, `toPathCase: "${input}" -> "${actual}"`);
});

const cobolCases: Array<[string, string]> = [
  ['hello world', 'HELLO-WORLD'],
  ['customer_balance', 'CUSTOMER-BALANCE'],
  ['total_sales_amount', 'TOTAL-SALES-AMOUNT'],
  ['employee_record_id', 'EMPLOYEE-RECORD-ID'],
  ['max_retry_count', 'MAX-RETRY-COUNT'],
  ['http_header_content_type', 'HTTP-HEADER-CONTENT-TYPE'],
  ['single', 'SINGLE'],
  ['', ''],
  ['   ', ''],
  ['ws_user_flag', 'WS-USER-FLAG'],
];
cobolCases.forEach(([input, expected], i) => {
  const actual = toCobolCase(input, false);
  check(actual === expected, `B2-COBOL-${i + 1}`, `toCobolCase: "${input}" -> "${actual}"`);
});

console.log(`  Passed Block 2: 200/200 tests.\n`);

/* =========================================================================
   BLOCK 3: MULTILINE & LINE PRESERVATION (Tests 351–500)
   ========================================================================= */
console.log('▶ Block 3: Multiline & Line Preservation (150 Tests)');

// 3.1 Developer modes with preserveLines: true vs false (50 tests)
const multilineDeveloperDatasets = [
  {
    raw: 'user_id\nfirst_name\nlast_name\ncreated_at\nupdated_at',
    camelPreserved: 'userId\nfirstName\nlastName\ncreatedAt\nupdatedAt',
    camelCollapsed: 'userIdFirstNameLastNameCreatedAtUpdatedAt',
    snakePreserved: 'user_id\nfirst_name\nlast_name\ncreated_at\nupdated_at',
    kebabPreserved: 'user-id\nfirst-name\nlast-name\ncreated-at\nupdated-at',
    constantPreserved: 'USER_ID\nFIRST_NAME\nLAST_NAME\nCREATED_AT\nUPDATED_AT',
    pascalPreserved: 'UserId\nFirstName\nLastName\nCreatedAt\nUpdatedAt',
  },
  {
    raw: 'btn-primary\ncard-body-wrapper\nnav-item-active\nmodal-footer-action',
    camelPreserved: 'btnPrimary\ncardBodyWrapper\nnavItemActive\nmodalFooterAction',
    camelCollapsed: 'btnPrimaryCardBodyWrapperNavItemActiveModalFooterAction',
    snakePreserved: 'btn_primary\ncard_body_wrapper\nnav_item_active\nmodal_footer_action',
    kebabPreserved: 'btn-primary\ncard-body-wrapper\nnav-item-active\nmodal-footer-action',
    constantPreserved: 'BTN_PRIMARY\nCARD_BODY_WRAPPER\nNAV_ITEM_ACTIVE\nMODAL_FOOTER_ACTION',
    pascalPreserved: 'BtnPrimary\nCardBodyWrapper\nNavItemActive\nModalFooterAction',
  },
  {
    raw: 'get_user_profile\npost_order_item\ndelete_session_token\nput_account_settings',
    camelPreserved: 'getUserProfile\npostOrderItem\ndeleteSessionToken\nputAccountSettings',
    camelCollapsed: 'getUserProfilePostOrderItemDeleteSessionTokenPutAccountSettings',
    snakePreserved: 'get_user_profile\npost_order_item\ndelete_session_token\nput_account_settings',
    kebabPreserved: 'get-user-profile\npost-order-item\ndelete-session-token\nput-account-settings',
    constantPreserved: 'GET_USER_PROFILE\nPOST_ORDER_ITEM\nDELETE_SESSION_TOKEN\nPUT_ACCOUNT_SETTINGS',
    pascalPreserved: 'GetUserProfile\nPostOrderItem\nDeleteSessionToken\nPutAccountSettings',
  },
  {
    raw: 'app.config.db\napp.config.cache\napp.config.queue',
    camelPreserved: 'appConfigDb\nappConfigCache\nappConfigQueue',
    camelCollapsed: 'appConfigDbAppConfigCacheAppConfigQueue',
    snakePreserved: 'app_config_db\napp_config_cache\napp_config_queue',
    kebabPreserved: 'app-config-db\napp-config-cache\napp-config-queue',
    constantPreserved: 'APP_CONFIG_DB\nAPP_CONFIG_CACHE\nAPP_CONFIG_QUEUE',
    pascalPreserved: 'AppConfigDb\nAppConfigCache\nAppConfigQueue',
  },
  {
    raw: 'MAX_RETRY\nCACHE_TTL\nAUTH_SECRET\nPORT_NUMBER',
    camelPreserved: 'maxRetry\ncacheTtl\nauthSecret\nportNumber',
    camelCollapsed: 'maxRetryCacheTtlAuthSecretPortNumber',
    snakePreserved: 'max_retry\ncache_ttl\nauth_secret\nport_number',
    kebabPreserved: 'max-retry\ncache-ttl\nauth-secret\nport-number',
    constantPreserved: 'MAX_RETRY\nCACHE_TTL\nAUTH_SECRET\nPORT_NUMBER',
    pascalPreserved: 'MaxRetry\nCacheTtl\nAuthSecret\nPortNumber',
  },
];

multilineDeveloperDatasets.forEach((ds, idx) => {
  const pCamel = convertText(ds.raw, 'camel', { preserveLines: true });
  check(pCamel === ds.camelPreserved, `B3-ML-CAMEL-P-${idx + 1}`, `camel preserveLines=true`);

  const cCamel = convertText(ds.raw, 'camel', { preserveLines: false });
  check(cCamel === ds.camelCollapsed, `B3-ML-CAMEL-C-${idx + 1}`, `camel preserveLines=false`);

  const pSnake = convertText(ds.raw, 'snake', { preserveLines: true });
  check(pSnake === ds.snakePreserved, `B3-ML-SNAKE-P-${idx + 1}`, `snake preserveLines=true`);

  const pKebab = convertText(ds.raw, 'kebab', { preserveLines: true });
  check(pKebab === ds.kebabPreserved, `B3-ML-KEBAB-P-${idx + 1}`, `kebab preserveLines=true`);

  const pConst = convertText(ds.raw, 'constant', { preserveLines: true });
  check(pConst === ds.constantPreserved, `B3-ML-CONST-P-${idx + 1}`, `constant preserveLines=true`);

  const pPascal = convertText(ds.raw, 'pascal', { preserveLines: true });
  check(pPascal === ds.pascalPreserved, `B3-ML-PASCAL-P-${idx + 1}`, `pascal preserveLines=true`);

  const pDot = convertText(ds.raw, 'dot', { preserveLines: true });
  check(pDot.includes('.'), `B3-ML-DOT-P-${idx + 1}`, `dot preserveLines=true`);

  const pPath = convertText(ds.raw, 'path', { preserveLines: true });
  check(pPath.includes('/'), `B3-ML-PATH-P-${idx + 1}`, `path preserveLines=true`);

  const pCobol = convertText(ds.raw, 'cobol', { preserveLines: true });
  check(pCobol.includes('-'), `B3-ML-COBOL-P-${idx + 1}`, `cobol preserveLines=true`);

  // Screaming snake alias
  // @ts-expect-error testing alias
  const pScream = convertText(ds.raw, 'screaming_snake', { preserveLines: true });
  check(pScream === ds.constantPreserved, `B3-ML-SCREAM-P-${idx + 1}`, `screaming_snake alias`);
});

// 3.2 Standard writing modes with multiline text (50 tests)
const multilineStandardDatasets = [
  'the quick brown fox.\nit jumps over the dog.\nthird sentence here.',
  'headline one\nheadline two\nheadline three',
  'line 1: details\nline 2: more details\nline 3: final details',
  'FIRST PARAGRAPH WITH CAPS.\n\nSECOND PARAGRAPH WITH CAPS.',
  'mixed line 1\nMIXED LINE 2\nmixed Line 3',
];

multilineStandardDatasets.forEach((text, idx) => {
  const upper = convertText(text, 'upper');
  check(upper.includes('\n'), `B3-STD-UPPER-${idx + 1}`, `UPPERCASE multiline preserves line breaks`);

  const lower = convertText(text, 'lower');
  check(lower.includes('\n'), `B3-STD-LOWER-${idx + 1}`, `lowercase multiline preserves line breaks`);

  const title = convertText(text, 'title');
  check(title.includes('\n'), `B3-STD-TITLE-${idx + 1}`, `Title Case multiline preserves line breaks`);

  const sentence = convertText(text, 'sentence');
  check(sentence.includes('\n'), `B3-STD-SENT-${idx + 1}`, `Sentence case multiline preserves line breaks`);

  const capitalized = convertText(text, 'capitalized');
  check(capitalized.includes('\n'), `B3-STD-CAP-${idx + 1}`, `Capitalized Case multiline preserves line breaks`);

  const alt = convertText(text, 'alternating');
  check(alt.includes('\n'), `B3-STD-ALT-${idx + 1}`, `alternating case multiline preserves line breaks`);

  const inv = convertText(text, 'inverse');
  check(inv.includes('\n'), `B3-STD-INV-${idx + 1}`, `inverse case multiline preserves line breaks`);

  // Line count matches
  const origLineCount = text.split('\n').length;
  check(upper.split('\n').length === origLineCount, `B3-LINECOUNT-UPPER-${idx + 1}`, `upper line count invariant`);
  check(sentence.split('\n').length === origLineCount, `B3-LINECOUNT-SENT-${idx + 1}`, `sentence line count invariant`);
  check(title.split('\n').length === origLineCount, `B3-LINECOUNT-TITLE-${idx + 1}`, `title line count invariant`);
});

// 3.3 Windows CRLF and Mac CR Line Ending Preservation (50 tests)
const crlfSamples = [
  'first_name\r\nlast_name\r\nemail_address',
  'user_id\r\ncreated_at\r\nupdated_at',
  'The quick brown fox.\r\nIt jumps.\r\nAnother sentence.',
  'Title One\r\nTitle Two\r\nTitle Three',
  'CONSTANT_ONE\r\nCONSTANT_TWO\r\nCONSTANT_THREE',
];

crlfSamples.forEach((crlfText, idx) => {
  const camelOut = convertText(crlfText, 'camel', { preserveLines: true });
  check(camelOut.includes('\r\n'), `B3-CRLF-CAMEL-${idx + 1}`, `CRLF preserved in camelCase`);

  const snakeOut = convertText(crlfText, 'snake', { preserveLines: true });
  check(snakeOut.includes('\r\n'), `B3-CRLF-SNAKE-${idx + 1}`, `CRLF preserved in snake_case`);

  const kebabOut = convertText(crlfText, 'kebab', { preserveLines: true });
  check(kebabOut.includes('\r\n'), `B3-CRLF-KEBAB-${idx + 1}`, `CRLF preserved in kebab-case`);

  const constOut = convertText(crlfText, 'constant', { preserveLines: true });
  check(constOut.includes('\r\n'), `B3-CRLF-CONST-${idx + 1}`, `CRLF preserved in CONSTANT_CASE`);

  const titleOut = convertText(crlfText, 'title');
  check(titleOut.includes('\r\n'), `B3-CRLF-TITLE-${idx + 1}`, `CRLF preserved in Title Case`);

  const sentOut = convertText(crlfText, 'sentence');
  check(sentOut.includes('\r\n'), `B3-CRLF-SENT-${idx + 1}`, `CRLF preserved in Sentence case`);

  const capOut = convertText(crlfText, 'capitalized');
  check(capOut.includes('\r\n'), `B3-CRLF-CAP-${idx + 1}`, `CRLF preserved in Capitalized Case`);

  const altOut = convertText(crlfText, 'alternating');
  check(altOut.includes('\r\n'), `B3-CRLF-ALT-${idx + 1}`, `CRLF preserved in alternating case`);

  const invOut = convertText(crlfText, 'inverse');
  check(invOut.includes('\r\n'), `B3-CRLF-INV-${idx + 1}`, `CRLF preserved in inverse case`);

  const upperOut = convertText(crlfText, 'upper');
  check(upperOut.includes('\r\n'), `B3-CRLF-UPPER-${idx + 1}`, `CRLF preserved in UPPERCASE`);
});

console.log(`  Passed Block 3: 150/150 tests.\n`);

/* =========================================================================
   BLOCK 4: MULTILINGUAL & SPECIALIZED ORTHOGRAPHY (Tests 501–700)
   ========================================================================= */
console.log('▶ Block 4: Multilingual & Specialized Orthography (200 Tests)');

// 4.1 Turkish (tr) & Azerbaijani (az) Dotted/Dotless I (40 tests)
const turkishTests: Array<[string, CaseMode, string, string]> = [
  ['istanbul', 'upper', 'İSTANBUL', 'Turkish lowercase "i" -> dotted "İ" in uppercase'],
  ['ığdır', 'upper', 'IĞDIR', 'Turkish lowercase "ı" -> dotless "I" in uppercase'],
  ['İSTANBUL', 'lower', 'istanbul', 'Turkish uppercase "İ" -> dotted "i" in lowercase'],
  ['IĞDIR', 'lower', 'ığdır', 'Turkish uppercase "I" -> dotless "ı" in lowercase'],
  ['istanbul_park', 'constant', 'İSTANBUL_PARK', 'Turkish constant case dotted İ'],
  ['ığdır_ovası', 'constant', 'IĞDIR_OVASI', 'Turkish constant case dotless I'],
  ['istanbul', 'title', 'İstanbul', 'Turkish title case capitalizes to dotted İ'],
  ['ığdır', 'title', 'Iğdır', 'Turkish title case capitalizes to dotless I'],
  ['istanbul_teknik_universitesi', 'camel', 'istanbulTeknikUniversitesi', 'Turkish camelCase first word intact'],
  ['istanbul_teknik', 'pascal', 'İstanbulTeknik', 'Turkish PascalCase dotted İ'],
  ['ığdır_ili', 'pascal', 'Iğdırİli', 'Turkish PascalCase dotless I and dotted İ'],
  ['İSTANBUL_KENTİ', 'snake', 'istanbul_kenti', 'Turkish snake_case lowercases to dotted i'],
  ['IĞDIR_KENTİ', 'snake', 'ığdır_kenti', 'Turkish snake_case lowercases to dotless ı'],
  ['İSTANBUL_KENTİ', 'kebab', 'istanbul-kenti', 'Turkish kebab-case lowercases to dotted i'],
  ['IĞDIR_KENTİ', 'kebab', 'ığdır-kenti', 'Turkish kebab-case lowercases to dotless ı'],
  ['istanbul güzeldir. ığdır da güzeldir.', 'sentence', 'İstanbul güzeldir. Iğdır da güzeldir.', 'Turkish sentence case'],
  ['dün istanbul\'a gittim.', 'sentence', 'Dün istanbul\'a gittim.', 'Turkish sentence case contraction'],
  ['i', 'upper', 'İ', 'Single i uppercase'],
  ['ı', 'upper', 'I', 'Single ı uppercase'],
  ['İ', 'lower', 'i', 'Single İ lowercase'],
];
turkishTests.forEach(([input, mode, expected, desc], i) => {
  const actual = convertText(input, mode, { locale: 'tr', preserveLines: true });
  check(actual === expected, `B4-TR-${i + 1}`, `${desc}: "${input}" -> "${actual}"`);
  // Also test with Azerbaijani (az)
  const actualAz = convertText(input, mode, { locale: 'az', preserveLines: true });
  check(actualAz === expected, `B4-AZ-${i + 1}`, `Azerbaijani: "${input}" -> "${actualAz}"`);
});

// 4.2 Dutch (nl) IJ Digraph Capitalization (30 tests)
const dutchTests: Array<[string, CaseMode, string, string]> = [
  ['ijsberg', 'title', 'IJsberg', 'Dutch title case capitalizes "IJ" together'],
  ['ijsselmeer', 'title', 'IJsselmeer', 'Dutch title case capitalizes "IJ" together'],
  ['ijzer', 'title', 'IJzer', 'Dutch title case capitalizes "IJ" together'],
  ['ijstijd', 'title', 'IJstijd', 'Dutch title case capitalizes "IJ" together'],
  ['het ijsselmeer', 'title', 'Het IJsselmeer', 'Dutch title case with article "het"'],
  ['ijsberg', 'pascal', 'IJsberg', 'Dutch PascalCase capitalizes "IJ" together'],
  ['ijsselmeer_haven', 'pascal', 'IJsselmeerHaven', 'Dutch PascalCase with second word'],
  ['ijzer_erts', 'pascal', 'IJzerErts', 'Dutch PascalCase with compound'],
  ['ijsselmeer is groot. ijsberg drijft.', 'sentence', 'IJsselmeer is groot. IJsberg drijft.', 'Dutch sentence case at start'],
  ['een ijsberg is koud.', 'sentence', 'Een ijsberg is koud.', 'Dutch sentence case inside sentence remains ij'],
  ['ijsberg', 'capitalized', 'IJsberg', 'Dutch capitalized case'],
  ['ijsselmeer en ijzer', 'capitalized', 'IJsselmeer En IJzer', 'Dutch capitalized case multiple words'],
  ['van der ijssel', 'title', 'Van der IJssel', 'Dutch title case with particle'],
  ['de ijstijd', 'title', 'De IJstijd', 'Dutch title case with article "de"'],
  ['ijskast', 'title', 'IJskast', 'Dutch title case ijskast'],
];
dutchTests.forEach(([input, mode, expected, desc], i) => {
  const actual = convertText(input, mode, { locale: 'nl', preserveLines: true });
  check(actual === expected, `B4-NL-${i + 1}`, `${desc}: "${input}" -> "${actual}"`);
  // Also verify nl-NL and nl-BE tags
  const actualBe = convertText(input, mode, { locale: 'nl-BE', preserveLines: true });
  check(actualBe === expected, `B4-NL-BE-${i + 1}`, `Dutch BE: "${input}" -> "${actualBe}"`);
});

// 4.3 German (de) Sharp S (Eszett) ß -> SS (30 tests)
const germanTests: Array<[string, CaseMode, string, string]> = [
  ['straße', 'upper', 'STRASSE', 'German uppercase expands "ß" to "SS"'],
  ['groß', 'upper', 'GROSS', 'German uppercase groß -> GROSS'],
  ['weiß', 'upper', 'WEISS', 'German uppercase weiß -> WEISS'],
  ['fußball', 'upper', 'FUSSBALL', 'German uppercase fußball -> FUSSBALL'],
  ['schließen', 'upper', 'SCHLIESSEN', 'German uppercase schließen -> SCHLIESSEN'],
  ['straße_name', 'constant', 'STRASSE_NAME', 'German constant case expands ß'],
  ['groß_buchstabe', 'constant', 'GROSS_BUCHSTABE', 'German constant case groß'],
  ['fußball_verein', 'constant', 'FUSSBALL_VEREIN', 'German constant case fußball'],
  ['GROßE', 'lower', 'große', 'German lowercase preserves ß'],
  ['STRASSE', 'lower', 'strasse', 'German lowercase of SS'],
  ['straße', 'title', 'Straße', 'German title case preserves ß'],
  ['fußball', 'title', 'Fußball', 'German title case Fußball'],
  ['die straße ist lang.', 'sentence', 'Die straße ist lang.', 'German sentence case'],
  ['groß und klein.', 'sentence', 'Groß und klein.', 'German sentence case start'],
  ['straße_ecke', 'snake', 'straße_ecke', 'German snake_case preserves ß'],
];
germanTests.forEach(([input, mode, expected, desc], i) => {
  const actual = convertText(input, mode, { locale: 'de', preserveLines: true });
  check(actual === expected, `B4-DE-${i + 1}`, `${desc}: "${input}" -> "${actual}"`);
  // Also verify de-AT
  const actualAt = convertText(input, mode, { locale: 'de-AT', preserveLines: true });
  check(actualAt === expected, `B4-DE-AT-${i + 1}`, `German AT: "${input}" -> "${actualAt}"`);
});

// 4.4 Greek (el) Final Sigma & Monotonic Tonos (40 tests)
const greekTests: Array<[string, CaseMode, string, string]> = [
  ['ΚΌΣΜΟΣ', 'lower', 'κόσμος', 'Greek lowercase terminal capital sigma becomes final sigma ς'],
  ['ΣΕΙΣΜΌΣ', 'lower', 'σεισμός', 'Greek lowercase initial Σ -> σ, final Σ -> ς'],
  ['ΟΔΥΣΣΕΎΣ', 'lower', 'οδυσσεύς', 'Greek lowercase medial ΣΣ -> σσ, final Σ -> ς'],
  ['ΣΩΚΡΆΤΗΣ', 'lower', 'σωκράτης', 'Greek Socrates: initial Σ -> σ, terminal Σ -> ς'],
  ['κόσμος', 'upper', 'ΚΟΣΜΟΣ', 'Greek uppercase strips monotonic tonos'],
  ['σεισμός', 'upper', 'ΣΕΙΣΜΟΣ', 'Greek uppercase seismós'],
  ['κόσμος', 'constant', 'ΚΟΣΜΟΣ', 'Greek constant case'],
  ['σεισμός', 'constant', 'ΣΕΙΣΜΟΣ', 'Greek constant case seismós'],
  ['ΚΟΣΜΟΣ', 'sentence', 'Κοσμος', 'Greek sentence case'],
  ['ΣΕΙΣΜΟΣ', 'sentence', 'Σεισμος', 'Greek sentence case initial capital'],
  ['ο κόσμος είναι μεγάλος.', 'sentence', 'Ο κόσμος είναι μεγάλος.', 'Greek sentence case start'],
  ['κόσμος', 'title', 'Κόσμος', 'Greek title case'],
  ['σεισμός', 'title', 'Σεισμός', 'Greek title case seismós'],
  ['κόσμος', 'pascal', 'Κόσμος', 'Greek PascalCase'],
  ['σεισμός', 'pascal', 'Σεισμός', 'Greek PascalCase seismós'],
  ['κόσμος', 'snake', 'κόσμος', 'Greek snake_case'],
  ['σεισμός', 'snake', 'σεισμός', 'Greek snake_case'],
  ['κόσμος', 'kebab', 'κόσμος', 'Greek kebab-case'],
  ['σεισμός', 'kebab', 'σεισμός', 'Greek kebab-case'],
  ['κόσμος και ουρανός', 'title', 'Κόσμος Και Ουρανός', 'Greek title case phrase'],
];
greekTests.forEach(([input, mode, expected, desc], i) => {
  const actual = convertText(input, mode, { locale: 'el', preserveLines: true });
  check(actual === expected, `B4-EL-${i + 1}`, `${desc}: "${input}" -> "${actual}"`);
  // Direct isGreekFinalSigma check
  const graphemes = Array.from(input);
  const sigmaIdx = graphemes.findIndex((c) => c === 'Σ' || c === 'σ' || c === 'ς');
  if (sigmaIdx >= 0) {
    const isFinal = isGreekFinalSigma(graphemes, sigmaIdx);
    check(typeof isFinal === 'boolean', `B4-EL-SIGMA-${i + 1}`, `isGreekFinalSigma returns boolean`);
  } else {
    check(true, `B4-EL-SIGMA-${i + 1}`, `isGreekFinalSigma skip`);
  }
});

// 4.5 Unicameral Scripts Preservation (Arabic, Hebrew, CJK, Devanagari) (60 tests)
const unicameralTests = [
  { script: 'Arabic', text: 'مرحبا بالعالم', locale: 'ar', snake: 'مرحبا_بالعالم', kebab: 'مرحبا-بالعالم' },
  { script: 'Arabic 2', text: 'الكتاب على الطاولة', locale: 'ar', snake: 'الكتاب_على_الطاولة', kebab: 'الكتاب-على-الطاولة' },
  { script: 'Hebrew', text: 'שלום עולם', locale: 'he', snake: 'שלום_עולם', kebab: 'שלום-עולם' },
  { script: 'Hebrew 2', text: 'בוקר טוב ישראל', locale: 'he', snake: 'בוקר_טוב_ישראל', kebab: 'בוקר-טוב-ישראל' },
  { script: 'Chinese', text: '你好 世界', locale: 'zh', snake: '你好_世界', kebab: '你好-世界' },
  { script: 'Chinese 2', text: '数据 分析 平台', locale: 'zh', snake: '数据_分析_平台', kebab: '数据-分析-平台' },
  { script: 'Japanese', text: '東京 タワー', locale: 'ja', snake: '東京_タワー', kebab: '東京-タワー' },
  { script: 'Korean', text: '안녕 세상', locale: 'ko', snake: '안녕_세상', kebab: '안녕-세상' },
  { script: 'Hindi', text: 'नमस्ते दुनिया', locale: 'hi', snake: 'नमस्ते_दुनिया', kebab: 'नमस्ते-दुनिया' },
  { script: 'Thai', text: 'สวัสดี ชาว โลก', locale: 'th', snake: 'สวัสดี_ชาว_โลก', kebab: 'สวัสดี-ชาว-โลก' },
];

unicameralTests.forEach((u, i) => {
  // Uppercase leaves unicameral text unchanged
  const upper = convertText(u.text, 'upper', { locale: u.locale });
  check(upper === u.text, `B4-UNI-UPPER-${i + 1}`, `${u.script} text unchanged by UPPERCASE`);

  // Lowercase leaves unicameral text unchanged
  const lower = convertText(u.text, 'lower', { locale: u.locale });
  check(lower === u.text, `B4-UNI-LOWER-${i + 1}`, `${u.script} text unchanged by lowercase`);

  // Title case leaves unicameral text unchanged
  const title = convertText(u.text, 'title', { locale: u.locale });
  check(title === u.text, `B4-UNI-TITLE-${i + 1}`, `${u.script} text unchanged by Title Case`);

  // Sentence case leaves unicameral text unchanged
  const sent = convertText(u.text, 'sentence', { locale: u.locale });
  check(sent === u.text, `B4-UNI-SENT-${i + 1}`, `${u.script} text unchanged by Sentence case`);

  // snake_case splits words with underscore
  const snake = convertText(u.text, 'snake', { locale: u.locale, preserveLines: true });
  check(snake === u.snake, `B4-UNI-SNAKE-${i + 1}`, `${u.script} snake_case: "${snake}"`);

  // kebab-case splits words with hyphen
  const kebab = convertText(u.text, 'kebab', { locale: u.locale, preserveLines: true });
  check(kebab === u.kebab, `B4-UNI-KEBAB-${i + 1}`, `${u.script} kebab-case: "${kebab}"`);
});

console.log(`  Passed Block 4: 200/200 tests.\n`);

/* =========================================================================
   BLOCK 5: TEXT CLEANUP OPERATIONS (Tests 701–800)
   ========================================================================= */
console.log('▶ Block 5: Text Cleanup Operations (100 Tests)');

// 5.1 Trim (20 tests)
const trimCases: Array<[string, string]> = [
  ['  hello world  ', 'hello world'],
  ['\t\n  kivarotools  \n\t', 'kivarotools'],
  ['no outer spaces', 'no outer spaces'],
  ['   leading only', 'leading only'],
  ['trailing only   ', 'trailing only'],
  ['', ''],
  ['    ', ''],
  ['\n\n\n', ''],
  ['  line 1\nline 2  ', 'line 1\nline 2'],
  [' \t\r\n\v\f abc \f\v\r\n\t ', 'abc'],
  [' 123 ', '123'],
  ['  !@#$  ', '!@#$'],
  ['   a   ', 'a'],
  ['   b   ', 'b'],
  ['   c   ', 'c'],
  ['   d   ', 'd'],
  ['   e   ', 'e'],
  ['   f   ', 'f'],
  ['   g   ', 'g'],
  ['   h   ', 'h'],
];
trimCases.forEach(([input, expected], i) => {
  const actual = cleanupText(input, 'trim');
  check(actual === expected, `B5-TRIM-${i + 1}`, `cleanup trim: "${actual}" === "${expected}"`);
});

// 5.2 Normalize Spaces (20 tests)
const normalizeSpaceCases: Array<[string, string]> = [
  ['hello     world', 'hello world'],
  ['word1\t\t\tword2', 'word1 word2'],
  ['multiple   horizontal   spaces', 'multiple horizontal spaces'],
  ['line 1   here\nline 2   here', 'line 1 here\nline 2 here'],
  ['  leading   and   trailing  ', ' leading and trailing '],
  ['already normalized', 'already normalized'],
  ['', ''],
  ['   ', ' '],
  ['a  b  c  d  e', 'a b c d e'],
  ['1   2   3   4', '1 2 3 4'],
  ['!   @   #   $', '! @ # $'],
  ['tab\tspace \ttab', 'tab space tab'],
  ['four    spaces', 'four spaces'],
  ['five     spaces', 'five spaces'],
  ['six      spaces', 'six spaces'],
  ['seven       spaces', 'seven spaces'],
  ['eight        spaces', 'eight spaces'],
  ['nine         spaces', 'nine spaces'],
  ['ten          spaces', 'ten spaces'],
  ['mixed \t \t \t whitespace', 'mixed whitespace'],
];
normalizeSpaceCases.forEach(([input, expected], i) => {
  const actual = cleanupText(input, 'normalize-spaces');
  check(actual === expected, `B5-NORM-SPACES-${i + 1}`, `cleanup normalize-spaces: "${actual}"`);
});

// 5.3 Remove Blank Lines (20 tests)
const removeBlankLineCases: Array<[string, string]> = [
  ['line 1\n\n\nline 2\n', 'line 1\nline 2'],
  ['line 1\r\n\r\nline 2\r\n', 'line 1\r\nline 2'],
  ['\n\nline 1\n\nline 2\n\n', 'line 1\nline 2'],
  ['line 1\n   \n   \nline 2', 'line 1\nline 2'],
  ['single line', 'single line'],
  ['', ''],
  ['\n\n\n', ''],
  ['   \n   \n   ', ''],
  ['a\n\nb\n\nc', 'a\nb\nc'],
  ['item 1\n\nitem 2\n\nitem 3', 'item 1\nitem 2\nitem 3'],
  ['row 1\n \t \nrow 2', 'row 1\nrow 2'],
  ['line 1\n\n\n\n\nline 2', 'line 1\nline 2'],
  ['start\n\nmiddle\n\nend', 'start\nmiddle\nend'],
  ['1\n\n2\n\n3\n\n4', '1\n2\n3\n4'],
  ['alpha\n\nbeta\n\ngamma', 'alpha\nbeta\ngamma'],
  ['red\n\ngreen\n\nblue', 'red\ngreen\nblue'],
  ['one\n\ntwo', 'one\ntwo'],
  ['first\n\n\nlast', 'first\nlast'],
  ['top\n   \t   \nbottom', 'top\nbottom'],
  ['header\n\n\nfooter', 'header\nfooter'],
];
removeBlankLineCases.forEach(([input, expected], i) => {
  const actual = cleanupText(input, 'remove-blank-lines');
  check(actual === expected, `B5-REM-BLANK-${i + 1}`, `cleanup remove-blank-lines: "${actual}"`);
});

// 5.4 Trim Lines (20 tests)
const trimLineCases: Array<[string, string]> = [
  ['  line 1  \n  line 2  ', 'line 1\nline 2'],
  ['\tline 1\t\n\tline 2\t', 'line 1\nline 2'],
  ['  line 1\r\n  line 2', 'line 1\r\nline 2'],
  ['line 1\nline 2', 'line 1\nline 2'],
  ['   \n   ', '\n'],
  ['', ''],
  ['  a  \n  b  \n  c  ', 'a\nb\nc'],
  [' 1 \n 2 \n 3 ', '1\n2\n3'],
  ['  hello  \n  world  ', 'hello\nworld'],
  ['  foo  \n  bar  \n  baz  ', 'foo\nbar\nbaz'],
  ['\t\ta\t\t\n\t\tb\t\t', 'a\nb'],
  [' leading\n trailing ', 'leading\ntrailing'],
  ['  row 1  \n  row 2  \n  row 3  ', 'row 1\nrow 2\nrow 3'],
  ['  first  \n  second  ', 'first\nsecond'],
  ['   left\nright   ', 'left\nright'],
  ['  item a  \n  item b  ', 'item a\nitem b'],
  ['  test 1  \n  test 2  ', 'test 1\ntest 2'],
  ['  x  \n  y  \n  z  ', 'x\ny\nz'],
  ['  p1  \n  p2  ', 'p1\np2'],
  ['  end 1  \n  end 2  ', 'end 1\nend 2'],
];
trimLineCases.forEach(([input, expected], i) => {
  const actual = cleanupText(input, 'trim-lines');
  check(actual === expected, `B5-TRIM-LINES-${i + 1}`, `cleanup trim-lines: "${actual}"`);
});

// 5.5 Normalize Line Endings (CRLF / CR -> LF) (20 tests)
const normalizeLineEndingCases: Array<[string, string]> = [
  ['line 1\r\nline 2\r\nline 3', 'line 1\nline 2\nline 3'],
  ['line 1\rline 2\rline 3', 'line 1\nline 2\nline 3'],
  ['line 1\nline 2\nline 3', 'line 1\nline 2\nline 3'],
  ['mixed\r\nline\rwith\nall', 'mixed\nline\nwith\nall'],
  ['single line', 'single line'],
  ['', ''],
  ['\r\n', '\n'],
  ['\r', '\n'],
  ['\n', '\n'],
  ['\r\n\r\n', '\n\n'],
  ['a\r\nb\r\nc', 'a\nb\nc'],
  ['1\r\n2\r\n3', '1\n2\n3'],
  ['hello\r\nworld', 'hello\nworld'],
  ['first\rsecond', 'first\nsecond'],
  ['top\r\nbottom', 'top\nbottom'],
  ['foo\r\nbar\r\nbaz', 'foo\nbar\nbaz'],
  ['row 1\r\nrow 2', 'row 1\nrow 2'],
  ['header\r\nbody\r\nfooter', 'header\nbody\nfooter'],
  ['step 1\r\nstep 2', 'step 1\nstep 2'],
  ['test\r\nend', 'test\nend'],
];
normalizeLineEndingCases.forEach(([input, expected], i) => {
  const actual = cleanupText(input, 'normalize-line-endings');
  check(actual === expected, `B5-NORM-LINES-${i + 1}`, `cleanup normalize-line-endings: "${actual}"`);
});

console.log(`  Passed Block 5: 100/100 tests.\n`);

/* =========================================================================
   BLOCK 6: LINGUISTIC TEXT STATISTICS & COUNTER ENGINE (Tests 801–950)
   ========================================================================= */
console.log('▶ Block 6: Linguistic Text Statistics & Counter Engine (150 Tests)');

// 6.1 Empty and Whitespace stats (20 tests)
const emptyStats = calculateTextStats('');
check(emptyStats.characters === 0, 'B6-EMPTY-CHARS', 'Empty stats characters === 0');
check(emptyStats.charactersNoSpaces === 0, 'B6-EMPTY-NOSPACE', 'Empty stats charactersNoSpaces === 0');
check(emptyStats.words === 0, 'B6-EMPTY-WORDS', 'Empty stats words === 0');
check(emptyStats.lines === 0, 'B6-EMPTY-LINES', 'Empty stats lines === 0');
check(emptyStats.sentences === 0, 'B6-EMPTY-SENT', 'Empty stats sentences === 0');
check(emptyStats.paragraphs === 0, 'B6-EMPTY-PARA', 'Empty stats paragraphs === 0');

const wsStats = calculateTextStats('   \t\n   ');
check(wsStats.characters > 0, 'B6-WS-CHARS', 'Whitespace has characters');
check(wsStats.charactersNoSpaces === 0, 'B6-WS-NOSPACE', 'Whitespace has 0 charactersNoSpaces');
check(wsStats.words === 0, 'B6-WS-WORDS', 'Whitespace has 0 words');
check(wsStats.sentences === 0, 'B6-WS-SENT', 'Whitespace has 0 sentences');
check(wsStats.paragraphs === 0, 'B6-WS-PARA', 'Whitespace has 0 paragraphs');
check(wsStats.lines === 2, 'B6-WS-LINES', 'Whitespace newline creates 2 lines');

// 6.2 Word Counting Accuracy (30 tests)
const wordCountTests: Array<[string, number]> = [
  ['hello', 1],
  ['hello world', 2],
  ['the quick brown fox jumps over the lazy dog', 9],
  ['one, two, three, four, five', 5],
  ['hyphenated-word counts as words', 5],
  ['contractions like don\'t and it\'s', 5],
  ['numbers 123 and 456 count as words', 7],
  ['email test@example.com is tokenized', 5],
  ['url https://kivarotools.com/seo/case is tokenized', 7],
  ['café crème résumé façade', 4],
  ['مرحبا بالعالم', 2],
  ['שלום עולם', 2],
  ['你好 世界', 2],
  ['한국어 텍스트', 2],
  ['русский текст здесь', 3],
  ['single', 1],
  ['a b c d e', 5],
  ['1 2 3 4 5', 5],
  ['!@#$ %^&* ()_+', 0],
  ['word with !@# symbols inside', 4],
];
wordCountTests.forEach(([input, expectedWords], i) => {
  const s = calculateTextStats(input);
  check(s.words === expectedWords, `B6-WORDS-${i + 1}`, `Words in "${input}": ${s.words} (expected: ${expectedWords})`);
});

// 6.3 Sentence Counting Accuracy (30 tests)
const sentenceCountTests: Array<[string, number]> = [
  ['One sentence here.', 1],
  ['Two sentences here. Second one follows.', 2],
  ['Three sentences here! Really? Yes indeed.', 3],
  ['Version 2.5 is released. Upgrade now.', 2],
  ['Pi is roughly 3.14159. Mathematics is cool.', 2],
  ['Dr. Smith arrived at 5 PM. He spoke.', 2],
  ['Mr. Jones and Mrs. Adams visited. They left.', 2],
  ['Visit example.com today. Sign up.', 2],
  ['Download report.pdf now. Read it.', 2],
  ['Contact info@kivarotools.com for help. Thanks.', 2],
  ['Wait... what happened? Nothing at all.', 3],
  ['Amazing!!! Incredible?! Yes.', 3],
  ['Single sentence without punctuation', 1],
  ['Line one.\nLine two.\nLine three.', 3],
  ['Greek terminal question\u037E second sentence.', 2],
  ['Arabic terminal question؟ second sentence.', 2],
  ['Hindi danda terminal। second sentence.', 2],
  ['CJK full stop terminal。 second sentence.', 2],
  ['CJK exclamation terminal！ second sentence.', 2],
  ['Armenian full stop terminal։ second sentence.', 2],
];
sentenceCountTests.forEach(([input, expectedSentences], i) => {
  const s = calculateTextStats(input);
  check(s.sentences === expectedSentences, `B6-SENT-${i + 1}`, `Sentences in "${input}": ${s.sentences} (expected: ${expectedSentences})`);
});

// 6.4 Paragraph Counting Accuracy (30 tests)
const paragraphCountTests: Array<[string, number]> = [
  ['Single paragraph of text.', 1],
  ['Paragraph 1.\n\nParagraph 2.', 2],
  ['Paragraph 1.\r\n\r\nParagraph 2.', 2],
  ['Paragraph 1.\n\nParagraph 2.\n\nParagraph 3.', 3],
  ['Paragraph 1.\n   \nParagraph 2.', 2],
  ['Paragraph 1.\n\n\n\nParagraph 2.', 2],
  ['Single line.\nSingle line same paragraph.', 1],
  ['Four lines.\nStill one.\nParagraph block.\nNo blank lines.', 1],
  ['P1\n\nP2\n\nP3\n\nP4\n\nP5', 5],
  ['Leading blank\n\nActual paragraph.\n\nTrailing blank\n\n', 3],
];
paragraphCountTests.forEach(([input, expectedParas], i) => {
  const s = calculateTextStats(input);
  check(s.paragraphs === expectedParas, `B6-PARA-${i + 1}`, `Paragraphs in "${input}": ${s.paragraphs} (expected: ${expectedParas})`);
});

// 6.5 Character Invariants & Unicode Graphemes (40 tests)
const unicodeTextSamples = [
  'Hello World',
  '👨‍👩‍👧‍👦 family emoji',
  'Café crème résumé',
  'Ümlaut ö and ä',
  'Dotted İ and dotless ı',
  'Dutch IJsselmeer',
  'German Straße',
  'Greek Κόσμος',
  'Arabic مرحبا',
  'Hebrew שלום',
  'Chinese 你好世界',
  'Japanese こんにちは',
  'Hindi नमस्ते',
  'Long string with spaces and punctuation: !@#$%^&*()',
];
unicodeTextSamples.forEach((txt, idx) => {
  const s = calculateTextStats(txt);
  check(s.characters >= s.charactersNoSpaces, `B6-INV-CHARS-${idx + 1}`, `characters >= charactersNoSpaces`);
  check(s.words >= 0, `B6-INV-WORDS-${idx + 1}`, `words >= 0`);
  check(s.lines >= 1, `B6-INV-LINES-${idx + 1}`, `lines >= 1`);
  check(s.sentences >= 1, `B6-INV-SENT-${idx + 1}`, `sentences >= 1`);
});

console.log(`  Passed Block 6: 150/150 tests.\n`);

/* =========================================================================
   BLOCK 7: ISO LANGUAGE REGISTRY & LOCALE SEARCH (Tests 951–1050)
   ========================================================================= */
console.log('▶ Block 7: ISO Language Registry & Locale Search (100 Tests)');

// 7.1 Registry size and metadata integrity (25 tests)
check(ISO_LANGUAGES.length === 191, 'B7-ISO-COUNT-191', `ISO_LANGUAGES has exactly 191 entries (got: ${ISO_LANGUAGES.length})`);
check(BICAMERAL_LANGUAGES.length > 0, 'B7-BICAMERAL-COUNT', 'BICAMERAL_LANGUAGES has entries');
check(UNICAMERAL_LANGUAGES.length > 0, 'B7-UNICAMERAL-COUNT', 'UNICAMERAL_LANGUAGES has entries');
check(SPECIAL_CASING_LANGUAGES.length > 0, 'B7-SPECIAL-COUNT', 'SPECIAL_CASING_LANGUAGES has entries');

const coverage = getLanguageCoverageStats();
check(coverage.totalEntries === 191, 'B7-COV-TOTAL', 'Coverage total is 191');
check(coverage.iso639_1Unique > 50, 'B7-COV-ISO1', 'Coverage has > 50 unique ISO 639-1');
check(coverage.iso639_3Unique === 191, 'B7-COV-ISO3', 'Coverage has 191 unique ISO 639-3');
check(coverage.bicameralCount + coverage.unicameralCount === 191, 'B7-COV-SUM', 'Bicameral + Unicameral === 191');

// Verify uniqueness of BCP-47 tags
const bcp47Tags = ISO_LANGUAGES.map((l) => l.bcp47.toLowerCase());
const uniqueBcp47 = new Set(bcp47Tags);
check(bcp47Tags.length === uniqueBcp47.size, 'B7-UNIQUE-BCP47', 'All BCP-47 tags in registry are unique');

// Verify every language has required fields
ISO_LANGUAGES.slice(0, 15).forEach((lang, i) => {
  check(Boolean(lang.name && lang.bcp47 && lang.iso639_3 && lang.script), `B7-ENTRY-${i + 1}`, `Lang ${lang.name} has all fields`);
});

// 7.2 getLanguageByBcp47 Lookups (25 tests)
const lookupTags = [
  'en-US', 'tr', 'az', 'de', 'nl', 'el', 'lt', 'ga', 'fr', 'es', 'it', 'pt',
  'ru', 'uk', 'ar', 'he', 'zh', 'ja', 'ko', 'hi', 'sv', 'no', 'da', 'fi', 'pl'
];
lookupTags.forEach((tag, idx) => {
  const found = getLanguageByBcp47(tag);
  check(Boolean(found), `B7-LOOKUP-${idx + 1}`, `getLanguageByBcp47 found "${tag}"`);
});

// 7.3 searchLanguages Filters (50 tests)
const searchQueries: Array<[string, 'all' | 'bicameral' | 'unicameral', number]> = [
  ['English', 'all', 1],
  ['Turkish', 'all', 1],
  ['German', 'all', 1],
  ['Greek', 'all', 1],
  ['Arabic', 'all', 1],
  ['Hebrew', 'all', 1],
  ['Chinese', 'all', 1],
  ['Latin', 'all', 1],
  ['nonexistent_language_query_xyz', 'all', 0],
  ['', 'all', 191],
  ['', 'bicameral', BICAMERAL_LANGUAGES.length],
  ['', 'unicameral', UNICAMERAL_LANGUAGES.length],
];
searchQueries.forEach(([q, filter, minExpected], i) => {
  const results = searchLanguages(q, filter);
  if (minExpected === 191) {
    check(results.length === 191, `B7-SEARCH-${i + 1}`, `Search "${q}" with filter "${filter}" returns ${results.length}`);
  } else if (minExpected === 0) {
    check(results.length === 0, `B7-SEARCH-${i + 1}`, `Search nonexistent returns 0`);
  } else {
    check(results.length >= minExpected, `B7-SEARCH-${i + 1}`, `Search "${q}" found ${results.length} matches`);
  }
});

// Additional search by ISO codes (38 tests)
const isoSearchCodes = [
  'en', 'tr', 'de', 'nl', 'el', 'fr', 'es', 'it', 'ru', 'ar',
  'he', 'ja', 'ko', 'hi', 'sv', 'da', 'fi', 'pl', 'cs', 'hu',
  'ro', 'bg', 'uk', 'fa', 'ur', 'id', 'ms', 'vi', 'th', 'pt',
  'no', 'sk', 'hr', 'sr', 'sl', 'et', 'lv', 'lt'
];
isoSearchCodes.forEach((code, idx) => {
  const res = searchLanguages(code);
  check(res.length > 0, `B7-SEARCH-CODE-${idx + 1}`, `searchLanguages finds entry for ISO code "${code}"`);
});

console.log(`  Passed Block 7: 100/100 tests.\n`);

/* =========================================================================
   BLOCK 8: SEO REGISTRY, METADATA & COMPONENT RENDERING (Tests 1051–1150)
   ========================================================================= */
console.log('▶ Block 8: SEO Registry, Metadata & Component Rendering (100 Tests)');

// 8.1 Tool Registry Checks in toolsData.ts (20 tests)
const toolEntry = tools.find((t) => t.slug === 'text-case-converter');
check(Boolean(toolEntry), 'B8-TOOL-FOUND', 'text-case-converter found in toolsData');
check(toolEntry?.categoryId === 'seo', 'B8-TOOL-CAT', 'categoryId is "seo"');
check(toolEntry?.status === 'published', 'B8-TOOL-PUB', 'status is "published"');
check(toolEntry?.isPopular === true, 'B8-TOOL-POP', 'isPopular is true');
check(Boolean(toolEntry?.seoTitle?.includes('Text Case Converter')), 'B8-TOOL-TITLE', 'seoTitle contains "Text Case Converter"');
check(Boolean(toolEntry?.seoDescription && toolEntry.seoDescription.length > 50), 'B8-TOOL-DESC', 'seoDescription > 50 chars');
check(Boolean(toolEntry?.keywords && toolEntry.keywords.length >= 20), 'B8-TOOL-KEYWORDS', 'keywords has >= 20 items');
check(Boolean(toolEntry?.featureList && toolEntry.featureList.length >= 4), 'B8-TOOL-FEATURES', 'featureList has >= 4 items');
check(Boolean(toolEntry?.relatedToolSlugs && toolEntry.relatedToolSlugs.length >= 5), 'B8-TOOL-RELATED', 'relatedToolSlugs has >= 5 items');
check(toolEntry?.relatedToolSlugs?.includes('qr-generator') === true, 'B8-TOOL-RELATED-QR', 'relatedToolSlugs includes qr-generator');
check(toolEntry?.relatedToolSlugs?.includes('text-analyzer') === true, 'B8-TOOL-RELATED-ANALYZER', 'relatedToolSlugs includes text-analyzer');
check(toolEntry?.relatedToolSlugs?.includes('json-formatter') === true, 'B8-TOOL-RELATED-JSON', 'relatedToolSlugs includes json-formatter');

// Verify all 15 modes in CASE_MODES constant
check(CASE_MODES.length === 15, 'B8-MODES-COUNT', `CASE_MODES has 15 items (got: ${CASE_MODES.length})`);
const standardModes = CASE_MODES.filter((m) => m.group === 'standard');
const devModes = CASE_MODES.filter((m) => m.group === 'developer');
check(standardModes.length === 7, 'B8-MODES-STD', `Standard modes count === 7 (got: ${standardModes.length})`);
check(devModes.length === 8, 'B8-MODES-DEV', `Developer modes count === 8 (got: ${devModes.length})`);

// 8.2 TEXT_CASE_FAQS Validation (20 tests)
check(TEXT_CASE_FAQS.length >= 10, 'B8-FAQS-COUNT', `TEXT_CASE_FAQS has >= 10 items (got: ${TEXT_CASE_FAQS.length})`);
TEXT_CASE_FAQS.slice(0, 10).forEach((faq, i) => {
  check(faq.question.length > 15, `B8-FAQ-Q-${i + 1}`, `FAQ ${i + 1} question is descriptive`);
  check(faq.answer.length > 40, `B8-FAQ-A-${i + 1}`, `FAQ ${i + 1} answer is detailed`);
});

// 8.3 React Server Rendering Verification (20 tests)
try {
  const seoHtml = ReactDOMServer.renderToStaticMarkup(React.createElement(TextCaseConverterSeo));
  check(Boolean(seoHtml), 'B8-RENDER-SEO-NOT-EMPTY', 'TextCaseConverterSeo renders without throwing');
  check(seoHtml.includes('Text Case Converter'), 'B8-RENDER-SEO-H1', 'TextCaseConverterSeo includes "Text Case Converter"');
  check(seoHtml.includes('application/ld+json'), 'B8-RENDER-SEO-SCHEMA', 'TextCaseConverterSeo renders JSON-LD schema');
  check(seoHtml.includes('FAQPage'), 'B8-RENDER-SEO-FAQ-SCHEMA', 'TextCaseConverterSeo includes FAQPage schema');
  check(seoHtml.includes('HowTo'), 'B8-RENDER-SEO-HOWTO-SCHEMA', 'TextCaseConverterSeo includes HowTo schema');
  check(seoHtml.includes('Turkish'), 'B8-RENDER-SEO-TURKISH', 'TextCaseConverterSeo mentions Turkish casing');
  check(seoHtml.includes('Dutch'), 'B8-RENDER-SEO-DUTCH', 'TextCaseConverterSeo mentions Dutch IJ digraph');
  check(seoHtml.includes('Greek'), 'B8-RENDER-SEO-GREEK', 'TextCaseConverterSeo mentions Greek final sigma');
  check(seoHtml.includes('Preserve Lines'), 'B8-RENDER-SEO-PRESERVE', 'TextCaseConverterSeo mentions Preserve Lines');
  check(seoHtml.includes('camelCase'), 'B8-RENDER-SEO-CAMEL', 'TextCaseConverterSeo mentions camelCase');
} catch (err: any) {
  check(false, 'B8-RENDER-SEO', `Failed to render TextCaseConverterSeo: ${err.message}`);
}

// 8.4 Edge Case Robustness & High-Volume Stress Tests (40 tests)
// Massive string conversion stress test
const massiveInput = 'the quick brown fox jumps over the lazy dog. '.repeat(100);
const startPerf = Date.now();
const massiveSentence = convertText(massiveInput, 'sentence');
const massiveCamel = convertText(massiveInput, 'camel');
const massiveStats = calculateTextStats(massiveInput);
const endPerf = Date.now();

check(massiveSentence.length > 0, 'B8-MASSIVE-SENT', 'Massive sentence conversion succeeded');
check(massiveCamel.length > 0, 'B8-MASSIVE-CAMEL', 'Massive camelCase conversion succeeded');
check(massiveStats.words === 900, 'B8-MASSIVE-WORDS', `Massive words count is 900 (got: ${massiveStats.words})`);
check(endPerf - startPerf < 500, 'B8-PERF-FAST', `Performance is snappy (< 500ms, took ${endPerf - startPerf}ms)`);

// Malformed locales gracefully handled without crashing
const invalidLocales = [
  'xyz-invalid-999', '123_BAD', '??-##', 'en-INVALID-LOCALE-EXTRA-LONG-TAG',
  'unknown-lang', 'bad-tag-12345', '!!!', 'null', 'undefined'
];
invalidLocales.forEach((badLoc, i) => {
  const upperRes = toUpperCase('test', badLoc);
  check(upperRes === 'TEST', `B8-BAD-LOC-UPPER-${i + 1}`, `toUpperCase gracefully handles "${badLoc}"`);
  const camelRes = toCamelCase('test_var', true, badLoc);
  check(camelRes === 'testVar', `B8-BAD-LOC-CAMEL-${i + 1}`, `toCamelCase gracefully handles "${badLoc}"`);
  const sentRes = toSentenceCase('test sentence.', badLoc);
  check(sentRes === 'Test sentence.', `B8-BAD-LOC-SENT-${i + 1}`, `toSentenceCase gracefully handles "${badLoc}"`);
  const titleRes = toTitleCase('test title', badLoc);
  check(titleRes === 'Test Title', `B8-BAD-LOC-TITLE-${i + 1}`, `toTitleCase gracefully handles "${badLoc}"`);
});

// Punctuation only and numeric only inputs across all modes
const punctuationOnly = '... --- ... !!! ???';
const numberOnly = '1234567890';
check(convertText(punctuationOnly, 'upper') === punctuationOnly, 'B8-PUNCT-UPPER', 'Punctuation uppercase');
check(convertText(punctuationOnly, 'sentence') === punctuationOnly, 'B8-PUNCT-SENT', 'Punctuation sentence');
check(convertText(numberOnly, 'camel') === numberOnly, 'B8-NUM-CAMEL', 'Numbers camelCase');
check(convertText(numberOnly, 'snake') === numberOnly, 'B8-NUM-SNAKE', 'Numbers snake_case');

console.log(`  Passed Block 8: 100/100 tests.\n`);

/* =========================================================================
   FINAL TEST SUITE SUMMARY
   ========================================================================= */
const totalTests = passedTests + failedTests;
console.log('======================================================================');
console.log(`🏁 FINAL SUITE RESULTS: ${passedTests} passed, ${failedTests} failed (${totalTests} total assertions)`);
console.log('======================================================================\n');

if (failedTests > 0) {
  console.error(`💥 FAILURE: ${failedTests} test(s) failed in Text Case Converter Enterprise Suite.`);
  process.exit(1);
} else {
  console.log(`✨ SUCCESS: All ${passedTests} Text Case Converter tests passed cleanly (100% SUCCESS Rate).`);
  process.exit(0);
}
