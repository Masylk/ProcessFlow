'use client';

import React, { useState } from 'react';
import { User } from '@/types/user';
import ButtonNormal from '@/app/components/ButtonNormal';
import WorkspaceSettings from './WorkspaceSettings';
import { Workspace } from '@/types/workspace';

interface SettingsPageProps {
  user: User | null;
  onClose: () => void;
  workspace?: Workspace;
  onWorkspaceUpdate?: (updates: Partial<Workspace>) => Promise<void>;
}

export default function SettingsPage({ user, onClose, workspace, onWorkspaceUpdate }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState(workspace && onWorkspaceUpdate ? 'Workspace' : 'Team');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const tabs = [
    'Workspace',
    'Team',
    'Plan',
    'Billing',
    'Notifications',
    'Appearance',
    'API'
  ];

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const plans = {
    free: {
      name: "Free. Forever.",
      price: "$0",
      features: [
        "3 conditional processes",
        "Edit mode",
        "Read mode",
        "Basic export and sharing"
      ]
    },
    earlyAdopter: {
      name: "Early Adopter",
      price: billingPeriod === 'monthly' ? "$15" : "$12",
      period: billingPeriod === 'monthly' ? "per user/month billed monthly" : "per user/month billed annually",
      features: [
        "All Free features +",
        "Unlimited conditional processes",
        "Early access to new features",
        "Branded processes & exports",
        "Priority support from the founders",
        "Remove ProcessFlow branding"
      ]
    }
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
              className={`px-3 py-2 text-sm font-medium rounded-md  transition-colors duration-200 ${
                activeTab === tab
                  ? 'text-lightMode-text-primary bg-lightMode-bg-primary shadow-sm border border-lightMode-border-secondary '
                  : 'text-lightMode-text-quaternary hover:text-lightMode-text-primary border border-transparent'
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
      <div className="h-[calc(100%-210px)] overflow-y-auto">
        {activeTab === 'Workspace' && workspace && onWorkspaceUpdate && (
          <div className="px-8">
            <WorkspaceSettings
              workspace={workspace}
              onUpdate={onWorkspaceUpdate}
            />
          </div>
        )}
        {activeTab === 'Team' && (
          <div className="px-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-lightMode-text-primary">Team members</h2>
                <p className="text-sm text-lightMode-text-tertiary">
                  Manage your team members and their account permissions here.
                </p>
              </div>
              <div className="flex gap-3">
                <ButtonNormal
                  variant="secondaryGray"
                  size="small"
                >
                  Download CSV
                </ButtonNormal> 
                <ButtonNormal
                  variant="primary"
                  size="small"
                >
                  Add user
                </ButtonNormal>
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

        {activeTab === 'Plan' && (
          <div className="flex flex-col justify-center items-center">
            <div className="flex w-full justify-center">
            {/* Billing Toggle */}
            <div className="inline-flex bg-lightMode-bg-secondary rounded-lg border border-lightMode-border-secondary p-1 mb-12">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  billingPeriod === 'monthly'
                    ? 'bg-white shadow-sm border border-[#E4E7EC]'
                    : 'text-[#667085] border border-transparent'
                }`}
              >
                Monthly billing
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${
                  billingPeriod === 'annual'
                    ? 'bg-white shadow-sm border border-[#E4E7EC]'
                    : 'text-[#667085] border border-transparent'
                }`}
              >
                Annual billing
                <span className="bg-[#EEF4FF] text-lightMode-text-brand-tertiary border border-lightMode-border-brand text-xs px-3 py-0.5 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
            </div>
            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-8 w-fit ">
              {/* Free Plan */}
              <div className="border rounded-xl p-8 bg-white shadow-sm flex flex-col">
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-2">{plans.free.name}</h2>
                  <div className="text-2xl font-bold">{plans.free.price}</div>
                </div>
                
                <div className="space-y-4 mb-8">
                  {plans.free.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/blue-check.svg`}
                        alt="check"
                        className="w-5 h-5"
                      />
                      <span className="text-base text-lightMode-text-tertiary font-normal">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-auto">
                  <ButtonNormal
                    variant="secondaryGray"
                    size="small"
                    className="w-full"
                    disabled={true}
                  >
                    Current plan
                  </ButtonNormal>
                </div>
              </div>

              {/* Early Adopter Plan */}
              <div className="border rounded-xl p-8 bg-white shadow-sm relative">
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-2">{plans.earlyAdopter.name}</h2>
                  <div className="text-2xl font-bold">
                    {plans.earlyAdopter.price}
                    <span className="text-sm font-normal text-lightMode-text-tertiary ml-2">
                      {plans.earlyAdopter.period}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  {plans.earlyAdopter.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/blue-check.svg`}
                        alt="check"
                        className="w-5 h-5"
                      />
                      <span className="text-base text-lightMode-text-tertiary font-normal">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="self-stretch h-px border-t bg-[#e4e7ec] my-0" />
                <ButtonNormal
                  variant="primary"
                  size="small"
                  className="w-full"
                >
                  Get started
                </ButtonNormal>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 