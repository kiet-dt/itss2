import { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { WorkspaceView } from './components/WorkspaceView';
import { JournalDialog } from './components/JournalDialog';
import { NoteDetailView } from './components/NoteDetailView';
import { DashboardOverview } from './components/DashboardOverview';
import { ThemeToggle } from './components/ThemeToggle';
import { api, type Note as ApiNote } from '../lib/api';
import { toast } from 'sonner';

interface Note {
  id: string;
  timestamp: Date;
  pseudocode: string;
  mindmap: unknown;
  thinkingTime?: number;
}

type ViewMode = 'dashboard' | 'workspace' | 'overview' | 'detail';

function toLocalNote(n: ApiNote): Note {
  return {
    id: n.id,
    timestamp: new Date(n.timestamp),
    pseudocode: n.pseudocode,
    mindmap: n.mindmap,
    thinkingTime: n.thinkingTime,
  };
}

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [thinkingTime, setThinkingTime] = useState(15);
  const [journalOpen, setJournalOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

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
    setViewMode('workspace');
    setCurrentNote(null);
  };

  const handleSaveNote = async (noteData: { pseudocode: string; mindmap: unknown }) => {
    try {
      if (currentNote) {
        await api.updateNote(currentNote.id, { ...noteData, thinkingTime });
        const updated: Note = { ...currentNote, ...noteData, thinkingTime };
        setNotes((prev) => prev.map((n) => (n.id === currentNote.id ? updated : n)));
        setCurrentNote(updated);
        toast.success('Ghi chú đã được cập nhật!');
        return updated;
      }

      const created = await api.createNote({ ...noteData, thinkingTime });
      const newNote = toLocalNote(created);
      setNotes((prev) => [newNote, ...prev]);
      setCurrentNote(newNote);
      toast.success('Ghi chú đã được lưu!');
      return newNote;
    } catch {
      toast.error('Lưu ghi chú thất bại');
      return null;
    }
  };

  const handleLoadNote = (note: Note) => {
    setCurrentNote(note);
    setThinkingTime(note.thinkingTime ?? 15);
    setViewMode('workspace');
  };

  const handleViewNote = (note: Note) => {
    setViewingNote(note);
    setViewMode('detail');
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
    setViewMode('dashboard');
    setViewingNote(null);
    setJournalOpen(true);
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
      toast.success('Đã xóa ghi chú');
    } catch {
      toast.error('Xóa ghi chú thất bại');
    }
  };

  if (loading && viewMode === 'dashboard') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="size-full">
      {viewMode === 'dashboard' && <Dashboard onStart={handleStart} />}

      {viewMode === 'workspace' && (
        <WorkspaceView
          thinkingTime={thinkingTime}
          noteId={currentNote?.id}
          onOpenJournal={() => setJournalOpen(true)}
          onSaveNote={handleSaveNote}
          onBack={handleBackToDashboard}
          onOpenDashboard={() => setViewMode('overview')}
          initialData={currentNote}
        />
      )}

      {viewMode === 'overview' && (
        <DashboardOverview onBack={() => setViewMode('workspace')} />
      )}

      {viewMode === 'detail' && viewingNote && (
        <NoteDetailView
          note={viewingNote}
          onBack={handleBackToJournal}
          onEdit={handleEditNote}
        />
      )}

      <JournalDialog
        open={journalOpen}
        onOpenChange={setJournalOpen}
        notes={notes}
        onViewNote={handleViewNote}
        onDeleteNote={handleDeleteNote}
      />

      <ThemeToggle />
    </div>
  );
}
