import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  DegreeCourseListItem,
  TeacherListItem,
} from '@server/exam-planning';
import { fetchDegreeCourses } from '../degree-courses/degree-courses.api';
import { fetchTeachers } from '../teachers/teachers.api';
import { createSubject } from './subjects.api';

/**
 * Form di creazione di un insegnamento (solo SEGRETERIA).
 * Le chiavi esterne (corso di laurea, docente) si scelgono da <select>
 * popolati dalle rispettive liste. L'anno è limitato alla durata del corso
 * selezionato (il backend valida comunque 1..yearsDuration).
 */
export function CreateSubjectPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [year, setYear] = useState(1);
  const [cfu, setCfu] = useState(6);
  const [degreeCourseId, setDegreeCourseId] = useState('');
  const [teacherId, setTeacherId] = useState('');

  const [courses, setCourses] = useState<DegreeCourseListItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Carica le opzioni dei due <select> al montaggio.
  useEffect(() => {
    fetchDegreeCourses()
      .then(setCourses)
      .catch(() => setCourses([]));
    fetchTeachers()
      .then(setTeachers)
      .catch(() => setTeachers([]));
  }, []);

  // Durata del corso scelto: limita il massimo dell'anno selezionabile.
  const selectedCourse = courses.find((c) => c.id === Number(degreeCourseId));
  const maxYear = selectedCourse?.yearsDuration ?? 6;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createSubject({
        name,
        year,
        cfu,
        degreeCourseId: Number(degreeCourseId),
        teacherId: Number(teacherId),
      });
      navigate('/subjects');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-2xl font-bold text-slate-800">
        Nuovo insegnamento
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
            placeholder="Es. Analisi Matematica"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="degreeCourseId"
            className="text-sm font-medium text-slate-700"
          >
            Corso di laurea
          </label>
          <select
            id="degreeCourseId"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={degreeCourseId}
            onChange={(e) => setDegreeCourseId(e.target.value)}
            required
          >
            <option value="" disabled>
              Seleziona un corso...
            </option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.department})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="teacherId"
            className="text-sm font-medium text-slate-700"
          >
            Docente titolare
          </label>
          <select
            id="teacherId"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            required
          >
            <option value="" disabled>
              Seleziona un docente...
            </option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="year" className="text-sm font-medium text-slate-700">
              Anno
            </label>
            <input
              id="year"
              type="number"
              min={1}
              max={maxYear}
              className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              required
            />
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="cfu" className="text-sm font-medium text-slate-700">
              CFU
            </label>
            <input
              id="cfu"
              type="number"
              min={1}
              max={30}
              className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={cfu}
              onChange={(e) => setCfu(Number(e.target.value))}
              required
            />
          </div>
        </div>

        {error && (
          <p className="whitespace-pre-line rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/subjects')}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Salvataggio...' : 'Crea insegnamento'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateSubjectPage;
