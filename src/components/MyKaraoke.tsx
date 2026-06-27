/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Search,
  Plus,
  Users,
  LogOut,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Tv,
  Smartphone,
  Check,
  Music,
  Share2,
  AlertCircle,
  History,
  MessageSquare,
  Send,
  Lock,
  Video,
  VideoOff,
  ShieldAlert
} from "lucide-react";
import { SingRoomParty, YTPlaylistItem } from "../types";
import VoiceEnhancerCard from "./VoiceEnhancerCard";

export const SOUND_EFFECTS = [
  { id: "applause", name: "Applause", emoji: "👏", url: "https://assets.mixkit.co/active_storage/sfx/1435/1435-84.wav" },
  { id: "airhorn", name: "Hype Airhorn", emoji: "📣", url: "https://assets.mixkit.co/active_storage/sfx/2747/2747-84.wav" },
  { id: "laughter", name: "Laughter", emoji: "😂", url: "https://assets.mixkit.co/active_storage/sfx/2684/2684-84.wav" },
  { id: "boo", name: "Friendly Boo", emoji: "👎", url: "https://assets.mixkit.co/active_storage/sfx/2407/2407-84.wav" },
  { id: "drumroll", name: "Drum Roll", emoji: "🥁", url: "https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav" },
  { id: "disco", name: "Disco Laser", emoji: "✨", url: "https://assets.mixkit.co/active_storage/sfx/2013/2013-84.wav" }
];

export function playSynthesizedSound(soundId: string) {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const dest = ctx.destination;

    if (soundId === "airhorn") {
      const freqs = [150, 220, 330, 440];
      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(f * 0.8, ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(dest);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      });
    } else if (soundId === "disco") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 1.0);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(ctx.currentTime + 1.0);
    } else if (soundId === "boo") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 1.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } else if (soundId === "drumroll") {
      for (let i = 0; i < 15; i++) {
        const time = ctx.currentTime + i * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(80, time);
        gain.gain.setValueAtTime(0.25, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.07);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(time);
        osc.stop(time + 0.07);
      }
      const crashTime = ctx.currentTime + 15 * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(400, crashTime);
      gain.gain.setValueAtTime(0.15, crashTime);
      gain.gain.exponentialRampToValueAtTime(0.01, crashTime + 0.5);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(crashTime);
      osc.stop(crashTime + 0.5);
    } else if (soundId === "applause") {
      for (let i = 0; i < 20; i++) {
        const time = ctx.currentTime + Math.random() * 1.5;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(400 + Math.random() * 300, time);
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15 + Math.random() * 0.2);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(time);
        osc.stop(time + 0.35);
      }
    } else if (soundId === "laughter") {
      for (let i = 0; i < 6; i++) {
        const time = ctx.currentTime + i * 0.15;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(350, time);
        osc.frequency.exponentialRampToValueAtTime(500, time + 0.1);
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(time);
        osc.stop(time + 0.12);
      }
    }
  } catch (e) {
    console.error("Failed to play synthesized sound effect:", e);
  }
}

export function playSoundEffect(soundId: string) {
  const effect = SOUND_EFFECTS.find((s) => s.id === soundId);
  if (!effect) return;
  const audio = new Audio(effect.url);
  audio.volume = 0.45;
  audio.play().catch((err) => {
    console.log("Audio file playback blocked/failed, using fallback synthesizer:", err);
    playSynthesizedSound(soundId);
  });
}

interface FloatingEmoji {
  id: string;
  emoji: string;
  userName: string;
  soundName: string;
  x: number;
}

export default function MyKaraoke() {
  // Navigation & Join State
  const [room, setRoom] = useState<SingRoomParty | null>(null);
  const [roomIdInput, setRoomIdInput] = useState("");
  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem("singroom_nickname") || "";
  });
  const [roomNameInput, setRoomNameInput] = useState("");
  const [isHostRole, setIsHostRole] = useState(false);
  const [userId] = useState(() => {
    let id = localStorage.getItem("singroom_userid");
    if (!id) {
      id = "user_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("singroom_userid", id);
    }
    return id;
  });

  // UI States
  const [isQrJoin, setIsQrJoin] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room") || params.get("join");
    return !!(roomParam && roomParam.length === 5);
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(`/api/youtube/suggest?q=${encodeURIComponent(searchQuery.trim())}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"search" | "queue" | "enhancer" | "history" | "chat">("search");
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);

  // Chat States
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [hasNewChat, setHasNewChat] = useState(false);

  const activeMobileTabRef = useRef(activeMobileTab);
  useEffect(() => {
    activeMobileTabRef.current = activeMobileTab;
    if (activeMobileTab === "chat") {
      setHasNewChat(false);
    }
  }, [activeMobileTab]);

  const sendChatMessage = (textStr?: string) => {
    const messageText = textStr !== undefined ? textStr : chatInput;
    if (!messageText.trim() || !socketRef.current || !room) return;

    socketRef.current.send(
      JSON.stringify({
        type: "send-message",
        roomId: room.id,
        sender: nickname || "Singer",
        text: messageText.trim()
      })
    );
    if (textStr === undefined) {
      setChatInput("");
    }
  };

  const sendChatReaction = (emoji: string) => {
    if (!socketRef.current || !room) return;
    socketRef.current.send(
      JSON.stringify({
        type: "send-message",
        roomId: room.id,
        sender: nickname || "Singer",
        text: emoji
      })
    );
  };

  // Voice Control States
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Tap microphone to start voice commands");
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [voiceLog, setVoiceLog] = useState<{ text: string; isCommand: boolean }[]>([]);
  const recognitionRef = useRef<any>(null);

  const roomRef = useRef(room);
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  const nicknameRef = useRef(nickname);
  useEffect(() => {
    nicknameRef.current = nickname;
  }, [nickname]);

  const processVoiceCommand = async (rawText: string) => {
    const text = rawText.toLowerCase().trim();

    const speakBack = (msg: string) => {
      if (isTtsEnabled && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(msg);
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    };

    // Helper to log actions
    const logAction = (cmdText: string) => {
      setVoiceLog((prev) => [{ text: cmdText, isCommand: true }, ...prev.slice(0, 9)]);
    };

    // 1. Play / Resume
    if (text === "play" || text === "resume" || text === "start" || text === "unpause" || text === "continue") {
      setVoiceStatus("Command: Play");
      logAction("▶️ Play / Resume");
      speakBack("Playing song");
      playbackControl("play");
      return;
    }

    // 2. Pause / Stop
    if (text === "pause" || text === "stop" || text === "hold" || text === "freeze") {
      setVoiceStatus("Command: Pause");
      logAction("⏸️ Pause");
      speakBack("Pausing song");
      playbackControl("pause");
      return;
    }

    // 3. Skip / Next
    if (text === "skip" || text === "next" || text === "skip song" || text === "next song") {
      setVoiceStatus("Command: Skip");
      logAction("⏭️ Skip Song");
      speakBack("Skipping song");
      playbackControl("next");
      return;
    }

    // 4. Previous / Back
    if (text === "previous" || text === "prev" || text === "back" || text === "go back") {
      setVoiceStatus("Command: Previous");
      logAction("⏮️ Previous Song");
      speakBack("Going back to previous song");
      playbackControl("prev");
      return;
    }

    // 5. Add to queue / Search & Queue
    const queuePatterns = [
      /^(?:add to queue|add)\s+(.+?)(?:\s+to\s+queue)?$/,
      /^(?:queue|sing|play)\s+(.+)$/
    ];

    let query = "";
    for (const pattern of queuePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const potentialQuery = match[1].trim();
        if (potentialQuery && potentialQuery !== "song" && potentialQuery !== "it" && potentialQuery !== "music") {
          query = potentialQuery;
          break;
        }
      }
    }

    if (query) {
      setVoiceStatus(`Searching for: "${query}"`);
      logAction(`🔍 Queue: "${query}"`);
      speakBack(`Searching for ${query}`);

      try {
        const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query + " karaoke")}`);
        if (!response.ok) throw new Error("Search request failed");
        const results = await response.json();
        
        if (results && results.length > 0) {
          const bestMatch = results[0];
          setVoiceStatus(`Added: "${bestMatch.title}"`);
          logAction(`➕ Added "${bestMatch.title}"`);
          speakBack(`Queueing ${bestMatch.title}`);
          
          if (socketRef.current && roomRef.current) {
            socketRef.current.send(
              JSON.stringify({
                type: "party-add-song",
                roomId: roomRef.current.id,
                song: {
                  videoId: bestMatch.videoId,
                  title: bestMatch.title,
                  thumbnail: bestMatch.thumbnail,
                  channelTitle: bestMatch.channelTitle
                },
                queuedBy: nicknameRef.current || "Voice Assistant"
              })
            );
          }
        } else {
          setVoiceStatus(`No results found for "${query}"`);
          speakBack(`No karaoke results found for ${query}`);
        }
      } catch (err) {
        console.error("Voice search error:", err);
        setVoiceStatus("Search failed.");
        speakBack("Error searching for that song.");
      }
    } else {
      setVoiceStatus(`Unknown command: "${rawText}"`);
      speakBack(`Sorry, I didn't recognize that command.`);
    }
  };

  const processVoiceCommandRef = useRef(processVoiceCommand);
  useEffect(() => {
    processVoiceCommandRef.current = processVoiceCommand;
  });

  // Toggle speech listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setErrorMsg("");
      setVoiceStatus("Activating mic...");
      try {
        recognitionRef.current?.start();
      } catch (err: any) {
        console.error(err);
        setVoiceStatus(`Error: Could not start mic.`);
      }
    }
  };

  // Speech recognition initialization
  useEffect(() => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setVoiceStatus("Voice Control not supported in this browser");
      return;
    }

    const rec = new SpeechRecognitionClass();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onstart = () => {
      setIsListening(true);
      setVoiceStatus("Listening... Try 'skip song' or 'queue Hello'");
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onerror = (event: any) => {
      console.error("Speech Recognition Error", event);
      if (event.error === "not-allowed") {
        setVoiceStatus("Microphone access denied. Check browser permissions.");
      } else {
        setVoiceStatus(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    rec.onresult = async (event: any) => {
      const transcript = event.results[event.resultIndex][0].transcript.trim();
      setVoiceStatus(`Heard: "${transcript}"`);
      setVoiceLog((prev) => [{ text: transcript, isCommand: false }, ...prev.slice(0, 9)]);
      if (processVoiceCommandRef.current) {
        await processVoiceCommandRef.current(transcript);
      }
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  const triggerFloatingEmoji = (emoji: string, userName: string, soundName: string) => {
    const id = "emoji_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    const newEmoji: FloatingEmoji = {
      id,
      emoji,
      userName,
      soundName,
      x: Math.floor(Math.random() * 70) + 15,
    };
    setFloatingEmojis((prev) => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  };

  const sendSoundEffect = (soundId: string) => {
    if (!socketRef.current || !room) return;
    socketRef.current.send(
      JSON.stringify({
        type: "party-sound-effect",
        roomId: room.id,
        soundId,
        userName: nickname || "Singer"
      })
    );
  };

  // WebSocket Ref
  const socketRef = useRef<WebSocket | null>(null);
  const playerRef = useRef<any>(null);
  const guestPlayerRef = useRef<any>(null);
  const hostContainerRef = useRef<HTMLDivElement>(null);
  const guestContainerRef = useRef<HTMLDivElement>(null);
  const [isGuestStreamEnabled, setIsGuestStreamEnabled] = useState(true);
  const [isGuestStreamMuted, setIsGuestStreamMuted] = useState(true);

  // Camera & Video Call States
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<"off" | "on" | "error">("off");
  const [isCameraMuted, setIsCameraMuted] = useState(false);
  const [cameraDisabledNotification, setCameraDisabledNotification] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [remoteFrames, setRemoteFrames] = useState<Record<string, string>>({});

  // Capture local stream frame and send to remote peers
  useEffect(() => {
    if (!localStream || !room) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 120;
    const ctx = canvas.getContext("2d");

    const sendFrame = () => {
      if (!localVideoRef.current || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
      if (localVideoRef.current.readyState >= 1 || localVideoRef.current.videoWidth > 0) {
        try {
          ctx?.drawImage(localVideoRef.current, 0, 0, 160, 120);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.35); // highly compressed to fit comfortably in WebSocket payloads
          socketRef.current.send(
            JSON.stringify({
              type: "party-camera-frame",
              roomId: room.id,
              userId,
              frame: dataUrl
            })
          );
        } catch (e) {
          console.error("Error drawing/sending camera frame:", e);
        }
      }
    };

    // Send immediately and then every 300ms
    sendFrame();
    const intervalId = setInterval(sendFrame, 300);

    return () => {
      clearInterval(intervalId);
    };
  }, [localStream, room?.id, userId]);

  // Clean up remote frames for members who turned off their camera
  useEffect(() => {
    if (room?.members) {
      setRemoteFrames((prev) => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach((key) => {
          const m = room.members.find((member) => member.id === key);
          if (!m || !m.cameraOn) {
            delete next[key];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [room?.members]);

  // Monitor Host Disabling User's Camera
  useEffect(() => {
    if (room && userId) {
      const me = room.members.find(m => m.id === userId);
      if (me && me.cameraForceDisabledByHost && localStream) {
        // Stop all tracks of localStream
        try {
          localStream.getTracks().forEach((track) => track.stop());
        } catch (e) {}
        setLocalStream(null);
        setCameraState("off");
        
        // Notify user elegantly
        setCameraDisabledNotification("The host has disabled your camera stream.");
        setTimeout(() => setCameraDisabledNotification(null), 5000);

        // Notify server that our camera is now disabled
        socketRef.current?.send(
          JSON.stringify({
            type: "party-toggle-camera",
            roomId: room.id,
            userId,
            enabled: false,
            isMuted: true
          })
        );
      }
    }
  }, [room?.members, userId, localStream]);

  // Handle local video element source binding when localStream is active
  useEffect(() => {
    if (localVideoRef.current) {
      if (localStream) {
        localVideoRef.current.srcObject = localStream;
      } else {
        localVideoRef.current.srcObject = null;
      }
    }
  }, [localStream, cameraState]);

  const toggleLocalCamera = async () => {
    if (!room) return;

    // Check if the host has blocked our camera
    const me = room.members.find(m => m.id === userId);
    if (me?.cameraForceDisabledByHost) {
      setCameraDisabledNotification("The host has disabled your camera. You cannot turn it on.");
      setTimeout(() => setCameraDisabledNotification(null), 4000);
      return;
    }

    if (localStream) {
      // Turn Off
      try {
        localStream.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      setLocalStream(null);
      setCameraState("off");

      socketRef.current?.send(
        JSON.stringify({
          type: "party-toggle-camera",
          roomId: room.id,
          userId,
          enabled: false,
          isMuted: true
        })
      );
    } else {
      // Turn On
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: "user" },
          audio: false // Set to false to avoid echo feedback, or change if desired
        });
        setLocalStream(stream);
        setCameraState("on");

        socketRef.current?.send(
          JSON.stringify({
            type: "party-toggle-camera",
            roomId: room.id,
            userId,
            enabled: true,
            isMuted: isCameraMuted
          })
        );
      } catch (err) {
        console.error("Failed to access camera:", err);
        setCameraState("error");
        // Fallback: simulate camera on server so we can participate in the call!
        socketRef.current?.send(
          JSON.stringify({
            type: "party-toggle-camera",
            roomId: room.id,
            userId,
            enabled: true,
            isMuted: isCameraMuted
          })
        );
      }
    }
  };

  const hostDisableGuestCamera = (targetUserId: string) => {
    if (!room || !socketRef.current) return;
    socketRef.current.send(
      JSON.stringify({
        type: "party-force-disable-camera",
        roomId: room.id,
        targetUserId
      })
    );
  };

  // Parse direct join from URL parameter e.g. /?room=ABCDE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room") || params.get("join");
    if (roomParam && roomParam.length === 5) {
      setRoomIdInput(roomParam.toUpperCase());
    }
  }, []);

  // Auto-restore room session on refresh
  useEffect(() => {
    const savedRoomCode = localStorage.getItem("singroom_active_room_code");
    const savedNickname = localStorage.getItem("singroom_nickname") || nickname;
    const savedIsHost = localStorage.getItem("singroom_is_host_role") === "true";

    if (savedRoomCode && savedNickname && savedRoomCode.length === 5) {
      console.log(`[AutoRestore] Attempting to rejoin room ${savedRoomCode} as nickname ${savedNickname}`);
      
      const restoreRoom = async () => {
        try {
          const response = await fetch("/api/party-rooms/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: savedRoomCode.toUpperCase().trim(),
              name: savedNickname.trim()
            })
          });

          const data = await response.json();
          if (response.ok) {
            setIsHostRole(savedIsHost);
            setRoom(data);
            console.log(`[AutoRestore] Rejoined room successfully:`, data);
          } else {
            console.warn("[AutoRestore] Room no longer active on server. Clearing saved session.");
            localStorage.removeItem("singroom_active_room_code");
            localStorage.removeItem("singroom_is_host_role");
          }
        } catch (err) {
          console.error("[AutoRestore] Error auto-rejoining room:", err);
        }
      };

      restoreRoom();
    }
  }, []);

  // Save nickname to localStorage on change
  useEffect(() => {
    if (nickname.trim()) {
      localStorage.setItem("singroom_nickname", nickname.trim());
    }
  }, [nickname]);

  // Connect to WebSocket on Room Join
  useEffect(() => {
    if (!room) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}`;
    console.log(`[SingRoom WS] Connecting to ${wsUrl}`);

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("[SingRoom WS] Connected!");
      // Send join message
      ws.send(
        JSON.stringify({
          type: "party-join",
          roomId: room.id,
          name: nickname || "Singer",
          isHost: isHostRole,
          userId
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "party-updated" && data.room) {
          setRoom(data.room);
        } else if (data.type === "party-playback-updated") {
          const { action, value } = data;
          handleRemotePlayerAction(action, value);
        } else if (data.type === "party-time-sync") {
          const { time } = data;
          const isCurrentUserHost = roomRef.current?.hostId === userId || isHostRole;
          if (!isCurrentUserHost && guestPlayerRef.current) {
            try {
              // Self-healing play/pause check
              if (typeof guestPlayerRef.current.getPlayerState === "function") {
                const guestState = guestPlayerRef.current.getPlayerState();
                if (roomRef.current?.isPlaying && guestState !== 1 && guestState !== 3) {
                  guestPlayerRef.current.playVideo();
                } else if (!roomRef.current?.isPlaying && guestState === 1) {
                  guestPlayerRef.current.pauseVideo();
                }
              }

              // Drastic-free low-latency sync alignment
              if (typeof guestPlayerRef.current.getCurrentTime === "function") {
                const guestTime = guestPlayerRef.current.getCurrentTime();
                if (guestTime !== undefined && Math.abs(guestTime - time) > 1.0) {
                  guestPlayerRef.current.seekTo(time, true);
                }
              }
            } catch (e) {
              console.error("Error aligning guest player:", e);
            }
          }
        } else if (data.type === "party-sound-effect") {
          const { soundId, userName } = data;
          const effect = SOUND_EFFECTS.find((s) => s.id === soundId);
          if (effect) {
            // Play audio locally on Host screen (which is the TV with speakers)
            const isCurrentUserHost = room?.hostId === userId || isHostRole;
            if (isCurrentUserHost) {
              playSoundEffect(soundId);
            }
            // Trigger floating emoji animation on Host screen
            triggerFloatingEmoji(effect.emoji, userName, effect.name);
          }
        } else if (data.type === "chat-message" && data.message) {
          setChatMessages((prev) => [...prev, data.message].slice(-150));
          
          if (activeMobileTabRef.current !== "chat") {
            setHasNewChat(true);
          }
          
          // Trigger floating emojis for emoji-only or emoji-rich short messages on Host screen
          const text = data.message.text || "";
          const isCurrentUserHost = roomRef.current?.hostId === userId || isHostRole;
          if (isCurrentUserHost && text.trim().length <= 6 && /\p{Extended_Pictographic}/u.test(text)) {
            triggerFloatingEmoji(text.trim(), data.message.sender, "Chat Reaction");
          }
        } else if (data.type === "party-camera-frame") {
          const { userId: senderUserId, frame } = data;
          setRemoteFrames((prev) => ({ ...prev, [senderUserId]: frame }));
        } else if (data.type === "party-disbanded") {
          setErrorMsg("The Host has ended the party and closed this SingRoom.");
          setRoom(null);
          localStorage.removeItem("singroom_active_room_code");
          localStorage.removeItem("singroom_is_host_role");
        }
      } catch (err) {
        console.error("[SingRoom WS Error] parsing message:", err);
      }
    };

    ws.onclose = () => {
      console.log("[SingRoom WS] Connection closed.");
      // Attempt reconnect if still in room
      setTimeout(() => {
        if (socketRef.current?.readyState === WebSocket.CLOSED) {
          // Re-trigger effect or reconnect
          console.log("[SingRoom WS] Reconnecting...");
        }
      }, 3000);
    };

    return () => {
      ws.close();
      socketRef.current = null;
    };
  }, [room?.id]);

  // Remote action listener for YouTube Player
  const handleRemotePlayerAction = (action: string, value: any) => {
    try {
      if (playerRef.current) {
        if (action === "play") {
          playerRef.current.playVideo();
        } else if (action === "pause") {
          playerRef.current.pauseVideo();
        }
      }
      if (guestPlayerRef.current) {
        if (action === "play") {
          guestPlayerRef.current.playVideo();
        } else if (action === "pause") {
          guestPlayerRef.current.pauseVideo();
        }
      }
    } catch (e) {
      console.error("Error manipulating remote player:", e);
    }
  };

  // YouTube IFrame API Lazy Setup & Loop
  useEffect(() => {
    if (!room) return;
    const isCurrentUserHost = room.hostId === userId || isHostRole;
    if (!isCurrentUserHost) {
      // Spectators or guests do not render the active iframe player
      if (playerRef.current) {
        playerRef.current = null;
      }
      return;
    }

    if (!room.activeSong) {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }
      return;
    }

    const loadYoutubeAPI = (callback: () => void) => {
      if ((window as any).YT && (window as any).YT.Player) {
        callback();
        return;
      }

      if (!(window as any).onYouTubeIframeAPIReady) {
        (window as any).onYouTubeIframeAPIReady = () => {
          callback();
        };
      } else {
        const existing = (window as any).onYouTubeIframeAPIReady;
        (window as any).onYouTubeIframeAPIReady = () => {
          existing();
          callback();
        };
      }

      // Check if tag already exists
      if (!document.getElementById("yt-iframe-api-script")) {
        const tag = document.createElement("script");
        tag.id = "yt-iframe-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
    };

    loadYoutubeAPI(() => {
      // Reuse existing player if available to prevent browser autoplay blocks
      if (playerRef.current && typeof playerRef.current.loadVideoById === "function") {
        try {
          playerRef.current.loadVideoById({
            videoId: room.activeSong?.videoId,
            startSeconds: 0
          });
          if (room.isPlaying) {
            playerRef.current.playVideo();
          } else {
            playerRef.current.pauseVideo();
          }
          return;
        } catch (e) {
          console.error("Error loading video in existing host player:", e);
        }
      }

      // Recreate the target div in the container to bypass YouTube API bugs if creating player from scratch
      if (hostContainerRef.current) {
        hostContainerRef.current.innerHTML = '<div id="youtube-player-host" class="w-full h-full"></div>';
      }

      // Create new player
      playerRef.current = new (window as any).YT.Player("youtube-player-host", {
        height: "100%",
        width: "100%",
        videoId: room.activeSong?.videoId,
        playerVars: {
          autoplay: room.isPlaying ? 1 : 0,
          controls: 1,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: (event: any) => {
            if (room.isPlaying) {
              event.target.playVideo();
            } else {
              event.target.pauseVideo();
            }
          },
          onStateChange: (event: any) => {
            // Video ended (state code 0)
            if (event.data === 0) {
              console.log("[YT Player] Video ended, advancing queue...");
              playbackControl("next");
            } else if (event.data === 1 || event.data === 2) {
              // Immediately send a time sync when play/pause occurs to align all guests instantly
              try {
                if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
                  const time = playerRef.current.getCurrentTime();
                  if (time !== undefined && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                    socketRef.current.send(
                      JSON.stringify({
                        type: "party-time-sync",
                        roomId: room?.id,
                        time
                      })
                    );
                  }
                }
              } catch (e) {
                console.error("Error sending instant time sync on state change:", e);
              }
            }
          }
        }
      });
    });
  }, [room?.activeSong?.videoId, room?.hostId]);

  // Sync isPlaying state to YouTube IFrame
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.getPlayerState === "function") {
      try {
        const state = playerRef.current.getPlayerState();
        if (room?.isPlaying && state !== 1) {
          playerRef.current.playVideo();
        } else if (!room?.isPlaying && state === 1) {
          playerRef.current.pauseVideo();
        }
      } catch (e) {}
    }
  }, [room?.isPlaying]);

  // Host periodic playback progress broadcaster
  useEffect(() => {
    if (!room) return;
    const isCurrentUserHost = room.hostId === userId || isHostRole;
    if (!isCurrentUserHost) return;

    const intervalId = setInterval(() => {
      try {
        if (roomRef.current?.isPlaying && playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
          const time = playerRef.current.getCurrentTime();
          if (time !== undefined && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(
              JSON.stringify({
                type: "party-time-sync",
                roomId: roomRef.current.id,
                time
              })
            );
          }
        }
      } catch (e) {
        console.error("Error broadcasting time sync:", e);
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [room?.id, isHostRole]);

  // YouTube Player for Guests (Streaming active song screen in sync with the room)
  useEffect(() => {
    if (!room) return;
    const isCurrentUserHost = room.hostId === userId || isHostRole;
    if (isCurrentUserHost) {
      if (guestPlayerRef.current) {
        try {
          guestPlayerRef.current.destroy();
        } catch (e) {}
        guestPlayerRef.current = null;
      }
      return;
    }

    if (!isGuestStreamEnabled || !room.activeSong) {
      if (guestPlayerRef.current) {
        try {
          guestPlayerRef.current.destroy();
        } catch (e) {}
        guestPlayerRef.current = null;
      }
      return;
    }

    const loadYoutubeAPI = (callback: () => void) => {
      if ((window as any).YT && (window as any).YT.Player) {
        callback();
        return;
      }

      if (!(window as any).onYouTubeIframeAPIReady) {
        (window as any).onYouTubeIframeAPIReady = () => {
          callback();
        };
      } else {
        const existing = (window as any).onYouTubeIframeAPIReady;
        (window as any).onYouTubeIframeAPIReady = () => {
          existing();
          callback();
        };
      }

      if (!document.getElementById("yt-iframe-api-script")) {
        const tag = document.createElement("script");
        tag.id = "yt-iframe-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
    };

    loadYoutubeAPI(() => {
      // Reuse existing player if available to prevent browser autoplay blocks
      if (guestPlayerRef.current && typeof guestPlayerRef.current.loadVideoById === "function") {
        try {
          guestPlayerRef.current.loadVideoById({
            videoId: room.activeSong?.videoId,
            startSeconds: 0
          });
          
          if (isGuestStreamMuted) {
            guestPlayerRef.current.mute();
          } else {
            guestPlayerRef.current.unMute();
          }

          if (room.isPlaying) {
            guestPlayerRef.current.playVideo();
          } else {
            guestPlayerRef.current.pauseVideo();
          }
          return;
        } catch (e) {
          console.error("Error loading video in existing guest player:", e);
        }
      }

      // Recreate the target div in the container to bypass YouTube API iframe substitution bugs if creating player from scratch
      if (guestContainerRef.current) {
        guestContainerRef.current.innerHTML = '<div id="youtube-player-guest" class="w-full h-full"></div>';
      }

      // Create new guest player
      try {
        guestPlayerRef.current = new (window as any).YT.Player("youtube-player-guest", {
          height: "100%",
          width: "100%",
          videoId: room.activeSong?.videoId,
          playerVars: {
            autoplay: room.isPlaying ? 1 : 0,
            controls: 0, // Guest player doesn't have controls to prevent local tampering
            modestbranding: 1,
            rel: 0,
            disablekb: 1,
            fs: 0
          },
          events: {
            onReady: (event: any) => {
              if (isGuestStreamMuted) {
                event.target.mute();
              } else {
                event.target.unMute();
              }

              if (room.isPlaying) {
                event.target.playVideo();
              } else {
                event.target.pauseVideo();
              }
            }
          }
        });
      } catch (err) {
        console.error("Error creating guest player:", err);
      }
    });
  }, [room?.activeSong?.videoId, room?.hostId, isGuestStreamEnabled]);

  // Sync isPlaying state to Guest YouTube Player
  useEffect(() => {
    const isCurrentUserHost = room ? room.hostId === userId || isHostRole : false;
    if (isCurrentUserHost) return;

    if (guestPlayerRef.current && typeof guestPlayerRef.current.getPlayerState === "function") {
      try {
        const state = guestPlayerRef.current.getPlayerState();
        if (room?.isPlaying && state !== 1) {
          guestPlayerRef.current.playVideo();
        } else if (!room?.isPlaying && state === 1) {
          guestPlayerRef.current.pauseVideo();
        }
      } catch (e) {}
    }
  }, [room?.isPlaying]);

  // Sync mute state to Guest YouTube Player
  useEffect(() => {
    if (guestPlayerRef.current) {
      try {
        if (isGuestStreamMuted) {
          if (typeof guestPlayerRef.current.mute === "function") {
            guestPlayerRef.current.mute();
          }
        } else {
          if (typeof guestPlayerRef.current.unMute === "function") {
            guestPlayerRef.current.unMute();
          }
        }
      } catch (e) {}
    }
  }, [isGuestStreamMuted]);

  // API Call: Create Room
  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!roomNameInput.trim() || !nickname.trim()) {
      setErrorMsg("Please enter both a room name and your nickname!");
      return;
    }

    try {
      const response = await fetch("/api/party-rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roomNameInput.trim(),
          hostName: nickname.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create room.");
      }

      setIsHostRole(true);
      setRoom(data);
      localStorage.setItem("singroom_active_room_code", data.id);
      localStorage.setItem("singroom_is_host_role", "true");
      setSuccessMsg(`Welcome, Host! Room "${data.name}" was successfully launched.`);
    } catch (err: any) {
      setErrorMsg(err.message || "Could not spin up a new room.");
    }
  };

  // API Call: Join Room
  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!roomIdInput.trim() || !nickname.trim()) {
      setErrorMsg("Please enter the 5-character room code and your nickname!");
      return;
    }

    try {
      const response = await fetch("/api/party-rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: roomIdInput.toUpperCase().trim(),
          name: nickname.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Room not found.");
      }

      setIsHostRole(false);
      setRoom(data);
      localStorage.setItem("singroom_active_room_code", data.id);
      localStorage.setItem("singroom_is_host_role", "false");
      setSuccessMsg(`Joined room "${data.name}" successfully!`);
      setIsQrJoin(false);
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error("Failed to clean up URL search parameters:", e);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to join room. Verify code is active.");
    }
  };

  // Exit/Leave current room
  const leaveRoom = async () => {
    const activeCode = room?.id || localStorage.getItem("singroom_active_room_code");
    if (activeCode) {
      try {
        await fetch("/api/party-rooms/leave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: activeCode,
            userId: userId
          })
        });
      } catch (err) {
        console.error("Failed to notify leave room API:", err);
      }
    }

    if (socketRef.current) {
      socketRef.current.close();
    }
    setRoom(null);
    setSearchResults([]);
    setSearchQuery("");
    setErrorMsg("");
    setSuccessMsg("");
    setIsHostRole(false);
    localStorage.removeItem("singroom_active_room_code");
    localStorage.removeItem("singroom_is_host_role");
  };

  // API Call: YouTube Search
  const searchSongs = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setErrorMsg("");
    setIsSearching(true);
    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to complete YouTube search.");
      }
      setSearchResults(data);
    } catch (err: any) {
      setErrorMsg(err.message || "YouTube search failed.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = async (suggestion: string) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);

    setErrorMsg("");
    setIsSearching(true);
    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(suggestion.trim())}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to complete YouTube search.");
      }
      setSearchResults(data);
    } catch (err: any) {
      setErrorMsg(err.message || "YouTube search failed.");
    } finally {
      setIsSearching(false);
    }
  };

  // WS send helper for Add Song
  const addSongToQueue = (song: any) => {
    if (!socketRef.current || !room) return;

    socketRef.current.send(
      JSON.stringify({
        type: "party-add-song",
        roomId: room.id,
        song: {
          videoId: song.videoId,
          title: song.title,
          thumbnail: song.thumbnail,
          channelTitle: song.channelTitle
        },
        queuedBy: nickname || "Singer"
      })
    );

    // Flash small indicator & clear search results to look responsive
    setSuccessMsg(`"${song.title}" queued!`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // WS send helper for Remove Song
  const removeSong = (itemId: string) => {
    if (!socketRef.current || !room) return;
    socketRef.current.send(
      JSON.stringify({
        type: "party-remove-song",
        roomId: room.id,
        itemId
      })
    );
  };

  // WS send helper for Reordering Queue (shifting index)
  const shiftQueueItem = (index: number, direction: "up" | "down") => {
    if (!socketRef.current || !room) return;
    const newQueue = [...room.queue];
    const targetIdx = direction === "up" ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= newQueue.length) return;

    // Swap elements
    const temp = newQueue[index];
    newQueue[index] = newQueue[targetIdx];
    newQueue[targetIdx] = temp;

    socketRef.current.send(
      JSON.stringify({
        type: "party-reorder-queue",
        roomId: room.id,
        queue: newQueue
      })
    );
  };

  // WS send helper for Playback controls
  const playbackControl = (action: "play" | "pause" | "next" | "prev") => {
    if (!socketRef.current || !room) return;
    socketRef.current.send(
      JSON.stringify({
        type: "party-playback-control",
        roomId: room.id,
        action
      })
    );
  };

  const copyRoomLink = () => {
    const url = `${window.location.origin}/?room=${room?.id}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const renderLoungeVideoCall = () => {
    if (!room) return null;

    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        {/* Header bar of the Video Call Lounge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Video className="w-4.5 h-4.5" />
              </div>
              {room.members.some(m => m.cameraOn) && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Lounge Video Call</span>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">
                  {room.members.filter(m => m.cameraOn).length} On Cam
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 leading-none mt-0.5">
                Real-time video hangouts inside the SingRoom
              </p>
            </div>
          </div>

          {/* Local Action controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLocalCamera}
              disabled={room.members.find(m => m.id === userId)?.cameraForceDisabledByHost}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                room.members.find(m => m.id === userId)?.cameraForceDisabledByHost
                  ? "bg-slate-850 text-slate-600 border border-slate-800/80 cursor-not-allowed"
                  : localStream
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
                  : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20"
              }`}
              title={
                room.members.find(m => m.id === userId)?.cameraForceDisabledByHost
                  ? "Disabled by Host"
                  : localStream
                  ? "Stop Camera"
                  : "Start Camera"
              }
            >
              {localStream ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
              <span>{localStream ? "Stop Camera" : "Start Camera"}</span>
            </button>
          </div>
        </div>

        {/* Floating Warning for disabled camera */}
        {cameraDisabledNotification && (
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 animate-pulse">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{cameraDisabledNotification}</span>
          </div>
        )}

        {/* Video Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {room.members.map((member) => {
            const isMe = member.id === userId;
            const isHostUser = member.id === room.hostId || member.isHost;
            const hasCam = member.cameraOn;
            const isForceDisabled = member.cameraForceDisabledByHost;

            return (
              <div
                key={member.id + "-videocall"}
                className={`relative rounded-xl border aspect-video overflow-hidden transition-all group flex flex-col justify-between ${
                  hasCam 
                    ? "bg-slate-950 border-cyan-500/40 shadow-lg shadow-cyan-950/20" 
                    : "bg-slate-950 border-slate-800/80 hover:border-slate-700/60"
                }`}
              >
                {/* Video Area */}
                <div className="absolute inset-0 z-0">
                  {hasCam ? (
                    isMe ? (
                      /* Real live webcam for current user */
                      <video
                        ref={(el) => {
                          localVideoRef.current = el;
                          if (el && localStream) {
                            el.srcObject = localStream;
                          }
                        }}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    ) : remoteFrames[member.id] ? (
                      /* Real live stream from the remote user! */
                      <img
                        src={remoteFrames[member.id]}
                        alt={`@${member.name}'s video`}
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    ) : (
                      /* Polished Live Simulated Streams for Remote Users with responsive visual feedback */
                      <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-slate-950 via-cyan-950/20 to-slate-950">
                        {/* High fidelity scanning grids */}
                        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
                        
                        {/* Active waveform pulsating feedback */}
                        <div className="flex items-center gap-1 mb-2">
                          <span className="w-1 h-4 bg-cyan-400/80 rounded animate-[pulse_1s_infinite_alternate]" />
                          <span className="w-1 h-6 bg-cyan-400 rounded animate-[pulse_0.7s_infinite_alternate]" style={{ animationDelay: '150ms' }} />
                          <span className="w-1 h-5 bg-cyan-400/90 rounded animate-[pulse_0.8s_infinite_alternate]" style={{ animationDelay: '300ms' }} />
                          <span className="w-1 h-3 bg-cyan-400/60 rounded animate-[pulse_1.2s_infinite_alternate]" style={{ animationDelay: '450ms' }} />
                        </div>

                        {/* Styled camera lens overlay */}
                        <div className="w-10 h-10 rounded-full border border-cyan-500/30 flex items-center justify-center relative animate-pulse">
                          <span className="w-3.5 h-3.5 rounded-full bg-cyan-400/20 border border-cyan-400/60 flex items-center justify-center">
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                          </span>
                        </div>
                        
                        {/* Status text overlay */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 text-[8px] font-mono uppercase bg-cyan-950/80 text-cyan-400 px-1 py-0.5 rounded border border-cyan-500/20 tracking-wider">
                          <span className="w-1 h-1 bg-cyan-400 rounded-full animate-ping" />
                          <span>CONNECTING</span>
                        </div>
                      </div>
                    )
                  ) : (
                    /* Camera is Off */
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 relative">
                      {isForceDisabled ? (
                        <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-1.5">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-1.5 font-bold font-mono text-xs uppercase">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      
                      <span className="text-[9px] text-slate-500 font-mono tracking-wide">
                        {isForceDisabled ? "Blocked by Host" : "Camera Off"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info and action ribbon overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-2 pt-5 z-10 flex items-center justify-between">
                  <div className="min-w-0 flex flex-col">
                    <span className="text-[11px] font-bold text-slate-200 truncate flex items-center gap-1">
                      {isMe ? "You" : `@${member.name}`}
                      {isHostUser && (
                        <span className="text-[8px] font-bold font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.2 rounded scale-90">
                          Host
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Remote management trigger for the Host! */}
                  {room.hostId === userId && !isMe && (
                    <button
                      onClick={() => hostDisableGuestCamera(member.id)}
                      disabled={isForceDisabled || !hasCam}
                      className={`p-1 rounded-md transition-all active:scale-95 cursor-pointer ${
                        isForceDisabled || !hasCam
                          ? "bg-slate-800/40 text-slate-600 border border-slate-900/40 cursor-not-allowed"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white"
                      }`}
                      title={isForceDisabled ? "Already Disabled" : "Turn Off Guest Camera"}
                    >
                      <VideoOff className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const isCurrentUserHost = room ? room.hostId === userId || isHostRole : false;

  return (
    <div id="singroom_ktv_root" className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* GLOWING AMBIENCE BACKDROP */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 select-none cursor-pointer" onClick={room ? leaveRoom : undefined}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent flex items-center gap-1.5 leading-none">
                My Karaoke
              </h1>
              <p className="text-[10px] text-cyan-400 font-mono tracking-widest mt-1 uppercase leading-none">
                Collaborative Karaoke Party
              </p>
            </div>
          </div>

          {room && (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-slate-400">Connected as</span>
                <span className="text-white font-bold">{nickname}</span>
                {isCurrentUserHost ? (
                  <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold">HOST</span>
                ) : (
                  <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[9px] font-bold">GUEST</span>
                )}
              </div>

              <button
                onClick={leaveRoom}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-rose-400 hover:text-rose-300 border border-slate-800 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave Room</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* FEEDBACK STATUS BAR */}
      {(errorMsg || successMsg) && (
        <div className="max-w-7xl w-full mx-auto px-6 mt-4">
          {errorMsg && (
            <div className="bg-rose-950/40 border border-rose-800/80 text-rose-200 px-4 py-3 rounded-xl text-xs flex items-center gap-2.5 shadow-lg animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="bg-cyan-950/40 border border-cyan-800/80 text-cyan-200 px-4 py-3 rounded-xl text-xs flex items-center gap-2.5 shadow-lg animate-fade-in">
              <Check className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col justify-center">
        
        {/* ==================== 1. LANDING PAGE (NOT IN ROOM) ==================== */}
        {!room ? (
          isQrJoin ? (
            <div className="max-w-md mx-auto w-full py-12 animate-fade-in">
              <div className="bg-slate-900/60 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
                {/* Glowing ambient background effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Scanned QR Code</span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight font-display">
                    You're Invited to Sing!
                  </h2>
                  <p className="text-xs text-slate-400">
                    Connecting to Lounge Room Code: <span className="font-mono font-black text-cyan-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 ml-1 select-all">{roomIdInput}</span>
                  </p>
                </div>

                {/* Error message */}
                {errorMsg && (
                  <div className="p-3 bg-red-950/45 border border-red-900/50 rounded-xl flex items-start gap-2 text-xs text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={joinRoom} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                      🎤 Pick Your Stage Nickname
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">@</span>
                      <input
                        type="text"
                        maxLength={15}
                        required
                        placeholder="e.g. Vocalist99"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value.replace(/\s+/g, ""))}
                        className="w-full pl-8 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-cyan-500 transition-all shadow-inner placeholder-slate-700"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Your tracks and soundboard triggers will show up under this name!
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-black font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/10 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Connect & Start Singing</span>
                    <Music className="w-4 h-4" />
                  </button>
                </form>

                <div className="text-center pt-2 border-t border-slate-850">
                  <button
                    onClick={() => {
                      setIsQrJoin(false);
                      setErrorMsg("");
                    }}
                    className="text-xs text-slate-400 hover:text-white transition-colors underline decoration-slate-600 underline-offset-4 cursor-pointer"
                  >
                    Or create a new room instead
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto w-full py-6">
              
              {/* Landing Copy Column */}
              <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full text-xs font-mono text-cyan-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Next-Gen Karaoke Lounge</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white font-display">
                  Bring the KTV Party to Your <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">Big Screen</span>
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto lg:mx-0">
                  My Karaoke lets you host karaoke on your TV or laptop. Guests can join instantly with their phones, search YouTube, and queue tracks dynamically. Perfect sync, zero fuss!
                </p>

                {/* Step Hints */}
                <div className="grid grid-cols-3 gap-4 pt-4 max-w-md mx-auto lg:mx-0 text-left">
                  <div className="space-y-1">
                    <span className="block font-mono text-xs font-bold text-cyan-400">01. Host</span>
                    <span className="block text-[11px] text-slate-500 leading-tight">Create a room on your big screen</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-mono text-xs font-bold text-indigo-400">02. QR Scan</span>
                    <span className="block text-[11px] text-slate-500 leading-tight">Guests scan with their phone</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-mono text-xs font-bold text-cyan-400">03. Sing</span>
                    <span className="block text-[11px] text-slate-500 leading-tight">Queue tracks and sing together</span>
                  </div>
                </div>
              </div>

              {/* Forms Column (Create / Join cards) */}
              <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                
                {/* NICKNAME BOX (Shared prerequisite) */}
                <div className="col-span-full bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                  <label className="block text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">
                    🎤 Pick Your Stage Nickname First
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">@</span>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="e.g. Vocalist99"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value.replace(/\s+/g, ""))}
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-cyan-500 transition-all shadow-inner placeholder-slate-600"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    This identifier will highlight your queued tracks on the big screen!
                  </p>
                </div>

                {/* CREATE ROOM CARD */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-indigo-500/40 transition-all">
                  <div className="space-y-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Plus className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Create a New Room</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Set up a central room. Designed to be opened on your TV or computer monitor.
                    </p>
                  </div>

                  <form onSubmit={createRoom} className="space-y-4 mt-6">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">Lounge/TV Room Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Living Room Party"
                        value={roomNameInput}
                        onChange={(e) => setRoomNameInput(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 font-bold text-xs text-white rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      Launch Room as Host
                    </button>
                  </form>
                </div>

                {/* JOIN ROOM CARD */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-cyan-500/40 transition-all">
                  <div className="space-y-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Join an Existing Room</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Sing along or queue songs! Enter a 5-digit code or scan a QR code from the TV.
                    </p>
                  </div>

                  <form onSubmit={joinRoom} className="space-y-4 mt-6">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">5-digit Room Code</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        placeholder="e.g. A9B8D"
                        value={roomIdInput}
                        onChange={(e) => setRoomIdInput(e.target.value.toUpperCase().trim())}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono font-bold text-cyan-400 placeholder-slate-700 uppercase tracking-widest focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 font-bold text-xs text-black rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      Connect as Guest
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )
        ) : (
          
          // ==================== 2. ROOM WORKSPACE (ACTIVE IN ROOM) ====================
          <div className="w-full">
            
            {/* CASE A: HOST / TV VIEW (OPTIMIZED FOR BIG SCREEN) */}
            {isCurrentUserHost ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Panel: YouTube Screen and Playback controls */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* YouTube Monitor Box */}
                  <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden aspect-video shadow-2xl relative flex flex-col justify-between">
                    
                    {room.activeSong ? (
                      /* Active song video placeholder for IFrame API */
                      <div ref={hostContainerRef} className="w-full h-full">
                        <div id="youtube-player-host" className="w-full h-full" />
                      </div>
                    ) : (
                      /* Idle Monitor */
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-gradient-to-b from-slate-950 to-slate-900/50">
                        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-500 animate-pulse">
                          <Music className="w-8 h-8 text-slate-600" />
                        </div>
                        <div className="space-y-1 max-w-sm">
                          <h4 className="text-base font-bold text-white">Lounge Screen Idle</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            No tracks are currently playing. Guests can search YouTube on their devices and add songs to sync immediately!
                          </p>
                        </div>
                        <div className="text-[10px] font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-500 mt-2">
                          Your Room Code is active and listening
                        </div>
                      </div>
                    )}

                    {/* FLOATING EMOJI CANVAS OVERLAY */}
                    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                      {floatingEmojis.map((item) => (
                        <div
                          key={item.id}
                          className="absolute bottom-0 flex flex-col items-center"
                          style={{
                            left: `${item.x}%`,
                            animation: "float-up 3.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards",
                          }}
                        >
                          <span className="text-4xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] select-none">
                            {item.emoji}
                          </span>
                          <span className="bg-slate-950/90 text-[9px] text-cyan-400 font-bold px-1.5 py-0.5 rounded-full border border-cyan-500/30 shadow-lg whitespace-nowrap mt-1 font-mono tracking-wide scale-90">
                            @{item.userName}
                          </span>
                        </div>
                      ))}
                    </div>

                    <style>{`
                      @keyframes float-up {
                        0% {
                          transform: translateY(10%) scale(0.6);
                          opacity: 0;
                        }
                        10% {
                          transform: translateY(-20px) scale(1.1);
                          opacity: 1;
                        }
                        85% {
                          opacity: 1;
                        }
                        100% {
                          transform: translateY(-340px) scale(0.85);
                          opacity: 0;
                        }
                      }
                    `}</style>

                    {/* NOW PLAYING STRIP */}
                    {room.activeSong && (
                      <div className="bg-slate-900/95 border-t border-slate-800 px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={room.activeSong.thumbnail}
                            alt="Now playing"
                            className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <span className="text-[9px] uppercase font-mono tracking-widest text-cyan-400 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                              Now Singing
                            </span>
                            <h4 className="text-sm font-extrabold text-white line-clamp-1 leading-snug mt-0.5">
                              {room.activeSong.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Queue added by <span className="text-slate-200 font-semibold">@{room.activeSong.queuedBy}</span>
                            </p>
                          </div>
                        </div>

                        {/* Player Playback Controls for Host */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => playbackControl(room.isPlaying ? "pause" : "play")}
                            className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                            title={room.isPlaying ? "Pause" : "Play"}
                          >
                            {room.isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                          </button>
                          <button
                            onClick={() => playbackControl("next")}
                            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/60 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                            title="Next Song"
                          >
                            <SkipForward className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* LOUNGE VIDEO CALL GRIID FOR ALL ACTIVE PARTICIPANTS */}
                  {renderLoungeVideoCall()}

                  {/* VOICE ENHANCER CARD FOR HOST */}
                  <VoiceEnhancerCard />

                  {/* HOST CONTROLS & INFO BOARD */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Share Invitation Card */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">Party Invite Link</span>
                        <h4 className="text-sm font-bold text-white">Copy or share room URL</h4>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                          Give others the link or let them join from any screen using code: <strong className="text-cyan-400 font-mono">{room.id}</strong>
                        </p>
                        <button
                          onClick={copyRoomLink}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-[11px] font-semibold transition-all active:scale-95 cursor-pointer"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
                          <span>{copiedCode ? "Copied!" : "Copy Joining Link"}</span>
                        </button>
                      </div>

                      <div className="bg-slate-950 p-2 border border-slate-800 rounded-xl shrink-0">
                        <QRCodeSVG
                          value={`${window.location.origin}/?room=${room.id}`}
                          size={110}
                          bgColor={"#090d16"}
                          fgColor={"#22d3ee"} // vibrant cyan
                          level={"H"}
                          includeMargin={true}
                        />
                      </div>
                    </div>

                    {/* Simple search helper for TV (also can add directly!) */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Tv className="w-4 h-4 text-cyan-400" />
                          <span>Lounge Screen Controller</span>
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Scan the QR code with your smartphone for a beautiful, hand-held mobile remote. Guests can use it to add tracks instantly!
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-2">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Active participants: {room.members.length}</span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Right Panel: Host Central Queue Sidebar */}
                <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300">
                        Upcoming Queue ({room.queue.length})
                      </h3>
                    </div>
                  </div>

                  {/* Queue playlist list */}
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {room.queue.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-500 font-mono space-y-2">
                        <p>The queue is currently empty.</p>
                        <p className="text-[10px] text-slate-600">Guests can add tracks using the search panel!</p>
                      </div>
                    ) : (
                      room.queue.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 bg-slate-950 border border-slate-800/80 p-2.5 rounded-xl hover:border-slate-700 transition-all group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-cyan-400 transition-colors">
                                {item.title}
                              </h4>
                              <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                                Added by @{item.queuedBy}
                              </p>
                            </div>
                          </div>

                          {/* Reordering & removal controls for Host */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => shiftQueueItem(index, "up")}
                              disabled={index === 0}
                              className={`p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors ${
                                index === 0 ? "opacity-20 cursor-not-allowed" : ""
                              }`}
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => shiftQueueItem(index, "down")}
                              disabled={index === room.queue.length - 1}
                              className={`p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors ${
                                index === room.queue.length - 1 ? "opacity-20 cursor-not-allowed" : ""
                              }`}
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => removeSong(item.id)}
                              className="p-1 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded transition-colors ml-1 cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* RECENTLY PLAYED SECTION */}
                  <div className="border-t border-slate-800 pt-4 mt-2 space-y-3">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300">
                        Recently Played ({room.history?.length || 0})
                      </h3>
                    </div>

                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {!room.history || room.history.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-500 font-mono">
                          <p>No songs played yet.</p>
                        </div>
                      ) : (
                        room.history.map((item, index) => (
                          <div
                            key={item.id + "-hist-" + index}
                            className="flex items-center justify-between gap-3 bg-slate-950/60 border border-slate-900 p-2 rounded-xl group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="w-8 h-8 rounded-lg object-cover border border-slate-800 shrink-0 opacity-75"
                              />
                              <div className="min-w-0">
                                <h4 className="text-[11px] font-bold text-slate-300 line-clamp-1">
                                  {item.title}
                                </h4>
                                <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                                  Sung by @{item.queuedBy}
                                </p>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono font-bold bg-slate-900 border border-slate-800/80 px-1.5 py-0.5 rounded text-emerald-500 shrink-0">
                              Done
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* QUICK SEARCH FOR HOST */}
                  <div className="border-t border-slate-800 pt-4 mt-2 space-y-2.5">
                    <h4 className="text-[11px] font-bold font-mono uppercase text-slate-400">Host Direct Search:</h4>
                    <form onSubmit={searchSongs} className="relative">
                      <input
                        type="text"
                        placeholder="Search songs directly..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => {
                          setTimeout(() => setShowSuggestions(false), 200);
                        }}
                        className="w-full pl-3 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder-slate-600 text-white focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        <Search className="w-4 h-4" />
                      </button>

                      {/* Auto-suggest suggestions list */}
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 max-h-[200px] overflow-y-auto divide-y divide-slate-900/60 animate-fade-in">
                          {suggestions.map((suggestion, idx) => (
                            <button
                              key={`host-suggest-${idx}`}
                              type="button"
                              onClick={() => handleSelectSuggestion(suggestion)}
                              className="w-full px-3 py-2 text-left text-[11px] text-slate-300 hover:text-cyan-400 hover:bg-slate-900 transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <Search className="w-3 h-3 text-slate-600 shrink-0" />
                              <span className="truncate">{suggestion}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </form>

                    {searchResults.length > 0 && (
                      <div className="bg-slate-950 border border-slate-800 rounded-xl max-h-[220px] overflow-y-auto p-1.5 space-y-1 animate-fade-in shadow-inner">
                        {searchResults.map((song) => (
                          <div
                            key={song.videoId}
                            className="flex items-center justify-between gap-2 p-1.5 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                            onClick={() => addSongToQueue(song)}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={song.thumbnail}
                                alt={song.title}
                                className="w-8 h-8 rounded object-cover border border-slate-800 shrink-0"
                              />
                              <div className="min-w-0">
                                <h5 className="text-[10px] font-semibold text-white line-clamp-1 leading-normal">
                                  {song.title}
                                </h5>
                                <p className="text-[9px] text-slate-500 line-clamp-1">
                                  {song.channelTitle}
                                </p>
                              </div>
                            </div>
                            <span className="bg-indigo-600 hover:bg-indigo-500 text-white p-1 rounded shrink-0">
                              <Plus className="w-3 h-3" />
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* LIVE LOUNGE CHAT */}
                  <div className="border-t border-slate-800/80 pt-4 mt-2">
                    <LoungeChatBox
                      chatMessages={chatMessages}
                      chatInput={chatInput}
                      setChatInput={setChatInput}
                      sendChatMessage={sendChatMessage}
                      sendChatReaction={sendChatReaction}
                      nickname={nickname}
                    />
                  </div>

                </div>

              </div>
            ) : (
              
              // CASE B: GUEST / MOBILE VIEW (OPTIMIZED FOR BOTH HAND-HELD CONTROLLER AND DESKTOP GUESTS)
              <div className="max-w-md md:max-w-6xl mx-auto space-y-6">
                
                {/* Lobby Info Stripe */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                      <Smartphone className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wide">Connected Lounge</h3>
                      <h4 className="text-sm font-extrabold text-white leading-snug mt-0.5">{room.name}</h4>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-950 border border-slate-800 px-2 py-1 rounded text-cyan-400">
                    {room.id}
                  </span>
                </div>

                {/* LOUNGE VIDEO CALL FOR ALL ACTIVE PARTICIPANTS */}
                {renderLoungeVideoCall()}

                {/* 🖥️ LIVE ROOM STREAM CARD FOR GUESTS */}
                {room.activeSong ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-3">
                    {/* Header bar of the Stream */}
                    <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <h3 className="text-[11px] font-mono font-bold tracking-wider text-red-400 uppercase">
                          Lounge Screen Stream
                        </h3>
                      </div>
                      
                      {/* Controls for guest stream */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsGuestStreamMuted(!isGuestStreamMuted)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isGuestStreamMuted 
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20" 
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                          }`}
                          title={isGuestStreamMuted ? "Unmute Stream Audio" : "Mute Stream Audio"}
                        >
                          {isGuestStreamMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          <span>{isGuestStreamMuted ? "Muted" : "Audio On"}</span>
                        </button>

                        <button
                          onClick={() => setIsGuestStreamEnabled(!isGuestStreamEnabled)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Tv className="w-3.5 h-3.5" />
                          <span>{isGuestStreamEnabled ? "Hide Video" : "Show Video"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Stream display section */}
                    <div className="p-4 pt-1 space-y-3">
                      {isGuestStreamEnabled ? (
                        <div className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden aspect-video relative">
                          <div ref={guestContainerRef} className="w-full h-full">
                            <div id="youtube-player-guest" className="w-full h-full" />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-950/45 border border-slate-850 rounded-2xl p-4 flex items-center gap-3.5">
                          <img
                            src={room.activeSong.thumbnail}
                            alt="Now playing"
                            className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="inline-block text-[9px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/10 px-2 py-0.5 rounded font-bold">
                              Now Singing
                            </span>
                            <h4 className="text-xs font-bold text-slate-400 line-clamp-1 mt-1 leading-snug">
                              {room.activeSong.title}
                            </h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Added by <span className="text-slate-400 font-semibold">@{room.activeSong.queuedBy}</span>
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Guest Playback Control Bar */}
                      <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                            <Music className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-200 line-clamp-1">
                              {room.activeSong.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Queued by <span className="text-cyan-400 font-semibold">@{room.activeSong.queuedBy}</span>
                            </p>
                          </div>
                        </div>

                        {/* Control Buttons */}
                        {room.activeSong.queuedBy === nickname ? (
                          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                            <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/10">
                              Your Track
                            </span>
                            <button
                              onClick={() => playbackControl(room.isPlaying ? "pause" : "play")}
                              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-lg transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                              title={room.isPlaying ? "Pause Song" : "Play Song"}
                            >
                              {room.isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                              <span>{room.isPlaying ? "Pause" : "Play"}</span>
                            </button>
                            <button
                              onClick={() => playbackControl("next")}
                              className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-white text-xs font-bold rounded-lg border border-slate-750 transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                              title="Skip Song"
                            >
                              <SkipForward className="w-3.5 h-3.5" />
                              <span>Skip</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                            <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-950/80 px-2 py-1.5 rounded-lg border border-slate-850 flex items-center gap-1 w-full sm:w-auto justify-center">
                              <Lock className="w-3.5 h-3.5 text-slate-600" />
                              <span>Only @{room.activeSong.queuedBy} can control this track</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info and helper disclaimer below the video player */}
                      <div className="flex items-center justify-between bg-slate-950/50 rounded-xl px-3 py-2 border border-slate-850 text-[10px] text-slate-400 font-mono">
                        <span className="truncate max-w-[70%]">
                          🎵 {room.activeSong.title}
                        </span>
                        <span className="shrink-0 text-slate-500">
                          {isGuestStreamMuted ? "🔇 Audio muted (no echo)" : "🔊 Audio active"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/35 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center text-xs text-slate-500 font-mono gap-2">
                    <Music className="w-6 h-6 text-slate-700 animate-pulse" />
                    <span className="font-semibold text-slate-400">Lounge Screen Idle</span>
                    <span className="text-[10px] text-slate-600">No tracks are currently playing. Search and queue a song below!</span>
                  </div>
                )}

                {/* 1. MOBILE DEVICE TAB LAYOUT (Visible on mobile/small screens, hidden on md+) */}
                <div className="block md:hidden space-y-6">
                  {/* Tab layout selector */}
                  <div className="grid grid-cols-5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setActiveMobileTab("search")}
                      className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        activeMobileTab === "search" ? "bg-cyan-500 text-black shadow" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Search</span>
                    </button>
                    <button
                      onClick={() => setActiveMobileTab("queue")}
                      className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        activeMobileTab === "queue" ? "bg-cyan-500 text-black shadow" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Queue</span>
                    </button>
                    <button
                      onClick={() => setActiveMobileTab("enhancer")}
                      className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        activeMobileTab === "enhancer" ? "bg-cyan-500 text-black shadow" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Voice</span>
                    </button>
                    <button
                      onClick={() => setActiveMobileTab("history")}
                      className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        activeMobileTab === "history" ? "bg-cyan-500 text-black shadow" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">History</span>
                    </button>
                    <button
                      onClick={() => setActiveMobileTab("chat")}
                      className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer relative ${
                        activeMobileTab === "chat" ? "bg-cyan-500 text-black shadow" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="relative">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {hasNewChat && (
                          <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                          </span>
                        )}
                      </div>
                      <span>Chat</span>
                    </button>
                  </div>

                  {/* TAB B1: SEARCH VIEW */}
                  {activeMobileTab === "search" && (
                    <div className="space-y-4 animate-fade-in">
                      <form onSubmit={searchSongs} className="flex gap-2 relative">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Search YouTube track (e.g. Queen)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => {
                              setTimeout(() => setShowSuggestions(false), 200);
                            }}
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-cyan-500 text-white placeholder-slate-600"
                          />

                          {/* Auto-suggest suggestions list */}
                          {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 max-h-[220px] overflow-y-auto divide-y divide-slate-900/60 animate-fade-in">
                              {suggestions.map((suggestion, idx) => (
                                <button
                                  key={`guest-suggest-mob-${idx}`}
                                  type="button"
                                  onClick={() => handleSelectSuggestion(suggestion)}
                                  className="w-full px-4 py-2.5 text-left text-xs text-slate-300 hover:text-cyan-400 hover:bg-slate-900 transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                  <Search className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                                  <span className="truncate">{suggestion}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          type="submit"
                          className="px-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer shrink-0"
                        >
                          <Search className="w-3.5 h-3.5" />
                          <span>Search</span>
                        </button>
                      </form>

                      {isSearching && (
                        <div className="py-12 text-center text-xs text-slate-500 font-mono flex flex-col items-center gap-2">
                          <span className="w-5 h-5 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
                          <span>Retrieving high-fidelity YouTube search results...</span>
                        </div>
                      )}

                      {!isSearching && searchResults.length > 0 && (
                        <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                          {searchResults.map((song) => (
                            <div
                              key={song.videoId}
                              className="flex items-center justify-between gap-3 bg-slate-900 border border-slate-800/80 p-2.5 rounded-2xl hover:border-slate-700 transition-all group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={song.thumbnail}
                                  alt={song.title}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                                />
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                                    {song.title}
                                  </h4>
                                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                    {song.channelTitle}
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => addSongToQueue(song)}
                                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg transition-all shrink-0 cursor-pointer"
                              >
                                Add to Queue
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {!isSearching && searchResults.length === 0 && (
                        <div className="py-12 text-center text-xs text-slate-600 bg-slate-900/10 border border-slate-900 rounded-2xl">
                          <Music className="w-8 h-8 text-slate-800 mx-auto mb-2 animate-pulse" />
                          <p>Search above to load real-time YouTube songs!</p>
                          <p className="text-[10px] text-slate-700 mt-1">"karaoke" will automatically append for optimal sing-along lyrics.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB B2: CURRENT QUEUE VIEW */}
                  {activeMobileTab === "queue" && (
                    <div className="space-y-4 animate-fade-in">
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-slate-400">
                        Upcoming Songs ({room.queue.length})
                      </h3>

                      <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                        {room.queue.length === 0 ? (
                          <div className="py-12 text-center text-xs text-slate-600 border border-slate-900 rounded-2xl">
                            <p>The queue is currently empty.</p>
                            <p className="text-[10px] text-slate-700 mt-1">Be the first to search and add a song!</p>
                          </div>
                        ) : (
                          room.queue.map((item, index) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-3 bg-slate-900 border border-slate-800/80 p-2.5 rounded-2xl"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={item.thumbnail}
                                  alt={item.title}
                                  className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0"
                                />
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-white line-clamp-1">
                                    {item.title}
                                  </h4>
                                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                    Queue Index: #{index + 1} • Added by @{item.queuedBy}
                                  </p>
                                </div>
                              </div>

                              {item.queuedBy === nickname && (
                                <button
                                  onClick={() => removeSong(item.id)}
                                  className="p-1 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                                  title="Remove My Song"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB B3: VOICE ENHANCER VIEW */}
                  {activeMobileTab === "enhancer" && (
                    <div className="space-y-4 animate-fade-in">
                      <VoiceEnhancerCard />
                    </div>
                  )}

                  {/* TAB B4: RECENTLY PLAYED VIEW */}
                  {activeMobileTab === "history" && (
                    <div className="space-y-4 animate-fade-in">
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-slate-400">
                        Recently Played Songs ({room.history?.length || 0})
                      </h3>

                      <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                        {!room.history || room.history.length === 0 ? (
                          <div className="py-12 text-center text-slate-600 border border-slate-900 rounded-2xl">
                            <p>No songs have finished playing yet.</p>
                            <p className="text-[10px] text-slate-700 mt-1">They will appear here once they are played or skipped!</p>
                          </div>
                        ) : (
                          room.history.map((item, index) => (
                            <div
                              key={item.id + "-mobile-hist-" + index}
                              className="flex items-center justify-between gap-3 bg-slate-900 border border-slate-800/80 p-2.5 rounded-2xl"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={item.thumbnail}
                                  alt={item.title}
                                  className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0 opacity-75"
                                />
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-slate-200 line-clamp-1">
                                    {item.title}
                                  </h4>
                                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                    Sung by @{item.queuedBy}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono font-bold bg-slate-950 border border-slate-800 px-2 py-1 rounded text-emerald-500 shrink-0">
                                Played
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB B5: LOUNGE LIVE CHAT VIEW */}
                  {activeMobileTab === "chat" && (
                    <div className="space-y-4 animate-fade-in">
                      <LoungeChatBox
                        chatMessages={chatMessages}
                        chatInput={chatInput}
                        setChatInput={setChatInput}
                        sendChatMessage={sendChatMessage}
                        sendChatReaction={sendChatReaction}
                        nickname={nickname}
                      />
                    </div>
                  )}
                </div>

                {/* 2. DESKTOP / TABLET DASHBOARD LAYOUT (Visible on md+ screens, hidden on mobile) */}
                <div className="hidden md:grid md:grid-cols-12 md:gap-6 items-start">
                  
                  {/* Left Column - Search and Upcoming Queue */}
                  <div className="md:col-span-7 space-y-6">
                    
                    {/* Search Panel Card */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                          <Search className="w-4 h-4 text-cyan-400" />
                          <span>Search YouTube Songs</span>
                        </h3>
                        <span className="text-[9px] font-mono font-bold bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-500">
                          REMOTE ADD
                        </span>
                      </div>

                      <form onSubmit={searchSongs} className="flex gap-2 relative">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Search YouTube track (e.g. Queen)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => {
                              setTimeout(() => setShowSuggestions(false), 200);
                            }}
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-cyan-500 text-white placeholder-slate-600"
                          />

                          {/* Auto-suggest suggestions list */}
                          {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 max-h-[220px] overflow-y-auto divide-y divide-slate-900/60 animate-fade-in">
                              {suggestions.map((suggestion, idx) => (
                                <button
                                  key={`guest-suggest-desk-${idx}`}
                                  type="button"
                                  onClick={() => handleSelectSuggestion(suggestion)}
                                  className="w-full px-4 py-2.5 text-left text-xs text-slate-300 hover:text-cyan-400 hover:bg-slate-900 transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                  <Search className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                                  <span className="truncate">{suggestion}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          type="submit"
                          className="px-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Search className="w-3.5 h-3.5" />
                          <span>Search</span>
                        </button>
                      </form>

                      {isSearching && (
                        <div className="py-12 text-center text-xs text-slate-500 font-mono flex flex-col items-center gap-2">
                          <span className="w-5 h-5 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
                          <span>Searching YouTube channels...</span>
                        </div>
                      )}

                      {!isSearching && searchResults.length > 0 && (
                        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                          {searchResults.map((song) => (
                            <div
                              key={`desk-song-${song.videoId}`}
                              className="flex items-center justify-between gap-3 bg-slate-950 border border-slate-850 p-2.5 rounded-2xl hover:border-slate-800 transition-all group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={song.thumbnail}
                                  alt={song.title}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-850 shrink-0"
                                />
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-cyan-400 transition-colors">
                                    {song.title}
                                  </h4>
                                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                    {song.channelTitle}
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => addSongToQueue(song)}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shrink-0 cursor-pointer"
                              >
                                Add to Queue
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {!isSearching && searchResults.length === 0 && (
                        <div className="py-12 text-center text-xs text-slate-600 bg-slate-950 border border-slate-900 rounded-2xl">
                          <Music className="w-8 h-8 text-slate-850 mx-auto mb-2" />
                          <p>Enter a song or artist name to load YouTube karaoke tracks!</p>
                        </div>
                      )}
                    </div>

                    {/* Upcoming Songs Queue Card */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-indigo-400" />
                          <span>Lounge Playlist Queue ({room.queue.length})</span>
                        </h3>
                        <span className="text-[9px] font-mono font-bold bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-500">
                          CO-SINGER LIST
                        </span>
                      </div>

                      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                        {room.queue.length === 0 ? (
                          <div className="py-12 text-center text-xs text-slate-500 font-mono border border-slate-900/40 rounded-2xl">
                            <p>No songs queued up currently.</p>
                            <p className="text-[10px] text-slate-600 mt-1">Be the first to search and add a track above!</p>
                          </div>
                        ) : (
                          room.queue.map((item, index) => (
                            <div
                              key={`desk-queue-${item.id}`}
                              className="flex items-center justify-between gap-3 bg-slate-950 border border-slate-850 p-2.5 rounded-2xl"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={item.thumbnail}
                                  alt={item.title}
                                  className="w-10 h-10 rounded-lg object-cover border border-slate-850 shrink-0"
                                />
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-white line-clamp-1">
                                    {item.title}
                                  </h4>
                                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                    Position: #{index + 1} • Added by @{item.queuedBy}
                                  </p>
                                </div>
                              </div>

                              {item.queuedBy === nickname && (
                                <button
                                  onClick={() => removeSong(item.id)}
                                  className="p-1.5 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                                  title="Remove My Song"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Right Column - Soundboard, Chat & Recently Played */}
                  <div className="md:col-span-5 space-y-6">
                    
                    {/* Live Lounge Chat Card */}
                    <LoungeChatBox
                      chatMessages={chatMessages}
                      chatInput={chatInput}
                      setChatInput={setChatInput}
                      sendChatMessage={sendChatMessage}
                      sendChatReaction={sendChatReaction}
                      nickname={nickname}
                    />

                    {/* VOICE ENHANCER CARD FOR GUEST */}
                    <VoiceEnhancerCard />

                    {/* Recently Played History Card */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                          <History className="w-4 h-4 text-emerald-400" />
                          <span>History of Sung Songs ({room.history?.length || 0})</span>
                        </h3>
                      </div>

                      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                        {!room.history || room.history.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-500 font-mono">
                            <p>No songs have completed yet.</p>
                          </div>
                        ) : (
                          room.history.map((item, index) => (
                            <div
                              key={`desk-hist-${item.id}-${index}`}
                              className="flex items-center justify-between gap-3 bg-slate-950 border border-slate-850 p-2.5 rounded-xl"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <img
                                  src={item.thumbnail}
                                  alt={item.title}
                                  className="w-8 h-8 rounded-lg object-cover border border-slate-850 shrink-0 opacity-75"
                                />
                                <div className="min-w-0">
                                  <h4 className="text-[11px] font-bold text-slate-300 line-clamp-1">
                                    {item.title}
                                  </h4>
                                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                                    Sung by @{item.queuedBy}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[9px] font-mono font-bold bg-slate-900 border border-slate-850/60 px-1.5 py-0.5 rounded text-emerald-500 shrink-0">
                                Played
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            )}

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-[10px] font-mono text-slate-600 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>My Karaoke © 2026. Powered by YouTube and real-time WebSockets synchronization.</span>
          <span>To configure custom endpoints or YouTube keys, edit `.env` or configuration files.</span>
        </div>
      </footer>

    </div>
  );
}

export function VoiceControlCard({
  isListening,
  voiceStatus,
  isTtsEnabled,
  setIsTtsEnabled,
  toggleListening,
  voiceLog,
  className = ""
}: {
  isListening: boolean;
  voiceStatus: string;
  isTtsEnabled: boolean;
  setIsTtsEnabled: (val: boolean) => void;
  toggleListening: () => void;
  voiceLog: { text: string; isCommand: boolean }[];
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`bg-slate-900/40 border ${isListening ? "border-cyan-500/40" : "border-slate-800"} rounded-3xl p-5 shadow-lg space-y-4 transition-all ${className}`}>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 cursor-pointer group text-left flex-1"
        >
          <div className={`w-8 h-8 rounded-lg ${isListening ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-950 text-slate-400"} flex items-center justify-center transition-all group-hover:scale-105`}>
            {isListening ? (
              <Mic className="w-4.5 h-4.5 animate-pulse" />
            ) : (
              <Mic className="w-4.5 h-4.5" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
              <span>Voice Control Assistant</span>
              {isListening && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
              )}
            </h4>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              Trigger skip, pause, play, or search songs with your voice
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {/* TTS Toggle Button */}
          <button
            onClick={() => setIsTtsEnabled(!isTtsEnabled)}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
              isTtsEnabled 
                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20" 
                : "bg-slate-950 text-slate-500 border-slate-850 hover:bg-slate-900"
            }`}
            title={isTtsEnabled ? "Disable Voice Responses" : "Enable Voice Responses"}
          >
            {isTtsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Expand Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs text-slate-400 hover:text-white underline decoration-slate-600 underline-offset-4 cursor-pointer font-mono font-bold"
          >
            {isOpen ? "Collapse" : "Setup / Help"}
          </button>
        </div>
      </div>

      {/* Main Microphone Button Area */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-850">
        <button
          onClick={toggleListening}
          className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-95 ${
            isListening
              ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:bg-cyan-400"
              : "bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800"
          }`}
        >
          {isListening ? (
            <div className="relative">
              <Mic className="w-6 h-6 animate-pulse" />
              <div className="absolute -inset-1 rounded-full border border-cyan-400 animate-ping opacity-30" />
            </div>
          ) : (
            <MicOff className="w-6 h-6 text-slate-400" />
          )}
        </button>

        <div className="min-w-0 flex-1 space-y-1.5 w-full text-center sm:text-left">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
            Assistant Status
          </div>
          <div className={`text-xs font-bold font-mono truncate leading-snug ${isListening ? "text-cyan-400" : "text-slate-300"}`}>
            {voiceStatus}
          </div>
          {isListening && (
            <div className="flex items-center gap-1 justify-center sm:justify-start">
              <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span className="w-1 h-4 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              <span className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
              <span className="w-1 h-4 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="space-y-4 pt-2 border-t border-slate-850 animate-fade-in text-left">
          {/* List of supported commands */}
          <div className="space-y-1.5">
            <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              🎤 Voice Command Cheat Sheet
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 space-y-1">
                <div className="text-[10px] font-bold text-white flex items-center gap-1.5">
                  <span className="bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-mono text-[9px]">"skip"</span>
                  <span>or</span>
                  <span className="bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-mono text-[9px]">"next"</span>
                </div>
                <p className="text-[9px] text-slate-500 leading-normal">
                  Advances immediately to the next track in the queue.
                </p>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 space-y-1">
                <div className="text-[10px] font-bold text-white flex items-center gap-1.5">
                  <span className="bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-mono text-[9px]">"pause"</span>
                  <span>or</span>
                  <span className="bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-mono text-[9px]">"stop"</span>
                </div>
                <p className="text-[9px] text-slate-500 leading-normal">
                  Pauses the currently active karaoke video.
                </p>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 space-y-1">
                <div className="text-[10px] font-bold text-white flex items-center gap-1.5">
                  <span className="bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-mono text-[9px]">"play"</span>
                  <span>or</span>
                  <span className="bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-mono text-[9px]">"resume"</span>
                </div>
                <p className="text-[9px] text-slate-500 leading-normal">
                  Resumes playing the current karaoke track.
                </p>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 space-y-1">
                <div className="text-[10px] font-bold text-white flex items-center gap-1.5">
                  <span className="bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-mono text-[9px]">"queue [song name]"</span>
                </div>
                <p className="text-[9px] text-slate-500 leading-normal">
                  Searches YouTube and adds the first karaoke match.
                </p>
              </div>
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed pt-1 italic">
              * Note: You can also say "sing [song]" or "play [song]" to search and queue. Examples: "queue Hello", "sing Bohemian Rhapsody".
            </p>
          </div>

          {/* Rolling voice logs */}
          {voiceLog.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-850">
              <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <span>Rolling Voice Log</span>
                <span className="text-[8px] text-slate-600">(last 5 entries)</span>
              </h5>
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 max-h-[100px] overflow-y-auto space-y-1 divide-y divide-slate-900/60 font-mono text-[9px]">
                {voiceLog.slice(0, 5).map((log, index) => (
                  <div key={`log-${index}`} className="pt-1 first:pt-0 flex items-start gap-1.5 text-slate-400">
                    <span className="text-slate-600 select-none">›</span>
                    <span className={log.isCommand ? "text-indigo-400 font-bold" : "text-slate-400"}>
                      {log.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function LoungeChatBox({
  chatMessages,
  chatInput,
  setChatInput,
  sendChatMessage,
  sendChatReaction,
  nickname
}: {
  chatMessages: any[];
  chatInput: string;
  setChatInput: (val: string) => void;
  sendChatMessage: (textStr?: string) => void;
  sendChatReaction: (emoji: string) => void;
  nickname: string;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendChatMessage();
  };

  const REACTION_EMOJIS = ["🎉", "👏", "🔥", "🎙️", "❤️", "🌟"];

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col h-[400px]">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 select-none">
        <div>
          <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>Lounge Live Chat</span>
          </h4>
          <p className="text-[10px] text-slate-400 mt-1 font-sans">
            Real-time messages and short emoji reactions!
          </p>
        </div>
        <span className="text-[9px] font-mono font-bold bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-500 shrink-0">
          LIVE STREAM
        </span>
      </div>

      {/* Message List Area */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-3 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <MessageSquare className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
            <p className="text-xs text-slate-500 font-mono">No messages in this session yet.</p>
            <p className="text-[10px] text-slate-600 font-sans mt-0.5">Be the first to say hello or drop a reaction!</p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isMe = msg.sender === nickname;
            const isSystem = msg.type === "system" || msg.sender === "System";
            const isCheer = msg.type === "cheer";

            if (isSystem || isCheer) {
              return (
                <div key={msg.id} className="text-center py-1 font-mono text-[10px]">
                  <span className="inline-block bg-slate-950/80 border border-slate-850/60 px-2.5 py-1 rounded-full text-indigo-300 shadow-sm leading-normal">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                <div className="flex items-center gap-1.5 mb-0.5 px-1">
                  <span className="text-[9px] font-bold text-slate-400 font-mono">
                    @{msg.sender}
                  </span>
                  <span className="text-[8px] text-slate-600 font-mono">{msg.timestamp}</span>
                </div>
                <div
                  className={`px-3 py-2 rounded-2xl text-xs font-sans break-all shadow-sm leading-relaxed ${
                    isMe
                      ? "bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 text-cyan-100 border border-cyan-500/30 rounded-tr-none"
                      : "bg-slate-950 border border-slate-850 text-slate-200 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reaction Tray */}
      <div className="border-t border-slate-800/60 pt-2.5 mb-3 flex items-center justify-between gap-2">
        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider select-none shrink-0">
          Reactions:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => sendChatReaction(emoji)}
              className="text-lg hover:scale-125 hover:-translate-y-0.5 transition-all active:scale-90 cursor-pointer p-1 rounded-lg hover:bg-slate-950 border border-transparent hover:border-slate-850"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Input Tray */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Say something to the group..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          maxLength={150}
          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder-slate-600 text-white focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={!chatInput.trim()}
          className="w-9 h-9 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-black flex items-center justify-center transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
