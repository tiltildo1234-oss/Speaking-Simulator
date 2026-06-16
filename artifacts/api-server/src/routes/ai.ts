import { Router } from "express";
import { transcribe } from "../services/speechService";
import { analyze } from "../services/analysisService";
import { score } from "../services/scoringService";

const router = Router();

router.post("/transcribe", async (req, res) => {
  try {
    const { audioData, mimeType, durationSeconds, language } = req.body;
    if (!audioData || !mimeType) {
      res.status(400).json({ error: "audioData and mimeType are required" });
      return;
    }
    const result = await transcribe({ audioData, mimeType, durationSeconds, language });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Transcription failed" });
  }
});

router.post("/analyze", async (req, res) => {
  try {
    const { transcriptId, transcript, partNumber, question } = req.body;
    if (!transcriptId || !transcript || !partNumber) {
      res.status(400).json({ error: "transcriptId, transcript, and partNumber are required" });
      return;
    }
    const result = await analyze({ transcriptId, transcript, partNumber, question });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Analysis failed" });
  }
});

router.post("/score", async (req, res) => {
  try {
    const { analysisIds, analyses } = req.body;
    if (!analysisIds || !analyses) {
      res.status(400).json({ error: "analysisIds and analyses are required" });
      return;
    }
    const result = await score({ analysisIds, analyses });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Scoring failed" });
  }
});

export default router;
