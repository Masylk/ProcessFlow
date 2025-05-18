// components/UserSettings.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@/types/user';
import ButtonNormal from '@/app/components/ButtonNormal';
import ButtonDestructive from '@/app/components/ButtonDestructive';
import InputField from '@/app/components/InputFields';
import { useColors } from '@/app/theme/hooks';
import { toast } from 'sonner';

interface UserSettingsProps {
  user: User;
  onClose: () => void;
  updateNewPassword: React.Dispatch<React.SetStateAction<string>>;
  passwordChanged: boolean;
  openDeleteAccount: () => void;
  onUserUpdate?: (updatedUser: User) => void;
}

// Utility to sanitize name input
function sanitizeNameInput(value: string): string {
  // Remove leading/trailing whitespace
  let sanitized = value.trim();

  // Remove any HTML tags
  sanitized = sanitized.replace(/<[^>]*>?/gm, '');

  // Allow only letters, spaces, hyphens, and apostrophes
  sanitized = sanitized.replace(/[^a-zA-ZÀ-ÿ' -]/g, '');

  return sanitized;
}

export default function UserSettings({
  user,
  onClose,
  updateNewPassword,
  passwordChanged,
  openDeleteAccount,
  onUserUpdate,
}: UserSettingsProps) {
  const colors = useColors();
  const supabase = createClient();

  // Local state for avatar deletion
  const [isDeleteAvatar, setIsDeleteAvatar] = useState(false);

  // Add local state for preview file and preview URL
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      window.location.href = '/login';
    }
  };

  // Update the avatar URL handling logic
  const defaultAvatar = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/images/default_avatar.png`;

  // First try to use the direct avatar_url (which could be a Google avatar URL)
  // Then fall back to avatar_signed_url if it exists
  // Finally use the default avatar
  const avatarSrc = user.avatar_url
    ? user.avatar_url.startsWith('http')
      ? user.avatar_url // Use as is if it's a full URL (like Google avatar)
      : user.avatar_signed_url
        ? user.avatar_signed_url
        : defaultAvatar
    : defaultAvatar;

  // Local state for file upload and preview.
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for editable fields.
  const [firstName, setFirstName] = useState<string>(
    sanitizeNameInput(user.first_name).slice(0, 40)
  );
  const [lastName, setLastName] = useState<string>(
    sanitizeNameInput(user.last_name).slice(0, 40)
  );
  const [newEmail, setNewEmail] = useState<string>(user.email);

  // New states for password change section.
  const [showPasswordForm, setShowPasswordForm] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');

  // Error messages for password fields.
  const [oldPasswordError, setOldPasswordError] = useState<string>('');
  const [newPasswordError, setNewPasswordError] = useState<string>('');
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');

  // Add this to your existing state declarations
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Update local state when user changes.
  useEffect(() => {
    setFirstName(sanitizeNameInput(user.first_name).slice(0, 40));
    setLastName(sanitizeNameInput(user.last_name).slice(0, 40));
    setNewEmail(user.email);
  }, [user]);

  // --- Add these handlers for sanitization and length cap ---
  const handleFirstNameChange = (value: string) => {
    const sanitized = sanitizeNameInput(value).slice(0, 40);
    setFirstName(sanitized);
  };

  const handleLastNameChange = (value: string) => {
    const sanitized = sanitizeNameInput(value).slice(0, 40);
    setLastName(sanitized);
  };

  // --- Sanitize email input as well ---
  const handleEmailChange = (value: string) => {
    setNewEmail(value.trim().replace(/<[^>]*>?/gm, ''));
  };

  // --- Update file input handler for type/size check ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type (image only)
      if (!file.type.startsWith('image/')) {
        toast.error('Invalid file type', {
          description: 'Please select a valid image file.',
          duration: 5000,
        });
        event.target.value = '';
        return;
      }
      // Check file size (max 1MB)
      if (file.size > 1024 * 1024) {
        toast.error('File too large', {
          description: 'Image must be less than 1MB.',
          duration: 5000,
        });
        event.target.value = '';
        return;
      }

      setIsDeleteAvatar(false);

      setPreviewFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      if (process.env.NODE_ENV !== 'production') {
        console.log('Selected file:', {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        });
      }
    }
    event.target.value = '';
  };

  // Clean up the preview URL when the component unmounts or when a new file is selected
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Simple email validation.
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle the change email button.
  const handleChangeEmail = async () => {
    if (newEmail === user.email) return; // Nothing to change.
    if (!validateEmail(newEmail)) {
      toast.error('Invalid Email', {
        description: 'Please enter a valid email address.',
        duration: 5000,
      });
      return;
    }
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      console.error('Error updating email:', error.message);
      toast.error('Failed to Update Email', {
        description: error.message,
        duration: 5000,
      });
      return;
    }
    toast.success('Confirmation Email Sent', {
      description:
        'Please check your new email inbox and click the confirmation link to complete the email change.',
      duration: 7000,
    });
    // Note: We don't update the parent component here anymore since the email isn't actually changed yet
  };

  // Save changes: upload new avatar (if selected) and update the user record (excluding email).
  const handleSave = async () => {
    setIsSaving(true);
    try {
      let newAvatarUrl = user.avatar_url; // Default to current avatar.

      // If a new file was selected, perform the upload.
      if (previewFile && !isDeleteAvatar) {
        try {
          const formData = new FormData();
          formData.append('file', previewFile);

          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          const uploadData = await uploadRes.json();

          if (uploadRes.ok && uploadData.filePath) {
            newAvatarUrl = uploadData.filePath;
          } else {
            console.error('File upload failed', uploadData.error);
          }
        } catch (error) {
          console.error('Error during file upload:', error);
        }
      }

      // Compute full_name based on updated firstName and lastName.
      const fullName = `${firstName} ${lastName}`;

      // Update the user record in your database (excluding the email update).
      const updateRes = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          avatar_url: newAvatarUrl,
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          delete_avatar: isDeleteAvatar,
        }),
      });

      if (updateRes.ok) {
        const updatedUser = await updateRes.json();
        if (onUserUpdate) {
          onUserUpdate(updatedUser);
        }
      } else {
        console.error('Failed to update user information');
      }

      // Close the modal after saving.
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle canceling the password change.
  const handleCancelPasswordChange = () => {
    setShowPasswordForm(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setOldPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');
  };

  // Handle updating the password.
  const handleUpdatePassword = async () => {
    // Reset previous error messages
    setOldPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');

    // Check that new password is at least 6 characters
    if (newPassword.length < 6) {
      setNewPasswordError('The new password must be at least 6 characters.');
      return;
    }

    // Check that new password and confirm password match
    if (newPassword !== confirmNewPassword) {
      setConfirmPasswordError('The passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      // Verify that the old password is correct
      const data = {
        email: user.email as string,
        password: oldPassword as string,
      };

      const { error } = await supabase.auth.signInWithPassword(data);
      if (error) {
        setOldPasswordError('The old password is incorrect.');
        return;
      }

      updateNewPassword(newPassword);
      handleCancelPasswordChange();
    } catch (error) {
      console.error('Error updating password:', error);
    } finally {
      setIsUpdatingPassword(false);
    }
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
        style={{ backgroundColor: colors['bg-primary'] }}
        className="w-[628px] max-h-[90vh] rounded-xl shadow-[0px_8px_8px_-4px_rgba(16,24,40,0.03)] flex-col justify-start items-start inline-flex overflow-hidden relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="self-stretch h-[92px] flex-col justify-start items-center flex">
          <div className="self-stretch px-6 pt-6 justify-start items-center gap-4 inline-flex">
            <div
              style={{ backgroundColor: colors['bg-tertiary'] }}
              className="w-12 h-12 p-3 rounded-full justify-center items-center flex overflow-hidden"
            >
              <div className="w-6 h-6 relative flex-col justify-start items-start flex overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/user-profile.svg`}
                  alt="Settings Icon"
                  className="w-6 h-6 object-contain"
                />
              </div>
            </div>
            <div className="w-[432px] flex-col justify-start items-start gap-1 inline-flex">
              <div
                style={{ color: colors['text-primary'] }}
                className="self-stretch text-lg font-semibold font-['Inter'] leading-7"
              >
                Account settings
              </div>
            </div>
          </div>
          <div className="self-stretch h-5" />
        </div>

        {/* Body */}
        <div className="self-stretch overflow-y-auto flex-1 w-full">
          <div className="w-full p-6 flex-col justify-start items-start gap-5 inline-flex">
            {/* Main settings form */}
            <div className="w-full flex-col justify-start items-start gap-6 flex">
              <div className="w-full flex-col justify-start items-start gap-5 flex pr-4">
                {/* Photo & Name section */}
                <div className="w-full flex-col justify-start items-start gap-4 flex">
                  {/* Photo label */}
                  <div className="w-full flex-col justify-start items-start flex">
                    <div className="inline-flex gap-0.5">
                      <div
                        style={{ color: colors['text-primary'] }}
                        className="text-sm font-semibold font-['Inter'] leading-tight"
                      >
                        Your photo
                      </div>
                    </div>
                    <div
                      style={{ color: colors['text-secondary'] }}
                      className="self-stretch text-sm font-normal font-['Inter'] leading-tight"
                    >
                      This will be displayed as your avatar.
                    </div>
                  </div>
                  {/* Photo controls */}
                  <div className="w-full justify-start items-center gap-4 inline-flex">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div
                      className="w-16 h-16 rounded-full justify-center overflow-hidden items-center flex relative group cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div
                        style={{ borderColor: colors['border-secondary'] }}
                        className="w-16 h-16 relative rounded-full border"
                      >
                        <img
                          src={
                            isDeleteAvatar
                              ? defaultAvatar
                              : previewUrl
                                ? previewUrl
                                : avatarSrc
                          }
                          alt="User Avatar"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        {/* Edit overlay on hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <img
                              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-05.svg`}
                              alt="Edit"
                              className="w-5 h-5 brightness-[10]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <ButtonDestructive
                      variant="tertiary"
                      size="small"
                      leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-icon.svg`}
                      onClick={() => setIsDeleteAvatar(true)}
                    >
                      Delete
                    </ButtonDestructive>
                  </div>
                  {/* Name section */}
                  <div className="w-full flex-col justify-start items-start gap-4 flex">
                    <div className="w-full flex-col justify-start items-start flex">
                      <div className="inline-flex gap-0.5">
                        <div
                          style={{ color: colors['text-primary'] }}
                          className="text-sm font-semibold font-['Inter'] leading-tight"
                        >
                          Name
                        </div>
                      </div>
                    </div>
                    <div className="w-full justify-start items-center gap-4 inline-flex">
                      <div className="grow shrink basis-0 flex-col justify-start items-start gap-1.5 inline-flex">
                        <InputField
                          type="default"
                          value={lastName}
                          onChange={handleLastNameChange}
                          placeholder="Last name"
                        />
                      </div>
                      <div className="grow shrink basis-0 flex-col justify-start items-start gap-1.5 inline-flex">
                        <InputField
                          type="default"
                          value={firstName}
                          onChange={handleFirstNameChange}
                          placeholder="First name"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Divider */}
                <div
                  style={{ borderColor: colors['border-secondary'] }}
                  className="w-full border-b flex-col justify-start items-start flex"
                />
                {/* Email section */}
                <div className="w-full flex-col justify-start items-start gap-4 flex">
                  <div className="w-full flex-col justify-start items-start flex">
                    <div className="inline-flex gap-0.5">
                      <div
                        style={{ color: colors['text-primary'] }}
                        className="text-sm font-semibold font-['Inter'] leading-tight"
                      >
                        Email
                      </div>
                    </div>
                  </div>
                  <div className="w-full justify-start items-center gap-4 inline-flex">
                    <div className="grow shrink basis-0 flex-col justify-start items-start gap-1.5 inline-flex">
                      <div className="w-full h-10 flex-col justify-start items-start gap-1.5 flex">
                        <div className="relative w-full">
                          <InputField
                            type="default"
                            value={newEmail}
                            iconColor={colors['text-primary']}
                            onChange={handleEmailChange}
                            placeholder="Enter email"
                            iconUrl={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/mail-01.svg`}
                          />
                        </div>
                      </div>
                    </div>
                    <ButtonNormal
                      variant="secondary"
                      size="small"
                      onClick={handleChangeEmail}
                      disabled={newEmail === user.email}
                      className="h-full"
                    >
                      Change email
                    </ButtonNormal>
                  </div>
                </div>
                {/* Divider */}
                <div
                  style={{ borderColor: colors['border-secondary'] }}
                  className="w-full border-b flex-col justify-start items-start flex"
                />
                {/* Password section */}

                {!showPasswordForm ? (
                  // When the form is hidden, show the change password button.
                  <div className="w-full flex flex-col gap-4">
                    {/* Header and Change Password Button */}
                    <div className="w-full flex flex-col gap-4">
                      <div className="w-full flex items-center">
                        <div className="inline-flex gap-0.5">
                          <div
                            style={{ color: colors['text-primary'] }}
                            className="text-sm font-semibold font-['Inter'] leading-tight"
                          >
                            Password
                          </div>
                        </div>
                      </div>
                      <ButtonNormal
                        variant="secondary"
                        size="small"
                        onClick={() => setShowPasswordForm(true)}
                        className="w-fit"
                      >
                        Change password
                      </ButtonNormal>
                    </div>

                    {/* Confirmation Message - displayed when passwordChanged is true */}
                    {passwordChanged && (
                      <div className="h-[52px] py-0 rounded-xl flex items-center gap-4 mt-0">
                        <div
                          style={{ backgroundColor: colors['bg-success'] }}
                          className="w-5 h-5 rounded-full overflow-hidden"
                        >
                          <img
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-icon-green.svg`}
                            alt="Mail Icon"
                            className="w-5 h-5 object-contain"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div
                            style={{ color: colors['text-primary'] }}
                            className="text-sm font-semibold font-['Inter'] leading-tight"
                          >
                            Your password has been changed successfully
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // When the form is displayed, show the full password change section.
                  <div className="flex flex-col w-96 gap-4 rounded-lg">
                    <div
                      style={{ color: colors['text-primary'] }}
                      className="text-sm font-semibold font-['Inter'] leading-tight"
                    >
                      Password
                    </div>
                    <div className="flex flex-col gap-4">
                      {/* Old password field */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          style={{ color: colors['text-primary'] }}
                          className="text-sm font-medium font-['Inter'] leading-tight"
                        >
                          Old password
                        </label>
                        <InputField
                          type="password"
                          value={oldPassword}
                          onChange={setOldPassword}
                          placeholder="Old password"
                          iconColor={colors['text-primary']}
                          errorMessage={oldPasswordError}
                        />
                      </div>

                      {/* New password field */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          style={{ color: colors['text-primary'] }}
                          className="text-sm font-medium font-['Inter'] leading-tight"
                        >
                          New password
                        </label>
                        <InputField
                          type="password"
                          value={newPassword}
                          iconColor={colors['text-primary']}
                          onChange={setNewPassword}
                          placeholder="New password"
                          errorMessage={newPasswordError}
                        />
                      </div>

                      {/* Confirm new password field */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          style={{ color: colors['text-primary'] }}
                          className="text-sm font-medium font-['Inter'] leading-tight"
                        >
                          Confirm new password
                        </label>
                        <InputField
                          type="password"
                          value={confirmNewPassword}
                          iconColor={colors['text-primary']}
                          onChange={setConfirmNewPassword}
                          placeholder="Confirm new password"
                          errorMessage={confirmPasswordError}
                        />
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex gap-4">
                      <ButtonNormal
                        variant="secondary"
                        size="small"
                        onClick={handleCancelPasswordChange}
                      >
                        Cancel change
                      </ButtonNormal>
                      <ButtonNormal
                        variant="primary"
                        size="small"
                        onClick={handleUpdatePassword}
                        isLoading={isUpdatingPassword}
                        loadingText="Updating password..."
                      >
                        Update password
                      </ButtonNormal>
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div
                  style={{ borderColor: colors['border-secondary'] }}
                  className="w-full border-b flex-col justify-start items-start flex"
                />

                {/* Account Security section */}
                <div className="w-full flex-col justify-start items-start gap-4 flex">
                  <div className="w-full flex-col justify-start items-start flex">
                    <div className="inline-flex gap-0.5">
                      <div
                        style={{ color: colors['text-primary'] }}
                        className="text-sm font-semibold font-['Inter'] leading-tight"
                      >
                        Account Security
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <ButtonNormal
                      variant="secondary"
                      size="small"
                      leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/log-out-icon.svg`}
                      onClick={() => handleLogout()}
                    >
                      Log out
                    </ButtonNormal>
                    <ButtonDestructive
                      variant="secondary"
                      size="small"
                      leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/delete-icon-red.svg`}
                      onClick={() => openDeleteAccount()}
                    >
                      Delete my account
                    </ButtonDestructive>
                  </div>
                </div>
              </div>
              {/* Divider */}
              <div
                style={{ borderColor: colors['border-secondary'] }}
                className="w-full border-b flex-col justify-start items-start flex"
              />
              {/* Footer buttons */}
              <div className="w-full flex-col justify-start items-center gap-5 flex">
                <div className="w-full flex justify-end items-center gap-5">
                  <div className="grow shrink basis-0 h-10 flex justify-end items-center gap-3">
                    <ButtonNormal
                      variant="secondary"
                      size="small"
                      onClick={onClose}
                    >
                      Cancel
                    </ButtonNormal>
                    <ButtonNormal
                      variant="primary"
                      size="small"
                      onClick={handleSave}
                      isLoading={isSaving}
                      loadingText="Saving..."
                    >
                      Save
                    </ButtonNormal>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
