import { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { WorkspaceView } from './components/WorkspaceView';
import { NoteDetailView } from './components/NoteDetailView';
import { DashboardStats } from './components/DashboardStats';
import { ThemeToggle } from './components/ThemeToggle';
import { api, type Note as ApiNote } from '../lib/api';
import type { MindmapFlowData, NoteData } from '../types/session';
import { toast } from 'sonner';

interface Note {
  id: string;
  timestamp: Date;
  pseudocode: string;
  mindmap: MindmapFlowData | null;
  problemStatement: string;
  thinkingTime?: number;
}

type ViewMode = 'dashboard' | 'workspace' | 'overview' | 'detail';

function toLocalNote(n: ApiNote): Note {
  return {
    id: n.id,
    timestamp: new Date(n.timestamp),
    pseudocode: n.pseudocode,
    mindmap: n.mindmap,
    problemStatement: n.problemStatement ?? '',
    thinkingTime: n.thinkingTime,
  };
}

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [thinkingTime, setThinkingTime] = useState(15);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [newSessionKey, setNewSessionKey] = useState(0);

  const loadNotes = useCallback(async () => {
    try {
      const data = await api.getNotes();
      setNotes(data.map(toLocalNote));
    } catch {
      toast.error('Không thể tải nhật ký. Kiểm tra backend đã chạy chưa.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleStart = (minutes: number) => {
    setThinkingTime(minutes);
    setCurrentNote(null);
    setNewSessionKey((k) => k + 1);
    setViewMode('workspace');
  };

  const handleNewNote = () => {
    if (viewMode === 'workspace' && currentNote) {
      if (!confirm('Tạo ghi chú mới? Hãy lưu trước nếu bạn cần giữ thay đổi hiện tại.')) {
        return;
      }
    } else if (viewMode === 'workspace' && !currentNote) {
      if (!confirm('Tạo phiên mới? Nội dung chưa lưu sẽ bị xóa.')) {
        return;
      }
    }
    setCurrentNote(null);
    setNewSessionKey((k) => k + 1);
    setViewMode('workspace');
    setViewingNote(null);
  };

  const handleSaveNote = async (noteData: {
    pseudocode: string;
    mindmap: MindmapFlowData | null;
    problemStatement: string;
  }) => {
    try {
      if (currentNote) {
        await api.updateNote(currentNote.id, { ...noteData, thinkingTime });
        const updated: Note = { ...currentNote, ...noteData, thinkingTime };
        setNotes((prev) => prev.map((n) => (n.id === currentNote.id ? updated : n)));
        setCurrentNote(updated);
        return updated;
      }

      const created = await api.createNote({ ...noteData, thinkingTime });
      const newNote = toLocalNote(created);
      setNotes((prev) => [newNote, ...prev]);
      setCurrentNote(newNote);
      return newNote;
    } catch {
      toast.error('Lưu ghi chú thất bại');
      return null;
    }
  };

  const handleOpenNote = (note: Note) => {
    if (currentNote?.id === note.id && viewMode === 'workspace') return;
    if (
      viewMode === 'workspace' &&
      currentNote &&
      !confirm('Chuyển sang ghi chú khác? Hãy lưu trước nếu bạn cần giữ thay đổi hiện tại.')
    ) {
      return;
    }
    setCurrentNote(note);
    setThinkingTime(note.thinkingTime ?? 15);
    setViewMode('workspace');
    setViewingNote(null);
  };

  const handleEditNote = () => {
    if (viewingNote) {
      setCurrentNote(viewingNote);
      setThinkingTime(viewingNote.thinkingTime ?? 15);
      setViewMode('workspace');
      setViewingNote(null);
    }
  };

  const handleBackToJournal = () => {
    setViewMode('workspace');
    setViewingNote(null);
  };

  const handleBackToDashboard = () => {
    if (confirm('Bạn có muốn quay lại trang chủ? Nhớ lưu ghi chú trước!')) {
      setViewMode('dashboard');
      setCurrentNote(null);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa ghi chú này?')) return;
    try {
      await api.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (currentNote?.id === id) setCurrentNote(null);
      if (viewingNote?.id === id) {
        setViewingNote(null);
        setViewMode('workspace');
      }
      toast.success('Đã xóa ghi chú');
    } catch {
      toast.error('Xóa ghi chú thất bại');
    }
  };

  if (loading && viewMode === 'dashboard') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="size-full">
      {viewMode === 'dashboard' && <Dashboard onStart={handleStart} />}

      {viewMode === 'workspace' && (
        <WorkspaceView
          key={currentNote?.id ?? `new-${newSessionKey}`}
          thinkingTime={thinkingTime}
          noteId={currentNote?.id}
          notes={notes}
          onOpenNote={handleOpenNote}
          onNewNote={handleNewNote}
          onDeleteNote={handleDeleteNote}
          onSaveNote={handleSaveNote}
          onBack={handleBackToDashboard}
          onOpenDashboard={() => setViewMode('overview')}
          initialData={currentNote}
        />
      )}

      {viewMode === 'overview' && (
        <DashboardStats onBack={() => setViewMode('workspace')} />
      )}

      {viewMode === 'detail' && viewingNote && (
        <NoteDetailView note={viewingNote} onBack={handleBackToJournal} onEdit={handleEditNote} />
      )}

      <ThemeToggle />
    </div>
  );
}
