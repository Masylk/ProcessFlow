'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(
  () => Promise.resolve(require('swagger-ui-react').default),
  { ssr: false }
);

export default function ApiDocsPage() {
  return <SwaggerUI url="/api/docs" />;
}
