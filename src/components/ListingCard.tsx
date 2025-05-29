import Image from 'next/image';
import Link from 'next/link';
import type { Listing } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Tag } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0 relative">
        <Link href={`/listings/${listing.id}`} className="block">
          <Image
            src={listing.images[0]}
            alt={listing.title}
            width={600}
            height={400}
            className="w-full h-48 object-cover"
            data-ai-hint="product photo"
          />
        </Link>
        {listing.isFeatured && (
          <Badge variant="default" className="absolute top-2 right-2 bg-accent text-accent-foreground">
            Featured
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/listings/${listing.id}`} className="block">
          <CardTitle className="text-lg font-semibold hover:text-primary transition-colors">
            {listing.title}
          </CardTitle>
        </Link>
        <p className="text-xl font-bold text-primary mt-1 mb-2">${listing.price.toLocaleString()}</p>
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1.5 shrink-0" />
            <span>{listing.location}</span>
          </div>
          <div className="flex items-center">
            <Tag className="h-4 w-4 mr-1.5 shrink-0" />
            <span>{listing.category.name}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button asChild className="w-full" variant="outline">
          <Link href={`/listings/${listing.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
