
'use client'; 

import { ListingCard } from '@/components/ListingCard';
import { placeholderListings } from '@/lib/placeholder-data';
import type { Listing } from '@/lib/types';
import { Lightbulb } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext'; // Updated import path

const translations = {
  en: {
    title: "You Might Also Like",
    description: "AI-powered recommendations based on your interests.",
  },
  ar: {
    title: "قد يعجبك ايضا",
    description: "توصيات مدعومة بالذكاء الاصطناعي بناءً على اهتماماتك.",
  }
};

interface RecommendationsSectionProps {
  currentListingId: string;
}

export function RecommendationsSection({ currentListingId }: RecommendationsSectionProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const recommendedListings: Listing[] = placeholderListings
    .filter(listing => listing.id !== currentListingId && listing.status === 'approved') // Ensure only approved
    .slice(0, 4); 

  if (recommendedListings.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-6 flex items-center">
        <Lightbulb className={`h-6 w-6 ${language === 'ar' ? 'ms-2' : 'me-2'} text-primary`} />
        {t.title}
      </h2>
      <p className="text-sm text-muted-foreground mb-4">{t.description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendedListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
