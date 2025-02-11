'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import posthog from 'posthog-js';
import { login, signup } from './actions';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!isSignUp) {
      // Appel à la server action "login"
      const user = await login(formData);

      if (user?.error) {
        console.error('Login error:', user.error);
        return;
      }

      if (user?.id && user?.email) {
        posthog.identify(user.id);

        // On peut aussi récupérer le nom côté DB si besoin
        // posthog.people.set({ email: user.email, firstName: user.firstName, lastName: user.lastName });

        // Pour le login, on a souvent juste l'email
        posthog.people.set({ email: user.email });

        posthog.capture('login', {
          email: user.email,
        });

        router.push('/');
      }
    } else {
      // Appel à la server action "signup"
      const newUser = await signup(formData);

      if (newUser?.error) {
        console.error('Signup error:', newUser.error);
        return;
      }

      // newUser contiendra { id, email, firstName, lastName } si ton server action renvoie tout
      if (newUser?.id && newUser?.email) {
        posthog.identify(newUser.id);

        // On met l'email, le prénom et le nom dans les propriétés utilisateur
        posthog.people.set({
          email: newUser.email,
          firstName: newUser.firstName, // renvoyé par le backend
          lastName: newUser.lastName,   // renvoyé par le backend
        });

        // On peut logguer l'événement signup en incluant ces infos
        posthog.capture('signup', {
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        });

        router.push('/');
      }
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
      </div>
    </div>
  );
}
