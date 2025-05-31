
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { useState, useEffect } from 'react';

const translations = {
  en: {
    titleLine1: "Post your ad & Pay",
    titleLine2: "later with Valu",
    description: "Reach millions of buyers and sell faster.",
    postAdButton: "Post Your Ad Now",
    valuText: "VALU*",
    valuAlt: "Valu promotion"
  },
  ar: {
    titleLine1: "أضف إعلانك وادفع",
    titleLine2: "لاحقاً مع ڤاليو",
    description: "صل إلى ملايين المشترين وقم بالبيع بشكل أسرع.",
    postAdButton: "أضف إعلانك الآن",
    valuText: "ڤاليو*",
    valuAlt: "عرض ڤاليو"
  }
};

const slideImages = [
  { src: "https://placehold.co/400x400.png", alt: "Valu promotion image 1", hint: "phone payment" },
  { src: "https://placehold.co/400x400.png", alt: "Valu promotion image 2", hint: "online shopping" },
  { src: "https://placehold.co/400x400.png", alt: "Valu promotion image 3", hint: "easy transaction" },
];

const SLIDESHOW_INTERVAL = 3000; // 3 seconds

export function HeroBanner() {
  const { language } = useLanguage();
  const t = translations[language];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === slideImages.length - 1 ? 0 : prevIndex + 1
      );
    }, SLIDESHOW_INTERVAL);
    return () => clearInterval(timer); // Cleanup on component unmount
  }, []);

  const currentImage = slideImages[currentImageIndex];

  return (
    <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-teal-500 text-white py-10 md:py-16 px-6 rounded-lg overflow-hidden shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between z-10">
        <div className={`md:w-1/2 mb-8 md:mb-0 ${language === 'ar' ? 'text-center md:text-right' : 'text-center md:text-left'}`}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {t.titleLine1} <br className="hidden sm:inline"/>{t.titleLine2}
          </h1>
          <p className="text-lg md:text-xl mb-6 opacity-90">
            {t.description}
          </p>
          <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 font-semibold" asChild>
            <Link href="/listings/new">{t.postAdButton}</Link>
          </Button>
        </div>
        <div className="md:w-1/2 flex justify-center md:justify-end items-center">
          <div className="relative w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80">
            <Image 
              key={currentImage.src} // Add key to force re-render for fade effect if CSS added later
              src={currentImage.src}
              alt={currentImage.alt}
              layout="fill"
              objectFit="contain"
              data-ai-hint={currentImage.hint}
              className="transition-opacity duration-500 ease-in-out" // Basic fade (won't work well without more complex handling)
            />
             <span className={`absolute bottom-4 ${language === 'ar' ? 'left-4' : 'right-4'} text-4xl font-bold text-white bg-teal-600 px-3 py-1 rounded`} style={{fontFamily: "'Arial Black', Gadget, sans-serif"}}>
              {t.valuText}
            </span>
          </div>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full transform translate-x-1/3 translate-y-1/3"></div>
    </div>
  );
}
