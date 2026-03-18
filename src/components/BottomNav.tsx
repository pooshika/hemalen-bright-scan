import { useNavigate, useLocation } from "react-router-dom";
import { Activity, History, User, Bot } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useApp();
  const path = location.pathname;

  const items = [
    { key: "/scan", icon: Activity, label: t("navScan") },
    { key: "/assistant", icon: Bot, label: t("aiAssistant") },
    { key: "/history", icon: History, label: t("navHistory") },
    { key: "/profile", icon: User, label: t("navProfile") },
  ];

  return (
    <nav className="flex items-center justify-around border-t border-border bg-background px-4 py-3">
      {items.map((item) => {
        const active = path === item.key;
        return (
          <button
            key={item.key}
            onClick={() => navigate(item.key)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
