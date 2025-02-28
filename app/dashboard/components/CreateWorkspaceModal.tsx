import React, { useState, useEffect } from 'react';
import ButtonNormal from '@/app/components/ButtonNormal';
import InputField from '@/app/components/InputFields';
import { useColors } from '@/app/theme/hooks';

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
  const colors = useColors();

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
      className="fixed inset-0 flex items-center justify-center p-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0">
        <div 
          style={{ backgroundColor: colors['bg-overlay'] }}
          className="absolute inset-0 opacity-70" 
        />
      </div>

      <div 
        className="rounded-xl shadow-lg w-[480px] flex flex-col relative z-10"
        style={{ backgroundColor: colors['bg-primary'] }}
        onClick={handleModalClick}
      >
        {/* Header */}
        <div className="flex flex-col items-start gap-4 px-6 pt-6">
          <div 
            className="w-12 h-12 p-3 rounded-[10px] border shadow-sm flex items-center justify-center"
            style={{ 
              backgroundColor: colors['bg-primary'],
              borderColor: colors['border-secondary']
            }}
          >
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon.svg`}
              alt="Workspace icon"
              className="w-6 h-6"
            />
          </div>
          <div className="flex flex-col gap-1">
            <h2 
              className="text-lg font-semibold"
              style={{ color: colors['text-primary'] }}
            >
              Create a new workspace
            </h2>
            <p 
              className="text-sm"
              style={{ color: colors['text-secondary'] }}
            >
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
            <label 
              className="text-sm font-medium"
              style={{ color: colors['text-primary'] }}
            >
              Workspace Logo
            </label>
            <div className="flex items-center gap-3">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: colors['bg-secondary'] }}
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/upload-01.svg`}
                  alt="Upload"
                  className="w-6 h-6"
                />
              </div>
              <div className="flex-1">
                <div 
                  className="px-4 py-3 border rounded-lg text-center cursor-pointer transition-colors duration-200"
                  style={{ 
                    borderColor: colors['border-secondary'],
                    backgroundColor: colors['bg-primary'],
                    '--hover-bg': colors['bg-secondary']
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors['bg-secondary'];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors['bg-primary'];
                  }}
                >
                  <span style={{ color: colors['text-accent'] }} className="text-sm font-semibold">Click to upload</span>
                  <span style={{ color: colors['text-secondary'] }} className="text-sm"> or drag and drop</span>
                  <p style={{ color: colors['text-secondary'] }} className="text-sm">SVG, PNG, JPG or GIF (max. 800×400px)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Workspace URL */}
          <div className="flex flex-col gap-1.5">
            <label 
              className="text-sm font-medium"
              style={{ color: colors['text-primary'] }}
            >
              Workspace URL
            </label>
            <div className="flex">
              <span 
                className="px-3.5 py-2.5 border border-r-0 rounded-l-lg"
                style={{ 
                  backgroundColor: colors['bg-secondary'],
                  borderColor: colors['border-secondary'],
                  color: colors['text-primary']
                }}
              >
                app.process-flow.io/
              </span>
              <input
                type="text"
                placeholder={urlPlaceholder}
                value={workspaceUrl}
                onChange={(e) => setWorkspaceUrl(e.target.value)}
                className="flex-1 px-3.5 py-2.5 border rounded-r-lg transition-all duration-200"
                style={{ 
                  backgroundColor: colors['bg-primary'],
                  borderColor: colors['border-secondary'],
                  color: colors['text-primary'],
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors['border-focus'];
                  e.target.style.boxShadow = "0px 0px 0px 4px rgba(78,107,215,0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors['border-secondary'];
                  e.target.style.boxShadow = "0px 1px 2px rgba(16, 24, 40, 0.05)";
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="flex gap-3 p-6 border-t"
          style={{ borderColor: colors['border-secondary'] }}
        >
          <ButtonNormal
            variant="secondary"
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