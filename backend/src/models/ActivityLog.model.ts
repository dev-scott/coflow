import mongoose, { Schema, Document, Types } from "mongoose";

export type ActionType =
  | "created_task"
  | "updated_task"
  | "created_subtask"
  | "updated_subtask"
  | "completed_task"
  | "created_project"
  | "updated_project"
  | "completed_project"
  | "created_workspace"
  | "updated_workspace"
  | "added_comment"
  | "added_member"
  | "removed_member"
  | "joined_workspace"
  | "added_attachment";

export type ResourceType =
  | "Task"
  | "Project"
  | "Workspace"
  | "Comment"
  | "User";

export interface IActivityLog extends Document {
  user: Types.ObjectId;
  action: ActionType;
  resourceType: ResourceType;
  resourceId: string;
  details: Record<string, unknown>;
  createdAt: Date;
}

const activitySchema = new Schema<IActivityLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String, required: true },
    details: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const ActivityLog = mongoose.model<IActivityLog>("ActivityLog", activitySchema);

export default ActivityLog;
