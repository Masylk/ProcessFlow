import prisma from '@/lib/prisma';
import { scheduleFollowUpEmail } from '@/lib/scheduledEmails';
import { sendReactEmail } from '@/lib/email';
import { ProcessLimitEmail } from '@/emails/templates/ProcessLimitEmail';

const WORKFLOW_LIMIT = 5;
const COOLDOWN_DAYS = 4;
const EMAIL_TYPE = 'PROCESS_LIMIT_REACHED';

/**
 * Schedules and immediately sends a process limit email for a user with a cooldown period.
 * 
 * @param userId - The ID of the user to send the email to
 * @returns Object indicating if the email was scheduled/sent and why
 */
export async function checkAndScheduleProcessLimitEmail(userId: number) {
  try {
    // Get the user to confirm they exist
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        // Include active_workspace to get the workspace ID
        active_workspace: true
      }
    });

    if (!user) {
      return { success: false, reason: 'User not found' };
    }
    
    // Get the workspace ID (either from active workspace or from workspaces)
    let workspaceId = user.active_workspace_id;
    
    // If user doesn't have an active workspace, try to find one
    if (!workspaceId) {
      const userWorkspace = await prisma.user_workspace.findFirst({
        where: { user_id: userId },
        select: { workspace_id: true },
        orderBy: { workspace_id: 'asc' }
      });
      
      if (userWorkspace) {
        workspaceId = userWorkspace.workspace_id;
      }
    }

    // Check if we've already sent this email recently (within cooldown period)
    const recentEmail = await prisma.scheduled_email.findFirst({
      where: {
        user_id: userId,
        email_type: EMAIL_TYPE,
        OR: [
          // Either pending emails
          { status: 'PENDING' },
          // Or recently sent emails within cooldown period
          {
            status: 'SENT',
            sent_at: {
              gt: new Date(Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000)
            }
          }
        ]
      }
    });

    if (recentEmail) {
      return { 
        success: false, 
        reason: `Process limit email already sent or pending within cooldown period (${COOLDOWN_DAYS} days)`,
        emailId: recentEmail.id
      };
    }

    // Prepare metadata with workspace ID if available
    const metadata = workspaceId ? { workspaceId } : {};

    // 1. Create a record in the scheduled_email table (for cooldown tracking)
    const now = new Date();
    const scheduledEmail = await prisma.scheduled_email.create({
      data: {
        user_id: userId,
        email_type: EMAIL_TYPE,
        scheduled_for: now,
        status: 'PENDING',
        metadata,
      }
    });

    // 2. Now, immediately send the email instead of waiting for the cron job
    try {
      // Get public URLs for the email template
      const safePublicUrls = {
        supabasePublicUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseStoragePath: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH || '',
        producthuntUrl: process.env.NEXT_PUBLIC_PRODUCTHUNT_URL || 'https://www.producthunt.com',
        linkedinUrl: process.env.NEXT_PUBLIC_LINKEDIN_URL || 'https://www.linkedin.com/company/processflow1/',
        xUrl: process.env.NEXT_PUBLIC_X_URL || 'https://x.com',
      };

      // Send the email immediately
      const sendResult = await sendReactEmail({
        to: user.email,
        subject: 'Process limit reached - Here\'s a tip to get more 😉',
        Component: ProcessLimitEmail,
        props: {
          firstName: user.first_name,
          publicUrls: safePublicUrls,
          sender: 'jean',
          workspaceId: workspaceId || undefined,
        },
        sender: 'jean',
      });

      // Update the scheduled email record
      if (sendResult.success) {
        await prisma.scheduled_email.update({
          where: { id: scheduledEmail.id },
          data: {
            status: 'SENT',
            sent: true,
            sent_at: new Date(),
          },
        });
        
        return { 
          success: true, 
          reason: 'Process limit email sent immediately',
          scheduledEmailId: scheduledEmail.id,
          messageId: sendResult.messageId
        };
      } else {
        // If sending fails, leave the record as is for the cron job to retry
        console.error(`Failed to send process limit email: ${sendResult.error}`);
        
        return { 
          success: false, 
          reason: 'Failed to send email immediately, will retry via cron',
          scheduledEmailId: scheduledEmail.id,
          error: sendResult.error
        };
      }
    } catch (sendError) {
      console.error('Error sending process limit email:', sendError);
      return { 
        success: false, 
        reason: 'Error sending immediate email, will retry via cron',
        scheduledEmailId: scheduledEmail.id,
        error: sendError
      };
    }
  } catch (error) {
    console.error('Error scheduling process limit email:', error);
    return { success: false, error };
  }
} 