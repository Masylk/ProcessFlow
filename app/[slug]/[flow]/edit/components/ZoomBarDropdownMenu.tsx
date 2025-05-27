import React, { useEffect, useRef } from 'react';
import { useReactFlow, useStore } from '@xyflow/react';
import { useColors, useThemeAssets } from '@/app/theme/hooks';

interface ZoomBarDropdownMenuProps {
  onClose: () => void;
  currentZoom: number;
}

const ZoomBarDropdownMenu: React.FC<ZoomBarDropdownMenuProps> = ({ onClose, currentZoom }) => {
  const { zoomTo, fitView } = useReactFlow();
  const reactFlowWrapper = useStore((state) => state.domNode);
  const colors = useColors();
  const themeAssets = useThemeAssets();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside or on the canvas
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    // Handle clicks on document
    document.addEventListener('mousedown', handleClickOutside);
    
    // Handle clicks specifically on the React Flow canvas
    const flowCanvas = reactFlowWrapper?.querySelector('.react-flow__pane');
    if (flowCanvas) {
      flowCanvas.addEventListener('mousedown', onClose);
    }
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (flowCanvas) {
        flowCanvas.removeEventListener('mousedown', onClose);
      }
    };
  }, [onClose, reactFlowWrapper]);
  
  const zoomOptions = [
    { label: 'Zoom to fit', value: 'fit' },
    { label: 'Zoom to 50%', value: '50' },
    { label: 'Zoom to 100%', value: '100' },
    { label: 'Zoom to 200%', value: '200' }
  ];

  // Supabase image URLs
  const zoomFitIcon = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/maximize-02.svg`;
  const zoomOutIcon = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/zoom-out.svg`;
  const zoomInIcon = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/zoom-in.svg`;
  const searchIcon = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/search-icon.svg`;

  const handleZoomSelect = (option: { label: string; value: string }) => {
    if (option.value === 'fit') {
      fitView({ duration: 200 });
    } else {
      const zoomLevel = parseInt(option.value) / 100;
      zoomTo(zoomLevel, { duration: 200 });
    }
    onClose();
  };

  const isActive = (value: string) => {
    return (value === 'fit' && currentZoom === 0) || 
           (value !== 'fit' && Math.round(currentZoom * 100) === parseInt(value));
  };

  const getIconForOption = (option: { value: string }) => {
    if (option.value === 'fit') return zoomFitIcon;
    if (option.value === '100') return searchIcon;
    if (option.value === '200') return zoomInIcon;
    return zoomOutIcon;
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-12 right-0 w-48 rounded-lg shadow-lg border z-[9999] overflow-hidden animate-in zoom-in-95 slide-in-from-top-2 fade-in-0 duration-200"
      style={{
        backgroundColor: colors['bg-primary'],
        borderColor: colors['border-primary'],
        boxShadow: '0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)'
      }}
    >
      <div className="py-1">
        {zoomOptions.map((option) => {
          const active = isActive(option.value);
          
          // Define dynamic styles
          const bgColor = active ? colors['bg-accent-subtle'] : 'transparent';
          const textColor = active ? colors['text-accent'] : colors['text-primary'];
          const hoverBgColor = colors['bg-quaternary'];
          
          return (
            <div key={option.value} className="px-1.5 py-px">
              <div 
                onClick={() => handleZoomSelect(option)}
                className="w-full text-left px-2.5 py-2 rounded-md flex items-center gap-2 cursor-pointer transition-colors duration-300"
                style={{
                  backgroundColor: bgColor,
                  color: textColor
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = hoverBgColor;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = bgColor;
                }}
              >
                <div className="w-4 h-4 relative overflow-hidden">
                  <img
                    src={getIconForOption(option)}
                    alt={option.label}
                    className="w-4 h-4"
                    style={{
                      filter: active ? 'none' : 'opacity(0.75)'
                    }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {option.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ZoomBarDropdownMenu; 