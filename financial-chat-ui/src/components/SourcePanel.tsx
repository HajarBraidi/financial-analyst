import React, { useEffect, useRef } from 'react';
import { X, Layers } from 'lucide-react';
import { SourceDocument } from '../types';
import { SourceCard } from './SourceCard';

interface SourcePanelProps {
  isOpen: boolean;
  onClose: () => void;
  sources: SourceDocument[];
  proofExtracts: string[];
}

export const SourcePanel: React.FC<SourcePanelProps> = ({
  isOpen,
  onClose,
  sources,
  proofExtracts,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="source-panel-title"
    >
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Drawer */}
      <div
        ref={panelRef}
        className="relative flex h-full w-full max-w-[420px] flex-col bg-white shadow-2xl dark:bg-slate-900 border-l border-slate-200 dark:border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h3 id="source-panel-title" className="text-sm font-semibold text-slate-900 dark:text-white">
                Passages sources
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {sources.length} document{sources.length > 1 ? 's' : ''} indexé{sources.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Fermer le volet des sources"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 focus:outline-none">
          {sources.map((src) => (
            <SourceCard key={src.rang} source={src} proofExtracts={proofExtracts} />
          ))}
        </div>
      </div>
    </div>
  );
};