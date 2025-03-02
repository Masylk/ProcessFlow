import React from 'react';
import Modal from '@/app/components/Modal';
import ButtonNormal from '@/app/components/ButtonNormal';
import ButtonDestructive from '@/app/components/ButtonDestructive';
import { useColors } from '@/app/theme/hooks';

/**
 * Creates a confirmation dialog modal
 */
export function createConfirmationModal({
  title,
  message,
  onConfirm,
  onClose,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon,
  iconBackgroundColor,
  isDestructive = false,
  isLoading = false
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  icon?: string;
  iconBackgroundColor?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}) {
  const colors = useColors();
  
  const actions = (
    <>
      <ButtonNormal
        variant="secondary"
        size="small"
        className="flex-1"
        onClick={onClose}
        disabled={isLoading}
      >
        {cancelText}
      </ButtonNormal>
      
      {isDestructive ? (
        <ButtonDestructive
          variant="primary"
          size="small"
          className="flex-1"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : confirmText}
        </ButtonDestructive>
      ) : (
        <ButtonNormal
          variant="primary"
          size="small"
          className="flex-1"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : confirmText}
        </ButtonNormal>
      )}
    </>
  );

  return (
    <Modal
      onClose={onClose}
      title={title}
      icon={icon}
      iconBackgroundColor={iconBackgroundColor}
      actions={actions}
      showActionsSeparator={true}
    >
      <div className="flex flex-col gap-4">
        <p style={{ color: colors['text-secondary'] }} className="text-sm">
          {message}
        </p>
      </div>
    </Modal>
  );
}

/**
 * Creates a deletion confirmation modal with trash icon
 */
export function createDeleteConfirmationModal({
  title = 'Confirm delete',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  itemType = 'item',
  onDelete,
  onClose,
  isLoading = false
}: {
  title?: string;
  message?: string;
  itemType?: string;
  onDelete: () => void;
  onClose: () => void;
  isLoading?: boolean;
}) {
  // Use the standard trash icon
  const trashIcon = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-delete.svg`;
  
  return createConfirmationModal({
    title,
    message,
    onConfirm: onDelete,
    onClose,
    confirmText: `Delete ${itemType}`,
    cancelText: 'Cancel',
    icon: trashIcon,
    iconBackgroundColor: '#fee3e1', // Light red for delete actions
    isDestructive: true,
    isLoading
  });
}

/**
 * Creates a password confirmation modal
 */
export function createPasswordConfirmationModal({
  title = 'Confirm with password',
  message = 'Please enter your password to continue.',
  onSubmit,
  onClose,
  errorMessage,
  password,
  setPassword,
  isLoading = false
}: {
  title?: string;
  message?: string;
  onSubmit: () => void;
  onClose: () => void;
  errorMessage?: string | null;
  password: string;
  setPassword: (password: string) => void;
  isLoading?: boolean;
}) {
  const colors = useColors();
  
  const actions = (
    <>
      <ButtonNormal
        variant="secondary"
        size="small"
        className="flex-1"
        onClick={onClose}
        disabled={isLoading}
      >
        Cancel
      </ButtonNormal>
      <ButtonNormal
        variant="primary"
        size="small"
        className="flex-1"
        onClick={onSubmit}
        disabled={!password || isLoading}
      >
        {isLoading ? 'Processing...' : 'Confirm'}
      </ButtonNormal>
    </>
  );

  // Lock icon for password confirmations
  const lockIcon = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/lock-icon.svg`;

  return (
    <Modal
      onClose={onClose}
      title={title}
      icon={lockIcon}
      iconBackgroundColor={colors['bg-secondary']}
      actions={actions}
      showActionsSeparator={true}
    >
      <div className="flex flex-col gap-4">
        <p style={{ color: colors['text-secondary'] }} className="text-sm">
          {message}
        </p>
        
        {/* Password Input Field */}
        <div className="mt-3">
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg shadow-sm border text-sm"
            style={{ 
              borderColor: colors['border-secondary'],
              backgroundColor: colors['bg-primary'],
              color: colors['text-primary']
            }}
          />
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="text-sm" style={{ color: colors['text-error'] }}>
            {errorMessage}
          </div>
        )}
      </div>
    </Modal>
  );
} 