import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { sendReactEmail } from '@/lib/email';
import { FeatureUpdateEmail } from '@/emails/templates/ShareRoadmap';
import { generateRoadmapLinkForEmail } from '@/lib/roadmapAuth';

// GET endpoint for easier testing via browser
export async function GET(request: Request) {
  try {
    // Only allow in development or staging environments
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { auth_id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate the roadmap link with authentication
    const roadmapLink = await generateRoadmapLinkForEmail(
      dbUser.id,
      dbUser.email,
      dbUser.first_name,
      dbUser.last_name,
      dbUser.avatar_url || undefined
    );

    // Get safe public URLs for email templates
    const safePublicUrls = {
      supabasePublicUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabaseStoragePath: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH || '',
      producthuntUrl: process.env.NEXT_PUBLIC_PRODUCTHUNT_URL || 'https://www.producthunt.com',
      linkedinUrl: process.env.NEXT_PUBLIC_LINKEDIN_URL || 'https://www.linkedin.com/company/processflow1/',
      xUrl: process.env.NEXT_PUBLIC_X_URL || 'https://x.com',
      g2Url: process.env.NEXT_PUBLIC_G2_URL || 'https://www.g2.com',
    };

    // Send the feature update email immediately
    const result = await sendReactEmail({
      to: dbUser.email,
      subject: 'Sneak peek: new ProcessFlow features you\'ll love',
      Component: FeatureUpdateEmail,
      props: {
        firstName: dbUser.first_name,
        roadmapLink,
        publicUrls: safePublicUrls,
      },
      sender: 'jean',
    });

    return NextResponse.json({ 
      success: result.success, 
      message: result.success ? 'Feature update email with logo sent successfully' : 'Failed to send feature update email',
      result,
    });
  } catch (error) {
    console.error('Error sending feature update email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send feature update email' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Only allow in development or staging environments
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { auth_id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate the roadmap link with authentication
    const roadmapLink = await generateRoadmapLinkForEmail(
      dbUser.id,
      dbUser.email,
      dbUser.first_name,
      dbUser.last_name,
      dbUser.avatar_url || undefined
    );

    // Get safe public URLs for email templates
    const safePublicUrls = {
      supabasePublicUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabaseStoragePath: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH || '',
      producthuntUrl: process.env.NEXT_PUBLIC_PRODUCTHUNT_URL || 'https://www.producthunt.com',
      linkedinUrl: process.env.NEXT_PUBLIC_LINKEDIN_URL || 'https://www.linkedin.com/company/processflow1/',
      xUrl: process.env.NEXT_PUBLIC_X_URL || 'https://x.com',
      g2Url: process.env.NEXT_PUBLIC_G2_URL || 'https://www.g2.com',
    };

    // Send the feature update email immediately
    const result = await sendReactEmail({
      to: dbUser.email,
      subject: 'Sneak peek: new ProcessFlow features you\'ll love',
      Component: FeatureUpdateEmail,
      props: {
        firstName: dbUser.first_name,
        roadmapLink,
        publicUrls: safePublicUrls,
      },
      sender: 'jean',
    });

    return NextResponse.json({ 
      success: result.success, 
      message: result.success ? 'Feature update email with logo sent successfully' : 'Failed to send feature update email',
      result,
    });
  } catch (error) {
    console.error('Error sending feature update email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send feature update email' },
      { status: 500 }
    );
  }
} 