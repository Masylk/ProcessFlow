import React, { useEffect } from "react";
import { useIconToken, useTheme } from "@/app/theme/hooks";

const svgCache = new Map<string, string>();

const fetchSvg = async (url: string): Promise<string> => {
  if (svgCache.has(url)) {
    return svgCache.get(url) || '';
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch SVG');
  }

  const svgText = await response.text();
  
  // Don't add transition here, we'll control it via a wrapper
  svgCache.set(url, svgText);
  return svgText;
};

type IconVariant = 'default' | 'primary' | 'secondary' | 'tertiary' | 'tertiary-color' | 'success' | 'warning' | 'error' | 'info';

interface DynamicIconProps {
  url: string;
  color?: string;
  size?: number;
  variant?: IconVariant;
  className?: string;
  isHovered?: boolean; // Accept hover state from parent
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

// Icon component that fetches and caches SVGs dynamically
const DynamicIcon: React.FC<DynamicIconProps> = ({
  url,
  color,
  size = 24,
  variant = 'default',
  className = '',
  isHovered = false,
  referrerPolicy,
}) => {
  const [svgContent, setSvgContent] = React.useState<string | null>(null);
  const { getCssVariable } = useTheme();
  
  // If BrandFetch or PNG, render <img> directly
  if (url.startsWith('https://cdn.brandfetch.io/') || url.toLowerCase().endsWith('.png')) {
    return (
      <img
        src={url}
        alt="Icon"
        className={className}
        width={size}
        height={size}
        referrerPolicy={referrerPolicy || "strict-origin-when-cross-origin"}
      />
    );
  }
  
  // Get color based on variant type - for button-related variants, use button tokens
  const getColorForVariant = (variant: IconVariant, isHover: boolean): string => {
    // If custom color is provided, use it
    if (color) return color;
    
    // For tertiary and tertiary-color variants, use button tokens
    if (variant === 'tertiary') {
      return getCssVariable(isHover ? 'button-tertiary-fg-hover' : 'button-tertiary-fg');
    }
    
    if (variant === 'tertiary-color') {
      return getCssVariable(isHover ? 'button-tertiary-color-fg-hover' : 'button-tertiary-color-fg');
    }
    
    // Otherwise use icon tokens
    return getCssVariable(`icon-${variant}${isHover ? '-hover' : ''}` as any);
  };
  
  // Determine colors based on hover state
  const normalColor = getColorForVariant(variant, false);
  const hoverColor = getColorForVariant(variant, true);
  
  // Use the hover state directly from props without internal state management
  // This ensures closer timing with the parent button's hover state

  // Get processed SVG with colors applied
  const coloredSvg = React.useMemo(() => {
    if (!svgContent) return null;
    
    // If color is 'inherit', preserve original SVG colors
    if (color === 'inherit') return svgContent;
    
    return svgContent
      .replace(/stroke="([^"]+)"/g, (match, value) => {
        // Preserve special values
        if (value === 'none' || value.includes('url(') || value.includes('gradient')) {
          return match;
        }
        return `stroke="currentColor"`;
      })
      .replace(/fill="([^"]+)"/g, (match, value) => {
        // Preserve special values
        if (value === 'none' || value.includes('url(') || value.includes('gradient')) {
          return match;
        }
        return `fill="currentColor"`;
      });
  }, [svgContent, color]);

  useEffect(() => {
    fetchSvg(url)
      .then((svg) => setSvgContent(svg))
      .catch(console.error);
  }, [url]);

  if (!coloredSvg) {
    return <span style={{ width: size, height: size }} />; // Placeholder
  }

  return (
    <span
      className={`inline-svg ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        color: isHovered ? hoverColor : normalColor,
        transition: 'none !important',
        pointerEvents: 'none',
      } as React.CSSProperties}
      dangerouslySetInnerHTML={{ __html: coloredSvg
        .replace('<svg', `<svg width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"`)
      }}
    />
  );
};

export default DynamicIcon;
