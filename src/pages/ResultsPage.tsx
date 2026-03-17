import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, Phone, MapPin, ArrowRight, RotateCcw, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { useEffect } from "react";
import { speak } from "@/lib/voice";

const severityConfig: Record<string, { color: string; bg: string; border: string }> = {
  normal: { color: "text-success", bg: "bg-success/10", border: "border-success/30" },
  mild: { color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
  moderate: { color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
  severe: { color: "text-alert", bg: "bg-alert/10", border: "border-alert/30" },
  critical: { color: "text-alert", bg: "bg-alert/10", border: "border-alert/30" },
};

const ResultsPage = () => {
  const navigate = useNavigate();
  const { t, lang, lastScan, emergencyContact } = useApp();

  useEffect(() => {
    if (!lastScan) {
      navigate("/dashboard");
      return;
    }

    const message = `${t("hemoglobinLevel")}: ${lastScan.hbValue} ${t("unit")}. ${t(lastScan.severity + "Desc")}`;
    speak(message, lang);
  }, [lastScan, t, lang, navigate]);

  if (!lastScan) return null;

  const config = severityConfig[lastScan.severity];
  const isCritical = lastScan.severity === "severe" || lastScan.severity === "critical";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Emergency Banner */}
      {isCritical && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          className="bg-alert px-5 py-4"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-alert-foreground" />
            <div>
              <p className="text-sm font-bold text-alert-foreground">{t("emergencyAlert")}</p>
              <p className="text-xs text-alert-foreground/90">{t("emergencyDesc")}</p>
            </div>
          </div>
        </motion.div>
      )}

      <main className="flex flex-1 flex-col items-center gap-6 px-5 py-8">
        <h1 className="text-xl font-bold text-foreground">{t("resultsTitle")}</h1>

        {/* Hb Value Display */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`flex flex-col items-center rounded-3xl border-2 ${config.border} ${config.bg} px-12 py-8`}
        >
          <p className="text-sm font-medium text-muted-foreground">{t("hemoglobinLevel")}</p>
          <p className={`text-6xl font-bold tabular-nums ${config.color}`}>
            {lastScan.hbValue.toFixed(1)}
          </p>
          <p className="text-base text-muted-foreground">{t("unit")}</p>
          <div className={`mt-3 rounded-full px-4 py-1.5 ${config.bg}`}>
            <p className={`text-sm font-semibold ${config.color}`}>{t(lastScan.severity)}</p>
          </div>
        </motion.div>

        {/* Description */}
        <p className="max-w-xs text-center text-sm text-muted-foreground">
          {t(lastScan.severity + "Desc")}
        </p>

        {/* Emergency Actions */}
        {isCritical && (
          <div className="w-full max-w-sm space-y-3">
            <Button
              variant="alert"
              size="lg"
              className="w-full"
              onClick={() => {
                if (emergencyContact) {
                  window.open(`tel:${emergencyContact}`);
                } else {
                  window.open("tel:108"); // India emergency
                }
              }}
            >
              <Phone className="h-5 w-5 mr-2" />
              {t("callDoctor")}
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => {
                navigator.geolocation?.getCurrentPosition(
                  (pos) => {
                    const { latitude, longitude } = pos.coords;
                    window.open(
                      `https://www.google.com/maps/search/hospital/@${latitude},${longitude},14z`,
                      "_blank"
                    );
                  },
                  () => {
                    window.open("https://www.google.com/maps/search/hospital+near+me", "_blank");
                  }
                );
              }}
            >
              <MapPin className="h-5 w-5 mr-2" />
              {t("findHospital")}
            </Button>
          </div>
        )}

        {/* Diet Tip */}
        {!isCritical && lastScan.severity !== "normal" && (
          <div className="w-full max-w-sm rounded-xl border border-success/30 bg-success/5 p-4">
            <p className="text-sm font-semibold text-success">{t("dietTip")}</p>
            <p className="mt-1 text-sm text-foreground">{t("dietAdvice")}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto flex w-full max-w-sm gap-3">
          <Button variant="outline" size="lg" className="flex-1" onClick={() => navigate("/scan")}>
            <RotateCcw className="h-4 w-4 mr-2" />
            {t("newScan")}
          </Button>
          <Button variant="clinical" size="lg" className="flex-1" onClick={() => navigate("/history")}>
            <History className="h-4 w-4 mr-2" />
            {t("viewHistory")}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;
