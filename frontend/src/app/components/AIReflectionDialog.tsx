import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Brain, TrendingUp, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { api, type ReflectionResult } from '../../lib/api';

interface AIReflectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pseudocode: string;
  thinkingTime: number;
  noteId?: string;
}

export function AIReflectionDialog({ open, onOpenChange, pseudocode, thinkingTime, noteId }: AIReflectionDialogProps) {
  const [analyzing, setAnalyzing] = useState(true);
  const [result, setResult] = useState<ReflectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setAnalyzing(true);
    setError(null);
    setResult(null);

    api
      .analyzeReflection(pseudocode, thinkingTime, noteId)
      .then((data) => {
        setResult(data);
        setAnalyzing(false);
      })
      .catch((err) => {
        setError(err.message);
        setAnalyzing(false);
      });
  }, [open, pseudocode, thinkingTime, noteId]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-blue-500 to-cyan-500';
    if (score >= 40) return 'from-yellow-500 to-amber-500';
    return 'from-orange-500 to-red-500';
  };

  const criteriaLabels: Record<string, string> = {
    logicClarity: 'Logic Clarity',
    problemDecomposition: 'Problem Decomposition',
    edgeCaseAwareness: 'Edge-case Awareness',
    algorithmOptimization: 'Algorithm Optimization',
    stepByStepReasoning: 'Step-by-step Reasoning',
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-card rounded-2xl shadow-2xl border border-border z-50 overflow-hidden flex flex-col">
          {analyzing ? (
            <div className="flex flex-col items-center justify-center p-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="mb-6"
              >
                <Brain className="w-16 h-16 text-primary" />
              </motion.div>
              <h3 className="mb-2">Đang phân tích tư duy của bạn...</h3>
              <p className="text-muted-foreground">Đợi một chút nhé</p>
              <div className="w-64 h-1 bg-muted rounded-full mt-6 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-blue-500"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </div>
          ) : error ? (
            <div className="p-16 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <button
                onClick={() => onOpenChange(false)}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg"
              >
                Đóng
              </button>
            </div>
          ) : result ? (
            <>
              <div className="p-8 border-b border-border">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <Dialog.Title>AI Reflection Analysis</Dialog.Title>
                </div>
                <p className="text-muted-foreground">
                  Đánh giá chất lượng tư duy và cách tiếp cận bài toán
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-xl p-6 border border-primary/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="mb-1">Thinking Score</h3>
                      <p className="text-muted-foreground">Chất lượng tư duy tổng thể</p>
                    </div>
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted/20" />
                        <motion.circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - result.thinkingScore / 100) }}
                          transition={{ duration: 1.5, ease: 'easeOut' }}
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" className="text-primary" stopColor="currentColor" />
                            <stop offset="100%" className="text-blue-500" stopColor="currentColor" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`font-bold ${getScoreColor(result.thinkingScore)}`} style={{ fontSize: '28px' }}>
                          {result.thinkingScore}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-muted/30 rounded-xl p-6 space-y-4"
                >
                  <h3>Tiêu chí đánh giá</h3>
                  {Object.entries(result.criteria).map(([key, value], index) => (
                    <div key={key}>
                      <div className="flex justify-between mb-2">
                        <span className="text-foreground/80">{criteriaLabels[key] ?? key}</span>
                        <span className={getScoreColor(value)}>{value}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${getScoreGradient(value)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                          transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>

                <div className="grid grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-green-500/5 border border-green-500/20 rounded-xl p-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <h4>AI Feedback</h4>
                    </div>
                    <ul className="space-y-2">
                      {result.feedback.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-foreground/80">
                          <ArrowRight className="w-4 h-4 mt-0.5 text-green-500 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      <h4>Suggested Improvements</h4>
                    </div>
                    <ul className="space-y-2">
                      {result.improvements.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-foreground/80">
                          <ArrowRight className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-muted/30 rounded-xl p-6"
                >
                  <h3 className="mb-4">Timeline tư duy</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-muted-foreground mb-1">Bắt đầu viết</p>
                      <p className="text-foreground">{result.timeline.startedWriting}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Chỉnh sửa cuối</p>
                      <p className="text-foreground">{result.timeline.lastEdit}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Thời gian tập trung</p>
                      <p className="text-foreground">{result.timeline.focusTime}</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="p-6 border-t border-border">
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
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
