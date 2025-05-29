import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 220 60" // Increased viewBox for two lines
      width="120" // Adjusted width
      height="32.7" // Adjusted height for aspect ratio
      aria-label="Dubizzle Logo"
      {...props}
    >
      {/* Transparent background */}
      {/* <rect width="220" height="60" rx="5" fill="transparent" /> */}
      <text
        x="5" // Start from left
        y="30" // Position for "dubizzle"
        fontFamily="var(--font-geist-sans), Arial, sans-serif"
        fontSize="28" // Larger font size for "dubizzle"
        fontWeight="bold"
        fill="hsl(var(--foreground))" // Use foreground color for text
        textAnchor="start"
      >
        dubizzle
      </text>
      <text
        x="5" // Start from left
        y="50" // Position for "formerly OLX"
        fontFamily="var(--font-geist-sans), Arial, sans-serif"
        fontSize="12" // Smaller font size
        fill="hsl(var(--muted-foreground))" // Muted color
        textAnchor="start"
      >
        formerly OLX
      </text>
    </svg>
  );
}
