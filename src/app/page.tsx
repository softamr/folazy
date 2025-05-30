
'use client'; // Converted to client component

import { ListingCard } from '@/components/ListingCard';
import { placeholderListings } from '@/lib/placeholder-data';
import type { Listing } from '@/lib/types';
import { HeroBanner } from '@/components/HeroBanner';
import { PopularCategories } from '@/components/PopularCategories';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage'; // Added for translation
import { useEffect, useState } from 'react'; // Added for client-side filtering

const translations = {
  en: {
    freshRecommendations: "Fresh Recommendations",
    noApprovedListings: "No approved listings found currently.",
    viewMoreButton: "View More Approved Listings",
  },
  ar: {
    freshRecommendations: "توصيات جديدة",
    noApprovedListings: "لم يتم العثور على إعلانات معتمدة حاليًا.",
    viewMoreButton: "عرض المزيد من الإعلانات المعتمدة",
  }
};

export default function HomePage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [approvedListings, setApprovedListings] = useState<Listing[]>([]);
  const [allApprovedCount, setAllApprovedCount] = useState(0);

  useEffect(() => {
    // Simulate fetching and filtering client-side for demonstration
    // In a real app, this filtering might happen on the backend or with more complex client-side data management
    const filtered = placeholderListings.filter(listing => listing.status === 'approved');
    setApprovedListings(filtered.slice(0, 8));
    setAllApprovedCount(filtered.length);
  }, []);


  return (
    <div className="space-y-12">
      <HeroBanner />
      <PopularCategories />
      
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-center text-foreground">
          {t.freshRecommendations}
        </h2>
        {approvedListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {approvedListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">{t.noApprovedListings}</p>
          </div>
        )}
        {allApprovedCount > 8 && (
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/s/all-listings">{t.viewMoreButton}</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
