import * as React from 'react';
import { Text as EmailText } from '@react-email/components';

type TextProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export const Text: React.FC<TextProps> = ({ children, style }) => {
  return (
    <EmailText
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '16px',
        lineHeight: '1.5',
        color: '#333',
        margin: '16px 0',
        ...style,
      }}
    >
      {children}
    </EmailText>
  );
}; 