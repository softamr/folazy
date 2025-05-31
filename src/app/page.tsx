
'use client';

import { ListingCard } from '@/components/ListingCard';
import type { Listing } from '@/lib/types';
import { HeroBanner } from '@/components/HeroBanner';
import { PopularCategories } from '@/components/PopularCategories';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, Timestamp, limit as firestoreLimit } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PackageOpen } from 'lucide-react';

const translations = {
  en: {
    freshRecommendations: "Fresh Recommendations",
    featuredListingsSectionTitle: "Featured Listings",
    moreRecommendationsSectionTitle: "More Recommendations",
    noApprovedListings: "No approved listings found currently.",
    noFeaturedListings: "No featured listings available right now, check out these fresh finds!",
    viewMoreButton: "View More Approved Listings",
    loadingListings: "Loading listings...",
    errorLoadingListings: "Could not load listings. Please try again later.",
    errorTitle: "Error",
  },
  ar: {
    freshRecommendations: "توصيات جديدة",
    featuredListingsSectionTitle: "إعلانات مميزة",
    moreRecommendationsSectionTitle: "المزيد من التوصيات",
    noApprovedListings: "لم يتم العثور على إعلانات معتمدة حاليًا.",
    noFeaturedListings: "لا توجد إعلانات مميزة متاحة الآن، تحقق من هذه الاكتشافات الجديدة!",
    viewMoreButton: "عرض المزيد من الإعلانات المعتمدة",
    loadingListings: "جار تحميل الإعلانات...",
    errorLoadingListings: "لم نتمكن من تحميل الإعلانات. يرجى المحاولة مرة أخرى لاحقًا.",
    errorTitle: "خطأ",
  }
};

const MAX_HOME_LISTINGS = 8;
const MAX_FEATURED_TO_SHOW_SEPARATELY = 4;

export default function HomePage() {
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [otherRecommendations, setOtherRecommendations] = useState<Listing[]>([]);
  const [allApprovedCount, setAllApprovedCount] = useState(0);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const listingsRef = collection(db, 'listings');
        const q = query(
          listingsRef,
          where('status', '==', 'approved'),
          orderBy('postedDate', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const allApproved: Listing[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          let postedDate = data.postedDate;
          if (postedDate instanceof Timestamp) {
            postedDate = postedDate.toDate().toISOString();
          }
          allApproved.push({ 
            ...data, 
            id: doc.id, 
            postedDate,
            category: data.category || { id: 'unknown', name: 'Unknown' },
            seller: data.seller || { id: 'unknown', name: 'Unknown Seller', email: '', joinDate: new Date().toISOString() },
           } as Listing);
        });

        setAllApprovedCount(allApproved.length);

        const featured = allApproved.filter(listing => listing.isFeatured).sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
        const nonFeatured = allApproved.filter(listing => !listing.isFeatured).sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());

        if (featured.length >= MAX_FEATURED_TO_SHOW_SEPARATELY) {
            setFeaturedListings(featured.slice(0, MAX_FEATURED_TO_SHOW_SEPARATELY));
            const remainingFeatured = featured.slice(MAX_FEATURED_TO_SHOW_SEPARATELY);
            setOtherRecommendations([...remainingFeatured, ...nonFeatured].slice(0, MAX_HOME_LISTINGS - featured.slice(0, MAX_FEATURED_TO_SHOW_SEPARATELY).length));
        } else {
            setFeaturedListings(featured);
            setOtherRecommendations(nonFeatured.slice(0, MAX_HOME_LISTINGS - featured.length));
        }

      } catch (error) {
        console.error("Error fetching listings for homepage:", error);
        toast({
          title: t.errorTitle,
          description: t.errorLoadingListings,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [toast, t]);


  if (isLoading) {
    return (
      <div className="space-y-12">
        <HeroBanner />
        <PopularCategories />
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
          <p className="text-muted-foreground">{t.loadingListings}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <HeroBanner />
      <PopularCategories />
      
      {featuredListings.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-center text-foreground">
            {t.featuredListingsSectionTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {otherRecommendations.length > 0 && (
         <div>
          <h2 className="text-2xl font-semibold mb-6 text-center text-foreground">
            {featuredListings.length === 0 ? t.noFeaturedListings : t.moreRecommendationsSectionTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {otherRecommendations.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}
      
      {allApprovedCount === 0 && featuredListings.length === 0 && otherRecommendations.length === 0 && (
        <div className="text-center py-12">
            <PackageOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-xl text-muted-foreground">{t.noApprovedListings}</p>
        </div>
      )}

      {allApprovedCount > MAX_HOME_LISTINGS && (
        <div className="text-center mt-8">
          <Button asChild variant="outline">
            <Link href="/s/all-listings">{t.viewMoreButton}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
