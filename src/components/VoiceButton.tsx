import { useState } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { speak, startListening, processVoiceCommand, stopSpeaking } from "@/lib/voice";
import { useNavigate } from "react-router-dom";

const VoiceButton = () => {
  const { lang, t } = useApp();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleVoice = async () => {
    if (isListening) return;

    setIsListening(true);
    const stop = startListening(
      lang,
      async (text) => {
        setIsListening(false);
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
    <button
      onClick={handleVoice}
      className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-250 ease-swift ${
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
  );
};

export default VoiceButton;
