import type { Task } from "@/types";
import { Link, useSearchParams } from "react-router";
import { cn } from "@/lib/utils";
import { AlertTriangle, Calendar, CheckCircle2, Circle, Clock } from "lucide-react";
import { format } from "date-fns";

const PRIORITY_CONFIG = {
  High:   { bg: "bg-red-500/10",    text: "text-red-400",    dot: "#ef4444", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  Medium: { bg: "bg-amber-500/10",  text: "text-amber-400",  dot: "#f59e0b", icon: <Clock className="w-3.5 h-3.5" /> },
  Low:    { bg: "bg-slate-500/10",  text: "text-slate-400",  dot: "#64748b", icon: <Circle className="w-3.5 h-3.5" /> },
};

export const UpcomingTasks = ({ data }: { data: Task[] }) => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  return (
    <div className="glass-card rounded-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: "80ms" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg stat-icon-cyan">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Upcoming Tasks</h3>
            <p className="text-xs text-muted-foreground">Due soon</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {data.length} task{data.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* List */}
      <div className="p-4 space-y-2">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-3 rounded-xl bg-white/[0.04] mb-3">
              <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground/60 mt-1">No upcoming tasks</p>
          </div>
        ) : (
          data.map((task) => {
            const priorityConf =
              PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] ??
              PRIORITY_CONFIG.Low;
            const isDone = task.status === "Done";

            return (
              <Link
                to={`/workspaces${workspaceId}/projects/${task.project}/tasks/${task._id}`}
                key={task._id}
                className={cn(
                  "group flex items-start gap-3 rounded-lg px-3 py-2.5",
                  "border border-white/[0.05] hover:border-white/[0.10]",
                  "hover:bg-white/[0.02] transition-all duration-150"
                )}
              >
                {/* Priority icon */}
                <div
                  className={cn(
                    "mt-0.5 flex-shrink-0 p-1.5 rounded-lg transition-transform group-hover:scale-110",
                    priorityConf.bg,
                    priorityConf.text
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    priorityConf.icon
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <p
                    className={cn(
                      "text-sm font-medium truncate group-hover:text-[#a78bfa] transition-colors",
                      isDone && "line-through text-muted-foreground"
                    )}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                        priorityConf.bg,
                        priorityConf.text
                      )}
                    >
                      {task.priority}
                    </span>
                    <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded-full bg-white/[0.04]">
                      {task.status}
                    </span>
                    {task.dueDate && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Calendar className="w-2.5 h-2.5" />
                        {format(new Date(task.dueDate), "MMM d")}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};
