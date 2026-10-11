import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import {
  ArrowUpRight,
  ChevronRight,
  Home,
} from 'lucide-react';

import { categories, tools } from '@/config/toolsData';

type CategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;

  const category = categories.find(
    (item) => item.id === categorySlug
  );

  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested OmniTools category could not be found.',
    };
  }

  const categoryTools = tools.filter(
    (tool) => tool.categoryId === category.id
  );

  const categoryTitle =
    category.name.endsWith('Tools') || category.name.endsWith('Utilities')
      ? category.name
      : `${category.name} Tools`;

  return {
    title: categoryTitle,
    description: `Explore ${categoryTools.length} free ${category.name.toLowerCase()} from OmniTools. Fast, easy-to-use browser-based utilities.`,
    alternates: {
      canonical: `/${category.id}`,
    },
    openGraph: {
      title: `${categoryTitle} — OmniTools`,
      description: `Explore free ${category.name.toLowerCase()} from OmniTools.`,
      url: `/${category.id}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryTitle} — OmniTools`,
      description: `Explore free ${category.name.toLowerCase()} from OmniTools.`,
    },
  };
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { category: categorySlug } = await params;

  if (categorySlug === 'image') {
    permanentRedirect('/media');
  }

  const category = categories.find(
    (item) => item.id === categorySlug
  );

  if (!category) {
    notFound();
  }

  const categoryTools = tools.filter(
    (tool) => tool.categoryId === category.id
  );

  const Icon = category.icon;

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8"
        >
          <ol className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">

            <li>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Home
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                <span>Home</span>
              </Link>
            </li>

            <li aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </li>

            <li
              aria-current="page"
              className="text-slate-800 dark:text-slate-200"
            >
              {category.name}
            </li>

          </ol>
        </nav>

        {/* Category Header */}
        <header className="mb-10 border-b border-slate-200 pb-8 dark:border-slate-800">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            {/* Category Icon */}
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${category.color}`}
            >
              <Icon
                className="h-8 w-8"
                aria-hidden="true"
              />
            </div>

            {/* Heading */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  {category.name.endsWith('Tools') || category.name.endsWith('Utilities')
                    ? category.name
                    : `${category.name} Tools`}
                </h1>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {categoryTools.length}{' '}
                  {categoryTools.length === 1 ? 'Tool' : 'Tools'}
                </span>
              </div>

              <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
                Explore free {category.name.toLowerCase()} tools designed
                to be fast, simple, and easy to use.
              </p>
            </div>

          </div>
        </header>

        {/* Tools */}
        {categoryTools.length > 0 ? (
          <section aria-labelledby="category-tools-heading">

            <div className="mb-5">
              <h2
                id="category-tools-heading"
                className="text-xl font-bold text-slate-900 dark:text-white"
              >
                Explore {category.name} Tools
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Choose a tool below to get started.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {categoryTools.map((tool) => (
                <Link
                  href={`/${category.id}/${tool.slug}`}
                  key={tool.id}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
                >
                  {/* Card Top */}
                  <div className="mb-5 flex items-start justify-between gap-4">

                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 ${category.color}`}
                    >
                      <Icon
                        className="h-6 w-6"
                        aria-hidden="true"
                      />
                    </div>

                    <ArrowUpRight
                      className="h-5 w-5 shrink-0 text-slate-300 transition-colors group-hover:text-blue-600 dark:text-slate-600 dark:group-hover:text-blue-400"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col">

                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {tool.name}
                    </h3>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {tool.description}
                    </p>

                  </div>

                  {/* Card Action */}
                  <div className="mt-5 text-sm font-semibold text-blue-600 transition-colors group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300">
                    Open tool
                  </div>
                </Link>
              ))}
            </div>

          </section>
        ) : (
          /* Empty State */
          <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/50">
            <div className="mx-auto max-w-md">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-900">
                <Icon
                  className={`h-7 w-7 ${category.color}`}
                  aria-hidden="true"
                />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                More tools coming soon
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                We&apos;re working on useful tools for this category.
                Check back soon or explore the other tools available on
                OmniTools.
              </p>

              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Browse all tools
                <ArrowUpRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>

            </div>
          </section>
        )}

      </div>
    </main>
  );
}