
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
  const [language, setLanguageState] = useState<Language>('en'); // Default, will be updated client-side
  const router = useRouter();

  useEffect(() => {
    // This effect runs only on the client after hydration
    const storedLang = localStorage.getItem('appLanguage') as Language | null;
    // Determine initial language: localStorage > browser preference > default 'en'
    const browserLangIsArabic = typeof navigator !== 'undefined' && navigator.language.startsWith('ar');
    const initialLang = storedLang || (browserLangIsArabic ? 'ar' : 'en');
    
    setLanguageState(initialLang);
    if (typeof document !== 'undefined') {
        document.documentElement.lang = initialLang;
        document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem('appLanguage', lang);
    setLanguageState(lang); // Update React state, triggering re-renders for consumers
    if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
    router.refresh(); // Refresh Next.js router state
  }, [router]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
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
