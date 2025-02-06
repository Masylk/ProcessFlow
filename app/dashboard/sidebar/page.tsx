export default function Home() {
    return (
        <div className="w-[240px] h-[188px] p-4 border-t border-[#e4e7ec] flex-col justify-start items-center gap-3 inline-flex bg-white">
            <div className="w-full self-stretch h-[76px] flex-col justify-start items-start gap-1 flex">
                <div className="w-full self-stretch px-3 py-2 bg-white rounded-md justify-start items-center gap-2 inline-flex overflow-hidden hover:bg-[#F9FAFB] transition duration-300 cursor-pointer">
                    <div className="w-full grow shrink basis-0 h-5 justify-start items-center gap-3 flex">
                        <img
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/support-icon.svg`}
                            alt="Support Icon"
                            className="w-5 h-5"
                        />
                        <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">Support</div>
                    </div>
                </div>
                <div className="w-full self-stretch px-3 py-2 bg-white rounded-md justify-start items-center gap-2 inline-flex overflow-hidden hover:bg-[#F9FAFB] transition duration-300 cursor-pointer">
                    <div className="w-full grow shrink basis-0 h-5 justify-start items-center gap-3 flex">
                        <img
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/settings-icon.svg`}
                            alt="Settings Icon"
                            className="w-5 h-5"
                        />
                        <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">Settings</div>
                    </div>
                </div>
            </div>
            <div className="w-full self-stretch px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] shadow-[inset_0px_-2px_0px_0px_rgba(16,24,40,0.05)] shadow-[inset_0px_0px_0px_1px_rgba(16,24,40,0.18)] border border-[#d0d5dd] justify-center items-center gap-1 inline-flex overflow-hidden hover:bg-[#F9FAFB] transition duration-300 cursor-pointer">
                <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/send-01.svg`}
                    alt="Send Icon"
                    className="w-5 h-5"
                />
                <div className="px-0.5 justify-center items-center flex">
                    <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">Send a feedback</div>
                </div>
            </div>
            <div className="w-full justify-center items-center gap-2 inline-flex">
                <div className="text-center text-[#667085] text-sm font-normal font-['Inter'] leading-tight">@ 2025 ProcessFlow, Inc.</div>
            </div>
        </div>
    );
}
