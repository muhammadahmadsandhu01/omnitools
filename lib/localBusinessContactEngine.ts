/**
 * KivaroTools — Local Business, Profession & Contact Intelligence Studio Engine
 * File: lib/localBusinessContactEngine.ts
 *
 * Architecture:
 * 1. Engine 1 (Live Global City & Profession Finder):
 *    - Generates multi-tag Overpass QL queries for 36 professions across 6 industry sectors.
 *    - Queries CORS-enabled OpenStreetMap Overpass API endpoints (overpass-api.de +
 *      overpass.private.coffee automatic failover) and Nominatim city geocoding.
 *    - Computes Haversine distance (km), extracts OSM contact:* / addr:* / opening_hours tags,
 *      and normalizes international phone numbers & emails.
 * 2. Engine 2 (Google Search/Maps, Directory, HTML, CSV & vCard Deep Paste Enricher):
 *    - Parses copied Google Maps/Search local packs, Marham/Oladoc/YellowPages directories,
 *      raw HTML source (including Cloudflare data-cfemail hex & JSON-LD LocalBusiness blocks),
 *      RFC 4180 CSV/TSV tables, and vCard (.vcf) files.
 *    - De-obfuscates 12+ anti-scraper email patterns ([at], (at), {at}, %40, HTML entities,
 *      Cloudflare hex) without false positives on natural prose sentences.
 *    - Normalizes PK (+92 / 061 Multan / 042 Lahore / 021 Karachi / 051 Islamabad / 111 UAN / 0800),
 *      UAE (+971), KSA (+966), GCC (+974/+968/+965), UK (+44), EU (+49/+31/+90),
 *      US/CA (+1), and APAC (+61/+65/+60) phone numbers into E.164 + wa.me links.
 * 3. Engine 3 (Multi-Index Entity Deduplication, Field Isolation, DNS MX Check & 5-Format Export):
 *    - Multi-index deduplication across shared Email, E.164 Phone, and Normalized Name + City.
 *    - Isolates "Complete Business Details", "Emails Only", or "Phone Numbers + WhatsApp Only"
 *      filtered by sector, profession, city, email domain type, and contact completeness.
 *    - Exports CWE-1236-safe 3-Sheet Excel (.xlsx), CSV (.csv), vCard 3.0 (.vcf),
 *      GeoJSON (.geojson), and JSON (.json).
 */

export const LOCAL_BUSINESS_ENGINE_VERSION = '3.0.0-global';
export const MAX_SAFE_PASTE_BYTES = 15 * 1024 * 1024; // 15 MB

export type IndustrySectorId =
  | 'healthcare'
  | 'home_trades'
  | 'professional_b2b'
  | 'technology_corp'
  | 'hospitality_retail'
  | 'education_lifestyle';

export type OutputViewMode =
  | 'complete_profiles'
  | 'emails_only'
  | 'phones_only'
  | 'overpass_ql';

export type EmailCopyFormat =
  | 'plain_newline'
  | 'comma_separated'
  | 'named_rfc5322'
  | 'domain_grouped';

export type PhoneCopyFormat =
  | 'e164_newline'
  | 'local_newline'
  | 'whatsapp_links'
  | 'named_directory';

export type RecordSourceType =
  | 'osm_overpass_live'
  | 'pasted_directory_text'
  | 'html_jsonld_dom'
  | 'csv_tsv_import'
  | 'vcard_import';

export type SupportedCountryCode =
  | 'US' | 'CA' | 'MX'
  | 'GB' | 'DE' | 'FR' | 'IT' | 'ES' | 'NL' | 'CH' | 'SE' | 'NO' | 'DK' | 'FI' | 'PL' | 'AT' | 'BE' | 'IE' | 'PT' | 'GR' | 'CZ' | 'RO' | 'HU' | 'UA' | 'TR'
  | 'AE' | 'SA' | 'QA' | 'KW' | 'OM' | 'BH' | 'JO' | 'EG' | 'MA' | 'TN' | 'DZ' | 'IQ' | 'LB'
  | 'PK' | 'IN' | 'BD' | 'LK' | 'NP' | 'UZ' | 'KZ'
  | 'AU' | 'NZ' | 'SG' | 'MY' | 'ID' | 'PH' | 'TH' | 'VN' | 'JP' | 'KR' | 'CN' | 'HK' | 'TW'
  | 'BR' | 'AR' | 'CO' | 'CL' | 'PE'
  | 'ZA' | 'NG' | 'KE' | 'GH' | 'ET' | 'TZ';

export interface ProfessionTagRule {
  key: string;
  value: string;
}

export interface ProfessionProfile {
  id: string;
  label: string;
  shortLabel: string;
  sector: IndustrySectorId;
  sectorLabel: string;
  osmRules: ProfessionTagRule[];
  keywords: string[];
  description: string;
}

export interface CityPreset {
  id: string;
  name: string;
  region: string;
  countryCode: SupportedCountryCode;
  countryName: string;
  dialCode: string;
  localAreaCode?: string;
  latitude: number;
  longitude: number;
  defaultRadiusKm: number;
}

export interface NormalizedPhoneItem {
  raw: string;
  e164: string;
  localDisplay: string;
  countryCode: string;
  lineType: 'mobile' | 'landline' | 'tollfree_or_uan';
  whatsappUrl: string;
}

export interface NormalizedEmailItem {
  raw: string;
  email: string;
  localPart: string;
  domain: string;
  isCorporateDomain: boolean;
  isRoleAccount: boolean;
  wasObfuscated: boolean;
  mxVerified?: boolean | null;
  mxRecords?: string[];
}

export interface BusinessContactRecord {
  id: string;
  businessName: string;
  professionId: string;
  professionLabel: string;
  sector: IndustrySectorId;
  sectorLabel: string;
  emails: NormalizedEmailItem[];
  phones: NormalizedPhoneItem[];
  website: string;
  streetAddress: string;
  city: string;
  postcode: string;
  country: string;
  openingHours: string;
  latitude: number | null;
  longitude: number | null;
  distanceKm: number | null;
  googleMapsUrl: string;
  osmUrl: string;
  sourceType: RecordSourceType;
  completenessScore: number; // 0 to 100
  rawTags: Record<string, string>;
}

export interface ContactFilterOptions {
  searchQuery: string;
  selectedSector: IndustrySectorId | 'all';
  selectedProfessionId: string | 'all';
  selectedCityFilter: string | 'all';
  requireEmail: boolean;
  requirePhone: boolean;
  requireWebsite: boolean;
  corporateEmailOnly: boolean;
  mobileWhatsappOnly: boolean;
  minCompletenessScore: number;
  defaultCountryCode: SupportedCountryCode;
}

export interface ExtractionMetrics {
  totalRecords: number;
  filteredRecords: number;
  totalUniqueEmails: number;
  filteredUniqueEmails: number;
  corporateEmailsCount: number;
  obfuscatedRecoveredCount: number;
  totalUniquePhones: number;
  filteredUniquePhones: number;
  whatsappMobileCount: number;
  recordsWithBothEmailAndPhone: number;
  recordsWithCoordinates: number;
  recordsWithWebsite: number;
  sectorBreakdown: Record<IndustrySectorId, number>;
  executionTimeMs: number;
}

export interface ContactExtractionResult {
  engineVersion: string;
  records: BusinessContactRecord[];
  filteredRecords: BusinessContactRecord[];
  uniqueEmails: NormalizedEmailItem[];
  uniquePhones: NormalizedPhoneItem[];
  metrics: ExtractionMetrics;
  generatedOverpassQl: string;
  activeEndpointUsed?: string;
}

// ============================================================================
// 1. 36 PROFESSION PROFILES ACROSS 6 MACRO SECTORS (EXACT 36 REGISTRY)
// ============================================================================

export const INDUSTRY_SECTOR_LABELS: Record<IndustrySectorId, string> = {
  healthcare: 'Healthcare, Doctors & Dental Clinics',
  home_trades: 'Plumbers, Electricians & Home Trades',
  professional_b2b: 'Legal, Accounting, Real Estate & Finance',
  technology_corp: 'Software Houses, IT & Corporate Offices',
  hospitality_retail: 'Restaurants, Hotels & Retail Stores',
  education_lifestyle: 'Education, Gyms, Salons & Travel',
};

export const PROFESSION_REGISTRY: ProfessionProfile[] = [
  // Sector 1: Healthcare & Medical (6 Professions)
  {
    id: 'dentist',
    label: 'Dental Clinics, Dentists & Orthodontists',
    shortLabel: 'Dental Clinics',
    sector: 'healthcare',
    sectorLabel: INDUSTRY_SECTOR_LABELS.healthcare,
    osmRules: [
      { key: 'amenity', value: 'dentist' },
      { key: 'healthcare', value: 'dentist' },
    ],
    keywords: [
      'dentist',
      'dental',
      'orthodont',
      'implant center',
      'oral surgery',
      'endodont',
      'maxillofacial',
      'smile care',
      'smile clinic',
      'prosthodont',
    ],
    description: 'Dental clinics, orthodontists, oral surgeons, and cosmetic dentistry practices.',
  },
  {
    id: 'doctors_clinic',
    label: 'Doctors, Specialist Clinics & Medical Centers',
    shortLabel: 'Doctors & Clinics',
    sector: 'healthcare',
    sectorLabel: INDUSTRY_SECTOR_LABELS.healthcare,
    osmRules: [
      { key: 'amenity', value: 'doctors' },
      { key: 'amenity', value: 'clinic' },
      { key: 'healthcare', value: 'doctor' },
      { key: 'healthcare', value: 'clinic' },
      { key: 'healthcare', value: 'centre' },
    ],
    keywords: [
      'doctor',
      'doctors',
      'polyclinic',
      'medical center',
      'medical centre',
      'medical clinic',
      'specialist clinic',
      'physician',
      'surgeon',
      'pediatric',
      'gynecolog',
      'dermatolog',
      'cardiolog',
      'ent specialist',
      'orthopedic',
      'neurolog',
      'urolog',
      'gastroenterolog',
      'mbbs',
      'fcps',
    ],
    description: 'General practitioners, specialist doctors, outpatient clinics, and polyclinics.',
  },
  {
    id: 'hospital',
    label: 'Hospitals & Surgical Institutes',
    shortLabel: 'Hospitals',
    sector: 'healthcare',
    sectorLabel: INDUSTRY_SECTOR_LABELS.healthcare,
    osmRules: [
      { key: 'amenity', value: 'hospital' },
      { key: 'healthcare', value: 'hospital' },
    ],
    keywords: [
      'hospital',
      'infirmary',
      'medical institute',
      'teaching hospital',
      'surgical hospital',
      'medicity',
      'maternity home',
    ],
    description: 'General hospitals, surgical centers, maternity hospitals, and emergency institutes.',
  },
  {
    id: 'pharmacy',
    label: 'Pharmacies, Chemists & Medical Stores',
    shortLabel: 'Pharmacies',
    sector: 'healthcare',
    sectorLabel: INDUSTRY_SECTOR_LABELS.healthcare,
    osmRules: [
      { key: 'amenity', value: 'pharmacy' },
      { key: 'healthcare', value: 'pharmacy' },
      { key: 'shop', value: 'chemist' },
    ],
    keywords: ['pharmacy', 'chemist', 'medical store', 'drug store', 'medicos', 'pharmaceutical'],
    description: 'Retail pharmacies, chain chemists, and wholesale medical stores.',
  },
  {
    id: 'diagnostic_lab',
    label: 'Diagnostic Labs, Pathology & Imaging Centers',
    shortLabel: 'Diagnostic Labs',
    sector: 'healthcare',
    sectorLabel: INDUSTRY_SECTOR_LABELS.healthcare,
    osmRules: [
      { key: 'healthcare', value: 'laboratory' },
      { key: 'amenity', value: 'laboratory' },
    ],
    keywords: [
      'diagnostic lab',
      'diagnostics',
      'pathology',
      'laboratory',
      'chughtai lab',
      'islamabad diagnostic',
      'excel labs',
      'x-ray center',
      'mri center',
      'ultrasound clinic',
    ],
    description: 'Blood testing laboratories, pathology collection centers, and radiology/MRI clinics.',
  },
  {
    id: 'veterinary',
    label: 'Veterinary Clinics & Pet Hospitals',
    shortLabel: 'Veterinary',
    sector: 'healthcare',
    sectorLabel: INDUSTRY_SECTOR_LABELS.healthcare,
    osmRules: [
      { key: 'amenity', value: 'veterinary' },
      { key: 'shop', value: 'pet' },
    ],
    keywords: ['veterinary', 'vet clinic', 'pet hospital', 'animal clinic', 'pet care', 'veterinarian'],
    description: 'Veterinarians, animal hospitals, and pet care clinics.',
  },

  // Sector 2: Home Services, Construction & Skilled Trades (7 Professions)
  {
    id: 'plumber',
    label: 'Plumbers, Sanitary & Pipe Fitting Services',
    shortLabel: 'Plumbers',
    sector: 'home_trades',
    sectorLabel: INDUSTRY_SECTOR_LABELS.home_trades,
    osmRules: [
      { key: 'craft', value: 'plumber' },
      { key: 'shop', value: 'bathroom_furnishing' },
      { key: 'shop', value: 'trade' },
    ],
    keywords: [
      'plumber',
      'plumbing',
      'pipe fitting',
      'water tank',
      'drain cleaning',
      'geyser repair',
      'motor pump',
      'sewerage',
      'leakage repair',
      'sanitary fitting',
    ],
    description: 'Residential and commercial plumbers, sanitary contractors, drain cleaning, and water pump technicians.',
  },
  {
    id: 'electrician',
    label: 'Electricians, Solar & Electrical Contractors',
    shortLabel: 'Electricians & Solar',
    sector: 'home_trades',
    sectorLabel: INDUSTRY_SECTOR_LABELS.home_trades,
    osmRules: [
      { key: 'craft', value: 'electrician' },
      { key: 'shop', value: 'electrical' },
      { key: 'craft', value: 'electronics_repair' },
    ],
    keywords: [
      'electrician',
      'electrical engineering',
      'electrical works',
      'solar panel',
      'solar installer',
      'solar energy',
      'inverter repair',
      'ups repair',
      'generator repair',
    ],
    description: 'Licensed electricians, solar panel installers, UPS/inverter repair, and electrical supply stores.',
  },
  {
    id: 'hvac_cooling',
    label: 'HVAC, Air Conditioning & Refrigeration Services',
    shortLabel: 'AC & HVAC Techs',
    sector: 'home_trades',
    sectorLabel: INDUSTRY_SECTOR_LABELS.home_trades,
    osmRules: [
      { key: 'craft', value: 'hvac' },
      { key: 'shop', value: 'appliance' },
    ],
    keywords: [
      'hvac',
      'air conditioning',
      'ac repair',
      'ac technician',
      'refrigeration',
      'chiller',
      'split ac',
      'cooling service',
    ],
    description: 'Split/inverter AC repair technicians, commercial HVAC contractors, and refrigeration workshops.',
  },
  {
    id: 'carpenter_furniture',
    label: 'Carpenters, Woodwork & Furniture Workshops',
    shortLabel: 'Carpenters & Woodwork',
    sector: 'home_trades',
    sectorLabel: INDUSTRY_SECTOR_LABELS.home_trades,
    osmRules: [
      { key: 'craft', value: 'carpenter' },
      { key: 'craft', value: 'cabinet_maker' },
      { key: 'shop', value: 'furniture' },
    ],
    keywords: ['carpenter', 'woodwork', 'furniture', 'kitchen cabinet', 'wardrobe', 'joinery', 'interior wood'],
    description: 'Custom carpenters, kitchen cabinet makers, and furniture showrooms.',
  },
  {
    id: 'auto_repair',
    label: 'Auto Repair Workshops, Mechanics & Car Detailing',
    shortLabel: 'Auto Mechanics',
    sector: 'home_trades',
    sectorLabel: INDUSTRY_SECTOR_LABELS.home_trades,
    osmRules: [
      { key: 'shop', value: 'car_repair' },
      { key: 'shop', value: 'tyres' },
      { key: 'amenity', value: 'car_wash' },
    ],
    keywords: [
      'auto repair',
      'car mechanic',
      'auto workshop',
      'denting painting',
      'wheel alignment',
      'tyre shop',
      'car detailing',
      'oil change',
    ],
    description: 'Car mechanics, auto electrical workshops, tyre centers, and detailing studios.',
  },
  {
    id: 'construction_builder',
    label: 'Civil Contractors, Builders & Architecture Firms',
    shortLabel: 'Builders & Architects',
    sector: 'home_trades',
    sectorLabel: INDUSTRY_SECTOR_LABELS.home_trades,
    osmRules: [
      { key: 'office', value: 'architect' },
      { key: 'office', value: 'construction_company' },
      { key: 'craft', value: 'builder' },
      { key: 'craft', value: 'painter' },
    ],
    keywords: [
      'architect',
      'architecture firm',
      'construction company',
      'civil engineer',
      'civil contractor',
      'interior design',
      'home renovation',
    ],
    description: 'Architectural design firms, civil construction companies, and home renovation contractors.',
  },
  {
    id: 'pest_cleaning',
    label: 'Pest Control, Fumigation & Deep Cleaning Services',
    shortLabel: 'Pest & Cleaning',
    sector: 'home_trades',
    sectorLabel: INDUSTRY_SECTOR_LABELS.home_trades,
    osmRules: [
      { key: 'craft', value: 'cleaning' },
      { key: 'office', value: 'pest_control' },
    ],
    keywords: [
      'pest control',
      'fumigation',
      'termite proofing',
      'deep cleaning',
      'sofa cleaning',
      'carpet cleaning',
      'janitorial',
    ],
    description: 'Termite and pest control operators, commercial fumigation, and residential deep cleaning teams.',
  },

  // Sector 3: Professional, Legal & Financial Services (6 Professions)
  {
    id: 'lawyer_legal',
    label: 'Lawyers, Advocates, Notaries & Law Chambers',
    shortLabel: 'Lawyers & Advocates',
    sector: 'professional_b2b',
    sectorLabel: INDUSTRY_SECTOR_LABELS.professional_b2b,
    osmRules: [
      { key: 'office', value: 'lawyer' },
      { key: 'office', value: 'notary' },
    ],
    keywords: [
      'lawyer',
      'advocate',
      'attorney',
      'law firm',
      'law associates',
      'law chambers',
      'legal consultant',
      'solicitor',
      'barrister',
      'notary',
      'high court',
    ],
    description: 'Corporate law firms, civil/tax/family advocates, immigration attorneys, and public notaries.',
  },
  {
    id: 'accountant_tax',
    label: 'Chartered Accountants, Tax Advisors & Audit Firms',
    shortLabel: 'Accountants & Tax',
    sector: 'professional_b2b',
    sectorLabel: INDUSTRY_SECTOR_LABELS.professional_b2b,
    osmRules: [
      { key: 'office', value: 'accountant' },
      { key: 'office', value: 'tax_advisor' },
      { key: 'office', value: 'financial_advisor' },
    ],
    keywords: [
      'accountant',
      'chartered accountant',
      'tax advisor',
      'tax advisory',
      'tax consultant',
      'audit firm',
      'bookkeeping',
      'vat consultant',
    ],
    description: 'Chartered accounting firms, tax filing consultants, bookkeeping offices, and auditors.',
  },
  {
    id: 'real_estate',
    label: 'Real Estate Agencies, Property Dealers & Housing Societies',
    shortLabel: 'Real Estate',
    sector: 'professional_b2b',
    sectorLabel: INDUSTRY_SECTOR_LABELS.professional_b2b,
    osmRules: [
      { key: 'office', value: 'estate_agent' },
      { key: 'office', value: 'property_management' },
    ],
    keywords: [
      'real estate',
      'estate agent',
      'property dealer',
      'realtor',
      'properties',
      'realty',
      'housing society',
      'authorized dealers',
      'lettings',
    ],
    description: 'Real estate brokers, commercial property consultants, and housing society offices.',
  },
  {
    id: 'bank_finance',
    label: 'Banks, Financial Institutions & Currency Exchange',
    shortLabel: 'Banks & Exchange',
    sector: 'professional_b2b',
    sectorLabel: INDUSTRY_SECTOR_LABELS.professional_b2b,
    osmRules: [
      { key: 'amenity', value: 'bank' },
      { key: 'amenity', value: 'bureau_de_change' },
      { key: 'office', value: 'financial' },
    ],
    keywords: ['bank branch', 'islamic bank', 'commercial bank', 'microfinance', 'money exchange', 'currency exchange'],
    description: 'Commercial bank branches, Islamic banking hubs, and licensed currency exchanges.',
  },
  {
    id: 'insurance',
    label: 'Insurance Companies, Takaful & Brokerage Offices',
    shortLabel: 'Insurance & Takaful',
    sector: 'professional_b2b',
    sectorLabel: INDUSTRY_SECTOR_LABELS.professional_b2b,
    osmRules: [{ key: 'office', value: 'insurance' }],
    keywords: ['insurance', 'takaful', 'life insurance', 'health insurance', 'underwriter', 'assurance'],
    description: 'Health, motor, corporate, and Takaful insurance branches and brokers.',
  },
  {
    id: 'consulting_marketing',
    label: 'Digital Marketing, PR & Business Consulting Agencies',
    shortLabel: 'Marketing Agencies',
    sector: 'professional_b2b',
    sectorLabel: INDUSTRY_SECTOR_LABELS.professional_b2b,
    osmRules: [
      { key: 'office', value: 'advertising_agency' },
      { key: 'office', value: 'consulting' },
      { key: 'office', value: 'marketing' },
    ],
    keywords: [
      'marketing agency',
      'digital marketing',
      'seo agency',
      'advertising agency',
      'media agency',
      'pr agency',
      'management consulting',
      'branding studio',
    ],
    description: 'Digital marketing agencies, SEO/PPC consultants, advertising studios, and management advisors.',
  },

  // Sector 4: Technology, Digital & Corporate Offices (6 Professions)
  {
    id: 'software_it',
    label: 'Software Houses, IT Companies & Web/App Studios',
    shortLabel: 'Software & IT',
    sector: 'technology_corp',
    sectorLabel: INDUSTRY_SECTOR_LABELS.technology_corp,
    osmRules: [
      { key: 'office', value: 'it' },
      { key: 'office', value: 'software' },
      { key: 'office', value: 'telecommunication' },
    ],
    keywords: [
      'software house',
      'software company',
      'it company',
      'web development',
      'app development',
      'saas',
      'tech park',
      'devops',
      'ai engineering',
      'ai solutions',
      'cloud systems',
    ],
    description: 'Software engineering companies, web/mobile development agencies, SaaS startups, and IT exporters.',
  },
  {
    id: 'coworking_office',
    label: 'Coworking Spaces, Corporate Offices & Incubators',
    shortLabel: 'Coworking & Offices',
    sector: 'technology_corp',
    sectorLabel: INDUSTRY_SECTOR_LABELS.technology_corp,
    osmRules: [
      { key: 'amenity', value: 'coworking_space' },
      { key: 'office', value: 'company' },
      { key: 'office', value: 'coworking' },
    ],
    keywords: ['coworking', 'co-working', 'business center', 'corporate office', 'headquarters', 'incubator'],
    description: 'Shared coworking hubs, startup incubators, and corporate regional headquarters.',
  },
  {
    id: 'electronics_computer',
    label: 'Computer, Laptop, Mobile & Electronics Retailers',
    shortLabel: 'Computers & Mobile',
    sector: 'technology_corp',
    sectorLabel: INDUSTRY_SECTOR_LABELS.technology_corp,
    osmRules: [
      { key: 'shop', value: 'computer' },
      { key: 'shop', value: 'mobile_phone' },
      { key: 'shop', value: 'electronics' },
    ],
    keywords: [
      'computer shop',
      'laptop repair',
      'mobile shop',
      'electronics store',
      'networking hardware',
      'gaming pc',
    ],
    description: 'Laptop and computer dealers, smartphone retailers, and electronics repair centers.',
  },
  {
    id: 'logistics_courier',
    label: 'Logistics, Courier, Cargo & Freight Forwarders',
    shortLabel: 'Logistics & Courier',
    sector: 'technology_corp',
    sectorLabel: INDUSTRY_SECTOR_LABELS.technology_corp,
    osmRules: [
      { key: 'office', value: 'logistics' },
      { key: 'office', value: 'moving_company' },
      { key: 'amenity', value: 'post_office' },
    ],
    keywords: [
      'logistics',
      'courier',
      'cargo',
      'freight',
      'shipping',
      'leopards courier',
      'dhl',
      'fedex',
      'movers',
      'fulfillment',
    ],
    description: 'E-commerce courier hubs, air/sea freight forwarders, and customs clearing agents.',
  },
  {
    id: 'locksmith_security',
    label: 'CCTV, Security Systems, Access Control & Locksmiths',
    shortLabel: 'CCTV & Security',
    sector: 'technology_corp',
    sectorLabel: INDUSTRY_SECTOR_LABELS.technology_corp,
    osmRules: [
      { key: 'craft', value: 'locksmith' },
      { key: 'shop', value: 'security' },
    ],
    keywords: [
      'cctv',
      'security systems',
      'biometric',
      'fire alarm',
      'locksmith',
      'surveillance',
      'access control',
    ],
    description: 'CCTV camera installers, fire alarm integrators, biometric attendance suppliers, and locksmiths.',
  },
  {
    id: 'printing_packaging',
    label: 'Printing Presses, Custom Packaging & Signage Studios',
    shortLabel: 'Printing & Packaging',
    sector: 'technology_corp',
    sectorLabel: INDUSTRY_SECTOR_LABELS.technology_corp,
    osmRules: [
      { key: 'craft', value: 'printer' },
      { key: 'shop', value: 'copyshop' },
      { key: 'craft', value: 'signmaker' },
    ],
    keywords: [
      'printing press',
      'offset printing',
      'packaging',
      'corrugated cartons',
      'signage',
      'panaflex',
      '3d signboard',
    ],
    description: 'Offset printing presses, e-commerce box packaging manufacturers, and LED signage makers.',
  },

  // Sector 5: Hospitality, Food & Retail (6 Professions)
  {
    id: 'restaurant_cafe',
    label: 'Restaurants, Cafes, Bakeries & Cloud Kitchens',
    shortLabel: 'Restaurants & Cafes',
    sector: 'hospitality_retail',
    sectorLabel: INDUSTRY_SECTOR_LABELS.hospitality_retail,
    osmRules: [
      { key: 'amenity', value: 'restaurant' },
      { key: 'amenity', value: 'cafe' },
      { key: 'amenity', value: 'fast_food' },
      { key: 'shop', value: 'bakery' },
    ],
    keywords: [
      'restaurant',
      'cafe',
      'coffee shop',
      'bistro',
      'bakery',
      'bakers and sweets',
      'fast food',
      'steakhouse',
      'bbq',
      'pizzeria',
    ],
    description: 'Fine dining restaurants, specialty coffee shops, bakeries, and catering services.',
  },
  {
    id: 'hotel_lodging',
    label: 'Hotels, Guest Houses, Resorts & Serviced Apartments',
    shortLabel: 'Hotels & Lodging',
    sector: 'hospitality_retail',
    sectorLabel: INDUSTRY_SECTOR_LABELS.hospitality_retail,
    osmRules: [
      { key: 'tourism', value: 'hotel' },
      { key: 'tourism', value: 'guest_house' },
      { key: 'tourism', value: 'apartment' },
    ],
    keywords: ['hotel', 'guest house', 'resort', 'serviced apartments', 'lodging', 'banquet hall', 'marquee'],
    description: 'Business hotels, boutique guest houses, wedding marquees, and serviced apartments.',
  },
  {
    id: 'supermarket_grocery',
    label: 'Supermarkets, Cash & Carry & Department Stores',
    shortLabel: 'Supermarkets',
    sector: 'hospitality_retail',
    sectorLabel: INDUSTRY_SECTOR_LABELS.hospitality_retail,
    osmRules: [
      { key: 'shop', value: 'supermarket' },
      { key: 'shop', value: 'department_store' },
      { key: 'shop', value: 'convenience' },
    ],
    keywords: [
      'supermarket',
      'cash and carry',
      'hypermarket',
      'grocery store',
      'departmental store',
      'wholesale mart',
    ],
    description: 'Supermarkets, wholesale cash-and-carry marts, and department stores.',
  },
  {
    id: 'clothing_textile',
    label: 'Garments, Textile Mills, Boutiques & Footwear',
    shortLabel: 'Clothing & Textile',
    sector: 'hospitality_retail',
    sectorLabel: INDUSTRY_SECTOR_LABELS.hospitality_retail,
    osmRules: [
      { key: 'shop', value: 'clothes' },
      { key: 'shop', value: 'shoes' },
      { key: 'shop', value: 'fabric' },
      { key: 'shop', value: 'tailor' },
    ],
    keywords: [
      'clothing brand',
      'boutique',
      'garments',
      'textile mill',
      'fabrics',
      'apparel',
      'embroidery',
      'footwear',
    ],
    description: 'Fashion boutiques, textile wholesale traders, garment manufacturers, and footwear stores.',
  },
  {
    id: 'hardware_building',
    label: 'Hardware, Sanitary Ware, Paint & Building Material Stores',
    shortLabel: 'Hardware & Sanitary',
    sector: 'hospitality_retail',
    sectorLabel: INDUSTRY_SECTOR_LABELS.hospitality_retail,
    osmRules: [
      { key: 'shop', value: 'hardware' },
      { key: 'shop', value: 'doityourself' },
      { key: 'shop', value: 'paint' },
    ],
    keywords: [
      'hardware store',
      'building material',
      'tiles and ceramics',
      'sanitary store',
      'paint shop',
      'cement dealer',
      'steel traders',
    ],
    description: 'Hardware tools, ceramic tiles, sanitary ware showrooms, and paint dealers.',
  },
  {
    id: 'jewelry_optics',
    label: 'Jewelry Showrooms, Watch Dealers & Optical Clinics',
    shortLabel: 'Jewelry & Optics',
    sector: 'hospitality_retail',
    sectorLabel: INDUSTRY_SECTOR_LABELS.hospitality_retail,
    osmRules: [
      { key: 'shop', value: 'jewelry' },
      { key: 'shop', value: 'optician' },
    ],
    keywords: ['jeweller', 'jewelry', 'gold ornaments', 'optician', 'optical clinic', 'eyewear'],
    description: 'Gold and diamond jewelers, watch boutiques, and optical eyewear centers.',
  },

  // Sector 6: Education, Fitness & Lifestyle (5 Professions -> Total = 6 + 7 + 6 + 6 + 6 + 5 = 36 Professions)
  {
    id: 'school_college',
    label: 'Schools, Colleges, Universities & Training Academies',
    shortLabel: 'Schools & Colleges',
    sector: 'education_lifestyle',
    sectorLabel: INDUSTRY_SECTOR_LABELS.education_lifestyle,
    osmRules: [
      { key: 'amenity', value: 'school' },
      { key: 'amenity', value: 'college' },
      { key: 'amenity', value: 'university' },
      { key: 'amenity', value: 'training' },
    ],
    keywords: ['school', 'college', 'university', 'academy', 'campus', 'ielts center', 'coaching institute'],
    description: 'Private schools, degree colleges, universities, and vocational/language academies.',
  },
  {
    id: 'gym_fitness',
    label: 'Gyms, Fitness Clubs, Yoga & Sports Complexes',
    shortLabel: 'Gyms & Fitness',
    sector: 'education_lifestyle',
    sectorLabel: INDUSTRY_SECTOR_LABELS.education_lifestyle,
    osmRules: [
      { key: 'leisure', value: 'fitness_centre' },
      { key: 'leisure', value: 'sports_centre' },
    ],
    keywords: ['gym', 'fitness club', 'crossfit', 'health club', 'yoga studio', 'pilates', 'sports complex'],
    description: 'Commercial gyms, personal training studios, and sports complexes.',
  },
  {
    id: 'beauty_salon',
    label: 'Beauty Salons, Barbershops & Aesthetic Studios',
    shortLabel: 'Salons & Aesthetics',
    sector: 'education_lifestyle',
    sectorLabel: INDUSTRY_SECTOR_LABELS.education_lifestyle,
    osmRules: [
      { key: 'shop', value: 'beauty' },
      { key: 'shop', value: 'hairdresser' },
    ],
    keywords: [
      'beauty salon',
      'beauty parlor',
      'beauty parlour',
      'barbershop',
      'hair studio',
      'day spa',
      'laser aesthetics',
      'bridal studio',
    ],
    description: 'Bridal salons, men’s grooming studios, spas, and aesthetic skincare centers.',
  },
  {
    id: 'travel_agency',
    label: 'Travel Agencies, Umrah/Hajj Operators & Study Abroad',
    shortLabel: 'Travel & Visa',
    sector: 'education_lifestyle',
    sectorLabel: INDUSTRY_SECTOR_LABELS.education_lifestyle,
    osmRules: [
      { key: 'shop', value: 'travel_agency' },
      { key: 'office', value: 'travel_agent' },
      { key: 'office', value: 'educational_institution' },
    ],
    keywords: [
      'travel agency',
      'tours and travels',
      'umrah',
      'hajj',
      'air ticketing',
      'visa consultant',
      'study abroad',
      'education consultant',
    ],
    description: 'IATA travel agencies, Umrah/Hajj tour operators, and study-abroad visa consultants.',
  },
  {
    id: 'event_photography',
    label: 'Event Planners, Photography Studios & Catering Services',
    shortLabel: 'Events & Photo Studios',
    sector: 'education_lifestyle',
    sectorLabel: INDUSTRY_SECTOR_LABELS.education_lifestyle,
    osmRules: [
      { key: 'craft', value: 'photographer' },
      { key: 'shop', value: 'photo' },
      { key: 'craft', value: 'caterer' },
    ],
    keywords: [
      'event planner',
      'wedding planner',
      'photography studio',
      'videography',
      'catering service',
      'event management',
    ],
    description: 'Wedding and corporate event planners, commercial photography studios, and caterers.',
  },
];

// ============================================================================
// 2. 36 GLOBAL & REGIONAL CITY PRESETS (PAKISTAN, UAE, KSA, GCC, UK, EU, US/APAC)
// ============================================================================

export const CITY_PRESETS: CityPreset[] = [
  // Pakistan (14 Cities)
  {
    id: 'pk-multan',
    name: 'Multan',
    region: 'Punjab, Pakistan',
    countryCode: 'PK',
    countryName: 'Pakistan',
    dialCode: '+92',
    localAreaCode: '061',
    latitude: 30.1575,
    longitude: 71.5249,
    defaultRadiusKm: 15,
  },
  {
    id: 'pk-lahore',
    name: 'Lahore',
    region: 'Punjab, Pakistan',
    countryCode: 'PK',
    countryName: 'Pakistan',
    dialCode: '+92',
    localAreaCode: '042',
    latitude: 31.5204,
    longitude: 74.3587,
    defaultRadiusKm: 18,
  },
  {
    id: 'pk-karachi',
    name: 'Karachi',
    region: 'Sindh, Pakistan',
    countryCode: 'PK',
    countryName: 'Pakistan',
    dialCode: '+92',
    localAreaCode: '021',
    latitude: 24.8607,
    longitude: 67.0011,
    defaultRadiusKm: 20,
  },
  {
    id: 'pk-islamabad',
    name: 'Islamabad',
    region: 'ICT, Pakistan',
    countryCode: 'PK',
    countryName: 'Pakistan',
    dialCode: '+92',
    localAreaCode: '051',
    latitude: 33.6844,
    longitude: 73.0479,
    defaultRadiusKm: 15,
  },
  {
    id: 'pk-rawalpindi',
    name: 'Rawalpindi',
    region: 'Punjab, Pakistan',
    countryCode: 'PK',
    countryName: 'Pakistan',
    dialCode: '+92',
    localAreaCode: '051',
    latitude: 33.5651,
    longitude: 73.0169,
    defaultRadiusKm: 15,
  },
  {
    id: 'pk-faisalabad',
    name: 'Faisalabad',
    region: 'Punjab, Pakistan',
    countryCode: 'PK',
    countryName: 'Pakistan',
    dialCode: '+92',
    localAreaCode: '041',
    latitude: 31.4504,
    longitude: 73.135,
    defaultRadiusKm: 15,
  },
  {
    id: 'pk-peshawar',
    name: 'Peshawar',
    region: 'KPK, Pakistan',
    countryCode: 'PK',
    countryName: 'Pakistan',
    dialCode: '+92',
    localAreaCode: '091',
    latitude: 34.0151,
    longitude: 71.5805,
    defaultRadiusKm: 15,
  },
  {
    id: 'pk-sialkot',
    name: 'Sialkot',
    region: 'Punjab, Pakistan',
    countryCode: 'PK',
    countryName: 'Pakistan',
    dialCode: '+92',
    localAreaCode: '052',
    latitude: 32.4945,
    longitude: 74.5229,
    defaultRadiusKm: 12,
  },
  {
    id: 'pk-gujranwala',
    name: 'Gujranwala',
    region: 'Punjab, Pakistan',
    countryCode: 'PK',
    countryName: 'Pakistan',
    dialCode: '+92',
    localAreaCode: '055',
    latitude: 32.1877,
    longitude: 74.1945,
    defaultRadiusKm: 12,
  },
  {
    id: 'pk-bahawalpur',
    name: 'Bahawalpur',
    region: 'Punjab, Pakistan',
    countryCode: 'PK',
    countryName: 'Pakistan',
    dialCode: '+92',
    localAreaCode: '062',
    latitude: 29.3956,
    longitude: 71.6836,
    defaultRadiusKm: 12,
  },
  {
    id: 'pk-sargodha',
    name: 'Sargodha',
    region: 'Punjab, Pakistan',
    countryCode: 'PK',
    countryName: 'Pakistan',
    dialCode: '+92',
    localAreaCode: '048',
    latitude: 32.0836,
    longitude: 72.6711,
    defaultRadiusKm: 12,
  },
  {
    id: 'pk-quetta',
    name: 'Quetta',
    region: 'Balochistan, Pakistan',
    countryCode: 'PK',
    countryName: 'Pakistan',
    dialCode: '+92',
    localAreaCode: '081',
    latitude: 30.1798,
    longitude: 66.975,
    defaultRadiusKm: 12,
  },
  {
    id: 'pk-hyderabad',
    name: 'Hyderabad',
    region: 'Sindh, Pakistan',
    countryCode: 'PK',
    countryName: 'Pakistan',
    dialCode: '+92',
    localAreaCode: '022',
    latitude: 25.396,
    longitude: 68.3578,
    defaultRadiusKm: 12,
  },
  {
    id: 'pk-abbottabad',
    name: 'Abbottabad',
    region: 'KPK, Pakistan',
    countryCode: 'PK',
    countryName: 'Pakistan',
    dialCode: '+92',
    localAreaCode: '0992',
    latitude: 34.1688,
    longitude: 73.2215,
    defaultRadiusKm: 10,
  },

  // UAE, Saudi Arabia & GCC (10 Cities)
  {
    id: 'ae-dubai',
    name: 'Dubai',
    region: 'United Arab Emirates',
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    dialCode: '+971',
    localAreaCode: '04',
    latitude: 25.2048,
    longitude: 55.2708,
    defaultRadiusKm: 18,
  },
  {
    id: 'ae-abudhabi',
    name: 'Abu Dhabi',
    region: 'United Arab Emirates',
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    dialCode: '+971',
    localAreaCode: '02',
    latitude: 24.4539,
    longitude: 54.3773,
    defaultRadiusKm: 18,
  },
  {
    id: 'ae-sharjah',
    name: 'Sharjah',
    region: 'United Arab Emirates',
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    dialCode: '+971',
    localAreaCode: '06',
    latitude: 25.3463,
    longitude: 55.4209,
    defaultRadiusKm: 14,
  },
  {
    id: 'sa-riyadh',
    name: 'Riyadh',
    region: 'Saudi Arabia',
    countryCode: 'SA',
    countryName: 'Saudi Arabia',
    dialCode: '+966',
    localAreaCode: '011',
    latitude: 24.7136,
    longitude: 46.6753,
    defaultRadiusKm: 20,
  },
  {
    id: 'sa-jeddah',
    name: 'Jeddah',
    region: 'Makkah Region, Saudi Arabia',
    countryCode: 'SA',
    countryName: 'Saudi Arabia',
    dialCode: '+966',
    localAreaCode: '012',
    latitude: 21.4858,
    longitude: 39.1925,
    defaultRadiusKm: 18,
  },
  {
    id: 'sa-dammam',
    name: 'Dammam & Khobar',
    region: 'Eastern Province, Saudi Arabia',
    countryCode: 'SA',
    countryName: 'Saudi Arabia',
    dialCode: '+966',
    localAreaCode: '013',
    latitude: 26.4207,
    longitude: 50.0888,
    defaultRadiusKm: 16,
  },
  {
    id: 'sa-madinah',
    name: 'Madinah',
    region: 'Al Madinah Region, Saudi Arabia',
    countryCode: 'SA',
    countryName: 'Saudi Arabia',
    dialCode: '+966',
    localAreaCode: '014',
    latitude: 24.5247,
    longitude: 39.5692,
    defaultRadiusKm: 15,
  },
  {
    id: 'qa-doha',
    name: 'Doha',
    region: 'Qatar',
    countryCode: 'QA',
    countryName: 'Qatar',
    dialCode: '+974',
    latitude: 25.2854,
    longitude: 51.531,
    defaultRadiusKm: 15,
  },
  {
    id: 'om-muscat',
    name: 'Muscat',
    region: 'Oman',
    countryCode: 'OM',
    countryName: 'Oman',
    dialCode: '+968',
    latitude: 23.588,
    longitude: 58.3829,
    defaultRadiusKm: 15,
  },
  {
    id: 'kw-kuwait',
    name: 'Kuwait City',
    region: 'Kuwait',
    countryCode: 'KW',
    countryName: 'Kuwait',
    dialCode: '+965',
    latitude: 29.3759,
    longitude: 47.9774,
    defaultRadiusKm: 14,
  },

  // UK & Europe (6 Cities)
  {
    id: 'gb-london',
    name: 'London',
    region: 'United Kingdom',
    countryCode: 'GB',
    countryName: 'United Kingdom',
    dialCode: '+44',
    localAreaCode: '020',
    latitude: 51.5074,
    longitude: -0.1278,
    defaultRadiusKm: 12,
  },
  {
    id: 'gb-manchester',
    name: 'Manchester',
    region: 'United Kingdom',
    countryCode: 'GB',
    countryName: 'United Kingdom',
    dialCode: '+44',
    localAreaCode: '0161',
    latitude: 53.4808,
    longitude: -2.2426,
    defaultRadiusKm: 12,
  },
  {
    id: 'gb-birmingham',
    name: 'Birmingham',
    region: 'United Kingdom',
    countryCode: 'GB',
    countryName: 'United Kingdom',
    dialCode: '+44',
    localAreaCode: '0121',
    latitude: 52.4862,
    longitude: -1.8904,
    defaultRadiusKm: 12,
  },
  {
    id: 'de-berlin',
    name: 'Berlin',
    region: 'Germany',
    countryCode: 'DE',
    countryName: 'Germany',
    dialCode: '+49',
    localAreaCode: '030',
    latitude: 52.52,
    longitude: 13.405,
    defaultRadiusKm: 12,
  },
  {
    id: 'nl-amsterdam',
    name: 'Amsterdam',
    region: 'Netherlands',
    countryCode: 'NL',
    countryName: 'Netherlands',
    dialCode: '+31',
    localAreaCode: '020',
    latitude: 52.3676,
    longitude: 4.9041,
    defaultRadiusKm: 10,
  },
  {
    id: 'tr-istanbul',
    name: 'Istanbul',
    region: 'Turkey',
    countryCode: 'TR',
    countryName: 'Turkey',
    dialCode: '+90',
    localAreaCode: '0212',
    latitude: 41.0082,
    longitude: 28.9784,
    defaultRadiusKm: 15,
  },

  // North America & Asia-Pacific (6 Cities -> Total = 14 + 10 + 6 + 6 = 36 Cities)
  {
    id: 'us-newyork',
    name: 'New York City',
    region: 'NY, United States',
    countryCode: 'US',
    countryName: 'United States',
    dialCode: '+1',
    latitude: 40.7128,
    longitude: -74.006,
    defaultRadiusKm: 12,
  },
  {
    id: 'us-houston',
    name: 'Houston',
    region: 'TX, United States',
    countryCode: 'US',
    countryName: 'United States',
    dialCode: '+1',
    latitude: 29.7604,
    longitude: -95.3698,
    defaultRadiusKm: 15,
  },
  {
    id: 'ca-toronto',
    name: 'Toronto',
    region: 'ON, Canada',
    countryCode: 'CA',
    countryName: 'Canada',
    dialCode: '+1',
    latitude: 43.6532,
    longitude: -79.3832,
    defaultRadiusKm: 14,
  },
  {
    id: 'au-sydney',
    name: 'Sydney',
    region: 'NSW, Australia',
    countryCode: 'AU',
    countryName: 'Australia',
    dialCode: '+61',
    localAreaCode: '02',
    latitude: -33.8688,
    longitude: 151.2093,
    defaultRadiusKm: 14,
  },
  {
    id: 'sg-singapore',
    name: 'Singapore',
    region: 'Singapore',
    countryCode: 'SG',
    countryName: 'Singapore',
    dialCode: '+65',
    latitude: 1.3521,
    longitude: 103.8198,
    defaultRadiusKm: 12,
  },
  {
    id: 'my-kualalumpur',
    name: 'Kuala Lumpur',
    region: 'Malaysia',
    countryCode: 'MY',
    countryName: 'Malaysia',
    dialCode: '+60',
    localAreaCode: '03',
    latitude: 3.139,
    longitude: 101.6869,
    defaultRadiusKm: 14,
  },
  // Additional Global Hubs Across Americas, Europe, APAC, MENA & Africa (24 Cities -> 60 Total)
  {
    id: 'us-losangeles',
    name: 'Los Angeles',
    region: 'CA, United States',
    countryCode: 'US',
    countryName: 'United States',
    dialCode: '+1',
    latitude: 34.0522,
    longitude: -118.2437,
    defaultRadiusKm: 16,
  },
  {
    id: 'us-chicago',
    name: 'Chicago',
    region: 'IL, United States',
    countryCode: 'US',
    countryName: 'United States',
    dialCode: '+1',
    latitude: 41.8781,
    longitude: -87.6298,
    defaultRadiusKm: 15,
  },
  {
    id: 'us-miami',
    name: 'Miami',
    region: 'FL, United States',
    countryCode: 'US',
    countryName: 'United States',
    dialCode: '+1',
    latitude: 25.7617,
    longitude: -80.1918,
    defaultRadiusKm: 14,
  },
  {
    id: 'ca-vancouver',
    name: 'Vancouver',
    region: 'BC, Canada',
    countryCode: 'CA',
    countryName: 'Canada',
    dialCode: '+1',
    latitude: 49.2827,
    longitude: -123.1207,
    defaultRadiusKm: 14,
  },
  {
    id: 'mx-mexicocity',
    name: 'Mexico City',
    region: 'CDMX, Mexico',
    countryCode: 'MX',
    countryName: 'Mexico',
    dialCode: '+52',
    localAreaCode: '55',
    latitude: 19.4326,
    longitude: -99.1332,
    defaultRadiusKm: 16,
  },
  {
    id: 'fr-paris',
    name: 'Paris',
    region: 'Île-de-France, France',
    countryCode: 'FR',
    countryName: 'France',
    dialCode: '+33',
    localAreaCode: '01',
    latitude: 48.8566,
    longitude: 2.3522,
    defaultRadiusKm: 12,
  },
  {
    id: 'es-madrid',
    name: 'Madrid',
    region: 'Spain',
    countryCode: 'ES',
    countryName: 'Spain',
    dialCode: '+34',
    localAreaCode: '91',
    latitude: 40.4168,
    longitude: -3.7038,
    defaultRadiusKm: 14,
  },
  {
    id: 'it-milan',
    name: 'Milan',
    region: 'Lombardy, Italy',
    countryCode: 'IT',
    countryName: 'Italy',
    dialCode: '+39',
    localAreaCode: '02',
    latitude: 45.4642,
    longitude: 9.19,
    defaultRadiusKm: 12,
  },
  {
    id: 'ch-zurich',
    name: 'Zurich',
    region: 'Switzerland',
    countryCode: 'CH',
    countryName: 'Switzerland',
    dialCode: '+41',
    localAreaCode: '044',
    latitude: 47.3769,
    longitude: 8.5417,
    defaultRadiusKm: 10,
  },
  {
    id: 'se-stockholm',
    name: 'Stockholm',
    region: 'Sweden',
    countryCode: 'SE',
    countryName: 'Sweden',
    dialCode: '+46',
    localAreaCode: '08',
    latitude: 59.3293,
    longitude: 18.0686,
    defaultRadiusKm: 12,
  },
  {
    id: 'pl-warsaw',
    name: 'Warsaw',
    region: 'Poland',
    countryCode: 'PL',
    countryName: 'Poland',
    dialCode: '+48',
    localAreaCode: '22',
    latitude: 52.2297,
    longitude: 21.0122,
    defaultRadiusKm: 14,
  },
  {
    id: 'ie-dublin',
    name: 'Dublin',
    region: 'Ireland',
    countryCode: 'IE',
    countryName: 'Ireland',
    dialCode: '+353',
    localAreaCode: '01',
    latitude: 53.3498,
    longitude: -6.2603,
    defaultRadiusKm: 12,
  },
  {
    id: 'in-mumbai',
    name: 'Mumbai',
    region: 'Maharashtra, India',
    countryCode: 'IN',
    countryName: 'India',
    dialCode: '+91',
    localAreaCode: '022',
    latitude: 19.076,
    longitude: 72.8777,
    defaultRadiusKm: 18,
  },
  {
    id: 'in-delhi',
    name: 'New Delhi',
    region: 'Delhi NCR, India',
    countryCode: 'IN',
    countryName: 'India',
    dialCode: '+91',
    localAreaCode: '011',
    latitude: 28.6139,
    longitude: 77.209,
    defaultRadiusKm: 18,
  },
  {
    id: 'in-bengaluru',
    name: 'Bengaluru',
    region: 'Karnataka, India',
    countryCode: 'IN',
    countryName: 'India',
    dialCode: '+91',
    localAreaCode: '080',
    latitude: 12.9716,
    longitude: 77.5946,
    defaultRadiusKm: 16,
  },
  {
    id: 'bd-dhaka',
    name: 'Dhaka',
    region: 'Bangladesh',
    countryCode: 'BD',
    countryName: 'Bangladesh',
    dialCode: '+880',
    localAreaCode: '02',
    latitude: 23.8103,
    longitude: 90.4125,
    defaultRadiusKm: 15,
  },
  {
    id: 'jp-tokyo',
    name: 'Tokyo',
    region: 'Japan',
    countryCode: 'JP',
    countryName: 'Japan',
    dialCode: '+81',
    localAreaCode: '03',
    latitude: 35.6762,
    longitude: 139.6503,
    defaultRadiusKm: 15,
  },
  {
    id: 'kr-seoul',
    name: 'Seoul',
    region: 'South Korea',
    countryCode: 'KR',
    countryName: 'South Korea',
    dialCode: '+82',
    localAreaCode: '02',
    latitude: 37.5665,
    longitude: 126.978,
    defaultRadiusKm: 15,
  },
  {
    id: 'id-jakarta',
    name: 'Jakarta',
    region: 'Indonesia',
    countryCode: 'ID',
    countryName: 'Indonesia',
    dialCode: '+62',
    localAreaCode: '021',
    latitude: -6.2088,
    longitude: 106.8456,
    defaultRadiusKm: 16,
  },
  {
    id: 'br-saopaulo',
    name: 'São Paulo',
    region: 'SP, Brazil',
    countryCode: 'BR',
    countryName: 'Brazil',
    dialCode: '+55',
    localAreaCode: '11',
    latitude: -23.5505,
    longitude: -46.6333,
    defaultRadiusKm: 18,
  },
  {
    id: 'eg-cairo',
    name: 'Cairo',
    region: 'Egypt',
    countryCode: 'EG',
    countryName: 'Egypt',
    dialCode: '+20',
    localAreaCode: '02',
    latitude: 30.0444,
    longitude: 31.2357,
    defaultRadiusKm: 16,
  },
  {
    id: 'za-johannesburg',
    name: 'Johannesburg',
    region: 'Gauteng, South Africa',
    countryCode: 'ZA',
    countryName: 'South Africa',
    dialCode: '+27',
    localAreaCode: '011',
    latitude: -26.2041,
    longitude: 28.0473,
    defaultRadiusKm: 16,
  },
  {
    id: 'ng-lagos',
    name: 'Lagos',
    region: 'Nigeria',
    countryCode: 'NG',
    countryName: 'Nigeria',
    dialCode: '+234',
    localAreaCode: '01',
    latitude: 6.5244,
    longitude: 3.3792,
    defaultRadiusKm: 16,
  },
  {
    id: 'ke-nairobi',
    name: 'Nairobi',
    region: 'Kenya',
    countryCode: 'KE',
    countryName: 'Kenya',
    dialCode: '+254',
    localAreaCode: '020',
    latitude: -1.2921,
    longitude: 36.8219,
    defaultRadiusKm: 15,
  },
];

// ============================================================================
// 3. FREE WEBMAIL VS CORPORATE DOMAIN, ROLE ACCOUNTS & VALID TLD REGISTRIES
// ============================================================================

const FREE_WEBMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'ymail.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'zoho.com',
  'gmx.com',
  'mail.com',
  'yandex.com',
]);

const ROLE_EMAIL_PREFIXES = new Set([
  'info',
  'contact',
  'support',
  'help',
  'helpdesk',
  'sales',
  'admin',
  'office',
  'booking',
  'bookings',
  'appointments',
  'care',
  'clinic',
  'dental',
  'reception',
  'hr',
  'careers',
  'billing',
  'inquiries',
  'hello',
  'team',
  'operations',
  'partnerships',
  'b2b',
  'chambers',
  'tax',
  'service',
  'listings',
]);

const DISALLOWED_ASSET_TLDS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'svg',
  'webp',
  'avif',
  'css',
  'js',
  'mjs',
  'cjs',
  'ts',
  'tsx',
  'jsx',
  'map',
  'woff',
  'woff2',
  'ttf',
  'eot',
  'ico',
  'pdf',
  'zip',
  'rar',
  'mp4',
  'mp3',
  'wav',
  'json',
  'xml',
  'html',
  'htm',
]);

// ============================================================================
// 4. EMAIL DE-OBFUSCATION & EXTRACTION ENGINE (ZERO PROSE FALSE POSITIVES)
// ============================================================================

export function decodeCloudflareEmailHex(hexString: string): string {
  const clean = hexString.trim();
  if (!/^[0-9a-fA-F]{6,128}$/.test(clean) || clean.length % 2 !== 0) {
    return '';
  }
  const key = parseInt(clean.slice(0, 2), 16);
  let decoded = '';
  for (let i = 2; i < clean.length; i += 2) {
    const byte = parseInt(clean.slice(i, i + 2), 16) ^ key;
    if (byte < 32 || byte > 126) return '';
    decoded += String.fromCharCode(byte);
  }
  return decoded.includes('@') ? decoded : '';
}

export function deobfuscateEmailText(input: string): {
  normalizedText: string;
  obfuscatedEmailsSet: Set<string>;
} {
  let text = input;
  const obfuscatedEmailsSet = new Set<string>();

  // 1. Decode Cloudflare data-cfemail="<hex>" or /cdn-cgi/l/email-protection#<hex>
  text = text.replace(
    /(?:data-cfemail=["']([0-9a-fA-F]{6,128})["']|email-protection#([0-9a-fA-F]{6,128}))/gi,
    (_m, hex1?: string, hex2?: string) => {
      const hex = hex1 || hex2 || '';
      const email = decodeCloudflareEmailHex(hex).toLowerCase().trim();
      if (email.includes('@')) {
        obfuscatedEmailsSet.add(email);
        return ` ${email} `;
      }
      return _m;
    }
  );

  // 2. Decode HTML entities and URL encodings around email local@domain tokens
  text = text.replace(/&#46;|&#x2e;|&period;|%2e/gi, '.');
  text = text.replace(
    /([a-zA-Z0-9._%+-]{1,64})(?:&#64;|&#x40;|&commat;|%40)([a-zA-Z0-9.-]+\.[a-zA-Z]{2,12})/gi,
    (_m, local: string, dom: string) => {
      const full = `${local}@${dom}`.toLowerCase();
      obfuscatedEmailsSet.add(full);
      return full;
    }
  );

  // 3. Explicit bracketed/parenthesized/curly obfuscation: [at], (at), {at} with [dot], (dot), {dot}, or .
  const bracketedPattern =
    /\b([a-zA-Z0-9._%+-]{1,64})\s*(?:\[\s*at\s*\]|\(\s*at\s*\)|\{\s*at\s*\})\s*([a-zA-Z0-9-]+(?:\s*(?:\[\s*dot\s*\]|\(\s*dot\s*\)|\{\s*dot\s*\}|\.)\s*[a-zA-Z0-9-]+)+)\b/gi;
  text = text.replace(bracketedPattern, (_full, local: string, domainChain: string) => {
    const cleanDomain = domainChain
      .replace(/\s*(?:\[\s*dot\s*\]|\(\s*dot\s*\)|\{\s*dot\s*\}|\.)\s*/gi, '.')
      .toLowerCase();
    const reconstructed = `${local.toLowerCase()}@${cleanDomain}`;
    obfuscatedEmailsSet.add(reconstructed);
    return reconstructed;
  });

  // 4. Spaced literal '@' and '.' (e.g. "info @ clinic . pk" or "sales @ domain [dot] com")
  const spacedAtSymbolPattern =
    /\b([a-zA-Z0-9._%+-]{1,64})\s*@\s*([a-zA-Z0-9-]+)\s*(?:\[\s*dot\s*\]|\(\s*dot\s*\)|\{\s*dot\s*\}|\s+\.\s*|\.\s+)\s*([a-zA-Z]{2,10}(?:\.[a-zA-Z]{2,6})?)\b/gi;
  text = text.replace(
    spacedAtSymbolPattern,
    (_full, local: string, dom: string, tld: string) => {
      const reconstructed = `${local.toLowerCase()}@${dom.toLowerCase()}.${tld.replace(/\s+/g, '').toLowerCase()}`;
      obfuscatedEmailsSet.add(reconstructed);
      return reconstructed;
    }
  );

  // 5. Explicit word-form "local AT domain DOT tld" (requires BOTH "at" and "dot" words and known TLD)
  const wordAtDotPattern =
    /\b([a-zA-Z0-9._%+-]{1,64})\s+at\s+([a-zA-Z0-9-]+)\s+dot\s+(com|org|net|edu|gov|pk|ae|sa|uk|co|io|ai|dev|me|info|biz|us|ca|au|de|nl|tr|sg|my|qa|om|kw|com\.pk|org\.pk|edu\.pk|co\.uk|ac\.uk|com\.au|co\.ae)\b/gi;
  text = text.replace(
    wordAtDotPattern,
    (_full, local: string, dom: string, tld: string) => {
      const reconstructed = `${local.toLowerCase()}@${dom.toLowerCase()}.${tld.toLowerCase()}`;
      obfuscatedEmailsSet.add(reconstructed);
      return reconstructed;
    }
  );

  return { normalizedText: text, obfuscatedEmailsSet };
}

export function extractEmailsFromText(rawInput: string): NormalizedEmailItem[] {
  if (!rawInput) return [];
  const { normalizedText, obfuscatedEmailsSet } = deobfuscateEmailText(rawInput);

  const emailRegex =
    /\b([a-zA-Z0-9][a-zA-Z0-9._%+-]{0,63})@([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+)\b/g;
  const seen = new Map<string, NormalizedEmailItem>();

  let match: RegExpExecArray | null;
  while ((match = emailRegex.exec(normalizedText)) !== null) {
    const full = match[0].toLowerCase().replace(/[.,;:)›\]}"']+$/, '');
    const parts = full.split('@');
    if (parts.length !== 2) continue;
    const [localPart, domain] = parts;
    if (!localPart || !domain || domain.startsWith('.') || domain.endsWith('.')) continue;

    const domainLabels = domain.split('.');
    const tld = domainLabels[domainLabels.length - 1] || '';

    // Filter out image/asset filenames like logo@2x.png or bundle@1.0.js
    if (DISALLOWED_ASSET_TLDS.has(tld.toLowerCase())) {
      continue;
    }
    if (tld.length < 2 || tld.length > 12 || /^\d+$/.test(tld)) continue;

    if (!seen.has(full)) {
      const wasObfuscated =
        obfuscatedEmailsSet.has(full) || !rawInput.toLowerCase().includes(full);
      const rolePrefix = localPart.split(/[._+-]/)[0] || localPart;
      seen.set(full, {
        raw: match[0],
        email: full,
        localPart,
        domain,
        isCorporateDomain: !FREE_WEBMAIL_DOMAINS.has(domain),
        isRoleAccount: ROLE_EMAIL_PREFIXES.has(rolePrefix),
        wasObfuscated,
        mxVerified: null,
      });
    }
  }

  return Array.from(seen.values());
}

// ============================================================================
// 5. INTERNATIONAL & REGIONAL TELECOM NORMALIZER (PK, AE, SA, GCC, GB, EU, US, APAC)
// ============================================================================

export const COUNTRY_DIAL_META: Record<
  SupportedCountryCode,
  { name: string; dial: string; minNational: number; maxNational: number; mobilePrefixes: RegExp }
> = {
  // North America
  US: { name: 'United States', dial: '1', minNational: 10, maxNational: 10, mobilePrefixes: /^[2-9]\d{2}[2-9]\d{6}$/ },
  CA: { name: 'Canada', dial: '1', minNational: 10, maxNational: 10, mobilePrefixes: /^[2-9]\d{2}[2-9]\d{6}$/ },
  MX: { name: 'Mexico', dial: '52', minNational: 10, maxNational: 10, mobilePrefixes: /^[1-9]\d{9}$/ },
  // UK & Europe (22 Countries)
  GB: { name: 'United Kingdom', dial: '44', minNational: 9, maxNational: 10, mobilePrefixes: /^7\d{9}$/ },
  DE: { name: 'Germany', dial: '49', minNational: 9, maxNational: 11, mobilePrefixes: /^1[567]\d{7,9}$/ },
  FR: { name: 'France', dial: '33', minNational: 9, maxNational: 9, mobilePrefixes: /^[67]\d{8}$/ },
  IT: { name: 'Italy', dial: '39', minNational: 9, maxNational: 10, mobilePrefixes: /^3\d{8,9}$/ },
  ES: { name: 'Spain', dial: '34', minNational: 9, maxNational: 9, mobilePrefixes: /^[67]\d{8}$/ },
  NL: { name: 'Netherlands', dial: '31', minNational: 9, maxNational: 9, mobilePrefixes: /^6\d{8}$/ },
  CH: { name: 'Switzerland', dial: '41', minNational: 9, maxNational: 9, mobilePrefixes: /^7[5-9]\d{7}$/ },
  SE: { name: 'Sweden', dial: '46', minNational: 8, maxNational: 9, mobilePrefixes: /^7[02369]\d{7}$/ },
  NO: { name: 'Norway', dial: '47', minNational: 8, maxNational: 8, mobilePrefixes: /^[49]\d{7}$/ },
  DK: { name: 'Denmark', dial: '45', minNational: 8, maxNational: 8, mobilePrefixes: /^[2-9]\d{7}$/ },
  FI: { name: 'Finland', dial: '358', minNational: 8, maxNational: 10, mobilePrefixes: /^4\d{7,9}|^50\d{6,8}$/ },
  PL: { name: 'Poland', dial: '48', minNational: 9, maxNational: 9, mobilePrefixes: /^[45678]\d{8}$/ },
  AT: { name: 'Austria', dial: '43', minNational: 9, maxNational: 11, mobilePrefixes: /^6[5-9]\d{7,9}$/ },
  BE: { name: 'Belgium', dial: '32', minNational: 8, maxNational: 9, mobilePrefixes: /^4[5-9]\d{7}$/ },
  IE: { name: 'Ireland', dial: '353', minNational: 8, maxNational: 9, mobilePrefixes: /^8[35679]\d{7}$/ },
  PT: { name: 'Portugal', dial: '351', minNational: 9, maxNational: 9, mobilePrefixes: /^9[1236]\d{7}$/ },
  GR: { name: 'Greece', dial: '30', minNational: 10, maxNational: 10, mobilePrefixes: /^69\d{8}$/ },
  CZ: { name: 'Czechia', dial: '420', minNational: 9, maxNational: 9, mobilePrefixes: /^[67]\d{8}$/ },
  RO: { name: 'Romania', dial: '40', minNational: 9, maxNational: 9, mobilePrefixes: /^7\d{8}$/ },
  HU: { name: 'Hungary', dial: '36', minNational: 8, maxNational: 9, mobilePrefixes: /^(?:20|30|31|50|70)\d{7}$/ },
  UA: { name: 'Ukraine', dial: '380', minNational: 9, maxNational: 9, mobilePrefixes: /^(?:50|63|66|67|68|73|9[1-9])\d{7}$/ },
  TR: { name: 'Turkey', dial: '90', minNational: 10, maxNational: 10, mobilePrefixes: /^5\d{9}$/ },
  // Middle East & North Africa (13 Countries)
  AE: { name: 'United Arab Emirates', dial: '971', minNational: 8, maxNational: 9, mobilePrefixes: /^5\d{8}$/ },
  SA: { name: 'Saudi Arabia', dial: '966', minNational: 8, maxNational: 9, mobilePrefixes: /^5\d{8}$/ },
  QA: { name: 'Qatar', dial: '974', minNational: 8, maxNational: 8, mobilePrefixes: /^[3567]\d{7}$/ },
  KW: { name: 'Kuwait', dial: '965', minNational: 8, maxNational: 8, mobilePrefixes: /^[569]\d{7}$/ },
  OM: { name: 'Oman', dial: '968', minNational: 8, maxNational: 8, mobilePrefixes: /^[79]\d{7}$/ },
  BH: { name: 'Bahrain', dial: '973', minNational: 8, maxNational: 8, mobilePrefixes: /^3\d{7}$/ },
  JO: { name: 'Jordan', dial: '962', minNational: 8, maxNational: 9, mobilePrefixes: /^7[789]\d{7}$/ },
  EG: { name: 'Egypt', dial: '20', minNational: 9, maxNational: 10, mobilePrefixes: /^1[0125]\d{8}$/ },
  MA: { name: 'Morocco', dial: '212', minNational: 9, maxNational: 9, mobilePrefixes: /^[67]\d{8}$/ },
  TN: { name: 'Tunisia', dial: '216', minNational: 8, maxNational: 8, mobilePrefixes: /^[2459]\d{7}$/ },
  DZ: { name: 'Algeria', dial: '213', minNational: 8, maxNational: 9, mobilePrefixes: /^[567]\d{8}$/ },
  IQ: { name: 'Iraq', dial: '964', minNational: 9, maxNational: 10, mobilePrefixes: /^7[5789]\d{8}$/ },
  LB: { name: 'Lebanon', dial: '961', minNational: 7, maxNational: 8, mobilePrefixes: /^(?:3|7[01689]|81)\d{6}$/ },
  // South & Central Asia (7 Countries)
  PK: { name: 'Pakistan', dial: '92', minNational: 9, maxNational: 11, mobilePrefixes: /^3\d{9}$/ },
  IN: { name: 'India', dial: '91', minNational: 10, maxNational: 10, mobilePrefixes: /^[6-9]\d{9}$/ },
  BD: { name: 'Bangladesh', dial: '880', minNational: 9, maxNational: 10, mobilePrefixes: /^1[3-9]\d{8}$/ },
  LK: { name: 'Sri Lanka', dial: '94', minNational: 9, maxNational: 9, mobilePrefixes: /^7\d{8}$/ },
  NP: { name: 'Nepal', dial: '977', minNational: 8, maxNational: 10, mobilePrefixes: /^9[78]\d{8}$/ },
  UZ: { name: 'Uzbekistan', dial: '998', minNational: 9, maxNational: 9, mobilePrefixes: /^9\d{8}$/ },
  KZ: { name: 'Kazakhstan', dial: '7', minNational: 10, maxNational: 10, mobilePrefixes: /^7\d{9}$/ },
  // East Asia, SE Asia & Oceania (13 Countries)
  AU: { name: 'Australia', dial: '61', minNational: 9, maxNational: 9, mobilePrefixes: /^4\d{8}$/ },
  NZ: { name: 'New Zealand', dial: '64', minNational: 8, maxNational: 10, mobilePrefixes: /^2\d{7,9}$/ },
  SG: { name: 'Singapore', dial: '65', minNational: 8, maxNational: 8, mobilePrefixes: /^[89]\d{7}$/ },
  MY: { name: 'Malaysia', dial: '60', minNational: 9, maxNational: 10, mobilePrefixes: /^1\d{8,9}$/ },
  ID: { name: 'Indonesia', dial: '62', minNational: 9, maxNational: 12, mobilePrefixes: /^8\d{8,11}$/ },
  PH: { name: 'Philippines', dial: '63', minNational: 9, maxNational: 10, mobilePrefixes: /^9\d{9}$/ },
  TH: { name: 'Thailand', dial: '66', minNational: 8, maxNational: 9, mobilePrefixes: /^[689]\d{8}$/ },
  VN: { name: 'Vietnam', dial: '84', minNational: 9, maxNational: 10, mobilePrefixes: /^[35789]\d{8}$/ },
  JP: { name: 'Japan', dial: '81', minNational: 9, maxNational: 10, mobilePrefixes: /^[789]0\d{8}$/ },
  KR: { name: 'South Korea', dial: '82', minNational: 9, maxNational: 10, mobilePrefixes: /^10\d{8}$/ },
  CN: { name: 'China', dial: '86', minNational: 10, maxNational: 11, mobilePrefixes: /^1[3-9]\d{9}$/ },
  HK: { name: 'Hong Kong', dial: '852', minNational: 8, maxNational: 8, mobilePrefixes: /^[569]\d{7}$/ },
  TW: { name: 'Taiwan', dial: '886', minNational: 8, maxNational: 9, mobilePrefixes: /^9\d{8}$/ },
  // Latin America & Africa (11 Countries)
  BR: { name: 'Brazil', dial: '55', minNational: 10, maxNational: 11, mobilePrefixes: /^[1-9]{2}9\d{8}$/ },
  AR: { name: 'Argentina', dial: '54', minNational: 10, maxNational: 11, mobilePrefixes: /^9?\d{10}$/ },
  CO: { name: 'Colombia', dial: '57', minNational: 10, maxNational: 10, mobilePrefixes: /^3\d{9}$/ },
  CL: { name: 'Chile', dial: '56', minNational: 9, maxNational: 9, mobilePrefixes: /^9\d{8}$/ },
  PE: { name: 'Peru', dial: '51', minNational: 8, maxNational: 9, mobilePrefixes: /^9\d{8}$/ },
  ZA: { name: 'South Africa', dial: '27', minNational: 9, maxNational: 9, mobilePrefixes: /^[678]\d{8}$/ },
  NG: { name: 'Nigeria', dial: '234', minNational: 9, maxNational: 10, mobilePrefixes: /^[789][01]\d{8}$/ },
  KE: { name: 'Kenya', dial: '254', minNational: 9, maxNational: 9, mobilePrefixes: /^[17]\d{8}$/ },
  GH: { name: 'Ghana', dial: '233', minNational: 9, maxNational: 9, mobilePrefixes: /^[25]\d{8}$/ },
  ET: { name: 'Ethiopia', dial: '251', minNational: 9, maxNational: 9, mobilePrefixes: /^[79]\d{8}$/ },
  TZ: { name: 'Tanzania', dial: '255', minNational: 9, maxNational: 9, mobilePrefixes: /^[67]\d{8}$/ },
};

export function normalizePhoneNumber(
  rawCandidate: string,
  defaultCountry: SupportedCountryCode = 'PK'
): NormalizedPhoneItem | null {
  const cleaned = rawCandidate
    .replace(/^(tel:|phone:|call:|whatsapp:|mob:|mobile:|ph:|uan:)/i, '')
    .replace(/\s*(?:ext\.?|extension|x|#)\s*\d{1,6}\s*$/i, '')
    .replace(/\(\s*0\s*\)/g, '')
    .trim();

  // Reject ISO dates (2026-11-17), date ranges, or decimal GPS coordinates (30.1575)
  if (/^\d{4}-\d{2}-\d{2}\b/.test(cleaned)) return null;
  if (/^\d{1,3}\.\d{3,8}$/.test(cleaned)) return null;

  const hasPlus = cleaned.startsWith('+') || cleaned.startsWith('00');
  const digitsOnly = cleaned.replace(/\D/g, '');
  if (digitsOnly.length < 8 || digitsOnly.length > 15) return null;

  const normalizedDigits = cleaned.startsWith('00')
    ? digitsOnly.slice(2)
    : digitsOnly;

  // Special Case A: Pakistan Toll-Free (0800-xxxxx) or Universal Access Number (061-111-xxx-xxx)
  if (
    !hasPlus &&
    defaultCountry === 'PK' &&
    /^0800\d{5,6}$/.test(normalizedDigits)
  ) {
    const national = normalizedDigits.slice(1);
    return {
      raw: rawCandidate.trim(),
      e164: `+92${national}`,
      localDisplay: `0800-${normalizedDigits.slice(4)}`,
      countryCode: 'PK',
      lineType: 'tollfree_or_uan',
      whatsappUrl: `https://wa.me/92${national}`,
    };
  }

  if (
    (defaultCountry === 'PK' || normalizedDigits.startsWith('92')) &&
    /^(?:92|0)(21|42|51|41|61|91|81|52|55|62|48|22)111\d{6}$/.test(normalizedDigits)
  ) {
    const national = (normalizedDigits.startsWith('92')
      ? normalizedDigits.slice(2)
      : normalizedDigits.slice(1)).replace(/^0+/, '');
    const area = national.slice(0, 2);
    const uanPart = national.slice(2);
    return {
      raw: rawCandidate.trim(),
      e164: `+92${national}`,
      localDisplay: `0${area}-111-${uanPart.slice(3, 6)}-${uanPart.slice(6)}`,
      countryCode: 'PK',
      lineType: 'tollfree_or_uan',
      whatsappUrl: `https://wa.me/92${national}`,
    };
  }

  // Case 1: Pakistan (+92 or 03xx mobile or 061/042/021/051/041/0992 landline)
  if (
    (hasPlus &&
      normalizedDigits.startsWith('92') &&
      normalizedDigits.length >= 11 &&
      normalizedDigits.length <= 13) ||
    (!hasPlus &&
      defaultCountry === 'PK' &&
      normalizedDigits.startsWith('0') &&
      normalizedDigits.length >= 10 &&
      normalizedDigits.length <= 12) ||
    (!hasPlus && /^03\d{9}$/.test(normalizedDigits))
  ) {
    const national = (normalizedDigits.startsWith('92')
      ? normalizedDigits.slice(2)
      : normalizedDigits.slice(1)).replace(/^0+/, '');
    if (national.length < 9 || national.length > 11) return null;
    const e164 = `+92${national}`;
    if (national.startsWith('3') && national.length === 10) {
      return {
        raw: rawCandidate.trim(),
        e164,
        localDisplay: `0${national.slice(0, 3)}-${national.slice(3)}`,
        countryCode: 'PK',
        lineType: 'mobile',
        whatsappUrl: `https://wa.me/92${national}`,
      };
    }
    const areaLen = /^(21|42|51|41|61|91|81|52|55|62|48|22)/.test(national) ? 2 : 3;
    return {
      raw: rawCandidate.trim(),
      e164,
      localDisplay: `0${national.slice(0, areaLen)}-${national.slice(areaLen)}`,
      countryCode: 'PK',
      lineType: 'landline',
      whatsappUrl: `https://wa.me/92${national}`,
    };
  }

  // Case 2: United Arab Emirates (+971 or 05x mobile / 04 Dubai / 02 Abu Dhabi / 06 Sharjah)
  if (
    (hasPlus &&
      normalizedDigits.startsWith('971') &&
      (normalizedDigits.length === 11 || normalizedDigits.length === 12)) ||
    (!hasPlus &&
      defaultCountry === 'AE' &&
      normalizedDigits.startsWith('0') &&
      (normalizedDigits.length === 9 || normalizedDigits.length === 10))
  ) {
    const national = (normalizedDigits.startsWith('971')
      ? normalizedDigits.slice(3)
      : normalizedDigits.slice(1)).replace(/^0+/, '');
    const e164 = `+971${national}`;
    const isMob = national.startsWith('5');
    const localDisplay = isMob
      ? `0${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5)}`
      : `0${national.slice(0, 1)} ${national.slice(1, 4)} ${national.slice(4)}`;
    return {
      raw: rawCandidate.trim(),
      e164,
      localDisplay,
      countryCode: 'AE',
      lineType: isMob ? 'mobile' : 'landline',
      whatsappUrl: `https://wa.me/971${national}`,
    };
  }

  // Case 3: Saudi Arabia (+966 or 05x mobile / 011 Riyadh / 012 Jeddah / 013 Dammam / 014 Madinah)
  if (
    (hasPlus &&
      normalizedDigits.startsWith('966') &&
      (normalizedDigits.length === 11 || normalizedDigits.length === 12)) ||
    (!hasPlus &&
      defaultCountry === 'SA' &&
      normalizedDigits.startsWith('0') &&
      (normalizedDigits.length === 9 || normalizedDigits.length === 10))
  ) {
    const national = (normalizedDigits.startsWith('966')
      ? normalizedDigits.slice(3)
      : normalizedDigits.slice(1)).replace(/^0+/, '');
    const e164 = `+966${national}`;
    const isMob = national.startsWith('5');
    return {
      raw: rawCandidate.trim(),
      e164,
      localDisplay: `0${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5)}`,
      countryCode: 'SA',
      lineType: isMob ? 'mobile' : 'landline',
      whatsappUrl: `https://wa.me/966${national}`,
    };
  }

  // Case 4: United Kingdom (+44 or 07xx mobile / 020 London / 0161 Manchester)
  if (
    (hasPlus &&
      normalizedDigits.startsWith('44') &&
      (normalizedDigits.length === 11 || normalizedDigits.length === 12)) ||
    (!hasPlus &&
      defaultCountry === 'GB' &&
      normalizedDigits.startsWith('0') &&
      (normalizedDigits.length === 10 || normalizedDigits.length === 11))
  ) {
    const national = (normalizedDigits.startsWith('44')
      ? normalizedDigits.slice(2)
      : normalizedDigits.slice(1)).replace(/^0+/, '');
    const e164 = `+44${national}`;
    const isMob = national.startsWith('7');
    return {
      raw: rawCandidate.trim(),
      e164,
      localDisplay: `0${national.slice(0, 4)} ${national.slice(4)}`,
      countryCode: 'GB',
      lineType: isMob ? 'mobile' : 'landline',
      whatsappUrl: `https://wa.me/44${national}`,
    };
  }

  // Case 5: US / Canada (+1 or 10-digit NANP)
  if (
    (hasPlus && normalizedDigits.startsWith('1') && normalizedDigits.length === 11) ||
    (!hasPlus &&
      (defaultCountry === 'US' || defaultCountry === 'CA') &&
      normalizedDigits.length === 10 &&
      /^[2-9]\d{2}[2-9]\d{6}$/.test(normalizedDigits))
  ) {
    const national =
      normalizedDigits.length === 11 ? normalizedDigits.slice(1) : normalizedDigits;
    const e164 = `+1${national}`;
    return {
      raw: rawCandidate.trim(),
      e164,
      localDisplay: `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`,
      countryCode: defaultCountry === 'CA' ? 'CA' : 'US',
      lineType: 'mobile',
      whatsappUrl: `https://wa.me/1${national}`,
    };
  }

  // Case 6: Other Supported Preset Countries (QA, OM, KW, DE, NL, TR, AU, SG, MY)
  const meta = COUNTRY_DIAL_META[defaultCountry];
  if (meta) {
    if (hasPlus && normalizedDigits.startsWith(meta.dial)) {
      const national = normalizedDigits.slice(meta.dial.length).replace(/^0+/, '');
      if (national.length >= meta.minNational && national.length <= meta.maxNational) {
        const isMob = meta.mobilePrefixes.test(national);
        return {
          raw: rawCandidate.trim(),
          e164: `+${meta.dial}${national}`,
          localDisplay: `+${meta.dial} ${national}`,
          countryCode: defaultCountry,
          lineType: isMob ? 'mobile' : 'landline',
          whatsappUrl: `https://wa.me/${meta.dial}${national}`,
        };
      }
    } else if (!hasPlus) {
      const national = normalizedDigits.startsWith('0')
        ? normalizedDigits.slice(1)
        : normalizedDigits;
      if (national.length >= meta.minNational && national.length <= meta.maxNational) {
        const isMob = meta.mobilePrefixes.test(national);
        return {
          raw: rawCandidate.trim(),
          e164: `+${meta.dial}${national}`,
          localDisplay: normalizedDigits.startsWith('0')
            ? `0${national}`
            : `+${meta.dial} ${national}`,
          countryCode: defaultCountry,
          lineType: isMob ? 'mobile' : 'landline',
          whatsappUrl: `https://wa.me/${meta.dial}${national}`,
        };
      }
    }
  }

  // Case 7: Explicit '+' international number for any country worldwide
  if (hasPlus && normalizedDigits.length >= 10 && normalizedDigits.length <= 15) {
    // Detect known dial prefixes even when defaultCountry differs
    for (const [code, info] of Object.entries(COUNTRY_DIAL_META) as Array<
      [SupportedCountryCode, (typeof COUNTRY_DIAL_META)['PK']]
    >) {
      if (normalizedDigits.startsWith(info.dial)) {
        const nat = normalizedDigits.slice(info.dial.length).replace(/^0+/, '');
        if (nat.length >= info.minNational && nat.length <= info.maxNational) {
          return {
            raw: rawCandidate.trim(),
            e164: `+${info.dial}${nat}`,
            localDisplay: `+${info.dial} ${nat}`,
            countryCode: code,
            lineType: info.mobilePrefixes.test(nat) ? 'mobile' : 'landline',
            whatsappUrl: `https://wa.me/${info.dial}${nat}`,
          };
        }
      }
    }
    return {
      raw: rawCandidate.trim(),
      e164: `+${normalizedDigits}`,
      localDisplay: `+${normalizedDigits}`,
      countryCode: 'INTL',
      lineType: 'mobile',
      whatsappUrl: `https://wa.me/${normalizedDigits}`,
    };
  }

  return null;
}

export function extractPhonesFromText(
  rawInput: string,
  defaultCountry: SupportedCountryCode = 'PK'
): NormalizedPhoneItem[] {
  if (!rawInput) return [];
  const phoneRegex =
    /(?:(?:\+92|\b0092|\b0)[\s.-]?(?:21|42|51|41|61|91|81|52|55|62|48|22)[\s.-]?111[\s.-]?\d{3}[\s.-]?\d{3})\b|\b0800[\s.-]?\d{5,6}\b|(?:\+92|\b0092|\b0)[\s.-]?(?:\(0\)[\s.-]?)?3\d{2}[\s.-]?\d{7}\b|\b0(?:21|42|51|41|61|91|81|52|55|62|48|22|992)[\s.-]?\d{6,8}\b|(?:\+|\b00)\d{1,3}[\s.-]?(?:\(0\)[\s.-]?)?\d{1,4}[\s.-]?\d{3,4}[\s.-]?\d{3,5}\b|(?:(?:\+|\b00)\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)[\s.-]?|\b0\d{1,4}[\s.-]|\b[2-9]\d{2}[\s.-])\d{3,4}[\s.-]?\d{3,5}\b/g;

  const seen = new Map<string, NormalizedPhoneItem>();
  let match: RegExpExecArray | null;
  while ((match = phoneRegex.exec(rawInput)) !== null) {
    const normalized = normalizePhoneNumber(match[0], defaultCountry);
    if (normalized && !seen.has(normalized.e164)) {
      seen.set(normalized.e164, normalized);
    }
  }
  return Array.from(seen.values());
}

// ============================================================================
// 6. WEIGHTED PROFESSION CLASSIFIER & HAVERSINE GEOSPATIAL CALCULATOR
// ============================================================================

export function classifyProfessionFromTextAndTags(
  textOrName: string,
  tags: Record<string, string> = {},
  fallbackProfessionId = 'doctors_clinic'
): ProfessionProfile {
  // 1. Check exact OpenStreetMap tags first (highest authority)
  for (const prof of PROFESSION_REGISTRY) {
    for (const rule of prof.osmRules) {
      const tagVal = (tags[rule.key] || '').toLowerCase().trim();
      if (tagVal === rule.value.toLowerCase()) {
        return prof;
      }
    }
  }

  // 2. Score profession profiles by weighted keyword specificity
  // Split pipe/tab segments so business name & category segments get 3x weight over street landmarks
  const parts = textOrName.split(/\s*\|\s*|\t/);
  const primaryText = (parts.slice(0, 2).join(' ') || textOrName).toLowerCase();
  const fullText = `${textOrName} ${Object.values(tags).join(' ')}`.toLowerCase();

  let bestProf: ProfessionProfile | null = null;
  let bestScore = 0;

  for (const prof of PROFESSION_REGISTRY) {
    let score = 0;
    for (const kw of prof.keywords) {
      const kwLower = kw.toLowerCase();
      const escaped = kwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const boundaryRegex = new RegExp(`\\b${escaped}`, 'i');

      if (boundaryRegex.test(primaryText)) {
        score += 30 + kwLower.length;
      } else if (boundaryRegex.test(fullText)) {
        score += 10 + kwLower.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestProf = prof;
    }
  }

  if (bestProf && bestScore > 0) {
    return bestProf;
  }

  return (
    PROFESSION_REGISTRY.find((p) => p.id === fallbackProfessionId) ||
    PROFESSION_REGISTRY[0]
  );
}

export function computeHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

export function computeRecordCompleteness(record: {
  businessName: string;
  emails: NormalizedEmailItem[];
  phones: NormalizedPhoneItem[];
  website: string;
  streetAddress: string;
  latitude: number | null;
}): number {
  let score = 0;
  if (
    record.businessName &&
    !record.businessName.startsWith('Unlisted ') &&
    !record.businessName.includes('Contact #')
  ) {
    score += 20;
  }
  if (record.phones.length > 0) score += 25;
  if (record.emails.length > 0) score += 30;
  if (record.website) score += 10;
  if (record.streetAddress) score += 10;
  if (record.latitude !== null) score += 5;
  return Math.min(100, score);
}

// ============================================================================
// 7. ENGINE 1: OPENSTREETMAP OVERPASS QL BUILDER & LIVE CORS CLIENT
// ============================================================================

export const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

export function buildOverpassBusinessQuery(params: {
  latitude: number;
  longitude: number;
  radiusKm: number;
  professionIds: string[];
  maxResults?: number;
}): string {
  const radiusMeters = Math.max(500, Math.min(50000, Math.round(params.radiusKm * 1000)));
  const lat = Number((Number(params.latitude) || 30.1575).toFixed(5));
  const lon = Number((Number(params.longitude) || 71.5249).toFixed(5));
  const limit = Math.max(1, Math.min(1000, params.maxResults || 250));

  const matchedProfiles =
    params.professionIds.length > 0 && !params.professionIds.includes('all')
      ? PROFESSION_REGISTRY.filter((p) => params.professionIds.includes(p.id))
      : [];

  const selectedProfiles =
    matchedProfiles.length > 0 ? matchedProfiles : PROFESSION_REGISTRY.slice(0, 12);

  const tagClauses: string[] = [];
  const seenRule = new Set<string>();

  for (const prof of selectedProfiles) {
    for (const rule of prof.osmRules) {
      const sig = `${rule.key}=${rule.value}`;
      if (!seenRule.has(sig)) {
        seenRule.add(sig);
        tagClauses.push(
          `  nwr["${rule.key}"="${rule.value}"](around:${radiusMeters},${lat},${lon});`
        );
      }
    }
  }

  return [
    `[out:json][timeout:25];`,
    `(`,
    ...tagClauses,
    `);`,
    `out center tags ${limit};`,
  ].join('\n');
}

export interface OverpassRawElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export function parseOverpassElementsToRecords(
  elements: OverpassRawElement[],
  cityContext: {
    cityName: string;
    countryName: string;
    countryCode: SupportedCountryCode;
    centerLat: number;
    centerLon: number;
    defaultProfessionId?: string;
  }
): BusinessContactRecord[] {
  const records: BusinessContactRecord[] = [];

  for (const el of elements) {
    const tags = el.tags || {};
    const name =
      tags['name:en'] ||
      tags.name ||
      tags.brand ||
      tags.operator ||
      tags.official_name ||
      '';
    if (
      !name &&
      !tags.phone &&
      !tags['contact:phone'] &&
      !tags.email &&
      !tags['contact:email']
    ) {
      continue;
    }

    const lat = el.lat ?? el.center?.lat ?? null;
    const lon = el.lon ?? el.center?.lon ?? null;

    const prof = classifyProfessionFromTextAndTags(
      name,
      tags,
      cityContext.defaultProfessionId || 'doctors_clinic'
    );

    const rawEmailSource = [
      tags.email,
      tags['contact:email'],
      tags['operator:email'],
      tags.description,
      tags.note,
    ]
      .filter(Boolean)
      .join(' ');
    const emails = extractEmailsFromText(rawEmailSource);

    const rawPhoneSource = [
      tags.phone,
      tags['contact:phone'],
      tags['phone:mobile'],
      tags['contact:mobile'],
      tags['contact:whatsapp'],
    ]
      .filter(Boolean)
      .join(' ; ');

    const phones: NormalizedPhoneItem[] = [];
    const seenPhones = new Set<string>();
    for (const part of rawPhoneSource.split(/[;,/]/)) {
      const p = normalizePhoneNumber(part, cityContext.countryCode);
      if (p && !seenPhones.has(p.e164)) {
        seenPhones.add(p.e164);
        phones.push(p);
      }
    }
    if (phones.length === 0 && rawPhoneSource) {
      for (const p of extractPhonesFromText(rawPhoneSource, cityContext.countryCode)) {
        if (!seenPhones.has(p.e164)) {
          seenPhones.add(p.e164);
          phones.push(p);
        }
      }
    }

    const website =
      tags.website || tags['contact:website'] || tags.url || tags['contact:facebook'] || '';

    const streetParts = [
      tags['addr:housename'],
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:suburb'] || tags['addr:neighbourhood'] || tags['addr:place'],
    ].filter(Boolean);
    const streetAddress =
      streetParts.join(', ') || tags['addr:full'] || `${cityContext.cityName}`;

    const city = tags['addr:city'] || cityContext.cityName;
    const postcode = tags['addr:postcode'] || '';
    const country = tags['addr:country'] || cityContext.countryName;
    const openingHours = tags.opening_hours || '';

    const distanceKm =
      lat !== null && lon !== null
        ? computeHaversineDistanceKm(cityContext.centerLat, cityContext.centerLon, lat, lon)
        : null;

    const businessName = name || `${prof.shortLabel} (${streetAddress})`;
    const googleMapsUrl =
      lat !== null && lon !== null
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${businessName} ${city} @${lat},${lon}`
        )}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${businessName} ${streetAddress} ${city}`
        )}`;

    const osmUrl = `https://www.openstreetmap.org/${el.type}/${el.id}`;

    const completenessScore = computeRecordCompleteness({
      businessName,
      emails,
      phones,
      website,
      streetAddress,
      latitude: lat,
    });

    records.push({
      id: `osm-${el.type}-${el.id}`,
      businessName,
      professionId: prof.id,
      professionLabel: prof.shortLabel,
      sector: prof.sector,
      sectorLabel: prof.sectorLabel,
      emails,
      phones,
      website,
      streetAddress,
      city,
      postcode,
      country,
      openingHours,
      latitude: lat,
      longitude: lon,
      distanceKm,
      googleMapsUrl,
      osmUrl,
      sourceType: 'osm_overpass_live',
      completenessScore,
      rawTags: tags,
    });
  }

  return records;
}

export async function resolveCityCoordinatesViaNominatim(
  cityName: string,
  countryHint = ''
): Promise<{
  latitude: number;
  longitude: number;
  resolvedCityName: string;
  resolvedCountryName: string;
  resolvedCountryCode?: SupportedCountryCode;
} | null> {
  const cleanCity = cityName.trim();
  if (!cleanCity) return null;

  // 1. Check built-in 36 CITY_PRESETS first (instant 0ms match)
  const presetMatch = CITY_PRESETS.find(
    (c) => c.name.toLowerCase() === cleanCity.toLowerCase()
  );
  if (presetMatch) {
    return {
      latitude: presetMatch.latitude,
      longitude: presetMatch.longitude,
      resolvedCityName: presetMatch.name,
      resolvedCountryName: presetMatch.countryName,
      resolvedCountryCode: presetMatch.countryCode,
    };
  }

  // 2. Query OpenStreetMap Nominatim geocoder for any custom city worldwide
  try {
    const query = countryHint ? `${cleanCity}, ${countryHint}` : cleanCity;
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(
      query
    )}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const arr = (await res.json()) as Array<{
      lat?: string;
      lon?: string;
      name?: string;
      display_name?: string;
      address?: {
        city?: string;
        town?: string;
        country?: string;
        country_code?: string;
      };
    }>;
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const hit = arr[0];
    const lat = Number(hit.lat);
    const lon = Number(hit.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

    const ccUpper = (hit.address?.country_code || '').toUpperCase();
    const supportedSet = new Set<string>(Object.keys(COUNTRY_DIAL_META));
    return {
      latitude: Number(lat.toFixed(5)),
      longitude: Number(lon.toFixed(5)),
      resolvedCityName:
        hit.address?.city || hit.address?.town || hit.name || cleanCity,
      resolvedCountryName: hit.address?.country || countryHint || 'Global',
      resolvedCountryCode: supportedSet.has(ccUpper)
        ? (ccUpper as SupportedCountryCode)
        : undefined,
    };
  } catch {
    return null;
  }
}

export async function fetchLiveOverpassBusinesses(params: {
  latitude: number;
  longitude: number;
  radiusKm: number;
  professionIds: string[];
  cityName: string;
  countryName: string;
  countryCode: SupportedCountryCode;
  maxResults?: number;
}): Promise<{
  records: BusinessContactRecord[];
  overpassQl: string;
  endpointUsed: string;
}> {
  const overpassQl = buildOverpassBusinessQuery({
    latitude: params.latitude,
    longitude: params.longitude,
    radiusKm: params.radiusKm,
    professionIds: params.professionIds,
    maxResults: params.maxResults || 250,
  });

  let lastError: Error | null = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: `data=${encodeURIComponent(overpassQl)}`,
      });
      if (!response.ok) {
        throw new Error(`Overpass HTTP ${response.status}`);
      }
      const json = (await response.json()) as { elements?: OverpassRawElement[] };
      const elements = Array.isArray(json.elements) ? json.elements : [];
      const records = parseOverpassElementsToRecords(elements, {
        cityName: params.cityName,
        countryName: params.countryName,
        countryCode: params.countryCode,
        centerLat: params.latitude,
        centerLon: params.longitude,
        defaultProfessionId:
          params.professionIds[0] && params.professionIds[0] !== 'all'
            ? params.professionIds[0]
            : 'doctors_clinic',
      });
      return {
        records,
        overpassQl,
        endpointUsed: endpoint,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error('All Overpass API endpoints timed out.');
}

// ============================================================================
// 8. ENGINE 2: SMART GOOGLE SEARCH/MAPS, DIRECTORY, HTML, CSV & VCARD ENRICHER
// ============================================================================

export function splitCsvRow(line: string, delimiter = ','): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function parseVCardBlocks(
  rawText: string,
  defaultCity: string,
  defaultCountryName: string,
  defaultCountryCode: SupportedCountryCode,
  fallbackProfessionId: string
): BusinessContactRecord[] {
  const blocks = rawText.split(/BEGIN:VCARD/i).slice(1);
  const results: BusinessContactRecord[] = [];

  blocks.forEach((block, idx) => {
    const fnMatch = block.match(/^(?:FN|ORG)[;:](.+)$/im);
    const orgMatch = block.match(/^ORG[;:](.+)$/im);
    const titleMatch = block.match(/^(?:TITLE|ROLE|CATEGORIES)[;:](.+)$/im);
    const adrMatch = block.match(/^ADR[^:]*:(.+)$/im);
    const urlMatch = block.match(/^URL[^:]*:(.+)$/im);
    const geoMatch = block.match(/^GEO[^:]*:([-\d.]+)[;,]([-\d.]+)$/im);

    const businessName = (fnMatch?.[1] || orgMatch?.[1] || `Contact Card #${idx + 1}`)
      .replace(/;/g, ' ')
      .trim();
    const roleHint = `${orgMatch?.[1] || ''} ${titleMatch?.[1] || ''}`.trim();
    const addressRaw = (adrMatch?.[1] || '')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
      .join(', ');

    const emails = extractEmailsFromText(block);
    const phones = extractPhonesFromText(block, defaultCountryCode);
    if (emails.length === 0 && phones.length === 0) return;

    const prof = classifyProfessionFromTextAndTags(
      `${businessName} | ${roleHint}`,
      {},
      fallbackProfessionId
    );
    const streetAddress = addressRaw || defaultCity;
    const website = (urlMatch?.[1] || '').trim();
    const lat = geoMatch ? Number(geoMatch[1]) : null;
    const lon = geoMatch ? Number(geoMatch[2]) : null;

    let detectedCity = defaultCity;
    for (const preset of CITY_PRESETS) {
      if (new RegExp(`\\b${preset.name}\\b`, 'i').test(`${addressRaw} ${roleHint}`)) {
        detectedCity = preset.name;
        break;
      }
    }

    results.push({
      id: `vcard-${idx + 1}`,
      businessName,
      professionId: prof.id,
      professionLabel: prof.shortLabel,
      sector: prof.sector,
      sectorLabel: prof.sectorLabel,
      emails,
      phones,
      website,
      streetAddress,
      city: detectedCity,
      postcode: '',
      country: defaultCountryName,
      openingHours: '',
      latitude: Number.isFinite(lat) ? lat : null,
      longitude: Number.isFinite(lon) ? lon : null,
      distanceKm: null,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${businessName} ${streetAddress}`
      )}`,
      osmUrl: '',
      sourceType: 'vcard_import',
      completenessScore: computeRecordCompleteness({
        businessName,
        emails,
        phones,
        website,
        streetAddress,
        latitude: Number.isFinite(lat) ? lat : null,
      }),
      rawTags: { format: 'vCard 3.0/4.0' },
    });
  });

  return results;
}

export function extractContactsFromUnstructuredInput(
  rawInput: string,
  context: {
    defaultCity: string;
    defaultCountryName: string;
    defaultCountryCode: SupportedCountryCode;
    fallbackProfessionId: string;
  }
): BusinessContactRecord[] {
  if (!rawInput || !rawInput.trim()) return [];

  // 1. vCard (.vcf) content
  if (/BEGIN:VCARD/i.test(rawInput)) {
    return parseVCardBlocks(
      rawInput,
      context.defaultCity,
      context.defaultCountryName,
      context.defaultCountryCode,
      context.fallbackProfessionId
    );
  }

  const records: BusinessContactRecord[] = [];
  let workingText = rawInput;

  // 2. Embedded Schema.org JSON-LD LocalBusiness / Dentist / Physician / Plumber objects in HTML
  const jsonLdRegex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let scriptMatch: RegExpExecArray | null;
  let jsonLdIndex = 0;
  while ((scriptMatch = jsonLdRegex.exec(rawInput)) !== null) {
    try {
      const parsed = JSON.parse(scriptMatch[1].trim());
      const items = Array.isArray(parsed)
        ? parsed
        : parsed['@graph'] && Array.isArray(parsed['@graph'])
          ? parsed['@graph']
          : [parsed];
      for (const item of items) {
        if (!item || typeof item !== 'object') continue;
        const name = String(item.name || '');
        const rawBlock = JSON.stringify(item);
        const emails = extractEmailsFromText(rawBlock);
        const phones = extractPhonesFromText(rawBlock, context.defaultCountryCode);
        if (!name && emails.length === 0 && phones.length === 0) continue;

        jsonLdIndex++;
        const prof = classifyProfessionFromTextAndTags(
          `${name} | ${item['@type'] || ''} | ${item.description || ''}`,
          {},
          context.fallbackProfessionId
        );
        const addrObj = item.address || {};
        const streetAddress =
          typeof addrObj === 'string'
            ? addrObj
            : [addrObj.streetAddress, addrObj.addressLocality, addrObj.addressRegion]
              .filter(Boolean)
              .join(', ') || context.defaultCity;
        const city =
          (typeof addrObj === 'object' && addrObj.addressLocality) ||
          context.defaultCity;
        const lat = item.geo?.latitude !== undefined ? Number(item.geo.latitude) : null;
        const lon = item.geo?.longitude !== undefined ? Number(item.geo.longitude) : null;
        const website = String(item.url || '');

        records.push({
          id: `jsonld-${jsonLdIndex}`,
          businessName: name || `${prof.shortLabel} #${jsonLdIndex}`,
          professionId: prof.id,
          professionLabel: prof.shortLabel,
          sector: prof.sector,
          sectorLabel: prof.sectorLabel,
          emails,
          phones,
          website,
          streetAddress,
          city,
          postcode: String(addrObj.postalCode || ''),
          country: context.defaultCountryName,
          openingHours: String(item.openingHours || ''),
          latitude: Number.isFinite(lat) ? lat : null,
          longitude: Number.isFinite(lon) ? lon : null,
          distanceKm: null,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${name} ${streetAddress} ${city}`
          )}`,
          osmUrl: '',
          sourceType: 'html_jsonld_dom',
          completenessScore: computeRecordCompleteness({
            businessName: name,
            emails,
            phones,
            website,
            streetAddress,
            latitude: Number.isFinite(lat) ? lat : null,
          }),
          rawTags: { schemaType: String(item['@type'] || 'LocalBusiness') },
        });
      }
      workingText = workingText.replace(scriptMatch[0], '\n');
    } catch {
      // Ignore malformed JSON-LD and fall through to block/line parser
    }
  }

  // Strip HTML tags while preserving block boundaries and mailto/tel links
  const strippedText = workingText
    .replace(/<(?:br|p|div|li|tr|h[1-6]|section|article)\b[^>]*>/gi, '\n')
    .replace(/<a\b[^>]*href=["']mailto:([^"'?]+)[^"']*["'][^>]*>/gi, ' $1 ')
    .replace(/<a\b[^>]*href=["']tel:([^"']+)["'][^>]*>/gi, ' $1 ')
    .replace(/<[^>]+>/g, ' ');

  const rawLines = strippedText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (rawLines.length === 0) return records;

  // Check if input is a structured CSV or TSV header table (e.g. "Business Name,Profession,Phone Number,Email Address,City,Street Address")
  const tableDelimiter = rawLines[0].includes('\t') ? '\t' : ',';
  const firstLineCols = splitCsvRow(rawLines[0], tableDelimiter);
  const isCsvWithHeader =
    rawLines.length >= 2 &&
    firstLineCols.length >= 3 &&
    !rawLines[0].includes('|') &&
    firstLineCols.some((c) => /^(business|name|company|clinic|title|organization)\b/i.test(c)) &&
    firstLineCols.some((c) => /^(email|e-mail|phone|mobile|tel|contact|whatsapp)\b/i.test(c));

  if (isCsvWithHeader) {
    const headerNames = firstLineCols.map((h) => h.toLowerCase().trim());
    const nameIdx = headerNames.findIndex((h) =>
      /^(business|name|company|clinic|title|organization)\b/.test(h)
    );
    const profIdx = headerNames.findIndex((h) =>
      /^(profession|category|sector|specialty|type|role)\b/.test(h)
    );
    const cityIdx = headerNames.findIndex((h) => /^(city|town|locality)\b/.test(h));
    const addrIdx = headerNames.findIndex((h) =>
      /^(address|street|location)\b/.test(h)
    );
    const webIdx = headerNames.findIndex((h) => /^(website|url|domain|web)\b/.test(h));

    for (let r = 1; r < rawLines.length; r++) {
      const cols = splitCsvRow(rawLines[r], tableDelimiter);
      const rowJoined = cols.join(' | ');
      const emails = extractEmailsFromText(rowJoined);
      const phones = extractPhonesFromText(rowJoined, context.defaultCountryCode);
      if (emails.length === 0 && phones.length === 0) continue;

      const nameVal = (nameIdx >= 0 ? cols[nameIdx] : cols[0]) || `Business #${r}`;
      const profVal = profIdx >= 0 ? cols[profIdx] : '';
      const cityVal = (cityIdx >= 0 && cols[cityIdx]) || context.defaultCity;
      const addrVal = (addrIdx >= 0 && cols[addrIdx]) || cityVal;
      const webVal = (webIdx >= 0 && cols[webIdx]) || '';

      const prof = classifyProfessionFromTextAndTags(
        `${nameVal} | ${profVal}`,
        {},
        context.fallbackProfessionId
      );

      records.push({
        id: `csv-${r}`,
        businessName: nameVal,
        professionId: prof.id,
        professionLabel: prof.shortLabel,
        sector: prof.sector,
        sectorLabel: prof.sectorLabel,
        emails,
        phones,
        website: webVal,
        streetAddress: addrVal,
        city: cityVal,
        postcode: '',
        country: context.defaultCountryName,
        openingHours: '',
        latitude: null,
        longitude: null,
        distanceKm: null,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${nameVal} ${addrVal} ${cityVal}`
        )}`,
        osmUrl: '',
        sourceType: 'csv_tsv_import',
        completenessScore: computeRecordCompleteness({
          businessName: nameVal,
          emails,
          phones,
          website: webVal,
          streetAddress: addrVal,
          latitude: null,
        }),
        rawTags: {},
      });
    }
    return records;
  }

  // Group lines into logical business blocks:
  // - Single-line pipe/tab/CSV rows with contact details flush immediately
  // - Multi-line Google Maps/directory cards flush as soon as a contact line completes a card
  const blocks: string[] = [];
  let currentBuffer: string[] = [];
  let bufferHasContact = false;

  for (const line of rawLines) {
    const lineHasContact =
      extractEmailsFromText(line).length > 0 ||
      extractPhonesFromText(line, context.defaultCountryCode).length > 0;

    if (
      lineHasContact &&
      (line.includes('|') || line.includes('\t') || splitCsvRow(line, ',').length >= 3)
    ) {
      if (currentBuffer.length > 0) {
        blocks.push(currentBuffer.join(' | '));
        currentBuffer = [];
        bufferHasContact = false;
      }
      blocks.push(line);
      continue;
    }

    // If current buffer already captured a contact line and the new line is a fresh title (no contact),
    // flush the completed card before starting the next business card
    if (bufferHasContact && !lineHasContact) {
      blocks.push(currentBuffer.join(' | '));
      currentBuffer = [line];
      bufferHasContact = false;
      continue;
    }

    // If both buffer and new line have contacts and buffer already has a title + contact, flush
    if (bufferHasContact && lineHasContact && currentBuffer.length >= 2) {
      blocks.push(currentBuffer.join(' | '));
      currentBuffer = [line];
      bufferHasContact = true;
      continue;
    }

    currentBuffer.push(line);
    if (lineHasContact) {
      bufferHasContact = true;
    }
  }

  if (currentBuffer.length > 0) {
    blocks.push(currentBuffer.join(' | '));
  }

  blocks.forEach((block, idx) => {
    const emails = extractEmailsFromText(block);
    const phones = extractPhonesFromText(block, context.defaultCountryCode);
    if (emails.length === 0 && phones.length === 0) return;

    const isCommaRow =
      !block.includes('|') && !block.includes('\t') && splitCsvRow(block, ',').length >= 3;
    const segments = isCommaRow
      ? splitCsvRow(block, ',')
      : block
        .split(/\s*\|\s*|\t|\s+·\s+|\s+—\s+/)
        .map((s) => s.trim())
        .filter(Boolean);

    // Find the best candidate for Business Name
    let businessName = '';
    for (const seg of segments) {
      const cleanSeg = seg.replace(/^["']|["']$/g, '').trim();
      if (
        cleanSeg.length >= 3 &&
        cleanSeg.length <= 95 &&
        !cleanSeg.includes('@') &&
        !/\s(?:\[at\]|\(at\)|\{at\})\s/i.test(cleanSeg) &&
        !/^[+\d\s().-]+$/.test(cleanSeg) &&
        !/^\d\.\d\s*\(\d+\)$/.test(cleanSeg) &&
        !/^https?:\/\//i.test(cleanSeg)
      ) {
        businessName = isCommaRow ? cleanSeg : cleanSeg.split(',')[0].trim();
        break;
      }
    }

    const prof = classifyProfessionFromTextAndTags(
      block,
      {},
      context.fallbackProfessionId
    );

    if (!businessName) {
      if (emails.length > 0 && emails[0].isCorporateDomain) {
        const domainBase = emails[0].domain.split('.')[0];
        businessName = `${domainBase.charAt(0).toUpperCase() + domainBase.slice(1)} (${prof.shortLabel})`;
      } else {
        businessName = `${prof.shortLabel} Contact #${idx + 1}`;
      }
    }

    const urlMatch = block.match(/\bhttps?:\/\/[^\s|,;"'<>]+/i);
    let website = urlMatch ? urlMatch[0].replace(/[.,;)]+$/, '') : '';
    if (!website && emails.length > 0 && emails[0].isCorporateDomain) {
      website = `https://${emails[0].domain}`;
    }

    let detectedCity = context.defaultCity;
    for (const preset of CITY_PRESETS) {
      if (new RegExp(`\\b${preset.name}\\b`, 'i').test(block)) {
        detectedCity = preset.name;
        break;
      }
    }

    let streetAddress = detectedCity;
    for (const seg of segments) {
      if (
        /\b(road|rd|street|st|avenue|ave|boulevard|blvd|lane|ln|drive|dr|way|court|ct|plaza|square|sq|parkway|highway|hwy|suite|ste|floor|fl|building|bldg|tower|block|colony|town|phase|sector|straße|strasse|str|platz|weg|allee|rue|place|cours|via|piazza|viale|calle|carrera|paseo|avenida|rua|alameda|jalan|jln|lorong|soi|chome|district|gulgasht|bosan|nishtar|cantt|gulberg|defence|dha|clifton|saddar|blue area|markaz|business bay|jumeirah|al quoz|marina|sheikh zayed|olaya|king fahd|industrial|courts|kutchery|high st)\b/i.test(
          seg
        )
      ) {
        streetAddress = seg.slice(0, 120);
        break;
      }
    }

    const sourceType: RecordSourceType = isCommaRow
      ? 'csv_tsv_import'
      : 'pasted_directory_text';

    records.push({
      id: `paste-${idx + 1}`,
      businessName,
      professionId: prof.id,
      professionLabel: prof.shortLabel,
      sector: prof.sector,
      sectorLabel: prof.sectorLabel,
      emails,
      phones,
      website,
      streetAddress,
      city: detectedCity,
      postcode: '',
      country: context.defaultCountryName,
      openingHours: '',
      latitude: null,
      longitude: null,
      distanceKm: null,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${businessName} ${streetAddress} ${detectedCity}`
      )}`,
      osmUrl: '',
      sourceType,
      completenessScore: computeRecordCompleteness({
        businessName,
        emails,
        phones,
        website,
        streetAddress,
        latitude: null,
      }),
      rawTags: {},
    });
  });

  return records;
}

// ============================================================================
// 9. MULTI-INDEX DEDUPLICATION, FILTERING & VIEW-MODE ENGINE
// ============================================================================

export function mergeAndDeduplicateRecords(
  primaryRecords: BusinessContactRecord[],
  secondaryRecords: BusinessContactRecord[]
): BusinessContactRecord[] {
  const canonicalList: BusinessContactRecord[] = [];
  const emailIndex = new Map<string, BusinessContactRecord>();
  const phoneIndex = new Map<string, BusinessContactRecord>();
  const nameCityIndex = new Map<string, BusinessContactRecord>();

  const registerIndices = (rec: BusinessContactRecord) => {
    for (const e of rec.emails) {
      emailIndex.set(e.email.toLowerCase(), rec);
    }
    for (const p of rec.phones) {
      phoneIndex.set(p.e164, rec);
    }
    const normName = rec.businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normName && !normName.includes('contact')) {
      nameCityIndex.set(`${normName}::${rec.city.toLowerCase()}`, rec);
    }
  };

  const all = [...primaryRecords, ...secondaryRecords];
  for (const rec of all) {
    const normName = rec.businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const nameKey =
      normName && !normName.includes('contact')
        ? `${normName}::${rec.city.toLowerCase()}`
        : '';

    let existing: BusinessContactRecord | undefined;
    for (const e of rec.emails) {
      existing = emailIndex.get(e.email.toLowerCase());
      if (existing) break;
    }
    if (!existing) {
      for (const p of rec.phones) {
        existing = phoneIndex.get(p.e164);
        if (existing) break;
      }
    }
    if (!existing && nameKey) {
      existing = nameCityIndex.get(nameKey);
    }

    if (!existing) {
      const cloned: BusinessContactRecord = {
        ...rec,
        emails: [...rec.emails],
        phones: [...rec.phones],
      };
      canonicalList.push(cloned);
      registerIndices(cloned);
    } else {
      const seenEmails = new Set(existing.emails.map((e) => e.email));
      for (const e of rec.emails) {
        if (!seenEmails.has(e.email)) {
          seenEmails.add(e.email);
          existing.emails.push(e);
        }
      }
      const seenPhones = new Set(existing.phones.map((p) => p.e164));
      for (const p of rec.phones) {
        if (!seenPhones.has(p.e164)) {
          seenPhones.add(p.e164);
          existing.phones.push(p);
        }
      }
      if (!existing.website && rec.website) existing.website = rec.website;
      if (
        (!existing.streetAddress || existing.streetAddress === existing.city) &&
        rec.streetAddress &&
        rec.streetAddress !== rec.city
      ) {
        existing.streetAddress = rec.streetAddress;
      }
      if (existing.latitude === null && rec.latitude !== null) {
        existing.latitude = rec.latitude;
        existing.longitude = rec.longitude;
        existing.distanceKm = rec.distanceKm;
      }
      if (!existing.openingHours && rec.openingHours) {
        existing.openingHours = rec.openingHours;
      }
      existing.completenessScore = computeRecordCompleteness(existing);
      registerIndices(existing);
    }
  }

  return canonicalList.sort((a, b) => b.completenessScore - a.completenessScore);
}

export function getDefaultContactFilterOptions(): ContactFilterOptions {
  return {
    searchQuery: '',
    selectedSector: 'all',
    selectedProfessionId: 'all',
    selectedCityFilter: 'all',
    requireEmail: false,
    requirePhone: false,
    requireWebsite: false,
    corporateEmailOnly: false,
    mobileWhatsappOnly: false,
    minCompletenessScore: 0,
    defaultCountryCode: 'PK',
  };
}

export function filterAndAnalyzeContacts(
  allRecords: BusinessContactRecord[],
  filter: ContactFilterOptions,
  generatedOverpassQl = '',
  activeEndpointUsed?: string
): ContactExtractionResult {
  const startTime = performance.now();
  const q = filter.searchQuery.trim().toLowerCase();

  const filteredRecords = allRecords.filter((rec) => {
    if (filter.selectedSector !== 'all' && rec.sector !== filter.selectedSector) {
      return false;
    }
    if (
      filter.selectedProfessionId !== 'all' &&
      rec.professionId !== filter.selectedProfessionId
    ) {
      return false;
    }
    if (
      filter.selectedCityFilter !== 'all' &&
      rec.city.toLowerCase() !== filter.selectedCityFilter.toLowerCase()
    ) {
      return false;
    }
    if (filter.requireEmail && rec.emails.length === 0) {
      return false;
    }
    if (filter.requirePhone && rec.phones.length === 0) {
      return false;
    }
    if (filter.requireWebsite && !rec.website) {
      return false;
    }
    if (
      filter.corporateEmailOnly &&
      !rec.emails.some((e) => e.isCorporateDomain)
    ) {
      return false;
    }
    if (
      filter.mobileWhatsappOnly &&
      !rec.phones.some((p) => p.lineType === 'mobile')
    ) {
      return false;
    }
    if (rec.completenessScore < filter.minCompletenessScore) {
      return false;
    }
    if (q) {
      const hay = [
        rec.businessName,
        rec.professionLabel,
        rec.sectorLabel,
        rec.city,
        rec.streetAddress,
        rec.website,
        ...rec.emails.map((e) => e.email),
        ...rec.phones.map((p) => `${p.e164} ${p.localDisplay}`),
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const allEmailsMap = new Map<string, NormalizedEmailItem>();
  const allPhonesMap = new Map<string, NormalizedPhoneItem>();
  const filteredEmailsMap = new Map<string, NormalizedEmailItem>();
  const filteredPhonesMap = new Map<string, NormalizedPhoneItem>();

  const sectorBreakdown: Record<IndustrySectorId, number> = {
    healthcare: 0,
    home_trades: 0,
    professional_b2b: 0,
    technology_corp: 0,
    hospitality_retail: 0,
    education_lifestyle: 0,
  };

  let recordsWithBoth = 0;
  let recordsWithCoords = 0;
  let recordsWithWeb = 0;

  for (const r of allRecords) {
    sectorBreakdown[r.sector] = (sectorBreakdown[r.sector] || 0) + 1;
    for (const e of r.emails) {
      if (!allEmailsMap.has(e.email)) allEmailsMap.set(e.email, e);
    }
    for (const p of r.phones) {
      if (!allPhonesMap.has(p.e164)) allPhonesMap.set(p.e164, p);
    }
  }

  for (const r of filteredRecords) {
    if (r.emails.length > 0 && r.phones.length > 0) recordsWithBoth++;
    if (r.latitude !== null && r.longitude !== null) recordsWithCoords++;
    if (r.website) recordsWithWeb++;

    for (const e of r.emails) {
      if (filter.corporateEmailOnly && !e.isCorporateDomain) continue;
      if (!filteredEmailsMap.has(e.email)) filteredEmailsMap.set(e.email, e);
    }
    for (const p of r.phones) {
      if (filter.mobileWhatsappOnly && p.lineType !== 'mobile') continue;
      if (!filteredPhonesMap.has(p.e164)) filteredPhonesMap.set(p.e164, p);
    }
  }

  const uniqueEmails = Array.from(filteredEmailsMap.values());
  const uniquePhones = Array.from(filteredPhonesMap.values());

  const corporateEmailsCount = uniqueEmails.filter((e) => e.isCorporateDomain).length;
  const obfuscatedRecoveredCount = uniqueEmails.filter((e) => e.wasObfuscated).length;
  const whatsappMobileCount = uniquePhones.filter((p) => p.lineType === 'mobile').length;

  return {
    engineVersion: LOCAL_BUSINESS_ENGINE_VERSION,
    records: allRecords,
    filteredRecords,
    uniqueEmails,
    uniquePhones,
    metrics: {
      totalRecords: allRecords.length,
      filteredRecords: filteredRecords.length,
      totalUniqueEmails: allEmailsMap.size,
      filteredUniqueEmails: uniqueEmails.length,
      corporateEmailsCount,
      obfuscatedRecoveredCount,
      totalUniquePhones: allPhonesMap.size,
      filteredUniquePhones: uniquePhones.length,
      whatsappMobileCount,
      recordsWithBothEmailAndPhone: recordsWithBoth,
      recordsWithCoordinates: recordsWithCoords,
      recordsWithWebsite: recordsWithWeb,
      sectorBreakdown,
      executionTimeMs: Math.max(
        0.1,
        Math.round((performance.now() - startTime) * 100) / 100
      ),
    },
    generatedOverpassQl,
    activeEndpointUsed,
  };
}

// ============================================================================
// 10. FIELD-SPECIFIC FORMATTERS (EMAILS ONLY & PHONES ONLY)
// ============================================================================

export function formatEmailsOnlyOutput(
  records: BusinessContactRecord[],
  format: EmailCopyFormat,
  corporateOnly = false
): string {
  const pairs: Array<{
    businessName: string;
    profession: string;
    city: string;
    item: NormalizedEmailItem;
  }> = [];
  const seen = new Set<string>();

  for (const r of records) {
    for (const e of r.emails) {
      if (corporateOnly && !e.isCorporateDomain) continue;
      if (!seen.has(e.email)) {
        seen.add(e.email);
        pairs.push({
          businessName: r.businessName,
          profession: r.professionLabel,
          city: r.city,
          item: e,
        });
      }
    }
  }

  if (pairs.length === 0) return '';

  switch (format) {
    case 'plain_newline':
      return pairs.map((p) => p.item.email).join('\n');
    case 'comma_separated':
      return pairs.map((p) => p.item.email).join(', ');
    case 'named_rfc5322':
      return pairs
        .map(
          (p) =>
            `"${p.businessName.replace(/"/g, '')} (${p.profession} - ${p.city})" <${p.item.email}>`
        )
        .join('\n');
    case 'domain_grouped': {
      const byDomain = new Map<string, string[]>();
      for (const p of pairs) {
        const list = byDomain.get(p.item.domain) || [];
        list.push(`${p.item.email} — ${p.businessName} (${p.profession}, ${p.city})`);
        byDomain.set(p.item.domain, list);
      }
      return Array.from(byDomain.entries())
        .map(([dom, items]) => `# Domain: ${dom} (${items.length})\n${items.join('\n')}`)
        .join('\n\n');
    }
  }
}

export function formatPhonesOnlyOutput(
  records: BusinessContactRecord[],
  format: PhoneCopyFormat,
  mobileOnly = false
): string {
  const pairs: Array<{
    businessName: string;
    profession: string;
    city: string;
    item: NormalizedPhoneItem;
  }> = [];
  const seen = new Set<string>();

  for (const r of records) {
    for (const p of r.phones) {
      if (mobileOnly && p.lineType !== 'mobile') continue;
      if (!seen.has(p.e164)) {
        seen.add(p.e164);
        pairs.push({
          businessName: r.businessName,
          profession: r.professionLabel,
          city: r.city,
          item: p,
        });
      }
    }
  }

  if (pairs.length === 0) return '';

  switch (format) {
    case 'e164_newline':
      return pairs.map((p) => p.item.e164).join('\n');
    case 'local_newline':
      return pairs.map((p) => p.item.localDisplay).join('\n');
    case 'whatsapp_links':
      return pairs
        .map((p) => `${p.item.whatsappUrl} (${p.businessName} - ${p.city})`)
        .join('\n');
    case 'named_directory':
      return pairs
        .map(
          (p) =>
            `${p.businessName} | ${p.profession} | ${p.city} | ${p.item.e164} (${p.item.localDisplay})`
        )
        .join('\n');
  }
}

// ============================================================================
// 11. LIVE CLOUDFLARE DNS-OVER-HTTPS (DoH) MX RECORD VERIFIER
// ============================================================================

export async function verifyEmailDomainMx(domain: string): Promise<{
  domain: string;
  hasMx: boolean;
  mxRecords: string[];
}> {
  const cleanDomain = domain.trim().toLowerCase();
  if (!cleanDomain || !cleanDomain.includes('.')) {
    return { domain: cleanDomain, hasMx: false, mxRecords: [] };
  }
  try {
    const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(
      cleanDomain
    )}&type=MX`;
    const res = await fetch(url, {
      headers: { Accept: 'application/dns-json' },
    });
    if (!res.ok) {
      return { domain: cleanDomain, hasMx: false, mxRecords: [] };
    }
    const data = (await res.json()) as {
      Answer?: Array<{ type: number; data: string }>;
    };
    const mxRecords = (data.Answer || [])
      .filter((a) => a.type === 15 && a.data)
      .map((a) => a.data.replace(/\.$/, '').trim());
    return {
      domain: cleanDomain,
      hasMx: mxRecords.length > 0,
      mxRecords,
    };
  } catch {
    return { domain: cleanDomain, hasMx: false, mxRecords: [] };
  }
}

// ============================================================================
// 12. 5-FORMAT EXPORTERS (XLSX, CSV, VCARD .VCF, GEOJSON, JSON) WITH CWE-1236 GUARD
// ============================================================================

export function sanitizeSpreadsheetCell(
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined) return '';
  const str = String(value).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

function escapeCsvField(value: string | number | null | undefined): string {
  const safe = sanitizeSpreadsheetCell(value);
  if (/[",\r\n]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export function exportBusinessContactsCsv(
  records: BusinessContactRecord[]
): string {
  const headers = [
    'Business Name',
    'Profession / Category',
    'Industry Sector',
    'Primary Email',
    'All Emails',
    'Primary Phone (E.164)',
    'Local Phone Display',
    'WhatsApp Click-to-Chat',
    'Website URL',
    'Street Address',
    'City',
    'Country',
    'Opening Hours',
    'Latitude',
    'Longitude',
    'Distance (km)',
    'Google Maps Link',
    'Completeness Score (%)',
    'Data Source',
  ];

  const rows = records.map((r) => [
    r.businessName,
    r.professionLabel,
    r.sectorLabel,
    r.emails[0]?.email || '',
    r.emails.map((e) => e.email).join('; '),
    r.phones[0]?.e164 || '',
    r.phones.map((p) => p.localDisplay).join('; '),
    r.phones[0]?.whatsappUrl || '',
    r.website,
    r.streetAddress,
    r.city,
    r.country,
    r.openingHours,
    r.latitude ?? '',
    r.longitude ?? '',
    r.distanceKm ?? '',
    r.googleMapsUrl,
    r.completenessScore,
    r.sourceType,
  ]);

  return [
    headers.map(escapeCsvField).join(','),
    ...rows.map((row) => row.map(escapeCsvField).join(',')),
  ].join('\r\n');
}

export function exportBusinessContactsJson(
  result: ContactExtractionResult
): string {
  return JSON.stringify(
    {
      generator: `KivaroTools Local Business & Contact Studio v${result.engineVersion}`,
      generatedAtUtc: new Date().toISOString(),
      metrics: result.metrics,
      records: result.filteredRecords,
    },
    null,
    2
  );
}

export function exportBusinessContactsVCard(
  records: BusinessContactRecord[]
): string {
  const cards: string[] = [];

  for (const r of records) {
    if (r.phones.length === 0 && r.emails.length === 0) continue;
    const safeName = r.businessName.replace(/[\r\n;]/g, ' ').trim();
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${safeName}`,
      `ORG:${safeName};${r.professionLabel}`,
      `TITLE:${r.professionLabel} (${r.city})`,
    ];

    for (const p of r.phones) {
      const typeLabel = p.lineType === 'mobile' ? 'CELL,VOICE' : 'WORK,VOICE';
      lines.push(`TEL;TYPE=${typeLabel}:${p.e164}`);
    }
    for (const e of r.emails) {
      lines.push(`EMAIL;TYPE=INTERNET,WORK:${e.email}`);
    }
    if (r.website) {
      lines.push(`URL:${r.website}`);
    }
    if (r.streetAddress || r.city) {
      lines.push(
        `ADR;TYPE=WORK:;;${r.streetAddress.replace(/;/g, ',')};${r.city};;${r.postcode};${r.country}`
      );
    }
    if (r.latitude !== null && r.longitude !== null) {
      lines.push(`GEO:${r.latitude};${r.longitude}`);
    }
    lines.push(
      `NOTE:Extracted via KivaroTools Business & Contact Studio | Category: ${r.professionLabel} | Maps: ${r.googleMapsUrl}`
    );
    lines.push('END:VCARD');
    cards.push(lines.join('\r\n'));
  }

  return cards.join('\r\n\r\n');
}

export function exportBusinessContactsGeoJson(
  records: BusinessContactRecord[]
): string {
  const features = records
    .filter((r) => r.latitude !== null && r.longitude !== null)
    .map((r) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [r.longitude, r.latitude],
      },
      properties: {
        id: r.id,
        businessName: r.businessName,
        profession: r.professionLabel,
        sector: r.sectorLabel,
        primaryEmail: r.emails[0]?.email || null,
        primaryPhone: r.phones[0]?.e164 || null,
        whatsappUrl: r.phones[0]?.whatsappUrl || null,
        website: r.website || null,
        address: r.streetAddress,
        city: r.city,
        country: r.country,
        openingHours: r.openingHours || null,
        googleMapsUrl: r.googleMapsUrl,
        completenessScore: r.completenessScore,
      },
    }));

  return JSON.stringify(
    {
      type: 'FeatureCollection',
      generator: `KivaroTools Local Business & Contact Studio v${LOCAL_BUSINESS_ENGINE_VERSION}`,
      generatedAtUtc: new Date().toISOString(),
      features,
    },
    null,
    2
  );
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function columnIndexToLetter(colIdx: number): string {
  let temp = colIdx + 1;
  let letter = '';
  while (temp > 0) {
    const rem = (temp - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    temp = Math.floor((temp - 1) / 26);
  }
  return letter;
}

function buildWorksheetXml(rows: Array<Array<string | number>>): string {
  const rowXml = rows
    .map((row, rIdx) => {
      const cells = row
        .map((val, cIdx) => {
          const cellRef = `${columnIndexToLetter(cIdx)}${rIdx + 1}`;
          if (typeof val === 'number' && Number.isFinite(val)) {
            return `<c r="${cellRef}"><v>${val}</v></c>`;
          }
          const safeStr = escapeXml(sanitizeSpreadsheetCell(val));
          return `<c r="${cellRef}" t="inlineStr"><is><t>${safeStr}</t></is></c>`;
        })
        .join('');
      return `<row r="${rIdx + 1}">${cells}</row>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${rowXml}</sheetData>
</worksheet>`;
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function computeCrc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function exportBusinessContactsXlsx(
  result: ContactExtractionResult
): Uint8Array {
  const summaryRows: Array<Array<string | number>> = [
    ['KivaroTools Local Business, Profession & Contact Intelligence Workbook'],
    ['Engine Version', result.engineVersion],
    ['Generated At (UTC)', new Date().toISOString()],
    ['Total Discovered Business Profiles', result.metrics.totalRecords],
    ['Filtered Active Business Profiles', result.metrics.filteredRecords],
    ['Unique Verified Format Emails', result.metrics.filteredUniqueEmails],
    ['Corporate Domain Emails', result.metrics.corporateEmailsCount],
    [
      'De-Obfuscated Hidden Emails Recovered',
      result.metrics.obfuscatedRecoveredCount,
    ],
    [
      'Unique Normalized Phone Numbers (E.164)',
      result.metrics.filteredUniquePhones,
    ],
    ['WhatsApp-Ready Mobile Numbers', result.metrics.whatsappMobileCount],
    [
      'Businesses with Both Email & Phone',
      result.metrics.recordsWithBothEmailAndPhone,
    ],
    [
      'Businesses with Exact GPS Coordinates',
      result.metrics.recordsWithCoordinates,
    ],
    [],
    ['Industry Sector', 'Discovered Count'],
    [INDUSTRY_SECTOR_LABELS.healthcare, result.metrics.sectorBreakdown.healthcare],
    [INDUSTRY_SECTOR_LABELS.home_trades, result.metrics.sectorBreakdown.home_trades],
    [
      INDUSTRY_SECTOR_LABELS.professional_b2b,
      result.metrics.sectorBreakdown.professional_b2b,
    ],
    [
      INDUSTRY_SECTOR_LABELS.technology_corp,
      result.metrics.sectorBreakdown.technology_corp,
    ],
    [
      INDUSTRY_SECTOR_LABELS.hospitality_retail,
      result.metrics.sectorBreakdown.hospitality_retail,
    ],
    [
      INDUSTRY_SECTOR_LABELS.education_lifestyle,
      result.metrics.sectorBreakdown.education_lifestyle,
    ],
  ];

  const directoryRows: Array<Array<string | number>> = [
    [
      'Business Name',
      'Profession / Category',
      'Sector',
      'Primary Email',
      'All Emails',
      'Primary Phone (E.164)',
      'Local Phone',
      'WhatsApp Link',
      'Website',
      'Street Address',
      'City',
      'Country',
      'Opening Hours',
      'Latitude',
      'Longitude',
      'Distance (km)',
      'Google Maps URL',
      'Completeness (%)',
    ],
    ...result.filteredRecords.map((r) => [
      r.businessName,
      r.professionLabel,
      r.sectorLabel,
      r.emails[0]?.email || '',
      r.emails.map((e) => e.email).join('; '),
      r.phones[0]?.e164 || '',
      r.phones.map((p) => p.localDisplay).join('; '),
      r.phones[0]?.whatsappUrl || '',
      r.website,
      r.streetAddress,
      r.city,
      r.country,
      r.openingHours,
      r.latitude ?? '',
      r.longitude ?? '',
      r.distanceKm ?? '',
      r.googleMapsUrl,
      r.completenessScore,
    ]),
  ];

  const outreachRows: Array<Array<string | number>> = [
    [
      'Contact Type',
      'Normalized Value',
      'Secondary / WhatsApp Link',
      'Associated Business Name',
      'Profession',
      'City',
      'Domain / Line Type',
    ],
  ];

  for (const r of result.filteredRecords) {
    for (const e of r.emails) {
      outreachRows.push([
        'EMAIL',
        e.email,
        `mailto:${e.email}`,
        r.businessName,
        r.professionLabel,
        r.city,
        e.isCorporateDomain ? `Corporate (${e.domain})` : `Webmail (${e.domain})`,
      ]);
    }
    for (const p of r.phones) {
      outreachRows.push([
        'PHONE',
        p.e164,
        p.whatsappUrl,
        r.businessName,
        r.professionLabel,
        r.city,
        `${p.lineType.toUpperCase()} (${p.localDisplay})`,
      ]);
    }
  }

  const encoder = new TextEncoder();
  const files: Array<{ name: string; data: Uint8Array }> = [
    {
      name: '[Content_Types].xml',
      data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`),
    },
    {
      name: '_rels/.rels',
      data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`),
    },
    {
      name: 'xl/workbook.xml',
      data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Summary Metrics" sheetId="1" r:id="rId1"/>
    <sheet name="Business Directory" sheetId="2" r:id="rId2"/>
    <sheet name="Emails and Phones Only" sheetId="3" r:id="rId3"/>
  </sheets>
</workbook>`),
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>
</Relationships>`),
    },
    {
      name: 'xl/worksheets/sheet1.xml',
      data: encoder.encode(buildWorksheetXml(summaryRows)),
    },
    {
      name: 'xl/worksheets/sheet2.xml',
      data: encoder.encode(buildWorksheetXml(directoryRows)),
    },
    {
      name: 'xl/worksheets/sheet3.xml',
      data: encoder.encode(buildWorksheetXml(outreachRows)),
    },
  ];

  let totalLocalSize = 0;
  let totalCentralSize = 0;
  const nameBytesList = files.map((f) => encoder.encode(f.name));
  files.forEach((f, idx) => {
    totalLocalSize += 30 + nameBytesList[idx].length + f.data.length;
    totalCentralSize += 46 + nameBytesList[idx].length;
  });

  const out = new Uint8Array(totalLocalSize + totalCentralSize + 22);
  const view = new DataView(out.buffer);
  let localOffset = 0;
  const localHeaderOffsets: number[] = [];

  files.forEach((f, idx) => {
    localHeaderOffsets.push(localOffset);
    const nameBytes = nameBytesList[idx];
    const crc = computeCrc32(f.data);
    view.setUint32(localOffset, 0x04034b50, true);
    view.setUint16(localOffset + 4, 20, true);
    view.setUint16(localOffset + 6, 0, true);
    view.setUint16(localOffset + 8, 0, true);
    view.setUint16(localOffset + 10, 0, true);
    view.setUint16(localOffset + 12, 0, true);
    view.setUint32(localOffset + 14, crc, true);
    view.setUint32(localOffset + 18, f.data.length, true);
    view.setUint32(localOffset + 22, f.data.length, true);
    view.setUint16(localOffset + 26, nameBytes.length, true);
    view.setUint16(localOffset + 28, 0, true);
    out.set(nameBytes, localOffset + 30);
    out.set(f.data, localOffset + 30 + nameBytes.length);
    localOffset += 30 + nameBytes.length + f.data.length;
  });

  const centralDirStart = localOffset;
  files.forEach((f, idx) => {
    const nameBytes = nameBytesList[idx];
    const crc = computeCrc32(f.data);
    view.setUint32(localOffset, 0x02014b50, true);
    view.setUint16(localOffset + 4, 20, true);
    view.setUint16(localOffset + 6, 20, true);
    view.setUint16(localOffset + 8, 0, true);
    view.setUint16(localOffset + 10, 0, true);
    view.setUint16(localOffset + 12, 0, true);
    view.setUint16(localOffset + 14, 0, true);
    view.setUint32(localOffset + 16, crc, true);
    view.setUint32(localOffset + 20, f.data.length, true);
    view.setUint32(localOffset + 24, f.data.length, true);
    view.setUint16(localOffset + 28, nameBytes.length, true);
    view.setUint16(localOffset + 30, 0, true);
    view.setUint16(localOffset + 32, 0, true);
    view.setUint16(localOffset + 34, 0, true);
    view.setUint16(localOffset + 36, 0, true);
    view.setUint32(localOffset + 38, 0, true);
    view.setUint32(localOffset + 42, localHeaderOffsets[idx], true);
    out.set(nameBytes, localOffset + 46);
    localOffset += 46 + nameBytes.length;
  });

  const centralDirSize = localOffset - centralDirStart;
  view.setUint32(localOffset, 0x06054b50, true);
  view.setUint16(localOffset + 4, 0, true);
  view.setUint16(localOffset + 6, 0, true);
  view.setUint16(localOffset + 8, files.length, true);
  view.setUint16(localOffset + 10, files.length, true);
  view.setUint32(localOffset + 12, centralDirSize, true);
  view.setUint32(localOffset + 16, centralDirStart, true);
  view.setUint16(localOffset + 20, 0, true);

  return out;
}

// ============================================================================
// 13. BUILT-IN INSTANT REALISTIC SAMPLE DATASETS (MULTAN, LAHORE, DUBAI, LONDON)
// ============================================================================

export interface SampleBusinessDataset {
  id: string;
  label: string;
  badge: string;
  cityPresetId: string;
  professionId: string;
  description: string;
  rawPasteSample: string;
}

export const SAMPLE_BUSINESS_DATASETS: SampleBusinessDataset[] = [
  {
    id: 'multan_healthcare_plumbers',
    label: 'Multan — Dental Clinics, Doctors & Plumbers (Mixed Pack)',
    badge: 'Multan, PK (+92 / 061)',
    cityPresetId: 'pk-multan',
    professionId: 'all',
    description:
      'Realistic Multan business directory pack combining Bosan Road & Nishtar Road Dental Clinics, Specialist Doctors, and Gulgasht/Cantt Plumbing & Sanitary services.',
    rawPasteSample: [
      'Al-Shifa Dental & Orthodontic Implant Center | Dental Clinic | Main Bosan Road near Gulgasht Colony, Multan | 061-6524819 | 0300-6314820 | info@alshifadentalmultan.pk | https://alshifadentalmultan.pk',
      'Multan Smile Care & Maxillofacial Clinic | Dentist | Nishtar Road opposite Medical Complex, Multan | 061-4589210 | 0321-6389104 | appointments [at] multansmilecare [dot] com | https://multansmilecare.com',
      'City Heart & Specialist Medical Center (Dr. Kamran Raza FCPS) | Doctors & Polyclinic | Jail Road, Multan Cantt, Multan | 061-4541122 | 0333-6109845 | care@cityheartmultan.org | https://cityheartmultan.org',
      'Buch International Hospital Outpatient Clinic | Hospital & Diagnostics | Buch Executive Villas, Bosan Road, Multan | 061-111-244-685 | 0304-1112446 | helpdesk@buchhospital.com | https://buchhospital.com',
      'Al-Madina Sanitary & Master Plumbing Services | Plumber & Water Tank Fitting | Commercial Area Block B, Shah Rukn-e-Alam Colony, Multan | 0301-7458921 | 061-6774120 | bookings@madinaplumbingmultan.pk',
      'Chenab Quick Drain, Geyser & Sanitary Plumbers | Emergency Plumber | Peer Khurshid Colony & Model Town, Multan | 0306-6398211 | 0345-7120934 | support [at] chenabplumbers [dot] pk',
      'South Punjab Solar & Electrical Engineering Works | Electrician & Solar Installer | Vehari Road Industrial Estate, Multan | 061-6241980 | 0300-8634129 | sales@spsolarmultan.com | https://spsolarmultan.com',
      'Bahauddin Law Associates & Tax Chambers | High Court Advocates & Legal | District Courts Kutchery Road, Multan | 061-4510399 | 0300-6321908 | chambers@bahauddinlaw.pk | https://bahauddinlaw.pk',
    ].join('\n'),
  },
  {
    id: 'lahore_islamabad_it_clinics',
    label: 'Lahore & Islamabad — Software Houses, Dental & Real Estate',
    badge: 'Lahore / Islamabad',
    cityPresetId: 'pk-lahore',
    professionId: 'all',
    description:
      'B2B and healthcare directory sample from Gulberg/DHA Lahore and Blue Area Islamabad featuring IT exporters, dental practices, and real estate firms.',
    rawPasteSample: [
      'NexaCloud Systems & AI Engineering Pvt Ltd | Software House & IT Company | Hali Road, Gulberg III, Lahore | 042-35759120 | 0300-8451209 | partnerships@nexacloud.pk | https://nexacloud.pk',
      'Dental Aesthetics & Implant Studio DHA | Dental Clinic | Commercial Area Phase 5, DHA, Lahore | 042-37184920 | 0322-4098123 | info@dentalaestheticslahore.com | https://dentalaestheticslahore.com',
      'Apex Chartered Accountants & Tax Advisory | Chartered Accountants | Jinnah Avenue, Blue Area, Islamabad | 051-2874190 | 0334-5109284 | tax@apexca.com.pk | https://apexca.com.pk',
      'Prime Crest Properties & DHA Authorized Dealers | Real Estate Agency | Main Boulevard Phase 6, DHA, Lahore | 042-37190044 | 0300-4119822 | sales [at] primecrestlahore [dot] com | https://primecrestlahore.com',
      'Margalla Diagnostic & Family Medical Center | Doctors & Medical Clinic | F-10 Markaz, Islamabad | 051-2104829 | 0312-5591024 | reception@margallamedical.pk | https://margallamedical.pk',
      'CoolBreeze Commercial HVAC & Chiller Services | HVAC & AC Repair | Township Industrial Sector, Lahore | 042-35129088 | 0302-4489120 | service@coolbreezehvac.pk',
    ].join('\n'),
  },
  {
    id: 'dubai_riyadh_b2b_medical',
    label: 'Dubai & Riyadh — PolyClinics, Real Estate & Technical Services',
    badge: 'UAE (+971) & KSA (+966)',
    cityPresetId: 'ae-dubai',
    professionId: 'all',
    description:
      'GCC cross-border directory sample covering Business Bay & Jumeirah Dubai and Olaya Riyadh clinics, maintenance contractors, and property brokers.',
    rawPasteSample: [
      'Emirates Pearl Dental & Orthodontic Polyclinic | Dental Clinic | Jumeirah Beach Road, Dubai | +971 4 394 8210 | +971 50 642 9180 | care@emiratespearldental.ae | https://emiratespearldental.ae',
      'Gulf Horizon Technical & Plumbing Maintenance LLC | Plumber & HVAC Contracting | Al Quoz Industrial Area 3, Dubai | +971 4 338 9104 | +971 55 819 3042 | operations@gulfhorizontech.ae | https://gulfhorizontech.ae',
      'BayView Luxury Real Estate Brokers LLC | Real Estate Agency | Marina Plaza, Dubai Marina, Dubai | +971 4 451 2099 | +971 52 904 1185 | listings@bayviewrealty.ae | https://bayviewrealty.ae',
      'Al-Noor Specialist Medical & Dermatology Center | Doctors & Medical Clinic | King Fahd Road, Al Olaya, Riyadh | +966 11 462 8910 | +966 50 419 8273 | info@alnoormedical.sa | https://alnoormedical.sa',
      'Riyadh Smart Logistics & E-Commerce Fulfillment Co | Logistics & Courier | Exit 18 Industrial City, Riyadh | +966 11 241 9033 | +966 55 310 9844 | b2b@riyadhsmartlogistics.sa | https://riyadhsmartlogistics.sa',
    ].join('\n'),
  },
  {
    id: 'global_us_uk_eu_apac',
    label: 'Global — New York, London, Paris, Berlin, Mumbai & Tokyo Pack',
    badge: 'Global (US / UK / EU / APAC)',
    cityPresetId: 'us-newyork',
    professionId: 'all',
    description:
      'Worldwide multi-country business directory pack covering New York, London, Paris, Berlin, Mumbai, and Tokyo dental clinics, plumbers, law firms, and software studios.',
    rawPasteSample: [
      'Manhattan Premier Dental & Orthodontics | Dental Clinic | 450 Lexington Avenue, Suite 1200, New York City | +1 (212) 555-0194 | appointments@manhattandental.com | https://manhattandental.com',
      'Thames Emergency Plumbing & Heating Ltd | Plumber & HVAC | 88 High Street, Kensington, London | +44 (0) 20 7946 0822 | +44 7700 900412 | service [at] thamesplumbing [dot] co.uk | https://thamesplumbing.co.uk',
      'Clinique Dentaire Haussmann Paris | Dentist | 124 Boulevard Haussmann, Paris | +33 1 42 68 55 10 | +33 6 12 34 56 78 | contact@cliniquehaussmann.fr | https://cliniquehaussmann.fr',
      'SpreeCloud Software & AI Engineering GmbH | Software House & IT | Friedrichstraße 114, Berlin | +49 30 2089 4410 | +49 151 2345 6789 | hello@spreecloud.de | https://spreecloud.de',
      'Bombay Apollo Specialist Polyclinic & Diagnostics | Doctors & Medical Clinic | Linking Road, Bandra West, Mumbai | +91 22 2640 8910 | +91 98201 54321 | care@bombaypolyclinic.in | https://bombaypolyclinic.in',
      'Shibuya Legal & Corporate Chambers | Lawyers & Advocates | 2-24-12 Shibuya, Tokyo | +81 3 5468 9100 | +81 90 1234 5678 | legal@shibuyachambers.jp | https://shibuyachambers.jp',
    ].join('\n'),
  },
];