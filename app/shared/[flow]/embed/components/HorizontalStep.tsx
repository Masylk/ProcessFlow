import React, { useState, useEffect } from 'react';
import { useColors } from '@/app/theme/hooks';
import { BaseStepProps } from '@/app/workspace/[id]/[workflowId]/read/components/steps/BaseStep';
import DynamicIcon from '@/utils/DynamicIcon';
import { Block } from '@/app/workspace/[id]/[workflowId]/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
// ... other imports

interface HorizontalStepProps extends BaseStepProps {
  isFirstStep?: boolean;
}

export default function HorizontalStep({
  block,
  selectedOptionIds,
  onOptionSelect,
  isFirstStep = false,
}: HorizontalStepProps) {
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

  const getDisplayTitle = (block: Block) => {
    if (block.title) return block.title;

    // Convert block type from ALL_CAPS to Title Case
    const typeName = block.type
      .toLowerCase()
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return `${typeName}`;
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

  // Check if the step has both image and options
  const hasBothImageAndOptions =
    block.image && block.child_paths && block.child_paths.length > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Show header-only layout if no content */}
      {!block.image &&
      (!block.child_paths || block.child_paths.length === 0) ? (
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center text-center gap-4 max-w-2xl">
            {/* App Icon */}
            <div
              className="flex-shrink-0 w-[4vw] h-[4vw] max-w-[48px] max-h-[48px] rounded-[6px] border shadow-sm flex items-center justify-center"
              style={{
                backgroundColor: colors['bg-primary'],
                borderColor: colors['border-secondary'],
              }}
            >
              <img
                src={getIconPath(block)}
                alt="Step Icon"
                className="w-[2vw] h-[2vw] max-w-[24px] max-h-[24px]"
              />
            </div>

            {/* Title and Description */}
            <div className="flex flex-col items-center">
              <div className="text-[2.5vw] max-text-[30px] font-semibold mb-2">
                <span>{getDisplayTitle(block)}</span>
              </div>
              <p className="text-[2vw] max-text-[24px] text-quaternary">
                {block.step_details ||
                  block.description ||
                  `Details for ${getDisplayTitle(block)}`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Regular header + content layout */}
          <div className="h-[20%] flex flex-col justify-center shrink-0">
            {/* Step Header */}
            <div className="flex items-center gap-4 mb-2">
              {/* App Icon */}
              <div
                className="flex-shrink-0 w-[4vw] h-[4vw] min-w-[24px] min-h-[24px] max-w-[48px] max-h-[48px] rounded-[6px] border shadow-sm flex items-center justify-center"
                style={{
                  backgroundColor: colors['bg-primary'],
                  borderColor: colors['border-secondary'],
                }}
              >
                <img
                  src={getIconPath(block)}
                  alt="Step Icon"
                  className="w-[2vw] h-[2vw] min-w-[12px] min-h-[12px] max-w-[24px] max-h-[24px]"
                />
              </div>
              {/* Step Title */}
              <div className="flex-1">
                <div className="text-[2.5vw] min-text-[24px] max-text-[30px] font-semibold">
                  <span>{getDisplayTitle(block)}</span>
                </div>
              </div>
            </div>

            {/* Description with line clamp */}
            <p className="text-[2vw] min-text-[24px] max-text-[24px] text-quaternary line-clamp-2">
              {block.step_details ||
                block.description ||
                `Details for ${getDisplayTitle(block)}`}
            </p>
          </div>

          {/* Spacer - fixed height */}
          <div className="h-[0.2%] shrink-0" />

          {/* Content section - remaining height */}
          <div className="flex-1 min-h-0">
            {hasBothImageAndOptions ? (
              <div className="h-full flex flex-col">
                {/* Image section - fixed proportion */}
                <div className="h-[55%] rounded-lg overflow-hidden mb-3">
                  {signedImageUrl ? (
                    <img
                      src={signedImageUrl}
                      alt="Step visualization"
                      className="w-full h-full min-w-[10px] min-h-[10px] object-cover"
                    />
                  ) : (
                    <div className="w-full h-full min-w-[10px] min-h-[10px] flex items-center justify-center bg-secondary">
                      <div className="w-8 h-8 rounded-full bg-tertiary" />
                    </div>
                  )}
                </div>

                {/* Options section - remaining height */}
                <div className="flex-1 min-h-0 flex flex-col">
                  <p className="text-[2vw] min-text-[14px] max-text-[18px] font-medium mb-2">
                    Select an option
                  </p>
                  <div className="flex-1 overflow-y-auto">
                    <div className="space-y-2">
                      {block.child_paths?.map((option, index) => (
                        <div key={option.path.id} className="overflow-hidden">
                          <motion.button
                            onClick={() =>
                              onOptionSelect?.(option.path.id, block.id, false)
                            }
                            className={cn(
                              'w-full p-[1.5vw] min-p-4 max-p-6 rounded-lg border transition-all duration-200',
                              'flex items-center gap-4 text-left hover:bg-secondary active:bg-secondary',
                              selectedOptionIds?.some(
                                ([pathId, blockId]) =>
                                  pathId === option.path.id &&
                                  blockId === block.id
                              ) && 'border-brand'
                            )}
                            initial={{ opacity: 0.4 }}
                            animate={{
                              opacity: 1,
                              transition: {
                                duration: 0.2,
                                ease: 'easeOut',
                                delay: index * 0.05,
                              },
                            }}
                            style={{
                              backgroundColor: colors['bg-primary'],
                              borderColor: selectedOptionIds?.some(
                                ([pathId, blockId]) =>
                                  pathId === option.path.id &&
                                  blockId === block.id
                              )
                                ? colors['border-brand']
                                : colors['border-secondary'],
                            }}
                          >
                            <div
                              className="w-[1.5vw] h-[1.5vw] min-w-[20px] min-h-[20px] max-w-[24px] max-h-[24px] rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                              style={{
                                borderColor: selectedOptionIds?.some(
                                  ([pathId, blockId]) =>
                                    pathId === option.path.id &&
                                    blockId === block.id
                                )
                                  ? colors['border-brand']
                                  : colors['border-secondary'],
                                backgroundColor: selectedOptionIds?.some(
                                  ([pathId, blockId]) =>
                                    pathId === option.path.id &&
                                    blockId === block.id
                                )
                                  ? colors['bg-brand-solid']
                                  : 'transparent',
                              }}
                            >
                              <AnimatePresence>
                                {selectedOptionIds?.some(
                                  ([pathId, blockId]) =>
                                    pathId === option.path.id &&
                                    blockId === block.id
                                ) && (
                                  <motion.div
                                    className="w-[0.75vw] h-[0.75vw] min-w-[8px] min-h-[8px] max-w-[12px] max-h-[12px] bg-white rounded-full"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    transition={{ duration: 0.2 }}
                                  />
                                )}
                              </AnimatePresence>
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="font-normal text-[1.7vw] min-text-[14px] max-text-[16px]">
                                {option.path.name}
                              </p>
                            </div>
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {block.image ? (
                  // Single image - takes full height
                  <div className="h-full rounded-lg overflow-hidden">
                    {signedImageUrl ? (
                      <img
                        src={signedImageUrl}
                        alt="Step visualization"
                        className="w-full h-full min-w-[10px] min-h-[10px] object-cover"
                      />
                    ) : (
                      <div className="w-full h-full min-w-[10px] min-h-[10px] flex items-center justify-center bg-secondary">
                        <div className="w-8 h-8 rounded-full bg-tertiary" />
                      </div>
                    )}
                  </div>
                ) : (
                  // Options only - takes full height
                  <div className="h-full flex flex-col">
                    <p className="text-[1.7vw] min-text-[14px] max-text-[180px] font-medium mb-2">
                      Select an option
                    </p>
                    <div className="flex-1 overflow-y-auto">
                      <div className="space-y-2">
                        {block.child_paths?.map((option, index) => (
                          <div key={option.path.id} className="overflow-hidden">
                            <motion.button
                              onClick={() =>
                                onOptionSelect?.(
                                  option.path.id,
                                  block.id,
                                  false
                                )
                              }
                              className={cn(
                                'w-full p-[1.5vw] min-p-4 max-p-6 rounded-lg border transition-all duration-200',
                                'flex items-center gap-4 text-left hover:bg-secondary active:bg-secondary',
                                selectedOptionIds?.some(
                                  ([pathId, blockId]) =>
                                    pathId === option.path.id &&
                                    blockId === block.id
                                ) && 'border-brand'
                              )}
                              initial={{ opacity: 0.4 }}
                              animate={{
                                opacity: 1,
                                transition: {
                                  duration: 0.2,
                                  ease: 'easeOut',
                                  delay: index * 0.05,
                                },
                              }}
                              style={{
                                backgroundColor: colors['bg-primary'],
                                borderColor: selectedOptionIds?.some(
                                  ([pathId, blockId]) =>
                                    pathId === option.path.id &&
                                    blockId === block.id
                                )
                                  ? colors['border-brand']
                                  : colors['border-secondary'],
                              }}
                            >
                              <div
                                className="w-[1.5vw] h-[1.5vw] min-w-[20px] min-h-[20px] max-w-[24px] max-h-[24px] rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                                style={{
                                  borderColor: selectedOptionIds?.some(
                                    ([pathId, blockId]) =>
                                      pathId === option.path.id &&
                                      blockId === block.id
                                  )
                                    ? colors['border-brand']
                                    : colors['border-secondary'],
                                  backgroundColor: selectedOptionIds?.some(
                                    ([pathId, blockId]) =>
                                      pathId === option.path.id &&
                                      blockId === block.id
                                  )
                                    ? colors['bg-brand-solid']
                                    : 'transparent',
                                }}
                              >
                                <AnimatePresence>
                                  {selectedOptionIds?.some(
                                    ([pathId, blockId]) =>
                                      pathId === option.path.id &&
                                      blockId === block.id
                                  ) && (
                                    <motion.div
                                      className="w-[0.75vw] h-[0.75vw] min-w-[8px] min-h-[8px] max-w-[12px] max-h-[12px] bg-white rounded-full"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      exit={{ scale: 0 }}
                                      transition={{ duration: 0.2 }}
                                    />
                                  )}
                                </AnimatePresence>
                              </div>
                              <div className="flex flex-col gap-[1.5vw] min-gap-[16px] max-gap-[24px]">
                                <p className="font-normal text-[1.7vw] min-text-[24px] max-text-[40px]">
                                  {option.path.name}
                                </p>
                              </div>
                            </motion.button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
