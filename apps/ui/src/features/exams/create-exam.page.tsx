import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type {
  ExamType,
  RoomType,
  SubjectListItem,
  ExamSessionListItem,
} from '@server/exam-planning';
import { fetchMySubjects } from '../subjects/subjects.api';
import { fetchExamSessions } from '../exam-sessions/exam-sessions.api';
import { createExam } from './exams.api';
import { EXAM_TYPE_LABELS, ROOM_TYPE_LABELS } from './exams.labels';

/** Data odierna come stringa ISO 'YYYY-MM-DD', per confronti lessicografici. */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Form di creazione di un esame (solo DOCENTE).
 * La materia si sceglie tra le PROPRIE (/subjects/mine), la sessione tra tutte.
 * Le regole di dominio (data dentro la sessione, finestra di pianificazione, no
 * weekend, no due esami stesso anno/corso nello stesso giorno) sono verificate
 * dal backend: qui ci limitiamo a mostrare l'eventuale messaggio d'errore.
 */
export function CreateExamPage() {
  const navigate = useNavigate();
  // Valori iniziali opzionali passati dal calendario (click su giorno verde):
  // /exams/new?subjectId=&date=&examSessionId=. Se assenti, form vuoto.
  const [searchParams] = useSearchParams();

  const [subjectId, setSubjectId] = useState(searchParams.get('subjectId') ?? '');
  const [examSessionId, setExamSessionId] = useState(
    searchParams.get('examSessionId') ?? ''
  );
  const [date, setDate] = useState(searchParams.get('date') ?? '');
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(11);
  const [type, setType] = useState<ExamType>('ORAL' as ExamType);
  const [roomType, setRoomType] = useState<RoomType>('STANDARD' as RoomType);

  const [subjects, setSubjects] = useState<SubjectListItem[]>([]);
  const [sessions, setSessions] = useState<ExamSessionListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Carica le opzioni dei due <select> al montaggio.
  useEffect(() => {
    fetchMySubjects()
      .then(setSubjects)
      .catch(() => setSubjects([]));
    // Mostra solo le sessioni in cui ha ancora senso pianificare: quelle la cui
    // finestra di pianificazione non è già chiusa (planningEndDate >= oggi).
    // Tiene sia le sessioni pianificabili ora sia quelle future (finestra non
    // ancora aperta) ed esclude le passate/chiuse, in linea col vincolo backend.
    fetchExamSessions()
      .then((all) => {
        const today = todayIso();
        setSessions(all.filter((s) => s.planningEndDate >= today));
      })
      .catch(() => setSessions([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createExam({
        subjectId: Number(subjectId),
        examSessionId: Number(examSessionId),
        date,
        startHour,
        endHour,
        type,
        roomType,
      });
      navigate('/exams');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-2xl font-bold text-slate-800">Nuovo esame</h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="subjectId" className="text-sm font-medium text-slate-700">
            Materia
          </label>
          <select
            id="subjectId"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            required
          >
            <option value="" disabled>
              Seleziona una materia...
            </option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} ({subject.degreeCourse.name})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="examSessionId"
            className="text-sm font-medium text-slate-700"
          >
            Sessione
          </label>
          <select
            id="examSessionId"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={examSessionId}
            onChange={(e) => setExamSessionId(e.target.value)}
            required
          >
            <option value="" disabled>
              Seleziona una sessione...
            </option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="date" className="text-sm font-medium text-slate-700">
            Data
          </label>
          <input
            id="date"
            type="date"
            className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <label
              htmlFor="startHour"
              className="text-sm font-medium text-slate-700"
            >
              Ora inizio
            </label>
            <input
              id="startHour"
              type="number"
              min={0}
              max={24}
              className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={startHour}
              onChange={(e) => setStartHour(Number(e.target.value))}
              required
            />
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <label
              htmlFor="endHour"
              className="text-sm font-medium text-slate-700"
            >
              Ora fine
            </label>
            <input
              id="endHour"
              type="number"
              min={0}
              max={24}
              className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={endHour}
              onChange={(e) => setEndHour(Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="type" className="text-sm font-medium text-slate-700">
              Tipo
            </label>
            <select
              id="type"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={type}
              onChange={(e) => setType(e.target.value as ExamType)}
            >
              {Object.entries(EXAM_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <label
              htmlFor="roomType"
              className="text-sm font-medium text-slate-700"
            >
              Aula
            </label>
            <select
              id="roomType"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value as RoomType)}
            >
              {Object.entries(ROOM_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
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
            onClick={() => navigate('/exams')}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Salvataggio...' : 'Crea esame'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateExamPage;
