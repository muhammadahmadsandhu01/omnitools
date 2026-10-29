/**
 * Site configuration and canonical domain resolution.
 *
 * Uses NEXT_PUBLIC_SITE_URL environment variable if set, falling back to
 * the canonical production domain.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://kivarotools.com';

/**
 * Configurable contact email for inquiries, support, and legal notices.
 * Sourced from the NEXT_PUBLIC_CONTACT_EMAIL environment variable,
 * falling back to the confirmed owner contact email.
 */
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@kivarotools.com';

/**
 * Operating jurisdiction/location of the independent developer.
 */
export const OPERATOR_LOCATION = 'Pakistan';

/**
 * Verified Official KivaroTools Company & Organization social profile URLs.
 * Used for Schema.org JSON-LD sameAs entity resolution, Google Knowledge Graph verification,
 * and site-wide footer navigation.
 */
export const OFFICIAL_SOCIAL_PROFILES = [
  'https://github.com/kivarotools',
  'https://www.linkedin.com/company/kivarotools',
  'https://x.com/kivarotools',
  'https://www.instagram.com/kivaro_tools/',
  'https://www.facebook.com/profile.php?id=61595701754284',
] as const;

