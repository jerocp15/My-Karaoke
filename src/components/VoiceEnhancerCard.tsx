import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Sliders, Activity, Info, Sparkles, HelpCircle } from "lucide-react";

export default function VoiceEnhancerCard() {
  const [isMicActive, setIsMicActive] = useState(false);
  const [micVolume, setMicVolume] = useState(40); // 0 to 100
  const [echoLevel, setEchoLevel] = useState(30); // delay feedback gain (0 to 100)
  const [echoTime, setEchoTime] = useState(0.28); // delay duration (0.1 to 1.0)
  const [eqPreset, setEqPreset] = useState<"vocal-boost" | "bass-boost" | "warm" | "none">("vocal-boost");
  const [errorMsg, setErrorMsg] = useState("");
  const [showTip, setShowTip] = useState(true);

  // Web Audio Node Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const delayGainNodeRef = useRef<GainNode | null>(null);
  const eqFilterRef = useRef<BiquadFilterNode | null>(null);

  // Animation & Canvas Refs
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stop microphone and clean up audio graph
  const stopMic = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
      audioCtxRef.current = null;
    }

    sourceRef.current = null;
    gainNodeRef.current = null;
    delayNodeRef.current = null;
    delayGainNodeRef.current = null;
    eqFilterRef.current = null;
    analyserRef.current = null;
    setIsMicActive(false);

    // Reset canvas to straight line
    drawRestingWave();
  };

  // Draw a static, subtle resting line on the canvas
  const drawRestingWave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 300;
    canvas.height = rect.height || 80;

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    canvasCtx.fillStyle = "#0f172a"; // dark slate background
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.strokeStyle = "rgba(71, 85, 105, 0.4)"; // muted slate-600
    canvasCtx.lineWidth = 2;
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, canvas.height / 2);
    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  };

  // Setup Equalizer filters based on selected preset
  const applyEqPreset = (filter: BiquadFilterNode, preset: typeof eqPreset) => {
    if (!filter) return;
    const ctx = audioCtxRef.current;
    const now = ctx ? ctx.currentTime : 0;

    switch (preset) {
      case "vocal-boost":
        // High-pass filter at 120Hz to block rumble, peaking filter at 3kHz for voice presence
        filter.type = "highpass";
        filter.frequency.setValueAtTime(120, now);
        break;
      case "bass-boost":
        // Low shelf boost at 150Hz by +6dB
        filter.type = "lowshelf";
        filter.frequency.setValueAtTime(150, now);
        filter.gain.setValueAtTime(6, now);
        break;
      case "warm":
        // Peaking filter at 450Hz by +4dB for rich body
        filter.type = "peaking";
        filter.frequency.setValueAtTime(450, now);
        filter.Q.setValueAtTime(1.0, now);
        filter.gain.setValueAtTime(4, now);
        break;
      case "none":
      default:
        // Pass-through setting
        filter.type = "allpass";
        break;
    }
  };

  // Start Voice Capturing & Real-time DSP Processing
  const startMic = async () => {
    try {
      setErrorMsg("");
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error("Your browser does not support the Web Audio API.");
      }

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Request mic with hardware-level Echo Cancellation & Noise Suppression
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = mediaStream;

      const source = ctx.createMediaStreamSource(mediaStream);
      sourceRef.current = source;

      // Real-time Analyser for Canvas rendering
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // Gain (Volume) filter
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(micVolume / 100, ctx.currentTime);
      gainNodeRef.current = gainNode;

      // Equalizer Filter
      const eqFilter = ctx.createBiquadFilter();
      applyEqPreset(eqFilter, eqPreset);
      eqFilterRef.current = eqFilter;

      // Karaoke Echo delay unit
      const delayNode = ctx.createDelay(1.5);
      delayNode.delayTime.setValueAtTime(echoTime, ctx.currentTime);
      delayNodeRef.current = delayNode;

      // Echo Feedback intensity control
      const delayGainNode = ctx.createGain();
      delayGainNode.gain.setValueAtTime(echoLevel / 100, ctx.currentTime);
      delayGainNodeRef.current = delayGainNode;

      // --- Connect the DSP graph ---
      // Source Mic -> Analyser -> EQ Filter -> Mic Volume Gain -> Device Output Speakers
      source.connect(analyser);
      analyser.connect(eqFilter);
      eqFilter.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Create a feedforward / feedback loop for Karaoke Space Echo
      eqFilter.connect(delayNode);
      delayNode.connect(delayGainNode);
      delayGainNode.connect(eqFilter); // loop delay back to EQ Filter

      setIsMicActive(true);

      // Trigger the real-time canvas animation loop
      startWaveformAnimation(analyser);
    } catch (err: any) {
      console.error("[Voice Enhancer] Failed to activate microphone:", err);
      setErrorMsg(
        err.message ||
          "Unable to access microphone. Please ensure microphone permissions are granted and you are on a secure (HTTPS) link."
      );
      setIsMicActive(false);
    }
  };

  // Toggle state
  const handleToggleMic = () => {
    if (isMicActive) {
      stopMic();
    } else {
      startMic();
    }
  };

  // Live adjustment of volume/gain
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(micVolume / 100, audioCtxRef.current.currentTime, 0.01);
    }
  }, [micVolume]);

  // Live adjustment of echo feedback strength
  useEffect(() => {
    if (delayGainNodeRef.current && audioCtxRef.current) {
      // Keep feedback level under safe limit (max 0.75) to prevent infinite howling feedback
      const safeLevel = Math.min(echoLevel / 100, 0.75);
      delayGainNodeRef.current.gain.setTargetAtTime(safeLevel, audioCtxRef.current.currentTime, 0.01);
    }
  }, [echoLevel]);

  // Live adjustment of echo spacing delay
  useEffect(() => {
    if (delayNodeRef.current && audioCtxRef.current) {
      delayNodeRef.current.delayTime.setTargetAtTime(echoTime, audioCtxRef.current.currentTime, 0.05);
    }
  }, [echoTime]);

  // Live adjustment of EQ presets
  useEffect(() => {
    if (eqFilterRef.current) {
      applyEqPreset(eqFilterRef.current, eqPreset);
    }
  }, [eqPreset]);

  // Real-time canvas oscilloscope renderer
  const startWaveformAnimation = (analyserNode: AnalyserNode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!analyserRef.current) return; // mic closed, exit loop

      animationFrameRef.current = requestAnimationFrame(draw);
      analyserNode.getByteTimeDomainData(dataArray);

      // Clear with dark blue semi-transparent overlay for trailing phosphor glow effect
      canvasCtx.fillStyle = "rgba(9, 13, 22, 0.25)";
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid helper lines
      canvasCtx.strokeStyle = "rgba(34, 211, 238, 0.05)";
      canvasCtx.lineWidth = 1;
      canvasCtx.beginPath();
      // Draw mid-line
      canvasCtx.moveTo(0, canvas.height / 2);
      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();

      canvasCtx.lineWidth = 2.5;
      
      // Beautiful gradient
      const gradient = canvasCtx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "#06b6d4"); // cyan-500
      gradient.addColorStop(0.5, "#6366f1"); // indigo-500
      gradient.addColorStop(1, "#22d3ee"); // cyan-400
      canvasCtx.strokeStyle = gradient;

      // Glow effect for a premium hardware feeling
      canvasCtx.shadowBlur = 10;
      canvasCtx.shadowColor = "rgba(6, 182, 212, 0.6)";

      canvasCtx.beginPath();
      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
      canvasCtx.shadowBlur = 0; // reset shadow
    };

    // Make sure dimensions are set sharply
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 300;
    canvas.height = rect.height || 80;

    draw();
  };

  // Make sure canvas renders a nice resting state upon component mount
  useEffect(() => {
    drawRestingWave();
    window.addEventListener("resize", drawRestingWave);
    return () => {
      window.removeEventListener("resize", drawRestingWave);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
      {/* CARD HEADER */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isMicActive ? "bg-cyan-500/10 text-cyan-400" : "bg-slate-800 text-slate-400"}`}>
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-cyan-400">
              Voice Enhancer (DSP)
            </h3>
            <p className="text-[10px] text-slate-400">
              Live microphone feedback processor with studio effects.
            </p>
          </div>
        </div>
        <span className="text-[9px] font-mono font-bold bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-cyan-400 animate-pulse">
          {isMicActive ? "LIVE FEEDBACK" : "STANDBY"}
        </span>
      </div>

      {/* ERROR MSG BANNER */}
      {errorMsg && (
        <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 text-xs p-3 rounded-xl flex items-start gap-2 animate-fade-in">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{errorMsg}</p>
        </div>
      )}

      {/* FEEDBACK WARNING TIP */}
      {showTip && (
        <div className="bg-amber-950/10 border border-amber-500/10 text-amber-300/90 text-[10px] p-3 rounded-xl flex items-start justify-between gap-1.5 leading-relaxed">
          <div className="flex gap-2">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <p>
              <strong>💡 Pro Tip:</strong> Use headphones or connect to an external speaker to prevent howling feedback loops when turning on live speaker monitoring!
            </p>
          </div>
          <button onClick={() => setShowTip(false)} className="text-amber-500 hover:text-amber-300 font-bold ml-1 shrink-0 px-1">
            ✕
          </button>
        </div>
      )}

      {/* REAL-TIME CANVAS OSCILLOSCOPE VISUALIZER */}
      <div className="relative h-20 bg-slate-950 rounded-2xl overflow-hidden border border-slate-850 shadow-inner flex flex-col justify-end">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        {isMicActive && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/80 border border-cyan-500/20 backdrop-blur-xs text-[9px] font-bold font-mono text-cyan-400">
            <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>MIC GAIN PEAKS ACTIVE</span>
          </div>
        )}
      </div>

      {/* MIC ACTIVATION CONTROLLER */}
      <div className="flex items-center gap-4 bg-slate-950 p-3.5 rounded-2xl border border-slate-850">
        <button
          onClick={handleToggleMic}
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-90 shadow-md ${
            isMicActive
              ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:bg-cyan-400"
              : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
          }`}
        >
          {isMicActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-slate-400" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-white">
              {isMicActive ? "Microphone is Live!" : "Microphone Off"}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {isMicActive ? "Tap to disconnect" : "Tap to activate monitoring"}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 truncate">
            {isMicActive
              ? "Your voice is being enhanced with the selected effects DSP filter graph!"
              : "Connect your device microphone to sing with rich echo and EQ preset enhancements."}
          </p>
        </div>
      </div>

      {/* DETAILED EFFECT CONTROLS */}
      <div className="space-y-3 pt-1">
        
        {/* EQ PRESET CHIPS */}
        <div>
          <label className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block mb-2">
            Equalizer Voice Presets
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(["vocal-boost", "bass-boost", "warm", "none"] as const).map((preset) => (
              <button
                key={preset}
                disabled={!isMicActive}
                onClick={() => setEqPreset(preset)}
                className={`py-1.5 px-1 text-center rounded-lg text-[10px] font-extrabold transition-all border uppercase font-mono cursor-pointer ${
                  eqPreset === preset
                    ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/35 shadow-sm"
                    : "bg-slate-950/40 text-slate-500 border-slate-850 hover:bg-slate-900/60 hover:text-slate-300"
                } ${!isMicActive ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                {preset === "vocal-boost" && "Clear Vocal"}
                {preset === "bass-boost" && "Bass Boost"}
                {preset === "warm" && "Stage Warm"}
                {preset === "none" && "Bypass"}
              </button>
            ))}
          </div>
        </div>

        {/* CONTROLS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* VOLUME SLIDER */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase text-slate-400">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Microphone Volume</span>
              </span>
              <span className="text-cyan-400">{micVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              value={micVolume}
              onChange={(e) => setMicVolume(Number(e.target.value))}
              disabled={!isMicActive}
              className={`w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400 ${
                !isMicActive ? "opacity-30 cursor-not-allowed" : ""
              }`}
            />
          </div>

          {/* ECHO LEVEL SLIDER */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Echo Reverb Intensity</span>
              </span>
              <span className="text-indigo-400">{echoLevel}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              value={echoLevel}
              onChange={(e) => setEchoLevel(Number(e.target.value))}
              disabled={!isMicActive}
              className={`w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-400 ${
                !isMicActive ? "opacity-30 cursor-not-allowed" : ""
              }`}
            />
          </div>
        </div>

        {/* ECHO DELAY SPEED SLIDER */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>Echo Delay Spacing (Tempo Speed)</span>
            </span>
            <span className="text-slate-300">{(echoTime * 1000).toFixed(0)} ms</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.02"
            value={echoTime}
            onChange={(e) => setEchoTime(Number(e.target.value))}
            disabled={!isMicActive}
            className={`w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-slate-400 ${
              !isMicActive ? "opacity-30 cursor-not-allowed" : ""
            }`}
          />
        </div>

      </div>
    </div>
  );
}
