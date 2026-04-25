import { useState, useEffect } from "react";
import { Users, Plus, LogIn, Check, BookOpen, Wifi, WifiOff, Copy } from "lucide-react";
import { toast } from "sonner";
import type { RoomPlayer, RoomStatus } from "@/hooks/useGameRoom";

/* ═══════════════════════════════════════════
   GameLobby — Phòng chờ kết nối
   Ngụy trang: "Session Synchronization Panel"
   ═══════════════════════════════════════════ */

interface GameLobbyProps {
  roomId: string | null;
  players: RoomPlayer[];
  roomStatus: RoomStatus;
  isHost: boolean;
  isConnected: boolean;
  error: string | null;
  onCreateRoom: () => string;
  onJoinRoom: (id: string) => Promise<boolean>;
  onLeaveRoom: () => void;
  onSetReady: (ready: boolean) => void;
  onStartGame: () => void;
  onShowRules: () => void;
  /** Cho phép chơi offline (vs AI hoặc local) */
  onPlayOffline?: () => void;
  /** Tên game ngụy trang */
  title?: string;
}

export function GameLobby({
  roomId,
  players,
  roomStatus,
  isHost,
  isConnected,
  error,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onSetReady,
  onStartGame,
  onShowRules,
  onPlayOffline,
  title = "Session Synchronization",
}: GameLobbyProps) {
  const [joinId, setJoinId] = useState("");
  const [playerName, setPlayerName] = useState(
    localStorage.getItem("dta-player-name") || ""
  );
  const [isJoining, setIsJoining] = useState(false);

  const myPlayer = players.find(
    (p) => p.id === localStorage.getItem("dta-player-id")
  );
  const isReady = myPlayer?.isReady ?? false;
  const allReady = players.length >= 2 && players.every((p) => p.isReady);

  const handleSaveName = () => {
    if (playerName.trim()) {
      localStorage.setItem("dta-player-name", playerName.trim());
    }
  };

  // Tự động điền mã phòng nếu có trong URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room");
    if (roomParam && !roomId) {
      setJoinId(roomParam.replace(/\D/g, "").slice(0, 4));
    }
  }, [roomId]);

  const handleCreate = () => {
    handleSaveName();
    const id = onCreateRoom();
    
    // Cập nhật URL với mã phòng
    const url = new URL(window.location.href);
    url.searchParams.set("room", id);
    window.history.pushState({}, "", url.toString());

    toast.success(`Phòng ${id} đã được tạo!`);
  };

  const handleJoin = async () => {
    if (!joinId.trim() || joinId.length !== 4) {
      toast.error("Vui lòng nhập mã phòng 4 chữ số.");
      return;
    }
    handleSaveName();
    setIsJoining(true);
    const ok = await onJoinRoom(joinId.trim());
    setIsJoining(false);
    if (ok) {
      // Cập nhật URL với mã phòng
      const url = new URL(window.location.href);
      url.searchParams.set("room", joinId.trim());
      window.history.pushState({}, "", url.toString());
      
      toast.success(`Đã kết nối phòng ${joinId}!`);
    } else {
      toast.error("Không thể kết nối đến phòng.");
    }
  };

  const handleCopyLink = () => {
    if (roomId) {
      const url = new URL(window.location.href);
      url.searchParams.set("room", roomId);
      navigator.clipboard.writeText(url.toString());
      toast.success("Đã sao chép đường link mời!");
    }
  };

  // ── Chưa vào phòng → hiện form tạo/join ──
  if (!roomId || roomStatus === "idle") {
    return (
      <div className="lobby-container">
        <div className="lobby-card">
          <div className="lobby-header">
            <Users size={20} />
            <h2>{title}</h2>
          </div>

          {/* Tên người chơi */}
          <div className="lobby-field">
            <label>Tên hiển thị (Display Name)</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Nhập tên của bạn..."
              className="lobby-input"
              maxLength={20}
            />
          </div>

          {/* Tạo phòng */}
          <div className="lobby-section">
            <button
              className="lobby-btn primary"
              onClick={handleCreate}
              disabled={!playerName.trim()}
            >
              <Plus size={18} />
              <span>Tạo phòng mới</span>
            </button>
          </div>

          {/* Hoặc */}
          <div className="lobby-divider">
            <span>hoặc</span>
          </div>

          {/* Join phòng */}
          <div className="lobby-section">
            <div className="lobby-join-row">
              <input
                type="text"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="Mã phòng 4 số"
                className="lobby-input code"
                maxLength={4}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
              <button
                className="lobby-btn secondary"
                onClick={handleJoin}
                disabled={!playerName.trim() || isJoining}
              >
                <LogIn size={16} />
                <span>{isJoining ? "Đang kết nối..." : "Tham gia"}</span>
              </button>
            </div>
          </div>

          {/* Chơi offline */}
          {onPlayOffline && (
            <>
              <div className="lobby-divider">
                <span>hoặc</span>
              </div>
              <button className="lobby-btn outline" onClick={onPlayOffline}>
                <span>Chơi offline (vs AI)</span>
              </button>
            </>
          )}

          {/* Nút xem luật */}
          <button className="lobby-rules-btn" onClick={onShowRules}>
            <BookOpen size={14} />
            <span>Xem hướng dẫn chơi</span>
          </button>

          {error && <p className="lobby-error">{error}</p>}
        </div>
      </div>
    );
  }

  // ── Đã vào phòng → hiện phòng chờ ──
  return (
    <div className="lobby-container">
      <div className="lobby-card waiting">
        <div className="lobby-header">
          <div className="lobby-connection">
            {isConnected ? (
              <Wifi size={16} className="text-green-400" />
            ) : (
              <WifiOff size={16} className="text-red-400" />
            )}
          </div>
          <h2>Phòng chờ — Session #{roomId}</h2>
        </div>

        {/* Room ID lớn */}
        <div className="lobby-room-id" style={{ position: 'relative' }}>
          <span className="lobby-room-label">Session ID</span>
          <span className="lobby-room-code" onClick={handleCopyLink} style={{ cursor: 'pointer' }} title="Bấm để copy Link">{roomId}</span>
          <span className="lobby-room-hint">Gửi mã hoặc link này cho đối thủ để kết nối</span>
          <button 
            className="lobby-btn outline small" 
            style={{ marginTop: 10, alignSelf: 'center', width: 'auto', padding: '6px 12px' }}
            onClick={handleCopyLink}
          >
            <Copy size={14} /> Sao chép Link mời
          </button>
        </div>

        {/* Danh sách người chơi */}
        <div className="lobby-players">
          <h3>Người tham gia ({players.length}/2)</h3>
          <div className="lobby-player-list">
            {players.map((p) => (
              <div key={p.id} className={`lobby-player ${p.isReady ? "ready" : ""}`}>
                <div className="player-avatar">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="player-info">
                  <span className="player-name">
                    {p.name}
                    {p.role === "host" && <span className="host-badge">HOST</span>}
                  </span>
                  <span className="player-status">
                    {p.isReady ? "✅ Sẵn sàng" : "⏳ Đang chờ..."}
                  </span>
                </div>
              </div>
            ))}

            {/* Slot trống */}
            {players.length < 2 && (
              <div className="lobby-player empty">
                <div className="player-avatar empty">?</div>
                <div className="player-info">
                  <span className="player-name">Đang chờ đối thủ...</span>
                  <span className="player-status">Chia sẻ mã phòng để mời</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="lobby-actions">
          {players.length >= 2 && (
            <button
              className={`lobby-btn ${isReady ? "ready-active" : "primary"}`}
              onClick={() => onSetReady(!isReady)}
            >
              <Check size={16} />
              <span>{isReady ? "Hủy sẵn sàng" : "Sẵn sàng"}</span>
            </button>
          )}

          {isHost && allReady && (
            <button className="lobby-btn start" onClick={onStartGame}>
              <span>🚀 Bắt đầu trận đấu</span>
            </button>
          )}

          <button className="lobby-btn outline small" onClick={onLeaveRoom}>
            Rời phòng
          </button>
        </div>

        {/* Nút xem luật */}
        <button className="lobby-rules-btn" onClick={onShowRules}>
          <BookOpen size={14} />
          <span>Xem hướng dẫn chơi</span>
        </button>
      </div>
    </div>
  );
}
