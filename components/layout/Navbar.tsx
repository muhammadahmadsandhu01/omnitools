'use client';

import Link from 'next/link';
import {
  Menu,
  Moon,
  Search,
  Settings2,
  Sun,
  X,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { categories } from '@/config/toolsData';
import ToolSearch from '@/components/layout/ToolSearch';

export default function Navbar() {
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent the two mobile panels from being open at the same time.
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

  // Close mobile panels with Escape.
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
        className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="OmniTools home"
          className="group flex shrink-0 items-center gap-2.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-600/20 transition-transform duration-200 group-hover:scale-105">
            <Settings2
              aria-hidden="true"
              className="h-5 w-5 text-white"
            />
          </span>

          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
            Omni<span className="text-blue-600">Tools</span>
          </span>
        </Link>

        {/* Desktop search */}
        <div className="hidden w-full max-w-md md:block lg:max-w-lg">
          <ToolSearch />
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          {/* Mobile search */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((current) => !current)}
            aria-label={
              mobileSearchOpen
                ? 'Close search'
                : 'Search tools'
            }
            aria-expanded={mobileSearchOpen}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {mobileSearchOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>

          {/* Theme */}
          {mounted ? (
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
              title={
                theme === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          ) : (
            <div
              aria-hidden="true"
              className="h-9 w-9"
            />
          )}

          {/* Mobile menu */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            aria-label={
              mobileMenuOpen
                ? 'Close navigation menu'
                : 'Open navigation menu'
            }
            aria-expanded={mobileMenuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile search panel */}
      {mobileSearchOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden dark:border-slate-800 dark:bg-slate-950">
          <ToolSearch
            onNavigate={() => setMobileSearchOpen(false)}
          />
        </div>
      )}

      {/* Mobile category menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Categories
          </div>

          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <Link
                  key={category.id}
                  href={`/${category.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-blue-900 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${category.color}`}
                  />
                  <span className="truncate">
                    {category.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}