import type { StatsCardProps } from "@/types";
import { Briefcase, CheckCircle2, Circle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatItem {
  title: string;
  value: number | string;
  subtitle: string;
  iconClass: string;
  icon: React.ReactNode;
  accent: string;
}

export const StatsCard = ({ data }: { data: StatsCardProps }) => {
  const stats: StatItem[] = [
    {
      title: "Total Projects",
      value: data.totalProjects,
      subtitle: `${data.totalProjectInProgress} in progress`,
      iconClass: "stat-icon-violet",
      icon: <Briefcase className="w-5 h-5" />,
      accent: "#7c3aed",
    },
    {
      title: "Total Tasks",
      value: data.totalTasks,
      subtitle: `${data.totalTaskCompleted} completed`,
      iconClass: "stat-icon-cyan",
      icon: <CheckCircle2 className="w-5 h-5" />,
      accent: "#06b6d4",
    },
    {
      title: "To Do",
      value: data.totalTaskToDo,
      subtitle: "Tasks waiting to start",
      iconClass: "stat-icon-amber",
      icon: <Circle className="w-5 h-5" />,
      accent: "#f59e0b",
    },
    {
      title: "In Progress",
      value: data.totalTaskInProgress,
      subtitle: "Currently active tasks",
      iconClass: "stat-icon-green",
      icon: <TrendingUp className="w-5 h-5" />,
      accent: "#10b981",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger">
      {stats.map((stat, i) => (
        <div
          key={stat.title}
          className="glass-card card-hover rounded-xl p-5 animate-fade-in-up relative overflow-hidden"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {/* Subtle top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
            style={{
              background: `linear-gradient(90deg, transparent, ${stat.accent}, transparent)`,
            }}
          />

          <div className="flex items-start justify-between mb-4">
            <div className={cn("p-2.5", stat.iconClass)}>{stat.icon}</div>
            {/* Decorative background glow */}
            <div
              className="w-12 h-12 rounded-full opacity-10 blur-xl"
              style={{ background: stat.accent }}
            />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {stat.title}
            </p>
            <p
              className="text-3xl font-bold tracking-tight"
              style={{ color: stat.accent }}
            >
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
