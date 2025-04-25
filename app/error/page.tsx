'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

function ErrorMessage() {
  const searchParams = useSearchParams();
  const errorMessage =
    searchParams?.get('message') || 'Sorry, something went wrong';

  return <p>{errorMessage}</p>;
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="medium" />}>
      <ErrorMessage />
    </Suspense>
  );
}
