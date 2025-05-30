
// src/app/s/all-listings/page.tsx
'use client'; // Convert to client component

import { ListingCard } from '@/components/ListingCard';
import { FilterBar } from '@/components/FilterBar';
import { placeholderListings } from '@/lib/placeholder-data';
import type { Listing } from '@/lib/types';
import { Home, ChevronRight, PackageOpen, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react'; // For client-side data fetching
import { useLanguage } from '@/hooks/useLanguage'; // For translation

const translations = {
  en: {
    home: "Home",
    allListings: "All Listings",
    allApprovedListingsTitle: "All Approved Listings",
    noApprovedListings: "No approved listings found currently.",
    previous: "Previous",
    next: "Next",
    loadingListings: "Loading listings...",
  },
  ar: {
    home: "الرئيسية",
    allListings: "جميع الإعلانات",
    allApprovedListingsTitle: "جميع الإعلانات المعتمدة",
    noApprovedListings: "لم يتم العثور على إعلانات معتمدة حاليًا.",
    previous: "السابق",
    next: "التالي",
    loadingListings: "جار تحميل الإعلانات...",
  }
};

// Simulate fetching all listings client-side
async function getAllListingsClient(): Promise<Listing[]> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  return placeholderListings.filter(listing => listing.status === 'approved');
}

export default function AllListingsPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getAllListingsClient()
      .then(data => {
        setListings(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch all listings:", error);
        setIsLoading(false);
        // Potentially set an error state and display an error message
      });
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{t.loadingListings}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary flex items-center">
          <Home className={`h-4 w-4 ${language === 'ar' ? 'ms-1' : 'me-1'}`} /> {t.home}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span>{t.allListings}</span>
      </div>
      <h1 className="text-3xl font-bold text-foreground">{t.allApprovedListingsTitle}</h1>
      
      <FilterBar />

      {listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <PackageOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">{t.noApprovedListings}</p>
        </div>
      )}

      {listings.length > 8 && (
        <div className="flex justify-center mt-12 gap-2">
          <Button variant="outline">{t.previous}</Button>
          <Button variant="outline">{t.next}</Button>
        </div>
      )}
    </div>
  );
}
