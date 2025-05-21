import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// Import the email components and utility
import { sendReactEmail } from '@/lib/email';
import { WelcomeEmail } from '@/emails/templates/WelcomeEmail';
import { scheduleFollowUpEmail, scheduleTestEmail } from '@/lib/scheduledEmails';
import { scheduleFeedbackRequestEmail } from '@/lib/emails/scheduleFeedbackRequestEmail';
import { checkWorkspaceName } from '@/app/utils/checkNames';
import * as Sentry from '@sentry/nextjs';
import { createDefaultWorkflow, createDefaultWorkflows } from '@/app/api/utils/create-default-workflow';
import { performance } from 'perf_hooks';

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
      Sentry.captureException(result.error);
      return { success: false, error: result.error };
    }
    
   
    return { success: true };
  } catch (error) {
    console.error('Error scheduling follow-up email:', error);
    Sentry.captureException(error);
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
    
    // Use upsert to handle duplicates gracefully
    await prisma.scheduled_email.upsert({
      where: {
        unique_pending_email_per_user_type: {
          user_id: userId,
          email_type: emailType.toString()
        }
      },
      update: {
        scheduled_for: scheduledDate,
        updated_at: new Date()
      },
      create: {
        user_id: userId,
        email_type: emailType.toString(),
        scheduled_for: scheduledDate
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error(`Failed to schedule ${emailType} email:`, error);
    Sentry.captureException(error);
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
      Sentry.captureException(result.error);
      return { success: false, error: result.error };
    }

  
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    Sentry.captureException(error);
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
      Sentry.captureException(welcomeResult.error);
    }
    
    // Schedule follow-up email for 4 days later
    const followUpResult = await scheduleOnboardingFollowUpEmail(userId);
    
    if (!followUpResult.success) {
      // Log the error but continue with onboarding
      console.error('Failed to schedule follow-up email, but continuing with onboarding:', followUpResult.error);
      Sentry.captureException(followUpResult.error);
    }
    
    // Schedule feedback request email for 7 days later
    // NOTE: This is the ONLY place where feedback request emails should be scheduled
    // The scheduleFeedbackRequestEmail function has duplicate prevention built-in
    const feedbackResult = await scheduleFeedbackRequestEmail(userId);
    
    if (!feedbackResult.success) {
      // Log the error but continue with onboarding
      console.error('Failed to schedule feedback request email, but continuing with onboarding:', feedbackResult.error);
      Sentry.captureException(feedbackResult.error);
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
    Sentry.captureException(error);
    // Return success true because we want onboarding to continue even if emails fail
    return { 
      success: true, 
      warnings: { emailError: error }
    };
  }
}

// Add a helper function at the top level to update an existing workspace
async function updateExistingWorkspace(
  workspaceId: number, 
  formData: any, 
  userId: number,
  tempIndustry: string | null, 
  tempCompanySize: string | null
) {
  try {
    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        name: formData.workspace_name,
        slug: formData.workspace_url,
        icon_url: formData.workspace_icon_url,
        industry: tempIndustry || null,
        company_size: tempCompanySize || null,
      }
    });
    
    return workspace;
  } catch (error) {
    console.error(`Error updating existing workspace (ID: ${workspaceId}):`, error);
    Sentry.captureException(error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      Sentry.captureException(authError);
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
          Sentry.captureException(uploadError);
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
      //   // Create a temporary workspace WITHOUT creating a workflow
      //   const { workspaceId: tempWorkspaceId } = await createTempWorkspace(
      //     dbUser.id, 
      //     formData.first_name, 
      //     formData.last_name
      //   );

        // Update user with personal info and temporary workspace ID
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            ...formData,
            onboarding_step: 'PROFESSIONAL_INFO',
          }
        });

        // Store the temp workspace ID in Supabase user metadata
        await supabase.auth.updateUser({
          data: {
            onboarding_status: {
              current_step: 'professional-info',
              completed_at: null
            },
          }
        });
        break;

      case 'PROFESSIONAL_INFO':
        // Extract user-specific and workspace-specific data
        const { industry, company_size, is_navigating_back, ...userData } = formData;
        
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            ...userData,
            temp_industry: industry,
            temp_company_size: company_size,
            // If navigating back, set the step to PERSONAL_INFO, otherwise proceed to WORKSPACE_SETUP
            onboarding_step: is_navigating_back ? 'PERSONAL_INFO' : 'WORKSPACE_SETUP'
          }
        });

        // Update Supabase user metadata
        await supabase.auth.updateUser({
          data: {
            onboarding_status: {
              current_step: is_navigating_back ? 'personal-info' : 'workspace-setup',
              completed_at: null
            }
          }
        });
        
        // We don't need to create a workflow here either
        // The workflow will be created during the WORKSPACE_SETUP step, regardless of auth method
        break;

      case 'WORKSPACE_SETUP':
        // Skip workspace validation if we're just navigating back
        if (formData.is_navigating_back) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: {
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

          return NextResponse.json({ success: true });
        }

        // Only validate workspace name if we're not navigating back
        const nameError = checkWorkspaceName(formData.workspace_name);
        if (nameError) {
          return NextResponse.json({ 
            error: 'Invalid workspace name',
            ...nameError 
          }, { status: 400 });
        }

        let workspace;
        let workflowCreationWarning = null;
        
        // Reset user workspaces
        await prisma.user_workspace.deleteMany({
          where: { user_id: dbUser.id }
        });
        
          // Create a new workspace if no temp workspace exists
          console.log(`Creating new workspace for user ${dbUser.id} as no existing workspace was found`);
          
          // Double-check slug availability before attempting to create
          const existingWorkspaceWithSlug = await prisma.workspace.findFirst({
            where: { slug: formData.workspace_url }
          });
          
          if (existingWorkspaceWithSlug) {
            console.error(`Slug "${formData.workspace_url}" already exists in database before creation attempt`);
            return NextResponse.json({ 
              error: `Slug constraint failed: The workspace URL "${formData.workspace_url}" is already taken. Please try a different URL.` 
            }, { status: 400 });
          }
          
          try {
            workspace = await prisma.workspace.create({
              data: {
                name: formData.workspace_name,
                slug: formData.workspace_url,
                icon_url: formData.workspace_icon_url,
                industry: dbUser.temp_industry || null,
                company_size: dbUser.temp_company_size || null,
                user_workspaces: {
                  create: {
                    user_id: dbUser.id,
                    role: 'ADMIN'
                  }
                }
              }
            });
            
            console.log(`Successfully created workspace with slug: ${formData.workspace_url}`);
          } catch (workspaceError) {
            // Check if this is a slug constraint error
            const errorMsg = workspaceError instanceof Error ? workspaceError.message : 'Unknown error';
            console.error(`Error creating workspace for user ${dbUser.id}:`, errorMsg);
            Sentry.captureException(workspaceError);
            
            // Provide a more detailed error message for slug constraint violations
            if (
              errorMsg.includes('Unique constraint failed') ||
              errorMsg.includes('unique constraint') ||
              errorMsg.includes('duplicate key') ||
              errorMsg.includes('workspace_slug_key')
            ) {
              return NextResponse.json({ 
                error: `Slug constraint failed: The workspace URL "${formData.workspace_url}" is already taken. Please try a different URL.` 
              }, { status: 400 });
            }
            
            // For other errors, rethrow to be handled by the outer catch block
            throw workspaceError;
          }
          
          // If no temp workspace was created, we need to create the workflow now
          let workflowErrorFinal = null;
          let workflowCreationDurationMs = null; // Add this to store the duration

          const workflowStart = performance.now(); // Start timing

          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              const results = await createDefaultWorkflows({
                workspaceId: workspace.id,
                userId: dbUser.id
              });
              const allWarnings = results.flatMap(r => 'warnings' in r && r.warnings ? r.warnings : []);
              if (allWarnings.length > 0) {
                workflowCreationWarning = {
                  message: 'Default workflows created with warnings',
                  details: allWarnings
                };
              }
              workflowErrorFinal = null;
              break; // Success, exit retry loop
            } catch (workflowError) {
              console.error(`Error creating default workflows (attempt ${attempt}):`, workflowError);
              Sentry.captureException(workflowError);
              workflowErrorFinal = workflowError;
              if (attempt < 3) await new Promise(res => setTimeout(res, 500));
            }
          }

          workflowCreationDurationMs = performance.now() - workflowStart; // End timing
          console.log(`Default workflows created in ${workflowCreationDurationMs} milliseconds`);

          if (workflowErrorFinal) {
            workflowCreationWarning = {
              message: 'Failed to create default workflows after 3 attempts',
              details: workflowErrorFinal
            };
            Sentry.captureException(workflowErrorFinal);
          }

        // Update user with active workspace and complete onboarding
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            active_workspace_id: workspace?.id || null,
            onboarding_step: 'COMPLETED',
            onboarding_completed_at: new Date(),
            temp_industry: null,
            temp_company_size: null,
          }
        });

        // Update Supabase user metadata and clear the temporary workspace ID
        await supabase.auth.updateUser({
          data: {
            onboarding_status: {
              current_step: 'completed',
              completed_at: new Date().toISOString()
            },
            temp_workspace_id: null // Clear temp workspace ID
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
        
        // Add workflow creation warnings if any
        if (workflowCreationWarning) {
          if (!response.warnings) {
            response.warnings = {};
          }
          response.warnings.workflowCreation = workflowCreationWarning;
          response.warnings.message = response.warnings.message || 
            "Onboarding completed successfully, but there were some issues.";
        }

        try {
          // Use the imported scheduleFollowUpEmail function
          await scheduleFollowUpEmail({
            userId: dbUser.id,
            emailType: 'FEATURE_UPDATE',
            daysAfter: 4,
            metadata: {
              firstName: dbUser.first_name,
              // The roadmapLink will be generated by the scheduleFollowUpEmail function
            },
          }).catch(err => {
            console.warn('Error scheduling feature update email, but continuing:', err);
            Sentry.captureException(err);
            if (response.warnings) {
              response.warnings.emails.featureUpdateEmail = err;
            }
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
            }).catch(err => {
              console.warn('Error scheduling test email, but continuing:', err);
              Sentry.captureException(err);
              if (response.warnings) {
                response.warnings.emails.testEmail = err;
              }
            });
          }
        } catch (error) {
          console.warn('Error in additional email scheduling, but continuing with onboarding completion:', error);
          Sentry.captureException(error);
          if (response.warnings) {
            response.warnings.additionalEmails = error;
          }
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
        
        // Create default workflows for invited users as well
        let invitedWorkflowCreationWarning = null;
        if (dbUser.active_workspace_id) {
          let invitedWorkflowErrorFinal = null;
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              const start = performance.now();
              const results = await createDefaultWorkflows({
                workspaceId: dbUser.active_workspace_id,
                userId: dbUser.id
              });
              const end = performance.now();
              const elapsedTime = end - start;
              console.log(`Default workflows created in ${elapsedTime} milliseconds`);
              const allWarnings = results.flatMap(r => 'warnings' in r && r.warnings ? r.warnings : []);
              if (allWarnings.length > 0) {
                invitedWorkflowCreationWarning = {
                  message: 'Default workflows created with warnings',
                  details: allWarnings
                };
              }
              invitedWorkflowErrorFinal = null;
              break; // Success, exit retry loop
            } catch (workflowError) {
              console.error(`Error creating default workflows for invited user (attempt ${attempt}):`, workflowError);
              Sentry.captureException(workflowError);
              invitedWorkflowErrorFinal = workflowError;
              if (attempt < 3) await new Promise(res => setTimeout(res, 500));
            }
          }
          if (invitedWorkflowErrorFinal) {
            invitedWorkflowCreationWarning = {
              message: 'Failed to create default workflows after 3 attempts',
              details: invitedWorkflowErrorFinal
            };
            Sentry.captureException(invitedWorkflowErrorFinal);
          }
        }

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
        
        // Add workflow creation warnings for invited users if any
        if (invitedWorkflowCreationWarning) {
          if (!invitedResponse.warnings) {
            invitedResponse.warnings = {};
          }
          invitedResponse.warnings.workflowCreation = invitedWorkflowCreationWarning;
          invitedResponse.warnings.message = invitedResponse.warnings.message || 
            "Onboarding completed successfully, but there were some issues.";
        }
        
        return NextResponse.json(invitedResponse);

      default:
        return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing onboarding:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update onboarding information' },
      { status: 500 }
    );
  }
} 