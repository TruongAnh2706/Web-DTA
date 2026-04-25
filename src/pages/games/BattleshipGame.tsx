import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Shield, Wifi, Server, Activity, AlertTriangle,
  CheckCircle, XCircle, RotateCcw, Zap
} from "lucide-react";

/* ═══════════════════════════════════════════
   BATTLESHIP — Network Diagnostics Dashboard
   Stealth Game: Bắn Tàu ngụy trang kiểm tra mạng
   ═══════════════════════════════════════════ */

const GRID_SIZE = 10;
const SHIPS = [
  { name: "Main Server", size: 4 },
  { name: "Database Node", size: 3 },
  { name: "Cache Layer", size: 3 },
  { name: "Auth Service", size: 2 },
  { name: "CDN Edge", size: 2 },
];

// Cell states: 0 = empty, 1 = ship, 2 = miss, 3 = hit
type CellState = 0 | 1 | 2 | 3;
type Board = CellState[][];
type Phase = "setup" | "playing" | "gameover";

// ── Helpers ──
function createEmptyBoard(): Board {
  return Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(0)
  );
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

// ── Boss Key: hiển thị JSON giả ──
const FAKE_API_DOC = `{
  "openapi": "3.0.1",
  "info": {
    "title": "DTA Internal API",
    "version": "2.4.1",
    "description": "Internal network diagnostics API documentation"
  },
  "servers": [
    { "url": "https://api.internal.dta-studio.io/v2" }
  ],
  "paths": {
    "/nodes/health": {
      "get": {
        "summary": "Check node health status",
        "parameters": [
          { "name": "cluster_id", "in": "query", "required": true }
        ],
        "responses": {
          "200": { "description": "Node is healthy" },
          "500": { "description": "Node timeout conflict" }
        }
      }
    },
    "/diagnostics/ping": {
      "post": {
        "summary": "Execute diagnostic ping",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "properties": {
                  "target_ip": { "type": "string" },
                  "port": { "type": "integer" },
                  "timeout_ms": { "type": "integer", "default": 5000 }
                }
              }
            }
          }
        }
      }
    }
  }
}`;

// ── Component: Grid Cell ──
function NodeCell({
  state,
  isPlayerBoard,
  onClick,
  row,
  col,
  isHovering,
}: {
  state: CellState;
  isPlayerBoard: boolean;
  onClick: () => void;
  row: number;
  col: number;
  isHovering?: boolean;
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
    isHovering && "hovering",
    !isPlayerBoard && state === 0 && "clickable",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={cellClass}
      onClick={onClick}
      disabled={isPlayerBoard || state === 2 || state === 3}
      title={`${getIP(row)}:${col + 1}`}
    >
      {getContent()}
    </button>
  );
}

// ── Component: Diagnostic Board ──
function DiagnosticBoard({
  title,
  board,
  isPlayerBoard,
  onCellClick,
  disabled,
}: {
  title: string;
  board: Board;
  isPlayerBoard: boolean;
  onCellClick: (row: number, col: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="diagnostic-panel">
      <div className="panel-header">
        <Shield size={16} />
        <span>{title}</span>
        <div className={`panel-status ${disabled ? "offline" : "online"}`}>
          <Activity size={12} />
          <span>{disabled ? "Standby" : "Active"}</span>
        </div>
      </div>

      <div className="grid-container">
        {/* Column headers (Ports) */}
        <div className="grid-header">
          <div className="grid-corner" />
          {Array.from({ length: GRID_SIZE }, (_, i) => (
            <div key={i} className="grid-col-label">
              P{i + 1}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        {board.map((row, r) => (
          <div key={r} className="grid-row">
            <div className="grid-row-label">{getIP(r)}</div>
            {row.map((cell, c) => (
              <NodeCell
                key={c}
                state={cell}
                isPlayerBoard={isPlayerBoard}
                onClick={() => !disabled && onCellClick(r, c)}
                row={r}
                col={c}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Component: Console Log ──
function ConsoleLog({ logs }: { logs: string[] }) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="console-log">
      <div className="console-header">
        <Activity size={14} />
        <span>System Diagnostics Log</span>
        <span className="console-count">{logs.length} entries</span>
      </div>
      <div className="console-body" ref={logRef}>
        {logs.length === 0 ? (
          <div className="console-empty">
            {">"} Awaiting diagnostic commands...
          </div>
        ) : (
          logs.map((log, i) => (
            <div
              key={i}
              className={`console-line ${
                log.includes("ERROR") || log.includes("CRITICAL")
                  ? "error"
                  : log.includes("OK")
                  ? "success"
                  : ""
              }`}
            >
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//  MAIN GAME COMPONENT
// ══════════════════════════════════════════
export default function BattleshipGame() {
  const navigate = useNavigate();

  // ── State ──
  const [phase, setPhase] = useState<Phase>("setup");
  const [playerBoard, setPlayerBoard] = useState<Board>(randomPlaceShips);
  const [enemyBoard, setEnemyBoard] = useState<Board>(randomPlaceShips);
  const [playerView, setPlayerView] = useState<Board>(createEmptyBoard);
  const [logs, setLogs] = useState<string[]>([
    `> [${new Date().toLocaleTimeString()}] System initialized. Diagnostic protocol ready.`,
    `> [${new Date().toLocaleTimeString()}] Local cluster mapped. ${countShipCells(randomPlaceShips())} active nodes detected.`,
  ]);
  const [playerHits, setPlayerHits] = useState(0);
  const [enemyHits, setEnemyHits] = useState(0);
  const [bossKeyActive, setBossKeyActive] = useState(false);
  const [turn, setTurn] = useState<"player" | "enemy">("player");

  const totalShipCells = SHIPS.reduce((sum, s) => sum + s.size, 0);

  // ── Boss Key listener ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" || (e.ctrlKey && e.code === "Space")) {
        e.preventDefault();
        setBossKeyActive((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── AI Turn ──
  const aiMove = useCallback(() => {
    setTimeout(() => {
      let r: number, c: number;
      do {
        r = Math.floor(Math.random() * GRID_SIZE);
        c = Math.floor(Math.random() * GRID_SIZE);
      } while (playerBoard[r][c] === 2 || playerBoard[r][c] === 3);

      const time = new Date().toLocaleTimeString();
      const ip = getIP(r);

      setPlayerBoard((prev) => {
        const nb = prev.map((row) => [...row]);
        if (nb[r][c] === 1) {
          nb[r][c] = 3;
          setEnemyHits((h) => {
            const newHits = h + 1;
            if (newHits >= totalShipCells) {
              setPhase("gameover");
              setLogs((l) => [
                ...l,
                `> [${time}] [CRITICAL] All local nodes compromised. System lockdown initiated.`,
              ]);
            }
            return newHits;
          });
          setLogs((l) => [
            ...l,
            `> [${time}] [ALERT] Incoming probe on ${ip}:${c + 1} — [NODE COMPROMISED]`,
          ]);
        } else {
          nb[r][c] = 2;
          setLogs((l) => [
            ...l,
            `> [${time}] Incoming probe on ${ip}:${c + 1} — Firewall deflected.`,
          ]);
        }
        return nb;
      });
      setTurn("player");
    }, 600 + Math.random() * 800);
  }, [playerBoard, totalShipCells]);

  // ── Player Attack ──
  const handlePlayerAttack = useCallback(
    (row: number, col: number) => {
      if (phase !== "playing" || turn !== "player") return;

      const view = playerView.map((r) => [...r]);
      const time = new Date().toLocaleTimeString();
      const ip = getIP(row);
      const ms = Math.floor(Math.random() * 50 + 5);

      if (enemyBoard[row][col] === 1) {
        view[row][col] = 3;
        setPlayerHits((h) => {
          const newHits = h + 1;
          if (newHits >= totalShipCells) {
            setPhase("gameover");
            setLogs((l) => [
              ...l,
              `> [${time}] EXEC PING ${ip}:${col + 1}: [TIME OUT - CRITICAL HIT]`,
              `> [${time}] [SUCCESS] All remote nodes neutralized. Diagnostic complete.`,
            ]);
          } else {
            setLogs((l) => [
              ...l,
              `> [${time}] EXEC PING ${ip}:${col + 1}: [TIME OUT - CRITICAL HIT]`,
            ]);
          }
          return newHits;
        });
      } else {
        view[row][col] = 2;
        setLogs((l) => [
          ...l,
          `> [${time}] EXEC PING ${ip}:${col + 1}: [OK] responded in ${ms}ms`,
        ]);
      }

      setPlayerView(view);
      setTurn("enemy");

      // Trigger AI move
      if (phase === "playing") {
        aiMove();
      }
    },
    [phase, turn, playerView, enemyBoard, totalShipCells, aiMove]
  );

  // ── Reset Game ──
  const handleReset = () => {
    const newPlayerBoard = randomPlaceShips();
    setPlayerBoard(newPlayerBoard);
    setEnemyBoard(randomPlaceShips());
    setPlayerView(createEmptyBoard());
    setPlayerHits(0);
    setEnemyHits(0);
    setPhase("setup");
    setTurn("player");
    setLogs([
      `> [${new Date().toLocaleTimeString()}] System re-initialized. All diagnostics reset.`,
    ]);
  };

  // ── Boss Key Screen ──
  if (bossKeyActive) {
    return (
      <div className="boss-key-screen">
        <div className="boss-key-header">
          <span className="boss-key-title">
            api-docs.json — DTA Internal API Documentation
          </span>
          <span className="boss-key-hint">
            Press Esc to return to diagnostics
          </span>
        </div>
        <pre className="boss-key-code">{FAKE_API_DOC}</pre>
      </div>
    );
  }

  return (
    <div className="battleship-container">
      {/* Top bar */}
      <div className="battleship-topbar">
        <button
          className="back-btn"
          onClick={() => navigate("/workspace")}
        >
          <ArrowLeft size={18} />
          <span>DTA Workspace</span>
        </button>
        <h1 className="battleship-title">
          <Wifi size={18} />
          Network Diagnostics Dashboard
        </h1>
        <div className="battleship-actions">
          <button className="reset-btn" onClick={handleReset}>
            <RotateCcw size={16} />
            <span>Reset Nodes</span>
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className="battleship-status">
        <div className="status-item">
          <CheckCircle size={14} className="text-green-400" />
          <span>Remote Neutralized: {playerHits}/{totalShipCells}</span>
        </div>
        <div className="status-item phase-indicator">
          <Zap size={14} />
          <span>
            {phase === "setup"
              ? "Chế độ: Đang cấu hình cluster..."
              : phase === "gameover"
              ? playerHits >= totalShipCells
                ? "✅ Diagnostic Complete — All nodes resolved"
                : "❌ System Compromised — Lockdown active"
              : turn === "player"
              ? "Trạng thái: Chờ lệnh Ping..."
              : "Trạng thái: Đang xử lý phản hồi..."}
          </span>
        </div>
        <div className="status-item">
          <AlertTriangle size={14} className="text-red-400" />
          <span>Local Compromised: {enemyHits}/{totalShipCells}</span>
        </div>
      </div>

      {/* Setup overlay */}
      {phase === "setup" && (
        <div className="setup-overlay">
          <div className="setup-card">
            <Server size={32} className="setup-icon" />
            <h2>Khởi tạo Cluster Diagnostics</h2>
            <p>Hệ thống đã tự động phân bổ các Node trên lưới. Nhấn nút bên dưới để bắt đầu quá trình quét.</p>
            <button
              className="start-btn"
              onClick={() => {
                setPhase("playing");
                setLogs((l) => [
                  ...l,
                  `> [${new Date().toLocaleTimeString()}] Diagnostic scan initiated. Targeting remote cluster.`,
                ]);
              }}
            >
              <Zap size={18} />
              <span>Bắt đầu quét hệ thống</span>
            </button>
          </div>
        </div>
      )}

      {/* Game boards */}
      <div className="battleship-boards">
        <DiagnosticBoard
          title="Local Cluster Status"
          board={playerBoard}
          isPlayerBoard={true}
          onCellClick={() => {}}
          disabled={true}
        />
        <DiagnosticBoard
          title="Remote Target Diagnostics"
          board={playerView}
          isPlayerBoard={false}
          onCellClick={handlePlayerAttack}
          disabled={phase !== "playing" || turn !== "player"}
        />
      </div>

      {/* Console log */}
      <ConsoleLog logs={logs} />

      {/* Game over overlay */}
      {phase === "gameover" && (
        <div className="gameover-overlay">
          <div className="gameover-card">
            {playerHits >= totalShipCells ? (
              <>
                <CheckCircle size={40} className="text-green-400" />
                <h2>Diagnostic Complete</h2>
                <p>Toàn bộ Remote Nodes đã được xác định và vô hiệu hóa.</p>
              </>
            ) : (
              <>
                <XCircle size={40} className="text-red-400" />
                <h2>System Lockdown</h2>
                <p>Local cluster đã bị xâm phạm hoàn toàn.</p>
              </>
            )}
            <button className="reset-btn large" onClick={handleReset}>
              <RotateCcw size={18} />
              <span>Khởi tạo lại hệ thống</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
