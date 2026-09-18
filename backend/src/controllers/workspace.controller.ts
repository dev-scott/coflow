import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Workspace from "../models/Workspace.model.js";
import Project from "../models/Project.model.js";
import User from "../models/User.model.js";
import WorkspaceInvite from "../models/WorkspaceInvite.model.js";
import { sendEmail } from "../lib/send-email.js";
import { recordActivity, isValidObjectId } from "../lib/index.js";
import { PLAN_LIMITS, isUserPro } from "../lib/plan-limits.js";
import { getFrontendBaseUrl } from "../lib/urls.js";
import type { WorkspaceMemberRole } from "../models/Workspace.model.js";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const createWorkspace = async (req: Request, res: Response): Promise<void> => {
  const { name, description, color } = req.body as {
    name: string;
    description?: string;
    color: string;
  };

  const user = await User.findById(req.user._id);
  if (!isUserPro(user)) {
    const ownedCount = await Workspace.countDocuments({ owner: req.user._id });
    if (ownedCount >= PLAN_LIMITS.starter.maxWorkspaces) {
      res.status(403).json({
        code: "PLAN_LIMIT_REACHED",
        limitType: "workspaces",
        limit: PLAN_LIMITS.starter.maxWorkspaces,
        current: ownedCount,
        message: `Vous avez atteint la limite de ${PLAN_LIMITS.starter.maxWorkspaces} espaces de travail du plan Starter. Passez au plan Pro pour créer des espaces illimités.`,
      });
      return;
    }
  }

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
    res.status(403).json({ message: "Seuls les administrateurs et propriétaires peuvent inviter des membres" });
    return;
  }

  // Vérifier la limite de membres selon le plan du propriétaire de l'espace
  const owner = await User.findById(workspace.owner);
  if (!isUserPro(owner)) {
    if (workspace.members.length >= PLAN_LIMITS.starter.maxMembersPerWorkspace) {
      res.status(403).json({
        code: "PLAN_LIMIT_REACHED",
        limitType: "members",
        limit: PLAN_LIMITS.starter.maxMembersPerWorkspace,
        current: workspace.members.length,
        message: `Cet espace de travail a atteint la limite de ${PLAN_LIMITS.starter.maxMembersPerWorkspace} membres du plan Starter. Passez au plan Pro pour inviter des collaborateurs en illimité.`,
      });
      return;
    }
  }

  const emailLower = email.trim().toLowerCase();
  const target = await User.findOne({ email: emailLower });
  if (target && workspace.members.some((m) => m.user.toString() === target._id.toString())) {
    res.status(400).json({ message: "Cet utilisateur est déjà membre de cet espace de travail" });
    return;
  }

  // Nettoyer les anciennes invitations pour cet email sur cet espace
  await WorkspaceInvite.deleteMany({ email: emailLower, workspaceId });

  const inviteToken = jwt.sign(
    { email: emailLower, workspaceId, role: role ?? "member", userId: target?._id?.toString() },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  await WorkspaceInvite.create({
    email: emailLower,
    user: target?._id,
    workspaceId,
    token: inviteToken,
    role: role ?? "member",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const baseUrl = getFrontendBaseUrl(req);
  const link = `${baseUrl}/workspace-invite/${workspace._id}?tk=${inviteToken}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #1E293B; margin-top: 0;">Rejoignez l'espace de travail Bloom</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6;">
        Vous avez été invité(e) par <strong>${req.user.name || "un collaborateur"}</strong> à rejoindre l'espace de travail <strong>${workspace.name}</strong> avec le rôle de <strong>${role === "admin" ? "Administrateur" : role === "viewer" ? "Lecteur" : "Membre"}</strong>.
      </p>
      <div style="margin: 28px 0;">
        <a href="${link}" style="display: inline-block; background: #3B805C; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
          Accepter l'invitation et rejoindre
        </a>
      </div>
      <p style="color: #94A3B8; font-size: 13px; line-height: 1.5;">
        Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br/>
        <a href="${link}" style="color: #3B805C; word-break: break-all;">${link}</a>
      </p>
      <hr style="border: none; border-top: 1px solid #F1F5F9; margin: 24px 0;" />
      <p style="color: #94A3B8; font-size: 12px; margin: 0;">Ce lien expirera dans 7 jours.</p>
    </div>
  `;

  await sendEmail(emailLower, `Invitation à rejoindre l'espace "${workspace.name}" sur Bloom`, html);
  res.status(200).json({
    message: "Invitation envoyée avec succès",
    inviteLink: link,
    token: inviteToken,
    role: role ?? "member",
  });
};

export const getInviteDetails = async (req: Request, res: Response): Promise<void> => {
  const token = (req.query.token as string) || (req.body?.token as string);
  if (!token) {
    res.status(400).json({ message: "Jeton d'invitation manquant" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      email: string;
      workspaceId: string;
      role: WorkspaceMemberRole;
    };

    const workspace = await Workspace.findById(decoded.workspaceId)
      .select("name description color owner members")
      .populate("owner", "name email");

    if (!workspace) {
      res.status(404).json({ message: "Espace de travail introuvable" });
      return;
    }

    res.status(200).json({
      workspace: {
        _id: workspace._id,
        name: workspace.name,
        description: workspace.description,
        color: workspace.color,
        owner: workspace.owner,
        memberCount: workspace.members.length,
      },
      email: decoded.email,
      role: decoded.role,
    });
  } catch (err) {
    res.status(400).json({ message: "Lien d'invitation invalide ou expiré" });
  }
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

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      email?: string;
      user?: string;
      workspaceId: string;
      role: WorkspaceMemberRole;
    };

    const workspace = await Workspace.findById(decoded.workspaceId);
    if (!workspace) {
      res.status(404).json({ message: "Espace de travail introuvable" });
      return;
    }

    const alreadyMember = workspace.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (alreadyMember) {
      res.status(200).json({
        message: "Vous êtes déjà membre de cet espace de travail",
        workspaceId: workspace._id,
      });
      return;
    }

    const invite = await WorkspaceInvite.findOne({
      workspaceId: decoded.workspaceId,
      token,
    });

    if (!invite || invite.expiresAt < new Date()) {
      res.status(400).json({ message: "Invitation expirée ou introuvable" });
      return;
    }

    workspace.members.push({
      user: req.user._id,
      role: invite.role ?? decoded.role ?? "member",
      joinedAt: new Date(),
    });

    await workspace.save();

    await Promise.all([
      WorkspaceInvite.deleteOne({ _id: invite._id }),
      recordActivity(req.user._id, "joined_workspace", "Workspace", workspace._id.toString(), {
        description: `A rejoint l'espace ${workspace.name}`,
      }),
    ]);

    res.status(200).json({
      message: `Félicitations ! Vous avez rejoint "${workspace.name}" avec succès`,
      workspaceId: workspace._id,
    });
  } catch (err) {
    res.status(400).json({ message: "Jeton d'invitation invalide ou expiré" });
  }
};
