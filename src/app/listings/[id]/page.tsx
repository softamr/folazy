import Image from 'next/image';
import Link from 'next/link';
import { placeholderListings, placeholderUsers } from '@/lib/placeholder-data';
import type { Listing } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, DollarSign, MapPin, Tag, UserCircle, MessageSquare, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { RecommendationsSection } from '@/components/RecommendationsSection';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ListingPageParams {
  params: { id: string };
}

// Simulate fetching a listing by ID
async function getListing(id: string): Promise<Listing | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  const listing = placeholderListings.find((listing) => listing.id === id);
  // In a real app, you might also check auth status here to show non-approved to admin
  // For now, if not approved, treat as not found for non-admins
  // This logic could be more sophisticated, e.g. allow admins to see it with status.
  if (listing && listing.status !== 'approved') {
    // Simulate admin check - in real app, use actual auth
    const isAdmin = placeholderUsers[0]?.isAdmin; // Assuming user1 is potential admin
    if (!isAdmin) return undefined; // Non-admin cannot see non-approved listings
  }
  return listing;
}

export default async function ListingPage({ params }: ListingPageParams) {
  const listing = await getListing(params.id);

  if (!listing) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-semibold">Listing not found</h1>
        <p className="text-muted-foreground">The listing you are looking for does not exist, has been removed, or is pending review.</p>
        <Button asChild className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  const seller = listing.seller || placeholderUsers[0]; // Fallback seller
  const categoryPath = listing.subcategory 
    ? `${listing.category.name} > ${listing.subcategory.name}` 
    : listing.category.name;
  
  const isAdminViewing = placeholderUsers[0]?.isAdmin; // Simulate admin check for special UI

  return (
    <div className="max-w-4xl mx-auto py-8">
       <Button variant="outline" asChild className="mb-4">
        <Link href="/">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Listings
        </Link>
      </Button>

      {isAdminViewing && listing.status !== 'approved' && (
        <Alert variant={listing.status === 'pending' ? 'default' : 'destructive'} className="mb-4 bg-yellow-100 border-yellow-400 text-yellow-700 dark:bg-yellow-900 dark:border-yellow-600 dark:text-yellow-300">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Admin View: This listing is currently <strong>{listing.status}</strong>.
            {listing.status === 'pending' && " It is not visible to the public."}
            {listing.status === 'rejected' && " It has been rejected and is not visible to the public."}
          </AlertDescription>
        </Alert>
      )}
       {listing.status === 'sold' && (
        <Alert variant="default" className="mb-4 bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-300">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            This item has been marked as <strong>sold</strong>.
          </AlertDescription>
        </Alert>
      )}


      <Card className="overflow-hidden shadow-lg rounded-lg">
        <CardHeader className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-muted/20">
            {listing.images.slice(0, 4).map((src, index) => (
              <div 
                key={index} 
                className={`relative aspect-video overflow-hidden 
                  ${index === 0 && listing.images.length > 1 ? 'md:col-span-2 md:aspect-[16/7]' : 'aspect-square md:aspect-video'} 
                  ${listing.images.length === 1 ? 'md:col-span-2 md:aspect-[16/7]' : ''}
                  ${listing.images.length === 2 && index === 0 ? 'md:col-span-1' : ''}
                  ${listing.images.length === 2 && index === 1 ? 'md:col-span-1' : ''}
                  ${listing.images.length === 3 && index === 0 ? 'md:col-span-2 md:aspect-[16/7]' : ''}
                  ${listing.images.length === 3 && index !== 0 ? 'md:col-span-1 aspect-square md:aspect-video' : ''}
                  ${listing.images.length >= 4 && index === 0 ? 'md:col-span-2 md:aspect-[16/7]' : ''}
                  ${listing.images.length >= 4 && index > 0 ? 'md:col-span-1 aspect-square md:aspect-video' : ''}
                  `}
              >
                <Image
                  src={src}
                  alt={`${listing.title} - Image ${index + 1}`}
                  fill
                  style={{objectFit: 'cover'}}
                  data-ai-hint="product detail"
                  className="hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
             {listing.images.length === 0 && (
                <div className="md:col-span-2 relative aspect-[16/7] bg-muted flex items-center justify-center">
                    <Image className="h-24 w-24 text-muted-foreground" data-ai-hint="placeholder image" src="https://placehold.co/600x400.png" alt="Placeholder" fill style={{objectFit:'cover'}} />
                </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-start mb-4">
            <CardTitle className="text-3xl font-bold text-foreground mb-2 md:mb-0">{listing.title}</CardTitle>
            <Badge variant="default" className="text-2xl py-2 px-4 bg-primary text-primary-foreground">
              <DollarSign className="h-6 w-6 mr-2" />
              {listing.price.toLocaleString()}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground mb-6">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 shrink-0 text-primary" />
              <span>{listing.location}</span>
            </div>
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2 shrink-0 text-primary" />
              <span>{categoryPath}</span>
            </div>
            <div className="flex items-center col-span-1 sm:col-span-2">
              <CalendarDays className="h-4 w-4 mr-2 shrink-0 text-primary" />
              <span>Posted on: {new Date(listing.postedDate).toLocaleDateString()}</span>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-2 text-foreground">Description</h3>
          <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed mb-8">
            {listing.description}
          </p>

          <Card className="bg-secondary/50 rounded-lg">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Seller Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={seller.avatarUrl || `https://placehold.co/100x100.png`} alt={seller.name} data-ai-hint="avatar person" />
                <AvatarFallback>{seller.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg text-foreground">{seller.name}</p>
                <p className="text-sm text-muted-foreground">Joined: {new Date(seller.joinDate).toLocaleDateString()}</p>
              </div>
              {listing.status !== 'sold' && (
                <Button asChild className="sm:ml-auto mt-4 sm:mt-0 w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href={`/messages?listingId=${listing.id}&recipientId=${seller.id}`}>
                    <MessageSquare className="h-4 w-4 mr-2" /> Contact Seller
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <RecommendationsSection currentListingId={listing.id} />
    </div>
  );
}
