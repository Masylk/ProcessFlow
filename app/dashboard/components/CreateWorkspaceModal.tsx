import React, { useState, useEffect } from 'react';
import ButtonNormal from '@/app/components/ButtonNormal';
import InputField from '@/app/components/InputFields';


interface CreateWorkspaceModalProps {
  onClose: () => void;
  onCreateWorkspace: (workspaceData: {
    name: string;
    logo?: File;
    url: string;
  }) => void;
}

export default function CreateWorkspaceModal({
  onClose,
  onCreateWorkspace,
}: CreateWorkspaceModalProps) {
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceUrl, setWorkspaceUrl] = useState('');
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [urlPlaceholder, setUrlPlaceholder] = useState('acmecorp');

  // Update URL placeholder when workspace name changes
  useEffect(() => {
    if (workspaceName) {
      // Convert workspace name to lowercase, replace spaces with hyphens, and remove special characters
      const suggestedUrl = workspaceName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      
      setUrlPlaceholder(suggestedUrl || 'acmecorp');
    } else {
      setUrlPlaceholder('acmecorp');
    }
  }, [workspaceName]);

  const handleSubmit = () => {
    onCreateWorkspace({
      name: workspaceName,
      logo: selectedLogo || undefined,
      url: workspaceUrl || urlPlaceholder, // Use placeholder as fallback if no URL is entered
    });
  };

  // Prevent background clicks from closing the modal
  const handleModalClick = (e: React.MouseEvent) => {
    // Stop the click from reaching the backdrop
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-8 bg-black bg-opacity-40 cursor-default"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-lg w-[480px] flex flex-col cursor-default"
        onClick={handleModalClick}
      >
        {/* Header */}
        <div className="flex flex-col items-start gap-4 px-6 pt-6">
          <div className="w-12 h-12 p-3 bg-white rounded-[10px] border border-[#e4e7ec] shadow-sm flex items-center justify-center">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon.svg`}
              alt="Workspace icon"
              className="w-6 h-6"
            />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-[#101828] text-lg font-semibold">
              Create a new workspace
            </h2>
            <p className="text-[#475467] text-sm">
              Add your workspace informations here
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 flex flex-col gap-6">
          {/* Workspace Name */}
          <InputField
            type="icon-leading"
            label="Workspace Name"
            placeholder="e.g. Acme Corp"
            value={workspaceName}
            onChange={setWorkspaceName}
          />

          {/* Workspace Logo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#344054]">
              Workspace Logo
            </label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-[#f2f4f7] flex items-center justify-center">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/upload-01.svg`}
                  alt="Upload"
                  className="w-6 h-6"
                />
              </div>
              <div className="flex-1">
                <div className="px-4 py-3 border border-[#d0d5dd] rounded-lg text-center cursor-pointer hover:bg-[#f9fafb]">
                  <span className="text-[#4e6bd7] text-sm font-semibold">Click to upload</span>
                  <span className="text-[#475467] text-sm"> or drag and drop</span>
                  <p className="text-[#475467] text-sm">SVG, PNG, JPG or GIF (max. 800×400px)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Workspace URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#344054]">
              Workspace URL
            </label>
            <div className="flex">
              <span className="px-3.5 py-2.5 bg-[#f9fafb] border border-r-0 border-[#d0d5dd] rounded-l-lg text-[#344054]">
                app.process-flow.io/
              </span>
              <input
                type="text"
                placeholder={urlPlaceholder}
                value={workspaceUrl}
                onChange={(e) => setWorkspaceUrl(e.target.value)}
                className="flex-1 px-3.5 py-2.5 border border-[#d0d5dd] rounded-r-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4e6bd7]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-[#e4e7ec]">
          <ButtonNormal
            variant="secondaryGray"
            size="small"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </ButtonNormal>
          <ButtonNormal
            variant="primary"
            size="small"
            className="flex-1"
            onClick={handleSubmit}
          >
            Create workspace
          </ButtonNormal>
        </div>
      </div>
    </div>
  );
} 