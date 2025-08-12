import React from 'react';
import { useColors } from '@/app/theme/hooks';

/**
 * Props for the UserChatMessage component
 */
interface UserChatMessageProps {
  /** The message content to display */
  message: string;
  /** Whether this is the last message in the conversation */
  isLastMessage?: boolean;
}

/**
 * Displays a user message in the chat interface
 */
const UserChatMessage: React.FC<UserChatMessageProps> = ({
  message,
  isLastMessage = false
}) => {
  const colors = useColors();
  
  return (
    <div 
      className="flex items-start justify-end animate-fadeIn"
      style={{ animationDelay: '0.1s' }}
    >
      <div className="w-full">
        <div 
          className="prose prose-sm p-3 rounded-lg w-full shadow-sm border"
          style={{ 
            backgroundColor: colors['bg-secondary'],
            color: colors['text-primary'],
            borderColor: colors['border-primary'],
            boxShadow: `0 2px 4px ${colors['shadow-primary']}`
          }}
        >
          <p className="m-0 whitespace-pre-wrap break-words text-[13px] leading-[1.5]">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default UserChatMessage; 