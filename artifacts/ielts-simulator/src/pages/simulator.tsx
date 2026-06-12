import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { PART1_QUESTIONS } from "@/data/questions";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Mic, MicOff, ChevronRight, RotateCcw, Volume2, CheckCircle2, AlertCircle } from "lucide-react";

export default function Simulator() {
  const [, navigate] = useLocation();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { transcript: string; audioUrl: string | null }>>({});
  const [showTranscript, setShowTranscript] = useState(false);
  const [finished, setFinished] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    transcript,
    interimTranscript,
    recordingState,
    isSupported,
    startRecording,
    stopRecording,
    resetTranscript,
    audioUrl,
  } = useSpeechRecognition();

  const currentQuestion = PART1_QUESTIONS[questionIndex];
  const progress = ((questionIndex + (finished ? 1 : 0)) / PART1_QUESTIONS.length) * 100;

  const savedAnswer = answers[currentQuestion.id];

  useEffect(() => {
    setShowTranscript(false);
    resetTranscript();
  }, [questionIndex]);

  function handleStopAndSave() {
    stopRecording();
    setShowTranscript(true);
  }

  function handleNext() {
    if (recordingState === "recording") {
      stopRecording();
    }
    const t = transcript.trim();
    const url = audioUrl;
    if (t || url) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: { transcript: t, audioUrl: url },
      }));
    }
    resetTranscript();
    setShowTranscript(false);
    if (questionIndex < PART1_QUESTIONS.length - 1) {
      setQuestionIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  }

  function handleRetry() {
    if (recordingState === "recording") stopRecording();
    resetTranscript();
    setShowTranscript(false);
  }

  function handlePlayAudio(url: string) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = url;
      audioRef.current.play();
    }
  }

  const displayTranscript = transcript || (savedAnswer?.transcript ?? "");
  const displayAudioUrl = audioUrl || (savedAnswer?.audioUrl ?? null);

  if (finished) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <audio ref={audioRef} className="hidden" />
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Test Complete!</h2>
            <p className="text-slate-500">You answered all {PART1_QUESTIONS.length} IELTS Speaking Part 1 questions.</p>
          </div>

          <div className="space-y-4 mb-6">
            {PART1_QUESTIONS.map((q) => {
              const ans = answers[q.id];
              return (
                <div key={q.id} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mb-1">
                        {q.topic}
                      </span>
                      <p className="text-sm font-medium text-slate-700 mb-2">{q.question}</p>
                      {ans?.transcript ? (
                        <p className="text-sm text-slate-500 italic line-clamp-2">"{ans.transcript}"</p>
                      ) : (
                        <p className="text-sm text-slate-400 italic">No transcript recorded</p>
                      )}
                    </div>
                    {ans?.audioUrl && (
                      <button
                        onClick={() => handlePlayAudio(ans.audioUrl!)}
                        className="shrink-0 w-8 h-8 rounded-full bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center transition-colors"
                        title="Play recording"
                      >
                        <Volume2 className="w-4 h-4 text-indigo-600" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <audio ref={audioRef} className="hidden" />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">IELTS Speaking</p>
            <h1 className="text-sm font-bold text-slate-800">Part 1 — General Questions</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Question</p>
            <p className="text-sm font-bold text-slate-700">
              {questionIndex + 1} <span className="font-normal text-slate-400">/ {PART1_QUESTIONS.length}</span>
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="max-w-2xl mx-auto mt-3">
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-4">
          {/* Topic badge */}
          <div className="flex items-center gap-2">
            <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              Topic: {currentQuestion.topic}
            </span>
          </div>

          {/* Question card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <p className="text-xl font-semibold text-slate-800 leading-relaxed">{currentQuestion.question}</p>
            <p className="mt-3 text-sm text-slate-400 flex items-start gap-1.5">
              <span className="text-amber-400 mt-0.5">💡</span>
              <span>{currentQuestion.tip}</span>
            </p>
          </div>

          {/* Browser support warning */}
          {!isSupported && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                Live transcription is not supported in this browser. Recording will still work — use Chrome for full
                support.
              </span>
            </div>
          )}

          {/* Recording controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Your Answer</p>

            <div className="flex items-center gap-3">
              {recordingState !== "recording" ? (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  <Mic className="w-4 h-4" />
                  {recordingState === "stopped" || displayTranscript ? "Re-record" : "Start Recording"}
                </button>
              ) : (
                <button
                  onClick={handleStopAndSave}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-colors animate-pulse"
                >
                  <MicOff className="w-4 h-4" />
                  Stop Recording
                </button>
              )}

              {(displayTranscript || displayAudioUrl) && recordingState !== "recording" && (
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-medium text-sm transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry
                </button>
              )}

              {displayAudioUrl && recordingState !== "recording" && (
                <button
                  onClick={() => handlePlayAudio(displayAudioUrl)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-medium text-sm transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                  Play
                </button>
              )}
            </div>

            {/* Live recording indicator */}
            {recordingState === "recording" && (
              <div className="mt-4 flex items-center gap-2 text-red-500 text-sm font-medium">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />
                Recording…
              </div>
            )}

            {/* Transcript */}
            {(showTranscript || displayTranscript) && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Transcript</p>
                <div className="min-h-[80px] bg-slate-50 rounded-xl border border-slate-200 p-4 text-sm text-slate-700 leading-relaxed">
                  {displayTranscript ? (
                    <>
                      <span>{displayTranscript}</span>
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
                        : "No speech detected. Try recording again."}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Interim transcript while recording */}
            {recordingState === "recording" && !showTranscript && interimTranscript && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Live Transcript</p>
                <div className="min-h-[60px] bg-slate-50 rounded-xl border border-slate-200 p-4 text-sm text-slate-400 italic leading-relaxed">
                  {transcript && <span className="text-slate-700 not-italic">{transcript}</span>}
                  {interimTranscript}
                </div>
              </div>
            )}

            {recordingState === "recording" && !interimTranscript && transcript && (
              <div className="mt-4">
                <div className="min-h-[60px] bg-slate-50 rounded-xl border border-slate-200 p-4 text-sm text-slate-700 leading-relaxed">
                  {transcript}
                </div>
              </div>
            )}
          </div>

          {/* Next button */}
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              {questionIndex < PART1_QUESTIONS.length - 1 ? "Next Question" : "Finish Test"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
