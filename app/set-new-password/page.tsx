"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export default function Home() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle form submission: check if passwords match and update password
  const handlePasswordReset = async () => {
    if (!password || !confirmPassword) {
      toast.error('Missing Fields', {
        description: 'Please fill in both password fields.',
        duration: 5000,
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Password Mismatch', {
        description: 'Passwords do not match!',
        duration: 5000,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create Supabase client
      const supabase = createClient();

      // Attempt to update the user's password
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error('Password Reset Failed', {
          description: error.message,
          duration: 5000,
        });
      } else {
        // Call the API to clear the cookie
        const res = await fetch('/api/clear-password-reset-cookie', {
          method: 'POST',
        });

        if (res.ok) {
          toast.success('Password Reset Successful', {
            description: 'Your password has been successfully reset. You will be redirected to the login page.',
            duration: 7000,
          });
          // Redirect to home page
          router.push('/');
        } else {
          toast.error('Cookie Cleanup Failed', {
            description: 'Password reset succeeded, but failed to clear the cookie. You may need to clear your browser cookies manually.',
            duration: 7000,
          });
        }
      }
    } catch (error) {
      toast.error('Password Reset Failed', {
        description: 'An unexpected error occurred. Please try again.',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-white overflow-hidden flex items-center justify-center">
      {/* Outer gray parent container */}
      <div className="w-[420px] p-3 bg-gray-50 rounded-3xl border border-[#e4e7ec] flex flex-col justify-center items-center gap-2">
        
        {/* Inner white card */}
        <div className="relative w-full px-6 py-8 bg-white rounded-2xl border border-[#e4e7ec] flex flex-col justify-start items-center gap-6 overflow-hidden">
          
          {/* Corner dots (16px from each edge) */}
          <div className="pointer-events-none absolute inset-0">
            <div
              className="
                w-1.5 h-1.5
                bg-white
                rounded-full
                shadow-[0px_1px_2px_0px_rgba(0,0,0,0.10)]
                border border-[#e4e7ec]
                absolute
              "
              style={{ top: 16, left: 16 }}
            />
            <div
              className="
                w-1.5 h-1.5
                bg-white
                rounded-full
                shadow-[0px_1px_2px_0px_rgba(0,0,0,0.10)]
                border border-[#e4e7ec]
                absolute
              "
              style={{ bottom: 16, left: 16 }}
            />
            <div
              className="
                w-1.5 h-1.5
                bg-white
                rounded-full
                shadow-[0px_1px_2px_0px_rgba(0,0,0,0.10)]
                border border-[#e4e7ec]
                absolute
              "
              style={{ top: 16, right: 16 }}
            />
            <div
              className="
                w-1.5 h-1.5
                bg-white
                rounded-full
                shadow-[0px_1px_2px_0px_rgba(0,0,0,0.10)]
                border border-[#e4e7ec]
                absolute
              "
              style={{ bottom: 16, right: 16 }}
            />
          </div>

          {/* App icon container */}
          <div
            className="
              z-10
              flex
              justify-start
              items-start
            "
          >
            <div
              className="
                w-10
                h-10
                relative
                overflow-hidden
                bg-white
                rounded-[10px]
                flex
                items-center
                justify-center
              "
            >
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
              <div
                className="
                  w-full
                  text-center
                  text-[#101828]
                  text-lg
                  font-semibold
                  font-['Inter']
                  leading-7
                "
              >
                Set new password
              </div>
              <div
                className="
                  w-full
                  text-center
                  text-[#475467]
                  text-sm
                  font-normal
                  font-['Inter']
                  leading-tight
                "
              >
                Your new password must be different to previously used passwords.
              </div>
            </div>
          </div>

          {/* Password form fields */}
          <div className="z-10 flex flex-col items-center gap-6 w-full rounded-xl">
            <div className="flex flex-col items-start gap-5 w-full">
              {/* New Password field */}
              <div className="flex flex-col items-start gap-1.5 w-full">
                <label className="flex items-start gap-0.5 text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                  New Password
                </label>
                <div
                  className="
                    px-3.5 py-1.5
                    bg-white
                    rounded-lg
                    shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]
                    border border-[#d0d5dd]
                    flex
                    items-center
                    gap-2
                    w-full
                    focus-within:border-[#4e6bd7]
                    focus-within:shadow-[0px_0px_0px_4px_rgba(78,107,215,0.2)]
                    transition-colors duration-200
                  "
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/lock-01.svg`}
                    alt="Lock Icon"
                    className="w-4 h-4"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="
                      grow
                      text-[#667085]
                      text-base
                      font-normal
                      font-['Inter']
                      leading-normal
                      outline-none
                      bg-transparent
                    "
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/${
                      showPassword ? "eye-off" : "eye"
                    }.svg`}
                    alt={showPassword ? "Hide Password" : "Show Password"}
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
              </div>

              {/* Confirm Password field */}
              <div className="flex flex-col items-start gap-1.5 w-full">
                <label className="flex items-start gap-0.5 text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                  Confirm Password
                </label>
                <div
                  className="
                    px-3.5 py-1.5
                    bg-white
                    rounded-lg
                    shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]
                    border border-[#d0d5dd]
                    flex
                    items-center
                    gap-2
                    w-full
                    focus-within:border-[#4e6bd7]
                    focus-within:shadow-[0px_0px_0px_4px_rgba(78,107,215,0.2)]
                    transition-colors duration-200
                  "
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/lock-01.svg`}
                    alt="Lock Icon"
                    className="w-4 h-4"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="
                      grow
                      text-[#667085]
                      text-base
                      font-normal
                      font-['Inter']
                      leading-normal
                      outline-none
                      bg-transparent
                    "
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reset password button */}
          <div className="flex flex-col items-start gap-4 w-full">
            <button
              onClick={handlePasswordReset}
              disabled={isLoading || !password || !confirmPassword}
              className={`
                w-full
                px-3 py-2
                rounded-lg
                border-2
                border-white
                flex
                items-center
                justify-center
                gap-1
                overflow-hidden
                transition-colors
                duration-300
                ${
                  isLoading
                    ? "bg-[#F9FAFB]"
                    : "bg-[#4e6bd7] hover:bg-[#374c99]"
                }
              `}
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
                  Reset Password
                </div>
              )}
            </button>
          </div>

          {/* Back to login */}
          <a
            href="/login"
            className="justify-center items-center gap-1.5 flex cursor-pointer text-inherit no-underline"
          >
            <div className="w-5 h-5 relative flex justify-center items-center">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-left.svg`}
                alt="Arrow Left Icon"
                className="w-5 h-5"
              />
            </div>
            <div className="text-[#475467] text-sm font-semibold font-['Inter'] leading-tight">
              Back to log in
            </div>
          </a>
        </div>

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
