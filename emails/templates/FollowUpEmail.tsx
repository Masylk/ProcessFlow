import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface FollowUpEmailProps {
  firstName: string;
  jeanRdvLink?: string;
  sender?: string;
}

export const FollowUpEmail = ({
  firstName = 'there',
  jeanRdvLink = 'https://cal.com/jean-willame-v2aevm/15min',
  sender = 'jean',
}: FollowUpEmailProps) => {
  const previewText = `How's your ProcessFlow experience so far?`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Heading style={h1}>How's your ProcessFlow experience so far?</Heading>
            
            <Text style={text}>
              Hi {firstName},
            </Text>
            
            <Text style={text}>
              It's been a few days since you started using ProcessFlow. I wanted to check in and see how things are going for you.
            </Text>
            
            <Text style={text}>
              Have you had a chance to create your first process? If you're facing any challenges or have questions, I'm here to help.
            </Text>
            
            <Text style={text}>
              Feel free to book a quick call with me if you'd like some personalized guidance:
            </Text>
            
            <Section style={buttonContainer}>
              <Link
                style={button}
                href={jeanRdvLink}
              >
                Book a 15-min call
              </Link>
            </Section>
            
            <Text style={text}>
              Looking forward to hearing from you!
            </Text>
            
            <Text style={signature}>
              Best regards,<br />
              {sender === 'jean' ? 'Jean' : 'The ProcessFlow Team'}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '5px',
  maxWidth: '600px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '16px 0',
  padding: '0 48px',
};

const text = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
  padding: '0 48px',
};

const buttonContainer = {
  padding: '0 48px',
  margin: '24px 0',
};

const button = {
  backgroundColor: '#5F6CAF',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
};

const signature = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
  padding: '0 48px',
  fontStyle: 'italic',
};

export default FollowUpEmail; 