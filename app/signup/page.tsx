'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import posthog from 'posthog-js';
import { signup, checkEmailExists } from '../login/actions';
import * as Sentry from '@sentry/nextjs';
import { createBrowserClient } from '@supabase/ssr';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailNotification, setShowEmailNotification] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const router = useRouter();

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  // Handle email validation and check if it exists
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (emailError) setEmailError("");
    if (globalError) setGlobalError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError("");
  };

  // Add a function to check email existence
  const checkEmailAvailability = async (email: string) => {
    if (!validateEmail(email)) return; // Don't check invalid emails
    
    setIsCheckingEmail(true);
    try {
      const result = await checkEmailExists(email);
      
      if (result.error) {
        console.error("Error checking email:", result.error);
        return;
      }
      
      if (result.exists) {
        setEmailError("This email is already registered. Please use a different email or try logging in.");
        setGlobalError("This email is already registered. Please use a different email or try logging in.");
      }
    } catch (error) {
      console.error("Failed to check email:", error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Add a debounce effect for email checks
  useEffect(() => {
    if (!email || !validateEmail(email)) return;
    
    const timer = setTimeout(() => {
      checkEmailAvailability(email);
    }, 600); // 600ms debounce
    
    return () => clearTimeout(timer);
  }, [email]);

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    console.log("Starting signup process");
    
    // Clear any existing notifications first
    setShowEmailNotification(false);
    setGlobalError("");
    setEmailError("");
    setPasswordError("");
    
    // Validate inputs before submission
    let hasErrors = false;
    
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      hasErrors = true;
    }
    
    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 8 characters long.");
      hasErrors = true;
    }
    
    if (hasErrors) return;
    
    // Validate password
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      console.log("Password too short, signup blocked");
      return;
    }

    // Final check for email existence before signup
    console.log("Performing final email check before signup");
    setIsLoading(true);
    try {
      const emailCheck = await checkEmailExists(email);
      
      if (emailCheck.error) {
        console.error("Error checking email before signup:", emailCheck.error);
        // Continue with signup attempt even if check fails
      } else if (emailCheck.exists) {
        setEmailError("This email is already registered. Please use a different email or try logging in.");
        setGlobalError("This email is already registered. Please use a different email or try logging in.");
        setIsLoading(false);
        return; // Stop here if email exists
      }
      
      // Continue with signup process if email doesn't exist
      if (email && password) {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        
        console.log("Submitting signup request with email:", email);
        const newUser = await signup(formData);
        console.log("Signup response:", newUser);
        setIsLoading(false);
        
        // Check if there's an error
        if ('error' in newUser) {
          console.error('Signup error detected:', newUser.error);
          
          if (typeof newUser.error === 'string') {
            if (newUser.error.includes("already exists") || 
                newUser.error.includes("already registered") || 
                newUser.error.includes("already in use") ||
                newUser.error.includes("taken") ||
                newUser.error.toLowerCase().includes("email already")) {
              setEmailError("This email is already registered. Please use a different email or try logging in.");
              setGlobalError("This email is already registered. Please use a different email or try logging in.");
            } else {
              setEmailError(newUser.error || "An error occurred during signup. Please try again.");
              setGlobalError(newUser.error || "An error occurred during signup. Please try again.");
            }
          } else {
            setEmailError("An error occurred during signup. Please try again.");
            setGlobalError("An error occurred during signup. Please try again.");
          }
          // Don't show email notification on error
          return;
        }

        // Explicit check to ensure we don't proceed if there was an error
        if (globalError || emailError) {
          console.log("Preventing notification due to errors:", { globalError, emailError });
          return;
        }

        // Store email in sessionStorage for the confirmation page
        if (newUser?.email) {
          try {
            // Track analytics
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
            
            // Redirect to login page with email confirmation
            router.push(`/login?email=${encodeURIComponent(newUser.email)}&signup=success`);
          } catch (error) {
            console.error('Error during analytics tracking:', error);
            // Still redirect even if analytics fails
            router.push(`/login?email=${encodeURIComponent(newUser.email)}&signup=success`);
          }
        }
      }
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      setIsLoading(false);
      setGlobalError("An unexpected error occurred. Please try again later.");
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
    <div className="relative w-full min-h-screen bg-white overflow-hidden flex flex-col items-center justify-center py-6 px-4 sm:px-6">
      {/* Error notification */}
      {globalError && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto bg-red-500 text-white px-4 sm:px-6 py-3 rounded-lg shadow-lg z-50">
          <p>{globalError}</p>
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
                Create your account
              </div>
              <div className="w-full text-center text-[#475467] text-sm font-normal font-['Inter'] leading-tight">
                Start managing your processes efficiently
              </div>
            </div>
          </div>

          {/* Signup form */}
          <form onSubmit={handleSignUp} className="z-10 flex flex-col items-center gap-6 w-full rounded-xl">
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
                    onChange={handleEmailChange}
                  />
                  {isCheckingEmail && (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-[#4e6bd7] border-t-transparent" />
                  )}
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
                <div className={`px-3.5 py-1.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border ${passwordError ? 'border-red-500' : 'border-[#d0d5dd]'} flex items-center gap-2 w-full focus-within:border-[#4e6bd7] focus-within:shadow-[0px_0px_0px_4px_rgba(78,107,215,0.2)] transition-colors duration-200`}>
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
                    onChange={handlePasswordChange}
                  />
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/${showPassword ? "eye-off" : "eye"}.svg`}
                    alt={showPassword ? "Hide Password" : "Show Password"}
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
                {passwordError && (
                  <span className="text-red-500 text-sm mt-1">{passwordError}</span>
                )}
              </div>
            </div>

            {/* Sign up button */}
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
                    Sign up
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

          {/* Google signup */}
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
                Sign up with Google
              </div>
            </button>
          </div>

          {/* Terms and Privacy */}
          <div className="z-10 text-center flex flex-wrap justify-center items-center gap-1">
            <div className="text-[#667085] text-sm font-normal font-['Inter'] leading-tight">
              By continuing you agree to
            </div>
            <Link href="https://www.process-flow.io/terms" className="text-[#374c99] text-sm font-semibold font-['Inter'] leading-tight">
              Terms of Service
            </Link>
            <div className="text-[#667085] text-sm font-normal font-['Inter'] leading-tight">
              and
            </div>
            <Link href="https://www.process-flow.io/privacy" className="text-[#374c99] text-sm font-semibold font-['Inter'] leading-tight">
              Privacy Policy.
            </Link>
          </div>
        </div>

        {/* Login link */}
        <div className="py-3 flex justify-center items-baseline gap-1">
          <div className="text-[#667085] text-sm font-normal font-['Inter'] leading-tight">
            Already have an account?
          </div>
          <Link href="/login" className="text-[#374c99] text-sm font-semibold font-['Inter'] leading-tight">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
} 