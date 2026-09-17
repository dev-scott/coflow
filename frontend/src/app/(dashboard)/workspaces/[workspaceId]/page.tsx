import type { Metadata } from "next";
import WorkspaceDetailClient from "./workspace-detail-client";

export const metadata: Metadata = { title: "Workspace" };

export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <WorkspaceDetailClient workspaceId={workspaceId} />;
}
