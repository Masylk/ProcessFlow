import React, { useState, useEffect, useRef } from 'react';
import { useColors } from '@/app/theme/hooks';
import { BaseStepProps } from '@/app/[slug]/[flow]/read/components/steps/BaseStep';
import DynamicIcon from '@/utils/DynamicIcon';
import { Block } from '@/app/[slug]/[flow]/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
// ... other imports

interface HorizontalStepProps extends BaseStepProps {
  isFirstStep?: boolean;
}

// Add a style tag to hide scrollbars globally
const HideScrollbarStyles = () => (
  <style jsx global>{`
    .hide-scrollbar {
      -ms-overflow-style: none; /* IE and Edge */
      scrollbar-width: none; /* Firefox */
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none; /* Chrome, Safari and Opera */
    }
  `}</style>
);

export default function HorizontalStep({
  block,
  selectedOptionIds,
  onOptionSelect,
  isFirstStep = false,
}: HorizontalStepProps) {
  const colors = useColors();
  const [signedImageUrl, setSignedImageUrl] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollbarThumbHeight, setScrollbarThumbHeight] = useState<
    number | null
  >(null);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [windowHeight, setWindowHeight] = useState<number>(0);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Add null check for block
  if (!block) {
    return null;
  }

  // Reset scroll position when block changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [block.id]); // Use block.id to ensure we only reset on actual block changes

  // Update window size
  useEffect(() => {
    const updateWindowDimensions = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    // Initialize
    updateWindowDimensions();

    // Add event listener
    window.addEventListener('resize', updateWindowDimensions);

    // Clean up
    return () => {
      window.removeEventListener('resize', updateWindowDimensions);
    };
  }, []);

  // Update scrollbar thumb size based on content and window size
  useEffect(() => {
    const updateScrollThumb = () => {
      if (contentRef.current && containerRef.current) {
        const contentScrollHeight = contentRef.current.scrollHeight;
        const containerClientHeight = containerRef.current.clientHeight;

        setContentHeight(contentScrollHeight);
        setContainerHeight(containerClientHeight);

        // If content is taller than container, calculate ratio for thumb
        if (contentScrollHeight > containerClientHeight) {
          // Adjust thumb size based on both content ratio and container height
          const ratio = containerClientHeight / contentScrollHeight;

          // Scale thumb minimum size based on viewport height
          // (smaller screens get smaller minimum thumb size)
          const minThumbSize = Math.max(
            20,
            Math.min(30, window.innerHeight * 0.04)
          );

          const thumbHeight = Math.max(
            minThumbSize,
            containerClientHeight * ratio
          );
          setScrollbarThumbHeight(thumbHeight);
        } else {
          setScrollbarThumbHeight(null); // Hide scrollbar when not needed
        }
      }
    };

    updateScrollThumb();

    // Set up resize observer to detect content changes
    const resizeObserver = new ResizeObserver(updateScrollThumb);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [block, signedImageUrl, windowWidth, windowHeight, imageLoaded]); // Update when content, window size, or image loaded status changes

  // Handle image load event to get dimensions
  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
    setImageLoaded(true);
    setImageError(false);
  };

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  // Add scroll event listener to track scroll position
  useEffect(() => {
    const contentElement = contentRef.current;

    const handleScroll = () => {
      if (contentElement) {
        setScrollTop(contentElement.scrollTop);
      }
    };

    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Custom scrollbar click handler
  const handleScrollbarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (contentRef.current) {
      const track = e.currentTarget;
      const trackRect = track.getBoundingClientRect();
      const clickPosition = e.clientY - trackRect.top;
      const percentage = clickPosition / trackRect.height;

      const scrollPosition = percentage * (contentHeight - containerHeight);
      contentRef.current.scrollTop = scrollPosition;
    }
  };

  // Calculate appropriate scrollbar width based on viewport
  const getScrollbarWidth = () => {
    if (windowWidth <= 640) {
      return 3; // 3px on small screens (mobile)
    } else if (windowWidth <= 1024) {
      return 4; // 4px on medium screens (tablet)
    } else {
      return 6; // 6px on large screens (desktop)
    }
  };

  const scrollbarWidth = getScrollbarWidth();

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
        setImageLoaded(false);
        setImageError(false);
        try {
          const response = await fetch(
            `/api/get-signed-url?path=${block.image}`
          );
          const data = await response.json();

          if (response.ok && data.signedUrl) {
            setSignedImageUrl(data.signedUrl);
          } else {
            setImageError(true);
          }
        } catch (error) {
          console.error('Error fetching signed URL:', error);
          setImageError(true);
        }
      }
    };

    fetchSignedUrl();
  }, [block.image]);

  // Check if the step has both image and options
  const hasBothImageAndOptions =
    block.image && block.child_paths && block.child_paths.length > 0;

  // Check if there's only description (no image or options)
  const hasOnlyDescription =
    !block.image && (!block.child_paths || block.child_paths.length === 0);

  // Calculate if scrollbar should be visible
  const showScrollbar = contentHeight > containerHeight;

  // Calculate thumb position
  const thumbPosition =
    contentHeight <= containerHeight
      ? 0
      : (scrollTop / (contentHeight - containerHeight)) *
        (containerHeight - (scrollbarThumbHeight || 0));

  // Determine appropriate padding based on screen size
  const getResponsivePadding = () => {
    if (windowWidth <= 640) {
      return 'px-3 pt-3'; // Less padding on small screens
    } else if (windowWidth <= 1024) {
      return 'px-4 pt-4'; // Medium padding on medium screens
    } else {
      return 'px-5 pt-5'; // More padding on large screens
    }
  };

  // Determine optimal display mode for image based on its dimensions
  const getImageDisplayMode = () => {
    if (!imageDimensions) return 'object-contain';

    const aspectRatio = imageDimensions.width / imageDimensions.height;

    // For very wide images (panoramas)
    if (aspectRatio > 2.5) {
      return 'object-contain';
    }

    // For very tall images
    if (aspectRatio < 0.5) {
      return 'object-contain';
    }

    // Default to contain to show full image
    return 'object-contain';
  };

  return (
    <>
      <HideScrollbarStyles />
      <div
        ref={containerRef}
        className={cn(
          'h-full w-full overflow-hidden relative',
          (block.type === 'PATH' || !block.image) &&
            'flex flex-col items-center justify-center'
        )}
      >
        {/* Content Container - Main scrollable area */}
        <div
          ref={contentRef}
          className={cn(
            `h-full w-full overflow-y-auto hide-scrollbar ${getResponsivePadding()}`,
            (block.type === 'PATH' || !block.image) &&
              'flex flex-col items-center justify-center'
          )}
        >
          <div
            className={cn(
              'pb-16',
              (block.type === 'PATH' || (!block.image && !block.child_paths)) &&
                'w-full pb-0 flex flex-col items-center justify-center'
            )}
          >
            {' '}
            {/* Extra padding wrapper to ensure bottom content is visible */}
            {/* Fixed Header Section */}
            <div className="mb-4 sm:mb-5 md:mb-6">
              {/* Step Header */}
              {block.type !== 'PATH' && (
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                  {/* App Icon */}
                  <div
                    className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-[6px] border shadow-sm flex items-center justify-center"
                    style={{
                      backgroundColor: colors['bg-primary'],
                      borderColor: colors['border-secondary'],
                    }}
                  >
                    <div className="flex items-center justify-center">
                      {block.icon && block.icon.startsWith('https://cdn.brandfetch.io/') ? (
                        <img
                          src={block.icon}
                          alt="Step Icon"
                          className="w-5 h-5 sm:w-6 sm:h-6"
                          referrerPolicy="strict-origin-when-cross-origin"
                        />
                      ) : (
                        <img
                          src={getIconPath(block)}
                          alt="Step Icon"
                          className="w-5 h-5 sm:w-6 sm:h-6"
                          onError={(e) => {
                            e.currentTarget.src = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon-base.svg`;
                          }}
                        />
                      )}
                    </div>
                  </div>
                  {/* Step Title */}
                  <div className="flex-1">
                    <div
                      className="flex items-center text-sm sm:text-base font-semibold"
                      style={{ color: colors['text-primary'] }}
                    >
                      <span>{getDisplayTitle(block)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {block.type !== 'PATH' && (
                <div className="relative">
                  <p
                    className="text-sm sm:text-base whitespace-pre-line"
                    style={{ color: colors['text-quaternary'] }}
                  >
                    {block.step_details || block.description || ''}
                  </p>
                </div>
              )}
            </div>
            {/* Content Section - Adapts to content type */}
            {!hasOnlyDescription && (
              <div className="h-full w-full space-y-4 sm:space-y-5 md:space-y-6 flex flex-col items-center justify-center">
                {/* Image Section */}
                {block.image && (
                  <div className="rounded-lg overflow-hidden w-full bg-[#fafafa] dark:bg-[#1c1c1c]">
                    {signedImageUrl && !imageError ? (
                      <img
                        src={signedImageUrl}
                        alt="Step visualization"
                        className={`w-full ${getImageDisplayMode()}`}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                      />
                    ) : (
                      <div
                        className="w-full h-32 sm:h-36 md:h-40 flex items-center justify-center"
                        style={{ backgroundColor: colors['bg-secondary'] }}
                      >
                        <div
                          className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full"
                          style={{ backgroundColor: colors['bg-tertiary'] }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Options Section */}
                {block.child_paths && block.child_paths.length > 0 && (
                  <div className="w-full">
                    <p
                      className="w-full text-xs sm:text-sm font-medium mb-2 sm:mb-3 md:mb-4"
                      style={{ color: colors['text-primary'] }}
                    >
                      Select an option
                    </p>
                    <div className="w-full space-y-2">
                      {block.child_paths.map((option, index) => (
                        <div key={option.path.id} className="overflow-hidden">
                          <motion.button
                            onClick={() =>
                              onOptionSelect?.(option.path.id, block.id, false)
                            }
                            className={cn(
                              'w-full p-3 sm:p-4 rounded-lg border transition-all duration-200',
                              'flex items-center gap-2 sm:gap-3 text-left hover:bg-secondary active:bg-secondary',
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
                              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
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
                                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    transition={{ duration: 0.2 }}
                                  />
                                )}
                              </AnimatePresence>
                            </div>
                            <div className="flex flex-col gap-0.5 sm:gap-1">
                              <p
                                className="font-normal text-xs sm:text-sm"
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
                )}
              </div>
            )}
          </div>
        </div>

        {/* Custom scrollbar - responsive width and position */}
        {showScrollbar && (
          <div
            className={`absolute top-4 bottom-4 rounded-full cursor-pointer`}
            style={{
              right: windowWidth <= 640 ? '2px' : '4px',
              width: `${scrollbarWidth}px`,
              backgroundColor: 'rgba(0,0,0,0.05)',
            }}
            onClick={handleScrollbarClick}
          >
            <div
              className="absolute rounded-full transition-all duration-100"
              style={{
                width: `${scrollbarWidth}px`,
                backgroundColor: colors['border-secondary'],
                height: `${scrollbarThumbHeight}px`,
                top: `${thumbPosition}px`,
                opacity: 0.8,
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}