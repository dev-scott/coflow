import { Suspense } from "react";
import type { Metadata } from "next";
import ResetPasswordClient from "./reset-password-client";

export const metadata: Metadata = { title: "Réinitialiser le mot de passe" };

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "40px 0", color: "#666" }}>Chargement...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
