import { sendReactEmail } from '@/lib/email';
import { FeedbackRequestEmail } from '@/emails/templates/FeedbackRequestEmail';

type SendFeedbackRequestEmailProps = {
  email: string;
  firstName: string;
  feedbackLink?: string;
};

/**
 * Sends a feedback request email to a user
 * 
 * Trigger condition: D+7 after "Welcome Email" send. User must have created at least one Flow.
 * 
 * @param email - The recipient's email address
 * @param firstName - The recipient's first name
 * @param feedbackLink - Optional custom feedback link (defaults to Tally.so form)
 * @returns A promise that resolves to the result of sending the email
 */
export async function sendFeedbackRequestEmail({
  email,
  firstName,
  feedbackLink = 'https://tally.so/r/wkRej6',
}: SendFeedbackRequestEmailProps) {
  if (!email || !firstName) {
    console.error('Missing required parameters for feedback request email');
    return { success: false, error: 'Missing required parameters' };
  }

  try {
    return await sendReactEmail({
      to: email,
      subject: 'How is your experience with ProcessFlow going? 😊',
      Component: FeedbackRequestEmail,
      props: {
        firstName,
        feedbackLink,
        sender: 'jean',
      },
    });
  } catch (error) {
    console.error('Error sending feedback request email:', error);
    return { success: false, error };
  }
} 