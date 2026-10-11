'use client';

import { useEffect, useRef } from 'react';

interface AdUnitProps {
  slotId: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_ID;

export default function AdUnit({
  slotId,
  className = '',
}: AdUnitProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    // Don't initialize ads without a real publisher ID or slot.
    if (!ADSENSE_CLIENT || !slotId) return;

    // Prevent duplicate pushes in React Strict Mode.
    if (pushedRef.current) return;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});

      pushedRef.current = true;
    } catch (error) {
      // AdSense can throw when an ad is unavailable or already initialized.
      if (process.env.NODE_ENV === 'development') {
        console.warn('AdSense initialization warning:', error);
      }
    }
  }, [slotId]);

  // Don't render an empty ad container during development
  // until a real AdSense publisher ID is configured.
  if (!ADSENSE_CLIENT) {
    return null;
  }

  return (
    <div
      className={`my-8 flex w-full justify-center ${className}`}
      aria-label="Advertisement"
    >
      <div className="w-full max-w-[970px] overflow-hidden">
        <ins
          ref={adRef}
          className="adsbygoogle block w-full"
          style={{
            minHeight: '90px',
          }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}