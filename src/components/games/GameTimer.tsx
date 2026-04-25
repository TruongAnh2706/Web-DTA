import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════
   GameTimer — Đồng hồ đếm ngược lượt chơi
   ═══════════════════════════════════════════ */

interface GameTimerProps {
  /** Thời gian tối đa mỗi lượt (giây) */
  duration: number;
  /** Có đang chạy không */
  isRunning: boolean;
  /** Callback khi hết giờ */
  onTimeout: () => void;
  /** Callback mỗi giây (optional) */
  onTick?: (remaining: number) => void;
  /** Label hiển thị (ngụy trang) */
  label?: string;
  /** CSS class bổ sung */
  className?: string;
}

export function GameTimer({
  duration,
  isRunning,
  onTimeout,
  onTick,
  label = "Response Timeout",
  className = "",
}: GameTimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const timeoutRef = useRef(onTimeout);
  const tickRef = useRef(onTick);
  timeoutRef.current = onTimeout;
  tickRef.current = onTick;

  // Reset khi duration thay đổi hoặc khi bắt đầu chạy lại
  useEffect(() => {
    if (isRunning) {
      setRemaining(duration);
    }
  }, [isRunning, duration]);

  // Đếm ngược
  useEffect(() => {
    if (!isRunning || remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        tickRef.current?.(next);
        if (next <= 0) {
          clearInterval(interval);
          timeoutRef.current();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, remaining]);

  // Tính phần trăm
  const percentage = (remaining / duration) * 100;

  // Màu sắc theo thời gian còn lại
  const getColor = () => {
    if (percentage > 60) return "#34a853";   // Xanh lục
    if (percentage > 30) return "#fbbc04";   // Vàng cam
    return "#ff003c";                         // Đỏ rực
  };

  const color = getColor();
  const isUrgent = percentage <= 30;

  return (
    <div className={`game-timer ${isUrgent ? "urgent" : ""} ${className}`}>
      <div className="timer-header">
        <span className="timer-label">{label}</span>
        <span className="timer-value" style={{ color }}>
          {remaining}s
        </span>
      </div>
      <div className="timer-track">
        <div
          className="timer-fill"
          style={{
            width: `${percentage}%`,
            background: color,
            boxShadow: isUrgent ? `0 0 8px ${color}60` : "none",
            transition: "width 1s linear, background 0.3s",
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   useGameTimer — Hook version cho logic thuần
   ═══════════════════════════════════════════ */

interface UseGameTimerReturn {
  remaining: number;
  isRunning: boolean;
  percentage: number;
  start: (duration?: number) => void;
  stop: () => void;
  reset: (duration?: number) => void;
}

export function useGameTimer(
  defaultDuration: number,
  onTimeout?: () => void
): UseGameTimerReturn {
  const [remaining, setRemaining] = useState(defaultDuration);
  const [isRunning, setIsRunning] = useState(false);
  const timeoutRef = useRef(onTimeout);
  timeoutRef.current = onTimeout;
  const durationRef = useRef(defaultDuration);

  useEffect(() => {
    if (!isRunning || remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          setIsRunning(false);
          timeoutRef.current?.();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, remaining]);

  const start = useCallback((duration?: number) => {
    if (duration) {
      durationRef.current = duration;
      setRemaining(duration);
    }
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((duration?: number) => {
    const d = duration || durationRef.current;
    durationRef.current = d;
    setRemaining(d);
    setIsRunning(false);
  }, []);

  return {
    remaining,
    isRunning,
    percentage: (remaining / durationRef.current) * 100,
    start,
    stop,
    reset,
  };
}
