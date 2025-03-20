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

type CancellationFollowUpEmailProps = {
  firstName: string;
  feedbackLink: string;
  sender: SenderType;
  userId: string | number;
  publicUrls?: {
    supabasePublicUrl?: string;
    supabaseStoragePath?: string;
    [key: string]: string | undefined;
  };
};

export const CancellationFollowUpEmail: React.FC<CancellationFollowUpEmailProps> = ({
  firstName,
  feedbackLink = 'https://tally.so/r/woVeqM',
  sender = 'contact',
  userId,
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
            <Heading level={1}>We're sorry to see you go 😢</Heading>
            
            <Text>Hello {firstName},</Text>
            
            <Text>
              We are truly sorry to see you leave ProcessFlow. We understand that our users may have different reasons.
            </Text>
            
            <Text>
              Could you please let us know why you made this decision? It would help us improve our service and better serve other users who may have felt the same.
            </Text>
            
            <Section style={{ textAlign: 'center', margin: '32px 0' }}>
              <Button href={feedbackLink}>
                Help us improve
              </Button>
            </Section>
            
            <Text> 
              We sincerely thank you for the time you've spent with us and are available if you have any questions or would like to discuss further.
            </Text>
            
            <Text>Best regards,</Text>
            
            <EmailSignature sender={sender} publicUrls={publicUrls} />
          </Section>
          
          <Hr style={{ borderTop: '1px solid #e6e6e6', margin: '32px 0' }} />
          
          <Section style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: '14px', color: '#666' }}>
              © {new Date().getFullYear()} ProcessFlow. All rights reserved.
            </Text>
            <Text style={{ fontSize: '14px', color: '#666' }}>
              <Link href="https://process-flow.io" style={{ color: '#666', textDecoration: 'underline' }}>
                process-flow.io
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}; 