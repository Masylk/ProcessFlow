import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// Import the email components and utility
import { sendReactEmail } from '@/lib/email';
import { WelcomeEmail } from '@/emails/templates/WelcomeEmail';
import { scheduleFollowUpEmail, scheduleTestEmail } from '@/lib/scheduledEmails';
import { scheduleFeedbackRequestEmail } from '@/lib/emails/scheduleFeedbackRequestEmail';
import { checkWorkspaceName } from '@/app/utils/checkNames';

// Define the EmailScheduleResponse interface and necessary functions inline
interface EmailScheduleResponse {
  success: boolean;
  error?: any;
  warnings?: {
    welcomeEmail?: any;
    followUpEmail?: any;
    feedbackEmail?: any;
    emailError?: any;
  } | null;
}

// Implementation of scheduleOnboardingFollowUpEmail (renamed to avoid conflict)
async function scheduleOnboardingFollowUpEmail(userId: number): Promise<EmailScheduleResponse> {
  try {
    // Get the user from the database to get their email and name
    // This is a placeholder - in a real implementation, you would fetch the user
    // const user = await prisma.user.findUnique({ where: { id: userId } });
    
    // For now, we'll just simulate scheduling the email
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 4); // 4 days from now
    
    // Schedule the follow-up email
    const result = await scheduleEmail(userId, EmailType.FOLLOW_UP, scheduledDate);
    
    if (!result.success) {
      console.error('Failed to schedule follow-up email:', result.error);
      return { success: false, error: result.error };
    }
    
    console.log(`Follow-up email scheduled for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error('Error scheduling follow-up email:', error);
    return { success: false, error };
  }
}

// Enum for email types
enum EmailType {
  WELCOME = 'WELCOME',
  FOLLOW_UP = 'FOLLOW_UP',
}

// Implementation of scheduleEmail
async function scheduleEmail(
  userId: number,
  emailType: EmailType,
  scheduledDate: Date
): Promise<EmailScheduleResponse> {
  try {
    // Here you would implement the actual email scheduling logic
    // This could involve creating a record in a database table for scheduled emails
    // that a cron job would pick up and process
    
    // For now, we'll just simulate success
    console.log(`Email of type ${emailType} scheduled for user ${userId} at ${scheduledDate}`);
    
    return { success: true };
  } catch (error) {
    console.error(`Failed to schedule ${emailType} email:`, error);
    return { success: false, error };
  }
}

/**
 * Helper function to send welcome email with proper error handling
 */
async function sendWelcomeEmailToUser(email: string, firstName: string): Promise<{ success: boolean; error?: any }> {
  try {
    // Get safe public URLs for email templates
    const safePublicUrls = {
      supabasePublicUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabaseStoragePath: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH || '',
      producthuntUrl: process.env.NEXT_PUBLIC_PRODUCTHUNT_URL || 'https://www.producthunt.com',
      linkedinUrl: process.env.NEXT_PUBLIC_LINKEDIN_URL || 'https://www.linkedin.com/company/processflow1/',
      xUrl: process.env.NEXT_PUBLIC_X_URL || 'https://x.com',
      g2Url: process.env.NEXT_PUBLIC_G2_URL || 'https://www.g2.com',
    };

    const result = await sendReactEmail({
      to: email,
      subject: 'Welcome to ProcessFlow - Here\'s how to start decently',
      Component: WelcomeEmail,
      props: {
        firstName: firstName,
        jeanRdvLink: process.env.JEAN_RDV_LINK || 'https://cal.com/jean-willame-v2aevm/15min',
        sender: 'jean',
        publicUrls: safePublicUrls,
      },
      sender: 'jean',
    });

    if (!result.success) {
      console.error('Failed to send welcome email:', result.error);
      return { success: false, error: result.error };
    }

    console.log(`Welcome email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}

/**
 * Helper function to schedule onboarding emails with proper error handling
 */
async function scheduleOnboardingEmails(userId: number, firstName: string, email: string): Promise<EmailScheduleResponse> {
  try {
    // Send welcome email right away
    const welcomeResult = await sendWelcomeEmailToUser(email, firstName);
    
    if (!welcomeResult.success) {
      // Log the error but continue with onboarding
      console.error('Failed to send welcome email, but continuing with onboarding:', welcomeResult.error);
    }
    
    // Schedule follow-up email for 4 days later
    const followUpResult = await scheduleOnboardingFollowUpEmail(userId);
    
    if (!followUpResult.success) {
      // Log the error but continue with onboarding
      console.error('Failed to schedule follow-up email, but continuing with onboarding:', followUpResult.error);
    }
    
    // Schedule feedback request email for 7 days later
    // NOTE: This is the ONLY place where feedback request emails should be scheduled
    // The scheduleFeedbackRequestEmail function has duplicate prevention built-in
    const feedbackResult = await scheduleFeedbackRequestEmail(userId);
    
    if (!feedbackResult.success) {
      // Log the error but continue with onboarding
      console.error('Failed to schedule feedback request email, but continuing with onboarding:', feedbackResult.error);
    }
    
    return { 
      success: true,
      // Include warnings if any email operations failed
      warnings: !welcomeResult.success || !followUpResult.success || !feedbackResult.success ? {
        welcomeEmail: welcomeResult.success ? null : welcomeResult.error,
        followUpEmail: followUpResult.success ? null : followUpResult.error,
        feedbackEmail: feedbackResult.success ? null : feedbackResult.error,
      } : null
    };
  } catch (error) {
    console.error('Error scheduling onboarding emails:', error);
    // Return success true because we want onboarding to continue even if emails fail
    return { 
      success: true, 
      warnings: { emailError: error }
    };
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if the request is multipart/form-data or JSON
    const contentType = request.headers.get('content-type');
    let step: string;
    let formData: any;

    if (contentType?.includes('multipart/form-data')) {
      // Handle multipart/form-data (with file)
      const requestFormData = await request.formData();
      step = requestFormData.get('step') as string;
      
      // Get JSON data
      const dataString = requestFormData.get('data') as string;
      formData = JSON.parse(dataString);
      
      // Handle logo file if present
      const logoFile = requestFormData.get('logo') as File;
      if (logoFile) {
        const fileName = `workspace-logo-${user.id}-${Date.now()}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user-assets')
          .upload(`workspaces_logo/${fileName}`, logoFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          console.error('Error uploading logo:', uploadError);
          throw new Error('Failed to upload logo');
        }
        
        // Get public URL for the logo
        const { data: { publicUrl } } = supabase.storage
          .from('user-assets')
          .getPublicUrl(`workspaces_logo/${fileName}`);
        
        formData.workspace_icon_url = publicUrl;
      }
    } else {
      // Handle JSON request (without file)
      const json = await request.json();
      step = json.step;
      formData = json.data;
    }

    if (!step || !formData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { auth_id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Handle each onboarding step
    switch (step) {
      case 'PERSONAL_INFO':
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            ...formData,
            onboarding_step: 'PROFESSIONAL_INFO'
          }
        });

        // Update Supabase user metadata
        await supabase.auth.updateUser({
          data: {
            onboarding_status: {
              current_step: 'professional-info',
              completed_at: null
            }
          }
        });
        break;

      case 'PROFESSIONAL_INFO':
        // Extract user-specific and workspace-specific data
        const { industry, company_size, ...userData } = formData;
        
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            ...userData,
            temp_industry: industry,
            temp_company_size: company_size,
            onboarding_step: 'WORKSPACE_SETUP'
          }
        });

        // Update Supabase user metadata
        await supabase.auth.updateUser({
          data: {
            onboarding_status: {
              current_step: 'workspace-setup',
              completed_at: null
            }
          }
        });
        break;

      case 'WORKSPACE_SETUP':

      const nameError = checkWorkspaceName(formData.workspace_name);
      if (nameError) {
        return NextResponse.json({ 
          error: 'Invalid workspace name',
          ...nameError 
        }, { status: 400 });
      }
        // Create workspace
        const workspace = await prisma.workspace.create({
          data: {
            name: formData.workspace_name,
            slug: formData.workspace_url,
            icon_url: formData.workspace_icon_url,
            industry: dbUser.temp_industry || null,
            company_size: dbUser.temp_company_size || null,
            team_tags: [],
            user_workspaces: {
              create: {
                user_id: dbUser.id,
                role: 'ADMIN'
              }
            }
          }
        });

        // Update user with active workspace and complete onboarding
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            active_workspace_id: workspace.id,
            onboarding_step: 'COMPLETED',
            onboarding_completed_at: new Date(),
            temp_industry: null,
            temp_company_size: null
          }
        });

        // Update Supabase user metadata
        await supabase.auth.updateUser({
          data: {
            onboarding_status: {
              current_step: 'completed',
              completed_at: new Date().toISOString()
            }
          }
        });

        // Schedule welcome and follow-up emails
        const emailResult = await scheduleOnboardingEmails(dbUser.id, dbUser.first_name, dbUser.email);
        
        // Include warnings in the response if there were email issues
        const response: any = { success: true };
        if (emailResult.warnings) {
          response.warnings = {
            emails: emailResult.warnings,
            message: "Onboarding completed successfully, but there were issues with email notifications."
          };
        }
        
        // Use the imported scheduleFollowUpEmail function
        await scheduleFollowUpEmail({
          userId: dbUser.id,
          emailType: 'FEATURE_UPDATE',
          daysAfter: 4,
          metadata: {
            firstName: dbUser.first_name,
            // The roadmapLink will be generated by the scheduleFollowUpEmail function
          },
        });

        // For testing: Schedule the same email to be sent in 5 minutes
        // Comment this out in production
        if (process.env.NODE_ENV !== 'production') {
          await scheduleTestEmail({
            userId: dbUser.id,
            emailType: 'FEATURE_UPDATE',
            minutesAfter: 5,
            metadata: {
              firstName: dbUser.first_name,
              // The roadmapLink will be generated by the scheduleTestEmail function
            },
          });
        }
        
        return NextResponse.json(response);

      case 'INVITED_USER':
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            ...formData,
            onboarding_step: 'COMPLETED',
            onboarding_completed_at: new Date()
          }
        });

        // Update Supabase user metadata
        await supabase.auth.updateUser({
          data: {
            onboarding_status: {
              current_step: 'completed',
              completed_at: new Date().toISOString()
            }
          }
        });

        // Schedule welcome and follow-up emails for invited users too
        const invitedEmailResult = await scheduleOnboardingEmails(dbUser.id, dbUser.first_name, dbUser.email);
        
        // Include warnings in the response if there were email issues
        const invitedResponse: any = { success: true };
        if (invitedEmailResult.warnings) {
          invitedResponse.warnings = {
            emails: invitedEmailResult.warnings,
            message: "Onboarding completed successfully, but there were issues with email notifications."
          };
        }
        
        return NextResponse.json(invitedResponse);

      default:
        return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing onboarding:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update onboarding information' },
      { status: 500 }
    );
  }
} 