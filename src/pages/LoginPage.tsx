import { useState, useRef, useEffect, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LanguageToggle, { type Language } from "@/components/LanguageToggle";
import { Shield, ArrowRight } from "lucide-react";
import logo from "@/assets/hemalen-logo.png";

const content: Record<Language, {
  welcome: string;
  subtitle: string;
  phonePlaceholder: string;
  sendOtp: string;
  enterOtp: string;
  otpSent: string;
  verify: string;
  disclaimer: string;
  tagline: string;
}> = {
  en: {
    welcome: "HemaLen AI",
    subtitle: "Professional anemia screening.\nIn your pocket. In your language.",
    phonePlaceholder: "Phone number",
    sendOtp: "Send OTP",
    enterOtp: "Enter 6-digit OTP",
    otpSent: "OTP sent to",
    verify: "Verify & Continue",
    disclaimer: "This is a screening tool, not a final diagnosis.",
    tagline: "Non-invasive hemoglobin estimation",
  },
  ta: {
    welcome: "HemaLen AI",
    subtitle: "தொழில்முறை இரத்தசோகை பரிசோதனை.\nஉங்கள் பாக்கெட்டில். உங்கள் மொழியில்.",
    phonePlaceholder: "தொலைபேசி எண்",
    sendOtp: "OTP அனுப்பு",
    enterOtp: "6 இலக்க OTP உள்ளிடவும்",
    otpSent: "OTP அனுப்பப்பட்டது",
    verify: "சரிபார்த்து தொடரவும்",
    disclaimer: "இது ஒரு திரையிடல் கருவி, இறுதி நோயறிதல் அல்ல.",
    tagline: "படையெடுக்காத ஹீமோகுளோபின் மதிப்பீடு",
  },
  hi: {
    welcome: "HemaLen AI",
    subtitle: "पेशेवर एनीमिया स्क्रीनिंग।\nआपकी जेब में। आपकी भाषा में।",
    phonePlaceholder: "फ़ोन नंबर",
    sendOtp: "OTP भेजें",
    enterOtp: "6 अंकों का OTP दर्ज करें",
    otpSent: "OTP भेजा गया",
    verify: "सत्यापित करें और जारी रखें",
    disclaimer: "यह एक स्क्रीनिंग टूल है, अंतिम निदान नहीं।",
    tagline: "गैर-आक्रामक हीमोग्लोबिन अनुमान",
  },
};

const LoginPage = () => {
  const [lang, setLang] = useState<Language>("en");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const otpRef = useRef<HTMLInputElement>(null);
  const t = content[lang];

  useEffect(() => {
    if (step === "otp" && otpRef.current) {
      otpRef.current.focus();
    }
  }, [step]);

  const handleSendOtp = () => {
    if (phone.length < 10) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 1200);
  };

  const handleVerify = () => {
    if (otp.length < 6) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Navigate to dashboard would go here
    }, 1500);
  };

  const swiftTransition = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-medium text-muted-foreground">Secure</span>
        </div>
        <LanguageToggle value={lang} onChange={setLang} />
      </header>

      {/* Main */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={swiftTransition}
          className="w-full max-w-sm"
        >
          {/* Logo & Branding */}
          <div className="mb-10 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...swiftTransition, delay: 0.1 }}
              className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10"
            >
              <img src={logo} alt="HemaLen AI" className="h-12 w-12" />
            </motion.div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {t.welcome}
            </h1>
            <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {t.subtitle}
            </p>
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={swiftTransition}
                className="space-y-4"
              >
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-muted-foreground">
                    +91
                  </span>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    placeholder={t.phonePlaceholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="pl-14"
                    maxLength={10}
                  />
                </div>

                <Button
                  variant="clinical"
                  size="lg"
                  className="w-full"
                  onClick={handleSendOtp}
                  disabled={phone.length < 10 || loading}
                >
                  <motion.span
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    ) : (
                      <>
                        {t.sendOtp}
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </motion.span>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={swiftTransition}
                className="space-y-4"
              >
                <p className="text-center text-sm text-muted-foreground">
                  {t.otpSent} <span className="font-semibold text-foreground">+91 {phone}</span>
                </p>

                <Input
                  ref={otpRef}
                  type="tel"
                  inputMode="numeric"
                  placeholder={t.enterOtp}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className="text-center text-xl tracking-[0.5em] font-semibold tabular-nums"
                />

                <Button
                  variant="clinical"
                  size="lg"
                  className="w-full"
                  onClick={handleVerify}
                  disabled={otp.length < 6 || loading}
                >
                  <motion.span
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    ) : (
                      <>
                        {t.verify}
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </motion.span>
                </Button>

                <button
                  onClick={() => { setStep("phone"); setOtp(""); }}
                  className="w-full text-center text-sm font-medium text-primary hover:underline"
                >
                  ← Change number
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="flex flex-col items-center gap-2 px-6 pb-6">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          <span>{t.disclaimer}</span>
        </div>
        <span className="text-xs text-muted-foreground/60">{t.tagline}</span>
      </footer>
    </div>
  );
};

export default LoginPage;
