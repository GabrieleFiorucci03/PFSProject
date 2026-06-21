// Client API per gli esami (appelli). Stessa struttura degli altri *.api.ts.
// Particolarità dei ruoli (imposte dal backend):
// - GET /exams (tutti) è SEGRETERIA-only; il DOCENTE usa GET /exams/mine.
// - POST /exams è DOCENTE-only (la SEGRETERIA non crea esami).
// - PATCH/DELETE: SEGRETERIA su qualsiasi esame, DOCENTE solo sui propri.
import { API_URL, getAuthHeaders, handleApiError } from '../shared/utils.api';
import type {
  ExamListItem,
  CreateExamDto,
  UpdateExamDto,
} from '@server/exam-planning';

const RESOURCE = `${API_URL}/exams`;

/** Tutti gli esami (uso SEGRETERIA). */
export async function fetchExams(): Promise<ExamListItem[]> {
  const response = await fetch(RESOURCE, { headers: getAuthHeaders() });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Solo gli esami del docente corrente (uso DOCENTE). */
export async function fetchMyExams(): Promise<ExamListItem[]> {
  const response = await fetch(`${RESOURCE}/mine`, { headers: getAuthHeaders() });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Un singolo esame per id (usato per precompilare il form di modifica). */
export async function fetchExamById(id: number): Promise<ExamListItem> {
  const response = await fetch(`${RESOURCE}/${id}`, { headers: getAuthHeaders() });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Crea un esame (DOCENTE). Il docente viene forzato dal backend al titolare. */
export async function createExam(dto: CreateExamDto): Promise<ExamListItem> {
  const response = await fetch(RESOURCE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Aggiorna un esame (SEGRETERIA su qualsiasi, DOCENTE sui propri). */
export async function updateExam(
  id: number,
  dto: UpdateExamDto
): Promise<ExamListItem> {
  const response = await fetch(`${RESOURCE}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Elimina un esame (SEGRETERIA su qualsiasi, DOCENTE sui propri). 204 senza corpo. */
export async function deleteExam(id: number): Promise<void> {
  const response = await fetch(`${RESOURCE}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) await handleApiError(response);
}
