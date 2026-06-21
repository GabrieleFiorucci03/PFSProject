import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ExamListItem } from '@server/exam-planning';
import { getCurrentUser } from '../auth/auth.api';
import { fetchExams, fetchMyExams, deleteExam } from './exams.api';
import { EXAM_TYPE_LABELS, ROOM_TYPE_LABELS, formatHour } from './exams.labels';

/** Formatta una data ISO 'YYYY-MM-DD' come 'GG/MM/AAAA' (senza fusi orari). */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Lista degli esami (appelli) con divisione dei ruoli:
 * - SEGRETERIA: vede TUTTI gli esami, può modificare/eliminare ma NON creare.
 * - DOCENTE: vede solo i propri (/mine), può creare/modificare/eliminare i propri.
 */
export function ExamsPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isSegreteria = user?.role === 'SEGRETERIA';

  const [items, setItems] = useState<ExamListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carica la lista giusta in base al ruolo, una volta al montaggio.
  useEffect(() => {
    const load = isSegreteria ? fetchExams : fetchMyExams;
    load()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'Errore'))
      .finally(() => setLoading(false));
  }, [isSegreteria]);

  async function handleDelete(exam: ExamListItem) {
    if (
      !window.confirm(
        `Eliminare l'esame di "${exam.subject.name}" del ${formatDate(exam.date)}?`
      )
    )
      return;
    try {
      await deleteExam(exam.id);
      // Aggiornamento ottimistico: tolgo la riga senza rifare la fetch.
      setItems((prev) => prev.filter((e) => e.id !== exam.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Errore durante l'eliminazione");
    }
  }

  if (loading) return <p className="text-slate-500">Caricamento...</p>;
  if (error)
    return (
      <p className="rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</p>
    );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Esami</h1>
          {!isSegreteria && (
            <p className="text-sm text-slate-500">I tuoi appelli</p>
          )}
        </div>
        {/* Solo il DOCENTE crea esami (vincolo backend). */}
        {!isSegreteria && (
          <button
            type="button"
            onClick={() => navigate('/exams/new')}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            + Nuovo esame
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg bg-white p-6 text-slate-500 shadow">
          Nessun esame da mostrare.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Orario</th>
                <th className="px-4 py-3 font-semibold">Materia</th>
                <th className="px-4 py-3 font-semibold">Sessione</th>
                {isSegreteria && (
                  <th className="px-4 py-3 font-semibold">Docente</th>
                )}
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Aula</th>
                <th className="px-4 py-3 text-right font-semibold">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((exam) => (
                <tr key={exam.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-800">
                    {formatDate(exam.date)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatHour(exam.startHour)}–{formatHour(exam.endHour)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {exam.subject.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {exam.examSession.name}
                  </td>
                  {isSegreteria && (
                    <td className="px-4 py-3 text-slate-600">
                      {exam.teacher.name}
                    </td>
                  )}
                  <td className="px-4 py-3 text-slate-600">
                    {EXAM_TYPE_LABELS[exam.type]}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {ROOM_TYPE_LABELS[exam.roomType]}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/exams/${exam.id}/edit`)}
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Modifica
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(exam)}
                        className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-red-700"
                      >
                        Elimina
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ExamsPage;
