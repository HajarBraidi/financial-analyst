import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface WarningBoxProps {
  warnings: string[];
}

export const WarningBox: React.FC<WarningBoxProps> = ({ warnings }) => {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div
      role="alert"
      className="rounded-xl border border-amber-300/80 bg-amber-50/90 p-4 text-amber-900 shadow-sm dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5"
          aria-hidden="true"
        />
        <div className="space-y-1.5 flex-1 text-sm leading-relaxed">
          <p className="font-semibold text-amber-950 dark:text-amber-100">
            Avertissements d'analyse ({warnings.length})
          </p>
          <ul className="list-disc pl-4 space-y-1 text-xs sm:text-sm text-amber-900/90 dark:text-amber-200/90">
            {warnings.map((warning, idx) => (
              <li key={idx}>{warning}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};