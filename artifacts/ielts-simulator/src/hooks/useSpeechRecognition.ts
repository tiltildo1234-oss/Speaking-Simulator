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

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const SpeechRecognitionClass =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  const isSupported = !!SpeechRecognitionClass;

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setAudioUrl(null);
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
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
    setRecordingState("recording");
    chunksRef.current = [];

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
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
    } catch {
      setRecordingState("idle");
      return;
    }

    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript((prev) => prev + final);
      setInterimTranscript(interim);
    };

    recognition.onerror = () => {
      stopRecording();
    };

    recognition.onend = () => {
      setInterimTranscript("");
    };

    recognition.start();
  }, [SpeechRecognitionClass, resetTranscript, stopRecording]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
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
