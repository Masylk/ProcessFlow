// components/UserSettings.tsx
'use client';

import React, { useRef } from 'react';

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
  // Optionally, if you have a function to update the user state in the parent:
  onUserUpdate?: (updatedUser: User) => void;
}

export default function UserSettings({
  user,
  onClose,
  onUserUpdate,
}: UserSettingsProps) {
  // Define the default avatar URL using environment variables.
  const defaultAvatar = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/images/default_avatar.png`;
  const avatarSrc = user.avatar_signed_url
    ? user.avatar_signed_url
    : defaultAvatar;

  // Reference to the hidden file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger the file selector
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection and upload
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Create a FormData object and append the file
      const formData = new FormData();
      formData.append('file', file);

      // Call the upload API route
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (uploadRes.ok && uploadData.filePath) {
        // Construct the public URL for the uploaded file.
        // (Adjust the URL format as needed for your Supabase storage settings.)
        const newAvatarUrl = uploadData.filePath;

        // Call the update user API route to update the avatar URL
        const updateRes = await fetch('/api/user/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.id,
            // Only updating the avatar here; other fields remain unchanged.
            avatar_url: newAvatarUrl,
            first_name: user.first_name,
            last_name: user.last_name,
            full_name: user.full_name,
            email: user.email,
          }),
        });

        if (updateRes.ok) {
          const updatedUser = await updateRes.json();
          // Optionally update local state in the parent component.
          if (onUserUpdate) {
            onUserUpdate(updatedUser);
          }
          console.log('Avatar updated successfully');
        } else {
          console.error('Failed to update user information');
        }
      } else {
        console.error('File upload failed', uploadData.error);
      }
    } catch (error) {
      console.error('Error during file upload:', error);
    }
  };

  return (
    // Modal overlay
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
                {/* Your photo & Name section */}
                <div className="self-stretch h-[216px] flex-col justify-start items-start gap-4 flex">
                  {/* Photo label */}
                  <div className="self-stretch h-10 flex-col justify-start items-start flex">
                    <div className="justify-start items-center gap-0.5 inline-flex">
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
                          src={avatarSrc}
                          alt="User Avatar"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      </div>
                    </div>
                    <div
                      onClick={handleUploadClick}
                      className="px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#889ce4] justify-center items-center gap-1 flex cursor-pointer overflow-hidden"
                    >
                      <div className="w-5 h-5 relative overflow-hidden">
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/upload-icon.svg`}
                          alt="Upload Icon"
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                      <div className="px-0.5 justify-center items-center flex">
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
                    <div className="px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-center items-center gap-1 flex overflow-hidden">
                      <div className="w-5 h-5 relative overflow-hidden">
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/delete-icon.svg`}
                          alt="Delete Icon"
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                      <div className="px-0.5 justify-center items-center flex">
                        <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                          Delete
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Name section */}
                  <div className="self-stretch h-20 flex-col justify-start items-start gap-4 flex">
                    <div className="self-stretch h-5 flex-col justify-start items-start flex">
                      <div className="justify-start items-center gap-0.5 inline-flex">
                        <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                          Name
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch justify-start items-start gap-4 inline-flex">
                      <div className="grow shrink basis-0 flex-col justify-start items-start gap-1.5 inline-flex">
                        <div className="self-stretch h-11 flex-col justify-start items-start gap-1.5 flex">
                          <div className="self-stretch px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-start items-center gap-2 inline-flex">
                            <div className="grow shrink basis-0 h-6 justify-start items-center gap-2 flex">
                              <div className="grow shrink basis-0 text-[#667085] text-base font-normal font-['Inter'] leading-normal">
                                {user.last_name}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grow shrink basis-0 flex-col justify-start items-start gap-1.5 inline-flex">
                        <div className="self-stretch h-11 flex-col justify-start items-start gap-1.5 flex">
                          <div className="self-stretch px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-start items-center gap-2 inline-flex">
                            <div className="grow shrink basis-0 h-6 justify-start items-center gap-2 flex">
                              <div className="grow shrink basis-0 text-[#667085] text-base font-normal font-['Inter'] leading-normal">
                                {user.first_name}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="self-stretch h-px bg-[#e4e7ec]" />
                {/* Email section */}
                <div className="self-stretch h-20 flex-col justify-start items-start gap-4 flex">
                  <div className="self-stretch h-5 flex-col justify-start items-start flex">
                    <div className="justify-start items-center gap-0.5 inline-flex">
                      <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                        Email
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch justify-start items-center gap-4 inline-flex">
                    <div className="grow shrink basis-0 flex-col justify-start items-start gap-1.5 inline-flex">
                      <div className="self-stretch h-11 flex-col justify-start items-start gap-1.5 flex">
                        <div className="self-stretch px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-start items-center gap-2 inline-flex">
                          <div className="grow shrink basis-0 h-6 justify-start items-center gap-2 flex">
                            <div className="w-5 h-5 relative overflow-hidden">
                              <img
                                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/mail-icon.svg`}
                                alt="Mail Icon"
                                className="w-5 h-5 object-contain"
                              />
                            </div>
                            <div className="grow shrink basis-0 text-[#101828] text-base font-normal font-['Inter'] leading-normal">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-center items-center gap-1 flex overflow-hidden">
                      <div className="px-0.5 justify-center items-center flex">
                        <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                          Change email
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="self-stretch h-px bg-[#e4e7ec]" />
                {/* Password section */}
                <div className="self-stretch h-20 flex-col justify-start items-start gap-4 flex">
                  <div className="self-stretch h-5 flex-col justify-start items-start flex">
                    <div className="justify-start items-center gap-0.5 inline-flex">
                      <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                        Password
                      </div>
                    </div>
                  </div>
                  <div className="h-11 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-center items-center gap-1 inline-flex overflow-hidden">
                    <div className="px-0.5 justify-center items-center flex">
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
                    <div className="justify-start items-center gap-0.5 inline-flex">
                      <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                        Account Security
                      </div>
                    </div>
                  </div>
                  <div className="justify-start items-start gap-4 inline-flex">
                    <div className="px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-center items-center gap-1 flex overflow-hidden">
                      <div className="w-5 h-5 relative overflow-hidden">
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/log-out-icon.svg`}
                          alt="Log Out Icon"
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                      <div className="px-0.5 justify-center items-center flex">
                        <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                          Log out
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-center items-center gap-1 flex overflow-hidden">
                      <div className="w-5 h-5 relative overflow-hidden">
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/delete-icon-red.svg`}
                          alt="Delete Icon"
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                      <div className="px-0.5 justify-center items-center flex">
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
                <div className="self-stretch justify-end items-center gap-5 inline-flex">
                  <div className="grow shrink basis-0 h-10 justify-end items-center gap-3 flex">
                    <div className="px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-center items-center gap-1 flex overflow-hidden">
                      <div
                        className="px-0.5 justify-center items-center flex"
                        onClick={onClose}
                      >
                        <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                          Cancel
                        </div>
                      </div>
                    </div>
                    <div className="px-3.5 py-2.5 bg-[#4e6bd7] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-2 border-white justify-center items-center gap-1 flex overflow-hidden">
                      <div className="px-0.5 justify-center items-center flex">
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
