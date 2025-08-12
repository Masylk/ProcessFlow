import * as React from 'react';
import { ClientServiceSignature } from './signatures/CustomerServiceSignature';
import { JeanSignature } from './signatures/JeanSignature';
import { NoReplySignature } from './signatures/NoReplySignature';
import { SenderType } from '@/lib/email';

type EmailSignatureProps = {
  sender: SenderType;
  publicUrls?: {
    supabasePublicUrl?: string;
    supabaseStoragePath?: string;
    producthuntUrl?: string;
    linkedinUrl?: string;
    xUrl?: string;
    [key: string]: string | undefined;
  };
};

export const EmailSignature: React.FC<EmailSignatureProps> = ({ sender, publicUrls }) => {
  switch (sender) {
    case 'contact':
      return <ClientServiceSignature publicUrls={publicUrls} />;
    case 'jean':
      return <JeanSignature publicUrls={publicUrls} />;
    case 'noreply':
    default:
      return <NoReplySignature publicUrls={publicUrls} />;
  }
}; 