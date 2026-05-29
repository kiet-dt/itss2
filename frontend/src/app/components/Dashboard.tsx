import { useState } from 'react';
import { Clock, Play } from 'lucide-react';

interface DashboardProps {
  onStart: (minutes: number) => void;
}

export function Dashboard({ onStart }: DashboardProps) {
  const [thinkingTime, setThinkingTime] = useState(15);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/20">
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-xl border border-border">
        <div className="text-center mb-8">
          <h1 className="mb-2">Ghi chú trước khi code</h1>
          <p className="text-muted-foreground">
            Suy nghĩ và lập kế hoạch trước khi sử dụng AI
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-primary" />
              Thời gian suy nghĩ: {thinkingTime} phút
            </label>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={thinkingTime}
              onChange={(e) => setThinkingTime(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between mt-1">
              <span className="text-muted-foreground">5 phút</span>
              <span className="text-muted-foreground">60 phút</span>
            </div>
          </div>

          <button
            onClick={() => onStart(thinkingTime)}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Bắt đầu
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            💡 Lập kế hoạch tốt giúp code hiệu quả hơn
          </p>
        </div>
      </div>
    </div>
  );
}
