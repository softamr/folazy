
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
// import { placeholderCategories } from '@/lib/placeholder-data'; // No longer used for categories
import type { Category, ListingStatus, User, Listing as ListingType, ListingCategoryInfo } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageAnalysisTool } from './ImageAnalysisTool';
import { Upload, DollarSign, MapPinIcon, TagIcon, ListTree, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection, doc, getDoc, getDocs, query as firestoreQuery, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const listingFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be 100 characters or less'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000, 'Description must be 1000 characters or less'),
  price: z.coerce.number().positive('Price must be a positive number'),
  categoryId: z.string().min(1, 'Please select a category'),
  subcategoryId: z.string().optional(),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  images: z.any().optional(), // For file input, actual upload to be handled
  status: z.custom<ListingStatus>().default('pending'),
});

type ListingFormValues = z.infer<typeof listingFormSchema>;

const defaultValues: Partial<ListingFormValues> = {
  title: '',
  description: '',
  price: '', // Keep as empty string for controlled input
  categoryId: '',
  subcategoryId: '',
  location: '',
  status: 'pending',
};

const NO_SUBCATEGORY_VALUE = "_none_";

export function ListingForm() {
  const { toast } = useToast();
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
        toast({ title: "Error", description: "Could not load categories for the form.", variant: "destructive" });
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [toast]);

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
    const currentUser = auth.currentUser;

    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a listing.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      let seller: User;

      if (userDocSnap.exists()) {
        seller = userDocSnap.data() as User;
      } else {
        seller = {
          id: currentUser.uid,
          name: currentUser.displayName || "Anonymous User",
          email: currentUser.email || "", 
          avatarUrl: currentUser.photoURL || "",
          joinDate: new Date().toISOString(), 
          isAdmin: false, 
        };
      }

      const mainCategoryData = allCategories.find(c => c.id === data.categoryId);
      if (!mainCategoryData) {
        throw new Error("Selected category not found.");
      }

      let subCategoryInfo: ListingCategoryInfo | undefined = undefined;
      if (data.subcategoryId && data.subcategoryId !== NO_SUBCATEGORY_VALUE) {
        const subCategoryData = mainCategoryData.subcategories?.find(sc => sc.id === data.subcategoryId);
        if (subCategoryData) {
            subCategoryInfo = { id: subCategoryData.id, name: subCategoryData.name };
        }
      }
      
      const imageUrls: string[] = []; 
      // TODO: Implement image upload to Firebase Storage and get URLs

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
        title: "Listing Submitted!",
        description: "Your listing has been submitted for review.",
      });
      form.reset();
      setImagePreviews([]);
      setSelectedMainCategory(null);
      setAvailableSubcategories([]);
    } catch (error) {
      console.error("Error submitting listing:", error);
      toast({
        title: "Submission Failed",
        description: (error as Error).message || "Could not submit your listing. Please try again.",
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
          <CardTitle>Create a New Listing</CardTitle>
          <CardDescription>Fill in the details below to post your item for sale. It will be reviewed by an admin before going live.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Vintage Leather Jacket" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>A catchy title for your listing.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your item in detail..."
                        className="resize-y min-h-[120px]"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>Provide all relevant details about your item.</FormDescription>
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
                      <FormLabel className="flex items-center"><DollarSign className="h-4 w-4 mr-1"/>Price</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 50.00" {...field} value={field.value ?? ''} disabled={isSubmitting} />
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
                      <FormLabel className="flex items-center"><MapPinIcon className="h-4 w-4 mr-1"/>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., City, State" {...field} disabled={isSubmitting} />
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
                      <FormLabel className="flex items-center"><TagIcon className="h-4 w-4 mr-1"/>Category</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue('subcategoryId', ''); 
                        }} 
                        defaultValue={field.value}
                        disabled={isSubmitting || isLoadingCategories}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select a main category"} />
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
                        <FormLabel className="flex items-center"><ListTree className="h-4 w-4 mr-1"/>Subcategory</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value === NO_SUBCATEGORY_VALUE ? '' : value);
                          }}
                          value={field.value || NO_SUBCATEGORY_VALUE} 
                          disabled={isSubmitting || isLoadingCategories}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={`Select subcategory for ${selectedMainCategory.name}`} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={NO_SUBCATEGORY_VALUE}>No subcategory / General</SelectItem>
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
                    <FormLabel className="flex items-center"><Upload className="h-4 w-4 mr-1"/>Upload Images</FormLabel>
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
                    <FormDescription>You can upload multiple images (upload to server not yet implemented).</FormDescription>
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit for Review'
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
    
