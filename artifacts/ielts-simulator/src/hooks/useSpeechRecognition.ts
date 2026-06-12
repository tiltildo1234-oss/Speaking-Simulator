import { useState, useRef, useCallback, useEffect } from "react";

export type RecordingState = "idle" | "recording" | "stopped";

export interface SpeechDebugInfo {
  apiExists: boolean;
  apiName: string;
  startCalled: number;
  onstartFired: number;
  onresultFired: number;
  onerrorFired: number;
  onendFired: number;
  lastError: string;
  rawResultCount: number;
  spawnCount: number;
  logs: string[];
}

interface UseSpeechRecognitionReturn {
  transcript: string;
  interimTranscript: string;
  recordingState: RecordingState;
  isSupported: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  resetTranscript: () => void;
  audioUrl: string | null;
  debug: SpeechDebugInfo;
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

const MAX_LOGS = 30;

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [debug, setDebug] = useState<SpeechDebugInfo>(() => {
    const cls =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;
    return {
      apiExists: !!cls,
      apiName: cls
        ? window.SpeechRecognition
          ? "window.SpeechRecognition"
          : "window.webkitSpeechRecognition"
        : "NOT FOUND",
      startCalled: 0,
      onstartFired: 0,
      onresultFired: 0,
      onerrorFired: 0,
      onendFired: 0,
      lastError: "",
      rawResultCount: 0,
      spawnCount: 0,
      logs: [],
    };
  });

  const activeRef = useRef(false);
  const finalRef = useRef("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const spawnRef = useRef<() => void>(() => {});

  const SpeechRecognitionClass =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  const isSupported = !!SpeechRecognitionClass;

  function pushLog(msg: string) {
    const ts = new Date().toISOString().slice(11, 23);
    setDebug((prev) => ({
      ...prev,
      logs: [`[${ts}] ${msg}`, ...prev.logs].slice(0, MAX_LOGS),
    }));
  }

  function spawnRecognition() {
    if (!SpeechRecognitionClass) {
      pushLog("ERROR: SpeechRecognition class not found — cannot spawn");
      return;
    }
    if (!activeRef.current) {
      pushLog("spawnRecognition skipped — activeRef is false");
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }

    setDebug((prev) => ({
      ...prev,
      spawnCount: prev.spawnCount + 1,
      logs: [`[${new Date().toISOString().slice(11, 23)}] spawnRecognition #${prev.spawnCount + 1}`, ...prev.logs].slice(0, MAX_LOGS),
    }));

    const r = new SpeechRecognitionClass();
    recognitionRef.current = r;
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-US";

    r.onstart = () => {
      setDebug((prev) => ({ ...prev, onstartFired: prev.onstartFired + 1 }));
      pushLog("onstart fired ✓");
    };

    r.onresult = (event: SpeechRecognitionEvent) => {
      setDebug((prev) => ({
        ...prev,
        onresultFired: prev.onresultFired + 1,
        rawResultCount: prev.rawResultCount + event.results.length,
      }));

      let newFinal = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          newFinal += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }

      pushLog(`onresult: final="${newFinal.trim()}" interim="${interim}"`);

      if (newFinal) {
        finalRef.current += newFinal;
        setTranscript(finalRef.current);
      }
      setInterimTranscript(interim);
    };

    r.onerror = (event: SpeechRecognitionErrorEvent) => {
      setDebug((prev) => ({
        ...prev,
        onerrorFired: prev.onerrorFired + 1,
        lastError: event.error,
      }));
      pushLog(`onerror: "${event.error}"`);

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        activeRef.current = false;
        setRecordingState("stopped");
        setInterimTranscript("");
      }
      // All other errors: let onend restart
    };

    r.onend = () => {
      setDebug((prev) => ({ ...prev, onendFired: prev.onendFired + 1 }));
      pushLog(`onend fired — activeRef=${activeRef.current}`);
      setInterimTranscript("");
      if (activeRef.current) {
        setTimeout(() => spawnRef.current(), 150);
      }
    };

    try {
      r.start();
      setDebug((prev) => ({ ...prev, startCalled: prev.startCalled + 1 }));
      pushLog("recognition.start() called ✓");
    } catch (err) {
      pushLog(`recognition.start() threw: ${String(err)}`);
      setTimeout(() => spawnRef.current(), 200);
    }
  }

  spawnRef.current = spawnRecognition;

  const resetTranscript = useCallback(() => {
    finalRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    setAudioUrl(null);
  }, []);

  const startRecording = useCallback(async () => {
    finalRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    setAudioUrl(null);
    chunksRef.current = [];
    activeRef.current = true;
    setRecordingState("recording");

    setDebug((prev) => ({
      ...prev,
      startCalled: 0,
      onstartFired: 0,
      onresultFired: 0,
      onerrorFired: 0,
      onendFired: 0,
      lastError: "",
      rawResultCount: 0,
      spawnCount: 0,
      logs: [`[${new Date().toISOString().slice(11, 23)}] --- startRecording ---`],
    }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      pushLog("getUserMedia OK ✓");

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
      };
      mr.start();
      pushLog("MediaRecorder started ✓");
    } catch (err) {
      pushLog(`getUserMedia FAILED: ${String(err)}`);
      activeRef.current = false;
      setRecordingState("idle");
      return;
    }

    spawnRef.current();
  }, []);

  const stopRecording = useCallback(() => {
    activeRef.current = false;
    pushLog("stopRecording called");

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setRecordingState("stopped");
    setInterimTranscript("");
  }, []);

  useEffect(() => {
    return () => {
      activeRef.current = false;
      if (recognitionRef.current) { try { recognitionRef.current.abort(); } catch { /* ignore */ } }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return {
    transcript,
    interimTranscript,
    recordingState,
    isSupported,
    startRecording,
    stopRecording,
    resetTranscript,
    audioUrl,
    debug,
  };
}
