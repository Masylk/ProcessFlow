'use client';

import React from 'react';
import ButtonCTA from '../components/ButtonCTA';
import WorkflowHeader from '../workspace/[id]/[workflowId]/components/WorkflowHeader';

const HomePage: React.FC = () => {
  return (
    <div className="p-4">
      <ButtonCTA disabled={true} onClick={() => alert('Button clicked!')}>
        Button CTA
      </ButtonCTA>
      <ButtonCTA onClick={() => alert('Button clicked!')}>Button CTA</ButtonCTA>
      <WorkflowHeader></WorkflowHeader>
    </div>
  );
};

export default HomePage;
