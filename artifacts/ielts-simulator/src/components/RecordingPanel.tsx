import { Mic, MicOff, RotateCcw, Volume2, AlertCircle, ExternalLink } from "lucide-react";
import { useRef } from "react";

interface Props {
  transcript: string;
  interimTranscript: string;
  recordingState: "idle" | "recording" | "stopped";
  isSupported: boolean;
  networkBlocked: boolean;
  audioUrl: string | null;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  label?: string;
}

export default function RecordingPanel({
  transcript,
  interimTranscript,
  recordingState,
  isSupported,
  networkBlocked,
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

      {networkBlocked && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm mb-4 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-semibold">Transcription blocked in preview</p>
              <p className="text-xs mt-0.5 text-amber-700">
                Chrome's speech API can't reach Google's servers from inside the Replit preview iframe.
                Open the app directly in your browser tab for transcription to work.
                Audio recording still works — you can play back your answer.
              </p>
            </div>
          </div>
          <a
            href={window.location.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open in new tab
          </a>
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
              {recordingState === "recording"
                ? "Listening… speak now"
                : networkBlocked
                ? "No transcript — open in a new tab to enable speech-to-text"
                : "No speech detected. Try again."}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
