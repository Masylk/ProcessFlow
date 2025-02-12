import fs from 'fs';
import path from 'path';
import mjml from 'mjml';

/**
 * Renders an email from an MJML template.
 * @param templateName - The name of the template file without the extension (e.g., "welcome").
 * @returns The generated HTML string.
 */
export async function renderEmail(templateName: string): Promise<string> {
  try {
    // Define file paths
    const templatePath = path.join(
      process.cwd(),
      'mails',
      'templates',
      `${templateName}.mjml`
    );
    const signaturePath = path.join(
      process.cwd(),
      'mails',
      'partials',
      'signature.mjml'
    );

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
    throw new Error('Failed to render email.');
  }
}
