import React from 'react';

interface StatusIndicatorProps {
  isSuccess: boolean | null;
}

export default function StatusIndicator({ isSuccess }: StatusIndicatorProps) {
  if (isSuccess === null) return null;

  const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
  const message = isSuccess ? 'Saved' : 'Disconnected';

  return (
    <div className={`${bgColor} text-white text-sm py-1 px-2 rounded`}>
      {message}
    </div>
  );
}