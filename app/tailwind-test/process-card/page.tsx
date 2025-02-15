'use client';

import ProcessCard from '@/app/dashboard/components/ProcessCard';

export default function ProcessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Processes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProcessCard
          icon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
          title="Onboarding Process"
          description="A detailed process for onboarding new employees."
          tags={['Human Resources', 'Design']}
          steps={5}
          assignee="John Doe"
        />
        <ProcessCard
          icon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
          title="Engineering Workflow"
          description="Streamline engineering tasks with structured processes."
          tags={['Engineering', 'Marketing']}
          steps={7}
          assignee="Jane Smith"
        />
        <ProcessCard
          icon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/arrow-left.svg"
          title="Marketing Strategy"
          description="Crafting campaigns that drive results."
          tags={['Marketing', 'Creativity']}
          steps={4}
          assignee="Alex Johnson"
        />
      </div>
    </div>
  );
}
