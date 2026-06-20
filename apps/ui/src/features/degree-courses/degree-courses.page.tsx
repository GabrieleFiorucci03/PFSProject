import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DegreeCourseListItem } from '@server/exam-planning';
import { getCurrentUser } from '../auth/auth.api';
import {
  fetchDegreeCourses,
  fetchMyDegreeCourses,
  deleteDegreeCourse,
} from './degree-courses.api';

/**
 * Lista dei corsi di laurea con divisione dei ruoli:
 * - SEGRETERIA: vede tutti i corsi e può creare/modificare/eliminare.
 * - DOCENTE: vede in sola lettura solo i corsi a lui assegnati (/mine).
 */
export function DegreeCoursesPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isSegreteria = user?.role === 'SEGRETERIA';

  const [items, setItems] = useState<DegreeCourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carica la lista giusta in base al ruolo, una volta al montaggio.
  useEffect(() => {
    const load = isSegreteria ? fetchDegreeCourses : fetchMyDegreeCourses;
    load()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'Errore'))
      .finally(() => setLoading(false));
  }, [isSegreteria]);

  async function handleDelete(course: DegreeCourseListItem) {
    if (!window.confirm(`Eliminare il corso "${course.name}"?`)) return;
    try {
      await deleteDegreeCourse(course.id);
      // Aggiornamento ottimistico: tolgo la riga senza rifare la fetch.
      setItems((prev) => prev.filter((c) => c.id !== course.id));
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
          <h1 className="text-2xl font-bold text-slate-800">Corsi di laurea</h1>
          {!isSegreteria && (
            <p className="text-sm text-slate-500">I corsi a te assegnati</p>
          )}
        </div>
        {isSegreteria && (
          <button
            type="button"
            onClick={() => navigate('/degree-courses/new')}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            + Nuovo corso
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg bg-white p-6 text-slate-500 shadow">
          Nessun corso di laurea da mostrare.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Durata (anni)</th>
                <th className="px-4 py-3 font-semibold">Dipartimento</th>
                {isSegreteria && (
                  <th className="px-4 py-3 text-right font-semibold">Azioni</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-800">{course.name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {course.yearsDuration}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {course.department}
                  </td>
                  {isSegreteria && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/degree-courses/${course.id}/edit`)
                          }
                          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Modifica
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(course)}
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
      )}
    </div>
  );
}

export default DegreeCoursesPage;
