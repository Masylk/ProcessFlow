import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServerClient';

export async function GET(request: Request) {
  // Get the origin from the request headers
  const origin = request.headers.get('origin') || '';
  
  // Allow requests from both the www and non-www versions of your domain
  const allowedOrigins = [
    'https://process-flow.io',
    'https://www.process-flow.io'
  ];
  
  // Set the appropriate CORS header based on the request origin
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
  
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  return NextResponse.json(
    { authenticated: !!user },
    { headers: corsHeaders }
  );
}

export async function OPTIONS(request: Request) {
  // Get the origin from the request headers
  const origin = request.headers.get('origin') || '';
  
  // Allow requests from both the www and non-www versions of your domain
  const allowedOrigins = [
    'https://process-flow.io',
    'https://www.process-flow.io'
  ];
  
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
    }
  );
}