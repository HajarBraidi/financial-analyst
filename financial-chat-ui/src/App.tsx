import React, { useState, useEffect, useCallback } from 'react';
import { ChatFilters, ChatMessage, HealthStatus, SessionQuestion } from './types';
import { DEFAULT_BASE_URL, SuggestionItem } from './constants';
import { askQuestion, checkHealth } from './api';
import { Sidebar } from './components/Sidebar';
 
import { EmptyState } from './components/EmptyState';
import { ChatView } from './components/ChatView';
import { InputDock } from './components/InputDock';
import { SettingsDialog } from './components/SettingsDialog';

export const App: React.FC = () => {
  // Theme state: dark mode follows system preference initially
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // App UI state
  const [baseUrl, setBaseUrl] = useState<string>(DEFAULT_BASE_URL);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('unknown');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionQuestions, setSessionQuestions] = useState<SessionQuestion[]>([]);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [prefill, setPrefill] = useState<{ question: string; filters: ChatFilters } | null>(null);

  // Synchronize dark mode class on HTML document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Periodic health check
  const refreshHealth = useCallback(async () => {
    if (isDemoMode) {
      setHealthStatus('connected');
      return;
    }
    const res = await checkHealth(baseUrl);
    setHealthStatus(res.ok ? 'connected' : 'error');
  }, [baseUrl, isDemoMode]);

  useEffect(() => {
    refreshHealth();
    const interval = setInterval(refreshHealth, 30_000);
    return () => clearInterval(interval);
  }, [refreshHealth]);

  const handleSendMessage = async (
    questionText: string,
    filters: ChatFilters,
    existingAssistantMsgId?: string
  ) => {
    if (isLoading || !questionText.trim()) return;

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = existingAssistantMsgId || `asst-${Date.now()}`;

    // Add user message if not a retry
    if (!existingAssistantMsgId) {
      const userMsg: ChatMessage = {
        id: userMessageId,
        role: 'user',
        content: questionText,
        timestamp: Date.now(),
        filters,
      };

      const asstPlaceholder: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isLoading: true,
      };

      setMessages((prev) => [...prev, userMsg, asstPlaceholder]);

      // Add to session question memory
      const newSessionQ: SessionQuestion = {
        id: `sess-${Date.now()}`,
        question: questionText,
        timestamp: Date.now(),
        messageId: assistantMessageId,
      };
      setSessionQuestions((prev) => [newSessionQ, ...prev]);
      setActiveMessageId(assistantMessageId);
    } else {
      // It's a retry: update the existing assistant card to loading
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId ? { ...m, isLoading: true, error: undefined } : m
        )
      );
    }

    setIsLoading(true);

    try {
      const response = await askQuestion(baseUrl, questionText, filters, isDemoMode);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                content: response.answer,
                response,
                isLoading: false,
                error: undefined,
              }
            : m
        )
      );
      setHealthStatus('connected');
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Une erreur inattendue est survenue.';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                isLoading: false,
                error: errorMsg,
              }
            : m
        )
      );
      if (!isDemoMode && errorMsg.includes('Impossible de joindre le serveur')) {
        setHealthStatus('error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = (assistantMsgId: string) => {
    // Find previous user message
    const asstIndex = messages.findIndex((m) => m.id === assistantMsgId);
    if (asstIndex > 0) {
      const prevUserMsg = messages[asstIndex - 1];
      if (prevUserMsg && prevUserMsg.role === 'user') {
        handleSendMessage(
          prevUserMsg.content,
          prevUserMsg.filters || {},
          assistantMsgId
        );
      }
    }
  };

  const handleSuggestionClick = (suggestion: SuggestionItem) => {
    handleSendMessage(suggestion.question, {
      entreprise: suggestion.company,
      annee: suggestion.year,
    });
  };

  const handleNewConversation = () => {
    setMessages([]);
    setActiveMessageId(null);
  };

  const handleScrollToMessage = (messageId: string) => {
    setActiveMessageId(messageId);
    const element = document.getElementById(messageId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Top bar current title
  const currentTitle =
    sessionQuestions.length > 0 && messages.length > 0
      ? sessionQuestions[0].question
      : 'Nouvelle recherche financière';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessionQuestions={sessionQuestions}
        activeMessageId={activeMessageId}
        onSelectSessionQuestion={handleScrollToMessage}
        onNewConversation={handleNewConversation}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        healthStatus={healthStatus}
      />

      {/* Main column */}
      <div className="flex flex-1 flex-col overflow-hidden relative">


        {/* Scrollable Chat Area */}
        <main className="flex-1 overflow-y-auto px-4">
          <div className="mx-auto w-full max-w-[760px] min-h-full flex flex-col justify-between">
            {messages.length === 0 ? (
              <EmptyState onSelectSuggestion={handleSuggestionClick} />
            ) : (
              <ChatView messages={messages} onRetry={handleRetry} />
            )}
          </div>
        </main>

        {/* Fixed Input Dock at bottom */}
        <InputDock
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          prefill={prefill}
          onClearPrefill={() => setPrefill(null)}
        />
      </div>

      {/* Settings Dialog */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        baseUrl={baseUrl}
        onSaveBaseUrl={(url) => {
          setBaseUrl(url);
          refreshHealth();
        }}
        isDemoMode={isDemoMode}
        onToggleDemoMode={(val) => {
          setIsDemoMode(val);
          if (val) setHealthStatus('connected');
          else refreshHealth();
        }}
        onRefreshHealth={refreshHealth}
      />
    </div>
  );
};