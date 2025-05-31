
'use client';

import Link from 'next/link';
import type { Category } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { collection, getDocs, limit, query as firestoreQuery } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import * as Icons from 'lucide-react';
import { HelpCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

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

export function PopularCategories() {
  const { language } = useLanguage();
  const t = translations[language];
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // This function attempts to get a translated category name.
  // For a full solution, category names should ideally be stored in the DB with translations.
  // This is a simplified version similar to what's in Header.tsx
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
            // Ensure main category IDs/names that might appear here are translated
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
            'phones & tablets': 'الهواتف والأجهزة اللوحية', // Added translation
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
        const q = firestoreQuery(categoriesRef, limit(6));
        const querySnapshot = await getDocs(q);
        const fetchedCategories: Category[] = [];
        querySnapshot.forEach((doc) => {
          fetchedCategories.push({ id: doc.id, ...doc.data() } as Category);
        });
        setCategories(fetchedCategories.sort((a, b) => a.name.localeCompare(b.name)));
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
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="h-full flex flex-col">
                <CardHeader className="items-center pt-4 pb-2">
                  <Skeleton className="h-8 w-8 mb-2 rounded-full" />
                  <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent className="text-xs px-3 pb-3 space-y-1 text-center flex-grow">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
                 <div className="px-3 pb-3 mt-auto text-center">
                   <Skeleton className="h-4 w-1/2 mx-auto" />
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
                    <IconComponent className="h-8 w-8 mb-2 text-primary" />
                    <CardTitle className="text-base font-medium text-center text-foreground group-hover:text-primary">
                      <Link href={categoryHref} className="focus:outline-none focus:ring-2 focus:ring-ring rounded">
                        <span className="absolute inset-0" aria-hidden="true" />
                        {translatedCategoryName}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground px-3 pb-3 space-y-1 text-center flex-grow">
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
                    <div className="px-3 pb-3 mt-auto text-center">
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

