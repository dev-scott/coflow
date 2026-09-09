import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Workspace from "../models/Workspace.model.js";
import Verification from "../models/Verification.model.js";
import { sendEmail } from "../lib/send-email.js";
import aj from "../lib/arcjet.js";

const JWT_SECRET = process.env.JWT_SECRET as string;
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { email, name, password } = req.body as {
    email: string;
    name: string;
    password: string;
  };

  const decision = await aj.protect(req, { email, requested: 1 });
  if (decision.isDenied()) {
    res.status(403).json({ message: "Invalid email address" });
    return;
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json({ message: "Email address already in use" });
    return;
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    email,
    password: hashPassword,
    name,
    isEmailVerified: true,
  });

  await Workspace.create({
    name: `${name}'s Workspace`,
    description: "Mon espace de travail",
    color: "#3b82f6",
    owner: newUser._id,
    members: [{ user: newUser._id, role: "owner", joinedAt: new Date() }],
  });

  res.status(201).json({
    message: "Account created successfully. You can now log in.",
    user: { _id: newUser._id, email: newUser.email, name: newUser.name },
  });
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    res.status(400).json({ message: "Invalid email or password" });
    return;
  }

  if (!user.isEmailVerified) {
    user.isEmailVerified = true;
    await user.save();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    res.status(400).json({ message: "Invalid email or password" });
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

  res.status(200).json({ message: "Login successful", token, user: safeUser });
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body as { token: string };

  const payload = jwt.verify(token, JWT_SECRET) as {
    userId: string;
    purpose: string;
  };

  if (payload.purpose !== "email-verification") {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const verification = await Verification.findOne({
    userId: payload.userId,
    token,
  });

  if (!verification) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (verification.expiresAt < new Date()) {
    res.status(401).json({ message: "Token expired" });
    return;
  }

  const user = await User.findById(payload.userId);
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (user.isEmailVerified) {
    res.status(400).json({ message: "Email already verified" });
    return;
  }

  user.isEmailVerified = true;
  await user.save();
  await Verification.findByIdAndDelete(verification._id);

  res.status(200).json({ message: "Email verified successfully" });
};

export const resetPasswordRequest = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as { email: string };

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400).json({ message: "User not found" });
    return;
  }

  const existingVerification = await Verification.findOne({ userId: user._id });

  if (existingVerification && existingVerification.expiresAt > new Date()) {
    res.status(400).json({ message: "Reset password request already sent" });
    return;
  }

  if (existingVerification && existingVerification.expiresAt < new Date()) {
    await Verification.findByIdAndDelete(existingVerification._id);
  }

  const resetToken = jwt.sign(
    { userId: user._id, purpose: "reset-password" },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  await Verification.create({
    userId: user._id,
    token: resetToken,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  const link = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
  const html = `<p>Cliquez <a href="${link}">ici</a> pour réinitialiser votre mot de passe.</p>`;

  const sent = await sendEmail(email, "Réinitialisation de mot de passe", html);
  if (!sent) {
    res.status(500).json({ message: "Failed to send reset password email" });
    return;
  }

  res.status(200).json({ message: "Reset password email sent" });
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

  const payload = jwt.verify(token, JWT_SECRET) as {
    userId: string;
    purpose: string;
  };

  if (payload.purpose !== "reset-password") {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const verification = await Verification.findOne({
    userId: payload.userId,
    token,
  });

  if (!verification || verification.expiresAt < new Date()) {
    res.status(401).json({ message: "Token expired or invalid" });
    return;
  }

  const user = await User.findById(payload.userId);
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (newPassword !== confirmPassword) {
    res.status(400).json({ message: "Passwords do not match" });
    return;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  await Verification.findByIdAndDelete(verification._id);

  res.status(200).json({ message: "Password reset successfully" });
};
