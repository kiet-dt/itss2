import { Calendar, FileText, Plus, Trash2 } from 'lucide-react';
import type { NoteData } from '../../types/session';

interface JournalPanelProps {
  notes: NoteData[];
  activeNoteId?: string;
  onOpenNote: (note: NoteData) => void;
  onNewNote: () => void;
  onDeleteNote: (id: string) => void;
  className?: string;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function JournalPanel({
  notes,
  activeNoteId,
  onOpenNote,
  onNewNote,
  onDeleteNote,
  className = '',
}: JournalPanelProps) {
  return (
    <div className={`flex flex-col min-h-0 ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
        <h3 className="flex items-center gap-2 text-sm font-medium min-w-0">
          <FileText className="w-4 h-4 text-primary shrink-0" />
          <span className="truncate">Ghi chú đã lưu</span>
          {notes.length > 0 && (
            <span className="text-xs font-normal text-muted-foreground shrink-0">({notes.length})</span>
          )}
        </h3>
        <button
          type="button"
          onClick={onNewNote}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-primary/40 text-primary text-xs font-medium hover:bg-primary/10 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Mới
        </button>
      </div>

      {!activeNoteId && (
        <div className="mb-2 shrink-0 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-xs text-primary">
          Phiên mới — bấm Lưu để thêm vào danh sách
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-0.5">
        {notes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center text-sm text-muted-foreground">
            <p>Chưa có ghi chú nào</p>
            <p className="mt-1 text-xs">Bấm Lưu để lưu phiên suy nghĩ</p>
          </div>
        ) : (
          notes.map((note) => {
            const active = note.id === activeNoteId;
            return (
              <div
                key={note.id}
                role="button"
                tabIndex={0}
                onClick={() => onOpenNote(note)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenNote(note);
                  }
                }}
                className={`w-full text-left p-3 rounded-lg border transition-colors group cursor-pointer ${
                  active
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                    : 'border-border bg-card/80 hover:border-primary/40 hover:bg-accent/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{formatDate(note.timestamp)}</span>
                    {active && (
                      <span className="shrink-0 text-[10px] font-medium text-primary uppercase tracking-wide">
                        Đang mở
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    title="Xóa ghi chú"
                    className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote(note.id);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm font-medium line-clamp-2 leading-snug">
                  {note.problemStatement.trim() || '(Chưa có mô tả bài toán)'}
                </p>
                {note.mindmap?.nodes?.length ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {note.mindmap.nodes.length} node sơ đồ
                  </p>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
