import { Bell, Lock, Palette, Settings, Shield, User } from "lucide-react";

interface SettingsSection {
  icon: React.ReactNode;
  title: string;
  description: string;
  cls: string;
}

const sections: SettingsSection[] = [
  { icon: <User className="w-4 h-4" />,    title: "Profile",       description: "Manage your personal information and avatar.", cls: "stat-icon-violet" },
  { icon: <Lock className="w-4 h-4" />,    title: "Security",      description: "Password, two-factor auth and active sessions.",  cls: "stat-icon-amber"  },
  { icon: <Bell className="w-4 h-4" />,    title: "Notifications", description: "Control how and when you receive alerts.",        cls: "stat-icon-cyan"   },
  { icon: <Palette className="w-4 h-4" />, title: "Appearance",    description: "Theme, language and display preferences.",        cls: "stat-icon-green"  },
  { icon: <Shield className="w-4 h-4" />,  title: "Permissions",   description: "Workspace roles and access management.",          cls: "stat-icon-violet" },
];

const SettingsPage = () => {
  return (
    <div className="space-y-6 animate-fade-in-up max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl stat-icon-violet">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account and workspace preferences
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((s) => (
          <div
            key={s.title}
            className="glass-card card-hover rounded-xl px-5 py-4 flex items-center gap-4 cursor-pointer group"
          >
            <div className={`p-2.5 rounded-lg flex-shrink-0 ${s.cls}`}>
              {s.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold group-hover:text-[#a78bfa] transition-colors">
                {s.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {s.description}
              </p>
            </div>
            <div className="text-muted-foreground group-hover:text-[#a78bfa] transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Coming soon note */}
      <p className="text-xs text-muted-foreground text-center py-4">
        More settings options coming soon.
      </p>
    </div>
  );
};

export default SettingsPage;
