import React from 'react';

// Special layout for checkout success page that disables PostHog
// This prevents the "Cannot redefine property: adoptedStyleSheets" error
export default function CheckoutSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Render children directly without PostHog wrapper */}
      {children}
    </>
  );
} 