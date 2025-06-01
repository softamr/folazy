
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Listing } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, MapPin, Tag, MessageSquare, ArrowLeft, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { RecommendationsSection } from '@/components/RecommendationsSection';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEffect, useState, use } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSearchParams } from 'next/navigation';

async function getListingFromFirestore(id: string, isAdminViewing: boolean = false): Promise<Listing | undefined> {
  try {
    const listingDocRef = doc(db, 'listings', id);
    const listingDocSnap = await getDoc(listingDocRef);

    if (!listingDocSnap.exists()) {
      return undefined;
    }

    const data = listingDocSnap.data() as Omit<Listing, 'id'>;

    let postedDate = data.postedDate;
    if (postedDate && typeof postedDate !== 'string' && 'toDate' in postedDate) {
      postedDate = (postedDate as unknown as Timestamp).toDate().toISOString();
    }

    const listing: Listing = {
      id: listingDocSnap.id,
      ...data,
      postedDate: postedDate as string,
      category: data.category || { id: 'unknown', name: 'Unknown' },
      seller: data.seller || {
        id: 'unknown_seller',
        name: 'Unknown Seller',
        email: '',
        avatarUrl: '',
        joinDate: new Date().toISOString(),
        isAdmin: false,
      },
      images: data.images || [],
    };

    if (!isAdminViewing && listing.status !== 'approved' && listing.status !== 'sold') {
      return undefined;
    }
    return listing;

  } catch (error) {
    console.error("Error fetching listing from Firestore:", error);
    return undefined;
  }
}

const translations = {
  en: {
    backToListings: "Back to Listings",
    listingNotFoundTitle: "Listing not found",
    listingNotFoundDescription: "The listing you are looking for does not exist, has been removed, or is not currently available.",
    goToHomepage: "Go to Homepage",
    adminViewAlert: "Admin View:",
    statusPendingAlert: "This listing is currently <strong>pending</strong>. It is not visible to the public.",
    statusRejectedAlert: "This listing is currently <strong>rejected</strong>. It has been rejected and is not visible to the public.",
    statusSoldAlert: "This item has been marked as <strong>sold</strong>.",
    descriptionTitle: "Description",
    sellerInfoTitle: "Seller Information",
    joinedDateLabel: "Joined",
    contactSellerButton: "Contact Seller",
    loadingListing: "Loading listing details...",
    currencySymbol: "EGP",
    postedOnPrefix: "Posted on",
    imageAltText: (title: string, index: number) => `${title} - Image ${index + 1}`,
    placeholderImageAlt: "Placeholder image",
    unknown: "Unknown",
  },
  ar: {
    backToListings: "العودة إلى الإعلانات",
    listingNotFoundTitle: "الإعلان غير موجود",
    listingNotFoundDescription: "الإعلان الذي تبحث عنه غير موجود، أو تم حذفه، أو غير متاح حالياً.",
    goToHomepage: "الذهاب إلى الصفحة الرئيسية",
    adminViewAlert: "عرض المسؤول:",
    statusPendingAlert: "هذا الإعلان حاليًا <strong>قيد الانتظار</strong>. وهو غير مرئي للعامة.",
    statusRejectedAlert: "هذا الإعلان حاليًا <strong>مرفوض</strong>. لقد تم رفضه وهو غير مرئي للعامة.",
    statusSoldAlert: "تم تحديد هذا العنصر على أنه <strong>مباع</strong>.",
    descriptionTitle: "الوصف",
    sellerInfoTitle: "معلومات البائع",
    joinedDateLabel: "انضم في",
    contactSellerButton: "اتصل بالبائع",
    loadingListing: "جار تحميل تفاصيل الإعلان...",
    currencySymbol: "جنيه",
    postedOnPrefix: "نشر في",
    imageAltText: (title: string, index: number) => `${title} - صورة ${index + 1}`,
    placeholderImageAlt: "صورة مؤقتة",
    unknown: "غير معروف",
  }
};

interface ListingPageProps {
  params: { id: string };
}

export default function ListingPage({ params: paramsProp }: ListingPageProps) {
  const resolvedParams = use(paramsProp);
  const { id: listingId } = resolvedParams;
  const searchParams = useSearchParams();

  const { language } = useLanguage();
  const t = translations[language];
  const [listing, setListing] = useState<Listing | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminViewingState, setIsAdminViewingState] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const adminViewParam = searchParams.get('admin_view') === 'true';
    setIsAdminViewingState(adminViewParam);

    getListingFromFirestore(listingId, adminViewParam)
      .then(data => {
        if (data && !data.category.name) data.category.name = t.unknown;
        setListing(data);
      })
      .catch(error => {
        console.error("Failed to fetch listing:", error);
        setListing(undefined);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [listingId, searchParams, t.unknown]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{t.loadingListing}</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-semibold">{t.listingNotFoundTitle}</h1>
        <p className="text-muted-foreground">{t.listingNotFoundDescription}</p>
        <Button asChild className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/">{t.goToHomepage}</Link>
        </Button>
      </div>
    );
  }

  const seller = listing.seller;
  const categoryPath = listing.subcategory
    ? `${listing.category.name} > ${listing.subcategory.name}`
    : listing.category.name;

  return (
    <div className="max-w-4xl mx-auto py-8">
       <Button variant="outline" asChild className="mb-4">
        <Link href="/">
          <ArrowLeft className={`h-4 w-4 ${language === 'ar' ? 'ms-2' : 'me-2'}`} />
          {t.backToListings}
        </Link>
      </Button>

      {isAdminViewingState && (listing.status === 'pending' || listing.status === 'rejected') && (
        <Alert
          variant={listing.status === 'pending' ? 'default' : 'destructive'}
          className={`mb-4 ${listing.status === 'pending' ? 'bg-yellow-100 border-yellow-400 text-yellow-700 dark:bg-yellow-900 dark:border-yellow-600 dark:text-yellow-300' : ''}`}
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {t.adminViewAlert}
            {listing.status === 'pending' && <span dangerouslySetInnerHTML={{ __html: t.statusPendingAlert }} />}
            {listing.status === 'rejected' && <span dangerouslySetInnerHTML={{ __html: t.statusRejectedAlert }} />}
          </AlertDescription>
        </Alert>
      )}
       {listing.status === 'sold' && (
        <Alert variant="default" className="mb-4 bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-300">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription dangerouslySetInnerHTML={{ __html: t.statusSoldAlert }} />
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
                  alt={t.imageAltText(listing.title, index + 1)}
                  fill
                  style={{objectFit: 'cover'}}
                  data-ai-hint="product detail"
                  className="hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
             {listing.images.length === 0 && (
                <div className="md:col-span-2 relative aspect-[16/7] bg-muted flex items-center justify-center">
                    <Image className="h-24 w-24 text-muted-foreground" data-ai-hint="placeholder image" src="https://placehold.co/600x400.png" alt={t.placeholderImageAlt} fill style={{objectFit:'cover'}} />
                </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-start mb-4">
            <CardTitle className="text-3xl font-bold text-foreground mb-2 md:mb-0">{listing.title}</CardTitle>
            <Badge variant="default" className="text-2xl py-2 px-4 bg-primary text-primary-foreground">
              {listing.price.toLocaleString()} <span className={`text-lg font-normal ${language === 'ar' ? 'me-1' : 'ms-1'}`}>{t.currencySymbol}</span>
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground mb-6">
            <div className="flex items-center">
              <MapPin className={`h-4 w-4 ${language === 'ar' ? 'ms-2' : 'me-2'} shrink-0 text-primary`} />
              <span>{listing.location}</span>
            </div>
            <div className="flex items-center">
              <Tag className={`h-4 w-4 ${language === 'ar' ? 'ms-2' : 'me-2'} shrink-0 text-primary`} />
              <span>{categoryPath}</span>
            </div>
            <div className="flex items-center col-span-1 sm:col-span-2">
              <CalendarDays className={`h-4 w-4 ${language === 'ar' ? 'ms-2' : 'me-2'} shrink-0 text-primary`} />
              <span>{t.postedOnPrefix}: {new Date(listing.postedDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-2 text-foreground">{t.descriptionTitle}</h3>
          <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed mb-8">
            {listing.description}
          </p>

          <Card className="bg-secondary/50 rounded-lg">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">{t.sellerInfoTitle}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={seller.avatarUrl || `https://placehold.co/100x100.png`} alt={seller.name} data-ai-hint="avatar person"/>
                <AvatarFallback>{seller.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg text-foreground">{seller.name}</p>
                <p className="text-sm text-muted-foreground">{t.joinedDateLabel}: {new Date(seller.joinDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
              </div>
              {listing.status !== 'sold' && (
                <Button asChild className={`sm:${language === 'ar' ? 'me-auto' : 'ms-auto'} mt-4 sm:mt-0 w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90`}>
                  <Link href={`/messages?listingId=${listing.id}&recipientId=${seller.id}`}>
                    <MessageSquare className={`h-4 w-4 ${language === 'ar' ? 'ms-2' : 'me-2'}`} /> {t.contactSellerButton}
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
