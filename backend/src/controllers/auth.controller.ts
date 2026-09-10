import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Workspace from "../models/Workspace.model.js";
import Verification from "../models/Verification.model.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../lib/send-email.js";
import aj from "../lib/arcjet.js";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { email, name, password } = req.body as {
    email: string;
    name: string;
    password: string;
  };

  const decision = await aj.protect(req, { email, requested: 1 });
  if (decision.isDenied()) {
    res.status(403).json({ message: "Adresse email invalide ou rejetée par le filtre de sécurité" });
    return;
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json({ message: "Cette adresse email est déjà utilisée" });
    return;
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    email,
    password: hashPassword,
    name,
    isEmailVerified: false,
  });

  await Workspace.create({
    name: `${name}'s Workspace`,
    description: "Mon espace de travail",
    color: "#3b82f6",
    owner: newUser._id,
    members: [{ user: newUser._id, role: "owner", joinedAt: new Date() }],
  });

  // Générer le jeton de vérification d'email (valable 24h)
  const verificationToken = jwt.sign(
    { userId: newUser._id, purpose: "email-verification" },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  await Verification.create({
    userId: newUser._id,
    token: verificationToken,
    type: "email-verification",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  // Envoyer l'email d'activation (gratuit via SMTP ou journalisation terminal)
  await sendVerificationEmail(newUser.email, newUser.name, verificationToken);

  res.status(201).json({
    message: "Compte créé avec succès ! Un email de vérification vous a été envoyé.",
    user: { _id: newUser._id, email: newUser.email, name: newUser.name },
    requireVerification: true,
  });
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    res.status(400).json({ message: "Adresse email ou mot de passe incorrect" });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    res.status(400).json({ message: "Adresse email ou mot de passe incorrect" });
    return;
  }

  // Vérifier si l'adresse email a été confirmée
  if (!user.isEmailVerified) {
    res.status(403).json({
      message: "Veuillez vérifier votre adresse email avant de vous connecter.",
      emailNotVerified: true,
      email: user.email,
    });
    return;
  }

  const token = jwt.sign(
    { userId: user._id, purpose: "login" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  user.lastLogin = new Date();
  await user.save();

  const workspaceCount = await Workspace.countDocuments({ "members.user": user._id });
  if (workspaceCount === 0) {
    await Workspace.create({
      name: `${user.name || "Mon"}'s Workspace`,
      description: "Mon espace de travail",
      color: "#3b82f6",
      owner: user._id,
      members: [{ user: user._id, role: "owner", joinedAt: new Date() }],
    });
  }

  const userData = user.toObject();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _pw, ...safeUser } = userData;

  res.status(200).json({ message: "Connexion réussie", token, user: safeUser });
};

export const resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as { email: string };

  if (!email) {
    res.status(400).json({ message: "Adresse email requise" });
    return;
  }

  const user = await User.findOne({ email });
  if (!user) {
    // Réponse uniforme pour éviter l'énumération d'utilisateurs
    res.status(200).json({ message: "Si un compte non vérifié existe avec cette adresse, un lien a été envoyé." });
    return;
  }

  if (user.isEmailVerified) {
    res.status(400).json({ message: "Cette adresse email est déjà vérifiée. Vous pouvez vous connecter." });
    return;
  }

  // Supprimer les anciens jetons de vérification d'email
  await Verification.deleteMany({ userId: user._id, type: "email-verification" });

  const verificationToken = jwt.sign(
    { userId: user._id, purpose: "email-verification" },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  await Verification.create({
    userId: user._id,
    token: verificationToken,
    type: "email-verification",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  await sendVerificationEmail(user.email, user.name, verificationToken);

  res.status(200).json({ message: "Un nouveau lien d'activation vous a été envoyé." });
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body as { token: string };

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      purpose: string;
    };

    if (payload.purpose !== "email-verification") {
      res.status(401).json({ message: "Jeton de validation non autorisé" });
      return;
    }

    const verification = await Verification.findOne({
      userId: payload.userId,
      token,
    });

    if (!verification) {
      res.status(401).json({ message: "Jeton invalide ou déjà utilisé" });
      return;
    }

    if (verification.expiresAt < new Date()) {
      res.status(401).json({ message: "Le lien de validation a expiré" });
      return;
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(401).json({ message: "Utilisateur introuvable" });
      return;
    }

    user.isEmailVerified = true;
    await user.save();
    await Verification.findByIdAndDelete(verification._id);

    // Générer automatiquement un token de session pour connecter l'utilisateur directement
    const authToken = jwt.sign(
      { userId: user._id, purpose: "login" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Votre adresse email a été confirmée avec succès !",
      token: authToken,
      user: { _id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    res.status(401).json({ message: "Jeton invalide ou expiré" });
  }
};

export const resetPasswordRequest = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as { email: string };

  const user = await User.findOne({ email });
  if (!user) {
    // UX sécurisée
    res.status(200).json({
      message: "Si un compte est associé à cette adresse, vous recevrez un email contenant les instructions.",
    });
    return;
  }

  // Supprimer les anciens jetons de réinitialisation de mot de passe (sans toucher aux jetons de vérification d'email)
  await Verification.deleteMany({ userId: user._id, type: "reset-password" });

  const resetToken = jwt.sign(
    { userId: user._id, purpose: "reset-password" },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  await Verification.create({
    userId: user._id,
    token: resetToken,
    type: "reset-password",
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  const sent = await sendPasswordResetEmail(user.email, user.name, resetToken);
  if (!sent) {
    res.status(500).json({ message: "Impossible d'envoyer l'email de réinitialisation" });
    return;
  }

  res.status(200).json({
    message: "Si un compte est associé à cette adresse, vous recevrez un email contenant les instructions.",
  });
};

export const verifyResetPasswordTokenAndResetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token, newPassword, confirmPassword } = req.body as {
    token: string;
    newPassword: string;
    confirmPassword: string;
  };

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      purpose: string;
    };

    if (payload.purpose !== "reset-password") {
      res.status(401).json({ message: "Jeton non autorisé" });
      return;
    }

    const verification = await Verification.findOne({
      userId: payload.userId,
      token,
    });

    if (!verification || verification.expiresAt < new Date()) {
      res.status(401).json({ message: "Ce lien a expiré ou est invalide" });
      return;
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(401).json({ message: "Utilisateur introuvable" });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ message: "Les mots de passe ne correspondent pas" });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    // Si l'utilisateur a réussi à réinitialiser son mot de passe via email, son email est légitime
    user.isEmailVerified = true;
    await user.save();
    await Verification.findByIdAndDelete(verification._id);

    res.status(200).json({ message: "Mot de passe modifié avec succès ! Vous pouvez vous connecter." });
  } catch (error) {
    res.status(401).json({ message: "Jeton de réinitialisation invalide ou expiré" });
  }
};
