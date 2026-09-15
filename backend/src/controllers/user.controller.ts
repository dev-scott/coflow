import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User.model.js";

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.status(200).json(user);
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  const { name, profilePicture } = req.body as {
    name: string;
    profilePicture?: string;
  };

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  user.name = name;
  if (profilePicture !== undefined) user.profilePicture = profilePicture;
  await user.save();

  res.status(200).json(user);
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const { currentPassword, newPassword, confirmPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };

  if (newPassword !== confirmPassword) {
    res.status(400).json({ message: "New password and confirm password do not match" });
    return;
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    res.status(403).json({ message: "Invalid current password" });
    return;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.status(200).json({ message: "Password updated successfully" });
};
