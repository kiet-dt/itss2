import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { analyzeWithGemini, GeminiAnalysisError } from '../services/geminiService.js';

const router = Router();

router.post('/reflection', async (req, res) => {
  const {
    problemStatement = '',
    pseudocode = '',
    mindmapData = null,
    thinkingTime = 15,
    thinkingMinutes,
    editCount = 0,
    rewriteCount = 0,
    noteId,
  } = req.body;

  const minutes = thinkingMinutes ?? thinkingTime ?? 15;

  if (!problemStatement?.trim()) {
    res.status(400).json({ error: 'Hãy mô tả bài toán trước khi phân tích' });
    return;
  }

  try {
    const result = await analyzeWithGemini({
      problemStatement,
      pseudocode,
      mindmapData,
      thinkingMinutes: minutes,
      editCount,
      rewriteCount,
    });

    const id = uuidv4();
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO analyses (id, note_id, type, result, created_at) VALUES (?, ?, ?, ?, ?)`
    ).run(id, noteId ?? null, 'reflection', JSON.stringify(result), now);

    if (noteId) {
      const sessionId = uuidv4();
      db.prepare(
        `INSERT INTO sessions (id, note_id, thinking_score, authenticity_score, thinking_time,
         problem_statement, edit_count, rewrite_count, ai_analysis_result, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        sessionId,
        noteId,
        result.thinkingScore,
        result.authenticityScore,
        minutes,
        problemStatement,
        editCount,
        rewriteCount,
        JSON.stringify(result),
        now
      );
    }

    res.json(result);
  } catch (err) {
    const message =
      err instanceof GeminiAnalysisError
        ? err.message
        : 'Phân tích thất bại. Vui lòng thử lại sau.';
    const status = err instanceof GeminiAnalysisError && err.message.includes('chưa được cấu hình') ? 503 : 502;
    res.status(status).json({ error: message });
  }
});

export default router;
