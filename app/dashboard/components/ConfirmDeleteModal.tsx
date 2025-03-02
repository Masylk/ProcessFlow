'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabasePublicClient } from '@/lib/supabasePublicClient';
import { User } from '@/types/user';
import Modal from '@/app/components/Modal';
import ButtonNormal from '@/app/components/ButtonNormal';
import ButtonDestructive from '@/app/components/ButtonDestructive';
import { useColors } from '@/app/theme/hooks';

interface ConfirmDeleteModalProps {
  onClose: () => void;
  user: User;
}

export default function ConfirmDeleteModal({
  onClose,
  user,
}: ConfirmDeleteModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const colors = useColors();

  const handleDeleteAccount = async () => {
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Re-authenticate the user before deletion
      const { data, error: authError } =
        await supabasePublicClient.auth.signInWithPassword({
          email: user.email,
          password,
        });

      if (authError) {
        setError('Incorrect password. Please try again.');
        setLoading(false);
        return;
      }

      // Call API route to delete the user
      const response = await fetch('/api/deleteUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.auth_id }),
      });

      if (response.ok) {
        alert('Your account has been deleted.');
        router.push('/'); // Redirect to home page
      } else {
        setError('Failed to delete account. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    }

    setLoading(false);
  };

  // Define modal actions
  const modalActions = (
    <>
      <ButtonNormal
        variant="secondary"
        size="small"
        onClick={onClose}
        className="flex-1"
        disabled={loading}
      >
        Cancel
      </ButtonNormal>
      <ButtonDestructive
        variant="primary"
        size="small"
        onClick={handleDeleteAccount}
        disabled={loading}
        className="flex-1"
      >
        {loading ? 'Deleting...' : 'Delete account'}
      </ButtonDestructive>
    </>
  );

  return (
    <Modal
      onClose={onClose}
      title="Confirm delete"
      icon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-delete.svg`}
      iconBackgroundColor="#fee3e1"
      actions={modalActions}
      showActionsSeparator={true}
    >
      <div className="flex flex-col gap-4">
        <p style={{ color: colors['text-secondary'] }} className="text-sm">
          Please enter your password to delete your account.
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
        {error && (
          <div className="text-sm" style={{ color: colors['text-error'] }}>
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
