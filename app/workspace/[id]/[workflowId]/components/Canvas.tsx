import React, { useState, useEffect, useRef } from 'react';
import { Block } from '@/types/block';
import { Path as PathType } from '@/types/path';
import Path from './Path';
import BlockDetailsSidebar from './BlockDetailsSidebar';
import AddBlockForm from './AddBlockForm'; // Import AddBlockForm
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { CanvasEvent } from '../page';
import TransformStateTracker from './TransformStateTracker';
import { TransformState } from '@/types/transformstate';

interface CanvasProps {
  initialPath: PathType;
  workspaceId: string;
  workflowId: string;
  focusRect?: DOMRect | null;
  onCanvasEvent: (eventData: CanvasEvent) => void;
  onTransformChange: (state: TransformState) => void;
}

export default function Canvas({
  initialPath,
  workspaceId,
  workflowId,
  focusRect,
  onCanvasEvent,
  onTransformChange,
}: CanvasProps) {
  const [path, setPath] = useState<PathType | null>(initialPath);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [handleUpdateBlock, setHandleUpdateBlock] = useState<
    | ((
        updatedBlock: Block,
        imageFile?: File,
        iconFile?: File
      ) => Promise<void>)
    | null
  >(null);
  const [handleDeleteBlock, setHandleDeleteBlock] = useState<
    ((blockId: number) => Promise<void>) | null
  >(null);
  const [disableZoom, setDisableZoom] = useState(false); // State for zoom enabling/disabling
  const zoomRef = useRef<any>(null); // Ref to control zoom

  const [savedBlock, setSavedBlock] = useState<Block | null>(null);
  const [isAddBlockFormOpen, setIsAddBlockFormOpen] = useState(false);
  const [addBlockPathId, setAddBlockPathId] = useState<number>(0);
  const [addBlockPosition, setAddBlockPosition] = useState<number | null>(null);
  const [handlePathAddBlock, setHandlePathAddBlock] = useState<
    ((blockData: any, pathId: number, position: number) => Promise<void>) | null
  >(null);
  const [addBlockDefaultPathId, setAddBlockDefaultPathId] = useState<
    number | null
  >(null);
  const [addBlockDefaultPosition, setAddBlockDefaultPosition] = useState<
    number | null
  >(null);
  const [handleDefaultPathAddBlock, setHandleDefaultPathAddBlock] = useState<
    ((blockData: any, pathId: number, position: number) => Promise<void>) | null
  >(null);

  useEffect(() => {
    setPath(initialPath);
  }, [initialPath]);

  const copyBlockFn = (blockdata: Block) => {
    console.log('copying ', blockdata);
    setSavedBlock(blockdata);
    if (
      addBlockDefaultPathId !== null &&
      addBlockDefaultPosition !== null &&
      handleDefaultPathAddBlock
    ) {
      handleSetPath(
        addBlockDefaultPathId,
        addBlockDefaultPosition,
        handleDefaultPathAddBlock
      );
    } else {
      console.warn('Default path or position not set.');
    }
  };

  const handleBlockClick = (
    block: Block,
    updateBlockFn: (updatedBlock: Block) => Promise<void>,
    deleteBlockFn: (blockId: number) => Promise<void>
  ) => {
    setSelectedBlock(block);
    setHandleUpdateBlock(() => updateBlockFn);
    setHandleDeleteBlock(() => deleteBlockFn);
  };

  const handleCloseSidebar = () => {
    setSelectedBlock(null);
  };

  const handleDisableZoom = (disable: boolean) => {
    setDisableZoom(disable);
  };

  const handleOpenForm = (
    pathId: number,
    position: number,
    addBlockFn: (
      blockData: any,
      pathId: number,
      position: number
    ) => Promise<void>
  ) => {
    setIsAddBlockFormOpen(true);
    handleSetPath(pathId, position, addBlockFn);
  };

  const handleSetPath = (
    pathId: number,
    position: number,
    addBlockFn: (
      blockData: any,
      pathId: number,
      position: number
    ) => Promise<void>
  ) => {
    console.log('setting Path : ', pathId);
    setAddBlockPathId(pathId);
    setAddBlockPosition(position);
    setHandlePathAddBlock(() => addBlockFn);
  };

  const handleSetDefaultPath = (
    pathId: number,
    position: number,
    addBlockFn: (
      blockData: any,
      pathId: number,
      position: number
    ) => Promise<void>
  ) => {
    if (
      !addBlockDefaultPathId &&
      !addBlockDefaultPosition &&
      !handleDefaultPathAddBlock
    ) {
      console.log('setting Default Path : ', pathId);
      setAddBlockDefaultPathId(pathId);
      setAddBlockDefaultPosition(position);
      setHandleDefaultPathAddBlock(() => addBlockFn);
    }
  };

  const updateDefaultPosition = () => {
    if (addBlockDefaultPosition)
      setAddBlockDefaultPosition(addBlockDefaultPosition + 1);
  };

  const handleAddBlock = async (
    blockData: any,
    pathId: number,
    position: number
  ) => {
    setIsAddBlockFormOpen(false);
    if (handlePathAddBlock) {
      if (pathId === addBlockDefaultPathId) updateDefaultPosition();
      await handlePathAddBlock(blockData, pathId, position);
    }
    setAddBlockPosition(null);
  };

  useEffect(() => {
    const handlePasteShortcut = async (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'v') {
        try {
          if (savedBlock && addBlockPathId && addBlockPosition !== null) {
            // If there's a saved block, add it as usual
            console.log('Pasting block at:', addBlockPosition);
            await handleAddBlock(savedBlock, addBlockPathId, addBlockPosition);
          } else {
            console.warn(
              'No block saved or invalid path/position for adding the block.'
            );
          }

          // Check clipboard for an image
          const clipboardItems = await navigator.clipboard.read();
          for (const item of clipboardItems) {
            if (item.types.includes('image/png')) {
              const blob = await item.getType('image/png');
              console.log('Clipboard contains an image:', blob);

              // Prepare to upload the image
              const formData = new FormData();
              formData.append('file', blob, 'clipboard-image.png'); // Name the image as needed

              // Send the image to the upload route
              const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
              });

              if (response.ok) {
                const { url } = await response.json();
                console.log('Image uploaded successfully. URL:', url);

                // Define default values for the new block with the image URL
                const defaultBlockData = {
                  type: 'STEP', // Default block type, e.g., 'STEP'
                  position: addBlockPosition ?? 0, // Default to current or initial position
                  icon: '📷', // Default icon
                  description: 'New block with pasted image', // Default description
                  imageUrl: url, // Set the image URL from upload response
                };

                // Add the new block with the uploaded image URL
                if (addBlockPathId && addBlockPosition !== null) {
                  await handleAddBlock(
                    defaultBlockData,
                    addBlockPathId,
                    addBlockPosition
                  );
                } else {
                  console.warn(
                    'No default path or position set for adding the image block.'
                  );
                }
              } else {
                console.error('Image upload failed');
              }
            } else if (item.types.includes('text/plain')) {
              const text = await item.getType('text/plain');
              const textContent = await text.text();
              console.log('Clipboard contains text:', textContent);
            } else {
              console.log(
                'Clipboard contains unsupported data type:',
                item.types
              );
            }
          }
        } catch (error) {
          console.error('Failed to read clipboard content:', error);
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handlePasteShortcut);

    // Clean up event listener
    return () => {
      window.removeEventListener('keydown', handlePasteShortcut);
    };
  }, [savedBlock, addBlockPathId, addBlockPosition, handleAddBlock]);

  return (
    <div className="relative h-screen w-screen flex flex-col">
      <div className="flex-1 w-full h-full">
        {path ? (
          <div className="relative w-full h-full overflow-hidden">
            <TransformWrapper
              ref={zoomRef}
              initialScale={1}
              minScale={0.5}
              maxScale={4}
              wheel={{ step: 0.1 }}
              alignmentAnimation={{ disabled: true }}
              limitToBounds={false}
              disabled={disableZoom}
            >
              {({ zoomIn, zoomOut, resetTransform, setTransform }) => (
                <>
                  {/* Zoom controls */}
                  <div className="controls absolute top-4 right-4 z-20">
                    <button
                      onClick={() => zoomIn()}
                      className="px-4 py-2 mx-2 bg-gray-200 rounded"
                    >
                      Zoom In
                    </button>
                    <button
                      onClick={() => zoomOut()}
                      className="px-4 py-2 mx-2 bg-gray-200 rounded"
                    >
                      Zoom Out
                    </button>
                    <button
                      onClick={() => resetTransform()}
                      className="px-4 py-2 mx-2 bg-gray-200 rounded"
                    >
                      Reset Zoom
                    </button>
                  </div>

                  {/* Track Transform State */}
                  <TransformStateTracker
                    onTransformChange={onTransformChange}
                    setTransform={setTransform}
                    focusRect={focusRect}
                  />
                  <TransformComponent
                    wrapperStyle={{
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden',
                    }}
                    contentStyle={{
                      width: '100%',
                      height: '100%',
                      position: 'relative',
                    }}
                  >
                    <div className="relative w-full h-full">
                      {/* Background pattern */}
                      <div
                        className="absolute inset-0 -z-10"
                        style={{
                          width: '50009vw', // Background is much larger than the content area
                          height: '50000vh',
                          top: '-550vh', // Center it around the content
                          left: '-600vw',
                          backgroundImage:
                            "url('/assets/workflow/background_pattern.svg')",
                          backgroundSize: 'auto', // Prevent stretching of the image
                          backgroundRepeat: 'repeat', // Repeat the image seamlessly
                          backgroundPosition: 'center', // Keep the pattern centered
                        }}
                      ></div>

                      {/* Path component */}
                      <Path
                        pathId={path.id}
                        workspaceId={parseInt(workspaceId)}
                        workflowId={parseInt(workflowId)}
                        onBlockClick={handleBlockClick}
                        closeDetailSidebar={handleCloseSidebar}
                        handleAddBlock={handleOpenForm}
                        disableZoom={handleDisableZoom}
                        copyBlockFn={copyBlockFn}
                        setPathFn={handleSetPath}
                        setDefaultPathFn={handleSetDefaultPath}
                        onCanvasEvent={onCanvasEvent}
                      />
                    </div>
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      {selectedBlock && handleUpdateBlock && handleDeleteBlock && (
        <BlockDetailsSidebar
          block={selectedBlock}
          onClose={handleCloseSidebar}
          onUpdate={async (updatedBlock, imageFile?, iconFile?) => {
            await handleUpdateBlock(updatedBlock, imageFile, iconFile);
            handleCloseSidebar();
          }}
          onDelete={async (blockId) => {
            await handleDeleteBlock(blockId);
            handleCloseSidebar();
          }}
        />
      )}

      {isAddBlockFormOpen && addBlockPosition !== null && (
        <AddBlockForm
          onSubmit={async (blockData: any, pathId: number, position: number) =>
            await handleAddBlock(blockData, pathId, position)
          }
          onCancel={() => setIsAddBlockFormOpen(false)}
          initialPosition={addBlockPosition}
          workflowId={parseInt(workflowId)}
          pathId={addBlockPathId}
          position={addBlockPosition}
          savedBlock={savedBlock}
        />
      )}
    </div>
  );
}
