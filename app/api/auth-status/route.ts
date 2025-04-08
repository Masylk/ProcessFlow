import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServerClient';

export async function GET(request: Request) {
  // Configure CORS to allow requests from your Webflow domain
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://process-flow.io',
    'Access-Control-Allow-Credentials': 'true',
  };
  
  // Create Supabase client
  const supabase = createClient();
  
  // Check if user is authenticated
  const { data: { user }, error } = await supabase.auth.getUser();
  
  // Return authentication status with CORS headers
  return NextResponse.json(
    { authenticated: !!user },
    { headers: corsHeaders }
  );
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': 'https://process-flow.io',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      },
    }
  );
}