export default function Home() {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6">
        <div className="bg-white rounded-lg shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03)] shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08)] border border-[#e4e7ec] flex flex-col overflow-hidden">
          <div className="self-stretch px-4 py-3 flex items-center gap-3 transition duration-300 hover:bg-[#F9FAFB]">
              <img 
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-05.svg`} 
                  alt="Edit Icon" 
                  className="w-4 h-4"
              />
              <span className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">Edit folder</span>
          </div>
          <div className="self-stretch px-4 py-3 flex items-center gap-3 border-b border-[#e4e7ec] transition duration-300 hover:bg-[#F9FAFB]">
              <img 
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/git-branch-01.svg`} 
                  alt="Git Branch Icon" 
                  className="w-4 h-4"
              />
              <span className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">Create subfolder</span>
          </div>
         
          <div className="self-stretch px-4 py-3 flex items-center gap-3 transition duration-300 hover:bg-[#F9FAFB]">
              <img 
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-01.svg`} 
                  alt="Trash Icon" 
                  className="w-4 h-4"
              />
              <span className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">Delete folder</span>
          </div>
        </div>
      </div>
    );
}
