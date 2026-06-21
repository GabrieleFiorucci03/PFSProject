// Client API per gli insegnamenti (subjects). Stessa struttura degli altri
// *.api.ts (URL + header autenticati + gestione errori). I tipi arrivano dal
// backend con `import type` per non duplicarli né trascinare i decoratori nel
// bundle del browser.
import { API_URL, getAuthHeaders, handleApiError } from '../shared/utils.api';
import type {
  SubjectListItem,
  CreateSubjectDto,
  UpdateSubjectDto,
} from '@server/exam-planning';

const RESOURCE = `${API_URL}/subjects`;

/** Tutti gli insegnamenti (uso SEGRETERIA). */
export async function fetchSubjects(): Promise<SubjectListItem[]> {
  const response = await fetch(RESOURCE, { headers: getAuthHeaders() });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Solo gli insegnamenti del docente corrente (uso DOCENTE). */
export async function fetchMySubjects(): Promise<SubjectListItem[]> {
  const response = await fetch(`${RESOURCE}/mine`, { headers: getAuthHeaders() });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Un singolo insegnamento per id (usato per precompilare il form di modifica). */
export async function fetchSubjectById(id: number): Promise<SubjectListItem> {
  const response = await fetch(`${RESOURCE}/${id}`, { headers: getAuthHeaders() });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Crea un insegnamento (SEGRETERIA). */
export async function createSubject(
  dto: CreateSubjectDto
): Promise<SubjectListItem> {
  const response = await fetch(RESOURCE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Aggiorna un insegnamento (SEGRETERIA). */
export async function updateSubject(
  id: number,
  dto: UpdateSubjectDto
): Promise<SubjectListItem> {
  const response = await fetch(`${RESOURCE}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Elimina un insegnamento (SEGRETERIA). Il backend risponde 204 (nessun corpo). */
export async function deleteSubject(id: number): Promise<void> {
  const response = await fetch(`${RESOURCE}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) await handleApiError(response);
}
