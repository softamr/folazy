
// src/app/admin/locations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import type { LocationCountry, LocationGovernorate, LocationDistrict } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, doc, updateDoc, arrayUnion, deleteDoc, arrayRemove, writeBatch, getDocs, query as firestoreQuery, where, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, ChevronDown, ChevronRight, Loader2, MapPinned, PackageOpen, X, Building, Map } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/useLanguage';

const generateSlug = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

const translations = {
  en: {
    pageTitle: "Location Management",
    pageDescription: "Manage countries, governorates, and districts.",
    addCountryTitle: "Add New Country",
    countryNameLabel: "Country Name",
    countryNamePlaceholder: "e.g., Egypt",
    addCountryButton: "Add Country",
    existingCountriesTitle: "Existing Locations",
    foundCountriesDesc: (count: number) => `Found ${count} countries.`,
    noCountriesYet: "No countries created yet.",
    addGovernorateButton: "Add Governorate",
    addDistrictButton: "Add District",
    deleteButtonSr: "Delete",
    addGovernorateToTitle: (name: string) => `Add Governorate to "${name}"`,
    governorateNameLabel: "Governorate Name",
    governorateNamePlaceholder: "e.g., Cairo",
    addDistrictToTitle: (country: string, governorate: string) => `Add District to "${governorate}" in "${country}"`,
    districtNameLabel: "District Name",
    districtNamePlaceholder: "e.g., Zamalek",
    addButton: "Add",
    governoratesSectionTitle: "Governorates:",
    districtsSectionTitle: "Districts:",
    noGovernoratesYet: "No governorates yet.",
    noDistrictsYet: "No districts yet.",
    loadingLocations: "Loading locations...",
    validationErrorTitle: "Validation Error",
    nameEmptyError: (type: string) => `${type} name cannot be empty.`,
    countryNameInvalidSlugError: "Country name results in an empty or invalid slug. Please use a different name.",
    successTitle: "Success",
    errorTitle: "Error",
    itemAddedSuccess: (name: string, type: string) => `${type} "${name}" added.`,
    couldNotAddItemError: (type: string) => `Could not add ${type}.`,
    deleteConfirm: (name: string, type: string) => `Are you sure you want to delete ${type} "${name}"? This action cannot be undone.`,
    deleteCountryConfirm: (name: string) => `Are you sure you want to delete country "${name}" and all its governorates and districts? This action cannot be undone.`,
    itemDeletedSuccess: (name: string, type: string) => `${type} "${name}" deleted.`,
    couldNotDeleteItemError: (type: string) => `Could not delete ${type}.`,
    deletionBlockedTitle: "Deletion Blocked",
    deletionBlockedDesc: (type: string, name: string) => `Cannot delete ${type} "${name}" as it's associated with existing listings.`,
  },
  ar: {
    pageTitle: "إدارة المواقع",
    pageDescription: "إدارة الدول والمحافظات والمناطق.",
    addCountryTitle: "إضافة دولة جديدة",
    countryNameLabel: "اسم الدولة",
    countryNamePlaceholder: "مثال: مصر",
    addCountryButton: "إضافة دولة",
    existingCountriesTitle: "المواقع الحالية",
    foundCountriesDesc: (count: number) => `تم العثور على ${count} دول.`,
    noCountriesYet: "لم يتم إنشاء دول بعد.",
    addGovernorateButton: "إضافة محافظة",
    addDistrictButton: "إضافة منطقة",
    deleteButtonSr: "حذف",
    addGovernorateToTitle: (name: string) => `إضافة محافظة إلى "${name}"`,
    governorateNameLabel: "اسم المحافظة",
    governorateNamePlaceholder: "مثال: القاهرة",
    addDistrictToTitle: (country: string, governorate: string) => `إضافة منطقة إلى "${governorate}" في "${country}"`,
    districtNameLabel: "اسم المنطقة",
    districtNamePlaceholder: "مثال: الزمالك",
    addButton: "إضافة",
    governoratesSectionTitle: "المحافظات:",
    districtsSectionTitle: "المناطق:",
    noGovernoratesYet: "لا توجد محافظات بعد.",
    noDistrictsYet: "لا توجد مناطق بعد.",
    loadingLocations: "جار تحميل المواقع...",
    validationErrorTitle: "خطأ في التحقق",
    nameEmptyError: (type: string) => `لا يمكن أن يكون اسم ${type} فارغًا.`,
    countryNameInvalidSlugError: "اسم الدولة ينتج عنه معرف فارغ أو غير صالح. يرجى استخدام اسم مختلف.",
    successTitle: "نجاح",
    errorTitle: "خطأ",
    itemAddedSuccess: (name: string, type: string) => `تمت إضافة ${type} "${name}".`,
    couldNotAddItemError: (type: string) => `لم نتمكن من إضافة ${type}.`,
    deleteConfirm: (name: string, type: string) => `هل أنت متأكد أنك تريد حذف ${type} "${name}"؟ لا يمكن التراجع عن هذا الإجراء.`,
    deleteCountryConfirm: (name: string) => `هل أنت متأكد أنك تريد حذف الدولة "${name}" وجميع محافظاتها ومناطقها؟ لا يمكن التراجع عن هذا الإجراء.`,
    itemDeletedSuccess: (name: string, type: string) => `${type} "${name}" deleted.`,
    couldNotDeleteItemError: (type: string) => `لم نتمكن من حذف ${type}.`,
    deletionBlockedTitle: "تم حظر الحذف",
    deletionBlockedDesc: (type: string, name: string) => `لا يمكن حذف ${type} "${name}" لأنه مرتبط بإعلانات موجودة.`,
  }
};

export default function LocationManagementPage() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];

  const [countries, setCountries] = useState<LocationCountry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newCountryName, setNewCountryName] = useState('');
  
  const [showGovernorateFormFor, setShowGovernorateFormFor] = useState<string | null>(null); // countryId (which will be the slug)
  const [newGovernorateName, setNewGovernorateName] = useState('');
  
  const [showDistrictFormFor, setShowDistrictFormFor] = useState<{ countryId: string; governorateId: string } | null>(null);
  const [newDistrictName, setNewDistrictName] = useState('');

  const [expandedCountries, setExpandedCountries] = useState<Record<string, boolean>>({});
  const [expandedGovernorates, setExpandedGovernorates] = useState<Record<string, boolean>>({}); // governorateId

  useEffect(() => {
    setIsLoading(true);
    const q = firestoreQuery(collection(db, 'locations'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedCountries: LocationCountry[] = [];
      querySnapshot.forEach((docSnapshot) => {
        // docSnapshot.id is the slug (e.g., "egypt")
        fetchedCountries.push({ id: docSnapshot.id, ...docSnapshot.data() } as LocationCountry);
      });
      setCountries(fetchedCountries.sort((a, b) => a.name.localeCompare(b.name)));
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching locations: ", error);
      toast({ title: t.errorTitle, description: t.couldNotAddItemError(language === 'ar' ? 'الدولة' : 'country'), variant: "destructive" });
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [toast, t, language]);

  const handleAddCountry = async () => {
    if (!newCountryName.trim()) {
      toast({ title: t.validationErrorTitle, description: t.nameEmptyError(language === 'ar' ? 'الدولة' : 'Country'), variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const countrySlug = generateSlug(newCountryName.trim());

    if (!countrySlug) {
        toast({ title: t.validationErrorTitle, description: t.countryNameInvalidSlugError, variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    const countryDocumentData: Omit<LocationCountry, 'id'> = {
        name: newCountryName.trim(),
        governorates: [] // Initialize with empty governorates array
    };

    try {
      // Use setDoc with the slug as the document ID
      await setDoc(doc(db, 'locations', countrySlug), countryDocumentData);
      toast({ title: t.successTitle, description: t.itemAddedSuccess(newCountryName, language === 'ar' ? 'الدولة' : 'Country') });
      setNewCountryName('');
    } catch (error) {
      console.error("Error adding country: ", error);
      toast({ title: t.errorTitle, description: t.couldNotAddItemError(language === 'ar' ? 'الدولة' : 'Country'), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddGovernorate = async (countryId: string) => { // countryId is now the slug
    if (!newGovernorateName.trim()) {
      toast({ title: t.validationErrorTitle, description: t.nameEmptyError(language === 'ar' ? 'المحافظة' : 'Governorate'), variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const countryDocRef = doc(db, 'locations', countryId); // countryId is slug
    const governorateId = generateSlug(newGovernorateName.trim());
    
    const governorateData: LocationGovernorate = {
        id: governorateId,
        name: newGovernorateName.trim(),
        districts: []
    };

    try {
      await updateDoc(countryDocRef, {
        governorates: arrayUnion(governorateData)
      });
      toast({ title: t.successTitle, description: t.itemAddedSuccess(newGovernorateName, language === 'ar' ? 'المحافظة' : 'Governorate') });
      setNewGovernorateName('');
      setShowGovernorateFormFor(null);
    } catch (error) {
      console.error("Error adding governorate: ", error);
      toast({ title: t.errorTitle, description: t.couldNotAddItemError(language === 'ar' ? 'المحافظة' : 'Governorate'), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAddDistrict = async (countryId: string, governorateId: string) => { // countryId is slug
    if (!newDistrictName.trim()) {
      toast({ title: t.validationErrorTitle, description: t.nameEmptyError(language === 'ar' ? 'المنطقة' : 'District'), variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const countryDocRef = doc(db, 'locations', countryId); // countryId is slug
    const districtId = generateSlug(newDistrictName.trim());
    
    const districtData: LocationDistrict = {
        id: districtId,
        name: newDistrictName.trim(),
    };

    const country = countries.find(c => c.id === countryId); // c.id is now slug
    if (!country) {
        toast({ title: t.errorTitle, description: "Country not found", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }
    const governorateIndex = country.governorates?.findIndex(g => g.id === governorateId);
    if (governorateIndex === undefined || governorateIndex === -1) {
        toast({ title: t.errorTitle, description: "Governorate not found", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    const updatedGovernorates = [...(country.governorates || [])];
    const targetGovernorate = updatedGovernorates[governorateIndex];
    const updatedDistricts = [...(targetGovernorate.districts || []), districtData];
    updatedGovernorates[governorateIndex] = { ...targetGovernorate, districts: updatedDistricts };

    try {
      await updateDoc(countryDocRef, {
        governorates: updatedGovernorates
      });
      toast({ title: t.successTitle, description: t.itemAddedSuccess(newDistrictName, language === 'ar' ? 'المنطقة' : 'District') });
      setNewDistrictName('');
      setShowDistrictFormFor(null);
    } catch (error) {
      console.error("Error adding district: ", error);
      toast({ title: t.errorTitle, description: t.couldNotAddItemError(language === 'ar' ? 'المنطقة' : 'District'), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkListingsAssociation = async (ids: string[], fieldPrefix: 'locationCountry' | 'locationGovernorate' | 'locationDistrict'): Promise<boolean> => {
    if (ids.length === 0) return false;
    const listingsQuery = firestoreQuery(collection(db, "listings"), where(`${fieldPrefix}.id`, "in", ids));
    const listingsSnapshot = await getDocs(listingsQuery);
    return !listingsSnapshot.empty;
  };

  const handleDeleteCountry = async (countryId: string, countryName: string) => { // countryId is slug
    if (window.confirm(t.deleteCountryConfirm(countryName))) {
      setIsSubmitting(true);
      try {
        const country = countries.find(c => c.id === countryId); // c.id is slug
        const governorateIds = country?.governorates?.map(g => g.id) || [];
        const districtIds = country?.governorates?.flatMap(g => g.districts?.map(d => d.id) || []) || [];
        
        const countryAssociated = await checkListingsAssociation([countryId], 'locationCountry');
        const governoratesAssociated = await checkListingsAssociation(governorateIds, 'locationGovernorate');
        const districtsAssociated = await checkListingsAssociation(districtIds, 'locationDistrict');

        if (countryAssociated || governoratesAssociated || districtsAssociated) {
            toast({ title: t.deletionBlockedTitle, description: t.deletionBlockedDesc(language === 'ar' ? 'الدولة' : 'country', countryName), variant: "destructive", duration: 7000 });
            setIsSubmitting(false);
            return;
        }
        
        await deleteDoc(doc(db, 'locations', countryId)); // countryId is slug
        toast({ title: t.successTitle, description: t.itemDeletedSuccess(countryName, language === 'ar' ? 'الدولة' : 'Country') });
      } catch (error) {
        console.error("Error deleting country: ", error);
        toast({ title: t.errorTitle, description: t.couldNotDeleteItemError(language === 'ar' ? 'الدولة' : 'Country'), variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleDeleteGovernorate = async (countryId: string, governorate: LocationGovernorate) => { // countryId is slug
     if (window.confirm(t.deleteConfirm(governorate.name, language === 'ar' ? 'المحافظة' : 'governorate'))) {
      setIsSubmitting(true);
      const countryDocRef = doc(db, 'locations', countryId); // countryId is slug
      try {
        const districtIds = governorate.districts?.map(d => d.id) || [];
        const governorateAssociated = await checkListingsAssociation([governorate.id], 'locationGovernorate');
        const districtsAssociated = await checkListingsAssociation(districtIds, 'locationDistrict');

        if (governorateAssociated || districtsAssociated) {
            toast({ title: t.deletionBlockedTitle, description: t.deletionBlockedDesc(language === 'ar' ? 'المحافظة' : 'governorate', governorate.name), variant: "destructive", duration: 7000 });
            setIsSubmitting(false);
            return;
        }

        const country = countries.find(c => c.id === countryId); // c.id is slug
        if (!country) { throw new Error("Country not found"); }
        const updatedGovernorates = country.governorates?.filter(g => g.id !== governorate.id) || [];

        await updateDoc(countryDocRef, {
          governorates: updatedGovernorates 
        });
        toast({ title: t.successTitle, description: t.itemDeletedSuccess(governorate.name, language === 'ar' ? 'المحافظة' : 'Governorate') });
      } catch (error) {
        console.error("Error deleting governorate: ", error);
        toast({ title: t.errorTitle, description: t.couldNotDeleteItemError(language === 'ar' ? 'المحافظة' : 'Governorate'), variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteDistrict = async (countryId: string, governorateId: string, district: LocationDistrict) => { // countryId is slug
    if (window.confirm(t.deleteConfirm(district.name, language === 'ar' ? 'المنطقة' : 'district'))) {
        setIsSubmitting(true);
        const countryDocRef = doc(db, 'locations', countryId); // countryId is slug
        try {
            const districtAssociated = await checkListingsAssociation([district.id], 'locationDistrict');
            if (districtAssociated) {
                 toast({ title: t.deletionBlockedTitle, description: t.deletionBlockedDesc(language === 'ar' ? 'المنطقة' : 'district', district.name), variant: "destructive", duration: 5000 });
                setIsSubmitting(false);
                return;
            }

            const country = countries.find(c => c.id === countryId); // c.id is slug
            if (!country) throw new Error("Country not found");
            
            const updatedGovernorates = [...(country.governorates || [])];
            const govIndex = updatedGovernorates.findIndex(g => g.id === governorateId);
            if (govIndex === -1) throw new Error("Governorate not found");

            const targetGovernorate = updatedGovernorates[govIndex];
            const updatedDistricts = targetGovernorate.districts?.filter(d => d.id !== district.id) || [];
            updatedGovernorates[govIndex] = { ...targetGovernorate, districts: updatedDistricts };
            
            await updateDoc(countryDocRef, { governorates: updatedGovernorates });
            toast({ title: t.successTitle, description: t.itemDeletedSuccess(district.name, language === 'ar' ? 'المنطقة' : 'District') });
        } catch (error) {
            console.error("Error deleting district:", error);
            toast({ title: t.errorTitle, description: t.couldNotDeleteItemError(language === 'ar' ? 'المنطقة' : 'District'), variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }
  };

  const toggleExpandCountry = (countryId: string) => {
    setExpandedCountries(prev => ({ ...prev, [countryId]: !prev[countryId] }));
  };
  const toggleExpandGovernorate = (governorateId: string) => {
    setExpandedGovernorates(prev => ({ ...prev, [governorateId]: !prev[governorateId] }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{t.loadingLocations}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center"><MapPinned className="me-2 h-7 w-7"/>{t.pageTitle}</h1>
          <p className="text-muted-foreground">{t.pageDescription}</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>{t.addCountryTitle}</CardTitle></CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="space-y-1 flex-grow">
            <Label htmlFor="newCountryName">{t.countryNameLabel}</Label>
            <Input id="newCountryName" value={newCountryName} onChange={(e) => setNewCountryName(e.target.value)} placeholder={t.countryNamePlaceholder} disabled={isSubmitting}/>
          </div>
          <Button onClick={handleAddCountry} disabled={isSubmitting || !newCountryName.trim()} className="w-full sm:w-auto">
            {isSubmitting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <PlusCircle className="me-2 h-4 w-4" />} {t.addCountryButton}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.existingCountriesTitle}</CardTitle>
          <CardDescription>{t.foundCountriesDesc(countries.length)}</CardDescription>
        </CardHeader>
        <CardContent>
          {countries.length === 0 ? (
            <div className="py-10 text-center">
              <PackageOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">{t.noCountriesYet}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {countries.map((country) => ( // country.id is now the slug
                <Card key={country.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between p-4 bg-muted/50 cursor-pointer hover:bg-muted/70" onClick={() => toggleExpandCountry(country.id)}>
                    <div className="flex items-center">
                        {expandedCountries[country.id] ? <ChevronDown className="h-5 w-5 me-2"/> : <ChevronRight className="h-5 w-5 me-2"/>}
                        <CardTitle className="text-lg">{country.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setShowGovernorateFormFor(country.id); setNewGovernorateName('');}} disabled={isSubmitting}>
                            <PlusCircle className="h-4 w-4 me-1 sm:me-2"/> <span className="hidden sm:inline">{t.addGovernorateButton}</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteCountry(country.id, country.name);}} disabled={isSubmitting} className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50">
                            <Trash2 className="h-4 w-4" /> <span className="sr-only">{t.deleteButtonSr}</span>
                        </Button>
                    </div>
                  </CardHeader>
                  {expandedCountries[country.id] && (
                    <CardContent className="p-4 space-y-3">
                      {showGovernorateFormFor === country.id && (
                        <Card className="p-4 bg-secondary/50">
                          <CardTitle className="text-md mb-2">{t.addGovernorateToTitle(country.name)}</CardTitle>
                          <div className="flex flex-col sm:flex-row gap-3 items-end">
                             <div className="space-y-1 flex-grow">
                                <Label htmlFor={`newGovName-${country.id}`}>{t.governorateNameLabel}</Label>
                                <Input id={`newGovName-${country.id}`} value={newGovernorateName} onChange={(e) => setNewGovernorateName(e.target.value)} placeholder={t.governorateNamePlaceholder} disabled={isSubmitting} />
                             </div>
                             <div className="flex gap-2 w-full sm:w-auto">
                                <Button onClick={() => handleAddGovernorate(country.id)} disabled={isSubmitting || !newGovernorateName.trim()} className="flex-grow">
                                  {isSubmitting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <PlusCircle className="me-2 h-4 w-4" />} {t.addButton}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setShowGovernorateFormFor(null)} disabled={isSubmitting}><X className="h-4 w-4"/></Button>
                             </div>
                          </div>
                        </Card>
                      )}
                      {country.governorates && country.governorates.length > 0 ? (
                        <div className={`space-y-2 ${language === 'ar' ? 'pr-4 border-r-2 mr-2' : 'pl-4 border-l-2 ml-2'}`}>
                          <h4 className="font-medium text-sm text-muted-foreground flex items-center"><Building className="h-4 w-4 me-1"/>{t.governoratesSectionTitle}</h4>
                          {country.governorates.map((gov) => (
                            <Card key={gov.id} className="overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between p-3 bg-muted/30 cursor-pointer hover:bg-muted/50" onClick={() => toggleExpandGovernorate(gov.id)}>
                                    <div className="flex items-center">
                                        {expandedGovernorates[gov.id] ? <ChevronDown className="h-4 w-4 me-2"/> : <ChevronRight className="h-4 w-4 me-2"/>}
                                        <span className="font-medium">{gov.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="outline" size="xs" onClick={(e) => { e.stopPropagation(); setShowDistrictFormFor({countryId: country.id, governorateId: gov.id}); setNewDistrictName('');}} disabled={isSubmitting}>
                                            <PlusCircle className="h-3 w-3 me-1"/> {t.addDistrictButton}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteGovernorate(country.id, gov);}} disabled={isSubmitting} className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50">
                                            <Trash2 className="h-3 w-3" /> <span className="sr-only">{t.deleteButtonSr}</span>
                                        </Button>
                                    </div>
                                </CardHeader>
                                {expandedGovernorates[gov.id] && (
                                    <CardContent className="p-3 space-y-2">
                                         {showDistrictFormFor?.countryId === country.id && showDistrictFormFor.governorateId === gov.id && (
                                            <Card className="p-3 bg-secondary/30">
                                                <CardTitle className="text-sm mb-2">{t.addDistrictToTitle(country.name, gov.name)}</CardTitle>
                                                <div className="flex flex-col sm:flex-row gap-2 items-end">
                                                    <div className="space-y-1 flex-grow">
                                                        <Label htmlFor={`newDistName-${gov.id}`}>{t.districtNameLabel}</Label>
                                                        <Input id={`newDistName-${gov.id}`} value={newDistrictName} onChange={(e) => setNewDistrictName(e.target.value)} placeholder={t.districtNamePlaceholder} disabled={isSubmitting} />
                                                    </div>
                                                    <div className="flex gap-1 w-full sm:w-auto">
                                                        <Button size="sm" onClick={() => handleAddDistrict(country.id, gov.id)} disabled={isSubmitting || !newDistrictName.trim()} className="flex-grow">
                                                        {isSubmitting ? <Loader2 className="me-2 h-3 w-3 animate-spin" /> : <PlusCircle className="me-2 h-3 w-3" />} {t.addButton}
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => setShowDistrictFormFor(null)} disabled={isSubmitting}><X className="h-3 w-3"/></Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        )}
                                        {gov.districts && gov.districts.length > 0 ? (
                                            <div className={`space-y-1 ${language === 'ar' ? 'pr-3 border-r-2 mr-1' : 'pl-3 border-l-2 ml-1'}`}>
                                                <h5 className="font-medium text-xs text-muted-foreground flex items-center"><Map className="h-3 w-3 me-1"/>{t.districtsSectionTitle}</h5>
                                                {gov.districts.map(dist => (
                                                    <div key={dist.id} className="flex items-center justify-between p-1.5 rounded-md hover:bg-muted/20 text-sm">
                                                        <span>{dist.name} <span className="text-xs text-muted-foreground">({dist.id})</span></span>
                                                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteDistrict(country.id, gov.id, dist);}} disabled={isSubmitting} className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50">
                                                            <Trash2 className="h-3 w-3" /> <span className="sr-only">{t.deleteButtonSr}</span>
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className={`text-xs text-muted-foreground ${language === 'ar' ? 'pr-4' : 'pl-4'}`}>{t.noDistrictsYet}</p>
                                        )}
                                    </CardContent>
                                )}
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-sm text-muted-foreground ${language === 'ar' ? 'pr-6' : 'pl-6'}`}>{t.noGovernoratesYet}</p>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    