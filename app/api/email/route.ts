// app/api/email/route.ts
import { render } from '@react-email/render';
import WelcomeEmail from '@/app/emails/WelcomeEmail'; // Adjust the import path if needed
import { sendEmail } from '@/app/utils/mail'; // The utility function you already have

/**
 * @swagger
 * /api/email:
 *   post:
 *     summary: Send a welcome email
 *     description: Sends a welcome email to a new user using a predefined email template.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The recipient's email address.
 *                 example: "user@example.com"
 *               firstName:
 *                 type: string
 *                 description: The first name of the recipient.
 *                 example: "John"
 *     responses:
 *       200:
 *         description: Welcome email successfully sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Welcome email sent!"
 *       400:
 *         description: Missing required fields in the request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields: email, firstName"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
export async function POST(req: Request) {
  try {
    const { email, firstName } = await req.json();

    if (!email || !firstName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, firstName' }),
        { status: 400 }
      );
    }

    // Render the email content using the WelcomeEmail component
    const emailHtml = await render(WelcomeEmail({ firstName: firstName }));

    // Send the welcome email using the sendEmail utility
    const emailResponse = await sendEmail(
      email,
      'Bienvenue sur ProcessFlow!',
      emailHtml // Pass the rendered HTML from WelcomeEmail
    );

    if (emailResponse.success) {
      return new Response(
        JSON.stringify({ success: true, message: 'Welcome email sent!' }),
        { status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Failed to send welcome email' }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}
