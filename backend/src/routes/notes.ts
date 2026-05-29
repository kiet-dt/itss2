import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';

const router = Router();

router.get('/', (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM notes ORDER BY created_at DESC')
    .all() as Array<{
    id: string;
    pseudocode: string;
    mindmap: string | null;
    thinking_time: number;
    created_at: string;
    updated_at: string;
  }>;

  res.json(
    rows.map((row) => ({
      id: row.id,
      pseudocode: row.pseudocode,
      mindmap: row.mindmap ? JSON.parse(row.mindmap) : null,
      thinkingTime: row.thinking_time,
      timestamp: row.created_at,
      updatedAt: row.updated_at,
    }))
  );
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id) as
    | {
        id: string;
        pseudocode: string;
        mindmap: string | null;
        thinking_time: number;
        created_at: string;
        updated_at: string;
      }
    | undefined;

  if (!row) {
    res.status(404).json({ error: 'Không tìm thấy ghi chú' });
    return;
  }

  res.json({
    id: row.id,
    pseudocode: row.pseudocode,
    mindmap: row.mindmap ? JSON.parse(row.mindmap) : null,
    thinkingTime: row.thinking_time,
    timestamp: row.created_at,
    updatedAt: row.updated_at,
  });
});

router.post('/', (req, res) => {
  const { pseudocode = '', mindmap = null, thinkingTime = 15 } = req.body;
  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO notes (id, pseudocode, mindmap, thinking_time, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, pseudocode, mindmap ? JSON.stringify(mindmap) : null, thinkingTime, now, now);

  res.status(201).json({
    id,
    pseudocode,
    mindmap,
    thinkingTime,
    timestamp: now,
    updatedAt: now,
  });
});

router.put('/:id', (req, res) => {
  const { pseudocode, mindmap, thinkingTime } = req.body;
  const existing = db.prepare('SELECT id FROM notes WHERE id = ?').get(req.params.id);

  if (!existing) {
    res.status(404).json({ error: 'Không tìm thấy ghi chú' });
    return;
  }

  const now = new Date().toISOString();
  const current = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id) as {
    pseudocode: string;
    mindmap: string | null;
    thinking_time: number;
  };

  db.prepare(
    `UPDATE notes SET pseudocode = ?, mindmap = ?, thinking_time = ?, updated_at = ? WHERE id = ?`
  ).run(
    pseudocode ?? current.pseudocode,
    mindmap !== undefined ? (mindmap ? JSON.stringify(mindmap) : null) : current.mindmap,
    thinkingTime ?? current.thinking_time,
    now,
    req.params.id
  );

  res.json({ id: req.params.id, updatedAt: now });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Không tìm thấy ghi chú' });
    return;
  }
  res.json({ success: true });
});

export default router;
