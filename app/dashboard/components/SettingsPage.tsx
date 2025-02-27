'use client';

import React, { useState } from 'react';
import { User } from '@/types/user';
import ButtonNormal from '@/app/components/ButtonNormal';
import WorkspaceSettings from './WorkspaceSettings';
import { Workspace } from '@/types/workspace';
import { useColors, useTheme } from '@/app/theme/hooks';
import type { ThemeMode } from '@/app/theme/types';

interface SettingsPageProps {
  user: User | null;
  onClose: () => void;
  workspace?: Workspace;
  onWorkspaceUpdate?: (updates: Partial<Workspace>) => Promise<void>;
}

export default function SettingsPage({ user, onClose, workspace, onWorkspaceUpdate }: SettingsPageProps) {
  const colors = useColors();
  const { currentTheme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(workspace && onWorkspaceUpdate ? 'Workspace' : 'Team');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const tabs = [
    'Workspace',
    'Plan',
    'Billing',
    'Appearance'
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
    <div 
      style={{ backgroundColor: colors['bg-primary'] }}
      className="h-full"
    >
      {/* Header */}
      <div className="px-8 py-6">
        <h1 
          style={{ color: colors['text-primary'] }}
          className="text-2xl font-semibold"
        >
          Settings
        </h1>
      </div>

      {/* Tabs */}
      <div className="px-8 mb-6">
        <div 
          style={{ 
            backgroundColor: colors['bg-secondary'],
            borderColor: colors['border-secondary']
          }}
          className="inline-flex w-full p-1 rounded-lg border"
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              style={{
                backgroundColor: activeTab === tab ? colors['bg-primary'] : 'transparent',
                borderColor: activeTab === tab ? colors['border-secondary'] : 'transparent',
                color: activeTab === tab ? colors['text-primary'] : colors['text-quaternary']
              }}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 border hover:text-[var(--text-primary)]`}
            >
              {tab}
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
                <h2 
                  style={{ color: colors['text-primary'] }}
                  className="text-lg font-semibold"
                >
                  Team members
                </h2>
                <p 
                  style={{ color: colors['text-tertiary'] }}
                  className="text-sm"
                >
                  Manage your team members and their account permissions here.
                </p>
              </div>
              <div className="flex gap-3">
                <ButtonNormal
                  variant="secondary"
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
            <div 
              style={{ borderColor: colors['border-secondary'] }}
              className="mt-6 border rounded-lg overflow-hidden"
            >
              {/* Table header */}
              <div 
                style={{ 
                  backgroundColor: colors['bg-secondary'],
                  color: colors['text-tertiary']
                }}
                className="grid grid-cols-12 gap-4 px-6 py-3 text-sm font-medium"
              >
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
              <div 
                style={{ 
                  backgroundColor: colors['bg-secondary'],
                  borderColor: colors['border-secondary']
                }}
                className="inline-flex rounded-lg border p-1 mb-12"
              >
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  style={{
                    backgroundColor: billingPeriod === 'monthly' ? colors['bg-primary'] : 'transparent',
                    borderColor: billingPeriod === 'monthly' ? colors['border-primary'] : 'transparent',
                    color: billingPeriod === 'monthly' ? colors['text-primary'] : colors['text-tertiary']
                  }}
                  className="px-4 py-2 rounded-lg transition-all text-sm font-medium border"
                >
                  Monthly billing
                </button>
                <button
                  onClick={() => setBillingPeriod('annual')}
                  style={{
                    backgroundColor: billingPeriod === 'annual' ? colors['bg-primary'] : 'transparent',
                    borderColor: billingPeriod === 'annual' ? colors['border-primary'] : 'transparent',
                    color: billingPeriod === 'annual' ? colors['text-primary'] : colors['text-tertiary']
                  }}
                  className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium border"
                >
                  Annual billing
                  <span 
                    style={{
                      backgroundColor: colors['bg-brand-primary'],
                      color: colors['text-brand-primary'],
                      borderColor: colors['border-brand']
                    }}
                    className="text-xs px-3 py-0.5 rounded-full border"
                  >
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-8 w-fit">
              {/* Free Plan */}
              <div 
                style={{ 
                  backgroundColor: colors['bg-primary'],
                  borderColor: colors['border-primary']
                }}
                className="border rounded-xl p-8 shadow-sm flex flex-col"
              >
                <div className="mb-8">
                  <h2 
                    style={{ color: colors['text-primary'] }}
                    className="text-2xl font-semibold mb-2"
                  >
                    {plans.free.name}
                  </h2>
                  <div 
                    style={{ color: colors['text-primary'] }}
                    className="text-2xl font-bold"
                  >
                    {plans.free.price}
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  {plans.free.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/blue-check.svg`}
                        alt="check"
                        className="w-5 h-5"
                      />
                      <span 
                        style={{ color: colors['text-tertiary'] }}
                        className="text-base font-normal"
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-auto">
                  <ButtonNormal
                    variant="secondary"
                    size="small"
                    className="w-full"
                    disabled={true}
                  >
                    Current plan
                  </ButtonNormal>
                </div>
              </div>

              {/* Early Adopter Plan */}
              <div 
                style={{ 
                  backgroundColor: colors['bg-primary'],
                  borderColor: colors['border-primary']
                }}
                className="border rounded-xl p-8 shadow-sm relative"
              >
                <div className="mb-8">
                  <h2 
                    style={{ color: colors['text-primary'] }}
                    className="text-2xl font-semibold mb-2"
                  >
                    {plans.earlyAdopter.name}
                  </h2>
                  <div 
                    style={{ color: colors['text-primary'] }}
                    className="text-2xl font-bold"
                  >
                    {plans.earlyAdopter.price}
                    <span 
                      style={{ color: colors['text-tertiary'] }}
                      className="text-sm font-normal ml-2"
                    >
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
                      <span 
                        style={{ color: colors['text-tertiary'] }}
                        className="text-base font-normal"
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                <div 
                  style={{ borderColor: colors['border-secondary'] }}
                  className="self-stretch h-px border-t my-0" 
                />
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

        {activeTab === 'Appearance' && (
          <div className="px-8">
            <div className="mb-6">
              <h2 
                style={{ color: colors['text-primary'] }}
                className="text-lg font-semibold mb-1"
              >
                Theme
              </h2>
              <p 
                style={{ color: colors['text-tertiary'] }}
                className="text-sm"
              >
                Customize your UI theme
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-3xl">
              {/* Light Theme Option */}
              <div 
                className="relative cursor-pointer group"
                onClick={() => setTheme('light' as ThemeMode)}
              >
                <div 
                  style={{ 
                    backgroundColor: colors['bg-primary'],
                    borderColor: currentTheme === 'light' ? colors['text-accent'] : colors['border-secondary']
                  }}
                  className="aspect-[4/3] rounded-xl border-2 overflow-hidden transition-all duration-200 hover:border-[#4761c4]"
                >
                  <div className="w-full h-full p-2">
                    <div className="w-full h-full rounded-lg bg-[#F9FAFB] overflow-hidden">
                      <div className="h-2 w-8 bg-[#D0D5DD] rounded-full m-2"></div>
                      <div className="space-y-1 px-2">
                        <div className="h-1 w-3/4 bg-[#D0D5DD] rounded-full"></div>
                        <div className="h-1 w-1/2 bg-[#D0D5DD] rounded-full"></div>
                        <div className="h-1 w-2/3 bg-[#D0D5DD] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
                {currentTheme === 'light' && (
                  <div className="absolute -right-1 -top-1">
                    <div 
                      style={{ 
                        backgroundColor: colors['bg-primary'],
                        borderColor: colors['border-primary']
                      }}
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                    >
                      <div className="w-4 h-4 rounded-full bg-[#4761c4] flex items-center justify-center">
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-white.svg`}
                          alt="Selected"
                          className="w-3 h-3"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <p 
                  style={{ color: colors['text-primary'] }}
                  className="mt-2 text-sm font-medium text-center"
                >
                  Light
                </p>
              </div>

              {/* Dark Theme Option */}
              <div 
                className="relative cursor-pointer group"
                onClick={() => setTheme('dark' as ThemeMode)}
              >
                <div 
                  style={{ 
                    backgroundColor: colors['bg-primary'],
                    borderColor: currentTheme === 'dark' ? colors['text-accent'] : colors['border-secondary']
                  }}
                  className="aspect-[4/3] rounded-xl border-2 overflow-hidden transition-all duration-200 hover:border-[#4761c4]"
                >
                  <div className="w-full h-full p-2">
                    <div className="w-full h-full rounded-lg bg-[#1C1C1C] overflow-hidden">
                      <div className="h-2 w-8 bg-[#2C2C2C] rounded-full m-2"></div>
                      <div className="space-y-1 px-2">
                        <div className="h-1 w-3/4 bg-[#2C2C2C] rounded-full"></div>
                        <div className="h-1 w-1/2 bg-[#2C2C2C] rounded-full"></div>
                        <div className="h-1 w-2/3 bg-[#2C2C2C] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
                {currentTheme === 'dark' && (
                  <div className="absolute -right-1 -top-1">
                    <div 
                      style={{ 
                        backgroundColor: colors['bg-primary'],
                        borderColor: colors['border-primary']
                      }}
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                    >
                      <div className="w-4 h-4 rounded-full bg-[#4761c4] flex items-center justify-center">
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-white.svg`}
                          alt="Selected"
                          className="w-3 h-3"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <p 
                  style={{ color: colors['text-primary'] }}
                  className="mt-2 text-sm font-medium text-center"
                >
                  Dark
                </p>
              </div>

              {/* System Theme Option */}
              <div 
                className="relative cursor-pointer group hidden"
                onClick={() => setTheme('system' as ThemeMode)}
              >
                <div 
                  style={{ 
                    backgroundColor: colors['bg-primary'],
                    borderColor: currentTheme === 'system' ? colors['text-accent'] : colors['border-secondary']
                  }}
                  className="aspect-[4/3] rounded-xl border-2 overflow-hidden transition-all duration-200 hover:border-[#4761c4]"
                >
                  <div className="w-full h-full p-2">
                    <div className="w-full h-full rounded-lg overflow-hidden grid grid-cols-2 gap-1">
                      <div className="bg-[#F9FAFB] overflow-hidden">
                        <div className="h-1.5 w-6 bg-[#D0D5DD] rounded-full m-1.5"></div>
                        <div className="space-y-0.5 px-1.5">
                          <div className="h-0.5 w-3/4 bg-[#D0D5DD] rounded-full"></div>
                          <div className="h-0.5 w-1/2 bg-[#D0D5DD] rounded-full"></div>
                          <div className="h-0.5 w-2/3 bg-[#D0D5DD] rounded-full"></div>
                        </div>
                      </div>
                      <div className="bg-[#1C1C1C] overflow-hidden">
                        <div className="h-1.5 w-6 bg-[#2C2C2C] rounded-full m-1.5"></div>
                        <div className="space-y-0.5 px-1.5">
                          <div className="h-0.5 w-3/4 bg-[#2C2C2C] rounded-full"></div>
                          <div className="h-0.5 w-1/2 bg-[#2C2C2C] rounded-full"></div>
                          <div className="h-0.5 w-2/3 bg-[#2C2C2C] rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {currentTheme === 'system' && (
                  <div className="absolute -right-1 -top-1">
                    <div 
                      style={{ 
                        backgroundColor: colors['bg-primary'],
                        borderColor: colors['border-primary']
                      }}
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                    >
                      <div className="w-4 h-4 rounded-full bg-[#4761c4] flex items-center justify-center">
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-white.svg`}
                          alt="Selected"
                          className="w-3 h-3"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <p 
                  style={{ color: colors['text-primary'] }}
                  className="mt-2 text-sm font-medium text-center"
                >
                  System
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 