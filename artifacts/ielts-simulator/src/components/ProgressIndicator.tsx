import { useTest, TestPart } from "@/context/TestContext";
import { Check } from "lucide-react";

const STEPS: { part: TestPart; label: string; sub: string }[] = [
  { part: "part1", label: "Part 1", sub: "General Questions" },
  { part: "part2", label: "Part 2", sub: "Cue Card" },
  { part: "part3", label: "Part 3", sub: "Discussion" },
];

const ORDER: TestPart[] = ["home", "part1", "part2", "part3", "results"];

function partIndex(part: TestPart) {
  return ORDER.indexOf(part);
}

export default function ProgressIndicator() {
  const { currentPart } = useTest();
  const currentIdx = partIndex(currentPart);

  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, i) => {
        const stepIdx = partIndex(step.part);
        const isCompleted = currentIdx > stepIdx;
        const isActive = currentIdx === stepIdx;

        return (
          <div key={step.part} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={[
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  isCompleted
                    ? "bg-indigo-600 text-white"
                    : isActive
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                    : "bg-slate-200 text-slate-400",
                ].join(" ")}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <div className="mt-1 text-center">
                <p
                  className={`text-xs font-semibold ${
                    isActive || isCompleted ? "text-indigo-600" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-slate-400 hidden sm:block">{step.sub}</p>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-0.5 mb-4 mx-1 transition-all ${
                  currentIdx > stepIdx ? "bg-indigo-400" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
