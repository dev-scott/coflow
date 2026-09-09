import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

const SENDGRID_KEY = process.env.SEND_GRID_API;
const fromEmail = process.env.FROM_EMAIL;

if (SENDGRID_KEY) {
  sgMail.setApiKey(SENDGRID_KEY);
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  if (!SENDGRID_KEY || !fromEmail) {
    console.log("\n" + "=".repeat(70));
    console.log("📧  [DEV MODE] Email non envoyé — SendGrid non configuré");
    console.log(`    À      : ${to}`);
    console.log(`    Sujet  : ${subject}`);
    console.log(`    Contenu: ${html.replace(/<[^>]*>/g, " ").trim()}`);
    console.log("=".repeat(70) + "\n");
    return true;
  }

  const msg: sgMail.MailDataRequired = {
    to,
    from: `CoFlow <${fromEmail}>`,
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log("[Email] Sent successfully to:", to);
    return true;
  } catch (error) {
    console.error("[Email] Error sending:", error);
    return false;
  }
}
