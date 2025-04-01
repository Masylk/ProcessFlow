import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useColors } from '@/app/theme/hooks';
import Image from 'next/image';
import ButtonNormal from '@/app/components/ButtonNormal';
import { AnimatePresence, motion } from 'framer-motion';
import { Block } from '../../../types';
import { BaseStepProps } from './BaseStep';
import { BlockEndType, BlockType } from '@/types/block';
import { usePathsStore } from '../../store/pathsStore';

export default function VerticalStep({
  block,
  isActive = false,
  className,
  defaultExpanded = false,
  onToggle,
  children,
  onCopyLink,
  stepRef,
  selectedOptionIds,
  onOptionSelect,
  isLastStep = false,
  variant = 'default',
  icon,
}: BaseStepProps) {
  const colors = useColors();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [signedImageUrl, setSignedImageUrl] = useState<string | null>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const paths = usePathsStore((state) => state.paths);

  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

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

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(newState);

    // Enhanced scroll centering with top offset consideration
    if (stepRef?.current) {
      // If expanding, wait for the content to be visible before scrolling
      if (newState) {
        // Small delay to allow content to expand
        setTimeout(() => {
          const viewportHeight = window.innerHeight;
          const element = stepRef.current;

          if (!element) return;

          // Get the full height of the element including expanded content
          const elementRect = element.getBoundingClientRect();
          const elementHeight = elementRect.height;

          // Add offset from top (adjust this value based on your header height)
          const topOffset = 100; // Adjust this value based on your header height

          // Calculate the target scroll position that will center the element
          const targetScroll = Math.max(
            0,
            window.scrollY +
              elementRect.top -
              (viewportHeight - elementHeight) / 2 -
              topOffset
          );

          // Smooth scroll to the calculated position
          window.scrollTo({
            top: targetScroll,
            behavior: 'smooth',
          });
        }, 100); // Increased delay to ensure content has expanded
      } else {
        // If collapsing, scroll immediately
        const viewportHeight = window.innerHeight;
        const elementRect = stepRef.current.getBoundingClientRect();
        const elementHeight = elementRect.height;
        const topOffset = 100; // Same offset for consistency

        const targetScroll = Math.max(
          0,
          window.scrollY +
            elementRect.top -
            (viewportHeight - elementHeight) / 2 -
            topOffset
        );

        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth',
        });
      }
    }
  };

  const handleOptionSelect = (
    optionId: number,
    blockId: number,
    isMerge?: boolean
  ) => {
    onOptionSelect?.(optionId, blockId, isMerge);
  };

  const slideUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const expandVariants = {
    collapsed: { opacity: 0, height: 0 },
    expanded: { opacity: 1, height: 'auto' },
  };

  // Helper function to get display title
  const getDisplayTitle = (block: Block) => {
    if (block.title) return block.title;
    return `${block.type.charAt(0) + block.type.slice(1).toLowerCase()} Block`;
  };

  // Helper function to get icon path
  const getIconPath = (block: Block) => {
    if (block.type === 'PATH') {
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/git-branch-icon.svg`;
    }

    if (block.icon) {
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${block.icon}`;
    }

    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon-base.svg`;
  };

  // Don't render anything for MERGE blocks except the line
  if (block.type === 'MERGE') {
    return (
      <div className="relative">
        <motion.div
          className="absolute left-4 bottom-0 w-[1px] h-20 -mb-20"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.3 }}
          style={{ backgroundColor: colors['border-secondary'], originY: 0 }}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={stepRef}>
      <motion.div
        className={cn(
          'w-[550px] rounded-lg overflow-hidden will-change-transform',
          'border transition-all duration-200',
          className
        )}
        variants={slideUpVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.3 }}
        style={{
          backgroundColor: colors['bg-primary'],
          borderColor: isActive
            ? colors['border-brand']
            : colors['border-secondary'],
          transform: 'translateZ(0)',
        }}
      >
        <button
          onClick={handleToggle}
          className={cn(
            'w-full flex items-start justify-between p-6',
            'transition-colors duration-200 ease-in-out cursor-pointer'
          )}
          style={{
            backgroundColor: colors['bg-primary'],
          }}
        >
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <motion.div
              className="flex-shrink-0 w-8 h-8 mt-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={getIconPath(block)}
                alt={getDisplayTitle(block)}
                className="w-8 h-8"
              />
            </motion.div>
            <div className="flex flex-col items-start gap-2 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-medium"
                  style={{ color: colors['text-secondary'] }}
                >
                  {block.position}.
                </span>
                <span
                  className={cn(
                    'text-left text-base',
                    isActive && 'font-medium'
                  )}
                  style={{
                    color: colors['text-primary'],
                  }}
                >
                  {getDisplayTitle(block)}
                </span>
              </div>
              {block.step_details && (
                <div className="text-left w-full">
                  <p
                    ref={descriptionRef}
                    className={cn(
                      'text-sm transition-all duration-200 break-words',
                      !isExpanded && 'line-clamp-2'
                    )}
                    style={{ color: colors['text-quaternary'] }}
                  >
                    {block.step_details}
                  </p>
                </div>
              )}
            </div>
          </div>
          <motion.div
            className="flex-shrink-0 ml-4"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/chevron-down.svg`}
              alt="Toggle content"
              width={24}
              height={24}
              className="transition-transform duration-200"
              style={{
                filter: 'none',
              }}
            />
          </motion.div>
        </button>

        <AnimatePresence>
          {/* Image Section */}
          {isExpanded && signedImageUrl && (
            <motion.div
              key="image-section"
              className="px-4 pb-4 overflow-hidden will-change-transform"
              variants={expandVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              transition={{
                duration: 0.3,
                height: { duration: 0.3 },
                opacity: { duration: 0.2 },
              }}
              style={{ transform: 'translateZ(0)' }}
            >
              <div className="mb-4 rounded-lg overflow-hidden">
                <img
                  src={signedImageUrl}
                  alt="Block Media"
                  className="w-full h-[267px] object-cover"
                />
              </div>
            </motion.div>
          )}

          {/* Child Paths Section */}
          {isExpanded && block.child_paths && block.child_paths.length > 0 && (
            <motion.div
              key="child-paths-section"
              className="px-4 pb-4 overflow-hidden will-change-transform"
              variants={expandVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              transition={{
                duration: 0.3,
                height: { duration: 0.3 },
                opacity: { duration: 0.2 },
              }}
              style={{ transform: 'translateZ(0)' }}
            >
              {block.type.toString() === 'MERGE' ? (
                // For MERGE blocks, automatically select first child path
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                ></motion.div>
              ) : (
                // For non-MERGE blocks, show options as before
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
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
                          handleOptionSelect(option.path.id, block.id, false)
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
                            className="font-medium"
                            style={{ color: colors['text-primary'] }}
                          >
                            {option.path.name}
                          </p>
                          {/* <p
                            className="text-sm"
                            style={{ color: colors['text-secondary'] }}
                          >
                            {option.path.description}
                          </p> */}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {!isLastStep && (
        <motion.div
          className="absolute left-4 bottom-0 w-[1px] h-20 -mb-20"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.3 }}
          style={{ backgroundColor: colors['border-secondary'], originY: 0 }}
        />
      )}
    </div>
  );
}
