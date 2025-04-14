'use client';

import { useParams } from 'next/navigation';

export default function ShareTestPage() {
  const params = useParams();
  const shareUrl = `/workspace/${params.id}/${params.workflowId}/read/share`;

  return (
    <div className="w-full h-[200px]">
      <iframe
        src={shareUrl}
        className="w-full h-full border-0"
        title="Process Share View"
      />
    </div>
  );
}
