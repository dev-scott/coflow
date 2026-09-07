import type { Project } from "@/types";
import { getProjectProgress, getTaskStatusColor } from "@/lib";
import { Link, useSearchParams } from "react-router";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Folder } from "lucide-react";

const STATUS_CLASSES: Record<string, string> = {
  Completed:   "badge-success",
  "In Progress": "badge-info",
  Planning:    "badge-warning",
  "On Hold":   "badge-muted",
};

const STATUS_COLORS: Record<string, string> = {
  Completed:     "#10b981",
  "In Progress": "#7c3aed",
  Planning:      "#f59e0b",
  "On Hold":     "#64748b",
};

export const RecentProjects = ({ data }: { data: Project[] }) => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  return (
    <div className="glass-card rounded-xl overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg stat-icon-violet">
            <Folder className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Recent Projects</h3>
            <p className="text-xs text-muted-foreground">{data.length} project{data.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-3 rounded-xl bg-white/[0.04] mb-3">
              <Folder className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No projects yet</p>
          </div>
        ) : (
          data.map((project) => {
            const progress = getProjectProgress(project.tasks);
            const accentColor = STATUS_COLORS[project.status] ?? "#64748b";
            const badgeClass = STATUS_CLASSES[project.status] ?? "badge-muted";

            return (
              <div
                key={project._id}
                className="group relative rounded-lg overflow-hidden border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 hover:bg-white/[0.02]"
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px]"
                  style={{ background: accentColor }}
                />

                <div className="pl-4 pr-3 py-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Link
                      to={`/workspaces${workspaceId}/projects/${project._id}`}
                      className="flex-1 min-w-0"
                    >
                      <h4 className="text-sm font-medium truncate group-hover:text-[#a78bfa] transition-colors">
                        {project.title}
                      </h4>
                    </Link>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn("text-[10px] px-2 py-0.5 font-medium", badgeClass)}>
                        {project.status}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                      {project.description}
                    </p>
                  )}

                  {/* Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Progress</span>
                      <span style={{ color: accentColor }}>{progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
