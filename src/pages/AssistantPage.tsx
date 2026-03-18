import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Mic, Volume2, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useApp } from "@/contexts/AppContext";
import { speak, startListening, stopSpeaking } from "@/lib/voice";
import BottomNav from "@/components/BottomNav";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const systemKnowledge: Record<string, Record<string, string>> = {
  en: {
    greeting: "Hello! I'm your HemaLen AI health assistant. I can help you understand anemia, hemoglobin levels, diet tips, and guide you through the app. What would you like to know?",
    anemia: "**Anemia** occurs when your body doesn't have enough healthy red blood cells to carry adequate oxygen to tissues.\n\n**Common symptoms:**\n- Fatigue and weakness\n- Pale skin, especially in eyelids and nail beds\n- Shortness of breath\n- Dizziness\n- Cold hands and feet\n\n**Normal hemoglobin levels:**\n- Men: 13.5-17.5 g/dL\n- Women: 12.0-15.5 g/dL\n- Children: 11.0-16.0 g/dL\n\n⚠️ *This is a screening tool, not a final diagnosis.*",
    diet: "**Iron-rich foods to fight anemia:**\n\n🥬 **Vegetables:** Spinach, moringa, beetroot, broccoli\n🫘 **Legumes:** Lentils (dal), chickpeas, kidney beans\n🥩 **Proteins:** Eggs, fish, lean red meat\n🍊 **Vitamin C:** Oranges, lemons, guava (helps iron absorption)\n🌰 **Nuts & Seeds:** Pumpkin seeds, sesame seeds, dates\n\n💡 **Tip:** Avoid tea/coffee with meals — they reduce iron absorption!",
    scan: "**How to scan:**\n\n1. Go to the **Scan** screen\n2. Choose **Eyelid Mode** or **Nail Bed Mode**\n3. Tap **Use Camera** to start\n4. Pull your lower eyelid down gently\n5. Position it within the guide circle\n6. Hold still and tap **Capture Photo**\n7. Wait for AI analysis\n\n🎤 You can also use voice commands: say \"start scan\"!",
    emergency: "**Emergency guidance (Hb < 8 g/dL):**\n\n🚨 If your result shows **severe** or **critical** levels:\n1. **Don't panic** — stay calm\n2. Use the **Call Doctor** button on the results screen\n3. Tap **Find Nearest Hospital** for directions\n4. If you feel dizzy, sit down immediately\n5. Call emergency services: **108** (India)\n\n📞 Set up your emergency contact in Profile settings.",
    fallback: "I understand your question. Here's what I know:\n\nI can help with:\n- 🩺 **Anemia information** — symptoms, causes, types\n- 🍎 **Diet recommendations** — iron-rich foods\n- 📱 **App usage** — how to scan, view history\n- 🚨 **Emergency guidance** — what to do if levels are low\n\nPlease ask me about any of these topics!",
  },
  ta: {
    greeting: "வணக்கம்! நான் உங்கள் HemaLen AI சுகாதார உதவியாளர். இரத்தசோகை, ஹீமோகுளோபின் அளவுகள், உணவு குறிப்புகள் பற்றி உதவ முடியும். என்ன தெரிந்து கொள்ள விரும்புகிறீர்கள்?",
    anemia: "**இரத்தசோகை** என்பது உங்கள் உடலில் போதுமான ஆரோக்கியமான சிவப்பு இரத்த அணுக்கள் இல்லாதபோது ஏற்படுகிறது.\n\n**பொதுவான அறிகுறிகள்:**\n- சோர்வு மற்றும் பலவீனம்\n- வெளிர் தோல்\n- மூச்சுத் திணறல்\n- தலை சுற்றல்\n\n**சாதாரண ஹீமோகுளோபின் அளவுகள்:**\n- ஆண்கள்: 13.5-17.5 g/dL\n- பெண்கள்: 12.0-15.5 g/dL\n\n⚠️ *இது ஒரு திரையிடல் கருவி, இறுதி நோயறிதல் அல்ல.*",
    diet: "**இரத்தசோகையை எதிர்க்க இரும்புச்சத்து உணவுகள்:**\n\n🥬 கீரை, முருங்கை, பீட்ரூட்\n🫘 பருப்பு, கொண்டைக்கடலை\n🍊 ஆரஞ்சு, எலுமிச்சை, கொய்யா\n🌰 பூசணி விதைகள், எள்\n\n💡 உணவுடன் தேநீர்/காப்பி தவிர்க்கவும்!",
    scan: "**ஸ்கேன் செய்வது எப்படி:**\n\n1. ஸ்கேன் திரைக்கு செல்லவும்\n2. கண்ணிமை அல்லது நகப்படுகை முறையைத் தேர்ந்தெடுக்கவும்\n3. கேமராவைத் தொடங்கவும்\n4. கண்ணிமையை கீழே இழுக்கவும்\n5. படம் எடுக்கவும்",
    emergency: "**அவசர வழிகாட்டுதல்:**\n\n🚨 உங்கள் அளவு மிகக் குறைவாக இருந்தால்:\n1. பதற்றமடையாதீர்கள்\n2. மருத்துவரை அழைக்கவும்\n3. அருகிலுள்ள மருத்துவமனையைக் கண்டறியவும்\n📞 அவசர எண்: **108**",
    fallback: "நான் உதவ முடியும்:\n- 🩺 இரத்தசோகை தகவல்\n- 🍎 உணவு பரிந்துரைகள்\n- 📱 செயலி பயன்பாடு\n- 🚨 அவசர வழிகாட்டுதல்",
  },
  hi: {
    greeting: "नमस्ते! मैं आपका HemaLen AI स्वास्थ्य सहायक हूं। एनीमिया, हीमोग्लोबिन स्तर, आहार सुझावों के बारे में मदद कर सकता हूं। क्या जानना चाहेंगे?",
    anemia: "**एनीमिया** तब होता है जब शरीर में पर्याप्त स्वस्थ लाल रक्त कोशिकाएं नहीं होतीं।\n\n**सामान्य लक्षण:**\n- थकान और कमजोरी\n- पीली त्वचा\n- सांस की तकलीफ\n- चक्कर आना\n\n**सामान्य हीमोग्लोबिन स्तर:**\n- पुरुष: 13.5-17.5 g/dL\n- महिला: 12.0-15.5 g/dL\n\n⚠️ *यह एक स्क्रीनिंग टूल है, अंतिम निदान नहीं।*",
    diet: "**एनीमिया से लड़ने के लिए आयरन युक्त खाद्य पदार्थ:**\n\n🥬 पालक, मोरिंगा, चुकंदर\n🫘 दाल, छोले, राजमा\n🍊 संतरा, नींबू, अमरूद\n🌰 कद्दू के बीज, तिल\n\n💡 भोजन के साथ चाय/कॉफी से बचें!",
    scan: "**स्कैन कैसे करें:**\n\n1. स्कैन स्क्रीन पर जाएं\n2. पलक या नाखून मोड चुनें\n3. कैमरा शुरू करें\n4. निचली पलक नीचे खींचें\n5. फोटो लें",
    emergency: "**आपातकालीन मार्गदर्शन:**\n\n🚨 यदि स्तर बहुत कम है:\n1. घबराएं नहीं\n2. डॉक्टर को कॉल करें\n3. निकटतम अस्पताल खोजें\n📞 आपातकालीन नंबर: **108**",
    fallback: "मैं मदद कर सकता हूं:\n- 🩺 एनीमिया जानकारी\n- 🍎 आहार सुझाव\n- 📱 ऐप उपयोग\n- 🚨 आपातकालीन मार्गदर्शन",
  },
};

function getAIResponse(input: string, lang: string): string {
  const lower = input.toLowerCase();
  const kb = systemKnowledge[lang] || systemKnowledge.en;

  if (lower.includes("anemia") || lower.includes("anaemia") || lower.includes("இரத்தசோகை") || lower.includes("एनीमिया") || lower.includes("hemoglobin") || lower.includes("ஹீமோகுளோபின்") || lower.includes("हीमोग्लोबिन") || lower.includes("blood") || lower.includes("இரத்த") || lower.includes("रक्त") || lower.includes("symptom") || lower.includes("அறிகுறி") || lower.includes("लक्षण")) {
    return kb.anemia;
  }
  if (lower.includes("diet") || lower.includes("food") || lower.includes("eat") || lower.includes("iron") || lower.includes("உணவு") || lower.includes("கீரை") || lower.includes("आहार") || lower.includes("खाना") || lower.includes("पालक") || lower.includes("spinach") || lower.includes("moringa") || lower.includes("முருங்கை")) {
    return kb.diet;
  }
  if (lower.includes("scan") || lower.includes("camera") || lower.includes("photo") || lower.includes("how to") || lower.includes("use") || lower.includes("ஸ்கேன்") || lower.includes("எப்படி") || lower.includes("स्कैन") || lower.includes("कैसे")) {
    return kb.scan;
  }
  if (lower.includes("emergency") || lower.includes("hospital") || lower.includes("doctor") || lower.includes("critical") || lower.includes("severe") || lower.includes("அவசர") || lower.includes("மருத்துவ") || lower.includes("आपातकालीन") || lower.includes("अस्पताल") || lower.includes("डॉक्टर")) {
    return kb.emergency;
  }
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey") || lower.includes("வணக்கம்") || lower.includes("नमस्ते") || lower.includes("help") || lower.includes("உதவி") || lower.includes("मदद")) {
    return kb.greeting;
  }
  return kb.fallback;
}

const AssistantPage = () => {
  const navigate = useNavigate();
  const { t, lang } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initial greeting
    const kb = systemKnowledge[lang] || systemKnowledge.en;
    setMessages([{
      id: "greeting",
      role: "assistant",
      content: kb.greeting,
      timestamp: Date.now(),
    }]);
  }, [lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate thinking delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 700));

    const response = getAIResponse(text, lang);

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
      timestamp: Date.now(),
    };

    setIsTyping(false);
    setMessages(prev => [...prev, assistantMsg]);
  }, [lang]);

  const handleSend = () => {
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceInput = () => {
    if (isListening) return;
    setIsListening(true);

    const stop = startListening(
      lang,
      async (text) => {
        setIsListening(false);
        await sendMessage(text);
      },
      () => setIsListening(false)
    );

    if (!stop) {
      setIsListening(false);
    }
  };

  const speakMessage = async (content: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    // Strip markdown for speech
    const plain = content.replace(/[*#_\[\]()!`>-]/g, "").replace(/\n+/g, ". ");
    await speak(plain, lang);
    setIsSpeaking(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-5 py-4">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground">{t("aiAssistant")}</h1>
            <p className="text-xs text-success">{t("online")}</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                msg.role === "user" ? "bg-primary" : "bg-success"
              }`}>
                {msg.role === "user" ? (
                  <User className="h-3.5 w-3.5 text-primary-foreground" />
                ) : (
                  <Bot className="h-3.5 w-3.5 text-success-foreground" />
                )}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-card border border-border text-foreground rounded-tl-sm"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none text-foreground [&_strong]:text-foreground [&_p]:my-1 [&_li]:my-0.5">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
                {msg.role === "assistant" && (
                  <button
                    onClick={() => speakMessage(msg.content)}
                    className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Volume2 className={`h-3 w-3 ${isSpeaking ? "animate-pulse text-primary" : ""}`} />
                    {isSpeaking ? t("listening") : t("tapToSpeak")}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success">
              <Bot className="h-3.5 w-3.5 text-success-foreground" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <div className="border-t border-border bg-background px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleVoiceInput}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
              isListening
                ? "bg-primary text-primary-foreground animate-pulse"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            <Mic className="h-5 w-5" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("askAnything")}
            className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50 transition-opacity"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AssistantPage;
