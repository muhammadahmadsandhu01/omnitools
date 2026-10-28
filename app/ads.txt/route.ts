export async function GET() {
  const rawPubId = process.env.NEXT_PUBLIC_ADSENSE_ID || 'ca-pub-0000000000000000';
  const pubId = rawPubId.replace(/^ca-/, '');
  const body = `# KivaroTools Authorized Digital Sellers (IAB Tech Lab ads.txt v1.1)\ngoogle.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`;
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
