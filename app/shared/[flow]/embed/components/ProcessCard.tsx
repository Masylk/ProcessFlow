'use client';

import { useColors } from '@/app/theme/hooks';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Integration {
  name: string;
  icon?: string;
}

interface Author {
  name: string;
  avatar: string;
}

interface ProcessCardProps {
  icon: string;
  workflow: {
    name: string;
    description?: string;
  };
  integrations: Integration[];
  author?: Author;
  lastUpdate: string;
}

export default function ProcessCard({
  icon,
  workflow,
  integrations,
  author,
  lastUpdate,
}: ProcessCardProps) {
  const colors = useColors();
  const [showPopover, setShowPopover] = useState(false);
  const popoverTimerRef = useRef<NodeJS.Timeout>();

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
      className="h-full w-full flex items-center justify-center"
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
              <p
                style={{ color: colors['text-quaternary'] }}
                className="max-w-2xl font-normaltext-sm"
              >
                {workflow.description}
              </p>
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
            {author && (
              <div className="flex items-center gap-2">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${author.avatar}`}
                  alt={author.name}
                  className="rounded-full w-8 h-8"
                />
                <span
                  style={{ color: colors['text-secondary'] }}
                  className="font-medium text-sm"
                >
                  {author.name}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span
                style={{ color: colors['text-tertiary'] }}
                className="text-sm"
              >
                Last update: {lastUpdate}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
