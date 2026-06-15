import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';

const router = Router();

function mapNote(row: {
  id: string;
  pseudocode: string;
  mindmap: string | null;
  problem_statement?: string;
  thinking_time: number;
  created_at: string;
  updated_at: string;
}) {
  return {
    id: row.id,
    pseudocode: row.pseudocode,
    mindmap: row.mindmap ? JSON.parse(row.mindmap) : null,
    problemStatement: row.problem_statement ?? '',
    thinkingTime: row.thinking_time,
    timestamp: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.get('/', (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM notes ORDER BY created_at DESC')
    .all() as Array<{
    id: string;
    pseudocode: string;
    mindmap: string | null;
    problem_statement: string;
    thinking_time: number;
    created_at: string;
    updated_at: string;
  }>;

  res.json(rows.map(mapNote));
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id) as
    | {
        id: string;
        pseudocode: string;
        mindmap: string | null;
        problem_statement: string;
        thinking_time: number;
        created_at: string;
        updated_at: string;
      }
    | undefined;

  if (!row) {
    res.status(404).json({ error: 'Không tìm thấy ghi chú' });
    return;
  }

  res.json(mapNote(row));
});

router.post('/', (req, res) => {
  const {
    pseudocode = '',
    mindmap = null,
    problemStatement = '',
    thinkingTime = 15,
  } = req.body;
  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO notes (id, pseudocode, mindmap, problem_statement, thinking_time, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    pseudocode,
    mindmap ? JSON.stringify(mindmap) : null,
    problemStatement,
    thinkingTime,
    now,
    now
  );

  res.status(201).json({
    id,
    pseudocode,
    mindmap,
    problemStatement,
    thinkingTime,
    timestamp: now,
    updatedAt: now,
  });
});

router.put('/:id', (req, res) => {
  const { pseudocode, mindmap, problemStatement, thinkingTime } = req.body;
  const existing = db.prepare('SELECT id FROM notes WHERE id = ?').get(req.params.id);

  if (!existing) {
    res.status(404).json({ error: 'Không tìm thấy ghi chú' });
    return;
  }

  const now = new Date().toISOString();
  const current = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id) as {
    pseudocode: string;
    mindmap: string | null;
    problem_statement: string;
    thinking_time: number;
  };

  db.prepare(
    `UPDATE notes SET pseudocode = ?, mindmap = ?, problem_statement = ?, thinking_time = ?, updated_at = ? WHERE id = ?`
  ).run(
    pseudocode ?? current.pseudocode,
    mindmap !== undefined ? (mindmap ? JSON.stringify(mindmap) : null) : current.mindmap,
    problemStatement ?? current.problem_statement,
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
