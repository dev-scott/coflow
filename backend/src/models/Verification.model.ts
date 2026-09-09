import mongoose, { Schema, Document, Types } from "mongoose";

export interface IVerification extends Document {
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const verificationSchema = new Schema<IVerification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const Verification = mongoose.model<IVerification>(
  "Verification",
  verificationSchema
);

export default Verification;
