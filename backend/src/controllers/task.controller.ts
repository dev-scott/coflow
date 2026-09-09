import { Request, Response } from "express";
import { recordActivity, isValidObjectId } from "../lib/index.js";
import ActivityLog from "../models/ActivityLog.model.js";
import Comment from "../models/Comment.model.js";
import Project from "../models/Project.model.js";
import Task from "../models/Task.model.js";
import Workspace from "../models/Workspace.model.js";
import type { TaskStatus, TaskPriority } from "../models/Task.model.js";
import { Types } from "mongoose";

// Helper — Express params values are always strings at runtime
const param = (req: Request, key: string): string =>
  req.params[key] as string;

export const createTask = async (req: Request, res: Response): Promise<void> => {
  const projectId = param(req, "projectId");
  const { title, description, status, priority, dueDate, assignees } = req.body as {
    title: string; description?: string; status: TaskStatus;
    priority: TaskPriority; dueDate: string; assignees: string[];
  };

  if (!isValidObjectId(projectId)) { res.status(404).json({ message: "Project not found" }); return; }

  const project = await Project.findById(projectId);
  if (!project) { res.status(404).json({ message: "Project not found" }); return; }

  const workspace = await Workspace.findById(project.workspace);
  if (!workspace) { res.status(404).json({ message: "Workspace not found" }); return; }

  const isMember = workspace.members.some((m) => m.user.toString() === req.user._id.toString());
  if (!isMember) { res.status(403).json({ message: "You are not a member of this workspace" }); return; }

  const task = await Task.create({
    title, description, status, priority, dueDate, assignees,
    project: projectId, createdBy: req.user._id,
  });

  project.tasks.push(task._id);
  await project.save();
  res.status(201).json(task);
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  const taskId = param(req, "taskId");
  if (!isValidObjectId(taskId)) { res.status(404).json({ message: "Task not found" }); return; }

  const task = await Task.findById(taskId)
    .populate("assignees", "name profilePicture")
    .populate("watchers", "name profilePicture");
  if (!task) { res.status(404).json({ message: "Task not found" }); return; }

  const project = await Project.findById(task.project).populate("members.user", "name profilePicture");
  res.status(200).json({ task, project });
};

export const updateTaskTitle = async (req: Request, res: Response): Promise<void> => {
  const taskId = param(req, "taskId");
  const { title } = req.body as { title: string };

  const task = await Task.findById(taskId);
  if (!task) { res.status(404).json({ message: "Task not found" }); return; }

  const project = await Project.findById(task.project);
  if (!project) { res.status(404).json({ message: "Project not found" }); return; }

  const isMember = project.members.some((m) => m.user.toString() === req.user._id.toString());
  if (!isMember) { res.status(403).json({ message: "Not authorized" }); return; }

  const oldTitle = task.title;
  task.title = title;
  await task.save();

  await recordActivity(req.user._id, "updated_task", "Task", taskId, {
    description: `Updated title from "${oldTitle}" to "${title}"`,
  });
  res.status(200).json(task);
};

export const updateTaskDescription = async (req: Request, res: Response): Promise<void> => {
  const taskId = param(req, "taskId");
  const { description } = req.body as { description: string };

  const task = await Task.findById(taskId);
  if (!task) { res.status(404).json({ message: "Task not found" }); return; }

  const project = await Project.findById(task.project);
  if (!project) { res.status(404).json({ message: "Project not found" }); return; }

  const isMember = project.members.some((m) => m.user.toString() === req.user._id.toString());
  if (!isMember) { res.status(403).json({ message: "Not authorized" }); return; }

  const old = (task.description ?? "").substring(0, 50);
  task.description = description;
  await task.save();

  await recordActivity(req.user._id, "updated_task", "Task", taskId, {
    description: `Updated description from "${old}..."`,
  });
  res.status(200).json(task);
};

export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
  const taskId = param(req, "taskId");
  const { status } = req.body as { status: TaskStatus };

  const task = await Task.findById(taskId);
  if (!task) { res.status(404).json({ message: "Task not found" }); return; }

  const project = await Project.findById(task.project);
  if (!project) { res.status(404).json({ message: "Project not found" }); return; }

  const isMember = project.members.some((m) => m.user.toString() === req.user._id.toString());
  if (!isMember) { res.status(403).json({ message: "Not authorized" }); return; }

  const oldStatus = task.status;
  task.status = status;
  await task.save();

  await recordActivity(req.user._id, "updated_task", "Task", taskId, {
    description: `Status changed from "${oldStatus}" to "${status}"`,
  });
  res.status(200).json(task);
};

export const updateTaskAssignees = async (req: Request, res: Response): Promise<void> => {
  const taskId = param(req, "taskId");
  const { assignees } = req.body as { assignees: string[] };

  const task = await Task.findById(taskId);
  if (!task) { res.status(404).json({ message: "Task not found" }); return; }

  const project = await Project.findById(task.project);
  if (!project) { res.status(404).json({ message: "Project not found" }); return; }

  const isMember = project.members.some((m) => m.user.toString() === req.user._id.toString());
  if (!isMember) { res.status(403).json({ message: "Not authorized" }); return; }

  task.assignees = assignees.map((id) => new Types.ObjectId(id));
  await task.save();

  await recordActivity(req.user._id, "updated_task", "Task", taskId, {
    description: `Updated assignees (${assignees.length} total)`,
  });
  res.status(200).json(task);
};

export const updateTaskPriority = async (req: Request, res: Response): Promise<void> => {
  const taskId = param(req, "taskId");
  const { priority } = req.body as { priority: TaskPriority };

  const task = await Task.findById(taskId);
  if (!task) { res.status(404).json({ message: "Task not found" }); return; }

  const project = await Project.findById(task.project);
  if (!project) { res.status(404).json({ message: "Project not found" }); return; }

  const isMember = project.members.some((m) => m.user.toString() === req.user._id.toString());
  if (!isMember) { res.status(403).json({ message: "Not authorized" }); return; }

  const oldPriority = task.priority;
  task.priority = priority;
  await task.save();

  await recordActivity(req.user._id, "updated_task", "Task", taskId, {
    description: `Priority changed from "${oldPriority}" to "${priority}"`,
  });
  res.status(200).json(task);
};

export const addSubTask = async (req: Request, res: Response): Promise<void> => {
  const taskId = param(req, "taskId");
  const { title } = req.body as { title: string };

  const task = await Task.findById(taskId);
  if (!task) { res.status(404).json({ message: "Task not found" }); return; }

  const project = await Project.findById(task.project);
  if (!project) { res.status(404).json({ message: "Project not found" }); return; }

  const isMember = project.members.some((m) => m.user.toString() === req.user._id.toString());
  if (!isMember) { res.status(403).json({ message: "Not authorized" }); return; }

  task.subtasks.push({ title, completed: false, _id: new Types.ObjectId(), createdAt: new Date() });
  await task.save();

  await recordActivity(req.user._id, "created_subtask", "Task", taskId, {
    description: `Created subtask "${title}"`,
  });
  res.status(201).json(task);
};

export const updateSubTask = async (req: Request, res: Response): Promise<void> => {
  const taskId = param(req, "taskId");
  const subTaskId = param(req, "subTaskId");
  const { completed } = req.body as { completed: boolean };

  const task = await Task.findById(taskId);
  if (!task) { res.status(404).json({ message: "Task not found" }); return; }

  const subTask = task.subtasks.find((s) => s._id.toString() === subTaskId);
  if (!subTask) { res.status(404).json({ message: "Subtask not found" }); return; }

  subTask.completed = completed;
  await task.save();

  await recordActivity(req.user._id, "updated_subtask", "Task", taskId, {
    description: `Updated subtask "${subTask.title}"`,
  });
  res.status(200).json(task);
};

export const getActivityByResourceId = async (req: Request, res: Response): Promise<void> => {
  const resourceId = param(req, "resourceId");
  const activity = await ActivityLog.find({ resourceId })
    .populate("user", "name profilePicture")
    .sort({ createdAt: -1 });
  res.status(200).json(activity);
};

export const getCommentsByTaskId = async (req: Request, res: Response): Promise<void> => {
  const taskId = param(req, "taskId");
  const comments = await Comment.find({ task: taskId })
    .populate("author", "name profilePicture")
    .sort({ createdAt: -1 });
  res.status(200).json(comments);
};

export const addComment = async (req: Request, res: Response): Promise<void> => {
  const taskId = param(req, "taskId");
  const { text } = req.body as { text: string };

  const task = await Task.findById(taskId);
  if (!task) { res.status(404).json({ message: "Task not found" }); return; }

  const project = await Project.findById(task.project);
  if (!project) { res.status(404).json({ message: "Project not found" }); return; }

  const isMember = project.members.some((m) => m.user.toString() === req.user._id.toString());
  if (!isMember) { res.status(403).json({ message: "Not authorized" }); return; }

  const comment = await Comment.create({ text, task: taskId, author: req.user._id });
  task.comments.push(comment._id);
  await task.save();

  await recordActivity(req.user._id, "added_comment", "Task", taskId, {
    description: `Added comment: "${text.substring(0, 50)}${text.length > 50 ? "..." : ""}"`,
  });
  res.status(201).json(comment);
};

export const watchTask = async (req: Request, res: Response): Promise<void> => {
  const taskId = param(req, "taskId");

  const task = await Task.findById(taskId);
  if (!task) { res.status(404).json({ message: "Task not found" }); return; }

  const project = await Project.findById(task.project);
  if (!project) { res.status(404).json({ message: "Project not found" }); return; }

  const isMember = project.members.some((m) => m.user.toString() === req.user._id.toString());
  if (!isMember) { res.status(403).json({ message: "Not authorized" }); return; }

  const isWatching = task.watchers.some((w) => w.toString() === req.user._id.toString());
  if (isWatching) {
    task.watchers = task.watchers.filter((w) => w.toString() !== req.user._id.toString());
  } else {
    task.watchers.push(req.user._id);
  }
  await task.save();

  await recordActivity(req.user._id, "updated_task", "Task", taskId, {
    description: `${isWatching ? "Stopped watching" : "Started watching"} task "${task.title}"`,
  });
  res.status(200).json(task);
};

export const achievedTask = async (req: Request, res: Response): Promise<void> => {
  const taskId = param(req, "taskId");

  const task = await Task.findById(taskId);
  if (!task) { res.status(404).json({ message: "Task not found" }); return; }

  const project = await Project.findById(task.project);
  if (!project) { res.status(404).json({ message: "Project not found" }); return; }

  const isMember = project.members.some((m) => m.user.toString() === req.user._id.toString());
  if (!isMember) { res.status(403).json({ message: "Not authorized" }); return; }

  const wasArchived = task.isArchived;
  task.isArchived = !wasArchived;
  await task.save();

  await recordActivity(req.user._id, "updated_task", "Task", taskId, {
    description: `${wasArchived ? "Unachieved" : "Achieved"} task "${task.title}"`,
  });
  res.status(200).json(task);
};

export const getMyTasks = async (req: Request, res: Response): Promise<void> => {
  const tasks = await Task.find({ assignees: { $in: [req.user._id] } })
    .populate("project", "title workspace")
    .sort({ createdAt: -1 });
  res.status(200).json(tasks);
};
