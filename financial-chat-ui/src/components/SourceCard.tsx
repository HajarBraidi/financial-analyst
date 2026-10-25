import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { SourceDocument } from '../types';
import { ScoreBar } from './ScoreBar';
import { highlightProofExtracts } from '../lib/format';

interface SourceCardProps {
  source: SourceDocument;
  proofExtracts: string[];
}

export const SourceCard: React.FC<SourceCardProps> = ({ source, proofExtracts }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const highlightedSegments = highlightProofExtracts(source.texte, proofExtracts);

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm transition-all hover:border-slate-300 dark:border-white/10 dark:bg-slate-900/50 dark:hover:border-white/20">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            #{source.rang}
          </span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {source.company}
          </span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200 tabular-nums">
            {source.year}
          </span>
          <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 uppercase">
            {source.doc_type}
          </span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300 tabular-nums">
            p. {source.page}
          </span>
        </div>

        <ScoreBar score={source.score} />
      </div>

      <div className="flex items-center gap-1.5 mb-2 text-xs font-mono text-slate-400 dark:text-slate-500">
        <FileText className="h-3.5 w-3.5" />
        <span className="truncate">{source.doc_name}</span>
      </div>

      {/* Excerpt Body with proof highlights */}
      <div className="relative">
        <div
          className={`text-xs sm:text-[13px] leading-relaxed text-slate-600 dark:text-slate-300 font-mono whitespace-pre-wrap rounded-lg bg-slate-50 p-3 dark:bg-slate-950/60 border border-slate-100 dark:border-white/5 ${
            isExpanded ? '' : 'line-clamp-6'
          }`}
        >
          {highlightedSegments.map((seg, i) =>
            seg.isHighlight ? (
              <mark
                key={i}
                className="bg-amber-200/90 text-amber-950 dark:bg-amber-500/30 dark:text-amber-100 px-1 py-0.5 rounded font-semibold"
                title="Extrait recoupé dans les preuves"
              >
                {seg.text}
              </mark>
            ) : (
              <span key={i}>{seg.text}</span>
            )
          )}
        </div>
      </div>

      {/* Expand / Collapse Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="h-3.5 w-3.5" />
            Voir moins
          </>
        ) : (
          <>
            <ChevronDown className="h-3.5 w-3.5" />
            Voir plus
          </>
        )}
      </button>
    </div>
  );
};