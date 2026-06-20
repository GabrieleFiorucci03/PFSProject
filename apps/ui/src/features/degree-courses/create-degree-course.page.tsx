import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDegreeCourse } from './degree-courses.api';

/**
 * Form di creazione di un corso di laurea (solo SEGRETERIA).
 * Campi: name (obbligatorio), yearsDuration (1-6, default 3), department.
 */
export function CreateDegreeCoursePage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [yearsDuration, setYearsDuration] = useState(3);
  const [department, setDepartment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createDegreeCourse({ name, yearsDuration, department });
      navigate('/degree-courses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-2xl font-bold text-slate-800">Nuovo corso di laurea</h1>

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
            placeholder="Es. Ingegneria Informatica"
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
            placeholder="Es. Dipartimento di Ingegneria dell'Informazione"
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
            {saving ? 'Salvataggio...' : 'Crea corso'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateDegreeCoursePage;
