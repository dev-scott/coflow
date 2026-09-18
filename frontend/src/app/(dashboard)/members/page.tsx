import type { Metadata } from "next";
import MembersClient from "./members-client";

export const metadata: Metadata = {
  title: "Membres — Bloom",
  description: "Annuaire des membres et gestion des rôles d'équipe sur Bloom.",
};

export default function MembersPage() {
  return <MembersClient />;
}
