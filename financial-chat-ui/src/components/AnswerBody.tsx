import React, { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AnswerBodyProps {
  fullText: string;
  animateReveal: boolean;
  onRevealFinished: () => void;
}

export const AnswerBody: React.FC<AnswerBodyProps> = ({
  fullText,
  animateReveal,
  onRevealFinished,
}) => {
  const [displayedLength, setDisplayedLength] = useState<number>(
    animateReveal ? 0 : fullText.length
  );
  const [isRevealing, setIsRevealing] = useState<boolean>(animateReveal);

  useEffect(() => {
    if (!animateReveal) {
      setDisplayedLength(fullText.length);
      setIsRevealing(false);
      onRevealFinished();
      return;
    }

    let current = 0;
    const interval = setInterval(() => {
      // Reveal 3 characters every 15ms
      current += 3;
      if (current >= fullText.length) {
        clearInterval(interval);
        setDisplayedLength(fullText.length);
        setIsRevealing(false);
        onRevealFinished();
      } else {
        setDisplayedLength(current);
      }
    }, 15);

    const handleSkip = () => {
      clearInterval(interval);
      setDisplayedLength(fullText.length);
      setIsRevealing(false);
      onRevealFinished();
    };

    window.addEventListener('keydown', handleSkip);
    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleSkip);
    };
  }, [fullText, animateReveal, onRevealFinished]);

  const revealedText = fullText.slice(0, displayedLength);

  return (
    <div
      onClick={() => {
        if (isRevealing) {
          setDisplayedLength(fullText.length);
          setIsRevealing(false);
          onRevealFinished();
        }
      }}
      className={`prose prose-slate max-w-none text-slate-800 leading-relaxed dark:prose-invert dark:text-slate-200 text-[15px] ${
        isRevealing ? 'cursor-pointer select-none' : ''
      }`}
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-4 mb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white mt-4 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-3 mb-1.5">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          code: ({ children, className }) => (
            <code
              className={`${className || ''} rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-indigo-700 dark:bg-slate-800 dark:text-indigo-300`}
            >
              {children}
            </code>
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-white/10 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm dark:divide-white/10">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100 font-semibold text-slate-900 dark:bg-slate-800/80 dark:text-white">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-white/5 dark:bg-slate-900/60">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="odd:bg-white even:bg-slate-50/60 dark:odd:bg-transparent dark:even:bg-white/[0.02]">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2.5 font-medium">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2.5 tabular-nums">{children}</td>
          ),
        }}
      >
        {revealedText}
      </Markdown>

      {isRevealing && (
        <span
          className="inline-block h-4 w-1.5 translate-y-0.5 bg-indigo-600 animate-pulse ml-0.5 dark:bg-indigo-400"
          aria-hidden="true"
        />
      )}
    </div>
  );
};