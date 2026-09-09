import { Request, Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Workspace from "../models/Workspace.model.js";
import Project from "../models/Project.model.js";
import User from "../models/User.model.js";
import WorkspaceInvite from "../models/WorkspaceInvite.model.js";
import { sendEmail } from "../lib/send-email.js";
import { recordActivity, isValidObjectId } from "../lib/index.js";
import type { WorkspaceMemberRole } from "../models/Workspace.model.js";

const JWT_SECRET = process.env.JWT_SECRET as string;
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";

export const createWorkspace = async (req: Request, res: Response): Promise<void> => {
  const { name, description, color } = req.body as {
    name: string;
    description?: string;
    color: string;
  };

  const workspace = await Workspace.create({
    name,
    description,
    color,
    owner: req.user._id,
    members: [{ user: req.user._id, role: "owner", joinedAt: new Date() }],
  });

  res.status(201).json(workspace);
};

export const getWorkspaces = async (req: Request, res: Response): Promise<void> => {
  const workspaces = await Workspace.find({
    "members.user": req.user._id,
  }).sort({ createdAt: -1 });

  res.status(200).json(workspaces);
};

export const getWorkspaceDetails = async (req: Request, res: Response): Promise<void> => {
  const { workspaceId } = req.params;

  if (!isValidObjectId(workspaceId)) {
    res.status(404).json({ message: "Workspace not found" });
    return;
  }

  const workspace = await Workspace.findById(workspaceId).populate(
    "members.user",
    "name email profilePicture"
  );

  if (!workspace) {
    res.status(404).json({ message: "Workspace not found" });
    return;
  }

  res.status(200).json(workspace);
};

export const getWorkspaceProjects = async (req: Request, res: Response): Promise<void> => {
  const { workspaceId } = req.params;

  if (!isValidObjectId(workspaceId)) {
    res.status(404).json({ message: "Workspace not found" });
    return;
  }

  const workspace = await Workspace.findOne({
    _id: workspaceId,
    "members.user": req.user._id,
  }).populate("members.user", "name email profilePicture");

  if (!workspace) {
    res.status(404).json({ message: "Workspace not found" });
    return;
  }

  const projects = await Project.find({
    workspace: workspaceId,
    isArchived: false,
    members: { $elemMatch: { user: req.user._id } },
  })
    .populate("tasks", "status")
    .sort({ createdAt: -1 });

  res.status(200).json({ projects, workspace });
};

export const getWorkspaceStats = async (req: Request, res: Response): Promise<void> => {
  const { workspaceId } = req.params;

  if (!isValidObjectId(workspaceId)) {
    res.status(404).json({ message: "Workspace not found" });
    return;
  }

  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    res.status(404).json({ message: "Workspace not found" });
    return;
  }

  const isMember = workspace.members.some(
    (m) => m.user.toString() === req.user._id.toString()
  );

  if (!isMember) {
    res.status(403).json({ message: "You are not a member of this workspace" });
    return;
  }

  const [totalProjects, projects] = await Promise.all([
    Project.countDocuments({ workspace: workspaceId }),
    Project.find({ workspace: workspaceId })
      .populate("tasks", "title status dueDate project updatedAt isArchived priority")
      .sort({ createdAt: -1 }),
  ]);

  const totalTasks = projects.reduce((acc, p) => acc + p.tasks.length, 0);
  const totalProjectInProgress = projects.filter((p) => p.status === "In Progress").length;

  // Task aggregations — tasks are populated, cast through unknown for type safety
  const allTasks = projects.flatMap((p) => p.tasks as unknown as { status: string; priority: string; dueDate?: Date; updatedAt: Date; isArchived: boolean; project: unknown; _id: unknown }[]);
  const totalTaskCompleted = allTasks.filter((t) => t.status === "Done").length;
  const totalTaskToDo = allTasks.filter((t) => t.status === "To Do").length;
  const totalTaskInProgress = allTasks.filter((t) => t.status === "In Progress").length;

  // Upcoming tasks (next 7 days)
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingTasks = allTasks.filter(
    (t) => t.dueDate && t.dueDate > now && t.dueDate <= in7Days
  );

  // Task trends (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  }).reverse();

  const taskTrendsData = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
    (name) => ({ name, completed: 0, inProgress: 0, toDo: 0 })
  );

  for (const project of projects) {
    for (const task of project.tasks as unknown as { status: string; updatedAt: Date }[]) {
      const taskDate = new Date(task.updatedAt);
      const dayIdx = last7Days.findIndex(
        (d) =>
          d.getDate() === taskDate.getDate() &&
          d.getMonth() === taskDate.getMonth() &&
          d.getFullYear() === taskDate.getFullYear()
      );
      if (dayIdx !== -1) {
        const dayName = last7Days[dayIdx].toLocaleDateString("en-US", { weekday: "short" });
        const dayData = taskTrendsData.find((d) => d.name === dayName);
        if (dayData) {
          if (task.status === "Done") dayData.completed++;
          else if (task.status === "In Progress") dayData.inProgress++;
          else if (task.status === "To Do") dayData.toDo++;
        }
      }
    }
  }

  // Status/priority distributions
  const projectStatusData = [
    { name: "Completed", value: 0, color: "#10b981" },
    { name: "In Progress", value: 0, color: "#3b82f6" },
    { name: "Planning", value: 0, color: "#f59e0b" },
  ];
  for (const p of projects) {
    if (p.status === "Completed") projectStatusData[0].value++;
    else if (p.status === "In Progress") projectStatusData[1].value++;
    else if (p.status === "Planning") projectStatusData[2].value++;
  }

  const taskPriorityData = [
    { name: "High", value: 0, color: "#ef4444" },
    { name: "Medium", value: 0, color: "#f59e0b" },
    { name: "Low", value: 0, color: "#6b7280" },
  ];
  for (const t of allTasks) {
    if (t.priority === "High") taskPriorityData[0].value++;
    else if (t.priority === "Medium") taskPriorityData[1].value++;
    else if (t.priority === "Low") taskPriorityData[2].value++;
  }

  const workspaceProductivityData = projects.map((p) => {
    const pTasks = allTasks.filter(
      (t) => String(t.project) === String(p._id)
    );
    return {
      name: p.title,
      completed: pTasks.filter((t) => t.status === "Done" && !t.isArchived).length,
      total: pTasks.length,
    };
  });

  res.status(200).json({
    stats: { totalProjects, totalTasks, totalProjectInProgress, totalTaskCompleted, totalTaskToDo, totalTaskInProgress },
    taskTrendsData,
    projectStatusData,
    taskPriorityData,
    workspaceProductivityData,
    upcomingTasks,
    recentProjects: projects.slice(0, 5),
  });
};

export const inviteUserToWorkspace = async (req: Request, res: Response): Promise<void> => {
  const { workspaceId } = req.params;
  const { email, role } = req.body as { email: string; role?: WorkspaceMemberRole };

  if (!isValidObjectId(workspaceId)) {
    res.status(404).json({ message: "Workspace not found" });
    return;
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    res.status(404).json({ message: "Workspace not found" });
    return;
  }

  const memberInfo = workspace.members.find(
    (m) => m.user.toString() === req.user._id.toString()
  );

  if (!memberInfo || !["admin", "owner"].includes(memberInfo.role)) {
    res.status(403).json({ message: "Not authorized to invite members" });
    return;
  }

  const target = await User.findOne({ email });
  if (!target) {
    res.status(400).json({ message: "User not found" });
    return;
  }

  if (workspace.members.some((m) => m.user.toString() === target._id.toString())) {
    res.status(400).json({ message: "User already a member of this workspace" });
    return;
  }

  const existingInvite = await WorkspaceInvite.findOne({
    user: target._id,
    workspaceId,
  });

  if (existingInvite && existingInvite.expiresAt > new Date()) {
    res.status(400).json({ message: "User already invited" });
    return;
  }

  if (existingInvite) {
    await WorkspaceInvite.deleteOne({ _id: existingInvite._id });
  }

  const inviteToken = jwt.sign(
    { user: target._id, workspaceId, role: role ?? "member" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  await WorkspaceInvite.create({
    user: target._id,
    workspaceId,
    token: inviteToken,
    role: role ?? "member",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const link = `${FRONTEND_URL}/workspace-invite/${workspace._id}?tk=${inviteToken}`;
  const html = `
    <p>Vous avez été invité à rejoindre le workspace <strong>${workspace.name}</strong>.</p>
    <p><a href="${link}">Cliquez ici pour rejoindre</a></p>
  `;

  await sendEmail(email, "Invitation à rejoindre un workspace", html);
  res.status(200).json({ message: "Invitation sent successfully" });
};

export const acceptGenerateInvite = async (req: Request, res: Response): Promise<void> => {
  const { workspaceId } = req.params;

  if (!isValidObjectId(workspaceId)) {
    res.status(404).json({ message: "Workspace not found" });
    return;
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    res.status(404).json({ message: "Workspace not found" });
    return;
  }

  if (workspace.members.some((m) => m.user.toString() === req.user._id.toString())) {
    res.status(400).json({ message: "You are already a member of this workspace" });
    return;
  }

  workspace.members.push({ user: req.user._id, role: "member", joinedAt: new Date() });
  await workspace.save();

  await recordActivity(req.user._id, "joined_workspace", "Workspace", workspaceId, {
    description: `Joined ${workspace.name} workspace`,
  });

  res.status(200).json({ message: "Invitation accepted successfully" });
};

export const acceptInviteByToken = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body as { token: string };

  const decoded = jwt.verify(token, JWT_SECRET) as {
    user: string;
    workspaceId: string;
    role: WorkspaceMemberRole;
  };

  const workspace = await Workspace.findById(decoded.workspaceId);
  if (!workspace) {
    res.status(404).json({ message: "Workspace not found" });
    return;
  }

  if (workspace.members.some((m) => m.user.toString() === decoded.user)) {
    res.status(400).json({ message: "User already a member of this workspace" });
    return;
  }

  const invite = await WorkspaceInvite.findOne({
    user: decoded.user,
    workspaceId: decoded.workspaceId,
  });

  if (!invite || invite.expiresAt < new Date()) {
    res.status(400).json({ message: "Invitation expired or not found" });
    return;
  }

  workspace.members.push({
    user: new mongoose.Types.ObjectId(decoded.user),
    role: decoded.role ?? "member",
    joinedAt: new Date(),
  });

  await workspace.save();

  await Promise.all([
    WorkspaceInvite.deleteOne({ _id: invite._id }),
    recordActivity(decoded.user, "joined_workspace", "Workspace", decoded.workspaceId, {
      description: `Joined ${workspace.name} workspace`,
    }),
  ]);

  res.status(200).json({ message: "Invitation accepted successfully" });
};
