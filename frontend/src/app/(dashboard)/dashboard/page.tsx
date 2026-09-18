import type { Metadata } from "next";
import DashboardClient from "./dashboard-client";

export const metadata: Metadata = {
  title: "Tableau de bord — Bloom",
  description: "Vue d'ensemble et métriques de productivité de vos projets Bloom.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
