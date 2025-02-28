'use client';

import { useState } from 'react';
import InputField from '@/app/components/InputFields';
import ButtonNormal from '@/app/components/ButtonNormal';
import myTheme from '../../../theme.js';

const ExampleUsagePage: React.FC = () => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  // Configuration states
  const [defaultTooltipText, setDefaultTooltipText] = useState(
    'Tooltips are used to describe or identify an element. In most scenarios, tooltips help the user understand meaning, function or alt-text.'
  );

  // Input states for all variants
  const [defaultInput, setDefaultInput] = useState('');
  const [helpIconInput, setHelpIconInput] = useState('');
  const [requiredInput, setRequiredInput] = useState('');
  const [destructiveInput, setDestructiveInput] = useState('');
  const [smallInput, setSmallInput] = useState('');

  // Icon Leading states
  const [emailInput, setEmailInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [destructiveIconInput, setDestructiveIconInput] = useState('');

  // Dropdown states
  const [phoneInput, setPhoneInput] = useState('');
  const [currencyInput, setCurrencyInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  const [destructiveDropdownInput, setDestructiveDropdownInput] = useState('');

  // Leading Text states
  const [websiteInput, setWebsiteInput] = useState('');
  const [gitHubInput, setGitHubInput] = useState('');
  const [destructiveWebsiteInput, setDestructiveWebsiteInput] = useState('');

  // Tags Input states
  const [tagsInput, setTagsInput] = useState('');
  const [teamMembersInput, setTeamMembersInput] = useState('');
  const [destructiveTagsInput, setDestructiveTagsInput] = useState('');

  // Trailing Button states
  const [searchActionInput, setSearchActionInput] = useState('');
  const [copyInput, setCopyInput] = useState('This is copyable text');
  const [destructiveTrailingInput, setDestructiveTrailingInput] = useState('');

  return (
    <div
      className={`p-8 space-y-12 min-h-screen ${mode === 'dark' ? 'bg-[#161b26] text-white' : 'bg-white'}`}
    >
      <div className="max-w-[720px] mx-auto">
        {/* Mode Toggle */}
        <div className="mb-8">
          <ButtonNormal
            variant="secondary"
            size="small"
            onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
          >
            Switch to {mode === 'light' ? 'Dark' : 'Light'} Mode
          </ButtonNormal>
        </div>

        <h1 className="text-3xl font-bold mb-8">Input Field Examples</h1>

        {/* Tooltip Text Configuration */}
        <section className="space-y-6 mb-12">
          <h2 className="text-xl font-semibold">Default Tooltip Text</h2>
          <InputField
            type="default"
            label="Default Tooltip Text"
            placeholder="Enter default tooltip text..."
            value={defaultTooltipText}
            onChange={setDefaultTooltipText}
            mode={mode}
          />
        </section>

        {/* Default Inputs */}
        <section className="space-y-6 mb-12">
          <h2 className="text-xl font-semibold">Default Inputs</h2>
          <div className="space-y-4">
            <InputField
              type="default"
              label="Default Input"
              placeholder="Enter text..."
              value={defaultInput}
              onChange={setDefaultInput}
              mode={mode}
            />

            <InputField
              type="default"
              label="Small Size Input"
              placeholder="Small input..."
              value={smallInput}
              onChange={setSmallInput}
              size="small"
              mode={mode}
            />

            <InputField
              type="default"
              label="With Help Icon & Hint"
              placeholder="Enter text..."
              value={helpIconInput}
              onChange={setHelpIconInput}
              helpIcon={true}
              hintText="This is a helpful hint text"
              tooltipText={defaultTooltipText}
              mode={mode}
            />

            <InputField
              type="default"
              label="Required Field"
              placeholder="This field is required"
              value={requiredInput}
              onChange={setRequiredInput}
              required
              mode={mode}
            />

            <InputField
              type="default"
              label="Destructive State"
              placeholder="Error state"
              value={destructiveInput}
              onChange={setDestructiveInput}
              destructive
              errorMessage="This is an error message"
              mode={mode}
            />

            <InputField
              type="default"
              label="Disabled State"
              placeholder="This input is disabled"
              disabled
              mode={mode}
            />
          </div>
        </section>

        {/* Icon Leading Inputs */}
        <section className="space-y-6 mb-12">
          <h2 className="text-xl font-semibold">Icon Leading Inputs</h2>
          <div className="space-y-4">
            <InputField
              type="icon-leading"
              label="Email Input"
              iconUrl="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/mail-icon.svg"
              iconColor={
                mode === 'light'
                  ? myTheme.colors['Gray (light mode)/500']
                  : myTheme.colors['Gray (dark mode)/400']
              }
              placeholder="Enter email address"
              value={emailInput}
              onChange={setEmailInput}
              mode={mode}
            />

            <InputField
              type="icon-leading"
              label="Search Input"
              iconUrl="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/search-icon.svg"
              placeholder="Search..."
              value={searchInput}
              onChange={setSearchInput}
              helpIcon={true}
              tooltipText={defaultTooltipText}
              mode={mode}
            />

            <InputField
              type="icon-leading"
              label="Location Input"
              iconUrl="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/map-pin.svg"
              placeholder="Enter location..."
              value={locationInput}
              onChange={setLocationInput}
              size="small"
              mode={mode}
            />

            <InputField
              type="icon-leading"
              label="Destructive Icon Input"
              iconUrl="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/alert-circle.svg"
              placeholder="Destructive state..."
              value={destructiveIconInput}
              onChange={setDestructiveIconInput}
              destructive
              errorMessage="Invalid input format"
              mode={mode}
            />
          </div>
        </section>

        {/* Dropdown Inputs */}
        <section className="space-y-6 mb-12">
          <h2 className="text-xl font-semibold">Dropdown Inputs</h2>
          <div className="space-y-4">
            <InputField
              type="leading-dropdown"
              label="Phone Number"
              placeholder="Phone number..."
              value={phoneInput}
              onChange={setPhoneInput}
              dropdownOptions={['+1', '+44', '+81', '+86']}
              helpIcon={true}
              hintText="Select your country code"
              tooltipText={defaultTooltipText}
              mode={mode}
            />

            <InputField
              type="trailing-dropdown"
              label="Currency Input"
              placeholder="Enter amount..."
              value={currencyInput}
              onChange={setCurrencyInput}
              dropdownOptions={['USD', 'EUR', 'GBP', 'JPY']}
              mode={mode}
            />

            <InputField
              type="trailing-dropdown"
              label="Language Selection"
              placeholder="Enter text..."
              value={languageInput}
              onChange={setLanguageInput}
              dropdownOptions={['English', 'Spanish', 'French', 'German']}
              size="small"
              mode={mode}
            />

            <InputField
              type="leading-dropdown"
              label="Destructive Dropdown"
              placeholder="Error state..."
              value={destructiveDropdownInput}
              onChange={setDestructiveDropdownInput}
              dropdownOptions={['Option 1', 'Option 2', 'Option 3']}
              destructive
              errorMessage="Please select a valid option"
              mode={mode}
            />
          </div>
        </section>

        {/* Leading Text Inputs */}
        <section className="space-y-6 mb-12">
          <h2 className="text-xl font-semibold">Leading Text Inputs</h2>
          <div className="space-y-4">
            <InputField
              type="leading-text"
              label="Website URL"
              placeholder="www.example.com"
              value={websiteInput}
              onChange={setWebsiteInput}
              hintText="Enter your website URL"
              helpIcon={true}
              tooltipText={defaultTooltipText}
              mode={mode}
            />

            <InputField
              type="leading-text"
              label="GitHub Profile"
              placeholder="username"
              value={gitHubInput}
              onChange={setGitHubInput}
              size="small"
              mode={mode}
            />

            <InputField
              type="leading-text"
              label="Destructive Website Input"
              placeholder="www.example.com"
              value={destructiveWebsiteInput}
              onChange={setDestructiveWebsiteInput}
              destructive
              errorMessage="Invalid website URL"
              mode={mode}
            />
          </div>
        </section>

        {/* Tags Inputs */}
        <section className="space-y-6 mb-12">
          <h2 className="text-xl font-semibold">Tags Inputs</h2>
          <div className="space-y-4">
            <InputField
              type="tags"
              label="Basic Tags"
              placeholder="Type and press enter to add tags..."
              value={tagsInput}
              onChange={setTagsInput}
              hintText="Press enter or comma to add new tags"
              mode={mode}
            />

            <InputField
              type="tags"
              label="Team Members"
              placeholder="Add team members..."
              value={teamMembersInput}
              onChange={setTeamMembersInput}
              helpIcon={true}
              tooltipText="Add team members by typing their names"
              mode={mode}
            />

            <InputField
              type="tags"
              label="Destructive Tags Input"
              placeholder="Error state..."
              value={destructiveTagsInput}
              onChange={setDestructiveTagsInput}
              destructive
              errorMessage="Invalid tag format"
              mode={mode}
            />
          </div>
        </section>

        {/* Trailing Button Inputs */}
        <section className="space-y-6 mb-12">
          <h2 className="text-xl font-semibold">Trailing Button Inputs</h2>
          <div className="space-y-4">
            <InputField
              type="trailing-button"
              label="Search with Action"
              placeholder="Enter search term..."
              value={searchActionInput}
              onChange={setSearchActionInput}
              tooltipText={defaultTooltipText}
              mode={mode}
            />

            <InputField
              type="trailing-button"
              label="Copy Text"
              placeholder="Enter text to copy..."
              value={copyInput}
              onChange={setCopyInput}
              helpIcon={true}
              mode={mode}
            />

            <InputField
              type="trailing-button"
              label="Destructive Copy Input"
              placeholder="Error state..."
              value={destructiveTrailingInput}
              onChange={setDestructiveTrailingInput}
              destructive
              errorMessage="Invalid input format"
              mode={mode}
            />

            <InputField
              type="trailing-button"
              label="Disabled State"
              placeholder="This input is disabled..."
              disabled
              mode={mode}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default ExampleUsagePage;
