export default function CanvaHeader() {
  return (
    <div className="w-full h-[68px] px-8 py-4 justify-between items-center inline-flex">
      <div className="justify-start items-center gap-4 flex">
        <div className="text-[#344054] text-2xl font-semibold font-['Inter'] leading-loose">
          🎯
        </div>
        <div className="text-[#101828] text-2xl font-semibold font-['Inter'] leading-loose">
          Marketing
        </div>
      </div>
      <div className="justify-end items-center gap-2 flex">
        <div className="px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-center items-center gap-1 flex overflow-hidden hover:bg-[#F9FAFB] transition-colors duration-300 cursor-pointer">
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/upload-01.svg`}
            alt="Import Icon"
            className="w-5 h-5"
          />
          <div className="px-0.5 justify-center items-center flex">
            <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
              Import a Process
            </div>
          </div>
        </div>
        <div className="px-3 py-2 bg-[#4e6bd7] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] justify-center items-center gap-1 flex overflow-hidden hover:bg-[#374C99] transition-colors duration-300 cursor-pointer">
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/white-plus.svg`}
            alt="Plus Icon"
            className="w-5 h-5"
          />
          <div className="px-0.5 justify-center items-center flex">
            <div className="text-white text-sm font-semibold font-['Inter'] leading-tight">
              New Process
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
