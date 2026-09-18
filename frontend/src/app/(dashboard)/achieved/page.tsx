import type { Metadata } from "next";
import AchievedClient from "./achieved-client";

export const metadata: Metadata = {
  title: "Réalisés — Bloom",
  description: "Historique et métriques de vos tâches et projets accomplis sur Bloom.",
};

export default function AchievedPage() {
  return <AchievedClient />;
}
