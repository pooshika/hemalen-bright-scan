import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ArrowLeft, RefreshCw, Mic, Volume2, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp, type ScanRecord } from "@/contexts/AppContext";
import { speak, startListening, processVoiceCommand, stopSpeaking } from "@/lib/voice";

const ScanPage = () => {
  const navigate = useNavigate();
  const { t, lang, addScan, setLastScan } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<"eyelid" | "nail">("eyelid");
  const [cameraActive, setCameraActive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string>("");

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play().then(() => setVideoReady(true)).catch(() => setVideoReady(true));
        };
        // Fallback if metadata already loaded
        if (video.readyState >= 1) {
          video.play().then(() => setVideoReady(true)).catch(() => setVideoReady(true));
        }
      }
      setCameraActive(true);
      speak(t("voiceGuideStart"), lang);
    } catch (err) {
      console.error("Camera access denied:", err);
      setVoiceStatus("Camera access denied. Please allow camera permissions.");
      speak("Camera access was denied. Please allow camera permissions and try again.", lang);
    }
  }, [t, lang]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
    setVideoReady(false);
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      stopSpeaking();
    };
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setVoiceStatus("Camera not ready yet. Please wait...");
      await speak(t("voiceGuideCloser"), lang);
      return;
    }

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(dataUrl);
    setCaptured(true);
    stopCamera();

    await speak(t("voiceGuideCapture"), lang);

    // Simulate AI analysis
    setAnalyzing(true);
    await speak(t("voiceGuideAnalyzing"), lang);

    setTimeout(() => {
      const hbValue = parseFloat((Math.random() * 11 + 5).toFixed(1));
      let severity: ScanRecord["severity"];
      if (hbValue >= 12) severity = "normal";
      else if (hbValue >= 10) severity = "mild";
      else if (hbValue >= 8) severity = "moderate";
      else if (hbValue >= 7) severity = "severe";
      else severity = "critical";

      const scan: ScanRecord = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        hbValue,
        severity,
        mode,
      };

      addScan(scan);
      setLastScan(scan);
      setAnalyzing(false);
      navigate("/results");
    }, 2500);
  }, [t, lang, mode, addScan, setLastScan, navigate, stopCamera]);

  const resetScan = () => {
    setCaptured(false);
    setCapturedImage(null);
    setAnalyzing(false);
    setVideoReady(false);
  };

  const handleVoiceCommand = useCallback(() => {
    if (isListening) return;
    setIsListening(true);
    setVoiceStatus(t("listening"));

    const stop = startListening(
      lang,
      async (text) => {
        setIsListening(false);
        setVoiceStatus(`"${text}"`);
        const command = processVoiceCommand(text, lang);

        if (command === "scan") {
          if (!cameraActive) {
            await startCamera();
          } else {
            capturePhoto();
          }
        } else if (command === "help") {
          await speak(t("voiceHelp"), lang);
        } else {
          setVoiceStatus(t("voiceNotUnderstood"));
          await speak(t("voiceNotUnderstood"), lang);
        }
        setTimeout(() => setVoiceStatus(""), 3000);
      },
      () => {
        setIsListening(false);
        setVoiceStatus("");
      }
    );

    if (!stop) {
      setIsListening(false);
      setVoiceStatus("Voice not supported in this browser");
    }
  }, [isListening, lang, t, cameraActive, startCamera, capturePhoto]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => { stopCamera(); navigate(-1); }} className="text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{t("scanTitle")}</h1>
        </div>
        {/* Voice mic button */}
        <button
          onClick={handleVoiceCommand}
          className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-all ${
            isListening
              ? "bg-primary/10 text-primary border border-primary"
              : "bg-secondary text-secondary-foreground border border-border"
          }`}
        >
          {isListening ? <Mic className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
          {isListening ? t("listening") : t("tapToSpeak")}
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center gap-4 px-5 py-6">
        {/* Voice status */}
        <AnimatePresence>
          {voiceStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-sm rounded-lg bg-primary/10 px-4 py-2 text-center text-sm text-primary"
            >
              {voiceStatus}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode("eyelid")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              mode === "eyelid" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {t("eyelidMode")}
          </button>
          <button
            onClick={() => setMode("nail")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              mode === "nail" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {t("nailMode")}
          </button>
        </div>

        {/* Camera / Preview area */}
        <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border-2 border-border bg-black" style={{ minHeight: "320px", aspectRatio: "4/3" }}>
          {cameraActive && !captured && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 h-full w-full object-cover"
                style={{ transform: "scaleX(-1)", zIndex: 1 }}
              />
              {/* Alignment guide */}
              {videoReady && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 2 }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`rounded-full border-2 border-dashed border-primary/60 ${mode === "eyelid" ? "h-32 w-48" : "h-28 w-28"}`}
                  />
                </div>
              )}
              <p className="absolute bottom-3 left-0 right-0 text-center text-sm font-medium text-primary-foreground bg-foreground/50 mx-4 rounded-lg py-1.5" style={{ zIndex: 3 }}>
                {t("scanInstructions")}
              </p>
            </>
          )}

          {captured && capturedImage && (
            <img src={capturedImage} alt="Captured" className="absolute inset-0 h-full w-full object-cover" />
          )}

          {!cameraActive && !captured && (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Camera className="h-16 w-16 text-muted-foreground" />
              </motion.div>
              <p className="text-center text-sm text-muted-foreground">{t("scanInstructions")}</p>
            </div>
          )}

          {analyzing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/60" style={{ zIndex: 4 }}>
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-foreground border-t-transparent" />
              <p className="mt-3 text-base font-semibold text-primary-foreground">{t("analyzing")}</p>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Controls */}
        <div className="flex w-full max-w-sm flex-col gap-3">
          {!cameraActive && !captured && (
            <Button variant="clinical" size="lg" className="w-full" onClick={startCamera}>
              <Camera className="h-5 w-5 mr-2" />
              {t("useCamera")}
            </Button>
          )}

          {cameraActive && !captured && (
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                variant="clinical"
                size="lg"
                className="w-full"
                onClick={capturePhoto}
                disabled={!videoReady}
              >
                {videoReady ? t("capturePhoto") : t("loading")}
              </Button>
            </motion.div>
          )}

          {captured && !analyzing && (
            <Button variant="outline" size="lg" className="w-full" onClick={resetScan}>
              <RefreshCw className="h-5 w-5 mr-2" />
              {t("newScan")}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default ScanPage;
