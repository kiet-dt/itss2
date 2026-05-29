import * as Dialog from '@radix-ui/react-dialog';
import { X, Calendar, FileText } from 'lucide-react';

interface Note {
  id: string;
  timestamp: Date;
  pseudocode: string;
  mindmap: any;
}

interface JournalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: Note[];
  onViewNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

export function JournalDialog({ open, onOpenChange, notes, onViewNote, onDeleteNote }: JournalDialogProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[85vh] bg-card rounded-lg shadow-2xl border border-border z-50 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <Dialog.Title className="flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Nhật ký ghi chú
            </Dialog.Title>
            <Dialog.Close className="p-2 hover:bg-accent rounded-md transition-colors">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {notes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Chưa có ghi chú nào</p>
                <p className="mt-2">Bắt đầu làm việc để tạo ghi chú đầu tiên!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => {
                      onViewNote(note);
                      onOpenChange(false);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(note.timestamp)}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNote(note.id);
                        }}
                        className="px-3 py-1 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                    <div className="pl-6">
                      <p className="text-foreground/80 line-clamp-3 whitespace-pre-wrap">
                        {note.pseudocode || '(Không có mã giả)'}
                      </p>
                      {note.mindmap?.nodes && (
                        <p className="mt-2 text-muted-foreground">
                          📊 Sơ đồ: {note.mindmap.nodes.length} nodes
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
