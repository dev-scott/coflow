import { Suspense } from "react";
import type { Metadata } from "next";
import SignUpClient from "./sign-up-client";

export const metadata: Metadata = { title: "Créer un compte" };

export default function SignUpPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "40px 0", color: "#666" }}>Chargement...</div>}>
      <SignUpClient />
    </Suspense>
  );
}
