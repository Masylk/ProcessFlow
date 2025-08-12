import * as React from 'react';

type CustomFontProps = {
  fontFamily: string;
  fallbackFontFamily: string | string[];
  fontStyle?: string;
  fontWeight?: number | string;
  webFont?: {
    url: string;
    format: string;
  };
};

export const CustomFont: React.FC<CustomFontProps> = ({
  webFont,
  fontStyle = 'normal',
  fontFamily,
  fontWeight = 400,
  fallbackFontFamily,
}) => {
  const src = webFont ? `src: url(${webFont.url}) format(${webFont.format});` : "";
  const fallbackFonts = Array.isArray(fallbackFontFamily) 
    ? fallbackFontFamily.join(", ") 
    : fallbackFontFamily;
  const msoFontAlt = Array.isArray(fallbackFontFamily) 
    ? fallbackFontFamily[0] 
    : fallbackFontFamily;

  return (
    <style>
      {`
        @font-face {
          font-style: ${fontStyle};
          font-family: ${fontFamily};
          font-weight: ${fontWeight};
          mso-font-alt: ${msoFontAlt};
          ${src}
        }
        * {
          font-family: ${fontFamily}, ${fallbackFonts};
        }
      `}
    </style>
  );
}; 