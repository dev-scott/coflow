import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CoFlow — Gestionnaire de projets collaboratif",
    template: "%s | CoFlow",
  },
  description:
    "CoFlow est un outil de gestion de projets collaboratif qui simplifie la coordination d'équipes, le suivi des tâches et la productivité.",
  keywords: ["gestion de projet", "collaboration", "tâches", "équipe", "productivité"],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "CoFlow",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                },
              }}
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
