'use client';

import React, { ReactNode } from 'react';
import { useColors } from '@/app/theme/hooks';

// Types of alerts with different styling
export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  /**
   * The variant determines the color scheme of the alert
   */
  variant: AlertVariant;
  
  /**
   * The title of the alert
   */
  title: string;
  
  /**
   * The body text or description of the alert
   */
  message: string;
  
  /**
   * URL to the icon or a React component to display as the icon
   */
  icon?: string | ReactNode;
  
  /**
   * Function to call when the alert is dismissed
   */
  onClose: () => void;
  
  /**
   * Primary action for the alert (e.g., "View changes")
   */
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  
  /**
   * Secondary action for the alert (e.g., "Dismiss")
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  
  /**
   * Optional custom styling for the alert container
   */
  className?: string;

  /**
   * Z-index for stacking alerts. Higher values appear on top.
   * @default 50
   */
  zIndex?: number;
}

const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  message,
  icon,
  onClose,
  primaryAction,
  secondaryAction,
  className = '',
  zIndex = 50,
}) => {
  const colors = useColors();
  
  // Determine styling based on variant
  const getVariantStyles = () => {
    switch(variant) {
      case 'success':
        return {
          iconBg: '#E3F9E5', // Light green background
          borderColor: '#B8E6BF', // Green border
          iconColor: '#52BD7A', // Green icon
        };
      case 'warning':
        return {
          iconBg: '#FFF8E6', // Light yellow background
          borderColor: '#FFE8B0', // Yellow border
          iconColor: '#FFC145', // Yellow icon
        };
      case 'error':
        return {
          iconBg: '#FEE3E1', // Light red background
          borderColor: '#FECAC7', // Red border
          iconColor: '#F76659', // Red icon
        };
      case 'info':
      default:
        return {
          iconBg: '#EAF4FE', // Light blue background
          borderColor: '#C8E3FD', // Blue border
          iconColor: '#4B9FFA', // Blue icon
        };
    }
  };
  
  const variantStyles = getVariantStyles();
  
  // Determine icon to display
  const renderIcon = () => {
    if (!icon) {
      // Default icons based on variant
      const defaultIcons = {
        info: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/info-icon.svg`,
        success: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-circle.svg`,
        warning: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/alert-triangle.svg`,
        error: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/alert-circle.svg`,
      };
      
      return (
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: variantStyles.iconBg }}
        >
          <img 
            src={defaultIcons[variant]} 
            alt={`${variant} icon`} 
            className="w-4 h-4"
          />
        </div>
      );
    }
    
    if (typeof icon === 'string') {
      return (
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: variantStyles.iconBg }}
        >
          <img src={icon} alt="Alert icon" className="w-4 h-4" />
        </div>
      );
    }
    
    return icon;
  };

  return (
    <div 
      className={`flex items-start p-3 sm:p-4 rounded-lg border shadow-md w-[calc(100vw-32px)] sm:w-auto max-w-md ${className}`}
      style={{ 
        backgroundColor: colors['bg-primary'],
        borderColor: variantStyles.borderColor,
        zIndex: zIndex
      }}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mr-2 sm:mr-3">
        {renderIcon()}
      </div>
      
      {/* Content */}
      <div className="flex-grow min-w-0">
        {/* Title */}
        <div 
          className="text-sm font-medium mb-0.5 sm:mb-1 break-words"
          style={{ color: colors['text-primary'] }}
        >
          {title}
        </div>
        
        {/* Message */}
        <div 
          className="text-sm mb-2 sm:mb-3 break-words"
          style={{ color: colors['text-secondary'] }}
        >
          {message}
        </div>
        
        {/* Actions */}
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-wrap gap-2 sm:gap-4">
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="text-sm font-medium"
                style={{ color: colors['text-secondary'] }}
              >
                {secondaryAction.label}
              </button>
            )}
            
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                className="text-sm font-medium"
                style={{ color: colors['text-accent'] }}
              >
                {primaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Close button */}
      <button
        onClick={onClose}
        className="flex-shrink-0 ml-2 sm:ml-3 rounded-md hover:bg-opacity-10 p-0.5 sm:p-1 transition duration-150 hover:bg-gray-200"
        style={{ 
          color: colors['text-secondary']
        }}
      >
        <img 
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/x-close-icon.svg`}
          alt="Close" 
          className="w-3 h-3 sm:w-4 sm:h-4"
        />
      </button>
    </div>
  );
};

export default Alert; 