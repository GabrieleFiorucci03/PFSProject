import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/login.page';
import { LogoutPage } from '../features/auth/logout.page';
import { ProtectedRoute } from '../features/auth/protected-route';
import { AppLayout } from '../features/layouts/app-layout';
import { DegreeCoursesPage } from '../features/degree-courses/degree-courses.page';
import { CreateDegreeCoursePage } from '../features/degree-courses/create-degree-course.page';
import { EditDegreeCoursePage } from '../features/degree-courses/edit-degree-course.page';
import { ExamSessionsPage } from '../features/exam-sessions/exam-sessions.page';
import { CreateExamSessionPage } from '../features/exam-sessions/create-exam-session.page';
import { EditExamSessionPage } from '../features/exam-sessions/edit-exam-session.page';
import { TeachersPage } from '../features/teachers/teachers.page';
import { CreateTeacherPage } from '../features/teachers/create-teacher.page';
import { EditTeacherPage } from '../features/teachers/edit-teacher.page';

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
        <Route path="/exam-sessions" element={<ExamSessionsPage />} />
        <Route path="/exam-sessions/new" element={<CreateExamSessionPage />} />
        <Route
          path="/exam-sessions/:id/edit"
          element={<EditExamSessionPage />}
        />
        <Route path="/subjects" element={<Placeholder title="Insegnamenti" />} />
        <Route path="/degree-courses" element={<DegreeCoursesPage />} />
        <Route path="/degree-courses/new" element={<CreateDegreeCoursePage />} />
        <Route
          path="/degree-courses/:id/edit"
          element={<EditDegreeCoursePage />}
        />
        <Route path="/teachers" element={<TeachersPage />} />
        <Route path="/teachers/new" element={<CreateTeacherPage />} />
        <Route path="/teachers/:id/edit" element={<EditTeacherPage />} />
      </Route>

      {/* Qualsiasi altra rotta torna alla home */}
      <Route path="*" element={<Navigate to="/exams" replace />} />
    </Routes>
  );
}

export default App;
