/**
 * OmniTools — ISO 639 Language & Locale Registry
 *
 * Dataset Source:
 * - Authoritative IANA Language Subtag Registry (RFC 5646, Registry Date: 2024-03-07)
 * - ISO 639-1:2002 (Codes for the representation of names of languages — Part 1: Alpha-2 code)
 * - ISO 639-3:2007 (Codes for the representation of names of languages — Part 3: Alpha-3 code)
 *
 * Licensing / Terms:
 * - Public Domain / IETF & ISO Open Specification Standard.
 *
 * Architecture:
 * - ISO language codes (ISO 639-1 and ISO 639-3) are tracked distinctly from BCP 47 locale tags.
 * - Bicameral casing capability (hasBicameralCasing) is explicitly separated from language membership,
 *   documenting that unicameral scripts (Arabic, Hebrew, Devanagari, CJK, etc.) do not possess letter cases.
 */

export interface IsoLanguageEntry {
  /** Two-letter ISO 639-1 code if defined (e.g. "en", "tr", "el") */
  iso639_1?: string;
  /** Three-letter ISO 639-3 code (e.g. "eng", "tur", "ell", "ast") */
  iso639_3: string;
  /** Canonical BCP 47 language identifier (e.g. "en-US", "tr", "el", "ast") */
  bcp47: string;
  /** Standard English name per ISO 639 / IANA standard */
  name: string;
  /** Endonym / Native name in the native script or orthography */
  nativeName: string;
  /** Dominant script family ISO 15924 (e.g. Latn, Grek, Cyrl, Arab, Hebr, Deva, Hani) */
  script: string;
  /** True if script distinguishes uppercase and lowercase (bicameral); false if unicameral */
  hasBicameralCasing: boolean;
  /** Specialized linguistic casing notes where applicable */
  casingNotes?: string;
}

export const ISO_LANGUAGES: IsoLanguageEntry[] = [
  // --- POPULAR / SPECIALIZED CASING LANGUAGES ---
  {
    iso639_1: 'en',
    iso639_3: 'eng',
    bcp47: 'en-US',
    name: 'English (United States)',
    nativeName: 'English',
    script: 'Latn',
    hasBicameralCasing: true,
    casingNotes: 'Standard Latin bicameral casing',
  },
  {
    iso639_1: 'tr',
    iso639_3: 'tur',
    bcp47: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    script: 'Latn',
    hasBicameralCasing: true,
    casingNotes: 'Dotted and dotless I distinction (İ/i, I/ı)',
  },
  {
    iso639_1: 'az',
    iso639_3: 'aze',
    bcp47: 'az',
    name: 'Azerbaijani',
    nativeName: 'Azərbaycan',
    script: 'Latn',
    hasBicameralCasing: true,
    casingNotes: 'Dotted and dotless I distinction (İ/i, I/ı)',
  },
  {
    iso639_1: 'de',
    iso639_3: 'deu',
    bcp47: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    script: 'Latn',
    hasBicameralCasing: true,
    casingNotes: 'Capital sharp s (ß to SS / ẞ)',
  },
  {
    iso639_1: 'el',
    iso639_3: 'ell',
    bcp47: 'el',
    name: 'Greek',
    nativeName: 'Ελληνικά',
    script: 'Grek',
    hasBicameralCasing: true,
    casingNotes: 'Medial vs word-final sigma (Σ/σ/ς)',
  },
  {
    iso639_1: 'lt',
    iso639_3: 'lit',
    bcp47: 'lt',
    name: 'Lithuanian',
    nativeName: 'Lietuvių',
    script: 'Latn',
    hasBicameralCasing: true,
    casingNotes: 'Soft-dotted i with combining accents (i̇)',
  },
  {
    iso639_1: 'nl',
    iso639_3: 'nld',
    bcp47: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    script: 'Latn',
    hasBicameralCasing: true,
    casingNotes: 'Digraph IJ title capitalization',
  },
  {
    iso639_1: 'es',
    iso639_3: 'spa',
    bcp47: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    script: 'Latn',
    hasBicameralCasing: true,
    casingNotes: 'Inverted punctuation and ñ/Ñ',
  },
  {
    iso639_1: 'fr',
    iso639_3: 'fra',
    bcp47: 'fr',
    name: 'French',
    nativeName: 'Français',
    script: 'Latn',
    hasBicameralCasing: true,
    casingNotes: 'Accented Latin bicameral casing',
  },

  // --- COMPLETE ISO 639-1 LANGUAGES (Alphabetical) ---
  { iso639_1: 'aa', iso639_3: 'aar', bcp47: 'aa', name: 'Afar', nativeName: 'Qafaraf', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ab', iso639_3: 'abk', bcp47: 'ab', name: 'Abkhazian', nativeName: 'Аԥсуа бызшәа', script: 'Cyrl', hasBicameralCasing: true },
  { iso639_1: 'ae', iso639_3: 'ave', bcp47: 'ae', name: 'Avestan', nativeName: 'Avesta', script: 'Avst', hasBicameralCasing: false },
  { iso639_1: 'af', iso639_3: 'afr', bcp47: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ak', iso639_3: 'aka', bcp47: 'ak', name: 'Akan', nativeName: 'Akan', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'am', iso639_3: 'amh', bcp47: 'am', name: 'Amharic', nativeName: 'አማርኛ', script: 'Ethi', hasBicameralCasing: false },
  { iso639_1: 'an', iso639_3: 'arg', bcp47: 'an', name: 'Aragonese', nativeName: 'Aragonés', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ar', iso639_3: 'ara', bcp47: 'ar', name: 'Arabic', nativeName: 'العربية', script: 'Arab', hasBicameralCasing: false, casingNotes: 'Unicameral cursive script (no letter cases)' },
  { iso639_1: 'as', iso639_3: 'asm', bcp47: 'as', name: 'Assamese', nativeName: 'অসমীয়া', script: 'Beng', hasBicameralCasing: false },
  { iso639_1: 'av', iso639_3: 'ava', bcp47: 'av', name: 'Avaric', nativeName: 'МагIарул мацI', script: 'Cyrl', hasBicameralCasing: true },
  { iso639_1: 'ay', iso639_3: 'aym', bcp47: 'ay', name: 'Aymara', nativeName: 'Aymar aru', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ba', iso639_3: 'bak', bcp47: 'ba', name: 'Bashkir', nativeName: 'Башҡорт теле', script: 'Cyrl', hasBicameralCasing: true },
  { iso639_1: 'be', iso639_3: 'bel', bcp47: 'be', name: 'Belarusian', nativeName: 'Беларуская', script: 'Cyrl', hasBicameralCasing: true },
  { iso639_1: 'bg', iso639_3: 'bul', bcp47: 'bg', name: 'Bulgarian', nativeName: 'Български', script: 'Cyrl', hasBicameralCasing: true },
  { iso639_1: 'bi', iso639_3: 'bis', bcp47: 'bi', name: 'Bislama', nativeName: 'Bislama', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'bm', iso639_3: 'bam', bcp47: 'bm', name: 'Bambara', nativeName: 'Bamanankan', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'bn', iso639_3: 'ben', bcp47: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Beng', hasBicameralCasing: false },
  { iso639_1: 'bo', iso639_3: 'bod', bcp47: 'bo', name: 'Tibetan', nativeName: 'བོད་ཡིག', script: 'Tibt', hasBicameralCasing: false },
  { iso639_1: 'br', iso639_3: 'bre', bcp47: 'br', name: 'Breton', nativeName: 'Brezhoneg', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'bs', iso639_3: 'bos', bcp47: 'bs', name: 'Bosnian', nativeName: 'Bosanski', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ca', iso639_3: 'cat', bcp47: 'ca', name: 'Catalan', nativeName: 'Català', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ce', iso639_3: 'che', bcp47: 'ce', name: 'Chechen', nativeName: 'Нохчийн мотт', script: 'Cyrl', hasBicameralCasing: true },
  { iso639_1: 'ch', iso639_3: 'cha', bcp47: 'ch', name: 'Chamorro', nativeName: 'Chamoru', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'co', iso639_3: 'cos', bcp47: 'co', name: 'Corsican', nativeName: 'Corsu', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'cr', iso639_3: 'cre', bcp47: 'cr', name: 'Cree', nativeName: 'ᓀᐦᐃᔭᐍウィン', script: 'Cans', hasBicameralCasing: false },
  { iso639_1: 'cs', iso639_3: 'ces', bcp47: 'cs', name: 'Czech', nativeName: 'Čeština', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'cu', iso639_3: 'chu', bcp47: 'cu', name: 'Church Slavic', nativeName: 'Славе́нскїй', script: 'Cyrl', hasBicameralCasing: true },
  { iso639_1: 'cv', iso639_3: 'chv', bcp47: 'cv', name: 'Chuvash', nativeName: 'Чӑвашла', script: 'Cyrl', hasBicameralCasing: true },
  { iso639_1: 'cy', iso639_3: 'cym', bcp47: 'cy', name: 'Welsh', nativeName: 'Cymraeg', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'da', iso639_3: 'dan', bcp47: 'da', name: 'Danish', nativeName: 'Dansk', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'dv', iso639_3: 'div', bcp47: 'dv', name: 'Divehi', nativeName: 'ދިވެހިބަސް', script: 'Thaa', hasBicameralCasing: false },
  { iso639_1: 'dz', iso639_3: 'dzo', bcp47: 'dz', name: 'Dzongkha', nativeName: 'རྫོང་ཁ', script: 'Tibt', hasBicameralCasing: false },
  { iso639_1: 'ee', iso639_3: 'ewe', bcp47: 'ee', name: 'Ewe', nativeName: 'Eʋegbe', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'eo', iso639_3: 'epo', bcp47: 'eo', name: 'Esperanto', nativeName: 'Esperanto', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'et', iso639_3: 'est', bcp47: 'et', name: 'Estonian', nativeName: 'Eesti', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'eu', iso639_3: 'eus', bcp47: 'eu', name: 'Basque', nativeName: 'Euskara', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'fa', iso639_3: 'fas', bcp47: 'fa', name: 'Persian', nativeName: 'فارسی', script: 'Arab', hasBicameralCasing: false },
  { iso639_1: 'ff', iso639_3: 'ful', bcp47: 'ff', name: 'Fulah', nativeName: 'Fulfulde', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'fi', iso639_3: 'fin', bcp47: 'fi', name: 'Finnish', nativeName: 'Suomi', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'fj', iso639_3: 'fij', bcp47: 'fj', name: 'Fijian', nativeName: 'Na Vosa Vakaviti', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'fo', iso639_3: 'fao', bcp47: 'fo', name: 'Faroese', nativeName: 'Føroyskt', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'fy', iso639_3: 'fry', bcp47: 'fy', name: 'Western Frisian', nativeName: 'Frysk', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ga', iso639_3: 'gle', bcp47: 'ga', name: 'Irish', nativeName: 'Gaeilge', script: 'Latn', hasBicameralCasing: true, casingNotes: 'Lenition mutation prefixes (t-Sráid, n-Éirinn)' },
  { iso639_1: 'gd', iso639_3: 'gla', bcp47: 'gd', name: 'Scottish Gaelic', nativeName: 'Gàidhlig', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'gl', iso639_3: 'glg', bcp47: 'gl', name: 'Galician', nativeName: 'Galego', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'gn', iso639_3: 'grn', bcp47: 'gn', name: 'Guarani', nativeName: 'Avañeʼẽ', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'gu', iso639_3: 'guj', bcp47: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujr', hasBicameralCasing: false },
  { iso639_1: 'gv', iso639_3: 'glv', bcp47: 'gv', name: 'Manx', nativeName: 'Gaelg', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ha', iso639_3: 'hau', bcp47: 'ha', name: 'Hausa', nativeName: 'هَوُسَ / Hausa', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'he', iso639_3: 'heb', bcp47: 'he', name: 'Hebrew', nativeName: 'עברית', script: 'Hebr', hasBicameralCasing: false },
  { iso639_1: 'hi', iso639_3: 'hin', bcp47: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Deva', hasBicameralCasing: false },
  { iso639_1: 'ho', iso639_3: 'hmo', bcp47: 'ho', name: 'Hiri Motu', nativeName: 'Hiri Motu', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'hr', iso639_3: 'hrv', bcp47: 'hr', name: 'Croatian', nativeName: 'Hrvatski', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ht', iso639_3: 'hat', bcp47: 'ht', name: 'Haitian Creole', nativeName: 'Kreyòl ayisyen', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'hu', iso639_3: 'hun', bcp47: 'hu', name: 'Hungarian', nativeName: 'Magyar', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'hy', iso639_3: 'hye', bcp47: 'hy', name: 'Armenian', nativeName: 'Հայերեն', script: 'Armn', hasBicameralCasing: true, casingNotes: 'Armenian bicameral casing (Ա/ա)' },
  { iso639_1: 'hz', iso639_3: 'her', bcp47: 'hz', name: 'Herero', nativeName: 'Otjiherero', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ia', iso639_3: 'ina', bcp47: 'ia', name: 'Interlingua', nativeName: 'Interlingua', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'id', iso639_3: 'ind', bcp47: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ie', iso639_3: 'ile', bcp47: 'ie', name: 'Interlingue', nativeName: 'Interlingue', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ig', iso639_3: 'ibo', bcp47: 'ig', name: 'Igbo', nativeName: 'Asụsụ Igbo', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ii', iso639_3: 'iii', bcp47: 'ii', name: 'Sichuan Yi', nativeName: 'ꆈꌠꉙ', script: 'Yiii', hasBicameralCasing: false },
  { iso639_1: 'ik', iso639_3: 'ipk', bcp47: 'ik', name: 'Inupiaq', nativeName: 'Iñupiatun', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'io', iso639_3: 'ido', bcp47: 'io', name: 'Ido', nativeName: 'Ido', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'is', iso639_3: 'isl', bcp47: 'is', name: 'Icelandic', nativeName: 'Íslenska', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'it', iso639_3: 'ita', bcp47: 'it', name: 'Italian', nativeName: 'Italiano', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'iu', iso639_3: 'iku', bcp47: 'iu', name: 'Inuktitut', nativeName: 'ᐃᓄᒃᑎᑐᑦ', script: 'Cans', hasBicameralCasing: false },
  { iso639_1: 'ja', iso639_3: 'jpn', bcp47: 'ja', name: 'Japanese', nativeName: '日本語', script: 'Jpan', hasBicameralCasing: false },
  { iso639_1: 'jv', iso639_3: 'jav', bcp47: 'jv', name: 'Javanese', nativeName: 'Basa Jawa', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ka', iso639_3: 'kat', bcp47: 'ka', name: 'Georgian', nativeName: 'ქართული', script: 'Geor', hasBicameralCasing: true, casingNotes: 'Mtavruli capital casing supported in Unicode 11+' },
  { iso639_1: 'kg', iso639_3: 'kon', bcp47: 'kg', name: 'Kongo', nativeName: 'Kikongo', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ki', iso639_3: 'kik', bcp47: 'ki', name: 'Kikuyu', nativeName: 'Gĩkũyũ', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'kj', iso639_3: 'kua', bcp47: 'kj', name: 'Kuanyama', nativeName: 'Kuanyama', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'kk', iso639_3: 'kaz', bcp47: 'kk', name: 'Kazakh', nativeName: 'Қазақ тілі', script: 'Cyrl', hasBicameralCasing: true },
  { iso639_1: 'kl', iso639_3: 'kal', bcp47: 'kl', name: 'Kalaallisut', nativeName: 'Kalaallisut', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'km', iso639_3: 'khm', bcp47: 'km', name: 'Central Khmer', nativeName: 'ភាសាខ្មែរ', script: 'Khmr', hasBicameralCasing: false },
  { iso639_1: 'kn', iso639_3: 'kan', bcp47: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Knda', hasBicameralCasing: false },
  { iso639_1: 'ko', iso639_3: 'kor', bcp47: 'ko', name: 'Korean', nativeName: '한국어', script: 'Hang', hasBicameralCasing: false },
  { iso639_1: 'kr', iso639_3: 'kau', bcp47: 'kr', name: 'Kanuri', nativeName: 'Kanuri', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ks', iso639_3: 'kas', bcp47: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर / کٲشُر', script: 'Arab', hasBicameralCasing: false },
  { iso639_1: 'ku', iso639_3: 'kur', bcp47: 'ku', name: 'Kurdish', nativeName: 'Kurdî / کوردی', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'kv', iso639_3: 'kom', bcp47: 'kv', name: 'Komi', nativeName: 'Коми кыв', script: 'Cyrl', hasBicameralCasing: true },
  { iso639_1: 'kw', iso639_3: 'cor', bcp47: 'kw', name: 'Cornish', nativeName: 'Kernewek', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ky', iso639_3: 'kir', bcp47: 'ky', name: 'Kirghiz', nativeName: 'Кыргызча', script: 'Cyrl', hasBicameralCasing: true },
  { iso639_1: 'la', iso639_3: 'lat', bcp47: 'la', name: 'Latin', nativeName: 'Latina', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'lb', iso639_3: 'ltz', bcp47: 'lb', name: 'Luxembourgish', nativeName: 'Lëtzebuergesch', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'lg', iso639_3: 'lug', bcp47: 'lg', name: 'Ganda', nativeName: 'Luganda', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'li', iso639_3: 'lim', bcp47: 'li', name: 'Limburgan', nativeName: 'Limburgs', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ln', iso639_3: 'lin', bcp47: 'ln', name: 'Lingala', nativeName: 'Lingála', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'lo', iso639_3: 'lao', bcp47: 'lo', name: 'Lao', nativeName: 'ພາສາລາວ', script: 'Laoo', hasBicameralCasing: false },
  { iso639_1: 'lu', iso639_3: 'lub', bcp47: 'lu', name: 'Luba-Katanga', nativeName: 'Kiluba', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'lv', iso639_3: 'lav', bcp47: 'lv', name: 'Latvian', nativeName: 'Latviešu', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'mg', iso639_3: 'mlg', bcp47: 'mg', name: 'Malagasy', nativeName: 'Malagasy', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'mh', iso639_3: 'mah', bcp47: 'mh', name: 'Marshallese', nativeName: 'Kajin M̧ajeļ', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'mi', iso639_3: 'mri', bcp47: 'mi', name: 'Maori', nativeName: 'Te Reo Māori', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'mk', iso639_3: 'mkd', bcp47: 'mk', name: 'Macedonian', nativeName: 'Македонски', script: 'Cyrl', hasBicameralCasing: true },
  { iso639_1: 'ml', iso639_3: 'mal', bcp47: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Mlym', hasBicameralCasing: false },
  { iso639_1: 'mn', iso639_3: 'mon', bcp47: 'mn', name: 'Mongolian', nativeName: 'Монгол хэл', script: 'Cyrl', hasBicameralCasing: true },
  { iso639_1: 'mr', iso639_3: 'mar', bcp47: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Deva', hasBicameralCasing: false },
  { iso639_1: 'ms', iso639_3: 'msa', bcp47: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'mt', iso639_3: 'mlt', bcp47: 'mt', name: 'Maltese', nativeName: 'Malti', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'my', iso639_3: 'mya', bcp47: 'my', name: 'Burmese', nativeName: 'မြန်မာစာ', script: 'Mymr', hasBicameralCasing: false },
  { iso639_1: 'na', iso639_3: 'nau', bcp47: 'na', name: 'Nauru', nativeName: 'Dorerin Naoero', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'nb', iso639_3: 'nob', bcp47: 'nb', name: 'Norwegian Bokmål', nativeName: 'Norsk Bokmål', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'nd', iso639_3: 'nde', bcp47: 'nd', name: 'North Ndebele', nativeName: 'isiNdebele', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ne', iso639_3: 'nep', bcp47: 'ne', name: 'Nepali', nativeName: 'नेपाली', script: 'Deva', hasBicameralCasing: false },
  { iso639_1: 'ng', iso639_3: 'ndo', bcp47: 'ng', name: 'Ndonga', nativeName: 'Oshindonga', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'nn', iso639_3: 'nno', bcp47: 'nn', name: 'Norwegian Nynorsk', nativeName: 'Norsk Nynorsk', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'no', iso639_3: 'nor', bcp47: 'no', name: 'Norwegian', nativeName: 'Norsk', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'nr', iso639_3: 'nbl', bcp47: 'nr', name: 'South Ndebele', nativeName: 'isiNdebele', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'nv', iso639_3: 'nav', bcp47: 'nv', name: 'Navajo', nativeName: 'Diné bizaad', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ny', iso639_3: 'nya', bcp47: 'ny', name: 'Chichewa', nativeName: 'ChiCheŵa', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'oc', iso639_3: 'oci', bcp47: 'oc', name: 'Occitan', nativeName: 'Occitan', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'oj', iso639_3: 'oji', bcp47: 'oj', name: 'Ojibwa', nativeName: 'ᐊᓂᔑᓈᐯᒧᐎᓐ', script: 'Cans', hasBicameralCasing: false },
  { iso639_1: 'om', iso639_3: 'orm', bcp47: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'or', iso639_3: 'ori', bcp47: 'or', name: 'Oriya', nativeName: 'ଓଡ଼ିଆ', script: 'Orya', hasBicameralCasing: false },
  { iso639_1: 'os', iso639_3: 'oss', bcp47: 'os', name: 'Ossetian', nativeName: 'Ирон æвзаг', script: 'Cyrl', hasBicameralCasing: true },
  { iso639_1: 'pa', iso639_3: 'pan', bcp47: 'pa', name: 'Panjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Guru', hasBicameralCasing: false },
  { iso639_1: 'pi', iso639_3: 'pli', bcp47: 'pi', name: 'Pali', nativeName: 'Pāli', script: 'Deva', hasBicameralCasing: false },
  { iso639_1: 'pl', iso639_3: 'pol', bcp47: 'pl', name: 'Polish', nativeName: 'Polski', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ps', iso639_3: 'pus', bcp47: 'ps', name: 'Pashto', nativeName: 'پښتو', script: 'Arab', hasBicameralCasing: false },
  { iso639_1: 'pt', iso639_3: 'por', bcp47: 'pt', name: 'Portuguese', nativeName: 'Português', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'qu', iso639_3: 'que', bcp47: 'qu', name: 'Quechua', nativeName: 'Runa Simi', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'rm', iso639_3: 'roh', bcp47: 'rm', name: 'Romansh', nativeName: 'Rumantsch', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'rn', iso639_3: 'run', bcp47: 'rn', name: 'Rundi', nativeName: 'Ikirundi', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ro', iso639_3: 'ron', bcp47: 'ro', name: 'Romanian', nativeName: 'Română', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ru', iso639_3: 'rus', bcp47: 'ru', name: 'Russian', nativeName: 'Русский', script: 'Cyrl', hasBicameralCasing: true },
  { iso639_1: 'rw', iso639_3: 'kin', bcp47: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'sa', iso639_3: 'san', bcp47: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', script: 'Deva', hasBicameralCasing: false },
  { iso639_1: 'sc', iso639_3: 'srd', bcp47: 'sc', name: 'Sardinian', nativeName: 'Sardu', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'sd', iso639_3: 'snd', bcp47: 'sd', name: 'Sindhi', nativeName: 'سنڌي / सिन्धी', script: 'Arab', hasBicameralCasing: false },
  { iso639_1: 'se', iso639_3: 'sme', bcp47: 'se', name: 'Northern Sami', nativeName: 'Davvisámegiella', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'sg', iso639_3: 'sag', bcp47: 'sg', name: 'Sango', nativeName: 'Sängö', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'sh', iso639_3: 'hbs', bcp47: 'sh', name: 'Serbo-Croatian (Historical)', nativeName: 'Srpskohrvatski / Српскохрватски', script: 'Latn', hasBicameralCasing: true, casingNotes: 'Historical ISO 639-1 macrocode' },
  { iso639_1: 'si', iso639_3: 'sin', bcp47: 'si', name: 'Sinhala', nativeName: 'සිංහල', script: 'Sinh', hasBicameralCasing: false },
  { iso639_1: 'sk', iso639_3: 'slk', bcp47: 'sk', name: 'Slovak', nativeName: 'Slovenčina', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'sl', iso639_3: 'slv', bcp47: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'sm', iso639_3: 'smo', bcp47: 'sm', name: 'Samoan', nativeName: 'Gagana Sāmoa', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'sn', iso639_3: 'sna', bcp47: 'sn', name: 'Shona', nativeName: 'chiShona', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'so', iso639_3: 'som', bcp47: 'so', name: 'Somali', nativeName: 'Soomaaliga', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'sq', iso639_3: 'sqi', bcp47: 'sq', name: 'Albanian', nativeName: 'Shqip', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'sr', iso639_3: 'srp', bcp47: 'sr', name: 'Serbian', nativeName: 'Српски / Srpski', script: 'Cyrl', hasBicameralCasing: true },
  { iso639_1: 'ss', iso639_3: 'ssw', bcp47: 'ss', name: 'Swati', nativeName: 'SiSwati', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'st', iso639_3: 'sot', bcp47: 'st', name: 'Southern Sotho', nativeName: 'Sesotho', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'su', iso639_3: 'sun', bcp47: 'su', name: 'Sundanese', nativeName: 'Basa Sunda', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'sv', iso639_3: 'swe', bcp47: 'sv', name: 'Swedish', nativeName: 'Svenska', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'sw', iso639_3: 'swa', bcp47: 'sw', name: 'Swahili', nativeName: 'Kiswahili', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ta', iso639_3: 'tam', bcp47: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Taml', hasBicameralCasing: false },
  { iso639_1: 'te', iso639_3: 'tel', bcp47: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telu', hasBicameralCasing: false },
  { iso639_1: 'tg', iso639_3: 'tgk', bcp47: 'tg', name: 'Tajik', nativeName: 'Тоҷикӣ', script: 'Cyrl', hasBicameralCasing: true },
  { iso639_1: 'th', iso639_3: 'tha', bcp47: 'th', name: 'Thai', nativeName: 'ไทย', script: 'Thai', hasBicameralCasing: false },
  { iso639_1: 'ti', iso639_3: 'tir', bcp47: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ', script: 'Ethi', hasBicameralCasing: false },
  { iso639_1: 'tk', iso639_3: 'tuk', bcp47: 'tk', name: 'Turkmen', nativeName: 'Türkmençe', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'tl', iso639_3: 'tgl', bcp47: 'tl', name: 'Tagalog', nativeName: 'Tagalog', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'tn', iso639_3: 'tsn', bcp47: 'tn', name: 'Tswana', nativeName: 'Setswana', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'to', iso639_3: 'ton', bcp47: 'to', name: 'Tonga', nativeName: 'Lea Fakatonga', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ts', iso639_3: 'tso', bcp47: 'ts', name: 'Tsonga', nativeName: 'Xitsonga', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'tt', iso639_3: 'tat', bcp47: 'tt', name: 'Tatar', nativeName: 'Татарча', script: 'Cyrl', hasBicameralCasing: true },
  { iso639_1: 'tw', iso639_3: 'twi', bcp47: 'tw', name: 'Twi', nativeName: 'Twi', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ty', iso639_3: 'tah', bcp47: 'ty', name: 'Tahitian', nativeName: 'Reo Tahiti', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'ug', iso639_3: 'uig', bcp47: 'ug', name: 'Uighur', nativeName: 'ئۇيغۇرچە', script: 'Arab', hasBicameralCasing: false },
  { iso639_1: 'uk', iso639_3: 'ukr', bcp47: 'uk', name: 'Ukrainian', nativeName: 'Українська', script: 'Cyrl', hasBicameralCasing: true },
  { iso639_1: 'ur', iso639_3: 'urd', bcp47: 'ur', name: 'Urdu', nativeName: 'اردو', script: 'Arab', hasBicameralCasing: false },
  { iso639_1: 'uz', iso639_3: 'uzb', bcp47: 'uz', name: 'Uzbek', nativeName: 'Oʻzbekcha / Ўзбекча', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 've', iso639_3: 'ven', bcp47: 've', name: 'Venda', nativeName: 'Tshivenḓa', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'vi', iso639_3: 'vie', bcp47: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'vo', iso639_3: 'vol', bcp47: 'vo', name: 'Volapük', nativeName: 'Volapük', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'wa', iso639_3: 'wln', bcp47: 'wa', name: 'Walloon', nativeName: 'Walon', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'wo', iso639_3: 'wol', bcp47: 'wo', name: 'Wolof', nativeName: 'Wolof', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'xh', iso639_3: 'xho', bcp47: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'yi', iso639_3: 'yid', bcp47: 'yi', name: 'Yiddish', nativeName: 'ייִדיש', script: 'Hebr', hasBicameralCasing: false },
  { iso639_1: 'yo', iso639_3: 'yor', bcp47: 'yo', name: 'Yoruba', nativeName: 'Èdè Yorùbá', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'za', iso639_3: 'zha', bcp47: 'za', name: 'Zhuang', nativeName: 'Vahcuengh', script: 'Latn', hasBicameralCasing: true },
  { iso639_1: 'zh', iso639_3: 'zho', bcp47: 'zh', name: 'Chinese (Simplified)', nativeName: '中文', script: 'Hani', hasBicameralCasing: false, casingNotes: 'Unicameral logographic Hanzi characters' },
  { iso639_1: 'zu', iso639_3: 'zul', bcp47: 'zu', name: 'Zulu', nativeName: 'isiZulu', script: 'Latn', hasBicameralCasing: true },

  // --- ADDITIONAL INDIVIDUAL ISO 639-3 LANGUAGES WITHOUT ISO 639-1 ---
  { iso639_3: 'ast', bcp47: 'ast', name: 'Asturian', nativeName: 'Asturianu', script: 'Latn', hasBicameralCasing: true },
  { iso639_3: 'fil', bcp47: 'fil', name: 'Filipino', nativeName: 'Filipino', script: 'Latn', hasBicameralCasing: true },
  { iso639_3: 'gsw', bcp47: 'gsw', name: 'Swiss German', nativeName: 'Schwiizertüütsch', script: 'Latn', hasBicameralCasing: true },
  { iso639_3: 'haw', bcp47: 'haw', name: 'Hawaiian', nativeName: 'ʻŌlelo Hawaiʻi', script: 'Latn', hasBicameralCasing: true },
  { iso639_3: 'kab', bcp47: 'kab', name: 'Kabyle', nativeName: 'Taqbaylit', script: 'Latn', hasBicameralCasing: true },
  { iso639_3: 'sco', bcp47: 'sco', name: 'Scots', nativeName: 'Scots', script: 'Latn', hasBicameralCasing: true },
  { iso639_3: 'yue', bcp47: 'yue', name: 'Yue Chinese (Cantonese)', nativeName: '粵語', script: 'Hani', hasBicameralCasing: false },
];

/**
 * Filtered subsets for UI and performance
 */
export const BICAMERAL_LANGUAGES = ISO_LANGUAGES.filter((l) => l.hasBicameralCasing);
export const UNICAMERAL_LANGUAGES = ISO_LANGUAGES.filter((l) => !l.hasBicameralCasing);
export const SPECIAL_CASING_LANGUAGES = ISO_LANGUAGES.filter((l) => Boolean(l.casingNotes));

/**
 * Quick lookup index by BCP 47 code
 */
const LANGUAGE_BY_BCP47 = new Map<string, IsoLanguageEntry>();
for (const entry of ISO_LANGUAGES) {
  LANGUAGE_BY_BCP47.set(entry.bcp47.toLowerCase(), entry);
  if (entry.iso639_1) {
    LANGUAGE_BY_BCP47.set(entry.iso639_1.toLowerCase(), entry);
  }
}

/**
 * Find language entry by BCP 47 tag or ISO 639-1 code
 */
export function getLanguageByBcp47(tag: string): IsoLanguageEntry | undefined {
  if (!tag) return undefined;
  return LANGUAGE_BY_BCP47.get(tag.toLowerCase());
}

/**
 * Fast search filter across the complete ISO registry
 */
export function searchLanguages(
  query: string,
  filter: 'all' | 'bicameral' | 'unicameral' = 'all'
): IsoLanguageEntry[] {
  let dataset = ISO_LANGUAGES;
  if (filter === 'bicameral') dataset = BICAMERAL_LANGUAGES;
  else if (filter === 'unicameral') dataset = UNICAMERAL_LANGUAGES;

  const q = query.trim().toLowerCase();
  if (!q) return dataset;

  return dataset.filter((entry) => {
    return (
      entry.name.toLowerCase().includes(q) ||
      entry.nativeName.toLowerCase().includes(q) ||
      entry.bcp47.toLowerCase().includes(q) ||
      (entry.iso639_1 && entry.iso639_1.toLowerCase().includes(q)) ||
      entry.iso639_3.toLowerCase().includes(q)
    );
  });
}

/**
 * Summary metrics of the ISO 639 registry
 */
export function getLanguageCoverageStats() {
  const iso1Codes = ISO_LANGUAGES.filter((l) => Boolean(l.iso639_1)).map((l) => l.iso639_1!);
  const uniqueIso1 = new Set(iso1Codes);
  const iso3Codes = ISO_LANGUAGES.map((l) => l.iso639_3);
  const uniqueIso3 = new Set(iso3Codes);

  return {
    totalEntries: ISO_LANGUAGES.length,
    iso639_1Count: iso1Codes.length,
    iso639_1Unique: uniqueIso1.size,
    iso639_3Unique: uniqueIso3.size,
    bicameralCount: BICAMERAL_LANGUAGES.length,
    unicameralCount: UNICAMERAL_LANGUAGES.length,
    specialCasingCount: SPECIAL_CASING_LANGUAGES.length,
  };
}
