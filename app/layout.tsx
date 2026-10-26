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
} from 'lucide-react';

import './globals.css';

import Navbar from '@/components/layout/Navbar';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SITE_URL } from '@/config/site';
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
    default: 'KivaroTools — Free Enterprise-Grade Online Tools (Private by Design)',
    template: '%s | KivaroTools',
  },

  description:
    'Free enterprise-grade, browser-based online tools for developers, financial planning, PDFs, image compression, and SEO. 100% client-side execution with zero server uploads and no registration.',

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
    title: 'KivaroTools — Free Enterprise-Grade Online Tools (Private by Design)',
    description:
      'Free browser-based tools for developers, finance, PDFs, images, and SEO. 100% client-side processing with zero server uploads.',
    url: SITE_URL,
  },

  twitter: {
    card: 'summary_large_image',
    title: 'KivaroTools — Free Enterprise-Grade Online Tools (Private by Design)',
    description:
      'Free browser-based tools for developers, finance, PDFs, images, and SEO. 100% client-side processing with zero server uploads.',
  },

  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },

  verification: {
    google: 'XmdHQQlKLYufqU-aZ50nGfT5BQkGJNvQCWaUsTA06yw',
    other: {
      'msvalidate.01': '7E84D5AEA17F465BC45D70FAE5117606',
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
  { name: 'Image Compressor (Target KB)', href: '/media/image-compressor' },
  { name: 'Word Counter & Grammar Coach', href: '/seo/text-analyzer' },
  { name: 'Custom QR Code Generator', href: '/seo/qr-generator' },
];

function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
                  className="text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  About KivaroTools
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  <Mail className="h-4 w-4" />
                  Contact &amp; Support
                </Link>
              </li>

              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  href="/terms"
                  className="text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
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

            <main className="flex-1">
              {children}
            </main>

            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}