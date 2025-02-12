const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendEmail(templateName, mailOptionsData) {
  // Génération du HTML de l'email
  const htmlContent = renderEmail(templateName);

  // Configuration du transporteur SMTP (ici avec Brevo)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD
    }
  });

  // Définition des options de l'email (vous pouvez enrichir mailOptionsData selon vos besoins)
  const mailOptions = {
    from: '"Jean | ProcessFlow" <jean@process-flow.io>',
    to: mailOptionsData.to,               // destinataire(s)
    subject: mailOptionsData.subject,
    html: htmlContent
  };

  // Envoi de l'email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email envoyé avec succès :", info.messageId);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
  }
}

// Exemple d'envoi
sendEmail('welcome', {
  to: 'destinataire@example.com',
  subject: 'Bienvenue !'
});
