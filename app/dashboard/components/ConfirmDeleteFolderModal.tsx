'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ButtonNormal from '@/app/components/ButtonNormal';
import ButtonDestructive from '@/app/components/ButtonDestructive';
import { useColors } from '@/app/theme/hooks';

interface ConfirmDeleteModalProps {
  onClose: () => void;
  onDelete: () => Promise<void>;
}

export default function ConfirmDeleteFolderModal({
  onClose,
  onDelete,
}: ConfirmDeleteModalProps) {
  const colors = useColors();

  return (
    <main 
      className="fixed inset-0 flex items-center justify-center z-50 w-full"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0">
        <div 
          style={{ backgroundColor: colors['bg-overlay'] }}
          className="absolute inset-0 opacity-70" 
        />
      </div>

      {/* Modal section */}
      <div 
        style={{ backgroundColor: colors['bg-primary'] }}
        className="w-[400px] rounded-xl shadow-lg flex-col justify-start items-center inline-flex overflow-hidden relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="self-stretch px-6 pt-6 flex-col justify-start items-start gap-4 flex">
          <div 
            style={{ 
              backgroundColor: colors['bg-secondary'],
              borderColor: colors['border-secondary']
            }}
            className="w-12 h-12 p-3 rounded-[10px] border shadow-sm flex items-center justify-center"
          >
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-icon.svg`}
              alt="Folder icon"
              className="w-12 h-12"
            />
          </div>
          <div 
            style={{ color: colors['text-primary'] }}
            className="self-stretch text-lg font-semibold leading-7"
          >
            Confirm delete
          </div>
          <div 
            style={{ color: colors['text-secondary'] }}
            className="text-sm font-normal leading-tight"
          >
            Are you sure you want to delete this folder? This action cannot be
            undone. The flows inside will not be deleted.
          </div>
        </div>

        <div className="self-stretch pt-8 flex-col justify-start items-start flex">
          <div className="self-stretch px-6 pb-6 flex items-center gap-3">
            <ButtonNormal
              variant="secondary"
              size="small"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </ButtonNormal>

            <ButtonDestructive
              variant="primary"
              size="small"
              onClick={async () => {
                await onDelete();
                onClose();
              }}
              className="flex-1"
            >
              Delete
            </ButtonDestructive>
          </div>
        </div>
      </div>
    </main>
  );
}
