const API_BASE = '/api';

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
  mindmap: unknown;
  thinkingTime?: number;
}

export interface ReflectionResult {
  thinkingScore: number;
  criteria: Record<string, number>;
  feedback: string[];
  improvements: string[];
  timeline: { startedWriting: string; lastEdit: string; focusTime: string };
}

export interface AuthenticityResult {
  originalScore: number;
  aiGeneratedScore: number;
  suspiciousSegments: Array<{ start: number; end: number; reason: string }>;
  patterns: string[];
  activity: { pasteTime: string; editCount: number; rewriteCount: number };
}

export interface DashboardStats {
  thinkingScore: number;
  authenticityScore: number;
  totalFocusTime: number;
  aiUsageCount: number;
  weeklyProgress: Array<{ day: string; score: number }>;
}

export const api = {
  getNotes: () => request<Note[]>('/notes'),

  createNote: (data: { pseudocode: string; mindmap: unknown; thinkingTime: number }) =>
    request<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateNote: (id: string, data: Partial<{ pseudocode: string; mindmap: unknown; thinkingTime: number }>) =>
    request<{ id: string }>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteNote: (id: string) =>
    request<{ success: boolean }>(`/notes/${id}`, { method: 'DELETE' }),

  analyzeReflection: (pseudocode: string, thinkingTime: number, noteId?: string) =>
    request<ReflectionResult>('/analyze/reflection', {
      method: 'POST',
      body: JSON.stringify({ pseudocode, thinkingTime, noteId }),
    }),

  analyzeAuthenticity: (content: string, noteId?: string) =>
    request<AuthenticityResult>('/analyze/authenticity', {
      method: 'POST',
      body: JSON.stringify({ content, noteId }),
    }),

  getDashboardStats: () => request<DashboardStats>('/stats/dashboard'),
};
