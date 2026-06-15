import type { AIAnalysisResult, MindmapFlowData } from '../types/session';

/** Dev: /api (Vite proxy). Vercel: rewrite trong vercel.json, hoặc set VITE_API_BASE khi deploy. */
const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Lỗi kết nối server');
  }

  return res.json();
}

export interface Note {
  id: string;
  timestamp: string;
  pseudocode: string;
  mindmap: MindmapFlowData | null;
  problemStatement: string;
  thinkingTime?: number;
}

export interface DashboardStats {
  thinkingScore: number;
  authenticityScore: number;
  totalFocusTime: number;
  aiUsageCount: number;
  problemsSolved: number;
  rewriteCount: number;
  editCount: number;
  sessionCount: number;
  weeklyThinking: Array<{ day: string; value: number }>;
  weeklyAuthenticity: Array<{ day: string; value: number }>;
  weeklyFocusTime: Array<{ day: string; value: number }>;
  weeklySessions: Array<{ day: string; count: number }>;
  topProblems: Array<{ name: string; count: number }>;
  hasData: boolean;
}

export type { AIAnalysisResult };

export const api = {
  getNotes: () => request<Note[]>('/notes'),

  createNote: (data: {
    pseudocode: string;
    mindmap: MindmapFlowData | null;
    problemStatement: string;
    thinkingTime: number;
  }) =>
    request<Note>('/notes', { method: 'POST', body: JSON.stringify(data) }),

  updateNote: (
    id: string,
    data: Partial<{
      pseudocode: string;
      mindmap: MindmapFlowData | null;
      problemStatement: string;
      thinkingTime: number;
    }>
  ) => request<{ id: string }>(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteNote: (id: string) =>
    request<{ success: boolean }>(`/notes/${id}`, { method: 'DELETE' }),

  analyzeWithAI: (data: {
    problemStatement: string;
    pseudocode: string;
    mindmapData: MindmapFlowData | null;
    thinkingMinutes: number;
    editCount: number;
    rewriteCount: number;
    noteId?: string;
  }) =>
    request<AIAnalysisResult>('/analyze/reflection', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getDashboardStats: () => request<DashboardStats>('/stats/dashboard'),
};
