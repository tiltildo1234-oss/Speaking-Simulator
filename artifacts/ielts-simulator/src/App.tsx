import { Settings } from "lucide-react";
import { TestProvider, useTest } from "@/context/TestContext";
import { QuestionDBProvider } from "@/context/QuestionDBContext";
import ProgressIndicator from "@/components/ProgressIndicator";
import Home from "@/pages/home";
import Part1 from "@/pages/part1";
import Part2 from "@/pages/part2";
import Part3 from "@/pages/part3";
import Results from "@/pages/results";
import Admin from "@/pages/admin";

function TestShell() {
  const { currentPart, goToPart } = useTest();
  const showProgress =
    currentPart !== "home" && currentPart !== "results" && currentPart !== "admin";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => goToPart("home")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">IE</span>
              </div>
              <span className="text-sm font-bold text-slate-800">IELTS Speaking Test</span>
            </button>

            {currentPart !== "admin" ? (
              <button
                onClick={() => goToPart("admin")}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded-lg hover:bg-slate-50"
              >
                <Settings className="w-3.5 h-3.5" />
                Manage Questions
              </button>
            ) : (
              <button
                onClick={() => goToPart("home")}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                ← Back to Test
              </button>
            )}
          </div>
          {showProgress && <ProgressIndicator />}
        </div>
      </header>

      {currentPart === "home" && <Home />}
      {currentPart === "part1" && <Part1 />}
      {currentPart === "part2" && <Part2 />}
      {currentPart === "part3" && <Part3 />}
      {currentPart === "results" && <Results />}
      {currentPart === "admin" && <Admin />}
    </div>
  );
}

export default function App() {
  return (
    <QuestionDBProvider>
      <TestProvider>
        <TestShell />
      </TestProvider>
    </QuestionDBProvider>
  );
}
