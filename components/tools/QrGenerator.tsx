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
  ArrowLeftRight,
  Code2,
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

const COLOR_PRESETS = [
  { name: 'Classic', fg: '#000000', bg: '#ffffff' },
  { name: 'Navy', fg: '#1e3a8a', bg: '#ffffff' },
  { name: 'Forest', fg: '#14532d', bg: '#ffffff' },
  { name: 'Slate', fg: '#0f172a', bg: '#f8fafc' },
  { name: 'Burgundy', fg: '#7f1d1d', bg: '#ffffff' },
] as const;

const inputClass =
  'w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:text-white transition-colors';
const labelClass = 'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5';

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
  } else {
    // Level L
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

  // Software cannot validate physical environment (lighting, lens quality, autofocus, print surface).
  // Maximum heuristic score is capped at 95 to prevent misleading 100/100 guarantees.
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
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

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
  const logoUploadId = useId();
  const advancedPanelId = useId();
  const reliabilityPanelId = useId();

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
    () => () => { },
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

  // 2. Exact QR Payload Generator — only builds when inputs are strictly valid
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
        message: 'Settings or content changed since last verification. Click Verify Payload to re-check.',
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

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = tabs.length - 1;

    if (nextIndex !== null) {
      e.preventDefault();
      handleTypeChange(tabs[nextIndex].id);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  const swapColors = () => {
    setFgColor(bgColor);
    setBgColor(fgColor);
    setStatus('Swapped foreground and background colors.');
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
      } catch { }
    }, 1500);
  };

  const serializeSvgMarkup = (): string | null => {
    if (!svgRef.current) return null;
    const clone = svgRef.current.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', String(size));
    clone.setAttribute('height', String(size));

    // Sanitize: ensure no external script elements
    const scripts = clone.querySelectorAll('script');
    scripts.forEach((s) => s.remove());

    const serializer = new XMLSerializer();
    return `<?xml version="1.0" encoding="UTF-8"?>\n${serializer.serializeToString(clone)}`;
  };

  const exportSvg = () => {
    if (!svgRef.current) {
      setStatus('SVG preview element not ready.');
      return;
    }
    try {
      const svgText = serializeSvgMarkup();
      if (!svgText) {
        setStatus('SVG preview element not ready.');
        return;
      }
      const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      downloadBlob(blob, 'svg');
      setStatus('SVG vector downloaded.');
    } catch {
      setStatus('Failed to serialize SVG vector output.');
    }
  };

  const copySvgMarkup = async () => {
    if (!isReady) {
      setStatus(validationError || 'Generate a valid QR code before copying SVG.');
      return;
    }
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setStatus('Clipboard is unavailable in this environment.');
      return;
    }
    try {
      const svgText = serializeSvgMarkup();
      if (!svgText) {
        setStatus('SVG preview element not ready.');
        return;
      }
      await navigator.clipboard.writeText(svgText);
      setStatus('SVG markup copied to clipboard.');
    } catch {
      setStatus('Clipboard permission was denied.');
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

      ctx.imageSmoothingEnabled = hasLogo;

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

      ctx.imageSmoothingEnabled = hasLogo;
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
      setStatus('Print-ready A4 PDF document downloaded.');
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

  const safeFgPickerValue = validHex(fgColor) ? fgColor : '#000000';
  const safeBgPickerValue = validHex(bgColor) ? bgColor : '#ffffff';

  return (
    <div id="qr-generator-tool" className="flex flex-col gap-6">
      {/* 1. COMPACT PRIVACY & STATIC GUARANTEE BAR */}
      <div className="flex items-center justify-between flex-wrap gap-2 bg-emerald-50/90 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 px-4 py-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <span className="font-semibold">Local Browser Processing</span>
          <span className="hidden sm:inline text-emerald-700 dark:text-emerald-400">·</span>
          <span className="text-emerald-700 dark:text-emerald-400">
            Static, non-expiring QR codes generated locally in your browser without uploading payloads or logos.
          </span>
        </div>
      </div>

      {/* 2. STEP 1: QR PAYLOAD TYPE TABS */}
      <div className="space-y-6">
        <div
          role="tablist"
          aria-label="QR Code Type Selection"
          className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-gray-100 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-gray-200 dark:border-slate-700 w-full"
        >
          {tabs.map((type, index) => {
            const Icon = type.icon;
            const isSelected = qrType === type.id;
            return (
              <button
                key={type.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                id={`tab-${type.id}`}
                type="button"
                role="tab"
                tabIndex={isSelected ? 0 : -1}
                aria-selected={isSelected}
                aria-controls="panel-qr-content"
                onClick={() => handleTypeChange(type.id)}
                onKeyDown={(e) => handleTabKeyDown(e, index)}
                className={`w-full min-w-0 min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isSelected
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* MAIN 2-COLUMN WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN (7 cols): Step 2 Content + Step 3 Design */}
          <div className="lg:col-span-7 space-y-6">
            {/* CONTENT DATA PANEL */}
            <div
              id="panel-qr-content"
              role="tabpanel"
              aria-labelledby={`tab-${qrType}`}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold">
                    1
                  </span>
                  <span>Enter {tabs.find((t) => t.id === qrType)?.label} Details</span>
                </h3>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Static Payload</span>
              </div>

              {/* URL */}
              {qrType === 'url' && (
                <div>
                  <label htmlFor={contentInputId} className={labelClass}>
                    Website URL <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input
                    id={contentInputId}
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className={inputClass}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    Include http:// or https:// so smartphones open the link directly. Unicode domains and query strings are preserved.
                  </p>
                </div>
              )}

              {/* Plain Text */}
              {qrType === 'text' && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor={contentInputId} className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Text Content <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {text.length.toLocaleString()}/{MAX_CONTENT_CHARS.toLocaleString()} chars
                    </span>
                  </div>
                  <textarea
                    id={contentInputId}
                    rows={5}
                    maxLength={MAX_CONTENT_CHARS}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text, serial number, instructions, or notes..."
                    className={inputClass}
                  />
                </div>
              )}

              {/* Wi-Fi */}
              {qrType === 'wifi' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="wifi-ssid-input" className={labelClass}>
                      Network Name (SSID) <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="wifi-ssid-input"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="MyGuestWiFi"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="wifi-pass-input" className={labelClass}>
                        Wi-Fi Password / Key {wifiEnc !== 'nopass' && <span className="text-red-500" aria-hidden="true">*</span>}
                      </label>
                      <input
                        id="wifi-pass-input"
                        type="text"
                        autoComplete="off"
                        value={wifiPass}
                        onChange={(e) => setWifiPass(e.target.value)}
                        disabled={wifiEnc === 'nopass'}
                        placeholder={wifiEnc === 'nopass' ? 'Open network (no password)' : 'Enter Wi-Fi passkey'}
                        className={`${inputClass} disabled:opacity-50`}
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
                  <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={wifiHidden}
                      onChange={(e) => setWifiHidden(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Hidden Network (SSID not broadcast)</span>
                  </label>
                </div>
              )}

              {/* Email */}
              {qrType === 'email' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email-addr-input" className={labelClass}>
                      Email Address <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
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
                    <label htmlFor="email-sub-input" className={labelClass}>Subject Line <span className="text-xs font-normal text-slate-400">(optional)</span></label>
                    <input
                      id="email-sub-input"
                      value={emailSub}
                      onChange={(e) => setEmailSub(e.target.value)}
                      placeholder="Inquiry regarding..."
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="email-body-input" className={labelClass}>Message Body <span className="text-xs font-normal text-slate-400">(optional)</span></label>
                    <textarea
                      id="email-body-input"
                      rows={3}
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
                  <label htmlFor="phone-number-input" className={labelClass}>
                    Phone Number <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="phone-number-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className={inputClass}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    Use international format (e.g. +1 555 123 4567) or local dial numbers.
                  </p>
                </div>
              )}

              {/* SMS */}
              {qrType === 'sms' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="sms-phone-input" className={labelClass}>
                      Recipient Number <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
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
                    <label htmlFor="sms-body-input" className={labelClass}>SMS Text Message <span className="text-xs font-normal text-slate-400">(optional)</span></label>
                    <textarea
                      id="sms-body-input"
                      rows={3}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Generates a compact vCard 3.0 payload. Keep fields concise for crisp scanning on small business cards.
                  </p>
                </div>
              )}

              {/* Event / iCalendar */}
              {qrType === 'event' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="event-title-input" className={labelClass}>
                      Event Title <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
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
                      <label htmlFor="event-start-input" className={labelClass}>
                        Start Time <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="event-start-input"
                        type="datetime-local"
                        value={eventStart}
                        onChange={(e) => setEventStart(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="event-end-input" className={labelClass}>
                        End Time <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
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
                    <label htmlFor="event-loc-input" className={labelClass}>Location <span className="text-xs font-normal text-slate-400">(optional)</span></label>
                    <input
                      id="event-loc-input"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      placeholder="Grand Ballroom, Hall A"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="event-desc-input" className={labelClass}>Description <span className="text-xs font-normal text-slate-400">(optional)</span></label>
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
                    Generates a standard iCalendar (VEVENT) payload using floating local time.
                  </p>
                </div>
              )}

              {/* INLINE VALIDATION ALERT */}
              {validationError && (
                <div role="alert" className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-400 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{validationError}</span>
                </div>
              )}
            </div>

            {/* DESIGN & FORMATTING CARD */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold">
                    2
                  </span>
                  <span>Customize Design &amp; Output</span>
                </h3>
                <button
                  type="button"
                  onClick={resetDesign}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg px-2 py-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Reset Design</span>
                </button>
              </div>

              {/* COLORS + QUICK PRESETS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Colors</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {COLOR_PRESETS.map((preset) => {
                      const active = fgColor.toLowerCase() === preset.fg && bgColor.toLowerCase() === preset.bg;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setFgColor(preset.fg);
                            setBgColor(preset.bg);
                          }}
                          title={`${preset.name} (${preset.fg} on ${preset.bg})`}
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${active
                              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                              : 'border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600'
                            }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/15 shrink-0"
                            style={{ backgroundColor: preset.fg }}
                            aria-hidden="true"
                          />
                          <span>{preset.name}</span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={swapColors}
                      title="Swap foreground and background colors"
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <ArrowLeftRight className="w-3 h-3" aria-hidden="true" />
                      <span>Swap</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={fgColorId} className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Foreground (Modules)
                    </label>
                    <div className="flex items-center gap-2 border border-gray-200 dark:border-slate-700 p-1.5 rounded-xl bg-gray-50 dark:bg-slate-950">
                      <input
                        type="color"
                        id={fgColorId}
                        value={safeFgPickerValue}
                        aria-label="Foreground Module Color Picker"
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0 shrink-0"
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
                    <label htmlFor={bgColorId} className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Background
                    </label>
                    <div className="flex items-center gap-2 border border-gray-200 dark:border-slate-700 p-1.5 rounded-xl bg-gray-50 dark:bg-slate-950">
                      <input
                        type="color"
                        id={bgColorId}
                        value={safeBgPickerValue}
                        aria-label="Background Color Picker"
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0 shrink-0"
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
              </div>

              {/* OUTPUT FORMAT & ERROR CORRECTION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={formatSelectId} className={labelClass}>Output File Format</label>
                  <select
                    id={formatSelectId}
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                    className={inputClass}
                  >
                    <option value="png">PNG (Raster Image)</option>
                    <option value="svg">SVG (Scalable Vector)</option>
                    <option value="pdf">PDF (Print-Ready A4 Sheet)</option>
                    <option value="webp">WebP (Compressed Raster)</option>
                    <option value="jpeg">JPEG (Solid Background)</option>
                  </select>
                </div>
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
              </div>

              {/* EXPORT RESOLUTION SLIDER */}
              <div>
                <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <label htmlFor={sizeInputId}>Export Resolution</label>
                  <span className="font-mono text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                    {size} × {size} px
                  </span>
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
                <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  <span>160 px (Small web)</span>
                  <span>500 px (Default)</span>
                  <span>1200 px (High-res raster)</span>
                </div>
              </div>

              {/* CENTER LOGO UPLOAD */}
              <div>
                <p className={labelClass}>Center Logo <span className="text-xs font-normal text-slate-400">(PNG, JPEG, WebP · Max 5 MB)</span></p>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor={logoUploadId}
                    className="flex-1 min-w-0 min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-dashed border-gray-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 text-sm font-medium"
                  >
                    <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" aria-hidden="true" />
                    <span className="truncate">{logoName ? logoName : 'Upload Center Logo (auto-enables Level H)'}</span>
                    <input
                      id={logoUploadId}
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={handleLogoUpload}
                    />
                  </label>
                  {hasLogo && (
                    <button
                      type="button"
                      onClick={removeLogo}
                      aria-label="Remove uploaded logo"
                      className="min-h-[44px] px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/70 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>

              {/* PROGRESSIVE DISCLOSURE: ADVANCED PREPRESS OPTIONS */}
              <div className="pt-1 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  aria-expanded={showAdvanced}
                  aria-controls={advancedPanelId}
                  className="w-full flex items-center justify-between py-1 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
                >
                  <span>Advanced Prepress &amp; Logo Options</span>
                  <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                    <span>{showAdvanced ? 'Hide' : 'Show'}</span>
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {showAdvanced && (
                  <div
                    id={advancedPanelId}
                    className="mt-3 space-y-4 rounded-2xl bg-gray-50 dark:bg-slate-950/70 border border-gray-200 dark:border-slate-800 p-4"
                  >
                    <div>
                      <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        <label htmlFor={marginInputId}>Quiet Zone (Margin)</label>
                        <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                          {marginSize} modules {marginSize < 4 ? '(Below ISO min)' : '(ISO Standard)'}
                        </span>
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

                    <label className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                      <span>Boost error correction automatically when capacity permits</span>
                      <input
                        type="checkbox"
                        checked={boostLevel}
                        onChange={(e) => setBoostLevel(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0 ml-3"
                      />
                    </label>

                    <div>
                      <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        <label htmlFor={logoSizeId}>Center Logo Size</label>
                        <span className="text-xs font-mono text-blue-600 dark:text-blue-400">{logoSize}%</span>
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
                      {!hasLogo && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                          Upload a center logo above to adjust logo size and opacity.
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        <label htmlFor={logoOpacityId}>Center Logo Opacity</label>
                        <span className="text-xs font-mono text-blue-600 dark:text-blue-400">{logoOpacity}%</span>
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
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (5 cols): Sticky Live Preview, Verification & Export */}
          <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-5">
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-800 shadow-xs flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Live QR Preview
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${isReady
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                >
                  {isReady ? 'Ready to export' : 'Waiting for input'}
                </span>
              </div>

              {/* PREVIEW CONTAINER */}
              <div className="w-full max-w-[360px] aspect-square rounded-2xl p-4 bg-white border border-gray-200 dark:border-slate-700 shadow-inner flex items-center justify-center overflow-hidden">
                {!isReady ? (
                  <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <ShieldCheck className="w-10 h-10 text-slate-300" aria-hidden="true" />
                    <p className="text-sm font-bold text-slate-700">QR Code Not Generated</p>
                    <p className="text-xs text-slate-500 max-w-[260px]">
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

              {/* COMPACT 4-METRIC SUMMARY STRIP */}
              <div className="w-full grid grid-cols-2 gap-2 mt-5 text-xs">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 px-3 py-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Contrast</span>
                  <span className={`font-bold ${scanContrast >= 4.5 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                    {scanContrast ? `${scanContrast.toFixed(1)}:1` : '—'}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 px-3 py-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Payload / Version</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {isReady ? `${qrBytes.toLocaleString()} B · ${estimatedVersion ? `V${estimatedVersion}` : 'Over'}` : '—'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReliability((v) => !v)}
                  aria-expanded={showReliability}
                  aria-controls={reliabilityPanelId}
                  className="text-left rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 px-3 py-2 hover:border-blue-400 dark:hover:border-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Reliability Score</span>
                    {showReliability ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </span>
                  <span
                    className={`font-bold ${reliability.score === null
                        ? 'text-slate-500 dark:text-slate-400'
                        : reliability.score >= 85
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : reliability.score >= 70
                            ? 'text-blue-700 dark:text-blue-400'
                            : 'text-amber-700 dark:text-amber-400'
                      }`}
                  >
                    {reliability.score !== null ? `${reliability.score}/100 · ${reliability.feasibilityLabel}` : 'Pending'}
                  </span>
                </button>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 px-3 py-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Optical Check</span>
                  <span
                    className={`font-bold ${activeVerification?.status === 'verified'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : activeVerification?.status === 'mismatch' || activeVerification?.status === 'not_detected'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                  >
                    {activeVerification?.status === 'verified'
                      ? 'Passed'
                      : activeVerification?.status === 'mismatch'
                        ? 'Mismatch'
                        : activeVerification?.status === 'not_detected'
                          ? 'Not detected'
                          : 'Not verified'}
                  </span>
                </div>
              </div>

              {/* EXPANDABLE RELIABILITY REPORT */}
              {showReliability && (
                <div
                  id={reliabilityPanelId}
                  className="mt-3 w-full rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 p-4 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      Estimated Scan Reliability Breakdown
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Max 95/100</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-white/80 dark:bg-slate-900/80 p-2 border border-blue-100/50 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 block">Quiet Zone</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                        {marginSize} modules {marginSize >= 4 ? '✓' : '⚠'}
                      </span>
                    </div>
                    <div className="rounded-lg bg-white/80 dark:bg-slate-900/80 p-2 border border-blue-100/50 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 block">Min Print Size</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                        {reliability.recommendedPrintSizeCm}
                      </span>
                    </div>
                  </div>

                  {isReady && reliability.warnings.length > 0 && (
                    <div className="space-y-1.5">
                      {reliability.warnings.map((warning) => (
                        <p key={warning} className="text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                          <span>{warning}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-blue-200/50 dark:border-blue-900/40 leading-relaxed">
                    Heuristic score across WCAG contrast (30 pts), quiet zone (15 pts), error correction &amp; logo margin (25 pts), and matrix density (30 pts), capped at 95/100 because physical lighting, print substrate, and camera optics cannot be measured in software.
                  </p>
                </div>
              )}

              {/* LOGO ERROR CORRECTION WARNING */}
              {isReady && logoWarning && (
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-3 text-center">
                  Center logo active with Level {level}. High (H) error correction is strongly advised.
                </p>
              )}

              {/* DYNAMIC VERIFICATION RESULT */}
              {activeVerification && (
                <div
                  aria-live="polite"
                  className={`mt-4 w-full p-3 rounded-xl text-xs font-medium flex items-start gap-2 border ${activeVerification.status === 'verified'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                      : activeVerification.status === 'idle' || activeVerification.status === 'unsupported'
                        ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/40'
                        : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/40'
                    }`}
                >
                  {activeVerification.status === 'verified' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" aria-hidden="true" />
                  ) : activeVerification.status === 'idle' ? (
                    <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
                  )}
                  <span>{activeVerification.message}</span>
                </div>
              )}

              {/* STATUS MESSAGE */}
              {status && (
                <div
                  aria-live="polite"
                  className="mt-3 text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{status}</span>
                </div>
              )}

              {/* PRIMARY + SECONDARY ACTION BUTTONS */}
              <div className="w-full space-y-2.5 mt-5">
                <button
                  type="button"
                  onClick={downloadQR}
                  disabled={!isReady || isExporting}
                  title={!isReady ? 'Generate a valid QR code first to enable download' : `Download as ${exportFormat.toUpperCase()}`}
                  className="w-full min-h-[48px] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-3 rounded-2xl font-bold text-sm sm:text-base transition-all shadow-md shadow-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Download className="w-4 h-4 shrink-0" />}
                  <span>Download {exportFormat.toUpperCase()}</span>
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={verifyGeneratedQr}
                    disabled={!isReady || isVerifying}
                    title={
                      !isReady
                        ? 'Generate a valid QR code first to enable verification'
                        : isDetectorSupported
                          ? 'Verify generated QR code payload using browser BarcodeDetector or jsQR'
                          : 'Verify generated QR code payload using in-browser jsQR decoder'
                    }
                    className="min-h-[44px] flex items-center justify-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
                    onClick={copyImage}
                    disabled={!isReady}
                    title={!isReady ? 'Generate a valid QR code first to enable image copying' : 'Copy PNG image to clipboard'}
                    className="min-h-[44px] flex items-center justify-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <Copy className="w-4 h-4 shrink-0" />
                    <span>Copy Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={copySvgMarkup}
                    disabled={!isReady}
                    title={!isReady ? 'Generate a valid QR code first to enable copying SVG markup' : 'Copy raw SVG vector markup to clipboard'}
                    className="min-h-[44px] flex items-center justify-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <Code2 className="w-4 h-4 shrink-0" />
                    <span>Copy SVG</span>
                  </button>

                  <button
                    type="button"
                    onClick={copyData}
                    disabled={!isReady}
                    title={!isReady ? 'Generate a valid QR code first to enable copying raw payload' : 'Copy raw encoded payload string to clipboard'}
                    className="min-h-[44px] flex items-center justify-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <Copy className="w-4 h-4 shrink-0" />
                    <span>Copy Raw Data</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. TECHNICAL SPECIFICATIONS & PRINTING GUIDANCE ACCORDION */}
            <section
              aria-labelledby="heading-qr-disclosures"
              className="bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 transition-colors text-xs text-slate-600 dark:text-slate-400 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h4
                  id="heading-qr-disclosures"
                  className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs sm:text-sm"
                >
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
                  <span>Technical Specs &amp; Printing Notes</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowDisclosures((prev) => !prev)}
                  aria-expanded={showDisclosures}
                  aria-controls="qr-technical-disclosures-panel"
                  className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-2 py-1 shrink-0"
                >
                  <span>{showDisclosures ? 'Hide' : 'View'}</span>
                  {showDisclosures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showDisclosures && (
                <div
                  id="qr-technical-disclosures-panel"
                  className="space-y-3 pt-2 border-t border-gray-200 dark:border-slate-800"
                >
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-300">
                      Local Browser Processing
                    </p>
                    <p className="mt-0.5 leading-relaxed">
                      QR matrix generation, canvas rendering, SVG serialization, A4 PDF creation, and optical verification run locally in your browser via client-side JavaScript. This tool does not upload QR payloads or logos to a server.
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-300">
                      Physical Printing &amp; Quiet Zone
                    </p>
                    <p className="mt-0.5 leading-relaxed">
                      ISO/IEC 18004 specifies a 4-module blank quiet zone around the QR matrix. High-density payloads (such as detailed vCards or long text) produce smaller modules and should be printed larger (up to 5.0–6.0 cm) and exported as SVG or A4 PDF.
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-300">
                      Center Logo &amp; Error Correction
                    </p>
                    <p className="mt-0.5 leading-relaxed">
                      Center logos excavate data modules. Uploading a logo automatically selects Level H (~30% recovery). Keep logo size at or below 20–22% for reliable scan headroom.
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-300">
                      In-Browser Verification Decoder
                    </p>
                    <p className="mt-0.5 leading-relaxed">
                      Verify Payload uses the native W3C BarcodeDetector API when supported by your browser, and automatically falls back to the pure-JavaScript jsQR decoder otherwise. Always test a physical print with a smartphone camera before large print runs.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* FOOTER NOTICE */}
            <div className="text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>ISO/IEC 18004 compliant static QR codes — free for commercial and personal use.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}