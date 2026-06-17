import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { BookOpen, Network, Home, BarChart3, Sparkles, PanelLeft, PanelLeftClose } from 'lucide-react';
import { toast } from 'sonner';
import { ProblemStatementInput } from './ProblemStatementInput';
import { PseudocodeEditor } from './PseudocodeEditor';
import { MindmapCanvas } from './MindmapCanvas';
import { AIAnalysisModal } from './AIAnalysisModal';
import { JournalPanel } from './JournalPanel';
import { Sheet, SheetContent, SheetTitle } from './ui/sheet';
import { buildDefaultMindmap } from '../../lib/mindmapTemplates';
import type { MindmapFlowData, NoteData } from '../../types/session';

const TAB_LEAVE_LIMIT = 3;

interface WorkspaceViewProps {
  thinkingTime: number;
  noteId?: string;
  notes: NoteData[];
  onOpenNote: (note: NoteData) => void;
  onNewNote: () => void;
  onDeleteNote: (id: string) => void;
  onSaveNote: (note: {
    pseudocode: string;
    mindmap: MindmapFlowData | null;
    problemStatement: string;
  }) => Promise<unknown>;
  onBack: () => void;
  onOpenDashboard: () => void;
  initialData?: {
    id?: string;
    pseudocode: string;
    mindmap: MindmapFlowData | null;
    problemStatement?: string;
  } | null;
}

export function WorkspaceView({
  thinkingTime,
  noteId,
  notes,
  onOpenNote,
  onNewNote,
  onDeleteNote,
  onSaveNote,
  onBack,
  onOpenDashboard,
  initialData,
}: WorkspaceViewProps) {
  const [problemStatement, setProblemStatement] = useState(initialData?.problemStatement || '');
  const [pseudocode, setPseudocode] = useState(initialData?.pseudocode || '');
  const [mindmapData, setMindmapData] = useState<MindmapFlowData | null>(
    initialData?.mindmap ?? null
  );
  const [timeLeft, setTimeLeft] = useState(thinkingTime * 60);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState('pseudocode');
  const [editCount, setEditCount] = useState(0);
  const [rewriteCount, setRewriteCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tabLeaveCount, setTabLeaveCount] = useState(0);
  const savedRef = useRef({ pseudocode, mindmapData, problemStatement });
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  const hasProblem = problemStatement.trim().length > 0;

  const handleMindmapChange = useCallback((data: MindmapFlowData) => {
    setMindmapData(data);
  }, []);

  useEffect(() => {
    if (!mindmapData && problemStatement.trim()) {
      setMindmapData(buildDefaultMindmap(problemStatement));
    }
  }, []);

  const timerEndedRef = useRef(false);

  const handleSave = useCallback(async () => {
    if (!hasProblem) {
      toast.error('Hãy mô tả bài toán trước khi lưu');
      return null;
    }
    const result = await onSaveNote({ pseudocode, mindmap: mindmapData, problemStatement });
    savedRef.current = { pseudocode, mindmapData, problemStatement };
    return result;
  }, [hasProblem, onSaveNote, pseudocode, mindmapData, problemStatement]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (!document.hidden) return;
      if (timeLeftRef.current <= 0) return;

      setTabLeaveCount((prev) => {
        const next = prev + 1;
        if (next > TAB_LEAVE_LIMIT) {
          toast.warning(
            `Bạn đã rời tab ${next} lần. Hãy tập trung vào phiên suy nghĩ!`
          );
        } else if (next === TAB_LEAVE_LIMIT) {
          toast.warning(
            `Bạn đã rời tab ${TAB_LEAVE_LIMIT} lần. Hãy tập trung vào phiên suy nghĩ!`
          );
        }
        return next;
      });
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && hasProblem && !timerEndedRef.current) {
      timerEndedRef.current = true;
      handleSave().then(() => setShowAnalysis(true));
    }
  }, [timeLeft, hasProblem, handleSave]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEditTrack = useCallback((edits: number, rewrites: number) => {
    setEditCount(edits);
    setRewriteCount(rewrites);
  }, []);

  const handleOpenNote = useCallback(
    (note: NoteData) => {
      onOpenNote(note);
      setSidebarOpen(false);
    },
    [onOpenNote]
  );

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
      <header className="min-h-12 sm:min-h-14 border-b border-border flex items-center justify-between gap-2 px-3 sm:px-4 md:px-6 py-2 bg-card/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 min-w-0">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="lg:hidden flex items-center gap-1 px-2 py-2 rounded-lg hover:bg-accent text-sm text-muted-foreground transition-colors shrink-0"
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? 'Ẩn ghi chú' : 'Hiện ghi chú'}
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>
          <button onClick={onBack} className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg hover:bg-accent text-sm text-muted-foreground transition-colors shrink-0">
            <Home className="w-4 h-4" /> <span className="hidden sm:inline">Trang chủ</span>
          </button>
          <button onClick={onOpenDashboard} className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg hover:bg-accent text-sm text-muted-foreground transition-colors shrink-0">
            <BarChart3 className="w-4 h-4" /> <span className="hidden md:inline">Dashboard</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
          <div
            className={`flex px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm shrink-0 font-medium border ${
              tabLeaveCount > TAB_LEAVE_LIMIT
                ? 'bg-destructive/10 text-destructive border-destructive/30 dark:bg-destructive/25 dark:text-red-300 dark:border-red-400/40'
                : tabLeaveCount === TAB_LEAVE_LIMIT
                  ? 'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-500/25 dark:text-amber-300 dark:border-amber-400/40'
                  : 'bg-muted text-muted-foreground border-transparent dark:bg-secondary dark:text-foreground dark:border-border'
            }`}
            title="Số lần chuyển sang tab/cửa sổ khác trong khi timer đang chạy"
          >
            <span className="hidden md:inline">{`Số lần rời tab: ${tabLeaveCount}`}</span>
            <span className="md:hidden">{`Rời tab: ${tabLeaveCount}`}</span>
          </div>
          <div className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-mono ${timeLeft < 60 ? 'bg-destructive/10 text-destructive' : 'bg-muted'}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => handleSave().then((r) => r && toast.success('Đã lưu'))}
            disabled={!hasProblem}
            className="px-2.5 sm:px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors"
          >
            Lưu
          </button>
          <button
            onClick={() => hasProblem ? setShowAnalysis(true) : toast.error('Hãy mô tả bài toán trước')}
            disabled={!hasProblem}
            className="px-2.5 sm:px-3 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed text-sm flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-4 h-4" /> <span className="hidden sm:inline">Phân tích</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:w-80 xl:w-96 lg:border-r border-border shrink-0 bg-muted/10 flex-col min-h-0 p-4 gap-4">
          <ProblemStatementInput value={problemStatement} onChange={setProblemStatement} compact />
          <JournalPanel
            notes={notes}
            activeNoteId={noteId}
            onOpenNote={handleOpenNote}
            onNewNote={onNewNote}
            onDeleteNote={onDeleteNote}
            className="flex-1 min-h-[120px]"
          />
        </aside>

        {/* Mobile drawer — ghi chú kiểu ChatGPT */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent
            side="left"
            className="lg:hidden w-[min(85vw,20rem)] p-4 pt-12 flex flex-col min-h-0 gap-0"
          >
            <SheetTitle className="sr-only">Ghi chú đã lưu</SheetTitle>
            <JournalPanel
              notes={notes}
              activeNoteId={noteId}
              onOpenNote={handleOpenNote}
              onNewNote={onNewNote}
              onDeleteNote={onDeleteNote}
              className="flex-1 min-h-0"
            />
          </SheetContent>
        </Sheet>

        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <Tabs.List className="flex border-b border-border bg-card/50 px-1 sm:px-2 shrink-0">
              <Tabs.Trigger
                value="pseudocode"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 text-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary transition-all hover:bg-accent/50 rounded-t-lg"
              >
                <BookOpen className="w-4 h-4 shrink-0" /> <span className="truncate">Mã giả</span>
              </Tabs.Trigger>
              <Tabs.Trigger
                value="mindmap"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 text-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary transition-all hover:bg-accent/50 rounded-t-lg"
              >
                <Network className="w-4 h-4 shrink-0" /> <span className="truncate">Sơ đồ tư duy</span>
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="pseudocode" className="flex-1 min-h-0 overflow-hidden outline-none data-[state=inactive]:hidden flex flex-col">
              <div className="p-3 sm:p-4 border-b border-border lg:hidden shrink-0">
                <ProblemStatementInput value={problemStatement} onChange={setProblemStatement} compact />
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <PseudocodeEditor value={pseudocode} onChange={setPseudocode} editCount={editCount} onEditTrack={handleEditTrack} />
              </div>
            </Tabs.Content>
            <Tabs.Content value="mindmap" className="flex-1 min-h-0 overflow-hidden outline-none data-[state=inactive]:hidden flex flex-col">
              <div className="p-3 sm:p-4 border-b border-border lg:hidden shrink-0">
                <ProblemStatementInput value={problemStatement} onChange={setProblemStatement} compact />
              </div>
              <div className="flex-1 min-h-0 h-full">
                <MindmapCanvas
                  problemStatement={problemStatement}
                  data={mindmapData}
                  onChange={handleMindmapChange}
                  isActive={activeTab === 'mindmap'}
                />
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>

      <AIAnalysisModal
        open={showAnalysis}
        onOpenChange={setShowAnalysis}
        problemStatement={problemStatement}
        pseudocode={pseudocode}
        mindmapData={mindmapData}
        thinkingMinutes={thinkingTime}
        editCount={editCount}
        rewriteCount={rewriteCount}
        noteId={noteId ?? initialData?.id}
      />
    </div>
  );
}
