'use client';

import { useState } from 'react';

export default function EditImageModal() {
  // Gérer l'état (ouvert/fermé) de la box "ALT"
  const [showAltBox, setShowAltBox] = useState(false);
  const [altText, setAltText] = useState('');
  const [showZoomIcons, setShowZoomIcons] = useState(false); // État pour gérer la visibilité des icônes de zoom
  const [showTrashIcons, setShowTrashIcons] = useState(false); // État pour gérer la visibilité des icônes de la corbeille

  const handleAltClick = () => {
    setShowAltBox(!showAltBox);
  };

  const handleSaveAlt = () => {
    console.log('ALT Text:', altText);
    setShowAltBox(false);
  };

  return (
    <div className="w-full h-screen p-8 flex flex-col justify-center items-center overflow-hidden">
      {/* L'arrière-plan avec un overlay */}
      <div className="w-full h-full flex justify-center items-center">
        <div
          className="absolute inset-0 bg-[#0c111d]/40"
          style={{ zIndex: -1, opacity: 0.7 }}
        />
      </div>

      {/* Conteneur principal */}
      <div className="w-[560px] bg-white rounded-xl shadow-lg flex flex-col justify-start items-center relative z-10">
        {/* En-tête */}
        <div className="w-full h-24 flex flex-col justify-start items-center">
          <div className="w-full px-6 pt-6 flex justify-start items-start gap-4">
            <div className="w-12 h-12 p-3 bg-white rounded-[10px] shadow border border-[#e4e7ec] flex justify-center items-center overflow-hidden">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/magic-wand-02.svg`}
                alt="Magic Wand"
                className="w-6 h-6"
              />
            </div>
            <div className="flex-grow flex flex-col justify-start items-start gap-1">
              <div className="w-full text-[#101828] text-lg font-semibold font-['Inter'] leading-7">
                Edit Image
              </div>
              <div className="w-full text-[#475467] text-sm font-normal font-['Inter'] leading-tight">
                Upload a 1600 x 480px image for best results.
              </div>
            </div>
          </div>
        </div>

        {/* Bloc pour l'image */}
        <div
          className="relative w-[512px] h-[312px] bg-gray-100 mt-5 flex justify-center items-center border-8 p-1 rounded-[8px] overflow-hidden"
          onMouseEnter={() => {
            setShowZoomIcons(true); // Afficher les icônes de zoom
            setShowTrashIcons(true); // Afficher les icônes de la corbeille
          }}
          onMouseLeave={() => {
            setShowZoomIcons(false); // Masquer les icônes de zoom
            setShowTrashIcons(false); // Masquer les icônes de la corbeille
          }}
        >
          <div className="p-6">
            <p className="text-gray-500">Image Placeholder</p>
          </div>

          {/* --- BLOC 1 : Trash + ALT (coin bas-gauche) --- */}
          {showTrashIcons && (
            <div className="absolute bottom-2 left-2 flex space-x-2">
              <div className="rounded-lg shadow border border-[#d0d5dd] flex justify-start items-start">
                {/* Icône de la corbeille avec tooltip */}
                <div className="relative group px-3 py-2 bg-white border-r border-[#d0d5dd] flex justify-center items-center gap-2 hover:cursor-pointer hover:bg-[#f9fafb] transition duration-300 rounded-tl-[8px] rounded-bl-[8px]">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-01-dark.svg`}
                    alt="Trashdark"
                    className="w-5 h-5"
                  />
                  {/* Tooltip pour la corbeille */}
                  <div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                                px-2 py-1 bg-black text-white text-xs rounded
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                transition-opacity duration-200 whitespace-nowrap shadow-md"
                  >
                    Delete
                    <div
                      className="absolute left-1/2 transform -translate-x-1/2 top-full
                                  w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent 
                                  border-t-4 border-t-black"
                    />
                  </div>
                </div>
                {/* Bouton ALT */}
                <div
                  className="relative group px-4 py-2 bg-white border-[#d0d5dd] flex justify-center items-center gap-2 hover:cursor-pointer hover:bg-[#f9fafb] transition duration-300 rounded-br-[8px] rounded-tr-[8px]"
                  onClick={handleAltClick}
                >
                  <div className="text-[#344054] text-sm font-semibold font-['Inter']">
                    ALT
                  </div>
                  {/* Tooltip pour ALT */}
                  <div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                                px-2 py-1 bg-black text-white text-xs rounded
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                transition-opacity duration-200 whitespace-nowrap shadow-md"
                  >
                    Alternative Text
                    <div
                      className="absolute left-1/2 transform -translate-x-1/2 top-full
                                  w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent 
                                  border-t-4 border-t-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Box ALT (apparait si showAltBox) */}
          {showAltBox && (
            <div
              className="absolute left-2 self-stretch bg-white border border-gray-200 rounded-lg shadow p-4 flex flex-col gap-2 items-align-center bottom-0 mb-14"
              style={{ zIndex: 999 }}
            >
              <label className="font-['Inter'] text-sm text-[#101828] font-semibold">
                Alternative Text
              </label>
              <input
                className="w-full p-2 border rounded text-black focus:ring-2 focus:border-[#4e6bd7] focus:border-2 font-['Inter'] focus:outline-none"
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the image"
              />
              <div className="font-['Inter'] flex justify-end gap-2 font-semibold">
                <button
                  className="px-2 py-1 bg-white text-gray-600 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] 
                                shadow-[inset_0px_-2px_0px_0px_rgba(16,24,40,0.05)] 
                                shadow-[inset_0px_0px_0px_1px_rgba(16,24,40,0.18)] 
                                hover:bg-[#f9fafb] transition duration-300 text-sm"
                  onClick={() => setShowAltBox(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-2 py-1 bg-[#4e6bd7] text-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] 
                                shadow-[inset_0px_-2px_0px_0px_rgba(16,24,40,0.05)] 
                                shadow-[inset_0px_0px_0px_1px rgba(16,24,40,0.18)] 
                                hover:bg-[#374c99] transition duration-300 text-sm"
                  onClick={handleSaveAlt}
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* --- BLOC 2 : Zoom (coin bas-droit) --- */}
          {showZoomIcons && ( // Afficher les icônes de zoom uniquement si showZoomIcons est vrai
            <div className="absolute bottom-2 right-2 flex space-x-2">
              <div className="rounded-lg shadow border border-[#d0d5dd] flex justify-start items-start">
                {/* Zoom OUT */}
                <div className="relative group px-3 py-2 bg-white border-r border-[#d0d5dd] flex justify-center items-center gap-2 hover:cursor-pointer hover:bg-[#f9fafb] transition duration-300 rounded-tl-[8px] rounded-bl-[8px]">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/zoom-out.svg`}
                    alt="Zoom out"
                    className="w-5 h-5"
                  />
                  {/* Tooltip */}
                  <div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                                px-2 py-1 bg-black text-white text-xs rounded
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                transition-opacity duration-200 whitespace-nowrap shadow-md"
                  >
                    Zoom Out
                    <div
                      className="absolute left-1/2 transform -translate-x-1/2 top-full
                                  w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent 
                                  border-t-4 border-t-black"
                    />
                  </div>
                </div>
                {/* Zoom IN */}
                <div className="relative group px-3 py-2 bg-white flex justify-center items-center gap-2 hover:cursor-pointer hover:bg-[#f9fafb] transition duration-300 rounded-br-[8px] rounded-tr-[8px]">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/zoom-in.svg`}
                    alt="Zoom in"
                    className="w-5 h-5"
                  />
                  {/* Tooltip */}
                  <div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                                px-2 py-1 bg-black text-white text-xs rounded
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                transition-opacity duration-200 whitespace-nowrap shadow-md"
                  >
                    Zoom In
                    <div
                      className="absolute left-1/2 transform -translate-x-1/2 top-full
                                  w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent 
                                  border-t-4 border-t-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* --- Nouveau groupe de boutons, à 20px en dessous de l'image --- */}
        <div className="mt-5 w-full flex justify-start px-6">
          <div className="h-9 justify-start items-center inline-flex">
            <div className="justify-start items-center gap-2 flex">
              {/* Icône 1 : crop-02 */}
              <div className="p-2 bg-white rounded-lg shadow border border-[#d0d5dd] relative group hover:cursor-pointer hover:bg-[#f9fafb] transition duration-300">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/crop-02.svg`}
                  alt="crop-02"
                  className="w-5 h-5"
                />
                {/* Tooltip */}
                <div
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                              px-2 py-1 bg-black text-white text-xs rounded
                              opacity-0 invisible group-hover:opacity-100 group-hover:visible
                              transition-opacity duration-200 whitespace-nowrap shadow-md"
                >
                  Crop
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 top-full
                                w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent 
                                border-t-4 border-t-black"
                  />
                </div>
              </div>

              {/* Icône 2 : arrow-narrow-up-right */}
              <div className="p-2 bg-white rounded-lg shadow border border-[#d0d5dd] relative group hover:cursor-pointer hover:bg-[#f9fafb] transition duration-300">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/arrow-narrow-up-right.svg`}
                  alt="arrow-narrow-up-right"
                  className="w-5 h-5"
                />
                {/* Tooltip */}
                <div
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                              px-2 py-1 bg-black text-white text-xs rounded
                              opacity-0 invisible group-hover:opacity-100 group-hover:visible
                              transition-opacity duration-200 whitespace-nowrap shadow-md"
                >
                  Arrow
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 top-full
                                w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent 
                                border-t-4 border-t-black"
                  />
                </div>
              </div>

              {/* Icône 3 : square */}
              <div className="p-2 bg-white rounded-lg shadow border border-[#d0d5dd] relative group hover:cursor-pointer hover:bg-[#f9fafb] transition duration-300">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/square.svg`}
                  alt="square"
                  className="w-5 h-5"
                />
                {/* Tooltip */}
                <div
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                              px-2 py-1 bg-black text-white text-xs rounded
                              opacity-0 invisible group-hover:opacity-100 group-hover:visible
                              transition-opacity duration-200 whitespace-nowrap shadow-md"
                >
                  Square
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 top-full
                                w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent 
                                border-t-4 border-t-black"
                  />
                </div>
              </div>

              {/* Icône 4 : circle */}
              <div className="p-2 bg-white rounded-lg shadow border border-[#d0d5dd] relative group hover:cursor-pointer hover:bg-[#f9fafb] transition duration-300">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/circle.svg`}
                  alt="circle"
                  className="w-5 h-5"
                />
                {/* Tooltip */}
                <div
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                              px-2 py-1 bg-black text-white text-xs rounded
                              opacity-0 invisible group-hover:opacity-100 group-hover:visible
                              transition-opacity duration-200 whitespace-nowrap shadow-md"
                >
                  Circle
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 top-full
                                w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent 
                                border-t-4 border-t-black"
                  />
                </div>
              </div>

              {/* Icône 5 : cursor-click-02 */}
              <div className="p-2 bg-white rounded-lg shadow border border-[#d0d5dd] relative group hover:cursor-pointer hover:bg-[#f9fafb] transition duration-300">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/cursor-click-02.svg`}
                  alt="cursor-click-02"
                  className="w-5 h-5"
                />
                {/* Tooltip */}
                <div
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                              px-2 py-1 bg-black text-white text-xs rounded
                              opacity-0 invisible group-hover:opacity-100 group-hover:visible
                              transition-opacity duration-200 whitespace-nowrap shadow-md"
                >
                  Cursor
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 top-full
                                w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent 
                                border-t-4 border-t-black"
                  />
                </div>
              </div>

              {/* Icône 6 : circle-cut */}
              <div className="p-2 bg-white rounded-lg shadow border border-[#d0d5dd] relative group hover:cursor-pointer hover:bg-[#f9fafb] transition duration-300">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/circle-cut.svg`}
                  alt="circle-cut"
                  className="w-5 h-5"
                />
                {/* Tooltip */}
                <div
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                              px-2 py-1 bg-black text-white text-xs rounded
                              opacity-0 invisible group-hover:opacity-100 group-hover:visible
                              transition-opacity duration-200 whitespace-nowrap shadow-md"
                >
                  Blur
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 top-full
                                w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent 
                                border-t-4 border-t-black"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full h-[25px] flex flex-col justify-end">
          <div className="h-[1px] bg-[#e4e7ec]" />
        </div>
        {/* Boutons d'action (bas) */}
        <div className="py-8 flex flex-col w-full">
          {/* Espace "25px" + pb-6 */}

          {/* Conteneur des boutons */}
          <div className="w-full px-6 flex justify-end items-center gap-3">
            <div className="grow shrink basis-0 h-11 flex justify-end items-center gap-3">
              {/* Bouton CANCEL */}
              <div
                className="px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] 
                              shadow-[inset_0px_-2px_0px_0px_rgba(16,24,40,0.05)] 
                              shadow-[inset_0px_0px_0px_1px_rgba(16,24,40,0.18)] 
                              border border-[#d0d5dd] justify-center items-center gap-1.5 flex overflow-hidden hover:cursor-pointer hover:bg-[#f9fafb] transition duration-300"
              >
                <div className="px-0.5 justify-center items-center flex">
                  <div className="text-[#344054] text-base font-semibold font-['Inter'] leading-normal">
                    Cancel
                  </div>
                </div>
              </div>

              {/* Bouton SAVE IMAGE */}
              <div
                className="px-4 py-2.5 bg-[#4e6bd7] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] 
                              shadow-[inset_0px_-2px_0px_0px_rgba(16,24,40,0.05)] 
                              shadow-[inset_0px_0px_0px_1px_rgba(16,24,40,0.18)] 
                              border-2 border-white justify-center items-center gap-1.5 flex overflow-hidden hover:cursor-pointer hover:bg-[#374c99] transition duration-300"
              >
                <div className="px-0.5 justify-center items-center flex">
                  <div className="text-white text-base font-semibold font-['Inter'] leading-normal">
                    Save image
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
