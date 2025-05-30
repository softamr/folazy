// src/app/s/[...slug]/page.tsx
'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import { ListingCard } from '@/components/ListingCard';
import { FilterBar } from '@/components/FilterBar';
import { placeholderListings, placeholderCategories_DEPRECATED } from '@/lib/placeholder-data';
import type { Listing, Category } from '@/lib/types';
import { ChevronRight, Home, Search as SearchIcon, PackageOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage, type Language } from '@/hooks/useLanguage';
import { Skeleton } from '@/components/ui/skeleton';

// Simulate fetching listings based on slug and filters
// This function will now be called client-side
async function fetchFilteredListingsClient(
  slug: string[] | undefined, // slug can be undefined initially if params promise not resolved
  filters: { query?: string; minPrice?: string; maxPrice?: string }
): Promise<{ listings: Listing[], category?: Category, subcategory?: Category }> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  
  let currentListings = placeholderListings.filter(l => l.status === 'approved');
  let category: Category | undefined;
  let subcategory: Category | undefined;

  if (slug && slug.length > 0 && slug[0] !== 'all-listings') {
    const mainCategorySlug = slug[0];
    category = placeholderCategories_DEPRECATED.find(c => c.id === mainCategorySlug);

    if (category) {
      currentListings = currentListings.filter(l => l.category.id === category!.id);
      if (slug.length > 1 && category.subcategories) {
        const subCategorySlug = slug[1];
        subcategory = category.subcategories.find(sc => sc.id === subCategorySlug);
        if (subcategory) {
          currentListings = currentListings.filter(l => l.subcategory?.id === subcategory!.id);
        }
      }
    }
  }
  
  if (filters.query) {
    const lowerQuery = filters.query.toLowerCase();
    currentListings = currentListings.filter(l => 
      l.title.toLowerCase().includes(lowerQuery) ||
      l.description.toLowerCase().includes(lowerQuery)
    );
  }
  if (filters.minPrice) {
    currentListings = currentListings.filter(l => l.price >= Number(filters.minPrice));
  }
  if (filters.maxPrice) {
    currentListings = currentListings.filter(l => l.price <= Number(filters.maxPrice));
  }
  
  return { listings: currentListings.slice(0, 12), category, subcategory }; // Return a slice for pagination example
}

const translations = {
  en: {
    home: 'Home',
    allListings: 'All Listings',
    listings: 'Listings',
    noListingsFound: 'No listings found matching your criteria.',
    clearFilters: 'Clear filters and view all',
    previous: 'Previous',
    next: 'Next',
    loadingListings: 'Loading listings...',
  },
  ar: {
    home: 'الرئيسية',
    allListings: 'جميع الإعلانات',
    listings: 'الإعلانات',
    noListingsFound: 'لم يتم العثور على إعلانات تطابق معايير البحث.',
    clearFilters: 'مسح الفلاتر وعرض الكل',
    previous: 'السابق',
    next: 'التالي',
    loadingListings: 'جار تحميل الإعلانات...',
  }
};

interface SearchPageProps {
  params: { slug: string[] }; // This type might be { slug: string[] } or Promise<{ slug: string[] }>
                               // React.use will handle it if `params` is a Promise.
}

export default function SearchPage({ params: paramsProp }: SearchPageProps) {
  const resolvedParams = use(paramsProp); // Resolve the params promise
  const { slug } = resolvedParams; // Destructure slug after resolving
  const { language } = useLanguage();
  const t = translations[language];

  const clientSearchParams = useSearchParams(); // Use hook to get search params

  const [data, setData] = useState<{ listings: Listing[], category?: Category, subcategory?: Category }>({ listings: [] });
  const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null); // Optional: for error handling display

  useEffect(() => {
    setIsLoading(true);
    // Extract params using .get()
    const query = clientSearchParams.get('query') || undefined;
    const minPrice = clientSearchParams.get('minPrice') || undefined;
    const maxPrice = clientSearchParams.get('maxPrice') || undefined;
    
    const filters = { query, minPrice, maxPrice };

    fetchFilteredListingsClient(slug, filters)
      .then(setData)
      .catch(err => {
        console.error("Failed to fetch listings:", err);
        // setError(t.noListingsFound); 
      })
      .finally(() => setIsLoading(false));
  }, [slug, clientSearchParams, t.noListingsFound]); // clientSearchParams is stable and can be a dependency

  const { listings, category, subcategory } = data;

  const isAllListings = slug && slug.length === 1 && slug[0] === 'all-listings';
  const pageTitle = isAllListings 
    ? t.allListings 
    : subcategory?.name || category?.name || t.listings;
  
  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Breadcrumb Skeletons */}
        <div className="flex items-center space-x-1">
          <Skeleton className="h-5 w-12" />
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Skeleton className="h-5 w-24" />
        </div>
        {/* Title Skeleton */}
        <Skeleton className="h-9 w-1/3 mb-4" />
        {/* FilterBar might have its own loading, or we can add skeleton for it */}
        <FilterBar /> 
        {/* Listing Card Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary flex items-center">
          <Home className="h-4 w-4 me-1" /> {t.home}
        </Link>
        {category && !isAllListings && (
          <>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link href={category.href || `/s/${category.id}`} className="hover:text-primary">
              {category.name}
            </Link>
          </>
        )}
        {subcategory && !isAllListings && (
          <>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link href={subcategory.href || `/s/${category?.id}/${subcategory.id}`} className="hover:text-primary">
              {subcategory.name}
            </Link>
          </>
        )}
        {isAllListings && (
             <>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span>{t.allListings}</span>
          </>
        )}
      </div>

      <h1 className="text-3xl font-bold text-foreground">{pageTitle}</h1>
      
      <FilterBar /> {/* FilterBar itself is not translated in this change */}

      {listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <PackageOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">{t.noListingsFound}</p>
          <Button asChild variant="link" className="mt-2">
            <Link href="/s/all-listings">{t.clearFilters}</Link>
          </Button>
        </div>
      )}

      {listings.length > 0 && (
        <div className="flex justify-center mt-12 gap-2">
          <Button variant="outline">{t.previous}</Button>
          <Button variant="outline">{t.next}</Button>
        </div>
      )}
    </div>
  );
}

// Simple Skeleton for ListingCard
function CardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[150px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <Skeleton className="h-8 w-full mt-2" />
    </div>
  );
}

