// src/app/s/all-listings/page.tsx
'use client'; // Keep client directive for Suspense usage here

import React, { Suspense } from 'react';
import AllListingsClient from './AllListingsClient'; // Renamed component
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Translations specifically for this page wrapper's fallback
const pageTranslations = {
  en: {
    loadingListings: "Loading listings...",
  },
  ar: {
    loadingListings: "جار تحميل الإعلانات...",
  }
};

function LoadingFallback() {
  const { language } = useLanguage(); // Access language for fallback text
  const t = pageTranslations[language];

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-1 rtl:space-x-reverse">
        <Skeleton className="h-5 w-12" />
        <ChevronRight className="h-4 w-4 text-muted-foreground rtl:hidden" />
        <ChevronRight className="h-4 w-4 text-muted-foreground ltr:hidden transform rotate-180" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-9 w-1/3 mb-4" />
      {/* Minimal FilterBar skeleton or just omit for page wrapper fallback */}
      <div className="mb-8 p-4 md:p-6 bg-card rounded-lg shadow">
        <Skeleton className="h-10 w-full mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex flex-col space-y-3">
            <Skeleton className="h-[150px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-8 w-full mt-2" />
          </div>
        ))}
      </div>
      <p className="text-center text-muted-foreground mt-4">{t.loadingListings}</p>
    </div>
  );
}

export default function AllListingsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AllListingsClient />
    </Suspense>
  );
}
