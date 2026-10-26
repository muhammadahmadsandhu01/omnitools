'use client';

import Link from 'next/link';
import { Search, ArrowRight, X } from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

import { categories, tools } from '@/config/toolsData';


const COUNTRY_SEARCH_ITEMS = [
  { name: 'United States Salary Calculator (IRS & FICA)', slug: 'salary-calculator/united-states', categoryId: 'finance', keywords: 'usa us paycheck tax 401k w4 state tax' },
  { name: 'United Kingdom Salary Calculator (HMRC PAYE & NI)', slug: 'salary-calculator/united-kingdom', categoryId: 'finance', keywords: 'uk britain england scotland paye national insurance pension' },
  { name: 'Germany Salary Calculator (Brutto Netto & Steuerklasse)', slug: 'salary-calculator/germany', categoryId: 'finance', keywords: 'deutschland lohnsteuer soli sozialversicherung' },
  { name: 'India Salary Calculator (New vs Old Tax Regime 115BAC)', slug: 'salary-calculator/india', categoryId: 'finance', keywords: 'inhand salary epf 80c 87a rebate inr' },
  { name: 'Pakistan Salary Calculator (FBR Salaried Tax Slabs)', slug: 'salary-calculator/pakistan', categoryId: 'finance', keywords: 'pk pkr fbr income tax eobi take home pay' },
  { name: 'Canada Salary Calculator (CRA Federal, CPP & EI)', slug: 'salary-calculator/canada', categoryId: 'finance', keywords: 'ca cad ontario bc alberta paycheck tax' },
  { name: 'Australia Salary Calculator (ATO Stage 3, LITO & Super)', slug: 'salary-calculator/australia', categoryId: 'finance', keywords: 'au aud medicare levy superannuation payg' },
  { name: 'Singapore Salary Calculator (IRAS Tax & CPF)', slug: 'salary-calculator/singapore', categoryId: 'finance', keywords: 'sg sgd cpf ordinary wage ceiling' },
  { name: 'UAE Salary Calculator (0% Tax, GPSSA & Gratuity)', slug: 'salary-calculator/united-arab-emirates', categoryId: 'finance', keywords: 'dubai abu dhabi aed expat end of service' },
  { name: 'Saudi Arabia Salary Calculator (0% Tax & GOSI)', slug: 'salary-calculator/saudi-arabia', categoryId: 'finance', keywords: 'ksa riyadh sar gosi saned expat' },
  { name: 'France Salary Calculator (IR & URSSAF Net Pay)', slug: 'salary-calculator/france', categoryId: 'finance', keywords: 'fr eur salaire brut en net csg crds' },
  { name: 'Japan Salary Calculator (Shotokuzei, Juminzei & Shakai Hoken)', slug: 'salary-calculator/japan', categoryId: 'finance', keywords: 'jp jpy tokyo nenkin kenko hoken' },
  { name: 'Switzerland Salary Calculator (Federal, Cantonal & AHV/BVG)', slug: 'salary-calculator/switzerland', categoryId: 'finance', keywords: 'ch chf zurich geneva pillar 2' },
  { name: 'Netherlands Salary Calculator (Box 1, AHK & 30% Ruling)', slug: 'salary-calculator/netherlands', categoryId: 'finance', keywords: 'nl eur dutch arbeidskorting expat' },
  { name: 'Ireland Salary Calculator (PAYE, USC & PRSI)', slug: 'salary-calculator/ireland', categoryId: 'finance', keywords: 'ie eur dublin revenue tax credits' },
  { name: 'New Zealand Salary Calculator (IRD PAYE, ACC & KiwiSaver)', slug: 'salary-calculator/new-zealand', categoryId: 'finance', keywords: 'nz nzd auckland kiwisaver' },
  { name: 'Spain Salary Calculator (IRPF & Seguridad Social)', slug: 'salary-calculator/spain', categoryId: 'finance', keywords: 'es eur madrid sueldo neto autonomo' },
  { name: 'Italy Salary Calculator (IRPEF, INPS & Stipendio Netto)', slug: 'salary-calculator/italy', categoryId: 'finance', keywords: 'it eur rome milan cuneo fiscale' },
  { name: 'South Africa Salary Calculator (SARS PAYE, Rebate & UIF)', slug: 'salary-calculator/south-africa', categoryId: 'finance', keywords: 'za zar sars medical tax credit' },
  { name: 'Brazil Salary Calculator (IRPF, CLT INSS & FGTS)', slug: 'salary-calculator/brazil', categoryId: 'finance', keywords: 'br brl salario liquido clt' },
  { name: 'Mexico Salary Calculator (SAT ISR & IMSS Cuotas)', slug: 'salary-calculator/mexico', categoryId: 'finance', keywords: 'mx mxn sueldo neto nomina' },
  { name: 'South Korea Salary Calculator (NTS Tax & 4 Insurances)', slug: 'salary-calculator/south-korea', categoryId: 'finance', keywords: 'kr krw seoul national pension' },
];

interface ToolSearchProps {
  className?: string;
  onNavigate?: () => void;
}

export default function ToolSearch({
  className = '',
  onNavigate,
}: ToolSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!normalizedQuery) return [];

    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

    const countryMatches = COUNTRY_SEARCH_ITEMS.map((c) => {
      const name = c.name.toLowerCase();
      const kw = c.keywords.toLowerCase();
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
          name: c.name,
          slug: c.slug,
          categoryId: 'finance' as const,
          description: 'Dedicated statutory tax & net take-home pay calculator',
          status: 'published' as const,
        },
        category: categories.find((item) => item.id === 'finance'),
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

        // Exact / beginning matches should appear first.
        if (name === normalizedQuery || slug === normalizedQuery) score += 120;
        if (name.startsWith(normalizedQuery) || slug.startsWith(normalizedQuery)) score += 70;
        if (name.includes(normalizedQuery)) score += 45;
        if (seoTitle.includes(normalizedQuery)) score += 30;
        if (keywordsJoined.includes(normalizedQuery)) score += 35;
        if (categoryName.includes(normalizedQuery)) score += 20;
        if (description.includes(normalizedQuery)) score += 15;
        if (featuresJoined.includes(normalizedQuery)) score += 10;

        // Multi-word token matching (e.g. "gold tola", "json excel", "compress 50kb")
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

      if (activeIndex >= 0 && results[activeIndex]) {
        const { tool } = results[activeIndex];

        window.location.href = `/${tool.categoryId}/${tool.slug}`;
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
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
    >
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
          placeholder="Search tools (e.g. JSON, PDF, Mortgage, QR, WebP)..."
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="tool-search-results"
          aria-label="Search tools"
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-blue-500 dark:focus:bg-slate-800"
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
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
                    setIsOpen(false);
                    setQuery('');
                    onNavigate?.();
                  }}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                    activeIndex === index
                      ? 'bg-blue-50 dark:bg-blue-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      activeIndex === index
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
                    className={`h-4 w-4 shrink-0 transition-all ${
                      activeIndex === index
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
                Try searching by format or feature (e.g. JSON, CSV, EMI, Gold, QR, WebP).
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}