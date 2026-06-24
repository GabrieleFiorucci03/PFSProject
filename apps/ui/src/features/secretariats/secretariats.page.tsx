import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SecretariatListItem } from '@server/exam-planning';
import { getCurrentUser } from '../auth/auth.api';
import { fetchSecretariats, deleteSecretariat } from './secretariats.api';

/**
 * Elenco dei segretari. Pagina riservata alla SEGRETERIA: vede tutti i segretari
 * e può crearne di nuovi, ma può MODIFICARE/ELIMINARE solo il PROPRIO account
 * (regola self-only del backend). I bottoni azione compaiono perciò solo sulla
 * riga dell'utente loggato, riconosciuta tramite l'email (l'id del list-item è
 * il secretariatId, non l'id utente).
 */
export function SecretariatsPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isSegreteria = user?.role === 'SEGRETERIA';

  const [items, setItems] = useState<SecretariatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSegreteria) {
      setLoading(false);
      return;
    }
    fetchSecretariats()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'Errore'))
      .finally(() => setLoading(false));
  }, [isSegreteria]);

  async function handleDelete(secretariat: SecretariatListItem) {
    if (
      !window.confirm(
        `Eliminare il tuo account "${secretariat.name}"? L'operazione è irreversibile.`
      )
    )
      return;
    try {
      await deleteSecretariat(secretariat.id);
      // Eliminato il proprio account: la sessione non è più valida, vai al logout.
      navigate('/logout');
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

  // La propria riga sempre in cima: così l'utente vede subito le proprie info
  // e le azioni self (modifica/elimina). Le altre mantengono l'ordine originale.
  const sortedItems = [...items].sort((a, b) => {
    const aSelf = a.email === user?.email ? 0 : 1;
    const bSelf = b.email === user?.email ? 0 : 1;
    return aSelf - bSelf;
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Segretari</h1>
        <button
          type="button"
          onClick={() => navigate('/secretariats/new')}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          + Nuovo segretario
        </button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg bg-white p-6 text-slate-500 shadow">
          Nessun segretario da mostrare.
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
              {sortedItems.map((secretariat) => {
                const isSelf = secretariat.email === user?.email;
                return (
                  <tr key={secretariat.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-800">
                      {secretariat.name}
                      {isSelf && (
                        <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          Tu
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {secretariat.email}
                    </td>
                    <td className="px-4 py-3">
                      {isSelf ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => navigate('/me')}
                            className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            Modifica
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(secretariat)}
                            className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-red-700"
                          >
                            Elimina
                          </button>
                        </div>
                      ) : (
                        <p className="text-right text-xs text-slate-400">—</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SecretariatsPage;
