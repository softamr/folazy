import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 150 40" // Adjusted for single line "fwlazy"
      width="120" // Keep similar width
      height="32"  // Adjusted height for new aspect ratio (120 / (150/40))
      aria-label="Fwlazy Logo" // Updated aria-label
      {...props}
    >
      <text
        x="5" // Start from left
        y="30" // Adjusted y for positioning within new viewBox
        fontFamily="var(--font-geist-sans), Arial, sans-serif"
        fontSize="28" // Kept font size
        fontWeight="bold"
        fill="hsl(var(--foreground))"
        textAnchor="start"
      >
        fwlazy
      </text>
    </svg>
  );
}
