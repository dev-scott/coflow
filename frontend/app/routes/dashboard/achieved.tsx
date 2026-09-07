import { CheckCircle2, Star, TrendingUp } from "lucide-react";

const Achieved = () => {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl stat-icon-green">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Achieved</h1>
          <p className="text-sm text-muted-foreground">
            Completed tasks and finished projects
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Tasks Completed", value: "—", icon: <CheckCircle2 className="w-4 h-4" />, cls: "stat-icon-green" },
          { label: "Projects Finished", value: "—", icon: <Star className="w-4 h-4" />,        cls: "stat-icon-violet" },
          { label: "Completion Rate",  value: "—", icon: <TrendingUp className="w-4 h-4" />,   cls: "stat-icon-cyan" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-5 card-hover">
            <div className={`p-2 rounded-lg w-fit mb-3 ${s.cls}`}>{s.icon}</div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-2xl stat-icon-green mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-semibold mb-2">No achievements yet</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Complete tasks and finish projects — they'll appear here as a record
          of your team's progress.
        </p>
      </div>
    </div>
  );
};

export default Achieved;
