
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
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_CATEGORIES_VALUE);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(ALL_SUBCATEGORIES_VALUE);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [location, setLocation] = useState(''); 

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
    // Sync FilterBar's UI state with URL (slug + query params)
    if (isLoadingCategories || !allCategories.length) return;

    const pathSegments = pathname.split('/').filter(Boolean); 
    let slugCatId: string | undefined = undefined;
    let slugSubcatId: string | undefined = undefined;

    if (pathSegments[0] === 's') {
      if (pathSegments.length > 1 && pathSegments[1] !== 'all-listings') {
        slugCatId = pathSegments[1];
      }
      if (pathSegments.length > 2) {
        slugSubcatId = pathSegments[2];
      }
    }

    const queryCatId = searchParams.get('categoryId');
    const querySubcatId = searchParams.get('subcategoryId');
    
    const finalCatId = queryCatId || slugCatId || ALL_CATEGORIES_VALUE;
    const finalSubcatId = querySubcatId || slugSubcatId || ALL_SUBCATEGORIES_VALUE;

    setSelectedCategoryId(finalCatId);
    if (finalCatId !== ALL_CATEGORIES_VALUE) {
        const mainCat = allCategories.find(c => c.id === finalCatId);
        setAvailableSubcategories(mainCat?.subcategories || []);
    } else {
        setAvailableSubcategories([]);
    }
    setSelectedSubcategoryId(finalSubcatId);

    setSearchQuery(searchParams.get('query') || '');
    setPriceRange([
      Number(searchParams.get('minPrice') || 0),
      Number(searchParams.get('maxPrice') || 2000)
    ]);

  }, [pathname, searchParams, isLoadingCategories, allCategories]);


  const handleApplyFilters = useCallback(() => {
    let newPath = '/s/all-listings';
    if (selectedCategoryId && selectedCategoryId !== ALL_CATEGORIES_VALUE) {
      newPath = `/s/${selectedCategoryId}`;
      if (selectedSubcategoryId && selectedSubcategoryId !== ALL_SUBCATEGORIES_VALUE) {
        newPath = `${newPath}/${selectedSubcategoryId}`;
      }
    }

    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]));
    if (priceRange[1] < 2000) params.set('maxPrice', String(priceRange[1]));
    // categoryId and subcategoryId are now part of the path, not query params.
    
    router.push(`${newPath}${params.toString() ? `?${params.toString()}` : ''}`);
  }, [selectedCategoryId, selectedSubcategoryId, searchQuery, priceRange, router]);

  const handleMainCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(ALL_SUBCATEGORIES_VALUE); 
    if (categoryId !== ALL_CATEGORIES_VALUE) {
        const mainCat = allCategories.find(c => c.id === categoryId);
        setAvailableSubcategories(mainCat?.subcategories || []);
    } else {
        setAvailableSubcategories([]);
    }
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategoryId(ALL_CATEGORIES_VALUE);
    setSelectedSubcategoryId(ALL_SUBCATEGORIES_VALUE);
    setAvailableSubcategories([]);
    setPriceRange([0, 2000]);
    setLocation('');
    router.push('/s/all-listings');
  };
  
  const getCategoryName = (category: Category): string => {
    if (language === 'ar') {
        const arNames: Record<string, string> = {
             'electronics': 'إلكترونيات', 'vehicles': 'مركبات', 'properties': 'عقارات',
             'mobiles': 'هواتف محمولة', 'tablets': 'أجهزة لوحية', 'cars': 'سيارات',
             'apartments for rent': 'شقق للإيجار','properties for rent': 'عقارات للإيجار', 
             'properties for sale': 'عقارات للبيع',
        };
        const categoryIdLower = category.id.toLowerCase();
        const categoryNameLower = category.name.toLowerCase();
        return arNames[categoryIdLower] || arNames[categoryNameLower] || category.name;
    }
    return category.name;
  };

  return (
    <div className="mb-8 p-4 md:p-6 bg-card rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
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
        
        <div className="lg:col-span-1">
          <Label htmlFor="price-range-filter" className="text-sm font-medium">
            {t.priceRangeLabel}: ${priceRange[0]} - ${priceRange[1]}{priceRange[1] >= 2000 ? '+' : ''}
          </Label>
          <Slider
            id="price-range-filter"
            min={0}
            max={2000} 
            step={50}
            value={priceRange}
            onValueChange={(newRange) => setPriceRange(newRange as [number, number])}
            className="mt-2"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mt-6">
          <Button onClick={handleApplyFilters} className="w-full flex-grow" disabled={isLoadingCategories}>
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

