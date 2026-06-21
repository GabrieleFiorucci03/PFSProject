import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TeacherListItem } from '@server/exam-planning';
import { getCurrentUser } from '../auth/auth.api';
import { fetchTeachers, deleteTeacher } from './teachers.api';

/**
 * Elenco dei docenti. Pagina riservata alla SEGRETERIA: vede tutti i docenti e
 * può crearli/modificarli/eliminarli. Il DOCENTE non ha questa pagina (avrà
 * l'area personale nel Passo 5): se ci arriva, mostriamo un avviso senza
 * chiamare il backend (che risponderebbe comunque 403).
 */
export function TeachersPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isSegreteria = user?.role === 'SEGRETERIA';

  const [items, setItems] = useState<TeacherListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSegreteria) {
      setLoading(false);
      return;
    }
    fetchTeachers()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'Errore'))
      .finally(() => setLoading(false));
  }, [isSegreteria]);

  async function handleDelete(teacher: TeacherListItem) {
    if (!window.confirm(`Eliminare il docente "${teacher.name}"?`)) return;
    try {
      await deleteTeacher(teacher.id);
      setItems((prev) => prev.filter((t) => t.id !== teacher.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Errore durante l'eliminazione");
    }
  }

  if (!isSegreteria)
    return (
      <p className="rounded-lg bg-white p-6 text-slate-500 shadow">
        Questa sezione è riservata alla segreteria.
      </p>
    );

  if (loading) return <p className="text-slate-500">Caricamento...</p>;
  if (error)
    return <p className="rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Docenti</h1>
        <button
          type="button"
          onClick={() => navigate('/teachers/new')}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          + Nuovo docente
        </button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg bg-white p-6 text-slate-500 shadow">
          Nessun docente da mostrare.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 text-right font-semibold">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-800">{teacher.name}</td>
                  <td className="px-4 py-3 text-slate-600">{teacher.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/teachers/${teacher.id}/edit`)}
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Modifica
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(teacher)}
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

export default TeachersPage;
