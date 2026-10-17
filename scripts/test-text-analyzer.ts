/**
 * OmniTools Text Analyzer — Comprehensive Regression & Accuracy Test Suite
 *
 * Verifies:
 * 1. Character counting (UTF-16 code units vs grapheme clusters)
 * 2. Word tokenization (contractions, hyphenated terms, formatted numbers, decimals)
 * 3. Sentence segmentation (abbreviations, quotes, international punctuation: Arabic, Urdu, CJK)
 * 4. Paragraph and line count boundaries (CRLF, LF, multiple blank lines)
 * 5. Reading time (225 WPM) and speaking time (configurable WPM)
 * 6. Readability formulas (Flesch, FK Grade, Gunning Fog, SMOG, Coleman-Liau, ARI)
 * 7. Keyword density and phrase repetition math
 * 8. Zero-state and whitespace resilience
 */

import {
  analyzeText,
  wordsOf,
  sentencesOf,
  countGraphemes,
  countLines,
  SAMPLE_TEXT,
} from '../components/tools/TextAnalyzer';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: unknown) {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${testName}`, details !== undefined ? details : '');
  }
}

console.log('🧪 [OmniTools] Running Text Analyzer Automated Verification Suite...\n');

// ============================================================
// 1. Empty & Whitespace Handling
// ============================================================
console.log('• Testing Suite 1: Empty and Whitespace Boundaries...');
const empty = analyzeText('');
assert(empty.words === 0, 'Empty string yields 0 words');
assert(empty.chars === 0, 'Empty string yields 0 characters');
assert(empty.graphemes === 0, 'Empty string yields 0 graphemes');
assert(empty.sentences === 0, 'Empty string yields 0 sentences');
assert(empty.paragraphs === 0, 'Empty string yields 0 paragraphs');
assert(empty.lines === 0, 'Empty string yields 0 lines');
assert(empty.readingTimeSec === 0, 'Empty string yields 0 reading time');
assert(empty.flesch === null, 'Empty string yields null Flesch score');

const whitespace = analyzeText('   \n\t  \r\n  ');
assert(whitespace.words === 0, 'Whitespace-only string yields 0 words');
assert(whitespace.sentences === 0, 'Whitespace-only string yields 0 sentences');
assert(whitespace.paragraphs === 0, 'Whitespace-only string yields 0 paragraphs');

// ============================================================
// 2. Word Tokenization & Contractions
// ============================================================
console.log('\n• Testing Suite 2: Word Tokenization, Contractions & Numbers...');
const contText = "Don't worry, it's a state-of-the-art tool.";
const contWords = wordsOf(contText);
assert(contWords.length === 6, 'Contractions and hyphens count as single words (6 total)', contWords);
assert(contWords.includes("don't"), 'Contraction "don\'t" is preserved');
assert(contWords.includes("it's"), 'Contraction "it\'s" is preserved');
assert(contWords.includes("state-of-the-art"), 'Hyphenated term "state-of-the-art" is preserved');

const numText = "Revenue reached $1,000,000 with a 3.14% margin in 2026.";
const numWords = wordsOf(numText);
assert(numWords.includes("1,000,000"), 'Comma-formatted number "1,000,000" is single token', numWords);
assert(numWords.includes("3.14"), 'Decimal number "3.14" is single token', numWords);
assert(numWords.includes("2026"), 'Year number "2026" is a word token', numWords);

// ============================================================
// 3. Sentence Boundary & Abbreviation Protection
// ============================================================
console.log('\n• Testing Suite 3: Sentence Boundaries & Abbreviation Protection...');
const abbrText = "Dr. Smith met with Mr. Jones at 4 p.m. to discuss the U.S. market. The meeting was productive.";
const abbrSentences = sentencesOf(abbrText);
assert(abbrSentences.length === 2, 'Dotted abbreviations do not cause false sentence splits (expected 2)', abbrSentences);

const techText = "We released Next.js and Node.js packages on example.com yesterday. All tests passed.";
const techSentences = sentencesOf(techText);
assert(techSentences.length === 2, 'Interior dots in technical identifiers do not split sentences', techSentences);

const quoteText = 'The manager asked, "What is the status?" She waited for an answer.';
const quoteSentences = sentencesOf(quoteText);
assert(quoteSentences.length === 2, 'Dialogue quotes preserve cohesive sentence boundaries', quoteSentences);

const punctOnly = analyzeText("! ? ... --- ,, ;; ::");
assert(punctOnly.words === 0, 'Punctuation-only string produces 0 words');
assert(punctOnly.sentences === 0, 'Punctuation-only string produces 0 countable sentences');

// ============================================================
// 4. Unicode, Emojis & International Scripts
// ============================================================
console.log('\n• Testing Suite 4: Unicode Graphemes & International Scripts...');
const emojiStr = "👨‍👩‍👧‍👦 👍🏽 🏳️‍🌈";
assert(emojiStr.length === 23, 'Compound emoji UTF-16 length is 23 code units');
assert(countGraphemes(emojiStr) === 5, 'Compound emoji grapheme cluster count is 5 visual glyphs');

const urduText = "یہ ایک آزمائشی جملہ ہے۔ اردو زبان میں گنتی درست ہونی چاہیے۔";
const urduSentences = sentencesOf(urduText);
assert(urduSentences.length === 2, 'Urdu terminal stop (U+06D4) splits into 2 sentences', urduSentences);

const cjkText = "这是一个测试。こんにちは世界！今天天气很好？";
const cjkSentences = sentencesOf(cjkText);
assert(cjkSentences.length === 3, 'CJK full stop and fullwidth question/exclamation split 3 sentences', cjkSentences);

const arabicText = "مرحبا بالعالم! كيف حالك؟ هذا يوم جميل.";
const arabicSentences = sentencesOf(arabicText);
assert(arabicSentences.length === 3, 'Arabic question mark (U+061F) splits into 3 sentences', arabicSentences);

// ============================================================
// 5. Paragraphs & Line Endings
// ============================================================
console.log('\n• Testing Suite 5: Paragraphs & Line Endings...');
const multiLine = "Line 1\r\nLine 2\nLine 3";
assert(countLines(multiLine) === 3, 'Normalizes mixed CRLF and LF into 3 physical lines');

const multiPara = "Paragraph 1.\n\nParagraph 2.\r\n\r\nParagraph 3.";
const paraAnalysis = analyzeText(multiPara);
assert(paraAnalysis.paragraphs === 3, 'Consecutive blank lines correctly delimit 3 paragraphs');

// ============================================================
// 6. Reading Time & Speaking Time
// ============================================================
console.log('\n• Testing Suite 6: Reading & Speaking Time Estimation...');
const words225 = Array(225).fill('word').join(' ');
const time225 = analyzeText(words225, 0, 150);
assert(time225.readingTimeSec === 60, '225 words at 225 WPM yields exactly 60 seconds reading time');
assert(time225.speakingTimeSec === 90, '225 words at 150 WPM yields exactly 90 seconds speaking time');

const words450 = Array(450).fill('word').join(' ');
const time450 = analyzeText(words450, 0, 150);
assert(time450.readingTimeSec === 120, '450 words at 225 WPM yields exactly 120 seconds reading time');

// ============================================================
// 7. Readability Formulas Accuracy
// ============================================================
console.log('\n• Testing Suite 7: Readability Index Formulas...');
const sampleAnalysis = analyzeText(SAMPLE_TEXT);
assert(sampleAnalysis.words > 100, `Sample text has sufficient words (${sampleAnalysis.words})`);
assert(sampleAnalysis.sentences >= 4, `Sample text has multiple sentences (${sampleAnalysis.sentences})`);
assert(sampleAnalysis.flesch !== null && sampleAnalysis.flesch >= 50 && sampleAnalysis.flesch <= 75, `Sample Flesch score (${sampleAnalysis.flesch}) is within plain English 50–75 band`);
assert(sampleAnalysis.fkGrade !== null && sampleAnalysis.fkGrade >= 6 && sampleAnalysis.fkGrade <= 12, `Sample FK Grade (${sampleAnalysis.fkGrade}) is within expected 6–12 band`);
assert(sampleAnalysis.fog !== null && sampleAnalysis.fog > 0, 'Gunning Fog index is computed');
assert(sampleAnalysis.smog !== null && sampleAnalysis.smog > 0, 'SMOG index is computed');
assert(sampleAnalysis.coleman !== null, 'Coleman-Liau index is computed');
assert(sampleAnalysis.ari !== null, 'ARI index is computed');

// ============================================================
// 8. Keyword Density & Repetition
// ============================================================
console.log('\n• Testing Suite 8: Keyword Density & Stop Word Filtering...');
const textWithKeywords = "Strategy is essential. Good strategy delivers results. A strong strategy wins.";
const kwAnalysis = analyzeText(textWithKeywords);
const topKw = kwAnalysis.keywords.find(k => k.word === 'strategy');
assert(Boolean(topKw && topKw.count === 3), 'Keyword "strategy" counted exactly 3 times');
assert(!kwAnalysis.keywords.some(k => k.word === 'is' || k.word === 'a'), 'Stop words "is" and "a" excluded from keyword table');

// ============================================================
// 9. Readability Boundary & Flesch Lower-Bound Regression Suite
// ============================================================
console.log('\n• Testing Suite 9: Extreme Readability & Flesch Lower-Bound Clamping...');

// Exact 100-word, 4-sentence passage with 214 syllables and 30 complex words
const exactPassage = [
  "The academic research group was direct in that they investigate understanding of biological technologies and computational methodologies to design distributed processing architectures for this framework.",
  "An expert report on global market policy can prioritize maintaining consistent regulatory standards for modern centers to develop innovative therapeutic strategies by collaborative scientific initiatives.",
  "It was a truth that voluminous quantitative insights from sample records provide meaningful output for clinical researchers across diverse environments with experimental benchmark at length.",
  "Which central metric will lead groups action and impact domain status as we track costs hazards timing workflow patterns robust base outcomes rules outlines goals?"
].join(' ');

const exactResult = analyzeText(exactPassage, 0.05, 150);
assert(exactResult.words === 100, `Exact input passage has 100 words (got ${exactResult.words})`);
assert(exactResult.sentences === 4, `Exact input passage has 4 sentences (got ${exactResult.sentences})`);
assert(exactResult.syllables === 214, `Exact input passage has 214 syllables (got ${exactResult.syllables})`);
assert(exactResult.fleschRaw !== null && Math.abs(exactResult.fleschRaw - 0.416) < 0.001, `Exact raw Flesch is unrounded calculation ~0.416 (got ${exactResult.fleschRaw})`);
assert(exactResult.flesch === 0, `Exact Flesch score rounds/clamps to 0 (got ${exactResult.flesch})`);
assert(exactResult.gradeLabel === 'Very Difficult', `Flesch score 0 assigns "Very Difficult" grade label (got "${exactResult.gradeLabel}")`);
assert(exactResult.fkGrade === 19.4, `FK Grade is exactly 19.4 (got ${exactResult.fkGrade})`);
assert(exactResult.fog === 22, `Gunning Fog index is exactly 22 (got ${exactResult.fog})`);
assert(exactResult.smog === 18.8, `SMOG index is exactly 18.8 (got ${exactResult.smog})`);
assert(exactResult.coleman === 21.8, `Coleman-Liau index is exactly 21.8 (got ${exactResult.coleman})`);
assert(exactResult.ari === 22.2, `ARI index is exactly 22.2 (got ${exactResult.ari})`);
assert(exactResult.estimatedEarnings === 5, `Estimated earnings for 100 words at $0.05 is $5.00 (got ${exactResult.estimatedEarnings})`);

// Negative raw Flesch text clamping test (text so dense that raw Flesch < 0)
const hyperDenseText = "Pseudopseudohypoparathyroidism and radioimmunoelectrophoresis characterize magnetohydrodynamical electroencephalography throughout counterrevolutionary spectrophotometries.";
const hyperResult = analyzeText(hyperDenseText);
assert(hyperResult.fleschRaw !== null && hyperResult.fleschRaw < 0, `Hyper-dense text produces negative raw Flesch (<0, got ${hyperResult.fleschRaw})`);
assert(hyperResult.flesch === 0, `Negative raw Flesch cleanly clamps to 0 lower bound (got ${hyperResult.flesch})`);
assert(hyperResult.gradeLabel === 'Very Difficult', 'Negative raw Flesch still maps to "Very Difficult"');

// Ordinary text remains completely unaffected
assert(sampleAnalysis.fleschRaw !== null && sampleAnalysis.fleschRaw >= 50 && sampleAnalysis.fleschRaw <= 75, `Ordinary sample text preserves raw Flesch within 50–75 band (got ${sampleAnalysis.fleschRaw})`);
assert(sampleAnalysis.flesch !== null && sampleAnalysis.flesch >= 50 && sampleAnalysis.flesch <= 75, `Ordinary sample text preserves clamped Flesch within 50–75 band (got ${sampleAnalysis.flesch})`);
assert(empty.fleschRaw === null, 'Empty text preserves null raw Flesch');
assert(empty.flesch === null, 'Empty text preserves null clamped Flesch');

// ============================================================
// Summary
// ============================================================
console.log('\n' + '='.repeat(50));
console.log(`TOTAL TESTS: ${passed + failed}`);
console.log(`PASSED:      ${passed}`);
console.log(`FAILED:      ${failed}`);
console.log('='.repeat(50) + '\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL TEXT ANALYZER REGRESSION TESTS PASSED CLEANLY.\n');
  process.exit(0);
}
