import { useState, useEffect } from "react";
import { ChevronRight, MessageSquare } from "lucide-react";
import { useTest } from "@/context/TestContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import RecordingPanel from "@/components/RecordingPanel";

export default function Part3() {
  const { selectedPair, goToPart, savePart3Answer } = useTest();
  const [questionIndex, setQuestionIndex] = useState(0);
  const { recordingState, audioUrl, startRecording, stopRecording, resetRecording } =
    useSpeechRecognition();

  const questions = selectedPair?.part3.questions ?? [];
  const currentQuestion = questions[questionIndex] ?? "";
  const progress = questions.length > 0 ? ((questionIndex + 1) / questions.length) * 100 : 0;
  const isLast = questionIndex === questions.length - 1;

  useEffect(() => {
    resetRecording();
  }, [questionIndex]);

  function handleNext() {
    if (recordingState === "recording") stopRecording();
    if (audioUrl) {
      savePart3Answer(questionIndex, { transcript: "", audioUrl });
    }
    resetRecording();
    if (!isLast) {
      setQuestionIndex((i) => i + 1);
    } else {
      goToPart("results");
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
              Part 3 — Discussion
            </p>
            {selectedPair && (
              <p className="text-xs text-slate-500 mt-0.5">Theme: {selectedPair.topic}</p>
            )}
          </div>
          <p className="text-sm font-bold text-slate-700">
            {questionIndex + 1}{" "}
            <span className="font-normal text-slate-400">/ {questions.length}</span>
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
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-3 h-3 text-indigo-600" />
            </div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
              Discussion Question
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <p className="text-xl font-semibold text-slate-800 leading-relaxed">
              {currentQuestion}
            </p>
            <p className="mt-3 text-sm text-slate-400 flex items-start gap-1.5">
              <span className="text-amber-400 mt-0.5">💡</span>
              <span>
                Give an extended, well-structured answer. Support your opinion with reasons and
                examples.
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
              {isLast ? "Finish Test" : "Next Question"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
