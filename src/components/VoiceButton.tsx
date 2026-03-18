import { useState } from "react";
import { Mic, Volume2, MessageSquare } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { speak, startListening, processVoiceCommand, stopSpeaking } from "@/lib/voice";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const VoiceButton = () => {
  const { lang, t } = useApp();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");

  const handleVoice = async () => {
    if (isListening) return;

    setIsListening(true);
    setLastTranscript("");
    const stop = startListening(
      lang,
      async (text) => {
        setIsListening(false);
        setLastTranscript(text);
        const command = processVoiceCommand(text, lang);

        if (command === "scan") {
          setIsSpeaking(true);
          await speak(t("voiceStartScan"), lang);
          setIsSpeaking(false);
          navigate("/scan");
        } else if (command === "history") {
          navigate("/history");
        } else if (command === "help") {
          setIsSpeaking(true);
          await speak(t("voiceHelp"), lang);
          setIsSpeaking(false);
        } else {
          setIsSpeaking(true);
          await speak(t("voiceNotUnderstood"), lang);
          setIsSpeaking(false);
        }
        setTimeout(() => setLastTranscript(""), 3000);
      },
      () => setIsListening(false)
    );

    if (!stop) {
      setIsListening(false);
      setIsSpeaking(true);
      await speak(t("voiceHello"), lang);
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {/* Voice Button */}
        <button
          onClick={handleVoice}
          className={`flex flex-1 items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-250 ease-swift ${
            isListening
              ? "border-primary bg-primary/10 text-primary"
              : isSpeaking
              ? "border-success bg-success/10 text-success"
              : "border-border bg-card text-foreground hover:bg-secondary"
          }`}
        >
          {isListening ? (
            <>
              <Mic className="h-4 w-4 animate-pulse" />
              <span>{t("listening")}</span>
            </>
          ) : isSpeaking ? (
            <>
              <Volume2 className="h-4 w-4 animate-pulse" />
              <span>{t("voiceAssistant")}</span>
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              <span>{t("tapToSpeak")}</span>
            </>
          )}
        </button>

        {/* AI Chat Button */}
        <button
          onClick={() => navigate("/assistant")}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-all"
        >
          <MessageSquare className="h-4 w-4" />
          <span>{t("aiAssistant")}</span>
        </button>
      </div>

      {/* Transcript feedback */}
      <AnimatePresence>
        {lastTranscript && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-muted-foreground px-1"
          >
            🎤 "{lastTranscript}"
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceButton;
