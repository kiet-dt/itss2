import { useState, useEffect } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { BookOpen, Network, BookMarked, Home, BarChart3 } from 'lucide-react';
import { PseudocodeEditor } from './PseudocodeEditor';
import { MindMapEditor } from './MindMapEditor';
import { AIReflectionDialog } from './AIReflectionDialog';

interface WorkspaceViewProps {
  thinkingTime: number;
  noteId?: string;
  onOpenJournal: () => void;
  onSaveNote: (note: { pseudocode: string; mindmap: any }) => Promise<unknown>;
  onBack: () => void;
  onOpenDashboard: () => void;
  initialData?: { id?: string; pseudocode: string; mindmap: any } | null;
}

export function WorkspaceView({ thinkingTime, noteId, onOpenJournal, onSaveNote, onBack, onOpenDashboard, initialData }: WorkspaceViewProps) {
  const [pseudocode, setPseudocode] = useState(initialData?.pseudocode || '');
  const [mindmapData, setMindmapData] = useState<any>(initialData?.mindmap || null);
  const [timeLeft, setTimeLeft] = useState(thinkingTime * 60);
  const [showReflection, setShowReflection] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto save when time is up
          onSaveNote({ pseudocode, mindmap: mindmapData });
          // Show AI Reflection Dialog
          setShowReflection(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pseudocode, mindmapData, onSaveNote]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    await onSaveNote({ pseudocode, mindmap: mindmapData });
    setShowReflection(true);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenJournal}
            className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent transition-colors"
          >
            <BookMarked className="w-5 h-5" />
            Nhật ký
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent transition-colors text-muted-foreground"
          >
            <Home className="w-4 h-4" />
            Trang chủ
          </button>
          <button
            onClick={onOpenDashboard}
            className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent transition-colors text-muted-foreground"
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-md ${timeLeft < 60 ? 'bg-destructive/10 text-destructive' : 'bg-muted'}`}>
            ⏱️ {formatTime(timeLeft)}
          </div>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Lưu ghi chú
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="pseudocode" className="flex-1 flex flex-col">
        <Tabs.List className="flex border-b border-border bg-muted/30">
          <Tabs.Trigger
            value="pseudocode"
            className="flex items-center gap-2 px-6 py-3 hover:bg-accent/50 data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors"
          >
            <BookOpen className="w-4 h-4" />
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
          <PseudocodeEditor value={pseudocode} onChange={setPseudocode} noteId={noteId ?? initialData?.id} />
        </Tabs.Content>

        <Tabs.Content value="mindmap" className="flex-1 overflow-hidden">
          <MindMapEditor data={mindmapData} onChange={setMindmapData} />
        </Tabs.Content>
      </Tabs.Root>

      <AIReflectionDialog
        open={showReflection}
        onOpenChange={setShowReflection}
        pseudocode={pseudocode}
        thinkingTime={thinkingTime}
        noteId={noteId ?? initialData?.id}
      />
    </div>
  );
}
