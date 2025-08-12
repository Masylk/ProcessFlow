// components/ConfirmChangePasswordModal.tsx
import React from 'react';
import { useColors } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';

interface ConfirmChangePasswordModalProps {
  onCancel: () => void;
  onChangePassword: () => void;
}

const ConfirmChangePasswordModal: React.FC<ConfirmChangePasswordModalProps> = ({
  onCancel,
  onChangePassword,
}) => {
  const colors = useColors();
  
  return (
    <div className="fixed inset-0 flex justify-center items-center p-8 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0">
        <div 
          style={{ backgroundColor: colors['bg-overlay'] }}
          className="absolute inset-0 opacity-70" 
        />
      </div>

      {/* Modal Card */}
      <div 
        style={{ backgroundColor: colors['bg-primary'] }}
        className="relative w-[480px] h-[260px] rounded-xl shadow-lg flex flex-col overflow-hidden z-10"
      >
        {/* Icon placeholder */}
        <div className="w-[336px] h-[336px] relative" />

        {/* Title & Description */}
        <div className="flex flex-col justify-start items-start px-6 pt-6 gap-4">
          <div 
            style={{ 
              backgroundColor: colors['bg-secondary'],
              borderColor: colors['border-secondary']
            }}
            className="w-12 h-12 p-3 rounded-[10px] border shadow-sm flex justify-center items-center"
          >
            <div className="w-6 h-6 relative">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/lock-icon.svg`}
                alt="Upload Icon"
                className="w-6 h-6 object-contain"
              />
            </div>
          </div>
          <div className="flex flex-col justify-start items-start gap-1">
            <div 
              style={{ color: colors['text-primary'] }}
              className="text-lg font-semibold font-['Inter'] leading-7"
            >
              Confirm change password
            </div>
            <div 
              style={{ color: colors['text-secondary'] }}
              className="text-sm font-normal font-['Inter'] leading-tight"
            >
              If you change your password, your account will be signed out on
              all other devices.
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-start items-center px-6 pb-6 pt-8 gap-3">
          {/* Cancel Button */}
          <ButtonNormal
            variant="secondary"
            onClick={onCancel}
            className="flex-grow"
          >
            Cancel
          </ButtonNormal>

          {/* Change Password Button */}
          <ButtonNormal
            variant="primary"
            onClick={onChangePassword}
            className="flex-grow"
          >
            Change password
          </ButtonNormal>
        </div>
      </div>
    </div>
  );
};

export default ConfirmChangePasswordModal;
