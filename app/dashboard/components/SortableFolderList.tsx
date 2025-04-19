'use client';

import React, { useEffect, useState } from 'react';
import { 
  DndContext, 
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor, 
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { 
  SortableContext, 
  arrayMove, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Folder, Workspace } from '@/types/workspace';
import SortableFolderItem from './SortableFolderItem';
import { flattenFoldersWithDepth, FolderWithDepth, isDescendantOf } from './folderUtils';
import { useColors } from '@/app/theme/hooks';
import TabButton from '@/app/components/TabButton';
import { toast } from 'react-hot-toast';

interface SortableFolderListProps {
  activeWorkspace: Workspace;
  expandedFolders: Set<number>;
  onToggleFolder: (folderId: number) => void;
  activeTabId: string | null;
  onTabClick: (tabId: string | null, folder?: Folder) => void;
  onCreateSubfolder: (folder: Folder) => void;
  onEditFolder: (folder: Folder) => void;
  onDeleteFolder: (folder: Folder) => Promise<void>;
  onSelectFolder: (folder?: Folder) => void;
  isSettingsView: boolean;
  updateFolderPositions: (folderId: number, newParentId: number | null, newPosition: number, workspace?: Workspace) => Promise<boolean | void>;
}

export default function SortableFolderList({
  activeWorkspace,
  expandedFolders,
  onToggleFolder,
  activeTabId,
  onTabClick,
  onCreateSubfolder,
  onEditFolder,
  onDeleteFolder,
  onSelectFolder,
  isSettingsView,
  updateFolderPositions,
}: SortableFolderListProps) {
  // Create a flattened list of folders with depth information
  const [flattenedFolders, setFlattenedFolders] = useState<FolderWithDepth[]>([]);
  // Track the currently dragged folder
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<FolderWithDepth | null>(null);
  const [dropTarget, setDropTarget] = useState<{id: string, isParent: boolean, position?: string} | null>(null);
  
  const colors = useColors();

  // Add a timer state for delayed folder expansion
  const [expandTimer, setExpandTimer] = useState<NodeJS.Timeout | null>(null);

  // Add expandingFolderId state to track which folder is about to be expanded
  const [expandingFolderId, setExpandingFolderId] = useState<number | null>(null);

  // Create a flattened list when folders or expanded state changes
  useEffect(() => {
    const flattened = flattenFoldersWithDepth(
      activeWorkspace.folders,
      null, // Start with root folders
      0,    // Initial depth
      expandedFolders
    );
    setFlattenedFolders(flattened);
  }, [activeWorkspace.folders, expandedFolders]);

  // Cleanup expansion timer when component unmounts
  useEffect(() => {
    return () => {
      if (expandTimer) {
        clearTimeout(expandTimer);
      }
    };
  }, [expandTimer]);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Minimum distance before drag starts to prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Find a folder by its ID in the flattened list
  const findFolderById = (id: string): FolderWithDepth | undefined => {
    const numericId = parseInt(id.replace('folder-', ''));
    return flattenedFolders.find(folder => folder.id === numericId);
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveFolderId(active.id as string);
    
    const folder = findFolderById(active.id as string);
    if (folder) {
      setActiveFolder(folder);
    }
  };

  // Handle drag over to detect potential parent changes and auto-expand folders on hover
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      // Clear expansion timer when not over a valid target
      if (expandTimer) {
        clearTimeout(expandTimer);
        setExpandTimer(null);
      }
      setDropTarget(null);
      return;
    }

    const activeFolder = findFolderById(active.id as string);
    const overFolder = findFolderById(over.id as string);
    
    if (!activeFolder || !overFolder) {
      if (expandTimer) {
        clearTimeout(expandTimer);
        setExpandTimer(null);
      }
      setDropTarget(null);
      return;
    }

    // Prevent dropping a folder into its own descendant
    if (isDescendantOf(activeWorkspace.folders, activeFolder.id, overFolder.id)) {
      if (expandTimer) {
        clearTimeout(expandTimer);
        setExpandTimer(null);
      }
      setDropTarget(null);
      return;
    }

    // Check if target folder has subfolders
    const hasSubfolders = activeWorkspace.folders.some(f => f.parent_id === overFolder.id);
    
    // Update the auto-expand functionality to show a visual indicator
    if (hasSubfolders && !expandedFolders.has(overFolder.id)) {
      // Clear any existing timer
      if (expandTimer) {
        clearTimeout(expandTimer);
        setExpandTimer(null);
        setExpandingFolderId(null);
      }
      
      // Show the visual indicator that the folder is about to expand
      setExpandingFolderId(overFolder.id);
      
      // Set a new timer to expand the folder after a delay
      const timer = setTimeout(() => {
        onToggleFolder(overFolder.id);
        setExpandingFolderId(null);
      }, 500); // 500ms delay before expanding
      
      setExpandTimer(timer);
    } else if (expandingFolderId === overFolder.id && 
               (!hasSubfolders || expandedFolders.has(overFolder.id))) {
      // If we're no longer hovering over a folder that can be expanded,
      // clear the expanding state
      setExpandingFolderId(null);
      if (expandTimer) {
        clearTimeout(expandTimer);
        setExpandTimer(null);
      }
    }

    // Get pointer position relative to the over target
    const { x, y } = event.activatorEvent as PointerEvent;
    const overElement = document.querySelector(`[data-id="${over.id}"]`);
    
    if (overElement) {
      const rect = overElement.getBoundingClientRect();
      
      // Calculate relative X position within the element (0 to 1)
      const relativeX = (x - rect.left) / rect.width;
      // Adjust the threshold - if pointer is deeper within the element horizontally
      // and in the middle vertically, consider it as a child drop
      const isDeepInElement = relativeX > 0.3; // 30% from the left edge
      
      // For vertical position, split into thirds
      const upperThreshold = rect.height * 0.33;
      const lowerThreshold = rect.height * 0.66;
      const relativeY = y - rect.top;
      
      const isInUpperPart = relativeY < upperThreshold;
      const isInLowerPart = relativeY > lowerThreshold;
      const isInMiddlePart = !isInUpperPart && !isInLowerPart;

      // Remove previous indicators
      document.querySelectorAll('.drag-over-as-child, .drag-over-as-sibling-before, .drag-over-as-sibling-after').forEach(el => {
        el.classList.remove('drag-over-as-child', 'drag-over-as-sibling-before', 'drag-over-as-sibling-after');
      });

      // If pointer is deep enough into the element horizontally and in the middle vertically,
      // consider it a child drop
      if (isDeepInElement && isInMiddlePart) {
        setDropTarget({ id: over.id as string, isParent: true });
        overElement.classList.add('drag-over-as-child');
      } else {
        // Otherwise, treat as sibling before/after based on vertical position
        const isBeforeTarget = isInUpperPart;
        setDropTarget({ 
          id: over.id as string, 
          isParent: false,
          position: isBeforeTarget ? 'before' : 'after'
        });
        
        if (isBeforeTarget) {
          overElement.classList.add('drag-over-as-sibling-before');
        } else {
          overElement.classList.add('drag-over-as-sibling-after');
        }
      }
    }
  };

  // Handle drag end - make sure to clear any pending timers
  const handleDragEnd = async (event: DragEndEvent) => {
    // Clear any pending expansion timer
    if (expandTimer) {
      clearTimeout(expandTimer);
      setExpandTimer(null);
    }
    
    // Reset expanding folder state
    setExpandingFolderId(null);
    
    const { active, over } = event;
    setActiveFolderId(null);
    setActiveFolder(null);
    
    // Remove any visual indicators
    document.querySelectorAll('.drag-over-as-child, .drag-over-as-sibling-before, .drag-over-as-sibling-after').forEach(el => {
      el.classList.remove('drag-over-as-child', 'drag-over-as-sibling-before', 'drag-over-as-sibling-after');
    });
    
    // No drop target, abort
    if (!over) {
      setDropTarget(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    
    if (activeId === overId) {
      setDropTarget(null);
      return;
    }

    const activeFolder = findFolderById(activeId);
    const overFolder = findFolderById(overId);
    
    if (!activeFolder || !overFolder) {
      setDropTarget(null);
      return;
    }

    // Check if we are dropping as a child or as a sibling (and which position)
    const dropAsChild = dropTarget?.isParent && dropTarget.id === overId;
    const dropPosition = dropTarget?.position || 'after'; // Default to 'after' if not specified
    
    try {
      // Create a new version of the folders array to work with
      const updatedFolders = [...activeWorkspace.folders];
      const activeFolderIndex = updatedFolders.findIndex(f => f.id === activeFolder.id);
      const folderToMove = updatedFolders[activeFolderIndex];
      
      if (dropAsChild) {
        // Optimistically update the UI by changing the parent_id and position
        const oldParentId = folderToMove.parent_id;
        
        // Get existing children of the target folder to find the highest position
        const existingChildren = updatedFolders.filter(f => f.parent_id === overFolder.id);
        const highestPosition = existingChildren.length > 0 
          ? Math.max(...existingChildren.map(c => (c as Folder).position)) + 1
          : 0;
        
        // Update the folder's parent and position - place it at the end of children
        folderToMove.parent_id = overFolder.id;
        (folderToMove as Folder).position = highestPosition;
        
        // If the old parent had other children, update their positions
        if (oldParentId !== null) {
          const oldSiblings = updatedFolders
            .filter(f => f.parent_id === oldParentId && f.id !== folderToMove.id);
          
          // Reorder old siblings (decreasing position for items after the moved item)
          oldSiblings.forEach(f => {
            if ((f as Folder).position > (activeFolder as Folder).position) {
              (f as Folder).position -= 1;
            }
          });
        }
        
        // Ensure the parent folder is expanded
        if (!expandedFolders.has(overFolder.id)) {
          onToggleFolder(overFolder.id);
        }
      } else {
        // Get siblings of the target folder
        const oldParentId = folderToMove.parent_id;
        const newParentId = overFolder.parent_id;
        
        // Get the old position before changing it
        const oldPosition = (folderToMove as Folder).position;
        
        // Get siblings in the old parent
        const oldSiblings = updatedFolders
          .filter(f => f.parent_id === oldParentId && f.id !== folderToMove.id);
        
        // Reorder old siblings (decreasing position for items after the moved item)
        oldSiblings.forEach(f => {
          if ((f as Folder).position > oldPosition) {
            (f as Folder).position -= 1;
          }
        });
        
        // Update the moved folder's parent
        folderToMove.parent_id = newParentId;
        
        // Get siblings in the new parent (excluding the folder being moved)
        const newSiblings = updatedFolders
          .filter(f => f.parent_id === newParentId && f.id !== folderToMove.id);
        
        // Get the position of the target folder
        const overFolderPosition = (overFolder as Folder).position;
        
        // Calculate the new position based on whether we're dropping before or after
        let newPosition = overFolderPosition;
        if (dropPosition === 'after') {
          newPosition = overFolderPosition + 1;
          
          // Update positions of all siblings in the new parent
          // that are at or after the new position (make room for our folder)
          newSiblings.forEach(f => {
            if ((f as Folder).position >= newPosition) {
              (f as Folder).position += 1;
            }
          });
        } else { // 'before'
          // Update positions of all siblings in the new parent
          // that are at or after the new position (make room for our folder)
          newSiblings.forEach(f => {
            if ((f as Folder).position >= newPosition) {
              (f as Folder).position += 1;
            }
          });
        }
        
        // Set the new position for our moved folder
        (folderToMove as Folder).position = newPosition;
      }
      
      // Sort the folders array by position to ensure correct ordering
      updatedFolders.sort((a, b) => {
        // First sort by parent_id (null parents come first)
        if (a.parent_id === null && b.parent_id !== null) return -1;
        if (a.parent_id !== null && b.parent_id === null) return 1;
        if (a.parent_id !== b.parent_id) return (a.parent_id || 0) - (b.parent_id || 0);
        
        // Then sort by position
        return (a as Folder).position - (b as Folder).position;
      });
      
      // Create a new workspace object with the updated folders
      const updatedWorkspace = {
        ...activeWorkspace,
        folders: updatedFolders
      };
      
      // Manually trigger a UI update by rebuilding the flattened folders
      setFlattenedFolders(flattenFoldersWithDepth(
        updatedFolders,
        null,
        0,
        expandedFolders
      ));
      
      // Now make the actual API call with the optimistic workspace
      await updateFolderPositions(
        activeFolder.id,
        folderToMove.parent_id === undefined ? null : folderToMove.parent_id, // Ensure parent_id is number | null
        (folderToMove as Folder).position, // Use the actual calculated position
        updatedWorkspace
      );
      
      toast.success('Folder moved successfully');
    } catch (error) {
      console.error('Error moving folder:', error);
      toast.error('Failed to move folder');
      
      // Refresh from server in case of error to ensure UI is in sync
      setFlattenedFolders(flattenFoldersWithDepth(
        activeWorkspace.folders,
        null,
        0,
        expandedFolders
      ));
    }
    
    setDropTarget(null);
  };

  // Add a new handler for drag cancel events
  const handleDragCancel = () => {
    // Clear any pending expansion timer
    if (expandTimer) {
      clearTimeout(expandTimer);
      setExpandTimer(null);
    }
    
    // Reset expanding folder state
    setExpandingFolderId(null);
    
    setActiveFolderId(null);
    setActiveFolder(null);
    setDropTarget(null);
    
    // Clean up any visual indicators
    document.querySelectorAll('.drag-over-as-child, .drag-over-as-sibling-before, .drag-over-as-sibling-after').forEach(el => {
      el.classList.remove('drag-over-as-child', 'drag-over-as-sibling-before', 'drag-over-as-sibling-after');
    });
  };

  // Create sortable item IDs
  const items = flattenedFolders.map(folder => `folder-${folder.id}`);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className={`flex flex-col w-full ${activeFolderId ? 'dnd-active' : ''}`}>
          {flattenedFolders.map((folder) => {
            const folderId = `folder-${folder.id}`;
            const isActive = !isSettingsView && activeTabId === folderId;
            const subfolders = activeWorkspace.folders.filter(
              (f) => f.parent_id === folder.id
            );
            
            // Check if this folder is about to be expanded
            const isExpanding = expandingFolderId === folder.id;
            
            return (
              <div 
                key={folderId}
                style={{ 
                  marginLeft: `${folder.depth * 1}rem`,
                }}
                data-id={folderId}
                data-has-children={subfolders.length > 0 ? "true" : "false"}
                className={isExpanding ? 'folder-expanding' : ''}
              >
                <SortableFolderItem
                  id={folderId}
                  folder={folder}
                  depth={folder.depth}
                  isActive={isActive}
                  onClick={() => onTabClick(folderId, folder)}
                  onCreateSubfolder={onCreateSubfolder}
                  onEditFolder={onEditFolder}
                  onDeleteFolder={onDeleteFolder}
                  onSelectFolder={onSelectFolder}
                  hasSubfolders={subfolders.length > 0}
                  isExpanded={expandedFolders.has(folder.id)}
                  onToggleExpand={() => onToggleFolder(folder.id)}
                />
              </div>
            );
          })}
        </div>
      </SortableContext>

      {/* Drag overlay shows a preview of the dragged folder */}
      <DragOverlay>
        {activeFolder && (
          <div 
            className="opacity-80"
            style={{ 
              width: '90%',
              backgroundColor: colors['bg-secondary'],
              border: `1px solid ${colors['border-secondary']}`,
              borderRadius: '6px',
              padding: '6px',
            }}
          >
            <TabButton
              icon={activeFolder.emote ? '' : `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${activeFolder.icon_url}`}
              label={activeFolder.name}
              emote={activeFolder.emote}
              isActive={false}
              onClick={() => {}}
              isFolder={true}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
} 