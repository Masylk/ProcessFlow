import * as React from 'react';
import { Heading as EmailHeading } from '@react-email/components';

type HeadingProps = {
  children: React.ReactNode;
  level?: 1 | 2 | 3;
};

export const Heading: React.FC<HeadingProps> = ({ children, level = 1 }) => {
  const fontSize = level === 1 ? '24px' : level === 2 ? '20px' : '18px';
  
  return (
    <EmailHeading
      as={`h${level}`}
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize,
        fontWeight: 600,
        color: '#111',
        margin: '24px 0 16px',
      }}
    >
      {children}
    </EmailHeading>
  );
}; 