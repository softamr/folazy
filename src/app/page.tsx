import { ListingCard } from '@/components/ListingCard';
import { FilterBar } from '@/components/FilterBar';
import { placeholderListings } from '@/lib/placeholder-data';
import type { Listing } from '@/lib/types';

export default function HomePage() {
  // In a real app, listings would be fetched from an API
  const listings: Listing[] = placeholderListings;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center text-foreground">
        Discover Amazing Deals
      </h1>
      <FilterBar />
      {listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No listings found. Try adjusting your filters!</p>
        </div>
      )}
    </div>
  );
}
