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

type FeedbackRequestEmailProps = {
  firstName: string;
  feedbackLink: string;
  sender: SenderType;
  publicUrls?: {
    supabasePublicUrl?: string;
    supabaseStoragePath?: string;
    [key: string]: string | undefined;
  };
};

export const FeedbackRequestEmail: React.FC<FeedbackRequestEmailProps> = ({
  firstName,
  feedbackLink = 'https://tally.so/r/wkRej6',
  sender = 'jean',
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
            <Text>Hello {firstName},</Text>
            <Text>
              We hope everything is going well and you are getting a lot of value since you started using ProcessFlow! We'd love to hear your feedback on your experience so far.
            </Text>
            <Text>
              Your input helps us improve our product and better meet your needs.
            </Text>
            <Text>
              We designed this survey to be completed in less than 30 seconds - please beat us!
            </Text>
            
            <Section style={{ textAlign: 'center', margin: '32px 0' }}>
              <Button href={feedbackLink}>
                Make Your Voice Count
              </Button>
            </Section>
            
            <Text>
              Thank you in advance for your time and valuable contribution.
            </Text>
            
            <Text>
              We're always available if you have any further questions or suggestions!
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