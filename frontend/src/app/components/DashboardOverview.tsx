import { useState } from 'react';
import { Brain, Shield, Clock, Sparkles, TrendingUp, Calendar, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import type { DashboardStats } from '../../lib/api';
import { getDashboardStats } from '../../lib/localStats';

interface DashboardOverviewProps {
  onBack?: () => void;
}

export function DashboardOverview({ onBack }: DashboardOverviewProps) {
  const [mockStats, setMockStats] = useState<DashboardStats>(() => getDashboardStats());

  const StatCard = ({
    icon: Icon,
    label,
    value,
    suffix = '',
    color,
    delay = 0
  }: {
    icon: any;
    label: string;
    value: number | string;
    suffix?: string;
    color: string;
    delay?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold mb-1">
        {value}{suffix}
      </div>
      <div className="text-muted-foreground">{label}</div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="w-10 h-10 rounded-lg bg-card border border-border hover:bg-accent transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="mb-2 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-primary" />
                AI Learning Dashboard
              </h1>
              <p className="text-muted-foreground">
                Theo dõi tiến trình học tập và phát triển tư duy của bạn
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-5 h-5" />
            <span>Tuần này</span>
          </div>
        </motion.div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-4 gap-6">
          <StatCard
            icon={Brain}
            label="Thinking Score"
            value={mockStats.thinkingScore}
            color="from-blue-500 to-cyan-500"
            delay={0.1}
          />
          <StatCard
            icon={Shield}
            label="Authenticity Score"
            value={mockStats.authenticityScore}
            suffix="%"
            color="from-green-500 to-emerald-500"
            delay={0.2}
          />
          <StatCard
            icon={Clock}
            label="Focus Time"
            value={mockStats.totalFocusTime}
            suffix=" phút"
            color="from-purple-500 to-pink-500"
            delay={0.3}
          />
          <StatCard
            icon={Sparkles}
            label="AI Usage"
            value={mockStats.aiUsageCount}
            suffix=" lần"
            color="from-orange-500 to-amber-500"
            delay={0.4}
          />
        </div>

        {/* Weekly Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-2xl p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="mb-1">Weekly Learning Progress</h2>
              <p className="text-muted-foreground">
                Điểm thinking score trung bình theo ngày
              </p>
            </div>
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>

          <div className="flex items-end justify-between gap-4 h-64">
            {mockStats.weeklyProgress.map((item, index) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-3">
                <motion.div
                  className="w-full bg-gradient-to-t from-primary to-blue-500 rounded-t-lg relative group"
                  initial={{ height: 0 }}
                  animate={{ height: `${item.score}%` }}
                  transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background px-2 py-1 rounded text-sm whitespace-nowrap">
                    {item.score} điểm
                  </div>
                </motion.div>
                <span className="text-muted-foreground font-medium">{item.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Insights Grid */}
        <div className="grid grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6"
          >
            <h3 className="mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-500" />
              Thinking Insights
            </h3>
            <ul className="space-y-2 text-foreground/80">
              <li>• Điểm trung bình tăng 12% so với tuần trước</li>
              <li>• Bạn đã cải thiện khả năng phân tích edge case</li>
              <li>• Thời gian tập trung trung bình: 18 phút/session</li>
              <li>• Chủ nhật là ngày có điểm cao nhất</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6"
          >
            <h3 className="mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Authenticity Insights
            </h3>
            <ul className="space-y-2 text-foreground/80">
              <li>• Tỷ lệ original thinking: 85% (Tốt!)</li>
              <li>• Giảm 20% AI-generated patterns</li>
              <li>• Phong cách viết cá nhân rõ ràng hơn</li>
              <li>• Số lần chỉnh sửa tăng 35%</li>
            </ul>
          </motion.div>
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-purple-500/30 rounded-xl p-6"
        >
          <h3 className="mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Coaching Tips
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-foreground/80">
              <div className="font-medium mb-1">💡 Tập trung sâu</div>
              <p className="text-sm">Hãy dành ít nhất 15 phút suy nghĩ kỹ trước khi code</p>
            </div>
            <div className="text-foreground/80">
              <div className="font-medium mb-1">✍️ Viết tự nhiên</div>
              <p className="text-sm">Ghi chú theo phong cách riêng, không sao chép AI</p>
            </div>
            <div className="text-foreground/80">
              <div className="font-medium mb-1">🎯 Edge cases</div>
              <p className="text-sm">Luôn nghĩ đến các trường hợp đặc biệt và biên</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
