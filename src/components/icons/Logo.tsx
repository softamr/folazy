import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  const boxSize = 26; // Size of the square box
  const spaceBetweenBoxAndText = 8;
  const textFontSize = 20; // Font size for "wlazy"
  const textYPosition = 21; // Vertical position for "wlazy"

  // Estimate width for "wlazy" text.
  // For fontSize 20, "wlazy" is roughly 60-70px.
  // Total width: box_X_offset + boxSize + spaceBetweenBoxAndText + textWidth_estimate
  // Let box X offset be (svgHeight - boxSize) / 2 = (32-26)/2 = 3
  const textXPosition = 3 + boxSize + spaceBetweenBoxAndText;
  const estimatedTextWidth = 65; // Approximate width for "wlazy"
  const svgWidth = textXPosition + estimatedTextWidth;
  const svgHeight = 32;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      width={svgWidth}
      height={svgHeight}
      aria-label="Fwlazy Logo" // Retaining as it represents the F from Fwlazy
      {...props}
    >
      {/* Red Box */}
      <rect
        x={(svgHeight - boxSize) / 2} // Center the box vertically
        y={(svgHeight - boxSize) / 2}
        width={boxSize}
        height={boxSize}
        rx="4" // Rounded corners
        fill="hsl(var(--primary))" // Red color from theme
      />
      {/* Letter "F" inside the box */}
      <text
        x={((svgHeight - boxSize) / 2) + (boxSize / 2)} // Center of the box
        y={svgHeight / 2} // Center of the box
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="var(--font-geist-sans), Arial, sans-serif"
        fontSize="16" // Adjusted for 26x26 box
        fontWeight="bold"
        fill="hsl(var(--primary-foreground))" // White text from theme
      >
        F
      </text>
      {/* Text "wlazy" */}
      <text
        x={textXPosition}
        y={textYPosition} // Vertically align
        fontFamily="var(--font-geist-sans), Arial, sans-serif"
        fontSize={textFontSize}
        fontWeight="bold"
        fill="hsl(var(--foreground))"
      >
        wlazy
      </text>
    </svg>
  );
}
