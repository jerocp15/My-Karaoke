/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Mic,
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
  History
} from "lucide-react";
import { SingRoomParty, YTPlaylistItem } from "../types";

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

export default function SingRoomKtv() {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"search" | "queue" | "sounds" | "history">("search");
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);

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

  // Parse direct join from URL parameter e.g. /?room=ABCDE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room") || params.get("join");
    if (roomParam && roomParam.length === 5) {
      setRoomIdInput(roomParam.toUpperCase());
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
    if (!playerRef.current) return;
    try {
      if (action === "play") {
        playerRef.current.playVideo();
      } else if (action === "pause") {
        playerRef.current.pauseVideo();
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
      if (playerRef.current && typeof playerRef.current.loadVideoById === "function") {
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
      setSuccessMsg(`Joined room "${data.name}" successfully!`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to join room. Verify code is active.");
    }
  };

  // Exit/Leave current room
  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    setRoom(null);
    setSearchResults([]);
    setSearchQuery("");
    setErrorMsg("");
    setSuccessMsg("");
    setIsHostRole(false);
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
                      <div id="youtube-player-host" className="w-full h-full" />
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

                  {/* ROOM SOUND CARD (SOUNDBOARD) */}
                  <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-2.5 gap-2">
                      <div>
                        <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-cyan-400" />
                          <span>Room Soundboard (Sound Card)</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Tap any sound effect to play it instantly on your TV speakers with synchronized visual overlays.
                        </p>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-500 self-start sm:self-auto">
                        SYNCED REMOTE LIVE
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {SOUND_EFFECTS.map((effect) => (
                        <button
                          key={effect.id}
                          onClick={() => sendSoundEffect(effect.id)}
                          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-950 border border-slate-850 hover:border-cyan-500/50 hover:bg-slate-900/40 transition-all active:scale-95 group cursor-pointer text-center"
                        >
                          <span className="text-3xl group-hover:scale-115 transition-transform mb-1.5 select-none">{effect.emoji}</span>
                          <span className="text-[11px] font-extrabold text-slate-300 group-hover:text-cyan-400 transition-colors truncate w-full">{effect.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

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
                        className="w-full pl-3 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder-slate-600 text-white focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        <Search className="w-4 h-4" />
                      </button>
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

                </div>

              </div>
            ) : (
              
              // CASE B: GUEST / MOBILE VIEW (OPTIMIZED FOR HAND-HELD CONTROLLER)
              <div className="max-w-md mx-auto space-y-6">
                
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

                {/* Tab layout: Search Songs vs Active Queue vs Soundboard vs History */}
                <div className="grid grid-cols-4 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setActiveMobileTab("search")}
                    className={`flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                      activeMobileTab === "search" ? "bg-cyan-500 text-black shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search</span>
                  </button>
                  <button
                    onClick={() => setActiveMobileTab("queue")}
                    className={`flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                      activeMobileTab === "queue" ? "bg-cyan-500 text-black shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Queue ({room.queue.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveMobileTab("sounds")}
                    className={`flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                      activeMobileTab === "sounds" ? "bg-cyan-500 text-black shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Sounds</span>
                  </button>
                  <button
                    onClick={() => setActiveMobileTab("history")}
                    className={`flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                      activeMobileTab === "history" ? "bg-cyan-500 text-black shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>History</span>
                  </button>
                </div>

                {/* NOW PLAYING CARD AT TOP */}
                {room.activeSong && (
                  <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-3 shadow-md">
                    <img
                      src={room.activeSong.thumbnail}
                      alt="Now playing"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0 animate-pulse"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="inline-block text-[9px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/10 px-2 py-0.5 rounded font-bold">
                        Now Singing
                      </span>
                      <h4 className="text-xs font-extrabold text-white line-clamp-1 mt-1 leading-snug">
                        {room.activeSong.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Added by @{room.activeSong.queuedBy}
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB B1: SEARCH VIEW */}
                {activeMobileTab === "search" && (
                  <div className="space-y-4 animate-fade-in">
                    <form onSubmit={searchSongs} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search YouTube track (e.g. Queen)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-cyan-500 text-white placeholder-slate-600"
                      />
                      <button
                        type="submit"
                        className="px-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Search</span>
                      </button>
                    </form>

                    {/* Search results loading indicator */}
                    {isSearching && (
                      <div className="py-12 text-center text-xs text-slate-500 font-mono flex flex-col items-center gap-2">
                        <span className="w-5 h-5 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
                        <span>Retrieving high-fidelity YouTube search results...</span>
                      </div>
                    )}

                    {/* Search Results Cards */}
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

                            {/* Guests cannot delete or reorder, only view or delete their OWN song if they want (let's let them delete any for simple collab, or keep it read-only) */}
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

                {/* TAB B3: SOUNDBOARD / SOUND CARD */}
                {activeMobileTab === "sounds" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="text-center p-3.5 bg-slate-900/35 border border-slate-800 rounded-2xl">
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-cyan-400">
                        Room Soundboard (Sound Card)
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-1 font-sans">
                        Tap any sound effect to play it instantly on the Host's big screen/TV speakers!
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {SOUND_EFFECTS.map((effect) => (
                        <button
                          key={effect.id}
                          onClick={() => sendSoundEffect(effect.id)}
                          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900 border border-slate-850 hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all active:scale-95 group cursor-pointer text-center"
                        >
                          <span className="text-3xl group-hover:scale-110 transition-transform mb-2 select-none">{effect.emoji}</span>
                          <span className="text-[11px] font-extrabold text-slate-200 group-hover:text-cyan-400 transition-colors">{effect.name}</span>
                        </button>
                      ))}
                    </div>
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
