import React from 'react';

interface BlockOptionsProps {
  onDelete: () => void;
  onCopy: () => void;
  onCopyLink: () => void;
  onDuplicate: () => void;
}

const BlockOptions: React.FC<BlockOptionsProps> = ({
  onDelete,
  onCopy,
  onCopyLink,
  onDuplicate,
}) => {
  const handleOptionClick = (
    event: React.MouseEvent,
    action: () => void
  ): void => {
    event.stopPropagation();
    action();
  };

  return (
    <div className="w-[226px] py-1 bg-white rounded-md shadow-lg border border-gray-200 z-50">
      {/* Duplicate */}
      <div
        className="self-stretch px-1.5 py-px flex items-center"
        onClick={(event) => handleOptionClick(event, onDuplicate)}
      >
        <div className="flex grow h-[38px] px-2.5 py-[9px] rounded-md hover:bg-gray-50 items-center gap-3 cursor-pointer">
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/duplicate-icon.svg`}
            alt="Duplicate Icon"
            className="w-4 h-4"
          />
          <div className="text-xs font-medium text-[#344054]">Duplicate</div>
          <div className="text-xs text-[#667085] ml-auto">⌘D</div>
        </div>
      </div>

      {/* Copy */}
      <div
        className="self-stretch px-1.5 py-px flex items-center"
        onClick={(event) => handleOptionClick(event, onCopy)}
      >
        <div className="flex grow h-[38px] px-2.5 py-[9px] rounded-md hover:bg-gray-50 items-center gap-3 cursor-pointer">
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/copy-icon.svg`}
            alt="Copy Icon"
            className="w-4 h-4"
          />
          <div className="text-xs font-medium text-[#344054]">Copy</div>
          <div className="text-xs text-[#667085] ml-auto">⌘C</div>
        </div>
      </div>

      {/* Copy Link */}
      <div
        className="self-stretch px-1.5 py-px flex items-center"
        onClick={(event) => handleOptionClick(event, onCopyLink)}
      >
        <div className="flex grow h-[38px] px-2.5 py-[9px] rounded-md hover:bg-gray-50 items-center gap-3 cursor-pointer">
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/copy-link-icon.svg`}
            alt="Copy Link Icon"
            className="w-4 h-4"
          />
          <div className="text-xs font-medium text-[#344054]">
            Copy link to this step
          </div>
          <div className="text-xs text-[#667085] ml-auto">⌘L</div>
        </div>
      </div>

      {/* Delete */}
      <div
        className="self-stretch px-1.5 py-px flex items-center"
        onClick={(event) => handleOptionClick(event, onDelete)}
      >
        <div className="flex grow h-[38px] px-2.5 py-[9px] rounded-md hover:bg-gray-50 items-center gap-3 cursor-pointer">
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/delete-icon.svg`}
            alt="Delete Icon"
            className="w-4 h-4"
          />
          <div className="text-xs font-medium text-[#344054]">Delete step</div>
          <div className="text-xs text-[#667085] ml-auto">DEL</div>
        </div>
      </div>
    </div>
  );
};

export default BlockOptions;
