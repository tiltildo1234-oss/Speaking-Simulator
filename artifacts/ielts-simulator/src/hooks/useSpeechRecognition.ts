import { useState, useRef, useCallback, useEffect } from "react";

export type RecordingState = "idle" | "recording" | "stopped";

interface UseSpeechRecognitionReturn {
  transcript: string;
  interimTranscript: string;
  recordingState: RecordingState;
  isSupported: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  resetTranscript: () => void;
  audioUrl: string | null;
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Refs that never go stale
  const activeRef = useRef(false);          // true = user wants recognition running
  const finalRef = useRef("");              // all finalised text across restarts
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // spawnRef is updated every render so onend always calls the latest copy
  const spawnRef = useRef<() => void>(() => {});

  const SpeechRecognitionClass =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  const isSupported = !!SpeechRecognitionClass;

  // Defined as a plain function (not useCallback) so it can reference spawnRef cleanly.
  // Assigned to spawnRef.current after every render.
  function spawnRecognition() {
    if (!SpeechRecognitionClass || !activeRef.current) return;

    // Abort any existing instance before creating a new one
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }

    const r = new SpeechRecognitionClass();
    recognitionRef.current = r;
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-US";

    r.onresult = (event: SpeechRecognitionEvent) => {
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
      if (newFinal) {
        finalRef.current += newFinal;
        setTranscript(finalRef.current);
      }
      setInterimTranscript(interim);
    };

    r.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        // Fatal — user denied mic or browser blocked the service
        activeRef.current = false;
        setRecordingState("stopped");
        setInterimTranscript("");
      }
      // All other errors (no-speech, network, audio-capture, aborted):
      // do nothing — onend fires next and will restart via spawnRef
    };

    r.onend = () => {
      setInterimTranscript("");
      if (activeRef.current) {
        // Always restart through the ref so we get the latest closure, not a stale one
        setTimeout(() => spawnRef.current(), 150);
      }
    };

    try {
      r.start();
    } catch {
      // start() can throw if called too quickly — retry via ref
      setTimeout(() => spawnRef.current(), 200);
    }
  }

  // Keep spawnRef current every render
  spawnRef.current = spawnRecognition;

  const resetTranscript = useCallback(() => {
    finalRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    setAudioUrl(null);
  }, []);

  const startRecording = useCallback(async () => {
    // Reset state
    finalRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    setAudioUrl(null);
    chunksRef.current = [];
    activeRef.current = true;
    setRecordingState("recording");

    // MediaRecorder — for audio playback after stopping
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
      };
      mr.start();
    } catch {
      activeRef.current = false;
      setRecordingState("idle");
      return;
    }

    // Speech recognition — uses its own internal mic access, independent of MediaRecorder
    spawnRef.current();
  }, []);

  const stopRecording = useCallback(() => {
    activeRef.current = false;

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

  // Cleanup on unmount
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
  };
}
