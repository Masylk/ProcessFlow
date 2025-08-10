'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useColors } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';
import InputField from '@/app/components/InputFields';
import LoadingSpinner from '@/app/components/LoadingSpinner';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AssistantPage() {
  const colors = useColors();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    console.log('Sending message:', inputValue.trim());

    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random()}`,
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => {
      console.log('Previous messages:', prev);
      const newMessages = [...prev, userMessage];
      console.log('New messages after adding user message:', newMessages);
      return newMessages;
    });
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map((msg) => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content,
      }));

      // Call the API
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: data.messageId || `ai-${Date.now()}-${Math.random()}`,
          content: data.response,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => {
          console.log('Previous messages before AI response:', prev);
          const newMessages = [...prev, aiMessage];
          console.log('New messages after adding AI message:', newMessages);
          return newMessages;
        });
      } else {
        throw new Error('AI response was not successful');
      }
    } catch (error) {
      console.error('Error getting AI response:', error);

      // Add error message to chat
      const errorMessage: Message = {
        id: `error-${Date.now()}-${Math.random()}`,
        content:
          'Sorry, I encountered an error while processing your request. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBackToDashboard = () => {
    // Get the current workspace slug from the URL
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const workspaceSlug = pathSegments.length > 0 ? pathSegments[0] : '';

    if (workspaceSlug) {
      router.push(`/${workspaceSlug}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div
      className="flex flex-col h-screen"
      style={{ backgroundColor: colors['bg-primary'] }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: colors['border-secondary'] }}
      >
        <div className="flex items-center gap-3">
          <ButtonNormal
            variant="tertiary"
            size="small"
            leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-left.svg`}
            onClick={handleBackToDashboard}
          >
            Back to Dashboard
          </ButtonNormal>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors['accent-primary'] }}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/message-circle-01.svg`}
                alt="Assistant"
                className="w-5 h-5"
              />
            </div>
            <h1
              className="text-xl font-semibold"
              style={{ color: colors['text-primary'] }}
            >
              AI Assistant
            </h1>
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: colors['accent-primary'] }}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/message-circle-01.svg`}
                alt="Assistant"
                className="w-8 h-8"
              />
            </div>
            <h2
              className="text-2xl font-semibold mb-2"
              style={{ color: colors['text-primary'] }}
            >
              How can I help you today?
            </h2>
            <p
              className="text-lg max-w-md"
              style={{ color: colors['text-secondary'] }}
            >
              I'm here to assist you with your workflows, processes, and any
              questions you might have.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    message.isUser ? 'rounded-br-none' : 'rounded-bl-none'
                  }`}
                  style={{
                    backgroundColor: message.isUser
                      ? colors['accent-primary']
                      : colors['bg-secondary'],
                    color: message.isUser ? 'black' : colors['text-primary'],
                  }}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p
                    className="text-xs mt-2 opacity-70"
                    style={{
                      color: message.isUser
                        ? 'white'
                        : colors['text-secondary'],
                    }}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div
              className="max-w-[70%] rounded-lg p-4 rounded-bl-none"
              style={{ backgroundColor: colors['bg-secondary'] }}
            >
              <div className="flex items-center gap-2">
                <LoadingSpinner size="small" />
                <span style={{ color: colors['text-secondary'] }}>
                  Assistant is typing...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <div
        className="border-t p-4"
        style={{ borderColor: colors['border-secondary'] }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <InputField
                type="default"
                value={inputValue}
                onChange={(value) => {
                  console.log('Input value changed:', value);
                  setInputValue(value);
                }}
                placeholder="Type your message..."
                onKeyDown={handleKeyDown}
                dataTestId="assistant-input"
              />
            </div>
            <ButtonNormal
              variant="primary"
              size="medium"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              data-testid="send-message-button"
            >
              Send
            </ButtonNormal>
          </div>
        </div>
      </div>
    </div>
  );
}
