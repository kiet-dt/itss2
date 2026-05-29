import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { analyzeReflection, analyzeAuthenticity } from '../services/analysisService.js';

const router = Router();

router.post('/reflection', (req, res) => {
  const { pseudocode = '', thinkingTime = 15, noteId } = req.body;
  const result = analyzeReflection(pseudocode, thinkingTime);

  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO analyses (id, note_id, type, result, created_at) VALUES (?, ?, ?, ?, ?)`
  ).run(id, noteId ?? null, 'reflection', JSON.stringify(result), now);

  if (noteId) {
    const sessionId = uuidv4();
    db.prepare(
      `INSERT INTO sessions (id, note_id, thinking_score, authenticity_score, thinking_time, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(sessionId, noteId, result.thinkingScore, null, thinkingTime, now);
  }

  res.json(result);
});

router.post('/authenticity', (req, res) => {
  const { content = '', noteId } = req.body;

  if (content.length < 50) {
    res.status(400).json({ error: 'Nội dung quá ngắn để phân tích (tối thiểu 50 ký tự)' });
    return;
  }

  const result = analyzeAuthenticity(content);
  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO analyses (id, note_id, type, result, created_at) VALUES (?, ?, ?, ?, ?)`
  ).run(id, noteId ?? null, 'authenticity', JSON.stringify(result), now);

  if (noteId) {
    const latest = db
      .prepare('SELECT id FROM sessions WHERE note_id = ? ORDER BY created_at DESC LIMIT 1')
      .get(noteId) as { id: string } | undefined;

    if (latest) {
      db.prepare('UPDATE sessions SET authenticity_score = ? WHERE id = ?').run(
        result.originalScore,
        latest.id
      );
    }
  }

  res.json(result);
});

export default router;
