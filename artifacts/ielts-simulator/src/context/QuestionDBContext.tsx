import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { QDB } from "@/data/questionsDB";

const LS_KEY = "ielts_questionsDB";
const API_URL = "/api/questions";

interface QDBContextValue {
  db: QDB;
  isLoading: boolean;
  error: string | null;
  saveDB: (updated: QDB) => Promise<void>;
}

const QDBContext = createContext<QDBContextValue | null>(null);

export function QuestionDBProvider({ children }: { children: ReactNode }) {
  const [db, setDB] = useState<QDB>({ quarters: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("API error");
        const data: QDB = await res.json();
        setDB(data);
        localStorage.setItem(LS_KEY, JSON.stringify(data));
      } catch {
        const cached = localStorage.getItem(LS_KEY);
        if (cached) {
          try {
            setDB(JSON.parse(cached));
          } catch {
            setError("Failed to load questions database.");
          }
        } else {
          setError("Could not load questions — check API server.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const saveDB = useCallback(async (updated: QDB) => {
    setDB(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    try {
      await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch {
      // localStorage already updated as fallback; silently continue
    }
  }, []);

  return (
    <QDBContext.Provider value={{ db, isLoading, error, saveDB }}>
      {children}
    </QDBContext.Provider>
  );
}

export function useQDB() {
  const ctx = useContext(QDBContext);
  if (!ctx) throw new Error("useQDB must be inside QuestionDBProvider");
  return ctx;
}
