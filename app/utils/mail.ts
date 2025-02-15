import nodemailer from 'nodemailer';

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: Number(process.env.SMTP_PORT),
      secure: false, // Brevo uses STARTTLS
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `Customer Service | ProcessFlow <contact@process-flow.io>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}:`, info.response);
    return { success: true };
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return { error: 'Failed to send email' };
  }
}
