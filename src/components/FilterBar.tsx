'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import type { Category, LocationCountry, LocationGovernorate, LocationDistrict } from '@/lib/types';
import { Filter, Search, X, Loader2, Globe2, Building, Map } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext'; // Updated import path
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query as firestoreQuery, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const ALL_CATEGORIES_VALUE = "_all_";
const ALL_SUBCATEGORIES_VALUE = "_all_";
const ALL_LOCATIONS_VALUE = "_all_"; // For country, governorate, district

const translations = {
  en: {
    categoryLabel: 'Category',
    allCategoriesPlaceholder: 'All Categories',
    subcategoryLabel: 'Subcategory',
    allSubcategoriesPlaceholder: 'All Subcategories',
    selectSubcategoryPlaceholder: 'Select Subcategory',
    
    countryLabel: 'Country',
    allCountriesPlaceholder: 'All Countries',
    governorateLabel: 'Governorate / City',
    allGovernoratesPlaceholder: 'All Governorates',
    selectGovernoratePlaceholder: 'Select Governorate',
    districtLabel: 'District / Area',
    allDistrictsPlaceholder: 'All Districts',
    selectDistrictPlaceholder: 'Select District',

    priceRangeLabel: 'Price Range',
    searchButton: 'Apply Filters',
    resetButton: 'Reset Filters',
    loadingCategories: 'Loading categories...',
    errorLoadingCategories: 'Could not load categories.',
    loadingLocations: 'Loading locations...',
    errorLoadingLocations: 'Could not load locations.',
    errorTitle: "Error",
    searchQueryLabel: 'Search by Keyword',
    searchQueryPlaceholder: 'e.g., red sofa, iphone 12',
    currencySymbol: "EGP",
  },
  ar: {
    categoryLabel: 'الفئة',
    allCategoriesPlaceholder: 'جميع الفئات',
    subcategoryLabel: 'الفئة الفرعية',
    allSubcategoriesPlaceholder: 'جميع الفئات الفرعية',
    selectSubcategoryPlaceholder: 'اختر فئة فرعية',

    countryLabel: 'الدولة',
    allCountriesPlaceholder: 'جميع الدول',
    governorateLabel: 'المحافظة / المدينة',
    allGovernoratesPlaceholder: 'جميع المحافظات',
    selectGovernoratePlaceholder: 'اختر محافظة',
    districtLabel: 'المنطقة / الحي',
    allDistrictsPlaceholder: 'جميع المناطق',
    selectDistrictPlaceholder: 'اختر منطقة',
    
    priceRangeLabel: 'نطاق السعر',
    searchButton: 'تطبيق الفلاتر',
    resetButton: 'إعادة تعيين الفلاتر',
    loadingCategories: 'جار تحميل الفئات...',
    errorLoadingCategories: 'لم نتمكن من تحميل الفئات.',
    loadingLocations: 'جار تحميل المواقع...',
    errorLoadingLocations: 'لم نتمكن من تحميل المواقع.',
    errorTitle: "خطأ",
    searchQueryLabel: 'البحث بالكلمة الرئيسية',
    searchQueryPlaceholder: 'مثال: كنبة حمراء، ايفون ١٢',
    currencySymbol: "جنيه",
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
  
  const [allCountries, setAllCountries] = useState<LocationCountry[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_CATEGORIES_VALUE);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(ALL_SUBCATEGORIES_VALUE);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  
  const [selectedCountryId, setSelectedCountryId] = useState(ALL_LOCATIONS_VALUE);
  const [selectedGovernorateId, setSelectedGovernorateId] = useState(ALL_LOCATIONS_VALUE);
  const [selectedDistrictId, setSelectedDistrictId] = useState(ALL_LOCATIONS_VALUE);

  const [availableSubcategories, setAvailableSubcategories] = useState<Category[]>([]);
  const [availableGovernorates, setAvailableGovernorates] = useState<LocationGovernorate[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<LocationDistrict[]>([]);


  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingCategories(true);
      setIsLoadingLocations(true);
      try {
        const catPromise = getDocs(firestoreQuery(collection(db, 'categories'), orderBy('name')));
        const locPromise = getDocs(firestoreQuery(collection(db, 'locations'), orderBy('name')));
        
        const [catSnapshot, locSnapshot] = await Promise.all([catPromise, locPromise]);

        const fetchedCategories: Category[] = [];
        catSnapshot.forEach((doc) => fetchedCategories.push({ id: doc.id, ...doc.data() } as Category));
        setAllCategories(fetchedCategories);

        const fetchedCountries: LocationCountry[] = [];
        locSnapshot.forEach((doc) => fetchedCountries.push({ id: doc.id, ...doc.data() } as LocationCountry));
        setAllCountries(fetchedCountries);

      } catch (error) {
        console.error("Error fetching filter bar data:", error);
        toast({ title: t.errorTitle, description: `${t.errorLoadingCategories} ${t.errorLoadingLocations}`, variant: "destructive" });
      } finally {
        setIsLoadingCategories(false);
        setIsLoadingLocations(false);
      }
    };
    fetchInitialData();
  }, [toast, t]);

  useEffect(() => {
    // Sync FilterBar's UI state with URL (slug + query params)
    if (isLoadingCategories || isLoadingLocations) return;

    const pathSegments = pathname.split('/').filter(Boolean); 
    let slugCatId: string | undefined = undefined;
    let slugSubcatId: string | undefined = undefined;

    if (pathSegments[0] === 's') {
      if (pathSegments.length > 1 && pathSegments[1] !== 'all-listings') slugCatId = pathSegments[1];
      if (pathSegments.length > 2) slugSubcatId = pathSegments[2];
    }

    const queryCatId = searchParams.get('categoryId');
    const querySubcatId = searchParams.get('subcategoryId');
    const finalCatId = queryCatId || slugCatId || ALL_CATEGORIES_VALUE;
    setSelectedCategoryId(finalCatId);
    if (finalCatId !== ALL_CATEGORIES_VALUE && allCategories.length > 0) {
        const mainCat = allCategories.find(c => c.id === finalCatId);
        setAvailableSubcategories(mainCat?.subcategories || []);
    } else {
        setAvailableSubcategories([]);
    }
    setSelectedSubcategoryId(querySubcatId || slugSubcatId || ALL_SUBCATEGORIES_VALUE);

    // Location Sync
    const queryCountryId = searchParams.get('locationCountryId') || ALL_LOCATIONS_VALUE;
    setSelectedCountryId(queryCountryId);
    if (queryCountryId !== ALL_LOCATIONS_VALUE && allCountries.length > 0) {
        const country = allCountries.find(c => c.id === queryCountryId);
        setAvailableGovernorates(country?.governorates || []);
        
        const queryGovId = searchParams.get('locationGovernorateId') || ALL_LOCATIONS_VALUE;
        setSelectedGovernorateId(queryGovId);
        if (queryGovId !== ALL_LOCATIONS_VALUE && country?.governorates) {
            const gov = country.governorates.find(g => g.id === queryGovId);
            setAvailableDistricts(gov?.districts || []);
             setSelectedDistrictId(searchParams.get('locationDistrictId') || ALL_LOCATIONS_VALUE);
        } else {
            setAvailableDistricts([]);
            setSelectedDistrictId(ALL_LOCATIONS_VALUE);
        }
    } else {
        setAvailableGovernorates([]);
        setSelectedGovernorateId(ALL_LOCATIONS_VALUE);
        setAvailableDistricts([]);
        setSelectedDistrictId(ALL_LOCATIONS_VALUE);
    }

    setSearchQuery(searchParams.get('query') || '');
    setPriceRange([
      Number(searchParams.get('minPrice') || 0),
      Number(searchParams.get('maxPrice') || 2000)
    ]);

  }, [pathname, searchParams, isLoadingCategories, isLoadingLocations, allCategories, allCountries]);


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
    
    if (selectedCountryId !== ALL_LOCATIONS_VALUE) params.set('locationCountryId', selectedCountryId);
    if (selectedGovernorateId !== ALL_LOCATIONS_VALUE) params.set('locationGovernorateId', selectedGovernorateId);
    if (selectedDistrictId !== ALL_LOCATIONS_VALUE) params.set('locationDistrictId', selectedDistrictId);
    
    router.push(`${newPath}${params.toString() ? `?${params.toString()}` : ''}`);
  }, [selectedCategoryId, selectedSubcategoryId, searchQuery, priceRange, selectedCountryId, selectedGovernorateId, selectedDistrictId, router]);

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

  const handleCountryChange = (countryId: string) => {
    setSelectedCountryId(countryId);
    setSelectedGovernorateId(ALL_LOCATIONS_VALUE);
    setSelectedDistrictId(ALL_LOCATIONS_VALUE);
    if (countryId !== ALL_LOCATIONS_VALUE) {
        const country = allCountries.find(c => c.id === countryId);
        setAvailableGovernorates(country?.governorates || []);
        setAvailableDistricts([]);
    } else {
        setAvailableGovernorates([]);
        setAvailableDistricts([]);
    }
  };

  const handleGovernorateChange = (governorateId: string) => {
    setSelectedGovernorateId(governorateId);
    setSelectedDistrictId(ALL_LOCATIONS_VALUE);
    if (governorateId !== ALL_LOCATIONS_VALUE && selectedCountryId !== ALL_LOCATIONS_VALUE) {
        const country = allCountries.find(c => c.id === selectedCountryId);
        const governorate = country?.governorates?.find(g => g.id === governorateId);
        setAvailableDistricts(governorate?.districts || []);
    } else {
        setAvailableDistricts([]);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategoryId(ALL_CATEGORIES_VALUE);
    setSelectedSubcategoryId(ALL_SUBCATEGORIES_VALUE);
    setAvailableSubcategories([]);
    setPriceRange([0, 2000]);
    
    setSelectedCountryId(ALL_LOCATIONS_VALUE);
    setSelectedGovernorateId(ALL_LOCATIONS_VALUE);
    setSelectedDistrictId(ALL_LOCATIONS_VALUE);
    setAvailableGovernorates([]);
    setAvailableDistricts([]);

    router.push('/s/all-listings');
  };
  
  const getCategoryName = (category: Category): string => {
    if (language === 'ar') {
        const arNames: Record<string, string> = {
             'electronics': 'إلكترونيات', 'vehicles': 'مركبات', 'properties': 'عقارات',
             'mobiles': 'هواتف محمولة', 'tablets': 'أجهزة لوحية', 'cars': 'سيارات',
             'apartments for rent': 'شقق للإيجار','properties for rent': 'عقارات للإيجار', 
             'properties for sale': 'عقارات للبيع',
             'business & industrial': 'أعمال وصناعة',
             'businesses & industrial': 'أعمال وصناعة',
             'agriculture equipment': 'معدات زراعية',
        };
        const categoryIdLower = category.id.toLowerCase();
        const categoryNameLower = category.name.toLowerCase();
        return arNames[categoryIdLower] || arNames[categoryNameLower] || category.name;
    }
    return category.name;
  };

  const getLocationName = (locationItem: LocationCountry | LocationGovernorate | LocationDistrict): string => {
    // Placeholder: ideally, location names would also be translated if needed
    return locationItem.name;
  }

  const isLoading = isLoadingCategories || isLoadingLocations;

  return (
    <div className="mb-8 p-4 md:p-6 bg-card rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-full">
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
            onValueChange={(value) => setSelectedSubcategoryId(value)} 
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
        
        <div>
          <Label htmlFor="country-filter" className="text-sm font-medium">{t.countryLabel}</Label>
          <Select
            value={selectedCountryId}
            onValueChange={handleCountryChange}
            disabled={isLoadingLocations}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            <SelectTrigger id="country-filter" className="w-full mt-1">
              <SelectValue placeholder={isLoadingLocations ? t.loadingLocations : t.allCountriesPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_LOCATIONS_VALUE}>{t.allCountriesPlaceholder}</SelectItem>
              {!isLoadingLocations && allCountries.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {getLocationName(country)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="governorate-filter" className="text-sm font-medium">{t.governorateLabel}</Label>
          <Select
            value={selectedGovernorateId}
            onValueChange={handleGovernorateChange}
            disabled={isLoadingLocations || selectedCountryId === ALL_LOCATIONS_VALUE || availableGovernorates.length === 0}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            <SelectTrigger id="governorate-filter" className="w-full mt-1">
              <SelectValue placeholder={
                 selectedCountryId === ALL_LOCATIONS_VALUE || availableGovernorates.length === 0
                 ? t.allGovernoratesPlaceholder
                 : t.selectGovernoratePlaceholder
              } />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_LOCATIONS_VALUE}>{t.allGovernoratesPlaceholder}</SelectItem>
              {availableGovernorates.map((gov) => (
                <SelectItem key={gov.id} value={gov.id}>
                  {getLocationName(gov)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="district-filter" className="text-sm font-medium">{t.districtLabel}</Label>
          <Select
            value={selectedDistrictId}
            onValueChange={(value) => setSelectedDistrictId(value)}
            disabled={isLoadingLocations || selectedGovernorateId === ALL_LOCATIONS_VALUE || availableDistricts.length === 0}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            <SelectTrigger id="district-filter" className="w-full mt-1">
              <SelectValue placeholder={
                selectedGovernorateId === ALL_LOCATIONS_VALUE || availableDistricts.length === 0
                ? t.allDistrictsPlaceholder
                : t.selectDistrictPlaceholder
              } />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_LOCATIONS_VALUE}>{t.allDistrictsPlaceholder}</SelectItem>
              {availableDistricts.map((dist) => (
                <SelectItem key={dist.id} value={dist.id}>
                  {getLocationName(dist)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="lg:col-span-1">
          <Label htmlFor="price-range-filter" className="text-sm font-medium">
            {t.priceRangeLabel}: {priceRange[0]} - {priceRange[1]}{priceRange[1] >= 2000 ? '+' : ''} {t.currencySymbol}
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
          <Button onClick={handleApplyFilters} className="w-full flex-grow" disabled={isLoading}>
              {isLoading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Search className="me-2 h-4 w-4" />} 
              {t.searchButton}
          </Button>
          <Button variant="outline" onClick={handleResetFilters} className="w-full sm:w-auto">
              <X className="me-2 h-4 w-4" /> {t.resetButton}
          </Button>
      </div>
    </div>
  );
}
