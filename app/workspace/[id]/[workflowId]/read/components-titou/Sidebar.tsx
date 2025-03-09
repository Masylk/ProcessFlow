import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Workspace } from '@/types/workspace';
import { useColors } from '@/app/theme/hooks';

interface Step {
  number: number;
  label: string;
  icon: string;
  isActive?: boolean;
  onClick?: () => void;
}

interface SidebarProps {
  steps: Step[];
  className?: string;
  workspace: Workspace;
}

export default function Sidebar({ steps, className, workspace }: SidebarProps) {
  const colors = useColors();

  return (
    <div 
      className={cn(
        'w-64 h-full flex flex-col fixed left-0 top-0 border-r',
        className
      )}
      style={{
        backgroundColor: colors['bg-primary'],
        borderColor: colors['border-secondary']
      }}
    >
      {/* Workspace Header */}
      <div className=" w-full px-3 py-1 flex-col justify-start items-start inline-flex">
        <div className="self-stretch px-3 py-2.5 rounded-md flex items-center gap-2">
          <div className="relative w-8 h-8">
            {workspace.icon_url && (
              <img
                src={workspace.icon_url}
                alt={workspace.name}
                className="w-8 h-8 rounded-lg object-cover absolute inset-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-medium absolute inset-0"
              style={{
                backgroundColor: workspace.background_colour || colors['bg-brand-primary'],
                display: 'flex',
                opacity: workspace.icon_url ? 0 : 1
              }}
            >
              {workspace.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="relative flex flex-col px-0.5 min-w-0 flex-1">
            <div 
              className="text-sm font-medium font-['Inter'] leading-tight truncate"
              style={{ color: colors['text-primary'] }}
            >
              {workspace.name}
            </div>
          </div>
        </div>
      </div>

      {/* Steps count */}
      <div className="px-7 py-4">
        <span 
          className="text-xs font-normal"
          style={{ color: colors['text-secondary'] }}
        >
          {steps.length} Steps
        </span>
      </div>

      {/* Steps list */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="space-y-2">
          {steps.map((step) => (
            <button
              key={step.number}
              onClick={step.onClick}
              className={cn(
                'w-full flex items-center gap-3 p-1 rounded-lg text-sm',
                'transition-colors duration-200 ease-in-out',
                'focus:outline-none cursor-pointer',
                !step.isActive && 'step-hover'
              )}
              role="link"
              aria-label={`Navigate to ${step.label} section`}
              style={{
                backgroundColor: step.isActive ? colors['bg-brand-solid'] : 'transparent'
              }}
            >
              <div 
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-sm font-medium"
                style={{
                  color: step.isActive ? colors['text-white'] : colors['text-secondary']
                }}
              >
                {step.number}
              </div>
              <span 
                className={cn(
                  'text-left text-sm truncate flex-1',
                  step.isActive && 'font-medium'
                )}
                style={{
                  color: step.isActive ? colors['text-white'] : colors['text-secondary']
                }}
              >
                {step.label}
              </span>
            </button>
          ))}
        </div>
      </div>
      <style jsx>{`
        .step-hover:hover {
          background-color: ${colors['bg-secondary']};
        }
      `}</style>
    </div>
  );
} 