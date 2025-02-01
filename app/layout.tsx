import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ProcessFlow',
  description: '',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="font-sans" lang="en">
      <head>
        {/* Google Font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Favicon Links for different sizes */}
        <link rel="icon" type="image/png" sizes="32x32" href="/32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/48x48.png" />
        <link rel="icon" type="image/png" sizes="64x64" href="/64x64.png" />
        <link rel="icon" type="image/png" sizes="256x256" href="/256x256.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/512x512.png" />
      </head>
      <body>
        {children}
        {/* Intégration du script HubSpot avec next/script */}
        <Script
          src="https://js-na1.hs-scripts.com/47874121.js"
          strategy="afterInteractive"
          id="hs-script-loader"
          async
          defer
        />
      </body>
    </html>
  );
}
