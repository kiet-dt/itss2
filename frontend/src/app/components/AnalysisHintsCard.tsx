import { Lightbulb } from 'lucide-react';
import { ANALYSIS_HINTS } from '../../lib/pseudocodeTemplates';

export function AnalysisHintsCard() {
  return (
    <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 p-4">
      <h3 className="flex items-center gap-2 text-sm font-medium mb-3 text-blue-600 dark:text-blue-400">
        <Lightbulb className="w-4 h-4" />
        Phân tích bài toán
      </h3>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ANALYSIS_HINTS.map((hint) => (
          <li key={hint} className="text-sm text-foreground/80 flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            {hint}
          </li>
        ))}
      </ul>
    </div>
  );
}
