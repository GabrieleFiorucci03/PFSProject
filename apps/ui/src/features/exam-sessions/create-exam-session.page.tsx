import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExamSession } from './exam-sessions.api';

/**
 * Form di creazione di una sessione d'esame (solo SEGRETERIA).
 * Campi: name + 4 date (sessione e finestra di pianificazione appelli).
 * Le regole sull'ordine delle date sono validate dal backend, che ne restituisce
 * i messaggi d'errore in italiano (mostrati qui sotto al form).
 */
export function CreateExamSessionPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [planningStartDate, setPlanningStartDate] = useState('');
  const [planningEndDate, setPlanningEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createExamSession({
        name,
        startDate,
        endDate,
        planningStartDate,
        planningEndDate,
      });
      navigate('/exam-sessions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-2xl font-bold text-slate-800">
        Nuova sessione d'esame
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
            placeholder="Es. Giugno 2026"
            required
          />
        </div>

        <fieldset className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3">
          <legend className="px-1 text-sm font-medium text-slate-600">
            Periodo della sessione
          </legend>
          <div className="flex flex-col gap-1">
            <label htmlFor="startDate" className="text-sm font-medium text-slate-700">
              Inizio sessione
            </label>
            <input
              id="startDate"
              type="date"
              className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="endDate" className="text-sm font-medium text-slate-700">
              Fine sessione
            </label>
            <input
              id="endDate"
              type="date"
              className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3">
          <legend className="px-1 text-sm font-medium text-slate-600">
            Finestra di pianificazione appelli
          </legend>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="planningStartDate"
              className="text-sm font-medium text-slate-700"
            >
              Inizio pianificazione
            </label>
            <input
              id="planningStartDate"
              type="date"
              className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={planningStartDate}
              onChange={(e) => setPlanningStartDate(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="planningEndDate"
              className="text-sm font-medium text-slate-700"
            >
              Fine pianificazione
            </label>
            <input
              id="planningEndDate"
              type="date"
              className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={planningEndDate}
              onChange={(e) => setPlanningEndDate(e.target.value)}
              required
            />
          </div>
        </fieldset>

        {error && (
          <p className="whitespace-pre-line rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/exam-sessions')}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Salvataggio...' : 'Crea sessione'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateExamSessionPage;
