import React, { useState } from 'react';
import { Workspace } from '@/types/workspace';
import ButtonNormal from '../../components/ButtonNormal';
import InputField from '../../components/InputFields';
import ButtonDestructive from '@/app/components/ButtonDestructive';

interface WorkspaceSettingsProps {
  workspace: Workspace;
  onUpdate: (updates: Partial<Workspace>) => Promise<void>;
}

export default function WorkspaceSettings({ workspace, onUpdate }: WorkspaceSettingsProps) {
  const [name, setName] = useState(workspace.name || 'Untitled UI');
  const [url, setUrl] = useState('untitled');
  const [tagline, setTagline] = useState('Untitled UI is the ultimate Figma UI kit and design system. Kickstart any project and level up as a designer.');
  const [reportsEnabled, setReportsEnabled] = useState(true);
  const [emailsEnabled, setEmailsEnabled] = useState(true);

  const handleSave = async () => {
    await onUpdate({
      name,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-semibold text-lightMode-text-primary">Company profile</h2>
            <p className="text-sm text-lightMode-text-tertiary">Update your company photo and details here.</p>
          </div>
          <div className="flex items-center gap-3">
            <ButtonNormal
              variant="secondaryGray"
              size="small"
            >
              Cancel
            </ButtonNormal>
            <ButtonNormal
              variant="primary"
              size="small"
              onClick={handleSave}
            >
              Save
            </ButtonNormal>
          </div>
        </div>
        <div className="h-px bg-lightMode-border-secondary" />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-5">
        {/* Public Profile Section */}
        <div className="flex gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-0.5">
              <span className="text-sm font-semibold text-lightMode-text-primary">Workspace name</span>
              <span className="text-lightMode-text-brand-tertiary">*</span>
            </div>
            <p className="text-sm text-lightMode-text-tertiary">This will be used to identify your workspace in the URL.</p>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <InputField
              type="default"
              value={name}
              onChange={setName}
              placeholder="Enter workspace name"
            />
            <InputField
              type="leading-text"
              
              value={url}
              onChange={setUrl}
              placeholder="Enter URL"
            />
          </div>
        </div>

        <div className="h-px bg-lightMode-border-secondary" />

        {/* Company Logo Section */}
        <div className="flex gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-0.5">
              <span className="text-sm font-semibold text-lightMode-text-primary">Company logo</span>
              <span className="text-lightMode-text-brand-tertiary">*</span>
            </div>
            <p className="text-sm text-lightMode-text-tertiary">Update your company logo and then choose where you want it to display.</p>
          </div>
          <div className="flex-1 flex gap-8">
            <div className="pt-4">
              <div className="w-8 h-8 rounded-lg bg-lightMode-bg-brand flex items-center justify-center text-lightMode-text-brand font-semibold">
                U
              </div>
            </div>
            <div className="flex-1">
              <div className="p-6 border-2 border-dashed border-lightMode-border-secondary rounded-lg flex flex-col items-center justify-center gap-1 bg-lightMode-bg-primary">
                <p className="text-sm font-semibold text-lightMode-text-brand">Click to upload</p>
                <p className="text-sm text-lightMode-text-secondary">or drag and drop</p>
                <p className="text-sm text-lightMode-text-secondary">SVG, PNG, JPG or GIF (max. 800x400px)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-lightMode-border-secondary" />

        {/* Branding Section */}
        <div className="flex gap-8">
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-lightMode-text-primary">Branding</span>
              <p className="text-sm text-lightMode-text-tertiary">Add your logo to reports and emails.</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={reportsEnabled}
                onChange={(e) => setReportsEnabled(e.target.checked)}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium text-lightMode-text-primary">Reports</p>
                <p className="text-sm text-lightMode-text-tertiary">Include my logo in summary reports.</p>
              </div>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={emailsEnabled}
                onChange={(e) => setEmailsEnabled(e.target.checked)}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium text-lightMode-text-primary">Emails</p>
                <p className="text-sm text-lightMode-text-tertiary">Include my logo in customer emails.</p>
              </div>
            </label>
          </div>
        </div>

        <div className="h-px bg-lightMode-border-secondary" />

        {/* Branding Section */}
        <div className="flex gap-8">
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-lightMode-text-primary">Danger zone</span>
              <p className="text-sm text-lightMode-text-tertiary">Delete your workspace</p>
            </div>
          </div>
          <div className="flex-1 flex ">
            <ButtonDestructive
              variant="secondary"
              size="small"
            >
              Delete workspace
            </ButtonDestructive>
        
          </div>
        </div>
      </div>
    </div>
  );
} 