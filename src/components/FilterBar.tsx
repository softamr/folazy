
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { placeholderCategories_DEPRECATED } from '@/lib/placeholder-data';
import { Filter, Search, X } from 'lucide-react';
import React, { useState } from 'react';
import { useLanguage, type Language } from '@/hooks/useLanguage'; // Import useLanguage

const ALL_CATEGORIES_VALUE = "_all_categories_";

const translations = {
  en: {
    categoryLabel: 'Category',
    allCategoriesPlaceholder: 'All Categories',
    locationLabel: 'Location',
    locationPlaceholder: 'e.g., New York, NY',
    priceRangeLabel: 'Price Range',
    searchButton: 'Search',
    resetButton: 'Reset',
  },
  ar: {
    categoryLabel: 'الفئة',
    allCategoriesPlaceholder: 'جميع الفئات',
    locationLabel: 'الموقع',
    locationPlaceholder: 'مثال: القاهرة, مصر',
    priceRangeLabel: 'نطاق السعر',
    searchButton: 'بحث',
    resetButton: 'إعادة تعيين',
  }
};

export function FilterBar() {
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const { language } = useLanguage(); // Get current language
  const t = translations[language]; // Get translations for the current language

  const handleCategoryChange = (selectedValue: string) => {
    if (selectedValue === ALL_CATEGORIES_VALUE) {
      setCategory(''); 
    } else {
      setCategory(selectedValue); 
    }
  };

  const handleResetFilters = () => {
    setPriceRange([0, 2000]);
    setLocation('');
    setCategory(''); 
  };

  return (
    <div className="mb-8 p-6 bg-card rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
        <div>
          <Label htmlFor="category-filter" className="text-sm font-medium">{t.categoryLabel}</Label>
          <Select value={category || ALL_CATEGORIES_VALUE} onValueChange={handleCategoryChange}>
            <SelectTrigger id="category-filter" className="w-full mt-1">
              <SelectValue placeholder={t.allCategoriesPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CATEGORIES_VALUE}>{t.allCategoriesPlaceholder}</SelectItem>
              {placeholderCategories_DEPRECATED.map((cat) => ( 
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="location-filter" className="text-sm font-medium">{t.locationLabel}</Label>
          <Input
            id="location-filter"
            type="text"
            placeholder={t.locationPlaceholder}
            className="mt-1"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="md:col-span-2 lg:col-span-1">
          <Label htmlFor="price-range-filter" className="text-sm font-medium">
            {t.priceRangeLabel}: ${priceRange[0]} - ${priceRange[1]}{priceRange[1] === 2000 ? '+' : ''}
          </Label>
          <Slider
            id="price-range-filter"
            min={0}
            max={2000}
            step={50}
            value={priceRange}
            onValueChange={(newRange) => setPriceRange(newRange as [number, number])}
            className="mt-2"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 md:col-span-2 lg:col-span-1">
            <Button className="w-full flex-grow">
                <Search className="mr-2 h-4 w-4" /> {t.searchButton}
            </Button>
            <Button variant="outline" onClick={handleResetFilters} className="w-full sm:w-auto">
                <X className="mr-2 h-4 w-4" /> {t.resetButton}
            </Button>
        </div>
      </div>
    </div>
  );
}
