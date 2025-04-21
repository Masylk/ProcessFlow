'use client';

import { useState, useEffect } from 'react';
import Alert from '@/app/components/Alert';

export default function ResetPasswordRequestPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showResendAlert, setShowResendAlert] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [waitTime, setWaitTime] = useState<number | null>(null);
  const [warningAlertTime, setWarningAlertTime] = useState<number>(0);
  const [successAlertTime, setSuccessAlertTime] = useState<number>(0);

  // Auto-close alerts after 15 seconds
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (showAlert || showResendAlert) {
      timeoutId = setTimeout(() => {
        if (showAlert) {
          setShowAlert(false);
          setWaitTime(null);
          setWarningAlertTime(0);
        }
        if (showResendAlert) {
          setShowResendAlert(false);
          setSuccessAlertTime(0);
        }
      }, 15000);
    }
    return () => clearTimeout(timeoutId);
  }, [showAlert, showResendAlert]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (process.env.NODE_ENV !== 'production') {
        console.log('API Response:', data);
      }

      if (response.ok) {
        setIsEmailSent(true);
      } else if (response.status === 400) {
        // Extract wait time from error message using regex
        const waitTimeMatch = data.error?.match(/after (\d+) seconds/);
        const waitTimeValue = waitTimeMatch ? parseInt(waitTimeMatch[1], 10) : null;
        if (process.env.NODE_ENV !== 'production') {
          console.log('Extracted wait time:', waitTimeValue);
        }
        setWaitTime(waitTimeValue);
        setShowAlert(true);
        setWarningAlertTime(Date.now());
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (process.env.NODE_ENV !== 'production') {
        console.log('Resend API Response:', data);
      }

      if (response.status === 400) {
        // Extract wait time from error message using regex
        const waitTimeMatch = data.error?.match(/after (\d+) seconds/);
        const waitTimeValue = waitTimeMatch ? parseInt(waitTimeMatch[1], 10) : null;
        if (process.env.NODE_ENV !== 'production') {
          console.log('Extracted wait time:', waitTimeValue);
        }
        setWaitTime(waitTimeValue);
        setShowAlert(true);
        setWarningAlertTime(Date.now());
      } else if (response.ok) {
        setShowResendAlert(true);
        setSuccessAlertTime(Date.now());
      }
    } catch (error) {
      console.error('Resend Error:', error);
    } finally {
      setIsResending(false);
    }
  };

  const formatWaitTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} seconds`;
    }
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  return (
    <div className="relative w-full min-h-screen bg-white overflow-hidden flex items-center justify-center p-4">
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2">
          <Alert
            variant="warning"
            title="Password Reset Request"
            message={waitTime 
              ? `Please wait ${formatWaitTime(waitTime)} before requesting another password reset.`
              : "Please wait a few minutes before requesting another password reset."
            }
            onClose={() => {
              setShowAlert(false);
              setWaitTime(null);
              setWarningAlertTime(0);
            }}
            zIndex={warningAlertTime}
          />
        </div>
      )}
      {showResendAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2">
          <Alert
            variant="success"
            title="Email Sent"
            message="A new password reset email has been sent to your inbox."
            onClose={() => {
              setShowResendAlert(false);
              setSuccessAlertTime(0);
            }}
            zIndex={successAlertTime}
          />
        </div>
      )}
      {/* Outer gray parent container */}
      <div className="w-full max-w-[420px] p-2 sm:p-3 bg-gray-50 rounded-3xl border border-[#e4e7ec] flex flex-col justify-center items-center gap-2">
        {/* Inner white card */}
        <div className="relative w-full px-4 sm:px-6 py-6 sm:py-8 bg-white rounded-2xl border border-[#e4e7ec] flex flex-col justify-start items-center gap-4 sm:gap-6 overflow-hidden">
          {/* Corner dots */}
          <div className="pointer-events-none absolute inset-0">
            <div
              className="w-1.5 h-1.5 bg-white rounded-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.10)] border border-[#e4e7ec] absolute"
              style={{ top: 16, left: 16 }}
            />
            <div
              className="w-1.5 h-1.5 bg-white rounded-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.10)] border border-[#e4e7ec] absolute"
              style={{ bottom: 16, left: 16 }}
            />
            <div
              className="w-1.5 h-1.5 bg-white rounded-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.10)] border border-[#e4e7ec] absolute"
              style={{ top: 16, right: 16 }}
            />
            <div
              className="w-1.5 h-1.5 bg-white rounded-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.10)] border border-[#e4e7ec] absolute"
              style={{ bottom: 16, right: 16 }}
            />
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

          {isEmailSent ? (
            <>
              {/* Email sent view */}
              <div className="z-10 flex flex-col items-center gap-3 w-full">
                <div className="flex flex-col items-start gap-1 w-full">
                  <div className="w-full text-center text-[#101828] text-lg font-semibold font-['Inter'] leading-7">
                    Check your email
                  </div>
                  <div className="w-full text-center text-[#475467] text-sm font-normal font-['Inter'] leading-tight">
                    We've sent a reset link to<br />{email}
                  </div>
                </div>
              </div>

              {/* Check icon */}
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-[#F4F3FF] rounded-full flex items-center justify-center">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-icon-onboarding.svg`}
                    alt="Check Icon"
                    className="w-6 h-6"
                  />
                </div>
              </div>

              {/* Open email app button */}
              <button
                onClick={() => window.location.href = "mailto:"}
                className="w-full px-3 py-2 bg-[#4e6bd7] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] flex justify-center items-center gap-1 text-white text-sm font-semibold font-['Inter'] leading-tight hover:bg-[#374c99] transition-colors duration-300"
              >
                Open email app
              </button>

              {/* Resend link */}
              <div className="text-center">
                <span className="text-[#475467] text-sm font-normal font-['Inter']">
                  Didn't receive the email?{' '}
                </span>
                <button
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className={`text-[#4e6bd7] text-sm font-semibold font-['Inter'] hover:underline inline-flex items-center gap-2 ${isResending ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                  {isResending ? (
                    <>
                      <div
                        className="w-4 h-4 animate-spin"
                        style={{
                          borderRadius: "50%",
                          background: "conic-gradient(#4761C4 0%, #F9FAFB 100%)",
                          maskImage: "radial-gradient(closest-side, transparent 83%, black 84%)"
                        }}
                      />
                      Sending...
                    </>
                  ) : (
                    <span className="text-[#4e6bd7]">Click to resend</span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Initial form view */}
              <div className="z-10 flex flex-col items-center gap-3 w-full">
                <div className="flex flex-col items-start gap-1 w-full">
                  <div className="w-full text-center text-[#101828] text-lg font-semibold font-['Inter'] leading-7">
                    Forgot password?
                  </div>
                  <div className="w-full text-center text-[#475467] text-sm font-normal font-['Inter'] leading-tight">
                    No worries, we'll send you instructions
                  </div>
                </div>
              </div>

              {/* Login form fields */}
              <div className="z-10 flex flex-col items-center gap-6 w-full rounded-xl">
                <form className="flex flex-col items-start gap-5 w-full" onSubmit={handleSubmit}>
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
                        placeholder="Email address"
                        className="grow text-[#667085] text-base font-normal font-['Inter'] leading-normal outline-none bg-transparent"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Reset password button */}
                  <button
                    type="submit"
                    disabled={isLoading || !email}
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
                        Reset password
                      </div>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}

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
      </div>
    </div>
  );
}
