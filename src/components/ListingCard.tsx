
'use client'; // Added for useLanguage hook

import Image from 'next/image';
import Link from 'next/link';
import type { Listing, ListingCategoryInfo } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Tag } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage'; // Added for translation

const translations = {
  en: {
    featured: "Featured",
    viewDetails: "View Details",
    currencySymbol: "EGP",
  },
  ar: {
    featured: "مميز",
    viewDetails: "عرض التفاصيل",
    currencySymbol: "جنيه",
  }
};

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const getTranslatedName = (item: ListingCategoryInfo | undefined): string => {
    if (!item) return '';
    if (language === 'ar') {
      const arNames: Record<string, string> = {
        // Main Categories - IDs first, then English names as fallback
        'electronics': 'إلكترونيات',
        'vehicles': 'مركبات',
        'properties': 'عقارات',
        'jobs': 'وظائف',
        'furniture & home decor': 'أثاث وديكور منزلي',
        'fashion & beauty': 'أزياء وجمال',
        'pets': 'حيوانات أليفة',
        'kids & babies': 'مستلزمات أطفال ورضع',
        'books, sports & hobbies': 'كتب، رياضة وهوايات',
        'services': 'خدمات',
        'business & industrial': 'أعمال وصناعة',

        // Subcategories - IDs first, then English names as fallback
        'mobiles': 'هواتف محمولة',
        'mobile phones': 'هواتف محمولة',
        'tablets': 'أجهزة لوحية',
        'laptops': 'لابتوبات',
        'cameras': 'كاميرات',
        'phones & tablets': 'الهواتف والأجهزة اللوحية',
        'cars': 'سيارات',
        'motorcycles': 'دراجات نارية',
        'auto accessories': 'اكسسوارات سيارات',
        'heavy vehicles': 'مركبات ثقيلة',
        'apartments for rent': 'شقق للإيجار',
        'villas for sale': 'فلل للبيع',
        'commercial for rent': 'تجاري للإيجار',
        'properties for rent': 'عقارات للإيجار',
        'properties for sale': 'عقارات للبيع',
        'accounting': 'محاسبة',
        'sales': 'مبيعات',
        'it': 'تكنولوجيا المعلومات',
        'sofas': 'أرائك',
        'beds': 'أسرة',
        'home accessories': 'اكسسوارات منزلية',
        'clothing': 'ملابس',
        'shoes': 'أحذية',
        'jewelry': 'مجوهرات',
        'dogs': 'كلاب',
        'cats': 'قطط',
        'birds': 'طيور',
        'toys': 'ألعاب',
        'strollers': 'عربات أطفال',
        'baby gear': 'مستلزمات أطفال',
        'books': 'كتب',
        'sports equipment': 'معدات رياضية',
        'musical instruments': 'آلات موسيقية',
        'cleaning': 'تنظيف',
        'tutoring': 'دروس خصوصية',
        'repair': 'تصليح',
        'office equipment': 'معدات مكتبية',
        'heavy machinery': 'معدات ثقيلة',
        'supplies': 'لوازم أعمال',
        'unknown': 'غير معروف', // For fallback
      };
      const itemIdLower = item.id.toLowerCase();
      const itemNameLower = item.name.toLowerCase();
      return arNames[itemIdLower] || arNames[itemNameLower] || item.name;
    }
    return item.name;
  };

  const translatedCategoryName = getTranslatedName(listing.category);
  const translatedSubcategoryName = listing.subcategory ? getTranslatedName(listing.subcategory) : '';

  const categoryPath = translatedSubcategoryName
    ? `${translatedCategoryName} / ${translatedSubcategoryName}`
    : translatedCategoryName;

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 rounded-md">
      <CardHeader className="p-0 relative">
        <Link href={`/listings/${listing.id}`} className="block aspect-[4/3] relative">
          <Image
            src={listing.images[0] || 'https://placehold.co/600x400.png'}
            alt={listing.title}
            layout="fill"
            objectFit="cover"
            className="rounded-t-md"
            data-ai-hint="product photo"
          />
        </Link>
        {listing.isFeatured && (
          <Badge variant="destructive" className={`absolute top-2 ${language === 'ar' ? 'left-2' : 'right-2'} bg-primary text-primary-foreground`}>
            {t.featured}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-3 flex-grow">
        <Link href={`/listings/${listing.id}`} className="block">
          <CardTitle className="text-md font-semibold hover:text-primary transition-colors line-clamp-2 leading-tight">
            {listing.title}
          </CardTitle>
        </Link>
        <p className="text-lg font-bold text-primary mt-1 mb-1.5">
          {listing.price.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')} <span className="text-sm font-normal">{t.currencySymbol}</span>
        </p>
        <div className="text-xs text-muted-foreground space-y-0.5">
          <div className="flex items-center">
            <MapPin className={`h-3 w-3 ${language === 'ar' ? 'ms-1' : 'me-1'} shrink-0`} />
            <span className="truncate">{listing.location}</span>
          </div>
          <div className="flex items-center" title={categoryPath}>
            <Tag className={`h-3 w-3 ${language === 'ar' ? 'ms-1' : 'me-1'} shrink-0`} />
            <span className="truncate">{categoryPath}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 border-t mt-auto">
        <Button asChild className="w-full" variant="outline" size="sm">
          <Link href={`/listings/${listing.id}`}>{t.viewDetails}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
