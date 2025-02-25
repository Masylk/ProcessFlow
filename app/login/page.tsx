'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import posthog from 'posthog-js';
import { login, signup } from './actions';
import * as Sentry from '@sentry/nextjs';
import { createBrowserClient } from '@supabase/ssr';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showEmailNotification, setShowEmailNotification] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!isSignUp) {
      const user = await login(formData);
      if (user?.error) {
        console.error('Login error:', user.error);
        return;
      }

      if (user?.id && user?.email) {
        Sentry.setUser({
          id: user.id,
          email: user.email,
        });

        posthog.identify(user.id);
        posthog.people.set({ email: user.email });
        posthog.capture('login', { email: user.email });
        router.push('/dashboard');
      }
    } else {
      const newUser = await signup(formData);
      if ('error' in newUser) {
        console.error('Signup error:', newUser.error);
        return;
      }

      if (newUser?.email) {
        Sentry.setUser({
          id: newUser.id,
          email: newUser.email,
        });

        posthog.identify(newUser.id);
        posthog.people.set({
          email: newUser.email,
        });
        posthog.capture('signup', {
          email: newUser.email,
        });
        
        setShowEmailNotification(true);
      }
    }
  }

  // Send test email to the API route
  async function sendTestEmail() {
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'jean.willame@outlook.fr', // Corrected email address format
          firstName: 'Maxime', // Provide a first name as required by your API
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Test email sent successfully:', data.message);
      } else {
        const errorData = await response.json();
        console.error('Error sending email:', errorData.error);
      }
    } catch (error) {
      console.error('Error in sending test email:', error);
    }
  }

  const handleGoogleAuth = async () => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
        {
          cookies: {
            get(name: string) {
              return document.cookie
                .split('; ')
                .find((row) => row.startsWith(`${name}=`))
                ?.split('=')[1];
            },
            set(name: string, value: string, options: any) {
              let cookie = `${name}=${value}; path=/`;
              if (options.maxAge) {
                cookie += `; max-age=${options.maxAge}`;
              }
              if (options.domain) {
                cookie += `; domain=${options.domain}`;
              }
              document.cookie = cookie;
            },
            remove(name: string) {
              document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
            },
          },
        }
      );

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Erreur authentification Google:', error.message);
      } else {
        console.log('Redirection OAuth initiée:', data);
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
      {showEmailNotification && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg">
          <p>Un email de confirmation vous a été envoyé. Veuillez vérifier votre boîte de réception.</p>
        </div>
      )}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h2>

        <button
          onClick={handleGoogleAuth}
          className="w-full mb-6 py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.545,12.151L12.545,12.151c0,1.054,0.855,1.909,1.909,1.909h3.536c-0.607,1.972-2.101,3.467-4.26,3.467c-2.624,0-4.747-2.124-4.747-4.747s2.124-4.747,4.747-4.747c1.169,0,2.233,0.423,3.062,1.122l2.188-2.188C17.541,5.942,15.195,5,12.545,5C7.021,5,2.545,9.476,2.545,15s4.476,10,10,10c8.396,0,10.966-7.7,10.966-11.718c0-0.764-0.098-1.334-0.217-1.914H12.545V12.151z"
            />
          </svg>
          <span>Sign in with Google</span>
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>
          <div className="flex space-x-4">
            {!isSignUp && (
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              >
                Log in
              </button>
            )}
            {isSignUp && (
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              >
                Sign up
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              {isSignUp ? 'Already have an account? Log in' : 'Sign up'}
            </button>
          </div>
          <div className="text-center mt-4">
            <Link
              href="/reset-password-request"
              className="text-sm text-blue-500 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={sendTestEmail}
            className="py-2 px-4 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
          >
            Send Test Email
          </button>
        </div>
      </div>
    </div>
  );
}
