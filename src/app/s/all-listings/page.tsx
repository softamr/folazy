// src/app/s/all-listings/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ListingCard } from '@/components/ListingCard';
import { FilterBar } from '@/components/FilterBar';
import type { Listing, Category as CategoryType } from '@/lib/types';
import { ChevronRight, Home, PackageOpen, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebase';
import { collection, getDocs, query as firestoreQuery, where, orderBy as firestoreOrderBy, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

// This function is similar to the one in /s/[...slug]/page.tsx
// It's defined here to be self-contained or could be refactored into a shared lib if needed.
async function fetchListingsForAllApproved(
  filters: { 
    query?: string; 
    minPrice?: string; 
    maxPrice?: string; 
    locationCountryId?: string;
    locationGovernorateId?: string;
    locationDistrictId?: string;
  }
): Promise<Listing[]> {
  
  const listingsRef = collection(db, 'listings');
  let q = firestoreQuery(listingsRef, where('status', '==', 'approved'));

  if (filters.locationCountryId) {
    q = firestoreQuery(q, where('locationCountry.id', '==', filters.locationCountryId));
  }
  if (filters.locationGovernorateId) {
    q = firestoreQuery(q, where('locationGovernorate.id', '==', filters.locationGovernorateId));
  }
  if (filters.locationDistrictId) {
    q = firestoreQuery(q, where('locationDistrict.id', '==', filters.locationDistrictId));
  }

  q = firestoreQuery(q, firestoreOrderBy('postedDate', 'desc'));

  const querySnapshot = await getDocs(q);
  let fetchedListings: Listing[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    let postedDate = data.postedDate;
    if (postedDate instanceof Timestamp) {
      postedDate = postedDate.toDate().toISOString();
    }
    fetchedListings.push({ 
        ...data, 
        id: doc.id, 
        postedDate,
        category: data.category || { id: 'unknown', name: 'Unknown' },
        seller: data.seller || { id: 'unknown', name: 'Unknown Seller', email: '', joinDate: new Date().toISOString() },
     } as Listing);
  });

  if (filters.query) {
    const lowerQuery = filters.query.toLowerCase();
    fetchedListings = fetchedListings.filter(l => 
      (l.title?.toLowerCase() || '').includes(lowerQuery) ||
      (l.description?.toLowerCase() || '').includes(lowerQuery)
    );
  }
  if (filters.minPrice) {
    fetchedListings = fetchedListings.filter(l => l.price >= Number(filters.minPrice));
  }
  if (filters.maxPrice) {
    fetchedListings = fetchedListings.filter(l => l.price <= Number(filters.maxPrice));
  }
  
  return fetchedListings.slice(0, 12); // Apply pagination limit if needed
}

const translations = {
  en: {
    home: "Home",
    allListings: "All Listings",
    allApprovedListingsTitle: "All Listings", // Changed to be more generic as it's the title of this page
    noListingsFound: "No listings found matching your criteria.",
    clearFilters: "Clear filters and view all",
    previous: "Previous",
    next: "Next",
    loadingListings: "Loading listings...",
    errorLoadingCategories: "Could not load category data.", // Kept if FilterBar needs it
    errorTitle: "Error",
  },
  ar: {
    home: "الرئيسية",
    allListings: "جميع الإعلانات",
    allApprovedListingsTitle: "جميع الإعلانات",
    noListingsFound: "لم يتم العثور على إعلانات تطابق معايير البحث.",
    clearFilters: "مسح الفلاتر وعرض الكل",
    previous: "السابق",
    next: "التالي",
    loadingListings: "جار تحميل الإعلانات...",
    errorLoadingCategories: "لم نتمكن من تحميل بيانات الفئة.",
    errorTitle: "خطأ",
  }
};

export default function AllListingsPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const clientSearchParams = useSearchParams();

  // Categories are needed for FilterBar
  const [allCategoriesData, setAllCategoriesData] = useState<CategoryType[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);

  useEffect(() => {
    const fetchCategoriesFromDB = async () => {
      setIsLoadingCategories(true);
      try {
        const categoriesRef = collection(db, 'categories');
        const q = firestoreQuery(categoriesRef, firestoreOrderBy('name'));
        const querySnapshot = await getDocs(q);
        const fetchedCategories: CategoryType[] = [];
        querySnapshot.forEach((doc) => {
          fetchedCategories.push({ id: doc.id, ...doc.data() } as CategoryType);
        });
        setAllCategoriesData(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories for AllListingsPage:", error);
        toast({ title: t.errorTitle, description: t.errorLoadingCategories, variant: "destructive" });
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategoriesFromDB();
  }, [toast, t]);

  useEffect(() => {
    // Wait for categories if FilterBar depends on them, though listings can load independently here.
    // if (isLoadingCategories) return; // Not strictly necessary for listings, but good for FilterBar init

    setIsLoadingListings(true);
    const query = clientSearchParams.get('query') || undefined;
    const minPrice = clientSearchParams.get('minPrice') || undefined;
    const maxPrice = clientSearchParams.get('maxPrice') || undefined;
    const locationCountryId = clientSearchParams.get('locationCountryId') || undefined;
    const locationGovernorateId = clientSearchParams.get('locationGovernorateId') || undefined;
    const locationDistrictId = clientSearchParams.get('locationDistrictId') || undefined;
    
    const filters = { query, minPrice, maxPrice, locationCountryId, locationGovernorateId, locationDistrictId };

    fetchListingsForAllApproved(filters)
      .then(setListings)
      .catch(err => {
        console.error("Failed to fetch listings for AllListingsPage:", err);
        toast({ title: t.errorTitle, description: "Failed to load listings.", variant: "destructive" });
      })
      .finally(() => setIsLoadingListings(false));
  }, [clientSearchParams, toast, t]); // Removed isLoadingCategories dependency for listings fetch

  if (isLoadingCategories || isLoadingListings) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          <Skeleton className="h-5 w-12" />
          <ChevronRight className="h-4 w-4 text-muted-foreground rtl:hidden" />
          <ChevronRight className="h-4 w-4 text-muted-foreground ltr:hidden transform rotate-180" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-9 w-1/3 mb-4" />
        <FilterBar /> 
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
      <div className="flex items-center space-x-1 rtl:space-x-reverse text-sm text-muted-foreground flex-wrap">
        <Link href="/" className="hover:text-primary flex items-center">
          <Home className={`h-4 w-4 ${language === 'ar' ? 'ms-1' : 'me-1'}`} /> {t.home}
        </Link>
        <ChevronRight className="h-4 w-4 mx-1 rtl:hidden" />
        <ChevronRight className="h-4 w-4 mx-1 ltr:hidden transform rotate-180" />
        <span>{t.allListings}</span>
      </div>

      <h1 className="text-3xl font-bold text-foreground">{t.allApprovedListingsTitle}</h1>
      
      <FilterBar />

      {listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listingItem) => (
            <ListingCard key={listingItem.id} listing={listingItem} />
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

      {listings.length > 0 && listings.length >= 12 && ( 
        <div className="flex justify-center mt-12 gap-2">
          <Button variant="outline" disabled>{t.previous}</Button>
          <Button variant="outline" disabled>{t.next}</Button>
        </div>
      )}
    </div>
  );
}

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
