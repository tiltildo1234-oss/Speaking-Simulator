import { useTest } from "@/context/TestContext";
import { Mic, Clock, FileText, ChevronRight, CheckCircle } from "lucide-react";
import { PART1_QUESTIONS } from "@/data/questions";

export default function Home() {
  const { goToPart } = useTest();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-5">
        {/* Hero card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">IELTS Speaking Test</h1>
              <p className="text-sm text-slate-500">Full simulation — Parts 1, 2 &amp; 3</p>
            </div>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            Practice the complete IELTS Speaking exam. Answer general questions in Part 1, give a
            long talk from a cue card in Part 2, and discuss related topics in depth in Part 3.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <FileText className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-800">3</p>
              <p className="text-xs text-slate-500">Parts</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <Clock className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-800">~20</p>
              <p className="text-xs text-slate-500">Minutes</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <Mic className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-800">Live</p>
              <p className="text-xs text-slate-500">Transcript</p>
            </div>
          </div>

          <button
            onClick={() => goToPart("part1")}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Start Test
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Test structure */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Test Structure</h2>
          <div className="space-y-4">
            <PartRow
              number={1}
              label="General Questions"
              desc={`${PART1_QUESTIONS.length} questions on everyday topics — one at a time`}
            />
            <PartRow
              number={2}
              label="Cue Card"
              desc="1-minute prep timer, then speak for up to 2 minutes"
            />
            <PartRow
              number={3}
              label="Discussion"
              desc="5 in-depth questions linked to the Part 2 topic"
            />
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          Microphone access required. Live transcription works best in Chrome or Edge.
        </p>
      </div>
    </div>
  );
}

function PartRow({ number, label, desc }: { number: number; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
        {number}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
