export interface Proof {
  doc_name: string;
  page: number;
  extrait: string;
  verifiee: boolean;
}

export interface SourceDocument {
  rang: number;
  doc_name: string;
  company: string;
  year: number;
  doc_type: string;
  page: number;
  score: number;
  texte: string;
}

export interface ChatResponse {
  question: string;
  answer: string;
  entreprises: string[];
  annees: number[];
  preuves: Proof[];
  expression_calcul: string | null;
  resultat_calcul: number | null;
  avertissements: string[];
  sources: SourceDocument[];
}

export interface ChatFilters {
  entreprise?: string;
  annee?: number;
}

export interface ChatRequestPayload {
  question: string;
  entreprise: string | null;
  annee: number | null;
}

export type HealthStatus = 'connected' | 'error' | 'unknown';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  filters?: ChatFilters;
  response?: ChatResponse;
  isLoading?: boolean;
  error?: string;
}

export interface SessionQuestion {
  id: string;
  question: string;
  timestamp: number;
  messageId: string;
}