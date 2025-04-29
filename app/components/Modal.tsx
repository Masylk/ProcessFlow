import React, { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useColors } from '@/app/theme/hooks';
import { ThemeProvider } from '@/app/context/ThemeContext';

export interface ModalProps {
  /**
   * Function to call when the modal is closed
   */
  onClose: () => void;
  
  /**
   * The title of the modal
   */
  title: string;
  
  /**
   * Optional subtitle or description of the modal
   */
  subtitle?: string;
  
  /**
   * Optional icon to display in the header
   * This can be a path to an image or an SVG component
   */
  icon?: string | ReactNode;
  
  /**
   * Optional background color for the icon container
   */
  iconBackgroundColor?: string;
  
  /**
   * Optional border color for the icon container
   */
  iconBorderColor?: string;
  
  /**
   * The content of the modal
   */
  children: ReactNode;
  
  /**
   * Optional footer actions
   * Typically buttons for "Cancel", "Submit", etc.
   */
  actions?: ReactNode;
  
  /**
   * Optional CSS class name for additional styling
   */
  className?: string;
  
  /**
   * Optional width for the modal
   * Default is 'w-[480px]'
   */
  width?: string;
  
  /**
   * Whether to show a separator between the header and content
   * Default is false
   */
  showHeaderSeparator?: boolean;
  
  /**
   * Whether to show a separator between the content and actions
   * Default is true
   */
  showActionsSeparator?: boolean;
}

/**
 * A reusable modal component that can be used as a base for all modals in the application.
 * The component is built with three main sections:
 * 1. Header: Contains the icon, title, and subtitle
 * 2. Content: Contains the main content of the modal (passed as children)
 * 3. Actions: Contains the footer actions (typically buttons)
 */
const Modal: React.FC<ModalProps> = ({
  onClose,
  title,
  subtitle,
  icon,
  iconBackgroundColor,
  iconBorderColor,
  children,
  actions,
  className = '',
  width = 'w-[480px]',
  showHeaderSeparator = false,
  showActionsSeparator = true,
}) => {
  const colors = useColors();

  // Prevent background clicks from closing the modal
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Determine if the icon is a string (path to an image) or a ReactNode
  const renderIcon = () => {
    if (!icon) return null;
    
    return (
      <div 
        className="w-12 h-12 p-3 rounded-[10px] border shadow-sm flex items-center justify-center"
        style={{ 
          backgroundColor: iconBackgroundColor || colors['bg-primary'],
          borderColor: iconBorderColor || colors['border-secondary']
        }}
      >
        {typeof icon === 'string' ? (
          <img
            src={icon}
            alt="Modal icon"
            className="w-6 h-6"
          />
        ) : (
          icon
        )}
      </div>
    );
  };

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center p-8 z-[9999]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="fixed inset-0">
        <div 
          style={{ backgroundColor: colors['bg-overlay'] }}
          className="absolute inset-0 opacity-70" 
        />
      </div>

      <div 
        className={`rounded-xl shadow-lg ${width} flex flex-col relative z-10 ${className}`}
        style={{ backgroundColor: colors['bg-primary'] }}
        onClick={handleModalClick}
      >
        {/* Header */}
        <div className={`flex flex-col items-start gap-4 px-6 pt-6 ${showHeaderSeparator ? 'pb-6 border-b' : ''}`}
          style={{ borderColor: showHeaderSeparator ? colors['border-secondary'] : 'transparent' }}>
          {renderIcon()}
          <div className="flex flex-col gap-1">
            <h2 
              className="text-lg font-medium"
              style={{ color: colors['text-primary'] }}
            >
              {title}
            </h2>
            {subtitle && (
              <p 
                className="text-sm"
                style={{ color: colors['text-secondary'] }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {children}
        </div>

        {/* Actions */}
        {actions && (
          <div 
            className={`flex gap-3 p-6 ${showActionsSeparator ? 'border-t' : ''}`}
            style={{ borderColor: showActionsSeparator ? colors['border-secondary'] : 'transparent' }}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );

  // Use createPortal with ThemeProvider to ensure theme context is available
  return createPortal(
    <ThemeProvider>
      {modalContent}
    </ThemeProvider>,
    document.body
  );
};

export default Modal;
