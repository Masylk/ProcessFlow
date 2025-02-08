"use client";

import React, { useState } from "react";

/**
 * Composant qui tronque le texte au-delà d'un certain nombre de caractères,
 * et affiche un bouton "Voir plus / Voir moins" pour dérouler ou replier.
 */
function DescriptionWithReadMore({ text, maxChars = 80 }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Vérifie si le texte dépasse la limite
  const isOverflowing = text.length > maxChars;

  // Affiche tout le texte si "Voir plus" a été cliqué ou si le texte ne dépasse pas maxChars
  const displayText = isExpanded || !isOverflowing
    ? text
    : text.slice(0, maxChars) + "...";

  return (
    <div className="whitespace-normal break-words">
      <p className="text-[#667085] text-sm font-normal font-['Inter'] leading-tight">
        {displayText}
      </p>

      {isOverflowing && (
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className= "text-[#4e6bd7] text-sm font-medium mt-1 underline"
        >
          {isExpanded ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  );
}

/**
 * Petit composant badge d'intégration (affiche un label, ex: "Gmail", "Confluence", etc.)
 */
function IntegrationBadge({ label }) {
  return (
    <div className="pl-1.5 pr-2 py-0.5 bg-gray-50 rounded-md border border-[#e4e7ec]
                    flex justify-start items-center gap-0.5">
      {/* Icône ou espace icône */}
      <div className="w-3 h-3 relative overflow-hidden" />
      {/* Label du badge */}
      <div className="text-center text-[#344054] text-xs font-medium font-['Inter'] leading-[18px]">
        {label}
      </div>
    </div>
  );
}

/**
 * Composant principal : carte "Employee Onboarding"
 */
export default function EmployeeOnboardingCard() {
  // Exemple de liste de badges :
  // (Tu peux remplacer ces valeurs par celles que tu récupères depuis ton API ou un autre state)
  const badgesData = [
    "Linear",
    "Gmail",
    "Confluence",
    "Asana",
    "Slack",
    "GitHub",
    "GitLab",
    "Notion",
    "Jira",
    "Pean",
    "Pillame"
  ];

  const MAX_BADGES = 7;
  // Badges affichés directement
  const displayedBadges = badgesData.slice(0, MAX_BADGES);
  // Badges qui dépassent le quota
  const extraBadges =
    badgesData.length > MAX_BADGES ? badgesData.slice(MAX_BADGES) : [];

  return (
    // Conteneur plein écran qui centre la carte verticalement/horizontalement
    <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
      {/* 
        La carte principale :
          - Pas de "h-56" => on laisse la hauteur s'adapter au contenu
          - w-[636px] (ou px-[29px], etc.) selon le design
      */}
      <div className="px-[29px] py-[27px] bg-white flex-col justify-start items-start inline-flex rounded shadow">
        
        <div className="self-stretch justify-start items-start gap-7 inline-flex">
          
          {/* Logo Google, centré dans son conteneur */}
          <div className="w-16 h-16 p-[5.33px] bg-white rounded-[18px] border-2 border-[#e4e7ec]
                          flex justify-center items-center overflow-hidden">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/google.svg`}
              alt="google"
              className="w-8 h-8"
            />
          </div>

          {/* Conteneur principal */}
          <div className="w-[636px] h-auto flex-col justify-start items-start inline-flex">

            {/* Titre */}
            <div className="text-[#101828] text-xl font-semibold font-['Inter'] leading-[30px]">
              Employee Onboarding
            </div>

            {/* Description tronquée avec bouton "voir plus" */}
            <DescriptionWithReadMore
              text={`This process guides new employees through each steps of ProcessFlow's onboarding.
Quand le texte est trop long, un bouton « Voir plus » permet de l'afficher entièrement sans élargir la carte sur les côtés, uniquement vers le bas. 
Cela peut être très pratique pour limiter l'encombrement de l'UI.`}
              maxChars={90}
            />

            {/* Badges (avec un espacement vertical de 24px) */}
            <div className="my-6 justify-start items-center gap-2 inline-flex">
              {/* Afficher les badges "standards" (limite MAX_BADGES) */}
              {displayedBadges.map((badgeLabel, index) => (
                <IntegrationBadge key={index} label={badgeLabel} />
              ))}

              {/* Si on dépasse 7 badges, affichage du badge +X au survol duquel apparaît la liste */}
              {extraBadges.length > 0 && (
                <div className="relative group">
                  {/* Badge +X */}
                  <IntegrationBadge label={`+${extraBadges.length}`} />
                  {/* Tooltip au survol */}
                  <div
                    className="absolute hidden group-hover:flex flex-col gap-1 
                               bg-white border border-gray-300 p-2 rounded shadow-lg
                               top-full left-0 mt-1 z-10"
                  >
                    {extraBadges.map((badgeLabel, idx) => (
                      <IntegrationBadge key={idx} label={badgeLabel} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Informations sur l'utilisateur, date, étapes, etc. */}
            <div className="flex justify-start items-center gap-2">
              {/* Nom de l'utilisateur */}
              <div className="pl-1 pr-1.5 py-0.5 bg-[#edf0fb] rounded-md border-[#aebbed]
                              flex justify-start items-center gap-1">
                <div className="w-4 h-4 rounded-full flex justify-center items-center overflow-hidden">
                  <div className="w-4 h-4 relative rounded-full border border-black/10" />
                </div>
                <div className="text-center text-[#374c99] text-xs font-medium font-['Inter'] leading-[18px]">
                  Pean Pillame
                </div>
              </div>

              {/* Séparation verticale, ajustement pour en faire une ligne verticale */}
              <div className="w-[1px] h-[15px] bg-[#d0d5dd] mx-2" />

              <div className="text-[#667085] text-sm font-normal font-['Inter'] leading-tight">
                Last update: 23/08/24
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
