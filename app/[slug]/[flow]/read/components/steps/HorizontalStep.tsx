import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useColors } from '@/app/theme/hooks';
import { BaseStepProps } from './BaseStep';
import DynamicIcon from '@/utils/DynamicIcon';
import { Block } from '../../../types';
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

// Regular expression to match URLs
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export default function HorizontalStep({
  block,
  selectedOptionIds,
  onOptionSelect,
  isFirstStep = false,
}: HorizontalStepProps) {
  const colors = useColors();
  const [signedImageUrl, setSignedImageUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
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
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const [descriptionHeight, setDescriptionHeight] = useState(0);

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

  // Update scrollbar thumb size based on content
  useEffect(() => {
    const updateScrollThumb = () => {
      if (contentRef.current && containerRef.current) {
        const contentScrollHeight = contentRef.current.scrollHeight;
        const containerClientHeight = containerRef.current.clientHeight;

        setContentHeight(contentScrollHeight);
        setContainerHeight(containerClientHeight);

        // If content is taller than container, calculate ratio for thumb
        if (contentScrollHeight > containerClientHeight) {
          const ratio = containerClientHeight / contentScrollHeight;
          const minThumbSize = Math.max(
            20,
            Math.min(30, containerClientHeight * 0.1)
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
  }, [block, signedImageUrl, windowWidth, imageLoaded]);

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

  // Calculate if scrollbar should be visible
  const showScrollbar = contentHeight > containerHeight;

  // Calculate thumb position
  const thumbPosition =
    contentHeight <= containerHeight
      ? 0
      : (scrollTop / (contentHeight - containerHeight)) *
        (containerHeight - (scrollbarThumbHeight || 0));

  const getIconPath = (block: Block) => {
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

  // Reset zoom and drag when closing fullscreen
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
      if (e.deltaY < 0) {
        setZoomLevel((prev) => Math.min(prev + 0.1, 5));
      } else {
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

  // ESC key to close fullscreen
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

  // Prevent body scroll when fullscreen
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

  // Add this function to parse text into segments with links
  const parseTextWithLinks = (text: string) => {
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = URL_REGEX.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
        });
      }

      // Add the link
      parts.push({
        type: 'link',
        content: match[0],
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last link
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex),
      });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content: text }];
  };

  // Helper function to split a string into chunks of N characters and render with <br />
  const renderTitleWithLineBreaks = (title: string, chunkSize = 50) => {
    if (!title) return null;
    const chunks = [];
    for (let i = 0; i < title.length; i += chunkSize) {
      chunks.push(title.slice(i, i + chunkSize));
    }
    // Interleave <br /> except after the last chunk
    return chunks.map((chunk, idx) => (
      <React.Fragment key={idx}>
        {chunk}
        {idx < chunks.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  useLayoutEffect(() => {
    if (descriptionRef.current) {
      setDescriptionHeight(descriptionRef.current.offsetHeight);
    }
  }, [block.description, block.id]);

  return (
    <>
      <HideScrollbarStyles />
      <div
        ref={containerRef}
        className={cn(
          'h-[472px] overflow-hidden relative',
          !block.image && 'flex flex-col items-center justify-center'
        )}
      >
        {/* Main scrollable container */}
        <div
          ref={contentRef}
          className={cn(
            'h-full overflow-y-auto overflow-x-hidden hide-scrollbar',
            hasOnlyDescription &&
              descriptionHeight <= windowHeight * 0.5 &&
              'flex items-center justify-center',
            !hasOnlyDescription && 'w-full'
          )}
        >
          <div
            className={cn(
              'w-full',
              !hasOnlyDescription && descriptionHeight <= windowHeight * 0.5
                ? 'flex flex-col items-center justify-center px-5'
                : ''
            )}
          >
            {/* Header Section */}
            <div
              className={cn(
                hasOnlyDescription && descriptionHeight <= windowHeight * 0.5
                  ? ''
                  : 'w-full px-5 pt-5 pb-4'
              )}
            >
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
                    {block.icon &&
                    block.icon.startsWith('https://cdn.brandfetch.io/') ? (
                      <img
                        src={block.icon}
                        alt="Step Icon"
                        className="w-6 h-6"
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                    ) : (
                      <img
                        src={getIconPath(block)}
                        alt="Step Icon"
                        className="w-6 h-6"
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
                    className="flex items-center text-base font-semibold break-words line-clamp-2 whitespace-pre-line"
                    style={{ color: colors['text-primary'] }}
                  >
                    <span>
                      {renderTitleWithLineBreaks(getDisplayTitle(block))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="relative w-full">
                <p
                  ref={descriptionRef}
                  className="text-base whitespace-pre-line w-[460px] break-words"
                  style={{ color: colors['text-quaternary'] }}
                >
                  {parseTextWithLinks(block.description || '').map(
                    (segment, index) =>
                      segment.type === 'link' ? (
                        <a
                          key={index}
                          href={segment.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline break-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            window.open(
                              segment.content,
                              '_blank',
                              'noopener,noreferrer'
                            );
                          }}
                        >
                          {segment.content}
                        </a>
                      ) : (
                        <span key={index}>{segment.content}</span>
                      )
                  )}
                </p>
              </div>
            </div>

            {/* Content Section */}
            {!hasOnlyDescription && (
              <div className="px-5 pb-16 w-full">
                <div className="space-y-6 w-full">
                  {/* Image Section */}
                  {block.image && (
                    <div
                      className="rounded-lg overflow-hidden w-full bg-[#fafafa] dark:bg-[#1c1c1c] mb-4 cursor-zoom-in"
                      onClick={toggleFullscreen}
                      aria-label="View image fullscreen"
                      style={{ backgroundColor: colors['bg-secondary'] }}
                    >
                      {signedImageUrl && !imageError ? (
                        <img
                          src={signedImageUrl}
                          alt="Step visualization"
                          className="w-full h-[500px] object-contain"
                          onLoad={() => setImageLoaded(true)}
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div
                          className="w-full h-40 flex items-center justify-center"
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
                                  className="font-normal text-sm break-words line-clamp-2"
                                  style={{ color: colors['text-primary'] }}
                                >
                                  {renderTitleWithLineBreaks(option.path.name)}
                                </p>
                              </div>
                            </motion.button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Custom scrollbar */}
        {showScrollbar && (
          <div
            className="absolute top-4 bottom-4 rounded-full cursor-pointer"
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

      {/* Fullscreen Modal */}
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
                style={{ pointerEvents: 'none' }}
                draggable="false"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
