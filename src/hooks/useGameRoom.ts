import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

/* ═══════════════════════════════════════════
   useGameRoom — Hook quản lý phòng chơi Realtime
   Sử dụng Supabase Broadcast + Presence
   ═══════════════════════════════════════════ */

export interface PlayerInfo {
  id: string;
  name: string;
  avatar?: string;
}

export interface RoomPlayer extends PlayerInfo {
  role: "host" | "guest";
  isReady: boolean;
  joinedAt: string;
}

export type RoomStatus = "idle" | "waiting" | "ready" | "playing" | "finished";

export interface GameEvent<T = unknown> {
  type: string;
  payload: T;
  senderId: string;
  timestamp: number;
}

interface UseGameRoomOptions {
  onGameEvent?: (event: GameEvent) => void;
  onPlayerJoin?: (player: RoomPlayer) => void;
  onPlayerLeave?: (playerId: string) => void;
  onRoomStatusChange?: (status: RoomStatus) => void;
}

interface UseGameRoomReturn {
  // Trạng thái
  roomId: string | null;
  players: RoomPlayer[];
  roomStatus: RoomStatus;
  isHost: boolean;
  isConnected: boolean;
  error: string | null;

  // Hành động
  createRoom: () => string;
  joinRoom: (roomId: string) => Promise<boolean>;
  leaveRoom: () => void;
  setReady: (ready: boolean) => void;
  sendGameEvent: <T>(type: string, payload: T) => void;
  startGame: () => void;
}

function generateRoomId(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function generatePlayerId(): string {
  let id = localStorage.getItem("dta-player-id");
  if (!id) {
    id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("dta-player-id", id);
  }
  return id;
}

export function useGameRoom(
  playerInfo: Omit<PlayerInfo, "id">,
  options: UseGameRoomOptions = {}
): UseGameRoomReturn {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [roomStatus, setRoomStatus] = useState<RoomStatus>("idle");
  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const playerIdRef = useRef<string>(generatePlayerId());
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // ── Dọn dẹp channel ──
  const cleanup = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setPlayers([]);
    setRoomStatus("idle");
    setIsConnected(false);
    setIsHost(false);
    setError(null);
  }, []);

  // ── Thiết lập channel ──
  const setupChannel = useCallback(
    (id: string, asHost: boolean) => {
      cleanup();

      const channelName = `game-room-${id}`;
      const channel = supabase.channel(channelName, {
        config: {
          presence: { key: playerIdRef.current },
          broadcast: { self: false },
        },
      });

      // Presence: theo dõi ai đang online
      channel.on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const currentPlayers: RoomPlayer[] = [];

        Object.entries(state).forEach(([_key, presences]) => {
          const presenceArr = presences as unknown as RoomPlayer[];
          if (presenceArr.length > 0) {
            currentPlayers.push(presenceArr[0]);
          }
        });

        setPlayers(currentPlayers);

        // Kiểm tra tất cả ready → room ready
        if (currentPlayers.length >= 2 && currentPlayers.every((p) => p.isReady)) {
          setRoomStatus("ready");
          optionsRef.current.onRoomStatusChange?.("ready");
        }
      });

      channel.on("presence", { event: "join" }, ({ newPresences }) => {
        const joined = newPresences as unknown as RoomPlayer[];
        if (joined.length > 0) {
          optionsRef.current.onPlayerJoin?.(joined[0]);
        }
      });

      channel.on("presence", { event: "leave" }, ({ leftPresences }) => {
        const left = leftPresences as unknown as RoomPlayer[];
        if (left.length > 0) {
          optionsRef.current.onPlayerLeave?.(left[0].id);
        }
      });

      // Broadcast: nhận game events
      channel.on("broadcast", { event: "game-event" }, ({ payload }) => {
        const event = payload as GameEvent;
        if (event.senderId !== playerIdRef.current) {
          optionsRef.current.onGameEvent?.(event);
        }
      });

      // Broadcast: room status changes
      channel.on("broadcast", { event: "room-status" }, ({ payload }) => {
        const { status } = payload as { status: RoomStatus };
        setRoomStatus(status);
        optionsRef.current.onRoomStatusChange?.(status);
      });

      // Subscribe & track presence
      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            id: playerIdRef.current,
            name: playerInfo.name,
            avatar: playerInfo.avatar || "",
            role: asHost ? "host" : "guest",
            isReady: false,
            joinedAt: new Date().toISOString(),
          });
          setIsConnected(true);
          setError(null);
        } else if (status === "CHANNEL_ERROR") {
          setError("Không thể kết nối đến phòng chơi.");
          setIsConnected(false);
        }
      });

      channelRef.current = channel;
      setRoomId(id);
      setIsHost(asHost);
      setRoomStatus("waiting");
    },
    [cleanup, playerInfo.name, playerInfo.avatar]
  );

  // ── Tạo phòng ──
  const createRoom = useCallback((): string => {
    const id = generateRoomId();
    setupChannel(id, true);
    return id;
  }, [setupChannel]);

  // ── Tham gia phòng ──
  const joinRoom = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setupChannel(id, false);
        return true;
      } catch {
        setError("Không thể tham gia phòng.");
        return false;
      }
    },
    [setupChannel]
  );

  // ── Rời phòng ──
  const leaveRoom = useCallback(() => {
    cleanup();
    setRoomId(null);
  }, [cleanup]);

  // ── Đánh dấu sẵn sàng ──
  const setReady = useCallback(
    (ready: boolean) => {
      if (channelRef.current) {
        channelRef.current.track({
          id: playerIdRef.current,
          name: playerInfo.name,
          avatar: playerInfo.avatar || "",
          role: isHost ? "host" : "guest",
          isReady: ready,
          joinedAt: new Date().toISOString(),
        });
      }
    },
    [playerInfo.name, playerInfo.avatar, isHost]
  );

  // ── Gửi game event ──
  const sendGameEvent = useCallback(
    <T,>(type: string, payload: T) => {
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "game-event",
          payload: {
            type,
            payload,
            senderId: playerIdRef.current,
            timestamp: Date.now(),
          } satisfies GameEvent<T>,
        });
      }
    },
    []
  );

  // ── Bắt đầu game (chỉ host) ──
  const startGame = useCallback(() => {
    if (!isHost || !channelRef.current) return;
    channelRef.current.send({
      type: "broadcast",
      event: "room-status",
      payload: { status: "playing" as RoomStatus },
    });
    setRoomStatus("playing");
    optionsRef.current.onRoomStatusChange?.("playing");
  }, [isHost]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    roomId,
    players,
    roomStatus,
    isHost,
    isConnected,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    setReady,
    sendGameEvent,
    startGame,
  };
}
