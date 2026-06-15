import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function groupByDay<T extends { created_at: string }>(
  items: T[],
  getValue: (item: T) => number | null
) {
  const map = new Map<string, number[]>();
  for (const item of items) {
    const d = new Date(item.created_at);
    const label = DAY_LABELS[d.getDay()];
    const val = getValue(item);
    if (val == null) continue;
    const arr = map.get(label) ?? [];
    arr.push(val);
    map.set(label, arr);
  }
  const weekOrder = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  return weekOrder.map((day) => {
    const vals = map.get(day) ?? [];
    return {
      day,
      value: vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0,
    };
  });
}

router.get('/dashboard', (_req, res) => {
  const sessions = db
    .prepare(
      `SELECT s.*, n.problem_statement as note_problem
       FROM sessions s
       LEFT JOIN notes n ON n.id = s.note_id
       WHERE s.created_at >= datetime('now', '-30 days')
       ORDER BY s.created_at ASC`
    )
    .all() as Array<{
    thinking_score: number | null;
    authenticity_score: number | null;
    thinking_time: number;
    edit_count: number;
    rewrite_count: number;
    problem_statement: string | null;
    note_problem: string | null;
    created_at: string;
  }>;

  const avg = (vals: number[]) =>
    vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;

  const thinkingScores = sessions.map((s) => s.thinking_score).filter((v): v is number => v != null);
  const authScores = sessions.map((s) => s.authenticity_score).filter((v): v is number => v != null);

  const aiUsageCount = db
    .prepare(`SELECT COUNT(*) as c FROM analyses WHERE type = 'reflection'`)
    .get() as { c: number };

  const problemsSolved = db.prepare(`SELECT COUNT(*) as c FROM notes`).get() as { c: number };

  const problemCounts = new Map<string, number>();
  for (const s of sessions) {
    const p = (s.problem_statement || s.note_problem || '').trim();
    if (!p) continue;
    const key = p.length > 40 ? p.slice(0, 40) + '…' : p;
    problemCounts.set(key, (problemCounts.get(key) ?? 0) + 1);
  }
  const topProblems = [...problemCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const weekOrder = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const sessionCountMap = new Map<string, number>();
  for (const s of sessions) {
    const label = DAY_LABELS[new Date(s.created_at).getDay()];
    sessionCountMap.set(label, (sessionCountMap.get(label) ?? 0) + 1);
  }
  const weeklySessions = weekOrder.map((day) => ({
    day,
    count: sessionCountMap.get(day) ?? 0,
  }));

  res.json({
    thinkingScore: avg(thinkingScores) || 0,
    authenticityScore: avg(authScores) || 0,
    totalFocusTime: sessions.reduce((s, x) => s + x.thinking_time, 0),
    aiUsageCount: aiUsageCount.c,
    problemsSolved: problemsSolved.c,
    rewriteCount: sessions.reduce((s, x) => s + (x.rewrite_count ?? 0), 0),
    editCount: sessions.reduce((s, x) => s + (x.edit_count ?? 0), 0),
    sessionCount: sessions.length,
    weeklyThinking: groupByDay(sessions, (s) => s.thinking_score),
    weeklyAuthenticity: groupByDay(sessions, (s) => s.authenticity_score),
    weeklyFocusTime: groupByDay(sessions, (s) => s.thinking_time),
    weeklySessions,
    topProblems,
    hasData: sessions.length > 0,
  });
});

export default router;
