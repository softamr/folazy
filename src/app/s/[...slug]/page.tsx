
// src/app/s/[...slug]/page.tsx
'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
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

async function fetchFilteredListingsClient(
  slug: string[] | undefined,
  filters: { 
    query?: string; 
    minPrice?: string; 
    maxPrice?: string; 
    categoryId?: string; 
    subcategoryId?: string;
    locationCountryId?: string;
    locationGovernorateId?: string;
    locationDistrictId?: string;
  },
  allFirestoreCategories: CategoryType[]
): Promise<{ listings: Listing[], category?: CategoryType, subcategory?: CategoryType, breadcrumbCategories: CategoryType[] }> {
  
  let category: CategoryType | undefined;
  let subcategory: CategoryType | undefined;
  const breadcrumbCategories: CategoryType[] = [];

  let slugCategory: CategoryType | undefined;
  let slugSubcategory: CategoryType | undefined;

  if (slug && slug.length > 0 && slug[0] !== 'all-listings' && allFirestoreCategories.length > 0) {
    slugCategory = allFirestoreCategories.find(c => c.id === slug[0]);
    if (slugCategory) {
      breadcrumbCategories.push(slugCategory);
      if (slug.length > 1 && slugCategory.subcategories) {
        slugSubcategory = slugCategory.subcategories.find(sc => sc.id === slug[1]);
        if (slugSubcategory) {
          breadcrumbCategories.push(slugSubcategory);
        }
      }
    }
  }
  
  let filterCategoryId = filters.categoryId;
  let filterSubcategoryId = filters.subcategoryId;

  if (!filterCategoryId && slugCategory) {
    filterCategoryId = slugCategory.id;
  }
  if (!filterSubcategoryId && slugSubcategory) {
    filterSubcategoryId = slugSubcategory.id;
  }

  const listingsRef = collection(db, 'listings');
  let q = firestoreQuery(listingsRef, where('status', '==', 'approved'));

  if (filterCategoryId) {
    q = firestoreQuery(q, where('category.id', '==', filterCategoryId));
    category = allFirestoreCategories.find(c => c.id === filterCategoryId);
  }
  if (filterSubcategoryId) {
    q = firestoreQuery(q, where('subcategory.id', '==', filterSubcategoryId));
    if (category && category.subcategories) {
      subcategory = category.subcategories.find(sc => sc.id === filterSubcategoryId);
    }
  }

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
  
  if (breadcrumbCategories.length === 0 && category) {
    breadcrumbCategories.push(category);
    if (subcategory) {
        breadcrumbCategories.push(subcategory);
    }
  }

  return { listings: fetchedListings.slice(0, 12), category, subcategory, breadcrumbCategories };
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
    errorLoadingCategories: 'Could not load category data.',
    errorTitle: 'Error',
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
    errorLoadingCategories: 'لم نتمكن من تحميل بيانات الفئة.',
    errorTitle: 'خطأ',
  }
};

interface SearchPageProps {
  params: { slug?: string[] };
}

export default function SearchPage({ params: paramsProp }: SearchPageProps) {
  const resolvedParams = use(paramsProp);
  const slug = resolvedParams.slug;
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();

  const clientSearchParams = useSearchParams();

  const [allCategoriesData, setAllCategoriesData] = useState<CategoryType[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [data, setData] = useState<{ listings: Listing[], category?: CategoryType, subcategory?: CategoryType, breadcrumbCategories: CategoryType[] }>({ listings: [], breadcrumbCategories: [] });
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
        console.error("Error fetching categories for search page:", error);
        toast({ title: t.errorTitle, description: t.errorLoadingCategories, variant: "destructive" });
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategoriesFromDB();
  }, [toast, t]);

  useEffect(() => {
    if (isLoadingCategories) return;

    setIsLoadingListings(true);
    const query = clientSearchParams.get('query') || undefined;
    const minPrice = clientSearchParams.get('minPrice') || undefined;
    const maxPrice = clientSearchParams.get('maxPrice') || undefined;
    const categoryId = clientSearchParams.get('categoryId') || undefined;
    const subcategoryId = clientSearchParams.get('subcategoryId') || undefined;
    const locationCountryId = clientSearchParams.get('locationCountryId') || undefined;
    const locationGovernorateId = clientSearchParams.get('locationGovernorateId') || undefined;
    const locationDistrictId = clientSearchParams.get('locationDistrictId') || undefined;
    
    const filters = { query, minPrice, maxPrice, categoryId, subcategoryId, locationCountryId, locationGovernorateId, locationDistrictId };

    fetchFilteredListingsClient(slug, filters, allCategoriesData)
      .then(setData)
      .catch(err => {
        console.error("Failed to fetch listings:", err);
        toast({ title: t.errorTitle, description: "Failed to load listings.", variant: "destructive" });
      })
      .finally(() => setIsLoadingListings(false));
  }, [slug, clientSearchParams, isLoadingCategories, allCategoriesData, toast, t]);

  const { listings, category, subcategory, breadcrumbCategories } = data;

  const getCategoryNameForDisplay = (cat: CategoryType): string => {
    if (language === 'ar') {
        const arNames: Record<string, string> = {
             'electronics': 'إلكترونيات', 'vehicles': 'مركبات', 'properties': 'عقارات',
             'mobiles': 'هواتف محمولة', 'tablets': 'أجهزة لوحية', 'cars': 'سيارات',
             'apartments for rent': 'شقق للإيجار',
             'properties for rent': 'عقارات للإيجار', 
             'properties for sale': 'عقارات للبيع',
        };
        const catIdLower = cat.id?.toLowerCase() || '';
        const catNameLower = cat.name?.toLowerCase() || '';
        return arNames[catIdLower] || arNames[catNameLower] || cat.name;
    }
    return cat.name;
  };
  
  const isAllListingsPage = !slug || (slug && slug.length === 1 && slug[0] === 'all-listings');
  
  let pageTitle = t.allListings;
  if (!isAllListingsPage && breadcrumbCategories.length > 0) {
    pageTitle = getCategoryNameForDisplay(breadcrumbCategories[breadcrumbCategories.length - 1]);
  } else if (category) { 
    pageTitle = getCategoryNameForDisplay(category);
    if (subcategory) {
        pageTitle = getCategoryNameForDisplay(subcategory);
    }
  }


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
        {breadcrumbCategories.map((bcCategory, index) => (
          <React.Fragment key={bcCategory.id}>
            <ChevronRight className="h-4 w-4 mx-1 rtl:hidden" />
            <ChevronRight className="h-4 w-4 mx-1 ltr:hidden transform rotate-180" />
            {index === breadcrumbCategories.length - 1 && !clientSearchParams.get('subcategoryId') && slug && slug.length -1 === index ? ( 
                <span>{getCategoryNameForDisplay(bcCategory)}</span>
            ): (
                 <Link href={bcCategory.href || `/s/${breadcrumbCategories.slice(0, index + 1).map(c=>c.id).join('/')}`} className="hover:text-primary">
                    {getCategoryNameForDisplay(bcCategory)}
                </Link>
            )}
          </React.Fragment>
        ))}
        {isAllListingsPage && breadcrumbCategories.length === 0 && (
            <>
                <ChevronRight className="h-4 w-4 mx-1 rtl:hidden" />
                <ChevronRight className="h-4 w-4 mx-1 ltr:hidden transform rotate-180" />
                <span>{t.allListings}</span>
            </>
        )}
      </div>

      <h1 className="text-3xl font-bold text-foreground">{pageTitle}</h1>
      
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

