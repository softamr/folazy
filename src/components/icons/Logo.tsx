
'use client';

import Image from 'next/image';

/**
 * Logo Component
 * 
 * Renders the Fwlazy logo using an image from an external URL.
 */
export function Logo() {
  return (
    <Image
      src="https://ik.imagekit.io/rmlbayysp/1748777133513-Capture-removebg-preview_f_5E1yhKE.svg"
      alt="Fwlazy Logo"
      width={72} // Adjusted from 90
      height={19}  // Adjusted from 24
      priority // If the logo is above the fold, consider adding priority
      data-ai-hint="logo brand"
    />
  );
}
