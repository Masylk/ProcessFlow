import React, { useState, useEffect, useRef } from 'react';
import { Workspace } from '@/types/workspace';
import ButtonNormal from '../../components/ButtonNormal';
import InputField from '../../components/InputFields';
import ButtonDestructive from '@/app/components/ButtonDestructive';
import { useColors } from '@/app/theme/hooks';
import Modal from '@/app/components/Modal';
import { checkWorkspaceName } from '@/app/utils/checkNames';

interface WorkspaceSettingsProps {
  workspace: Workspace;
  onUpdate: (updates: Partial<Workspace>) => Promise<boolean>;
  onDelete?: (workspaceId: number) => Promise<void>;
}

// Maximum file size (1MB)
const MAX_FILE_SIZE = 1 * 1024 * 1024;

export default function WorkspaceSettings({
  workspace,
  onUpdate,
  onDelete,
}: WorkspaceSettingsProps) {
  const colors = useColors();
  const [name, setName] = useState(workspace.name || '');
  const [url, setUrl] = useState('');
  const [urlPlaceholder, setUrlPlaceholder] = useState('');
  const [reportsEnabled, setReportsEnabled] = useState(true);
  const [emailsEnabled, setEmailsEnabled] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    workspace.icon_url || null
  );
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle file upload when user selects a file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size before processing
      if (file.size > MAX_FILE_SIZE) {
        setError('File is too large. Maximum size is 1MB.');
        // Reset the file input
        if (e.target) e.target.value = '';
        return;
      }

      setError(''); // Clear any previous errors
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (isSaving) return;

    // Validate workspace name using utility function
    const nameCheck = checkWorkspaceName(name);
    if (nameCheck) {
      setNameError(nameCheck.description);
      return;
    } else {
      setNameError('');
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updates: Partial<Workspace> = {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
      };

      if (logoFile) {
        setIsUploadingLogo(true);
        try {
          // Create a FormData object to upload the file
          const formData = new FormData();
          formData.append('file', logoFile);
          formData.append('workspaceId', workspace.id.toString());

          // Upload the logo file
          const uploadResponse = await fetch('/api/upload/workspace-logo', {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || 'Failed to upload logo');
          }

          // Get the URL of the uploaded file and update the logo preview
          const { url } = await uploadResponse.json();
          setLogoPreview(url);

          // We need to update workspace in the parent component
          // Since the API directly updates the database, we need to sync the state
          // with the updated data to ensure immediate UI updates
          const updatedWorkspace = {
            ...workspace,
            icon_url: url,
          };

          // Call onUpdate to ensure the parent component knows about the change
          const success = await onUpdate({
            icon_url: url,
          });
          if (!success) return;
        } catch (error) {
          console.error('Error uploading logo:', error);
          throw error;
        } finally {
          setIsUploadingLogo(false);
        }
      } else if (logoPreview === null && workspace.icon_url) {
        updates.icon_url = null as unknown as string;
      }

      if (
        updates.name !== workspace.name ||
        (logoPreview === null && workspace.icon_url)
      ) {
        const success = await onUpdate(updates);
        setSaveSuccess(success);

        if (success) {
          // Reset success message after a delay
          setTimeout(() => {
            setSaveSuccess(false);
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error saving workspace settings:', error);
      setSaveSuccess(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteConfirmText('');
  };

  const handleDeleteWorkspace = async () => {
    if (!onDelete || deleteConfirmText !== workspace.name) return;

    setIsDeleting(true);
    try {
      await onDelete(workspace.id);
      // The parent component will handle redirecting after successful deletion
    } catch (error) {
      console.error('Error deleting workspace:', error);
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const copyWorkspaceName = () => {
    try {
      navigator.clipboard
        .writeText(workspace.name)
        .then(() => {
          // Show success message
          setCopySuccess(true);
          // Hide it after 2 seconds
          setTimeout(() => {
            setCopySuccess(false);
          }, 2000);
        })
        .catch((err) => {
          console.error('Failed to copy workspace name: ', err);
        });
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
    }
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
            <p style={{ color: colors['text-tertiary'] }} className="text-sm">
              Update your company photo and details here.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ButtonNormal variant="secondary" size="small">
              Cancel
            </ButtonNormal>
            <ButtonNormal
              variant="primary"
              size="small"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-t-transparent border-r-transparent"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                'Save'
              )}
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
            <p style={{ color: colors['text-tertiary'] }} className="text-sm">
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
            {nameError && (
              <div className="text-red-500 text-xs mt-1">{nameError}</div>
            )}
            <div className="flex">
              <span
                style={{
                  backgroundColor: colors['bg-secondary'],
                  borderColor: colors['border-secondary'],
                  color: colors['text-primary'],
                }}
                className="px-3.5 py-2.5 border border-r-0 rounded-l-lg"
              >
                app.process-flow.io/
              </span>
              <input
                type="text"
                placeholder={urlPlaceholder}
                value={url}
                readOnly
                style={{
                  borderColor: colors['border-secondary'],
                  color: colors['text-primary'],
                  backgroundColor: colors['bg-primary'],
                }}
                className="flex-1 px-3.5 py-2.5 border rounded-r-lg shadow-sm focus:outline-none cursor-default bg-gray-50"
                tabIndex={-1}
              />
            </div>
          </div>
        </div>

        <div
          style={{ backgroundColor: colors['border-secondary'] }}
          className="h-px hidden"
        />

        {/* Company Logo Section */}
        <div className="gap-8 flex">
          <div className="flex-1">
            <div className="flex flex-col gap-1">
              <div className="flex items-center">
                <span
                  style={{ color: colors['text-primary'] }}
                  className="text-sm font-semibold"
                >
                  Company logo
                </span>
                <span
                  style={{ color: colors['text-brand-tertiary'] }}
                  className="ml-0.5"
                >
                  *
                </span>
              </div>
              <span
                className="text-sm font-normal"
                style={{ color: colors['text-tertiary'] }}
              >
                Update your company logo and then choose where you want it to
                display.
              </span>
              <p
                style={{ color: colors['text-tertiary'] }}
                className="text-xs mt-1"
              >
                Maximum size: 1MB / Recommended size: 256x256px
              </p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/svg+xml,image/png,image/jpeg,image/gif"
              className="hidden"
            />
            <div
              className="relative group cursor-pointer"
              onClick={handleLogoClick}
            >
              {logoPreview ? (
                <div className="relative">
                  <div
                    style={{
                      backgroundImage: `url(${logoPreview})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      border: `2px solid ${colors['border-secondary']}`,
                    }}
                    className="shadow-sm"
                  />
                  {/* Edit overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-05.svg`}
                        alt="Edit"
                        className="w-5 h-5 brightness-[10]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div
                    style={{
                      backgroundColor: colors['bg-brand'],
                      color: colors['text-brand'],
                    }}
                    className="w-20 h-20 rounded-lg flex items-center justify-center font-semibold text-xl"
                  >
                    {workspace.name
                      ? workspace.name.charAt(0).toUpperCase()
                      : 'U'}
                  </div>
                  {/* Edit overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-05.svg`}
                        alt="Edit"
                        className="w-5 h-5 brightness-[10]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {error && <div className="text-red-500 text-xs">{error}</div>}

              <div className="flex items-center gap-3">
                {logoPreview && (
                  <ButtonNormal
                    variant="tertiary"
                    size="small"
                    leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-icon.svg`}
                    onClick={(e) => {
                      e.preventDefault();
                      setLogoPreview(null);
                      setLogoFile(null);
                    }}
                  >
                    Remove
                  </ButtonNormal>
                )}
                {isUploadingLogo && (
                  <div className="flex items-center">
                    <div
                      className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-r-transparent"
                      style={{ borderColor: colors['text-brand'] }}
                    ></div>
                    <span
                      className="ml-2 text-sm"
                      style={{ color: colors['text-secondary'] }}
                    >
                      Uploading...
                    </span>
                  </div>
                )}
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
              <p style={{ color: colors['text-tertiary'] }} className="text-sm">
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
        <div className="flex flex-col gap-6 mt-6">
          <div
            style={{ backgroundColor: colors['border-secondary'] }}
            className="h-px"
          />

          <div className="flex gap-8">
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
                onClick={handleDeleteClick}
              >
                Delete workspace
              </ButtonDestructive>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons at the bottom */}
      <div className="flex justify-end gap-3 mt-8">
        {saveSuccess && (
          <div className="flex items-center text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Changes saved</span>
          </div>
        )}
      </div>

      {/* Delete Workspace Confirmation Modal */}
      {isDeleteModalOpen && (
        <Modal
          onClose={closeDeleteModal}
          title="Delete workspace"
          icon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-delete.svg`}
          iconBackgroundColor="#fee3e1"
          actions={
            <>
              <ButtonNormal
                variant="secondary"
                size="small"
                onClick={closeDeleteModal}
                className="flex-1"
                disabled={isDeleting}
              >
                Cancel
              </ButtonNormal>
              <ButtonDestructive
                variant="primary"
                size="small"
                onClick={handleDeleteWorkspace}
                disabled={deleteConfirmText !== workspace.name || isDeleting}
                className="flex-1"
              >
                {isDeleting ? 'Deleting...' : 'Delete workspace'}
              </ButtonDestructive>
            </>
          }
          showActionsSeparator={true}
        >
          <div className="flex flex-col gap-4">
            <p style={{ color: colors['text-secondary'] }} className="text-sm">
              This action cannot be undone. This will permanently delete the
              workspace{' '}
              <span style={{ fontWeight: 'bold', userSelect: 'all' }}>
                {workspace.name}
              </span>{' '}
              and all of its data, including all workflows, folders, and
              settings.
            </p>
            <div
              style={{ color: colors['text-secondary'] }}
              className="text-sm mb-2"
            >
              <p>
                Please type{' '}
                <span style={{ fontWeight: 'bold' }}>{workspace.name}</span> to
                confirm.
              </p>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={copyWorkspaceName}
                  style={{
                    color: colors['primary'],
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="9"
                      y="9"
                      width="13"
                      height="13"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copy workspace name
                </button>
                {copySuccess && (
                  <span
                    style={{
                      color: '#10B981', // Green color for success
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Copied!
                  </span>
                )}
              </div>
            </div>

            {/* Custom input field to match the style in ConfirmDeleteModal */}
            <div className="mt-1">
              <input
                type="text"
                placeholder={`Type "${workspace.name}" to confirm`}
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg shadow-sm border text-sm"
                style={{
                  borderColor: colors['border-secondary'],
                  backgroundColor: colors['bg-primary'],
                  color: colors['text-primary'],
                }}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
