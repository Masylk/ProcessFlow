'use client';

import { useColors } from '@/app/theme/hooks';

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

  return (
    <div
      style={{
        borderColor: colors['border-secondary'],
      }}
      className="w-[636px] rounded-xl flex flex-col transition-all duration-200"
    >
      <div className="flex gap-6">
        {/* Large Icon */}
        <div
          style={{
            backgroundColor: colors['bg-secondary'],
          }}
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        >
          <img src={icon} alt={workflow.name} className="w-10 h-10" />
        </div>

        {/* Content Container */}
        <div className="flex flex-col gap-4 flex-1">
          {/* Title and Description */}
          <div className="flex flex-col gap-1">
            <h3
              style={{ color: colors['text-primary'] }}
              className="text-xl font-semibold leading-[30px]"
            >
              {workflow.name}
            </h3>
            {workflow.description && (
              <p
                style={{ color: colors['text-quaternary'] }}
                className="text-md"
              >
                {workflow.description}
              </p>
            )}
          </div>

          {/* Integration Badges */}
          <div className="flex flex-wrap gap-2">
            {integrations.map((integration, index) => (
              <div
                key={index}
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
            ))}
          </div>

          {/* Footer: Author and Last Update */}
          <div className="flex items-center gap-4">
            {author && (
              <div className="flex items-center gap-2">
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-5 h-5 rounded-full"
                />
                <span
                  style={{ color: colors['text-secondary'] }}
                  className="text-sm font-medium"
                >
                  {author.name}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span
                style={{ color: colors['text-quaternary'] }}
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
