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

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_ID || '';

/**
 * Validates that both the publisher client ID (ca-pub-...) and numeric ad slot ID
 * are properly configured before rendering manual ad units. This prevents empty
 * placeholder containers or HTTP 400 errors during Google AdSense site review.
 */
function isValidAdUnit(clientId: string, slotId: string): boolean {
  if (!clientId || !slotId) return false;
  const validClient = /^ca-pub-\d{10,20}$/.test(clientId.trim());
  const validSlot = /^\d{5,20}$/.test(slotId.trim());
  return validClient && validSlot;
}

export default function AdUnit({
  slotId,
  className = '',
}: AdUnitProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);
  const isReady = isValidAdUnit(ADSENSE_CLIENT, slotId);

  useEffect(() => {
    if (!isReady) return;
    if (pushedRef.current) return;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      pushedRef.current = true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('AdSense initialization warning:', error);
      }
    }
  }, [isReady, slotId]);

  if (!isReady) {
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
          data-ad-client={ADSENSE_CLIENT.trim()}
          data-ad-slot={slotId.trim()}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}