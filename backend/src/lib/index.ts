import ActivityLog from "../models/ActivityLog.model.js";
import type { ActionType, ResourceType } from "../models/ActivityLog.model.js";
import { Types } from "mongoose";

export async function recordActivity(
  userId: Types.ObjectId | string,
  action: ActionType,
  resourceType: ResourceType,
  resourceId: string,
  details: Record<string, unknown> = {}
): Promise<void> {
  try {
    await ActivityLog.create({ user: userId, action, resourceType, resourceId, details });
  } catch (err) {
    console.error("[Activity] Failed to record:", err);
  }
}

export function isValidObjectId(id: unknown): id is string {
  return (
    Boolean(id) &&
    id !== "null" &&
    id !== "undefined" &&
    typeof id === "string" &&
    Types.ObjectId.isValid(id)
  );
}
