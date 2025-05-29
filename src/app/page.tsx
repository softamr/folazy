import { ListingCard } from '@/components/ListingCard';
// import { FilterBar } from '@/components/FilterBar'; // FilterBar might be part of a search results page instead
import { placeholderListings } from '@/lib/placeholder-data';
import type { Listing } from '@/lib/types';
import { HeroBanner } from '@/components/HeroBanner';
import { PopularCategories } from '@/components/PopularCategories';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  // In a real app, listings would be fetched from an API
  const listings: Listing[] = placeholderListings.slice(0, 8); // Show limited listings on homepage

  return (
    <div className="space-y-12">
      <HeroBanner />
      <PopularCategories />
      
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-center text-foreground">
          Fresh Recommendations
        </h2>
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No listings found currently.</p>
          </div>
        )}
        {placeholderListings.length > 8 && (
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/s/all-listings">View More Listings</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
