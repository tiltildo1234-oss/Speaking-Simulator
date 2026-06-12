import { useState, useRef, useCallback, useEffect } from "react";

export type RecordingState = "idle" | "recording" | "stopped";

interface UseSpeechRecognitionReturn {
  transcript: string;
  interimTranscript: string;
  recordingState: RecordingState;
  isSupported: boolean;
  networkBlocked: boolean;
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
  const [networkBlocked, setNetworkBlocked] = useState(false);

  const activeRef = useRef(false);
  const finalRef = useRef("");
  const consecutiveNetworkErrorsRef = useRef(0);
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

  function spawnRecognition() {
    if (!SpeechRecognitionClass || !activeRef.current) return;

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
      // Successful result — reset the network-error counter
      consecutiveNetworkErrorsRef.current = 0;
      setNetworkBlocked(false);

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
        // Fatal — mic permission denied
        activeRef.current = false;
        setRecordingState("stopped");
        setInterimTranscript("");
        return;
      }

      if (event.error === "network") {
        consecutiveNetworkErrorsRef.current += 1;
        // After 2 consecutive network failures, stop retrying and show the error
        if (consecutiveNetworkErrorsRef.current >= 2) {
          activeRef.current = false;
          setNetworkBlocked(true);
          setRecordingState("stopped");
          setInterimTranscript("");
        }
        return;
      }

      // no-speech, audio-capture, aborted etc: let onend restart
    };

    r.onend = () => {
      setInterimTranscript("");
      if (activeRef.current) {
        setTimeout(() => spawnRef.current(), 150);
      }
    };

    try {
      r.start();
    } catch {
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
    consecutiveNetworkErrorsRef.current = 0;
    setTranscript("");
    setInterimTranscript("");
    setAudioUrl(null);
    setNetworkBlocked(false);
    chunksRef.current = [];
    activeRef.current = true;
    setRecordingState("recording");

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
    networkBlocked,
    startRecording,
    stopRecording,
    resetTranscript,
    audioUrl,
  };
}
