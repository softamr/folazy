
'use client';

import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize with 'en' to match server render (assuming RootLayout defaults to 'en')
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // This effect runs only on the client, after the initial render and hydration
    setMounted(true);

    const storedLang = localStorage.getItem('appLanguage') as Language | null;
    const browserLangIsArabic = typeof navigator !== 'undefined' && navigator.language.startsWith('ar');
    const clientDeterminedLang = storedLang || (browserLangIsArabic ? 'ar' : 'en');

    // Update language state and HTML attributes if different from initial 'en'
    // or if they need to be explicitly set.
    if (clientDeterminedLang !== language) {
        setLanguageState(clientDeterminedLang);
    }
    // Always set HTML attributes after mount to reflect the correct client-side language
    document.documentElement.lang = clientDeterminedLang;
    document.documentElement.dir = clientDeterminedLang === 'ar' ? 'rtl' : 'ltr';

  }, [language]); // Include language in dependency array to re-run if it's changed by setLanguage directly.

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem('appLanguage', lang);
    setLanguageState(lang); // Update React state
    // HTML attributes will be updated by the useEffect above when `language` state changes
    router.refresh(); // Refresh Next.js router state if needed
  }, [router]);

  // On the initial client render (before useEffect runs and `mounted` is true),
  // provide 'en' to match the server.
  // After mount, provide the actual `language` state.
  const contextValue = {
    language: mounted ? language : 'en',
    setLanguage,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
