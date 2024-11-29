import React, { useState, useEffect, useRef } from 'react';
import { Block, BlockType } from '@/types/block';
import ImageUploader from './ImageUploader';
import IconUploader from './IconUploader';
import TextEditor from './TextEditor';

interface BlockDetailsSidebarProps {
  block: Block | null;
  onClose: () => void;
  onUpdate: (updatedBlock: Block, imageFile?: File, iconFile?: File) => void;
  onDelete: (blockId: number) => void;
}

export default function BlockDetailsSidebar({
  block,
  onClose,
  onUpdate,
  onDelete,
}: BlockDetailsSidebarProps) {
  const [newType, setNewType] = useState<Block['type']>(
    block?.type || BlockType.STEP
  );
  const [newDescription, setNewDescription] = useState(
    block?.description || ''
  );
  const [newImageDescription, setNewImageDescription] = useState<string>(
    block?.imageDescription || ''
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null); // Track the icon file
  const [clickPosition, setClickPosition] = useState<{
    x: number;
    y: number;
  } | null>(block?.clickPosition || null);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (block) {
      setNewType(block.type);
      setNewDescription(block.description || '');
      setNewImageDescription(block.imageDescription || '');
      setClickPosition(block?.clickPosition || null);
    }
  }, [block]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'Escape' &&
        document.activeElement !== textareaRef.current
      ) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        sidebarRef.current &&
        imageRef.current &&
        textareaRef.current &&
        !sidebarRef.current.contains(e.target as Node) &&
        !imageRef.current.contains(e.target as Node) &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = (e.target as HTMLImageElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setClickPosition({ x, y });
  };

  const handleUpdate = () => {
    if (block) {
      const updatedBlock: Block = {
        ...block,
        type: newType as Block['type'],
        description: newDescription,
        imageDescription: newImageDescription,
        clickPosition,
      };
      onUpdate(updatedBlock, imageFile || undefined, iconFile || undefined);
      onClose();
    }
  };

  const handleDelete = () => {
    if (block) {
      onDelete(block.id);
      onClose();
    }
  };

  return (
    <div className="overflow-hidden absolute top-[-3vh] right-6 h-[94vh] w-[540px] bg-white shadow-lg p-6 border-l border-[#e4e7ec] z-40 flex flex-col">
      <button
        onClick={onClose}
        className="absolute top-4 left-6 h-7 w-7 p-1 bg-white rounded-lg shadow shadow-inner border border-[#d0d5dd] inline-flex items-center justify-center gap-2"
      >
        <img
          src="/assets/shared_components/close-drawer.svg"
          alt="Close"
          className="w-4 h-4"
        />
      </button>

      <div className="flex items-center mt-8 mb-4 space-x-4">
        <div className="p-2 bg-white rounded-lg shadow-inner border border-[#d0d5dd] flex justify-center items-center w-10 h-10">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex justify-center items-center">
            <span className="text-gray-500 font-bold text-sm">i</span>
          </div>
        </div>
        {block && (
          <h1 className="text-lg font-semibold text-gray-800">
            {`${block.position + 1}. ${block.title || 'Untitled Block'}`}
          </h1>
        )}
      </div>

      {block && (
        <>
          {/* Information Section */}
          <div className="border-t border-b border-[#e4e7ec] my-6 py-4">
            <div className="h-36 justify-start items-start gap-6 inline-flex">
              <div className="self-stretch flex-col justify-between items-start inline-flex">
                <div className="text-[#344054] text-sm font-normal font-['Inter'] leading-tight">
                  Assignee
                </div>
                <div className="text-[#344054] text-sm font-normal font-['Inter'] leading-tight">
                  Last Modified
                </div>
                <div className="text-[#344054] text-sm font-normal font-['Inter'] leading-tight">
                  Average time
                </div>
                <div className="text-[#344054] text-sm font-normal font-['Inter'] leading-tight">
                  Type
                </div>
              </div>
              <div className="h-36 flex-col justify-between items-start inline-flex">
                <div className="h-[18px] justify-start items-center gap-2 inline-flex">
                  <div className="px-1.5 py-0.5 bg-[#eef3ff] rounded-md border-[#c6d7fe] justify-start items-center flex">
                    <div className="text-center text-[#3537cc] text-xs font-medium font-['Inter'] leading-[18px]">
                      Human Resources
                    </div>
                  </div>
                </div>
                <div className="justify-start items-center gap-2 inline-flex">
                  <div className="text-center text-[#667085] text-xs font-normal font-['Inter'] leading-[18px]">
                    17/08/2024
                  </div>
                </div>
                <div className="justify-start items-center gap-2 inline-flex">
                  <div className="text-center text-[#667085] text-xs font-normal font-['Inter'] leading-[18px]">
                    10min
                  </div>
                </div>
                <div className="justify-start items-center gap-2 inline-flex">
                  <div className="text-center text-[#667085] text-xs font-normal font-['Inter'] leading-[18px]">
                    Manual
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Editor Section */}
          <TextEditor value={newDescription} onChange={setNewDescription} />

          {/* Media Section */}
          <div className="flex flex-col justify-end mt-auto h-[293px]">
            <div className="justify-start items-center gap-0.5 mb-4">
              <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                Media
              </div>
            </div>
            <img
              ref={imageRef}
              className="self-stretch h-[267px] px-6 py-4 rounded-xl border border-[#e4e7ec]"
              src={block.image || 'https://via.placeholder.com/492x267'}
              alt="Block Media"
              onClick={handleImageClick}
            />
          </div>
        </>
      )}
    </div>
  );
}
