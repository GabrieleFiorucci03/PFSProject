import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../auth/auth.api';

/**
 * Layout condiviso delle pagine autenticate: navbar in alto + <Outlet/> per la
 * pagina figlia. Le rotte protette vengono annidate sotto questo componente
 * in app.tsx, così la navbar resta fissa mentre cambia solo il contenuto.
 */

// Voci di navigazione: una per entità di dominio. La home (logo "Appelli") punta
// a "/" = dashboard col calendario, uguale per entrambi i ruoli.
// `segreteriaOnly: true` = voce visibile solo alla SEGRETERIA (es. "Docenti": il
// docente ha l'area personale, non la gestione).
const navItems = [
  { to: '/exams', label: 'Esami' },
  { to: '/exam-sessions', label: 'Sessioni' },
  { to: '/subjects', label: 'Insegnamenti' },
  { to: '/degree-courses', label: 'Corsi di laurea' },
  { to: '/teachers', label: 'Docenti', segreteriaOnly: true },
  { to: '/secretariats', label: 'Segretari', segreteriaOnly: true },
];

export function AppLayout() {
  const user = getCurrentUser();
  const navigate = useNavigate();

  // Le voci segreteriaOnly compaiono solo per la SEGRETERIA.
  const isSegreteria = user?.role === 'SEGRETERIA';
  const visibleNavItems = navItems.filter(
    (item) => !item.segreteriaOnly || isSegreteria
  );

  // Stato del popup di conferma logout: true = popup visibile.
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Classe del link: evidenzia la rotta attiva (NavLink passa isActive).
  function linkClass({ isActive }: { isActive: boolean }) {
    return [
      'rounded-md px-3 py-2 text-sm font-medium transition',
      isActive
        ? 'bg-blue-700 text-white'
        : 'text-blue-100 hover:bg-blue-600 hover:text-white',
    ].join(' ');
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-blue-800 text-white shadow">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <NavLink to="/" className="mr-2 font-bold transition hover:text-blue-200">
              Appelli
            </NavLink>
            {visibleNavItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3 text-sm">
            {user && (
              <NavLink
                to="/me"
                className="text-blue-100 transition hover:text-white"
                title="Area personale"
              >
                {user.name}{' '}
                <span className="rounded bg-blue-900 px-2 py-0.5 text-xs">
                  {user.role}
                </span>
              </NavLink>
            )}
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium transition hover:bg-blue-500"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl p-4">
        <Outlet />
      </main>

      {/* Popup di conferma logout: appare solo quando showLogoutConfirm è true.
          L'overlay scuro copre la pagina; cliccandolo si annulla (chiude). */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowLogoutConfirm(false)}
        >
          {/* stopPropagation: il click sulla card non deve chiudere il popup */}
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-slate-800">
              Conferma logout
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Vuoi davvero uscire dalla sessione?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => navigate('/logout')}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Esci
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppLayout;
