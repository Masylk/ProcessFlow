import React, { useEffect } from "react";

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
  svgCache.set(url, svgText);
  return svgText;
};

// Icon component that fetches and caches SVGs dynamically
const DynamicIcon = ({
  url,
  color = 'currentColor',
  size = 24,
}: {
  url: string;
  color?: string;
  size?: number;
}) => {
  const [svgContent, setSvgContent] = React.useState<string | null>(null);

  useEffect(() => {
    fetchSvg(url)
      .then((svg) =>
        setSvgContent(
          svg
            .replace(/stroke=".*?"/g, `stroke="${color}"`) // Corrected string template
        )
      )
      .catch(console.error);
  }, [url, color]);

  return svgContent ? (
    <span
      className="inline-svg"
      style={{ display: 'inline-block', width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  ) : (
    <span style={{ width: size, height: size }} /> // Placeholder
  );
};

export default DynamicIcon;
