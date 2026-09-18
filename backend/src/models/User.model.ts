import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  plan: "starter" | "pro" | "enterprise";
  planStatus: "active" | "trialing" | "past_due" | "canceled";
  trialEndsAt?: Date;
  hasUsedTrial?: boolean;
  subscriptionEndsAt?: Date;
  paymentReference?: string;
  lastLogin?: Date;
  is2FAEnabled: boolean;
  twoFAOtp?: string;
  twoFAOtpExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    profilePicture: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    plan: {
      type: String,
      enum: ["starter", "pro", "enterprise"],
      default: "starter",
    },
    planStatus: {
      type: String,
      enum: ["active", "trialing", "past_due", "canceled"],
      default: "active",
    },
    trialEndsAt: { type: Date },
    hasUsedTrial: { type: Boolean, default: false },
    subscriptionEndsAt: { type: Date },
    paymentReference: { type: String },
    lastLogin: { type: Date },
    is2FAEnabled: { type: Boolean, default: false },
    twoFAOtp: { type: String, select: false },
    twoFAOtpExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
