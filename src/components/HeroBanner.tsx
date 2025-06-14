
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import type { HeroBannerImage } from '@/lib/types';
import { cn } from '@/lib/utils';

const translations = {
  en: {
    titleLine1: "Discover Amazing Deals",
    titleLine2: "On Fwlazy",
    description: "Explore thousands of listings from sellers near you. Find what you're looking for today!",
    postAdButton: "Post Your Ad Now",
    loadingImages: "Loading banner...",
    noImagesConfigured: "Welcome to Fwlazy!",
    promoBannerAltFallback: "Promotional banner image",
  },
  ar: {
    titleLine1: "اكتشف عروضاً مذهلة",
    titleLine2: "على فولاذي",
    description: "تصفح آلاف الإعلانات من البائعين بالقرب منك. اعثر على ما تبحث عنه اليوم!",
    postAdButton: "أضف إعلانك الآن",
    loadingImages: "جار تحميل البانر...",
    noImagesConfigured: "أهلاً بك في فولاذي!",
    promoBannerAltFallback: "صورة بانر ترويجية",
  }
};

const SLIDESHOW_INTERVAL = 5000;
const HERO_BANNER_DOC_PATH = 'siteSettings/heroBanner';

const defaultSlideImages: HeroBannerImage[] = [
  { id: 'default1', src: "https://placehold.co/1200x500.png", alt: "Fwlazy Promotion 1", uploadedAt: '', 'data-ai-hint': 'promotion marketing' },
  { id: 'default2', src: "https://placehold.co/1200x500.png", alt: "Fwlazy Promotion 2", uploadedAt: '', 'data-ai-hint': 'community sale' },
  { id: 'default3', src: "https://placehold.co/1200x500.png", alt: "Fwlazy Promotion 3", uploadedAt: '', 'data-ai-hint': 'online shopping' },
];

export function HeroBanner() {
  const { language } = useLanguage();
  const t = translations[language];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesToDisplay, setImagesToDisplay] = useState<HeroBannerImage[]>([]);
  const [isLoadingBanner, setIsLoadingBanner] = useState(true);

  useEffect(() => {
    setIsLoadingBanner(true);
    const heroDocRef = doc(db, HERO_BANNER_DOC_PATH);
    const unsubscribe = onSnapshot(heroDocRef, (docSnapshot) => {
      let validImages: HeroBannerImage[] = [];
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const fetchedImages = data?.images as HeroBannerImage[] | undefined; 
        if (fetchedImages && fetchedImages.length > 0) {
          validImages = fetchedImages.filter(img => img.src && img.src.trim() !== '');
        }
      }

      if (validImages.length > 0) {
        setImagesToDisplay(validImages);
      } else {
        setImagesToDisplay(defaultSlideImages.map(img => ({...img, alt: t.promoBannerAltFallback})));
      }
      setCurrentImageIndex(0); 
      setIsLoadingBanner(false);
    }, (error) => {
      console.error("Error fetching hero banner images:", error);
      setImagesToDisplay(defaultSlideImages.map(img => ({...img, alt: t.promoBannerAltFallback})));
      setIsLoadingBanner(false);
    });
    return () => unsubscribe();
  }, [t.promoBannerAltFallback]);

  useEffect(() => {
    if (imagesToDisplay.length > 1) {
      const timer = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === imagesToDisplay.length - 1 ? 0 : prevIndex + 1
        );
      }, SLIDESHOW_INTERVAL);
      return () => clearInterval(timer);
    }
  }, [imagesToDisplay]);

  return (
    <div className="relative bg-muted text-white py-16 md:py-24 px-6 rounded-lg overflow-hidden shadow-lg min-h-[400px] md:min-h-[500px] flex flex-col justify-center items-center">
      {isLoadingBanner ? (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center z-0">
          <p className="text-lg">{t.loadingImages}</p>
        </div>
      ) : imagesToDisplay.length > 0 ? (
        imagesToDisplay.map((image, index) => (
          <div
            key={image.id || image.src} 
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out z-0",
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            )}
          >
            <Image
              src={image.src} 
              alt={image.alt || t.promoBannerAltFallback}
              layout="fill"
              objectFit="cover"
              priority={index === 0}
              data-ai-hint={image['data-ai-hint'] || "hero background"}
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        ))
      ) : (
         <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-accent flex items-center justify-center z-0">
           <p className="text-lg">{t.noImagesConfigured}</p>
         </div>
      )}

      <div className={cn(
          "relative z-10 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl", // Constrain width of the content block
          "flex flex-col", // Stack content vertically
          language === 'ar' ? "items-start text-start" : "items-end text-end" // Text alignment within this block
        )}
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 leading-tight shadow-text-md">
          {t.titleLine1} <br className="hidden sm:inline" />
          {t.titleLine2}
        </h1>
        <p className="text-md sm:text-lg mb-8 opacity-95 max-w-2xl shadow-text-sm">
          {t.description}
        </p>
        <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold py-3 px-8 text-lg shadow-lg" asChild>
          <Link href="/listings/new">{t.postAdButton}</Link>
        </Button>
      </div>
      
      <style jsx global>{`
        .shadow-text-sm {
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }
        .shadow-text-md {
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
}

