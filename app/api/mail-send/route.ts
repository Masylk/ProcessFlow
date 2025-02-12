import { NextResponse } from 'next/server';
import sendEmail from '@/src/mailer'; // Correct import path

interface EmailRequestBody {
  templateName: string;
  to: string;
  subject: string;
}

export async function POST(req: Request) {
  try {
    // Parse the request body as JSON
    const { templateName, to, subject }: EmailRequestBody = await req.json();

    // Call sendEmail function to send the email
    // await sendEmail(templateName, {
    //   to,
    //   subject,
    // });

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ error: 'Error sending email' }, { status: 500 });
  }
}
