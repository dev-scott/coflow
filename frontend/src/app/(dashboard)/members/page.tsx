import type { Metadata } from "next";
import MembersClient from "./members-client";

export const metadata: Metadata = {
  title: "Membres — CoFlow",
  description: "Annuaire des membres et gestion des rôles d'équipe sur CoFlow.",
};

export default function MembersPage() {
  return <MembersClient />;
}
