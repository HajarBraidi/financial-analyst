
import React from 'react';
import {
  FileText,
  BarChart2,
  Clock,
  Plus,
  Moon,
  Sun,
  Settings,
  X,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { HealthStatus, SessionQuestion } from '../types';
import { StatusIndicator } from './StatusIndicator';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessionQuestions: SessionQuestion[];
  activeMessageId: string | null;
  onSelectSessionQuestion: (messageId: string) => void;
  onNewConversation: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  healthStatus: HealthStatus;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessionQuestions,
  activeMessageId,
  onSelectSessionQuestion,
  onNewConversation,
  isDarkMode,
  onToggleDarkMode,
  onOpenSettings,
  healthStatus,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[300px] flex-col
          overflow-hidden border-r border-sky-300/15 text-slate-100
          shadow-2xl shadow-slate-950/30
          transition-transform duration-300 ease-out
          lg:static lg:translate-x-0 lg:shadow-none
          ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
         
        style={{
        backgroundColor: '#04244f',
        backgroundImage: `
            linear-gradient(
            180deg,
            rgba(95, 102, 111, 0.72) 0%,
            rgba(46, 60, 78, 0.48) 42%,
            rgba(14, 62, 137, 0.78) 100%
            ),
            url('/images/financial-sidebar-bg.jpeg')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Subtle top accent */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-300" />

        {/* Brand */}
        <div className="relative flex items-center justify-between px-6 pb-7 pt-8">
          <div className="flex items-center gap-3.5">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center
                rounded-xl border border-sky-300/25
                bg-sky-400/10 shadow-lg shadow-blue-950/30
                backdrop-blur-md"
            >
            <TrendingUp className="h-6 w-6 text-sky-300" />
            </div>

            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[21px] font-bold tracking-tight text-white">
                  FinInsight
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-sky-300">
                  AI
                </span>
              </div>

              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.19em] text-slate-300/75">
                Financial Intelligence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-300 transition-colors
              hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* New conversation */}
        <div className="relative px-5 pb-6">
          <button
            type="button"
            onClick={() => {
              onNewConversation();
              onClose();
            }}
            className="group flex w-full items-center gap-3 rounded-xl
              border border-sky-300/30 bg-blue-500/15 px-4 py-3.5
              text-sm font-semibold text-white shadow-lg
              shadow-blue-950/20 backdrop-blur-md transition-all
              hover:border-sky-300/60 hover:bg-blue-500/25
              focus:outline-none focus:ring-2 focus:ring-sky-400/50"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-400/15">
              <Plus className="h-4 w-4 text-sky-300 transition-transform group-hover:rotate-90" />
            </span>
            <span>Nouvelle conversation</span>
          </button>
        </div>

        {/* Conversation history */}
        <div className="relative z-10 flex-1 space-y-2 overflow-y-auto px-4 py-2">
          <div className="mb-3 flex items-center justify-between px-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-300/75">
              Historique
            </p>
            <Clock className="h-3.5 w-3.5 text-slate-400" />
          </div>

          {sessionQuestions.length === 0 ? (
            <div className="space-y-1">
              <button
                type="button"
                className="flex w-full items-start gap-3 rounded-xl
                  border border-sky-300/20 bg-sky-400/10 px-3.5 py-3
                  text-left shadow-sm backdrop-blur-sm"
              >
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-white">
                    Analyse rapport annuel
                  </p>
                  <span className="mt-1 block text-[11px] text-slate-400">
                    Aujourd'hui
                  </span>
                </div>
              </button>

              <button
                type="button"
                className="flex w-full items-start gap-3 rounded-xl
                  px-3.5 py-3 text-left transition-colors
                  hover:bg-white/[0.07]"
              >
                <BarChart2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-200/70" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] text-slate-200">
                    Risques financiers
                  </p>
                  <span className="mt-1 block text-[11px] text-slate-400">
                    Hier
                  </span>
                </div>
              </button>

              <button
                type="button"
                className="flex w-full items-start gap-3 rounded-xl
                  px-3.5 py-3 text-left transition-colors
                  hover:bg-white/[0.07]"
              >
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] text-slate-200">
                    Comparaison 2024
                  </p>
                  <span className="mt-1 block text-[11px] text-slate-400">
                    Il y a 3 jours
                  </span>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {sessionQuestions.map((sq, idx) => {
                const isActive =
                  sq.messageId === activeMessageId ||
                  (!activeMessageId && idx === 0);

                return (
                  <button
                    key={sq.id}
                    type="button"
                    onClick={() => {
                      onSelectSessionQuestion(sq.messageId);
                      onClose();
                    }}
                    className={`flex w-full items-start gap-3 rounded-xl
                      border px-3.5 py-3 text-left transition-all ${
                        isActive
                          ? 'border-sky-300/25 bg-sky-400/10 text-white shadow-sm backdrop-blur-sm'
                          : 'border-transparent text-slate-300 hover:bg-white/[0.07] hover:text-white'
                      }`}
                  >
                    {idx % 3 === 0 ? (
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                    ) : idx % 3 === 1 ? (
                      <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                    ) : (
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">
                        {sq.question}
                      </p>
                      <span className="mt-1 block text-[11px] text-slate-400">
                        {idx === 0
                          ? "Aujourd'hui"
                          : idx === 1
                            ? 'Hier'
                            : 'Session courante'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom utility area — quote removed */}
        <div className="relative z-10 border-t border-white/10 bg-slate-950/25 px-5 py-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sky-300" />
            <span className="text-xs font-medium text-slate-200">
              Système et préférences
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <StatusIndicator status={healthStatus} />

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="rounded-lg p-2 text-slate-300 transition-colors
                  hover:bg-white/10 hover:text-white"
                title="Basculer le thème"
                aria-label="Basculer le thème"
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4 text-amber-300" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>

              <button
                type="button"
                onClick={onOpenSettings}
                className="rounded-lg p-2 text-slate-300 transition-colors
                  hover:bg-white/10 hover:text-white"
                title="Paramètres de l'application"
                aria-label="Paramètres"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
