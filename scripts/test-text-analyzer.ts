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
