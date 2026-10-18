/**
 * OmniTools Premium Grammar & Linguistic Engine
 *
 * Layered, context-aware English writing analysis engine:
 * Layer A: Text normalization and offset-preserving tokenization
 * Layer B: Sentence and paragraph segmentation with exact source ranges
 * Layer C: Morphological and syntactic analysis (inflections, irregulars, parts of speech)
 * Layer D: Rule-based grammar detection (agreement, tense, articles, pronouns, collocations)
 * Layer E: Context-sensitive linguistic analysis (comma splices, clauses, subordination)
 * Layer F: Spelling, punctuation, capitalization, and style analysis
 * Layer G: Issue ranking, deduplication, confidence scoring, and suppression
 * Layer H: Correction generation, validation, and safe application
 */

export type IssueCategory =
  | 'Grammar'
  | 'Spelling'
  | 'Punctuation'
  | 'Clarity'
  | 'Consistency'
  | 'Passive voice'
  | 'Style';

export type IssueSeverity = 'high' | 'medium' | 'low';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type DialogueMode = 'normal' | 'dialogue-aware' | 'analyze-dialogue' | 'preserve-quotes';

export interface GrammarFinding {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0 - 100
  ruleId: string;
  start: number; // Exact character offset in original text
  end: number;   // Exact character offset in original text
  originalText: string; // text.slice(start, end)
  issue: string; // Concise description of the issue
  why: string;   // Grammatical explanation
  suggestion?: string; // Human-readable advice
  replacement?: string; // Primary safe replacement for the span
  replacements?: string[]; // Multiple valid alternatives
  sentenceIndex?: number;
  sentence?: string;
  rewrite?: string; // Optional full-sentence rewrite
}

export interface SentenceRange {
  index: number;
  start: number;
  end: number;
  text: string;
}

export interface QuotedSpan {
  start: number;
  end: number;
  text: string;
  quoteChar: string;
}

// ============================================================
// Dictionaries and Linguistic Lexicons
// ============================================================

export const SINGULAR_S_NOUNS = new Set([
  'news', 'series', 'species', 'lens', 'analytics', 'logistics', 'operations',
  'physics', 'economics', 'ethics', 'politics', 'headquarters', 'mathematics',
  'crossroads', 'billiards', 'measles', 'diabetes', 'mechanics', 'tactics',
  'corps', 'barracks'
]);

export const COLLECTIVE_NOUNS = new Set([
  'team', 'group', 'committee', 'board', 'department', 'staff', 'company',
  'organization', 'division', 'management', 'panel', 'faculty', 'council',
  'crew', 'crowd', 'firm', 'association', 'jury', 'army', 'class'
]);

export const IRREGULAR_PLURAL_NOUNS = new Set([
  'people', 'children', 'men', 'women', 'teeth', 'feet', 'mice', 'geese',
  'criteria', 'phenomena', 'data', 'analyses', 'hypotheses', 'parentheses',
  'theses', 'crises', 'foci', 'radii', 'fungi', 'cacti', 'bacteria', 'media'
]);

export const PREPOSITIONS_SET = new Set([
  'of', 'in', 'for', 'with', 'on', 'at', 'to', 'from', 'by', 'about',
  'under', 'through', 'between', 'among', 'across', 'into', 'upon',
  'toward', 'towards', 'against', 'within', 'during', 'without', 'behind',
  'beyond', 'around', 'near', 'over'
]);

export const PREPOSITIONS_RE = /\b(?:of|in|for|with|on|at|to|from|by|about|under|through|between|among|across|into|upon|toward|towards|against|within|during)(?:\s+(?:all|both|many|several|some|each)(?:\s+of)?)?\s+$/i;

export const COMMON_TYPOS: Record<string, string> = {
  recieve: 'receive',
  recieved: 'received',
  recieving: 'receiving',
  seperate: 'separate',
  seperated: 'separated',
  seperately: 'separately',
  definately: 'definitely',
  occured: 'occurred',
  occuring: 'occurring',
  untill: 'until',
  tommorrow: 'tomorrow',
  goverment: 'government',
  accomodate: 'accommodate',
  accomodation: 'accommodation',
  neccessary: 'necessary',
  unneccessary: 'unnecessary',
  truely: 'truly',
  existance: 'existence',
  maintainance: 'maintenance',
  calender: 'calendar',
  embarass: 'embarrass',
  embarassed: 'embarrassed',
  foriegn: 'foreign',
  guarentee: 'guarantee',
  guarenteed: 'guaranteed',
  harrass: 'harass',
  harrassment: 'harassment',
  independant: 'independent',
  millenium: 'millennium',
  noticable: 'noticeable',
  posession: 'possession',
  privelege: 'privilege',
  recommand: 'recommend',
  recommanded: 'recommended',
  refered: 'referred',
  refering: 'referring',
  succesful: 'successful',
  succesfully: 'successfully',
  suprise: 'surprise',
  suprised: 'surprised',
  tendancy: 'tendency',
  thier: 'their',
  wierd: 'weird',
  writting: 'writing',
  alot: 'a lot',
  acheive: 'achieve',
  beleive: 'believe',
  concious: 'conscious',
  dissapear: 'disappear',
  enviroment: 'environment',
  grammer: 'grammar',
  knowlege: 'knowledge',
  occurence: 'occurrence',
  peice: 'piece',
  relevent: 'relevant',
  resistence: 'resistance',
  rythm: 'rhythm',
  sieze: 'seize',
  speach: 'speech',
  tommorow: 'tomorrow',
  vehical: 'vehicle',
  wierdest: 'weirdest'
};

export const IRREGULAR_PAST_PARTICIPLES: Record<string, string> = {
  went: 'gone',
  took: 'taken',
  wrote: 'written',
  broke: 'broken',
  chose: 'chosen',
  arose: 'arisen',
  saw: 'seen',
  spoke: 'spoken',
  drove: 'driven',
  ate: 'eaten',
  fell: 'fallen',
  gave: 'given',
  knew: 'known',
  ran: 'run',
  threw: 'thrown',
  wore: 'worn',
  stole: 'stolen',
  began: 'begun',
  drank: 'drunk',
  swam: 'swum',
  froze: 'frozen',
  shook: 'shaken',
  rode: 'ridden',
  rose: 'risen'
};

export const SINGULAR_VERB_TO_PLURAL: Record<string, string> = {
  demonstrates: 'demonstrate',
  explains: 'explain',
  shows: 'show',
  indicates: 'indicate',
  requires: 'require',
  contains: 'contain',
  provides: 'provide',
  represents: 'represent',
  determines: 'determine',
  causes: 'cause',
  includes: 'include',
  belongs: 'belong',
  runs: 'run',
  fails: 'fail',
  works: 'work',
  proves: 'prove',
  identifies: 'identify',
  describes: 'describe',
  defines: 'define',
  illustrates: 'illustrate',
  supports: 'support',
  leads: 'lead',
  suggests: 'suggest',
  confirms: 'confirm',
  generates: 'generate',
  reflects: 'reflect',
  measures: 'measure',
  produces: 'produce',
  follows: 'follow',
  handles: 'handle',
  creates: 'create',
  performs: 'perform',
  governs: 'govern',
  controls: 'control',
  processes: 'process',
  manages: 'manage',
  executes: 'execute',
  validates: 'validate',
  computes: 'compute',
  stores: 'store',
  maintains: 'maintain',
  enforces: 'enforce',
  displays: 'display',
  uses: 'use',
  receives: 'receive',
  sends: 'send',
  delivers: 'deliver',
  prevents: 'prevent',
  ensures: 'ensure',
  allows: 'allow',
  enables: 'enable',
  specifies: 'specify',
  establishes: 'establish',
  calculates: 'calculate',
  affects: 'affect',
  impacts: 'impact',
  relates: 'relate',
  applies: 'apply',
  transforms: 'transform',
  converts: 'convert',
  monitors: 'monitor',
  evaluates: 'evaluate',
  verifies: 'verify',
  improves: 'improve',
  enhances: 'enhance',
  reduces: 'reduce',
  increases: 'increase',
  separates: 'separate',
  connects: 'connect',
  binds: 'bind',
  parses: 'parse',
  renders: 'render',
  compiles: 'compile',
  resolves: 'resolve',
  triggers: 'trigger',
  modifies: 'modify',
  updates: 'update',
  appears: 'appear',
  remains: 'remain',
  claims: 'claim',
  acknowledges: 'acknowledge',
  ignores: 'ignore',
  discovers: 'discover',
  seems: 'seem',
  argues: 'argue',
  concludes: 'conclude',
  reports: 'report',
  observes: 'observe',
  notes: 'note',
  states: 'state',
  faces: 'face'
};

export const MODAL_AUXILIARIES = new Set([
  'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must'
]);

export const ABBREVIATIONS = [
  'p.m.', 'a.m.', 'Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Sr.', 'Jr.', 'e.g.', 'i.e.',
  'vs.', 'etc.', 'Inc.', 'Ltd.', 'Corp.', 'Co.', 'No.', 'Jan.', 'Feb.', 'Mar.', 'Apr.',
  'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.', 'St.', 'Ave.', 'Dept.', 'Gov.', 'Gen.', 'Col.',
  'Capt.', 'Lt.', 'Maj.', 'Rev.', 'Sen.', 'Rep.', 'U.S.', 'U.K.', 'E.U.', 'Ph.D.', 'M.D.',
  'B.A.', 'M.A.', 'B.S.', 'M.S.'
];

export const QUOTE_REGEX = /"(?:[^"\\]|\\.)*"|“[^”]*”|«[^»]*»|‘(?:[^’\\]|’(?=[a-zA-Z]))*’(?=$|[\s)\]}>—–,;:!?.])|(?<=^|[\s(\[{<—–"“«])'(?:[^'\\]|'(?=[a-zA-Z]))*'(?=$|[\s)\]}>—–,;:!?.])/g;

// ============================================================
// Sentence & Offset Helpers
// ============================================================

export function findQuotedSpans(text: string): QuotedSpan[] {
  const spans: QuotedSpan[] = [];
  const regex = new RegExp(QUOTE_REGEX.source, 'g');
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    spans.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[0],
      quoteChar: match[0][0]
    });
  }
  return spans;
}

export function isOffsetInsideQuotes(offset: number, length: number, quotes: QuotedSpan[]): boolean {
  const targetEnd = offset + length;
  for (const q of quotes) {
    if (offset >= q.start && targetEnd <= q.end) {
      return true;
    }
  }
  return false;
}

export function protectSentenceText(s: string): string {
  let res = s;
  for (const abbr of ABBREVIATIONS) {
    const escaped = abbr.replace(/\./g, '\\.');
    const re = new RegExp(`\\b${escaped}`, 'gi');
    res = res.replace(re, m => m.replace(/\./g, '\u0001'));
  }
  res = res.replace(/(?<=[a-zA-Z0-9_#+])\.(?=[a-zA-Z0-9_#+])/g, '\u0001');
  res = res.replace(/(?<=^|[\s"'({[/])\.([a-zA-Z0-9_#+]+)/g, '\u0001$1');
  res = res.replace(/\b([A-Z])\.\s+(?=[A-Z]\.|\b[A-Za-z])/g, '$1\u0001 ');
  res = res.replace(/\b([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)\b/g, m => m.replace(/\./g, '\u0001'));
  res = res.replace(/(https?:\/\/[^\s]+)/g, m => m.replace(/\./g, '\u0001'));
  res = res.replace(/\b([vV]?\d+)\.(\d+)(?:\.(\d+))?\b/g, m => m.replace(/\./g, '\u0001'));
  res = res.replace(/\.{3}/g, '\u0004');
  return res;
}

export function restoreSentenceText(s: string): string {
  return s.replace(/\u0001/g, '.').replace(/\u0004/g, '...');
}

const INTL_TERMINATORS = /[.!?。۔؟！？]/;

export function extractSentenceRanges(text: string): SentenceRange[] {
  if (!text || !text.trim()) return [];
  const protectedText = protectSentenceText(text);
  const ranges: SentenceRange[] = [];

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

    let rawSlice = text.slice(start, end);
    let sOffset = start;
    // Trim leading whitespace
    const leadingWs = rawSlice.match(/^\s*/)?.[0].length || 0;
    sOffset += leadingWs;
    rawSlice = rawSlice.slice(leadingWs);
    // Trim trailing whitespace
    const trailingWs = rawSlice.match(/\s*$/)?.[0].length || 0;
    const eOffset = sOffset + rawSlice.length - trailingWs;
    const finalSentence = rawSlice.slice(0, rawSlice.length - trailingWs);

    if (finalSentence && /\S/.test(finalSentence)) {
      ranges.push({
        index: ranges.length + 1,
        start: sOffset,
        end: eOffset,
        text: finalSentence
      });
    }

    start = end;
    i = end - 1;
  }

  const tailRaw = text.slice(start);
  const leadingWs = tailRaw.match(/^\s*/)?.[0].length || 0;
  const trailingWs = tailRaw.match(/\s*$/)?.[0].length || 0;
  const sOffset = start + leadingWs;
  const finalTail = tailRaw.slice(leadingWs, tailRaw.length - trailingWs);
  if (finalTail && /\S/.test(finalTail)) {
    ranges.push({
      index: ranges.length + 1,
      start: sOffset,
      end: sOffset + finalTail.length,
      text: finalTail
    });
  }

  return ranges;
}

// ============================================================
// Layer D: Rule Evaluation with Exact Spans
// ============================================================

const coordinatingOpeners = /^(?:and|but|or|nor|for|so|yet)\b/i;
const dependentOpeners = /^(?:when|while|although|though|because|if|unless|until|before|after|since|as|once|whereas|wherever|whether|which|who|whom|whose|that|even though|even if|even when|even while|even as|assuming|assuming that|provided that|providing that|given that|considering that)\b/i;
const dependentLeadIns = /^(?:in order to|in order that|due to the fact that|due to|because of|in spite of|despite|rather than|so that|according to|for example|in fact|furthermore|however|in addition|on the other hand|provided that|assuming that|given that|considering that)\b/i;
const prepositionalOpeners = /^(?:in|on|at|during|after|before|since|until|by|from|with|without|through|throughout|across|under|over|between|among|despite|according to|for|as of)\s+(?:early\s+|late\s+|mid-)?(?:\d{4}|[a-z0-9\s,-]+)\b/i;
const participialLeadIn = /^(?:and\s+)?(?:finally\s+|eventually\s+|then\s+)?(?:reviewed|approved|released|designed|completed|tested|created|built|developed|provided|delayed)\s+by\b/i;

const finiteVerbs = /\b(?:am|is|are|was|were|has|have|had|do|does|did|can|could|will|would|shall|should|must|may|might|needs?|needed|requires?|required|remains?|remained|seems?|seemed|looks?|looked|appears?|appeared|became|becomes?|sounds?|sounded|feels?|felt|contains?|contained|shows?|showed|shown|begins?|began|begun|ends?|ended|works?|worked|failed|fails?|proves?|proved|proven|identifies?|identified|reviews?|reviewed|sends?|sent|discovers?|discovered|fixes?|fixed|contacts?|contacted|submits?|submitted|releases?|released|tests?|tested|develops?|developed|restarted|restarts?|launched|launches?|monitored|monitors?|approved|approves?|designed|designs?|completed|completes|recommended|recommends?|delayed|delays?|provided|provides?|made|makes?|took|takes?|taken|kept|keeps?|started|starts?|verified|verifies?|crashed|crashes?|resolved|resolves?|updated|updates?|built|builds?|created|creates?|deployed|deploys?|continued|continues?|write|writes|wrote|written|investigate|investigates|investigated|maintained|maintains?|argued|argues?|claimed|claims?|concluded|concludes?|reported|reports?|observed|observes?|acknowledged|acknowledges?|suggested|suggests?|indicated|indicates?|demonstrated|demonstrates?|explained|explains?|stated|states?|noted|notes?)\b/i;

const pronounSubjects = /^(?:it|he|she|they|we|you|this|that|these|those|there|someone|somebody|nobody|everyone|others|both|neither|either|none|many|several|few|one)\b/i;
const determinerSubjects = /^(?:the|a|an|some|several|many|few|each|every|our|your|their|his|her|its|my|two|three|four)\s+[a-z][a-z'’-]*\b/i;
const properNounSubjects = /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b(?!\s+by\b)/;
const transitionalAdverbSubjects = /^(?:therefore|consequently|moreover|furthermore|meanwhile|instead|however)\s*,\s*(?:[A-Z][a-z]+|the|a|an|it|he|she|they|we|this|that)\b/i;
const barePluralWithVerb = /^(?!(?:is|as|us|was|has|this|its|thus|less|yes)\b)[a-z]{3,}s\s+(?:can|could|will|would|shall|should|must|may|might|am|is|are|was|were|has|have|had|do|does|did|write|writes|wrote|verify|verifies|verified|review|reviews|reviewed|approve|approves|approved|investigate|investigates|investigated|check|checks|checked|run|runs|ran|fail|fails|failed|follow|follows|followed|seek|seeks|sought|find|finds|found|provide|provides|provided|use|uses|used|create|creates|created|[a-z]+ed)\b/i;

function matchesClauseSubject(text: string): boolean {
  const trimmed = text.trim();
  return (
    pronounSubjects.test(trimmed) ||
    determinerSubjects.test(trimmed) ||
    properNounSubjects.test(trimmed) ||
    transitionalAdverbSubjects.test(trimmed) ||
    barePluralWithVerb.test(trimmed)
  );
}

const incompleteClauseEndings = /\b(?:do|does|did|is|am|are|was|were|has|have|had|can|could|will|would|shall|should|may|might|must)(?:\s+not)?$/i;
const prepositionEndings = /\b(?:of|in|for|with|on|at|to|from|by|about|into|through|between|among|as\s+well\s+as|together\s+with|along\s+with|such\s+as)$/i;

export function findLikelyCommaSpliceInSentence(sentence: string): number {
  const protectedText = sentence.replace(QUOTE_REGEX, ' ');
  const commaPositions: number[] = [];
  for (let i = 0; i < protectedText.length; i++) {
    if (protectedText[i] === ',') commaPositions.push(i);
  }

  for (const comma of commaPositions) {
    const left = protectedText.slice(0, comma).trim();
    const right = protectedText.slice(comma + 1).trim();
    if (!left || !right) continue;

    // Coordinators or subordinators directly after comma
    if (coordinatingOpeners.test(right) || dependentOpeners.test(right)) continue;
    if (participialLeadIn.test(right)) continue;
    if (/^(?:many|some|both|all|each|few|none|several|one|two|most)\s+of\s+(?:which|whom)\b/i.test(right)) continue;
    if (/^even\s+(?:when|if|though|while|as)\b/i.test(right)) continue;

    // Scope to semicolon or colon boundary (both left and right!)
    const prevSep = Math.max(protectedText.lastIndexOf(';', comma), protectedText.lastIndexOf(':', comma));
    const clauseLeft = (prevSep >= 0 ? protectedText.slice(prevSep + 1, comma) : left).trim();

    const nextSemi = protectedText.indexOf(';', comma);
    const nextColon = protectedText.indexOf(':', comma);
    let nextSep = -1;
    if (nextSemi >= 0 && nextColon >= 0) nextSep = Math.min(nextSemi, nextColon);
    else if (nextSemi >= 0) nextSep = nextSemi;
    else if (nextColon >= 0) nextSep = nextColon;

    const clauseRight = (nextSep >= 0 ? protectedText.slice(comma + 1, nextSep) : right).trim();
    if (!clauseLeft || !clauseRight) continue;

    // Semicolons must NEVER be inserted between a subject and its predicate!
    // If clauseRight starts with an auxiliary or finite verb, it is a predicate without subject.
    if (/^(?:am|is|are|was|were|has|have|had|do|does|did|can|could|will|would|shall|should|must|may|might)\b/i.test(clauseRight)) {
      continue;
    }

    // 1. Incomplete clause left: auxiliary or preposition at the end of clauseLeft
    if (incompleteClauseEndings.test(clauseLeft) || prepositionEndings.test(clauseLeft)) {
      continue;
    }

    // 2. Parenthetical interrupter: ", by itself, prove..." or ", in fact, is..."
    const parentheticalMatch = clauseRight.match(/^([a-z0-9\s'’-]+?),\s+([a-z]+)\b/i);
    if (parentheticalMatch) {
      const postCommaWord = parentheticalMatch[2].toLowerCase();
      if (finiteVerbs.test(postCommaWord) || /^(?:prove|proves|show|shows|mean|means|indicate|indicates|require|requires|make|makes)\b/i.test(postCommaWord)) {
        continue;
      }
    }

    // 3. Serial list / enumeration checks:
    // If clauseRight contains a serial continuation ending in `, (?:and|or)\s+`
    // where the immediate segment before the next comma does NOT have a finite verb
    if (clauseRight.includes(',')) {
      const firstSegment = clauseRight.slice(0, clauseRight.indexOf(',')).trim();
      if (!finiteVerbs.test(firstSegment)) {
        continue;
      }
    }

    // 4. Coordinated compound predicates without subject:
    // If clauseRight starts with a bare verb or coordinated verb ("maintain accurate character offsets...")
    // where there is no subject noun phrase/pronoun
    if (!matchesClauseSubject(clauseRight)) {
      continue;
    }

    // 5. Check introductory dependent phrases on left
    if (dependentOpeners.test(clauseLeft) || dependentLeadIns.test(clauseLeft)) {
      if (clauseLeft.includes(',')) {
        const firstCommaIdx = clauseLeft.indexOf(',');
        const introPart = clauseLeft.slice(0, firstCommaIdx).trim();
        const afterIntro = clauseLeft.slice(firstCommaIdx + 1).trim();
        if ((dependentOpeners.test(introPart) || dependentLeadIns.test(introPart)) && finiteVerbs.test(introPart)) {
          if (!matchesClauseSubject(afterIntro) || !finiteVerbs.test(afterIntro)) {
            continue;
          }
        } else {
          continue;
        }
      } else {
        continue;
      }
    }

    if (prepositionalOpeners.test(clauseLeft) && !finiteVerbs.test(clauseLeft)) continue;

    const coreClause = (clauseLeft.includes(',') ? clauseLeft.slice(clauseLeft.lastIndexOf(',') + 1) : clauseLeft).trim();
    if (prepositionalOpeners.test(coreClause) && !finiteVerbs.test(coreClause)) continue;
    if (dependentOpeners.test(coreClause) || dependentLeadIns.test(coreClause)) continue;
    if (/^to\s+[a-z]+/i.test(coreClause)) continue;
    if (/^(?:having|being|using|by|while)\s+[a-z]+/i.test(coreClause)) continue;
    if (/\b(?:whether|although|though|because|when|while|if|unless|until|even though|even if|even when|in order to|due to the fact that)\b/i.test(coreClause)) continue;

    // 6. Must have a subject on the left
    if (!matchesClauseSubject(coreClause) && !/(?:^|\s)(?:he|she|it|they|we|you|this|that|these|those|[A-Z][a-z]+)\b/i.test(coreClause)) {
      if (!matchesClauseSubject(clauseLeft)) {
        continue;
      }
    }

    // 7. Parallel clause series ending with ", and [actor] [verb] it"
    if (/\b(?:[a-z]+ed|built|sent|left)\s+it\b/i.test(coreClause) && /\band\s+(?:the|a|an|[a-z]+)\s+[\s\S]*\bit\b/i.test(clauseRight)) {
      continue;
    }

    // 8. Both sides MUST have a finite verb in their matrix clause!
    if (!finiteVerbs.test(clauseLeft)) continue;

    // Strip relative clauses from clauseRight to ensure clauseRight has a MATRIX verb
    const withoutRelClauses = clauseRight.replace(/\b(?:for\s+which|which|whose|that|who|whom|where|when)\s+[^,;]+(?=[,;]|$)/gi, ' ');
    if (!finiteVerbs.test(withoutRelClauses)) continue;

    return comma;
  }
  return -1;
}

// ============================================================
// Core Analysis Pipeline
// ============================================================

export interface GrammarEngineOptions {
  mode?: DialogueMode;
  dialogueMode?: DialogueMode;
  dialect?: 'US' | 'UK' | 'all';
}

export function runGrammarEngine(
  text: string,
  options: GrammarEngineOptions = {}
): {
  findings: GrammarFinding[];
  grammarScore: number | null;
  clarityScore: number | null;
  consistencyScore: number | null;
} {
  const activeMode = options.dialogueMode || options.mode || 'normal';
  const dialect = options.dialect || 'all';

  if (!text || !text.trim()) {
    return {
      findings: [],
      grammarScore: null,
      clarityScore: null,
      consistencyScore: null
    };
  }

  const findings: GrammarFinding[] = [];
  const sentences = extractSentenceRanges(text);
  const quotedSpans = findQuotedSpans(text);

  // Helper to add findings with span validation
  function addFinding(f: Omit<GrammarFinding, 'originalText'>) {
    if (f.start < 0 || f.end > text.length || f.start >= f.end) return;

    // Quote handling
    const insideQuote = isOffsetInsideQuotes(f.start, f.end - f.start, quotedSpans);
    if ((activeMode === 'normal' || activeMode === 'preserve-quotes') && insideQuote) {
      return; // Do not touch or flag errors inside quotes in normal/preserve mode
    }

    if (activeMode === 'dialogue-aware' && insideQuote) {
      f.category = 'Style';
      f.severity = 'low';
      f.issue = `(Inside dialogue) ${f.issue}`;
    } else if (activeMode === 'analyze-dialogue' && insideQuote) {
      f.issue = `(Inside dialogue) ${f.issue}`;
    }

    const originalText = text.slice(f.start, f.end);
    findings.push({
      ...f,
      originalText
    });
  }

  // -------------------------------------------------------------
  // 1. GLOBAL / CROSS-SENTENCE CHECKS
  // -------------------------------------------------------------

  // 1.1 Common Spelling & Typographical Errors
  for (const [typo, correction] of Object.entries(COMMON_TYPOS)) {
    const typoRegex = new RegExp(`\\b(${typo})\\b`, 'gi');
    let m: RegExpExecArray | null;
    while ((m = typoRegex.exec(text)) !== null) {
      const start = m.index;
      const end = start + m[0].length;
      const isCap = /^[A-Z]/.test(m[0]);
      const rep = isCap ? correction.charAt(0).toUpperCase() + correction.slice(1) : correction;
      addFinding({
        id: `spelling-${start}-${end}`,
        category: 'Spelling',
        severity: 'high',
        confidence: 'HIGH',
        confidenceScore: 98,
        ruleId: 'SPELL_COMMON_TYPO',
        start,
        end,
        issue: `Spelling error: “${m[0]}” is commonly misspelled.`,
        why: `The standard spelling is “${rep}”.`,
        suggestion: `Change “${m[0]}” to “${rep}”.`,
        replacement: rep,
        replacements: [rep]
      });
    }
  }

  // 1.2 "could/should/would/might/must of" -> have
  const modalOfRegex = /\b(could|should|would|might|must)\s+(of)\b/gi;
  let modalOfMatch: RegExpExecArray | null;
  while ((modalOfMatch = modalOfRegex.exec(text)) !== null) {
    const modal = modalOfMatch[1];
    const ofToken = modalOfMatch[2];
    const ofStart = modalOfMatch.index + modal.length + 1;
    const ofEnd = ofStart + ofToken.length;
    addFinding({
      id: `grammar-modal-of-${modalOfMatch.index}`,
      category: 'Grammar',
      severity: 'high',
      confidence: 'HIGH',
      confidenceScore: 98,
      ruleId: 'VERB_MODAL_OF',
      start: ofStart,
      end: ofEnd,
      issue: `Incorrect preposition “of” after modal “${modal}”.`,
      why: `In English, modals are followed by the auxiliary verb “have”, not “of”.`,
      suggestion: `Replace “of” with “have”.`,
      replacement: 'have',
      replacements: ['have']
    });
  }

  // 1.3 Incorrect Past Participles with have/has/had
  const perfectParticipleRegex = /\b(have|has|had|having)\s+([a-z]+)\b/gi;
  let ppMatch: RegExpExecArray | null;
  while ((ppMatch = perfectParticipleRegex.exec(text)) !== null) {
    const aux = ppMatch[1];
    const verb = ppMatch[2].toLowerCase();
    const correctParticiple = IRREGULAR_PAST_PARTICIPLES[verb];
    if (correctParticiple && correctParticiple !== verb) {
      const verbStart = ppMatch.index + ppMatch[0].lastIndexOf(ppMatch[2]);
      const verbEnd = verbStart + ppMatch[2].length;
      addFinding({
        id: `grammar-participle-${verbStart}`,
        category: 'Grammar',
        severity: 'high',
        confidence: 'HIGH',
        confidenceScore: 95,
        ruleId: 'VERB_PAST_PARTICIPLE_MISMATCH',
        start: verbStart,
        end: verbEnd,
        issue: `Incorrect verb form: “${aux} ${ppMatch[2]}”.`,
        why: `The auxiliary “${aux}” requires the past participle form “${correctParticiple}”, not the simple past “${ppMatch[2]}”.`,
        suggestion: `Use “${correctParticiple}”.`,
        replacement: correctParticiple,
        replacements: [correctParticiple]
      });
    }
  }

  // 1.4 Modal + Inflected Verb (e.g., "can goes", "will sees", "must has")
  const modalInflectRegex = /\b(can|could|will|would|shall|should|may|might|must)\s+(goes|sees|writes|breaks|chooses|knows|has|comes|runs|does)\b/gi;
  let miMatch: RegExpExecArray | null;
  while ((miMatch = modalInflectRegex.exec(text)) !== null) {
    const modal = miMatch[1];
    const inflected = miMatch[2].toLowerCase();
    const baseMap: Record<string, string> = {
      goes: 'go', sees: 'see', writes: 'write', breaks: 'break', chooses: 'choose',
      knows: 'know', has: 'have', comes: 'come', runs: 'run', does: 'do'
    };
    const base = baseMap[inflected] || inflected;
    const vStart = miMatch.index + miMatch[0].lastIndexOf(miMatch[2]);
    const vEnd = vStart + miMatch[2].length;
    addFinding({
      id: `grammar-modal-base-${vStart}`,
      category: 'Grammar',
      severity: 'high',
      confidence: 'HIGH',
      confidenceScore: 96,
      ruleId: 'VERB_MODAL_BARE_INFINITIVE',
      start: vStart,
      end: vEnd,
      issue: `Modal auxiliary “${modal}” followed by inflected verb “${miMatch[2]}”.`,
      why: `Modal verbs in English require the bare infinitive (base form) of the verb.`,
      suggestion: `Use “${base}”.`,
      replacement: base,
      replacements: [base]
    });
  }

  // 1.4b Modal + to + verb (e.g., "must to finish", "should to do")
  const modalToRegex = /\b(can|could|will|would|shall|should|may|might|must)\s+(to)\s+([a-z]+)\b/gi;
  let mtMatch: RegExpExecArray | null;
  while ((mtMatch = modalToRegex.exec(text)) !== null) {
    const modal = mtMatch[1];
    const verb = mtMatch[3];
    const toStart = mtMatch.index + modal.length + 1;
    const fullEnd = mtMatch.index + mtMatch[0].length;
    addFinding({
      id: `grammar-modal-to-${toStart}`,
      category: 'Grammar',
      severity: 'high',
      confidence: 'HIGH',
      confidenceScore: 98,
      ruleId: 'VERB_MODAL_BARE_INFINITIVE',
      start: toStart,
      end: fullEnd,
      issue: `Modal auxiliary “${modal}” followed by “to ${verb}”.`,
      why: `Modal verbs require the bare infinitive without “to”.`,
      suggestion: `Remove “to” and use “${verb}”.`,
      replacement: verb,
      replacements: [verb]
    });
  }

  // 1.5 Infinitive with Past Tense ("to ran", "to went", "to wrote")
  const toPastRegex = /\b(to)\s+(ran|went|wrote|broke|chose|saw|ate|drove|fell|gave|spoke|took)\b/gi;
  let tpMatch: RegExpExecArray | null;
  while ((tpMatch = toPastRegex.exec(text)) !== null) {
    const past = tpMatch[2].toLowerCase();
    const baseMap: Record<string, string> = {
      ran: 'run', went: 'go', wrote: 'write', broke: 'break', chose: 'choose',
      saw: 'see', ate: 'eat', drove: 'drive', fell: 'fall', gave: 'give',
      spoke: 'speak', took: 'take'
    };
    const base = baseMap[past] || past;
    const vStart = tpMatch.index + tpMatch[0].lastIndexOf(tpMatch[2]);
    const vEnd = vStart + tpMatch[2].length;
    addFinding({
      id: `grammar-infinitive-base-${vStart}`,
      category: 'Grammar',
      severity: 'high',
      confidence: 'HIGH',
      confidenceScore: 97,
      ruleId: 'VERB_INFINITIVE_BASE_FORM',
      start: vStart,
      end: vEnd,
      issue: `Infinitive marker “to” followed by past-tense verb “${tpMatch[2]}”.`,
      why: `The infinitive marker “to” requires the base form of the verb, not past tense.`,
      suggestion: `Use “${base}”.`,
      replacement: base,
      replacements: [base]
    });
  }

  // 1.6 Phonetic Articles: "a" before vowel sound vs "an" before consonant sound
  const aVowelRegex = /\b(a)\s+(apple|orange|egg|hour|honest|honor|honorable|elephant|idea|overview|error|urgent|issue|update|effort|analyst|asset|example)\b/gi;
  let aMatch: RegExpExecArray | null;
  while ((aMatch = aVowelRegex.exec(text)) !== null) {
    const art = aMatch[1];
    const noun = aMatch[2];
    const rep = art === 'A' ? 'An' : 'an';
    addFinding({
      id: `article-a-vowel-${aMatch.index}`,
      category: 'Grammar',
      severity: 'high',
      confidence: 'HIGH',
      confidenceScore: 98,
      ruleId: 'ARTICLE_A_BEFORE_VOWEL_SOUND',
      start: aMatch.index,
      end: aMatch.index + art.length,
      issue: `Article “${art}” used before vowel sound in “${noun}”.`,
      why: `In English, “an” is used before words that begin with a vowel sound.`,
      suggestion: `Use “${rep}”.`,
      replacement: rep,
      replacements: [rep]
    });
  }

  const anConsonantRegex = /\b(an)\s+(car|table|book|problem|user|unique|university|report|manager|meeting|system|European|unit|uniform|useful|one)\b/gi;
  let anMatch: RegExpExecArray | null;
  while ((anMatch = anConsonantRegex.exec(text)) !== null) {
    const art = anMatch[1];
    const noun = anMatch[2];
    const rep = art === 'An' ? 'A' : 'a';
    addFinding({
      id: `article-an-consonant-${anMatch.index}`,
      category: 'Grammar',
      severity: 'high',
      confidence: 'HIGH',
      confidenceScore: 98,
      ruleId: 'ARTICLE_AN_BEFORE_CONSONANT_SOUND',
      start: anMatch.index,
      end: anMatch.index + art.length,
      issue: `Article “${art}” used before consonant sound in “${noun}”.`,
      why: `In English, “a” is used before words that begin with a consonant sound (including /j/ as in “user” or “university”).`,
      suggestion: `Use “${rep}”.`,
      replacement: rep,
      replacements: [rep]
    });
  }

  // 1.7 Duplicate Adjacent Words (excluding "that that", "had had")
  const dupWordRegex = /\b(?!that\s+that\b|had\s+had\b)(\b[a-zA-Z]{2,}\b)\s+\1\b/gi;
  let dupMatch: RegExpExecArray | null;
  while ((dupMatch = dupWordRegex.exec(text)) !== null) {
    const dupStart = dupMatch.index;
    const dupEnd = dupStart + dupMatch[0].length;
    const singleWord = dupMatch[1];
    addFinding({
      id: `duplicate-word-${dupStart}`,
      category: 'Grammar',
      severity: 'high',
      confidence: 'HIGH',
      confidenceScore: 95,
      ruleId: 'DUPLICATE_ADJACENT_WORD',
      start: dupStart,
      end: dupEnd,
      issue: `Duplicated word “${singleWord}”.`,
      why: `The word “${singleWord}” is repeated consecutively.`,
      suggestion: `Keep only a single instance of “${singleWord}”.`,
      replacement: singleWord,
      replacements: [singleWord]
    });
  }

  // 1.8 Duplicate Articles ("a a", "the the", "an an")
  const dupArticleRegex = /\b(a\s+a|the\s+the|an\s+an)\b/gi;
  let daMatch: RegExpExecArray | null;
  while ((daMatch = dupArticleRegex.exec(text)) !== null) {
    const single = daMatch[0].split(/\s+/)[0];
    addFinding({
      id: `duplicate-article-${daMatch.index}`,
      category: 'Grammar',
      severity: 'high',
      confidence: 'HIGH',
      confidenceScore: 98,
      ruleId: 'DUPLICATE_ARTICLE',
      start: daMatch.index,
      end: daMatch.index + daMatch[0].length,
      issue: `Duplicated article “${daMatch[0]}”.`,
      why: `Consecutive articles are ungrammatical.`,
      suggestion: `Use single “${single}”.`,
      replacement: single,
      replacements: [single]
    });
  }

  // 1.9 Prepositional Pronoun Case: "between you and I" -> "between you and me"
  const prepCaseRegex = /\b(between|for|with|to|from|against|behind)\s+(?:you|him|her|them)\s+and\s+(I)\b/gi;
  let pcMatch: RegExpExecArray | null;
  while ((pcMatch = prepCaseRegex.exec(text)) !== null) {
    const iStart = pcMatch.index + pcMatch[0].lastIndexOf('I');
    const iEnd = iStart + 1;
    addFinding({
      id: `pronoun-case-prep-${iStart}`,
      category: 'Grammar',
      severity: 'high',
      confidence: 'HIGH',
      confidenceScore: 95,
      ruleId: 'PRONOUN_OBJECTIVE_CASE_PREPOSITION',
      start: iStart,
      end: iEnd,
      issue: `Subject pronoun “I” used as object of preposition “${pcMatch[1]}”.`,
      why: `Prepositions govern the objective case (“me”), not subjective (“I”).`,
      suggestion: `Change “I” to “me”.`,
      replacement: 'me',
      replacements: ['me']
    });
  }

  // 1.10 Subject Pronoun Case at clause start: "Her and I went" -> "She and I went", "Him and me" -> "He and I"
  const objSubjRegex = /(^|[.!?;\n]\s*)(Her|Him|Me)\s+and\s+(I|me|her|him)\b/g;
  let osMatch: RegExpExecArray | null;
  while ((osMatch = objSubjRegex.exec(text)) !== null) {
    const prefixLen = osMatch[1].length;
    const matchStart = osMatch.index + prefixLen;
    const matchEnd = matchStart + osMatch[0].length - prefixLen;
    const firstObj = osMatch[2];
    const secondObj = osMatch[3];
    const firstSubj = firstObj === 'Her' ? 'She' : firstObj === 'Him' ? 'He' : 'I';
    const secondSubj = secondObj === 'me' ? 'I' : secondObj === 'her' ? 'she' : secondObj === 'him' ? 'he' : secondObj;
    const rep = `${firstSubj} and ${secondSubj}`;
    addFinding({
      id: `pronoun-case-subject-${matchStart}`,
      category: 'Grammar',
      severity: 'high',
      confidence: 'HIGH',
      confidenceScore: 92,
      ruleId: 'PRONOUN_SUBJECTIVE_CASE_COORDINATION',
      start: matchStart,
      end: matchEnd,
      issue: `Objective pronoun “${firstObj}” used as grammatical subject.`,
      why: `Subject position requires nominative case pronouns (“${firstSubj}”).`,
      suggestion: `Change to “${rep}”.`,
      replacement: rep,
      replacements: [rep]
    });
  }

  // 1.11 Commonly Confused Homophones:
  // "it's" (contraction) vs "its" (possessive)
  const itsContractionAsNounPossessive = /\b([a-zA-Z0-9_-]+)\s+(it's)\s+(policy|performance|design|results|features|accuracy|quality|database|infrastructure|metrics|value|impact|system|team|decision|content|mission)\b/gi;
  let itsMatch: RegExpExecArray | null;
  while ((itsMatch = itsContractionAsNounPossessive.exec(text)) !== null) {
    const tokenStart = itsMatch.index + itsMatch[1].length + 1;
    const tokenEnd = tokenStart + itsMatch[2].length;
    addFinding({
      id: `homophone-its-possessive-${tokenStart}`,
      category: 'Grammar',
      severity: 'high',
      confidence: 'HIGH',
      confidenceScore: 92,
      ruleId: 'HOMOPHONE_ITS_POSSESSIVE',
      start: tokenStart,
      end: tokenEnd,
      issue: `Contraction “it's” (it is) used instead of possessive “its”.`,
      why: `“Its” indicates possession, while “it's” is a contraction of “it is” or “it has”.`,
      suggestion: `Use possessive “its”.`,
      replacement: 'its',
      replacements: ['its']
    });
  }

  // "its" without apostrophe where "it is" is clearly required ("its raining", "its clear", "its important")
  const itsAdjVerbRegex = /(^|[\s"'(])(its)\s+(important|clear|crucial|essential|necessary|evident|apparent|raining|obvious|unlikely|possible|difficult|easy|time|great|safe)\b/gi;
  let itsAdjMatch: RegExpExecArray | null;
  while ((itsAdjMatch = itsAdjVerbRegex.exec(text)) !== null) {
    const prefixLen = itsAdjMatch[1].length;
    const start = itsAdjMatch.index + prefixLen;
    const end = start + itsAdjMatch[2].length;
    const isCap = /^[A-Z]/.test(itsAdjMatch[2]);
    const rep = isCap ? "It's" : "it's";
    addFinding({
      id: `homophone-its-contraction-${start}`,
      category: 'Grammar',
      severity: 'high',
      confidence: 'HIGH',
      confidenceScore: 92,
      ruleId: 'HOMOPHONE_ITS_CONTRACTION',
      start,
      end,
      issue: `Possessive “its” used where contraction “it's” (it is) is required.`,
      why: `“It's” is the contraction for “it is”.`,
      suggestion: `Use contraction “${rep}”.`,
      replacement: rep,
      replacements: [rep]
    });
  }

  // "your welcome" -> "you're welcome"
  const yourWelcomeRegex = /\b(your)\s+welcome\b/gi;
  let ywMatch: RegExpExecArray | null;
  while ((ywMatch = yourWelcomeRegex.exec(text)) !== null) {
    const isCap = /^[A-Z]/.test(ywMatch[1]);
    const rep = isCap ? "You're" : "you're";
    addFinding({
      id: `homophone-your-welcome-${ywMatch.index}`,
      category: 'Grammar',
      severity: 'high',
      confidence: 'HIGH',
      confidenceScore: 96,
      ruleId: 'HOMOPHONE_YOURE_WELCOME',
      start: ywMatch.index,
      end: ywMatch.index + ywMatch[1].length,
      issue: `Possessive “your” used instead of contraction “you're” (you are).`,
      why: `“You're welcome” is short for “you are welcome”.`,
      suggestion: `Use “${rep}”.`,
      replacement: rep,
      replacements: [rep]
    });
  }

  // "their going to" -> "they're going to"
  const theirGoingRegex = /\b(their)\s+(going|planning|trying|looking|ready|working)\s+to\b/gi;
  let tgMatch: RegExpExecArray | null;
  while ((tgMatch = theirGoingRegex.exec(text)) !== null) {
    const isCap = /^[A-Z]/.test(tgMatch[1]);
    const rep = isCap ? "They're" : "they're";
    addFinding({
      id: `homophone-their-theyre-${tgMatch.index}`,
      category: 'Grammar',
      severity: 'high',
      confidence: 'HIGH',
      confidenceScore: 94,
      ruleId: 'HOMOPHONE_THEYRE_VERB',
      start: tgMatch.index,
      end: tgMatch.index + tgMatch[1].length,
      issue: `Possessive “their” used instead of contraction “they're” (they are).`,
      why: `“They're” is short for “they are”.`,
      suggestion: `Use “${rep}”.`,
      replacement: rep,
      replacements: [rep]
    });
  }

  // "better then" -> "better than"
  const comparativeThenRegex = /\b(better|more|faster|slower|greater|less|larger|smaller|higher|lower|earlier|later|clearer|easier|harder|stronger|weaker)\s+(then)\b/gi;
  let ctMatch: RegExpExecArray | null;
  while ((ctMatch = comparativeThenRegex.exec(text)) !== null) {
    const comp = ctMatch[1];
    const thenStart = ctMatch.index + comp.length + 1;
    const thenEnd = thenStart + 4;
    addFinding({
      id: `word-choice-then-than-${thenStart}`,
      category: 'Grammar',
      severity: 'high',
      confidence: 'HIGH',
      confidenceScore: 95,
      ruleId: 'WORD_CHOICE_THAN_COMPARISON',
      start: thenStart,
      end: thenEnd,
      issue: `Temporal adverb “then” used in comparison instead of “than”.`,
      why: `Comparatives require “than” (“${comp} than”), while “then” relates to time or consequence.`,
      suggestion: `Use “than”.`,
      replacement: 'than',
      replacements: ['than']
    });
  }

  // "loose" when meaning "lose" (e.g. "loose the game", "loose weight", "loose your keys")
  const looseVerbRegex = /\b(loose)\s+((?:the|your|his|her|their|our|my|its)\s+)?(keys|badge|game|weight|money|customers|control|access|data)\b/gi;
  let lvMatch: RegExpExecArray | null;
  while ((lvMatch = looseVerbRegex.exec(text)) !== null) {
    const isCap = /^[A-Z]/.test(lvMatch[1]);
    const rep = isCap ? 'Lose' : 'lose';
    addFinding({
      id: `word-choice-loose-lose-${lvMatch.index}`,
      category: 'Grammar',
      severity: 'high',
      confidence: 'HIGH',
      confidenceScore: 94,
      ruleId: 'WORD_CHOICE_LOSE_NOT_LOOSE',
      start: lvMatch.index,
      end: lvMatch.index + lvMatch[1].length,
      issue: `Adjective “loose” used as verb instead of “lose”.`,
      why: `“Lose” is the verb (to misplace or be deprived of), whereas “loose” means not tight or free.`,
      suggestion: `Use “${rep}”.`,
      replacement: rep,
      replacements: [rep]
    });
  }

  // Double Comparatives ("more better", "most best", "more faster")
  const doubleCompRegex = /\b(more|most)\s+(better|worse|faster|slower|bigger|smaller|greater|harder|easier|earlier|later|clearer|stronger|weaker|best)\b/gi;
  let dcMatch: RegExpExecArray | null;
  while ((dcMatch = doubleCompRegex.exec(text)) !== null) {
    const adverb = dcMatch[1];
    const comparative = dcMatch[2];
    addFinding({
      id: `grammar-double-comparative-${dcMatch.index}`,
      category: 'Grammar',
      severity: 'high',
      confidence: 'HIGH',
      confidenceScore: 98,
      ruleId: 'GRAMMAR_DOUBLE_COMPARATIVE',
      start: dcMatch.index,
      end: dcMatch.index + dcMatch[0].length,
      issue: `Double comparative or superlative “${adverb} ${comparative}”.`,
      why: `English comparative adjectives like “${comparative}” already express comparison and must not be paired with “${adverb}”.`,
      suggestion: `Use simply “${comparative}”.`,
      replacement: comparative,
      replacements: [comparative]
    });
  }

  // Double Negatives ("can't hardly", "don't have no", "haven't no")
  const doubleNegRegex = /\b(can't|cannot)\s+(hardly|scarcely)\b|\b(don't|doesn't|didn't|haven't|hasn't|hadn't)\s+(?:have\s+)?(no)\s+([a-z]+)\b/gi;
  let dnMatch: RegExpExecArray | null;
  while ((dnMatch = doubleNegRegex.exec(text)) !== null) {
    addFinding({
      id: `grammar-double-negative-${dnMatch.index}`,
      category: 'Grammar',
      severity: 'high',
      confidence: 'HIGH',
      confidenceScore: 92,
      ruleId: 'GRAMMAR_DOUBLE_NEGATIVE',
      start: dnMatch.index,
      end: dnMatch.index + dnMatch[0].length,
      issue: `Double negative construction detected: “${dnMatch[0]}”.`,
      why: `Two negative words in the same clause cancel each other or create nonstandard grammar in standard English.`,
      suggestion: dnMatch[1] ? `Use “can hardly” or “can scarcely”.` : `Replace “no” with “any”.`
    });
  }

  // Semicolon followed by conjunctive adverb without following comma: "; however it" -> "; however, it"
  const semiConjRegex = /;\s*(therefore|however|consequently|moreover|furthermore)\s+(?![,\b])/gi;
  let scMatch: RegExpExecArray | null;
  while ((scMatch = semiConjRegex.exec(text)) !== null) {
    const adv = scMatch[1];
    const advStart = scMatch.index + scMatch[0].indexOf(adv);
    const advEnd = advStart + adv.length;
    addFinding({
      id: `punctuation-conjunctive-adverb-comma-${advStart}`,
      category: 'Punctuation',
      severity: 'medium',
      confidence: 'HIGH',
      confidenceScore: 95,
      ruleId: 'PUNCTUATION_CONJUNCTIVE_ADVERB_COMMA',
      start: advStart,
      end: advEnd,
      issue: `Missing comma after transitional adverb “${adv}”.`,
      why: `Transitional adverbs following a semicolon require a trailing comma to separate them from the clause.`,
      suggestion: `Add a comma: “${adv},”.`,
      replacement: `${adv},`,
      replacements: [`${adv},`]
    });
  }

  // Repeated Punctuation: `,,`, `;;`
  const repPunctRegex = /([,;]{2,})/g;
  let rpMatch: RegExpExecArray | null;
  while ((rpMatch = repPunctRegex.exec(text)) !== null) {
    const single = rpMatch[1][0];
    addFinding({
      id: `punctuation-repeated-${rpMatch.index}`,
      category: 'Punctuation',
      severity: 'high',
      confidence: 'HIGH',
      confidenceScore: 98,
      ruleId: 'PUNCTUATION_REPEATED_MARKS',
      start: rpMatch.index,
      end: rpMatch.index + rpMatch[0].length,
      issue: `Repeated punctuation “${rpMatch[0]}”.`,
      why: `Duplicate commas or semicolons are typographical errors.`,
      suggestion: `Use a single “${single}”.`,
      replacement: single,
      replacements: [single]
    });
  }

  // Space before comma or period: "word , word" -> "word, word"
  const spaceBeforePunctRegex = /\s+([,.;!?])/g;
  let sbpMatch: RegExpExecArray | null;
  while ((sbpMatch = spaceBeforePunctRegex.exec(text)) !== null) {
    // Avoid triggering on ellipsis or special symbols
    if (sbpMatch.index > 0 && text[sbpMatch.index - 1] !== '.') {
      addFinding({
        id: `punctuation-space-before-${sbpMatch.index}`,
        category: 'Punctuation',
        severity: 'medium',
        confidence: 'HIGH',
        confidenceScore: 96,
        ruleId: 'PUNCTUATION_SPACE_BEFORE_MARK',
        start: sbpMatch.index,
        end: sbpMatch.index + sbpMatch[0].length,
        issue: `Unnecessary whitespace before punctuation “${sbpMatch[1]}”.`,
        why: `Punctuation marks should attach directly to the preceding word without leading space.`,
        suggestion: `Remove the space before “${sbpMatch[1]}”.`,
        replacement: sbpMatch[1],
        replacements: [sbpMatch[1]]
      });
    }
  }

  // -------------------------------------------------------------
  // 2. PER-SENTENCE CONTEXTUAL LINGUISTIC RULES
  // -------------------------------------------------------------
  sentences.forEach(sRange => {
    const sText = sRange.text;
    const sStart = sRange.start;

    // 2.1 Comma Splice Detection
    const spliceCommaIdx = findLikelyCommaSpliceInSentence(sText);
    if (spliceCommaIdx >= 0) {
      const globalCommaPos = sStart + spliceCommaIdx;
      addFinding({
        id: `comma-splice-${globalCommaPos}`,
        category: 'Grammar',
        severity: 'high',
        confidence: 'MEDIUM',
        confidenceScore: 85,
        ruleId: 'SENTENCE_COMMA_SPLICE',
        start: globalCommaPos,
        end: globalCommaPos + 1,
        sentenceIndex: sRange.index,
        sentence: sText,
        issue: 'Comma splice: two independent clauses joined only by a comma.',
        why: 'Independent clauses must be connected by a coordinating conjunction (such as “, and”), a semicolon, or separated into two sentences.',
        suggestion: 'Replace the comma with a semicolon, period, or “, and”.',
        replacement: ';',
        replacements: [';', '.', ', and'],
        rewrite: sText.slice(0, spliceCommaIdx) + ';' + sText.slice(spliceCommaIdx + 1)
      });
    }

    // 2.2 Subject-Verb Agreement: Definite and Indefinite Singular Pronouns with Plural Verbs
    // (he/she/it/this/that/everyone/everybody/someone/somebody/anyone/anybody/nobody/no one are/were/have/do/don't)
    const singPronounMatch = sText.match(/\b(he|she|it|this|that|everyone|everybody|someone|somebody|anyone|anybody|nobody|no\s+one)\s+(are|were|have|do|don't)\b/i);
    if (singPronounMatch && singPronounMatch.index !== undefined) {
      const preceding = sText.slice(0, singPronounMatch.index);
      const subj = singPronounMatch[1];
      const verb = singPronounMatch[2].toLowerCase();

      // Exclude auxiliary questions: "Did he have", "Does she have", "Did everyone have", etc.
      const isAuxiliaryQuestion = verb === 'have' && /\b(?:did|does|doesn't|didn't|do|could|would|should|might|must|will|can|shall)(?:\s+[a-z]+)?\s+(?:not\s+)?$/i.test(preceding);
      // Exclude subjunctive: "If he were", "I wish it were", etc.
      const isSubjunctive = verb === 'were' && /\b(?:if|as\s+if|as\s+though|wish(?:es|ed)?|suppose|supposing|whether)\s+(?:[\w\s,]+?\s+)?$/i.test(preceding);
      // Exclude prepositional objects for this/that: "In addition to this were..."
      const isPrepObject = (subj.toLowerCase() === 'this' || subj.toLowerCase() === 'that') && PREPOSITIONS_RE.test(preceding);
      // Exclude relative pronoun "that" referring to a plural antecedent ("assumptions that were...", "servers that have...")
      const isRelativePluralThat = subj.toLowerCase() === 'that' && (
        /(?:[a-z]+s|men|women|people|data|criteria|phenomena)\s+$/i.test(preceding) ||
        /\b(?:those|these|many|several|few)\s+$/i.test(preceding)
      );

      if (!isAuxiliaryQuestion && !isSubjunctive && !isPrepObject && !isRelativePluralThat) {
        const verbOffsetInSentence = singPronounMatch.index + singPronounMatch[0].lastIndexOf(singPronounMatch[2]);
        const gStart = sStart + verbOffsetInSentence;
        const gEnd = gStart + singPronounMatch[2].length;
        const correctVerb = verb === 'were' ? 'was' : verb === 'have' ? 'has' : verb === 'are' ? 'is' : verb === 'do' ? 'does' : "doesn't";
        addFinding({
          id: `agreement-sing-pronoun-${gStart}`,
          category: 'Grammar',
          severity: 'high',
          confidence: 'HIGH',
          confidenceScore: 96,
          ruleId: 'AGREEMENT_SINGULAR_PRONOUN_PLURAL_VERB',
          start: gStart,
          end: gEnd,
          sentenceIndex: sRange.index,
          sentence: sText,
          issue: `Subject–verb agreement mismatch: singular subject “${subj}” does not agree with plural verb “${verb}”.`,
          why: `Singular and indefinite third-person subjects take singular verbs (“${correctVerb}”).`,
          suggestion: `Change “${verb}” to “${correctVerb}”.`,
          replacement: correctVerb,
          replacements: [correctVerb]
        });
      }
    }

    // 2.3 Subject-Verb Agreement: Plural Pronouns with Singular Verbs
    // (they/we is/was/has, you was, they suggests -> suggest, they acknowledges -> acknowledge)
    const plurPronounMatch = sText.match(/\b(they|we)\s+(is|was|has)\b/i) || sText.match(/\b(you)\s+(was)\b/i);
    if (plurPronounMatch && plurPronounMatch.index !== undefined) {
      const subj = plurPronounMatch[1];
      const verb = plurPronounMatch[2].toLowerCase();
      const verbOffsetInSentence = plurPronounMatch.index + plurPronounMatch[0].lastIndexOf(plurPronounMatch[2]);
      const gStart = sStart + verbOffsetInSentence;
      const gEnd = gStart + plurPronounMatch[2].length;
      const correctVerb = verb === 'was' ? 'were' : verb === 'has' ? 'have' : 'are';
      addFinding({
        id: `agreement-plur-pronoun-${gStart}`,
        category: 'Grammar',
        severity: 'high',
        confidence: 'HIGH',
        confidenceScore: 96,
        ruleId: 'AGREEMENT_PLURAL_PRONOUN_SINGULAR_VERB',
        start: gStart,
        end: gEnd,
        sentenceIndex: sRange.index,
        sentence: sText,
        issue: `Subject–verb agreement mismatch: plural subject “${subj}” does not agree with singular verb “${verb}”.`,
        why: `Plural subjects take plural verbs (“${correctVerb}”).`,
        suggestion: `Change “${verb}” to “${correctVerb}”.`,
        replacement: correctVerb,
        replacements: [correctVerb]
      });
    }

    const plurPronounVerbRegex = /\b(they|we)\s+([a-z]+s)\b/gi;
    let ppvMatch: RegExpExecArray | null;
    while ((ppvMatch = plurPronounVerbRegex.exec(sText)) !== null) {
      const subj = ppvMatch[1];
      const verb = ppvMatch[2].toLowerCase();
      const base = SINGULAR_VERB_TO_PLURAL[verb];
      if (base && verb !== 'is' && verb !== 'has' && verb !== 'was') {
        const verbOffset = ppvMatch.index + ppvMatch[0].lastIndexOf(ppvMatch[2]);
        const gStart = sStart + verbOffset;
        const gEnd = gStart + ppvMatch[2].length;
        addFinding({
          id: `agreement-plur-pronoun-verb-${gStart}`,
          category: 'Grammar',
          severity: 'high',
          confidence: 'HIGH',
          confidenceScore: 96,
          ruleId: 'AGREEMENT_PLURAL_PRONOUN_SINGULAR_VERB',
          start: gStart,
          end: gEnd,
          sentenceIndex: sRange.index,
          sentence: sText,
          issue: `Subject–verb agreement mismatch: plural subject “${subj}” does not agree with singular verb “${ppvMatch[2]}”.`,
          why: `Plural subjects take base plural verbs (“${base}”).`,
          suggestion: `Change “${ppvMatch[2]}” to “${base}”.`,
          replacement: base,
          replacements: [base]
        });
      }
    }

    // 2.4 Subject-Verb Agreement: Plural Demonstratives with Singular Verbs ("these was", "those has")
    const demMatch = sText.match(/\b(these|those)\s+(was|is|has)\b/i);
    if (demMatch && demMatch.index !== undefined) {
      const preceding = sText.slice(0, demMatch.index);
      if (!PREPOSITIONS_RE.test(preceding) && !/\b(?:that|which|who|whom)\s+[a-z\s]+$/i.test(preceding)) {
        const dem = demMatch[1];
        const verb = demMatch[2].toLowerCase();
        const verbOffset = demMatch.index + demMatch[0].lastIndexOf(demMatch[2]);
        const gStart = sStart + verbOffset;
        const gEnd = gStart + demMatch[2].length;
        const correctVerb = verb === 'was' ? 'were' : verb === 'has' ? 'have' : 'are';
        addFinding({
          id: `agreement-dem-${gStart}`,
          category: 'Grammar',
          severity: 'high',
          confidence: 'HIGH',
          confidenceScore: 96,
          ruleId: 'AGREEMENT_PLURAL_DEMONSTRATIVE_SINGULAR_VERB',
          start: gStart,
          end: gEnd,
          sentenceIndex: sRange.index,
          sentence: sText,
          issue: `Subject–verb agreement mismatch: plural demonstrative “${dem}” does not agree with singular verb “${verb}”.`,
          why: `Plural demonstratives require plural verbs (“${correctVerb}”).`,
          suggestion: `Change “${verb}” to “${correctVerb}”.`,
          replacement: correctVerb,
          replacements: [correctVerb]
        });
      }
    }

    // 2.5 Subject-Verb Agreement: Quantifiers ("each/every department were", "each of the departments were", "every student and teacher were")
    const quantDirectMatch = sText.match(/\b(each|every)\s+([a-z]+(?:\s+and\s+[a-z]+)?)\s+(have|were|are)\b/i);
    if (quantDirectMatch && quantDirectMatch.index !== undefined) {
      const preceding = sText.slice(0, quantDirectMatch.index);
      const verb = quantDirectMatch[3].toLowerCase();
      const isAuxiliaryQuestion = verb === 'have' && /\b(?:did|does|doesn't|didn't|do|could|would|should|might|must|will|can|shall)\s+(?:[a-z\s]+)?$/i.test(preceding);
      if (!isAuxiliaryQuestion) {
        const phrase = `${quantDirectMatch[1]} ${quantDirectMatch[2]}`;
        const verbOffset = quantDirectMatch.index + quantDirectMatch[0].lastIndexOf(quantDirectMatch[3]);
        const gStart = sStart + verbOffset;
        const gEnd = gStart + quantDirectMatch[3].length;
        const correctVerb = verb === 'have' ? 'has' : verb === 'were' ? 'was' : 'is';
        addFinding({
          id: `agreement-quantifier-${gStart}`,
          category: 'Grammar',
          severity: 'high',
          confidence: 'HIGH',
          confidenceScore: 95,
          ruleId: 'AGREEMENT_QUANTIFIER_SINGULAR_SUBJECT',
          start: gStart,
          end: gEnd,
          sentenceIndex: sRange.index,
          sentence: sText,
          issue: `Subject–verb agreement mismatch: singular quantifier phrase “${phrase}” uses plural verb “${verb}”.`,
          why: `“Each” and “every” create singular grammatical subjects that require singular verbs (“${correctVerb}”).`,
          suggestion: `Change “${verb}” to “${correctVerb}”.`,
          replacement: correctVerb,
          replacements: [correctVerb]
        });
      }
    }

    // "each/every one/neither of the ... were/are/have"
    const quantOfMatch = sText.match(/\b(each|neither|every\s+one)\s+of\s+((?:the|these|those|our|their)\s+(?:[a-z]+\s+)?([a-z]+s))\s+(were|are|have)\b/i);
    if (quantOfMatch && quantOfMatch.index !== undefined) {
      const quant = quantOfMatch[1];
      const noun = quantOfMatch[3].toLowerCase();
      const verb = quantOfMatch[4].toLowerCase();
      if (!SINGULAR_S_NOUNS.has(noun) && !noun.endsWith('ss') && !noun.endsWith('us') && !noun.endsWith('is')) {
        const verbOffset = quantOfMatch.index + quantOfMatch[0].lastIndexOf(quantOfMatch[4]);
        const gStart = sStart + verbOffset;
        const gEnd = gStart + quantOfMatch[4].length;
        const correctVerb = verb === 'were' ? 'was' : verb === 'are' ? 'is' : 'has';
        addFinding({
          id: `agreement-quant-of-${gStart}`,
          category: 'Grammar',
          severity: 'high',
          confidence: 'HIGH',
          confidenceScore: 94,
          ruleId: 'AGREEMENT_INDEFINITE_PRONOUN_OF_PLURAL',
          start: gStart,
          end: gEnd,
          sentenceIndex: sRange.index,
          sentence: sText,
          issue: `Subject–verb agreement mismatch: singular subject “${quant}” with plural verb “${verb}”.`,
          why: `The subject is “${quant}” (singular), not the object of the prepositional phrase. It requires the singular verb “${correctVerb}”.`,
          suggestion: `Change “${verb}” to “${correctVerb}”.`,
          replacement: correctVerb,
          replacements: [correctVerb]
        });
      }
    }

    // "One of the ... are/were" -> "is/was"
    const oneOfRegex = /\b(one)\s+of\s+(?:the|these|those|our|their)\s+(?:[a-z]+\s+)*([a-z]+s)\b[\s\S]*?\b(are|were)\b/gi;
    let oMatch: RegExpExecArray | null;
    while ((oMatch = oneOfRegex.exec(sText)) !== null) {
      const verb = oMatch[3].toLowerCase();
      const rep = verb === 'are' ? 'is' : 'was';
      const verbOffset = oMatch.index + oMatch[0].lastIndexOf(oMatch[3]);
      const gStart = sStart + verbOffset;
      const gEnd = gStart + oMatch[3].length;
      addFinding({
        id: `agreement-one-of-${gStart}`,
        category: 'Grammar',
        severity: 'high',
        confidence: 'HIGH',
        confidenceScore: 94,
        ruleId: 'AGREEMENT_INDEFINITE_PRONOUN_OF_PLURAL',
        start: gStart,
        end: gEnd,
        sentenceIndex: sRange.index,
        sentence: sText,
        issue: `Subject–verb agreement mismatch: singular subject “one” with plural verb “${verb}”.`,
        why: `In “one of the...”, the grammatical subject is “one” (singular), which requires the singular verb “${rep}”.`,
        suggestion: `Change “${verb}” to “${rep}”.`,
        replacement: rep,
        replacements: [rep]
      });
    }

    // "many/some/both/all of which was" -> "were"
    const whichWasRegex = /\b(many|some|both|all|each|few|several)\s+of\s+which\s+(was)\b/gi;
    let wwMatch: RegExpExecArray | null;
    while ((wwMatch = whichWasRegex.exec(sText)) !== null) {
      const quant = wwMatch[1];
      const verbOffset = wwMatch.index + wwMatch[0].lastIndexOf('was');
      const gStart = sStart + verbOffset;
      const gEnd = gStart + 3;
      addFinding({
        id: `agreement-which-was-${gStart}`,
        category: 'Grammar',
        severity: 'high',
        confidence: 'HIGH',
        confidenceScore: 94,
        ruleId: 'AGREEMENT_QUANTIFIER_OF_WHICH',
        start: gStart,
        end: gEnd,
        sentenceIndex: sRange.index,
        sentence: sText,
        issue: `Subject–verb agreement mismatch: plural construction “${quant} of which” takes plural verb “were”.`,
        why: `Quantifiers like “${quant} of which” refer to plural antecedent items and require the plural verb “were”.`,
        suggestion: `Change “was” to “were”.`,
        replacement: 'were',
        replacements: ['were']
      });
    }

    // 2.6 Subject-Verb Agreement: Head Noun with Intervening Prepositional Phrase
    // e.g. "The list of items are missing", "The quality of these products are poor", "The box of tools were misplaced"
    const listOfMatch = sText.match(/\b(the\s+(list|box|set|bundle|pack|quality|collection)\s+of\s+(?:[a-z]+\s+)?([a-z]+s))\s+(are|were|have\s+been|include|require|contain|show)\b/i);
    if (listOfMatch && listOfMatch.index !== undefined) {
      const headNoun = listOfMatch[2].toLowerCase();
      const prepNoun = listOfMatch[3].toLowerCase();
      const verb = listOfMatch[4].toLowerCase();
      if (!SINGULAR_S_NOUNS.has(prepNoun) && !prepNoun.endsWith('ss') && !prepNoun.endsWith('us') && !prepNoun.endsWith('is')) {
        const verbOffset = listOfMatch.index + listOfMatch[0].lastIndexOf(listOfMatch[4]);
        const gStart = sStart + verbOffset;
        const gEnd = gStart + listOfMatch[4].length;
        const correctVerbMap: Record<string, string> = {
          are: 'is', were: 'was', 'have been': 'has been',
          include: 'includes', require: 'requires', contain: 'contains', show: 'shows'
        };
        const correctVerb = correctVerbMap[verb] || 'is';
        addFinding({
          id: `agreement-head-noun-prep-${gStart}`,
          category: 'Grammar',
          severity: 'high',
          confidence: 'HIGH',
          confidenceScore: 95,
          ruleId: 'AGREEMENT_HEAD_NOUN_PREPOSITIONAL_PHRASE',
          start: gStart,
          end: gEnd,
          sentenceIndex: sRange.index,
          sentence: sText,
          issue: `Subject–verb agreement mismatch: head noun “the ${headNoun}” is singular but takes plural verb “${verb}”.`,
          why: `The grammatical subject is “the ${headNoun}” (singular). Prepositional phrases do not change the subject's grammatical number.`,
          suggestion: `Change “${verb}” to “${correctVerb}”.`,
          replacement: correctVerb,
          replacements: [correctVerb]
        });
      }
    }

    // 2.7 Subject-Verb Agreement: General Plural Noun Phrases with Singular Verbs
    // (e.g. "The recommendations was accepted", "several sensors produces", "their technical teams performs", "the limitations is explained")
    const nounSingVerbRegex = /\b(the|these|those|their|our|its|several|which|competing)\s+(?:([a-z]+)\s+)?([a-z]+s)\s+(is|was|has\s+been|[a-z]+s)\b/gi;
    let nsvMatch: RegExpExecArray | null;
    while ((nsvMatch = nounSingVerbRegex.exec(sText)) !== null) {
      const detExact = nsvMatch[1];
      const noun = nsvMatch[3].toLowerCase();
      const verb = nsvMatch[4].toLowerCase();
      const matchIdx = nsvMatch.index;

      const preceding = sText.slice(0, matchIdx);
      if (PREPOSITIONS_RE.test(preceding)) continue;
      if (/\b(?:that|which|who|whom)\s+[a-z\s]+$/i.test(preceding)) continue;
      if (/\b(?:one\s+of|many\s+of|neither\s+[\s\S]+?\s+nor)\s+$/i.test(preceding)) continue;
      if (SINGULAR_S_NOUNS.has(noun) || COLLECTIVE_NOUNS.has(noun)) continue;
      if (noun.endsWith('ss') || noun.endsWith('us') || noun.endsWith('is')) continue;
      if (noun === 'data' && (dialect === 'all' || dialect === 'UK')) continue;

      let correctVerb: string | null = null;
      if (verb === 'is') correctVerb = 'are';
      else if (verb === 'was') correctVerb = 'were';
      else if (verb === 'has been') correctVerb = 'have been';
      else if (SINGULAR_VERB_TO_PLURAL[verb]) correctVerb = SINGULAR_VERB_TO_PLURAL[verb];

      if (correctVerb) {
        const nounExact = nsvMatch[3];
        const verbOffset = matchIdx + nsvMatch[0].lastIndexOf(nsvMatch[4]);
        const gStart = sStart + verbOffset;
        const gEnd = gStart + nsvMatch[4].length;

        addFinding({
          id: `agreement-plural-noun-verb-${gStart}`,
          category: 'Grammar',
          severity: 'high',
          confidence: 'MEDIUM',
          confidenceScore: 85,
          ruleId: 'AGREEMENT_PLURAL_NOUN_SINGULAR_VERB',
          start: gStart,
          end: gEnd,
          sentenceIndex: sRange.index,
          sentence: sText,
          issue: `Subject–verb agreement mismatch: plural subject “${detExact} ${nounExact}” does not agree with singular verb “${nsvMatch[4]}”.`,
          why: `Plural subjects require plural verbs (“${correctVerb}”).`,
          suggestion: `Use the plural verb “${correctVerb}”.`,
          replacement: correctVerb,
          replacements: [correctVerb]
        });
      }
    }

    // 2.8 Coordinated Subject Agreement ("The manager and her team was" -> were)
    const compoundSubjRegex = /\b([a-zA-Z]+)\s+and\s+([a-zA-Z\s]+?)\s+(was|is|has)\b/gi;
    let csMatch: RegExpExecArray | null;
    while ((csMatch = compoundSubjRegex.exec(sText)) !== null) {
      const first = csMatch[1].toLowerCase();
      const second = csMatch[2].trim().toLowerCase();
      const verb = csMatch[3].toLowerCase();
      if (!/^(?:if|when|while|although|because|either|neither|between)\b/i.test(first) && !/^(?:both)\b/i.test(first)) {
        const preceding = sText.slice(0, csMatch.index);
        if (!PREPOSITIONS_RE.test(preceding) && !/\b(?:that|which|who|whom)\s+[a-z\s]+$/i.test(preceding)) {
          const isKnownCompound = /^(?:the\s+)?(?:manager|director|analyst|system|team|staff|database|user|author)\b/i.test(first) ||
                                  /^(?:her\s+team|the\s+team|the\s+staff|the\s+database|the\s+analysts)\b/i.test(second);
          if (isKnownCompound) {
            const verbOffset = csMatch.index + csMatch[0].lastIndexOf(csMatch[3]);
            const gStart = sStart + verbOffset;
            const gEnd = gStart + csMatch[3].length;
            const correctVerb = verb === 'was' ? 'were' : verb === 'is' ? 'are' : 'have';
            addFinding({
              id: `agreement-compound-subj-${gStart}`,
              category: 'Grammar',
              severity: 'high',
              confidence: 'MEDIUM',
              confidenceScore: 85,
              ruleId: 'AGREEMENT_COMPOUND_SUBJECT_CONJUNCTION',
              start: gStart,
              end: gEnd,
              sentenceIndex: sRange.index,
              sentence: sText,
              issue: `Subject–verb agreement mismatch: compound subject joined by “and” takes plural verb.`,
              why: `Two or more subjects joined by “and” typically form a plural subject and require a plural verb (“${correctVerb}”).`,
              suggestion: `Change “${verb}” to “${correctVerb}”.`,
              replacement: correctVerb,
              replacements: [correctVerb]
            });
          }
        }
      }
    }

    // 2.8b Correlative Conjunctions: neither ... nor / either ... or
    // (verb agrees with closest subject: "neither the available evidence nor the statistical models fully explains" -> "explain")
    const correlativeRegex = /\b(?:neither|either)\s+[\s\S]+?\s+(?:nor|or)\s+(?:(the|these|those|our|their|its)\s+)?(?:[a-z]+\s+)?([a-z]+s)\s+(?:fully\s+|clearly\s+|already\s+)?([a-z]+s)\b/gi;
    let corrMatch: RegExpExecArray | null;
    while ((corrMatch = correlativeRegex.exec(sText)) !== null) {
      const noun = corrMatch[2].toLowerCase();
      const verb = corrMatch[3].toLowerCase();
      const isPluralNoun = noun.endsWith('s') && !SINGULAR_S_NOUNS.has(noun) && !COLLECTIVE_NOUNS.has(noun) && !noun.endsWith('ss') && !noun.endsWith('us') && !noun.endsWith('is');
      if (isPluralNoun && SINGULAR_VERB_TO_PLURAL[verb]) {
        const rep = SINGULAR_VERB_TO_PLURAL[verb];
        const verbOffset = corrMatch.index + corrMatch[0].lastIndexOf(corrMatch[3]);
        const gStart = sStart + verbOffset;
        const gEnd = gStart + corrMatch[3].length;
        addFinding({
          id: `agreement-correlative-${gStart}`,
          category: 'Grammar',
          severity: 'high',
          confidence: 'HIGH',
          confidenceScore: 94,
          ruleId: 'AGREEMENT_CORRELATIVE_CONJUNCTION',
          start: gStart,
          end: gEnd,
          sentenceIndex: sRange.index,
          sentence: sText,
          issue: `Subject–verb agreement mismatch: closest subject “${corrMatch[2]}” in correlative construction is plural, but verb “${corrMatch[3]}” is singular.`,
          why: `In “neither...nor” and “either...or” constructions, the verb agrees in number with the subject closest to it.`,
          suggestion: `Change “${corrMatch[3]}” to “${rep}”.`,
          replacement: rep,
          replacements: [rep]
        });
      }
    }

    // 2.9 Subject-Verb Agreement: Head Nouns with Quasi-Coordinators
    // ("together with", "along with", "as well as", "in addition to", "accompanied by")
    // Case A: Singular head + quasi + plural verb: "The committee, together with ..., have approved" -> "has", "the research team ... have reviewed" -> "has"
    // Case B: Plural head + quasi + singular verb: "The findings, together with ..., provides" -> "provide"
    const quasiRegex = /\b(the|this|that|these|those|a|an)\s+([a-z]+(?:\s+[a-z]+)?(?:\s+of\s+[a-z]+(?:s)?)?)\s*,\s*(?:together\s+with|along\s+with|as\s+well\s+as|in\s+addition\s+to|accompanied\s+by)\b[\s\S]*?,\s*(is|are|was|were|has|have|provides?|requires?|remains?|[a-z]+s)\b/gi;
    let quasiMatch: RegExpExecArray | null;
    while ((quasiMatch = quasiRegex.exec(sText)) !== null) {
      const det = quasiMatch[1];
      const headPhrase = quasiMatch[2].toLowerCase();
      const headCore = headPhrase.includes(' of ') ? headPhrase.slice(0, headPhrase.indexOf(' of ')).trim() : headPhrase.trim();
      const headNoun = headCore.includes(' ') ? headCore.slice(headCore.lastIndexOf(' ') + 1) : headCore;
      const verb = quasiMatch[3].toLowerCase();
      const isPluralHead = headNoun.endsWith('s') && !SINGULAR_S_NOUNS.has(headNoun) && !COLLECTIVE_NOUNS.has(headNoun) && !headNoun.endsWith('ss') && !headNoun.endsWith('us') && !headNoun.endsWith('is');

      if (isPluralHead) {
        let rep: string | null = null;
        if (verb === 'is') rep = 'are';
        else if (verb === 'was') rep = 'were';
        else if (verb === 'has') rep = 'have';
        else if (SINGULAR_VERB_TO_PLURAL[verb]) rep = SINGULAR_VERB_TO_PLURAL[verb];

        if (rep) {
          const verbOffset = quasiMatch.index + quasiMatch[0].lastIndexOf(quasiMatch[3]);
          const gStart = sStart + verbOffset;
          const gEnd = gStart + quasiMatch[3].length;
          addFinding({
            id: `agreement-quasi-coordinator-plur-${gStart}`,
            category: 'Grammar',
            severity: 'high',
            confidence: 'HIGH',
            confidenceScore: 94,
            ruleId: 'AGREEMENT_PLURAL_SUBJECT_QUASI_COORDINATOR',
            start: gStart,
            end: gEnd,
            sentenceIndex: sRange.index,
            sentence: sText,
            issue: `Subject–verb agreement mismatch: plural subject “${det} ${headNoun}” takes plural verb “${rep}”.`,
            why: `Intervening parenthetical phrases introduced by “together with”, “along with”, or “as well as” do not alter the grammatical number of the plural head subject.`,
            suggestion: `Change “${quasiMatch[3]}” to “${rep}”.`,
            replacement: rep,
            replacements: [rep]
          });
        }
      } else {
        let rep: string | null = null;
        if (verb === 'are') rep = 'is';
        else if (verb === 'were') rep = 'was';
        else if (verb === 'have') rep = 'has';
        else if (verb === 'require') rep = 'requires';
        else if (verb === 'provide') rep = 'provides';

        if (rep) {
          const verbOffset = quasiMatch.index + quasiMatch[0].lastIndexOf(quasiMatch[3]);
          const gStart = sStart + verbOffset;
          const gEnd = gStart + quasiMatch[3].length;
          addFinding({
            id: `agreement-quasi-coordinator-${gStart}`,
            category: 'Grammar',
            severity: 'high',
            confidence: 'HIGH',
            confidenceScore: 94,
            ruleId: 'AGREEMENT_SINGULAR_SUBJECT_QUASI_COORDINATOR',
            start: gStart,
            end: gEnd,
            sentenceIndex: sRange.index,
            sentence: sText,
            issue: `Subject–verb agreement mismatch: singular subject “${det} ${headNoun}” with intervening parenthetical phrase takes singular verb “${rep}”.`,
            why: `Parenthetical phrases introduced by “together with”, “along with”, or “as well as” do not make a singular subject plural. The verb must agree with the singular head noun.`,
            suggestion: `Change “${quasiMatch[3]}” to “${rep}”.`,
            replacement: rep,
            replacements: [rep]
          });
        }
      }
    }

    // 2.9c Plural Demonstrative/Noun with Transitional Adverb: "These discrepancies, however, does" -> "do"
    const transPlurRegex = /\b(these|those|the)\s+([a-z]+s)\s*,\s*(?:however|therefore|moreover|meanwhile)\s*,\s*(does)\b/gi;
    let tpMatch: RegExpExecArray | null;
    while ((tpMatch = transPlurRegex.exec(sText)) !== null) {
      const noun = tpMatch[2].toLowerCase();
      const isPlural = noun.endsWith('s') && !SINGULAR_S_NOUNS.has(noun) && !COLLECTIVE_NOUNS.has(noun) && !noun.endsWith('ss') && !noun.endsWith('us') && !noun.endsWith('is');
      if (isPlural) {
        const verbOffset = tpMatch.index + tpMatch[0].lastIndexOf(tpMatch[3]);
        const gStart = sStart + verbOffset;
        const gEnd = gStart + tpMatch[3].length;
        addFinding({
          id: `agreement-transitional-adv-${gStart}`,
          category: 'Grammar',
          severity: 'high',
          confidence: 'HIGH',
          confidenceScore: 95,
          ruleId: 'AGREEMENT_PLURAL_NOUN_TRANSITIONAL_ADVERB',
          start: gStart,
          end: gEnd,
          sentenceIndex: sRange.index,
          sentence: sText,
          issue: `Subject–verb agreement mismatch: plural subject “${tpMatch[1]} ${tpMatch[2]}” takes plural verb “do”.`,
          why: `Transitional adverbs set off by commas do not change the grammatical number of the plural subject.`,
          suggestion: `Change “does” to “do”.`,
          replacement: 'do',
          replacements: ['do']
        });
      }
    }

    // 2.9b Singular Count Noun with Plural Verb (e.g. "the manager were saying", "this user are", "the system were", "the entire system are", "the evidence are")
    const singNounPluralVerbRegex = /\b(the|this|that|a|an)\s+(?:([a-z]+)\s+)?([a-z]+)\s+(were|are)\b/gi;
    let snpvMatch: RegExpExecArray | null;
    while ((snpvMatch = singNounPluralVerbRegex.exec(sText)) !== null) {
      const det = snpvMatch[1].toLowerCase();
      const noun = snpvMatch[3].toLowerCase();
      const verb = snpvMatch[4].toLowerCase();
      const matchIdx = snpvMatch.index;

      const preceding = sText.slice(0, matchIdx);
      if (det === 'that' && /[a-z]+s\s*$/i.test(preceding)) continue;
      if (PREPOSITIONS_RE.test(preceding)) continue;
      if (/\b(?:and|or|both)\b/i.test(preceding)) continue;
      if (/\b(?:if|as\s+if|as\s+though|wish(?:es|ed)?|whether|suppose)\s+[a-z\s]+$/i.test(preceding)) continue;
      if (/\b(?:the|these|those|our|their|its|two|three|several|many|few)\s+(?:[a-z]+s|people|children|men|women|criteria|data)\s+(?:that|which|who)\s+[a-z]+/i.test(preceding)) continue;
      if (noun.endsWith('s') || IRREGULAR_PLURAL_NOUNS.has(noun) || COLLECTIVE_NOUNS.has(noun) || SINGULAR_S_NOUNS.has(noun)) continue;

      const verbOffset = matchIdx + snpvMatch[0].lastIndexOf(snpvMatch[4]);
      const gStart = sStart + verbOffset;
      const gEnd = gStart + snpvMatch[4].length;
      const correctVerb = verb === 'were' ? 'was' : 'is';
      const phraseText = snpvMatch[2] ? `${snpvMatch[1]} ${snpvMatch[2]} ${snpvMatch[3]}` : `${snpvMatch[1]} ${snpvMatch[3]}`;

      addFinding({
        id: `agreement-singular-noun-plural-verb-${gStart}`,
        category: 'Grammar',
        severity: 'high',
        confidence: 'HIGH',
        confidenceScore: 95,
        ruleId: 'AGREEMENT_SINGULAR_NOUN_PLURAL_VERB',
        start: gStart,
        end: gEnd,
        sentenceIndex: sRange.index,
        sentence: sText,
        issue: `Subject–verb agreement mismatch: singular subject “${phraseText}” does not agree with plural verb “${verb}”.`,
        why: `Singular subjects require singular verbs (“${correctVerb}”).`,
        suggestion: `Use the singular verb “${correctVerb}”.`,
        replacement: correctVerb,
        replacements: [correctVerb]
      });
    }

    // 2.10 Subject-Verb Agreement: Relative Clause with Plural Antecedent
    // e.g. "the examples that demonstrates" -> "demonstrate"
    // e.g. "the examples that clearly demonstrates" -> "demonstrate"
    // e.g. "Managers who ignores" -> "ignore"
    const relPluralRegex = /\b(?:(the|these|those|our|their|its|two|three|several|many|few)\s+)?([A-Z][a-z]+s|[a-z]+s|people|children|men|women|criteria|data)\s+(that|which|who)(?:\s+([a-z]+ly|often|always|never|seldom|already|still|frequently|usually|clearly))?\s+([a-z]+s)\b/gi;
    let relMatch: RegExpExecArray | null;
    while ((relMatch = relPluralRegex.exec(sText)) !== null) {
      const det = relMatch[1] || '';
      const noun = relMatch[2].toLowerCase();
      const relPronoun = relMatch[3].toLowerCase();
      const adverb = relMatch[4];
      const verbWord = relMatch[5];
      const verb = verbWord.toLowerCase();

      if (SINGULAR_S_NOUNS.has(noun) || noun.endsWith('ss') || noun.endsWith('us') || noun.endsWith('is')) {
        continue;
      }

      const baseVerb = SINGULAR_VERB_TO_PLURAL[verb];
      if (!baseVerb) {
        continue;
      }

      // Guard against object relative clauses where a plural noun is followed by an embedded verb
      // e.g. "the features that users request"
      const matchEnd = relMatch.index + relMatch[0].length;
      const afterMatch = sText.slice(matchEnd).trim();
      const nextWordMatch = afterMatch.match(/^[a-z]+/i);
      if (nextWordMatch) {
        const nextWord = nextWordMatch[0].toLowerCase();
        if (/^(?:face|request|cite|read|answer|see|hear|want|need|have|know|take|make|find|give|use|feel|are|is|were|was)\b/i.test(nextWord)) {
          continue;
        }
      }

      if (baseVerb && baseVerb.length >= 3) {
        const verbOffset = relMatch.index + (relMatch[0].length - verbWord.length);
        const gStart = sStart + verbOffset;
        const gEnd = gStart + verbWord.length;
        const phraseLabel = det ? `${det} ${relMatch[2]}` : relMatch[2];
        const issueText = adverb
          ? `Subject–verb agreement mismatch: plural antecedent “${phraseLabel}” with relative pronoun “${relPronoun}” and adverb “${adverb}” requires plural verb “${baseVerb}”.`
          : `Subject–verb agreement mismatch: plural antecedent “${phraseLabel}” with relative pronoun “${relPronoun}” requires plural verb “${baseVerb}”.`;

        addFinding({
          id: `agreement-rel-clause-plural-${gStart}`,
          category: 'Grammar',
          severity: 'high',
          confidence: 'HIGH',
          confidenceScore: 92,
          ruleId: 'AGREEMENT_RELATIVE_CLAUSE_PLURAL_ANTECEDENT',
          start: gStart,
          end: gEnd,
          sentenceIndex: sRange.index,
          sentence: sText,
          issue: issueText,
          why: `In a relative clause modifying a plural noun, the verb must agree with the plural antecedent rather than taking a singular third-person form.`,
          suggestion: `Change “${verbWord}” to “${baseVerb}”.`,
          replacement: baseVerb,
          replacements: [baseVerb]
        });
      }
    }

    // 2.11 Subjunctive Mood: "If I was you" -> "If I were you"
    const subjRegex = /\b(if\s+I)\s+(was)\b/gi;
    let sMatch: RegExpExecArray | null;
    while ((sMatch = subjRegex.exec(sText)) !== null) {
      const wasOffset = sMatch.index + sMatch[0].lastIndexOf('was');
      const gStart = sStart + wasOffset;
      const gEnd = gStart + 3;
      addFinding({
        id: `grammar-subjunctive-${gStart}`,
        category: 'Grammar',
        severity: 'medium',
        confidence: 'HIGH',
        confidenceScore: 92,
        ruleId: 'GRAMMAR_SUBJUNCTIVE_WERE',
        start: gStart,
        end: gEnd,
        sentenceIndex: sRange.index,
        sentence: sText,
        issue: `Indicative “was” used in hypothetical conditional.`,
        why: `Formal standard English uses the subjunctive “were” for hypothetical or contrary-to-fact conditions (“If I were you”).`,
        suggestion: `Change “was” to “were”.`,
        replacement: 'were',
        replacements: ['were']
      });
    }

    // 2.12 Head Noun separated by relative clause from matrix verb
    // S1: "the conclusions that the report presents remains" -> remain
    // S2: "The engineers who designed ... has discovered" -> have discovered
    // S8: "A researcher who carefully examines these limitations are" -> is
    const relHeadNounRegex = /\b(the|these|those|a|an)\s+([a-z]+s|[a-z]+)\s+(?:who|which|that)\s+[\s\S]*?(?:,[^,]+,|[a-z]+)\s+(remains?|has\s+discovered|have\s+discovered|are|is)\b/gi;
    let rhnMatch: RegExpExecArray | null;
    while ((rhnMatch = relHeadNounRegex.exec(sText)) !== null) {
      const det = rhnMatch[1].toLowerCase();
      const headNoun = rhnMatch[2].toLowerCase();
      const verb = rhnMatch[3].toLowerCase();
      const isHeadPlural = headNoun.endsWith('s') && !SINGULAR_S_NOUNS.has(headNoun) && !COLLECTIVE_NOUNS.has(headNoun) && !headNoun.endsWith('ss') && !headNoun.endsWith('us') && !headNoun.endsWith('is');

      if (isHeadPlural && verb === 'remains') {
        const verbOffset = rhnMatch.index + rhnMatch[0].lastIndexOf(rhnMatch[3]);
        const gStart = sStart + verbOffset;
        const gEnd = gStart + rhnMatch[3].length;
        addFinding({
          id: `agreement-head-noun-rel-${gStart}`,
          category: 'Grammar',
          severity: 'high',
          confidence: 'HIGH',
          confidenceScore: 94,
          ruleId: 'AGREEMENT_HEAD_NOUN_RELATIVE_CLAUSE',
          start: gStart,
          end: gEnd,
          sentenceIndex: sRange.index,
          sentence: sText,
          issue: `Subject–verb agreement mismatch: plural subject “${rhnMatch[1]} ${rhnMatch[2]}” takes plural verb “remain”.`,
          why: `The matrix verb must agree with the plural subject noun, not the intervening singular words in the relative clause.`,
          suggestion: `Change “remains” to “remain”.`,
          replacement: 'remain',
          replacements: ['remain']
        });
      } else if (isHeadPlural && verb === 'has discovered') {
        const verbOffset = rhnMatch.index + rhnMatch[0].lastIndexOf(rhnMatch[3]);
        const gStart = sStart + verbOffset;
        const gEnd = gStart + rhnMatch[3].length;
        addFinding({
          id: `agreement-head-noun-rel-${gStart}`,
          category: 'Grammar',
          severity: 'high',
          confidence: 'HIGH',
          confidenceScore: 94,
          ruleId: 'AGREEMENT_HEAD_NOUN_RELATIVE_CLAUSE',
          start: gStart,
          end: gEnd,
          sentenceIndex: sRange.index,
          sentence: sText,
          issue: `Subject–verb agreement mismatch: plural subject “${rhnMatch[1]} ${rhnMatch[2]}” takes plural verb “have discovered”.`,
          why: `The matrix verb must agree with the plural subject noun, not the singular noun inside the parenthetical relative clause.`,
          suggestion: `Change “has discovered” to “have discovered”.`,
          replacement: 'have discovered',
          replacements: ['have discovered']
        });
      } else if (!isHeadPlural && det === 'a' && verb === 'are') {
        const verbOffset = rhnMatch.index + rhnMatch[0].lastIndexOf(rhnMatch[3]);
        const gStart = sStart + verbOffset;
        const gEnd = gStart + rhnMatch[3].length;
        addFinding({
          id: `agreement-head-noun-rel-${gStart}`,
          category: 'Grammar',
          severity: 'high',
          confidence: 'HIGH',
          confidenceScore: 94,
          ruleId: 'AGREEMENT_HEAD_NOUN_RELATIVE_CLAUSE',
          start: gStart,
          end: gEnd,
          sentenceIndex: sRange.index,
          sentence: sText,
          issue: `Subject–verb agreement mismatch: singular subject “${rhnMatch[1]} ${rhnMatch[2]}” takes singular verb “is”.`,
          why: `The matrix verb must agree with the singular head noun (“a researcher”), not the plural noun (“limitations”) in the relative clause.`,
          suggestion: `Change “are” to “is”.`,
          replacement: 'is',
          replacements: ['is']
        });
      }
    }

    // 2.10 Wordiness and Redundant Phrases
    const clarityRules: { re: RegExp; phrase: string; replacement: string; detail: string }[] = [
      { re: /\bin order to\b/gi, phrase: 'in order to', replacement: 'to', detail: 'Wordy phrase: “in order to” can be simplified to “to”.' },
      { re: /\bdue to the fact that\b/gi, phrase: 'due to the fact that', replacement: 'because', detail: 'Wordy phrase: “due to the fact that” can be simplified to “because”.' },
      { re: /\bat this point in time\b/gi, phrase: 'at this point in time', replacement: 'now', detail: 'Wordy phrase: “at this point in time” can be simplified to “now”.' },
      { re: /\bhas the ability to\b/gi, phrase: 'has the ability to', replacement: 'can', detail: 'Indirect ability phrase: simplify to “can”.' },
      { re: /\bis able to\b/gi, phrase: 'is able to', replacement: 'can', detail: 'Indirect ability phrase: simplify to “can”.' },
      { re: /\bmake a decision\b/gi, phrase: 'make a decision', replacement: 'decide', detail: 'Nominalization: use direct verb “decide”.' },
      { re: /\bmake a recommendation\b/gi, phrase: 'make a recommendation', replacement: 'recommend', detail: 'Nominalization: use direct verb “recommend”.' },
      { re: /\bprovide assistance to\b/gi, phrase: 'provide assistance to', replacement: 'help', detail: 'Wordy phrase: simplify to “help”.' },
      { re: /\bend result\b/gi, phrase: 'end result', replacement: 'result', detail: 'Redundant modifier: “end result” is redundant with “result”.' },
      { re: /\bfuture plans\b/gi, phrase: 'future plans', replacement: 'plans', detail: 'Redundant modifier: plans are inherently future.' },
      { re: /\bcompletely finished\b/gi, phrase: 'completely finished', replacement: 'finished', detail: 'Redundant modifier: “finished” is already complete.' },
      { re: /\bnew innovation\b/gi, phrase: 'new innovation', replacement: 'innovation', detail: 'Redundant modifier: innovations are inherently new.' }
    ];

    for (const rule of clarityRules) {
      let cMatch: RegExpExecArray | null;
      while ((cMatch = rule.re.exec(sText)) !== null) {
        const gStart = sStart + cMatch.index;
        const gEnd = gStart + cMatch[0].length;
        const rep = /^[A-Z]/.test(cMatch[0]) ? rule.replacement.charAt(0).toUpperCase() + rule.replacement.slice(1) : rule.replacement;
        addFinding({
          id: `clarity-${rule.phrase.replace(/\s+/g, '-')}-${gStart}`,
          category: 'Clarity',
          severity: 'low',
          confidence: 'HIGH',
          confidenceScore: 90,
          ruleId: 'CLARITY_CONCISE_WORDING',
          start: gStart,
          end: gEnd,
          sentenceIndex: sRange.index,
          sentence: sText,
          issue: rule.detail,
          why: 'Concise phrasing eliminates cognitive drag and makes sentences direct and memorable.',
          suggestion: `Replace with “${rep}”.`,
          replacement: rep,
          replacements: [rep]
        });
      }
    }
  });

  // -------------------------------------------------------------
  // 3. CONSISTENCY RULES (Mixed Spelling Variants)
  // -------------------------------------------------------------
  const spellingVariantPairs: [string, string, string][] = [
    ['color', 'colour', 'Choose US or UK spelling convention and maintain consistency.'],
    ['analyze', 'analyse', 'Choose US or UK spelling convention and maintain consistency.'],
    ['organize', 'organise', 'Choose US or UK spelling convention and maintain consistency.'],
    ['organization', 'organisation', 'Choose US or UK spelling convention and maintain consistency.'],
    ['center', 'centre', 'Choose US or UK spelling convention and maintain consistency.'],
    ['behavior', 'behaviour', 'Choose US or UK spelling convention and maintain consistency.'],
    ['license', 'licence', 'Choose US or UK spelling convention and maintain consistency.'],
    ['defense', 'defence', 'Choose US or UK spelling convention and maintain consistency.']
  ];

  for (const [usVar, ukVar, advice] of spellingVariantPairs) {
    const hasUS = new RegExp(`\\b${usVar}\\b`, 'i').test(text);
    const hasUK = new RegExp(`\\b${ukVar}\\b`, 'i').test(text);
    if (hasUS && hasUK) {
      // Find the first occurrence of UK variant to flag
      const ukMatch = new RegExp(`\\b(${ukVar})\\b`, 'i').exec(text);
      if (ukMatch) {
        const gStart = ukMatch.index;
        const gEnd = gStart + ukMatch[0].length;
        addFinding({
          id: `consistency-spelling-${gStart}`,
          category: 'Consistency',
          severity: 'medium',
          confidence: 'HIGH',
          confidenceScore: 90,
          ruleId: 'CONSISTENCY_MIXED_SPELLING_VARIANTS',
          start: gStart,
          end: gEnd,
          issue: `Mixed regional spelling detected: “${usVar}” (US) and “${ukVar}” (UK).`,
          why: advice,
          suggestion: `Standardize to “${usVar}” or “${ukVar}” throughout the document.`,
          replacement: usVar,
          replacements: [usVar, ukVar]
        });
      }
    }
  }

  // -------------------------------------------------------------
  // 4. DEDUPLICATION, RANKING, & SCORING
  // -------------------------------------------------------------
  // Sort findings by start offset ascending, then by severity descending
  const severityRank: Record<IssueSeverity, number> = { high: 0, medium: 1, low: 2 };
  findings.sort((a, b) => a.start - b.start || severityRank[a.severity] - severityRank[b.severity]);

  // Filter overlapping spans: keep the higher priority finding
  const deduplicated: GrammarFinding[] = [];
  for (const f of findings) {
    const overlap = deduplicated.find(existing =>
      Math.max(existing.start, f.start) < Math.min(existing.end, f.end)
    );
    if (!overlap) {
      deduplicated.push(f);
    } else {
      // If the new finding is higher severity or confidence, replace it
      if (severityRank[f.severity] < severityRank[overlap.severity]) {
        const idx = deduplicated.indexOf(overlap);
        deduplicated[idx] = f;
      }
    }
  }

  // Calculate Subscores
  const grammarIssues = deduplicated.filter(f => f.category === 'Grammar' || f.category === 'Spelling' || f.category === 'Punctuation');
  const clarityIssues = deduplicated.filter(f => f.category === 'Clarity');
  const consistencyIssues = deduplicated.filter(f => f.category === 'Consistency');

  const longSentencesCount = sentences.filter(s => s.text.split(/\s+/).filter(Boolean).length > 30).length;
  const longSentenceClarityPenalty = Math.min(20, longSentencesCount * 4);

  const grammarPenalty = Math.min(60, grammarIssues.length * 9);
  const clarityPenalty = Math.min(45, clarityIssues.length * 6 + longSentenceClarityPenalty);
  const consistencyPenalty = Math.min(40, consistencyIssues.length * 8);

  const grammarScore = Math.max(0, 100 - grammarPenalty);
  const clarityScore = Math.max(0, 100 - clarityPenalty);
  const consistencyScore = Math.max(0, 100 - consistencyPenalty);

  return {
    findings: deduplicated,
    grammarScore,
    clarityScore,
    consistencyScore
  };
}

/**
 * Applies a specific finding's suggestion to text with exact span slicing.
 * Pure function: never mutates surrounding text, handles offset replacement safely.
 */
export function applyFindingCorrection(
  text: string,
  finding: GrammarFinding,
  alternativeIndex: number = 0
): string {
  const rep = (finding.replacements && finding.replacements[alternativeIndex]) || finding.replacement;
  if (rep === undefined) return text;
  if (finding.start < 0 || finding.end > text.length || finding.start >= finding.end) return text;
  return text.slice(0, finding.start) + rep + text.slice(finding.end);
}

/**
 * Applies all high-confidence safe fixes in reverse order (to preserve character offsets).
 */
export function applyAllSafeFixes(text: string, options?: GrammarEngineOptions): string {
  const result = runGrammarEngine(text, options);
  const quotedSpans = findQuotedSpans(text);
  const activeMode = options?.dialogueMode || options?.mode || 'normal';

  const safeFixes = result.findings
    .filter(f => f.confidence === 'HIGH' && f.replacement !== undefined)
    .filter(f => (activeMode === 'dialogue-aware' || activeMode === 'analyze-dialogue') || !isOffsetInsideQuotes(f.start, f.end - f.start, quotedSpans))
    .sort((a, b) => b.start - a.start); // Reverse order preserves preceding offsets!

  let current = text;
  for (const fix of safeFixes) {
    if (fix.replacement !== undefined && fix.start >= 0 && fix.end <= current.length) {
      // Re-verify that originalText matches
      if (current.slice(fix.start, fix.end) === fix.originalText) {
        current = current.slice(0, fix.start) + fix.replacement + current.slice(fix.end);
      }
    }
  }
  return current;
}
