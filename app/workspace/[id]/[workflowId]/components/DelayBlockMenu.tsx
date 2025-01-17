import React from 'react';

interface DelayBlockMenuProps {
  blockId: number;
  handleDeleteBlockFn: (blockId: number) => Promise<void>;
}

const DelayBlockMenu: React.FC<DelayBlockMenuProps> = ({
  blockId,
  handleDeleteBlockFn,
}) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseStoragePath = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH;

  // URLs for the icons
  const modifyDelayIconUrl = `${supabaseUrl}${supabaseStoragePath}/assets/shared_components/edit-icon.svg`;
  const deleteDelayIconUrl = `${supabaseUrl}${supabaseStoragePath}/assets/shared_components/delete-icon.svg`;

  return (
    <div className="h-[90px] py-1 flex-col justify-start items-start inline-flex overflow-hidden bg-white border border-gray-200 rounded-md">
      {/* Modify Delay Option */}
      <div className="self-stretch px-1.5 py-px justify-start items-center inline-flex border-b border-gray-200">
        <div className="flex grow h-[38px] px-2.5 py-[9px] rounded-md justify-start items-center gap-3 overflow-hidden hover:bg-gray-100">
          <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
            <div className="w-4 h-4 relative overflow-hidden">
              <img
                src={modifyDelayIconUrl}
                alt="Edit Icon"
                className="w-4 h-4"
              />
            </div>
            <div className="text-[#18212f] text-sm font-medium font-['Inter'] leading-tight">
              Modify delay
            </div>
          </div>
          <div className="text-[#667085] text-xs font-normal font-['Inter'] leading-[18px]">
            ⌘A
          </div>
        </div>
      </div>

      {/* Delete Delay Option */}
      <div
        className="self-stretch px-1.5 py-px justify-start items-center inline-flex"
        onClick={() => handleDeleteBlockFn(blockId)}
      >
        <div className="flex grow h-[38px] px-2.5 py-[9px] rounded-md justify-start items-center gap-3 overflow-hidden hover:bg-gray-50">
          <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
            <div className="w-4 h-4 relative overflow-hidden">
              <img
                src={deleteDelayIconUrl}
                alt="Delete Icon"
                className="w-4 h-4"
              />
            </div>
            <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
              Delete delay
            </div>
          </div>
          <div className="text-[#667085] text-xs font-normal font-['Inter'] leading-[18px]">
            DEL
          </div>
        </div>
      </div>
    </div>
  );
};

export default DelayBlockMenu;
