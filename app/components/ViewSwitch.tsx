'use client';

import { useState } from 'react';
import ButtonNormal from './ButtonNormal';

interface ViewSwitchProps {
  onViewChange: (view: 'grid' | 'table') => void;
  currentView: 'grid' | 'table';
}

export default function ViewSwitch({ onViewChange, currentView }: ViewSwitchProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      <ButtonNormal
        onClick={() => onViewChange('grid')}
        variant={currentView === 'grid' ? 'secondary' : 'tertiary'}
        size="small"
        iconOnly
        leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/grid.svg`}
      />
      <ButtonNormal
        onClick={() => onViewChange('table')}
        variant={currentView === 'table' ? 'secondary' : 'tertiary'}
        size="small"
        iconOnly
        leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/list.svg`}
      />
    </div>
  );
} 