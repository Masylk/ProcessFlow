import React, { useEffect, useRef } from 'react';

interface AIThinkingOrbProps {
  size?: number;
  isThinking?: boolean;
}

const AIThinkingOrb: React.FC<AIThinkingOrbProps> = ({ 
  size = 64, 
  isThinking = false
}) => {
  const orbRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!orbRef.current || !isThinking) return;
    
    // Animation logic can be controlled here
    const glowAnimation = orbRef.current.querySelector('#innerGlow') as SVGElement;
    const particlesGroup = orbRef.current.querySelector('#particles') as SVGElement;
    
    if (glowAnimation && particlesGroup) {
      // Reset animations when thinking state changes
      glowAnimation.style.animation = 'none';
      particlesGroup.style.animation = 'none';
      
      // Trigger reflow
      void orbRef.current.offsetWidth;
      
      // Start animations
      glowAnimation.style.animation = 'pulse 2s infinite ease-in-out';
      particlesGroup.style.animation = 'rotate 8s infinite linear';
    }
  }, [isThinking]);
  
  if (!isThinking) return null;
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg 
        ref={orbRef}
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="orbGradient" cx="50%" cy="50%" r="50%" fx="25%" fy="25%">
            <stop offset="0%" stopColor="#4a8cff" />
            <stop offset="85%" stopColor="#0037da" />
            <stop offset="100%" stopColor="#0028d9" />
          </radialGradient>
          
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Main orb */}
        <circle cx="50" cy="50" r="40" fill="url(#orbGradient)" filter="url(#glow)" />
        
        {/* Inner glow that pulses */}
        <circle id="innerGlow" cx="50" cy="50" r="30" fill="rgba(100, 180, 255, 0.4)" filter="url(#innerGlow)" />
        
        {/* Highlight */}
        <ellipse cx="35" cy="35" rx="15" ry="15" fill="rgba(255, 255, 255, 0.2)" />
        
        {/* Particles */}
        <g id="particles">
          <circle cx="60" cy="25" r="1.5" fill="rgba(255, 255, 255, 0.8)" />
          <circle cx="75" cy="45" r="1" fill="rgba(255, 255, 255, 0.6)" />
          <circle cx="65" cy="70" r="1.2" fill="rgba(255, 255, 255, 0.7)" />
          <circle cx="35" cy="75" r="0.8" fill="rgba(255, 255, 255, 0.5)" />
          <circle cx="25" cy="45" r="1" fill="rgba(255, 255, 255, 0.6)" />
        </g>
      </svg>
      
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.6; transform: scale(0.85); }
          50% { opacity: 0.9; transform: scale(1); }
          100% { opacity: 0.6; transform: scale(0.85); }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AIThinkingOrb;
