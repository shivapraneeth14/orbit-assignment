import type {
  ProjectStatus,
  TaskStatus,
  TaskPriority,
  WorkspaceRole,
} from "@/generated/prisma/enums";

export type { ProjectStatus, TaskStatus, TaskPriority, WorkspaceRole };

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  role: WorkspaceRole;
  projectCount: number;
}

export interface Member {
  id: string;
  userId: string;
  role: WorkspaceRole;
  name: string;
  email: string;
  avatarColor: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  color: string;
  status: ProjectStatus;
  createdAt: string;
  taskCount: number;
  doneCount: number;
  progress: number;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  assignee?: Pick<User, "id" | "name" | "avatarColor"> | null;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  createdAt: string;
  author: Pick<User, "id" | "name" | "avatarColor">;
}

export const TASK_STATUSES: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
];

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

export const TASK_PRIORITIES: TaskPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};
