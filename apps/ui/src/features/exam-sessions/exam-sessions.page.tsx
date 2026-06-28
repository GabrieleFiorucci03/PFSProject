import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ExamSessionListItem } from '@server/exam-planning';
import { getCurrentUser } from '../auth/auth.api';
import { fetchExamSessions, deleteExamSession } from './exam-sessions.api';

/** Data odierna come stringa ISO 'YYYY-MM-DD', per confronti lessicografici. */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Mostra una data ISO 'YYYY-MM-DD' nel formato italiano gg/mm/aaaa. */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

type SessionGroup = {
  key: string;
  title: string;
  description: string;
  items: ExamSessionListItem[];
};

/**
 * Suddivide le sessioni in tre gruppi rispetto a oggi:
 * - in corso  : startDate <= oggi <= endDate
 * - pianificate (future): startDate > oggi
 * - passate   : endDate < oggi
 * Il confronto è fatto tra stringhe ISO (ordinabili lessicograficamente).
 */
function groupSessions(sessions: ExamSessionListItem[]): SessionGroup[] {
  const today = todayIso();
  const inCorso: ExamSessionListItem[] = [];
  const pianificate: ExamSessionListItem[] = [];
  const passate: ExamSessionListItem[] = [];

  for (const s of sessions) {
    if (s.endDate < today) passate.push(s);
    else if (s.startDate > today) pianificate.push(s);
    else inCorso.push(s);
  }

  // In corso e future: prima quelle che iniziano prima. Passate: più recenti in cima.
  inCorso.sort((a, b) => a.startDate.localeCompare(b.startDate));
  pianificate.sort((a, b) => a.startDate.localeCompare(b.startDate));
  passate.sort((a, b) => b.endDate.localeCompare(a.endDate));

  return [
    { key: 'in-corso', title: 'In corso', description: 'Sessioni attualmente aperte', items: inCorso },
    { key: 'pianificate', title: 'Pianificate', description: 'Sessioni future', items: pianificate },
    { key: 'passate', title: 'Passate', description: 'Sessioni concluse', items: passate },
  ];
}

/**
 * Lista delle sessioni d'esame, raggruppate in In corso / Pianificate / Passate.
 * - SEGRETERIA: può creare/modificare/eliminare.
 * - DOCENTE: sola lettura (legge comunque tutte le sessioni).
 */
export function ExamSessionsPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isSegreteria = user?.role === 'SEGRETERIA';

  const [items, setItems] = useState<ExamSessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExamSessions()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'Errore'))
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => groupSessions(items), [items]);

  async function handleDelete(session: ExamSessionListItem) {
    if (!window.confirm(`Eliminare la sessione "${session.name}"?`)) return;
    try {
      await deleteExamSession(session.id);
      setItems((prev) => prev.filter((s) => s.id !== session.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Errore durante l'eliminazione");
    }
  }

  if (loading) return <p className="text-slate-500">Caricamento...</p>;
  if (error)
    return <p className="rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</p>;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Sessioni d'esame</h1>
        {isSegreteria && (
          <button
            type="button"
            onClick={() => navigate('/exam-sessions/new')}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            + Nuova sessione
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg bg-white p-6 text-slate-500 shadow">
          Nessuna sessione d'esame da mostrare.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {groups
            .filter((group) => group.items.length > 0)
            .map((group) => (
              <section key={group.key}>
                <div className="mb-2">
                  <h2 className="text-lg font-semibold text-slate-700">
                    {group.title}
                  </h2>
                  <p className="text-sm text-slate-500">{group.description}</p>
                </div>
                <div className="overflow-x-auto rounded-xl bg-white shadow">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Nome</th>
                        <th className="px-4 py-3 font-semibold">Sessione</th>
                        <th className="px-4 py-3 font-semibold">
                          Pianificazione appelli
                        </th>
                        {isSegreteria && (
                          <th className="px-4 py-3 text-right font-semibold">
                            Azioni
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {group.items.map((session) => (
                        <tr key={session.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-800">
                            {session.name}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {formatDate(session.startDate)} –{' '}
                            {formatDate(session.endDate)}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {formatDate(session.planningStartDate)} –{' '}
                            {formatDate(session.planningEndDate)}
                          </td>
                          {isSegreteria && (
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(`/exam-sessions/${session.id}/edit`)
                                  }
                                  className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                                >
                                  Modifica
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(session)}
                                  className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-red-700"
                                >
                                  Elimina
                                </button>
                              </div>
                            </td>
                          )}
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

export default ExamSessionsPage;
