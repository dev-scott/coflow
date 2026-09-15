import nodemailer, { type Transporter } from "nodemailer";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

const SENDGRID_KEY = process.env.SEND_GRID_API;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER || "contact@coflow.dev";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

if (SENDGRID_KEY) {
  sgMail.setApiKey(SENDGRID_KEY);
}

// Configurer le transporteur SMTP réutilisable (gratuit: Gmail, Brevo, Mailtrap, etc.)
let smtpTransporter: Transporter | null = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  smtpTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

/**
 * Envoie un email via SMTP (gratuit), SendGrid (si configuré) ou journalisation console en dev.
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  // 1. Essai d'envoi via SMTP gratuit si configuré
  if (smtpTransporter) {
    try {
      await smtpTransporter.sendMail({
        from: `CoFlow <${FROM_EMAIL}>`,
        to,
        subject,
        html,
      });
      console.log(`[Email SMTP] Envoyé avec succès à: ${to}`);
      return true;
    } catch (error) {
      console.error("[Email SMTP] Erreur d'envoi:", error);
    }
  }

  // 2. Essai via SendGrid si configuré
  if (SENDGRID_KEY && FROM_EMAIL) {
    try {
      await sgMail.send({
        to,
        from: `CoFlow <${FROM_EMAIL}>`,
        subject,
        html,
      });
      console.log(`[Email SendGrid] Envoyé avec succès à: ${to}`);
      return true;
    } catch (error) {
      console.error("[Email SendGrid] Erreur d'envoi:", error);
    }
  }

  // 3. Mode développement : extrait et affiche clairement le lien d'action dans le terminal
  const linkMatch = html.match(/href="([^"]+)"/i);
  const actionLink = linkMatch ? linkMatch[1] : null;

  console.log("\n" + "=".repeat(76));
  console.log("📨  [COFLOW EMAIL DISPATCHER]");
  console.log(`    Destinataire : ${to}`);
  console.log(`    Objet        : ${subject}`);
  if (actionLink) {
    console.log(`    👉 LIEN DIRECT : \x1b[36m\x1b[1m${actionLink}\x1b[0m`);
  }
  console.log("=".repeat(76) + "\n");

  return true;
}

/**
 * Email de vérification de compte avec template HTML moderne CoFlow
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<boolean> {
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 40px 20px; color: #1E293B; }
        .card { max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; padding: 40px 36px; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05); }
        .logo { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: #0F172A; margin-bottom: 24px; }
        .logo span { color: #3B805C; }
        h1 { font-size: 22px; font-weight: 800; margin: 0 0 12px; color: #0F172A; }
        p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px; }
        .btn { display: inline-block; background: #3B805C; color: #FFFFFF !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px; margin: 12px 0 24px; }
        .url-box { word-break: break-all; font-size: 12px; color: #64748B; background: #F1F5F9; padding: 12px; border-radius: 8px; }
        .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #E2E8F0; font-size: 11.5px; color: #94A3B8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">Co<span>Flow</span></div>
        <h1>Activez votre compte CoFlow</h1>
        <p>Bonjour ${name || ""},</p>
        <p>Merci d'avoir rejoint CoFlow ! Cliquez sur le bouton ci-dessous pour confirmer votre adresse email et déverrouiller l'accès à votre espace de travail.</p>
        <div style="text-align: center;">
          <a href="${verifyUrl}" class="btn" target="_blank">Vérifier mon adresse email</a>
        </div>
        <p style="font-size: 12px; color: #64748B;">Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :</p>
        <div class="url-box">${verifyUrl}</div>
        <div class="footer">
          Ce lien expirera dans 24 heures. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(to, "Activez votre compte CoFlow", html);
}

/**
 * Email de réinitialisation de mot de passe avec template HTML moderne CoFlow
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string
): Promise<boolean> {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 40px 20px; color: #1E293B; }
        .card { max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; padding: 40px 36px; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05); }
        .logo { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: #0F172A; margin-bottom: 24px; }
        .logo span { color: #3B805C; }
        h1 { font-size: 22px; font-weight: 800; margin: 0 0 12px; color: #0F172A; }
        p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px; }
        .btn { display: inline-block; background: #1E293B; color: #FFFFFF !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px; margin: 12px 0 24px; }
        .url-box { word-break: break-all; font-size: 12px; color: #64748B; background: #F1F5F9; padding: 12px; border-radius: 8px; }
        .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #E2E8F0; font-size: 11.5px; color: #94A3B8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">Co<span>Flow</span></div>
        <h1>Réinitialisation de mot de passe</h1>
        <p>Bonjour ${name || ""},</p>
        <p>Nous avons reçu une demande de réinitialisation pour votre compte CoFlow. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
        <div style="text-align: center;">
          <a href="${resetUrl}" class="btn" target="_blank">Changer mon mot de passe</a>
        </div>
        <p style="font-size: 12px; color: #64748B;">Si le bouton ne fonctionne pas, copiez-collez ce lien :</p>
        <div class="url-box">${resetUrl}</div>
        <div class="footer">
          Ce lien expirera dans 15 minutes. Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email. Votre mot de passe actuel reste inchangé.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(to, "Réinitialisation de votre mot de passe CoFlow", html);
}
