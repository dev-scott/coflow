import type { Metadata } from "next";
import MyTasksClient from "./my-tasks-client";

export const metadata: Metadata = { title: "Mes tâches" };

export default function MyTasksPage() {
  return <MyTasksClient />;
}
