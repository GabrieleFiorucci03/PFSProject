import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Event } from 'react-big-calendar';
import type {
  ExamListItem,
  ExamSessionListItem,
  SubjectListItem,
} from '@server/exam-planning';
import { getCurrentUser } from '../auth/auth.api';
import { fetchExamSessions } from '../exam-sessions/exam-sessions.api';
import { fetchExams, fetchMyExams, fetchOccupiedDates } from '../exams/exams.api';
import { fetchMySubjects } from '../subjects/subjects.api';
import { PlanningCalendar, toIsoLocal } from '../calendar/planning-calendar';

/**
 * Dashboard / homepage (rotta '/'). Mostra qualche dato di sintesi + il
 * calendario condiviso, con contenuto e colori diversi per ruolo:
 * - DOCENTE: scegliendo una propria materia il calendario "evolve" mostrando i
 *   giorni dove può (verde) o non può (rosso) inserire un appello per quella
 *   materia. Click su un giorno verde → form di creazione precompilato.
 * - SEGRETERIA: vede finestre di pianificazione e sessioni colorate + gli esami
 *   come eventi; cliccando un giorno vede gli esami di quel giorno.
 * Le regole di dominio restano del backend: qui rispecchiamo solo lo stato.
 */

// Palette condivisa, uguale per entrambi i ruoli: viola = finestra di
// pianificazione, blu = sessione d'esame.
const COLORS = {
  available: '#bbf7d0', // verde-200 → puoi inserire
  blocked: '#fecaca', // rosso-200 → bloccato
  planning: '#ede9fe', // viola-100 → finestra di pianificazione
  session: '#dbeafe', // azzurro-100 → sessione d'esame
};

function todayIso(): string {
  return toIsoLocal(new Date());
}

/** Weekend dal giorno locale 'YYYY-MM-DD' (sabato/domenica). */
function isWeekend(iso: string): boolean {
  const day = new Date(`${iso}T00:00:00`).getDay();
  return day === 0 || day === 6;
}

/** Esami → eventi all-day per react-big-calendar. */
function toEvents(exams: ExamListItem[], titleOf: (e: ExamListItem) => string): Event[] {
  return exams.map((exam) => ({
    title: titleOf(exam),
    start: new Date(`${exam.date}T00:00:00`),
    end: new Date(`${exam.date}T00:00:00`),
    allDay: true,
  }));
}

/** Card statistica riusabile. */
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vista DOCENTE
// ---------------------------------------------------------------------------
function DocenteDashboard() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<SubjectListItem[]>([]);
  const [sessions, setSessions] = useState<ExamSessionListItem[]>([]);
  const [myExams, setMyExams] = useState<ExamListItem[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [occupiedDates, setOccupiedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchMySubjects(), fetchExamSessions(), fetchMyExams()])
      .then(([subs, sess, exams]) => {
        setSubjects(subs);
        setSessions(sess);
        setMyExams(exams);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Errore di caricamento')
      )
      .finally(() => setLoading(false));
  }, []);

  const selectedSubject =
    subjects.find((s) => String(s.id) === selectedSubjectId) ?? null;

  // Date occupate (corso+anno) della materia scelta: servono per i giorni rossi.
  useEffect(() => {
    if (!selectedSubject) {
      setOccupiedDates([]);
      return;
    }
    fetchOccupiedDates(selectedSubject.degreeCourse.id, selectedSubject.year)
      .then(setOccupiedDates)
      .catch(() => setOccupiedDates([]));
  }, [selectedSubject]);

  const today = todayIso();

  const sessionForDate = (iso: string) =>
    sessions.find((s) => iso >= s.startDate && iso <= s.endDate) ?? null;
  const inAnyPlanningWindow = (iso: string) =>
    sessions.some((s) => iso >= s.planningStartDate && iso <= s.planningEndDate);

  function dayColor(iso: string): string | undefined {
    // Vista generale: solo sessioni e finestre di pianificazione.
    if (!selectedSubject) {
      if (sessionForDate(iso)) return COLORS.session;
      if (inAnyPlanningWindow(iso)) return COLORS.planning;
      return undefined;
    }
    // Vista materia: verde/rosso solo nei giorni di sessione.
    const session = sessionForDate(iso);
    if (!session) {
      return inAnyPlanningWindow(iso) ? COLORS.planning : undefined;
    }
    const blocked =
      isWeekend(iso) ||
      today < session.planningStartDate || // pianificazione non ancora aperta
      today > session.planningEndDate || // pianificazione chiusa
      occupiedDates.includes(iso) || // conflitto corso+anno+giorno
      myExams.some(
        (e) => e.subject.id === selectedSubject.id && e.examSession.id === session.id
      ); // materia già pianificata nella sessione
    return blocked ? COLORS.blocked : COLORS.available;
  }

  function handleSelectDay(iso: string) {
    if (!selectedSubject || dayColor(iso) !== COLORS.available) return;
    const session = sessionForDate(iso);
    if (!session) return;
    const params = new URLSearchParams({
      subjectId: String(selectedSubject.id),
      date: iso,
      examSessionId: String(session.id),
    });
    navigate(`/exams/new?${params}`);
  }

  const events = toEvents(myExams, (e) => e.subject.name);

  const legend = selectedSubject
    ? [
        { color: COLORS.available, label: 'Puoi inserire un appello (clicca)' },
        { color: COLORS.blocked, label: 'Giorno di sessione non disponibile' },
        { color: COLORS.planning, label: 'Finestra di pianificazione' },
      ]
    : [
        { color: COLORS.session, label: "Sessione d'esame" },
        { color: COLORS.planning, label: 'Finestra di pianificazione' },
      ];

  const openPlanning = sessions.filter(
    (s) => today >= s.planningStartDate && today <= s.planningEndDate
  ).length;

  if (loading) return <p className="text-slate-500">Caricamento...</p>;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Sessioni aperte alla pianificazione" value={openPlanning} />
        <StatCard label="I tuoi appelli" value={myExams.length} />
        <StatCard label="Le tue materie" value={subjects.length} />
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow">
        <label htmlFor="subject" className="text-sm font-medium text-slate-700">
          Scegli un insegnamento per vedere i giorni in cui puoi inserire un appello
        </label>
        <select
          id="subject"
          className="max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
        >
          <option value="">— Vista generale (sessioni e pianificazione) —</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name} ({subject.degreeCourse.name}, {subject.year}° anno)
            </option>
          ))}
        </select>
        {selectedSubject && (
          <p className="text-xs text-slate-500">
            Clicca un giorno verde per creare un appello con data e sessione già
            impostate.
          </p>
        )}
      </div>

      <PlanningCalendar
        events={events}
        dayColor={dayColor}
        onSelectDay={handleSelectDay}
        legend={legend}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vista SEGRETERIA
// ---------------------------------------------------------------------------
function SegreteriaDashboard() {
  const [sessions, setSessions] = useState<ExamSessionListItem[]>([]);
  const [exams, setExams] = useState<ExamListItem[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchExamSessions(), fetchExams()])
      .then(([sess, ex]) => {
        setSessions(sess);
        setExams(ex);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Errore di caricamento')
      )
      .finally(() => setLoading(false));
  }, []);

  const today = todayIso();

  const sessionForDate = (iso: string) =>
    sessions.find((s) => iso >= s.startDate && iso <= s.endDate) ?? null;
  const inAnyPlanningWindow = (iso: string) =>
    sessions.some((s) => iso >= s.planningStartDate && iso <= s.planningEndDate);

  function dayColor(iso: string): string | undefined {
    if (sessionForDate(iso)) return COLORS.session;
    if (inAnyPlanningWindow(iso)) return COLORS.planning;
    return undefined;
  }

  const events = toEvents(exams, (e) => `${e.subject.name} — ${e.teacher.name}`);

  const legend = [
    { color: COLORS.planning, label: 'Finestra di pianificazione' },
    { color: COLORS.session, label: "Sessione d'esame" },
  ];

  const dayExams = selectedDay
    ? exams.filter((e) => e.date === selectedDay)
    : [];
  const inCorso = sessions.filter(
    (s) => today >= s.startDate && today <= s.endDate
  ).length;

  if (loading) return <p className="text-slate-500">Caricamento...</p>;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Sessioni totali" value={sessions.length} />
        <StatCard label="Sessioni in corso" value={inCorso} />
        <StatCard label="Esami totali" value={exams.length} />
      </div>

      <PlanningCalendar
        events={events}
        dayColor={dayColor}
        onSelectDay={setSelectedDay}
        legend={legend}
      />

      {selectedDay && (
        <div className="rounded-xl bg-white p-4 shadow">
          <h2 className="mb-2 font-semibold text-slate-800">
            Esami del {selectedDay}
          </h2>
          {dayExams.length === 0 ? (
            <p className="text-sm text-slate-500">Nessun esame in questo giorno.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {dayExams.map((exam) => (
                <li key={exam.id} className="flex justify-between py-2">
                  <span className="text-slate-800">{exam.subject.name}</span>
                  <span className="text-slate-500">
                    {exam.teacher.name} · {exam.startHour}:00–{exam.endHour}:00
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function DashboardPage() {
  const user = getCurrentUser();
  return user?.role === 'SEGRETERIA' ? (
    <SegreteriaDashboard />
  ) : (
    <DocenteDashboard />
  );
}

export default DashboardPage;
