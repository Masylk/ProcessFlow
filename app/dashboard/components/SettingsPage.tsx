'use client';

import React, { useState } from 'react';
import { User } from '@/types/user';

interface SettingsPageProps {
  user: User | null;
  onClose: () => void;
}

export default function SettingsPage({ user, onClose }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState('Team');

  const tabs = [
    'Profile',
    'Password',
    'Team',
    'Plan',
    'Billing',
    'Notifications',
    'Integrations',
    'API'
  ];

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold text-lightMode-text-primary">Settings</h1>
      </div>

      {/* Tabs */}
      <div className="px-8 mb-6">
        <div className="inline-flex w-full p-1 bg-lightMode-bg-secondary rounded-lg border border-lightMode-border-secondary">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                activeTab === tab
                  ? 'text-lightMode-text-primary bg-lightMode-bg-primary shadow-sm'
                  : 'text-lightMode-text-quaternary hover:text-lightMode-text-primary'
              }`}
            >
              {tab}
              {tab === 'Notifications' && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-lightMode-text-quaternary border border-gray-200 rounded-full">
                  2
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {activeTab === 'Team' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Team members</h2>
                <p className="text-sm text-gray-500">
                  Manage your team members and their account permissions here.
                </p>
              </div>
              <div className="flex gap-3">
                <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  Download CSV
                </button>
                <button className="px-3 py-2 text-sm font-medium text-white bg-[#6941C6] rounded-lg hover:bg-[#6941C6]/90">
                  Add user
                </button>
              </div>
            </div>

            {/* Team members table */}
            <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-sm font-medium text-gray-500">
                <div className="col-span-4">Name</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-4">Email address</div>
                <div className="col-span-2">Teams</div>
              </div>

              {/* Table content would go here */}
              {/* This would be populated with actual team member data */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 