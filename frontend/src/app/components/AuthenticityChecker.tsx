import { useEffect, useState, useRef } from 'react';
import { Shield, AlertCircle, TrendingUp, Clock, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api, type AuthenticityResult } from '../../lib/api';

interface AuthenticityCheckerProps {
  content: string;
  noteId?: string;
  onAnalysisComplete?: (result: AuthenticityResult) => void;
}

export function AuthenticityChecker({ content, noteId, onAnalysisComplete }: AuthenticityCheckerProps) {
  const [result, setResult] = useState<AuthenticityResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (content.length < 50) {
      setResult(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setAnalyzing(true);
      api
        .analyzeAuthenticity(content, noteId)
        .then((data) => {
          setResult(data);
          setAnalyzing(false);
          onAnalysisComplete?.(data);
        })
        .catch(() => {
          setAnalyzing(false);
        });
    }, 1200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [content, noteId, onAnalysisComplete]);

  if (!content || content.length < 50) return null;

  return (
    <AnimatePresence>
      {analyzing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-3"
        >
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-blue-500">Đang kiểm tra tính xác thực...</span>
        </motion.div>
      )}

      {result && !analyzing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 space-y-3"
        >
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                <h4 className="font-medium">Authenticity Analysis</h4>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-500">{result.originalScore}%</div>
                <div className="text-muted-foreground">Original Thinking</div>
              </div>
            </div>

            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-green-600">Original</span>
                  <span className="text-green-600">{result.originalScore}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${result.originalScore}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-orange-600">AI patterns</span>
                  <span className="text-orange-600">{result.aiGeneratedScore}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${result.aiGeneratedScore}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {result.aiGeneratedScore > 15 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4"
            >
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">AI Pattern Detection</h4>
                  <p className="text-muted-foreground">Phát hiện một số đặc điểm của văn bản AI</p>
                </div>
              </div>
              <ul className="space-y-1 ml-7">
                {result.patterns.map((pattern, index) => (
                  <li key={index} className="text-foreground/80 text-sm">
                    • {pattern}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {result.aiGeneratedScore > 15 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.2 }}
              className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
            >
              <div className="flex items-start gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Gợi ý cải thiện</h4>
                  <ul className="text-foreground/80 space-y-1">
                    <li>• Hãy bổ sung suy nghĩ cá nhân của bạn</li>
                    <li>• Mô tả thêm cách bạn tiếp cận bài toán</li>
                    <li>• Viết theo phong cách tự nhiên hơn</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-muted/30 rounded-lg p-3"
          >
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Paste:</span>
                <span>{result.activity.pasteTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Edits:</span>
                <span>{result.activity.editCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Rewrites:</span>
                <span>{result.activity.rewriteCount}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
