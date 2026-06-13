import { useRef, useState, useCallback } from "react";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { parsePDF, QuestionCard, QuestionType } from "@/lib/pdfParser";
import { useQDB } from "@/context/QuestionDBContext";
import { Quarter, randomId } from "@/data/questionsDB";

/* ─── Drag data helpers ─── */

interface DragPayload {
  cardId: string;
  text: string;
}

function setDragData(e: React.DragEvent, payload: DragPayload) {
  e.dataTransfer.setData("application/ielts-card", JSON.stringify(payload));
  e.dataTransfer.effectAllowed = "copy";
}

function getDragData(e: React.DragEvent): DragPayload | null {
  try {
    return JSON.parse(e.dataTransfer.getData("application/ielts-card"));
  } catch {
    return null;
  }
}

/* ─── Type badge ─── */

const TYPE_STYLES: Record<QuestionType, string> = {
  required: "bg-indigo-50 text-indigo-600 border-indigo-100",
  "follow-up": "bg-slate-100 text-slate-600 border-slate-200",
  "cue-card": "bg-amber-50 text-amber-700 border-amber-100",
  discussion: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

const TYPE_LABELS: Record<QuestionType, string> = {
  required: "Required",
  "follow-up": "Follow-up",
  "cue-card": "Cue Card",
  discussion: "Discussion",
};

function TypeBadge({ type }: { type: QuestionType }) {
  return (
    <span
      className={`shrink-0 text-[10px] font-semibold border px-1.5 py-0.5 rounded-full ${TYPE_STYLES[type]}`}
    >
      {TYPE_LABELS[type]}
    </span>
  );
}

/* ─── Draggable Question Card ─── */

function DraggableCard({
  card,
  used,
  onRemove,
}: {
  card: QuestionCard;
  used: boolean;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      draggable={!used}
      onDragStart={(e) => setDragData(e, { cardId: card.id, text: card.text })}
      className={`group relative flex items-start gap-2 p-3 rounded-xl border text-sm transition-all select-none
        ${used ? "bg-slate-50 border-slate-100 opacity-50 cursor-default" : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm cursor-grab active:cursor-grabbing"}`}
    >
      {used && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0 space-y-1.5">
        <TypeBadge type={card.type} />
        <p className={`leading-snug ${used ? "text-slate-400 line-through" : "text-slate-700"}`}>
          {card.text}
        </p>
      </div>
      <button
        onClick={() => onRemove(card.id)}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-red-500"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

/* ─── Drop Zone ─── */

type DropAction =
  | { kind: "p1-required"; topicId: string }
  | { kind: "p1-followup"; topicId: string }
  | { kind: "p2-title"; setId: string }
  | { kind: "p2-prompt"; setId: string }
  | { kind: "p3-question"; setId: string };

function DropZone({
  label,
  action,
  usedIds,
  onDrop,
}: {
  label: string;
  action: DropAction;
  usedIds: Set<string>;
  onDrop: (action: DropAction, payload: DragPayload) => void;
}) {
  const [over, setOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const payload = getDragData(e);
        if (payload && !usedIds.has(payload.cardId)) {
          onDrop(action, payload);
        }
      }}
      className={`flex items-center justify-center rounded-lg border-2 border-dashed px-3 py-2 text-xs font-medium transition-all
        ${over ? "border-indigo-400 bg-indigo-50 text-indigo-600" : "border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500"}`}
    >
      {over ? "Drop here" : label}
    </div>
  );
}

/* ─── Target Panel: one quarter's topics + sets ─── */

function TargetPanel({
  quarter,
  usedIds,
  onDrop,
}: {
  quarter: Quarter;
  usedIds: Set<string>;
  onDrop: (action: DropAction, payload: DragPayload) => void;
}) {
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [expandedSets, setExpandedSets] = useState<Set<string>>(new Set());

  function toggleTopic(id: string) {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSet(id: string) {
    setExpandedSets((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-5">
      {/* Part 1 */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
          Part 1 Topics
        </p>
        {quarter.part1Topics.length === 0 && (
          <p className="text-xs text-slate-400 italic">
            No topics yet — add topics in the Manual Edit tab first.
          </p>
        )}
        <div className="space-y-2">
          {quarter.part1Topics.map((t) => {
            const open = expandedTopics.has(t.id);
            return (
              <div key={t.id} className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleTopic(t.id)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-white text-left"
                >
                  {open ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className="text-sm font-semibold text-slate-700">
                    {t.topic || "Unnamed topic"}
                  </span>
                </button>
                {open && (
                  <div className="border-t border-slate-100 bg-slate-50 p-3 space-y-2">
                    <DropZone
                      label="↳ Drop as Required Question"
                      action={{ kind: "p1-required", topicId: t.id }}
                      usedIds={usedIds}
                      onDrop={onDrop}
                    />
                    <DropZone
                      label="↳ Drop as Follow-up Question"
                      action={{ kind: "p1-followup", topicId: t.id }}
                      usedIds={usedIds}
                      onDrop={onDrop}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Part 2+3 */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
          Part 2 + 3 Sets
        </p>
        {quarter.part2part3Sets.length === 0 && (
          <p className="text-xs text-slate-400 italic">
            No sets yet — add sets in the Manual Edit tab first.
          </p>
        )}
        <div className="space-y-2">
          {quarter.part2part3Sets.map((s) => {
            const open = expandedSets.has(s.id);
            return (
              <div key={s.id} className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSet(s.id)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-white text-left"
                >
                  {open ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-slate-700 block">
                      {s.topic || "Unnamed set"}
                    </span>
                    <span className="text-[10px] text-slate-400">Cue card + discussion pair</span>
                  </div>
                </button>
                {open && (
                  <div className="border-t border-slate-100 bg-slate-50 p-3 space-y-2">
                    <DropZone
                      label="↳ Drop as Cue Card Title (Part 2)"
                      action={{ kind: "p2-title", setId: s.id }}
                      usedIds={usedIds}
                      onDrop={onDrop}
                    />
                    <DropZone
                      label="↳ Drop as Cue Card Prompt (Part 2)"
                      action={{ kind: "p2-prompt", setId: s.id }}
                      usedIds={usedIds}
                      onDrop={onDrop}
                    />
                    <DropZone
                      label="↳ Drop as Discussion Question (Part 3)"
                      action={{ kind: "p3-question", setId: s.id }}
                      usedIds={usedIds}
                      onDrop={onDrop}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── PDF Uploader ─── */

type ParseStatus = "idle" | "parsing" | "done" | "error";

function PDFUploader({ onParsed }: { onParsed: (cards: QuestionCard[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<ParseStatus>("idle");
  const [fileName, setFileName] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);

  async function processFile(file: File) {
    if (file.type !== "application/pdf") {
      setStatus("error");
      setErrorMsg("Please upload a valid PDF file.");
      return;
    }
    setFileName(file.name);
    setStatus("parsing");
    setErrorMsg("");
    try {
      const cards = await parsePDF(file);
      if (cards.length === 0) {
        setStatus("error");
        setErrorMsg("No questions found in the PDF. Make sure the PDF contains readable text.");
        return;
      }
      setStatus("done");
      onParsed(cards);
    } catch (err) {
      setStatus("error");
      setErrorMsg("Failed to parse the PDF. Try a different file.");
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
      }}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 px-4 text-center transition-all
        ${dragOver ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40"}`}
    >
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileInput} />

      {status === "idle" && (
        <>
          <Upload className="w-6 h-6 text-slate-400" />
          <div>
            <p className="text-sm font-semibold text-slate-600">Upload a PDF</p>
            <p className="text-xs text-slate-400 mt-0.5">Click or drag & drop</p>
          </div>
        </>
      )}

      {status === "parsing" && (
        <>
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-600">Extracting questions from {fileName}…</p>
        </>
      )}

      {status === "done" && (
        <>
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          <div>
            <p className="text-sm font-semibold text-emerald-700">Parsed successfully!</p>
            <p className="text-xs text-slate-400 mt-0.5">{fileName} — click to upload another</p>
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <AlertCircle className="w-6 h-6 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-600">Parse failed</p>
            <p className="text-xs text-slate-400 mt-0.5">{errorMsg}</p>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Main PDF Builder Panel ─── */

export default function PDFBuilder({ quarter }: { quarter: Quarter | null }) {
  const { db, saveDB } = useQDB();
  const [cards, setCards] = useState<QuestionCard[]>([]);
  const [usedIds, setUsedIds] = useState<Set<string>>(new Set());

  const handleParsed = useCallback((newCards: QuestionCard[]) => {
    setCards((prev) => {
      const existingTexts = new Set(prev.map((c) => c.text.toLowerCase().trim()));
      const fresh = newCards.filter((c) => !existingTexts.has(c.text.toLowerCase().trim()));
      return [...prev, ...fresh];
    });
  }, []);

  function removeCard(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
    setUsedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function handleDrop(action: DropAction, payload: DragPayload) {
    if (!quarter) return;

    const updatedQuarter = { ...quarter };

    if (action.kind === "p1-required") {
      updatedQuarter.part1Topics = quarter.part1Topics.map((t) =>
        t.id === action.topicId ? { ...t, required: payload.text } : t,
      );
    } else if (action.kind === "p1-followup") {
      updatedQuarter.part1Topics = quarter.part1Topics.map((t) =>
        t.id === action.topicId ? { ...t, follow_ups: [...t.follow_ups, payload.text] } : t,
      );
    } else if (action.kind === "p2-title") {
      updatedQuarter.part2part3Sets = quarter.part2part3Sets.map((s) =>
        s.id === action.setId ? { ...s, part2: { ...s.part2, title: payload.text } } : s,
      );
    } else if (action.kind === "p2-prompt") {
      updatedQuarter.part2part3Sets = quarter.part2part3Sets.map((s) =>
        s.id === action.setId
          ? { ...s, part2: { ...s.part2, prompts: [...s.part2.prompts, payload.text] } }
          : s,
      );
    } else if (action.kind === "p3-question") {
      updatedQuarter.part2part3Sets = quarter.part2part3Sets.map((s) =>
        s.id === action.setId
          ? { ...s, part3: { questions: [...s.part3.questions, payload.text] } }
          : s,
      );
    }

    saveDB({ quarters: db.quarters.map((q) => (q.id === quarter.id ? updatedQuarter : q)) });
    setUsedIds((prev) => new Set([...prev, payload.cardId]));
  }

  return (
    <div className="flex gap-4 h-full min-h-0">
      {/* ── Left: Question Bank ── */}
      <div className="w-2/5 flex flex-col gap-3 min-h-0">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3 min-h-0">
          <div>
            <p className="text-sm font-bold text-slate-800">PDF Question Bank</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload a PDF, then drag questions into the drop zones on the right.
            </p>
          </div>

          <PDFUploader onParsed={handleParsed} />

          {cards.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                <span className="font-semibold">{cards.length}</span> question
                {cards.length !== 1 ? "s" : ""} extracted
                {usedIds.size > 0 && (
                  <span className="text-emerald-600">
                    {" "}
                    · {usedIds.size} placed
                  </span>
                )}
              </p>
              <button
                onClick={() => {
                  setCards([]);
                  setUsedIds(new Set());
                }}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}

          <div className="overflow-y-auto space-y-2 flex-1 pr-0.5">
            {cards.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <FileText className="w-8 h-8 text-slate-200" />
                <p className="text-xs text-slate-400">
                  Upload a PDF to see extracted questions here.
                </p>
              </div>
            )}
            {cards.map((card) => (
              <DraggableCard
                key={card.id}
                card={card}
                used={usedIds.has(card.id)}
                onRemove={removeCard}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Drop targets ── */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          {!quarter ? (
            <p className="text-sm text-slate-400 text-center py-10">
              Select a quarter to see drop targets.
            </p>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm font-bold text-slate-800">Drop Targets</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Expand a topic or set, then drag a card from the bank into a zone.
                </p>
              </div>
              <TargetPanel quarter={quarter} usedIds={usedIds} onDrop={handleDrop} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
