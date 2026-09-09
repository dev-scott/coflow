import { Suspense } from "react";
import type { Metadata } from "next";
import SignInClient from "./sign-in-client";

export const metadata: Metadata = { title: "Connexion" };

export default function SignInPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "40px 0", color: "#666" }}>Chargement...</div>}>
      <SignInClient />
    </Suspense>
  );
}
