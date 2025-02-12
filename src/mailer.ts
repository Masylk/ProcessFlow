import nodemailer from 'nodemailer';
import { renderEmail } from './emailRenderer'; // Correct import for template rendering

interface MailOptionsData {
  to: string;
  subject: string;
}

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export default async function sendEmail(
  templateName: string,
  mailOptionsData: MailOptionsData
): Promise<void> {
  try {
    // Generate HTML email content from MJML template
    const htmlContent = await renderEmail(templateName);

    // Setup SMTP transporter with environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: Number(process.env.SMTP_PORT), // Convert to number if necessary
      secure: process.env.SMTP_PORT === '465', // Use 465 for secure
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Define the email options
    const mailOptions: MailOptions = {
      from: '"Jean | ProcessFlow" <jean@process-flow.io>',
      to: mailOptionsData.to,
      subject: mailOptionsData.subject,
      html: htmlContent,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}
