/**
 * Site configuration and canonical domain resolution.
 *
 * Uses NEXT_PUBLIC_SITE_URL environment variable if set, falling back to
 * the active Vercel production deployment until a custom domain is attached.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://omnitools-navy.vercel.app';

/**
 * Configurable contact email for inquiries, support, and legal notices.
 * Sourced from the NEXT_PUBLIC_CONTACT_EMAIL environment variable,
 * falling back to the confirmed owner contact email.
 */
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'muhammadahmadsandhu01@gmail.com';

/**
 * Operating jurisdiction/location of the independent developer.
 */
export const OPERATOR_LOCATION = 'Pakistan';
