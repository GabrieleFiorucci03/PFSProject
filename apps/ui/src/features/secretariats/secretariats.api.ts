// Client API per i segretari. Stessa struttura di teachers.api.ts: creare un
// segretario crea anche il suo account utente (ruolo forzato SEGRETERIA lato
// backend), per questo il CreateSecretariatDto include la password.
// Tutti gli endpoint sono SEGRETERIA-only; update/delete sono inoltre SELF-ONLY
// (un segretario può modificare/eliminare solo il proprio account).
import { API_URL, getAuthHeaders, handleApiError } from '../shared/utils.api';
import type {
  SecretariatListItem,
  CreateSecretariatDto,
  UpdateSecretariatDto,
} from '@server/exam-planning';

const RESOURCE = `${API_URL}/secretariats`;

/** Tutti i segretari (SEGRETERIA). */
export async function fetchSecretariats(): Promise<SecretariatListItem[]> {
  const response = await fetch(RESOURCE, { headers: getAuthHeaders() });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Il proprio profilo segretario (per l'area personale). */
export async function fetchMySecretariat(): Promise<SecretariatListItem> {
  const response = await fetch(`${RESOURCE}/me`, { headers: getAuthHeaders() });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Un singolo segretario per id (usato per precompilare il form di modifica). */
export async function fetchSecretariatById(
  id: number
): Promise<SecretariatListItem> {
  const response = await fetch(`${RESOURCE}/${id}`, { headers: getAuthHeaders() });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Crea un segretario + il suo account (SEGRETERIA). */
export async function createSecretariat(
  dto: CreateSecretariatDto
): Promise<SecretariatListItem> {
  const response = await fetch(RESOURCE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Aggiorna un segretario (solo il proprio, self-only lato backend). */
export async function updateSecretariat(
  id: number,
  dto: UpdateSecretariatDto
): Promise<SecretariatListItem> {
  const response = await fetch(`${RESOURCE}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!response.ok) await handleApiError(response);
  return response.json();
}

/** Elimina un segretario (solo il proprio, self-only). 204 senza corpo. */
export async function deleteSecretariat(id: number): Promise<void> {
  const response = await fetch(`${RESOURCE}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) await handleApiError(response);
}
