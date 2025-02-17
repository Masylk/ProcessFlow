// app/swagger-ui/page.tsx

'use client';

import { useEffect } from 'react';

export default function SwaggerPage() {
  useEffect(() => {
    const ui = SwaggerUIBundle({
      url: '/api/docs', // This fetches your Swagger spec
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    });

    return () => {
      ui.destroy();
    };
  }, []);

  return (
    <div>
      <div id="swagger-ui"></div>
    </div>
  );
}
