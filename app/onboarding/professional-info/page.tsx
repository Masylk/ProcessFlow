"use client"

import { useState, useEffect, useCallback } from "react";
import ButtonNormal from '@/app/components/ButtonNormal';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { cn } from '@/lib/utils';
import { useColors } from '@/app/theme/hooks';

export default function ProfessionalInfo() {
  const [industry, setIndustry] = useState("");
  const [role, setRole] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [source, setSource] = useState("");
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const router = useRouter();
  const colors = useColors();

  // Load saved data on component mount
  useEffect(() => {
    // Get saved form data from localStorage if it exists
    const savedData = localStorage.getItem('professionalInfoData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setIndustry(parsedData.industry || "");
        setRole(parsedData.role || "");
        setCompanySize(parsedData.companySize || "");
        setSource(parsedData.source || "");
      } catch (e) {
        console.warn('Error loading saved form data:', e);
      }
    }
  }, []);

  // Save form data when it changes
  useEffect(() => {
    // Only save when at least one field has a value
    if (industry || role || companySize || source) {
      localStorage.setItem('professionalInfoData', JSON.stringify({
        industry,
        role,
        companySize,
        source
      }));
    }
  }, [industry, role, companySize, source]);

  const dropdownOptions = {
    industry: ['IT', 'Healthcare', 'Finance', 'Education', 'Retail', 'Other'],
    role: ['Freelancer', 'Manager', 'Product Manager', 'Analyst', 'Designer', 'Sales', 'Marketing', 'HR', 'Customer Success', 'Other'],
    companySize: ['1', '2-9', '10-49', '50-199', '200-499', '500+'],
    source: ['ProductHunt', 'LinkedIn', 'Google', 'Friend', 'Other'],
  };

  // Check if user is Google authenticated on component mount
  useEffect(() => {
    const checkAuthProvider = async () => {
      console.log("Checking auth provider...");
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
      
      try {
        // Utiliser getUser() au lieu de getSession() pour plus de sécurité
        const { data: { user }, error } = await supabase.auth.getUser();
        
        console.log("Auth check result:", { user, error });
        
        if (error) {
          console.error('Error checking auth provider:', error);
          setIsGoogleAuth(false); // Default to false on error
          return;
        }
        
        // If no user or no metadata, default to false
        if (!user || !user.app_metadata) {
          console.log("No user data or metadata found, setting isGoogleAuth to false");
          setIsGoogleAuth(false);
          return;
        }
        
        const isGoogle = user.app_metadata.provider === 'google';
        console.log("Auth provider:", user.app_metadata.provider, "isGoogle:", isGoogle);
        setIsGoogleAuth(isGoogle);
      } catch (error) {
        console.error('Error in auth check:', error);
        setIsGoogleAuth(false); // Default to false on error
      }
    };

    checkAuthProvider();
  }, []);

  // Add browser back button handler
  useEffect(() => {
    const handlePopState = async (e: PopStateEvent) => {
      // Prevent the default back navigation
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);

      if (isNavigatingBack) return;
      setIsNavigatingBack(true);

      try {
        // Try to update the onboarding step but don't block navigation if it fails
        await fetch('/api/onboarding/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            step: 'PROFESSIONAL_INFO',
            data: {
              onboarding_step: 'PERSONAL_INFO',
              is_navigating_back: true
            }
          })
        }).catch(err => {
          console.warn('Error updating onboarding step, but continuing navigation:', err);
        });
        
        // Navigate to previous page regardless of API response
        window.location.href = '/onboarding/personal-info';
      } catch (error) {
        console.warn('Error during back navigation, but continuing to previous step:', error);
        // Still navigate even if there was an error
        window.location.href = '/onboarding/personal-info';
      }
    };

    // Push the current state to enable back button
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isNavigatingBack]);

  const handleSubmit = async () => {
    if (!industry || !role || !companySize || !source) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/onboarding/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: 'PROFESSIONAL_INFO',
          data: {
            industry,
            professional_role: role,
            company_size: companySize,
            source,
            onboarding_step: 'WORKSPACE_SETUP'
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Server error:', data.error);
        setError(data.error || "An error occurred while updating your information");
        return;
      }

        router.push('/onboarding/workspace-setup');
    } catch (error) {
      console.error('Client error:', error instanceof Error ? error.message : 'Unknown error');
      setError("A connection error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Manual back button handler
  const handleBackClick = useCallback(async () => {
    setIsNavigatingBack(true);
    
    try {
      // Try to update the onboarding step first
      await fetch('/api/onboarding/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: 'PROFESSIONAL_INFO',
          data: {
            onboarding_step: 'PERSONAL_INFO',
            is_navigating_back: true
          }
        })
      }).catch(err => {
        console.warn('Error updating onboarding step, but continuing navigation:', err);
      });
      
      // Force navigation with window.location.href instead of router.push
      window.location.href = '/onboarding/personal-info';
    } catch (error) {
      console.warn('Error during back navigation, but continuing to previous step:', error);
      // Still navigate even if there was an error
      window.location.href = '/onboarding/personal-info';
    } finally {
      // This may not be needed since we're doing a full page navigation
      setIsNavigatingBack(false);
    }
  }, [router]);

  // Add a useEffect for debugging
  useEffect(() => {
    console.log("isGoogleAuth value:", isGoogleAuth);
  }, [isGoogleAuth]);

  return (
    <div 
      className="w-full min-h-screen flex justify-center items-center p-4"
      style={{ backgroundColor: colors['bg-primary'] }}
    >
      <div className="max-w-[1280px] w-full flex-col justify-center items-center gap-8 md:gap-12 inline-flex py-8 md:py-16">
        <div className="w-[180px] md:w-[240px] justify-start items-start inline-flex">
          <div className="justify-end items-center gap-3 flex">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logo-pf-in-app.png`}
              alt="Logo ProcessFlow"
              className="w-full"
            />
          </div>
        </div>
        <div className="flex items-center justify-center w-full">
          <div className="relative flex items-center w-48 md:w-64">
            {/* First Step - Validated */}
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/validated-step-icon.svg`}
              alt="Validated step icon"
              className="w-8 h-8"
            />

            {/* Progress Bar */}
            <div className="flex-grow h-0.5 bg-[#4761c4] mx-2"></div>
            
            <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-[#edf0fb] rounded-full border-2 border-[#4761c4]">
              <div className="flex items-center justify-center w-6 h-6 bg-[#4761c4] rounded-full">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>
            
            <div className="flex-grow h-0.5 bg-[#e4e7ec] mx-2"></div>
            
            <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-gray-50 rounded-full border border-[#e4e7ec]">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border border-[#e4e7ec]">
                <div className="w-2 h-2 bg-[#d0d5dd] rounded-full" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex-col justify-start items-start gap-4 md:gap-6 inline-flex max-w-[500px] w-full px-4 md:px-0">
          <div 
            className="self-stretch text-center text-xl md:text-2xl font-semibold font-['Inter'] leading-loose"
            style={{ color: colors['text-primary'] }}
          >
            Welcome to ProcessFlow!
          </div>
          <div 
            className="self-stretch text-center text-sm md:text-base font-normal font-['Inter'] leading-normal"
            style={{ color: colors['text-secondary'] }}
          >
            You will still be able to modify your workspace later.
          </div>
          
          {error && (
            <div className="self-stretch text-center text-red-600 text-sm font-normal">
              {error}
            </div>
          )}
          
          <div className="w-full flex flex-col md:flex-row pt-4 md:pt-6 justify-start items-start md:items-center gap-4 md:gap-2">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
              <div 
                className="whitespace-nowrap text-base font-normal leading-normal"
                style={{ color: colors['text-primary'] }}
              >
                I work in
              </div>
              <div className="w-full md:w-[180px] relative">
                <select
                  className="w-full px-3.5 py-2.5 rounded-lg border text-base cursor-pointer shadow-sm transition-all appearance-none"
                  style={{ 
                    backgroundColor: colors['bg-primary'],
                    borderColor: colors['border-secondary'],
                    color: colors['text-primary'],
                  }}
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  <option value="">Select industry</option>
                  {dropdownOptions.industry.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5"
                    style={{ color: colors['text-secondary'] }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
              <div 
                className="whitespace-nowrap text-base font-normal leading-normal"
                style={{ color: colors['text-primary'] }}
              >
                as a
              </div>
              <div className="w-full md:w-[200px] relative">
                <select
                  className="w-full px-3.5 py-2.5 rounded-lg border text-base cursor-pointer shadow-sm transition-all appearance-none"
                  style={{ 
                    backgroundColor: colors['bg-primary'],
                    borderColor: colors['border-secondary'],
                    color: colors['text-primary'],
                  }}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="">Select role</option>
                  {dropdownOptions.role.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5"
                    style={{ color: colors['text-secondary'] }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-start items-start md:items-center gap-2 w-full">
            <div 
              className="whitespace-nowrap text-base font-normal leading-normal"
              style={{ color: colors['text-primary'] }}
            >
              for a company of
            </div>
            <div className="w-full relative">
              <select
                className="w-full px-3.5 py-2.5 rounded-lg border text-base cursor-pointer shadow-sm transition-all appearance-none"
                style={{ 
                  backgroundColor: colors['bg-primary'],
                  borderColor: colors['border-secondary'],
                  color: colors['text-primary'],
                }}
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
              >
                <option value="">Select company size</option>
                {dropdownOptions.companySize.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5"
                  style={{ color: colors['text-secondary'] }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-start items-start md:items-center gap-2 w-full">
            <div 
              className="whitespace-nowrap text-base font-normal leading-normal"
              style={{ color: colors['text-primary'] }}
            >
              I learned about ProcessFlow from
            </div>
            <div className="w-full relative">
              <select
                className="w-full px-3.5 py-2.5 rounded-lg border text-base cursor-pointer shadow-sm transition-all appearance-none"
                style={{ 
                  backgroundColor: colors['bg-primary'],
                  borderColor: colors['border-secondary'],
                  color: colors['text-primary'],
                }}
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                <option value="">Select source</option>
                {dropdownOptions.source.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5"
                  style={{ color: colors['text-secondary'] }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="h-10 flex justify-between items-start w-full mt-2 md:mt-4">
            {/* Always show back button regardless of auth state */}
            <ButtonNormal
              variant="secondary"
              size="small"
              leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-left.svg`}
              onClick={handleBackClick}
              disabled={isNavigatingBack}
              className="w-fit"
            >
              Back
            </ButtonNormal>

            <ButtonNormal
              variant="primary"
              size="small"
              trailingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/white-arrow-right.svg`}
              onClick={handleSubmit}
              disabled={isLoading || !industry || !role || !companySize || !source}
              className="w-fit"
            >
              {isLoading ? "Loading..." : "Continue"}
            </ButtonNormal>
          </div>
        </div>
      </div>
    </div>
  );
} 