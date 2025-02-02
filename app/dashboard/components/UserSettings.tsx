// components/UserSettings.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface User {
  id: number;
  auth_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar_url?: string;
  avatar_signed_url?: string;
  email: string;
}

interface UserSettingsProps {
  user: User;
  onClose: () => void;
  onUserUpdate?: (updatedUser: User) => void;
}

export default function UserSettings({
  user,
  onClose,
  onUserUpdate,
}: UserSettingsProps) {
  const supabase = createClient();

  // Default avatar if none provided.
  const defaultAvatar = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/images/default_avatar.png`;
  const avatarSrc = user.avatar_signed_url
    ? user.avatar_signed_url
    : defaultAvatar;

  // Local state for file upload and preview.
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Local state for editable fields.
  const [firstName, setFirstName] = useState<string>(user.first_name);
  const [lastName, setLastName] = useState<string>(user.last_name);
  const [newEmail, setNewEmail] = useState<string>(user.email);

  // Update local state when user changes.
  useEffect(() => {
    setFirstName(user.first_name);
    setLastName(user.last_name);
    setNewEmail(user.email);
  }, [user]);

  // Trigger the file selector.
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // When a file is selected, store it and generate a preview URL.
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
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
    let newAvatarUrl = user.avatar_url; // Default to current avatar.

    // If a new file was selected, perform the upload.
    if (selectedFile) {
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
    try {
      const updateRes = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          avatar_url: newAvatarUrl,
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          // Email update is handled separately.
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
    } catch (error) {
      console.error('Error during user update:', error);
    }

    // Close the modal after saving.
    onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-[628px] h-[856px] bg-white rounded-xl shadow-[0px_8px_8px_-4px_rgba(16,24,40,0.03)] flex-col justify-start items-start inline-flex overflow-hidden">
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
                Settings
              </div>
            </div>
          </div>
          <div className="self-stretch h-5" />
        </div>

        {/* Body */}
        <div className="self-stretch justify-start items-center inline-flex">
          <div className="grow shrink basis-0 p-6 flex-col justify-start items-start gap-5 inline-flex">
            {/* Tabs */}
            <div className="self-stretch h-8 border-b border-[#e4e7ec] flex-col justify-start items-start gap-2 flex">
              <div className="justify-start items-start gap-3 inline-flex">
                <div className="px-1 pb-3 border-b-2 border-[#4761c4] justify-center items-center gap-2 flex">
                  <div className="text-[#374c99] text-sm font-semibold font-['Inter'] leading-tight">
                    Account
                  </div>
                </div>
              </div>
            </div>

            {/* Main settings form */}
            <div className="self-stretch h-[664px] flex-col justify-start items-start gap-6 flex">
              <div className="self-stretch h-[579px] flex-col justify-start items-start gap-5 flex">
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
                          src={previewUrl ? previewUrl : avatarSrc}
                          alt="User Avatar"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      </div>
                    </div>
                    <div
                      onClick={handleUploadClick}
                      className="px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#889ce4] flex items-center gap-1 cursor-pointer overflow-hidden"
                    >
                      <div className="w-5 h-5 relative overflow-hidden">
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/upload-icon.svg`}
                          alt="Upload Icon"
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                      <div className="px-0.5 flex items-center">
                        <div className="text-[#374c99] text-sm font-semibold font-['Inter'] leading-tight">
                          Upload new picture
                        </div>
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] flex items-center gap-1 overflow-hidden">
                      <div className="w-5 h-5 relative overflow-hidden">
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/delete-icon.svg`}
                          alt="Delete Icon"
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                      <div className="px-0.5 flex items-center">
                        <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                          Delete
                        </div>
                      </div>
                    </div>
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
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="self-stretch h-11 px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] text-[#667085] text-base font-normal font-['Inter'] leading-normal"
                        />
                      </div>
                      <div className="grow shrink basis-0 flex-col justify-start items-start gap-1.5 inline-flex">
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="self-stretch h-11 px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] text-[#667085] text-base font-normal font-['Inter'] leading-normal"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="self-stretch h-px bg-[#e4e7ec]" />
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
                          <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="h-10 w-full px-3.5 py-2.5 pl-10 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] text-[#101828] text-base font-normal font-['Inter'] leading-normal"
                          />
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <img
                              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/mail-icon.svg`}
                              alt="Mail Icon"
                              className="w-5 h-5 object-contain"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleChangeEmail}
                      disabled={newEmail === user.email}
                      className="px-3 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <div className="inline-flex items-center px-0.5">
                        <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                          Change email
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
                <div className="self-stretch h-px bg-[#e4e7ec]" />
                {/* Password section */}
                <div className="self-stretch h-20 flex-col justify-start items-start gap-4 flex">
                  <div className="self-stretch h-5 flex-col justify-start items-start flex">
                    <div className="inline-flex gap-0.5">
                      <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                        Password
                      </div>
                    </div>
                  </div>
                  <div className="h-11 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] flex items-center justify-center gap-1 overflow-hidden">
                    <div className="inline-flex items-center px-0.5">
                      <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                        Change password
                      </div>
                    </div>
                  </div>
                </div>
                <div className="self-stretch h-px bg-[#e4e7ec]" />
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
                    <div className="px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] flex items-center justify-center gap-1 overflow-hidden">
                      <div className="w-5 h-5 relative overflow-hidden">
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/log-out-icon.svg`}
                          alt="Log Out Icon"
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                      <div className="inline-flex items-center px-0.5">
                        <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                          Log out
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] flex items-center justify-center gap-1 overflow-hidden">
                      <div className="w-5 h-5 relative overflow-hidden">
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/delete-icon-red.svg`}
                          alt="Delete Icon"
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                      <div className="inline-flex items-center px-0.5">
                        <div className="text-[#d92c20] text-sm font-semibold font-['Inter'] leading-tight">
                          Delete my account
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Footer buttons */}
              <div className="self-stretch h-[61px] flex-col justify-start items-center gap-5 flex">
                <div className="self-stretch flex justify-end items-center gap-5">
                  <div className="grow shrink basis-0 h-10 flex justify-end items-center gap-3">
                    <div
                      className="px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] flex justify-center items-center gap-1 cursor-pointer overflow-hidden"
                      onClick={onClose}
                    >
                      <div className="px-0.5 flex justify-center items-center">
                        <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                          Cancel
                        </div>
                      </div>
                    </div>
                    <div
                      className="px-3.5 py-2.5 bg-[#4e6bd7] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-2 border-white flex justify-center items-center gap-1 cursor-pointer overflow-hidden"
                      onClick={handleSave}
                    >
                      <div className="px-0.5 flex justify-center items-center">
                        <div className="text-white text-sm font-semibold font-['Inter'] leading-tight">
                          Save
                        </div>
                      </div>
                    </div>
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
