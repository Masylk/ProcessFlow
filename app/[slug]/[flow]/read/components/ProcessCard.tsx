'use client';

import { useColors } from '@/app/theme/hooks';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { cn } from '@/lib/utils';
import DynamicIcon from '@/utils/DynamicIcon';

interface Integration {
  name: string;
  icon?: string;
}

interface Owner {
  name: string;
  avatar?: string;
}

type ViewMode = 'vertical' | 'carousel';
interface ProcessCardProps {
  icon: string;
  workflow: {
    name: string;
    description?: string;
  };
  integrations: Integration[];
  owner?: Owner;
  review_date?: string;
  additionalNotes?: string;
  lastUpdate?: string;
  viewMode?: ViewMode;
}

// Utility to extract filename without extension from a path
function getFilenameWithoutExtension(path: string): string {
  const filename = path.split('/').pop() || path;
  // Remove everything after the first dot in the extension (e.g. .svg, .png, .jpg, .svg?foo=bar)
  return filename.replace(/\.[^/.]+.*/, '');
}

export default function ProcessCard({
  icon,
  workflow,
  integrations,
  owner,
  review_date,
  additionalNotes,
  lastUpdate,
  viewMode = 'vertical',
}: ProcessCardProps) {
  const colors = useColors();
  const [showPopover, setShowPopover] = useState(false);
  const popoverTimerRef = useRef<NodeJS.Timeout>();
  const descriptionRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const [shouldCenter, setShouldCenter] = useState(false);

  const visibleIntegrations = integrations.slice(0, 5);
  const hiddenIntegrations = integrations.slice(5);
  const hasHiddenIntegrations = integrations.length > 5;

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

  useLayoutEffect(() => {
    // Only run if either description or additionalNotes exists
    if (descriptionRef.current || notesRef.current) {
      const descHeight = descriptionRef.current?.offsetHeight || 0;
      const notesHeight = notesRef.current?.offsetHeight || 0;
      console.log(descHeight, notesHeight);
      console.log('should center ', descHeight + notesHeight < 400);
      setShouldCenter(descHeight + notesHeight < 400);
    }
  }, [workflow.description, additionalNotes]);

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
          referrerPolicy={
            integration.icon.startsWith('https://cdn.brandfetch.io/')
              ? 'strict-origin-when-cross-origin'
              : undefined
          }
        />
      )}
      <span
        style={{ color: colors['text-secondary'] }}
        className="text-xs leading-none font-medium"
      >
        {integration.icon
          ? getFilenameWithoutExtension(integration.icon)
          : integration.name}
      </span>
    </div>
  );

  return (
    <div
      style={{
        borderColor: colors['border-secondary'],
      }}
      className={cn(
        'rounded-xl flex flex-col transition-all duration-200 w-full h-full overflow-auto',
        viewMode === 'carousel' && shouldCenter && 'items-center justify-center'
      )}
    >
      <div className="flex gap-6">
        {/* Large Icon - keep original size */}
        <div
          style={{
            backgroundColor: colors['bg-secondary'],
          }}
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        >
          {icon ? (
            icon.startsWith('https://cdn.brandfetch.io/') ? (
              <img
                src={icon}
                alt={workflow.name}
                className="w-10 h-10 object-contain"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : icon.startsWith(process.env.NEXT_PUBLIC_SUPABASE_URL || '') ? (
              <img
                src={icon}
                alt={workflow.name}
                className="w-10 h-10 object-contain"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logomark-pf.png`}
                alt="Default Icon"
                className="w-10 h-10 select-none"
                draggable="false"
              />
            )
          ) : (
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logomark-pf.png`}
              alt="Default Icon"
              className="w-10 h-10 select-none"
              draggable="false"
            />
          )}
        </div>

        {/* Content Container */}
        <div className="flex flex-col gap-4 flex-1">
          {/* Title and Description */}
          <div className="flex flex-col gap-1">
            <h3
              style={{ color: colors['text-primary'] }}
              className="font-semibold leading-[30px] text-xl"
            >
              {workflow.name}
            </h3>
            {workflow.description && (
              <div className="max-w-md" ref={descriptionRef}>
                <p
                  style={{ color: colors['text-secondary'] }}
                  className="text-sm font-medium mb-1"
                >
                  Why does this Flow exist?
                </p>
                <p
                  style={{ color: colors['text-quaternary'] }}
                  className="font-normal text-sm whitespace-pre-line break-words"
                >
                  {workflow.description}
                </p>
              </div>
            )}
          </div>

          {/* Integration Badges */}
          <div className="flex flex-wrap gap-2 items-center">
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

          {/* Footer: Owner, Review Date, and Last Update */}
          <div className="flex items-center gap-4 flex-wrap">
            {owner && (
              <>
                <div className="flex items-center gap-2">
                  {owner.avatar && (
                    <img
                      src={owner.avatar}
                      alt={owner.name}
                      className="rounded-full w-5 h-5"
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
            <div className="mt-2 max-w-md" ref={notesRef}>
              <p
                style={{ color: colors['text-quaternary'] }}
                className="text-sm italic whitespace-pre-line break-words"
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
