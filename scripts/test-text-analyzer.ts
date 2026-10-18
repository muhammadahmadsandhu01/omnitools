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
  applySafeGrammarFixes,
  gradeLabel,
  SAMPLE_TEXT,
  runGrammarEngine,
  applyFindingCorrection,
  applyAllSafeFixes,
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
const independentRawFlesch = 206.835 - (1.015 * (exactResult.words / exactResult.sentences)) - (84.6 * (exactResult.syllables / exactResult.words));
assert(Math.abs(exactResult.fleschRaw! - independentRawFlesch) < 1e-9, `Raw Flesch independently recomputed from word (100), sentence (4), and syllable (214) counters matches formula (expected ${independentRawFlesch}, got ${exactResult.fleschRaw})`);
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
// 10. Introductory Comma & Comma Splice Regression Suite (Issue 2)
// ============================================================
console.log('\n• Testing Suite 10: Introductory Commas & Comma Splice Verification...');

// Valid introductory phrase must NOT be flagged as comma splice
const introSentence = "In 2025, a multinational technology company announced the results of an internal workforce transformation, which had been completed across multiple regional divisions.";
const introRes = analyzeText(introSentence);
const introSplice = introRes.coachFindings.find(f => /comma splice/i.test(f.issue));
assert(!introSplice, 'Valid introductory comma "In 2025, ..." is not flagged as a comma splice');

// Valid introductory clauses with various prepositional openers
const moreIntroSentences = [
  "During the third quarter, our operations team reviewed the performance metrics.",
  "According to recent market analyses, consumer demand increased steadily.",
  "Throughout 2025, the research division evaluated several new models.",
  "For example, the new algorithm processes text substantially faster."
];
for (const s of moreIntroSentences) {
  const r = analyzeText(s);
  const splice = r.coachFindings.find(f => /comma splice/i.test(f.issue));
  assert(!splice, `Introductory opener "${s.slice(0, 25)}..." does not trigger comma splice`);
}

// Genuine comma splice MUST be detected and suggest a semicolon or coordinating conjunction
const genuineSpliceText = "The system failed, the team restarted it.";
const spliceRes = analyzeText(genuineSpliceText);
const genuineSplice = spliceRes.coachFindings.find(f => /comma splice/i.test(f.issue));
assert(Boolean(genuineSplice), 'Genuine comma splice "The system failed, the team restarted it." is detected');
assert(genuineSplice?.rewrite === "The system failed; the team restarted it.", `Genuine comma splice rewrite produces valid semicolon join (got "${genuineSplice?.rewrite}")`);

// Comma splice inside a sentence with an introductory phrase must fix ONLY the splice point
const introPlusSplice = "In 2025, the company launched the product, the team monitored adoption closely.";
const introPlusSpliceRes = analyzeText(introPlusSplice);
const complexSplice = introPlusSpliceRes.coachFindings.find(f => /comma splice/i.test(f.issue));
assert(Boolean(complexSplice?.rewrite?.startsWith("In 2025, ")), 'Rewrite preserves valid introductory comma "In 2025, " without turning it into a semicolon');
assert(!complexSplice?.rewrite?.includes("In 2025;"), 'Rewrite NEVER replaces valid introductory comma with an invalid semicolon "In 2025;"');
assert(complexSplice?.rewrite === "In 2025, the company launched the product; the team monitored adoption closely.", 'Exact suggested rewrite for introductory phrase followed by comma splice is verified');

// Prepositional opener with full clause must still be detected as comma splice
const prepClauseSplice = "In 2025 the company launched the product, the team monitored adoption closely.";
const prepClauseSpliceRes = analyzeText(prepClauseSplice);
const prepClauseSpliceFinding = prepClauseSpliceRes.coachFindings.find(f => /comma splice/i.test(f.issue));
assert(Boolean(prepClauseSpliceFinding), 'Genuine comma splice in clause starting with preposition is detected');
assert(prepClauseSpliceFinding?.rewrite === "In 2025 the company launched the product; the team monitored adoption closely.", 'Exact suggested rewrite for prepositional clause comma splice is verified');

// Quoted dialogue containing a comma splice must NOT trigger coach warnings
const quotedSpliceDouble = 'The engineer said, "The system failed, the team restarted it."';
const quotedSpliceDoubleRes = analyzeText(quotedSpliceDouble);
assert(!quotedSpliceDoubleRes.coachFindings.some(f => /comma splice/i.test(f.issue)), 'Comma splice inside double-quoted dialogue is not flagged');

const quotedSpliceSingle = "The engineer said, 'The system failed, the team restarted it.'";
const quotedSpliceSingleRes = analyzeText(quotedSpliceSingle);
assert(!quotedSpliceSingleRes.coachFindings.some(f => /comma splice/i.test(f.issue)), 'Comma splice inside single-quoted dialogue is not flagged');

// Comma splice with contractions and possessives must still be detected
const contractionSplice = "The company's server crashed, it remains offline.";
const contractionSpliceRes = analyzeText(contractionSplice);
const contrSpliceFinding = contractionSpliceRes.coachFindings.find(f => /comma splice/i.test(f.issue));
assert(Boolean(contrSpliceFinding), 'Comma splice containing possessives and contractions is detected');
assert(contrSpliceFinding?.rewrite === "The company's server crashed; it remains offline.", 'Comma splice rewrite preserves possessives and contractions with semicolon join');

// ============================================================
// 11. Subject–Verb Agreement & Precision Calibration (Issue 3 & 4)
// ============================================================
console.log('\n• Testing Suite 11: Subject–Verb Agreement & Precision Calibration...');

// Prepositional phrases with plural objects following singular subjects MUST NOT be flagged
const prepSubjectSentences = [
  "The impact of these changes was significant across all divisions.",
  "The success of these tools has been demonstrated in multiple benchmarks.",
  "The combination of these features has improved overall efficiency.",
  "A comprehensive review of these policies was conducted by leadership.",
  "The quality of these was verified by the quality assurance team.",
  "The box of tools was heavy.",
  "The duration of those was documented carefully.",
  "The impact of all these changes was significant across all divisions.",
  "The member of both committees was recognized by leadership."
];
for (const s of prepSubjectSentences) {
  const r = analyzeText(s);
  const agr = r.coachFindings.find(f => /agreement|mismatch/i.test(f.issue));
  assert(!agr, `Singular subject with plural prepositional object "${s.slice(0, 35)}..." has NO false agreement finding`);
}

// Collective nouns and singular nouns ending in 's'
const collectiveSentences = [
  "The operations team remains confident in the new infrastructure.",
  "The committee was unanimous in its decision.",
  "Economics was his primary field of research at the university.",
  "The board has approved the annual operating budget.",
  "The staff of researchers was recognized by leadership.",
  "The faculty was unanimous in endorsing the new program.",
  "The analytics has been verified by the audit team.",
  "The series was well received by the audience.",
  "The news was confirmed this morning.",
  "The headquarters was established in the capital.",
  "The logistics was coordinated smoothly across all regional distribution centers.",
  "The press corps was briefed on the new policy.",
  "The physics was fascinating to the engineering department.",
  "The mathematics was foundational to the architecture.",
  "The species was protected under federal law.",
  "The lens was cleaned before inspection."
];
for (const s of collectiveSentences) {
  const r = analyzeText(s);
  const agr = r.coachFindings.find(f => /agreement|mismatch/i.test(f.issue));
  assert(!agr, `Collective / singular 's' noun "${s.slice(0, 30)}..." has NO false agreement finding`);
}

// Coordinated subjects and relative clauses
const complexSentences = [
  "Both the team and the director were present at the meeting.",
  "Both the teachers and the students were satisfied with the outcome.",
  "A company that manages these servers was notified immediately.",
  "The manager who oversees these divisions was praised by the executive committee.",
  "The engineer who tested these was recognized for outstanding diligence."
];
for (const s of complexSentences) {
  const r = analyzeText(s);
  const agr = r.coachFindings.find(f => /agreement|mismatch/i.test(f.issue));
  assert(!agr, `Coordinated / relative clause sentence "${s.slice(0, 30)}..." has NO false agreement finding`);
}

// Subjunctive mood and auxiliary questions must NOT be flagged as agreement errors
const legitimateGrammarExceptions = [
  "If he were available, he would assist with the deployment.",
  "I wish it were simpler to configure the cluster.",
  "As if that were possible under current constraints.",
  "Did he have any questions regarding the new architecture?",
  "Does she have the encryption keys for the production database?",
  "Did each member have a copy of the agenda?"
];
for (const s of legitimateGrammarExceptions) {
  const r = analyzeText(s);
  const agr = r.coachFindings.find(f => /agreement|mismatch/i.test(f.issue));
  assert(!agr, `Legitimate grammatical exception "${s.slice(0, 35)}..." has NO false agreement finding`);
}

// Genuine subject-verb agreement errors MUST be detected and identify subject & verb
const genuineAgrErrors = [
  { text: "These results was unexpected.", subj: "These results", verb: "was", expectedVerb: "were", conf: "MEDIUM" },
  { text: "The findings was confirmed by the audit team.", subj: "The findings", verb: "was", expectedVerb: "were", conf: "MEDIUM" },
  { text: "The reports was submitted yesterday.", subj: "The reports", verb: "was", expectedVerb: "were", conf: "MEDIUM" },
  { text: "He were ready for the presentation.", subj: "He", verb: "were", expectedVerb: "was", conf: "HIGH" },
  { text: "They was late for the conference.", subj: "They", verb: "was", expectedVerb: "were", conf: "HIGH" },
  { text: "Each student have completed the test.", subj: "Each student", verb: "have", expectedVerb: "has", conf: "HIGH" }
];
for (const tc of genuineAgrErrors) {
  const r = analyzeText(tc.text);
  const agr = r.coachFindings.find(f => /agreement|mismatch/i.test(f.issue));
  assert(Boolean(agr), `Genuine error "${tc.text}" is detected`);
  assert(Boolean(agr?.issue?.includes(tc.subj)), `Finding issue explicitly identifies subject "${tc.subj}"`);
  assert(Boolean(agr?.issue?.includes(tc.verb)), `Finding issue explicitly identifies verb "${tc.verb}"`);
  assert(Boolean(agr?.suggestion?.includes(tc.expectedVerb)), `Suggestion explicitly identifies replacement verb "${tc.expectedVerb}"`);
  assert(agr?.confidence === tc.conf, `Confidence is calibrated to ${tc.conf} (got ${agr?.confidence})`);
}

// Sentence reference mapping fidelity with abbreviations, titles, and decimals
const complexPunctText = "Dr. Smith announced v2.5 yesterday. At 4:00 p.m., the team launched the update. He were not ready.";
const complexPunctRes = analyzeText(complexPunctText);
const errorFinding = complexPunctRes.coachFindings.find(f => /He were/i.test(f.sentence ?? ''));
assert(errorFinding?.sentenceIndex === 3, `Sentence reference correctly maps to sentence 3 despite Dr., v2.5, and p.m. (got ${errorFinding?.sentenceIndex})`);

// Regression tests for applySafeGrammarFixes()
assert(applySafeGrammarFixes('The witness said, "They was standing there."') === 'The witness said, "They was standing there."', 'applySafeGrammarFixes does not alter dialogue inside quotes');
assert(applySafeGrammarFixes('She reviewed the article titled "These Results Was Preliminary".') === 'She reviewed the article titled "These Results Was Preliminary".', 'applySafeGrammarFixes does not alter title inside quotes');
assert(applySafeGrammarFixes("The manager who oversees these divisions was praised.") === "The manager who oversees these divisions was praised.", 'applySafeGrammarFixes preserves singular subject with relative clause object');
assert(applySafeGrammarFixes("The quality of these was verified.") === "The quality of these was verified.", 'applySafeGrammarFixes preserves singular subject with demonstrative prepositional object');
assert(applySafeGrammarFixes("The box of tools was heavy.") === "The box of tools was heavy.", 'applySafeGrammarFixes preserves singular subject with prepositional object "of tools"');
assert(applySafeGrammarFixes("The duration of those was documented.") === "The duration of those was documented.", 'applySafeGrammarFixes preserves singular subject with demonstrative "of those"');
assert(applySafeGrammarFixes("The impact of all these changes was significant.") === "The impact of all these changes was significant.", 'applySafeGrammarFixes preserves singular subject with "of all these changes"');
assert(applySafeGrammarFixes("The member of both committees was recognized.") === "The member of both committees was recognized.", 'applySafeGrammarFixes preserves singular subject with "of both committees"');
assert(applySafeGrammarFixes("In addition to this were three other factors.") === "In addition to this were three other factors.", 'applySafeGrammarFixes preserves inverted subject after prepositional "to this were"');
assert(applySafeGrammarFixes("The analytics has been verified.") === "The analytics has been verified.", 'applySafeGrammarFixes preserves singular analytics has been');
assert(applySafeGrammarFixes("The series was well received.") === "The series was well received.", 'applySafeGrammarFixes preserves singular series was');
assert(applySafeGrammarFixes("The headquarters was established in the capital.") === "The headquarters was established in the capital.", 'applySafeGrammarFixes preserves singular "headquarters was"');
assert(applySafeGrammarFixes("The economics was his primary field.") === "The economics was his primary field.", 'applySafeGrammarFixes preserves singular "economics was"');
assert(applySafeGrammarFixes("The physics was thoroughly explained.") === "The physics was thoroughly explained.", 'applySafeGrammarFixes preserves singular "physics was"');
assert(applySafeGrammarFixes("The press corps was briefed.") === "The press corps was briefed.", 'applySafeGrammarFixes preserves singular "press corps was"');
assert(applySafeGrammarFixes("If he were here, he would assist.") === "If he were here, he would assist.", 'applySafeGrammarFixes preserves subjunctive "If he were"');
assert(applySafeGrammarFixes("I wish it were simpler.") === "I wish it were simpler.", 'applySafeGrammarFixes preserves subjunctive "I wish it were"');
assert(applySafeGrammarFixes("As if that were possible.") === "As if that were possible.", 'applySafeGrammarFixes preserves subjunctive "As if that were"');
assert(applySafeGrammarFixes("Did he have any questions?") === "Did he have any questions?", 'applySafeGrammarFixes preserves auxiliary question "Did he have"');
assert(applySafeGrammarFixes("Does she have the key?") === "Does she have the key?", 'applySafeGrammarFixes preserves auxiliary question "Does she have"');
assert(applySafeGrammarFixes("Could that have been prevented?") === "Could that have been prevented?", 'applySafeGrammarFixes preserves auxiliary question "Could that have"');
assert(applySafeGrammarFixes("Did each member have a copy?") === "Did each member have a copy?", 'applySafeGrammarFixes preserves auxiliary question "Did each member have"');
assert(applySafeGrammarFixes("These results was unexpected.") === "These results were unexpected.", 'applySafeGrammarFixes corrects genuine error "These results was"');
assert(applySafeGrammarFixes("He were late.") === "He was late.", 'applySafeGrammarFixes corrects genuine error "He were"');

// Contractions and possessives must NOT be corrupted or masked as quotes
assert(applySafeGrammarFixes("It's the company's objective to complete the project.") === "It's the company's objective to complete the project.", 'Contractions and possessives are not treated as quotes');
assert(applySafeGrammarFixes("Don't worry, we'll see the user's feedback tomorrow.") === "Don't worry, we'll see the user's feedback tomorrow.", 'Multiple contractions in a sentence are fully preserved');

// Single-quoted dialogue and curly single quotes
assert(applySafeGrammarFixes("The witness said, 'They was standing there.'") === "The witness said, 'They was standing there.'", 'Single-quoted dialogue is preserved');
assert(applySafeGrammarFixes("The witness said, ‘They was standing there.’") === "The witness said, ‘They was standing there.’", 'Curly single-quoted dialogue is preserved');
assert(applySafeGrammarFixes("The witness said, 'They didn't know the answer.'") === "The witness said, 'They didn't know the answer.'", 'Single-quoted dialogue containing internal contraction is preserved');

// Nested quotes containing errors
assert(applySafeGrammarFixes(`The CEO remarked, "The manager said, 'They was late,' during the meeting."`) === `The CEO remarked, "The manager said, 'They was late,' during the meeting."`, 'Nested single quotes inside double quotes are preserved');

// Unmatched quotes must not crash or swallow text
assert(applySafeGrammarFixes("This is an unclosed 'quote that does not close.") === "This is an unclosed 'quote that does not close.", 'Unmatched single quote does not swallow sentence');
assert(applySafeGrammarFixes('The manager said, "We are launching tomorrow without closing quote.') === 'The manager said, "We are launching tomorrow without closing quote.', 'Unmatched double quote does not corrupt text');

// Quoted text containing grammar errors must NOT trigger agreement warnings
const quotedGrammarRes = analyzeText('The witness testified, "They was standing there and these results was preliminary."');
const quotedAgreementFinding = quotedGrammarRes.coachFindings.find(f => /agreement|mismatch/i.test(f.issue));
assert(!quotedAgreementFinding, 'Grammar errors inside direct quotes are NOT flagged as coach findings');

// Grammar errors OUTSIDE quoted dialogue must still be detected and fixed
const outsideQuoteText = 'The witness said, "We agree," but these results was rejected.';
const outsideQuoteRes = analyzeText(outsideQuoteText);
const outsideAgrFinding = outsideQuoteRes.coachFindings.find(f => /agreement|mismatch/i.test(f.issue));
assert(Boolean(outsideAgrFinding), 'Grammar error outside quoted dialogue IS detected');
assert(Boolean(outsideAgrFinding?.issue?.includes('these results')), 'Finding identifies subject outside quote');
assert(applySafeGrammarFixes(outsideQuoteText) === 'The witness said, "We agree," but these results were rejected.', 'applySafeGrammarFixes corrects error outside quote while preserving quotation');

// Contractions and possessives with standard grammar must not trigger agreement errors
const contractionGrammarText = "It's obvious that the company's team hasn't failed, and we'll ensure the user's satisfaction.";
const contractionGrammarRes = analyzeText(contractionGrammarText);
assert(!contractionGrammarRes.coachFindings.some(f => /agreement|mismatch/i.test(f.issue)), 'Sentence with contractions and possessives has NO false agreement finding');
assert(applySafeGrammarFixes(contractionGrammarText) === contractionGrammarText, 'applySafeGrammarFixes leaves valid sentence with contractions and possessives intact');

// Embedded clauses with plural nouns must NOT cause false agreement findings
const embeddedClauseSentences = [
  "The decision that the board members reached was final.",
  "The hypothesis that these findings suggest was verified.",
  "The box that contained these tools was misplaced.",
  "The report that these analysts prepared was accurate.",
  "The system that monitors these networks was upgraded."
];
for (const s of embeddedClauseSentences) {
  const r = analyzeText(s);
  const agr = r.coachFindings.find(f => /agreement|mismatch/i.test(f.issue));
  assert(!agr, `Embedded clause sentence "${s.slice(0, 35)}..." has NO false agreement finding`);
  assert(applySafeGrammarFixes(s) === s, `applySafeGrammarFixes preserves embedded clause "${s.slice(0, 35)}..."`);
}

// Auxiliary inversion questions must NOT be flagged or falsely fixed
const auxInversionSentences = [
  "Did he have any objections to the proposal?",
  "Does she have the file from the meeting?",
  "Could that have been avoided during deployment?",
  "Would this have worked in production?",
  "Did each member have sufficient time to review?",
  "Were these results verified by the auditors?"
];
for (const s of auxInversionSentences) {
  const r = analyzeText(s);
  const agr = r.coachFindings.find(f => /agreement|mismatch/i.test(f.issue));
  assert(!agr, `Auxiliary inversion question "${s.slice(0, 35)}..." has NO false agreement finding`);
  assert(applySafeGrammarFixes(s) === s, `applySafeGrammarFixes preserves auxiliary inversion "${s.slice(0, 35)}..."`);
}

// Coordinated subjects with plural verbs must NOT be flagged
const coordSubjectSentences = [
  "The manager and her team were acknowledged at the banquet.",
  "Both the system and the database were restored successfully.",
  "The director and the staff were present for the demonstration."
];
for (const s of coordSubjectSentences) {
  const r = analyzeText(s);
  const agr = r.coachFindings.find(f => /agreement|mismatch/i.test(f.issue));
  assert(!agr, `Coordinated subject sentence "${s.slice(0, 35)}..." has NO false agreement finding`);
  assert(applySafeGrammarFixes(s) === s, `applySafeGrammarFixes preserves coordinated subject "${s.slice(0, 35)}..."`);
}

// Collective nouns must NOT be falsely flagged
const collectiveNounSentences = [
  "The jury was sequestered until a verdict was reached.",
  "The executive committee has approved the strategic roadmap.",
  "The panel was divided in its assessment of the proposal.",
  "The faculty was supportive of the new curriculum.",
  "The class was dismissed early by the instructor."
];
for (const s of collectiveNounSentences) {
  const r = analyzeText(s);
  const agr = r.coachFindings.find(f => /agreement|mismatch/i.test(f.issue));
  assert(!agr, `Collective noun sentence "${s.slice(0, 35)}..." has NO false agreement finding`);
  assert(applySafeGrammarFixes(s) === s, `applySafeGrammarFixes preserves collective noun "${s.slice(0, 35)}..."`);
}

// Plural of collective noun with singular verb MUST still be detected as genuine error
assert(applySafeGrammarFixes("The classes was delayed.") === "The classes were delayed.", 'applySafeGrammarFixes corrects plural of collective noun "The classes was"');
const pluralCollRes = analyzeText("The classes was delayed.");
assert(pluralCollRes.coachFindings.some(f => /agreement|mismatch/i.test(f.issue)), 'Plural of collective noun "The classes was" triggers agreement finding');

// ============================================================
// 12. Passive Voice UX & Stylistic Observation Calibration (Issue 5)
// ============================================================
console.log('\n• Testing Suite 12: Passive Voice UX & Stylistic Observation Calibration...');

// Modal adverbs before past participle: "could be partially automated" should be excluded from passive errors
const modalPassiveText = "The operations team reported that several roles could be partially automated.";
const modalPassiveRes = analyzeText(modalPassiveText);
const modalCoachFinding = modalPassiveRes.coachFindings.find(f => f.category === 'Passive voice');
assert(!modalCoachFinding, 'Modal + adverb + participle "could be partially automated" is not flagged as high-confidence coach finding');

// Grammatical passive construction "had been reassigned" should be labeled as stylistic observation, NOT grammar error
const passiveSent = "In 2025, the internal workforce had been reassigned.";
const passiveRes = analyzeText(passiveSent);
const passiveAsGrammar = passiveRes.coachFindings.find(f => f.category === 'Grammar' && /reassigned/i.test(f.sentence ?? ''));
assert(!passiveAsGrammar, 'Passive construction "had been reassigned" is NOT classified as a grammar error');

// Passive candidate issue in sentence issues must have severity 'low' and stylistic description
const passiveIssue = passiveRes.issues.find(i => i.kind === 'Passive candidate');
if (passiveIssue) {
  assert(passiveIssue.severity === 'low', 'Passive candidate in sentence issues has severity "low"');
  assert(passiveIssue.detail.includes('Stylistic observation'), 'Passive candidate detail clarifies it is a stylistic observation');
}

// Actor safety: suggestActiveVoice must never invent an actor when no actor is mentioned
const agentlessPassive = "The report was published yesterday.";
const agentlessRes = analyzeText(agentlessPassive);
const agentlessFinding = agentlessRes.coachFindings.find(f => f.category === 'Passive voice');
assert(!agentlessFinding?.rewrite?.includes('team') && !agentlessFinding?.rewrite?.includes('manager'), 'Active rewrite does NOT invent fictitious actors like "team" or "manager"');

// ============================================================
// 13. Report Metrics Consistency & Readability Grade Boundaries
// ============================================================
console.log('\n• Testing Suite 13: Report Metrics Consistency & Readability Grade Boundaries...');

// 37 sentences totaling exactly 789 words of realistic technical prose:
// 25 sentences with 21 words each = 525 words
// 12 sentences with 22 words each = 264 words
// Total = 789 words, 37 sentences
const sent21 = "Advanced computational algorithms systematically evaluate heterogeneous biological frameworks across modern experimental research infrastructures to identify reproducible patterns throughout distributed clinical trials.";
const sent22 = "Comprehensive multi-institutional collaborations regularly establish innovative diagnostic procedures across complex epidemiological environments to monitor dynamic pharmaceutical responses while maintaining regulatory quality standards.";

const actual789Passage = [
  ...Array(25).fill(sent21),
  ...Array(12).fill(sent22)
].join(' ');

const r789 = analyzeText(actual789Passage, 0.05, 150);
assert(r789.words === 789, `Actual test input word count is exactly 789 (got ${r789.words})`);
assert(r789.sentences === 37, `Actual test input sentence count is exactly 37 (got ${r789.sentences})`);
assert(r789.syllables > 1500, `Actual test input syllables counted directly by analyzer (got ${r789.syllables})`);

// Independently recompute Flesch directly from the analyzer's actual counters (no hard-coded syllable values):
const independentRawFlesch789 = 206.835 - (1.015 * (r789.words / r789.sentences)) - (84.6 * (r789.syllables / r789.words));
const independentRounded789 = Math.max(0, Math.min(100, Math.round(independentRawFlesch789)));
assert(Math.abs(r789.fleschRaw! - independentRawFlesch789) < 1e-9, `Raw Flesch independently recomputed from analyzer counters matches formula (expected ${independentRawFlesch789}, got ${r789.fleschRaw})`);
assert(r789.flesch === independentRounded789, `Displayed Flesch matches independent formula rounding (got ${r789.flesch})`);
assert(r789.gradeLabel === 'Very Difficult', `789-word passage grade label is Very Difficult (got ${r789.gradeLabel})`);

// Estimated earnings arithmetic on actual 789 words at $0.05 per word:
assert(Math.abs(r789.estimatedEarnings - 39.45) < 0.001, `Estimated earnings for 789 words at $0.05 is exactly $39.45 (got ${r789.estimatedEarnings})`);

// Complete Flesch grade-label boundary verification against actual production mapping:
// Thresholds: >=90 (Very Easy), >=80 (Easy), >=70 (Fairly Easy), >=60 (Standard), >=50 (Fairly Difficult), >=30 (Difficult), <30 (Very Difficult)
const fleschBoundaries = [
  { score: null, expected: 'Not enough data' },
  { score: 100, expected: 'Very Easy' },
  { score: 90, expected: 'Very Easy' },
  { score: 89, expected: 'Easy' },
  { score: 80, expected: 'Easy' },
  { score: 79, expected: 'Fairly Easy' },
  { score: 70, expected: 'Fairly Easy' },
  { score: 69, expected: 'Standard' },
  { score: 60, expected: 'Standard' },
  { score: 59, expected: 'Fairly Difficult' },
  { score: 50, expected: 'Fairly Difficult' },
  { score: 49, expected: 'Difficult' },
  { score: 30, expected: 'Difficult' },
  { score: 29, expected: 'Very Difficult' },
  { score: 0, expected: 'Very Difficult' },
  { score: -15, expected: 'Very Difficult' }
];
for (const b of fleschBoundaries) {
  const lbl = gradeLabel(b.score);
  assert(lbl === b.expected, `Flesch score ${b.score} maps to "${b.expected}" (got "${lbl}")`);
}

// Vocabulary diversity definition: Type-Token Ratio (TTR) = unique / total * 100
const ttrText = "apple orange banana apple orange"; // 5 words, 3 unique: 3/5 = 60%
const ttrRes = analyzeText(ttrText);
assert(ttrRes.vocabularyDiversity === 60, `Vocabulary diversity for 3 unique / 5 total is 60% (got ${ttrRes.vocabularyDiversity})`);

// Lexical density definition: Content words / total words * 100
const lexText = "The apple is on the table."; // 6 words: "The", "is", "on", "the" are stopwords (4), "apple", "table" are content (2) -> 2/6 = 33.3%
const lexRes = analyzeText(lexText);
assert(lexRes.lexicalDensity === 33.3, `Lexical density for 2 content / 6 total words is 33.3% (got ${lexRes.lexicalDensity}%)`);

// Known short passage with independently derived counts (human verified):
// "The cat sat on the mat." -> words: 6, sentences: 1, syllables: 6
const shortPassage = "The cat sat on the mat.";
const shortRes = analyzeText(shortPassage);
assert(shortRes.words === 6, `Short passage has 6 words (got ${shortRes.words})`);
assert(shortRes.sentences === 1, `Short passage has 1 sentence (got ${shortRes.sentences})`);
assert(shortRes.syllables === 6, `Short passage has 6 syllables (got ${shortRes.syllables})`);
const expectedShortRawFlesch = 206.835 - (1.015 * (6 / 1)) - (84.6 * (6 / 6)); // 116.145
assert(Math.abs(shortRes.fleschRaw! - expectedShortRawFlesch) < 1e-9, `Short passage raw Flesch matches independent formula (expected ${expectedShortRawFlesch}, got ${shortRes.fleschRaw})`);
assert(shortRes.flesch === 100, `Short passage clamped Flesch is 100 (got ${shortRes.flesch})`);
assert(shortRes.gradeLabel === 'Very Easy', `Short passage grade label is Very Easy (got "${shortRes.gradeLabel}")`);

// Empty and whitespace-only inputs
const whitespaceRes = analyzeText("   \n\t  ");
assert(whitespaceRes.words === 0, 'Whitespace-only text has 0 words');
assert(whitespaceRes.sentences === 0, 'Whitespace-only text has 0 sentences');
assert(whitespaceRes.fleschRaw === null, 'Whitespace-only text has null raw Flesch');
assert(whitespaceRes.flesch === null, 'Whitespace-only text has null clamped Flesch');
assert(whitespaceRes.gradeLabel === 'Not enough data', 'Whitespace-only text maps to "Not enough data"');

// ============================================================
// 14. Long-Sentence Threshold (30 vs 38 words) & Clarity Penalty Verification
// ============================================================
console.log('\n• Testing Suite 14: Long-Sentence Threshold & Clarity Penalty Verification...');

function makeSentence(n: number): string {
  const words = [
    'The', 'experienced', 'software', 'engineering', 'team',
    'regularly', 'deploys', 'scalable', 'cloud', 'applications',
    'across', 'distributed', 'production', 'clusters', 'while',
    'maintaining', 'high', 'availability', 'robust', 'system',
    'security', 'seamless', 'data', 'integrity', 'rapid',
    'disaster', 'recovery', 'protocols', 'optimal', 'runtime',
    'efficiency', 'transparent', 'monitoring', 'dashboards', 'rigorous',
    'continuous', 'integration', 'automated', 'quality', 'gates'
  ];
  return words.slice(0, n).join(' ') + '.';
}

// 30 words: NOT a long sentence (threshold is strictly >30 words)
const sent30 = makeSentence(30);
const r30 = analyzeText(sent30);
assert(r30.words === 30, `Sentence has exactly 30 words (got ${r30.words})`);
assert(r30.longSentences.length === 0, `30 words is at or below threshold: 0 long sentences (got ${r30.longSentences.length})`);
assert(r30.clarityScore === 100, `30 words incurs no clarity penalty (got ${r30.clarityScore})`);

// 31 words: First value exceeding the 30-word threshold
const sent31 = makeSentence(31);
const r31 = analyzeText(sent31);
assert(r31.words === 31, `Sentence has exactly 31 words (got ${r31.words})`);
assert(r31.longSentences.length === 1, `31 words triggers long sentence detection (got ${r31.longSentences.length})`);
assert(r31.longSentences[0].words === 31, `Long sentence record identifies 31 words (got ${r31.longSentences[0].words})`);
assert(r31.clarityScore === 96, `31 words incurs 4-point clarity penalty (100 - 4 = 96, got ${r31.clarityScore})`);

// 38 words: Within the new >30 word long sentence bracket (would have been excluded under old 38-word threshold)
const sent38 = makeSentence(38);
const r38 = analyzeText(sent38);
assert(r38.words === 38, `Sentence has exactly 38 words (got ${r38.words})`);
assert(r38.longSentences.length === 1, `38 words is correctly detected as long sentence (>30) (got ${r38.longSentences.length})`);
assert(r38.longSentences[0].words === 38, `Long sentence record identifies 38 words (got ${r38.longSentences[0].words})`);
assert(r38.clarityScore === 96, `38 words incurs 4-point clarity penalty (got ${r38.clarityScore})`);

// 39 words: Exceeds both the new 30-word and previous 38-word threshold
const sent39 = makeSentence(39);
const r39 = analyzeText(sent39);
assert(r39.words === 39, `Sentence has exactly 39 words (got ${r39.words})`);
assert(r39.longSentences.length === 1, `39 words is detected as long sentence (got ${r39.longSentences.length})`);
assert(r39.longSentences[0].words === 39, `Long sentence record identifies 39 words (got ${r39.longSentences[0].words})`);
assert(r39.clarityScore === 96, `39 words incurs 4-point clarity penalty (got ${r39.clarityScore})`);

// Multiple long sentences compound the clarity penalty (up to cap of 20):
const twoLongSentences = `${makeSentence(32)} ${makeSentence(34)}`;
const rTwoLong = analyzeText(twoLongSentences);
assert(rTwoLong.longSentences.length === 2, `Two long sentences are both detected (got ${rTwoLong.longSentences.length})`);
assert(rTwoLong.clarityScore === 92, `Two long sentences incur 8-point clarity penalty (100 - 8 = 92, got ${rTwoLong.clarityScore})`);

// Writing score penalties and factor descriptions for long sentences:
const factor30 = r30.scoreFactors.find(f => /sentence length/i.test(f.text));
assert(Boolean(factor30 && factor30.type === 'positive'), 'At 30 words, writing score factor reports good sentence length distribution');
const factor31 = r31.scoreFactors.find(f => /long sentence/i.test(f.text));
assert(Boolean(factor31 && factor31.text.includes('>30 words')), 'At 31 words, writing score factor accurately references (>30 words)');
const factorTwoLong = rTwoLong.scoreFactors.find(f => /long sentence/i.test(f.text));
assert(Boolean(factorTwoLong && factorTwoLong.text.includes('2 long sentences')), 'With two long sentences, factor reports "2 long sentences (>30 words)"');

// Sentence splitting around abbreviations and decimals:
const abbrevText = "Dr. Smith announced v2.5 yesterday. At 4:00 p.m., the team launched.";
assert(sentencesOf(abbrevText).length === 2, 'Sentence splitter does not split on Dr., v2.5, or p.m.');


// ============================================================
// 15. Master Prompt Mandatory 21 Fixtures & Minimal Pairs
// ============================================================
console.log('\n• Testing Suite 15: Master Prompt 21 Mandatory Fixtures & Minimal Pairs...');

// 1. Correct: “In 2025, artificial intelligence systems continued to improve.”
const m1 = analyzeText('In 2025, artificial intelligence systems continued to improve.');
assert(!m1.coachFindings.some(f => f.category === 'Grammar' && /comma splice/i.test(f.issue)), 'Fixture 1: "In 2025, artificial intelligence systems continued to improve." has NO comma splice error');

// 2. Incorrect: “The system works well, the results are reliable.”
const m2 = analyzeText('The system works well, the results are reliable.');
const m2Finding = m2.coachFindings.find(f => /comma splice/i.test(f.issue));
assert(Boolean(m2Finding), 'Fixture 2: "The system works well, the results are reliable." triggers comma splice finding');
assert(Boolean(m2Finding?.replacement || m2Finding?.suggestion), 'Fixture 2 has valid replacement/suggestion for comma splice');

// 3. Correct: “Each department was reviewed.”
const m3 = analyzeText('Each department was reviewed.');
assert(!m3.coachFindings.some(f => f.category === 'Grammar' && /agreement/i.test(f.issue)), 'Fixture 3: "Each department was reviewed." has NO agreement finding');

// 4. Incorrect: “Each department were reviewed.”
const m4 = analyzeText('Each department were reviewed.');
const m4Finding = m4.coachFindings.find(f => f.category === 'Grammar' && /agreement/i.test(f.issue));
assert(Boolean(m4Finding), 'Fixture 4: "Each department were reviewed." triggers agreement finding');
assert(m4Finding?.replacement === 'was', 'Fixture 4 suggests "was"');

// 5. Correct: “The series contains useful examples.”
const m5 = analyzeText('The series contains useful examples.');
assert(!m5.coachFindings.some(f => f.category === 'Grammar' && /agreement/i.test(f.issue)), 'Fixture 5: "The series contains useful examples." has NO agreement finding');

// 6. Incorrect: “The list of items are missing.”
const m6 = analyzeText('The list of items are missing.');
const m6Finding = m6.coachFindings.find(f => f.category === 'Grammar' && /agreement/i.test(f.issue));
assert(Boolean(m6Finding), 'Fixture 6: "The list of items are missing." triggers agreement finding');
assert(m6Finding?.replacement === 'is', 'Fixture 6 suggests "is"');

// 7. Correct: “The analysts were reviewing the reports.”
const m7 = analyzeText('The analysts were reviewing the reports.');
assert(!m7.coachFindings.some(f => f.category === 'Grammar' && /agreement/i.test(f.issue)), 'Fixture 7: "The analysts were reviewing the reports." has NO agreement finding');

// 8. Correct: “The project would take six years, assuming annual savings remain constant.”
const m8 = analyzeText('The project would take six years, assuming annual savings remain constant.');
assert(!m8.coachFindings.some(f => f.category === 'Grammar' && /comma splice/i.test(f.issue)), 'Fixture 8: Participial clause with "assuming" has NO comma splice error');

// 9. Correct: “The project was expensive; however, it was effective.”
const m9 = analyzeText('The project was expensive; however, it was effective.');
assert(!m9.coachFindings.some(f => f.category === 'Grammar' || f.category === 'Punctuation'), 'Fixture 9: Semicolon with transitional adverb has NO punctuation or grammar error');

// 10. Correct: “The system's performance improved after the update.”
const m10 = analyzeText("The system's performance improved after the update.");
assert(!m10.coachFindings.some(f => f.category === 'Grammar'), 'Fixture 10: Possessive apostrophe has NO grammar finding');

// 11. Correct: “They haven't finished the analysis.”
const m11 = analyzeText("They haven't finished the analysis.");
assert(!m11.coachFindings.some(f => f.category === 'Grammar' || f.category === 'Spelling'), 'Fixture 11: Contraction "haven\'t" has NO false grammar or spelling finding');

// 12. Dialect sensitivity: “The data are incomplete.” and “The data is incomplete.”
const m12a = analyzeText('The data are incomplete.');
const m12b = analyzeText('The data is incomplete.');
assert(!m12a.coachFindings.some(f => f.category === 'Grammar' && /agreement/i.test(f.issue)), 'Fixture 12a: "The data are incomplete." is accepted');
assert(!m12b.coachFindings.some(f => f.category === 'Grammar' && /agreement/i.test(f.issue)), 'Fixture 12b: "The data is incomplete." is accepted');

// 13. Incorrect: “The recommendations was accepted.”
const m13 = analyzeText('The recommendations was accepted.');
const m13Finding = m13.coachFindings.find(f => f.category === 'Grammar' && /agreement/i.test(f.issue));
assert(Boolean(m13Finding), 'Fixture 13: "The recommendations was accepted." triggers agreement finding');
assert(m13Finding?.replacement === 'were', 'Fixture 13 suggests "were"');

// 14. Correct: “The recommendations were accepted.”
const m14 = analyzeText('The recommendations were accepted.');
assert(!m14.coachFindings.some(f => f.category === 'Grammar' && /agreement/i.test(f.issue)), 'Fixture 14: "The recommendations were accepted." has NO agreement finding');

// 15. Correct: Complex sentence with relative plural that:
const m15 = analyzeText('The software is functioning as designed; the problem is that its design reflects limitations in the data and assumptions that were never adequately challenged.');
assert(!m15.coachFindings.some(f => f.category === 'Grammar' && /agreement/i.test(f.issue)), 'Fixture 15: Relative plural "assumptions that were" has NO false agreement finding');

// 16. Correct: “The challenge, therefore, is to build reliable systems.”
const m16 = analyzeText('The challenge, therefore, is to build reliable systems.');
assert(!m16.coachFindings.some(f => f.category === 'Grammar' || f.category === 'Punctuation'), 'Fixture 16: Parenthetical "therefore" has NO punctuation or agreement finding');

// 17. Correct: “Neither the manager nor the analysts were available.”
const m17 = analyzeText('Neither the manager nor the analysts were available.');
assert(!m17.coachFindings.some(f => f.category === 'Grammar' && /agreement/i.test(f.issue)), 'Fixture 17: Nearest-subject agreement with plural analysts is respected');

// 18. Correct: “The report was reviewed by the team.”
const m18 = analyzeText('The report was reviewed by the team.');
assert(!m18.coachFindings.some(f => f.category === 'Grammar'), 'Fixture 18: Passive voice is NOT marked as a high-confidence grammar error');

// 19. Dialogue mode behavior on deliberate error inside quotes:
const m19Text = '"He don\'t know the answer," she said.';
const m19Normal = analyzeText(m19Text, 0, 150, { dialogueMode: 'normal' });
const m19Analyze = analyzeText(m19Text, 0, 150, { dialogueMode: 'analyze-dialogue' });
assert(!m19Normal.coachFindings.some(f => /don't/i.test(f.originalText || '') || /don't/i.test(f.issue)), 'Fixture 19 (Normal mode): Deliberate error inside quotes is protected');
assert(m19Analyze.coachFindings.some(f => /don't/i.test(f.originalText || '') || /don't/i.test(f.issue)), 'Fixture 19 (Analyze Dialogue mode): Error inside quotes is detected');

// 20. Narration error immediately adjoining quotes:
const m20 = analyzeText('"We are ready," the manager were saying.');
assert(m20.coachFindings.some(f => f.category === 'Grammar' && /agreement/i.test(f.issue)), 'Fixture 20: Narration agreement error "the manager were saying" is detected even with quotes');

// 21. Automatic fix application:
const m21Fix = applySafeGrammarFixes('The recommendations was accepted.');
assert(m21Fix.includes('The recommendations were accepted.'), 'Fixture 21: Safe fix corrects "was accepted" to "were accepted"');

// ============================================================
// 16. Additional Linguistic Rule Families
// ============================================================
console.log('\n• Testing Suite 16: Additional Linguistic Rule Families...');

// Modal verbs
const modalErr = analyzeText('We could of planned this better.');
const modalF = modalErr.coachFindings.find(f => f.ruleId === 'VERB_MODAL_OF');
assert(Boolean(modalF), 'Modal error "could of" is detected');
assert(modalF?.replacement === 'have', 'Modal error suggests "have"');

// Bare infinitives after modals
const modalBare = analyzeText('They must to finish the audit.');
const modalBareF = modalBare.coachFindings.find(f => f.ruleId === 'VERB_MODAL_BARE_INFINITIVE');
assert(Boolean(modalBareF), 'Modal bare infinitive "must to finish" is detected');
assert(modalBareF?.replacement === 'finish', 'Modal bare infinitive suggests "finish"');

// Pronoun case in prepositional complement
const pronounErr = analyzeText('Between you and I, the decision is final.');
const pronounF = pronounErr.coachFindings.find(f => f.ruleId === 'PRONOUN_OBJECTIVE_CASE_PREPOSITION');
assert(Boolean(pronounF), 'Pronoun case "between you and I" is detected');
assert(pronounF?.replacement === 'me', 'Pronoun case suggests "me"');

// Irregular past participles
const partErr = analyzeText('The team had went to the conference.');
const partF = partErr.coachFindings.find(f => f.ruleId === 'VERB_PAST_PARTICIPLE_MISMATCH');
assert(Boolean(partF), 'Irregular participle "had went" is detected');
assert(partF?.replacement === 'gone', 'Irregular participle suggests "gone"');

// Phonetic a/an
const aAnErr1 = analyzeText('He attended an university in London.');
const aAnF1 = aAnErr1.coachFindings.find(f => f.ruleId === 'ARTICLE_AN_BEFORE_CONSONANT_SOUND');
assert(Boolean(aAnF1), 'Phonetic article "an university" is detected');
assert(aAnF1?.replacement === 'a', 'Phonetic article suggests "a"');

const aAnErr2 = analyzeText('It was a honest mistake.');
const aAnF2 = aAnErr2.coachFindings.find(f => f.ruleId === 'ARTICLE_A_BEFORE_VOWEL_SOUND');
assert(Boolean(aAnF2), 'Phonetic article "a honest" is detected');
assert(aAnF2?.replacement === 'an', 'Phonetic article suggests "an"');

// Commonly confused words
const confErr = analyzeText('Take care not to loose the keys.');
const confF = confErr.coachFindings.find(f => f.ruleId === 'WORD_CHOICE_LOSE_NOT_LOOSE');
assert(Boolean(confF), 'Confused word "loose the keys" is detected');
assert(confF?.replacement === 'lose', 'Confused word suggests "lose"');

// ============================================================
// 17. Source Span Accuracy & Character Offset Precision
// ============================================================
console.log('\n• Testing Suite 17: Source Span Accuracy & Character Offset Precision...');

const spanDoc = 'First, each department were reviewed. Then, the list of items are missing from inventory.';
const spanResults = runGrammarEngine(spanDoc).findings;
assert(spanResults.length >= 2, `Engine found multiple issues for span verification (found ${spanResults.length})`);

for (const finding of spanResults) {
  const actualSlice = spanDoc.slice(finding.start, finding.end);
  assert(
    actualSlice === finding.originalText,
    `Exact slice matches finding.originalText at [${finding.start}, ${finding.end}]: "${actualSlice}" === "${finding.originalText}"`
  );
}

// ============================================================
// 18. 1-Click Correction & Deduplication Integrity
// ============================================================
console.log('\n• Testing Suite 18: 1-Click Correction & Deduplication Integrity...');

const originalSentence = 'The list of items are missing from the report.';
const targetFindings = runGrammarEngine(originalSentence).findings;
const targetF = targetFindings.find(f => f.ruleId === 'AGREEMENT_HEAD_NOUN_PREPOSITIONAL_PHRASE');
assert(Boolean(targetF), 'Target finding exists for 1-click correction test');

if (targetF) {
  const corrected = applyFindingCorrection(originalSentence, targetF);
  assert(corrected === 'The list of items is missing from the report.', `applyFindingCorrection produces exact correction: "${corrected}"`);
  assert(!corrected.includes('are'), 'Replaced text does not contain old verb');
}

// Deduplication: ensure no overlapping finding spans
const dupDoc = 'The list of items are missing. The team had went home.';
const dupFindings = runGrammarEngine(dupDoc).findings;
let hasOverlap = false;
for (let i = 0; i < dupFindings.length; i++) {
  for (let j = i + 1; j < dupFindings.length; j++) {
    const a = dupFindings[i];
    const b = dupFindings[j];
    if (Math.max(a.start, b.start) < Math.min(a.end, b.end)) {
      hasOverlap = true;
    }
  }
}
assert(!hasOverlap, 'Deduplication guarantees zero overlapping finding spans in engine output');

// applyAllSafeFixes verification
const safeMulti = applyAllSafeFixes('Each department were reviewed. The list of items are missing.');
assert(safeMulti === 'Each department was reviewed. The list of items is missing.', 'applyAllSafeFixes corrects multiple issues cleanly in reverse offset order');

// ============================================================
// 19. Labeled Golden Corpus Precision & Recall Benchmark
// ============================================================
console.log('\n• Testing Suite 19: Labeled Golden Corpus Precision & Recall Benchmark...');

type CorpusItem = { text: string; hasError: boolean; label: string };

const goldenCorpus: CorpusItem[] = [
  // Genuine Error Sentences (Positive Cases)
  { text: 'Each department were reviewed thoroughly.', hasError: true, label: 'Indefinite pronoun agreement (were -> was)' },
  { text: 'The list of items are missing from the audit.', hasError: true, label: 'Intervening prep agreement (are -> is)' },
  { text: 'The recommendations was accepted by leadership.', hasError: true, label: 'Plural subject agreement (was -> were)' },
  { text: 'The system works well, the results are reliable.', hasError: true, label: 'Comma splice' },
  { text: 'We could of planned the deployment better.', hasError: true, label: 'Modal auxiliary (could of -> could have)' },
  { text: 'You should of informed the supervisor.', hasError: true, label: 'Modal auxiliary (should of -> should have)' },
  { text: 'They must to update the records promptly.', hasError: true, label: 'Modal bare infinitive' },
  { text: 'Between you and I, this plan will succeed.', hasError: true, label: 'Pronoun case' },
  { text: 'The engineer had went to the client site.', hasError: true, label: 'Irregular participle (had went -> had gone)' },
  { text: 'She has saw this error code before.', hasError: true, label: 'Irregular participle (has saw -> has seen)' },
  { text: 'The company built an university partnership.', hasError: true, label: 'Phonetic article (an university -> a university)' },
  { text: 'It was a honest mistake during data entry.', hasError: true, label: 'Phonetic article (a honest -> an honest)' },
  { text: 'Make sure not to loose your badge.', hasError: true, label: 'Confused word (loose -> lose)' },
  { text: 'Neither the manager nor the supervisor were present.', hasError: true, label: 'Neither/nor singular agreement' },
  { text: 'Every student and teacher were invited.', hasError: true, label: 'Quantifier every agreement' },
  { text: 'A series of tests was conducted, the findings was unexpected.', hasError: true, label: 'Plural findings was' },
  { text: 'She would of delivered the package yesterday.', hasError: true, label: 'Modal auxiliary (would of -> would have)' },
  { text: 'Between him and I, there are no secrets.', hasError: true, label: 'Pronoun case complement' },
  { text: 'The team has went through three iterations.', hasError: true, label: 'Participle error' },
  { text: 'They should of known the requirements.', hasError: true, label: 'Modal auxiliary' },

  // Clean Sentences / Negative Controls
  { text: 'In 2025, artificial intelligence systems continued to improve.', hasError: false, label: 'Introductory prepositional phrase' },
  { text: 'The project was expensive; however, it was effective.', hasError: false, label: 'Semicolon with conjunctive adverb' },
  { text: 'The series contains useful examples for our engineers.', hasError: false, label: 'Singular noun ending in -s' },
  { text: 'The analysts were reviewing the quarterly reports.', hasError: false, label: 'Plural subject with were' },
  { text: 'The project would take six years, assuming annual savings remain constant.', hasError: false, label: 'Participial clause with assuming' },
  { text: "The system's performance improved after the update.", hasError: false, label: 'Possessive apostrophe' },
  { text: "They haven't finished the comprehensive analysis yet.", hasError: false, label: 'Contraction haven\'t' },
  { text: 'The data are incomplete for the final quarter.', hasError: false, label: 'Dialect plural data' },
  { text: 'The data is incomplete for the final quarter.', hasError: false, label: 'Dialect singular data' },
  { text: 'The challenge, therefore, is to build reliable systems.', hasError: false, label: 'Parenthetical therefore' },
  { text: 'Neither the manager nor the analysts were available.', hasError: false, label: 'Nearest subject plural agreement' },
  { text: 'The report was reviewed by the compliance team.', hasError: false, label: 'Passive voice valid sentence' },
  { text: 'The software is functioning as designed; the problem is that its design reflects limitations.', hasError: false, label: 'Compound complex with semicolon' },
  { text: 'Assumptions that were never adequately challenged led to the delay.', hasError: false, label: 'Relative plural assumptions that were' },
  { text: 'Both the system and the database were restored successfully.', hasError: false, label: 'Compound subject with both' },
  { text: 'The jury was sequestered until a verdict was reached.', hasError: false, label: 'Collective noun singular' },
  { text: 'The executive committee has approved the proposed budget.', hasError: false, label: 'Collective noun committee has' },
  { text: 'Did each member have sufficient time to review the proposal?', hasError: false, label: 'Auxiliary question did... have' },
  { text: 'Clear writing shares ideas simply, directly, and with good rhythm.', hasError: false, label: 'Sample text opening' },
  { text: 'By tracking word count and sentence structure, you can polish drafts with confidence.', hasError: false, label: 'Sample text closing' }
];

let tp = 0;
let fp = 0;
let tn = 0;
let fn = 0;

for (const item of goldenCorpus) {
  const findings = runGrammarEngine(item.text).findings;
  const detected = findings.length > 0;

  if (item.hasError && detected) {
    tp++;
  } else if (!item.hasError && detected) {
    fp++;
    console.warn(`    ⚠️ FALSE POSITIVE on: "${item.text}" (${findings.map(f => f.ruleId).join(', ')})`);
  } else if (!item.hasError && !detected) {
    tn++;
  } else if (item.hasError && !detected) {
    fn++;
    console.warn(`    ⚠️ FALSE NEGATIVE on: "${item.text}" (${item.label})`);
  }
}

const precision = tp / (tp + fp);
const recall = tp / (tp + fn);
const f1 = (2 * precision * recall) / (precision + recall);

console.log(`\n  📊 GOLDEN CORPUS BENCHMARK RESULTS (N = ${goldenCorpus.length}):`);
console.log(`     True Positives (TP):  ${tp} / 20`);
console.log(`     True Negatives (TN):  ${tn} / 20`);
console.log(`     False Positives (FP): ${fp} / 20`);
console.log(`     False Negatives (FN): ${fn} / 20`);
console.log(`     Precision:            ${(precision * 100).toFixed(1)}%`);
console.log(`     Recall:               ${(recall * 100).toFixed(1)}%`);
console.log(`     F1-Score:             ${(f1 * 100).toFixed(1)}%`);

assert(fp === 0, `Zero false positives on clean control corpus (FP = ${fp})`);
assert(fn === 0, `Zero false negatives on error corpus (FN = ${fn})`);
assert(precision === 1.0, `Precision is 100% on golden corpus (got ${(precision * 100).toFixed(1)}%)`);
assert(recall === 1.0, `Recall is 100% on golden corpus (got ${(recall * 100).toFixed(1)}%)`);



// ============================================================
// 20. Held-Out Corpus & Per-Rule-Family Precision / Recall Evaluation
// ============================================================
console.log('\n• Testing Suite 20: Held-Out Corpus & Per-Rule-Family Precision / Recall Evaluation...');

interface HeldOutTestCase {
  family: 'AGREEMENT' | 'VERB_FORM' | 'ARTICLE' | 'PRONOUN' | 'CONFUSED_WORD' | 'PUNCTUATION_SPLICE' | 'TYPO_SPELLING' | 'STYLE_CLARITY';
  text: string;
  hasError: boolean;
  expectedRule?: string;
  expectedReplacement?: string;
  description: string;
}

const heldOutCases: HeldOutTestCase[] = [
  // --- AGREEMENT ---
  {
    family: 'AGREEMENT',
    text: 'Everyone were delighted with the announcement.',
    hasError: true,
    expectedRule: 'AGREEMENT_SINGULAR_PRONOUN_PLURAL_VERB',
    expectedReplacement: 'was',
    description: 'Indefinite pronoun everyone with plural verb were'
  },
  {
    family: 'AGREEMENT',
    text: 'Everyone was delighted with the announcement.',
    hasError: false,
    description: 'Control: Indefinite pronoun everyone with was'
  },
  {
    family: 'AGREEMENT',
    text: 'The quality of these materials are exceptional.',
    hasError: true,
    expectedRule: 'AGREEMENT_HEAD_NOUN_PREPOSITIONAL_PHRASE',
    expectedReplacement: 'is',
    description: 'Head noun quality with intervening prep phrase'
  },
  {
    family: 'AGREEMENT',
    text: 'The quality of these materials is exceptional.',
    hasError: false,
    description: 'Control: Head noun quality with is'
  },
  {
    family: 'AGREEMENT',
    text: 'The box of old tools were misplaced yesterday.',
    hasError: true,
    expectedRule: 'AGREEMENT_HEAD_NOUN_PREPOSITIONAL_PHRASE',
    expectedReplacement: 'was',
    description: 'Head noun box with intervening prep phrase'
  },
  {
    family: 'AGREEMENT',
    text: 'The boxes of old tools were misplaced yesterday.',
    hasError: false,
    description: 'Control: Plural head noun boxes with were'
  },
  {
    family: 'AGREEMENT',
    text: 'Someone have left their notebook in the conference room.',
    hasError: true,
    expectedRule: 'AGREEMENT_SINGULAR_PRONOUN_PLURAL_VERB',
    expectedReplacement: 'has',
    description: 'Indefinite pronoun someone with have'
  },
  {
    family: 'AGREEMENT',
    text: 'Someone has left their notebook in the conference room.',
    hasError: false,
    description: 'Control: Indefinite pronoun someone with has'
  },
  {
    family: 'AGREEMENT',
    text: 'The criteria were established before the project began.',
    hasError: false,
    description: 'Control: Irregular plural criteria with were'
  },
  {
    family: 'AGREEMENT',
    text: 'The committee has finalized the schedule.',
    hasError: false,
    description: 'Control: Collective noun committee with has'
  },

  // --- VERB_FORM ---
  {
    family: 'VERB_FORM',
    text: 'The architect could of prevented the structural flaw.',
    hasError: true,
    expectedRule: 'VERB_MODAL_OF',
    expectedReplacement: 'have',
    description: 'Modal auxiliary could of -> could have'
  },
  {
    family: 'VERB_FORM',
    text: 'The architect could have prevented the structural flaw.',
    hasError: false,
    description: 'Control: Modal auxiliary could have'
  },
  {
    family: 'VERB_FORM',
    text: 'The witness had saw the vehicle speeding away.',
    hasError: true,
    expectedRule: 'VERB_PAST_PARTICIPLE_MISMATCH',
    expectedReplacement: 'seen',
    description: 'Past participle mismatch: had saw -> had seen'
  },
  {
    family: 'VERB_FORM',
    text: 'The witness had seen the vehicle speeding away.',
    hasError: false,
    description: 'Control: Valid past participle had seen'
  },
  {
    family: 'VERB_FORM',
    text: 'The contractor must to complete the inspection today.',
    hasError: true,
    expectedRule: 'VERB_MODAL_BARE_INFINITIVE',
    expectedReplacement: 'complete',
    description: 'Modal with infinitive to complete -> complete'
  },
  {
    family: 'VERB_FORM',
    text: 'The contractor must complete the inspection today.',
    hasError: false,
    description: 'Control: Modal with bare infinitive must complete'
  },

  // --- ARTICLE ---
  {
    family: 'ARTICLE',
    text: 'We arrived a hour before the keynote presentation.',
    hasError: true,
    expectedRule: 'ARTICLE_A_BEFORE_VOWEL_SOUND',
    expectedReplacement: 'an',
    description: 'Article a before silent h vowel sound hour'
  },
  {
    family: 'ARTICLE',
    text: 'We arrived an hour before the keynote presentation.',
    hasError: false,
    description: 'Control: Article an before hour'
  },
  {
    family: 'ARTICLE',
    text: 'The university offers a unique curriculum in robotics.',
    hasError: false,
    description: 'Control: Article a before unique (/j/ glide)'
  },
  {
    family: 'ARTICLE',
    text: 'The delegation signed an European accord on carbon emissions.',
    hasError: true,
    expectedRule: 'ARTICLE_AN_BEFORE_CONSONANT_SOUND',
    expectedReplacement: 'a',
    description: 'Article an before consonant glide European'
  },

  // --- PRONOUN ---
  {
    family: 'PRONOUN',
    text: 'The confidential report was shared between you and I.',
    hasError: true,
    expectedRule: 'PRONOUN_OBJECTIVE_CASE_PREPOSITION',
    expectedReplacement: 'me',
    description: 'Prepositional object pronoun between you and I'
  },
  {
    family: 'PRONOUN',
    text: 'The confidential report was shared between you and me.',
    hasError: false,
    description: 'Control: Prepositional object pronoun between you and me'
  },
  {
    family: 'PRONOUN',
    text: 'Him and I conducted the initial survey.',
    hasError: true,
    expectedRule: 'PRONOUN_SUBJECTIVE_CASE_COORDINATION',
    expectedReplacement: 'He and I',
    description: 'Objective pronoun Him as coordinate subject'
  },
  {
    family: 'PRONOUN',
    text: 'He and I conducted the initial survey.',
    hasError: false,
    description: 'Control: Coordinate subjective pronoun He and I'
  },

  // --- CONFUSED_WORD ---
  {
    family: 'CONFUSED_WORD',
    text: 'The database cluster lost its primary replica.',
    hasError: false,
    description: 'Control: Possessive pronoun its'
  },
  {
    family: 'CONFUSED_WORD',
    text: 'Its essential to verify checksums after migration.',
    hasError: true,
    expectedRule: 'HOMOPHONE_ITS_CONTRACTION',
    expectedReplacement: "It's",
    description: 'Possessive its where contraction It\'s is required'
  },
  {
    family: 'CONFUSED_WORD',
    text: 'The new algorithm executes much faster then the legacy service.',
    hasError: true,
    expectedRule: 'WORD_CHOICE_THAN_COMPARISON',
    expectedReplacement: 'than',
    description: 'Comparative adverb then -> than'
  },
  {
    family: 'CONFUSED_WORD',
    text: 'The new algorithm executes much faster than the legacy service.',
    hasError: false,
    description: 'Control: Comparative adverb than'
  },
  {
    family: 'CONFUSED_WORD',
    text: 'Be careful not to loose access to your backup keys.',
    hasError: true,
    expectedRule: 'WORD_CHOICE_LOSE_NOT_LOOSE',
    expectedReplacement: 'lose',
    description: 'Confused adjective loose where verb lose is required'
  },
  {
    family: 'CONFUSED_WORD',
    text: 'Be careful not to lose access to your backup keys.',
    hasError: false,
    description: 'Control: Verb lose'
  },

  // --- PUNCTUATION_SPLICE ---
  {
    family: 'PUNCTUATION_SPLICE',
    text: 'The telemetry looks stable, the deployment was successful.',
    hasError: true,
    expectedRule: 'SENTENCE_COMMA_SPLICE',
    expectedReplacement: ';',
    description: 'Comma splice joining two independent clauses'
  },
  {
    family: 'PUNCTUATION_SPLICE',
    text: 'The telemetry looks stable; the deployment was successful.',
    hasError: false,
    description: 'Control: Semicolon joining two independent clauses'
  },
  {
    family: 'PUNCTUATION_SPLICE',
    text: 'Because the telemetry looks stable, the deployment was successful.',
    hasError: false,
    description: 'Control: Subordinate dependent clause with comma'
  },
  {
    family: 'PUNCTUATION_SPLICE',
    text: 'The team completed the upgrade, provided that testing continues tomorrow.',
    hasError: false,
    description: 'Control: Conditional clause with provided that'
  },

  // --- TYPO_SPELLING ---
  {
    family: 'TYPO_SPELLING',
    text: 'We must recieve approval from the security team.',
    hasError: true,
    expectedRule: 'SPELL_COMMON_TYPO',
    expectedReplacement: 'receive',
    description: 'Common typo recieve -> receive'
  },
  {
    family: 'TYPO_SPELLING',
    text: 'We must receive approval from the security team.',
    hasError: false,
    description: 'Control: Correct spelling receive'
  },
  {
    family: 'TYPO_SPELLING',
    text: 'The microservices operate on a seperate cluster.',
    hasError: true,
    expectedRule: 'SPELL_COMMON_TYPO',
    expectedReplacement: 'separate',
    description: 'Common typo seperate -> separate'
  },
  {
    family: 'TYPO_SPELLING',
    text: 'The microservices operate on a separate cluster.',
    hasError: false,
    description: 'Control: Correct spelling separate'
  },

  // --- STYLE_CLARITY ---
  {
    family: 'STYLE_CLARITY',
    text: 'We scheduled a meeting in order to resolve the blocker.',
    hasError: true,
    expectedRule: 'CLARITY_CONCISE_WORDING',
    expectedReplacement: 'to',
    description: 'Wordy phrase in order to -> to'
  },
  {
    family: 'STYLE_CLARITY',
    text: 'We scheduled a meeting to resolve the blocker.',
    hasError: false,
    description: 'Control: Concise phrasing with to'
  }
];

let heldOutTP = 0;
let heldOutFP = 0;
let heldOutTN = 0;
let heldOutFN = 0;
const familyMetrics: Record<string, { tp: number; fp: number; tn: number; fn: number }> = {};

for (const c of heldOutCases) {
  if (!familyMetrics[c.family]) {
    familyMetrics[c.family] = { tp: 0, fp: 0, tn: 0, fn: 0 };
  }
  const res = runGrammarEngine(c.text);
  const detected = res.findings.length > 0;
  const fStats = familyMetrics[c.family];

  if (c.hasError && detected) {
    heldOutTP++;
    fStats.tp++;
    if (c.expectedReplacement) {
      const matchFound = res.findings.some(f => f.replacement === c.expectedReplacement || f.ruleId === c.expectedRule);
      assert(matchFound, `Held-out case replacement verified for: "${c.text}" (expected "${c.expectedReplacement}")`);
    }
  } else if (!c.hasError && detected) {
    heldOutFP++;
    fStats.fp++;
    assert(false, `Unexpected false positive in held-out corpus on: "${c.text}" (rules: ${res.findings.map(f => f.ruleId).join(', ')})`);
  } else if (!c.hasError && !detected) {
    heldOutTN++;
    fStats.tn++;
  } else if (c.hasError && !detected) {
    heldOutFN++;
    fStats.fn++;
    assert(false, `Unexpected false negative in held-out corpus on: "${c.text}" (${c.description})`);
  }
}

console.log(`\n  📊 HELD-OUT PER-RULE-FAMILY BENCHMARK (N = ${heldOutCases.length}):`);
for (const [fam, s] of Object.entries(familyMetrics)) {
  const p = s.tp + s.fp > 0 ? (s.tp / (s.tp + s.fp)) * 100 : 100;
  const r = s.tp + s.fn > 0 ? (s.tp / (s.tp + s.fn)) * 100 : 100;
  const f1 = p + r > 0 ? (2 * p * r) / (p + r) : 0;
  console.log(`     ${fam.padEnd(20)} | TP: ${s.tp} | FP: ${s.fp} | TN: ${s.tn} | FN: ${s.fn} | P: ${p.toFixed(1)}% | R: ${r.toFixed(1)}% | F1: ${f1.toFixed(1)}%`);
}

const hoPrecision = heldOutTP / (heldOutTP + heldOutFP);
const hoRecall = heldOutTP / (heldOutTP + heldOutFN);
const hoF1 = (2 * hoPrecision * hoRecall) / (hoPrecision + hoRecall);

console.log(`     Held-Out TP: ${heldOutTP} | FP: ${heldOutFP} | TN: ${heldOutTN} | FN: ${heldOutFN}`);
console.log(`     Overall Held-Out Precision: ${(hoPrecision * 100).toFixed(1)}%`);
console.log(`     Overall Held-Out Recall:    ${(hoRecall * 100).toFixed(1)}%`);
console.log(`     Overall Held-Out F1:        ${(hoF1 * 100).toFixed(1)}%`);

assert(heldOutTN > 0, `Held-out true negatives verified (TN = ${heldOutTN})`);
assert(heldOutFP === 0, `Zero false positives on held-out control corpus (FP = ${heldOutFP})`);
assert(heldOutFN === 0, `Zero false negatives on held-out error corpus (FN = ${heldOutFN})`);
assert(hoPrecision === 1.0, `Held-out precision is 100% (got ${(hoPrecision * 100).toFixed(1)}%)`);
assert(hoRecall === 1.0, `Held-out recall is 100% (got ${(hoRecall * 100).toFixed(1)}%)`);

// Multi-Error Complex Paragraph Verification
const complexDoc = 
  'The quality of these materials are exceptional, but we arrived a hour before the keynote. ' +
  'Everyone were delighted with the announcement; however, the architect could of prevented the defect. ' +
  'Between you and I, its essential to verify checksums before we loose access to the logs.';

const complexRes = runGrammarEngine(complexDoc);
assert(complexRes.findings.length === 7, `Complex paragraph yields exactly 7 findings (got ${complexRes.findings.length})`);

for (const f of complexRes.findings) {
  const actualSlice = complexDoc.slice(f.start, f.end);
  assert(actualSlice === f.originalText, `Span matches exactly at [${f.start}, ${f.end}]: "${actualSlice}" === "${f.originalText}"`);
}

const fixedDoc = applyAllSafeFixes(complexDoc);
const expectedFixedDoc = 
  'The quality of these materials is exceptional, but we arrived an hour before the keynote. ' +
  'Everyone was delighted with the announcement; however, the architect could have prevented the defect. ' +
  'Between you and me, it\'s essential to verify checksums before we lose access to the logs.';

assert(fixedDoc === expectedFixedDoc, 'Complex multi-error document repaired with 100% character offset fidelity');

// ============================================================
// 21. Critical False-Positive & False-Negative Linguistic Regression Suite
// ============================================================
console.log('\n• Testing Suite 21: Critical False-Positive & False-Negative Linguistic Regression Suite...');

// 21.1 Confirmed False Positives (Must NEVER receive comma splice findings)
const confirmedFPList = [
  {
    id: 'FP1',
    text: 'However, automated systems may encounter names, abbreviations, dialectal pronunciations, and specialist terminology for which the correct article depends on how the expression is actually spoken.',
    desc: 'Serial object enumeration with terminal relative clause'
  },
  {
    id: 'FP2',
    text: 'The presence of an unfamiliar word does not, by itself, prove that the surrounding sentence contains a grammatical error.',
    desc: 'Parenthetical adverbial interrupter following auxiliary does not'
  },
  {
    id: 'FP3',
    text: 'Suppose a paragraph contains seven findings, three quoted statements, two em dashes, several contractions, and a sentence whose punctuation is already correct.',
    desc: 'Imperative verb with serial direct object enumeration'
  },
  {
    id: 'FP4',
    text: 'If the user accepts the third suggestion, dismisses the fifth, and then restores a previously dismissed finding, the application must preserve the original text, maintain accurate character offsets, and ensure that no stale suggestion is applied to a different substring.',
    desc: 'Introductory conditional clause with compound bare-verb predicate'
  },
  {
    id: 'FP5',
    text: 'The team should measure precision, recall, false-positive rates, correction safety, and the frequency of meaning-changing edits; a perfect score on a small collection of hand-picked examples is encouraging, but it is not proof of universal accuracy.',
    desc: 'Serial enumeration bounded by semicolon and compound sentence'
  }
];

for (const fp of confirmedFPList) {
  const res = runGrammarEngine(fp.text);
  const spliceFindings = res.findings.filter(f => f.ruleId === 'SENTENCE_COMMA_SPLICE');
  assert(spliceFindings.length === 0, `False-positive control [${fp.id}] has 0 comma splice findings (${fp.desc})`, spliceFindings);
}

// 21.2 Subject-Verb Agreement: Long-Distance and Quasi-Coordinators (Case A)
const agreementCaseA = 'The list of exceptions, together with the supplementary notes and the comments submitted by three external consultants, are included in the appendix.';
const resCaseA = runGrammarEngine(agreementCaseA);
const quasiFindingA = resCaseA.findings.find(f => f.ruleId === 'AGREEMENT_SINGULAR_SUBJECT_QUASI_COORDINATOR');
assert(!!quasiFindingA, 'Case A: Singular head noun with quasi-coordinator triggers AGREEMENT_SINGULAR_SUBJECT_QUASI_COORDINATOR');
if (quasiFindingA) {
  assert(quasiFindingA.start === 120 && quasiFindingA.end === 123, 'Case A finding has exact character offsets [120, 123]');
  assert(quasiFindingA.originalText === 'are', 'Case A original text is "are"');
  assert(quasiFindingA.replacement === 'is', 'Case A suggests replacement "is"');
  const correctedA = applyFindingCorrection(agreementCaseA, quasiFindingA);
  assert(correctedA === 'The list of exceptions, together with the supplementary notes and the comments submitted by three external consultants, is included in the appendix.', 'Case A correction produces exact grammatical sentence');
}

// 21.3 Subject-Verb Agreement: Relative Clause & Quasi-Coordinator (Case B)
const agreementCaseB = 'The documentation, along with the examples that demonstrates the expected behavior, were published before the final review had been completed.';
const resCaseB = runGrammarEngine(agreementCaseB);
const relFindingB = resCaseB.findings.find(f => f.ruleId === 'AGREEMENT_RELATIVE_CLAUSE_PLURAL_ANTECEDENT');
const quasiFindingB = resCaseB.findings.find(f => f.ruleId === 'AGREEMENT_SINGULAR_SUBJECT_QUASI_COORDINATOR');

assert(!!relFindingB, 'Case B: Plural antecedent with relative pronoun triggers AGREEMENT_RELATIVE_CLAUSE_PLURAL_ANTECEDENT');
if (relFindingB) {
  assert(relFindingB.start === 48 && relFindingB.end === 60, 'Case B relative clause finding has exact character offsets [48, 60]');
  assert(relFindingB.originalText === 'demonstrates', 'Case B relative verb original text is "demonstrates"');
  assert(relFindingB.replacement === 'demonstrate', 'Case B relative verb replacement is "demonstrate"');
}

assert(!!quasiFindingB, 'Case B: Singular head documentation with quasi-coordinator triggers AGREEMENT_SINGULAR_SUBJECT_QUASI_COORDINATOR');
if (quasiFindingB) {
  assert(quasiFindingB.start === 84 && quasiFindingB.end === 88, 'Case B matrix verb finding has exact character offsets [84, 88]');
  assert(quasiFindingB.originalText === 'were', 'Case B matrix verb original text is "were"');
  assert(quasiFindingB.replacement === 'was', 'Case B matrix verb replacement is "was"');
}

const correctedB = applyAllSafeFixes(agreementCaseB);
assert(correctedB === 'The documentation, along with the examples that demonstrate the expected behavior, was published before the final review had been completed.', 'Case B applyAllSafeFixes produces exact grammatical sentence without offset corruption');

// 21.4 Additional Positive and Negative Syntactic Variations
const syntacticVariations = [
  // True Comma Splices (Positive tests - MUST BE CAUGHT)
  { text: 'The system works well, the results are reliable.', hasSplice: true, desc: 'Two simple independent clauses' },
  { text: 'The telemetry looks stable, the deployment was successful.', hasSplice: true, desc: 'Technical prose independent clauses' },
  { text: 'The project was expensive, the benefits were substantial.', hasSplice: true, desc: 'Evaluative independent clauses' },
  { text: 'Developers write code, tests verify behavior.', hasSplice: true, desc: 'Bare plural subject comma splice' },
  { text: 'Servers crashed during the migration, engineers investigated the incident.', hasSplice: true, desc: 'Capitalized plural subject comma splice' },

  // Introductory Dependent Clauses (Negative controls - ZERO splice errors)
  { text: 'Because the deadline was extended, the developers completed all tests.', hasSplice: false, desc: 'Introductory because clause' },
  { text: 'When the audit was complete, the team published the results.', hasSplice: false, desc: 'Introductory when clause' },
  { text: 'Having finalized the specifications, the architect scheduled the kickoff meeting.', hasSplice: false, desc: 'Introductory participial clause' },

  // Parenthetical Phrases (Negative controls - ZERO splice errors)
  { text: 'The committee does not, under any circumstances, approve unverified claims.', hasSplice: false, desc: 'Parenthetical after auxiliary' },
  { text: 'The results will, in most cases, remain consistent across runs.', hasSplice: false, desc: 'Parenthetical after modal' },
  { text: 'This feature is, without doubt, the most requested capability.', hasSplice: false, desc: 'Parenthetical after copula' },

  // Coordinated Compound Predicates (Negative controls - ZERO splice errors)
  { text: 'The engineer designed the module, tested the functions, and deployed the service.', hasSplice: false, desc: 'Coordinated past tense predicates' },
  { text: 'We parsed the configuration, validated the schema, and applied the updates.', hasSplice: false, desc: 'Coordinated predicates with pronoun subject' },
  { text: 'The tool detects formatting issues, suggests improvements, and fixes errors.', hasSplice: false, desc: 'Coordinated predicates with singular third-person verbs' },

  // Enumerations / Coordinate Lists (Negative controls - ZERO splice errors)
  { text: 'The report contains charts, tables, diagrams, and supplementary data.', hasSplice: false, desc: 'Serial noun phrase list' },
  { text: 'The system monitors CPU utilization, memory pressure, disk I/O, and network throughput.', hasSplice: false, desc: 'Technical metric enumeration' },

  // Semicolon Usage (Negative controls - ZERO errors)
  { text: 'The architecture is scalable; the implementation is robust.', hasSplice: false, desc: 'Independent clauses separated by semicolon' },
  { text: 'The engine parses input rapidly; however, large documents take longer.', hasSplice: false, desc: 'Semicolon with conjunctive adverb' },

  // Long-Distance Agreement Variations
  { text: 'The proposal, in addition to the revisions and feedback, were accepted.', hasSplice: false, hasQuasiAgreement: true, expectedQuasi: 'was', desc: 'Quasi-coordinator with plural noun objects' },
  { text: 'The proposal, in addition to the revisions and feedback, was accepted.', hasSplice: false, hasQuasiAgreement: false, desc: 'Control: Correct singular verb was' },
  { text: 'The guidelines that explains the process should be updated.', hasSplice: false, hasRelAgreement: true, expectedRel: 'explain', desc: 'Relative clause with plural guidelines and singular explains' },
  { text: 'The guidelines that explain the process should be updated.', hasSplice: false, hasRelAgreement: false, desc: 'Control: Correct plural verb explain' }
];

for (const v of syntacticVariations) {
  const res = runGrammarEngine(v.text);
  const splice = res.findings.some(f => f.ruleId === 'SENTENCE_COMMA_SPLICE');
  if (v.hasSplice) {
    assert(splice, `Positive Comma Splice detected for: "${v.text}" (${v.desc})`);
  } else {
    assert(!splice, `Negative Comma Splice control verified clean for: "${v.text}" (${v.desc})`);
  }

  if (v.hasQuasiAgreement !== undefined) {
    const qf = res.findings.find(f => f.ruleId === 'AGREEMENT_SINGULAR_SUBJECT_QUASI_COORDINATOR');
    if (v.hasQuasiAgreement) {
      assert(!!qf && qf.replacement === v.expectedQuasi, `Quasi-coordinator agreement detected for: "${v.text}" (expected "${v.expectedQuasi}")`);
    } else {
      assert(!qf, `Quasi-coordinator control verified clean for: "${v.text}"`);
    }
  }

  if (v.hasRelAgreement !== undefined) {
    const rf = res.findings.find(f => f.ruleId === 'AGREEMENT_RELATIVE_CLAUSE_PLURAL_ANTECEDENT');
    if (v.hasRelAgreement) {
      assert(!!rf && rf.replacement === v.expectedRel, `Relative clause agreement detected for: "${v.text}" (expected "${v.expectedRel}")`);
    } else {
      assert(!rf, `Relative clause control verified clean for: "${v.text}"`);
    }
  }
}

// 21.5 Object-Relative-Clause Negative Controls (Zero false positives, original text unchanged)
const objectRelativeClauseControls = [
  'The issues that developers face are complex.',
  'The features that users request are prioritized.',
  'The articles that researchers cite are influential.',
  'The books that students read are classic.',
  'The questions that candidates answer determine their score.',
  'The examples that clearly demonstrate the issue are useful.',
  'The guidelines that usually explain the process are clear.',
  'The metrics that frequently indicate system health are monitored.',
  'The issues that developers frequently face are complex.',
  'The features that users usually request are prioritized.',
  'The articles that researchers often cite are influential.'
];

for (const s of objectRelativeClauseControls) {
  const res = runGrammarEngine(s);
  const relFinding = res.findings.find(f => f.ruleId === 'AGREEMENT_RELATIVE_CLAUSE_PLURAL_ANTECEDENT');
  assert(!relFinding, `Object relative clause produces no AGREEMENT_RELATIVE_CLAUSE_PLURAL_ANTECEDENT finding for: "${s}"`);
  assert(res.findings.length === 0, `Valid object relative clause produces zero findings: "${s}"`);
  const fixed = applyAllSafeFixes(s);
  assert(fixed === s, `Original text remains completely unchanged for: "${s}"`);
}

// 21.6 Genuine Subject-Relative-Clause Agreement Errors (with and without intervening adverbs)
const genuineSubjectRelativeErrors = [
  {
    text: 'The examples that demonstrates the issue are useful.',
    expectedSpan: [18, 30] as [number, number],
    originalWord: 'demonstrates',
    expectedReplacement: 'demonstrate',
    expectedFixed: 'The examples that demonstrate the issue are useful.'
  },
  {
    text: 'The examples that clearly demonstrates the issue are useful.',
    expectedSpan: [26, 38] as [number, number],
    originalWord: 'demonstrates',
    expectedReplacement: 'demonstrate',
    expectedFixed: 'The examples that clearly demonstrate the issue are useful.'
  },
  {
    text: 'The guidelines that explains the process are clear.',
    expectedSpan: [20, 28] as [number, number],
    originalWord: 'explains',
    expectedReplacement: 'explain',
    expectedFixed: 'The guidelines that explain the process are clear.'
  },
  {
    text: 'The guidelines that usually explains the process are clear.',
    expectedSpan: [28, 36] as [number, number],
    originalWord: 'explains',
    expectedReplacement: 'explain',
    expectedFixed: 'The guidelines that usually explain the process are clear.'
  },
  {
    text: 'The metrics that frequently indicates system health are monitored.',
    expectedSpan: [28, 37] as [number, number],
    originalWord: 'indicates',
    expectedReplacement: 'indicate',
    expectedFixed: 'The metrics that frequently indicate system health are monitored.'
  }
];

for (const err of genuineSubjectRelativeErrors) {
  const res = runGrammarEngine(err.text);
  assert(res.findings.length === 1, `Exactly 1 finding flagged for: "${err.text}"`);
  const relFinding = res.findings.find(f => f.ruleId === 'AGREEMENT_RELATIVE_CLAUSE_PLURAL_ANTECEDENT');
  assert(!!relFinding, `Genuine error triggers AGREEMENT_RELATIVE_CLAUSE_PLURAL_ANTECEDENT for: "${err.text}"`);
  if (relFinding) {
    assert(relFinding.start === err.expectedSpan[0] && relFinding.end === err.expectedSpan[1], `Exact incorrect verb span [${err.expectedSpan[0]}, ${err.expectedSpan[1]}] for: "${err.text}"`);
    assert(relFinding.originalText === err.originalWord, `Original text matches "${err.originalWord}"`);
    assert(relFinding.replacement === err.expectedReplacement, `Replacement matches "${err.expectedReplacement}"`);
  }
  const fixed = applyAllSafeFixes(err.text);
  assert(fixed === err.expectedFixed, `Applying fix does not alter unrelated text for: "${err.text}"`);
  // Confirm the main-clause verb "are" is completely preserved
  assert(/\bare\b/.test(fixed), `Main-clause verb "are" is preserved in: "${fixed}"`);
}

// ============================================================
// 22. One-Pass Comprehensive Regression Suite (425-Word Stress Test & Section 4/5 Requirements)
// ============================================================
console.log('\n• Testing Suite 22: Comprehensive 425-Word Stress Test & Pipeline Audit...');

// 22.1 Section 4 Specific Regression Cases
console.log('  -> Checking Section 4 subject-verb agreement regressions...');
const s4Cases = [
  {
    id: 'S4-1',
    text: 'The examples that clearly demonstrates the issue are useful.',
    expectError: true,
    expectedFixed: 'The examples that clearly demonstrate the issue are useful.',
    desc: 'Relative clause with clearly demonstrates -> demonstrate; preserve are'
  },
  {
    id: 'S4-2',
    text: 'The examples that usually demonstrates the issue are useful.',
    expectError: true,
    expectedFixed: 'The examples that usually demonstrate the issue are useful.',
    desc: 'Relative clause with usually demonstrates -> demonstrate; preserve are'
  },
  {
    id: 'S4-3',
    text: 'The guidelines that frequently explains the process are clear.',
    expectError: true,
    expectedFixed: 'The guidelines that frequently explain the process are clear.',
    desc: 'Relative clause with frequently explains -> explain'
  },
  {
    id: 'S4-4',
    text: 'The issues that developers face are complex.',
    expectError: false,
    desc: 'Object relative clause developers face - zero false positives'
  },
  {
    id: 'S4-5',
    text: 'The features that users usually request are prioritized.',
    expectError: false,
    desc: 'Object relative clause users usually request - zero false positives'
  },
  {
    id: 'S4-6',
    text: 'The committee, together with its advisers, has approved the proposal.',
    expectError: false,
    desc: 'Singular subject with together with its advisers takes singular has approved - zero false positives'
  },
  {
    id: 'S4-7',
    text: 'The committee, together with its advisers, have approved the proposal.',
    expectError: true,
    expectedFixed: 'The committee, together with its advisers, has approved the proposal.',
    desc: 'Singular subject with together with taking have approved -> has approved'
  },
  {
    id: 'S4-8',
    text: 'The engineers who designed the system have discovered a defect.',
    expectError: false,
    desc: 'Plural subject engineers who designed takes plural have discovered - zero false positives'
  },
  {
    id: 'S4-9',
    text: 'The engineer who designed the system has discovered a defect.',
    expectError: false,
    desc: 'Singular subject engineer who designed takes singular has discovered - zero false positives'
  },
  {
    id: 'S4-10',
    text: 'Neither the authors nor the external reviewers claim that the analysis resolves every question.',
    expectError: false,
    desc: 'Correlative neither nor with plural closest subject reviewers claim - zero false positives'
  },
  {
    id: 'S4-11',
    text: 'The findings, together with the limitations, provide a useful starting point.',
    expectError: false,
    desc: 'Plural subject findings together with limitations takes provide - zero false positives'
  },
  {
    id: 'S4-12',
    text: 'The findings, together with the limitations, provides a useful starting point.',
    expectError: true,
    expectedFixed: 'The findings, together with the limitations, provide a useful starting point.',
    desc: 'Plural subject findings together with limitations taking provides -> provide'
  },
  {
    id: 'S4-13',
    text: 'One of the principal challenges is distinguishing genuine correlations.',
    expectError: false,
    desc: 'One of the principal challenges is - zero false positives'
  },
  {
    id: 'S4-14',
    text: 'Many of the observations were collected under different conditions.',
    expectError: false,
    desc: 'Many of the observations were collected - zero false positives'
  }
];

for (const tc of s4Cases) {
  const res = runGrammarEngine(tc.text);
  const agrFindings = res.findings.filter(f => f.ruleId.startsWith('AGREEMENT_'));
  if (tc.expectError) {
    assert(agrFindings.length >= 1, `[${tc.id}] Genuine agreement error detected for "${tc.text}" (${tc.desc})`);
    if (tc.expectedFixed) {
      const fixed = applyAllSafeFixes(tc.text);
      assert(fixed === tc.expectedFixed, `[${tc.id}] Safe fix yields expected text "${tc.expectedFixed}" (got "${fixed}")`);
    }
  } else {
    assert(agrFindings.length === 0, `[${tc.id}] Zero false-positive agreement errors for "${tc.text}" (${tc.desc})`, agrFindings);
  }
}

// 22.2 Individual Sentence Audit for the 17 Stress-Test Sentences
console.log('  -> Auditing all 17 individual stress-test sentences...');
const stressSentences = [
  {
    num: 1,
    text: "Although the research team, together with several external consultants, have reviewed the preliminary findings, the conclusions that the report presents remains controversial because neither the available evidence nor the statistical models fully explains the observed pattern.",
    hasCommaSplice: false,
    minAgrErrors: 2 // remains -> remain, explains -> explain, have -> has
  },
  {
    num: 2,
    text: "The engineers who designed the monitoring system, which was originally intended to detect minor fluctuations in temperature, has discovered that several sensors produces inconsistent readings whenever the surrounding humidity increases unexpectedly.",
    hasCommaSplice: false,
    minAgrErrors: 2 // has discovered -> have discovered, produces -> produce
  },
  {
    num: 3,
    text: "These discrepancies, however, does not necessarily indicate that the entire system are unreliable; rather, they suggests that the calibration procedure, along with the assumptions underlying the original experiment, require further investigation.",
    hasCommaSplice: false,
    minAgrErrors: 3 // does -> do, system are -> is, they suggests -> suggest, require -> requires
  },
  {
    num: 4,
    text: "The committee reviewed the proposals, compared the projected costs, and consulted independent specialists, it subsequently approved a revised implementation plan that includes additional safeguards, clearer reporting requirements, and more frequent inspections.",
    hasCommaSplice: true, // genuine comma splice between specialists, it
    minAgrErrors: 0
  },
  {
    num: 5,
    text: "Several participants argued that the changes were unnecessary, others maintained that the earlier procedure had overlooked risks that experienced analysts would have identified.",
    hasCommaSplice: true, // genuine comma splice between unnecessary, others
    minAgrErrors: 0
  },
  {
    num: 6,
    text: "One of the principal challenges in evaluating the results are distinguishing genuine correlations from coincidental relationships.",
    hasCommaSplice: false,
    minAgrErrors: 1 // are -> is
  },
  {
    num: 7,
    text: "The dataset contains thousands of observations, many of which was collected under different environmental conditions, and the analysts must determine whether the apparent differences reflects meaningful variation or measurement error.",
    hasCommaSplice: false,
    minAgrErrors: 2 // was -> were, reflects -> reflect
  },
  {
    num: 8,
    text: "A researcher who carefully examines these limitations are more likely to produce conclusions that withstand independent scrutiny.",
    hasCommaSplice: false,
    minAgrErrors: 1 // are -> is
  },
  {
    num: 9,
    text: "Furthermore, the report emphasizes that organizations should establish transparent procedures, document every significant decision, and communicate uncertainty honestly.",
    hasCommaSplice: false,
    minAgrErrors: 0 // clean sentence
  },
  {
    num: 10,
    text: "Managers who ignores these responsibilities can undermine public confidence, even when their technical teams performs their work competently.",
    hasCommaSplice: false,
    minAgrErrors: 2 // ignores -> ignore, performs -> perform
  },
  {
    num: 11,
    text: "In complex investigations, accuracy is not achieved merely by collecting more data; it also depends on how carefully the evidence are interpreted, how clearly the limitations is explained, and whether competing interpretations receives fair consideration.",
    hasCommaSplice: false,
    minAgrErrors: 3 // evidence are -> is, limitations is -> are, interpretations receives -> receive
  },
  {
    num: 12,
    text: "Although the final recommendations appears reasonable at first glance, their practical implications remains uncertain.",
    hasCommaSplice: false,
    minAgrErrors: 2 // appears -> appear, remains -> remain
  },
  {
    num: 13,
    text: "If the proposed safeguards is implemented without adequate training, employees may follow the new procedures inconsistently, this could create additional problems rather than resolving the original ones.",
    hasCommaSplice: true, // genuine comma splice between inconsistently, this
    minAgrErrors: 1 // safeguards is -> are
  },
  {
    num: 14,
    text: "Consequently, decision-makers should evaluate not only whether a policy sounds persuasive, but also whether its assumptions are supported by evidence, its costs are proportionate to its benefits, and its outcomes can be measured reliably.",
    hasCommaSplice: false,
    minAgrErrors: 0 // clean sentence
  },
  {
    num: 15,
    text: "The findings, together with the methodological limitations described in the appendix, provides a useful starting point for future research.",
    hasCommaSplice: false,
    minAgrErrors: 1 // provides -> provide
  },
  {
    num: 16,
    text: "Neither the authors nor the external reviewers claims that the analysis resolves every outstanding question; instead, they acknowledges that further experiments are needed.",
    hasCommaSplice: false,
    minAgrErrors: 2 // claims -> claim, acknowledges -> acknowledge
  },
  {
    num: 17,
    text: "A comprehensive review should identify which conclusions are well supported, which assumptions requires additional testing, and which uncertainties cannot yet be eliminated.",
    hasCommaSplice: false,
    minAgrErrors: 1 // requires -> require
  }
];

for (const s of stressSentences) {
  const analysis = analyzeText(s.text);
  const splices = analysis.coachFindings.filter(f => f.ruleId === 'SENTENCE_COMMA_SPLICE' || /comma splice/i.test(f.issue));
  const agrFindings = analysis.coachFindings.filter(f => f.ruleId?.startsWith('AGREEMENT_'));

  if (s.hasCommaSplice) {
    assert(splices.length >= 1, `Sentence ${s.num}: Comma splice correctly detected`);
  } else {
    assert(splices.length === 0, `Sentence ${s.num}: Zero false-positive comma splices (got ${splices.length})`, splices);
  }

  if (s.minAgrErrors > 0) {
    assert(agrFindings.length >= s.minAgrErrors, `Sentence ${s.num}: Detected at least ${s.minAgrErrors} agreement errors (found ${agrFindings.length})`);
  } else {
    assert(agrFindings.length === 0, `Sentence ${s.num}: Correct agreement has 0 false positives (found ${agrFindings.length})`);
  }

  // Safe rewrite validation: no invalid semicolon insertion
  for (const cf of analysis.coachFindings) {
    if (cf.rewrite) {
      assert(!/^(?:Although|Because|If|When|While|Unless|Since)\b[^,;]+;/i.test(cf.rewrite), `Sentence ${s.num}: Rewrite does NOT insert semicolon after introductory clause (Pattern A guard)`);
      assert(!/;\s*(?:and|but|or|nor|so|yet)\b/i.test(cf.rewrite), `Sentence ${s.num}: Rewrite does NOT replace coordinating or list conjunction with semicolon (Pattern B guard)`);
      assert(!/;\s*(?:many|some|several)\s+of\s+which\b/i.test(cf.rewrite), `Sentence ${s.num}: Rewrite does NOT split relative clause with semicolon (Pattern C guard)`);
    }
    // Finding integrity: ruleId, category, and issue must match
    if (cf.ruleId === 'SENTENCE_COMMA_SPLICE') {
      assert(/comma splice/i.test(cf.issue), `Sentence ${s.num}: Comma splice finding issue text matches ruleId`);
      assert(cf.replacement === ';' || cf.replacement === '. ', `Sentence ${s.num}: Comma splice replacement is punctuation`);
    }
    if (cf.ruleId?.startsWith('AGREEMENT_')) {
      assert(/agreement|mismatch/i.test(cf.issue), `Sentence ${s.num}: Agreement finding issue text matches ruleId`);
      assert(!/comma splice/i.test(cf.issue), `Sentence ${s.num}: Agreement finding does NOT contain comma-splice issue text`);
    }
  }
}

// 22.3 Full 425-Word Stress Test Paragraph Corpus
console.log('  -> Testing full combined 425-word stress-test passage...');
const fullPassage = stressSentences.map(s => s.text).join('\n\n');
const fullAnalysis = analyzeText(fullPassage, 0.05, 150);

// Basic stats verification
assert(fullAnalysis.sentences === 17, `Sentence count is exactly 17 (got ${fullAnalysis.sentences})`);
assert(fullAnalysis.words === 425, `Word count is exactly 425 (got ${fullAnalysis.words})`);
assert(fullAnalysis.paragraphs === 17, `Paragraph count is 17 when double-newline separated`);
assert(fullAnalysis.estimatedEarnings === 21.25, `Estimated earnings for 425 words @ $0.05/word is exactly $21.25 (got $${fullAnalysis.estimatedEarnings.toFixed(2)})`);

// Comma-splice audit on full passage
const fullSplices = fullAnalysis.coachFindings.filter(f => f.ruleId === 'SENTENCE_COMMA_SPLICE' || /comma splice/i.test(f.issue));
assert(fullSplices.length === 3, `Full passage detects exactly 3 genuine comma splices (on S4, S5, S13), got ${fullSplices.length}`);
const spliceSentences = fullSplices.map(f => f.sentenceIndex).sort((a, b) => (a || 0) - (b || 0));
assert(spliceSentences.includes(4), 'Comma splice detected on Sentence 4');
assert(spliceSentences.includes(5), 'Comma splice detected on Sentence 5');
assert(spliceSentences.includes(13), 'Comma splice detected on Sentence 13');

// Safe fix idempotence & non-destructive application
const fullFixedPass1 = applyAllSafeFixes(fullPassage);
const fullFixedPass2 = applyAllSafeFixes(fullFixedPass1);
assert(fullFixedPass1 === fullFixedPass2, 'Safe fix application is 100% idempotent: Pass 2 produces identical output to Pass 1');

// Readability metrics sanity
assert(fullAnalysis.flesch != null && fullAnalysis.flesch >= 0 && fullAnalysis.flesch <= 100, `Flesch score is valid range [0, 100] (got ${fullAnalysis.flesch})`);
assert(fullAnalysis.fkGrade != null && fullAnalysis.fkGrade > 15, `Flesch-Kincaid Grade reflects college-level density (>15, got ${fullAnalysis.fkGrade})`);
assert(fullAnalysis.fog != null && fullAnalysis.fog > 15, `Gunning Fog reflects advanced academic prose (>15, got ${fullAnalysis.fog})`);

// ============================================================
// 24. Targeted Positive Grammar Defect & Negative Control Verifications
// ============================================================
console.log('\n• Testing Suite 24: Targeted Positive Grammar Defects & Negative Controls...');

const targetPositiveCases = [
  {
    id: 1,
    name: 'Subordinate clause bare plural subject with singular verb (attempts -> attempt)',
    input: 'A further complication arises when researchers attempts to compare datasets.',
    expected: 'A further complication arises when researchers attempt to compare datasets.',
    expectedRules: ['AGREEMENT_PLURAL_NOUN_SINGULAR_VERB']
  },
  {
    id: 2,
    name: 'Plural antecedent with past singular auxiliary (datasets that was -> were)',
    input: 'Researchers compare datasets that was collected under different conditions.',
    expected: 'Researchers compare datasets that were collected under different conditions.',
    expectedRules: ['AGREEMENT_RELATIVE_CLAUSE_PLURAL_ANTECEDENT']
  },
  {
    id: 3,
    name: 'Multi-error demonstrative plural + irregular aux + 3rd singular verb (these discrepancies does not... system are... they suggests)',
    input: 'These discrepancies does not prove that the entire system are unreliable; rather, they suggests that further validation is required.',
    expected: 'These discrepancies do not prove that the entire system is unreliable; rather, they suggest that further validation is required.',
    expectedRules: ['AGREEMENT_PLURAL_NOUN_SINGULAR_VERB', 'AGREEMENT_SINGULAR_NOUN_PLURAL_VERB', 'AGREEMENT_PLURAL_PRONOUN_SINGULAR_VERB']
  },
  {
    id: 4,
    name: 'Compound subject with intervening phrases + introductory subordinator (samples appears... differences in... introduces)',
    input: 'Although the samples appears similar, differences in recruitment procedures and participant characteristics introduces uncertainty.',
    expected: 'Although the samples appear similar, differences in recruitment procedures and participant characteristics introduce uncertainty.',
    expectedRules: ['AGREEMENT_PLURAL_NOUN_SINGULAR_VERB']
  },
  {
    id: 5,
    name: 'Neither/nor compound subject with adverb + prepositional postmodifier (neither... nor... fully explains... assumptions used... requires)',
    input: 'Neither the available observations nor the statistical models fully explains the discrepancy, and the assumptions used during analysis requires examination.',
    expected: 'Neither the available observations nor the statistical models fully explain the discrepancy, and the assumptions used during analysis require examination.',
    expectedRules: ['AGREEMENT_CORRELATIVE_CONJUNCTION', 'AGREEMENT_HEAD_NOUN_PREPOSITIONAL_PHRASE']
  },
  {
    id: 6,
    name: 'Multiple which-clauses with plural subjects (which interpretations depends... which questions remains)',
    input: 'The report should identify which interpretations depends on assumptions and which questions remains unresolved.',
    expected: 'The report should identify which interpretations depend on assumptions and which questions remain unresolved.',
    expectedRules: ['AGREEMENT_PLURAL_NOUN_SINGULAR_VERB']
  },
  {
    id: 7,
    name: 'Plural head with relative clause + matrix verb + subordinate subject (Recommendations that ignores... risks... decision-makers treats)',
    input: 'Recommendations that ignores these distinctions risks misleading readers when decision-makers treats scores as conclusive proof.',
    expected: 'Recommendations that ignore these distinctions risk misleading readers when decision-makers treat scores as conclusive proof.',
    expectedRules: ['AGREEMENT_RELATIVE_CLAUSE_PLURAL_ANTECEDENT', 'AGREEMENT_HEAD_NOUN_RELATIVE_CLAUSE', 'AGREEMENT_PLURAL_NOUN_SINGULAR_VERB']
  },
  {
    id: 8,
    name: 'Compound coordination subject with singular verb (Accuracy, clarity, and justified confidence matters -> matter)',
    input: 'Accuracy, clarity, and justified confidence matters more than the number of corrections.',
    expected: 'Accuracy, clarity, and justified confidence matter more than the number of corrections.',
    expectedRules: ['AGREEMENT_COMPOUND_SUBJECT_CONJUNCTION']
  },
  {
    id: 9,
    name: 'Plural head with who-relative clause + perfect auxiliary + plural antecedent (engineers who... has discovered... results that appears)',
    input: 'The engineers who developed the original evaluation framework has discovered several limitations, including results that appears inconsistent.',
    expected: 'The engineers who developed the original evaluation framework have discovered several limitations, including results that appear inconsistent.',
    expectedRules: ['AGREEMENT_HEAD_NOUN_RELATIVE_CLAUSE', 'AGREEMENT_RELATIVE_CLAUSE_PLURAL_ANTECEDENT']
  },
  {
    id: 10,
    name: 'Comma splice between two independent clauses with other researchers (improvements, other researchers disputed)',
    input: 'Several studies reported improvements, other researchers disputed the conclusion.',
    expected: 'Several studies reported improvements; other researchers disputed the conclusion.',
    expectedRules: ['SENTENCE_COMMA_SPLICE']
  }
];

const targetNegativeControls = [
  {
    id: 'N1',
    input: 'The issues that developers face are complex.',
    description: 'Object relative clause: plural noun + that + subject + verb'
  },
  {
    id: 'N2',
    input: 'The features that users request are prioritized.',
    description: 'Object relative clause'
  },
  {
    id: 'N3',
    input: 'The report contains charts, tables, diagrams, and supplementary data.',
    description: 'Serial noun list (not a comma splice)'
  },
  {
    id: 'N4',
    input: 'Because the deadline was extended, the developers completed all tests.',
    description: 'Introductory subordinate clause'
  },
  {
    id: 'N5',
    input: 'When the audit was complete, the team published the results.',
    description: 'Introductory subordinate clause'
  },
  {
    id: 'N6',
    input: 'The engineer designed the module, tested the functions, and deployed the service.',
    description: 'Coordinated compound predicates'
  },
  {
    id: 'N7',
    input: 'We parsed the configuration, validated the schema, and applied the updates.',
    description: 'Coordinated compound predicates with pronoun subject'
  },
  {
    id: 'N8',
    input: 'The guidelines that explain the process should be updated.',
    description: 'Correct plural relative-clause agreement'
  },
  {
    id: 'N9',
    input: 'Assumptions that were never adequately challenged led to the delay.',
    description: 'Plural antecedent + that + were'
  },
  {
    id: 'N10',
    input: 'The architecture is scalable; the implementation is robust.',
    description: 'Valid semicolon between independent clauses'
  }
];

for (const tc of targetPositiveCases) {
  const engineResult = runGrammarEngine(tc.input);
  const engineFindings = engineResult.findings;
  assert(engineFindings.length > 0, `Target Positive Case ${tc.id}: Engine detected at least one error`);

  // Verify expected rule triggers
  for (const expRule of tc.expectedRules) {
    const matched = engineFindings.some(f => f.ruleId === expRule || f.ruleId.startsWith(expRule));
    assert(matched, `Target Positive Case ${tc.id}: Engine triggered rule ${expRule}`);
  }

  // Exact engine applyAllSafeFixes matches expected
  const fixedByEngine = applyAllSafeFixes(tc.input);
  assert(fixedByEngine === tc.expected, `Target Positive Case ${tc.id}: applyAllSafeFixes produces exact expected output`, { got: fixedByEngine, expected: tc.expected });

  // Coach findings and coach rewrite
  const analysis = analyzeText(tc.input);
  const relevantCoachFindings = analysis.coachFindings.filter(f => f.ruleId?.startsWith('AGREEMENT_') || f.ruleId === 'SENTENCE_COMMA_SPLICE');
  assert(relevantCoachFindings.length > 0, `Target Positive Case ${tc.id}: Coach findings identified target errors`);

  // Test full-sentence rewrite coherence on coach findings
  for (const cf of relevantCoachFindings) {
    if (cf.rewrite) {
      assert(cf.rewrite === tc.expected, `Target Positive Case ${tc.id}: Coach finding rewrite matches complete sentence correction`, { got: cf.rewrite, expected: tc.expected });
    }
  }

  // applySafeGrammarFixes matches expected
  const fixedByCoach = applySafeGrammarFixes(tc.input);
  assert(fixedByCoach === tc.expected, `Target Positive Case ${tc.id}: applySafeGrammarFixes produces exact expected output`, { got: fixedByCoach, expected: tc.expected });

  // Idempotence: applying fixes again to expected output produces identical text
  const pass2 = applyAllSafeFixes(fixedByCoach);
  assert(pass2 === tc.expected, `Target Positive Case ${tc.id}: Repeated fix application is idempotent`);

  // Re-analysis has 0 remaining agreement errors or comma splices
  const reAnalysis = analyzeText(tc.expected);
  const remainingErrors = reAnalysis.coachFindings.filter(f => f.ruleId?.startsWith('AGREEMENT_') || f.ruleId === 'SENTENCE_COMMA_SPLICE');
  assert(remainingErrors.length === 0, `Target Positive Case ${tc.id}: Re-analysis yields 0 remaining agreement/splice errors (got ${remainingErrors.length})`, remainingErrors);
}

for (const nc of targetNegativeControls) {
  const engineFindings = runGrammarEngine(nc.input).findings;
  assert(engineFindings.length === 0, `Negative Control ${nc.id} (${nc.description}): Zero engine findings (got ${engineFindings.length})`, engineFindings);

  const analysis = analyzeText(nc.input);
  const coachErrors = analysis.coachFindings.filter(f => f.ruleId?.startsWith('AGREEMENT_') || f.ruleId === 'SENTENCE_COMMA_SPLICE');
  assert(coachErrors.length === 0, `Negative Control ${nc.id}: Zero coach grammar/splice findings (got ${coachErrors.length})`, coachErrors);

  const unchanged = applyAllSafeFixes(nc.input);
  assert(unchanged === nc.input, `Negative Control ${nc.id}: applyAllSafeFixes preserves input unchanged`);
}

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
