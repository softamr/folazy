
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Category, ListingStatus, User, Listing as ListingType, ListingCategoryInfo, LocationCountry, LocationGovernorate, LocationDistrict, LocationRef } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageAnalysisTool } from './ImageAnalysisTool';
import { Upload, MapPinIcon, TagIcon, ListTree, Loader2, Globe2, Building, Map } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection, doc, getDoc, getDocs, query as firestoreQuery, orderBy, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { useRouter } from 'next/navigation';


const translations = {
  en: {
    // Zod schema messages
    titleMin: "Title must be at least 5 characters",
    titleMax: "Title must be 100 characters or less",
    descriptionMin: "Description must be at least 20 characters",
    descriptionMax: "Description must be 1000 characters or less",
    pricePositive: "Price must be a positive number",
    categoryRequired: "Please select a category",
    countryRequired: "Please select a country",
    governorateRequired: "Please select a governorate",
    // Component text
    createListingTitle: "Create a New Listing",
    createListingDesc: "Fill in the details below to post your item for sale. It will be reviewed by an admin before going live.",
    updateListingTitle: "Edit Listing",
    updateListingDesc: "Update the details of your existing listing. Changes will be reflected after admin review if applicable.",
    titleLabel: "Title",
    titlePlaceholder: "e.g., Vintage Leather Jacket",
    titleDesc: "A catchy title for your listing.",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Describe your item in detail...",
    descriptionDesc: "Provide all relevant details about your item.",
    priceLabel: "Price",
    pricePlaceholder: "e.g., 50.00",
    categoryLabel: "Category",
    loadingCategories: "Loading categories...",
    selectMainCategoryPlaceholder: "Select a main category",
    subcategoryLabel: "Subcategory",
    selectSubcategoryPlaceholder: (categoryName?: string) => categoryName ? `Select subcategory for ${categoryName}` : "Select a subcategory",
    noSubcategoryOption: "No subcategory / General",
    
    countryLabel: "Country",
    selectCountryPlaceholder: "Select a country",
    governorateLabel: "Governorate / City",
    selectGovernoratePlaceholder: "Select a governorate/city",
    districtLabel: "District / Area (Optional)",
    selectDistrictPlaceholder: "Select a district/area",
    noDistrictOption: "No specific district / General area",
    loadingLocations: "Loading locations...",

    uploadImagesLabel: "Upload Images",
    uploadImagesDesc: "You can upload multiple images. In edit mode, new uploads will replace existing images (feature not fully implemented for updates yet).",
    submitButton: "Submit for Review",
    submittingButton: "Submitting...",
    updateButton: "Update Listing",
    updatingButton: "Updating...",
    // Toast messages
    authRequiredTitle: "Authentication Required",
    authRequiredDesc: "You must be logged in to create or edit a listing.",
    categoryNotFoundError: "Selected category not found.",
    locationNotFoundError: (type: string) => `Selected ${type} not found.`,
    listingSubmittedTitle: "Listing Submitted!",
    listingSubmittedDesc: "Your listing has been submitted for review.",
    listingUpdatedTitle: "Listing Updated!",
    listingUpdatedDesc: "Your listing has been successfully updated.",
    submissionFailedTitle: "Submission Failed",
    submissionFailedDescDefault: "Could not submit your listing. Please try again.",
    errorTitle: "Error",
    couldNotLoadCategories: "Could not load categories for the form.",
    couldNotLoadLocations: "Could not load locations for the form.",
    errorLoadingListingDetails: "Could not load listing details for editing.",
    currencyUnit: "(EGP)",
  },
  ar: {
    titleMin: "يجب أن يتكون العنوان من 5 أحرف على الأقل",
    titleMax: "يجب أن يكون العنوان 100 حرف أو أقل",
    descriptionMin: "يجب أن يتكون الوصف من 20 حرفًا على الأقل",
    descriptionMax: "يجب أن يكون الوصف 1000 حرف أو أقل",
    pricePositive: "يجب أن يكون السعر رقمًا موجبًا",
    categoryRequired: "الرجاء تحديد فئة",
    countryRequired: "الرجاء تحديد الدولة",
    governorateRequired: "الرجاء تحديد المحافظة",
    createListingTitle: "إنشاء إعلان جديد",
    createListingDesc: "املأ التفاصيل أدناه لنشر العنصر الخاص بك للبيع. ستتم مراجعته من قبل المسؤول قبل نشره.",
    updateListingTitle: "تعديل الإعلان",
    updateListingDesc: "قم بتحديث تفاصيل إعلانك الحالي. ستنعكس التغييرات بعد مراجعة المسؤول إذا كان ذلك معمولاً به.",
    titleLabel: "العنوان",
    titlePlaceholder: "مثال: سترة جلدية قديمة",
    titleDesc: "عنوان جذاب لإعلانك.",
    descriptionLabel: "الوصف",
    descriptionPlaceholder: "صف العنصر الخاص بك بالتفصيل...",
    descriptionDesc: "قدم جميع التفاصيل ذات الصلة حول العنصر الخاص بك.",
    priceLabel: "السعر",
    pricePlaceholder: "مثال: 50.00",
    categoryLabel: "الفئة",
    loadingCategories: "جار تحميل الفئات...",
    selectMainCategoryPlaceholder: "اختر فئة رئيسية",
    subcategoryLabel: "الفئة الفرعية",
    selectSubcategoryPlaceholder: (categoryName?: string) => categoryName ? `اختر فئة فرعية لـ ${categoryName}` : "اختر فئة فرعية",
    noSubcategoryOption: "بدون فئة فرعية / عام",

    countryLabel: "الدولة",
    selectCountryPlaceholder: "اختر دولة",
    governorateLabel: "المحافظة / المدينة",
    selectGovernoratePlaceholder: "اختر محافظة/مدينة",
    districtLabel: "المنطقة / الحي (اختياري)",
    selectDistrictPlaceholder: "اختر منطقة/حي",
    noDistrictOption: "لا يوجد منطقة محددة / منطقة عامة",
    loadingLocations: "جار تحميل المواقع...",

    uploadImagesLabel: "تحميل الصور",
    uploadImagesDesc: "يمكنك تحميل صور متعددة. في وضع التعديل، ستحل الصور الجديدة محل الحالية (لم يتم تنفيذ الميزة بالكامل للتحديثات بعد).",
    submitButton: "إرسال للمراجعة",
    submittingButton: "جار الإرسال...",
    updateButton: "تحديث الإعلان",
    updatingButton: "جار التحديث...",
    authRequiredTitle: "المصادقة مطلوبة",
    authRequiredDesc: "يجب تسجيل الدخول لإنشاء أو تعديل إعلان.",
    categoryNotFoundError: "الفئة المحددة غير موجودة.",
    locationNotFoundError: (type: string) => `الـ ${type} المحدد غير موجود.`,
    listingSubmittedTitle: "تم إرسال الإعلان!",
    listingSubmittedDesc: "تم إرسال إعلانك للمراجعة.",
    listingUpdatedTitle: "تم تحديث الإعلان!",
    listingUpdatedDesc: "تم تحديث إعلانك بنجاح.",
    submissionFailedTitle: "فشل الإرسال",
    submissionFailedDescDefault: "لم نتمكن من إرسال إعلانك. يرجى المحاولة مرة أخرى.",
    errorTitle: "خطأ",
    couldNotLoadCategories: "لم نتمكن من تحميل الفئات للنموذج.",
    couldNotLoadLocations: "لم نتمكن من تحميل المواقع للنموذج.",
    errorLoadingListingDetails: "لم نتمكن من تحميل تفاصيل الإعلان للتعديل.",
    currencyUnit: "(جنيه)",
  }
};

const createListingFormSchema = (t: typeof translations['en'] | typeof translations['ar']) => z.object({
  title: z.string().min(5, t.titleMin).max(100, t.titleMax),
  description: z.string().min(20, t.descriptionMin).max(1000, t.descriptionMax),
  price: z.coerce.number().positive(t.pricePositive),
  categoryId: z.string().min(1, t.categoryRequired),
  subcategoryId: z.string().optional(),
  
  countryId: z.string().min(1, t.countryRequired),
  governorateId: z.string().min(1, t.governorateRequired),
  districtId: z.string().optional(),
  
  images: z.any().optional(), // For FileList or array of URLs
  status: z.custom<ListingStatus>().default('pending'),
});

type ListingFormValues = z.infer<ReturnType<typeof createListingFormSchema>>;

const NO_SUBCATEGORY_VALUE = "_none_";
const NO_DISTRICT_VALUE = "_none_";

interface ListingFormProps {
  listingToEdit?: ListingType | null;
}

export function ListingForm({ listingToEdit }: ListingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];
  const listingFormSchema = createListingFormSchema(t);
  const isEditMode = !!listingToEdit;

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultFormValues: Partial<ListingFormValues> = {
    title: listingToEdit?.title || '',
    description: listingToEdit?.description || '',
    price: listingToEdit?.price,
    categoryId: listingToEdit?.category?.id || '',
    subcategoryId: listingToEdit?.subcategory?.id || NO_SUBCATEGORY_VALUE,
    countryId: listingToEdit?.locationCountry?.id || '',
    governorateId: listingToEdit?.locationGovernorate?.id || '',
    districtId: listingToEdit?.locationDistrict?.id || NO_DISTRICT_VALUE,
    status: listingToEdit?.status || 'pending',
  };
  
  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: defaultFormValues,
    mode: 'onChange',
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>(listingToEdit?.images || []);
  
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<Category | null>(null);
  const [availableSubcategories, setAvailableSubcategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const [allCountries, setAllCountries] = useState<LocationCountry[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<LocationCountry | null>(null);
  const [availableGovernorates, setAvailableGovernorates] = useState<LocationGovernorate[]>([]);
  const [selectedGovernorate, setSelectedGovernorate] = useState<LocationGovernorate | null>(null);
  const [availableDistricts, setAvailableDistricts] = useState<LocationDistrict[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  const watchedCategoryId = form.watch('categoryId');
  const watchedCountryId = form.watch('countryId');
  const watchedGovernorateId = form.watch('governorateId');

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingCategories(true);
      setIsLoadingLocations(true);
      try {
        const categoriesRef = collection(db, 'categories');
        const catQuery = firestoreQuery(categoriesRef, orderBy('name'));
        const catSnapshot = await getDocs(catQuery);
        const fetchedCategories: Category[] = [];
        catSnapshot.forEach((doc) => fetchedCategories.push({ id: doc.id, ...doc.data() } as Category));
        setAllCategories(fetchedCategories);

        const locationsRef = collection(db, 'locations');
        const locQuery = firestoreQuery(locationsRef, orderBy('name'));
        const locSnapshot = await getDocs(locQuery);
        const fetchedCountries: LocationCountry[] = [];
        locSnapshot.forEach((doc) => fetchedCountries.push({ id: doc.id, ...doc.data() } as LocationCountry));
        setAllCountries(fetchedCountries);

        // If in edit mode, set initial selections after categories/locations are loaded
        if (listingToEdit) {
          if (listingToEdit.category.id && fetchedCategories.length > 0) {
            const mainCat = fetchedCategories.find(c => c.id === listingToEdit.category.id);
            setSelectedMainCategory(mainCat || null);
            setAvailableSubcategories(mainCat?.subcategories || []);
          }
          if (listingToEdit.locationCountry?.id && fetchedCountries.length > 0) {
            const country = fetchedCountries.find(c => c.id === listingToEdit.locationCountry!.id);
            setSelectedCountry(country || null);
            setAvailableGovernorates(country?.governorates || []);
            if (listingToEdit.locationGovernorate?.id && country) {
              const gov = country.governorates?.find(g => g.id === listingToEdit.locationGovernorate!.id);
              setSelectedGovernorate(gov || null);
              setAvailableDistricts(gov?.districts || []);
            }
          }
        }

      } catch (error) {
        console.error("Error fetching form data:", error);
        toast({ title: t.errorTitle, description: t.couldNotLoadCategories, variant: "destructive" });
      } finally {
        setIsLoadingCategories(false);
        setIsLoadingLocations(false);
      }
    };
    fetchInitialData();
  }, [toast, t, listingToEdit]); // listingToEdit in dependency array to re-trigger selections if it changes


  useEffect(() => {
    if (watchedCategoryId && allCategories.length > 0) {
      const category = allCategories.find(cat => cat.id === watchedCategoryId);
      setSelectedMainCategory(category || null);
      setAvailableSubcategories(category?.subcategories || []);
      if (!isEditMode || (listingToEdit && watchedCategoryId !== listingToEdit.category.id)) {
        form.setValue('subcategoryId', NO_SUBCATEGORY_VALUE);
      }
    } else if (!watchedCategoryId) {
      setSelectedMainCategory(null);
      setAvailableSubcategories([]);
       if (!isEditMode) form.setValue('subcategoryId', NO_SUBCATEGORY_VALUE);
    }
  }, [watchedCategoryId, allCategories, form, isEditMode, listingToEdit]);

  useEffect(() => {
    if (watchedCountryId && allCountries.length > 0) {
      const country = allCountries.find(c => c.id === watchedCountryId);
      setSelectedCountry(country || null);
      setAvailableGovernorates(country?.governorates || []);
      if (!isEditMode || (listingToEdit && watchedCountryId !== listingToEdit.locationCountry?.id)) {
        form.setValue('governorateId', '');
        form.setValue('districtId', NO_DISTRICT_VALUE);
      }
      setSelectedGovernorate(null);
      setAvailableDistricts([]);
    } else if (!watchedCountryId) {
      setSelectedCountry(null);
      setAvailableGovernorates([]);
      if (!isEditMode) {
        form.setValue('governorateId', '');
        form.setValue('districtId', NO_DISTRICT_VALUE);
      }
    }
  }, [watchedCountryId, allCountries, form, isEditMode, listingToEdit]);

  useEffect(() => {
    if (watchedGovernorateId && selectedCountry) {
      const governorate = selectedCountry.governorates?.find(g => g.id === watchedGovernorateId);
      setSelectedGovernorate(governorate || null);
      setAvailableDistricts(governorate?.districts || []);
      if (!isEditMode || (listingToEdit && watchedGovernorateId !== listingToEdit.locationGovernorate?.id)) {
        form.setValue('districtId', NO_DISTRICT_VALUE);
      }
    } else if (!watchedGovernorateId) {
      setSelectedGovernorate(null);
      setAvailableDistricts([]);
      if (!isEditMode) form.setValue('districtId', NO_DISTRICT_VALUE);
    }
  }, [watchedGovernorateId, selectedCountry, form, isEditMode, listingToEdit]);


  async function onSubmit(data: ListingFormValues) {
    setIsSubmitting(true);
    const currentUserAuth = auth.currentUser;

    if (!currentUserAuth) {
      toast({ title: t.authRequiredTitle, description: t.authRequiredDesc, variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    try {
      const userDocRef = doc(db, "users", currentUserAuth.uid);
      const userDocSnap = await getDoc(userDocRef);
      let seller: User;

      if (userDocSnap.exists()) {
        seller = { id: userDocSnap.id, ...userDocSnap.data() } as User;
      } else { // Should ideally not happen for a logged-in user if profile creation is robust
        seller = {
          id: currentUserAuth.uid, name: currentUserAuth.displayName || "Anonymous User",
          email: currentUserAuth.email || "", avatarUrl: currentUserAuth.photoURL || "",
          joinDate: new Date().toISOString(), isAdmin: false,
        };
      }

      const mainCategoryData = allCategories.find(c => c.id === data.categoryId);
      if (!mainCategoryData) throw new Error(t.categoryNotFoundError);
      let subCategoryInfo: ListingCategoryInfo | undefined = undefined;
      if (data.subcategoryId && data.subcategoryId !== NO_SUBCATEGORY_VALUE) {
        const subCategoryData = mainCategoryData.subcategories?.find(sc => sc.id === data.subcategoryId);
        if (subCategoryData) subCategoryInfo = { id: subCategoryData.id, name: subCategoryData.name };
      }
      
      const countryData = allCountries.find(c => c.id === data.countryId);
      if (!countryData) throw new Error(t.locationNotFoundError(language === 'ar' ? 'الدولة' : 'country'));
      const governorateData = countryData.governorates?.find(g => g.id === data.governorateId);
      if (!governorateData) throw new Error(t.locationNotFoundError(language === 'ar' ? 'المحافظة' : 'governorate'));
      let districtInfo: LocationRef | undefined = undefined;
      if (data.districtId && data.districtId !== NO_DISTRICT_VALUE) {
          const districtData = governorateData.districts?.find(d => d.id === data.districtId);
          if (districtData) districtInfo = { id: districtData.id, name: districtData.name };
      }
      const locationDisplay = [districtInfo?.name, governorateData.name, countryData.name].filter(Boolean).join(', ');
      
      // Image handling: For now, image uploads and updates are simplified / placeholders.
      // In a real app, you'd upload files to Firebase Storage and get URLs.
      // For new listings, `imageUrls` would be from newly uploaded files.
      // For edited listings, if new files selected, upload them, otherwise keep existing URLs.
      // This example does not implement file upload to storage.
      const imageUrls: string[] = imagePreviews.length > 0 ? imagePreviews : []; // Placeholder

      const listingPayload = {
        title: data.title, description: data.description, price: data.price,
        category: { id: mainCategoryData.id, name: mainCategoryData.name },
        subcategory: subCategoryInfo,
        location: locationDisplay,
        locationCountry: { id: countryData.id, name: countryData.name },
        locationGovernorate: { id: governorateData.id, name: governorateData.name },
        locationDistrict: districtInfo,
        // `images` will not be updated if `isEditMode` and no new images are selected.
        // This simplistic approach assumes if `imagePreviews` (derived from new file selection) has content,
        // it's intended for update. Otherwise, existing images (if any) are kept by not including `images` in `updateDoc`.
      };

      if (isEditMode && listingToEdit) {
        const listingRef = doc(db, 'listings', listingToEdit.id);
        let updateData: Partial<ListingType> = { ...listingPayload };
        // Only include images if new ones were selected (indicated by form.images having FileList)
        // This simple check is not robust. A real app would track if files changed.
        if (form.getValues('images')) { // if FileList is populated
            // Here you would upload new images to storage and get new URLs for updateData.images
            // For now, if user selects new images, imagePreviews is updated,
            // and we'll just use those (assuming they are already URLs - which is not true for FileList)
            // This part is a simplification:
            updateData.images = imagePreviews; // This assumes imagePreviews are final URLs after upload
        }
        await updateDoc(listingRef, updateData);
        toast({ title: t.listingUpdatedTitle, description: t.listingUpdatedDesc });
        router.push(`/listings/${listingToEdit.id}`); // Redirect to listing detail
      } else {
        const newListingData: Omit<ListingType, 'id'> = {
          ...listingPayload,
          images: imageUrls, // From selected files or placeholder
          seller: seller,
          postedDate: new Date().toISOString(),
          status: 'pending',
          isFeatured: false,
        };
        await addDoc(collection(db, 'listings'), newListingData);
        toast({ title: t.listingSubmittedTitle, description: t.listingSubmittedDesc });
        form.reset(defaultFormValues); // Reset to initial defaults
        setImagePreviews([]);
        setSelectedMainCategory(null); setAvailableSubcategories([]);
        setSelectedCountry(null); setAvailableGovernorates([]);
        setSelectedGovernorate(null); setAvailableDistricts([]);
      }
    } catch (error) {
      console.error("Error submitting listing:", error);
      toast({
        title: t.submissionFailedTitle,
        description: (error as Error).message || t.submissionFailedDescDefault,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      // Revoke old object URLs if they exist to prevent memory leaks
      imagePreviews.forEach(previewUrl => { if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl); });
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(newPreviews);
      form.setValue('images', event.target.files); // Store FileList for processing in onSubmit
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{isEditMode ? t.updateListingTitle : t.createListingTitle}</CardTitle>
          <CardDescription>{isEditMode ? t.updateListingDesc : t.createListingDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control} name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.titleLabel}</FormLabel>
                    <FormControl><Input placeholder={t.titlePlaceholder} {...field} disabled={isSubmitting} /></FormControl>
                    <FormDescription>{t.titleDesc}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control} name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.descriptionLabel}</FormLabel>
                    <FormControl><Textarea placeholder={t.descriptionPlaceholder} className="resize-y min-h-[120px]" {...field} disabled={isSubmitting}/></FormControl>
                    <FormDescription>{t.descriptionDesc}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control} name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">{t.priceLabel} <span className={`text-xs text-muted-foreground ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{t.currencyUnit}</span></FormLabel>
                    <FormControl><Input type="number" placeholder={t.pricePlaceholder} {...field} value={field.value ?? ''} disabled={isSubmitting} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Card><CardContent className="pt-6 space-y-6">
                <h3 className="text-lg font-medium">{language === 'ar' ? 'تفاصيل الفئة' : 'Category Details'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                    control={form.control} name="categoryId"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="flex items-center"><TagIcon className={`h-4 w-4 ${language === 'ar' ? 'ms-1' : 'me-1'}`}/>{t.categoryLabel}</FormLabel>
                        <Select onValueChange={(value) => { field.onChange(value); if (!isEditMode) form.setValue('subcategoryId', NO_SUBCATEGORY_VALUE); }} value={field.value}
                        disabled={isSubmitting || isLoadingCategories} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        <FormControl><SelectTrigger><SelectValue placeholder={isLoadingCategories ? t.loadingCategories : t.selectMainCategoryPlaceholder} /></SelectTrigger></FormControl>
                        <SelectContent>
                            {!isLoadingCategories && allCategories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                {(selectedMainCategory || availableSubcategories.length > 0) && (
                    <FormField
                    control={form.control} name="subcategoryId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center"><ListTree className={`h-4 w-4 ${language === 'ar' ? 'ms-1' : 'me-1'}`}/>{t.subcategoryLabel}</FormLabel>
                        <Select onValueChange={(value) => { field.onChange(value === NO_SUBCATEGORY_VALUE ? '' : value); }} value={field.value || NO_SUBCATEGORY_VALUE} 
                            disabled={isSubmitting || isLoadingCategories || !selectedMainCategory || availableSubcategories.length === 0} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            <FormControl><SelectTrigger><SelectValue placeholder={t.selectSubcategoryPlaceholder(selectedMainCategory?.name)} /></SelectTrigger></FormControl>
                            <SelectContent>
                            <SelectItem value={NO_SUBCATEGORY_VALUE}>{t.noSubcategoryOption}</SelectItem>
                            {availableSubcategories.map((subcat) => (<SelectItem key={subcat.id} value={subcat.id}>{subcat.name}</SelectItem>))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}
                </div>
              </CardContent></Card>

              <Card><CardContent className="pt-6 space-y-6">
                <h3 className="text-lg font-medium">{language === 'ar' ? 'تفاصيل الموقع' : 'Location Details'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                        control={form.control} name="countryId"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center"><Globe2 className={`h-4 w-4 ${language === 'ar' ? 'ms-1' : 'me-1'}`}/>{t.countryLabel}</FormLabel>
                            <Select onValueChange={(value) => { field.onChange(value); if (!isEditMode) {form.setValue('governorateId', ''); form.setValue('districtId', NO_DISTRICT_VALUE);} }} value={field.value}
                            disabled={isSubmitting || isLoadingLocations} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            <FormControl><SelectTrigger><SelectValue placeholder={isLoadingLocations ? t.loadingLocations : t.selectCountryPlaceholder} /></SelectTrigger></FormControl>
                            <SelectContent>
                                {!isLoadingLocations && allCountries.map((country) => (<SelectItem key={country.id} value={country.id}>{country.name}</SelectItem>))}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control} name="governorateId"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center"><Building className={`h-4 w-4 ${language === 'ar' ? 'ms-1' : 'me-1'}`}/>{t.governorateLabel}</FormLabel>
                            <Select onValueChange={(value) => { field.onChange(value); if(!isEditMode) form.setValue('districtId', NO_DISTRICT_VALUE);}} value={field.value}
                            disabled={isSubmitting || isLoadingLocations || !selectedCountry || availableGovernorates.length === 0} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            <FormControl><SelectTrigger><SelectValue placeholder={t.selectGovernoratePlaceholder} /></SelectTrigger></FormControl>
                            <SelectContent>
                                {availableGovernorates.map((gov) => (<SelectItem key={gov.id} value={gov.id}>{gov.name}</SelectItem>))}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                {(selectedGovernorate || availableDistricts.length > 0) && (
                    <FormField
                        control={form.control} name="districtId"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center"><Map className={`h-4 w-4 ${language === 'ar' ? 'ms-1' : 'me-1'}`}/>{t.districtLabel}</FormLabel>
                            <Select onValueChange={(value) => { field.onChange(value === NO_DISTRICT_VALUE ? '' : value); }} value={field.value || NO_DISTRICT_VALUE}
                            disabled={isSubmitting || isLoadingLocations || !selectedGovernorate || availableDistricts.length === 0} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            <FormControl><SelectTrigger><SelectValue placeholder={t.selectDistrictPlaceholder} /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value={NO_DISTRICT_VALUE}>{t.noDistrictOption}</SelectItem>
                                {availableDistricts.map((dist) => (<SelectItem key={dist.id} value={dist.id}>{dist.name}</SelectItem>))}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                )}
              </CardContent></Card>
              
              <FormField
                control={form.control} name="images" 
                render={({ field }) => ( 
                  <FormItem>
                    <FormLabel className="flex items-center"><Upload className={`h-4 w-4 ${language === 'ar' ? 'ms-1' : 'me-1'}`}/>{t.uploadImagesLabel}</FormLabel>
                    <FormControl><Input type="file" multiple accept="image/*" onChange={handleImageChange} disabled={isSubmitting} className="file:text-sm file:font-medium"/></FormControl>
                    <FormDescription>{t.uploadImagesDesc}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                  {imagePreviews.map((src, index) => (
                    <img key={index} src={src} alt={`Preview ${index + 1}`} className="h-24 w-full object-cover rounded-md border"/>
                  ))}
                </div>
              )}

              <Button type="submit" className="w-full sm:w-auto" size="lg" disabled={isSubmitting || isLoadingCategories || isLoadingLocations}>
                {isSubmitting ? (
                  <><Loader2 className={`h-4 w-4 animate-spin ${language === 'ar' ? 'ms-2' : 'me-2'}`} /> {isEditMode ? t.updatingButton : t.submittingButton}</>
                ) : (isEditMode ? t.updateButton : t.submitButton)}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="md:col-span-1 space-y-6">
        <ImageAnalysisTool />
      </div>
    </div>
  );
}

