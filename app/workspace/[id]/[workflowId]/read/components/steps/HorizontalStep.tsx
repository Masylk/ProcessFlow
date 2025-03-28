import React, { useState, useEffect } from 'react';
import { useColors } from '@/app/theme/hooks';
import { BaseStepProps } from './BaseStep';
import DynamicIcon from '@/utils/DynamicIcon';
import { Block } from '../../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
// ... other imports

export default function HorizontalStep({
  block,
  selectedOptionIds,
  onOptionSelect,
}: BaseStepProps) {
  const colors = useColors();
  const [signedImageUrl, setSignedImageUrl] = useState<string | null>(null);

  // Add null check for block
  if (!block) {
    return null;
  }

  const getIconPath = (block: Block) => {
    if (block.type === 'PATH') {
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/git-branch-icon.svg`;
    }

    if (block.icon) {
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${block.icon}`;
    }

    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon-base.svg`;
  };

  // Fetch signed URL for image
  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (block.image) {
        try {
          const response = await fetch(
            `/api/get-signed-url?path=${block.image}`
          );
          const data = await response.json();

          if (response.ok && data.signedUrl) {
            setSignedImageUrl(data.signedUrl);
          }
        } catch (error) {
          console.error('Error fetching signed URL:', error);
        }
      }
    };

    fetchSignedUrl();
  }, [block.image]);

  return (
    <div className="grid grid-rows-[auto_1fr] h-[472px]">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0">
        {/* Step Header */}
        <div className="flex items-center gap-4 mb-4">
          {/* App Icon */}
          <div
            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border"
            style={{
              backgroundColor: colors['bg-secondary'],
              borderColor: colors['border-secondary'],
            }}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <img
                src={getIconPath(block)}
                alt="Step Icon"
                className="w-6 h-6"
                onError={(e) => {
                  e.currentTarget.src = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon-base.svg`;
                }}
              />
            </div>
          </div>
          {/* Step Title */}
          <div className="flex-1">
            <div
              className="flex items-center text-xl font-medium"
              style={{ color: colors['text-primary'] }}
            >
              <span className="mr-2">{block.position}.</span>
              <span>{block.title || `Step ${block.position}`}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p
          className="text-base mb-6"
          style={{ color: colors['text-secondary'] }}
        >
          {block.step_details || 'No description available'}
        </p>
      </div>

      {/* Scrollable Content Section */}
      <div className="overflow-y-auto">
        <div className="px-4 min-h-full flex flex-col justify-center gap-6">
          {/* Image Section */}
          {block.image && (
            <div className="rounded-lg overflow-hidden">
              {signedImageUrl ? (
                <img
                  src={signedImageUrl}
                  alt="Step visualization"
                  className="w-full h-[267px] object-cover"
                />
              ) : (
                <div
                  className="w-full h-[267px] flex items-center justify-center"
                  style={{ backgroundColor: colors['bg-secondary'] }}
                >
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: colors['bg-tertiary'] }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Options Section */}
          {block.child_paths && block.child_paths.length > 0 && (
            <div>
              <p
                className="text-lg font-medium mb-4"
                style={{ color: colors['text-primary'] }}
              >
                Select an option
              </p>
              <div className="space-y-2">
                {block.child_paths.map((option, index) => (
                  <motion.button
                    key={option.path.id}
                    onClick={() =>
                      onOptionSelect?.(option.path.id, block.id, false)
                    }
                    className={cn(
                      'w-full p-4 rounded-lg border transition-colors duration-200 will-change-transform',
                      'flex items-start gap-3 text-left',
                      selectedOptionIds?.some(
                        ([pathId, blockId]) =>
                          pathId === option.path.id && blockId === block.id
                      ) && 'border-brand'
                    )}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: 0.1 + index * 0.05,
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    style={{
                      backgroundColor: colors['bg-primary'],
                      borderColor: selectedOptionIds?.some(
                        ([pathId, blockId]) =>
                          pathId === option.path.id && blockId === block.id
                      )
                        ? colors['border-brand']
                        : colors['border-secondary'],
                      transform: 'translateZ(0)',
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1.5 flex items-center justify-center"
                      style={{
                        borderColor: selectedOptionIds?.some(
                          ([pathId, blockId]) =>
                            pathId === option.path.id && blockId === block.id
                        )
                          ? colors['border-brand']
                          : colors['border-secondary'],
                        backgroundColor: selectedOptionIds?.some(
                          ([pathId, blockId]) =>
                            pathId === option.path.id && blockId === block.id
                        )
                          ? colors['bg-brand-solid']
                          : 'transparent',
                      }}
                    >
                      <AnimatePresence>
                        {selectedOptionIds?.some(
                          ([pathId, blockId]) =>
                            pathId === option.path.id && blockId === block.id
                        ) && (
                          <motion.div
                            className="w-2 h-2 bg-white rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p
                        className="font-medium"
                        style={{ color: colors['text-primary'] }}
                      >
                        {option.path.name}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
