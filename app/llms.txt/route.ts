import { SITE_URL } from '@/config/site';
import { categories, tools } from '@/config/toolsData';

const COUNTRY_SLUGS = [
  { slug: 'united-states', name: 'United States (IRS Federal, FICA & 50-State Payroll)' },
  { slug: 'united-kingdom', name: 'United Kingdom (HMRC PAYE, Personal Allowance Taper & Class 1 NI)' },
  { slug: 'germany', name: 'Germany (BMF EStG, Steuerklasse I–VI, Soli & Sozialversicherung)' },
  { slug: 'india', name: 'India (CBDT Section 115BAC New & Old Tax Regimes + Section 87A Rebate)' },
  { slug: 'pakistan', name: 'Pakistan (FBR Salaried Income Tax Slabs & EOBI Contributions)' },
  { slug: 'canada', name: 'Canada (CRA Federal Tax, BPA, CPP, EI & Provincial Benchmarks)' },
  { slug: 'australia', name: 'Australia (ATO Stage 3 Tax Brackets, LITO, Medicare & Super Guarantee)' },
  { slug: 'singapore', name: 'Singapore (IRAS Progressive Tax & CPF Ordinary Wage Ceilings)' },
  { slug: 'united-arab-emirates', name: 'United Arab Emirates (0% PIT, GPSSA Nationals & Expat Gratuity)' },
  { slug: 'saudi-arabia', name: 'Saudi Arabia (0% PIT, GOSI Nationals & SANED Unemployment)' },
  { slug: 'france', name: 'France (DGFiP Barème Progressif IR & URSSAF Social Charges)' },
  { slug: 'japan', name: 'Japan (NTA Shotokuzei, Juminzei Resident Tax & Shakai Hoken)' },
  { slug: 'switzerland', name: 'Switzerland (ESTV Direct Federal Tax, Cantonal Benchmarks & AHV/ALV/BVG)' },
  { slug: 'netherlands', name: 'Netherlands (Belastingdienst Box 1, AHK, Arbeidskorting & 30% Ruling)' },
  { slug: 'ireland', name: 'Ireland (Revenue PAYE, Universal Social Charge USC & PRSI Class A)' },
  { slug: 'new-zealand', name: 'New Zealand (IRD PAYE Brackets, ACC Earners Levy & KiwiSaver)' },
  { slug: 'spain', name: 'Spain (AEAT Dual State/Autonomous IRPF & Seguridad Social)' },
  { slug: 'italy', name: 'Italy (Agenzia delle Entrate 3-Bracket IRPEF, Addizionali & INPS)' },
  { slug: 'south-africa', name: 'South Africa (SARS Progressive PAYE, Primary Rebate & UIF)' },
  { slug: 'brazil', name: 'Brazil (Receita Federal IRPF, Progressive CLT INSS & FGTS)' },
  { slug: 'mexico', name: 'Mexico (SAT Art. 152 Annual ISR Tariff & IMSS Cuotas)' },
  { slug: 'south-korea', name: 'South Korea (NTS Progressive Income Tax & 4 Major Social Insurances)' },
];

export async function GET() {
  let markdown = `# KivaroTools — Enterprise-Grade Client-Side Web Utilities\n\n`;
  markdown += `> Powerful Tools. Private by Design. KivaroTools (${SITE_URL}) provides 30+ free enterprise-grade online tools and 22 statutory country salary calculators. 100% of file conversions, cryptographic operations, code formatting, and financial calculations execute locally in the user's browser with zero server uploads and zero registration walls.\n\n`;

  markdown += `## Core Architecture & Privacy Guarantees\n\n`;
  markdown += `- **100% Client-Side Execution:** Built on Web Workers, Web Cryptography API, HTML5 Canvas, OffscreenCanvas, and WebAssembly.\n`;
  markdown += `- **Zero Server Data Retention:** Confidential files (PDFs, Word/Excel/PowerPoint OpenXML archives, images, JSON datasets, SQL schemas, passwords, invoices, and salary figures) never leave the client device.\n`;
  markdown += `- **Deterministic & Standards-Compliant:** Implements ECMA-376 OpenXML (.docx, .xlsx, .pptx), RFC 8259 (JSON), RFC 4648 (Base64/Base64URL), RFC 4180 (CSV with CWE-1236 formula injection defense), ISO 4217 (160+ currencies), BIPM/NIST (precious metals metrology), and official statutory tax schedules.\n\n`;

  for (const cat of categories.filter((c) => !c.hidden)) {
    markdown += `## ${cat.name} (${SITE_URL}/${cat.id})\n\n`;
    const catTools = tools.filter((t) => t.categoryId === cat.id && t.status === 'published' && !t.hidden);
    for (const tool of catTools) {
      markdown += `- [${tool.name}](${SITE_URL}/${tool.categoryId}/${tool.slug}): ${tool.description}\n`;
    }
    markdown += `\n`;
  }

  markdown += `## 22 Statutory Country Salary & Take-Home Pay Calculators (${SITE_URL}/finance/salary-calculator)\n\n`;
  for (const c of COUNTRY_SLUGS) {
    markdown += `- [${c.name}](${SITE_URL}/finance/salary-calculator/${c.slug})\n`;
  }

  markdown += `\n## Company & Legal Documentation\n\n`;
  markdown += `- [About KivaroTools](${SITE_URL}/about)\n`;
  markdown += `- [Contact & Support](${SITE_URL}/contact)\n`;
  markdown += `- [Privacy Policy](${SITE_URL}/privacy)\n`;
  markdown += `- [Terms of Service](${SITE_URL}/terms)\n`;
  markdown += `- [XML Sitemap](${SITE_URL}/sitemap.xml)\n`;

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
