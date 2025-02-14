import fs from 'fs';
import path from 'path';

export async function renderEmail(templateName: string): Promise<string> {
  try {
    // Dynamically import mjml
    const mjml = (await import('mjml')).default;

    // Define file paths
    const templatePath = path.resolve(
      'mails',
      'templates',
      `${templateName}.mjml`
    );
    const signaturePath = path.resolve('mails', 'partials', 'signature.mjml');

    // Check if files exist
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`);
    }
    if (!fs.existsSync(signaturePath)) {
      throw new Error(`Signature file not found: ${signaturePath}`);
    }

    // Read template and signature files
    const templateContent = await fs.promises.readFile(templatePath, 'utf8');
    const signatureContent = await fs.promises.readFile(signaturePath, 'utf8');

    // Replace {{signature}} placeholder in the template with the actual signature
    const emailContent = templateContent.replace(
      '{{signature}}',
      signatureContent
    );

    // Convert MJML to HTML
    const { html, errors } = mjml(emailContent, { validationLevel: 'strict' });

    if (errors.length > 0) {
      console.error('MJML Conversion Errors:', errors);
      throw new Error('MJML conversion failed.');
    }

    return html;
  } catch (error) {
    console.error('Error rendering email:', error);
    // Include the original error to preserve stack trace and more details
    throw new Error(
      `Failed to render email: ${
        error instanceof Error ? error.message : error
      }`
    );
  }
}
