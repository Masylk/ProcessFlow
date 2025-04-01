import React, { useState, useEffect } from 'react';
import AIThinkingOrb from '../ui/AIThinkingOrb';

interface AIChatMessageProps {
  message?: string;
  isLoading?: boolean;
}

const AIChatMessage: React.FC<AIChatMessageProps> = ({
  message = '',
  isLoading = false
}) => {
  const [displayMessage, setDisplayMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  
  // Simulate typing effect when message changes
  useEffect(() => {
    if (!message) {
      setDisplayMessage('');
      setIsTyping(false);
      return;
    }
    
    // Reset for new message
    if (!isLoading && message) {
      setDisplayMessage('');
      setCharIndex(0);
      setIsTyping(true);
      
      const typingInterval = setInterval(() => {
        setCharIndex(prev => {
          const nextIndex = prev + 1;
          if (nextIndex > message.length) {
            clearInterval(typingInterval);
            setIsTyping(false);
            return prev;
          }
          return nextIndex;
        });
        
        setDisplayMessage(message.substring(0, charIndex + 1));
      }, 20); // Adjust speed as needed
      
      return () => clearInterval(typingInterval);
    }
  }, [message, isLoading]);
  
  return (
    <div className="flex items-start space-x-3 p-4 rounded-lg bg-white shadow-sm max-w-3xl">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
        AI
      </div>
      
      <div className="flex-1 min-w-0">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <AIThinkingOrb size={36} isThinking={true} />
            <span className="text-sm text-gray-500">AI is thinking...</span>
          </div>
        ) : (
          <div className="prose prose-sm">
            <p className="m-0 text-gray-800">{displayMessage}</p>
            {isTyping && <span className="inline-block h-4 w-1.5 bg-blue-600 ml-0.5 animate-pulse"></span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatMessage;
