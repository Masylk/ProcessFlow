'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import posthog from 'posthog-js';
import { login } from './actions';
import * as Sentry from '@sentry/nextjs';
import { createBrowserClient } from '@supabase/ssr';
import LoadingSpinner from '../components/LoadingSpinner';

function LoginContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailConfirmationAlert, setEmailConfirmationAlert] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get URL parameters for signup confirmation
  useEffect(() => {
    const signupEmail = searchParams.get('email');
    const isSignupSuccess = searchParams.get('signup') === 'success';
    
    if (signupEmail && isSignupSuccess) {
      setEmail(signupEmail); // Pre-fill the email field
    }
  }, [searchParams]);

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); // Clear previous errors
    setEmailConfirmationAlert(""); // Clear previous alerts
    setEmailError(""); // Clear previous email errors
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    if (email && password) {
      setIsLoading(true);
      
      try {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        
        const response = await login(formData);
        
        if (response?.error) {
          console.error('Login error:', response.error);
          setError(response.error);
          return;
        }

        if (response?.needsEmailConfirmation) {
          if (process.env.NEXT_PUBLIC_APP_ENV !== 'production') {
            console.log('Email needs confirmation:', response.email);
          }
          setEmailConfirmationAlert(response.message);
          return;
        }

        if (response?.id && response?.email) {
          Sentry.setUser({
            id: response.id,
            email: response.email,
          });

          posthog.identify(response.id);
          posthog.people.set({ email: response.email });
          posthog.capture('login', { email: response.email });
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Unexpected error during login:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
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
                cookie += `; domain=.process-flow.io`;
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
        if (process.env.NEXT_PUBLIC_APP_ENV !== 'production') {
          console.error('Erreur authentification Google:', error.message);
        }
      } else {
        if (process.env.NEXT_PUBLIC_APP_ENV !== 'production') {
          console.log('Redirection OAuth initiée:', data);
        }
      }
    } catch (error) {
      if (process.env.NEXT_PUBLIC_APP_ENV !== 'production') {
        console.error('Erreur inattendue:', error);
      }
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-white overflow-hidden flex flex-col items-center justify-center py-6 px-4 sm:px-6">
      {/* Signup success notification */}
      {searchParams.get('signup') === 'success' && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto bg-blue-500 text-white px-4 sm:px-6 py-3 rounded-lg shadow-lg z-50">
          <p>A confirmation email has been sent. Please check your inbox.</p>
        </div>
      )}

      {/* Email confirmation alert */}
      {emailConfirmationAlert && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto bg-yellow-500 text-white px-4 sm:px-6 py-3 rounded-lg shadow-lg z-50">
          <p>{emailConfirmationAlert}</p>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto bg-red-500 text-white px-4 sm:px-6 py-3 rounded-lg shadow-lg z-50">
          <p>{error}</p>
        </div>
      )}
      
      <div className="w-full max-w-[420px] p-3 bg-gray-50 rounded-3xl border border-[#e4e7ec] flex flex-col justify-center items-center gap-2">
        <div className="relative w-full h-fit px-4 sm:px-6 py-8 sm:py-10 bg-white rounded-2xl border border-[#e4e7ec] flex flex-col justify-start items-center gap-6 sm:gap-8 overflow-hidden">
          {/* Corner dots */}
          <div className="pointer-events-none absolute inset-0">
            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.10)] border border-[#e4e7ec] absolute" style={{ top: 16, left: 16 }} />
            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.10)] border border-[#e4e7ec] absolute" style={{ bottom: 16, left: 16 }} />
            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.10)] border border-[#e4e7ec] absolute" style={{ top: 16, right: 16 }} />
            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.10)] border border-[#e4e7ec] absolute" style={{ bottom: 16, right: 16 }} />
          </div>

          {/* App icon */}
          <div className="z-10 flex justify-start items-start">
            <div className="w-10 h-10 relative overflow-hidden bg-white rounded-[10px] flex items-center justify-center">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logomark-pf.png`}
                alt="App Icon"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Heading section */}
          <div className="z-10 flex flex-col items-center gap-3 w-full">
            <div className="flex flex-col items-start gap-1 w-full">
              <div className="w-full text-center text-[#101828] text-lg font-semibold font-['Inter'] leading-7">
                Log in to Processflow
              </div>
              <div className="w-full text-center text-[#475467] text-sm font-normal font-['Inter'] leading-tight">
                Stay on top of your processes
              </div>
            </div>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="z-10 flex flex-col items-center gap-6 w-full rounded-xl">
            <div className="flex flex-col items-start gap-5 w-full">
              {/* Email field */}
              <div className="flex flex-col items-start gap-1.5 w-full">
                <label className="flex items-start gap-0.5 text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                  Email
                </label>
                <div className={`px-3.5 py-1.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border ${emailError ? 'border-red-500' : 'border-[#d0d5dd]'} flex items-center gap-2 w-full focus-within:border-[#4e6bd7] focus-within:shadow-[0px_0px_0px_4px_rgba(78,107,215,0.2)] transition-colors duration-200`}>
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/mail-01.svg`}
                    alt="Mail Icon"
                    className="w-4 h-4"
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    className="grow text-[#667085] text-base font-normal font-['Inter'] leading-normal outline-none bg-transparent"
                    value={email}
                    onChange={(e) => {
                      const newEmail = e.target.value;
                      setEmail(newEmail);
                      // Clear error if email becomes valid
                      if (emailError && validateEmail(newEmail)) {
                        setEmailError('');
                      }
                    }}
                  />
                </div>
                {emailError && (
                  <span className="text-red-500 text-sm mt-1">{emailError}</span>
                )}
              </div>

              {/* Password field */}
              <div className="flex flex-col items-start gap-1.5 w-full">
                <label className="flex items-start gap-0.5 text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                  Password
                </label>
                <div className="px-3.5 py-1.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] flex items-center gap-2 w-full focus-within:border-[#4e6bd7] focus-within:shadow-[0px_0px_0px_4px_rgba(78,107,215,0.2)] transition-colors duration-200">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/lock-01.svg`}
                    alt="Lock Icon"
                    className="w-4 h-4"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="grow text-[#667085] text-base font-normal font-['Inter'] leading-normal outline-none bg-transparent"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/${showPassword ? "eye-off" : "eye"}.svg`}
                    alt={showPassword ? "Hide Password" : "Show Password"}
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
              </div>
            </div>

            {/* Forgot password link */}
            <Link href="/reset-password-request" className="flex items-center gap-1 w-full text-[#667085] text-sm font-normal font-['Inter'] leading-tight">
              <span>Forgot password?</span>
              <span className="text-[#374c99] font-semibold">Reset</span>
            </Link>

            {/* Login button */}
            <div className="flex flex-col items-start gap-4 w-full">
              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className={`w-full px-3 py-2 rounded-lg border-2 border-white flex items-center justify-center gap-1 overflow-hidden transition-colors duration-300 ${
                  isLoading ? "bg-[#F9FAFB]" : "bg-[#4e6bd7] hover:bg-[#374c99]"
                }`}
              >
                {isLoading ? (
                  <div
                    className="w-5 h-5 animate-spin"
                    style={{
                      borderRadius: "50%",
                      background: "conic-gradient(#4761C4 0%, #F9FAFB 100%)",
                      maskImage: "radial-gradient(closest-side, transparent 83%, black 84%)"
                    }}
                  />
                ) : (
                  <div className="text-white text-sm font-semibold font-['Inter'] leading-tight">
                    Log in
                  </div>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="z-10 flex items-center gap-4 w-full mt-2">
            <div className="grow h-px border border-[#e4e7ec]" />
            <div className="text-center text-[#475467] text-sm font-normal font-['Inter'] leading-tight">
              or
            </div>
            <div className="grow h-px border border-[#e4e7ec]" />
          </div>

          {/* Google login */}
          <div className="z-10 flex flex-col items-center w-full mb-2">
            <button
              onClick={handleGoogleAuth}
              className="w-full px-4 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.07)] border border-[#d0d5dd] flex items-center justify-center gap-3 overflow-hidden transition-colors duration-300 hover:bg-[#F9FAFB]"
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/google.svg`}
                alt="Google Icon"
                className="w-4 h-4"
              />
              <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                Log in with Google
              </div>
            </button>
          </div>
        </div>

        {/* Sign up link */}
        <div className="py-3 flex justify-center items-baseline gap-1">
          <div className="text-[#667085] text-sm font-normal font-['Inter'] leading-tight">
            Don't have an account?
          </div>
          <Link href="/signup" className="text-[#374c99] text-sm font-semibold font-['Inter'] leading-tight">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen size="large" />}>
      <LoginContent />
    </Suspense>
  );
}
