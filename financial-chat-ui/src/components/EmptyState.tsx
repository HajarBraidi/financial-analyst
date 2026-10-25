
import React from 'react';
import {
  BarChart3,
  ShieldCheck,
  History,
  ArrowRight,
  Sparkles,
  TrendingUp,
  FileSearch,
} from 'lucide-react';
import { SUGGESTIONS, SuggestionItem } from '../constants';

interface EmptyStateProps {
  onSelectSuggestion: (suggestion: SuggestionItem) => void;
}

const suggestionCards = [
  {
    index: 0,
    icon: BarChart3,
    category: 'PERFORMANCE',
    title: "Analysez le chiffre d'affaires et la rentabilité",
    description: 'Identifiez les tendances et les indicateurs clés.',
    example: 'Ex. 3M FY2018',
  },
  {
    index: 2,
    icon: ShieldCheck,
    category: 'GESTION DES RISQUES',
    title: 'Quels sont les principaux risques financiers ?',
    description: 'Explorez les risques et les facteurs de vigilance.',
    example: 'Ex. Coca-Cola 10-K',
  },
  {
    index: 1,
    icon: History,
    category: 'ANALYSE COMPARATIVE',
    title: "Comparez les résultats d'exploitation",
    description: 'Mesurez les évolutions entre périodes.',
    example: 'Ex. Netflix Q2 2023',
  },
];

export const EmptyState: React.FC<EmptyStateProps> = ({
  onSelectSuggestion,
}) => {
  return (
    <div className="animate-fade-slide-up space-y-9 py-8 sm:py-12">

      {/* Welcome section */}
      <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-sky-50/70 to-blue-100/60 p-6 shadow-sm dark:border-sky-900/60 dark:from-slate-900 dark:via-[#0a1d38] dark:to-[#0d2c50] sm:p-9">

        {/* Decorative background accents */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl dark:bg-blue-400/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 right-1/4 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl"
        />

        <div className="relative flex items-start gap-4 sm:gap-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-200/80 bg-white/90 text-[#1767a4] shadow-sm dark:border-sky-800 dark:bg-sky-950/70 dark:text-sky-300 sm:h-14 sm:w-14">
            <Sparkles className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#1767a4] dark:text-sky-300">
                FinInsight AI
              </span>
              <span className="h-1 w-1 rounded-full bg-sky-400" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Votre analyste financier
              </span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-[#0b1d38] dark:text-white sm:text-4xl">
              Bonjour,
              <span className="mt-1 block text-[#1767a4] dark:text-sky-300">
                que souhaitez-vous analyser ?
              </span>
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
              Interrogez vos documents financiers, comprenez les indicateurs
              clés et transformez vos rapports en informations exploitables,
              avec des réponses appuyées sur vos sources.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Réponses sourcées
              </span>
              <span className="inline-flex items-center gap-2">
                <FileSearch className="h-4 w-4 text-[#1767a4] dark:text-sky-300" />
                Analyse documentaire
              </span>
              <span className="inline-flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#1767a4] dark:text-sky-300" />
                Insights financiers
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Suggested prompts heading */}
      <section>
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1767a4] dark:text-sky-300">
              Pour commencer
            </p>
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
              Explorez vos données financières
            </h3>
          </div>

          <span className="hidden text-xs text-slate-400 sm:block">
            Choisissez une analyse
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {suggestionCards.map((card) => {
            const Icon = card.icon;

            return (
              <button
                key={card.category}
                type="button"
                onClick={() => onSelectSuggestion(SUGGESTIONS[card.index])}
                className="group relative flex min-h-[205px] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-blue-900/[0.07] focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:ring-offset-2 dark:border-white/10 dark:bg-slate-900/80 dark:hover:border-sky-700 dark:hover:bg-slate-900 dark:focus:ring-offset-slate-950 sm:p-5"
              >
                {/* Top accent */}
                <div className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[#125da0] to-sky-400 transition-transform duration-300 group-hover:scale-x-100" />

                <div className="mb-5 flex items-center justify-between gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-sky-100/80 text-[#1767a4] transition-all duration-300 group-hover:border-sky-200 group-hover:from-[#1767a4] group-hover:to-blue-600 group-hover:text-white dark:border-sky-900 dark:from-blue-950/80 dark:to-slate-800 dark:text-sky-300 dark:group-hover:from-blue-700 dark:group-hover:to-sky-600 dark:group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#1767a4] dark:text-slate-600 dark:group-hover:text-sky-300" />
                </div>

                <span className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                  {card.category}
                </span>

                <h4 className="text-sm font-bold leading-6 text-slate-800 transition-colors group-hover:text-[#1767a4] dark:text-slate-100 dark:group-hover:text-sky-300">
                  {card.title}
                </h4>

                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {card.description}
                </p>

                <div className="mt-auto pt-5">
                  <span className="inline-flex items-center rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] font-medium text-slate-500 transition-colors group-hover:bg-blue-50 group-hover:text-[#1767a4] dark:bg-white/[0.04] dark:text-slate-400 dark:group-hover:bg-sky-950/70 dark:group-hover:text-sky-300">
                    {card.example}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Bottom helper */}
      <div className="flex items-center gap-3 rounded-xl border border-blue-100/80 bg-blue-50/60 px-4 py-3 dark:border-sky-900/60 dark:bg-sky-950/20">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#1767a4] shadow-sm dark:bg-slate-900 dark:text-sky-300">
          <FileSearch className="h-4 w-4" />
        </div>
        <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
          <span className="font-semibold text-slate-800 dark:text-white">
            Un document en tête ?
          </span>{' '}
          Posez directement votre question dans la zone de saisie pour
          commencer votre analyse.
        </p>
      </div>
    </div>
  );
};
