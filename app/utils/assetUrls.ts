const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const STORAGE_PATH = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH || '';

export const getAssetUrl = (path: string): string => {
  return `${SUPABASE_URL}${STORAGE_PATH}${path}`;
};

export const SHARED_ASSETS = {
  chevronDown: '/assets/shared_components/chevron-down.svg',
  chevronRight: '/assets/shared_components/chevron-right-black.svg',
  dotsHorizontal: '/assets/shared_components/dots-horizontal-black.svg',
  folderBase: '/assets/shared_components/folder-icon-base.svg',
  layers: '/assets/shared_components/layers-icon.svg',
  plus: '/assets/shared_components/plus-icon.svg',
  send: '/assets/shared_components/send-01.svg',
} as const; 