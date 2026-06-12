import { useRef } from "react";
import { CheckCircle2, Volume2, RefreshCw } from "lucide-react";
import { useTest } from "@/context/TestContext";
import { PART1_QUESTIONS } from "@/data/questions";

export default function Results() {
  const { part1Answers, part2Answer, part3Answers, cueCard, resetTest } = useTest();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function playAudio(url: string) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = url;
      audioRef.current.play();
    }
  }

  const answeredP1 = PART1_QUESTIONS.filter((q) => part1Answers[q.id]);
  const answeredP3 = cueCard.part3Questions.filter((_, i) => part3Answers[i]);

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
              <p className="text-2xl font-bold text-indigo-600">{answeredP1.length}</p>
              <p className="text-xs text-slate-500">Part 1 answers</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
              <p className="text-2xl font-bold text-indigo-600">{part2Answer ? 1 : 0}</p>
              <p className="text-xs text-slate-500">Part 2 response</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
              <p className="text-2xl font-bold text-indigo-600">{answeredP3.length}</p>
              <p className="text-xs text-slate-500">Part 3 answers</p>
            </div>
          </div>
        </div>

        {/* Part 1 */}
        <Section label="Part 1" sub="General Questions">
          <div className="space-y-3">
            {PART1_QUESTIONS.map((q) => {
              const ans = part1Answers[q.id];
              return (
                <AnswerRow
                  key={q.id}
                  topic={q.topic}
                  question={q.question}
                  transcript={ans?.transcript}
                  audioUrl={ans?.audioUrl ?? null}
                  onPlay={playAudio}
                />
              );
            })}
          </div>
        </Section>

        {/* Part 2 */}
        <Section label="Part 2" sub="Cue Card">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-3">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">Cue Card Topic</p>
            <p className="text-sm font-semibold text-indigo-900">{cueCard.title}</p>
          </div>
          <AnswerRow
            topic="Long Turn"
            question={cueCard.title}
            transcript={part2Answer?.transcript}
            audioUrl={part2Answer?.audioUrl ?? null}
            onPlay={playAudio}
            hideQuestion
          />
        </Section>

        {/* Part 3 */}
        <Section label="Part 3" sub="Discussion">
          <div className="space-y-3">
            {cueCard.part3Questions.map((q, i) => {
              const ans = part3Answers[i];
              return (
                <AnswerRow
                  key={i}
                  topic={`Q${i + 1}`}
                  question={q}
                  transcript={ans?.transcript}
                  audioUrl={ans?.audioUrl ?? null}
                  onPlay={playAudio}
                />
              );
            })}
          </div>
        </Section>

        <button
          onClick={resetTest}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Start a New Test
        </button>
      </div>
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
  transcript,
  audioUrl,
  onPlay,
  hideQuestion = false,
}: {
  topic: string;
  question: string;
  transcript?: string;
  audioUrl: string | null;
  onPlay: (url: string) => void;
  hideQuestion?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
      <span className="shrink-0 text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded mt-0.5">
        {topic}
      </span>
      <div className="flex-1 min-w-0">
        {!hideQuestion && (
          <p className="text-xs font-medium text-slate-600 mb-1">{question}</p>
        )}
        {transcript ? (
          <p className="text-xs text-slate-500 italic line-clamp-2">"{transcript}"</p>
        ) : (
          <p className="text-xs text-slate-400 italic">No answer recorded</p>
        )}
      </div>
      {audioUrl && (
        <button
          onClick={() => onPlay(audioUrl)}
          className="shrink-0 w-7 h-7 rounded-full bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center transition-colors"
          title="Play recording"
        >
          <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
        </button>
      )}
    </div>
  );
}
