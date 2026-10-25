import React from 'react';
import { Calculator, AlertCircle } from 'lucide-react';
import { formatFrenchNumber } from '../lib/format';

interface CalcBoxProps {
  expression: string | null;
  result: number | null;
}

export const CalcBox: React.FC<CalcBoxProps> = ({ expression, result }) => {
  if (!expression) return null;

  const isImpossible = result === null;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 sm:p-4 text-slate-800 shadow-sm dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100">
      <div className="flex items-center gap-2 mb-2">
        <Calculator className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Calcul arithmétique effectué par Python
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-950/70 border border-slate-200/80 dark:border-white/5 rounded-lg p-2.5 sm:p-3 font-mono text-sm">
        <code className="text-slate-700 dark:text-slate-300 break-all select-all">
          {expression}
        </code>

        <div className="flex items-center gap-2 text-right ml-auto">
          <span className="text-slate-400">=</span>
          {isImpossible ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              Calcul impossible à effectuer
            </span>
          ) : (
            <span className="font-bold text-base text-indigo-700 dark:text-indigo-300 tabular-nums">
              {formatFrenchNumber(result)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};