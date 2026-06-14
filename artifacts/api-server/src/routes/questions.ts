import { Router, type IRouter } from "express";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const router: IRouter = Router();
const DB_PATH = resolve(__dirname, "../questionsDB.json");

function readDB(): unknown {
  if (!existsSync(DB_PATH)) {
    return { quarters: [] };
  }
  try {
    return JSON.parse(readFileSync(DB_PATH, "utf-8"));
  } catch {
    return { quarters: [] };
  }
}

router.get("/questions", (_req, res) => {
  res.json(readDB());
});

router.put("/questions", (req, res) => {
  try {
    writeFileSync(DB_PATH, JSON.stringify(req.body, null, 2), "utf-8");
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to save questions database." });
  }
});

export default router;
