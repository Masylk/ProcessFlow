'use client';

import { useEffect } from 'react';

export default function HubspotTracker() {
  useEffect(() => {
    // Create script element
    const script = document.createElement('script');
    script.id = 'hs-script-loader';
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    script.src = '//js.hs-scripts.com/47874121.js';
    
    // Append to body
    document.body.appendChild(script);
    
    // Cleanup on unmount
    return () => {
      // Find and remove the script if it exists
      const existingScript = document.getElementById('hs-script-loader');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);
  
  // This component doesn't render anything visible
  return null;
} 