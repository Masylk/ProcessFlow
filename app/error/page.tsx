'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorMessage() {
  const searchParams = useSearchParams();
  const errorMessage =
    searchParams.get('message') || 'Sorry, something went wrong';

  return <p>{errorMessage}</p>;
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorMessage />
    </Suspense>
  );
}
