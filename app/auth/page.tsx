'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // For Next.js 13+ app router
import { supabasePublicClient } from '@/lib/supabasePublicClient';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabasePublicClient.auth.signUp({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      alert('Sign-up successful! Please check your email for confirmation.');
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabasePublicClient.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      console.log('login successful');
      router.push('/'); // Redirect to the home page after login
    }
  };

  const handleLogout = async () => {
    const { error } = await supabasePublicClient.auth.signOut();
    if (error) {
      alert(error.message);
    } else {
      alert('Logged out successfully!');
      router.push('/auth'); // Redirect back to auth page
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold text-center">Supabase Auth</h1>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleSignUp}
          disabled={loading}
          className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full p-2 text-white bg-green-500 rounded hover:bg-green-600 disabled:bg-green-300"
        >
          {loading ? 'Logging In...' : 'Log In'}
        </button>
        <button
          onClick={handleLogout}
          className="w-full p-2 text-white bg-red-500 rounded hover:bg-red-600"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
