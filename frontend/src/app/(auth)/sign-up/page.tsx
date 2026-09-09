import type { Metadata } from "next";
import SignUpClient from "./sign-up-client";

export const metadata: Metadata = { title: "Créer un compte" };

export default function SignUpPage() {
  return <SignUpClient />;
}
