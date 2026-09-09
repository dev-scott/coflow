import type { Metadata } from "next";
import WorkspacesClient from "./workspaces-client";

export const metadata: Metadata = { title: "Workspaces" };

export default function WorkspacesPage() {
  return <WorkspacesClient />;
}
