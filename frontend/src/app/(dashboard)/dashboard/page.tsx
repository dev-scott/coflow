import type { Metadata } from "next";
import DashboardClient from "./dashboard-client";

export const metadata: Metadata = {
  title: "Tableau de bord — CoFlow",
  description: "Vue d'ensemble et métriques de productivité de vos projets CoFlow.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
