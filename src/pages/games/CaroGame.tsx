import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Bold, Italic, Underline, AlignLeft, AlignCenter,
  AlignRight, BarChart3, Palette, RotateCcw, Type, Undo, Redo,
  Printer, Download, Grid3X3, User
} from "lucide-react";
import { GameRules } from "@/components/games/GameRules";
import { GameTimer } from "@/components/games/GameTimer";
import { GameLobby } from "@/components/games/GameLobby";
import { useGameRoom } from "@/hooks/useGameRoom";
import { toast } from "sonner";

/* ═══════════════════════════════════════════
   CỜ CARO (GOMOKU) — DTA Sheets
   Stealth Game: Cờ Caro ngụy trang Google Sheets
   ═══════════════════════════════════════════ */

const GRID_SIZE = 15;
const WIN_LENGTH = 5;

type Player = 1 | 2;
type CellValue = 0 | 1 | 2;
type Board = CellValue[][];

// ── Helpers ──
function createEmptyBoard(): Board {
  return Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(0)
  );
}

function getColLabel(col: number): string {
  return String.fromCharCode(65 + col);
}

function checkWin(board: Board, row: number, col: number, player: Player): boolean {
  const directions = [
    [0, 1],   // ngang
    [1, 0],   // dọc
    [1, 1],   // chéo phải
    [1, -1],  // chéo trái
  ];

  for (const [dr, dc] of directions) {
    let count = 1;
    // Đếm tiến
    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) break;
      if (board[r][c] !== player) break;
      count++;
    }
    // Đếm lùi
    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) break;
      if (board[r][c] !== player) break;
      count++;
    }
    if (count >= WIN_LENGTH) return true;
  }
  return false;
}

// ── Boss Key: Bảng tài chính giả ──
const FINANCE_DATA = [
  ["Hạng mục", "Q1/2026", "Q2/2026", "Biến động", "KPI"],
  ["Doanh thu thuần", "2.450.000", "3.120.000", "+27.3%", "Đạt"],
  ["Chi phí vận hành", "890.000", "945.000", "+6.2%", "Tốt"],
  ["Lợi nhuận gộp", "1.560.000", "2.175.000", "+39.4%", "Vượt"],
  ["Marketing", "320.000", "410.000", "+28.1%", "Đạt"],
  ["R&D Investment", "450.000", "520.000", "+15.6%", "Tốt"],
  ["Nhân sự", "680.000", "720.000", "+5.9%", "Đạt"],
  ["Chi phí khác", "110.000", "95.000", "-13.6%", "Tốt"],
  ["EBITDA", "980.000", "1.455.000", "+48.5%", "Vượt"],
  ["Biên lợi nhuận", "40.0%", "46.6%", "+6.6pp", "Vượt"],
  ["Cash Flow", "1.230.000", "1.680.000", "+36.6%", "Đạt"],
  ["Vốn chủ sở hữu", "5.800.000", "6.420.000", "+10.7%", "Tốt"],
  ["ROE", "16.9%", "22.7%", "+5.8pp", "Vượt"],
  ["Nợ phải trả", "1.200.000", "1.050.000", "-12.5%", "Tốt"],
];

// ── Component: Sheet Toolbar ──
function SheetToolbar() {
  return (
    <div className="sheet-toolbar">
      <div className="toolbar-group">
        <button className="toolbar-btn" title="Hoàn tác"><Undo size={16} /></button>
        <button className="toolbar-btn" title="Làm lại"><Redo size={16} /></button>
        <button className="toolbar-btn" title="In"><Printer size={16} /></button>
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-group">
        <select className="toolbar-select">
          <option>Roboto Mono</option>
          <option>Consolas</option>
          <option>Arial</option>
        </select>
        <select className="toolbar-select narrow">
          <option>10</option>
          <option>11</option>
          <option>12</option>
        </select>
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-group">
        <button className="toolbar-btn" title="In đậm"><Bold size={16} /></button>
        <button className="toolbar-btn" title="In nghiêng"><Italic size={16} /></button>
        <button className="toolbar-btn" title="Gạch chân"><Underline size={16} /></button>
        <button className="toolbar-btn" title="Đổi màu chữ"><Type size={16} /></button>
        <button className="toolbar-btn" title="Màu nền"><Palette size={16} /></button>
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-group">
        <button className="toolbar-btn" title="Căn trái"><AlignLeft size={16} /></button>
        <button className="toolbar-btn" title="Căn giữa"><AlignCenter size={16} /></button>
        <button className="toolbar-btn" title="Căn phải"><AlignRight size={16} /></button>
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-group">
        <button className="toolbar-btn" title="Biểu đồ"><BarChart3 size={16} /></button>
        <button className="toolbar-btn" title="Lưới"><Grid3X3 size={16} /></button>
      </div>
    </div>
  );
}

// ── Component: Cell ──
function SheetCell({
  value,
  isLastMove,
  currentPlayer,
  onClick,
  isErrorFlash,
}: {
  value: CellValue;
  isLastMove: boolean;
  currentPlayer: Player;
  onClick: () => void;
  isErrorFlash: boolean;
}) {
  const getDisplay = () => {
    if (value === 1) return <span className="cell-done" style={{ color: '#ef4444', fontSize: '1.2rem', fontWeight: 'bold' }}>X</span>;
    if (value === 2) return <span className="cell-pending" style={{ color: '#3b82f6', fontSize: '1.2rem', fontWeight: 'bold' }}>O</span>;
    return null;
  };

  const cellClass = [
    "sheet-cell",
    value === 0 && "empty",
    value === 1 && "player1",
    value === 2 && "player2",
    isLastMove && "last-move",
    isErrorFlash && "error-flash",
    value === 0 && `turn-p${currentPlayer}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={cellClass} onClick={onClick}>
      {getDisplay()}
    </button>
  );
}

// ══════════════════════════════════════════
//  MAIN GAME COMPONENT
// ══════════════════════════════════════════
export default function CaroGame() {
  const navigate = useNavigate();

  // ── State ──
  const [phase, setPhase] = useState<"lobby" | "playing" | "finished">("lobby");
  const [board, setBoard] = useState<Board>(createEmptyBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [winner, setWinner] = useState<Player | null>(null);
  const [lastMove, setLastMove] = useState<[number, number] | null>(null);
  const [errorCell, setErrorCell] = useState<[number, number] | null>(null);
  const [bossKeyActive, setBossKeyActive] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [selectedCell, setSelectedCell] = useState<string>("");
  const [showRules, setShowRules] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);

  const boardRef = useRef(board);
  boardRef.current = board;

  const playerName = localStorage.getItem("dta-player-name") || "Người chơi";
  const gameRoom = useGameRoom(
    { name: playerName },
    {
      onGameEvent: (event) => {
        if (event.type === "caro-move") {
          const { row, col, player } = event.payload as { row: number; col: number; player: Player };
          const newBoard = boardRef.current.map((r) => [...r]);
          newBoard[row][col] = player;
          setBoard(newBoard);
          setLastMove([row, col]);
          setMoveCount((c) => c + 1);
          setSelectedCell(`${getColLabel(col)}${row + 1}`);

          if (checkWin(newBoard, row, col, player)) {
            setWinner(player);
            setPhase("finished");
            setTimerRunning(false);
          } else {
            setCurrentPlayer(player === 1 ? 2 : 1);
            setTimerRunning(true);
          }
        }
        if (event.type === "game-start") {
          handleStartOffline();
        }
        if (event.type === "timeout") {
          const winnerNum = gameRoom.isHost ? 1 : 2;
          setWinner(winnerNum);
          setPhase("finished");
          setTimerRunning(false);
          toast.error("Đối thủ đã hết thời gian!");
        }
      },
    }
  );

  const isMultiplayer = gameRoom.roomId !== null && gameRoom.roomStatus !== "idle";
  const myPlayerNum: Player = isMultiplayer ? (gameRoom.isHost ? 1 : 2) : currentPlayer;
  const isMyTurn = isMultiplayer ? currentPlayer === myPlayerNum : true;
  const TURN_DURATION = 30;

  // ── Boss Key listener ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setBossKeyActive((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleStartOffline = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(1);
    setWinner(null);
    setLastMove(null);
    setMoveCount(0);
    setSelectedCell("");
    setPhase("playing");
    setTimerRunning(true);
  }, []);

  const handleStartMultiplayer = useCallback(() => {
    gameRoom.sendGameEvent("game-start", {});
    gameRoom.startGame();
    handleStartOffline();
  }, [gameRoom, handleStartOffline]);

  const handleTimeout = useCallback(() => {
    if (!isMyTurn) return;
    const loser = currentPlayer;
    const winnerNum = currentPlayer === 1 ? 2 : 1;

    if (isMultiplayer) {
      gameRoom.sendGameEvent("timeout", {});
    }

    setWinner(winnerNum as Player);
    setPhase("finished");
    setTimerRunning(false);
    toast.error(`Hết giờ! Node ${loser === 1 ? "DONE" : "PENDING"} thua.`);
  }, [isMyTurn, currentPlayer, isMultiplayer, gameRoom]);

  // ── Handle Cell Click ──
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (winner || phase !== "playing") return;
      if (!isMyTurn) {
        toast.warning("Chưa đến lượt của bạn!");
        return;
      }

      if (board[row][col] !== 0) {
        setErrorCell([row, col]);
        setTimeout(() => setErrorCell(null), 600);
        return;
      }

      const newBoard = board.map((r) => [...r]);
      const activePlayer = isMultiplayer ? myPlayerNum : currentPlayer;
      newBoard[row][col] = activePlayer;
      
      setBoard(newBoard);
      setLastMove([row, col]);
      setMoveCount((c) => c + 1);
      setSelectedCell(`${getColLabel(col)}${row + 1}`);

      if (isMultiplayer) {
        gameRoom.sendGameEvent("caro-move", { row, col, player: activePlayer });
      }

      if (checkWin(newBoard, row, col, activePlayer)) {
        setWinner(activePlayer);
        setPhase("finished");
        setTimerRunning(false);
      } else {
        setCurrentPlayer(activePlayer === 1 ? 2 : 1);
        setTimerRunning(true);
      }
    },
    [board, currentPlayer, winner, phase, isMyTurn, isMultiplayer, myPlayerNum, gameRoom]
  );

  // ── Reset ──
  const handleReset = () => {
    handleStartOffline();
  };

  // ── Boss Key Screen ──
  if (bossKeyActive) {
    return (
      <div className="boss-key-screen finance">
        <div className="boss-key-header">
          <span className="boss-key-title">
            Báo_cáo_tài_chính_Q2_2026.xlsx — DTA Sheets
          </span>
          <span className="boss-key-hint">Nhấn Esc để quay lại</span>
        </div>
        <div className="finance-table-wrapper">
          <table className="finance-table">
            <thead>
              <tr>
                {FINANCE_DATA[0].map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FINANCE_DATA.slice(1).map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      className={
                        c === 3
                          ? cell.startsWith("+")
                            ? "positive"
                            : cell.startsWith("-")
                            ? "negative"
                            : ""
                          : ""
                      }
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          onPlayOffline={handleStartOffline}
          title="DTA Sheets — Caro Session"
        />
        <GameRules gameType="caro" isOpen={showRules} onClose={() => setShowRules(false)} />
      </>
    );
  }

  return (
    <div className="caro-container">
      {/* Header */}
      <div className="sheets-header">
        <div className="sheets-header-left">
          <button className="back-btn" onClick={() => navigate("/workspace")}>
            <ArrowLeft size={18} />
          </button>
          <div className="sheets-title-area">
            <h1 className="sheets-doc-title">Data_Phân_tích_hành_vi.xlsx</h1>
            <div className="sheets-tabs">
              <span className="sheet-tab active">Sheet 1</span>
              <span className="sheet-tab">Tổng hợp</span>
              <span className="sheet-tab">Biểu đồ</span>
            </div>
          </div>
        </div>
        <div className="sheets-header-right">
          <button className="reset-data-btn" onClick={handleReset}>
            <RotateCcw size={14} />
            <span>Làm mới dữ liệu</span>
          </button>
          <button className="toolbar-btn">
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <SheetToolbar />

      {/* Formula bar */}
      <div className="formula-bar">
        <div className="cell-reference">{selectedCell || "A1"}</div>
        <div className="formula-input">
          {selectedCell
            ? `=STATUS("${selectedCell}")`
            : "Chọn một ô để nhập dữ liệu..."}
        </div>
      </div>

      {phase === "playing" && (
        <div className="caro-turn-bar" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 15, background: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="turn-info" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={14} />
            <span style={{ color: isMyTurn ? '#4caf50' : 'var(--text-secondary)' }}>
              {isMyTurn ? `🟢 Lượt của bạn (Node ${currentPlayer === 1 ? "X" : "O"})` : `⏳ Đang chờ Node ${currentPlayer === 1 ? "X" : "O"}...`}
            </span>
          </div>
          <div className="turn-timer-wrapper" style={{ width: 200 }}>
            <GameTimer
              duration={TURN_DURATION}
              isRunning={timerRunning}
              onTimeout={handleTimeout}
              label="Sync Timeout"
              className="light"
              key={`${currentPlayer}-${moveCount}`}
            />
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="caro-grid-wrapper">
        <div className="caro-grid">
          {/* Column headers */}
          <div className="grid-header-row">
            <div className="row-number corner" />
            {Array.from({ length: GRID_SIZE }, (_, i) => (
              <div key={i} className="col-header">
                {getColLabel(i)}
              </div>
            ))}
          </div>

          {/* Rows */}
          {board.map((row, r) => (
            <div key={r} className="grid-data-row">
              <div className="row-number">{r + 1}</div>
              {row.map((cell, c) => (
                <SheetCell
                  key={c}
                  value={cell}
                  isLastMove={lastMove?.[0] === r && lastMove?.[1] === c}
                  currentPlayer={currentPlayer}
                  onClick={() => handleCellClick(r, c)}
                  isErrorFlash={errorCell?.[0] === r && errorCell?.[1] === c}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {phase === "finished" && winner && (
        <div className="caro-result" style={{ margin: '20px auto', maxWidth: 600, padding: 20, border: "1px solid #34a853", borderRadius: 8, background: "rgba(52, 168, 83, 0.05)" }}>
          <div className="result-banner" style={{ textAlign: "center" }}>
            <h3 style={{ color: "#34a853", marginBottom: 10 }}>
              {`Data Synchronization Complete — Node ${winner === 1 ? "X" : "O"} Winner`}
            </h3>
            <p style={{ marginBottom: 5 }}>Tổng số bản ghi (Moves): {moveCount}</p>
            <button className="reset-data-btn" onClick={handleReset} style={{ marginTop: 15 }}>
              Khởi tạo trang tính mới
            </button>
          </div>
        </div>
      )}

      {/* Status bar */}
      <div className="sheets-statusbar">
        <div className="statusbar-left">
          <span>Bản ghi: {moveCount}</span>
          <span className="statusbar-divider">|</span>
          <span>
            Trạng thái:{" "}
            {winner
              ? `Data Synchronization Complete (Node ${
                  winner === 1 ? "X" : "O"
                } Winner)`
              : `Đang chờ Node ${
                  currentPlayer === 1 ? "X" : "O"
                } nhập liệu...`}
          </span>
        </div>
        <div className="statusbar-right">
          <span>Lưới: {GRID_SIZE}×{GRID_SIZE}</span>
          <span className="statusbar-divider">|</span>
          <span>Auto-sync: ON</span>
        </div>
      </div>
    </div>
  );
}
