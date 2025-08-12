import { Folder } from '@/types/workspace';

export interface FolderWithDepth extends Folder {
  depth: number;
}

/**
 * Flatten folders into an array with depth information
 */
export function flattenFoldersWithDepth(
  folders: Folder[],
  parentId: number | null = null,
  depth: number = 0,
  expandedFolders: Set<number>,
  result: FolderWithDepth[] = []
): FolderWithDepth[] {
  // Get folders at the current level
  const currentLevelFolders = folders
    .filter(folder => folder.parent_id === parentId)
    .sort((a, b) => a.position - b.position);

  // Add each folder to the result
  for (const folder of currentLevelFolders) {
    result.push({ ...folder, depth });
    
    // If the folder is expanded, recursively add its children
    if (expandedFolders.has(folder.id)) {
      flattenFoldersWithDepth(folders, folder.id, depth + 1, expandedFolders, result);
    }
  }

  return result;
}

/**
 * Find all descendant folder IDs of a given folder
 */
export function getAllDescendantIds(
  folders: Folder[],
  folderId: number,
  result: Set<number> = new Set()
): Set<number> {
  // Get direct children
  const children = folders.filter(folder => folder.parent_id === folderId);
  
  // Add each child and their descendants
  for (const child of children) {
    result.add(child.id);
    getAllDescendantIds(folders, child.id, result);
  }
  
  return result;
}

/**
 * Check if a folder is a descendant of another folder
 */
export function isDescendantOf(
  folders: Folder[],
  folderId: number,
  potentialAncestorId: number
): boolean {
  const descendants = getAllDescendantIds(folders, potentialAncestorId);
  return descendants.has(folderId);
} 