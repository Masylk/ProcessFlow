import React, { useState, useRef, useEffect } from 'react';
import { useColors } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';
import AIChatMessage from './AIChatMessage';
import UserChatMessage from './UserChatMessage';
import Lottie from 'lottie-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}

const ChatContainer: React.FC = () => {
  const colors = useColors();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [animationData, setAnimationData] = useState<any>(null);
  const [isAnimationLoading, setIsAnimationLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAnimation = async () => {
      try {
        setIsAnimationLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/AI-thinking.json`);
        if (!response.ok) throw new Error('Failed to load animation');
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error('Error loading Lottie animation:', error);
      } finally {
        setIsAnimationLoading(false);
      }
    };
    
    fetchAnimation();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Here's how I can help with "${input.trim()}". As your process builder assistant, I can help you create and manage ProcessFlow workflows efficiently.`,
        role: 'assistant',
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleExampleClick = (text: string) => {
    setInput(text);
    // Immediately send the message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      role: 'user',
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Here's how I can help with "${text}". As your process builder assistant, I can help you create and manage ProcessFlow workflows efficiently.`,
        role: 'assistant',
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const renderWelcomeAnimation = () => {
    if (isAnimationLoading || !animationData) {
      return (
        <div 
          className="w-16 h-16 rounded-full animate-pulse"
          style={{ 
            background: 'radial-gradient(circle at 30% 30%, #7B5CF0 0%, #5D3DF2 100%)',
            boxShadow: '0 0 40px 5px rgba(123, 92, 240, 0.3)'
          }}
        />
      );
    }

    return (
      <div className="w-16 h-16">
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{
            width: '100%',
            height: '100%',
          }}
          className="rounded-full overflow-hidden"
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Content Area */}
      <div 
        className="flex-1 overflow-y-auto flex flex-col relative"
        style={{ backgroundColor: 'transparent' }}
      >
        {/* Messages or Welcome Screen */}
        <div className="flex-1">
          {messages.length === 0 && !isLoading ? (
            <div className="h-full flex flex-col items-center justify-center px-8 animate-fadeIn">
              {/* Purple gradient sphere replaced with Lottie animation */}
              <div className="relative mb-6 rounded-full overflow-hidden">
                {renderWelcomeAnimation()}
              </div>

              {/* Title and description */}
              <div className="flex flex-col items-center gap-2 text-center mb-6">
                <h3 
                  className="text-base font-semibold"
                  style={{ color: colors['text-primary'] }}
                >
                  Floz is your process builder assistant
                </h3>
                <p 
                  className="text-sm text-center"
                  style={{ color: colors['text-secondary'] }}
                >
                  Ask Floz to generate, optimize, personalize and fix issues within your process
                </p>
              </div>

              {/* Example prompts */}
              <div className="flex flex-col gap-2 w-full max-w-[300px]">
                <button
                  className="w-full p-3 rounded-xl text-sm text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                  style={{ 
                    backgroundColor: colors['bg-secondary'],
                    color: colors['text-primary'],
                    boxShadow: `0 2px 4px ${colors['shadow-primary']}`
                  }}
                  onClick={() => handleExampleClick("Help me create a conditional path for user authentication")}
                >
                  "Help me create a conditional path for user authentication"
                </button>
                <button
                  className="w-full p-3 rounded-xl text-sm text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                  style={{ 
                    backgroundColor: colors['bg-secondary'],
                    color: colors['text-primary'],
                    boxShadow: `0 2px 4px ${colors['shadow-primary']}`
                  }}
                  onClick={() => handleExampleClick("How can I optimize my current workflow?")}
                >
                  "How can I optimize my current workflow?"
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {messages.map((msg, index) => (
                msg.role === 'assistant' ? (
                  <AIChatMessage 
                    key={msg.id} 
                    message={msg.content}
                    isLastMessage={index === messages.length - 1}
                  />
                ) : (
                  <UserChatMessage 
                    key={msg.id} 
                    message={msg.content}
                    isLastMessage={index === messages.length - 1}
                  />
                )
              ))}
              {isLoading && <AIChatMessage isLoading />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input - Always visible */}
      <div 
        className="sticky bottom-0 w-full backdrop-blur-[10px] z-10"
        style={{ 
          backgroundColor: `${colors['bg-primary']}1A`,
          borderTop: `1px solid ${colors['border-primary']}`
        }}
      >
        <div className="w-full p-2">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div 
              className="flex-1 flex items-center gap-2 min-w-0 rounded-lg p-2"
              style={{
                backgroundColor: colors['bg-secondary']
              }}
            >
              <ButtonNormal
                variant="secondary"
                iconOnly
                size="small"
                leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/at-sign.svg`}
                className="!bg-transparent hover:!bg-opacity-10 flex-shrink-0"
              />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
                placeholder="Build a conditional path for..."
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm font-normal leading-[1.5] placeholder:text-[#85888E]"
                style={{ 
                  fontFamily: 'Inter',
                  color: colors['text-primary']
                }}
              />
              <ButtonNormal
                variant="secondary"
                iconOnly
                size="small"
                leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/paperclip.svg`}
                className="!bg-transparent hover:!bg-opacity-10 flex-shrink-0"
              />
            </div>
            <ButtonNormal
              type="submit"
              variant="primary"
              size="small"
              className="!bg-opacity-60 !border !border-[rgba(255,255,255,0.12)]  !font-medium !leading-none   !gap-0.5 transition-all duration-200 hover:!bg-opacity-80 whitespace-nowrap sm:self-stretch sm:flex sm:items-center"
              disabled={!input.trim() || isLoading}
            >
              Send
            </ButtonNormal>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
