import * as React from 'react';
import { ClientServiceSignature } from './signatures/ClientServiceSignature';
import { JeanSignature } from './signatures/JeanSignature';
import { NoReplySignature } from './signatures/NoReplySignature';
import { SenderType } from '@/lib/email';

type EmailSignatureProps = {
  sender: SenderType;
  env?: {
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_STORAGE_PATH?: string;
  };
};

export const EmailSignature: React.FC<EmailSignatureProps> = ({ sender, env }) => {
  switch (sender) {
    case 'contact':
      return <ClientServiceSignature env={env} />;
    case 'jean':
      return <JeanSignature env={env} />;
    case 'noreply':
    default:
      return <NoReplySignature env={env} />;
  }
}; 