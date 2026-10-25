import React from 'react';
import { User, Building, Calendar } from 'lucide-react';
import { ChatMessage } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { content, filters, timestamp } = message;
  const timeString = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex justify-end w-full">
      <div className="flex items-start gap-3 max-w-[85%] sm:max-w-[75%]">
        <div className="flex flex-col items-end">
          <div className="rounded-2xl rounded-tr-sm bg-blue-50/90 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 px-4 py-3 text-slate-800 dark:text-slate-100 shadow-sm text-[15px] leading-relaxed">
            <p className="whitespace-pre-wrap">{content}</p>
          </div>

          <div className="flex items-center gap-2 mt-1 px-1">
            {filters?.entreprise && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <Building className="h-3 w-3" /> {filters.entreprise}
              </span>
            )}
            {filters?.annee && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 tabular-nums">
                <Calendar className="h-3 w-3" /> {filters.annee}
              </span>
            )}
            <span className="text-[10px] text-slate-400 tabular-nums">{timeString}</span>
          </div>
        </div>

        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <User className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};