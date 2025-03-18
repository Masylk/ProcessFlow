import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Hr,
  Link,
  Img,
} from '@react-email/components';
import { Text } from '../components/Text';
import { Heading } from '../components/Heading';
import { Button } from '../components/Button';
import { EmailSignature } from '../components/EmailSignature';
import { CustomFont } from '../components/CustomFont';
import { SenderType } from '@/lib/email';

type ProcessLimitEmailProps = {
  firstName: string;
  sender: SenderType;
  publicUrls?: {
    supabasePublicUrl?: string;
    supabaseStoragePath?: string;
    [key: string]: string | undefined;
  };
  workspaceId?: number;
};

export const ProcessLimitEmail: React.FC<ProcessLimitEmailProps> = ({
  firstName,
  sender = 'contact',
  publicUrls = {},
  workspaceId,
}) => {
  // Construct the logo URL from public URLs or use a fallback
  const supabaseUrl = publicUrls.supabasePublicUrl || '';
  const storagePath = publicUrls.supabaseStoragePath || '';
  
  // Use a fallback image URL if the URLs aren't available
  const logoUrl = supabaseUrl && storagePath 
    ? `${supabaseUrl}${storagePath}/assets/logo/logo-pf-in-app.png`
    : 'https://via.placeholder.com/200x60?text=ProcessFlow';
    
  // URL to redirect to the user's workspace
  let upgradeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.process-flow.io'}/settings/billing`;
  
  // If we have a workspace ID, use that for the URL
  if (workspaceId) {
    upgradeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.process-flow.io'}/workspace/${workspaceId}`;
  }

  return (
    <Html>
      <Head>
        <CustomFont
          fontFamily="Inter"
          fallbackFontFamily={['system-ui', 'sans-serif']}
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Body style={{ fontFamily: 'Inter, system-ui, sans-serif', margin: 0, padding: 0, backgroundColor: '#f5f5f5' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', backgroundColor: '#ffffff', borderRadius: '8px' }}>
          {/* Logo Section */}
          <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Img
              src={logoUrl}
              alt="ProcessFlow Logo"
              width="180"
              height="auto"
              style={{
                margin: '0 auto',
                display: 'block',
              }}
            />
          </Section>
          
          <Section>
            <Heading>Process limit reached - Here's a tip to get more 😉</Heading>
            <Text>Hello {firstName},</Text>
            <Text>We noticed you've created 5 Flows in ProcessFlow - you're on fire ! 👏</Text>
            <Text>Your current plan has a limit of 5 Flows.</Text>
            
            <Text>To keep your momentum going, here are some options:</Text>
            
            <Text style={{ marginLeft: '20px' }}>
              1. <strong>Upgrade to Early Adopter</strong>: Get unlimited workflows, plus lock in a 50% discount for 6 months with the code <strong>EARLYFLOW50</strong>.
            </Text>
            <Text style={{ marginLeft: '20px' }}>
              2. <strong>Delete an existing workflow</strong>: Free up space to create something new
            </Text>
            
            <Section style={{ textAlign: 'center', margin: '32px 0' }}>
              <Button href={upgradeUrl}>
                Upgrade to Early Adopter
              </Button>
            </Section>
            
            <Text>
              Need help deciding what's best for your needs? We're happy to help! Just reply to this email for personalized assistance.
            </Text>
            
            <Text>
              Best regards,
            </Text>
            
            {/* Add the appropriate signature based on sender */}
            <EmailSignature sender={sender} publicUrls={publicUrls} />
          </Section>
          
          <Hr style={{ borderTop: '1px solid #e6e6e6', margin: '32px 0' }} />
          
          <Section style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: '14px', color: '#666' }}>
              © {new Date().getFullYear()} ProcessFlow. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}; 