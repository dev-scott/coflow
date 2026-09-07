import type {
  ProjectStatusData,
  StatsCardProps,
  TaskPriorityData,
  TaskTrendsData,
  WorkspaceProductivityData,
} from "@/types";
import { ChartBarBig, ChartLine, ChartPie } from "lucide-react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

interface StatisticsChartsProps {
  stats: StatsCardProps;
  taskTrendsData: TaskTrendsData[];
  projectStatusData: ProjectStatusData[];
  taskPriorityData: TaskPriorityData[];
  workspaceProductivityData: WorkspaceProductivityData[];
}

const ChartCard = ({
  title,
  description,
  icon: Icon,
  children,
  colSpan,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
  colSpan?: string;
}) => (
  <div
    className={`glass-card card-hover rounded-xl overflow-hidden animate-fade-in-up ${colSpan ?? ""}`}
  >
    {/* Header */}
    <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="p-2 rounded-lg bg-white/[0.05] text-muted-foreground">
        <Icon className="w-4 h-4" />
      </div>
    </div>
    {/* Content */}
    <div className="p-5 w-full overflow-x-auto">
      <div className="min-w-[320px]">{children}</div>
    </div>
  </div>
);

const AXIS_STYLE = { stroke: "#475569", fontSize: 11 };
const GRID_STYLE = { stroke: "rgba(255,255,255,0.05)" };

export const StatisticsCharts = ({
  taskTrendsData,
  projectStatusData,
  taskPriorityData,
  workspaceProductivityData,
}: StatisticsChartsProps) => {
  return (
    <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
      {/* Task Trends */}
      <ChartCard
        title="Task Trends"
        description="Daily task status changes over time"
        icon={ChartLine}
        colSpan="lg:col-span-2"
      >
        <ChartContainer
          className="h-[280px]"
          config={{
            completed: { color: "#10b981", label: "Completed" },
            inProgress: { color: "#7c3aed", label: "In Progress" },
            todo: { color: "#64748b", label: "To Do" },
          }}
        >
          <LineChart data={taskTrendsData}>
            <XAxis dataKey="name" {...AXIS_STYLE} tickLine={false} axisLine={false} />
            <YAxis {...AXIS_STYLE} tickLine={false} axisLine={false} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <ChartTooltip
              content={<ChartTooltipContent />}
              wrapperStyle={{
                background: "#16161f",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
              }}
            />
            <Line type="monotone" dataKey="completed"  stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="inProgress" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 3, fill: "#7c3aed", strokeWidth: 0 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="todo"       stroke="#64748b" strokeWidth={2.5} dot={{ r: 3, fill: "#64748b", strokeWidth: 0 }} activeDot={{ r: 5 }} />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </ChartCard>

      {/* Project Status */}
      <ChartCard
        title="Project Status"
        description="Status breakdown across all projects"
        icon={ChartPie}
      >
        <ChartContainer
          className="h-[280px]"
          config={{
            Completed:   { color: "#10b981" },
            "In Progress": { color: "#7c3aed" },
            Planning:    { color: "#f59e0b" },
          }}
        >
          <PieChart>
            <Pie
              data={projectStatusData}
              cx="50%"
              cy="50%"
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              stroke="none"
            >
              {projectStatusData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={0.9}
                />
              ))}
            </Pie>
            <ChartTooltip
              content={<ChartTooltipContent />}
              wrapperStyle={{
                background: "#16161f",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
              }}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      </ChartCard>

      {/* Task Priority */}
      <ChartCard
        title="Task Priority"
        description="Distribution by priority level"
        icon={ChartPie}
      >
        <ChartContainer
          className="h-[280px]"
          config={{
            High:   { color: "#ef4444" },
            Medium: { color: "#f59e0b" },
            Low:    { color: "#64748b" },
          }}
        >
          <PieChart>
            <Pie
              data={taskPriorityData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              stroke="none"
            >
              {taskPriorityData?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} opacity={0.9} />
              ))}
            </Pie>
            <ChartTooltip
              content={<ChartTooltipContent />}
              wrapperStyle={{
                background: "#16161f",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
              }}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      </ChartCard>

      {/* Workspace Productivity */}
      <ChartCard
        title="Workspace Productivity"
        description="Task completion rate by project"
        icon={ChartBarBig}
        colSpan="lg:col-span-2"
      >
        <ChartContainer
          className="h-[280px]"
          config={{
            total:     { color: "rgba(255,255,255,0.12)", label: "Total Tasks" },
            completed: { color: "#7c3aed",                label: "Completed" },
          }}
        >
          <BarChart data={workspaceProductivityData} barGap={4} barSize={18}>
            <XAxis dataKey="name" {...AXIS_STYLE} tickLine={false} axisLine={false} />
            <YAxis {...AXIS_STYLE} tickLine={false} axisLine={false} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <ChartTooltip
              content={<ChartTooltipContent />}
              wrapperStyle={{
                background: "#16161f",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="total"     fill="rgba(255,255,255,0.10)" radius={[4, 4, 0, 0]} name="Total Tasks" />
            <Bar dataKey="completed" fill="#7c3aed"                radius={[4, 4, 0, 0]} name="Completed" />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </ChartCard>
    </div>
  );
};
