// src/app/s/all-listings/page.tsx
import { ListingCard } from '@/components/ListingCard';
import { FilterBar } from '@/components/FilterBar';
import { placeholderListings } from '@/lib/placeholder-data';
import type { Listing } from '@/lib/types';
import { Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Simulate fetching all listings
async function getAllListings(): Promise<Listing[]> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  return placeholderListings.filter(listing => listing.status === 'approved'); // Only show approved listings
}

export default async function AllListingsPage() {
  const listings = await getAllListings();

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary flex items-center">
          <Home className="h-4 w-4 mr-1" /> Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span>All Listings</span>
      </div>
      <h1 className="text-3xl font-bold text-foreground">All Approved Listings</h1>
      
      <FilterBar />

      {listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No approved listings found currently.</p>
        </div>
      )}

      {/* Placeholder for Pagination */}
      {listings.length > 8 && ( // Only show if more than some items per page
        <div className="flex justify-center mt-12">
          <Button variant="outline" className="mr-2">Previous</Button>
          <Button variant="outline">Next</Button>
        </div>
      )}
    </div>
  );
}
