import { CONTACT_EMAIL } from '@/config/site';

/**
 * IAB Tech Lab ads.txt v1.1 Route Handler (`https://kivarotools.com/ads.txt`)
 * Validates NEXT_PUBLIC_ADSENSE_ID so a dummy all-zero placeholder is never emitted
 * to Google AdSense verification bots (Mediapartners-Google / Google-Display-Ads-Bot).
 */
export async function GET() {
  const rawPubId = (process.env.NEXT_PUBLIC_ADSENSE_ID || '').trim();
  const normalizedPubId = rawPubId.replace(/^ca-/, '');
  const isValidPubId = /^pub-(?!0+$)\d{10,20}$/.test(normalizedPubId);

  const lines: string[] = [
    '# KivaroTools Authorized Digital Sellers (IAB Tech Lab ads.txt v1.1)',
    'OWNERDOMAIN=kivarotools.com',
  ];

  if (CONTACT_EMAIL) {
    lines.push(`CONTACT=${CONTACT_EMAIL}`);
  }

  if (isValidPubId) {
    lines.push(`google.com, ${normalizedPubId}, DIRECT, f08c47fec0942fa0`);
  } else {
    lines.push(
      '# Configure NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX in your environment variables to activate the live Google seller record.'
    );
  }

  const body = `${lines.join('\n')}\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}