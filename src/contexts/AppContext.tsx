import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Language } from "@/lib/i18n";
import { translations } from "@/lib/i18n";

export interface ScanRecord {
  id: string;
  timestamp: number;
  hbValue: number;
  severity: "normal" | "mild" | "moderate" | "severe" | "critical";
  mode: "eyelid" | "nail";
}

interface AppState {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  phone: string;
  setPhone: (p: string) => void;
  emergencyContact: string;
  setEmergencyContact: (c: string) => void;
  scanHistory: ScanRecord[];
  addScan: (scan: ScanRecord) => void;
  clearHistory: () => void;
  lastScan: ScanRecord | null;
  setLastScan: (s: ScanRecord | null) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem("hemalen-lang") as Language) || "en";
  });
  const [phone, setPhone] = useState(() => localStorage.getItem("hemalen-phone") || "");
  const [emergencyContact, setEmergencyContact] = useState(
    () => localStorage.getItem("hemalen-emergency") || ""
  );
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("hemalen-history") || "[]");
    } catch {
      return [];
    }
  });
  const [lastScan, setLastScan] = useState<ScanRecord | null>(null);

  const handleSetLang = useCallback((l: Language) => {
    setLang(l);
    localStorage.setItem("hemalen-lang", l);
  }, []);

  const handleSetPhone = useCallback((p: string) => {
    setPhone(p);
    localStorage.setItem("hemalen-phone", p);
  }, []);

  const handleSetEmergency = useCallback((c: string) => {
    setEmergencyContact(c);
    localStorage.setItem("hemalen-emergency", c);
  }, []);

  const addScan = useCallback((scan: ScanRecord) => {
    setScanHistory((prev) => {
      const next = [scan, ...prev];
      localStorage.setItem("hemalen-history", JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setScanHistory([]);
    localStorage.removeItem("hemalen-history");
  }, []);

  const t = useCallback(
    (key: string) => translations[lang][key] || key,
    [lang]
  );

  return (
    <AppContext.Provider
      value={{
        lang, setLang: handleSetLang, t,
        phone, setPhone: handleSetPhone,
        emergencyContact, setEmergencyContact: handleSetEmergency,
        scanHistory, addScan, clearHistory,
        lastScan, setLastScan,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
