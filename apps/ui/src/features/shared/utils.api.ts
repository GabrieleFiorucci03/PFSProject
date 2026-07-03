// Infrastruttura HTTP condivisa da tutte le chiamate API del frontend.
// Centralizza l'URL del backend, gli header autenticati e la gestione errori,
// così ogni *.api.ts di entità li riusa senza duplicarli.

export const API_URL = 'http://localhost:3333/api';

/**
 * Header standard per le chiamate protette: JSON + token JWT (se presente)
 * letto da localStorage. Il token viene salvato al login da auth.api.ts.
 */
export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Trasforma una risposta HTTP non-ok in un Error con messaggio in italiano.
 * Il backend NestJS restituisce { message: string | string[], ... }:
 * - stringa singola → la usa così com'è
 * - array (errori di class-validator) → li unisce su più righe
 * Va chiamata SOLO quando `response.ok` è false; lancia sempre.
 */
export async function handleApiError(response: Response): Promise<never> {
  // 401 su una rotta protetta = token mancante o scaduto (il JWT dura 24h):
  // pulisce la sessione salvata e riporta al login, invece di lasciare l'utente
  // "loggato" davanti a errori generici. Il login è escluso: lì il 401 significa
  // "credenziali errate" e va mostrato nel form, non trasformato in redirect.
  // (Chiavi localStorage scritte da auth.api.ts: non si importa logout() da lì
  // per non creare un import circolare auth.api <-> utils.api.)
  if (response.status === 401 && !response.url.endsWith('/auth/login')) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    window.location.assign('/login');
  }

  let message = `Errore ${response.status}`;
  try {
    const body = await response.json();
    if (Array.isArray(body?.message)) {
      message = body.message.join('\n');
    } else if (typeof body?.message === 'string') {
      message = body.message;
    }
  } catch {
    // corpo non-JSON o vuoto: si tiene il messaggio di default
  }
  throw new Error(message);
}
