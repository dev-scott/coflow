import type { Metadata } from "next";
import TaskDetailClient from "./task-detail-client";

export const metadata: Metadata = { title: "Tâche" };

export default function TaskDetailPage({ params }: { params: { taskId: string } }) {
  return <TaskDetailClient taskId={params.taskId} />;
}
