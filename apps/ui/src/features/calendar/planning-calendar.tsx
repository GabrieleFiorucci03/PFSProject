import { useState, type CSSProperties } from 'react';
import { Calendar, dateFnsLocalizer, type Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { it } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

/**
 * Calendario mensile condiviso (dashboard SEGRETERIA e DOCENTE). È un componente
 * "stupido": riceve gli eventi da mostrare e una funzione `dayColor(iso)` che,
 * per ogni giorno, restituisce il colore di sfondo (la logica di dominio — verde
 * disponibile, rosso bloccato, sessione, pianificazione — vive nella dashboard).
 */

const locales = { it };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// Etichette italiane della toolbar/intestazioni.
const messages = {
  date: 'Data',
  time: 'Ora',
  event: 'Evento',
  allDay: 'Tutto il giorno',
  week: 'Settimana',
  work_week: 'Settimana lavorativa',
  day: 'Giorno',
  month: 'Mese',
  previous: 'Indietro',
  next: 'Avanti',
  today: 'Oggi',
  agenda: 'Agenda',
  noEventsInRange: 'Nessun evento in questo periodo.',
  showMore: (total: number) => `+ altri ${total}`,
};

/** Data locale come stringa ISO 'YYYY-MM-DD' (niente sfasamenti di fuso). */
export function toIsoLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export interface LegendItem {
  color: string;
  label: string;
  /** Se true, il campione è reso come bordo (anello) invece che pieno. */
  ring?: boolean;
}

interface PlanningCalendarProps {
  events: Event[];
  /** Colore di sfondo del giorno (undefined = nessuno). `iso` = 'YYYY-MM-DD'. */
  dayColor: (iso: string) => string | undefined;
  /**
   * Colore di un bordo (anello) interno al giorno, indipendente dallo sfondo.
   * Serve a mostrare un secondo stato sovrapposto — es. un giorno di sessione
   * (sfondo blu) che è anche finestra di pianificazione (bordo viola).
   */
  dayRing?: (iso: string) => string | undefined;
  onSelectDay?: (iso: string) => void;
  legend?: LegendItem[];
}

export function PlanningCalendar({
  events,
  dayColor,
  dayRing,
  onSelectDay,
  legend,
}: PlanningCalendarProps) {
  // Mese visualizzato come stato controllato: senza `date` + `onNavigate` i
  // pulsanti Indietro/Avanti/Oggi della toolbar non scorrerebbero i mesi.
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <div style={{ height: 600 }}>
        <Calendar
          localizer={localizer}
          culture="it"
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={['month']}
          view="month"
          date={date}
          onNavigate={setDate}
          onView={() => undefined}
          messages={messages}
          popup
          selectable
          onSelectSlot={(slot) => onSelectDay?.(toIsoLocal(slot.start as Date))}
          dayPropGetter={(date) => {
            const iso = toIsoLocal(date);
            const bg = dayColor(iso);
            const ring = dayRing?.(iso);
            const style: CSSProperties = {};
            if (bg) style.backgroundColor = bg;
            // Anello interno (non occupa spazio, non sposta il layout della cella).
            if (ring) style.boxShadow = `inset 0 0 0 2px ${ring}`;
            return Object.keys(style).length ? { style } : {};
          }}
        />
      </div>

      {legend && legend.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
          {legend.map((item) => (
            <span key={item.label} className="flex items-center gap-2">
              <span
                className="inline-block h-4 w-4 rounded border border-slate-300"
                style={
                  item.ring
                    ? { backgroundColor: 'white', boxShadow: `inset 0 0 0 2px ${item.color}` }
                    : { backgroundColor: item.color }
                }
              />
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlanningCalendar;
