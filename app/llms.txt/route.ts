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
  let markdown = `# KivaroTools — Enterprise-Grade Client-Side Web Utilities

`;
  markdown += `> Powerful Tools. Private by Design. KivaroTools (${SITE_URL}) provides 42 free enterprise-grade online tools and 22 statutory country salary calculators (64 total specialized utilities). 100% of file conversions, binary database inspections, cryptographic token debugging, PDF redaction/signing/Bates stamping, code formatting, and financial calculations execute locally in the user's browser with zero server uploads and zero registration walls.

`;

  markdown += `## Core Architecture & Privacy Guarantees

`;
  markdown += `- **100% Client-Side Execution:** Built on Web Workers, Web Cryptography API, HTML5 Canvas, OffscreenCanvas, and WebAssembly.
`;
  markdown += `- **Zero Server Data Retention:** Confidential files (PDF contracts, bank statements, SQLite/DuckDB databases, Apache Parquet/Avro/Feather files, HAR network captures, JWT/PASETO/SAML tokens, OpenAPI specs, HEIC/AVIF photos, Word/Excel/PowerPoint OpenXML archives, and salary figures) never leave the client device.
`;
  markdown += `- **Deterministic & Standards-Compliant:** Implements ISO 32000-1 PDF 1.7 (/Type /Sig /ByteRange & 12-surface Deep CDR redaction), ECMA-376 OpenXML (.docx, .xlsx, .pptx), RFC 8259 (JSON), RFC 7519/7516/9901 (JWT/JWE/SD-JWT), OASIS SAML 2.0, PASETO v1–v4, SQLite 3 B-Tree, Apache Parquet/Avro/Arrow IPC, RFC 4180 (CSV with CWE-1236 formula injection defense), ISO 4217 (160+ currencies), and 2026–2027 statutory tax schedules.

`;

  for (const cat of categories.filter((c) => !c.hidden)) {
    markdown += `## ${cat.name} (${SITE_URL}/${cat.id})

`;
    const catTools = tools.filter((t) => t.categoryId === cat.id && t.status === 'published' && !t.hidden);
    for (const tool of catTools) {
      const topKws = tool.keywords && tool.keywords.length > 0 ? ` (Keywords: ${tool.keywords.slice(0, 6).join(', ')})` : '';
      markdown += `- [${tool.name}](${SITE_URL}/${tool.categoryId}/${tool.slug}): ${tool.description}${topKws}
`;
    }
    markdown += `
`;
  }

  markdown += `## 22 Statutory Country Salary & Take-Home Pay Calculators (${SITE_URL}/finance/salary-calculator)

`;
  for (const c of COUNTRY_SLUGS) {
    markdown += `- [${c.name}](${SITE_URL}/finance/salary-calculator/${c.slug})
`;
  }

  markdown += `
## Company & Legal Documentation

`;
  markdown += `- [About KivaroTools](${SITE_URL}/about)
`;
  markdown += `- [Contact & Support](${SITE_URL}/contact)
`;
  markdown += `- [Privacy Policy](${SITE_URL}/privacy)
`;
  markdown += `- [Terms of Service](${SITE_URL}/terms)
`;
  markdown += `- [XML Sitemap](${SITE_URL}/sitemap.xml)
`;

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}