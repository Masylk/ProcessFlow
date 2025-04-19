import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendReactEmail } from '@/lib/email';
import { FeatureUpdateEmail } from '@/emails/templates/ShareRoadmap';
import { WelcomeEmail } from '@/emails/templates/WelcomeEmail';
import { FeedbackRequestEmail } from '@/emails/templates/FeedbackRequestEmail';
import { ProcessLimitEmail } from '@/emails/templates/ProcessLimitEmail';
import { SenderType } from '@/lib/email';
import { CancellationFollowUpEmail } from '@/emails/templates/CancellationFollowUpEmail';

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
  'FEEDBACK_REQUEST': {
    Component: FeedbackRequestEmail,
    subject: 'How is your experience with ProcessFlow going? 😊',
    sender: 'jean',
  },
  'PROCESS_LIMIT_REACHED': {
    Component: ProcessLimitEmail,
    subject: 'Process limit reached - Here\'s a tip to get more 😉',
    sender: 'contact',
  },
  'CANCELLATION_FOLLOW_UP': {
    Component: CancellationFollowUpEmail,
    subject: "We're sorry to see you go 😢",
    sender: 'contact',
  },
  // Add more email types as needed
};

// Function to get only the whitelisted public URLs needed for emails
function getSafePublicUrls() {
  // Only include public-facing URLs that are needed for email templates
  return {
    supabasePublicUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseStoragePath: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH || '',
    // Add social media URLs
    producthuntUrl: process.env.NEXT_PUBLIC_PRODUCTHUNT_URL || 'https://www.producthunt.com',
    linkedinUrl: process.env.NEXT_PUBLIC_LINKEDIN_URL || 'https://www.linkedin.com/company/processflow1/',
    xUrl: process.env.NEXT_PUBLIC_X_URL || 'https://x.com',
    g2Url: process.env.NEXT_PUBLIC_G2_URL || 'https://www.g2.com',
  };
}

// Constants for retry mechanism
const MAX_RETRY_COUNT = 5;
const RETRY_DELAY_BASE_MINUTES = 15; // Base delay in minutes

// Calculate next retry time with exponential backoff
function calculateNextRetryTime(retryCount: number): Date {
  // Exponential backoff: 15min, 30min, 1h, 2h, 4h
  const delayMinutes = RETRY_DELAY_BASE_MINUTES * Math.pow(2, retryCount);
  const nextRetry = new Date();
  nextRetry.setMinutes(nextRetry.getMinutes() + delayMinutes);
  return nextRetry;
}

// Check if a user has created at least one flow
async function hasUserCreatedFlow(userId: number): Promise<boolean> {
  try {
    // Count workflows in workspaces where the user is a member
    const userWorkspaces = await prisma.user_workspace.findMany({
      where: {
        user_id: userId,
      },
      select: {
        workspace_id: true,
      },
    });

    const workspaceIds = userWorkspaces.map(uw => uw.workspace_id);
    
    // Count workflows in these workspaces
    const workflowCount = await prisma.workflow.count({
      where: {
        workspace_id: {
          in: workspaceIds,
        },
      },
    });

    return workflowCount > 0;
  } catch (error) {
    console.error(`Error checking if user ${userId} has created flows:`, error);
    // Default to false if there's an error
    return false;
  }
}

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
    
    // Log process limit emails specifically
    const processLimitEmails = scheduledEmails.filter(email => email.email_type === 'PROCESS_LIMIT_REACHED');
    if (processLimitEmails.length > 0) {
      console.log(`Found ${processLimitEmails.length} PROCESS_LIMIT_REACHED emails to send`);
    }

    const results = [];
    
    // Get safe public URLs for email templates
    const safePublicUrls = getSafePublicUrls();

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
        
        // Special handling for FEEDBACK_REQUEST emails
        if (email.email_type === 'FEEDBACK_REQUEST' && metadata.requiresFlowCheck) {
          // Check if the user has created at least one flow
          const hasCreatedFlow = await hasUserCreatedFlow(email.user_id);
          
          if (!hasCreatedFlow) {
            // User hasn't created a flow yet, so don't send the email
            // Mark as cancelled instead of failed
            await prisma.scheduled_email.update({
              where: { id: email.id },
              data: {
                status: 'CANCELLED',
                error: 'User has not created any flows yet',
              },
            });
            
            results.push({ 
              id: email.id, 
              status: 'cancelled', 
              reason: 'User has not created any flows yet' 
            });
            
            console.log(`Feedback request email ${email.id} cancelled: User ${email.user_id} has not created any flows`);
            continue;
          }
          
          // User has created flows, so we can proceed with sending the email
          console.log(`User ${email.user_id} has created flows, proceeding with feedback request email`);
        }
        
        // Special logging for PROCESS_LIMIT_REACHED emails
        if (email.email_type === 'PROCESS_LIMIT_REACHED') {
          console.log(`Processing PROCESS_LIMIT_REACHED email for user: ${email.user.email}`);
        }
        
        // Send the email
        const sendResult = await sendReactEmail({
          to: email.user.email,
          subject: templateConfig.subject,
          Component: templateConfig.Component,
          props: {
            ...metadata,
            firstName: email.user.first_name,
            // Pass only the safe public URLs instead of raw environment variables
            publicUrls: safePublicUrls,
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
          
          if (email.email_type === 'PROCESS_LIMIT_REACHED') {
            console.log(`Successfully sent PROCESS_LIMIT_REACHED email to ${email.user.email}`);
          }
        } else {
          // Handle failed email with retry mechanism
          const newRetryCount = email.retry_count + 1;
          
          if (newRetryCount >= MAX_RETRY_COUNT) {
            // Max retries reached, mark as permanently failed
            await prisma.scheduled_email.update({
              where: { id: email.id },
              data: {
                status: 'FAILED',
                error: `Failed after ${MAX_RETRY_COUNT} attempts. Last error: ${String(sendResult.error)}`,
                retry_count: newRetryCount,
              },
            });
            
            results.push({ 
              id: email.id, 
              status: 'permanently_failed', 
              reason: `Max retry count (${MAX_RETRY_COUNT}) reached. Last error: ${String(sendResult.error)}` 
            });
          } else {
            // Calculate next retry time with exponential backoff
            const nextRetryTime = calculateNextRetryTime(newRetryCount - 1);
            
            // Update for retry
            await prisma.scheduled_email.update({
              where: { id: email.id },
              data: {
                status: 'PENDING', // Keep as pending for next attempt
                error: String(sendResult.error),
                retry_count: newRetryCount,
                scheduled_for: nextRetryTime, // Reschedule with backoff
              },
            });
            
            results.push({ 
              id: email.id, 
              status: 'retry_scheduled', 
              reason: String(sendResult.error),
              nextRetry: nextRetryTime,
              attemptNumber: newRetryCount
            });
            
            console.log(`Scheduled retry #${newRetryCount} for email ${email.id} at ${nextRetryTime}`);
          }
        }
      } catch (error) {
        // Handle unexpected errors with retry mechanism
        const newRetryCount = email.retry_count + 1;
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (newRetryCount >= MAX_RETRY_COUNT) {
          // Max retries reached, mark as permanently failed
          await prisma.scheduled_email.update({
            where: { id: email.id },
            data: {
              status: 'FAILED',
              error: `Failed after ${MAX_RETRY_COUNT} attempts due to exception: ${errorMessage}`,
              retry_count: newRetryCount,
            },
          });
          
          results.push({ 
            id: email.id, 
            status: 'permanently_failed', 
            reason: `Max retry count (${MAX_RETRY_COUNT}) reached. Error: ${errorMessage}` 
          });
        } else {
          // Calculate next retry time with exponential backoff
          const nextRetryTime = calculateNextRetryTime(newRetryCount - 1);
          
          // Update for retry
          await prisma.scheduled_email.update({
            where: { id: email.id },
            data: {
              status: 'PENDING', // Keep as pending for next attempt
              error: errorMessage,
              retry_count: newRetryCount,
              scheduled_for: nextRetryTime, // Reschedule with backoff
            },
          });
          
          results.push({ 
            id: email.id, 
            status: 'retry_scheduled', 
            reason: errorMessage,
            nextRetry: nextRetryTime,
            attemptNumber: newRetryCount
          });
          
          console.log(`Scheduled retry #${newRetryCount} for email ${email.id} at ${nextRetryTime} after error: ${errorMessage}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: scheduledEmails.length,
      results,
    });
  } catch (error) {
    console.error('Error processing scheduled emails:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 