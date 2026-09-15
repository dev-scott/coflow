import { Suspense } from "react";
import VerifyEmailClient from "./verify-email-client";

export const metadata = {
  title: "Vérification de compte | CoFlow",
  description: "Activez votre compte CoFlow en vérifiant votre adresse email.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: 32, fontSize: 13.5, color: "var(--muted-foreground)" }}>Chargement...</div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
