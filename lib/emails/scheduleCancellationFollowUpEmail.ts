import prisma from '@/lib/prisma';
import { sendReactEmail } from '@/lib/email';
import { CancellationFollowUpEmail } from '@/emails/templates/CancellationFollowUpEmail';
import { isVercel } from '@/app/api/utils/isVercel';
import { PrismaClient } from '@prisma/client';

const EMAIL_TYPE = 'CANCELLATION_FOLLOW_UP';

export async function scheduleCancellationFollowUpEmail(userId: number) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    // Get user information
    const user = await prisma_client.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check if we've already scheduled this email for this user
    const recentEmail = await prisma_client.scheduled_email.findFirst({
      where: {
        user_id: userId,
        email_type: EMAIL_TYPE,
        status: { in: ['PENDING', 'SENT'] },
      },
    });

    if (recentEmail) {
      return { 
        success: false, 
        reason: `Cancellation follow-up email already sent or pending`,
        emailId: recentEmail.id
      };
    }

    // Generate feedback link with userId
    const feedbackLink = `https://tally.so/r/woVeqM?userId=${userId}`;

    // Schedule the email for 1 day after cancellation
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 1); // D+1

    // Create the scheduled email record
    const scheduledEmail = await prisma_client.scheduled_email.create({
      data: {
        user_id: userId,
        email_type: EMAIL_TYPE,
        scheduled_for: scheduledDate,
        status: 'PENDING',
        metadata: {
          feedbackLink: feedbackLink
        }
      }
    });

    return { 
      success: true, 
      message: `Cancellation follow-up email scheduled for ${scheduledDate.toISOString()}`,
      emailId: scheduledEmail.id
    };
  } catch (error) {
    console.error('Error scheduling cancellation follow-up email:', error);
    return { success: false, error };
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
} 