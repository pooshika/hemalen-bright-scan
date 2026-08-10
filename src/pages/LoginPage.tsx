import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Globe, Shield, ArrowRight } from "lucide-react";
import logo from "@/assets/hemalen-logo.png";
import type { Language } from "@/lib/i18n";

const langLabels: Record<Language, { code: string; name: string }> = {
  en: { code: "EN", name: "English" },
  ta: { code: "தமி", name: "தமிழ்" },
  hi: { code: "हि", name: "हिन्दी" },
};

const LoginPage = () => {
  const { lang, setLang, t } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [sentConfirmation, setSentConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const nextPath = (() => {
    const raw = new URLSearchParams(window.location.search).get("next");
    if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
    return raw;
  })();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate(nextPath ?? "/dashboard", { replace: true });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate(nextPath ?? "/dashboard", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, nextPath]);

  const handleSubmit = async () => {
    if (!email || password.length < 6) return;
    setLoading(true);
    if (mode === "signup") {
      const redirect = nextPath
        ? window.location.origin + nextPath
        : window.location.origin + "/dashboard";
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirect },
      });
      setLoading(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!data.session) {
        setSentConfirmation(true);
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) toast.error(error.message);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + (nextPath ? "/?next=" + encodeURIComponent(nextPath) : ""),
    });
    if (result.error) {
      setLoading(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate(nextPath ?? "/dashboard", { replace: true });
  };

  const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-medium text-muted-foreground">{t("secure")}</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-soft transition-all hover:bg-secondary"
          >
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span>{langLabels[lang].code}</span>
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 min-w-[140px] rounded-xl border border-border bg-card p-1 shadow-elevated">
              {(["en", "ta", "hi"] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setLangOpen(false); }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    lang === l ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-secondary"
                  }`}
                >
                  <span className="font-medium">{langLabels[l].code}</span>
                  <span className="text-muted-foreground">{langLabels[l].name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="w-full max-w-sm">
          <div className="mb-10 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...spring, delay: 0.1 }}
              className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10"
            >
              <img src={logo} alt="HemaLen AI" className="h-12 w-12" />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("welcome")}</h1>
            <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-muted-foreground">{t("subtitle")}</p>
          </div>

          <div className="space-y-4">
            {sentConfirmation ? (
              <p className="rounded-xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">
                Check your email to confirm your account, then sign in.
              </p>
            ) : (
              <>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  variant="clinical"
                  size="lg"
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={!email || password.length < 6 || loading}
                >
                  {loading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <>{mode === "signup" ? "Create account" : "Sign in"} <ArrowRight className="h-5 w-5" /></>
                  )}
                </Button>
                <Button variant="outline" size="lg" className="w-full" onClick={handleGoogle} disabled={loading}>
                  Continue with Google
                </Button>
                <button
                  onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                  className="w-full text-center text-sm font-medium text-primary hover:underline"
                >
                  {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </main>

      <footer className="flex flex-col items-center gap-2 px-6 pb-6">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          <span>{t("disclaimer")}</span>
        </div>
        <span className="text-xs text-muted-foreground/60">{t("tagline")}</span>
      </footer>
    </div>
  );
};

export default LoginPage;
