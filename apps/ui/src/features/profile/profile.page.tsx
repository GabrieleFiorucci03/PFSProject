import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../auth/auth.api';
import {
  fetchMySecretariat,
  updateSecretariat,
  deleteSecretariat,
} from '../secretariats/secretariats.api';
import {
  fetchMyTeacher,
  updateTeacher,
  deleteTeacher,
} from '../teachers/teachers.api';

/** Regole della password, mostrate come aiuto e validate dal backend. */
const PASSWORD_HINT =
  'Almeno 8 caratteri, una lettera maiuscola e un simbolo tra ? ^ ! # @';

/**
 * Area personale dell'utente loggato (rotta /me), raggiungibile cliccando sul
 * proprio nome in navbar. È la STESSA sezione che la SEGRETERIA raggiunge
 * cliccando "Modifica" sulla propria riga in /secretariats: qui ognuno modifica
 * SOLO il proprio profilo (regola self-only del backend).
 *
 * Funziona per entrambi i ruoli leggendo da /secretariats/me oppure /teachers/me
 * a seconda del ruolo. L'email NON è modificabile in self-edit per nessuno dei
 * due (il backend la rifiuta): la mostriamo in sola lettura e non la inviamo.
 * La password è opzionale: se vuota non viene inviata (resta quella attuale).
 */
export function ProfilePage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isSegreteria = user?.role === 'SEGRETERIA';

  // L'id del profilo (secretariatId/teacherId) lo ricaviamo da /me: il JWT
  // contiene l'id utente, non quello del profilo.
  const [profileId, setProfileId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadProfile = isSegreteria ? fetchMySecretariat : fetchMyTeacher;
    loadProfile()
      .then((profile) => {
        setProfileId(profile.id);
        setName(profile.name);
        setEmail(profile.email);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Profilo non trovato')
      )
      .finally(() => setLoading(false));
  }, [isSegreteria]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (profileId === null) return;
    setError(null);
    setSuccess(false);
    setSaving(true);
    // L'email non si può cambiare in self-edit: non la inviamo. La password va
    // inviata solo se digitata (una vuota fallirebbe "min 8 caratteri").
    const dto: { name: string; password?: string } = { name };
    if (password) dto.password = password;
    try {
      if (isSegreteria) {
        await updateSecretariat(profileId, dto);
      } else {
        await updateTeacher(profileId, dto);
      }
      // Aggiorna l'utente salvato così la navbar mostra subito il nuovo nome.
      if (user) {
        localStorage.setItem('current_user', JSON.stringify({ ...user, name }));
      }
      setPassword('');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (profileId === null) return;
    if (
      !window.confirm(
        'Eliminare il tuo account? L’operazione è irreversibile.'
      )
    )
      return;
    try {
      if (isSegreteria) {
        await deleteSecretariat(profileId);
      } else {
        await deleteTeacher(profileId);
      }
      // Account eliminato: la sessione non è più valida, vai al logout.
      navigate('/logout');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante l'eliminazione");
    }
  }

  if (loading) return <p className="text-slate-500">Caricamento...</p>;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-2xl font-bold text-slate-800">Area personale</h1>

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
        {success && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            Profilo aggiornato.
          </p>
        )}

        <div className="mt-2 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
          >
            Elimina account
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Indietro
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Salvataggio...' : 'Salva modifiche'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ProfilePage;
