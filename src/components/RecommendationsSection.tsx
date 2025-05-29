import { ListingCard } from '@/components/ListingCard';
import { placeholderListings } from '@/lib/placeholder-data';
import type { Listing } from '@/lib/types';
import { Lightbulb } from 'lucide-react';

interface RecommendationsSectionProps {
  currentListingId: string;
}

export function RecommendationsSection({ currentListingId }: RecommendationsSectionProps) {
  // Simulate fetching recommendations. In a real app, this would call getListingRecommendations AI flow.
  const recommendedListings: Listing[] = placeholderListings
    .filter(listing => listing.id !== currentListingId)
    .slice(0, 4); // Show up to 4 recommendations

  if (recommendedListings.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-6 flex items-center">
        <Lightbulb className="h-6 w-6 mr-2 text-primary" />
        You Might Also Like
      </h2>
      <p className="text-sm text-muted-foreground mb-4">AI-powered recommendations based on your interests.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendedListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
