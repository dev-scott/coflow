import mongoose, { Schema, Document, Types } from "mongoose";
import { WorkspaceMemberRole } from "./Workspace.model.js";

export interface IWorkspaceInvite extends Document {
  user: Types.ObjectId;
  workspaceId: Types.ObjectId;
  token: string;
  role: WorkspaceMemberRole;
  expiresAt: Date;
  createdAt: Date;
}

const workspaceInviteSchema = new Schema<IWorkspaceInvite>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    token: { type: String, required: true },
    role: {
      type: String,
      enum: ["owner", "admin", "member", "viewer"] as const,
      default: "member" as WorkspaceMemberRole,
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const WorkspaceInvite = mongoose.model<IWorkspaceInvite>(
  "WorkspaceInvite",
  workspaceInviteSchema
);

export default WorkspaceInvite;
