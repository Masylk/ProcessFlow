import React, { useState, useEffect, useRef } from 'react';
import { Block, BlockType, FormType } from '@/types/block';
import { Path as PathType } from '@/types/path';
import Path from './Path';
import BlockDetailsSidebar from './BlockDetailsSidebar';
import AddBlockForm from './AddBlockForm'; // Import AddBlockForm
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import TransformStateTracker from './TransformStateTracker';
import { TransformState } from '@/types/transformstate';
import ZoomBar from './ZoomBar';
import { CanvasEvent } from '@/types/canvasevent';
import { PathObject } from '@/types/sidebar';
import { SidebarEvent } from '@/types/sidebarevent';
import Sidebar from './Sidebar';
import DelayForm from './DelayForm';

interface CanvasProps {
  initialPath: PathType;
  workspaceId: string;
  workflow_id: string;
  focusId?: string | null;
  onCanvasEvent: (eventData: CanvasEvent) => void;
  onTransformChange: (state: TransformState) => void;
  sidebarPath: PathObject | null;
  onSidebarEvent: (eventData: SidebarEvent) => void;
}

export default function Canvas({
  initialPath,
  workspaceId,
  workflow_id,
  focusId,
  onCanvasEvent,
  onTransformChange,
  sidebarPath,
  onSidebarEvent,
}: CanvasProps) {
  const [path, setPath] = useState<PathType | null>(initialPath);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [handleUpdateBlock, setHandleUpdateBlock] = useState<
    | ((
        updatedBlock: Block,
        imageFile?: File,
        iconFile?: File,
        delay?: number
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
  const [addBlockpath_id, setAddBlockpath_id] = useState<number>(0);
  const [addBlockPosition, setAddBlockPosition] = useState<number | null>(null);
  const [handlePathAddBlock, setHandlePathAddBlock] = useState<
    | ((
        blockData: any,
        path_id: number,
        position: number
      ) => Promise<Block | null>)
    | null
  >(null);
  const [addBlockDefaultpath_id, setAddBlockDefaultpath_id] = useState<
    number | null
  >(null);
  const [addBlockDefaultPosition, setAddBlockDefaultPosition] = useState<
    number | null
  >(null);
  const [handleDefaultPathAddBlock, setHandleDefaultPathAddBlock] = useState<
    | ((
        blockData: any,
        path_id: number,
        position: number
      ) => Promise<Block | null>)
    | null
  >(null);
  const [addBlockChosenType, setAddBlockChosenType] =
    useState<BlockType | null>(null);
  const [formType, setFormType] = useState<FormType | null>(null);
  const [formDefaultValues, setFormDefaultValues] = useState<Block | null>(
    null
  );
  const [backgroundPatternUrl] = useState<string>(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/workflow/background_pattern.svg`
  );
  useEffect(() => {
    setPath(initialPath);
  }, [initialPath]);

  const copyBlockFn = (blockdata: Block) => {
    console.log('copying ', blockdata);
    setSavedBlock(blockdata);
    if (
      addBlockDefaultpath_id !== null &&
      addBlockDefaultPosition !== null &&
      handleDefaultPathAddBlock
    ) {
      handleSetPath(
        addBlockDefaultpath_id,
        addBlockDefaultPosition,
        handleDefaultPathAddBlock
      );
    } else {
      console.warn('Default path or position not set.');
    }
  };

  const handleBlockClick = (
    block: Block,
    updateBlockFn: (
      updatedBlock: Block,
      imageFile?: File,
      iconFile?: File,
      delay?: number
    ) => Promise<void>,
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
    path_id: number,
    position: number,
    addBlockFn: (
      blockData: any,
      path_id: number,
      position: number
    ) => Promise<Block | null>,
    chosenType?: BlockType,
    form_type?: FormType,
    default_values?: Block
  ) => {
    setIsAddBlockFormOpen(true);
    if (chosenType) setAddBlockChosenType(chosenType);
    if (form_type) setFormType(form_type);
    if (default_values) setFormDefaultValues(default_values);
    handleSetPath(path_id, position, addBlockFn);
  };

  const handleSetPath = (
    path_id: number,
    position: number,
    addBlockFn: (
      blockData: any,
      path_id: number,
      position: number
    ) => Promise<Block | null>
  ) => {
    console.log('setting Path : ', path_id);
    setAddBlockpath_id(path_id);
    setAddBlockPosition(position);
    setHandlePathAddBlock(() => addBlockFn);
  };

  const handleSetDefaultPath = (
    path_id: number,
    position: number,
    addBlockFn: (
      blockData: any,
      path_id: number,
      position: number
    ) => Promise<Block | null>
  ) => {
    if (
      !addBlockDefaultpath_id &&
      !addBlockDefaultPosition &&
      !handleDefaultPathAddBlock
    ) {
      console.log('setting Default Path : ', path_id);
      setAddBlockDefaultpath_id(path_id);
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
    path_id: number,
    position: number
  ) => {
    setIsAddBlockFormOpen(false);
    if (handlePathAddBlock) {
      if (path_id === addBlockDefaultpath_id) updateDefaultPosition();
      await handlePathAddBlock(blockData, path_id, position);
    }
    setAddBlockPosition(null);
  };

  useEffect(() => {
    const handlePasteShortcut = async (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'v') {
        try {
          if (savedBlock && addBlockpath_id && addBlockPosition !== null) {
            // If there's a saved block, add it as usual
            console.log('Pasting block at:', addBlockPosition);
            await handleAddBlock(savedBlock, addBlockpath_id, addBlockPosition);
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
                if (addBlockpath_id && addBlockPosition !== null) {
                  await handleAddBlock(
                    defaultBlockData,
                    addBlockpath_id,
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
  }, [savedBlock, addBlockpath_id, addBlockPosition, handleAddBlock]);

  return (
    <div className="relative h-screen w-screen z-1 flex flex-col">
      <div className="flex-1 w-full h-full">
        {path ? (
          <div className="relative w-full h-full overflow-visible">
            <TransformWrapper
              ref={zoomRef}
              initialScale={1}
              minScale={0.1}
              maxScale={4}
              doubleClick={{ disabled: true }}
              wheel={{ step: 0.1 }}
              alignmentAnimation={{ disabled: true }}
              limitToBounds={false}
              disabled={disableZoom || selectedBlock !== null}
              // centerOnInit={true}
              // TODO : Bounds do not work
              // minPositionX={-10000000} // Set the minimum horizontal pan limit
              // minPositionY={-10000000} // Set the maximum vertical pan limit
              // maxPositionX={500000000} // Set the maximum horizontal pan limit
              // maxPositionY={500000000} // Set the maximum vertical pan limit
            >
              {({
                zoomIn,
                zoomOut,
                resetTransform,
                setTransform,
                zoomToElement,
              }) => (
                <>
                  {/* Wrapper div to ensure correct positioning */}
                  <div className="relative w-full h-full">
                    {/* ZoomBar positioned slightly to the left from the right edge */}
                    <div className="absolute right-10 top-2 p-4 z-20">
                      <ZoomBar
                        zoomIn={zoomIn}
                        zoomOut={zoomOut}
                        setTransform={setTransform}
                        isBackground={
                          isAddBlockFormOpen || selectedBlock !== null
                        }
                      />
                    </div>

                    {/* Sidebar */}
                    <div className="absolute left-[-25px]">
                      <Sidebar
                        sidebarPath={sidebarPath}
                        workspaceId={workspaceId}
                        workflow_id={workflow_id}
                        onSidebarEvent={onSidebarEvent}
                        isBackground={
                          isAddBlockFormOpen || selectedBlock !== null
                        }
                      />
                    </div>
                    {/* Track Transform State */}
                    <TransformStateTracker
                      onTransformChange={onTransformChange}
                      zoomToElement={zoomToElement}
                      focusId={focusId}
                      selectedBlock={selectedBlock}
                    />

                    {/* Content and Background */}
                    <TransformComponent
                      wrapperStyle={{
                        width: '100%',
                        height: '100%',
                        overflow: 'visible',
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
                          className="absolute inset-0 z-[-90]"
                          style={{
                            width: '50000vw', // Background is much larger than the content area
                            height: '50000vh',
                            top: '-20000vh', // Center it around the content
                            left: '-20000vw',
                            backgroundImage: `url(${backgroundPatternUrl})`, // Use the fetched URL
                            backgroundSize: 'auto', // Prevent stretching of the image
                            backgroundRepeat: 'repeat', // Repeat the image seamlessly
                            backgroundPosition: 'center', // Keep the pattern centered
                          }}
                        ></div>

                        {/* Path component */}
                        <Path
                          firstPath={true}
                          path_id={path.id}
                          workspaceId={parseInt(workspaceId)}
                          workflow_id={parseInt(workflow_id)}
                          selectedBlock={selectedBlock}
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
                  </div>
                </>
              )}
            </TransformWrapper>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      {selectedBlock &&
        selectedBlock.type === BlockType.STEP &&
        handleUpdateBlock &&
        handleDeleteBlock && (
          <>
            <BlockDetailsSidebar
              block={selectedBlock}
              onClose={handleCloseSidebar}
              onUpdate={async (updatedBlock, imageFile?, iconFile?) => {
                await handleUpdateBlock(updatedBlock, imageFile, iconFile);
                // handleCloseSidebar();
              }}
              onDelete={async (blockId) => {
                await handleDeleteBlock(blockId);
                handleCloseSidebar();
              }}
            />
          </>
        )}

      {selectedBlock &&
        selectedBlock.type === BlockType.DELAY &&
        handleUpdateBlock && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <DelayForm
              onSubmit={async (blockdata) => {
                await handleUpdateBlock(
                  selectedBlock,
                  undefined,
                  undefined,
                  blockdata.delay
                );
                setSelectedBlock(null);
              }}
              onCancel={() => {
                setSelectedBlock(null);
              }}
              update_mode={true}
            />
          </div>
        )}

      {isAddBlockFormOpen &&
        addBlockChosenType &&
        addBlockPosition !== null && (
          <AddBlockForm
            onSubmit={async (
              blockData: any,
              path_id: number,
              position: number
            ) => await handleAddBlock(blockData, path_id, position)}
            onCancel={() => {
              setIsAddBlockFormOpen(false);
              setAddBlockChosenType(null);
            }}
            initialPosition={addBlockPosition}
            workflow_id={parseInt(workflow_id)}
            path_id={addBlockpath_id}
            position={addBlockPosition}
            savedBlock={savedBlock}
            chosenType={addBlockChosenType}
          />
        )}
    </div>
  );
}
