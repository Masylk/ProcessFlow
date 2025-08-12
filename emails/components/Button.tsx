import * as React from 'react';
import { Button as EmailButton } from '@react-email/components';

type ButtonProps = {
  href: string;
  children: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({ href, children }) => {
  return (
    <EmailButton
      href={href}
      style={{
        backgroundColor: '#4e6bd7',
        borderRadius: '6px',
        color: '#fff',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '16px',
        fontWeight: 500,
        textDecoration: 'none',
        textAlign: 'center',
        display: 'inline-block',
        padding: '12px 20px',
      }}
    >
      {children}
    </EmailButton>
  );
}; 