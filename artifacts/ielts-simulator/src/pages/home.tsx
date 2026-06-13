import { useState } from "react";
import { Mic, Clock, FileText, ChevronRight } from "lucide-react";
import { useTest } from "@/context/TestContext";
import { useQDB } from "@/context/QuestionDBContext";

export default function Home() {
  const { startTest } = useTest();
  const { db, isLoading, error } = useQDB();
  const [selectedQuarterId, setSelectedQuarterId] = useState<string>("");

  const selectedQuarter = db.quarters.find((q) => q.id === selectedQuarterId) ?? null;
  const canStart = selectedQuarter !== null && selectedQuarter.topics.length > 0;

  function handleStart() {
    if (!selectedQuarter) return;
    startTest(selectedQuarter);
  }

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
          <div className="grid grid-cols-3 gap-3 mb-6">
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
              <p className="text-lg font-bold text-slate-800">Audio</p>
              <p className="text-xs text-slate-500">Playback</p>
            </div>
          </div>

          {/* Quarter selector */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Select a Quarter
            </p>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-2">
                {[0, 1].map((i) => (
                  <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : db.quarters.length === 0 ? (
              <p className="text-sm text-slate-400 italic">
                No quarters yet — add one via{" "}
                <span className="text-indigo-500 font-medium">Manage Questions</span>.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {db.quarters.map((q) => {
                  const [code, label] = q.name.includes(" – ")
                    ? q.name.split(" – ")
                    : [q.name, ""];
                  return (
                    <button
                      key={q.id}
                      onClick={() => setSelectedQuarterId(q.id)}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors text-left ${
                        selectedQuarterId === q.id
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/50"
                      }`}
                    >
                      <span className="font-bold">{code}</span>
                      {label && (
                        <span className="block text-xs text-slate-400 font-normal mt-0.5">
                          {label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={handleStart}
            disabled={!canStart}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
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
              desc="Required question + 3 follow-ups on the selected topic"
            />
            <PartRow
              number={2}
              label="Cue Card"
              desc="1-minute prep timer, then speak for up to 2 minutes"
            />
            <PartRow
              number={3}
              label="Discussion"
              desc="4 in-depth questions linked to the Part 1 & 2 topic"
            />
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">Microphone access required.</p>
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
