'use client';

import { useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { jsPDF } from 'jspdf';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import {
  Check,
  Copy,
  Download,
  Image as ImageIcon,
  Link2,
  Mail,
  MessageSquare,
  Phone,
  RotateCcw,
  ShieldCheck,
  Type,
  UserRound,
  Wifi,
  X,
  CalendarDays,
  ScanLine,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Info,
} from 'lucide-react';

export type QrType = 'url' | 'text' | 'wifi' | 'email' | 'phone' | 'sms' | 'contact' | 'event';
export type ErrorLevel = 'L' | 'M' | 'Q' | 'H';
export type ExportFormat = 'png' | 'jpeg' | 'webp' | 'svg' | 'pdf';

export const MAX_CONTENT_CHARS = 2500;
export const MAX_LOGO_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_LOGO_DIMENSION = 4096; // 4096px max width/height to prevent decompression bombs
export const MAX_QR_BYTES = 2953;
export const MIN_RECOMMENDED_QUIET_ZONE = 4;

// Byte-mode capacities for QR versions 1–40.
// Conservative UTF-8 byte capacities per ISO/IEC 18004.
export const QR_BYTE_CAPACITY: Record<ErrorLevel, number[]> = {
  L: [17, 32, 53, 78, 106, 134, 154, 192, 230, 271, 321, 367, 425, 458, 520, 586, 644, 718, 792, 858, 929, 1003, 1091, 1171, 1273, 1367, 1465, 1528, 1628, 1732, 1840, 1952, 2068, 2188, 2303, 2431, 2563, 2699, 2809, 2953],
  M: [14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362, 412, 450, 504, 560, 624, 666, 711, 779, 857, 911, 997, 1059, 1125, 1190, 1264, 1370, 1452, 1538, 1628, 1722, 1809, 1911, 1989, 2099, 2213, 2331],
  Q: [11, 20, 32, 46, 60, 74, 86, 108, 130, 151, 177, 203, 241, 258, 292, 322, 364, 394, 442, 482, 509, 565, 611, 661, 715, 751, 805, 868, 908, 982, 1030, 1112, 1168, 1228, 1283, 1351, 1423, 1499, 1579, 1663],
  H: [7, 14, 24, 34, 44, 58, 64, 84, 98, 119, 137, 155, 177, 194, 220, 250, 280, 310, 338, 382, 403, 439, 461, 511, 535, 593, 625, 658, 698, 742, 790, 842, 898, 958, 983, 1051, 1093, 1139, 1219, 1273],
};

const inputClass = 'w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white transition-colors';
const labelClass = 'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1';

export function escapeWifi(value: string): string {
  return value.replace(/[\\;,:\"]/g, '\\$&');
}

export function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

export function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

export function normalizePhone(value: string): string {
  // Preserve leading +, *, #, and standard extension indicators (p, w, x)
  const trimmed = value.trim();
  const leadingPlus = trimmed.startsWith('+') ? '+' : '';
  const rest = leadingPlus ? trimmed.slice(1) : trimmed;
  const cleaned = rest.replace(/[\s().-]/g, '');
  return `${leadingPlus}${cleaned}`;
}

export function validHex(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export function getLuminance(hex: string): number {
  if (!validHex(hex)) return 0;
  const toLinear = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function contrastRatio(foreground: string, background: string): number {
  if (!validHex(foreground) || !validHex(background)) return 0;
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function isInverted(foreground: string, background: string): boolean {
  if (!validHex(foreground) || !validHex(background)) return false;
  return getLuminance(foreground) > getLuminance(background);
}

export function toIcsDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return '';
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth || hour > 23 || minute > 59) return '';
  return `${match[1]}${match[2]}${match[3]}T${match[4]}${match[5]}00`;
}

export function hashString(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function deterministicIcsStamp(startStr: string, title: string): string {
  const icsDate = toIcsDate(startStr);
  if (icsDate) return icsDate;
  const hash = hashString(title);
  return `20260101T0000${hash.slice(0, 2)}`;
}

export function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

export function estimateQrVersion(bytes: number, level: ErrorLevel): number | null {
  const capacities = QR_BYTE_CAPACITY[level];
  const index = capacities.findIndex((capacity) => bytes <= capacity);
  return index === -1 ? null : index + 1;
}

export type FeasibilityRating = 'optimal' | 'good' | 'caution' | 'critical' | 'unavailable';

export interface ReliabilityReport {
  status: 'ready' | 'unavailable';
  feasibility: FeasibilityRating;
  feasibilityLabel: string;
  score: number | null;
  version: number | null;
  contrastRatio: number;
  contrastRating: 'optimal' | 'good' | 'caution' | 'critical';
  quietZoneRating: 'compliant' | 'warning';
  densityRating: 'low' | 'moderate' | 'high' | 'extreme' | 'over_capacity';
  errorCorrectionRating: 'optimal' | 'standard' | 'minimal' | 'insufficient_for_logo';
  warnings: string[];
  recommendedPrintSizeCm: string;
}

export function getReliabilityReport({
  bytes,
  level,
  marginSize,
  contrast,
  inverted,
  logo,
  logoSize,
  isValidPayload = true,
}: {
  bytes: number;
  level: ErrorLevel;
  marginSize: number;
  contrast: number;
  inverted: boolean;
  logo: boolean;
  logoSize: number;
  isValidPayload?: boolean;
}): ReliabilityReport {
  if (!isValidPayload || bytes <= 0) {
    return {
      status: 'unavailable',
      feasibility: 'unavailable',
      feasibilityLabel: 'Available after generation',
      score: null,
      version: null,
      contrastRatio: contrast,
      contrastRating: contrast >= 7.0 ? 'optimal' : contrast >= 4.5 ? 'good' : contrast >= 3.0 ? 'caution' : 'critical',
      quietZoneRating: marginSize >= MIN_RECOMMENDED_QUIET_ZONE ? 'compliant' : 'warning',
      densityRating: 'low',
      errorCorrectionRating: level === 'H' ? 'optimal' : level === 'Q' ? 'standard' : 'minimal',
      warnings: [],
      recommendedPrintSizeCm: '—',
    };
  }

  const version = estimateQrVersion(bytes, level);
  const warnings: string[] = [];

  // 1. Contrast Dimension (0 to 30 points)
  let contrastPoints = 0;
  let contrastRating: 'optimal' | 'good' | 'caution' | 'critical' = 'critical';
  if (contrast >= 7.0) {
    contrastPoints = 30;
    contrastRating = 'optimal';
  } else if (contrast >= 4.5) {
    contrastPoints = 20;
    contrastRating = 'good';
    warnings.push(`Contrast ratio (${contrast.toFixed(1)}:1) is below the recommended 7.0:1 optimal target. Lighting variations may affect scanning.`);
  } else if (contrast >= 3.0) {
    contrastPoints = 10;
    contrastRating = 'caution';
    warnings.push(`Contrast ratio is marginal (${contrast.toFixed(1)}:1). Some camera sensors in low light will fail.`);
  } else {
    contrastPoints = 0;
    contrastRating = 'critical';
    warnings.push('Contrast ratio is critically low (< 3.0:1). Most physical camera scanners will fail.');
  }

  if (inverted) {
    contrastPoints = Math.max(0, contrastPoints - 10);
    warnings.push('Inverted QR code (light modules on dark background). Some legacy scanners do not support inverted polarity.');
  }

  // 2. Quiet Zone Dimension (0 to 15 points)
  let marginPoints = 0;
  let quietZoneRating: 'compliant' | 'warning' = 'warning';
  if (marginSize >= MIN_RECOMMENDED_QUIET_ZONE) {
    marginPoints = 15;
    quietZoneRating = 'compliant';
  } else if (marginSize >= 2) {
    marginPoints = 5;
    warnings.push(`Quiet zone (${marginSize} modules) is below the ISO/IEC 18004 4-module standard. Adjacent graphics may impair finder pattern detection.`);
  } else {
    marginPoints = 0;
    warnings.push(`Quiet zone is virtually absent (${marginSize} modules). Scanners require a blank border to isolate the matrix.`);
  }

  // 3. Error Correction & Logo Area Occlusion Dimension (0 to 25 points)
  let errorPoints = 0;
  let errorCorrectionRating: 'optimal' | 'standard' | 'minimal' | 'insufficient_for_logo' = 'standard';
  if (level === 'H') {
    if (!logo) {
      errorPoints = 25;
      errorCorrectionRating = 'optimal';
    } else if (logoSize <= 20) {
      errorPoints = 20;
      errorCorrectionRating = 'optimal';
    } else if (logoSize <= 24) {
      errorPoints = 14;
      errorCorrectionRating = 'standard';
      warnings.push(`Logo size (${logoSize}%) covers significant area. Keep under 20% for optimal recovery margin.`);
    } else {
      errorPoints = 8;
      errorCorrectionRating = 'standard';
      warnings.push(`Logo size (${logoSize}%) approaches the 30% Level H recovery limit.`);
    }
  } else if (level === 'Q') {
    if (!logo) {
      errorPoints = 22;
      errorCorrectionRating = 'standard';
    } else {
      errorPoints = 10;
      errorCorrectionRating = 'insufficient_for_logo';
      warnings.push('Center logo with Level Q error correction. High (H) error correction is strongly advised to maintain redundancy.');
    }
  } else if (level === 'M') {
    if (!logo) {
      errorPoints = 18;
      errorCorrectionRating = 'standard';
    } else {
      errorPoints = 4;
      errorCorrectionRating = 'insufficient_for_logo';
      warnings.push('Center logo present with Level M (~15% recovery). The logo consumes all parity margin; scan failure risk is high.');
    }
  } else { // Level L
    if (!logo) {
      errorPoints = 12;
      errorCorrectionRating = 'minimal';
      warnings.push('Level L provides only ~7% error correction. Any surface smudge or damage will cause scan failure.');
    } else {
      errorPoints = 0;
      errorCorrectionRating = 'insufficient_for_logo';
      warnings.push('Center logo with Level L error correction. Data recovery margin is completely exhausted.');
    }
  }

  // 4. Matrix Density & Physical Scale Dimension (0 to 30 points)
  let densityPoints = 0;
  let densityRating: 'low' | 'moderate' | 'high' | 'extreme' | 'over_capacity' = 'low';
  if (!version) {
    densityPoints = 0;
    densityRating = 'over_capacity';
    warnings.push('Payload exceeds conservative QR byte capacity. Reduce content length or lower error correction.');
  } else if (version <= 5) {
    densityPoints = 30;
    densityRating = 'low';
  } else if (version <= 10) {
    densityPoints = 26;
    densityRating = 'moderate';
  } else if (version <= 20) {
    densityPoints = 20;
    densityRating = 'moderate';
  } else if (version <= 30) {
    densityPoints = 14;
    densityRating = 'high';
    warnings.push(`High density (V${version}). Requires larger physical print dimensions (min 5.0 cm / 2.0 in) and sharp print resolution.`);
  } else {
    densityPoints = 8;
    densityRating = 'extreme';
    warnings.push(`Very high density (V${version}). Difficult for budget camera sensors to resolve unless printed large (min 6.5 cm).`);
  }

  const rawScore = contrastPoints + marginPoints + errorPoints + densityPoints;

  // Crucial: Software cannot validate physical environment (lighting, lens quality, sensor autofocus, print surface).
  // Therefore, the maximum heuristic score is capped at 95 to prevent misleading 100/100 guarantees.
  const MAX_HEURISTIC_SCORE = 95;
  const clampedScore = !version ? 0 : Math.min(MAX_HEURISTIC_SCORE, Math.max(0, Math.round(rawScore)));

  let feasibility: FeasibilityRating = 'critical';
  let feasibilityLabel = 'Critical Risk';
  if (clampedScore >= 85) {
    feasibility = 'optimal';
    feasibilityLabel = 'Optimal';
  } else if (clampedScore >= 70) {
    feasibility = 'good';
    feasibilityLabel = 'Good';
  } else if (clampedScore >= 50) {
    feasibility = 'caution';
    feasibilityLabel = 'Caution';
  } else {
    feasibility = 'critical';
    feasibilityLabel = 'High Risk';
  }

  // Recommended print size based on version density (10:1 distance rule with 0.5mm module threshold)
  let printSize = '2.5 cm (1.0 in)';
  if (version) {
    if (version >= 25) printSize = '6.0 cm (2.4 in)';
    else if (version >= 15) printSize = '4.5 cm (1.8 in)';
    else if (version >= 7) printSize = '3.5 cm (1.4 in)';
  }

  return {
    status: 'ready',
    feasibility,
    feasibilityLabel,
    score: clampedScore,
    version,
    contrastRatio: contrast,
    contrastRating,
    quietZoneRating,
    densityRating,
    errorCorrectionRating,
    warnings,
    recommendedPrintSizeCm: printSize,
  };
}

export function validateQrInput({
  qrType,
  url,
  text,
  wifiSsid,
  wifiPass,
  wifiEnc,
  email,
  phone,
  sms,
  contactFirst,
  contactLast,
  contactPhone,
  contactEmail,
  contactOrg,
  contactUrl,
  eventTitle,
  eventStart,
  eventEnd,
  fgColor,
  bgColor,
  marginSize,
}: {
  qrType: QrType;
  url: string;
  text: string;
  wifiSsid: string;
  wifiPass: string;
  wifiEnc: 'WPA' | 'WEP' | 'nopass';
  email: string;
  phone: string;
  sms: string;
  contactFirst: string;
  contactLast: string;
  contactPhone: string;
  contactEmail: string;
  contactOrg: string;
  contactUrl: string;
  eventTitle: string;
  eventStart: string;
  eventEnd: string;
  fgColor: string;
  bgColor: string;
  marginSize: number;
}): string | null {
  if (!validHex(fgColor) || !validHex(bgColor)) {
    return 'Use valid 6-digit HEX colors (e.g. #000000).';
  }
  if (contrastRatio(fgColor, bgColor) < 3.0) {
    return 'Foreground and background contrast ratio is too low (< 3.0:1) for readable scanning.';
  }
  if (marginSize < 0 || !Number.isInteger(marginSize)) {
    return 'Quiet zone must be a non-negative integer of modules.';
  }

  if (qrType === 'url') {
    const trimmed = url.trim();
    if (!trimmed) return 'Enter a website URL to generate a QR code.';
    try {
      const parsed = new URL(trimmed);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return 'URL must use http:// or https:// protocol.';
      }
    } catch {
      return 'Enter a valid website URL (e.g. https://example.com).';
    }
    return null;
  }

  if (qrType === 'text') {
    if (!text.trim()) return 'Enter plain text content to generate a QR code.';
    if (text.length > MAX_CONTENT_CHARS) {
      return `Text exceeds maximum allowed length of ${MAX_CONTENT_CHARS} characters.`;
    }
    return null;
  }

  if (qrType === 'wifi') {
    if (!wifiSsid.trim()) return 'Enter a Wi-Fi network name (SSID).';
    if (/[\r\n]/.test(`${wifiSsid}${wifiPass}`)) {
      return 'Wi-Fi network name and password cannot contain line breaks.';
    }
    if (wifiEnc !== 'nopass' && !wifiPass) {
      return 'Enter a password for the secured Wi-Fi network.';
    }
    return null;
  }

  if (qrType === 'email') {
    const trimmed = email.trim();
    if (!trimmed) return 'Enter an email recipient address.';
    if (/[\r\n]/.test(trimmed)) return 'Email address cannot contain line breaks.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return 'Enter a valid email address (e.g. name@example.com).';
    }
    return null;
  }

  if (qrType === 'phone') {
    const trimmed = phone.trim();
    if (!trimmed) return 'Enter a phone number to dial.';
    if (!/^[+*#0-9][+*#0-9xXpPwW\s().-]{2,}$/.test(trimmed)) {
      return 'Enter a valid telephone number with digits and standard dial symbols (+, *, #).';
    }
    return null;
  }

  if (qrType === 'sms') {
    const trimmed = sms.trim();
    if (!trimmed) return 'Enter a recipient phone number for SMS.';
    if (!/^[+*#0-9][+*#0-9xXpPwW\s().-]{2,}$/.test(trimmed)) {
      return 'Enter a valid phone number for SMS.';
    }
    return null;
  }

  if (qrType === 'contact') {
    if (!contactFirst.trim() && !contactLast.trim() && !contactPhone.trim() && !contactEmail.trim() && !contactOrg.trim()) {
      return 'Add at least one contact field (name, phone, email, or organization).';
    }
    if (contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      return 'Enter a valid contact email address.';
    }
    if (contactUrl.trim()) {
      try {
        const parsed = new URL(contactUrl.trim());
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          return 'Contact website URL must use http:// or https://.';
        }
      } catch {
        return 'Enter a valid contact website URL.';
      }
    }
    return null;
  }

  if (qrType === 'event') {
    if (!eventTitle.trim()) return 'Enter an event title to generate a QR code.';
    if (!eventStart || !eventEnd) return 'Enter both event start and end dates and times.';
    if (!toIcsDate(eventStart) || !toIcsDate(eventEnd)) return 'Enter valid event dates and times.';
    if (new Date(eventEnd).getTime() <= new Date(eventStart).getTime()) {
      return 'Event end time must be chronologically after the start time.';
    }
    return null;
  }

  return null;
}

export function buildQrPayload({
  qrType,
  url,
  text,
  wifiSsid,
  wifiPass,
  wifiEnc,
  wifiHidden,
  email,
  emailSub,
  emailBody,
  phone,
  sms,
  smsBody,
  contactFirst,
  contactLast,
  contactPhone,
  contactEmail,
  contactOrg,
  contactUrl,
  eventTitle,
  eventLocation,
  eventStart,
  eventEnd,
  eventDescription,
}: {
  qrType: QrType;
  url: string;
  text: string;
  wifiSsid: string;
  wifiPass: string;
  wifiEnc: 'WPA' | 'WEP' | 'nopass';
  wifiHidden: boolean;
  email: string;
  emailSub: string;
  emailBody: string;
  phone: string;
  sms: string;
  smsBody: string;
  contactFirst: string;
  contactLast: string;
  contactPhone: string;
  contactEmail: string;
  contactOrg: string;
  contactUrl: string;
  eventTitle: string;
  eventLocation: string;
  eventStart: string;
  eventEnd: string;
  eventDescription: string;
}): string {
  if (qrType === 'url') return canonicalizeUrl(url);
  if (qrType === 'text') return text;

  if (qrType === 'wifi') {
    const type = wifiEnc === 'nopass' ? 'nopass' : wifiEnc;
    const pass = wifiEnc === 'nopass' ? '' : escapeWifi(wifiPass);
    return `WIFI:T:${type};S:${escapeWifi(wifiSsid)};P:${pass};H:${wifiHidden ? 'true' : 'false'};;`;
  }

  if (qrType === 'email') {
    const address = email.trim();
    const params: string[] = [];
    if (emailSub) params.push(`subject=${encodeURIComponent(emailSub)}`);
    if (emailBody) params.push(`body=${encodeURIComponent(emailBody)}`);
    return `mailto:${address}${params.length ? `?${params.join('&')}` : ''}`;
  }

  if (qrType === 'phone') {
    return `tel:${normalizePhone(phone)}`;
  }

  if (qrType === 'sms') {
    const number = normalizePhone(sms);
    return `sms:${number}${smsBody ? `?body=${encodeURIComponent(smsBody)}` : ''}`;
  }

  if (qrType === 'contact') {
    const fullName = `${contactFirst} ${contactLast}`.trim();
    return [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${escapeVCard(contactLast)};${escapeVCard(contactFirst)};;;`,
      `FN:${escapeVCard(fullName)}`,
      contactPhone.trim() ? `TEL:${normalizePhone(contactPhone)}` : '',
      contactEmail.trim() ? `EMAIL:${contactEmail.trim()}` : '',
      contactOrg.trim() ? `ORG:${escapeVCard(contactOrg)}` : '',
      contactUrl.trim() ? `URL:${canonicalizeUrl(contactUrl)}` : '',
      'END:VCARD',
    ].filter(Boolean).join('\r\n');
  }

  const start = toIcsDate(eventStart);
  const end = toIcsDate(eventEnd);
  const dtstamp = deterministicIcsStamp(eventStart, eventTitle);
  const uidHash = hashString(`${eventTitle}|${eventLocation}|${eventStart}|${eventEnd}|${eventDescription}`);

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//KivaroTools//QR Generator//EN',
    'BEGIN:VEVENT',
    `UID:${uidHash}@kivarotools`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcs(eventTitle)}`,
    eventLocation.trim() ? `LOCATION:${escapeIcs(eventLocation)}` : '',
    eventDescription.trim() ? `DESCRIPTION:${escapeIcs(eventDescription)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
}

export function canonicalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return trimmed;
    }
    return parsed.href;
  } catch {
    return trimmed;
  }
}

export function sanitizeFilename(name: string, fallback: string): string {
  if (!name || typeof name !== 'string') return fallback;
  const cleaned = name
    .normalize('NFC')
    .replace(/\.\.+/g, '_')
    .replace(/[/\\]/g, '_')
    .replace(/[<>:"|?*\u0000-\u001F\u007F]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+/, '')
    .trim()
    .replace(/[._]+$/, '');
  return cleaned || fallback;
}

export default function QrGenerator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  // Accessible Form Control IDs
  const contentInputId = useId();
  const sizeInputId = useId();
  const fgColorId = useId();
  const bgColorId = useId();
  const levelSelectId = useId();
  const formatSelectId = useId();
  const marginInputId = useId();
  const logoSizeId = useId();
  const logoOpacityId = useId();

  // Content state
  const [qrType, setQrType] = useState<QrType>('url');
  const [url, setUrl] = useState('https://kivarotools.com');
  const [text, setText] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiEnc, setWifiEnc] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSub, setEmailSub] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [phone, setPhone] = useState('');
  const [sms, setSms] = useState('');
  const [smsBody, setSmsBody] = useState('');
  const [contactFirst, setContactFirst] = useState('');
  const [contactLast, setContactLast] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactOrg, setContactOrg] = useState('');
  const [contactUrl, setContactUrl] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  // Design state
  const [size, setSize] = useState(500);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [level, setLevel] = useState<ErrorLevel>('M');
  const [marginSize, setMarginSize] = useState(4);
  const [boostLevel, setBoostLevel] = useState(true);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');

  // Logo state
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoName, setLogoName] = useState('');
  const [logoSize, setLogoSize] = useState(20);
  const [logoOpacity, setLogoOpacity] = useState(100);

  // Status & interactive UI states
  const [status, setStatus] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showReliability, setShowReliability] = useState(false);
  const [showDisclosures, setShowDisclosures] = useState(false);

  // Verification state: idle | verifying | verified | mismatch | not_detected | unsupported | error
  const [verificationResult, setVerificationResult] = useState<{
    status: 'idle' | 'verifying' | 'verified' | 'mismatch' | 'not_detected' | 'unsupported' | 'error';
    message: string;
    snapshotHash?: string;
  }>({ status: 'idle', message: '' });

  // Browser BarcodeDetector detection using useSyncExternalStore (0 cascading renders)
  const isDetectorSupported = useSyncExternalStore(
    () => () => {},
    () => typeof window !== 'undefined' && 'BarcodeDetector' in window,
    () => false
  );

  // 1. Comprehensive Input Validation
  const inputValidationError = useMemo(() => {
    return validateQrInput({
      qrType,
      url,
      text,
      wifiSsid,
      wifiPass,
      wifiEnc,
      email,
      phone,
      sms,
      contactFirst,
      contactLast,
      contactPhone,
      contactEmail,
      contactOrg,
      contactUrl,
      eventTitle,
      eventStart,
      eventEnd,
      fgColor,
      bgColor,
      marginSize,
    });
  }, [
    qrType, url, text, wifiSsid, wifiPass, wifiEnc,
    email, phone, sms,
    contactFirst, contactLast, contactPhone, contactEmail, contactOrg, contactUrl,
    eventTitle, eventStart, eventEnd,
    fgColor, bgColor, marginSize,
  ]);

  // 2. Exact QR Payload Generator — only builds when inputs are strictly valid!
  const qrValue = useMemo(() => {
    if (inputValidationError) return '';
    return buildQrPayload({
      qrType,
      url,
      text,
      wifiSsid,
      wifiPass,
      wifiEnc,
      wifiHidden,
      email,
      emailSub,
      emailBody,
      phone,
      sms,
      smsBody,
      contactFirst,
      contactLast,
      contactPhone,
      contactEmail,
      contactOrg,
      contactUrl,
      eventTitle,
      eventLocation,
      eventStart,
      eventEnd,
      eventDescription,
    });
  }, [
    inputValidationError,
    qrType, url, text, wifiSsid, wifiPass, wifiEnc, wifiHidden,
    email, emailSub, emailBody, phone, sms, smsBody,
    contactFirst, contactLast, contactPhone, contactEmail, contactOrg, contactUrl,
    eventTitle, eventLocation, eventStart, eventEnd, eventDescription,
  ]);

  const qrBytes = useMemo(() => (qrValue ? utf8ByteLength(qrValue) : 0), [qrValue]);
  const estimatedVersion = useMemo(() => (qrBytes > 0 ? estimateQrVersion(qrBytes, level) : null), [qrBytes, level]);
  const scanContrast = useMemo(() => contrastRatio(fgColor, bgColor), [fgColor, bgColor]);
  const qrIsInverted = useMemo(() => isInverted(fgColor, bgColor), [fgColor, bgColor]);
  const hasLogo = Boolean(logoDataUrl);
  const logoWarning = hasLogo && level !== 'H';

  // Capacity validation
  const capacityError = useMemo(() => {
    if (!qrValue) return null;
    if (qrBytes > MAX_QR_BYTES) {
      return `Payload is too large for QR generation (${qrBytes.toLocaleString()} UTF-8 bytes). Shorten content or reduce error correction.`;
    }
    if (!estimatedVersion) {
      return 'Payload length exceeds the maximum QR byte capacity for this error correction level.';
    }
    return null;
  }, [qrValue, qrBytes, estimatedVersion]);

  const validationError = inputValidationError || capacityError;
  const isReady = !validationError && Boolean(qrValue);

  // Honest Scan Reliability Report (status: 'unavailable' and score: null when no QR is generated)
  const reliability = useMemo(() => getReliabilityReport({
    bytes: qrBytes,
    level,
    marginSize,
    contrast: scanContrast,
    inverted: qrIsInverted,
    logo: hasLogo,
    logoSize,
    isValidPayload: isReady,
  }), [qrBytes, level, marginSize, scanContrast, qrIsInverted, hasLogo, logoSize, isReady]);

  // Current visual snapshot hash for invalidating stale verification
  const currentSnapshotHash = useMemo(() => {
    if (!isReady) return '';
    return hashString(`${qrValue}|${fgColor}|${bgColor}|${level}|${marginSize}|${logoDataUrl || ''}|${logoSize}|${logoOpacity}`);
  }, [isReady, qrValue, fgColor, bgColor, level, marginSize, logoDataUrl, logoSize, logoOpacity]);

  // Reactive verification: if snapshot changed or not ready, drop verified state
  const activeVerification = useMemo(() => {
    if (!isReady || verificationResult.status === 'idle') return null;
    if (verificationResult.snapshotHash && verificationResult.snapshotHash !== currentSnapshotHash) {
      return {
        status: 'idle' as const,
        message: 'Settings or content modified since last verification.',
      };
    }
    return verificationResult;
  }, [isReady, verificationResult, currentSnapshotHash]);

  const tabs = [
    { id: 'url', icon: Link2, label: 'URL' },
    { id: 'text', icon: Type, label: 'Plain Text' },
    { id: 'wifi', icon: Wifi, label: 'Wi-Fi' },
    { id: 'email', icon: Mail, label: 'Email' },
    { id: 'phone', icon: Phone, label: 'Phone' },
    { id: 'sms', icon: MessageSquare, label: 'SMS' },
    { id: 'contact', icon: UserRound, label: 'Contact (vCard)' },
    { id: 'event', icon: CalendarDays, label: 'Event (ICS)' },
  ] as const;

  const handleTypeChange = (type: QrType) => {
    setQrType(type);
    setStatus('');
  };

  const resetDesign = () => {
    setSize(500);
    setFgColor('#000000');
    setBgColor('#ffffff');
    setLevel('M');
    setMarginSize(4);
    setBoostLevel(true);
    setLogoDataUrl(null);
    setLogoName('');
    setLogoSize(20);
    setLogoOpacity(100);
    setExportFormat('png');
    setStatus('Design options reset to defaults.');
    setVerificationResult({ status: 'idle', message: '' });
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setStatus('Logo must be a PNG, JPEG, or WebP image.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_LOGO_BYTES) {
      setStatus('Logo must be 5 MB or smaller.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);

      // Validate image dimensions to guard against memory exhaustion
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth > MAX_LOGO_DIMENSION || img.naturalHeight > MAX_LOGO_DIMENSION) {
          setStatus(`Logo dimensions (${img.naturalWidth}×${img.naturalHeight}px) exceed maximum allowed size of ${MAX_LOGO_DIMENSION}px.`);
          if (logoInputRef.current) logoInputRef.current.value = '';
          return;
        }

        setLogoDataUrl(dataUrl);
        setLogoName(file.name);
        setLevel('H'); // Auto-promote to High error correction
        setStatus('Logo loaded. High (H) error correction enabled.');
      };
      img.onerror = () => {
        setStatus('Unable to decode the uploaded image file.');
        if (logoInputRef.current) logoInputRef.current.value = '';
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      setStatus('Could not read the uploaded image file.');
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoDataUrl(null);
    setLogoName('');
    if (logoInputRef.current) logoInputRef.current.value = '';
    setStatus('Center logo removed.');
  };

  const downloadBlob = (blob: Blob, extension: string) => {
    const urlObject = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = `KivaroTools_QR_${qrType}_${new Date().toISOString().slice(0, 10)}.${extension}`;
    a.href = urlObject;
    a.download = sanitizeFilename(safeName, `qr-code.${extension}`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => {
      try {
        URL.revokeObjectURL(urlObject);
      } catch {}
    }, 1500);
  };

  const exportSvg = () => {
    if (!svgRef.current) {
      setStatus('SVG preview element not ready.');
      return;
    }
    try {
      const clone = svgRef.current.cloneNode(true) as SVGSVGElement;
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('width', String(size));
      clone.setAttribute('height', String(size));

      // Sanitize: ensure no external script or event handlers
      const scripts = clone.querySelectorAll('script');
      scripts.forEach((s) => s.remove());

      const serializer = new XMLSerializer();
      const svgText = `<?xml version="1.0" encoding="UTF-8"?>\n${serializer.serializeToString(clone)}`;
      const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      downloadBlob(blob, 'svg');
      setStatus('SVG vector downloaded.');
    } catch {
      setStatus('Failed to serialize SVG vector output.');
    }
  };

  const exportRaster = (format: Exclude<ExportFormat, 'svg' | 'pdf'>) => {
    const sourceCanvas = canvasRef.current;
    if (!sourceCanvas) {
      setStatus('QR canvas is not ready.');
      return;
    }

    setIsExporting(true);

    try {
      // Create offscreen canvas to guarantee exact dimensions and solid background for JPEG
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = size;
      exportCanvas.height = size;
      const ctx = exportCanvas.getContext('2d');

      if (!ctx) {
        setStatus('Could not create export canvas context.');
        setIsExporting(false);
        return;
      }

      // Draw solid background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);

      // Draw the rendered QR canvas
      ctx.drawImage(sourceCanvas, 0, 0, size, size);

      const mime = format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/webp';
      const quality = format === 'png' ? undefined : 0.95;

      exportCanvas.toBlob(
        (blob) => {
          setIsExporting(false);
          if (blob && blob.size > 0) {
            downloadBlob(blob, format);
            setStatus(`${format.toUpperCase()} image downloaded.`);
          } else {
            setStatus('Export generation failed.');
          }
        },
        mime,
        quality
      );
    } catch {
      setIsExporting(false);
      setStatus('An error occurred during raster image export.');
    }
  };

  const exportPdf = () => {
    const sourceCanvas = canvasRef.current;
    if (!sourceCanvas) {
      setStatus('QR canvas is not ready.');
      return;
    }

    setIsExporting(true);

    try {
      const renderSize = Math.max(1000, size);
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = renderSize;
      exportCanvas.height = renderSize;
      const ctx = exportCanvas.getContext('2d');

      if (!ctx) {
        setStatus('Could not create canvas context for PDF export.');
        setIsExporting(false);
        return;
      }

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, renderSize, renderSize);
      ctx.drawImage(sourceCanvas, 0, 0, renderSize, renderSize);

      const qrDataUrl = exportCanvas.toDataURL('image/png');

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Page header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(30, 41, 59);
      doc.text('KivaroTools QR Code', 105, 28, { align: 'center' });

      // Subheading / Type
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      const displayPayload = qrValue.length > 70 ? `${qrValue.slice(0, 67)}...` : qrValue;
      doc.text(`Type: ${qrType.toUpperCase()} • Payload: ${displayPayload}`, 105, 36, { align: 'center' });

      // QR Image centered on A4 (width 120mm x 120mm, A4 width is 210mm => x = (210 - 120) / 2 = 45mm)
      const qrMm = 120;
      const xPos = (210 - qrMm) / 2;
      const yPos = 48;
      doc.addImage(qrDataUrl, 'PNG', xPos, yPos, qrMm, qrMm);

      // Print specifications / guidance box
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(25, yPos + qrMm + 12, 160, 48, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text('Print & Scannability Guidelines', 32, yPos + qrMm + 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`• Error Correction: Level ${level} | Contrast: ${scanContrast ? `${scanContrast.toFixed(1)}:1` : 'Standard'}`, 32, yPos + qrMm + 27);
      doc.text('• Maintain the quiet zone (border margin) when cutting, framing, or placing on signage.', 32, yPos + qrMm + 33);
      doc.text('• Test scanning with multiple smartphone cameras under standard ambient lighting before batch printing.', 32, yPos + qrMm + 39);
      doc.text('• 100% Static QR Code: Permanently decodes directly to payload. No intermediary redirect or expiry.', 32, yPos + qrMm + 45);
      doc.text('• Recommended Print Sizing: ' + reliability.recommendedPrintSizeCm + ' for reliable reading distance.', 32, yPos + qrMm + 51);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Generated with KivaroTools • https://kivarotools.com/seo/qr-generator', 105, 282, { align: 'center' });

      const pdfBlob = doc.output('blob');
      setIsExporting(false);
      downloadBlob(pdfBlob, 'pdf');
      setStatus('Print-ready PDF document downloaded.');
    } catch {
      setIsExporting(false);
      setStatus('Failed to generate PDF document.');
    }
  };

  const downloadQR = () => {
    if (!isReady) {
      setStatus(validationError || 'Generate a valid QR code before downloading.');
      return;
    }
    if (isExporting) return;

    setStatus('');
    if (exportFormat === 'svg') {
      exportSvg();
    } else if (exportFormat === 'pdf') {
      exportPdf();
    } else {
      exportRaster(exportFormat);
    }
  };

  const copyImage = async () => {
    if (!isReady) {
      setStatus(validationError || 'Generate a valid QR code before copying.');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas || typeof navigator === 'undefined' || !navigator.clipboard || typeof ClipboardItem === 'undefined') {
      setStatus('Direct image clipboard copying is not supported in this browser.');
      return;
    }

    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) {
        setStatus('Could not prepare the QR image for copying.');
        return;
      }
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setStatus('QR image copied to clipboard.');
    } catch {
      setStatus('Clipboard copy was blocked or denied by browser security.');
    }
  };

  const copyData = async () => {
    if (!isReady) {
      setStatus(validationError || 'Generate a valid QR code before copying payload.');
      return;
    }
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setStatus('Clipboard is unavailable in this environment.');
      return;
    }
    try {
      await navigator.clipboard.writeText(qrValue);
      setStatus('QR payload copied to clipboard.');
    } catch {
      setStatus('Clipboard permission was denied.');
    }
  };

  const verifyGeneratedQr = async () => {
    if (!isReady) {
      setVerificationResult({ status: 'error', message: validationError || 'Generate a valid QR code before verifying payload.' });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      setVerificationResult({ status: 'error', message: 'QR preview canvas is not ready.' });
      return;
    }

    setIsVerifying(true);
    try {
      let decoded = '';

      // 1. Try hardware-accelerated BarcodeDetector if available
      const BarcodeDetectorCtor = (window as Window & {
        BarcodeDetector?: new (options?: { formats?: string[] }) => {
          detect(source: CanvasImageSource): Promise<Array<{ rawValue?: string }>>;
        };
      }).BarcodeDetector;

      if (BarcodeDetectorCtor) {
        try {
          const detector = new BarcodeDetectorCtor({ formats: ['qr_code'] });
          const results = await detector.detect(canvas);
          if (results.length && results[0]?.rawValue) {
            decoded = results[0].rawValue;
          }
        } catch {
          // Fall back to software decoder
        }
      }

      // 2. If not detected yet, use software jsQR engine
      if (!decoded) {
        try {
          const jsQR = (await import('jsqr')).default;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const res = jsQR(imgData.data, imgData.width, imgData.height);
            if (res && res.data) {
              decoded = res.data;
            }
          }
        } catch {
          // Dynamic import or decoding error
        }
      }

      if (!decoded) {
        setVerificationResult({
          status: 'not_detected',
          message: 'No QR code could be detected in the preview. Try increasing contrast or reducing logo size.',
          snapshotHash: currentSnapshotHash,
        });
        return;
      }

      if (decoded === qrValue) {
        setVerificationResult({
          status: 'verified',
          message: 'Verified: Decoded exact payload matching the generated QR code.',
          snapshotHash: currentSnapshotHash,
        });
      } else {
        setVerificationResult({
          status: 'mismatch',
          message: 'Decoded data differs from expected payload.',
          snapshotHash: currentSnapshotHash,
        });
      }
    } catch {
      setVerificationResult({
        status: 'error',
        message: 'Scanner engine threw an execution error during verification attempt.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div id="qr-generator-tool" className="flex flex-col gap-8">
      {/* 1. TOP PRIVACY BADGE */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 px-4 py-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-semibold">Local Processing Only</span>
          <span className="hidden sm:inline text-emerald-700 dark:text-emerald-400">·</span>
          <span className="text-emerald-700 dark:text-emerald-400">QR generation and image processing stay in your browser. QR content is not uploaded by this tool.</span>
        </div>
      </div>

      {/* 2. MAIN TOOL WORKSPACE */}
      <div className="space-y-8">
        {/* QR TYPE TABS */}
        <div
          role="tablist"
          aria-label="QR Code Type Selection"
          className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-gray-200 dark:border-slate-700 w-full"
        >
          {tabs.map((type) => {
            const Icon = type.icon;
            const isSelected = qrType === type.id;
            return (
              <button
                key={type.id}
                id={`tab-${type.id}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls="panel-qr-content"
                onClick={() => handleTypeChange(type.id)}
                className={`w-full min-w-0 h-11 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{type.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* LEFT COLUMN: Controls & Data Input */}
          <div className="space-y-6">
            {/* CONTENT DATA PANEL */}
          <div
            id="panel-qr-content"
            role="tabpanel"
            aria-labelledby={`tab-${qrType}`}
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4"
          >
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-3">
              <span>Enter {tabs.find((t) => t.id === qrType)?.label} Data</span>
            </h3>

            {/* URL */}
            {qrType === 'url' && (
              <div>
                <label htmlFor={contentInputId} className={labelClass}>Website URL</label>
                <input
                  id={contentInputId}
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className={inputClass}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  Must use http:// or https:// protocol. Unicode domains and query parameters are preserved.
                </p>
              </div>
            )}

            {/* Plain Text */}
            {qrType === 'text' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor={contentInputId} className={labelClass}>Text Content</label>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{text.length}/{MAX_CONTENT_CHARS} chars</span>
                </div>
                <textarea
                  id={contentInputId}
                  rows={5}
                  maxLength={MAX_CONTENT_CHARS}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text, instructions, or notes..."
                  className={inputClass}
                />
              </div>
            )}

            {/* Wi-Fi */}
            {qrType === 'wifi' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="wifi-ssid-input" className={labelClass}>Network Name (SSID)</label>
                  <input
                    id="wifi-ssid-input"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    placeholder="MyHomeNetwork"
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="wifi-pass-input" className={labelClass}>Password</label>
                    <input
                      id="wifi-pass-input"
                      type="password"
                      value={wifiPass}
                      onChange={(e) => setWifiPass(e.target.value)}
                      disabled={wifiEnc === 'nopass'}
                      placeholder={wifiEnc === 'nopass' ? 'Open Network' : 'Network Password'}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="wifi-enc-select" className={labelClass}>Encryption Type</label>
                    <select
                      id="wifi-enc-select"
                      value={wifiEnc}
                      onChange={(e) => setWifiEnc(e.target.value as typeof wifiEnc)}
                      className={inputClass}
                    >
                      <option value="WPA">WPA / WPA2 / WPA3</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None (Open)</option>
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wifiHidden}
                    onChange={(e) => setWifiHidden(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Hidden Network (SSID not broadcast)</span>
                </label>
              </div>
            )}

            {/* Email */}
            {qrType === 'email' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="email-addr-input" className={labelClass}>Email Address</label>
                  <input
                    id="email-addr-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@example.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="email-sub-input" className={labelClass}>Subject Line</label>
                  <input
                    id="email-sub-input"
                    value={emailSub}
                    onChange={(e) => setEmailSub(e.target.value)}
                    placeholder="Inquiry regarding..."
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="email-body-input" className={labelClass}>Message Body</label>
                  <textarea
                    id="email-body-input"
                    rows={4}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Hello..."
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {/* Phone */}
            {qrType === 'phone' && (
              <div>
                <label htmlFor="phone-number-input" className={labelClass}>Phone Number</label>
                <input
                  id="phone-number-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className={inputClass}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  Standard international notation (e.g. +1 555 123 4567) or local dial numbers.
                </p>
              </div>
            )}

            {/* SMS */}
            {qrType === 'sms' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="sms-phone-input" className={labelClass}>Recipient Number</label>
                  <input
                    id="sms-phone-input"
                    type="tel"
                    value={sms}
                    onChange={(e) => setSms(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="sms-body-input" className={labelClass}>SMS Text Message</label>
                  <textarea
                    id="sms-body-input"
                    rows={4}
                    value={smsBody}
                    onChange={(e) => setSmsBody(e.target.value)}
                    placeholder="Message to prefill..."
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {/* Contact / vCard */}
            {qrType === 'contact' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-first-input" className={labelClass}>First Name</label>
                    <input
                      id="contact-first-input"
                      value={contactFirst}
                      onChange={(e) => setContactFirst(e.target.value)}
                      placeholder="Jane"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-last-input" className={labelClass}>Last Name</label>
                    <input
                      id="contact-last-input"
                      value={contactLast}
                      onChange={(e) => setContactLast(e.target.value)}
                      placeholder="Doe"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-phone-input" className={labelClass}>Phone</label>
                    <input
                      id="contact-phone-input"
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email-input" className={labelClass}>Email</label>
                    <input
                      id="contact-email-input"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="jane.doe@example.com"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-org-input" className={labelClass}>Organization</label>
                  <input
                    id="contact-org-input"
                    value={contactOrg}
                    onChange={(e) => setContactOrg(e.target.value)}
                    placeholder="Acme Corp"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="contact-url-input" className={labelClass}>Website URL</label>
                  <input
                    id="contact-url-input"
                    type="url"
                    value={contactUrl}
                    onChange={(e) => setContactUrl(e.target.value)}
                    placeholder="https://example.com"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {/* Event / iCalendar */}
            {qrType === 'event' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="event-title-input" className={labelClass}>Event Title</label>
                  <input
                    id="event-title-input"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Product Launch & Conference"
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="event-start-input" className={labelClass}>Start Time</label>
                    <input
                      id="event-start-input"
                      type="datetime-local"
                      value={eventStart}
                      onChange={(e) => setEventStart(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="event-end-input" className={labelClass}>End Time</label>
                    <input
                      id="event-end-input"
                      type="datetime-local"
                      value={eventEnd}
                      onChange={(e) => setEventEnd(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="event-loc-input" className={labelClass}>Location</label>
                  <input
                    id="event-loc-input"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="Grand Ballroom, Hall A"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="event-desc-input" className={labelClass}>Description</label>
                  <textarea
                    id="event-desc-input"
                    rows={3}
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="Event agenda and details..."
                    className={inputClass}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Note: iCalendar events are generated using standard floating local time without timezone shifts.
                </p>
              </div>
            )}

            {/* INLINE VALIDATION ALERT */}
            {validationError && (
              <div role="alert" className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {/* DESIGN OPTIONS CARD */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Design &amp; Formatting</h3>
              <button
                type="button"
                onClick={resetDesign}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded p-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Design</span>
              </button>
            </div>

            {/* EXPORT RESOLUTION SLIDER */}
            <div>
              <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <label htmlFor={sizeInputId}>Export Resolution</label>
                <span className="text-blue-600 dark:text-blue-400">{size} × {size} px</span>
              </div>
              <input
                id={sizeInputId}
                type="range"
                min="160"
                max="1200"
                step="20"
                value={size}
                aria-label="Export Resolution"
                aria-valuemin={160}
                aria-valuemax={1200}
                aria-valuenow={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* COLOR CONTROLS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={fgColorId} className={labelClass}>Foreground (Modules)</label>
                <div className="flex items-center gap-2 border border-gray-200 dark:border-slate-700 p-1.5 rounded-xl bg-gray-50 dark:bg-slate-950">
                  <input
                    type="color"
                    id={fgColorId}
                    value={fgColor}
                    aria-label="Foreground Module Color Picker"
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    value={fgColor}
                    aria-label="Foreground Module Color Hex"
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-full bg-transparent text-sm font-mono focus:outline-none dark:text-white uppercase"
                  />
                </div>
              </div>
              <div>
                <label htmlFor={bgColorId} className={labelClass}>Background</label>
                <div className="flex items-center gap-2 border border-gray-200 dark:border-slate-700 p-1.5 rounded-xl bg-gray-50 dark:bg-slate-950">
                  <input
                    type="color"
                    id={bgColorId}
                    value={bgColor}
                    aria-label="Background Color Picker"
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    value={bgColor}
                    aria-label="Background Color Hex"
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full bg-transparent text-sm font-mono focus:outline-none dark:text-white uppercase"
                  />
                </div>
              </div>
            </div>

            {/* ERROR CORRECTION & OUTPUT FORMAT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={levelSelectId} className={labelClass}>Error Correction</label>
                <select
                  id={levelSelectId}
                  value={level}
                  onChange={(e) => setLevel(e.target.value as ErrorLevel)}
                  className={inputClass}
                >
                  <option value="L">Low (L · ~7% recovery)</option>
                  <option value="M">Medium (M · ~15% recovery)</option>
                  <option value="Q">Quartile (Q · ~25% recovery)</option>
                  <option value="H">High (H · ~30% recovery)</option>
                </select>
              </div>
              <div>
                <label htmlFor={formatSelectId} className={labelClass}>Output File Format</label>
                <select
                  id={formatSelectId}
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                  className={inputClass}
                >
                  <option value="png">PNG (Raster Image)</option>
                  <option value="jpeg">JPEG (Solid Background)</option>
                  <option value="webp">WebP (Compressed Raster)</option>
                  <option value="svg">SVG (Scalable Vector)</option>
                  <option value="pdf">PDF (Print-Ready A4 Document)</option>
                </select>
              </div>
            </div>

            {/* ADVANCED DESIGN TOGGLE */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded p-1"
              >
                <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Design Options</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* ADVANCED DESIGN PANEL */}
            {showAdvanced && (
              <div className="space-y-4 rounded-2xl bg-gray-50 dark:bg-slate-950/70 border border-gray-200 dark:border-slate-800 p-4">
                <div>
                  <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <label htmlFor={marginInputId}>Quiet Zone (Margin)</label>
                    <span className="text-blue-600 dark:text-blue-400">{marginSize} modules {marginSize < 4 ? '(Below ISO minimum)' : '(Standard)'}</span>
                  </div>
                  <input
                    id={marginInputId}
                    type="range"
                    min="0"
                    max="12"
                    value={marginSize}
                    aria-label="Quiet Zone Modules"
                    aria-valuemin={0}
                    aria-valuemax={12}
                    aria-valuenow={marginSize}
                    onChange={(e) => setMarginSize(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <label className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  <span>Boost error correction automatically</span>
                  <input
                    type="checkbox"
                    checked={boostLevel}
                    onChange={(e) => setBoostLevel(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <div>
                  <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <label htmlFor={logoSizeId}>Center Logo Size</label>
                    <span className="text-blue-600 dark:text-blue-400">{logoSize}%</span>
                  </div>
                  <input
                    id={logoSizeId}
                    type="range"
                    min="12"
                    max="28"
                    value={logoSize}
                    disabled={!hasLogo}
                    aria-label="Logo Dimension Percentage"
                    aria-valuemin={12}
                    aria-valuemax={28}
                    aria-valuenow={logoSize}
                    onChange={(e) => setLogoSize(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer disabled:opacity-40"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <label htmlFor={logoOpacityId}>Center Logo Opacity</label>
                    <span className="text-blue-600 dark:text-blue-400">{logoOpacity}%</span>
                  </div>
                  <input
                    id={logoOpacityId}
                    type="range"
                    min="50"
                    max="100"
                    value={logoOpacity}
                    disabled={!hasLogo}
                    aria-label="Logo Opacity Percentage"
                    aria-valuemin={50}
                    aria-valuemax={100}
                    aria-valuenow={logoOpacity}
                    onChange={(e) => setLogoOpacity(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer disabled:opacity-40"
                  />
                </div>
              </div>
            )}

            {/* LOGO UPLOAD */}
            <div>
              <label className={labelClass}>Center Logo (PNG, JPEG, WebP · Max 5 MB)</label>
              <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 text-sm font-medium">
                <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate">{logoName ? logoName : 'Upload Center Logo'}</span>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </label>
              {hasLogo && (
                <button
                  type="button"
                  onClick={removeLogo}
                  className="text-xs text-red-500 mt-2 hover:underline w-full text-center flex items-center justify-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove Logo</span>
                </button>
              )}
            </div>

            {/* RELIABILITY REPORT TOGGLE */}
            <div>
              <button
                type="button"
                onClick={() => setShowReliability((v) => !v)}
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded p-1"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{showReliability ? 'Hide' : 'Show'} QR Reliability Report</span>
                {showReliability ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* RELIABILITY REPORT ACCORDION */}
            {showReliability && (
              <div className="rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">
                      Estimated Scan Reliability
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Multi-factor structural heuristic (Max 95/100 · Physical environment unmeasured)
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      reliability.status === 'unavailable' || reliability.score === null
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        : reliability.score >= 85
                        ? 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300'
                        : reliability.score >= 70
                        ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                        : reliability.score >= 50
                        ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                        : 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300'
                    }`}
                  >
                    {reliability.status === 'unavailable' || reliability.score === null
                      ? 'Available after generation'
                      : `${reliability.score}/100 · ${reliability.feasibilityLabel}`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="rounded-xl bg-white/80 dark:bg-slate-900/80 p-2.5 border border-blue-100/50 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block">Payload Length</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                      {isReady ? `${qrBytes.toLocaleString()} bytes` : '— (Not generated)'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/80 dark:bg-slate-900/80 p-2.5 border border-blue-100/50 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block">Estimated Version</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                      {isReady
                        ? (estimatedVersion ? `V${estimatedVersion} (${17 + estimatedVersion * 4}×${17 + estimatedVersion * 4})` : 'Over Capacity')
                        : '— (Not generated)'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/80 dark:bg-slate-900/80 p-2.5 border border-blue-100/50 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block">Quiet Zone</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                      {marginSize} modules {marginSize >= 4 ? '✓' : '⚠'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/80 dark:bg-slate-900/80 p-2.5 border border-blue-100/50 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block">Contrast Ratio</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                      {scanContrast.toFixed(1)}:1 {scanContrast >= 4.5 ? '✓' : '⚠'}
                    </p>
                  </div>
                </div>

                {isReady && reliability.warnings.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {reliability.warnings.map((warning) => (
                      <p key={warning} className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>{warning}</span>
                      </p>
                    ))}
                  </div>
                )}

                <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-blue-200/50 dark:border-blue-900/40 leading-relaxed">
                  <p>
                    {isReady
                      ? `Heuristic engineering score (max 95/100) — not a physical scan guarantee. Recommended minimum print size for this density is ${reliability.recommendedPrintSizeCm}.`
                      : 'Reliability metrics and print size guidelines will be calculated once valid QR payload data is entered.'}
                  </p>
                  {isReady && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      Measured: WCAG contrast, quiet zone margin, Reed-Solomon tier, matrix density, and logo occlusion. Real-world illumination, camera sensor resolution, and substrate texture cannot be measured by software.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Live QR Preview & Actions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-1.5">
              <span>Live Render Preview</span>
            </h3>

            {/* PREVIEW CONTAINER */}
            <div className="w-full max-w-[420px] aspect-square rounded-2xl p-4 bg-white border border-gray-200 dark:border-slate-700 shadow-sm flex items-center justify-center overflow-hidden">
              {!isReady ? (
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <ShieldCheck className="w-10 h-10 text-slate-400" />
                  <p className="text-sm font-bold text-slate-700">QR Code Not Generated</p>
                  <p className="text-xs text-slate-500 max-w-[280px]">
                    {validationError || 'Enter required fields to generate a readable QR code.'}
                  </p>
                </div>
              ) : (
                <QRCodeCanvas
                  ref={canvasRef}
                  value={qrValue}
                  size={size}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level={level}
                  marginSize={marginSize}
                  boostLevel={boostLevel}
                  title="KivaroTools QR Code"
                  className="block w-full h-auto max-w-full"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  imageSettings={
                    logoDataUrl
                      ? {
                          src: logoDataUrl,
                          height: (size * logoSize) / 100,
                          width: (size * logoSize) / 100,
                          excavate: true,
                          opacity: logoOpacity / 100,
                        }
                      : undefined
                  }
                />
              )}
            </div>

            {/* HIDDEN SVG ELEMENT FOR DIRECT VECTOR SERIALIZATION */}
            <div className="hidden" aria-hidden="true">
              {isReady && (
                <QRCodeSVG
                  ref={svgRef}
                  value={qrValue}
                  size={size}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level={level}
                  marginSize={marginSize}
                  boostLevel={boostLevel}
                  title="KivaroTools QR Code"
                  imageSettings={
                    logoDataUrl
                      ? {
                          src: logoDataUrl,
                          height: (size * logoSize) / 100,
                          width: (size * logoSize) / 100,
                          excavate: true,
                          opacity: logoOpacity / 100,
                        }
                      : undefined
                  }
                />
              )}
            </div>

            {/* QUICK STATS BADGES */}
            <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs">
              {!isReady ? (
                <>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                    QR Status: Not generated
                  </span>
                  <span className={`px-2.5 py-1 rounded-full font-medium ${scanContrast >= 4.5 ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'}`}>
                    Palette Contrast {scanContrast ? `${scanContrast.toFixed(1)}:1` : '—'}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                    Reliability: Available after generation
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                    Verification: Not performed
                  </span>
                </>
              ) : (
                <>
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-medium">
                    QR Status: Ready
                  </span>
                  <span className={`px-2.5 py-1 rounded-full font-medium ${scanContrast >= 4.5 ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'}`}>
                    Contrast {scanContrast ? `${scanContrast.toFixed(1)}:1` : '—'}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    {qrBytes.toLocaleString()} bytes
                  </span>
                  {estimatedVersion && (
                    <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                      Est. V{estimatedVersion}
                    </span>
                  )}
                  {hasLogo && (
                    <span className={`px-2.5 py-1 rounded-full font-medium ${logoWarning ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' : 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300'}`}>
                      {logoWarning ? 'Logo (H required)' : 'Logo Active'}
                    </span>
                  )}
                  <span className={`px-2.5 py-1 rounded-full font-medium ${reliability.score !== null && reliability.score >= 85 ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300' : reliability.score !== null && reliability.score >= 70 ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'}`}>
                    Reliability Estimate: {reliability.score !== null ? `${reliability.score}/100 (${reliability.feasibilityLabel})` : 'Available after generation'}
                  </span>
                  {activeVerification?.status === 'verified' ? (
                    <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300 font-medium">
                      Verification: Passed
                    </span>
                  ) : activeVerification?.status === 'mismatch' ? (
                    <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 font-medium">
                      Verification: Failed
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                      Verification: Not verified
                    </span>
                  )}
                </>
              )}
            </div>

            {/* WARNINGS */}
            {isReady && logoWarning && (
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-3 text-center">
                A center logo replaces QR modules. High (H) error correction is strongly advised.
              </p>
            )}

            {/* DYNAMIC VERIFICATION RESULT */}
            {activeVerification && (
              <div
                aria-live="polite"
                className={`mt-4 w-full p-3 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 border ${
                  activeVerification.status === 'verified'
                    ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/40'
                    : activeVerification.status === 'unsupported'
                    ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40'
                    : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/40'
                }`}
              >
                {activeVerification.status === 'verified' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                )}
                <span>{activeVerification.message}</span>
              </div>
            )}

            {/* STATUS / TOAST MESSAGE */}
            {status && (
              <div
                aria-live="polite"
                className="mt-3 text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 shrink-0" />
                <span>{status}</span>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 w-full">
              <button
                type="button"
                onClick={verifyGeneratedQr}
                disabled={!isReady || isVerifying}
                title={
                  !isReady
                    ? 'Generate a valid QR code first to enable verification'
                    : isDetectorSupported
                    ? 'Verify generated QR code payload using browser detector'
                    : 'Verify generated QR code payload using software scanner'
                }
                className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 px-4 py-3 rounded-2xl font-semibold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {isVerifying ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0 text-blue-600 dark:text-blue-400" />
                ) : (
                  <ScanLine className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                )}
                <span>{isVerifying ? 'Verifying...' : 'Verify Payload'}</span>
              </button>

              <button
                type="button"
                onClick={downloadQR}
                disabled={!isReady || isExporting}
                title={!isReady ? 'Generate a valid QR code first to enable download' : `Download as ${exportFormat.toUpperCase()}`}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Download className="w-4 h-4 shrink-0" />}
                <span>Download {exportFormat.toUpperCase()}</span>
              </button>

              <button
                type="button"
                onClick={copyImage}
                disabled={!isReady}
                title={!isReady ? 'Generate a valid QR code first to enable image copying' : 'Copy PNG image to clipboard'}
                className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 px-4 py-3 rounded-2xl font-semibold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Copy className="w-4 h-4 shrink-0" />
                <span>Copy Image</span>
              </button>

              <button
                type="button"
                onClick={copyData}
                disabled={!isReady}
                title={!isReady ? 'Generate a valid QR code first to enable copying raw payload' : 'Copy raw payload text to clipboard'}
                className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 px-4 py-3 rounded-2xl font-semibold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Copy className="w-4 h-4 shrink-0" />
                <span>Copy Raw Data</span>
              </button>
            </div>
          </div>

          {/* 3. TECHNICAL SPECIFICATIONS & SAFETY DISCLOSURES ACCORDION */}
          <section
            aria-labelledby="heading-qr-disclosures"
            className="bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 transition-colors text-xs text-slate-600 dark:text-slate-400 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4
                id="heading-qr-disclosures"
                className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm"
              >
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>Technical Specifications &amp; Printing Guidance</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowDisclosures((prev) => !prev)}
                aria-expanded={showDisclosures}
                aria-controls="qr-technical-disclosures-panel"
                className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-2 py-1"
              >
                <span>{showDisclosures ? 'Hide Details' : 'View Details'}</span>
                {showDisclosures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showDisclosures && (
              <div
                id="qr-technical-disclosures-panel"
                className="space-y-3.5 pt-2 border-t border-gray-200 dark:border-slate-800"
              >
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-300">
                    Client-Side Processing &amp; Privacy
                  </p>
                  <p className="mt-0.5 leading-relaxed">
                    All QR matrix calculations, canvas rendering, SVG vector building, and image conversions execute strictly in your browser. Content, Wi-Fi credentials, contact details, and uploaded logos are never transmitted to any external server.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-300">
                    Physical Printing &amp; Scanability Recommendations
                  </p>
                  <p className="mt-0.5 leading-relaxed">
                    Physical camera scanning depends heavily on module size, print surface, lighting, and camera resolution. High-density QR codes (such as large vCards or multi-paragraph text) contain hundreds of tiny modules and must be printed significantly larger (minimum 5.0 cm / 2.0 inches) to remain scan-reliable.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-300">
                    Quiet Zone (Margin) Standard
                  </p>
                  <p className="mt-0.5 leading-relaxed">
                    The ISO/IEC 18004 specification defines a required 4-module quiet zone surrounding the QR code. While this tool allows customization down to 0 modules for tight digital layouts, a 4-module border is strongly recommended for printed media.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-300">
                    Center Logo &amp; Error Correction Dynamics
                  </p>
                  <p className="mt-0.5 leading-relaxed">
                    Center logos are rendered by excavating QR modules. Error correction level H (High) restores up to ~30% of lost data. When adding a center logo, keep its size below 22% of the matrix width to ensure scan recovery margins are preserved.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-300">
                    Browser Verification Compatibility
                  </p>
                  <p className="mt-0.5 leading-relaxed">
                    Built-in verification utilizes the modern W3C BarcodeDetector API. If your browser does not support this native API, the QR code is still standard-compliant and will scan normally with mobile phone cameras and handheld barcode scanners.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* FOOTER NOTICE */}
          <div className="text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>All QR codes generated are 100% royalty-free and compliant with ISO/IEC 18004 standards.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
