'use client';
import React from 'react';

export default function ProcessCompletedCard() {
  // Fonction pour copier le lien
  const handleCopyLink = () => {
    navigator.clipboard.writeText('http://votre-lien.com');
    alert('Lien copié !');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div
        className="w-[527px] h-[188px] px-6 py-5 bg-white rounded-2xl
                 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]
                 border border-[#d0d5dd]
                 flex-col justify-start items-start gap-3 
                 inline-flex overflow-hidden"
      >
        {/* Icône (check-circle) en haut à gauche */}
        <div
          className="w-8 h-8 p-2 bg-white rounded-md
                   shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]
                   border border-[#e4e7ec]
                   flex justify-center items-center
                   overflow-hidden"
        >
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-circle.svg`}
            alt="check-circle"
            className="w-8 h-8"
          />
        </div>

        {/* Titre */}
        <div className="justify-start items-center gap-2 inline-flex">
          <div className="h-6 justify-start items-center gap-4 flex">
            <div className="flex-col justify-start items-start gap-1 inline-flex">
              <div className="text-[#101828] text-base font-semibold font-['Inter'] leading-normal">
                Congratulations! Your process has been completed.
              </div>
            </div>
          </div>
        </div>

        {/* Sous-texte */}
        <div className="text-black text-sm font-normal font-['Inter'] leading-tight">
          Share it with your team members!
        </div>

        {/* Bouton Copy link */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="px-3 py-2 bg-[#4e6bd7] rounded-lg
                   shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]
                   border-2 border-white
                   flex justify-center items-center gap-1
                   overflow-hidden"
        >
          {/* Icône link-02 */}
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/link-02-white.svg`}
            alt="link-02-white"
            className="w-5 h-5 text-white"
          />
          <span className="text-white text-sm font-semibold font-['Inter'] leading-tight">
            Copy link
          </span>
        </button>
      </div>
    </div>
  );
}
