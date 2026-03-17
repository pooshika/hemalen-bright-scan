import { useState } from "react";
import { Globe } from "lucide-react";

type Language = "en" | "ta" | "hi";

const labels: Record<Language, { code: string; name: string }> = {
  en: { code: "EN", name: "English" },
  ta: { code: "தமி", name: "தமிழ்" },
  hi: { code: "हि", name: "हिन्दी" },
};

interface LanguageToggleProps {
  value: Language;
  onChange: (lang: Language) => void;
}

const LanguageToggle = ({ value, onChange }: LanguageToggleProps) => {
  const [open, setOpen] = useState(false);
  const languages: Language[] = ["en", "ta", "hi"];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-soft transition-all duration-250 ease-swift hover:bg-secondary"
      >
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span>{labels[value].code}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 min-w-[140px] rounded-xl border border-border bg-card p-1 shadow-elevated">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                onChange(lang);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                value === lang
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              <span className="font-medium">{labels[lang].code}</span>
              <span className="text-muted-foreground">{labels[lang].name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;
export type { Language };
