'use client';

import { useSearchParams } from 'next/navigation';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const errorMessage =
    searchParams.get('message') || 'Sorry, something went wrong';

  return <p>{errorMessage}</p>;
}
