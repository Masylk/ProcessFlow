import React, { useState, useEffect } from 'react';
import { useColors } from '@/app/theme/hooks';
import { BaseStepProps } from './BaseStep';
import DynamicIcon from '@/utils/DynamicIcon';
import { Block } from '../../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
// ... other imports

interface HorizontalStepProps extends BaseStepProps {
  isFirstStep?: boolean;
  isEmbed?: boolean;
}

export default function HorizontalStep({
  block,
  selectedOptionIds,
  onOptionSelect,
  isFirstStep = false,
  isEmbed = false,
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
    <div
      className={cn(
        'grid',
        isEmbed ? 'h-[772px]' : 'h-[472px]',
        !block.image && (!block.child_paths || block.child_paths.length === 0)
          ? 'items-center justify-center'
          : 'grid-rows-[auto_1fr]'
      )}
    >
      {/* Content Container */}
      <div
        className={cn(
          'w-full',
          !block.image &&
            (!block.child_paths || block.child_paths.length === 0) &&
            'max-w-[640px] mx-auto px-4'
        )}
      >
        {/* Fixed Header Section */}
        <div className="flex-shrink-0">
          {/* Step Header */}
          <div className="flex items-center gap-4 mb-4">
            {/* App Icon */}
            <div
              className="flex-shrink-0 w-12 h-12 rounded-[6px] border shadow-sm flex items-center justify-center"
              style={{
                backgroundColor: colors['bg-primary'],
                borderColor: colors['border-secondary'],
              }}
            >
              <div className="flex items-center justify-center">
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
                className="flex items-center text-base font-semibold"
                style={{ color: colors['text-primary'] }}
              >
                <span>{getDisplayTitle(block)}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div
            className={cn(
              'relative',
              !block.image &&
                (!block.child_paths || block.child_paths.length === 0)
                ? 'max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-rounded-lg'
                : 'mb-6'
            )}
            style={
              {
                '--scrollbar-thumb': colors['border-secondary'],
              } as React.CSSProperties
            }
          >
            <p
              className="text-base"
              style={{ color: colors['text-quaternary'] }}
            >
              {block.step_details ||
                block.description ||
                `Details for ${getDisplayTitle(block)}`}
            </p>
          </div>
        </div>

        {/* Scrollable Content Section */}
        {(block.image ||
          (block.child_paths && block.child_paths.length > 0)) && (
          <div className="h-full overflow-hidden">
            {hasBothImageAndOptions ? (
              <div className="flex flex-col h-full">
                {/* Fixed height scrollable container for image */}
                <div
                  className={cn(
                    'overflow-hidden rounded-lg mb-4',
                    isEmbed ? 'h-[450px]' : 'h-[160px]',
                    'flex-shrink-0'
                  )}
                >
                  {signedImageUrl ? (
                    <img
                      src={signedImageUrl}
                      alt="Step visualization"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: colors['bg-secondary'] }}
                    >
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: colors['bg-tertiary'] }}
                      />
                    </div>
                  )}
                </div>

                {/* Options section with fixed header */}
                <div className="flex flex-col h-[calc(380px-160px-32px)]">
                  {' '}
                  {/* 472px (container) - 160px (image) - 32px (margins) */}
                  <p
                    className="text-sm font-medium mb-4 flex-shrink-0"
                    style={{ color: colors['text-primary'] }}
                  >
                    Select an option
                  </p>
                  {/* Scrollable options container */}
                  <div
                    className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-rounded-lg"
                    style={
                      {
                        '--scrollbar-thumb': colors['border-secondary'],
                      } as React.CSSProperties
                    }
                  >
                    <div className="space-y-2">
                      {block.child_paths?.map((option, index) => (
                        <div key={option.path.id} className="overflow-hidden">
                          <motion.button
                            onClick={() =>
                              onOptionSelect?.(option.path.id, block.id, false)
                            }
                            className={cn(
                              'w-full p-4 rounded-lg border transition-all duration-200',
                              'flex items-center gap-3 text-left hover:bg-secondary active:bg-secondary',
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
                              className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
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
                                className="font-normal text-sm"
                                style={{ color: colors['text-primary'] }}
                              >
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
              <div className="flex flex-col gap-6 overflow-y-auto h-full">
                {/* Regular Image Section (when no options) */}
                {block.image && (
                  <div
                    className={cn(
                      'rounded-lg overflow-hidden',
                      isEmbed ? 'h-[500px]' : 'h-[350px]'
                    )}
                  >
                    {signedImageUrl ? (
                      <img
                        src={signedImageUrl}
                        alt="Step visualization"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
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

                {/* Get Started Button for First Step */}
                {isFirstStep ? (
                  <div className="flex justify-center">
                    <motion.button
                      onClick={() =>
                        onOptionSelect?.(
                          block.child_paths?.[0]?.path?.id,
                          block.id,
                          false
                        )
                      }
                      className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        backgroundColor: colors['bg-brand-solid'],
                        color: colors['text-on-brand'],
                      }}
                    >
                      Get Started
                    </motion.button>
                  </div>
                ) : (
                  /* Options Section (when no image) */
                  block.child_paths &&
                  block.child_paths.length > 0 && (
                    <div className="w-full">
                      <p
                        className="text-sm font-medium mb-4"
                        style={{ color: colors['text-primary'] }}
                      >
                        Select an option
                      </p>
                      <div className="space-y-2">
                        {block.child_paths.map((option, index) => (
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
                                'w-full p-4 rounded-lg border transition-all duration-200',
                                'flex items-center gap-3 text-left hover:bg-secondary active:bg-secondary',
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
                                className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
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
                                  className="font-normal text-sm"
                                  style={{ color: colors['text-primary'] }}
                                >
                                  {option.path.name}
                                </p>
                              </div>
                            </motion.button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
