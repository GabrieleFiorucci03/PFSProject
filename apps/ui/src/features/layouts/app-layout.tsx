import { NavLink, Outlet } from 'react-router-dom';
import { getCurrentUser } from '../auth/auth.api';

/**
 * Layout condiviso delle pagine autenticate: navbar in alto + <Outlet/> per la
 * pagina figlia. Le rotte protette vengono annidate sotto questo componente
 * in app.tsx, così la navbar resta fissa mentre cambia solo il contenuto.
 */

// Voci di navigazione: una per entità di dominio. L'ordine segue il blueprint
// (Esami in testa = home), ma resta semplice da estendere/condizionare per ruolo.
const navItems = [
  { to: '/exams', label: 'Esami' },
  { to: '/exam-sessions', label: 'Sessioni' },
  { to: '/subjects', label: 'Insegnamenti' },
  { to: '/degree-courses', label: 'Corsi di laurea' },
  { to: '/teachers', label: 'Docenti' },
];

export function AppLayout() {
  const user = getCurrentUser();

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
            <span className="mr-2 font-bold">Appelli</span>
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3 text-sm">
            {user && (
              <span className="text-blue-100">
                {user.name}{' '}
                <span className="rounded bg-blue-900 px-2 py-0.5 text-xs">
                  {user.role}
                </span>
              </span>
            )}
            <NavLink
              to="/logout"
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium transition hover:bg-blue-500"
            >
              Logout
            </NavLink>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl p-4">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
