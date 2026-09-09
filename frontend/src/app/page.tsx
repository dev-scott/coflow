import type { Metadata } from "next";
import HomeClient from "./home-client";

export const metadata: Metadata = {
  title: "CoFlow — Gérez vos projets autrement",
  description:
    "CoFlow est le gestionnaire de projets collaboratif qui rend la gestion de projet aussi simple qu'une conversation. Organisez, collaborez et livrez plus vite.",
};

export default function HomePage() {
  return <HomeClient />;
}
