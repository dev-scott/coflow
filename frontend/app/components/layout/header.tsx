import { useAuth } from "@/provider/auth-context";
import { useGetWorkspacesQuery } from "@/hooks/use-workspace";
import type { Workspace } from "@/types";
import { Bell, ChevronDown, Plus, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "../ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Link, useLoaderData, useLocation, useNavigate } from "react-router";
import { WorkspaceAvatar } from "../workspace/workspace-avatar";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onWorkspaceSelected: (workspace: Workspace) => void;
  selectedWorkspace: Workspace | null;
  onCreateWorkspace: () => void;
}

export const Header = ({
  onWorkspaceSelected,
  selectedWorkspace,
  onCreateWorkspace,
}: HeaderProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const loaderData = useLoaderData() as { workspaces?: Workspace[] } | undefined;
  const { data: queryWorkspaces } = useGetWorkspacesQuery();
  const workspaces = (queryWorkspaces || loaderData?.workspaces || []) as Workspace[];
  const isOnWorkspacePage = useLocation().pathname.includes("/workspace");

  const handleOnClick = (workspace: Workspace) => {
    onWorkspaceSelected(workspace);
    const location = window.location;
    if (isOnWorkspacePage) {
      navigate(`/workspaces/${workspace._id}`);
    } else {
      navigate(`${location.pathname}?workspaceId=${workspace._id}`);
    }
  };

  return (
    <header
      className="sticky top-0 z-40 border-b border-white/[0.06] flex-shrink-0"
      style={{
        background: "rgba(10, 10, 15, 0.85)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
      }}
    >
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        {/* Workspace Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-2 h-8 px-3 rounded-lg text-sm font-medium",
                "border border-white/[0.08] bg-white/[0.04]",
                "hover:bg-white/[0.07] hover:border-white/[0.12]",
                "transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]/50",
                "max-w-[180px]"
              )}
            >
              {selectedWorkspace ? (
                <>
                  {selectedWorkspace.color && (
                    <WorkspaceAvatar
                      color={selectedWorkspace.color}
                      name={selectedWorkspace.name}
                    />
                  )}
                  <span className="truncate hidden sm:block">
                    {selectedWorkspace.name}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground hidden sm:block">
                  Select workspace
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 ml-auto" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-56 border-white/[0.08]"
            style={{ background: "#16161f" }}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
              Workspaces
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/[0.06]" />

            <DropdownMenuGroup>
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws._id}
                  onClick={() => handleOnClick(ws)}
                  className={cn(
                    "gap-2 cursor-pointer",
                    selectedWorkspace?._id === ws._id && "bg-[#7c3aed]/10"
                  )}
                >
                  {ws.color && (
                    <WorkspaceAvatar color={ws.color} name={ws.name} />
                  )}
                  <span>{ws.name}</span>
                  {selectedWorkspace?._id === ws._id && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={onCreateWorkspace}
                className="gap-2 cursor-pointer text-[#a78bfa] focus:text-[#a78bfa] focus:bg-[#7c3aed]/10"
              >
                <Plus className="w-4 h-4" />
                New Workspace
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search bar */}
        <div
          className={cn(
            "hidden md:flex items-center gap-2 flex-1 max-w-xs h-8 px-3 rounded-lg",
            "border border-white/[0.07] bg-white/[0.03]",
            "text-sm text-muted-foreground",
            "hover:bg-white/[0.05] hover:border-white/[0.10] transition-all duration-150 cursor-pointer"
          )}
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="flex-1 text-xs">Search anything...</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border border-white/10 bg-white/5">
            ⌘K
          </kbd>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {/* Notifications */}
          <button
            className={cn(
              "relative flex items-center justify-center w-8 h-8 rounded-lg",
              "border border-white/[0.07] bg-white/[0.03]",
              "hover:bg-white/[0.06] hover:border-white/[0.11] transition-all duration-150",
              "text-muted-foreground hover:text-foreground"
            )}
          >
            <Bell className="w-4 h-4" />
            {/* Notification dot */}
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
          </button>

          {/* Avatar / User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-2 h-8 pl-1 pr-2 rounded-lg",
                  "border border-white/[0.07] bg-white/[0.03]",
                  "hover:bg-white/[0.06] hover:border-white/[0.11] transition-all duration-150",
                  "outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]/50"
                )}
              >
                <Avatar className="w-6 h-6 ring-1 ring-white/10">
                  <AvatarImage src={user?.profilePicture} alt={user?.name} />
                  <AvatarFallback
                    className="text-[10px] font-bold"
                    style={{
                      background: "var(--gradient-primary)",
                      color: "white",
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium hidden sm:block max-w-[80px] truncate">
                  {user?.name}
                </span>
                <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-52 border-white/[0.08]"
              style={{ background: "#16161f" }}
            >
              <div className="px-3 py-2 border-b border-white/[0.06]">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuItem asChild className="mt-1 cursor-pointer">
                <Link to="/user/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
