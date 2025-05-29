import Image from 'next/image';
import { placeholderListings, placeholderUsers } from '@/lib/placeholder-data';
import type { Listing } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, DollarSign, MapPin, Tag, UserCircle, MessageSquare } from 'lucide-react';
import { RecommendationsSection } from '@/components/RecommendationsSection';
import { Badge } from '@/components/ui/badge';

interface ListingPageParams {
  params: { id: string };
}

// Simulate fetching a listing by ID
async function getListing(id: string): Promise<Listing | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  return placeholderListings.find((listing) => listing.id === id);
}

export default async function ListingPage({ params }: ListingPageParams) {
  const listing = await getListing(params.id);

  if (!listing) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-semibold">Listing not found</h1>
        <p className="text-muted-foreground">The listing you are looking for does not exist or has been removed.</p>
        <Button asChild className="mt-4">
          <a href="/">Go to Homepage</a>
        </Button>
      </div>
    );
  }

  const seller = listing.seller || placeholderUsers[0]; // Fallback seller

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="overflow-hidden shadow-xl">
        <CardHeader className="p-0">
          {/* Image Carousel/Grid Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-muted/20 p-2">
            {listing.images.slice(0, 4).map((src, index) => (
              <div key={index} className={`relative aspect-video rounded-md overflow-hidden ${index === 0 && listing.images.length > 1 ? 'md:col-span-2' : ''} ${listing.images.length === 1 ? 'md:col-span-2' : ''}`}>
                <Image
                  src={src}
                  alt={`${listing.title} - Image ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="product detail"
                />
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
            <CardTitle className="text-3xl font-bold text-primary">{listing.title}</CardTitle>
            <Badge variant="secondary" className="mt-2 md:mt-0 text-lg py-1 px-3">
              <DollarSign className="h-5 w-5 mr-1.5" />
              {listing.price.toLocaleString()}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 shrink-0" />
              <span>{listing.location}</span>
            </div>
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2 shrink-0" />
              <span>{listing.category.name}</span>
            </div>
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-2 shrink-0" />
              <span>Posted on: {new Date(listing.postedDate).toLocaleDateString()}</span>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-2">Description</h3>
          <p className="text-foreground whitespace-pre-wrap leading-relaxed mb-8">
            {listing.description}
          </p>

          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-xl">Seller Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={seller.avatarUrl} alt={seller.name} data-ai-hint="avatar person" />
                <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg text-foreground">{seller.name}</p>
                <p className="text-sm text-muted-foreground">Joined: {new Date(seller.joinDate).toLocaleDateString()}</p>
              </div>
              <Button className="sm:ml-auto mt-4 sm:mt-0 w-full sm:w-auto">
                <MessageSquare className="h-4 w-4 mr-2" /> Contact Seller
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <RecommendationsSection currentListingId={listing.id} />
    </div>
  );
}
