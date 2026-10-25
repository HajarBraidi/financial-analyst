import { DEMO_RESPONSE } from './demoResponse';
import { ChatFilters, ChatRequestPayload, ChatResponse, HealthStatus } from './types';

const TIMEOUT_MS = 90_000;

export async function checkHealth(baseUrl: string): Promise<{ ok: boolean; status?: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7_000);
  try {
    const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    clearTimeout(timer);
    return { ok: res.ok, status: res.status };
  } catch {
    clearTimeout(timer);
    return { ok: false };
  }
}

export async function askQuestion(
  baseUrl: string,
  question: string,
  filters: ChatFilters,
  isDemoMode: boolean
): Promise<ChatResponse> {
  if (isDemoMode) {
    // Simulate network delay for natural feel
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Return realistic customized demo response
    return {
      ...DEMO_RESPONSE,
      question,
      entreprises: filters.entreprise ? [filters.entreprise] : DEMO_RESPONSE.entreprises,
      annees: filters.annee ? [filters.annee] : DEMO_RESPONSE.annees,
    };
  }

  const cleanUrl = baseUrl.replace(/\/+$/, '');
  const endpoint = `${cleanUrl}/api/chat`;

  const payload: ChatRequestPayload = {
    question: question.trim(),
    entreprise: filters.entreprise?.trim() || null,
    annee: filters.annee ? Number(filters.annee) : null,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let detail = '';
      try {
        const errorJson = await response.json();
        detail = errorJson.detail || '';
      } catch {
        detail = await response.text();
      }

      switch (response.status) {
        case 400:
          throw new Error(
            `Question invalide ou entreprise inconnue.${detail ? ` ${detail}` : ''}`
          );
        case 404:
          throw new Error('Aucun passage trouvé pour cette question.');
        case 429:
          throw new Error(
            "Le quota du modèle est épuisé pour aujourd'hui. Essayez le mode démo ou réessayez plus tard."
          );
        case 503:
          throw new Error(
            'Le service est temporairement surchargé. Réessayez dans un instant.'
          );
        default:
          throw new Error(detail || `Erreur serveur inattendue (code ${response.status}).`);
      }
    }

    const data: ChatResponse = await response.json();
    return data;
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Le serveur met trop de temps à répondre (délai dépassé de 90 secondes).');
    }

    if (err instanceof Error) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        throw new Error(
          `Impossible de joindre le serveur à ${cleanUrl}. Vérifiez que le backend est lancé.`
        );
      }
      throw err;
    }

    throw new Error('Une erreur réseau inconnue est survenue.');
  }
}