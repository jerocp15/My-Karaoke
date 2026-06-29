import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Sliders, Activity, Info, Sparkles, HelpCircle, Settings, Music, Headphones, Eye, EyeOff } from "lucide-react";

export default function VoiceEnhancerCard() {
  const [isMicActive, setIsMicActive] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [micVolume, setMicVolume] = useState(50); // 0 to 150
  const [echoLevel, setEchoLevel] = useState(25); // delay feedback gain (0 to 100)
  const [echoTime, setEchoTime] = useState(0.28); // delay duration (0.1 to 1.0)
  const [eqPreset, setEqPreset] = useState<"vocal-boost" | "bass-boost" | "warm" | "none">("vocal-boost");
  const [errorMsg, setErrorMsg] = useState("");
  const [showTip, setShowTip] = useState(true);

  // Advanced DSP & Hardware Microphone Constraints
  const [useStudioCompressor, setUseStudioCompressor] = useState(true); // Limits peak clipping & boosts details
  const [useLowCutFilter, setUseLowCutFilter] = useState(true); // Filters low-frequency sub-85Hz background rumbles
  const [echoCancellation, setEchoCancellation] = useState(true); // Crucial for open speakers
  const [noiseSuppression, setNoiseSuppression] = useState(false); // Default FALSE for singing to prevent watery cuts
  const [autoGainControl, setAutoGainControl] = useState(false); // Default FALSE to maintain singing expression and dynamics
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Web Audio Node Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const delayGainNodeRef = useRef<GainNode | null>(null);
  const eqFilterRef = useRef<BiquadFilterNode | null>(null);
  const lowCutFilterRef = useRef<BiquadFilterNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);

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
    lowCutFilterRef.current = null;
    compressorRef.current = null;
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
        // Presence boost at 2.5kHz with medium Q to highlight vocal articulation and clarity
        filter.type = "peaking";
        filter.frequency.setValueAtTime(2500, now);
        filter.Q.setValueAtTime(1.2, now);
        filter.gain.setValueAtTime(4.5, now);
        break;
      case "bass-boost":
        // Rich radio-host shelf at 150Hz for depth
        filter.type = "lowshelf";
        filter.frequency.setValueAtTime(150, now);
        filter.gain.setValueAtTime(5.5, now);
        break;
      case "warm":
        // Warm peaking boost in low-mids at 400Hz to add chest body to vocals
        filter.type = "peaking";
        filter.frequency.setValueAtTime(400, now);
        filter.Q.setValueAtTime(1.0, now);
        filter.gain.setValueAtTime(3.5, now);
        break;
      case "none":
      default:
        // Pass-through flat setting
        filter.type = "allpass";
        break;
    }
  };

  // Start Voice Capturing & Real-time DSP Processing
  const startMic = async () => {
    try {
      setErrorMsg("");
      
      // Clean up previous context/streams if active to prevent overlapping handles
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        try {
          await audioCtxRef.current.close();
        } catch (e) {}
        audioCtxRef.current = null;
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error("Your browser does not support the Web Audio API.");
      }

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Request mic stream with custom hardware parameters tuned for high fidelity music
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation,
          noiseSuppression,
          autoGainControl,
          latency: 0,
          channelCount: 1,
        } as any,
      });
      streamRef.current = mediaStream;

      const source = ctx.createMediaStreamSource(mediaStream);
      sourceRef.current = source;

      // Real-time Analyser for Canvas waveform oscilloscope
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // Low-Cut rumble filter to discard sub-85Hz noise, mic handling friction, and ventilation hum
      const lowCutFilter = ctx.createBiquadFilter();
      lowCutFilter.type = "highpass";
      lowCutFilter.frequency.setValueAtTime(85, ctx.currentTime);
      lowCutFilterRef.current = lowCutFilter;

      // Equalizer Filter
      const eqFilter = ctx.createBiquadFilter();
      applyEqPreset(eqFilter, eqPreset);
      eqFilterRef.current = eqFilter;

      // Gain (Volume) filter node
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(micVolume / 100, ctx.currentTime);
      gainNodeRef.current = gainNode;

      // Karaoke Echo/Space delay unit
      const delayNode = ctx.createDelay(1.5);
      delayNode.delayTime.setValueAtTime(echoTime, ctx.currentTime);
      delayNodeRef.current = delayNode;

      // Echo Feedback intensity control
      const delayGainNode = ctx.createGain();
      delayGainNode.gain.setValueAtTime(echoLevel / 100, ctx.currentTime);
      delayGainNodeRef.current = delayGainNode;

      // --- Connect the high-fidelity DSP graph ---
      source.connect(analyser);

      let lastNode: AudioNode = analyser;

      // Apply low cut if enabled
      if (useLowCutFilter) {
        analyser.connect(lowCutFilter);
        lastNode = lowCutFilter;
      }

      lastNode.connect(eqFilter);
      eqFilter.connect(gainNode);

      // Create space echo feedforward / feedback loop
      eqFilter.connect(delayNode);
      delayNode.connect(delayGainNode);
      delayGainNode.connect(eqFilter); // feed loop back into EQ

      // Master output stage with optional high-end studio compression
      if (useStudioCompressor) {
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-24, ctx.currentTime); // begin compression at -24dB
        compressor.knee.setValueAtTime(30, ctx.currentTime); // smooth transition curve
        compressor.ratio.setValueAtTime(4, ctx.currentTime); // 4:1 compression ratio
        compressor.attack.setValueAtTime(0.003, ctx.currentTime); // ultra fast 3ms attack
        compressor.release.setValueAtTime(0.25, ctx.currentTime); // 250ms release
        compressorRef.current = compressor;

        gainNode.connect(compressor);
        compressor.connect(ctx.destination);
      } else {
        gainNode.connect(ctx.destination);
      }

      setIsMicActive(true);

      // Start the real-time visualizer canvas loops
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

  // Toggle mic stream
  const handleToggleMic = () => {
    if (isMicActive) {
      stopMic();
    } else {
      startMic();
    }
  };

  // Automatic mic re-initialization upon change in hardware or routing filters while active
  useEffect(() => {
    if (isMicActive) {
      startMic();
    }
  }, [echoCancellation, noiseSuppression, autoGainControl, useStudioCompressor, useLowCutFilter]);

  // Live real-time adjustment of volume/gain slider
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(micVolume / 100, audioCtxRef.current.currentTime, 0.01);
    }
  }, [micVolume]);

  // Live adjustment of echo feedback strength
  useEffect(() => {
    if (delayGainNodeRef.current && audioCtxRef.current) {
      // Limit maximum feedback to 0.75 to prevent acoustic infinite howling
      const safeLevel = Math.min(echoLevel / 100, 0.75);
      delayGainNodeRef.current.gain.setTargetAtTime(safeLevel, audioCtxRef.current.currentTime, 0.01);
    }
  }, [echoLevel]);

  // Live adjustment of echo spacing delay tempo
  useEffect(() => {
    if (delayNodeRef.current && audioCtxRef.current) {
      delayNodeRef.current.delayTime.setTargetAtTime(echoTime, audioCtxRef.current.currentTime, 0.05);
    }
  }, [echoTime]);

  // Live adjustment of active EQ filters
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
      if (!analyserRef.current) return; // mic inactive, stop loop

      animationFrameRef.current = requestAnimationFrame(draw);
      analyserNode.getByteTimeDomainData(dataArray);

      // Clear canvas with deep transparent slate overlay for fluorescent phosphor trail look
      canvasCtx.fillStyle = "rgba(9, 13, 22, 0.25)";
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle horizontal grid line
      canvasCtx.strokeStyle = "rgba(34, 211, 238, 0.05)";
      canvasCtx.lineWidth = 1;
      canvasCtx.beginPath();
      canvasCtx.moveTo(0, canvas.height / 2);
      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();

      canvasCtx.lineWidth = 2.5;
      
      // Beautiful moving gradient
      const gradient = canvasCtx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "#22d3ee"); // cyan-400
      gradient.addColorStop(0.5, "#6366f1"); // indigo-500
      gradient.addColorStop(1, "#38bdf8"); // sky-400
      canvasCtx.strokeStyle = gradient;

      // Glow effect for visual depth
      canvasCtx.shadowBlur = 12;
      canvasCtx.shadowColor = "rgba(34, 211, 238, 0.6)";

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

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 300;
    canvas.height = rect.height || 80;

    draw();
  };

  // Render resting states on mount
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
      {/* HEADER SECTION */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`flex items-center justify-between cursor-pointer select-none group ${isCollapsed ? "" : "border-b border-slate-800 pb-2.5"}`}
      >
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isMicActive ? "bg-cyan-500/10 text-cyan-400 animate-pulse" : "bg-slate-800 text-slate-400"} group-hover:scale-105 transition-transform`}>
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
              <span>Voice Enhancer DSP v2</span>
              <span className="text-[8px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1 py-0.2 rounded">HD</span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Live microphone DSP loop with studio limiter & sound filters.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[9px] font-mono font-bold border px-2 py-0.5 rounded transition-all ${
            isMicActive 
              ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 animate-pulse" 
              : "bg-slate-950 border-slate-800 text-slate-500"
          }`}>
            {isMicActive ? "STUDIO LIVE" : "STANDBY"}
          </span>
          <div className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1 font-mono">
            {isCollapsed ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{isCollapsed ? "Show" : "Hide"}</span>
          </div>
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-4 animate-fade-in">
          {/* ERROR MESSAGE CONTAINER */}
          {errorMsg && (
            <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 text-xs p-3 rounded-xl flex items-start gap-2 animate-fade-in">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">{errorMsg}</p>
            </div>
          )}

          {/* HEADPHONES WARNING AND SOUND HINT */}
          {showTip && (
            <div className="bg-cyan-950/10 border border-cyan-500/10 text-cyan-200/90 text-[10px] p-3 rounded-xl flex items-start justify-between gap-1.5 leading-relaxed">
              <div className="flex gap-2">
                <Headphones className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
                <p>
                  <strong>🎵 Sound Quality Tip:</strong> To experience stunning studio vocals, turn off <strong>Noise Suppression</strong> and plug in <strong>headphones</strong>. Standard speech noise-cancelling chops off musical sustain!
                </p>
              </div>
              <button onClick={() => setShowTip(false)} className="text-cyan-500 hover:text-cyan-300 font-bold ml-1 shrink-0 px-1">
                ✕
              </button>
            </div>
          )}

          {/* OSCILLOSCOPE GRAPH SCREEN */}
          <div className="relative h-20 bg-slate-950 rounded-2xl overflow-hidden border border-slate-850 shadow-inner flex flex-col justify-end">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            {isMicActive && (
              <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/85 border border-cyan-500/20 backdrop-blur-xs text-[9px] font-bold font-mono text-cyan-400">
                <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>STUDIO DYNAMICS COMPRESSED</span>
              </div>
            )}
          </div>

          {/* ON/OFF TOGGLE SWITCH BLOCK */}
          <div className="flex items-center gap-4 bg-slate-950 p-3.5 rounded-2xl border border-slate-850">
            <button
              onClick={handleToggleMic}
              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-90 shadow-md ${
                isMicActive
                  ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:opacity-90"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              }`}
            >
              {isMicActive ? <Mic className="w-5 h-5 text-black font-black" /> : <MicOff className="w-5 h-5 text-slate-400" />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-white">
                  {isMicActive ? "Pristine Voice Loop Live!" : "Microphone Offline"}
                </span>
                <span className="text-[10px] text-cyan-400 font-mono font-bold">
                  {isMicActive ? "Tap to turn off" : "Tap to activate"}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {isMicActive
                  ? "Using zero-latency DSP path. EQ, Space Echo, and Limiter active!"
                  : "Turn on to route your mic to speakers with professional echo reverb & EQ presets!"}
              </p>
            </div>
          </div>

          {/* PRIMARY CONTROLS */}
          <div className="space-y-3 pt-1">
            
            {/* EQ PRESET SHIPS */}
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

            {/* PRIMARY SLIDERS */}
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

            {/* ECHO TIME SLIDER */}
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

            {/* ADVANCED OPTIMIZATIONS & HARDWARE SETTINGS ACCORDION */}
            <div className="pt-2">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between py-2 px-3 bg-slate-950/80 border border-slate-850 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 hover:bg-slate-900 transition-all cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Advanced Studio Mic Tuning</span>
                </span>
                <span className="text-xs">{showAdvanced ? "▲ Hide" : "▼ Show"}</span>
              </button>

              {showAdvanced && (
                <div className="p-4 mt-2 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-4 animate-fade-in text-[11px]">
                  
                  {/* STUDIO MUSIC MODE EXPLANATION QUICK PRESETS */}
                  <div className="border-b border-slate-850 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white uppercase font-mono text-[10px] tracking-wide">Signal Preset Mode</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            setNoiseSuppression(false);
                            setAutoGainControl(false);
                            setUseStudioCompressor(true);
                            setUseLowCutFilter(true);
                          }}
                          className="px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/25 text-[9px] font-bold rounded cursor-pointer"
                        >
                          Preset: Studio Singing (High Fidelity)
                        </button>
                        <button
                          onClick={() => {
                            setNoiseSuppression(true);
                            setAutoGainControl(true);
                            setUseStudioCompressor(false);
                            setUseLowCutFilter(false);
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-750 text-[9px] font-bold rounded cursor-pointer"
                        >
                          Preset: Standard Speech
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Web browsers aggressively compress audio and gate sound to filter out background noise. While good for business meetings, this ruins singing dynamics and cuts off vocals. The Studio Singing preset turns off aggressive gates to capture your pure, unaltered singing voice!
                    </p>
                  </div>

                  {/* HARDWARE SWITCHES */}
                  <div className="space-y-3">
                    {/* STUDIO COMPRESSOR */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <span className="font-bold text-slate-200 block">Studio Compressor (Limiter)</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Smooths out sudden loud vocal spikes to prevent harsh speaker clipping, while boosting soft details. (Highly Recommended)
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={useStudioCompressor}
                        onChange={(e) => setUseStudioCompressor(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-800 text-cyan-500 bg-slate-950 focus:ring-0 cursor-pointer mt-1"
                      />
                    </div>

                    {/* LOW CUT FILTER */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <span className="font-bold text-slate-200 block">85Hz Low-Cut Rumble Filter</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Discards sub-85Hz low-frequency noise (e.g. mic handling noises, table knocks, and AC rumbles) for a clean vocal baseline.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={useLowCutFilter}
                        onChange={(e) => setUseLowCutFilter(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-800 text-cyan-500 bg-slate-950 focus:ring-0 cursor-pointer mt-1"
                      />
                    </div>

                    {/* ECHO CANCELLATION */}
                    <div className="flex items-start justify-between gap-3 border-t border-slate-850 pt-3">
                      <div className="flex-1">
                        <span className="font-bold text-slate-200 block">Hardware Acoustic Echo Cancellation</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Prevents speakers from feeding back into your mic. <strong>Keep ON if singing through open speakers!</strong> Toggle OFF if you wear headphones for 100% natural, lag-free tone.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={echoCancellation}
                        onChange={(e) => setEchoCancellation(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-800 text-cyan-500 bg-slate-950 focus:ring-0 cursor-pointer mt-1"
                      />
                    </div>

                    {/* NOISE SUPPRESSION */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <span className="font-bold text-slate-200 block">Hardware Voice Noise Suppression</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Aggressively cuts ambient background humming. <strong>Warning:</strong> For singing, this will treat your long sustained vocal notes as noise and cut them off! (Recommended: OFF for singing)
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={noiseSuppression}
                        onChange={(e) => setNoiseSuppression(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-800 text-cyan-500 bg-slate-950 focus:ring-0 cursor-pointer mt-1"
                      />
                    </div>

                    {/* AUTO GAIN CONTROL */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <span className="font-bold text-slate-200 block">Hardware Automatic Gain Control</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Auto-normalizes voice levels. For singing, this squashes musical expression, dynamics, and vocal range. (Recommended: OFF for singing)
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={autoGainControl}
                        onChange={(e) => setAutoGainControl(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-800 text-cyan-500 bg-slate-950 focus:ring-0 cursor-pointer mt-1"
                      />
                    </div>

                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
