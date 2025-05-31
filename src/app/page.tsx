
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
    featuredListingsSectionTitle: "Featured Listings",
    moreRecommendationsSectionTitle: "More Recommendations",
    noApprovedListings: "No approved listings found currently.",
    noFeaturedListings: "No featured listings available right now, check out these fresh finds!",
    viewMoreButton: "View More Approved Listings",
  },
  ar: {
    freshRecommendations: "توصيات جديدة",
    featuredListingsSectionTitle: "إعلانات مميزة",
    moreRecommendationsSectionTitle: "المزيد من التوصيات",
    noApprovedListings: "لم يتم العثور على إعلانات معتمدة حاليًا.",
    noFeaturedListings: "لا توجد إعلانات مميزة متاحة الآن، تحقق من هذه الاكتشافات الجديدة!",
    viewMoreButton: "عرض المزيد من الإعلانات المعتمدة",
  }
};

const MAX_HOME_LISTINGS = 8;
const MAX_FEATURED_TO_SHOW_SEPARATELY = 4;

export default function HomePage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [displayListings, setDisplayListings] = useState<Listing[]>([]);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [otherRecommendations, setOtherRecommendations] = useState<Listing[]>([]);
  const [allApprovedCount, setAllApprovedCount] = useState(0);

  useEffect(() => {
    const allApproved = placeholderListings.filter(listing => listing.status === 'approved');
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

  }, []);


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
