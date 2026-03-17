import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { useApp } from "@/contexts/AppContext";

const severityColor: Record<string, string> = {
  normal: "text-success",
  mild: "text-yellow-600",
  moderate: "text-orange-500",
  severe: "text-alert",
  critical: "text-alert",
};

const HistoryPage = () => {
  const { t, scanHistory, clearHistory } = useApp();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <h1 className="text-xl font-bold text-foreground">{t("historyTitle")}</h1>
        {scanHistory.length > 0 && (
          <button onClick={clearHistory} className="flex items-center gap-1 text-sm font-medium text-alert">
            <Trash2 className="h-4 w-4" />
            {t("deleteHistory")}
          </button>
        )}
      </header>

      <main className="flex flex-1 flex-col gap-2 overflow-y-auto px-5 py-4">
        {scanHistory.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">{t("noHistory")}</p>
          </div>
        ) : (
          scanHistory.map((scan) => (
            <div key={scan.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-soft">
              <div>
                <p className="text-sm text-muted-foreground">
                  {new Date(scan.timestamp).toLocaleString()}
                </p>
                <p className={`text-sm font-medium ${severityColor[scan.severity]}`}>
                  {t(scan.severity)} • {scan.mode === "eyelid" ? t("eyelidMode") : t("nailMode")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold tabular-nums text-foreground">{scan.hbValue.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">{t("unit")}</p>
              </div>
            </div>
          ))
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default HistoryPage;
