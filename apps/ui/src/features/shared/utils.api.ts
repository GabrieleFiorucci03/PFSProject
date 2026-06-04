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
