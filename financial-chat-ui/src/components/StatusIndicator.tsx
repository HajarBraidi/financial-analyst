import React from 'react';
import { HealthStatus } from '../types';

interface StatusIndicatorProps {
  status: HealthStatus;
  label?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label = true }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: 'bg-emerald-500',
          ring: 'ring-emerald-500/20',
          text: 'Connecté au serveur',
        };
      case 'error':
        return {
          color: 'bg-rose-500',
          ring: 'ring-rose-500/20',
          text: 'Serveur hors ligne',
        };
      case 'unknown':
      default:
        return {
          color: 'bg-slate-400 dark:bg-slate-500',
          ring: 'ring-slate-400/20',
          text: 'État non vérifié',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-2" title={config.text}>
        <span className="relative flex h-2.5 w-2.5">
            {status === 'connected' && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${config.color} ring-4 ${config.ring}`} />
        </span>
        {label && (
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
            {config.text}
            </span>
        )}
    </div>
  ) };