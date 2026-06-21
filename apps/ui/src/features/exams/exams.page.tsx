import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ExamListItem, ExamSessionListItem } from '@server/exam-planning';
import { getCurrentUser } from '../auth/auth.api';
import { fetchExams, fetchMyExams, deleteExam } from './exams.api';
import { fetchExamSessions } from '../exam-sessions/exam-sessions.api';
import { EXAM_TYPE_LABELS, ROOM_TYPE_LABELS, formatHour } from './exams.labels';

/** Formatta una data ISO 'YYYY-MM-DD' come 'GG/MM/AAAA' (senza fusi orari). */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

type SessionGroup = {
  id: number;
  name: string;
  startDate: string; // chiave di ordinamento; '' se la sessione non è nota
  exams: ExamListItem[];
};

/**
 * Raggruppa gli esami per sessione. Le sessioni sono ordinate per data di inizio
 * DECRESCENTE (prima le più avanti nel tempo/future, ultime le passate); dentro
 * ogni sessione gli esami sono in ordine di data crescente (cronologico).
 * Le date delle sessioni arrivano dall'elenco sessioni (l'ExamListItem espone
 * solo {id, name}); se una sessione non è nota si usa il nome dell'esame.
 */
function groupBySession(
  exams: ExamListItem[],
  sessions: ExamSessionListItem[]
): SessionGroup[] {
  const sessionById = new Map(sessions.map((s) => [s.id, s]));
  const groups = new Map<number, SessionGroup>();

  for (const exam of exams) {
    const sid = exam.examSession.id;
    let group = groups.get(sid);
    if (!group) {
      const session = sessionById.get(sid);
      group = {
        id: sid,
        name: session?.name ?? exam.examSession.name,
        startDate: session?.startDate ?? '',
        exams: [],
      };
      groups.set(sid, group);
    }
    group.exams.push(exam);
  }

  const result = [...groups.values()];
  result.sort((a, b) => b.startDate.localeCompare(a.startDate)); // future prima
  for (const group of result) {
    group.exams.sort((a, b) => a.date.localeCompare(b.date)); // cronologico
  }
  return result;
}

/**
 * Lista degli esami (appelli) raggruppati per sessione, con divisione dei ruoli:
 * - SEGRETERIA: vede TUTTI gli esami, può modificare/eliminare ma NON creare.
 * - DOCENTE: vede solo i propri (/mine), può creare/modificare/eliminare i propri.
 */
export function ExamsPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isSegreteria = user?.role === 'SEGRETERIA';

  const [items, setItems] = useState<ExamListItem[]>([]);
  const [sessions, setSessions] = useState<ExamSessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carica esami (lista giusta in base al ruolo) e sessioni (per le date/ordine).
  useEffect(() => {
    const loadExams = isSegreteria ? fetchExams : fetchMyExams;
    Promise.all([loadExams(), fetchExamSessions()])
      .then(([exams, allSessions]) => {
        setItems(exams);
        setSessions(allSessions);
      })
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

  const groups = groupBySession(items, sessions);

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

      {groups.length === 0 ? (
        <p className="rounded-lg bg-white p-6 text-slate-500 shadow">
          Nessun esame da mostrare.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.id}>
              <h2 className="mb-2 text-lg font-semibold text-slate-700">
                {group.name}
              </h2>
              <div className="overflow-hidden rounded-xl bg-white shadow">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Data</th>
                      <th className="px-4 py-3 font-semibold">Orario</th>
                      <th className="px-4 py-3 font-semibold">Materia</th>
                      {isSegreteria && (
                        <th className="px-4 py-3 font-semibold">Docente</th>
                      )}
                      <th className="px-4 py-3 font-semibold">Tipo</th>
                      <th className="px-4 py-3 font-semibold">Aula</th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {group.exams.map((exam) => (
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
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExamsPage;
