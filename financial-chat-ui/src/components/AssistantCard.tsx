import React, { useState, useRef } from 'react';
import {
  FileText,
  Copy,
  Check,
  ExternalLink,
  RotateCw,
  TrendingUp,
} from 'lucide-react';
import { ChatMessage } from '../types';
import { AnswerBody } from './AnswerBody';
import { CalcBox } from './CalcBox';
import { ProofList } from './ProofList';
import { WarningBox } from './WarningBox';
import { SourcePanel } from './SourcePanel';

interface AssistantCardProps {
  message: ChatMessage;
  onRetry?: () => void;
}

export const AssistantCard: React.FC<AssistantCardProps> = ({ message, onRetry }) => {
  const [copied, setCopied] = useState(false);
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(false);
  const [isRevealFinished, setIsRevealFinished] = useState(!message.isLoading);
  const sourceButtonRef = useRef<HTMLButtonElement>(null);

  const response = message.response;
  const timeString = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleCopy = () => {
    if (!response?.answer) return;
    navigator.clipboard.writeText(response.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const proofExtracts = response?.preuves ? response.preuves.map((p) => p.extrait) : [];

  return (
    <div className="flex items-start gap-3 w-full">
      {/* Avatar IA FinInsight avec barres boursières */}
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-finance-900 border border-finance-700 text-sky-400 shadow-sm mt-1">
        <TrendingUp className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/90">
        {/* En-tête de message */}
        {response && (
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-white/5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Analyse fondée sur les déclarations officielles déposées auprès de la SEC
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="tabular-nums">{timeString}</span>
            </div>
          </div>
        )}

        {/* Skeleton Shimmer */}
        {message.isLoading && (
          <div className="space-y-3 py-2">
            <div className="h-4 w-3/4 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
            <div className="h-4 w-full rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
            <div className="h-4 w-5/6 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
          </div>
        )}

        {/* Erreur */}
        {message.error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
            <p className="text-sm font-medium">{message.error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-500"
              >
                <RotateCw className="h-3.5 w-3.5" /> Réessayer
              </button>
            )}
          </div>
        )}

        {/* Contenu principal */}
        {response && (
          <div className="space-y-4">
            <AnswerBody
              fullText={response.answer}
              animateReveal={true}
              onRevealFinished={() => setIsRevealFinished(true)}
            />

            {isRevealFinished && (
              <div className="space-y-4 pt-2">
                <CalcBox expression={response.expression_calcul} result={response.resultat_calcul} />
                <ProofList preuves={response.preuves} />
                <WarningBox warnings={response.avertissements} />

                {/* Bloc Source PDF Style FinInsight */}
                {response.sources.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Source :
                    </span>
                    <div
                      onClick={() => setIsSourcePanelOpen(true)}
                      className="cursor-pointer group flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100/90 dark:border-white/10 dark:bg-slate-950/40 dark:hover:bg-slate-800/60 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Vignette rouge PDF */}
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-rose-500 text-white shadow-sm">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {response.sources[0].doc_name} — Page {response.sources[0].page}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {response.sources[0].company} • {response.sources[0].doc_type} ({response.sources[0].year})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-3">
                        <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 group-hover:underline hidden sm:inline">
                          Consulter ({response.sources.length})
                        </span>
                        <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Barre d'action */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copié' : 'Copier'}
                  </button>

                  <button
                    ref={sourceButtonRef}
                    type="button"
                    onClick={() => setIsSourcePanelOpen(true)}
                    className="text-xs font-medium text-slate-500 hover:text-blue-600"
                  >
                    Voir tous les extraits ({response.sources.length})
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {response && (
        <SourcePanel
          isOpen={isSourcePanelOpen}
          onClose={() => setIsSourcePanelOpen(false)}
          sources={response.sources}
          proofExtracts={proofExtracts}
        />
      )}
    </div>
  );
};