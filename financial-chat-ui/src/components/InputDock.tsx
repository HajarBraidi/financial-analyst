import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Loader2, Building, Calendar, SlidersHorizontal } from 'lucide-react';
import { ChatFilters } from '../types';

interface InputDockProps {
  onSendMessage: (question: string, filters: ChatFilters) => void;
  isLoading: boolean;
  prefill?: { question: string; filters: ChatFilters } | null;
  onClearPrefill?: () => void;
}

export const InputDock: React.FC<InputDockProps> = ({
  onSendMessage,
  isLoading,
  prefill,
  onClearPrefill,
}) => {
  const [question, setQuestion] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [entreprise, setEntreprise] = useState('');
  const [annee, setAnnee] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (prefill) {
      setQuestion(prefill.question);
      if (prefill.filters.entreprise) setEntreprise(prefill.filters.entreprise);
      if (prefill.filters.annee) setAnnee(String(prefill.filters.annee));
      textareaRef.current?.focus();
      onClearPrefill?.();
    }
  }, [prefill, onClearPrefill]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim() || isLoading) return;

    const parsedYear = annee ? parseInt(annee, 10) : undefined;
    onSendMessage(question, {
      entreprise: entreprise.trim() || undefined,
      annee: parsedYear && !isNaN(parsedYear) ? parsedYear : undefined,
    });

    setQuestion('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 pb-5 pt-2">
      {/* Panneau de filtres escamotable */}
      {showFilters && (
        <div className="mb-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-lg grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fade-slide-up">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase">Entreprise</label>
            <input
              type="text"
              placeholder="Ex. 3M, Apple..."
              value={entreprise}
              onChange={(e) => setEntreprise(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-white/10 dark:bg-slate-950"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase">Année</label>
            <input
              type="number"
              placeholder="Ex. 2024"
              value={annee}
              onChange={(e) => setAnnee(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-white/10 dark:bg-slate-950 tabular-nums"
            />
          </div>
        </div>
      )}

      {/* Barre capsule style FinInsight */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3 py-1.5 shadow-md dark:border-white/10 dark:bg-slate-900 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
      >
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          title="Filtres de recherche"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Posez votre question ici..."
          className="flex-1 resize-none bg-transparent py-1.5 text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-white"
        />

        {/* Bouton d'envoi circulaire bleu */}
        <button
          type="submit"
          disabled={!question.trim() || isLoading}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 transition-all shadow-md shadow-blue-600/30"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 -translate-x-0.5 translate-y-0.5" />}
        </button>
      </form>
    </div>
  );
};