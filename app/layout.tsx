import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { PostHogProvider } from './providers';
import { ThemeProvider } from './context/ThemeContext';
import AuthCheck from './components/AuthCheck';
import { Toaster } from 'sonner';

// Import environment checker
import '../lib/env-check';

const inter = Inter({ subsets: ['latin'] });

// Server-side environment check
function checkServerEnvironment() {
  if (process.env.NODE_ENV !== 'production') {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      console.warn('⚠️ Server-side check: STRIPE_SECRET_KEY is missing!');
      console.warn('Available env vars:', Object.keys(process.env)
        .filter(key => !key.includes('SECRET') && !key.includes('KEY'))
        .join(', '));
    } else {
      console.log('✅ STRIPE_SECRET_KEY is available on the server');
    }
  }
  return null;
}

// Run the check during server rendering
checkServerEnvironment();

export const metadata: Metadata = {
  title: 'ProcessFlow',
  description: '',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="font-sans" lang="en">
      <head>
        {/* Google Font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Liens favicon pour différentes tailles */}
        <link rel="icon" type="image/png" sizes="32x32" href="/32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/48x48.png" />
        <link rel="icon" type="image/png" sizes="64x64" href="/64x64.png" />
        <link rel="icon" type="image/png" sizes="256x256" href="/256x256.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/512x512.png" />
      </head>
      <body>

        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-M8W79RZW"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        <ThemeProvider>
          <PostHogProvider>
            <AuthCheck>{children}</AuthCheck>
            <Toaster />
          </PostHogProvider>
        </ThemeProvider>

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
