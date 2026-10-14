import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export type SupportedMetal = 'XAU' | 'XAG' | 'XPT' | 'XPD';
export type SupportedTimeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';

interface MetalConfig {
  symbol: string;
  exchange: 'COMEX' | 'NYMEX';
  instrumentName: string;
  unit: string;
}

const METAL_CONFIGS: Record<SupportedMetal, MetalConfig> = {
  XAU: {
    symbol: 'GC=F',
    exchange: 'COMEX',
    instrumentName: 'COMEX Gold Futures (Active Front-Month Indicative Contract)',
    unit: 'USD per troy ounce',
  },
  XAG: {
    symbol: 'SI=F',
    exchange: 'COMEX',
    instrumentName: 'COMEX Silver Futures (Active Front-Month Indicative Contract)',
    unit: 'USD per troy ounce',
  },
  XPT: {
    symbol: 'PL=F',
    exchange: 'NYMEX',
    instrumentName: 'NYMEX Platinum Futures (Active Front-Month Indicative Contract)',
    unit: 'USD per troy ounce',
  },
  XPD: {
    symbol: 'PA=F',
    exchange: 'NYMEX',
    instrumentName: 'NYMEX Palladium Futures (Active Front-Month Indicative Contract)',
    unit: 'USD per troy ounce',
  },
};

interface TimeframeConfig {
  range: string;
  interval: string;
  description: string;
}

const TIMEFRAME_CONFIGS: Record<SupportedTimeframe, TimeframeConfig> = {
  '1D': { range: '1d', interval: '15m', description: 'Intraday 15-minute intervals' },
  '1W': { range: '5d', interval: '60m', description: '5 trading days, 1-hour intervals' },
  '1M': { range: '1mo', interval: '1d', description: '1 month, daily close' },
  '3M': { range: '3mo', interval: '1d', description: '3 months, daily close' },
  '6M': { range: '6mo', interval: '1d', description: '6 months, daily close' },
  '1Y': { range: '1y', interval: '1wk', description: '1 year, weekly close' },
};

export function formatIsoDate(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  const mm = pad(d.getUTCMonth() + 1);
  const dd = pad(d.getUTCDate());
  return `${yyyy}-${mm}-${dd}`;
}

export function formatPointDate(
  ms: number,
  timeframe: SupportedTimeframe,
  timezone: string = 'America/New_York'
): string {
  const d = new Date(ms);
  try {
    if (timeframe === '1D') {
      // For intraday 1D, format as HH:mm in exchange timezone (e.g. 09:30, 10:15)
      return d.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
    if (timeframe === '1W') {
      // For 1W (5 trading days), format as e.g. "Oct 14 09:30"
      const month = d.toLocaleDateString('en-US', { timeZone: timezone, month: 'short' });
      const day = d.toLocaleDateString('en-US', { timeZone: timezone, day: 'numeric' });
      const time = d.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      return `${month} ${day} ${time}`;
    }
  } catch {
    // Fallback if timezone string is unsupported
  }
  return formatIsoDate(ms);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawMetal = (searchParams.get('metal') || 'XAU').toUpperCase();
  const rawTimeframe = (searchParams.get('timeframe') || '1M').toUpperCase();

  // Parameter validation
  if (!Object.prototype.hasOwnProperty.call(METAL_CONFIGS, rawMetal)) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid metal code '${rawMetal}'. Supported metals: XAU, XAG, XPT, XPD.`,
      },
      { status: 400 }
    );
  }

  if (!Object.prototype.hasOwnProperty.call(TIMEFRAME_CONFIGS, rawTimeframe)) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid timeframe '${rawTimeframe}'. Supported timeframes: 1D, 1W, 1M, 3M, 6M, 1Y.`,
      },
      { status: 400 }
    );
  }

  const metal = rawMetal as SupportedMetal;
  const timeframe = rawTimeframe as SupportedTimeframe;
  const metalConfig = METAL_CONFIGS[metal];
  const tfConfig = TIMEFRAME_CONFIGS[timeframe];

  const upstreamUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    metalConfig.symbol
  )}?range=${tfConfig.range}&interval=${tfConfig.interval}&includePrePost=false&events=div%7Csplit`;

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
      // Cache server response for 2 minutes, allow serving stale while revalidating
      next: { revalidate: 120 },
    });

    if (upstreamRes.status === 429) {
      return NextResponse.json(
        {
          success: false,
          metal,
          timeframe,
          isRateLimited: true,
          error: 'Upstream market data rate limit reached (HTTP 429). Please wait a moment and retry.',
          source: `${metalConfig.exchange} via Yahoo Finance Chart API`,
        },
        { status: 429 }
      );
    }

    if (!upstreamRes.ok) {
      return NextResponse.json(
        {
          success: false,
          metal,
          timeframe,
          error: `Upstream market data provider returned HTTP ${upstreamRes.status}.`,
          source: `${metalConfig.exchange} via Yahoo Finance Chart API`,
        },
        { status: 502 }
      );
    }

    const payload = await upstreamRes.json();
    const result = payload?.chart?.result?.[0];

    if (!result) {
      const upstreamError = payload?.chart?.error?.description || 'No chart data returned for symbol.';
      return NextResponse.json(
        {
          success: false,
          metal,
          timeframe,
          error: upstreamError,
          source: `${metalConfig.exchange} via Yahoo Finance Chart API`,
        },
        { status: 502 }
      );
    }

    const timestamps = (result.timestamp || []) as number[];
    const quotes = result.indicators?.quote?.[0] || {};
    const closes = (quotes.close || []) as (number | null)[];
    const opens = (quotes.open || []) as (number | null)[];
    const highs = (quotes.high || []) as (number | null)[];
    const lows = (quotes.low || []) as (number | null)[];
    const volumes = (quotes.volume || []) as (number | null)[];

    const meta = result.meta || {};
    const regularMarketPrice = Number(meta.regularMarketPrice);
    const previousClose = Number(meta.previousClose ?? meta.chartPreviousClose);
    const currency = meta.currency || 'USD';
    const exchangeTimezoneName = meta.exchangeTimezoneName || 'America/New_York';
    const instrumentType = 'futures';

    const points = [];
    for (let i = 0; i < timestamps.length; i++) {
      const c = closes[i];
      if (c !== null && c !== undefined && Number.isFinite(c) && c > 0) {
        const tsMs = timestamps[i] * 1000;
        points.push({
          timestamp: tsMs,
          date: formatPointDate(tsMs, timeframe, exchangeTimezoneName),
          isoDate: formatIsoDate(tsMs),
          price: Number(c.toFixed(2)),
          close: Number(c.toFixed(2)),
          open: opens[i] != null && Number.isFinite(opens[i]) ? Number(opens[i]!.toFixed(2)) : undefined,
          high: highs[i] != null && Number.isFinite(highs[i]) ? Number(highs[i]!.toFixed(2)) : undefined,
          low: lows[i] != null && Number.isFinite(lows[i]) ? Number(lows[i]!.toFixed(2)) : undefined,
          volume: volumes[i] != null && Number.isFinite(volumes[i]) ? Math.round(volumes[i]!) : undefined,
        });
      }
    }

    // Sort chronologically ascending
    points.sort((a, b) => a.timestamp - b.timestamp);

    if (points.length === 0) {
      return NextResponse.json(
        {
          success: false,
          metal,
          timeframe,
          error: 'No active trade settlements recorded for this symbol during the selected timeframe.',
          source: `${metalConfig.exchange} via Yahoo Finance Chart API`,
        },
        { status: 404 }
      );
    }

    const responseBody = {
      success: true,
      metal,
      symbol: metalConfig.symbol,
      instrumentName: metalConfig.instrumentName,
      instrumentType, // Explicit distinction: futures contract, NOT spot quote
      timeframe,
      timeframeDescription: tfConfig.description,
      currency,
      unit: metalConfig.unit,
      dataPointsCount: points.length,
      points,
      retrievedAt: new Date().toISOString(),
      provenance: {
        provider: 'Yahoo Finance (Public Indicative Futures Quotes)',
        exchange: metalConfig.exchange,
        timezone: exchangeTimezoneName,
        regularMarketPrice: Number.isFinite(regularMarketPrice) ? regularMarketPrice : undefined,
        previousClose: Number.isFinite(previousClose) ? previousClose : undefined,
        note: 'Chart time-series reflects indicative commodity futures settlement reference points sourced via Yahoo Finance public indicators. It is not an official direct CME Group/COMEX exchange data feed and quotes may be delayed. Spot cash prices deviate from futures based on physical delivery premiums, basis spread, and dealer carrying costs.',
      },
    };

    return NextResponse.json(responseBody, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown upstream error';
    return NextResponse.json(
      {
        success: false,
        metal,
        timeframe,
        error: `Failed to retrieve market history: ${msg}`,
        source: 'Yahoo Finance Public Chart API',
      },
      { status: 504 }
    );
  }
}
