import { cn } from "@/lib/utils";
import type { Workspace } from "@/types";
import type { LucideIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router";

interface SidebarNavProps extends React.HtmlHTMLAttributes<HTMLElement> {
  items: {
    title: string;
    href: string;
    icon: LucideIcon;
  }[];
  isCollapsed: boolean;
  currentWorkspace: Workspace | null;
  className?: string;
}

export const SidebarNav = ({
  items,
  isCollapsed,
  className,
  currentWorkspace,
  ...props
}: SidebarNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className={cn("flex flex-col gap-y-1", className)} {...props}>
      {items.map((el) => {
        const Icon = el.icon;
        const isActive = location.pathname === el.href;

        const handleClick = () => {
          if (el.href === "/workspaces") {
            navigate(el.href);
          } else if (currentWorkspace && currentWorkspace._id) {
            navigate(`${el.href}?workspaceId=${currentWorkspace._id}`);
          } else {
            navigate(el.href);
          }
        };

        return (
          <button
            key={el.href}
            onClick={handleClick}
            title={isCollapsed ? el.title : undefined}
            className={cn(
              "relative flex items-center gap-3 rounded-lg text-sm font-medium",
              "transition-all duration-150 ease-out cursor-pointer",
              "w-full text-left",
              isCollapsed
                ? "justify-center px-0 py-2.5 h-10"
                : "px-3 py-2.5",
              isActive
                ? "nav-active text-[#c4b5fd]"
                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
            )}
          >
            <Icon
              className={cn(
                "flex-shrink-0 transition-colors duration-150",
                isCollapsed ? "w-[18px] h-[18px]" : "w-4 h-4",
                isActive ? "text-[#a78bfa]" : ""
              )}
            />
            {!isCollapsed && (
              <span className="hidden md:block truncate">{el.title}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
