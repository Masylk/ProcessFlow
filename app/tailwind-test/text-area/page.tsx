'use client';

import { useState } from 'react';
import TextAreaInput from '@/app/components/TextAreaInput';
import ButtonNormal from '@/app/components/ButtonNormal';

export default function TextAreaPage() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  
  // Test states for different TextArea configurations
  const [defaultValue, setDefaultValue] = useState('');
  const [requiredValue, setRequiredValue] = useState('');
  const [withHintValue, setWithHintValue] = useState('');
  const [withHelpIconValue, setWithHelpIconValue] = useState('');
  const [disabledValue, setDisabledValue] = useState('This is disabled');
  const [errorValue, setErrorValue] = useState('');
  const [customRowsValue, setCustomRowsValue] = useState('');
  const [allFeaturesValue, setAllFeaturesValue] = useState('');

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
            mode={mode}
            variant="secondaryGray"
            size="small"
            leadingIcon="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/sun.svg"
          >
            {mode === 'light' ? 'Light' : 'Dark'}
          </ButtonNormal>
        </div>

        {/* Default TextArea */}
        <TextAreaInput
          label="Default TextArea"
          placeholder="Type something..."
          value={defaultValue}
          onChange={setDefaultValue}
          mode={mode}
        />

        {/* Required TextArea */}
        <TextAreaInput
          label="Required TextArea"
          placeholder="This field is required..."
          value={requiredValue}
          onChange={setRequiredValue}
          required
          mode={mode}
        />

        {/* TextArea with Hint */}
        <TextAreaInput
          label="TextArea with Hint"
          placeholder="With hint text..."
          value={withHintValue}
          onChange={setWithHintValue}
          hintText="This is a helpful hint text below the textarea"
          mode={mode}
        />

        {/* TextArea with Help Icon */}
        <TextAreaInput
          label="TextArea with Help Icon"
          placeholder="With help icon..."
          value={withHelpIconValue}
          onChange={setWithHelpIconValue}
          helpIcon
          tooltipText="This is a custom tooltip text that appears when hovering over the help icon"
          mode={mode}
        />

        {/* Disabled TextArea */}
        <TextAreaInput
          label="Disabled TextArea"
          placeholder="This textarea is disabled"
          value={disabledValue}
          onChange={setDisabledValue}
          disabled
          mode={mode}
        />

        {/* Error State TextArea */}
        <TextAreaInput
          label="Error State TextArea"
          placeholder="With error..."
          value={errorValue}
          onChange={setErrorValue}
          destructive
          errorMessage="This is an error message"
          mode={mode}
        />

        {/* Custom Rows TextArea */}
        <TextAreaInput
          label="Custom Rows TextArea"
          placeholder="This textarea has 8 rows..."
          value={customRowsValue}
          onChange={setCustomRowsValue}
          rows={8}
          mode={mode}
        />

        {/* TextArea with All Features */}
        <TextAreaInput
          label="All Features TextArea"
          placeholder="This textarea has all features enabled..."
          value={allFeaturesValue}
          onChange={setAllFeaturesValue}
          required
          helpIcon
          tooltipText="Custom tooltip for help icon"
          hintText="Hint text below the textarea"
          mode={mode}
          rows={6}
        />
      </div>
    </div>
  );
}
