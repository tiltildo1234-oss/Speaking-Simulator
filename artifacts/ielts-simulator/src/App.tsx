import { TestProvider, useTest } from "@/context/TestContext";
import ProgressIndicator from "@/components/ProgressIndicator";
import Home from "@/pages/home";
import Part1 from "@/pages/part1";
import Part2 from "@/pages/part2";
import Part3 from "@/pages/part3";
import Results from "@/pages/results";

function TestShell() {
  const { currentPart } = useTest();
  const showProgress = currentPart !== "home" && currentPart !== "results";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Global header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">IE</span>
              </div>
              <span className="text-sm font-bold text-slate-800">IELTS Speaking Test</span>
            </div>
          </div>
          {showProgress && <ProgressIndicator />}
        </div>
      </header>

      {/* Page content */}
      {currentPart === "home" && <Home />}
      {currentPart === "part1" && <Part1 />}
      {currentPart === "part2" && <Part2 />}
      {currentPart === "part3" && <Part3 />}
      {currentPart === "results" && <Results />}
    </div>
  );
}

export default function App() {
  return (
    <TestProvider>
      <TestShell />
    </TestProvider>
  );
}
