import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, ArrowLeft, RefreshCw, Mic, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp, type ScanRecord } from "@/contexts/AppContext";
import { speak } from "@/lib/voice";

const ScanPage = () => {
  const navigate = useNavigate();
  const { t, lang, addScan, setLastScan } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<"eyelid" | "nail">("eyelid");
  const [cameraActive, setCameraActive] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      // Voice guide
      speak(t("voiceGuideStart"), lang);
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  }, [t, lang]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");
    setCapturedImage(dataUrl);
    setCaptured(true);
    stopCamera();

    await speak(t("voiceGuideCapture"), lang);

    // Simulate AI analysis
    setAnalyzing(true);
    await speak(t("voiceGuideAnalyzing"), lang);

    setTimeout(() => {
      // Simulate random Hb value between 5-16
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
    }, 2000);
  }, [t, lang, mode, addScan, setLastScan, navigate, stopCamera]);

  const resetScan = () => {
    setCaptured(false);
    setCapturedImage(null);
    setAnalyzing(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-5 py-4">
        <button onClick={() => { stopCamera(); navigate(-1); }} className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">{t("scanTitle")}</h1>
      </header>

      <main className="flex flex-1 flex-col items-center gap-4 px-5 py-6">
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
        <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border-2 border-border bg-card" style={{ aspectRatio: "4/3" }}>
          {cameraActive && !captured && (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
              {/* Alignment guide */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`rounded-full border-2 border-dashed border-primary/60 ${mode === "eyelid" ? "h-32 w-48" : "h-28 w-28"}`} />
              </div>
              <p className="absolute bottom-3 left-0 right-0 text-center text-sm font-medium text-primary-foreground bg-foreground/50 mx-4 rounded-lg py-1.5">
                {t("scanInstructions")}
              </p>
            </>
          )}

          {captured && capturedImage && (
            <img src={capturedImage} alt="Captured" className="h-full w-full object-cover" />
          )}

          {!cameraActive && !captured && (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
              <Camera className="h-16 w-16 text-muted-foreground" />
              <p className="text-center text-sm text-muted-foreground">{t("scanInstructions")}</p>
            </div>
          )}

          {analyzing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/60">
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
              <Button variant="clinical" size="lg" className="w-full" onClick={capturePhoto}>
                {t("capturePhoto")}
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
