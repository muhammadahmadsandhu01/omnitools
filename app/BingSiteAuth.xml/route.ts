export async function GET() {
  const xml = `<?xml version="1.0"?>\n<users>\n\t<user>7E84D5AEA17F465BC45D70FAE5117606</user>\n</users>\n`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
