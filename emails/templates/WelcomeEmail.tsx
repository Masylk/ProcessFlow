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

type WelcomeEmailProps = {
  firstName: string;
  jeanRdvLink: string;
  sender: SenderType;
  env?: {
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_STORAGE_PATH?: string;
  };
};

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  firstName,
  jeanRdvLink,
  sender = 'jean',
  env,
}) => {
  // Construct the logo URL from environment variables or use a fallback
  const supabaseUrl = env?.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const storagePath = env?.NEXT_PUBLIC_SUPABASE_STORAGE_PATH || process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH || '';
  
  // Use a fallback image URL if the environment variables aren't available
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
            <Heading>Welcome to ProcessFlow! 🎉</Heading>
            <Text>Hello {firstName},</Text>
            <Text>We are thrilled to welcome you to ProcessFlow! 🎉</Text>
            <Text>
              As an early user, we're offering you 50% OFF for your first 6 months on the "Early Adopter" plan with this promo code: <strong>EARLYFLOW50</strong>
            </Text>
            
            <Heading level={2}>Need help getting started?</Heading>
            <Text>You can:</Text>
            <Text>
              - Hop on a call with founders of ProcessFlow
            </Text>
            <Text>
              - Join the Slack and ask immediately to us or our community!
            </Text>
            <Text>
              - In any other case, feel free to answer this email 🙂
            </Text>
            
            <Section style={{ textAlign: 'center', margin: '32px 0' }}>
              <Button href={jeanRdvLink}>
                Schedule a call with founders
              </Button>
            </Section>
            
            <Text>
              We are a small team that values close connections with our community, so do not hesitate to contact us!
            </Text>
            
            <Text>
              Looking forward to helping you create amazing process flows,
            </Text>
            
            {/* Add the appropriate signature based on sender */}
            <EmailSignature sender={sender} env={env} />
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