'use client';

import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  FileUp,
  Fingerprint,
  Hash as HashIcon,
  Key,
  Lock,
  RefreshCw,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  Search,
  Code2,
  Scale,
  EyeOff,
  ShieldAlert,
  Info,
  RotateCcw,
} from 'lucide-react';

/**
 * Curated 1,024-word English dictionary.
 * Each word provides exactly log2(1024) = 10.0 bits of theoretical entropy
 * when sampled uniformly.
 */
const PASSPHRASE_WORDS: readonly string[] = ["ability","able","about","above","accept","accord","account","acid","across","action","active","actor","actual","adapt","added","adjust","adopt","adult","advance","advice","affair","affect","afford","afraid","after","again","against","agent","agree","ahead","airport","alarm","album","alert","alike","alive","allow","almost","alone","along","aloud","alpha","already","alter","always","amaze","amber","among","amount","anchor","ancient","angel","anger","angle","angry","animal","ankle","annual","another","answer","anthem","anvil","anybody","anyhow","anymore","anyone","anyway","apart","apex","appeal","appear","apple","apply","apron","arcade","arch","arctic","arena","argue","arise","armor","around","arouse","arrange","array","arrest","arrival","arrive","arrow","artist","asleep","aspect","assault","assert","assess","asset","assign","assist","assume","assure","astonish","athlete","atlas","atom","atomic","attach","attack","attain","attempt","attend","attic","audio","audit","august","author","auto","autumn","avail","avenue","average","avoid","awake","award","aware","balance","balcony","bamboo","banana","bandit","banner","barber","barely","barrel","barter","basket","battle","beacon","beam","beauty","because","become","before","behave","behind","belief","belong","beloved","bench","benefit","beside","betray","beyond","bicycle","bidder","binary","biology","biscuit","bishop","bitter","blade","blanket","blender","blessing","blossom","blueprint","boulder","boundary","bracket","branch","bravery","breeze","bridge","bright","bronze","brother","bubble","bucket","budget","builder","bullet","bundle","burden","burger","butter","cabin","cabinet","cactus","camera","campus","canal","canary","candle","canvas","canyon","capable","capital","captain","capture","carbon","cardinal","cargo","carpet","carrot","cascade","castle","casual","catalog","catcher","cater","cathedral","cattle","caution","cavity","cedar","ceiling","celebrate","cement","censor","census","center","century","cereal","certain","chamber","champion","chance","change","channel","chapter","charcoal","charge","chariot","charity","charm","charter","chatter","cheese","chemical","cherry","chicken","chimney","choice","chronic","circle","circuit","citizen","citrus","civic","civil","clamor","clarity","classic","clause","cleaner","clever","client","cliff","climate","climb","clinic","cloak","clock","cloudy","cluster","coastal","cobalt","coconut","coffin","cognition","cohesion","collector","colony","column","combat","combine","comedy","comet","comfort","comic","command","commence","commerce","commit","common","compact","company","compass","compile","complex","compose","compound","compute","comrade","conceal","concede","concept","concern","conclude","concrete","condemn","conduct","confer","confess","confirm","conflict","conform","confront","confuse","conquer","consent","conserve","consider","consign","consist","console","constant","constrain","construct","consult","consume","contact","contain","contempt","contend","content","contest","context","continue","contour","contract","contrast","control","convene","converse","convert","convey","convict","convince","copper","coral","corner","corona","corps","correct","corridor","corrupt","cosmic","costume","cottage","cotton","council","counsel","counter","country","county","courage","courier","course","courtesy","covenant","cradle","crafty","crater","crayon","creature","credit","crevice","cricket","criminal","crisis","critic","crystal","culture","cupboard","curious","current","curtain","cushion","custom","cylinder","damage","dancer","danger","daring","dazzle","dealer","debate","decade","decay","deceive","decency","decide","decimal","declare","decline","decorate","decrease","dedicate","defense","defer","deficit","define","definite","deflect","degree","delight","deliver","demand","democracy","demolish","denial","depart","depend","depict","deposit","depth","deputy","derive","descend","describe","desert","deserve","design","desire","despair","dessert","destiny","destroy","detach","detail","detain","detect","deter","develop","device","devote","diamond","diary","dictate","diesel","differ","digest","digital","dignity","dilemma","dimension","dinner","diploma","direct","disable","disaster","discard","discern","disciple","disclose","discount","discourse","discover","disease","disguise","dismiss","disorder","dispatch","dispel","display","dispose","dispute","disrupt","distant","distort","district","disturb","diverse","divide","divine","divorce","doctor","doctrine","document","domain","domestic","dominant","dominate","donate","donkey","dormant","double","dragon","drainage","dramatic","drawer","drift","driver","droplet","drummer","dryer","durable","duration","dynamic","eager","eagle","earnest","earring","earth","easily","eastern","eccentric","echo","eclipse","ecology","economic","economy","ecstasy","edge","edition","educate","effect","effort","elastic","elbow","elder","elect","electric","elegant","element","elephant","elevate","eligible","elite","elixir","elm","embark","embassy","embrace","emerald","emerge","emission","emotion","empathy","emperor","emphasis","empire","employ","empower","empty","enable","enact","enchant","enclose","encoder","encounter","encourage","endear","endless","endorse","endure","enemy","energy","enforce","engage","engine","engrave","enhance","enigma","enjoy","enlarge","enlist","enough","enrich","enroll","ensemble","ensue","ensure","enter","enterprise","entire","entitle","entity","entrance","envelope","envision","enzyme","epic","episode","epoch","equal","equator","equip","equity","erase","erosion","errand","escape","escort","essence","estate","esteem","estimate","eternal","ethics","ethnic","eureka","evacuate","evaluate","evening","evident","evolution","evolve","exact","examine","example","exceed","excel","except","excerpt","excess","exchange","excite","exclude","execute","exempt","exercise","exert","exhaust","exhibit","exile","exist","exit","exotic","expand","expect","expedite","expel","expense","expert","expire","explain","explicit","explode","exploit","explore","export","expose","express","extend","exterior","external","extol","extra","extract","extreme","eyebrow","eyelid","fable","fabric","facet","facility","factor","factory","faculty","fade","fail","faint","falcon","falter","family","famous","fanatic","fancy","fantasy","farewell","farmer","fascinate","fashion","fasten","fatal","father","fathom","fatigue","fault","favor","feast","feather","feature","federal","fellow","female","fence","fender","fertile","festival","fever","fiber","fiction","field","fierce","fighter","figure","filter","final","finance","finder","finger","finish","fir","firefly","firewall","firmly","fiscal","fisher","fissure","fitness","flame","flavor","flawless","fleece","flight","flock","flourish","flowchart","flower","fluid","flutter","flying","focus","foggy","folder","foliage","follow","fondly","footpath","footstep","forbid","forecast","forefront","foreign","foresee","forest","forever","forge","forgive","formal","format","formula","forsake","fortress","fortune","forward","fossil","foster","founder","fountain","fracture","fragment","fragrance","framework","frankly","fraud","freckle","freedom","freeway","freeze","freight","frequency","fresh","friction","frigate","frontier","frost","frugal","fruit","fulfill","fulcrum","function","furious","furnace","furnish","furniture","further","galaxy","gallery","galley","gallon","gamble","garage","garden","garlic","garment","gateway","gather","gauge","gazebo","gecko","gemstone","general","generate","generic","generous","genius","gentle","genuine","geography","geology","gesture","giant","glacier","glamour","glance","glass","glider","glimmer","glimpse","glisten","glitter","global","glorious","goddess","golden","goodness","gorgeous","gorilla","gourmet","govern","grace","gradient","graduate","grain","grammar","granite","graphic","grapple","grasp","grateful","gravity","greatly","greedy","greenery","greeting","gridiron","grief","grinder","grizzly","grocery","ground","growth","guardian","guesswork","guidance","guillotine","guilt","guitar","gulf","gullible","gumdrop","gunfire","gurgle","gusto","gutter","gymnast","habitat","haircut","halfway","hallway","halve","hammer","hamster","handbag","handbook","handful","handle","handrail","handsome","handy","hangar","happen","happily","harbor","hardship","hardwood","harmful","harmony","harness","harpoon","harvest","hasten","hatchet","haven","havoc","hazard","heading","headlight","headline","headset","healthy","hearing","heartbeat","hearth","hearty","heaven","heavy","hectare","hedgerow","height","heirloom","helicopter","helium","helmet","helpful","herald","herbal","heritage","heroic","hexagon","hickory","hidden","hideout","highway","hinder","hint","hippie","historian","history","hockey","holdout","holistic","hollow","holster","homeland","homely","homestead","honesty","honeycomb","honor","hooded","hopeful","horizon","hormone","hornet","horror","horseback","hospital","hostage","hostess","hostile","hotel","hotspot","hourglass","housing","howler","hubcap","humane","humanity","humble","humidity","humming","humor","hunger","hunter","hurdle","hurricane","hurtful","husband","hybrid","hydrant","hydrate","hydraulic","hydrogen","hygiene","hyperlink","hypnosis","iceberg","icicle","iconic","ideology","ignite","ignition","ignore","illicit","illness","illuminate","illusion","illustrate","imagery","imagine","imitate","immense","immerse","immigrant","immune","impact","impartial","impede","imperfect","imperial","implore","imply","import","impose","impossible","impoverish","impress","imprison","improve","impulse","inability","inactive","inbound","incense","incentive","incident","incision","incline","include","income","incorrect","increase","incubate","incur","indebted","indeed","indent","indicator","indict","indirect"];

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
const AMBIGUOUS = new Set(['0', 'O', 'o', '1', 'I', 'l', '|', '`']);

const MAX_TEXT_HASH_BYTES = 8 * 1024 * 1024; // 8 MB
const MAX_FILE_BYTES = 1024 * 1024 * 1024; // 1 GB (1,024 MB) client-side browser limit

type Hashes = {
  sha256: string;
  sha384: string;
  sha512: string;
  sha1: string;
  md5: string;
};
type HashAlgorithm = keyof Hashes;
type FileHashAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512';

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');

/**
 * Rejection sampling from CSPRNG to eliminate modulo bias completely.
 * For range [0, max - 1], values >= maxUint - (maxUint % max) are discarded.
 */
function secureRandomInt(max: number): number {
  if (!Number.isInteger(max) || max <= 0) throw new Error('Invalid random range');
  const maxUint = 0x100000000;
  const limit = maxUint - (maxUint % max);
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
}

function pick(items: string): string;
function pick<T>(items: readonly T[]): T;
function pick<T>(items: string | readonly T[]): string | T {
  if (typeof items === 'string') {
    return items[secureRandomInt(items.length)];
  }
  return items[secureRandomInt(items.length)];
}

function secureRandomBytes(byteLength: number): Uint8Array {
  if (!Number.isInteger(byteLength) || byteLength < 1 || byteLength > 256) {
    throw new Error('Byte length must be between 1 and 256.');
  }
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function makeSecret(format: 'hex' | 'base64' | 'base64url' | 'uuid', byteLength: number): string {
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

function strengthFor(bits: number) {
  if (bits < 40) return { label: 'Weak', cls: 'text-red-500', bar: 'bg-red-500', width: Math.min((bits / 100) * 100, 100) };
  if (bits < 60) return { label: 'Fair', cls: 'text-yellow-500', bar: 'bg-yellow-500', width: Math.min((bits / 100) * 100, 100) };
  if (bits < 80) return { label: 'Strong', cls: 'text-emerald-500', bar: 'bg-emerald-500', width: Math.min((bits / 100) * 100, 100) };
  return { label: 'Very Strong', cls: 'text-blue-500', bar: 'bg-blue-500', width: Math.min((bits / 100) * 100, 100) };
}

const COMMON_WEAK_PASSWORDS = new Set([
  '123456','123456789','12345678','password','qwerty','1234567890','123123','111111','12345',
  '1234567','dragon','password1','letmein','welcome','admin','abc123','iloveyou','monkey','login',
  'qwerty123','football','baseball','master','shadow','princess','sunshine','passw0rd','password123',
  'qwertyuiop','asdfghjkl','zxcvbnm','trustno1','changeme','secret','guest','root','superman',
  'trustnoone','access','testing','default','correcthorsebatterystaple'
]);

const KEYBOARD_PATTERNS = [
  'qwerty','asdfgh','zxcvbn','123456','654321','abcdef','fedcba','qazwsx','1q2w3e4r','!qaz2wsx'
];

function analyzePassword(value: string) {
  if (!value) return {
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

  const label = score >= 90 ? 'Excellent' : score >= 75 ? 'Strong' : score >= 55 ? 'Fair' : score >= 30 ? 'Weak' : 'Very weak';
  const warnings: string[] = [];
  if (value.length < 16) warnings.push('Use 16+ characters for a stronger general-purpose password.');
  if (repeated) warnings.push('Repeated characters reduce effective unpredictability.');
  if (sequence) warnings.push('Sequential character patterns are easier to guess.');
  if (keyboard) warnings.push('Keyboard patterns are commonly targeted by attackers.');
  if (common || dictionary) warnings.push('This resembles a known dictionary or frequently breached password.');
  if (dateLike) warnings.push('A year/date-like pattern was detected, which is commonly targeted.');
  if (!warnings.length) warnings.push('No obvious heuristic weakness patterns detected.');

  return { score, label, entropy: Math.round(entropy), length: value.length, charset, repeated, sequence, keyboard, dictionary, dateLike, common, warnings };
}

function normalizeHash(value: string): string {
  return value.trim().replace(/\s+/g, '').toLowerCase();
}

function looksLikeHex(value: string): boolean {
  return /^[0-9a-f]+$/i.test(value) && value.length % 2 === 0;
}

function constantTimeTextEqual(a: string, b: string): boolean {
  const aa = normalizeHash(a);
  const bb = normalizeHash(b);
  if (!looksLikeHex(aa) || !looksLikeHex(bb) || aa.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < aa.length; i++) diff |= aa.charCodeAt(i) ^ bb.charCodeAt(i);
  return diff === 0;
}

async function sha1Hex(input: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(input));
  return bytesToHex(new Uint8Array(buffer));
}

async function checkPwnedPassword(passwordValue: string): Promise<number> {
  if (!passwordValue) throw new Error('Enter a password to check.');
  const fullHash = (await sha1Hex(passwordValue)).toUpperCase();
  const prefix = fullHash.slice(0, 5);
  const suffix = fullHash.slice(5);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      method: 'GET',
      headers: { 'Add-Padding': 'true' },
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Breach check service returned HTTP ${response.status}.`);
    const text = await response.text();
    for (const line of text.split(/\r?\n/)) {
      const [returnedSuffix, countText] = line.trim().split(':');
      if (returnedSuffix && returnedSuffix.toUpperCase() === suffix) {
        return Number(countText) || 0;
      }
    }
    return 0;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function digestText(algorithm: HashAlgorithm, input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  if (bytes.byteLength > MAX_TEXT_HASH_BYTES) {
    throw new Error('Text input is limited to 8 MB for browser-safe client-side processing.');
  }
  if (algorithm === 'md5') {
    const { default: CryptoJS } = await import('crypto-js');
    return CryptoJS.MD5(input).toString();
  }
  const algoName = algorithm === 'sha256' ? 'SHA-256' : algorithm === 'sha384' ? 'SHA-384' : algorithm === 'sha512' ? 'SHA-512' : 'SHA-1';
  const buffer = await crypto.subtle.digest(algoName, bytes);
  return bytesToHex(new Uint8Array(buffer));
}

async function hmacText(algorithm: HashAlgorithm, input: string, secret: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  if (bytes.byteLength > MAX_TEXT_HASH_BYTES) {
    throw new Error('Text input is limited to 8 MB for browser-safe client-side processing.');
  }
  const { default: CryptoJS } = await import('crypto-js');
  if (algorithm === 'md5') return CryptoJS.HmacMD5(input, secret).toString();
  if (algorithm === 'sha1') return CryptoJS.HmacSHA1(input, secret).toString();
  if (algorithm === 'sha256') return CryptoJS.HmacSHA256(input, secret).toString();
  if (algorithm === 'sha384') return CryptoJS.HmacSHA384(input, secret).toString();
  return CryptoJS.HmacSHA512(input, secret).toString();
}

/**
 * Self-contained inline worker code for file integrity hashing.
 * Uses native Web Crypto in the worker thread to hash files without main-thread jank.
 */
const FILE_WORKER_SCRIPT = `
self.onmessage = async function(e) {
  var data = e.data;
  if (!data) return;
  if (data.type === 'cancel') {
    self.postMessage({ type: 'cancelled' });
    return;
  }
  if (data.type !== 'hash') return;

  var file = data.file;
  var algorithm = data.algorithm;
  var chunkSize = data.chunkSize || 4 * 1024 * 1024;

  try {
    var size = file.size;
    if (size === 0) {
      var empty = new Uint8Array(0);
      var hashBuffer = await self.crypto.subtle.digest(algorithm, empty);
      var hex = Array.from(new Uint8Array(hashBuffer), function(b) {
        return b.toString(16).padStart(2, '0');
      }).join('');
      self.postMessage({ type: 'progress', progress: 100 });
      self.postMessage({ type: 'result', hash: hex });
      return;
    }

    var fullBuffer = new Uint8Array(size);
    var offset = 0;

    while (offset < size) {
      var end = Math.min(offset + chunkSize, size);
      var slice = file.slice(offset, end);
      var chunkBuf = await slice.arrayBuffer();
      fullBuffer.set(new Uint8Array(chunkBuf), offset);
      offset = end;
      var prog = Math.min(95, Math.round((offset / size) * 90));
      self.postMessage({ type: 'progress', progress: prog });
      await new Promise(function(r) { setTimeout(r, 0); });
    }

    self.postMessage({ type: 'progress', progress: 95 });
    var digest = await self.crypto.subtle.digest(algorithm, fullBuffer);
    var hexResult = Array.from(new Uint8Array(digest), function(b) {
      return b.toString(16).padStart(2, '0');
    }).join('');
    self.postMessage({ type: 'progress', progress: 100 });
    self.postMessage({ type: 'result', hash: hexResult });
  } catch (err) {
    self.postMessage({ type: 'error', message: err instanceof Error ? err.message : 'Unable to calculate file hash.' });
  }
};
`;

export default function PasswordGenerator() {
  const [passMode, setPassMode] = useState<'random' | 'passphrase'>('random');
  const [password, setPassword] = useState('');
  const [entropy, setEntropy] = useState(0);
  const [generationError, setGenerationError] = useState('');
  const [length, setLength] = useState(20);
  const [wordCount, setWordCount] = useState(5);
  const [incUpper, setIncUpper] = useState(true);
  const [incLower, setIncLower] = useState(true);
  const [incNum, setIncNum] = useState(true);
  const [incSym, setIncSym] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [requireEach, setRequireEach] = useState(true);
  const [separator, setSeparator] = useState('-');
  const [passphraseCaps, setPassphraseCaps] = useState(false);
  const [passphraseNumber, setPassphraseNumber] = useState(true);
  const [showRecent, setShowRecent] = useState(false);
  const [keepHistory, setKeepHistory] = useState(false);
  const [recentPasswords, setRecentPasswords] = useState<string[]>([]);
  const [copiedPass, setCopiedPass] = useState(false);
  const [hashInput, setHashInput] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [hmacMode, setHmacMode] = useState(false);
  const [hashAlgorithm, setHashAlgorithm] = useState<HashAlgorithm>('sha256');
  const [hashes, setHashes] = useState<Hashes>({ sha256: '', sha384: '', sha512: '', sha1: '', md5: '' });
  const [copiedHash, setCopiedHash] = useState('');
  const [hashing, setHashing] = useState(false);
  const [hashError, setHashError] = useState('');
  const [fileHash, setFileHash] = useState('');
  const [fileHashAlgorithm, setFileHashAlgorithm] = useState<FileHashAlgorithm>('SHA-256');
  const [isFileHashing, setIsFileHashing] = useState(false);
  const [fileProgress, setFileProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [analysisInput, setAnalysisInput] = useState('');
  const [breachInput, setBreachInput] = useState('');
  const [breachChecking, setBreachChecking] = useState(false);
  const [breachCount, setBreachCount] = useState<number | null>(null);
  const [breachError, setBreachError] = useState('');
  const [secretFormat, setSecretFormat] = useState<'hex' | 'base64' | 'base64url' | 'uuid'>('hex');
  const [secretBytes, setSecretBytes] = useState(32);
  const [generatedSecret, setGeneratedSecret] = useState('');
  const [hashA, setHashA] = useState('');
  const [hashB, setHashB] = useState('');
  const [hashCompareResult, setHashCompareResult] = useState<'match' | 'different' | 'invalid' | ''>('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const [clearMessage, setClearMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hashRequest = useRef(0);
  const fileHashRequest = useRef(0);
  const selectedFileRef = useRef<File | null>(null);
  const fileHashWorkerRef = useRef<Worker | null>(null);
  const workerUrlRef = useRef<string | null>(null);

  const terminateFileHashWorker = () => {
    if (fileHashWorkerRef.current) {
      fileHashWorkerRef.current.terminate();
      fileHashWorkerRef.current = null;
    }
    if (workerUrlRef.current) {
      URL.revokeObjectURL(workerUrlRef.current);
      workerUrlRef.current = null;
    }
  };

  const generatePassword = () => {
    let newPass = '';
    let bits = 0;
    setGenerationError('');

    if (passMode === 'random') {
      const lowerPool = excludeAmbiguous ? [...LOWER].filter(c => !AMBIGUOUS.has(c)).join('') : LOWER;
      const upperPool = excludeAmbiguous ? [...UPPER].filter(c => !AMBIGUOUS.has(c)).join('') : UPPER;
      const numberPool = excludeAmbiguous ? [...NUMBERS].filter(c => !AMBIGUOUS.has(c)).join('') : NUMBERS;
      const symbolPool = excludeAmbiguous ? [...SYMBOLS].filter(c => !AMBIGUOUS.has(c)).join('') : SYMBOLS;

      const selectedPools: string[] = [];
      if (incUpper && upperPool.length) selectedPools.push(upperPool);
      if (incLower && lowerPool.length) selectedPools.push(lowerPool);
      if (incNum && numberPool.length) selectedPools.push(numberPool);
      if (incSym && symbolPool.length) selectedPools.push(symbolPool);

      if (selectedPools.length === 0) {
        setPassword('');
        setEntropy(0);
        setGenerationError('Select at least one character type to generate a password.');
        setCopiedPass(false);
        return;
      }

      if (requireEach && length < selectedPools.length) {
        setPassword('');
        setEntropy(0);
        setGenerationError(`Requested length (${length}) is smaller than the ${selectedPools.length} required character classes. Increase length to at least ${selectedPools.length} or uncheck "Guarantee selected types".`);
        setCopiedPass(false);
        return;
      }

      const fullPool = selectedPools.join('');
      const chars: string[] = [];

      if (requireEach) {
        for (const pool of selectedPools) {
          chars.push(pick(pool));
        }
        while (chars.length < length) {
          chars.push(pick(fullPool));
        }
        // Unbiased Fisher-Yates shuffle
        for (let i = chars.length - 1; i > 0; i--) {
          const j = secureRandomInt(i + 1);
          [chars[i], chars[j]] = [chars[j], chars[i]];
        }
        newPass = chars.join('');
        const requiredBits = selectedPools.reduce((sum, p) => sum + Math.log2(p.length), 0);
        bits = requiredBits + (length - selectedPools.length) * Math.log2(fullPool.length);
      } else {
        for (let i = 0; i < length; i++) {
          newPass += pick(fullPool);
        }
        bits = length * Math.log2(fullPool.length);
      }
    } else {
      const words: string[] = [];
      const available = [...PASSPHRASE_WORDS];

      for (let i = 0; i < wordCount; i++) {
        if (!available.length) break;
        const index = secureRandomInt(available.length);
        const word = available[index];
        available[index] = available[available.length - 1];
        available.pop();
        words.push(passphraseCaps ? word.charAt(0).toUpperCase() + word.slice(1) : word);
      }

      if (!words.length) {
        setPassword('');
        setEntropy(0);
        setGenerationError('The passphrase dictionary is empty.');
        setCopiedPass(false);
        return;
      }

      const number = passphraseNumber ? String(secureRandomInt(10000)).padStart(4, '0') : '';
      newPass = words.join(separator) + (number ? `${separator}${number}` : '');

      let wordBits = 0;
      for (let i = 0; i < words.length; i++) {
        wordBits += Math.log2(PASSPHRASE_WORDS.length - i);
      }
      bits = wordBits + (passphraseNumber ? Math.log2(10000) : 0);
    }

    setPassword(newPass);
    setEntropy(Math.round(bits));
    if (keepHistory) {
      setRecentPasswords(prev => [newPass, ...prev.filter(p => p !== newPass)].slice(0, 5));
    }
    setCopiedPass(false);
  };

  useEffect(() => {
    const id = ++hashRequest.current;
    const run = async () => {
      if (!hashInput) {
        setHashes({ sha256: '', sha384: '', sha512: '', sha1: '', md5: '' });
        setHashError('');
        setHashing(false);
        return;
      }
      setHashError('');
      setHashing(true);
      try {
        const out: Hashes = { sha256: '', sha384: '', sha512: '', sha1: '', md5: '' };
        if (hmacMode) {
          out[hashAlgorithm] = await hmacText(hashAlgorithm, hashInput, secretKey);
        } else {
          const algos: HashAlgorithm[] = ['sha256', 'sha384', 'sha512', 'sha1', 'md5'];
          const results = await Promise.all(algos.map(algo => digestText(algo, hashInput)));
          algos.forEach((algo, i) => { out[algo] = results[i]; });
        }
        if (id === hashRequest.current) setHashes(out);
      } catch (e) {
        if (id === hashRequest.current) {
          setHashes({ sha256: '', sha384: '', sha512: '', sha1: '', md5: '' });
          setHashError(e instanceof Error ? e.message : 'Unable to calculate hash.');
        }
      } finally {
        if (id === hashRequest.current) setHashing(false);
      }
    };
    void run();
  }, [hashInput, secretKey, hmacMode, hashAlgorithm]);

  const hashFile = (file: File, algorithm: FileHashAlgorithm = fileHashAlgorithm) => {
    const requestId = ++fileHashRequest.current;
    terminateFileHashWorker();
    selectedFileRef.current = file;
    setFileError('');
    setFileHash('');
    setFileName(file.name);
    setFileSize(file.size);
    setIsFileHashing(true);
    setFileProgress(0);

    if (file.size > MAX_FILE_BYTES) {
      setIsFileHashing(false);
      setFileError('Client-side browser limit: Files above 1 GB (1,024 MB) are not supported. For larger files, use a native CLI tool.');
      return;
    }

    try {
      const blob = new Blob([FILE_WORKER_SCRIPT], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      workerUrlRef.current = workerUrl;
      const worker = new Worker(workerUrl);
      fileHashWorkerRef.current = worker;

      worker.onmessage = (event: MessageEvent<{
        type: 'progress' | 'result' | 'error' | 'cancelled';
        progress?: number;
        hash?: string;
        message?: string;
      }>) => {
        if (requestId !== fileHashRequest.current) return;
        const data = event.data;
        if (data.type === 'progress') {
          setFileProgress(Math.max(0, Math.min(100, data.progress ?? 0)));
          return;
        }
        if (data.type === 'result') {
          setFileHash(data.hash ?? '');
          setFileProgress(100);
          setIsFileHashing(false);
          terminateFileHashWorker();
          return;
        }
        if (data.type === 'cancelled') {
          setIsFileHashing(false);
          setFileProgress(0);
          terminateFileHashWorker();
          return;
        }
        setFileError(data.message || 'Unable to calculate file hash.');
        setIsFileHashing(false);
        terminateFileHashWorker();
      };

      worker.onerror = () => {
        if (requestId !== fileHashRequest.current) return;
        setFileError('The file-hashing worker encountered an internal error. Please try again.');
        setIsFileHashing(false);
        terminateFileHashWorker();
      };

      worker.postMessage({ type: 'hash', file, algorithm, chunkSize: 4 * 1024 * 1024 });
    } catch (error) {
      if (requestId === fileHashRequest.current) {
        setFileError(error instanceof Error ? error.message : 'Unable to start file hashing.');
        setIsFileHashing(false);
        terminateFileHashWorker();
      }
    }
  };

  useEffect(() => {
    const file = selectedFileRef.current;
    if (file) hashFile(file, fileHashAlgorithm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileHashAlgorithm]);

  const cancelFileHash = () => {
    fileHashRequest.current += 1;
    terminateFileHashWorker();
    setIsFileHashing(false);
    setFileProgress(0);
  };

  const copy = async (text: string, type: 'pass' | 'hash' | 'secret') => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    if (type === 'pass') setCopiedPass(true);
    else if (type === 'hash') setCopiedHash(text);
    else setCopiedSecret(true);

    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => {
      setCopiedPass(false);
      setCopiedHash('');
      setCopiedSecret(false);
    }, 2000);
  };

  const runBreachCheck = async () => {
    const candidate = breachInput || password;
    setBreachChecking(true);
    setBreachError('');
    setBreachCount(null);
    try {
      const count = await checkPwnedPassword(candidate);
      setBreachCount(count);
    } catch (error) {
      setBreachError(error instanceof Error ? error.message : 'Unable to complete breach check.');
    } finally {
      setBreachChecking(false);
    }
  };

  const generateSecret = () => {
    try {
      setGeneratedSecret(makeSecret(secretFormat, secretBytes));
      setCopiedSecret(false);
    } catch (error) {
      setGeneratedSecret(error instanceof Error ? error.message : 'Unable to generate secret.');
    }
  };

  const compareHashes = () => {
    const a = normalizeHash(hashA);
    const b = normalizeHash(hashB);
    if (!a || !b || !looksLikeHex(a) || !looksLikeHex(b)) {
      setHashCompareResult('invalid');
      return;
    }
    setHashCompareResult(constantTimeTextEqual(a, b) ? 'match' : 'different');
  };

  const clearHistory = () => {
    setRecentPasswords([]);
    setShowRecent(false);
  };

  const resetAllState = () => {
    setPassword('');
    setEntropy(0);
    setGenerationError('');
    setAnalysisInput('');
    setHashInput('');
    setSecretKey('');
    setHashes({ sha256: '', sha384: '', sha512: '', sha1: '', md5: '' });
    setHashError('');
    setBreachInput('');
    setBreachCount(null);
    setBreachError('');
    setGeneratedSecret('');
    setHashA('');
    setHashB('');
    setHashCompareResult('');
    setRecentPasswords([]);
    setShowRecent(false);
    setFileName('');
    setFileSize(0);
    setFileHash('');
    setFileError('');
    cancelFileHash();
    selectedFileRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
    setClearMessage('All sensitive fields and in-memory state cleared (best-effort reset).');
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => setClearMessage(''), 3000);
  };

  const strength = strengthFor(entropy);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) hashFile(file);
  };

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
    if (clearTimer.current) clearTimeout(clearTimer.current);
    fileHashRequest.current += 1;
    hashRequest.current += 1;
    terminateFileHashWorker();
    selectedFileRef.current = null;
  }, []);

  return (
    <div className="flex flex-col gap-8 bg-white dark:bg-[#0a0f1a] transition-colors">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-xs font-semibold border border-emerald-200 dark:border-emerald-800/50">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Local processing: No passwords, keys, or files are sent to servers. Breach check sends only a 5-char SHA-1 prefix.</span>
        </div>
        <button
          type="button"
          onClick={resetAllState}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-slate-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Reset all sensitive state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sensitive State</span>
        </button>
      </div>

      {clearMessage && (
        <div aria-live="polite" className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 px-4 py-2.5 rounded-xl text-center">
          {clearMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Generation, Analysis, Secrets */}
        <div className="flex flex-col gap-6">
          {/* SECURE PASSWORD GENERATOR */}
          <section aria-labelledby="heading-generator" className="bg-gray-50 dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
            <h2 id="heading-generator" className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-3">
              <Key className="w-5 h-5 text-blue-600" /> Secure Password Generator
            </h2>

            <div className="bg-white dark:bg-[#0a0f1a] p-1 rounded-xl flex gap-1 border border-gray-200 dark:border-slate-700" role="tablist" aria-label="Generation Mode">
              <button
                type="button"
                role="tab"
                aria-selected={passMode === 'random'}
                onClick={() => setPassMode('random')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${passMode === 'random' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Characters
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={passMode === 'passphrase'}
                onClick={() => setPassMode('passphrase')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${passMode === 'passphrase' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Passphrase
              </button>
            </div>

            {password ? (
              <div className="w-full bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-inner">
                <div
                  tabIndex={0}
                  aria-label="Generated password output"
                  className="flex-1 min-w-0 break-all font-mono text-lg md:text-xl text-slate-900 dark:text-blue-100 select-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {password}
                </div>
                <button
                  type="button"
                  aria-label="Copy generated password to clipboard"
                  onClick={() => copy(password, 'pass')}
                  className="shrink-0 p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                >
                  {copiedPass ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            ) : (
              <div className="w-full bg-white dark:bg-[#0a0f1a] border border-dashed border-gray-300 dark:border-slate-700 rounded-2xl p-5 min-h-[80px] flex items-center justify-center text-center shadow-inner">
                <span className="text-gray-400 dark:text-slate-500 text-sm font-sans">
                  Generate a password to see it here.
                </span>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className={`text-sm font-bold uppercase tracking-wider ${strength.cls}`}>{strength.label}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  ~{entropy} bits estimated theoretical entropy
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={strength.width} aria-valuemin={0} aria-valuemax={100} aria-label="Password strength meter">
                <div className={`h-full transition-all duration-500 ${strength.bar}`} style={{ width: `${strength.width}%` }} />
              </div>
            </div>

            {generationError && (
              <div role="alert" className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-3">
                {generationError}
              </div>
            )}

            <div className="space-y-5 pt-4 border-t border-gray-200 dark:border-slate-800">
              {passMode === 'random' ? (
                <>
                  <div>
                    <label htmlFor="input-password-length" className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      <span>Password Length</span>
                      <span className="text-blue-600 dark:text-blue-400 font-mono">{length}</span>
                    </label>
                    <input
                      id="input-password-length"
                      type="range"
                      min="8"
                      max="128"
                      value={length}
                      onChange={e => setLength(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      aria-valuemin={8}
                      aria-valuemax={128}
                      aria-valuenow={length}
                    />
                  </div>
                  <fieldset className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <legend className="sr-only">Character types</legend>
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer bg-white dark:bg-[#0a0f1a] p-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-blue-500 transition-colors">
                      <input
                        type="checkbox"
                        checked={incUpper}
                        onChange={e => setIncUpper(e.target.checked)}
                        className="w-4 h-4 accent-blue-600 rounded"
                      />
                      <span>A-Z</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer bg-white dark:bg-[#0a0f1a] p-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-blue-500 transition-colors">
                      <input
                        type="checkbox"
                        checked={incLower}
                        onChange={e => setIncLower(e.target.checked)}
                        className="w-4 h-4 accent-blue-600 rounded"
                      />
                      <span>a-z</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer bg-white dark:bg-[#0a0f1a] p-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-blue-500 transition-colors">
                      <input
                        type="checkbox"
                        checked={incNum}
                        onChange={e => setIncNum(e.target.checked)}
                        className="w-4 h-4 accent-blue-600 rounded"
                      />
                      <span>0-9</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer bg-white dark:bg-[#0a0f1a] p-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-blue-500 transition-colors">
                      <input
                        type="checkbox"
                        checked={incSym}
                        onChange={e => setIncSym(e.target.checked)}
                        className="w-4 h-4 accent-blue-600 rounded"
                      />
                      <span>!@#$%</span>
                    </label>
                  </fieldset>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requireEach}
                        onChange={e => setRequireEach(e.target.checked)}
                        className="w-4 h-4 accent-blue-600 rounded"
                      />
                      <span>Guarantee selected types</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={excludeAmbiguous}
                        onChange={e => setExcludeAmbiguous(e.target.checked)}
                        className="w-4 h-4 accent-blue-600 rounded"
                      />
                      <span>Exclude ambiguous (0, O, 1, l, |)</span>
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="input-word-count" className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      <span>Number of Words</span>
                      <span className="text-blue-600 dark:text-blue-400 font-mono">{wordCount}</span>
                    </label>
                    <input
                      id="input-word-count"
                      type="range"
                      min="3"
                      max="12"
                      value={wordCount}
                      onChange={e => setWordCount(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      aria-valuemin={3}
                      aria-valuemax={12}
                      aria-valuenow={wordCount}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="text-sm text-slate-700 dark:text-slate-300">
                      <span>Separator</span>
                      <select
                        aria-label="Passphrase word separator"
                        value={separator}
                        onChange={e => setSeparator(e.target.value)}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <option value="-">Hyphen (-)</option>
                        <option value=".">Period (.)</option>
                        <option value="_">Underscore (_)</option>
                        <option value="+">Plus (+)</option>
                        <option value=" ">Space ( )</option>
                        <option value="/">Slash (/)</option>
                      </select>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 pt-6 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={passphraseCaps}
                        onChange={e => setPassphraseCaps(e.target.checked)}
                        className="w-4 h-4 accent-blue-600 rounded"
                      />
                      <span>Capitalize words</span>
                    </label>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={passphraseNumber}
                      onChange={e => setPassphraseNumber(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded"
                    />
                    <span>Append random 4-digit number (+13.3 bits entropy)</span>
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sampled uniformly without replacement from a curated 1,024-word dictionary (10.0 bits/word). Suffix adds ~13.3 bits.
                  </p>
                </>
              )}
              <button
                type="button"
                onClick={generatePassword}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3.5 rounded-xl font-bold shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <RefreshCw className="w-5 h-5" /> Generate New
              </button>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowRecent(!showRecent)}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                  aria-expanded={showRecent}
                >
                  <Lock className="w-4 h-4" /> Session History {showRecent ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keepHistory}
                    onChange={e => {
                      setKeepHistory(e.target.checked);
                      if (!e.target.checked) clearHistory();
                    }}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                  <span>Keep in memory</span>
                </label>
              </div>
              {showRecent && (
                <div className="mt-3 space-y-2 bg-white dark:bg-[#0a0f1a] p-3 rounded-xl border border-gray-200 dark:border-slate-700">
                  {keepHistory && recentPasswords.length ? (
                    recentPasswords.map((p, i) => (
                      <div key={`${p}-${i}`} className="flex items-center justify-between text-sm font-mono text-slate-700 dark:text-slate-300 bg-gray-50 dark:bg-[#111827] p-2 rounded-lg">
                        <span className="truncate pr-4">{p}</span>
                        <button
                          type="button"
                          aria-label="Copy historical password"
                          onClick={() => copy(p, 'pass')}
                          className="text-blue-500 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-center text-slate-500">
                      History is off by default to protect privacy. Passwords are never saved to storage.
                    </p>
                  )}
                  {keepHistory && recentPasswords.length > 0 && (
                    <button
                      type="button"
                      onClick={clearHistory}
                      className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 mt-2 focus-visible:outline-none"
                    >
                      <Trash2 className="w-3 h-3" /> Clear session history
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* PASSWORD SECURITY ANALYZER */}
          <section aria-labelledby="heading-analyzer" className="bg-gray-50 dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
            <h2 id="heading-analyzer" className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-3">
              <ShieldAlert className="w-5 h-5 text-blue-600" /> Password Security Analyzer
            </h2>
            <label htmlFor="textarea-analyzer" className="text-xs text-slate-500 dark:text-slate-400">
              Paste or type a password to inspect its local composition:
            </label>
            <textarea
              id="textarea-analyzer"
              value={analysisInput}
              onChange={e => setAnalysisInput(e.target.value.slice(0, 4096))}
              placeholder="Paste a password to analyze locally…"
              className="w-full h-24 p-4 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white text-sm resize-none font-mono"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {(() => {
                const a = analyzePassword(analysisInput || password);
                return (
                  <>
                    <div className="bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl p-3">
                      <div className="text-slate-500">Score</div>
                      <div className="font-bold text-blue-600 text-lg">{a.score}/100</div>
                    </div>
                    <div className="bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl p-3">
                      <div className="text-slate-500">Entropy</div>
                      <div className="font-bold text-slate-800 dark:text-white">~{a.entropy} bits</div>
                    </div>
                    <div className="bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl p-3">
                      <div className="text-slate-500">Length</div>
                      <div className="font-bold text-slate-800 dark:text-white">{a.length}</div>
                    </div>
                    <div className="bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl p-3">
                      <div className="text-slate-500">Verdict</div>
                      <div className="font-bold text-emerald-600">{a.label}</div>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {(() => {
                const a = analyzePassword(analysisInput || password);
                return (
                  <>
                    {[
                      ['Repeated', a.repeated],
                      ['Sequence', a.sequence],
                      ['Keyboard pattern', a.keyboard],
                      ['Dictionary-like', a.dictionary],
                      ['Common password', a.common],
                      ['Date/year-like', a.dateLike],
                    ].map(([lbl, bad]) => (
                      <div
                        key={String(lbl)}
                        className={`rounded-lg border px-3 py-2 ${
                          bad
                            ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-300'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-300'
                        }`}
                      >
                        {bad ? '⚠' : '✓'} {String(lbl)}
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Local heuristic analysis — not a password-cracking guarantee. High scores do not imply mathematical uncrackability.
            </p>
          </section>

          {/* DEVELOPER SECRET GENERATOR */}
          <section aria-labelledby="heading-secret" className="bg-gray-50 dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
            <h2 id="heading-secret" className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-3">
              <Code2 className="w-5 h-5 text-blue-600" /> Developer Secret Generator
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Format</span>
                <select
                  aria-label="Secret output format"
                  value={secretFormat}
                  onChange={e => setSecretFormat(e.target.value as typeof secretFormat)}
                  className="mt-1 w-full px-3 py-2.5 text-sm normal-case font-normal rounded-xl bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="hex">Hex (API keys / seeds)</option>
                  <option value="base64">Base64 (RFC 4648)</option>
                  <option value="base64url">Base64URL (JWT / OAuth)</option>
                  <option value="uuid">UUID v4 (RFC 4122)</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Random bytes</span>
                <span className="ml-2 text-blue-600 font-mono">{secretFormat === 'uuid' ? '16 (fixed)' : secretBytes}</span>
                <input
                  type="range"
                  min="8"
                  max="64"
                  step="1"
                  value={secretBytes}
                  disabled={secretFormat === 'uuid'}
                  onChange={e => setSecretBytes(Number(e.target.value))}
                  className="mt-3 w-full accent-blue-600 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Number of random bytes"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={generateSecret}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <RefreshCw className="w-4 h-4" /> Generate Cryptographic Secret
            </button>
            {generatedSecret ? (
              <div className="bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between gap-3 shadow-inner">
                <div
                  tabIndex={0}
                  aria-label="Generated secret value"
                  className="flex-1 min-w-0 font-mono text-sm break-all select-all text-slate-800 dark:text-blue-100 focus-visible:outline-none"
                >
                  {generatedSecret}
                </div>
                <button
                  type="button"
                  aria-label="Copy generated secret"
                  onClick={() => copy(generatedSecret, 'secret')}
                  className="shrink-0 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                >
                  {copiedSecret ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#0a0f1a] border border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-4 text-center text-xs text-gray-400 dark:text-slate-500">
                Select a format and click &ldquo;Generate Cryptographic Secret&rdquo;.
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cryptographically secure bytes from browser CSPRNG. UUID v4 mode strictly applies RFC 4122 version and variant bits.
            </p>
          </section>
        </div>

        {/* RIGHT COLUMN: Hashing, File Integrity, Breach Check, Compare */}
        <div className="flex flex-col gap-6">
          {/* HASH & HMAC GENERATOR */}
          <section aria-labelledby="heading-hash" className="bg-gray-50 dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
            <h2 id="heading-hash" className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-3">
              <HashIcon className="w-5 h-5 text-blue-600" /> Hash &amp; HMAC Generator
            </h2>
            <label htmlFor="textarea-hash-input" className="text-xs text-slate-500 dark:text-slate-400">
              Text to hash (UTF-8 encoded, max 8 MB):
            </label>
            <textarea
              id="textarea-hash-input"
              value={hashInput}
              onChange={e => setHashInput(e.target.value)}
              placeholder="Enter text to hash..."
              className="w-full h-24 p-4 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white text-sm resize-none font-mono"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Mode</span>
                <select
                  aria-label="Hashing mode"
                  value={hmacMode ? 'hmac' : 'hash'}
                  onChange={e => setHmacMode(e.target.value === 'hmac')}
                  className="mt-1 w-full px-3 py-2.5 text-sm normal-case font-normal rounded-xl bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="hash">Standard Hash (all algorithms)</option>
                  <option value="hmac">HMAC (keyed authentication)</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>{hmacMode ? 'HMAC Algorithm' : 'Highlight Algorithm'}</span>
                <select
                  aria-label="Hash algorithm selection"
                  value={hashAlgorithm}
                  onChange={e => setHashAlgorithm(e.target.value as HashAlgorithm)}
                  className="mt-1 w-full px-3 py-2.5 text-sm normal-case font-normal rounded-xl bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="sha256">SHA-256 (Recommended)</option>
                  <option value="sha384">SHA-384 (Recommended)</option>
                  <option value="sha512">SHA-512 (Recommended)</option>
                  <option value="sha1">SHA-1 (Legacy / Insecure)</option>
                  <option value="md5">MD5 (Legacy / Insecure)</option>
                </select>
              </label>
            </div>
            {hmacMode && (
              <div>
                <label htmlFor="input-hmac-key" className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                  HMAC Secret Key (never sent over network):
                </label>
                <input
                  id="input-hmac-key"
                  type="password"
                  value={secretKey}
                  onChange={e => setSecretKey(e.target.value)}
                  placeholder="Enter secret key..."
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white text-sm font-mono"
                />
              </div>
            )}
            {hashError && (
              <div role="alert" className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-3">
                {hashError}
              </div>
            )}
            {hashing && (
              <div className="text-xs text-blue-600 flex items-center gap-2" aria-live="polite">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Computing hashes locally…</span>
              </div>
            )}
            <div className="space-y-3 mt-2">
              {(['sha256', 'sha384', 'sha512', 'sha1', 'md5'] as HashAlgorithm[]).map(algo => {
                const isLegacy = algo === 'sha1' || algo === 'md5';
                const hasHash = Boolean(hashes[algo]);
                return (
                  <div
                    key={algo}
                    className="bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700/80 rounded-2xl p-3.5 flex flex-col gap-2 transition-colors shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase font-mono tracking-wider text-slate-800 dark:text-slate-200">
                          {algo.toUpperCase()}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-sans font-semibold tracking-wide ${
                            isLegacy
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                          }`}
                        >
                          {isLegacy ? 'Legacy / Insecure' : 'Recommended'}
                        </span>
                      </div>

                      {hasHash && (
                        <button
                          type="button"
                          aria-label={`Copy ${algo.toUpperCase()} hash`}
                          onClick={() => copy(hashes[algo], 'hash')}
                          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                          {copiedHash === hashes[algo] ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="min-h-[1.5rem] flex items-center">
                      {hasHash ? (
                        <div
                          tabIndex={0}
                          aria-label={`${algo.toUpperCase()} hash output`}
                          className="w-full font-mono text-xs sm:text-sm text-blue-600 dark:text-blue-400 break-all select-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded"
                        >
                          {hashes[algo]}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-sans italic">
                          Enter text above to generate this hash.
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Password storage disclosure:</strong> Fast cryptographic hashes such as SHA-256 are not password-storage algorithms. Use a dedicated password KDF such as Argon2id, scrypt, or bcrypt for password storage. MD5 and SHA-1 are legacy digests and should not be used for modern security.
              </div>
            </div>
          </section>

          {/* FILE INTEGRITY HASH */}
          <section aria-labelledby="heading-file-hash" className="bg-gray-50 dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
            <h2 id="heading-file-hash" className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-3">
              <Fingerprint className="w-5 h-5 text-emerald-600" /> File Integrity Hash
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Algorithm</span>
                <select
                  aria-label="File hash algorithm"
                  value={fileHashAlgorithm}
                  onChange={e => setFileHashAlgorithm(e.target.value as FileHashAlgorithm)}
                  className="mt-1 w-full px-3 py-2.5 text-sm normal-case font-normal rounded-xl bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="SHA-256">SHA-256 (Standard)</option>
                  <option value="SHA-384">SHA-384</option>
                  <option value="SHA-512">SHA-512</option>
                </select>
              </label>
              <div className="text-xs text-slate-500 flex items-end pb-2">
                Processed locally via background Web Worker. The selected file is never uploaded.
              </div>
            </div>
            <div
              tabIndex={0}
              role="button"
              aria-label="File drop area: drop file or press enter to browse"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10'
                  : 'border-gray-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-white dark:hover:bg-[#0a0f1a]'
              }`}
            >
              <FileUp className="w-6 h-6 text-emerald-500 mb-2" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Drop a file or click to browse</p>
              <p className="text-xs text-slate-500 mt-1">Background Web Worker · Maximum supported input size: 1GB, subject to browser/device memory</p>
              <input
                type="file"
                ref={fileInputRef}
                onClick={e => { e.currentTarget.value = ''; }}
                onChange={e => { const f = e.target.files?.[0]; if (f) hashFile(f); }}
                className="hidden"
                aria-hidden="true"
              />
            </div>
            {isFileHashing && (
              <div className="space-y-2" aria-live="polite">
                <div className="flex items-center justify-between gap-3 text-sm text-emerald-600 font-medium">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Calculating {fileHashAlgorithm}… {fileProgress}%
                  </span>
                  <button
                    type="button"
                    onClick={cancelFileHash}
                    className="text-xs text-red-500 hover:text-red-600 underline font-semibold focus-visible:outline-none"
                  >
                    Cancel
                  </button>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={fileProgress} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full bg-emerald-500 transition-[width] duration-150" style={{ width: `${fileProgress}%` }} />
                </div>
              </div>
            )}
            {fileError && (
              <div role="alert" className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-3">
                {fileError}
              </div>
            )}
            {fileHash && (
              <div className="bg-white dark:bg-[#0a0f1a] border border-emerald-200 dark:border-emerald-800/50 p-3 rounded-xl flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-slate-500 mb-1 truncate">
                    {fileName} · {(fileSize / 1024 / 1024).toFixed(2)} MB · {fileHashAlgorithm}
                  </div>
                  <span tabIndex={0} className="font-mono text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 break-all select-all focus-visible:outline-none">
                    {fileHash}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Copy file hash"
                  onClick={() => copy(fileHash, 'hash')}
                  className="p-2 shrink-0 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {copiedHash === fileHash ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
          </section>

          {/* COMPROMISED PASSWORD CHECK */}
          <section aria-labelledby="heading-breach" className="bg-gray-50 dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
            <h2 id="heading-breach" className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-3">
              <EyeOff className="w-5 h-5 text-emerald-600" /> Compromised Password Check
            </h2>
            <label htmlFor="input-breach-check" className="text-xs text-slate-500 dark:text-slate-400">
              Check against known data breaches via k-anonymity (leave blank to check generated password):
            </label>
            <input
              id="input-breach-check"
              type="password"
              value={breachInput}
              onChange={e => {
                setBreachInput(e.target.value);
                setBreachCount(null);
                setBreachError('');
              }}
              placeholder="Enter password or check generated password…"
              autoComplete="off"
              className="w-full px-4 py-3 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white text-sm"
            />
            <button
              type="button"
              onClick={runBreachCheck}
              disabled={breachChecking || !(breachInput || password)}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Search className="w-4 h-4" /> {breachChecking ? 'Checking known breaches…' : 'Check known exposure'}
            </button>
            {breachCount !== null && (
              <div
                role="status"
                aria-live="polite"
                className={`rounded-xl p-4 border ${
                  breachCount > 0
                    ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-300'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-300'
                }`}
              >
                <div className="font-bold">
                  {breachCount > 0
                    ? `Found in known breach datasets: ${breachCount.toLocaleString()} occurrence${breachCount === 1 ? '' : 's'}.`
                    : 'No matches found in the current Pwned Passwords dataset.'}
                </div>
                <div className="text-xs mt-1 opacity-80">
                  k-anonymity protocol: Only the first 5 characters of the locally computed SHA-1 hash are transmitted to HIBP. The password and full SHA-1 hash are never sent.
                </div>
              </div>
            )}
            {breachError && (
              <div role="alert" className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-3">
                {breachError}
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Uses the Have I Been Pwned Pwned Passwords range API with Add-Padding. This is the only feature that makes any external network request.
            </p>
          </section>

          {/* HASH COMPARE */}
          <section aria-labelledby="heading-compare" className="bg-gray-50 dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
            <h2 id="heading-compare" className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-3">
              <Scale className="w-5 h-5 text-emerald-600" /> Hash Compare
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="input-hash-a" className="sr-only">Hash A</label>
                <input
                  id="input-hash-a"
                  value={hashA}
                  onChange={e => { setHashA(e.target.value.slice(0, 1024)); setHashCompareResult(''); }}
                  placeholder="Paste Hash A"
                  className="w-full px-4 py-3 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl font-mono text-sm dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="input-hash-b" className="sr-only">Hash B</label>
                <input
                  id="input-hash-b"
                  value={hashB}
                  onChange={e => { setHashB(e.target.value.slice(0, 1024)); setHashCompareResult(''); }}
                  placeholder="Paste Hash B"
                  className="w-full px-4 py-3 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl font-mono text-sm dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={compareHashes}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-3 rounded-xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Compare hashes
            </button>
            {hashCompareResult && (
              <div
                role="status"
                aria-live="polite"
                className={`rounded-xl p-4 border ${
                  hashCompareResult === 'match'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-300'
                    : hashCompareResult === 'different'
                    ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300'
                    : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-300'
                }`}
              >
                {hashCompareResult === 'match'
                  ? '✓ Hashes match exactly.'
                  : hashCompareResult === 'different'
                  ? '≠ Hashes are different.'
                  : 'Enter two valid even-length hexadecimal strings to compare.'}
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparison normalizes whitespace/case and uses a constant-time byte-wise comparison loop to mitigate timing side channels.
            </p>
          </section>
        </div>
      </div>

      {/* METHODOLOGY & SECURITY DISCLOSURES PANEL */}
      <section aria-labelledby="heading-methodology" className="bg-gray-50 dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 id="heading-methodology" className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" /> Security Methodology &amp; Privacy Disclosures
          </h2>
          <button
            type="button"
            onClick={() => setShowMethodology(!showMethodology)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1 focus-visible:outline-none"
            aria-expanded={showMethodology}
          >
            {showMethodology ? 'Hide Details' : 'View Details'} {showMethodology ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showMethodology && (
          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-gray-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Cryptographic Randomness &amp; Zero Modulo Bias</h3>
              <p>
                All generation operations rely exclusively on the browser&rsquo;s native Cryptographically Secure Pseudo-Random Number Generator (CSPRNG via <code className="font-mono text-blue-600 dark:text-blue-400">crypto.getRandomValues</code>). To select elements without modulo bias, unbiased rejection sampling is applied over the 32-bit unsigned integer range.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Theoretical Entropy Estimates</h3>
              <p>
                Entropy values displayed are estimated theoretical upper bounds based on the configuration space (<code className="font-mono text-blue-600 dark:text-blue-400">length × log₂(pool size)</code>). When constraints like &ldquo;Guarantee selected types&rdquo; are enforced, effective min-entropy may be slightly lower. Entropy estimates should not be construed as absolute crack-resistance guarantees against targeted brute-force attacks.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Passphrase Architecture</h3>
              <p>
                Passphrases are sampled uniformly without replacement from an auditable, distinct 1,024-word English dictionary (providing 10.0 bits per word). Suffix numbers are sampled uniformly from 0000 to 9999 (providing ~13.3 bits). Deterministic transformations such as word capitalization are not double-counted in the entropy score.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Hash Classifications &amp; Password Storage Notice</h3>
              <p>
                SHA-256, SHA-384, and SHA-512 are recommended modern cryptographic digests. MD5 and SHA-1 are retained exclusively for legacy checksum verification and are vulnerable to collision attacks. Fast cryptographic hashes are <strong>not</strong> suitable for storing passwords. For password storage, always use a dedicated memory-hard Key Derivation Function (KDF) such as Argon2id, scrypt, or bcrypt with appropriate work factors.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Breach Verification (k-Anonymity)</h3>
              <p>
                The breach checker computes the SHA-1 digest locally and transmits strictly the first 5 hexadecimal characters to the Have I Been Pwned range API with padding enabled. The remaining 35 characters are evaluated entirely inside your browser. Only the first five SHA-1 characters are intentionally sent to HIBP; the password and full SHA-1 hash are never sent.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Privacy &amp; Memory Retention</h3>
              <p>
                This tool does not store sensitive values in localStorage, sessionStorage, cookies, IndexedDB, or URL parameters. Sensitive values exist only in browser memory while the tab is active. Note that because JavaScript engines manage garbage collection, physical memory wiping cannot be cryptographically guaranteed by browser script code.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
