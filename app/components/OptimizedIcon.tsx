import React from 'react';

interface OptimizedIconProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  onError?: () => void;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  loading?: 'lazy' | 'eager';
}

/**
 * Optimized icon component with memoization to prevent unnecessary re-renders
 * Includes error handling and lazy loading support
 */
const OptimizedIcon: React.FC<OptimizedIconProps> = React.memo(({
  src,
  alt,
  className = "w-6 h-6 object-contain select-none pointer-events-none",
  width = 24,
  height = 24,
  onError,
  referrerPolicy = "strict-origin-when-cross-origin",
  loading = "lazy"
}) => {
  const [hasError, setHasError] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  const handleError = React.useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  const handleLoad = React.useCallback(() => {
    setIsLoaded(true);
  }, []);

  // Show placeholder while loading or if error occurred
  if (!src || hasError) {
    return (
      <div 
        className={`${className} bg-gray-100 rounded flex items-center justify-center`}
        style={{ width, height }}
      >
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className="text-gray-400"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21,15 16,10 5,21"/>
        </svg>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width, height }}>
      {/* Loading placeholder */}
      {!isLoaded && (
        <div 
          className={`absolute inset-0 ${className} bg-gray-100 rounded animate-pulse`}
        />
      )}
      
      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        width={width}
        height={height}
        onError={handleError}
        onLoad={handleLoad}
        referrerPolicy={referrerPolicy}
        loading={loading}
      />
    </div>
  );
});

OptimizedIcon.displayName = 'OptimizedIcon';

export default OptimizedIcon; 