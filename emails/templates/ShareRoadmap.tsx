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
import { SenderType } from '@/lib/email';
import { CustomFont } from '../components/CustomFont';

type FeatureUpdateEmailProps = {
  firstName: string;
  roadmapLink: string;
  sender?: SenderType;
  publicUrls?: {
    supabasePublicUrl?: string;
    supabaseStoragePath?: string;
    [key: string]: string | undefined;
  };
};

export const FeatureUpdateEmail: React.FC<FeatureUpdateEmailProps> = ({
  firstName,
  roadmapLink,
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
          fallbackFontFamily={["system-ui", "sans-serif"]}
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
            <Heading>Sneak peek: new ProcessFlow features you'll love</Heading>
            <Text>Hello {firstName},</Text>
            <Text>
              We are excited to share with you the next steps in our development journey. 🌟
            </Text>
            <Text>
              We are actively working to improve your experience and add new features. To stay informed about what's coming, check out our Development Roadmap!
            </Text>
            
            <Section style={{ textAlign: 'center', margin: '32px 0' }}>
              <Button href={roadmapLink}>
                Join our Roadmap
              </Button>
            </Section>
            
            <Text>
              On our roadmap, you'll see in real-time what the ProcessFlow team is working on.
            </Text>
            
            <Text>
              You can also contribute by voting for the features you find most useful.
            </Text>
            
            <Text>
              Your feedback is invaluable to us, so don't hesitate to let us know what could help you in your process creation.
            </Text>
            
            <Text>
              Talk to you soon,
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