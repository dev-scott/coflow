import type { Metadata } from "next";
import ProjectDetailClient from "./project-detail-client";

export const metadata: Metadata = { title: "Projet" };

export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  return <ProjectDetailClient projectId={params.projectId} />;
}
