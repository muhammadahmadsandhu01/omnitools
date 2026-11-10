import type { Metadata } from 'next';
import Link from 'next/link';
import HomeClient from '@/components/home/HomeClient';
import { HOME_FAQS } from '@/config/homeFaqs';
import { SITE_URL, CONTACT_EMAIL, OFFICIAL_SOCIAL_LINKS, DEFAULT_OG_IMAGE } from '@/config/site';
import { categories, getPublicTools } from '@/config/toolsData';

const HOMEPAGE_COUNTRIES = [
  { slug: 'united-states', name: 'United States (IRS & 50 States)' },
  { slug: 'united-kingdom', name: 'United Kingdom (HMRC PAYE & NI)' },
  { slug: 'germany', name: 'Germany (Brutto-Netto & Steuerklasse)' },
  { slug: 'canada', name: 'Canada (CRA Federal, Provincial & CPP)' },
  { slug: 'australia', name: 'Australia (ATO Stage 3 & Super)' },
  { slug: 'india', name: 'India (CBDT Sec 115BAC New/Old)' },
  { slug: 'pakistan', name: 'Pakistan (FBR Salaried Slabs & EOBI)' },
  { slug: 'united-arab-emirates', name: 'UAE (0% Tax & Gratuity)' },
  { slug: 'saudi-arabia', name: 'Saudi Arabia (GOSI & SANED)' },
  { slug: 'singapore', name: 'Singapore (IRAS & CPF Board)' },
  { slug: 'france', name: 'France (Salaire Brut en Net)' },
  { slug: 'japan', name: 'Japan (NTA & Shakai Hoken)' },
  { slug: 'switzerland', name: 'Switzerland (Federal, Cantonal & AHV)' },
  { slug: 'netherlands', name: 'Netherlands (Box 1 & 30% Ruling)' },
  { slug: 'ireland', name: 'Ireland (PAYE, USC & PRSI)' },
  { slug: 'new-zealand', name: 'New Zealand (IRD, ACC & KiwiSaver)' },
  { slug: 'spain', name: 'Spain (IRPF & Seguridad Social)' },
  { slug: 'italy', name: 'Italy (IRPEF & INPS)' },
  { slug: 'south-africa', name: 'South Africa (SARS PAYE & UIF)' },
  { slug: 'brazil', name: 'Brazil (IRPF, CLT INSS & FGTS)' },
  { slug: 'mexico', name: 'Mexico (SAT ISR & IMSS)' },
  { slug: 'south-korea', name: 'South Korea (NTS & 4 Insurances)' },
] as const;

export const metadata: Metadata = {
  title: 'Free Online Tools — PDF, JSON, Finance & SEO',
  description:
    'Use 42 free client-side tools and 22 country salary calculators in your browser. Format JSON & SQL, merge/redact PDFs, convert images, and calculate taxes.',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'Free Online Tools — PDF, JSON, Finance & SEO | KivaroTools',
    description:
      'Use 42 free client-side tools and 22 country salary calculators in your browser. Format JSON & SQL, merge/redact PDFs, convert images, and calculate taxes.',
    url: SITE_URL,
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@kivarotools',
    creator: '@kivarotools',
    title: 'Free Online Tools — PDF, JSON, Finance & SEO | KivaroTools',
    description:
      'Use 42 free client-side tools and 22 country salary calculators in your browser. Format JSON & SQL, merge/redact PDFs, convert images, and calculate taxes.',
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function HomePage() {
  const publicTools = getPublicTools();
  const visibleCategories = categories.filter((c) => !c.hidden);

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'KivaroTools',
    url: SITE_URL,
    description:
      'Free enterprise-grade browser-based utilities for developers, financial planning, PDFs, media optimization, and SEO. 100% client-side execution with zero server uploads.',
    inLanguage: 'en',
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'KivaroTools',
    legalName: 'KivaroTools',
    url: SITE_URL,
    foundingDate: '2026',
    founder: {
      '@type': 'Person',
      name: 'Muhammad Ahmad',
      jobTitle: 'Founder & Lead Software Architect',
      url: 'https://www.linkedin.com/in/muhammad-ahmad-b81794291/',
    },
    disambiguatingDescription:
      'KivaroTools (https://kivarotools.com) is an independent, 100% free browser-based utility platform founded by software engineer Muhammad Ahmad, providing 42 client-side developer, financial, PDF, image, and SEO tools plus 22 country salary calculators with zero user registration, zero login forms, and zero credential collection. KivaroTools operates independently and is not affiliated with Kivaro Tech (kivarotech.com), Kivaro AI (kivaroai.com), or Kivaro Home.',
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/kivaro-logo-512.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE_URL}/og-image.png`,
    sameAs: OFFICIAL_SOCIAL_LINKS,
    contactPoint: {
      '@type': 'ContactPoint',
      email: CONTACT_EMAIL,
      contactType: 'customer support',
      availableLanguage: ['English'],
    },
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'KivaroTools Enterprise Online Utility Suite',
    numberOfItems: publicTools.length,
    itemListElement: publicTools.map((tool, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: tool.name,
      description: tool.description,
      url: `${SITE_URL}/${tool.categoryId}/${tool.slug}`,
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOME_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomeClient />

      {/* Server-Rendered Complete Tool & Country Calculator Index (Guarantees 1-Click Crawl Depth & High Text-to-HTML Ratio) */}
      <section
        aria-labelledby="complete-platform-directory-heading"
        className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8"
      >
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <h2
            id="complete-platform-directory-heading"
            className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"
          >
            Complete Directory of 42 Client-Side Tools &amp; 22 Country Tax Calculators
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Every utility on KivaroTools executes 100% locally inside your browser using Web Workers, Web Cryptography API, HTML5 Canvas, and WebAssembly. Browse all published tools by category below:
          </p>

          <div className="mt-8 space-y-8">
            {visibleCategories.map((cat) => {
              const catTools = publicTools.filter((t) => t.categoryId === cat.id);
              return (
                <div key={cat.id} className="border-t border-slate-100 pt-6 first:border-t-0 first:pt-0 dark:border-slate-800">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      <Link href={`/${cat.id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                        {cat.name} ({catTools.length} Tools)
                      </Link>
                    </h3>
                    <Link
                      href={`/${cat.id}`}
                      className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Open {cat.name} Hub &rarr;
                    </Link>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    {cat.description}
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {catTools.map((tool) => (
                      <Link
                        key={tool.id}
                        href={`/${tool.categoryId}/${tool.slug}`}
                        className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 transition hover:border-blue-400 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-blue-600"
                      >
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {tool.seoTitle || tool.name}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                          {tool.seoDescription || tool.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* 22 Statutory Country Salary Calculators Index */}
            <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  <Link href="/finance/salary-calculator" className="hover:text-blue-600 dark:hover:text-blue-400">
                    22 Statutory Country Salary &amp; Take-Home Pay Calculators (2026–2027)
                  </Link>
                </h3>
                <Link
                  href="/finance/salary-calculator"
                  className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                  Open Global Salary Hub &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {HOMEPAGE_COUNTRIES.map((country) => (
                  <Link
                    key={country.slug}
                    href={`/finance/salary-calculator/${country.slug}`}
                    className="rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-blue-600 dark:hover:text-blue-400"
                  >
                    {country.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}