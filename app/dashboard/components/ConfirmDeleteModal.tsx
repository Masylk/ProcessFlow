'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabasePublicClient } from '@/lib/supabasePublicClient';
import { User } from '@/types/user';

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

  return (
    <main className="fixed inset-0 flex items-center justify-center z-50 w-full">
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="h-[342.67px] bg-white rounded-xl shadow-lg flex-col justify-start items-center inline-flex overflow-hidden">
          <div className="self-stretch h-[242.67px] px-6 pt-6 flex-col justify-start items-start gap-4 flex">
            <div className="w-12 h-12 p-3 bg-[#fee3e1] rounded-full justify-center items-center inline-flex overflow-hidden">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-delete.svg`}
                alt="Trash Delete Icon"
                className="w-6 h-6"
              />
            </div>
            <div className="self-stretch text-[#101828] text-lg font-semibold leading-7">
              Confirm delete
            </div>
            <div className="self-stretch text-[#475467] text-sm font-normal leading-tight">
              Please enter your password to delete your account.
            </div>

            {/* Password Input Field */}
            <div className="w-[352px] h-9 mt-3">
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-lg shadow-sm border border-[#d0d5dd] text-[#667085] text-sm"
              />
            </div>

            {/* Error Message */}
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </div>

          <div className="self-stretch h-[100px] pt-8 flex-col justify-start items-start flex">
            <div className="self-stretch px-6 pb-6 flex items-center gap-3">
              <button
                onClick={onClose}
                className="w-full h-11 px-4 py-2.5 bg-white rounded-lg shadow border border-[#d0d5dd] flex justify-center items-center gap-1.5 transition-all duration-300 hover:bg-[#F9FAFB]"
              >
                <span className="text-[#344054] text-base font-semibold">
                  Cancel
                </span>
              </button>

              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className={`w-full h-11 px-4 py-2.5 ${
                  loading ? 'bg-gray-400' : 'bg-[#d92c20] hover:bg-[#B42318]'
                } rounded-lg shadow border border-[#901f17] flex justify-center items-center gap-1.5 transition-all duration-300`}
              >
                <span className="text-white text-base font-semibold">
                  {loading ? 'Deleting...' : 'Delete account'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
