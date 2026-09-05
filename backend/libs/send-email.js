import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

const SENDGRID_KEY = process.env.SEND_GRID_API;
const fromEmail = process.env.FROM_EMAIL;

if (SENDGRID_KEY) {
  sgMail.setApiKey(SENDGRID_KEY);
}

export const sendEmail = async (to, subject, html) => {
  // Mode développement : si SendGrid n'est pas configuré, afficher le lien dans la console
  if (!SENDGRID_KEY || !fromEmail) {
    console.log("\n" + "=".repeat(70));
    console.log("📧  [DEV MODE] Email non envoyé — SendGrid non configuré");
    console.log(`    À      : ${to}`);
    console.log(`    Sujet  : ${subject}`);
    console.log(`    Contenu: ${html.replace(/<[^>]*>/g, " ").trim()}`);
    console.log("=".repeat(70) + "\n");
    return true; // On retourne true pour ne pas bloquer le flux
  }

  const msg = {
    to,
    from: `TaskHub <${fromEmail}>`,
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
