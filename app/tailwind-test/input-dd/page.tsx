'use client';

import { useState } from 'react';
import InputDropdown from '@/app/components/InputDropdown';
import ButtonNormal from '@/app/components/ButtonNormal';
import theme from '@/theme';

export default function InputDropdownPage() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [selectedMember, setSelectedMember] = useState('');
  const [requiredMember, setRequiredMember] = useState('');
  const [disabledMember, setDisabledMember] = useState('Olivia Rhye');
  const [selectedTags, setSelectedTags] = useState<
    Array<{
      name: string;
      handle: string;
      avatarUrl: string;
    }>
  >([]);

  const teamMembers = [
    {
      name: 'Phoenix Baker',
      handle: '@phoenix',
      avatarUrl:
        'https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/avatar-01.png',
    },
    {
      name: 'Olivia Rhye',
      handle: '@olivia',
      avatarUrl:
        'https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/avatar-01.png',
    },
    {
      name: 'Lana Steiner',
      handle: '@lana',
      avatarUrl:
        'https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/avatar-01.png',
    },
    {
      name: 'Demi Wilkinson',
      handle: '@demi',
      avatarUrl:
        'https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/avatar-01.png',
    },
    {
      name: 'Candice Wu',
      handle: '@candice',
      avatarUrl:
        'https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/avatar-01.png',
    },
    {
      name: 'Natali Craig',
      handle: '@natali',
      avatarUrl:
        'https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/avatar-01.png',
    },
    {
      name: 'Drew Cano',
      handle: '@drew',
      avatarUrl:
        'https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/avatar-01.png',
    },
  ];

  return (
    <div
      className={`min-h-screen p-8 transition-colors ${
        mode === 'dark' ? 'dark bg-darkMode-bg-primary' : 'bg-white'
      }`}
    >
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Mode Toggle */}
        <div className="flex justify-end">
          <ButtonNormal
            onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
            variant="secondary"
            size="small"
            leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/sun.svg"
          >
            {mode === 'light' ? 'Light' : 'Dark'}
          </ButtonNormal>
        </div>

        {/* Default Dropdown */}
        <InputDropdown
          label="Team member"
          value={selectedMember}
          onChange={setSelectedMember}
          options={teamMembers}
          mode={mode}
          iconUrl="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/mail-icon.svg"
          iconColor={
            mode === 'light'
              ? theme.colors['Gray (light mode)/500']
              : theme.colors['Gray (dark mode)/400']
          }
        />

        {/* Required Dropdown with Help Icon */}
        <InputDropdown
          label="Required team member"
          value={requiredMember}
          onChange={setRequiredMember}
          options={teamMembers}
          required
          helpIcon
          tooltipText="Select a team member to assign this task to"
          mode={mode}
        />

        {/* Dropdown with Hint */}
        <InputDropdown
          label="Team member with hint"
          value={selectedMember}
          onChange={setSelectedMember}
          options={teamMembers}
          hintText="This is a hint text to help user."
          mode={mode}
        />

        {/* Disabled Dropdown */}
        <InputDropdown
          label="Disabled dropdown"
          value={disabledMember}
          onChange={setDisabledMember}
          options={teamMembers}
          disabled
          mode={mode}
        />

        <InputDropdown
          type="tags"
          label="Team members"
          options={teamMembers}
          mode={mode}
          selectedTags={selectedTags}
          onTagRemove={(tag) => {
            setSelectedTags(
              selectedTags.filter((t) => t.handle !== tag.handle)
            );
          }}
          onChange={(value) => {
            const tag = teamMembers.find((t) => t.name === value);
            if (tag && !selectedTags.find((t) => t.handle === tag.handle)) {
              setSelectedTags([...selectedTags, tag]);
            }
          }}
          hintText="Select team members from the list"
        />
      </div>
    </div>
  );
}
