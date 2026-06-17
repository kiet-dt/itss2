import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Brain, Sparkles, CheckCircle2, TrendingUp, X } from 'lucide-react';
import { motion } from 'motion/react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
} from 'recharts';
import { api } from '../../lib/api';
import { recordAnalysisSession } from '../../lib/localStats';
import type { AIAnalysisResult, MindmapFlowData } from '../../types/session';

interface AIAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  problemStatement: string;
  pseudocode: string;
  mindmapData: MindmapFlowData | null;
  thinkingMinutes: number;
  editCount: number;
  rewriteCount: number;
  noteId?: string;
}

export function AIAnalysisModal({
  open,
  onOpenChange,
  problemStatement,
  pseudocode,
  mindmapData,
  thinkingMinutes,
  editCount,
  rewriteCount,
  noteId,
}: AIAnalysisModalProps) {
  const [analyzing, setAnalyzing] = useState(true);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setAnalyzing(true);
    setError(null);
    setResult(null);

    api
      .analyzeWithAI({
        problemStatement,
        pseudocode,
        mindmapData,
        thinkingMinutes,
        editCount,
        rewriteCount,
      })
      .then((data) => {
        recordAnalysisSession({
          noteId,
          problemStatement,
          thinkingMinutes,
          editCount,
          rewriteCount,
          result: data,
        });
        setResult(data);
        setAnalyzing(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setAnalyzing(false);
      });
  }, [open, problemStatement, pseudocode, mindmapData, thinkingMinutes, editCount, rewriteCount, noteId]);

  const scoreColor = (s: number) =>
    s >= 80 ? 'text-green-500' : s >= 60 ? 'text-blue-500' : s >= 40 ? 'text-yellow-500' : 'text-orange-500';

  const radarData = result
    ? [
        { subject: 'Logic', value: result.logicClarity },
        { subject: 'Decomposition', value: result.problemDecomposition },
        { subject: 'Edge Cases', value: result.edgeCaseAwareness },
        { subject: 'Optimization', value: result.algorithmOptimization },
        { subject: 'Authenticity', value: 100 - result.aiPatternPercent },
      ]
    : [];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-4xl max-h-[92dvh] bg-card rounded-xl sm:rounded-2xl shadow-2xl border border-border z-50 overflow-hidden flex flex-col">
          {analyzing ? (
            <div className="flex flex-col items-center justify-center p-16">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                <Brain className="w-16 h-16 text-primary mb-6" />
              </motion.div>
              <h3 className="text-lg font-medium mb-2">Đang phân tích tư duy của bạn...</h3>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <button onClick={() => onOpenChange(false)} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg">Đóng</button>
            </div>
          ) : result ? (
            <>
              <div className="p-6 border-b border-border flex items-start justify-between">
                <div>
                  <Dialog.Title className="flex items-center gap-2 text-lg font-semibold">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Phản biện tư duy
                  </Dialog.Title>
                </div>
                <Dialog.Close className="p-2 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></Dialog.Close>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                  {[
                    { label: 'Thinking Score', value: result.thinkingScore },
                    { label: 'Authenticity', value: result.authenticityScore },
                    { label: 'Problem Understanding', value: result.problemUnderstanding },
                    { label: 'Relevance', value: result.relevanceToProblem },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                      <div className={`text-3xl font-bold ${scoreColor(item.value)}`}>{item.value}</div>
                      <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-border p-4 h-72">
                  <h4 className="text-sm font-medium mb-2">Radar Chart — Tiêu chí đánh giá</h4>
                  <ResponsiveContainer width="100%" height="90%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.35} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">
                    <h4 className="flex items-center gap-2 font-medium mb-3 text-green-600">
                      <CheckCircle2 className="w-4 h-4" /> Feedback
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {result.feedback.map((f, i) => (
                        <li key={i} className="text-foreground/80">• {f}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                    <h4 className="flex items-center gap-2 font-medium mb-3 text-blue-600">
                      <TrendingUp className="w-4 h-4" /> Gợi ý cải thiện
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {result.suggestions.map((s, i) => (
                        <li key={i} className="text-foreground/80">• {s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-border">
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium"
                >
                  Tiếp tục học tập
                </button>
              </div>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
