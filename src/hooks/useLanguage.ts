
'use client';

import { useState, useEffect, useCallback } from 'react';

export type Language = 'en' | 'ar';

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>('en'); // Default to English

  useEffect(() => {
    // This effect runs only on the client after hydration
    const storedLang = localStorage.getItem('appLanguage') as Language | null;
    const initialLang = storedLang || 'en';
    
    setLanguageState(initialLang);
    document.documentElement.lang = initialLang;
    document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem('appLanguage', lang);
    setLanguageState(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    // Force re-render of components using this hook, or they can listen to storage events.
    // For simplicity, components using this hook will re-render due to state change.
  }, []);

  return { language, setLanguage };
}
