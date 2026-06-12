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

const FATAL_ERRORS = new Set(["not-allowed", "service-not-allowed"]);

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Intent flag: true = user wants recognition running, false = user stopped it
  const shouldBeRecordingRef = useRef(false);
  // Accumulates all finalised text so restarts don't lose it
  const finalTranscriptRef = useRef("");

  const SpeechRecognitionClass =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  const isSupported = !!SpeechRecognitionClass;

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setAudioUrl(null);
    finalTranscriptRef.current = "";
  }, []);

  // Starts (or restarts) just the SpeechRecognition instance
  const startRecognition = useCallback(() => {
    if (!SpeechRecognitionClass || !shouldBeRecordingRef.current) return;

    // Abort any existing instance cleanly before creating a new one
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognitionClass();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
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
        finalTranscriptRef.current += newFinal;
        setTranscript(finalTranscriptRef.current);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Only fatal errors should stop recording entirely
      if (FATAL_ERRORS.has(event.error)) {
        shouldBeRecordingRef.current = false;
        setRecordingState("stopped");
        setInterimTranscript("");
      }
      // For no-speech, network, audio-capture, aborted etc: let onend handle restart
    };

    recognition.onend = () => {
      setInterimTranscript("");
      // If the user hasn't explicitly stopped, restart immediately
      if (shouldBeRecordingRef.current) {
        // Small delay avoids rapid-fire restarts on some mobile browsers
        setTimeout(() => startRecognition(), 100);
      }
    };

    try {
      recognition.start();
    } catch {
      // If start() throws (e.g. already started), retry after a tick
      setTimeout(() => startRecognition(), 200);
    }
  }, [SpeechRecognitionClass]);

  // Expose startRecognition via a stable ref so onend closure always sees latest
  const startRecognitionRef = useRef(startRecognition);
  startRecognitionRef.current = startRecognition;

  const stopRecording = useCallback(() => {
    shouldBeRecordingRef.current = false;

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
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

  const startRecording = useCallback(async () => {
    resetTranscript();
    shouldBeRecordingRef.current = true;
    setRecordingState("recording");
    chunksRef.current = [];

    // Start MediaRecorder for audio playback
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
      };
      mediaRecorder.start();
    } catch {
      shouldBeRecordingRef.current = false;
      setRecordingState("idle");
      return;
    }

    // Start speech recognition
    startRecognition();
  }, [resetTranscript, startRecognition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldBeRecordingRef.current = false;
      if (recognitionRef.current) { try { recognitionRef.current.abort(); } catch {} }
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
