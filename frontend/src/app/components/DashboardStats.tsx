import { useEffect, useState } from 'react';
import {
  Brain, Shield, Clock, Sparkles, TrendingUp, Calendar, ArrowLeft,
  Target, Edit3, RotateCcw, BarChart3, Inbox,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { api, type DashboardStats } from '../../lib/api';

interface DashboardStatsViewProps {
  onBack?: () => void;
}

function KpiCard({
  icon: Icon, label, value, suffix = '', color, delay = 0,
}: {
  icon: React.ElementType; label: string; value: number | string; suffix?: string; color: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-md transition-all"
    >
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-2xl font-bold">{value}{suffix}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <Inbox className="w-10 h-10 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Chưa có dữ liệu học tập</h2>
      <p className="text-muted-foreground max-w-md">
        Hoàn thành ít nhất một phiên suy nghĩ và phân tích AI để xem thống kê tiến trình của bạn.
      </p>
    </motion.div>
  );
}

export function DashboardStats({ onBack }: DashboardStatsViewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Đang tải thống kê...</p>
      </div>
    );
  }

  if (!stats?.hasData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-6">
        {onBack && (
          <button onClick={onBack} className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
        )}
        <EmptyState />
      </div>
    );
  }

  const chartData = stats.weeklyThinking.map((t, i) => ({
    day: t.day,
    thinking: t.value,
    authenticity: stats.weeklyAuthenticity[i]?.value ?? 0,
    focus: stats.weeklyFocusTime[i]?.value ?? 0,
    sessions: stats.weeklySessions[i]?.count ?? 0,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <button onClick={onBack} className="w-10 h-10 rounded-lg bg-card border border-border hover:bg-accent flex items-center justify-center">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-semibold flex items-center gap-2">
                <Sparkles className="w-7 h-7 text-primary" />
                AI Learning Dashboard
              </h1>
              <p className="text-muted-foreground text-sm">Theo dõi tiến trình tư duy độc lập</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="w-4 h-4" /> 30 ngày gần nhất
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          <KpiCard icon={Brain} label="Thinking Score" value={stats.thinkingScore} color="from-blue-500 to-cyan-500" delay={0.05} />
          <KpiCard icon={Shield} label="Authenticity" value={stats.authenticityScore} suffix="%" color="from-green-500 to-emerald-500" delay={0.1} />
          <KpiCard icon={Clock} label="Focus Time" value={stats.totalFocusTime} suffix="p" color="from-purple-500 to-pink-500" delay={0.15} />
          <KpiCard icon={Sparkles} label="AI Usage" value={stats.aiUsageCount} color="from-orange-500 to-amber-500" delay={0.2} />
          <KpiCard icon={Target} label="Problems Solved" value={stats.problemsSolved} color="from-indigo-500 to-violet-500" delay={0.25} />
          <KpiCard icon={Edit3} label="Edit Count" value={stats.editCount} color="from-teal-500 to-cyan-500" delay={0.3} />
          <KpiCard icon={RotateCcw} label="Rewrite Count" value={stats.rewriteCount} color="from-rose-500 to-red-500" delay={0.35} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <ChartCard title="Thinking & Authenticity theo ngày" icon={TrendingUp}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="thinking" stroke="#6366f1" name="Thinking" strokeWidth={2} />
                <Line type="monotone" dataKey="authenticity" stroke="#22c55e" name="Authenticity" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Thời gian suy nghĩ (phút)" icon={Clock}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="focus" fill="#8b5cf6" name="Phút" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Phiên học tập theo tuần" icon={BarChart3}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="sessions" fill="#3b82f6" name="Phiên" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Bài toán làm nhiều nhất" icon={Target}>
            {stats.topProblems.length === 0 ? (
              <p className="text-muted-foreground text-sm p-4">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-3 p-2">
                {stats.topProblems.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-primary w-5">{i + 1}</span>
                    <div className="flex-1 text-sm truncate">{p.name}</div>
                    <div className="text-sm font-medium text-muted-foreground">{p.count}×</div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-6"
    >
      <h3 className="flex items-center gap-2 font-medium mb-4 text-sm">
        <Icon className="w-4 h-4 text-primary" />
        {title}
      </h3>
      {children}
    </motion.div>
  );
}
