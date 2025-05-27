import { NextResponse } from 'next/server';
import { sendReactEmail } from '@/lib/email';
import SubscriptionActivatedEmail from '@/emails/templates/SubscriptionActivatedEmail';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

/**
 * @swagger
 * /api/email/subscription-activated:
 *   post:
 *     summary: Send a subscription activated email
 *     description: Sends an email notification when a user's Early Adopter subscription is activated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: number
 *                 description: The ID of the user who activated the subscription
 *                 example: 1
 *               workspaceId:
 *                 type: number
 *                 description: The ID of the workspace with the activated subscription
 *                 example: 1
 *     responses:
 *       200:
 *         description: Subscription activated email successfully sent
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
 *                   example: "Subscription activated email sent!"
 *       400:
 *         description: Missing required fields in the request
 *       404:
 *         description: User or workspace not found
 *       500:
 *         description: Internal server error
 */
export async function POST(req: Request) {
  // Choose the correct Prisma client
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  try {
    const { userId, workspaceId } = await req.json();

    if (!userId || !workspaceId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, workspaceId' },
        { status: 400 }
      );
    }

    // Get user information
    const user = await prisma_client.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get workspace and subscription information
    const workspace = await prisma_client.workspace.findUnique({
      where: { id: workspaceId },
      include: { subscription: true },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Verify this is an Early Adopter subscription
    if (!workspace.subscription || workspace.subscription.plan_type !== 'EARLY_ADOPTER') {
      return NextResponse.json(
        { error: 'Not an Early Adopter subscription' },
        { status: 400 }
      );
    }

    // Check if we already have a scheduled email for this user and type
    const existingEmail = await prisma_client.scheduled_email.findFirst({
      where: {
        user_id: userId,
        email_type: 'SUBSCRIPTION_ACTIVATED',
        status: 'SENT',
      },
    });

    if (existingEmail) {
      return NextResponse.json(
        { message: 'Subscription activated email already sent to this user' },
        { status: 200 }
      );
    }

    // Send the email
    const emailResult = await sendReactEmail({
      to: user.email,
      subject: 'ProcessFlow Early Adopter activated - Now, you\'re limitless 😎',
      Component: SubscriptionActivatedEmail,
      props: {
        firstName: user.first_name,
      },
      sender: 'contact',
    });

    if (emailResult.success) {
      // Record the email as sent in the scheduled_email table
      await prisma_client.scheduled_email.create({
        data: {
          user_id: userId,
          email_type: 'SUBSCRIPTION_ACTIVATED',
          scheduled_for: new Date(),
          status: 'SENT',
          sent: true,
          sent_at: new Date(),
          metadata: {
            workspaceId,
            subscriptionId: workspace.subscription_id,
          },
        },
      });

      return NextResponse.json(
        { success: true, message: 'Subscription activated email sent!' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send subscription activated email', details: emailResult.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error sending subscription activated email:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
} 