"use client"

import { useState } from "react";
import ButtonNormal from '@/app/components/ButtonNormal';
import { useRouter } from 'next/navigation';

export default function ProfessionalInfo() {
  const [industry, setIndustry] = useState("");
  const [role, setRole] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [source, setSource] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/onboarding/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: 'PROFESSIONAL_INFO',
          data: {
            industry,
            role,
            company_size: companySize,
            source,
            onboarding_step: 'WORKSPACE_SETUP'
          }
        })
      });

      if (response.ok) {
        router.push('/onboarding/workspace-setup');
      }
    } catch (error) {
      console.error('Error updating professional info:', error);
    }
  };

  return (
    <div className="w-full h-screen bg-white flex justify-center items-center">
      {/* Utiliser le même JSX que votre composant existant mais avec le handleSubmit */}
    </div>
  );
} 