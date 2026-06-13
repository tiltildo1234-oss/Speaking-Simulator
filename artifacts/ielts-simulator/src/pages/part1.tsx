import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { useTest } from "@/context/TestContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import RecordingPanel from "@/components/RecordingPanel";

export default function Part1() {
  const { part1Questions, part1Meta, goToPart, savePart1Answer } = useTest();
  const [questionIndex, setQuestionIndex] = useState(0);
  const { recordingState, audioUrl, startRecording, stopRecording, resetRecording } =
    useSpeechRecognition();

  const currentQuestion = part1Questions[questionIndex] ?? "";
  const currentMeta = part1Meta[questionIndex];
  const progress = part1Questions.length > 0 ? ((questionIndex + 1) / part1Questions.length) * 100 : 0;
  const isLast = questionIndex === part1Questions.length - 1;

  useEffect(() => {
    resetRecording();
  }, [questionIndex]);

  function handleNext() {
    if (recordingState === "recording") stopRecording();
    if (audioUrl) {
      savePart1Answer(questionIndex, { transcript: "", audioUrl });
    }
    resetRecording();
    if (!isLast) {
      setQuestionIndex((i) => i + 1);
    } else {
      goToPart("part2");
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
              Part 1 — General Questions
            </p>
            {currentMeta && (
              <p className="text-xs text-slate-500 mt-0.5">Topic: {currentMeta.topic}</p>
            )}
          </div>
          <p className="text-sm font-bold text-slate-700">
            {questionIndex + 1}{" "}
            <span className="font-normal text-slate-400">/ {part1Questions.length}</span>
          </p>
        </div>
        <div className="max-w-2xl mx-auto mt-2">
          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-4">
          <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            {currentMeta?.isRequired ? "Required" : "Follow-up"}
          </span>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <p className="text-xl font-semibold text-slate-800 leading-relaxed">{currentQuestion}</p>
            <p className="mt-3 text-sm text-slate-400 flex items-start gap-1.5">
              <span className="text-amber-400 mt-0.5">💡</span>
              <span>
                {currentMeta?.isRequired
                  ? "Give a full, natural answer. Aim for 4–6 sentences."
                  : "Extend your answer with details, examples, or personal experience."}
              </span>
            </p>
          </div>

          <RecordingPanel
            recordingState={recordingState}
            audioUrl={audioUrl}
            onStart={startRecording}
            onStop={stopRecording}
            onReset={resetRecording}
          />

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              {isLast ? "Continue to Part 2" : "Next Question"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
