"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Archive,
  Settings,
  Plus,
  Zap,
  ArrowRight,
  Sparkles,
  Command,
  X,
  LogOut,
} from "lucide-react";
import { trackEngagement } from "@/lib/analytics";
import { useAuth } from "@/providers/auth-provider";

export interface CommandItem {
  id: string;
  title: string;
  description?: string;
  category: "Navigation" | "Actions" | "Système";
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpgrade?: () => void;
  onOpenInvite?: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenUpgrade,
  onOpenInvite,
}: CommandPaletteProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items: CommandItem[] = useMemo(() => {
    return [
      {
        id: "nav-dashboard",
        title: "Tableau de bord",
        description: "Vue d'ensemble de vos activités et indicateurs",
        category: "Navigation",
        icon: LayoutDashboard,
        shortcut: "G D",
        action: () => router.push("/dashboard"),
      },
      {
        id: "nav-workspaces",
        title: "Espaces de travail",
        description: "Gérer et parcourir vos espaces",
        category: "Navigation",
        icon: FolderKanban,
        shortcut: "G W",
        action: () => router.push("/workspaces"),
      },
      {
        id: "nav-tasks",
        title: "Mes tâches",
        description: "Toutes les tâches qui vous sont assignées",
        category: "Navigation",
        icon: CheckSquare,
        shortcut: "G T",
        action: () => router.push("/my-tasks"),
      },
      {
        id: "nav-members",
        title: "Équipe & Membres",
        description: "Collaborateurs, invitations et gestion des rôles",
        category: "Navigation",
        icon: Users,
        shortcut: "G M",
        action: () => router.push("/members"),
      },
      {
        id: "nav-achieved",
        title: "Réalisés & Archives",
        description: "Historique des tâches et projets terminés",
        category: "Navigation",
        icon: Archive,
        action: () => router.push("/achieved"),
      },
      {
        id: "nav-settings",
        title: "Paramètres",
        description: "Configuration du compte et préférences",
        category: "Navigation",
        icon: Settings,
        shortcut: "G S",
        action: () => router.push("/settings"),
      },
      {
        id: "action-new-workspace",
        title: "Créer un nouvel espace de travail",
        description: "Ajouter un environnement dédié pour un projet ou équipe",
        category: "Actions",
        icon: Plus,
        action: () => router.push("/workspaces?create=true"),
      },
      {
        id: "action-invite-member",
        title: "Inviter un collaborateur",
        description: "Partager un lien ou envoyer une invitation par email",
        category: "Actions",
        icon: Users,
        action: () => {
          if (onOpenInvite) {
            onOpenInvite();
          } else {
            router.push("/members");
          }
        },
      },
      {
        id: "action-upgrade",
        title: "Débloquer le Plan Pro",
        description: "Espaces illimités, membres illimités et analytics avancés",
        category: "Actions",
        icon: Zap,
        action: () => {
          if (onOpenUpgrade) {
            onOpenUpgrade();
          } else {
            router.push("/settings#billing");
          }
        },
      },
      {
        id: "system-logout",
        title: "Se déconnecter",
        description: "Fermer la session actuelle en toute sécurité",
        category: "Système",
        icon: LogOut,
        action: () => logout(),
      },
    ];
  }, [router, logout, onOpenUpgrade, onOpenInvite]);

  // Filtrage selon la recherche
  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase().trim();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [items, query]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      trackEngagement("command_palette", "open");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Raccourcis clavier au sein de la palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        trackEngagement("command_palette", "select", {
          itemId: selected.id,
          title: selected.title,
          query,
        });
        selected.action();
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "14vh",
        paddingLeft: 16,
        paddingRight: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 580,
          background: "#FFFFFF",
          borderRadius: 16,
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.08)",
          overflow: "hidden",
          animation: "scaleIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Champ de recherche */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
            gap: 12,
          }}
        >
          <Search size={20} color="#64748B" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une page, une action ou une commande..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 15,
              fontWeight: 500,
              color: "#0F172A",
              background: "transparent",
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                borderRadius: 4,
                color: "#94A3B8",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={16} />
            </button>
          )}
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#64748B",
              background: "#F1F5F9",
              padding: "2px 6px",
              borderRadius: 4,
              border: "1px solid #E2E8F0",
            }}
          >
            ESC
          </span>
        </div>

        {/* Liste des résultats */}
        <div
          style={{
            maxHeight: 360,
            overflowY: "auto",
            padding: "8px 10px",
          }}
        >
          {filteredItems.length === 0 ? (
            <div
              style={{
                padding: "36px 20px",
                textAlign: "center",
                color: "#64748B",
                fontSize: 13.5,
              }}
            >
              Aucun résultat pour <span style={{ fontWeight: 600 }}>&ldquo;{query}&rdquo;</span>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    trackEngagement("command_palette", "select", {
                      itemId: item.id,
                      title: item.title,
                      query,
                    });
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: 10,
                    cursor: "pointer",
                    background: isSelected ? "rgba(59, 128, 92, 0.08)" : "transparent",
                    transition: "all 0.1s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: isSelected ? "rgba(59, 128, 92, 0.15)" : "#F1F5F9",
                        color: isSelected ? "#2D6A4F" : "#475569",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: isSelected ? 700 : 600,
                          color: isSelected ? "#2D6A4F" : "#1E293B",
                        }}
                      >
                        {item.title}
                      </div>
                      {item.description && (
                        <div
                          style={{
                            fontSize: 11.5,
                            color: "#64748B",
                            marginTop: 1,
                          }}
                        >
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: "#94A3B8",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {item.category}
                    </span>
                    {item.shortcut && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#64748B",
                          background: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                          padding: "1px 6px",
                          borderRadius: 4,
                        }}
                      >
                        {item.shortcut}
                      </span>
                    )}
                    {isSelected && <ArrowRight size={14} color="#2D6A4F" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pied de la palette */}
        <div
          style={{
            padding: "10px 16px",
            background: "#F8FAFC",
            borderTop: "1px solid rgba(15, 23, 42, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 11.5,
            color: "#64748B",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span>
              <kbd style={{ padding: "1px 5px", background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: 3, fontWeight: 600 }}>↑</kbd>{" "}
              <kbd style={{ padding: "1px 5px", background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: 3, fontWeight: 600 }}>↓</kbd> Naviguer
            </span>
            <span>
              <kbd style={{ padding: "1px 5px", background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: 3, fontWeight: 600 }}>↵</kbd> Valider
            </span>
            <span>
              <kbd style={{ padding: "1px 5px", background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: 3, fontWeight: 600 }}>Échap</kbd> Fermer
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#2D6A4F", fontWeight: 600 }}>
            <Sparkles size={12} />
            <span>Bloom QuickNav</span>
          </div>
        </div>
      </div>
    </div>
  );
}
