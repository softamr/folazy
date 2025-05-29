
'use client';

import Link from 'next/link';
import type { Category } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { collection, getDocs, limit, query as firestoreQuery } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import * as Icons from 'lucide-react'; // Import all icons
import { HelpCircle } from 'lucide-react'; // Fallback icon

export function PopularCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const categoriesRef = collection(db, 'categories');
        // Fetch, for example, the first 6 categories ordered by name, or implement a 'isPopular' flag later
        const q = firestoreQuery(categoriesRef, limit(6)); // Example: limit to 6 popular categories
        const querySnapshot = await getDocs(q);
        const fetchedCategories: Category[] = [];
        querySnapshot.forEach((doc) => {
          fetchedCategories.push({ id: doc.id, ...doc.data() } as Category);
        });
        // Sort by name client-side if not ordering by a specific 'popularity' field in Firestore
        setCategories(fetchedCategories.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error("Error fetching popular categories:", error);
        // Optionally set an error state here
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
          <h2 className="text-2xl font-semibold mb-8 text-foreground">Popular Categories</h2>
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
                 <h2 className="text-2xl font-semibold mb-8 text-foreground">Popular Categories</h2>
                 <p className="text-muted-foreground">No categories available at the moment.</p>
            </div>
        </section>
      );
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-8 text-foreground">
          Popular Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category) => {
            const IconComponent = category.iconName ? (Icons as any)[category.iconName] || HelpCircle : HelpCircle;
            const categoryHref = category.href || `/s/${category.id}`;
            return (
              <div key={category.id} className="group">
                <Card className="h-full flex flex-col hover:shadow-md transition-shadow bg-card">
                  <CardHeader className="items-center pt-4 pb-2">
                    <IconComponent className="h-8 w-8 mb-2 text-primary" />
                    <CardTitle className="text-base font-medium text-center text-foreground group-hover:text-primary">
                      <Link href={categoryHref} className="focus:outline-none focus:ring-2 focus:ring-ring rounded">
                        <span className="absolute inset-0" aria-hidden="true" />
                        {category.name}
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
                          {sub.name}
                        </Link>
                      </div>
                    ))}
                  </CardContent>
                   {(category.subcategories && category.subcategories.length > 0) && (
                    <div className="px-3 pb-3 mt-auto text-center">
                        <Link href={categoryHref} className="text-xs font-medium text-primary hover:underline relative z-10">
                          All in {category.name} &rsaquo;
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
