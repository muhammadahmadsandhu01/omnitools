import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import Link from 'next/link';
import {
  Code2,
  FileText,
  Image as ImageIcon,
  Calculator,
  Search,
  Mail,
  ShieldCheck,
  Info,
  Scale,
} from 'lucide-react';

import './globals.css';

import Navbar from '@/components/layout/Navbar';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/config/site';
import { KtMonogram } from '@/components/brand/KivaroLogo';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: 'Free Online Tools — PDF, JSON, Finance & SEO | KivaroTools',
    template: '%s | KivaroTools',
  },

  description:
    'Use 30+ free online tools and 22 country salary calculators in your browser. Format JSON & SQL, merge/compress PDFs, resize images in KB, and calculate loans.',

  applicationName: 'KivaroTools',

  keywords: [
    'online tools',
    'free web tools',
    'developer tools',
    'financial calculators',
    'salary calculator take home pay',
    'mortgage calculator PITI PMI',
    'loan EMI calculator',
    'compound interest calculator',
    'SIP calculator',
    'JSON formatter validator',
    'JSON to CSV Excel converter',
    'SQL formatter linter',
    'Regex tester debugger',
    'SVG optimizer',
    'PDF merge split',
    'image to PDF converter',
    'image compressor 20kb 50kb',
    'WebP to JPG PNG converter',
    'QR code generator with logo',
    'word counter readability grammar checker',
    'text case converter',
    'meta tag open graph generator',
  ],

  authors: [
    {
      name: 'KivaroTools',
      url: SITE_URL,
    },
  ],

  creator: 'KivaroTools',
  publisher: 'KivaroTools',

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'KivaroTools',
    title: 'Free Online Tools — PDF, JSON, Finance & SEO | KivaroTools',
    description:
      'Use 30+ free online tools and 22 country salary calculators in your browser. Format JSON & SQL, merge/compress PDFs, resize images in KB, and calculate loans.',
    url: SITE_URL,
    images: [DEFAULT_OG_IMAGE],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@kivarotools',
    creator: '@kivarotools',
    title: 'Free Online Tools — PDF, JSON, Finance & SEO | KivaroTools',
    description:
      'Use 30+ free online tools and 22 country salary calculators in your browser. Format JSON & SQL, merge/compress PDFs, resize images in KB, and calculate loans.',
    images: [`${SITE_URL}/og-image.png`],
  },

  icons: {
    icon: [
      { url: '/kivaro-logo-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/kivaro-logo-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/kivaro-logo-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/kivaro-logo-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.ico?v=3', sizes: '48x48', type: 'image/x-icon' },
    ],
    shortcut: ['/kivaro-logo-48.png'],
    apple: [
      { url: '/kivaro-apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },

  verification: {
    google: [
      'XmdHQQlKLYufqU-aZ50nGfT5BQkGJNvQCWaUsTA06yw',
      '_ouivC-YA-UT_rTiGPnWkZBsDyN7imgIjWFVWrTNL0I',
    ],
    other: {
      'msvalidate.01': '7E84D5AEA17F465BC45D70FAE5117606',
      'gridinsoft-key': 'ipguy8rm3ru7m3g8pwzf13fls6a93wn2lfvrp6syhuxcpvj8pmh19fcpohjk92nz',
    },
  },
};

const footerCategories = [
  {
    name: 'Finance & Calculators',
    href: '/finance',
    icon: Calculator,
  },
  {
    name: 'Developer Tools',
    href: '/developer',
    icon: Code2,
  },
  {
    name: 'Document Utilities',
    href: '/document',
    icon: FileText,
  },
  {
    name: 'Media & Images',
    href: '/media',
    icon: ImageIcon,
  },
  {
    name: 'SEO & Text Tools',
    href: '/seo',
    icon: Search,
  },
];

const popularFooterTools = [
  { name: 'Salary Calculator (22 Countries)', href: '/finance/salary-calculator' },
  { name: 'Mortgage Calculator (PITI & PMI)', href: '/finance/mortgage-calculator' },
  { name: 'Compound Interest & Drawdown', href: '/finance/compound-interest' },
  { name: 'Free PDF Invoice Generator', href: '/finance/invoice-generator' },
  { name: 'JSON Formatter & Tree Viewer', href: '/developer/json-formatter' },
  { name: 'SQL Query Formatter (19 Dialects)', href: '/developer/sql-formatter' },
  { name: 'PDF Merge & Split (750 MB)', href: '/document/pdf-merge-split' },
  { name: 'PDF to Word (.DOCX Converter)', href: '/document/pdf-to-word' },
  { name: 'Compress PDF (Target KB)', href: '/document/compress-pdf' },
  { name: 'Image Compressor (Target KB)', href: '/media/image-compressor' },
  { name: 'Word Counter & Grammar Coach', href: '/seo/text-analyzer' },
  { name: 'Custom QR Code Generator', href: '/seo/qr-generator' },
];

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const officialSocialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/kivarotools',
    ariaLabel: 'KivaroTools on GitHub',
    icon: GitHubIcon,
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/kivarotools',
    ariaLabel: 'KivaroTools on LinkedIn',
    icon: LinkedInIcon,
  },
  {
    name: 'X',
    href: 'https://x.com/kivarotools',
    ariaLabel: 'KivaroTools on X',
    icon: XIcon,
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/kivaro_tools/',
    ariaLabel: 'KivaroTools on Instagram',
    icon: InstagramIcon,
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61595701754284',
    ariaLabel: 'KivaroTools on Facebook',
    icon: FacebookIcon,
  },
];

function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="sr-only">Site Footer Navigation</h2>
        {/* Main footer grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5"
            >
              <KtMonogram className="h-9 w-9 shrink-0" />

              <span className="font-sans text-2xl font-extrabold tracking-tight">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900 transition-colors dark:text-white">
                  Kivaro
                </span>
                <span className="text-2xl font-extrabold tracking-tight text-blue-600 transition-colors dark:text-blue-500">
                  Tools
                </span>
              </span>
            </Link>

            <p className="mt-2 text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
              PRIVATE BY DESIGN • ENTERPRISE-GRADE BROWSER UTILITIES
            </p>

            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
              Free enterprise-grade online tools for software engineers, financial planners, creators,
              and global businesses. Every calculation and file conversion runs locally in your browser.
            </p>

            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-500" />
              100% Client-side processing • Zero server uploads
            </div>

            {/* Official Company Social Profiles */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {officialSocialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="me noopener noreferrer"
                    aria-label={item.ariaLabel}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-blue-700 dark:hover:text-blue-400"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.name}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Categories
            </h3>

            <ul className="mt-4 space-y-3">
              {footerCategories.map((category) => {
                const Icon = category.icon;

                return (
                  <li key={category.href}>
                    <Link
                      href={category.href}
                      className="group inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                    >
                      <Icon className="h-4 w-4 transition group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                      {category.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Featured Tools */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Featured Tools
            </h3>

            <ul className="mt-4 space-y-2.5">
              {popularFooterTools.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-xs text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Company &amp; Legal
            </h3>

            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  <Info className="h-4 w-4 transition group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  About KivaroTools
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  <Mail className="h-4 w-4 transition group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  Contact &amp; Support
                </Link>
              </li>

              <li>
                <Link
                  href="/privacy"
                  className="group inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  <ShieldCheck className="h-4 w-4 transition group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  href="/terms"
                  className="group inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  <Scale className="h-4 w-4 transition group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 border-t border-slate-200 dark:border-slate-800" />

        {/* Bottom */}
        <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">
          <p>
            © {new Date().getFullYear()} KivaroTools. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link
              href="/about"
              className="transition hover:text-blue-600 dark:hover:text-blue-400"
            >
              About
            </Link>

            <Link
              href="/privacy"
              className="transition hover:text-blue-600 dark:hover:text-blue-400"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="transition hover:text-blue-600 dark:hover:text-blue-400"
            >
              Terms
            </Link>

            <Link
              href="/contact"
              className="transition hover:text-blue-600 dark:hover:text-blue-400"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="_ouivC-YA-UT_rTiGPnWkZBsDyN7imgIjWFVWrTNL0I"
        />
        <meta
          name="gridinsoft-key"
          content="ipguy8rm3ru7m3g8pwzf13fls6a93wn2lfvrp6syhuxcpvj8pmh19fcpohjk92nz"
        />
        {/* Google tag (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-263WZKH2LL"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-263WZKH2LL');`,
          }}
        />
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="twpg3hiqDH4n7rhyfDlD2Q"
          async
        ></script>
      </head>
      <body
        className={`${inter.variable} ${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100`}
      >
        {/* Google AdSense — only load when an actual publisher ID is configured */}
        {adsenseId && (
          <Script
            id="adsense"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
          />
        )}

        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />

            <div className="flex-1 w-full min-w-0 overflow-x-clip">
              {children}
            </div>

            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}