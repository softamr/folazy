// src/app/s/[...slug]/page.tsx
import { ListingCard } from '@/components/ListingCard';
import { FilterBar } from '@/components/FilterBar';
import { placeholderListings, placeholderCategories_DEPRECATED } from '@/lib/placeholder-data';
import type { Listing, Category } from '@/lib/types';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface SearchPageParams {
  params: { slug: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Simulate fetching listings based on slug and searchParams
async function getFilteredListings(slug: string[], searchParams: any): Promise<{ listings: Listing[], category?: Category, subcategory?: Category }> {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
  
  let currentListings = placeholderListings.filter(l => l.status === 'approved'); // Only show approved listings
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
  
  // Basic filtering simulation (can be expanded)
  if (searchParams.query) {
    currentListings = currentListings.filter(l => 
      l.title.toLowerCase().includes(String(searchParams.query).toLowerCase()) ||
      l.description.toLowerCase().includes(String(searchParams.query).toLowerCase())
    );
  }
  if (searchParams.minPrice) {
    currentListings = currentListings.filter(l => l.price >= Number(searchParams.minPrice));
  }
  if (searchParams.maxPrice) {
    currentListings = currentListings.filter(l => l.price <= Number(searchParams.maxPrice));
  }
  
  return { listings: currentListings.slice(0, 12), category, subcategory }; // Return a slice for pagination example
}

export default async function SearchPage({ params, searchParams }: SearchPageParams) {
  const { slug } = params;
  const { listings, category, subcategory } = await getFilteredListings(slug, searchParams);

  const isAllListings = slug && slug.length === 1 && slug[0] === 'all-listings';
  const pageTitle = isAllListings ? 'All Listings' : subcategory?.name || category?.name || 'Listings';
  
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary flex items-center">
          <Home className="h-4 w-4 mr-1" /> Home
        </Link>
        {category && !isAllListings && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link href={category.href || `/s/${category.id}`} className="hover:text-primary">
              {category.name}
            </Link>
          </>
        )}
        {subcategory && !isAllListings && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link href={subcategory.href || `/s/${category?.id}/${subcategory.id}`} className="hover:text-primary">
              {subcategory.name}
            </Link>
          </>
        )}
        {isAllListings && (
             <>
            <ChevronRight className="h-4 w-4" />
            <span>All Listings</span>
          </>
        )}
      </div>

      <h1 className="text-3xl font-bold text-foreground">{pageTitle}</h1>
      
      <FilterBar />

      {listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No listings found matching your criteria.</p>
          <Button asChild variant="link" className="mt-2">
            <Link href="/s/all-listings">Clear filters and view all</Link>
          </Button>
        </div>
      )}

      {/* Placeholder for Pagination */}
      {listings.length > 0 && (
        <div className="flex justify-center mt-12">
          <Button variant="outline" className="mr-2">Previous</Button>
          <Button variant="outline">Next</Button>
        </div>
      )}
    </div>
  );
}
