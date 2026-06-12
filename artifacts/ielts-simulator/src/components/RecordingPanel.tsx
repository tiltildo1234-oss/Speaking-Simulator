import { Mic, MicOff, RotateCcw, Volume2, CheckCircle2 } from "lucide-react";
import { useRef } from "react";

interface Props {
  recordingState: "idle" | "recording" | "stopped";
  audioUrl: string | null;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  label?: string;
}

export default function RecordingPanel({
  recordingState,
  audioUrl,
  onStart,
  onStop,
  onReset,
  label = "Your Answer",
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function playAudio() {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <audio ref={audioRef} className="hidden" />
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">{label}</p>

      {/* Controls */}
      <div className="flex items-center flex-wrap gap-2 mb-4">
        {recordingState !== "recording" ? (
          <button
            onClick={onStart}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            <Mic className="w-3.5 h-3.5" />
            {audioUrl ? "Re-record" : "Start Recording"}
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            <MicOff className="w-3.5 h-3.5" />
            Stop
          </button>
        )}

        {audioUrl && recordingState !== "recording" && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry
          </button>
        )}

        {audioUrl && recordingState !== "recording" && (
          <button
            onClick={playAudio}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Play
          </button>
        )}

        {recordingState === "recording" && (
          <div className="flex items-center gap-1.5 text-red-500 text-sm font-medium ml-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
            Recording…
          </div>
        )}
      </div>

      {/* Status */}
      {recordingState !== "idle" && (
        <div className="min-h-[52px] bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-2">
          {audioUrl && recordingState === "stopped" ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-sm text-emerald-700 font-medium">Audio recorded successfully</span>
            </>
          ) : (
            <span className="text-sm text-slate-400 italic">Listening… speak now</span>
          )}
        </div>
      )}
    </div>
  );
}
