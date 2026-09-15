import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISubscription extends Document {
  user: Types.ObjectId;
  amount: number;
  currency: "XAF" | "EUR";
  provider: "notchpay" | "sandbox";
  reference: string;
  externalReference?: string;
  status: "pending" | "completed" | "failed" | "canceled";
  paymentMethod?: "momo" | "om" | "card" | "sandbox";
  plan: "pro" | "enterprise";
  period: "monthly" | "yearly";
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ["XAF", "EUR"], default: "XAF" },
    provider: { type: String, enum: ["notchpay", "sandbox"], default: "notchpay" },
    reference: { type: String, required: true, unique: true },
    externalReference: { type: String },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "canceled"],
      default: "pending",
    },
    paymentMethod: { type: String, enum: ["momo", "om", "card", "sandbox"] },
    plan: { type: String, enum: ["pro", "enterprise"], default: "pro" },
    period: { type: String, enum: ["monthly", "yearly"], default: "monthly" },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Subscription = mongoose.model<ISubscription>("Subscription", subscriptionSchema);

export default Subscription;
