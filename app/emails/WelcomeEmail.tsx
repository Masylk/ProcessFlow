import React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
} from '@react-email/components';

interface WelcomeEmailProps {
  firstName: string;
}

export default function WelcomeEmail({ firstName }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenue sur ProcessFlow!</Preview>
      <Body style={{ backgroundColor: '#f4f4f4', padding: '20px' }}>
        <Container
          style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px',
            margin: 'auto',
          }}
        >
          <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>
            Bonjour {firstName}, 👋
          </Text>
          <Text style={{ fontSize: '16px', lineHeight: '1.5' }}>
            Bienvenue sur <strong>ProcessFlow</strong> ! Nous sommes ravis de
            vous compter parmi nous.
          </Text>
          <Text style={{ fontSize: '16px', lineHeight: '1.5' }}>
            N'hésitez pas à explorer notre plateforme et à nous contacter si
            vous avez des questions.
          </Text>
          <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>
            🚀 À bientôt,
            <br /> L'équipe ProcessFlow
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
