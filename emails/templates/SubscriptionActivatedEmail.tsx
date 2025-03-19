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

type SubscriptionActivatedEmailProps = {
  firstName: string;
  sender?: SenderType;
  publicUrls?: {
    supabasePublicUrl?: string;
    supabaseStoragePath?: string;
    [key: string]: string | undefined;
  };
};

export const SubscriptionActivatedEmail: React.FC<SubscriptionActivatedEmailProps> = ({
  firstName,
  sender = 'contact',
  publicUrls = {},
}) => {
  // Construct the logo URL from public URLs or use a fallback
  const supabaseUrl = publicUrls.supabasePublicUrl || '';
  const storagePath = publicUrls.supabaseStoragePath || '';
  
  // Use a fallback image URL if the URLs aren't available
  const logoUrl = supabaseUrl && storagePath 
    ? `${supabaseUrl}${storagePath}/assets/logo/logo-pf-in-app.png`
    : 'https://via.placeholder.com/200x60?text=ProcessFlow';

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
            <Heading>ProcessFlow Early Adopter activated - Now, you're limitless 😎</Heading>
            <Text>Hello {firstName},</Text>
            <Text>Great news! Your ProcessFlow Early Adopter plan has been successfully activated. 🎉</Text>
            
            <Text>You can now:</Text>
            <Text>
              - Create unlimited process workflows
            </Text>
            <Text>
              - Branded process
            </Text>
            <Text>
              - Priority customer support
            </Text>
            
            <Text>
              As an Early Adopter, you're getting special access to new features before everyone else. We're thrilled to have you on board during this exciting phase!
            </Text>
            
            <Text>
              If you have any questions or need assistance getting started, just reply to this email. Our team is here to help you create amazing process guides.
            </Text>
            
            <Section style={{ textAlign: 'center', margin: '32px 0' }}>
              <Button href={process.env.NEXT_PUBLIC_APP_URL || 'https://app.process-flow.io'}>
                Ready to start building?
              </Button>
            </Section>
            
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

export default SubscriptionActivatedEmail; 