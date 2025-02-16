'use client';

import DynamicIcon from '../../../utils/DynamicIcon';

interface ProcessCardProps {
  icon: string; // URL for the SVG icon
  title: string;
  description: string;
  tags: string[];
  steps: number;
  assignee: string;
}

export default function ProcessCard({
  icon,
  title,
  description,
  tags,
  steps,
  assignee,
}: ProcessCardProps) {
  return (
    <div className="bg-white rounded-lg border border-lightMode-border-secondary p-4 hover:border-lightMode-border-primary transition-all ease-in-out hover:cursor-pointer">
      {/* Icon on top with gray background, centered */}
      <div className="flex mb-4">
        <div className="bg-gray-100 rounded-[6px] flex items-center justify-center w-10 h-10">
          <DynamicIcon url={icon || '/placeholder.svg'} size={20} color="currentColor" />
        </div>
      </div>

      {/* Title */}
      <h3 className="font-medium text-[#101828] text-lg mb-2">{title}</h3>

      {/* Description */}
      <p className="text-sm text-[#475467] mb-3">{description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`px-spacing-sm py-0.5 text-xs rounded-md
              ${tag === 'Human Resources' ? 'bg-[#eef4ff] text-[#3538cd]' : ''}
              ${tag === 'Engineering' ? 'bg-[#f2f4f7] text-[#344054]' : ''}
              ${tag === 'Marketing' ? 'bg-[#fdf2fa] text-[#c11574]' : ''}
              ${tag === 'Design' ? 'bg-[#fef6ee] text-[#b93815]' : ''}
            `}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Steps and Assignee */}
      <div className="flex items-center text-sm text-[#667085]">
        <span>{steps} Steps</span>
        <div className="w-1 h-1 rounded-full bg-[#d0d5dd] mx-2" />
        <span className="truncate">{assignee}</span>
      </div>
    </div>
  );
}
