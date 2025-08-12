'use client';

import { useColors } from '@/app/theme/hooks';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Integration {
  name: string;
  icon?: string;
}

interface Owner {
  name: string;
  avatar?: string;
}

interface ProcessCardProps {
  icon: string;
  workflow: {
    name: string;
    description?: string; // "Why does this Flow exist?"
  };
  integrations: Integration[];
  owner?: Owner; // Flow owner
  review_date?: string; // Review Date
  additionalNotes?: string; // Additional notes
  lastUpdate?: string; // Keep for backwards compatibility
}

export default function ProcessCard({
  icon,
  workflow,
  integrations,
  owner,
  review_date,
  additionalNotes,
  lastUpdate,
}: ProcessCardProps) {
  const colors = useColors();
  const [showPopover, setShowPopover] = useState(false);
  const popoverTimerRef = useRef<NodeJS.Timeout>();
  const [windowHeight, setWindowHeight] = useState<number>(0);
  const [shouldCenter, setShouldCenter] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const additionalNotesRef = useRef<HTMLDivElement>(null);

  const visibleIntegrations = integrations.slice(0, 5);
  const hiddenIntegrations = integrations.slice(5);
  const hasHiddenIntegrations = integrations.length > 5;

  // Update window dimensions
  useEffect(() => {
    const updateWindowDimensions = () => {
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

  // Check if content should be centered based on height
  useEffect(() => {
    const checkContentHeight = () => {
      let totalContentHeight = 0;

      if (descriptionRef.current) {
        totalContentHeight += descriptionRef.current.offsetHeight;
      }

      if (additionalNotesRef.current) {
        totalContentHeight += additionalNotesRef.current.offsetHeight;
      }

      const halfWindowHeight = windowHeight * 0.5;
      setShouldCenter(
        totalContentHeight < halfWindowHeight && windowHeight > 0
      );
    };

    // Use setTimeout to ensure DOM has been updated
    const timeoutId = setTimeout(checkContentHeight, 0);

    return () => clearTimeout(timeoutId);
  }, [workflow.description, additionalNotes, windowHeight]);

  const handleMouseEnter = () => {
    if (popoverTimerRef.current) {
      clearTimeout(popoverTimerRef.current);
    }
    setShowPopover(true);
  };

  const handleMouseLeave = () => {
    popoverTimerRef.current = setTimeout(() => {
      setShowPopover(false);
    }, 100); // 300ms delay before hiding
  };

  useEffect(() => {
    return () => {
      if (popoverTimerRef.current) {
        clearTimeout(popoverTimerRef.current);
      }
    };
  }, []);

  const IntegrationBadge = ({ integration }: { integration: Integration }) => (
    <div
      style={{
        backgroundColor: colors['bg-secondary'],
        borderColor: colors['border-secondary'],
      }}
      className="inline-flex items-center px-2 py-1 rounded-md border gap-1.5"
    >
      {integration.icon && (
        <img
          src={integration.icon}
          alt={integration.name}
          className="w-3.5 h-3.5 object-contain"
        />
      )}
      <span
        style={{ color: colors['text-secondary'] }}
        className="text-xs leading-none font-medium"
      >
        {integration.name}
      </span>
    </div>
  );

  return (
    <div
      style={{
        borderColor: colors['border-secondary'],
      }}
      className={cn(
        'h-full w-full',
        shouldCenter
          ? 'flex items-center justify-center'
          : 'flex justify-center'
      )}
    >
      <div className="flex gap-4 flex-row items-start max-w-3xl">
        {/* Large Icon */}
        <div
          style={{
            backgroundColor: colors['bg-secondary'],
          }}
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        >
          <img
            src={icon}
            alt={workflow.name}
            className="w-10 h-10 object-contain"
          />
        </div>

        {/* Content Container */}
        <div className="flex flex-col gap-3 flex-1 items-start text-left">
          {/* Title and Description */}
          <div className="flex flex-col gap-1">
            <h3
              style={{ color: colors['text-primary'] }}
              className="font-semibold text-2xl leading-tight"
            >
              {workflow.name}
            </h3>
            {workflow.description && (
              <div className="max-w-2xl break-words">
                <p
                  style={{ color: colors['text-secondary'] }}
                  className="text-sm font-medium mb-1"
                >
                  Why does this Flow exist?
                </p>
                <p
                  ref={descriptionRef}
                  style={{ color: colors['text-quaternary'] }}
                  className="font-normal text-sm"
                >
                  {workflow.description}
                </p>
              </div>
            )}
          </div>

          {/* Integration Badges */}
          <div className="flex flex-wrap gap-2 justify-start">
            {visibleIntegrations.map((integration, index) => (
              <IntegrationBadge key={index} integration={integration} />
            ))}

            {hasHiddenIntegrations && (
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  style={{
                    backgroundColor: colors['bg-secondary'],
                    borderColor: colors['border-secondary'],
                    color: colors['text-secondary'],
                  }}
                  className="inline-flex items-center px-2 py-1 rounded-md border gap-1.5 hover:bg-opacity-80 transition-all duration-200"
                >
                  <span className="text-xs leading-none font-medium">
                    +{hiddenIntegrations.length}
                  </span>
                </div>

                {/* Popover for additional integrations */}
                <div
                  style={{
                    backgroundColor: colors['bg-primary'],
                    borderColor: colors['border-secondary'],
                    boxShadow: `0px 4px 6px -2px ${colors['shadow-md_01']}, 0px 12px 16px -4px ${colors['shadow-md_02']}`,
                    opacity: showPopover ? 1 : 0,
                    visibility: showPopover ? 'visible' : 'hidden',
                  }}
                  className="absolute left-0 top-full mt-2 z-50 rounded-lg border p-3 min-w-[200px] max-w-[300px] transition-all duration-200"
                >
                  <div className="flex flex-col gap-2">
                    {hiddenIntegrations.map((integration, index) => (
                      <IntegrationBadge key={index} integration={integration} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 flex-row">
            {owner && owner.name && owner.name.trim() && (
              <>
                <div className="flex items-center gap-2">
                  {owner.avatar && (
                    <img
                      src={owner.avatar}
                      alt={owner.name}
                      className="rounded-full w-8 h-8"
                    />
                  )}
                  <span
                    style={{ color: colors['text-secondary'] }}
                    className="font-medium text-sm"
                  >
                    {owner.name}
                  </span>
                </div>
                {(review_date || lastUpdate) && (
                  <div
                    style={{ color: colors['text-tertiary'] }}
                    className="w-1 h-1 rounded-full bg-current"
                  />
                )}
              </>
            )}
            {review_date && (
              <>
                <div className="flex items-center gap-2">
                  <span
                    style={{ color: colors['text-tertiary'] }}
                    className="text-sm"
                  >
                    Review date: {review_date}
                  </span>
                </div>
                {lastUpdate && (
                  <div
                    style={{ color: colors['text-tertiary'] }}
                    className="w-1 h-1 rounded-full bg-current"
                  />
                )}
              </>
            )}
            {lastUpdate && (
              <div className="flex items-center gap-2">
                <span
                  style={{ color: colors['text-tertiary'] }}
                  className="text-sm"
                >
                  Last update: {lastUpdate}
                </span>
              </div>
            )}
          </div>

          {/* Additional Notes */}
          {additionalNotes && (
            <div className="mt-2">
              <p
                ref={additionalNotesRef}
                style={{ color: colors['text-quaternary'] }}
                className="text-sm italic"
              >
                <span className="font-medium not-italic">
                  Additional notes:
                </span>{' '}
                {additionalNotes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
