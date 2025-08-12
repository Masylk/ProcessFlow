import React from 'react';

interface AIThinkingOrbProps {
  size?: number;
  isThinking?: boolean;
}

const AIThinkingOrb: React.FC<AIThinkingOrbProps> = ({ 
  size = 24, 
  isThinking = false
}) => {
  if (!isThinking) return null;
  
  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '600ms' }}></div>
      </div>
    </div>
  );
};

export default AIThinkingOrb;
