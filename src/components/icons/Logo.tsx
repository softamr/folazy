
'use client';

import Image from 'next/image';

/**
 * Logo Component
 * 
 * Renders the Fwlazy logo.
 * 
 * IMPORTANT: 
 * The logo image is expected to be located at `/images/logo-new.png` 
 * within the `public` directory. Please download your logo from Canva
 * (https://www.canva.com/design/DAGpGcwV590/HYX9rTYuIOXQYBIGcDKPQQ/view)
 * and place it there. You may need to adjust the `width` and `height` props
 * below to match your logo's aspect ratio and desired display size.
 */
export function Logo() {
  return (
    <Image
      src="/images/logo-new.png" // User needs to place their downloaded logo here
      alt="Fwlazy Logo"
      width={120} // Adjust as needed based on your logo's aspect ratio
      height={32}  // Kept similar to the old logo's height
      priority // If the logo is above the fold, consider adding priority
      data-ai-hint="logo brand"
    />
  );
}
