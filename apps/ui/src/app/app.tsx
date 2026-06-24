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
import { SubjectsPage } from '../features/subjects/subjects.page';
import { CreateSubjectPage } from '../features/subjects/create-subject.page';
import { EditSubjectPage } from '../features/subjects/edit-subject.page';
import { ExamsPage } from '../features/exams/exams.page';
import { CreateExamPage } from '../features/exams/create-exam.page';
import { EditExamPage } from '../features/exams/edit-exam.page';
import { SecretariatsPage } from '../features/secretariats/secretariats.page';
import { CreateSecretariatPage } from '../features/secretariats/create-secretariat.page';
import { ProfilePage } from '../features/profile/profile.page';
import { DashboardPage } from '../features/dashboard/dashboard.page';

export function App() {
  return (
    <Routes>
      {/* Rotte pubbliche */}
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
        {/* Home = dashboard con calendario */}
        <Route index element={<DashboardPage />} />
        <Route path="/exams" element={<ExamsPage />} />
        <Route path="/exams/new" element={<CreateExamPage />} />
        <Route path="/exams/:id/edit" element={<EditExamPage />} />
        <Route path="/exam-sessions" element={<ExamSessionsPage />} />
        <Route path="/exam-sessions/new" element={<CreateExamSessionPage />} />
        <Route
          path="/exam-sessions/:id/edit"
          element={<EditExamSessionPage />}
        />
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/subjects/new" element={<CreateSubjectPage />} />
        <Route path="/subjects/:id/edit" element={<EditSubjectPage />} />
        <Route path="/degree-courses" element={<DegreeCoursesPage />} />
        <Route path="/degree-courses/new" element={<CreateDegreeCoursePage />} />
        <Route
          path="/degree-courses/:id/edit"
          element={<EditDegreeCoursePage />}
        />
        <Route path="/teachers" element={<TeachersPage />} />
        <Route path="/teachers/new" element={<CreateTeacherPage />} />
        <Route path="/teachers/:id/edit" element={<EditTeacherPage />} />
        <Route path="/secretariats" element={<SecretariatsPage />} />
        <Route path="/secretariats/new" element={<CreateSecretariatPage />} />
        {/* Area personale (entrambi i ruoli): raggiungibile dal nome in navbar
            e dal "Modifica" sulla propria riga in /secretariats. */}
        <Route path="/me" element={<ProfilePage />} />
      </Route>

      {/* Qualsiasi altra rotta torna alla home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
