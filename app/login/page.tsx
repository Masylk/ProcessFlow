'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import posthog from 'posthog-js';
import { login, signup } from './actions';
import * as Sentry from '@sentry/nextjs';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
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

      if (newUser?.id && newUser?.email) {
        Sentry.setUser({
          id: newUser.id,
          email: newUser.email,
        });

        posthog.identify(newUser.id);
        posthog.people.set({
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        });
        posthog.capture('signup', {
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        });
        router.push('/dashboard');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>
              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>
            </>
          )}
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
