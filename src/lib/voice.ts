import type { Language } from "./i18n";

const langMap: Record<Language, string> = {
  en: "en-US",
  ta: "ta-IN",
  hi: "hi-IN",
};

export function speak(text: string, lang: Language): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis not supported");
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[lang];
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function startListening(
  lang: Language,
  onResult: (text: string) => void,
  onEnd: () => void
): (() => void) | null {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn("Speech recognition not supported");
    onEnd();
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = langMap[lang];
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onend = () => onEnd();
  recognition.onerror = () => onEnd();

  recognition.start();

  return () => {
    try { recognition.stop(); } catch {}
  };
}

export function processVoiceCommand(
  text: string,
  lang: Language
): "scan" | "history" | "help" | "unknown" {
  const lower = text.toLowerCase();

  // English
  if (lang === "en") {
    if (lower.includes("scan") || lower.includes("start") || lower.includes("check")) return "scan";
    if (lower.includes("history") || lower.includes("past") || lower.includes("previous")) return "history";
    if (lower.includes("help") || lower.includes("how") || lower.includes("what")) return "help";
  }

  // Tamil
  if (lang === "ta") {
    if (lower.includes("ஸ்கேன்") || lower.includes("தொடங்கு") || lower.includes("பரிசோதனை")) return "scan";
    if (lower.includes("வரலாறு") || lower.includes("பழைய")) return "history";
    if (lower.includes("உதவி") || lower.includes("எப்படி")) return "help";
  }

  // Hindi
  if (lang === "hi") {
    if (lower.includes("स्कैन") || lower.includes("शुरू") || lower.includes("जांच")) return "scan";
    if (lower.includes("इतिहास") || lower.includes("पुराना")) return "history";
    if (lower.includes("मदद") || lower.includes("कैसे")) return "help";
  }

  return "unknown";
}
