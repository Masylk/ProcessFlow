// components/ConfirmChangePasswordModal.tsx
import React from 'react';

interface ConfirmChangePasswordModalProps {
  onCancel: () => void;
  onChangePassword: () => void;
}

const ConfirmChangePasswordModal: React.FC<ConfirmChangePasswordModalProps> = ({
  onCancel,
  onChangePassword,
}) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center p-8 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 backdrop-blur-lg">
        <div className="absolute inset-0 bg-[#0c111d] opacity-70" />
      </div>

      {/* Modal Card */}
      <div className="relative w-[480px] h-[260px] bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
        {/* Icon placeholder */}
        <div className="w-[336px] h-[336px] relative" />

        {/* Title & Description */}
        <div className="flex flex-col justify-start items-start px-6 pt-6 gap-4">
          <div className="w-12 h-12 p-3 bg-white rounded-[10px] border border-[#e4e7ec] shadow-sm flex justify-center items-center">
            <div className="w-6 h-6 relative">
            <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/lock-icon.svg`}
                          alt="Upload Icon"
                          className="w-6 h-6 object-contain"
                        />
            </div>
          </div>
          <div className="flex flex-col justify-start items-start gap-1">
            <div className="text-[#101828] text-lg font-semibold font-['Inter'] leading-7">
              Confirm change password
            </div>
            <div className="text-[#475467] text-sm font-normal font-['Inter'] leading-tight">
              If you change your password, your account will be signed out on
              all other devices.
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-start items-center px-6 pb-6 pt-8 gap-3">
          {/* Cancel Button */}
          <button
            onClick={onCancel}
            className="flex-grow h-11 px-4 py-2.5 bg-white rounded-lg border border-[#d0d5dd] shadow-sm flex justify-center items-center"
          >
            <span className="text-[#344054] text-base font-semibold font-['Inter']">
              Cancel
            </span>
          </button>

          {/* Change Password Button */}
          <button
            onClick={onChangePassword}
            className="flex-grow h-11 px-4 py-2.5 bg-[#4e6bd7] rounded-lg border-2 border-white shadow-sm flex justify-center items-center"
          >
            <span className="text-white text-base font-semibold font-['Inter']">
              Change password
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmChangePasswordModal;
