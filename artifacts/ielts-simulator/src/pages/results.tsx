import { useRef, useState } from "react";
import { CircleCheck as CheckCircle2, Volume2, RefreshCw, BrainCircuit, ChartBar as BarChart3, Loader as Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useTest } from "@/context/TestContext";
import type { AnalysisResult, ScoreResult } from "@/types/ai";

export default function Results() {
  const {
    part1Questions, part1Meta, part1Answers, part2Answer, part3Answers,
    selectedPair, resetTest, updatePart1Answer, updatePart2Answer,
    updatePart3Answer, scoreResult, setScoreResult,
  } = useTest();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [analyzingKey, setAnalyzingKey] = useState<string | null>(null);
  const [scoring, setScoring] = useState(false);

  function playAudio(url: string) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = url;
      audioRef.current.play();
    }
  }

  const answeredP1Count = Object.keys(part1Answers).length;
  const answeredP3Count = Object.keys(part3Answers).length;
  const part3Questions = selectedPair?.part3.questions ?? [];

  async function handleAnalyze(key: string, partNumber: 1 | 2 | 3, index?: number) {
    let answer;
    if (partNumber === 1 && index !== undefined) answer = part1Answers[index];
    else if (partNumber === 2) answer = part2Answer;
    else if (partNumber === 3 && index !== undefined) answer = part3Answers[index];
    if (!answer?.transcriptId || !answer?.transcript) return;

    setAnalyzingKey(key);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcriptId: answer.transcriptId,
          transcript: answer.transcript,
          partNumber,
        }),
      });
      if (!res.ok) throw new Error();
      const analysis: AnalysisResult = await res.json();
      const updated = { ...answer, analysis };
      if (partNumber === 1 && index !== undefined) updatePart1Answer(index, updated);
      else if (partNumber === 2) updatePart2Answer(updated);
      else if (partNumber === 3 && index !== undefined) updatePart3Answer(index, updated);
    } catch {
      // Silently fail for mock
    } finally {
      setAnalyzingKey(null);
    }
  }

  async function handleScore() {
    const allAnalyses: AnalysisResult[] = [];
    const analysisIds: string[] = [];

    for (const ans of Object.values(part1Answers)) {
      if (ans.analysis) { allAnalyses.push(ans.analysis); analysisIds.push(ans.analysis.id); }
    }
    if (part2Answer?.analysis) { allAnalyses.push(part2Answer.analysis); analysisIds.push(part2Answer.analysis.id); }
    for (const ans of Object.values(part3Answers)) {
      if (ans.analysis) { allAnalyses.push(ans.analysis); analysisIds.push(ans.analysis.id); }
    }
    if (allAnalyses.length === 0) return;

    setScoring(true);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisIds,
          analyses: allAnalyses.map((a) => ({
            vocabularyScore: a.vocabularyScore,
            coherenceScore: a.coherenceScore,
            grammarScore: a.grammarScore,
          })),
        }),
      });
      if (!res.ok) throw new Error();
      const result: ScoreResult = await res.json();
      setScoreResult(result);
    } catch {
      // Silently fail for mock
    } finally {
      setScoring(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-6 overflow-y-auto">
      <audio ref={audioRef} className="hidden" />
      <div className="w-full max-w-2xl space-y-6 pb-10">
        {/* Hero */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Test Complete!</h2>
          <p className="text-slate-500 text-sm">
            You completed all three parts of the IELTS Speaking Test.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
              <p className="text-2xl font-bold text-indigo-600">{answeredP1Count}</p>
              <p className="text-xs text-slate-500">Part 1 answers</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
              <p className="text-2xl font-bold text-indigo-600">{part2Answer ? 1 : 0}</p>
              <p className="text-xs text-slate-500">Part 2 response</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
              <p className="text-2xl font-bold text-indigo-600">{answeredP3Count}</p>
              <p className="text-xs text-slate-500">Part 3 answers</p>
            </div>
          </div>
        </div>

        {/* AI Score Card */}
        {scoreResult && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Band Score</h3>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{scoreResult.overallBand}</span>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <ScorePill label="Fluency" value={scoreResult.breakdown.fluency} />
                <ScorePill label="Lexical" value={scoreResult.breakdown.lexicalResource} />
                <ScorePill label="Grammar" value={scoreResult.breakdown.grammaticalRange} />
                <ScorePill label="Pronunciation" value={scoreResult.breakdown.pronunciation} />
              </div>
            </div>
            <p className="text-sm text-slate-600">{scoreResult.summary}</p>
          </div>
        )}

        {/* Part 1 */}
        <Section label="Part 1" sub="General Questions">
          <div className="space-y-3">
            {part1Questions.map((q, i) => {
              const meta = part1Meta[i];
              const answer = part1Answers[i];
              return (
                <AnswerRow
                  key={i}
                  topic={meta ? `${meta.topic} — ${meta.isRequired ? "Required" : "Follow-up"}` : `Q${i + 1}`}
                  question={q}
                  answer={answer}
                  analyzeKey={`p1-${i}`}
                  onPlay={playAudio}
                  onAnalyze={(k) => handleAnalyze(k, 1, i)}
                  isAnalyzing={analyzingKey === `p1-${i}`}
                />
              );
            })}
          </div>
        </Section>

        {/* Part 2 */}
        {selectedPair && (
          <Section label="Part 2" sub="Cue Card">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-3">
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">
                Topic
              </p>
              <p className="text-sm font-semibold text-indigo-900">{selectedPair.part2.title}</p>
            </div>
            <AnswerRow
              topic="Long Turn"
              question={selectedPair.part2.title}
              answer={part2Answer}
              analyzeKey="p2-0"
              onPlay={playAudio}
              onAnalyze={(k) => handleAnalyze(k, 2)}
              isAnalyzing={analyzingKey === "p2-0"}
              hideQuestion
            />
          </Section>
        )}

        {/* Part 3 */}
        {selectedPair && (
          <Section label="Part 3" sub={`Discussion — ${selectedPair.topic}`}>
            <div className="space-y-3">
              {part3Questions.map((q, i) => (
                <AnswerRow
                  key={i}
                  topic={`Q${i + 1}`}
                  question={q}
                  answer={part3Answers[i]}
                  analyzeKey={`p3-${i}`}
                  onPlay={playAudio}
                  onAnalyze={(k) => handleAnalyze(k, 3, i)}
                  isAnalyzing={analyzingKey === `p3-${i}`}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleScore}
            disabled={scoring}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            {scoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
            {scoring ? "Calculating Score..." : "Calculate Band Score"}
          </button>
          <button
            onClick={resetTest}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Start a New Test
          </button>
        </div>
      </div>
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-slate-50 rounded-lg px-3 py-1.5 flex items-center justify-between">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm font-bold text-slate-800">{value}</span>
    </div>
  );
}

function Section({ label, sub, children }: { label: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-baseline gap-2 mb-4">
        <h3 className="text-base font-bold text-slate-800">{label}</h3>
        <span className="text-xs text-slate-400">{sub}</span>
      </div>
      {children}
    </div>
  );
}

function AnswerRow({
  topic,
  question,
  answer,
  analyzeKey,
  onPlay,
  onAnalyze,
  isAnalyzing,
  hideQuestion = false,
}: {
  topic: string;
  question: string;
  answer: { transcript?: string; audioUrl?: string | null; analysis?: AnalysisResult } | null;
  analyzeKey: string;
  onPlay: (url: string) => void;
  onAnalyze: (key: string) => void;
  isAnalyzing: boolean;
  hideQuestion?: boolean;
}) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const hasTranscript = !!answer?.transcript;
  const hasAnalysis = !!answer?.analysis;
  const audioUrl = answer?.audioUrl ?? null;

  return (
    <div className="py-2 border-b border-slate-100 last:border-0">
      <div className="flex items-start gap-3">
        <span className="shrink-0 text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded mt-0.5 leading-tight max-w-[140px] text-left">
          {topic}
        </span>
        <div className="flex-1 min-w-0">
          {!hideQuestion && (
            <p className="text-xs font-medium text-slate-600 mb-1">{question}</p>
          )}
          {hasTranscript ? (
            <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">{answer!.transcript}</p>
          ) : audioUrl ? (
            <p className="text-xs text-emerald-600 font-medium">Audio recorded</p>
          ) : (
            <p className="text-xs text-slate-400 italic">No answer recorded</p>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-1.5">
          {hasTranscript && !hasAnalysis && (
            <button
              onClick={() => onAnalyze(analyzeKey)}
              disabled={isAnalyzing}
              className="w-7 h-7 rounded-full bg-amber-100 hover:bg-amber-200 disabled:opacity-60 flex items-center justify-center transition-colors"
              title="Analyze response"
            >
              {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" /> : <BrainCircuit className="w-3.5 h-3.5 text-amber-600" />}
            </button>
          )}
          {audioUrl && (
            <button
              onClick={() => onPlay(audioUrl)}
              className="w-7 h-7 rounded-full bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center transition-colors"
              title="Play recording"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
            </button>
          )}
        </div>
      </div>

      {/* Analysis section */}
      {hasAnalysis && (
        <div className="mt-2 ml-[calc(140px+12px)]">
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
          >
            <BrainCircuit className="w-3 h-3" />
            Analysis
            {showAnalysis ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showAnalysis && (
            <div className="mt-2 bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-2">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white rounded-lg px-2 py-1 text-center border border-amber-100">
                  <p className="text-slate-500">Vocabulary</p>
                  <p className="font-bold text-slate-800">{answer!.analysis!.vocabularyScore}</p>
                </div>
                <div className="bg-white rounded-lg px-2 py-1 text-center border border-amber-100">
                  <p className="text-slate-500">Coherence</p>
                  <p className="font-bold text-slate-800">{answer!.analysis!.coherenceScore}</p>
                </div>
                <div className="bg-white rounded-lg px-2 py-1 text-center border border-amber-100">
                  <p className="text-slate-500">Grammar</p>
                  <p className="font-bold text-slate-800">{answer!.analysis!.grammarScore}</p>
                </div>
              </div>
              {answer!.analysis!.issues.length > 0 && (
                <div className="space-y-1.5">
                  {answer!.analysis!.issues.map((issue, j) => (
                    <div key={j} className="bg-white rounded-lg px-3 py-2 border border-amber-100 text-xs">
                      <p className="font-semibold text-slate-700 capitalize">{issue.type}: {issue.description}</p>
                      <p className="text-slate-500 mt-0.5">{issue.suggestion}</p>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-600">{answer!.analysis!.feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
