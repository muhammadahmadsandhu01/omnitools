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
  Heart,
  Settings2,
  Mail,
  ShieldCheck,
} from 'lucide-react';

import './globals.css';

import Navbar from '@/components/layout/Navbar';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SITE_URL } from '@/config/site';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: 'OmniTools — Powerful Tools. Private by Design.',
    template: '%s | OmniTools',
  },

  description:
    'Free browser-based tools for developers, creators, businesses, and everyday tasks. No registration and privacy-conscious processing.',

  applicationName: 'OmniTools',

  keywords: [
    'online tools',
    'free web tools',
    'developer tools',
    'privacy tools',
    'browser tools',
    'online calculators',
    'JSON formatter',
    'image compressor',
    'PDF tools',
  ],

  authors: [
    {
      name: 'OmniTools',
    },
  ],

  creator: 'OmniTools',

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: 'website',
    siteName: 'OmniTools',
    title: 'OmniTools — Powerful Tools. Private by Design.',
    description:
      'Free browser-based tools for developers, creators, businesses, and everyday tasks.',
    url: '/',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'OmniTools — Powerful Tools. Private by Design.',
    description:
      'Free browser-based tools for developers, creators, businesses, and everyday tasks.',
  },

  icons: {
    icon: '/favicon.ico',
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
    name: 'Finance',
    href: '/finance',
    icon: Calculator,
  },
  {
    name: 'Developer',
    href: '/developer',
    icon: Code2,
  },
  {
    name: 'Document',
    href: '/document',
    icon: FileText,
  },
  {
    name: 'Media',
    href: '/media',
    icon: ImageIcon,
  },
  {
    name: 'SEO & Text',
    href: '/seo',
    icon: Search,
  },
  {
    name: 'Health',
    href: '/health',
    icon: Heart,
  },
];

function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Main footer grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
                <Settings2 className="h-5 w-5 text-white" />
              </span>

              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Omni<span className="text-blue-600">Tools</span>
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">
              Free online tools for developers, creators, businesses,
              and everyday tasks.
            </p>

            <div className="mt-5 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Privacy-conscious by design
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Tools
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

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Company
            </h3>

            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  About OmniTools
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  <Mail className="h-4 w-4" />
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Legal
            </h3>

            <ul className="mt-4 space-y-3">
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
            © {new Date().getFullYear()} OmniTools. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
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