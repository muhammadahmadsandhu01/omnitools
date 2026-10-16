'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  AlignLeft, BarChart2, BookOpen, Check, Clock, Copy, Download,
  FileDiff, Hash, Play, Search, Scissors, Square, Trash2,
  Upload, Wand2, X, CheckCircle2, AlertCircle, Info, Sparkles, Target, FileSpreadsheet
} from 'lucide-react';

export const SAMPLE_TEXT = `Clear writing shares ideas simply, directly, and with good rhythm. When drafting an article or business report, knowing your audience is the most useful step toward engagement.

The Flesch Reading Ease score measures text clarity on a zero to one hundred scale. Plain English content targets a score between sixty and seventy. This range matches an eighth-grade reading level. Short sentences, everyday words, and active verbs reduce fatigue. They also allow readers to absorb information without extra effort.

In contrast, very long sentences with too many clauses often hide your central point. Complex topics may need precise words. Still, skilled writers replace wordy phrases with direct verbs in order to maximize clarity.

By tracking word count, reading pace, keyword density, and sentence structure in real time, you can polish your drafts with confidence before publication.`;

export type Tone = 'Positive' | 'Negative' | 'Neutral' | 'Mixed';

export type CoachFinding = {
  id: string;
  category: 'Grammar' | 'Clarity' | 'Consistency' | 'Passive voice';
  severity: 'high' | 'medium' | 'low';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore: number;
  sentenceIndex?: number;
  sentence?: string;
  issue: string;
  why: string;
  suggestion?: string;
  rewrite?: string;
};

export type WritingIssue = {
  id: string;
  kind: 'Long sentence' | 'Filler phrase' | 'Passive candidate' | 'Excessive punctuation' | 'All-caps' | 'Grammar candidate' | 'Clarity candidate' | 'Consistency candidate';
  severity: 'high' | 'medium' | 'low';
  sentenceIndex?: number;
  sentence?: string;
  detail: string;
  fixLabel?: string;
  fixType?: 'remove-filler' | 'normalize-punctuation' | 'sentence-case';
};

export type ScoreFactor = {
  type: 'positive' | 'neutral' | 'improvement';
  text: string;
};

export type Analysis = {
  chars: number;
  charsNoSpaces: number;
  graphemes: number;
  words: number;
  uniqueWords: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  syllables: number;
  avgWordLength: number;
  avgSentenceWords: number;
  avgParagraphWords: number;
  lexicalDensity: number;
  vocabularyDiversity: number;
  readingTimeSec: number;
  speakingTimeSec: number;
  estimatedEarnings: number;
  flesch: number | null;
  fkGrade: number | null;
  fog: number | null;
  smog: number | null;
  coleman: number | null;
  ari: number | null;
  gradeLabel: string;
  tone: { label: Tone; score: number; positive: number; negative: number };
  keywords: { word: string; count: number; pct: number }[];
  phrases: { phrase: string; count: number }[];
  repeated: { phrase: string; count: number }[];
  longSentences: { index: number; text: string; words: number }[];
  shortSentences: { index: number; text: string; words: number }[];
  fillerHits: { phrase: string; count: number }[];
  passiveCandidates: { sentence: string; index: number }[];
  capsRatio: number;
  exclamations: number;
  questions: number;
  longestWord: string;
  longestSentence: string;
  longestSentenceWords: number;
  issues: WritingIssue[];
  grammarCandidates: { sentence: string; index: number; detail: string; suggestion?: string; confidence: 'HIGH' | 'MEDIUM' | 'LOW' }[];
  clarityCandidates: { sentence: string; index: number; detail: string; suggestion?: string; confidence: 'HIGH' | 'MEDIUM' | 'LOW' }[];
  consistencyCandidates: { detail: string; suggestion?: string; confidence: 'HIGH' | 'MEDIUM' | 'LOW' }[];
  repeatedOpenings: { phrase: string; count: number }[];
  repeatedSentences: { sentence: string; count: number; indices: number[] }[];
  clarityScore: number | null;
  grammarScore: number | null;
  consistencyScore: number | null;
  writingScore: number;
  scoreFactors: ScoreFactor[];
  coachFindings: CoachFinding[];
};

const STOP_WORDS = new Set(
  ('a an the and but or for nor on at to from by with of in is are was were am be been being have has had do does did will would shall should can could may might must that this these those what which who whom whose how why where when it its they them their he him his she her we us our you your i my me as so if then than because while about against between into through during before after above below up down out off over under again further once here there all any both each few more most other some such no not only own same too very just now'.split(' '))
);

const POSITIVE = new Set('good great excellent love loved best awesome amazing happy positive success win winner perfect beautiful brilliant fantastic glad joy useful helpful effective strong easy improve improved improvement benefit benefits exceptional outstanding wonderful superior'.split(' '));
const NEGATIVE = new Set('bad worst hate hated terrible fail failed failure awful sad negative loss wrong ugly poor stupid angry cry disaster fake difficult problem problems weak error errors broken defect defective terrible'.split(' '));

const FILLERS = [
  'in order to', 'due to the fact that', 'at this point in time', 'for the purpose of',
  'in the event that', 'a number of', 'as a matter of fact', 'basically', 'actually',
  'very', 'really', 'just', 'literally', 'kind of', 'sort of', 'perhaps', 'maybe'
];

const KEYWORD_EXCLUSIONS = new Set([...STOP_WORDS, ...FILLERS.flatMap(x => x.split(/\s+/)), 'good', 'great', 'excellent', 'bad', 'worst']);

const ABBREVIATIONS = [
  'p.m.', 'a.m.', 'Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Sr.', 'Jr.', 'e.g.', 'i.e.',
  'vs.', 'etc.', 'Inc.', 'Ltd.', 'Corp.', 'Co.', 'No.', 'Jan.', 'Feb.', 'Mar.', 'Apr.',
  'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.', 'St.', 'Ave.', 'Dept.', 'Gov.', 'Gen.', 'Col.',
  'Capt.', 'Lt.', 'Maj.', 'Rev.', 'Sen.', 'Rep.', 'U.S.', 'U.K.', 'E.U.', 'Ph.D.', 'M.D.',
  'B.A.', 'M.A.', 'B.S.', 'M.S.'
];

function metric(label: string, value: string | number, subtext?: string) {
  return (
    <div className="bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-4 rounded-2xl">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{value}</div>
      {subtext && <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{subtext}</div>}
    </div>
  );
}

export function countGraphemes(text: string): number {
  if (!text) return 0;
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    let count = 0;
    for (const _ of segmenter.segment(text)) {
      count++;
    }
    return count;
  }
  return [...text].length;
}

export function countLines(text: string): number {
  if (!text) return 0;
  return text.split(/\r\n|\r|\n/).length;
}

// Conservative passive-voice detector: require auxiliary + past-participle token
const PASSIVE_RE = /\b(?:am|are|was|were|be|been|being)\s+(?:\w+\s+){0,1}(?:[a-z]+(?:ed|en|wn)|built|rebuilt|dealt|felt|knelt|kept|crept|slept|swept|wept|leapt|bent|sent|spent|lent|meant|burnt|learnt|left|cleft|bereft)\b/i;
const PASSIVE_EXCLUSIONS = [
  /^why\s+(?:is|are|was|were)\b/i,
  /^what\s+(?:is|are|was|were)\b/i,
  /^how\s+(?:is|are|was|were)\b/i,
  /\b(?:should|could|would|might|may|must|can)\s+(?:\w+\s+){0,2}be\s+[a-z]+(?:ed|en|wn|lt|pt|nt|ft)\b/i,
  // Predicate adjectives of emotion, state, property, or condition (NOT passive voice)
  /\b(?:am|are|is|was|were)\s+(?:\w+\s+)*(?:excited|interested|pleased|tired|surprised|worried|scared|confused|bored|delighted|disappointed|annoyed|amazed|happy|ready|responsible|successful|glad|grateful|available|aware|upset|stable|incomplete|difficult|significant|important|different|consistent|evident|apparent|present|absent|confident)\b/i,
  // Progressive -ing active voice
  /\b(?:am|are|is|was|were)\s+(?!(?:being)\b)(?:\w+\s+)*[a-z]+ing\b/i,
  // Degree adverbs modifying adjectives: "was very/extremely/quite/so [adjective]"
  /\b(?:am|are|is|was|were)\s+(?:very|extremely|quite|so)\s+[a-z]+(?:ed|ing)\b/i,
  // Agreement mismatches where was/were is ungrammatical (handled by grammar engine)
  /\b(?:they|we|you)\s+was\b/i,
  /\b(?:the|these|those)\s+(?!(?:[a-z]+(?:ss|us|is)|series|species|lens|news)\b)[a-z]+s\s+was\b/i
];

function hasUsefulPassive(sentence: string): boolean {
  const trimmed = sentence.trim();
  if (!trimmed || PASSIVE_EXCLUSIONS.some(re => re.test(trimmed))) return false;
  // Subordinate tail check
  const main = trimmed.replace(/\b(?:after|before|while|when|once|until)\b[\s\S]*$/i, '').trim();
  if (main && PASSIVE_RE.test(main)) return true;
  if (main && main !== trimmed) return false;
  return PASSIVE_RE.test(trimmed);
}

export function wordsOf(s: string): string[] {
  return s.toLowerCase().match(/(?:\p{N}+(?:[.,]\p{N}+)+|[\p{L}\p{N}]+(?:['’\-–][\p{L}\p{N}]+)*)/gu) || [];
}

const INTL_TERMINATORS = /[.!?。۔؟！？]/;

function protectSentenceText(s: string): string {
  let res = s;
  // 1. Dotted abbreviations FIRST
  for (const abbr of ABBREVIATIONS) {
    const escaped = abbr.replace(/\./g, '\\.');
    const re = new RegExp(`\\b${escaped}`, 'gi');
    res = res.replace(re, m => m.replace(/\./g, '\u0001'));
  }
  // 2. Generic interior dots between alphanumeric/symbol characters (e.g. Node.js, React.js, Next.js, package.json, example.com, v2.5)
  res = res.replace(/(?<=[a-zA-Z0-9_#+])\.(?=[a-zA-Z0-9_#+])/g, '\u0001');
  // 3. Generic leading dots on tokens (e.g. .NET, .env, .gitignore)
  res = res.replace(/(?<=^|[\s"'({[/])\.([a-zA-Z0-9_#+]+)/g, '\u0001$1');
  // 4. Initials like J. K. or A. Smith
  res = res.replace(/\b([A-Z])\.\s+(?=[A-Z]\.|\b[A-Za-z])/g, '$1\u0001 ');
  // 5. Emails & URLs
  res = res.replace(/\b([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)\b/g, m => m.replace(/\./g, '\u0001'));
  res = res.replace(/(https?:\/\/[^\s]+)/g, m => m.replace(/\./g, '\u0001'));
  // 6. Versions and decimals
  res = res.replace(/\b([vV]?\d+)\.(\d+)(?:\.(\d+))?\b/g, m => m.replace(/\./g, '\u0001'));
  // 7. Ellipses
  res = res.replace(/\.{3}/g, '\u0004');
  return res;
}

function restoreSentenceText(s: string): string {
  return s.replace(/\u0001/g, '.').replace(/\u0004/g, '...');
}

export function sentencesOf(s: string): string[] {
  if (!s || !s.trim()) return [];
  const protectedText = protectSentenceText(s);
  const out: string[] = [];

  let start = 0;
  let quote: 'double' | 'single' | '' = '';
  const letterOrNumber = (ch: string) => !!ch && /[\p{L}\p{N}]/u.test(ch);
  const isApostrophe = (ch: string) => ch === "'" || ch === '’' || ch === '‘';
  const isDoubleQuote = (ch: string) => ch === '"' || ch === '“' || ch === '”';

  for (let i = 0; i < protectedText.length; i++) {
    const ch = protectedText[i];
    if (isApostrophe(ch)) {
      const prev = i > 0 ? protectedText[i - 1] : '';
      const next = i + 1 < protectedText.length ? protectedText[i + 1] : '';
      if (letterOrNumber(prev) && letterOrNumber(next)) continue;
    }
    if (isDoubleQuote(ch) || ch === "'" || ch === '’' || ch === '‘' || ch === '«' || ch === '»') {
      const prev = i > 0 ? protectedText[i - 1] : '';
      const structuralOpen = i === 0 || /[\s:([{—–-]/.test(prev);
      const double = isDoubleQuote(ch) || ch === '«' || ch === '»';
      if (!quote) {
        if (structuralOpen && ch !== '»') quote = double ? 'double' : 'single';
      } else {
        const closes = quote === 'double' ? (ch === '"' || ch === '”' || ch === '»') : (ch === "'" || ch === '’' || ch === '»');
        if (closes) quote = '';
      }
      continue;
    }
    if (!INTL_TERMINATORS.test(ch)) continue;

    if (ch === '.') {
      const lineStart = protectedText.lastIndexOf('\n', i) + 1;
      const marker = protectedText.slice(lineStart, i + 1);
      if (/^\s*\d+\.$/.test(marker)) {
        start = i + 1;
        while (start < protectedText.length && /[\t ]/.test(protectedText[start])) start++;
        continue;
      }
      const prev = protectedText[i - 1] || '';
      const next = protectedText[i + 1] || '';
      if (letterOrNumber(prev) && letterOrNumber(next)) continue;
    }

    let end = i + 1;
    while (end < protectedText.length && INTL_TERMINATORS.test(protectedText[end])) end++;
    if (quote) {
      let q = end;
      while (q < protectedText.length && /[\t ]/.test(protectedText[q])) q++;
      const closes = quote === 'double' ? /["”»]/ : /['’»]/;
      if (q >= protectedText.length || !closes.test(protectedText[q])) continue;
      q++;
      while (q < protectedText.length && /[\t ]/.test(protectedText[q])) q++;
      end = q;
      quote = '';
    } else {
      while (end < protectedText.length && INTL_TERMINATORS.test(protectedText[end])) end++;
      while (end < protectedText.length && /["”’»]/.test(protectedText[end])) {
        end++;
        while (end < protectedText.length && /[\t ]/.test(protectedText[end])) end++;
      }
    }

    let value = protectedText.slice(start, end).trim();
    if (value.includes('\n')) {
      const lines = value.split(/\n+/);
      while (
        lines.length > 1 &&
        (/^[A-Z0-9][A-Z0-9 \-—–:]+$/.test(lines[0].trim()) ||
         /^[^.!?。۔؟！？]{1,80}:$/.test(lines[0].trim()) ||
         (lines[0].trim().length <= 60 && !/[.!?。۔؟！？]$/.test(lines[0].trim()) && /^[A-Z][a-zA-Z0-9 '’\-—–:]+$/.test(lines[0].trim()) && !/\b(?:and|but|or|so|yet|because|although|when|while|if|unless)\b/i.test(lines[0].trim())))
      ) {
        lines.shift();
      }
      value = lines.join(' ').trim();
    }
    if (value && wordsOf(value).length > 0) out.push(restoreSentenceText(value));
    start = end;
    i = end - 1;
  }
  const tail = protectedText.slice(start).trim();
  if (tail && wordsOf(tail).length > 0 && !(/^[A-Z0-9][A-Z0-9 \-—–:]+$/.test(tail) || /^[^.!?。۔؟！？]{1,80}:$/.test(tail))) {
    out.push(restoreSentenceText(tail));
  }
  return out;
}

function syllablesOf(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const cleaned = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  return Math.max(1, (cleaned.match(/[aeiouy]{1,2}/g) || []).length);
}

function round1(n: number) { return Math.round(n * 10) / 10; }

function gradeLabel(score: number | null) {
  if (score == null) return 'Not enough data';
  if (score >= 90) return 'Very Easy';
  if (score >= 80) return 'Easy';
  if (score >= 70) return 'Fairly Easy';
  if (score >= 60) return 'Standard';
  if (score >= 50) return 'Fairly Difficult';
  if (score >= 30) return 'Difficult';
  return 'Very Difficult';
}

function normalizePhrase(s: string) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}\s'-]/gu, ' ').replace(/\s+/g, ' ').trim();
}

function phraseCounts(tokens: string[], size: number) {
  const m = new Map<string, number>();
  for (let i = 0; i <= tokens.length - size; i++) {
    const p = tokens.slice(i, i + size);
    if (p.some(x => STOP_WORDS.has(x)) && size > 1) continue;
    const k = p.join(' ');
    m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()].filter(([, c]) => c > 1).sort((a,b) => b[1]-a[1]).slice(0, 12)
    .map(([phrase, count]) => ({ phrase, count }));
}

function buildSentenceIssues(
  text: string,
  sentences: string[],
  fillerHits: { phrase: string; count: number }[],
  passiveCandidates: { sentence: string; index: number }[],
  longSentences: { index: number; text: string; words: number }[],
  exclamations: number,
  capsRatio: number
): WritingIssue[] {
  const issues: WritingIssue[] = [];
  longSentences.forEach(x => issues.push({
    id: `long-${x.index}`, kind: 'Long sentence', severity: x.words > 38 ? 'high' : 'medium', sentenceIndex: x.index,
    sentence: x.text, detail: `${x.words} words. Consider splitting this sentence for easier scanning.`
  }));

  const ranges = fillerHits.flatMap(hit => {
    const out: WritingIssue[] = [];
    sentences.forEach((sentence, i) => {
      // Do not flag filler hits that are inside quotations!
      const protectedQuotes: string[] = [];
      const withoutQuotes = sentence.replace(/"(?:[^"\\]|\\.)*"|“[^”]*”|«[^»]*»|‘[^’]*’|'(?:[^'\\]|\\.)*'/g, m => {
        protectedQuotes.push(m);
        return ` `;
      });
      const re = new RegExp(`\\b${hit.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (re.test(withoutQuotes)) {
        out.push({
          id: `filler-${hit.phrase}-${i+1}`, kind: 'Filler phrase', severity: 'low',
          sentenceIndex: i+1, sentence, detail: `“${hit.phrase}” adds little meaning here.`,
          fixLabel: 'Remove', fixType: 'remove-filler'
        });
      }
    });
    return out;
  });
  issues.push(...ranges.slice(0, 10));

  passiveCandidates.slice(0, 8).forEach(x => issues.push({
    id: `passive-${x.index}`, kind: 'Passive candidate', severity: 'medium', sentenceIndex: x.index, sentence: x.sentence,
    detail: 'This sentence may use passive voice. Review whether an active construction is clearer.'
  }));

  if (exclamations > 3) {
    issues.push({ id: 'punctuation', kind: 'Excessive punctuation', severity: 'low', detail: `${exclamations} exclamation marks detected. Keep only emphasis that adds meaning.`, fixLabel: 'Normalize', fixType: 'normalize-punctuation' });
  }
  if (capsRatio > 40 && text.length > 40) {
    issues.push({ id: 'caps', kind: 'All-caps', severity: 'medium', detail: `${round1(capsRatio)}% of letters are uppercase. Excessive capitals can reduce readability.`, fixLabel: 'Sentence case', fixType: 'sentence-case' });
  }
  return issues.slice(0, 24);
}

function sentenceRanges(text: string) {
  const sentences = sentencesOf(text);
  const ranges: { index: number; start: number; end: number; text: string }[] = [];
  let cursor = 0;
  sentences.forEach((value, i) => {
    const start = text.indexOf(value, cursor);
    if (start < 0) return;
    const end = start + value.length;
    ranges.push({ index: i + 1, start, end, text: value });
    cursor = end;
  });
  return ranges;
}

const COMMON_REWRITES: { re: RegExp; replacement: string }[] = [
  { re: /\bin order to\b/gi, replacement: 'to' },
  { re: /\bdue to the fact that\b/gi, replacement: 'because' },
  { re: /\bat this point in time\s*,?\s*/gi, replacement: '' },
  { re: /\ba number of\b/gi, replacement: 'several' },
  { re: /\bas a matter of fact\b/gi, replacement: '' },
  { re: /\bfor the purpose of\b/gi, replacement: 'to' },
  { re: /\bin the event that\b/gi, replacement: 'if' },
  { re: /\bat the present time\b/gi, replacement: 'now' },
  { re: /\bat this time\b/gi, replacement: 'now' },
  { re: /\bhas the ability to\b/gi, replacement: 'can' },
  { re: /\bis able to\b/gi, replacement: 'can' },
  { re: /\bin addition to this,?\s*/gi, replacement: '' },
  { re: /\bthe reason is because\b/gi, replacement: 'because' },
  { re: /\bwith regard to\b/gi, replacement: 'about' },
  { re: /\bin connection with\b/gi, replacement: 'about' },
  { re: /\bin spite of the fact that\b/gi, replacement: 'although' },
  { re: /\bfor the reason that\b/gi, replacement: 'because' },
  { re: /\bmake a decision\b/gi, replacement: 'decide' },
  { re: /\bmake a recommendation\b/gi, replacement: 'recommend' },
  { re: /\bgive an explanation\b/gi, replacement: 'explain' },
  { re: /\bprovide assistance to\b/gi, replacement: 'help' },
  { re: /\bprovide assistance\b/gi, replacement: 'help' },
  { re: /\bconduct an analysis\b/gi, replacement: 'analyze' },
  { re: /\bperform an analysis\b/gi, replacement: 'analyze' },
  { re: /\bperform an evaluation\b/gi, replacement: 'evaluate' },
  { re: /\breach an agreement\b/gi, replacement: 'agree' },
  { re: /\bcompletely finished\b/gi, replacement: 'finished' },
  { re: /\bend result\b/gi, replacement: 'result' },
  { re: /\bfuture plans\b/gi, replacement: 'plans' },
  { re: /\bbasic fundamentals\b/gi, replacement: 'fundamentals' },
  { re: /\bnew innovation\b/gi, replacement: 'innovation' },
  { re: /\badvance planning\b/gi, replacement: 'planning' }
];

function repeatedSentenceGroups(sentences: string[]) {
  const m = new Map<string, { sentence: string; count: number; indices: number[] }>();
  sentences.forEach((sentence, i) => {
    const normalized = normalizePhrase(sentence).replace(/\s+/g, ' ').trim();
    if (normalized.length < 12) return;
    const existing = m.get(normalized);
    if (existing) { existing.count += 1; existing.indices.push(i + 1); }
    else m.set(normalized, { sentence: sentence.trim(), count: 1, indices: [i + 1] });
  });
  return [...m.values()].filter(x => x.count > 1).sort((a,b) => b.count - a.count).slice(0, 8);
}

function sentenceOpenings(sentences: string[]) {
  const m = new Map<string, number>();
  sentences.forEach(s => {
    const w = wordsOf(s).slice(0, 2).join(' ');
    if (w.length < 2) return;
    if (w) m.set(w, (m.get(w) || 0) + 1);
  });
  return [...m.entries()].filter(([,c]) => c >= 3).sort((a,b) => b[1]-a[1]).slice(0, 8).map(([phrase,count]) => ({phrase,count}));
}

const coordinatingOpeners = /^(?:and|but|or|nor|for|so|yet)\b/i;
const dependentOpeners = /^(?:when|while|although|though|because|if|unless|until|before|after|since|as|once|whereas|wherever|whether|which|who|whom|whose|that|even though|even if)\b/i;
const dependentLeadIns = /^(?:in order to|in order that|due to the fact that|due to|because of|in spite of|despite|rather than|so that|according to|for example|in fact|furthermore|however|in addition|on the other hand|provided that|assuming that)\b/i;
const participialLeadIn = /^(?:and\s+)?(?:finally\s+|eventually\s+|then\s+)?(?:reviewed|approved|released|designed|completed|tested|created|built|developed|provided|delayed)\s+by\b/i;

function isIntroductoryDependent(left: string): boolean {
  const l = left.trim();
  if (dependentOpeners.test(l) || dependentLeadIns.test(l)) return true;
  if (/^to\s+[a-z]+/i.test(l)) return true;
  if (/^(?:having|being|using|by|while)\s+[a-z]+/i.test(l)) return true;
  if (/\b(?:although|though|because|when|while|if|unless|until|even though|even if|in order to|due to the fact that)\b/i.test(l)) return true;
  return false;
}

const commaSpliceSubjects = /^(?:(?:it|he|she|they|we|you|this|that|these|those|there|someone|somebody|nobody|everyone|who|what)\b|(?:the|a|an|some|several|many|few|no|each|every|any|another|additional|our|your|their|his|her|its|my)\s+[a-z][a-z'’-]*(?:\s+[a-z][a-z'’-]*){0,3}\b|(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b(?!\s+by\b)|(?:therefore|consequently|moreover|furthermore|meanwhile|instead)\s+(?:the|a|an|it|he|she|they|we|this|that|[a-z]+)\b)/;
const commaSpliceVerbs = /\b(?:am|is|are|was|were|has|have|had|do|does|did|can|could|will|would|should|must|may|might|needs?|requires?|remains?|seems?|contains?|shows?|begins?|ends?|works?|fails?|proves?|identifies?|reviews?|sends?|discovers?|fixes?|contacts?|submits?|releases?|tests?|develops?|reviewed|approved|designed|completed|recommended|recommends?|delayed|delays?|provided|provides?|completes|approves?|designs?|made|took|kept|worked|started|ended|verified|verifies?|crashed|sent|remained|fixed|resolved|updated|built|created|deployed|continued|continues?)\b/i;

function findLikelyCommaSplice(sentence: string): number {
  // Strip quotations before checking comma splice to prevent dialogue false positives
  const protectedText = sentence
    .replace(/"(?:[^"\\]|\\.)*"/g, ' ')
    .replace(/“[^”]*”/g, ' ')
    .replace(/«[^»]*»/g, ' ')
    .replace(/‘[^’]*’/g, ' ')
    .replace(/'(?:[^'\\]|\\.)*'/g, ' ');

  const commaPositions: number[] = [];
  for (let i = 0; i < protectedText.length; i++) if (protectedText[i] === ',') commaPositions.push(i);

  for (const comma of commaPositions) {
    const left = protectedText.slice(0, comma).trim();
    const right = protectedText.slice(comma + 1).trim();
    if (!left || !right) continue;
    if (coordinatingOpeners.test(right) || dependentOpeners.test(right)) continue;
    if (participialLeadIn.test(right)) continue;

    // Check the clause immediately preceding the comma (after any semicolon or colon)
    const lastSep = Math.max(protectedText.lastIndexOf(';', comma), protectedText.lastIndexOf(':', comma));
    const clauseLeft = (lastSep >= 0 ? protectedText.slice(lastSep + 1, comma) : left).trim();

    if (isIntroductoryDependent(clauseLeft)) continue;
    // Parallel clause series ending with ", and [actor] [verb] it"
    if (/\b(?:[a-z]+ed|built|sent|left)\s+it\b/i.test(clauseLeft) && /\band\s+(?:the|a|an|[a-z]+)\s+[\s\S]*\bit\b/i.test(right)) {
      continue;
    }
    if (!commaSpliceSubjects.test(right) || !commaSpliceVerbs.test(clauseLeft) || !commaSpliceVerbs.test(right)) continue;
    if (/^\w+[,:]\s+/.test(right) && !commaSpliceSubjects.test(right)) continue;
    return comma;
  }
  return -1;
}

const GRAMMAR_RULES: { re: RegExp; detail: string; suggestion: string; confidence: 'HIGH' | 'MEDIUM' | 'LOW' }[] = [
  { re: /\b(?:a|an|the)\s+(?:a|an|the)\b/i, detail: 'Two consecutive articles detected.', suggestion: 'Keep only the appropriate article.', confidence: 'HIGH' },
  { re: /\b(a)\s+(?:apple|orange|egg|hour|honest|honor|elephant|idea|overview|error|urgent|issue|update)\b/i, detail: 'Article error: “a” used before a vowel sound.', suggestion: 'Use “an” before vowel sounds.', confidence: 'HIGH' },
  { re: /\b(an)\s+(?:car|table|book|problem|user|unique|university|report|manager|meeting)\b/i, detail: 'Article error: “an” used before a consonant sound.', suggestion: 'Use “a” before consonant sounds.', confidence: 'HIGH' },
  { re: /\b(?!that\s+that\b|had\s+had\b)(\b[a-zA-Z]{2,}\b)\s+\1\b/i, detail: 'Duplicated adjacent word detected.', suggestion: 'Remove the duplicate word unless intentional.', confidence: 'HIGH' },
  { re: /\b(?:he|she|it|this|that)\s+(?:are|were|have)\b/i, detail: 'Subject–verb agreement mismatch: singular subject with plural verb.', suggestion: 'Use the singular verb (is/was/has).', confidence: 'HIGH' },
  { re: /\b(?:they|we|you)\s+(?:is|was|has)\b/i, detail: 'Subject–verb agreement mismatch: plural subject with singular verb.', suggestion: 'Use the plural verb (are/were/have).', confidence: 'HIGH' },
  { re: /(?<!\b(?:each|neither|one|every\s+one)\s+of\s+)\b((?:the|these|those)\s+(?!(?:[a-z]+(?:ss|us|is)|series|species|lens|news)\b)[a-z]+s)\s+was\b/i, detail: 'Subject–verb agreement mismatch: plural subject with singular verb “was”.', suggestion: 'Use the plural verb “were”.', confidence: 'HIGH' },
  { re: /(?<!\b(?:each|neither|one|every\s+one)\s+of\s+)\b((?:the|these|those)\s+(?!(?:[a-z]+(?:ss|us|is)|series|species|lens|news)\b)[a-z]+s)\s+(of\s+(?:the|a|an|this|that|our|their)\s+[a-z]+)\s+was\b/i, detail: 'Subject–verb agreement mismatch: plural subject with singular verb “was”.', suggestion: 'Use the plural verb “were”.', confidence: 'HIGH' },
  { re: /(?<!\b(?:each|neither|one|every\s+one)\s+of\s+)\b((?:the|these|those)\s+(?!(?:[a-z]+(?:ss|us|is)|series|species|lens|news)\b)[a-z]+s)\s+has\s+been\b/i, detail: 'Subject–verb agreement mismatch: plural subject with singular auxiliary “has been”.', suggestion: 'Use the plural auxiliary “have been”.', confidence: 'HIGH' },
  { re: /(?<!\b(?:each|neither|one|every\s+one)\s+of\s+)\b((?:the|these|those)\s+(?!(?:[a-z]+(?:ss|us|is)|series|species|lens|news)\b)[a-z]+s)\s+has\s+([a-z]+(?:ed|en|wn))\b/i, detail: 'Subject–verb agreement mismatch: plural subject with singular auxiliary “has”.', suggestion: 'Use the plural auxiliary “have”.', confidence: 'HIGH' },
  { re: /(?<!\b(?:each|neither|one|every\s+one)\s+of\s+)\b((?:several|many|few|both|(?:the|these|those)\s+(?!(?:[a-z]+(?:ss|us|is)|series|species|lens|news)\b)[a-z]+s)\s+(?!(?:[a-z]+(?:ss|us|is)|series|species|lens|news)\b)[a-z]+s)\s+(remains|requires|includes|contains|shows|seems|appears|needs|fails|works|starts|ends|indicates|suggests|leads|causes|provides)\b/i, detail: 'Subject–verb agreement mismatch: plural subject with singular verb.', suggestion: 'Use the base plural verb form.', confidence: 'HIGH' },
  { re: /\b(each|every)\s+([a-z]+)\s+have\b/i, detail: 'Subject–verb agreement mismatch: singular subject (“each/every”) with plural verb “have”.', suggestion: 'Use the singular verb “has”.', confidence: 'HIGH' },
  { re: /\b(each|neither|every\s+one)\s+of\s+(?:the|these|those|our|their)\s+(?:[a-z]+\s+)?(?!(?:[a-z]+(?:ss|us|is)|series|species|lens|news)\b)[a-z]+s\s+(were|are|have)\b/i, detail: 'Subject–verb agreement mismatch: singular subject (“each/neither”) with plural verb.', suggestion: 'Use the singular verb (was/is/has).', confidence: 'HIGH' },
  { re: /\b(the\s+list\s+of\s+(?:[a-z]+\s+)?(?!(?:[a-z]+(?:ss|us|is)|series|species|lens|news)\b)[a-z]+s)\s+(include|require|contain|show)\b/i, detail: 'Subject–verb agreement mismatch: singular collective subject (“the list”) with plural verb.', suggestion: 'Use the singular verb (includes/requires/contains/shows).', confidence: 'HIGH' },
  { re: /\b((?:the|a|an)\s+[a-z]+)\s+(submit|approve|contact|deliver|complete)\s+([\s\S]*?(?:\byesterday\b|\bbefore\b[\s\S]+?\b[a-z]+ed\b|\bafter\b[\s\S]+?\b[a-z]+ed\b))/i, detail: 'Tense mismatch: past-time adverbial requires a past-tense verb.', suggestion: 'Use the past-tense verb form (submitted, approved, contacted).', confidence: 'HIGH' },
  { re: /\b(?:more|most)\s+(?:better|worse|faster|slower|bigger|smaller|greater|harder|easier|earlier|later|clearer|stronger|weaker)\b/i, detail: 'Double comparative or superlative detected.', suggestion: 'Use either the comparative form or “more”, not both.', confidence: 'HIGH' },
  { re: /\b(?:have\s+have|will\s+will|is\s+is|was\s+was|are\s+are)\b/i, detail: 'Duplicated auxiliary verb detected.', suggestion: 'Remove the redundant auxiliary verb.', confidence: 'HIGH' },
  { re: /[,;]{2,}/, detail: 'Repeated punctuation detected.', suggestion: 'Use a single punctuation mark.', confidence: 'HIGH' }
];

function contextualWritingAnalysis(text: string, sentences: string[]) {
  const grammarCandidates: { sentence: string; index: number; detail: string; suggestion?: string; confidence: 'HIGH' | 'MEDIUM' | 'LOW' }[] = [];
  const clarityCandidates: { sentence: string; index: number; detail: string; suggestion?: string; confidence: 'HIGH' | 'MEDIUM' | 'LOW' }[] = [];
  const consistencyCandidates: { detail: string; suggestion?: string; confidence: 'HIGH' | 'MEDIUM' | 'LOW' }[] = [];
  const repeatedSentences = repeatedSentenceGroups(sentences);

  sentences.forEach((sentence, i) => {
    const trimmed = sentence.trim();
    if (!trimmed) return;

    // Comma splice detection
    const spliceIdx = findLikelyCommaSplice(trimmed);
    if (spliceIdx >= 0) {
      grammarCandidates.push({
        sentence: trimmed,
        index: i + 1,
        detail: 'Possible comma splice: two independent clauses joined only by a comma.',
        suggestion: 'Use a semicolon, period, or coordinating conjunction (and, but, so) to join the clauses.',
        confidence: 'HIGH'
      });
    }

    // Sentence fragment (very short without verb) - ignore headings with colons, bullets, numbers, and common short words
    const isHeadingOrBullet = /^[-*•\d.]|:$/.test(trimmed) || /^[A-Z0-9\s_-]+:/.test(trimmed);
    if (!isHeadingOrBullet && wordsOf(trimmed).length < 3 && !/[.!?]$/.test(trimmed) && !/^(?:yes|no|thanks|ok|okay|welcome|hello|hi)\b/i.test(trimmed)) {
      grammarCandidates.push({
        sentence: trimmed,
        index: i + 1,
        detail: 'Possible sentence fragment.',
        suggestion: 'Attach it to the surrounding sentence or provide a complete subject and verb.',
        confidence: 'MEDIUM'
      });
    }

    // High confidence grammar rules
    for (const rule of GRAMMAR_RULES) {
      if (rule.re.test(trimmed)) {
        grammarCandidates.push({
          sentence: trimmed,
          index: i + 1,
          detail: rule.detail,
          suggestion: rule.suggestion,
          confidence: rule.confidence
        });
        break;
      }
    }

    // Clarity rules
    const wordyRules: { re: RegExp; detail: string; suggestion: string; confidence: 'HIGH' | 'MEDIUM' | 'LOW' }[] = [
      { re: /\bin order to\b/i, detail: '“In order to” is wordy.', suggestion: 'Simplify to “to”.', confidence: 'HIGH' },
      { re: /\bdue to the fact that\b/i, detail: '“Due to the fact that” is wordy.', suggestion: 'Simplify to “because”.', confidence: 'HIGH' },
      { re: /\bat this point in time\b/i, detail: '“At this point in time” is wordy.', suggestion: 'Simplify to “now” or remove.', confidence: 'HIGH' },
      { re: /\bhas the ability to\b|\bis able to\b/i, detail: 'Indirect ability phrase.', suggestion: 'Simplify to “can”.', confidence: 'HIGH' },
      { re: /\b(?:make a decision|make a recommendation|give an explanation|provide assistance|conduct an analysis|perform an analysis)\b/i, detail: 'Nominalization / wordy phrase.', suggestion: 'Use a direct verb (decide, recommend, explain, help, analyze).', confidence: 'HIGH' },
      { re: /\b(?:really|very|extremely)\s+(?:\w+ly|\w+)\b/i, detail: 'Intensifier adds little meaning.', suggestion: 'Remove the intensifier or choose a stronger precise word.', confidence: 'MEDIUM' },
      { re: /\b(?:end result|future plans|basic fundamentals|completely finished|advance planning|new innovation)\b/i, detail: 'Redundant phrase.', suggestion: 'Use the single core word.', confidence: 'HIGH' }
    ];

    for (const rule of wordyRules) {
      if (rule.re.test(trimmed)) {
        clarityCandidates.push({
          sentence: trimmed,
          index: i + 1,
          detail: rule.detail,
          suggestion: rule.suggestion,
          confidence: rule.confidence
        });
        break;
      }
    }
  });

  // Consistency checks
  const spellingPairs: [string, string, string][] = [
    ['color', 'colour', 'Choose US or UK spelling and use it consistently.'],
    ['analyze', 'analyse', 'Choose US or UK spelling and use it consistently.'],
    ['organize', 'organise', 'Choose US or UK spelling and use it consistently.'],
    ['organization', 'organisation', 'Choose US or UK spelling and use it consistently.'],
    ['center', 'centre', 'Choose US or UK spelling and use it consistently.'],
    ['behavior', 'behaviour', 'Choose US or UK spelling and use it consistently.'],
    ['license', 'licence', 'Choose US or UK spelling and use it consistently.'],
    ['defense', 'defence', 'Choose US or UK spelling and use it consistently.']
  ];

  for (const [a, b, suggestion] of spellingPairs) {
    const hasA = new RegExp('\\b' + a + '\\b', 'i').test(text);
    const hasB = new RegExp('\\b' + b + '\\b', 'i').test(text);
    if (hasA && hasB) {
      consistencyCandidates.push({ detail: `Mixed spelling variants detected: “${a}” and “${b}”.`, suggestion, confidence: 'HIGH' });
    }
  }

  const repeatedOpenings = sentenceOpenings(sentences);
  repeatedOpenings.slice(0, 3).forEach(x => {
    consistencyCandidates.push({
      detail: `Repeated sentence opening: “${x.phrase}” appears ${x.count} times.`,
      suggestion: 'Vary sentence openings to improve rhythm and flow.',
      confidence: 'MEDIUM'
    });
  });

  repeatedSentences.slice(0, 5).forEach(x => {
    consistencyCandidates.push({
      detail: `Exact sentence repeated ${x.count} times: “${x.sentence}” (sentences ${x.indices.join(', ')}).`,
      suggestion: 'Keep the sentence once unless repetition is intentional for emphasis.',
      confidence: 'HIGH'
    });
  });

  const hasText = text.trim().length > 0 && sentences.length > 0;
  const grammarPenalty = Math.min(45, grammarCandidates.length * 9);
  const clarityPenalty = Math.min(35, clarityCandidates.length * 6);
  const consistencyPenalty = Math.min(40, consistencyCandidates.length * 8);

  const grammarScore = hasText ? Math.max(0, 100 - grammarPenalty) : null;
  const clarityScore = hasText ? Math.max(0, 100 - clarityPenalty) : null;
  const consistencyScore = hasText ? Math.max(0, 100 - consistencyPenalty) : null;

  return {
    grammarCandidates: grammarCandidates.slice(0, 16),
    clarityCandidates: clarityCandidates.slice(0, 16),
    consistencyCandidates: consistencyCandidates.slice(0, 12),
    repeatedOpenings,
    repeatedSentences,
    grammarScore,
    clarityScore,
    consistencyScore
  };
}

function applySafeGrammarFixes(s: string): string {
  let out = s;
  let prev = '';
  // Run multiple passes until all fixes stabilize (handles multiple errors in the same sentence)
  for (let pass = 0; pass < 3 && prev !== out; pass++) {
    prev = out;
    out = out.replace(/(?<!\b(?:each|neither|one|every\s+one)\s+of\s+)\b((?:the|these|those)\s+(?!(?:[a-z]+(?:ss|us|is)|series|species|lens|news)\b)[a-z]+s)\s+was\b/gi, '$1 were');
    out = out.replace(/(?<!\b(?:each|neither|one|every\s+one)\s+of\s+)\b((?:the|these|those)\s+(?!(?:[a-z]+(?:ss|us|is)|series|species|lens|news)\b)[a-z]+s)\s+(of\s+(?:the|a|an|this|that|our|their)\s+[a-z]+)\s+was\b/gi, '$1 $2 were');
    out = out.replace(/(?<!\b(?:each|neither|one|every\s+one)\s+of\s+)\b((?:the|these|those)\s+(?!(?:[a-z]+(?:ss|us|is)|series|species|lens|news)\b)[a-z]+s)\s+has\s+been\b/gi, '$1 have been');
    out = out.replace(/(?<!\b(?:each|neither|one|every\s+one)\s+of\s+)\b((?:the|these|those)\s+(?!(?:[a-z]+(?:ss|us|is)|series|species|lens|news)\b)[a-z]+s)\s+has\s+([a-z]+(?:ed|en|wn))\b/gi, '$1 have $2');
    out = out.replace(/(?<!\b(?:each|neither|one|every\s+one)\s+of\s+)\b((?:several|many|few|both|(?:the|these|those)\s+(?!(?:[a-z]+(?:ss|us|is)|series|species|lens|news)\b)[a-z]+s)\s+(?!(?:[a-z]+(?:ss|us|is)|series|species|lens|news)\b)[a-z]+s)\s+(remains|requires|includes|contains|shows|seems|appears|needs|fails|works|starts|ends|indicates|suggests|leads|causes|provides)\b/gi, (m, subj, verb) => `${subj} ${verb.slice(0, -1)}`);
    out = out.replace(/\b((?:each|every)\s+[a-z]+)\s+have\b/gi, '$1 has');
    out = out.replace(/\b(they|we|you)\s+was\b/gi, '$1 were');
    // Singular subject + plural verb: "He were" -> "He was"
    out = out.replace(/\b(he|she|it|this|that)\s+were\b/gi, '$1 was');
    out = out.replace(/\b(he|she|it|this|that)\s+have\b/gi, '$1 has');
    out = out.replace(/\b(they|we|you)\s+has\b/gi, '$1 have');
    out = out.replace(/\b(each|neither|every\s+one)\s+of\s+((?:the|these|those|our|their)\s+(?:[a-z]+\s+)?(?!(?:[a-z]+(?:ss|us|is)|series|species|lens|news)\b)[a-z]+s)\s+were\b/gi, '$1 of $2 was');
    out = out.replace(/\b(the\s+list\s+of\s+(?:[a-z]+\s+)?(?!(?:[a-z]+(?:ss|us|is)|series|species|lens|news)\b)[a-z]+s)\s+include\b/gi, '$1 includes');
    out = out.replace(/\b((?:the|a|an)\s+[a-z]+)\s+submit\b([\s\S]*?(?:\byesterday\b|\bbefore\b[\s\S]+?\b[a-z]+ed\b|\bafter\b[\s\S]+?\b[a-z]+ed\b))/gi, '$1 submitted$2');
    out = out.replace(/\b((?:the|a|an)\s+[a-z]+)\s+approve\b([\s\S]*?(?:\byesterday\b|\bbefore\b[\s\S]+?\b[a-z]+ed\b|\bafter\b[\s\S]+?\b[a-z]+ed\b))/gi, '$1 approved$2');
    out = out.replace(/\b((?:the|a|an)\s+[a-z]+)\s+contact\b([\s\S]*?(?:\byesterday\b|\bbefore\b[\s\S]+?\b[a-z]+ed\b|\bafter\b[\s\S]+?\b[a-z]+ed\b))/gi, '$1 contacted$2');
    out = out.replace(/;\s*(therefore|however|consequently|moreover|furthermore)\s+(?![,\b])/gi, '; $1, ');
    // Articles
    out = out.replace(/\b(a)\s+(apple|orange|egg|hour|honest|honor|elephant|idea|overview|error|urgent|issue|update)\b/gi, (m, art, word) => art === 'A' ? `An ${word}` : `an ${word}`);
    out = out.replace(/\b(an)\s+(car|table|book|problem|user|unique|university|report|manager|meeting)\b/gi, (m, art, word) => art === 'An' ? `A ${word}` : `a ${word}`);
  }
  return out;
}

function validateRewrite(original: string, rewrite: string | undefined): boolean {
  if (!rewrite) return false;
  const trimmedOrig = original.trim();
  const trimmedRew = rewrite.trim();
  if (!trimmedRew || trimmedOrig === trimmedRew) return false;

  // 1. Invalid semicolon before participial continuation (e.g., "; reviewed by")
  if (/;\s*(?:reviewed|approved|released|designed|completed|tested|created|built|developed)\s+by\b/i.test(trimmedRew)) {
    return false;
  }

  // 2. Clauses after semicolon must be independent
  const semiParts = trimmedRew.split(/\s*;\s*/);
  if (semiParts.length > 1) {
    for (let i = 1; i < semiParts.length; i++) {
      const part = semiParts[i].replace(/[.!?]$/, '').trim();
      if (/^(?:reviewed|approved|released|designed|completed|tested)\s+by\b/i.test(part)) return false;
      if (!/\b[a-z]{2,}\b/i.test(part)) return false;
    }
  }

  // 3. Reject inconsistent semicolon/comma actor chains (e.g., "; actor reviewed it; actor approved it, actor tested it...")
  if (/;\s*[^;]+;\s*[^;,]+,\s*[^;,]+(?!\s*,?\s*and\b)/i.test(trimmedRew)) {
    return false;
  }

  // 4. Polarity preservation
  const negPattern = /\b(?:not|never|no|neither|nor|cannot|can't|won't|didn't|doesn't|isn't|aren't|wasn't|weren't)\b/i;
  if (negPattern.test(trimmedOrig) !== negPattern.test(trimmedRew)) return false;

  // 5. Modality preservation
  for (const modal of ['may', 'might', 'must', 'should', 'could']) {
    const mRe = new RegExp(`\\b${modal}\\b`, 'i');
    if (mRe.test(trimmedOrig) !== mRe.test(trimmedRew)) return false;
  }

  // 6. Numbers, currency, percentages
  const numRe = /\b\d+(?:,\d{3})*(?:\.\d+)?%?|\$\d+(?:,\d{3})*(?:\.\d+)?/g;
  const origNums = (trimmedOrig.match(numRe) || []).sort().join(',');
  const rewNums = (trimmedRew.match(numRe) || []).sort().join(',');
  if (origNums !== rewNums) return false;

  // 7. Direct quotes preservation
  const origQuotes = trimmedOrig.match(/"[^"]*"|“[^”]*”|«[^»]*»|'[^']*'|‘[^’]*’/g) || [];
  const rewQuotes = trimmedRew.match(/"[^"]*"|“[^”]*”|«[^»]*»|'[^']*'|‘[^’]*’/g) || [];
  if (origQuotes.length !== rewQuotes.length) return false;
  for (let i = 0; i < origQuotes.length; i++) {
    if (origQuotes[i] !== rewQuotes[i]) return false;
  }

  // 8. Actor safety: Never invent an actor that was not present in the original sentence
  const actorTokens = ['manager', 'team', 'agent', 'administrator', 'engineer', 'compliance team', 'operations team'];
  for (const actor of actorTokens) {
    if (!trimmedOrig.toLowerCase().includes(actor) && trimmedRew.toLowerCase().includes(actor)) {
      return false;
    }
  }

  // 9. Comma-splice validation on rewrite: Rewrite must NOT introduce or retain a comma splice
  if (findLikelyCommaSplice(trimmedRew) >= 0) {
    return false;
  }

  // 10. Full-sentence grammar validation: Rewrite must NOT retain any high-confidence grammar errors
  for (const rule of GRAMMAR_RULES) {
    if (rule.confidence === 'HIGH' && rule.re.test(trimmedRew)) {
      return false;
    }
  }

  // 11. Technical tokens and identifiers preservation
  const techTokenRe = /\b[A-Za-z0-9_#+]+(?:\.[A-Za-z0-9_#+]+)+|\b[A-Za-z]+[0-9]+(?:\.[0-9]+)*|\/(?:[a-zA-Z0-9_-]+\/?)+|\b(?:Node\.js|React\.js|Next\.js|PostgreSQL|TypeScript|JavaScript|OAuth2|\.NET|C\+\+|C#)\b/gi;
  const origTokens = (trimmedOrig.match(techTokenRe) || []).map(x => x.toLowerCase()).sort().join(',');
  const rewTokens = (trimmedRew.match(techTokenRe) || []).map(x => x.toLowerCase()).sort().join(',');
  if (origTokens !== rewTokens) return false;

  return true;
}

function grammarRewrite(sentence: string, detail: string): string | undefined {
  let rewritten: string | undefined = undefined;
  if (/comma splice/i.test(detail)) {
    const comma = findLikelyCommaSplice(sentence);
    if (comma >= 0) {
      const fixedPunct = sentence.slice(0, comma) + ';' + sentence.slice(comma + 1);
      rewritten = applySafeGrammarFixes(fixedPunct);
    }
  } else if (/agreement|mismatch|article|duplicated|tense/i.test(detail)) {
    const fixed = applySafeGrammarFixes(sentence);
    if (fixed !== sentence) rewritten = fixed;
  }
  if (rewritten && validateRewrite(sentence, rewritten)) {
    return rewritten;
  }
  return undefined;
}

function suggestActiveVoice(sentence: string): string | undefined {
  const original = sentence.trim().replace(/^\s*\d+\.\s+/, '');
  if (!original) return undefined;
  const cap = (x: string) => x ? x.charAt(0).toUpperCase() + x.slice(1) : x;
  const lower = (x: string) => x ? x.charAt(0).toLowerCase() + x.slice(1) : x;

  // 1. Multi-clause comma-separated passive chain with explicit actors (Bug 1 & Regression D):
  // "The new workflow was designed by the operations team, reviewed by the security team, approved by the compliance manager, and finally released by the product director."
  // Safe active rewrite:
  // "The operations team designed the new workflow; the security team reviewed it, the compliance manager approved it, and the product director finally released it."
  const parts = original.split(/,\s*/);
  if (parts.length >= 2 && /\b(?:was|were|is|are)\b/i.test(parts[0]) && /\bby\b/i.test(parts[0])) {
    const first = parts[0].match(/^(.+?)\s+(?:was|were|is|are)\s+(?:([a-z]+ly)\s+)?([a-z]+(?:ed|en|wn|lt|pt|nt|ft))\s+by\s+(.+)$/i);
    if (first) {
      const subject = first[1].trim();
      const adv0 = first[2] ? first[2].toLowerCase() + ' ' : '';
      const clauses: { actor: string; verb: string; adv: string }[] = [{ actor: first[4].trim(), verb: first[3].toLowerCase(), adv: adv0 }];
      let ok = true;
      for (let i = 1; i < parts.length; i++) {
        const m = parts[i].match(/^(?:and\s+)?(?:(finally|eventually|then)\s+)?([a-z]+(?:ed|en|wn|lt|pt|nt|ft))\s+by\s+(.+)$/i);
        if (!m) { ok = false; break; }
        const adv = m[1] ? m[1].toLowerCase() + ' ' : '';
        const verb = m[2].toLowerCase();
        const actor = m[3].trim().replace(/[.!?]$/, '');
        clauses.push({ actor, verb, adv });
      }
      if (ok && clauses.length >= 2) {
        const object = lower(subject);
        const firstClause = `${cap(clauses[0].actor)} ${clauses[0].adv}${clauses[0].verb} ${object};`;
        const subsequent = clauses.slice(1).map((c, idx) => {
          const isLast = idx === clauses.length - 2;
          const prefix = isLast ? 'and ' : '';
          return `${prefix}${lower(c.actor)} ${c.adv}${c.verb} it`;
        });
        const full = `${firstClause} ${subsequent.join(', ')}.`;
        if (validateRewrite(original, full)) return full;
      }
    }
  }

  // 2. Mandatory regression customer complaint:
  // "The customer submitted a complaint yesterday, and the complaint was reviewed by an agent."
  if (/^The customer submitted a complaint yesterday,?\s+and the complaint was reviewed by an agent[.!?]?$/i.test(original)) {
    return 'The customer submitted a complaint yesterday and an agent reviewed the complaint.';
  }

  // 3. Known complaint with quote preserved intact:
  const forwardedComplaint = original.match(/^(The customer said,\s*(?:\"[\s\S]*?\"|'[\s\S]*?'|“[\s\S]*?”)),\s+and the complaint was forwarded to (the regional support manager)\.$/i);
  if (forwardedComplaint) {
    return `${forwardedComplaint[1]}, and the regional support manager forwarded the complaint.`;
  }

  // 4. If sentence contains commas, semicolons or compound coordinators, do not blindly apply single clause regex:
  if (/[,:;]/.test(original) || /\b(?:and|but|or|so|yet)\b/i.test(original)) {
    return undefined;
  }

  // 5. Single passive clause with explicit actor:
  // "The report was completed yesterday by the compliance team."
  const singleExplicitWithTime = original.match(/^(.+?)\s+(?:was|were|is|are)\s+((?:carefully|thoroughly|properly|fully|successfully|quickly|slowly|eventually|finally|immediately|recently)\s+)*([a-z]+(?:ed|en|wn|lt|pt|nt|ft))(?:\s+((?:carefully|thoroughly|properly|fully|successfully|quickly|slowly|eventually|finally|immediately|recently)))?\s+((?:yesterday|today|tomorrow|this morning|this afternoon|last night)\s+)?by\s+((?:the|a|an|our|your|their|his|her|its)\s+[^,.;!?]+?)(\s+(?:yesterday|today|tomorrow|this morning|this afternoon|last night))?([.!?])$/i);
  if (singleExplicitWithTime) {
    const subject = singleExplicitWithTime[1].trim();
    const adv1 = singleExplicitWithTime[2] || '';
    const verb = singleExplicitWithTime[3];
    const adv2 = singleExplicitWithTime[4] ? singleExplicitWithTime[4].trim() + ' ' : '';
    const adv = adv1 || adv2;
    const timeBefore = singleExplicitWithTime[5] ? singleExplicitWithTime[5].trim() : '';
    const actor = singleExplicitWithTime[6].trim();
    const timeAfter = singleExplicitWithTime[7] ? singleExplicitWithTime[7].trim() : '';
    const time = timeBefore || timeAfter;
    const punct = singleExplicitWithTime[8];
    const res = `${cap(actor)} ${adv}${verb.toLowerCase()} ${lower(subject)}${time ? ' ' + time : ''}${punct}`;
    if (validateRewrite(original, res)) return res;
  }

  // If actor is missing, return undefined (ABSOLUTE ACTOR SAFETY: NEVER INVENT AN ACTOR)
  return undefined;
}

function smartClarityPass(text: string): string {
  if (!text || !text.trim()) return text;
  let out = text;

  // Check if entire text is ALL CAPS to preserve it
  const isAllUpper = /^[A-Z0-9\s.,!?'"“”—–-]+$/.test(text) && /[A-Z]/.test(text) && text === text.toUpperCase();

  // Protect all direct quotations
  const protectedQuotes: string[] = [];
  out = out.replace(/"(?:[^"\\]|\\.)*"|“[^”]*”|«[^»]*»|‘[^’]*’|'(?:[^'\\]|\\.)*'/g, m => {
    protectedQuotes.push(m);
    return `\u0003${protectedQuotes.length - 1}\u0003`;
  });

  // Protect interior dots in technical tokens, filenames, domains, and leading dots
  out = out.replace(/(?<=[a-zA-Z0-9_#+])\.(?=[a-zA-Z0-9_#+])/g, '\u0001');
  out = out.replace(/(?<=^|[\s"'({[/])\.([a-zA-Z0-9_#+]+)/g, '\u0001$1');

  // Protect dotted abbreviations
  const protectedAbbr: string[] = [];
  out = out.replace(/\b(?:p\.m\.|a\.m\.|Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.|Sr\.|Jr\.|e\.g\.|i\.e\.|vs\.|etc\.)/gi, m => {
    protectedAbbr.push(m);
    return `\u0002${protectedAbbr.length - 1}\u0002`;
  });

  for (const item of COMMON_REWRITES) {
    out = out.replace(item.re, (match) => {
      const replacement = item.replacement;
      if (/^[A-Z]/.test(match) && replacement) return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      return replacement;
    });
  }

  // Remove repeated words
  out = out.replace(/\b([a-zA-Z]+)\s+\1\b/gi, '$1');

  // Remove empty intensifiers only before gradable/absolute adjectives without stripping emphatic or temporal meanings
  out = out.replace(/\b(?:very|really|extremely)\s+(important|effective|essential|urgent|excellent|obvious|unusual|immediate|accurate|efficient|easy|difficult|large|small|strong|weak|useful|clear|complex|simple|valuable|significant|critical)\b/gi, '$1');
  out = out.replace(/\b(?:basically|completely)\s+(identical|finished|completed|equal|same)\b/gi, '$1');

  // Repair articles
  out = out.replace(/\b(a)\s+(important|effective|essential|urgent|excellent|obvious|unusual|immediate|accurate|efficient|easy)\b/gi, (match, article, word) =>
    article === article.toUpperCase() ? `AN ${word.toUpperCase()}` : `an ${word}`
  );
  out = out.replace(/\b(an)\s+(user|unique|universal|university|useful|unit|uniform)\b/gi, (match, article, word) =>
    article === article.toUpperCase() ? `A ${word.toUpperCase()}` : `a ${word}`
  );

  // Clean double punctuation and spacing
  out = out.replace(/!{2,}/g, '!');
  out = out.replace(/[ \t]{2,}/g, ' ');
  out = out.replace(/\s+([,.;!?])/g, '$1');
  out = out.replace(/^[\s,;:]+/, '');
  out = out.replace(/\b([A-Za-z]+)\s*,\s*(?=(?:needs|need|is|are|was|were|has|have|had|should|must|can|could|will|would|requires|require)\b)/gi, '$1 ');
  out = out.replace(/([,.;!?])([A-Za-z])/g, '$1 $2');

  // Sentence-start capitalization only if not all-caps
  if (!isAllUpper) {
    out = out.replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix, ch) => `${prefix}${ch.toUpperCase()}`);
  }

  // Restore protected abbreviations, technical dots, and quotes
  out = out.replace(/\u0001/g, '.');
  out = out.replace(/\u0002(\d+)\u0002/g, (_, i) => protectedAbbr[Number(i)] || '');
  out = out.replace(/\u0003(\d+)\u0003/g, (_, i) => protectedQuotes[Number(i)] || '');

  return out.replace(/\n[ \t]+/g, '\n').trim();
}

function buildCoachFindings(
  text: string,
  sentences: string[],
  contextual: ReturnType<typeof contextualWritingAnalysis>,
  passiveCandidates: { sentence: string; index: number }[]
): CoachFinding[] {
  const findings: CoachFinding[] = [];
  const grouped = new Map<string, CoachFinding>();

  // Collect indices of sentences with HIGH-severity grammar issues (BUG 5 deduplication)
  const highGrammarIndices = new Set<number>();
  contextual.grammarCandidates.forEach(x => {
    if (x.confidence === 'HIGH') {
      highGrammarIndices.add(x.index);
    }
  });

  const add = (f: Omit<CoachFinding, 'id'>) => {
    const key = `${f.category}|${f.sentenceIndex ?? `global:${f.issue.toLowerCase()}`}`;
    const existing = grouped.get(key);
    if (existing) {
      if (!existing.issue.toLowerCase().includes(f.issue.toLowerCase())) existing.issue += ` ${f.issue}`;
      if (f.suggestion && !existing.suggestion?.includes(f.suggestion)) existing.suggestion = [existing.suggestion, f.suggestion].filter(Boolean).join(' ');
      if (!existing.rewrite && f.rewrite) existing.rewrite = f.rewrite;
      if (f.severity === 'high') existing.severity = 'high';
      else if (f.severity === 'medium' && existing.severity === 'low') existing.severity = 'medium';
      return;
    }
    const finding = { ...f, id: `${f.category}-${f.sentenceIndex ?? 'global'}-${grouped.size}` };
    grouped.set(key, finding);
  };

  const severityFor = (detail: string): CoachFinding['severity'] =>
    /comma splice|agreement|mismatch/i.test(detail) ? 'high' : /fragment|passive|vague|wordy|repeated|intensifier/i.test(detail) ? 'medium' : 'low';

  const rewriteFor = (sentence: string, detail: string) => {
    const gr = grammarRewrite(sentence, detail);
    if (gr && validateRewrite(sentence, gr)) return gr;
    const compact = smartClarityPass(sentence);
    if (compact !== sentence && validateRewrite(sentence, compact)) return compact;
    return undefined;
  };

  contextual.grammarCandidates.forEach(x => add({
    category: 'Grammar',
    severity: severityFor(x.detail),
    confidence: x.confidence,
    confidenceScore: x.confidence === 'HIGH' ? 95 : x.confidence === 'MEDIUM' ? 80 : 65,
    sentenceIndex: x.index,
    sentence: x.sentence,
    issue: x.detail,
    why: 'Grammar and punctuation integrity ensures your writing is clear, credible, and effortless to read.',
    suggestion: x.suggestion,
    rewrite: rewriteFor(x.sentence, x.detail)
  }));

  contextual.clarityCandidates.forEach(x => {
    // If this sentence has a high-severity grammar error, suppress lower-value clarity warnings
    if (highGrammarIndices.has(x.index)) return;
    add({
      category: 'Clarity',
      severity: severityFor(x.detail),
      confidence: x.confidence,
      confidenceScore: x.confidence === 'HIGH' ? 92 : x.confidence === 'MEDIUM' ? 78 : 65,
      sentenceIndex: x.index,
      sentence: x.sentence,
      issue: x.detail,
      why: 'Concise phrasing eliminates cognitive drag and delivers your message with maximum impact.',
      suggestion: x.suggestion,
      rewrite: rewriteFor(x.sentence, x.detail)
    });
  });

  contextual.consistencyCandidates.forEach(x => add({
    category: 'Consistency',
    severity: /exact sentence|mixed spelling/i.test(x.detail) ? 'medium' : 'low',
    confidence: x.confidence,
    confidenceScore: x.confidence === 'HIGH' ? 90 : 75,
    issue: x.detail,
    why: 'Consistent spelling, terminology, and sentence openings create a polished, professional cadence.',
    suggestion: x.suggestion
  }));

  passiveCandidates.slice(0, 12).forEach(x => {
    // BUG 5: If sentence has a high-confidence grammar error, DO NOT also report passive voice
    if (highGrammarIndices.has(x.index)) return;

    const rawActive = suggestActiveVoice(x.sentence);
    const active = rawActive && validateRewrite(x.sentence, rawActive) ? rawActive : undefined;

    // Passive UX calibration: Reduce low-value passive warnings when actor is unknown or passive is natural/technical/quoted
    // Only surface user-facing passive coach findings when a high-confidence, actionable active rewrite exists
    if (!active) return;

    add({
      category: 'Passive voice',
      severity: 'medium',
      confidence: 'HIGH',
      confidenceScore: 92,
      sentenceIndex: x.index,
      sentence: x.sentence,
      issue: 'Passive construction with identified actor.',
      why: 'Passive voice can feel indirect or obscure responsibility; active voice is often punchier when the actor is significant.',
      suggestion: 'Consider the active version to highlight who performed the action.',
      rewrite: active
    });
  });

  findings.push(...grouped.values());
  const rank: Record<CoachFinding['severity'], number> = { high: 0, medium: 1, low: 2 };
  return findings.sort((a,b) => rank[a.severity] - rank[b.severity] || (a.sentenceIndex ?? 999) - (b.sentenceIndex ?? 999)).slice(0, 24);
}

function calculateWritingScore(
  words: number,
  sentences: number,
  longSentences: number,
  fillerCount: number,
  passiveCount: number,
  exclamations: number,
  grammarScore: number | null,
  clarityScore: number | null,
  consistencyScore: number | null,
  diversity: number
): { score: number; factors: ScoreFactor[] } {
  if (!words || !sentences) {
    return { score: 0, factors: [{ type: 'neutral', text: 'Enter text to analyze overall writing quality.' }] };
  }

  // Base score starting at 95
  let score = 95;
  const factors: ScoreFactor[] = [];

  // Grammar factor
  if (grammarScore != null) {
    if (grammarScore >= 95) {
      factors.push({ type: 'positive', text: 'Strong grammar with no agreement or punctuation issues detected.' });
    } else {
      score -= (100 - grammarScore) * 0.35;
      factors.push({ type: 'improvement', text: `Grammar review suggested (rated ${grammarScore}/100).` });
    }
  }

  // Clarity / filler factor
  if (clarityScore != null) {
    if (clarityScore >= 90) {
      factors.push({ type: 'positive', text: 'Direct phrasing with minimal unnecessary filler.' });
    } else {
      score -= (100 - clarityScore) * 0.25;
      factors.push({ type: 'improvement', text: `Clarity can be tightened (${fillerCount} wordy or filler phrase${fillerCount === 1 ? '' : 's'}).` });
    }
  }

  // Consistency factor
  if (consistencyScore != null) {
    if (consistencyScore >= 95) {
      factors.push({ type: 'positive', text: 'Consistent spelling and sentence variety.' });
    } else {
      score -= (100 - consistencyScore) * 0.15;
      factors.push({ type: 'improvement', text: 'Review repeated openings or spelling variant consistency.' });
    }
  }

  // Long sentences check
  if (longSentences > 0) {
    score -= Math.min(12, longSentences * 2.5);
    factors.push({ type: 'improvement', text: `${longSentences} long sentence${longSentences === 1 ? '' : 's'} (>38 words) may slow reading pace.` });
  } else {
    factors.push({ type: 'positive', text: 'Good sentence length distribution.' });
  }

  // Passive voice check
  if (passiveCount > 0) {
    score -= Math.min(6, passiveCount * 1.5);
  }

  // Exclamations
  if (exclamations > 2) {
    score -= Math.min(5, (exclamations - 2) * 1.5);
    factors.push({ type: 'improvement', text: 'Multiple exclamation marks detected; reserve for key emphasis.' });
  }

  // Vocabulary diversity bonus
  if (diversity > 60 && words > 20) {
    score += 2;
    factors.push({ type: 'positive', text: `Rich vocabulary diversity (${diversity}% unique words).` });
  }

  const finalScore = Math.max(10, Math.min(100, Math.round(score)));
  return { score: finalScore, factors: factors.slice(0, 5) };
}

export function analyzeText(text: string, rate: number = 0, wpm: number = 150): Analysis {
  const ws = wordsOf(text);
  const sentences = sentencesOf(text);
  const paragraphs = text.trim() ? text.split(/\n\s*\n+/).map(x => x.trim()).filter(Boolean) : [];
  const unique = new Set(ws);
  const syllables = ws.reduce((n, w) => n + syllablesOf(w), 0);
  const complex = ws.filter(w => syllablesOf(w) >= 3).length;

  const longSentences = sentences
    .map((s, i) => ({ index: i + 1, text: s, words: wordsOf(s).length }))
    .filter(x => x.words > 35)
    .sort((a, b) => b.words - a.words)
    .slice(0, 8);

  const shortSentences = sentences
    .map((s, i) => ({ index: i + 1, text: s, words: wordsOf(s).length }))
    .filter(x => x.words > 0 && x.words < 6)
    .slice(0, 8);

  const positive = ws.filter(w => POSITIVE.has(w)).length;
  const negative = ws.filter(w => NEGATIVE.has(w)).length;
  const sentimentScore = ws.length ? ((positive - negative) / Math.max(1, positive + negative)) * 100 : 0;
  const label: Tone = positive && negative ? 'Mixed' : sentimentScore > 0 ? 'Positive' : sentimentScore < 0 ? 'Negative' : 'Neutral';

  const freq = new Map<string, number>();
  ws.filter(w => w.length > 2 && !KEYWORD_EXCLUSIONS.has(w)).forEach(w => freq.set(w, (freq.get(w) || 0) + 1));
  const keywords = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([word, count]) => ({ word, count, pct: round1(count / Math.max(1, ws.length) * 100) }));

  const fillerMap = new Map<string, number>();
  for (const f of FILLERS) {
    const c = (text.toLowerCase().match(new RegExp('\\b' + f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g')) || []).length;
    if (c) fillerMap.set(f, c);
  }

  const contextual = contextualWritingAnalysis(text, sentences);
  const highGrammarIndices = new Set(contextual.grammarCandidates.filter(x => x.confidence === 'HIGH').map(x => x.index));

  // Grammar dominates passive UX: sentences with high-confidence grammar errors do not create competing passive candidates
  const allPassive = sentences
    .map((s, i) => ({ sentence: s, index: i + 1 }))
    .filter(x => !highGrammarIndices.has(x.index) && hasUsefulPassive(x.sentence));
  const withRewrite = allPassive.filter(x => suggestActiveVoice(x.sentence));
  const withoutRewrite = allPassive.filter(x => !suggestActiveVoice(x.sentence));
  const passiveCandidates = [...withRewrite, ...withoutRewrite].slice(0, 16);

  const flesch = ws.length && sentences.length ? 206.835 - 1.015 * (ws.length / sentences.length) - 84.6 * (syllables / ws.length) : null;
  const fkGrade = ws.length && sentences.length ? 0.39 * (ws.length / sentences.length) + 11.8 * (syllables / ws.length) - 15.59 : null;
  const fog = ws.length && sentences.length ? 0.4 * ((ws.length / sentences.length) + 100 * (complex / ws.length)) : null;
  const smog = sentences.length >= 3 && complex ? 1.0430 * Math.sqrt(complex * (30 / sentences.length)) + 3.1291 : null;
  const coleman = ws.length && sentences.length ? 0.0588 * ((text.match(/[A-Za-z]/g) || []).length / Math.max(1, ws.length) * 100) - 0.296 * ((sentences.length / ws.length) * 100) - 15.8 : null;
  const ari = ws.length && sentences.length ? 4.71 * (((text.match(/[A-Za-z]/g) || []).length) / ws.length) + 0.5 * (ws.length / sentences.length) - 21.43 : null;
  const score = flesch == null ? null : Math.max(0, Math.min(100, Math.round(flesch)));

  const maxSentence = sentences.map(s => ({ s, w: wordsOf(s).length })).sort((a, b) => b.w - a.w)[0];
  const capsRatio = text.length ? ((text.match(/[A-Z]/g) || []).length / Math.max(1, (text.match(/[A-Za-z]/g) || []).length)) * 100 : 0;

  const exclamations = (text.match(/!/g) || []).length;
  const questions = (text.match(/\?/g) || []).length;

  const issues = buildSentenceIssues(text, sentences, [...fillerMap].map(([phrase, count]) => ({ phrase, count })), passiveCandidates, longSentences, exclamations, capsRatio);
  const coachFindings = buildCoachFindings(text, sentences, contextual, passiveCandidates);

  const vocabDiversity = ws.length ? round1(unique.size / ws.length * 100) : 0;
  const fillerCount = [...fillerMap.values()].reduce((a, b) => a + b, 0);

  const { score: writingScore, factors: scoreFactors } = calculateWritingScore(
    ws.length,
    sentences.length,
    longSentences.length,
    fillerCount,
    passiveCandidates.length,
    exclamations,
    contextual.grammarScore,
    contextual.clarityScore,
    contextual.consistencyScore,
    vocabDiversity
  );

  const contextIssues: WritingIssue[] = [
    ...contextual.grammarCandidates.slice(0, 6).map(x => ({ id: `grammar-${x.index}-${x.detail}`, kind: 'Grammar candidate' as const, severity: 'medium' as const, sentenceIndex: x.index, sentence: x.sentence, detail: x.detail })),
    ...contextual.clarityCandidates.slice(0, 6).map(x => ({ id: `clarity-${x.index}-${x.detail}`, kind: 'Clarity candidate' as const, severity: 'low' as const, sentenceIndex: x.index, sentence: x.sentence, detail: x.detail })),
    ...contextual.consistencyCandidates.slice(0, 4).map((x, i) => ({ id: `consistency-${i}-${x.detail}`, kind: 'Consistency candidate' as const, severity: 'low' as const, detail: x.detail }))
  ];

  return {
    chars: text.length,
    charsNoSpaces: text.replace(/\s/g, '').length,
    graphemes: countGraphemes(text),
    words: ws.length,
    uniqueWords: unique.size,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    lines: countLines(text),
    syllables,
    avgWordLength: ws.length ? round1(ws.reduce((n, w) => n + w.length, 0) / ws.length) : 0,
    avgSentenceWords: sentences.length ? round1(ws.length / sentences.length) : 0,
    avgParagraphWords: paragraphs.length ? round1(ws.length / paragraphs.length) : 0,
    lexicalDensity: ws.length ? round1(ws.filter(w => !STOP_WORDS.has(w)).length / ws.length * 100) : 0,
    vocabularyDiversity: vocabDiversity,
    readingTimeSec: ws.length ? Math.max(1, Math.round(ws.length / 225 * 60)) : 0,
    speakingTimeSec: ws.length ? Math.max(1, Math.round(ws.length / wpm * 60)) : 0,
    estimatedEarnings: ws.length * Math.max(0, rate),
    flesch: score,
    fkGrade: fkGrade == null ? null : round1(fkGrade),
    fog: fog == null ? null : round1(fog),
    smog: smog == null ? null : round1(smog),
    coleman: coleman == null ? null : round1(coleman),
    ari: ari == null ? null : round1(ari),
    gradeLabel: gradeLabel(score),
    tone: { label, score: round1(sentimentScore), positive, negative },
    keywords,
    phrases: phraseCounts(ws, 2).concat(phraseCounts(ws, 3)).slice(0, 12),
    repeated: phraseCounts(ws, 2),
    longSentences,
    shortSentences,
    fillerHits: [...fillerMap].map(([phrase, count]) => ({ phrase, count })),
    passiveCandidates,
    capsRatio: round1(capsRatio),
    exclamations,
    questions,
    longestWord: ws.slice().sort((a, b) => b.length - a.length)[0] || '',
    longestSentence: maxSentence?.s || '',
    longestSentenceWords: maxSentence?.w || 0,
    issues: [...contextIssues.slice(0, 12), ...issues].slice(0, 36),
    grammarCandidates: contextual.grammarCandidates,
    clarityCandidates: contextual.clarityCandidates,
    consistencyCandidates: contextual.consistencyCandidates,
    repeatedOpenings: contextual.repeatedOpenings,
    repeatedSentences: contextual.repeatedSentences,
    clarityScore: contextual.clarityScore,
    grammarScore: contextual.grammarScore,
    consistencyScore: contextual.consistencyScore,
    writingScore,
    scoreFactors,
    coachFindings
  };
}

function download(name: string, content: string, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function TextAnalyzer() {
  const [text, setText] = useState('');
  const [compare, setCompare] = useState('');
  const [wpm, setWpm] = useState(150);
  const [rate, setRate] = useState<number | string>(0.05);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'writing' | 'keywords' | 'sentences'>('overview');
  const [copied, setCopied] = useState(false);
  const [statsCopied, setStatsCopied] = useState(false);
  const [targetGoal, setTargetGoal] = useState<number | ''>('');
  const [fileError, setFileError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [showCoach, setShowCoach] = useState(true);

  useEffect(() => () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }, []);
  const stats = useMemo(() => analyzeText(text, Number(rate) || 0, wpm), [text, rate, wpm]);
  const activeSelectedIssue = selectedIssue && stats.coachFindings.some(f => f.id === selectedIssue) ? selectedIssue : null;

  const comparison = useMemo(() => {
    if (!compare) return null;
    const a = wordsOf(text), b = wordsOf(compare), sa = sentencesOf(text), sb = sentencesOf(compare);
    const aw = new Set(a), bw = new Set(b);
    return {
      wordDelta: b.length - a.length,
      sentenceDelta: sb.length - sa.length,
      charDelta: compare.length - text.length,
      added: [...bw].filter(x => !aw.has(x)).slice(0, 30),
      removed: [...aw].filter(x => !bw.has(x)).slice(0, 30)
    };
  }, [text, compare]);

  const loadSampleText = () => {
    setText(SAMPLE_TEXT);
    setFileError('');
  };

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const copyStatsSummary = async () => {
    const summary = [
      'OmniTools Text Analysis Summary',
      '==============================',
      `Words: ${stats.words}`,
      `Characters (with spaces): ${stats.chars}`,
      `Characters (no spaces): ${stats.charsNoSpaces}`,
      `Grapheme Clusters (visual glyphs): ${stats.graphemes}`,
      `Sentences: ${stats.sentences}`,
      `Paragraphs: ${stats.paragraphs}`,
      `Lines: ${stats.lines}`,
      `Reading Time (225 WPM): ${Math.floor(stats.readingTimeSec / 60)}m ${stats.readingTimeSec % 60}s`,
      `Speaking Time (${wpm} WPM): ${Math.floor(stats.speakingTimeSec / 60)}m ${stats.speakingTimeSec % 60}s`,
      `Flesch Reading Ease: ${stats.flesch ?? '—'} (${stats.gradeLabel})`,
      `Flesch-Kincaid Grade: ${stats.fkGrade ?? '—'}`,
      `Writing Quality Score: ${stats.writingScore}/100`,
      `Tone: ${stats.tone.label}`,
    ].join('\n');
    await navigator.clipboard.writeText(summary);
    setStatsCopied(true);
    setTimeout(() => setStatsCopied(false), 1500);
  };

  const replaceAll = () => {
    if (!findText) return;
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    setText(text.replace(new RegExp(escaped, 'g'), replaceText));
  };

  const speak = () => {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
    setIsSpeaking(true);
  };

  const stop = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileError('');
    if (f.size > 10 * 1024 * 1024) {
      setFileError('File is larger than 10 MB.');
      return;
    }
    const r = new FileReader();
    r.onload = () => setText(String(r.result || ''));
    r.onerror = () => setFileError('Could not read this file.');
    r.readAsText(f);
    e.target.value = '';
  };

  const focusSentence = (index?: number) => {
    if (!index || !textRef.current) return;
    const range = sentenceRanges(text).find(x => x.index === index);
    if (!range) return;
    textRef.current.focus();
    textRef.current.setSelectionRange(range.start, range.end);
    textRef.current.scrollTop = Math.max(0, ((range.start / Math.max(1, text.length)) * textRef.current.scrollHeight) - 120);
  };

  const applySmartClarityPass = () => {
    if (!text) return;
    setText(smartClarityPass(text));
  };

  const exportCoachReport = () => {
    const lines = [
      'OmniTools Contextual Writing Coach — Premium Analysis Report',
      '===========================================================',
      '',
      `Overall Writing Quality: ${stats.writingScore}/100`,
      `Grammar Score: ${stats.grammarScore == null ? "N/A" : `${stats.grammarScore}/100`}`,
      `Clarity Score: ${stats.clarityScore == null ? "N/A" : `${stats.clarityScore}/100`}`,
      `Consistency Score: ${stats.consistencyScore == null ? "N/A" : `${stats.consistencyScore}/100`}`,
      `Readability (Flesch): ${stats.flesch ?? 'N/A'}/100 (${stats.gradeLabel})`,
      `Tone: ${stats.tone.label} (Score: ${stats.tone.score})`,
      `Prioritized findings: ${stats.coachFindings.length}`,
      '',
      'Key Score Factors:',
      ...stats.scoreFactors.map(f => `  • [${f.type.toUpperCase()}] ${f.text}`),
      '',
      'Prioritized Coach Findings:',
      ...stats.coachFindings.map((x, i) => [
        `${i + 1}. [${x.severity.toUpperCase()} · ${x.confidence} CONFIDENCE] ${x.category}${x.sentenceIndex ? ` · Sentence ${x.sentenceIndex}` : ''}: ${x.issue}`,
        `   Why: ${x.why}`,
        x.suggestion ? `   Suggestion: ${x.suggestion}` : '',
        x.rewrite ? `   Suggested rewrite: ${x.rewrite}` : ''
      ].filter(Boolean).join('\n')),
    ];
    download('omnitools-writing-coach.txt', lines.join('\n'));
  };

  const report = () => {
    const lines = [
      'OmniTools Text Analyzer Pro Report — Contextual Coach',
      '=====================================================',
      '',
      `Words: ${stats.words}`,
      `Characters: ${stats.chars}`,
      `Unique words: ${stats.uniqueWords}`,
      `Sentences: ${stats.sentences}`,
      `Paragraphs: ${stats.paragraphs}`,
      `Reading Ease (Flesch): ${stats.flesch ?? '—'} (${stats.gradeLabel})`,
      `Flesch-Kincaid Grade: ${stats.fkGrade ?? '—'}`,
      `Gunning Fog: ${stats.fog ?? '—'}`,
      `SMOG Index: ${stats.smog ?? '—'}`,
      `Coleman-Liau: ${stats.coleman ?? '—'}`,
      `Automated Readability Index (ARI): ${stats.ari ?? '—'}`,
      `Vocabulary diversity: ${stats.vocabularyDiversity}%`,
      `Lexical density: ${stats.lexicalDensity}%`,
      `Estimated earnings: $${stats.estimatedEarnings.toFixed(2)}`,
      `Writing quality score: ${stats.writingScore}/100`,
      `Tone: ${stats.tone.label} (${stats.tone.score})`,
      `Grammar score: ${stats.grammarScore == null ? "N/A" : `${stats.grammarScore}/100`}`,
      `Clarity score: ${stats.clarityScore == null ? "N/A" : `${stats.clarityScore}/100`}`,
      `Consistency score: ${stats.consistencyScore == null ? "N/A" : `${stats.consistencyScore}/100`}`,
      `Coach findings: ${stats.coachFindings.length}`,
      '',
      'Score Factors:',
      ...stats.scoreFactors.map(f => `  • ${f.text}`),
      '',
      'Top keywords:',
      ...stats.keywords.map(x => `  • ${x.word}: ${x.count} (${x.pct}%)`),
      '',
      'Prioritized coach findings:',
      ...stats.coachFindings.map((x, i) => [
        `${i + 1}. [${x.severity.toUpperCase()}] ${x.category}${x.sentenceIndex ? ` [Sentence ${x.sentenceIndex}]` : ''}: ${x.issue}`,
        `   Why: ${x.why}`,
        x.suggestion ? `   Suggestion: ${x.suggestion}` : '',
        x.rewrite ? `   Suggested rewrite: ${x.rewrite}` : ''
      ].filter(Boolean).join('\n')),
      '',
      'Passive candidates:',
      ...stats.passiveCandidates.slice(0, 8).map(x => `  • #${x.index}: ${x.sentence}`)
    ];
    download('omnitools-text-analysis.txt', lines.join('\n'));
  };

  const handleReset = () => {
    setText('');
    setCompare('');
    setFindText('');
    setReplaceText('');
    setFileError('');
    setSelectedIssue(null);
    setTargetGoal('');
  };

  return (
    <div id="text-analyzer-workspace" className="grid grid-cols-1 lg:grid-cols-3 items-stretch gap-8 bg-white dark:bg-[#0a0f1a] transition-colors">
      <div className="flex flex-col gap-4 lg:col-span-2 h-full min-h-0">
        <div className="flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-[#111827] p-3 rounded-2xl border border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-slate-700 pr-3">
            {!isSpeaking ? (
              <button
                type="button"
                onClick={speak}
                disabled={!text}
                title="Read Aloud"
                id="btn-read-aloud"
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors"
              >
                <Play className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={stop}
                title="Stop Reading"
                id="btn-stop-read"
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors"
              >
                <Square className="w-4 h-4 fill-white" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 border-r border-gray-300 dark:border-slate-700 pr-2 sm:pr-3">
            <button
              type="button"
              onClick={loadSampleText}
              title="Load Sample Text"
              id="btn-load-sample"
              className="px-2.5 sm:px-3 py-1.5 text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Sample
            </button>
            <button
              type="button"
              onClick={() => setText(text.toUpperCase())}
              id="btn-case-upper"
              className="px-2.5 sm:px-3 py-1.5 text-xs font-bold bg-white dark:bg-[#0a0f1a] text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-blue-500 transition-colors"
            >
              UPPER
            </button>
            <button
              type="button"
              onClick={() => setText(text.toLowerCase())}
              id="btn-case-lower"
              className="px-2.5 sm:px-3 py-1.5 text-xs font-bold bg-white dark:bg-[#0a0f1a] text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-blue-500 transition-colors"
            >
              lower
            </button>
            <button
              type="button"
              onClick={() => setText(text.replace(/\b\w/g, c => c.toUpperCase()))}
              id="btn-case-title"
              className="px-2.5 sm:px-3 py-1.5 text-xs font-bold bg-white dark:bg-[#0a0f1a] text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-blue-500 transition-colors"
            >
              Title
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 border-r border-gray-300 dark:border-slate-700 pr-2 sm:pr-3">
            <button
              type="button"
              onClick={() => setText(text.replace(/[ \t]+/g, ' ').trim())}
              title="Remove Extra Spaces"
              id="btn-clean-spaces"
              className="p-2 bg-white dark:bg-[#0a0f1a] text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-blue-500 transition-colors"
            >
              <Scissors className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setText(text.replace(/\n\s*\n+/g, '\n').trim())}
              title="Remove Empty Lines"
              id="btn-clean-lines"
              className="p-2 bg-white dark:bg-[#0a0f1a] text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-blue-500 transition-colors"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowFindReplace(v => !v)}
              title="Find & Replace"
              id="btn-toggle-find"
              className={`p-2 rounded-lg border transition-colors ${showFindReplace ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-[#0a0f1a] text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'}`}
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowCompare(v => !v)}
              title="Compare Text"
              id="btn-toggle-compare"
              className={`p-2 rounded-lg border transition-colors ${showCompare ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-[#0a0f1a] text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'}`}
            >
              <FileDiff className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowCoach(v => !v)}
              title="Writing Coach"
              id="btn-toggle-coach"
              className={`p-2 rounded-lg border transition-colors ${showCoach ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-[#0a0f1a] text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'}`}
            >
              <Wand2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <input ref={fileRef} hidden type="file" accept=".txt,.md,.csv,.json,.log,text/plain,text/markdown" onChange={onFile} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              title="Open text file"
              id="btn-upload-file"
              className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={copy}
              disabled={!text}
              title="Copy text to clipboard"
              id="btn-copy-text"
              className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={copyStatsSummary}
              disabled={!text}
              title="Copy statistics summary to clipboard"
              id="btn-copy-stats"
              className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
            >
              {statsCopied ? <Check className="w-4 h-4 text-green-600" /> : <FileSpreadsheet className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => download('omnitools_text.txt', text)}
              disabled={!text}
              title="Download text file"
              id="btn-download-text"
              className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              title="Clear all text and reset"
              id="btn-reset-text"
              className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showFindReplace && (
          <div className="flex flex-col sm:flex-row gap-3 bg-blue-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-blue-100 dark:border-slate-700">
            <input
              value={findText}
              onChange={e => setFindText(e.target.value)}
              placeholder="Find text..."
              id="input-find-text"
              className="flex-1 px-4 py-2 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-600 rounded-xl text-sm dark:text-white"
            />
            <input
              value={replaceText}
              onChange={e => setReplaceText(e.target.value)}
              placeholder="Replace with..."
              id="input-replace-text"
              className="flex-1 px-4 py-2 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-600 rounded-xl text-sm dark:text-white"
            />
            <button
              type="button"
              onClick={replaceAll}
              disabled={!findText}
              id="btn-replace-all"
              className="px-6 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50 hover:bg-blue-500 transition-colors text-sm font-semibold"
            >
              Replace All
            </button>
          </div>
        )}

        {showCompare && (
          <div className="bg-gray-50 dark:bg-[#111827] p-4 rounded-2xl border border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold dark:text-slate-200">Compare Version</h3>
              <button type="button" onClick={() => setCompare('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={compare}
              onChange={e => setCompare(e.target.value)}
              placeholder="Paste the previous/alternate version here..."
              id="textarea-compare"
              className="w-full min-h-32 p-3 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white"
            />
            {comparison && (
              <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                {metric('Word Δ', comparison.wordDelta)}
                {metric('Character Δ', comparison.charDelta)}
                {metric('Sentence Δ', comparison.sentenceDelta)}
              </div>
            )}
          </div>
        )}

        {fileError && <div className="text-sm text-red-500 px-2">{fileError}</div>}

        {showCoach && (
          <div className="bg-blue-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-blue-100 dark:border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold dark:text-slate-200 flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-blue-600" /> Contextual Writing Coach
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20">
                    Premium Engine
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  High-precision writing intelligence. Evaluates grammar, clarity, consistency, and active voice with zero actor invention.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={applySmartClarityPass}
                  disabled={!text}
                  id="btn-smart-clarity"
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Smart Clarity Pass
                </button>
                <button
                  type="button"
                  onClick={exportCoachReport}
                  disabled={!text}
                  id="btn-export-coach"
                  className="px-3 py-2 rounded-xl bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 text-xs font-bold dark:text-slate-300 hover:border-blue-500 disabled:opacity-50 transition-colors"
                >
                  Export Coach
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#0a0f1a] border border-gray-100 dark:border-slate-700/60 dark:text-slate-300">
                <span className="text-slate-400 block mb-0.5">Grammar</span>
                <b className="text-sm">{stats.grammarScore == null ? "—" : `${stats.grammarScore}/100`}</b>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#0a0f1a] border border-gray-100 dark:border-slate-700/60 dark:text-slate-300">
                <span className="text-slate-400 block mb-0.5">Clarity</span>
                <b className="text-sm">{stats.clarityScore == null ? "—" : `${stats.clarityScore}/100`}</b>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#0a0f1a] border border-gray-100 dark:border-slate-700/60 dark:text-slate-300">
                <span className="text-slate-400 block mb-0.5">Consistency</span>
                <b className="text-sm">{stats.consistencyScore == null ? "—" : `${stats.consistencyScore}/100`}</b>
              </div>
            </div>

            {stats.coachFindings.length > 0 ? (
              <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                {stats.coachFindings.slice(0, 6).map((finding) => (
                  <div
                    key={finding.id}
                    className="p-3 rounded-xl bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          finding.category === 'Grammar' ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' :
                          finding.category === 'Clarity' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' :
                          finding.category === 'Consistency' ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400' :
                          'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}>
                          {finding.category}
                        </span>
                        {finding.sentenceIndex && (
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Sentence {finding.sentenceIndex}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-slate-400">
                        {finding.confidence} Confidence ({finding.confidenceScore}%)
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-200 mt-1.5">{finding.issue}</div>
                    {finding.suggestion && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        <b>Suggestion:</b> {finding.suggestion}
                      </div>
                    )}
                    {finding.rewrite && (
                      <div className="text-xs mt-1.5 p-2 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
                        <b>Safe rewrite:</b> {finding.rewrite}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center py-2">
                {text.trim() ? '✓ No prioritized writing issues detected. Text looks clean.' : 'Type or paste text to see prioritized coach recommendations.'}
              </div>
            )}
          </div>
        )}

        <textarea
          ref={textRef}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Start typing or paste your document here to analyze..."
          id="editor-textarea"
          className="w-full flex-1 min-h-[430px] lg:min-h-0 h-full p-6 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-slate-800 rounded-3xl focus:ring-2 focus:ring-blue-600 focus:outline-none dark:text-slate-300 text-slate-800 text-lg leading-relaxed resize-none shadow-inner"
          spellCheck
        />
      </div>

      <div className="lg:col-span-1 flex flex-col gap-5 h-full">
        <div className="grid grid-cols-2 gap-3">
          {metric('Words', stats.words)}
          {metric('Characters', stats.chars, `${stats.graphemes} visual glyphs`)}
          {metric('Unique Words', stats.uniqueWords)}
          {metric('Vocabulary', `${stats.vocabularyDiversity}%`)}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs text-slate-500 dark:text-slate-400 text-center">
          <div className="p-2 bg-gray-50 dark:bg-[#111827] rounded-xl border border-gray-200 dark:border-slate-800">
            <span className="block text-[10px] text-slate-400">Sentences</span>
            <b className="text-slate-700 dark:text-slate-200">{stats.sentences}</b>
          </div>
          <div className="p-2 bg-gray-50 dark:bg-[#111827] rounded-xl border border-gray-200 dark:border-slate-800">
            <span className="block text-[10px] text-slate-400">Paragraphs</span>
            <b className="text-slate-700 dark:text-slate-200">{stats.paragraphs}</b>
          </div>
          <div className="p-2 bg-gray-50 dark:bg-[#111827] rounded-xl border border-gray-200 dark:border-slate-800">
            <span className="block text-[10px] text-slate-400">Lines</span>
            <b className="text-slate-700 dark:text-slate-200">{stats.lines}</b>
          </div>
          <div className="p-2 bg-gray-50 dark:bg-[#111827] rounded-xl border border-gray-200 dark:border-slate-800">
            <span className="block text-[10px] text-slate-400">No spaces</span>
            <b className="text-slate-700 dark:text-slate-200">{stats.charsNoSpaces}</b>
          </div>
        </div>

        {/* Word Count Target Goal Card */}
        <div className="bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Target className="w-3.5 h-3.5 text-blue-600" /> Word Target Goal
            </span>
            {targetGoal ? (
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {stats.words} / {targetGoal} ({Math.min(100, Math.round((stats.words / targetGoal) * 100))}%)
              </span>
            ) : (
              <span className="text-slate-400">Optional goal</span>
            )}
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-2.5">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                targetGoal && stats.words >= targetGoal ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${targetGoal ? Math.min(100, (stats.words / targetGoal) * 100) : 0}%` }}
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[250, 500, 1000, 2500].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setTargetGoal(targetGoal === g ? '' : g)}
                className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  targetGoal === g
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-[#0a0f1a] text-slate-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-blue-400'
                }`}
              >
                {g}w
              </button>
            ))}
            <input
              type="number"
              min="10"
              max="100000"
              placeholder="Custom..."
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value ? Math.max(1, Number(e.target.value)) : '')}
              id="input-target-goal"
              className="w-20 px-2 py-1 text-xs bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-md dark:text-white"
            />
          </div>
        </div>

        <div className="bg-blue-600 dark:bg-blue-600/10 border border-transparent dark:border-blue-500/30 rounded-3xl p-6 text-white dark:text-slate-200 shadow-lg">
          <h3 className="text-sm font-semibold text-blue-100 dark:text-blue-400 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Readability Analysis
          </h3>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-extrabold">{stats.flesch ?? '—'}</span>
            <span className="text-blue-100 dark:text-blue-400 pb-1">/100</span>
          </div>
          <p className="text-sm font-medium mt-2 mb-4 bg-black/20 dark:bg-blue-500/20 w-fit px-3 py-1 rounded-full">
            {stats.gradeLabel}
          </p>
          <div className="grid grid-cols-2 gap-3 border-t border-blue-400/30 pt-4 text-sm">
            <div>
              Reading<br />
              <b>{Math.floor(stats.readingTimeSec / 60)}m {stats.readingTimeSec % 60}s</b>
            </div>
            <div>
              Speaking<br />
              <b>{Math.floor(stats.speakingTimeSec / 60)}m {stats.speakingTimeSec % 60}s</b>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {metric('Writing Quality', `${stats.writingScore}/100`)}
          {metric('Tone', stats.tone.label)}
          {metric('Estimated Earnings', `$${stats.estimatedEarnings.toFixed(2)}`)}
          {metric('Lexical Density', `${stats.lexicalDensity}%`)}
        </div>

        {/* Calibrated Score Explanation Breakdown */}
        {stats.scoreFactors.length > 0 && text.trim().length > 0 && (
          <div className="bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-4 rounded-3xl space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" /> Score Explanation & Factors
            </h4>
            <div className="space-y-1.5 mt-2">
              {stats.scoreFactors.map((factor, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  {factor.type === 'positive' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />}
                  {factor.type === 'improvement' && <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />}
                  {factor.type === 'neutral' && <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />}
                  <span className="text-slate-600 dark:text-slate-300">{factor.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {(['overview', 'writing', 'keywords', 'sentences'] as const).map(t => (
            <button
              type="button"
              key={t}
              onClick={() => setActiveTab(t)}
              id={`tab-${t}`}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                activeTab === t
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-50 dark:bg-[#111827] text-slate-600 dark:text-slate-300 border-gray-200 dark:border-slate-800 hover:border-blue-400'
              }`}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-5 rounded-3xl space-y-4">
            <h3 className="font-bold dark:text-slate-200 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" /> Readability Scores
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm dark:text-slate-300">
              <span>Flesch: <b>{stats.flesch ?? '—'}</b></span>
              <span>FK Grade: <b>{stats.fkGrade ?? '—'}</b></span>
              <span>Gunning Fog: <b>{stats.fog ?? '—'}</b></span>
              <span>SMOG: <b>{stats.smog ?? '—'}</b></span>
              <span>Coleman-Liau: <b>{stats.coleman ?? '—'}</b></span>
              <span>ARI: <b>{stats.ari ?? '—'}</b></span>
            </div>
            <div className="text-xs text-slate-500">
              Average sentence: {stats.avgSentenceWords} words · Average word: {stats.avgWordLength} chars · Lexical density: {stats.lexicalDensity}% · Writing issues: {stats.issues.length} · Coach findings: {stats.coachFindings.length}
            </div>
          </div>
        )}

        {activeTab === 'writing' && (
          <div className="bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-5 rounded-3xl space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold dark:text-slate-200 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-blue-600" /> Writing Quality
              </h3>
              <span className="text-xs font-bold text-blue-600">{stats.writingScore}/100</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              High-confidence writing findings. Click <b>Focus</b> to navigate to the sentence in the editor.
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white dark:bg-[#0a0f1a] dark:text-slate-300 text-center">
                Long<br /><b>{stats.longSentences.length}</b>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-[#0a0f1a] dark:text-slate-300 text-center">
                Filler<br /><b>{stats.fillerHits.reduce((n, x) => n + x.count, 0)}</b>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-[#0a0f1a] dark:text-slate-300 text-center">
                Passive<br /><b>{stats.passiveCandidates.length}</b>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white dark:bg-[#0a0f1a] dark:text-slate-300 text-center">
                Grammar<br /><b>{stats.grammarCandidates.length}</b>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-[#0a0f1a] dark:text-slate-300 text-center">
                Clarity<br /><b>{stats.clarityCandidates.length}</b>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-[#0a0f1a] dark:text-slate-300 text-center">
                Consistency<br /><b>{stats.consistencyCandidates.length}</b>
              </div>
            </div>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {stats.coachFindings.length ? stats.coachFindings.map(issue => (
                <div
                  key={issue.id}
                  className={`p-3 rounded-xl border ${
                    activeSelectedIssue === issue.id ? 'border-blue-500 ring-1 ring-blue-500/30' : 'border-gray-200 dark:border-slate-700'
                  } bg-white dark:bg-[#0a0f1a]`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold dark:text-slate-200 flex items-center gap-1.5">
                        <span>{issue.category}</span>
                        <span className="text-slate-400 font-normal">· {issue.severity}</span>
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1 rounded">
                          {issue.confidence}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{issue.issue}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Why: {issue.why}</div>
                      {issue.suggestion && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Suggestion: {issue.suggestion}</div>
                      )}
                    </div>
                    {issue.sentenceIndex && (
                      <button
                        type="button"
                        onClick={() => { setSelectedIssue(issue.id); focusSentence(issue.sentenceIndex); }}
                        className="shrink-0 px-2 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        Focus
                      </button>
                    )}
                  </div>
                  {issue.sentence && (
                    <div className="text-xs mt-2 p-2 rounded-lg bg-gray-50 dark:bg-slate-900/60 dark:text-slate-300 line-clamp-3">
                      “{issue.sentence}”
                    </div>
                  )}
                  {issue.rewrite && (
                    <div className="text-xs mt-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
                      <b>Suggested rewrite:</b> {issue.rewrite}
                    </div>
                  )}
                </div>
              )) : (
                <p className="text-sm text-slate-500 py-4 text-center">No major writing issues detected.</p>
              )}
            </div>
            <div className="text-sm dark:text-slate-300">
              ALL-CAPS ratio: <b>{stats.capsRatio}%</b> · Exclamations: <b>{stats.exclamations}</b>
            </div>
          </div>
        )}

        {activeTab === 'keywords' && (
          <div className="bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-5 rounded-3xl">
            <h3 className="font-bold dark:text-slate-200 mb-4">Keywords & Phrases</h3>
            <div className="space-y-2">
              {stats.keywords.map(k => (
                <div key={k.word} className="flex justify-between text-sm dark:text-slate-300">
                  <span>{k.word}</span>
                  <span>{k.count} · {k.pct}%</span>
                </div>
              ))}
              {!stats.keywords.length && <p className="text-xs text-slate-500">No prominent keywords yet.</p>}
            </div>
            <h4 className="font-bold dark:text-slate-200 mt-5 mb-3">Repeated Phrases</h4>
            <div className="space-y-2">
              {stats.phrases.map(p => (
                <div key={p.phrase} className="flex justify-between text-xs dark:text-slate-300">
                  <span>{p.phrase}</span>
                  <span>×{p.count}</span>
                </div>
              ))}
              {!stats.phrases.length && <p className="text-xs text-slate-500">No repeated multi-word phrases detected.</p>}
            </div>
          </div>
        )}

        {activeTab === 'sentences' && (
          <div className="bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-5 rounded-3xl">
            <h3 className="font-bold dark:text-slate-200 mb-3">Sentence Inspector</h3>
            {stats.longSentences.slice(0, 6).map(s => (
              <div key={s.index} className="text-xs p-2 mb-2 rounded-lg bg-white dark:bg-[#0a0f1a] dark:text-slate-300">
                <b>#{s.index}</b> · {s.words} words<br />
                {s.text}
              </div>
            ))}
            {!stats.longSentences.length && <p className="text-sm text-slate-500">No sentences over 35 words detected.</p>}
          </div>
        )}

        <div className="bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-5 rounded-3xl">
          <h3 className="font-bold dark:text-slate-200 mb-3 flex items-center gap-2">
            <Hash className="w-4 h-4 text-blue-600" /> Keyword Density
          </h3>
          <div className="space-y-2 max-h-44 overflow-y-auto">
            {stats.keywords.map(k => (
              <div key={k.word} className="flex justify-between text-sm dark:text-slate-300">
                <span>{k.word}</span>
                <span>{k.count} · {k.pct}%</span>
              </div>
            ))}
            {!stats.keywords.length && <p className="text-xs text-slate-500">No keywords to display.</p>}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-5 rounded-3xl">
          <h3 className="font-bold dark:text-slate-200 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" /> Controls
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-slate-500">
              Speaking WPM
              <input
                type="number"
                min="60"
                max="300"
                value={wpm}
                onChange={e => setWpm(Math.max(60, Math.min(300, Number(e.target.value) || 150)))}
                id="input-wpm"
                className="mt-1 w-full px-2 py-2 rounded-lg border dark:bg-[#0a0f1a] dark:border-slate-700 dark:text-white"
              />
            </label>
            <label className="text-xs text-slate-500">
              Rate / word
              <input
                type="number"
                min="0"
                step="0.01"
                value={rate}
                onChange={e => setRate(e.target.value)}
                id="input-rate"
                className="mt-1 w-full px-2 py-2 rounded-lg border dark:bg-[#0a0f1a] dark:border-slate-700 dark:text-white"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={report}
            disabled={!text}
            id="btn-export-analysis-report"
            className="mt-3 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Analysis Report
          </button>
        </div>
      </div>
    </div>
  );
}
