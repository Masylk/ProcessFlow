import React, { useState, useEffect } from 'react';
import { useColors } from '@/app/theme/hooks';
import Lottie from 'lottie-react';

interface AIChatMessageProps {
  message?: string;
  isLoading?: boolean;
  isLastMessage?: boolean;
}

const AIChatMessage: React.FC<AIChatMessageProps> = ({
  message = '',
  isLoading = false,
  isLastMessage = false
}) => {
  const colors = useColors();
  const [animationData, setAnimationData] = useState<any>(null);
  const [isAnimationLoading, setIsAnimationLoading] = useState(true);
  const [animationError, setAnimationError] = useState(false);
  
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
        setAnimationError(true);
      } finally {
        setIsAnimationLoading(false);
      }
    };
    
    fetchAnimation();
  }, []);

  const renderAvatar = () => {
    if (isAnimationLoading || animationError || !animationData) {
      return (
        <div 
          className="w-full h-full rounded-full animate-pulse"
          style={{ backgroundColor: colors['brand-primary'] }}
        />
      );
    }

    return (
      <Lottie
        animationData={animationData}
        loop={isLoading}
        autoplay={isLoading}
        style={{
          width: '100%',
          height: '100%',
        }}
        className="rounded-full overflow-hidden"
      />
    );
  };
  
  return (
    <div 
      className="flex items-start space-x-3 group animate-fadeIn"
      style={{ animationDelay: '0.1s' }}
    >
      {isLoading ? (
        <div className="flex items-center gap-2 animate-fadeIn">
          <div className="w-8 h-8 relative flex items-center justify-center rounded-full overflow-hidden">
            {renderAvatar()}
          </div>
          <span 
            className="text-xs"
            style={{ color: colors['text-secondary'] }}
          >
            Floz is thinking...
          </span>
        </div>
      ) : (
        <div 
          className="prose prose-sm p-3 max-w-[85%] transition-all duration-200"
          style={{ 
            color: colors['text-primary']
          }}
        >
          <p className="m-0 whitespace-pre-wrap break-words text-[13px] leading-[1.5]">{message}</p>
        </div>
      )}
    </div>
  );
};

export default AIChatMessage;

// Add to your global CSS or tailwind.config.js:
// @keyframes fadeIn {
//   from { opacity: 0; transform: translateY(10px); }
//   to { opacity: 1; transform: translateY(0); }
// }
// @keyframes slideIn {
//   from { opacity: 0; transform: translateX(-10px); }
//   to { opacity: 1; transform: translateX(0); }
// }
