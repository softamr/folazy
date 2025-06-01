
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
      src="https://ik.imagekit.io/rmlbayysp/1748766720305-F_UNwauBSrf.png"
      alt="Fwlazy Logo"
      width={120} // Adjust as needed based on your logo's aspect ratio
      height={32}  // Adjust as needed
      priority // If the logo is above the fold, consider adding priority
      data-ai-hint="logo brand"
    />
  );
}
