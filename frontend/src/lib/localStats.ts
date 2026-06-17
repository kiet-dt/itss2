import type { AIAnalysisResult } from '../types/session';
import type { DashboardStats } from './api';
import { getAllNotes } from './localNotes';

const SESSIONS_KEY = 'itss2_sessions';

export interface StoredSession {
  id: string;
  noteId?: string;
  createdAt: string;
  thinkingScore: number;
  authenticityScore: number;
  thinkingTime: number;
  problemStatement: string;
  editCount: number;
  rewriteCount: number;
}

const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function readSessions(): StoredSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSessions(sessions: StoredSession[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function recordAnalysisSession(data: {
  noteId?: string;
  problemStatement: string;
  thinkingMinutes: number;
  editCount: number;
  rewriteCount: number;
  result: AIAnalysisResult;
}) {
  const session: StoredSession = {
    id: crypto.randomUUID(),
    noteId: data.noteId,
    createdAt: new Date().toISOString(),
    thinkingScore: data.result.thinkingScore,
    authenticityScore: data.result.authenticityScore,
    thinkingTime: data.thinkingMinutes,
    problemStatement: data.problemStatement,
    editCount: data.editCount,
    rewriteCount: data.rewriteCount,
  };
  const sessions = readSessions();
  sessions.push(session);
  writeSessions(sessions);
}

function groupByDay(
  items: StoredSession[],
  getValue: (item: StoredSession) => number | null
) {
  const map = new Map<string, number[]>();
  for (const item of items) {
    const label = DAY_LABELS[new Date(item.createdAt).getDay()];
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

function avg(vals: number[]) {
  return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
}

export function getDashboardStats(): DashboardStats {
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const sessions = readSessions().filter((s) => new Date(s.createdAt).getTime() >= cutoff);

  const thinkingScores = sessions.map((s) => s.thinkingScore);
  const authScores = sessions.map((s) => s.authenticityScore);

  const problemCounts = new Map<string, number>();
  for (const s of sessions) {
    const p = s.problemStatement.trim();
    if (!p) continue;
    const key = p.length > 40 ? `${p.slice(0, 40)}…` : p;
    problemCounts.set(key, (problemCounts.get(key) ?? 0) + 1);
  }

  const weekOrder = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const sessionCountMap = new Map<string, number>();
  for (const s of sessions) {
    const label = DAY_LABELS[new Date(s.createdAt).getDay()];
    sessionCountMap.set(label, (sessionCountMap.get(label) ?? 0) + 1);
  }

  return {
    thinkingScore: avg(thinkingScores),
    authenticityScore: avg(authScores),
    totalFocusTime: sessions.reduce((sum, s) => sum + s.thinkingTime, 0),
    aiUsageCount: readSessions().length,
    problemsSolved: getAllNotes().length,
    rewriteCount: sessions.reduce((sum, s) => sum + s.rewriteCount, 0),
    editCount: sessions.reduce((sum, s) => sum + s.editCount, 0),
    sessionCount: sessions.length,
    weeklyThinking: groupByDay(sessions, (s) => s.thinkingScore),
    weeklyAuthenticity: groupByDay(sessions, (s) => s.authenticityScore),
    weeklyFocusTime: groupByDay(sessions, (s) => s.thinkingTime),
    weeklySessions: weekOrder.map((day) => ({
      day,
      count: sessionCountMap.get(day) ?? 0,
    })),
    topProblems: [...problemCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count })),
    hasData: sessions.length > 0,
  };
}
