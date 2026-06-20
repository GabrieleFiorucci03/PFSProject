import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchDegreeCourseById, updateDegreeCourse } from './degree-courses.api';

/**
 * Form di modifica di un corso di laurea (solo SEGRETERIA).
 * Come la creazione, ma precompila i campi leggendo il corso dall'id in URL.
 */
export function EditDegreeCoursePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);

  const [name, setName] = useState('');
  const [yearsDuration, setYearsDuration] = useState(3);
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Precompila il form leggendo il corso corrente.
  useEffect(() => {
    fetchDegreeCourseById(courseId)
      .then((course) => {
        setName(course.name);
        setYearsDuration(course.yearsDuration);
        setDepartment(course.department);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Corso non trovato')
      )
      .finally(() => setLoading(false));
  }, [courseId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateDegreeCourse(courseId, { name, yearsDuration, department });
      navigate('/degree-courses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-slate-500">Caricamento...</p>;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-2xl font-bold text-slate-800">
        Modifica corso di laurea
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium text-slate-700">
            Nome
          </label>
          <input
            id="name"
            className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="yearsDuration"
            className="text-sm font-medium text-slate-700"
          >
            Durata (anni)
          </label>
          <input
            id="yearsDuration"
            type="number"
            min={1}
            max={6}
            className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={yearsDuration}
            onChange={(e) => setYearsDuration(Number(e.target.value))}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="department"
            className="text-sm font-medium text-slate-700"
          >
            Dipartimento
          </label>
          <input
            id="department"
            className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="whitespace-pre-line rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/degree-courses')}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Salvataggio...' : 'Salva modifiche'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditDegreeCoursePage;
