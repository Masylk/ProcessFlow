'use client';

import React from 'react';
import { useTheme, useColors } from '@/app/theme/hooks';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';

interface BreadCrumbItem {
  label: string;
  href?: string;
}

interface BreadCrumbsProps {
  items: BreadCrumbItem[];
  className?: string;
}

const BreadCrumbs: React.FC<BreadCrumbsProps> = ({ items, className }) => {
  const colors = useColors();

  return (
    <nav className={cn("h-7 justify-start items-center inline-flex", className)} aria-label="Breadcrumb">
      <div className="justify-start items-center gap-2 flex">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <div
              className={cn(
                "px-2 py-1 rounded-md justify-center items-center flex",
                "transition-colors duration-200",
                "text-sm font-['Inter'] leading-tight"
              )}
              style={{
                backgroundColor: index === items.length - 1 ? colors['breadcrumb-active-bg'] : 'transparent',
                color: index === items.length - 1 ? colors['breadcrumb-active-fg'] : colors['breadcrumb-inactive-fg'],
                fontWeight: index === items.length - 1 ? 600 : 500,
              }}
            >
              {item.href ? (
                <Link 
                  href={item.href} 
                  className="transition-opacity hover:opacity-75"
                >
                  {item.label}
                </Link>
              ) : (
                <span>{item.label}</span>
              )}
            </div>

            {index < items.length - 1 && (
              <div 
                className="w-5 h-5 flex items-center justify-center"
                style={{ color: colors['breadcrumb-separator'] }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 12L10 8L6 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default BreadCrumbs;
