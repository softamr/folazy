
// src/app/admin/hero-settings/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { HeroBannerImage } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, setDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Loader2, Image as ImageIcon, Link as LinkIcon, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useLanguage } from '@/hooks/useLanguage';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const translations = {
  en: {
    pageTitle: "Hero Banner Settings",
    pageDescription: "Manage the images displayed in the homepage hero banner.",
    currentImagesTitle: "Current Banner Images",
    noImagesYet: "No images have been added to the hero banner yet.",
    addImageByUrlTitle: "Add New Image by URL",
    imageUrlLabel: "Image URL",
    imageUrlPlaceholder: "https://example.com/image.png or gs://bucket/path/to/image.png",
    altTextLabel: "Alt Text (for accessibility)",
    altTextPlaceholder: "e.g., Woman shopping online",
    addImageButton: "Add Image",
    deleteImageSr: "Delete Image",
    loadingImages: "Loading hero images...",
    successTitle: "Success",
    errorTitle: "Error",
    imageAddedSuccess: "Image added to hero banner.",
    couldNotAddImageError: "Could not add image. Ensure URL is valid.",
    imageDeletedSuccess: "Image removed from hero banner.",
    couldNotDeleteImageError: "Could not delete image.",
    urlRequiredError: "Image URL cannot be empty.",
    altRequiredError: "Alt text cannot be empty.",
    maxImagesReached: "Maximum of 5 hero banner images reached. Delete one to add another.",
    uploadNoteTitle: "Note on Image Uploads:",
    uploadNoteDescription: "Currently, images are added by URL. For direct file uploads, integrate Firebase Storage: upload the file, get its download URL, then add it here. This feature is planned for future enhancement.",
  },
  ar: {
    pageTitle: "إعدادات بانر الصفحة الرئيسية",
    pageDescription: "إدارة الصور المعروضة في بانر الصفحة الرئيسية.",
    currentImagesTitle: "صور البانر الحالية",
    noImagesYet: "لم تتم إضافة أي صور إلى بانر الصفحة الرئيسية بعد.",
    addImageByUrlTitle: "إضافة صورة جديدة بواسطة الرابط",
    imageUrlLabel: "رابط الصورة",
    imageUrlPlaceholder: "https://example.com/image.png أو gs://bucket/path/to/image.png",
    altTextLabel: "النص البديل (لإمكانية الوصول)",
    altTextPlaceholder: "مثال: امرأة تتسوق عبر الإنترنت",
    addImageButton: "إضافة صورة",
    deleteImageSr: "حذف الصورة",
    loadingImages: "جار تحميل صور البانر...",
    successTitle: "نجاح",
    errorTitle: "خطأ",
    imageAddedSuccess: "تمت إضافة الصورة إلى بانر الصفحة الرئيسية.",
    couldNotAddImageError: "تعذر إضافة الصورة. تأكد من أن الرابط صالح.",
    imageDeletedSuccess: "تمت إزالة الصورة من بانر الصفحة الرئيسية.",
    couldNotDeleteImageError: "تعذر حذف الصورة.",
    urlRequiredError: "لا يمكن أن يكون رابط الصورة فارغًا.",
    altRequiredError: "لا يمكن أن يكون النص البديل فارغًا.",
    maxImagesReached: "تم الوصول إلى الحد الأقصى لعدد 5 صور لبانر الصفحة الرئيسية. احذف واحدة لإضافة أخرى.",
    uploadNoteTitle: "ملاحظة حول تحميل الصور:",
    uploadNoteDescription: "حاليًا، تتم إضافة الصور عن طريق الرابط. لتحميل الملفات مباشرة، قم بدمج Firebase Storage: قم بتحميل الملف، واحصل على رابط التنزيل الخاص به، ثم أضفه هنا. من المخطط تحسين هذه الميزة في المستقبل.",
  }
};

const HERO_BANNER_DOC_PATH = 'siteSettings/heroBanner';
const MAX_IMAGES = 5;

export default function HeroSettingsPage() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];

  const [bannerImages, setBannerImages] = useState<HeroBannerImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');

  useEffect(() => {
    setIsLoading(true);
    const heroDocRef = doc(db, HERO_BANNER_DOC_PATH);
    const unsubscribe = onSnapshot(heroDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setBannerImages(docSnapshot.data()?.images || []);
      } else {
        setBannerImages([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching hero images: ", error);
      toast({ title: t.errorTitle, description: "Could not load hero banner images.", variant: "destructive" });
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [toast, t]);

  const handleAddImageUrl = async () => {
    if (!newImageUrl.trim()) {
      toast({ title: t.errorTitle, description: t.urlRequiredError, variant: "destructive" });
      return;
    }
    if (!newImageAlt.trim()) {
      toast({ title: t.errorTitle, description: t.altRequiredError, variant: "destructive" });
      return;
    }
    if (bannerImages.length >= MAX_IMAGES) {
      toast({ title: t.errorTitle, description: t.maxImagesReached, variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const heroDocRef = doc(db, HERO_BANNER_DOC_PATH);
    const newImage: HeroBannerImage = {
      id: Date.now().toString(), // Simple unique ID
      src: newImageUrl.trim(),
      alt: newImageAlt.trim(),
      uploadedAt: new Date().toISOString(),
    };

    try {
      // Ensure document exists before trying to update with arrayUnion
      const docSnap = await getDoc(heroDocRef);
      if (!docSnap.exists()) {
        await setDoc(heroDocRef, { images: [newImage] });
      } else {
        await updateDoc(heroDocRef, {
          images: arrayUnion(newImage)
        });
      }
      toast({ title: t.successTitle, description: t.imageAddedSuccess });
      setNewImageUrl('');
      setNewImageAlt('');
    } catch (error) {
      console.error("Error adding image URL: ", error);
      toast({ title: t.errorTitle, description: t.couldNotAddImageError, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    setIsSubmitting(true);
    const heroDocRef = doc(db, HERO_BANNER_DOC_PATH);
    const imageToDelete = bannerImages.find(img => img.id === imageId);

    if (!imageToDelete) {
        toast({ title: t.errorTitle, description: "Image not found for deletion.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }
    try {
      await updateDoc(heroDocRef, {
        images: arrayRemove(imageToDelete)
      });
      toast({ title: t.successTitle, description: t.imageDeletedSuccess });
    } catch (error) {
      console.error("Error deleting image: ", error);
      toast({ title: t.errorTitle, description: t.couldNotDeleteImageError, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{t.loadingImages}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center"><ImageIcon className="me-2 h-7 w-7"/>{t.pageTitle}</h1>
          <p className="text-muted-foreground">{t.pageDescription}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.addImageByUrlTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <Alert variant="default" className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700">
                <LinkIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-700 dark:text-blue-300">{t.uploadNoteTitle}</AlertTitle>
                <AlertDescription className="text-blue-600 dark:text-blue-400 text-xs">
                    {t.uploadNoteDescription}
                </AlertDescription>
            </Alert>
          <div>
            <Label htmlFor="newImageUrl">{t.imageUrlLabel}</Label>
            <Input
              id="newImageUrl"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder={t.imageUrlPlaceholder}
              disabled={isSubmitting || bannerImages.length >= MAX_IMAGES}
            />
          </div>
           <div>
            <Label htmlFor="newImageAlt">{t.altTextLabel}</Label>
            <Input
              id="newImageAlt"
              value={newImageAlt}
              onChange={(e) => setNewImageAlt(e.target.value)}
              placeholder={t.altTextPlaceholder}
              disabled={isSubmitting || bannerImages.length >= MAX_IMAGES}
            />
          </div>
          <Button onClick={handleAddImageUrl} disabled={isSubmitting || !newImageUrl.trim() || !newImageAlt.trim() || bannerImages.length >= MAX_IMAGES} className="w-full sm:w-auto">
            {isSubmitting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <PlusCircle className="me-2 h-4 w-4" />}
            {t.addImageButton}
          </Button>
          {bannerImages.length >= MAX_IMAGES && (
            <p className="text-sm text-destructive">{t.maxImagesReached}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.currentImagesTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {bannerImages.length === 0 ? (
            <p className="text-muted-foreground">{t.noImagesYet}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {bannerImages.map((image) => (
                <Card key={image.id} className="group relative overflow-hidden">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={300}
                    height={200}
                    className="object-cover aspect-[3/2] w-full"
                    data-ai-hint="banner image" // Generic hint for admin uploaded images
                  />
                  <CardFooter className="p-2 bg-background/80 absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-between items-center">
                    <p className="text-xs text-muted-foreground truncate" title={image.alt}>{image.alt}</p>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteImage(image.id)}
                      disabled={isSubmitting}
                      className="h-7 w-7"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">{t.deleteImageSr}</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
