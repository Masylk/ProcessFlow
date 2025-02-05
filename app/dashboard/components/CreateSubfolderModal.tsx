import React, { useState } from 'react';

interface CreateSubfolderModalProps {
  onClose: () => void;
  onCreate: (
    folderName: string,
    parentId: number,
    icon_url?: string
  ) => Promise<void>;
  parentId: number;
}

const CreateFolderModal: React.FC<CreateSubfolderModalProps> = ({
  onClose,
  onCreate,
  parentId,
}) => {
  const [folderName, setFolderName] = useState('');
  const [iconUrl, setIconUrl] = useState<string | null>(null);

  const createFolder = (name: string) => {
    if (iconUrl) onCreate(name, parentId, iconUrl);
    else onCreate(name, parentId);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-8 bg-[#0c111d] bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg w-[400px] p-6 flex flex-col">
        {/* Header */}
        <div className="flex flex-col items-start gap-4">
          <div className="w-12 h-12 p-3 bg-white rounded-[10px] border border-[#e4e7ec] shadow-sm flex items-center justify-center">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon.svg`}
              alt="Folder icon"
              className="w-12 h-12"
            />
          </div>
          <h2 className="text-[#101828] text-lg font-semibold">
            Create a Subfolder
          </h2>
        </div>

        {/* Input Field */}
        <div className="mt-4">
          <label className="block text-[#344054] text-sm font-semibold">
            Folder name <span className="text-[#4761c4]">*</span>
          </label>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-11 h-11 bg-white rounded-lg border border-[#d0d5dd] flex items-center justify-center">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon.svg`}
                alt="My folder icon"
                className="w-6 h-6"
              />
            </div>
            <input
              type="text"
              className="flex-1 h-11 px-3.5 py-2.5 bg-white rounded-lg border border-[#d0d5dd] text-base text-[#101828]"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="h-11 px-4 py-2.5 bg-white border border-[#d0d5dd] rounded-lg text-[#344054] font-semibold"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="h-11 px-4 py-2.5 bg-[#4e6bd7] text-white rounded-lg font-semibold"
            onClick={() => createFolder(folderName)}
            disabled={!folderName.trim()}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFolderModal;
