'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ConfirmDeleteModalProps {
  onClose: () => void;
  onDelete: () => Promise<void>;
}

export default function ConfirmDeleteFlowModal({
  onClose,
  onDelete,
}: ConfirmDeleteModalProps) {
  return (
    <main className="fixed inset-0 flex items-center justify-center z-50 w-full">
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        {/* Modal section */}
        <div className="w-[400px] bg-white rounded-xl shadow-lg flex-col justify-start items-center inline-flex overflow-hidden">
          <div className="self-stretch px-6 pt-6 flex-col justify-start items-start gap-4 flex">
            <div className="w-12 h-12 p-3 bg-white rounded-[10px] border border-[#e4e7ec] shadow-sm flex items-center justify-center">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-icon.svg`}
                alt="Folder icon"
                className="w-12 h-12"
              />
            </div>
            <div className="self-stretch text-[#101828] text-lg font-semibold leading-7">
              Confirm delete
            </div>
            <div className="text-[#475467] text-sm font-normal leading-tight">
              Are you sure you want to delete this folder? This action cannot be
              undone. The flows inside will not be deleted.
            </div>
          </div>

          <div className="self-stretch pt-8 flex-col justify-start items-start flex">
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
                onClick={async () => {
                  await onDelete();
                  onClose();
                }}
                className={`w-full h-11 px-4 py-2.5 bg-[#d92c20] hover:bg-[#B42318]
                 rounded-lg shadow border border-[#901f17] flex justify-center items-center gap-1.5 transition-all duration-300`}
              >
                <span className="text-white text-base font-semibold">
                  Delete account
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
