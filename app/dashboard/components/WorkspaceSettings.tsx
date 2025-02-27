import React, { useState, useEffect } from 'react';
import { Workspace } from '@/types/workspace';
import ButtonNormal from '../../components/ButtonNormal';
import InputField from '../../components/InputFields';
import ButtonDestructive from '@/app/components/ButtonDestructive';
import { useColors } from '@/app/theme/hooks';

interface WorkspaceSettingsProps {
  workspace: Workspace;
  onUpdate: (updates: Partial<Workspace>) => Promise<void>;
}

export default function WorkspaceSettings({ workspace, onUpdate }: WorkspaceSettingsProps) {
  const colors = useColors();
  const [name, setName] = useState(workspace.name || '');
  const [url, setUrl] = useState('');
  const [urlPlaceholder, setUrlPlaceholder] = useState('');
  const [reportsEnabled, setReportsEnabled] = useState(true);
  const [emailsEnabled, setEmailsEnabled] = useState(true);

  useEffect(() => {
    if (name) {
      const suggestedUrl = name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      
      setUrlPlaceholder(suggestedUrl);
    } else {
      setUrlPlaceholder('');
    }
  }, [name]);

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
            <h2 
              style={{ color: colors['text-primary'] }}
              className="text-[18px] font-semibold"
            >
              Company profile
            </h2>
            <p 
              style={{ color: colors['text-tertiary'] }}
              className="text-sm"
            >
              Update your company photo and details here.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ButtonNormal
              variant="secondary"
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
        <div 
          style={{ backgroundColor: colors['border-secondary'] }}
          className="h-px" 
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-5">
        {/* Public Profile Section */}
        <div className="flex gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-0.5">
              <span 
                style={{ color: colors['text-primary'] }}
                className="text-sm font-semibold"
              >
                Workspace name
              </span>
              <span style={{ color: colors['text-brand-tertiary'] }}>*</span>
            </div>
            <p 
              style={{ color: colors['text-tertiary'] }}
              className="text-sm"
            >
              This will be used to identify your workspace in the URL.
            </p>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <InputField
              type="default"
              value={name}
              onChange={setName}
              placeholder="Enter workspace name"
            />
            <div className="flex">
              <span 
                style={{ 
                  backgroundColor: colors['bg-secondary'],
                  borderColor: colors['border-secondary'],
                  color: colors['text-primary']
                }}
                className="px-3.5 py-2.5 border border-r-0 rounded-l-lg"
              >
                app.process-flow.io/
              </span>
              <input
                type="text"
                placeholder={urlPlaceholder}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{ 
                  borderColor: colors['border-secondary'],
                  color: colors['text-primary'],
                  backgroundColor: colors['bg-primary']
                }}
                className="flex-1 px-3.5 py-2.5 border rounded-r-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4e6bd7]"
              />
            </div>
          </div>
        </div>

        <div 
          style={{ backgroundColor: colors['border-secondary'] }}
          className="h-px hidden" 
        />

        {/* Company Logo Section */}
        <div className="gap-8 hidden">
          <div className="flex-1">
            <div className="flex items-center gap-0.5">
              <span 
                style={{ color: colors['text-primary'] }}
                className="text-sm font-semibold"
              >
                Company logo
              </span>
              <span style={{ color: colors['text-brand-tertiary'] }}>*</span>
            </div>
            <p 
              style={{ color: colors['text-tertiary'] }}
              className="text-sm"
            >
              Update your company logo and then choose where you want it to display.
            </p>
          </div>
          <div className="flex-1 flex gap-8">
            <div className="pt-4">
              <div 
                style={{ 
                  backgroundColor: colors['bg-brand'],
                  color: colors['text-brand']
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center font-semibold"
              >
                U
              </div>
            </div>
            <div className="flex-1">
              <div 
                style={{ 
                  backgroundColor: colors['bg-primary'],
                  borderColor: colors['border-secondary']
                }}
                className="p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1"
              >
                <p 
                  style={{ color: colors['text-brand'] }}
                  className="text-sm font-semibold"
                >
                  Click to upload
                </p>
                <p 
                  style={{ color: colors['text-secondary'] }}
                  className="text-sm"
                >
                  or drag and drop
                </p>
                <p 
                  style={{ color: colors['text-secondary'] }}
                  className="text-sm"
                >
                  SVG, PNG, JPG or GIF (max. 800x400px)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div 
          style={{ backgroundColor: colors['border-secondary'] }}
          className="h-px hidden" 
        />

        {/* Branding Section */}
        <div className="hidden gap-8">
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex flex-col">
              <span 
                style={{ color: colors['text-primary'] }}
                className="text-sm font-semibold"
              >
                Branding
              </span>
              <p 
                style={{ color: colors['text-tertiary'] }}
                className="text-sm"
              >
                Add your logo to reports and emails.
              </p>
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
                <p 
                  style={{ color: colors['text-primary'] }}
                  className="text-sm font-medium"
                >
                  Reports
                </p>
                <p 
                  style={{ color: colors['text-tertiary'] }}
                  className="text-sm"
                >
                  Include my logo in summary reports.
                </p>
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
                <p 
                  style={{ color: colors['text-primary'] }}
                  className="text-sm font-medium"
                >
                  Emails
                </p>
                <p 
                  style={{ color: colors['text-tertiary'] }}
                  className="text-sm"
                >
                  Include my logo in customer emails.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div 
          style={{ backgroundColor: colors['border-secondary'] }}
          className="h-px hidden" 
        />

        {/* Danger Zone Section */}
        <div className="hidden gap-8">
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex flex-col">
              <span 
                style={{ color: colors['text-primary'] }}
                className="text-sm font-semibold"
              >
                Danger zone
              </span>
              <p 
                style={{ color: colors['text-tertiary'] }}
                className="text-sm"
              >
                Delete your workspace
              </p>
            </div>
          </div>
          <div className="flex-1 flex">
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