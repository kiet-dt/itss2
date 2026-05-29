import { ArrowLeft, Calendar, FileText, Network } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';

interface Note {
  id: string;
  timestamp: Date;
  pseudocode: string;
  mindmap: any;
}

interface NoteDetailViewProps {
  note: Note;
  onBack: () => void;
  onEdit: () => void;
}

export function NoteDetailView({ note, onBack, onEdit }: NoteDetailViewProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderMindMap = () => {
    if (!note.mindmap?.nodes) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Không có sơ đồ tư duy</p>
        </div>
      );
    }

    const nodes = note.mindmap.nodes;

    return (
      <div className="h-full relative overflow-auto bg-muted/20">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {nodes.map((node: any) =>
            node.children.map((childId: string) => {
              const child = nodes.find((n: any) => n.id === childId);
              if (!child) return null;
              return (
                <line
                  key={`${node.id}-${childId}`}
                  x1={node.x + 80}
                  y1={node.y + 20}
                  x2={child.x + 80}
                  y2={child.y + 20}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-border"
                />
              );
            })
          )}
        </svg>

        {nodes.map((node: any) => (
          <div
            key={node.id}
            className="absolute pointer-events-none"
            style={{
              left: node.x,
              top: node.y,
              width: '160px'
            }}
          >
            <div className="bg-card border-2 border-border rounded-lg p-3 shadow-lg">
              <div className="text-center">{node.text}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(note.timestamp)}</span>
          </div>
        </div>

        <button
          onClick={onEdit}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Chỉnh sửa
        </button>
      </div>

      {/* Content */}
      <Tabs.Root defaultValue="pseudocode" className="flex-1 flex flex-col">
        <Tabs.List className="flex border-b border-border bg-muted/30">
          <Tabs.Trigger
            value="pseudocode"
            className="flex items-center gap-2 px-6 py-3 hover:bg-accent/50 data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors"
          >
            <FileText className="w-4 h-4" />
            Mã giả
          </Tabs.Trigger>
          <Tabs.Trigger
            value="mindmap"
            className="flex items-center gap-2 px-6 py-3 hover:bg-accent/50 data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors"
          >
            <Network className="w-4 h-4" />
            Sơ đồ tư duy
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="pseudocode" className="flex-1 overflow-hidden">
          <div className="h-full p-6">
            <div className="h-full bg-card border border-border rounded-lg overflow-auto">
              <div className="p-6">
                {note.pseudocode ? (
                  <pre className="whitespace-pre-wrap font-mono" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    {note.pseudocode}
                  </pre>
                ) : (
                  <p className="text-muted-foreground text-center py-12">
                    Không có mã giả
                  </p>
                )}
              </div>
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content value="mindmap" className="flex-1 overflow-hidden">
          {renderMindMap()}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
