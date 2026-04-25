import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Shield, Lock, Unlock, Terminal, AlertTriangle,
  RotateCcw, Zap, CheckCircle, XCircle
} from "lucide-react";

/* ═══════════════════════════════════════════
   ĐOÁN TỪ (HANGMAN) — Data Decryption Node
   Stealth Game: Đoán từ ngụy trang Terminal giải mã
   ═══════════════════════════════════════════ */

const MAX_WRONG = 6;

// ── Danh sách từ khóa ──
const WORD_LIST = [
  "SYSTEM", "SERVER", "NETWORK", "DATABASE", "PROTOCOL",
  "CLUSTER", "FIREWALL", "ENCRYPT", "DECRYPT", "PAYLOAD",
  "KERNEL", "SOCKET", "ROUTER", "BRIDGE", "PACKET",
  "BINARY", "MODULE", "DRIVER", "THREAD", "BUFFER",
  "STUDIO", "DEPLOY", "CONFIG", "SECURE", "ACCESS",
];

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

function getRandomWord(): string {
  return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
}

// ── Boss Key: Fake Update Screen ──
function BossKeyScreen() {
  const [progress, setProgress] = useState(14);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 99) return 14;
        return p + Math.random() * 2;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="boss-key-screen update">
      <div className="update-container">
        <div className="update-icon">
          <Shield size={48} />
        </div>
        <h2 className="update-title">Updating System</h2>
        <p className="update-subtitle">
          Installing security patches. Do not turn off your computer.
        </p>
        <div className="update-progress-bar">
          <div
            className="update-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="update-percent">{Math.floor(progress)}% complete</span>
        <p className="update-hint">Nhấn Esc để quay lại</p>
      </div>
    </div>
  );
}

// ── Component: Corruption Bar (Thanh trạng thái rủi ro) ──
function CorruptionBar({ wrongCount }: { wrongCount: number }) {
  const percentage = (wrongCount / MAX_WRONG) * 100;

  const getColor = () => {
    if (percentage <= 33) return "#34a853";      // Xanh lục
    if (percentage <= 66) return "#fbbc04";       // Vàng cam
    return "#ff003c";                              // Đỏ rực Neon Red
  };

  const getGradient = () => {
    if (percentage <= 33) return "linear-gradient(90deg, #34a853, #4caf50)";
    if (percentage <= 66) return "linear-gradient(90deg, #fbbc04, #ff9800)";
    return "linear-gradient(90deg, #ff6b35, #ff003c)";
  };

  return (
    <div className="corruption-bar">
      <div className="corruption-header">
        <AlertTriangle size={14} style={{ color: getColor() }} />
        <span>System Corruption Level</span>
        <span className="corruption-value" style={{ color: getColor() }}>
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="corruption-track">
        <div
          className="corruption-fill"
          style={{
            width: `${percentage}%`,
            background: getGradient(),
            boxShadow: `0 0 10px ${getColor()}40`,
          }}
        />
      </div>
      <div className="corruption-labels">
        <span>Stable</span>
        <span>Warning</span>
        <span>Critical</span>
      </div>
    </div>
  );
}

// ── Component: Virtual Keyboard ──
function VirtualKeyboard({
  guessedLetters,
  correctLetters,
  onKeyClick,
  disabled,
}: {
  guessedLetters: Set<string>;
  correctLetters: Set<string>;
  onKeyClick: (letter: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="virtual-keyboard">
      <div className="keyboard-header">
        <Terminal size={14} />
        <span>Key Injector — QWERTY Module</span>
      </div>
      <div className="keyboard-body">
        {KEYBOARD_ROWS.map((row, r) => (
          <div key={r} className="keyboard-row">
            {row.map((letter) => {
              const isGuessed = guessedLetters.has(letter);
              const isCorrect = correctLetters.has(letter);
              const btnClass = [
                "key-btn",
                isGuessed && isCorrect && "correct",
                isGuessed && !isCorrect && "wrong",
                !isGuessed && "available",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={letter}
                  className={btnClass}
                  onClick={() => onKeyClick(letter)}
                  disabled={isGuessed || disabled}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Component: System Log ──
function SystemLog({ logs }: { logs: string[] }) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="system-log">
      <div className="log-header">
        <Terminal size={14} />
        <span>Injection History</span>
        <span className="log-count">{logs.length}</span>
      </div>
      <div className="log-body" ref={logRef}>
        {logs.map((log, i) => (
          <div
            key={i}
            className={`log-line ${
              log.includes("FAILED") ? "failed" : log.includes("SUCCESS") ? "success" : ""
            }`}
          >
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Component: Decryption Board ──
function DecryptionBoard({
  word,
  guessedLetters,
  gameStatus,
}: {
  word: string;
  guessedLetters: Set<string>;
  gameStatus: "playing" | "won" | "lost";
}) {
  return (
    <div className="decryption-board">
      <div className="decryption-label">
        <Lock size={14} />
        <span>Decryption Target — {word.length} Characters</span>
      </div>
      <div className="hash-display">
        {word.split("").map((letter, i) => {
          const isRevealed = guessedLetters.has(letter) || gameStatus === "lost";
          return (
            <div
              key={i}
              className={`hash-char ${isRevealed ? "revealed" : "hidden"} ${
                gameStatus === "lost" && !guessedLetters.has(letter)
                  ? "missed"
                  : ""
              }`}
            >
              <span>{isRevealed ? letter : "*"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//  MAIN GAME COMPONENT
// ══════════════════════════════════════════
export default function HangmanGame() {
  const navigate = useNavigate();

  // ── State ──
  const [word, setWord] = useState<string>(getRandomWord);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([
    `> [${new Date().toLocaleTimeString()}] Decryption protocol initialized.`,
    `> [${new Date().toLocaleTimeString()}] Target hash loaded: ${word.length} character sequence detected.`,
  ]);
  const [bossKeyActive, setBossKeyActive] = useState(false);

  const correctLetters = new Set(
    [...guessedLetters].filter((l) => word.includes(l))
  );
  const isWon = word.split("").every((l) => guessedLetters.has(l));
  const isLost = wrongCount >= MAX_WRONG;
  const gameStatus = isWon ? "won" : isLost ? "lost" : "playing";

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

  // ── Physical keyboard listener ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (bossKeyActive) return;
      const letter = e.key.toUpperCase();
      if (/^[A-Z]$/.test(letter) && gameStatus === "playing") {
        handleGuess(letter);
      }
    };
    window.addEventListener("keypress", handler);
    return () => window.removeEventListener("keypress", handler);
  }, [bossKeyActive, guessedLetters, gameStatus, word]);

  // ── Handle Guess ──
  const handleGuess = useCallback(
    (letter: string) => {
      if (guessedLetters.has(letter) || gameStatus !== "playing") return;

      const time = new Date().toLocaleTimeString();
      const newGuessed = new Set(guessedLetters);
      newGuessed.add(letter);
      setGuessedLetters(newGuessed);

      if (word.includes(letter)) {
        setLogs((prev) => [
          ...prev,
          `> [${time}] Injecting Key '${letter}' ... [SUCCESS] - Match found.`,
        ]);

        // Check win
        const allRevealed = word.split("").every((l) => newGuessed.has(l));
        if (allRevealed) {
          setLogs((prev) => [
            ...prev,
            `> [${time}] [COMPLETE] Target fully decrypted: "${word}". Protocol success.`,
          ]);
        }
      } else {
        const newWrong = wrongCount + 1;
        setWrongCount(newWrong);
        setLogs((prev) => [
          ...prev,
          `> [${time}] Injecting Key '${letter}' ... [FAILED] - Security warning. Corruption +${Math.round(
            100 / MAX_WRONG
          )}%`,
        ]);

        if (newWrong >= MAX_WRONG) {
          setLogs((prev) => [
            ...prev,
            `> [${time}] [CRITICAL] System corruption at 100%. Node locked. Target was: "${word}".`,
          ]);
        }
      }
    },
    [guessedLetters, word, wrongCount, gameStatus]
  );

  // ── Reset ──
  const handleReset = () => {
    const newWord = getRandomWord();
    setWord(newWord);
    setGuessedLetters(new Set());
    setWrongCount(0);
    setLogs([
      `> [${new Date().toLocaleTimeString()}] System purged. New decryption target loaded.`,
      `> [${new Date().toLocaleTimeString()}] Target hash: ${newWord.length} character sequence detected.`,
    ]);
  };

  // ── Boss Key ──
  if (bossKeyActive) {
    return <BossKeyScreen />;
  }

  return (
    <div className="hangman-container">
      {/* Top bar */}
      <div className="hangman-topbar">
        <button className="back-btn" onClick={() => navigate("/workspace")}>
          <ArrowLeft size={18} />
          <span>DTA Workspace</span>
        </button>
        <h1 className="hangman-title">
          <Shield size={18} />
          DTA-NODE // Secure Data Decryption Protocol
        </h1>
        <button className="reset-btn" onClick={handleReset}>
          <RotateCcw size={16} />
          <span>Purge & Reload</span>
        </button>
      </div>

      {/* Main content */}
      <div className="hangman-main">
        <div className="hangman-left">
          {/* Decryption Target */}
          <DecryptionBoard
            word={word}
            guessedLetters={guessedLetters}
            gameStatus={gameStatus}
          />

          {/* Corruption Bar */}
          <CorruptionBar wrongCount={wrongCount} />

          {/* Virtual Keyboard */}
          <VirtualKeyboard
            guessedLetters={guessedLetters}
            correctLetters={correctLetters}
            onKeyClick={handleGuess}
            disabled={gameStatus !== "playing"}
          />
        </div>

        <div className="hangman-right">
          {/* System Log */}
          <SystemLog logs={logs} />
        </div>
      </div>

      {/* Game Over Overlay */}
      {gameStatus !== "playing" && (
        <div className="gameover-overlay decrypt">
          <div className="gameover-card">
            {gameStatus === "won" ? (
              <>
                <Unlock size={40} className="text-neon-blue" />
                <h2>Decrypted Successfully</h2>
                <p className="gameover-word">Target: "{word}"</p>
                <p>Dữ liệu đã được giải mã hoàn toàn. Hệ thống an toàn.</p>
              </>
            ) : (
              <>
                <Lock size={40} className="text-neon-red" />
                <h2>System Locked</h2>
                <p className="gameover-word">Target was: "{word}"</p>
                <p>Corruption đạt mức tối đa. Node đã bị khóa vĩnh viễn.</p>
              </>
            )}
            <button className="reset-btn large" onClick={handleReset}>
              <RotateCcw size={18} />
              <span>Khởi tạo Node mới</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
