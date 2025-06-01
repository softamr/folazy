
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  const boxSize = 26; // Size of the square box
  const spaceBetweenBoxAndText = 8;
  const textFontSize = 20; // Font size for "wlazy"
  // const textYPosition = 21; // Original Y position, will be replaced by svgHeight / 2

  // Estimate width for "wlazy" text.
  // For fontSize 20, "wlazy" is roughly 60-70px.
  // Total width: box_X_offset + boxSize + spaceBetweenBoxAndText + textWidth_estimate
  // Let box X offset be (svgHeight - boxSize) / 2 = (32-26)/2 = 3
  const svgHeight = 32;
  const boxXOffset = (svgHeight - boxSize) / 2;
  const textXPosition = boxXOffset + boxSize + spaceBetweenBoxAndText;
  const estimatedTextWidth = 65; // Approximate width for "wlazy"
  const svgWidth = textXPosition + estimatedTextWidth + boxXOffset; // Added right padding similar to left

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      width={svgWidth}
      height={svgHeight}
      aria-label="Fwlazy Logo"
      {...props}
    >
      {/* Red Box */}
      <rect
        x={boxXOffset} // Use calculated offset for left padding
        y={(svgHeight - boxSize) / 2}
        width={boxSize}
        height={boxSize}
        rx="4" // Rounded corners
        fill="hsl(var(--primary))" // Red color from theme
      />
      {/* Letter "F" inside the box */}
      <text
        x={boxXOffset + (boxSize / 2)} // Center of the box
        y={svgHeight / 2} // Center of the box
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="var(--font-geist-sans), Arial, sans-serif"
        fontSize="16" // Adjusted for 26x26 box
        fontWeight="bold"
        fill="hsl(var(--primary-foreground))" // White text from theme
        style={{ direction: 'ltr', unicodeBidi: 'embed' }}
      >
        F
      </text>
      {/* Text "wlazy" */}
      <text
        x={textXPosition}
        y={svgHeight / 2} // Align to vertical center of SVG
        dominantBaseline="middle" // Ensure text aligns from its middle
        fontFamily="var(--font-geist-sans), Arial, sans-serif"
        fontSize={textFontSize}
        fontWeight="bold"
        fill="hsl(var(--foreground))"
        style={{ direction: 'ltr', unicodeBidi: 'embed' }}
      >
        wlazy
      </text>
    </svg>
  );
}
