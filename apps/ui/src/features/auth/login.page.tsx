import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './auth.api';

/**
 * Pagina di login: form controllato con email/password.
 * Al successo salva token+utente (in auth.api) e reindirizza alla home (/exams).
 * Gli errori vengono dal backend tramite handleApiError (messaggi in italiano).
 */
export function LoginPage() {
  // Stato del form: i campi sono "controllati" (il valore vive nello state React).
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // evita il reload di pagina del submit nativo
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/exams', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore di accesso');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-1 text-center text-2xl font-bold text-slate-800">
          Pianificazione Appelli
        </h1>
        <p className="mb-6 text-center text-sm text-slate-500">
          Accedi con le tue credenziali
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome.cognome@unibs.it"
              autoComplete="username"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Inserisci la password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        {error && (
          <p className="mt-4 whitespace-pre-line rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}

export default LoginPage;
