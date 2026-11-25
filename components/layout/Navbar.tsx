'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { categories } from '@/config/toolsData';
import ToolSearch from '@/components/layout/ToolSearch';
import { KtMonogram } from '@/components/brand/KivaroLogo';

const DESKTOP_SHORT_LABELS: Record<string, string> = {
  finance: 'Finance',
  developer: 'Developer',
  document: 'Document',
  media: 'Media',
  seo: 'SEO & Text',
};

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleCategories = categories.filter((category) => !category.hidden);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mobileSearchOpen) {
      setMobileMenuOpen(false);
    }
  }, [mobileSearchOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileSearchOpen(false);
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileSearchOpen(false);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-slate-800 dark:bg-slate-950/95 dark:supports-[backdrop-filter]:bg-slate-950/80">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="KivaroTools home"
          className="group flex min-h-[44px] shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <KtMonogram className="h-9 w-9 shrink-0 transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none" />

          <span className="font-sans text-xl font-extrabold tracking-tight sm:text-2xl">
            <span className="text-slate-900 transition-colors dark:text-white">
              Kivaro
            </span>
            <span className="text-blue-600 transition-colors dark:text-blue-500">
              Tools
            </span>
          </span>
        </Link>

        {/* Desktop Category Links (5 visible hubs directly crawlable from header, 44px height) */}
        <div className="hidden items-center gap-1 lg:flex">
          {visibleCategories.map((category) => {
            const href = `/${category.id}`;
            const isActive = pathname === href || pathname?.startsWith(`${href}/`);
            return (
              <Link
                key={category.id}
                href={href}
                className={`inline-flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none ${isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'
                  }`}
              >
                {DESKTOP_SHORT_LABELS[category.id] || category.name}
              </Link>
            );
          })}
        </div>

        {/* Desktop search */}
        <div className="hidden w-full max-w-xs md:block lg:max-w-sm">
          <ToolSearch />
        </div>

        {/* Actions (all 44x44px touch targets) */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setMobileSearchOpen((current) => !current)}
            aria-label={mobileSearchOpen ? 'Close search' : 'Search tools'}
            aria-expanded={mobileSearchOpen}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none md:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {mobileSearchOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Search className="h-5 w-5" aria-hidden="true" />
            )}
          </button>

          {mounted ? (
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
              }
              title={
                theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
              }
              className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          ) : (
            <div aria-hidden="true" className="h-11 w-11" />
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            aria-label={
              mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
            }
            aria-expanded={mobileMenuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none lg:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile search panel */}
      {mobileSearchOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden dark:border-slate-800 dark:bg-slate-950">
          <ToolSearch onNavigate={() => setMobileSearchOpen(false)} />
        </div>
      )}

      {/* Mobile / Tablet category menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Categories
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {visibleCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  href={`/${category.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[44px] items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none dark:border-slate-800 dark:text-slate-300 dark:hover:border-blue-900 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                >
                  <Icon className={`h-4 w-4 shrink-0 ${category.color}`} aria-hidden="true" />
                  <span className="truncate">{category.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}