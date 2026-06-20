// Client API per i corsi di laurea. Costruito sopra utils.api (URL + header
// autenticati + gestione errori). I tipi sono importati DAL BACKEND
// (@server/exam-planning) con `import type`, così non si duplicano e non si
// trascina class-validator/swagger nel bundle del browser.
import { API_URL, getAuthHeaders, handleApiError } from '../shared/utils.api';
import type {
  DegreeCourseListItem,
  CreateDegreeCourseDto,
  UpdateDegreeCourseDto,
} from '@server/exam-planning';

const RESOURCE = `${API_URL}/degree-courses`;

/** Tutti i corsi (uso SEGRETERIA). */
export async function fetchDegreeCourses(): Promise<DegreeCourseListItem[]> {
  const response = await fetch(RESOURCE, { headers: getAuthHeaders() });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/**
 * Elenco dei dipartimenti esistenti (valori distinti), per i suggerimenti del
 * form. I dipartimenti non sono un'entità a sé: li ricaviamo dai corsi.
 */
export async function fetchDepartments(): Promise<string[]> {
  const courses = await fetchDegreeCourses();
  return [...new Set(courses.map((c) => c.department))].sort();
}

/** Solo i corsi assegnati al docente corrente (uso DOCENTE). */
export async function fetchMyDegreeCourses(): Promise<DegreeCourseListItem[]> {
  const response = await fetch(`${RESOURCE}/mine`, { headers: getAuthHeaders() });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Un singolo corso per id (usato per precompilare il form di modifica). */
export async function fetchDegreeCourseById(
  id: number
): Promise<DegreeCourseListItem> {
  const response = await fetch(`${RESOURCE}/${id}`, { headers: getAuthHeaders() });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Crea un corso (SEGRETERIA). */
export async function createDegreeCourse(
  dto: CreateDegreeCourseDto
): Promise<DegreeCourseListItem> {
  const response = await fetch(RESOURCE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Aggiorna un corso (SEGRETERIA). */
export async function updateDegreeCourse(
  id: number,
  dto: UpdateDegreeCourseDto
): Promise<DegreeCourseListItem> {
  const response = await fetch(`${RESOURCE}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Elimina un corso (SEGRETERIA). Il backend risponde 204 (nessun corpo). */
export async function deleteDegreeCourse(id: number): Promise<void> {
  const response = await fetch(`${RESOURCE}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) await handleApiError(response);
}
