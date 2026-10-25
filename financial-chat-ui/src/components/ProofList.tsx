import React from 'react';
import { CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { Proof } from '../types';

interface ProofListProps {
  preuves: Proof[];
}

export const ProofList: React.FC<ProofListProps> = ({ preuves }) => {
  if (!preuves || preuves.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Preuves textuelles ({preuves.length})
        </h4>
      </div>

      <div className="grid gap-2.5 sm:gap-3">
        {preuves.map((proof, idx) => (
          <div
            key={idx}
            className="group rounded-xl border border-slate-200/90 bg-white p-3.5 transition-all shadow-sm hover:border-slate-300 dark:border-white/10 dark:bg-slate-900/40 dark:hover:border-white/20"
          >
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300">
                  {proof.doc_name}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300 tabular-nums">
                  p. {proof.page}
                </span>
              </div>

              {proof.verifiee ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Vérifiée
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-300">
                  <AlertCircle className="h-3.5 w-3.5" />
                  À vérifier
                </span>
              )}
            </div>

            <blockquote className="border-l-2 border-indigo-500/70 pl-3 italic text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              « {proof.extrait} »
            </blockquote>
          </div>
        ))}
      </div>
    </div>
  );
};