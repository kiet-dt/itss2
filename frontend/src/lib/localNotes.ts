import type { MindmapFlowData } from '../types/session';

const STORAGE_KEY = 'itss2_notes';

export interface StoredNote {
  id: string;
  timestamp: string;
  updatedAt: string;
  pseudocode: string;
  mindmap: MindmapFlowData | null;
  problemStatement: string;
  thinkingTime: number;
}

function readAll(): StoredNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredNote[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(notes: StoredNote[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function getAllNotes(): StoredNote[] {
  return readAll().sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function createNote(data: {
  pseudocode: string;
  mindmap: MindmapFlowData | null;
  problemStatement: string;
  thinkingTime: number;
}): StoredNote {
  const now = new Date().toISOString();
  const note: StoredNote = {
    id: crypto.randomUUID(),
    timestamp: now,
    updatedAt: now,
    pseudocode: data.pseudocode,
    mindmap: data.mindmap,
    problemStatement: data.problemStatement,
    thinkingTime: data.thinkingTime,
  };
  const notes = readAll();
  notes.unshift(note);
  writeAll(notes);
  return note;
}

export function updateNote(
  id: string,
  data: Partial<{
    pseudocode: string;
    mindmap: MindmapFlowData | null;
    problemStatement: string;
    thinkingTime: number;
  }>
): StoredNote | null {
  const notes = readAll();
  const idx = notes.findIndex((n) => n.id === id);
  if (idx < 0) return null;
  const updated: StoredNote = {
    ...notes[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  notes[idx] = updated;
  writeAll(notes);
  return updated;
}

export function deleteNote(id: string): boolean {
  const notes = readAll();
  const next = notes.filter((n) => n.id !== id);
  if (next.length === notes.length) return false;
  writeAll(next);
  return true;
}
