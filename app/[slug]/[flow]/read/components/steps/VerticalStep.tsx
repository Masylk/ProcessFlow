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
  defaultExpanded = true,
  onToggle,
  children,
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
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
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

  // Reset zoom level and position when fullscreen changes
  useEffect(() => {
    if (!isImageFullscreen) {
      setZoomLevel(1);
      setDragPosition({ x: 0, y: 0 });
    }
  }, [isImageFullscreen]);

  // Handle wheel event for zooming
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isImageFullscreen) return;

      e.preventDefault();

      // Zoom in or out based on scroll direction
      if (e.deltaY < 0) {
        // Zoom in (scroll up)
        setZoomLevel((prev) => Math.min(prev + 0.1, 5));
      } else {
        // Zoom out (scroll down)
        setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
      }
    };

    const container = imageContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [isImageFullscreen, imageContainerRef]);

  // Handle ESC key to close fullscreen
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isImageFullscreen) {
        setIsImageFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isImageFullscreen]);

  // Prevent body scrolling when fullscreen is active
  useEffect(() => {
    if (isImageFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isImageFullscreen]);

  const handleToggle = () => {
    // Only toggle if there's an image to show
    if (!block.image) return;

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

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsImageFullscreen(!isImageFullscreen);
  };

  const zoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => Math.min(prev + 0.1, 5));
  };

  const zoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  };

  const resetZoom = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setZoomLevel(1);
    setDragPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;

    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;

    setDragPosition((prev) => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetZoom();
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

    // Convert block type from ALL_CAPS to Title Case
    const typeName = block.type
      .toLowerCase()
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return `${typeName}`;
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
          'max-w-[950px] min-w-[300px] rounded-lg overflow-hidden will-change-transform',
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
            'w-full flex flex-col',
            block.type === 'PATH' ? 'p-2' : 'p-6',
            'transition-colors duration-200 ease-in-out',
            block.image ? 'cursor-pointer' : 'cursor-default'
          )}
          style={{
            backgroundColor: colors['bg-primary'],
          }}
        >
          {/* Header with Icon and Title */}
          {block.type !== 'PATH' && (
            <div className="flex items-center gap-4 flex-1 min-w-0 mb-3">
              <motion.div
                className="w-12 h-12 rounded-[6px] border shadow-sm flex items-center justify-center"
                style={{
                  backgroundColor: colors['bg-primary'],
                  borderColor: colors['border-secondary'],
                }}
              >
                <img
                  src={getIconPath(block)}
                  alt={getDisplayTitle(block)}
                  className="w-6 h-6"
                />
              </motion.div>
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn('text-left text-base font-semibold')}
                  style={{
                    color: colors['text-primary'],
                  }}
                >
                  {getDisplayTitle(block)}
                </span>
              </div>
              {block.image && (
                <motion.div
                  className="flex-shrink-0 ml-auto"
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
              )}
            </div>
          )}

          {/* Description section - always displayed below icon and title */}
          {block.type !== 'PATH' &&
            (block.step_details || block.description ? (
              <div className="text-left w-full">
                <p
                  ref={descriptionRef}
                  className={cn(
                    'text-sm transition-all duration-200 break-words min-h-[1.5rem] whitespace-pre-line',
                    !isExpanded && 'line-clamp-2'
                  )}
                  style={{ color: colors['text-quaternary'] }}
                >
                  {block.step_details || block.description || ''}
                </p>
              </div>
            ) : (
              <div className="text-left w-full ">
                <p
                  ref={descriptionRef}
                  className={cn(
                    'text-sm transition-all duration-200 break-words min-h-[1.5rem] whitespace-pre-line',
                    !isExpanded && 'line-clamp-2'
                  )}
                  style={{ color: colors['text-quaternary'] }}
                >
                  {''}
                </p>
              </div>
            ))}
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
              <div
                className="mb-4 rounded-lg overflow-hidden cursor-zoom-in"
                onClick={toggleFullscreen}
                aria-label="View image fullscreen"
                style={{ backgroundColor: colors['bg-secondary'] }}
              >
                <img
                  src={signedImageUrl}
                  alt="Block Media"
                  className="w-full h-[500px] object-contain"
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
                    className="text-sm font-medium mb-4"
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
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {/* Always display the vertical line, starting at the bottom of the card */}
      <motion.div
        className="absolute left-4 top-full w-[1px] h-20"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.3 }}
        style={{ backgroundColor: colors['border-secondary'], originY: 0 }}
      />

      {/* Enhanced Fullscreen Image Viewer */}
      {isImageFullscreen && signedImageUrl && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
          onClick={() => setIsImageFullscreen(false)}
          style={{ backdropFilter: 'blur(4px)' }}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 cursor-pointer hover:bg-black/70 transition-colors"
            onClick={() => setIsImageFullscreen(false)}
            aria-label="Close fullscreen view"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Help tooltip */}
          <div className="absolute top-4 left-4 z-10 text-white font-normal text-sm bg-black/50 px-3 py-2 rounded-md">
            <span className="hidden sm:inline">
              Use mouse wheel to zoom • Double-click to reset •{' '}
              {Math.round(zoomLevel * 100)}%
            </span>
            <span className="sm:hidden">{Math.round(zoomLevel * 100)}%</span>
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/50 p-2 rounded-lg z-10">
            <button
              onClick={zoomOut}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Zoom out"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12H19"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={resetZoom}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Reset zoom"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 15L21 21M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={zoomIn}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Zoom in"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5V19M5 12H19"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Image container with drag functionality */}
          <div
            ref={imageContainerRef}
            className={cn(
              'relative w-[90vw] h-[90vh] flex items-center justify-center overflow-hidden',
              zoomLevel > 1 ? 'cursor-grab' : '',
              isDragging && zoomLevel > 1 ? 'cursor-grabbing' : ''
            )}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
          >
            <div
              className="transition-all duration-200 ease-out"
              style={{
                transform: `scale(${zoomLevel}) translate(${dragPosition.x}px, ${dragPosition.y}px)`,
                transformOrigin: 'center center',
              }}
            >
              <img
                src={signedImageUrl}
                alt="Block Media Fullscreen"
                className="max-h-full max-w-full object-contain"
                style={{
                  pointerEvents: 'none',
                }}
                draggable="false"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
