import React, { useState } from 'react';
import Modal from './Modal';
import ButtonNormal from './ButtonNormal';
import { useColors } from '@/app/theme/hooks';

/**
 * Documentation component for the Modal component with examples
 */
const ModalDocs: React.FC = () => {
  const [showBasicModal, setShowBasicModal] = useState(false);
  const [showHeaderSeparatorModal, setShowHeaderSeparatorModal] = useState(false);
  const [showNoActionSeparatorModal, setShowNoActionSeparatorModal] = useState(false);
  const [showCustomWidthModal, setShowCustomWidthModal] = useState(false);
  
  const colors = useColors();

  const renderBasicModal = () => {
    if (!showBasicModal) return null;

    const actions = (
      <>
        <ButtonNormal
          variant="secondary"
          size="small"
          className="flex-1"
          onClick={() => setShowBasicModal(false)}
        >
          Cancel
        </ButtonNormal>
        <ButtonNormal
          variant="primary"
          size="small"
          className="flex-1"
          onClick={() => setShowBasicModal(false)}
        >
          Confirm
        </ButtonNormal>
      </>
    );

    return (
      <Modal
        onClose={() => setShowBasicModal(false)}
        title="Basic Modal"
        subtitle="This is a basic modal example"
        icon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon.svg`}
        actions={actions}
      >
        <div>
          <p style={{ color: colors['text-primary'] }}>
            This is the content of the modal. You can put any React component here.
          </p>
        </div>
      </Modal>
    );
  };

  const renderHeaderSeparatorModal = () => {
    if (!showHeaderSeparatorModal) return null;

    const actions = (
      <>
        <ButtonNormal
          variant="secondary"
          size="small"
          className="flex-1"
          onClick={() => setShowHeaderSeparatorModal(false)}
        >
          Cancel
        </ButtonNormal>
        <ButtonNormal
          variant="primary"
          size="small"
          className="flex-1"
          onClick={() => setShowHeaderSeparatorModal(false)}
        >
          Confirm
        </ButtonNormal>
      </>
    );

    return (
      <Modal
        onClose={() => setShowHeaderSeparatorModal(false)}
        title="Header Separator Modal"
        subtitle="This modal has a separator between the header and content"
        icon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon.svg`}
        actions={actions}
        showHeaderSeparator={true}
      >
        <div>
          <p style={{ color: colors['text-primary'] }}>
            This modal shows how to use the showHeaderSeparator prop to add a separator between the header and content.
          </p>
        </div>
      </Modal>
    );
  };

  const renderNoActionSeparatorModal = () => {
    if (!showNoActionSeparatorModal) return null;

    const actions = (
      <>
        <ButtonNormal
          variant="secondary"
          size="small"
          className="flex-1"
          onClick={() => setShowNoActionSeparatorModal(false)}
        >
          Cancel
        </ButtonNormal>
        <ButtonNormal
          variant="primary"
          size="small"
          className="flex-1"
          onClick={() => setShowNoActionSeparatorModal(false)}
        >
          Confirm
        </ButtonNormal>
      </>
    );

    return (
      <Modal
        onClose={() => setShowNoActionSeparatorModal(false)}
        title="No Action Separator Modal"
        subtitle="This modal has no separator between content and actions"
        icon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon.svg`}
        actions={actions}
        showActionsSeparator={false}
      >
        <div>
          <p style={{ color: colors['text-primary'] }}>
            This modal shows how to use the showActionsSeparator prop to remove the separator between the content and actions.
          </p>
        </div>
      </Modal>
    );
  };

  const renderCustomWidthModal = () => {
    if (!showCustomWidthModal) return null;

    const actions = (
      <>
        <ButtonNormal
          variant="secondary"
          size="small"
          className="flex-1"
          onClick={() => setShowCustomWidthModal(false)}
        >
          Cancel
        </ButtonNormal>
        <ButtonNormal
          variant="primary"
          size="small"
          className="flex-1"
          onClick={() => setShowCustomWidthModal(false)}
        >
          Confirm
        </ButtonNormal>
      </>
    );

    return (
      <Modal
        onClose={() => setShowCustomWidthModal(false)}
        title="Custom Width Modal"
        subtitle="This modal has a custom width"
        icon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon.svg`}
        actions={actions}
        width="w-[640px]"
      >
        <div>
          <p style={{ color: colors['text-primary'] }}>
            This modal shows how to use the width prop to customize the width of the modal.
          </p>
        </div>
      </Modal>
    );
  };

  const exampleCode = `
// Basic usage
import Modal from '@/app/components/Modal';
import ButtonNormal from '@/app/components/ButtonNormal';

// Inside your component
const [showModal, setShowModal] = useState(false);

// Define your actions
const actions = (
  <>
    <ButtonNormal variant="secondary" size="small" onClick={() => setShowModal(false)}>
      Cancel
    </ButtonNormal>
    <ButtonNormal variant="primary" size="small" onClick={handleSubmit}>
      Confirm
    </ButtonNormal>
  </>
);

// Render the modal
{showModal && (
  <Modal
    onClose={() => setShowModal(false)}
    title="Modal Title"
    subtitle="Optional subtitle or description"
    icon="/path/to/icon.svg"
    actions={actions}
  >
    <div>
      {/* Your modal content here */}
    </div>
  </Modal>
)}
  `;

  return (
    <div className="p-6 max-w-4xl mx-auto" style={{ color: colors['text-primary'] }}>
      <h1 className="text-2xl font-bold mb-4">Modal Component Documentation</h1>
      
      <p className="mb-4">
        The Modal component is a reusable component that can be used as a base for all modals in the application.
        It provides a consistent layout and styling for modals, while allowing for customization of the content.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Props</h2>
      
      <div className="mb-6 overflow-x-auto">
        <table className="min-w-full border-collapse" style={{ borderColor: colors['border-secondary'] }}>
          <thead>
            <tr>
              <th className="p-2 border text-left" style={{ borderColor: colors['border-secondary'] }}>Prop</th>
              <th className="p-2 border text-left" style={{ borderColor: colors['border-secondary'] }}>Type</th>
              <th className="p-2 border text-left" style={{ borderColor: colors['border-secondary'] }}>Default</th>
              <th className="p-2 border text-left" style={{ borderColor: colors['border-secondary'] }}>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>onClose</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>() =&gt; void</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>required</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>Function to call when the modal is closed</td>
            </tr>
            <tr>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>title</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>string</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>required</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>The title of the modal</td>
            </tr>
            <tr>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>subtitle</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>string</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>undefined</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>Optional subtitle or description</td>
            </tr>
            <tr>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>icon</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>string | ReactNode</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>undefined</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>Optional icon to display (URL or component)</td>
            </tr>
            <tr>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>iconBackgroundColor</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>string</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>colors['bg-primary']</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>Background color for the icon container</td>
            </tr>
            <tr>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>iconBorderColor</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>string</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>colors['border-secondary']</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>Border color for the icon container</td>
            </tr>
            <tr>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>children</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>ReactNode</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>required</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>The content of the modal</td>
            </tr>
            <tr>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>actions</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>ReactNode</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>undefined</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>Optional footer actions (buttons)</td>
            </tr>
            <tr>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>className</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>string</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>' '</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>Additional CSS classes</td>
            </tr>
            <tr>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>width</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>string</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>'w-[480px]'</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>Width of the modal</td>
            </tr>
            <tr>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>showHeaderSeparator</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>boolean</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>false</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>Show separator between header and content</td>
            </tr>
            <tr>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>showActionsSeparator</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>boolean</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>true</td>
              <td className="p-2 border" style={{ borderColor: colors['border-secondary'] }}>Show separator between content and actions</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-2">Example Usage</h2>
      
      <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: colors['bg-secondary'] }}>
        <pre className="whitespace-pre-wrap text-sm" style={{ color: colors['text-primary'] }}>
          {exampleCode}
        </pre>
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-2">Live Examples</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-lg" style={{ backgroundColor: colors['bg-secondary'] }}>
          <h3 className="font-medium mb-2">Basic Modal</h3>
          <p className="text-sm mb-4" style={{ color: colors['text-secondary'] }}>
            A basic modal with title, subtitle, icon, and actions.
          </p>
          <ButtonNormal 
            variant="primary" 
            size="small" 
            onClick={() => setShowBasicModal(true)}
          >
            Open Basic Modal
          </ButtonNormal>
        </div>
        
        <div className="p-4 rounded-lg" style={{ backgroundColor: colors['bg-secondary'] }}>
          <h3 className="font-medium mb-2">Header Separator Modal</h3>
          <p className="text-sm mb-4" style={{ color: colors['text-secondary'] }}>
            A modal with a separator between the header and content.
          </p>
          <ButtonNormal 
            variant="primary" 
            size="small" 
            onClick={() => setShowHeaderSeparatorModal(true)}
          >
            Open Header Separator Modal
          </ButtonNormal>
        </div>
        
        <div className="p-4 rounded-lg" style={{ backgroundColor: colors['bg-secondary'] }}>
          <h3 className="font-medium mb-2">No Action Separator Modal</h3>
          <p className="text-sm mb-4" style={{ color: colors['text-secondary'] }}>
            A modal without a separator between the content and actions.
          </p>
          <ButtonNormal 
            variant="primary" 
            size="small" 
            onClick={() => setShowNoActionSeparatorModal(true)}
          >
            Open No Action Separator Modal
          </ButtonNormal>
        </div>
        
        <div className="p-4 rounded-lg" style={{ backgroundColor: colors['bg-secondary'] }}>
          <h3 className="font-medium mb-2">Custom Width Modal</h3>
          <p className="text-sm mb-4" style={{ color: colors['text-secondary'] }}>
            A modal with a custom width (640px instead of the default 480px).
          </p>
          <ButtonNormal 
            variant="primary" 
            size="small" 
            onClick={() => setShowCustomWidthModal(true)}
          >
            Open Custom Width Modal
          </ButtonNormal>
        </div>
      </div>

      {/* Render the modals */}
      {renderBasicModal()}
      {renderHeaderSeparatorModal()}
      {renderNoActionSeparatorModal()}
      {renderCustomWidthModal()}
    </div>
  );
};

export default ModalDocs; 