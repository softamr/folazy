
'use client';

import { useLanguage } from '@/hooks/useLanguage';

const translations = {
  en: {
    copyright: 'Fwlazy. All rights reserved.',
    builtWith: 'Built with Next.js and Firebase.',
  },
  ar: {
    copyright: 'فولاكي. جميع الحقوق محفوظة.',
    builtWith: 'تم البناء باستخدام Next.js و Firebase.',
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
          {t.builtWith}
        </p>
      </div>
    </footer>
  );
}
