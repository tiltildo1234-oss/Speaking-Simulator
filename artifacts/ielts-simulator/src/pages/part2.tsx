import { useState } from "react";
import { ChevronRight, BookOpen } from "lucide-react";
import { useTest } from "@/context/TestContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import RecordingPanel from "@/components/RecordingPanel";
import Timer from "@/components/Timer";

type Phase = "intro" | "prep" | "speak";

export default function Part2() {
  const { cueCard, goToPart, savePart2Answer } = useTest();
  const [phase, setPhase] = useState<Phase>("intro");
  const { transcript, interimTranscript, recordingState, isSupported, audioUrl, startRecording, stopRecording, resetTranscript, debug } =
    useSpeechRecognition();

  function handleStartPrep() {
    setPhase("prep");
  }

  function handleStartSpeaking() {
    setPhase("speak");
    startRecording();
  }

  function handleFinish() {
    if (recordingState === "recording") stopRecording();
    if (transcript.trim() || audioUrl) {
      savePart2Answer({ transcript: transcript.trim(), audioUrl });
    }
    goToPart("part3");
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Sub-header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Part 2 — Cue Card</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {phase === "intro" && "Read the cue card, then prepare for 1 minute before speaking for up to 2 minutes."}
            {phase === "prep" && "Use this time to make notes and organise your ideas."}
            {phase === "speak" && "Speak for up to 2 minutes on the topic. Try to cover all the points."}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-4">

          {/* Cue card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Cue Card</span>
            </div>
            <p className="text-lg font-semibold text-slate-800 mb-4">{cueCard.title}</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">You should say:</p>
            <ul className="space-y-2">
              {cueCard.prompts.map((prompt, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  {prompt}
                </li>
              ))}
            </ul>
          </div>

          {/* Phase controls */}
          {phase === "intro" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
              <p className="text-sm text-slate-600 mb-4">
                Read the cue card carefully. When you're ready, start the{" "}
                <span className="font-semibold text-amber-600">1-minute preparation timer</span>.
              </p>
              <button
                onClick={handleStartPrep}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-colors"
              >
                Start Preparation (1 min)
              </button>
            </div>
          )}

          {phase === "prep" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col items-center gap-4">
                <Timer
                  durationSeconds={60}
                  autoStart
                  label="Preparation Time"
                  variant="prep"
                  onComplete={handleStartSpeaking}
                />
                <p className="text-sm text-slate-500 text-center">
                  Jot down ideas for each point. Speaking will begin automatically when time is up.
                </p>
                <button
                  onClick={handleStartSpeaking}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  Skip — Start Speaking Now
                </button>
              </div>
            </div>
          )}

          {phase === "speak" && (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col items-center gap-4">
                  <Timer
                    durationSeconds={120}
                    autoStart
                    label="Speaking Time"
                    variant="speak"
                    onComplete={() => {
                      if (recordingState === "recording") stopRecording();
                    }}
                  />
                  <p className="text-sm text-slate-500 text-center">
                    Speak for up to 2 minutes. Try to address all the cue card points.
                  </p>
                </div>
              </div>

              <RecordingPanel
                transcript={transcript}
                interimTranscript={interimTranscript}
                recordingState={recordingState}
                isSupported={isSupported}
                audioUrl={audioUrl}
                onStart={startRecording}
                onStop={stopRecording}
                onReset={() => { resetTranscript(); startRecording(); }}
                label="Your Response"
                debug={debug}
              />

              <div className="flex justify-end">
                <button
                  onClick={handleFinish}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  Continue to Part 3
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
