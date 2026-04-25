import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Bold, Italic, Underline, AlignLeft, AlignCenter,
  AlignRight, Link2, Image, List, Type, Undo, Redo,
  MessageSquare, X, Check, AlertCircle, Clock, User
} from "lucide-react";
import { GameRules } from "@/components/games/GameRules";
import { GameTimer } from "@/components/games/GameTimer";
import { GameLobby } from "@/components/games/GameLobby";
import { useGameRoom } from "@/hooks/useGameRoom";
import {
  isValidWord, isValidChain, getLastSyllable, getRandomStartWord,
  hasNextWord, getDictionarySize
} from "@/lib/vietnameseWords";
import { toast } from "sonner";

/* ═══════════════════════════════════════════
   NỐI TỪ (WORD CHAIN) — DTA Collaborative Docs
   ═══════════════════════════════════════════ */

const TURN_DURATION = 15; // giây mỗi lượt

interface WordEntry {
  text: string;
  valid: boolean;
  player: string;
  timestamp: string;
}

interface CommentEntry {
  text: string;
  timestamp: string;
  type: "system" | "chat";
  sender?: string;
}

// ── Fake presence users ──
const FAKE_USERS = [
  { name: "T", color: "#4285f4" },
  { name: "M", color: "#ea4335" },
  { name: "H", color: "#34a853" },
];

type GamePhase = "lobby" | "playing" | "finished";

// ── Component: Docs Toolbar ──
function DocsToolbar({ isBossKey }: { isBossKey: boolean }) {
  return (
    <div className={`docs-toolbar ${isBossKey ? "static" : ""}`}>
      <div className="toolbar-group">
        <button className="toolbar-btn" title="Hoàn tác"><Undo size={16} /></button>
        <button className="toolbar-btn" title="Làm lại"><Redo size={16} /></button>
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-group">
        <select className="toolbar-select"><option>Normal text</option></select>
        <select className="toolbar-select"><option>Inter</option></select>
        <select className="toolbar-select narrow"><option>11</option></select>
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-group">
        <button className="toolbar-btn"><Bold size={16} /></button>
        <button className="toolbar-btn"><Italic size={16} /></button>
        <button className="toolbar-btn"><Underline size={16} /></button>
        <button className="toolbar-btn"><Type size={16} /></button>
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-group">
        <button className="toolbar-btn"><AlignLeft size={16} /></button>
        <button className="toolbar-btn"><AlignCenter size={16} /></button>
        <button className="toolbar-btn"><AlignRight size={16} /></button>
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-group">
        <button className="toolbar-btn"><Link2 size={16} /></button>
        <button className="toolbar-btn"><Image size={16} /></button>
        <button className="toolbar-btn"><List size={16} /></button>
      </div>
      <div className="toolbar-presence">
        {FAKE_USERS.map((u, i) => (
          <div key={i} className="presence-avatar"
            style={{ borderColor: u.color, zIndex: FAKE_USERS.length - i }}
            title={`Cộng tác viên ${u.name}`}>
            {u.name}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Component: Chat Sidebar ──
function ChatSidebar({ 
  comments, 
  visible,
  onSendChat,
  playerName
}: { 
  comments: CommentEntry[]; 
  visible: boolean;
  onSendChat: (text: string) => void;
  playerName: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => { ref.current && (ref.current.scrollTop = ref.current.scrollHeight); }, [comments]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    onSendChat(chatInput.trim());
    setChatInput("");
  };

  return (
    <div className={`comment-sidebar ${visible ? "open" : "closed"}`} style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="sidebar-title">
        <MessageSquare size={16} />
        <span>Live Chat / Revision</span>
      </div>
      <div className="comment-list" ref={ref} style={{ flex: 1, overflowY: 'auto' }}>
        {comments.length === 0 ? (
          <div className="comment-empty">Chưa có bình luận nào.</div>
        ) : comments.map((c, i) => (
          <div key={i} className={`comment-card ${c.type === "system" ? "error" : "chat"}`} style={c.type === "chat" ? { background: '#f1f5f9', borderLeft: '3px solid #2563eb' } : {}}>
            <div className="comment-header">
              {c.type === "system" ? (
                <>
                  <AlertCircle size={14} color="#ef4444" />
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>[System AI]</span>
                </>
              ) : (
                <>
                  <User size={14} color="#2563eb" />
                  <span style={{ color: '#2563eb', fontWeight: 600 }}>{c.sender === playerName ? "Bạn" : c.sender}</span>
                </>
              )}
              <span className="comment-time">{c.timestamp}</span>
            </div>
            <p className="comment-text" style={c.type === "chat" ? { color: '#334155' } : {}}>{c.text}</p>
          </div>
        ))}
      </div>
      <div className="chat-input-area" style={{ padding: '10px', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Nhập tin nhắn..." 
            style={{ flex: 1, padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }}
          />
          <button type="submit" style={{ padding: '8px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Gửi</button>
        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//  MAIN GAME COMPONENT
// ══════════════════════════════════════════
export default function WordChainGame() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null!);

  // ── Game state ──
  const [phase, setPhase] = useState<GamePhase>("lobby");
  const [words, setWords] = useState<WordEntry[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [comments, setComments] = useState<CommentEntry[]>([]);
  const [bossKeyActive, setBossKeyActive] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());

  // ── Turn system (offline 2-player local) ──
  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1);
  const [timerRunning, setTimerRunning] = useState(false);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [startWord, setStartWord] = useState<string>("");

  // ── Multiplayer hook ──
  const playerName = localStorage.getItem("dta-player-name") || "Người chơi";
  const gameRoom = useGameRoom(
    { name: playerName },
    {
      onGameEvent: (event) => {
        if (event.type === "word-submit") {
          const { word, player, valid } = event.payload as {
            word: string; player: string; valid: boolean;
          };
          handleRemoteWord(word, player, valid);
        }
        if (event.type === "game-start") {
          startGame();
        }
        if (event.type === "timeout") {
          handleRemoteTimeout();
        }
        if (event.type === "chat-message") {
          const { text, sender, timestamp } = event.payload as { text: string; sender: string; timestamp: string };
          setComments(prev => [...prev, { text, sender, timestamp, type: "chat" }]);
        }
      },
      onRoomStatusChange: (status) => {
        if (status === "playing") {
          // Host sẽ gửi game-start event
        }
      },
    }
  );

  const isMultiplayer = gameRoom.roomId !== null && gameRoom.roomStatus !== "idle";
  const isMyTurn = isMultiplayer
    ? (currentTurn === 1 && gameRoom.isHost) || (currentTurn === 2 && !gameRoom.isHost)
    : true; // Offline: luôn đến lượt

  // ── Boss Key listener ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); setBossKeyActive(p => !p); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Focus input khi đến lượt ──
  useEffect(() => {
    if (phase === "playing" && isMyTurn && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase, isMyTurn, currentTurn]);

  // ── Start game ──
  const startGame = useCallback(() => {
    setWords([]);
    setUsedWords(new Set());
    setCurrentTurn(1);
    setScores([0, 0]);
    setWinner(null);
    setComments([]);
    setPhase("playing");
    setTimerRunning(true);
  }, []);

  const handleStartOffline = useCallback(() => {
    startGame();
  }, [startGame]);

  const handleStartMultiplayer = useCallback(() => {
    gameRoom.sendGameEvent("game-start", {});
    gameRoom.startGame();
    startGame();
  }, [gameRoom, startGame]);

  // ── Handle remote word (multiplayer) ──
  const handleRemoteWord = useCallback((word: string, player: string, valid: boolean) => {
    const now = new Date().toLocaleTimeString("vi-VN");
    setWords(prev => [...prev, { text: word, valid, player, timestamp: now }]);
    if (valid) {
      setUsedWords(prev => new Set(prev).add(word));
      setScores(prev => {
        const newScores: [number, number] = [...prev] as [number, number];
        // Đối thủ ghi điểm
        if (gameRoom.isHost) newScores[1]++;
        else newScores[0]++;
        return newScores;
      });
      switchTurn();
    } else {
      // Đối thủ nhập sai -> mình thắng
      setComments(prev => [...prev, { text: `Đối thủ đã nhập sai từ "${word}" và bị xử thua!`, timestamp: now, type: "system" }]);
      const myNumber = gameRoom.isHost ? 1 : 2;
      setWinner(myNumber as 1 | 2);
      setPhase("finished");
      setTimerRunning(false);
      toast.success("Đối thủ nhập sai từ. Bạn thắng!");
    }
  }, [gameRoom.isHost, switchTurn]);

  const handleRemoteTimeout = useCallback(() => {
    // Đối thủ hết giờ → mình thắng
    const now = new Date().toLocaleTimeString("vi-VN");
    setComments(prev => [...prev, { text: "Đối thủ hết thời gian trả lời. Bạn thắng!", timestamp: now, type: "system" }]);
    const myNumber = gameRoom.isHost ? 1 : 2;
    setWinner(myNumber as 1 | 2);
    setPhase("finished");
    setTimerRunning(false);
  }, [gameRoom.isHost]);

  // ── Switch turn ──
  const switchTurn = useCallback(() => {
    setCurrentTurn(prev => prev === 1 ? 2 : 1);
    setTimerRunning(true); // Reset timer cho lượt mới
  }, []);

  // ── Handle timeout (hết giờ) ──
  const handleTimeout = useCallback(() => {
    if (!isMyTurn) return;
    const now = new Date().toLocaleTimeString("vi-VN");
    const loser = currentTurn;
    const winnerNum = currentTurn === 1 ? 2 : 1;

    setComments(prev => [...prev, {
      text: `Người chơi ${loser} hết thời gian trả lời (${TURN_DURATION}s). Keyword chain bị gián đoạn.`,
      timestamp: now,
      type: "system"
    }]);

    // Gửi timeout cho đối thủ (multiplayer)
    if (isMultiplayer) {
      gameRoom.sendGameEvent("timeout", {});
    }

    setWinner(winnerNum as 1 | 2);
    setPhase("finished");
    setTimerRunning(false);
    toast.error(`Hết giờ! Người chơi ${loser} thua.`);
  }, [isMyTurn, currentTurn, isMultiplayer, gameRoom]);

  // ── Submit word ──
  const handleSubmit = useCallback(() => {
    const word = inputValue.trim().toLowerCase();
    if (!word || !isMyTurn || phase !== "playing") return;

    const now = new Date().toLocaleTimeString("vi-VN");
    const lastWord = words[words.length - 1];
    const playerLabel = `Người chơi ${currentTurn}`;

    let isValid = true;
    let errorMsg = "";

    // 1. Kiểm tra nối âm tiết nếu đã có từ trước đó
    if (words.length > 0) {
      if (lastWord && lastWord.valid) {
        if (!isValidChain(lastWord.text, word)) {
          isValid = false;
          const lastSyl = getLastSyllable(lastWord.text);
          const firstPart = word.split(" ")[0];
          errorMsg = `Lỗi chuỗi: Từ "${word}" phải bắt đầu bằng âm tiết "${lastSyl}" (nhận được "${firstPart}"). Vui lòng cập nhật lại.`;
        }
      }
    } else {
      // Lượt đi đầu tiên
      const parts = word.split(" ");
      if (parts.length !== 2) {
        isValid = false;
        errorMsg = `Từ khóa "${word}" không hợp lệ. Vui lòng nhập từ ghép 2 âm tiết.`;
      }
    }

    // 2. Kiểm tra từ có trong từ điển
    if (isValid && !isValidWord(word)) {
      isValid = false;
      errorMsg = `Từ khóa "${word}" không tồn tại trong cơ sở dữ liệu (${getDictionarySize()} từ). Vui lòng sử dụng từ ghép 2 âm tiết có nghĩa.`;
    }

    // 3. Kiểm tra trùng lặp
    if (isValid && usedWords.has(word)) {
      isValid = false;
      errorMsg = `Từ khóa "${word}" đã được sử dụng. Không cho phép trùng lặp.`;
    }

    // Thêm từ vào list
    const entry: WordEntry = { text: word, valid: isValid, player: playerLabel, timestamp: now };
    setWords(prev => [...prev, entry]);
    setInputValue("");

    if (isValid) {
      setUsedWords(prev => new Set(prev).add(word));
      setScores(prev => {
        const n: [number, number] = [...prev] as [number, number];
        n[currentTurn - 1]++;
        return n;
      });

      // Gửi cho đối thủ (multiplayer)
      if (isMultiplayer) {
        gameRoom.sendGameEvent("word-submit", { word, player: playerLabel, valid: true });
      }

      // Kiểm tra đối thủ có từ nào để nối không
      if (!hasNextWord(word, usedWords)) {
        setComments(prev => [...prev, {
          text: `Không còn từ nào có thể nối tiếp "${word}". ${playerLabel} thắng bằng chiến thuật!`,
          timestamp: now,
          type: "system"
        }]);
        setWinner(currentTurn);
        setPhase("finished");
        setTimerRunning(false);
        return;
      }

      switchTurn();
    } else {
      // Từ sai → thua ngay
      if (errorMsg) {
        setComments(prev => [...prev, { text: errorMsg, timestamp: now, type: "system" }]);
        setShowSidebar(true);
      }

      if (isMultiplayer) {
        gameRoom.sendGameEvent("word-submit", { word, player: playerLabel, valid: false });
      }

      const winnerNum = currentTurn === 1 ? 2 : 1;
      setWinner(winnerNum as 1 | 2);
      setPhase("finished");
      setTimerRunning(false);
      toast.error(`Từ không hợp lệ! ${playerLabel} thua.`);
    }
  }, [inputValue, isMyTurn, phase, words, currentTurn, usedWords, isMultiplayer, gameRoom, switchTurn]);

  // ── Reset ──
  const handleReset = () => {
    handleStartOffline();
  };

  // ── Send Chat ──
  const handleSendChat = useCallback((text: string) => {
    const now = new Date().toLocaleTimeString("vi-VN");
    const entry: CommentEntry = { text, timestamp: now, type: "chat", sender: playerName };
    setComments(prev => [...prev, entry]);
    if (isMultiplayer) {
      gameRoom.sendGameEvent("chat-message", { text, sender: playerName, timestamp: now });
    }
  }, [isMultiplayer, gameRoom, playerName]);

  // ── Lobby phase ──
  if (phase === "lobby") {
    return (
      <>
        <GameLobby
          roomId={gameRoom.roomId}
          players={gameRoom.players}
          roomStatus={gameRoom.roomStatus}
          isHost={gameRoom.isHost}
          isConnected={gameRoom.isConnected}
          error={gameRoom.error}
          onCreateRoom={gameRoom.createRoom}
          onJoinRoom={gameRoom.joinRoom}
          onLeaveRoom={gameRoom.leaveRoom}
          onSetReady={gameRoom.setReady}
          onStartGame={handleStartMultiplayer}
          onShowRules={() => setShowRules(true)}
          onPlayOffline={handleStartOffline}
          title="DTA Collaborative Docs — Session"
        />
        <GameRules gameType="wordchain" isOpen={showRules} onClose={() => setShowRules(false)} />
      </>
    );
  }

  return (
    <div className="wordchain-container">
      {/* Header */}
      <div className="docs-header">
        <div className="docs-header-left">
          <button className="back-btn" onClick={() => navigate("/workspace")}>
            <ArrowLeft size={18} />
          </button>
          <div className="docs-title-area">
            <h1 className="docs-doc-title">Chiến_lược_SEO_Q3.gdoc</h1>
            <div className="docs-menu">
              <span>File</span>
              <span>Draft</span>
              <span>Review</span>
              <span>Revision</span>
              <span>Sync</span>
            </div>
          </div>
        </div>
        <div className="docs-header-right">
          <button className="reset-data-btn" onClick={handleReset}>Làm mới Keywords</button>
          <button className="toolbar-btn" onClick={() => setShowSidebar(p => !p)}>
            <MessageSquare size={16} />
          </button>
          <button className="toolbar-btn" onClick={() => setShowRules(true)}>
            <span style={{ fontSize: 12 }}>?</span>
          </button>
        </div>
      </div>

      <DocsToolbar isBossKey={bossKeyActive} />

      {/* Turn indicator + Timer */}
      {phase === "playing" && (
        <div className="wordchain-turn-bar">
          <div className="turn-info">
            <User size={14} />
            <span className={`turn-label ${isMyTurn ? "my-turn" : ""}`}>
              {isMyTurn
                ? `🟢 Lượt của bạn (Người chơi ${currentTurn})`
                : `⏳ Đang chờ Người chơi ${currentTurn}...`}
            </span>
          </div>
          <div className="turn-scores">
            <span className="score p1">P1: {scores[0]}</span>
            <span className="score-divider">|</span>
            <span className="score p2">P2: {scores[1]}</span>
          </div>
          <div className="turn-timer-wrapper">
            <GameTimer
              duration={TURN_DURATION}
              isRunning={timerRunning}
              onTimeout={handleTimeout}
              label="Response Timeout"
              className="light"
              key={`${currentTurn}-${words.length}`}
            />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="docs-main">
        <div className="paper-page">
          <div className="paper-content">
            <h2 className="paper-title">Danh sách Từ khóa SEO chiến lược Q3</h2>
            <p className="paper-subtitle">
              Quy tắc: Từ ghép 2 âm tiết • Nối âm tiết cuối → đầu • {TURN_DURATION}s/lượt •
              Từ điển: {getDictionarySize()} từ
            </p>

            {/* Word list */}
            <div className="word-list">
              {words.map((w, i) => (
                <div key={i} className={`word-item ${!w.valid ? "invalid" : ""}`}>
                  <span className="word-bullet">•</span>
                  <span className={`word-text ${!w.valid ? "wavy-underline" : ""}`}>
                    {w.text}
                  </span>
                  <span className="word-player-tag">{w.player}</span>
                  <span className="word-status">
                    {w.valid ? <Check size={12} className="text-green-500" /> : <X size={12} className="text-red-500" />}
                  </span>
                </div>
              ))}
            </div>

            {/* Input area */}
            {phase === "playing" && !bossKeyActive && (
              <div className="word-input-area">
                <span className="word-bullet">•</span>
                <div className="word-input-wrapper">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder={
                      isMyTurn
                        ? (words.length > 0
                            ? `Nhập từ bắt đầu bằng "${getLastSyllable(words[words.length - 1].text)}"...`
                            : "Nhập từ đầu tiên để bắt đầu (2 âm tiết)...")
                        : "Đang chờ đối thủ..."
                    }
                    className="word-input"
                    disabled={!isMyTurn}
                    autoFocus
                  />
                </div>
              </div>
            )}

            {phase === "finished" && winner && (
              <div className="wordchain-result" style={{ marginTop: 30, padding: 24, border: "1px solid #e2e8f0", borderRadius: 8, backgroundColor: "#f8fafc", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                <div className="result-banner" style={{ textAlign: "center", color: "#334155" }}>
                  <h3 style={{ color: "#ef4444", marginBottom: 12, fontSize: "1.25rem", fontWeight: 600 }}>
                    {`Phiên làm việc kết thúc — Người chơi ${winner} chiến thắng`}
                  </h3>
                  <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 16 }}>
                    <p style={{ margin: 0, fontWeight: 500 }}>Điểm P1: <span style={{ color: "#2563eb" }}>{scores[0]}</span></p>
                    <p style={{ margin: 0, fontWeight: 500 }}>Điểm P2: <span style={{ color: "#2563eb" }}>{scores[1]}</span></p>
                  </div>
                  <p style={{ marginBottom: 16, fontSize: "0.95rem" }}>Tổng số từ hợp lệ: <strong>{words.filter(w => w.valid).length - 1}</strong></p>
                  <div style={{ padding: "12px 16px", backgroundColor: "#fee2e2", borderLeft: "4px solid #ef4444", borderRadius: "0 4px 4px 0", marginBottom: 20, textAlign: "left" }}>
                    <strong style={{ display: "block", color: "#991b1b", marginBottom: 4, fontSize: "0.9rem" }}>Nguyên nhân:</strong>
                    <span style={{ fontSize: "0.95rem", color: "#7f1d1d" }}>
                      {comments[comments.length - 1]?.text || "Đã phân định thắng bại."}
                    </span>
                  </div>
                  <button onClick={handleReset} style={{ padding: "8px 16px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 500, transition: "background-color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1d4ed8"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}>
                    Khởi tạo lại dữ liệu
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="auto-save-indicator">
            <Check size={12} /><span>Auto-saved</span>
          </div>
        </div>

        <ChatSidebar 
          comments={comments} 
          visible={showSidebar && !bossKeyActive} 
          onSendChat={handleSendChat}
          playerName={playerName}
        />
      </div>

      {/* Status bar */}
      <div className="docs-statusbar">
        <span>Keywords: {words.filter(w => w.valid).length - 1} hợp lệ</span>
        <span className="statusbar-divider">|</span>
        <span>Lượt: Người chơi {currentTurn}</span>
        <span className="statusbar-divider">|</span>
        <span>Revision: {comments.length} notes</span>
      </div>

      {/* Rules Modal */}
      <GameRules gameType="wordchain" isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}
