import Head from 'next/head';

export default function Home() {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-[#0c111d]/70 p-8 overflow-hidden relative">
      <Head>
        <title>My Next.js App</title>
        <meta name="description" content="A default Next.js page" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="absolute inset-0 bg-[#0c111d]/70 opacity-70" />
      <div className="relative z-10 w-[480px] h-[304px] bg-white rounded-xl shadow-lg flex flex-col items-center overflow-hidden">
        
        {/* Close Button */}
        <button className="absolute top-4 right-4 p-4 rounded-md transition duration-300 hover:bg-[#F9FAFB]">
            <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/x-close-icon.svg`}
            alt="Close"
            className="w-6 h-6"
        />
        </button>

        <div className="self-stretch h-24 flex flex-col items-center">
          <div className="self-stretch px-6 pt-6 flex items-start gap-4">
            {/* Support Icon */}
            <div className="w-12 h-12 p-3 bg-[#f2f4f7] rounded-full flex justify-center items-center overflow-hidden">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/support-icon.svg`}
                alt="Support Icon"
                className="w-6 h-6"
              />
            </div>

            {/* Title & Subtitle */}
            <div className="w-[432px] flex flex-col justify-center gap-1">
              <div className="text-[#101828] text-lg font-semibold leading-7">Help center</div>
              <div className="text-[#475467] text-sm font-normal leading-tight">Everything you need</div>
            </div>
          </div>
        </div>

        {/* Options List */}
        <div className="self-stretch h-52 p-6 flex flex-col gap-5">
          {/* Reach out to us */}
          <div className="self-stretch px-1.5 py-px flex items-center transition duration-300 hover:bg-[#F9FAFB] rounded-lg">
            <div className="flex-grow h-[38px] px-2.5 py-[9px] rounded-md flex items-center gap-3 overflow-hidden">
              <div className="flex-grow flex items-center gap-2">
                {/* Certificate Icon */}
                <div className="w-4 h-4 relative overflow-hidden">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/certificate.svg`}
                    alt="Certificate Icon"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-[#344054] text-sm font-medium leading-tight">
                  Reach out to us
                </div>
              </div>
              <div className="text-[#667085] text-xs font-normal leading-[18px]">⌘S</div>
            </div>
          </div>

          {/* Take a look at our roadmap */}
          <div className="self-stretch px-1.5 py-px flex items-center transition duration-300 hover:bg-[#F9FAFB] rounded-lg">
            <div className="flex-grow h-[38px] px-2.5 py-[9px] rounded-md flex items-center gap-3 overflow-hidden">
              <div className="flex-grow flex items-center gap-2">
                {/* Compass Icon */}
                <div className="w-4 h-4 relative overflow-hidden">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/compass-icon.svg`}
                    alt="Compass Icon"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-[#344054] text-sm font-medium leading-tight">
                  Take a look at our roadmap
                </div>
              </div>
              <div className="text-[#667085] text-xs font-normal leading-[18px]">⌘D</div>
            </div>
          </div>

          {/* Join our Slack community (With Slack Icon) */}
          <a
            href="https://join.slack.com/t/processflowcommunity/shared_invite/zt-2z10aormq-aFsRf5mw1~~Y~ryFXgrwog"
            target="_blank"
            rel="noopener noreferrer"
            className="self-stretch px-1.5 py-px flex items-center transition duration-300 hover:bg-[#F9FAFB] rounded-lg"
          >
            <div className="flex-grow h-[38px] px-2.5 py-[9px] rounded-md flex items-center gap-3 overflow-hidden">
              <div className="flex-grow flex items-center gap-2">
                {/* Slack Icon */}
                <div className="w-4 h-4 relative overflow-hidden">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/slack.svg`}
                    alt="Slack Icon"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-[#344054] text-sm font-medium leading-tight">
                  Join our Slack community
                </div>
              </div>
              <div className="text-[#667085] text-xs font-normal leading-[18px]">⌘X</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}