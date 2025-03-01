"use client"

import { useState, useEffect } from "react";
import ButtonNormal from '@/app/components/ButtonNormal';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function ProfessionalInfo() {
  const [industry, setIndustry] = useState("");
  const [role, setRole] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [source, setSource] = useState("");
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const dropdownOptions = {
    industry: ['IT', 'Healthcare', 'Finance', 'Education', 'Retail'],
    role: ['Freelancer', 'Manager', 'Developer', 'Designer', 'Analyst'],
    companySize: ['1', '2-9', '10-49', '50-199', '200-499', '500+'],
    source: ['ProductHunt', 'LinkedIn', 'Google', 'Friend', 'Other'],
  };

  // Check if user is Google authenticated on component mount
  useEffect(() => {
    const checkAuthProvider = async () => {
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
      
      try {
        // Utiliser getUser() au lieu de getSession() pour plus de sécurité
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error checking auth provider:', error);
          return;
        }
        
        const isGoogle = user?.app_metadata?.provider === 'google';
        setIsGoogleAuth(isGoogle);
      } catch (error) {
        console.error('Error in auth check:', error);
      }
    };

    checkAuthProvider();
  }, []);

  const handleSubmit = async () => {
    if (!industry || !role || !companySize || !source) {
      setError("Veuillez remplir tous les champs");
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
            professional_role: role, // Noter l'utilisation de professional_role au lieu de role (conformément au schéma)
            company_size: companySize,
            source,
            onboarding_step: 'WORKSPACE_SETUP'
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Server error:', data.error);
        setError(data.error || "Une erreur est survenue lors de la mise à jour de vos informations");
        return;
      }

        router.push('/onboarding/workspace-setup');
    } catch (error) {
      console.error('Client error:', error instanceof Error ? error.message : 'Unknown error');
      setError("Une erreur de connexion est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-white flex justify-center items-center">
      <div className="w-[1280px] h-[516px] flex-col justify-start items-center gap-[72px] inline-flex">
        <div className="w-[159px] justify-start items-start inline-flex">
          <div className="justify-end items-center gap-3 flex">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logo-pf-in-app.png`}
              alt="Logo ProcessFlow"
              className=""
            />
          </div>
        </div>
        <div className="flex items-center justify-center w-full">
          <div className="relative flex items-center w-64">
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
        <div className="h-[244px] flex-col justify-start items-start gap-6 inline-flex">
          <div className="self-stretch text-center text-[#101828] text-2xl font-semibold font-['Inter'] leading-loose">
            Welcome to ProcessFlow!
          </div>
          <div className="self-stretch text-center text-[#101828] text-base font-normal font-['Inter'] leading-normal">
            You will still be able to modify your workspace later.
          </div>
          
          {error && (
            <div className="self-stretch text-center text-red-600 text-sm font-normal">
              {error}
            </div>
          )}
          
          <div className="w-[500px] flex pt-6 justify-start items-center gap-2">
            <div className="flex items-center space-x-2">
              <div className="whitespace-nowrap text-black text-base font-normal leading-normal">
                I work in
              </div>
              <div className="flex-grow relative">
                <select
                  className="w-[180px] px-3.5 py-2.5 bg-white rounded-lg border border-[#d0d5dd] text-[#101828] text-base cursor-pointer shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-[#4e6bd7] transition-all appearance-none"
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
                    className="w-5 h-5 text-gray-500"
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

            <div className="whitespace-nowrap text-black text-base font-normal leading-normal">
              as a
            </div>
            <div className="relative w-[200px]">
              <select
                className="w-full basis-0 px-3.5 py-2.5 bg-white rounded-lg border border-[#d0d5dd] text-[#101828] text-base cursor-pointer shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-[#4e6bd7] transition-all appearance-none"
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
                  className="w-5 h-5 text-gray-500"
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

          <div className="relative self-stretch justify-start items-center gap-2 inline-flex">
            <div className="text-black text-base font-normal leading-normal">
              for a company of
            </div>
            <select
              className="grow shrink basis-0 px-3.5 py-2.5 bg-white rounded-lg border border-[#d0d5dd] text-[#101828] text-base cursor-pointer shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-[#4e6bd7] transition-all appearance-none"
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
          </div>

          <div className="relative self-stretch justify-start items-center gap-2 inline-flex">
            <div className="text-black text-base font-normal leading-normal">
              I learned about ProcessFlow from
            </div>
            <select
              className="grow shrink basis-0 px-3.5 py-2.5 bg-white rounded-lg border border-[#d0d5dd] text-[#101828] text-base cursor-pointer shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-[#4e6bd7] transition-all appearance-none"
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
          </div>

          <div className="h-10 flex justify-between items-start w-full">
            {/* Only show back button if not Google authenticated */}
            {!isGoogleAuth && (
              <ButtonNormal
                variant="secondary"
                size="small"
                leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-left.svg`}
                onClick={() => router.push('/onboarding/personal-info')}
              >
                Back
              </ButtonNormal>
            )}

            <ButtonNormal
              variant="primary"
              size="small"
              trailingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/white-arrow-right.svg`}
              onClick={handleSubmit}
              disabled={isLoading || !industry || !role || !companySize || !source}
              // Si Google auth, faire en sorte que le bouton prenne toute la largeur
              className={isGoogleAuth ? 'w-full' : ''}
            >
              {isLoading ? "Loading..." : "Continue"}
            </ButtonNormal>
          </div>
        </div>
      </div>
    </div>
  );
} 