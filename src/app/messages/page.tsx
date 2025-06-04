
'use client';

import { Suspense } from 'react';
import MessagesClientContent from './MessagesClientContent';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Translations specifically for the loading fallback in this route page wrapper.
// The main translations are in MessagesClientContent.
const routeTranslations = {
  en: {
    loadingMessages: "Loading messages...",
  },
  ar: {
    loadingMessages: "جار تحميل الرسائل...",
  }
};

function LoadingFallback({ loadingText }: { loadingText: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">{loadingText}</p>
    </div>
  );
}

// This is the actual page component Next.js will render for the /messages route.
export default function MessagesPage() {
  const { language } = useLanguage(); // useLanguage can be used here for the fallback
  const t = routeTranslations[language];

  return (
    <Suspense fallback={<LoadingFallback loadingText={t.loadingMessages} />}>
      <MessagesClientContent />
    </Suspense>
  );
}
