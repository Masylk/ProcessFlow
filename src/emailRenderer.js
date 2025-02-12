const fs = require('fs');
const path = require('path');
const mjml = require('mjml');

/**
 * Rendu d'un email à partir d'un template MJML.
 * @param {string} templateName - Le nom du fichier template sans extension (exemple : "welcome").
 * @returns {string} Le code HTML généré.
 */
function renderEmail(templateName) {
  // Définition des chemins des fichiers
  const templatePath = path.join(__dirname, 'emails', 'templates', `${templateName}.mjml`);
  const signaturePath = path.join(__dirname, 'emails', 'partials', 'signature.mjml`);

  // Lecture du template et de la signature
  let templateContent = fs.readFileSync(templatePath, 'utf8');
  const signatureContent = fs.readFileSync(signaturePath, 'utf8');

  // Remplacement du placeholder {{signature}} par le contenu réel de la signature
  templateContent = templateContent.replace('{{signature}}', signatureContent);

  // Conversion du MJML en HTML
  const { html, errors } = mjml(templateContent, { validationLevel: 'strict' });
  if (errors && errors.length > 0) {
    console.error('Erreurs lors de la conversion MJML :', errors);
    // Vous pouvez choisir de lancer une erreur ou gérer autrement
    throw new Error('Erreur de conversion MJML');
  }

  return html;
}

// Exemple d'utilisation
try {
  const emailHtml = renderEmail('welcome'); // "welcome.mjml" dans le dossier templates
  console.log(emailHtml);
} catch (error) {
  console.error(error);
}
