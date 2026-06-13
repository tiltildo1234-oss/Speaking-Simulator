import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Save, X } from "lucide-react";
import { useQDB } from "@/context/QuestionDBContext";
import { QDB, Quarter, Topic, randomId } from "@/data/questionsDB";

type ActiveTab = "part1" | "part2" | "part3";

function emptyTopic(): Topic {
  return {
    id: randomId(),
    topic: "",
    part1: { required: "", follow_ups: [""] },
    part2: { title: "", prompts: [""] },
    part3: { questions: [""] },
  };
}

function emptyQuarter(): Quarter {
  return { id: randomId(), name: "", topics: [] };
}

/* ── Textarea that auto-grows ── */
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

/* ── String list editor (follow_ups, prompts, questions) ── */
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
  function add() {
    onChange([...items, ""]);
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <AutoTextarea
            value={item}
            onChange={(v) => update(i, v)}
            placeholder={placeholder}
            className="flex-1"
          />
          <button
            onClick={() => remove(i)}
            className="shrink-0 mt-1 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Remove"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> {addLabel}
      </button>
    </div>
  );
}

/* ── Topic editor card ── */
function TopicCard({
  topic,
  onSave,
  onDelete,
}: {
  topic: Topic;
  onSave: (t: Topic) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<Topic>({ ...topic, part1: { ...topic.part1, follow_ups: [...topic.part1.follow_ups] }, part2: { ...topic.part2, prompts: [...topic.part2.prompts] }, part3: { ...topic.part3, questions: [...topic.part3.questions] } });
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("part1");
  const [dirty, setDirty] = useState(false);

  function patch(fn: (d: Topic) => Topic) {
    setDraft((d) => fn(d));
    setDirty(true);
  }

  function handleSave() {
    onSave(draft);
    setDirty(false);
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white px-4 py-3">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex-1 flex items-center gap-2 text-left"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          )}
          <span className="text-sm font-semibold text-slate-700 truncate">
            {draft.topic || <span className="text-slate-400 italic">Unnamed topic</span>}
          </span>
        </button>
        {dirty && (
          <button
            onClick={handleSave}
            className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg font-medium transition-colors"
          >
            <Save className="w-3 h-3" /> Save
          </button>
        )}
        <button
          onClick={onDelete}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Delete topic"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 p-4 space-y-4">
          {/* Topic name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Topic Name
            </label>
            <input
              type="text"
              value={draft.topic}
              onChange={(e) => patch((d) => ({ ...d, topic: e.target.value }))}
              placeholder="e.g. Daily Routine"
              className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-200 p-1 rounded-xl w-fit">
            {(["part1", "part2", "part3"] as ActiveTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === tab
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab === "part1" ? "Part 1" : tab === "part2" ? "Part 2" : "Part 3"}
              </button>
            ))}
          </div>

          {/* Part 1 */}
          {activeTab === "part1" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Required Question
                </label>
                <AutoTextarea
                  value={draft.part1.required}
                  onChange={(v) =>
                    patch((d) => ({ ...d, part1: { ...d.part1, required: v } }))
                  }
                  placeholder="The opening question the examiner always asks…"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Follow-up Questions
                </label>
                <ListEditor
                  items={draft.part1.follow_ups}
                  onChange={(items) =>
                    patch((d) => ({ ...d, part1: { ...d.part1, follow_ups: items } }))
                  }
                  placeholder="Follow-up question…"
                  addLabel="Add follow-up"
                />
              </div>
            </div>
          )}

          {/* Part 2 */}
          {activeTab === "part2" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Cue Card Title
                </label>
                <AutoTextarea
                  value={draft.part2.title}
                  onChange={(v) =>
                    patch((d) => ({ ...d, part2: { ...d.part2, title: v } }))
                  }
                  placeholder="Describe a … that …"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Prompts (You should say…)
                </label>
                <ListEditor
                  items={draft.part2.prompts}
                  onChange={(items) =>
                    patch((d) => ({ ...d, part2: { ...d.part2, prompts: items } }))
                  }
                  placeholder="Prompt point…"
                  addLabel="Add prompt"
                />
              </div>
            </div>
          )}

          {/* Part 3 */}
          {activeTab === "part3" && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Discussion Questions
              </label>
              <ListEditor
                items={draft.part3.questions}
                onChange={(items) =>
                  patch((d) => ({ ...d, part3: { questions: items } }))
                }
                placeholder="Discussion question…"
                addLabel="Add question"
              />
            </div>
          )}

          {dirty && (
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Admin Page ── */
export default function Admin() {
  const { db, saveDB } = useQDB();
  const [selectedQuarterId, setSelectedQuarterId] = useState<string>(
    db.quarters[0]?.id ?? ""
  );
  const [addingQuarter, setAddingQuarter] = useState(false);
  const [newQuarterName, setNewQuarterName] = useState("");

  const selectedQuarter = db.quarters.find((q) => q.id === selectedQuarterId) ?? null;

  /* helpers that mutate the whole DB and save */
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

  function addTopic() {
    if (!selectedQuarter) return;
    const t = emptyTopic();
    replaceQuarter({ ...selectedQuarter, topics: [...selectedQuarter.topics, t] });
  }

  function saveTopic(updated: Topic) {
    if (!selectedQuarter) return;
    replaceQuarter({
      ...selectedQuarter,
      topics: selectedQuarter.topics.map((t) => (t.id === updated.id ? updated : t)),
    });
  }

  function deleteTopic(id: string) {
    if (!selectedQuarter) return;
    replaceQuarter({
      ...selectedQuarter,
      topics: selectedQuarter.topics.filter((t) => t.id !== id),
    });
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
            Question Kit Manager
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            All changes are saved automatically and persist across sessions.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Quarter tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Quarters</p>
              <button
                onClick={() => setAddingQuarter(true)}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Quarter
              </button>
            </div>

            {/* Quarter buttons */}
            <div className="flex flex-wrap gap-2">
              {db.quarters.map((q) => (
                <div key={q.id} className="flex items-center gap-0.5">
                  <button
                    onClick={() => setSelectedQuarterId(q.id)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                      selectedQuarterId === q.id
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {q.name || "Unnamed"}
                  </button>
                  <button
                    onClick={() => deleteQuarter(q.id)}
                    className="w-5 h-5 flex items-center justify-center rounded-full text-slate-300 hover:text-red-400 transition-colors ml-0.5"
                    title="Delete quarter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {db.quarters.length === 0 && (
                <p className="text-sm text-slate-400 italic">No quarters yet.</p>
              )}
            </div>

            {/* Add quarter inline form */}
            {addingQuarter && (
              <div className="mt-4 flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={newQuarterName}
                  onChange={(e) => setNewQuarterName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addQuarter();
                    if (e.key === "Escape") { setAddingQuarter(false); setNewQuarterName(""); }
                  }}
                  placeholder='e.g. "Q3 – Work & Leisure"'
                  className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <button
                  onClick={addQuarter}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => { setAddingQuarter(false); setNewQuarterName(""); }}
                  className="px-3 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Topics for selected quarter */}
          {selectedQuarter ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">{selectedQuarter.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedQuarter.topics.length} topic
                    {selectedQuarter.topics.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={addTopic}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Topic
                </button>
              </div>

              {selectedQuarter.topics.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm">No topics yet.</p>
                  <p className="text-xs mt-1">Click "Add Topic" to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedQuarter.topics.map((topic) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      onSave={saveTopic}
                      onDelete={() => deleteTopic(topic.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            db.quarters.length > 0 && (
              <p className="text-center text-sm text-slate-400 italic">
                Select a quarter above to manage its topics.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
