import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { UpdateSecretariatDto } from '@server/exam-planning';
import { fetchSecretariatById, updateSecretariat } from './secretariats.api';

/** Regole della password, mostrate come aiuto e validate dal backend. */
const PASSWORD_HINT =
  'Almeno 8 caratteri, una lettera maiuscola e un simbolo tra ? ^ ! # @';

/**
 * Form di modifica del PROPRIO profilo segretario (self-only lato backend).
 * L'email NON è modificabile (il backend rifiuta dto.email): la mostriamo in
 * sola lettura e non la inviamo. La password è opzionale: se vuota non viene
 * inviata (resta quella attuale).
 */
export function EditSecretariatPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const secretariatId = Number(id);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSecretariatById(secretariatId)
      .then((secretariat) => {
        setName(secretariat.name);
        setEmail(secretariat.email);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Segretario non trovato')
      )
      .finally(() => setLoading(false));
  }, [secretariatId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    // L'email non si può cambiare (il backend la rifiuta): non la inviamo.
    // La password va inviata solo se digitata (una vuota fallirebbe "min 8").
    const dto: UpdateSecretariatDto = { name };
    if (password) dto.password = password;
    try {
      await updateSecretariat(secretariatId, dto);
      navigate('/secretariats');
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
        Modifica profilo
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
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email{' '}
            <span className="font-normal text-slate-400">(non modificabile)</span>
          </label>
          <input
            id="email"
            type="email"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500"
            value={email}
            disabled
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
            onClick={() => navigate('/secretariats')}
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

export default EditSecretariatPage;
