"use client";

import { useState } from "react";
import InputField from "@/app/components/InputFields"; // Adjust the path if needed
import myTheme from '../../../theme.js'; // Adjust the path as necessary

const ExampleUsagePage: React.FC = () => {
  // State for each input
  const [defaultTooltipText, setDefaultTooltipText] = useState(
    "Tooltips are used to describe or identify an element. In most scenarios, tooltips help the user understand meaning, function or alt-text."
  );
  const [defaultInput, setDefaultInput] = useState("");
  const [helpIconInput, setHelpIconInput] = useState("");
  const [requiredInput, setRequiredInput] = useState("");
  const [destructiveInput, setDestructiveInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [currencyInput, setCurrencyInput] = useState("");
  const [websiteInput, setWebsiteInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [searchActionInput, setSearchActionInput] = useState("");

  return (
    <div className="p-8 space-y-12">
      <div className="w-[300px]">
        <h1 className="text-3xl font-bold mb-8">Input Field Examples</h1>

        {/* Tooltip Text Configuration */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Default Tooltip Text</h2>
          <InputField
            type="default"
            label="Default Tooltip Text"
            placeholder="Enter default tooltip text..."
            value={defaultTooltipText}
            onChange={setDefaultTooltipText}
          />
        </section>

        {/* Default Inputs */}
        <section className="space-y-6 mt-8">
          <h2 className="text-xl font-semibold">Default Inputs</h2>
          <div className="space-y-4">
            <InputField
              type="default"
              label="Default Input"
              placeholder="Enter text..."
              value={defaultInput}
              onChange={setDefaultInput}
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
            />

            <InputField
              type="default"
              label="Required Field"
              placeholder="This field is required"
              value={requiredInput}
              onChange={setRequiredInput}
              required
            />

            <InputField
              type="default"
              label="Destructive State"
              placeholder="Error state"
              value={destructiveInput}
              onChange={setDestructiveInput}
              destructive
              errorMessage="This is an error message"
            />

            <InputField
              type="default"
              label="Disabled State"
              placeholder="This input is disabled"
              disabled
            />
          </div>
        </section>

        {/* Icon Leading Inputs */}
        <section className="space-y-6 mt-8">
          <h2 className="text-xl font-semibold">Icon Leading Inputs</h2>
          <div className="space-y-4">
            <InputField
              type="icon-leading"
              label="Email Input"
              iconUrl="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/mail-icon.svg"
              iconColor={myTheme.colors["Gray (light mode)/500"]}
              placeholder="Enter email address"
              value={emailInput}
              onChange={setEmailInput}
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
            />
          </div>
        </section>

        {/* Dropdown Inputs */}
        <section className="space-y-6 mt-8">
          <h2 className="text-xl font-semibold">Dropdown Inputs</h2>
          <div className="space-y-4">
            <InputField
              type="leading-dropdown"
              label="Country Code Selection"
              placeholder="Phone number..."
              value={phoneInput}
              onChange={setPhoneInput}
              dropdownOptions={["+1", "+44", "+81", "+86"]}
              helpIcon={true}
              hintText="Select your country code"
              tooltipText={defaultTooltipText}
            />

            <InputField
              type="trailing-dropdown"
              label="Currency Input"
              placeholder="Enter amount..."
              value={currencyInput}
              onChange={setCurrencyInput}
              dropdownOptions={["USD", "EUR", "GBP", "JPY"]}
            />
          </div>
        </section>

        {/* Leading Text Input */}
        <section className="space-y-6 mt-8">
          <h2 className="text-xl font-semibold">Leading Text Input</h2>
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
            />
          </div>
        </section>

        {/* Tags Input */}
        <section className="space-y-6 mt-8">
          <h2 className="text-xl font-semibold">Tags Input</h2>
          <div className="space-y-4">
            <InputField
              type="tags"
              label="Add Team Members"
              placeholder="Type and press enter to add tags..."
              value={tagsInput}
              onChange={setTagsInput}
              hintText="Press enter or comma to add new tags"
            />
          </div>
        </section>

        {/* Trailing Button Input */}
        <section className="space-y-6 mt-8">
          <h2 className="text-xl font-semibold">Trailing Button Input</h2>
          <div className="space-y-4">
            <InputField
              type="trailing-button"
              label="Search with Action"
              placeholder="Enter search term..."
              value={searchActionInput}
              onChange={setSearchActionInput}
              tooltipText={defaultTooltipText}
            />

            <InputField
              type="trailing-button"
              label="Disabled State"
              placeholder="This input is disabled..."
              disabled
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default ExampleUsagePage;
