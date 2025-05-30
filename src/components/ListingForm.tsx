
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
import type { Category, ListingStatus, User, Listing as ListingType, ListingCategoryInfo } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageAnalysisTool } from './ImageAnalysisTool';
import { Upload, DollarSign, MapPinIcon, TagIcon, ListTree, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection, doc, getDoc, getDocs, query as firestoreQuery, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';

const translations = {
  en: {
    // Zod schema messages (basic)
    titleMin: "Title must be at least 5 characters",
    titleMax: "Title must be 100 characters or less",
    descriptionMin: "Description must be at least 20 characters",
    descriptionMax: "Description must be 1000 characters or less",
    pricePositive: "Price must be a positive number",
    categoryRequired: "Please select a category",
    locationMin: "Location must be at least 3 characters",
    // Component text
    createListingTitle: "Create a New Listing",
    createListingDesc: "Fill in the details below to post your item for sale. It will be reviewed by an admin before going live.",
    titleLabel: "Title",
    titlePlaceholder: "e.g., Vintage Leather Jacket",
    titleDesc: "A catchy title for your listing.",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Describe your item in detail...",
    descriptionDesc: "Provide all relevant details about your item.",
    priceLabel: "Price",
    pricePlaceholder: "e.g., 50.00",
    locationLabel: "Location",
    locationPlaceholder: "e.g., City, State",
    categoryLabel: "Category",
    loadingCategories: "Loading categories...",
    selectMainCategoryPlaceholder: "Select a main category",
    subcategoryLabel: "Subcategory",
    selectSubcategoryPlaceholder: (categoryName?: string) => categoryName ? `Select subcategory for ${categoryName}` : "Select a subcategory",
    noSubcategoryOption: "No subcategory / General",
    uploadImagesLabel: "Upload Images",
    uploadImagesDesc: "You can upload multiple images (upload to server not yet implemented).",
    submitButton: "Submit for Review",
    submittingButton: "Submitting...",
    // Toast messages
    authRequiredTitle: "Authentication Required",
    authRequiredDesc: "You must be logged in to create a listing.",
    categoryNotFoundError: "Selected category not found.",
    listingSubmittedTitle: "Listing Submitted!",
    listingSubmittedDesc: "Your listing has been submitted for review.",
    submissionFailedTitle: "Submission Failed",
    submissionFailedDescDefault: "Could not submit your listing. Please try again.",
    errorTitle: "Error",
    couldNotLoadCategories: "Could not load categories for the form."
  },
  ar: {
    titleMin: "يجب أن يتكون العنوان من 5 أحرف على الأقل",
    titleMax: "يجب أن يكون العنوان 100 حرف أو أقل",
    descriptionMin: "يجب أن يتكون الوصف من 20 حرفًا على الأقل",
    descriptionMax: "يجب أن يكون الوصف 1000 حرف أو أقل",
    pricePositive: "يجب أن يكون السعر رقمًا موجبًا",
    categoryRequired: "الرجاء تحديد فئة",
    locationMin: "يجب أن يتكون الموقع من 3 أحرف على الأقل",
    createListingTitle: "إنشاء إعلان جديد",
    createListingDesc: "املأ التفاصيل أدناه لنشر العنصر الخاص بك للبيع. ستتم مراجعته من قبل المسؤول قبل نشره.",
    titleLabel: "العنوان",
    titlePlaceholder: "مثال: سترة جلدية قديمة",
    titleDesc: "عنوان جذاب لإعلانك.",
    descriptionLabel: "الوصف",
    descriptionPlaceholder: "صف العنصر الخاص بك بالتفصيل...",
    descriptionDesc: "قدم جميع التفاصيل ذات الصلة حول العنصر الخاص بك.",
    priceLabel: "السعر",
    pricePlaceholder: "مثال: 50.00",
    locationLabel: "الموقع",
    locationPlaceholder: "مثال: المدينة، الدولة",
    categoryLabel: "الفئة",
    loadingCategories: "جار تحميل الفئات...",
    selectMainCategoryPlaceholder: "اختر فئة رئيسية",
    subcategoryLabel: "الفئة الفرعية",
    selectSubcategoryPlaceholder: (categoryName?: string) => categoryName ? `اختر فئة فرعية لـ ${categoryName}` : "اختر فئة فرعية",
    noSubcategoryOption: "بدون فئة فرعية / عام",
    uploadImagesLabel: "تحميل الصور",
    uploadImagesDesc: "يمكنك تحميل صور متعددة (لم يتم تنفيذ التحميل إلى الخادم بعد).",
    submitButton: "إرسال للمراجعة",
    submittingButton: "جار الإرسال...",
    authRequiredTitle: "المصادقة مطلوبة",
    authRequiredDesc: "يجب تسجيل الدخول لإنشاء إعلان.",
    categoryNotFoundError: "الفئة المحددة غير موجودة.",
    listingSubmittedTitle: "تم إرسال الإعلان!",
    listingSubmittedDesc: "تم إرسال إعلانك للمراجعة.",
    submissionFailedTitle: "فشل الإرسال",
    submissionFailedDescDefault: "لم نتمكن من إرسال إعلانك. يرجى المحاولة مرة أخرى.",
    errorTitle: "خطأ",
    couldNotLoadCategories: "لم نتمكن من تحميل الفئات للنموذج."
  }
};

const createListingFormSchema = (t: typeof translations['en'] | typeof translations['ar']) => z.object({
  title: z.string().min(5, t.titleMin).max(100, t.titleMax),
  description: z.string().min(20, t.descriptionMin).max(1000, t.descriptionMax),
  price: z.coerce.number().positive(t.pricePositive),
  categoryId: z.string().min(1, t.categoryRequired),
  subcategoryId: z.string().optional(),
  location: z.string().min(3, t.locationMin),
  images: z.any().optional(),
  status: z.custom<ListingStatus>().default('pending'),
});

type ListingFormValues = z.infer<ReturnType<typeof createListingFormSchema>>;

const defaultValues: Partial<ListingFormValues> = {
  title: '',
  description: '',
  price: undefined, // Changed to undefined for coerce.number()
  categoryId: '',
  subcategoryId: '',
  location: '',
  status: 'pending',
};

const NO_SUBCATEGORY_VALUE = "_none_";

export function ListingForm() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];
  const listingFormSchema = createListingFormSchema(t);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<Category | null>(null);
  const [availableSubcategories, setAvailableSubcategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const watchedCategoryId = form.watch('categoryId');

  useEffect(() => {
    const fetchCategories = async () => {
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
        console.error("Error fetching categories for form:", error);
        toast({ title: t.errorTitle, description: t.couldNotLoadCategories, variant: "destructive" });
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [toast, t]);

  useEffect(() => {
    if (watchedCategoryId && allCategories.length > 0) {
      const category = allCategories.find(cat => cat.id === watchedCategoryId);
      setSelectedMainCategory(category || null);
      setAvailableSubcategories(category?.subcategories || []);
      const currentSubcategoryId = form.getValues('subcategoryId');
      if (currentSubcategoryId && !category?.subcategories?.find(sc => sc.id === currentSubcategoryId)) {
        form.setValue('subcategoryId', '');
      }
    } else {
      setSelectedMainCategory(null);
      setAvailableSubcategories([]);
    }
  }, [watchedCategoryId, allCategories, form]);

  async function onSubmit(data: ListingFormValues) {
    setIsSubmitting(true);
    const currentUserAuth = auth.currentUser;

    if (!currentUserAuth) {
      toast({
        title: t.authRequiredTitle,
        description: t.authRequiredDesc,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const userDocRef = doc(db, "users", currentUserAuth.uid);
      const userDocSnap = await getDoc(userDocRef);
      let seller: User;

      if (userDocSnap.exists()) {
        seller = userDocSnap.data() as User;
      } else {
        seller = {
          id: currentUserAuth.uid,
          name: currentUserAuth.displayName || "Anonymous User",
          email: currentUserAuth.email || "", 
          avatarUrl: currentUserAuth.photoURL || "",
          joinDate: new Date().toISOString(), 
          isAdmin: false, 
        };
      }

      const mainCategoryData = allCategories.find(c => c.id === data.categoryId);
      if (!mainCategoryData) {
        throw new Error(t.categoryNotFoundError);
      }

      let subCategoryInfo: ListingCategoryInfo | undefined = undefined;
      if (data.subcategoryId && data.subcategoryId !== NO_SUBCATEGORY_VALUE) {
        const subCategoryData = mainCategoryData.subcategories?.find(sc => sc.id === data.subcategoryId);
        if (subCategoryData) {
            subCategoryInfo = { id: subCategoryData.id, name: subCategoryData.name };
        }
      }
      
      const imageUrls: string[] = []; 

      const newListingData: Omit<ListingType, 'id'> = {
        title: data.title,
        description: data.description,
        price: data.price,
        category: { id: mainCategoryData.id, name: mainCategoryData.name },
        subcategory: subCategoryInfo,
        location: data.location,
        images: imageUrls, 
        seller: seller, 
        postedDate: new Date().toISOString(),
        status: 'pending', 
        isFeatured: false, 
      };

      await addDoc(collection(db, 'listings'), newListingData);

      toast({
        title: t.listingSubmittedTitle,
        description: t.listingSubmittedDesc,
      });
      form.reset();
      setImagePreviews([]);
      setSelectedMainCategory(null);
      setAvailableSubcategories([]);
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
      imagePreviews.forEach(previewUrl => URL.revokeObjectURL(previewUrl));
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(newPreviews);
      form.setValue('images', event.target.files); 
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{t.createListingTitle}</CardTitle>
          <CardDescription>{t.createListingDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.titleLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.titlePlaceholder} {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>{t.titleDesc}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.descriptionLabel}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t.descriptionPlaceholder}
                        className="resize-y min-h-[120px]"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>{t.descriptionDesc}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><DollarSign className={`h-4 w-4 ${language === 'ar' ? 'ms-1' : 'me-1'}`}/>{t.priceLabel}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={t.pricePlaceholder} {...field} value={field.value ?? ''} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><MapPinIcon className={`h-4 w-4 ${language === 'ar' ? 'ms-1' : 'me-1'}`}/>{t.locationLabel}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.locationPlaceholder} {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><TagIcon className={`h-4 w-4 ${language === 'ar' ? 'ms-1' : 'me-1'}`}/>{t.categoryLabel}</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue('subcategoryId', ''); 
                        }} 
                        defaultValue={field.value}
                        disabled={isSubmitting || isLoadingCategories}
                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingCategories ? t.loadingCategories : t.selectMainCategoryPlaceholder} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {!isLoadingCategories && allCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {selectedMainCategory && availableSubcategories.length > 0 && (
                  <FormField
                    control={form.control}
                    name="subcategoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><ListTree className={`h-4 w-4 ${language === 'ar' ? 'ms-1' : 'me-1'}`}/>{t.subcategoryLabel}</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value === NO_SUBCATEGORY_VALUE ? '' : value);
                          }}
                          value={field.value || NO_SUBCATEGORY_VALUE} 
                          disabled={isSubmitting || isLoadingCategories}
                          dir={language === 'ar' ? 'rtl' : 'ltr'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t.selectSubcategoryPlaceholder(selectedMainCategory.name)} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={NO_SUBCATEGORY_VALUE}>{t.noSubcategoryOption}</SelectItem>
                            {availableSubcategories.map((subcat) => (
                              <SelectItem key={subcat.id} value={subcat.id}>
                                {subcat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              <FormField
                control={form.control}
                name="images" 
                render={({ field }) => ( 
                  <FormItem>
                    <FormLabel className="flex items-center"><Upload className={`h-4 w-4 ${language === 'ar' ? 'ms-1' : 'me-1'}`}/>{t.uploadImagesLabel}</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        disabled={isSubmitting}
                        className="file:text-sm file:font-medium"
                      />
                    </FormControl>
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

              <Button type="submit" className="w-full sm:w-auto" size="lg" disabled={isSubmitting || isLoadingCategories}>
                {isSubmitting ? (
                  <>
                    <Loader2 className={`h-4 w-4 animate-spin ${language === 'ar' ? 'ms-2' : 'me-2'}`} />
                    {t.submittingButton}
                  </>
                ) : (
                  t.submitButton
                )}
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
