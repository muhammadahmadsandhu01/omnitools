export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://kivarotools.com';

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@kivarotools.com';

export const OPERATOR_LOCATION = 'Pakistan';

export const DEFAULT_OG_IMAGE = {
  url: `${SITE_URL}/og-image.png`,
  width: 1200,
  height: 630,
  alt: 'KivaroTools — Free Enterprise-Grade Online Tools (Private by Design)',
  type: 'image/png',
};

export const OFFICIAL_SOCIAL_LINKS = [
  'https://github.com/kivarotools',
  'https://www.linkedin.com/company/kivarotools',
  'https://x.com/kivarotools',
  'https://www.instagram.com/kivaro_tools/',
  'https://www.facebook.com/profile.php?id=61595701754284',
] as const;

export const OFFICIAL_SOCIAL_PROFILES = OFFICIAL_SOCIAL_LINKS;
