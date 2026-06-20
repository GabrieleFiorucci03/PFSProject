import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/login.page';
import { LogoutPage } from '../features/auth/logout.page';
import { ProtectedRoute } from '../features/auth/protected-route';
import { AppLayout } from '../features/layouts/app-layout';

/**
 * Placeholder temporaneo per le rotte entità non ancora implementate.
 * Verrà sostituito dalle pagine vere nei blocchi I/J (una entità alla volta).
 */
function Placeholder({ title }: { title: string }) {
  return (
    <div className="rounded-xl bg-white p-8 shadow">
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      <p className="mt-2 text-slate-500">Pagina in costruzione.</p>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      {/* Rotte pubbliche */}
      <Route path="/" element={<Navigate to="/exams" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<LogoutPage />} />

      {/* Gruppo protetto: ProtectedRoute (richiede token) + AppLayout (navbar +
          Outlet). Le rotte figlie vengono iniettate nell'Outlet del layout. */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/exams" element={<Placeholder title="Esami" />} />
        <Route
          path="/exam-sessions"
          element={<Placeholder title="Sessioni d'esame" />}
        />
        <Route path="/subjects" element={<Placeholder title="Insegnamenti" />} />
        <Route
          path="/degree-courses"
          element={<Placeholder title="Corsi di laurea" />}
        />
        <Route path="/teachers" element={<Placeholder title="Docenti" />} />
      </Route>

      {/* Qualsiasi altra rotta torna alla home */}
      <Route path="*" element={<Navigate to="/exams" replace />} />
    </Routes>
  );
}

export default App;
