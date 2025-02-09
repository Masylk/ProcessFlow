export default function Home() {
    return (
        <div className="w-full h-screen bg-white flex justify-center items-center">
            <div className="w-full h-screen flex-col justify-center items-center gap-[72px] inline-flex">
                {/* Logo Section */}
                <div className="w-[159px] justify-start items-start inline-flex">
                    <div className="justify-end items-center gap-3 flex">
                        <img
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logo-pf-in-app.png`}
                            alt="Logo ProcessFlow"
                            className=""
                        />
                    </div>
                </div>

                

                {/* New Design Section */}
                <div className="w-[420px] h-56 flex-col justify-start items-start gap-6 inline-flex">
                    {/* Top Content */}
                    <div className="self-stretch h-72 flex-col justify-start items-center gap-4 flex">
                        <div className="relative bg-[#edf0fb] rounded-full overflow-hidden flex items-center justify-center">
                            <img
                                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-icon-onboarding.svg`}
                                alt="Check Icon"
                                className=""
                            />
                        </div>
                        <div className="self-stretch text-center text-[#101828] text-2xl font-semibold font-['Inter'] leading-loose">
                            You’re all set!
                        </div>
                        <div className="self-stretch text-center text-[#101828] text-base font-normal font-['Inter'] leading-normal">
                            Let us take you through.
                        </div>
                    </div>

                    <div className="h-10 flex justify-center items-start w-full">
  

                        {/* Continue Button */}
                        <div
                            className="w-full px-3.5 py-2.5 bg-[#4e6bd7] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] shadow-[inset_0px_-2px_0px_0px_rgba(16,24,40,0.05)] shadow-[inset_0px_0px_0px_1px_rgba(16,24,40,0.18)] border-2 border-white justify-center items-center gap-1 flex overflow-hidden transition-all duration-300 hover:bg-[#374C99] cursor-pointer"
                        >
                            <div className="px-0.5 justify-center items-center flex">
                            <div className="text-white text-sm font-semibold font-['Inter'] leading-tight">
                                Launch ProcessFlow
                            </div>
                            </div>
                            <img
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/white-arrow-right.svg`}
                            alt="White arrow right icon"
                            className="w-5 h-5"
                            />
                        </div>
                    </div>


    
                </div>
            </div>
        </div>
    );
}
