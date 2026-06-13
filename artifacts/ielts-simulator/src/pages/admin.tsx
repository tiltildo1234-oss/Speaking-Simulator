import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Save, X, FileText, Settings2 } from "lucide-react";
import { useQDB } from "@/context/QuestionDBContext";
import { QDB, Quarter, Part1Topic, Part2Part3Set, randomId } from "@/data/questionsDB";
import PDFBuilder from "@/components/PDFBuilder";

function emptyPart1Topic(): Part1Topic {
  return { id: randomId(), topic: "", required: "", follow_ups: [""] };
}

function emptyPart2Part3Set(): Part2Part3Set {
  return {
    id: randomId(),
    topic: "",
    part2: { title: "", prompts: [""] },
    part3: { questions: [""] },
  };
}

function emptyQuarter(): Quarter {
  return { id: randomId(), name: "", part1Topics: [], part2part3Sets: [] };
}

/* ─── Shared UI atoms ─── */

function AutoTextarea({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={2}
      className={`w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 ${className}`}
    />
  );
}

function ListEditor({
  items,
  onChange,
  placeholder,
  addLabel,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel: string;
}) {
  function update(i: number, v: string) {
    const next = [...items];
    next[i] = v;
    onChange(next);
  }
  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <AutoTextarea value={item} onChange={(v) => update(i, v)} placeholder={placeholder} className="flex-1" />
          <button
            onClick={() => remove(i)}
            className="shrink-0 mt-1 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, ""])}
        className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> {addLabel}
      </button>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{children}</p>
  );
}

/* ─── Part 1 Topic card ─── */

function Part1TopicCard({
  topic,
  onSave,
  onDelete,
}: {
  topic: Part1Topic;
  onSave: (t: Part1Topic) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<Part1Topic>({ ...topic, follow_ups: [...topic.follow_ups] });
  const [expanded, setExpanded] = useState(false);
  const [dirty, setDirty] = useState(false);

  function patch(fn: (d: Part1Topic) => Part1Topic) {
    setDraft((d) => fn(d));
    setDirty(true);
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 bg-white px-4 py-3">
        <button onClick={() => setExpanded((e) => !e)} className="flex-1 flex items-center gap-2 text-left">
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
          <span className="text-sm font-semibold text-slate-700 truncate">
            {draft.topic || <span className="text-slate-400 italic font-normal">Unnamed topic</span>}
          </span>
        </button>
        {dirty && (
          <button onClick={() => { onSave(draft); setDirty(false); }} className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">
            <Save className="w-3 h-3" /> Save
          </button>
        )}
        <button onClick={onDelete} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 p-4 space-y-4">
          <div>
            <SectionLabel>Topic Name</SectionLabel>
            <input type="text" value={draft.topic} onChange={(e) => patch((d) => ({ ...d, topic: e.target.value }))} placeholder="e.g. Daily Routine"
              className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <SectionLabel>Required Question</SectionLabel>
            <AutoTextarea value={draft.required} onChange={(v) => patch((d) => ({ ...d, required: v }))} placeholder="The main opening question…" />
          </div>
          <div>
            <SectionLabel>Follow-up Questions</SectionLabel>
            <ListEditor items={draft.follow_ups} onChange={(items) => patch((d) => ({ ...d, follow_ups: items }))} placeholder="Follow-up question…" addLabel="Add follow-up" />
          </div>
          {dirty && (
            <button onClick={() => { onSave(draft); setDirty(false); }} className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors">
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Part 2+3 Set card ─── */

type SetTab = "part2" | "part3";

function Part2Part3Card({
  set,
  onSave,
  onDelete,
}: {
  set: Part2Part3Set;
  onSave: (s: Part2Part3Set) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<Part2Part3Set>({
    ...set,
    part2: { ...set.part2, prompts: [...set.part2.prompts] },
    part3: { questions: [...set.part3.questions] },
  });
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<SetTab>("part2");
  const [dirty, setDirty] = useState(false);

  function patch(fn: (d: Part2Part3Set) => Part2Part3Set) {
    setDraft((d) => fn(d));
    setDirty(true);
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 bg-white px-4 py-3">
        <button onClick={() => setExpanded((e) => !e)} className="flex-1 flex items-center gap-2 text-left">
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
          <div className="min-w-0">
            <span className="text-sm font-semibold text-slate-700 truncate block">
              {draft.topic || <span className="text-slate-400 italic font-normal">Unnamed set</span>}
            </span>
            <span className="text-[10px] text-slate-400">Part 2 + Part 3 paired</span>
          </div>
        </button>
        {dirty && (
          <button onClick={() => { onSave(draft); setDirty(false); }} className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">
            <Save className="w-3 h-3" /> Save
          </button>
        )}
        <button onClick={onDelete} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 p-4 space-y-4">
          <div>
            <SectionLabel>Topic / Theme Label</SectionLabel>
            <input type="text" value={draft.topic} onChange={(e) => patch((d) => ({ ...d, topic: e.target.value }))} placeholder="e.g. Technology in Life"
              className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>

          <div className="flex gap-1 bg-slate-200 p-1 rounded-xl w-fit">
            {(["part2", "part3"] as SetTab[]).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === tab ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {tab === "part2" ? "Part 2 — Cue Card" : "Part 3 — Discussion"}
              </button>
            ))}
          </div>

          {activeTab === "part2" && (
            <div className="space-y-4">
              <div>
                <SectionLabel>Cue Card Title</SectionLabel>
                <AutoTextarea value={draft.part2.title} onChange={(v) => patch((d) => ({ ...d, part2: { ...d.part2, title: v } }))} placeholder="Describe a … that …" />
              </div>
              <div>
                <SectionLabel>Prompts (You should say…)</SectionLabel>
                <ListEditor items={draft.part2.prompts} onChange={(items) => patch((d) => ({ ...d, part2: { ...d.part2, prompts: items } }))} placeholder="Prompt point…" addLabel="Add prompt" />
              </div>
            </div>
          )}

          {activeTab === "part3" && (
            <div>
              <SectionLabel>Discussion Questions</SectionLabel>
              <ListEditor items={draft.part3.questions} onChange={(items) => patch((d) => ({ ...d, part3: { questions: items } }))} placeholder="Discussion question…" addLabel="Add question" />
            </div>
          )}

          {dirty && (
            <button onClick={() => { onSave(draft); setDirty(false); }} className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors">
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main Admin Page ─── */

type AdminMode = "manual" | "pdf";
type AdminSection = "part1" | "sets";

export default function Admin() {
  const { db, saveDB } = useQDB();
  const [selectedQuarterId, setSelectedQuarterId] = useState<string>(db.quarters[0]?.id ?? "");
  const [addingQuarter, setAddingQuarter] = useState(false);
  const [newQuarterName, setNewQuarterName] = useState("");
  const [activeSection, setActiveSection] = useState<AdminSection>("part1");
  const [adminMode, setAdminMode] = useState<AdminMode>("manual");

  const selectedQuarter = db.quarters.find((q) => q.id === selectedQuarterId) ?? null;

  function updateDB(updatedDB: QDB) {
    saveDB(updatedDB);
  }

  function replaceQuarter(updated: Quarter) {
    updateDB({ quarters: db.quarters.map((q) => (q.id === updated.id ? updated : q)) });
  }

  function addQuarter() {
    if (!newQuarterName.trim()) return;
    const q = { ...emptyQuarter(), name: newQuarterName.trim() };
    const next: QDB = { quarters: [...db.quarters, q] };
    saveDB(next);
    setSelectedQuarterId(q.id);
    setNewQuarterName("");
    setAddingQuarter(false);
  }

  function deleteQuarter(id: string) {
    const next: QDB = { quarters: db.quarters.filter((q) => q.id !== id) };
    saveDB(next);
    setSelectedQuarterId(next.quarters[0]?.id ?? "");
  }

  function addPart1Topic() {
    if (!selectedQuarter) return;
    replaceQuarter({ ...selectedQuarter, part1Topics: [...selectedQuarter.part1Topics, emptyPart1Topic()] });
  }
  function savePart1Topic(updated: Part1Topic) {
    if (!selectedQuarter) return;
    replaceQuarter({ ...selectedQuarter, part1Topics: selectedQuarter.part1Topics.map((t) => (t.id === updated.id ? updated : t)) });
  }
  function deletePart1Topic(id: string) {
    if (!selectedQuarter) return;
    replaceQuarter({ ...selectedQuarter, part1Topics: selectedQuarter.part1Topics.filter((t) => t.id !== id) });
  }

  function addSet() {
    if (!selectedQuarter) return;
    replaceQuarter({ ...selectedQuarter, part2part3Sets: [...selectedQuarter.part2part3Sets, emptyPart2Part3Set()] });
  }
  function saveSet(updated: Part2Part3Set) {
    if (!selectedQuarter) return;
    replaceQuarter({ ...selectedQuarter, part2part3Sets: selectedQuarter.part2part3Sets.map((s) => (s.id === updated.id ? updated : s)) });
  }
  function deleteSet(id: string) {
    if (!selectedQuarter) return;
    replaceQuarter({ ...selectedQuarter, part2part3Sets: selectedQuarter.part2part3Sets.filter((s) => s.id !== id) });
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Question Kit Manager</p>
            <p className="text-xs text-slate-500 mt-0.5">All changes save automatically and persist across sessions.</p>
          </div>
          {/* Mode switcher */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setAdminMode("manual")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${adminMode === "manual" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Settings2 className="w-3 h-3" />
              Manual Edit
            </button>
            <button
              onClick={() => setAdminMode("pdf")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${adminMode === "pdf" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <FileText className="w-3 h-3" />
              PDF Builder
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className={`mx-auto ${adminMode === "pdf" ? "max-w-5xl h-full" : "max-w-3xl"} space-y-6`}>

          {/* Quarter tabs — shared between both modes */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Quarters</p>
              <button onClick={() => setAddingQuarter(true)} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Quarter
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {db.quarters.map((q) => (
                <div key={q.id} className="flex items-center gap-0.5">
                  <button onClick={() => setSelectedQuarterId(q.id)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${selectedQuarterId === q.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                    {q.name || "Unnamed"}
                  </button>
                  <button onClick={() => deleteQuarter(q.id)} className="w-5 h-5 flex items-center justify-center rounded-full text-slate-300 hover:text-red-400 transition-colors ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {db.quarters.length === 0 && <p className="text-sm text-slate-400 italic">No quarters yet.</p>}
            </div>

            {addingQuarter && (
              <div className="mt-4 flex gap-2">
                <input autoFocus type="text" value={newQuarterName} onChange={(e) => setNewQuarterName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addQuarter(); if (e.key === "Escape") { setAddingQuarter(false); setNewQuarterName(""); } }}
                  placeholder='e.g. "Q3 – Work & Leisure"'
                  className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                <button onClick={addQuarter} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors">Add</button>
                <button onClick={() => { setAddingQuarter(false); setNewQuarterName(""); }} className="px-3 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-sm transition-colors">Cancel</button>
              </div>
            )}
          </div>

          {/* ── PDF Builder mode ── */}
          {adminMode === "pdf" && (
            <PDFBuilder quarter={selectedQuarter} />
          )}

          {/* ── Manual Edit mode ── */}
          {adminMode === "manual" && selectedQuarter && (
            <>
              {/* Section switcher */}
              <div className="flex gap-2">
                <button onClick={() => setActiveSection("part1")}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors border ${activeSection === "part1" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50"}`}>
                  Part 1 Topics
                  <span className="ml-2 text-xs font-normal opacity-70">({selectedQuarter.part1Topics.length})</span>
                </button>
                <button onClick={() => setActiveSection("sets")}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors border ${activeSection === "sets" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50"}`}>
                  Part 2 + 3 Sets
                  <span className="ml-2 text-xs font-normal opacity-70">({selectedQuarter.part2part3Sets.length})</span>
                </button>
              </div>

              {activeSection === "part1" && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Part 1 Topics</p>
                      <p className="text-xs text-slate-400 mt-0.5">3 topics are randomly selected per test. Each: 1 required + 3 random follow-ups.</p>
                    </div>
                    <button onClick={addPart1Topic} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-semibold transition-colors shrink-0 ml-4">
                      <Plus className="w-3.5 h-3.5" /> Add Topic
                    </button>
                  </div>
                  {selectedQuarter.part1Topics.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 italic py-6">No topics yet — click "Add Topic" to start.</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedQuarter.part1Topics.map((t) => (
                        <Part1TopicCard key={t.id} topic={t} onSave={savePart1Topic} onDelete={() => deletePart1Topic(t.id)} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSection === "sets" && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Part 2 + Part 3 Sets</p>
                      <p className="text-xs text-slate-400 mt-0.5">One set is randomly selected per test. Part 2 cue card and Part 3 discussion always come from the same set.</p>
                    </div>
                    <button onClick={addSet} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-semibold transition-colors shrink-0 ml-4">
                      <Plus className="w-3.5 h-3.5" /> Add Set
                    </button>
                  </div>
                  {selectedQuarter.part2part3Sets.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 italic py-6">No sets yet — click "Add Set" to start.</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedQuarter.part2part3Sets.map((s) => (
                        <Part2Part3Card key={s.id} set={s} onSave={saveSet} onDelete={() => deleteSet(s.id)} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {adminMode === "manual" && !selectedQuarter && db.quarters.length > 0 && (
            <p className="text-center text-sm text-slate-400 italic py-6">Select a quarter above to manage its questions.</p>
          )}
        </div>
      </div>
    </div>
  );
}
