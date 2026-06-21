// Client API per le sessioni d'esame. Stessa struttura di degree-courses.api.ts:
// costruito sopra utils.api (URL + header autenticati + gestione errori), con i
// tipi importati DAL BACKEND (@server/exam-planning) tramite `import type`.
//
// NB: a differenza dei corsi di laurea NON c'è un endpoint /mine: anche il
// DOCENTE legge TUTTE le sessioni (in sola lettura). Solo la SEGRETERIA scrive.
import { API_URL, getAuthHeaders, handleApiError } from '../shared/utils.api';
import type {
  ExamSessionListItem,
  CreateExamSessionDto,
  UpdateExamSessionDto,
} from '@server/exam-planning';

const RESOURCE = `${API_URL}/exam-sessions`;

/** Tutte le sessioni (entrambi i ruoli le leggono). */
export async function fetchExamSessions(): Promise<ExamSessionListItem[]> {
  const response = await fetch(RESOURCE, { headers: getAuthHeaders() });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Una singola sessione per id (usata per precompilare il form di modifica). */
export async function fetchExamSessionById(
  id: number
): Promise<ExamSessionListItem> {
  const response = await fetch(`${RESOURCE}/${id}`, { headers: getAuthHeaders() });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Crea una sessione (SEGRETERIA). */
export async function createExamSession(
  dto: CreateExamSessionDto
): Promise<ExamSessionListItem> {
  const response = await fetch(RESOURCE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Aggiorna una sessione (SEGRETERIA). */
export async function updateExamSession(
  id: number,
  dto: UpdateExamSessionDto
): Promise<ExamSessionListItem> {
  const response = await fetch(`${RESOURCE}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Elimina una sessione (SEGRETERIA). Il backend risponde 204 (nessun corpo). */
export async function deleteExamSession(id: number): Promise<void> {
  const response = await fetch(`${RESOURCE}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) await handleApiError(response);
}
