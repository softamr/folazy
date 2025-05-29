'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroBanner() {
  return (
    <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-teal-500 text-white py-10 md:py-16 px-6 rounded-lg overflow-hidden shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between z-10">
        <div className="md:w-1/2 mb-8 md:mb-0 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Post your ad & Pay <br className="hidden sm:inline"/>later with Valu
          </h1>
          <p className="text-lg md:text-xl mb-6 opacity-90">
            Reach millions of buyers and sell faster.
          </p>
          <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 font-semibold" asChild>
            <Link href="/listings/new">Post Your Ad Now</Link>
          </Button>
        </div>
        <div className="md:w-1/2 flex justify-center md:justify-end items-center">
          {/* Placeholder for phone image and Valu logo */}
          <div className="relative w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80">
            <Image 
              src="https://placehold.co/400x400.png" // Replace with actual illustrative image
              alt="Valu promotion"
              layout="fill"
              objectFit="contain"
              data-ai-hint="phone payment"
            />
             <span className="absolute bottom-4 right-4 text-4xl font-bold text-white bg-teal-600 px-3 py-1 rounded" style={{fontFamily: "'Arial Black', Gadget, sans-serif"}}>
              VALU*
            </span>
          </div>
        </div>
      </div>
      {/* Decorative elements (optional) */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full transform translate-x-1/3 translate-y-1/3"></div>
    </div>
  );
}
