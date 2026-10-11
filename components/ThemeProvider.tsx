'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useServerInsertedHTML } from 'next/navigation';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useServerInsertedHTML(() => {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('theme');var d=document.documentElement;var s=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||((!t||t==='system')&&s)){d.classList.add('dark');d.style.colorScheme='dark';}else{d.classList.remove('dark');d.style.colorScheme='light';}}catch(e){}})()`,
        }}
      />
    );
  });

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      scriptProps={{ type: 'application/json' }}
    >
      {children}
    </NextThemesProvider>
  );
}