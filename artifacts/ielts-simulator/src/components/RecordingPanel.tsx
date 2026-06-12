import { Mic, MicOff, RotateCcw, Volume2, AlertCircle } from "lucide-react";
import { useRef } from "react";

interface Props {
  transcript: string;
  interimTranscript: string;
  recordingState: "idle" | "recording" | "stopped";
  isSupported: boolean;
  audioUrl: string | null;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  compact?: boolean;
  label?: string;
}

export default function RecordingPanel({
  transcript,
  interimTranscript,
  recordingState,
  isSupported,
  audioUrl,
  onStart,
  onStop,
  onReset,
  compact = false,
  label = "Your Answer",
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function playAudio() {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  }

  const hasContent = transcript.trim() || interimTranscript;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <audio ref={audioRef} className="hidden" />
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">{label}</p>

      {!isSupported && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-3 py-2 text-xs mb-4">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          Live transcription requires Chrome or Edge.
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center flex-wrap gap-2 mb-4">
        {recordingState !== "recording" ? (
          <button
            onClick={onStart}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            <Mic className="w-3.5 h-3.5" />
            {transcript ? "Re-record" : "Start Recording"}
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

        {(transcript || audioUrl) && recordingState !== "recording" && (
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

      {/* Transcript box */}
      {(recordingState !== "idle" || hasContent) && (
        <div className="min-h-[80px] bg-slate-50 rounded-xl border border-slate-200 p-3 text-sm text-slate-700 leading-relaxed">
          {transcript ? (
            <>
              {transcript}
              {interimTranscript && (
                <span className="text-slate-400 italic"> {interimTranscript}</span>
              )}
            </>
          ) : interimTranscript ? (
            <span className="text-slate-400 italic">{interimTranscript}</span>
          ) : (
            <span className="text-slate-400 italic">
              {recordingState === "recording" ? "Listening… speak now" : "No speech detected. Try again."}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
