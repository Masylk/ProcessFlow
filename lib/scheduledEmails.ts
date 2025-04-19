import prisma from '@/lib/prisma';
import { SenderType } from '@/lib/email';
import { generateRoadmapLinkForEmail } from '@/lib/roadmapAuth';

type ScheduleEmailProps = {
  userId: number;
  emailType: string;
  scheduledFor: Date;
  metadata?: Record<string, any>;
};

/**
 * Schedule an email to be sent at a later time
 */
export async function scheduleEmail({
  userId,
  emailType,
  scheduledFor,
  metadata = {},
}: ScheduleEmailProps) {
  try {
    // If this is a FEATURE_UPDATE email, we need to generate a roadmap link
    if (emailType === 'FEATURE_UPDATE' && !metadata.roadmapLink) {
      try {
        // Get the user from the database
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            avatar_url: true,
          },
        });

        if (user) {
          // Generate the roadmap link
          const roadmapLink = await generateRoadmapLinkForEmail(
            user.id,
            user.email,
            user.first_name,
            user.last_name,
            user.avatar_url || undefined
          );

          // Add the roadmap link to the metadata
          metadata.roadmapLink = roadmapLink;
        }
      } catch (error) {
        console.error('Error generating roadmap link:', error);
        // Use a fallback link if generation fails
        metadata.roadmapLink = 'https://processflow.features.vote/roadmap';
      }
    }

    const scheduledEmail = await prisma.scheduled_email.create({
      data: {
        user_id: userId,
        email_type: emailType,
        scheduled_for: scheduledFor,
        metadata: metadata,
      },
    });
    
    console.log(`Email scheduled: ${scheduledEmail.id} for user ${userId} at ${scheduledFor}`);
    return { success: true, scheduledEmailId: scheduledEmail.id };
  } catch (error) {
    console.error('Error scheduling email:', error);
    return { success: false, error };
  }
}

/**
 * Schedule a follow-up email to be sent after a specified number of days
 */
export async function scheduleFollowUpEmail({
  userId,
  emailType,
  daysAfter,
  metadata = {},
}: Omit<ScheduleEmailProps, 'scheduledFor'> & { daysAfter: number }) {
  const scheduledFor = new Date();
  scheduledFor.setDate(scheduledFor.getDate() + daysAfter);
  
  return scheduleEmail({
    userId,
    emailType,
    scheduledFor,
    metadata,
  });
}

/**
 * For testing: Schedule an email to be sent after a specified number of minutes
 */
export async function scheduleTestEmail({
  userId,
  emailType,
  minutesAfter,
  metadata = {},
}: Omit<ScheduleEmailProps, 'scheduledFor'> & { minutesAfter: number }) {
  const scheduledFor = new Date();
  scheduledFor.setMinutes(scheduledFor.getMinutes() + minutesAfter);
  
  return scheduleEmail({
    userId,
    emailType,
    scheduledFor,
    metadata,
  });
} 