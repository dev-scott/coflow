import type { Metadata } from "next";
import { Suspense } from "react";
import WorkspaceInviteClient from "./workspace-invite-client";

export const metadata: Metadata = {
  title: "Invitation à un espace de travail | Bloom",
  description: "Rejoignez un espace de travail Bloom pour collaborer avec votre équipe.",
};

export default async function WorkspaceInvitePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#64748B", fontSize: 14 }}>
          Chargement de l'invitation...
        </div>
      }
    >
      <WorkspaceInviteClient workspaceId={workspaceId} />
    </Suspense>
  );
}
