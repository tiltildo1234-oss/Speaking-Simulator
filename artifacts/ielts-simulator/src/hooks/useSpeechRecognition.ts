import { useState, useRef, useCallback, useEffect } from "react";
import type { TranscriptResult } from "@/types/ai";

export type RecordingState = "idle" | "recording" | "stopped";

interface UseAudioRecorderReturn {
  recordingState: RecordingState;
  startRecording: () => void;
  stopRecording: () => void;
  resetRecording: () => void;
  audioUrl: string | null;
  transcript: TranscriptResult | null;
  isTranscribing: boolean;
}

async function transcribeAudio(blob: Blob): Promise<TranscriptResult> {
  const reader = new FileReader();
  const dataUrl = await new Promise<string>((resolve) => {
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });

  const res = await fetch("/api/transcribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      audioData: dataUrl,
      mimeType: blob.type,
      language: "en",
    }),
  });

  if (!res.ok) throw new Error("Transcription failed");
  return res.json();
}

export function useSpeechRecognition(): UseAudioRecorderReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptResult | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    setAudioUrl(null);
    setTranscript(null);
    chunksRef.current = [];

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
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Transcribe in background
        setIsTranscribing(true);
        transcribeAudio(blob)
          .then(setTranscript)
          .catch(() => setTranscript(null))
          .finally(() => setIsTranscribing(false));
      };
      mr.start();
      setRecordingState("recording");
    } catch {
      setRecordingState("idle");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setRecordingState("stopped");
  }, []);

  const resetRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setAudioUrl(null);
    setTranscript(null);
    setRecordingState("idle");
  }, []);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return { recordingState, startRecording, stopRecording, resetRecording, audioUrl, transcript, isTranscribing };
}
