import { NextResponse } from 'next/server';
import { sendReactEmail } from '@/lib/email';
import { FeatureUpdateEmail } from '@/emails/templates/ShareRoadmap';

export async function GET(request: Request) {
  try {
    // Only allow in development or staging environments
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    // Get the email from the query parameter or use a default
    const url = new URL(request.url);
    const email = url.searchParams.get('email') || process.env.TEST_EMAIL || 'your-email@example.com';
    
    // Use a mock roadmap link
    const roadmapLink = 'https://features.vote/processflow?token=test-token';

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
      to: email,
      subject: 'TEST: Sneak peek: new ProcessFlow features you\'ll love',
      Component: FeatureUpdateEmail,
      props: {
        firstName: 'Test User',
        roadmapLink,
        publicUrls: safePublicUrls,
      },
      sender: 'jean',
    });

    return NextResponse.json({ 
      success: result.success, 
      message: result.success ? `Feature update email with logo sent successfully to ${email}` : 'Failed to send feature update email',
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