import { useLocation } from "wouter";
import { Mic, Clock, FileText, ChevronRight, CheckCircle } from "lucide-react";
import { PART1_QUESTIONS } from "@/data/questions";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Hero card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">IELTS Speaking Simulator</h1>
              <p className="text-sm text-slate-500">Part 1 — General Questions</p>
            </div>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            Practice your IELTS Speaking Part 1 with {PART1_QUESTIONS.length} realistic questions. Speak your answer
            aloud, and see your transcript in real time. Move at your own pace.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <FileText className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-800">{PART1_QUESTIONS.length}</p>
              <p className="text-xs text-slate-500">Questions</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <Clock className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-800">~15</p>
              <p className="text-xs text-slate-500">Minutes</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <Mic className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-800">Live</p>
              <p className="text-xs text-slate-500">Transcript</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/simulator")}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Start Test
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Questions preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Topics Covered</h2>
          <div className="space-y-2">
            {PART1_QUESTIONS.map((q) => (
              <div key={q.id} className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-slate-600">{q.topic}</span>
                <span className="text-slate-300 hidden sm:inline">—</span>
                <span className="text-slate-400 hidden sm:inline truncate">{q.question}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Microphone access is required. Works best in Chrome or Edge.
        </p>
      </div>
    </div>
  );
}
