import React from 'react';
import { Block } from '@/types/block'; // Adjust the import path as needed
import SidebarList from './SidebarList';
import SidebarPath from './SidebarPath';
import { Path } from '@/types/path';

interface SidebarProps {
  path: Path;
  stepCount: number;
  workspaceId: number;
}

const Sidebar: React.FC<SidebarProps> = ({ path, stepCount, workspaceId }) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const storagePath = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH || '';
  const logoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/processflow_logo.png`;

  return (
    <div className="w-[250px] bg-white border-r border-[#e4e7ec] justify-start items-start inline-flex  border overflow-auto ">
      <div className="flex-col justify-start items-start gap-6 inline-flex">
        {/* Header Block */}
        <div className="h-[72px] flex-col justify-center items-start gap-6 inline-flex">
          <div className="self-stretch h-8 pl-6 pr-5 flex-col justify-start items-start flex">
            <div className="w-[142px] justify-start items-start inline-flex">
              <div className="justify-end font-['Inter'] items-center text-xl font-bold gap-3 flex">
                <div className="shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06)] justify-start items-start inline-flex">
                  <div className="w-8 h-8 relative bg-gradient-to-bl from-[#4d6de3] to-[#1b2860] rounded-lg shadow-[inset_0px_0px_0px_0.6666666865348816px_rgba(16,24,40,0.24)] overflow-hidden">
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                ProcessFlow
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col items-start gap-2">
          <div className="w-[199px] h-[31px] ml-6 text-black text-sm font-semibold font-['Inter'] leading-tight">
            {stepCount} Steps
          </div>
          {/* Sidebar List */}
          <SidebarPath
            path={path}
            workspaceId={workspaceId}
            defaultVisibility={true}
            displayTitle={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
