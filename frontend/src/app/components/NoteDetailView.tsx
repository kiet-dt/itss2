import { ArrowLeft, Calendar, FileText, Network, Target } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import type { MindmapFlowData } from '../../types/session';

interface Note {
  id: string;
  timestamp: Date;
  pseudocode: string;
  mindmap: MindmapFlowData | null;
  problemStatement?: string;
}

interface NoteDetailViewProps {
  note: Note;
  onBack: () => void;
  onEdit: () => void;
}

export function NoteDetailView({ note, onBack, onEdit }: NoteDetailViewProps) {
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);

  const renderMindMap = () => {
    const nodes = note.mindmap?.nodes;
    const edges = note.mindmap?.edges;

    if (!nodes?.length) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Chưa có sơ đồ tư duy</p>
        </div>
      );
    }

    return (
      <div className="h-full relative overflow-auto bg-muted/20 p-6">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: 500 }}>
          {edges?.map((e) => {
            const src = nodes.find((n) => n.id === e.source);
            const tgt = nodes.find((n) => n.id === e.target);
            if (!src || !tgt) return null;
            return (
              <line
                key={e.id}
                x1={src.position.x + 80}
                y1={src.position.y + 24}
                x2={tgt.position.x + 80}
                y2={tgt.position.y + 24}
                stroke="currentColor"
                strokeWidth="2"
                className="text-border"
              />
            );
          })}
        </svg>
        {nodes.map((node) => (
          <div
            key={node.id}
            className="absolute pointer-events-none"
            style={{ left: node.position.x, top: node.position.y, width: 160 }}
          >
            <div
              className="border-2 rounded-lg p-3 shadow-lg text-center text-sm font-medium"
              style={{
                borderColor: node.data.color || 'var(--border)',
                backgroundColor: node.data.color ? `${node.data.color}22` : 'var(--card)',
              }}
            >
              {node.data.label}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="w-5 h-5" /> Quay lại
          </button>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="w-4 h-4" />
            {formatDate(note.timestamp)}
          </div>
        </div>
        <button onClick={onEdit} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          Chỉnh sửa
        </button>
      </header>

      {note.problemStatement && (
        <div className="px-6 py-4 border-b border-border bg-primary/5">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Target className="w-4 h-4 text-primary" />
            {note.problemStatement}
          </p>
        </div>
      )}

      <Tabs.Root defaultValue="pseudocode" className="flex-1 flex flex-col">
        <Tabs.List className="flex border-b border-border bg-muted/30">
          <Tabs.Trigger value="pseudocode" className="flex items-center gap-2 px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors">
            <FileText className="w-4 h-4" /> Mã giả
          </Tabs.Trigger>
          <Tabs.Trigger value="mindmap" className="flex items-center gap-2 px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors">
            <Network className="w-4 h-4" /> Sơ đồ tư duy
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="pseudocode" className="flex-1 overflow-hidden p-6">
          <div className="h-full bg-card border border-border rounded-xl overflow-auto p-6">
            {note.pseudocode ? (
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{note.pseudocode}</pre>
            ) : (
              <p className="text-muted-foreground text-center py-12">Chưa có mã giả</p>
            )}
          </div>
        </Tabs.Content>

        <Tabs.Content value="mindmap" className="flex-1 overflow-hidden">
          {renderMindMap()}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
