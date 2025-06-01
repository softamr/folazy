
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext'; // Updated import path
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
  },
  ar: {
    titleLine1: "اكتشف عروضاً مذهلة",
    titleLine2: "على فولاذي",
    description: "تصفح آلاف الإعلانات من البائعين بالقرب منك. اعثر على ما تبحث عنه اليوم!",
    postAdButton: "أضف إعلانك الآن",
    loadingImages: "جار تحميل البانر...",
    noImagesConfigured: "أهلاً بك في فولاذي!",
  }
};

const SLIDESHOW_INTERVAL = 5000; // 5 seconds
const HERO_BANNER_DOC_PATH = 'siteSettings/heroBanner';

// Default images if Firestore has none or errors out - use full size placeholders
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
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const fetchedImages = data?.images as HeroBannerImage[];
        if (fetchedImages && fetchedImages.length > 0) {
          setImagesToDisplay(fetchedImages);
        } else {
          setImagesToDisplay(defaultSlideImages);
        }
      } else {
        setImagesToDisplay(defaultSlideImages);
      }
      setIsLoadingBanner(false);
    }, (error) => {
      console.error("Error fetching hero banner images:", error);
      setImagesToDisplay(defaultSlideImages);
      setIsLoadingBanner(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (imagesToDisplay.length > 1) { // Only run interval if there's more than one image
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
              alt={image.alt || 'Promotional banner image'}
              layout="fill"
              objectFit="cover"
              priority={index === 0} // Prioritize loading the first image
              data-ai-hint={image['data-ai-hint'] || "hero background"}
            />
            <div className="absolute inset-0 bg-black/40"></div> {/* Dark overlay for text readability */}
          </div>
        ))
      ) : (
         <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-accent flex items-center justify-center z-0">
           <p className="text-lg">{t.noImagesConfigured}</p>
         </div>
      )}

      <div className="relative z-10 container mx-auto flex flex-col items-center text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight shadow-text-md">
          {t.titleLine1} <br className="hidden sm:inline" />
          {t.titleLine2}
        </h1>
        <p className="text-lg md:text-xl mb-8 opacity-95 max-w-2xl shadow-text-sm">
          {t.description}
        </p>
        <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold py-3 px-8 text-lg shadow-lg" asChild>
          <Link href="/listings/new">{t.postAdButton}</Link>
        </Button>
      </div>
      
      {/* Inline styles for text shadow, consider moving to globals.css if used elsewhere */}
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
