// Chiamate di autenticazione + utilità sul "current user".
// Il backend espone:
//   POST /auth/login -> { access_token, user: { id, name, email, role } }
//   GET  /users/me   -> { id, name, email, role }  (dal payload JWT)
import { API_URL, getAuthHeaders, handleApiError } from '../shared/utils.api';

export type UserRole = 'DOCENTE' | 'SEGRETERIA';

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

/**
 * Esegue il login: salva token e utente in localStorage e ritorna l'utente.
 * In caso di credenziali errate il backend risponde 401 -> handleApiError.
 */
export async function login(
  email: string,
  password: string
): Promise<CurrentUser> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const data: { access_token: string; user: CurrentUser } =
    await response.json();

  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('current_user', JSON.stringify(data.user));

  return data.user;
}

/** Rimuove token e utente: usata dalla pagina di logout. */
export function logout(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('current_user');
}

/** Legge l'utente salvato al login (sincrono, niente rete). null se assente. */
export function getCurrentUser(): CurrentUser | null {
  const raw = localStorage.getItem('current_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}

/** Rilegge l'utente corrente dal backend (GET /users/me) col token salvato. */
export async function fetchCurrentUser(): Promise<CurrentUser> {
  const response = await fetch(`${API_URL}/users/me`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}
