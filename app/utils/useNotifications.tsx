'use client';

import React, { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import Alert, { AlertVariant } from '@/app/components/Alert';

// Define notification types
export interface Notification {
  id: string;
  variant: AlertVariant;
  title: string;
  message: string;
  icon?: string;
  autoClose?: boolean;
  duration?: number;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

// Context type
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Define provider props
interface NotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number;
}

// Notification Provider component
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children, 
  maxNotifications = 5 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Add a new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 11);
    
    // Create the new notification with default values
    const newNotification: Notification = {
      id,
      autoClose: true,
      duration: 5000,
      ...notification
    };
    
    // Add to notifications array (limit to maxNotifications)
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      return updated.slice(0, maxNotifications);
    });
    
    // Auto-close if enabled
    if (newNotification.autoClose) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
    
    return id;
  }, [maxNotifications]);

  // Remove a notification by ID
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Context value
  const contextValue = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Render notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-4 max-w-md">
        {notifications.map(notification => (
          <Alert
            key={notification.id}
            variant={notification.variant}
            title={notification.title}
            message={notification.message}
            icon={notification.icon}
            onClose={() => removeNotification(notification.id)}
            primaryAction={notification.primaryAction}
            secondaryAction={notification.secondaryAction}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Custom hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};

// Helper functions for common notification types
export const useNotificationHelpers = () => {
  const { addNotification } = useNotifications();
  
  return {
    showSuccess: (title: string, message: string, options = {}) => {
      return addNotification({
        variant: 'success',
        title,
        message,
        ...options
      });
    },
    
    showInfo: (title: string, message: string, options = {}) => {
      return addNotification({
        variant: 'info',
        title,
        message,
        ...options
      });
    },
    
    showWarning: (title: string, message: string, options = {}) => {
      return addNotification({
        variant: 'warning',
        title,
        message,
        ...options
      });
    },
    
    showError: (title: string, message: string, options = {}) => {
      return addNotification({
        variant: 'error',
        title,
        message,
        autoClose: false,
        ...options
      });
    }
  };
};

export default useNotifications; 