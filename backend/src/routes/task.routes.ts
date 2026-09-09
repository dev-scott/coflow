import { Router } from "express";
import { z } from "zod";
import {
  createTask,
  getTaskById,
  updateTaskTitle,
  updateTaskDescription,
  updateTaskStatus,
  updateTaskAssignees,
  updateTaskPriority,
  addSubTask,
  updateSubTask,
  getActivityByResourceId,
  getCommentsByTaskId,
  addComment,
  watchTask,
  achievedTask,
  getMyTasks,
} from "../controllers/task.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { validateBody } from "./middleware/validate.js";
import { taskSchema } from "../lib/validate-schema.js";

const router = Router();

router.use(authMiddleware);

// My tasks (must come before /:taskId to avoid conflict)
router.get("/my-tasks", getMyTasks);

// Task CRUD
router.post("/:projectId/create-task", validateBody(taskSchema), createTask);
router.get("/:taskId", getTaskById);

// Task field updates
router.put("/:taskId/title", validateBody(z.object({ title: z.string() })), updateTaskTitle);
router.put("/:taskId/description", validateBody(z.object({ description: z.string() })), updateTaskDescription);
router.put("/:taskId/status", validateBody(z.object({ status: z.string() })), updateTaskStatus);
router.put("/:taskId/priority", validateBody(z.object({ priority: z.string() })), updateTaskPriority);
router.put("/:taskId/assignees", validateBody(z.object({ assignees: z.array(z.string()) })), updateTaskAssignees);

// Subtasks
router.post("/:taskId/add-subtask", validateBody(z.object({ title: z.string() })), addSubTask);
router.put("/:taskId/update-subtask/:subTaskId", validateBody(z.object({ completed: z.boolean() })), updateSubTask);

// Actions
router.post("/:taskId/watch", watchTask);
router.post("/:taskId/achieved", achievedTask);

// Related data
router.get("/:taskId/comments", getCommentsByTaskId);
router.post("/:taskId/add-comment", validateBody(z.object({ text: z.string() })), addComment);
router.get("/:resourceId/activity", getActivityByResourceId);

export default router;
