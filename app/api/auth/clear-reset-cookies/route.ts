import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Cookies cleared' });
  
  // Clear all reset-related cookies
  response.cookies.delete('password-reset-token');
  response.cookies.delete('reset-user-id');
  
  return response;
} 