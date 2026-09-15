import { Request, Response } from "express";
import Workspace from "../models/Workspace.model.js";
import Project from "../models/Project.model.js";
import Task from "../models/Task.model.js";
import User from "../models/User.model.js";
import { isValidObjectId } from "../lib/index.js";
import { PLAN_LIMITS, isUserPro } from "../lib/plan-limits.js";
import type { ProjectStatus, ProjectMemberRole } from "../models/Project.model.js";

export const createProject = async (req: Request, res: Response): Promise<void> => {
  const { workspaceId } = req.params;
  const { title, description, status, startDate, dueDate, tags, members } = req.body as {
    title: string;
    description?: string;
    status: ProjectStatus;
    startDate: string;
    dueDate?: string;
    tags?: string;
    members?: { user: string; role: ProjectMemberRole }[];
  };

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

  // Vérifier la limite de projets selon le plan du propriétaire de l'espace
  const owner = await User.findById(workspace.owner);
  if (!isUserPro(owner)) {
    const projectCount = await Project.countDocuments({ workspace: workspaceId });
    if (projectCount >= PLAN_LIMITS.starter.maxProjectsPerWorkspace) {
      res.status(403).json({
        code: "PLAN_LIMIT_REACHED",
        limitType: "projects",
        limit: PLAN_LIMITS.starter.maxProjectsPerWorkspace,
        current: projectCount,
        message: `Cet espace de travail a atteint la limite de ${PLAN_LIMITS.starter.maxProjectsPerWorkspace} projets du plan Starter. Passez au plan Pro pour créer des projets illimités.`,
      });
      return;
    }
  }

  const tagArray = tags ? tags.split(",").map((t) => t.trim()) : [];

  const project = await Project.create({
    title,
    description,
    status,
    startDate,
    dueDate,
    tags: tagArray,
    workspace: workspaceId,
    members,
    createdBy: req.user._id,
  });

  workspace.projects.push(project._id);
  await workspace.save();

  res.status(201).json(project);
};

export const getProjectDetails = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params;

  if (!isValidObjectId(projectId)) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  const isMember = project.members.some(
    (m) => m.user.toString() === req.user._id.toString()
  );
  if (!isMember) {
    res.status(403).json({ message: "You are not a member of this project" });
    return;
  }

  res.status(200).json(project);
};

export const getProjectTasks = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params;

  if (!isValidObjectId(projectId)) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  const project = await Project.findById(projectId).populate("members.user");
  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  const isMember = project.members.some(
    (m) => m.user._id.toString() === req.user._id.toString()
  );
  if (!isMember) {
    res.status(403).json({ message: "You are not a member of this project" });
    return;
  }

  const tasks = await Task.find({ project: projectId, isArchived: false })
    .populate("assignees", "name profilePicture")
    .sort({ createdAt: -1 });

  res.status(200).json({ project, tasks });
};
