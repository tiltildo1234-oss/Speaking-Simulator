import { useState, useEffect, useRef, useCallback } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  durationSeconds: number;
  onComplete?: () => void;
  autoStart?: boolean;
  label?: string;
  variant?: "prep" | "speak";
}

export default function Timer({
  durationSeconds,
  onComplete,
  autoStart = false,
  label,
  variant = "speak",
}: TimerProps) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const [running, setRunning] = useState(autoStart);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
  }, []);

  const start = useCallback(() => {
    setRunning(true);
  }, []);

  useEffect(() => {
    setRemaining(durationSeconds);
    setFinished(false);
    setRunning(autoStart);
  }, [durationSeconds, autoStart]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          setFinished(true);
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const pct = ((durationSeconds - remaining) / durationSeconds) * 100;
  const isLow = remaining <= 10 && remaining > 0;

  const trackColor = variant === "prep" ? "stroke-amber-200" : "stroke-indigo-200";
  const barColor = finished
    ? "stroke-emerald-500"
    : isLow
    ? "stroke-red-500"
    : variant === "prep"
    ? "stroke-amber-500"
    : "stroke-indigo-500";
  const textColor = finished
    ? "text-emerald-600"
    : isLow
    ? "text-red-600"
    : variant === "prep"
    ? "text-amber-600"
    : "text-indigo-600";

  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-3">
      {label && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <Clock className="w-3.5 h-3.5" />
          {label}
        </div>
      )}
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" strokeWidth="6" className={trackColor} />
          <circle
            cx="44"
            cy="44"
            r={r}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={dash}
            className={`${barColor} transition-all duration-1000`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-bold tabular-nums ${textColor}`}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      {!finished && !running && (
        <button
          onClick={start}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            variant === "prep"
              ? "bg-amber-500 hover:bg-amber-600 text-white"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          Start Timer
        </button>
      )}
      {running && (
        <button
          onClick={stop}
          className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
        >
          Pause
        </button>
      )}
      {finished && (
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Time's up!
        </span>
      )}
    </div>
  );
}
