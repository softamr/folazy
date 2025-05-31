
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import type { Category } from '@/lib/types';
import { Filter, Search, X, Loader2 } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query as firestoreQuery, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const ALL_CATEGORIES_VALUE = "_all_";
const ALL_SUBCATEGORIES_VALUE = "_all_";

const translations = {
  en: {
    categoryLabel: 'Category',
    allCategoriesPlaceholder: 'All Categories',
    subcategoryLabel: 'Subcategory',
    allSubcategoriesPlaceholder: 'All Subcategories',
    selectSubcategoryPlaceholder: 'Select Subcategory',
    locationLabel: 'Location (Not Implemented)',
    locationPlaceholder: 'e.g., New York, NY',
    priceRangeLabel: 'Price Range',
    searchButton: 'Apply Filters',
    resetButton: 'Reset Filters',
    loadingCategories: 'Loading categories...',
    errorLoadingCategories: 'Could not load categories.',
    errorTitle: "Error",
    searchQueryLabel: 'Search by Keyword',
    searchQueryPlaceholder: 'e.g., red sofa, iphone 12',
  },
  ar: {
    categoryLabel: 'الفئة',
    allCategoriesPlaceholder: 'جميع الفئات',
    subcategoryLabel: 'الفئة الفرعية',
    allSubcategoriesPlaceholder: 'جميع الفئات الفرعية',
    selectSubcategoryPlaceholder: 'اختر فئة فرعية',
    locationLabel: 'الموقع (غير مطبق)',
    locationPlaceholder: 'مثال: القاهرة, مصر',
    priceRangeLabel: 'نطاق السعر',
    searchButton: 'تطبيق الفلاتر',
    resetButton: 'إعادة تعيين الفلاتر',
    loadingCategories: 'جار تحميل الفئات...',
    errorLoadingCategories: 'لم نتمكن من تحميل الفئات.',
    errorTitle: "خطأ",
    searchQueryLabel: 'البحث بالكلمة الرئيسية',
    searchQueryPlaceholder: 'مثال: كنبة حمراء، ايفون ١٢',
  }
};

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState(searchParams.get('categoryId') || ALL_CATEGORIES_VALUE);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(searchParams.get('subcategoryId') || ALL_SUBCATEGORIES_VALUE);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get('minPrice') || 0),
    Number(searchParams.get('maxPrice') || 2000)
  ]);
  const [location, setLocation] = useState(''); // Location filter still not implemented for search logic

  const [availableSubcategories, setAvailableSubcategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategoriesFromDB = async () => {
      setIsLoadingCategories(true);
      try {
        const categoriesRef = collection(db, 'categories');
        const q = firestoreQuery(categoriesRef, orderBy('name'));
        const querySnapshot = await getDocs(q);
        const fetchedCategories: Category[] = [];
        querySnapshot.forEach((doc) => {
          fetchedCategories.push({ id: doc.id, ...doc.data() } as Category);
        });
        setAllCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories for filter bar:", error);
        toast({ title: t.errorTitle, description: t.errorLoadingCategories, variant: "destructive" });
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategoriesFromDB();
  }, [toast, t]);

  useEffect(() => {
    // Update available subcategories when selectedCategoryId or allCategories changes
    if (selectedCategoryId && selectedCategoryId !== ALL_CATEGORIES_VALUE && allCategories.length > 0) {
      const mainCat = allCategories.find(c => c.id === selectedCategoryId);
      setAvailableSubcategories(mainCat?.subcategories || []);
    } else {
      setAvailableSubcategories([]);
    }
  }, [selectedCategoryId, allCategories]);

  const updateQueryParams = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchQuery) params.set('query', searchQuery); else params.delete('query');
    if (selectedCategoryId && selectedCategoryId !== ALL_CATEGORIES_VALUE) params.set('categoryId', selectedCategoryId); else params.delete('categoryId');
    if (selectedSubcategoryId && selectedSubcategoryId !== ALL_SUBCATEGORIES_VALUE) params.set('subcategoryId', selectedSubcategoryId); else params.delete('subcategoryId');
    if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0])); else params.delete('minPrice');
    if (priceRange[1] < 2000) params.set('maxPrice', String(priceRange[1])); else params.delete('maxPrice');
    
    // Preserve slug from current path if possible, or default to all-listings for filtering
    const currentPath = window.location.pathname;
    // Basic check to see if currentPath is already a category/subcategory path
    const pathSegments = currentPath.split('/').filter(Boolean);
    let basePath = '/s/all-listings'; // Default if not on a specific category page
    if (pathSegments[0] === 's' && pathSegments.length > 1) {
       basePath = `/s/${pathSegments.slice(1).join('/')}`;
    }

    router.push(`${basePath}?${params.toString()}`);
  }, [searchQuery, selectedCategoryId, selectedSubcategoryId, priceRange, router, searchParams]);

  const handleMainCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(ALL_SUBCATEGORIES_VALUE); // Reset subcategory when main category changes
    // Query params will be updated by apply/search button
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
    // Query params will be updated by apply/search button
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategoryId(ALL_CATEGORIES_VALUE);
    setSelectedSubcategoryId(ALL_SUBCATEGORIES_VALUE);
    setAvailableSubcategories([]);
    setPriceRange([0, 2000]);
    setLocation('');
    
    const params = new URLSearchParams(); // Cleared params
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(Boolean);
    let basePath = '/s/all-listings'; 
    if (pathSegments[0] === 's' && pathSegments.length > 1 && pathSegments[1] !== 'all-listings') {
       basePath = `/s/${pathSegments.slice(1).join('/')}`; // Reset to current category page if on one
    }
    router.push(basePath + (params.toString() ? `?${params.toString()}` : ''));
  };
  
  const getCategoryName = (category: Category): string => {
    // Basic translation, extend as needed
    if (language === 'ar') {
        const arNames: Record<string, string> = {
             'electronics': 'إلكترونيات', 'vehicles': 'مركبات', 'properties': 'عقارات', /* ... more */
        };
        return arNames[category.id.toLowerCase()] || arNames[category.name.toLowerCase()] || category.name;
    }
    return category.name;
  };

  return (
    <div className="mb-8 p-4 md:p-6 bg-card rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        {/* Search Query */}
        <div className="md:col-span-2 lg:col-span-3">
          <Label htmlFor="search-query-filter" className="text-sm font-medium">{t.searchQueryLabel}</Label>
          <Input
            id="search-query-filter"
            type="text"
            placeholder={t.searchQueryPlaceholder}
            className="mt-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category-filter" className="text-sm font-medium">{t.categoryLabel}</Label>
          <Select 
            value={selectedCategoryId} 
            onValueChange={handleMainCategoryChange}
            disabled={isLoadingCategories}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            <SelectTrigger id="category-filter" className="w-full mt-1">
              <SelectValue placeholder={isLoadingCategories ? t.loadingCategories : t.allCategoriesPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CATEGORIES_VALUE}>{t.allCategoriesPlaceholder}</SelectItem>
              {!isLoadingCategories && allCategories.map((cat) => ( 
                <SelectItem key={cat.id} value={cat.id}>
                  {getCategoryName(cat)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subcategory */}
        <div>
          <Label htmlFor="subcategory-filter" className="text-sm font-medium">{t.subcategoryLabel}</Label>
          <Select 
            value={selectedSubcategoryId} 
            onValueChange={handleSubcategoryChange} 
            disabled={isLoadingCategories || selectedCategoryId === ALL_CATEGORIES_VALUE || availableSubcategories.length === 0}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            <SelectTrigger id="subcategory-filter" className="w-full mt-1">
              <SelectValue placeholder={
                selectedCategoryId === ALL_CATEGORIES_VALUE || availableSubcategories.length === 0 
                ? t.allSubcategoriesPlaceholder 
                : t.selectSubcategoryPlaceholder
              } />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_SUBCATEGORIES_VALUE}>{t.allSubcategoriesPlaceholder}</SelectItem>
              {availableSubcategories.map((subcat) => (
                <SelectItem key={subcat.id} value={subcat.id}>
                  {getCategoryName(subcat)} 
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Price Range */}
        <div className="lg:col-span-1">
          <Label htmlFor="price-range-filter" className="text-sm font-medium">
            {t.priceRangeLabel}: ${priceRange[0]} - ${priceRange[1]}{priceRange[1] >= 2000 ? '+' : ''}
          </Label>
          <Slider
            id="price-range-filter"
            min={0}
            max={2000} // Max can be adjusted
            step={50}
            value={priceRange}
            onValueChange={(newRange) => setPriceRange(newRange as [number, number])}
            className="mt-2"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          />
        </div>
        
        {/* Location (Still not implemented in search logic) */}
        {/*
        <div>
          <Label htmlFor="location-filter" className="text-sm font-medium">{t.locationLabel}</Label>
          <Input
            id="location-filter"
            type="text"
            placeholder={t.locationPlaceholder}
            className="mt-1"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled // Disabled until implemented
          />
        </div>
        */}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mt-6">
          <Button onClick={updateQueryParams} className="w-full flex-grow" disabled={isLoadingCategories}>
              {isLoadingCategories ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Search className="me-2 h-4 w-4" />} 
              {t.searchButton}
          </Button>
          <Button variant="outline" onClick={handleResetFilters} className="w-full sm:w-auto">
              <X className="me-2 h-4 w-4" /> {t.resetButton}
          </Button>
      </div>
    </div>
  );
}
