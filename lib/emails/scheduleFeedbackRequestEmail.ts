import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { scheduleFollowUpEmail } from '@/lib/scheduledEmails';
import { isVercel } from '@/app/api/utils/isVercel';

/**
 * Schedule a feedback request email to be sent 7 days after welcome email
 * Only sends if the user has created at least one flow
 * 
 * @param userId - The user's ID
 * @returns A promise that resolves to the result of scheduling the email
 */
export async function scheduleFeedbackRequestEmail(userId: number) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    if (!userId) {
      console.error('Missing required userId for scheduling feedback request email');
      return { success: false, error: 'Missing required userId' };
    }

    // Check if a feedback request email is already scheduled for this user
    const existingScheduledEmail = await prisma_client.scheduled_email.findFirst({
      where: {
        user_id: userId,
        email_type: 'FEEDBACK_REQUEST',
        status: 'PENDING',
        sent: false,
      },
    });

    if (isVercel()) await prisma_client.$disconnect();

    if (existingScheduledEmail) {
      return { success: true, scheduledEmailId: existingScheduledEmail.id };
    }

    // Schedule the email for 7 days after now
    const result = await scheduleFollowUpEmail({
      userId,
      emailType: 'FEEDBACK_REQUEST',
      daysAfter: 7,
      metadata: {
        // We'll fetch the user's details at send time
        // This is just a flag to check for flows before sending
        requiresFlowCheck: true,
      },
    });

    if (!result.success) {
      console.error('Failed to schedule feedback request email:', result.error);
      return { success: false, error: result.error };
    }

    return { success: true, scheduledEmailId: result.scheduledEmailId };
  } catch (error) {
    console.error('Error scheduling feedback request email:', error);
    return { success: false, error };
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
} 