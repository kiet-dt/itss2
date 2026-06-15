import { Target } from 'lucide-react';

interface ProblemStatementInputProps {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}

const PLACEHOLDER = `Ví dụ:
• Tìm số lớn nhất trong mảng
• Thiết kế chức năng đăng nhập
• Xây dựng hệ thống quản lý cứu trợ
• Thiết kế dashboard học tập
• Tối ưu thuật toán tìm kiếm`;

export function ProblemStatementInput({ value, onChange, compact }: ProblemStatementInputProps) {
  return (
    <div className={`rounded-xl border border-border/60 bg-card/80 ${compact ? 'p-4' : 'p-5'} shadow-sm`}>
      <label className="flex items-center gap-2 mb-3 font-medium text-sm">
        <span className="text-lg">🎯</span>
        <Target className="w-4 h-4 text-primary" />
        Vấn đề cần giải quyết
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={compact ? 3 : 4}
        className="w-full resize-none rounded-lg border border-border bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow placeholder:text-muted-foreground/60"
      />
      {!value.trim() && (
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
          Hãy mô tả bài toán trước khi xây dựng giải pháp.
        </p>
      )}
    </div>
  );
}
