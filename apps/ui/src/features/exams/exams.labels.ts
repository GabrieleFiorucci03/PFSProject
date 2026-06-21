// Etichette italiane per gli enum degli esami, condivise tra lista e form.
// Le chiavi sono i valori dell'enum del backend (ExamType / RoomType).
import type { ExamType, RoomType } from '@server/exam-planning';

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  ORAL: 'Orale',
  WRITTEN: 'Scritto',
};

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  STANDARD: 'Aula standard',
  COMPUTER_LAB: 'Laboratorio informatico',
  ELECTRONICS_LAB: 'Laboratorio di elettronica',
  SENSORS_LAB: 'Laboratorio sensori',
};

/** Formatta un'ora intera (0-24) come "HH:00". */
export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}
