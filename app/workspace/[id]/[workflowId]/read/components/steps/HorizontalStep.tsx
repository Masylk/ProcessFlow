import React from 'react';
import { useColors } from '@/app/theme/hooks';
import { BaseStepProps } from './BaseStep';
// ... other imports

export default function HorizontalStep({ block }: BaseStepProps) {
  const colors = useColors();

  return (
    <div className="flex flex-col" style={{ height: '472px' }}>
      {/* Step Header */}
      <div className="flex items-center gap-4 mb-4">
        {/* App Icon */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border"
          style={{
            backgroundColor: colors['bg-secondary'],
            borderColor: colors['border-secondary'],
          }}
        >
          <img
            src={
              block.icon ||
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon-base.svg`
            }
            alt=""
            className="w-6 h-6"
          />
        </div>
        {/* Step Title */}
        <div className="flex-1">
          <div
            className="flex items-center text-xl font-medium"
            style={{ color: colors['text-primary'] }}
          >
            <span className="mr-2">{block.position}.</span>
            <span>{block.title || `Block ${block.id}`}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-base mb-6" style={{ color: colors['text-secondary'] }}>
        {block.step_details || 'No description available'}
      </p>

      {/* Step Content */}
      <div className="rounded-lg overflow-hidden flex-1 mb-8">
        <img
          src="https://cdn.prod.website-files.com/674340930391b16981ae722e/674368682422d095ac5beb80_Use%20Case.png"
          alt="Step visualization"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
