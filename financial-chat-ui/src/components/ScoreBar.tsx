import React from 'react';
import { formatScore } from '../lib/format';

interface ScoreBarProps {
  score: number;
}

export const ScoreBar: React.FC<ScoreBarProps> = ({ score }) => {
  // Score is usually between 0.0 and 1.0 (cosine similarity)
  const percentage = Math.min(100, Math.max(0, Math.round(score * 100)));

  return (
    <div className="flex flex-col gap-1 w-full max-w-[200px]">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          Score de similarité
        </span>
        <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
          {formatScore(score)}
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};