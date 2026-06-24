import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ExamEntity } from './exam.entity';
import { SubjectEntity } from '../subjects/subject.entity';
import { ExamSessionEntity } from '../exam-sessions/exam-sessions.entity';
import { TeacherEntity } from '../teachers/teacher.entity';
import { ExamType } from './dto/exam-type.enum';
import { RoomType } from './dto/room-type.enum';

/** Dati per creare un appello: le FK sono già entità risolte dal service. */
export type CreateExamPayload = {
    date: Date;
    startHour: number;
    endHour: number;
    roomType: RoomType;
    type: ExamType;
    subject: SubjectEntity;
    examSession: ExamSessionEntity;
    teacher: TeacherEntity;
};

/** Dati per l'aggiornamento: stessi campi del create, tutti opzionali. */
export type UpdateExamPayload = Partial<CreateExamPayload>;

/** Repository CRUD + query di supporto per gli appelli (solo accesso ai dati). */
@Injectable()
export class ExamsRepository {
    constructor(
        @InjectRepository(ExamEntity)
        private readonly repository: Repository<ExamEntity>,
    ) {}

    /** Tutti gli appelli, ordinati per id. */
    findAll(): Promise<ExamEntity[]> {
        return this.repository.find({ order: { examId: 'ASC' } });
    }

    /** Un appello per id; `null` se non esiste. */
    findById(examId: number): Promise<ExamEntity | null> {
        return this.repository.findOne({ where: { examId } });
    }

    /** Gli appelli di un docente, ordinati per data. */
    findByTeacher(teacherId: number): Promise<ExamEntity[]> {
        return this.repository.find({
            where: { teacher: { teacherId } },
            order: { date: 'ASC' },
        });
    }

    /**
     * Cerca un esame in conflitto con la regola "un solo appello per corso+anno+giorno":
     * stesso corso di laurea, stesso anno, stessa data. `excludeExamId` esclude l'esame
     * che si sta modificando (così non va in conflitto con sé stesso). `null` se libero.
     */
    findConflictingExam(
        degreeCourseId: number,
        year: number,
        date: Date,
        excludeExamId?: number,
    ): Promise<ExamEntity | null> {
        const where: Record<string, unknown> = {
            date,
            subject: {
                year,
                degreeCourse: { degreeCourseId },
            },
        };
        if (excludeExamId !== undefined) {
            where['examId'] = Not(excludeExamId);
        }
        return this.repository.findOne({ where });
    }

    // Tutti gli esami di un dato corso+anno (qualsiasi docente): serve al
    // calendario del docente sia per colorare di rosso i giorni "occupati" dalla
    // regola di conflitto (un solo esame per corso+anno+giorno), sia per mostrare
    // QUALI esami occupano un giorno (anche se non sono del docente corrente).
    findByCourseAndYear(degreeCourseId: number, year: number): Promise<ExamEntity[]> {
        return this.repository.find({
            where: { subject: { year, degreeCourse: { degreeCourseId } } },
            order: { date: 'ASC' },
        });
    }

    /**
     * Cerca un appello già esistente per la stessa materia nella stessa sessione
     * (regola: una materia ha un solo appello per sessione). `excludeExamId` esclude
     * l'esame in modifica. `null` se non esiste.
     */
    findBySubjectAndSession(
        subjectId: number,
        examSessionId: number,
        excludeExamId?: number,
    ): Promise<ExamEntity | null> {
        const where: Record<string, unknown> = {
            subject: { subjectId },
            examSession: { examSessionId },
        };
        if (excludeExamId !== undefined) {
            where['examId'] = Not(excludeExamId);
        }
        return this.repository.findOne({ where });
    }

    /** Quanti appelli usano una materia (per bloccarne l'eliminazione se >0). */
    countBySubject(subjectId: number): Promise<number> {
        return this.repository.count({ where: { subject: { subjectId } } });
    }

    /** Quanti appelli ha un docente (per bloccarne l'eliminazione se >0). */
    countByTeacher(teacherId: number): Promise<number> {
        return this.repository.count({ where: { teacher: { teacherId } } });
    }

    /** Quanti appelli ci sono in una sessione (per bloccarne l'eliminazione se >0). */
    countByExamSession(examSessionId: number): Promise<number> {
        return this.repository.count({ where: { examSession: { examSessionId } } });
    }

    /** Crea e salva un appello. */
    async createOne(payload: CreateExamPayload): Promise<ExamEntity> {
        const exam = this.repository.create(payload);
        return this.repository.save(exam);
    }

    /** Aggiorna i campi forniti; ritorna l'entità aggiornata o `null` se l'id non esiste. */
    async updateOne(examId: number, payload: UpdateExamPayload): Promise<ExamEntity | null> {
        const exam = await this.findById(examId);
        if (!exam) return null;
        if (payload.date !== undefined) exam.date = payload.date;
        if (payload.startHour !== undefined) exam.startHour = payload.startHour;
        if (payload.endHour !== undefined) exam.endHour = payload.endHour;
        if (payload.roomType !== undefined) exam.roomType = payload.roomType;
        if (payload.type !== undefined) exam.type = payload.type;
        if (payload.subject !== undefined) exam.subject = payload.subject;
        if (payload.examSession !== undefined) exam.examSession = payload.examSession;
        if (payload.teacher !== undefined) exam.teacher = payload.teacher;
        return this.repository.save(exam);
    }

    /** Elimina un appello per id; `true` se rimosso. */
    async deleteOne(examId: number): Promise<boolean> {
        const result = await this.repository.delete(examId);
        return (result.affected ?? 0) > 0;
    }
}
