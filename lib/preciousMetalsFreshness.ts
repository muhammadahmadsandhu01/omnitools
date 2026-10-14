/**
 * @file preciousMetalsFreshness.ts
 * @description Market calendar, data provenance, and freshness evaluation engine for precious metals.
 * Distinguishes live quotes from delayed quotes, weekend/holiday market closes, stale feeds,
 * fallback benchmarks, and manual overrides.
 *
 * Market Calendar:
 * Global OTC Bullion Trading (London / Zurich / New York / Asian Hubs):
 * - Opens Sunday at 18:00 US Eastern Time (ET).
 * - Closes Friday at 17:00 US Eastern Time (ET).
 * - Daily maintenance break Monday-Thursday between 17:00 and 18:00 ET.
 * - Closed Saturday and Sunday before 18:00 ET.
 * - Major annual market closures: New Year's Day (Jan 1), Christmas Day (Dec 25), Good Friday.
 */

export type FreshnessState =
  | 'LIVE'
  | 'DELAYED'
  | 'MARKET_CLOSED'
  | 'STALE'
  | 'FALLBACK_BENCHMARK'
  | 'MANUAL_OVERRIDE'
  | 'UNVERIFIED_TIMESTAMP';

export type MarketStatus = 'OPEN' | 'CLOSED' | 'MAINTENANCE';

export type MarketCalendarReason =
  | 'WEEKEND'
  | 'DAILY_MAINTENANCE'
  | 'HOLIDAY'
  | 'EARLY_CLOSE'
  | 'SPECIAL_SESSION_HALT';

export interface MarketCalendarState {
  status: MarketStatus;
  reason?: MarketCalendarReason;
  description: string;
  easternTimeIso: string;
  isSpecialSession?: boolean;
  unmodeledSpecialSession?: boolean;
  scheduleSource?: string;
}

export interface FreshnessEvaluationInput {
  providerTimestampMs?: number | null;
  retrievedAtMs?: number;
  nowMs?: number;
  isManualOverride?: boolean;
  isFallback?: boolean;
  providerName?: string;
}

export interface FreshnessEvaluation {
  state: FreshnessState;
  badgeLabel: string;
  badgeSubtext: string;
  badgeColor: 'emerald' | 'blue' | 'amber' | 'slate' | 'rose';
  isLive: boolean;
  ageMs: number | null;
  ageReadable: string;
  marketStatus: MarketStatus;
  detail?: string;
  provenance: {
    sourceName: string;
    quoteTimestamp: string | null;
    retrievalTimestamp: string;
    evaluationTimestamp: string;
    marketState: string;
    isManual: boolean;
    isFallback: boolean;
    note: string;
    unmodeledSpecialSessionPossible?: boolean;
    scheduleSource?: string;
  };
  warning?: string;
}

/**
 * Calculates Eastern Time (America/New_York) components accounting for Daylight Saving Time.
 */
export function getEasternTimeComponents(date: Date): {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  hour: number; // 0-23
  minute: number; // 0-59
  isDst: boolean;
} {
  // Use Intl.DateTimeFormat to reliably determine US Eastern Time regardless of host OS timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    timeZoneName: 'short',
  });

  const parts = formatter.formatToParts(date);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const year = parseInt(partMap.year, 10);
  const month = parseInt(partMap.month, 10);
  const day = parseInt(partMap.day, 10);
  const hour = parseInt(partMap.hour === '24' ? '0' : partMap.hour, 10);
  const minute = parseInt(partMap.minute, 10);
  const tzName = partMap.timeZoneName || '';
  const isDst = tzName.includes('EDT');

  const dayOfWeekStr = partMap.weekday;
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const dayOfWeek = dayMap[dayOfWeekStr] ?? date.getUTCDay();

  return { year, month, day, dayOfWeek, hour, minute, isDst };
}

/**
 * Calculates Western Christian Easter Sunday for a given year using the Anonymous Gregorian algorithm.
 */
export function getEasterSunday(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

/**
 * Calculates the day of the month for Thanksgiving (4th Thursday in November).
 */
export function getThanksgivingDay(year: number): number {
  const nov1Dow = new Date(Date.UTC(year, 10, 1)).getUTCDay();
  const firstThursday = 1 + ((4 - nov1Dow + 7) % 7);
  return firstThursday + 21;
}

/**
 * Calculates the day of the month for Martin Luther King Jr. Day (3rd Monday in January).
 */
export function getMlkDay(year: number): number {
  const jan1Dow = new Date(Date.UTC(year, 0, 1)).getUTCDay();
  const firstMonday = 1 + ((1 - jan1Dow + 7) % 7);
  return firstMonday + 14;
}

/**
 * Calculates the day of the month for Presidents' Day (3rd Monday in February).
 */
export function getPresidentsDay(year: number): number {
  const feb1Dow = new Date(Date.UTC(year, 1, 1)).getUTCDay();
  const firstMonday = 1 + ((1 - feb1Dow + 7) % 7);
  return firstMonday + 14;
}

/**
 * Calculates the day of the month for Memorial Day (Last Monday in May).
 */
export function getMemorialDay(year: number): number {
  const may31Dow = new Date(Date.UTC(year, 4, 31)).getUTCDay();
  return 31 - ((may31Dow - 1 + 7) % 7);
}

/**
 * Calculates the day of the month for Labor Day (1st Monday in September).
 */
export function getLaborDay(year: number): number {
  const sep1Dow = new Date(Date.UTC(year, 8, 1)).getUTCDay();
  return 1 + ((1 - sep1Dow + 7) % 7);
}

/**
 * Calculates observed date for Juneteenth (June 19).
 * If Saturday -> Friday June 18; if Sunday -> Monday June 20; else June 19.
 */
export function getJuneteenthObserved(year: number): { month: 6; day: number } {
  const dow = new Date(Date.UTC(year, 5, 19)).getUTCDay();
  if (dow === 6) return { month: 6, day: 18 };
  if (dow === 0) return { month: 6, day: 20 };
  return { month: 6, day: 19 };
}

/**
 * Calculates observed date for US Independence Day (July 4).
 * If Saturday -> Friday July 3; if Sunday -> Monday July 5; else July 4.
 */
export function getIndependenceDayObserved(year: number): { month: 7; day: number } {
  const dow = new Date(Date.UTC(year, 6, 4)).getUTCDay();
  if (dow === 6) return { month: 7, day: 3 };
  if (dow === 0) return { month: 7, day: 5 };
  return { month: 7, day: 4 };
}

/**
 * Determines whether the given Eastern Time date is a recognized global bullion market holiday (full day).
 */
export function isBullionMarketHoliday(year: number, month: number, day: number): boolean {
  // New Year's Day (Jan 1)
  if (month === 1 && day === 1) return true;

  // Christmas Day (Dec 25)
  if (month === 12 && day === 25) return true;

  // Good Friday (2 days before Easter Sunday)
  const easter = getEasterSunday(year);
  const easterDate = new Date(Date.UTC(year, easter.month - 1, easter.day));
  const goodFridayDate = new Date(easterDate.getTime() - 2 * 24 * 60 * 60 * 1000);
  if (month === goodFridayDate.getUTCMonth() + 1 && day === goodFridayDate.getUTCDate()) {
    return true;
  }

  return false;
}

/**
 * Evaluates known CME Globex Metals special session early closes and holiday halts.
 * Source: CME Group Official Holiday Calendars & Special Executive Reports (SER).
 */
export function getCmeSpecialSessionStatus(
  year: number,
  month: number,
  day: number,
  dayOfWeek: number,
  hour: number,
  minute: number
): {
  status: MarketStatus;
  reason?: MarketCalendarReason;
  description: string;
  isSpecialSession: boolean;
  scheduleSource: string;
} | null {
  const currentMinutes = hour * 60 + minute;

  // 1. Thanksgiving Day (4th Thursday in November)
  const thanksgivingDay = getThanksgivingDay(year);
  if (month === 11 && day === thanksgivingDay) {
    if (currentMinutes >= 780 && currentMinutes < 1080) {
      // 13:00 to 18:00 ET: Holiday halt
      return {
        status: 'CLOSED',
        reason: 'SPECIAL_SESSION_HALT',
        description: 'CME Globex Metals holiday halt for Thanksgiving Day (13:00-18:00 ET). Trading resumes at 18:00 ET.',
        isSpecialSession: true,
        scheduleSource: 'CME Group Official Holiday Calendar — Thanksgiving Metals Schedule',
      };
    }
  }

  // 2. Black Friday (Day after Thanksgiving)
  if (month === 11 && day === thanksgivingDay + 1) {
    if (currentMinutes >= 825) {
      // 13:45 ET and after: Early close for weekend
      return {
        status: 'CLOSED',
        reason: 'EARLY_CLOSE',
        description: 'CME Globex Metals early holiday close for Black Friday at 13:45 ET. Reopens Sunday at 18:00 ET.',
        isSpecialSession: true,
        scheduleSource: 'CME Group Official Holiday Calendar — Black Friday Early Close',
      };
    }
  }

  // 3. Christmas Eve (December 24, weekday)
  if (month === 12 && day === 24 && dayOfWeek >= 1 && dayOfWeek <= 5) {
    if (currentMinutes >= 825) {
      // 13:45 ET and after: Early close ahead of Christmas
      return {
        status: 'CLOSED',
        reason: 'EARLY_CLOSE',
        description: 'CME Globex Metals early holiday close for Christmas Eve at 13:45 ET. Closed through Christmas Day.',
        isSpecialSession: true,
        scheduleSource: 'CME Group Official Holiday Calendar — Christmas Eve Early Close',
      };
    }
  }

  // 4. New Year's Eve (December 31, weekday)
  // Per CME Globex official schedule: Metals observe standard regular daytime trading hours until 17:00 ET close,
  // then remain closed through New Year's Day (Jan 1) until Jan 1 18:00 ET.
  if (month === 12 && day === 31 && dayOfWeek >= 1 && dayOfWeek <= 5) {
    if (currentMinutes >= 1020) {
      // 17:00 ET and after: Closed for New Year holiday
      return {
        status: 'CLOSED',
        reason: 'HOLIDAY',
        description: 'CME Globex Metals closed for New Year holiday at 17:00 ET. Reopens Jan 1 at 18:00 ET.',
        isSpecialSession: true,
        scheduleSource: 'CME Group Official Holiday Calendar — New Year Holiday Close',
      };
    }
  }

  // 5. US Federal Holidays with 13:00 to 18:00 ET Halts
  const mlkDay = getMlkDay(year);
  const presidentsDay = getPresidentsDay(year);
  const memorialDay = getMemorialDay(year);
  const laborDay = getLaborDay(year);
  const juneteenth = getJuneteenthObserved(year);
  const july4 = getIndependenceDayObserved(year);

  let federalHolidayName: string | null = null;
  if (month === 1 && day === mlkDay && dayOfWeek === 1) federalHolidayName = 'Martin Luther King Jr. Day';
  else if (month === 2 && day === presidentsDay && dayOfWeek === 1) federalHolidayName = "Presidents' Day";
  else if (month === 5 && day === memorialDay && dayOfWeek === 1) federalHolidayName = 'Memorial Day';
  else if (month === 9 && day === laborDay && dayOfWeek === 1) federalHolidayName = 'Labor Day';
  else if (month === juneteenth.month && day === juneteenth.day && dayOfWeek >= 1 && dayOfWeek <= 5) federalHolidayName = 'Juneteenth';
  else if (month === july4.month && day === july4.day && dayOfWeek >= 1 && dayOfWeek <= 5) federalHolidayName = 'Independence Day';

  if (federalHolidayName) {
    if (currentMinutes >= 780 && currentMinutes < 1080) {
      // 13:00 to 18:00 ET: Holiday halt
      return {
        status: 'CLOSED',
        reason: 'SPECIAL_SESSION_HALT',
        description: `CME Globex Metals holiday halt for ${federalHolidayName} (13:00-18:00 ET). Trading resumes at 18:00 ET.`,
        isSpecialSession: true,
        scheduleSource: `CME Group Official Holiday Calendar — ${federalHolidayName} Early Halt`,
      };
    }
  }

  return null;
}

/**
 * Evaluates the operational status of the global bullion market for a given reference date.
 */
export function getBullionMarketCalendarState(referenceDate: Date = new Date()): MarketCalendarState {
  const et = getEasternTimeComponents(referenceDate);
  const easternTimeIso = `${et.year}-${String(et.month).padStart(2, '0')}-${String(et.day).padStart(
    2,
    '0'
  )}T${String(et.hour).padStart(2, '0')}:${String(et.minute).padStart(2, '0')}:00 ET`;

  // 1. Good Friday Check (Full Day Closure)
  const easter = getEasterSunday(et.year);
  const easterDate = new Date(Date.UTC(et.year, easter.month - 1, easter.day));
  const goodFridayDate = new Date(easterDate.getTime() - 2 * 24 * 60 * 60 * 1000);
  if (et.month === goodFridayDate.getUTCMonth() + 1 && et.day === goodFridayDate.getUTCDate()) {
    return {
      status: 'CLOSED',
      reason: 'HOLIDAY',
      description: 'Global bullion markets are closed for Good Friday statutory holiday.',
      easternTimeIso,
      scheduleSource: 'CME Group Official Holiday Calendar — Good Friday Full Closure',
    };
  }

  // 2. Christmas Day (Dec 25) Check
  if (et.month === 12 && et.day === 25) {
    if (et.hour < 18) {
      return {
        status: 'CLOSED',
        reason: 'HOLIDAY',
        description: 'Global bullion markets are closed for Christmas Day statutory holiday.',
        easternTimeIso,
        scheduleSource: 'CME Group Official Holiday Calendar — Christmas Day Full Closure',
      };
    }
    // Dec 25 at 18:00+ ET: Reopens if weekday Monday-Thursday, otherwise closed for weekend
    if (et.dayOfWeek === 5 || et.dayOfWeek === 6) {
      return {
        status: 'CLOSED',
        reason: 'WEEKEND',
        description: 'Global bullion markets closed for weekend following Christmas. Opens Sunday 18:00 ET.',
        easternTimeIso,
        scheduleSource: 'CME Globex Standard Trading Hours',
      };
    }
    return {
      status: 'OPEN',
      description: 'Global bullion market active (CME Globex electronic session open following Christmas Day).',
      easternTimeIso,
      scheduleSource: 'CME Globex Standard Trading Hours',
    };
  }

  // 3. New Year's Day (Jan 1) Check
  if (et.month === 1 && et.day === 1) {
    if (et.hour < 18) {
      return {
        status: 'CLOSED',
        reason: 'HOLIDAY',
        description: "Global bullion markets are closed for New Year's Day statutory holiday.",
        easternTimeIso,
        scheduleSource: "CME Group Official Holiday Calendar — New Year's Day Full Closure",
      };
    }
    // Jan 1 at 18:00+ ET: Reopens if weekday Monday-Thursday, otherwise closed for weekend
    if (et.dayOfWeek === 5 || et.dayOfWeek === 6) {
      return {
        status: 'CLOSED',
        reason: 'WEEKEND',
        description: "Global bullion markets closed for weekend following New Year's Day. Opens Sunday 18:00 ET.",
        easternTimeIso,
        scheduleSource: 'CME Globex Standard Trading Hours',
      };
    }
    return {
      status: 'OPEN',
      description: "Global bullion market active (CME Globex electronic session open following New Year's Day).",
      easternTimeIso,
      scheduleSource: 'CME Globex Standard Trading Hours',
    };
  }

  // 4. Known CME Globex Metals Special Sessions & Early Closes
  const specialSession = getCmeSpecialSessionStatus(
    et.year,
    et.month,
    et.day,
    et.dayOfWeek,
    et.hour,
    et.minute
  );
  if (specialSession) {
    return {
      status: specialSession.status,
      reason: specialSession.reason,
      description: specialSession.description,
      easternTimeIso,
      isSpecialSession: specialSession.isSpecialSession,
      scheduleSource: specialSession.scheduleSource,
    };
  }

  // 5. Weekend Check
  // Saturday: all day closed
  if (et.dayOfWeek === 6) {
    return {
      status: 'CLOSED',
      reason: 'WEEKEND',
      description: 'Global bullion markets closed for weekend (Saturday). Opens Sunday 18:00 ET.',
      easternTimeIso,
      scheduleSource: 'CME Globex Standard Trading Hours',
    };
  }

  // Sunday: closed before 18:00 ET
  if (et.dayOfWeek === 0) {
    if (et.hour < 18) {
      return {
        status: 'CLOSED',
        reason: 'WEEKEND',
        description: 'Global bullion markets closed for weekend. Opens Sunday 18:00 ET.',
        easternTimeIso,
        scheduleSource: 'CME Globex Standard Trading Hours',
      };
    }
    // Sunday 18:00+ ET: Open (Asian session open)
    return {
      status: 'OPEN',
      description: 'Global bullion market active (Sydney/Tokyo session open).',
      easternTimeIso,
      scheduleSource: 'CME Globex Standard Trading Hours',
    };
  }

  // Friday: closes at 17:00 ET
  if (et.dayOfWeek === 5) {
    if (et.hour >= 17) {
      return {
        status: 'CLOSED',
        reason: 'WEEKEND',
        description: 'Global bullion markets closed for weekend at Friday 17:00 ET. Re-opens Sunday 18:00 ET.',
        easternTimeIso,
        scheduleSource: 'CME Globex Standard Trading Hours',
      };
    }
  }

  // Monday through Thursday: daily 1-hour maintenance break from 17:00 to 18:00 ET
  if (et.dayOfWeek >= 1 && et.dayOfWeek <= 4) {
    if (et.hour === 17) {
      return {
        status: 'MAINTENANCE',
        reason: 'DAILY_MAINTENANCE',
        description: 'Daily exchange settlement and clearing pause (17:00-18:00 ET). Trading resumes at 18:00 ET.',
        easternTimeIso,
        scheduleSource: 'CME Globex Daily Clearing Maintenance Schedule',
      };
    }
  }

  return {
    status: 'OPEN',
    description: 'Global bullion market actively trading.',
    easternTimeIso,
    isSpecialSession: false,
    scheduleSource: 'CME Globex Standard Trading Hours',
  };
}

/**
 * Formats milliseconds into human-readable duration (e.g. "4m ago", "2h 15m ago").
 */
export function formatAge(ms: number): string {
  if (ms < 0) return 'Just now (clock skew)';
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (hours < 24) return remainingMins > 0 ? `${hours}h ${remainingMins}m ago` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Evaluates market-data freshness and explicit provenance for precious metals quotes.
 */
export function evaluateQuoteFreshness(input: FreshnessEvaluationInput): FreshnessEvaluation {
  const now = input.nowMs ?? Date.now();
  const retrievedAtMs = input.retrievedAtMs ?? now;
  const sourceName = input.providerName || 'Gold API — Spot Reference';

  // 1. Manual User Override State
  if (input.isManualOverride) {
    return {
      state: 'MANUAL_OVERRIDE',
      badgeLabel: 'MANUAL OVERRIDE',
      badgeSubtext: 'User custom rate benchmark',
      badgeColor: 'amber',
      isLive: false,
      ageMs: null,
      ageReadable: 'Manual entry',
      marketStatus: 'OPEN',
      detail: 'User custom rate benchmark. Live market rates have been overridden for customized valuation.',
      provenance: {
        sourceName: 'User Manual Input',
        quoteTimestamp: null,
        retrievalTimestamp: new Date(retrievedAtMs).toISOString(),
        evaluationTimestamp: new Date(now).toISOString(),
        marketState: 'MANUAL_OVERRIDE',
        isManual: true,
        isFallback: false,
        note: 'Rate was manually specified by the user for testing hypothetical pricing, custom jeweler quotes, or offline valuation.',
      },
    };
  }

  // 2. Verified Fallback Reference Benchmark
  if (input.isFallback) {
    return {
      state: 'FALLBACK_BENCHMARK',
      badgeLabel: 'FALLBACK BENCHMARK',
      badgeSubtext: 'Verified baseline (API unavailable)',
      badgeColor: 'slate',
      isLive: false,
      ageMs: null,
      ageReadable: 'Static baseline',
      marketStatus: 'CLOSED',
      detail: 'Live market connection unavailable. Values are computed using verified reference benchmarks.',
      provenance: {
        sourceName: 'Verified Baseline Reference',
        quoteTimestamp: null,
        retrievalTimestamp: new Date(retrievedAtMs).toISOString(),
        evaluationTimestamp: new Date(now).toISOString(),
        marketState: 'FALLBACK_BENCHMARK',
        isManual: false,
        isFallback: true,
        note: 'Live connection to upstream financial market provider could not be established. Calculations use verified statutory reference benchmarks.',
      },
      warning: 'Live market connection unavailable. Values are computed using verified reference benchmarks.',
    };
  }

  // 3. Timestamp Validation & Clock Skew Detection
  const quoteTs = input.providerTimestampMs;
  if (quoteTs === undefined || quoteTs === null || !Number.isFinite(quoteTs) || quoteTs <= 0) {
    return {
      state: 'UNVERIFIED_TIMESTAMP',
      badgeLabel: 'UNVERIFIED QUOTE',
      badgeSubtext: 'Provider timestamp missing',
      badgeColor: 'slate',
      isLive: false,
      ageMs: null,
      ageReadable: 'Unknown age',
      marketStatus: 'OPEN',
      detail: 'Provider returned quote without a verified timestamp. Not labeled as live.',
      provenance: {
        sourceName,
        quoteTimestamp: null,
        retrievalTimestamp: new Date(retrievedAtMs).toISOString(),
        evaluationTimestamp: new Date(now).toISOString(),
        marketState: 'UNVERIFIED_TIMESTAMP',
        isManual: false,
        isFallback: false,
        note: 'Provider did not supply a valid quote timestamp. Data cannot be verified as live.',
      },
      warning: 'Provider returned quote without a verified timestamp. Not labeled as live.',
    };
  }

  const ageMs = now - quoteTs;

  // Future timestamp clock skew (> 5 minutes into the future)
  if (ageMs < -300000) {
    return {
      state: 'UNVERIFIED_TIMESTAMP',
      badgeLabel: 'CLOCK SKEW DETECTED',
      badgeSubtext: 'Provider timestamp in future',
      badgeColor: 'rose',
      isLive: false,
      ageMs,
      ageReadable: 'Future timestamp',
      marketStatus: 'OPEN',
      detail: 'Provider timestamp appears in the future. Quote treated as unverified.',
      provenance: {
        sourceName,
        quoteTimestamp: new Date(quoteTs).toISOString(),
        retrievalTimestamp: new Date(retrievedAtMs).toISOString(),
        evaluationTimestamp: new Date(now).toISOString(),
        marketState: 'CLOCK_SKEW',
        isManual: false,
        isFallback: false,
        note: `Provider timestamp is ${Math.round(Math.abs(ageMs) / 1000)}s ahead of current system time.`,
      },
      warning: 'Provider timestamp appears in the future. Quote treated as unverified.',
    };
  }

  // 4. Market Calendar Assessment
  const calendar = getBullionMarketCalendarState(new Date(now));
  const ageReadable = formatAge(Math.max(0, ageMs));

  // If market is closed (Weekend, Holiday, Maintenance, Early Close, or Special Session Halt)
  if (calendar.status !== 'OPEN') {
    const isEarly = calendar.reason === 'EARLY_CLOSE' || calendar.reason === 'SPECIAL_SESSION_HALT';
    const badgeLabel = isEarly
      ? 'LAST-KNOWN CLOSE (EARLY CLOSE)'
      : 'LAST-KNOWN CLOSE (MARKET CLOSED)';

    return {
      state: 'MARKET_CLOSED',
      badgeLabel,
      badgeSubtext: calendar.description,
      badgeColor: 'blue',
      isLive: false,
      ageMs,
      ageReadable,
      marketStatus: calendar.status,
      detail: `Global bullion market is closed (${calendar.description}). Displaying last-known session close.`,
      provenance: {
        sourceName,
        quoteTimestamp: new Date(quoteTs).toISOString(),
        retrievalTimestamp: new Date(retrievedAtMs).toISOString(),
        evaluationTimestamp: new Date(now).toISOString(),
        marketState: `MARKET_CLOSED (${calendar.reason || 'MAINTENANCE'})`,
        isManual: false,
        isFallback: false,
        note: `Global wholesale bullion markets are closed (${calendar.description}). Displayed quote represents the last-known session settlement price.`,
        scheduleSource: calendar.scheduleSource,
      },
    };
  }

  // 5. Open Market Cadence Thresholds (Closure is NEVER inferred solely from quote age)
  // LIVE: within 15 minutes during open trading session
  const LIVE_THRESHOLD_MS = 15 * 60 * 1000;
  // DELAYED: 15m to 4 hours during open session
  const DELAYED_THRESHOLD_MS = 4 * 60 * 60 * 1000;

  if (ageMs <= LIVE_THRESHOLD_MS) {
    return {
      state: 'LIVE',
      badgeLabel: 'LIVE SPOT',
      badgeSubtext: `Updated ${ageReadable}`,
      badgeColor: 'emerald',
      isLive: true,
      ageMs,
      ageReadable,
      marketStatus: 'OPEN',
      detail: `Live streaming spot rate (updated ${ageReadable}) from active OTC trading session.`,
      provenance: {
        sourceName,
        quoteTimestamp: new Date(quoteTs).toISOString(),
        retrievalTimestamp: new Date(retrievedAtMs).toISOString(),
        evaluationTimestamp: new Date(now).toISOString(),
        marketState: 'OPEN',
        isManual: false,
        isFallback: false,
        note: 'Live streaming spot reference price from active OTC trading session.',
        scheduleSource: calendar.scheduleSource,
      },
    };
  }

  if (ageMs <= DELAYED_THRESHOLD_MS) {
    return {
      state: 'DELAYED',
      badgeLabel: 'DELAYED SPOT',
      badgeSubtext: `Quote is ${ageReadable}`,
      badgeColor: 'blue',
      isLive: false,
      ageMs,
      ageReadable,
      marketStatus: 'OPEN',
      detail: `Delayed spot quote (${ageReadable}) during active market hours. Market closure is not inferred from quote age alone; an unmodeled special session or emergency pause is possible.`,
      provenance: {
        sourceName,
        quoteTimestamp: new Date(quoteTs).toISOString(),
        retrievalTimestamp: new Date(retrievedAtMs).toISOString(),
        evaluationTimestamp: new Date(now).toISOString(),
        marketState: 'OPEN_DELAYED',
        isManual: false,
        isFallback: false,
        note: `Market is open per official exchange calendar, but quote was received ${ageReadable}. Standard exchange delay, upstream polling lag, or an unmodeled special session / emergency exchange halt may be active. Market closure is not inferred from quote age alone.`,
        unmodeledSpecialSessionPossible: true,
        scheduleSource: calendar.scheduleSource,
      },
    };
  }

  // STALE: > 4 hours during open market hours
  return {
    state: 'STALE',
    badgeLabel: 'STALE FEED',
    badgeSubtext: `Quote is ${ageReadable} (feed delayed)`,
    badgeColor: 'amber',
    isLive: false,
    ageMs,
    ageReadable,
    marketStatus: 'OPEN',
    detail: `Quote is ${ageReadable} during active trading session. Upstream market feed is lagging or halted. Market closure is not inferred from quote age alone; an unmodeled special session or emergency pause is possible.`,
    provenance: {
      sourceName,
      quoteTimestamp: new Date(quoteTs).toISOString(),
      retrievalTimestamp: new Date(retrievedAtMs).toISOString(),
      evaluationTimestamp: new Date(now).toISOString(),
      marketState: 'OPEN_STALE',
      isManual: false,
      isFallback: false,
      note: `Market is open per calendar, but quote is ${ageReadable}. Indicates upstream feed stagnation. If an unmodeled special session, emergency halt, or unscheduled closure has been enacted by CME Group, quote stagnation will continue until regular trading is restored. Market closure is not inferred from quote age alone.`,
      unmodeledSpecialSessionPossible: true,
      scheduleSource: calendar.scheduleSource,
    },
    warning: `Quote is ${ageReadable} during active market session. Upstream feed may be lagging or halted.`,
  };
}
