'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useColors } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';
import InputField from '@/app/components/InputFields';
import LoadingSpinner from '@/app/components/LoadingSpinner';

interface Source {
  workflow_name: string;
  workflow_id: number;
  step_title: string | null;
  step_position: number;
  similarity_score: number;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  sources?: Source[];
  contextUsed?: boolean;
}

export default function AssistantPage() {
  const colors = useColors();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.6);
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
      // Get workspace ID from URL
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      const workspaceSlug = pathSegments.length > 0 ? pathSegments[0] : '';

      // Prepare conversation history for context
      const conversationHistory = messages.map((msg) => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content,
      }));

      // Get workspace ID from slug (we'll need to fetch this)
      let workspaceId: number | undefined;
      if (workspaceSlug) {
        try {
          const workspaceResponse = await fetch(
            `/api/workspace/slug/${workspaceSlug}`
          );
          if (workspaceResponse.ok) {
            const workspaceData = await workspaceResponse.json();
            workspaceId = workspaceData.id;
          }
        } catch (error) {
          console.warn('Failed to fetch workspace ID:', error);
        }
      }

      // Call the API
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory,
          workspaceId,
          similarityThreshold,
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
          sources: data.sources || [],
          contextUsed: data.context_used || false,
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

        {/* Similarity Threshold Slider */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor="similarity-slider"
              className="text-sm font-medium whitespace-nowrap"
              style={{ color: colors['text-secondary'] }}
            >
              Search Precision: {(similarityThreshold * 100).toFixed(0)}%
            </label>
            <input
              id="similarity-slider"
              type="range"
              min="0"
              max="0.95"
              step="0.05"
              value={similarityThreshold}
              onChange={(e) =>
                setSimilarityThreshold(parseFloat(e.target.value))
              }
              className="w-24 h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${colors['accent-primary']} 0%, ${colors['accent-primary']} ${(similarityThreshold / 0.95) * 100}%, ${colors['border-secondary']} ${(similarityThreshold / 0.95) * 100}%, ${colors['border-secondary']} 100%)`,
              }}
            />
          </div>
          <div className="text-xs" style={{ color: colors['text-tertiary'] }}>
            <div>0% = All Results (Broad Search)</div>
            <div>95% = Only Most Relevant</div>
            <div className="mt-1 text-xs opacity-75">
              Controls how similar workflow blocks must be to your question
            </div>
          </div>

          {/* Reset Embeddings Button */}
          <ButtonNormal
            variant="secondary"
            size="small"
            onClick={async () => {
              try {
                // Get workspace ID from URL
                const pathSegments = window.location.pathname
                  .split('/')
                  .filter(Boolean);
                const workspaceSlug =
                  pathSegments.length > 0 ? pathSegments[0] : '';

                if (workspaceSlug) {
                  const workspaceResponse = await fetch(
                    `/api/workspace/slug/${workspaceSlug}`
                  );
                  if (workspaceResponse.ok) {
                    const workspaceData = await workspaceResponse.json();
                    const workspaceId = workspaceData.id;

                    // Call the reset endpoint
                    const resetResponse = await fetch('/api/embeddings/reset', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ workspaceId }),
                    });

                    if (resetResponse.ok) {
                      alert(
                        'Embeddings reset successfully! Try asking a question now.'
                      );
                    } else {
                      alert(
                        'Failed to reset embeddings. Check console for details.'
                      );
                    }
                  }
                }
              } catch (error) {
                console.error('Error resetting embeddings:', error);
                alert('Error resetting embeddings. Check console for details.');
              }
            }}
          >
            🔄 Reset Embeddings
          </ButtonNormal>
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

                  {/* Show sources if this is an AI message with context */}
                  {!message.isUser &&
                    message.contextUsed &&
                    message.sources &&
                    message.sources.length > 0 && (
                      <div
                        className="mt-3 pt-2 border-t"
                        style={{ borderColor: colors['border-secondary'] }}
                      >
                        <p
                          className="text-xs font-medium mb-2"
                          style={{ color: colors['text-secondary'] }}
                        >
                          📋 Referenced from your workflows:
                        </p>
                        <div className="space-y-1">
                          {message.sources.map((source, index) => (
                            <div
                              key={index}
                              className="text-xs p-2 rounded"
                              style={{ backgroundColor: colors['bg-tertiary'] }}
                            >
                              <div
                                className="font-medium"
                                style={{ color: colors['text-primary'] }}
                              >
                                {source.workflow_name}
                              </div>
                              <div style={{ color: colors['text-secondary'] }}>
                                Step {source.step_position}:{' '}
                                {source.step_title || 'Untitled Step'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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
                    {!message.isUser && message.contextUsed && (
                      <span className="ml-2">✨ Context-aware</span>
                    )}
                    {!message.isUser && (
                      <span className="ml-2">
                        🔍 Threshold: {(similarityThreshold * 100).toFixed(0)}%
                      </span>
                    )}
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
