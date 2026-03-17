import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, Phone, HelpCircle, Info, LogOut, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { useApp } from "@/contexts/AppContext";
import type { Language } from "@/lib/i18n";

const langNames: Record<Language, string> = {
  en: "English",
  ta: "தமிழ்",
  hi: "हिन्दी",
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { t, lang, setLang, emergencyContact, setEmergencyContact, phone } = useApp();
  const [showHowTo, setShowHowTo] = useState(false);
  const [contact, setContact] = useState(emergencyContact);

  const handleSave = () => {
    setEmergencyContact(contact);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border px-5 py-4">
        <h1 className="text-xl font-bold text-foreground">{t("profileTitle")}</h1>
        {phone && <p className="text-sm text-muted-foreground">+91 {phone}</p>}
      </header>

      <main className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
        {/* Language */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="h-5 w-5 text-primary" />
            <p className="text-base font-semibold text-foreground">{t("language")}</p>
          </div>
          <div className="flex gap-2">
            {(["en", "ta", "hi"] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                  lang === l ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {langNames[l]}
              </button>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <Phone className="h-5 w-5 text-alert" />
            <p className="text-base font-semibold text-foreground">{t("emergencyContact")}</p>
          </div>
          <div className="flex gap-2">
            <Input
              type="tel"
              inputMode="numeric"
              placeholder={t("emergencyContactPlaceholder")}
              value={contact}
              onChange={(e) => setContact(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className="flex-1"
            />
            <Button variant="clinical" onClick={handleSave}>{t("save")}</Button>
          </div>
        </div>

        {/* How to Use */}
        <button
          onClick={() => setShowHowTo(!showHowTo)}
          className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
            <p className="text-base font-semibold text-foreground">{t("howToUse")}</p>
          </div>
          <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${showHowTo ? "rotate-90" : ""}`} />
        </button>

        {showHowTo && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i}
                </div>
                <p className="text-sm text-foreground pt-1">{t(`step${i}`)}</p>
              </div>
            ))}
          </div>
        )}

        {/* About */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <Info className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-base font-semibold text-foreground">{t("aboutApp")}</p>
            <p className="text-xs text-muted-foreground">{t("version")}</p>
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          size="lg"
          className="mt-auto w-full text-alert border-alert/30"
          onClick={() => navigate("/")}
        >
          <LogOut className="h-5 w-5 mr-2" />
          {t("logout")}
        </Button>
      </main>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
