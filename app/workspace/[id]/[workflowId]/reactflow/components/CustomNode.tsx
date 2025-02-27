import React, { useEffect, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '../types';

function CustomNode({ id, data, selected }: NodeProps & { data: NodeData }) {
  const [isHighlighted, setIsHighlighted] = useState(false);
  
  // Handle highlight effect
  useEffect(() => {
    if (data.highlighted) {
      setIsHighlighted(true);
      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [data.highlighted]);

  return (
    <>
      <div
        className={`transition-all duration-300 ${isHighlighted ? 'scale-105' : ''}`}
        style={{
          width: '481px',
          padding: '20px 24px',
          borderRadius: '16px',
          border: isHighlighted 
            ? '2px solid #3b82f6' 
            : selected 
              ? '2px solid #6366f1' 
              : '2px solid #e5e7eb',
          background: isHighlighted ? '#f0f9ff' : 'white',
          boxShadow: isHighlighted 
            ? '0 0 15px rgba(59, 130, 246, 0.5)' 
            : selected 
              ? '0 0 10px rgba(99, 102, 241, 0.3)' 
              : 'none',
          minHeight: '120px',
          position: 'relative',
        }}
      >
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          style={{
            width: 10,
            height: 10,
            background: '#b1b1b7',
            border: '2px solid white',
            opacity: 1,
          }}
        />
        <div className="flex justify-between items-start mb-2">
          <div className="text-sm text-gray-500">Position: {data.position}</div>
          <button
            onClick={() => data.onDelete?.(id)}
            className="text-gray-400 hover:text-red-500"
          >
            ×
          </button>
        </div>
        <div className="text-gray-900">{data.label}</div>
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          style={{
            width: 10,
            height: 10,
            background: '#b1b1b7',
            border: '2px solid white',
            opacity: 1,
          }}
        />
      </div>
    </>
  );
}

export default CustomNode;
