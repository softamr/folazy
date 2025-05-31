
'use client';

import Link from 'next/link';
import type { Category } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { collection, getDocs, limit, query as firestoreQuery, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import * as Icons from 'lucide-react';
import { HelpCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

const translations = {
  en: {
    popularCategoriesTitle: "Popular Categories",
    noCategoriesAvailable: "No categories available at the moment.",
    allIn: (categoryName: string) => `All in ${categoryName} ›`,
  },
  ar: {
    popularCategoriesTitle: "الفئات الشائعة",
    noCategoriesAvailable: "لا توجد فئات متاحة في الوقت الحالي.",
    allIn: (categoryName: string) => `الكل في ${categoryName} ‹`,
  }
};

const MAX_DISPLAY_CATEGORIES = 6;
const PROPERTIES_CATEGORY_ID = 'properties';

export function PopularCategories() {
  const { language } = useLanguage();
  const t = translations[language];
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getCategoryName = (category: Category): string => {
    if (language === 'ar') {
        const arNames: Record<string, string> = {
            'electronics': 'إلكترونيات',
            'vehicles': 'مركبات',
            'properties': 'عقارات',
            'jobs': 'وظائف',
            'furniture & home decor': 'أثاث وديكور',
            'fashion & beauty': 'أزياء وجمال',
            'pets': 'حيوانات أليفة',
            'kids & babies': 'أطفال ورضع',
            'books, sports & hobbies': 'كتب، رياضة وهوايات',
            'services': 'خدمات',
            'business & industrial': 'أعمال وصناعة',
            'businesses & industrial': 'أعمال وصناعة',
        };
        const categoryIdLower = category.id.toLowerCase();
        const categoryNameLower = category.name.toLowerCase();

        if (arNames[categoryIdLower]) return arNames[categoryIdLower];
        if (arNames[categoryNameLower]) return arNames[categoryNameLower];
        return category.name;
    }
    return category.name;
  };
   const getSubCategoryName = (subcategory: Category): string => {
    if (language === 'ar') {
        const arNames: Record<string, string> = {
            'mobile phones': 'هواتف محمولة',
            'tablets': 'أجهزة لوحية',
            'cars': 'سيارات',
            'motorcycles': 'دراجات نارية',
            'apartments for rent': 'شقق للإيجار',
            'villas for sale': 'فلل للبيع',
            'laptops': 'كمبيوتر محمول',
            'cameras': 'كاميرات',
            'phones & tablets': 'الهواتف والأجهزة اللوحية',
            'properties for rent': 'عقارات للإيجار',
            'properties for sale': 'عقارات للبيع',
            'agriculture equipment': 'معدات زراعية',
            'construction equipment': 'معدات بناء',
            'tv - audio - video': 'تلفزيونات - صوتيات - فيديو',
        };
        const subcategoryIdLower = subcategory.id.toLowerCase();
        const subcategoryNameLower = subcategory.name.toLowerCase();

        if (arNames[subcategoryIdLower]) return arNames[subcategoryIdLower];
        if (arNames[subcategoryNameLower]) return arNames[subcategoryNameLower];
        return subcategory.name;
    }
    return subcategory.name;
  };


  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const categoriesRef = collection(db, 'categories');
        // Fetch more than needed to increase chance of finding 'properties', then sort/slice.
        const q = firestoreQuery(categoriesRef, orderBy('name')); // Order by name for consistent fallback
        const querySnapshot = await getDocs(q);
        const fetchedCategories: Category[] = [];
        querySnapshot.forEach((doc) => {
          fetchedCategories.push({ id: doc.id, ...doc.data() } as Category);
        });

        let sortedForDisplay: Category[] = [];
        const propertiesCategory = fetchedCategories.find(cat => cat.id === PROPERTIES_CATEGORY_ID);

        if (propertiesCategory) {
          sortedForDisplay.push(propertiesCategory);
          const otherCategories = fetchedCategories.filter(cat => cat.id !== PROPERTIES_CATEGORY_ID);
          sortedForDisplay.push(...otherCategories);
        } else {
          sortedForDisplay = fetchedCategories;
        }
        
        setCategories(sortedForDisplay.slice(0, MAX_DISPLAY_CATEGORIES));

      } catch (error) {
        console.error("Error fetching popular categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-8 text-foreground">{t.popularCategoriesTitle}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: MAX_DISPLAY_CATEGORIES }).map((_, index) => (
              <Card key={index} className="h-full flex flex-col">
                <CardHeader className="items-center pt-4 pb-2">
                  <Skeleton className="h-8 w-8 mb-2 rounded-full" />
                  <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent className={cn("text-xs px-3 pb-3 space-y-1 flex-grow", language === 'ar' ? 'text-right' : 'text-left')}>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
                 <div className={cn("px-3 pb-3 mt-auto", language === 'ar' ? 'text-right' : 'text-left')}>
                   <Skeleton className="h-4 w-1/2" />
                 </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0 && !isLoading) {
      return (
        <section className="py-8">
            <div className="container mx-auto px-4">
                 <h2 className="text-2xl font-semibold mb-8 text-foreground">{t.popularCategoriesTitle}</h2>
                 <p className="text-muted-foreground">{t.noCategoriesAvailable}</p>
            </div>
        </section>
      );
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-8 text-foreground">
          {t.popularCategoriesTitle}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category) => {
            const IconComponent = category.iconName ? (Icons as any)[category.iconName] || HelpCircle : HelpCircle;
            const categoryHref = category.href || `/s/${category.id}`;
            const translatedCategoryName = getCategoryName(category);
            return (
              <div key={category.id} className="group">
                <Card className="h-full flex flex-col hover:shadow-md transition-shadow bg-card">
                  <CardHeader className="items-center pt-4 pb-2">
                    <CardTitle className="text-base font-medium text-center text-foreground group-hover:text-primary">
                      <Link href={categoryHref} className="focus:outline-none focus:ring-2 focus:ring-ring rounded relative z-10">
                        {translatedCategoryName}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={cn("text-xs text-muted-foreground px-3 pb-3 space-y-1 flex-grow", language === 'ar' ? 'text-right' : 'text-left')}>
                    {(category.subcategories || []).slice(0, 2).map((sub) => (
                      <div key={sub.id}>
                        <Link
                          href={sub.href || `/s/${category.id}/${sub.id}`}
                          className="hover:text-primary hover:underline relative z-10"
                        >
                          {getSubCategoryName(sub)}
                        </Link>
                      </div>
                    ))}
                  </CardContent>
                   {(category.subcategories && category.subcategories.length > 0) && (
                    <div className={cn("px-3 pb-3 mt-auto", language === 'ar' ? 'text-right' : 'text-left')}>
                        <Link href={categoryHref} className="text-xs font-medium text-primary hover:underline relative z-10">
                          {t.allIn(translatedCategoryName)}
                        </Link>
                    </div>
                   )}
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

