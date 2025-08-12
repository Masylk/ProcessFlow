/*
'use client';

import React, { useState, useContext } from 'react';
import { useTheme, useColors } from '@/app/theme/hooks';
import { cn } from '@/lib/utils/cn';
import ButtonNormal from '@/app/components/ButtonNormal';
import Image from 'next/image';
import { HeaderHeightContext } from './Header';

interface FeedbackMessage {
  id: string;
  user: {
    name: string;
    avatar: string;
    isOnline?: boolean;
  };
  message?: string;
  attachment?: {
    name: string;
    type: string;
    size: string;
  };
  timestamp: string;
  isYou?: boolean;
  status?: 'pending' | 'resolved';
  type?: 'feedback' | 'comment';
}

interface FeedbackSlideoutProps {
  isOpen: boolean;
  onClose: () => void;
  messages: FeedbackMessage[];
  onSendMessage: (message: string) => void;
}

const FeedbackContent: React.FC<{ messages: FeedbackMessage[]; colors: any }> = ({ messages, colors }) => {
  const feedbackMessages = messages.filter(m => !m.status || m.status === 'pending');
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: colors['bg-secondary'] }}>
      {feedbackMessages.map((message) => (
        <MessageItem key={message.id} message={message} colors={colors} />
      ))}
    </div>
  );
};

const ResolvedContent: React.FC<{ messages: FeedbackMessage[]; colors: any }> = ({ messages, colors }) => {
  const resolvedMessages = messages.filter(m => m.status === 'resolved');
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: colors['bg-secondary'] }}>
      {resolvedMessages.map((message) => (
        <MessageItem key={message.id} message={message} colors={colors} />
      ))}
      {resolvedMessages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center" style={{ color: colors['text-secondary'] }}>
          <p className="text-sm">No resolved items yet</p>
        </div>
      )}
    </div>
  );
};

const CommentsContent: React.FC<{ messages: FeedbackMessage[]; colors: any }> = ({ messages, colors }) => {
  const comments = messages.filter(m => m.type === 'comment');
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: colors['bg-secondary'] }}>
      {comments.map((message) => (
        <MessageItem key={message.id} message={message} colors={colors} />
      ))}
      {comments.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center" style={{ color: colors['text-secondary'] }}>
          <p className="text-sm">No comments yet</p>
        </div>
      )}
    </div>
  );
};

const MessageItem: React.FC<{ message: FeedbackMessage; colors: any }> = ({ message, colors }) => (
  <div className={cn("flex items-start gap-3", message.isYou && "flex-row-reverse")}>
    <div className="relative">
      <div className="w-8 h-8 rounded-full overflow-hidden" style={{ backgroundColor: colors['bg-tertiary'] }}>
        <Image
          src={message.user.avatar}
          alt={message.user.name}
          width={32}
          height={32}
          className="object-cover"
        />
      </div>
      {message.user.isOnline && (
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
          style={{ backgroundColor: colors['success'], borderColor: colors['bg-primary'] }}
        />
      )}
    </div>
    <div className={cn("flex flex-col max-w-[280px] p-3 rounded-lg", message.isYou ? "text-white" : "border")}
      style={{ 
        backgroundColor: message.isYou ? colors['bg-brand-solid'] : colors['bg-primary'],
        borderColor: message.isYou ? 'transparent' : colors['border-secondary'],
        color: message.isYou ? colors['text-inverse'] : colors['text-primary']
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-sm">{message.user.name}</span>
        <span className="text-xs"
          style={{ color: message.isYou ? colors['text-inverse-secondary'] : colors['text-secondary'] }}
        >
          {message.timestamp}
        </span>
      </div>
      {message.message && <p className="text-sm">{message.message}</p>}
      {message.attachment && (
        <div className="mt-2 p-2 rounded flex items-center gap-2"
          style={{ backgroundColor: message.isYou ? colors['accent-secondary'] : colors['bg-secondary'] }}
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/pdf-icon.svg`}
              alt="PDF"
              width={24}
              height={24}
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{message.attachment.name}</p>
            <p className="text-xs"
              style={{ color: message.isYou ? colors['text-inverse-secondary'] : colors['text-secondary'] }}
            >
              {message.attachment.size}
            </p>
          </div>
        </div>
      )}
    </div>
  </div>
);

const FeedbackSlideout: React.FC<FeedbackSlideoutProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage
}) => {
  const { getCssVariable } = useTheme();
  const colors = useColors();
  const headerHeight = useContext(HeaderHeightContext);
  const [activeTab, setActiveTab] = useState<'feedbacks' | 'resolved' | 'comments'>('feedbacks');
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'feedbacks':
        return <FeedbackContent messages={messages} colors={colors} />;
      case 'resolved':
        return <ResolvedContent messages={messages} colors={colors} />;
      case 'comments':
        return <CommentsContent messages={messages} colors={colors} />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn(
        "fixed right-0 flex flex-col transition-transform duration-300 ease-in-out z-40",
        "border-l shadow-lg",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
      style={{ 
        backgroundColor: colors['bg-primary'],
        borderColor: colors['border-primary'],
        width: '400px',
        height: `calc(100vh - ${headerHeight}px)`,
        top: `${headerHeight}px`
      }}
    >
      {/* Header *//*
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold" style={{ color: colors['text-primary'] }}>
          {activeTab === 'feedbacks' ? 'Feedbacks' : activeTab === 'resolved' ? 'Resolved' : 'Comments'}
        </h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full transition-colors hover:opacity-80"
          style={{ backgroundColor: colors['bg-secondary'] }}
        >
          <Image
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/x-close-icon.svg`}
            alt="Close"
            width={16}
            height={16}
          />
        </button>
      </div>

      {/* Tabs *//*
      <div className="flex px-4 border-b" style={{ borderColor: colors['border-secondary'] }}>
        {['Feedbacks', 'Resolved', 'Comments'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase() as any)}
            className={cn(
              "py-3 px-4 text-sm font-medium relative transition-colors hover:opacity-80",
              activeTab === tab.toLowerCase() && "border-b-2"
            )}
            style={{
              color: activeTab === tab.toLowerCase() ? colors['text-brand-tertiary'] : colors['text-secondary'],
              borderColor: activeTab === tab.toLowerCase() ? colors['text-brand-tertiary'] : 'transparent'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content *}/*
      {renderContent()}

      {/* Message Input *//*
      <div className="p-4 border-t"
        style={{ backgroundColor: colors['bg-primary'], borderColor: colors['border-secondary'] }}
      >
        <div className="flex items-center gap-2 p-2 rounded-lg"
          style={{ backgroundColor: colors['bg-secondary'] }}
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Type your ${activeTab === 'comments' ? 'comment' : 'feedback'}...`}
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-secondary"
            style={{ color: colors['text-primary'] }}
          />
          <ButtonNormal
            variant="primary"
            size="small"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            iconOnly
            leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/send-01.svg`}
          />
        </div>
      </div>
    </div>
  );
};

export default FeedbackSlideout;*/
