// Re-export shared types from @coflow/types
// Until workspace symlinks are set up, we duplicate minimal types here
// TODO: import from "@coflow/types" once workspace is bootstrapped

export interface User {
  _id: string;
  email: string;
  name: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkspaceMemberRole = "owner" | "admin" | "member" | "viewer";

export interface WorkspaceMember {
  user: User;
  role: WorkspaceMemberRole;
  joinedAt: Date;
}

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  color: string;
  owner: User | string;
  members: WorkspaceMember[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectStatus = "Planning" | "In Progress" | "On Hold" | "Completed" | "Cancelled";
export type ProjectMemberRole = "manager" | "contributor" | "viewer";

export interface ProjectMember {
  user: User;
  role: ProjectMemberRole;
}

export interface Project {
  _id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  workspace: Workspace | string;
  startDate: Date;
  dueDate?: Date;
  tags?: string[];
  progress: number;
  tasks: Task[] | string[];
  members: ProjectMember[];
  createdBy: User | string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = "To Do" | "In Progress" | "Review" | "Done";
export type TaskPriority = "Low" | "Medium" | "High";

export interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface Attachment {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  uploadedBy: User | string;
  uploadedAt: Date;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: Project | string;
  assignees: User[];
  watchers?: User[];
  subtasks?: Subtask[];
  attachments?: Attachment[];
  dueDate?: Date;
  isArchived: boolean;
  tags?: string[];
  createdBy: User | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  _id: string;
  text: string;
  task: Task | string;
  author: User;
  reactions?: { emoji: string; user: User }[];
  createdAt: Date;
  updatedAt: Date;
}

export type ActionType =
  | "created_task" | "updated_task" | "created_subtask" | "updated_subtask"
  | "completed_task" | "created_project" | "updated_project" | "completed_project"
  | "created_workspace" | "updated_workspace" | "added_comment" | "added_member"
  | "removed_member" | "joined_workspace" | "added_attachment";

export interface ActivityLog {
  _id: string;
  user: User;
  action: ActionType;
  resourceType: string;
  resourceId: string;
  details: Record<string, unknown>;
  createdAt: Date;
}

export interface WorkspaceStats {
  totalProjects: number;
  totalTasks: number;
  totalProjectInProgress: number;
  totalTaskCompleted: number;
  totalTaskToDo: number;
  totalTaskInProgress: number;
}

export interface WorkspaceStatsResponse {
  stats: WorkspaceStats;
  taskTrendsData: { name: string; completed: number; inProgress: number; toDo: number }[];
  projectStatusData: { name: string; value: number; color: string }[];
  taskPriorityData: { name: string; value: number; color: string }[];
  workspaceProductivityData: { name: string; completed: number; total: number }[];
  upcomingTasks: Task[];
  recentProjects: Project[];
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
