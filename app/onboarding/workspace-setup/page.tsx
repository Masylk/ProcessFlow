"use client"

import { useState } from "react";
import ButtonNormal from '@/app/components/ButtonNormal';
import { useRouter } from 'next/navigation';

export default function WorkspaceSetup() {
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceURL, setWorkspaceURL] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/onboarding/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: 'WORKSPACE_SETUP',
          data: {
            workspace_name: workspaceName,
            workspace_url: workspaceURL,
            onboarding_step: 'COMPLETED'
          }
        })
      });

      if (response.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error updating workspace setup:', error);
    }
  };

  return (
    <div className="w-full h-screen bg-white flex justify-center items-center">
      {/* Utiliser le même JSX que votre composant existant mais avec le handleSubmit */}
    </div>
  );
} 