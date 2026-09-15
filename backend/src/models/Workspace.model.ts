import mongoose, { Schema, Document, Types } from "mongoose";

export type WorkspaceMemberRole = "owner" | "admin" | "member" | "viewer";

export interface IWorkspaceMember {
  user: Types.ObjectId;
  role: WorkspaceMemberRole;
  joinedAt: Date;
}

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  color: string;
  owner: Types.ObjectId;
  members: IWorkspaceMember[];
  projects: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    color: { type: String, default: "#FF5733" },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: ["owner", "member", "admin", "viewer"] as const,
          default: "member" as WorkspaceMemberRole,
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  },
  { timestamps: true }
);

const Workspace = mongoose.model<IWorkspace>("Workspace", workspaceSchema);

export default Workspace;
