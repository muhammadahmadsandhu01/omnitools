'use client';

import React from 'react';

interface KtMonogramProps {
  className?: string;
  size?: number | string;
}

/**
 * KivaroTools Monogram / Logo Mark
 * Standard pixel-perfect logo image from /logo.svg.
 */
export function KtMonogram({
  className = 'h-9 w-9',
  size,
}: KtMonogramProps) {
  return (
    <img
      src="/logo.svg"
      alt="KivaroTools Logo"
      width={size}
      height={size}
      className={`object-contain shrink-0 ${className}`}
    />
  );
}

interface KtAvatarProps {
  className?: string;
  size?: number | string;
}

/**
 * Avatar / App Icon Badge
 * Standard pixel-perfect logo image from /logo.svg.
 */
export function KtAvatar({ className = 'h-9 w-9', size }: KtAvatarProps) {
  return (
    <img
      src="/logo.svg"
      alt="KivaroTools Logo"
      width={size}
      height={size}
      className={`object-contain shrink-0 ${className}`}
    />
  );
}

interface KivaroLogoProps {
  className?: string;
  markClassName?: string;
  showTagline?: boolean;
  avatarMode?: boolean;
}

/**
 * KivaroTools Full Brand Identity
 * Typography:
 * - "Kivaro": text-slate-900 (dark:text-white), font-extrabold, system sans-serif
 * - "Tools": text-blue-600 (dark:text-blue-500), font-extrabold
 * - Tagline: "PRIVATE BY DESIGN • POWERFUL TOOLS FOR EVERYONE"
 */
export default function KivaroLogo({
  className = '',
  markClassName = 'h-9 w-9',
  showTagline = false,
  avatarMode = false,
}: KivaroLogoProps) {
  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className="inline-flex items-center gap-2.5">
        {avatarMode ? (
          <KtAvatar className={`${markClassName} shrink-0 drop-shadow-sm`} />
        ) : (
          <KtMonogram className={`${markClassName} shrink-0`} />
        )}

        <span className="font-sans text-2xl font-extrabold tracking-tight">
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 transition-colors dark:text-white">
            Kivaro
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-blue-600 transition-colors dark:text-blue-500">
            Tools
          </span>
        </span>
      </div>

      {showTagline && (
        <span className="mt-1.5 text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
          PRIVATE BY DESIGN • POWERFUL TOOLS FOR EVERYONE
        </span>
      )}
    </div>
  );
}
