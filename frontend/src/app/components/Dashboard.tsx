import { useState } from 'react';
import { Clock, Play, Brain, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  onStart: (minutes: number) => void;
}

export function Dashboard({ onStart }: DashboardProps) {
  const [minutes, setMinutes] = useState('15');
  const [error, setError] = useState('');

  const handleChange = (value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      setMinutes(value);
      setError('');
    }
  };

  const handleStart = () => {
    if (!minutes.trim()) {
      setError('Không được để trống');
      return;
    }
    const num = parseInt(minutes, 10);
    if (num <= 0) {
      setError('Chỉ nhận số dương');
      return;
    }
    onStart(num);
  };

  const presets = [5, 10, 15, 30, 60];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-blue-500/10 p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-blue-500/5 pointer-events-none" />

          <div className="relative p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#030213] to-blue-600 dark:from-indigo-500 dark:to-violet-600 text-white mb-4 shadow-lg shadow-blue-600/25 dark:shadow-violet-500/30">
                <Brain className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-semibold mb-2">Dành vài phút suy nghĩ trước khi bắt đầu</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Hãy tự tìm hướng giải quyết trước. AI sẽ giúp bạn phản biện và hoàn thiện ý tưởng, thay vì đưa đáp án ngay từ đầu.
              </p>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-border/60 bg-muted/30 p-5 hover:border-primary/30 transition-colors">
                <label className="flex items-center gap-2 mb-4 text-sm font-medium">
                  <Clock className="w-4 h-4 text-primary" />
                  Bạn muốn suy nghĩ trong bao lâu?
                </label>

                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={minutes}
                    onChange={(e) => handleChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                    className="w-24 text-center text-2xl font-bold px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    aria-label="Số phút suy nghĩ"
                  />
                  <span className="text-muted-foreground">phút</span>
                </div>

                {error && <p className="text-destructive text-sm mb-3">{error}</p>}

                <div className="flex flex-wrap gap-2">
                  {presets.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { setMinutes(String(p)); setError(''); }}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-all hover:scale-105 ${
                        minutes === String(p)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:border-primary/50'
                      }`}
                    >
                      {p}p
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStart}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#030213] to-blue-600 dark:from-indigo-600 dark:to-violet-700 text-white rounded-xl hover:shadow-lg hover:shadow-blue-600/25 dark:hover:shadow-violet-500/30 transition-shadow flex items-center justify-center gap-2 font-medium"
              >
                <Play className="w-5 h-5" />
                Bắt đầu phiên suy nghĩ
              </motion.button>
            </div>

            <div className="mt-6 flex items-start gap-2 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Xác định vấn đề → Tự phân tích → Mã giả hoặc sơ đồ tư duy → Nhận phản hồi từ AI → Theo dõi tiến trình
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
