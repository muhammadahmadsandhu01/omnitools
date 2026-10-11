import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns';
import { parseHtmlMetadata } from '@/lib/metaGeneratorEngine';
import { SITE_URL } from '@/config/site';

export const runtime = 'nodejs';

/**
 * Checks if an IPv4 address is in a private, loopback, or reserved range.
 */
export function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // malformed, treat as unsafe
  }

  const [a, b] = parts;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;
  // 10.0.0.0/8 (Private)
  if (a === 10) return true;
  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;
  // 100.64.0.0/10 (Shared address / CGNAT)
  if (a === 100 && b >= 64 && b <= 127) return true;
  // 169.254.0.0/16 (Link-local)
  if (a === 169 && b === 254) return true;
  // 172.16.0.0/12 (Private)
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16 (Private)
  if (a === 192 && b === 168) return true;
  // 198.18.0.0/15 (Benchmark testing)
  if (a === 198 && (b === 18 || b === 19)) return true;
  // 224.0.0.0/4 (Multicast)
  if (a >= 224 && a <= 239) return true;
  // 240.0.0.0/4 (Reserved)
  if (a >= 240) return true;

  return false;
}

/**
 * Checks if an IPv6 address is in a private, loopback, or reserved range.
 */
export function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  // ::1 loopback
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;
  // :: unspecified
  if (normalized === '::' || normalized === '0:0:0:0:0:0:0:0') return true;
  // fe80::/10 link-local
  if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true;
  // fc00::/7 & fd00::/8 unique local
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  // ff00::/8 multicast
  if (normalized.startsWith('ff')) return true;

  // IPv4-mapped IPv6 (::ffff:192.168.1.1)
  if (normalized.includes('::ffff:')) {
    const ipv4Part = normalized.split('::ffff:')[1];
    if (ipv4Part && ipv4Part.includes('.')) {
      return isPrivateIPv4(ipv4Part);
    }
    return true;
  }

  return false;
}

/**
 * Validates a target URL against SSRF, internal DNS resolution, and unsafe schemes.
 */
export async function validateUrlForSsrf(urlString: string): Promise<URL> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlString);
  } catch {
    throw new Error('Invalid URL format');
  }

  // Only permit HTTP and HTTPS
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new Error('Unsupported protocol. Only http: and https: are allowed.');
  }

  // Reject embedded credentials
  if (parsedUrl.username || parsedUrl.password) {
    throw new Error('URLs with embedded credentials are not permitted.');
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Reject local and internal hostnames directly
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.arpa') ||
    hostname.endsWith('.onion')
  ) {
    throw new Error('Access to local and internal addresses is prohibited.');
  }

  // Direct IP checks
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    if (isPrivateIPv4(hostname)) {
      throw new Error('Access to private or local IPv4 addresses is prohibited.');
    }
  }

  if (hostname.includes(':') || (hostname.startsWith('[') && hostname.endsWith(']'))) {
    const rawIpv6 = hostname.replace(/^\[|\]$/g, '');
    if (isPrivateIPv6(rawIpv6)) {
      throw new Error('Access to private or local IPv6 addresses is prohibited.');
    }
  }

  // Resolve hostname via DNS and check all returned IP addresses
  try {
    const records = await dns.promises.lookup(hostname, { all: true });
    if (!records || records.length === 0) {
      throw new Error('Unable to resolve domain name.');
    }

    for (const record of records) {
      if (record.family === 4 && isPrivateIPv4(record.address)) {
        throw new Error('Domain resolves to a prohibited private or loopback IP address.');
      }
      if (record.family === 6 && isPrivateIPv6(record.address)) {
        throw new Error('Domain resolves to a prohibited private or loopback IPv6 address.');
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('prohibited')) {
      throw err;
    }
    throw new Error('DNS resolution failed for the specified host.');
  }

  return parsedUrl;
}

/**
 * POST /api/inspect-meta
 * Safely inspects a remote public web page and returns extracted metadata tags.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetUrl = (body?.url || '').trim();

    if (!targetUrl) {
      return NextResponse.json({ error: 'URL is required.' }, { status: 400 });
    }

    let currentUrl = targetUrl;
    let finalHtml = '';
    const maxRedirects = 3;

    for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount++) {
      const validatedUrl = await validateUrlForSsrf(currentUrl);

      // Perform fetch with strict timeout and manual redirect handling
      const response = await fetch(validatedUrl.toString(), {
        method: 'GET',
        headers: {
          'User-Agent':
            `Mozilla/5.0 (compatible; OmniTools-MetaInspector/1.0; +${SITE_URL})`,
          Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'manual',
        signal: AbortSignal.timeout(6000),
      });

      // Handle Redirects safely
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location) {
          return NextResponse.json(
            { error: 'Redirect received without Location header.' },
            { status: 502 }
          );
        }

        if (redirectCount === maxRedirects) {
          return NextResponse.json(
            { error: 'Maximum redirect limit exceeded.' },
            { status: 508 }
          );
        }

        // Resolve relative redirects against validatedUrl
        const resolvedRedirect = new URL(location, validatedUrl).toString();
        currentUrl = resolvedRedirect;
        continue;
      }

      if (!response.ok) {
        return NextResponse.json(
          {
            error: `Remote server responded with HTTP status ${response.status} (${response.statusText}).`,
          },
          { status: 502 }
        );
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        return NextResponse.json(
          {
            error: `Target URL returned non-HTML content (${contentType || 'unknown'}). Only HTML documents can be inspected.`,
          },
          { status: 415 }
        );
      }

      // Read at most 256 KB of HTML (more than enough for the <head> tags)
      const reader = response.body?.getReader();
      if (!reader) {
        finalHtml = await response.text();
      } else {
        const chunks: Uint8Array[] = [];
        let totalBytes = 0;
        const maxBytes = 256 * 1024; // 256 KB

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            totalBytes += value.length;
            if (totalBytes >= maxBytes) {
              await reader.cancel();
              break;
            }
          }
        }

        const decoder = new TextDecoder('utf-8');
        finalHtml = chunks.map((c) => decoder.decode(c, { stream: true })).join('') + decoder.decode();
      }

      break;
    }

    if (!finalHtml) {
      return NextResponse.json(
        { error: 'Received empty response body from target URL.' },
        { status: 502 }
      );
    }

    // Parse extracted metadata safely
    const parsedMetadata = parseHtmlMetadata(finalHtml);

    return NextResponse.json({
      success: true,
      url: currentUrl,
      metadata: parsedMetadata,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred while inspecting the URL.';
    const isSecurityOrValidationError =
      message.includes('prohibited') ||
      message.includes('Invalid') ||
      message.includes('credentials') ||
      message.includes('protocol') ||
      message.includes('DNS');

    return NextResponse.json(
      { error: message },
      { status: isSecurityOrValidationError ? 400 : 500 }
    );
  }
}
