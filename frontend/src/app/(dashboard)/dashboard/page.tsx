import type { Metadata } from "next";
import { Suspense } from "react";
import DashboardClient from "./dashboard-client";

export const metadata: Metadata = {
  title: "Tableau de bord — Bloom",
  description: "Vue d'ensemble et métriques de productivité de vos projets Bloom.",
};

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            color: "#64748B",
            fontSize: 14,
          }}
        >
          Chargement du tableau de bord...
        </div>
      }
    >
      <DashboardClient />
    </Suspense>
  );
}
