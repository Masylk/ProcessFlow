import React from 'react';

export default function Home() {
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
                Check your email
              </div>
            </div>
          </div>

          {/* Confirmation message */}
          <div className="self-stretch text-center">
            <span className="text-[#475467] text-sm font-normal font-['Inter'] leading-tight">
              We’ve sent a confirmation link to
            </span>
            <br/>
            <span className="text-[#475467] text-sm font-semibold font-['Inter'] leading-tight">
              ceo@process-flow.io
            </span>
          </div>

          {/* Email button */}
                
                <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-icon-onboarding.svg`}
                    alt="Check Icon"
                    className="w-12 h-12"
                />
                <div className="self-stretch h-9 rounded-xl flex flex-col justify-start items-center gap-6">
                <div className="self-stretch h-9 flex flex-col justify-start items-start gap-4">
                    <a 
                    href="mailto:" 
                    className="self-stretch px-3 py-2 bg-[#4e6bd7] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] flex justify-center items-center gap-1 cursor-pointer transition duration-300 hover:bg-[#374c99] no-underline"
                    >
                    <div className="px-0.5 flex justify-center items-center">
                        <div className="text-white text-sm font-semibold font-['Inter'] leading-tight">
                        Open email app
                        </div>
                    </div>
                    </a>
                </div>
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

        {/* Resend email outside the white container */}
            <a 
            href="/resend-email" 
            className="py-3 flex justify-center items-baseline gap-1 cursor-pointer no-underline"
            >
            <div className="text-[#667085] text-sm font-normal font-['Inter'] leading-tight">
                Didn’t receive the email?
            </div>
            <div className="flex justify-center items-center gap-1.5">
                <div className="text-[#374c99] text-sm font-semibold font-['Inter'] leading-tight">
                Click to resend
                </div>
            </div>
            </a>

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
