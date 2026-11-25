'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, X } from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

import { categories, tools } from '@/config/toolsData';
import { SALARY_COUNTRIES } from '@/config/salaryCountries';

const RECENT_STORAGE_KEY = 'kivarotools_recent_tools_v1';

function recordRecentTool(href: string, name: string) {
  try {
    const raw = window.localStorage.getItem(RECENT_STORAGE_KEY);
    const prev = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(prev)
      ? prev.filter((item: { href?: string }) => item && item.href !== href)
      : [];
    window.localStorage.setItem(
      RECENT_STORAGE_KEY,
      JSON.stringify([{ href, name }, ...list].slice(0, 5))
    );
  } catch {
    // Ignore storage errors in private browsing
  }
}

interface ToolSearchProps {
  className?: string;
  onNavigate?: () => void;
}

export default function ToolSearch({
  className = '',
  onNavigate,
}: ToolSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizedQuery = query.trim().toLowerCase();

  // Global Ctrl+K / Cmd+K shortcut to focus search
  useEffect(() => {
    function handleGlobalKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setIsOpen(true);
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  const results = useMemo(() => {
    if (!normalizedQuery) return [];

    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
    const financeCategory = categories.find((item) => item.id === 'finance');

    const countryMatches = SALARY_COUNTRIES.map((c) => {
      const name = c.searchName.toLowerCase();
      const kw = c.searchKeywords.toLowerCase();
      let score = 0;
      if (name.includes(normalizedQuery)) score += 55;
      if (kw.includes(normalizedQuery)) score += 35;
      if (queryTokens.length > 1) {
        const combined = `${name} ${kw} salary calculator take home pay`;
        const matched = queryTokens.filter((t) => combined.includes(t));
        if (matched.length === queryTokens.length) score += 50;
      }
      return {
        tool: {
          id: `country-${c.slug}`,
          name: c.searchName,
          slug: `salary-calculator/${c.slug}`,
          categoryId: 'finance' as const,
          description: 'Dedicated statutory tax & net take-home pay calculator',
          status: 'published' as const,
        },
        category: financeCategory,
        score,
      };
    }).filter((item) => item.score > 0);

    const toolMatches = tools
      .filter((tool) => tool.status === 'published' && !tool.hidden)
      .map((tool) => {
        const category = categories.find(
          (item) => item.id === tool.categoryId
        );

        const name = tool.name.toLowerCase();
        const slug = tool.slug.toLowerCase();
        const description = tool.description.toLowerCase();
        const seoTitle = (tool.seoTitle || '').toLowerCase();
        const categoryName = category?.name.toLowerCase() ?? '';
        const keywordsJoined = (tool.keywords || []).join(' ').toLowerCase();
        const featuresJoined = (tool.featureList || []).join(' ').toLowerCase();

        let score = 0;

        if (name === normalizedQuery || slug === normalizedQuery) score += 120;
        if (name.startsWith(normalizedQuery) || slug.startsWith(normalizedQuery)) score += 70;
        if (name.includes(normalizedQuery)) score += 45;
        if (seoTitle.includes(normalizedQuery)) score += 30;
        if (keywordsJoined.includes(normalizedQuery)) score += 35;
        if (categoryName.includes(normalizedQuery)) score += 20;
        if (description.includes(normalizedQuery)) score += 15;
        if (featuresJoined.includes(normalizedQuery)) score += 10;

        if (queryTokens.length > 1) {
          const combined = `${name} ${slug} ${seoTitle} ${keywordsJoined} ${description} ${featuresJoined}`;
          const matchedTokens = queryTokens.filter((tok) => combined.includes(tok));
          if (matchedTokens.length === queryTokens.length) {
            score += 40;
          } else if (matchedTokens.length > 0) {
            score += matchedTokens.length * 8;
          }
        }

        return {
          tool,
          category,
          score,
        };
      })
      .filter((item) => item.score > 0);

    return [...toolMatches, ...countryMatches]
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.tool.name.localeCompare(b.tool.name);
      })
      .slice(0, 8);
  }, [normalizedQuery]);

  const showDropdown = isOpen && query.trim().length > 0;

  useEffect(() => {
    setActiveIndex(-1);
  }, [normalizedQuery]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown) {
      if (event.key === 'ArrowDown' && normalizedQuery) {
        setIsOpen(true);
        setActiveIndex(0);
      }

      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) =>
        current < results.length - 1 ? current + 1 : 0
      );
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) =>
        current > 0 ? current - 1 : results.length - 1
      );
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const selected = activeIndex >= 0 ? results[activeIndex] : results[0];
      if (selected) {
        const href = `/${selected.tool.categoryId}/${selected.tool.slug}`;
        recordRecentTool(href, selected.tool.name);
        setIsOpen(false);
        setQuery('');
        onNavigate?.();
        router.push(href);
      }
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  }

  function clearSearch() {
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search input */}
      <div className="group relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600 dark:text-slate-500 dark:group-focus-within:text-blue-400"
        />

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search 42 tools & 22 countries..."
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="tool-search-results"
          aria-label="Search tools"
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-14 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-blue-500 dark:focus:bg-slate-800"
        />

        {query ? (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <kbd
            aria-hidden="true"
            className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-400 sm:inline-block dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500"
          >
            Ctrl K
          </kbd>
        )}
      </div>

      {/* Results */}
      {showDropdown && (
        <div
          id="tool-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-[70] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30"
        >
          {results.length > 0 ? (
            <>
              <div className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Matching Tools ({results.length})
              </div>

              {results.map(({ tool, category }, index) => (
                <Link
                  key={tool.id}
                  href={`/${tool.categoryId}/${tool.slug}`}
                  role="option"
                  aria-selected={activeIndex === index}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    recordRecentTool(`/${tool.categoryId}/${tool.slug}`, tool.name);
                    setIsOpen(false);
                    setQuery('');
                    onNavigate?.();
                  }}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${activeIndex === index
                      ? 'bg-blue-50 dark:bg-blue-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${activeIndex === index
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                  >
                    {category?.icon ? (
                      <category.icon className="h-4 w-4" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {tool.name}
                    </p>

                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {category?.name ?? 'Tool'}
                    </p>
                  </div>

                  <ArrowRight
                    className={`h-4 w-4 shrink-0 transition-all ${activeIndex === index
                        ? 'translate-x-0 text-blue-600 opacity-100 dark:text-blue-400'
                        : '-translate-x-1 text-slate-400 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                      }`}
                  />
                </Link>
              ))}

              <div className="mt-1 border-t border-slate-100 px-3 py-2 text-[11px] text-slate-400 dark:border-slate-800 dark:text-slate-500">
                Use ↑ ↓ to navigate · Enter to open · Esc to close
              </div>
            </>
          ) : (
            <div className="px-4 py-6 text-center">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Search className="h-4 w-4 text-slate-400" />
              </div>

              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                No tools found
              </p>

              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Try searching by format or feature (e.g. JSON, SQLite, Parquet, PDF, EMI, UK tax).
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}