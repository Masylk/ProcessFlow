// app/analytics/layout.tsx

import React from 'react';
import Script from 'next/script';

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      {/* Chargement de la librairie Amplitude avant l'interactivité */}
      <Script
        src="https://cdn.amplitude.com/libs/analytics-browser-2.11.1-min.js.gz"
        strategy="beforeInteractive"
      />
      {/* Chargement du plugin Session Replay avant l'interactivité */}
      <Script
        src="https://cdn.amplitude.com/libs/plugin-session-replay-browser-1.8.0-min.js.gz"
        strategy="beforeInteractive"
      />
      {/* Initialisation d'Amplitude après que la page soit interactive */}
      <Script id="amplitude-init" strategy="afterInteractive">
        {`
          if (window.amplitude && window.sessionReplay) {
            window.amplitude.add(window.sessionReplay.plugin({ sampleRate: 1 }));
            window.amplitude.init('86407d043d42112c4ce3a3da34ba13b3', {
              autocapture: { elementInteractions: true }
            });
          } else {
            console.error("Amplitude or sessionReplay is not loaded.");
          }
        `}
      </Script>
    </>
  );
}
