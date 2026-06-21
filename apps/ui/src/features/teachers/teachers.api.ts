// Client API per i docenti. Stessa struttura degli altri *.api.ts.
// Nota: creare un docente crea anche il suo account utente (lato backend), per
// questo il CreateTeacherDto include la password.
import { API_URL, getAuthHeaders, handleApiError } from '../shared/utils.api';
import type {
  TeacherListItem,
  CreateTeacherDto,
  UpdateTeacherDto,
} from '@server/exam-planning';

const RESOURCE = `${API_URL}/teachers`;

/** Tutti i docenti (solo SEGRETERIA). */
export async function fetchTeachers(): Promise<TeacherListItem[]> {
  const response = await fetch(RESOURCE, { headers: getAuthHeaders() });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Un singolo docente per id (usato per precompilare il form di modifica). */
export async function fetchTeacherById(id: number): Promise<TeacherListItem> {
  const response = await fetch(`${RESOURCE}/${id}`, { headers: getAuthHeaders() });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Crea un docente + il suo account (SEGRETERIA). */
export async function createTeacher(
  dto: CreateTeacherDto
): Promise<TeacherListItem> {
  const response = await fetch(RESOURCE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Aggiorna un docente (SEGRETERIA). I campi sono tutti opzionali. */
export async function updateTeacher(
  id: number,
  dto: UpdateTeacherDto
): Promise<TeacherListItem> {
  const response = await fetch(`${RESOURCE}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Elimina un docente (SEGRETERIA). Il backend risponde 204 (nessun corpo). */
export async function deleteTeacher(id: number): Promise<void> {
  const response = await fetch(`${RESOURCE}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) await handleApiError(response);
}
