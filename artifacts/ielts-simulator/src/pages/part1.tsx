import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { PART1_QUESTIONS } from "@/data/questions";
import { useTest } from "@/context/TestContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import RecordingPanel from "@/components/RecordingPanel";

export default function Part1() {
  const { goToPart, savePart1Answer } = useTest();
  const [questionIndex, setQuestionIndex] = useState(0);
  const { transcript, interimTranscript, recordingState, isSupported, audioUrl, startRecording, stopRecording, resetTranscript, debug } =
    useSpeechRecognition();

  const currentQuestion = PART1_QUESTIONS[questionIndex];
  const progress = ((questionIndex + 1) / PART1_QUESTIONS.length) * 100;
  const isLast = questionIndex === PART1_QUESTIONS.length - 1;

  useEffect(() => {
    resetTranscript();
  }, [questionIndex]);

  function handleNext() {
    if (recordingState === "recording") stopRecording();
    if (transcript.trim() || audioUrl) {
      savePart1Answer(currentQuestion.id, { transcript: transcript.trim(), audioUrl });
    }
    resetTranscript();
    if (!isLast) {
      setQuestionIndex((i) => i + 1);
    } else {
      goToPart("part2");
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Sub-header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Part 1 — General Questions</p>
          </div>
          <p className="text-sm font-bold text-slate-700">
            {questionIndex + 1} <span className="font-normal text-slate-400">/ {PART1_QUESTIONS.length}</span>
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

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-4">
          <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            Topic: {currentQuestion.topic}
          </span>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <p className="text-xl font-semibold text-slate-800 leading-relaxed">{currentQuestion.question}</p>
            <p className="mt-3 text-sm text-slate-400 flex items-start gap-1.5">
              <span className="text-amber-400 mt-0.5">💡</span>
              <span>{currentQuestion.tip}</span>
            </p>
          </div>

          <RecordingPanel
            transcript={transcript}
            interimTranscript={interimTranscript}
            recordingState={recordingState}
            isSupported={isSupported}
            audioUrl={audioUrl}
            onStart={startRecording}
            onStop={stopRecording}
            onReset={resetTranscript}
            debug={debug}
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
