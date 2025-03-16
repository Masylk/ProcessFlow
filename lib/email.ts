import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import * as React from 'react';

// Create a transporter using SMTP configuration
const createTransporter = () => {
  // Check if required environment variables are set
  const requiredEnvVars = ['SMTP_SERVER', 'SMTP_PORT', 'SMTP_USERNAME', 'SMTP_PASSWORD'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.warn(`Missing email configuration: ${missingEnvVars.join(', ')}. Email functionality may not work properly.`);
  }
  
  return nodemailer.createTransport({
    host: process.env.SMTP_SERVER,
    port: Number(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

const transporter = createTransporter();

// Define sender types
export type SenderType = 'contact' | 'jean' | 'noreply';

// Define sender information
export const senders = {
  contact: {
    email: process.env.EMAIL_SENDER_CONTACT || 'contact@process-flow.io',
    name: 'ProcessFlow Client Service',
    signature: 'ClientServiceSignature',
  },
  jean: {
    email: process.env.EMAIL_SENDER_JEAN || 'jean@process-flow.io',
    name: 'Jean - ProcessFlow',
    signature: 'JeanSignature',
  },
  noreply: {
    email: process.env.EMAIL_SENDER_NOREPLY || 'noreply@process-flow.io',
    name: 'ProcessFlow',
    signature: 'NoReplySignature',
  },
};

type SendEmailProps = {
  to: string;
  subject: string;
  emailHtml: string;
  sender?: SenderType;
  from?: string; // Optional override
};

/**
 * Sends an email using nodemailer
 */
export async function sendEmail({ to, subject, emailHtml, sender = 'noreply', from }: SendEmailProps) {
  try {
    if (!to || !subject || !emailHtml) {
      throw new Error('Missing required email parameters: to, subject, or emailHtml');
    }
    
    const senderInfo = senders[sender];
    if (!senderInfo) {
      throw new Error(`Invalid sender type: ${sender}`);
    }
    
    const fromAddress = from || `"${senderInfo.name}" <${senderInfo.email}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html: emailHtml,
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
      },
      // Add these settings to help with image rendering
      attachDataUrls: true,
      disableFileAccess: true,
      disableUrlAccess: false,
    });

    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

/**
 * Helper function to render a React component to HTML and send it as an email
 */
export async function sendReactEmail<T extends object>({
  to,
  subject,
  Component,
  props,
  sender = 'noreply',
  from,
}: {
  to: string;
  subject: string;
  Component: React.ComponentType<T>;
  props: T;
  sender?: SenderType;
  from?: string;
}) {
  try {
    // Log environment variables for debugging (redacted for security)
    console.log('Email environment check:', {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
      storagePath: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH ? 'Set' : 'Not set',
      smtpServer: process.env.SMTP_SERVER ? 'Set' : 'Not set',
      productHuntUrl: process.env.NEXT_PUBLIC_PRODUCTHUNT_URL ? 'Set' : 'Not set',
      linkedinUrl: process.env.NEXT_PUBLIC_LINKEDIN_URL ? 'Set' : 'Not set',
      xUrl: process.env.NEXT_PUBLIC_X_URL ? 'Set' : 'Not set',
      g2Url: process.env.NEXT_PUBLIC_G2_URL ? 'Set' : 'Not set',
    });
    
    // Add the environment variables to props for use in the component
    const enhancedProps = {
      ...props,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_STORAGE_PATH: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH,
        NEXT_PUBLIC_PRODUCTHUNT_URL: process.env.NEXT_PUBLIC_PRODUCTHUNT_URL,
        NEXT_PUBLIC_LINKEDIN_URL: process.env.NEXT_PUBLIC_LINKEDIN_URL,
        NEXT_PUBLIC_X_URL: process.env.NEXT_PUBLIC_X_URL,
        NEXT_PUBLIC_G2_URL: process.env.NEXT_PUBLIC_G2_URL,
      },
    } as unknown as T;
    
    // Render the React component to HTML
    const emailHtml = await render(React.createElement(Component, enhancedProps));
    
    // Log a sample of the rendered HTML for debugging
    console.log('Rendered email HTML sample:', emailHtml.substring(0, 200) + '...');
    
    // Send the email
    return sendEmail({ to, subject, emailHtml, sender, from });
  } catch (error) {
    console.error('Error rendering or sending React email:', error);
    return { success: false, error };
  }
} 