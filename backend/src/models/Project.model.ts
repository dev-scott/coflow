import mongoose, { Schema, Document, Types } from "mongoose";

export type ProjectStatus =
  | "Planning"
  | "In Progress"
  | "On Hold"
  | "Completed"
  | "Cancelled";

export type ProjectMemberRole = "manager" | "contributor" | "viewer";

export interface IProjectMember {
  user: Types.ObjectId;
  role: ProjectMemberRole;
}

export interface IProject extends Document {
  title: string;
  description?: string;
  status: ProjectStatus;
  workspace: Types.ObjectId;
  startDate: Date;
  dueDate?: Date;
  tags: string[];
  tasks: Types.ObjectId[];
  members: IProjectMember[];
  createdBy: Types.ObjectId;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: [
        "Planning",
        "In Progress",
        "On Hold",
        "Completed",
        "Cancelled",
      ] as const,
      default: "Planning" as ProjectStatus,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    startDate: { type: Date },
    dueDate: { type: Date },
    tags: [{ type: String }],
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: ["manager", "contributor", "viewer"] as const,
          default: "contributor" as ProjectMemberRole,
        },
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Project = mongoose.model<IProject>("Project", projectSchema);

export default Project;
