'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import posthog from 'posthog-js';
import { signup } from '../login/actions';
import * as Sentry from '@sentry/nextjs';
import { createBrowserClient } from '@supabase/ssr';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailNotification, setShowEmailNotification] = useState(false);
  const router = useRouter();

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (email && password) {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      
      const newUser = await signup(formData);
      setIsLoading(false);
      
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
        console.error('Erreur authentification Google:', error.message);
      } else {
        console.log('Redirection OAuth initiée:', data);
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-white overflow-hidden flex items-center justify-center">
      {showEmailNotification && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg">
          <p>Un email de confirmation vous a été envoyé. Veuillez vérifier votre boîte de réception.</p>
        </div>
      )}
      
      {/* Outer gray parent container */}
      <div className="w-[420px] p-3 bg-gray-50 rounded-3xl border border-[#e4e7ec] flex flex-col justify-center items-center gap-2">
        
        {/* Inner white card */}
        <div className="relative w-full h-[610px] px-6 py-8 bg-white rounded-2xl border border-[#e4e7ec] flex flex-col justify-start items-center gap-6 overflow-hidden">
          
          {/* Corner dots */}
          <div className="pointer-events-none absolute inset-0">
            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.10)] border border-[#e4e7ec] absolute" style={{ top: 16, left: 16 }} />
            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.10)] border border-[#e4e7ec] absolute" style={{ bottom: 16, left: 16 }} />
            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.10)] border border-[#e4e7ec] absolute" style={{ top: 16, right: 16 }} />
            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.10)] border border-[#e4e7ec] absolute" style={{ bottom: 16, right: 16 }} />
          </div>

          {/* App icon container */}
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
                Sign up to Processflow
              </div>
              <div className="w-full text-center text-[#475467] text-sm font-normal font-['Inter'] leading-tight">
                Stay on top of your processes
              </div>
            </div>
          </div>

          {/* Signup form fields */}
          <form onSubmit={handleSignUp} className="z-10 flex flex-col items-center gap-6 w-full rounded-xl">
            <div className="flex flex-col items-start gap-5 w-full">
              {/* Email field */}
              <div className="flex flex-col items-start gap-1.5 w-full">
                <label className="flex items-start gap-0.5 text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                  Email
                </label>
                <div className="px-3.5 py-1.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] flex items-center gap-2 w-full focus-within:border-[#4e6bd7] focus-within:shadow-[0px_0px_0px_4px_rgba(78,107,215,0.2)] transition-colors duration-200">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/mail-01.svg`}
                    alt="Mail Icon"
                    className="w-4 h-4"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    required
                    className="grow text-[#667085] text-base font-normal font-['Inter'] leading-normal outline-none bg-transparent"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
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
                    name="password"
                    placeholder="••••••••"
                    required
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

            <Link href="/reset-password-request" className="flex items-center gap-1 w-full text-[#667085] text-sm font-normal font-['Inter'] leading-tight">
              <span>Forgot password?</span>
              <span className="text-[#374c99] font-semibold">Reset</span>
            </Link>

            {/* Sign up button with loading spinner */}
            <div className="flex flex-col items-start gap-4 w-full">
              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className={`w-full px-3 py-2 rounded-lg border-2 border-white flex items-center justify-center gap-1 overflow-hidden transition-colors duration-300 ${isLoading ? "bg-[#F9FAFB]" : "bg-[#4e6bd7] hover:bg-[#374c99]"}`}
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
                    Sign up
                  </div>
                )}
              </button>
            </div>
          </form>

          {/* Divider "OR" */}
          <div className="z-10 flex items-center gap-4 w-full">
            <div className="grow h-px border border-[#e4e7ec]" />
            <div className="text-center text-[#475467] text-sm font-normal font-['Inter'] leading-tight">
              or
            </div>
            <div className="grow h-px border border-[#e4e7ec]" />
          </div>

          {/* Sign up with Google */}
          <div className="z-10 flex flex-col items-center w-full">
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full px-4 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.07)] border border-[#d0d5dd] flex items-center justify-center gap-3 overflow-hidden transition-colors duration-300 hover:bg-[#F9FAFB]"
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/google.svg`}
                alt="Google Icon"
                className="w-4 h-4"
              />
              <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                Sign up with Google
              </div>
            </button>
            
            {/* Terms and Privacy Section */}
            <div className="mt-5 text-center flex flex-wrap justify-left items-center gap-1">
              <div className="text-[#667085] text-sm font-normal font-['Inter'] leading-tight">
                By continuing you agree to
              </div>
              <a href="/terms" className="text-[#374c99] text-sm font-semibold font-['Inter'] leading-tight">
                Terms of Service
              </a>
              <div className="text-[#667085] text-sm font-normal font-['Inter'] leading-tight">
                and
              </div>
              <a href="/privacy" className="text-[#374c99] text-sm font-semibold font-['Inter'] leading-tight">
                Privacy Policy
              </a>
              <div className="text-[#667085] text-sm font-normal font-['Inter'] leading-tight">
                .
              </div>
            </div>
            
            {/* Added Explicit Bottom Margin */}
            <div className="mb-8" />
          </div>
        </div>

        {/* Log in row (outside the white card) */}
        <div className="py-3 flex justify-center items-baseline gap-1">
          <div className="text-[#667085] text-sm font-normal font-['Inter'] leading-tight">
            Already have an account?
          </div>
          <Link href="/login" className="flex items-center gap-1.5 overflow-hidden">
            <div className="text-[#374c99] text-sm font-semibold font-['Inter'] leading-tight">
              Log in
            </div>
          </Link>
        </div>
        
        {/* Footer container */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="w-[420px] h-9 px-2 py-1.5 bg-gray-50 rounded-full border border-[#e4e7ec] flex justify-center items-center">
            <div className="grow shrink basis-0 h-6 px-2 py-0.5 bg-white rounded-[99px] flex justify-between items-center">
              <div className="text-[#475467] text-sm font-normal">2025 © Processflow</div>
              <div className="w-0.5 h-0.5 bg-[#475467] rounded-full mx-2" />
              <a href="/support" className="text-[#475467] text-sm font-normal hover:underline">Support</a>
              <div className="w-0.5 h-0.5 bg-[#475467] rounded-full mx-2" />
              <a href="/privacy" className="text-[#475467] text-sm font-normal hover:underline">Privacy</a>
              <div className="w-0.5 h-0.5 bg-[#475467] rounded-full mx-2" />
              <a href="/terms" className="text-[#475467] text-sm font-normal hover:underline">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}