import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import VoiceButton from "@/components/VoiceButton";
import { useApp } from "@/contexts/AppContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t, scanHistory } = useApp();
  const recent = scanHistory.slice(0, 3);

  const severityColor: Record<string, string> = {
    normal: "text-success",
    mild: "text-yellow-600",
    moderate: "text-orange-500",
    severe: "text-alert",
    critical: "text-alert",
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border px-5 py-4">
        <h1 className="text-xl font-bold text-foreground">{t("appName")}</h1>
        <p className="text-sm text-muted-foreground">{t("welcomeBack")}</p>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-5 py-6 overflow-y-auto">
        {/* Voice Assistant */}
        <VoiceButton />

        {/* Start Scan CTA */}
        <motion.div
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/scan")}
          className="cursor-pointer rounded-2xl bg-primary p-6 shadow-elevated"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-foreground/20">
              <Activity className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-primary-foreground">{t("startScan")}</h2>
              <p className="mt-1 text-sm text-primary-foreground/80">{t("startScanDesc")}</p>
            </div>
            <ChevronRight className="h-6 w-6 text-primary-foreground/60" />
          </div>
        </motion.div>

        {/* Recent Scans */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-foreground">{t("recentScans")}</h3>
            {recent.length > 0 && (
              <button onClick={() => navigate("/history")} className="text-sm font-medium text-primary">
                {t("viewAll")}
              </button>
            )}
          </div>

          {recent.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">{t("noScans")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-soft">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(scan.timestamp).toLocaleDateString()}
                    </p>
                    <p className={`text-sm font-medium ${severityColor[scan.severity]}`}>
                      {t(scan.severity)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold tabular-nums text-foreground">{scan.hbValue.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">{t("unit")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Diet Tip */}
        <div className="rounded-xl border border-success/30 bg-success/5 p-4">
          <p className="text-sm font-semibold text-success">{t("dietTip")}</p>
          <p className="mt-1 text-sm text-foreground">{t("dietAdvice")}</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
