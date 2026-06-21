/**
 * Seed dei dati di test (passato / corrente / futuro).
 *
 * Perché serve: via API gli esami li crea solo il DOCENTE e solo se OGGI è dentro
 * la finestra di pianificazione della sessione; quindi non si possono inserire
 * esami di sessioni passate (o molto future) dall'interfaccia. Questo script apre
 * un application context di Nest e scrive DIRETTAMENTE tramite il DataSource di
 * TypeORM (CRUD puro), bypassando le regole di dominio che vivono nei service.
 *
 * È idempotente (find-or-create per nome/email): può essere rieseguito senza
 * creare duplicati. Riusa gli account esistenti (es. gabriele, devis) se presenti.
 *
 * Esecuzione: `npm run seed` (richiede il Postgres avviato e le env del .env).
 */
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from './app/app.module';
import { UserEntity } from '@server/users';
import { UserRole } from '@server/security';
import {
  DegreeCourseEntity,
  SubjectEntity,
  ExamSessionEntity,
  ExamEntity,
  TeacherEntity,
  SecretariatEntity,
  ExamType,
  RoomType,
} from '@server/exam-planning';

// --- helper sulle date -----------------------------------------------------

/** Mezzanotte locale di oggi (così le colonne 'date' non slittano per fuso). */
function today(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

/** Una nuova data spostata di `days` giorni rispetto a `base`. */
function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

/** Sposta sabato/domenica al lunedì successivo (gli appelli sono feriali). */
function toWeekday(d: Date): Date {
  const day = d.getDay();
  if (day === 6) return addDays(d, 2);
  if (day === 0) return addDays(d, 1);
  return d;
}

/** 'YYYY-MM-DD' da Date (o stringa già ISO). */
function toIso(d: Date | string): string {
  if (typeof d === 'string') return d.slice(0, 10);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  const ds = app.get(DataSource);

  const userRepo = ds.getRepository(UserEntity);
  const teacherRepo = ds.getRepository(TeacherEntity);
  const secretariatRepo = ds.getRepository(SecretariatEntity);
  const courseRepo = ds.getRepository(DegreeCourseEntity);
  const subjectRepo = ds.getRepository(SubjectEntity);
  const sessionRepo = ds.getRepository(ExamSessionEntity);
  const examRepo = ds.getRepository(ExamEntity);

  // --- find-or-create -------------------------------------------------------

  async function ensureUser(name: string, email: string, role: UserRole) {
    let user = await userRepo.findOne({ where: { email } });
    if (!user) {
      user = await userRepo.save(
        userRepo.create({
          name,
          email,
          passwordHash: await bcrypt.hash('Password1!', 10),
          role,
        })
      );
      console.log(`  + utente ${email} (${role})`);
    }
    return user;
  }

  async function ensureTeacher(name: string, email: string) {
    const user = await ensureUser(name, email, UserRole.DOCENTE);
    let teacher = await teacherRepo.findOne({ where: { user: { id: user.id } } });
    if (!teacher) {
      teacher = await teacherRepo.save(teacherRepo.create({ user }));
      console.log(`  + docente ${name}`);
    }
    return teacher;
  }

  async function ensureSecretariat(name: string, email: string) {
    const user = await ensureUser(name, email, UserRole.SEGRETERIA);
    let sec = await secretariatRepo.findOne({ where: { user: { id: user.id } } });
    if (!sec) {
      sec = await secretariatRepo.save(secretariatRepo.create({ user }));
      console.log(`  + segretario ${name}`);
    }
    return sec;
  }

  async function ensureCourse(name: string, yearsDuration: number, department: string) {
    let course = await courseRepo.findOne({ where: { name } });
    if (!course) {
      course = await courseRepo.save(
        courseRepo.create({ name, yearsDuration, department })
      );
      console.log(`  + corso ${name}`);
    }
    return course;
  }

  async function ensureSubject(
    name: string,
    year: number,
    cfu: number,
    degreeCourse: DegreeCourseEntity,
    teacher: TeacherEntity
  ) {
    let subject = await subjectRepo.findOne({
      where: { name, degreeCourse: { degreeCourseId: degreeCourse.degreeCourseId } },
    });
    if (!subject) {
      subject = await subjectRepo.save(
        subjectRepo.create({ name, year, cfu, degreeCourse, teacher })
      );
      console.log(`  + insegnamento ${name}`);
    }
    return subject;
  }

  async function ensureSession(
    name: string,
    startDate: Date,
    endDate: Date,
    planningStartDate: Date,
    planningEndDate: Date
  ) {
    let session = await sessionRepo.findOne({ where: { name } });
    if (!session) {
      session = await sessionRepo.save(
        sessionRepo.create({
          name,
          startDate,
          endDate,
          planningStartDate,
          planningEndDate,
        })
      );
      console.log(`  + sessione ${name}`);
    }
    return session;
  }

  // Carica una volta gli esami esistenti (con subject eager) per l'idempotenza.
  const existingExams = await examRepo.find();
  async function ensureExam(
    date: Date,
    startHour: number,
    endHour: number,
    type: ExamType,
    roomType: RoomType,
    subject: SubjectEntity,
    examSession: ExamSessionEntity,
    teacher: TeacherEntity
  ) {
    const iso = toIso(date);
    const dup = existingExams.some(
      (e) => toIso(e.date) === iso && e.subject.subjectId === subject.subjectId
    );
    if (dup) return;
    const saved = await examRepo.save(
      examRepo.create({
        date,
        startHour,
        endHour,
        type,
        roomType,
        subject,
        examSession,
        teacher,
      })
    );
    existingExams.push(saved);
    console.log(`  + esame ${subject.name} il ${iso}`);
  }

  // --- dati ------------------------------------------------------------------

  console.log('Seed in corso...');

  // Account (riusa quelli esistenti se già presenti).
  await ensureSecretariat('Gabriele Fiorucci', 'gabriele.fiorucci@unibs.it');
  const devis = await ensureTeacher('Devis Bianchini', 'devis.bianchini@unibs.it');
  const mario = await ensureTeacher('Mario Rossi', 'mario.rossi@unibs.it');

  // Corsi di laurea.
  const informatica = await ensureCourse('Ingegneria Informatica', 3, 'Dipartimento di Ingegneria dell\'Informazione');
  const civile = await ensureCourse('Ingegneria Civile', 3, 'Dipartimento di Ingegneria Civile');

  // Insegnamenti.
  const web = await ensureSubject('Programmazione Web', 3, 6, informatica, devis);
  const basiDati = await ensureSubject('Basi di Dati', 2, 9, informatica, devis);
  const costruzioni = await ensureSubject('Scienza delle Costruzioni', 2, 9, civile, mario);

  // Sessioni: passata, corrente (finestra pianificazione aperta ORA), futura.
  const base = today();
  const passata = await ensureSession(
    'Sessione Invernale 2025',
    addDays(base, -180),
    addDays(base, -160),
    addDays(base, -220),
    addDays(base, -185)
  );
  const corrente = await ensureSession(
    'Sessione Estiva 2026',
    addDays(base, 15),
    addDays(base, 45),
    addDays(base, -5),
    addDays(base, 10)
  );
  const futura = await ensureSession(
    'Sessione Autunnale 2026',
    addDays(base, 90),
    addDays(base, 110),
    addDays(base, 60),
    addDays(base, 80)
  );

  // Esami in ciascuna sessione (date feriali, dentro l'intervallo sessione).
  // Sessione passata
  await ensureExam(toWeekday(addDays(base, -175)), 9, 11, ExamType.WRITTEN, RoomType.STANDARD, web, passata, devis);
  await ensureExam(toWeekday(addDays(base, -170)), 14, 16, ExamType.ORAL, RoomType.STANDARD, costruzioni, passata, mario);
  // Sessione corrente
  await ensureExam(toWeekday(addDays(base, 20)), 9, 11, ExamType.WRITTEN, RoomType.COMPUTER_LAB, web, corrente, devis);
  await ensureExam(toWeekday(addDays(base, 23)), 10, 12, ExamType.ORAL, RoomType.STANDARD, basiDati, corrente, devis);
  // Sessione futura
  await ensureExam(toWeekday(addDays(base, 95)), 9, 11, ExamType.WRITTEN, RoomType.STANDARD, costruzioni, futura, mario);
  await ensureExam(toWeekday(addDays(base, 98)), 15, 17, ExamType.ORAL, RoomType.COMPUTER_LAB, web, futura, devis);

  console.log('Seed completato.');
  await app.close();
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed fallito:', err);
    process.exit(1);
  });
