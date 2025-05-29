
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
import { placeholderCategories } from '@/lib/placeholder-data';
import type { Category, ListingStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageAnalysisTool } from './ImageAnalysisTool';
import { Upload, DollarSign, MapPinIcon, TagIcon, ListTree } from 'lucide-react';
import { useState, useEffect } from 'react';

const listingFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be 100 characters or less'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000, 'Description must be 1000 characters or less'),
  price: z.coerce.number().positive('Price must be a positive number'),
  categoryId: z.string().min(1, 'Please select a category'),
  subcategoryId: z.string().optional(),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  images: z.any().optional(),
  status: z.custom<ListingStatus>().default('pending'), // Added status field
});

type ListingFormValues = z.infer<typeof listingFormSchema>;

const defaultValues: Partial<ListingFormValues> = {
  title: '',
  description: '',
  price: '', // Changed from undefined to empty string
  categoryId: '',
  subcategoryId: '',
  location: '',
  status: 'pending', // Default status for new listings
};

const NO_SUBCATEGORY_VALUE = "_none_"; // Define a constant for the "no subcategory" option

export function ListingForm() {
  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);

  const watchedCategoryId = form.watch('categoryId');

  useEffect(() => {
    if (watchedCategoryId) {
      const category = placeholderCategories.find(cat => cat.id === watchedCategoryId);
      setSelectedCategory(category || null);
      setSubcategories(category?.subcategories || []);
      // Reset subcategory if the current one isn't valid for the new main category
      const currentSubcategoryId = form.getValues('subcategoryId');
      if (currentSubcategoryId && !category?.subcategories?.find(sc => sc.id === currentSubcategoryId)) {
        form.setValue('subcategoryId', ''); 
      }
    } else {
      setSelectedCategory(null);
      setSubcategories([]);
    }
  }, [watchedCategoryId, form]);

  function onSubmit(data: ListingFormValues) {
    const submissionData = {
      ...data,
      // Ensure subcategoryId is an empty string if NO_SUBCATEGORY_VALUE was the placeholder
      subcategoryId: data.subcategoryId === NO_SUBCATEGORY_VALUE ? '' : data.subcategoryId,
      status: 'pending'
    };
    console.log('Form submitted:', submissionData); 
    alert('Listing submitted for review! (Check console for data)');
    form.reset();
    setImagePreviews([]);
    setSelectedCategory(null);
    setSubcategories([]);
  }
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      // Free up memory from previous previews
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
                      <Input placeholder="e.g., Vintage Leather Jacket" {...field} />
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
                        <Input type="number" placeholder="e.g., 50.00" {...field} />
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
                        <Input placeholder="e.g., City, State" {...field} />
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
                          form.setValue('subcategoryId', ''); // Reset subcategory when main category changes
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a main category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {placeholderCategories.map((cat) => (
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
                {selectedCategory && subcategories.length > 0 && (
                  <FormField
                    control={form.control}
                    name="subcategoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><ListTree className="h-4 w-4 mr-1"/>Subcategory</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            // If "No subcategory" is selected, store an empty string in the form
                            // Otherwise, store the actual subcategory ID
                            field.onChange(value === NO_SUBCATEGORY_VALUE ? '' : value);
                          }}
                          // If field.value is empty (no subcategory selected), use NO_SUBCATEGORY_VALUE for Select's value
                          // to show "No subcategory / General" as selected. Otherwise, use the actual field.value.
                          value={field.value || NO_SUBCATEGORY_VALUE}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={`Select subcategory for ${selectedCategory.name}`} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={NO_SUBCATEGORY_VALUE}>No subcategory / General</SelectItem>
                            {subcategories.map((subcat) => (
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
                        // Remove value from controlled file input
                        // value={undefined} 
                        className="file:text-sm file:font-medium"
                      />
                    </FormControl>
                    <FormDescription>You can upload multiple images.</FormDescription>
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

              <Button type="submit" className="w-full sm:w-auto" size="lg">Submit for Review</Button>
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
