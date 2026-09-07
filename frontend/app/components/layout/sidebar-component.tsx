import { cn } from "@/lib/utils";
import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  ListCheck,
  LogOut,
  Settings,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { ScrollArea } from "../ui/scroll-area";
import { SidebarNav } from "./sidebar-nav";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const SidebarComponent = ({
  currentWorkspace,
}: {
  currentWorkspace: Workspace | null;
}) => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Workspaces",
      href: "/workspaces",
      icon: FolderKanban,
    },
    {
      title: "My Tasks",
      href: "/my-tasks",
      icon: ListCheck,
    },
    {
      title: "Members",
      href: `/members`,
      icon: Users,
    },
    {
      title: "Achieved",
      href: `/achieved`,
      icon: CheckCircle2,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div
      className={cn(
        "relative flex flex-col border-r transition-all duration-300 ease-in-out flex-shrink-0",
        "border-white/[0.06]",
        isCollapsed ? "w-[64px]" : "w-[64px] md:w-[240px]"
      )}
      style={{ background: "var(--gradient-sidebar)" }}
    >
      {/* Top gradient accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, #7c3aed55, #06b6d455, transparent)",
        }}
      />

      {/* Logo */}
      <div className="flex h-14 items-center border-b border-white/[0.06] px-3 flex-shrink-0">
        <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-base tracking-tight hidden md:block gradient-text">
              CoFlow
            </span>
          )}
        </Link>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "ml-auto hidden md:flex items-center justify-center w-6 h-6 rounded-md",
            "text-muted-foreground hover:text-foreground hover:bg-white/[0.06]",
            "transition-all duration-150 flex-shrink-0"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Workspace Badge */}
      {currentWorkspace && !isCollapsed && (
        <div className="mx-3 mt-3 mb-1 hidden md:block">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: currentWorkspace.color || "#7c3aed" }}
            />
            <span className="text-xs text-muted-foreground font-medium truncate">
              {currentWorkspace.name}
            </span>
          </div>
        </div>
      )}

      {/* Nav */}
      <ScrollArea className="flex-1 px-3 py-3">
        <SidebarNav
          items={navItems}
          isCollapsed={isCollapsed}
          currentWorkspace={currentWorkspace}
        />
      </ScrollArea>

      {/* User section */}
      <div className="border-t border-white/[0.06] p-3 flex-shrink-0">
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2 py-2",
            "hover:bg-white/[0.04] transition-all duration-150 cursor-pointer group",
            isCollapsed && "justify-center px-0"
          )}
          onClick={logout}
          title="Logout"
        >
          <Avatar className="w-7 h-7 flex-shrink-0 ring-1 ring-white/10">
            <AvatarImage src={user?.profilePicture} alt={user?.name} />
            <AvatarFallback
              className="text-xs font-semibold"
              style={{ background: "var(--gradient-primary)", color: "white" }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 hidden md:block">
              <p className="text-xs font-medium truncate">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          )}
          {!isCollapsed && (
            <LogOut className="w-3.5 h-3.5 text-muted-foreground group-hover:text-destructive transition-colors hidden md:block flex-shrink-0" />
          )}
        </div>
      </div>
    </div>
  );
};
