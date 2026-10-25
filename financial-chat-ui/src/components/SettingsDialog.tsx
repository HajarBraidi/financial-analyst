import React, { useState } from 'react';
import { X, Server, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { checkHealth } from '../api';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  baseUrl: string;
  onSaveBaseUrl: (url: string) => void;
  isDemoMode: boolean;
  onToggleDemoMode: (val: boolean) => void;
  onRefreshHealth: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  baseUrl,
  onSaveBaseUrl,
  isDemoMode,
  onToggleDemoMode,
  onRefreshHealth,
}) => {
  const [urlInput, setUrlInput] = useState(baseUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    status?: number;
    message?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await checkHealth(urlInput);
    setTesting(false);
    if (res.ok) {
      setTestResult({
        ok: true,
        status: res.status ?? 200,
        message: 'Serveur joignable et opérationnel.',
      });
      onRefreshHealth();
    } else {
      setTestResult({
        ok: false,
        message: 'Impossible de joindre le endpoint /api/health.',
      });
      onRefreshHealth();
    }
  };

  const handleSave = () => {
    onSaveBaseUrl(urlInput);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900 animate-fade-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Server className="h-4 w-4" />
            </div>
            <h3 id="settings-title" className="text-base font-semibold text-slate-900 dark:text-white">
              Paramètres de connexion
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 pt-4">
          {/* Demo Mode Toggle */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Mode démo (sans serveur)
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Utilise des données d'analyse complètes sans appeler de backend.
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={isDemoMode}
                onChange={(e) => onToggleDemoMode(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-indigo-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 dark:bg-slate-700 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
            </label>
          </div>

          {/* Base URL Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              URL du serveur Backend
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setTestResult(null);
              }}
              disabled={isDemoMode}
              placeholder="http://localhost:8000"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 dark:border-white/10 dark:bg-slate-950 dark:text-white font-mono"
            />
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Pour un backend distant, collez l'URL publique fournie par le serveur (ex. tunnel ngrok).
            </p>
          </div>

          {/* Test Connection Button & Indicator */}
          {!isDemoMode && (
            <div>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || !urlInput.trim()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {testing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Tester la connexion
              </button>

              {testResult && (
                <div
                  className={`mt-2.5 flex items-center gap-2 text-xs font-medium ${
                    testResult.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {testResult.ok ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span>
                    {testResult.message} {testResult.status ? `(HTTP ${testResult.status})` : ''}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Fermer
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};