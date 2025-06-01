
'use client';

import { useLanguage } from '@/contexts/LanguageContext'; // Updated import path

const translations = {
  en: {
    copyright: 'Fwlazy. All rights reserved.',
    builtBy: 'Built by Amr Zakaria',
  },
  ar: {
    copyright: 'فولاذي. جميع الحقوق محفوظة.',
    builtBy: 'بني بواسطة عمرو زكريا',
  }
};

export function Footer() {
  const { language } = useLanguage();
  const t = translations[language];
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t border-border py-6 text-center text-sm text-muted-foreground">
      <div className="container mx-auto px-4">
        <p>&copy; {currentYear} {t.copyright}</p>
        <p className="mt-1">
          {t.builtBy}
        </p>
      </div>
    </footer>
  );
}
