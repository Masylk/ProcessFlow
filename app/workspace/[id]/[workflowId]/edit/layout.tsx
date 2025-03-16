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
    </>
  );
}

