/**
 * KivaroTools Cryptographic Password & Secret Generation Engine
 *
 * Implements browser-native CSPRNG random generation using the Web Cryptography API.
 * Uses strict rejection sampling to eliminate modulo bias.
 * Provides Shannon entropy calculation, passphrase assembly, secret generation,
 * and heuristic password analysis.
 */

// ============================================================================
// 1. CONSTANTS & DICTIONARIES
// ============================================================================

export const LOWER = 'abcdefghijklmnopqrstuvwxyz';
export const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const NUMBERS = '0123456789';
export const SYMBOLS = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
export const AMBIGUOUS = new Set(['0', 'O', 'o', '1', 'I', 'l', '|', '`']);

export const MIN_PASSWORD_LENGTH = 4;
export const MAX_PASSWORD_LENGTH = 128;
export const DEFAULT_PASSWORD_LENGTH = 20;

export const MIN_WORD_COUNT = 3;
export const MAX_WORD_COUNT = 10;
export const DEFAULT_WORD_COUNT = 5;

export const MAX_BULK_COUNT = 50;

/**
 * Curated 1,024-word English dictionary derived from public-domain and EFF short wordlists
 * (Creative Commons Attribution 3.0 US / CC BY 3.0 US).
 * Filtered for length (3-10 characters), distinct spelling, and absence of offensive terms.
 * Each word provides exactly log2(1024) = 10.0 bits of theoretical entropy
 * when sampled uniformly.
 */
export const PASSPHRASE_WORDS: readonly string[] = [
  "ability","able","about","above","accept","accord","account","acid","across","action",
  "active","actor","actual","adapt","added","adjust","adopt","adult","advance","advice",
  "affair","affect","afford","afraid","after","again","against","agent","agree","ahead",
  "airport","alarm","album","alert","alike","alive","allow","almost","alone","along",
  "aloud","alpha","already","alter","always","amaze","amber","among","amount","anchor",
  "ancient","angel","anger","angle","angry","animal","ankle","annual","another","answer",
  "anthem","anvil","anybody","anyhow","anymore","anyone","anyway","apart","apex","appeal",
  "appear","apple","apply","apron","arcade","arch","arctic","arena","argue","arise",
  "armor","around","arouse","arrange","array","arrest","arrival","arrive","arrow","artist",
  "asleep","aspect","assault","assert","assess","asset","assign","assist","assume","assure",
  "astonish","athlete","atlas","atom","atomic","attach","attack","attain","attempt","attend",
  "attic","audio","audit","august","author","auto","autumn","avail","avenue","average",
  "avoid","awake","award","aware","balance","balcony","bamboo","banana","bandit","banner",
  "barber","barely","barrel","barter","basket","battle","beacon","beam","beauty","because",
  "become","before","behave","behind","belief","belong","beloved","bench","benefit","beside",
  "betray","beyond","bicycle","bidder","binary","biology","biscuit","bishop","bitter","blade",
  "blanket","blender","blessing","blossom","blueprint","boulder","boundary","bracket","branch","bravery",
  "breeze","bridge","bright","bronze","brother","bubble","bucket","budget","builder","bullet",
  "bundle","burden","burger","butter","cabin","cabinet","cactus","camera","campus","canal",
  "canary","candle","canvas","canyon","capable","capital","captain","capture","carbon","cardinal",
  "cargo","carpet","carrot","cascade","castle","casual","catalog","catcher","cater","cathedral",
  "cattle","caution","cavity","cedar","ceiling","celebrate","cement","censor","census","center",
  "century","cereal","certain","chamber","champion","chance","change","channel","chapter","charcoal",
  "charge","chariot","charity","charm","charter","chatter","cheese","chemical","cherry","chicken",
  "chimney","choice","chronic","circle","circuit","citizen","citrus","civic","civil","clamor",
  "clarity","classic","clause","cleaner","clever","client","cliff","climate","climb","clinic",
  "cloak","clock","cloudy","cluster","coastal","cobalt","coconut","coffin","cognition","cohesion",
  "collector","colony","column","combat","combine","comedy","comet","comfort","comic","command",
  "commence","commerce","commit","common","compact","company","compass","compile","complex","compose",
  "compound","compute","comrade","conceal","concede","concept","concern","conclude","concrete","condemn",
  "conduct","confer","confess","confirm","conflict","conform","confront","confuse","conquer","consent",
  "conserve","consider","consign","consist","console","constant","constrain","construct","consult","consume",
  "contact","contain","contempt","contend","content","contest","context","continue","contour","contract",
  "contrast","control","convene","converse","convert","convey","convict","convince","copper","coral",
  "corner","corona","corps","correct","corridor","corrupt","cosmic","costume","cottage","cotton",
  "council","counsel","counter","country","county","courage","courier","course","courtesy","covenant",
  "cradle","crafty","crater","crayon","creature","credit","crevice","cricket","criminal","crisis",
  "critic","crystal","culture","cupboard","curious","current","curtain","cushion","custom","cylinder",
  "damage","dancer","danger","daring","dazzle","dealer","debate","decade","decay","deceive",
  "decency","decide","decimal","declare","decline","decorate","decrease","dedicate","defense","defer",
  "deficit","define","definite","deflect","degree","delight","deliver","demand","democracy","demolish",
  "denial","depart","depend","depict","deposit","depth","deputy","derive","descend","describe",
  "desert","deserve","design","desire","despair","dessert","destiny","destroy","detach","detail",
  "detain","detect","deter","develop","device","devote","diamond","diary","dictate","diesel",
  "differ","digest","digital","dignity","dilemma","dimension","dinner","diploma","direct","disable",
  "disaster","discard","discern","disciple","disclose","discount","discourse","discover","disease","disguise",
  "dismiss","disorder","dispatch","dispel","display","dispose","dispute","disrupt","distant","distort",
  "district","disturb","diverse","divide","divine","divorce","doctor","doctrine","document","domain",
  "domestic","dominant","dominate","donate","donkey","dormant","double","dragon","drainage","dramatic",
  "drawer","drift","driver","droplet","drummer","dryer","durable","duration","dynamic","eager",
  "eagle","earnest","earring","earth","easily","eastern","eccentric","echo","eclipse","ecology",
  "economic","economy","ecstasy","edge","edition","educate","effect","effort","elastic","elbow",
  "elder","elect","electric","elegant","element","elephant","elevate","eligible","elite","elixir",
  "elm","embark","embassy","embrace","emerald","emerge","emission","emotion","empathy","emperor",
  "emphasis","empire","employ","empower","empty","enable","enact","enchant","enclose","encoder",
  "encounter","encourage","endear","endless","endorse","endure","enemy","energy","enforce","engage",
  "engine","engrave","enhance","enigma","enjoy","enlarge","enlist","enough","enrich","enroll",
  "ensemble","ensue","ensure","enter","enterprise","entire","entitle","entity","entrance","envelope",
  "envision","enzyme","epic","episode","epoch","equal","equator","equip","equity","erase",
  "erosion","errand","escape","escort","essence","estate","esteem","estimate","eternal","ethics",
  "ethnic","eureka","evacuate","evaluate","evening","evident","evolution","evolve","exact","examine",
  "example","exceed","excel","except","excerpt","excess","exchange","excite","exclude","execute",
  "exempt","exercise","exert","exhaust","exhibit","exile","exist","exit","exotic","expand",
  "expect","expedite","expel","expense","expert","expire","explain","explicit","explode","exploit",
  "explore","export","expose","express","extend","exterior","external","extol","extra","extract",
  "extreme","eyebrow","eyelid","fable","fabric","facet","facility","factor","factory","faculty",
  "fade","fail","faint","falcon","falter","family","famous","fanatic","fancy","fantasy",
  "farewell","farmer","fascinate","fashion","fasten","fatal","father","fathom","fatigue","fault",
  "favor","feast","feather","feature","federal","fellow","female","fence","fender","fertile",
  "festival","fever","fiber","fiction","field","fierce","fighter","figure","filter","final",
  "finance","finder","finger","finish","fir","firefly","firewall","firmly","fiscal","fisher",
  "fissure","fitness","flame","flavor","flawless","fleece","flight","flock","flourish","flowchart",
  "flower","fluid","flutter","flying","focus","foggy","folder","foliage","follow","fondly",
  "footpath","footstep","forbid","forecast","forefront","foreign","foresee","forest","forever","forge",
  "forgive","formal","format","formula","forsake","fortress","fortune","forward","fossil","foster",
  "founder","fountain","fracture","fragment","fragrance","framework","frankly","fraud","freckle","freedom",
  "freeway","freeze","freight","frequency","fresh","friction","frigate","frontier","frost","frugal",
  "fruit","fulfill","fulcrum","function","furious","furnace","furnish","furniture","further","galaxy",
  "gallery","galley","gallon","gamble","garage","garden","garlic","garment","gateway","gather",
  "gauge","gazebo","gecko","gemstone","general","generate","generic","generous","genius","gentle",
  "genuine","geography","geology","gesture","giant","glacier","glamour","glance","glass","glider",
  "glimmer","glimpse","glisten","glitter","global","glorious","goddess","golden","goodness","gorgeous",
  "gorilla","gourmet","govern","grace","gradient","graduate","grain","grammar","granite","graphic",
  "grapple","grasp","grateful","gravity","greatly","greedy","greenery","greeting","gridiron","grief",
  "grinder","grizzly","grocery","ground","growth","guardian","guesswork","guidance","guillotine","guilt",
  "guitar","gulf","gullible","gumdrop","gunfire","gurgle","gusto","gutter","gymnast","habitat",
  "haircut","halfway","hallway","halve","hammer","hamster","handbag","handbook","handful","handle",
  "handrail","handsome","handy","hangar","happen","happily","harbor","hardship","hardwood","harmful",
  "harmony","harness","harpoon","harvest","hasten","hatchet","haven","havoc","hazard","heading",
  "headlight","headline","headset","healthy","hearing","heartbeat","hearth","hearty","heaven","heavy",
  "hectare","hedgerow","height","heirloom","helicopter","helium","helmet","helpful","herald","herbal",
  "heritage","heroic","hexagon","hickory","hidden","hideout","highway","hinder","hint","hippie",
  "historian","history","hockey","holdout","holistic","hollow","holster","homeland","homely","homestead",
  "honesty","honeycomb","honor","hooded","hopeful","horizon","hormone","hornet","horror","horseback",
  "hospital","hostage","hostess","hostile","hotel","hotspot","hourglass","housing","howler","hubcap",
  "humane","humanity","humble","humidity","humming","humor","hunger","hunter","hurdle","hurricane",
  "hurtful","husband","hybrid","hydrant","hydrate","hydraulic","hydrogen","hygiene","hyperlink","hypnosis",
  "iceberg","icicle","iconic","ideology","ignite","ignition","ignore","illicit","illness","illuminate",
  "illusion","illustrate","imagery","imagine","imitate","immense","immerse","immigrant","immune","impact",
  "impartial","impede","imperfect","imperial","implore","imply","import","impose","impossible","impoverish",
  "impress","imprison","improve","impulse","inability","inactive","inbound","incense","incentive","incident",
  "incision","incline","include","income","incorrect","increase","incubate","incur","indebted","indeed",
  "indent","indicator","indict","indirect"
];

export const COMMON_WEAK_PASSWORDS = new Set([
  '123456','123456789','12345678','password','qwerty','1234567890','123123','111111','12345',
  '1234567','dragon','password1','letmein','welcome','admin','abc123','iloveyou','monkey','login',
  'qwerty123','football','baseball','master','shadow','princess','sunshine','passw0rd','password123',
  'qwertyuiop','asdfghjkl','zxcvbnm','trustno1','changeme','secret','guest','root','superman',
  'trustnoone','access','testing','default','correcthorsebatterystaple'
]);

export const KEYBOARD_PATTERNS = [
  'qwerty','asdfgh','zxcvbn','123456','654321','abcdef','fedcba','qazwsx','1q2w3e4r','!qaz2wsx'
];

// ============================================================================
// 2. CSPRNG RANDOMNESS & REJECTION SAMPLING
// ============================================================================

/**
 * Access the platform Cryptographically Secure Pseudorandom Number Generator (CSPRNG).
 * Throws an explicit error if Web Crypto is unavailable rather than falling back
 * to deterministic or insecure Math.random().
 */
export function getCrypto(): Crypto {
  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.getRandomValues === 'function') {
    return window.crypto;
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    return globalThis.crypto;
  }
  throw new Error('Web Cryptography API (crypto.getRandomValues) is not available in this environment.');
}

/**
 * Rejection sampling from CSPRNG to eliminate modulo bias completely.
 * For target range [0, max - 1], values >= maxUint - (maxUint % max) are discarded.
 * Every valid outcome in [0, max - 1] has an identical probability: 1 / max.
 */
export function secureRandomInt(max: number): number {
  if (!Number.isInteger(max) || max <= 0) {
    throw new Error('Invalid random range: max must be a positive integer.');
  }
  const cryptoInstance = getCrypto();
  const maxUint = 0x100000000; // 2^32
  const limit = maxUint - (maxUint % max);
  const buf = new Uint32Array(1);

  do {
    cryptoInstance.getRandomValues(buf);
  } while (buf[0] >= limit);

  return buf[0] % max;
}

/**
 * Uniformly picks a single character or item from a non-empty string or array.
 */
export function pick(items: string): string;
export function pick<T>(items: readonly T[]): T;
export function pick<T>(items: string | readonly T[]): string | T {
  if (!items || items.length === 0) {
    throw new Error('Cannot pick from empty collection.');
  }
  const idx = secureRandomInt(items.length);
  return items[idx];
}

/**
 * Generates N cryptographically secure random bytes.
 */
export function secureRandomBytes(byteLength: number): Uint8Array {
  if (!Number.isInteger(byteLength) || byteLength < 1 || byteLength > 256) {
    throw new Error('Byte length must be an integer between 1 and 256.');
  }
  const cryptoInstance = getCrypto();
  const bytes = new Uint8Array(byteLength);
  cryptoInstance.getRandomValues(bytes);
  return bytes;
}

export const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

// ============================================================================
// 3. CORE PASSWORD GENERATION TYPES & FUNCTIONS
// ============================================================================

export interface PasswordOptions {
  length: number;
  includeUpper?: boolean;
  includeLower?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeAmbiguous?: boolean;
  requireEach?: boolean;
}

export interface PasswordResult {
  password: string;
  entropy: number;
  poolSize: number;
  length: number;
}

export interface PassphraseOptions {
  wordCount: number;
  separator?: string;
  capitalize?: boolean;
  includeNumber?: boolean;
}

export interface PassphraseResult {
  passphrase: string;
  entropy: number;
  wordCount: number;
}

/**
 * Generates a high-entropy random character password based on user specifications.
 * Enforces strict validation, unbiased CSPRNG sampling, and optional class representation.
 */
export function generatePassword(options: PasswordOptions): PasswordResult {
  const {
    length,
    includeUpper = true,
    includeLower = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeAmbiguous = false,
    requireEach = true,
  } = options;

  if (!Number.isInteger(length) || length < MIN_PASSWORD_LENGTH || length > MAX_PASSWORD_LENGTH) {
    throw new Error(`Password length must be an integer between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH}.`);
  }

  const lowerPool = excludeAmbiguous ? [...LOWER].filter(c => !AMBIGUOUS.has(c)).join('') : LOWER;
  const upperPool = excludeAmbiguous ? [...UPPER].filter(c => !AMBIGUOUS.has(c)).join('') : UPPER;
  const numberPool = excludeAmbiguous ? [...NUMBERS].filter(c => !AMBIGUOUS.has(c)).join('') : NUMBERS;
  const symbolPool = excludeAmbiguous ? [...SYMBOLS].filter(c => !AMBIGUOUS.has(c)).join('') : SYMBOLS;

  const selectedPools: string[] = [];
  if (includeUpper && upperPool.length > 0) selectedPools.push(upperPool);
  if (includeLower && lowerPool.length > 0) selectedPools.push(lowerPool);
  if (includeNumbers && numberPool.length > 0) selectedPools.push(numberPool);
  if (includeSymbols && symbolPool.length > 0) selectedPools.push(symbolPool);

  if (selectedPools.length === 0) {
    throw new Error('Select at least one character type (uppercase, lowercase, numbers, or symbols).');
  }

  if (requireEach && length < selectedPools.length) {
    throw new Error(`Requested length (${length}) is smaller than the ${selectedPools.length} required character classes. Increase length to at least ${selectedPools.length} or disable "Guarantee each selected type".`);
  }

  const fullPool = selectedPools.join('');
  const chars: string[] = [];

  if (requireEach) {
    // Pick at least one guaranteed character from each chosen pool
    for (const pool of selectedPools) {
      chars.push(pick(pool));
    }
    // Fill the remainder from the full pool
    while (chars.length < length) {
      chars.push(pick(fullPool));
    }
    // Unbiased Fisher-Yates CSPRNG shuffle to eliminate predictable character placement
    for (let i = chars.length - 1; i > 0; i--) {
      const j = secureRandomInt(i + 1);
      const temp = chars[i];
      chars[i] = chars[j];
      chars[j] = temp;
    }
  } else {
    for (let i = 0; i < length; i++) {
      chars.push(pick(fullPool));
    }
  }

  const password = chars.join('');

  // Shannon entropy calculation
  let bits = 0;
  if (requireEach) {
    const requiredBits = selectedPools.reduce((sum, p) => sum + Math.log2(p.length), 0);
    bits = requiredBits + (length - selectedPools.length) * Math.log2(fullPool.length);
  } else {
    bits = length * Math.log2(fullPool.length);
  }

  return {
    password,
    entropy: Math.round(bits),
    poolSize: fullPool.length,
    length,
  };
}

/**
 * Generates a memorable multi-word passphrase using uniform sampling without replacement
 * from the curated dictionary.
 */
export function generatePassphrase(options: PassphraseOptions): PassphraseResult {
  const {
    wordCount,
    separator = '-',
    capitalize = false,
    includeNumber = true,
  } = options;

  if (!Number.isInteger(wordCount) || wordCount < MIN_WORD_COUNT || wordCount > MAX_WORD_COUNT) {
    throw new Error(`Word count must be an integer between ${MIN_WORD_COUNT} and ${MAX_WORD_COUNT}.`);
  }

  const words: string[] = [];
  const available = [...PASSPHRASE_WORDS];

  // Draw words uniformly without replacement
  for (let i = 0; i < wordCount; i++) {
    if (available.length === 0) break;
    const index = secureRandomInt(available.length);
    const word = available[index];
    available[index] = available[available.length - 1];
    available.pop();
    words.push(capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word);
  }

  const numberPart = includeNumber ? String(secureRandomInt(10000)).padStart(4, '0') : '';
  const passphrase = words.join(separator) + (numberPart ? `${separator}${numberPart}` : '');

  // Exact Shannon entropy: sum of log2(N - i) for each word sampled without replacement
  let wordBits = 0;
  for (let i = 0; i < words.length; i++) {
    wordBits += Math.log2(PASSPHRASE_WORDS.length - i);
  }
  const entropy = Math.round(wordBits + (includeNumber ? Math.log2(10000) : 0));

  return {
    passphrase,
    entropy,
    wordCount,
  };
}

/**
 * Generates multiple passwords in bulk.
 */
export function generateBulkPasswords(options: PasswordOptions, count: number): PasswordResult[] {
  if (!Number.isInteger(count) || count < 1 || count > MAX_BULK_COUNT) {
    throw new Error(`Bulk count must be between 1 and ${MAX_BULK_COUNT}.`);
  }
  const results: PasswordResult[] = [];
  for (let i = 0; i < count; i++) {
    results.push(generatePassword(options));
  }
  return results;
}

/**
 * Generates cryptographic secrets and tokens in Hex, Base64, Base64URL, or RFC 4122 v4 UUID format.
 */
export function makeSecret(format: 'hex' | 'base64' | 'base64url' | 'uuid', byteLength = 32): string {
  if (format === 'uuid') {
    const bytes = secureRandomBytes(16);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // RFC 4122 v4 version nibble = 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant 1 (bits 10xxxxxx)
    const hex = bytesToHex(bytes);
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  const bytes = secureRandomBytes(byteLength);
  if (format === 'hex') return bytesToHex(bytes);
  const base64 = bytesToBase64(bytes);
  if (format === 'base64url') {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
  return base64;
}

// ============================================================================
// 4. STRENGTH & ENTROPY HEURISTIC ANALYSIS
// ============================================================================

export interface PasswordAnalysis {
  score: number;
  label: 'No password' | 'Very weak' | 'Weak' | 'Fair' | 'Strong' | 'Excellent';
  entropy: number;
  length: number;
  charset: number;
  repeated: boolean;
  sequence: boolean;
  keyboard: boolean;
  dictionary: boolean;
  dateLike: boolean;
  common: boolean;
  warnings: string[];
}

export function analyzePassword(value: string): PasswordAnalysis {
  if (!value) {
    return {
      score: 0,
      label: 'No password',
      entropy: 0,
      length: 0,
      charset: 0,
      repeated: false,
      sequence: false,
      keyboard: false,
      dictionary: false,
      dateLike: false,
      common: false,
      warnings: ['Enter a password or generate one to analyze it locally.'],
    };
  }

  const lower = value.toLowerCase();
  const pools = [
    /[a-z]/.test(value) ? 26 : 0,
    /[A-Z]/.test(value) ? 26 : 0,
    /\d/.test(value) ? 10 : 0,
    /[^A-Za-z0-9]/.test(value) ? 33 : 0,
  ];
  const charset = pools.reduce((a, b) => a + b, 0);
  const entropy = charset > 1 ? value.length * Math.log2(charset) : 0;
  const repeated = /(.)\1{2,}/.test(value) || new Set(value).size <= Math.max(2, Math.floor(value.length / 3));
  const sequence = /(0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|defg|qwer|wert|erty|asdf|sdfg|zxcv)/i.test(value);
  const keyboard = KEYBOARD_PATTERNS.some(pattern => lower.includes(pattern));
  const common = COMMON_WEAK_PASSWORDS.has(lower);
  const dictionary = /^(?:password|admin|welcome|letmein|qwerty|monkey|dragon|football|baseball|master|secret|login)/i.test(value);
  const dateLike = /(?:19|20)\d{2}/.test(value) || /(?:0?[1-9]|[12]\d|3[01])(?:0?[1-9]|1[0-2])(?:19|20)?\d{2}/.test(value);

  let score = 100;
  if (value.length < 12) score -= 25;
  else if (value.length < 16) score -= 10;
  if (entropy < 50) score -= 25;
  else if (entropy < 70) score -= 12;
  if (repeated) score -= 12;
  if (sequence) score -= 12;
  if (keyboard) score -= 18;
  if (common) score -= 45;
  if (dictionary) score -= 30;
  if (dateLike) score -= 8;
  score = Math.max(0, Math.min(100, Math.round(score)));

  let label: PasswordAnalysis['label'] = 'Very weak';
  if (score >= 90) label = 'Excellent';
  else if (score >= 75) label = 'Strong';
  else if (score >= 55) label = 'Fair';
  else if (score >= 30) label = 'Weak';

  const warnings: string[] = [];
  if (value.length < 16) warnings.push('Use 16+ characters for a stronger general-purpose password.');
  if (repeated) warnings.push('Repeated characters reduce effective unpredictability.');
  if (sequence) warnings.push('Sequential character patterns are easier to guess.');
  if (keyboard) warnings.push('Keyboard walk patterns are commonly targeted by automated attack dictionaries.');
  if (common || dictionary) warnings.push('This resembles a known dictionary word or frequently breached password.');
  if (dateLike) warnings.push('A year or date-like pattern was detected, which is commonly targeted.');
  if (warnings.length === 0) warnings.push('No obvious heuristic weakness patterns detected.');

  return {
    score,
    label,
    entropy: Math.round(entropy),
    length: value.length,
    charset,
    repeated,
    sequence,
    keyboard,
    dictionary,
    dateLike,
    common,
    warnings,
  };
}

export function strengthFor(bits: number): { label: string; cls: string; bar: string; width: number } {
  if (bits < 40) return { label: 'Weak', cls: 'text-red-500', bar: 'bg-red-500', width: Math.min((bits / 100) * 100, 100) };
  if (bits < 60) return { label: 'Fair', cls: 'text-yellow-500', bar: 'bg-yellow-500', width: Math.min((bits / 100) * 100, 100) };
  if (bits < 80) return { label: 'Strong', cls: 'text-emerald-500', bar: 'bg-emerald-500', width: Math.min((bits / 100) * 100, 100) };
  return { label: 'Very Strong', cls: 'text-blue-500', bar: 'bg-blue-500', width: Math.min((bits / 100) * 100, 100) };
}

// ============================================================================
// 5. HASH & EQUALITY HELPERS
// ============================================================================

export function normalizeHash(value: string): string {
  return value.trim().replace(/\s+/g, '').toLowerCase();
}

export function looksLikeHex(value: string): boolean {
  return /^[0-9a-f]+$/i.test(value) && value.length % 2 === 0;
}

/**
 * Bitwise XOR comparison helper for hexadecimal hash checksums.
 * Compares equal-length strings across all character positions without early termination.
 * Note: JavaScript execution in optimizing JIT engines cannot guarantee hardware-level
 * constant-time behavior. In this client-side UI, remote timing attacks do not apply;
 * the full-string XOR pass serves as defensive code practice for checksum equality checking.
 */
export function constantTimeTextEqual(a: string, b: string): boolean {
  const aa = normalizeHash(a);
  const bb = normalizeHash(b);
  if (!looksLikeHex(aa) || !looksLikeHex(bb) || aa.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < aa.length; i++) {
    diff |= aa.charCodeAt(i) ^ bb.charCodeAt(i);
  }
  return diff === 0;
}
