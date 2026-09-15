import type { Metadata } from "next";
import WorkspaceDetailClient from "./workspace-detail-client";

export const metadata: Metadata = { title: "Workspace" };

export default function WorkspaceDetailPage({ params }: { params: { workspaceId: string } }) {
  return <WorkspaceDetailClient workspaceId={params.workspaceId} />;
}
