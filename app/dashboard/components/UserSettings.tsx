// components/UserSettings.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@/types/user';
import ButtonNormal from '@/app/components/ButtonNormal';
import ButtonDestructive from '@/app/components/ButtonDestructive';
import InputField from '@/app/components/InputFields';

interface UserSettingsProps {
  user: User;
  onClose: () => void;
  updateNewPassword: React.Dispatch<React.SetStateAction<string>>;  
  passwordChanged: boolean;
  openImageUpload: () => void;
  openDeleteAccount: () => void;
  onUserUpdate?: (updatedUser: User) => void;
  selectedFile: File | null;
  isDeleteAvatar: boolean;
  onDeleteAvatar: () => void;
}

export default function UserSettings({
  user,
  onClose,
  updateNewPassword,
  passwordChanged,
  openImageUpload,
  openDeleteAccount,
  onUserUpdate,
  selectedFile,
  isDeleteAvatar,
  onDeleteAvatar,
}: UserSettingsProps) {
  const supabase = createClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      console.log('Successfully logged out');
      window.location.href = '/login';
    }
  };

  // Default avatar if none provided.
  const defaultAvatar = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/images/default_avatar.png`;
  const avatarSrc = user.avatar_signed_url
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${user.avatar_signed_url}`
    : defaultAvatar;

  // Local state for file upload and preview.
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Local state for editable fields.
  const [firstName, setFirstName] = useState<string>(user.first_name);
  const [lastName, setLastName] = useState<string>(user.last_name);
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
    setFirstName(user.first_name);
    setLastName(user.last_name);
    setNewEmail(user.email);
  }, [user]);

  useEffect(() => {
    if (selectedFile) {
      const objectURL = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectURL);
    }
  }, [selectedFile]);

  // Trigger the file selector.
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Simple email validation.
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle the change email button.
  const handleChangeEmail = async () => {
    if (newEmail === user.email) return; // Nothing to change.
    if (!validateEmail(newEmail)) {
      alert('Veuillez entrer une adresse email valide.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      console.error("Erreur lors de la mise à jour de l'email:", error.message);
      alert("Erreur lors de la mise à jour de l'email : " + error.message);
      return;
    }
    alert('Adresse email mise à jour avec succès via Supabase.');
    // Optionally update the parent component.
    if (onUserUpdate) {
      onUserUpdate({ ...user, email: newEmail });
    }
  };

  // Save changes: upload new avatar (if selected) and update the user record (excluding email).
  const handleSave = async () => {
    setIsSaving(true);
    try {
      let newAvatarUrl = user.avatar_url; // Default to current avatar.

      // If a new file was selected, perform the upload.
      if (selectedFile && !isDeleteAvatar) {
        try {
          const formData = new FormData();
          formData.append('file', selectedFile);

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
        console.log('User updated successfully');
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
        setOldPasswordError("The old password is incorrect.");
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

  // Clean up the preview URL when the component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-8 bg-[#0c111d] bg-opacity-40"
      onClick={onClose}
    >
      <div 
        className="w-[628px] h-fit bg-white rounded-xl shadow-[0px_8px_8px_-4px_rgba(16,24,40,0.03)] flex-col justify-start items-start inline-flex overflow-hidden relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="self-stretch h-[92px] flex-col justify-start items-center flex">
          <div className="self-stretch px-6 pt-6 justify-start items-center gap-4 inline-flex">
            <div className="w-12 h-12 p-3 bg-[#f2f4f7] rounded-full justify-center items-center flex overflow-hidden">
              <div className="w-6 h-6 relative flex-col justify-start items-start flex overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/settings-icon.svg`}
                  alt="Settings Icon"
                  className="w-6 h-6 object-contain"
                />
              </div>
            </div>
            <div className="w-[432px] flex-col justify-start items-start gap-1 inline-flex">
              <div className="self-stretch text-[#101828] text-lg font-semibold font-['Inter'] leading-7">
                Account settings
              </div>
            </div>
          </div>
          <div className="self-stretch h-5" />
        </div>

        {/* Body */}
        <div className="self-stretch justify-start items-center inline-flex">
          <div className="grow shrink basis-0 p-6 flex-col justify-start items-start gap-5 inline-flex">
            
            {/* Main settings form */}
            <div className="self-stretch h-min flex-col justify-start items-start gap-6 flex">
              <div className="self-stretch h-[579px] p-1 flex-col justify-start items-start gap-5 flex pr-4 overflow-auto">
                {/* Photo & Name section */}
                <div className="self-stretch h-[216px] flex-col justify-start items-start gap-4 flex">
                  {/* Photo label */}
                  <div className="self-stretch h-10 flex-col justify-start items-start flex">
                    <div className="inline-flex gap-0.5">
                      <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                        Your photo
                      </div>
                    </div>
                    <div className="self-stretch text-[#475467] text-sm font-normal font-['Inter'] leading-tight">
                      This will be displayed as your avatar.
                    </div>
                  </div>
                  {/* Photo controls */}
                  <div className="self-stretch justify-start items-center gap-4 inline-flex">
                    <div className="w-16 h-16 rounded-full justify-center items-center flex">
                      <div className="w-16 h-16 relative rounded-full border border-black/10">
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
                      </div>
                    </div>
                    <ButtonNormal
                      variant="secondaryColor"
                      mode="light"
                      size="small"
                      leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/upload-icon.svg`}
                      onClick={() => openImageUpload()}
                    >
                      Upload new picture
                    </ButtonNormal>
                    <ButtonDestructive
                      variant="tertiary"
                      mode="light"
                      size="small"
                      leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-icon.svg`}
                      onClick={() => onDeleteAvatar()}
                    >
                      Delete
                    </ButtonDestructive>
                  </div>
                  {/* Name section */}
                  <div className="self-stretch h-20 flex-col justify-start items-start gap-4 flex">
                    <div className="self-stretch h-5 flex-col justify-start items-start flex">
                      <div className="inline-flex gap-0.5">
                        <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                          Name
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch justify-start items-center gap-4 inline-flex">
                      <div className="grow shrink basis-0 flex-col justify-start items-start gap-1.5 inline-flex">
                        <InputField
                          type="default"
                          mode="light"
                          value={lastName}
                          onChange={setLastName}
                          placeholder="Last name"
                        />
                      </div>
                      <div className="grow shrink basis-0 flex-col justify-start items-start gap-1.5 inline-flex">
                        <InputField
                          type="default"
                          mode="light"
                          value={firstName}
                          onChange={setFirstName}
                          placeholder="First name"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                 {/* Divider */}
                 <div className="self-stretch border-b border-[#e4e7ec] flex-col justify-start items-start flex" />
                {/* Email section */}
                <div className="self-stretch h-20 flex-col justify-start items-start gap-4 flex">
                  <div className="self-stretch h-5 flex-col justify-start items-start flex">
                    <div className="inline-flex gap-0.5">
                      <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                        Email
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch justify-start items-center gap-4 inline-flex">
                    <div className="grow shrink basis-0 flex-col justify-start items-start gap-1.5 inline-flex">
                      <div className="self-stretch h-10 flex-col justify-start items-start gap-1.5 flex">
                        <div className="relative self-stretch">
                          <InputField
                            type="default"
                            mode="light"
                            value={newEmail}
                            iconColor='#344054'
                            onChange={setNewEmail}
                            placeholder="Enter email"
                            iconUrl={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/mail-01.svg`}
                          />
                        </div>
                      </div>
                    </div>
                    <ButtonNormal
                      variant="secondaryGray"
                      mode="light"
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
                 <div className="self-stretch border-b border-[#e4e7ec] flex-col justify-start items-start flex" />
                {/* Password section */}

                {!showPasswordForm ? (
                  // When the form is hidden, show the change password button.
                  <div className="self-stretch flex flex-col gap-4">
                    {/* Header and Change Password Button */}
                    <div className="self-stretch flex flex-col gap-4">
                      <div className="self-stretch h-5 flex items-center">
                        <div className="inline-flex gap-0.5">
                          <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                            Password
                          </div>
                        </div>
                      </div>
                      <ButtonNormal
                        variant="secondaryGray"
                        mode="light"
                        size="small"
                        onClick={() => setShowPasswordForm(true)}
                        className="w-fit"
                      >
                        Change password
                      </ButtonNormal>
                    </div>

                    {/* Confirmation Message - displayed when passwordChanged is true */}
                    {passwordChanged && (
                      <div className="h-[52px] py-0 bg-white rounded-xl flex items-center gap-4 mt-0">
                        <div className="w-5 h-5 bg-[#dbf9e6] rounded-full overflow-hidden">
                          <img
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-icon-green.svg`}
                            alt="Mail Icon"
                            className="w-5 h-5 object-contain"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                            Your password has been changed successfully
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // When the form is displayed, show the full password change section.
                  <div className="flex flex-col w-96 gap-4 rounded-lg">
                    <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                      Password
                    </div>
                    <div className="flex flex-col gap-4">
                      {/* Old password field */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                          Old password
                        </label>
                        <InputField
                          type="password"
                          mode="light"
                          value={oldPassword}
                          onChange={setOldPassword}
                          placeholder="Old password"
                          iconColor='#344054'
                          errorMessage={oldPasswordError}
                        />
                      </div>

                      {/* New password field */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                          New password
                        </label>
                        <InputField
                          type="password"
                          mode="light"
                          value={newPassword}
                          iconColor='#344054'
                          onChange={setNewPassword}
                          placeholder="New password"
                          errorMessage={newPasswordError}
                        />
                      </div>

                      {/* Confirm new password field */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                          Confirm new password
                        </label>
                        <InputField
                          type="password"
                          mode="light"
                          value={confirmNewPassword}
                          iconColor='#344054'
                          onChange={setConfirmNewPassword}
                          placeholder="Confirm new password"
                          errorMessage={confirmPasswordError}
                        />
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex gap-4">
                      <ButtonNormal
                        variant="secondaryGray"
                        mode="light"
                        size="small"
                        onClick={handleCancelPasswordChange}
                      >
                        Cancel change
                      </ButtonNormal>
                      <ButtonNormal
                        variant="primary"
                        mode="light"
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
                 <div className="self-stretch border-b border-[#e4e7ec] flex-col justify-start items-start flex" />

                {/* Account Security section */}
                <div className="self-stretch h-20 flex-col justify-start items-start gap-4 flex">
                  <div className="self-stretch h-5 flex-col justify-start items-start flex">
                    <div className="inline-flex gap-0.5">
                      <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                        Account Security
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <ButtonNormal
                      variant="secondaryGray"
                      mode="light"
                      size="small"
                      leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/log-out-icon.svg`}
                      onClick={() => handleLogout()}
                    >
                      Log out
                    </ButtonNormal>
                    <ButtonDestructive
                      variant="secondary"
                      mode="light"
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
              <div className="self-stretch border-b border-[#e4e7ec] flex-col justify-start items-start flex" />
              {/* Footer buttons */}
              <div className="self-stretch h-fit flex-col justify-start items-center gap-5 flex">
                <div className="self-stretch flex justify-end items-center gap-5">
                  <div className="grow shrink basis-0 h-10 flex justify-end items-center gap-3">
                    <ButtonNormal
                      variant="secondaryGray"
                      mode="light"
                      size="small"
                      onClick={onClose}
                    >
                      Cancel
                    </ButtonNormal>
                    <ButtonNormal
                      variant="primary"
                      mode="light"
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
