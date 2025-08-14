'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useColors } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';
import InputField from '@/app/components/InputFields';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { createClient } from '@/utils/supabase/client';
import { User } from '@/types/user';

interface Source {
  label?: string;
  workflow_name: string;
  workflow_id: number;
  step_title: string | null;
  step_position: number;
  similarity_score: number;
  workflow_url?: string; // Added workflow_url
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  sources?: Source[];
  contextUsed?: boolean;
  streaming?: boolean;
  started?: boolean;
}

export default function AssistantPage() {
  const colors = useColors();
  const router = useRouter();
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authAvatarUrl, setAuthAvatarUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get user data on component mount
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        // Also capture avatar from auth provider metadata as an additional fallback
        const meta = (authUser as any)?.user_metadata || {};
        setAuthAvatarUrl(meta.avatar_url || meta.picture || null);
        // Fetch full user data from your user table using auth_id (UUID)
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', authUser.id)
          .single();
        setUser(userData);
      }
    };
    getUser();
  }, [supabase]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderWithCitations = (text: string, sources?: Source[]) => {
    if (!sources || sources.length === 0)
      return <p className="whitespace-pre-wrap">{text}</p>;

    const labelMap = new Map<string, Source>();
    sources.forEach((s) => {
      if (s.label) labelMap.set(s.label, s);
    });

    const truncate = (name: string) =>
      name.length > 30 ? `${name.slice(0, 30)}...` : name;

    // Split by sentences OR line breaks so bullets like "- foo [S1]" are handled
    const sentences = text.split(/(?:\n+|(?<=[.!?])\s+)/);

    return (
      <div>
        {sentences.map((sentence, idx) => {
          // Find labels either in bracketed form [S1,S2] (optionally followed by punctuation) or as bare trailing labels S1,S2
          let labelsStr: string | null = null;
          const bracketMatch = sentence.match(
            /\[(S\d+(?:,S\d+)*)\][\s\.,;:!?]*$/
          );
          if (bracketMatch) {
            labelsStr = bracketMatch[1];
          } else {
            const bareMatch = sentence.match(
              /\s(S\d+(?:\s*,\s*S\d+)*)[.,;:]?\s*$/
            );
            if (bareMatch) labelsStr = bareMatch[1].replace(/\s+/g, '');
          }

          // Clean the sentence from the labels
          const cleanSentence = sentence
            .replace(/\s*\[(S\d+(?:,S\d+)*)\][\s\.,;:!?]*$/, '')
            .replace(/\s*S\d+(?:\s*,\s*S\d+)*[\.,;:!?]?\s*$/, '');

          const labels = labelsStr ? labelsStr.split(',') : [];

          return (
            <div key={idx} className="mb-2">
              <p className="whitespace-pre-wrap">{cleanSentence}</p>
              {labels.length > 0 && (
                <div className="mt-1 mb-2 flex items-center flex-wrap gap-2">
                  <span
                    className="text-xs"
                    style={{ color: colors['text-secondary'] }}
                  >
                    Sources:
                  </span>
                  {labels.map((l, i) => {
                    const src = labelMap.get(l.trim());
                    if (!src || !src.workflow_url) return null;
                    const chipText = truncate(src.workflow_name || l);
                    return (
                      <a
                        key={`${l}-${i}`}
                        href={src.workflow_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="italic font-semibold"
                        style={{
                          display: 'inline-block',
                          padding: '1px 4px',
                          backgroundColor: '#195e83',
                          color: '#ffffff',
                          border: '1px solid #374151',
                          borderRadius: '9999px',
                          textDecoration: 'none',
                          lineHeight: 1.2,
                          fontSize: '0.8em',
                        }}
                      >
                        {chipText}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

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

      // Prepare conversation history for context (include the just-added user message)
      const conversationHistory = [...messages, userMessage].map((msg) => ({
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

      // Call the API (non-streaming)
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory,
          workspaceId,
        }),
      });

      if (!response.ok) {
        let errMsg = 'Failed to get AI response';
        try {
          const err = await response.json();
          errMsg = err?.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      if (data?.success) {
        const aiMessage: Message = {
          id: data.messageId || `ai-${Date.now()}-${Math.random()}`,
          content: data.response,
          isUser: false,
          timestamp: new Date(),
          sources: data.sources || [],
          contextUsed: data.context_used || false,
          streaming: false,
          started: true,
        };
        setMessages((prev) => [...prev, aiMessage]);
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

  const quickActions = [
    'Show me all my workflows',
    'How do I assign a task to someone?',
    'What is the status of my pending approvals?',
    'How do I set up automated notifications?',
  ];

  return (
    <div
      className="flex flex-col h-screen relative"
      style={{ backgroundColor: colors['bg-primary'] }}
    >
      {/* CSS for reverse animation */}
      <style jsx>{`
        @keyframes reverse-spin {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
      `}</style>
      {/* Enhanced Header */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b backdrop-blur-sm"
        style={{
          borderColor: colors['border-secondary'],
          backgroundColor: colors['bg-primary'] + 'F0',
        }}
      >
        <div className="flex items-center">
          <ButtonNormal
            variant="tertiary"
            size="small"
            leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-left.svg`}
            onClick={handleBackToDashboard}
            className="hover:scale-105 transition-transform duration-200"
          >
            Back to Dashboard
          </ButtonNormal>
        </div>

        {/* Settings Toggle */}
        <ButtonNormal
          variant="tertiary"
          size="small"
          leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/settings-04.svg`}
          onClick={() => setShowSettings(!showSettings)}
          className="hover:scale-105 transition-transform duration-200"
        >
          Settings
        </ButtonNormal>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div
          className="border-b px-6 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200"
          style={{
            borderColor: colors['border-secondary'],
            backgroundColor: colors['bg-secondary'] + 'CC',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="flex items-center justify-between">
            <h3
              className="font-medium"
              style={{ color: colors['text-primary'] }}
            >
              Assistant Settings
            </h3>
            <ButtonNormal
              variant="link"
              size="small"
              onClick={() => setShowSettings(false)}
            >
              Done
            </ButtonNormal>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Reset Embeddings */}
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                style={{ color: colors['text-secondary'] }}
              >
                Data Management
              </label>
              <ButtonNormal
                variant="secondary"
                size="small"
                leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/refresh-ccw-01.svg`}
                onClick={async () => {
                  try {
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

                        const resetResponse = await fetch(
                          '/api/embeddings/reset',
                          {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ workspaceId }),
                          }
                        );

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
                    alert(
                      'Error resetting embeddings. Check console for details.'
                    );
                  }
                }}
                className="w-full"
              >
                Reset Embeddings
              </ButtonNormal>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${colors['accent-primary']}, #4E6BD7)`,
                boxShadow: `0 8px 32px ${colors['accent-primary']}40`,
              }}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logomark-pf.png`}
                alt="ProcessFlow Assistant"
                className="w-10 h-10"
                onError={(e) => {
                  console.error('Logo failed to load, using fallback');
                  e.currentTarget.src = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/message-smile-circle.svg`;
                }}
              />
            </div>
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-[#4761C4] to-[#4E6BD7] bg-clip-text text-transparent">
              How can I help you today?
            </h2>
            <p
              className="text-lg mb-8 max-w-lg leading-relaxed"
              style={{ color: colors['text-secondary'] }}
            >
              I'm here to help you find any information from your processes and
              workflows.
            </p>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(action)}
                  className="p-4 rounded-xl border-2 border-dashed transition-all duration-200 hover:scale-[1.02] hover:shadow-md text-left group"
                  style={{
                    borderColor: colors['border-secondary'],
                    backgroundColor: colors['bg-secondary'] + '60',
                    color: colors['text-secondary'],
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-2 h-2 rounded-full mt-2 group-hover:scale-150 transition-transform"
                      style={{ backgroundColor: colors['accent-primary'] }}
                    />
                    <span className="text-sm font-medium group-hover:text-[#4761C4] transition-colors">
                      {action}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} group`}
              >
                <div
                  className={`flex gap-3 max-w-[85%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 ${message.isUser ? 'ml-3' : 'mr-3'}`}
                  >
                    {message.isUser ? (
                      /* User Avatar - Prefer stored avatar, then signed URL, then provider metadata, then default */
                      <img
                        src={(() => {
                          const defaultAvatar = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/images/default_avatar.png`;
                          if (user?.avatar_url) {
                            return user.avatar_url.startsWith('http')
                              ? user.avatar_url
                              : user.avatar_signed_url || defaultAvatar;
                          }
                          if (user?.avatar_signed_url)
                            return user.avatar_signed_url;
                          if (authAvatarUrl) return authAvatarUrl;
                          return defaultAvatar;
                        })()}
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full object-cover select-none"
                        draggable="false"
                        onError={(e) => {
                          e.currentTarget.src = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/images/default_avatar.png`;
                        }}
                      />
                    ) : (
                      /* AI Avatar */
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center border-2"
                        style={{
                          backgroundColor: colors['bg-tertiary'],
                          borderColor: colors['border-secondary'],
                        }}
                      >
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logomark-pf.png`}
                          alt="AI"
                          className="w-5 h-5"
                        />
                      </div>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className="flex-1 space-y-2">
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm ${message.isUser ? 'rounded-br-md' : 'rounded-bl-md'}`}
                      style={{
                        backgroundColor: message.isUser
                          ? colors['brand-primary']
                          : colors['bg-secondary'],
                        border: `1px solid ${message.isUser ? 'transparent' : colors['border-secondary']}`,
                        boxShadow: message.isUser
                          ? `0 2px 8px ${colors['brand-primary']}40`
                          : `0 2px 8px ${colors['border-secondary']}40`,
                      }}
                    >
                      {message.isUser ? (
                        <p
                          className="whitespace-pre-wrap leading-relaxed"
                          style={{
                            color: message.isUser
                              ? '#101828'
                              : colors['text-primary'],
                          }}
                        >
                          {message.content}
                        </p>
                      ) : message.streaming && !message.started ? (
                        <div className="flex items-center gap-1">
                          <span style={{ color: colors['text-primary'] }}>
                            …
                          </span>
                          <span
                            className="animate-pulse"
                            style={{ color: colors['text-primary'] }}
                          >
                            …
                          </span>
                          <span style={{ color: colors['text-primary'] }}>
                            …
                          </span>
                        </div>
                      ) : message.streaming ? (
                        <p
                          className="whitespace-pre-wrap leading-relaxed"
                          style={{ color: colors['text-primary'] }}
                        >
                          {message.content}
                        </p>
                      ) : (
                        <div>
                          {renderWithCitations(
                            message.content,
                            message.sources
                          )}
                        </div>
                      )}
                      {/* Enhanced Sources Display - group by workflow */}
                      {!message.isUser &&
                        !message.streaming &&
                        message.contextUsed &&
                        message.sources &&
                        message.sources.length > 0 &&
                        (() => {
                          // Build workflow summaries
                          const workflows = new Map<
                            number,
                            {
                              workflow_id: number;
                              workflow_name: string;
                              workflow_url?: string;
                              count: number;
                              maxSimilarity: number;
                            }
                          >();
                          for (const s of message.sources!) {
                            const existing = workflows.get(s.workflow_id);
                            if (!existing) {
                              workflows.set(s.workflow_id, {
                                workflow_id: s.workflow_id,
                                workflow_name: s.workflow_name,
                                workflow_url: s.workflow_url,
                                count: 1,
                                maxSimilarity: s.similarity_score ?? 0,
                              });
                            } else {
                              existing.count += 1;
                              if (s.similarity_score > existing.maxSimilarity) {
                                existing.maxSimilarity = s.similarity_score;
                              }
                            }
                          }
                          const workflowList = Array.from(
                            workflows.values()
                          ).sort((a, b) => b.maxSimilarity - a.maxSimilarity);
                          return (
                            <div
                              className="mt-4 pt-3 border-t"
                              style={{
                                borderColor: colors['border-secondary'] + '50',
                              }}
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{
                                    backgroundColor:
                                      colors['accent-primary'] + '40',
                                  }}
                                >
                                  <svg
                                    className="w-4 h-4 p-0.5"
                                    fill="currentColor"
                                    style={{ color: colors['accent-primary'] }}
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <span
                                  className="text-xs font-semibold"
                                  style={{ color: colors['text-secondary'] }}
                                >
                                  Referenced from {workflowList.length} workflow
                                  {workflowList.length > 1 ? 's' : ''}:
                                </span>
                              </div>
                              <div className="grid gap-2">
                                {workflowList.map((wf) => (
                                  <div
                                    key={wf.workflow_id}
                                    className="p-3 rounded-lg border transition-colors hover:bg-opacity-80 cursor-pointer"
                                    style={{
                                      backgroundColor:
                                        colors['bg-tertiary'] + '80',
                                      borderColor: colors['border-secondary'],
                                    }}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div
                                          className="font-medium text-sm"
                                          style={{
                                            color: colors['text-primary'],
                                          }}
                                        >
                                          {wf.workflow_url ? (
                                            <a
                                              href={wf.workflow_url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="underline"
                                              style={{
                                                color: colors['accent-primary'],
                                              }}
                                            >
                                              {wf.workflow_name}
                                            </a>
                                          ) : (
                                            wf.workflow_name
                                          )}
                                        </div>
                                        <div
                                          className="text-xs mt-1"
                                          style={{
                                            color: colors['text-secondary'],
                                          }}
                                        >
                                          {wf.count} step
                                          {wf.count > 1 ? 's' : ''} referenced
                                        </div>
                                      </div>
                                      <div
                                        className="text-xs font-mono px-2 py-1 rounded"
                                        style={{
                                          backgroundColor:
                                            colors['accent-primary'] + '20',
                                          color: colors['accent-primary'],
                                        }}
                                      >
                                        {(wf.maxSimilarity * 100).toFixed(0)}%
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                    </div>

                    {/* Message Metadata */}
                    <div
                      className={`flex items-center gap-2 text-xs ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <span style={{ color: colors['text-tertiary'] }}>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {!message.isUser && message.contextUsed && (
                        <span
                          className="flex items-center gap-1 px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: colors['accent-primary'] + '20',
                            color: colors['accent-primary'],
                          }}
                        >
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Context-aware
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Loading indicator */}
        {isLoading && !messages.some((m) => m.streaming) && (
          <div className="flex justify-start max-w-4xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center border-2"
                  style={{
                    backgroundColor: colors['bg-tertiary'],
                    borderColor: colors['border-secondary'],
                  }}
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logomark-pf.png`}
                    alt="AI"
                    className="w-5 h-5 animate-pulse"
                    onError={(e) => {
                      e.currentTarget.src = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/message-smile-circle.svg`;
                    }}
                  />
                </div>
              </div>
              <div
                className="rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border"
                style={{
                  backgroundColor: colors['bg-secondary'],
                  borderColor: colors['border-secondary'],
                }}
              >
                <div className="flex items-center gap-3">
                  {/* ProcessFlow Thinking Animation */}
                  <div className="relative">
                    {/* Pulsing Background */}
                    <div
                      className="absolute inset-0 w-8 h-8 rounded-full animate-ping opacity-20"
                      style={{ backgroundColor: colors['accent-primary'] }}
                    />
                    {/* Rotating Logo */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center animate-spin"
                      style={{
                        background: `linear-gradient(135deg, ${colors['accent-primary']}, #4E6BD7)`,
                        animationDuration: '2s',
                      }}
                    >
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logomark-pf.png`}
                        alt="ProcessFlow Thinking"
                        className="w-5 h-5"
                        style={{ animation: 'reverse-spin 2s linear infinite' }}
                        onError={(e) => {
                          e.currentTarget.src = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/message-smile-circle.svg`;
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors['text-primary'] }}
                    >
                      Assistant is thinking...
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: colors['text-tertiary'] }}
                    >
                      Searching through your workflows
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input Container */}
      <div
        className="border-t backdrop-blur-sm bg-opacity-95"
        style={{
          borderColor: colors['border-secondary'],
          backgroundColor: colors['bg-primary'] + 'F5',
        }}
      >
        <div className="max-w-4xl mx-auto p-4">
          {/* Message Suggestions (only show when empty) */}
          {messages.length === 0 && inputValue === '' && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {quickActions.slice(0, 2).map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setInputValue(action)}
                    className="px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 border"
                    style={{
                      backgroundColor: colors['bg-secondary'],
                      color: colors['text-secondary'],
                      borderColor: colors['border-secondary'],
                    }}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              {/* Enhanced Input Field with Custom Styling */}
              <div
                className="relative rounded-2xl border-2 transition-all duration-200 shadow-sm hover:shadow-md focus-within:shadow-lg focus-within:border-[#4761C4]"
                style={{
                  borderColor: colors['border-secondary'],
                  backgroundColor: colors['bg-secondary'],
                }}
              >
                <div className="flex items-end min-h-[52px]">
                  <div className="flex-1 p-4">
                    <textarea
                      value={inputValue}
                      onChange={(e) => {
                        console.log('Input value changed:', e.target.value);
                        setInputValue(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          console.log(
                            'Enter key pressed, sending message:',
                            inputValue.trim()
                          );
                          handleSendMessage();
                        }
                      }}
                      placeholder="Ask me anything about your workflows..."
                      className="w-full resize-none border-none outline-none bg-transparent text-base leading-relaxed min-h-[24px] max-h-32"
                      style={{
                        color: colors['text-primary'],
                        fontFamily: 'Inter, sans-serif',
                      }}
                      rows={1}
                      disabled={isLoading}
                      data-testid="assistant-input"
                      onInput={(e) => {
                        // Auto-resize textarea
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                      }}
                    />
                  </div>

                  {/* Input Actions */}
                  <div className="flex items-center gap-2 p-2">
                    {/* Character Count (for longer messages) */}
                    {inputValue.length > 100 && (
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: colors['accent-primary'] + '20',
                          color: colors['accent-primary'],
                        }}
                      >
                        {inputValue.length}
                      </span>
                    )}

                    {/* Send Button - Enhanced visibility with hard-coded colors */}
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 transform shadow-lg ${!inputValue.trim() || isLoading ? 'cursor-not-allowed scale-95' : 'hover:scale-105 active:scale-95 cursor-pointer hover:shadow-xl'}`}
                      style={{
                        background:
                          !inputValue.trim() || isLoading
                            ? `linear-gradient(135deg, #CBD5E1, #94A3B8)`
                            : `linear-gradient(135deg, #4761C4, #4E6BD7)`,
                        boxShadow:
                          !inputValue.trim() || isLoading
                            ? `0 4px 12px rgba(148, 163, 184, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.2)`
                            : `0 6px 20px rgba(71, 97, 196, 0.3), 0 2px 6px rgba(0, 0, 0, 0.1)`,
                        border:
                          !inputValue.trim() || isLoading
                            ? '2px solid #E2E8F0'
                            : `2px solid #4761C4`,
                        opacity: 1,
                      }}
                      data-testid="send-message-button"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : (
                        <svg
                          className={`w-6 h-6 transition-colors ${!inputValue.trim() ? 'text-slate-500' : 'text-white'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Input Hint */}
              <div className="flex items-center justify-between mt-2 px-1">
                <p
                  className="text-xs"
                  style={{ color: colors['text-tertiary'] }}
                >
                  Press Enter to send, Shift+Enter for new line
                </p>
                {inputValue.trim() && !isLoading && (
                  <p
                    className="text-xs"
                    style={{ color: colors['text-tertiary'] }}
                  >
                    AI will search through your workflows
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
