import React, { useState, useEffect, useRef } from 'react';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import DOMPurify from 'dompurify';
import { Block } from '@/types/block';
import { useColors } from '@/app/theme/hooks';

interface SidebarBlockProps {
  block: Block;
  onNodeFocus: (nodeId: string) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  searchFilter: string;
}

const DragHandle = ({ dragHandleProps }: { dragHandleProps: any }) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const storagePath = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH || '';
  const dragIconUrl = `${supabaseUrl}${storagePath}/assets/shared_components/drag-icon.svg`;
  
  return (
    <div {...dragHandleProps} className="mr-2 cursor-grab">
      <img
        src={dragIconUrl}
        alt="Drag"
        className="w-4 h-4"
        onError={(e) => {
          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxsaW5lIHgxPSI4IiB5MT0iNiIgeDI9IjIxIiB5Mj0iNiI+PC9saW5lPjxsaW5lIHgxPSI4IiB5MT0iMTIiIHgyPSIyMSIgeTI9IjEyIj48L2xpbmU+PGxpbmUgeDE9IjgiIHkxPSIxOCIgeDI9IjIxIiB5Mj0iMTgiPjwvbGluZT48bGluZSB4MT0iMyIgeTE9IjYiIHgyPSIzLjAxIiB5Mj0iNiI+PC9saW5lPjxsaW5lIHgxPSIzIiB5MT0iMTIiIHgyPSIzLjAxIiB5Mj0iMTIiPjwvbGluZT48bGluZSB4MT0iMyIgeTE9IjE4IiB4Mj0iMy4wMSIgeTI9IjE4Ij48L2xpbmU+PC9zdmc+';
        }}
      />
    </div>
  );
};

const SidebarBlock: React.FC<SidebarBlockProps> = ({
  block,
  onNodeFocus,
  dragHandleProps,
  searchFilter,
}) => {
  const [isSubpathsVisible, setIsSubpathsVisible] = useState(true);
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [iconError, setIconError] = useState(false);
  const colors = useColors();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const storagePath = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH || '';
  const dragIconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/drag-icon.svg`;
  const delayClockIconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/workflow/delay-clock-icon.svg`;
  const chevronDownIconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/chevron-down.svg`;
  const chevronUpIconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/chevron-up.svg`;
  
  // Default icon as inline SVG to prevent 404s
  const defaultSvgIcon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3C/svg%3E`;
  
  useEffect(() => {
    if (block.icon) {
      // Reset error state when icon changes
      setIconError(false);
      
      // If icon starts with a slash, it's likely a local path
      if (block.icon.startsWith('/')) {
        setIconUrl(block.icon);
      } else {
        // Otherwise, construct the full path
        setIconUrl(`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}${block.icon}`);
      }
    }
  }, [block.icon, supabaseUrl, storagePath]);

  const handleClick = () => {
    // ReactFlow node ID format
    const nodeId = `block-${block.id}`;
    onNodeFocus(nodeId);
  };

  const toggleSubpathsVisibility = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsSubpathsVisible((prev) => !prev);
  };

  const handleImageError = () => {
    // Prevent infinite loop by tracking error state
    setIconError(true);
  };

  // Determine which icon to show
  const iconSrc = block.type === 'DELAY' 
    ? delayClockIconUrl 
    : iconError 
      ? defaultSvgIcon 
      : iconUrl || defaultSvgIcon;

  return (
    <div 
      className="flex items-center p-2 rounded-md cursor-pointer transition-colors"
      style={{ 
        backgroundColor: colors['bg-primary']
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = colors['bg-secondary'];
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = colors['bg-primary'];
      }}
    >
      {dragHandleProps && <DragHandle dragHandleProps={dragHandleProps} />}
      
      {/* Block Icon */}
      <div className="mr-2">
        <img
          src={iconSrc}
          alt={block.title || 'Block'}
          className="w-5 h-5"
          onError={handleImageError}
        />
      </div>
      
      {/* Block Title */}
      <div className="flex-1 truncate" onClick={handleClick}>
        <span style={{ color: colors['text-primary'] }}>
          {block.step_block?.stepDetails || block.title || `Block ${block.id}`}
        </span>
      </div>
      
      {/* Subpaths Toggle (if applicable) */}
      {block.children && block.children.length > 0 && (
        <button
          onClick={toggleSubpathsVisibility}
          className="ml-2 p-1 rounded"
          style={{ backgroundColor: 'transparent' }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = colors['bg-tertiary'];
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <img
            src={isSubpathsVisible ? chevronDownIconUrl : chevronUpIconUrl}
            alt={isSubpathsVisible ? "Collapse" : "Expand"}
            className="w-4 h-4"
            onError={handleImageError}
          />
        </button>
      )}
    </div>
  );
};

export default SidebarBlock; 