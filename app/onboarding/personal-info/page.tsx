"use client"

import { useState } from "react";
import ButtonNormal from '@/app/components/ButtonNormal';
import { useRouter } from 'next/navigation';

export default function PersonalInfo() {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/onboarding/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: 'PERSONAL_INFO',
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
            onboarding_step: 'PROFESSIONAL_INFO'
          }
        })
      });

      if (response.ok) {
        router.push('/onboarding/professional-info');
      }
    } catch (error) {
      console.error('Error updating personal info:', error);
    }
  };

  return (
    <div className="w-full h-screen bg-white flex justify-center items-center">
      {/* Utiliser le même JSX que votre composant existant mais avec le handleSubmit */}
    </div>
  );
} 