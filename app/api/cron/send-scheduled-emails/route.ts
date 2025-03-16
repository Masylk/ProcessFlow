import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendReactEmail } from '@/lib/email';
import { FeatureUpdateEmail } from '@/emails/templates/ShareRoadmap';
import { WelcomeEmail } from '@/emails/templates/WelcomeEmail';
import { SenderType } from '@/lib/email';

// Define types for email templates
type EmailTemplateConfig = {
  Component: React.ComponentType<any>;
  subject: string;
  sender: SenderType;
};

// Map of email types to their corresponding templates and subjects
const EMAIL_TEMPLATES: Record<string, EmailTemplateConfig> = {
  'WELCOME': {
    Component: WelcomeEmail,
    subject: 'Welcome to ProcessFlow - Here\'s how to start decently',
    sender: 'jean',
  },
  'FEATURE_UPDATE': {
    Component: FeatureUpdateEmail,
    subject: 'Sneak peek: new ProcessFlow features you\'ll love',
    sender: 'jean',
  },
  // Add more email types as needed
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // Check for authorization header (optional, but recommended for security)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current time
    const now = new Date();
    
    // Find all scheduled emails that are due to be sent
    const scheduledEmails = await prisma.scheduled_email.findMany({
      where: {
        scheduled_for: {
          lte: now,
        },
        status: 'PENDING',
        sent: false,
      },
      include: {
        user: true,
      },
      take: 50, // Process in batches to avoid timeouts
    });

    console.log(`Found ${scheduledEmails.length} emails to send`);

    const results = [];

    // Process each scheduled email
    for (const email of scheduledEmails) {
      try {
        // Get the email template configuration
        const templateConfig = EMAIL_TEMPLATES[email.email_type];
        
        if (!templateConfig) {
          console.error(`Unknown email type: ${email.email_type}`);
          
          // Update the email status to FAILED
          await prisma.scheduled_email.update({
            where: { id: email.id },
            data: {
              status: 'FAILED',
              error: `Unknown email type: ${email.email_type}`,
              retry_count: email.retry_count + 1,
            },
          });
          
          results.push({ id: email.id, status: 'failed', reason: 'Unknown email type' });
          continue;
        }

        // Get the metadata from the scheduled email
        const metadata = email.metadata as Record<string, any> || {};
        
        // Send the email
        const sendResult = await sendReactEmail({
          to: email.user.email,
          subject: templateConfig.subject,
          Component: templateConfig.Component,
          props: {
            ...metadata,
            env: {
              NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
              NEXT_PUBLIC_SUPABASE_STORAGE_PATH: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH,
            },
          },
          sender: templateConfig.sender,
        });

        if (sendResult.success) {
          // Update the email status to SENT
          await prisma.scheduled_email.update({
            where: { id: email.id },
            data: {
              status: 'SENT',
              sent: true,
              sent_at: new Date(),
            },
          });
          
          results.push({ id: email.id, status: 'sent', messageId: sendResult.messageId });
        } else {
          // Update the email status to FAILED
          await prisma.scheduled_email.update({
            where: { id: email.id },
            data: {
              status: 'FAILED',
              error: String(sendResult.error),
              retry_count: email.retry_count + 1,
            },
          });
          
          results.push({ id: email.id, status: 'failed', reason: String(sendResult.error) });
        }
      } catch (error) {
        console.error(`Error processing scheduled email ${email.id}:`, error);
        
        // Update the email status to FAILED
        await prisma.scheduled_email.update({
          where: { id: email.id },
          data: {
            status: 'FAILED',
            error: error instanceof Error ? error.message : String(error),
            retry_count: email.retry_count + 1,
          },
        });
        
        results.push({ id: email.id, status: 'failed', reason: error instanceof Error ? error.message : String(error) });
      }
    }

    return NextResponse.json({
      success: true,
      processed: scheduledEmails.length,
      results,
    });
  } catch (error) {
    console.error('Error processing scheduled emails:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process scheduled emails' },
      { status: 500 }
    );
  }
} 