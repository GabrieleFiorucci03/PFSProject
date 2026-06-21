import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { UpdateTeacherDto } from '@server/exam-planning';
import { fetchTeacherById, updateTeacher } from './teachers.api';

/** Regole della password, mostrate come aiuto e validate dal backend. */
const PASSWORD_HINT =
  'Almeno 8 caratteri, una lettera maiuscola e un simbolo tra ? ^ ! # @';

/**
 * Form di modifica di un docente (solo SEGRETERIA). Precompila nome ed email.
 * La password è opzionale: se lasciata vuota NON viene inviata (resta quella
 * attuale); se compilata, deve rispettare le regole (validate dal backend).
 */
export function EditTeacherPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const teacherId = Number(id);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTeacherById(teacherId)
      .then((teacher) => {
        setName(teacher.name);
        setEmail(teacher.email);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Docente non trovato')
      )
      .finally(() => setLoading(false));
  }, [teacherId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    // La password va inviata solo se l'utente l'ha digitata: una stringa vuota
    // non passerebbe la validazione "min 8 caratteri" del backend.
    const dto: UpdateTeacherDto = { name, email };
    if (password) dto.password = password;
    try {
      await updateTeacher(teacherId, dto);
      navigate('/teachers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-slate-500">Caricamento...</p>;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-2xl font-bold text-slate-800">Modifica docente</h1>

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
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Nuova password{' '}
            <span className="font-normal text-slate-400">(opzionale)</span>
          </label>
          <input
            id="password"
            type="password"
            className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Lascia vuoto per non cambiarla"
          />
          <p className="text-xs text-slate-500">{PASSWORD_HINT}</p>
        </div>

        {error && (
          <p className="whitespace-pre-line rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/teachers')}
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

export default EditTeacherPage;
