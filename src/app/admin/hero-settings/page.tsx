
// src/app/admin/hero-settings/page.tsx
'use client';

import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import type { HeroBannerImage } from '@/lib/types';
import { db, storage } from '@/lib/firebase'; // Added storage
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'; // Firebase storage imports
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, setDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Loader2, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { Progress } from '@/components/ui/progress'; // Added Progress component

const translations = {
  en: {
    pageTitle: "Hero Banner Settings",
    pageDescription: "Manage the images displayed in the homepage hero banner. Upload images directly.",
    currentImagesTitle: "Current Banner Images",
    noImagesYet: "No images have been added to the hero banner yet.",
    uploadNewImageTitle: "Upload New Image",
    imageFileLabel: "Image File",
    selectImageButton: "Select Image...",
    altTextLabel: "Alt Text (for accessibility)",
    altTextPlaceholder: "e.g., Woman shopping online",
    addImageButton: "Upload & Add Image",
    uploadingButton: "Uploading...",
    deleteImageSr: "Delete Image",
    loadingImages: "Loading hero images...",
    successTitle: "Success",
    errorTitle: "Error",
    imageAddedSuccess: "Image uploaded and added to hero banner.",
    couldNotAddImageError: "Could not upload or add image.",
    imageDeletedSuccess: "Image removed from hero banner.",
    couldNotDeleteImageError: "Could not delete image.",
    fileRequiredError: "Please select an image file.",
    altRequiredError: "Alt text cannot be empty.",
    maxImagesReached: "Maximum of 5 hero banner images reached. Delete one to add another.",
    errorLoadingHeroImages: "Could not load hero banner images.",
    imageNotFoundForDeletion: "Image not found for deletion.",
    uploadProgress: (progress: number) => `Uploading: ${progress.toFixed(0)}%`,
    errorDeletingStorageImage: "Could not delete image from storage, but removed from banner list.",
  },
  ar: {
    pageTitle: "إعدادات بانر الصفحة الرئيسية",
    pageDescription: "إدارة الصور المعروضة في بانر الصفحة الرئيسية. قم بتحميل الصور مباشرة.",
    currentImagesTitle: "صور البانر الحالية",
    noImagesYet: "لم تتم إضافة أي صور إلى بانر الصفحة الرئيسية بعد.",
    uploadNewImageTitle: "تحميل صورة جديدة",
    imageFileLabel: "ملف الصورة",
    selectImageButton: "اختر صورة...",
    altTextLabel: "النص البديل (لإمكانية الوصول)",
    altTextPlaceholder: "مثال: امرأة تتسوق عبر الإنترنت",
    addImageButton: "تحميل وإضافة الصورة",
    uploadingButton: "جار التحميل...",
    deleteImageSr: "حذف الصورة",
    loadingImages: "جار تحميل صور البانر...",
    successTitle: "نجاح",
    errorTitle: "خطأ",
    imageAddedSuccess: "تم تحميل الصورة وإضافتها إلى بانر الصفحة الرئيسية.",
    couldNotAddImageError: "تعذر تحميل أو إضافة الصورة.",
    imageDeletedSuccess: "تمت إزالة الصورة من بانر الصفحة الرئيسية.",
    couldNotDeleteImageError: "تعذر حذف الصورة.",
    fileRequiredError: "الرجاء تحديد ملف صورة.",
    altRequiredError: "لا يمكن أن يكون النص البديل فارغًا.",
    maxImagesReached: "تم الوصول إلى الحد الأقصى لعدد 5 صور لبانر الصفحة الرئيسية. احذف واحدة لإضافة أخرى.",
    errorLoadingHeroImages: "تعذر تحميل صور بانر الصفحة الرئيسية.",
    imageNotFoundForDeletion: "الصورة غير موجودة للحذف.",
    uploadProgress: (progress: number) => `جار التحميل: ${progress.toFixed(0)}%`,
    errorDeletingStorageImage: "تعذر حذف الصورة من التخزين، ولكن تمت إزالتها من قائمة البانر.",
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

  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImageAlt, setNewImageAlt] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    const heroDocRef = doc(db, HERO_BANNER_DOC_PATH);
    const unsubscribe = onSnapshot(heroDocRef, (docSnapshot) => {
      let validImages: HeroBannerImage[] = [];
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const fetchedImages = data?.images as HeroBannerImage[] | undefined;
        if (fetchedImages && fetchedImages.length > 0) {
          // Filter out images with empty or whitespace-only src
          validImages = fetchedImages.filter(img => img.src && img.src.trim() !== '');
        }
      }
      setBannerImages(validImages);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching hero images: ", error);
      toast({ title: t.errorTitle, description: t.errorLoadingHeroImages, variant: "destructive" });
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [toast, t]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNewImageFile(event.target.files[0]);
    } else {
      setNewImageFile(null);
    }
  };

  const handleImageUploadAndAdd = async () => {
    if (!newImageFile) {
      toast({ title: t.errorTitle, description: t.fileRequiredError, variant: "destructive" });
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
    setUploadProgress(0);

    const fileRef = storageRef(storage, `hero-banners/${Date.now()}-${newImageFile.name}`);
    const uploadTask = uploadBytesResumable(fileRef, newImageFile);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        toast({ title: t.errorTitle, description: t.couldNotAddImageError, variant: "destructive" });
        setIsSubmitting(false);
        setUploadProgress(0);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const heroDocRef = doc(db, HERO_BANNER_DOC_PATH);
          const newImage: HeroBannerImage = {
            id: Date.now().toString(),
            src: downloadURL,
            alt: newImageAlt.trim(),
            uploadedAt: new Date().toISOString(),
          };

          const docSnap = await getDoc(heroDocRef);
          if (!docSnap.exists()) {
            await setDoc(heroDocRef, { images: [newImage] });
          } else {
            await updateDoc(heroDocRef, {
              images: arrayUnion(newImage)
            });
          }
          toast({ title: t.successTitle, description: t.imageAddedSuccess });
          setNewImageFile(null);
          // @ts-ignore
          document.getElementById('newImageFile').value = ''; // Reset file input
          setNewImageAlt('');
        } catch (error) {
          console.error("Error adding image URL to Firestore: ", error);
          toast({ title: t.errorTitle, description: t.couldNotAddImageError, variant: "destructive" });
        } finally {
          setIsSubmitting(false);
          setUploadProgress(0);
        }
      }
    );
  };

  const handleDeleteImage = async (imageId: string) => {
    setIsSubmitting(true);
    const heroDocRef = doc(db, HERO_BANNER_DOC_PATH);
    const imageToDelete = bannerImages.find(img => img.id === imageId);

    if (!imageToDelete) {
        toast({ title: t.errorTitle, description: t.imageNotFoundForDeletion, variant: "destructive" });
        setIsSubmitting(false);
        return;
    }
    try {
      // Attempt to delete from Firebase Storage
      try {
        const imageStorageRef = storageRef(storage, imageToDelete.src); // imageToDelete.src is the download URL
        await deleteObject(imageStorageRef);
      } catch (storageError: any) {
        // Log storage deletion error but continue to remove from Firestore list
        console.warn("Could not delete image from Firebase Storage:", storageError);
        // Optionally, inform user if storage deletion failed but list item was removed
        if (storageError.code !== 'storage/object-not-found') { // Don't show toast if file already not found in storage
            toast({ title: t.errorTitle, description: t.errorDeletingStorageImage, variant: "warning", duration: 7000 });
        }
      }

      await updateDoc(heroDocRef, {
        images: arrayRemove(imageToDelete)
      });
      toast({ title: t.successTitle, description: t.imageDeletedSuccess });
    } catch (error) {
      console.error("Error deleting image from Firestore: ", error);
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
          <CardTitle>{t.uploadNewImageTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="newImageFile">{t.imageFileLabel}</Label>
            <Input
              id="newImageFile"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isSubmitting || bannerImages.length >= MAX_IMAGES}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
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
          {isSubmitting && uploadProgress > 0 && (
            <div className="space-y-1">
              <Progress value={uploadProgress} className="w-full h-2" />
              <p className="text-sm text-muted-foreground">{t.uploadProgress(uploadProgress)}</p>
            </div>
          )}
          <Button onClick={handleImageUploadAndAdd} disabled={isSubmitting || !newImageFile || !newImageAlt.trim() || bannerImages.length >= MAX_IMAGES} className="w-full sm:w-auto">
            {isSubmitting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <UploadCloud className="me-2 h-4 w-4" />}
            {isSubmitting ? t.uploadingButton : t.addImageButton}
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
                    data-ai-hint="banner image"
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

