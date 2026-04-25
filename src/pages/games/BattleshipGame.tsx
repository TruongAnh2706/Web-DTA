import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Shield, Wifi, Server, Activity, AlertTriangle,
  CheckCircle, XCircle, RotateCcw, Zap, RotateCw
} from "lucide-react";
import { GameLobby } from "@/components/games/GameLobby";
import { useGameRoom } from "@/hooks/useGameRoom";
import { GameTimer } from "@/components/games/GameTimer";
import { GameRules } from "@/components/games/GameRules";
import { toast } from "sonner";

/* ═══════════════════════════════════════════
   BATTLESHIP — Network Diagnostics Dashboard
   Stealth Game: Bắn Tàu ngụy trang kiểm tra mạng
   ═══════════════════════════════════════════ */

const GRID_SIZE = 10;
const TURN_DURATION = 30; // 30s per turn
const SHIPS = [
  { id: 1, name: "Main Server", size: 4 },
  { id: 2, name: "Database Node", size: 3 },
  { id: 3, name: "Cache Layer", size: 3 },
  { id: 4, name: "Auth Service", size: 2 },
  { id: 5, name: "CDN Edge", size: 2 },
];

// Cell states: 0 = empty, 1 = ship, 2 = miss, 3 = hit
type CellState = 0 | 1 | 2 | 3;
type Board = CellState[][];
type Phase = "lobby" | "setup" | "waiting" | "playing" | "gameover";

// ── Helpers ──
function createEmptyBoard(): Board {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

function canPlaceShip(
  board: Board,
  row: number,
  col: number,
  size: number,
  horizontal: boolean
): boolean {
  for (let i = 0; i < size; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;
    if (r >= GRID_SIZE || c >= GRID_SIZE) return false;
    if (board[r][c] !== 0) return false;
  }
  return true;
}

function placeShipOnBoard(
  board: Board,
  row: number,
  col: number,
  size: number,
  horizontal: boolean
): Board {
  const newBoard = board.map((r) => [...r]);
  for (let i = 0; i < size; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;
    newBoard[r][c] = 1;
  }
  return newBoard;
}

function randomPlaceShips(): Board {
  let board = createEmptyBoard();
  for (const ship of SHIPS) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 200) {
      const horizontal = Math.random() > 0.5;
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      if (canPlaceShip(board, row, col, ship.size, horizontal)) {
        board = placeShipOnBoard(board, row, col, ship.size, horizontal);
        placed = true;
      }
      attempts++;
    }
  }
  return board;
}

function countShipCells(board: Board): number {
  return board.flat().filter((c) => c === 1).length;
}

function getIP(row: number): string {
  return `192.168.1.${row + 1}`;
}

const FAKE_API_DOC = `{
  "openapi": "3.0.1",
  "info": {
    "title": "DTA Internal API",
    "version": "2.4.1"
  },
  "servers": [ { "url": "https://api.internal.dta-studio.io/v2" } ]
}`;

// ── Component: Grid Cell ──
function NodeCell({
  state,
  isPlayerBoard,
  onClick,
  row,
  col,
  isHovering,
  isValidHover,
  onMouseEnter
}: {
  state: CellState;
  isPlayerBoard: boolean;
  onClick: () => void;
  row: number;
  col: number;
  isHovering?: boolean;
  isValidHover?: boolean;
  onMouseEnter?: () => void;
}) {
  const getContent = () => {
    if (state === 2) return <span className="cell-miss">200</span>;
    if (state === 3) return <span className="cell-hit">500</span>;
    if (state === 1 && isPlayerBoard)
      return <Server size={12} className="cell-ship-icon" />;
    return null;
  };

  const cellClass = [
    "node-cell",
    state === 2 && "miss",
    state === 3 && "hit",
    state === 1 && isPlayerBoard && "has-ship",
    isHovering && (isValidHover ? "hovering-valid" : "hovering-invalid"),
    !isPlayerBoard && state === 0 && "clickable",
  ].filter(Boolean).join(" ");

  return (
    <button
      className={cellClass}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      disabled={(!isPlayerBoard && (state === 2 || state === 3))}
      title={`${getIP(row)}:${col + 1}`}
    >
      {getContent()}
    </button>
  );
}

// ── Component: Console Log ──
function ConsoleLog({ logs }: { logs: string[] }) {
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  return (
    <div className="console-log">
      <div className="console-header">
        <Activity size={14} />
        <span>System Diagnostics Log</span>
        <span className="console-count">{logs.length} entries</span>
      </div>
      <div className="console-body" ref={logRef}>
        {logs.map((log, i) => (
          <div key={i} className={`console-line ${log.includes("CRITICAL") || log.includes("COMPROMISED") || log.includes("ERROR") ? "error" : log.includes("OK") || log.includes("SUCCESS") ? "success" : ""}`}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════
export default function BattleshipGame() {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>("lobby");
  const [playerBoard, setPlayerBoard] = useState<Board>(createEmptyBoard());
  const [enemyBoard, setEnemyBoard] = useState<Board>(createEmptyBoard());
  const [playerView, setPlayerView] = useState<Board>(createEmptyBoard());
  
  const [logs, setLogs] = useState<string[]>([]);
  const [playerHits, setPlayerHits] = useState(0);
  const [enemyHits, setEnemyHits] = useState(0);
  const [bossKeyActive, setBossKeyActive] = useState(false);
  
  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1);
  const [timerRunning, setTimerRunning] = useState(false);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [showRules, setShowRules] = useState(false);

  // Setup phase states
  const [availableShips, setAvailableShips] = useState(SHIPS);
  const [selectedShipIndex, setSelectedShipIndex] = useState(0);
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [hoverPos, setHoverPos] = useState<{r: number, c: number} | null>(null);
  const [enemyReady, setEnemyReady] = useState(false);

  const totalShipCells = SHIPS.reduce((sum, s) => sum + s.size, 0);
  const playerName = localStorage.getItem("dta-player-name") || "Player";

  // Multiplayer Hook
  const gameRoom = useGameRoom({ name: playerName }, {
    onGameEvent: (event) => {
      if (event.type === "game-start") {
        setPhase("setup");
        setPlayerBoard(createEmptyBoard());
        setAvailableShips(SHIPS);
        setSelectedShipIndex(0);
        setLogs([`> [${new Date().toLocaleTimeString()}] Diagnostic protocol initialized. Please deploy your nodes.`]);
      }
      if (event.type === "battleship-ready") {
        setEnemyBoard(event.payload.board);
        setEnemyReady(true);
      }
      if (event.type === "battleship-attack") {
        handleRemoteAttack(event.payload.row, event.payload.col);
      }
      if (event.type === "timeout") {
        handleRemoteTimeout();
      }
    }
  });

  const isMultiplayer = gameRoom.roomId !== null;
  const myPlayerNum = gameRoom.isHost ? 1 : 2;
  const isMyTurn = currentTurn === myPlayerNum;

  useEffect(() => {
    if (phase === "waiting" && enemyReady) {
      setPhase("playing");
      setLogs(l => [...l, `> [${new Date().toLocaleTimeString()}] Both clusters ready. Commencing diagnostics.`]);
      setCurrentTurn(1);
      setTimerRunning(true);
    }
  }, [phase, enemyReady]);

  // Boss Key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); setBossKeyActive(p => !p); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleStartMultiplayer = useCallback(() => {
    gameRoom.sendGameEvent("game-start", {});
    gameRoom.startGame();
    setPhase("setup");
    setPlayerBoard(createEmptyBoard());
    setAvailableShips(SHIPS);
    setSelectedShipIndex(0);
    setLogs([`> [${new Date().toLocaleTimeString()}] Diagnostic protocol initialized. Please deploy your nodes.`]);
  }, [gameRoom]);

  // Setup Phase: Hover and Place
  const handleSetupHover = (r: number, c: number) => setHoverPos({ r, c });
  const handleSetupLeave = () => setHoverPos(null);
  
  const handleSetupClick = (r: number, c: number) => {
    if (phase !== "setup" || availableShips.length === 0) return;
    const ship = availableShips[selectedShipIndex];
    if (canPlaceShip(playerBoard, r, c, ship.size, isHorizontal)) {
      setPlayerBoard(prev => placeShipOnBoard(prev, r, c, ship.size, isHorizontal));
      const newAvail = availableShips.filter((_, i) => i !== selectedShipIndex);
      setAvailableShips(newAvail);
      setSelectedShipIndex(0);
    } else {
      toast.error("Không thể đặt Node tại vị trí này!");
    }
  };

  const handleAutoDeploy = () => {
    setPlayerBoard(randomPlaceShips());
    setAvailableShips([]);
  };

  const handleDeployReady = () => {
    setPhase("waiting");
    if (isMultiplayer) {
      gameRoom.sendGameEvent("battleship-ready", { board: playerBoard });
    } else {
      // Offline fallback: set enemy ready immediately with random board
      setEnemyBoard(randomPlaceShips());
      setEnemyReady(true);
    }
    setLogs(l => [...l, `> [${new Date().toLocaleTimeString()}] Local nodes deployed. Waiting for remote cluster...`]);
  };

  // Attack Phase
  const handleRemoteAttack = useCallback((row: number, col: number) => {
    const time = new Date().toLocaleTimeString();
    const ip = getIP(row);
    setPlayerBoard((prev) => {
      const nb = prev.map(r => [...r]);
      if (nb[row][col] === 1) {
        nb[row][col] = 3;
        setEnemyHits(h => {
          const newHits = h + 1;
          if (newHits >= totalShipCells) {
             setPhase("gameover");
             setWinner(myPlayerNum === 1 ? 2 : 1);
             setTimerRunning(false);
             setLogs(l => [...l, `> [${time}] [CRITICAL] All local nodes compromised. System lockdown initiated.`]);
          }
          return newHits;
        });
        setLogs(l => [...l, `> [${time}] [ALERT] Incoming probe on ${ip}:${col + 1} — [NODE COMPROMISED]`]);
      } else {
        nb[row][col] = 2;
        setLogs(l => [...l, `> [${time}] Incoming probe on ${ip}:${col + 1} — Firewall deflected.`]);
      }
      return nb;
    });
    setCurrentTurn(myPlayerNum);
    setTimerRunning(true);
  }, [myPlayerNum, totalShipCells]);

  const handlePlayerAttack = useCallback((row: number, col: number) => {
    if (phase !== "playing" || !isMyTurn) return;
    
    // Prevent clicking already hit/missed cells
    if (playerView[row][col] !== 0) return;

    const time = new Date().toLocaleTimeString();
    const ip = getIP(row);
    const ms = Math.floor(Math.random() * 50 + 5);

    const view = playerView.map(r => [...r]);

    if (enemyBoard[row][col] === 1) {
      view[row][col] = 3;
      setPlayerHits(h => {
        const newHits = h + 1;
        if (newHits >= totalShipCells) {
          setPhase("gameover");
          setWinner(myPlayerNum);
          setTimerRunning(false);
          setLogs(l => [...l, `> [${time}] [SUCCESS] All remote nodes neutralized. Diagnostic complete.`]);
        }
        return newHits;
      });
      setLogs(l => [...l, `> [${time}] EXEC PING ${ip}:${col + 1}: [TIME OUT - CRITICAL HIT]`]);
    } else {
      view[row][col] = 2;
      setLogs(l => [...l, `> [${time}] EXEC PING ${ip}:${col + 1}: [OK] responded in ${ms}ms`]);
    }

    setPlayerView(view);
    if (isMultiplayer) {
      gameRoom.sendGameEvent("battleship-attack", { row, col });
    }
    
    // Switch turn
    setCurrentTurn(myPlayerNum === 1 ? 2 : 1);
    setTimerRunning(true);

    // If offline, trigger simple AI
    if (!isMultiplayer && phase === "playing") {
      setTimeout(() => {
        let r, c;
        do {
          r = Math.floor(Math.random() * GRID_SIZE);
          c = Math.floor(Math.random() * GRID_SIZE);
        } while (playerBoard[r][c] === 2 || playerBoard[r][c] === 3);
        handleRemoteAttack(r, c);
      }, 1000);
    }
  }, [phase, isMyTurn, playerView, enemyBoard, myPlayerNum, totalShipCells, gameRoom, isMultiplayer, playerBoard, handleRemoteAttack]);

  // Timeout Handling
  const handleTimeout = useCallback(() => {
    if (!isMyTurn) return;
    const time = new Date().toLocaleTimeString();
    setLogs(l => [...l, `> [${time}] [ERROR] Response Timeout. Connection lost.`]);
    if (isMultiplayer) {
      gameRoom.sendGameEvent("timeout", {});
    }
    setWinner(myPlayerNum === 1 ? 2 : 1);
    setPhase("gameover");
    setTimerRunning(false);
    toast.error("Hết giờ! Bạn đã thua.");
  }, [isMyTurn, myPlayerNum, gameRoom, isMultiplayer]);

  const handleRemoteTimeout = useCallback(() => {
    const time = new Date().toLocaleTimeString();
    setLogs(l => [...l, `> [${time}] [SUCCESS] Remote timeout detected. You win.`]);
    setWinner(myPlayerNum);
    setPhase("gameover");
    setTimerRunning(false);
    toast.success("Đối thủ hết thời gian. Bạn thắng!");
  }, [myPlayerNum]);

  // Reset/Restart
  const handleReset = () => {
    setPhase("lobby");
    setPlayerBoard(createEmptyBoard());
    setEnemyBoard(createEmptyBoard());
    setPlayerView(createEmptyBoard());
    setPlayerHits(0);
    setEnemyHits(0);
    setWinner(null);
    setEnemyReady(false);
    if (isMultiplayer) {
      gameRoom.leaveRoom();
    }
  };

  const handlePlayOffline = () => {
    setPhase("setup");
    setPlayerBoard(createEmptyBoard());
    setAvailableShips(SHIPS);
    setSelectedShipIndex(0);
    setLogs([`> [${new Date().toLocaleTimeString()}] Offline Diagnostic protocol initialized. Please deploy your nodes.`]);
  };

  if (bossKeyActive) {
    return (
      <div className="boss-key-screen" style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 20, fontFamily: 'monospace', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ color: '#569cd6' }}>api-docs.json — DTA Internal API Documentation</h3>
        <pre>{FAKE_API_DOC}</pre>
      </div>
    );
  }

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
          onPlayOffline={handlePlayOffline}
          title="Network Diagnostics Node (Battleship)"
        />
        <GameRules gameType="battleship" isOpen={showRules} onClose={() => setShowRules(false)} />
      </>
    );
  }

  return (
    <div className="battleship-container">
      {/* Top bar */}
      <div className="battleship-topbar">
        <button className="back-btn" onClick={() => navigate("/workspace")}>
          <ArrowLeft size={18} /><span>DTA Workspace</span>
        </button>
        <h1 className="battleship-title"><Wifi size={18} /> Network Diagnostics Dashboard</h1>
        <button className="toolbar-btn" onClick={() => setShowRules(true)}>
          <span style={{ fontSize: 12 }}>?</span>
        </button>
      </div>

      {/* Turn Bar */}
      {(phase === "playing" || phase === "waiting" || phase === "setup") && (
        <div className="caro-turn-bar" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 15, background: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="turn-info" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={14} />
            <span style={{ color: phase === "playing" ? (isMyTurn ? '#4caf50' : 'var(--text-secondary)') : '#3b82f6', fontWeight: 500 }}>
              {phase === "setup" ? "🟢 Giai đoạn: Thiết lập mạng lưới (Setup Nodes)" : 
               phase === "waiting" ? "⏳ Đang chờ đối thủ cấu hình..." :
               isMyTurn ? `🟢 Lượt của bạn (Khởi chạy Ping)` : `⏳ Đang chờ Node đối thủ phản hồi...`}
            </span>
          </div>
          {phase === "playing" && (
            <div className="turn-timer-wrapper" style={{ width: 200 }}>
              <GameTimer
                duration={TURN_DURATION}
                isRunning={timerRunning}
                onTimeout={handleTimeout}
                label="Timeout"
                className="light"
                key={currentTurn}
              />
            </div>
          )}
        </div>
      )}

      {/* Setup UI */}
      {phase === "setup" && (
        <div className="setup-controls" style={{ padding: '20px', display: 'flex', gap: '20px', background: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ flex: 1 }}>
            <h3>Chọn thiết bị (Nodes) để đặt lên lưới:</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
              {availableShips.map((ship, idx) => (
                <button 
                  key={ship.id} 
                  style={{ padding: '8px 12px', background: selectedShipIndex === idx ? '#3b82f6' : '#f1f5f9', color: selectedShipIndex === idx ? '#fff' : '#334155', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer' }}
                  onClick={() => setSelectedShipIndex(idx)}
                >
                  {ship.name} (Kích thước: {ship.size})
                </button>
              ))}
              {availableShips.length === 0 && <span style={{ color: '#10b981', fontWeight: 'bold' }}>Tất cả Nodes đã được thiết lập!</span>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button 
              className="lobby-btn secondary"
              onClick={() => setIsHorizontal(!isHorizontal)}
              disabled={availableShips.length === 0}
            >
              <RotateCw size={16} /> Đổi chiều ({isHorizontal ? "Ngang" : "Dọc"})
            </button>
            <button className="lobby-btn outline" onClick={handleAutoDeploy} disabled={availableShips.length === 0}>
              <Zap size={16} /> Xếp tự động
            </button>
            <button 
              className="lobby-btn primary"
              onClick={handleDeployReady}
              disabled={availableShips.length > 0}
            >
              <CheckCircle size={16} /> Hoàn tất & Sẵn sàng
            </button>
          </div>
        </div>
      )}

      <div className="battleship-boards" style={{ marginTop: 20 }}>
        {/* Bản đồ của mình */}
        <div className="diagnostic-panel">
          <div className="panel-header">
            <Shield size={16} /><span>Local Cluster Status</span>
          </div>
          <div className="grid-container" onMouseLeave={handleSetupLeave}>
            <div className="grid-header">
              <div className="grid-corner" />
              {Array.from({ length: GRID_SIZE }, (_, i) => <div key={i} className="grid-col-label">P{i + 1}</div>)}
            </div>
            {playerBoard.map((row, r) => (
              <div key={r} className="grid-row">
                <div className="grid-row-label">{getIP(r)}</div>
                {row.map((cell, c) => {
                  let isHovering = false;
                  let isValidHover = false;
                  if (phase === "setup" && hoverPos && availableShips.length > 0) {
                    const size = availableShips[selectedShipIndex].size;
                    if (isHorizontal) {
                      if (r === hoverPos.r && c >= hoverPos.c && c < hoverPos.c + size) isHovering = true;
                    } else {
                      if (c === hoverPos.c && r >= hoverPos.r && r < hoverPos.r + size) isHovering = true;
                    }
                    if (isHovering) {
                      isValidHover = canPlaceShip(playerBoard, hoverPos.r, hoverPos.c, size, isHorizontal);
                    }
                  }
                  return (
                    <NodeCell
                      key={c} state={cell} isPlayerBoard={true} row={r} col={c}
                      onClick={() => handleSetupClick(r, c)}
                      onMouseEnter={() => handleSetupHover(r, c)}
                      isHovering={isHovering} isValidHover={isValidHover}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Bản đồ đối thủ (Chỉ hiển thị khi đang chơi) */}
        {(phase === "playing" || phase === "gameover" || phase === "waiting") && (
          <div className="diagnostic-panel">
            <div className="panel-header">
              <Activity size={16} /><span>Remote Target Diagnostics</span>
              <div className={`panel-status ${phase !== "playing" ? "offline" : "online"}`}>
                <span>{phase !== "playing" ? "Standby" : "Active"}</span>
              </div>
            </div>
            <div className="grid-container">
              <div className="grid-header">
                <div className="grid-corner" />
                {Array.from({ length: GRID_SIZE }, (_, i) => <div key={i} className="grid-col-label">P{i + 1}</div>)}
              </div>
              {playerView.map((row, r) => (
                <div key={r} className="grid-row">
                  <div className="grid-row-label">{getIP(r)}</div>
                  {row.map((cell, c) => (
                    <NodeCell
                      key={c} state={cell} isPlayerBoard={false} row={r} col={c}
                      onClick={() => handlePlayerAttack(r, c)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConsoleLog logs={logs} />

      {phase === "gameover" && (
        <div className="gameover-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="gameover-card" style={{ background: '#fff', padding: 40, borderRadius: 8, textAlign: 'center', maxWidth: 400 }}>
            {winner === myPlayerNum ? (
              <>
                <CheckCircle size={40} color="#10b981" style={{ margin: '0 auto 20px' }} />
                <h2 style={{ color: '#10b981', marginBottom: 10 }}>Diagnostic Complete</h2>
                <p style={{ color: '#475569', marginBottom: 20 }}>Toàn bộ Remote Nodes đã được vô hiệu hóa. Bạn là người chiến thắng!</p>
              </>
            ) : (
              <>
                <XCircle size={40} color="#ef4444" style={{ margin: '0 auto 20px' }} />
                <h2 style={{ color: '#ef4444', marginBottom: 10 }}>System Lockdown</h2>
                <p style={{ color: '#475569', marginBottom: 20 }}>Local cluster đã bị xâm phạm hoàn toàn. Bạn đã thua cuộc.</p>
              </>
            )}
            <button className="lobby-btn primary" onClick={handleReset} style={{ margin: '0 auto' }}>
              <RotateCcw size={16} /> Quay lại sảnh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
