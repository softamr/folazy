'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { popularCategoryData } from '@/lib/placeholder-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PopularCategories() {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-8 text-foreground">
          Popular Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {popularCategoryData.map((category) => {
            const IconComponent = category.icon as LucideIcon;
            return (
              <div key={category.id} className="group">
                <Card className="h-full flex flex-col hover:shadow-md transition-shadow bg-card">
                  <CardHeader className="items-center pt-4 pb-2">
                    <IconComponent className="h-8 w-8 mb-2 text-primary" />
                    <CardTitle className="text-base font-medium text-center text-foreground group-hover:text-primary">
                      <Link href={category.href} className="focus:outline-none focus:ring-2 focus:ring-ring rounded">
                        <span className="absolute inset-0" aria-hidden="true" />
                        {category.name}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground px-3 pb-3 space-y-1 text-center flex-grow">
                    {category.subLinks.slice(0, 2).map((link) => (
                      <div key={link.name}>
                        <Link
                          href={link.href}
                          className="hover:text-primary hover:underline relative z-10"
                        >
                          {link.name}
                        </Link>
                      </div>
                    ))}
                  </CardContent>
                   {category.subLinks.length > 0 && (
                    <div className="px-3 pb-3 mt-auto text-center">
                        <Link href={category.href} className="text-xs font-medium text-primary hover:underline relative z-10">
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
