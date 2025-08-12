'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function JoinWorkspacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading'
  );
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuthAndJoin = async () => {
      const workspace = searchParams.get('workspace');
      const token = searchParams.get('token');

      if (!workspace || !token) {
        setStatus('error');
        setError('Missing workspace or token.');
        return;
      }

      // Decode token to get email
      let email;
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        [email] = decoded.split(':');
      } catch {
        setStatus('error');
        setError('Invalid invitation token.');
        return;
      }

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
      );
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Check if account exists
        const response = await fetch(
          `/api/check-email?email=${encodeURIComponent(email)}`
        );
        const { exists } = await response.json();

        const params = new URLSearchParams();
        if (workspace) params.set('workspace', workspace);
        if (token) params.set('token', token);
        params.set('redirect', '/join');

        if (exists) {
          router.replace(`/login?${params.toString()}`);
        } else {
          params.set('autoConfirm', 'true');
          params.set('email', email);
          router.replace(`/signup?${params.toString()}`);
        }
        return;
      }

      // Always check onboarding after join attempt
      let joinError = null;
      try {
        const res = await fetch('/api/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspace, token }),
        });
        if (!res.ok) {
          const data = await res.json();
          joinError = data.error || 'Failed to join workspace.';
        }
      } catch (err) {
        joinError = 'An unexpected error occurred.';
      }

      // Check onboarding status
      const {
        data: { user: refreshedUser },
      } = await supabase.auth.getUser();

      const onboardingStatus =
        refreshedUser?.user_metadata?.onboarding_status || {};
      const isOnboardingComplete = onboardingStatus.completed_at;

      if (!isOnboardingComplete) {
        router.replace(`/onboarding?join=${encodeURIComponent(workspace)}`);
      } else {
        setStatus(joinError ? 'error' : 'success');
        if (joinError) setError(joinError);
        router.replace('/');
      }
    };

    checkAuthAndJoin();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {status === 'loading' && (
        <>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4" />
          <p>Joining workspace...</p>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="text-red-500 font-bold text-lg mb-2">Error</div>
          <p>{error}</p>
        </>
      )}
    </div>
  );
}
