import { SITE_URL } from '@/config/site';
import { tools } from '@/config/toolsData';

export async function GET() {
  let markdown = `# KivaroTools - Free Developer & Finance Utilities\n\n`;
  markdown += `> A privacy-first, client-side processed collection of web tools. No registration required. Data never leaves your browser.\n\n`;
  
  markdown += `## Available Tools\n\n`;
  
  tools.filter(t => !t.hidden && t.status === 'published').forEach(tool => {
    markdown += `- [${tool.name}](${SITE_URL}/${tool.categoryId}/${tool.slug}): ${tool.description}\n`;
  });

  markdown += `\n## Financial Calculators (Global)\n`;
  markdown += `- KivaroTools offers exact post-tax salary calculation for 22 jurisdictions including the US, UK, Germany, India, and Pakistan at: ${SITE_URL}/finance/salary-calculator/[country-name]\n`;

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
